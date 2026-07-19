// tests/progressEngine.test.js
//
// Phase 1-B 검증 — State 전이 게이팅(승격/퇴행), Confidence EMA, Review 스케줄링,
// Coverage/Depth, get_due_reviews 우선순위. DOMAIN_LOGIC_BRIEF.md §3/§4/§6/§7 기준.

const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const progressEngine = require('../src/engines/progressEngine');

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

function trackingRealPool() {
  const state = { connects: 0, queries: 0, releases: 0 };
  return {
    state,
    api: {
      async connect() {
        state.connects += 1;
        const client = await pool.connect();
        return {
          query(...args) {
            state.queries += 1;
            return client.query(...args);
          },
          release() {
            state.releases += 1;
            client.release();
          },
        };
      },
    },
  };
}

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

async function insertProgressState(userId, nodeId, state) {
  await pool.query(
    `INSERT INTO progress (user_id, node_id, state, updated_at)
     VALUES ($1, $2, $3, now())`,
    [userId, nodeId, state]
  );
}

async function progressRowCount(userId, nodeIds = null) {
  const params = [userId];
  let where = 'user_id = $1';
  if (nodeIds) {
    params.push(nodeIds);
    where += ' AND node_id = ANY($2::text[])';
  }
  const { rows } = await pool.query(`SELECT count(*) AS n FROM progress WHERE ${where}`, params);
  return Number(rows[0].n);
}

async function createAud004Fixture(label, targetCount = 0) {
  const userId = await createUser(`u-aud004-${label}`);
  const nodeId = `NODE_AUD004_${label}`;
  await createNode(nodeId, 'VI', 1);
  await progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString());

  const targetNodeIds = [];
  for (let i = 1; i <= targetCount; i++) {
    const targetNodeId = `NODE_AUD004_${label}_TARGET_${i}`;
    await createNode(targetNodeId, 'VI', 1);
    targetNodeIds.push(targetNodeId);
  }
  return { userId, nodeId, targetNodeIds };
}

async function aud004WriteCounts(userId, nodeId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT count(*) FROM attempt_records WHERE user_id=$1 AND node_id=$2) AS attempts,
       (SELECT count(*) FROM cascade_jobs WHERE user_id=$1) AS jobs`,
    [userId, nodeId]
  );
  return { attempts: Number(rows[0].attempts), jobs: Number(rows[0].jobs) };
}

async function aud004ProgressSnapshot(userId, nodeId) {
  const { rows } = await pool.query(
    `SELECT state, accuracy, avg_response_time_ms, confidence_inferred,
            next_review_at, mastered_at, updated_at
       FROM progress WHERE user_id=$1 AND node_id=$2`,
    [userId, nodeId]
  );
  return rows[0];
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

  describe('AC-013 get_active_learning_count (4.8)', () => {
    test('Progress가 없으면 active_count=0', async () => {
      const userId = await createUser('u-ac013-count-zero');
      assert.deepEqual(await progressEngine.getActiveLearningCount(pool, userId, 'VI'), {
        active_count: 0,
      });
    });

    test('INTRODUCED와 STUDYING만 집계하고 PRACTICING/MASTERED/AUTOMATIC은 제외', async () => {
      const userId = await createUser('u-ac013-count-states');
      const states = ['INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC'];
      for (const state of states) {
        const nodeId = `NODE_AC013_COUNT_${state}`;
        await createNode(nodeId, 'VI', 1);
        await insertProgressState(userId, nodeId, state);
      }
      assert.deepEqual(await progressEngine.getActiveLearningCount(pool, userId, 'VI'), {
        active_count: 2,
      });
    });

    test('다른 language의 active node는 제외', async () => {
      const userId = await createUser('u-ac013-count-language');
      await createNode('NODE_AC013_COUNT_VI', 'VI', 1);
      await createNode('NODE_AC013_COUNT_EN', 'EN', 1);
      await insertProgressState(userId, 'NODE_AC013_COUNT_VI', 'INTRODUCED');
      await insertProgressState(userId, 'NODE_AC013_COUNT_EN', 'STUDYING');
      assert.deepEqual(await progressEngine.getActiveLearningCount(pool, userId, 'VI'), {
        active_count: 1,
      });
    });

    test('같은 concept의 서로 다른 node를 각각 집계', async () => {
      const userId = await createUser('u-ac013-count-concept');
      await createNode('NODE_AC013_CONCEPT_A', 'VI', 1, ['CONCEPT_AC013_SHARED']);
      await createNode('NODE_AC013_CONCEPT_B', 'VI', 1, ['CONCEPT_AC013_SHARED']);
      await insertProgressState(userId, 'NODE_AC013_CONCEPT_A', 'INTRODUCED');
      await insertProgressState(userId, 'NODE_AC013_CONCEPT_B', 'STUDYING');
      assert.deepEqual(await progressEngine.getActiveLearningCount(pool, userId, 'VI'), {
        active_count: 2,
      });
    });

    test('존재하지 않는 user_id는 INVALID_ID', async () => {
      await assert.rejects(
        () =>
          progressEngine.getActiveLearningCount(
            pool,
            '00000000-0000-4000-8000-000000000013',
            'VI'
          ),
        (err) => err.code === 'INVALID_ID'
      );
    });

    test('잘못된 language 형식은 OUT_OF_RANGE_VALUE', async () => {
      const userId = await createUser('u-ac013-count-bad-language');
      await assert.rejects(
        () => progressEngine.getActiveLearningCount(pool, userId, 'vi'),
        (err) => err.code === 'OUT_OF_RANGE_VALUE'
      );
    });
  });

  describe('AC-013 record_explicit_study Admission Gate', () => {
    test('active 0에서 신규 explicit study 성공', async () => {
      const userId = await createUser('u-ac013-admit-zero');
      await createNode('NODE_AC013_ADMIT_ZERO', 'VI', 1);
      const result = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        'NODE_AC013_ADMIT_ZERO',
        new Date().toISOString()
      );
      assert.equal(result.state, 'INTRODUCED');
    });

    test('active 1에서 신규 explicit study 성공', async () => {
      const userId = await createUser('u-ac013-admit-one');
      await createNode('NODE_AC013_ADMIT_ONE_A', 'VI', 1);
      await createNode('NODE_AC013_ADMIT_ONE_B', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_AC013_ADMIT_ONE_A', new Date().toISOString());
      const result = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        'NODE_AC013_ADMIT_ONE_B',
        new Date().toISOString()
      );
      assert.equal(result.state, 'INTRODUCED');
      assert.equal((await progressEngine.getActiveLearningCount(pool, userId, 'VI')).active_count, 2);
    });

    test('active 2에서 신규 admission은 CONTRACT_VIOLATION이고 DB 무변경', async () => {
      const userId = await createUser('u-ac013-admit-limit');
      const nodeIds = ['NODE_AC013_LIMIT_A', 'NODE_AC013_LIMIT_B', 'NODE_AC013_LIMIT_C'];
      for (const nodeId of nodeIds) await createNode(nodeId, 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, nodeIds[0], new Date().toISOString());
      await progressEngine.recordExplicitStudy(pool, userId, nodeIds[1], new Date().toISOString());
      const before = await progressRowCount(userId);
      await assert.rejects(
        () => progressEngine.recordExplicitStudy(pool, userId, nodeIds[2], new Date().toISOString()),
        (err) => err.code === 'CONTRACT_VIOLATION'
      );
      assert.equal(await progressRowCount(userId), before);
      assert.equal(await progressRowCount(userId, [nodeIds[2]]), 0);
    });

    test('active 2 이상에서도 같은 node 재호출은 멱등 반환', async () => {
      const userId = await createUser('u-ac013-idempotent-limit');
      await createNode('NODE_AC013_IDEMPOTENT_A', 'VI', 1);
      await createNode('NODE_AC013_IDEMPOTENT_B', 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_AC013_IDEMPOTENT_A', new Date().toISOString());
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_AC013_IDEMPOTENT_B', new Date().toISOString());
      const result = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        'NODE_AC013_IDEMPOTENT_A',
        new Date().toISOString()
      );
      assert.deepEqual(result, { state: 'INTRODUCED' });
      assert.equal(await progressRowCount(userId), 2);
    });

    test('language A가 limit이어도 language B admission은 성공', async () => {
      const userId = await createUser('u-ac013-language-isolation');
      await createNode('NODE_AC013_LANG_VI_A', 'VI', 1);
      await createNode('NODE_AC013_LANG_VI_B', 'VI', 1);
      await createNode('NODE_AC013_LANG_EN', 'EN', 1);
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_AC013_LANG_VI_A', new Date().toISOString());
      await progressEngine.recordExplicitStudy(pool, userId, 'NODE_AC013_LANG_VI_B', new Date().toISOString());
      const result = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        'NODE_AC013_LANG_EN',
        new Date().toISOString()
      );
      assert.equal(result.state, 'INTRODUCED');
      assert.equal((await progressEngine.getActiveLearningCount(pool, userId, 'EN')).active_count, 1);
    });

    test('active 1에서 서로 다른 두 node 동시 admission은 정확히 하나만 성공', async () => {
      const userId = await createUser('u-ac013-concurrent-different');
      const nodeIds = ['NODE_AC013_CONCURRENT_BASE', 'NODE_AC013_CONCURRENT_A', 'NODE_AC013_CONCURRENT_B'];
      for (const nodeId of nodeIds) await createNode(nodeId, 'VI', 1);
      await progressEngine.recordExplicitStudy(pool, userId, nodeIds[0], new Date().toISOString());
      const settled = await Promise.allSettled(
        nodeIds.slice(1).map((nodeId) =>
          progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString())
        )
      );
      assert.equal(settled.filter((r) => r.status === 'fulfilled').length, 1);
      assert.equal(settled.filter((r) => r.status === 'rejected').length, 1);
      assert.equal(settled.find((r) => r.status === 'rejected').reason.code, 'CONTRACT_VIOLATION');
      assert.equal(await progressRowCount(userId), 2);
    });

    test('같은 node 동시 admission은 행 1건과 멱등 결과를 보장', async () => {
      const userId = await createUser('u-ac013-concurrent-same');
      const nodeId = 'NODE_AC013_CONCURRENT_SAME';
      await createNode(nodeId, 'VI', 1);
      const settled = await Promise.allSettled([
        progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString()),
        progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString()),
      ]);
      assert.equal(settled.filter((r) => r.status === 'fulfilled').length, 2);
      assert.deepEqual(
        settled.map((r) => r.value),
        [{ state: 'INTRODUCED' }, { state: 'INTRODUCED' }]
      );
      assert.equal(await progressRowCount(userId, [nodeId]), 1);
    });

    test('실제 INSERT 실패는 전체 rollback하고 원인 제거 후 lock이 해제되어 재시도 성공', async () => {
      const userId = await createUser('u-ac013-insert-rollback');
      const nodeId = 'NODE_AC013_FORCED_INSERT_FAILURE';
      await createNode(nodeId, 'VI', 1);
      await pool.query('DROP TRIGGER IF EXISTS ac013_reject_progress_insert ON progress');
      await pool.query('DROP FUNCTION IF EXISTS ac013_reject_progress_insert()');
      await pool.query(`
        CREATE FUNCTION ac013_reject_progress_insert() RETURNS trigger AS $$
        BEGIN
          IF NEW.node_id = 'NODE_AC013_FORCED_INSERT_FAILURE' THEN
            RAISE EXCEPTION 'AC013 forced insert failure';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);
      await pool.query(`
        CREATE TRIGGER ac013_reject_progress_insert
        BEFORE INSERT ON progress
        FOR EACH ROW EXECUTE FUNCTION ac013_reject_progress_insert()
      `);
      try {
        await assert.rejects(
          () => progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString()),
          /AC013 forced insert failure/
        );
        assert.equal(await progressRowCount(userId, [nodeId]), 0);
      } finally {
        await pool.query('DROP TRIGGER IF EXISTS ac013_reject_progress_insert ON progress');
        await pool.query('DROP FUNCTION IF EXISTS ac013_reject_progress_insert()');
      }
      const retry = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        nodeId,
        new Date().toISOString()
      );
      assert.equal(retry.state, 'INTRODUCED');
      assert.equal(await progressRowCount(userId, [nodeId]), 1);
    });

    test('PRACTICING→STUDYING 퇴행으로 허용된 초과 상태가 되어도 퇴행은 commit', async () => {
      const userId = await createUser('u-ac013-demotion-over-limit');
      const activeNodeIds = ['NODE_AC013_DEMOTE_ACTIVE_A', 'NODE_AC013_DEMOTE_ACTIVE_B'];
      for (const nodeId of activeNodeIds) {
        await createNode(nodeId, 'VI', 1);
        await insertProgressState(userId, nodeId, 'INTRODUCED');
      }
      const demotingNodeId = 'NODE_AC013_DEMOTE_PRACTICING';
      await createNode(demotingNodeId, 'VI', 1);
      await insertProgressState(userId, demotingNodeId, 'PRACTICING');
      let result;
      for (let i = 0; i < 5; i++) {
        result = await progressEngine.recordAttempt(pool, userId, demotingNodeId, {
          isCorrect: false,
          responseTimeMs: 1000,
          errorCategory: 'SELF',
        });
      }
      assert.equal(result.state, 'STUDYING');
      assert.equal((await progressEngine.getActiveLearningCount(pool, userId, 'VI')).active_count, 3);

      const blockedNodeId = 'NODE_AC013_DEMOTE_BLOCKED';
      await createNode(blockedNodeId, 'VI', 1);
      await assert.rejects(
        () => progressEngine.recordExplicitStudy(pool, userId, blockedNodeId, new Date().toISOString()),
        (err) => err.code === 'CONTRACT_VIOLATION'
      );

      await pool.query(
        `UPDATE progress SET state='PRACTICING'
          WHERE user_id=$1 AND node_id = ANY($2::text[])`,
        [userId, activeNodeIds]
      );
      assert.equal((await progressEngine.getActiveLearningCount(pool, userId, 'VI')).active_count, 1);
      const admitted = await progressEngine.recordExplicitStudy(
        pool,
        userId,
        blockedNodeId,
        new Date().toISOString()
      );
      assert.equal(admitted.state, 'INTRODUCED');
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

  describe('record_attempt (4.4) — AUD-004 cascade producer remediation', () => {
    test('정답 + cascadeTargetNodeIds omitted → jobs 0', async () => {
      const { userId, nodeId } = await createAud004Fixture('CORRECT_OMITTED');
      await progressEngine.recordAttempt(pool, userId, nodeId, { isCorrect: true, responseTimeMs: 1000 });
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 1, jobs: 0 });
    });

    test('SELF + [] → jobs 0', async () => {
      const { userId, nodeId } = await createAud004Fixture('SELF_EMPTY');
      await progressEngine.recordAttempt(pool, userId, nodeId, {
        isCorrect: false,
        errorCategory: 'SELF',
        cascadeTargetNodeIds: [],
      });
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 1, jobs: 0 });
    });

    test('SELF + non-empty → 전체 실패', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('SELF_NONEMPTY', 1);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'SELF',
          cascadeTargetNodeIds: targetNodeIds,
        }),
        progressEngine.ContractViolationError
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('정답 + non-empty → 전체 실패', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('CORRECT_NONEMPTY', 1);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: true,
          cascadeTargetNodeIds: targetNodeIds,
        }),
        progressEngine.ContractViolationError
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('TRANSFER + [] → 정상 commit, jobs 0', async () => {
      const { userId, nodeId } = await createAud004Fixture('TRANSFER_EMPTY');
      await progressEngine.recordAttempt(pool, userId, nodeId, {
        isCorrect: false,
        errorCategory: 'TRANSFER',
        cascadeTargetNodeIds: [],
      });
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 1, jobs: 0 });
    });

    test('TRANSFER + 유효한 고유 ID N개 → PENDING jobs N개', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('TRANSFER_VALID', 3);
      await progressEngine.recordAttempt(pool, userId, nodeId, {
        isCorrect: false,
        errorCategory: 'TRANSFER',
        cascadeTargetNodeIds: targetNodeIds,
      });
      const { rows } = await pool.query(
        `SELECT target_node_id, status FROM cascade_jobs
          WHERE user_id=$1 ORDER BY target_node_id`,
        [userId]
      );
      assert.deepEqual(rows.map((row) => row.target_node_id), [...targetNodeIds].sort());
      assert.ok(rows.every((row) => row.status === 'PENDING'));
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 1, jobs: 3 });
    });

    test('explicit null → 전체 실패', async () => {
      const { userId, nodeId } = await createAud004Fixture('NULL');
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: null,
        }),
        progressEngine.ContractViolationError
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('배열이 아닌 값 → 전체 실패', async () => {
      const { userId, nodeId } = await createAud004Fixture('NOT_ARRAY');
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: 'NODE_NOT_AN_ARRAY',
        }),
        progressEngine.ContractViolationError
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('빈 문자열 또는 문자열이 아닌 원소 → 전체 실패', async () => {
      const { userId, nodeId } = await createAud004Fixture('INVALID_ELEMENT');
      for (const cascadeTargetNodeIds of [[''], ['   '], [123]]) {
        await assert.rejects(
          () => progressEngine.recordAttempt(pool, userId, nodeId, {
            isCorrect: false,
            errorCategory: 'TRANSFER',
            cascadeTargetNodeIds,
          }),
          progressEngine.ContractViolationError
        );
      }
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('중복 ID → 전체 실패', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('DUPLICATE', 1);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: [targetNodeIds[0], targetNodeIds[0]],
        }),
        progressEngine.ContractViolationError
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
    });

    test('존재하지 않는 ID → INVALID_ID, attempt/progress/jobs 전체 rollback', async () => {
      const { userId, nodeId } = await createAud004Fixture('MISSING_ID');
      const before = await aud004ProgressSnapshot(userId, nodeId);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: ['NODE_AUD004_DOES_NOT_EXIST'],
        }),
        (err) => err instanceof progressEngine.NotFoundError && err.code === 'INVALID_ID'
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
      assert.deepEqual(await aud004ProgressSnapshot(userId, nodeId), before);
    });

    test('유효/무효 혼합 목록 → 부분 job 없이 전체 rollback', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('MIXED_IDS', 1);
      const before = await aud004ProgressSnapshot(userId, nodeId);
      await assert.rejects(
        () => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: [targetNodeIds[0], 'NODE_AUD004_MIXED_MISSING'],
        }),
        (err) => err instanceof progressEngine.NotFoundError && err.code === 'INVALID_ID'
      );
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
      assert.deepEqual(await aud004ProgressSnapshot(userId, nodeId), before);
    });

    test('cascade_jobs 삽입 실패 → attempt/progress/jobs 전체 rollback', async () => {
      const { userId, nodeId, targetNodeIds } = await createAud004Fixture('JOB_INSERT_FAIL', 1);
      const before = await aud004ProgressSnapshot(userId, nodeId);
      await pool.query(`
        CREATE OR REPLACE FUNCTION aud004_reject_cascade_job() RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'AUD-004 forced cascade_jobs insertion failure';
        END;
        $$ LANGUAGE plpgsql
      `);
      await pool.query(`
        CREATE TRIGGER aud004_reject_cascade_job_trigger
        BEFORE INSERT ON cascade_jobs
        FOR EACH ROW EXECUTE FUNCTION aud004_reject_cascade_job()
      `);
      try {
        await assert.rejects(() => progressEngine.recordAttempt(pool, userId, nodeId, {
          isCorrect: false,
          errorCategory: 'TRANSFER',
          cascadeTargetNodeIds: targetNodeIds,
        }));
      } finally {
        await pool.query('DROP TRIGGER IF EXISTS aud004_reject_cascade_job_trigger ON cascade_jobs');
        await pool.query('DROP FUNCTION IF EXISTS aud004_reject_cascade_job()');
      }
      assert.deepEqual(await aud004WriteCounts(userId, nodeId), { attempts: 0, jobs: 0 });
      assert.deepEqual(await aud004ProgressSnapshot(userId, nodeId), before);
    });

    test('Progress Engine은 Graph/Review/Learning Flow Engine을 import하지 않는다', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'engines', 'progressEngine.js'),
        'utf8'
      );
      assert.doesNotMatch(source, /require\([^)]*(graphEngine|reviewEngine|learningFlowEngine)[^)]*\)/i);
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

      // 6~7번째 시도: 윈도우(10) 표본 부족 -> PRACTICING 유지
      for (let i = 0; i < 2; i++) {
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
        assert.equal(r.state, 'PRACTICING');
      }

      // 8~10번째 시도: AUD-002(Frozen Core Standard Amendment) — burst만으로는 더 이상
      // MASTERED에 도달할 수 없다. 최근10 윈도우 안에 qualifying spaced review(강제 due)
      // 3회가 있어야 한다. 10번째 시도 자체가 spaced review이자 MASTERED 진입 트리거.
      for (let i = 0; i < 3; i++) {
        await pool.query(
          `UPDATE progress SET next_review_at = now() - interval '1 hour' WHERE user_id=$1 AND node_id=$2`,
          [userId, 'NODE_LIFECYCLE']
        );
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
      }
      assert.equal(r.state, 'MASTERED');
      assert.ok(r.confidence_inferred >= 0.75, `confidence_inferred=${r.confidence_inferred}`);
      assert.ok(r.mastered_at, 'mastered_at이 설정되지 않음(AUD-002)');

      // 11~12번째 시도: AUD-002 — MASTERED 진입에 쓰인 10번째 시도(그 자체도 spaced)는
      // AUTOMATIC evidence로 재사용되지 않으므로, mastered_at 이후 새로운 spaced review가
      // 2회 더 필요하다(응답시간은 기존 baseline(2000)×0.7=1400ms 기준 그대로 충족).
      for (let i = 0; i < 2; i++) {
        await pool.query(
          `UPDATE progress SET next_review_at = now() - interval '1 hour' WHERE user_id=$1 AND node_id=$2`,
          [userId, 'NODE_LIFECYCLE']
        );
        r = await progressEngine.recordAttempt(pool, userId, 'NODE_LIFECYCLE', {
          isCorrect: true,
          responseTimeMs: 1000,
        });
      }
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
      for (const n of ['NODE_4_7_C1', 'NODE_4_7_C2', 'NODE_4_7_C3']) {
        await createNode(n, 'VI', 1);
        // AC-013 admission gate와 무관한 get_due_reviews limit 조회 fixture.
        // PRACTICING은 active count에 포함되지 않으므로 3건을 독립적으로 구성한다.
        await insertProgressState(userId, n, 'PRACTICING');
      }
      await pool.query(
        `UPDATE progress SET next_review_at = now() - interval '1 hour' WHERE user_id = $1`,
        [userId]
      );
      const due = await progressEngine.getDueReviews(pool, userId, 'VI', new Date().toISOString(), { limit: 2 });
      assert.equal(due.length, 2);
    });
  });

  describe('get_progress_snapshot (4.9)', () => {
    test('rejects omitted and explicit undefined required fields', async () => {
      const userId = await createUser('u-4.9-required');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, userId), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(pool, userId, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null and scalar wrong types', async () => {
      const userId = await createUser('u-4.9-types');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, null, []), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, 42, []), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, userId, null), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, userId, 'NODE'), 'CONTRACT_VIOLATION');
    });

    test('rejects malformed and nonexistent user IDs as INVALID_ID', async () => {
      await rejectsWithCode(() => progressEngine.getProgressSnapshot(pool, 'not-a-uuid', []), 'INVALID_ID');
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(pool, '00000000-0000-0000-0000-000000000000', []),
        'INVALID_ID'
      );
    });

    test('rejects invalid node_ids elements', async () => {
      const userId = await createUser('u-4.9-elements');
      for (const nodeIds of [[42], [''], ['   ']]) {
        await rejectsWithCode(
          () => progressEngine.getProgressSnapshot(pool, userId, nodeIds),
          'CONTRACT_VIOLATION'
        );
      }
    });

    test('returns an empty map only after validating the user', async () => {
      const userId = await createUser('u-4.9-empty');
      assert.deepEqual(await progressEngine.getProgressSnapshot(pool, userId, []), {});
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(pool, '00000000-0000-0000-0000-000000000001', []),
        'INVALID_ID'
      );
    });

    test('returns all unique nodes with NOT_INTRODUCED defaults', async () => {
      const userId = await createUser('u-4.9-map');
      await createNode('NODE_4_9_MAP_A', 'VI', 1);
      await createNode('NODE_4_9_MAP_B', 'VI', 1);
      await insertProgressState(userId, 'NODE_4_9_MAP_A', 'MASTERED');
      assert.deepEqual(
        await progressEngine.getProgressSnapshot(pool, userId, [
          'NODE_4_9_MAP_A',
          'NODE_4_9_MAP_A',
          'NODE_4_9_MAP_B',
        ]),
        { NODE_4_9_MAP_A: 'MASTERED', NODE_4_9_MAP_B: 'NOT_INTRODUCED' }
      );
    });

    test('rejects valid and missing node IDs without a partial result', async () => {
      const userId = await createUser('u-4.9-missing');
      await createNode('NODE_4_9_EXISTS', 'VI', 1);
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(pool, userId, ['NODE_4_9_EXISTS', 'NODE_4_9_MISSING']),
        'INVALID_ID'
      );
    });

    test('rejects mixed-language node IDs', async () => {
      const userId = await createUser('u-4.9-mixed');
      await createNode('NODE_4_9_VI', 'VI', 1);
      await createNode('NODE_4_9_EN', 'EN', 1);
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(pool, userId, ['NODE_4_9_VI', 'NODE_4_9_EN']),
        'CONTRACT_VIOLATION'
      );
    });

    test('keeps VI and EN results isolated', async () => {
      const userId = await createUser('u-4.9-isolation');
      await createNode('NODE_4_9_ISO_VI', 'VI', 1);
      await createNode('NODE_4_9_ISO_EN', 'EN', 1);
      await insertProgressState(userId, 'NODE_4_9_ISO_VI', 'PRACTICING');
      await insertProgressState(userId, 'NODE_4_9_ISO_EN', 'AUTOMATIC');
      assert.deepEqual(await progressEngine.getProgressSnapshot(pool, userId, ['NODE_4_9_ISO_VI']), {
        NODE_4_9_ISO_VI: 'PRACTICING',
      });
      assert.deepEqual(await progressEngine.getProgressSnapshot(pool, userId, ['NODE_4_9_ISO_EN']), {
        NODE_4_9_ISO_EN: 'AUTOMATIC',
      });
    });

    test('uses one real read client and releases it on success and error', async () => {
      const userId = await createUser('u-4.9-client');
      await createNode('NODE_4_9_CLIENT', 'VI', 1);
      const success = trackingRealPool();
      await progressEngine.getProgressSnapshot(success.api, userId, ['NODE_4_9_CLIENT']);
      assert.deepEqual(success.state, { connects: 1, queries: 3, releases: 1 });
      const failure = trackingRealPool();
      await rejectsWithCode(
        () => progressEngine.getProgressSnapshot(failure.api, userId, ['NODE_4_9_CLIENT_MISSING']),
        'INVALID_ID'
      );
      assert.deepEqual(failure.state, { connects: 1, queries: 2, releases: 1 });
    });
  });

  describe('get_practicing_plus_count (4.10)', () => {
    test('rejects omitted and explicit undefined required fields', async () => {
      const userId = await createUser('u-4.10-required');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, userId), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => progressEngine.getPracticingPlusCount(pool, userId, undefined),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects null, wrong types, and invalid language formats', async () => {
      const userId = await createUser('u-4.10-types');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, null, 'VI'), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, 42, 'VI'), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, userId, null), 'CONTRACT_VIOLATION');
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, userId, 42), 'CONTRACT_VIOLATION');
      for (const language of ['', '  ', 'vi', 'VIE']) {
        await rejectsWithCode(
          () => progressEngine.getPracticingPlusCount(pool, userId, language),
          'OUT_OF_RANGE_VALUE'
        );
      }
    });

    test('rejects malformed and nonexistent user IDs as INVALID_ID', async () => {
      await rejectsWithCode(() => progressEngine.getPracticingPlusCount(pool, 'not-a-uuid', 'VI'), 'INVALID_ID');
      await rejectsWithCode(
        () => progressEngine.getPracticingPlusCount(pool, '00000000-0000-0000-0000-000000000002', 'VI'),
        'INVALID_ID'
      );
    });

    test('returns numeric zero when no rows match', async () => {
      const userId = await createUser('u-4.10-zero');
      assert.deepEqual(await progressEngine.getPracticingPlusCount(pool, userId, 'JA'), { count: 0 });
    });

    test('counts only PRACTICING, MASTERED, and AUTOMATIC within the language', async () => {
      const userId = await createUser('u-4.10-count');
      for (const [suffix, language, state] of [
        ['VI_INTRODUCED', 'VI', 'INTRODUCED'],
        ['VI_STUDYING', 'VI', 'STUDYING'],
        ['VI_PRACTICING', 'VI', 'PRACTICING'],
        ['VI_MASTERED', 'VI', 'MASTERED'],
        ['VI_AUTOMATIC', 'VI', 'AUTOMATIC'],
        ['EN_PRACTICING', 'EN', 'PRACTICING'],
      ]) {
        const nodeId = `NODE_4_10_${suffix}`;
        await createNode(nodeId, language, 1);
        await insertProgressState(userId, nodeId, state);
      }
      const vi = await progressEngine.getPracticingPlusCount(pool, userId, 'VI');
      const en = await progressEngine.getPracticingPlusCount(pool, userId, 'EN');
      assert.deepEqual(vi, { count: 3 });
      assert.deepEqual(en, { count: 1 });
      assert.equal(typeof vi.count, 'number');
    });

    test('uses one real read client and releases it on success and error', async () => {
      const userId = await createUser('u-4.10-client');
      const success = trackingRealPool();
      await progressEngine.getPracticingPlusCount(success.api, userId, 'VI');
      assert.deepEqual(success.state, { connects: 1, queries: 2, releases: 1 });
      const failure = trackingRealPool();
      await rejectsWithCode(
        () => progressEngine.getPracticingPlusCount(
          failure.api,
          '00000000-0000-0000-0000-000000000003',
          'VI'
        ),
        'INVALID_ID'
      );
      assert.deepEqual(failure.state, { connects: 1, queries: 1, releases: 1 });
    });
  });
});
