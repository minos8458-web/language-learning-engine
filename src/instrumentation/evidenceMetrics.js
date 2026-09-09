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
// VI P1 Measurement Readiness -- METRIC_RESULT / Retention v1 Runtime
// Synthetic P0 Query-Time Only.
//
// Implements the bounded METRIC_RESULT query contract:
//
//   queryMetricResult(pool, input)
//
// Canonical authority: API_CONTRACT.md §13.10.11.2,
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3.4 / §12.4.1 / Retention portion of
// §12.5 / §18.11.
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

function validateClosedFormulaDefinition(definition, requestedAggregationGrain) {
  // The legacy (unapproved) `populationPolicy` shape, and any other
  // unknown/missing/extra key, is rejected here: the required key set is
  // exact and closed.
  assertExactDefinitionKeys(definition, FORMULA_TOP_LEVEL_KEYS, 'formula');

  requireExactConstant(definition.definitionType, 'EVIDENCE_METRIC_FORMULA', 'formula.definitionType');
  requireExactConstant(definition.definitionVersion, 1, 'formula.definitionVersion');
  requireExactConstant(definition.executionScope, 'SYNTHETIC_P0', 'formula.executionScope');
  // definitionVersion 1 supports RETENTION only -- UNSEEN_TRANSFER
  // (F-MR-ARCH-06, OPEN/DEFERRED) remains unsupported: this exact-equality
  // check is what rejects it, not a separate UNSEEN_TRANSFER branch.
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
// Exact input validation/normalization (no DB).
// ---------------------------------------------------------------------------

function validateMetricAggregationGrainInput(value) {
  requireExactArrayConstant(value, REQUIRED_AGGREGATION_GRAIN, 'aggregationGrain');
  return REQUIRED_AGGREGATION_GRAIN.slice();
}

function validateMetricConditionReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((element, index) => {
    assertExactKeys(element, ['conditionId', 'conditionVersion'], `${fieldName}[${index}]`);
    return {
      conditionId: validateStableId(element.conditionId, `${fieldName}[${index}].conditionId`),
      conditionVersion: validateBoundedVersion(
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

function validateMetricItemFamilyReferenceArray(value, fieldName) {
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  const normalized = value.map((element, index) => {
    assertExactKeys(element, ['itemFamilyId', 'itemFamilyVersion'], `${fieldName}[${index}]`);
    return {
      itemFamilyId: validateStableId(element.itemFamilyId, `${fieldName}[${index}].itemFamilyId`),
      itemFamilyVersion: validateBoundedVersion(
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

function validateMetricFilters(rawFilters) {
  // `assignmentIds`/`attemptIds` are not in METRIC_FILTER_KEYS, so
  // supplying either is already rejected here as an unrecognized key
  // (CONTRACT_VIOLATION) -- no separate forbidden-key branch is needed.
  assertAllowedKeys(rawFilters, METRIC_FILTER_KEYS, 'filters');
  for (const key of METRIC_FILTER_KEYS) {
    requireField(rawFilters, key);
  }

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
       (a.due_at IS NOT NULL AND a.due_at <= $3::timestamptz) AS due_within_cutoff,
       (s.assignment_id IS NOT NULL) AS has_snapshot,
       (s.assignment_id IS NOT NULL AND s.created_at <= $3::timestamptz) AS snapshot_within_cutoff,
       s.formula_id,
       s.formula_version,
       s.item_family_id,
       s.item_family_version,
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
    if (!row.due_within_cutoff) continue; // not yet due

    eligible.set(row.assignment_id, {
      assignmentId: row.assignment_id,
      enrollmentId: row.enrollment_id,
      targetTimepoint: row.target_timepoint,
      terminalOutcome: row.terminal_outcome,
      supersededBy: row.superseded_by,
      completionAttemptId: row.completion_attempt_id,
      completedWithinCutoff: row.completed_within_cutoff,
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
      formulaId,
      formulaVersion,
    };
  });
}

// ---------------------------------------------------------------------------
// Completion integrity / timeliness projection.
// ---------------------------------------------------------------------------

// Timeliness and the completed_at/finalized_at equality check are computed
// entirely in SQL as exact TIMESTAMPTZ/INTERVAL comparisons -- never via a
// JS `Date` subtraction, which would truncate below millisecond precision
// and could move an exact boundary. `($ms::text || ' milliseconds')::interval`
// is an exact microsecond-integer interval for the safe-integer range this
// runtime accepts.
async function selectCompletionDetails(client, assignmentIds, analysisCutoff, earlyToleranceMs, lateToleranceMs) {
  if (assignmentIds.length === 0) return new Map();
  const { rows } = await client.query(
    `SELECT
       a.assignment_id,
       a.completion_attempt_id,
       (att.attempt_id IS NOT NULL) AS attempt_exists,
       att.assignment_id AS attempt_owner_assignment_id,
       (att.started_at IS NOT NULL AND att.started_at <= $2::timestamptz) AS attempt_started_within_cutoff,
       (fin.attempt_id IS NOT NULL) AS finalization_exists,
       (fin.finalized_at IS NOT NULL AND fin.finalized_at <= $2::timestamptz) AS finalized_within_cutoff,
       (a.completed_at = fin.finalized_at) AS completed_equals_finalized,
       fin.response_kind,
       fin.attempt_outcome,
       (fin.finalized_at < (a.due_at - ($3::text || ' milliseconds')::interval)) AS is_early,
       (fin.finalized_at > (a.due_at + ($4::text || ' milliseconds')::interval)) AS is_late
     FROM evidence_assignments a
     LEFT JOIN evidence_attempts att ON att.attempt_id = a.completion_attempt_id
     LEFT JOIN evidence_attempt_finalizations fin ON fin.attempt_id = a.completion_attempt_id
    WHERE a.assignment_id = ANY($1::uuid[])`,
    [assignmentIds, analysisCutoff, String(earlyToleranceMs), String(lateToleranceMs)]
  );
  const map = new Map();
  for (const row of rows) {
    map.set(row.assignment_id, row);
  }
  return map;
}

async function selectEvaluationsForAttempts(client, attemptIds) {
  if (attemptIds.length === 0) return new Map();
  const { rows } = await client.query(
    `SELECT evaluation_id, attempt_id, node_id, scorable, is_correct
       FROM evidence_target_node_evaluations
      WHERE attempt_id = ANY($1::uuid[])`,
    [attemptIds]
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

// ---------------------------------------------------------------------------
// Public operation.
// ---------------------------------------------------------------------------

async function runMetricResult(client, validated) {
  const { formulaId, formulaVersion, analysisCutoff, aggregationGrain, filters } = validated;

  // Transaction steps 1-3: exact FORMULA read, closed FORMULA validation,
  // grain compatibility.
  const formulaRow = await fetchFormulaRow(client, formulaId, formulaVersion);
  const { minimumSample, earlyToleranceMs, lateToleranceMs } = validateClosedFormulaDefinition(
    formulaRow.definition,
    aggregationGrain
  );

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
  const evaluationMap = await selectEvaluationsForAttempts(client, evaluationAttemptIds);

  // Transaction step 7: in-memory Retention reduction.
  const groupAccumulators = reduceMetricCandidates(candidates, completionDetailMap, evaluationMap);
  const groups = [...groupAccumulators.values()]
    .map((group) => projectMetricGroup(group, minimumSample))
    .sort(compareMetricGroups);

  // Transaction step 8: invariant / status / provenance validation.
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
    sourceRebuildReference: unionMetricSourceRebuildReference(groups),
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
