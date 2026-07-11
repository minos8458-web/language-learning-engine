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
| AI Generation Engine | O (ALTERNATIVE 관계 조회) | O (Practicing 이상 필터) |
| Interleaving Engine | O (CONTRAST/RELATED 관계 조회) | — |
| Generation Engine | — (자식에게 위임, 직접 조회하지 않음) | — (자식에게 위임) |
| Content Engine | — | — |

---

## 3. Learning Flow Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 사용자 × 노드 조합의 전체 생애주기(NOT_INTRODUCED→AUTOMATIC) 진행을 조율. 실수 처리 루프 6단계(GRAMMAR_GRAPH §4.2) 전체를 오케스트레이션. 어떤 하위 Engine을 어떤 순서로 호출할지 결정하는 최상위 진입점 |
| **2. 하지 않는 일** | 상태를 직접 변경하지 않는다(Progress Engine에 요청). 선행 관계를 직접 탐색하지 않는다(Graph Engine에 위임). 복습 대상을 직접 계산하지 않는다(Review Engine에 위임). 문제/문장을 직접 만들지 않는다(Generation Engine에 위임) |
| **3. 입력 데이터** | 사용자 액션 이벤트 — 명시적 학습 시작(`start_explicit_study`), 인출 시도 제출·결과(`submit_attempt`), 연습 문제 요청(`request_practice`), 자기보고 Confidence(`submit_self_reported_confidence`), **세션 시작(`start_session`, MIGRATION_GUIDE Entry 005 — 2026-07-07 신설)**. 이 5개가 외부에 노출되는 API 전부다(API_CONTRACT.md §10.1~10.5) |
| **4. 출력 데이터** | 사용자에게 다음에 보여줄 화면 구성 지시(어떤 하위 Engine의 결과를 어떤 순서로 조합할지), Progress Engine에 대한 상태 전이 요청 |
| **5. 호출 가능한 하위 Engine** | Graph Engine, Progress Engine, Generation Engine, Review Engine, Interleaving Engine, **Content Engine**(명시적 학습 단계에서 EXPLANATION 콘텐츠를 직접 조회하기 위한 예외적 직접 호출, GRAMMAR_GRAPH §4.4 / `submit_attempt` 처리 중 `content_id` 단독 조회로 SELF/TRANSFER 진단 정보를 얻기 위한 예외적 직접 호출, AC-008 2026-07-08 Resolved) |
| **6. 의존하면 안 되는 Engine** | 없음(최상위 진입점). 단, **다른 어떤 Engine으로부터도 호출되어서는 안 된다** — 이 Engine은 오직 최초 진입점 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §4(Learning Flow Engine, 실수 처리 루프) |
| **8. 향후 구현 시 주의사항** | 오케스트레이션만 하는 "얇은 조정자"로 유지해야 한다. 실제 판단 로직이 이 Engine 안으로 스며들면(예: 여기서 직접 필터링·계산을 시작하면) God Object가 되어 2장의 책임 분리가 무의미해진다 |

---

## 4. Graph Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | Grammar Graph 구조 조회·순회 제공: 선행 탐색/후행 탐색, 순환 검증, Concept-Node 정합성 검증(GRAMMAR_GRAPH §2~3) |
| **2. 하지 않는 일** | 사용자 Progress를 조회·저장하지 않는다. 노드 상태에 따른 필터링 판단을 하지 않는다(Practicing 이상 여부는 호출자가 Progress Engine 결과와 조합해 판단). "이 노드를 복습해야 한다"거나 "생성해야 한다" 같은 정책적 판단을 내리지 않는다 — 순수 구조 조회만 한다 |
| **3. 입력 데이터** | 노드 ID, 탐색 방향(선행/후행), 최대 깊이(max_depth) |
| **4. 출력 데이터** | 노드 ID 목록(경로 순서 포함), 순환 검증 결과, Concept-Node 정합성 검증 결과 |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부. Graph Engine은 어떤 상위 Engine도 호출해서는 안 된다 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §2, §3 |
| **8. 향후 구현 시 주의사항** | "상태가 입혀진 그래프"(State-Colored Graph, GRAMMAR_GRAPH §2)는 이 Engine이 만들지 않는다. 호출자가 이 Engine의 순수 구조 결과와 Progress Engine의 상태 결과를 **조합**해야 한다. Graph Engine 자체가 Progress를 알게 되는 순간 재사용성이 떨어진다 |

---

## 5. Progress Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 사용자별 진행 상태(State, Accuracy, Confidence, Response Time, AttemptRecord)에 대한 **유일한 쓰기 경로**. Coverage/Depth 계산 제공. 다음 복습 시점 계산(GRAMMAR_GRAPH §8) |
| **2. 하지 않는 일** | Grammar Graph를 순회하지 않는다(Graph Engine의 역할). 어떤 문제를 생성할지 결정하지 않는다. 복습 대상 노드를 스스로 선정하지 않는다(Review Engine이 이 Engine의 조회 결과를 활용해 판단) |
| **3. 입력 데이터** | 사용자 ID, 노드 ID, 이벤트 유형(명시적 학습/시도 결과/자기보고 Confidence), 원시 AttemptRecord 필드 |
| **4. 출력 데이터** | 현재 State, Accuracy, Confidence(inferred/self-reported/calibration), 다음 복습 시점, Concept별 Coverage/Depth, **복습 기한이 도래한 노드 배치 조회 결과(`get_due_reviews`, API_CONTRACT §4.7)** |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부 |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §4.2, §8, LEARNING_THEORY C8/C9, GRAMMAR_SCHEMA §5 |
| **8. 향후 구현 시 주의사항** | 다른 Engine이 이 Engine을 우회해 Progress 데이터에 직접 쓰기 접근을 하지 못하도록 **접근 제어 자체를 구현 레벨에서 강제**해야 한다. "요청은 받되 쓰기는 스스로 한다"는 원칙이 코드 구조에도 반영되어야 한다 |

---

## 6. Generation Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 문제/문장 생성의 전체 오케스트레이션. GRAMMAR_GRAPH §6.2의 4단계 난이도 사다리(조합→단일 노드→사전 제작 콘텐츠→콘텐츠 공백 신호) 중 **현재 어느 단계로 진행할지 판단**하고 AI Generation Engine 또는 Content Engine에 위임. 4단계(콘텐츠 공백)에 도달하면 그 사실을 Learning Flow Engine에 보고 |
| **2. 하지 않는 일** | 실제 AI 문장 생성을 직접 수행하지 않는다(AI Generation Engine에 위임). 사전 제작 콘텐츠를 직접 조회하지 않는다(Content Engine에 위임). Practicing 이상 필터를 직접 계산하지 않는다(AI Generation Engine의 책임). Graph Engine·Progress Engine을 직접 호출하지 않는다 |
| **3. 입력 데이터** | 사용자 ID, 언어, target_concept_id(선택, 1~2단계용), **target_node_id(선택, 3단계 PRE_MADE fallback 전용 — AC-005, 2026-07-08 Resolved. Learning Flow Engine이 결정해 전달, 이 Engine은 3단계에서 Content Engine으로 그대로 릴레이만 함)** |
| **4. 출력 데이터** | 최종 생성 결과(출처가 AI든 사전 제작이든 동일한 형식으로 정규화), **`content_id`(AC-008, 2026-07-08 Resolved — 반환 전 `content` 테이블에 영속화된 ID)**, 도달한 사다리 단계 번호(로깅용) |
| **5. 호출 가능한 하위 Engine** | AI Generation Engine, Content Engine |
| **6. 의존하면 안 되는 Engine** | Graph Engine, Progress Engine(직접 호출 금지 — 필요하면 AI Generation Engine에 위임하고 결과만 받는다). Review Engine, Interleaving Engine, Learning Flow Engine |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §6.2 |
| **8. 향후 구현 시 주의사항** | "지금 몇 단계인가"를 판단하는 정책 로직은 **이 Engine에만** 있어야 한다. AI Generation Engine과 Content Engine은 "시켜서 실행하는" 순수 실행자로 유지해야, 향후 사다리 정책이 바뀌어도 한 곳만 고치면 된다 |

---

## 7. AI Generation Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 난이도 사다리 **1~2단계만**(조합 생성, 단일 노드 생성) 수행. GRAMMAR_GRAPH §6.1 필터 파이프라인(최우선 필터 포함) 실행 |
| **2. 하지 않는 일** | 사다리 3~4단계(사전 제작 콘텐츠, 사용자 안내)를 처리하지 않는다 — 실패 시 "실패했다"는 신호만 반환하고, 그 다음 단계 판단은 Generation Engine의 몫이다. 어떤 언어를 생성할지 스스로 정하지 않는다(입력으로 받음). Progress 데이터를 쓰지 않는다(읽기 전용) |
| **3. 입력 데이터** | 사용자 ID, 언어, target_concept_id(선택), 시도할 사다리 단계(1 또는 2) |
| **4. 출력 데이터** | 생성된 문제/문장(성공 시) + `content_id`(AC-008, 2026-07-08 Resolved — 반환 전 영속화), 또는 "1~2단계 모두 실패"라는 명확한 실패 신호 |
| **5. 호출 가능한 하위 Engine** | Graph Engine(읽기, ALTERNATIVE 관계 조회), Progress Engine(읽기, Practicing 이상 필터) |
| **6. 의존하면 안 되는 Engine** | Content Engine(형제 — Generation Engine을 거치지 않고 직접 호출 금지), Review Engine, Interleaving Engine, Learning Flow Engine, Generation Engine(자신을 호출한 상위를 역으로 호출 금지) |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §6.1, §6.2(1~2단계) |
| **8. 향후 구현 시 주의사항** | §6.1 필터 우선순위 순서는 절대 바뀌지 않아야 한다. 품질 스코어링이 학습자 수준 필터보다 먼저 적용되는 코드 경로가 생기지 않도록, 구현 단계에서 이 순서를 강제하는 테스트를 반드시 둘 것 |

---

## 8. Content Engine

| 항목 | 내용 |
|---|---|
| **1. 책임** | 사전 제작 Content(GRAMMAR_SCHEMA §3) 조회 전용. Content ID 조회, content_type/meta_language/explanation_level 조건에 맞는 항목 선택 |
| **2. 하지 않는 일** | 콘텐츠를 생성하지 않는다(사전 제작된 것만 조회). 언제 자신이 호출되어야 하는지 스스로 판단하지 않는다(Generation Engine의 지시를 따름). Practicing 이상 같은 학습 수준 필터를 적용하지 않는다 — 사전 제작 콘텐츠는 그런 필터의 대상이 아니다(GRAMMAR_GRAPH §6.2 3단계) |
| **3. 입력 데이터** | 조건 기반 모드: Grammar Node ID, content_type, meta_language(선택), explanation_level(선택) / **단독 정확 조회 모드(AC-008, 2026-07-08 Resolved): `content_id` 단독** — Learning Flow Engine이 SELF/TRANSFER 진단용 `type_specific_metadata` 조회에 사용(AC-008의 예외 호출 경로, 기존엔 EXPLANATION 조회만 있었음) |
| **4. 출력 데이터** | 조건에 맞는 Content 레코드, 또는 빈 결과. 단독 조회 시 `type_specific_metadata` 포함 |
| **5. 호출 가능한 하위 Engine** | 없음(리프 Engine) |
| **6. 의존하면 안 되는 Engine** | 나머지 7개 Engine 전부 |
| **7. 관련 상위 문서** | GRAMMAR_SCHEMA §3, GRAMMAR_GRAPH §6.2(3단계) |
| **8. 향후 구현 시 주의사항** | 조회 결과가 0건일 때 이를 "오류"가 아니라 **명확한 빈 결과**로 반환해야 한다. 이래야 Generation Engine이 4단계(콘텐츠 공백 신호)로 내려갈 근거를 판단할 수 있다 |

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
| **1. 책임** | 여러 노드를 교차 배치하는 순서 결정(GRAMMAR_GRAPH §7). Review Engine 산출물이나 신규 연습 세트를 입력받아 순서가 부여된 문항 시퀀스를 출력 |
| **2. 하지 않는 일** | 어떤 노드가 복습·연습 대상인지 스스로 선정하지 않는다(입력으로 받은 목록만 재정렬). 실제 문제 콘텐츠를 만들지 않는다(순서만 정한다). CONTRAST/RELATED 관계를 직접 정의하지 않는다(GRAMMAR_SCHEMA에 이미 정의된 Relation을 조회만 함) |
| **3. 입력 데이터** | 노드 ID 목록(순서 미정) |
| **4. 출력 데이터** | 순서가 부여된 노드 ID 시퀀스 |
| **5. 호출 가능한 하위 Engine** | Graph Engine(읽기, CONTRAST/RELATED 관계 조회) |
| **6. 의존하면 안 되는 Engine** | Progress Engine, Generation Engine, AI Generation Engine, Content Engine, Review Engine, Learning Flow Engine |
| **7. 관련 상위 문서** | GRAMMAR_GRAPH §7 |
| **8. 향후 구현 시 주의사항** | 입력 노드 수가 매우 적을 때(예: 2개 미만) 교차 배치 규칙 자체가 무의미해지는 경계 조건을 처리해야 한다 |

---

## 11. 공통 원칙 재확인

- **단일 쓰기 경로**: Progress 데이터는 오직 Progress Engine만 쓴다(5장, GRAMMAR_GRAPH §8).
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
| Content Engine | Stateless / Read-only | 정적 콘텐츠 조회만 수행하며 자체적으로 가변 상태를 갖지 않는다 |
| Review Engine | Stateless | 매 호출마다 입력받은 노드·오류 정보로 Cascade를 새로 계산한다 |
| Interleaving Engine | Stateless | 입력받은 노드 목록을 그때그때 재정렬할 뿐, 세션 간 기억을 유지하지 않는다 |

**원칙**: LLE 전체에서 "진짜 상태"를 갖는 Engine은 Progress Engine 하나뿐이다. 나머지 7개는 모두 Stateless(또는 Orchestrator)이므로 이론적으로 자유롭게 재시작·복제·병렬 실행할 수 있다. 이 비대칭 구조 자체가 5장 "단일 쓰기 경로" 원칙의 근거다.

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
