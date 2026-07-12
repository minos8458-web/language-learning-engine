// src/engines/progressEngine.js
//
// 책임(ENGINE_INTERFACE.md §5): 사용자별 진행 상태(State/Accuracy/Confidence/
// AttemptRecord)에 대한 유일한 쓰기 경로. Coverage/Depth 계산 제공. 다음 복습
// 시점 계산. 리프 Engine — 다른 Engine을 호출하지 않는다.
//
// 구현하는 API(API_CONTRACT.md §4): get_progress(4.1), get_eligible_nodes(4.2),
// record_explicit_study(4.3), record_attempt(4.4), record_self_reported_confidence(4.5),
// get_concept_coverage_depth(4.6), get_due_reviews(4.7).
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

const { STATE_ORDINAL, PROMOTION, DIFFICULTY_BASELINE_MS, CONFIDENCE_EMA, REVIEW_INTERVAL_DAYS } =
  require('../config/engineConfig');

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

// ---------------------------------------------------------------------------
// 4.1 get_progress
// ---------------------------------------------------------------------------
async function getProgress(pool, userId, nodeId) {
  const { rows } = await pool.query(
    `SELECT state, accuracy, confidence_inferred, confidence_self_reported,
            confidence_calibration_delta, avg_response_time_ms, explicit_study_event_at,
            next_review_at
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
// 4.3 record_explicit_study
// ---------------------------------------------------------------------------
async function recordExplicitStudy(pool, userId, nodeId, timestamp) {
  const { rows: nodeRows } = await pool.query('SELECT 1 FROM grammar_nodes WHERE node_id = $1', [
    nodeId,
  ]);
  if (nodeRows.length === 0) {
    throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
  }

  const { rows: existing } = await pool.query(
    'SELECT state FROM progress WHERE user_id = $1 AND node_id = $2',
    [userId, nodeId]
  );
  if (existing.length > 0) {
    // §4.3: 이미 INTRODUCED 이상이면 에러가 아니라 현재 상태를 그대로 반환(멱등 처리)
    return { state: existing[0].state };
  }

  await pool.query(
    `INSERT INTO progress (user_id, node_id, state, explicit_study_event_at, updated_at)
     VALUES ($1, $2, 'INTRODUCED', $3, now())`,
    [userId, nodeId, timestamp]
  );
  return { state: 'INTRODUCED' };
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
 * @returns {Promise<string>} 새 state
 */
async function determineNextState(client, userId, nodeId, currentState, confidenceInferred, difficulty) {
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
    const acc10 = await windowedAccuracy(client, userId, nodeId, PROMOTION.PRACTICING_TO_MASTERED.window);
    if (
      acc10 !== null &&
      acc10 >= PROMOTION.PRACTICING_TO_MASTERED.minWindowedAccuracy &&
      confidenceInferred >= PROMOTION.PRACTICING_TO_MASTERED.minConfidence
    ) {
      return 'MASTERED';
    }
    // 퇴행 검사: PRACTICING 자신의 유지 조건 = STUDYING→PRACTICING 조건
    const acc5 = await windowedAccuracy(client, userId, nodeId, PROMOTION.STUDYING_TO_PRACTICING.window);
    if (acc5 !== null && acc5 < PROMOTION.STUDYING_TO_PRACTICING.minWindowedAccuracy) {
      return 'STUDYING';
    }
    return 'PRACTICING';
  }

  if (currentState === 'MASTERED') {
    const acc10 = await windowedAccuracy(client, userId, nodeId, PROMOTION.MASTERED_TO_AUTOMATIC.window);
    const { rows } = await client.query(
      'SELECT avg_response_time_ms FROM progress WHERE user_id=$1 AND node_id=$2',
      [userId, nodeId]
    );
    const avgResponseTimeMs = rows[0] ? Number(rows[0].avg_response_time_ms) : null;
    const baseline = DIFFICULTY_BASELINE_MS[difficulty];
    if (
      acc10 !== null &&
      acc10 >= PROMOTION.MASTERED_TO_AUTOMATIC.minWindowedAccuracy &&
      avgResponseTimeMs !== null &&
      avgResponseTimeMs <= baseline * PROMOTION.MASTERED_TO_AUTOMATIC.responseTimeFactor
    ) {
      return 'AUTOMATIC';
    }
    // 퇴행 검사: MASTERED 자신의 유지 조건 = PRACTICING→MASTERED 조건
    if (
      acc10 !== null &&
      (acc10 < PROMOTION.PRACTICING_TO_MASTERED.minWindowedAccuracy ||
        confidenceInferred < PROMOTION.PRACTICING_TO_MASTERED.minConfidence)
    ) {
      return 'PRACTICING';
    }
    return 'MASTERED';
  }

  if (currentState === 'AUTOMATIC') {
    const acc10 = await windowedAccuracy(client, userId, nodeId, PROMOTION.MASTERED_TO_AUTOMATIC.window);
    const { rows } = await client.query(
      'SELECT avg_response_time_ms FROM progress WHERE user_id=$1 AND node_id=$2',
      [userId, nodeId]
    );
    const avgResponseTimeMs = rows[0] ? Number(rows[0].avg_response_time_ms) : null;
    const baseline = DIFFICULTY_BASELINE_MS[difficulty];
    if (
      acc10 !== null &&
      (acc10 < PROMOTION.MASTERED_TO_AUTOMATIC.minWindowedAccuracy ||
        avgResponseTimeMs === null ||
        avgResponseTimeMs > baseline * PROMOTION.MASTERED_TO_AUTOMATIC.responseTimeFactor)
    ) {
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

  if (isCorrect === true && errorCategory !== null) {
    throw new ContractViolationError(
      'is_correct=true인데 error_category가 채워져 있습니다(GRAMMAR_SCHEMA §5 제약 위반)'
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: nodeRows } = await client.query(
      'SELECT difficulty FROM grammar_nodes WHERE node_id = $1',
      [nodeId]
    );
    if (nodeRows.length === 0) {
      throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
    }
    const difficulty = nodeRows[0].difficulty;

    const { rows: progressRows } = await client.query(
      'SELECT state, confidence_inferred, avg_response_time_ms FROM progress WHERE user_id=$1 AND node_id=$2 FOR UPDATE',
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
         (user_id, node_id, content_id, is_correct, response_time_ms, correction_count,
          hint_used, preceding_streak, error_category, error_subcategory)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        userId,
        nodeId,
        contentId,
        isCorrect,
        responseTimeMs,
        correctionCount,
        hintUsed,
        precedingStreak,
        errorCategory,
        errorSubcategory,
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
      difficulty
    );

    const intervalDays = REVIEW_INTERVAL_DAYS[newState];
    const nextReviewAt = intervalDays
      ? `now() + interval '${intervalDays} days'`
      : null;

    await client.query(
      `UPDATE progress SET
         state = $1,
         accuracy = $2,
         avg_response_time_ms = $3,
         confidence_inferred = $4,
         next_review_at = ${nextReviewAt ? nextReviewAt : 'NULL'},
         updated_at = now()
       WHERE user_id = $5 AND node_id = $6`,
      [newState, newAccuracy, newAvgResponseTime, newConfidence, userId, nodeId]
    );

    await client.query('COMMIT');

    return { state: newState, accuracy: newAccuracy, confidence_inferred: newConfidence };
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
  recordExplicitStudy,
  recordAttempt,
  recordSelfReportedConfidence,
  getConceptCoverageDepth,
  getDueReviews,
  NotFoundError,
  ContractViolationError,
};
