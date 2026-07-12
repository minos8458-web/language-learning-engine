// tests/progressEngine.test.js
//
// Phase 1-B 검증 — State 전이 게이팅(승격/퇴행), Confidence EMA, Review 스케줄링,
// Coverage/Depth, get_due_reviews 우선순위. DOMAIN_LOGIC_BRIEF.md §3/§4/§6/§7 기준.

const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const progressEngine = require('../src/engines/progressEngine');

async function createUser(deviceId) {
  const { rows } = await pool.query(
    `INSERT INTO users (auth_provider, auth_identifier, timezone)
     VALUES ('GUEST', $1, 'UTC') RETURNING user_id`,
    [deviceId]
  );
  return rows[0].user_id;
}

async function createNode(nodeId, language, difficulty, conceptIds = []) {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES ($1, $2, $3::jsonb, $1, $4)`,
    [nodeId, language, JSON.stringify(conceptIds), difficulty]
  );
}

describe('Progress Engine (Phase 1-B)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
  });

  after(async () => {
    await pool.end();
  });

  describe('get_progress (4.1)', () => {
    test('레코드가 없으면 NOT_INTRODUCED 기본값(빈 결과 아님)', async () => {
      const userId = await createUser('u-4.1-a');
      await createNode('NODE_4_1_A', 'VI', 1);
      const result = await progressEngine.getProgress(pool, userId, 'NODE_4_1_A');
      assert.equal(result.state, 'NOT_INTRODUCED');
      assert.equal(result.accuracy, null);
    });
  });

  describe('record_explicit_study (4.3)', () => {
    test('NOT_INTRODUCED -> INTRODUCED', async () => {
      const userId = await createUser('u-4.3-a');
      await createNode('NODE_4_3_A', 'VI', 1);
      const result = await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_3_A', new Date().toISOString());
      assert.equal(result.state, 'INTRODUCED');
    });

    test('재요청은 에러가 아니라 현재 상태를 멱등하게 반환한다', async () => {
      const userId = await createUser('u-4.3-b');
      await createNode('NODE_4_3_B', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_3_B', new Date().toISOString());
      const second = await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_3_B', new Date().toISOString());
      assert.equal(second.state, 'INTRODUCED');
    });

    test('존재하지 않는 node_id는 에러', async () => {
      const userId = await createUser('u-4.3-c');
      await assert.rejects(
        () => progressEngine.recordExplicitStudy(pool, userId, 'NODE_DOES_NOT_EXIST', new Date().toISOString()),
        progressEngine.NotFoundError
      );
    });
  });

  describe('record_attempt (4.4) — 에러 케이스', () => {
    test('is_correct=true인데 error_category가 있으면 에러', async () => {
      const userId = await createUser('u-4.4-err-a');
      await createNode('NODE_4_4_ERR_A', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_4_ERR_A', new Date().toISOString());
      await assert.rejects(
        () =>
          progressEngine.recordAttempt(pool, userId, 'NODE_4_4_ERR_A', {
            isCorrect: true,
            errorCategory: 'SELF',
          }),
        progressEngine.ContractViolationError
      );
    });

    test('record_explicit_study 없이 시도하면 에러(progress 레코드 없음)', async () => {
      const userId = await createUser('u-4.4-err-b');
      await createNode('NODE_4_4_ERR_B', 'VI', 1);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, 'NODE_4_4_ERR_B', { isCorrect: true }),
        progressEngine.ContractViolationError
      );
    });

    test('존재하지 않는 node_id는 에러', async () => {
      const userId = await createUser('u-4.4-err-c');
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, 'NODE_DOES_NOT_EXIST', { isCorrect: true }),
        progressEngine.NotFoundError
      );
    });
  });

  describe('record_attempt (4.4) — State 전이 전체 생애주기 (§3.2)', () => {
    test('INTRODUCED -> STUDYING -> PRACTICING -> MASTERED -> AUTOMATIC', async () => {
      const userId = await createUser('u-lifecycle');
      await createNode('NODE_LIFECYCLE', 'VI', 1); // baseline_ms=2000

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_LIFECYCLE', new Date().toISOString());

      // 1번째 시도: INTRODUCED -> STUDYING (attempt_records 1건 이상 조건, 즉시 충족)
      let r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
        isCorrect: true,
        responseTimeMs: 1000,
      });
      assert.equal(r.state, 'STUDYING');

      // 2~4번째 시도: 윈도우(5) 표본 부족 -> STUDYING 유지
      for (let i = 0; i < 3; i++) {
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
        assert.equal(r.state, 'STUDYING');
      }

      // 5번째 시도: 최근 5회 정확도 1.0 >= 0.6 -> PRACTICING
      r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
        isCorrect: true,
        responseTimeMs: 1000,
      });
      assert.equal(r.state, 'PRACTICING');

      // 6~9번째 시도: 윈도우(10) 표본 부족 -> PRACTICING 유지
      for (let i = 0; i < 4; i++) {
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
        assert.equal(r.state, 'PRACTICING');
      }

      // 10번째 시도: 최근 10회 정확도 1.0>=0.85 AND confidence>=0.75 -> MASTERED
      r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
        isCorrect: true,
        responseTimeMs: 1000,
      });
      assert.equal(r.state, 'MASTERED');
      assert.ok(r.confidence_inferred >= 0.75, `confidence_inferred=${r.confidence_inferred}`);

      // 11번째 시도: 최근 10회 정확도 1.0>=0.85 AND avg_response_time(1000ms) <= baseline(2000)*0.7(=1400) -> AUTOMATIC
      r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
        isCorrect: true,
        responseTimeMs: 1000,
      });
      assert.equal(r.state, 'AUTOMATIC');
    });

    test('퇴행: PRACTICING 상태에서 최근 5회 정확도가 0.6 밑으로 떨어지면 STUDYING으로 내려간다', async () => {
      const userId = await createUser('u-demote');
      await createNode('NODE_DEMOTE', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_DEMOTE', new Date().toISOString());

      // 5회 연속 정답으로 PRACTICING까지 승격
      let r;
      for (let i = 0; i < 5; i++) {
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_DEMOTE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
      }
      assert.equal(r.state, 'PRACTICING');

      // 이후 4회 연속 오답 -> 최근 5회 중 4개 오답(정확도 0.2) -> STUDYING으로 퇴행
      for (let i = 0; i < 4; i++) {
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_DEMOTE', {
          isCorrect: false,
          responseTimeMs: 1000,
          errorCategory: 'SELF',
        });
      }
      assert.equal(r.state, 'STUDYING');
    });
  });

  describe('record_self_reported_confidence (4.5)', () => {
    test('정상 범위 값으로 calibration_delta 계산', async () => {
      const userId = await createUser('u-4.5-a');
      await createNode('NODE_4_5_A', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_5_A', new Date().toISOString());
      await progressEngine.recordAttempt(pool, userId, 'NODE_4_5_A', { isCorrect: true, responseTimeMs: 1000 });

      const before = await progressEngine.getProgress(pool, userId, 'NODE_4_5_A');
      const result = await progressEngine.recordSelfReportedConfidence(pool, userId, 'NODE_4_5_A', 0.9);
      assert.ok(Math.abs(result.confidence_calibration_delta - (0.9 - before.confidence_inferred)) < 1e-9);
    });

    test('0~1 범위를 벗어나면 에러', async () => {
      const userId = await createUser('u-4.5-b');
      await createNode('NODE_4_5_B', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_5_B', new Date().toISOString());
      await progressEngine.recordAttempt(pool, userId, 'NODE_4_5_B', { isCorrect: true, responseTimeMs: 1000 });
      await assert.rejects(
        () => progressEngine.recordSelfReportedConfidence(pool, userId, 'NODE_4_5_B', 1.5),
        progressEngine.ContractViolationError
      );
    });

    test('시도 기록이 없으면(confidence_inferred 없음) 에러', async () => {
      const userId = await createUser('u-4.5-c');
      await createNode('NODE_4_5_C', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_5_C', new Date().toISOString());
      await assert.rejects(
        () => progressEngine.recordSelfReportedConfidence(pool, userId, 'NODE_4_5_C', 0.5),
        progressEngine.ContractViolationError
      );
    });
  });

  describe('get_eligible_nodes (4.2)', () => {
    test('PRACTICING 이상 노드만 반환한다', async () => {
      const userId = await createUser('u-4.2-a');
      await createNode('NODE_4_2_LOW', 'VI', 1);
      await createNode('NODE_4_2_HIGH', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_2_LOW', new Date().toISOString());
      await progressEngine.recordAttempt(pool, userId, 'NODE_4_2_LOW', { isCorrect: true, responseTimeMs: 1000 });
      // NODE_4_2_LOW는 이제 STUDYING(아직 자격 미달)

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_2_HIGH', new Date().toISOString());
      for (let i = 0; i < 5; i++) {
        await progressEngine.recordAttempt(pool, userId, 'NODE_4_2_HIGH', { isCorrect: true, responseTimeMs: 1000 });
      }
      // NODE_4_2_HIGH는 이제 PRACTICING

      const eligible = await progressEngine.getEligibleNodes(pool, userId, 'VI');
      assert.ok(eligible.includes('NODE_4_2_HIGH'));
      assert.ok(!eligible.includes('NODE_4_2_LOW'));
    });
  });

  describe('get_concept_coverage_depth (4.6)', () => {
    test('노드가 없는 언어/Concept 조합은 coverage/depth 둘 다 null', async () => {
      const userId = await createUser('u-4.6-a');
      await pool.query(
        `INSERT INTO concepts (concept_id, category, function, difficulty) VALUES ('CONCEPT_4_6_A','C','F',1)`
      );
      const result = await progressEngine.getConceptCoverageDepth(pool, userId, 'CONCEPT_4_6_A', 'JA');
      assert.equal(result.coverage, null);
      assert.equal(result.depth, null);
    });

    test('노드는 있지만 아직 진행이 없으면 coverage=0, depth=null', async () => {
      const userId = await createUser('u-4.6-b');
      await pool.query(
        `INSERT INTO concepts (concept_id, category, function, difficulty) VALUES ('CONCEPT_4_6_B','C','F',1)`
      );
      await createNode('NODE_4_6_B', 'VI', 1, ['CONCEPT_4_6_B']);
      const result = await progressEngine.getConceptCoverageDepth(pool, userId, 'CONCEPT_4_6_B', 'VI');
      assert.equal(result.coverage, 0);
      assert.equal(result.depth, null);
    });

    test('coverage/depth가 진행 상태에 비례해 계산된다', async () => {
      const userId = await createUser('u-4.6-c');
      await pool.query(
        `INSERT INTO concepts (concept_id, category, function, difficulty) VALUES ('CONCEPT_4_6_C','C','F',1)`
      );
      await createNode('NODE_4_6_C1', 'VI', 1, ['CONCEPT_4_6_C']);
      await createNode('NODE_4_6_C2', 'VI', 1, ['CONCEPT_4_6_C']);
      // 노드 1개만 INTRODUCED
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_6_C1', new Date().toISOString());

      const result = await progressEngine.getConceptCoverageDepth(pool, userId, 'CONCEPT_4_6_C', 'VI');
      assert.equal(result.coverage, 0.5); // 2개 중 1개
      assert.equal(result.depth, 1 / 5); // INTRODUCED = ordinal 1, /5
    });

    test('존재하지 않는 concept_id는 에러', async () => {
      const userId = await createUser('u-4.6-d');
      await assert.rejects(
        () => progressEngine.getConceptCoverageDepth(pool, userId, 'CONCEPT_DOES_NOT_EXIST', 'VI'),
        progressEngine.NotFoundError
      );
    });
  });

  describe('get_due_reviews (4.7)', () => {
    test('기한이 지난 노드만, 우선순위 내림차순으로 반환한다', async () => {
      const userId = await createUser('u-4.7-a');
      await createNode('NODE_4_7_LOW_STATE', 'VI', 1); // STUDYING까지만
      await createNode('NODE_4_7_HIGH_STATE', 'VI', 1); // PRACTICING까지
      await createNode('NODE_4_7_NOT_DUE', 'VI', 1);

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_7_LOW_STATE', new Date().toISOString());
      await progressEngine.recordAttempt(pool, userId, 'NODE_4_7_LOW_STATE', { isCorrect: true, responseTimeMs: 1000 });
      // STUDYING -> next_review_at = now + 2일

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_7_HIGH_STATE', new Date().toISOString());
      for (let i = 0; i < 5; i++) {
        await progressEngine.recordAttempt(pool, userId, 'NODE_4_7_HIGH_STATE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
      }
      // PRACTICING -> next_review_at = now + 4일

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_7_NOT_DUE', new Date().toISOString());
      // INTRODUCED -> next_review_at은 없음(첫 시도 전이라 아직 스케줄 안 됨) -> 조회 대상 아님

      // "지금으로부터 3일 후" 시점에 조회하면 LOW_STATE(2일 간격)는 지났고 HIGH_STATE(4일)는 아직.
      const checkAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const due = await progressEngine.getDueReviews(pool, userId, 'VI', checkAt);

      const dueNodeIds = due.map((d) => d.node_id);
      assert.ok(dueNodeIds.includes('NODE_4_7_LOW_STATE'));
      assert.ok(!dueNodeIds.includes('NODE_4_7_HIGH_STATE'));
      assert.ok(!dueNodeIds.includes('NODE_4_7_NOT_DUE'));
    });

    test('낮은 State일수록 우선순위가 높다(같은 정도로 연체된 경우)', async () => {
      const userId = await createUser('u-4.7-b');
      await createNode('NODE_4_7_B_STUDYING', 'VI', 1);
      await createNode('NODE_4_7_B_PRACTICING', 'VI', 1);

      const past = new Date(Date.now() - 1000).toISOString();

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_7_B_STUDYING', past);
      await progressEngine.recordAttempt(pool, userId, 'NODE_4_7_B_STUDYING', { isCorrect: true, responseTimeMs: 1000 });

      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_4_7_B_PRACTICING', past);
      for (let i = 0; i < 5; i++) {
        await progressEngine.recordAttempt(pool, userId, 'NODE_4_7_B_PRACTICING', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
      }

      // 두 노드 모두 next_review_at을 강제로 같은 과거 시점으로 맞춰 "동일하게 연체"시킨다.
      await pool.query(
        `UPDATE progress SET next_review_at = now() - interval '1 hour'
           WHERE user_id = $1 AND node_id IN ('NODE_4_7_B_STUDYING', 'NODE_4_7_B_PRACTICING')`,
        [userId]
      );

      const due = await progressEngine.getDueReviews(pool, userId, 'VI', new Date().toISOString());
      const studyingIdx = due.findIndex((d) => d.node_id === 'NODE_4_7_B_STUDYING');
      const practicingIdx = due.findIndex((d) => d.node_id === 'NODE_4_7_B_PRACTICING');
      assert.ok(studyingIdx < practicingIdx, 'STUDYING(낮은 state)이 PRACTICING보다 먼저(우선순위 높게) 와야 함');
    });

    test('limit이 결과 수를 제한한다', async () => {
      const userId = await createUser('u-4.7-c');
      const past = new Date(Date.now() - 1000).toISOString();
      for (const n of ['NODE_4_7_C1', 'NODE_4_7_C2', 'NODE_4_7_C3']) {
        await createNode(n, 'VI', 1);
        await progressEngine.recordExplicitStudy(pool, userId, n, past);
        await progressEngine.recordAttempt(pool, userId, n, { isCorrect: true, responseTimeMs: 1000 });
      }
      await pool.query(
        `UPDATE progress SET next_review_at = now() - interval '1 hour' WHERE user_id = $1`,
        [userId]
      );
      const due = await progressEngine.getDueReviews(pool, userId, 'VI', new Date().toISOString(), { limit: 2 });
      assert.equal(due.length, 2);
    });
  });
});
