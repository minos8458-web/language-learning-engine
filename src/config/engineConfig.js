// src/config/engineConfig.js
//
// DOMAIN_LOGIC_BRIEF.md 머리말: "State 승격/퇴행 임계치, Confidence 가중치·α,
// Review 간격 일수는 엔진 설정값(튜닝 가능한 파라미터)이며 하드코딩된 상수가 아니다."
//
// 이 파일의 모든 값은 DOMAIN_LOGIC_BRIEF.md에 명시된 "기본값"을 그대로 옮긴 것이다 —
// 새로운 수치를 만들지 않았다. 실제 튜닝(Level 3 파일럿 데이터 기반)은 이후 단계.

// §3 State 전이 6단계(순서 고정)
const STATE_ORDER = [
  'NOT_INTRODUCED',
  'INTRODUCED',
  'STUDYING',
  'PRACTICING',
  'MASTERED',
  'AUTOMATIC',
];

// §7.2 / §6.2: Coverage/Depth·priority 계산에 쓰는 서수 척도.
// NOT_INTRODUCED는 이 척도에 없다(Review/Coverage 대상 자체가 아니므로) — CONCEPT_SCHEMA §10.3.
const STATE_ORDINAL = {
  INTRODUCED: 1,
  STUDYING: 2,
  PRACTICING: 3,
  MASTERED: 4,
  AUTOMATIC: 5,
};

// §3.2 승격 조건 기본값
const PROMOTION = {
  STUDYING_TO_PRACTICING: { window: 5, minWindowedAccuracy: 0.6 },
  PRACTICING_TO_MASTERED: { window: 10, minWindowedAccuracy: 0.85, minConfidence: 0.75 },
  MASTERED_TO_AUTOMATIC: { window: 10, minWindowedAccuracy: 0.85, responseTimeFactor: 0.7 },
};

// §3.2 난이도별 기준 응답시간(ms) — "고정 조회 테이블", 단순성 우선
const DIFFICULTY_BASELINE_MS = {
  1: 2000,
  2: 3000,
  3: 4000,
  4: 5000,
  5: 6000,
};

// §4 Confidence EMA
const CONFIDENCE_EMA = {
  alpha: 0.3,
  weights: {
    correct: 0.5,
    responseTime: 0.2,
    hint: 0.15,
    streak: 0.15,
  },
  streakCap: 5, // min(preceding_streak / streakCap, 1)
};

// §6.1 State 연동 고정 간격(일)
const REVIEW_INTERVAL_DAYS = {
  INTRODUCED: 1,
  STUDYING: 2,
  PRACTICING: 4,
  MASTERED: 9,
  AUTOMATIC: 21,
};

// AUD-002(Frozen Core Standard Amendment, DOMAIN_LOGIC_BRIEF.md §3.2.1/§3.2.2) —
// Spaced Review Evidence 최소 횟수. "3"·"2" 모두 문서가 명시한 Provisional/tunable
// default다(LEARNING_THEORY 원문 수치 미확보 상태에서 원칙만 확정, 수치는 조정 가능).
const AUD002_SPACED_REVIEW = {
  practicingToMasteredMinQualifyingSpacedReviews: 3, // §3.2.1: 최근 10회 윈도우 안 qualifying spaced review
  masteredToAutomaticMinSpacedReviews: 2, // §3.2.2: mastered_at 이후 qualifying spaced review
};

// AC-013(Active-Node Admission Boundary) — `(user_id, language)` 범위의
// INTRODUCED/STUDYING Grammar Node 신규 admission 제한. Provisional/tunable default.
const ACTIVE_NODE_LIMIT = {
  maxConcurrentIntroducedOrStudying: 2,
};

// AC-015(Interleaving sequence_nodes) — 원본 occurrence multiset의 최대 길이.
// Provisional/tunable default이며 sequenceNodes는 이 값을 참조해 admission 전에 거부한다.
const INTERLEAVING_LIMITS = {
  baseRepeats: 2,
  maxBatchSize: 6,
};

// AC-014/AC-016: 실제 입력이 공급되기 전까지 NEW_GRAMMAR와 CONVERSATION의
// session budget을 소진된 것으로 보지 않는 현재 유일한 mode.
const SESSION_BUDGET_MODES = {
  UNBOUNDED_UNTIL_INPUT_AVAILABLE: 'UNBOUNDED_UNTIL_INPUT_AVAILABLE',
};
const SESSION_BUDGET_MODE = SESSION_BUDGET_MODES.UNBOUNDED_UNTIL_INPUT_AVAILABLE;

// AC-014/AC-016: CONVERSATION 진입에 필요한 PRACTICING 이상 node 수.
const CONVERSATION_PRACTICING_PLUS_THRESHOLD = 3;

module.exports = {
  STATE_ORDER,
  STATE_ORDINAL,
  PROMOTION,
  DIFFICULTY_BASELINE_MS,
  CONFIDENCE_EMA,
  REVIEW_INTERVAL_DAYS,
  AUD002_SPACED_REVIEW,
  ACTIVE_NODE_LIMIT,
  INTERLEAVING_LIMITS,
  SESSION_BUDGET_MODES,
  SESSION_BUDGET_MODE,
  CONVERSATION_PRACTICING_PLUS_THRESHOLD,
};
