// AC-016 Learning Flow Engine validation against real PostgreSQL fixtures.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const {
  ACTIVE_NODE_LIMIT,
  INTERLEAVING_LIMITS,
  SESSION_BUDGET_MODE,
  CONVERSATION_PRACTICING_PLUS_THRESHOLD,
} = require('../src/config/engineConfig');
const learningFlowEngine = require('../src/engines/learningFlowEngine');

let fixtureSequence = 0;

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

async function createUser(label) {
  fixtureSequence += 1;
  const { rows } = await pool.query(
    `INSERT INTO users (auth_provider, auth_identifier, timezone)
     VALUES ('GUEST', $1, 'UTC') RETURNING user_id`,
    [`AC016_${label}_${fixtureSequence}`]
  );
  return rows[0].user_id;
}

async function createLanguage(language, definitions, relations = []) {
  const nodeIds = {};
  for (const definition of definitions) {
    const nodeId = `NODE_AC016_${language}_${definition.name}`;
    nodeIds[definition.name] = nodeId;
    const conceptIds = [];
    for (let index = 0; index < (definition.categories || []).length; index += 1) {
      const conceptId = `CONCEPT_AC016_${language}_${definition.name}_${index}`;
      conceptIds.push(conceptId);
      await pool.query(
        `INSERT INTO concepts
           (concept_id, category, function, difficulty, prerequisite_concept_ids)
         VALUES ($1, $2, 'AC016', $3, '[]'::jsonb)`,
        [conceptId, definition.categories[index], definition.difficulty || 1]
      );
    }
    await pool.query(
      `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
       VALUES ($1, $2, $3::jsonb, $4, $5)`,
      [nodeId, language, JSON.stringify(conceptIds), definition.name, definition.difficulty || 1]
    );
  }

  for (let index = 0; index < relations.length; index += 1) {
    const relation = relations[index];
    await pool.query(
      `INSERT INTO grammar_relations
         (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description)
       VALUES ($1, $2, $3, $4, $5, $6, 'AC016 fixture')`,
      [
        `REL_AC016_${language}_${index}`,
        nodeIds[relation.from],
        nodeIds[relation.to],
        relation.type,
        relation.type === 'PREREQUISITE' ? 'UNIDIRECTIONAL' : 'BIDIRECTIONAL',
        relation.weight || 1,
      ]
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

function multiplicities(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] || 0) + 1;
  return result;
}

function sortedKeys(value) {
  return Object.keys(value).sort();
}

describe('Learning Flow Engine (AC-016)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
  });

  after(async () => {
    await pool.end();
  });

  describe('public contract and acknowledgement', () => {
    test('exports startSession with the canonical four-argument signature', () => {
      assert.equal(typeof learningFlowEngine.startSession, 'function');
      assert.equal(learningFlowEngine.startSession.length, 4);
      assert.deepEqual(Object.keys(learningFlowEngine), ['startSession']);
    });

    test('treats omitted, explicit undefined, and false acknowledgement identically', async () => {
      const nodes = await createLanguage('AA', [
        { name: 'A', categories: ['A'] },
        { name: 'B', categories: ['B'] },
        { name: 'C', categories: ['C'] },
      ]);
      const userId = await createUser('ack_false');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'PRACTICING');

      const omitted = await learningFlowEngine.startSession(pool, userId, 'AA');
      const explicitUndefined = await learningFlowEngine.startSession(pool, userId, 'AA', undefined);
      const explicitFalse = await learningFlowEngine.startSession(pool, userId, 'AA', false);
      assert.deepEqual(omitted, { next_action: 'CONVERSATION' });
      assert.deepEqual(explicitUndefined, omitted);
      assert.deepEqual(explicitFalse, omitted);
    });

    test('true acknowledgement suppresses CONVERSATION for that call', async () => {
      const nodes = await createLanguage('AB', [
        { name: 'A', categories: ['A'] },
        { name: 'B', categories: ['B'] },
        { name: 'C', categories: ['C'] },
      ]);
      const userId = await createUser('ack_true');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'MASTERED');
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AB', true), {
        next_action: 'IDLE',
      });
    });

    test('rejects null acknowledgement as CONTRACT_VIOLATION', async () => {
      await rejectsWithCode(
        () => learningFlowEngine.startSession(pool, 'unused', 'AC', null),
        'CONTRACT_VIOLATION'
      );
    });

    test('rejects every non-boolean acknowledgement type', async () => {
      for (const value of [0, 1, 'false', {}, []]) {
        await rejectsWithCode(
          () => learningFlowEngine.startSession(pool, 'unused', 'AC', value),
          'CONTRACT_VIOLATION'
        );
      }
    });
  });

  describe('REVIEW priority and payload', () => {
    test('returns REVIEW before every lower branch with exact item keys', async () => {
      const nodes = await createLanguage('AD', [
        { name: 'DUE', categories: ['DUE'] },
        { name: 'I1', categories: ['I1'] },
        { name: 'I2', categories: ['I2'] },
        { name: 'P2', categories: ['P2'] },
        { name: 'P3', categories: ['P3'] },
        { name: 'NEW', categories: ['NEW'] },
      ]);
      const userId = await createUser('review_priority');
      await setProgress(userId, nodes.DUE, 'PRACTICING', new Date(Date.now() - 86400000));
      await setProgress(userId, nodes.I1, 'INTRODUCED');
      await setProgress(userId, nodes.I2, 'STUDYING');
      await setProgress(userId, nodes.P2, 'MASTERED');
      await setProgress(userId, nodes.P3, 'AUTOMATIC');

      const result = await learningFlowEngine.startSession(pool, userId, 'AD');
      assert.deepEqual(sortedKeys(result), ['next_action', 'review_batch']);
      assert.equal(result.next_action, 'REVIEW');
      assert.equal(result.review_batch.length, 1);
      assert.deepEqual(sortedKeys(result.review_batch[0]), [
        'next_review_at',
        'node_id',
        'overdue_by',
        'priority',
        'reason',
        'state',
      ]);
      assert.equal(result.review_batch[0].node_id, nodes.DUE);
    });

    test('an empty review batch falls through normally', async () => {
      const nodes = await createLanguage('AE', [{ name: 'NEW', categories: ['NEW'] }]);
      const userId = await createUser('review_empty');
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AE'), {
        next_action: 'NEW_GRAMMAR',
        node_id: nodes.NEW,
      });
    });
  });

  describe('NEW_GRAMMAR selection', () => {
    test('uses exact keys and outranks a ready CONVERSATION', async () => {
      const nodes = await createLanguage('AF', [
        { name: 'NEW', categories: ['NEW'], difficulty: 1 },
        { name: 'P1', categories: ['P1'] },
        { name: 'P2', categories: ['P2'] },
        { name: 'P3', categories: ['P3'] },
      ]);
      const userId = await createUser('new_priority');
      await setProgress(userId, nodes.P1, 'PRACTICING');
      await setProgress(userId, nodes.P2, 'MASTERED');
      await setProgress(userId, nodes.P3, 'AUTOMATIC');
      const result = await learningFlowEngine.startSession(pool, userId, 'AF');
      assert.deepEqual(result, { next_action: 'NEW_GRAMMAR', node_id: nodes.NEW });
      assert.deepEqual(sortedKeys(result), ['next_action', 'node_id']);
    });

    test('allows a MASTERED prerequisite', async () => {
      const nodes = await createLanguage(
        'AG',
        [
          { name: 'NEW', categories: ['NEW'] },
          { name: 'PRE', categories: ['PRE'] },
        ],
        [{ from: 'NEW', to: 'PRE', type: 'PREREQUISITE' }]
      );
      const userId = await createUser('mastered_pre');
      await setProgress(userId, nodes.PRE, 'MASTERED');
      assert.equal((await learningFlowEngine.startSession(pool, userId, 'AG')).node_id, nodes.NEW);
    });

    test('allows an AUTOMATIC prerequisite', async () => {
      const nodes = await createLanguage(
        'AH',
        [
          { name: 'NEW', categories: ['NEW'] },
          { name: 'PRE', categories: ['PRE'] },
        ],
        [{ from: 'NEW', to: 'PRE', type: 'PREREQUISITE' }]
      );
      const userId = await createUser('automatic_pre');
      await setProgress(userId, nodes.PRE, 'AUTOMATIC');
      assert.equal((await learningFlowEngine.startSession(pool, userId, 'AH')).node_id, nodes.NEW);
    });

    test('excludes an unmet prerequisite and chooses the next candidate', async () => {
      const nodes = await createLanguage(
        'AI',
        [
          { name: 'BLOCKED', categories: ['BLOCKED'], difficulty: 1 },
          { name: 'READY', categories: ['READY'], difficulty: 2 },
          { name: 'PRE', categories: ['PRE'] },
        ],
        [{ from: 'BLOCKED', to: 'PRE', type: 'PREREQUISITE' }]
      );
      const userId = await createUser('blocked_pre');
      await setProgress(userId, nodes.PRE, 'PRACTICING');
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AI'), {
        next_action: 'NEW_GRAMMAR',
        node_id: nodes.READY,
      });
    });

    test('sorts deterministically by difficulty and then node_id', async () => {
      const nodes = await createLanguage('AJ', [
        { name: 'Z', categories: ['Z'], difficulty: 2 },
        { name: 'B', categories: ['B'], difficulty: 1 },
        { name: 'A', categories: ['A'], difficulty: 1 },
      ]);
      const userId = await createUser('candidate_order');
      assert.equal((await learningFlowEngine.startSession(pool, userId, 'AJ')).node_id, nodes.A);
    });

    test('falls through when the AC-013 active admission limit is reached', async () => {
      const nodes = await createLanguage('AK', [
        { name: 'A', categories: ['SHARED'] },
        { name: 'B', categories: ['SHARED'] },
        { name: 'NEW', categories: ['NEW'] },
      ]);
      const userId = await createUser('active_limit');
      await setProgress(userId, nodes.A, 'INTRODUCED');
      await setProgress(userId, nodes.B, 'STUDYING');
      assert.equal(ACTIVE_NODE_LIMIT.maxConcurrentIntroducedOrStudying, 2);
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AK'), {
        next_action: 'IDLE',
      });
    });

    test('proposes NEW_GRAMMAR without creating progress or study records', async () => {
      const nodes = await createLanguage('AY', [{ name: 'NEW', categories: ['NEW'] }]);
      const userId = await createUser('read_only_new');
      const beforeResult = await pool.query(
        'SELECT count(*) AS count FROM progress WHERE user_id = $1',
        [userId]
      );
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AY'), {
        next_action: 'NEW_GRAMMAR',
        node_id: nodes.NEW,
      });
      const afterResult = await pool.query(
        'SELECT count(*) AS count FROM progress WHERE user_id = $1',
        [userId]
      );
      assert.equal(Number(beforeResult.rows[0].count), 0);
      assert.equal(Number(afterResult.rows[0].count), 0);
    });
  });

  describe('INTERLEAVING exhaustive composition', () => {
    test('returns an exact four-occurrence payload for two eligible nodes', async () => {
      const nodes = await createLanguage('AL', [
        { name: 'A', categories: ['A'] },
        { name: 'B', categories: ['B'] },
      ]);
      const userId = await createUser('interleave_two');
      await setProgress(userId, nodes.A, 'INTRODUCED');
      await setProgress(userId, nodes.B, 'STUDYING');
      const result = await learningFlowEngine.startSession(pool, userId, 'AL');
      assert.deepEqual(sortedKeys(result), ['next_action', 'node_sequence']);
      assert.equal(result.next_action, 'INTERLEAVING');
      assert.equal(result.node_sequence.length, 4);
      assert.deepEqual(multiplicities(result.node_sequence), { [nodes.A]: 2, [nodes.B]: 2 });
    });

    test('returns exactly six occurrences with base multiplicity for three nodes', async () => {
      const nodes = await createLanguage('AM', [
        { name: 'A', categories: ['A'] },
        { name: 'B', categories: ['B'] },
        { name: 'C', categories: ['C'] },
      ]);
      const userId = await createUser('interleave_three');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      const result = await learningFlowEngine.startSession(pool, userId, 'AM');
      assert.equal(result.node_sequence.length, 6);
      assert.deepEqual(multiplicities(result.node_sequence), {
        [nodes.A]: 2,
        [nodes.B]: 2,
        [nodes.C]: 2,
      });
    });

    test('outranks CONVERSATION when both are available', async () => {
      const nodes = await createLanguage('AN', [
        { name: 'A', categories: ['A'] },
        { name: 'B', categories: ['B'] },
        { name: 'P1', categories: ['P1'] },
        { name: 'P2', categories: ['P2'] },
        { name: 'P3', categories: ['P3'] },
      ]);
      const userId = await createUser('interleave_priority');
      await setProgress(userId, nodes.A, 'INTRODUCED');
      await setProgress(userId, nodes.B, 'STUDYING');
      await setProgress(userId, nodes.P1, 'PRACTICING');
      await setProgress(userId, nodes.P2, 'MASTERED');
      await setProgress(userId, nodes.P3, 'AUTOMATIC');
      assert.equal((await learningFlowEngine.startSession(pool, userId, 'AN')).next_action, 'INTERLEAVING');
    });

    test('skips two eligible nodes that share a Category', async () => {
      const nodes = await createLanguage('AO', [
        { name: 'A', categories: ['SHARED'] },
        { name: 'B', categories: ['SHARED'] },
        { name: 'P1', categories: ['P1'] },
        { name: 'P2', categories: ['P2'] },
        { name: 'P3', categories: ['P3'] },
      ]);
      const userId = await createUser('category_skip');
      await setProgress(userId, nodes.A, 'INTRODUCED');
      await setProgress(userId, nodes.B, 'STUDYING');
      await setProgress(userId, nodes.P1, 'PRACTICING');
      await setProgress(userId, nodes.P2, 'MASTERED');
      await setProgress(userId, nodes.P3, 'AUTOMATIC');
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AO'), {
        next_action: 'CONVERSATION',
      });
    });

    test('exhaustively finds the lexicographically smallest admissible subset', async () => {
      const nodes = await createLanguage('AP', [
        { name: 'A', categories: ['X'] },
        { name: 'B', categories: ['X'] },
        { name: 'C', categories: ['Y'] },
        { name: 'D', categories: ['Z'] },
      ]);
      const userId = await createUser('subset_lexical');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      const selected = new Set((await learningFlowEngine.startSession(pool, userId, 'AP')).node_sequence);
      assert.deepEqual([...selected].sort(), [nodes.A, nodes.C, nodes.D].sort());
    });

    test('prefers a larger admissible set before all later tuple terms', async () => {
      const nodes = await createLanguage(
        'AQ',
        [
          { name: 'A', categories: ['A'] },
          { name: 'B', categories: ['B'] },
          { name: 'C', categories: ['C'] },
        ],
        [{ from: 'A', to: 'B', type: 'CONTRAST' }]
      );
      const userId = await createUser('subset_size');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'STUDYING');
      assert.equal((await learningFlowEngine.startSession(pool, userId, 'AQ')).node_sequence.length, 6);
    });

    test('uses normalized CONTRAST pair count as the second selection tie-break', async () => {
      const nodes = await createLanguage(
        'AR',
        [
          { name: 'A', categories: ['A'] },
          { name: 'B', categories: ['B'] },
          { name: 'C', categories: ['C'] },
          { name: 'D', categories: ['D'] },
        ],
        [
          { from: 'B', to: 'C', type: 'CONTRAST' },
          { from: 'B', to: 'D', type: 'CONTRAST' },
        ]
      );
      const userId = await createUser('contrast_tie');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      const selected = new Set((await learningFlowEngine.startSession(pool, userId, 'AR')).node_sequence);
      assert.deepEqual([...selected].sort(), [nodes.B, nodes.C, nodes.D].sort());
    });

    test('uses Category diversity before node_id array ordering', async () => {
      const nodes = await createLanguage('AS', [
        { name: 'A', categories: [] },
        { name: 'B', categories: ['B'] },
        { name: 'C', categories: ['C'] },
        { name: 'D', categories: ['D'] },
      ]);
      const userId = await createUser('diversity_tie');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      const selected = new Set((await learningFlowEngine.startSession(pool, userId, 'AS')).node_sequence);
      assert.deepEqual([...selected].sort(), [nodes.B, nodes.C, nodes.D].sort());
    });

    test('counts every Category of a multi-category node in the hard gate', async () => {
      const nodes = await createLanguage('AT', [
        { name: 'A', categories: ['X', 'Y'] },
        { name: 'B', categories: ['X'] },
        { name: 'C', categories: ['Z'] },
      ]);
      const userId = await createUser('multi_category');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'STUDYING');
      const result = await learningFlowEngine.startSession(pool, userId, 'AT');
      assert.equal(result.node_sequence.length, 4);
      assert.deepEqual([...new Set(result.node_sequence)].sort(), [nodes.A, nodes.C].sort());
    });

    test('places no arbitrary cap on the eligible pool before exhaustive selection', async () => {
      const nodes = await createLanguage(
        'AZ',
        [
          { name: 'A', categories: ['A'] },
          { name: 'B', categories: ['B'] },
          { name: 'C', categories: ['C'] },
          { name: 'D', categories: ['D'] },
          { name: 'E', categories: ['E'] },
          { name: 'F', categories: ['F'] },
          { name: 'G', categories: ['G'] },
        ],
        [
          { from: 'E', to: 'F', type: 'CONTRAST' },
          { from: 'E', to: 'G', type: 'CONTRAST' },
          { from: 'F', to: 'G', type: 'CONTRAST' },
        ]
      );
      const userId = await createUser('uncapped_pool');
      for (const nodeId of Object.values(nodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      const selected = new Set((await learningFlowEngine.startSession(pool, userId, 'AZ')).node_sequence);
      assert.deepEqual([...selected].sort(), [nodes.E, nodes.F, nodes.G].sort());
    });
  });

  describe('CONVERSATION, IDLE, and isolation', () => {
    test('includes PRACTICING, MASTERED, and AUTOMATIC in the threshold', async () => {
      const nodes = await createLanguage('AU', [
        { name: 'P', categories: ['P'] },
        { name: 'M', categories: ['M'] },
        { name: 'A', categories: ['A'] },
      ]);
      const userId = await createUser('practicing_plus');
      await setProgress(userId, nodes.P, 'PRACTICING');
      await setProgress(userId, nodes.M, 'MASTERED');
      await setProgress(userId, nodes.A, 'AUTOMATIC');
      const result = await learningFlowEngine.startSession(pool, userId, 'AU');
      assert.deepEqual(result, { next_action: 'CONVERSATION' });
      assert.deepEqual(sortedKeys(result), ['next_action']);
    });

    test('excludes INTRODUCED and STUDYING from the PRACTICING+ threshold', async () => {
      const nodes = await createLanguage('AV', [
        { name: 'I', categories: ['SHARED'] },
        { name: 'S', categories: ['SHARED'] },
        { name: 'P', categories: ['P'] },
      ]);
      const userId = await createUser('threshold_exclusion');
      await setProgress(userId, nodes.I, 'INTRODUCED');
      await setProgress(userId, nodes.S, 'STUDYING');
      await setProgress(userId, nodes.P, 'PRACTICING');
      assert.deepEqual(await learningFlowEngine.startSession(pool, userId, 'AV'), {
        next_action: 'IDLE',
      });
    });

    test('returns IDLE as an exact normal fallback payload', async () => {
      const nodes = await createLanguage('AW', [{ name: 'M', categories: ['M'] }]);
      const userId = await createUser('idle');
      await setProgress(userId, nodes.M, 'MASTERED');
      const result = await learningFlowEngine.startSession(pool, userId, 'AW');
      assert.deepEqual(result, { next_action: 'IDLE' });
      assert.deepEqual(sortedKeys(result), ['next_action']);
    });

    test('isolates VI and EN eligible pools', async () => {
      const viNodes = await createLanguage('VI', [
        { name: 'A', categories: ['VI_A'] },
        { name: 'B', categories: ['VI_B'] },
      ]);
      const enNodes = await createLanguage('EN', [
        { name: 'A', categories: ['EN_A'] },
        { name: 'B', categories: ['EN_B'] },
      ]);
      const userId = await createUser('language_isolation');
      for (const nodeId of Object.values(viNodes)) await setProgress(userId, nodeId, 'INTRODUCED');
      for (const nodeId of Object.values(enNodes)) await setProgress(userId, nodeId, 'STUDYING');
      const viResult = await learningFlowEngine.startSession(pool, userId, 'VI');
      assert.deepEqual(new Set(viResult.node_sequence), new Set(Object.values(viNodes)));
      assert.equal(viResult.node_sequence.some((nodeId) => Object.values(enNodes).includes(nodeId)), false);
    });

    test('propagates a lower Engine error code unchanged', async () => {
      await createLanguage('AX', [{ name: 'A', categories: ['A'] }]);
      await rejectsWithCode(
        () => learningFlowEngine.startSession(
          pool,
          '00000000-0000-4000-8000-000000000000',
          'AX'
        ),
        'INVALID_ID'
      );
    });
  });

  describe('config and dependency boundaries', () => {
    test('consumes the canonical config values without function-local canonical literals', () => {
      assert.deepEqual(INTERLEAVING_LIMITS, { baseRepeats: 2, maxBatchSize: 6 });
      assert.equal(SESSION_BUDGET_MODE, 'UNBOUNDED_UNTIL_INPUT_AVAILABLE');
      assert.equal(CONVERSATION_PRACTICING_PLUS_THRESHOLD, 3);
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/learningFlowEngine.js'),
        'utf8'
      );
      assert.match(source, /INTERLEAVING_LIMITS\.baseRepeats/);
      assert.match(source, /INTERLEAVING_LIMITS\.maxBatchSize/);
      assert.match(source, /CONVERSATION_PRACTICING_PLUS_THRESHOLD/);
      assert.doesNotMatch(source, /UNBOUNDED_UNTIL_INPUT_AVAILABLE\s*['"]/);
    });

    test('imports only Graph, Progress, Interleaving, and engineConfig', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/learningFlowEngine.js'),
        'utf8'
      );
      const imports = [...source.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
      assert.deepEqual(imports, [
        './graphEngine',
        './progressEngine',
        './interleavingEngine',
        '../config/engineConfig',
      ]);
      assert.doesNotMatch(source, /\bpool\.query\b|\bpool\.connect\b|\bclient\.query\b/);
      assert.doesNotMatch(source, /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/);
    });

    test('contains no write API, cascade job, internal payload metadata, or disabled tests', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/learningFlowEngine.js'),
        'utf8'
      );
      assert.doesNotMatch(source, /recordExplicitStudy|recordAttempt|cascade_jobs/);
      assert.doesNotMatch(source, /candidate_set|selection_tuple|internal_score/);
      const testSource = fs.readFileSync(__filename, 'utf8');
      assert.doesNotMatch(testSource, /\.only\s*\(|\.skip\s*\(|\bxtest\s*\(|\bxdescribe\s*\(/);
    });

    test('keeps the five branch checks in canonical source order', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/learningFlowEngine.js'),
        'utf8'
      );
      const start = source.indexOf('async function startSession');
      const branchOffsets = [
        source.indexOf("next_action: 'REVIEW'", start),
        source.indexOf("next_action: 'NEW_GRAMMAR'", start),
        source.indexOf("next_action: 'INTERLEAVING'", start),
        source.indexOf("next_action: 'CONVERSATION'", start),
        source.indexOf("next_action: 'IDLE'", start),
      ];
      assert.equal(branchOffsets.every((offset) => offset >= start), true);
      assert.deepEqual([...branchOffsets].sort((a, b) => a - b), branchOffsets);
    });
  });
});
