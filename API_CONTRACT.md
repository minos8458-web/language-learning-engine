# API_CONTRACT.md
## LLE Engine API Contract (Tier C)

> 이 문서는 **알고리즘을 설명하지 않는다.** 각 API가 "무엇을 입력받고, 무엇을 반환하며, 빈 결과와 에러를 어떻게 구분하는가"만 정의한다. Graph 탐색 방식, Cascade 계산 방식, Generation 알고리즘 자체는 ENGINE_INTERFACE.md와 GRAMMAR_GRAPH.md의 책임이며 이 문서에 포함하지 않는다.

문서 계층: Tier A → Tier C `ENGINE_INTERFACE.md` → **Tier C `API_CONTRACT.md`(이 문서)**

---

## 0. 문서의 지위

- 이 문서는 ENGINE_INTERFACE.md가 정의한 8개 Engine·호출 계층을 그대로 전제한다. Engine 경계가 바뀌면 이 문서도 함께 개정한다.
- 이 문서가 정의하는 것은 오직 **입출력 계약**이다. 내부 구현·알고리즘·자료구조는 이 문서의 범위가 아니다.
- API가 내부 상태를 직접 노출하는 것을 금지한다 — 예: Review Cascade가 어떤 알고리즘으로 계산됐는지는 쓰지 않고, 결과 노드 목록과 근거 요약 정도만 반환한다.

---

## 1. 목적 및 범위

**일반 사용자(외부 클라이언트)는 오직 Learning Flow Engine API(10장)를 통해서만 시스템에 진입한다.** 3~9장(Graph/Progress/Generation/AI Generation/Content/Review/Interleaving Engine API)은 **내부 Engine 간 호출에만 쓰이는 계약**이며 외부에 직접 노출되지 않는다.

| 계층 | 대상 | 문서 위치 |
|---|---|---|
| 외부 진입점 | 일반 사용자(클라이언트) | 10장 Learning Flow Engine API |
| 내부 계약 | Engine ↔ Engine | 3~9장 |

---

## 2. 공통 규칙

- **ID 참조**: 모든 입출력의 노드·개념·콘텐츠 참조는 IDENTIFIER_STANDARD.md의 canonical ID만 사용한다. 자연어 레이블·표면 형태로 참조하지 않는다.
- **언어 코드**: `language` 파라미터는 항상 ISO 639-1 두 글자 대문자(IDENTIFIER_STANDARD.md §3 관례).
- **`empty_result`와 `error`의 구분(핵심)**:

| 구분 | 정의 | 예 |
|---|---|---|
| **empty_result** | 요청이 유효했고 정상적으로 처리했지만, 조건에 맞는 결과가 없는 경우 | Content 조회 조건에 맞는 콘텐츠가 없음, 선행 관계가 아예 없는 노드의 Cascade 조회 |
| **error** | 계약 위반 — 존재하지 않는 ID, 필수 필드 누락, 허용되지 않는 호출 주체, 값 범위 위반 등 | 존재하지 않는 node_id, `is_correct=true`인데 `error_category`가 채워진 경우 |

- **알고리즘 비노출 원칙**: 모든 API는 "왜 이 결과가 나왔는가"의 세부 계산 과정을 반환하지 않는다. 필요한 경우 결과에 대한 **근거 요약**(예: "이 관계 때문에 선정됨")만 포함하며, 계산식·가중치·내부 점수는 포함하지 않는다.

---

## 3. Graph Engine API

### 3.1 find_prerequisites (선행 탐색)

| 항목 | 내용 |
|---|---|
| API 이름 | `find_prerequisites` |
| 호출 주체 | Review Engine, AI Generation Engine, Interleaving Engine, Learning Flow Engine |
| 입력 | `node_id`, `max_depth` |
| 출력 | 선행 노드 ID 목록(가까운 순서로 정렬) |
| 빈 결과 | 해당 노드에 선행 관계가 전혀 없음 → 빈 목록(정상) |
| 에러 | `node_id`가 존재하지 않는 Grammar Node ID인 경우, `max_depth` < 1인 경우 |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | 탐색 알고리즘(순회 방식 등)을 응답에 포함하지 않는다 |

### 3.2 find_related_nodes

| 항목 | 내용 |
|---|---|
| API 이름 | `find_related_nodes` |
| 호출 주체 | Review Engine, AI Generation Engine, Interleaving Engine, Learning Flow Engine |
| 입력 | `node_id`, `relation_type`(선택: RELATED\|CONTRAST\|ALTERNATIVE, 미지정 시 전체) |
| 출력 | `{related_node_id, relation_type, weight}` 목록 |
| 빈 결과 | 해당 조건의 관계가 없음 → 빈 목록 |
| 에러 | `node_id` 미존재, `relation_type`이 정의되지 않은 값 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | `weight`를 어떻게 활용할지(정렬 기준 등)는 이 API가 정하지 않는다 — 호출자의 몫 |

### 3.3 validate_language_pack

| 항목 | 내용 |
|---|---|
| API 이름 | `validate_language_pack` |
| 호출 주체 | Language Pack 배포 파이프라인(실시간 사용자 요청이 아님, GRAMMAR_GRAPH §3 배포 전 검증) |
| 입력 | `language` |
| 출력 | `{is_valid, cycle_violations[], concept_consistency_violations[]}` |
| 빈 결과 | 위반 사항이 없으면 위반 목록은 빈 배열 — 이는 empty_result가 아니라 **정상적인 유효 응답**(구분 주의) |
| 에러 | 해당 `language`의 Grammar Node/Relation 데이터가 아예 존재하지 않는 경우 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 검증 알고리즘의 세부 로직을 응답에 포함하지 않는다 — 위반 목록만 반환 |

---

## 4. Progress Engine API

### 4.1 get_progress

| 항목 | 내용 |
|---|---|
| API 이름 | `get_progress` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_id` |
| 출력 | `state`, `accuracy`, `confidence_inferred`, `confidence_self_reported`, `confidence_calibration_delta`, `avg_response_time_ms`, `explicit_study_event_at`, `next_review_at` |
| 빈 결과 | 해당 조합의 Progress 레코드가 없음 → `state = NOT_INTRODUCED`인 기본값 반환(이는 "빈 결과"가 아니라 정의된 기본 상태) |
| 에러 | `user_id`/`node_id` 형식 오류 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | `recent_attempts` 원시 배열 전체를 노출하지 않는다 — 요약 지표만 반환 |

### 4.2 get_eligible_nodes

| 항목 | 내용 |
|---|---|
| API 이름 | `get_eligible_nodes` |
| 호출 주체 | AI Generation Engine |
| 입력 | `user_id`, `language` |
| 출력 | `state`가 PRACTICING/MASTERED/AUTOMATIC인 노드 ID 목록 |
| 빈 결과 | 조건을 만족하는 노드가 하나도 없음(완전 초심자) → 빈 목록(정상, Generation Engine의 사다리 판단 근거) |
| 에러 | `user_id` 미존재, `language` 코드 형식 오류 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 없음(공통 규칙만 준수) |

### 4.3 record_explicit_study

| 항목 | 내용 |
|---|---|
| API 이름 | `record_explicit_study` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_id`, `timestamp` |
| 출력 | 갱신된 `state`(NOT_INTRODUCED→INTRODUCED) |
| 빈 결과 | 해당 없음(쓰기 API는 성공/실패만 있음) |
| 에러 | 존재하지 않는 `node_id`. 이미 INTRODUCED 이상인 노드에 대한 재요청은 에러가 아니라 현재 상태를 그대로 반환(멱등 처리) |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | Learning Flow Engine 이외의 호출 주체 요청을 수락하지 않는다 |

### 4.4 record_attempt

| 항목 | 내용 |
|---|---|
| API 이름 | `record_attempt` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_id`, `is_correct`, `response_time_ms`, `correction_count`, `hint_used`, `error_category`(선택), `error_subcategory`(선택) |
| 출력 | 갱신된 `state`, `accuracy`, `confidence_inferred` |
| 빈 결과 | 해당 없음 |
| 에러 | `is_correct=true`인데 `error_category`가 null이 아닌 경우(GRAMMAR_SCHEMA §5 제약 위반), `node_id` 미존재 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 상태가 바뀐 계산 근거(수식)를 응답에 포함하지 않는다 |

### 4.5 record_self_reported_confidence

| 항목 | 내용 |
|---|---|
| API 이름 | `record_self_reported_confidence` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_id`, `confidence_self_reported` |
| 출력 | 계산된 `confidence_calibration_delta` |
| 빈 결과 | 해당 없음 |
| 에러 | `confidence_self_reported`가 0~1 범위를 벗어난 경우, 비교할 `confidence_inferred`가 아직 없는 경우 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 보정 계산식을 응답에 포함하지 않는다 |

### 4.6 get_concept_coverage_depth

| 항목 | 내용 |
|---|---|
| API 이름 | `get_concept_coverage_depth` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `concept_id`, `language` |
| 출력 | `coverage`(0~1), `depth`(0~1) |
| 빈 결과 | 해당 언어에 그 Concept을 표현하는 노드가 아예 없음(Language Pack 미구현) → `coverage`/`depth` 모두 **null**(0%와 "아직 알 수 없음"은 다른 의미이므로 구분) |
| 에러 | `concept_id`가 CONCEPT_SCHEMA에 존재하지 않는 경우 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 집계에 사용된 개별 노드별 상태 원본을 나열하지 않는다 — 요약값만 반환 |

### 4.7 get_due_reviews

| 항목 | 내용 |
|---|---|
| API 이름 | `get_due_reviews` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `language`, `now`, `limit`(선택), `concept_id`(선택), `state_filter`(선택) |
| 출력 | `due_review_items` 배열 — 각 원소: `{node_id, state, next_review_at, overdue_by, priority, reason}` |
| 빈 결과 | 복습 기한이 도래한 노드가 없으면 `due_review_items = []`(정상, 에러 아님 — PROGRESS_SCHEMA §5의 "Review Queue는 저장 엔터티가 아니다" 원칙을 실제로 구현하는 조회 API) |
| 에러 | `user_id` 누락, `language` 코드 형식 오류, `now` 값 누락 또는 형식 오류 |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | 이 API는 복습 대상을 **확정**하거나 상태를 변경하지 않는다 — 순수 조회다. 상태 변경은 `record_attempt` 등 별도의 Progress 쓰기 API를 통해서만 이루어진다. `priority` 산정에 쓰인 알고리즘 세부(가중치 계산 등)는 노출하지 않으며, `reason`은 근거 요약(예: "정기 복습 주기 도달")만 포함한다 |

**필드 설명**: `overdue_by`는 `next_review_at`을 얼마나 지났는지를 나타내는 경과 시간이다. `priority`는 정렬을 위한 값이며 정확한 계산식은 HOW 단계(Progress Engine 구현)에서 정의한다 — 이 API는 "정렬된 결과가 나온다"는 계약만 보장하고 정렬 기준 자체를 노출하지 않는다(공통 규칙 알고리즘 비노출 원칙).

**LEARNING_PROTOCOL.md와의 연결**: 이 API는 LEARNING_PROTOCOL §3(Learning State Assessment)이 "진행 중인 Review Queue"를 조회하는 실제 경로이며, `limit`은 §5(Session Budget)가 배정한 Review 몫만큼만 가져오는 데 쓰인다.

---

## 5. Generation Engine API

### 5.1 generate_problem

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_problem` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `language`, `target_concept_id`(선택, 1~2단계용), `target_node_id`(선택, **3단계 PRE_MADE fallback 전용** — AC-005, 2026-07-08 Resolved) |
| 출력 | `{content, content_id, source: AI_GENERATED\|PRE_MADE, ladder_step: 1~4}` — **`content_id` 추가(AC-008, 2026-07-08 Resolved)**: AI_GENERATED든 PRE_MADE든 반환 전 `content` 테이블에 영속화된 ID |
| 빈 결과 | 사다리 1~3단계 모두 실패 → `content = null`, `content_id = null`, `ladder_step = 4`(콘텐츠 공백 신호). 이는 에러가 아니라 정상적으로 판단한 결과가 없다는 빈 결과 |
| 에러 | `target_concept_id`가 존재하지 않는 Concept ID, `target_node_id`가 존재하지 않는 Grammar Node ID, `language` 코드 오류 |
| 호출 가능한 하위 Engine | AI Generation Engine, Content Engine |
| 금지 사항 | 어느 단계에서 왜 실패했는지의 상세 내역(예: "후보 3개 중 2개 필터 탈락")을 응답에 포함하지 않는다 — `ladder_step`과 최종 결과만 반환 |

**AC-005 관련 규칙**: `target_node_id`는 Generation Engine이 계산하지 않는다 — Learning Flow Engine이 이미 보유한 Progress Engine 읽기 권한으로 결정해 전달하며, Generation Engine은 3단계에서 이 값을 Content Engine으로 그대로 릴레이만 한다. 클라이언트는 이 값을 알거나 전달할 필요가 없다(전적으로 서버 내부 결정). 선택 규칙 자체는 `DOMAIN_LOGIC_BRIEF.md` §8.1(AC-009, Provisional) 참고.

---

## 6. AI Generation Engine API

### 6.1 generate_combination (사다리 1단계)

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_combination` |
| 호출 주체 | Generation Engine |
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | 생성된 문제/문장(둘 이상의 노드 조합) + `content_id`(영속화된 ID, AC-008) 또는 실패 신호 |
| 빈 결과 | 조합 가능한 후보가 2개 미만이라 생성 불가 → 실패 신호(빈 결과, 에러 아님) |
| 에러 | `user_id`/`language` 형식 오류 |
| 호출 가능한 하위 Engine | Graph Engine(읽기), Progress Engine(읽기) |
| 금지 사항 | 필터 파이프라인의 단계별 통과/탈락 내역을 노출하지 않는다(GRAMMAR_GRAPH §6.1 알고리즘 비공개) |

### 6.2 generate_single_node (사다리 2단계)

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_single_node` |
| 호출 주체 | Generation Engine |
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | 생성된 문제/문장(단일 노드) + `content_id`(영속화된 ID, AC-008) 또는 실패 신호 |
| 빈 결과 | Practicing 이상 노드가 0개 → 실패 신호 |
| 에러 | `user_id`/`language` 형식 오류 |
| 호출 가능한 하위 Engine | Graph Engine(읽기), Progress Engine(읽기) |
| 금지 사항 | 6.1과 동일 |

---

## 7. Content Engine API

### 7.1 get_content

| 항목 | 내용 |
|---|---|
| API 이름 | `get_content` |
| 호출 주체 | Generation Engine(`EXAMPLE` 조회), Learning Flow Engine(`EXPLANATION` 조회, `content_id` 단독 조회로 진단 정보 조회) |
| 입력 | 조건 기반 모드: `node_id`, `content_type`, `meta_language`(선택), `explanation_level`(선택) / **단독 정확 조회 모드(AC-008, 2026-07-08 Resolved)**: `content_id` 단독 — 기존 조건 기반 조회와 별개 모드로, 정확히 그 레코드 하나만 반환 |
| 출력 | 조건에 맞는 Content 레코드 목록(조건 기반) / 단일 Content 레코드(단독 조회) — `type_specific_metadata` 포함(Learning Flow Engine이 SELF/TRANSFER 분류에 사용) |
| 빈 결과 | 조건에 맞는 콘텐츠가 없음 → 빈 목록(정상, Generation Engine의 사다리 4단계 판단 근거) |
| 에러 | `node_id` 미존재, `content_id` 미존재(단독 조회 모드), `content_type`이 정의되지 않은 값 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 콘텐츠가 없을 때 유사한 다른 콘텐츠로 임의 대체해 반환하지 않는다 — 빈 결과는 빈 결과 그대로, 대체 판단은 호출자의 몫 |

---

## 8. Review Engine API

### 8.1 get_cascade

| 항목 | 내용 |
|---|---|
| API 이름 | `get_cascade` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `node_id`, `error_category`(SELF\|TRANSFER), `max_cascade_depth`, **`progress_snapshot`**(AC-001, 2026-07-08 Resolved — `{node_id: state}` 맵, 해당 언어 전체 노드 상태를 Learning Flow Engine이 `get_progress`로 미리 조회해 전달) |
| 출력 | `{node_id, reason}` 우선순위 목록 |
| 빈 결과 | `error_category = SELF`인 경우(탐색 자체를 하지 않으므로 원천적으로 빈 목록), 또는 TRANSFER지만 선행 관계가 없는 노드인 경우 |
| 에러 | `node_id` 미존재, `max_cascade_depth` < 1 |
| 호출 가능한 하위 Engine | Graph Engine(읽기) |
| 금지 사항 | 각 노드가 선정된 정확한 가중치 계산 과정을 노출하지 않는다 — "이 관계 때문에 선정됨" 수준의 근거 요약만 포함. Review Engine은 Progress Engine을 직접 호출하지 않는다 — `progress_snapshot`에 없는 노드는 `NOT_INTRODUCED`로 처리(안전한 기본값) |

---

## 9. Interleaving Engine API

### 9.1 sequence_nodes

| 항목 | 내용 |
|---|---|
| API 이름 | `sequence_nodes` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `node_id` 목록 |
| 출력 | 순서가 부여된 `node_id` 목록 |
| 빈 결과 | 입력 목록이 비어 있으면 빈 목록 반환(에러 아님) |
| 에러 | 목록에 존재하지 않는 `node_id`가 포함된 경우 |
| 호출 가능한 하위 Engine | Graph Engine(읽기) |
| 금지 사항 | 정렬 알고리즘의 내부 점수·기준을 응답에 노출하지 않는다 |

---

## 10. Learning Flow Engine API (외부 진입점)

**이 장의 API만 외부 클라이언트에 노출된다.** 3~9장은 이 API들의 내부 구현이 다른 Engine을 호출할 때만 쓰인다.

### 10.1 start_explicit_study

| 항목 | 내용 |
|---|---|
| API 이름 | `start_explicit_study` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `node_id` |
| 출력 | `EXPLANATION` 콘텐츠, 갱신된 `state`(INTRODUCED) |
| 빈 결과 | 해당 노드의 `EXPLANATION` 콘텐츠가 아직 없음(콘텐츠 공백) → 콘텐츠 필드 null, `state`는 정상 갱신(콘텐츠 부재가 상태 전이를 막지 않는다) |
| 에러 | `node_id` 미존재. 이미 INTRODUCED 이상인 상태에서의 중복 호출은 에러가 아니라 멱등 처리(4.3과 동일 정책) |
| 호출 가능한 하위 Engine | Content Engine, Progress Engine |
| 금지 사항 | 없음(외부 진입점, 공통 규칙만 준수) |

### 10.2 submit_attempt

| 항목 | 내용 |
|---|---|
| API 이름 | `submit_attempt` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `node_id`, `is_correct`, `response_time_ms`, `correction_count`, `hint_used`, **`content_id`**(AC-008, 2026-07-08 Resolved — 클라이언트는 직전 `generate_problem`/`get_content` 응답에서 받은 값을 그대로 되돌려줄 뿐 스스로 만들어내지 않는다) |
| 출력 | `{is_correct, updated_state, cascade(오답인 경우), next_content}` |
| 빈 결과 | 오답이지만 Cascade 결과가 빈 목록인 경우(선행 관계 없는 노드) → `cascade = []` 그대로 반환 |
| 에러 | `user_id`/`node_id` 미존재, `content_id` 미존재 |
| 호출 가능한 하위 Engine | Progress Engine, Review Engine, Interleaving Engine, Generation Engine, Content Engine(AC-008 — `content_id`로 `type_specific_metadata` 조회해 SELF/TRANSFER 진단) |
| 금지 사항 | 오답 원인 분류(SELF/TRANSFER)의 판단 근거를 상세히 설명하지 않는다 — 분류 결과와 다음 행동만 반환. `error_category`를 클라이언트가 직접 지정하도록 허용하지 않는다(서버가 `content_id` 기반으로 판정) |

**AC-008 진단 규칙**: `content.type_specific_metadata.error_attributed_node_id`(AC-011, `DOMAIN_LOGIC_BRIEF.md` §5.1)가 있으면 그 값을, 없거나 `primary_node_id`와 같으면 SELF로 분류한다. 진단 정보가 없으면 항상 SELF가 기본값 — 이 패치는 진단을 **가능**하게 할 뿐 TRANSFER를 강제하지 않는다.

### 10.3 request_practice

| 항목 | 내용 |
|---|---|
| API 이름 | `request_practice` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | Generation Engine의 `generate_problem` 결과를 그대로 전달(`content_id` 포함, AC-008) |
| 빈 결과 | `ladder_step = 4`(콘텐츠 공백)인 경우 → 빈 결과 그대로 전달, 클라이언트에는 "아직 준비되지 않음" 신호로 노출 |
| 에러 | `language` 코드 오류 |
| 호출 가능한 하위 Engine | Generation Engine |
| 금지 사항 | 없음 |

**참조(AC-009, 2026-07-08 Provisional)**: `target_concept_id`가 여러 노드에 대응할 때 Generation Engine 3단계로 넘길 `target_node_id`를 어떻게 좁히는지의 선택 규칙은 이 API의 계약이 아니라 `DOMAIN_LOGIC_BRIEF.md` §8.1(Provisional)에 정의되어 있다. 이 규칙은 `LEARNING_PROTOCOL.md` 확보 후 재검토 예정이며, 확정 전까지는 Provisional 상태로 적용된다.

### 10.4 submit_self_reported_confidence

| 항목 | 내용 |
|---|---|
| API 이름 | `submit_self_reported_confidence` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `node_id`, `confidence_self_reported` |
| 출력 | Progress Engine `record_self_reported_confidence`(4.5)의 결과를 그대로 전달 — 계산된 `confidence_calibration_delta` |
| 빈 결과 | 해당 없음 |
| 에러 | `confidence_self_reported`가 0~1 범위를 벗어난 경우, 비교할 `confidence_inferred`가 아직 없는 경우(4.5와 동일) |
| 호출 가능한 하위 Engine | Progress Engine |
| 금지 사항 | 보정 계산식을 응답에 포함하지 않는다 |

> **MIGRATION_GUIDE.md Entry 004 반영(2026-07-07)**: `record_self_reported_confidence`(4.5)가 "호출 주체: Learning Flow Engine"으로 정의되어 있었으나 이를 트리거할 외부 진입점이 이 장에 없어 도달 불가능한 API였다는 점을 발견해 신설. API 개수 19개 → 20개.

### 10.5 start_session

| 항목 | 내용 |
|---|---|
| API 이름 | `start_session` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `language` |
| 출력 | `next_action`(단일 결정값 — `REVIEW`\|`NEW_GRAMMAR`\|`INTERLEAVING`\|`CONVERSATION`\|`IDLE` 중 하나) + 해당 액션 수행에 필요한 데이터(예: `REVIEW`면 `get_due_reviews` 결과, `NEW_GRAMMAR`면 다음 노드 정보) |
| 빈 결과 | 오늘 더 이상 할 것이 없음 → `next_action = IDLE` |
| 에러 | `user_id` 미존재, `language` 코드 오류 |
| 호출 가능한 하위 Engine | Progress Engine, Review Engine, Generation Engine, Interleaving Engine |
| 금지 사항 | 클라이언트가 정책을 재판단하지 않도록, 원시 후보 목록이 아니라 `next_action` 단일 결정값만 반환한다(설계 원칙) |

> **MIGRATION_GUIDE.md Entry 005 반영(2026-07-07)**: 기존 4개 외부 API 중 어떤 것도 "지금 어떤 `node_id`를 다뤄야 하는가"를 클라이언트에 알려주지 않아 세션을 시작할 방법 자체가 없었다는 공백을 발견해 신설. API 개수 20개 → 21개.
>
> ⚠️ **복구 근거 및 불확실성 표시**: 이 절의 필드 정의는 `MIGRATION_GUIDE_ENTRIES_004_005.md`, `PHASE_2_COMPLETION_REPORT.md` §3.1(`next_action` 9개 분기: REVIEW 2경로·NEW_GRAMMAR·제외·동시진행제한·INTERLEAVING 2건·CONVERSATION·IDLE 언급), `BOOTSTRAP.md`/`PROJECT_MASTER_INDEX.md`(API 5개 전제)를 근거로 **재구성한 것이며, 원본 API_CONTRACT.md v1.3의 정확한 원문(예: 출력 필드의 정확한 명칭, 9개 분기 각각의 정밀한 트리거 조건)은 코드베이스 유실로 확인 불가하다.** 재구현 착수 전 이 절을 검토해 원문과 다르면 수정 지시 바란다.

---

## 11. 에러·예외 계약 (공통 형식)

- **empty_result 응답 형식**: `{status: "empty", data: null 또는 []}`
- **error 응답 형식**: `{status: "error", error_code, message}`
- **공통 error_code**: `INVALID_ID`(존재하지 않는 ID 참조), `MISSING_REQUIRED_FIELD`(필수 필드 누락), `UNAUTHORIZED_CALLER`(허용되지 않은 호출 주체), `OUT_OF_RANGE_VALUE`(값 범위 위반), `CONTRACT_VIOLATION`(그 외 계약 위반 — 예: `is_correct=true`인데 `error_category` 존재)
- **호출 주체 위반**은 항상 `UNAUTHORIZED_CALLER`로 분류한다 — 예: Progress Engine의 쓰기 API를 Learning Flow Engine이 아닌 Engine이 호출한 경우

---

## 12. 금지 사항

- 알고리즘 세부(탐색 방식, 계산식, 필터 통과/탈락 내역)를 응답에 노출하는 것
- 이 문서에 정의되지 않은 필드를 임의로 반환하는 것
- `empty_result`를 `error`로, `error`를 `empty_result`로 잘못 표현하는 것
- 호출 주체 검증 없이 임의의 Engine·클라이언트의 호출을 수락하는 것
- Progress Engine의 `recent_attempts` 원본을 그대로 노출하는 것(4.1 금지 사항 재확인)
- Content가 없을 때 임의로 유사 콘텐츠를 대체해 반환하는 것(7.1 금지 사항 재확인)
- 내부 Engine API(3~9장)를 외부 클라이언트에 직접 노출하는 것(1장 원칙 위반)

---

## 13. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 목차 승인 |
| 1.0 | 2026-07-05 | 본문 최초 작성 — 8개 Engine, 총 18개 API의 입출력 계약 정의. 각 API에 API 이름/호출 주체/입력/출력/빈 결과/에러/호출 가능한 하위 Engine/금지 사항 8항목 전부 포함. empty_result·error 공통 형식 및 error_code 체계 정의. Learning Flow Engine API만 외부 노출된다는 원칙 명시 |
| 1.1 | 2026-07-06 | Progress Engine API에 `get_due_reviews`(4.7) 추가 — PROGRESS_SCHEMA §5가 정의한 "Review Queue는 저장 엔터티가 아니다" 원칙을 실제로 조회할 수 있는 배치 조회 API. 19개 API로 확장. MIGRATION_GUIDE.md Entry 001과 연동 |
| 1.2 | 2026-07-07 | `submit_self_reported_confidence`(10.4) 추가 — MIGRATION_GUIDE.md Entry 004. API 20개로 확장 |
| 1.3 | 2026-07-07 | `start_session`(10.5) 추가 — MIGRATION_GUIDE.md Entry 005. API 21개로 확장 |
| 1.4 | 2026-07-08 | AC-001 Resolved 반영 — `get_cascade`(8.1) 입력에 `progress_snapshot` 추가 |
| 1.5 | 2026-07-08 | AC-005 Resolved 반영 — `generate_problem`(5.1) 입력에 `target_node_id` 추가 |
| 1.6 | 2026-07-08 | AC-008 Resolved 반영 — `generate_problem`(5.1)·`generate_combination`(6.1)·`generate_single_node`(6.2) 출력에 `content_id` 추가, `submit_attempt`(10.2) 입력에 `content_id` 추가, `get_content`(7.1)에 `content_id` 단독 조회 모드 추가 |
| 1.7 | 2026-07-08 | AC-009 Provisional 반영 — `request_practice`(10.3)에 `DOMAIN_LOGIC_BRIEF.md` §8.1 참조 추가 |
| 1.8 | 2026-07-11 | **Contract Reconciliation 패치** — 코드베이스 유실 후 재구현 착수 전, GitHub 본문이 v1.1에 머물러 있던 것을 위 AC-001~AC-011 Resolved 결정과 MIGRATION_GUIDE Entry 004/005 기준으로 일괄 반영. 새로운 설계 결정 없음, 전부 기존 Resolved 사항의 문서 동기화. `10.5 start_session`은 원본 세부 필드 재구성이라 별도 불확실성 표시 있음(해당 절 참고). 근거: `REBUILD_CONTRACT_RECONCILIATION.md` |
