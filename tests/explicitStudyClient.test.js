const { test } = require('node:test');
const assert = require('node:assert/strict');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { assertExplicitStudyResult } = require('../src/client/learningFlowTransportContract');
const { createPreviewTransport } = require('../mobile/previewTransport');

const NODE = 'NODE_SYNTHETIC';
const item = (type) => ({
  content_id: `CONTENT_${type}`, grammar_node_ids: [NODE], content_type: type,
  media_assets: [{ media_format: 'TEXT', asset_ref: 'synthetic body' },
    { media_format: 'AUDIO', asset_ref: 'synthetic.mp3', role: 'SUPPLEMENTARY', timing_metadata: { start: 0 } }],
  difficulty: 1, type_specific_metadata: type === 'QUIZ' ? { answer_key: 'answer', distractors: ['other'] } : null,
});
const result = () => ({ explanation: item('EXPLANATION'), state: 'INTRODUCED', initial_practice: item('QUIZ') });
const transport = (data, calls) => new HttpLearningFlowTransport({
  getAccessToken: () => 'synthetic', fetchImpl: async (url, options) => {
    calls.push([url, JSON.parse(options.body)]);
    return { status: 200, ok: true, json: async () => ({ status: 'ok', data }) };
  },
});

test('HTTP preserves all six states, independent nulls and human-authored projection unchanged', async () => {
  for (const state of ['NOT_INTRODUCED', 'INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC']) {
    for (const explanation of [null, item('EXPLANATION')]) for (const initial_practice of [null, item('QUIZ')]) {
      const data = { explanation, state, initial_practice }, calls = [];
      assert.equal(await transport(data, calls).startExplicitStudy('ignored', NODE), data);
      assert.deepEqual(calls, [['/flow/start-explicit-study', { node_id: NODE }]]);
    }
  }
});

test('missing/extra top-level fields, legacy state-only responses and unknown states reject without replay', async () => {
  const candidates = [{}, { state: 'INTRODUCED' }, { ...result(), state: 'READY' },
    { ...result(), extra: true }, { ...result(), explanation: undefined },
    { ...result(), initial_practice: undefined }, { ...result(), initial_practice: [] }];
  for (const key of ['explanation', 'state', 'initial_practice']) {
    const data = result(); delete data[key]; candidates.push(data);
  }
  for (const data of candidates) {
    const calls = [];
    await assert.rejects(transport(data, calls).startExplicitStudy('ignored', NODE), /올바른 응답/);
    assert.equal(calls.length, 1);
  }
});

test('wrong node/type, malformed projection/body/difficulty and missing quiz answer cannot succeed', async () => {
  const changes = [
    { content_id: '' }, { content_id: 1 }, { grammar_node_ids: ['OTHER'] },
    { grammar_node_ids: [NODE, 'OTHER'] }, { grammar_node_ids: [] },
    { content_type: 'EXAMPLE' }, { difficulty: '1' }, { difficulty: NaN }, { difficulty: 6 },
    { media_assets: [] }, { media_assets: [null] },
    { media_assets: [{ media_format: 'TEXT', asset_ref: ' ' }] },
    { media_assets: [{ media_format: 'INVALID', asset_ref: 'body' }] },
    { media_assets: [{ media_format: 'TEXT', asset_ref: 'body', role: 'INVALID' }] },
    { type_specific_metadata: [] }, { extra: true },
  ];
  for (const field of ['explanation', 'initial_practice']) {
    for (const change of changes) {
      const data = result(); Object.assign(data[field], change);
      const calls = [];
      await assert.rejects(transport(data, calls).startExplicitStudy('ignored', NODE));
      assert.equal(calls.length, 1);
    }
    for (const key of Object.keys(result()[field])) {
      const data = result(); delete data[field][key];
      await assert.rejects(transport(data, []).startExplicitStudy('ignored', NODE));
    }
  }
  for (const metadata of [null, {}, { answer_key: '' }, { answer_key: 42 }]) {
    const data = result(); data.initial_practice.type_specific_metadata = metadata;
    await assert.rejects(transport(data, []).startExplicitStudy('ignored', NODE));
  }
});

test('a response error never leaks untrusted fields into its diagnostic', async () => {
  const data = result(); data.initial_practice.content_id = { private: 'secret-marker' };
  await assert.rejects(transport(data, []).startExplicitStudy('ignored', NODE), (error) => {
    assert.equal(error.code, undefined);
    assert.equal(error.message.includes('secret-marker'), false);
    return true;
  });
});

test('synthetic previews satisfy the same exact response contract without fake content or extra fields', async () => {
  for (const scene of ['home', 'new', 'review', 'idle', 'conversation', 'interleaving']) {
    const data = await createPreviewTransport(scene).startExplicitStudy('synthetic', NODE);
    assert.deepEqual(assertExplicitStudyResult(data, NODE), {
      explanation: null, state: 'INTRODUCED', initial_practice: null,
    });
  }
});
