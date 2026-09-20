'use strict';

// VI P1 Measurement Readiness -- Runtime Foundation B1 Raw Source Rebuild
// CORE Runtime.
//
// Implements the bounded raw-source query contract:
//
//   queryRawEvidenceForMetricRebuild(pool, input)
//
// Canonical authority: API_CONTRACT.md §13.10.11.1,
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3.
//
// This is an internal CORE operation, not a public HTTP API and not a ninth
// Engine. It performs exactly one PostgreSQL transaction
// (REPEATABLE READ, READ ONLY), validates the exact seven-key `filters`
// object and the FORMULA reference-only boundary, applies physical filter
// authority/root-selection/closure exactly as specified, and returns the
// exact RAW_SOURCE bundle or the exact `{ status: "empty", data: null }`
// empty payload. It does not interpret FORMULA semantics, compute a metric
// reducer, or perform any write/mutation.

const {
  ContractViolationError,
  NotFoundError,
  OutOfRangeValueError,
  TARGET_TIMEPOINTS,
  assertAllowedKeys,
  assertExactDefinitionKeys,
  assertExactKeys,
  hasOwn,
  isPlainObject,
  requireField,
  validateBoundedVersion,
  validatePositiveSafeInteger,
  validatePositiveVersion,
  validateStableId,
  validateUuid,
} = require('./evidenceValidation');

const TOP_LEVEL_KEYS = ['formulaId', 'formulaVersion', 'analysisCutoff', 'filters'];

const FILTER_KEYS = [
  'enrollmentIds',
  'assignmentIds',
  'attemptIds',
  'conditionReferences',
  'targetTimepoints',
  'nodeIds',
  'itemFamilyReferences',
];

// ---------------------------------------------------------------------------
// Pure (no-DB) input validation/normalization.
// ---------------------------------------------------------------------------

// Exact canonical lexical form only: YYYY-MM-DDTHH:mm:ss.sssZ. This is
// stricter than ISO 8601 in general -- no non-Z offset, no missing
// milliseconds, no missing 'Z' -- because analysisCutoff is a single
// unambiguous UTC instant used as a physical cutoff boundary, not a
// general-purpose timestamp input.
const ANALYSIS_CUTOFF_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validateAnalysisCutoff(value) {
  if (value === null || typeof value !== 'string') {
    throw new ContractViolationError('analysisCutoff must be a canonical UTC timestamp string');
  }
  if (!ANALYSIS_CUTOFF_PATTERN.test(value)) {
    throw new OutOfRangeValueError(
      `analysisCutoff is not in canonical YYYY-MM-DDTHH:mm:ss.sssZ form: ${value}`
    );
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new OutOfRangeValueError(`analysisCutoff is not a valid/normalizable timestamp: ${value}`);
  }
  if (parsed.toISOString() !== value) {
    // Catches calendar-impossible dates (e.g. 2023-02-29) that Date rolls
    // over into a different, still-valid instant rather than rejecting.
    throw new OutOfRangeValueError(`analysisCutoff is not a normalized canonical timestamp: ${value}`);
  }
  return parsed.toISOString();
}

function validateUuidArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new ContractViolationError(`${fieldName}[${index}] must be a UUID string`);
    }
    return validateUuid(item, `${fieldName}[${index}]`);
  });
  const seen = new Set();
  for (const id of normalized) {
    if (seen.has(id)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(id);
  }
  return normalized.slice().sort();
}

function validateStableIdArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new ContractViolationError(`${fieldName}[${index}] must be a string`);
    }
    return validateStableId(item, `${fieldName}[${index}]`);
  });
  const seen = new Set();
  for (const id of normalized) {
    if (seen.has(id)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(id);
  }
  return normalized.slice().sort();
}

function validateTargetTimepointArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((item, index) => {
    if (typeof item !== 'string' || !TARGET_TIMEPOINTS.includes(item)) {
      throw new ContractViolationError(
        `${fieldName}[${index}] must be one of: ${TARGET_TIMEPOINTS.join(', ')}`
      );
    }
    return item;
  });
  const seen = new Set();
  for (const item of normalized) {
    if (seen.has(item)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(item);
  }
  return normalized.slice().sort();
}

function validateConditionReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((element, index) => {
    assertExactKeys(element, ['conditionId', 'conditionVersion'], `${fieldName}[${index}]`);
    return {
      conditionId: validateStableId(element.conditionId, `${fieldName}[${index}].conditionId`),
      conditionVersion: validatePositiveVersion(
        element.conditionVersion,
        `${fieldName}[${index}].conditionVersion`
      ),
    };
  });
  const seen = new Set();
  for (const ref of normalized) {
    const key = `${ref.conditionId}@${ref.conditionVersion}`;
    if (seen.has(key)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(key);
  }
  return normalized.slice().sort((a, b) => {
    if (a.conditionId !== b.conditionId) return a.conditionId < b.conditionId ? -1 : 1;
    return a.conditionVersion - b.conditionVersion;
  });
}

function validateItemFamilyReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((element, index) => {
    assertExactKeys(element, ['itemFamilyId', 'itemFamilyVersion'], `${fieldName}[${index}]`);
    return {
      itemFamilyId: validateStableId(element.itemFamilyId, `${fieldName}[${index}].itemFamilyId`),
      itemFamilyVersion: validatePositiveVersion(
        element.itemFamilyVersion,
        `${fieldName}[${index}].itemFamilyVersion`
      ),
    };
  });
  const seen = new Set();
  for (const ref of normalized) {
    const key = `${ref.itemFamilyId}@${ref.itemFamilyVersion}`;
    if (seen.has(key)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(key);
  }
  return normalized.slice().sort((a, b) => {
    if (a.itemFamilyId !== b.itemFamilyId) return a.itemFamilyId < b.itemFamilyId ? -1 : 1;
    return a.itemFamilyVersion - b.itemFamilyVersion;
  });
}

function validateFilters(rawFilters) {
  // `filters` itself: MISSING_REQUIRED_FIELD if omitted/undefined,
  // CONTRACT_VIOLATION if not a plain object or if it carries an
  // unrecognized key (assertAllowedKeys covers both via validateInputObject).
  assertAllowedKeys(rawFilters, FILTER_KEYS, 'filters');
  for (const key of FILTER_KEYS) {
    // Each of the seven keys is independently required: omitted/explicit
    // undefined -> MISSING_REQUIRED_FIELD.
    requireField(rawFilters, key);
  }

  return {
    enrollmentIds: validateUuidArray(rawFilters.enrollmentIds, 'filters.enrollmentIds'),
    assignmentIds: validateUuidArray(rawFilters.assignmentIds, 'filters.assignmentIds'),
    attemptIds: validateUuidArray(rawFilters.attemptIds, 'filters.attemptIds'),
    conditionReferences: validateConditionReferenceArray(
      rawFilters.conditionReferences,
      'filters.conditionReferences'
    ),
    targetTimepoints: validateTargetTimepointArray(
      rawFilters.targetTimepoints,
      'filters.targetTimepoints'
    ),
    nodeIds: validateStableIdArray(rawFilters.nodeIds, 'filters.nodeIds'),
    itemFamilyReferences: validateItemFamilyReferenceArray(
      rawFilters.itemFamilyReferences,
      'filters.itemFamilyReferences'
    ),
  };
}

function validateQueryInput(input) {
  assertAllowedKeys(input, TOP_LEVEL_KEYS, 'input');
  const formulaId = validateStableId(requireField(input, 'formulaId'), 'formulaId');
  const formulaVersion = validatePositiveVersion(
    requireField(input, 'formulaVersion'),
    'formulaVersion'
  );
  const analysisCutoff = validateAnalysisCutoff(requireField(input, 'analysisCutoff'));
  // requireField already rejects omitted/explicit-undefined `filters` with
  // MISSING_REQUIRED_FIELD; validateFilters (via assertAllowedKeys) rejects a
  // non-plain-object `filters` (including explicit null) with
  // CONTRACT_VIOLATION.
  const filters = validateFilters(requireField(input, 'filters'));
  return { formulaId, formulaVersion, analysisCutoff, filters };
}

// ---------------------------------------------------------------------------
// DB-backed existence validation (runs inside the bounded transaction).
// ---------------------------------------------------------------------------

async function assertFormulaExists(client, formulaId, formulaVersion) {
  const { rows } = await client.query(
    `SELECT 1 FROM evidence_reference_versions
      WHERE reference_kind = 'FORMULA' AND reference_id = $1 AND version = $2`,
    [formulaId, formulaVersion]
  );
  if (rows.length === 0) {
    throw new NotFoundError(`Unknown FORMULA reference: ${formulaId}@${formulaVersion}`);
  }
}

async function assertIdsExist(client, table, column, ids) {
  if (ids.length === 0) return;
  const { rows } = await client.query(
    `SELECT ${column} AS id FROM ${table} WHERE ${column} = ANY($1::uuid[])`,
    [ids]
  );
  const existing = new Set(rows.map((row) => row.id));
  for (const id of ids) {
    if (!existing.has(id)) {
      throw new NotFoundError(`Unknown ${column}: ${id}`);
    }
  }
}

async function assertConditionReferencesExist(client, conditionReferences) {
  if (conditionReferences.length === 0) return;
  const ids = conditionReferences.map((ref) => ref.conditionId);
  const versions = conditionReferences.map((ref) => ref.conditionVersion);
  const { rows } = await client.query(
    `SELECT condition_id, version FROM evidence_condition_versions
      WHERE (condition_id, version) IN (SELECT * FROM unnest($1::text[], $2::int[]))`,
    [ids, versions]
  );
  const existing = new Set(rows.map((row) => `${row.condition_id}@${row.version}`));
  for (const ref of conditionReferences) {
    const key = `${ref.conditionId}@${ref.conditionVersion}`;
    if (!existing.has(key)) {
      throw new NotFoundError(`Unknown condition reference: ${key}`);
    }
  }
}

async function assertNodeIdsExist(client, nodeIds) {
  if (nodeIds.length === 0) return;
  const { rows } = await client.query(
    `SELECT node_id FROM grammar_nodes WHERE node_id = ANY($1::text[])`,
    [nodeIds]
  );
  const existing = new Set(rows.map((row) => row.node_id));
  for (const id of nodeIds) {
    if (!existing.has(id)) {
      throw new NotFoundError(`Unknown nodeId: ${id}`);
    }
  }
}

async function assertItemFamilyReferencesExist(client, itemFamilyReferences) {
  if (itemFamilyReferences.length === 0) return;
  const ids = itemFamilyReferences.map((ref) => ref.itemFamilyId);
  const versions = itemFamilyReferences.map((ref) => ref.itemFamilyVersion);
  const { rows } = await client.query(
    `SELECT reference_id, version FROM evidence_reference_versions
      WHERE reference_kind = 'ITEM_FAMILY'
        AND (reference_id, version) IN (SELECT * FROM unnest($1::text[], $2::int[]))`,
    [ids, versions]
  );
  const existing = new Set(rows.map((row) => `${row.reference_id}@${row.version}`));
  for (const ref of itemFamilyReferences) {
    const key = `${ref.itemFamilyId}@${ref.itemFamilyVersion}`;
    if (!existing.has(key)) {
      throw new NotFoundError(`Unknown item family reference: ${key}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Root selection / closure.
// ---------------------------------------------------------------------------

// Assignment branch qualification -- a single formula covering all three
// primary reference dimensions (enrollment/assignment/attempt) at once:
// same nonempty array is OR, nonempty different dimensions are AND across
// physical ancestry (API_CONTRACT.md §13.10.11.1 "Root selection"). This one
// query correctly implements the enrollment-root, assignment-root and
// attempt-root cases uniformly, because whichever primary array is supplied
// narrows the candidate assignment set via ownership, and an empty array
// contributes no restriction (vacuous OR branch).
async function selectQualifyingAssignments(client, filters, analysisCutoff) {
  const { rows } = await client.query(
    `SELECT a.*
       FROM evidence_assignments a
      WHERE (cardinality($1::uuid[]) = 0 OR a.enrollment_id = ANY($1::uuid[]))
        AND (cardinality($2::uuid[]) = 0 OR a.assignment_id = ANY($2::uuid[]))
        AND (
          cardinality($3::uuid[]) = 0
          OR EXISTS (
            SELECT 1 FROM evidence_attempts att
             WHERE att.assignment_id = a.assignment_id
               AND att.attempt_id = ANY($3::uuid[])
               AND att.started_at <= $10::timestamptz
          )
        )
        AND (
          cardinality($4::text[]) = 0
          OR EXISTS (
            SELECT 1
              FROM evidence_enrollments e, unnest($4::text[], $5::int[]) AS cond(condition_id, condition_version)
             WHERE e.enrollment_id = a.enrollment_id
               AND e.condition_id = cond.condition_id
               AND e.condition_version = cond.condition_version
          )
        )
        AND (cardinality($6::text[]) = 0 OR a.target_timepoint = ANY($6::text[]))
        AND (
          cardinality($7::text[]) = 0
          OR EXISTS (
            SELECT 1
              FROM evidence_assignment_snapshot_nodes n
              JOIN evidence_assignment_snapshots s
                ON s.assignment_id = n.assignment_id
             WHERE n.assignment_id = a.assignment_id
               AND n.node_id = ANY($7::text[])
               AND s.created_at <= $10::timestamptz
          )
        )
        AND (
          cardinality($8::text[]) = 0
          OR EXISTS (
            SELECT 1
              FROM evidence_assignment_snapshots s,
                   unnest($8::text[], $9::int[]) AS fam(item_family_id, item_family_version)
             WHERE s.assignment_id = a.assignment_id
               AND s.item_family_id = fam.item_family_id
               AND s.item_family_version = fam.item_family_version
               AND s.created_at <= $10::timestamptz
          )
        )
        AND a.created_at <= $10::timestamptz
      ORDER BY a.assignment_id ASC`,
    [
      filters.enrollmentIds,
      filters.assignmentIds,
      filters.attemptIds,
      filters.conditionReferences.map((ref) => ref.conditionId),
      filters.conditionReferences.map((ref) => ref.conditionVersion),
      filters.targetTimepoints,
      filters.nodeIds,
      filters.itemFamilyReferences.map((ref) => ref.itemFamilyId),
      filters.itemFamilyReferences.map((ref) => ref.itemFamilyVersion),
      analysisCutoff,
    ]
  );
  return rows;
}

// Assignment-less enrollment closure: an enrollment named directly in
// `enrollmentIds` that literally has zero assignments may still contribute
// its own raw fact, but only when every assignment-level secondary filter is
// empty and the enrollment itself existed at/before the cutoff.
async function selectAssignmentlessBonusEnrollmentIds(client, enrollmentIds, analysisCutoff) {
  if (enrollmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT e.enrollment_id
       FROM evidence_enrollments e
      WHERE e.enrollment_id = ANY($1::uuid[])
        AND e.created_at <= $2::timestamptz
        AND NOT EXISTS (
          SELECT 1 FROM evidence_assignments a
           WHERE a.enrollment_id = e.enrollment_id
             AND a.created_at <= $2::timestamptz
        )`,
    [enrollmentIds, analysisCutoff]
  );
  return rows.map((row) => row.enrollment_id);
}

async function fetchEnrollments(client, enrollmentIds) {
  if (enrollmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_enrollments
      WHERE enrollment_id = ANY($1::uuid[])
      ORDER BY enrollment_id ASC`,
    [enrollmentIds]
  );
  return rows;
}

async function fetchSnapshots(client, assignmentIds, analysisCutoff) {
  if (assignmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_assignment_snapshots
      WHERE assignment_id = ANY($1::uuid[])
        AND created_at <= $2::timestamptz
      ORDER BY assignment_id ASC`,
    [assignmentIds, analysisCutoff]
  );
  return rows;
}

// A snapshot-node row carries no own timestamp; its authoritative cutoff
// time is the owning snapshot's created_at (evidence_assignment_snapshots).
// `SELECT n.*` preserves the physical node-column projection unchanged --
// the join is used only to source the cutoff authority, not to widen the
// projected shape.
async function fetchSnapshotNodes(client, assignmentIds, analysisCutoff) {
  if (assignmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT n.*
       FROM evidence_assignment_snapshot_nodes n
       JOIN evidence_assignment_snapshots s
         ON s.assignment_id = n.assignment_id
      WHERE n.assignment_id = ANY($1::uuid[])
        AND s.created_at <= $2::timestamptz
      ORDER BY n.assignment_id ASC, n.ordinal ASC`,
    [assignmentIds, analysisCutoff]
  );
  return rows;
}

async function fetchExposures(client, assignmentIds, analysisCutoff) {
  if (assignmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_assignment_item_exposures
      WHERE assignment_id = ANY($1::uuid[])
        AND exposed_at <= $2::timestamptz
      ORDER BY exposure_ordinal ASC, exposure_id ASC`,
    [assignmentIds, analysisCutoff]
  );
  return rows;
}

async function fetchAttempts(client, { attemptIds, assignmentIds, analysisCutoff }) {
  if (assignmentIds.length === 0) return [];
  if (attemptIds.length > 0) {
    // attemptIds nonempty: only the supplied attempts, and only when they
    // belong to a qualifying assignment -- no sibling-attempt expansion.
    const { rows } = await client.query(
      `SELECT * FROM evidence_attempts
        WHERE attempt_id = ANY($1::uuid[])
          AND assignment_id = ANY($2::uuid[])
          AND started_at <= $3::timestamptz
        ORDER BY assignment_id ASC, attempt_series_id ASC, retry_ordinal ASC, attempt_id ASC`,
      [attemptIds, assignmentIds, analysisCutoff]
    );
    return rows;
  }
  // attemptIds empty: every cutoff-eligible attempt of each qualifying
  // assignment.
  const { rows } = await client.query(
    `SELECT * FROM evidence_attempts
      WHERE assignment_id = ANY($1::uuid[])
        AND started_at <= $2::timestamptz
      ORDER BY assignment_id ASC, attempt_series_id ASC, retry_ordinal ASC, attempt_id ASC`,
    [assignmentIds, analysisCutoff]
  );
  return rows;
}

async function fetchFinalizations(client, attemptIds, analysisCutoff) {
  if (attemptIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_attempt_finalizations
      WHERE attempt_id = ANY($1::uuid[])
        AND finalized_at <= $2::timestamptz
      ORDER BY finalized_at ASC, attempt_id ASC`,
    [attemptIds, analysisCutoff]
  );
  return rows;
}

async function fetchEvaluations(client, finalizedAttemptIds) {
  if (finalizedAttemptIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_target_node_evaluations
      WHERE attempt_id = ANY($1::uuid[])
      ORDER BY attempt_id ASC, node_id ASC`,
    [finalizedAttemptIds]
  );
  return rows;
}

async function fetchCorrections(client, finalizedAttemptIds) {
  if (finalizedAttemptIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT * FROM evidence_correction_aggregates
      WHERE attempt_id = ANY($1::uuid[])
      ORDER BY attempt_id ASC, initiator ASC, feedback_phase ASC, correction_outcome ASC`,
    [finalizedAttemptIds]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Raw row projection.
// ---------------------------------------------------------------------------

// node-postgres already returns: UUID/TEXT as string, INTEGER as JS number,
// BIGINT as an exact base-10 decimal string (no default int8 parser is
// installed anywhere in this repository -- verified against migrations
// 012/013's BIGINT columns), BOOLEAN as boolean, JSONB as a parsed
// JSON-compatible value, and SQL NULL as null. The only column shape it does
// NOT already hand back in canonical form is TIMESTAMPTZ, which arrives as a
// JS Date and must become a canonical UTC ISO string. This function performs
// exactly that conversion and nothing else -- it is not a semantic
// transform, so no PostgreSQL BIGINT is ever routed through a JavaScript
// Number comparison/projection authority here.
function projectRow(row) {
  const projected = {};
  for (const [key, value] of Object.entries(row)) {
    projected[key] = value instanceof Date ? value.toISOString() : value;
  }
  return projected;
}

function projectRows(rows) {
  return rows.map(projectRow);
}

function emptyResult() {
  return { status: 'empty', data: null };
}

// ---------------------------------------------------------------------------
// Public operation.
// ---------------------------------------------------------------------------

async function runBounded(client, { formulaId, formulaVersion, analysisCutoff, filters }) {
  // Shape/type/duplicate validation already happened before the transaction
  // opened. Existence validation for FORMULA and every supplied
  // primary/secondary reference happens here, inside the bounded read-only
  // transaction, and always runs -- even on a request that will ultimately
  // resolve to `empty_result` -- per the canonical validation ordering.
  await assertFormulaExists(client, formulaId, formulaVersion);
  await assertIdsExist(client, 'evidence_enrollments', 'enrollment_id', filters.enrollmentIds);
  await assertIdsExist(client, 'evidence_assignments', 'assignment_id', filters.assignmentIds);
  await assertIdsExist(client, 'evidence_attempts', 'attempt_id', filters.attemptIds);
  await assertConditionReferencesExist(client, filters.conditionReferences);
  await assertNodeIdsExist(client, filters.nodeIds);
  await assertItemFamilyReferencesExist(client, filters.itemFamilyReferences);

  const bundleShell = {
    formulaReference: { formulaId, formulaVersion },
    analysisCutoff,
    filters,
  };

  // Bounded no-root request: all three primary arrays empty. Valid, not an
  // error, and never a whole-Evidence scan.
  if (
    filters.enrollmentIds.length === 0
    && filters.assignmentIds.length === 0
    && filters.attemptIds.length === 0
  ) {
    return emptyResult();
  }

  const qualifyingAssignments = await selectQualifyingAssignments(client, filters, analysisCutoff);
  const qualifyingAssignmentIds = qualifyingAssignments.map((row) => row.assignment_id);

  const assignmentLevelSecondaryEmpty = filters.assignmentIds.length === 0
    && filters.attemptIds.length === 0
    && filters.conditionReferences.length === 0
    && filters.targetTimepoints.length === 0
    && filters.nodeIds.length === 0
    && filters.itemFamilyReferences.length === 0;

  const bonusEnrollmentIds = assignmentLevelSecondaryEmpty
    ? await selectAssignmentlessBonusEnrollmentIds(client, filters.enrollmentIds, analysisCutoff)
    : [];

  const enrollmentIdSet = new Set([
    ...qualifyingAssignments.map((row) => row.enrollment_id),
    ...bonusEnrollmentIds,
  ]);

  // Valid disjoint ancestry, a secondary predicate removing every root, or
  // analysisCutoff removing every root all converge here: no enrollment
  // contributed anything -> empty_result. Not an error.
  if (enrollmentIdSet.size === 0) {
    return emptyResult();
  }

  const enrollments = await fetchEnrollments(client, [...enrollmentIdSet]);
  const assignments = qualifyingAssignments; // already ORDER BY assignment_id ASC
  const assignmentSnapshots = await fetchSnapshots(client, qualifyingAssignmentIds, analysisCutoff);
  const assignmentSnapshotNodes = await fetchSnapshotNodes(client, qualifyingAssignmentIds, analysisCutoff);
  const assignmentItemExposures = await fetchExposures(client, qualifyingAssignmentIds, analysisCutoff);
  const attempts = await fetchAttempts(client, {
    attemptIds: filters.attemptIds,
    assignmentIds: qualifyingAssignmentIds,
    analysisCutoff,
  });
  const includedAttemptIds = attempts.map((row) => row.attempt_id);
  const attemptFinalizations = await fetchFinalizations(client, includedAttemptIds, analysisCutoff);
  const finalizedAttemptIds = attemptFinalizations.map((row) => row.attempt_id);
  const targetNodeEvaluations = await fetchEvaluations(client, finalizedAttemptIds);
  const correctionAggregates = await fetchCorrections(client, finalizedAttemptIds);

  return {
    ...bundleShell,
    rawFacts: {
      enrollments: projectRows(enrollments),
      assignments: projectRows(assignments),
      assignmentSnapshots: projectRows(assignmentSnapshots),
      assignmentSnapshotNodes: projectRows(assignmentSnapshotNodes),
      assignmentItemExposures: projectRows(assignmentItemExposures),
      attempts: projectRows(attempts),
      attemptFinalizations: projectRows(attemptFinalizations),
      targetNodeEvaluations: projectRows(targetNodeEvaluations),
      correctionAggregates: projectRows(correctionAggregates),
    },
    sourceRebuildReference: {
      enrollmentIds: enrollments.map((row) => row.enrollment_id),
      assignmentIds: assignments.map((row) => row.assignment_id),
      attemptIds: attempts.map((row) => row.attempt_id),
      exposureIds: assignmentItemExposures.map((row) => row.exposure_id),
      evaluationIds: targetNodeEvaluations.map((row) => row.evaluation_id),
    },
  };
}

function mapDatabaseError(error, context) {
  if (error && typeof error.code === 'string' && [
    'INVALID_ID',
    'MISSING_REQUIRED_FIELD',
    'UNAUTHORIZED_CALLER',
    'OUT_OF_RANGE_VALUE',
    'CONTRACT_VIOLATION',
  ].includes(error.code)) {
    return error;
  }
  if (error?.code === '23503') {
    return new NotFoundError(`${context}: referenced row does not exist`);
  }
  if (error?.code === '23514' || error?.code === '23502' || error?.code === '22P02') {
    return new ContractViolationError(`${context}: database contract rejected the request`);
  }
  if (error?.code === '22001') {
    return new OutOfRangeValueError(`${context}: value exceeds the configured bound`);
  }
  return error;
}

async function queryRawEvidenceForMetricRebuild(pool, input) {
  // Pure validation happens before any connection is taken -- shape, type,
  // and duplicate rejection never touches the database.
  const validated = validateQueryInput(input);

  if (!pool || typeof pool.connect !== 'function') {
    throw new ContractViolationError('pool.connect is required');
  }

  const client = await pool.connect();
  try {
    // Single bounded transaction: REPEATABLE READ, READ ONLY. FORMULA
    // existence validation and every Evidence read happen inside it. No
    // mutation lock is acquired, and the transaction never writes.
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
    const result = await runBounded(client, validated);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original failure. The caller needs the operation error.
    }
    throw mapDatabaseError(error, 'queryRawEvidenceForMetricRebuild');
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// VI P1 Measurement Readiness -- METRIC_RESULT Runtime
// Synthetic P0 Query-Time Only.
//
// Implements the bounded METRIC_RESULT query contract:
//
//   queryMetricResult(pool, input)
//
// Canonical authority: API_CONTRACT.md §13.10.11.2 (Retention v1) and
// §13.10.11.3 (Unseen Transfer v2), EVIDENCE_FOUNDATION_P0_SCHEMA.md
// §12.3.4 / §12.3.5 / §12.4.1 / §12.4.2 / §12.5 / §18.11.
//
// Metric kind is never a caller-supplied top-level input: it is decided
// solely by the pinned FORMULA's immutable `definitionVersion`
// (1 = RETENTION, 2 = UNSEEN_TRANSFER). The two versions are mutually
// exclusive and closed, and this dispatch does not retroactively change the
// meaning of any existing `definitionVersion 1` FORMULA reference.
//
// This is a separate internal Pilot Evidence Instrumentation Component
// operation from `queryRawEvidenceForMetricRebuild` above: it does not call
// it, does not reuse its exact input/output shape, and owns exactly one
// REPEATABLE READ READ ONLY transaction of its own. It may reuse this
// module's private existence-validation helpers (already-open-client-only,
// never begin/commit/rollback), but performs its own candidate
// admission/eligibility/exclusion source selection and its own in-memory
// Retention reduction from a frozen, cutoff-bounded projection read inside
// that one transaction. It writes nothing.
// ---------------------------------------------------------------------------

const METRIC_TOP_LEVEL_KEYS = [
  'formulaId',
  'formulaVersion',
  'analysisCutoff',
  'aggregationGrain',
  'filters',
];

const METRIC_FILTER_KEYS = [
  'enrollmentIds',
  'conditionReferences',
  'targetTimepoints',
  'nodeIds',
  'itemFamilyReferences',
];

// Retention v1's targetTimepoints vocabulary is a strict subset of the
// general TARGET_TIMEPOINTS export (IMMEDIATE/NOT_APPLICABLE are
// CONTRACT_VIOLATION here, not merely "no match"), so this is intentionally
// its own local list rather than a filter over TARGET_TIMEPOINTS.
const RETENTION_TARGET_TIMEPOINTS = ['DAY_7', 'DAY_30'];

const REQUIRED_AGGREGATION_GRAIN = Object.freeze([
  'PARTICIPANT',
  'TARGET_NODE',
  'ASSESSMENT_TIMEPOINT',
  'CONDITION',
  'FORMULA_VERSION',
]);

// Unseen Transfer v2 adds exactly one axis, `ITEM_FAMILY`, in exactly this
// position (API_CONTRACT.md §13.10.11.3 / EVIDENCE_FOUNDATION_P0_SCHEMA.md
// §12.4.2). `enrollment`, `experiment` and `scenario` are NOT grain axes.
const UNSEEN_AGGREGATION_GRAIN = Object.freeze([
  'PARTICIPANT',
  'TARGET_NODE',
  'ITEM_FAMILY',
  'ASSESSMENT_TIMEPOINT',
  'CONDITION',
  'FORMULA_VERSION',
]);

const EXCLUSION_RULE_ORDER = Object.freeze([
  'ASSIGNMENT_SUPERSEDED',
  'ASSIGNMENT_WITHDRAWN',
  'ASSIGNMENT_TECHNICAL_FAILURE',
  'ASSIGNMENT_MISSING',
  'ASSIGNMENT_UNSCORABLE',
  'ASSIGNMENT_NORMAL_EMPTY',
  'ASSIGNMENT_NONTERMINAL',
  'POST_CUTOFF_COMPLETION',
  'COMPLETION_EARLY',
  'COMPLETION_LATE',
  'ON_TIME_TECHNICAL_INVALID_ATTEMPT',
  'ON_TIME_NORMAL_EMPTY_RESPONSE',
  'ON_TIME_UNSCORABLE_ATTEMPT',
  'ON_TIME_UNSCORABLE_NODE_EVALUATION',
]);

// FIRST_MATCH rule -> reporting-bucket count-key (API_CONTRACT.md
// §13.10.11.2 "FIRST_MATCH exclusion"; several rules share a bucket).
const RULE_COUNT_KEY = Object.freeze({
  ASSIGNMENT_SUPERSEDED: 'supersededCount',
  ASSIGNMENT_WITHDRAWN: 'withdrawnCount',
  ASSIGNMENT_TECHNICAL_FAILURE: 'technicalFailureCount',
  ASSIGNMENT_MISSING: 'missingCount',
  ASSIGNMENT_UNSCORABLE: 'unscorableCount',
  ASSIGNMENT_NORMAL_EMPTY: 'normalEmptyCount',
  ASSIGNMENT_NONTERMINAL: 'nonterminalCount',
  POST_CUTOFF_COMPLETION: 'postCutoffCompletionCount',
  COMPLETION_EARLY: 'earlyCount',
  COMPLETION_LATE: 'lateCount',
  ON_TIME_TECHNICAL_INVALID_ATTEMPT: 'technicalFailureCount',
  ON_TIME_NORMAL_EMPTY_RESPONSE: 'normalEmptyCount',
  ON_TIME_UNSCORABLE_ATTEMPT: 'unscorableCount',
  ON_TIME_UNSCORABLE_NODE_EVALUATION: 'unscorableCount',
});

const EXCLUDED_COUNT_KEYS = Object.freeze([
  'supersededCount',
  'withdrawnCount',
  'technicalFailureCount',
  'missingCount',
  'unscorableCount',
  'normalEmptyCount',
  'nonterminalCount',
  'postCutoffCompletionCount',
  'earlyCount',
  'lateCount',
]);

// Unseen Transfer v2: rules 1-14 are byte-identical to Retention v1's
// `exclusionPolicy.ruleOrder`; rules 15 and 16 are appended and apply ONLY to
// candidates that survived rules 1-14 (API_CONTRACT.md §13.10.11.3 "Exact
// 16-rule FIRST_MATCH exclusion order").
const UNSEEN_EXCLUSION_RULE_ORDER = Object.freeze([
  ...EXCLUSION_RULE_ORDER,
  'ITEM_LINEAGE_NOT_DIFFERENT',
  'NODE_PRIOR_EXPOSURE_ABSENT',
]);

const UNSEEN_RULE_COUNT_KEY = Object.freeze({
  ...RULE_COUNT_KEY,
  ITEM_LINEAGE_NOT_DIFFERENT: 'lineageNotDifferentCount',
  NODE_PRIOR_EXPOSURE_ABSENT: 'noPriorNodeExposureCount',
});

// 12-bucket mutually exclusive partition: the ten Retention buckets plus the
// two v2-only lineage buckets.
const UNSEEN_EXCLUDED_COUNT_KEYS = Object.freeze([
  ...EXCLUDED_COUNT_KEYS,
  'lineageNotDifferentCount',
  'noPriorNodeExposureCount',
]);

// Canonical lineage priority, exactly this order. There is no fuzzy,
// text-similarity, edit-distance, token-overlap or transitive inference
// anywhere in this module -- only explicit, versioned, stored ITEM authority.
const LINEAGE_PRIORITY = Object.freeze([
  'EXACT_REPEAT',
  'SURFACE_VARIANT',
  'SAME_ITEM_FAMILY',
  'DIFFERENT_ITEM_FAMILY',
]);

// Primary unseen eligibility requires exactly this stored lineage value.
// A null `resolved_item_lineage` is NEVER coerced into it.
const PRIMARY_UNSEEN_LINEAGE = 'DIFFERENT_ITEM_FAMILY';

const MAX_SAFE_COUNT = BigInt(Number.MAX_SAFE_INTEGER);

// ---------------------------------------------------------------------------
// Closed FORMULA v1 definition (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.4.1).
// ---------------------------------------------------------------------------

function requireExactConstant(actual, expected, fieldName) {
  if (actual !== expected) {
    throw new ContractViolationError(`${fieldName} must equal the exact canonical constant`);
  }
}

function requireExactArrayConstant(actual, expected, fieldName) {
  if (
    !Array.isArray(actual)
    || actual.length !== expected.length
    || actual.some((value, index) => value !== expected[index])
  ) {
    throw new ContractViolationError(`${fieldName} must equal the exact canonical array`);
  }
}

function arraysEqualExact(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

// Every defect in a stored FORMULA -- unknown/missing/undefined/null/
// wrong-type/out-of-range/unsupported-constant/fixed-array-mismatch -- maps
// uniformly to CONTRACT_VIOLATION (unlike top-level request input, which
// distinguishes MISSING_REQUIRED_FIELD/CONTRACT_VIOLATION/
// OUT_OF_RANGE_VALUE). `validateClosedObject` and this helper both honor
// that uniform mapping.
function validateFormulaSafeIntegerRange(value, fieldName, { min, max }) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new ContractViolationError(`${fieldName} must be a safe integer in range [${min}, ${max}]`);
  }
  return value;
}

function validateFormulaToleranceMs(value, fieldName) {
  return validateFormulaSafeIntegerRange(value, fieldName, { min: 0, max: Number.MAX_SAFE_INTEGER });
}

// `spec` maps each required key to either an exact scalar constant, an exact
// array constant, or a validator function `(value, fieldName) -> normalized`
// for the v1 variable fields (minimumSample/earlyToleranceMs/
// lateToleranceMs). Unknown/missing/undefined keys are rejected uniformly by
// `assertExactDefinitionKeys` before any per-key rule runs.
function validateClosedObject(value, spec, fieldName) {
  const keys = Object.keys(spec);
  assertExactDefinitionKeys(value, keys, fieldName);
  const result = {};
  for (const key of keys) {
    const rule = spec[key];
    const path = `${fieldName}.${key}`;
    if (typeof rule === 'function') {
      result[key] = rule(value[key], path);
    } else if (Array.isArray(rule)) {
      requireExactArrayConstant(value[key], rule, path);
      result[key] = rule.slice();
    } else {
      requireExactConstant(value[key], rule, path);
      result[key] = rule;
    }
  }
  return result;
}

const CANDIDATE_ADMISSION_POLICY_SPEC = Object.freeze({
  observationUnit: 'ASSIGNMENT_NODE',
  assignmentType: 'ASSESSMENT',
  targetTimepoints: RETENTION_TARGET_TIMEPOINTS,
  sourceCutoffRule: 'ENROLLMENT_ASSIGNMENT_SNAPSHOT_AT_OR_BEFORE_CUTOFF',
  dueAtRule: 'REQUIRED_AND_AT_OR_BEFORE_CUTOFF',
});

const DENOMINATOR_ELIGIBILITY_POLICY_SPEC = Object.freeze({
  completionRequirement: 'COMPLETED',
  requireNonSuperseded: true,
  attemptSelection: 'ASSIGNMENT_COMPLETION_ATTEMPT_ONLY',
  completionCutoffRule: 'COMPLETED_AT_AND_FINALIZED_AT_AT_OR_BEFORE_CUTOFF',
  timelinessRequirement: 'ON_TIME',
  requireScorableAttempt: true,
  requireScorableNodeEvaluation: true,
  correctnessRequirement: 'BOOLEAN',
  excludeTechnicalInvalid: true,
  excludeNormalEmpty: true,
});

const TIMELINESS_SPEC = Object.freeze({
  basis: 'ASSIGNMENT_DUE_AT',
  observationTimestamp: 'FINALIZATION_FINALIZED_AT',
  earlyToleranceMs: validateFormulaToleranceMs,
  lateToleranceMs: validateFormulaToleranceMs,
  lowerBoundInclusive: true,
  upperBoundInclusive: true,
});

const SOURCE_COMPATIBILITY_SPEC = Object.freeze({
  assignmentFormulaRequirement: 'EXACT_MATCH',
  mismatchedAssignmentTreatment: 'EXCLUDE_FROM_CANDIDATE_POPULATION',
  latestVersionReinterpretation: 'PROHIBITED',
  mutableLifecycleProjection: 'TRANSACTION_VISIBLE_AS_OF_READ',
  historicalLifecycleFabrication: 'PROHIBITED',
});

const EXCLUSION_POLICY_SPEC = Object.freeze({
  classificationRule: 'FIRST_MATCH',
  matchedCandidateTreatment: 'EXCLUDE_AND_COUNT',
  ruleOrder: EXCLUSION_RULE_ORDER,
});

const VALUE_PROJECTION_SPEC = Object.freeze({
  representation: 'FIXED_DECIMAL_STRING',
  scale: 'RATIO_0_TO_1',
  decimalPlaces: 6,
  roundingMode: 'HALF_UP',
});

const FORMULA_TOP_LEVEL_KEYS = [
  'definitionType',
  'definitionVersion',
  'executionScope',
  'metricKind',
  'aggregationGrain',
  'minimumSample',
  'candidateAdmissionPolicy',
  'denominatorEligibilityPolicy',
  'numeratorRule',
  'denominatorRule',
  'timeliness',
  'sourceCompatibility',
  'exclusionPolicy',
  'valueProjection',
];

// FORMULA v2 is the v1 closed shape plus exactly two new required subobjects
// (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.4.2). Except for the v2-specific
// `exclusionPolicy.ruleOrder` extension (14-rule Retention order -> exact
// 16-rule Unseen order) and those two new required subobjects, the remaining
// inherited v1 fields/subobjects retain their canonical v1 values, so the v1
// specs are reused verbatim rather than restated.
const FORMULA_V2_TOP_LEVEL_KEYS = [
  ...FORMULA_TOP_LEVEL_KEYS,
  'lineagePolicy',
  'scenarioPolicy',
];

const UNSEEN_EXCLUSION_POLICY_SPEC = Object.freeze({
  classificationRule: 'FIRST_MATCH',
  matchedCandidateTreatment: 'EXCLUDE_AND_COUNT',
  ruleOrder: UNSEEN_EXCLUSION_RULE_ORDER,
});

const LINEAGE_POLICY_SPEC = Object.freeze({
  historyScope: 'SAME_ENROLLMENT',
  historyCutoffRule: 'EXPOSURE_ORDINAL_LTE_STORED_CUTOFF',
  relevanceScope: 'FULL_ASSIGNMENT_TARGET_NODE_SET',
  assignmentLineageRequirement: 'DIFFERENT_ITEM_FAMILY',
  nodeExposureRequirement: 'EXPOSED_ASSIGNMENT_CONTAINS_NODE',
  recomputationRule: 'REQUIRED_NULL_SAFE_MATCH',
  priority: LINEAGE_PRIORITY,
  itemRelationAuthority: 'VERSIONED_ITEM_LINEAGE_AUTHORITY_V1',
});

// Scenario stays a separate stratification axis: it is not a primary
// eligibility requirement, not a grain axis, not a group-key field, and the
// stratified reducer output remains deferred and is not produced here.
const SCENARIO_POLICY_SPEC = Object.freeze({
  primaryEligibilityRequirement: 'NONE',
  primaryAggregation: 'NONE',
  stratifiedOutput: 'DEFERRED_SEPARATE_OUTPUT',
});

// Dispatch authority. Metric kind is decided ONLY here, from the stored
// FORMULA's immutable `definitionVersion` -- never from caller input. Any
// other value (including a non-object definition, a string "1", 0, 3 or an
// absent key) is a stored-source CONTRACT_VIOLATION, and the per-version
// closed validation below is what enforces the mutually-exclusive
// version/metricKind pairing.
function readFormulaDefinitionVersion(definition) {
  if (!isPlainObject(definition)) {
    throw new ContractViolationError('formula definition must be a plain object');
  }
  const definitionVersion = definition.definitionVersion;
  if (definitionVersion !== 1 && definitionVersion !== 2) {
    throw new ContractViolationError(
      'formula.definitionVersion must be exactly 1 (RETENTION) or 2 (UNSEEN_TRANSFER)'
    );
  }
  return definitionVersion;
}

function validateClosedFormulaDefinitionV1(definition, requestedAggregationGrain) {
  // The legacy (unapproved) `populationPolicy` shape, and any other
  // unknown/missing/extra key, is rejected here: the required key set is
  // exact and closed.
  assertExactDefinitionKeys(definition, FORMULA_TOP_LEVEL_KEYS, 'formula');

  requireExactConstant(definition.definitionType, 'EVIDENCE_METRIC_FORMULA', 'formula.definitionType');
  requireExactConstant(definition.definitionVersion, 1, 'formula.definitionVersion');
  requireExactConstant(definition.executionScope, 'SYNTHETIC_P0', 'formula.executionScope');
  // definitionVersion 1 supports RETENTION only. The prior rejection of an
  // UNSEEN_TRANSFER declaration is now VERSION-AWARE rather than global: a
  // `definitionVersion 1` FORMULA claiming UNSEEN_TRANSFER is still
  // CONTRACT_VIOLATION, because the two definitionVersions are mutually
  // exclusive and closed (API_CONTRACT.md §13.10.11.3 "Operation과
  // dispatch"). UNSEEN_TRANSFER is reachable only through the separate
  // `definitionVersion 2` branch below -- never by relaxing this check.
  requireExactConstant(definition.metricKind, 'RETENTION', 'formula.metricKind');
  requireExactArrayConstant(definition.aggregationGrain, REQUIRED_AGGREGATION_GRAIN, 'formula.aggregationGrain');

  const minimumSample = validatePositiveSafeInteger(
    definition.minimumSample,
    'formula.minimumSample',
    Number.MAX_SAFE_INTEGER
  );

  validateClosedObject(
    definition.candidateAdmissionPolicy,
    CANDIDATE_ADMISSION_POLICY_SPEC,
    'formula.candidateAdmissionPolicy'
  );
  validateClosedObject(
    definition.denominatorEligibilityPolicy,
    DENOMINATOR_ELIGIBILITY_POLICY_SPEC,
    'formula.denominatorEligibilityPolicy'
  );
  requireExactConstant(
    definition.numeratorRule,
    'CORRECT_ELIGIBLE_NODE_EVALUATIONS',
    'formula.numeratorRule'
  );
  requireExactConstant(
    definition.denominatorRule,
    'ALL_ELIGIBLE_SCORABLE_NODE_EVALUATIONS',
    'formula.denominatorRule'
  );
  const timeliness = validateClosedObject(definition.timeliness, TIMELINESS_SPEC, 'formula.timeliness');
  validateClosedObject(definition.sourceCompatibility, SOURCE_COMPATIBILITY_SPEC, 'formula.sourceCompatibility');
  validateClosedObject(definition.exclusionPolicy, EXCLUSION_POLICY_SPEC, 'formula.exclusionPolicy');
  validateClosedObject(definition.valueProjection, VALUE_PROJECTION_SPEC, 'formula.valueProjection');

  // Grain compatibility (API_CONTRACT.md §13.10.11.2 transaction step 3):
  // caller input and pinned FORMULA must each carry the exact canonical
  // grain, and therefore match each other -- checked explicitly as its own
  // step, not only implied by the two individual canonical-constant checks
  // above.
  if (!arraysEqualExact(definition.aggregationGrain, requestedAggregationGrain)) {
    throw new ContractViolationError('aggregationGrain mismatch between request and pinned FORMULA');
  }

  return {
    minimumSample,
    earlyToleranceMs: timeliness.earlyToleranceMs,
    lateToleranceMs: timeliness.lateToleranceMs,
  };
}

// ---------------------------------------------------------------------------
// Closed FORMULA v2 definition -- Unseen Transfer synthetic P0
// (API_CONTRACT.md §13.10.11.3 "Exact closed FORMULA v2",
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.4.2).
//
// Exactly 16 required top-level keys; every subobject key is required too --
// FORMULA v2 has no optional and no nullable field. A `null` appearing
// anywhere inside the definition (top-level value, subobject value or array
// element) is CONTRACT_VIOLATION, which falls out structurally here: every
// key is either an exact scalar constant, an exact array constant, or a
// validated safe integer, and `null` satisfies none of those. (ITEM
// `lineageAuthority.canonicalStimulusId` may be `null` under its own,
// separate ITEM definition contract -- that is not an exception to this
// prohibition, and it is validated elsewhere.)
// ---------------------------------------------------------------------------

function validateClosedFormulaDefinitionV2(definition, requestedAggregationGrain) {
  assertExactDefinitionKeys(definition, FORMULA_V2_TOP_LEVEL_KEYS, 'formula');

  requireExactConstant(definition.definitionType, 'EVIDENCE_METRIC_FORMULA', 'formula.definitionType');
  requireExactConstant(definition.definitionVersion, 2, 'formula.definitionVersion');
  requireExactConstant(definition.executionScope, 'SYNTHETIC_P0', 'formula.executionScope');
  // definitionVersion 2 supports UNSEEN_TRANSFER only -- a v2 FORMULA
  // claiming RETENTION is CONTRACT_VIOLATION (mutually exclusive, closed).
  requireExactConstant(definition.metricKind, 'UNSEEN_TRANSFER', 'formula.metricKind');
  requireExactArrayConstant(
    definition.aggregationGrain,
    UNSEEN_AGGREGATION_GRAIN,
    'formula.aggregationGrain'
  );

  const minimumSample = validatePositiveSafeInteger(
    definition.minimumSample,
    'formula.minimumSample',
    Number.MAX_SAFE_INTEGER
  );

  validateClosedObject(
    definition.candidateAdmissionPolicy,
    CANDIDATE_ADMISSION_POLICY_SPEC,
    'formula.candidateAdmissionPolicy'
  );
  validateClosedObject(
    definition.denominatorEligibilityPolicy,
    DENOMINATOR_ELIGIBILITY_POLICY_SPEC,
    'formula.denominatorEligibilityPolicy'
  );
  requireExactConstant(
    definition.numeratorRule,
    'CORRECT_ELIGIBLE_NODE_EVALUATIONS',
    'formula.numeratorRule'
  );
  requireExactConstant(
    definition.denominatorRule,
    'ALL_ELIGIBLE_SCORABLE_NODE_EVALUATIONS',
    'formula.denominatorRule'
  );
  const timeliness = validateClosedObject(definition.timeliness, TIMELINESS_SPEC, 'formula.timeliness');
  validateClosedObject(
    definition.sourceCompatibility,
    SOURCE_COMPATIBILITY_SPEC,
    'formula.sourceCompatibility'
  );
  validateClosedObject(
    definition.exclusionPolicy,
    UNSEEN_EXCLUSION_POLICY_SPEC,
    'formula.exclusionPolicy'
  );
  validateClosedObject(definition.valueProjection, VALUE_PROJECTION_SPEC, 'formula.valueProjection');
  validateClosedObject(definition.lineagePolicy, LINEAGE_POLICY_SPEC, 'formula.lineagePolicy');
  validateClosedObject(definition.scenarioPolicy, SCENARIO_POLICY_SPEC, 'formula.scenarioPolicy');

  if (!arraysEqualExact(definition.aggregationGrain, requestedAggregationGrain)) {
    throw new ContractViolationError('aggregationGrain mismatch between request and pinned FORMULA');
  }

  return {
    minimumSample,
    earlyToleranceMs: timeliness.earlyToleranceMs,
    lateToleranceMs: timeliness.lateToleranceMs,
  };
}

// ---------------------------------------------------------------------------
// Exact input validation/normalization (no DB).
// ---------------------------------------------------------------------------

// The caller-supplied grain must itself be one of the exact canonical grains,
// in exact order. Which one is legal for THIS request is then decided against
// the pinned FORMULA's own grain inside the per-version closed validation --
// a caller/FORMULA grain mismatch (for example the v2 six-axis grain against
// a `definitionVersion 1` FORMULA) is CONTRACT_VIOLATION there, exactly as a
// FORMULA-side mismatch already was.
function validateMetricAggregationGrainInput(value) {
  if (arraysEqualExact(value, REQUIRED_AGGREGATION_GRAIN)) {
    return REQUIRED_AGGREGATION_GRAIN.slice();
  }
  if (arraysEqualExact(value, UNSEEN_AGGREGATION_GRAIN)) {
    return UNSEEN_AGGREGATION_GRAIN.slice();
  }
  throw new ContractViolationError(
    'aggregationGrain must equal exactly one of the canonical metric grains, in exact order'
  );
}

// F-MR-RR-03 (METRIC_RESULT-specific): built with a dense index-by-index
// loop rather than `Array.prototype.map`, which silently skips a sparse
// hole and lets it survive into `normalized` as a hole -- later producing a
// raw TypeError (or worse, a silent pass-through) instead of routing the
// hole through the same per-element validation as every other index. A hole
// read via `value[index]` is `undefined`, exactly like an explicit
// undefined element, so `assertExactKeys(undefined, ...)` already reports it
// as MISSING_REQUIRED_FIELD -- no separate hole-detection branch is needed
// once iteration itself cannot skip it. The RAW_SOURCE analog of this
// function (`validateConditionReferenceArray`) is untouched.
function validateMetricConditionReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = [];
  for (let index = 0; index < value.length; index += 1) {
    const element = value[index];
    assertExactKeys(element, ['conditionId', 'conditionVersion'], `${fieldName}[${index}]`);
    normalized.push({
      conditionId: validateStableId(element.conditionId, `${fieldName}[${index}].conditionId`),
      conditionVersion: validateBoundedVersion(
        element.conditionVersion,
        `${fieldName}[${index}].conditionVersion`
      ),
    });
  }
  const seen = new Set();
  for (const ref of normalized) {
    const key = `${ref.conditionId}@${ref.conditionVersion}`;
    if (seen.has(key)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(key);
  }
  return normalized.slice().sort((a, b) => {
    if (a.conditionId !== b.conditionId) return a.conditionId < b.conditionId ? -1 : 1;
    return a.conditionVersion - b.conditionVersion;
  });
}

// F-MR-RR-03 (METRIC_RESULT-specific): see validateMetricConditionReferenceArray
// above for the dense-iteration rationale. The RAW_SOURCE analog of this
// function (`validateItemFamilyReferenceArray`) is untouched.
function validateMetricItemFamilyReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = [];
  for (let index = 0; index < value.length; index += 1) {
    const element = value[index];
    assertExactKeys(element, ['itemFamilyId', 'itemFamilyVersion'], `${fieldName}[${index}]`);
    normalized.push({
      itemFamilyId: validateStableId(element.itemFamilyId, `${fieldName}[${index}].itemFamilyId`),
      itemFamilyVersion: validateBoundedVersion(
        element.itemFamilyVersion,
        `${fieldName}[${index}].itemFamilyVersion`
      ),
    });
  }
  const seen = new Set();
  for (const ref of normalized) {
    const key = `${ref.itemFamilyId}@${ref.itemFamilyVersion}`;
    if (seen.has(key)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(key);
  }
  return normalized.slice().sort((a, b) => {
    if (a.itemFamilyId !== b.itemFamilyId) return a.itemFamilyId < b.itemFamilyId ? -1 : 1;
    return a.itemFamilyVersion - b.itemFamilyVersion;
  });
}

function validateRetentionTargetTimepointArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((item, index) => {
    if (typeof item !== 'string' || !RETENTION_TARGET_TIMEPOINTS.includes(item)) {
      throw new ContractViolationError(
        `${fieldName}[${index}] must be one of: ${RETENTION_TARGET_TIMEPOINTS.join(', ')}`
      );
    }
    return item;
  });
  const seen = new Set();
  for (const item of normalized) {
    if (seen.has(item)) {
      throw new ContractViolationError(`${fieldName} contains a duplicate value`);
    }
    seen.add(item);
  }
  return normalized
    .slice()
    .sort((a, b) => RETENTION_TARGET_TIMEPOINTS.indexOf(a) - RETENTION_TARGET_TIMEPOINTS.indexOf(b));
}

// F-MR-RR-04 (METRIC_RESULT-specific primitive-array guard): the shared
// RAW_SOURCE array validators (`validateUuidArray`/`validateStableIdArray`)
// and this module's own `validateRetentionTargetTimepointArray` all build
// their normalized output with `Array.prototype.map`, which silently skips
// a sparse hole instead of validating it -- the hole then survives
// normalization and can reach PostgreSQL as a NULL array element. This
// guard runs first and rejects any hole as CONTRACT_VIOLATION before the
// array is ever handed to a validator, without changing those validators'
// own behavior -- RAW_SOURCE's use of the shared validators is therefore
// unaffected.
function assertDenseMetricArray(value, fieldName) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new ContractViolationError(`${fieldName}[${index}] must not be a sparse array hole`);
      }
    }
  }
  return value;
}

function validateMetricFilters(rawFilters) {
  // `assignmentIds`/`attemptIds` are not in METRIC_FILTER_KEYS, so
  // supplying either is already rejected here as an unrecognized key
  // (CONTRACT_VIOLATION) -- no separate forbidden-key branch is needed.
  assertAllowedKeys(rawFilters, METRIC_FILTER_KEYS, 'filters');
  for (const key of METRIC_FILTER_KEYS) {
    requireField(rawFilters, key);
  }

  assertDenseMetricArray(rawFilters.enrollmentIds, 'filters.enrollmentIds');
  assertDenseMetricArray(rawFilters.nodeIds, 'filters.nodeIds');
  assertDenseMetricArray(rawFilters.targetTimepoints, 'filters.targetTimepoints');

  const enrollmentIds = validateUuidArray(rawFilters.enrollmentIds, 'filters.enrollmentIds');
  const conditionReferences = validateMetricConditionReferenceArray(
    rawFilters.conditionReferences,
    'filters.conditionReferences'
  );
  const targetTimepoints = validateRetentionTargetTimepointArray(
    rawFilters.targetTimepoints,
    'filters.targetTimepoints'
  );
  const nodeIds = validateStableIdArray(rawFilters.nodeIds, 'filters.nodeIds');
  const itemFamilyReferences = validateMetricItemFamilyReferenceArray(
    rawFilters.itemFamilyReferences,
    'filters.itemFamilyReferences'
  );

  if (enrollmentIds.length === 0 && conditionReferences.length === 0) {
    throw new ContractViolationError(
      'filters.enrollmentIds or filters.conditionReferences must be nonempty'
    );
  }

  return { enrollmentIds, conditionReferences, targetTimepoints, nodeIds, itemFamilyReferences };
}

function validateMetricResultInput(input) {
  assertAllowedKeys(input, METRIC_TOP_LEVEL_KEYS, 'input');
  const formulaId = validateStableId(requireField(input, 'formulaId'), 'formulaId');
  const formulaVersion = validateBoundedVersion(requireField(input, 'formulaVersion'), 'formulaVersion');
  const analysisCutoff = validateAnalysisCutoff(requireField(input, 'analysisCutoff'));
  const aggregationGrain = validateMetricAggregationGrainInput(requireField(input, 'aggregationGrain'));
  const filters = validateMetricFilters(requireField(input, 'filters'));
  return { formulaId, formulaVersion, analysisCutoff, aggregationGrain, filters };
}

// ---------------------------------------------------------------------------
// DB-backed FORMULA read.
// ---------------------------------------------------------------------------

async function fetchFormulaRow(client, formulaId, formulaVersion) {
  const { rows } = await client.query(
    `SELECT definition, definition_digest, digest_algorithm, normalization_version
       FROM evidence_reference_versions
      WHERE reference_kind = 'FORMULA' AND reference_id = $1 AND version = $2`,
    [formulaId, formulaVersion]
  );
  if (rows.length === 0) {
    throw new NotFoundError(`Unknown FORMULA reference: ${formulaId}@${formulaVersion}`);
  }
  return rows[0];
}

// ---------------------------------------------------------------------------
// Retention candidate admission (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.5).
// ---------------------------------------------------------------------------

async function selectQualifyingEnrollmentsForMetric(client, filters, analysisCutoff) {
  const { rows } = await client.query(
    `SELECT enrollment_id, participant_id, condition_id, condition_version
       FROM evidence_enrollments e
      WHERE e.created_at <= $1::timestamptz
        AND (cardinality($2::uuid[]) = 0 OR e.enrollment_id = ANY($2::uuid[]))
        AND (
          cardinality($3::text[]) = 0
          OR EXISTS (
            SELECT 1
              FROM unnest($3::text[], $4::int[]) AS cond(condition_id, condition_version)
             WHERE cond.condition_id = e.condition_id
               AND cond.condition_version = e.condition_version
          )
        )
      ORDER BY e.enrollment_id ASC`,
    [
      analysisCutoff,
      filters.enrollmentIds,
      filters.conditionReferences.map((ref) => ref.conditionId),
      filters.conditionReferences.map((ref) => ref.conditionVersion),
    ]
  );
  return rows;
}

// Assignment + snapshot via LEFT JOIN, so a matching assignment with no
// snapshot row is distinguishable (has_snapshot=false) from one whose
// snapshot is merely post-cutoff -- the "missing snapshot/due_at contradicts
// admission" requirement must never be hidden behind an INNER JOIN/WHERE.
//
// `s.rubric_id`/`s.rubric_version` (F-MR-RR-02) are carried through here so
// the snapshot's rubric authority can later be compared, exactly, against
// the completion target-node evaluation's own rubric_id/rubric_version --
// node compatibility is already enforced through the existing
// (attempt_id, node_id) evaluation lookup and is not touched here.
async function selectCandidateAssignments(client, enrollmentIds, filters, analysisCutoff) {
  if (enrollmentIds.length === 0) return [];
  const effectiveTimepoints = filters.targetTimepoints.length > 0
    ? filters.targetTimepoints
    : RETENTION_TARGET_TIMEPOINTS;
  const { rows } = await client.query(
    `SELECT
       a.assignment_id,
       a.enrollment_id,
       a.target_timepoint,
       a.terminal_outcome,
       a.superseded_by,
       a.completion_attempt_id,
       (a.due_at IS NOT NULL) AS has_due_at,
       -- F-MR-RR2-01: -infinity/infinity are physically storable due_at
       -- values that pass every ordinary NULL/comparison predicate
       -- silently. Expose finiteness as its own fact so a non-finite
       -- due_at is never folded into "not yet due" or "already due".
       (a.due_at IS NULL OR isfinite(a.due_at)) AS due_at_finite,
       (
         a.due_at IS NOT NULL
         AND isfinite(a.due_at)
         AND a.due_at <= $3::timestamptz
       ) AS due_within_cutoff,
       (s.assignment_id IS NOT NULL) AS has_snapshot,
       (s.assignment_id IS NOT NULL AND s.created_at <= $3::timestamptz) AS snapshot_within_cutoff,
       s.formula_id,
       s.formula_version,
       s.item_family_id,
       s.item_family_version,
       s.rubric_id,
       s.rubric_version,
       -- Unseen Transfer v2 assignment-time immutable lineage authority
       -- (EVIDENCE_FOUNDATION_P0_SCHEMA.md §5.9). Projected here so the v2
       -- reducer reads the SAME frozen snapshot row the shared candidate
       -- admission already resolved; Retention v1 ignores these columns and
       -- is unaffected. exposure_history_cutoff_ordinal is BIGINT and is
       -- projected as its exact base-10 decimal text -- never as a
       -- JavaScript Number.
       s.item_id,
       s.item_version,
       s.resolved_item_lineage,
       s.exposure_history_cutoff_ordinal::text AS exposure_history_cutoff_ordinal,
       (a.completed_at IS NOT NULL AND a.completed_at <= $3::timestamptz) AS completed_within_cutoff
     FROM evidence_assignments a
     LEFT JOIN evidence_assignment_snapshots s ON s.assignment_id = a.assignment_id
    WHERE a.enrollment_id = ANY($1::uuid[])
      AND a.assignment_type = 'ASSESSMENT'
      AND a.target_timepoint = ANY($2::text[])
      AND a.created_at <= $3::timestamptz
    ORDER BY a.assignment_id ASC`,
    [enrollmentIds, effectiveTimepoints, analysisCutoff]
  );
  return rows;
}

function resolvePopulationEligibleAssignments(assignmentRows, formulaId, formulaVersion, itemFamilyReferences) {
  const itemFamilyKeySet = itemFamilyReferences.length > 0
    ? new Set(itemFamilyReferences.map((ref) => `${ref.itemFamilyId}@${ref.itemFamilyVersion}`))
    : null;

  const eligible = new Map();
  for (const row of assignmentRows) {
    if (!row.has_snapshot) {
      throw new ContractViolationError(
        `assignment ${row.assignment_id} matches Retention candidate admission but has no snapshot`
      );
    }
    if (!row.snapshot_within_cutoff) continue; // outside candidate population
    if (row.formula_id !== formulaId || Number(row.formula_version) !== formulaVersion) continue;
    if (itemFamilyKeySet) {
      const key = `${row.item_family_id}@${Number(row.item_family_version)}`;
      if (!itemFamilyKeySet.has(key)) continue;
    }
    if (!row.has_due_at) {
      throw new ContractViolationError(
        `assignment ${row.assignment_id} has no due_at, required for Retention candidate admission`
      );
    }
    // F-MR-RR2-01: a present but non-finite due_at (-infinity/infinity) must
    // never be treated as merely "not yet due" or "already due" -- it is a
    // source contradiction distinct from both, and must surface as
    // CONTRACT_VIOLATION before any timeliness/cutoff comparison authority
    // is derived from it.
    if (!row.due_at_finite) {
      throw new ContractViolationError(
        `assignment ${row.assignment_id} has a non-finite due_at, required for Retention candidate admission`
      );
    }
    if (!row.due_within_cutoff) continue; // not yet due

    eligible.set(row.assignment_id, {
      assignmentId: row.assignment_id,
      enrollmentId: row.enrollment_id,
      targetTimepoint: row.target_timepoint,
      terminalOutcome: row.terminal_outcome,
      supersededBy: row.superseded_by,
      completionAttemptId: row.completion_attempt_id,
      completedWithinCutoff: row.completed_within_cutoff,
      rubricId: row.rubric_id,
      rubricVersion: Number(row.rubric_version),
      // Unseen Transfer v2 authority carried through unchanged. Retention v1
      // never reads these, so its grain, group key, counts, output and
      // provenance are untouched. `exposureHistoryCutoffOrdinal` stays the
      // exact BIGINT decimal string; `itemVersion`/`itemFamilyVersion` are
      // PostgreSQL INTEGER, not BIGINT.
      itemId: row.item_id,
      itemVersion: Number(row.item_version),
      itemFamilyId: row.item_family_id,
      itemFamilyVersion: Number(row.item_family_version),
      resolvedItemLineage: row.resolved_item_lineage,
      exposureHistoryCutoffOrdinal: row.exposure_history_cutoff_ordinal,
    });
  }
  return eligible;
}

async function selectCandidateNodes(client, assignmentIds, nodeIds) {
  if (assignmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT assignment_id, node_id
       FROM evidence_assignment_snapshot_nodes
      WHERE assignment_id = ANY($1::uuid[])
        AND (cardinality($2::text[]) = 0 OR node_id = ANY($2::text[]))
      ORDER BY assignment_id ASC, ordinal ASC`,
    [assignmentIds, nodeIds]
  );
  return rows;
}

function buildMetricCandidates(nodeRows, assignmentMap, enrollmentMap, formulaId, formulaVersion) {
  return nodeRows.map((row) => {
    const assignment = assignmentMap.get(row.assignment_id);
    const enrollment = enrollmentMap.get(assignment.enrollmentId);
    return {
      assignmentId: assignment.assignmentId,
      nodeId: row.node_id,
      enrollmentId: assignment.enrollmentId,
      participantId: enrollment.participant_id,
      conditionId: enrollment.condition_id,
      conditionVersion: Number(enrollment.condition_version),
      targetTimepoint: assignment.targetTimepoint,
      terminalOutcome: assignment.terminalOutcome,
      supersededBy: assignment.supersededBy,
      completionAttemptId: assignment.completionAttemptId,
      completedWithinCutoff: assignment.completedWithinCutoff,
      rubricId: assignment.rubricId,
      rubricVersion: assignment.rubricVersion,
      // v2-only fields; Retention v1's group key, reduction, projection and
      // provenance never read them.
      itemId: assignment.itemId,
      itemVersion: assignment.itemVersion,
      itemFamilyId: assignment.itemFamilyId,
      itemFamilyVersion: assignment.itemFamilyVersion,
      resolvedItemLineage: assignment.resolvedItemLineage,
      exposureHistoryCutoffOrdinal: assignment.exposureHistoryCutoffOrdinal,
      formulaId,
      formulaVersion,
    };
  });
}

// ---------------------------------------------------------------------------
// Completion integrity / timeliness projection.
// ---------------------------------------------------------------------------

// Timeliness and the completed_at/finalized_at equality check are computed
// entirely in PostgreSQL as exact NUMERIC arithmetic -- never via a JS
// `Date` subtraction, which would truncate below millisecond precision and
// could move an exact boundary.
//
// F-MR-RR-06: the tolerance range is 0..Number.MAX_SAFE_INTEGER ms, so
// `due_at ± tolerance-interval` (the original shape) can construct a
// timestamp outside PostgreSQL's representable TIMESTAMPTZ range and raise
// SQLSTATE 22008, regardless of how close `finalized_at` actually is to
// `due_at`.
//
// F-MR-RR2-01: the RR-06 correction (`finalized_at - due_at` decomposed via
// EXTRACT(DAY ...) plus a sub-day remainder) still raised raw SQLSTATE 22008
// for extreme finite PostgreSQL timestamps -- interval subtraction and
// day-decomposition across extreme endpoints can themselves overflow
// PostgreSQL's representable INTERVAL range before the sub-day remainder is
// ever reached, independent of how that remainder is computed. It also
// never guarded against a non-finite `due_at`/`finalized_at`
// (-infinity/infinity are physically storable and pass every prior
// NULL/comparison predicate silently), which raised raw SQLSTATE 0A000 the
// moment interval subtraction was attempted against an infinite endpoint.
//
// This corrected shape never constructs or subtracts an INTERVAL at all:
// `EXTRACT(EPOCH FROM finalized_at) - EXTRACT(EPOCH FROM due_at)` computes
// the signed delta as a difference of two PostgreSQL NUMERIC epoch values
// (seconds since 1970-01-01 UTC, exact to microsecond precision, never a
// float/double authority), then scales to microseconds by NUMERIC
// multiplication -- exact, with no BIGINT cast of the full delta and no
// INTERVAL range to overflow. A `CASE` guard evaluates `isfinite()` on both
// endpoints before this arithmetic ever runs, so a non-finite `due_at`/
// `finalized_at` yields `NULL::numeric` (never raises) and is exposed to the
// in-memory classifier as an explicit `finalized_at_finite` fact (due_at
// finiteness is already enforced upstream, in
// `resolvePopulationEligibleAssignments`, before an assignment's id can ever
// reach this query) rather than being silently absorbed into an
// EARLY/ON_TIME/LATE comparison. `is_early`/`is_late` are computed only from
// a non-null delta, so a non-finite endpoint can never resolve to a false
// "on time". Freshly verified against PostgreSQL 17.10, including the ±1
// microsecond boundary, the full Number.MAX_SAFE_INTEGER millisecond
// tolerance, and extreme finite endpoints that previously raised SQLSTATE
// 22008.
async function selectCompletionDetails(client, assignmentIds, analysisCutoff, earlyToleranceMs, lateToleranceMs) {
  if (assignmentIds.length === 0) return new Map();
  const { rows } = await client.query(
    `WITH base AS (
       SELECT
         a.assignment_id,
         a.completion_attempt_id,
         a.due_at,
         att.attempt_id AS att_attempt_id,
         att.assignment_id AS attempt_owner_assignment_id,
         att.started_at,
         fin.attempt_id AS fin_attempt_id,
         fin.finalized_at,
         a.completed_at,
         fin.response_kind,
         fin.attempt_outcome
       FROM evidence_assignments a
       LEFT JOIN evidence_attempts att ON att.attempt_id = a.completion_attempt_id
       LEFT JOIN evidence_attempt_finalizations fin ON fin.attempt_id = a.completion_attempt_id
      WHERE a.assignment_id = ANY($1::uuid[])
     ),
     delta AS (
       SELECT
         assignment_id,
         CASE
           WHEN finalized_at IS NULL OR due_at IS NULL THEN NULL::numeric
           WHEN NOT isfinite(finalized_at) OR NOT isfinite(due_at) THEN NULL::numeric
           ELSE (
             EXTRACT(EPOCH FROM finalized_at) - EXTRACT(EPOCH FROM due_at)
           ) * 1000000
         END AS delta_microseconds
       FROM base
     )
     SELECT
       base.assignment_id,
       base.completion_attempt_id,
       (base.att_attempt_id IS NOT NULL) AS attempt_exists,
       base.attempt_owner_assignment_id,
       (base.started_at IS NOT NULL AND base.started_at <= $2::timestamptz) AS attempt_started_within_cutoff,
       (base.fin_attempt_id IS NOT NULL) AS finalization_exists,
       -- F-MR-RR2-01: distinguish "finalization absent" from "finalization
       -- present with a non-finite finalized_at" -- true whenever
       -- finalized_at is null (no finalization row / not yet dereferenced)
       -- or finite; false only when a finalization row exists and its
       -- finalized_at is -infinity/infinity.
       (base.finalized_at IS NULL OR isfinite(base.finalized_at)) AS finalized_at_finite,
       (
         base.finalized_at IS NOT NULL
         AND isfinite(base.finalized_at)
         AND base.finalized_at <= $2::timestamptz
       ) AS finalized_within_cutoff,
       (base.completed_at = base.finalized_at) AS completed_equals_finalized,
       base.response_kind,
       base.attempt_outcome,
       (delta.delta_microseconds IS NOT NULL AND delta.delta_microseconds < (-($3::numeric) * 1000)) AS is_early,
       (delta.delta_microseconds IS NOT NULL AND delta.delta_microseconds > ($4::numeric * 1000)) AS is_late
     FROM base
     JOIN delta ON delta.assignment_id = base.assignment_id`,
    [assignmentIds, analysisCutoff, String(earlyToleranceMs), String(lateToleranceMs)]
  );
  const map = new Map();
  for (const row of rows) {
    map.set(row.assignment_id, row);
  }
  return map;
}

// F-MR-RR-01: `created_at` (via the SQL-computed `created_within_cutoff`
// fact) is carried so a post-cutoff evaluation can be distinguished from a
// genuinely missing one -- this must never be a WHERE predicate that would
// filter such a row out of this result set, which would make the two
// indistinguishable to the caller.
// F-MR-RR-02: `rubric_id`/`rubric_version` are carried so the evaluation's
// own rubric authority can be compared, exactly, against the assignment
// snapshot's rubric_id/rubric_version before this evaluation may become
// scorable/correctness/provenance authority. Node compatibility is already
// enforced through the (attempt_id, node_id) lookup key below and is not
// touched here.
async function selectEvaluationsForAttempts(client, attemptIds, analysisCutoff) {
  if (attemptIds.length === 0) return new Map();
  const { rows } = await client.query(
    `SELECT evaluation_id, attempt_id, node_id, scorable, is_correct,
            rubric_id, rubric_version,
            (created_at <= $2::timestamptz) AS created_within_cutoff
       FROM evidence_target_node_evaluations
      WHERE attempt_id = ANY($1::uuid[])`,
    [attemptIds, analysisCutoff]
  );
  const map = new Map();
  for (const row of rows) {
    map.set(`${row.attempt_id} ${row.node_id}`, row);
  }
  return map;
}

// ---------------------------------------------------------------------------
// FIRST_MATCH classification (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.4.1
// exclusionPolicy.ruleOrder / §12.5 Retention). Exactly one of the 14 rules
// matches, or the candidate is eligible -- any other outcome is a source
// contradiction (CONTRACT_VIOLATION).
// ---------------------------------------------------------------------------

function classifyMetricCandidate(candidate, completionDetail, evaluationMap) {
  if (candidate.supersededBy !== null) {
    return { rule: 'ASSIGNMENT_SUPERSEDED' };
  }
  const outcome = candidate.terminalOutcome;
  if (outcome === 'WITHDRAWN') return { rule: 'ASSIGNMENT_WITHDRAWN' };
  if (outcome === 'TECHNICAL_FAILURE') return { rule: 'ASSIGNMENT_TECHNICAL_FAILURE' };
  if (outcome === 'MISSING') return { rule: 'ASSIGNMENT_MISSING' };
  if (outcome === 'UNSCORABLE') return { rule: 'ASSIGNMENT_UNSCORABLE' };
  if (outcome === 'NORMAL_EMPTY') return { rule: 'ASSIGNMENT_NORMAL_EMPTY' };
  if (outcome === null) return { rule: 'ASSIGNMENT_NONTERMINAL' };
  if (outcome !== 'COMPLETED') {
    throw new ContractViolationError(`candidate has an unrecognized terminal_outcome: ${outcome}`);
  }

  if (!candidate.completedWithinCutoff) {
    // Post-cutoff completion: never dereference the completion attempt or
    // any node evaluation as historical evidence.
    return { rule: 'POST_CUTOFF_COMPLETION' };
  }

  const detail = completionDetail;
  if (!detail || candidate.completionAttemptId === null) {
    throw new ContractViolationError('COMPLETED candidate is missing a completion attempt pointer');
  }
  if (!detail.attempt_exists || detail.attempt_owner_assignment_id !== candidate.assignmentId) {
    throw new ContractViolationError('completion attempt does not belong to the completed assignment');
  }
  if (!detail.attempt_started_within_cutoff) {
    throw new ContractViolationError('completion attempt started after analysisCutoff');
  }
  if (!detail.finalization_exists) {
    throw new ContractViolationError('completion attempt has no finalization');
  }
  // F-MR-RR2-01: a present but non-finite finalized_at (-infinity/infinity)
  // must become a source contradiction before it can become timeliness
  // authority -- checked immediately once finalization is known to exist,
  // and before the within-cutoff/timeliness comparisons that would
  // otherwise silently misclassify it (e.g. -infinity <= analysisCutoff is
  // true, which would wrongly read as "within cutoff").
  if (!detail.finalized_at_finite) {
    throw new ContractViolationError('completion finalization has a non-finite finalized_at');
  }
  if (!detail.finalized_within_cutoff) {
    throw new ContractViolationError('completion finalization occurred after analysisCutoff');
  }
  if (!detail.completed_equals_finalized) {
    throw new ContractViolationError('assignment completed_at does not match finalization finalized_at');
  }

  if (detail.is_early) return { rule: 'COMPLETION_EARLY', attemptId: candidate.completionAttemptId };
  if (detail.is_late) return { rule: 'COMPLETION_LATE', attemptId: candidate.completionAttemptId };

  if (detail.attempt_outcome === 'TECHNICAL_INVALID') {
    return { rule: 'ON_TIME_TECHNICAL_INVALID_ATTEMPT', attemptId: candidate.completionAttemptId };
  }
  if (detail.response_kind === 'NORMAL_EMPTY') {
    return { rule: 'ON_TIME_NORMAL_EMPTY_RESPONSE', attemptId: candidate.completionAttemptId };
  }
  if (detail.attempt_outcome === 'UNSCORABLE') {
    return { rule: 'ON_TIME_UNSCORABLE_ATTEMPT', attemptId: candidate.completionAttemptId };
  }
  if (detail.attempt_outcome !== 'SCORABLE') {
    throw new ContractViolationError(
      `completion attempt has an unrecognized attempt_outcome: ${detail.attempt_outcome}`
    );
  }

  const evaluation = evaluationMap.get(`${candidate.completionAttemptId} ${candidate.nodeId}`);
  if (!evaluation) {
    throw new ContractViolationError('required target-node evaluation does not exist');
  }
  // F-MR-RR-01: a present-but-post-cutoff evaluation is a distinct
  // contradiction from a genuinely missing one (checked immediately above)
  // -- it must never become scorable/correctness/provenance authority, and
  // throwing here (before any branch below ever reads evaluation_id) means
  // its evaluationId can never leak into a returned classification.
  if (!evaluation.created_within_cutoff) {
    throw new ContractViolationError('target-node evaluation was created after analysisCutoff');
  }
  // F-MR-RR-02: rubric compatibility between the evaluation and the
  // assignment snapshot's pinned rubric authority -- exact match only, no
  // latest-version reinterpretation. Node compatibility is already enforced
  // by the (attempt_id, node_id) lookup key above.
  if (
    evaluation.rubric_id !== candidate.rubricId
    || Number(evaluation.rubric_version) !== candidate.rubricVersion
  ) {
    throw new ContractViolationError(
      'target-node evaluation rubric does not match the assignment snapshot rubric authority'
    );
  }
  if (evaluation.scorable === false) {
    return {
      rule: 'ON_TIME_UNSCORABLE_NODE_EVALUATION',
      attemptId: candidate.completionAttemptId,
      evaluationId: evaluation.evaluation_id,
    };
  }
  if (evaluation.scorable !== true) {
    throw new ContractViolationError('target-node evaluation scorable must be boolean');
  }
  if (typeof evaluation.is_correct !== 'boolean') {
    throw new ContractViolationError('scorable target-node evaluation requires boolean is_correct');
  }
  return {
    eligible: true,
    isCorrect: evaluation.is_correct,
    attemptId: candidate.completionAttemptId,
    evaluationId: evaluation.evaluation_id,
  };
}

// ---------------------------------------------------------------------------
// Grouping / Retention reduction / HALF_UP value projection.
// ---------------------------------------------------------------------------

function metricGroupKeyString(candidate) {
  return [
    candidate.participantId,
    candidate.nodeId,
    candidate.targetTimepoint,
    candidate.conditionId,
    candidate.conditionVersion,
    candidate.formulaId,
    candidate.formulaVersion,
  ].join(' ');
}

function newMetricGroupAccumulator(candidate) {
  return {
    groupKey: {
      participantId: candidate.participantId,
      nodeId: candidate.nodeId,
      targetTimepoint: candidate.targetTimepoint,
      conditionId: candidate.conditionId,
      conditionVersion: candidate.conditionVersion,
      formulaId: candidate.formulaId,
      formulaVersion: candidate.formulaVersion,
    },
    denominator: 0n,
    numerator: 0n,
    counts: {
      missingCount: 0n,
      technicalFailureCount: 0n,
      withdrawnCount: 0n,
      unscorableCount: 0n,
      normalEmptyCount: 0n,
      earlyCount: 0n,
      lateCount: 0n,
      supersededCount: 0n,
      nonterminalCount: 0n,
      postCutoffCompletionCount: 0n,
    },
    enrollmentIds: new Set(),
    assignmentIds: new Set(),
    attemptIds: new Set(),
    evaluationIds: new Set(),
  };
}

// Recommended implementation direction (API_CONTRACT.md §13.10.11.2): BigInt
// tallies internally, rejecting overflow > Number.MAX_SAFE_INTEGER only when
// projecting to the public Number field.
function toSafeCount(value, fieldName) {
  if (value < 0n || value > MAX_SAFE_COUNT) {
    throw new OutOfRangeValueError(`${fieldName} exceeds the supported safe-integer range`);
  }
  return Number(value);
}

function reduceMetricCandidates(candidates, completionDetailMap, evaluationMap) {
  const groups = new Map();
  for (const candidate of candidates) {
    const key = metricGroupKeyString(candidate);
    let group = groups.get(key);
    if (!group) {
      group = newMetricGroupAccumulator(candidate);
      groups.set(key, group);
    }

    // Every eligible + excluded candidate's owning enrollment/assignment
    // contributes to group provenance, regardless of classification.
    group.enrollmentIds.add(candidate.enrollmentId);
    group.assignmentIds.add(candidate.assignmentId);

    const detail = completionDetailMap.get(candidate.assignmentId) || null;
    const classification = classifyMetricCandidate(candidate, detail, evaluationMap);

    if (classification.attemptId) group.attemptIds.add(classification.attemptId);
    if (classification.evaluationId) group.evaluationIds.add(classification.evaluationId);

    if (classification.eligible) {
      group.denominator += 1n;
      if (classification.isCorrect) group.numerator += 1n;
    } else {
      const countKey = RULE_COUNT_KEY[classification.rule];
      group.counts[countKey] += 1n;
    }
  }
  return groups;
}

// HALF_UP six-decimal ratio via exact integer/rational arithmetic --
// approved implementation direction from API_CONTRACT.md §13.10.11.2. Never
// uses `toFixed`/`Math.round`/binary-floating-point rounding.
function computeHalfUpRatio(numerator, denominator) {
  const scaled = numerator * 1000000n;
  const quotient = scaled / denominator;
  const remainder = scaled % denominator;
  const rounded = quotient + (2n * remainder >= denominator ? 1n : 0n);
  const wholePart = rounded / 1000000n;
  const fracPart = rounded % 1000000n;
  return `${wholePart.toString()}.${fracPart.toString().padStart(6, '0')}`;
}

function projectMetricGroup(group, minimumSample) {
  const excludedCountBig = EXCLUDED_COUNT_KEYS.reduce((sum, key) => sum + group.counts[key], 0n);
  const candidateCountBig = group.denominator + excludedCountBig;

  if (group.numerator > group.denominator) {
    throw new ContractViolationError('numerator exceeds denominator for a group');
  }

  const denominator = toSafeCount(group.denominator, 'denominator');
  const numerator = toSafeCount(group.numerator, 'numerator');
  const excludedCount = toSafeCount(excludedCountBig, 'excludedCount');
  const candidateCount = toSafeCount(candidateCountBig, 'candidateCount');
  const eligibleCount = denominator;

  const status = denominator >= minimumSample ? 'OK' : 'INSUFFICIENT';
  const value = status === 'OK' ? computeHalfUpRatio(group.numerator, group.denominator) : null;

  const sourceRebuildReference = {
    enrollmentIds: [...group.enrollmentIds].sort(),
    assignmentIds: [...group.assignmentIds].sort(),
    attemptIds: [...group.attemptIds].sort(),
    exposureIds: [],
    evaluationIds: [...group.evaluationIds].sort(),
  };

  return {
    groupKey: group.groupKey,
    status,
    numerator,
    denominator,
    value,
    candidateCount,
    eligibleCount,
    excludedCount,
    missingCount: toSafeCount(group.counts.missingCount, 'missingCount'),
    technicalFailureCount: toSafeCount(group.counts.technicalFailureCount, 'technicalFailureCount'),
    withdrawnCount: toSafeCount(group.counts.withdrawnCount, 'withdrawnCount'),
    unscorableCount: toSafeCount(group.counts.unscorableCount, 'unscorableCount'),
    normalEmptyCount: toSafeCount(group.counts.normalEmptyCount, 'normalEmptyCount'),
    earlyCount: toSafeCount(group.counts.earlyCount, 'earlyCount'),
    lateCount: toSafeCount(group.counts.lateCount, 'lateCount'),
    supersededCount: toSafeCount(group.counts.supersededCount, 'supersededCount'),
    nonterminalCount: toSafeCount(group.counts.nonterminalCount, 'nonterminalCount'),
    postCutoffCompletionCount: toSafeCount(
      group.counts.postCutoffCompletionCount,
      'postCutoffCompletionCount'
    ),
    sourceRebuildReference,
  };
}

function compareMetricGroups(a, b) {
  const left = a.groupKey;
  const right = b.groupKey;
  if (left.participantId !== right.participantId) {
    return left.participantId < right.participantId ? -1 : 1;
  }
  if (left.nodeId !== right.nodeId) return left.nodeId < right.nodeId ? -1 : 1;
  const timepointDelta = RETENTION_TARGET_TIMEPOINTS.indexOf(left.targetTimepoint)
    - RETENTION_TARGET_TIMEPOINTS.indexOf(right.targetTimepoint);
  if (timepointDelta !== 0) return timepointDelta;
  if (left.conditionId !== right.conditionId) return left.conditionId < right.conditionId ? -1 : 1;
  if (left.conditionVersion !== right.conditionVersion) return left.conditionVersion - right.conditionVersion;
  if (left.formulaId !== right.formulaId) return left.formulaId < right.formulaId ? -1 : 1;
  return left.formulaVersion - right.formulaVersion;
}

function unionMetricSourceRebuildReference(groups) {
  const enrollmentIds = new Set();
  const assignmentIds = new Set();
  const attemptIds = new Set();
  const evaluationIds = new Set();
  for (const group of groups) {
    for (const id of group.sourceRebuildReference.enrollmentIds) enrollmentIds.add(id);
    for (const id of group.sourceRebuildReference.assignmentIds) assignmentIds.add(id);
    for (const id of group.sourceRebuildReference.attemptIds) attemptIds.add(id);
    for (const id of group.sourceRebuildReference.evaluationIds) evaluationIds.add(id);
  }
  return {
    enrollmentIds: [...enrollmentIds].sort(),
    assignmentIds: [...assignmentIds].sort(),
    attemptIds: [...attemptIds].sort(),
    exposureIds: [],
    evaluationIds: [...evaluationIds].sort(),
  };
}

// ===========================================================================
// VI P1 Measurement Readiness -- METRIC_RESULT Unseen Transfer v2 reducer
// (API_CONTRACT.md §13.10.11.3, EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3.5 /
// §12.4.2 / Unseen transfer portion of §12.5).
//
// Everything above this banner is Retention v1 and is NOT reopened,
// redefined or weakened here. The v2 path shares -- verbatim -- v1's input
// vocabulary, candidate admission, completion/timeliness integrity and the
// rule 1-14 FIRST_MATCH classifier, and adds on top of it: the item-family
// grain axis, the assignment-time immutable lineage authority layer, rules 15
// and 16, the two extra counts, and full-`H(A)` exposure provenance.
//
// `targetTimepoints` vocabulary (DAY_7/DAY_30), `IMMEDIATE` exclusion and the
// EARLY/ON_TIME/LATE boundary rules are unchanged in v2, so v1's input
// validator and completion projection are reused rather than duplicated.
// ===========================================================================

// exposure_ordinal / exposure_history_cutoff_ordinal are PostgreSQL BIGINT.
// JavaScript `Number` is never their comparison, ordering, persistence or
// round-trip authority: they arrive as exact base-10 decimal strings and are
// compared either in PostgreSQL (BIGINT vs BIGINT) or, in memory, as
// JavaScript `BigInt`.
const EXACT_BIGINT_ORDINAL_PATTERN = /^(0|[1-9][0-9]*)$/;

function requireExactBigIntOrdinal(value, fieldName) {
  if (typeof value !== 'string' || !EXACT_BIGINT_ORDINAL_PATTERN.test(value)) {
    throw new ContractViolationError(
      `${fieldName} must be an exact base-10 decimal BIGINT ordinal string `
        + '(digits only, no sign, no leading zero, no exponent, no decimal point, no whitespace)'
    );
  }
  return BigInt(value);
}

// ---------------------------------------------------------------------------
// ITEM lineage authority (API_CONTRACT.md §13.10.11.3 "UT-C1 / UT-C1-a /
// UT-C1-b", EVIDENCE_FOUNDATION_P0_SCHEMA.md §5.5).
//
// The assignment-creation writer and this METRIC_RESULT reader consume the
// SAME `L(A)` source authority, the same `lineageAuthority` validity rules,
// the same direct either-direction `SV` relation and the same canonical
// priority. Nothing here infers a relation from text similarity, edit
// distance, token overlap or transitive closure -- only explicit, versioned,
// stored ITEM authority counts, and a relation that does not exist is never
// invented or backfilled.
// ---------------------------------------------------------------------------

const ITEM_LINEAGE_DEFINITION_TYPE = 'EVIDENCE_ITEM_LINEAGE';
const ITEM_LINEAGE_DEFINITION_VERSION = 1;
const ITEM_LINEAGE_AUTHORITY_KEYS = Object.freeze([
  'definitionType',
  'definitionVersion',
  'canonicalStimulusId',
  'surfaceVariantReferences',
]);
const SURFACE_VARIANT_REFERENCE_KEYS = Object.freeze(['itemId', 'itemVersion']);
const MAX_ITEM_REFERENCE_VERSION = 2147483647;

// Key absence is valid and means "no explicit canonical-stimulus/
// surface-variant declaration" -- never an error, and never an equality
// source. An explicit `null` is a stored-source CONTRACT_VIOLATION.
const ABSENT_ITEM_LINEAGE_AUTHORITY = Object.freeze({
  canonicalStimulusId: null,
  surfaceVariantReferences: Object.freeze([]),
});

function itemPairKey(itemId, itemVersion) {
  return JSON.stringify([itemId, itemVersion]);
}

// Whole-object validation of one consumed ITEM's `lineageAuthority`,
// including every `surfaceVariantReferences` entry. Every failure is a stored
// authoritative-source contradiction, so it is always CONTRACT_VIOLATION --
// never INVALID_ID, never an exclusion bucket, and never a silently ignored
// declaration.
function validateConsumedItemLineageAuthority(definition, itemId, itemVersion) {
  const label = `ITEM ${itemId}@${itemVersion} lineageAuthority`;
  if (!isPlainObject(definition) || !hasOwn(definition, 'lineageAuthority')) {
    return ABSENT_ITEM_LINEAGE_AUTHORITY;
  }

  const authority = definition.lineageAuthority;
  if (authority === null) {
    throw new ContractViolationError(
      `${label} must be absent or a valid object -- explicit null is not allowed`
    );
  }
  assertExactDefinitionKeys(authority, ITEM_LINEAGE_AUTHORITY_KEYS, label);

  if (authority.definitionType !== ITEM_LINEAGE_DEFINITION_TYPE) {
    throw new ContractViolationError(`${label}.definitionType must be ${ITEM_LINEAGE_DEFINITION_TYPE}`);
  }
  if (authority.definitionVersion !== ITEM_LINEAGE_DEFINITION_VERSION) {
    throw new ContractViolationError(
      `${label}.definitionVersion must be ${ITEM_LINEAGE_DEFINITION_VERSION}`
    );
  }

  // Nonempty string or null. No trim, no case fold, no Unicode
  // normalization -- comparison is exact code-unit equality, and null never
  // establishes equality.
  const canonicalStimulusId = authority.canonicalStimulusId;
  if (
    canonicalStimulusId !== null
    && !(typeof canonicalStimulusId === 'string' && canonicalStimulusId.length > 0)
  ) {
    throw new ContractViolationError(`${label}.canonicalStimulusId must be a nonempty string or null`);
  }

  if (!Array.isArray(authority.surfaceVariantReferences)) {
    throw new ContractViolationError(`${label}.surfaceVariantReferences must be an array`);
  }

  const selfKey = itemPairKey(itemId, itemVersion);
  const seenKeys = new Set();
  const surfaceVariantReferences = [];
  for (let index = 0; index < authority.surfaceVariantReferences.length; index += 1) {
    const entry = authority.surfaceVariantReferences[index];
    const entryLabel = `${label}.surfaceVariantReferences[${index}]`;
    assertExactDefinitionKeys(entry, SURFACE_VARIANT_REFERENCE_KEYS, entryLabel);
    if (typeof entry.itemId !== 'string' || entry.itemId.length === 0) {
      throw new ContractViolationError(`${entryLabel}.itemId must be a nonempty string`);
    }
    if (
      typeof entry.itemVersion !== 'number'
      || !Number.isInteger(entry.itemVersion)
      || entry.itemVersion < 1
      || entry.itemVersion > MAX_ITEM_REFERENCE_VERSION
    ) {
      throw new ContractViolationError(
        `${entryLabel}.itemVersion must be an integer 1..${MAX_ITEM_REFERENCE_VERSION}`
      );
    }

    const entryKey = itemPairKey(entry.itemId, entry.itemVersion);
    // Self-reference is the EXACT (itemId, itemVersion) pair only -- the same
    // itemId at another itemVersion is a legal surface-variant reference.
    if (entryKey === selfKey) {
      throw new ContractViolationError(`${entryLabel} must not reference the declaring ITEM itself`);
    }
    if (seenKeys.has(entryKey)) {
      throw new ContractViolationError(`${entryLabel} duplicates an earlier exact ITEM pair`);
    }
    seenKeys.add(entryKey);
    surfaceVariantReferences.push({ itemId: entry.itemId, itemVersion: entry.itemVersion });
  }

  return { canonicalStimulusId, surfaceVariantReferences };
}

// ---------------------------------------------------------------------------
// Lineage source loaders (all inside the single REPEATABLE READ READ ONLY
// transaction; every one of them is a read).
// ---------------------------------------------------------------------------

// Exact (reference_id, version) ITEM lookup inside the caller's transaction
// snapshot, so reference existence is validated against the same
// authoritative state the lineage decision is taken from.
async function selectPinnedItemRows(client, pairs) {
  if (pairs.length === 0) return [];
  const { rows } = await client.query(
    `SELECT reference.reference_id AS item_id,
            reference.version      AS item_version,
            reference.definition   AS definition
       FROM evidence_reference_versions reference
       JOIN unnest($1::text[], $2::int[]) AS requested(item_id, item_version)
         ON requested.item_id = reference.reference_id
        AND requested.item_version = reference.version
      WHERE reference.reference_kind = 'ITEM'`,
    [pairs.map((pair) => pair.itemId), pairs.map((pair) => pair.itemVersion)]
  );
  return rows;
}

// L(A) whole-object validation: every ITEM pinned by A or by an R(A) owner.
// ITEM definitions OUTSIDE L(A) are not validated for this operation; their
// existence is checked only where an L(A) surface-variant reference points at
// them (dangling-reference rejection).
async function loadConsumedItemLineageAuthorities(client, pairs) {
  const rows = await selectPinnedItemRows(client, pairs);
  const authoritiesByPair = new Map();
  for (const row of rows) {
    const itemVersion = Number(row.item_version);
    authoritiesByPair.set(
      itemPairKey(row.item_id, itemVersion),
      validateConsumedItemLineageAuthority(row.definition, row.item_id, itemVersion)
    );
  }

  const referencedPairs = [];
  const referencedKeys = new Set();
  for (const pair of pairs) {
    const authority = authoritiesByPair.get(itemPairKey(pair.itemId, pair.itemVersion));
    // V(A) condition 4: A and every R(A) owner must hold exact pinned ITEM
    // authority.
    if (!authority) {
      throw new ContractViolationError(
        `consumed lineage ITEM ${pair.itemId}@${pair.itemVersion} has no pinned ITEM authority`
      );
    }
    for (const reference of authority.surfaceVariantReferences) {
      const referenceKey = itemPairKey(reference.itemId, reference.itemVersion);
      if (referencedKeys.has(referenceKey)) continue;
      referencedKeys.add(referenceKey);
      referencedPairs.push(reference);
    }
  }

  const existingRows = await selectPinnedItemRows(client, referencedPairs);
  const existingKeys = new Set(
    existingRows.map((row) => itemPairKey(row.item_id, Number(row.item_version)))
  );
  for (const reference of referencedPairs) {
    if (!existingKeys.has(itemPairKey(reference.itemId, reference.itemVersion))) {
      throw new ContractViolationError(
        `surfaceVariantReferences entry ${reference.itemId}@${reference.itemVersion} `
          + 'does not exist as a pinned ITEM reference version'
      );
    }
  }

  return authoritiesByPair;
}

// V(A) condition 4, family half. A missing pinned ITEM_FAMILY authority for a
// consumed assignment is a stored-source contradiction
// (CONTRACT_VIOLATION) -- distinct from a caller-supplied unknown
// `itemFamilyReferences` filter entry, which keeps its existing INVALID_ID
// semantics.
async function assertPinnedItemFamilyAuthority(client, pairs) {
  if (pairs.length === 0) return;
  const { rows } = await client.query(
    `SELECT reference_id, version
       FROM evidence_reference_versions
      WHERE reference_kind = 'ITEM_FAMILY'
        AND (reference_id, version) IN (SELECT * FROM unnest($1::text[], $2::int[]))`,
    [pairs.map((pair) => pair.itemFamilyId), pairs.map((pair) => pair.itemFamilyVersion)]
  );
  const existing = new Set(rows.map((row) => `${row.reference_id}@${Number(row.version)}`));
  for (const pair of pairs) {
    if (!existing.has(`${pair.itemFamilyId}@${pair.itemFamilyVersion}`)) {
      throw new ContractViolationError(
        `consumed lineage ITEM_FAMILY ${pair.itemFamilyId}@${pair.itemFamilyVersion} `
          + 'has no pinned ITEM_FAMILY authority'
      );
    }
  }
}

// nodes(X): the COMPLETE immutable snapshot target-node set. Deliberately not
// filtered by the caller's `nodeIds` -- source/filter separation requires
// that a candidate filter never silently truncates the history needed for
// lineage recomputation, and the current assignment's lineage uses its full
// target-node set, not the caller-filtered subset.
async function selectFullSnapshotNodeSets(client, assignmentIds) {
  if (assignmentIds.length === 0) return new Map();
  const { rows } = await client.query(
    `SELECT assignment_id, node_id
       FROM evidence_assignment_snapshot_nodes
      WHERE assignment_id = ANY($1::uuid[])
      ORDER BY assignment_id ASC, ordinal ASC`,
    [assignmentIds]
  );
  const map = new Map();
  for (const row of rows) {
    let set = map.get(row.assignment_id);
    if (!set) {
      set = new Set();
      map.set(row.assignment_id, set);
    }
    set.add(row.node_id);
  }
  return map;
}

// H(A): every authoritative first-exposure row whose owner belongs to E(A)
// and whose exposure_ordinal <= C(A), compared as PostgreSQL BIGINT against
// BIGINT. H(A) represents the immutable assignment-creation history that
// C(A) captures, so it is deliberately NOT truncated by `analysisCutoff`,
// `exposed_at`, or any exposure/assignment/snapshot `created_at`: timestamps
// are not lineage-history ordering authority. Global ordinal gaps are legal.
// Cross-enrollment exposures never participate, whatever their ordinal.
async function selectSameEnrollmentExposureHistory(client, assignmentIds) {
  if (assignmentIds.length === 0) return [];
  const { rows } = await client.query(
    `SELECT target.assignment_id            AS target_assignment_id,
            exposure.exposure_id            AS exposure_id,
            exposure.exposure_ordinal::text AS exposure_ordinal,
            exposure.assignment_id          AS owner_assignment_id
       FROM evidence_assignments target
       JOIN evidence_assignment_snapshots target_snapshot
         ON target_snapshot.assignment_id = target.assignment_id
       JOIN evidence_assignments owner
         ON owner.enrollment_id = target.enrollment_id
       JOIN evidence_assignment_item_exposures exposure
         ON exposure.assignment_id = owner.assignment_id
      WHERE target.assignment_id = ANY($1::uuid[])
        AND exposure.exposure_ordinal <= target_snapshot.exposure_history_cutoff_ordinal
      ORDER BY target.assignment_id ASC, exposure.exposure_id ASC`,
    [assignmentIds]
  );
  return rows;
}

// owner(e) snapshot authority. LEFT JOIN so "owner has no immutable
// snapshot" stays distinguishable and can surface as the V(A) condition 3
// contradiction it is, instead of being filtered away.
async function selectExposureOwnerSnapshots(client, ownerAssignmentIds) {
  if (ownerAssignmentIds.length === 0) return new Map();
  const { rows } = await client.query(
    `SELECT a.assignment_id,
            (s.assignment_id IS NOT NULL) AS has_snapshot,
            s.item_id,
            s.item_version,
            s.item_family_id,
            s.item_family_version
       FROM evidence_assignments a
       LEFT JOIN evidence_assignment_snapshots s ON s.assignment_id = a.assignment_id
      WHERE a.assignment_id = ANY($1::uuid[])`,
    [ownerAssignmentIds]
  );
  const map = new Map();
  for (const row of rows) {
    map.set(row.assignment_id, {
      assignmentId: row.assignment_id,
      hasSnapshot: row.has_snapshot,
      itemId: row.item_id,
      itemVersion: row.item_version === null ? null : Number(row.item_version),
      itemFamilyId: row.item_family_id,
      itemFamilyVersion: row.item_family_version === null ? null : Number(row.item_family_version),
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Recomputed lineage rho(A) (API_CONTRACT.md §13.10.11.3 "Recomputed lineage").
//
// Computed from the WHOLE of R(A) -- never from caller-filtered node history.
// Branch order is exactly the canonical LINEAGE_PRIORITY order. Recomputation
// only VALIDATES stored authority; it never overwrites it, and exposures
// after C(A) never retroactively reclassify an assignment.
// ---------------------------------------------------------------------------

function recomputeAssignmentLineage(target, priorItems, lineageAuthorities) {
  // R(A) empty -> null. Never DIFFERENT_ITEM_FAMILY, and never any other
  // invented value.
  if (priorItems.length === 0) return null;

  const currentAuthority = lineageAuthorities.get(itemPairKey(target.itemId, target.itemVersion));
  const currentSurfaceVariantKeys = new Set(
    currentAuthority.surfaceVariantReferences.map(
      (reference) => itemPairKey(reference.itemId, reference.itemVersion)
    )
  );

  // EXACT_REPEAT: exact snapshot ITEM pair equality, OR both consumed ITEM
  // definitions declaring the SAME non-null canonicalStimulusId under exact
  // code-unit equality.
  const hasExactRepeat = priorItems.some((prior) => {
    if (prior.itemId === target.itemId && prior.itemVersion === target.itemVersion) return true;
    const priorCanonicalStimulusId = lineageAuthorities
      .get(itemPairKey(prior.itemId, prior.itemVersion)).canonicalStimulusId;
    return currentAuthority.canonicalStimulusId !== null
      && priorCanonicalStimulusId !== null
      && currentAuthority.canonicalStimulusId === priorCanonicalStimulusId;
  });
  if (hasExactRepeat) return LINEAGE_PRIORITY[0];

  // SURFACE_VARIANT: the direct, either-direction relation SV(A, prior).
  // Reciprocal storage is not required and the relation is never closed
  // transitively.
  const hasSurfaceVariant = priorItems.some((prior) => {
    const priorKey = itemPairKey(prior.itemId, prior.itemVersion);
    if (currentSurfaceVariantKeys.has(priorKey)) return true;
    return lineageAuthorities.get(priorKey).surfaceVariantReferences.some(
      (reference) => reference.itemId === target.itemId && reference.itemVersion === target.itemVersion
    );
  });
  if (hasSurfaceVariant) return LINEAGE_PRIORITY[1];

  // SAME_ITEM_FAMILY is decided by authoritative family ID only -- family
  // version does not change this identity test.
  if (priorItems.some((prior) => prior.itemFamilyId === target.itemFamilyId)) {
    return LINEAGE_PRIORITY[2];
  }

  return LINEAGE_PRIORITY[3];
}

// ---------------------------------------------------------------------------
// V(A): assignment lineage validation + derived per-assignment facts.
//
// Every violation below is a stored authoritative-source contradiction and is
// therefore CONTRACT_VIOLATION -- never INVALID_ID and never converted into
// `lineageNotDifferentCount`/`noPriorNodeExposureCount`. Caller-supplied
// unknown references keep their existing INVALID_ID semantics elsewhere.
// ---------------------------------------------------------------------------

async function buildUnseenLineageFacts(client, lineageAssignments) {
  const targetIds = [...lineageAssignments.keys()];
  if (targetIds.length === 0) return new Map();

  const historyRows = await selectSameEnrollmentExposureHistory(client, targetIds);
  const historyByTarget = new Map(targetIds.map((id) => [id, []]));
  const ownerIds = new Set();
  for (const row of historyRows) {
    historyByTarget.get(row.target_assignment_id).push(row);
    ownerIds.add(row.owner_assignment_id);
  }

  const nodeSets = await selectFullSnapshotNodeSets(
    client,
    [...new Set([...targetIds, ...ownerIds])]
  );
  const ownerSnapshots = await selectExposureOwnerSnapshots(client, [...ownerIds]);

  // Phase 1: V(A) conditions 1-3, then R(A)/N(A,n)/L(A) derivation.
  const derived = new Map();
  const consumedItemPairs = [];
  const consumedItemKeys = new Set();
  const consumedFamilyPairs = [];
  const consumedFamilyKeys = new Set();

  for (const targetId of targetIds) {
    const target = lineageAssignments.get(targetId);
    const cutoff = requireExactBigIntOrdinal(
      target.exposureHistoryCutoffOrdinal,
      `assignment ${targetId} exposure_history_cutoff_ordinal`
    );
    const history = historyByTarget.get(targetId);

    // V(A).1 -- cutoff witness W(A). C(A) = 0 requires no positive witness.
    // Because H(A) is already restricted to E(A), a row that exists at
    // ordinal C(A) but belongs to another enrollment fails this check, which
    // is exactly the canonical requirement.
    if (cutoff > 0n) {
      const hasWitness = history.some(
        (row) => requireExactBigIntOrdinal(row.exposure_ordinal, 'exposure_ordinal') === cutoff
      );
      if (!hasWitness) {
        throw new ContractViolationError(
          `assignment ${targetId} has no same-enrollment cutoff witness exposure at `
            + `exposure_ordinal ${cutoff.toString()}`
        );
      }
    }

    // V(A).2 -- self-exclusion.
    if (history.some((row) => row.owner_assignment_id === targetId)) {
      throw new ContractViolationError(
        `assignment ${targetId} appears in its own exposure-history H(A)`
      );
    }

    // V(A).3 -- history node authority for every H(A) row, target-relevant
    // or not.
    for (const row of history) {
      const ownerSnapshot = ownerSnapshots.get(row.owner_assignment_id);
      if (!ownerSnapshot || !ownerSnapshot.hasSnapshot) {
        throw new ContractViolationError(
          `exposure-history owner assignment ${row.owner_assignment_id} has no immutable snapshot`
        );
      }
      const ownerNodes = nodeSets.get(row.owner_assignment_id);
      if (!ownerNodes || ownerNodes.size === 0) {
        throw new ContractViolationError(
          `exposure-history owner assignment ${row.owner_assignment_id} has an empty target-node set`
        );
      }
    }

    const targetNodes = nodeSets.get(targetId);
    if (!targetNodes || targetNodes.size === 0) {
      throw new ContractViolationError(
        `assignment ${targetId} has an empty immutable target-node set`
      );
    }

    // R(A): H(A) rows whose owner's FULL target-node set intersects nodes(A).
    const relevant = history.filter((row) => {
      for (const nodeId of nodeSets.get(row.owner_assignment_id)) {
        if (targetNodes.has(nodeId)) return true;
      }
      return false;
    });

    // N(A,n) nonempty <=> n appears in the target-node set of some R(A)
    // owner. This is a requirement separate from assignment-level lineage.
    const nodesWithPriorTargetExposure = new Set();
    for (const row of relevant) {
      for (const nodeId of nodeSets.get(row.owner_assignment_id)) {
        nodesWithPriorTargetExposure.add(nodeId);
      }
    }

    // L(A) contributors: the distinct pinned ITEM/ITEM_FAMILY authority of
    // every R(A) owner (A's own is added below). Empty when R(A) is empty --
    // no lineage authority is consumed at all in that case.
    const priorItems = [];
    const priorItemKeys = new Set();
    for (const row of relevant) {
      const ownerSnapshot = ownerSnapshots.get(row.owner_assignment_id);
      const key = itemPairKey(ownerSnapshot.itemId, ownerSnapshot.itemVersion)
        + ` ${ownerSnapshot.itemFamilyId}@${ownerSnapshot.itemFamilyVersion}`;
      if (priorItemKeys.has(key)) continue;
      priorItemKeys.add(key);
      priorItems.push(ownerSnapshot);
    }

    if (relevant.length > 0) {
      for (const pair of [{ itemId: target.itemId, itemVersion: target.itemVersion }, ...priorItems]) {
        const key = itemPairKey(pair.itemId, pair.itemVersion);
        if (consumedItemKeys.has(key)) continue;
        consumedItemKeys.add(key);
        consumedItemPairs.push({ itemId: pair.itemId, itemVersion: pair.itemVersion });
      }
      const familyPairs = [
        { itemFamilyId: target.itemFamilyId, itemFamilyVersion: target.itemFamilyVersion },
        ...priorItems,
      ];
      for (const pair of familyPairs) {
        const key = `${pair.itemFamilyId}@${pair.itemFamilyVersion}`;
        if (consumedFamilyKeys.has(key)) continue;
        consumedFamilyKeys.add(key);
        consumedFamilyPairs.push({
          itemFamilyId: pair.itemFamilyId,
          itemFamilyVersion: pair.itemFamilyVersion,
        });
      }
    }

    derived.set(targetId, { target, history, priorItems, nodesWithPriorTargetExposure });
  }

  // Phase 2: V(A).4 -- consumed reference authority, batched across every
  // target in one pair of reads inside the same transaction snapshot. Whole-
  // object L(A) validation runs before any lineage value is chosen, so a
  // contradiction is reported even when a stronger relation would have won.
  const lineageAuthorities = await loadConsumedItemLineageAuthorities(client, consumedItemPairs);
  await assertPinnedItemFamilyAuthority(client, consumedFamilyPairs);

  // Phase 3: V(A).5 -- null-safe stored-vs-recomputed comparison, then the
  // per-assignment facts the reducer consumes.
  const facts = new Map();
  for (const [targetId, state] of derived) {
    const { target, history, priorItems, nodesWithPriorTargetExposure } = state;
    const recomputed = recomputeAssignmentLineage(target, priorItems, lineageAuthorities);
    const stored = target.resolvedItemLineage;
    // Null-safe: null/null and equal-non-null are consistent; null vs
    // non-null, non-null vs different and non-null vs recomputed-null are all
    // CONTRACT_VIOLATION.
    if (stored !== recomputed) {
      throw new ContractViolationError(
        `assignment ${targetId} stored resolved_item_lineage `
          + `${stored === null ? 'null' : stored} contradicts recomputed lineage `
          + `${recomputed === null ? 'null' : recomputed}`
      );
    }
    facts.set(targetId, {
      exposureIds: history.map((row) => row.exposure_id),
      ownerAssignmentIds: history.map((row) => row.owner_assignment_id),
      nodesWithPriorTargetExposure,
    });
  }
  return facts;
}

// ---------------------------------------------------------------------------
// Rules 15/16 + Unseen Transfer grouping/reduction/projection.
// ---------------------------------------------------------------------------

// Applied ONLY to a candidate that already survived rules 1-14.
function classifyUnseenLineage(candidate, lineageFacts) {
  // Rule 15: anything other than DIFFERENT_ITEM_FAMILY, null included. A null
  // stored lineage is never coerced into DIFFERENT_ITEM_FAMILY.
  if (candidate.resolvedItemLineage !== PRIMARY_UNSEEN_LINEAGE) {
    return { rule: 'ITEM_LINEAGE_NOT_DIFFERENT' };
  }
  // Rule 16: normal exclusion bucket, not a contradiction.
  if (!lineageFacts.nodesWithPriorTargetExposure.has(candidate.nodeId)) {
    return { rule: 'NODE_PRIOR_EXPOSURE_ABSENT' };
  }
  return { eligible: true };
}

function unseenGroupKeyString(candidate) {
  return JSON.stringify([
    candidate.participantId,
    candidate.nodeId,
    candidate.itemFamilyId,
    candidate.itemFamilyVersion,
    candidate.targetTimepoint,
    candidate.conditionId,
    candidate.conditionVersion,
    candidate.formulaId,
    candidate.formulaVersion,
  ]);
}

function newUnseenGroupAccumulator(candidate) {
  return {
    groupKey: {
      participantId: candidate.participantId,
      nodeId: candidate.nodeId,
      itemFamilyId: candidate.itemFamilyId,
      itemFamilyVersion: candidate.itemFamilyVersion,
      targetTimepoint: candidate.targetTimepoint,
      conditionId: candidate.conditionId,
      conditionVersion: candidate.conditionVersion,
      formulaId: candidate.formulaId,
      formulaVersion: candidate.formulaVersion,
    },
    denominator: 0n,
    numerator: 0n,
    counts: {
      missingCount: 0n,
      technicalFailureCount: 0n,
      withdrawnCount: 0n,
      unscorableCount: 0n,
      normalEmptyCount: 0n,
      earlyCount: 0n,
      lateCount: 0n,
      supersededCount: 0n,
      nonterminalCount: 0n,
      postCutoffCompletionCount: 0n,
      lineageNotDifferentCount: 0n,
      noPriorNodeExposureCount: 0n,
    },
    enrollmentIds: new Set(),
    assignmentIds: new Set(),
    attemptIds: new Set(),
    exposureIds: new Set(),
    evaluationIds: new Set(),
  };
}

async function reduceUnseenCandidates(client, candidates, completionDetailMap, evaluationMap) {
  // Pass 1 -- rules 1-14 only. Lazy FIRST_MATCH lineage validation timing
  // (UT-C2): rules 1-14 require no lineage/history reference validation at
  // all.
  const classified = candidates.map((candidate) => ({
    candidate,
    lifecycle: classifyMetricCandidate(
      candidate,
      completionDetailMap.get(candidate.assignmentId) || null,
      evaluationMap
    ),
  }));

  // V(A) is required exactly for the assignments owning at least one rule-1-14
  // survivor. An assignment whose every candidate was already classified by
  // rules 1-14 is never validated, so a lineage/history defect belonging only
  // to such candidates cannot fail the operation. Batched prefetch below is
  // HOW only: it does not change error outcome, counts or provenance.
  const lineageAssignments = new Map();
  for (const entry of classified) {
    if (!entry.lifecycle.eligible) continue;
    lineageAssignments.set(entry.candidate.assignmentId, entry.candidate);
  }
  const lineageFactsByAssignment = await buildUnseenLineageFacts(client, lineageAssignments);

  const groups = new Map();
  for (const { candidate, lifecycle } of classified) {
    const key = unseenGroupKeyString(candidate);
    let group = groups.get(key);
    if (!group) {
      group = newUnseenGroupAccumulator(candidate);
      groups.set(key, group);
    }

    group.enrollmentIds.add(candidate.enrollmentId);
    group.assignmentIds.add(candidate.assignmentId);
    // Existing logical-dereference semantics: an attempt/evaluation actually
    // dereferenced while classifying this candidate contributes to provenance,
    // exactly as in Retention v1.
    if (lifecycle.attemptId) group.attemptIds.add(lifecycle.attemptId);
    if (lifecycle.evaluationId) group.evaluationIds.add(lifecycle.evaluationId);

    if (!lifecycle.eligible) {
      // Classified by rules 1-14: contributes no lineage-history exposure ID.
      group.counts[UNSEEN_RULE_COUNT_KEY[lifecycle.rule]] += 1n;
      continue;
    }

    // V(A) was required for this candidate, so its full H(A) joins group
    // provenance -- including rows that are not target-relevant, because V(A)
    // consumed them for history-integrity/node-authority verification -- and
    // so do the owning assignments of those exposures. C(A) = 0 yields an
    // empty H(A) and therefore contributes nothing; C(A) > 0 always includes
    // W(A), since W(A) is itself an H(A) row.
    const facts = lineageFactsByAssignment.get(candidate.assignmentId);
    for (const exposureId of facts.exposureIds) group.exposureIds.add(exposureId);
    for (const ownerAssignmentId of facts.ownerAssignmentIds) {
      group.assignmentIds.add(ownerAssignmentId);
    }

    const lineage = classifyUnseenLineage(candidate, facts);
    if (!lineage.eligible) {
      group.counts[UNSEEN_RULE_COUNT_KEY[lineage.rule]] += 1n;
      continue;
    }

    group.denominator += 1n;
    if (lifecycle.isCorrect) group.numerator += 1n;
  }
  return groups;
}

// Exact closed 21-key group row (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3.5).
// All keys required; `value` is the only nullable field.
function projectUnseenGroup(group, minimumSample) {
  const excludedCountBig = UNSEEN_EXCLUDED_COUNT_KEYS.reduce(
    (sum, key) => sum + group.counts[key],
    0n
  );
  const candidateCountBig = group.denominator + excludedCountBig;

  if (group.numerator > group.denominator) {
    throw new ContractViolationError('numerator exceeds denominator for a group');
  }

  const denominator = toSafeCount(group.denominator, 'denominator');
  const numerator = toSafeCount(group.numerator, 'numerator');
  const excludedCount = toSafeCount(excludedCountBig, 'excludedCount');
  const candidateCount = toSafeCount(candidateCountBig, 'candidateCount');
  const eligibleCount = denominator;

  const status = denominator >= minimumSample ? 'OK' : 'INSUFFICIENT';
  const value = status === 'OK' ? computeHalfUpRatio(group.numerator, group.denominator) : null;

  return {
    groupKey: group.groupKey,
    status,
    numerator,
    denominator,
    value,
    candidateCount,
    eligibleCount,
    excludedCount,
    missingCount: toSafeCount(group.counts.missingCount, 'missingCount'),
    technicalFailureCount: toSafeCount(group.counts.technicalFailureCount, 'technicalFailureCount'),
    withdrawnCount: toSafeCount(group.counts.withdrawnCount, 'withdrawnCount'),
    unscorableCount: toSafeCount(group.counts.unscorableCount, 'unscorableCount'),
    normalEmptyCount: toSafeCount(group.counts.normalEmptyCount, 'normalEmptyCount'),
    earlyCount: toSafeCount(group.counts.earlyCount, 'earlyCount'),
    lateCount: toSafeCount(group.counts.lateCount, 'lateCount'),
    supersededCount: toSafeCount(group.counts.supersededCount, 'supersededCount'),
    nonterminalCount: toSafeCount(group.counts.nonterminalCount, 'nonterminalCount'),
    postCutoffCompletionCount: toSafeCount(
      group.counts.postCutoffCompletionCount,
      'postCutoffCompletionCount'
    ),
    lineageNotDifferentCount: toSafeCount(
      group.counts.lineageNotDifferentCount,
      'lineageNotDifferentCount'
    ),
    noPriorNodeExposureCount: toSafeCount(
      group.counts.noPriorNodeExposureCount,
      'noPriorNodeExposureCount'
    ),
    sourceRebuildReference: {
      enrollmentIds: [...group.enrollmentIds].sort(),
      assignmentIds: [...group.assignmentIds].sort(),
      attemptIds: [...group.attemptIds].sort(),
      // Canonical lowercase UUID/string ordering -- deliberately NOT ordinal
      // ordering.
      exposureIds: [...group.exposureIds].sort(),
      evaluationIds: [...group.evaluationIds].sort(),
    },
  };
}

// Retention v1 ordering with the item-family identity inserted immediately
// after `nodeId` (EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3.5 "Ordering").
function compareUnseenGroups(a, b) {
  const left = a.groupKey;
  const right = b.groupKey;
  if (left.participantId !== right.participantId) {
    return left.participantId < right.participantId ? -1 : 1;
  }
  if (left.nodeId !== right.nodeId) return left.nodeId < right.nodeId ? -1 : 1;
  if (left.itemFamilyId !== right.itemFamilyId) {
    return left.itemFamilyId < right.itemFamilyId ? -1 : 1;
  }
  if (left.itemFamilyVersion !== right.itemFamilyVersion) {
    return left.itemFamilyVersion - right.itemFamilyVersion;
  }
  // DAY_7 before DAY_30.
  const timepointDelta = RETENTION_TARGET_TIMEPOINTS.indexOf(left.targetTimepoint)
    - RETENTION_TARGET_TIMEPOINTS.indexOf(right.targetTimepoint);
  if (timepointDelta !== 0) return timepointDelta;
  if (left.conditionId !== right.conditionId) return left.conditionId < right.conditionId ? -1 : 1;
  if (left.conditionVersion !== right.conditionVersion) {
    return left.conditionVersion - right.conditionVersion;
  }
  if (left.formulaId !== right.formulaId) return left.formulaId < right.formulaId ? -1 : 1;
  return left.formulaVersion - right.formulaVersion;
}

// Response-wide reference: the array-by-array set-union of the group
// references, canonicalized with the same ordering. Unlike Retention v1,
// `exposureIds` is not fixed to [].
function unionUnseenSourceRebuildReference(groups) {
  const enrollmentIds = new Set();
  const assignmentIds = new Set();
  const attemptIds = new Set();
  const exposureIds = new Set();
  const evaluationIds = new Set();
  for (const group of groups) {
    for (const id of group.sourceRebuildReference.enrollmentIds) enrollmentIds.add(id);
    for (const id of group.sourceRebuildReference.assignmentIds) assignmentIds.add(id);
    for (const id of group.sourceRebuildReference.attemptIds) attemptIds.add(id);
    for (const id of group.sourceRebuildReference.exposureIds) exposureIds.add(id);
    for (const id of group.sourceRebuildReference.evaluationIds) evaluationIds.add(id);
  }
  return {
    enrollmentIds: [...enrollmentIds].sort(),
    assignmentIds: [...assignmentIds].sort(),
    attemptIds: [...attemptIds].sort(),
    exposureIds: [...exposureIds].sort(),
    evaluationIds: [...evaluationIds].sort(),
  };
}

// ---------------------------------------------------------------------------
// Public operation.
// ---------------------------------------------------------------------------

async function runMetricResult(client, validated) {
  const { formulaId, formulaVersion, analysisCutoff, aggregationGrain, filters } = validated;

  // Transaction steps 1-3: exact FORMULA read, definitionVersion dispatch,
  // closed per-version FORMULA validation, grain compatibility. The metric
  // kind is decided here and nowhere else.
  const formulaRow = await fetchFormulaRow(client, formulaId, formulaVersion);
  const definitionVersion = readFormulaDefinitionVersion(formulaRow.definition);
  const { minimumSample, earlyToleranceMs, lateToleranceMs } = definitionVersion === 1
    ? validateClosedFormulaDefinitionV1(formulaRow.definition, aggregationGrain)
    : validateClosedFormulaDefinitionV2(formulaRow.definition, aggregationGrain);

  // Transaction step 4: filter existence validation (reuses this module's
  // RAW_SOURCE existence helpers -- already-open-client-only, no
  // transaction ownership of their own).
  await assertIdsExist(client, 'evidence_enrollments', 'enrollment_id', filters.enrollmentIds);
  await assertConditionReferencesExist(client, filters.conditionReferences);
  await assertNodeIdsExist(client, filters.nodeIds);
  await assertItemFamilyReferencesExist(client, filters.itemFamilyReferences);

  // Transaction step 5-6: candidate source selection + complete frozen
  // source projection.
  const qualifyingEnrollments = await selectQualifyingEnrollmentsForMetric(client, filters, analysisCutoff);
  const enrollmentMap = new Map(qualifyingEnrollments.map((row) => [row.enrollment_id, row]));
  const qualifyingEnrollmentIds = qualifyingEnrollments.map((row) => row.enrollment_id);

  const assignmentRows = await selectCandidateAssignments(
    client,
    qualifyingEnrollmentIds,
    filters,
    analysisCutoff
  );
  const populationEligibleAssignments = resolvePopulationEligibleAssignments(
    assignmentRows,
    formulaId,
    formulaVersion,
    filters.itemFamilyReferences
  );

  const nodeRows = await selectCandidateNodes(
    client,
    [...populationEligibleAssignments.keys()],
    filters.nodeIds
  );
  const candidates = buildMetricCandidates(
    nodeRows,
    populationEligibleAssignments,
    enrollmentMap,
    formulaId,
    formulaVersion
  );

  // Completion/timeliness detail is fetched (and therefore ever dereferenced
  // at all) only for cutoff-valid completed assignments -- POST_CUTOFF_
  // COMPLETION assignments never reach this query, so post-cutoff
  // attempt/evaluation provenance can never leak.
  const completionAssignmentIds = [...new Set(
    candidates
      .filter((c) => c.terminalOutcome === 'COMPLETED' && c.completedWithinCutoff)
      .map((c) => c.assignmentId)
  )];
  const completionDetailMap = await selectCompletionDetails(
    client,
    completionAssignmentIds,
    analysisCutoff,
    earlyToleranceMs,
    lateToleranceMs
  );

  // Node evaluations are looked up only for the ON_TIME + SCORABLE-attempt
  // branch that actually consumes them (rule 14 / eligible) -- the same
  // non-leakage discipline applied one stage earlier.
  const evaluationAttemptIds = [...new Set(
    [...completionDetailMap.values()]
      .filter((detail) => (
        !detail.is_early
        && !detail.is_late
        && detail.attempt_outcome === 'SCORABLE'
        && detail.response_kind !== 'NORMAL_EMPTY'
      ))
      .map((detail) => detail.completion_attempt_id)
  )];
  const evaluationMap = await selectEvaluationsForAttempts(client, evaluationAttemptIds, analysisCutoff);

  // Transaction step 7: in-memory reduction. Retention v1 reduces exactly as
  // before; Unseen Transfer v2 layers rules 15/16 and the lineage authority
  // validation on top of the same rule-1-14 classification.
  let groups;
  if (definitionVersion === 1) {
    groups = [...reduceMetricCandidates(candidates, completionDetailMap, evaluationMap).values()]
      .map((group) => projectMetricGroup(group, minimumSample))
      .sort(compareMetricGroups);
  } else {
    const unseenAccumulators = await reduceUnseenCandidates(
      client,
      candidates,
      completionDetailMap,
      evaluationMap
    );
    groups = [...unseenAccumulators.values()]
      .map((group) => projectUnseenGroup(group, minimumSample))
      .sort(compareUnseenGroups);
  }

  // Transaction step 8: invariant / status / provenance validation. Identical
  // for both versions -- `excludedCount` already carries the 10-bucket
  // (Retention) or 12-bucket (Unseen Transfer) sum of its own version.
  for (const group of groups) {
    if (group.eligibleCount !== group.denominator) {
      throw new ContractViolationError('eligibleCount does not equal denominator');
    }
    if (group.candidateCount !== group.eligibleCount + group.excludedCount) {
      throw new ContractViolationError('candidateCount does not equal eligibleCount + excludedCount');
    }
  }
  const status = groups.length > 0 && groups.every((group) => group.status === 'OK')
    ? 'OK'
    : 'INSUFFICIENT';

  return {
    formulaReference: {
      formulaId,
      formulaVersion,
      definitionDigest: formulaRow.definition_digest,
      digestAlgorithm: formulaRow.digest_algorithm,
      normalizationVersion: formulaRow.normalization_version,
    },
    analysisCutoff,
    aggregationGrain,
    filters,
    status,
    groups,
    sourceRebuildReference: definitionVersion === 1
      ? unionMetricSourceRebuildReference(groups)
      : unionUnseenSourceRebuildReference(groups),
  };
}

async function queryMetricResult(pool, input) {
  // Pure validation happens before any connection is taken.
  const validated = validateMetricResultInput(input);

  if (!pool || typeof pool.connect !== 'function') {
    throw new ContractViolationError('pool.connect is required');
  }

  const client = await pool.connect();
  try {
    // Single bounded transaction: REPEATABLE READ, READ ONLY. Exactly one
    // connection, exactly one transaction -- no nested RAW_SOURCE call, no
    // second pool transaction.
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
    const result = await runMetricResult(client, validated);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original failure. The caller needs the operation error.
    }
    throw mapDatabaseError(error, 'queryMetricResult');
  } finally {
    client.release();
  }
}

module.exports = {
  queryRawEvidenceForMetricRebuild,
  queryMetricResult,
};
