// VL3 §9 production client boundary validation against real PostgreSQL.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const progressEngine = require('../src/engines/progressEngine');
const {
  LearningSessionController,
  REQUEST_STATUS,
  SESSION_STATUS,
  SCREEN_KIND,
} = require('../src/client/learningSessionController');
const {
  CapacityAdmissionConflictError,
} = require('../src/client/learningFlowTransportContract');
const {
  InProcessLearningFlowTransport,
} = require('../src/transport/inProcessLearningFlowTransport');

let fixtureSequence = 0;

class ObservedTransport {
  constructor(delegate) {
    this.delegate = delegate;
    this.calls = [];
  }

  startSession(userId, language, acknowledgement) {
    this.calls.push({ method: 'startSession', acknowledgement });
    return this.delegate.startSession(userId, language, acknowledgement);
  }

  startExplicitStudy(userId, nodeId) {
    this.calls.push({ method: 'startExplicitStudy', nodeId });
    return this.delegate.startExplicitStudy(userId, nodeId);
  }
}

async function createUser(label) {
  fixtureSequence += 1;
  const { rows } = await pool.query(
    `INSERT INTO users (auth_provider, auth_identifier, timezone)
     VALUES ('GUEST', $1, 'UTC') RETURNING user_id`,
    [`VL3_SECTION9_${label}_${fixtureSequence}`]
  );
  return rows[0].user_id;
}

async function createLanguage(language, definitions) {
  const nodeIds = {};
  for (const definition of definitions) {
    const nodeId = `NODE_VL3S9_${language}_${definition.name}`;
    const conceptId = `CONCEPT_VL3S9_${language}_${definition.name}`;
    nodeIds[definition.name] = nodeId;
    await pool.query(
      `INSERT INTO concepts (concept_id, category, function, difficulty)
       VALUES ($1, $2, 'VL3_SECTION9', $3)`,
      [conceptId, definition.category, definition.difficulty || 1]
    );
    await pool.query(
      `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
       VALUES ($1, $2, $3::jsonb, $4, $5)`,
      [nodeId, language, JSON.stringify([conceptId]), definition.name, definition.difficulty || 1]
    );
  }
  return nodeIds;
}

async function setProgress(userId, nodeId, state, nextReviewAt = null) {
  await pool.query(
    `INSERT INTO progress (user_id, node_id, state, next_review_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, nodeId, state, nextReviewAt]
  );
}

async function persistenceSnapshot() {
  const tableNames = [
    'users',
    'concepts',
    'grammar_nodes',
    'grammar_relations',
    'content',
    'progress',
    'attempt_records',
    'vocabulary',
    'cascade_jobs',
  ];
  const snapshot = {};
  for (const tableName of tableNames) {
    const { rows } = await pool.query(
      `SELECT count(*)::integer AS row_count,
              COALESCE(md5(string_agg(row_value, '' ORDER BY row_value)), '') AS digest
         FROM (SELECT row_to_json(t)::text AS row_value FROM ${tableName} t) rows_for_digest`
    );
    snapshot[tableName] = rows[0];
  }
  return snapshot;
}

function createController(transport, userId, language) {
  return new LearningSessionController({ transport, userId, language });
}

describe('VL3 §9 production client boundary', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
  });

  after(async () => {
    await pool.end();
  });

  test('CONVERSATION is a normal boundary screen, acknowledgement returns to IDLE, and a new session resets it', async () => {
    const nodes = await createLanguage('QA', [
      { name: 'A', category: 'A' },
      { name: 'B', category: 'B' },
      { name: 'C', category: 'C' },
    ]);
    const userId = await createUser('boundary_round_trip');
    for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'PRACTICING');

    const beforeSnapshot = await persistenceSnapshot();
    const observed = new ObservedTransport(new InProcessLearningFlowTransport(pool));
    const firstSession = createController(observed, userId, 'QA');

    assert.deepEqual(firstSession.getState(), {
      sessionStatus: SESSION_STATUS.ACTIVE,
      requestStatus: REQUEST_STATUS.IDLE,
      currentServerAction: null,
      currentScreen: null,
      conversationBoundaryAcknowledged: false,
      error: null,
    });

    const firstRequest = firstSession.start();
    assert.equal(firstSession.getState().requestStatus, REQUEST_STATUS.LOADING);
    assert.equal(firstSession.getState().currentScreen, null);
    const boundary = await firstRequest;
    assert.deepEqual(boundary.currentScreen, { kind: SCREEN_KIND.CONVERSATION_BOUNDARY });
    assert.equal(boundary.currentServerAction, 'CONVERSATION');
    assert.equal(boundary.requestStatus, REQUEST_STATUS.READY);
    assert.equal(boundary.error, null);
    assert.equal(boundary.conversationBoundaryAcknowledged, false);

    const afterAcknowledgement = await firstSession.acknowledgeConversationBoundary();
    assert.deepEqual(afterAcknowledgement.currentScreen, { kind: SCREEN_KIND.IDLE });
    assert.equal(afterAcknowledgement.currentServerAction, 'IDLE');
    assert.equal(afterAcknowledgement.conversationBoundaryAcknowledged, true);

    const secondSession = createController(observed, userId, 'QA');
    assert.equal(secondSession.getState().conversationBoundaryAcknowledged, false);
    const redisplayed = await secondSession.start();
    assert.deepEqual(redisplayed.currentScreen, { kind: SCREEN_KIND.CONVERSATION_BOUNDARY });
    assert.deepEqual(
      observed.calls.map((call) => [call.method, call.acknowledgement]),
      [
        ['startSession', false],
        ['startSession', true],
        ['startSession', false],
      ]
    );
    assert.deepEqual(await persistenceSnapshot(), beforeSnapshot);
  });

  test('each server branch consumes only its canonical payload fields', async () => {
    const reviewNodes = await createLanguage('QB', [{ name: 'DUE', category: 'DUE' }]);
    const reviewUser = await createUser('exact_review');
    await setProgress(reviewUser, reviewNodes.DUE, 'PRACTICING', new Date(Date.now() - 60000));
    const reviewState = await createController(
      new InProcessLearningFlowTransport(pool),
      reviewUser,
      'QB'
    ).start();
    assert.deepEqual(Object.keys(reviewState.currentScreen).sort(), ['kind', 'reviewBatch']);
    assert.deepEqual(
      Object.keys(reviewState.currentScreen.reviewBatch[0]).sort(),
      ['next_review_at', 'node_id', 'overdue_by', 'priority', 'reason', 'state']
    );

    const newNodes = await createLanguage('QC', [{ name: 'NEW', category: 'NEW' }]);
    const newUser = await createUser('exact_new');
    const newState = await createController(
      new InProcessLearningFlowTransport(pool),
      newUser,
      'QC'
    ).start();
    assert.deepEqual(newState.currentScreen, {
      kind: SCREEN_KIND.NEW_GRAMMAR,
      nodeId: newNodes.NEW,
    });

    const interleavingNodes = await createLanguage('QD', [
      { name: 'A', category: 'A' },
      { name: 'B', category: 'B' },
    ]);
    const interleavingUser = await createUser('exact_interleaving');
    for (const nodeId of Object.values(interleavingNodes)) {
      await setProgress(interleavingUser, nodeId, 'INTRODUCED');
    }
    const interleavingState = await createController(
      new InProcessLearningFlowTransport(pool),
      interleavingUser,
      'QD'
    ).start();
    assert.deepEqual(Object.keys(interleavingState.currentScreen).sort(), ['kind', 'nodeSequence']);
    assert.equal(interleavingState.currentScreen.nodeSequence.length, 4);

    const idleUser = await createUser('exact_idle');
    const idleState = await createController(
      new InProcessLearningFlowTransport(pool),
      idleUser,
      'QE'
    ).start();
    assert.deepEqual(idleState.currentScreen, { kind: SCREEN_KIND.IDLE });
  });

  test('a real capacity race performs one failed admission and one fresh startSession decision', async () => {
    const nodes = await createLanguage('QF', [
      { name: 'ACTIVE', category: 'ACTIVE' },
      { name: 'PROPOSED', category: 'PROPOSED' },
      { name: 'RACER', category: 'RACER' },
    ]);
    const userId = await createUser('capacity_race');
    await setProgress(userId, nodes.ACTIVE, 'INTRODUCED');

    const observed = new ObservedTransport(new InProcessLearningFlowTransport(pool));
    const controller = createController(observed, userId, 'QF');
    const proposal = await controller.start();
    assert.deepEqual(proposal.currentScreen, {
      kind: SCREEN_KIND.NEW_GRAMMAR,
      nodeId: nodes.PROPOSED,
    });

    await progressEngine.recordExplicitStudy(pool, userId, nodes.RACER, new Date().toISOString());
    const latest = await controller.startProposedExplicitStudy();
    assert.equal(latest.currentServerAction, 'INTERLEAVING');
    assert.equal(latest.currentScreen.kind, SCREEN_KIND.INTERLEAVING);
    assert.deepEqual(new Set(latest.currentScreen.nodeSequence), new Set([nodes.ACTIVE, nodes.RACER]));
    assert.deepEqual(
      observed.calls.map((call) => call.method),
      ['startSession', 'startExplicitStudy', 'startSession']
    );
    assert.equal(observed.calls[1].nodeId, nodes.PROPOSED);
    const { rows } = await pool.query(
      `SELECT node_id, state FROM progress WHERE user_id = $1 ORDER BY node_id`,
      [userId]
    );
    assert.deepEqual(rows, [
      { node_id: nodes.ACTIVE, state: 'INTRODUCED' },
      { node_id: nodes.RACER, state: 'INTRODUCED' },
    ]);
  });

  test('the transport preserves CONTRACT_VIOLATION while marking only authoritative capacity rejection', async () => {
    const nodes = await createLanguage('QG', [
      { name: 'A', category: 'A' },
      { name: 'B', category: 'B' },
      { name: 'C', category: 'C' },
    ]);
    const userId = await createUser('capacity_error_type');
    await setProgress(userId, nodes.A, 'INTRODUCED');
    await setProgress(userId, nodes.B, 'STUDYING');
    const transport = new InProcessLearningFlowTransport(pool);

    await assert.rejects(
      () => transport.startExplicitStudy(userId, nodes.C),
      (error) => error instanceof CapacityAdmissionConflictError && error.code === 'CONTRACT_VIOLATION'
    );
    await assert.rejects(
      () => transport.startExplicitStudy(userId, 'NODE_VL3S9_DOES_NOT_EXIST'),
      (error) => !(error instanceof CapacityAdmissionConflictError) && error.code === 'INVALID_ID'
    );
  });

  test('INVALID_ID becomes a client error state without a retry', async () => {
    const observed = new ObservedTransport(new InProcessLearningFlowTransport(pool));
    const controller = createController(
      observed,
      '00000000-0000-4000-8000-000000000000',
      'QH'
    );
    const state = await controller.start();
    assert.equal(state.requestStatus, REQUEST_STATUS.ERROR);
    assert.equal(state.error.code, 'INVALID_ID');
    assert.equal(state.currentScreen, null);
    assert.deepEqual(observed.calls.map((call) => call.method), ['startSession']);
  });

  test('null and non-boolean acknowledgements reach the client as errors without retry loops', async () => {
    const userId = await createUser('invalid_ack');
    const delegate = new InProcessLearningFlowTransport(pool);
    for (const invalidAcknowledgement of [null, 'true']) {
      const calls = [];
      const forwardingTransport = {
        startSession(requestUserId, language) {
          calls.push('startSession');
          return delegate.startSession(requestUserId, language, invalidAcknowledgement);
        },
        startExplicitStudy(requestUserId, nodeId) {
          calls.push('startExplicitStudy');
          return delegate.startExplicitStudy(requestUserId, nodeId);
        },
      };
      const state = await createController(forwardingTransport, userId, 'QI').start();
      assert.equal(state.requestStatus, REQUEST_STATUS.ERROR);
      assert.equal(state.error.code, 'CONTRACT_VIOLATION');
      assert.deepEqual(calls, ['startSession']);
    }
  });

  test('ending a logical session prevents reuse and a new controller owns a fresh acknowledgement', async () => {
    const userId = await createUser('session_lifetime');
    const transport = new InProcessLearningFlowTransport(pool);
    const ended = createController(transport, userId, 'QJ');
    ended.endSession();
    assert.equal(ended.getState().sessionStatus, SESSION_STATUS.ENDED);
    await assert.rejects(() => ended.start(), /logical client session has ended/);

    const restarted = createController(transport, userId, 'QJ');
    assert.equal(restarted.getState().sessionStatus, SESSION_STATUS.ACTIVE);
    assert.equal(restarted.getState().conversationBoundaryAcknowledged, false);
  });

  test('production client has no SQL, persistence, Engine import, or test-only branch', () => {
    const controllerSource = fs.readFileSync(
      path.join(__dirname, '../src/client/learningSessionController.js'),
      'utf8'
    );
    const contractSource = fs.readFileSync(
      path.join(__dirname, '../src/client/learningFlowTransportContract.js'),
      'utf8'
    );
    const productionClientSource = `${controllerSource}\n${contractSource}`;
    assert.doesNotMatch(productionClientSource, /\b(?:SELECT|INSERT|UPDATE|DELETE)\b/i);
    assert.doesNotMatch(productionClientSource, /localStorage|sessionStorage|node:fs|\.\.\/engines|\.\.\/db/);
    assert.doesNotMatch(productionClientSource, /NODE_ENV|test[-_ ]only|process\.env/);
    assert.doesNotMatch(productionClientSource, /\.only\s*\(|\.skip\s*\(|\bxtest\s*\(|\bxdescribe\s*\(/);
  });
});
