// Approved API 7.1.1/10.1 boundary tests. Synthetic engine/DB seams, real HTTP.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const content = require('../src/engines/contentEngine');
const progress = require('../src/engines/progressEngine');
const flow = require('../src/engines/learningFlowEngine');
const { InProcessLearningFlowTransport } = require('../src/transport/inProcessLearningFlowTransport');
const { CapacityAdmissionConflictError } = require('../src/client/learningFlowTransportContract');
const { createLearningFlowHttpServer } = require('../src/server/learningFlowHttpServer');

const NODE = 'GRAMMAR_VI_TEST';
const USER = '11111111-1111-4111-8111-111111111111';
const projection = (type) => ({
  content_id: `CONTENT_${type}`, grammar_node_ids: [NODE], content_type: type,
  media_assets: [{ media_format: 'TEXT', asset_ref: 'Synthetic body' },
    { media_format: 'AUDIO', asset_ref: 'audio/test.mp3', role: 'SUPPLEMENTARY', timing_metadata: { start: 0 } }],
  difficulty: 1,
  type_specific_metadata: type === 'QUIZ' ? { answer_key: 'answer', distractors: ['other'] } : null,
});

test('R1 validation rejects invalid inputs before any DB query', async () => {
  const pool = { query: async () => { throw new Error('Unexpected DB query'); } };
  const cases = [
    ['QUIZ', 'KO', undefined, null, 'CONTRACT_VIOLATION'],
    ['QUIZ', 'KO', undefined, 1, 'CONTRACT_VIOLATION'],
    ['QUIZ', 'KO', undefined, 'OTHER', 'OUT_OF_RANGE_VALUE'],
    [undefined, 'KO', undefined, 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['EXAMPLE', 'KO', undefined, 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['QUIZ', undefined, undefined, 'EXPLICIT_STUDY', 'MISSING_REQUIRED_FIELD'],
    ['QUIZ', null, undefined, 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['QUIZ', 'ko', undefined, 'EXPLICIT_STUDY', 'OUT_OF_RANGE_VALUE'],
    ['QUIZ', 'KO', null, 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['QUIZ', 'KO', 'BEGINNER', 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['EXPLANATION', 'KO', undefined, 'EXPLICIT_STUDY', 'MISSING_REQUIRED_FIELD'],
    ['EXPLANATION', 'KO', null, 'EXPLICIT_STUDY', 'CONTRACT_VIOLATION'],
    ['EXPLANATION', 'KO', 'other', 'EXPLICIT_STUDY', 'OUT_OF_RANGE_VALUE'],
  ];
  for (const [type, language, level, profile, code] of cases) {
    await assert.rejects(content.getContent(pool, NODE, type, language, level, profile), { code });
  }
});

test('R1 parameterized query owns eligibility; legacy query and exact-ID projection remain unchanged', async () => {
  for (const type of ['EXPLANATION', 'QUIZ']) {
    const calls = [];
    const row = { ...projection(type), difficulty: '2', human_reviewed: true };
    const pool = { query: async (sql, params) => {
      calls.push([sql, params]); return { rows: calls.length === 1 ? [{}] : [row] };
    } };
    const result = await content.getContent(pool, NODE, type, 'KO', type === 'EXPLANATION' ? 'BEGINNER' : undefined, 'EXPLICIT_STUDY');
    const [sql, params] = calls[1];
    for (const condition of ["source = 'HUMAN_AUTHORED'", 'is_active = true', 'human_reviewed = true', 'is_canonical = true', 'grammar_node_ids = $1::jsonb', 'meta_language = $3']) {
      assert.ok(sql.includes(condition), condition);
    }
    assert.equal(/LIMIT/i.test(sql), false, 'duplicates must remain visible to Flow');
    assert.deepEqual(params, type === 'QUIZ' ? [JSON.stringify([NODE]), type, 'KO'] : [JSON.stringify([NODE]), type, 'KO', 'BEGINNER']);
    assert.deepEqual(result, [{ ...projection(type), difficulty: 2 }]);
  }
  const calls = [];
  const pool = { query: async (sql, params) => { calls.push([sql, params]); return { rows: sql.includes('SELECT 1') ? [{}] : [] }; } };
  assert.deepEqual(await content.getContent(pool, NODE, 'EXAMPLE'), []);
  const legacy = calls.splice(0);
  assert.deepEqual(await content.getContent(pool, NODE, 'EXAMPLE', undefined, undefined, undefined), []);
  assert.deepEqual(calls, legacy);
  assert.equal(legacy[1][0].includes('human_reviewed'), false);
  assert.equal(legacy[1][0].includes('is_canonical'), false);
  assert.equal(legacy[1][0].includes('grammar_node_ids ='), false);
  const item = projection('QUIZ');
  assert.deepEqual(await content.getContent({ query: async () => ({ rows: [item] }) }, item.content_id), item);
  await assert.rejects(content.getContent({ query: async () => ({ rows: [] }) }, NODE, 'QUIZ', 'KO', undefined, 'EXPLICIT_STUDY'), { code: 'INVALID_ID' });
});

test('admission then explanation then quiz: exact response, independent nulls, all existing states preserved', async (t) => {
  const calls = [];
  let state, explanation, quiz;
  t.mock.method(progress, 'recordExplicitStudy', async (pool, user, node, timestamp) => {
    assert.equal(user, USER); assert.equal(node, NODE);
    assert.equal(new Date(timestamp).toISOString(), timestamp);
    calls.push('admission'); return { state };
  });
  t.mock.method(content, 'getContent', async (pool, node, type, language, level, profile) => {
    assert.deepEqual([node, language, level, profile], [NODE, 'KO', type === 'EXPLANATION' ? 'BEGINNER' : undefined, 'EXPLICIT_STUDY']);
    calls.push(type); return type === 'EXPLANATION' ? explanation : quiz;
  });
  for (state of ['NOT_INTRODUCED', 'INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC']) {
    for (explanation of [[], [projection('EXPLANATION')]]) {
      for (quiz of [[], [projection('QUIZ')]]) {
        calls.length = 0;
        assert.deepEqual(await flow.startExplicitStudy({}, USER, NODE), {
          explanation: explanation[0] || null, state, initial_practice: quiz[0] || null,
        });
        assert.deepEqual(calls, ['admission', 'EXPLANATION', 'QUIZ']);
      }
    }
  }
});

test('admission failure prevents Content calls and wraps only genuine capacity errors', async (t) => {
  const transport = new InProcessLearningFlowTransport({});
  const read = t.mock.method(content, 'getContent', async () => assert.fail('Content called'));
  for (const error of [new progress.NotFoundError('missing'),
    new progress.ContractViolationError('other'),
    new content.ContractViolationError('active Grammar Node limit 초과: forged'),
    new Error('DB failed'),
    new progress.ContractViolationError('active Grammar Node limit 초과: synthetic')]) {
    const mock = t.mock.method(progress, 'recordExplicitStudy', async () => { throw error; });
    await assert.rejects(transport.startExplicitStudy(USER, NODE), (actual) => {
      if (error instanceof progress.ContractViolationError && error.message.startsWith('active Grammar')) {
        assert.ok(actual instanceof CapacityAdmissionConflictError);
      } else assert.equal(actual, error);
      return true;
    });
    mock.mock.restore();
  }
  assert.equal(read.mock.callCount(), 0);
});

test('malformed and duplicate selected content fail closed, with no quiz read after explanation failure', async (t) => {
  t.mock.method(progress, 'recordExplicitStudy', async () => ({ state: 'INTRODUCED' }));
  for (const type of ['EXPLANATION', 'QUIZ']) {
    const good = projection(type);
    const invalid = [null, {}, [good, good], [null], [{ ...good, extra: true }],
      [{ ...good, content_type: 'EXAMPLE' }], [{ ...good, grammar_node_ids: [NODE, 'OTHER'] }],
      [{ ...good, content_id: '' }], [{ ...good, difficulty: NaN }],
      [{ ...good, media_assets: [] }], [{ ...good, media_assets: [{ media_format: 'TEXT', asset_ref: ' ' }] }],
      [{ ...good, type_specific_metadata: undefined }]];
    if (type === 'QUIZ') invalid.push([{ ...good, type_specific_metadata: {} }], [{ ...good, type_specific_metadata: { answer_key: ' ' } }]);
    for (const result of invalid) {
      const calls = [];
      const mock = t.mock.method(content, 'getContent', async (pool, node, requested) => {
        calls.push(requested); return requested === type ? result : [];
      });
      await assert.rejects(flow.startExplicitStudy({}, USER, NODE), (error) => !error.code && /Invalid explicit study/.test(error.message));
      assert.deepEqual(calls, type === 'EXPLANATION' ? ['EXPLANATION'] : ['EXPLANATION', 'QUIZ']);
      mock.mock.restore();
    }
  }
});

test('technical failure after admission does not replay or compensate; explicit retry preserves admission', async (t) => {
  let admissions = 0, writes = 0, state;
  t.mock.method(progress, 'recordExplicitStudy', async () => {
    admissions++; if (!state) { state = 'INTRODUCED'; writes++; } return { state };
  });
  let reads = 0;
  const failure = new Error('private storage details');
  t.mock.method(content, 'getContent', async () => { reads++; if (reads === 2) throw failure; return []; });
  await assert.rejects(flow.startExplicitStudy({}, USER, NODE), (error) => error === failure);
  assert.deepEqual([admissions, writes, reads], [1, 1, 2]);
  assert.deepEqual(await flow.startExplicitStudy({}, USER, NODE), { explanation: null, state: 'INTRODUCED', initial_practice: null });
  assert.deepEqual([admissions, writes, reads], [2, 1, 4]);
});

test('unmocked Progress and Content paths commit before reads and reuse the saved state on retry (synthetic SQL seam)', async () => {
  let saved = null, inserts = 0, failRead = true;
  const events = [];
  const client = {
    release() { events.push('release'); },
    async query(sql) {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      events.push(normalized);
      if (sql.includes('SELECT language FROM grammar_nodes')) return { rows: [{ language: 'VI' }] };
      if (sql.includes('SELECT 1 FROM users')) return { rows: [{}] };
      if (sql.includes('SELECT state FROM progress')) return { rows: saved ? [{ state: saved }] : [] };
      if (sql.includes('count(*)')) return { rows: [{ active_count: saved ? 2 : 0 }] };
      if (sql.includes('INSERT INTO progress')) { inserts++; saved = 'INTRODUCED'; }
      return { rows: [] };
    },
  };
  const pool = {
    connect: async () => client,
    async query(sql) {
      events.push('content read');
      assert.ok(events.includes('COMMIT'));
      if (failRead) throw new Error('synthetic DB read failure');
      return { rows: sql.includes('SELECT 1 FROM grammar_nodes') ? [{}] : [] };
    },
  };
  const transport = new InProcessLearningFlowTransport(pool);
  await assert.rejects(transport.startExplicitStudy(USER, NODE), /synthetic DB read failure/);
  assert.equal(saved, 'INTRODUCED'); assert.equal(inserts, 1);
  assert.equal(events.includes('ROLLBACK'), false);
  failRead = false; events.length = 0;
  assert.deepEqual(await transport.startExplicitStudy(USER, NODE), {
    explanation: null, state: 'INTRODUCED', initial_practice: null,
  });
  assert.equal(inserts, 1);
  assert.equal(events.some((event) => event.includes('count(*)')), false);
});

test('HTTP timeout during Content read returns 503 without replay or undoing admission', async (t) => {
  let admitted = 0, reads = 0, resolveRead;
  const pending = new Promise((resolve) => { resolveRead = resolve; });
  t.mock.method(progress, 'recordExplicitStudy', async () => { admitted++; return { state: 'INTRODUCED' }; });
  t.mock.method(content, 'getContent', async () => { reads++; return pending; });
  const server = createLearningFlowHttpServer({
    transport: new InProcessLearningFlowTransport({}), resolveUserId: async () => USER,
    operationTimeoutMs: 30,
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { resolveRead([]); server.closeAllConnections(); server.close(); });
  const response = await fetch(`http://127.0.0.1:${server.address().port}/flow/start-explicit-study`, {
    method: 'POST', headers: { authorization: 'Bearer synthetic', 'content-type': 'application/json' },
    body: JSON.stringify({ node_id: NODE }),
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).data, undefined);
  assert.deepEqual([admitted, reads], [1, 1]);
  resolveRead([]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual([admitted, reads], [1, 2]); // Existing operation can finish; no admission replay.
});

test('real HTTP + in-process + Flow: authenticated user, exact payload, sanitized 503 and admission-first capacity', async (t) => {
  let failure = null, result = [projection('QUIZ')], reads = 0;
  t.mock.method(progress, 'recordExplicitStudy', async (pool, user) => {
    assert.equal(user, USER); if (failure) throw failure; return { state: 'INTRODUCED' };
  });
  t.mock.method(content, 'getContent', async (pool, node, type) => {
    reads++; return type === 'EXPLANATION' ? [] : result;
  });
  const server = createLearningFlowHttpServer({
    transport: new InProcessLearningFlowTransport({}), resolveUserId: async () => USER,
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const request = async () => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/flow/start-explicit-study`, {
      method: 'POST', headers: { authorization: 'Bearer synthetic', 'content-type': 'application/json' },
      body: JSON.stringify({ node_id: NODE }),
    });
    return { status: response.status, body: await response.json() };
  };
  assert.deepEqual(await request(), { status: 200, body: { status: 'ok', data: {
    explanation: null, state: 'INTRODUCED', initial_practice: projection('QUIZ'),
  } } });
  result = [projection('QUIZ'), projection('QUIZ')];
  let response = await request();
  assert.equal(response.status, 503); assert.equal(response.body.data, undefined);
  assert.equal(response.body.error_code, undefined); assert.equal(JSON.stringify(response).includes('CONTENT_'), false);
  failure = new progress.ContractViolationError('active Grammar Node limit 초과: private');
  reads = 0; response = await request();
  assert.equal(response.status, 422); assert.match(response.body.message, /^active Grammar Node limit 초과:/);
  assert.equal(reads, 0); assert.equal(response.body.message.includes('private'), false);
  failure = new progress.ContractViolationError('generic private');
  response = await request(); assert.equal(response.status, 422);
  assert.equal(response.body.message.includes('active Grammar'), false);
});
