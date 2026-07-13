// tests/aud002SpacedReview.test.js
//
// AUD-002(Frozen Core Standard Amendment) 검증 — VALIDATION_LEVEL3.md §8.1 기준.
// "Burst 승격 차단"과 "조기 연습이 due를 미루지 않는지"는 이 Amendment의 존재 이유이므로
// 예외 없이 PASS해야 한다(VALIDATION_LEVEL3.md §8.1 명시).
//
// 근거: DOMAIN_LOGIC_BRIEF.md §3.2.1/§3.2.2/§6.1, PROGRESS_SCHEMA.md §3/§4,
// DATA_PERSISTENCE_BRIEF.md v1.10(mastered_at/is_spaced_review), VALIDATION_LEVEL3.md §8.1.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const progressEngine = require('../src/engines/progressEngine');

async function createUser(deviceId) {
  const { rows } = await pool.query(
    `INSERT INTO users (auth_provider, auth_identifier, timezone) VALUES ('GUEST',$1,'UTC') RETURNING user_id`,
    [deviceId]
  );
  return rows[0].user_id;
}

async function createNode(nodeId, difficulty = 1) {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty) VALUES ($1,'VI','[]'::jsonb,$1,$2)`,
    [nodeId, difficulty]
  );
}

/** 다음 시도를 강제로 "due 이후"로 만든다(pre-update next_review_at을 과거로). */
async function forceDue(userId, nodeId) {
  await pool.query(
    `UPDATE progress SET next_review_at = now() - interval '1 hour' WHERE user_id=$1 AND node_id=$2`,
    [userId, nodeId]
  );
}

async function attempt(userId, nodeId, isCorrect, responseTimeMs = 1000) {
  return progressEngine.recordAttempt(pool, userId, nodeId, { isCorrect, responseTimeMs });
}

async function burst(userId, nodeId, n, isCorrect = true, responseTimeMs = 1000) {
  let r;
  for (let i = 0; i < n; i++) r = await attempt(userId, nodeId, isCorrect, responseTimeMs);
  return r;
}

async function spacedAttempt(userId, nodeId, isCorrect = true, responseTimeMs = 1000) {
  await forceDue(userId, nodeId);
  return attempt(userId, nodeId, isCorrect, responseTimeMs);
}

/** PRACTICING까지 승격시킨다(burst만 사용 — spaced 아님). */
async function promoteToPracticing(userId, nodeId) {
  await progressEngine.recordExplicitStudy(pool, userId, nodeId, new Date().toISOString());
  return burst(userId, nodeId, 5); // STUDYING(5회 윈도우, acc>=0.6) → PRACTICING
}

/**
 * PRACTICING → MASTERED까지 승격시킨다. 최근 10회 윈도우 안에 spaced+정답 3회를 만들고,
 * MASTERED 진입을 트리거하는 마지막(10번째) 시도 자체도 spaced+정답이 되도록 구성한다
 * (진입 attempt 재사용 금지 검증을 위해 의도적으로 이렇게 설계 — 진입 attempt가 spaced가
 * 아니면애초에 재사용될 여지 자체가 없어 검증이 약해짐).
 */
async function promoteToMastered(userId, nodeId) {
  await promoteToPracticing(userId, nodeId); // 5회
  await burst(userId, nodeId, 2); // 7회 누적, 아직 윈도우(10) 표본 부족
  await spacedAttempt(userId, nodeId); // 8회 — spaced #1
  await spacedAttempt(userId, nodeId); // 9회 — spaced #2
  return spacedAttempt(userId, nodeId); // 10회 — spaced #3, MASTERED 진입 트리거(이 attempt 자체도 spaced)
}

describe('AUD-002 Spaced Review Evidence (VALIDATION_LEVEL3.md §8.1)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
  });

  after(async () => {
    await pool.end();
  });

  test('1. rapid burst만으로는 PRACTICING → MASTERED에 도달할 수 없다 (Burst 차단 — 무예외 PASS 기준)', async () => {
    const userId = await createUser('u-burst-block');
    await createNode('NODE_BURST');
    await progressEngine.recordExplicitStudy(pool, userId, 'NODE_BURST', new Date().toISOString());

    // 15회 연속 정답, 전부 burst(텀 없음) — 최근10 윈도우 정확도·confidence는 전부 만족하지만
    // spaced 조건이 0회이므로 MASTERED에 도달하면 안 된다.
    const r = await burst(userId, 'NODE_BURST', 15);
    assert.notEqual(r.state, 'MASTERED', `burst만으로 MASTERED 도달함(state=${r.state}) — Amendment 실패`);
    assert.equal(r.state, 'PRACTICING');
  });

  test('2. qualifying spaced review 3회 충족 후 MASTERED 도달 가능하다', async () => {
    const userId = await createUser('u-spaced-mastered');
    await createNode('NODE_SPACED_M');
    const r = await promoteToMastered(userId, 'NODE_SPACED_M');
    assert.equal(r.state, 'MASTERED');
    assert.ok(r.mastered_at, 'mastered_at이 설정되지 않음');
  });

  test('3. MASTERED 진입에 쓰인 attempt는 그 이후 AUTOMATIC evidence로 재사용되지 않는다', async () => {
    const userId = await createUser('u-no-reuse');
    await createNode('NODE_NO_REUSE');
    const entryResult = await promoteToMastered(userId, 'NODE_NO_REUSE');
    assert.equal(entryResult.state, 'MASTERED');
    assert.equal(entryResult.is_spaced_review, true, '이 테스트는 진입 attempt가 spaced인 경우를 검증해야 함');

    // 진입 attempt 자체가 spaced+정답이었으므로, 재사용이 허용된다면 "1회만 더" 해도
    // AUTOMATIC(2회)에 도달해버린다. 재사용이 금지된다면 1회로는 부족해야 한다.
    const afterOne = await spacedAttempt(userId, 'NODE_NO_REUSE');
    assert.equal(
      afterOne.state,
      'MASTERED',
      `1회 추가 spaced만으로 AUTOMATIC 도달함(state=${afterOne.state}) — 진입 attempt가 재사용된 것으로 보임`
    );

    // 진짜 2번째 post-MASTERED evidence를 채우면 그때는 AUTOMATIC이어야 한다.
    const afterTwo = await spacedAttempt(userId, 'NODE_NO_REUSE');
    assert.equal(afterTwo.state, 'AUTOMATIC');
  });

  test('4. post-MASTERED spaced review 2회를 채우기 전에는 AUTOMATIC에 도달하지 않는다', async () => {
    const userId = await createUser('u-automatic-gate');
    await createNode('NODE_AUTO_GATE');
    // 진입 attempt가 spaced가 아니도록(burst로 문턱만 넘기지 않고) 별도 구성 — 여기서는
    // promoteToMastered를 그대로 쓰고, 진입 attempt 포함 여부와 무관하게 "0회, 그 다음 1회"
    // 시점에는 AUTOMATIC이면 안 됨을 확인한다.
    const entry = await promoteToMastered(userId, 'NODE_AUTO_GATE');
    assert.equal(entry.state, 'MASTERED');

    const zero = await attempt(userId, 'NODE_AUTO_GATE', true); // burst, spaced 아님 — evidence 0회 그대로
    assert.equal(zero.state, 'MASTERED');

    const one = await spacedAttempt(userId, 'NODE_AUTO_GATE'); // evidence 1회(진입 attempt는 위 테스트처럼 재사용 안 됨)
    assert.equal(one.state, 'MASTERED', `evidence 1회만으로 AUTOMATIC 도달함(state=${one.state})`);
  });

  test('5. post-MASTERED spaced review 2회를 채우면 AUTOMATIC에 도달한다', async () => {
    const userId = await createUser('u-automatic-ok');
    await createNode('NODE_AUTO_OK');
    await promoteToMastered(userId, 'NODE_AUTO_OK');
    await spacedAttempt(userId, 'NODE_AUTO_OK'); // evidence 1
    const r = await spacedAttempt(userId, 'NODE_AUTO_OK'); // evidence 2
    assert.equal(r.state, 'AUTOMATIC');
  });

  test('6. AUTOMATIC/MASTERED에서 하위 퇴행 후 재MASTERED 시, 이전 epoch의 evidence는 재사용되지 않는다', async () => {
    const userId = await createUser('u-epoch-isolation');
    await createNode('NODE_EPOCH');

    const firstEntry = await promoteToMastered(userId, 'NODE_EPOCH'); // 10회, mastered_at = epoch 1
    assert.equal(firstEntry.state, 'MASTERED');
    const firstMasteredAt = firstEntry.mastered_at;

    // epoch 1에서 AUTOMATIC 문턱 1회만 채워둔다(재사용 금지 확인용 잔여 evidence).
    const leftoverEvidence = await spacedAttempt(userId, 'NODE_EPOCH');
    assert.equal(leftoverEvidence.state, 'MASTERED'); // 아직 1회뿐이라 AUTOMATIC 아님

    // 정확도를 떨어뜨려 PRACTICING으로 강제 퇴행시킨다(최근10 윈도우를 오답으로 오염).
    // 정확히 2회 오답만 준다 — 최근10 윈도우 정확도가 0.85 밑으로 떨어지는 최소치이며,
    // 그 이상 오답을 늘리면 같은 루프 안에서 STUDYING까지 연쇄 퇴행할 수 있어(매 attempt가
    // "그 시점의 현재 state" 기준으로 한 단계씩 판정하므로, 여러 번 호출하면 여러 단계
    // 내려갈 수 있음 — §3.3 "한 번에 한 단계"는 attempt 1건당 규칙이지 전체 시퀀스 규칙이
    // 아님) 정확히 MASTERED→PRACTICING 한 단계만 확인하기 위해 오답 수를 최소화했다.
    let demoted;
    for (let i = 0; i < 2; i++) {
      demoted = await attempt(userId, 'NODE_EPOCH', false); // 오답
    }
    assert.equal(demoted.state, 'PRACTICING', `퇴행 실패(state=${demoted.state})`);

    // 윈도우를 완전히 정답으로 새로 채워 재MASTERED(epoch 2)까지 승격시킨다.
    await burst(userId, 'NODE_EPOCH', 10); // 오답 잔여를 윈도우 밖으로 완전히 밀어냄
    await spacedAttempt(userId, 'NODE_EPOCH');
    await spacedAttempt(userId, 'NODE_EPOCH');
    const secondEntry = await spacedAttempt(userId, 'NODE_EPOCH');
    assert.equal(secondEntry.state, 'MASTERED', `재MASTERED 실패(state=${secondEntry.state})`);
    const secondMasteredAt = secondEntry.mastered_at;
    assert.ok(
      new Date(secondMasteredAt).getTime() > new Date(firstMasteredAt).getTime(),
      'mastered_at이 재진입 시 갱신되지 않음'
    );

    // epoch 1의 leftoverEvidence(1회)가 재사용된다면, 여기서 1회만 더해도 AUTOMATIC(2회)에
    // 도달해버린다 — epoch 격리가 되어 있다면 1회로는 부족해야 한다.
    const oneInEpoch2 = await spacedAttempt(userId, 'NODE_EPOCH');
    assert.equal(
      oneInEpoch2.state,
      'MASTERED',
      `epoch 1의 evidence가 재사용되어 1회만으로 AUTOMATIC 도달함(state=${oneInEpoch2.state})`
    );
    const twoInEpoch2 = await spacedAttempt(userId, 'NODE_EPOCH');
    assert.equal(twoInEpoch2.state, 'AUTOMATIC');
  });

  test('7. due 이전 자발적 조기 연습은 next_review_at을 미루지 않는다', async () => {
    const userId = await createUser('u-early-practice');
    await createNode('NODE_EARLY');
    await progressEngine.recordExplicitStudy(pool, userId, 'NODE_EARLY', new Date().toISOString());
    const first = await attempt(userId, 'NODE_EARLY', true); // INTRODUCED→STUDYING, next_review_at 최초 설정(2일 후)
    const beforeNextReview = (await progressEngine.getProgress(pool, userId, 'NODE_EARLY')).next_review_at;

    // due(2일 후) 이전에 자발적으로 한 번 더 연습 — State 유지(STUDYING, 윈도우5 미충족)
    const early = await attempt(userId, 'NODE_EARLY', true);
    assert.equal(early.state, 'STUDYING');
    const afterEarly = (await progressEngine.getProgress(pool, userId, 'NODE_EARLY')).next_review_at;
    assert.equal(
      new Date(afterEarly).getTime(),
      new Date(beforeNextReview).getTime(),
      'due 이전 조기 연습인데 next_review_at이 밀렸음'
    );
  });

  test('8. due 도달 이후 attempt는 is_spaced_review=true로 기록되고 next_review_at이 재계산된다', async () => {
    const userId = await createUser('u-due-reached');
    await createNode('NODE_DUE');
    await progressEngine.recordExplicitStudy(pool, userId, 'NODE_DUE', new Date().toISOString());
    await attempt(userId, 'NODE_DUE', true);
    const before = (await progressEngine.getProgress(pool, userId, 'NODE_DUE')).next_review_at;

    const r = await spacedAttempt(userId, 'NODE_DUE', true);
    assert.equal(r.is_spaced_review, true);
    const after = (await progressEngine.getProgress(pool, userId, 'NODE_DUE')).next_review_at;
    assert.ok(new Date(after).getTime() > new Date(before).getTime(), 'due 이후인데 next_review_at이 재계산되지 않음');
  });

  test('9. is_spaced_review 판정은 pre-update snapshot을 쓴다(같은 attempt 안에서 갱신된 값과 비교하지 않음)', async () => {
    // State 전이가 발생하는 attempt(예: STUDYING→PRACTICING)에서 next_review_at이 같은
    // 트랜잭션 안에서 재계산되는데, is_spaced_review 판정이 "갱신 후" 값과 비교한다면
    // 항상 false가 나오는 등 오류가 생긴다 — pre-update 값과 비교했는지 간접 확인.
    const userId = await createUser('u-snapshot');
    await createNode('NODE_SNAPSHOT');
    await progressEngine.recordExplicitStudy(pool, userId, 'NODE_SNAPSHOT', new Date().toISOString());
    await burst(userId, 'NODE_SNAPSHOT', 4); // STUDYING, 윈도우5 미충족
    // 5번째 시도를 강제로 due 이후로 만든다 — 이 시도 자체가 STUDYING→PRACTICING 전이를
    // 일으키므로, "이 시도 처리 중 새로 계산되는" next_review_at이 아니라 그 이전 값과
    // 비교해야 is_spaced_review=true가 정상적으로 나온다.
    const r = await spacedAttempt(userId, 'NODE_SNAPSHOT', true);
    assert.equal(r.state, 'PRACTICING'); // 전이 발생 확인
    assert.equal(r.is_spaced_review, true, 'pre-update snapshot이 아니라 갱신 후 값과 비교한 것으로 보임');
  });

  test('10. next_review_at이 NULL이면 is_spaced_review=false로 안전 처리된다', async () => {
    const userId = await createUser('u-null-next-review');
    await createNode('NODE_NULL_NR');
    await progressEngine.recordExplicitStudy(pool, userId, 'NODE_NULL_NR', new Date().toISOString());
    // record_explicit_study 직후에는 next_review_at이 아직 NULL(최초 시도 전이라 스케줄된 적 없음).
    const before = await progressEngine.getProgress(pool, userId, 'NODE_NULL_NR');
    assert.equal(before.next_review_at, null);

    const r = await attempt(userId, 'NODE_NULL_NR', true);
    assert.equal(r.is_spaced_review, false);
  });
});
