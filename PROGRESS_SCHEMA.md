# PROGRESS_SCHEMA.md
## User Learning State 데이터 표준 (Tier A — Core Standard)

> Grammar Node/Concept/Content가 "무엇을, 어떻게 가르칠 것인가"를 정의했다면, 이 문서는 **사용자가 지금 무엇을 얼마나 알고 있는가**에 대한 유일한 진실을 정의한다. Progress Engine(ENGINE_INTERFACE §5)이 유일하게 쓰기 권한을 갖는 데이터의 구조가 바로 이 문서다.

문서 계층: Tier A(CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, LEARNING_PROTOCOL, CONTENT_SCHEMA, **PROGRESS_SCHEMA**) → Tier C(ENGINE_INTERFACE, API_CONTRACT)

---

## 0. 문서의 지위

- **이 문서는 User Learning State의 유일한 출처다.** GRAMMAR_SCHEMA.md §4~5에 있던 State/Confidence/AttemptRecord 정의는 이 문서로 완전히 이관되었으며, GRAMMAR_SCHEMA.md는 이제 이 문서를 참조만 한다(CONTENT_SCHEMA.md 분리와 동일한 선례).
- **분리 근거**: Grammar Node/Relation은 언어팩 제작자가 정의하는 정적 구조이고, Progress는 Progress Engine이 런타임에 갱신하는 동적 상태다. 성격이 다른 데이터를 한 문서에 두지 않는다는 원칙(CONTENT_SCHEMA 분리와 동일)을 여기에도 적용한다.
- **이번 버전의 범위**: **Grammar Progress만** 다룬다. Content 기반 학습(Listening/Shadowing/Dialogue/Conversation)의 진행 상태는 9장에서 별도로 다룬다 — 이번 문서에 억지로 포함하지 않는다.

---

## 1. 목적

이 문서는 두 가지를 명확히 구분해서 정의한다.

| 구분 | 성격 | 위치 |
|---|---|---|
| **저장 데이터** | Progress Engine이 쓰고 읽는 실제 필드 | 2~6장 |
| **파생 지표(Derived Metrics)** | 저장 데이터로부터 그때그때 계산되는 값, 저장되지 않음 | 7장 |

이 구분이 없으면 "계산 가능한 것을 또 저장해서 두 번째 진실 소스를 만드는" 문제가 반복된다(CONCEPT_SCHEMA §9~10의 Coverage/Depth, GRAMMAR_GRAPH §2의 State-Colored Graph에서 이미 확립된 원칙과 동일).

---

## 2. Grammar Progress Entity 개요

- **식별자**: 별도 ID를 발행하지 않는다. **`(user_id, node_id)` 복합 키**가 식별자다(IDENTIFIER_STANDARD §7).
- **언어 독립성**: 이 엔터티의 구조는 어떤 Language Pack의 Grammar Node에도 동일하게 적용된다.
- **필드 그룹**: State Model(3장), Confidence & Attempt History(4장), Review Scheduling(5장) — 세 그룹이 모여 하나의 Grammar Progress 레코드를 이룬다.

---

## 3. State Model

| 필드 | `state` |
|---|---|
| **목적** | LEARNING_THEORY §2가 정의한 6단계 습득 상태를 저장 |
| **타입** | `enum`: `NOT_INTRODUCED` \| `INTRODUCED` \| `STUDYING` \| `PRACTICING` \| `MASTERED` \| `AUTOMATIC` |
| **제약 조건** | 기본값은 `NOT_INTRODUCED`. Grammar Node(정적 엔터티)가 아니라 반드시 이 Progress 레코드에만 존재해야 한다 |
| **사용 규칙** | 퇴행(하락)이 가능해야 하므로 "현재 상태"로 취급하며 "최고 도달 상태 기록"이 아니다 |

| 필드 | `explicit_study_event_at` |
|---|---|
| **목적** | `NOT_INTRODUCED → INTRODUCED` 전이가 명시적 학습으로만 발생했음을 증빙(LEARNING_THEORY §6 게이팅 원칙) |
| **타입** | `timestamp \| null` |
| **제약 조건** | 이 값이 없으면 `state`는 `INTRODUCED` 이상이 될 수 없다 |

---

## 4. Confidence & Attempt History

| 필드 | 목적 |
|---|---|
| `accuracy` | 누적 인출 시도 대비 정답 비율(`float 0.0~1.0`). 단독으로 `state` 전이를 결정하지 않는다 |
| `confidence_inferred` | 행동 데이터 기반 확신도(응답 시간·수정 횟수·힌트 사용·연속 정답으로 매 시도마다 갱신되는 rolling 값) |
| `confidence_self_reported` / `confidence_calibration_delta` | 주요 상태 전이 체크포인트에서 수집한 자기평가값과, 이를 `confidence_inferred`와 비교한 보정값. `confidence_self_reported`가 없는 상태에서 `confidence_calibration_delta`를 계산된 값처럼 표시하는 것은 금지 |
| `avg_response_time_ms` | Automatic 상태 진입 판정의 핵심 근거(문항 난이도로 정규화된 값) |
| `recent_attempts` | `array<AttemptRecord>`, **최근 N개로 크기 제한**(예: 20개). 무제한 누적 로그로 설계하지 않는다 |

**AttemptRecord 구조**: `timestamp`, `is_correct(bool)`, `response_time_ms`, `correction_count`, `hint_used(bool)`, `preceding_streak(int)`, `error_category`(`SELF`\|`TRANSFER`\|`null`), `error_subcategory`(예약 필드, 현재 미사용).

**제약**: `is_correct = true`인 시도는 `error_category`/`error_subcategory` 모두 `null`이어야 한다.

**예시**
```
{
  "user_id": "u_1029",
  "node_id": "GRAMMAR_VI_DA",
  "state": "PRACTICING",
  "explicit_study_event_at": "2026-06-20T09:12:00Z",
  "accuracy": 0.82,
  "confidence_inferred": 0.74,
  "confidence_self_reported": 0.8,
  "confidence_calibration_delta": 0.06,
  "avg_response_time_ms": 2100,
  "next_review_at": "2026-07-10T00:00:00Z",
  "recent_attempts": [
    { "timestamp": "2026-07-01T10:02:00Z", "is_correct": false,
      "response_time_ms": 4200, "correction_count": 2,
      "hint_used": true, "preceding_streak": 0,
      "error_category": "TRANSFER", "error_subcategory": null }
  ]
}
```

---

## 5. Review Scheduling

| 필드 | `next_review_at` |
|---|---|
| **목적** | 다음 복습 예정 시점(간격 반복 스케줄의 결과) |
| **타입** | `timestamp` |
| **사용 규칙** | 정확한 간격 계산식은 이 문서에서 정의하지 않는다(HOW 단계, LEARNING_THEORY §4 원칙만 준수하면 됨) |

**핵심 원칙 — Review Queue는 저장 엔터티가 아니다.** "오늘 복습해야 할 노드 목록"(Review Queue)은 `next_review_at <= 현재 시각`인 모든 Progress 레코드를 조회한 **결과**일 뿐이다. 이를 별도로 저장하면 Progress 레코드와 Review Queue라는 두 개의 진실 소스가 생기고, 어느 한쪽이 갱신될 때 다른 쪽이 stale해지는 문제가 발생한다.

**발견된 후속 조치 필요 사항**: 현재 API_CONTRACT.md는 `(user_id, node_id)` 단건 조회(`get_progress`)만 정의되어 있고, "사용자 하나의 전체 Review Queue를 배치로 조회하는 API"가 없다. 이는 이 문서의 범위가 아니라 API_CONTRACT.md의 공백이므로, 별도로 `get_due_reviews(user_id, language) → node_id 목록` 같은 API 추가를 다음 API_CONTRACT.md 개정에서 검토해야 한다.

---

## 6. Automatic 판정 근거

`state = AUTOMATIC`이라는 값 자체가 판정 결과다. 판정에 쓰인 근거(`accuracy`·`confidence`가 임계값을 안정적으로 유지했는지, `avg_response_time_ms`가 기준 이하인지)는 이미 4장의 필드에 존재하므로, **별도의 "판정 기록" 엔터티를 만들지 않는다.**

**향후 감사(audit) 필요성**: "왜 이 노드가 Automatic으로 판정되었는가"를 사후에 추적하고 싶어지면, 이는 ENGINE_INTERFACE.md §16에 예약된 **Audit/Logging Engine**(Reserved, 미구현)의 영역이다. 지금 이 문서에 감사 로그 필드를 미리 만들지 않는다.

---

## 7. Derived Metrics (파생 지표)

**원칙**: 이 장의 모든 지표는 **저장되지 않으며, 조회 시점에 2~6장의 저장 데이터로부터 계산된다.** CONCEPT_SCHEMA §10의 Coverage/Depth와 동일한 설계 원칙이다.

| 지표 | 정의 | 계산 재료 | 재사용처 |
|---|---|---|---|
| **Retention(유지율)** | 습득 완료 표시 후 일정 기간 뒤 재시험 통과 여부 | `state` 이력, `recent_attempts`의 시간 분포 | PROJECT_VISION §3 "문법 노드 습득 지속률", VALIDATION_FRAMEWORK §7 |
| **Transfer Score(전이 점수)** | `TRANSFER_EXERCISE` 타입 Content(CONTENT_SCHEMA §2)에서의 정답률 | `recent_attempts` 중 해당 Content 유형에서 발생한 시도만 필터링 | PROJECT_VISION §3 "전이 성공률" |
| **Automation Score(자동화 점수)** | 문항 난이도 대비 정규화된 반응 속도 | `avg_response_time_ms`, Content/Grammar Node의 `difficulty` | PROJECT_VISION §3 "반응 자동화 지표" |
| **Confidence Trend(확신도 추세)** | 시간에 따른 `confidence_inferred`/`confidence_self_reported`의 변화 기울기 | `recent_attempts`의 시계열, 체크포인트별 자기보고 이력 | LEARNING_PROTOCOL §15 Reflection |

**정확한 계산식(표본 크기, 통계적 유의성 기준 등)은 이 문서에서 확정하지 않는다** — VALIDATION_FRAMEWORK §7이 이미 "무엇을 측정하는가"까지만 정의하고 정확한 임계값은 HOW 단계로 넘긴 것과 동일한 원칙이다. 이 장이 강제하는 것은 **이 네 지표가 별도 저장 없이 계산 가능해야 한다는 것**, 그리고 Analytics·AI Tutor·Assessment 등 향후 어떤 Engine이든 동일한 정의를 재사용해야 한다는 것뿐이다.

---

## 8. Grammar Node ↔ Progress 연결 규칙

- **참조 방향**: `Progress.node_id → Grammar Node.id` (단방향). Grammar Node는 자신에 대한 Progress 레코드 목록을 저장하지 않는다 — Concept/Content와 동일한 이유(핵심 정적 구조를 사용자 수 × 노드 수만큼 늘어나는 동적 데이터로부터 보호).
- 복합 키 `(user_id, node_id)`가 곧 식별자이므로 별도 참조 무결성 검사는 "이 `node_id`가 실제 존재하는 Grammar Node인가"만 확인하면 된다.

---

## 9. Future Extension — Content Progress / Conversation Progress (Reserved, 미구현)

- **현재 구현하지 않는다.** 이 장은 향후 확장을 위한 자리 예약이다.
- **범주 오류 경고**: Listening/Shadowing/Dialogue/Conversation의 진행 상태를 지금의 6단계(`NOT_INTRODUCED`→`AUTOMATIC`) 상태 모델에 억지로 끼워 맞추지 않는다. "대화 하나를 완료했다"는 것은 "문법을 자동화했다"와 근본적으로 다른 종류의 진행 개념이다(전자는 완료/참여 성격, 후자는 숙련도 단계 성격).
- **확장 방향**: 필요해지면 `CONTENT_PROGRESS`(사용자 × Content, 완료 여부·노출 횟수 등), `CONVERSATION_PROGRESS`(자유 회화 세션 이력) 같은 **형제 엔터티**를 별도로 신설한다. 이 문서의 State Model을 무리하게 일반화하지 않되, 아래 설계 원칙은 동일하게 공유한다.
  - 단일 쓰기 경로(Progress Engine 또는 그에 준하는 전용 Engine)
  - 계산 가능한 지표는 저장하지 않는다(7장과 동일 원칙)
  - ID/복합키 안정성(IDENTIFIER_STANDARD 원칙)

---

## 10. Progress Validation

VALIDATION_FRAMEWORK Level 0(Schema Validation)에 포함되어야 할 규칙.

- `state`가 6개 enum 값 중 하나인가
- `is_correct = true`인 AttemptRecord에 `error_category`/`error_subcategory`가 `null`인가(4장 제약)
- `confidence_self_reported`가 없는데 `confidence_calibration_delta`가 존재하지 않는가(근거 없는 보정값 금지)
- `recent_attempts`가 크기 제한을 넘지 않는가
- `explicit_study_event_at`이 없는데 `state`가 `INTRODUCED` 이상인 경우가 없는가(LEARNING_THEORY §6 게이팅 원칙 위반 탐지)

---

## 11. 금지 사항

- Review Queue를 별도 저장 엔터티로 만드는 것(5장 원칙 위반)
- Derived Metrics(7장)를 저장 필드로 만드는 것
- Progress Engine 이외의 주체가 이 데이터를 직접 쓰는 것(ENGINE_INTERFACE §11 단일 쓰기 경로 재확인)
- Content Progress/Conversation Progress를 이 엔터티에 억지로 끼워 넣는 것(9장 위반)
- 상태 퇴행을 막는 것 — 퇴행은 LEARNING_THEORY §2의 정상 동작이며, 이를 금지하는 구현이 오히려 이 표준 위반이다
- `AUTOMATIC` 판정을 위한 별도 감사 로그 필드를 이 문서에 추가하는 것(6장 — 그 역할은 Audit/Logging Engine의 몫)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 승인, Tier A 배치 확정. Review Queue/Derived Metrics는 계산값으로, Content/Conversation Progress는 향후 형제 엔터티로 처리하는 방향 합의 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — GRAMMAR_SCHEMA §4~5의 State/Confidence/AttemptRecord 정의를 완전 이관. Review Scheduling에서 Review Queue 비저장 원칙 명문화(API_CONTRACT.md 배치 조회 API 공백 발견). Derived Metrics 4종(Retention/Transfer Score/Automation Score/Confidence Trend) 신규 정의. Future Extension(Content/Conversation Progress)에 범주 오류 근거와 형제 엔터티 확장 방향 명시 |
