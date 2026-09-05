'use strict';

// VI P1 Measurement Readiness -- RUNTIME FOUNDATION B1 Raw Source Rebuild
// CORE Runtime.
//
// Exercises `queryRawEvidenceForMetricRebuild(pool, input)` against an
// actual PostgreSQL instance (API_CONTRACT.md §13.10.11.1,
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §12.3): exact input/seven filter key
// validation, the FORMULA reference-only boundary, physical filter
// authority, root selection/closure, analysisCutoff, the exact RAW_SOURCE
// bundle and `empty_result` payload, raw row projection (including BIGINT
// exact-decimal-string handling), deterministic ordering, the single
// REPEATABLE READ READ ONLY transaction, and zero side effects.
//
// Metric reducers, FORMULA semantic interpretation, and P1 activation are
// out of scope and are not exercised here.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const evidence = require('../src/instrumentation');

const repository = evidence.evidenceRepository;
const { queryRawEvidenceForMetricRebuild } = evidence.evidenceMetrics;

const EXPERIMENT_ID = 'EXP_RAW_SOURCE_RUNTIME';
const CONDITION_1 = 'COND_RAW_SOURCE_1';
const CONDITION_2 = 'COND_RAW_SOURCE_2';
const CONDITION_UNKNOWN = { conditionId: 'COND_RAW_SOURCE_UNKNOWN', conditionVersion: 1 };
const ITEM_ID = 'ITEM_RAW_SOURCE';
const SCENARIO_ID = 'SCENARIO_RAW_SOURCE';
const FAMILY_1 = 'FAMILY_RAW_SOURCE_1';
const FAMILY_2 = 'FAMILY_RAW_SOURCE_2';
const FAMILY_UNKNOWN = { itemFamilyId: 'FAMILY_RAW_SOURCE_UNKNOWN', itemFamilyVersion: 1 };
const LEXICAL_ID = 'LEXICAL_RAW_SOURCE';
const RUBRIC_ID = 'RUBRIC_RAW_SOURCE';
const FORMULA_ID = 'FORMULA_RAW_SOURCE';
const FORMULA_UNKNOWN_ID = 'FORMULA_RAW_SOURCE_UNKNOWN';
const SCHEDULER_ID = 'SCHEDULER_RAW_SOURCE';
const INSTRUMENTATION_ID = 'INSTRUMENTATION_RAW_SOURCE';

const NODE_A = 'NODE_RAW_SOURCE_A';
const NODE_B = 'NODE_RAW_SOURCE_B';
const NODE_C = 'NODE_RAW_SOURCE_C';
const NODE_D = 'NODE_RAW_SOURCE_D';
const NODE_UNKNOWN = 'NODE_RAW_SOURCE_UNKNOWN';

const FAR_FUTURE_CUTOFF = '2099-01-01T00:00:00.000Z';
const FAR_PAST_CUTOFF = '2000-01-01T00:00:00.000Z';

const UNKNOWN_BUT_VALID_UUID = '00000000-0000-4000-8000-000000000099';
const MALFORMED_UUID = 'not-a-uuid';

let openCounter = 0;

async function resetAndMigrate() {
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await runMigrations();
}

async function insertGrammarNodes() {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES
       ($1, 'VI', '[]'::jsonb, 'Raw Source A', 1),
       ($2, 'VI', '[]'::jsonb, 'Raw Source B', 1),
       ($3, 'VI', '[]'::jsonb, 'Raw Source C', 1),
       ($4, 'VI', '[]'::jsonb, 'Raw Source D', 1)`,
    [NODE_A, NODE_B, NODE_C, NODE_D]
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
  for (const nodeId of [NODE_A, NODE_B, NODE_C, NODE_D]) {
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
    rubricRuleIds: ['RULE_NO_ERROR'],
    attributionAuthority: { byTargetNode },
  };
}

async function registerAuthorityFixture() {
  await repository.registerExperimentVersion(pool, {
    experimentId: EXPERIMENT_ID,
    version: 1,
    definition: { protocol: 'RAW_SOURCE_RUNTIME' },
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
  await registerReference('FORMULA', FORMULA_ID, 1);
  await registerReference('SCHEDULER_PROTOCOL', SCHEDULER_ID, 1);
  await registerReference('INSTRUMENTATION_PROTOCOL', INSTRUMENTATION_ID, 1, instrumentationDefinition());
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
    assignmentType: overrides.assignmentType ?? 'LEARNING',
    targetTimepoint: overrides.targetTimepoint ?? 'IMMEDIATE',
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
      formulaId: FORMULA_ID,
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
    idempotencyIdentity: `open-${openCounter}`,
    instrumentationProtocolId: INSTRUMENTATION_ID,
    instrumentationProtocolVersion: 1,
    openPayload: { n: openCounter },
    ...overrides,
  });
}

function evaluationFor(nodeId) {
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

async function finalize(attempt, targetNodeIds, overrides = {}) {
  return repository.finalizeAttempt(pool, {
    attemptId: attempt.attemptId,
    finalizationIdempotencyIdentity: `final-${attempt.attemptId}`,
    instrumentationProtocolId: INSTRUMENTATION_ID,
    instrumentationProtocolVersion: 1,
    responseKind: 'TEXT',
    responseText: 'answer',
    inputEnabledOffsetMs: 100,
    firstValidActivityOffsetMs: 120,
    submittedOffsetMs: 200,
    reportedClientMonotonicDurationMs: 100,
    actualStimulusModalities: ['TEXT'],
    actualResponseModalities: ['TEXT_ENTRY'],
    evaluations: targetNodeIds.map(evaluationFor),
    correctionAggregates: correctionBuckets(0),
    ...overrides,
  });
}

function emptyFilters(overrides = {}) {
  return {
    enrollmentIds: [],
    assignmentIds: [],
    attemptIds: [],
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
    filters: emptyFilters(),
    ...overrides,
  };
}

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
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
    'progress',
    'attempt_records',
  ];
  const counts = {};
  for (const table of tables) {
    counts[table] = await countRows(table);
  }
  return counts;
}

// A pool wrapper that records every SQL statement text issued on the client
// obtained via connect(), so the exact transaction setup/teardown and the
// absence of any write statement can be asserted directly (white-box
// evidence for "one REPEATABLE READ READ ONLY transaction" and "zero side
// effects").
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

describe('VI P1 raw source rebuild runtime (queryRawEvidenceForMetricRebuild)', { concurrency: false }, () => {
  before(async () => {
    await resetAndMigrate();
    await insertGrammarNodes();
    await registerAuthorityFixture();
  });

  after(async () => {
    await pool.end();
  });

  // -- 1. exact export / operation presence ---------------------------------

  test('T01 module exports the exact bounded raw-source operation', () => {
    assert.equal(typeof queryRawEvidenceForMetricRebuild, 'function');
    assert.equal(queryRawEvidenceForMetricRebuild.length, 2);
  });

  // -- 2. top-level input validation -----------------------------------------

  test('T02 missing top-level fields yield MISSING_REQUIRED_FIELD', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ formulaId: undefined })),
      'MISSING_REQUIRED_FIELD'
    );
    const missingVersion = baseInput();
    delete missingVersion.formulaVersion;
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, missingVersion),
      'MISSING_REQUIRED_FIELD'
    );
    const missingCutoff = baseInput();
    delete missingCutoff.analysisCutoff;
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, missingCutoff),
      'MISSING_REQUIRED_FIELD'
    );
    const missingFilters = baseInput();
    delete missingFilters.filters;
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, missingFilters),
      'MISSING_REQUIRED_FIELD'
    );
  });

  test('T03 unexpected top-level key is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, { ...baseInput(), extra: true }),
      'CONTRACT_VIOLATION'
    );
  });

  // -- 3. analysisCutoff --------------------------------------------------

  test('T04 analysisCutoff null/non-string is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ analysisCutoff: null })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ analysisCutoff: 12345 })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T05 analysisCutoff not in canonical YYYY-MM-DDTHH:mm:ss.sssZ form is OUT_OF_RANGE_VALUE', async () => {
    // Non-canonical lexical shapes (missing milliseconds, missing 'Z',
    // non-Z offset), a calendar-impossible date that Date would otherwise
    // silently roll over, and a plain malformed string all reject the same
    // way -- exact canonical form only, no alternate ISO 8601 shape.
    const rejects = [
      '2030-05-06T07:08:09Z',
      '2030-05-06T07:08:09',
      '2030-05-06T16:08:09.000+09:00',
      '2023-02-29T00:00:00.000Z',
      'not-a-timestamp',
    ];
    for (const analysisCutoff of rejects) {
      await rejectsWithCode(
        () => queryRawEvidenceForMetricRebuild(pool, baseInput({ analysisCutoff })),
        'OUT_OF_RANGE_VALUE'
      );
    }

    // Canonical-shape rejection happens before any DB connection: a pool
    // whose connect() throws must never actually be reached for a
    // shape-invalid input.
    const poisonedPool = {
      connect: async () => {
        throw new Error('pool.connect must not be called for a shape-invalid analysisCutoff');
      },
    };
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(poisonedPool, baseInput({ analysisCutoff: rejects[0] })),
      'OUT_OF_RANGE_VALUE'
    );
  });

  test('T06 analysisCutoff accepts and echoes back the exact canonical form', async () => {
    const enrollment = await newEnrollment();
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2030-05-06T07:08:09.000Z',
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(result.analysisCutoff, '2030-05-06T07:08:09.000Z');
  });

  // -- 4. seven filter keys -------------------------------------------------

  test('T07 omitted or explicit-undefined filter key is MISSING_REQUIRED_FIELD', async () => {
    const missingKey = baseInput();
    delete missingKey.filters.nodeIds;
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, missingKey),
      'MISSING_REQUIRED_FIELD'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ attemptIds: undefined }),
      })),
      'MISSING_REQUIRED_FIELD'
    );
  });

  test('T08 unexpected filter key is CONTRACT_VIOLATION', async () => {
    const badFilters = emptyFilters();
    badFilters.unexpectedKey = [];
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ filters: badFilters })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T09 explicit null / non-array filter value is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ enrollmentIds: null }),
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ nodeIds: 'NODE_A' }),
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ filters: null })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T10 duplicate element in a primary ID array is CONTRACT_VIOLATION', async () => {
    const enrollment = await newEnrollment();
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({
          enrollmentIds: [enrollment.enrollment_id, enrollment.enrollment_id],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T11 malformed UUID shape in a primary ID array is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ enrollmentIds: [MALFORMED_UUID] }),
      })),
      'INVALID_ID'
    );
  });

  // -- 5. structured references ---------------------------------------------

  test('T12 conditionReferences element must have exactly conditionId/conditionVersion', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ conditionReferences: [{ conditionId: CONDITION_1 }] }),
      })),
      'MISSING_REQUIRED_FIELD'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({
          conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: 1, extra: 'x' }],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({
          conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: 'one' }],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T13 itemFamilyReferences element must have exactly itemFamilyId/itemFamilyVersion', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({
          itemFamilyReferences: [{ itemFamilyId: FAMILY_1, itemFamilyVersion: 1, extra: 'x' }],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T14 duplicate structured reference is CONTRACT_VIOLATION', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({
          conditionReferences: [
            { conditionId: CONDITION_1, conditionVersion: 1 },
            { conditionId: CONDITION_1, conditionVersion: 1 },
          ],
        }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T15 targetTimepoints rejects values outside the canonical vocabulary', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ targetTimepoints: ['NEXT_WEEK'] }),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('T16 targetTimepoints accepts every canonical vocabulary value', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetTimepoint: 'IMMEDIATE' });
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        targetTimepoints: ['IMMEDIATE', 'DAY_7', 'DAY_30', 'NOT_APPLICABLE'],
      }),
    }));
    assert.deepEqual(
      result.filters.targetTimepoints,
      ['IMMEDIATE', 'DAY_7', 'DAY_30', 'NOT_APPLICABLE'].slice().sort()
    );
    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, created.assignment.assignment_id);
  });

  // -- 6. FORMULA boundary ---------------------------------------------------

  test('T17 unknown FORMULA reference is INVALID_ID', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ formulaId: FORMULA_UNKNOWN_ID })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ formulaVersion: 999 })),
      'INVALID_ID'
    );
  });

  // -- 7. primary/secondary reference existence ------------------------------

  test('T18 unknown but validly-shaped primary IDs are INVALID_ID, not empty_result', async () => {
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ enrollmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ assignmentIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ attemptIds: [UNKNOWN_BUT_VALID_UUID] }),
      })),
      'INVALID_ID'
    );
  });

  test('T19 unknown secondary references are INVALID_ID', async () => {
    const enrollment = await newEnrollment();
    const commonFilters = { enrollmentIds: [enrollment.enrollment_id] };
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ ...commonFilters, conditionReferences: [CONDITION_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ ...commonFilters, nodeIds: [NODE_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ ...commonFilters, itemFamilyReferences: [FAMILY_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
  });

  test('T20 FORMULA/reference existence is validated even on a request that will resolve to empty_result', async () => {
    // All-primary-empty would otherwise short-circuit to empty_result --
    // existence validation for a bad secondary reference must still fire
    // first.
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({
        filters: emptyFilters({ nodeIds: [NODE_UNKNOWN] }),
      })),
      'INVALID_ID'
    );
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ formulaId: FORMULA_UNKNOWN_ID })),
      'INVALID_ID'
    );
  });

  // -- 8. empty semantics ----------------------------------------------------

  test('T21 all-primary-empty returns exact { status: "empty", data: null }', async () => {
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput());
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T22 valid disjoint ancestry returns exact empty, not CONTRACT_VIOLATION', async () => {
    const enrollment1 = await newEnrollment();
    const enrollment2 = await newEnrollment();
    const assignment2 = await newAssignment(enrollment2.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment1.enrollment_id],
        assignmentIds: [assignment2.assignment.assignment_id],
      }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T23 secondary predicate that removes every root returns exact empty', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id, { targetTimepoint: 'IMMEDIATE' });
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        targetTimepoints: ['DAY_30'],
      }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T24 analysisCutoff that removes every root returns exact empty', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: FAR_PAST_CUTOFF,
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T25 assignment-less enrollment returns its own raw fact when secondary filters are empty and cutoff permits', async () => {
    const enrollment = await newEnrollment();
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(result.status, undefined);
    assert.equal(result.rawFacts.enrollments.length, 1);
    assert.equal(result.rawFacts.enrollments[0].enrollment_id, enrollment.enrollment_id);
    assert.deepEqual(result.rawFacts.assignments, []);
    assert.deepEqual(result.sourceRebuildReference.enrollmentIds, [enrollment.enrollment_id]);
  });

  test('T26 assignment-less enrollment bonus does not apply when an assignment-level secondary filter is nonempty', async () => {
    const enrollment = await newEnrollment();
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        targetTimepoints: ['IMMEDIATE'],
      }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T27 assignment-less enrollment bonus does not apply once the enrollment has an assignment (cutoff-excluded)', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: FAR_PAST_CUTOFF,
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  // -- 9. root selection / closure -------------------------------------------

  test('T28 legal multi-enrollment OR root returns both enrollments\' assignments', async () => {
    const enrollment1 = await newEnrollment();
    const enrollment2 = await newEnrollment();
    const a1 = await newAssignment(enrollment1.enrollment_id);
    const a2 = await newAssignment(enrollment2.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id],
      }),
    }));
    const returnedAssignmentIds = result.rawFacts.assignments.map((row) => row.assignment_id).sort();
    assert.deepEqual(
      returnedAssignmentIds,
      [a1.assignment.assignment_id, a2.assignment.assignment_id].sort()
    );
  });

  test('T29 cross-dimension AND ancestry returns only the intersecting assignment', async () => {
    const enrollment1 = await newEnrollment();
    const enrollment2 = await newEnrollment();
    const a1 = await newAssignment(enrollment1.enrollment_id);
    await newAssignment(enrollment2.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment1.enrollment_id],
        assignmentIds: [a1.assignment.assignment_id],
      }),
    }));
    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, a1.assignment.assignment_id);
  });

  test('T30 assignment-root closure returns owning enrollment, snapshot, nodes, exposure, and all cutoff-eligible attempts', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A, NODE_B] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);
    const attempt1 = await newAttempt(assignmentId, session.session_id);
    const attempt2 = await newAttempt(assignmentId, session.session_id);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    assert.equal(result.rawFacts.enrollments.length, 1);
    assert.equal(result.rawFacts.enrollments[0].enrollment_id, enrollment.enrollment_id);
    assert.equal(result.rawFacts.assignmentSnapshots.length, 1);
    assert.equal(result.rawFacts.assignmentSnapshotNodes.length, 2);
    assert.equal(result.rawFacts.assignmentItemExposures.length, 1);
    const returnedAttemptIds = result.rawFacts.attempts.map((row) => row.attempt_id).sort();
    assert.deepEqual(
      returnedAttemptIds,
      [attempt1.attemptId, attempt2.attemptId].sort()
    );
  });

  test('T31 attempt-root closure includes owning assignment/enrollment but no sibling attempt', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    const assignmentId = created.assignment.assignment_id;
    const session = await newSession(enrollment.enrollment_id);
    const attempt1 = await newAttempt(assignmentId, session.session_id);
    await newAttempt(assignmentId, session.session_id);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ attemptIds: [attempt1.attemptId] }),
    }));

    assert.equal(result.rawFacts.attempts.length, 1);
    assert.equal(result.rawFacts.attempts[0].attempt_id, attempt1.attemptId);
    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, assignmentId);
    assert.equal(result.rawFacts.enrollments[0].enrollment_id, enrollment.enrollment_id);
  });

  test('T32 node filter selects the branch only and returns the complete snapshot-node collection', async () => {
    const enrollment = await newEnrollment();
    await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A, NODE_B, NODE_C] });
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        nodeIds: [NODE_A],
      }),
    }));
    const returnedNodeIds = result.rawFacts.assignmentSnapshotNodes.map((row) => row.node_id).sort();
    assert.deepEqual(returnedNodeIds, [NODE_A, NODE_B, NODE_C].sort());
  });

  test('T33 itemFamilyReferences filter selects the branch only, not a trimmed row', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A, NODE_B],
      itemFamilyId: FAMILY_1,
    });
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        itemFamilyReferences: [{ itemFamilyId: FAMILY_1, itemFamilyVersion: 1 }],
      }),
    }));
    assert.equal(result.rawFacts.assignmentSnapshots.length, 1);
    assert.equal(
      result.rawFacts.assignmentSnapshots[0].assignment_id,
      created.assignment.assignment_id
    );
    assert.equal(result.rawFacts.assignmentSnapshotNodes.length, 2);
  });

  test('T34 conditionReferences filter prunes by owning enrollment, not snapshot', async () => {
    const enrollment1 = await newEnrollment(CONDITION_1);
    const enrollment2 = await newEnrollment(CONDITION_2);
    const a1 = await newAssignment(enrollment1.enrollment_id);
    await newAssignment(enrollment2.enrollment_id);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        enrollmentIds: [enrollment1.enrollment_id, enrollment2.enrollment_id],
        conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: 1 }],
      }),
    }));
    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, a1.assignment.assignment_id);
  });

  test('T35 same participant does not expand results across a different enrollment', async () => {
    const participant = await newParticipant();
    const enrollment1 = await newEnrollment(CONDITION_1, participant.participant_id);
    const enrollment2 = await newEnrollment(CONDITION_1, participant.participant_id);
    const a1 = await newAssignment(enrollment1.enrollment_id);
    await newAssignment(enrollment2.enrollment_id);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ enrollmentIds: [enrollment1.enrollment_id] }),
    }));

    assert.equal(result.rawFacts.enrollments.length, 1);
    assert.equal(result.rawFacts.enrollments[0].enrollment_id, enrollment1.enrollment_id);
    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, a1.assignment.assignment_id);
  });

  // -- 10. cutoff exclusion (deterministic via direct timestamp control) -----

  test('T36 analysisCutoff excludes a post-cutoff assignment while keeping a pre-cutoff one', async () => {
    const enrollment = await newEnrollment();
    const before = await newAssignment(enrollment.enrollment_id);
    const after = await newAssignment(enrollment.enrollment_id);
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [before.assignment.assignment_id]
    );
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [after.assignment.assignment_id]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));

    const returnedIds = result.rawFacts.assignments.map((row) => row.assignment_id);
    assert.deepEqual(returnedIds, [before.assignment.assignment_id]);
  });

  test('T37 analysisCutoff excludes a post-cutoff attempt while keeping a pre-cutoff one', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    const assignmentId = created.assignment.assignment_id;
    // The assignment itself must also be pre-cutoff, or it would not
    // qualify as a root at all and the attempt fetch would never run.
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    const session = await newSession(enrollment.enrollment_id);
    const attemptBefore = await newAttempt(assignmentId, session.session_id);
    const attemptAfter = await newAttempt(assignmentId, session.session_id);
    await pool.query(
      `UPDATE evidence_attempts SET started_at = '2020-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attemptBefore.attemptId]
    );
    await pool.query(
      `UPDATE evidence_attempts SET started_at = '2025-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attemptAfter.attemptId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    const returnedAttemptIds = result.rawFacts.attempts.map((row) => row.attempt_id);
    assert.deepEqual(returnedAttemptIds, [attemptBefore.attemptId]);
  });

  test('T38 analysisCutoff excludes a post-cutoff finalization/evaluation/correction while keeping the pre-cutoff attempt', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await pool.query(
      `UPDATE evidence_attempts SET started_at = '2020-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attempt.attemptId]
    );
    await finalize(attempt, [NODE_A]);
    await pool.query(
      `UPDATE evidence_attempt_finalizations SET finalized_at = '2025-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attempt.attemptId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    // The attempt itself remains (its own pre-cutoff started_at qualifies).
    assert.equal(result.rawFacts.attempts.length, 1);
    assert.equal(result.rawFacts.attempts[0].attempt_id, attempt.attemptId);
    assert.deepEqual(result.rawFacts.attemptFinalizations, []);
    assert.deepEqual(result.rawFacts.targetNodeEvaluations, []);
    assert.deepEqual(result.rawFacts.correctionAggregates, []);
  });

  // -- 11. mutable lifecycle as-of-read (no fabricated cutoff history) -------

  test('T39 mutable enrollment lifecycle reflects current transaction-visible state, not a fabricated cutoff-time reconstruction', async () => {
    const enrollment = await newEnrollment();
    await pool.query(
      `UPDATE evidence_enrollments SET status = 'WITHDRAWN', withdrawn_at = now() WHERE enrollment_id = $1`,
      [enrollment.enrollment_id]
    );
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));
    assert.equal(result.rawFacts.enrollments[0].status, 'WITHDRAWN');
    assert.notEqual(result.rawFacts.enrollments[0].withdrawn_at, null);
  });

  // -- 12. deterministic ordering ----------------------------------------------

  function compareCorrections(a, b) {
    if (a.attempt_id !== b.attempt_id) return a.attempt_id < b.attempt_id ? -1 : 1;
    if (a.initiator !== b.initiator) return a.initiator < b.initiator ? -1 : 1;
    if (a.feedback_phase !== b.feedback_phase) return a.feedback_phase < b.feedback_phase ? -1 : 1;
    if (a.correction_outcome !== b.correction_outcome) return a.correction_outcome < b.correction_outcome ? -1 : 1;
    return 0;
  }

  test('T40 assignmentSnapshotNodes/attempts ordering is exact (assignment_id ASC, ordinal ASC / assignment_id ASC, attempt_series_id ASC, retry_ordinal ASC, attempt_id ASC)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_D, NODE_A, NODE_C] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);

    // Two independent attempt series, and a retry within one of them, so
    // ordering is exercised across attempt_series_id/retry_ordinal without
    // finalizing more than one attempt per assignment (a scorable
    // finalization completes the assignment and blocks any further
    // finalization on it).
    const attemptX = await newAttempt(assignmentId, session.session_id);
    const attemptY = await newAttempt(assignmentId, session.session_id);
    const retry = await newAttempt(assignmentId, session.session_id, {
      attemptSeriesId: attemptX.attemptSeriesId,
      retryOfAttemptId: attemptX.attemptId,
    });

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    // assignmentSnapshotNodes: assignment_id ASC, ordinal ASC -> insertion
    // order (D, A, C at ordinals 0,1,2), not alphabetical node_id order.
    assert.deepEqual(
      result.rawFacts.assignmentSnapshotNodes.map((row) => row.node_id),
      [NODE_D, NODE_A, NODE_C]
    );
    assert.deepEqual(
      result.rawFacts.assignmentSnapshotNodes.map((row) => row.ordinal),
      [0, 1, 2]
    );

    // attempts: attemptX (retry_ordinal 0) precedes its retry
    // (retry_ordinal 1) within the same series.
    const attemptOrder = result.rawFacts.attempts.map((row) => row.attempt_id);
    assert.ok(attemptOrder.indexOf(attemptX.attemptId) < attemptOrder.indexOf(retry.attemptId));
    assert.deepEqual(
      new Set(attemptOrder),
      new Set([attemptX.attemptId, attemptY.attemptId, retry.attemptId])
    );

    assert.deepEqual(
      result.sourceRebuildReference.attemptIds,
      result.rawFacts.attempts.map((row) => row.attempt_id)
    );
    assert.deepEqual(
      result.sourceRebuildReference.exposureIds,
      result.rawFacts.assignmentItemExposures.map((row) => row.exposure_id)
    );

    // Now finalize attemptX (the only finalization on this assignment) to
    // check targetNodeEvaluations ordering (attempt_id ASC, node_id ASC):
    // node_id sorts alphabetically (A, C, D), independent of the snapshot's
    // insertion/ordinal order (D, A, C) checked above.
    await finalize(attemptX, [NODE_D, NODE_A, NODE_C]);
    const afterFinalize = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));
    assert.deepEqual(
      afterFinalize.rawFacts.targetNodeEvaluations.map((row) => row.node_id),
      [NODE_A, NODE_C, NODE_D]
    );
    assert.deepEqual(
      afterFinalize.sourceRebuildReference.evaluationIds,
      afterFinalize.rawFacts.targetNodeEvaluations.map((row) => row.evaluation_id)
    );
    assert.deepEqual(
      afterFinalize.rawFacts.correctionAggregates,
      afterFinalize.rawFacts.correctionAggregates.slice().sort(compareCorrections)
    );
  });

  test('T40b attemptFinalizations ordering follows finalized_at ASC, attempt_id ASC across assignments', async () => {
    const enrollment = await newEnrollment();
    const createdA = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const createdB = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const sessionA = await newSession(enrollment.enrollment_id);
    const sessionB = await newSession(enrollment.enrollment_id);
    const attemptA = await newAttempt(createdA.assignment.assignment_id, sessionA.session_id);
    const attemptB = await newAttempt(createdB.assignment.assignment_id, sessionB.session_id);
    await finalize(attemptA, [NODE_A]);
    await finalize(attemptB, [NODE_A]);
    // Force finalized_at so the later-inserted finalization (B) sorts
    // first, proving ordering follows finalized_at, not insertion order.
    await pool.query(
      `UPDATE evidence_attempt_finalizations SET finalized_at = '2021-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attemptB.attemptId]
    );
    await pool.query(
      `UPDATE evidence_attempt_finalizations SET finalized_at = '2022-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attemptA.attemptId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        assignmentIds: [createdA.assignment.assignment_id, createdB.assignment.assignment_id],
      }),
    }));

    assert.deepEqual(
      result.rawFacts.attemptFinalizations.map((row) => row.attempt_id),
      [attemptB.attemptId, attemptA.attemptId]
    );
    assert.deepEqual(
      result.rawFacts.correctionAggregates,
      result.rawFacts.correctionAggregates.slice().sort(compareCorrections)
    );
  });

  test('T41 exposure ordering uses PostgreSQL numeric authority, not JavaScript string comparison', async () => {
    const enrollment = await newEnrollment();
    const created1 = await newAssignment(enrollment.enrollment_id);
    const created2 = await newAssignment(enrollment.enrollment_id);
    const exposure1 = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created1.assignment.assignment_id,
    });
    const exposure2 = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created2.assignment.assignment_id,
    });
    // Force ordinals into single-digit vs double-digit territory: a naive
    // string sort would place '10' before '9'.
    await pool.query(
      `UPDATE evidence_assignment_item_exposures SET exposure_ordinal = 9 WHERE exposure_id = $1`,
      [exposure1.exposureId]
    );
    await pool.query(
      `UPDATE evidence_assignment_item_exposures SET exposure_ordinal = 10 WHERE exposure_id = $1`,
      [exposure2.exposureId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({
        assignmentIds: [created1.assignment.assignment_id, created2.assignment.assignment_id],
      }),
    }));

    assert.deepEqual(
      result.rawFacts.assignmentItemExposures.map((row) => row.exposure_ordinal),
      ['9', '10']
    );
  });

  // -- 13. raw projection / BIGINT ---------------------------------------------

  test('T42 BIGINT fields project as exact base-10 decimal strings', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalize(attempt, [NODE_A]);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    assert.equal(typeof result.rawFacts.assignmentSnapshots[0].exposure_history_cutoff_ordinal, 'string');
    assert.equal(typeof result.rawFacts.assignmentItemExposures[0].exposure_ordinal, 'string');
    const finalizationRow = result.rawFacts.attemptFinalizations[0];
    for (const field of [
      'input_enabled_offset_ms',
      'first_valid_activity_offset_ms',
      'submitted_offset_ms',
      'reported_client_monotonic_duration_ms',
    ]) {
      assert.equal(typeof finalizationRow[field], 'string');
    }
    assert.equal(finalizationRow.input_enabled_offset_ms, '100');
    assert.equal(finalizationRow.submitted_offset_ms, '200');
  });

  test('T43 exact physical snake_case row projection and JSONB/null/boolean/timestamp/integer normalization', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalize(attempt, [NODE_A]);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    const enrollmentRow = result.rawFacts.enrollments[0];
    assert.deepEqual(
      Object.keys(enrollmentRow).sort(),
      ['completed_at', 'condition_id', 'condition_version', 'created_at', 'enrollment_id',
        'experiment_id', 'experiment_version', 'participant_id', 'status', 'withdrawn_at'].sort()
    );
    assert.equal(enrollmentRow.completed_at, null);
    assert.equal(typeof enrollmentRow.created_at, 'string');
    assert.match(enrollmentRow.created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(typeof enrollmentRow.experiment_version, 'number');

    const snapshotRow = result.rawFacts.assignmentSnapshots[0];
    assert.ok(Array.isArray(snapshotRow.planned_stimulus_modalities));
    assert.deepEqual(snapshotRow.planned_stimulus_modalities, ['TEXT']);

    const evaluationRow = result.rawFacts.targetNodeEvaluations[0];
    assert.equal(typeof evaluationRow.scorable, 'boolean');
    assert.equal(typeof evaluationRow.rubric_outcome, 'object');
    assert.equal(evaluationRow.rubric_outcome.classification, 'NO_ERROR');
  });

  // -- 14. transaction / read-only / side effects -----------------------------

  test('T44 the operation runs in exactly one REPEATABLE READ READ ONLY transaction and issues no write statement', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalize(attempt, [NODE_A]);

    const wrapped = wrapPoolCapturingQueries(pool);
    const result = await queryRawEvidenceForMetricRebuild(wrapped, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    assert.notEqual(result.rawFacts.attempts.length, 0);
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

  test('T45 zero side effects: Evidence/Progress/production row counts are unchanged after a nonempty call', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalize(attempt, [NODE_A]);

    const before = await fullFixtureCounts();
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));
    const after = await fullFixtureCounts();

    assert.notEqual(result.rawFacts.attempts.length, 0);
    assert.deepEqual(after, before);
  });

  test('T46 zero side effects also hold for a request that resolves to empty_result', async () => {
    const before = await fullFixtureCounts();
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput());
    const after = await fullFixtureCounts();
    assert.deepEqual(result, { status: 'empty', data: null });
    assert.deepEqual(after, before);
  });

  test('T47 zero side effects hold even when the request fails validation', async () => {
    const before = await fullFixtureCounts();
    await rejectsWithCode(
      () => queryRawEvidenceForMetricRebuild(pool, baseInput({ formulaId: FORMULA_UNKNOWN_ID })),
      'INVALID_ID'
    );
    const after = await fullFixtureCounts();
    assert.deepEqual(after, before);
  });

  // -- 15. sourceRebuildReference membership -----------------------------------

  test('T48 sourceRebuildReference membership matches rawFacts row-for-row with no independent dedup', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A, NODE_B] });
    const assignmentId = created.assignment.assignment_id;
    await repository.recordAssignmentItemExposure(pool, { assignmentId });
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await finalize(attempt, [NODE_A, NODE_B]);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));

    assert.deepEqual(
      result.sourceRebuildReference.enrollmentIds,
      result.rawFacts.enrollments.map((row) => row.enrollment_id)
    );
    assert.deepEqual(
      result.sourceRebuildReference.assignmentIds,
      result.rawFacts.assignments.map((row) => row.assignment_id)
    );
    assert.deepEqual(
      result.sourceRebuildReference.attemptIds,
      result.rawFacts.attempts.map((row) => row.attempt_id)
    );
    assert.equal(result.sourceRebuildReference.attemptIds.length, 1);
    assert.equal(result.rawFacts.targetNodeEvaluations.length, 2);
    assert.equal(result.sourceRebuildReference.evaluationIds.length, 2);
  });

  // -- 16. Runtime B1 correction evidence (F-RB1-01/02/03/04) ------------------

  test('T-C01 post-cutoff supplied attempt does not qualify its assignment root (F-RB1-01)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    const assignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    const session = await newSession(enrollment.enrollment_id);
    const attempt = await newAttempt(assignmentId, session.session_id);
    await pool.query(
      `UPDATE evidence_attempts SET started_at = '2025-01-01T00:00:00.000Z' WHERE attempt_id = $1`,
      [attempt.attemptId]
    );
    // Establish the source fact directly rather than trusting the runtime
    // under test: the attempt physically exists and its started_at is
    // strictly after the cutoff used below.
    const { rows: attemptRows } = await pool.query(
      `SELECT started_at FROM evidence_attempts WHERE attempt_id = $1`,
      [attempt.attemptId]
    );
    assert.ok(attemptRows[0].started_at > new Date('2022-01-01T00:00:00.000Z'));

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ attemptIds: [attempt.attemptId] }),
    }));

    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T-C02 pre-cutoff assignment with a post-cutoff snapshot excludes only the snapshot (F-RB1-02 snapshot cutoff)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id);
    const assignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    // evidence_assignment_snapshots PRIMARY KEY is assignment_id itself, so
    // the owning snapshot row is addressed directly -- no independent
    // snapshot_id lookup is needed.
    await pool.query(
      `UPDATE evidence_assignment_snapshots SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    assert.equal(result.rawFacts.assignments.length, 1);
    assert.equal(result.rawFacts.assignments[0].assignment_id, assignmentId);
    assert.deepEqual(result.rawFacts.assignmentSnapshots, []);
  });

  test('T-C03 post-cutoff owning snapshot excludes its snapshot-node rows too (F-RB1-02 node fetch authority)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A, NODE_B] });
    const assignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    await pool.query(
      `UPDATE evidence_assignment_snapshots SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    // Confirm the node rows physically exist under that (now post-cutoff)
    // snapshot before asserting they are excluded from the fetch.
    const { rows: nodeCountRows } = await pool.query(
      `SELECT count(*) AS n FROM evidence_assignment_snapshot_nodes WHERE assignment_id = $1`,
      [assignmentId]
    );
    assert.equal(Number(nodeCountRows[0].n), 2);

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      // Assignment root selected via assignmentIds directly -- no nodeIds
      // filter is used here, so this exercises fetchSnapshotNodes' own
      // owning-snapshot cutoff authority, not root selection.
      filters: emptyFilters({ assignmentIds: [assignmentId] }),
    }));

    assert.equal(result.rawFacts.assignments.length, 1);
    assert.deepEqual(result.rawFacts.assignmentSnapshots, []);
    assert.deepEqual(result.rawFacts.assignmentSnapshotNodes, []);
  });

  test('T-C03N nodeIds root qualification requires the owning snapshot to be cutoff-eligible (F-RB1-02 root node path)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const assignmentId = created.assignment.assignment_id;
    // The assignment itself is pre-cutoff, so only its node-membership
    // qualification (via the post-cutoff snapshot) is under test here.
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    await pool.query(
      `UPDATE evidence_assignment_snapshots SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      // enrollmentIds is a nonempty primary root so this is not the
      // all-primary-empty path; NODE_A exists globally (insertGrammarNodes)
      // so its only membership under this branch is the post-cutoff
      // snapshot.
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        nodeIds: [NODE_A],
      }),
    }));

    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T-C03F itemFamilyReferences root qualification requires the owning snapshot to be cutoff-eligible (F-RB1-02 root family path)', async () => {
    const enrollment = await newEnrollment();
    const created = await newAssignment(enrollment.enrollment_id, { itemFamilyId: FAMILY_1 });
    const assignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2020-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );
    await pool.query(
      `UPDATE evidence_assignment_snapshots SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [assignmentId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      // FAMILY_1 exists globally (registerAuthorityFixture); only the
      // post-cutoff snapshot pairs it with this assignment.
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        itemFamilyReferences: [{ itemFamilyId: FAMILY_1, itemFamilyVersion: 1 }],
      }),
    }));

    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T-C04 A1: assignment-less enrollment with a matching conditionReferences filter still closes to empty_result', async () => {
    const enrollment = await newEnrollment(CONDITION_1);
    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      // Explicit enrollment root; the enrollment has zero assignments; its
      // own condition matches the supplied conditionReferences exactly;
      // every other secondary filter (assignmentIds/attemptIds already
      // empty via emptyFilters()) stays empty. conditionReferences is one
      // of the four assignment-level secondary predicates (API_CONTRACT.md
      // §13.10.11.1), so its nonempty presence here still yields
      // empty_result rather than fabricating a root from the enrollment's
      // own condition.
      filters: emptyFilters({
        enrollmentIds: [enrollment.enrollment_id],
        conditionReferences: [{ conditionId: CONDITION_1, conditionVersion: 1 }],
      }),
    }));
    assert.deepEqual(result, { status: 'empty', data: null });
  });

  test('T-C05 B1: a post-cutoff assignment does not suppress the assignment-less enrollment closure path (F-RB1-03)', async () => {
    const enrollment = await newEnrollment();
    await pool.query(
      `UPDATE evidence_enrollments SET created_at = '2020-01-01T00:00:00.000Z' WHERE enrollment_id = $1`,
      [enrollment.enrollment_id]
    );
    const created = await newAssignment(enrollment.enrollment_id);
    const postCutoffAssignmentId = created.assignment.assignment_id;
    await pool.query(
      `UPDATE evidence_assignments SET created_at = '2025-01-01T00:00:00.000Z' WHERE assignment_id = $1`,
      [postCutoffAssignmentId]
    );

    const result = await queryRawEvidenceForMetricRebuild(pool, baseInput({
      analysisCutoff: '2022-01-01T00:00:00.000Z',
      filters: emptyFilters({ enrollmentIds: [enrollment.enrollment_id] }),
    }));

    assert.equal(result.status, undefined);
    assert.equal(result.rawFacts.enrollments.length, 1);
    assert.equal(result.rawFacts.enrollments[0].enrollment_id, enrollment.enrollment_id);
    assert.deepEqual(result.rawFacts.assignments, []);
    assert.deepEqual(result.rawFacts.assignmentSnapshots, []);
    assert.deepEqual(result.rawFacts.assignmentSnapshotNodes, []);
    assert.deepEqual(result.rawFacts.attempts, []);
    assert.deepEqual(result.sourceRebuildReference.enrollmentIds, [enrollment.enrollment_id]);
    assert.ok(!result.rawFacts.assignments.some((row) => row.assignment_id === postCutoffAssignmentId));
  });
});
