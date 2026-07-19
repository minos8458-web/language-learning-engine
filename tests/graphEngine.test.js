// tests/graphEngine.test.js
//
// Phase 1-B 검증 — DB_MIGRATION_DESIGN.md §7의 Graph Engine 관련 항목:
// 순환 검증, 선행/후행 탐색, Concept-Node 정합성 검증(AC-003 복구 메모).
//
// fixtures를 이 파일 안에서 직접 구성한다(ENGINE_INTERFACE.md가 말하는
// "fixtures 기준" 테스트 — Tier D 실 데이터 적재는 Phase 6 범위).

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const graphEngine = require('../src/engines/graphEngine');

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

describe('Graph Engine (Phase 1-B)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();

    // --- fixtures ---
    // Concept: CONCEPT_TENSE(선행: CONCEPT_VERB), CONCEPT_VERB, CONCEPT_ORPHAN(대응 노드 없음)
    await pool.query(`
      INSERT INTO concepts (concept_id, category, function, difficulty, prerequisite_concept_ids) VALUES
        ('CONCEPT_TENSE', 'CAT', 'FUNC', 2, '["CONCEPT_VERB"]'::jsonb),
        ('CONCEPT_VERB', 'CAT', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_UNLINKED', 'CAT', 'FUNC', 1, '["CONCEPT_VERB"]'::jsonb),
        ('CONCEPT_AC014_A', 'AC014_A', 'FUNC', 1, '[]'::jsonb),
        ('CONCEPT_AC014_B', 'AC014_B', 'FUNC', 1, '[]'::jsonb)
    `);

    // Nodes — 일관된 선행 체인 구성: PAST -> PRESENT -> VERB_BASE
    // CONCEPT_TENSE는 NODE_PAST/NODE_PRESENT가 구현, CONCEPT_VERB는 NODE_VERB_BASE가 구현.
    // NODE_PAST -> NODE_VERB_BASE PREREQUISITE 관계가 있어 AC-003 정합성을 만족시킨다.
    // CONCEPT_UNLINKED는 대응 노드가 없어(nodesByConcept에 없음) 검사 대상에서 제외되어야 한다.
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('NODE_PAST', 'VI', '["CONCEPT_TENSE"]'::jsonb, 'past', 2),
        ('NODE_PRESENT', 'VI', '["CONCEPT_TENSE"]'::jsonb, 'present', 2),
        ('NODE_VERB_BASE', 'VI', '["CONCEPT_VERB"]'::jsonb, 'verb base', 1),
        ('NODE_ISOLATED', 'VI', '[]'::jsonb, 'isolated', 1),
        ('NODE_AC014_LIST_VI_A', 'VI', '["CONCEPT_AC014_A"]'::jsonb, 'AC014 VI A', 2),
        ('NODE_AC014_LIST_VI_B', 'VI', '["CONCEPT_AC014_A", "CONCEPT_AC014_B"]'::jsonb, 'AC014 VI B', 1),
        ('NODE_AC014_LIST_EN_A', 'EN', '["CONCEPT_AC014_B"]'::jsonb, 'AC014 EN A', 3)
    `);

    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_PAST_VERB', 'NODE_PAST', 'NODE_VERB_BASE', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'past requires verb base'),
        ('REL_PRESENT_VERB', 'NODE_PRESENT', 'NODE_VERB_BASE', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'present requires verb base'),
        ('REL_PAST_PRESENT_CONTRAST', 'NODE_PAST', 'NODE_PRESENT', 'CONTRAST', 'BIDIRECTIONAL', 1.0, 'tense contrast')
    `);
  });

  after(async () => {
    await pool.end();
  });

  describe('find_prerequisites (3.1)', () => {
    test('직접 선행 노드를 찾는다', async () => {
      const result = await graphEngine.findPrerequisites(pool, 'NODE_PAST', 2);
      assert.deepEqual(result, ['NODE_VERB_BASE']);
    });

    test('선행 관계가 없는 노드는 빈 목록을 반환한다(정상)', async () => {
      const result = await graphEngine.findPrerequisites(pool, 'NODE_VERB_BASE', 2);
      assert.deepEqual(result, []);
    });

    test('존재하지 않는 node_id는 에러', async () => {
      await assert.rejects(
        () => graphEngine.findPrerequisites(pool, 'NODE_DOES_NOT_EXIST', 2),
        graphEngine.NotFoundError
      );
    });

    test('max_depth < 1은 에러', async () => {
      await assert.rejects(
        () => graphEngine.findPrerequisites(pool, 'NODE_PAST', 0),
        graphEngine.ContractViolationError
      );
    });
  });

  describe('find_related_nodes (3.2)', () => {
    test('CONTRAST 관계를 양방향으로 찾는다(BIDIRECTIONAL)', async () => {
      const fromPast = await graphEngine.findRelatedNodes(pool, 'NODE_PAST', 'CONTRAST');
      const fromPresent = await graphEngine.findRelatedNodes(pool, 'NODE_PRESENT', 'CONTRAST');
      assert.deepEqual(
        fromPast.map((r) => r.related_node_id),
        ['NODE_PRESENT']
      );
      assert.deepEqual(
        fromPresent.map((r) => r.related_node_id),
        ['NODE_PAST']
      );
    });

    test('관계가 없으면 빈 목록(정상)', async () => {
      const result = await graphEngine.findRelatedNodes(pool, 'NODE_ISOLATED');
      assert.deepEqual(result, []);
    });

    test('정의되지 않은 relation_type은 에러(PREREQUISITE 포함)', async () => {
      await assert.rejects(
        () => graphEngine.findRelatedNodes(pool, 'NODE_PAST', 'PREREQUISITE'),
        graphEngine.ContractViolationError
      );
      await assert.rejects(
        () => graphEngine.findRelatedNodes(pool, 'NODE_PAST', 'INVALID_TYPE'),
        graphEngine.ContractViolationError
      );
    });
  });

  describe('list_nodes_by_language (3.4)', () => {
    test('rejects omitted and explicit undefined language', async () => {
      await rejectsWithCode(() => graphEngine.listNodesByLanguage(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => graphEngine.listNodesByLanguage(pool, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null and scalar wrong types', async () => {
      await rejectsWithCode(() => graphEngine.listNodesByLanguage(pool, null), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => graphEngine.listNodesByLanguage(pool, 42), 'CONTRACT_VIOLATION');
    });

    test('rejects invalid language formats', async () => {
      for (const language of ['', '  ', 'vi', 'VIE']) {
        await rejectsWithCode(
          () => graphEngine.listNodesByLanguage(pool, language),
          'OUT_OF_RANGE_VALUE'
        );
      }
    });

    test('returns language-isolated node metadata', async () => {
      const viRows = (await graphEngine.listNodesByLanguage(pool, 'VI')).filter((row) =>
        row.node_id.startsWith('NODE_AC014_LIST_')
      );
      assert.deepEqual(viRows, [
        { node_id: 'NODE_AC014_LIST_VI_A', difficulty: 2, concept_ids: ['CONCEPT_AC014_A'] },
        {
          node_id: 'NODE_AC014_LIST_VI_B',
          difficulty: 1,
          concept_ids: ['CONCEPT_AC014_A', 'CONCEPT_AC014_B'],
        },
      ]);
      const enIds = (await graphEngine.listNodesByLanguage(pool, 'EN'))
        .map((row) => row.node_id)
        .filter((nodeId) => nodeId.startsWith('NODE_AC014_LIST_'));
      assert.deepEqual(enIds, ['NODE_AC014_LIST_EN_A']);
    });

    test('returns an empty array for a language without nodes', async () => {
      assert.deepEqual(await graphEngine.listNodesByLanguage(pool, 'JA'), []);
    });
  });

  describe('get_concept_categories (3.5)', () => {
    test('rejects omitted and explicit undefined concept_ids', async () => {
      await rejectsWithCode(() => graphEngine.getConceptCategories(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => graphEngine.getConceptCategories(pool, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null and non-array input', async () => {
      await rejectsWithCode(() => graphEngine.getConceptCategories(pool, null), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => graphEngine.getConceptCategories(pool, 'CONCEPT_AC014_A'), 'CONTRACT_VIOLATION');
    });

    test('rejects invalid array elements', async () => {
      for (const conceptIds of [[42], [''], ['   ']]) {
        await rejectsWithCode(
          () => graphEngine.getConceptCategories(pool, conceptIds),
          'CONTRACT_VIOLATION'
        );
      }
    });

    test('returns an empty map for an empty array', async () => {
      assert.deepEqual(await graphEngine.getConceptCategories(pool, []), {});
    });

    test('returns categories and normalizes duplicate IDs', async () => {
      assert.deepEqual(
        await graphEngine.getConceptCategories(pool, [
          'CONCEPT_AC014_A',
          'CONCEPT_AC014_A',
          'CONCEPT_AC014_B',
        ]),
        { CONCEPT_AC014_A: 'AC014_A', CONCEPT_AC014_B: 'AC014_B' }
      );
    });

    test('rejects valid and missing IDs without a partial result', async () => {
      await rejectsWithCode(
        () => graphEngine.getConceptCategories(pool, ['CONCEPT_AC014_A', 'CONCEPT_AC014_MISSING']),
        'INVALID_ID'
      );
    });
  });

  describe('get_node_language_and_concepts (3.6)', () => {
    test('rejects omitted and explicit undefined node_ids', async () => {
      await rejectsWithCode(
        () => graphEngine.getNodeLanguageAndConcepts(pool),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => graphEngine.getNodeLanguageAndConcepts(pool, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null and non-array input', async () => {
      await rejectsWithCode(
        () => graphEngine.getNodeLanguageAndConcepts(pool, null),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => graphEngine.getNodeLanguageAndConcepts(pool, 'NODE_PAST'),
        'CONTRACT_VIOLATION'
      );
    });

    test('rejects invalid array elements', async () => {
      for (const nodeIds of [[42], [''], ['   ']]) {
        await rejectsWithCode(
          () => graphEngine.getNodeLanguageAndConcepts(pool, nodeIds),
          'CONTRACT_VIOLATION'
        );
      }
    });

    test('returns an empty map for an empty array', async () => {
      assert.deepEqual(await graphEngine.getNodeLanguageAndConcepts(pool, []), {});
    });

    test('returns exactly language and concept_ids for a single node', async () => {
      assert.deepEqual(await graphEngine.getNodeLanguageAndConcepts(pool, ['NODE_PAST']), {
        NODE_PAST: { language: 'VI', concept_ids: ['CONCEPT_TENSE'] },
      });
    });

    test('returns mixed-language facts without rejecting them', async () => {
      assert.deepEqual(
        await graphEngine.getNodeLanguageAndConcepts(pool, [
          'NODE_AC014_LIST_VI_A',
          'NODE_AC014_LIST_EN_A',
        ]),
        {
          NODE_AC014_LIST_VI_A: { language: 'VI', concept_ids: ['CONCEPT_AC014_A'] },
          NODE_AC014_LIST_EN_A: { language: 'EN', concept_ids: ['CONCEPT_AC014_B'] },
        }
      );
    });

    test('normalizes duplicate node IDs to one dynamic key', async () => {
      const result = await graphEngine.getNodeLanguageAndConcepts(pool, [
        'NODE_PRESENT',
        'NODE_PRESENT',
      ]);
      assert.deepEqual(Object.keys(result), ['NODE_PRESENT']);
      assert.deepEqual(result.NODE_PRESENT, {
        language: 'VI',
        concept_ids: ['CONCEPT_TENSE'],
      });
    });

    test('rejects valid and missing IDs without a partial result', async () => {
      await rejectsWithCode(
        () => graphEngine.getNodeLanguageAndConcepts(pool, ['NODE_PAST', 'NODE_AC015_MISSING']),
        'INVALID_ID'
      );
    });
  });

  describe('AC-014 Graph leaf boundary', () => {
    test('does not import another Engine', () => {
      const source = fs.readFileSync(path.join(__dirname, '../src/engines/graphEngine.js'), 'utf8');
      assert.doesNotMatch(source, /require\([^)]*Engine[^)]*\)/);
    });
  });

  describe('validate_language_pack (3.3)', () => {
    test('정상 상태의 언어팩은 is_valid=true, 위반 없음', async () => {
      const result = await graphEngine.validateLanguagePack(pool, 'VI');
      assert.equal(result.is_valid, true);
      assert.deepEqual(result.cycle_violations, []);
      assert.deepEqual(result.concept_consistency_violations, []);
    });

    test('데이터가 없는 언어는 에러', async () => {
      await assert.rejects(
        () => graphEngine.validateLanguagePack(pool, 'ZZ'),
        graphEngine.NotFoundError
      );
    });

    test('PREREQUISITE 순환이 있으면 cycle_violations에 기록된다', async () => {
      // 별도 언어(EN)에 순환 그래프를 만들어 VI 픽스처를 건드리지 않는다.
      await pool.query(`
        INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
          ('NODE_CYCLE_A', 'EN', '[]'::jsonb, 'a', 1),
          ('NODE_CYCLE_B', 'EN', '[]'::jsonb, 'b', 1)
      `);
      await pool.query(`
        INSERT INTO grammar_relations
          (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
          ('REL_CYCLE_1', 'NODE_CYCLE_A', 'NODE_CYCLE_B', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'a needs b'),
          ('REL_CYCLE_2', 'NODE_CYCLE_B', 'NODE_CYCLE_A', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'b needs a (cycle!)')
      `);

      const result = await graphEngine.validateLanguagePack(pool, 'EN');
      assert.equal(result.is_valid, false);
      assert.ok(result.cycle_violations.length >= 1);
    });

    test('Concept-Node 정합성 위반이 감지된다 (AC-003)', async () => {
      // ZH: CONCEPT_TENSE_ZH가 CONCEPT_VERB_ZH를 선행으로 요구하지만
      // 두 Concept에 대응하는 노드 사이에 PREREQUISITE 관계를 만들지 않는다 — 위반.
      await pool.query(`
        INSERT INTO concepts (concept_id, category, function, difficulty, prerequisite_concept_ids) VALUES
          ('CONCEPT_TENSE_ZH', 'CAT', 'FUNC', 2, '["CONCEPT_VERB_ZH"]'::jsonb),
          ('CONCEPT_VERB_ZH', 'CAT', 'FUNC', 1, '[]'::jsonb)
      `);
      await pool.query(`
        INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
          ('NODE_ZH_TENSE', 'ZH', '["CONCEPT_TENSE_ZH"]'::jsonb, 'tense', 2),
          ('NODE_ZH_VERB', 'ZH', '["CONCEPT_VERB_ZH"]'::jsonb, 'verb', 1)
      `);
      // 의도적으로 PREREQUISITE 관계를 만들지 않음

      const result = await graphEngine.validateLanguagePack(pool, 'ZH');
      assert.equal(result.is_valid, false);
      assert.equal(result.concept_consistency_violations.length, 1);
      assert.equal(result.concept_consistency_violations[0].concept_id, 'CONCEPT_TENSE_ZH');
      assert.equal(
        result.concept_consistency_violations[0].prerequisite_concept_id,
        'CONCEPT_VERB_ZH'
      );
    });

    test('대응 노드가 없는 Concept(CONCEPT_UNLINKED)은 검사 대상에서 제외된다', async () => {
      // VI 언어팩 검증 결과에 CONCEPT_UNLINKED 관련 위반이 없어야 한다(노드 자체가 없으므로).
      const result = await graphEngine.validateLanguagePack(pool, 'VI');
      const hasUnlinkedViolation = result.concept_consistency_violations.some(
        (v) => v.concept_id === 'CONCEPT_UNLINKED'
      );
      assert.equal(hasUnlinkedViolation, false);
    });
  });
});
