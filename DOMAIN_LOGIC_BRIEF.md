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
| `PRACTICING → MASTERED` | 최근 10회 윈도우 정확도 ≥ 0.85 **AND** `confidence_inferred` ≥ 0.75 |
| `MASTERED → AUTOMATIC` | 최근 10회 윈도우 정확도 ≥ 0.85 **AND** `avg_response_time_ms` ≤ `difficulty_baseline_ms(difficulty) × 0.7` |

`difficulty_baseline_ms`(난이도별 기준 응답시간, 기본값 예시): `{1: 2000, 2: 3000, 3: 4000, 4: 5000, 5: 6000}`(ms). 고정 조회 테이블이며 population 통계 캐싱 같은 별도 인프라를 두지 않는다(단순성 우선순위).

한 번에 한 단계만 승격한다(단계 건너뛰기 없음) — 매 시도 후 현재 상태의 다음 단계 조건을 확인하는 방식으로 자연히 보장된다.

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

- Content의 `type_specific_metadata`에 오류 세그먼트를 특정 `grammar_node_id`로 귀속하는 진단 정보가 있고, 그 노드가 `primary_node_id`와 **다르면** → `TRANSFER`, 귀속된 그 노드를 대상으로 5.2 진행.
- 진단 정보가 없거나 오류가 `primary_node_id` 자신에게 귀속되면 → `SELF`(선행 탐색 생략, 현재 노드 반복 연습으로 처리).
- **기본값은 항상 SELF다** — 정밀 진단이 없는 한 TRANSFER로 함부로 판정해 불필요한 선행 탐색을 트리거하지 않는다.

### 5.2 Cascade 생성

`TRANSFER`로 분류되면 대상 노드에 대해 `prerequisite_search(대상_node_id, max_depth=2)`를 실행한다. 결과로 나온 각 선행 노드 N에 대해:

- `progress(user, N)`가 존재하고 `state ≠ NOT_INTRODUCED`라면 → `next_review_at = now`로 즉시 갱신(다음 `get_due_reviews` 호출에 반드시 포함되도록 앞당긴다). 새로운 콘텐츠를 즉석 생성할지는 `AI_INTEGRATION_BRIEF.md`(4번 문서)의 몫.
- `progress(user, N)`가 `NOT_INTRODUCED`(아직 배운 적 없음)라면 → 이는 커리큘럼 순서 오류의 신호이므로 사용자에게 노출하지 않고 로그만 남긴다(재시도/보류 단계).

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

시도 후 **State 전이 판정(3장)을 먼저 수행하고, 그 결과로 확정된(승격/퇴행/유지) State를 기준으로** `next_review_at = now + interval(해당 State)`를 계산한다. 별도의 ease factor나 배율 누적을 두지 않는다 — State 자체가 이미 간격을 결정하므로 스키마 추가가 필요 없다(§1 결정 C의 핵심 이점).

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

3번 문서 `API_LAYER_BRIEF.md`로 진행한다 — 이 문서가 정의한 로직을 `API_CONTRACT.md`의 18개 API로 어떻게 노출하는지, 인증·에러(`empty_result` vs `error`)·트랜잭션 경계를 정의한다.

---

## 11. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — Grammar Graph 탐색(선행/후행/순환검증) 알고리즘, State 전이 엔진(승격·퇴행 조건, 게이팅, Automatic 판정), Confidence EMA 공식(신호값·가중치·α), 자기보고 보정, 실수 처리 루프의 SELF/TRANSFER 분류 규칙과 Cascade 생성 로직(2-hop, next_review_at 앞당김), State 연동 고정 간격 스케줄링과 get_due_reviews 우선순위 공식, Concept Coverage/Depth 계산(단순 평균), AI Generation 4단계 사다리의 판단 로직 정의. 모든 임계치·가중치는 튜닝 가능한 엔진 설정값으로 명시 |
