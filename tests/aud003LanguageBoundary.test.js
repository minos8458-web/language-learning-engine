// tests/aud003LanguageBoundary.test.js
//
// AUD-003(Frozen Core Standard Amendment) 검증 — VALIDATION_LEVEL3.md §7.1 기준.
// GRAMMAR_SCHEMA.md §6 same-language invariant(PREREQUISITE/RELATED/CONTRAST/
// ALTERNATIVE 4종 전부)를 validate_language_pack의 language_boundary_violations[]와
// runtime traversal defense-in-depth(find_prerequisites/dependentSearch/
// find_related_nodes) 양쪽에서 검증한다.
//
// 픽스처는 물리적으로 cross-language grammar_relations 행을 직접 삽입해 구성한다
// (실제로는 §6 invariant 위반이라 저작 규칙상 만들어지면 안 되는 데이터이지만,
// "우회나 수동 입력 오류로 유입될 가능성"에 대비한 defense-in-depth를 검증하려면
// 바로 이런 invalid row가 필요하다 — GRAMMAR_GRAPH.md §3).

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const graphEngine = require('../src/engines/graphEngine');

describe('AUD-003 Language Boundary (VALIDATION_LEVEL3.md §7.1)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();

    // --- 정상(same-language) 픽스처: VI 언어 내부 체인 VI_C -> VI_B -> VI_A ---
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('VI_A', 'VI', '[]'::jsonb, 'vi-a', 1),
        ('VI_B', 'VI', '[]'::jsonb, 'vi-b', 1),
        ('VI_C', 'VI', '[]'::jsonb, 'vi-c', 1),
        ('VI_RELATED', 'VI', '[]'::jsonb, 'vi-related', 1)
    `);
    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_VI_B_A', 'VI_B', 'VI_A', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'b requires a'),
        ('REL_VI_C_B', 'VI_C', 'VI_B', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'c requires b'),
        ('REL_VI_RELATED', 'VI_A', 'VI_RELATED', 'RELATED', 'BIDIRECTIONAL', 1.0, 'same-language related')
    `);

    // --- cross-language 픽스처: 4개 relation type 전부, EN 노드 포함 ---
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('EN_X', 'EN', '[]'::jsonb, 'en-x', 1),
        ('EN_Y', 'EN', '[]'::jsonb, 'en-y', 1),
        ('EN_Z', 'EN', '[]'::jsonb, 'en-z', 1),
        ('EN_W', 'EN', '[]'::jsonb, 'en-w', 1),
        ('VI_PREREQ_SRC', 'VI', '[]'::jsonb, 'vi-prereq-src', 1),
        ('VI_RELATED_SRC', 'VI', '[]'::jsonb, 'vi-related-src', 1),
        ('VI_CONTRAST_SRC', 'VI', '[]'::jsonb, 'vi-contrast-src', 1),
        ('VI_ALT_SRC', 'VI', '[]'::jsonb, 'vi-alt-src', 1)
    `);
    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_XLANG_PREREQ', 'VI_PREREQ_SRC', 'EN_X', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'cross-lang prereq'),
        ('REL_XLANG_RELATED', 'VI_RELATED_SRC', 'EN_Y', 'RELATED', 'BIDIRECTIONAL', 1.0, 'cross-lang related'),
        ('REL_XLANG_CONTRAST', 'VI_CONTRAST_SRC', 'EN_Z', 'CONTRAST', 'BIDIRECTIONAL', 1.0, 'cross-lang contrast'),
        ('REL_XLANG_ALT', 'VI_ALT_SRC', 'EN_W', 'ALTERNATIVE', 'UNIDIRECTIONAL', 1.0, 'cross-lang alternative')
    `);

    // --- transitive boundary 픽스처: VI_TRANS_A -> EN_TRANS_B -> VI_TRANS_C ---
    // (VI_TRANS_A에서 선행 탐색 시 EN_TRANS_B에서 경계가 끊겨야 하고, 그 뒤의
    // VI_TRANS_C까지 이어서 탐색되면 안 된다 — "최종 반환값 필터링"이 아니라
    // "순회 자체가 경계에서 중단"되는지를 검증하는 핵심 픽스처)
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('VI_TRANS_A', 'VI', '[]'::jsonb, 'vi-trans-a', 1),
        ('EN_TRANS_B', 'EN', '[]'::jsonb, 'en-trans-b', 1),
        ('VI_TRANS_C', 'VI', '[]'::jsonb, 'vi-trans-c', 1)
    `);
    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_TRANS_A_B', 'VI_TRANS_A', 'EN_TRANS_B', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'a requires b(cross-lang)'),
        ('REL_TRANS_B_C', 'EN_TRANS_B', 'VI_TRANS_C', 'PREREQUISITE', 'UNIDIRECTIONAL', 1.0, 'b requires c(back to vi)')
    `);
  });

  after(async () => {
    await pool.end();
  });

  test('1. VI → EN cross-language PREREQUISITE가 validate_language_pack(VI)에서 탐지된다', async () => {
    const result = await graphEngine.validateLanguagePack(pool, 'VI');
    const found = result.language_boundary_violations.find((v) => v.relation_id === 'REL_XLANG_PREREQ');
    assert.ok(found, 'REL_XLANG_PREREQ가 language_boundary_violations에 없음');
    assert.equal(found.from_node_id, 'VI_PREREQ_SRC');
    assert.equal(found.to_node_id, 'EN_X');
    assert.equal(found.relation_type, 'PREREQUISITE');
    assert.equal(result.is_valid, false);
  });

  test('2. cross-language RELATED가 탐지된다', async () => {
    const result = await graphEngine.validateLanguagePack(pool, 'VI');
    const found = result.language_boundary_violations.find((v) => v.relation_id === 'REL_XLANG_RELATED');
    assert.ok(found);
    assert.equal(found.relation_type, 'RELATED');
  });

  test('3. cross-language CONTRAST가 탐지된다', async () => {
    const result = await graphEngine.validateLanguagePack(pool, 'VI');
    const found = result.language_boundary_violations.find((v) => v.relation_id === 'REL_XLANG_CONTRAST');
    assert.ok(found);
    assert.equal(found.relation_type, 'CONTRAST');
  });

  test('4. cross-language ALTERNATIVE가 탐지된다', async () => {
    const result = await graphEngine.validateLanguagePack(pool, 'VI');
    const found = result.language_boundary_violations.find((v) => v.relation_id === 'REL_XLANG_ALT');
    assert.ok(found);
    assert.equal(found.relation_type, 'ALTERNATIVE');
  });

  test('5. find_prerequisites는 foreign-language 노드를 반환하지 않는다', async () => {
    const result = await graphEngine.findPrerequisites(pool, 'VI_PREREQ_SRC', 5);
    assert.ok(!result.includes('EN_X'), 'EN_X(foreign-language)가 반환됨');
  });

  test('6. prerequisite transitive boundary — VI_A -> EN_B -> VI_C에서 traversal 자체가 EN_B 이전에 멈춘다', async () => {
    const result = await graphEngine.findPrerequisites(pool, 'VI_TRANS_A', 5);
    assert.ok(!result.includes('EN_TRANS_B'), 'EN_TRANS_B(경계 바로 너머)가 반환됨');
    assert.ok(
      !result.includes('VI_TRANS_C'),
      'VI_TRANS_C(EN_TRANS_B를 거쳐야만 도달 가능)까지 반환됨 — traversal이 경계에서 멈추지 않고 통과함'
    );
    assert.deepEqual(result, [], '경계 직후 선행 관계가 전혀 없으므로 빈 목록이어야 함');
  });

  test('7. dependentSearch는 foreign-language 노드를 반환하지 않는다', async () => {
    // EN_TRANS_B를 시작점으로 후행 탐색하면(누가 EN_TRANS_B에 의존하는가) VI_TRANS_A가
    // 나와야 할 것 같지만, VI_TRANS_A는 EN(시작 노드 EN_TRANS_B) 기준 foreign-language라
    // 반환되면 안 된다.
    const result = await graphEngine.dependentSearch(pool, 'EN_TRANS_B', 5);
    assert.ok(!result.includes('VI_TRANS_A'), 'VI_TRANS_A(foreign-language)가 반환됨');
    assert.deepEqual(result, []);
  });

  test('8. find_related_nodes는 foreign-language 관련 노드를 반환하지 않는다', async () => {
    const result = await graphEngine.findRelatedNodes(pool, 'VI_RELATED_SRC', 'RELATED');
    assert.ok(
      !result.some((r) => r.related_node_id === 'EN_Y'),
      'EN_Y(foreign-language)가 반환됨'
    );
    assert.deepEqual(result, []);
  });

  test('9. 정상 same-language relation은 기존 동작 그대로 반환된다(회귀 없음)', async () => {
    const prereq = await graphEngine.findPrerequisites(pool, 'VI_C', 5);
    assert.deepEqual(prereq, ['VI_B', 'VI_A']); // 가까운 순서(depth 오름차순)

    const related = await graphEngine.findRelatedNodes(pool, 'VI_A', 'RELATED');
    assert.deepEqual(
      related.map((r) => r.related_node_id),
      ['VI_RELATED']
    );
  });

  test('10. boundary violation이 없으면 language_boundary_violations=[]이고 is_valid는 다른 위반 여부로만 결정된다', async () => {
    // EN 언어팩 자체에는(위 cross-language 픽스처의 "출발점"이 전부 VI쪽이므로)
    // EN 노드들끼리의 관계가 전혀 없다 — EN을 validate하면 boundary violation은
    // cross-language 관계들이 EN 쪽에서도 걸리므로(from/to 어느 한쪽이라도 EN이면
    // 대상) 발생한다. 따라서 "위반이 아예 없는" 케이스는 별도의 완전히 격리된
        // 언어(JA)로 검증한다.
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES
        ('JA_ONLY_A', 'JA', '[]'::jsonb, 'ja-a', 1),
        ('JA_ONLY_B', 'JA', '[]'::jsonb, 'ja-b', 1)
    `);
    await pool.query(`
      INSERT INTO grammar_relations
        (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description) VALUES
        ('REL_JA_ONLY', 'JA_ONLY_A', 'JA_ONLY_B', 'RELATED', 'BIDIRECTIONAL', 1.0, 'same-language only')
    `);

    const result = await graphEngine.validateLanguagePack(pool, 'JA');
    assert.deepEqual(result.language_boundary_violations, []);
    assert.deepEqual(result.cycle_violations, []);
    assert.deepEqual(result.concept_consistency_violations, []);
    assert.equal(result.is_valid, true);
  });
});
