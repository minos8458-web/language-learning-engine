const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const graphEngine = require('../src/engines/graphEngine');
const progressEngine = require('../src/engines/progressEngine');
const aiModule = require('../src/engines/aiGenerationEngine');
const { createUnconfiguredProviderAdapter } = require('../src/providers/unconfiguredProviderAdapter');
const { AI_GENERATION } = require('../src/config/engineConfig');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const NODE_A = 'GRAMMAR_VI_ALPHA';
const NODE_B = 'GRAMMAR_VI_BETA';
const NODE_C = 'GRAMMAR_VI_GAMMA';
const originalGraph = {
  getConceptCategories: graphEngine.getConceptCategories,
  getNodeLanguageAndConcepts: graphEngine.getNodeLanguageAndConcepts,
  getNodeLabels: graphEngine.getNodeLabels,
};
const originalProgress = {
  getEligibleNodes: progressEngine.getEligibleNodes,
  getRecentAttemptedCombinations: progressEngine.getRecentAttemptedCombinations,
};

afterEach(() => {
  Object.assign(graphEngine, originalGraph);
  Object.assign(progressEngine, originalProgress);
});

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

function installNodeFakes() {
  graphEngine.getNodeLanguageAndConcepts = async (_pool, nodeIds) => {
    const facts = {
      [NODE_A]: { language: 'VI', concept_ids: ['CONCEPT_A'] },
      [NODE_B]: { language: 'VI', concept_ids: ['CONCEPT_TARGET'] },
      [NODE_C]: { language: 'VI', concept_ids: ['CONCEPT_C'] },
      GRAMMAR_EN_OTHER: { language: 'EN', concept_ids: [] },
    };
    return Object.fromEntries(nodeIds.map((nodeId) => [nodeId, facts[nodeId]]));
  };
  graphEngine.getNodeLabels = async (_pool, nodeIds) => {
    const labels = { [NODE_A]: 'alpha', [NODE_B]: 'beta', [NODE_C]: 'gamma' };
    return Object.fromEntries(nodeIds.map((nodeId) => [nodeId, labels[nodeId]]));
  };
}

function fakeAdapter(generationSequence, validatorSequence = []) {
  const generationRequests = [];
  const validatorRequests = [];
  let generationIndex = 0;
  let validatorIndex = 0;

  async function resolveItem(item, request) {
    if (item instanceof Error) throw item;
    if (typeof item === 'function') return item(request);
    return item;
  }

  return {
    generationRequests,
    validatorRequests,
    async generateStructuredContent(request) {
      generationRequests.push(structuredClone(request));
      const item = generationSequence[Math.min(generationIndex, generationSequence.length - 1)];
      generationIndex += 1;
      return resolveItem(item, request);
    },
    async validateGeneratedContent(request) {
      validatorRequests.push(structuredClone(request));
      const item = validatorSequence[Math.min(validatorIndex, validatorSequence.length - 1)];
      validatorIndex += 1;
      return resolveItem(item, request);
    },
  };
}

const goodRaw = {
  generated_text: 'alpha beta exercise',
  answer_key: 'correct answer',
  self_reported_node_ids: ['UNTRUSTED_NODE'],
};
const validValidator = { is_valid: true, violations: [] };
const recent = [
  {
    content_id: 'CONTENT_RECENT_1',
    media_assets: [{ media_format: 'TEXT', asset_ref: 'older example', role: 'PRIMARY' }],
    created_at: '2026-07-23T00:00:00.000Z',
  },
];

describe('AI Generation Engine (AC-017/AC-018)', () => {
  describe('select_generation_candidates', () => {
    test('selects the least-used exact combination with element-wise lexicographic tie-break', async () => {
      installNodeFakes();
      progressEngine.getEligibleNodes = async () => [NODE_C, NODE_A, NODE_B, NODE_A];
      progressEngine.getRecentAttemptedCombinations = async () => [
        { grammar_node_ids: [NODE_B, NODE_A], content_id: 'C1', attempted_at: '2026-07-23T00:00:00Z' },
        { grammar_node_ids: [NODE_A, NODE_B], content_id: 'C2', attempted_at: '2026-07-23T00:01:00Z' },
        { grammar_node_ids: [NODE_C, NODE_A], content_id: 'C3', attempted_at: '2026-07-23T00:02:00Z' },
      ];
      graphEngine.getConceptCategories = async () => ({});

      assert.deepEqual(
        await aiModule.selectGenerationCandidates({}, USER_ID, 'VI', 'COMBINATION'),
        { grammar_node_ids: [NODE_B, NODE_C] }
      );
    });

    test('validates target Concept exactly once and filters candidates by canonical concepts', async () => {
      installNodeFakes();
      let conceptCalls = 0;
      graphEngine.getConceptCategories = async (_pool, conceptIds) => {
        conceptCalls += 1;
        assert.deepEqual(conceptIds, ['CONCEPT_TARGET']);
        return { CONCEPT_TARGET: 'IGNORED_CATEGORY' };
      };
      progressEngine.getEligibleNodes = async () => [NODE_A, NODE_B, NODE_C];
      progressEngine.getRecentAttemptedCombinations = async () => [];

      assert.deepEqual(
        await aiModule.selectGenerationCandidates(
          {},
          USER_ID,
          'VI',
          'SINGLE_NODE',
          'CONCEPT_TARGET'
        ),
        { grammar_node_ids: [NODE_B] }
      );
      assert.equal(conceptCalls, 1);
    });

    test('returns exact null when a mode has insufficient candidates', async () => {
      installNodeFakes();
      progressEngine.getEligibleNodes = async () => [NODE_A];
      progressEngine.getRecentAttemptedCombinations = async () => [];
      graphEngine.getConceptCategories = async () => ({});
      assert.deepEqual(
        await aiModule.selectGenerationCandidates({}, USER_ID, 'VI', 'COMBINATION'),
        { grammar_node_ids: null }
      );
    });

    test('applies exact planning input validation', async () => {
      await rejectsWithCode(() => aiModule.selectGenerationCandidates({}), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, USER_ID),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, USER_ID, 'VI'),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, 'bad-uuid', 'VI', 'COMBINATION'),
        'INVALID_ID'
      );
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, USER_ID, 'vi', 'COMBINATION'),
        'OUT_OF_RANGE_VALUE'
      );
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, USER_ID, 'VI', 'OTHER'),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => aiModule.selectGenerationCandidates({}, USER_ID, 'VI', 'COMBINATION', null),
        'CONTRACT_VIOLATION'
      );
    });
  });

  describe('generation provider and validator boundary', () => {
    test('uses exact requests and returns exact Layer 2 while ignoring self-report mismatch', async () => {
      installNodeFakes();
      const adapter = fakeAdapter([goodRaw], [validValidator]);
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], recent);

      assert.deepEqual(adapter.generationRequests, [
        {
          language: 'VI',
          grammar_nodes: [
            { node_id: NODE_A, label: 'alpha' },
            { node_id: NODE_B, label: 'beta' },
          ],
          recent_generated_texts: ['older example'],
          regeneration_feedback: [],
        },
      ]);
      assert.deepEqual(adapter.validatorRequests, [
        {
          language: 'VI',
          grammar_nodes: [
            { node_id: NODE_A, label: 'alpha' },
            { node_id: NODE_B, label: 'beta' },
          ],
          generated_text: 'alpha beta exercise',
        },
      ]);
      assert.deepEqual(result, {
        candidate: {
          grammar_node_ids: [NODE_A, NODE_B],
          media_assets: [
            { media_format: 'TEXT', asset_ref: 'alpha beta exercise', role: 'PRIMARY' },
          ],
          type_specific_metadata: { answer_key: 'correct answer' },
        },
      });
    });

    test('feeds deterministic raw-schema feedback into regeneration', async () => {
      installNodeFakes();
      const adapter = fakeAdapter(
        [{ ...goodRaw, extra: true }, goodRaw],
        [validValidator]
      );
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []);
      assert.notEqual(result.candidate, null);
      assert.deepEqual(adapter.generationRequests[1].regeneration_feedback, [
        'Provider raw response violates exact schema',
      ]);
    });

    test('runs Rule before validator and passes Rule feedback to regeneration', async () => {
      installNodeFakes();
      const adapter = fakeAdapter(
        [{ ...goodRaw, generated_text: 'alpha only' }, goodRaw],
        [validValidator]
      );
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []);
      assert.notEqual(result.candidate, null);
      assert.equal(adapter.validatorRequests.length, 1);
      assert.deepEqual(adapter.generationRequests[1].regeneration_feedback, [
        'Generated text is missing required grammar label: beta',
      ]);
    });

    test('passes validator violations unchanged into the shared regeneration pool', async () => {
      installNodeFakes();
      const violations = ['unexpected grammar gamma'];
      const adapter = fakeAdapter(
        [goodRaw, goodRaw],
        [{ is_valid: false, violations }, validValidator]
      );
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []);
      assert.notEqual(result.candidate, null);
      assert.deepEqual(adapter.generationRequests[1].regeneration_feedback, violations);
    });

    test('keeps generation and validator technical retries independent', async () => {
      installNodeFakes();
      const adapter = fakeAdapter(
        [new Error('generation timeout'), goodRaw],
        [new Error('validator timeout'), validValidator]
      );
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []);
      assert.notEqual(result.candidate, null);
      assert.equal(adapter.generationRequests.length, 2);
      assert.deepEqual(adapter.generationRequests[0], adapter.generationRequests[1]);
      assert.equal(adapter.validatorRequests.length, 2);
      assert.deepEqual(adapter.validatorRequests[0], adapter.validatorRequests[1]);
    });

    test('degrades after validator technical retry without consuming regeneration', async () => {
      installNodeFakes();
      const adapter = fakeAdapter(
        [goodRaw],
        [new Error('validator timeout'), new Error('validator timeout again')]
      );
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      assert.deepEqual(
        await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []),
        { candidate: null }
      );
      assert.equal(adapter.generationRequests.length, 1);
      assert.equal(adapter.validatorRequests.length, 2);
    });

    test('shares exactly three generation calls across content violations', async () => {
      installNodeFakes();
      const adapter = fakeAdapter([{ generated_text: '', answer_key: '', self_reported_node_ids: [] }]);
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      assert.deepEqual(
        await engine.generateCombination({}, 'VI', [NODE_A, NODE_B], []),
        { candidate: null }
      );
      assert.equal(adapter.generationRequests.length, 3);
      assert.equal(adapter.validatorRequests.length, 0);
    });

    test('SINGLE_NODE applies Rule only and never calls validator', async () => {
      installNodeFakes();
      const singleRaw = {
        generated_text: 'alpha exercise',
        answer_key: 'answer',
        self_reported_node_ids: [],
      };
      const adapter = fakeAdapter([singleRaw], [validValidator]);
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      const result = await engine.generateSingleNode({}, 'VI', [NODE_A], []);
      assert.notEqual(result.candidate, null);
      assert.equal(adapter.validatorRequests.length, 0);
    });

    test('rejects invalid node ordering, language, and recent shape before provider calls', async () => {
      installNodeFakes();
      const adapter = fakeAdapter([goodRaw], [validValidator]);
      const engine = aiModule.createAiGenerationEngine({ providerAdapter: adapter });
      await rejectsWithCode(
        () => engine.generateCombination({}, 'VI', [NODE_B, NODE_A], []),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => engine.generateCombination({}, 'VI', [NODE_A, NODE_A], []),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => engine.generateSingleNode({}, 'VI', ['GRAMMAR_EN_OTHER'], []),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => engine.generateSingleNode({}, 'VI', [NODE_A], [{ ...recent[0], extra: true }]),
        'CONTRACT_VIOLATION'
      );
      assert.equal(adapter.generationRequests.length, 0);
    });
  });

  test('createAiGenerationEngine fails synchronously for every incomplete adapter shape', () => {
    for (const providerAdapter of [
      undefined,
      null,
      {},
      { generateStructuredContent() {} },
      { validateGeneratedContent() {} },
      { generateStructuredContent: true, validateGeneratedContent() {} },
    ]) {
      assert.throws(() => aiModule.createAiGenerationEngine({ providerAdapter }), TypeError);
    }
  });

  test('unconfigured production adapter returns only sanitized technical failures', async () => {
    const adapter = createUnconfiguredProviderAdapter();
    const secret = 'credential-and-prompt-must-not-leak';
    for (const operation of ['generateStructuredContent', 'validateGeneratedContent']) {
      await assert.rejects(() => adapter[operation]({ secret }), (error) => {
        assert.equal(error.constructor, Error);
        assert.doesNotMatch(error.message, new RegExp(secret));
        assert.doesNotMatch(error.message, /credential|prompt|payload/i);
        assert.equal(error.code, undefined);
        return true;
      });
    }
  });

  test('unconfigured adapter drives a fail-closed candidate downgrade', async () => {
    installNodeFakes();
    const engine = aiModule.createAiGenerationEngine({
      providerAdapter: createUnconfiguredProviderAdapter(),
    });
    assert.deepEqual(await engine.generateSingleNode({}, 'VI', [NODE_A], []), {
      candidate: null,
    });
  });

  test('uses the exact approved AI generation configuration', () => {
    assert.deepEqual(AI_GENERATION, {
      defaultMetaLanguage: 'KO',
      technicalRetryCount: 1,
      maxRegenerationAttempts: 2,
    });
  });

  test('static boundary permits only Graph/Progress/config and contains no SQL or Content import', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/engines/aiGenerationEngine.js'), 'utf8');
    const imports = [...source.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
    assert.deepEqual(imports.sort(), ['./graphEngine', './progressEngine', '../config/engineConfig'].sort());
    const graphCalls = [...new Set(
      [...source.matchAll(/graphEngine\.([A-Za-z0-9_]+)/g)].map((match) => match[1])
    )].sort();
    const progressCalls = [...new Set(
      [...source.matchAll(/progressEngine\.([A-Za-z0-9_]+)/g)].map((match) => match[1])
    )].sort();
    assert.deepEqual(graphCalls, [
      'getConceptCategories',
      'getNodeLabels',
      'getNodeLanguageAndConcepts',
    ]);
    assert.deepEqual(progressCalls, [
      'getEligibleNodes',
      'getRecentAttemptedCombinations',
    ]);
    assert.doesNotMatch(source, /contentEngine/i);
    assert.doesNotMatch(source, /\b(SELECT|INSERT|UPDATE|DELETE|FROM|JOIN)\b/i);
  });
});
