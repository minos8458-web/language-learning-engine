// tests/migrations.test.js
//
// Phase 1-A 검증 — DB_MIGRATION_DESIGN.md §7(Phase 1 테스트 계획)의 마이그레이션
// 관련 항목을 그대로 구현한다. Graph/Progress Engine 테스트는 Phase 1-B 범위라서
// 여기 포함하지 않는다.
//
// 매 실행마다 public 스키마를 초기화한 뒤 마이그레이션을 새로 적용한다 — 로컬 상태에
// 의존하지 않고 항상 같은 결과를 재현하기 위함(테스트 자체의 멱등성).

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations, listMigrationFiles } = require('../db/migrate');

describe('DB migrations (Phase 1-A)', () => {
  before(async () => {
    // 완전히 빈 상태에서 시작 — 이전 실행의 잔여물이 결과에 영향을 주지 않도록 한다.
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
  });

  after(async () => {
    await pool.end();
  });

  test('마이그레이션 파일이 001~011 순서로 11개 존재한다', () => {
    const files = listMigrationFiles();
    assert.equal(files.length, 11);
    assert.deepEqual(
      files,
      [
        '001_create_users.sql',
        '002_create_concepts.sql',
        '003_create_grammar_nodes.sql',
        '004_create_grammar_relations.sql',
        '005_create_content.sql',
        '006_create_progress.sql',
        '007_create_attempt_records.sql',
        '008_create_vocabulary.sql',
        '009_create_cascade_jobs.sql',
        '010_create_indexes.sql',
        '011_add_aud002_spaced_review.sql',
      ]
    );
  });

  test('전체 마이그레이션 적용 성공 (최초 실행)', async () => {
    const { applied, skipped } = await runMigrations();
    assert.equal(applied.length, 11);
    assert.equal(skipped.length, 0);
  });

  test('재실행 시 전부 SKIP되어 안전하게 통과한다', async () => {
    const { applied, skipped } = await runMigrations();
    assert.equal(applied.length, 0);
    assert.equal(skipped.length, 11);
  });

  test('schema_migrations 테이블이 러너에 의해 자동 생성되어 있다', async () => {
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'schema_migrations'`
    );
    assert.equal(rows.length, 1);

    const { rows: countRows } = await pool.query('SELECT count(*) AS n FROM schema_migrations');
    assert.equal(Number(countRows[0].n), 11);
  });

  test('9개 LLE 도메인 테이블이 전부 존재한다', async () => {
    const expected = [
      'users', 'concepts', 'grammar_nodes', 'grammar_relations', 'content',
      'progress', 'attempt_records', 'vocabulary', 'cascade_jobs',
    ];
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const actual = rows.map((r) => r.table_name);
    for (const t of expected) {
      assert.ok(actual.includes(t), `테이블 누락: ${t}`);
    }
  });

  test('pos_enum에 PARTICLE이 포함된 12개 값이 있다', async () => {
    // enum_range(NULL::pos_enum)는 pg 배열을 반환하는데 node-postgres가 커스텀 ENUM
    // 배열 타입에 대한 파서를 기본으로 갖고 있지 않아 문자열로 반환될 수 있다 —
    // unnest로 행 단위 결과를 받아 이 문제를 피한다.
    const { rows } = await pool.query('SELECT unnest(enum_range(NULL::pos_enum))::text AS value');
    const values = rows.map((r) => r.value);
    assert.equal(values.length, 12);
    assert.ok(values.includes('PARTICLE'));
  });

  test('content.explanation_level 컬럼이 존재한다 (AC-004)', async () => {
    const { rows } = await pool.query(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_name = 'content' AND column_name = 'explanation_level'`
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].is_nullable, 'YES');
  });

  test('attempt_records.content_id 컬럼이 존재한다 (AC-008)', async () => {
    const { rows } = await pool.query(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_name = 'attempt_records' AND column_name = 'content_id'`
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].is_nullable, 'YES');
  });

  test('cascade_jobs 테이블에 status/target_node_id 컬럼이 존재한다 (AC-002)', async () => {
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'cascade_jobs'`
    );
    const cols = rows.map((r) => r.column_name);
    assert.ok(cols.includes('status'));
    assert.ok(cols.includes('target_node_id'));
    assert.ok(cols.includes('retry_count'));
  });

  test('DATA_PERSISTENCE_BRIEF.md §5의 인덱스 5개가 전부 존재한다', async () => {
    const { rows } = await pool.query(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
    );
    const idx = rows.map((r) => r.indexname);
    assert.ok(idx.includes('idx_progress_user_next_review'));
    assert.ok(idx.includes('idx_grammar_nodes_language'));
    assert.ok(idx.includes('idx_grammar_nodes_concept_ids_gin'));
    assert.ok(idx.includes('idx_attempt_records_user_node_attempted'));
    assert.ok(idx.includes('idx_cascade_jobs_status_created'));
  });

  describe('FK 제약 실패 케이스', () => {
    test('존재하지 않는 grammar_nodes를 참조하는 grammar_relations 삽입은 실패한다', async () => {
      await assert.rejects(
        () =>
          pool.query(
            `INSERT INTO grammar_relations
               (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description)
             VALUES ('REL_TEST_FK', 'NODE_DOES_NOT_EXIST', 'NODE_ALSO_MISSING', 'RELATED', 'BIDIRECTIONAL', 1.0, 'fk 실패 테스트')`
          ),
        /foreign key/i
      );
    });

    test('존재하지 않는 users를 참조하는 cascade_jobs 삽입은 실패한다', async () => {
      await assert.rejects(
        () =>
          pool.query(
            `INSERT INTO cascade_jobs (user_id, target_node_id)
             VALUES ('00000000-0000-0000-0000-000000000000', 'NODE_DOES_NOT_EXIST')`
          ),
        /foreign key/i
      );
    });

    test('PREREQUISITE인데 BIDIRECTIONAL이면 CHECK 제약 위반으로 실패한다 (문서화된 불변식)', async () => {
      await pool.query(
        `INSERT INTO grammar_nodes (node_id, language, label, difficulty)
         VALUES ('NODE_CHECK_TEST_A', 'VI', 'test A', 1),
                ('NODE_CHECK_TEST_B', 'VI', 'test B', 1)`
      );
      await assert.rejects(
        () =>
          pool.query(
            `INSERT INTO grammar_relations
               (relation_id, from_node_id, to_node_id, relation_type, direction, weight, description)
             VALUES ('REL_CHECK_TEST', 'NODE_CHECK_TEST_A', 'NODE_CHECK_TEST_B', 'PREREQUISITE', 'BIDIRECTIONAL', 1.0, 'check 실패 테스트')`
          ),
        /grammar_relations_prereq_unidirectional/
      );
    });

    test('is_correct=true인데 error_category가 있으면 CHECK 제약 위반으로 실패한다', async () => {
      await pool.query(
        `INSERT INTO users (auth_provider, auth_identifier, timezone)
         VALUES ('GUEST', 'device-check-test', 'UTC')
         RETURNING user_id`
      );
      const { rows } = await pool.query(
        `SELECT user_id FROM users WHERE auth_identifier = 'device-check-test'`
      );
      const userId = rows[0].user_id;
      await pool.query(
        `INSERT INTO progress (user_id, node_id) VALUES ($1, 'NODE_CHECK_TEST_A')`,
        [userId]
      );
      await assert.rejects(
        () =>
          pool.query(
            `INSERT INTO attempt_records (user_id, node_id, is_correct, error_category)
             VALUES ($1, 'NODE_CHECK_TEST_A', true, 'SELF')`,
            [userId]
          ),
        /attempt_records_correct_implies_no_error/
      );
    });
  });
});
