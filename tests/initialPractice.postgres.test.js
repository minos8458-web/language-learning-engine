// Destructive synthetic fixtures, like the existing PG suites: use a disposable DB.
const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const content = require('../src/engines/contentEngine');
const flow = require('../src/engines/learningFlowEngine');
const { InProcessLearningFlowTransport } = require('../src/transport/inProcessLearningFlowTransport');
const { CapacityAdmissionConflictError } = require('../src/client/learningFlowTransportContract');

const A = 'GRAMMAR_VI_IP_A', B = 'GRAMMAR_VI_IP_B', C = 'GRAMMAR_VI_IP_C';
const r1 = (node, type) => content.getContent(pool, node, type, 'KO', type === 'EXPLANATION' ? 'BEGINNER' : undefined, 'EXPLICIT_STUDY');
let user, sequence = 0;
async function insertContent(type, overrides = {}) {
  const row = {
    content_id: `CONTENT_IP_${++sequence}`, grammar_node_ids: [A], content_type: type,
    media_assets: [{ media_format: 'TEXT', asset_ref: 'Synthetic test body' }],
    source: 'HUMAN_AUTHORED', human_reviewed: true, is_canonical: true,
    difficulty: 1, meta_language: 'KO', is_active: true,
    explanation_level: type === 'EXPLANATION' ? 'BEGINNER' : null,
    type_specific_metadata: type === 'QUIZ' ? { answer_key: 'synthetic', distractors: ['other'] } : null,
    ...overrides,
  };
  const json = new Set(['grammar_node_ids', 'media_assets', 'type_specific_metadata']);
  const keys = Object.keys(row);
  await pool.query(`INSERT INTO content (${keys.join(',')}, author) VALUES
    (${keys.map((key, index) => `$${index + 1}${json.has(key) ? '::jsonb' : ''}`).join(',')}, 'IP_SYNTHETIC')`,
  keys.map((key) => json.has(key) ? JSON.stringify(row[key]) : row[key]));
  return row.content_id;
}

describe('initial practice on real PostgreSQL', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
  });
  beforeEach(async () => {
    await pool.query('TRUNCATE content, users, grammar_nodes CASCADE');
    await pool.query(`INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
      VALUES ($1, 'VI', '[]', 'synthetic A', 1), ($2, 'VI', '[]', 'synthetic B', 1),
      ($3, 'VI', '[]', 'synthetic C', 1)`, [A, B, C]);
    const { rows } = await pool.query(`INSERT INTO users (auth_provider, auth_identifier, timezone)
      VALUES ('GUEST', 'IP_SYNTHETIC', 'UTC') RETURNING user_id`);
    user = rows[0].user_id;
  });
  after(() => pool.end());

  test('each R1 eligibility predicate excludes stored decoys while legacy lookup remains broad', async () => {
    for (const type of ['EXPLANATION', 'QUIZ']) {
      await pool.query('TRUNCATE content CASCADE');
      const eligible = await insertContent(type);
      const rejected = [];
      for (const override of [
        { source: 'AI_GENERATED' }, { human_reviewed: false }, { is_canonical: false },
        { is_active: false }, { grammar_node_ids: [A, B] }, { grammar_node_ids: [B] },
        { grammar_node_ids: [A, A] }, { meta_language: 'EN' }, { content_type: 'EXAMPLE' },
        ...(type === 'EXPLANATION' ? [{ explanation_level: 'ADVANCED' }, { explanation_level: null }] : []),
      ]) rejected.push(await insertContent(type, override));
      assert.deepEqual((await r1(A, type)).map((row) => row.content_id), [eligible]);
      // Legacy eligibility intentionally still allows unreviewed, noncanonical and multi-node rows.
      const legacy = await content.getContent(pool, A, type);
      assert.ok(legacy.some((row) => row.content_id === rejected[1]));
      assert.ok(legacy.some((row) => row.content_id === rejected[2]));
      assert.ok(legacy.some((row) => row.content_id === rejected[4]));
      assert.equal((await content.getContent(pool, rejected[3])).content_id, rejected[3]);
      await pool.query('DELETE FROM content WHERE content_id = $1', [eligible]);
      assert.deepEqual(await r1(A, type), []);
    }
  });

  test('all four content-presence combinations produce exact data, retaining human metadata/media', async () => {
    for (const hasExplanation of [false, true]) for (const hasQuiz of [false, true]) {
      await pool.query('TRUNCATE content CASCADE');
      if (hasExplanation) await insertContent('EXPLANATION', { media_assets: [
        { media_format: 'TEXT', asset_ref: 'synthetic explanation' },
        { media_format: 'AUDIO', asset_ref: 'synthetic.mp3', role: 'SUPPLEMENTARY', timing_metadata: { start: 0 } },
      ] });
      if (hasQuiz) await insertContent('QUIZ');
      const result = await flow.startExplicitStudy(pool, user, A);
      assert.deepEqual(Object.keys(result).sort(), ['explanation', 'initial_practice', 'state']);
      assert.equal(result.state, 'INTRODUCED');
      assert.deepEqual(result.explanation, (await r1(A, 'EXPLANATION'))[0] || null);
      assert.deepEqual(result.initial_practice, (await r1(A, 'QUIZ'))[0] || null);
      for (const item of [result.explanation, result.initial_practice].filter(Boolean)) {
        assert.deepEqual(Object.keys(item).sort(), ['content_id', 'content_type', 'difficulty', 'grammar_node_ids', 'media_assets', 'type_specific_metadata']);
      }
    }
    assert.equal((await pool.query('SELECT * FROM progress')).rows.length, 1);
  });

  test('duplicate canonical rows fail technically after committed admission; repair permits idempotent retry', async () => {
    for (const type of ['EXPLANATION', 'QUIZ']) {
      await pool.query('TRUNCATE content, progress CASCADE');
      await insertContent(type); const duplicate = await insertContent(type);
      await assert.rejects(flow.startExplicitStudy(pool, user, A), (error) => !error.code && /Invalid explicit study/.test(error.message));
      const admitted = (await pool.query('SELECT * FROM progress WHERE user_id = $1', [user])).rows;
      assert.equal(admitted.length, 1); assert.equal(admitted[0].state, 'INTRODUCED');
      await pool.query('DELETE FROM content WHERE content_id = $1', [duplicate]);
      await flow.startExplicitStudy(pool, user, A);
      assert.deepEqual((await pool.query('SELECT * FROM progress WHERE user_id = $1', [user])).rows, admitted);
    }
  });

  test('malformed stored body and answer key are not silently treated as empty', async () => {
    for (const overrides of [{ media_assets: [] }, { media_assets: [{ media_format: 'TEXT', asset_ref: ' ' }] },
      { type_specific_metadata: {} }, { type_specific_metadata: { answer_key: ' ' } }]) {
      await pool.query('TRUNCATE content CASCADE'); await insertContent('QUIZ', overrides);
      await assert.rejects(flow.startExplicitStudy(pool, user, A), (error) => !error.code);
      assert.equal((await pool.query('SELECT state FROM progress')).rows[0].state, 'INTRODUCED');
    }
  });

  test('a real SQL read error follows admission commit and explicit retry does not rewrite Progress', async () => {
    await pool.query('ALTER TABLE content RENAME TO ip_unavailable_content');
    try {
      await assert.rejects(flow.startExplicitStudy(pool, user, A), { code: '42P01' });
    } finally {
      await pool.query('ALTER TABLE ip_unavailable_content RENAME TO content');
    }
    const snapshot = (await pool.query('SELECT * FROM progress')).rows;
    assert.equal(snapshot.length, 1);
    assert.deepEqual(await flow.startExplicitStudy(pool, user, A), { explanation: null, state: 'INTRODUCED', initial_practice: null });
    assert.deepEqual((await pool.query('SELECT * FROM progress')).rows, snapshot);
  });

  test('concurrent same-node requests create exactly one admission', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => flow.startExplicitStudy(pool, user, A)));
    assert.ok(results.every((result) => result.state === 'INTRODUCED'));
    assert.equal((await pool.query('SELECT * FROM progress')).rows.length, 1);
  });

  test('concurrent different-node admissions respect capacity; existing states remain idempotent above it', async () => {
    const transport = new InProcessLearningFlowTransport(pool);
    const outcomes = await Promise.allSettled([A, B, C].map((node) => transport.startExplicitStudy(user, node)));
    assert.equal(outcomes.filter((outcome) => outcome.status === 'fulfilled').length, 2);
    const rejected = outcomes.find((outcome) => outcome.status === 'rejected');
    assert.ok(rejected.reason instanceof CapacityAdmissionConflictError);
    assert.equal((await pool.query('SELECT * FROM progress')).rows.length, 2);
    // Seed above-limit rows to verify existing-row fast path, including legacy NOT_INTRODUCED.
    for (const node of [A, B, C]) await pool.query(`INSERT INTO progress (user_id, node_id, state) VALUES ($1,$2,'INTRODUCED')
      ON CONFLICT (user_id,node_id) DO NOTHING`, [user, node]);
    assert.equal((await pool.query('SELECT * FROM progress')).rows.length, 3);
    const target = (await pool.query('SELECT node_id FROM progress ORDER BY node_id')).rows[0].node_id;
    for (const state of ['NOT_INTRODUCED', 'INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC']) {
      await pool.query('UPDATE progress SET state = $1 WHERE user_id = $2 AND node_id = $3', [state, user, target]);
      const before = (await pool.query('SELECT * FROM progress ORDER BY node_id')).rows;
      assert.equal((await transport.startExplicitStudy(user, target)).state, state);
      assert.deepEqual((await pool.query('SELECT * FROM progress ORDER BY node_id')).rows, before);
    }
  });

  test('missing user/node and capacity rejection never reach unavailable Content', async () => {
    const transport = new InProcessLearningFlowTransport(pool);
    await transport.startExplicitStudy(user, A); await transport.startExplicitStudy(user, B);
    await pool.query('ALTER TABLE content RENAME TO ip_unavailable_content');
    try {
      await assert.rejects(transport.startExplicitStudy(user, C), (error) => error instanceof CapacityAdmissionConflictError);
      await assert.rejects(transport.startExplicitStudy(user, 'MISSING'), { code: 'INVALID_ID' });
      await assert.rejects(transport.startExplicitStudy('00000000-0000-4000-8000-000000000000', A), { code: 'INVALID_ID' });
      assert.equal((await pool.query('SELECT * FROM progress')).rows.length, 2);
    } finally {
      await pool.query('ALTER TABLE ip_unavailable_content RENAME TO content');
    }
  });
});
