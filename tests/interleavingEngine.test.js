// tests/interleavingEngine.test.js
// AC-014/AC-015 sequence_nodes validation with real PostgreSQL fixtures.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const { INTERLEAVING_LIMITS } = require('../src/config/engineConfig');
const interleavingEngine = require('../src/engines/interleavingEngine');

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

function counts(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] || 0) + 1;
  return result;
}

describe('Interleaving Engine (AC-015)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();

    await pool.query(`
      INSERT INTO concepts
        (concept_id, category, function, difficulty, prerequisite_concept_ids) VALUES
        ('CONCEPT_AC015_SHARED_A', 'SHARED', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC015_SHARED_B', 'SHARED', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC015_OTHER', 'OTHER', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC015_MULTI_A', 'MULTI_A', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC015_MULTI_B', 'MULTI_B', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC015_MULTI_SHARED', 'MULTI_A', 'FUNC', 1, '[]'::jsonb)
    `);

    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('NODE_AC015_A', 'VI', '["CONCEPT_AC015_SHARED_A"]'::jsonb, 'A', 1),
        ('NODE_AC015_B', 'VI', '["CONCEPT_AC015_SHARED_B"]'::jsonb, 'B', 1),
        ('NODE_AC015_C', 'VI', '["CONCEPT_AC015_OTHER"]'::jsonb, 'C', 1),
        ('NODE_AC015_D', 'VI', '[]'::jsonb, 'D', 1),
        ('NODE_AC015_E', 'VI', '["CONCEPT_AC015_MULTI_A", "CONCEPT_AC015_MULTI_B"]'::jsonb, 'E', 1),
        ('NODE_AC015_F', 'VI', '["CONCEPT_AC015_MULTI_SHARED"]'::jsonb, 'F', 1),
        ('NODE_AC015_EN', 'EN', '["CONCEPT_AC015_OTHER"]'::jsonb, 'EN', 1)
    `);

    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_AC015_CE_LOW', 'NODE_AC015_C', 'NODE_AC015_E', 'CONTRAST', 'BIDIRECTIONAL', 0.1, 'C/E contrast low'),
        ('REL_AC015_CE_HIGH', 'NODE_AC015_E', 'NODE_AC015_C', 'CONTRAST', 'BIDIRECTIONAL', 9.9, 'C/E contrast high')
    `);
  });

  after(async () => {
    await pool.end();
  });

  describe('input validation and config', () => {
    test('rejects omitted and explicit undefined node_ids', async () => {
      await rejectsWithCode(() => interleavingEngine.sequenceNodes(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null and non-array node_ids', async () => {
      await rejectsWithCode(() => interleavingEngine.sequenceNodes(pool, null), 'CONTRACT_VIOLATION');
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, 'NODE_AC015_A'),
        'CONTRACT_VIOLATION'
      );
    });

    test('rejects invalid array elements', async () => {
      for (const nodeIds of [[42], [''], ['   ']]) {
        await rejectsWithCode(
          () => interleavingEngine.sequenceNodes(pool, nodeIds),
          'CONTRACT_VIOLATION'
        );
      }
    });

    test('uses the exported provisional maxBatchSize default', () => {
      assert.equal(INTERLEAVING_LIMITS.maxBatchSize, 6);
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/interleavingEngine.js'),
        'utf8'
      );
      assert.match(source, /INTERLEAVING_LIMITS\.maxBatchSize/);
      assert.doesNotMatch(source, /nodeIds\.length\s*>\s*6/);
    });

    test('rejects seven occurrences before dedupe or ID lookup', async () => {
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, Array(7).fill('NODE_AC015_A')),
        'OUT_OF_RANGE_VALUE'
      );
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, Array(7).fill('NODE_AC015_MISSING')),
        'OUT_OF_RANGE_VALUE'
      );
    });
  });

  describe('metadata and language boundary', () => {
    test('returns empty and singleton inputs unchanged', async () => {
      assert.deepEqual(await interleavingEngine.sequenceNodes(pool, []), []);
      assert.deepEqual(await interleavingEngine.sequenceNodes(pool, ['NODE_AC015_A']), [
        'NODE_AC015_A',
      ]);
    });

    test('rejects a missing node ID', async () => {
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, ['NODE_AC015_MISSING']),
        'INVALID_ID'
      );
    });

    test('rejects mixed-language nodes in Interleaving', async () => {
      await rejectsWithCode(
        () => interleavingEngine.sequenceNodes(pool, ['NODE_AC015_A', 'NODE_AC015_EN']),
        'CONTRACT_VIOLATION'
      );
    });

    test('accepts six occurrences and preserves length and multiplicity', async () => {
      const input = [
        'NODE_AC015_A',
        'NODE_AC015_A',
        'NODE_AC015_B',
        'NODE_AC015_B',
        'NODE_AC015_C',
        'NODE_AC015_C',
      ];
      const output = await interleavingEngine.sequenceNodes(pool, input);
      assert.equal(output.length, input.length);
      assert.deepEqual(counts(output), counts(input));
    });
  });

  describe('canonical ordering tuple', () => {
    test('minimizes same-node adjacency before later tuple terms', async () => {
      assert.deepEqual(
        await interleavingEngine.sequenceNodes(pool, [
          'NODE_AC015_A',
          'NODE_AC015_A',
          'NODE_AC015_C',
          'NODE_AC015_C',
        ]),
        ['NODE_AC015_A', 'NODE_AC015_C', 'NODE_AC015_A', 'NODE_AC015_C']
      );
    });

    test('penalizes adjacent different nodes that share a category', async () => {
      assert.deepEqual(
        await interleavingEngine.sequenceNodes(pool, [
          'NODE_AC015_A',
          'NODE_AC015_B',
          'NODE_AC015_C',
        ]),
        ['NODE_AC015_A', 'NODE_AC015_C', 'NODE_AC015_B']
      );
    });

    test('does not apply the category branch to identical adjacent nodes', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/interleavingEngine.js'),
        'utf8'
      );
      assert.match(source, /if \(left === right\)[\s\S]*else if \(hasSharedCategory/);
    });

    test('handles category-less nodes and uses array lexicographic tie-break', async () => {
      assert.deepEqual(
        await interleavingEngine.sequenceNodes(pool, ['NODE_AC015_D', 'NODE_AC015_A']),
        ['NODE_AC015_A', 'NODE_AC015_D']
      );
    });

    test('uses every category of a multi-category node', async () => {
      assert.deepEqual(
        await interleavingEngine.sequenceNodes(pool, [
          'NODE_AC015_E',
          'NODE_AC015_F',
          'NODE_AC015_D',
        ]),
        ['NODE_AC015_E', 'NODE_AC015_D', 'NODE_AC015_F']
      );
    });

    test('normalizes undirected duplicate CONTRAST rows and ignores weight', async () => {
      assert.deepEqual(
        await interleavingEngine.sequenceNodes(pool, [
          'NODE_AC015_C',
          'NODE_AC015_D',
          'NODE_AC015_E',
        ]),
        ['NODE_AC015_C', 'NODE_AC015_E', 'NODE_AC015_D']
      );
    });

    test('returns the same deterministic result for repeated calls', async () => {
      const input = ['NODE_AC015_C', 'NODE_AC015_D', 'NODE_AC015_E'];
      const first = await interleavingEngine.sequenceNodes(pool, input);
      const second = await interleavingEngine.sequenceNodes(pool, input);
      assert.deepEqual(second, first);
    });
  });

  describe('dependency boundary', () => {
    test('imports only Graph Engine and config and performs no direct DB query', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../src/engines/interleavingEngine.js'),
        'utf8'
      );
      const engineImports = [...source.matchAll(/require\(['"]\.\/([^'"]+Engine)['"]\)/g)].map(
        (match) => match[1]
      );
      assert.deepEqual(engineImports, ['graphEngine']);
      assert.doesNotMatch(source, /\bpool\.query\b|\bclient\.query\b/);
    });
  });
});
