'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const evidence = require('../src/instrumentation');

const repository = evidence.evidenceRepository;

const REFERENCES = Object.freeze({
  itemId: 'ITEM_EVIDENCE_P0',
  itemVersion: 1,
  scenarioId: 'SCENARIO_EVIDENCE_P0',
  scenarioVersion: 1,
  itemFamilyId: 'FAMILY_EVIDENCE_P0',
  itemFamilyVersion: 1,
  lexicalManifestId: 'LEXICAL_EVIDENCE_P0',
  lexicalManifestVersion: 1,
  rubricId: 'RUBRIC_EVIDENCE_P0',
  rubricVersion: 1,
  formulaId: 'FORMULA_EVIDENCE_P0',
  formulaVersion: 1,
  schedulerProtocolId: 'SCHEDULER_EVIDENCE_P0',
  schedulerProtocolVersion: 1,
  instrumentationProtocolId: 'INSTRUMENTATION_EVIDENCE_P0',
  instrumentationProtocolVersion: 1,
});

let participant;
let enrollment;
let baseAssignment;
let baseSession;
let baseAttempt;
let productionBefore;
let fixtureOrdinal = 0;

const CLASSIFICATIONS = [
  'NO_ERROR',
  'LINGUISTIC_ERROR',
  'TASK_INSTRUCTION_MISUNDERSTANDING',
  'MODALITY_INPUT_FAILURE',
  'NO_EVALUABLE_RESPONSE',
  'UNCLASSIFIED',
];
const LINGUISTIC_CATEGORIES = ['FORM', 'WORD_ORDER', 'LEXICAL_CHOICE', 'OTHER'];
const ATTRIBUTION_RELATIONS = ['TARGET', 'PREREQUISITE', 'CONTRAST', 'UNRESOLVED'];

function instrumentationDefinition(options = {}) {
  return {
    definitionType: 'EVIDENCE_INSTRUMENTATION_PROTOCOL',
    definitionVersion: 1,
    timingPolicy: {
      collectionProfile: options.profile ?? 'FULL',
      durationConsistencyToleranceMs: options.tolerance ?? 5,
      durationMismatchBehavior: options.mismatchBehavior ?? 'REJECT',
    },
    correctionCoverageMode: options.correctionCoverageMode ?? 'COMPLETE_BUCKET_SET',
    responseBounds: {
      textMaxUtf8Bytes: options.textMaxUtf8Bytes ?? 65536,
      referenceMaxUtf8Bytes: options.referenceMaxUtf8Bytes ?? 2048,
      jsonMaxUtf8Bytes: options.jsonMaxUtf8Bytes ?? 65536,
    },
    modalityPolicy: {
      allowedStimulusModalities: options.allowedStimulusModalities
        ?? ['TEXT', 'AUDIO', 'IMAGE', 'VIDEO'],
      allowedResponseModalities: options.allowedResponseModalities
        ?? ['TEXT_ENTRY', 'SELECTION', 'STRUCTURED_ACTION', 'SPEECH'],
      stimulusCoverage: options.stimulusCoverage ?? 'EXACT_PLANNED',
      responseCoverage: options.responseCoverage ?? 'EXACT_PLANNED',
    },
  };
}

function rubricDefinition(options = {}) {
  return {
    definitionType: 'EVIDENCE_ERROR_CLASSIFICATION_RUBRIC',
    definitionVersion: 1,
    scoreMode: options.scoreMode ?? 'BINARY',
    classificationVocabulary: [...CLASSIFICATIONS],
    linguisticCategoryVocabulary: [...LINGUISTIC_CATEGORIES],
    attributionRelationVocabulary: [...ATTRIBUTION_RELATIONS],
    rubricRuleIds: ['RULE_NO_ERROR', 'RULE_LINGUISTIC', 'RULE_OTHER'],
    attributionAuthority: {
      byTargetNode: {
        NODE_EVIDENCE_A: {
          prerequisiteNodeIds: ['NODE_EVIDENCE_C'],
          contrastNodeIds: ['NODE_EVIDENCE_B'],
        },
        NODE_EVIDENCE_B: {
          prerequisiteNodeIds: ['NODE_EVIDENCE_A'],
          contrastNodeIds: ['NODE_EVIDENCE_C'],
        },
        NODE_EVIDENCE_C: {
          prerequisiteNodeIds: ['NODE_EVIDENCE_A'],
          contrastNodeIds: ['NODE_EVIDENCE_B'],
        },
      },
    },
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

function rubricOutcome(classification = 'NO_ERROR', options = {}) {
  if (classification === 'LINGUISTIC_ERROR') {
    const relation = options.attributionRelation ?? 'TARGET';
    return {
      classification,
      linguisticCategory: options.linguisticCategory ?? 'FORM',
      attributionRelation: relation,
      attributedNodeId: relation === 'TARGET'
        ? options.nodeId
        : options.attributedNodeId ?? null,
      rubricRuleId: options.rubricRuleId ?? 'RULE_LINGUISTIC',
    };
  }
  return {
    classification,
    linguisticCategory: null,
    attributionRelation: null,
    attributedNodeId: null,
    rubricRuleId: options.rubricRuleId
      ?? (classification === 'NO_ERROR' ? 'RULE_NO_ERROR' : 'RULE_OTHER'),
  };
}

function evaluation(nodeId, classification = 'NO_ERROR', options = {}) {
  const defaultCorrect = classification === 'NO_ERROR'
    ? true
    : classification === 'LINGUISTIC_ERROR'
      ? false
      : null;
  return {
    nodeId,
    rubricOutcome: rubricOutcome(classification, { ...options, nodeId }),
    isCorrect: hasOwn(options, 'isCorrect') ? options.isCorrect : defaultCorrect,
  };
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

async function resetAndMigrate() {
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await runMigrations();
}

async function createProductionFixture() {
  const { rows: userRows } = await pool.query(
    `INSERT INTO users (auth_provider, auth_identifier, timezone)
     VALUES ('GUEST', 'evidence-foundation-production-fixture', 'UTC')
     RETURNING user_id`
  );
  const userId = userRows[0].user_id;

  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES
       ('NODE_EVIDENCE_A', 'VI', '[]'::jsonb, 'Evidence A', 1),
       ('NODE_EVIDENCE_B', 'VI', '[]'::jsonb, 'Evidence B', 1),
       ('NODE_EVIDENCE_C', 'VI', '[]'::jsonb, 'Evidence C', 1)`
  );

  await pool.query(
    `INSERT INTO progress (user_id, node_id, next_review_at)
     VALUES ($1, 'NODE_EVIDENCE_A', '2030-01-02T03:04:05.000Z'::timestamptz)`,
    [userId]
  );
  await pool.query(
    `INSERT INTO attempt_records (user_id, node_id, is_correct, correction_count)
     VALUES ($1, 'NODE_EVIDENCE_A', false, 1)`,
    [userId]
  );
}

async function tableDigest(tableName, orderBy) {
  const { rows } = await pool.query(
    `SELECT row_to_json(t)::text AS row_text
       FROM (SELECT * FROM ${tableName} ORDER BY ${orderBy}) t`
  );
  return {
    count: rows.length,
    digest: createHash('sha256')
      .update(rows.map((row) => row.row_text).join('\n'), 'utf8')
      .digest('hex'),
  };
}

async function readProductionState() {
  const { rows: nextReviewRows } = await pool.query(
    `SELECT user_id::text, node_id, next_review_at::text
       FROM progress
      ORDER BY user_id, node_id`
  );
  return {
    progress: await tableDigest('progress', 'user_id, node_id'),
    attempts: await tableDigest('attempt_records', 'attempt_id'),
    nextReviewRows,
  };
}

async function registerReference(referenceKind, referenceId, version, definition) {
  return repository.registerReferenceVersion(pool, {
    referenceKind,
    referenceId,
    version,
    definition: definition ?? {
      kind: referenceKind,
      stableId: referenceId,
      version,
      nested: { z: 2, a: 1 },
    },
  });
}

async function registerAuthorityFixture() {
  await repository.registerExperimentVersion(pool, {
    experimentId: 'EXP_EVIDENCE_P0',
    version: 1,
    definition: { protocol: 'P0', nodes: 3 },
  });
  await repository.registerConditionVersion(pool, {
    conditionId: 'COND_EVIDENCE_P0',
    version: 1,
    conditionClass: 'ENGINEERING_BASELINE',
    definition: { mode: 'FIXED', dosage: 1 },
  });

  await registerReference('ITEM', REFERENCES.itemId, REFERENCES.itemVersion);
  await registerReference('SCENARIO', REFERENCES.scenarioId, REFERENCES.scenarioVersion);
  await registerReference('ITEM_FAMILY', REFERENCES.itemFamilyId, REFERENCES.itemFamilyVersion);
  await registerReference(
    'LEXICAL_MANIFEST',
    REFERENCES.lexicalManifestId,
    REFERENCES.lexicalManifestVersion
  );
  await registerReference(
    'RUBRIC',
    REFERENCES.rubricId,
    REFERENCES.rubricVersion,
    rubricDefinition()
  );
  await registerReference('FORMULA', REFERENCES.formulaId, REFERENCES.formulaVersion);
  await registerReference(
    'SCHEDULER_PROTOCOL',
    REFERENCES.schedulerProtocolId,
    REFERENCES.schedulerProtocolVersion
  );
  await registerReference(
    'INSTRUMENTATION_PROTOCOL',
    REFERENCES.instrumentationProtocolId,
    REFERENCES.instrumentationProtocolVersion,
    instrumentationDefinition()
  );
  await registerReference(
    'INSTRUMENTATION_PROTOCOL',
    'INSTRUMENTATION_EVIDENCE_OTHER',
    1
  );
}

function assignmentInput(overrides = {}) {
  const input = {
    enrollmentId: enrollment.enrollment_id,
    assignmentType: 'ASSESSMENT',
    targetTimepoint: 'IMMEDIATE',
    anchorStrategy: 'NODE_ASSIGNMENT_COMPLETION',
    targetNodeIds: ['NODE_EVIDENCE_A', 'NODE_EVIDENCE_B'],
    references: { ...REFERENCES },
    plannedStimulusModalities: ['TEXT'],
    plannedResponseModalities: ['TEXT_ENTRY'],
  };
  return { ...input, ...overrides };
}

function attemptInput(idempotencyIdentity, openPayload, overrides = {}) {
  return {
    assignmentId: baseAssignment.assignment.assignment_id,
    sessionId: baseSession.session_id,
    idempotencyIdentity,
    instrumentationProtocolId: REFERENCES.instrumentationProtocolId,
    instrumentationProtocolVersion: REFERENCES.instrumentationProtocolVersion,
    openPayload,
    ...overrides,
  };
}

async function countRows(tableName) {
  const { rows } = await pool.query(`SELECT count(*) AS n FROM ${tableName}`);
  return Number(rows[0].n);
}

async function readAssignmentCounts() {
  return {
    assignments: await countRows('evidence_assignments'),
    snapshots: await countRows('evidence_assignment_snapshots'),
    nodes: await countRows('evidence_assignment_snapshot_nodes'),
  };
}

async function createSession(enrollmentId) {
  const { rows } = await pool.query(
    `INSERT INTO evidence_sessions (enrollment_id)
     VALUES ($1)
     RETURNING *`,
    [enrollmentId]
  );
  return rows[0];
}

async function createConfiguredAttempt(options = {}) {
  fixtureOrdinal += 1;
  const suffix = `${fixtureOrdinal}`;
  const protocolId = options.protocolId ?? REFERENCES.instrumentationProtocolId;
  const rubricId = options.rubricId ?? REFERENCES.rubricId;
  if (options.protocolDefinition) {
    await registerReference(
      'INSTRUMENTATION_PROTOCOL',
      protocolId,
      1,
      options.protocolDefinition
    );
  }
  if (options.rubricDefinition) {
    await registerReference('RUBRIC', rubricId, 1, options.rubricDefinition);
  }
  const targetNodeIds = options.targetNodeIds ?? ['NODE_EVIDENCE_A', 'NODE_EVIDENCE_B'];
  const assignment = await repository.createAssignment(pool, assignmentInput({
    targetNodeIds,
    references: {
      ...REFERENCES,
      instrumentationProtocolId: protocolId,
      instrumentationProtocolVersion: 1,
      rubricId,
      rubricVersion: 1,
    },
    plannedStimulusModalities: options.plannedStimulusModalities ?? ['TEXT'],
    plannedResponseModalities: options.plannedResponseModalities ?? ['TEXT_ENTRY'],
  }));
  const session = await createSession(enrollment.enrollment_id);
  const attempt = await repository.openAttempt(pool, {
    assignmentId: assignment.assignment.assignment_id,
    sessionId: session.session_id,
    idempotencyIdentity: `open-${suffix}`,
    instrumentationProtocolId: protocolId,
    instrumentationProtocolVersion: 1,
    openPayload: { fixtureOrdinal },
  });
  return { assignment, session, attempt, protocolId, rubricId, targetNodeIds };
}

function finalizationInputFor(fixture, overrides = {}) {
  return {
    attemptId: fixture.attempt.attemptId,
    finalizationIdempotencyIdentity: `final-${fixture.attempt.attemptId}`,
    instrumentationProtocolId: fixture.protocolId,
    instrumentationProtocolVersion: 1,
    responseKind: 'TEXT',
    responseText: 'learner response',
    inputEnabledOffsetMs: 100,
    firstValidActivityOffsetMs: 120,
    submittedOffsetMs: 200,
    reportedClientMonotonicDurationMs: 100,
    actualStimulusModalities: ['TEXT'],
    actualResponseModalities: ['TEXT_ENTRY'],
    evaluations: fixture.targetNodeIds.map((nodeId) => evaluation(nodeId)),
    correctionAggregates: correctionBuckets(0),
    ...overrides,
  };
}

function withoutTiming(input) {
  const result = { ...input };
  for (const key of [
    'inputEnabledOffsetMs',
    'firstValidActivityOffsetMs',
    'submittedOffsetMs',
    'reportedClientMonotonicDurationMs',
  ]) {
    delete result[key];
  }
  return result;
}

async function readFinalizationCounts(attemptId) {
  const queries = await Promise.all([
    pool.query(
      'SELECT count(*) AS n FROM evidence_attempt_finalizations WHERE attempt_id = $1',
      [attemptId]
    ),
    pool.query(
      'SELECT count(*) AS n FROM evidence_target_node_evaluations WHERE attempt_id = $1',
      [attemptId]
    ),
    pool.query(
      'SELECT count(*) AS n FROM evidence_correction_aggregates WHERE attempt_id = $1',
      [attemptId]
    ),
  ]);
  return queries.map(({ rows }) => Number(rows[0].n));
}

function createFinalizationFailurePool(basePool, matcher, errorFactory) {
  return {
    async connect() {
      const client = await basePool.connect();
      return {
        async query(...args) {
          const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text;
          if (matcher.test(String(sql))) {
            throw errorFactory();
          }
          return client.query(...args);
        },
        release() {
          client.release();
        },
      };
    },
    query: basePool.query.bind(basePool),
  };
}

function createAttemptInsertFailurePool(basePool) {
  return {
    async connect() {
      const client = await basePool.connect();
      return {
        async query(...args) {
          const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text;
          if (/INSERT\s+INTO\s+evidence_attempts\b/i.test(String(sql))) {
            throw new Error('test-controlled attempt insert failure');
          }
          return client.query(...args);
        },
        release() {
          client.release();
        },
      };
    },
    query: basePool.query.bind(basePool),
  };
}

describe('Evidence Foundation P0 repository', { concurrency: false }, () => {
  before(async () => {
    await resetAndMigrate();
    await createProductionFixture();
    productionBefore = await readProductionState();
    await registerAuthorityFixture();

    participant = await repository.createParticipant(pool, {});
    enrollment = await repository.createEnrollment(pool, {
      participantId: participant.participant_id,
      experimentId: 'EXP_EVIDENCE_P0',
      experimentVersion: 1,
      conditionId: 'COND_EVIDENCE_P0',
      conditionVersion: 1,
    });
    baseAssignment = await repository.createAssignment(pool, assignmentInput());
    baseSession = await createSession(enrollment.enrollment_id);
    baseAttempt = await repository.openAttempt(
      pool,
      attemptInput('idem-attempt-base', { responseMode: 'TEXT', promptOrdinal: 1 })
    );
  });

  after(async () => {
    await pool.end();
  });

  test('equivalent immutable version registration replays the existing row', async () => {
    const experimentReplay = await repository.registerExperimentVersion(pool, {
      experimentId: 'EXP_EVIDENCE_P0',
      version: 1,
      definition: { nodes: 3, protocol: 'P0' },
    });
    assert.equal(experimentReplay.replayed, true);

    const conditionReplay = await repository.registerConditionVersion(pool, {
      conditionId: 'COND_EVIDENCE_P0',
      version: 1,
      conditionClass: 'ENGINEERING_BASELINE',
      definition: { dosage: 1, mode: 'FIXED' },
    });
    assert.equal(conditionReplay.replayed, true);

    const referenceReplay = await registerReference(
      'ITEM',
      REFERENCES.itemId,
      REFERENCES.itemVersion
    );
    assert.equal(referenceReplay.replayed, true);
  });

  test('conflicting content for the same immutable version is rejected', async () => {
    await rejectsWithCode(
      () => repository.registerExperimentVersion(pool, {
        experimentId: 'EXP_EVIDENCE_P0',
        version: 1,
        definition: { protocol: 'P0-CONFLICT', nodes: 3 },
      }),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => repository.registerReferenceVersion(pool, {
        referenceKind: 'ITEM',
        referenceId: REFERENCES.itemId,
        version: REFERENCES.itemVersion,
        definition: { different: true },
      }),
      'CONTRACT_VIOLATION'
    );
  });

  test('direct PII participant payload is rejected without a row', async () => {
    const before = await countRows('evidence_participants');
    await rejectsWithCode(
      () => repository.createParticipant(pool, { profile: { email: 'learner@example.test' } }),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_participants'), before);
  });

  test('participant and enrollment creation persist pseudonymous ownership only', async () => {
    const storedParticipant = await repository.getParticipant(pool, participant.participant_id);
    const storedEnrollment = await repository.getEnrollment(pool, enrollment.enrollment_id);
    assert.equal(storedParticipant.participant_id, participant.participant_id);
    assert.equal(storedEnrollment.participant_id, participant.participant_id);
    assert.equal(storedEnrollment.status, 'ACTIVE');
    assert.equal(storedEnrollment.experiment_id, 'EXP_EVIDENCE_P0');
    assert.equal(storedEnrollment.condition_id, 'COND_EVIDENCE_P0');
  });

  test('assignment, snapshot, all eight fixed-kind references, and target nodes commit atomically', async () => {
    const before = await readAssignmentCounts();
    const created = await repository.createAssignment(pool, assignmentInput());

    assert.equal(created.assignment.enrollment_id, enrollment.enrollment_id);
    assert.equal(created.snapshot.assignment_id, created.assignment.assignment_id);
    assert.deepEqual(
      created.targetNodes.map((row) => row.node_id),
      ['NODE_EVIDENCE_A', 'NODE_EVIDENCE_B']
    );
    assert.equal(created.snapshot.item_id, REFERENCES.itemId);
    assert.equal(created.snapshot.scenario_id, REFERENCES.scenarioId);
    assert.equal(created.snapshot.item_family_id, REFERENCES.itemFamilyId);
    assert.equal(created.snapshot.lexical_manifest_id, REFERENCES.lexicalManifestId);
    assert.equal(created.snapshot.rubric_id, REFERENCES.rubricId);
    assert.equal(created.snapshot.formula_id, REFERENCES.formulaId);
    assert.equal(created.snapshot.scheduler_protocol_id, REFERENCES.schedulerProtocolId);
    assert.equal(
      created.snapshot.instrumentation_protocol_id,
      REFERENCES.instrumentationProtocolId
    );
    assert.equal(created.snapshot.snapshot_digest, baseAssignment.snapshot.snapshot_digest);
    assert.deepEqual(await readAssignmentCounts(), {
      assignments: before.assignments + 1,
      snapshots: before.snapshots + 1,
      nodes: before.nodes + 2,
    });
  });

  test('unknown fixed-kind reference rejects the complete assignment aggregate', async () => {
    const before = await readAssignmentCounts();
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({
        references: { ...REFERENCES, itemId: 'ITEM_DOES_NOT_EXIST' },
      })),
      'INVALID_ID'
    );
    assert.deepEqual(await readAssignmentCounts(), before);
  });

  test('wrong-kind substitution cannot satisfy an exact ITEM lookup', async () => {
    await registerReference('SCENARIO', 'REFERENCE_WRONG_KIND_SHARED', 1);
    const before = await readAssignmentCounts();
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({
        references: {
          ...REFERENCES,
          itemId: 'REFERENCE_WRONG_KIND_SHARED',
          itemVersion: 1,
        },
      })),
      'INVALID_ID'
    );
    assert.deepEqual(await readAssignmentCounts(), before);
  });

  test('missing and partial reference bundles reject without partial writes', async () => {
    const before = await readAssignmentCounts();
    const missing = { ...REFERENCES };
    delete missing.formulaId;
    delete missing.formulaVersion;
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({ references: missing })),
      'MISSING_REQUIRED_FIELD'
    );
    assert.deepEqual(await readAssignmentCounts(), before);

    const partial = { ...REFERENCES };
    delete partial.rubricVersion;
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({ references: partial })),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(await readAssignmentCounts(), before);
  });

  test('unknown target node causes full assignment rollback', async () => {
    const before = await readAssignmentCounts();
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({
        targetNodeIds: ['NODE_EVIDENCE_A', 'NODE_UNKNOWN_EVIDENCE'],
      })),
      'INVALID_ID'
    );
    assert.deepEqual(await readAssignmentCounts(), before);
  });

  test('duplicate target node is rejected before any assignment write', async () => {
    const before = await readAssignmentCounts();
    await rejectsWithCode(
      () => repository.createAssignment(pool, assignmentInput({
        targetNodeIds: ['NODE_EVIDENCE_A', 'NODE_EVIDENCE_A'],
      })),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(await readAssignmentCounts(), before);
  });

  test('assignment/session cross-enrollment attempt open is rejected', async () => {
    const otherParticipant = await repository.createParticipant(pool, {});
    const otherEnrollment = await repository.createEnrollment(pool, {
      participantId: otherParticipant.participant_id,
      experimentId: 'EXP_EVIDENCE_P0',
      experimentVersion: 1,
      conditionId: 'COND_EVIDENCE_P0',
      conditionVersion: 1,
    });
    const otherSession = await createSession(otherEnrollment.enrollment_id);
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');

    await rejectsWithCode(
      () => repository.openAttempt(pool, attemptInput(
        'idem-cross-enrollment',
        { responseMode: 'TEXT' },
        { sessionId: otherSession.session_id }
      )),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries);
  });

  test('terminal session and instrumentation mismatch are rejected before attempt creation', async () => {
    const terminalSession = await createSession(enrollment.enrollment_id);
    await pool.query(
      `UPDATE evidence_sessions
          SET ended_at = now(), terminal_outcome = 'COMPLETED'
        WHERE session_id = $1`,
      [terminalSession.session_id]
    );
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');

    await rejectsWithCode(
      () => repository.openAttempt(pool, attemptInput(
        'idem-terminal-session',
        { responseMode: 'TEXT' },
        { sessionId: terminalSession.session_id }
      )),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => repository.openAttempt(pool, attemptInput(
        'idem-instrumentation-mismatch',
        { responseMode: 'TEXT' },
        {
          instrumentationProtocolId: 'INSTRUMENTATION_EVIDENCE_OTHER',
          instrumentationProtocolVersion: 1,
        }
      )),
      'CONTRACT_VIOLATION'
    );

    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries);
  });

  test('attempt series and attempt open commit atomically', async () => {
    const assignment = await repository.createAssignment(pool, assignmentInput({
      targetNodeIds: ['NODE_EVIDENCE_C'],
    }));
    const session = await createSession(enrollment.enrollment_id);
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');

    const result = await repository.openAttempt(pool, {
      assignmentId: assignment.assignment.assignment_id,
      sessionId: session.session_id,
      idempotencyIdentity: 'idem-independent-attempt',
      instrumentationProtocolId: REFERENCES.instrumentationProtocolId,
      instrumentationProtocolVersion: REFERENCES.instrumentationProtocolVersion,
      openPayload: { responseMode: 'TEXT' },
    });

    assert.equal(result.replayed, false);
    assert.equal(result.retryOrdinal, 0);
    assert.equal(await countRows('evidence_attempts'), beforeAttempts + 1);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries + 1);
    const stored = await repository.getAttemptById(pool, result.attemptId);
    assert.equal(stored.attempt_series_id, result.attemptSeriesId);
  });

  test('same key and same normalized payload replays one attempt', async () => {
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');
    const replay = await repository.openAttempt(
      pool,
      attemptInput('idem-attempt-base', { promptOrdinal: 1, responseMode: 'TEXT' })
    );
    assert.equal(replay.replayed, true);
    assert.equal(replay.attemptId, baseAttempt.attemptId);
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries);
  });

  test('same key and different payload returns CONTRACT_VIOLATION', async () => {
    const beforeAttempts = await countRows('evidence_attempts');
    await rejectsWithCode(
      () => repository.openAttempt(
        pool,
        attemptInput('idem-attempt-base', { responseMode: 'SELECTION', promptOrdinal: 1 })
      ),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
  });

  test('concurrent same-key same-payload requests create exactly one attempt', async () => {
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');
    const request = attemptInput('idem-attempt-concurrent', {
      responseMode: 'TEXT',
      promptOrdinal: 2,
      semantic: { b: 2, a: 1 },
    });

    const results = await Promise.all([
      repository.openAttempt(pool, request),
      repository.openAttempt(pool, {
        ...request,
        openPayload: {
          semantic: { a: 1, b: 2 },
          promptOrdinal: 2,
          responseMode: 'TEXT',
        },
      }),
    ]);

    assert.equal(new Set(results.map((result) => result.attemptId)).size, 1);
    assert.equal(results.filter((result) => result.replayed).length, 1);
    assert.equal(await countRows('evidence_attempts'), beforeAttempts + 1);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries + 1);
  });

  test('supported retry validates parent, assignment, series, ownership, and ordinal', async () => {
    const retry = await repository.openAttempt(pool, attemptInput(
      'idem-valid-retry',
      { responseMode: 'TEXT', retry: true },
      {
        attemptSeriesId: baseAttempt.attemptSeriesId,
        retryOfAttemptId: baseAttempt.attemptId,
      }
    ));
    assert.equal(retry.replayed, false);
    assert.equal(retry.attemptSeriesId, baseAttempt.attemptSeriesId);
    assert.equal(retry.retryOfAttemptId, baseAttempt.attemptId);
    assert.equal(retry.retryOrdinal, 1);
  });

  test('unknown retry parent is rejected without consuming an ordinal', async () => {
    const beforeAttempts = await countRows('evidence_attempts');
    await rejectsWithCode(
      () => repository.openAttempt(pool, attemptInput(
        'idem-unknown-retry-parent',
        { responseMode: 'TEXT', retry: true },
        {
          attemptSeriesId: baseAttempt.attemptSeriesId,
          retryOfAttemptId: '00000000-0000-4000-8000-000000000123',
        }
      )),
      'INVALID_ID'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
  });

  test('retry parent from another assignment is rejected', async () => {
    const otherAssignment = await repository.createAssignment(pool, assignmentInput({
      targetNodeIds: ['NODE_EVIDENCE_C'],
    }));
    const otherSession = await createSession(enrollment.enrollment_id);
    const otherInitial = await repository.openAttempt(pool, {
      assignmentId: otherAssignment.assignment.assignment_id,
      sessionId: otherSession.session_id,
      idempotencyIdentity: 'idem-other-assignment-initial',
      instrumentationProtocolId: REFERENCES.instrumentationProtocolId,
      instrumentationProtocolVersion: REFERENCES.instrumentationProtocolVersion,
      openPayload: { responseMode: 'TEXT' },
    });
    const beforeAttempts = await countRows('evidence_attempts');

    await rejectsWithCode(
      () => repository.openAttempt(pool, {
        assignmentId: otherAssignment.assignment.assignment_id,
        sessionId: otherSession.session_id,
        idempotencyIdentity: 'idem-cross-assignment-retry',
        attemptSeriesId: otherInitial.attemptSeriesId,
        retryOfAttemptId: baseAttempt.attemptId,
        instrumentationProtocolId: REFERENCES.instrumentationProtocolId,
        instrumentationProtocolVersion: REFERENCES.instrumentationProtocolVersion,
        openPayload: { responseMode: 'TEXT', retry: true },
      }),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
  });

  test('retry parent from another series in the same assignment is rejected', async () => {
    const secondSeriesInitial = await repository.openAttempt(
      pool,
      attemptInput('idem-second-series-initial', { responseMode: 'TEXT', series: 2 })
    );
    const beforeAttempts = await countRows('evidence_attempts');

    await rejectsWithCode(
      () => repository.openAttempt(pool, attemptInput(
        'idem-cross-series-retry',
        { responseMode: 'TEXT', retry: true },
        {
          attemptSeriesId: baseAttempt.attemptSeriesId,
          retryOfAttemptId: secondSeriesInitial.attemptId,
        }
      )),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
  });

  test('finalizeAttempt happy path returns the exact projection and stores the complete aggregate', async () => {
    const fixture = {
      attempt: baseAttempt,
      protocolId: REFERENCES.instrumentationProtocolId,
      rubricId: REFERENCES.rubricId,
      targetNodeIds: ['NODE_EVIDENCE_A', 'NODE_EVIDENCE_B'],
    };
    const input = finalizationInputFor(fixture, {
      evaluations: [
        evaluation('NODE_EVIDENCE_B', 'LINGUISTIC_ERROR', {
          linguisticCategory: 'WORD_ORDER',
          attributionRelation: 'TARGET',
        }),
        evaluation('NODE_EVIDENCE_A'),
      ],
      correctionAggregates: correctionBuckets(0).reverse(),
    });
    const result = await repository.finalizeAttempt(pool, input);

    assert.deepEqual(Object.keys(result), [
      'replayed',
      'attemptId',
      'assignmentId',
      'sessionId',
      'finalizationIdempotencyIdentity',
      'serverReceivedAt',
      'finalizedAt',
      'clockQuality',
      'responseKind',
      'attemptOutcome',
      'instrumentationProtocolId',
      'instrumentationProtocolVersion',
      'rubricId',
      'rubricVersion',
      'evaluationCount',
      'correctionBucketCount',
    ]);
    assert.equal(result.replayed, false);
    assert.equal(result.attemptId, baseAttempt.attemptId);
    assert.equal(result.assignmentId, baseAssignment.assignment.assignment_id);
    assert.equal(result.sessionId, baseSession.session_id);
    assert.equal(result.clockQuality, 'VALID');
    assert.equal(result.responseKind, 'TEXT');
    assert.equal(result.attemptOutcome, 'SCORABLE');
    assert.equal(result.rubricId, REFERENCES.rubricId);
    assert.equal(result.rubricVersion, 1);
    assert.equal(result.evaluationCount, 2);
    assert.equal(result.correctionBucketCount, 12);
    assert.ok(Date.parse(result.finalizedAt) >= Date.parse(result.serverReceivedAt));

    const { rows: finalizations } = await pool.query(
      'SELECT * FROM evidence_attempt_finalizations WHERE attempt_id = $1',
      [baseAttempt.attemptId]
    );
    assert.equal(finalizations.length, 1);
    assert.equal(finalizations[0].response_text, 'learner response');
    assert.deepEqual(finalizations[0].replay_result, result);
    const { rows: evaluations } = await pool.query(
      `SELECT node_id, rubric_id, rubric_version, scorable, is_correct, evaluation_source
         FROM evidence_target_node_evaluations
        WHERE attempt_id = $1
        ORDER BY created_at, node_id`,
      [baseAttempt.attemptId]
    );
    assert.deepEqual(evaluations.map((row) => row.node_id), [
      'NODE_EVIDENCE_A',
      'NODE_EVIDENCE_B',
    ]);
    assert.ok(evaluations.every((row) => row.evaluation_source === 'RULE'));
    assert.ok(evaluations.every((row) => row.rubric_id === REFERENCES.rubricId));
    assert.deepEqual(await readFinalizationCounts(baseAttempt.attemptId), [1, 2, 12]);
  });

  test('protocol snapshot mismatch rejects before writing any aggregate row', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture, {
      instrumentationProtocolId: 'INSTRUMENTATION_EVIDENCE_OTHER',
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, input),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('malformed pinned instrumentation definitions are rejected on consumption', async () => {
    const malformedDefinitions = [
      {
        id: 'INSTRUMENTATION_MALFORMED_KEYS',
        definition: {
          ...instrumentationDefinition(),
          extra: true,
        },
      },
      {
        id: 'INSTRUMENTATION_MALFORMED_NONE',
        definition: instrumentationDefinition({
          profile: 'NONE',
          tolerance: 1,
          mismatchBehavior: 'MARK_INVALID',
        }),
      },
      {
        id: 'INSTRUMENTATION_MALFORMED_BOUND',
        definition: instrumentationDefinition({ textMaxUtf8Bytes: 65537 }),
      },
    ];
    for (const entry of malformedDefinitions) {
      const fixture = await createConfiguredAttempt({
        protocolId: entry.id,
        protocolDefinition: entry.definition,
      });
      await rejectsWithCode(
        () => repository.finalizeAttempt(pool, finalizationInputFor(fixture)),
        'CONTRACT_VIOLATION'
      );
      assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
    }
  });

  test('malformed pinned rubric definitions are rejected on consumption', async () => {
    const wrongVocabulary = rubricDefinition();
    wrongVocabulary.classificationVocabulary = [...CLASSIFICATIONS].reverse();
    const missingAuthority = rubricDefinition();
    delete missingAuthority.attributionAuthority.byTargetNode.NODE_EVIDENCE_B;
    const malformedDefinitions = [
      ['RUBRIC_MALFORMED_VOCAB', wrongVocabulary],
      ['RUBRIC_MALFORMED_AUTHORITY', missingAuthority],
      ['RUBRIC_MALFORMED_RULES', { ...rubricDefinition(), rubricRuleIds: [] }],
    ];
    for (const [rubricId, definition] of malformedDefinitions) {
      const fixture = await createConfiguredAttempt({ rubricId, rubricDefinition: definition });
      await rejectsWithCode(
        () => repository.finalizeAttempt(pool, finalizationInputFor(fixture)),
        'CONTRACT_VIOLATION'
      );
      assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
    }
  });

  test('evaluation coverage rejects missing, extra, and duplicate target nodes', async () => {
    const fixture = await createConfiguredAttempt();
    const cases = [
      [evaluation('NODE_EVIDENCE_A')],
      [
        evaluation('NODE_EVIDENCE_A'),
        evaluation('NODE_EVIDENCE_B'),
        evaluation('NODE_EVIDENCE_C'),
      ],
      [evaluation('NODE_EVIDENCE_A'), evaluation('NODE_EVIDENCE_A')],
    ];
    for (const evaluations of cases) {
      await rejectsWithCode(
        () => repository.finalizeAttempt(
          pool,
          finalizationInputFor(fixture, { evaluations })
        ),
        'CONTRACT_VIOLATION'
      );
    }
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('snapshot ordinal, not caller order, controls evaluation insertion order', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture, {
      evaluations: [
        evaluation('NODE_EVIDENCE_B'),
        evaluation('NODE_EVIDENCE_A'),
      ],
    });
    await repository.finalizeAttempt(pool, input);
    const { rows } = await pool.query(
      `SELECT e.node_id
         FROM evidence_target_node_evaluations e
         JOIN evidence_assignment_snapshot_nodes n
           ON n.assignment_id = $2 AND n.node_id = e.node_id
        WHERE e.attempt_id = $1
        ORDER BY n.ordinal`,
      [fixture.attempt.attemptId, fixture.assignment.assignment.assignment_id]
    );
    assert.deepEqual(rows.map((row) => row.node_id), [
      'NODE_EVIDENCE_A',
      'NODE_EVIDENCE_B',
    ]);
  });

  test('all classifications obey binary scorable and correctness consistency', async () => {
    for (const classification of CLASSIFICATIONS) {
      const fixture = await createConfiguredAttempt();
      let input = finalizationInputFor(fixture, {
        evaluations: fixture.targetNodeIds.map((nodeId) => (
          classification === 'LINGUISTIC_ERROR'
            ? evaluation(nodeId, classification, { attributionRelation: 'TARGET' })
            : evaluation(nodeId, classification)
        )),
      });
      if (classification === 'MODALITY_INPUT_FAILURE') {
        input = {
          ...input,
          responseKind: 'NORMAL_EMPTY',
        };
        delete input.responseText;
      }
      const result = await repository.finalizeAttempt(pool, input);
      const { rows } = await pool.query(
        `SELECT scorable, is_correct
           FROM evidence_target_node_evaluations
          WHERE attempt_id = $1`,
        [fixture.attempt.attemptId]
      );
      const expectedScorable = ['NO_ERROR', 'LINGUISTIC_ERROR'].includes(classification);
      assert.ok(rows.every((row) => row.scorable === expectedScorable));
      if (!expectedScorable) assert.ok(rows.every((row) => row.is_correct === null));
      assert.equal(
        result.attemptOutcome,
        classification === 'MODALITY_INPUT_FAILURE'
          ? 'TECHNICAL_INVALID'
          : expectedScorable
            ? 'SCORABLE'
            : 'UNSCORABLE'
      );
    }
  });

  test('binary and non-binary isCorrect mismatches are rejected', async () => {
    const binary = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(binary, {
        evaluations: binary.targetNodeIds.map(
          (nodeId) => evaluation(nodeId, 'NO_ERROR', { isCorrect: false })
        ),
      })),
      'CONTRACT_VIOLATION'
    );

    const nonBinary = await createConfiguredAttempt({
      rubricId: 'RUBRIC_NON_BINARY',
      rubricDefinition: rubricDefinition({ scoreMode: 'NON_BINARY' }),
    });
    const valid = finalizationInputFor(nonBinary, {
      evaluations: nonBinary.targetNodeIds.map(
        (nodeId) => evaluation(nodeId, 'NO_ERROR', { isCorrect: null })
      ),
    });
    const result = await repository.finalizeAttempt(pool, valid);
    assert.equal(result.attemptOutcome, 'SCORABLE');

    const invalidFixture = await createConfiguredAttempt({
      rubricId: 'RUBRIC_NON_BINARY',
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(invalidFixture)),
      'CONTRACT_VIOLATION'
    );
  });

  test('TARGET, PREREQUISITE, CONTRAST, and UNRESOLVED attributions persist', async () => {
    const cases = [
      ['TARGET', undefined],
      ['PREREQUISITE', 'NODE_EVIDENCE_C'],
      ['CONTRAST', 'NODE_EVIDENCE_B'],
      ['UNRESOLVED', null],
    ];
    for (const [relation, attributedNodeId] of cases) {
      const fixture = await createConfiguredAttempt();
      const result = await repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
        evaluations: [
          evaluation('NODE_EVIDENCE_A', 'LINGUISTIC_ERROR', {
            attributionRelation: relation,
            attributedNodeId,
          }),
          evaluation('NODE_EVIDENCE_B'),
        ],
      }));
      assert.equal(result.attemptOutcome, 'SCORABLE');
      const { rows } = await pool.query(
        `SELECT rubric_outcome
           FROM evidence_target_node_evaluations
          WHERE attempt_id = $1 AND node_id = 'NODE_EVIDENCE_A'`,
        [fixture.attempt.attemptId]
      );
      assert.equal(rows[0].rubric_outcome.attributionRelation, relation);
    }
  });

  test('unauthorized and nonexistent attributed nodes are distinguished', async () => {
    const fixture = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
        evaluations: [
          evaluation('NODE_EVIDENCE_A', 'LINGUISTIC_ERROR', {
            attributionRelation: 'PREREQUISITE',
            attributedNodeId: 'NODE_EVIDENCE_B',
          }),
          evaluation('NODE_EVIDENCE_B'),
        ],
      })),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
        evaluations: [
          evaluation('NODE_EVIDENCE_A', 'LINGUISTIC_ERROR', {
            attributionRelation: 'PREREQUISITE',
            attributedNodeId: 'NODE_DOES_NOT_EXIST',
          }),
          evaluation('NODE_EVIDENCE_B'),
        ],
      })),
      'INVALID_ID'
    );
  });

  test('TEXT, JSON object, JSON array, REFERENCE, and NORMAL_EMPTY representations persist', async () => {
    const cases = [
      { responseKind: 'TEXT', responseText: '  preserved text  ' },
      { responseKind: 'JSON', responseJson: { z: 1, a: [3, 2, 1] } },
      { responseKind: 'JSON', responseJson: [{ z: 2 }, { a: 1 }] },
      { responseKind: 'REFERENCE', responseRef: '  ref://answer/1  ' },
      { responseKind: 'NORMAL_EMPTY' },
    ];
    for (const response of cases) {
      const fixture = await createConfiguredAttempt();
      const input = finalizationInputFor(fixture, {
        ...response,
        evaluations: response.responseKind === 'NORMAL_EMPTY'
          ? fixture.targetNodeIds.map((nodeId) => evaluation(nodeId, 'NO_EVALUABLE_RESPONSE'))
          : fixture.targetNodeIds.map((nodeId) => evaluation(nodeId)),
      });
      for (const field of ['responseText', 'responseJson', 'responseRef']) {
        if (!hasOwn(response, field)) delete input[field];
      }
      const result = await repository.finalizeAttempt(pool, input);
      assert.equal(result.responseKind, response.responseKind);
      const { rows } = await pool.query(
        'SELECT response_text, response_json, response_ref FROM evidence_attempt_finalizations WHERE attempt_id = $1',
        [fixture.attempt.attemptId]
      );
      if (response.responseKind === 'TEXT') {
        assert.equal(rows[0].response_text, '  preserved text  ');
      } else if (response.responseKind === 'REFERENCE') {
        assert.equal(rows[0].response_ref, 'ref://answer/1');
      } else if (response.responseKind === 'JSON') {
        assert.deepEqual(rows[0].response_json, response.responseJson);
      }
    }
  });

  test('response payload exclusivity, whitespace, and invalid JSON-compatible values reject', async () => {
    const fixture = await createConfiguredAttempt();
    const invalidInputs = [
      finalizationInputFor(fixture, { responseJson: {} }),
      finalizationInputFor(fixture, { responseText: '   ' }),
      (() => {
        const value = finalizationInputFor(fixture, {
          responseKind: 'JSON',
          responseJson: { nested: undefined },
        });
        delete value.responseText;
        return value;
      })(),
      (() => {
        const value = finalizationInputFor(fixture, {
          responseKind: 'JSON',
          responseJson: { nested: new Date() },
        });
        delete value.responseText;
        return value;
      })(),
      (() => {
        const value = finalizationInputFor(fixture, {
          responseKind: 'JSON',
          responseJson: { nested: 1n },
        });
        delete value.responseText;
        return value;
      })(),
      (() => {
        const value = finalizationInputFor(fixture, {
          responseKind: 'JSON',
          responseJson: { nested: Number.POSITIVE_INFINITY },
        });
        delete value.responseText;
        return value;
      })(),
      (() => {
        class InvalidPayload {}
        const value = finalizationInputFor(fixture, {
          responseKind: 'JSON',
          responseJson: new InvalidPayload(),
        });
        delete value.responseText;
        return value;
      })(),
    ];
    for (const input of invalidInputs) {
      await rejectsWithCode(
        () => repository.finalizeAttempt(pool, input),
        'CONTRACT_VIOLATION'
      );
    }
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('protocol response bounds use UTF-8 and PostgreSQL JSONB text semantics', async () => {
    const textFixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_TEXT_BOUND',
      protocolDefinition: instrumentationDefinition({ textMaxUtf8Bytes: 3 }),
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(
        pool,
        finalizationInputFor(textFixture, { responseText: '가a' })
      ),
      'OUT_OF_RANGE_VALUE'
    );

    const referenceFixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_REFERENCE_BOUND',
      protocolDefinition: instrumentationDefinition({ referenceMaxUtf8Bytes: 4 }),
    });
    const referenceInput = finalizationInputFor(referenceFixture, {
      responseKind: 'REFERENCE',
      responseRef: ' abcde ',
    });
    delete referenceInput.responseText;
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, referenceInput),
      'OUT_OF_RANGE_VALUE'
    );

    const jsonFixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_JSON_BOUND',
      protocolDefinition: instrumentationDefinition({ jsonMaxUtf8Bytes: 8 }),
    });
    const jsonInput = finalizationInputFor(jsonFixture, {
      responseKind: 'JSON',
      responseJson: { a: 1 },
    });
    delete jsonInput.responseText;
    await repository.finalizeAttempt(pool, jsonInput);

    const hardFixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_HARD_BOUND',
      protocolDefinition: instrumentationDefinition({ jsonMaxUtf8Bytes: 65537 }),
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(hardFixture)),
      'CONTRACT_VIOLATION'
    );

    const absoluteTextFixture = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(absoluteTextFixture, {
        responseText: 'a'.repeat(65537),
      })),
      'OUT_OF_RANGE_VALUE'
    );

    const absoluteReferenceFixture = await createConfiguredAttempt();
    const absoluteReferenceInput = finalizationInputFor(absoluteReferenceFixture, {
      responseKind: 'REFERENCE',
      responseRef: 'r'.repeat(2049),
    });
    delete absoluteReferenceInput.responseText;
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, absoluteReferenceInput),
      'OUT_OF_RANGE_VALUE'
    );
  });

  test('finalization preserves nested server-like JSON keys and attempt-open normalization is unchanged', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture, {
      responseKind: 'JSON',
      responseJson: {
        createdAt: 'learner-value',
        nested: {
          finalizedAt: 'also-learner-value',
          digestAlgorithm: 'learner-metadata',
        },
      },
    });
    delete input.responseText;
    await repository.finalizeAttempt(pool, input);
    const { rows } = await pool.query(
      'SELECT response_json FROM evidence_attempt_finalizations WHERE attempt_id = $1',
      [fixture.attempt.attemptId]
    );
    assert.equal(rows[0].response_json.createdAt, 'learner-value');
    assert.equal(rows[0].response_json.nested.finalizedAt, 'also-learner-value');
    assert.equal(rows[0].response_json.nested.digestAlgorithm, 'learner-metadata');
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, {
        ...input,
        responseJson: {
          ...input.responseJson,
          nested: { ...input.responseJson.nested, finalizedAt: 'changed-by-learner' },
        },
      }),
      'CONTRACT_VIOLATION'
    );

    const openFixture = await createConfiguredAttempt();
    const replay = await repository.openAttempt(pool, {
      assignmentId: openFixture.assignment.assignment.assignment_id,
      sessionId: openFixture.session.session_id,
      idempotencyIdentity: 'attempt-open-normalization-regression',
      instrumentationProtocolId: openFixture.protocolId,
      instrumentationProtocolVersion: 1,
      openPayload: { nested: { createdAt: 'server-like', learner: 1 } },
    });
    const equivalent = await repository.openAttempt(pool, {
      assignmentId: openFixture.assignment.assignment.assignment_id,
      sessionId: openFixture.session.session_id,
      idempotencyIdentity: 'attempt-open-normalization-regression',
      instrumentationProtocolId: openFixture.protocolId,
      instrumentationProtocolVersion: 1,
      openPayload: { nested: { learner: 1 } },
    });
    assert.equal(replay.replayed, false);
    assert.equal(equivalent.replayed, true);
    assert.equal(equivalent.attemptId, replay.attemptId);
  });

  test('FULL, RESPONSE_ONLY, and NONE profiles derive VALID, DEGRADED, and UNKNOWN', async () => {
    const full = await createConfiguredAttempt();
    assert.equal(
      (await repository.finalizeAttempt(pool, finalizationInputFor(full))).clockQuality,
      'VALID'
    );

    const responseOnlyValid = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_RESPONSE_ONLY_VALID',
      protocolDefinition: instrumentationDefinition({ profile: 'RESPONSE_ONLY' }),
    });
    assert.equal(
      (await repository.finalizeAttempt(
        pool,
        finalizationInputFor(responseOnlyValid)
      )).clockQuality,
      'VALID'
    );

    const responseOnlyDegraded = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_RESPONSE_ONLY_DEGRADED',
      protocolDefinition: instrumentationDefinition({ profile: 'RESPONSE_ONLY' }),
    });
    const degradedInput = finalizationInputFor(responseOnlyDegraded);
    delete degradedInput.firstValidActivityOffsetMs;
    delete degradedInput.reportedClientMonotonicDurationMs;
    assert.equal(
      (await repository.finalizeAttempt(pool, degradedInput)).clockQuality,
      'DEGRADED'
    );

    const none = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_NONE',
      protocolDefinition: instrumentationDefinition({
        profile: 'NONE',
        tolerance: 0,
        mismatchBehavior: 'REJECT',
      }),
    });
    assert.equal(
      (await repository.finalizeAttempt(
        pool,
        withoutTiming(finalizationInputFor(none))
      )).clockQuality,
      'UNKNOWN'
    );
  });

  test('MARK_INVALID accepts duration mismatch and REJECT rejects it', async () => {
    const markInvalid = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_MARK_INVALID',
      protocolDefinition: instrumentationDefinition({
        tolerance: 0,
        mismatchBehavior: 'MARK_INVALID',
      }),
    });
    const accepted = await repository.finalizeAttempt(pool, finalizationInputFor(markInvalid, {
      reportedClientMonotonicDurationMs: 101,
    }));
    assert.equal(accepted.clockQuality, 'INVALID');
    assert.equal(accepted.attemptOutcome, 'SCORABLE');

    const reject = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_REJECT_MISMATCH',
      protocolDefinition: instrumentationDefinition({
        tolerance: 0,
        mismatchBehavior: 'REJECT',
      }),
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(reject, {
        reportedClientMonotonicDurationMs: 101,
      })),
      'OUT_OF_RANGE_VALUE'
    );
  });

  test('negative, unsafe, inverted, missing, and prohibited timing facts map exactly', async () => {
    const full = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(
        pool,
        finalizationInputFor(full, { inputEnabledOffsetMs: -1 })
      ),
      'OUT_OF_RANGE_VALUE'
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(full, {
        reportedClientMonotonicDurationMs: Number.MAX_SAFE_INTEGER + 1,
      })),
      'OUT_OF_RANGE_VALUE'
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(
        pool,
        finalizationInputFor(full, {
          inputEnabledOffsetMs: 201,
          submittedOffsetMs: 200,
        })
      ),
      'OUT_OF_RANGE_VALUE'
    );
    const missing = finalizationInputFor(full);
    delete missing.firstValidActivityOffsetMs;
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, missing),
      'MISSING_REQUIRED_FIELD'
    );

    const none = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_NONE_PROHIBITED',
      protocolDefinition: instrumentationDefinition({
        profile: 'NONE',
        tolerance: 0,
        mismatchBehavior: 'REJECT',
      }),
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(none)),
      'CONTRACT_VIOLATION'
    );
  });

  test('SCORABLE, UNSCORABLE, and TECHNICAL_INVALID outcomes follow precedence', async () => {
    const scorable = await createConfiguredAttempt();
    assert.equal(
      (await repository.finalizeAttempt(pool, finalizationInputFor(scorable))).attemptOutcome,
      'SCORABLE'
    );

    const unscorable = await createConfiguredAttempt();
    assert.equal(
      (await repository.finalizeAttempt(pool, finalizationInputFor(unscorable, {
        evaluations: unscorable.targetNodeIds.map(
          (nodeId) => evaluation(nodeId, 'UNCLASSIFIED')
        ),
      }))).attemptOutcome,
      'UNSCORABLE'
    );

    const technical = await createConfiguredAttempt();
    const technicalInput = finalizationInputFor(technical, {
      responseKind: 'NORMAL_EMPTY',
      evaluations: technical.targetNodeIds.map(
        (nodeId) => evaluation(nodeId, 'MODALITY_INPUT_FAILURE')
      ),
    });
    delete technicalInput.responseText;
    assert.equal(
      (await repository.finalizeAttempt(pool, technicalInput)).attemptOutcome,
      'TECHNICAL_INVALID'
    );
  });

  test('mixed modality failure and nonempty modality-failure responses reject', async () => {
    const mixed = await createConfiguredAttempt();
    const mixedInput = finalizationInputFor(mixed, {
      responseKind: 'NORMAL_EMPTY',
      evaluations: [
        evaluation('NODE_EVIDENCE_A', 'MODALITY_INPUT_FAILURE'),
        evaluation('NODE_EVIDENCE_B', 'NO_EVALUABLE_RESPONSE'),
      ],
    });
    delete mixedInput.responseText;
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, mixedInput),
      'CONTRACT_VIOLATION'
    );

    const nonempty = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(nonempty, {
        evaluations: nonempty.targetNodeIds.map(
          (nodeId) => evaluation(nodeId, 'MODALITY_INPUT_FAILURE')
        ),
      })),
      'CONTRACT_VIOLATION'
    );
  });

  test('EXACT_PLANNED is order-insensitive and stores canonical modality order', async () => {
    const fixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_MODALITY_EXACT',
      protocolDefinition: instrumentationDefinition(),
      plannedStimulusModalities: ['AUDIO', 'TEXT'],
      plannedResponseModalities: ['SELECTION', 'TEXT_ENTRY'],
    });
    const result = await repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
      actualStimulusModalities: ['AUDIO', 'TEXT'],
      actualResponseModalities: ['SELECTION', 'TEXT_ENTRY'],
    }));
    assert.equal(result.replayed, false);
    const { rows } = await pool.query(
      `SELECT actual_stimulus_modalities, actual_response_modalities
         FROM evidence_attempt_finalizations
        WHERE attempt_id = $1`,
      [fixture.attempt.attemptId]
    );
    assert.deepEqual(rows[0].actual_stimulus_modalities, ['TEXT', 'AUDIO']);
    assert.deepEqual(rows[0].actual_response_modalities, ['TEXT_ENTRY', 'SELECTION']);
  });

  test('NONEMPTY_SUBSET accepts subsets and modality shape/coverage rejects invalid arrays', async () => {
    const subset = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_MODALITY_SUBSET',
      protocolDefinition: instrumentationDefinition({
        stimulusCoverage: 'NONEMPTY_SUBSET_OF_PLANNED',
        responseCoverage: 'NONEMPTY_SUBSET_OF_PLANNED',
      }),
      plannedStimulusModalities: ['TEXT', 'AUDIO'],
      plannedResponseModalities: ['TEXT_ENTRY', 'SELECTION'],
    });
    await repository.finalizeAttempt(pool, finalizationInputFor(subset));

    const fixture = await createConfiguredAttempt();
    for (const overrides of [
      { actualStimulusModalities: [] },
      { actualStimulusModalities: ['TEXT', 'TEXT'] },
      { actualStimulusModalities: ['AUDIO'] },
      { actualStimulusModalities: ['UNKNOWN'] },
      { actualResponseModalities: ['SELECTION'] },
    ]) {
      await rejectsWithCode(
        () => repository.finalizeAttempt(
          pool,
          finalizationInputFor(fixture, overrides)
        ),
        ['actualStimulusModalities'].some((key) => (
          hasOwn(overrides, key) && overrides[key].length === 0
        ))
          ? 'OUT_OF_RANGE_VALUE'
          : 'CONTRACT_VIOLATION'
      );
    }
  });

  test('COMPLETE_BUCKET_SET stores all 12 rows including zero buckets', async () => {
    const fixture = await createConfiguredAttempt();
    const buckets = correctionBuckets(0);
    buckets[0].count = 2;
    const result = await repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
      correctionAggregates: buckets.reverse(),
    }));
    assert.equal(result.correctionBucketCount, 12);
    const { rows } = await pool.query(
      `SELECT count(*) AS total,
              count(*) FILTER (WHERE count = 0) AS zero_count,
              sum(count) AS count_sum
         FROM evidence_correction_aggregates
        WHERE attempt_id = $1`,
      [fixture.attempt.attemptId]
    );
    assert.equal(Number(rows[0].total), 12);
    assert.equal(Number(rows[0].zero_count), 11);
    assert.equal(Number(rows[0].count_sum), 2);
  });

  test('invalid correction coverage and counts reject without partial writes', async () => {
    const fixture = await createConfiguredAttempt();
    const missing = correctionBuckets();
    missing.pop();
    const duplicate = correctionBuckets();
    duplicate[11] = { ...duplicate[0] };
    const negative = correctionBuckets();
    negative[0].count = -1;
    const unsafe = correctionBuckets();
    unsafe[0].count = Number.MAX_SAFE_INTEGER + 1;
    for (const [aggregates, code] of [
      [missing, 'CONTRACT_VIOLATION'],
      [duplicate, 'CONTRACT_VIOLATION'],
      [negative, 'OUT_OF_RANGE_VALUE'],
      [unsafe, 'OUT_OF_RANGE_VALUE'],
    ]) {
      await rejectsWithCode(
        () => repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
          correctionAggregates: aggregates,
        })),
        code
      );
    }
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('NOT_COLLECTED accepts exactly an empty array and stores zero correction rows', async () => {
    const fixture = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_NOT_COLLECTED',
      protocolDefinition: instrumentationDefinition({
        correctionCoverageMode: 'NOT_COLLECTED',
      }),
    });
    const result = await repository.finalizeAttempt(pool, finalizationInputFor(fixture, {
      correctionAggregates: [],
    }));
    assert.equal(result.correctionBucketCount, 0);
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [1, 2, 0]);

    const invalid = await createConfiguredAttempt({
      protocolId: 'INSTRUMENTATION_NOT_COLLECTED',
    });
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(invalid)),
      'CONTRACT_VIOLATION'
    );
  });

  test('new finalization requires active nonterminal assignment and session lifecycle', async () => {
    const terminalAssignment = await createConfiguredAttempt();
    await pool.query(
      `UPDATE evidence_assignments
          SET terminal_outcome = 'UNSCORABLE'
        WHERE assignment_id = $1`,
      [terminalAssignment.assignment.assignment.assignment_id]
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(
        pool,
        finalizationInputFor(terminalAssignment)
      ),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(
      await readFinalizationCounts(terminalAssignment.attempt.attemptId),
      [0, 0, 0]
    );

    const terminalSession = await createConfiguredAttempt();
    await pool.query(
      `UPDATE evidence_sessions
          SET ended_at = now(), terminal_outcome = 'COMPLETED'
        WHERE session_id = $1`,
      [terminalSession.session.session_id]
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, finalizationInputFor(terminalSession)),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(
      await readFinalizationCounts(terminalSession.attempt.attemptId),
      [0, 0, 0]
    );
  });

  test('same identity and digest replays original values and timestamps after lifecycle advancement', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture);
    const created = await repository.finalizeAttempt(pool, input);
    await pool.query(
      `UPDATE evidence_assignments
          SET terminal_outcome = 'UNSCORABLE'
        WHERE assignment_id = $1`,
      [fixture.assignment.assignment.assignment_id]
    );
    await pool.query(
      `UPDATE evidence_sessions
          SET ended_at = now(), terminal_outcome = 'COMPLETED'
        WHERE session_id = $1`,
      [fixture.session.session_id]
    );
    const replay = await repository.finalizeAttempt(pool, {
      ...input,
      evaluations: [...input.evaluations].reverse(),
      correctionAggregates: [...input.correctionAggregates].reverse(),
    });
    assert.deepEqual(replay, { ...created, replayed: true });
    assert.equal(replay.serverReceivedAt, created.serverReceivedAt);
    assert.equal(replay.finalizedAt, created.finalizedAt);
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [1, 2, 12]);
  });

  test('same identity different digest and different identity reject immutable mutation', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture);
    await repository.finalizeAttempt(pool, input);
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, { ...input, responseText: 'changed' }),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, {
        ...input,
        finalizationIdempotencyIdentity: 'different-finalization-identity',
      }),
      'CONTRACT_VIOLATION'
    );
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [1, 2, 12]);
  });

  test('concurrent identical finalizations converge to one create and all remaining replays', async () => {
    const fixture = await createConfiguredAttempt();
    const input = finalizationInputFor(fixture);
    const beforePool = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
    const results = await Promise.all(Array.from({ length: 6 }, (_, index) => (
      repository.finalizeAttempt(pool, {
        ...input,
        evaluations: index % 2 === 0
          ? input.evaluations
          : [...input.evaluations].reverse(),
        correctionAggregates: index % 2 === 0
          ? input.correctionAggregates
          : [...input.correctionAggregates].reverse(),
      })
    )));
    assert.equal(results.filter((result) => !result.replayed).length, 1);
    assert.equal(results.filter((result) => result.replayed).length, 5);
    assert.equal(new Set(results.map((result) => result.attemptId)).size, 1);
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [1, 2, 12]);
    assert.equal(pool.waitingCount, 0);
    assert.equal(pool.totalCount - pool.idleCount, beforePool.total - beforePool.idle);
    assert.equal(beforePool.waiting, 0);
  });

  test('failure after finalization insert rolls back finalization and all children', async () => {
    const fixture = await createConfiguredAttempt();
    const failingPool = createFinalizationFailurePool(
      pool,
      /INSERT\s+INTO\s+evidence_target_node_evaluations\b/i,
      () => new Error('failure after finalization insert')
    );
    await assert.rejects(
      () => repository.finalizeAttempt(failingPool, finalizationInputFor(fixture)),
      /failure after finalization insert/
    );
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('failure after evaluation inserts rolls back the complete aggregate', async () => {
    const fixture = await createConfiguredAttempt();
    const failingPool = createFinalizationFailurePool(
      pool,
      /INSERT\s+INTO\s+evidence_correction_aggregates\b/i,
      () => new Error('failure after evaluation inserts')
    );
    await assert.rejects(
      () => repository.finalizeAttempt(failingPool, finalizationInputFor(fixture)),
      /failure after evaluation inserts/
    );
    assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
  });

  test('operation-local PostgreSQL error mappings are exact and unexpected errors survive', async () => {
    const mappings = [
      ['23503', undefined, 'INVALID_ID'],
      ['23514', undefined, 'CONTRACT_VIOLATION'],
      ['23502', undefined, 'CONTRACT_VIOLATION'],
      ['22P02', undefined, 'CONTRACT_VIOLATION'],
      ['23505', 'evidence_target_node_evaluations_attempt_node_unique', 'CONTRACT_VIOLATION'],
      ['23505', 'evidence_correction_aggregates_pk', 'CONTRACT_VIOLATION'],
      ['23505', 'evidence_attempt_finalizations_pk', 'CONTRACT_VIOLATION'],
      ['23505', 'some_other_unique', 'CONTRACT_VIOLATION'],
      ['22001', undefined, 'OUT_OF_RANGE_VALUE'],
    ];
    for (const [code, constraint, expectedCode] of mappings) {
      const fixture = await createConfiguredAttempt();
      const failingPool = createFinalizationFailurePool(
        pool,
        /INSERT\s+INTO\s+evidence_attempt_finalizations\b/i,
        () => Object.assign(new Error(`database ${code}`), { code, constraint })
      );
      await rejectsWithCode(
        () => repository.finalizeAttempt(failingPool, finalizationInputFor(fixture)),
        expectedCode
      );
      assert.deepEqual(await readFinalizationCounts(fixture.attempt.attemptId), [0, 0, 0]);
    }

    const fixture = await createConfiguredAttempt();
    const failingPool = createFinalizationFailurePool(
      pool,
      /INSERT\s+INTO\s+evidence_attempt_finalizations\b/i,
      () => new Error('unexpected persistence failure')
    );
    await assert.rejects(
      () => repository.finalizeAttempt(failingPool, finalizationInputFor(fixture)),
      /unexpected persistence failure/
    );
  });

  test('finalization exact top-level shape rejects unknown and explicit undefined fields', async () => {
    const fixture = await createConfiguredAttempt();
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, {
        ...finalizationInputFor(fixture),
        callerIdentity: 'not-allowed',
      }),
      'CONTRACT_VIOLATION'
    );
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, {
        ...finalizationInputFor(fixture),
        responseRef: undefined,
      }),
      'CONTRACT_VIOLATION'
    );
    const missing = finalizationInputFor(fixture);
    delete missing.evaluations;
    await rejectsWithCode(
      () => repository.finalizeAttempt(pool, missing),
      'MISSING_REQUIRED_FIELD'
    );
  });

  test('test-controlled DB boundary failure rolls back a newly created series', async () => {
    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');
    const failingPool = createAttemptInsertFailurePool(pool);

    await assert.rejects(
      () => repository.openAttempt(
        failingPool,
        attemptInput('idem-attempt-db-boundary-failure', { responseMode: 'TEXT' })
      ),
      /test-controlled attempt insert failure/
    );

    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries);
  });

  test('production API cannot activate failure injection and exports no test controls', async () => {
    assert.equal(repository.openAttempt.length, 2);
    assert.equal(repository.finalizeAttempt.length, 2);
    const repositorySource = fs.readFileSync(
      path.resolve(__dirname, '../src/instrumentation/evidenceRepository.js'),
      'utf8'
    );
    assert.match(repositorySource, /async function openAttempt\(pool, input\)/);
    assert.match(repositorySource, /async function finalizeAttempt\(pool, input\)/);
    assert.doesNotMatch(repositorySource, /openAttempt\(pool,\s*input,\s*options/);
    assert.doesNotMatch(repositorySource, /finalizeAttempt\(pool,\s*input,\s*options/);
    assert.doesNotMatch(repositorySource, /afterSeriesCreated|failureInjection|testHook/i);

    for (const key of Object.keys(repository)) {
      assert.doesNotMatch(key, /hook|factory|debug|failure/i);
    }
    for (const key of Object.keys(evidence)) {
      assert.doesNotMatch(key, /hook|factory|debug|failure/i);
    }

    const beforeAttempts = await countRows('evidence_attempts');
    const beforeSeries = await countRows('evidence_attempt_series');
    await rejectsWithCode(
      () => repository.openAttempt(pool, {
        ...attemptInput('idem-caller-failure-field', { responseMode: 'TEXT' }),
        failureInjection: 'after-series',
      }),
      'CONTRACT_VIOLATION'
    );
    assert.equal(await countRows('evidence_attempts'), beforeAttempts);
    assert.equal(await countRows('evidence_attempt_series'), beforeSeries);
  });

  test('production rows, digests, and next_review_at values remain unchanged', async () => {
    assert.deepEqual(await readProductionState(), productionBefore);
    const { rows: assignmentRows } = await pool.query(
      `SELECT completed_at, completion_attempt_id, terminal_outcome
         FROM evidence_assignments
        WHERE assignment_id = $1`,
      [baseAssignment.assignment.assignment_id]
    );
    const { rows: sessionRows } = await pool.query(
      `SELECT ended_at, terminal_outcome, technical_failure_ref
         FROM evidence_sessions
        WHERE session_id = $1`,
      [baseSession.session_id]
    );
    assert.deepEqual(assignmentRows[0], {
      completed_at: null,
      completion_attempt_id: null,
      terminal_outcome: null,
    });
    assert.deepEqual(sessionRows[0], {
      ended_at: null,
      terminal_outcome: null,
      technical_failure_ref: null,
    });
  });

  test('instrumentation stays outside engines and has no public, Learning Flow, or Progress write dependency', () => {
    const instrumentationDirectory = path.resolve(__dirname, '../src/instrumentation');
    const enginesDirectory = path.resolve(__dirname, '../src/engines');
    assert.equal(instrumentationDirectory.startsWith(enginesDirectory), false);

    const repositorySource = fs.readFileSync(
      path.join(instrumentationDirectory, 'evidenceRepository.js'),
      'utf8'
    );
    assert.doesNotMatch(repositorySource, /require\([^)]*engines/i);
    assert.doesNotMatch(repositorySource, /learningFlow/i);
    assert.doesNotMatch(repositorySource, /progressEngine/i);
    assert.doesNotMatch(repositorySource, /\bINSERT\s+INTO\s+progress\b/i);
    assert.doesNotMatch(repositorySource, /\bUPDATE\s+progress\b/i);
    assert.doesNotMatch(repositorySource, /\bINSERT\s+INTO\s+attempt_records\b/i);
    assert.doesNotMatch(repositorySource, /\bUPDATE\s+attempt_records\b/i);
    assert.doesNotMatch(repositorySource, /\bUPDATE\s+evidence_assignments\b/i);
    assert.doesNotMatch(repositorySource, /\bUPDATE\s+evidence_sessions\b/i);
  });
});
