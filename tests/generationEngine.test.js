const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const generationModule = require('../src/engines/generationEngine');
const {
  generationEngine: productionGenerationEngine,
  createGenerationComposition,
} = require('../src/composition/generationComposition');

const USER_ID = '22222222-2222-4222-8222-222222222222';
const NODE_A = 'GRAMMAR_VI_ALPHA';
const NODE_B = 'GRAMMAR_VI_BETA';
const candidate = (nodeIds) => ({
  candidate: {
    grammar_node_ids: nodeIds,
    media_assets: [{ media_format: 'TEXT', asset_ref: `${nodeIds.join(' ')} exercise`, role: 'PRIMARY' }],
    type_specific_metadata: { answer_key: 'answer' },
  },
});
const savedContent = (contentId, nodeIds) => ({
  content_id: contentId,
  grammar_node_ids: nodeIds,
  content_type: 'QUIZ',
  media_assets: [{ media_format: 'TEXT', asset_ref: 'saved exercise', role: 'PRIMARY' }],
  difficulty: nodeIds.length,
  type_specific_metadata: { answer_key: 'answer' },
});
const preMadeContent = {
  content_id: 'CONTENT_VI_ALPHA_EXAMPLE_1',
  grammar_node_ids: [NODE_A],
  content_type: 'EXAMPLE',
  media_assets: [{ media_format: 'TEXT', asset_ref: 'human example', role: 'PRIMARY' }],
  difficulty: 1,
  type_specific_metadata: null,
};

function createDependencies(overrides = {}) {
  const calls = {
    plans: [],
    combination: [],
    single: [],
    recent: [],
    save: [],
    getContent: [],
  };
  const aiGenerationEngine = {
    async selectGenerationCandidates(...args) {
      calls.plans.push(args);
      return { grammar_node_ids: null };
    },
    async generateCombination(...args) {
      calls.combination.push(args);
      return { candidate: null };
    },
    async generateSingleNode(...args) {
      calls.single.push(args);
      return { candidate: null };
    },
    ...overrides.ai,
  };
  const contentEngine = {
    async getRecentGeneratedContent(...args) {
      calls.recent.push(args);
      return [];
    },
    async saveGeneratedContent(...args) {
      calls.save.push(args);
      return savedContent('CONTENT_SAVED', args[1]);
    },
    async getContent(...args) {
      calls.getContent.push(args);
      return [];
    },
    ...overrides.content,
  };
  return { calls, aiGenerationEngine, contentEngine };
}

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

describe('Generation Engine (AC-017/AC-018)', () => {
  test('ladder step 1 preserves IDs/recent input, saves, and lazily ignores targetNodeId', async () => {
    const recentRows = [
      { content_id: 'RECENT', media_assets: [], created_at: '2026-07-23T00:00:00Z' },
    ];
    const deps = createDependencies({
      ai: {
        async selectGenerationCandidates(...args) {
          deps.calls.plans.push(args);
          return { grammar_node_ids: [NODE_A, NODE_B] };
        },
        async generateCombination(...args) {
          deps.calls.combination.push(args);
          return candidate([NODE_A, NODE_B]);
        },
      },
      content: {
        async getRecentGeneratedContent(...args) {
          deps.calls.recent.push(args);
          return recentRows;
        },
        async saveGeneratedContent(...args) {
          deps.calls.save.push(args);
          return savedContent('CONTENT_STEP_1', [NODE_A, NODE_B]);
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    const result = await engine.generateProblem(
      {},
      USER_ID,
      'VI',
      'CONCEPT_TARGET',
      'GRAMMAR_VI_UNUSED_DOES_NOT_EXIST'
    );
    assert.deepEqual(result, {
      content: savedContent('CONTENT_STEP_1', [NODE_A, NODE_B]),
      content_id: 'CONTENT_STEP_1',
      source: 'AI_GENERATED',
      ladder_step: 1,
    });
    assert.equal(deps.calls.plans.length, 1);
    assert.deepEqual(deps.calls.plans[0].slice(1), [
      USER_ID,
      'VI',
      'COMBINATION',
      'CONCEPT_TARGET',
    ]);
    assert.strictEqual(deps.calls.combination[0][3], recentRows);
    assert.equal(deps.calls.getContent.length, 0);
    assert.deepEqual(deps.calls.save[0].slice(1), [
      [NODE_A, NODE_B],
      'QUIZ',
      candidate([NODE_A, NODE_B]).candidate.media_assets,
      { answer_key: 'answer' },
    ]);
  });

  test('ladder step 2 runs only after step 1 normal null', async () => {
    const deps = createDependencies({
      ai: {
        async selectGenerationCandidates(...args) {
          deps.calls.plans.push(args);
          return args[3] === 'COMBINATION'
            ? { grammar_node_ids: null }
            : { grammar_node_ids: [NODE_A] };
        },
        async generateSingleNode(...args) {
          deps.calls.single.push(args);
          return candidate([NODE_A]);
        },
      },
      content: {
        async saveGeneratedContent(...args) {
          deps.calls.save.push(args);
          return savedContent('CONTENT_STEP_2', [NODE_A]);
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    const result = await engine.generateProblem({}, USER_ID, 'VI');
    assert.equal(result.ladder_step, 2);
    assert.equal(result.content_id, 'CONTENT_STEP_2');
    assert.deepEqual(deps.calls.plans.map((call) => call[3]), ['COMBINATION', 'SINGLE_NODE']);
    assert.equal(deps.calls.combination.length, 0);
    assert.equal(deps.calls.single.length, 1);
  });

  test('ladder step 3 returns the single PRE_MADE projection', async () => {
    const deps = createDependencies({
      content: {
        async getContent(...args) {
          deps.calls.getContent.push(args);
          return [preMadeContent];
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    assert.deepEqual(await engine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A), {
      content: preMadeContent,
      content_id: preMadeContent.content_id,
      source: 'PRE_MADE',
      ladder_step: 3,
    });
    assert.deepEqual(deps.calls.getContent[0].slice(1), [NODE_A, 'EXAMPLE']);
  });

  test('ladder step 4 is exact for omitted target and PRE_MADE normal empty', async () => {
    const noTarget = createDependencies();
    const noTargetEngine = generationModule.createGenerationEngine(noTarget);
    assert.deepEqual(await noTargetEngine.generateProblem({}, USER_ID, 'VI'), {
      content: null,
      content_id: null,
      source: null,
      ladder_step: 4,
    });
    assert.equal(noTarget.calls.getContent.length, 0);

    const empty = createDependencies();
    const emptyEngine = generationModule.createGenerationEngine(empty);
    assert.deepEqual(await emptyEngine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A), {
      content: null,
      content_id: null,
      source: null,
      ladder_step: 4,
    });
    assert.equal(empty.calls.getContent.length, 1);
  });

  test('PRE_MADE technical retry is exactly once and independent', async () => {
    let attempts = 0;
    const deps = createDependencies({
      content: {
        async getContent(...args) {
          deps.calls.getContent.push(args);
          attempts += 1;
          if (attempts === 1) throw new Error('temporary read failure');
          return [preMadeContent];
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    const result = await engine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A);
    assert.equal(result.ladder_step, 3);
    assert.equal(attempts, 2);
  });

  test('PRE_MADE retry rethrows a sanitized error after the second technical failure', async () => {
    const deps = createDependencies({
      content: {
        async getContent(...args) {
          deps.calls.getContent.push(args);
          throw new Error('postgres raw secret');
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    await assert.rejects(
      () => engine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A),
      (error) => {
        assert.equal(error.message, 'PRE_MADE Content read failed');
        assert.doesNotMatch(error.message, /postgres|secret/i);
        return true;
      }
    );
    assert.equal(deps.calls.getContent.length, 2);
  });

  test('PRE_MADE contract errors are not retried', async () => {
    const contractError = Object.assign(new Error('missing target'), { code: 'INVALID_ID' });
    const deps = createDependencies({
      content: {
        async getContent(...args) {
          deps.calls.getContent.push(args);
          throw contractError;
        },
      },
    });
    const engine = generationModule.createGenerationEngine(deps);
    await assert.rejects(
      () => engine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A),
      (error) => error === contractError
    );
    assert.equal(deps.calls.getContent.length, 1);
  });

  test('PRE_MADE cardinality 2+ logs only a generalized invariant and throws', async () => {
    const deps = createDependencies({
      content: { async getContent() { return [preMadeContent, { ...preMadeContent, content_id: 'SECOND' }]; } },
    });
    const engine = generationModule.createGenerationEngine(deps);
    const originalError = console.error;
    const logged = [];
    console.error = (...args) => logged.push(args);
    try {
      await assert.rejects(
        () => engine.generateProblem({}, USER_ID, 'VI', undefined, NODE_A),
        /PRE_MADE Content invariant violation/
      );
    } finally {
      console.error = originalError;
    }
    assert.deepEqual(logged, [['PRE_MADE Content cardinality invariant violated']]);
  });

  test('save failure throws immediately without ladder fallback', async () => {
    const saveError = new Error('save failed');
    const deps = createDependencies({
      ai: {
        async selectGenerationCandidates() { return { grammar_node_ids: [NODE_A, NODE_B] }; },
        async generateCombination() { return candidate([NODE_A, NODE_B]); },
      },
      content: { async saveGeneratedContent() { throw saveError; } },
    });
    const engine = generationModule.createGenerationEngine(deps);
    await assert.rejects(() => engine.generateProblem({}, USER_ID, 'VI'), (error) => error === saveError);
    assert.equal(deps.calls.getContent.length, 0);
  });

  test('validates required and optional inputs without SQL or dependency calls', async () => {
    const deps = createDependencies();
    const engine = generationModule.createGenerationEngine(deps);
    await rejectsWithCode(() => engine.generateProblem({}), 'MISSING_REQUIRED_FIELD');
    await rejectsWithCode(() => engine.generateProblem({}, USER_ID), 'MISSING_REQUIRED_FIELD');
    await rejectsWithCode(() => engine.generateProblem({}, 'bad-uuid', 'VI'), 'INVALID_ID');
    await rejectsWithCode(() => engine.generateProblem({}, USER_ID, 'vi'), 'OUT_OF_RANGE_VALUE');
    await rejectsWithCode(() => engine.generateProblem({}, USER_ID, 'VI', null), 'CONTRACT_VIOLATION');
    await rejectsWithCode(
      () => engine.generateProblem({}, USER_ID, 'VI', undefined, ''),
      'CONTRACT_VIOLATION'
    );
    assert.equal(deps.calls.plans.length, 0);
  });

  test('createGenerationEngine rejects every incomplete dependency combination synchronously', () => {
    const validAi = createDependencies().aiGenerationEngine;
    const validContent = createDependencies().contentEngine;
    for (const aiGenerationEngine of [
      undefined,
      null,
      {},
      { ...validAi, selectGenerationCandidates: undefined },
      { ...validAi, generateCombination: undefined },
      { ...validAi, generateSingleNode: undefined },
    ]) {
      assert.throws(
        () => generationModule.createGenerationEngine({ aiGenerationEngine, contentEngine: validContent }),
        TypeError
      );
    }
    for (const contentEngine of [
      undefined,
      null,
      {},
      { ...validContent, getRecentGeneratedContent: undefined },
      { ...validContent, saveGeneratedContent: undefined },
      { ...validContent, getContent: undefined },
    ]) {
      assert.throws(
        () => generationModule.createGenerationEngine({ aiGenerationEngine: validAi, contentEngine }),
        TypeError
      );
    }
  });

  test('production composition explicitly creates a fail-closed generation engine', () => {
    const composition = createGenerationComposition();
    assert.deepEqual(Object.keys(composition), ['generationEngine']);
    assert.equal(typeof composition.generationEngine.generateProblem, 'function');
    assert.equal(typeof productionGenerationEngine.generateProblem, 'function');
    assert.equal(Object.isFrozen(composition), true);
    assert.equal(Object.isFrozen(productionGenerationEngine), true);
  });

  test('static boundary contains no SQL or Graph/Progress import', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/engines/generationEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(codeOnly, /require\([^)]*(graphEngine|progressEngine)[^)]*\)/i);
    assert.doesNotMatch(codeOnly, /\b(SELECT|INSERT|UPDATE|DELETE|FROM|JOIN)\b/i);
  });
});
