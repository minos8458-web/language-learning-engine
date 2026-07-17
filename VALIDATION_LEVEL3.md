# VALIDATION_LEVEL3.md
## LLE Validation Level 3 — End-to-End 동작 검증 (Tier C 부속)

> 이 문서는 **새로운 기능을 설계하지 않는다.** Tier A~D가 이미 확정한 설계(Grammar Graph, State 전이, Review Cascade, AI Generation 게이팅, Content Lifecycle)가 실제로 그 설계대로 동작하는지 검증하는 절차만 정의한다. 상위 문서와 충돌하는 결정을 이 문서가 새로 내리지 않는다 — 충돌이나 공백이 발견되면 §0에 기록하고, 해결은 해당 상위 문서의 개정 절차(`CORE_STANDARD_V1_FREEZE.md` §5)를 따른다.

문서 계층: Tier A(Core Standard) → Tier B(Language Pack) → Tier C(Production 지시서, **이 문서 포함**) → Tier D(Content)

---

## 0. 문서의 지위

- **Validation Level 체계 안에서의 위치**: `CONTENT_PRODUCTION_STANDARD.md` §4.2가 "Level 0(Schema Validation)"을 인용하며, 프로젝트 메모리에는 "Tier B(Language Pack) VI/EN/JA/ZH 4개 완료, Level 0~2 PASS"라는 기록이 있다. 이로부터 **Level 0~2는 이미 통과된 정적 검증(스키마·구조·유형론적 다양성)**이고, **Level 3는 그 위에서 처음 수행되는 동적/런타임 검증(실제 API 호출, 실제 데이터로 실제 흐름을 실행)**이라는 위치를 추론할 수 있다. 다만 `VALIDATION_FRAMEWORK.md` 원문이 이 세션에 없어 Level 0~2의 정확한 판정 기준을 인용할 수는 없다 — 이 문서는 그 기준과 **충돌하지 않는 범위**에서 Level 3를 자기완결적으로 정의한다.
- **알려진 문서 접근 공백**: Tier A 12개 문서 중 `CONCEPT_SCHEMA.md`·`VOCABULARY_SCHEMA.md`를 제외한 10개(PROJECT_VISION, LEARNING_THEORY, LEARNING_PROTOCOL, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, PROGRESS_SCHEMA, LANGUAGE_PACK_STANDARD)와 Freeze 근거 문서(`LANGUAGE_VALIDATION_SUMMARY_V1.md`, `PINYIN_NORMALIZATION_STRESS_TEST.md`)의 원문이 이 세션에 없다. 이 문서의 근거는 이들을 직접 인용한 Tier C 문서(`DOMAIN_LOGIC_BRIEF.md`, `AI_INTEGRATION_BRIEF.md`, `API_CONTRACT.md`, `ENGINE_INTERFACE.md`, `CLIENT_BRIEF.md`, `DATA_PERSISTENCE_BRIEF.md`)를 통한 **간접 근거**다. 원문 대조가 필요한 항목은 각 절에 명시한다.
- **소비 대상 문서**: `DOMAIN_LOGIC_BRIEF.md`(v1.0), `AI_INTEGRATION_BRIEF.md`(v1.0), `API_CONTRACT.md`(v1.3), `ENGINE_INTERFACE.md`(v1.6), `DATA_PERSISTENCE_BRIEF.md`(v1.4), `CLIENT_BRIEF.md`(v1.0), `CONTENT_PRODUCTION_STANDARD.md`(v1.0), `VI/EN/JA/ZH_CONTENT.md`(각 v1.0).
- **전제**: Tier D 콘텐츠 제작이 완료된 시점(85개 Grammar Node, 255개 Canonical Content, 4개 언어)에서 수행하는 검증이다.

---

## 1. Validation Level 3의 목적

Level 0~2가 "설계가 내적으로 일관되는가"(스키마 구조, 필드 정의, 유형론적 다양성)를 검증했다면, Level 3는 **"그 설계 위에 실제로 동작을 올렸을 때 설계대로 움직이는가"**를 검증한다.

구체적으로 다음 4가지를 확인한다.

1. `DOMAIN_LOGIC_BRIEF.md`가 정의한 알고리즘(State 전이, Review Cascade, AI Generation 게이팅)이 실제 입력에 대해 문서가 약속한 출력을 내는가.
2. `API_CONTRACT.md`가 정의한 5개 외부 API가 `CLIENT_BRIEF.md`의 화면 흐름과 실제로 맞물려 하루 학습 프로토콜을 완주할 수 있는가.
3. Tier D의 85개 Grammar Node·255개 Content가 실제 조회·조합 상황에서 "이미 배운 문법만 사용" 원칙을 위반 없이 서빙되는가.
4. `AI_INTEGRATION_BRIEF.md`의 화이트리스트·사후 검증 메커니즘이 실제 생성 시나리오에서 위반을 걸러내는가.

**이 문서가 하지 않는 것**: 새 알고리즘 제안, 새 API 추가, 새 Engine 설계, Tier A~D 문서의 재해석을 통한 사양 변경. 이 문서에서 발견된 불일치는 전부 해당 Tier 문서의 개정 대상으로 넘기고, 이 문서 자체는 "무엇을 어떻게 검증했는가"만 기록한다.

---

## 2. 검증 범위

### 2.1 포함(In Scope)

| 영역 | 대상 |
|---|---|
| 외부 API | `API_CONTRACT.md` §10의 5개(`start_explicit_study`, `submit_attempt`, `request_practice`, `submit_self_reported_confidence`, `start_session`) |
| Engine | Learning Flow, Graph, Progress, Generation, AI Generation, Content, Review, Interleaving (8개, `ENGINE_INTERFACE.md` §2) |
| 콘텐츠 | VI(24노드/72Content)·EN(21/63)·JA(19/57)·ZH(21/63) = 85노드/255Content |
| 클라이언트 흐름 | `CLIENT_BRIEF.md` §2 세션 흐름(REVIEW/NEW_GRAMMAR/INTERLEAVING/IDLE 4개 분기) |
| 관계 무결성 | 4개 언어 전체 Grammar Relation(VI 16 + EN 15 + JA 12 + ZH 11 = 54개) |

### 2.2 제외(Out of Scope) — 명시적 범위 제한

| 영역 | 제외 사유 |
|---|---|
| Conversation Engine 내부 동작 | 미설계(`CLIENT_BRIEF.md` §8). §9에서 진입 조건만 검증 |
| Event Engine, Audit/Logging Engine | `ENGINE_INTERFACE.md` §15~16, Reserved·미구현 |
| 클라이언트 UI 렌더링 세부(픽셀 단위 화면) | `CLIENT_BRIEF.md`는 화면 흐름·API 매핑만 정의, 실제 프론트 구현은 이 문서 범위 밖 |
| Vocabulary `features` 필드 | Controlled Open, 현재 로직 미사용(`DATA_PERSISTENCE_BRIEF.md` §3.7) |
| 5번째 언어 이후 확장성 | Tier B/C의 계속 진행 중인 영역, Level 3는 현재 4개 언어 기준 |

### 2.3 알려진 Pending과의 관계

`JA_CONTENT.md`의 Content Gap(RARERU 五段活用 예문 부재) 1건과 `EN_CONTENT.md`의 Structural Gap(NOT_YET의 `haven't...yet`) 1건은 이미 Non-blocking으로 분류되어 있다. Level 3는 이 두 건을 **새로 검증하지 않는다** — 이미 알려진 제약으로 취급하고 §12 Pass/Fail 기준에서 "통과를 막지 않는 항목"으로 명시한다.

### 2.4 실행 방식 — Mock/Real LLM 2단계

§5.2가 이미 "AI 호출 자체를 실패하도록 모킹"을 전제로 설계되어 있었다는 점에서, 이 문서의 상당 부분은 원래부터 결정론적(Mock) 실행을 염두에 두고 있었다. 이를 명시적인 2단계 실행 순서로 정리한다 — **1차가 완전히 PASS한 뒤에만 2차로 넘어간다.**

| | 1차: Mock LLM | 2차: 실제 LLM |
|---|---|---|
| **목적** | 시스템(게이팅·계약·Cascade·Engine 경계·데이터 흐름)이 설계대로 동작하는가 | 실제 생성 결과의 품질·다양성이 기대에 부합하는가 |
| **포함 절** | §3(E2E 5종), §4(Golden Test Set), §5(Grammar Gate 전체), §6 Rule 기반 검증, §7(관계 검증), §8(Review Engine), §9(Conversation 경계), §10의 구조화 출력·`self_reported_node_ids` 비신뢰·실패 처리 분기 | §6의 LLM 기반 2차 검증(독립적 프레이밍 원칙 — 실제 편향 발생 여부는 Mock으로 확인 불가), §10의 표층 변주(정의상 실제 생성 결과 없이는 성립 자체가 안 됨), §3 E2E 시나리오 재실행(전체 흐름이 실제 생성으로도 끝까지 도는지 최종 확인) |
| **왜 이렇게 나누는가** | 특정 실패를 정확한 타이밍에 결정론적으로 재현해야 하는 항목들 — 실제 LLM으로는 "정확히 이 지점에서 실패"를 안정적으로 재현할 수 없다 | 정의상 실제 생성 결과가 있어야만 검증 자체가 성립하는 항목들(다양성 비교, 진짜 편향 여부) |
| **Beta Release Gate와의 관계** | §13의 필요조건 — 1차 미통과 시 2차로 넘어가지 않는다 | 통과 실패 시 Beta를 막지 않되, 생성 품질 개선 이슈로 **별도 추적**한다(§12 Pass/Fail 기준의 "부분 실현" 취급과 같은 정신 — 아키텍처 결함과 생성 품질 문제를 같은 등급으로 섞지 않는다) |

---

## 3. End-to-End 학습 시나리오

`CLIENT_BRIEF.md` §2의 세션 흐름을 실제로 끝까지 실행하는 5개 시나리오를 정의한다. 각 시나리오는 4개 언어(VI/EN/JA/ZH) 각각에 대해 최소 1회 실행한다.

| ID | 시나리오 | 진입 `next_action` | 커버하는 API |
|---|---|---|---|
| E2E-1 | 신규 게스트 사용자 — 첫 문법 학습부터 State 승격까지 | `NEW_GRAMMAR` | `start_explicit_study` → `submit_attempt`(정답 반복) → State가 PRACTICING 이상 도달 시 `submit_self_reported_confidence` |
| E2E-2 | 오답 발생 — Review Cascade 트리거 | `NEW_GRAMMAR` 또는 `REVIEW` | `submit_attempt`(오답) → 응답의 `cascade` 필드 검증 → 선행 노드 `next_review_at` 앞당김 확인 |
| E2E-3 | 복습 배치 소진 — 재호출 원칙 | `REVIEW` | `submit_attempt` 반복 → `review_batch` 소진 → `start_session` 재호출 → 새 `next_action` 수신 |
| E2E-4 | 교차 연습 세트 | `INTERLEAVING` | `submit_attempt`(`node_sequence` 순서대로) |
| E2E-5 | 오늘 할 일 없음 | `IDLE` | `start_session`만 — Reflection 화면 생략 확인(`CLIENT_BRIEF.md` §6 예외) |

**시나리오 통과 조건**: 각 단계에서 `API_CONTRACT.md` §10이 정의한 출력 스키마와 정확히 일치하고, 클라이언트가 정책을 재계산하지 않고(§10.5 금지 사항) 서버 응답을 그대로 화면에 반영하는지 확인한다.

**오프라인 정책 별도 시나리오(E2E-6)**: `CLIENT_BRIEF.md` §5의 전송 실패 로컬 큐잉을 별도로 검증한다 — `submit_attempt` 인위적 실패 → 로컬 큐 저장 → 재전송 성공 시 지연된 승격 감지가 정상 작동하는지.

---

## 4. Golden Test Set 설계

### 4.1 설계 원칙 — 새 데이터를 만들지 않는다

Golden Test Set은 Tier D가 이미 제작한 Canonical Content를 **그대로 재사용**한다. 특히 QUIZ Content의 `type_specific_metadata.answer_key`는 이미 "입력(한국어 문제) → 기대 출력(정답 문장)" 쌍으로 존재하므로, 이를 검증용 정답 데이터로 직접 채택한다 — 별도의 테스트 데이터셋을 새로 저작하지 않는다(`CONTENT_PRODUCTION_STANDARD.md`의 제작 원칙과 이중 작업을 피하기 위함).

### 4.2 커버리지 기준

| 계층 | 기준 | 수량 |
|---|---|---|
| 노드 단위 | 85개 Grammar Node 전체, 최소 1개 QUIZ answer_key 포함 | 85/85 |
| 관계 단위 | `grammar_node_ids`에 2개 이상 노드가 걸린 QUIZ(Related/Contrast/Prerequisite 반영 사례) | 54개 관계 중 실제 QUIZ로 실현된 것 전수 |
| 시나리오 단위 | `VI/EN/JA/ZH_LANGUAGE_PACK.md` §6의 Learning Outcome Scenario(언어당 4개 = 16개) | 16/16(단, JA 시나리오2·EN 시나리오4는 부분 실현으로 별도 표기, §12 참고) |
| 동형이의 단위 | 각 언어 문서가 명시적으로 검증한 동형이의·다음자 사례(VI 3건, EN 3건, JA 4건, ZH 8건 = 18건) | 18/18 |
| **Cascade 단위** | **4개 언어의 실제 Prerequisite 관계(VI 4 + EN 5 + JA 3 + ZH 2 = 14개)를 `get_cascade` 입력으로 사용해 실제 선행 노드가 추천 목록에 정확히 포함되는지 검증** | **14/14** |

### 4.4 Phase 2와의 데이터 경계(정책)

Engine 구현(Phase 2 이후)의 단위 테스트는 **`tests/fixtures`(합성 데이터)만 사용한다** — 실제 4개 언어·255개 Content를 구현 단계 테스트에 섞으면 Validation과 Implementation의 경계가 흐려진다. 실제 VI/EN/JA/ZH Language Pack·Content를 입력으로 쓰는 모든 테스트는 이 문서(Level 3)의 Golden Test Set으로만 수행한다. 위 "Cascade 단위" 행이 그 구체적 사례다 — Review Engine 구현 자체는 fixtures로 검증하고, 실제 Prerequisite 14개를 쓰는 검증은 전부 이 절로 옮긴다.

### 4.3 실행 방식

각 Golden Test 항목은 `{input, expected_output, source_content_id}` 삼중항으로 구성한다. `source_content_id`는 Tier D 문서의 실제 Content ID(예: `CONTENT_VI_TA_QUIZ_1`)를 그대로 참조해, 테스트 실패 시 어느 Tier D 콘텐츠로 소급해야 하는지 즉시 추적 가능하게 한다.

---

## 5. Grammar Gate 검증

`DOMAIN_LOGIC_BRIEF.md` §8이 정의한 **최소 자격 기준**과 **4단계 사다리**가 실제로 지켜지는지 검증한다. (이 문서에서 "Grammar Gate"는 §8이 정의한 게이팅 로직 전체를 가리키는 이 문서 고유의 지칭이며, 상위 문서가 이 명칭을 쓰지는 않는다 — 개념은 §8을 그대로 따른다.)

### 5.1 최소 자격 기준 검증

- **긍정 케이스**: 조합에 포함된 모든 노드가 `PRACTICING` 이상인 사용자에게 조합 생성이 실제로 시도되는지.
- **부정 케이스**: 조합 중 단 하나의 노드만 `STUDYING`(자격 미달)인 경우, 그 조합 전체가 후보에서 제외되는지 — "부분 자격"으로 조합이 느슨하게 통과하지 않는지가 핵심 검증 지점이다.

### 5.2 4단계 사다리 강제 진입 테스트

인위적으로 각 단계까지 강등되는 조건을 만들어(예: AI 호출 자체를 실패하도록 모킹) 다음을 확인한다.

| 단계 | 강제 진입 방법 | 기대 동작 |
|---|---|---|
| 1(조합 생성) | 정상 조건 | 조합 생성 시도 |
| 2(단일 노드) | 1단계 후보 0개로 모킹 | 단일 노드 생성으로 완화 |
| 3(사전 제작 콘텐츠) | 1·2단계 모두 실패로 모킹 | `is_canonical=true`인 Tier D Content 반환 |
| 4(콘텐츠 공백) | 3단계까지 후보 없는 노드로 테스트(신규 언어 등 극단 사례) | 사용자 비노출, 저작 필요 로그만 기록(§11) |

---

## 6. White List 검증

`AI_INTEGRATION_BRIEF.md` §5의 사후 검증 알고리즘을 검증한다.

### 6.1 Rule 기반 1차 검증(전 단계 공통)

- 허용되지 않은 Grammar Node의 `surface_forms`가 생성 텍스트에 포함되면 위반으로 판정되는지(양성 탐지).
- 허용된 어휘(열린 집합)를 자유롭게 썼을 때 오탐하지 않는지(음성 탐지 — `VOCABULARY_SCHEMA.md` §0 원칙과의 정합성).
- 동형이의 표층형(예: EN `have`의 세 용법, ZH `了`의 le/liǎo)에 대해 문법 기능 단위로 정확히 판정하는지 — 표층형 문자열만 스캔하면 오탐 위험이 가장 높은 지점이므로 별도로 표시한다.

### 6.2 LLM 기반 2차 검증(사다리 1단계·조합 생성 전용)

- **독립성 원칙 검증**: 검증 호출이 생성 호출과 다른 프레이밍("이 문장을 분석해서 사용된 문법을 나열하라")을 실제로 사용하는지 — 같은 프롬프트를 재사용해 자기 확인 편향이 발생하지 않는지 확인한다.
- 단일 노드 생성(사다리 2단계)에는 LLM 기반 검증이 적용되지 않는다는 §5.2의 비용 절감 결정이 실제로 지켜지는지(Rule 기반만 호출됐는지 로그로 확인).

---

## 7. Related / Contrast / Alternative 검증

Tier D 제작 과정에서 노드별로 이미 자체 검증한 54개 관계(VI 16 + EN 15 + JA 12 + ZH 11)를, 이번엔 **런타임 관점**에서 재확인한다 — 저작 시점의 "콘텐츠에 반영했는가"가 아니라 "Graph Engine이 실제로 이 관계를 정확히 반환하는가"를 검증한다.

| 검증 항목 | 방법 |
|---|---|
| `find_related_nodes`(`API_CONTRACT.md` §3.2) | 54개 관계 각각에 대해 대상 노드 ID로 호출 시 상대 노드가 정확히 반환되는지 |
| Prerequisite 순환 없음 | `DOMAIN_LOGIC_BRIEF.md` §2.3 순환 검증 알고리즘을 4개 언어 전체 그래프에 실행 |
| Alternative 0건의 정당성 | EN·JA·ZH는 Alternative 관계가 0건(구조상 이중 기능 조동사 없음), VI만 1건(CO_THE↔DUOC_ABILITY) — 이 비대칭이 데이터 누락이 아니라 언어 구조 차이임을 각 언어 자체 검증 기록(Tier D 문서)과 대조 |
| 방향성(UNIDIRECTIONAL/BIDIRECTIONAL) | Prerequisite류(UNIDIRECTIONAL)가 역방향 조회 시 반환되지 않는지, Related/Contrast류(BIDIRECTIONAL)가 양방향 모두 반환되는지 |

### 7.1 Language Boundary 검증 (AUD-003, Frozen Core Standard Amendment, 2026-07-13)

`GRAMMAR_SCHEMA.md` §6의 same-language invariant와 `GRAMMAR_GRAPH.md` §3의 defense-in-depth가 실제로 지켜지는지 검증한다. 이 절은 두 종류의 검증을 분리한다 — 기존 정상 same-language relation fixture에 대한 **회귀 검증**(마지막 항목)과, **의도적으로 주입한 cross-language 위반 fixture**에 대한 **음성 검증**(그 앞의 항목들, 시스템이 이를 정확히 거부·차단하는지 확인).

| 검증 항목 | 방법 |
|---|---|
| Cross-language `PREREQUISITE` 위반 탐지 | 테스트 픽스처에 VI→EN `PREREQUISITE` 관계(예: `GRAMMAR_VI_DA → GRAMMAR_EN_PAST_SIMPLE`)를 인위적으로 주입한 뒤 `validate_language_pack`이 이를 `language_boundary_violations`에 정확히 보고하는지 |
| Cross-language `RELATED` 위반 탐지 | 동일 방식으로 `RELATED` 관계 주입 후 탐지 확인 |
| Cross-language `CONTRAST` 위반 탐지 | 동일 방식으로 `CONTRAST` 관계 주입 후 탐지 확인 |
| Cross-language `ALTERNATIVE` 위반 탐지 | 동일 방식으로 `ALTERNATIVE` 관계 주입 후 탐지 확인 |
| `is_valid` 정합성 | 위 4종 중 하나라도 위반이 존재하면 `cycle_violations`·`concept_consistency_violations`가 둘 다 비어 있어도 `is_valid = false`가 되는지 |
| `prerequisite_search`(선행 탐색) foreign-language 미반환 | 위반 데이터가 (검증 우회를 가정해) 존재하는 상황을 모킹했을 때도, 선행 탐색 결과에 시작 노드와 다른 `language`의 노드가 포함되지 않는지(runtime defense-in-depth가 배포 전 검증과 독립적으로 작동하는지) |
| `dependent_search`(후행 탐색) foreign-language 미반환 | 동일 방식으로 후행 탐색 확인 |
| `find_related_nodes` foreign-language 미반환 | 동일 방식으로 관련/대조/대체 관계 조회 확인 |
| 정상 same-language relation 회귀 없음 | 위 음성 테스트 주입 이후에도, 기존 정상 same-language relation fixture에 대한 `find_related_nodes`·선행/후행 탐색 결과가 이 Amendment 이전과 동일하게 반환되는지(§7 상단 표 항목 재실행) |

**주의**: AUD-003은 기존 관계 총수나 과거 PASS 상태를 새로 확정하지 않는다 — 이 표는 Amendment로 신설된 검증 **항목**만 정의하며, 실행 결과는 별도 실행 산출물(§14 참고)로 기록한다. 관계 총수 표기(§7 상단)의 정합성은 이 Amendment의 범위 밖이며, 필요시 별도 audit/status reconciliation 대상이다.

---

## 8. Review Engine 검증

`DOMAIN_LOGIC_BRIEF.md` §5~6을 검증한다.

**책임 경계 재확인(중요)**: Review Engine의 책임은 **Cascade 추천 목록 생성까지**다(`ENGINE_INTERFACE.md` §9.2 "Progress 상태를 직접 갱신하지 않는다"). `next_review_at` 갱신은 Review Engine이 수행하지 않으며, Learning Flow Engine이 Review Engine의 추천 목록을 받아 Progress Engine의 쓰기 API를 호출해야 실제로 반영된다 — Progress Engine이 유일한 Stateful Engine이자 유일한 쓰기 경로다(`ENGINE_INTERFACE.md` §12). 아래 항목들은 이 경계를 전제로 검증 대상을 나눈다.

- **원인 분류(SELF/TRANSFER)**: 동일 노드 반복 오답(SELF 예상)과 선행 노드 오답으로 인한 연쇄(TRANSFER 예상) 각각에 대해 `attempt_records.error_category`가 올바르게 기록되는지.
- **Cascade 추천 목록의 깊이 제한**: `get_cascade`가 반환하는 추천 목록에 `max_depth=2`를 초과하는 노드가 포함되지 않는지 — 이는 Review Engine 출력 자체의 검증이며 `next_review_at` 갱신 여부와는 별개다.
- **추천 목록 → 실제 갱신 연쇄**: Learning Flow Engine이 Review Engine의 추천 목록을 받아 Progress Engine에 `next_review_at` 갱신을 정확히 요청하는지 — 이 구간은 Review Engine이 아니라 Learning Flow Engine·Progress Engine 간의 계약으로 별도 검증한다.
- **`get_due_reviews` 우선순위**: `DOMAIN_LOGIC_BRIEF.md` §6.2가 정의한 우선순위 규칙대로 정렬되어 반환되는지(Progress Engine 책임).
- **State 연동 고정 간격**: `INTRODUCED`~`AUTOMATIC` 각 State의 복습 간격(1일~21일)이 `next_review_at` 계산에 정확히 반영되는지(Progress Engine 책임).
- **아웃박스 재시도 가능성**: `cascade_jobs` 테이블(`DATA_PERSISTENCE_BRIEF.md` §3.8)을 통한 Review Engine 추천 결과의 비동기 반영이, 핵심 트랜잭션 실패 시에도 유실되지 않는지(장애 주입 테스트) — 이 역시 Progress Engine/트랜잭션 계층의 책임이며 Review Engine 자체의 책임이 아니다.

### 8.1 Spaced Review Evidence 검증 (AUD-002, Frozen Core Standard Amendment)

`DOMAIN_LOGIC_BRIEF.md` §3.2.1·§3.2.2를 검증한다. Review Engine 자체의 책임은 아니지만(§8의 책임 경계 재확인과 동일하게, State 전이는 Progress Engine 책임), Review Scheduling(§6) 인프라를 직접 재사용하는 결정이라 이 절에 함께 둔다.

- **Burst 승격 차단**: 한 세션 안에서 연속 정답만으로 `PRACTICING → MASTERED`가 발생하지 **않는지**(음성 테스트) — qualifying spaced review 3회 미만이면 나머지 조건(정확도·confidence)을 전부 충족해도 승격이 보류되는지.
- **`is_spaced_review` 계산 시점 정확성**: 시도 처리 시점에 그 순간의(갱신 전) `next_review_at`과 비교해 계산되는지 — 계산 후 `next_review_at`이 갱신되는 순서가 뒤바뀌지 않는지(순서가 바뀌면 모든 시도가 항상 `false`이거나 항상 `true`로 오염될 위험).
- **`mastered_at` 갱신 방향 무관성**: `PRACTICING → MASTERED` 승격과 `AUTOMATIC → MASTERED` 퇴행 둘 다 `mastered_at`을 동일하게 갱신하는지.
- **퇴행 후 재진입 시 evidence 격리**: `MASTERED` 퇴행 후 재진입 시, 퇴행 이전 기간의 spaced review가 `AUTOMATIC` 판정에 재사용되지 않는지(`attempted_at > mastered_at` 조건으로 자동 격리되는지 직접 확인).
- **`MASTERED → AUTOMATIC` 2회 조건**: `mastered_at` 이후 qualifying spaced review가 2회 미만이면(정답+응답시간 조건을 만족하더라도) 승격이 보류되는지.
- **조기 연습이 due를 미루지 않는지**(AUD-002 Scheduling Clarification): State 유지 + `attempted_at < 갱신 전 next_review_at`(due 이전 자발적 조기 연습)인 시도 이후에도 `next_review_at`이 **변경되지 않는지** — 자주 연습하는 학습자가 오히려 spacing evidence를 영원히 못 채우는 역설이 재현되지 않는지.
- **due 이후 시도가 정확히 qualifying으로 기록되는지**(AUD-002): State 유지 + `attempted_at ≥ 갱신 전 next_review_at`인 시도가 `is_spaced_review=true`로 기록되고 `next_review_at`이 현재 State 간격만큼 재계산되는지.
- **비교 기준 스냅샷 오류 방지**(AUD-002): 같은 attempt 처리 안에서, 새로 계산된(갱신 후) `next_review_at`이 `is_spaced_review`나 due 판정의 비교 기준으로 잘못 쓰이지 않는지(자기 자신과 비교하는 오류가 없는지) — 코드 리뷰 또는 단위 테스트로 처리 순서(비교 → 계산) 자체를 확인.
- **`next_review_at IS NULL` 안전 처리**(AUD-002): 이 값이 NULL인 상태에서 발생한 attempt가 `is_spaced_review=false`로 기록되는지(비교 기준이 없을 때의 안전한 기본값).

**PASS 기준**: 위 9개 항목 전부 통과. 특히 "Burst 승격 차단"과 "조기 연습이 due를 미루지 않는지"는 이 Amendment 전체의 존재 이유(burst 차단 + 성실한 학습자 불이익 방지 양쪽 모두)이므로 단 하나의 예외도 없이 통과해야 한다.

---

## 9. Conversation 검증 — 범위 제한 명시

**Conversation Engine 자체는 검증 대상이 아니다** — 설계되지 않았기 때문이다(§0, §2.2). 이 절에서 검증 가능한 것은 **경계까지만**이다.

| 검증 항목 | 대상 |
|---|---|
| 진입 조건 트리거 | `start_session`이 조건 충족 시 `next_action=CONVERSATION`을 정확히 반환하는지 |
| 클라이언트 표시 | `CLIENT_BRIEF.md` §1이 명시한 "범위 밖 표시"가 실제로 노출되는지(기능 없음을 사용자에게 명확히 알리는지, 빈 화면이나 에러로 보이지 않는지) |
| 세션 흐름 유지 | `CONVERSATION` 진입 후에도 세션이 깨지지 않고 다음 `start_session` 호출로 정상 복귀하는지 |

위 기존 세 가지 기준은 그대로 유지한다. AC-012의 무한 반복 차단 계약은 다음 항목을 추가로 검증한다.

| AC-012 순환 차단 검증 | 기대 결과 |
|---|---|
| 세 진입 조건 충족 + field omitted | `next_action=CONVERSATION` |
| 세 진입 조건 충족 + explicit `false` | `next_action=CONVERSATION` |
| 동일 조건 + explicit `true` | `CONVERSATION`을 재반환하지 않고 기존 우선순위의 다음 유효한 action 반환 |
| explicit `null` 또는 non-boolean | `CONTRACT_VIOLATION` |
| boundary 화면 | 오류·빈 화면이 아닌 정상 화면으로 표시 |
| acknowledge 재호출 | 화면 확인 후 현재 세션 메모리에 true를 기록하고 `start_session(true)` 재호출 |
| 저장 부작용 | 전체 과정에서 Progress 및 DB 변경 0건 |
| 수명주기 | 앱 재시작 또는 새 세션에서 acknowledgement를 false로 초기화 가능 |

**구현 선행조건**: §9 실행 전 REVIEW, NEW_GRAMMAR, INTERLEAVING, CONVERSATION, IDLE 전체 `start_session` 결정 경로가 실제 production 코드로 구현되어야 한다. CONVERSATION-only 부분 구현, validation-only 가짜 `start_session`, production 코드의 다른 분기 mock은 금지한다. 테스트 내부 dependency injection과 fixture는 허용한다.

**PASS 기준**: 기존 3개 경계 항목과 AC-012 순환 차단 항목을 모두 통과해야 한다. Conversation Engine의 내부 품질(대화 자연스러움 등)은 계속 검증 대상 밖이며, 이 문서 개정은 §9가 현재 main에서 PASS했거나 테스트가 이미 존재한다는 뜻이 아니다.

---

## 10. AI Generation 검증

`AI_INTEGRATION_BRIEF.md` 전체를 검증한다. §5~6(White List·게이팅)은 §5~6에서 이미 다뤘으므로, 이 절은 그 외 항목에 집중한다.

- **표층 변주**: 동일 노드(조합)에 대한 반복 요청 시 `content WHERE ... ORDER BY created_at DESC LIMIT 5`로 조회한 최근 예문과 실제로 겹치지 않는 문장이 생성되는지.
- **구조화 출력**: 자유 텍스트 파싱이 아니라 JSON Schema 강제 방식이 실제로 쓰이는지, 파싱 실패 자체가 발생하지 않는지.
- **`self_reported_node_ids` 비신뢰 원칙**: AI가 자체 보고한 노드 ID를 실제 검증 근거로 쓰지 않고, 항상 §5의 독립적 절차로 재검증하는지.
- **실패 처리 분기**: 기술적 실패(즉시 1회 재시도)와 제약 위반(위반 사실 명시 후 최대 2회 재생성)이 서로 다른 재시도 횟수로 정확히 분기되는지.

---

## 11. 로그 수집 기준 — 정식 Logging Engine을 전제하지 않음

`ENGINE_INTERFACE.md` §16(Audit/Logging Engine)은 Reserved·미구현이다. 이 절은 **미래의 정식 로깅 계층을 앞당겨 설계하지 않는다** — Level 3 검증을 실행하고 결과를 추적하기 위한 **최소 임시 로그**만 정의한다. 별도 DB 테이블을 신설하지 않고(`AI_INTEGRATION_BRIEF.md` §6 "애플리케이션 로그/관측성 도구로 충분" 원칙 재사용), 검증 실행 도구 자체의 로그로 남긴다.

| 필드 | 내용 |
|---|---|
| `scenario_id` | §3~10의 시나리오/검증 ID(예: `E2E-1`, `GATE-3`) |
| `language` | VI/EN/JA/ZH |
| `input` | 호출에 사용한 입력값 |
| `expected` | Golden Test Set 또는 상위 문서가 약속한 기대 출력 |
| `actual` | 실제 응답 |
| `result` | PASS/FAIL |
| `timestamp` | 실행 시각 |

**명시적 한계**: 이 로그는 사용자별 영속 데이터가 아니라 이번 검증 실행의 디버깅용이며, `AI_INTEGRATION_BRIEF.md` §6이 정의한 실패·재시도·강등 이력 로그 원칙과 같은 성격이다. 실제 운영 단계에서 "왜 이 학습자에게 이 문제가 나왔는가"를 추적하는 정식 Audit 계층은 `ENGINE_INTERFACE.md` §16이 정의한 시점(누적 필요 확인 시)에 별도로 설계한다 — 이 문서가 그 설계를 대신하지 않는다.

---

## 12. Pass / Fail 기준

| 절 | PASS 조건 |
|---|---|
| §3 E2E 시나리오 | 5개 시나리오 × 4개 언어 = 20개 실행 전부 API 스키마 일치 |
| §4 Golden Test Set | 노드 85/85, 관계는 실현된 것 전수, 시나리오 16/16(부분 실현 2건은 "실현된 범위 내 통과"로 별도 표기) |
| §5 Grammar Gate | 최소 자격 기준 위반 0건, 4단계 사다리 각 단계 정상 진입·강등 확인 |
| §6 White List | Rule 기반 양성 탐지율 100%, 음성 탐지(오탐) 0건, LLM 기반 독립성 원칙 확인 |
| §7 관계 검증 | 54개 관계 전수 `find_related_nodes` 정확 반환, 순환 0건, **Language Boundary 위반 주입 테스트(§7.1) 전부 정확히 탐지·차단** |
| §8 Review Engine | Cascade 깊이 위반 0건, `get_due_reviews` 우선순위 규칙 일치 |
| §9 Conversation | 기존 3개 경계 항목 + AC-012 순환 차단 검증 전부 통과(Conversation Engine 내부 동작은 판정 대상 아님) |
| §10 AI Generation | 표층 변주 중복 0건, 실패 처리 분기 정확 |

**부분 실현 사례의 취급**: JA 시나리오2(`する` 대체)·EN 시나리오4(`go`→`work` 대체)는 "문법 조합은 완전 실현, 어휘만 대체"로 이미 각 언어 문서에 기록되어 있다. Level 3는 이 두 건을 **FAIL로 재판정하지 않는다** — 어휘 대체가 문서화된 판단에 따른 것이므로, "문법 조합 기준" PASS로 취급한다.

---

## 13. Beta Release Gate

다음 조건을 **모두** 충족하면 Beta Release가 가능하다.

1. §2.4의 **1차(Mock LLM)가 전 항목 PASS**. 이것이 Beta Release의 필요조건이다.
2. §12의 모든 절이 (1차 기준으로) PASS.
3. Pending 2건(JA RARERU Content Gap, EN NOT_YET Structural Gap)은 이미 Non-blocking으로 분류되어 있으므로 Gate를 막지 않는다 — 다만 Beta 공지에 알려진 제약으로 명시한다.
4. Conversation 기능은 Beta 범위에서 "제공되지 않음"으로 명시한다(§9) — 이는 검증 실패가 아니라 기능 범위 결정이다.
5. §11의 임시 로그를 통해 §3~10 전체 실행 기록이 재현 가능한 형태로 남아 있다.

**2차(실제 LLM)는 Beta Release Gate의 필요조건이 아니다** — §2.4가 명시한 대로, 2차 미통과는 아키텍처 결함이 아니라 생성 품질 이슈이므로 Beta를 막지 않고 별도 트랙(생성 품질 개선 백로그)으로 추적한다. 단, 2차를 아예 실행하지 않은 채 Beta를 출시하지는 않는다 — 실행은 필수, 그 결과로 Gate를 막지는 않는다는 뜻이다.

**Gate를 막는 조건**(다음 중 하나라도 발생 시 Beta 보류):
- Grammar Gate 최소 자격 기준 위반이 실제로 발생(§5.1 부정 케이스 실패)
- White List Rule 기반 검증이 허용되지 않은 문법을 실제로 통과시킴(§6.1 양성 탐지 실패)
- 4개 언어 중 하나라도 E2E 시나리오가 세션 흐름을 완주하지 못함(§3)
- Review Cascade가 `max_depth=2`를 위반해 무제한 확산(§8)
- **Cross-language 관계 위반이 `language_boundary_violations`로 탐지되지 않거나, runtime traversal이 foreign-language 노드를 반환함(§7.1, AUD-003)**

**이 문서가 최종 승인을 대신하지 않는다**: §13의 조건 충족 여부 판정과 실제 Beta Release 결정은 `PROJECT_VISION.md` §6 의사결정 원칙(원문 미확인, §0 참고)에 준하는 사용자 승인 사항이다. 이 문서는 판정 기준만 제공한다.

---

## 14. 다음 단계(제안)

1. §11 임시 로그 형식으로 §3~10을 실제 실행 — 이 문서가 아니라 별도 실행 산출물(테스트 리포트)로 남긴다.
2. `VALIDATION_FRAMEWORK.md` 원문 확보 시 §0의 추론(Level 0~2 위치)을 원문 대조로 확정.
3. 실행 결과 §12에서 FAIL이 나온 항목은 해당 Tier 문서(A~D)의 개정 대상으로 넘긴다 — 이 문서를 고쳐 기준을 낮추지 않는다.

---

## 15. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-08 | 최초 작성. 작성 전 Tier A 문서 접근 공백(10/12 부재) 및 `VALIDATION_FRAMEWORK.md` 부재를 발견해 §0에 기록, Tier C 문서를 통한 간접 근거로 진행. Conversation Engine 미정의(§9 범위를 진입 조건까지로 제한)와 Audit/Logging Engine 미구현(§11을 최소 임시 로그로 한정)을 반영해 상위 문서와 충돌하지 않도록 설계. End-to-End 시나리오 5종, Golden Test Set(85노드/54관계/16시나리오/18동형이의 기준), Grammar Gate(최소 자격+4단계 사다리), White List(Rule+LLM 이중 검증), Related/Contrast/Alternative 런타임 재검증, Review Engine(Cascade+Scheduling), AI Generation(표층 변주+독립성 원칙), Pass/Fail 기준, Beta Release Gate 정의 |
| 1.1 | 2026-07-08 | Phase 2(Review Engine 구현) 착수 전 Development 세션 피드백 반영. (1) §8이 Review Engine을 "Cascade가 `next_review_at`을 갱신"하는 것처럼 서술했던 책임 혼동을 정정 — `ENGINE_INTERFACE.md` §9.2·§12에 따라 Review Engine은 추천 목록 생성까지만 책임지고, 실제 `next_review_at` 갱신은 Learning Flow Engine이 Progress Engine 쓰기 API를 호출해 수행함을 명시. (2) §4.2에 "Cascade 단위"(4개 언어 실제 Prerequisite 관계 14개) Golden Test 항목 신설, §4.4 "Phase 2와의 데이터 경계" 정책 추가 — Engine 구현 단계 테스트는 `tests/fixtures`만 사용하고, 실제 VI/EN/JA/ZH Language Pack·Content를 쓰는 검증은 전부 이 문서(Level 3)로 이관한다는 원칙을 명문화 |
| 1.2 | 2026-07-08 | 전체 Blocker 해소 후 마지막 Architecture 결정 — Level 3를 Mock LLM으로 실행할지 실제 LLM으로 실행할지 질의에 **2단계(C안)** 채택. §2.4 신설 — §5.2가 이미 모킹을 전제로 설계돼 있었던 것을 근거로, 결정론적 재현이 필요한 항목(§3~5, §7~9, §10 일부)은 1차 Mock, 정의상 실제 생성 결과가 있어야만 성립하는 항목(§6 LLM 기반 검증, §10 표층 변주)은 2차 실제 LLM으로 명확히 분리. §13 Beta Release Gate를 1차 PASS만 필요조건으로 하고 2차는 별도 트랙(생성 품질 개선 백로그)으로 관리하도록 갱신 |
| 1.3 | 2026-07-13 | Independent Architecture Audit(AUD-002), **Frozen Core Standard Amendment** — §8.1 신설. `DOMAIN_LOGIC_BRIEF.md` §3.2.1·§3.2.2(Spaced Review Evidence)가 실제로 burst 승격을 차단하는지 검증하는 5개 항목 정의(Burst 차단, `is_spaced_review` 계산 시점, `mastered_at` 방향 무관 갱신, 퇴행 후 evidence 격리, AUTOMATIC 2회 조건). "Burst 승격 차단"은 이 Amendment의 존재 이유이므로 예외 없이 PASS해야 함을 명시 |
| 1.4 | 2026-07-13 | AUD-002 Scheduling/Evidence Clarification 반영 — §8.1에 검증 항목 4개 추가(조기 연습이 due를 미루지 않는지, due 이후 시도가 정확히 qualifying 기록되는지, 비교 기준 스냅샷 오류 방지, `next_review_at IS NULL` 안전 처리). "조기 연습이 due를 미루지 않는지"도 Burst 차단과 동급의 무예외 PASS 기준으로 승격 |
| 1.5 | 2026-07-13 | Independent Architecture Audit(AUD-003), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — §7.1 신설(Language Boundary 검증). Cross-language `PREREQUISITE`/`RELATED`/`CONTRAST`/`ALTERNATIVE` 4종 위반 주입 탐지, `is_valid` 정합성, runtime traversal(선행/후행 탐색·`find_related_nodes`) foreign-language 미반환, 정상 same-language relation fixture 회귀 없음까지 9개 검증 항목 정의. §12 Pass/Fail 기준과 §13 Beta Release Gate 차단 조건에 반영. AUD-003은 기존 관계 총수나 과거 PASS 상태를 새로 확정하지 않음을 명시(§7.1 하단 주의) — 관계 총수 표기 정합성은 이 Amendment 범위 밖 |
| 1.6 | 2026-07-17 | AC-012 Tier C Architecture Clarification — §9의 기존 세 경계 PASS 기준을 보존하면서 omitted/false/true/null/non-boolean, 정상 boundary 표시, acknowledge 재호출, Progress/DB 무변경, 새 세션 초기화 순환 차단 검증을 추가. 전체 start_session production 경로 구현을 선행조건으로 명시하고 Conversation Engine 내부 품질은 계속 범위 밖으로 유지. §9 PASS 또는 current-main 테스트 존재를 선언하지 않음 |
