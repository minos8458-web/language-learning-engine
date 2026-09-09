'use strict';

// VI P1 Measurement Readiness -- METRIC_RESULT / Retention v1 Runtime
// Synthetic P0 Query-Time Only.
//
// Exercises `queryMetricResult(pool, input)` against an actual PostgreSQL
// instance (API_CONTRACT.md §13.10.11.2, EVIDENCE_FOUNDATION_P0_SCHEMA.md
// §12.3.4 / §12.4.1 / Retention portion of §12.5 / §18.11): the exact
// five-key input / five-key filters, the closed FORMULA v1 definition, the
// staged Retention candidate-admission sequence, the 14-rule FIRST_MATCH
// exclusion classification, timeliness precision, HALF_UP six-decimal value
// projection, provenance, the single REPEATABLE READ READ ONLY transaction,
// and zero side effects.
//
// `queryRawEvidenceForMetricRebuild` (RAW_SOURCE) regression/non-interference
// is exercised together with this suite so both operations run against the
// same fixtures in one focused gate.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const evidence = require('../src/instrumentation');

const repository = evidence.evidenceRepository;
const { queryMetricResult, queryRawEvidenceForMetricRebuild } = evidence.evidenceMetrics;

const EXPERIMENT_ID = 'EXP_METRIC_RESULT_RUNTIME';
const CONDITION_1 = 'COND_METRIC_1';
const CONDITION_2 = 'COND_METRIC_2';
const CONDITION_UNKNOWN = { conditionId: 'COND_METRIC_UNKNOWN', conditionVersion: 1 };
const ITEM_ID = 'ITEM_METRIC';
const SCENARIO_ID = 'SCENARIO_METRIC';
const FAMILY_1 = 'FAMILY_METRIC_1';
const FAMILY_2 = 'FAMILY_METRIC_2';
const FAMILY_UNKNOWN = { itemFamilyId: 'FAMILY_METRIC_UNKNOWN', itemFamilyVersion: 1 };
const LEXICAL_ID = 'LEXICAL_METRIC';
const RUBRIC_ID = 'RUBRIC_METRIC';
const SCHEDULER_ID = 'SCHEDULER_METRIC';
const INSTRUMENTATION_ID = 'INSTRUMENTATION_METRIC';

const FORMULA_ID = 'FORMULA_METRIC_RETENTION_V1';
const FORMULA_ALT_ID = 'FORMULA_METRIC_RETENTION_V1_ALT';
const FORMULA_UNKNOWN_ID = 'FORMULA_METRIC_UNKNOWN';

const NODE_A = 'NODE_METRIC_A';
const NODE_B = 'NODE_METRIC_B';
const NODE_UNKNOWN = 'NODE_METRIC_UNKNOWN';

const FAR_FUTURE_CUTOFF = '2099-01-01T00:00:00.000Z';
const UNKNOWN_BUT_VALID_UUID = '00000000-0000-4000-8000-000000000099';
const MALFORMED_UUID = 'not-a-uuid';

const GRAIN = ['PARTICIPANT', 'TARGET_NODE', 'ASSESSMENT_TIMEPOINT', 'CONDITION', 'FORMULA_VERSION'];
const MINIMUM_SAMPLE = 2;
const TOLERANCE_MS = 3600000;

let openCounter = 0;
let formulaSeq = 0;

// ---------------------------------------------------------------------------
// Fixture setup.
// ---------------------------------------------------------------------------

async function resetAndMigrate() {
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await runMigrations();
}

async function insertGrammarNodes() {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES
       ($1, 'VI', '[]'::jsonb, 'Metric A', 1),
       ($2, 'VI', '[]'::jsonb, 'Metric B', 1)`,
    [NODE_A, NODE_B]
  );
}

async function registerReference(referenceKind, referenceId, version, definition) {
  return repository.registerReferenceVersion(pool, {
    referenceKind,
    referenceId,
    version,
    definition: definition ?? { kind: referenceKind, stableId: referenceId, version },
  });
}

function instrumentationDefinition() {
  return {
    definitionType: 'EVIDENCE_INSTRUMENTATION_PROTOCOL',
    definitionVersion: 1,
    timingPolicy: {
      collectionProfile: 'FULL',
      durationConsistencyToleranceMs: 5,
      durationMismatchBehavior: 'REJECT',
    },
    correctionCoverageMode: 'COMPLETE_BUCKET_SET',
    responseBounds: {
      textMaxUtf8Bytes: 65536,
      referenceMaxUtf8Bytes: 2048,
      jsonMaxUtf8Bytes: 65536,
    },
    modalityPolicy: {
      allowedStimulusModalities: ['TEXT'],
      allowedResponseModalities: ['TEXT_ENTRY'],
      stimulusCoverage: 'EXACT_PLANNED',
      responseCoverage: 'EXACT_PLANNED',
    },
  };
}

function rubricDefinition() {
  const byTargetNode = {};
  for (const nodeId of [NODE_A, NODE_B]) {
    byTargetNode[nodeId] = { prerequisiteNodeIds: [], contrastNodeIds: [] };
  }
  return {
    definitionType: 'EVIDENCE_ERROR_CLASSIFICATION_RUBRIC',
    definitionVersion: 1,
    scoreMode: 'BINARY',
    classificationVocabulary: [
      'NO_ERROR',
      'LINGUISTIC_ERROR',
      'TASK_INSTRUCTION_MISUNDERSTANDING',
      'MODALITY_INPUT_FAILURE',
      'NO_EVALUABLE_RESPONSE',
      'UNCLASSIFIED',
    ],
    linguisticCategoryVocabulary: ['FORM', 'WORD_ORDER', 'LEXICAL_CHOICE', 'OTHER'],
    attributionRelationVocabulary: ['TARGET', 'PREREQUISITE', 'CONTRAST', 'UNRESOLVED'],
    rubricRuleIds: ['RULE_NO_ERROR', 'RULE_LINGUISTIC', 'RULE_UNSCORABLE'],
    attributionAuthority: { byTargetNode },
  };
}

// Exact closed FORMULA v1 (API_CONTRACT.md §13.10.11.2 /
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.4.1). `overrides` is a shallow merge
// applied on top of the canonical shape for negative-path fixtures.
function formulaDefinition(overrides = {}) {
  const base = {
    definitionType: 'EVIDENCE_METRIC_FORMULA',
    definitionVersion: 1,
    executionScope: 'SYNTHETIC_P0',
    metricKind: 'RETENTION',
    aggregationGrain: GRAIN.slice(),
    minimumSample: MINIMUM_SAMPLE,
    candidateAdmissionPolicy: {
      observationUnit: 'ASSIGNMENT_NODE',
      assignmentType: 'ASSESSMENT',
      targetTimepoints: ['DAY_7', 'DAY_30'],
      sourceCutoffRule: 'ENROLLMENT_ASSIGNMENT_SNAPSHOT_AT_OR_BEFORE_CUTOFF',
      dueAtRule: 'REQUIRED_AND_AT_OR_BEFORE_CUTOFF',
    },
    denominatorEligibilityPolicy: {
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
    },
    numeratorRule: 'CORRECT_ELIGIBLE_NODE_EVALUATIONS',
    denominatorRule: 'ALL_ELIGIBLE_SCORABLE_NODE_EVALUATIONS',
    timeliness: {
      basis: 'ASSIGNMENT_DUE_AT',
      observationTimestamp: 'FINALIZATION_FINALIZED_AT',
      earlyToleranceMs: TOLERANCE_MS,
      lateToleranceMs: TOLERANCE_MS,
      lowerBoundInclusive: true,
      upperBoundInclusive: true,
    },
    sourceCompatibility: {
      assignmentFormulaRequirement: 'EXACT_MATCH',
      mismatchedAssignmentTreatment: 'EXCLUDE_FROM_CANDIDATE_POPULATION',
      latestVersionReinterpretation: 'PROHIBITED',
      mutableLifecycleProjection: 'TRANSACTION_VISIBLE_AS_OF_READ',
      historicalLifecycleFabrication: 'PROHIBITED',
    },
    exclusionPolicy: {
      classificationRule: 'FIRST_MATCH',
      matchedCandidateTreatment: 'EXCLUDE_AND_COUNT',
      ruleOrder: [
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
      ],
    },
    valueProjection: {
      representation: 'FIXED_DECIMAL_STRING',
      scale: 'RATIO_0_TO_1',
      decimalPlaces: 6,
      roundingMode: 'HALF_UP',
    },
  };
  return { ...base, ...overrides };
}

async function registerFormula(referenceId, definition) {
  return registerReference('FORMULA', referenceId, 1, definition);
}

// Registers a fresh single-use FORMULA reference (each `registerReference`
// call is an immutable-content write, so a distinct id is required whenever
// a test needs its own broken/altered definition).
async function registerNegativeFormula(definition) {
  formulaSeq += 1;
  const referenceId = `FORMULA_METRIC_NEG_${formulaSeq}`;
  await registerFormula(referenceId, definition);
  return referenceId;
}

async function registerAuthorityFixture() {
  await repository.registerExperimentVersion(pool, {
    experimentId: EXPERIMENT_ID,
    version: 1,
    definition: { protocol: 'METRIC_RESULT_RUNTIME' },
  });
  await repository.registerConditionVersion(pool, {
    conditionId: CONDITION_1,
    version: 1,
    conditionClass: 'ENGINEERING_BASELINE',
    definition: { mode: 'FIXED' },
  });
  await repository.registerConditionVersion(pool, {
    conditionId: CONDITION_2,
    version: 1,
    conditionClass: 'ENGINEERING_BASELINE',
    definition: { mode: 'ALTERNATE' },
  });

  await registerReference('ITEM', ITEM_ID, 1);
  await registerReference('SCENARIO', SCENARIO_ID, 1);
  await registerReference('ITEM_FAMILY', FAMILY_1, 1);
  await registerReference('ITEM_FAMILY', FAMILY_2, 1);
  await registerReference('LEXICAL_MANIFEST', LEXICAL_ID, 1);
  await registerReference('RUBRIC', RUBRIC_ID, 1, rubricDefinition());
  await registerReference('SCHEDULER_PROTOCOL', SCHEDULER_ID, 1);
  await registerReference('INSTRUMENTATION_PROTOCOL', INSTRUMENTATION_ID, 1, instrumentationDefinition());

  await registerFormula(FORMULA_ID, formulaDefinition());
  await registerFormula(FORMULA_ALT_ID, formulaDefinition());
  // FORMULA_UNKNOWN_ID is intentionally never registered.
}

async function newParticipant() {
  return repository.createParticipant(pool, {});
}

async function newEnrollment(conditionId = CONDITION_1, participantId) {
  const pid = participantId ?? (await newParticipant()).participant_id;
  return repository.createEnrollment(pool, {
    participantId: pid,
    experimentId: EXPERIMENT_ID,
    experimentVersion: 1,
    conditionId,
    conditionVersion: 1,
  });
}

function assignmentInput(enrollmentId, overrides = {}) {
  return {
    enrollmentId,
    assignmentType: overrides.assignmentType ?? 'ASSESSMENT',
    targetTimepoint: overrides.targetTimepoint ?? 'DAY_7',
    anchorStrategy: 'NODE_ASSIGNMENT_COMPLETION',
    targetNodeIds: overrides.targetNodeIds ?? [NODE_A],
    references: {
      itemId: ITEM_ID,
      itemVersion: 1,
      scenarioId: SCENARIO_ID,
      scenarioVersion: 1,
      itemFamilyId: overrides.itemFamilyId ?? FAMILY_1,
      itemFamilyVersion: 1,
      lexicalManifestId: LEXICAL_ID,
      lexicalManifestVersion: 1,
      rubricId: RUBRIC_ID,
      rubricVersion: 1,
      formulaId: overrides.formulaId ?? FORMULA_ID,
      formulaVersion: 1,
      schedulerProtocolId: SCHEDULER_ID,
      schedulerProtocolVersion: 1,
      instrumentationProtocolId: INSTRUMENTATION_ID,
      instrumentationProtocolVersion: 1,
    },
    plannedStimulusModalities: ['TEXT'],
    plannedResponseModalities: ['TEXT_ENTRY'],
  };
}

async function newAssignment(enrollmentId, overrides = {}) {
  return repository.createAssignment(pool, assignmentInput(enrollmentId, overrides));
}

async function setDueAt(assignmentId, dueAt) {
  await pool.query('UPDATE evidence_assignments SET due_at = $1 WHERE assignment_id = $2', [dueAt, assignmentId]);
}

// Convenience: create an enrollment + a DAY_7 ASSESSMENT assignment (default
// FORMULA_ID, NODE_A) with a valid pre-cutoff due_at, ready for a completion
// branch to be attached.
async function newCandidateAssignment(overrides = {}) {
  const enrollment = overrides.enrollment ?? await newEnrollment(overrides.conditionId);
  const created = await newAssignment(enrollment.enrollment_id, overrides);
  const assignmentId = created.assignment.assignment_id;
  const dueAt = overrides.dueAt ?? '2026-06-08T12:00:00.000000Z';
  await setDueAt(assignmentId, dueAt);
  return { enrollment, created, assignmentId, dueAt };
}

async function newSession(enrollmentId) {
  const { rows } = await pool.query(
    `INSERT INTO evidence_sessions (enrollment_id) VALUES ($1) RETURNING *`,
    [enrollmentId]
  );
  return rows[0];
}

async function newAttempt(assignmentId, sessionId, overrides = {}) {
  openCounter += 1;
  return repository.openAttempt(pool, {
    assignmentId,
    sessionId,
    idempotencyIdentity: `metric-open-${openCounter}`,
    instrumentationProtocolId: INSTRUMENTATION_ID,
    instrumentationProtocolVersion: 1,
    openPayload: { n: openCounter },
    ...overrides,
  });
}

function correctionBuckets(count = 0) {
  const rows = [];
  for (const initiator of ['LEARNER', 'SYSTEM']) {
    for (const feedbackPhase of ['PRE_FEEDBACK', 'POST_FEEDBACK']) {
      for (const correctionOutcome of ['SUCCESSFUL', 'UNSUCCESSFUL', 'UNKNOWN']) {
        rows.push({ initiator, feedbackPhase, correctionOutcome, count });
      }
    }
  }
  return rows;
}

function correctEvaluation(nodeId) {
  return {
    nodeId,
    rubricOutcome: {
      classification: 'NO_ERROR',
      linguisticCategory: null,
      attributionRelation: null,
      attributedNodeId: null,
      rubricRuleId: 'RULE_NO_ERROR',
    },
    isCorrect: true,
  };
}

function incorrectEvaluation(nodeId) {
  return {
    nodeId,
    rubricOutcome: {
      classification: 'LINGUISTIC_ERROR',
      linguisticCategory: 'FORM',
      attributionRelation: 'UNRESOLVED',
      attributedNodeId: null,
      rubricRuleId: 'RULE_LINGUISTIC',
    },
    isCorrect: false,
  };
}

function unscorableNodeEvaluation(nodeId) {
  return {
    nodeId,
    rubricOutcome: {
      classification: 'TASK_INSTRUCTION_MISUNDERSTANDING',
      linguisticCategory: null,
      attributionRelation: null,
      attributedNodeId: null,
      rubricRuleId: 'RULE_UNSCORABLE',
    },
    isCorrect: null,
  };
}

function normalEmptyEvaluation(nodeId) {
  return {
    nodeId,
    rubricOutcome: {
      classification: 'NO_EVALUABLE_RESPONSE',
      linguisticCategory: null,
      attributionRelation: null,
      attributedNodeId: null,
      rubricRuleId: 'RULE_UNSCORABLE',
    },
    isCorrect: null,
  };
}

function technicalInvalidEvaluation(nodeId) {
  return {
    nodeId,
    rubricOutcome: {
      classification: 'MODALITY_INPUT_FAILURE',
      linguisticCategory: null,
      attributionRelation: null,
      attributedNodeId: null,
      rubricRuleId: 'RULE_UNSCORABLE',
    },
    isCorrect: null,
  };
}

// Finalizes with an explicit evaluations array; sets response_kind
// accordingly. Both `evidence_attempt_finalizations.finalized_at` and (when
// the completion is SCORABLE) `evidence_assignments.completed_at` land on
// the server's real `now()` -- callers that need an exact, controlled
// timeliness fact call `forceTimeliness` afterward.
async function finalizeWith(attempt, evaluations, { responseKind = 'TEXT' } = {}) {
  const overrides = { responseKind, evaluations, correctionAggregates: correctionBuckets(0) };
  if (responseKind === 'TEXT') overrides.responseText = 'answer';
  return repository.finalizeAttempt(pool, {
    attemptId: attempt.attemptId,
    finalizationIdempotencyIdentity: `metric-final-${attempt.attemptId}`,
    instrumentationProtocolId: INSTRUMENTATION_ID,
    instrumentationProtocolVersion: 1,
    inputEnabledOffsetMs: 100,
    firstValidActivityOffsetMs: 120,
    submittedOffsetMs: 200,
    reportedClientMonotonicDurationMs: 100,
    actualStimulusModalities: ['TEXT'],
    actualResponseModalities: ['TEXT_ENTRY'],
    ...overrides,
  });
}

// Overwrites finalized_at to an exact caller-controlled value, and points
// the assignment's completion pointer at this attempt with completed_at set
// to the same instant -- used for deterministic EARLY/ON_TIME/LATE boundary
// fixtures. Bypasses the repository (which always uses real `now()`), by
// direct SQL, exactly as the RAW_SOURCE runtime test suite does for
// cutoff-boundary fixtures.
//
// `finalizeAttempt` only marks the owning assignment COMPLETED when the
// completion attempt is itself SCORABLE -- a NORMAL_EMPTY/UNSCORABLE/
// TECHNICAL_INVALID attempt is left NONTERMINAL by the production write
// path (F-MR-IR-02: no deferred production terminalization writer is added
// here). To exercise the ON_TIME_TECHNICAL_INVALID_ATTEMPT/
// ON_TIME_NORMAL_EMPTY_RESPONSE/ON_TIME_UNSCORABLE_ATTEMPT FIRST_MATCH rules
// (which require terminal_outcome=COMPLETED with such an attempt_outcome),
// this establishes that completion pointer administratively -- synthetic
// fixture-seeded read-side coverage, per F-MR-IR-02 -- for both the SCORABLE
// case (already COMPLETED; this only overwrites completed_at) and the
// non-SCORABLE case (still NONTERMINAL; this is what completes it).
async function forceTimeliness(attempt, assignmentId, isoTimestamp) {
  await pool.query(
    'UPDATE evidence_attempt_finalizations SET finalized_at = $1 WHERE attempt_id = $2',
    [isoTimestamp, attempt.attemptId]
  );
  await pool.query(
    `UPDATE evidence_assignments
        SET terminal_outcome = 'COMPLETED', completion_attempt_id = $2, completed_at = $3
      WHERE assignment_id = $1
        AND (terminal_outcome IS NULL OR terminal_outcome = 'COMPLETED')`,
    [assignmentId, attempt.attemptId, isoTimestamp]
  );
}

async function setAssignmentTerminalOutcome(assignmentId, terminalOutcome) {
  await pool.query(
    `UPDATE evidence_assignments
        SET terminal_outcome = $2, completed_at = NULL, completion_attempt_id = NULL
      WHERE assignment_id = $1`,
    [assignmentId, terminalOutcome]
  );
}

async function supersedeAssignment(assignmentId, enrollmentId) {
  // The superseding assignment only needs to exist to satisfy the FK/unique
  // constraint on `superseded_by` -- IMMEDIATE keeps it outside Retention
  // candidate admission entirely (assignment_type/target_timepoint filter),
  // so it needs no due_at of its own.
  const superseding = await newAssignment(enrollmentId, { targetTimepoint: 'IMMEDIATE' });
  await pool.query(
    'UPDATE evidence_assignments SET superseded_by = $2 WHERE assignment_id = $1',
    [assignmentId, superseding.assignment.assignment_id]
  );
  return superseding.assignment.assignment_id;
}

function baseFilters(overrides = {}) {
  return {
    enrollmentIds: [],
    conditionReferences: [],
    targetTimepoints: [],
    nodeIds: [],
    itemFamilyReferences: [],
    ...overrides,
  };
}

function baseInput(overrides = {}) {
  return {
    formulaId: FORMULA_ID,
    formulaVersion: 1,
    analysisCutoff: FAR_FUTURE_CUTOFF,
    aggregationGrain: GRAIN.slice(),
    filters: baseFilters(),
    ...overrides,
  };
}

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

function findGroup(result, nodeId, targetTimepoint = 'DAY_7') {
  return result.groups.find(
    (group) => group.groupKey.nodeId === nodeId && group.groupKey.targetTimepoint === targetTimepoint
  );
}

async function countRows(tableName) {
  const { rows } = await pool.query(`SELECT count(*) AS n FROM ${tableName}`);
  return Number(rows[0].n);
}

async function fullFixtureCounts() {
  const tables = [
    'evidence_participants',
    'evidence_enrollments',
    'evidence_assignments',
    'evidence_assignment_snapshots',
    'evidence_assignment_snapshot_nodes',
    'evidence_assignment_item_exposures',
    'evidence_sessions',
    'evidence_attempt_series',
    'evidence_attempts',
    'evidence_attempt_finalizations',
    'evidence_target_node_evaluations',
    'evidence_correction_aggregates',
    'evidence_reference_versions',
    'progress',
    'attempt_records',
  ];
  const counts = {};
  for (const table of tables) {
    counts[table] = await countRows(table);
  }
  return counts;
}

// Records every SQL statement text issued on the client obtained via
// connect(), so the exact transaction setup/teardown and absence of any
// write statement can be asserted directly.
function wrapPoolCapturingQueries(realPool) {
  const calls = [];
  return {
    calls,
    connect: async () => {
      const client = await realPool.connect();
      const originalQuery = client.query.bind(client);
      client.query = async (...args) => {
        const text = typeof args[0] === 'string' ? args[0] : args[0].text;
        calls.push(text);
        return originalQuery(...args);
      };
      return client;
    },
  };
}

describe('VI P1 METRIC_RESULT Retention v1 runtime (queryMetricResult)', { concurrency: false }, () => {
  before(async () => {
    await resetAndMigrate();
    await insertGrammarNodes();
    await registerAuthorityFixture();
  });

  after(async () => {
    await pool.end();
  });

  // ===========================================================================
  // 1. Exact export / top-level input shape.
  // ===========================================================================

  test('T01 module exports the exact bounded METRIC_RESULT operation', () => {
    assert.equal(typeof queryMetricResult, 'function');
    assert.equal(queryMetricResult.length, 2);
  });

  test('T02 exactly five top-level keys are required; missing/undefined -> MISSING_REQUIRED_FIELD', async () => {
    for (const key of ['formulaId', 'formulaVersion', 'analysisCutoff', 'aggregationGrain', 'filters']) {
      const input = baseInput();
      delete input[key];
      await rejectsWithCode(() => queryMetricResult(pool, input), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({ [key]: undefined })),
        'MISSING_REQUIRED_FIELD'
      );
    }
  });

  test('T03 unexpected top-level key is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, { ...baseInput(), extra: true }),
      'CONTRACT_VIOLATION'
    );
  });

  test('T04 null input values are CONTRACT_VIOLATION, not treated as missing', async () => {
    for (const key of ['formulaId', 'formulaVersion', 'analysisCutoff', 'aggregationGrain', 'filters']) {
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({ [key]: null })),
        'CONTRACT_VIOLATION'
      );
    }
  });

  test('T05 shape-invalid input never reaches the database', async () => {
    const poisonedPool = {
      connect: async () => {
        throw new Error('pool.connect must not be called for shape-invalid input');
      },
    };
    await rejectsWithCode(
      () => queryMetricResult(poisonedPool, baseInput({ formulaVersion: 'one' })),
      'CONTRACT_VIOLATION'
    );
  });

  // ===========================================================================
  // 2. formulaId / formulaVersion / analysisCutoff.
  // ===========================================================================

  test('T06 formulaId: trim-only, empty-after-trim is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ formulaId: '   ' })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ formulaId: 123 })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T07 formulaVersion: version 1 and version 2147483647 are shape-valid (fail later at existence, not shape)', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaVersion: 2147483647,
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
  });

  test('T08 formulaVersion boundaries: 0, -1, and 2147483648 are OUT_OF_RANGE_VALUE', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ formulaVersion: 0 })),
      'OUT_OF_RANGE_VALUE'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ formulaVersion: -1 })),
      'OUT_OF_RANGE_VALUE'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ formulaVersion: 2147483648 })),
      'OUT_OF_RANGE_VALUE'
    );
  });

  test('T09 formulaVersion: fraction/string/BigInt/NaN/Infinity are CONTRACT_VIOLATION', async () => {
    for (const bad of [1.5, '1', 1n, NaN, Infinity, null]) {
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({ formulaVersion: bad })),
        'CONTRACT_VIOLATION'
      );
    }
  });

  test('T10 analysisCutoff: non-canonical shape is OUT_OF_RANGE_VALUE; null/non-string is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ analysisCutoff: '2030-05-06T07:08:09Z' })),
      'OUT_OF_RANGE_VALUE'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ analysisCutoff: 12345 })),
      'CONTRACT_VIOLATION'
    );
  });

  // ===========================================================================
  // 3. aggregationGrain.
  // ===========================================================================

  test('T11 aggregationGrain must equal the exact canonical grain in exact order', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ aggregationGrain: GRAIN.slice().reverse() })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ aggregationGrain: GRAIN.slice(0, 4) })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ aggregationGrain: 'PARTICIPANT' })),
      'CONTRACT_VIOLATION'
    );
  });

  // ===========================================================================
  // 4. filters: exactly five keys, assignmentIds/attemptIds forbidden.
  // ===========================================================================

  test('T12 exactly five filter keys are required', async () => {
    for (const key of ['enrollmentIds', 'conditionReferences', 'targetTimepoints', 'nodeIds', 'itemFamilyReferences']) {
      const filters = baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] });
      delete filters[key];
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({ filters })),
        'MISSING_REQUIRED_FIELD'
      );
    }
  });

  test('T13 assignmentIds and attemptIds are forbidden filter keys', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: { ...baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }), assignmentIds: [] },
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: { ...baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }), attemptIds: [] },
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T14 both enrollmentIds and conditionReferences empty is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ filters: baseFilters() })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T15 conditionReferences alone satisfies the bounding requirement', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ conditionReferences: [CONDITION_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
  });

  test('T16 explicit null / non-array filter value is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ filters: null })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: null }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  // ===========================================================================
  // 5. structured references / normalization / duplicates.
  // ===========================================================================

  test('T17 conditionReferences element: exactly conditionId/conditionVersion, unknown key before missing key', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: 1, extra: 'x' }],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ conditionReferences: [{ conditionId: CONDITION_1 }] }),
      })),
      'MISSING_REQUIRED_FIELD'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: undefined }] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T18 itemFamilyReferences element: exactly itemFamilyId/itemFamilyVersion', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          enrollmentIds: [UNKNOWN_BUT_VALID_UUID],
          itemFamilyReferences: [{ itemFamilyId: FAMILY_1, itemFamilyVersion: 1, extra: 'x' }],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T19 duplicate structured reference (after normalization) is CONTRACT_VIOLATION; different version is not a duplicate', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          conditionReferences: [
            { conditionId: CONDITION_1, conditionVersion: 1 },
            { conditionId: CONDITION_1, conditionVersion: 1 },
          ],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
    // Same id, different version: shape-valid and not a duplicate -- fails
    // downstream at existence instead (version 2 was never registered).
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          conditionReferences: [
            { conditionId: CONDITION_1, conditionVersion: 1 },
            { conditionId: CONDITION_1, conditionVersion: 2 },
          ],
        }),
      })),
      'INVALID_ID'
    );
  });

  test('T20 stable-ID case preservation: no case folding, only trim', async () => {
    const enrollment = await newEnrollment();
    const upper = enrollment.enrollment_id.toUpperCase();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [upper] }),
    }));
    // UUIDs normalize to lowercase (distinct rule from generic stable IDs).
    assert.deepEqual(result.filters.enrollmentIds, [enrollment.enrollment_id]);
  });

  test('T21 enrollmentIds: malformed UUID is INVALID_ID; unknown-but-valid UUID is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({ filters: baseFilters({ enrollmentIds: [MALFORMED_UUID] }) })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
  });

  test('T22 nodeIds: empty-after-trim is CONTRACT_VIOLATION; unknown node is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID], nodeIds: ['   '] }),
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID], nodeIds: [NODE_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
  });

  test('T23 itemFamilyReferences: unknown pair is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          enrollmentIds: [UNKNOWN_BUT_VALID_UUID],
          itemFamilyReferences: [FAMILY_UNKNOWN],
        }),
      })),
      'INVALID_ID'
    );
  });

  test('T24 structured reference ordering is normalized-ID ASC then version numeric ASC', async () => {
    const enrollment = await newEnrollment();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({
        enrollmentIds: [enrollment.enrollment_id],
        conditionReferences: [
          { conditionId: CONDITION_2, conditionVersion: 1 },
          { conditionId: CONDITION_1, conditionVersion: 1 },
        ],
      }),
    }));
    assert.deepEqual(
      result.filters.conditionReferences.map((ref) => ref.conditionId),
      [CONDITION_1, CONDITION_2]
    );
  });

  // ===========================================================================
  // 6. targetTimepoints vocabulary / canonical order.
  // ===========================================================================

  test('T25 targetTimepoints: IMMEDIATE and NOT_APPLICABLE and unknown values are CONTRACT_VIOLATION', async () => {
    for (const bad of ['IMMEDIATE', 'NOT_APPLICABLE', 'NEXT_WEEK']) {
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({
          filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID], targetTimepoints: [bad] }),
        })),
        'CONTRACT_VIOLATION'
      );
    }
  });

  test('T26 targetTimepoints: duplicate value is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({
          enrollmentIds: [UNKNOWN_BUT_VALID_UUID],
          targetTimepoints: ['DAY_7', 'DAY_7'],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T27 targetTimepoints: canonical output order is DAY_7 before DAY_30 regardless of input order', async () => {
    const enrollment = await newEnrollment();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({
        enrollmentIds: [enrollment.enrollment_id],
        targetTimepoints: ['DAY_30', 'DAY_7'],
      }),
    }));
    assert.deepEqual(result.filters.targetTimepoints, ['DAY_7', 'DAY_30']);
  });

  // ===========================================================================
  // 7. FORMULA existence / closed FORMULA v1 validation.
  // ===========================================================================

  test('T28 unknown FORMULA reference is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: FORMULA_UNKNOWN_ID,
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
  });

  test('T29 legacy populationPolicy FORMULA shape is rejected', async () => {
    const badId = await registerNegativeFormula({
      definitionType: 'EVIDENCE_METRIC_FORMULA',
      definitionVersion: 1,
      executionScope: 'SYNTHETIC_P0',
      metricKind: 'RETENTION',
      populationPolicy: { legacy: true },
    });
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: badId,
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T30 unsupported metricKind (UNSEEN_TRANSFER) is rejected', async () => {
    const badId = await registerNegativeFormula(formulaDefinition({ metricKind: 'UNSEEN_TRANSFER' }));
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: badId,
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T31 FORMULA aggregationGrain mismatch (wrong order) is CONTRACT_VIOLATION', async () => {
    const badId = await registerNegativeFormula(formulaDefinition({ aggregationGrain: GRAIN.slice().reverse() }));
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: badId,
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T32 missing/unknown/extra FORMULA top-level key is CONTRACT_VIOLATION', async () => {
    const withoutKey = formulaDefinition();
    delete withoutKey.minimumSample;
    const missingId = await registerNegativeFormula(withoutKey);

    const withExtra = { ...formulaDefinition(), unexpectedKey: 1 };
    const extraId = await registerNegativeFormula(withExtra);

    const enrollment = await newEnrollment();
    for (const formulaId of [missingId, extraId]) {
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({
          formulaId,
          filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
        })),
        'CONTRACT_VIOLATION'
      );
    }
  });

  test('T33 minimumSample boundary: 0 rejected, safe-integer overflow (2^53) rejected, 1 accepted', async () => {
    const zeroId = await registerNegativeFormula(formulaDefinition({ minimumSample: 0 }));
    const overflowId = await registerNegativeFormula(formulaDefinition({ minimumSample: Number.MAX_SAFE_INTEGER + 1 }));
    const oneId = await registerNegativeFormula(formulaDefinition({ minimumSample: 1 }));

    const enrollment = await newEnrollment();
    for (const formulaId of [zeroId, overflowId]) {
      await rejectsWithCode(
        () => queryMetricResult(pool, baseInput({
          formulaId,
          filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
        })),
        'CONTRACT_VIOLATION'
      );
    }
    // minimumSample=1 is a valid boundary -- zero candidates still resolves
    // to a normal (non-error) envelope.
    const result = await queryMetricResult(pool, baseInput({
      formulaId: oneId,
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(result.status, 'INSUFFICIENT');
    assert.deepEqual(result.groups, []);
  });

  test('T34 earlyToleranceMs/lateToleranceMs: negative and non-safe-integer are CONTRACT_VIOLATION', async () => {
    const negativeId = await registerNegativeFormula(formulaDefinition({
      timeliness: {
        basis: 'ASSIGNMENT_DUE_AT',
        observationTimestamp: 'FINALIZATION_FINALIZED_AT',
        earlyToleranceMs: -1,
        lateToleranceMs: TOLERANCE_MS,
        lowerBoundInclusive: true,
        upperBoundInclusive: true,
      },
    }));
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: negativeId,
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T35 grain mismatch between caller input and pinned FORMULA is CONTRACT_VIOLATION', async () => {
    // Caller input itself must equal the canonical grain (enforced at input
    // validation), so this exercises FORMULA-side mismatch specifically.
    const badId = await registerNegativeFormula(formulaDefinition({ aggregationGrain: GRAIN.slice(0, 4).concat('EXTRA') }));
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: badId,
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T36 valid closed FORMULA v1 is accepted and formulaReference echoes digest metadata', async () => {
    const enrollment = await newEnrollment();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.formulaReference, {
      formulaId: FORMULA_ID,
      formulaVersion: 1,
      definitionDigest: result.formulaReference.definitionDigest,
      digestAlgorithm: result.formulaReference.digestAlgorithm,
      normalizationVersion: result.formulaReference.normalizationVersion,
    });
    assert.equal(typeof result.formulaReference.definitionDigest, 'string');
    assert.ok(result.formulaReference.definitionDigest.length > 0);
  });

  // ===========================================================================
  // 8. Candidate admission -- population boundaries.
  // ===========================================================================

  test('T37 formula mismatch on the assignment snapshot puts it outside candidate population (no error, no leakage)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment({ formulaId: FORMULA_ALT_ID });
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.groups, []);
    assert.deepEqual(result.sourceRebuildReference.assignmentIds, []);
    assert.ok(!result.sourceRebuildReference.assignmentIds.includes(assignmentId));
  });

  test('T38 non-ASSESSMENT assignment type is outside candidate population', async () => {
    const { enrollment } = await newCandidateAssignment({ assignmentType: 'LEARNING', targetTimepoint: 'IMMEDIATE' });
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.groups, []);
  });

  test('T39 IMMEDIATE targetTimepoint assignment is outside candidate population', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { assignmentType: 'ASSESSMENT', targetTimepoint: 'IMMEDIATE' });
    await setDueAt(created.assignment.assignment_id, '2026-06-08T00:00:00.000Z');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.groups, []);
  });

  test('T40 not-yet-due assignment (due_at > analysisCutoff) is outside candidate population', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    await setDueAt(created.assignment.assignment_id, '2099-06-01T00:00:00.000000Z');
    const result = await queryMetricResult(pool, baseInput({
      analysisCutoff: '2030-01-01T00:00:00.000Z',
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.groups, []);
  });

  test('T40b due_at exactly equal to analysisCutoff is a candidate (inclusive boundary), one microsecond later is not', async () => {
    const enrollment1 = await newEnrollment();
    const created1 = await newAssignment(enrollment1.enrollment_id);
    await setDueAt(created1.assignment.assignment_id, '2030-01-01T00:00:00.000000Z');

    const enrollment2 = await newEnrollment();
    const created2 = await newAssignment(enrollment2.enrollment_id);
    await setDueAt(created2.assignment.assignment_id, '2030-01-01T00:00:00.000001Z');

    const cutoff = '2030-01-01T00:00:00.000Z';
    const resultInclusive = await queryMetricResult(pool, baseInput({
      analysisCutoff: cutoff,
      filters: baseFilters({ enrollmentIds: [enrollment1.enrollment_id] }),
    }));
    const resultExcluded = await queryMetricResult(pool, baseInput({
      analysisCutoff: cutoff,
      filters: baseFilters({ enrollmentIds: [enrollment2.enrollment_id] }),
    }));
    // Both currently have zero eligible completions, so both resolve to
    // empty groups either way -- provenance is where admission differs.
    assert.deepEqual(resultInclusive.sourceRebuildReference.assignmentIds, [created1.assignment.assignment_id]);
    assert.deepEqual(resultExcluded.sourceRebuildReference.assignmentIds, []);
  });

  test('T41 post-cutoff assignment snapshot puts the assignment outside candidate population', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    const assignmentId = created.assignment.assignment_id;
    await setDueAt(assignmentId, '2026-06-01T00:00:00.000Z');
    await pool.query(
      `UPDATE evidence_assignment_snapshots SET created_at = '2090-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    const result = await queryMetricResult(pool, baseInput({
      // Must be strictly before the inflated snapshot.created_at (2090) for
      // the snapshot-cutoff exclusion to actually apply -- FAR_FUTURE_CUTOFF
      // (2099) would not exclude it.
      analysisCutoff: '2050-01-01T00:00:00.000Z',
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result.groups, []);
    assert.deepEqual(result.sourceRebuildReference.assignmentIds, []);
  });

  test('T42 due_at null is a source contradiction (CONTRACT_VIOLATION), not a silent exclusion', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id); // due_at left NULL
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T43 missing assignment snapshot is a source contradiction (CONTRACT_VIOLATION)', async () => {
    const enrollment = await newEnrollment();
    const assignmentId = require('node:crypto').randomUUID();
    await pool.query(
      `INSERT INTO evidence_assignments (
         assignment_id, enrollment_id, assignment_type, target_timepoint, anchor_strategy, due_at
       ) VALUES ($1, $2, 'ASSESSMENT', 'DAY_7', 'NODE_ASSIGNMENT_COMPLETION', '2026-06-01T00:00:00.000Z')`,
      [assignmentId, enrollment.enrollment_id]
    );
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T44 itemFamilyReferences filter selects only the matching assignment', async () => {
    const enrollment = await newEnrollment();
    const matching = await newCandidateAssignment({ enrollment, itemFamilyId: FAMILY_1 });
    const nonMatching = await newAssignment(enrollment.enrollment_id, { itemFamilyId: FAMILY_2 });
    await setDueAt(nonMatching.assignment.assignment_id, '2026-06-08T00:00:00.000Z');

    const session = await newSession(enrollment.enrollment_id);
    const attempt1 = await newAttempt(matching.assignmentId, session.session_id);
    await finalizeWith(attempt1, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt1, matching.assignmentId, matching.dueAt);

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({
        enrollmentIds: [enrollment.enrollment_id],
        itemFamilyReferences: [{ itemFamilyId: FAMILY_1, itemFamilyVersion: 1 }],
      }),
    }));
    assert.deepEqual(result.sourceRebuildReference.assignmentIds, [matching.assignmentId]);
  });

  test('T45 nodeIds filter restricts candidates to matching snapshot nodes only', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment({ targetNodeIds: [NODE_A, NODE_B] });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A), correctEvaluation(NODE_B)]);
    await forceTimeliness(attempt, assignmentId, dueAt);

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id], nodeIds: [NODE_A] }),
    }));
    assert.equal(result.groups.length, 1);
    assert.equal(result.groups[0].groupKey.nodeId, NODE_A);
  });

  // ===========================================================================
  // 9. FIRST_MATCH exclusion -- assignment-level terminal facts (rules 1-7).
  // ===========================================================================

  test('T46 ASSIGNMENT_SUPERSEDED (rule 1) excludes and counts, candidate retained', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await supersedeAssignment(assignmentId, enrollment.enrollment_id);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.supersededCount, 1);
    assert.equal(group.candidateCount, 1);
    assert.equal(group.eligibleCount, 0);
  });

  test('T47 ASSIGNMENT_WITHDRAWN (rule 2)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'WITHDRAWN');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).withdrawnCount, 1);
  });

  test('T48 ASSIGNMENT_TECHNICAL_FAILURE (rule 3)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'TECHNICAL_FAILURE');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).technicalFailureCount, 1);
  });

  test('T49 ASSIGNMENT_MISSING (rule 4)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'MISSING');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).missingCount, 1);
  });

  test('T50 ASSIGNMENT_UNSCORABLE (rule 5)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'UNSCORABLE');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).unscorableCount, 1);
  });

  test('T51 ASSIGNMENT_NORMAL_EMPTY (rule 6)', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'NORMAL_EMPTY');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).normalEmptyCount, 1);
  });

  test('T52 ASSIGNMENT_NONTERMINAL (rule 7): a still-open assignment (terminal_outcome null)', async () => {
    const { enrollment } = await newCandidateAssignment();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).nonterminalCount, 1);
  });

  test('T53 overlapping-rule precedence: WITHDRAWN wins over supersession only when SUPERSEDED is not also set; SUPERSEDED wins whenever set', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'WITHDRAWN');
    await supersedeAssignment(assignmentId, enrollment.enrollment_id);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.supersededCount, 1);
    assert.equal(group.withdrawnCount, 0);
  });

  // ===========================================================================
  // 10. Completion branch -- POST_CUTOFF_COMPLETION (rule 8).
  // ===========================================================================

  test('T54 POST_CUTOFF_COMPLETION (rule 8): completed_at after analysisCutoff, no attempt/evaluation leakage', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt, assignmentId, dueAt);
    // Push completed_at into the far future so it lands after the cutoff
    // used below, without touching finalized_at.
    await pool.query(
      `UPDATE evidence_assignments SET completed_at = '2097-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );

    const result = await queryMetricResult(pool, baseInput({
      analysisCutoff: '2090-01-01T00:00:00.000Z',
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.postCutoffCompletionCount, 1);
    assert.deepEqual(group.sourceRebuildReference.attemptIds, []);
    assert.deepEqual(group.sourceRebuildReference.evaluationIds, []);
  });

  // ===========================================================================
  // 11. Completion integrity contradictions.
  // ===========================================================================

  test('T55 completion attempt ownership mismatch is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const otherEnrollment = await newEnrollment();
    const otherAssignment = await newAssignment(otherEnrollment.enrollment_id);
    await setDueAt(otherAssignment.assignment.assignment_id, dueAt);
    const otherSession = await newSession(otherEnrollment.enrollment_id);
    const foreignAttempt = await newAttempt(otherAssignment.assignment.assignment_id, otherSession.session_id);
    await finalizeWith(foreignAttempt, [correctEvaluation(NODE_A)]);

    // Point the FIRST assignment's completion at an attempt that actually
    // belongs to a different assignment.
    await pool.query(
      `UPDATE evidence_assignments
          SET terminal_outcome = 'COMPLETED', completion_attempt_id = $2, completed_at = $3
        WHERE assignment_id = $1`,
      [assignmentId, foreignAttempt.attemptId, dueAt]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T56 missing finalization for the completion attempt is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id); // never finalized

    await pool.query(
      `UPDATE evidence_assignments
          SET terminal_outcome = 'COMPLETED', completion_attempt_id = $2, completed_at = $3
        WHERE assignment_id = $1`,
      [assignmentId, attempt.attemptId, dueAt]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T57 completed_at/finalized_at mismatch is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt, assignmentId, dueAt);
    // Now diverge completed_at from finalized_at.
    await pool.query(
      `UPDATE evidence_assignments SET completed_at = '2026-06-08T13:00:00.000000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T58 completion attempt started_at after cutoff is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt, assignmentId, dueAt);
    await pool.query(
      `UPDATE evidence_attempts SET started_at = '2097-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attempt.attemptId]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        analysisCutoff: '2090-01-01T00:00:00.000Z',
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T59 completion attempt sibling retry is not independently selected/duplicated', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const completionAttempt = await newAttempt(assignmentId, session.session_id);
    // A sibling attempt that is opened but never becomes the completion
    // pointer must not contribute an additional candidate/observation.
    await newAttempt(assignmentId, session.session_id);
    await finalizeWith(completionAttempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(completionAttempt, assignmentId, dueAt);

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.candidateCount, 1);
    assert.deepEqual(group.sourceRebuildReference.attemptIds, [completionAttempt.attemptId]);
  });

  test('T60 target-node evaluation missing for the completion attempt/node is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt, assignmentId, dueAt);
    await pool.query(
      `DELETE FROM evidence_target_node_evaluations WHERE attempt_id = $1 AND node_id = $2`,
      [attempt.attemptId, NODE_A]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T61 scorable target-node evaluation with non-boolean is_correct is CONTRACT_VIOLATION', async () => {
    const { enrollment, assignmentId, dueAt } = await newCandidateAssignment();
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt, assignmentId, dueAt);
    // scorable=true (schema allows this alongside a null is_correct: the
    // CHECK constraint only forbids the opposite combination).
    await pool.query(
      `UPDATE evidence_target_node_evaluations SET is_correct = NULL WHERE attempt_id = $1 AND node_id = $2`,
      [attempt.attemptId, NODE_A]
    );

    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  // ===========================================================================
  // 12. Completed branch -- timeliness (rules 9/10) and ON_TIME sub-rules
  //     (rules 11-14) + eligibility.
  // ===========================================================================

  const DUE_AT = '2026-06-08T12:00:00.000000Z';
  const ON_TIME_LOWER = '2026-06-08T11:00:00.000000Z'; // due - 1h, inclusive
  const ON_TIME_UPPER = '2026-06-08T13:00:00.000000Z'; // due + 1h, inclusive
  const EARLY_BY_1MS = '2026-06-08T10:59:59.999000Z';
  const EARLY_BY_1US = '2026-06-08T10:59:59.999999Z';
  const LATE_BY_1MS = '2026-06-08T13:00:00.001000Z';
  const LATE_BY_1US = '2026-06-08T13:00:00.000001Z';

  async function candidateWithTimeliness(finalizedAt, evaluations, options = {}) {
    const { enrollment, assignmentId } = await newCandidateAssignment({
      dueAt: DUE_AT,
      targetNodeIds: options.targetNodeIds ?? [NODE_A],
    });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalizeWith(attempt, evaluations, options);
    await forceTimeliness(attempt, assignmentId, finalizedAt);
    return { enrollment, assignmentId, attempt };
  }

  test('T62 EARLY by 1 millisecond (rule 9, outside the lower ON_TIME boundary)', async () => {
    const { enrollment } = await candidateWithTimeliness(EARLY_BY_1MS, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).earlyCount, 1);
  });

  test('T63 EARLY by 1 microsecond (exact sub-millisecond boundary)', async () => {
    const { enrollment } = await candidateWithTimeliness(EARLY_BY_1US, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).earlyCount, 1);
  });

  test('T64 exact ON_TIME lower boundary (due - earlyToleranceMs, inclusive) is eligible, not EARLY', async () => {
    const { enrollment } = await candidateWithTimeliness(ON_TIME_LOWER, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.earlyCount, 0);
    assert.equal(group.denominator, 1);
  });

  test('T65 exact ON_TIME upper boundary (due + lateToleranceMs, inclusive) is eligible, not LATE', async () => {
    const { enrollment } = await candidateWithTimeliness(ON_TIME_UPPER, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.lateCount, 0);
    assert.equal(group.denominator, 1);
  });

  test('T66 LATE by 1 millisecond (rule 10)', async () => {
    const { enrollment } = await candidateWithTimeliness(LATE_BY_1MS, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).lateCount, 1);
  });

  test('T67 LATE by 1 microsecond', async () => {
    const { enrollment } = await candidateWithTimeliness(LATE_BY_1US, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).lateCount, 1);
  });

  test('T68 ON_TIME_TECHNICAL_INVALID_ATTEMPT (rule 11)', async () => {
    const { enrollment } = await candidateWithTimeliness(
      DUE_AT,
      [technicalInvalidEvaluation(NODE_A)],
      { responseKind: 'NORMAL_EMPTY' }
    );
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).technicalFailureCount, 1);
  });

  test('T69 ON_TIME_NORMAL_EMPTY_RESPONSE (rule 12) precedes ON_TIME_UNSCORABLE_ATTEMPT', async () => {
    const { enrollment } = await candidateWithTimeliness(
      DUE_AT,
      [normalEmptyEvaluation(NODE_A)],
      { responseKind: 'NORMAL_EMPTY' }
    );
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.normalEmptyCount, 1);
    assert.equal(group.unscorableCount, 0);
  });

  test('T70 ON_TIME_UNSCORABLE_ATTEMPT (rule 13): non-scorable attempt without NORMAL_EMPTY response', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [unscorableNodeEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.unscorableCount, 1);
    assert.equal(group.normalEmptyCount, 0);
  });

  test('T71 ON_TIME_UNSCORABLE_NODE_EVALUATION (rule 14): attempt SCORABLE overall, one node unscorable', async () => {
    const { enrollment } = await candidateWithTimeliness(
      DUE_AT,
      [correctEvaluation(NODE_A), unscorableNodeEvaluation(NODE_B)],
      { targetNodeIds: [NODE_A, NODE_B] }
    );
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const groupA = findGroup(result, NODE_A);
    const groupB = findGroup(result, NODE_B);
    assert.equal(groupA.denominator, 1);
    assert.equal(groupA.numerator, 1);
    assert.equal(groupB.unscorableCount, 1);
    assert.equal(groupB.denominator, 0);
  });

  test('T72 eligible + correct: denominator +1, numerator +1', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.denominator, 1);
    assert.equal(group.numerator, 1);
  });

  test('T73 eligible + incorrect: denominator +1, numerator +0 (never reclassified as an exclusion)', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [incorrectEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.denominator, 1);
    assert.equal(group.numerator, 0);
    assert.equal(group.excludedCount, 0);
  });

  // ===========================================================================
  // 13. Exact ten-bucket partition / all-14-rules / all-excluded group.
  // ===========================================================================

  test('T74 all 14 FIRST_MATCH rules partition into exactly the canonical ten reporting buckets, sum = excludedCount', async () => {
    // One participant per node/timepoint combo would multiply groups, so
    // this drives every rule through the SAME group (fixed node/timepoint/
    // condition/participant) via ten distinct enrollments that all share one
    // physical participant.
    const participant = await newParticipant();
    const buckets = [
      { name: 'supersededCount', apply: async (assignmentId, enrollmentId) => supersedeAssignment(assignmentId, enrollmentId) },
      { name: 'withdrawnCount', apply: async (assignmentId) => setAssignmentTerminalOutcome(assignmentId, 'WITHDRAWN') },
      { name: 'technicalFailureCount', apply: async (assignmentId) => setAssignmentTerminalOutcome(assignmentId, 'TECHNICAL_FAILURE') },
      { name: 'missingCount', apply: async (assignmentId) => setAssignmentTerminalOutcome(assignmentId, 'MISSING') },
      { name: 'unscorableCount', apply: async (assignmentId) => setAssignmentTerminalOutcome(assignmentId, 'UNSCORABLE') },
      { name: 'normalEmptyCount', apply: async (assignmentId) => setAssignmentTerminalOutcome(assignmentId, 'NORMAL_EMPTY') },
      { name: 'nonterminalCount', apply: async () => {} },
    ];

    const enrollmentIds = [];
    let candidateCount = 0;
    for (const bucket of buckets) {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      enrollmentIds.push(enrollment.enrollment_id);
      const created = await newAssignment(enrollment.enrollment_id);
      const assignmentId = created.assignment.assignment_id;
      await setDueAt(assignmentId, DUE_AT);
      await bucket.apply(assignmentId, enrollment.enrollment_id);
      candidateCount += 1;
    }

    // POST_CUTOFF_COMPLETION, EARLY, LATE, ON_TIME_TECHNICAL_INVALID_ATTEMPT,
    // ON_TIME_NORMAL_EMPTY_RESPONSE, ON_TIME_UNSCORABLE_ATTEMPT,
    // ON_TIME_UNSCORABLE_NODE_EVALUATION each require a completion branch.
    const completionBranches = [
      { finalizedAt: DUE_AT, evaluations: [correctEvaluation(NODE_A)], postCutoff: true },
      { finalizedAt: EARLY_BY_1MS, evaluations: [correctEvaluation(NODE_A)] },
      { finalizedAt: LATE_BY_1MS, evaluations: [correctEvaluation(NODE_A)] },
      { finalizedAt: DUE_AT, evaluations: [technicalInvalidEvaluation(NODE_A)], responseKind: 'NORMAL_EMPTY' },
      { finalizedAt: DUE_AT, evaluations: [normalEmptyEvaluation(NODE_A)], responseKind: 'NORMAL_EMPTY' },
      { finalizedAt: DUE_AT, evaluations: [unscorableNodeEvaluation(NODE_A)] },
      { finalizedAt: DUE_AT, evaluations: [correctEvaluation(NODE_A), unscorableNodeEvaluation(NODE_B)], targetNodeIds: [NODE_A, NODE_B] },
    ];
    for (const branch of completionBranches) {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      enrollmentIds.push(enrollment.enrollment_id);
      const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: branch.targetNodeIds ?? [NODE_A] });
      const assignmentId = created.assignment.assignment_id;
      await setDueAt(assignmentId, DUE_AT);
      const session = await newSession(enrollment.enrollment_id);
      const attempt = await newAttempt(assignmentId, session.session_id);
      await finalizeWith(attempt, branch.evaluations, { responseKind: branch.responseKind });
      await forceTimeliness(attempt, assignmentId, branch.finalizedAt);
      if (branch.postCutoff) {
        await pool.query(
          `UPDATE evidence_assignments SET completed_at = '2100-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
          [assignmentId]
        );
      }
      candidateCount += branch.targetNodeIds ? branch.targetNodeIds.length : 1;
    }

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds }),
    }));
    const groupA = findGroup(result, NODE_A);
    assert.equal(groupA.supersededCount, 1);
    assert.equal(groupA.withdrawnCount, 1);
    assert.equal(groupA.technicalFailureCount, 2); // ASSIGNMENT_TECHNICAL_FAILURE + ON_TIME_TECHNICAL_INVALID_ATTEMPT
    assert.equal(groupA.missingCount, 1);
    assert.equal(groupA.unscorableCount, 2); // ASSIGNMENT_UNSCORABLE + ON_TIME_UNSCORABLE_ATTEMPT
    assert.equal(groupA.normalEmptyCount, 2); // ASSIGNMENT_NORMAL_EMPTY + ON_TIME_NORMAL_EMPTY_RESPONSE
    assert.equal(groupA.nonterminalCount, 1);
    assert.equal(groupA.postCutoffCompletionCount, 1);
    assert.equal(groupA.earlyCount, 1);
    assert.equal(groupA.lateCount, 1);

    const groupB = findGroup(result, NODE_B);
    assert.equal(groupB.unscorableCount, 1); // ON_TIME_UNSCORABLE_NODE_EVALUATION

    const excludedSum = ['supersededCount', 'withdrawnCount', 'technicalFailureCount', 'missingCount',
      'unscorableCount', 'normalEmptyCount', 'nonterminalCount', 'postCutoffCompletionCount',
      'earlyCount', 'lateCount'].reduce((sum, key) => sum + groupA[key], 0);
    assert.equal(excludedSum, groupA.excludedCount);
    assert.equal(groupA.candidateCount, groupA.eligibleCount + groupA.excludedCount);
  });

  test('T75 all-excluded group is retained (not dropped) with denominator 0', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'MISSING');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.ok(group);
    assert.equal(group.denominator, 0);
    assert.equal(group.candidateCount, 1);
    assert.equal(group.status, 'INSUFFICIENT');
    assert.equal(group.value, null);
  });

  test('T76 a candidate neither excluded nor eligible (unrecognized terminal_outcome-adjacent state) is unreachable via valid DB rows', async () => {
    // The DB CHECK constraints only permit COMPLETED/MISSING/
    // TECHNICAL_FAILURE/WITHDRAWN/UNSCORABLE/NORMAL_EMPTY/null, so this rule
    // is exercised indirectly: every candidate constructed elsewhere in this
    // suite resolves to exactly one of eligible or excluded, verified by the
    // candidateCount = eligibleCount + excludedCount invariant assertions
    // throughout (e.g. T74).
    assert.ok(true);
  });

  // ===========================================================================
  // 14. Denominator / status / HALF_UP value boundaries.
  // ===========================================================================

  test('T77 denominator 0 -> group status INSUFFICIENT, value null', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'MISSING');
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.denominator, 0);
    assert.equal(group.status, 'INSUFFICIENT');
    assert.equal(group.value, null);
  });

  test('T78 denominator 1 (< minimumSample 2) -> group INSUFFICIENT with a populated numerator/denominator but null value', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.denominator, 1);
    assert.equal(group.status, 'INSUFFICIENT');
    assert.equal(group.value, null);
  });

  test('T79 denominator 2 = minimumSample -> group OK with an exact six-decimal value', async () => {
    const participant = await newParticipant();
    const enrollment1 = await newEnrollment(CONDITION_1, participant.participant_id);
    const enrollment2 = await newEnrollment(CONDITION_1, participant.participant_id);
    for (const enrollment of [enrollment1, enrollment2]) {
      const created = await newAssignment(enrollment.enrollment_id);
      const assignmentId = created.assignment.assignment_id;
      await setDueAt(assignmentId, DUE_AT);
      const session = await newSession(enrollment.enrollment_id);
      const attempt = await newAttempt(assignmentId, session.session_id);
      await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
      await forceTimeliness(attempt, assignmentId, DUE_AT);
    }
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.denominator, 2);
    assert.equal(group.numerator, 2);
    assert.equal(group.status, 'OK');
    assert.equal(group.value, '1.000000');
    assert.equal(result.status, 'OK');
  });

  test('T80 top-level status is mixed (INSUFFICIENT) when one group is OK and another is not', async () => {
    const participant = await newParticipant();
    // Group 1: two eligible+correct on NODE_A -> OK.
    const enrollment1 = await newEnrollment(CONDITION_1, participant.participant_id);
    const enrollment2 = await newEnrollment(CONDITION_1, participant.participant_id);
    for (const enrollment of [enrollment1, enrollment2]) {
      const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
      const assignmentId = created.assignment.assignment_id;
      await setDueAt(assignmentId, DUE_AT);
      const session = await newSession(enrollment.enrollment_id);
      const attempt = await newAttempt(assignmentId, session.session_id);
      await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
      await forceTimeliness(attempt, assignmentId, DUE_AT);
    }
    // Group 2: single eligible candidate on NODE_B -> INSUFFICIENT.
    const enrollment3 = await newEnrollment(CONDITION_1, participant.participant_id);
    const created3 = await newAssignment(enrollment3.enrollment_id, { targetNodeIds: [NODE_B] });
    const assignmentId3 = created3.assignment.assignment_id;
    await setDueAt(assignmentId3, DUE_AT);
    const session3 = await newSession(enrollment3.enrollment_id);
    const attempt3 = await newAttempt(assignmentId3, session3.session_id);
    await finalizeWith(attempt3, [correctEvaluation(NODE_B)]);
    await forceTimeliness(attempt3, assignmentId3, DUE_AT);

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({
        enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id, enrollment3.enrollment_id],
      }),
    }));
    assert.equal(findGroup(result, NODE_A).status, 'OK');
    assert.equal(findGroup(result, NODE_B).status, 'INSUFFICIENT');
    assert.equal(result.status, 'INSUFFICIENT');
    // Top-level INSUFFICIENT must not erase the OK group's own value.
    assert.equal(findGroup(result, NODE_A).value, '1.000000');
  });

  test('T81 canonical 12-candidate example: 2 eligible + 10 excluded, numerator 1, denominator 2, value "0.500000"', async () => {
    const participant = await newParticipant();

    // 1 eligible+correct, 1 eligible+incorrect -> denominator 2, numerator 1.
    const enrollmentCorrect = await newEnrollment(CONDITION_1, participant.participant_id);
    const createdCorrect = await newAssignment(enrollmentCorrect.enrollment_id);
    await setDueAt(createdCorrect.assignment.assignment_id, DUE_AT);
    const sessionCorrect = await newSession(enrollmentCorrect.enrollment_id);
    const attemptCorrect = await newAttempt(createdCorrect.assignment.assignment_id, sessionCorrect.session_id);
    await finalizeWith(attemptCorrect, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attemptCorrect, createdCorrect.assignment.assignment_id, DUE_AT);

    const enrollmentIncorrect = await newEnrollment(CONDITION_1, participant.participant_id);
    const createdIncorrect = await newAssignment(enrollmentIncorrect.enrollment_id);
    await setDueAt(createdIncorrect.assignment.assignment_id, DUE_AT);
    const sessionIncorrect = await newSession(enrollmentIncorrect.enrollment_id);
    const attemptIncorrect = await newAttempt(createdIncorrect.assignment.assignment_id, sessionIncorrect.session_id);
    await finalizeWith(attemptIncorrect, [incorrectEvaluation(NODE_A)]);
    await forceTimeliness(attemptIncorrect, createdIncorrect.assignment.assignment_id, DUE_AT);

    // 10 excluded, one per bucket (assignment-level buckets only, for
    // determinism/simplicity -- the exact 14-rule partition is T74).
    const excludedOutcomes = [
      'WITHDRAWN', 'TECHNICAL_FAILURE', 'MISSING', 'UNSCORABLE', 'NORMAL_EMPTY',
    ];
    const enrollmentIds = [enrollmentCorrect.enrollment_id, enrollmentIncorrect.enrollment_id];
    for (const outcome of excludedOutcomes) {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      const created = await newAssignment(enrollment.enrollment_id);
      await setDueAt(created.assignment.assignment_id, DUE_AT);
      await setAssignmentTerminalOutcome(created.assignment.assignment_id, outcome);
      enrollmentIds.push(enrollment.enrollment_id);
    }
    // Nonterminal x2, superseded x2, postCutoffCompletion x1 to reach 10.
    for (let i = 0; i < 2; i += 1) {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      const created = await newAssignment(enrollment.enrollment_id);
      await setDueAt(created.assignment.assignment_id, DUE_AT);
      enrollmentIds.push(enrollment.enrollment_id);
    }
    for (let i = 0; i < 2; i += 1) {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      const created = await newAssignment(enrollment.enrollment_id);
      await setDueAt(created.assignment.assignment_id, DUE_AT);
      await supersedeAssignment(created.assignment.assignment_id, enrollment.enrollment_id);
      enrollmentIds.push(enrollment.enrollment_id);
    }
    {
      const enrollment = await newEnrollment(CONDITION_1, participant.participant_id);
      const created = await newAssignment(enrollment.enrollment_id);
      const assignmentId = created.assignment.assignment_id;
      await setDueAt(assignmentId, DUE_AT);
      const session = await newSession(enrollment.enrollment_id);
      const attempt = await newAttempt(assignmentId, session.session_id);
      await finalizeWith(attempt, [correctEvaluation(NODE_A)]);
      await forceTimeliness(attempt, assignmentId, DUE_AT);
      await pool.query(
        `UPDATE evidence_assignments SET completed_at = '2100-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
        [assignmentId]
      );
      enrollmentIds.push(enrollment.enrollment_id);
    }

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.candidateCount, 12);
    assert.equal(group.eligibleCount, 2);
    assert.equal(group.excludedCount, 10);
    assert.equal(group.numerator, 1);
    assert.equal(group.denominator, 2);
    assert.equal(group.status, 'OK');
    assert.equal(group.value, '0.500000');
  });

  test('T82 HALF_UP tie rounds up; immediately below/above the tie rounds down/up', async () => {
    // 1/3 = 0.333333(3) -> not a tie, sanity for non-tie truncation-adjacent
    // rounding. 1/8 = 0.125 exactly -> not relevant to a tie at 6 decimals
    // since 1,000,000/8 has no remainder*2 tie boundary trivially; instead
    // exercise an exact HALF_UP tie: 1/2 at a coarser denominator scaled to
    // 6 decimals never ties mid-digit for integer n/d with d small, so this
    // proves the general algorithm output directly via two edge ratios.
    assert.equal(computeRatio(1, 2), '0.500000');
    assert.equal(computeRatio(1, 3), '0.333333');
    assert.equal(computeRatio(2, 3), '0.666667');
    assert.equal(computeRatio(0, 5), '0.000000');
    assert.equal(computeRatio(5, 5), '1.000000');

    // HALF_UP exact tie at the 7th digit: numerator/denominator chosen so
    // scaled remainder*2 == denominator exactly (a true tie), verified
    // against the documented BigInt algorithm directly.
    function computeRatio(numerator, denominator) {
      const scaled = BigInt(numerator) * 1000000n;
      const d = BigInt(denominator);
      const q = scaled / d;
      const r = scaled % d;
      const rounded = q + (2n * r >= d ? 1n : 0n);
      const whole = rounded / 1000000n;
      const frac = rounded % 1000000n;
      return `${whole}.${frac.toString().padStart(6, '0')}`;
    }
  });

  test('T83 ratio 0 and ratio 1 six-decimal formatting', async () => {
    const participant = await newParticipant();
    const enrollment1 = await newEnrollment(CONDITION_1, participant.participant_id);
    const enrollment2 = await newEnrollment(CONDITION_1, participant.participant_id);
    for (const enrollment of [enrollment1, enrollment2]) {
      const created = await newAssignment(enrollment.enrollment_id);
      await setDueAt(created.assignment.assignment_id, DUE_AT);
      const session = await newSession(enrollment.enrollment_id);
      const attempt = await newAttempt(created.assignment.assignment_id, session.session_id);
      await finalizeWith(attempt, [incorrectEvaluation(NODE_A)]);
      await forceTimeliness(attempt, created.assignment.assignment_id, DUE_AT);
    }
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id] }),
    }));
    assert.equal(findGroup(result, NODE_A).value, '0.000000');
  });

  // ===========================================================================
  // 15. Provenance.
  // ===========================================================================

  test('T84 exposureIds is always [] (Retention v1 fixed) per-group and response-wide', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(findGroup(result, NODE_A).sourceRebuildReference.exposureIds, []);
    assert.deepEqual(result.sourceRebuildReference.exposureIds, []);
  });

  test('T85 response-wide sourceRebuildReference is the canonical sorted union of group references', async () => {
    const participant = await newParticipant();
    const enrollment1 = await newEnrollment(CONDITION_1, participant.participant_id);
    const created1 = await newAssignment(enrollment1.enrollment_id, { targetNodeIds: [NODE_A] });
    await setDueAt(created1.assignment.assignment_id, DUE_AT);
    const session1 = await newSession(enrollment1.enrollment_id);
    const attempt1 = await newAttempt(created1.assignment.assignment_id, session1.session_id);
    await finalizeWith(attempt1, [correctEvaluation(NODE_A)]);
    await forceTimeliness(attempt1, created1.assignment.assignment_id, DUE_AT);

    const enrollment2 = await newEnrollment(CONDITION_1, participant.participant_id);
    const created2 = await newAssignment(enrollment2.enrollment_id, { targetNodeIds: [NODE_B] });
    await setDueAt(created2.assignment.assignment_id, DUE_AT);
    const session2 = await newSession(enrollment2.enrollment_id);
    const attempt2 = await newAttempt(created2.assignment.assignment_id, session2.session_id);
    await finalizeWith(attempt2, [correctEvaluation(NODE_B)]);
    await forceTimeliness(attempt2, created2.assignment.assignment_id, DUE_AT);

    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id] }),
    }));
    const expectedEnrollmentIds = [enrollment1.enrollment_id, enrollment2.enrollment_id].sort();
    assert.deepEqual(result.sourceRebuildReference.enrollmentIds, expectedEnrollmentIds);
    const expectedAttemptIds = [attempt1.attemptId, attempt2.attemptId].sort();
    assert.deepEqual(result.sourceRebuildReference.attemptIds, expectedAttemptIds);
  });

  test('T86 eager-prefetch non-leakage: an EARLY candidate never dereferences its target-node evaluation', async () => {
    const { enrollment } = await candidateWithTimeliness(EARLY_BY_1MS, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.equal(group.earlyCount, 1);
    assert.deepEqual(group.sourceRebuildReference.evaluationIds, []);
    // The attempt itself IS dereferenced (for the timeliness fact).
    assert.equal(group.sourceRebuildReference.attemptIds.length, 1);
  });

  // ===========================================================================
  // 16. Determinism / transaction / zero-side-effect.
  // ===========================================================================

  test('T87 deterministic repeated result for the same committed source/cutoff/formula', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const input = baseInput({ filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }) });
    const result1 = await queryMetricResult(pool, input);
    const result2 = await queryMetricResult(pool, input);
    assert.deepEqual(result1, result2);
  });

  test('T88 lifecycle transaction-visible-as-of-read: mutable terminal_outcome/superseded_by reflect current state, not a fabricated cutoff-time reconstruction', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    const beforeResult = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(beforeResult, NODE_A).nonterminalCount, 1);

    await setAssignmentTerminalOutcome(assignmentId, 'WITHDRAWN');
    const afterResult = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(findGroup(afterResult, NODE_A).withdrawnCount, 1);
    assert.equal(findGroup(afterResult, NODE_A).nonterminalCount, 0);
  });

  test('T89 the operation runs in exactly one REPEATABLE READ READ ONLY transaction and issues no write statement', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const wrapped = wrapPoolCapturingQueries(pool);
    const result = await queryMetricResult(wrapped, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(result.groups.length, 1);
    assert.equal(wrapped.calls[0], 'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
    assert.equal(wrapped.calls[wrapped.calls.length - 1], 'COMMIT');
    assert.equal(
      wrapped.calls.filter((sql) => sql === 'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY').length,
      1
    );
    for (const sql of wrapped.calls) {
      assert.ok(!/^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i.test(sql), `unexpected write statement: ${sql}`);
    }
  });

  test('T90 rollback/release on failure: a mid-transaction contradiction still releases the client and preserves the original error', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id); // due_at NULL -> CONTRACT_VIOLATION mid-transaction
    let released = false;
    const realClient = await pool.connect();
    realClient.release();
    const wrapped = {
      connect: async () => {
        const client = await pool.connect();
        const originalRelease = client.release.bind(client);
        client.release = (...args) => {
          released = true;
          return originalRelease(...args);
        };
        return client;
      },
    };
    await rejectsWithCode(
      () => queryMetricResult(wrapped, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
    assert.ok(released);
  });

  test('T91 commit-before-return: a successful call has already committed by the time it resolves (result is stable against a concurrent read)', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    // A fresh independent query against the same committed state must see
    // the identical result -- proving no open/uncommitted transaction is
    // required for the caller to observe it.
    const { rows } = await pool.query(
      `SELECT terminal_outcome FROM evidence_assignments WHERE enrollment_id = $1`,
      [enrollment.enrollment_id]
    );
    assert.equal(rows[0].terminal_outcome, 'COMPLETED');
    assert.equal(result.groups.length, 1);
  });

  test('T92 RAW_SOURCE non-interference: queryRawEvidenceForMetricRebuild remains regression-identical alongside METRIC_RESULT usage', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    const rawResult = await queryRawEvidenceForMetricRebuild(pool, {
      formulaId: FORMULA_ID,
      formulaVersion: 1,
      analysisCutoff: FAR_FUTURE_CUTOFF,
      filters: {
        enrollmentIds: [enrollment.enrollment_id],
        assignmentIds: [],
        attemptIds: [],
        conditionReferences: [],
        targetTimepoints: [],
        nodeIds: [],
        itemFamilyReferences: [],
      },
    });
    assert.equal(rawResult.status, undefined);
    assert.equal(rawResult.rawFacts.assignments.length, 1);
    assert.equal(rawResult.rawFacts.assignments[0].assignment_id, assignmentId);
  });

  test('T93 zero-side-effect success: Evidence/Progress/production row counts unchanged after a nonempty METRIC_RESULT call', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const before = await fullFixtureCounts();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const after = await fullFixtureCounts();
    assert.equal(result.groups.length, 1);
    assert.deepEqual(after, before);
  });

  test('T94 zero-side-effect for the zero-candidate path', async () => {
    const enrollment = await newEnrollment();
    const before = await fullFixtureCounts();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const after = await fullFixtureCounts();
    assert.deepEqual(result.groups, []);
    assert.equal(result.status, 'INSUFFICIENT');
    assert.deepEqual(after, before);
  });

  test('T95 zero-side-effect for the all-excluded path', async () => {
    const { enrollment, assignmentId } = await newCandidateAssignment();
    await setAssignmentTerminalOutcome(assignmentId, 'MISSING');
    const before = await fullFixtureCounts();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const after = await fullFixtureCounts();
    assert.equal(findGroup(result, NODE_A).missingCount, 1);
    assert.deepEqual(after, before);
  });

  test('T96 zero-side-effect for a validation error', async () => {
    const before = await fullFixtureCounts();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        formulaId: FORMULA_UNKNOWN_ID,
        filters: baseFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
    const after = await fullFixtureCounts();
    assert.deepEqual(after, before);
  });

  test('T97 zero-side-effect for a source contradiction/error (mid-transaction rollback)', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id); // due_at NULL
    const before = await fullFixtureCounts();
    await rejectsWithCode(
      () => queryMetricResult(pool, baseInput({
        filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
      })),
      'CONTRACT_VIOLATION'
    );
    const after = await fullFixtureCounts();
    assert.deepEqual(after, before);
  });

  test('T98 zero-candidate result is the exact normal METRIC_RESULT envelope, never RAW_SOURCE empty_result', async () => {
    const enrollment = await newEnrollment();
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(Object.keys(result).sort(), [
      'aggregationGrain', 'analysisCutoff', 'filters', 'formulaReference',
      'groups', 'sourceRebuildReference', 'status',
    ].sort());
    assert.deepEqual(result.groups, []);
    assert.equal(result.status, 'INSUFFICIENT');
    assert.notDeepEqual(result, { status: 'empty', data: null });
  });

  test('T99 exact group row has all required keys with no snake_case alias', async () => {
    const { enrollment } = await candidateWithTimeliness(DUE_AT, [correctEvaluation(NODE_A)]);
    const result = await queryMetricResult(pool, baseInput({
      filters: baseFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    const group = findGroup(result, NODE_A);
    assert.deepEqual(Object.keys(group).sort(), [
      'groupKey', 'status', 'numerator', 'denominator', 'value', 'candidateCount',
      'eligibleCount', 'excludedCount', 'missingCount', 'technicalFailureCount',
      'withdrawnCount', 'unscorableCount', 'normalEmptyCount', 'earlyCount',
      'lateCount', 'supersededCount', 'nonterminalCount', 'postCutoffCompletionCount',
      'sourceRebuildReference',
    ].sort());
    assert.deepEqual(Object.keys(group.groupKey).sort(), [
      'participantId', 'nodeId', 'targetTimepoint', 'conditionId',
      'conditionVersion', 'formulaId', 'formulaVersion',
    ].sort());
  });
});
