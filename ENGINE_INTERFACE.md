# ENGINE_INTERFACE.md
## LLE Engine Interface & Responsibility (Tier C)

> 이 문서는 구현(HOW)이 아니라 **Contract와 Responsibility**만 정의한다. 특정 프로그래밍 언어·프레임워크·라이브러리는 전혀 언급하지 않는다. 각 Engine의 실제 동작 규칙(알고리즘)은 GRAMMAR_GRAPH.md(Tier A)에 이미 정의되어 있으며, 이 문서는 그 규칙을 다시 설명하지 않고 **"누가 무엇을 책임지고, 누구를 호출할 수 있으며, 무엇을 하면 안 되는가"**만 규정한다.

문서 계층: Tier A(GRAMMAR_GRAPH 등) → **Tier C `ENGINE_INTERFACE.md`(이 문서)** → Tier C `API_CONTRACT.md`(다음 문서, 이 문서의 Engine 경계를 전제로 입출력 필드를 정의)

---

## 0. 문서의 지위

- 이 문서가 정의한 Engine 경계는 API_CONTRACT.md가 그대로 전제한다. 이 문서에서 경계가 바뀌면 API_CONTRACT.md도 함께 개정해야 한다.
- 이 문서는 각 Engine이 **"하지 않는 일"**을 특히 명확히 규정한다 — Engine 간 책임이 섞이는 것을 막는 것이 이 문서의 핵심 목적이다.
- 구현 단계(HOW)에서 이 경계를 넘나드는 코드가 발견되면, 그것은 구현의 문제가 아니라 **이 문서 위반**으로 간주한다.

**API_CONTRACT.md 작성 원칙(사전 확정)**: API_CONTRACT.md는 각 Engine의 **내부 구현을 노출하지 않는다.** "무엇을 입력하면 무엇이 나오는가"만 정의하며, Graph 탐색 방식, Cascade 계산 방식, Generation 알고리즘 자체는 그 문서에 포함하지 않는다. 알고리즘의 책임 소재는 이 문서와 GRAMMAR_GRAPH.md에 있다 — API_CONTRACT.md는 그 알고리즘의 결과가 어떤 모양(입출력 필드)으로 오가는지만 다룬다.

---

## 1. 목적

LLE는 8개 Engine으로 구성된다: Learning Flow, Graph, Progress, Generation, AI Generation, Content, Review, Interleaving. 이 문서는 이 8개 각각에 대해 책임·입출력·호출 관계·금지 사항을 규정해, 향후 여러 사람(또는 여러 AI 세션)이 나눠서 구현하더라도 경계가 흐트러지지 않게 한다.

---

## 2. Engine 호출 계층도 (Call Hierarchy)

### 2.1 주 오케스트레이션 흐름

```
Learning Flow Engine
├── Graph Engine
├── Progress Engine
├── Generation Engine
│   ├── AI Generation Engine
│   └── Content Engine
├── Review Engine
└── Interleaving Engine
```

이 다이어그램은 Learning Flow Engine이 한 사용자의 학습 흐름을 진행시킬 때 **직접 조율하는** 하위 Engine 관계를 보여준다.

**예외 경로**: Learning Flow Engine은 Content Engine도 직접 호출할 수 있다 — 명시적 학습 단계에서 문제 생성과 무관하게 레슨 설명(`EXPLANATION` 콘텐츠)을 보여줘야 하기 때문이다(GRAMMAR_GRAPH §4.4). 다이어그램에는 편의상 Generation Engine 아래에만 표기했지만, Content Engine의 실제 호출 주체는 **Generation Engine(사다리 3단계, `EXAMPLE` 조회)과 Learning Flow Engine(레슨 설명, `EXPLANATION` 조회) 둘 다**이다. 이는 "부모가 자식을 직접 호출"하는 것이지 형제 간 호출이 아니므로 2.2의 규칙을 위반하지 않는다.

**AC-017 Pattern A 저장 경로**: AI 생성 Content는 Generation Engine이 오케스트레이션하고 Content Engine이 유일한 쓰기 경로를 소유한다. AI Generation Engine은 provider 결과를 검증해 Layer 2 candidate만 반환하고 Content Engine을 직접 호출하지 않는다. Generation Engine은 candidate를 받아 Content Engine의 `save_generated_content`를 호출한 뒤, 그 canonical 반환 projection을 재계산 없이 Layer 3 public `content`로 사용한다.

### 2.2 호출 방향 규칙

- **상위(부모)만 하위(자식)를 호출한다. 자식은 부모를 호출하지 않는다** — 순환 호출 금지.
- **형제 Engine끼리는 직접 호출하지 않는다.** 예: AI Generation Engine은 Content Engine을 직접 부르지 않는다. 반드시 공통 부모인 Generation Engine을 거친다.
- **Graph Engine, Progress Engine, Content Engine은 리프(leaf) Engine이다.** 이 셋은 어떤 Engine도 호출하지 않는다 — 가장 아래층의 순수 조회/저장 계층이기 때문이다.
- **Progress Engine에 대한 쓰기는 오직 Progress Engine 자신을 통해서만 이루어진다.** 다른 Engine은 "상태를 바꿔달라"는 요청만 보낼 뿐, 데이터를 직접 조작하지 않는다(GRAMMAR_GRAPH §8 단일 쓰기 경로 원칙).

### 2.3 교차 읽기 의존 관계 (Cross-Cutting Read Dependencies)

**2.1의 트리는 오케스트레이션 순서일 뿐, "Graph Engine과 Progress Engine이 한 번씩만 쓰인다"는 뜻이 아니다.** 이 둘은 여러 Engine이 공통으로 읽는 유틸리티 계층이다. 실제 읽기 의존은 아래와 같다.

| 호출하는 Engine | Graph Engine 읽기 | Progress Engine 읽기 |
|---|---|---|
| Learning Flow Engine | O | O (상태 전이 **요청**도 포함 — 실제 쓰기는 Progress Engine 자신이 수행) |
| Review Engine | O (선행 탐색) | — (필요한 상태는 입력으로 전달받음) |
| AI Generation Engine | O (node metadata·Concept membership·ALTERNATIVE 조회 및 선택 결과 검증) | O (Practicing 이상 필터·최근 시도 조합 조회) |
| Interleaving Engine | O (CONTRAST/RELATED 관계 조회) | — |
| Generation Engine | — (자식에게 위임, 직접 조회하지 않음) | — (자식에게 위임) |
| Content Engine | — | — |

---

## 3. Learning Flow Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 사용자 × 노드 조합의 전체 생애주기(NOT_INTRODUCED→AUTOMATIC) 진행을 조율. 실수 처리 루프 6단계(GRAMMAR_GRAPH §4.2) 전체를 오케스트레이션. 어떤 하위 Engine을 어떤 순서로 호출할지 결정하는 최상위 진입점. **AUD-004: `submit_attempt`에서 Content metadata로 SELF/TRANSFER를 판정하고, TRANSFER이면 Review Engine `get_cascade` 결과의 `node_id` 목록만 추출해 Progress Engine `record_attempt.cascade_target_node_ids`로 전달한다. AC-012: `start_session`에서 LEARNING_PROTOCOL의 전체 우선순위 사슬을 평가하고, `conversationBoundaryAcknowledged=true`이면 해당 호출에서 CONVERSATION만 재선택하지 않는다. AC-013: `record_explicit_study` 전 `get_active_learning_count`로 NEW_GRAMMAR 후보를 read-only precheck한다. AC-014: 다른 Engine의 canonical API 결과만 조합해 NEW_GRAMMAR·INTERLEAVING 후보와 payload를 결정한다** |
| **2. 하지 않는 일** | 상태를 직접 변경하지 않는다(Progress Engine에 요청). 선행 관계를 직접 탐색하지 않는다(Graph Engine에 위임). 복습 대상을 직접 계산하지 않는다(Review Engine에 위임). 문제/문장을 직접 만들지 않는다(Generation Engine에 위임). Conversation acknowledgement를 저장하거나 그 사실만으로 Progress를 변경하지 않는다. Conversation Engine을 신설·대행하지 않는다. `progress`·`grammar_nodes`·`concepts` 테이블을 직접 조회하지 않고 다른 Engine의 canonical API만 호출한다. NEW_GRAMMAR 후보 admission을 직접 강제하지 않는다 |
| **3. 입력 데이터** | 사용자 액션 이벤트 — 명시적 학습 시작(`start_explicit_study`), 인출 시도 제출·결과(`submit_attempt`), 연습 문제 요청(`request_practice`), 자기보고 Confidence(`submit_self_reported_confidence`), **세션 시작(`start_session`, historical draft `MIGRATION_GUIDE_ENTRIES_004_005.md` Entry 005 — 2026-07-07 신설; optional `conversationBoundaryAcknowledged`, canonical `MIGRATION_GUIDE.md` Entry 005 / AC-012)**. 이 5개가 외부에 노출되는 API 전부다(API_CONTRACT.md §10.1~10.5) |
| **4. 출력 데이터** | 사용자에게 다음에 보여줄 화면 구성 지시(어떤 하위 Engine의 결과를 어떤 순서로 조합할지), Progress Engine에 대한 상태 전이 요청 |
| **5. 호출 가능한 하위 Engine** | Graph Engine, Progress Engine, Generation Engine, Review Engine, Interleaving Engine, **Content Engine**(명시적 학습 단계에서 EXPLANATION 콘텐츠를 직접 조회하기 위한 예외적 직접 호출, GRAMMAR_GRAPH §4.4 / `submit_attempt` 처리 중 `content_id` 단독 조회로 SELF/TRANSFER 진단 정보를 얻기 위한 예외적 직접 호출, AC-008 2026-07-08 Resolved) |
| **6. 의존하면 안 되는 Engine** | 없음(최상위 진입점). 단, **다른 어떤 Engine으로부터도 호출되어서는 안 된다** — 이 Engine은 오직 최초 진입점 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §4(Learning Flow Engine, 실수 처리 루프) |
| **8. 향후 구현 시 주의사항** | 오케스트레이션만 하는 "얇은 조정자"로 유지해야 한다. 실제 판단 로직이 이 Engine 안으로 스며들면(예: 여기서 직접 필터링·계산을 시작하면) God Object가 되어 2장의 책임 분리가 무의미해진다. **Review 호출의 `max_cascade_depth`를 하드코딩하지 않고 Engine 설정값을 전달한다(현재 기본값 2 유지, AUD-004). AC-012의 PRACTICING+ 최소 기준 기본값 3도 Engine 설정값으로 소비한다. §9 검증 전 REVIEW·NEW_GRAMMAR·INTERLEAVING·CONVERSATION·IDLE 전체 `start_session` 경로를 production 코드로 구현해야 하며, CONVERSATION-only 부분 구현이나 다른 분기의 production mock은 허용하지 않는다** |

**AC-012 경계 책임**: `conversationBoundaryAcknowledged`는 요청 단위 사실이며 Learning Flow Engine이나 다른 Engine의 저장 상태가 아니다. `true`일 때 동일 호출에서 CONVERSATION을 재선택하지 않되, 기존 우선순위의 다른 action은 계속 평가한다. Conversation Engine 자체는 이번 Clarification에서 설계·구현하지 않는다.

**AC-013 admission 책임 분리**: Learning Flow Engine의 `get_active_learning_count(user_id, language)` 호출은 NEW_GRAMMAR 후보 판단을 위한 read-only precheck이다. precheck과 write 사이에 경쟁이 생길 수 있으므로 최종 admission 권한은 Progress Engine의 `recordExplicitStudy`에 있다. capacity 경쟁으로 `CONTRACT_VIOLATION`이 발생하면 최신 판단을 위해 `start_session`을 재호출할 수 있다.

**AC-014 NEW_GRAMMAR 결정 순서**:

1. Graph Engine `list_nodes_by_language`로 language node metadata를 조회한다.
2. Progress Engine `get_progress_snapshot`으로 같은 language node 전체의 상태를 조회한다.
3. `NOT_INTRODUCED` 후보만 남긴다.
4. Graph Engine `find_prerequisites`로 각 후보의 prerequisite를 조회한다.
5. snapshot에서 prerequisite가 모두 `MASTERED` 또는 `AUTOMATIC`인지 확인한다.
6. Progress Engine `get_active_learning_count`로 AC-013 capacity를 read-only precheck한다.
7. admissible 후보를 `difficulty ASC → node_id ASC`로 정렬해 첫 후보를 선택한다.
8. `{next_action:"NEW_GRAMMAR", node_id}`를 반환한다.

`find_prerequisites` 결과의 목록 길이를 prerequisite depth로 해석하지 않는다. `start_session`은 후보만 제안하고 final admission은 별도 `start_explicit_study` 경로의 Progress Engine이 담당한다.

**AC-014 INTERLEAVING 선택 단계**: `eligible pool → admissible selected set → occurrence multiset → sequence_nodes` 네 단계를 분리한다.

- Eligible pool은 `(user_id, language)`의 `INTRODUCED`/`STUDYING` 전체이며 임의 크기 상한이 없다.
- Admissible selected set `S`의 크기는 2 또는 3이다. 모든 Category `c`에 대해 `count(c,S) <= floor(|S|/2)`, 즉 `violation(c,S) = max(0, count(c,S) - floor(|S|/2)) = 0`이어야 한다. 다중 Category node는 자신이 속한 모든 Category count에 각각 1회 기여하고 Category가 없는 node는 어떤 count에도 기여하지 않는다.
- 모든 `C(n,2)+C(n,3)` 조합에서 `(-|S|, -contrast_pair_count(S), -category_diversity(S), sorted_node_id_array(S))`의 lexicographic 최솟값을 선택한다. 따라서 크기 3, CONTRAST 고유 node pair 수, Category 합집합 크기 순으로 우선하고 마지막에는 정렬된 node ID 배열을 element-wise 비교한다.
- admissible set이 없거나 selected node가 0/1개면 오류나 `CONTRACT_VIOLATION`이 아니라 INTERLEAVING을 건너뛰고 CONVERSATION을 평가한다.
- `base_repeats=2`, `max_batch_size=6`이다. selected node마다 정확히 2 occurrence를 만들어 2개 선택 시 batch 4, 3개 선택 시 batch 6으로 구성한 뒤 `sequence_nodes`에 전달한다.

**Session Budget mode**: 현재 `SESSION_BUDGET_MODE='UNBOUNDED_UNTIL_INPUT_AVAILABLE'`이며 지원되는 값은 이것 하나뿐이다. NEW_GRAMMAR와 CONVERSATION이 공유하고 INTERLEAVING batch 크기와는 별개다. `REAL_INPUT`은 향후 예약 개념이며 현재 허용값이 아니다.

---

## 4. Graph Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | Grammar Graph 구조 조회·순회 제공: 선행 탐색/후행 탐색, 순환 검증, Concept-Node 정합성 검증(GRAMMAR_GRAPH §2~3). **Language boundary 검증 — `grammar_relations`의 same-language invariant 위반 탐지(`GRAMMAR_SCHEMA.md` §6, `GRAMMAR_GRAPH.md` §3, AUD-003 2026-07-13 신설)**, 배포 전 정적 검증(`validate_language_pack`)의 일부로 수행. AC-014 내부 read API `list_nodes_by_language`와 `get_concept_categories`로 정적 graph/grammar metadata를 제공. **AC-015 내부 read API `get_node_language_and_concepts`로 Interleaving Engine과 AI Generation Engine에 node별 `language`·`concept_ids` 조회 경로를 제공한다(caller: 이 두 Engine만)** |
| **2. 하지 않는 일** | 사용자 Progress를 조회·저장하지 않는다. 노드 상태에 따른 필터링 판단을 하지 않는다(Practicing 이상 여부는 호출자가 Progress Engine 결과와 조합해 판단). "이 노드를 복습해야 한다"거나 "생성해야 한다" 같은 정책적 판단을 내리지 않는다 — 순수 구조 조회만 한다. **`get_node_language_and_concepts`는 mixed-language를 판정하거나 거부하지 않는다 — 실제 값을 그대로 반환할 뿐이다(AC-015)** |
| **3. 입력 데이터** | 노드 ID, 탐색 방향(선행/후행), 최대 깊이(max_depth) |
| **4. 출력 데이터** | 노드 ID 목록(경로 순서 포함), 순환 검증 결과, Concept-Node 정합성 검증 결과, **`language_boundary_violations` 목록(AUD-003)**, language별 `{node_id, difficulty, concept_ids}` metadata, `{concept_id: category}` map, **입력 node_id마다 `{language, concept_ids}`를 담은 동적 map(AC-015, `get_node_language_and_concepts`)** |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부. Graph Engine은 어떤 상위 Engine도 호출해서는 안 된다 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §2, §3 |
| **8. 향후 구현 시 주의사항** | "상태가 입혀진 그래프"(State-Colored Graph, GRAMMAR_GRAPH §2)는 이 Engine이 만들지 않는다. 호출자가 이 Engine의 순수 구조 결과와 Progress Engine의 상태 결과를 **조합**해야 한다. Graph Engine 자체가 Progress를 알게 되는 순간 재사용성이 떨어진다. **선행/후행 탐색·관계 조회 함수는 항상 시작 노드의 `language`를 벗어난 노드를 반환하지 않도록 구현해야 한다(defense-in-depth, `GRAMMAR_GRAPH.md` §3, AUD-003) — 배포 전 검증(same-language invariant)이 이미 이를 막았다는 것을 신뢰하지 않고 이중으로 방어한다** |

---

## 5. Progress Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 사용자별 진행 상태(State, Accuracy, Confidence, Response Time, AttemptRecord)에 대한 **유일한 쓰기 경로**. Coverage/Depth 계산 제공. 다음 복습 시점 계산(GRAMMAR_GRAPH §8). **AUD-004: `record_attempt`의 동일 트랜잭션에서 전달받은 Cascade 대상별 `cascade_jobs(status='PENDING')` producer 행을 기록한다. AC-013: 내부 read API `get_active_learning_count`를 제공하고 `recordExplicitStudy`에서 Active-Node Admission Gate를 최종 원자적으로 강제한다. AC-014: `get_progress_snapshot`과 `get_practicing_plus_count` read API를 제공한다. AC-017: AI Generation Engine 전용 read API `get_recent_attempted_combinations`로 최근 content-linked attempt 조합을 고정 window 20에서 제공한다** |
| **2. 하지 않는 일** | Grammar Graph를 순회하지 않는다(Graph Engine의 역할). 어떤 문제를 생성할지 결정하지 않는다. 복습 대상 노드를 스스로 선정하지 않는다(Review Engine이 이 Engine의 조회 결과를 활용해 판단) |
| **3. 입력 데이터** | 사용자 ID, 노드 ID, 이벤트 유형(명시적 학습/시도 결과/자기보고 Confidence), 원시 AttemptRecord 필드, **Learning Flow Engine이 내부 전달하는 `cascade_target_node_ids?: string[]`(외부 HTTP 입력 아님, AUD-004)** |
| **4. 출력 데이터** | 현재 State, Accuracy, Confidence(inferred/self-reported/calibration), 다음 복습 시점, Concept별 Coverage/Depth, **복습 기한이 도래한 노드 배치 조회 결과(`get_due_reviews`, API_CONTRACT §4.7)**, `(user_id, language)` active Grammar Node 수(`get_active_learning_count`, §4.8), 입력 node 전체의 state map(`get_progress_snapshot`, §4.9), PRACTICING/MASTERED/AUTOMATIC count(`get_practicing_plus_count`, §4.10), 최근 content-linked attempt의 exact `{content_id, grammar_node_ids, attempted_at}` 배열(`get_recent_attempted_combinations`, §4.11, 최대 20개) |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §4.2, §8, LEARNING_THEORY C8/C9, GRAMMAR_SCHEMA §5 |
| **8. 향후 구현 시 주의사항** | 다른 Engine이 이 Engine을 우회해 Progress 데이터에 직접 쓰기 접근을 하지 못하도록 **접근 제어 자체를 구현 레벨에서 강제**해야 한다. "요청은 받되 쓰기는 스스로 한다"는 원칙이 코드 구조에도 반영되어야 한다. Cascade 대상 존재성 검증·attempt 삽입·progress 갱신·PENDING job 삽입은 동일 DB client/transaction으로 원자 처리한다. Progress Engine은 이를 위해 Review/Graph/Learning Flow Engine을 호출하거나 import하지 않는다(AUD-004) |

**AC-013 `recordExplicitStudy` 최종 enforcement**: 별도 read API를 호출하지 않고 하나의 `pool.connect()` client와 하나의 transaction을 사용한다. `BEGIN` 후 Grammar Node 존재성과 canonical language를 조회하고, `SELECT pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))`로 `(user_id, language)` admission을 직렬화한다. 동일 `(user_id, node_id)` Progress가 이미 있으면 capacity와 무관하게 기존 state를 반환하고 `COMMIT`한다. 없으면 동일 client에서 authoritative active count를 조회하고, `active_count >= configured_limit`이면 `CONTRACT_VIOLATION`으로 전체 `ROLLBACK`, 여유가 있으면 `INTRODUCED` Progress를 삽입한 뒤 `COMMIT`한다. 모든 예외는 `ROLLBACK`하고 `finally`에서 client를 release한다.

lock은 transaction-scoped blocking advisory lock만 사용하며 `COMMIT`/`ROLLBACK` 시 자동 해제된다. session-scoped lock과 try-lock은 사용하지 않고, `recordAttempt`는 이 lock을 획득하지 않는다. hash collision은 correctness 오류가 아니라 불필요한 직렬화만 유발한다. Progress Engine의 **호출 가능한 하위 Engine 없음(리프)** 규칙은 그대로 유지된다.

**AC-014 Progress read 책임**: `get_progress_snapshot`은 하나의 read client에서 모든 `grammar_nodes` 존재성과 language 일관성을 검증하고 Progress 행이 없는 유효 node를 `NOT_INTRODUCED`로 채운다. `get_practicing_plus_count`는 요청 language의 `PRACTICING`·`MASTERED`·`AUTOMATIC`만 집계한다. 두 API 모두 다른 Engine을 호출하지 않아 Progress Engine의 leaf 구조를 유지한다.

**AC-017 최근 시도 조합 책임**: `get_recent_attempted_combinations`는 Progress Engine만 SQL을 소유하고 `(user_id, language)`에 대해 `attempt_records ar JOIN grammar_nodes gn ON gn.node_id=ar.node_id JOIN content c ON c.content_id=ar.content_id`를 조회한다. 해당 user, attempt 귀속 node의 요청 language, `ar.content_id IS NOT NULL`만 `ar.attempted_at DESC, ar.attempt_id ASC`, `LIMIT 20`으로 읽고 exact `{content_id,grammar_node_ids,attempted_at}` 배열을 반환한다. window 20은 AC-017이 확정한 Tier C fixed window이며 `attempted_at`은 ISO-8601 string이다. AI Generation Engine은 candidate/history node 배열을 각각 dedupe·사전순 정렬한 뒤 원소 단위 exact equality로 조합을 비교하고 join·직렬화 문자열을 비교 키로 사용하지 않는다.

---

## 6. Generation Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 문제/문장 생성의 전체 오케스트레이션. GRAMMAR_GRAPH §6.2의 4단계 난이도 사다리(조합→단일 노드→사전 제작 콘텐츠→콘텐츠 공백 신호) 중 **현재 어느 단계로 진행할지 판단**하고 AI Generation Engine 또는 Content Engine에 위임. 1~2단계에서는 AI Generation Engine의 `selectGenerationCandidates`로 후보 node ID를 먼저 확정하고, non-null 결과와 정확히 같은 정렬된 ID로 Content Engine의 `get_recent_generated_content`를 호출한다. 그 반환을 변경 없이 해당 생성 API에 전달하고, Layer 2 candidate를 받으면 Content Engine의 `save_generated_content`로 저장한다. 4단계(콘텐츠 공백)에 도달하면 그 사실을 Learning Flow Engine에 보고 |
| **2. 하지 않는 일** | 실제 AI 문장 생성·candidate 검증을 직접 수행하지 않는다(AI Generation Engine에 위임). 사전 제작 콘텐츠나 최근 생성 Content를 직접 DB 조회하지 않는다(Content Engine에 위임). Practicing 이상 필터나 최근 시도 조합 tie-break를 직접 계산하지 않는다(AI Generation Engine의 planning 책임). Graph Engine·Progress Engine을 직접 호출하지 않으며 difficulty를 얻기 위해 Graph Engine을 우회 호출하지 않는다. 선택된 node ID를 생성 호출 전에 재선택·재필터·재정렬하지 않고, 최근 생성 목록을 보강·축약하지 않으며, 저장 반환 projection의 필드를 다시 계산하지 않는다 |
| **3. 입력 데이터** | 사용자 ID, 언어, target_concept_id(선택, 1~2단계용), **target_node_id(선택, 3단계 PRE_MADE fallback 전용 — AC-005, 2026-07-08 Resolved. Learning Flow Engine이 결정해 전달, 이 Engine은 3단계에서 Content Engine으로 그대로 릴레이만 함)** |
| **4. 출력 데이터** | exact top-level `{content, content_id, source, ladder_step}`. AI_GENERATED는 Content Engine save projection을 그대로 `content`로 사용하고 `content.content_id === content_id`; PRE_MADE도 canonical Content projection을 사용한다. NO_CONTENT는 `{content:null, content_id:null, source:null, ladder_step:4}` |
| **5. 호출 가능한 하위 Engine** | AI Generation Engine, Content Engine |
| **6. 의존하면 안 되는 Engine** | Graph Engine, Progress Engine(직접 호출 금지 — 필요하면 AI Generation Engine에 위임하고 결과만 받는다). Review Engine, Interleaving Engine, Learning Flow Engine |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §6.2 |
| **8. 향후 구현 시 주의사항** | "지금 몇 단계인가"와 retry/강등을 판단하는 정책 로직은 **이 Engine에만** 있어야 한다. Provider technical failure는 1회 재시도 후 강등, constraint violation은 총 최대 3회 생성 후 강등, candidate 부족은 즉시 강등한다. 반면 save 실패는 즉시 throw하고 PRE_MADE read technical failure는 1회 재시도 후 throw하며, PRE_MADE 정상 empty만 4단계로 강등한다 |

---

## 7. AI Generation Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 난이도 사다리 **1~2단계만** 수행. `selectGenerationCandidates`가 GRAMMAR_GRAPH §6.1의 후보 계획 1~3단계(eligible pool, mode/Concept/ALTERNATIVE 필터, 최근 exact 조합 tie-break)를 실행해 정렬된 node ID 또는 null을 반환한다. `generateCombination`/`generateSingleNode`는 그 preselected ID와 최근 생성 Content를 받아 stage 4 provider prompt를 구성하고 structured output `{generated_text, answer_key, self_reported_node_ids}`를 exact schema로 검증해 Layer 2 exact `{candidate: object\|null}`로 변환 |
| **2. 하지 않는 일** | 사다리 3~4단계(사전 제작 콘텐츠, 사용자 안내)를 처리하지 않는다 — 실패 시 `{candidate:null}`만 반환하고 다음 단계 판단은 Generation Engine의 몫이다. Content를 저장하거나 `content_id`·difficulty·source·author·meta_language를 생성하지 않는다. `answer_key`를 추론·합성·fixture 주입하지 않는다. 생성 API 안에서 node를 재선택·재필터하거나 `userId`·`targetConceptId`를 받지 않는다. `recentGeneratedContent`는 prompt-only 입력이며 선택·검증·출력 근거로 사용하지 않는다. 어떤 언어를 생성할지 스스로 정하지 않으며 Progress 데이터를 쓰지 않는다 |
| **3. 입력 데이터** | planning: `pool, userId, language, generationMode, targetConceptId`; generation: `pool, language, grammarNodeIds, recentGeneratedContent`. `grammarNodeIds`는 planning이 반환한 정렬·중복 제거 ID와 exact 동일해야 하고, 최근 Content 배열도 Generation Engine이 Content Engine에서 받은 그대로여야 한다 |
| **4. 출력 데이터** | planning은 exact `{grammar_node_ids:string[]\|null}`(mode 1은 길이 2, mode 2는 길이 1, 항상 dedupe·사전순 정렬). generation은 exact `{candidate}`. 성공 candidate의 exact keys는 `grammar_node_ids`, 정확히 1개의 TEXT/PRIMARY `media_assets`, QUIZ `answer_key`를 담은 `type_specific_metadata`; 후보 부족·재생성 소진은 `{candidate:null}`. Layer 2에는 `content_id`가 없음 |
| **5. 호출 가능한 하위 Engine** | Graph Engine(읽기, node language·Concept membership·ALTERNATIVE 관계 조회), Progress Engine(읽기, Practicing 이상 필터·`get_recent_attempted_combinations`) |
| **6. 의존하면 안 되는 Engine** | Content Engine(형제 — Generation Engine을 거치지 않고 직접 호출 금지), Review Engine, Interleaving Engine, Learning Flow Engine, Generation Engine(자신을 호출한 상위를 역으로 호출 금지) |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §6.1, §6.2(1~2단계) |
| **8. 향후 구현 시 주의사항** | §6.1 필터 우선순위 순서는 절대 바뀌지 않아야 한다. planning tie-break는 최근 20개 시도에서 동일 조합의 exact-match 횟수가 적은 후보를 우선하고, 동률이면 정렬 배열의 원소별 lexicographic 순서를 사용한다. join·JSON 등 직렬화 문자열을 비교 키로 사용하지 않는다. generation은 `get_node_language_and_concepts`로 모든 node의 존재성·중복 없음·language 일치를 다시 검증하지만 선택을 바꾸지 않는다. `self_reported_node_ids`는 교차확인 힌트일 뿐 재선정·출력 근거가 아니며 Layer 2 이후 노출하지 않는다. `generated_text` 검증 실패 시 질문과 `answer_key`를 함께 폐기한다. GRAMMAR_GRAPH §6.1 stage 5 품질 비교형 스코어링은 복수 실제 생성물을 비교하는 2차 실제 LLM milestone로 유보하며, 첫 Mock 구현은 이를 수행하거나 수행했다고 주장하지 않는다 |

---

## 8. Content Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | Content를 생성하지 않지만 저장과 조회를 소유한다. 기존 조건/ID 기반 `get_content`, AI 생성 Content의 유일한 write 경로 `save_generated_content`, 최근 AI 생성 이력 read 경로 `get_recent_generated_content`를 제공한다. Save 시 node 존재성·language를 검증하고 node ID를 dedupe/사전순 정렬하며 MAX difficulty, canonical `content_id`, AI 고정 필드를 설정한다 |
| **2. 하지 않는 일** | 문제·문장·`answer_key`를 생성하거나 provider를 호출하지 않는다. 언제 자신이 호출되어야 하는지나 사다리 강등을 스스로 판단하지 않는다(Generation Engine의 지시를 따름). Practicing 이상 같은 학습 수준 필터를 적용하지 않는다. 다른 Engine을 호출하지 않는다 |
| **3. 입력 데이터** | 기존 `get_content`의 조건 기반/`content_id` 단독 모드. `save_generated_content`: `grammarNodeIds`, `contentType`, required `mediaAssets`, conditional `typeSpecificMetadata`(`difficulty`·`content_id` 입력 없음). `get_recent_generated_content`: `grammarNodeIds`, `language` |
| **4. 출력 데이터** | `get_content`: 조건에 맞는 Content 또는 빈 결과. `save_generated_content`: exact `{content_id, grammar_node_ids, content_type, media_assets, difficulty, type_specific_metadata}`. `get_recent_generated_content`: `{content_id, media_assets, created_at}` 목록(최대 5) |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부 |
| **7. 관련 상위 문서** | GRAMMAR_SCHEMA §3, GRAMMAR_GRAPH §6.2(3단계) |
| **8. 향후 구현 시 주의사항** | `save_generated_content`는 normalized node order, 내부 MAX difficulty, `IDENTIFIER_STANDARD.md` §5 ID와 AI 고정 필드를 한 경계에서 확정하고 UUID/PK 충돌을 내부 재시도하지 않는다. 일반 DB 인프라 실패는 공통 입력 오류로 위장하거나 raw PostgreSQL/SQL/connection 정보를 노출하지 않는다. `get_content`와 `get_recent_generated_content`의 정상 0건은 명확한 빈 결과로 반환한다 |

---

## 9. Review Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | Review Cascade 수행(GRAMMAR_GRAPH §5): 실수 처리 루프의 선행 탐색·Cascade 생성, 정기 복습 대상 산출 |
| **2. 하지 않는 일** | 실제 복습 문제를 생성하지 않는다(결과를 Generation Engine·Interleaving Engine에 전달). Progress 상태를 직접 갱신하지 않는다. 오답 원인을 스스로 판단하지 않는다 — 원인 분류(SELF/TRANSFER)는 Learning Flow Engine의 실수 처리 루프 2단계에서 이미 결정되어 입력으로 들어온다 |
| **3. 입력 데이터** | 노드 ID, error_category(SELF/TRANSFER), max_cascade_depth, **progress_snapshot(AC-001, 2026-07-08 Resolved — `{node_id: state}` 맵. Learning Flow Engine이 `get_cascade` 호출 전 해당 언어 전체 노드 상태를 `get_progress`로 미리 조회해 전달. 맵에 없는 노드는 NOT_INTRODUCED로 처리)** |
| **4. 출력 데이터** | 우선순위가 매겨진 복습 대상 노드 목록(선정 근거 포함) |
| **5. 호출 가능한 하위 Engine** | Graph Engine(읽기, 선행 탐색) |
| **6. 의존하면 안 되는 Engine** | Progress Engine(직접 호출 금지 — 필요한 상태는 입력으로 전달받음), Generation Engine, AI Generation Engine, Content Engine, Interleaving Engine, Learning Flow Engine |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §5 |
| **8. 향후 구현 시 주의사항** | `max_cascade_depth`는 하드코딩하지 않고 파라미터로 유지한다(GRAMMAR_GRAPH §5.2). 향후 사용자 숙련도·오류 유형별 동적 조절 여지를 남겨둘 것 |

---

## 10. Interleaving Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | Learning Flow Engine이 구성한 occurrence multiset의 구성과 multiplicity를 보존하면서 순서만 결정한다(GRAMMAR_GRAPH §7의 Tier A 원문은 변경하지 않고 AC-014로 정밀 해석). **정렬 전, `get_node_language_and_concepts`(AC-015)로 입력 node들의 `language`·`concept_ids`를 확보해 mixed-language 여부를 직접 판정하고, `concept_ids` union을 `get_concept_categories`(3.5)에 전달해 Category를 해석하며, `find_related_nodes`(3.2, CONTRAST)로 대조 관계를 조회한다** |
| **2. 하지 않는 일** | 어떤 노드가 복습·연습 대상인지 선정하거나 입력 occurrence를 추가·삭제하지 않는다. 실제 문제 콘텐츠를 만들지 않는다. Category/CONTRAST를 직접 정의하지 않는다 |
| **3. 입력 데이터** | 중복을 허용하는 node ID occurrence multiset 배열 |
| **4. 출력 데이터** | 입력과 길이·multiplicity가 정확히 같은 순서화된 node ID 시퀀스 |
| **5. 호출 가능한 하위 Engine** | Graph Engine(읽기, `get_concept_categories`, **`get_node_language_and_concepts`(AC-015)** 및 CONTRAST 관계 조회) |
| **6. 의존하면 안 되는 Engine** | Progress Engine, Generation Engine, AI Generation Engine, Content Engine, Review Engine, Learning Flow Engine |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §7 |
| **8. 향후 구현 시 주의사항** | max batch 6의 고유 multiset 순열 전체를 exhaustive 비교한다. `sequence_nodes`의 lexicographic ordering tuple을 사용하고 내부 점수는 노출하지 않는다. 입력 node가 2개 미만인 경우 Learning Flow가 INTERLEAVING 전에 건너뛴다. **`sequence_nodes`는 dedupe·permutation 생성 전 원본 occurrence multiset 배열의 전체 길이가 `engineConfig`의 `max_batch_size`를 초과하면 `OUT_OF_RANGE_VALUE`로 거부한다(AC-015, unique node 수가 아니라 원본 길이 기준). mixed-language 판정은 `get_node_language_and_concepts`가 반환한 `language` 값들을 Interleaving이 직접 비교해 수행하며, Graph API 자체는 이를 거부하지 않는다** |

---

## 11. 공통 원칙 재확인

- **단일 쓰기 경로**: Progress 데이터는 오직 Progress Engine만 쓴다(5장, GRAMMAR_GRAPH §8).
- **Content 단일 쓰기 경로(Pattern A)**: AI 생성 Content는 Generation Engine이 오케스트레이션하고 Content Engine의 `save_generated_content`만 저장한다. AI Generation Engine은 저장하지 않는다.
- **리프 Engine은 아무도 호출하지 않는다**: Graph Engine, Progress Engine, Content Engine.
- **형제는 형제를 부르지 않는다**: AI Generation Engine ↔ Content Engine은 반드시 Generation Engine을 거친다.
- **정책과 실행의 분리**: "지금 무엇을 할지" 판단하는 Engine(Learning Flow, Generation)과 "시켜서 실행만 하는" Engine(AI Generation, Content, Graph, Progress)을 구분한다.

---

## 12. Engine State Policy

각 Engine이 상태(state)를 직접 보유하는지 여부를 명시한다. 이는 Engine을 재시작·재배포·병렬 실행할 때 무엇을 보존해야 하는지를 결정하는 기준이 된다.

| Engine | 상태 정책 | 근거 |
|---|---|---|
| Learning Flow Engine | **Orchestrator — 상태 직접 보유 금지** | 모든 상태는 Progress Engine에 위임한다. 이 Engine이 상태를 들고 있으면 5장의 단일 쓰기 경로 원칙이 무의미해진다 |
| Graph Engine | Stateless | 매 호출마다 Grammar Node/Relation 데이터를 조회할 뿐, 호출 간에 유지되는 내부 상태가 없다 |
| Progress Engine | **Stateful** | 사용자별 진행 상태의 유일한 쓰기 경로이자 소유자. LLE에서 상태를 실제로 "가진" 유일한 Engine이다 |
| Generation Engine | Stateless | 사다리 몇 단계인지 판단은 매 호출마다 현재 Progress 조회 결과로 새로 계산하며, 이전 호출 결과를 기억하지 않는다 |
| AI Generation Engine | Stateless | 매 호출이 독립적. 이전 생성 이력을 스스로 기억하지 않는다(표층 변주를 위한 "이전 예문" 정보가 필요하면 호출자가 입력으로 전달한다) |
| Content Engine | Stateless / Persistence boundary | Content 저장·조회를 수행하지만 호출 간 in-memory 상태를 보유하지 않는다. 저장 상태의 canonical 경계는 Content Engine API다 |
| Review Engine | Stateless | 매 호출마다 입력받은 노드·오류 정보로 Cascade를 새로 계산한다 |
| Interleaving Engine | Stateless | 입력받은 노드 목록을 그때그때 재정렬할 뿐, 세션 간 기억을 유지하지 않는다 |

**원칙**: LLE에서 사용자 학습 상태를 직접 갖는 Stateful Engine은 Progress Engine 하나뿐이다. Content Engine은 durable Content를 저장하는 persistence boundary지만 호출 간 in-memory 상태나 사용자 학습 상태를 보유하지 않는다. 나머지 Engine도 Stateless(또는 Orchestrator)이므로 이론적으로 자유롭게 재시작·복제·병렬 실행할 수 있다. 이 비대칭 구조 자체가 5장 학습 상태의 "단일 쓰기 경로" 원칙과 AC-017 Content 단일 쓰기 경로를 함께 보존한다.

---

## 13. Engine Versioning Policy

- Engine은 문서(GRAMMAR_GRAPH.md 등)와 별개로 **자체 버전**을 가질 수 있다. 표기: `{ENGINE_NAME}_v{N}` (예: `REVIEW_ENGINE_v1`, `REVIEW_ENGINE_v2`).
- **Engine 버전이 오르는 것은 알고리즘(HOW)이 바뀌는 것이지, 이 문서가 정의한 책임·입출력 계약이 바뀌는 것이 아니다.** 예: Review Cascade의 우선순위 계산 방식을 개선해 v2를 만들어도, "무엇을 입력받고 무엇을 출력하는가"(API_CONTRACT.md의 계약)가 같다면 이 문서와 API_CONTRACT.md는 개정할 필요가 없다.
- **계약 자체가 바뀌면** 이는 Engine 버전 업이 아니라 이 문서와 API_CONTRACT.md의 개정 대상이며, 훨씬 무거운 변경으로 취급한다(영향받는 모든 호출자를 함께 검토해야 함).
- 여러 버전이 한동안 공존할 수 있다(예: A/B 비교, 점진적 마이그레이션). 이 경우 공존 기간·전환 조건은 이 문서가 아니라 구현 단계에서 정한다.

---

## 14. Engine Priority / Implementation Order

| Tier | Engine | 근거 |
|---|---|---|
| **Core** | Graph Engine, Progress Engine | 다른 어떤 Engine에도 의존하지 않는 기반 계층. 이 둘이 없으면 나머지 어떤 Engine도 동작할 수 없다 |
| **Policy** | Learning Flow Engine, Generation Engine, Review Engine | "지금 무엇을 해야 하는가"를 판단하는 계층. 설계·테스트는 Core만 있어도 시작할 수 있지만, 완전한 통합 테스트는 Utility 계층이 준비된 뒤 가능하다 |
| **Utility** | Content Engine, AI Generation Engine, Interleaving Engine | Policy Engine이 위임하는 실행 계층. Core에만 의존하므로 Core 완성 직후 Policy와 병렬로 개발 가능하다 |

**구현 순서 원칙**: Core → (Policy·Utility 병렬 개발, Policy는 Utility를 스텁(stub)으로 대체해 먼저 설계 검증 가능) → 통합 테스트. Learning Flow Engine은 Policy 안에서도 가장 마지막에 완성한다 — 나머지 7개 Engine 전부를 조율하는 최상위 진입점이기 때문이다.

---

## 15. Future Extension — Event Engine (Reserved, 미구현)

- **현재 구현하지 않는다.** 이 절은 향후 확장을 위한 자리 예약(Reserved Section)이다.
- **가능성**: Attempt 완료, Progress 변경, Review Cascade 생성, Analytics 업데이트 등을 지금처럼 직접 호출(synchronous call)이 아니라 이벤트 발행-구독 방식으로 연결할 가능성.
- **왜 지금 만들지 않는가**: 현재 Engine 수(8개)와 호출 관계는 2장의 계층도로 충분히 관리 가능하다. 이벤트 기반 아키텍처를 지금 도입하면, 실제로 필요하지도 않은 간접 계층이 추가되어 오히려 추적성이 떨어진다(단순성 우선 원칙, PROJECT_VISION §2.2).
- **도입을 검토할 시점**: 여러 Engine이 같은 사건(예: Progress 변경)에 서로 다른 이유로 반응해야 하는 요구가 실제로 누적되었을 때.

---

## 16. Future Extension — Audit / Logging Engine (Reserved, 미구현)

- **현재 구현하지 않는다.** 이 절도 자리 예약이다.
- **가능성**: AI 생성 이유, 필터링 이유, Review Cascade 계산 근거, Progress 변경 근거를 체계적으로 기록·조회하는 전용 계층.
- **현재 상태**: 각 Engine의 출력에는 이미 부분적으로 근거가 포함되어 있다(예: Review Engine 산출물의 "왜 이 노드가 복습 대상인지", GRAMMAR_GRAPH §5.3). 다만 이를 영구적으로 수집·조회하는 별도 저장소·Engine은 아직 없다.
- **도입을 검토할 시점**: 실제 운영 데이터가 쌓여 "왜 이 학습자에게 이 문제가 나왔는가"를 사후에 추적해야 하는 필요(디버깅, 학습 효과 분석, 이상 탐지)가 실제로 발생했을 때.

---

## 17. 금지 사항

- Engine이 자신을 호출한 상위 Engine을 역으로 호출하는 것(순환 호출)
- 형제 Engine을 공통 부모를 거치지 않고 직접 호출하는 것
- 리프 Engine(Graph, Progress, Content)이 다른 Engine을 호출하는 것
- Progress Engine을 우회해 다른 Engine이 상태 데이터를 직접 쓰는 것
- AI Generation Engine이 사다리 3~4단계(사전 제작 콘텐츠, 사용자 안내)까지 스스로 처리하는 것 — 그 판단은 항상 Generation Engine의 몫이다
- "하지 않는 일"에 명시된 책임을 다른 Engine의 승인 없이 떠맡는 것(책임 경계 침범)

---

## 18. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-05 | 최초 작성 — Engine 8개(Learning Flow, Graph, Progress, Generation, AI Generation, Content, Review, Interleaving) 확정. Generation Engine과 AI Generation Engine 분리(오케스트레이터 vs 실행자), Content Engine을 데이터 접근 계층으로 분리. 호출 계층도 및 교차 읽기 의존 관계 정의. Engine별 8개 항목(책임/금지/입출력/호출관계/상위문서/주의사항) 전부 작성 |
| 1.1 | 2026-07-05 | Engine State Policy(12장), Engine Versioning Policy(13장), Engine Priority/Implementation Order(14장) 추가. Event Engine(15장)과 Audit/Logging Engine(16장)을 Reserved Section으로 명시(미구현). API_CONTRACT.md가 Engine 내부 구현을 노출하지 않는다는 작성 원칙을 0장에 사전 확정 |
| 1.2 | 2026-07-05 | GRAMMAR_GRAPH.md v1.4의 탐색 방향 용어 수정("선행 탐색/후행 탐색")에 맞춰 Graph Engine·Review Engine 관련 서술 갱신 |
| 1.3 | 2026-07-05 | Learning Flow Engine이 Content Engine을 직접 호출할 수 있는 경로 추가(레슨 설명 조회, GRAMMAR_GRAPH §4.4와의 불일치 수정). Content Engine의 실제 호출 주체가 Generation Engine과 Learning Flow Engine 둘임을 명시 |
| 1.4 | 2026-07-06 | Progress Engine 출력 데이터에 `get_due_reviews`(API_CONTRACT §4.7, Review Queue 배치 조회) 반영 |
| 1.5 | 2026-07-07 | `API_LAYER_BRIEF.md` 작성 이후 `API_CONTRACT.md` v1.2(외부 API 4개로 확장)와 대조 — Learning Flow Engine §3 입력 데이터에서 `request_practice`가 누락되어 있던 것을 발견해 추가, 4개 외부 API 전체를 API_CONTRACT.md §10.1~10.4 참조와 함께 명시. `submit_self_reported_confidence`는 이 문서에 이미 "자기보고 Confidence"로 반영되어 있었음을 확인(API_CONTRACT.md가 뒤늦게 따라잡은 사례) |
| 1.6 | 2026-07-07 | `start_session`(MIGRATION_GUIDE Entry 005) 반영 — Learning Flow Engine §3 입력 데이터를 5개 외부 API로 갱신(API_CONTRACT.md §10.1~10.5) |
| 1.7 | 2026-07-08 | AC-001 Resolved 반영 — Review Engine §9 입력 데이터에 `progress_snapshot` 추가 |
| 1.8 | 2026-07-08 | AC-005 Resolved 반영 — Generation Engine §6 입력에 `target_node_id`, AI Generation Engine §7 출력에 `content_id` 추가 |
| 1.9 | 2026-07-08 | AC-008 Resolved 반영 — Content Engine §8 입력에 `content_id` 단독 조회 모드, Learning Flow Engine §3 호출 가능 하위 Engine에 진단 조회 예외 경로, Generation Engine §6 출력에 `content_id` 추가 |
| — | 2026-07-11 | **Contract Reconciliation 패치** — 코드베이스 유실 후 재구현 착수 전, GitHub 본문이 v1.5에 머물러 있던 것을 위 AC-001/005/008 Resolved 결정 기준으로 일괄 반영. 새로운 설계 결정 없음. 근거: `REBUILD_CONTRACT_RECONCILIATION.md`. (버전 번호는 AC Backlog가 이미 명명한 1.6~1.9를 그대로 사용) |
| 1.10 | 2026-07-13 | Independent Architecture Audit(AUD-003), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — Graph Engine §4 책임에 Language boundary 검증(배포 전 정적 검증) 추가, 출력 데이터에 `language_boundary_violations` 목록 추가, "향후 구현 시 주의사항"에 선행/후행 탐색·관계 조회 함수의 runtime defense-in-depth(시작 노드 language 밖 노드 미반환) 명시. `GRAMMAR_SCHEMA.md` §6, `GRAMMAR_GRAPH.md` §3, `API_CONTRACT.md` §3.3, `VALIDATION_LEVEL3.md` §7, `MIGRATION_GUIDE.md` Entry 004와 연동 |
| 1.11 | 2026-07-17 | AUD-004 Tier C Architecture Clarification 승인 반영 — Learning Flow의 Content 진단→Review Cascade→node_id 목록 전달 책임, Progress의 동일 트랜잭션 PENDING outbox producer 책임, leaf/no-engine-call 유지, `max_cascade_depth` 설정값 전달 원칙을 명시 |
| 1.12 | 2026-07-17 | AC-012 Tier C Architecture Clarification — Learning Flow `start_session` 입력에 `conversationBoundaryAcknowledged` 반영, PRACTICING+ 최소 기준 기본값 3의 설정 소비, true 시 해당 호출의 CONVERSATION 재선택 차단, acknowledgement 비영속·Progress 무변경, 전체 next_action production 경로 선행 구현 및 Conversation Engine 신설 금지를 명시 |
| 1.13 | 2026-07-18 | AC-013 Tier C Architecture Clarification — Learning Flow의 `get_active_learning_count` read-only precheck과 Progress `recordExplicitStudy`의 최종 admission 권한을 분리. Progress leaf 구조, 동일 client/transaction, transaction-scoped blocking advisory lock, idempotency 우선, authoritative count 및 `CONTRACT_VIOLATION` enforcement를 명시 |
| 1.14 | 2026-07-19 | AC-014 Tier C Architecture Clarification — Graph `list_nodes_by_language`/`get_concept_categories`, Progress `get_progress_snapshot`/`get_practicing_plus_count` 책임 추가; Learning Flow의 canonical API-only NEW_GRAMMAR 8단계와 INTERLEAVING eligible/admissible/occurrence/sequence 분리, Category hard gate와 selected-set tuple, Session Budget mode를 명시. Interleaving은 max batch 6 occurrence multiset의 순서만 exhaustive 결정하며 Progress leaf와 Graph static metadata 경계를 유지 |
| 1.15 | 2026-07-19 | AC-015 Tier C Architecture Clarification — Graph Engine에 `get_node_language_and_concepts` 책임 추가(Interleaving Engine 전용 caller, mixed-language 미판정). Interleaving §10-5 호출 목록에 반영하고, 정렬 전 language/concept_ids 확보 → Category 해석(`get_concept_categories`) → CONTRAST 조회(`find_related_nodes`) 흐름을 §10-1에 명시. `sequence_nodes`의 dedupe·permutation 이전 원본 occurrence 길이 기준 `max_batch_size` 초과 거부와 mixed-language 판정이 Interleaving 책임임을 §10-8에 재확인. Tier A `GRAMMAR_GRAPH.md` 원문 불변 |
| 1.16 | 2026-07-22 | AC-017 Tier C Architecture Clarification 누적 correction — Pattern A와 기존 ladder/provider/save 경계를 유지하면서 AI Generation planning `selectGenerationCandidates`, Progress recent-attempt read, generation API의 preselected node/recent Content 입력 계약, Graph caller 확대를 확정. 후보 계획 stages 1~3, prompt stage 4, 품질 비교 stage 5의 2차 실제 LLM milestone 유보를 명시했다. sibling/leaf 원칙과 Tier A는 불변, prerequisite implementation 미착수 |
