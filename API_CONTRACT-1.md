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
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | `{content, source: AI_GENERATED\|PRE_MADE, ladder_step: 1~4}` |
| 빈 결과 | 사다리 1~3단계 모두 실패 → `content = null`, `ladder_step = 4`(콘텐츠 공백 신호). 이는 에러가 아니라 정상적으로 판단한 결과가 없다는 빈 결과 |
| 에러 | `target_concept_id`가 존재하지 않는 Concept ID, `language` 코드 오류 |
| 호출 가능한 하위 Engine | AI Generation Engine, Content Engine |
| 금지 사항 | 어느 단계에서 왜 실패했는지의 상세 내역(예: "후보 3개 중 2개 필터 탈락")을 응답에 포함하지 않는다 — `ladder_step`과 최종 결과만 반환 |

---

## 6. AI Generation Engine API

### 6.1 generate_combination (사다리 1단계)

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_combination` |
| 호출 주체 | Generation Engine |
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | 생성된 문제/문장(둘 이상의 노드 조합) 또는 실패 신호 |
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
| 출력 | 생성된 문제/문장(단일 노드) 또는 실패 신호 |
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
| 호출 주체 | Generation Engine(`EXAMPLE` 조회), Learning Flow Engine(`EXPLANATION` 조회) |
| 입력 | `node_id`, `content_type`, `meta_language`(선택), `explanation_level`(선택) |
| 출력 | 조건에 맞는 Content 레코드 목록 |
| 빈 결과 | 조건에 맞는 콘텐츠가 없음 → 빈 목록(정상, Generation Engine의 사다리 4단계 판단 근거) |
| 에러 | `node_id` 미존재, `content_type`이 정의되지 않은 값 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 콘텐츠가 없을 때 유사한 다른 콘텐츠로 임의 대체해 반환하지 않는다 — 빈 결과는 빈 결과 그대로, 대체 판단은 호출자의 몫 |

---

## 8. Review Engine API

### 8.1 get_cascade

| 항목 | 내용 |
|---|---|
| API 이름 | `get_cascade` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `node_id`, `error_category`(SELF\|TRANSFER), `max_cascade_depth` |
| 출력 | `{node_id, reason}` 우선순위 목록 |
| 빈 결과 | `error_category = SELF`인 경우(탐색 자체를 하지 않으므로 원천적으로 빈 목록), 또는 TRANSFER지만 선행 관계가 없는 노드인 경우 |
| 에러 | `node_id` 미존재, `max_cascade_depth` < 1 |
| 호출 가능한 하위 Engine | Graph Engine(읽기) |
| 금지 사항 | 각 노드가 선정된 정확한 가중치 계산 과정을 노출하지 않는다 — "이 관계 때문에 선정됨" 수준의 근거 요약만 포함 |

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
| 입력 | `user_id`, `node_id`, `is_correct`, `response_time_ms`, `correction_count`, `hint_used` |
| 출력 | `{is_correct, updated_state, cascade(오답인 경우), next_content}` |
| 빈 결과 | 오답이지만 Cascade 결과가 빈 목록인 경우(선행 관계 없는 노드) → `cascade = []` 그대로 반환 |
| 에러 | `user_id`/`node_id` 미존재 |
| 호출 가능한 하위 Engine | Progress Engine, Review Engine, Interleaving Engine, Generation Engine |
| 금지 사항 | 오답 원인 분류(SELF/TRANSFER)의 판단 근거를 상세히 설명하지 않는다 — 분류 결과와 다음 행동만 반환 |

### 10.3 request_practice

| 항목 | 내용 |
|---|---|
| API 이름 | `request_practice` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `language`, `target_concept_id`(선택) |
| 출력 | Generation Engine의 `generate_problem` 결과를 그대로 전달 |
| 빈 결과 | `ladder_step = 4`(콘텐츠 공백)인 경우 → 빈 결과 그대로 전달, 클라이언트에는 "아직 준비되지 않음" 신호로 노출 |
| 에러 | `language` 코드 오류 |
| 호출 가능한 하위 Engine | Generation Engine |
| 금지 사항 | 없음 |

### 10.4 submit_self_reported_confidence

| 항목 | 내용 |
|---|---|
| API 이름 | `submit_self_reported_confidence` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `node_id`, `confidence_self_reported` |
| 출력 | `confidence_calibration_delta`(Progress Engine `record_self_reported_confidence`, 4.5의 결과를 그대로 전달) |
| 빈 결과 | 해당 없음(쓰기 API는 성공/실패만 있음) |
| 에러 | `confidence_self_reported`가 0~1 범위를 벗어난 경우(4.5 제약 그대로 상속), 비교할 `confidence_inferred`가 아직 없는 경우 |
| 호출 가능한 하위 Engine | Progress Engine |
| 금지 사항 | 보정 계산식을 응답에 포함하지 않는다(4.5와 동일) |

**발견 경위**: `record_self_reported_confidence`(4.5)는 애초부터 "호출 주체: Learning Flow Engine"으로 정의되어 있었으나, v1.1까지 10장에 이를 트리거할 외부 진입점이 없어 도달 불가능한 API였다. `API_LAYER_BRIEF.md`(Production Track) 작성 중 발견해 v1.2에서 보완한다.

### 10.5 start_session

| 항목 | 내용 |
|---|---|
| API 이름 | `start_session` |
| 호출 주체 | 외부 클라이언트(사용자) |
| 입력 | `user_id`, `language` |
| 출력 | `{next_action: REVIEW\|NEW_GRAMMAR\|INTERLEAVING\|CONVERSATION\|IDLE, current_node_id: node_id\|null, review_batch: [node_id...]\|null, node_sequence: [node_id...]\|null}` — `review_batch`는 `next_action=REVIEW`일 때만, `node_sequence`는 `next_action=INTERLEAVING`일 때만 채워진다. `current_node_id`는 배치가 있는 경우 그 배치의 첫 항목과 같다(클라이언트 편의) |
| 빈 결과 | 오늘 처리할 것이 전혀 없음 → `next_action=IDLE`, 나머지 필드 전부 null. 이는 "결정을 내리지 못함"이 아니라 **IDLE 자체가 정상적으로 내려진 결정**이므로 empty_result가 아니라 일반 응답이다 |
| 에러 | `user_id`/`language` 형식 오류 |
| 호출 가능한 하위 Engine | Progress Engine(`get_due_reviews`, `get_progress`), Graph Engine, Interleaving Engine |
| 금지 사항 | Learning State Assessment·오늘의 목표 결정·Session Budget(LEARNING_PROTOCOL.md §3~5) 산정에 쓰인 계산 근거를 노출하지 않는다 — 최종 결정된 `next_action`과 대상 노드(들)만 반환한다. 클라이언트가 이 결과를 보고 스스로 다른 활동을 재판단하도록 허용하지 않는다(정책 판단은 전부 서버 책임) |

**호출 시점**: 세션 시작 시 1회, 그리고 `review_batch`/`node_sequence`를 전부 소진했을 때 다시 호출한다(LEARNING_PROTOCOL.md §2 세션 시작 프로토콜의 실제 진입점). 이 API가 없으면 나머지 4개 API는 "어떤 `node_id`를 다뤄야 하는지" 알 방법이 없어 애초에 호출할 수 없다 — `CLIENT_BRIEF.md` 작성 중 발견된 구조적 공백을 보완한다.

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
| 1.2 | 2026-07-07 | `API_LAYER_BRIEF.md`(Production Track) 작성 중 발견 — `record_self_reported_confidence`(4.5)가 "호출 주체: Learning Flow Engine"으로 정의돼 있었지만 이를 트리거할 외부 진입점이 10장에 없어 도달 불가능한 API였음을 확인. Learning Flow Engine 외부 API에 `submit_self_reported_confidence`(10.4) 추가로 보완. 20개 API로 확장. MIGRATION_GUIDE.md Entry 004과 연동 |
| 1.3 | 2026-07-07 | `CLIENT_BRIEF.md`(Production Track) 작성 중 발견 — 기존 4개 외부 API 중 어떤 것도 "지금 어떤 `node_id`를 다뤄야 하는가"를 클라이언트에 알려주지 않아, 세션을 시작할 방법 자체가 없었음을 확인. `start_session`(10.5) 추가 — Learning State Assessment·목표 결정·Session Budget(LEARNING_PROTOCOL.md §2~5)을 내부적으로 수행하고 `next_action` 하나로 정규화해 반환, 클라이언트의 정책 재판단을 원천 차단. 21개 API로 확장. MIGRATION_GUIDE.md Entry 005과 연동 |
