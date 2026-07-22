// src/engines/progressEngine.js
//
// 책임(ENGINE_INTERFACE.md §5): 사용자별 진행 상태(State/Accuracy/Confidence/
// AttemptRecord)에 대한 유일한 쓰기 경로. Coverage/Depth 계산 제공. 다음 복습
// 시점 계산. 리프 Engine — 다른 Engine을 호출하지 않는다.
//
// 구현하는 API(API_CONTRACT.md §4): get_progress(4.1), get_eligible_nodes(4.2),
// record_explicit_study(4.3), record_attempt(4.4), record_self_reported_confidence(4.5),
// get_concept_coverage_depth(4.6), get_due_reviews(4.7), get_active_learning_count(4.8),
// get_progress_snapshot(4.9), get_practicing_plus_count(4.10).
//
// ⚠️ 발견된 문서 갭(코드 작성 중 발견, Architecture 재확인 필요 — Phase 1-B 보고에 기재):
// API_CONTRACT.md §4.4(record_attempt)의 입력 목록에는 content_id가 없다. 하지만
// AC-008(Resolved)로 attempt_records.content_id 컬럼이 추가됐고, 이 컬럼에 값을 쓸
//수 있는 경로는 Progress Engine의 record_attempt뿐이다(단일 쓰기 경로 원칙,
// ENGINE_INTERFACE §2.2) — 그렇지 않으면 AC-008이 만든 컬럼에 아무도 값을 못 쓴다.
// 이 파일은 content_id를 선택적 입력으로 받아 attempt_records에 그대로 저장한다.
// AC-008 결정의 4개 반영 지점(§5.1/§7.1/§10.2/DATA_PERSISTENCE)에 이 5번째 지점을
// 추가하는 것이 맞다고 보지만, 정식 승인 없이 API_CONTRACT.md 문서 자체는 수정하지
// 않았다 — 승인해주시면 문서에도 반영하겠다.
//
// ⚠️ AUD-002 remediation(2026-07-13, Frozen Core Standard Amendment — 미확인 코드
// 폐기 후 GitHub main HEAD 181b6f48ae7f3ef494a985e0afe481cc9dbf22c7의 canonical 문서
// 기준으로 처음부터 새로 작성): PRACTICING→MASTERED·MASTERED→AUTOMATIC 승격에 Spaced
// Review Evidence 조건을 추가하고(DOMAIN_LOGIC_BRIEF.md §3.2.1/§3.2.2), next_review_at
// 갱신을 조건부(State 전이 또는 due 이후 attempt에서만, §6.1)로 바꿨다. determineNextState·
// recordAttempt·getProgress가 이번에 수정된 부분이다. 이 remediation 범위 밖(Learning
// Flow/Generation/Review/Content/AI Generation/Interleaving Engine, API Layer, Worker,
// Tier D seed)은 건드리지 않았다.

const {
  STATE_ORDINAL,
  PROMOTION,
  DIFFICULTY_BASELINE_MS,
  CONFIDENCE_EMA,
  REVIEW_INTERVAL_DAYS,
  AUD002_SPACED_REVIEW,
  ACTIVE_NODE_LIMIT,
} = require('../config/engineConfig');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'INVALID_ID';
  }
}

class ContractViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractViolationError';
    this.code = 'CONTRACT_VIOLATION';
  }
}

class OutOfRangeValueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OutOfRangeValueError';
    this.code = 'OUT_OF_RANGE_VALUE';
  }
}

class MissingRequiredFieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingRequiredFieldError';
    this.code = 'MISSING_REQUIRED_FIELD';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateAc014UserId(userId) {
  if (userId === undefined) {
    throw new MissingRequiredFieldError('user_id는 필수입니다');
  }
  if (userId === null || typeof userId !== 'string') {
    throw new ContractViolationError('user_id는 string이어야 합니다');
  }
  if (!UUID_PATTERN.test(userId)) {
    throw new NotFoundError(`유효하지 않은 user_id: ${userId}`);
  }
}

function validateAc014Language(language) {
  if (language === undefined) {
    throw new MissingRequiredFieldError('language는 필수입니다');
  }
  if (language === null || typeof language !== 'string') {
    throw new ContractViolationError('language는 string이어야 합니다');
  }
  if (!/^[A-Z]{2}$/.test(language)) {
    throw new OutOfRangeValueError(`language는 ISO 639-1 대문자 2글자여야 합니다: ${language}`);
  }
}

function validateAc014NodeIds(nodeIds) {
  if (nodeIds === undefined) {
    throw new MissingRequiredFieldError('node_ids는 필수입니다');
  }
  if (nodeIds === null || !Array.isArray(nodeIds)) {
    throw new ContractViolationError('node_ids는 string[]이어야 합니다');
  }
  for (const nodeId of nodeIds) {
    if (typeof nodeId !== 'string' || nodeId.trim().length === 0) {
      throw new ContractViolationError(
        'node_ids의 모든 원소는 비어 있지 않은 문자열이어야 합니다'
      );
    }
  }
  return [...new Set(nodeIds)];
}

function validateCascadeTargetNodeIds(input, isCorrect, errorCategory) {
  const provided = Object.prototype.hasOwnProperty.call(input, 'cascadeTargetNodeIds');
  const value = provided ? input.cascadeTargetNodeIds : [];

  if (value === null) {
    throw new ContractViolationError('cascade_target_node_ids는 null일 수 없습니다(omitted는 []로 처리)');
  }
  if (!Array.isArray(value)) {
    throw new ContractViolationError('cascade_target_node_ids는 string[]이어야 합니다');
  }

  const seen = new Set();
  for (const targetNodeId of value) {
    if (typeof targetNodeId !== 'string' || targetNodeId.trim().length === 0) {
      throw new ContractViolationError(
        'cascade_target_node_ids의 모든 원소는 비어 있지 않은 문자열이어야 합니다'
      );
    }
    if (seen.has(targetNodeId)) {
      throw new ContractViolationError(`cascade_target_node_ids에 중복 node_id가 있습니다: ${targetNodeId}`);
    }
    seen.add(targetNodeId);
  }

  if (value.length > 0 && (isCorrect === true || errorCategory !== 'TRANSFER')) {
    throw new ContractViolationError(
      '정답 및 SELF 시도에서는 cascade_target_node_ids가 반드시 []여야 합니다'
    );
  }

  return value;
}

// ---------------------------------------------------------------------------
// 4.1 get_progress
// ---------------------------------------------------------------------------
async function getProgress(pool, userId, nodeId) {
  const { rows } = await pool.query(
    `SELECT state, accuracy, confidence_inferred, confidence_self_reported,
            confidence_calibration_delta, avg_response_time_ms, explicit_study_event_at,
            next_review_at, mastered_at
       FROM progress WHERE user_id = $1 AND node_id = $2`,
    [userId, nodeId]
  );
  if (rows.length === 0) {
    // §4.1 빈 결과: 레코드가 없으면 NOT_INTRODUCED 기본값(정의된 기본 상태, 에러 아님)
    return {
      state: 'NOT_INTRODUCED',
      accuracy: null,
      confidence_inferred: null,
      confidence_self_reported: null,
      confidence_calibration_delta: null,
      avg_response_time_ms: null,
      explicit_study_event_at: null,
      next_review_at: null,
      mastered_at: null,
    };
  }
  const r = rows[0];
  return {
    state: r.state,
    accuracy: r.accuracy === null ? null : Number(r.accuracy),
    confidence_inferred: r.confidence_inferred === null ? null : Number(r.confidence_inferred),
    confidence_self_reported:
      r.confidence_self_reported === null ? null : Number(r.confidence_self_reported),
    confidence_calibration_delta:
      r.confidence_calibration_delta === null ? null : Number(r.confidence_calibration_delta),
    avg_response_time_ms: r.avg_response_time_ms === null ? null : Number(r.avg_response_time_ms),
    explicit_study_event_at: r.explicit_study_event_at,
    next_review_at: r.next_review_at,
    mastered_at: r.mastered_at,
  };
}

// ---------------------------------------------------------------------------
// 4.2 get_eligible_nodes
// ---------------------------------------------------------------------------
async function getEligibleNodes(pool, userId, language) {
  const { rows } = await pool.query(
    `SELECT p.node_id FROM progress p
       JOIN grammar_nodes gn ON gn.node_id = p.node_id
      WHERE p.user_id = $1 AND gn.language = $2
        AND p.state IN ('PRACTICING', 'MASTERED', 'AUTOMATIC')`,
    [userId, language]
  );
  return rows.map((r) => r.node_id);
}

// ---------------------------------------------------------------------------
// 4.11 get_recent_attempted_combinations (AC-017, internal read API)
// ---------------------------------------------------------------------------
async function getRecentAttemptedCombinations(pool, userId, language) {
  validateAc014UserId(userId);
  validateAc014Language(language);

  const client = await pool.connect();
  try {
    const { rows: userRows } = await client.query(
      'SELECT 1 FROM users WHERE user_id = $1',
      [userId]
    );
    if (userRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 user_id: ${userId}`);
    }

    const { rows } = await client.query(
      `SELECT ar.content_id, c.grammar_node_ids, ar.attempted_at
         FROM attempt_records ar
         JOIN grammar_nodes gn ON gn.node_id = ar.node_id
         JOIN content c ON c.content_id = ar.content_id
        WHERE ar.user_id = $1
          AND gn.language = $2
          AND ar.content_id IS NOT NULL
        ORDER BY ar.attempted_at DESC, ar.attempt_id ASC
        LIMIT 20`,
      [userId, language]
    );

    return rows.map((row) => ({
      content_id: row.content_id,
      grammar_node_ids: [...new Set(row.grammar_node_ids)].sort(compareStrings),
      attempted_at: new Date(row.attempted_at).toISOString(),
    }));
  } finally {
    client.release();
  }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ---------------------------------------------------------------------------
// 4.8 get_active_learning_count (AC-013, internal read API)
// ---------------------------------------------------------------------------
async function getActiveLearningCount(pool, userId, language) {
  if (typeof language !== 'string' || !/^[A-Z]{2}$/.test(language)) {
    throw new OutOfRangeValueError(`language는 ISO 639-1 대문자 2글자여야 합니다: ${language}`);
  }

  const { rows: userRows } = await pool.query('SELECT 1 FROM users WHERE user_id = $1', [userId]);
  if (userRows.length === 0) {
    throw new NotFoundError(`존재하지 않는 user_id: ${userId}`);
  }

  const { rows } = await pool.query(
    `SELECT count(*) AS active_count
       FROM progress p
       JOIN grammar_nodes gn ON gn.node_id = p.node_id
      WHERE p.user_id = $1
        AND gn.language = $2
        AND p.state IN ('INTRODUCED', 'STUDYING')`,
    [userId, language]
  );

  return { active_count: Number(rows[0].active_count) };
}

// ---------------------------------------------------------------------------
// 4.9 get_progress_snapshot (AC-014, internal read API)
// ---------------------------------------------------------------------------
async function getProgressSnapshot(pool, userId, nodeIds) {
  validateAc014UserId(userId);
  const uniqueNodeIds = validateAc014NodeIds(nodeIds);

  const client = await pool.connect();
  try {
    const { rows: userRows } = await client.query(
      'SELECT 1 FROM users WHERE user_id = $1',
      [userId]
    );
    if (userRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 user_id: ${userId}`);
    }

    if (uniqueNodeIds.length === 0) return {};

    const { rows: nodeRows } = await client.query(
      'SELECT node_id, language FROM grammar_nodes WHERE node_id = ANY($1::text[])',
      [uniqueNodeIds]
    );
    if (nodeRows.length !== uniqueNodeIds.length) {
      const found = new Set(nodeRows.map((row) => row.node_id));
      const missing = uniqueNodeIds.find((nodeId) => !found.has(nodeId));
      throw new NotFoundError(`존재하지 않는 node_id: ${missing}`);
    }

    if (new Set(nodeRows.map((row) => row.language)).size > 1) {
      throw new ContractViolationError('node_ids는 모두 같은 language여야 합니다');
    }

    const { rows: progressRows } = await client.query(
      `SELECT node_id, state
         FROM progress
        WHERE user_id = $1 AND node_id = ANY($2::text[])`,
      [userId, uniqueNodeIds]
    );

    const result = {};
    for (const nodeId of uniqueNodeIds) result[nodeId] = 'NOT_INTRODUCED';
    for (const row of progressRows) result[row.node_id] = row.state;
    return result;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// 4.10 get_practicing_plus_count (AC-014, internal read API)
// ---------------------------------------------------------------------------
async function getPracticingPlusCount(pool, userId, language) {
  validateAc014UserId(userId);
  validateAc014Language(language);

  const client = await pool.connect();
  try {
    const { rows: userRows } = await client.query(
      'SELECT 1 FROM users WHERE user_id = $1',
      [userId]
    );
    if (userRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 user_id: ${userId}`);
    }

    const { rows } = await client.query(
      `SELECT count(*) AS count
         FROM progress p
         JOIN grammar_nodes gn ON gn.node_id = p.node_id
        WHERE p.user_id = $1
          AND gn.language = $2
          AND p.state IN ('PRACTICING', 'MASTERED', 'AUTOMATIC')`,
      [userId, language]
    );
    return { count: Number(rows[0].count) };
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// 4.3 record_explicit_study
// ---------------------------------------------------------------------------
async function recordExplicitStudy(pool, userId, nodeId, timestamp) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: nodeRows } = await client.query(
      'SELECT language FROM grammar_nodes WHERE node_id = $1',
      [nodeId]
    );
    if (nodeRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
    }
    const language = nodeRows[0].language;

    await client.query(
      `SELECT pg_advisory_xact_lock(
         hashtext($1::text),
         hashtext($2::text)
       )`,
      [userId, language]
    );

    const { rows: userRows } = await client.query('SELECT 1 FROM users WHERE user_id = $1', [userId]);
    if (userRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 user_id: ${userId}`);
    }

    const { rows: existing } = await client.query(
      'SELECT state FROM progress WHERE user_id = $1 AND node_id = $2',
      [userId, nodeId]
    );
    if (existing.length > 0) {
      // AC-013: idempotency는 capacity gate보다 우선한다.
      await client.query('COMMIT');
      return { state: existing[0].state };
    }

    const { rows: countRows } = await client.query(
      `SELECT count(*) AS active_count
         FROM progress p
         JOIN grammar_nodes gn ON gn.node_id = p.node_id
        WHERE p.user_id = $1
          AND gn.language = $2
          AND p.state IN ('INTRODUCED', 'STUDYING')`,
      [userId, language]
    );
    const activeCount = Number(countRows[0].active_count);
    if (activeCount >= ACTIVE_NODE_LIMIT.maxConcurrentIntroducedOrStudying) {
      throw new ContractViolationError(
        `active Grammar Node limit 초과: user=${userId}, language=${language}, active_count=${activeCount}`
      );
    }

    await client.query(
      `INSERT INTO progress (user_id, node_id, state, explicit_study_event_at, updated_at)
       VALUES ($1, $2, 'INTRODUCED', $3, now())`,
      [userId, nodeId, timestamp]
    );
    await client.query('COMMIT');
    return { state: 'INTRODUCED' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// 4.4 record_attempt (핵심 로직 — §3 State 전이, §4 Confidence EMA, §6.1 스케줄링)
// ---------------------------------------------------------------------------

/** §3.1 윈도우 정확도: 최근 N회(이번 시도 포함) 정답 비율. attempt_records를 즉시 재조회. */
async function windowedAccuracy(client, userId, nodeId, window) {
  const { rows } = await client.query(
    `SELECT is_correct FROM attempt_records
      WHERE user_id = $1 AND node_id = $2
      ORDER BY attempted_at DESC LIMIT $3`,
    [userId, nodeId, window]
  );
  if (rows.length < window) return null; // 표본 부족 — 판정 보류(§3.3)
  const correct = rows.filter((r) => r.is_correct).length;
  return correct / rows.length;
}

/**
 * AUD-002 §3.2.1: 최근 10회 윈도우(이번 시도 포함) 안에서 qualifying spaced review이자
 * 정답인 시도의 개수. 표본이 10개 미만이면 null(판정 보류 — acc10과 동일한 게이팅).
 */
async function windowedSpacedCorrectCount(client, userId, nodeId, window) {
  const { rows } = await client.query(
    `SELECT is_correct, is_spaced_review FROM attempt_records
      WHERE user_id = $1 AND node_id = $2
      ORDER BY attempted_at DESC LIMIT $3`,
    [userId, nodeId, window]
  );
  if (rows.length < window) return null;
  return rows.filter((r) => r.is_correct && r.is_spaced_review).length;
}

/**
 * AUD-002 §3.2.2: mastered_at "이후"(attempted_at > mastered_at, 배타적)의 qualifying
 * spaced review이자 정답인 시도 개수. 윈도우 제한 없음(마지막 MASTERED 진입 이후 누적).
 * masteredAt이 null이면(이론상 도달 불가 — MASTERED를 거쳐야만 이 함수가 호출되므로
 * 방어적으로만) 0을 반환한다.
 */
async function spacedCorrectCountSinceMastered(client, userId, nodeId, masteredAt) {
  if (masteredAt == null) return 0;
  const { rows } = await client.query(
    `SELECT count(*) AS n FROM attempt_records
      WHERE user_id = $1 AND node_id = $2
        AND is_correct = true AND is_spaced_review = true
        AND attempted_at > $3`,
    [userId, nodeId, masteredAt]
  );
  return Number(rows[0].n);
}

/** preceding_streak: 이번 시도 "직전까지"의 연속 정답 수(이번 시도 제외, 과거 기록만) */
async function computePrecedingStreak(client, userId, nodeId) {
  const { rows } = await client.query(
    `SELECT is_correct FROM attempt_records
      WHERE user_id = $1 AND node_id = $2
      ORDER BY attempted_at DESC`,
    [userId, nodeId]
  );
  let streak = 0;
  for (const r of rows) {
    if (r.is_correct) streak += 1;
    else break;
  }
  return streak;
}

function computeSignal({ isCorrect, responseTimeMs, difficulty, hintUsed, precedingStreak }) {
  const baseline = DIFFICULTY_BASELINE_MS[difficulty];
  // response_time_ms가 없으면(NULL 허용, DATA_PERSISTENCE_BRIEF §3.6) 시간 보너스를
  // 주지 않는 보수적 기본값을 쓴다(해석적 판단 — 문서에 명시 없음, 확인 필요).
  const normalizedResponseTime =
    responseTimeMs == null ? 1 : Math.min(responseTimeMs / baseline, 1);
  const { weights, streakCap } = CONFIDENCE_EMA;
  return (
    weights.correct * (isCorrect ? 1 : 0) +
    weights.responseTime * (1 - normalizedResponseTime) +
    weights.hint * (hintUsed ? 0 : 1) +
    weights.streak * Math.min(precedingStreak / streakCap, 1)
  );
}

/**
 * §3.2/§3.3 State 전이 판정. 한 번에 한 단계만 승격/퇴행한다(연쇄 금지).
 * AUD-002: PRACTICING→MASTERED, MASTERED→AUTOMATIC에 Spaced Review Evidence 조건 추가.
 * @param {Date|null} masteredAt 이번 attempt 처리 "직전"의 progress.mastered_at 값
 * @returns {Promise<string>} 새 state
 */
async function determineNextState(client, userId, nodeId, currentState, confidenceInferred, difficulty, masteredAt) {
  if (currentState === 'INTRODUCED') {
    // INTRODUCED → STUDYING: attempt_records 1건 이상(이번 시도로 이미 충족)
    return 'STUDYING';
  }

  if (currentState === 'STUDYING') {
    const acc5 = await windowedAccuracy(client, userId, nodeId, PROMOTION.STUDYING_TO_PRACTICING.window);
    if (acc5 !== null && acc5 >= PROMOTION.STUDYING_TO_PRACTICING.minWindowedAccuracy) {
      return 'PRACTICING';
    }
    return 'STUDYING'; // STUDYING 자체 유지 조건(시도 1건 이상)은 되돌릴 수 없는 사실이라 퇴행 없음
  }

  if (currentState === 'PRACTICING') {
    // AUD-002 §3.2.1: 최근 10회 윈도우 정확도·confidence 조건 + qualifying spaced review
    // 최소 3회(전부 정답) 조건을 모두 만족해야 MASTERED로 승격한다(burst 승격 차단).
    const acc10 = await windowedAccuracy(client, userId, nodeId, PROMOTION.PRACTICING_TO_MASTERED.window);
    const spacedCorrect10 = await windowedSpacedCorrectCount(
      client,
      userId,
      nodeId,
      PROMOTION.PRACTICING_TO_MASTERED.window
    );
    const qualifiesForMastered =
      acc10 !== null &&
      acc10 >= PROMOTION.PRACTICING_TO_MASTERED.minWindowedAccuracy &&
      confidenceInferred >= PROMOTION.PRACTICING_TO_MASTERED.minConfidence &&
      spacedCorrect10 !== null &&
      spacedCorrect10 >= AUD002_SPACED_REVIEW.practicingToMasteredMinQualifyingSpacedReviews;
    if (qualifiesForMastered) {
      return 'MASTERED';
    }
    // 퇴행 검사: PRACTICING 자신의 유지 조건 = STUDYING→PRACTICING 조건(spaced 조건 없음 — 그대로)
    const acc5 = await windowedAccuracy(client, userId, nodeId, PROMOTION.STUDYING_TO_PRACTICING.window);
    if (acc5 !== null && acc5 < PROMOTION.STUDYING_TO_PRACTICING.minWindowedAccuracy) {
      return 'STUDYING';
    }
    return 'PRACTICING';
  }

  if (currentState === 'MASTERED') {
    // AUD-002 §3.2.2: mastered_at 이후 qualifying spaced review(정답) 최소 2회 +
    // 기존 avg_response_time_ms 기준(§3.2 원 조건, 변경 없음). 이 전이에서는 §3.2.1과
    // 달리 최근 10회 윈도우 정확도를 별도로 다시 요구하지 않는다 — evidence 자체가
    // 전부 정답이어야 한다는 조건이 이를 대체한다(DOMAIN_LOGIC_BRIEF.md §3.2 표, §3.2.2).
    const { rows } = await client.query(
      'SELECT avg_response_time_ms FROM progress WHERE user_id=$1 AND node_id=$2',
      [userId, nodeId]
    );
    const avgResponseTimeMs = rows[0] ? Number(rows[0].avg_response_time_ms) : null;
    const baseline = DIFFICULTY_BASELINE_MS[difficulty];
    const spacedEvidenceSinceMastered = await spacedCorrectCountSinceMastered(client, userId, nodeId, masteredAt);
    const qualifiesForAutomatic =
      spacedEvidenceSinceMastered >= AUD002_SPACED_REVIEW.masteredToAutomaticMinSpacedReviews &&
      avgResponseTimeMs !== null &&
      avgResponseTimeMs <= baseline * PROMOTION.MASTERED_TO_AUTOMATIC.responseTimeFactor;
    if (qualifiesForAutomatic) {
      return 'AUTOMATIC';
    }
    // 퇴행 검사: MASTERED 자신의 유지 조건 = PRACTICING→MASTERED 조건(AUD-002로 확장된
    // 조건 그대로 재확인 — spaced evidence도 다시 3회 미만이면 퇴행 사유가 된다).
    const acc10 = await windowedAccuracy(client, userId, nodeId, PROMOTION.PRACTICING_TO_MASTERED.window);
    const spacedCorrect10 = await windowedSpacedCorrectCount(
      client,
      userId,
      nodeId,
      PROMOTION.PRACTICING_TO_MASTERED.window
    );
    if (
      acc10 !== null &&
      (acc10 < PROMOTION.PRACTICING_TO_MASTERED.minWindowedAccuracy ||
        confidenceInferred < PROMOTION.PRACTICING_TO_MASTERED.minConfidence ||
        (spacedCorrect10 !== null &&
          spacedCorrect10 < AUD002_SPACED_REVIEW.practicingToMasteredMinQualifyingSpacedReviews))
    ) {
      return 'PRACTICING';
    }
    return 'MASTERED';
  }

  if (currentState === 'AUTOMATIC') {
    // 퇴행 검사: AUTOMATIC 자신의 유지 조건 = MASTERED→AUTOMATIC 조건(AUD-002).
    const { rows } = await client.query(
      'SELECT avg_response_time_ms FROM progress WHERE user_id=$1 AND node_id=$2',
      [userId, nodeId]
    );
    const avgResponseTimeMs = rows[0] ? Number(rows[0].avg_response_time_ms) : null;
    const baseline = DIFFICULTY_BASELINE_MS[difficulty];
    const spacedEvidenceSinceMastered = await spacedCorrectCountSinceMastered(client, userId, nodeId, masteredAt);
    const stillQualifies =
      spacedEvidenceSinceMastered >= AUD002_SPACED_REVIEW.masteredToAutomaticMinSpacedReviews &&
      avgResponseTimeMs !== null &&
      avgResponseTimeMs <= baseline * PROMOTION.MASTERED_TO_AUTOMATIC.responseTimeFactor;
    if (!stillQualifies) {
      return 'MASTERED';
    }
    return 'AUTOMATIC';
  }

  // NOT_INTRODUCED는 record_attempt 이전에 record_explicit_study를 거쳐야만 도달 가능한
  // 상태이므로 이 함수에는 들어오지 않는다(§4.3.1 참고, 방어적으로만 남겨둠).
  throw new ContractViolationError(`알 수 없는 state: ${currentState}`);
}

async function recordAttempt(pool, userId, nodeId, input) {
  const {
    isCorrect,
    responseTimeMs = null,
    correctionCount = 0,
    hintUsed = false,
    errorCategory = null,
    errorSubcategory = null,
    contentId = null, // 문서 갭 — 파일 상단 주석 참고
  } = input;
  const cascadeTargetNodeIds = validateCascadeTargetNodeIds(input, isCorrect, errorCategory);

  if (isCorrect === true && errorCategory !== null) {
    throw new ContractViolationError(
      'is_correct=true인데 error_category가 채워져 있습니다(GRAMMAR_SCHEMA §5 제약 위반)'
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (cascadeTargetNodeIds.length > 0) {
      const { rows: cascadeTargetRows } = await client.query(
        'SELECT node_id FROM grammar_nodes WHERE node_id = ANY($1::text[])',
        [cascadeTargetNodeIds]
      );
      const existingTargetNodeIds = new Set(cascadeTargetRows.map((row) => row.node_id));
      const missingTargetNodeIds = cascadeTargetNodeIds.filter((id) => !existingTargetNodeIds.has(id));
      if (missingTargetNodeIds.length > 0) {
        throw new NotFoundError(
          `존재하지 않는 cascade target Grammar Node ID: ${missingTargetNodeIds.join(', ')}`
        );
      }
    }

    const { rows: nodeRows } = await client.query(
      'SELECT difficulty FROM grammar_nodes WHERE node_id = $1',
      [nodeId]
    );
    if (nodeRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
    }
    const difficulty = nodeRows[0].difficulty;

    const { rows: progressRows } = await client.query(
      `SELECT state, confidence_inferred, avg_response_time_ms, mastered_at, next_review_at
         FROM progress WHERE user_id=$1 AND node_id=$2 FOR UPDATE`,
      [userId, nodeId]
    );
    if (progressRows.length === 0) {
      throw new ContractViolationError(
        `progress 레코드가 없습니다 — record_explicit_study를 먼저 호출해야 합니다 (user=${userId}, node=${nodeId})`
      );
    }
    const currentState = progressRows[0].state;
    const oldConfidence =
      progressRows[0].confidence_inferred === null ? null : Number(progressRows[0].confidence_inferred);
    const oldAvgResponseTime =
      progressRows[0].avg_response_time_ms === null ? null : Number(progressRows[0].avg_response_time_ms);
    const currentMasteredAt = progressRows[0].mastered_at; // Date | null — AUD-002
    // AUD-002 pre-update snapshot(PROGRESS_SCHEMA.md §4·DOMAIN_LOGIC_BRIEF.md §6.1): 이번
    // attempt를 처리하고 progress를 갱신하기 "직전"의 next_review_at. 같은 처리 안에서
    // 새로 계산되는 값과 절대 비교하면 안 되므로, 이 시점에 즉시 변수로 고정해둔다.
    const preUpdateNextReviewAt = progressRows[0].next_review_at; // Date | null

    // 이번 attempt 처리 전체에서 "지금"을 하나로 고정한다(앱 서버-DB 시계 오차 방지 +
    // MASTERED 진입 시 mastered_at과 이 시도의 attempted_at을 정확히 동일하게 만들어,
    // "MASTERED 진입에 쓰인 시도는 그 이후 evidence로 재사용하지 않는다"는 §3.2.2의
    // attempted_at > mastered_at 배타 조건이 항상 올바르게 성립하도록 보장한다).
    const { rows: nowRows } = await client.query('SELECT now() AS now');
    const attemptedAt = nowRows[0].now;

    // AUD-002(PROGRESS_SCHEMA.md §4): is_spaced_review는 pre-update next_review_at
    // snapshot 기준으로 즉시 계산·고정한다. NULL이면 안전한 기본값 false.
    const isSpacedReview =
      preUpdateNextReviewAt !== null && attemptedAt.getTime() >= preUpdateNextReviewAt.getTime();

    const precedingStreak = await computePrecedingStreak(client, userId, nodeId);

    // §4.2: "노드에 대한 첫 시도(confidence_inferred_old가 없음)는 confidence_inferred_old
    // = signal로 초기화". DB 컬럼은 NOT NULL DEFAULT 0이라 "값 없음"을 NULL로 구분할 수
    // 없으므로, "이번이 몇 번째 시도인가"로 첫 시도 여부를 판단한다(해석적 판단).
    const { rows: priorCountRows } = await client.query(
      'SELECT count(*) AS n FROM attempt_records WHERE user_id=$1 AND node_id=$2',
      [userId, nodeId]
    );
    const isFirstAttempt = Number(priorCountRows[0].n) === 0;

    await client.query(
      `INSERT INTO attempt_records
         (user_id, node_id, content_id, attempted_at, is_correct, response_time_ms, correction_count,
          hint_used, preceding_streak, error_category, error_subcategory, is_spaced_review)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        userId,
        nodeId,
        contentId,
        attemptedAt,
        isCorrect,
        responseTimeMs,
        correctionCount,
        hintUsed,
        precedingStreak,
        errorCategory,
        errorSubcategory,
        isSpacedReview,
      ]
    );

    // §4 Confidence EMA
    const signal = computeSignal({
      isCorrect,
      responseTimeMs,
      difficulty,
      hintUsed,
      precedingStreak,
    });
    const newConfidence = isFirstAttempt
      ? signal
      : CONFIDENCE_EMA.alpha * signal + (1 - CONFIDENCE_EMA.alpha) * oldConfidence;

    // progress.accuracy: 전 기간 누적 정답 비율(§3.1 — 판정에는 쓰지 않고 리포팅용)
    const { rows: aggRows } = await client.query(
      `SELECT count(*) AS total, count(*) FILTER (WHERE is_correct) AS correct
         FROM attempt_records WHERE user_id=$1 AND node_id=$2`,
      [userId, nodeId]
    );
    const total = Number(aggRows[0].total);
    const correct = Number(aggRows[0].correct);
    const newAccuracy = total > 0 ? correct / total : 0;

    // avg_response_time_ms: 이 노드에 대한 response_time_ms 단순 평균(NULL 제외).
    // "난이도로 정규화된 값"이라는 스키마 설명은 §3.2 비교 시점(baseline×0.7)에서
    // 해석되는 것으로 보고, 저장값 자체는 원시 평균으로 구현했다(해석적 판단).
    let newAvgResponseTime = oldAvgResponseTime;
    if (responseTimeMs != null) {
      const { rows: avgRows } = await client.query(
        `SELECT avg(response_time_ms) AS avg FROM attempt_records
           WHERE user_id=$1 AND node_id=$2 AND response_time_ms IS NOT NULL`,
        [userId, nodeId]
      );
      newAvgResponseTime = avgRows[0].avg === null ? null : Number(avgRows[0].avg);
    }

    const newState = await determineNextState(
      client,
      userId,
      nodeId,
      currentState,
      newConfidence,
      difficulty,
      currentMasteredAt
    );
    const transitioned = newState !== currentState;

    // AUD-002(PROGRESS_SCHEMA.md §3): mastered_at은 state가 "정확히 MASTERED가 되는
    // 모든 전이"에서만 now()로 갱신한다 — 이미 MASTERED였는데 이번에도 MASTERED로 유지된
    // 경우(전이 아님)는 건드리지 않는다. MASTERED 아래로 퇴행해도 값을 지우지 않는다
    // (퇴행 시 newState !== 'MASTERED'이므로 자연히 currentMasteredAt이 그대로 유지됨).
    const newMasteredAt =
      newState === 'MASTERED' && currentState !== 'MASTERED' ? attemptedAt : currentMasteredAt;

    // AUD-002(DOMAIN_LOGIC_BRIEF.md §6.1): next_review_at 조건부 갱신.
    //   A) State 전이 발생 → 새 State 간격으로 재계산
    //   B) State 유지 + attempted_at ≥ pre-update next_review_at(due 이후) → 재계산
    //   C) State 유지 + attempted_at < pre-update next_review_at(이른 자발적 연습) → 유지
    //   D) pre-update next_review_at이 NULL이고 전이도 없으면 → 유지(NULL 그대로)
    const dueReachedWithoutTransition =
      !transitioned && preUpdateNextReviewAt !== null && attemptedAt.getTime() >= preUpdateNextReviewAt.getTime();
    let newNextReviewAt;
    if (transitioned || dueReachedWithoutTransition) {
      const intervalDays = REVIEW_INTERVAL_DAYS[newState];
      newNextReviewAt = intervalDays
        ? new Date(attemptedAt.getTime() + intervalDays * 24 * 60 * 60 * 1000)
        : null;
    } else {
      newNextReviewAt = preUpdateNextReviewAt; // 변경 없음(이른 자발적 연습, 또는 애초 NULL)
    }

    await client.query(
      `UPDATE progress SET
         state = $1,
         accuracy = $2,
         avg_response_time_ms = $3,
         confidence_inferred = $4,
         next_review_at = $5,
         mastered_at = $6,
         updated_at = now()
       WHERE user_id = $7 AND node_id = $8`,
      [newState, newAccuracy, newAvgResponseTime, newConfidence, newNextReviewAt, newMasteredAt, userId, nodeId]
    );

    for (const targetNodeId of cascadeTargetNodeIds) {
      await client.query(
        `INSERT INTO cascade_jobs (user_id, target_node_id, status)
         VALUES ($1, $2, 'PENDING')`,
        [userId, targetNodeId]
      );
    }

    await client.query('COMMIT');

    return { state: newState, accuracy: newAccuracy, confidence_inferred: newConfidence, mastered_at: newMasteredAt, is_spaced_review: isSpacedReview };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// 4.5 record_self_reported_confidence
// ---------------------------------------------------------------------------
async function recordSelfReportedConfidence(pool, userId, nodeId, confidenceSelfReported) {
  if (
    typeof confidenceSelfReported !== 'number' ||
    confidenceSelfReported < 0 ||
    confidenceSelfReported > 1
  ) {
    throw new ContractViolationError('confidence_self_reported는 0~1 범위여야 합니다');
  }

  const { rows } = await pool.query(
    `SELECT confidence_inferred,
            (SELECT count(*) FROM attempt_records ar WHERE ar.user_id=$1 AND ar.node_id=$2) AS attempt_count
       FROM progress WHERE user_id=$1 AND node_id=$2`,
    [userId, nodeId]
  );
  if (rows.length === 0 || Number(rows[0].attempt_count) === 0) {
    throw new ContractViolationError(
      '비교할 confidence_inferred가 아직 없습니다 — 최소 1회 시도가 필요합니다'
    );
  }

  const confidenceInferred = Number(rows[0].confidence_inferred);
  const delta = confidenceSelfReported - confidenceInferred;

  await pool.query(
    `UPDATE progress SET confidence_self_reported=$1, confidence_calibration_delta=$2, updated_at=now()
       WHERE user_id=$3 AND node_id=$4`,
    [confidenceSelfReported, delta, userId, nodeId]
  );

  return { confidence_calibration_delta: delta };
}

// ---------------------------------------------------------------------------
// 4.6 get_concept_coverage_depth (DOMAIN_LOGIC_BRIEF §7)
// ---------------------------------------------------------------------------
async function getConceptCoverageDepth(pool, userId, conceptId, language) {
  const { rows: conceptRows } = await pool.query('SELECT 1 FROM concepts WHERE concept_id = $1', [
    conceptId,
  ]);
  if (conceptRows.length === 0) {
    throw new NotFoundError(`존재하지 않는 concept_id: ${conceptId}`);
  }

  const { rows: nodes } = await pool.query(
    `SELECT node_id FROM grammar_nodes WHERE language = $1 AND concept_ids @> $2::jsonb`,
    [language, JSON.stringify([conceptId])]
  );
  if (nodes.length === 0) {
    // §4.6 빈 결과: 이 언어에 해당 Concept을 표현하는 노드가 없음 → null(0%와 다른 의미)
    return { coverage: null, depth: null };
  }

  const nodeIds = nodes.map((n) => n.node_id);
  const { rows: covered } = await pool.query(
    `SELECT p.node_id, p.state FROM progress p
      WHERE p.user_id = $1 AND p.node_id = ANY($2::text[])`,
    [userId, nodeIds]
  );

  const coverage = covered.length / nodeIds.length;
  let depth = null;
  if (covered.length > 0) {
    const sumOrdinal = covered.reduce((acc, r) => acc + STATE_ORDINAL[r.state], 0);
    depth = sumOrdinal / covered.length / 5;
  }

  return { coverage, depth };
}

// ---------------------------------------------------------------------------
// 4.7 get_due_reviews (DOMAIN_LOGIC_BRIEF §6.2)
// ---------------------------------------------------------------------------
async function getDueReviews(pool, userId, language, now, options = {}) {
  const { limit, conceptId, stateFilter } = options;

  const params = [userId, language, now];
  let where = `p.user_id = $1 AND gn.language = $2 AND p.next_review_at IS NOT NULL AND p.next_review_at <= $3`;

  if (conceptId) {
    params.push(JSON.stringify([conceptId]));
    where += ` AND gn.concept_ids @> $${params.length}::jsonb`;
  }
  if (stateFilter) {
    params.push(stateFilter);
    where += ` AND p.state = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT p.node_id, p.state, p.next_review_at
       FROM progress p JOIN grammar_nodes gn ON gn.node_id = p.node_id
      WHERE ${where}`,
    params
  );

  const nowDate = new Date(now);
  let items = rows.map((r) => {
    const overdueMs = nowDate.getTime() - new Date(r.next_review_at).getTime();
    const overdueDays = overdueMs / (1000 * 60 * 60 * 24);
    const stateOrdinal = STATE_ORDINAL[r.state];
    const priority = overdueDays * (6 - stateOrdinal);
    return {
      node_id: r.node_id,
      state: r.state,
      next_review_at: r.next_review_at,
      overdue_by: overdueDays,
      priority,
      reason: '정기 복습 주기 도달',
    };
  });

  items.sort((a, b) => b.priority - a.priority);
  if (limit) items = items.slice(0, limit);

  return items;
}

module.exports = {
  getProgress,
  getEligibleNodes,
  getActiveLearningCount,
  getProgressSnapshot,
  getPracticingPlusCount,
  getRecentAttemptedCombinations,
  recordExplicitStudy,
  recordAttempt,
  recordSelfReportedConfidence,
  getConceptCoverageDepth,
  getDueReviews,
  NotFoundError,
  ContractViolationError,
  OutOfRangeValueError,
  MissingRequiredFieldError,
};
