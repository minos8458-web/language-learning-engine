# DOMAIN_LOGIC_BRIEF.md
## LLE Production 핵심 도메인 로직 지시서 (Tier C, Production Track 2/5)

> 이 문서는 코드가 아니라 **지시서**다. `DATA_PERSISTENCE_BRIEF.md`(v1.2)가 확정한 스키마 위에서, "저장된 데이터로 무엇을 계산하는가"를 정의한다. API로 어떻게 노출하는지는 `API_LAYER_BRIEF.md`(3번 문서)의 몫이다.
>
> 이 문서가 정의하는 알고리즘 중 State 승격/퇴행 임계치, Confidence 가중치·α, Review 간격 일수는 **엔진 설정값(튜닝 가능한 파라미터)**이며 하드코딩된 상수가 아니다. 기본값은 합리적 공학적 추정이고, Level 3(Learning Effect Validation) 파일럿 데이터로 조정하는 것을 전제로 한다.

---

## 0. 문서의 지위

- Tier C, Production 문서 로드맵의 2번 문서.
- `PROJECT_STATUS.md`상 Tier A(`GRAMMAR_GRAPH.md`, `PROGRESS_SCHEMA.md`, `CONCEPT_SCHEMA.md`)가 "정확한 계산식은 HOW 단계에서 정의한다"며 명시적으로 이 단계로 위임한 세 알고리즘(Review 간격, `confidence_inferred`, Depth)을 확정하는 문서다.
- 이 문서가 계산하는 값 중 사용자별로 저장되는 것은 없다 — 계산 결과는 `progress`의 이미 존재하는 컬럼(`state`, `confidence_inferred`, `next_review_at` 등)을 갱신하거나, Concept Mastery처럼 애초에 저장하지 않고 매번 계산한다.

---

## 1. 전제 — 확정된 알고리즘 결정

| 영역 | 결정 |
|---|---|
| Review 간격 계산 | State 연동 고정 간격 |
| `confidence_inferred` | 지수이동평균(EMA) |
| Concept Depth | 단순 평균 |

---

## 2. Grammar Graph 탐색 알고리즘

`grammar_relations` 테이블(`relation_type ∈ {PREREQUISITE, RELATED, CONTRAST, ALTERNATIVE}`) 위에서 정의한다. 아래 두 탐색은 오직 `PREREQUISITE` 관계만 따라간다.

### 2.1 선행 탐색 (Prerequisite Search)

노드 A로부터 시작해 A가 의존하는 선행 노드들을 찾는다.

```
prerequisite_search(node_id, max_depth):
    visited = {}
    frontier = [node_id]
    for depth in 1..max_depth:
        next_frontier = []
        for n in frontier:
            edges = grammar_relations WHERE from_node_id = n AND relation_type = 'PREREQUISITE'
            for e in edges:
                if e.to_node_id not in visited:
                    visited[e.to_node_id] = depth
                    next_frontier.append(e.to_node_id)
        frontier = next_frontier
    return visited
```

Review Cascade(5장)는 항상 `max_depth = 2`로 호출한다. 커리큘럼 설계·검증 목적의 일반 조회는 `max_depth`를 더 크게(또는 무제한) 줄 수 있다 — 이 알고리즘 자체는 깊이를 제한하지 않으며, 호출자가 깊이를 결정한다.

### 2.2 후행 탐색 (Dependent Search)

방향만 반대다: `to_node_id = node_id AND relation_type = 'PREREQUISITE'`를 따라 `from_node_id`를 수집한다. "이 노드를 아직 안 배우면 무엇이 막히는가"를 답하며, Production에서는 주로 커리큘럼 검증·5번째 Language Pack 설계 시 쓰인다(런타임 학습 흐름에서는 사용 빈도가 낮음).

### 2.3 순환 검증

새 `PREREQUISITE` 관계 `(from=X, to=Y)`를 추가하기 전, `prerequisite_search(Y, max_depth=무제한)` 결과에 `X`가 있는지 확인한다. 있다면 이 관계는 순환을 만들므로 거부한다. Language Pack Import/검증 파이프라인에서 매 관계 추가마다 실행한다.

---

## 3. State 전이 엔진

6단계: `NOT_INTRODUCED`(0) → `INTRODUCED`(1) → `STUDYING`(2) → `PRACTICING`(3) → `MASTERED`(4) → `AUTOMATIC`(5).

### 3.1 용어 구분(중요)

- **`progress.accuracy`**: 해당 노드에 대한 **전 기간 누적** 정답 비율. 리포팅·UX 표시용이며 아래 승격/퇴행 판정에는 쓰지 않는다.
- **윈도우 정확도(windowed accuracy)**: 판정 시점마다 `attempt_records`에서 `ORDER BY attempted_at DESC LIMIT N`으로 즉시 재조회해 계산하는 **최근 N회 한정** 정답 비율. 아래 모든 승격/퇴행 조건은 이 값을 쓴다. 저장하지 않는다.

### 3.2 승격 조건 (기본값, 튜닝 가능)

| 전이 | 조건 |
|---|---|
| `NOT_INTRODUCED → INTRODUCED` | `explicit_study_event_at`가 설정됨(유일 조건 — 게이팅 원칙, LEARNING_THEORY §6) |
| `INTRODUCED → STUDYING` | `attempt_records`에 해당 노드 시도 1건 이상 |
| `STUDYING → PRACTICING` | 최근 5회 윈도우 정확도 ≥ 0.6 |
| `PRACTICING → MASTERED` | 최근 10회 윈도우 정확도 ≥ 0.85 **AND** `confidence_inferred` ≥ 0.75 **AND** §3.2.1의 Spaced Review Evidence 조건 |
| `MASTERED → AUTOMATIC` | §3.2.2의 Spaced Review Evidence 조건(정답 + 응답시간) |

`difficulty_baseline_ms`(난이도별 기준 응답시간, 기본값 예시): `{1: 2000, 2: 3000, 3: 4000, 4: 5000, 5: 6000}`(ms). 고정 조회 테이블이며 population 통계 캐싱 같은 별도 인프라를 두지 않는다(단순성 우선순위).

한 번에 한 단계만 승격한다(단계 건너뛰기 없음) — 매 시도 후 현재 상태의 다음 단계 조건을 확인하는 방식으로 자연히 보장된다.

### 3.2.1 Spaced Review Evidence — `PRACTICING → MASTERED` (AUD-002, Frozen Core Standard Amendment)

**배경**: §3.1의 윈도우 정확도는 순수 횟수 기반이라, 한 번의 짧은 연속 시도(burst) 안에서 `PRACTICING → MASTERED → AUTOMATIC`이 전부 가능했다. 이는 LEARNING_THEORY의 Spaced Repetition 원칙(다섯 학습 원칙 중 하나, 모든 메커니즘이 최소 하나를 구현해야 함)을 이 State 전이 알고리즘이 표현하지 못한 것이었다 — 단발성 고득점이 아니라 간격이 벌어진 여러 복습에 걸친 안정성을 요구한다. `PROJECT_VISION.md` §6 의사결정 원칙에 따라 사용자 승인을 거쳐 Frozen Core Standard Amendment로 확정했다(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, `PROGRESS_SCHEMA.md` §3/§4/§6 동시 개정).

**Qualifying spaced review 정의**: 어떤 시도가 이루어진 시점(`attempted_at`)이, 그 시도 **직전**에 `progress.next_review_at`에 계산되어 있던 값 이후였던 경우를 가리킨다. 이는 §6.1의 State 연동 고정 간격을 그대로 재사용한다 — 별도의 세션 경계 개념이나 최소 경과 시간 임계치를 새로 도입하지 않는다(세션 경계는 `attempt_records`에 없는 개념이라 새 필드가 필요하고, 인위적으로 쪼개 우회하기도 쉬워 기각).

> **§6.1 상호참조(AUD-002 Scheduling Clarification)**: 이 비교의 기준값("직전"의 `next_review_at`)은 반드시 해당 attempt 처리 직전의 스냅샷이어야 하며, 같은 처리 안에서 새로 계산된 값과 비교하면 안 된다. `next_review_at`이 due 이전 자발적 연습으로는 갱신되지 않는다는 조건부 규칙(§6.1)도 이 정의가 성립하기 위한 전제다 — 그렇지 않으면 자주 연습하는 학습자일수록 spacing evidence를 영원히 충족하지 못하는 역설이 생긴다.

**추가 조건**: `PRACTICING → MASTERED` 승격 시, 최근 10회 윈도우 안에 qualifying spaced review가 **최소 3회** 있고, 그 3회 전부 정답이어야 한다.

> ⚠️ **`3`은 Provisional/tunable default다.** §3.2의 다른 임계값들과 동일한 성격이며, LEARNING_THEORY 원문에 정확한 수치가 명시되어 있지 않아(이 세션에 원문 미확보) 원칙(spacing 필수)만 확정이고 수치는 추후 조정 가능하다.

**저장 근거**: `attempt_records.is_spaced_review`(BOOLEAN) — 시도 처리 시점에 `attempted_at`을 그 순간의(갱신 전) `progress.next_review_at`과 비교해 즉시 계산·고정한다. `next_review_at`은 현재 예정 시점 하나만 보유하는 mutable current-state field이며, §6.1에 따라 조건부로 갱신되더라도 과거 각 attempt 처리 직전의 snapshot을 보존하지 않으므로 사후 재구성이 불가능하다 — 반드시 시도 시점에 저장해야 한다.

### 3.2.2 Spaced Review Evidence — `MASTERED → AUTOMATIC` (AUD-002, Frozen Core Standard Amendment)

`AUTOMATIC`은 이름 그대로 더 깊은 공고화를 뜻하므로, `MASTERED` 진입 시점의 spaced evidence를 재사용하지 않고 그 **이후** 시점부터 새로 카운트한다.

**조건**: `attempt_records.is_spaced_review = true` **AND** `attempted_at > progress.mastered_at`인 시도가 **2회 이상**이고, 각 시도가 정답이며 `avg_response_time_ms ≤ difficulty_baseline_ms(difficulty) × 0.7` 조건(§3.2의 기존 응답시간 기준)을 충족해야 한다.

`progress.mastered_at`(TIMESTAMPTZ, nullable)의 정의와 갱신 규칙은 `PROGRESS_SCHEMA.md` §3(Frozen 원 정의)을 따른다 — 요약: 현재 연속 `MASTERED` 구간의 시작 시점이며, state가 정확히 `MASTERED`가 되는 모든 전이(승격이든 퇴행 후 재진입이든 방향 무관)에서 `now()`로 갱신된다. `MASTERED` 아래로 퇴행해도 값 자체는 삭제하지 않고, 다음 `MASTERED` 진입 시 덮어쓴다 — 이 단일 규칙만으로 퇴행 후 재진입 시 이전 기간의 spaced evidence가 자동으로 제외된다(별도 삭제·특수 처리 불필요).

> **§6.1 상호참조(AUD-002 Scheduling Clarification)**: 여기서 세는 spaced review 2회도 §3.2.1과 동일하게 §6.1의 조건부 `next_review_at` 갱신 규칙·pre-update 스냅샷 비교 기준을 따른다 — 별도의 판정 기준을 두지 않는다.

### 3.3 퇴행 조건

매 시도 후, **현재 상태를 유지하기 위한 조건**(3.2의 승격 조건 중 자신이 이미 통과한 단계의 조건)을 더 이상 만족하지 못하면 한 단계 아래로 내린다. 예: `MASTERED` 상태인데 최근 10회 윈도우 정확도가 0.85 밑으로 떨어지면 `PRACTICING`으로 내려간다. 윈도우에 필요한 시도 수(예: 10회)가 아직 쌓이지 않았으면 판정을 보류한다(퇴행도 승격도 시키지 않음).

`state`는 "최고 도달 기록"이 아니라 "현재 상태"이므로, 퇴행 후 다시 조건을 만족하면 재승격도 동일 규칙으로 다시 일어난다.

---

## 4. Confidence 계산 (EMA)

### 4.1 신호값 (signal) — 이번 시도 하나를 0.0~1.0으로 압축

```
signal = 0.5 × is_correct
       + 0.2 × (1 − normalized_response_time)
       + 0.15 × (hint_used ? 0 : 1)
       + 0.15 × min(preceding_streak / 5, 1)
```

- `normalized_response_time = min(response_time_ms / difficulty_baseline_ms(difficulty), 1)`
- 가중치(0.5/0.2/0.15/0.15)는 기본값이며 정답 여부에 절반의 비중을 둔 것이 유일한 고정 원칙이다. 나머지는 튜닝 대상.

### 4.2 EMA 갱신

```
confidence_inferred_new = α × signal + (1 − α) × confidence_inferred_old
```

- 기본 `α = 0.3`. 매 시도마다 즉시 갱신되는 rolling 값(PROGRESS_SCHEMA가 명시한 정의와 일치)이라 `attempt_records`를 매번 스캔할 필요가 없다 — `progress.confidence_inferred` 컬럼을 그 자리에서 갱신하기만 하면 된다.
- 노드에 대한 첫 시도(`confidence_inferred_old`가 없음)는 `confidence_inferred_old = signal`로 초기화(사실상 α=1로 시작).

### 4.3 자기보고 보정

`confidence_self_reported`는 State **승격이 일어나는 시점**을 수집 체크포인트로 삼는다(구체적 UI 트리거는 `CLIENT_BRIEF.md`에서 정의). 값이 수집되면:

```
confidence_calibration_delta = confidence_self_reported − confidence_inferred
```

`confidence_self_reported`가 없으면 `confidence_calibration_delta`도 반드시 NULL(DATA_PERSISTENCE_BRIEF §3.6 제약과 동일).

---

## 5. 실수 처리 루프 & Review Cascade

GRAMMAR_GRAPH가 정의한 6단계 루프: **오답 발생 → 원인 분류 → 관련 노드 확인 → 선행 Prerequisite 탐색 → Cascade 생성 → 재시도/보류**.

### 5.1 원인 분류 (SELF / TRANSFER)

이 시도가 검사하던 노드를 `primary_node_id`(= `attempt_records.node_id`)라 한다. 해당 Content가 여러 노드의 조합(combination)이라면 `content.grammar_node_ids`에 다른 노드도 포함될 수 있다.

- Content의 `type_specific_metadata.error_attributed_node_id`(TEXT, nullable — **AC-011**로 키 이름 확정)에 오류 세그먼트를 특정 `grammar_node_id`로 귀속하는 진단 정보가 있고, 그 노드가 `primary_node_id`와 **다르면** → `TRANSFER`, 귀속된 그 노드를 대상으로 5.2 진행.
- 진단 정보가 없거나(`error_attributed_node_id` 부재 또는 `null`) 오류가 `primary_node_id` 자신에게 귀속되면(`error_attributed_node_id = primary_node_id`) → `SELF`(선행 탐색 생략, 현재 노드 반복 연습으로 처리).
- **기본값은 항상 SELF다** — 정밀 진단이 없는 한 TRANSFER로 함부로 판정해 불필요한 선행 탐색을 트리거하지 않는다.
- `error_attributed_node_id`는 이 Content 자신의 `grammar_node_ids`에 포함되지 않은 노드(예: 이 콘텐츠가 다루지 않는 먼 선행 노드)를 가리켜도 무방하다 — 5.2의 `prerequisite_search`는 귀속된 노드에서 그대로 출발한다. 다만 실존하는 `grammar_node_id`여야 하며, 이 무결성은 콘텐츠 저작·적재 시점에 검증한다(시도 처리 시점이 아님).
- **범위 제한(AC-011)**: 이 필드는 단일 노드만 담는다. 한 오답에서 여러 노드로 동시에 귀속하는 복수 진단은 이번 결정의 범위 밖이다 — §5.1·5.2 알고리즘 자체가 단수 대상("그 노드", "대상 노드")을 전제하므로, 복수 지원이 필요해지면 필드 확장이 아니라 이 절의 알고리즘을 바꾸는 별도 Architecture Clarification이 필요하다.

### 5.2 Cascade 생성

`TRANSFER`로 분류되면 Learning Flow Engine이 Review Engine `get_cascade`를 호출한다. `max_cascade_depth`는 호출부 하드코딩이 아니라 Engine 설정값을 전달하며 현재 기본값 2를 유지한다. Review Engine은 기존 Cascade 알고리즘·임계치를 그대로 적용해 대상 선행 노드 목록을 **계산**하고, Learning Flow Engine은 결과에서 `node_id` 목록만 추출해 Progress Engine `record_attempt.cascade_target_node_ids`로 전달한다(AUD-004).

Progress Engine은 Review Cascade를 계산하지 않는다. 전달받은 각 선행 노드 N에 대해 기존 `record_attempt` 트랜잭션 안에서 `cascade_jobs(status='PENDING')` producer 행을 기록한다. 이 계산 책임(Review)과 원자적 outbox 기록 책임(Progress)을 분리하며, Progress Engine은 Review/Graph Engine을 직접 호출하지 않는다.

Worker가 PENDING job을 후속 처리할 때 각 선행 노드 N에 대해:

- `progress(user, N)`가 존재하고 `state ≠ NOT_INTRODUCED`라면 → `next_review_at = now`로 즉시 갱신(다음 `get_due_reviews` 호출에 반드시 포함되도록 앞당긴다). 새로운 콘텐츠를 즉석 생성할지는 `AI_INTEGRATION_BRIEF.md`(4번 문서)의 몫.
- `progress(user, N)`가 `NOT_INTRODUCED`(아직 배운 적 없음)라면 → 이는 커리큘럼 순서 오류의 신호이므로 사용자에게 노출하지 않고 로그만 남긴다(재시도/보류 단계).

실제 대상 노드 `next_review_at` 변경, polling, retry/backoff, DONE/FAILED 전이는 Worker의 후속 효과이며 AUD-004 producer remediation 범위 밖이다(`API_LAYER_BRIEF.md` §5.2). 이번 Clarification은 기존 Cascade 알고리즘이나 임계치를 변경하지 않는다.

---

## 6. Review Scheduling

### 6.1 State 연동 고정 간격

| State | 간격(정답으로 이 상태를 유지/도달했을 때) |
|---|---|
| `INTRODUCED` | 1일 |
| `STUDYING` | 2일 |
| `PRACTICING` | 4일 |
| `MASTERED` | 9일 |
| `AUTOMATIC` | 21일 |

별도의 ease factor나 배율 누적을 두지 않는다 — State 자체가 이미 간격을 결정하므로 스키마 추가가 필요 없다(§1 결정 C의 핵심 이점).

**`next_review_at` 갱신 조건(AUD-002 Scheduling Clarification, Tier C Architecture Clarification — Tier A 필드 구조 변경 아님)**: 시도 후 State 전이 판정(3장)을 먼저 수행한 뒤, `next_review_at`을 재계산하는 경우는 다음 **둘 중 하나뿐**이다.

1. 이번 시도로 **State 전이**(승격 또는 퇴행)가 발생한 경우 — 새로 확정된 State의 간격 기준으로 `next_review_at = now + interval(새 State)`를 계산한다.
2. **State가 유지**되고, `attempted_at ≥ (시도 처리 직전) progress.next_review_at`인 경우 — due 이후 수행한 review로 간주해, 현재 State 간격 기준으로 `next_review_at = now + interval(현재 State)`를 재계산한다.

그 외(State 유지 **AND** `attempted_at < (시도 처리 직전) progress.next_review_at`) — due 이전의 자발적 조기 연습이다. 이 경우 **`next_review_at`을 변경하지 않는다.**

**비교 기준 시점(중요)**: 위 조건과 §3.2.1·§3.2.2의 `is_spaced_review` 판정은 모두 **"이 attempt를 처리하고 progress를 갱신하기 직전의 `next_review_at` 스냅샷"**을 기준으로 한다. 같은 attempt 처리 안에서 새로 계산된 `next_review_at`을 비교 기준으로 쓰면 안 된다 — 그러면 매번 자기 자신과 비교하는 오류가 된다.

**`next_review_at IS NULL`인 경우**: 해당 attempt는 `is_spaced_review = false`로 판정한다(비교 기준이 없으므로 안전한 기본값). State 전이가 발생했다면 §6.1의 규칙에 따라 그 이후 `next_review_at`이 새로 계산된다.

**이 규칙이 존재하는 이유**: 무조건 매 시도마다 재계산하면, due 이전에 자발적으로 추가 연습하는 사용자일수록 `next_review_at`이 계속 미래로 밀려나 오히려 spacing evidence를 영원히 충족하지 못하는 역설이 발생한다(자주 연습하는 학습자가 불이익을 받음). 위 조건부 규칙은 이를 막는다 — 예: `PRACTICING`(4일 간격) 상태에서 7/1에 `next_review_at=7/5`가 설정된 뒤, 7/3(이전, 유지)은 건드리지 않고 그대로 7/5, 7/6(이후) 도달 시에만 `qualifying` 판정과 함께 7/10으로 재계산된다.

### 6.2 `get_due_reviews` 우선순위

```
priority_score = overdue_days × (6 − state_ordinal)
```

같은 정도로 연체됐다면 낮은 State(덜 숙련된 지식)일수록 망각 위험이 크다고 보아 우선순위를 높인다. `state_ordinal`은 3.1이 아니라 `INTRODUCED=1 ~ AUTOMATIC=5` 척도(CONCEPT_SCHEMA §10.3과 동일 척도 재사용 — `NOT_INTRODUCED`는애초에 Review 대상이 아니므로 제외).

---

## 7. Concept Mastery 계산

### 7.1 Coverage

```
Coverage(user, concept) =
    |{ node ∈ grammar_nodes WHERE concept ∈ node.concept_ids AND node.language = L
       AND progress(user, node).state ≠ NOT_INTRODUCED }|
    ÷
    |{ node ∈ grammar_nodes WHERE concept ∈ node.concept_ids AND node.language = L }|
```

`grammar_nodes.concept_ids`의 GIN 인덱스(DATA_PERSISTENCE_BRIEF §5)로 분모·분자 모두 조회한다.

### 7.2 Depth (단순 평균)

```
Depth(user, concept) = mean( state_ordinal(progress(user, node)) for node in Coverage 분자 집합 ) / 5
```

`state_ordinal`: `INTRODUCED=1, STUDYING=2, PRACTICING=3, MASTERED=4, AUTOMATIC=5`(CONCEPT_SCHEMA §10.3). Coverage에 포함된(= Introduced 이상인) 노드만 대상이므로 분모가 0이 되는 경우(covered node 없음)는 Depth를 정의하지 않고 `null` 반환.

두 값 모두 저장하지 않고 매 호출마다 계산한다(CONCEPT_SCHEMA §9 이중 진실 소스 금지 원칙).

---

## 8. AI Generation 게이팅 & 4단계 사다리

### 8.1 `request_practice`의 `target_node_id` 선택 규칙 (AC-009, **Provisional**)

> ⚠️ **이 절은 여전히 Provisional이다.** `LEARNING_PROTOCOL.md`는 이미 확보됐으며, `start_session` 정책 순서는 그 문서 §4~§9의 기존 우선순위(`REVIEW → NEW_GRAMMAR → INTERLEAVING → CONVERSATION → IDLE`)를 canonical 근거로 사용한다. AC-013이 동시 진행 노드 수 제한을 Admission Gate로 해소했지만, AC-009의 `request_practice` 대상 선택 규칙 자체를 재상정하거나 `request_practice`와 `start_session`을 완전히 통합하는 것은 이번 범위 밖이다.

**AC-013 Active-Node Admission Gate**: active Grammar Node는 `(user_id, language)` 범위의 `progress.state ∈ {INTRODUCED, STUDYING}` 노드다. 같은 `concept_id`에 속해도 서로 다른 `node_id`면 각각 1개로 집계한다. Provisional/tunable 설정값의 현재 기본 limit은 **2**다.

이 limit은 Hard Invariant가 아니라 신규 `record_explicit_study`의 `NOT_INTRODUCED → INTRODUCED` 진입만 제한하는 Admission Gate다. 기존 노드의 합법적 상태 전이·퇴행은 제한하거나 왜곡하지 않는다. 퇴행으로 active count가 limit을 넘어도 **허용된 초과 상태**이며 데이터 오류가 아니다. 초과 상태가 해소될 시점은 보장하지 않으며, active count가 limit 미만이 될 때까지 신규 explicit study만 거부한다.

**AC-012 Conversation 경계 정합화**: Conversation 진입에는 `LEARNING_PROTOCOL.md` §9의 세 조건을 모두 사용한다. PRACTICING 이상 최소 노드 개수는 **Provisional/tunable 설정값, 현재 기본값 3**이다. `conversation_boundary_acknowledged=true`이면 해당 호출에서 CONVERSATION 재선택만 차단하며 위 우선순위의 다른 순서나 자격 조건은 바꾸지 않는다. acknowledgement는 요청 단위 사실이고 Progress/DB 상태가 아니다.

**AC-014 NEW_GRAMMAR 후보 선택(별도 population)**: `start_session`의 NEW_GRAMMAR 후보는 요청 language의 유효한 Grammar Node 중 Progress snapshot이 `NOT_INTRODUCED`이고 모든 prerequisite가 `MASTERED` 또는 `AUTOMATIC`인 node다. AC-013 active-count precheck를 통과한 뒤 `difficulty ASC → node_id ASC`로 정렬해 첫 node를 제안한다. prerequisite depth는 선택 기준으로 사용하지 않으며 `find_prerequisites`가 반환한 목록 길이를 depth로 오용하지 않는다.

이 population은 아래 AC-009 `request_practice` 대상 선택의 `INTRODUCED`/`STUDYING` population과 서로 다르다. NEW_GRAMMAR 미도입 후보 선택과 `request_practice`의 기존 학습 node 선택을 합치거나 한쪽의 정렬 규칙을 다른 쪽에 재사용하지 않는다.

`generate_problem`(`API_CONTRACT.md` §5.1, AC-005)이 요구하는 `target_node_id`를 Learning Flow Engine이 다음 순서로 결정한다.

1. **`target_concept_id`가 주어졌으면**: 그 Concept에 속한 노드로 후보를 좁힌 뒤 2~3을 적용한다.
2. **주 규칙**: 후보 중 `progress.state ∈ {INTRODUCED, STUDYING}`인 노드를 모아 `explicit_study_event_at DESC`(가장 최근에 명시적 학습을 시작한 노드)로 하나를 고른다. `updated_at`이 아니라 `explicit_study_event_at`을 쓰는 이유는, `updated_at`은 다른 노드의 시도 처리 등 무관한 갱신에도 변하지만 `explicit_study_event_at`은 "이 노드를 배우기 시작한 시점"만 순수하게 반영하기 때문이다(`DATA_PERSISTENCE_BRIEF.md` §3.6).
3. **대체 규칙**(2에 해당하는 노드가 하나도 없을 때): §6.2의 `get_due_reviews` 우선순위 공식(`priority_score = overdue_days × (6 − state_ordinal)`)을 `PRACTICING` 이상 노드에 그대로 적용해 최우선순위 노드를 선택한다 — 새 공식을 만들지 않고 기존 REVIEW 우선순위를 재사용한다.
4. 후보가 전혀 없으면(해당 언어에 진행 중인 노드 자체가 없음) `target_node_id` 없이 `target_concept_id`만으로 사다리 1~2단계를 시도한다 — 3단계(Content Engine)는 노드 특정 불가로 건너뛴다.

### 8.2 게이팅 기준 및 4단계 사다리

**최소 자격 기준(불변)**: 조합에 포함된 **모든** 노드의 `progress.state ∈ {PRACTICING, MASTERED, AUTOMATIC}`. 하나라도 미달이면 그 조합은 생성 후보에서 제외한다.

**4단계 사다리**(GRAMMAR_GRAPH 확정 사항 재확인, 순서대로 시도):

1. 조합 생성 — 목표 Concept과 관련된 여러 노드를 조합, 전원 자격 기준 통과 시에만
2. 실패 시 단일 노드 생성으로 완화
3. 실패 시 사전 제작 Content(`is_canonical=true`) 대체
4. 실패 시 Content Gap 신호 — 사용자 노출 없이 저작 필요 로그만 기록

각 단계의 "실패"는 해당 단계 조건을 만족하는 후보가 0개인 경우를 말한다. 실제 AI 호출 방식은 `AI_INTEGRATION_BRIEF.md`(4번 문서)에서 다룬다 — 이 문서는 "언제 어떤 단계로 내려가는가"의 판단 로직까지만 정의한다.

---

## 9. 정합성 확인

Tier A/`DATA_PERSISTENCE_BRIEF.md`와 대조한 결과 구조적 불일치는 발견되지 않았다. §3.1에서 명시한 대로 `progress.accuracy`(누적)와 윈도우 정확도(재계산)를 용도상 분리해 정의한 것 외에는 스키마 변경이 필요한 사항이 없다.

---

## 10. 다음 단계

3번 문서 `API_LAYER_BRIEF.md`로 진행한다 — 이 문서가 정의한 로직을 `API_CONTRACT.md`의 현재 26개 API(외부 5, 내부 21)로 어떻게 노출하는지, 인증·에러(`empty_result` vs `error`)·트랜잭션 경계를 정의한다.

---

## 11. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — Grammar Graph 탐색(선행/후행/순환검증) 알고리즘, State 전이 엔진(승격·퇴행 조건, 게이팅, Automatic 판정), Confidence EMA 공식(신호값·가중치·α), 자기보고 보정, 실수 처리 루프의 SELF/TRANSFER 분류 규칙과 Cascade 생성 로직(2-hop, next_review_at 앞당김), State 연동 고정 간격 스케줄링과 get_due_reviews 우선순위 공식, Concept Coverage/Depth 계산(단순 평균), AI Generation 4단계 사다리의 판단 로직 정의. 모든 임계치·가중치는 튜닝 가능한 엔진 설정값으로 명시 |
| 1.1 | 2026-07-08 | Phase 2 Learning Flow Engine 구현 중 발견(AC-009) — `request_practice`의 `target_node_id`(AC-005) 결정 시 동일 언어에 `INTRODUCED`/`STUDYING` 노드가 여럿이면 어떤 것을 고를지 규칙이 없어 구현이 막혔음을 확인. `LEARNING_PROTOCOL.md`(Missing Input Document)의 Learning State Assessment 전체가 필요한 게 아니라 이 좁은 범위만 필요하다고 판단해 §8.1을 **Provisional**로 신설 — `explicit_study_event_at DESC` 우선, 없으면 §6.2 REVIEW 우선순위 공식 재사용(새 공식 발명 없음). 기존 §8 내용은 §8.2로 이동(제목 중복 정리) |
| 1.2 | 2026-07-08 | Validation Level 3 Readiness Plan 검토 중 발견(AC-011) — §5.1이 "Content의 type_specific_metadata에 오류 세그먼트를 특정 grammar_node_id로 귀속하는 진단 정보"라는 개념은 이미 서술했지만 구체적 JSON 키 이름이 없어 코드 배선은 완료돼도 TRANSFER 경로를 활성화할 수 없었음을 확인. `error_attributed_node_id`(TEXT, nullable) 키 이름 확정 — content 자신의 grammar_node_ids 밖 노드 참조 허용, 복수 오류 세그먼트는 이번 결정 범위 밖(알고리즘 확장이 필요해 별도 AC 대상)으로 명시 |
| 1.3 | 2026-07-13 | Independent Architecture Audit(AUD-002)에서 발견 — §3.2의 승격 조건이 순수 윈도우 정확도(횟수 기반)만 써서, 한 번의 짧은 연속 시도(burst) 안에서 PRACTICING→MASTERED→AUTOMATIC이 전부 가능했음을 확인. 이는 LEARNING_THEORY의 Spaced Repetition 원칙을 State 전이 알고리즘이 표현하지 못한 것으로 판정 — **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, `PROGRESS_SCHEMA.md` §3/§4/§6 동시 개정)로 §3.2.1(PRACTICING→MASTERED)·§3.2.2(MASTERED→AUTOMATIC) 신설. Qualifying spaced review를 기존 `next_review_at` 인프라 재사용으로 정의(새 세션 경계 개념 도입 안 함). `attempt_records.is_spaced_review`·`progress.mastered_at` 두 필드 신규 채택(`DATA_PERSISTENCE_BRIEF.md` v1.9와 연동). 최소 spaced review 횟수(MASTERED 3회, AUTOMATIC 2회)는 Provisional/tunable default로 명시 |
| 1.4 | 2026-07-13 | AUD-002 Scheduling/Evidence Clarification(Tier C Architecture Clarification — Tier A 필드 구조 변경 아님) — §6.1의 "모든 시도 후 무조건 next_review_at 재계산" 규칙이, due 이전 자발적 조기 연습을 하는 학습자일수록 next_review_at이 계속 미래로 밀려나 spacing evidence를 영원히 충족 못하는 역설을 만든다는 것을 발견(자주 연습하는 학습자가 불이익을 받는 구조). §6.1을 조건부 갱신 규칙으로 개정 — State 전이 발생 시 또는 `attempted_at ≥ 갱신 전 next_review_at`(due 이후)인 경우만 재계산, due 이전 조기 연습은 next_review_at 유지. 비교 기준은 반드시 "처리 직전 스냅샷"이어야 하며 같은 attempt 안에서 재계산된 값과 비교 금지. `next_review_at IS NULL`이면 `is_spaced_review=false`로 안전 처리. §3.2.1·§3.2.2에 이 규칙 상호참조 추가(정의 자체는 불변) |
| 1.5 | 2026-07-13 | Wording-only 정정(알고리즘·결정 변경 없음) — §3.2.1 "저장 근거"가 v1.4의 조건부 갱신 규칙 반영 후에도 "매 시도마다 덮어써지는 단일 현재값"이라는 v1.3 이전 표현을 그대로 남기고 있어 §6.1과 불일치했던 것을 정정. "현재 예정 시점 하나만 보유하는 mutable field, 과거 snapshot 미보존이라 사후 재구성 불가"로 표현만 교체 |
| 1.6 | 2026-07-17 | AUD-004 Tier C Architecture Clarification 승인 반영 — Review Engine의 Cascade 계산, Learning Flow의 node_id 추출·전달, Progress Engine의 동일 트랜잭션 PENDING outbox producer 책임을 구분. `max_cascade_depth`는 설정값(기본 2) 사용, 실제 next_review_at 변경과 Worker 상태 전이는 범위 밖임을 명시. 기존 Cascade 알고리즘·임계치 변경 없음 |
| 1.7 | 2026-07-17 | AC-012 Tier C Architecture Clarification — §8.1의 stale `LEARNING_PROTOCOL.md Missing Input Document` 표현을 확보 완료 상태로 정정하고, start_session의 canonical 우선순위, Conversation PRACTICING+ 최소 기본값 3(Provisional/tunable), acknowledgement=true의 CONVERSATION-only 재선택 차단을 명시. AC-009는 동시 진행 노드 수 제한 미확정으로 여전히 Provisional이며 전체 통합은 별도 clarification 대기 |
| 1.8 | 2026-07-18 | AC-013 Tier C Architecture Clarification — 동시 진행 노드 수 제한을 Hard Invariant가 아닌 `(user_id, language)` 범위의 Active-Node Admission Gate로 확정. active=`INTRODUCED`/`STUDYING`, Grammar Node 단위 집계, Provisional/tunable 기본 limit 2, 퇴행으로 인한 허용된 초과 상태와 신규 explicit study만 거부하는 규칙을 명시. AC-009 자체 재상정은 범위 밖 |
| 1.9 | 2026-07-19 | AC-014 Tier C Architecture Clarification — §8.1에 `start_session` NEW_GRAMMAR의 `NOT_INTRODUCED`+prerequisite 충족 population과 `difficulty ASC → node_id ASC` 정렬을 추가. prerequisite depth 및 `find_prerequisites` 목록 길이는 선택 기준이 아님을 명시하고, AC-009 `request_practice`의 INTRODUCED/STUDYING population과 통합하지 않도록 경계를 확정 |
