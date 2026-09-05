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
  assertExactKeys,
  requireField,
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

module.exports = {
  queryRawEvidenceForMetricRebuild,
};
