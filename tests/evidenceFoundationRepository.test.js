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

async function registerReference(referenceKind, referenceId, version) {
  return repository.registerReferenceVersion(pool, {
    referenceKind,
    referenceId,
    version,
    definition: {
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
  await registerReference('RUBRIC', REFERENCES.rubricId, REFERENCES.rubricVersion);
  await registerReference('FORMULA', REFERENCES.formulaId, REFERENCES.formulaVersion);
  await registerReference(
    'SCHEDULER_PROTOCOL',
    REFERENCES.schedulerProtocolId,
    REFERENCES.schedulerProtocolVersion
  );
  await registerReference(
    'INSTRUMENTATION_PROTOCOL',
    REFERENCES.instrumentationProtocolId,
    REFERENCES.instrumentationProtocolVersion
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
    const repositorySource = fs.readFileSync(
      path.resolve(__dirname, '../src/instrumentation/evidenceRepository.js'),
      'utf8'
    );
    assert.match(repositorySource, /async function openAttempt\(pool, input\)/);
    assert.doesNotMatch(repositorySource, /openAttempt\(pool,\s*input,\s*options/);
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
  });
});
