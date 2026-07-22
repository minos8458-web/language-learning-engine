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

AC-018 반영 후 현재 API는 **외부 Learning Flow API 5개(불변), 내부 Engine API 27개(26→27), 전체 32개(31→32)**다. AC-018의 유일한 신규 내부 Engine API는 Graph Engine `get_node_labels`다. Factory와 provider adapter operation은 construction/injection boundary이므로 API 수에 포함하지 않는다.

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
| 금지 사항 | 탐색 알고리즘(순회 방식 등)을 응답에 포함하지 않는다. **시작 노드의 `language`를 벗어난 노드를 반환하지 않는다(defense-in-depth, `GRAMMAR_GRAPH.md` §3, AUD-003)** |

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
| 금지 사항 | `weight`를 어떻게 활용할지(정렬 기준 등)는 이 API가 정하지 않는다 — 호출자의 몫. **시작 노드의 `language`를 벗어난 노드를 반환하지 않는다(defense-in-depth, `GRAMMAR_GRAPH.md` §3, AUD-003)** |

### 3.3 validate_language_pack

| 항목 | 내용 |
|---|---|
| API 이름 | `validate_language_pack` |
| 호출 주체 | Language Pack 배포 파이프라인(실시간 사용자 요청이 아님, GRAMMAR_GRAPH §3 배포 전 검증) |
| 입력 | `language` |
| 출력 | `{is_valid, cycle_violations[], concept_consistency_violations[], language_boundary_violations[]}` — **`language_boundary_violations[]` 추가(AUD-003, Frozen Core Standard Amendment, 2026-07-13)** |
| 빈 결과 | 위반 사항이 없으면 위반 목록은 빈 배열 — 이는 empty_result가 아니라 **정상적인 유효 응답**(구분 주의) |
| 에러 | 해당 `language`의 Grammar Node/Relation 데이터가 아예 존재하지 않는 경우 |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 검증 알고리즘의 세부 로직을 응답에 포함하지 않는다 — 위반 목록만 반환 |

**AUD-003 반영**: `is_valid`는 `cycle_violations`·`concept_consistency_violations`·`language_boundary_violations` **세 목록이 모두 비어 있을 때만** `true`다. `language_boundary_violations`는 `GRAMMAR_SCHEMA.md` §6의 same-language invariant(`from_node_id`·`to_node_id`가 참조하는 Grammar Node의 `language`가 동일해야 함)를 위반하는 `grammar_relations` 레코드를 보고한다 — `PREREQUISITE`·`RELATED`·`CONTRAST`·`ALTERNATIVE` 4종 전부 대상.

### 3.4 list_nodes_by_language

| 항목 | 내용 |
|---|---|
| API 이름 | `list_nodes_by_language` |
| JavaScript 구현명 | `listNodesByLanguage` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `language` |
| 출력 | `{node_id, difficulty, concept_ids}[]` |
| 빈 결과 | 유효한 `language`에 구현된 Grammar Node가 없으면 `[]` |
| 에러 | `language` 형식 오류 → `OUT_OF_RANGE_VALUE` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | Progress 상태를 조회하지 않는다. 정적 Grammar Node metadata만 반환한다 |

**AC-014 wording correction(입력 계약 정밀화)**: `language`는 required scalar string이다. omitted 또는 explicit undefined(positional 인자에서 구분 불가) → `MISSING_REQUIRED_FIELD`. explicit null 또는 string이 아닌 값 → `CONTRACT_VIOLATION`. string이지만 `/^[A-Z]{2}$/` 형식(빈 문자열·공백-only 포함) 불일치 → `OUT_OF_RANGE_VALUE`. 기존 `get_active_learning_count`(4.8)의 validation 방식은 이 정밀화로 변경되지 않는다.

### 3.5 get_concept_categories

| 항목 | 내용 |
|---|---|
| API 이름 | `get_concept_categories` |
| JavaScript 구현명 | `getConceptCategories` |
| 호출 주체 | Learning Flow Engine, Interleaving Engine, AI Generation Engine |
| 입력 | `concept_ids: string[]` |
| 출력 | `{concept_id: category}` map |
| 빈 결과 | 빈 입력은 `{}` |
| 에러 | 존재하지 않는 `concept_id` → `INVALID_ID` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | Progress 상태를 조회하거나 정책적 후보 판정을 하지 않는다 |

**AC-014 wording correction**: `concept_ids`는 required string array다(빈 배열 `[]`이 정상값이라는 계약이 필드 생략까지 정당화하지 않는다). omitted/undefined → `MISSING_REQUIRED_FIELD`. explicit null 또는 배열이 아닌 값 → `CONTRACT_VIOLATION`. 배열 원소 중 비문자열·빈 문자열·공백-only → `CONTRACT_VIOLATION`. 중복 `concept_id`는 에러가 아니며 결과 map에서 자연히 단일 key로 정규화된다. 입력 중 하나라도 존재하지 않는 `concept_id`를 포함하면 부분 결과 없이 전체를 `INVALID_ID`로 거부한다.

### 3.6 get_node_language_and_concepts

| 항목 | 내용 |
|---|---|
| API 이름 | `get_node_language_and_concepts` |
| JavaScript 구현명 | `getNodeLanguageAndConcepts` |
| 호출 주체 | Interleaving Engine, AI Generation Engine |
| 입력 | `node_ids: string[]` |
| 출력 | 동적 map — 입력의 모든 고유하고 유효한 `node_id`를 key로 하여 각각 정확히 한 번씩 포함한다: `{[node_id]: {language, concept_ids}}`(`node_id`는 실제 값으로 치환되는 동적 key이며, 문자 그대로의 고정 key `"node_id"`가 아니다) |
| 빈 결과 | 빈 입력은 `{}` |
| 에러 | 존재하지 않는 `node_id` → `INVALID_ID`(부분 결과 없이 전체 거부) |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | Progress 상태를 조회하지 않는다. mixed-language를 판정하거나 거부하지 않는다 — 각 node의 실제 `language`를 있는 그대로 반환할 뿐이며, 그 판정은 호출자(Interleaving Engine 또는 AI Generation Engine)의 책임이다. `concepts.category`를 해석하지 않는다(`get_concept_categories`, 3.5로 계속 분리) — `difficulty`나 다른 metadata를 추가로 반환하지 않는다 |

**AC-015 wording**: `node_ids`는 required string array다(AC-014 wording correction과 동일 규칙). omitted/undefined → `MISSING_REQUIRED_FIELD`. explicit null 또는 배열이 아닌 값 → `CONTRACT_VIOLATION`. 배열 원소 중 비문자열·빈 문자열·공백-only → `CONTRACT_VIOLATION`. 중복 `node_id`는 에러가 아니며 결과 map에서 자연히 단일 key로 정규화된다. 입력 중 하나라도 존재하지 않는 `node_id`를 포함하면 부분 결과 없이 전체를 `INVALID_ID`로 거부한다.

### 3.7 get_node_labels

| 항목 | 내용 |
|---|---|
| API 이름 | `get_node_labels` |
| JavaScript 구현명 | `getNodeLabels` |
| 호출 주체 | AI Generation Engine만 |
| positional signature | `getNodeLabels(pool, nodeIds)` |
| 입력 | `nodeIds: string[]` |
| 출력 | `grammar_nodes.label`에서 읽은 exact 동적 map `{[node_id]: label}` |
| 빈 결과 | 빈 배열 입력은 `{}`(정상) |
| 에러 | 아래 AC-014 required string-array validation 적용 |
| 호출 가능한 하위 Engine | 없음(Graph Engine leaf) |
| 금지 사항 | Progress 상태 조회, language 정책 판정, label 외 metadata 반환 |

`nodeIds` validation은 §3.6과 동일하다. Omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-array → `CONTRACT_VIOLATION`; 비문자열·빈 문자열·공백-only 원소 → `CONTRACT_VIOLATION`; 중복 node ID는 에러가 아니며 결과 map에서 단일 key로 정규화한다. 하나라도 미존재하면 부분 결과 없이 전체 `INVALID_ID`; 빈 배열은 정상 `{}`다.

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
| 에러 | 존재하지 않는 `node_id`. 신규 Progress의 canonical `(user_id, language)` active count가 configured limit 이상이면 `CONTRACT_VIOLATION`. 이미 Progress가 존재하는 `(user_id, node_id)` 재요청은 capacity와 무관하게 에러가 아니라 현재 상태를 그대로 반환(멱등 처리) |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | Learning Flow Engine 이외의 호출 주체 요청을 수락하지 않는다 |

**AC-013 admission 계약**: limit은 Hard Invariant가 아니라 신규 `NOT_INTRODUCED → INTRODUCED` admission에만 적용된다. active는 canonical language가 같고 state가 `INTRODUCED` 또는 `STUDYING`인 Grammar Node이며 기본 configured limit은 2(Provisional/tunable)다. Progress Engine은 별도 read API를 호출하지 않고 동일 DB client/transaction에서 idempotency 확인을 capacity 판정보다 먼저 수행한 뒤 authoritative count로 최종 판정한다. 기존 노드의 합법적 상태 전이·퇴행과 허용된 초과 상태는 오류로 변환하지 않는다.

### 4.4 record_attempt

| 항목 | 내용 |
|---|---|
| API 이름 | `record_attempt` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_id`, `is_correct`, `response_time_ms`, `correction_count`, `hint_used`, `error_category`(선택), `error_subcategory`(선택), **`content_id`(선택, nullable — AC-008 후속 반영, 2026-07-13)**, **`cascade_target_node_ids`(선택, `string[]` — AUD-004 내부 입력, 2026-07-17)** |
| 출력 | 갱신된 `state`, `accuracy`, `confidence_inferred` |
| 빈 결과 | 해당 없음 |
| 에러 | `is_correct=true`인데 `error_category`가 null이 아닌 경우(GRAMMAR_SCHEMA §5 제약 위반), `node_id` 미존재, `cascade_target_node_ids` 계약 위반(`CONTRACT_VIOLATION`) 또는 대상 ID 미존재(`INVALID_ID`) |
| 호출 가능한 하위 Engine | 없음 |
| 금지 사항 | 상태가 바뀐 계산 근거(수식)를 응답에 포함하지 않는다 |

**AC-008 후속 반영 메모(2026-07-13)**: 원래 AC-008 결정(§5.1/§7.1/§10.2, `DATA_PERSISTENCE_BRIEF.md` §3.6)은 `attempt_records.content_id` 컬럼을 추가했지만, 이 컬럼에 값을 쓸 수 있는 유일한 경로인 `record_attempt`(본 절)의 입력 목록에는 `content_id`가 없었다 — AC-008 원 결정문에도 이 5번째 지점은 명시되지 않은 채 남아 있던 갭이다(`ENGINE_INTERFACE.md` §2.2 단일 쓰기 경로 원칙상 Progress Engine을 거치지 않고는 이 컬럼에 쓸 방법이 없으므로, 이 갭은 AC-008 결정이 실행 불가능한 상태로 남아 있었음을 뜻한다). Phase 1-B 구현 중 발견해 이 절에 추가한다 — 새로운 설계가 아니라 이미 승인된 AC-008 결정을 실제로 동작하게 만드는 데 필요한 마지막 조각이다. `content_id`가 없으면(예: 사전 학습 문제가 아닌 경우) `NULL`로 저장된다.

**AUD-004 내부 입력 계약(2026-07-17)**: `cascade_target_node_ids`는 외부 `submit_attempt` HTTP 클라이언트 입력이 아니다. Learning Flow Engine이 Content metadata로 SELF/TRANSFER를 판정하고, TRANSFER일 때 Review Engine `get_cascade` 결과에서 `node_id` 목록만 추출해 Progress Engine에 전달하는 내부 값이다. omitted는 `[]`로 처리한다. explicit `null`, 배열이 아닌 값, 빈 문자열·공백 문자만으로 구성된 문자열·문자열 아닌 원소, 중복 ID는 `ContractViolationError`; 정답과 SELF는 반드시 `[]`; TRANSFER는 `[]` 또는 고유한 Grammar Node ID 1개 이상을 허용한다. 존재하지 않는 ID가 하나라도 있으면 `INVALID_ID`로 전체 실패하며 부분 job을 만들지 않는다. 대상 ID 검증과 대상별 `cascade_jobs(status='PENDING')` 삽입은 attempt 삽입·progress 갱신과 동일한 `record_attempt` 트랜잭션에서 수행하고, 어느 단계든 실패하면 전부 ROLLBACK한다.

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

### 4.8 get_active_learning_count

| 항목 | 내용 |
|---|---|
| API 이름 | `get_active_learning_count` |
| JavaScript 구현명 | `getActiveLearningCount` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `language` |
| 출력 | `{active_count: integer}` |
| 빈 결과 | 올바른 형식이지만 해당 `(user_id, language)` Progress가 없으면 `{active_count: 0}` |
| 에러 | 존재하지 않는 `user_id` → `INVALID_ID`; 잘못된 `language` 코드 형식 → `OUT_OF_RANGE_VALUE` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | 외부 HTTP API로 노출하지 않는다. 순수 SELECT이며 Progress/Grammar 데이터를 변경하지 않는다. Learning Flow Engine이 직접 `progress`나 `grammar_nodes`를 조회하는 대신 이 계약을 사용한다 |

**Canonical active count**:

```sql
SELECT count(*) AS active_count
FROM progress p
JOIN grammar_nodes gn ON gn.node_id = p.node_id
WHERE p.user_id = $1
  AND gn.language = $2
  AND p.state IN ('INTRODUCED', 'STUDYING')
```

같은 `concept_id`의 서로 다른 `node_id`는 각각 별도 Grammar Node로 집계한다. 이 read API 결과는 Learning Flow의 NEW_GRAMMAR 후보 precheck일 뿐이며 `record_explicit_study`의 최종 admission 판정을 대체하지 않는다.

### 4.9 get_progress_snapshot

| 항목 | 내용 |
|---|---|
| API 이름 | `get_progress_snapshot` |
| JavaScript 구현명 | `getProgressSnapshot` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `node_ids: string[]` |
| 출력 | 입력의 모든 `node_id`를 포함하는 `{node_id: state}` map |
| 빈 결과 | 빈 `node_ids` 입력이면 `{}`. 유효한 node지만 Progress 행이 없으면 해당 값은 `NOT_INTRODUCED` |
| 에러 | 미존재 `user_id` 또는 `node_id` → `INVALID_ID`; mixed-language `node_ids` → `CONTRACT_VIOLATION` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | 외부 HTTP API로 노출하지 않는다. 같은 read client에서 `grammar_nodes` 존재성과 language 일관성을 검증하며 다른 Engine을 호출하지 않는다 |

**AC-014 wording correction**: `user_id`, `node_ids` 모두 required다. `user_id` omitted/undefined → `MISSING_REQUIRED_FIELD`, explicit null 또는 string이 아닌 값 → `CONTRACT_VIOLATION`, string 형식이지만 유효한 UUID가 아니거나 DB에 존재하지 않으면 `INVALID_ID`(형식 오류와 미존재를 동일 code로 처리하며, 검증 없이 DB에 전달해 PostgreSQL raw cast 오류를 노출하지 않는다). `node_ids` omitted/undefined → `MISSING_REQUIRED_FIELD`, explicit null 또는 배열이 아닌 값 → `CONTRACT_VIOLATION`, 빈 배열 `[]`은 정상(`{}`), 원소 중 비문자열·빈 문자열·공백-only → `CONTRACT_VIOLATION`, 중복 `node_id`는 에러가 아니며 출력 state map에서 단일 key로 정규화, 하나라도 존재하지 않는 `node_id`를 포함하면 부분 결과 없이 전체 `INVALID_ID`, 서로 다른 language의 유효 `node_id` 혼합은 `CONTRACT_VIOLATION`. 모든 검증·조회는 같은 read client에서 수행하며, 유효 node에 progress 행이 없으면 `NOT_INTRODUCED`, 입력의 모든 고유 유효 `node_id`가 출력에 포함된다.

### 4.10 get_practicing_plus_count

| 항목 | 내용 |
|---|---|
| API 이름 | `get_practicing_plus_count` |
| JavaScript 구현명 | `getPracticingPlusCount` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `user_id`, `language` |
| 출력 | `{count: integer}` — `PRACTICING`, `MASTERED`, `AUTOMATIC` 상태만 집계 |
| 빈 결과 | 조건을 만족하는 Progress가 없으면 `{count: 0}` |
| 에러 | 미존재 `user_id` → `INVALID_ID`; `language` 형식 오류 → `OUT_OF_RANGE_VALUE` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | 외부 HTTP API로 노출하거나 다른 Engine을 호출하지 않는다 |

**AC-014 wording correction**: `user_id`, `language` 모두 required다. 각 필드의 omitted/undefined/null/wrong-type 처리는 §4.9(`user_id`)와 §3.4(`language`)의 동일 규칙을 그대로 따른다.

### 4.11 get_recent_attempted_combinations

| 항목 | 내용 |
|---|---|
| API 이름 | `get_recent_attempted_combinations` |
| JavaScript 구현명 | `getRecentAttemptedCombinations` |
| 호출 주체 | AI Generation Engine만 |
| positional signature | `getRecentAttemptedCombinations(pool, userId, language)` |
| 입력 | required `userId`, `language` |
| 출력 | exact item `{content_id:string, grammar_node_ids:string[], attempted_at:string}`의 배열. `attempted_at`은 ISO-8601 string |
| 빈 결과 | 일치하는 content-linked attempt가 없으면 `[]`(정상) |
| 에러 | 아래 validation과 공통 §11 error registry 적용 |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | AI Generation Engine이 동일 SQL을 직접 실행하거나 Content Engine을 직접 호출하는 것. 문자열 join/직렬화 key로 조합을 비교하는 것 |

Validation은 다음과 같다.

- `userId`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string → `CONTRACT_VIOLATION`; 형식 오류 또는 DB 미존재 → `INVALID_ID`.
- `language`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string → `CONTRACT_VIOLATION`; `/^[A-Z]{2}$/` 불일치 → `OUT_OF_RANGE_VALUE`.

Window 20은 `PROGRESS_SCHEMA.md`의 기존 고정값이 아니라 AC-017이 새로 확정한 Tier C fixed window다. Population과 order는 해당 `userId`, attempt 귀속 node가 입력 `language`, `content_id IS NOT NULL`인 content-linked attempt로 제한하고 `attempted_at DESC`, 동률 `attempt_id ASC`, `LIMIT 20`을 적용한다. 계약상 SQL 구조는 다음과 같으며 Progress Engine 내부에만 위치한다.

```sql
SELECT ar.content_id, c.grammar_node_ids, ar.attempted_at
FROM attempt_records ar
JOIN grammar_nodes gn ON gn.node_id = ar.node_id
JOIN content c ON c.content_id = ar.content_id
WHERE ar.user_id = $1
  AND gn.language = $2
  AND ar.content_id IS NOT NULL
ORDER BY ar.attempted_at DESC, ar.attempt_id ASC
LIMIT 20
```

Candidate와 history의 `grammar_node_ids`는 각각 dedupe한 뒤 node ID 문자열 사전순으로 정렬한다. 배열 길이가 같고 모든 인덱스의 값이 같을 때만 완전일치이며 문자열 join 또는 직렬화 결과 비교는 금지한다.

---

## 5. Generation Engine API

### 5.1 generate_problem

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_problem` |
| JavaScript 구현명 | `generateProblem` |
| 호출 주체 | Learning Flow Engine |
| positional signature | `generateProblem(pool, userId, language, targetConceptId, targetNodeId)` — 마지막 두 인자만 optional |
| 입력 | `user_id`, `language`, `target_concept_id`(선택, 1~2단계용), `target_node_id`(선택, **3단계 PRE_MADE fallback 전용** — AC-005, 2026-07-08 Resolved) |
| 출력 | 모든 분기에서 exact top-level keys `{content, content_id, source, ladder_step}`. AI_GENERATED 성공은 `source="AI_GENERATED"`, `ladder_step=1\|2`; PRE_MADE 성공은 `source="PRE_MADE"`, `ladder_step=3`; NO_CONTENT는 네 필드를 모두 유지하고 `content=null`, `content_id=null`, `source=null`, `ladder_step=4`로 반환 |
| 빈 결과 | 후보 부족·재생성 소진 또는 PRE_MADE 정상 empty로 사다리 1~3단계가 결과를 만들지 못함 → `{content:null, content_id:null, source:null, ladder_step:4}`. 이는 에러가 아닌 정상 콘텐츠 공백 신호 |
| 에러 | `target_concept_id`가 존재하지 않는 Concept ID, `target_node_id`가 존재하지 않는 Grammar Node ID, `language` 코드 오류 |
| 호출 가능한 하위 Engine | AI Generation Engine, Content Engine |
| 금지 사항 | 어느 단계에서 왜 실패했는지의 상세 내역(예: "후보 3개 중 2개 필터 탈락")을 응답에 포함하지 않는다 — `ladder_step`과 최종 결과만 반환 |

**AC-005 관련 규칙**: `target_node_id`는 Generation Engine이 계산하지 않는다 — Learning Flow Engine이 이미 보유한 Progress Engine 읽기 권한으로 결정해 전달하며, Generation Engine은 3단계에서 이 값을 Content Engine으로 그대로 릴레이만 한다. 클라이언트는 이 값을 알거나 전달할 필요가 없다(전적으로 서버 내부 결정). 선택 규칙 자체는 `DOMAIN_LOGIC_BRIEF.md` §8.1(AC-009, Provisional) 참고.

**AC-018 입력 validation과 lazy 존재성**: `userId`와 `language`는 required다. omitted/explicit `undefined`는 `MISSING_REQUIRED_FIELD`; explicit `null` 또는 non-string은 `CONTRACT_VIOLATION`; `userId` 형식 오류·미존재는 planning 하위 API의 기존 `INVALID_ID`; `language`가 `/^[A-Z]{2}$/`와 불일치하면 `OUT_OF_RANGE_VALUE`다. `targetConceptId`와 `targetNodeId`는 omitted/explicit `undefined`가 정상 미지정이며, 둘을 동시에 지정해도 정상이다. explicit `null`·non-string·빈 문자열·공백-only는 `CONTRACT_VIOLATION`이다. 존재성은 사용 시점에 lazy 검증한다. `targetConceptId`는 최초 planning의 `select_generation_candidates`가 검증하고 미존재 시 기존 `INVALID_ID`를 전파한다. `targetNodeId`는 사다리 3단계에 실제 진입할 때만 `get_content`가 검증한다. 따라서 1·2단계 성공은 사용되지 않은 `targetNodeId`의 존재성을 조회하거나 검증하지 않는다. `targetNodeId`/`language` 조합의 AC-005 caller-side 책임은 유지하며 Generation Engine이 Graph Engine을 직접 호출하지 않는다.

**AC-017 Layer 3 exact payload 계약**: 모든 object는 아래에 명시한 key 외 `additionalProperties:false`다. nullable 필드는 생략하지 않고 명시적 `null`로 포함한다. `content`가 존재하면 `content.content_id`와 top-level `content_id`는 정확히 같고, `content`가 `null`이면 top-level `content_id`도 `null`이다.

AI_GENERATED 성공(`ladder_step` 1 또는 2):

```
{
  content: {
    content_id,
    grammar_node_ids,
    content_type: "QUIZ",
    media_assets,
    difficulty,
    type_specific_metadata
  },
  content_id,
  source: "AI_GENERATED",
  ladder_step: 1 또는 2
}
```

PRE_MADE 성공(`ladder_step` 3):

```
{
  content: {
    content_id,
    grammar_node_ids,
    content_type: "EXAMPLE",
    media_assets,
    difficulty,
    type_specific_metadata: null
  },
  content_id,
  source: "PRE_MADE",
  ladder_step: 3
}
```

NO_CONTENT(`ladder_step` 4):

```
{
  content: null,
  content_id: null,
  source: null,
  ladder_step: 4
}
```

Generation Engine은 AI 후보를 저장할 때 Content Engine의 `save_generated_content` 반환 projection을 어떤 필드도 다시 계산하지 않고 그대로 `content`로 사용한다. 사다리 retry/강등은 다음과 같다.

1. Provider timeout·network·structured-output parse failure는 같은 provider 호출을 1회 즉시 재시도하고, 재실패하면 throw하지 않고 다음 사다리 단계로 강등한다.
2. Provider schema/rule/content constraint violation은 최초 생성 1회와 위반 내용을 반영한 재생성 최대 2회(총 최대 3회) 후에도 실패하면 다음 단계로 강등하며, 내부 reason은 public payload에 노출하지 않는다.
3. 후보 부족은 정상 조건 미충족이므로 재시도·재생성 없이 다음 단계로 강등한다.
4. `save_generated_content` 실패는 내부 재시도나 사다리 강등 없이 즉시 throw한다.
5. PRE_MADE `get_content` technical failure는 같은 호출을 1회 즉시 재시도하고 재실패하면 throw한다. `ladder_step=4`로 강등하지 않는다.
6. PRE_MADE 정상 empty만 에러 없이 `ladder_step=4`로 강등한다.

PRE_MADE `get_content`의 contract-fixed cardinality는 0건이면 위 정상 empty 처리, 정확히 1건이면 그 projection을 반환, 2건 이상이면 invariant violation이다. 2건 이상에서 임의 선택하거나 `ladder_step=4`로 강등하지 않고, raw PostgreSQL 세부정보·row data·민감정보를 노출하지 않는 일반화된 내부 오류를 log한 뒤 throw한다. PRE_MADE technical retry 1회는 AI provider/validator 설정과 독립된 고정 계약이다.

---

## 6. AI Generation Engine API

### 6.1 generate_combination (사다리 1단계)

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_combination` |
| JavaScript 구현명 | `generateCombination` |
| 호출 주체 | Generation Engine |
| positional signature | `generateCombination(pool, language, grammarNodeIds, recentGeneratedContent)` |
| 입력 | required `language`, `grammarNodeIds`, `recentGeneratedContent`. `userId`와 `targetConceptId`는 받지 않음 |
| 출력 | exact `{candidate}`. 성공 시 `candidate={grammar_node_ids, media_assets, type_specific_metadata}`, 정상 실패 시 `candidate=null` |
| 빈 결과 | Provider 재생성 소진 → `{candidate:null}`(정상 결과, 에러 아님) |
| 에러 | 아래 `grammarNodeIds`·`recentGeneratedContent` validation 및 `language` 공통 계약 적용 |
| 호출 가능한 하위 Engine | Graph Engine(`get_node_language_and_concepts` §3.6 존재성/language 검증, `get_node_labels` §3.7 canonical label 조회) |
| 금지 사항 | node 재선택, GRAMMAR_GRAPH §6.1 1~3단계 재필터링, `recentGeneratedContent`를 Layer 2/public payload에 재노출하는 것 |

### 6.2 generate_single_node (사다리 2단계)

| 항목 | 내용 |
|---|---|
| API 이름 | `generate_single_node` |
| JavaScript 구현명 | `generateSingleNode` |
| 호출 주체 | Generation Engine |
| positional signature | `generateSingleNode(pool, language, grammarNodeIds, recentGeneratedContent)` |
| 입력 | required `language`, `grammarNodeIds`, `recentGeneratedContent`. `userId`와 `targetConceptId`는 받지 않음 |
| 출력 | exact `{candidate}`. 성공 시 `candidate={grammar_node_ids, media_assets, type_specific_metadata}`, 정상 실패 시 `candidate=null` |
| 빈 결과 | Provider 재생성 소진 → `{candidate:null}`(정상 결과, 에러 아님) |
| 에러 | 아래 `grammarNodeIds`·`recentGeneratedContent` validation 및 `language` 공통 계약 적용 |
| 호출 가능한 하위 Engine | Graph Engine(`get_node_language_and_concepts` §3.6 존재성/language 검증, `get_node_labels` §3.7 canonical label 조회) |
| 금지 사항 | 6.1과 동일: node 재선택·1~3단계 재필터링·recent content 재노출 금지 |

**AC-017 Layer 2 exact result 계약(§6.1·§6.2 공통)**: top-level에는 `candidate` key 하나만 있으며 `additionalProperties:false`다. 성공 candidate에도 아래 세 key만 있고 `additionalProperties:false`이며, Layer 2에는 `content_id`가 없다.

```
{
  candidate: {
    grammar_node_ids: [...],
    media_assets: [
      {
        media_format: "TEXT",
        asset_ref: "<generated_text>",
        role: "PRIMARY"
      }
    ],
    type_specific_metadata: {
      answer_key: "<answer_key>"
    }
  }
}
```

`media_assets`는 정확히 1개의 TEXT/PRIMARY item이고 media item도 `additionalProperties:false`다. QUIZ 경로의 `type_specific_metadata`와 non-empty/non-whitespace `answer_key`는 required이며 metadata object도 `additionalProperties:false`다. `grammar_node_ids`는 provider 응답에서 파생하지 않고 `select_generation_candidates`가 확정한 정렬 배열을 그대로 사용한다. 재생성 소진은 exact `{candidate:null}`이며 contract error가 아니다.

`grammarNodeIds` validation은 두 API에 공통 적용한다. Omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-array → `CONTRACT_VIOLATION`; 비문자열·빈 문자열·공백-only 원소 → `CONTRACT_VIOLATION`; `generate_combination`은 길이 정확히 2, `generate_single_node`는 길이 정확히 1이 아니면 `CONTRACT_VIOLATION`; 중복 또는 사전순 비정렬 → `CONTRACT_VIOLATION`; 미존재 node → `INVALID_ID`; node 간 mixed-language 또는 입력 `language`와 실제 node language 불일치 → `CONTRACT_VIOLATION`이다. 존재성/language 검증은 Graph Engine `get_node_language_and_concepts`를 호출하며 node 재선택이나 §6.1 pipeline 1~3단계 재필터링은 하지 않는다.

`recentGeneratedContent`는 required이며 Content Engine `get_recent_generated_content` 반환 배열을 변환 없이 전달한다. Omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-array → `CONTRACT_VIOLATION`; 빈 배열 `[]`은 정상; non-object item 또는 exact 3-key `{content_id, media_assets, created_at}` shape 위반 → `CONTRACT_VIOLATION`이다. Provider prompt 구성에만 사용하며 Layer 2 candidate와 public payload에 재노출하지 않는다. Planning → recent 조회 → generation 사이 `grammar_node_ids`는 정확히 같은 사전순 정렬 배열이어야 한다.

**AC-008 supersession 범위**: “AI_GENERATED 결과는 public 반환 전 Content에 영속화한다”는 원칙은 `generate_problem`에 그대로 유지한다. 다만 `generate_combination`/`generate_single_node`가 직접 저장하고 `content_id`를 반환한다는 암묵적 계약은 AC-017이 supersede한다. 두 API는 저장 전 `{candidate}` 또는 `{candidate:null}`만 반환한다. Generation Engine은 `save_generated_content` 성공 후에만 `generate_problem` 성공 payload를 반환하며 save 실패 시 public 성공 payload가 없다.

### 6.3 select_generation_candidates

| 항목 | 내용 |
|---|---|
| API 이름 | `select_generation_candidates` |
| JavaScript 구현명 | `selectGenerationCandidates` |
| 호출 주체 | Generation Engine만 |
| positional signature | `selectGenerationCandidates(pool, userId, language, generationMode, targetConceptId)` — `targetConceptId`만 optional이며 마지막 위치 |
| 입력 | required `userId`, `language`, `generationMode`; optional `targetConceptId` |
| 출력 | 성공 exact `{grammar_node_ids:string[]}`; 정상 후보 없음 exact `{grammar_node_ids:null}`. `COMBINATION`은 정확히 2개, `SINGLE_NODE`는 정확히 1개이며 배열은 중복 없는 node ID 사전순 정렬 |
| 빈 결과 | 조건에 맞는 후보가 없으면 `{grammar_node_ids:null}`(정상) |
| 에러 | 아래 exact validation 적용 |
| 호출 가능한 하위 Engine | Graph Engine(`get_concept_categories` §3.5, `get_node_language_and_concepts` §3.6), Progress Engine(`get_eligible_nodes` §4.2, `get_recent_attempted_combinations` §4.11) |
| 금지 사항 | 다른 API가 node를 재선택하는 것, 후보 배열을 문자열 join/직렬화 key로 비교하는 것 |

Validation은 다음과 같다.

- `userId`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string → `CONTRACT_VIOLATION`; 형식 오류 또는 DB 미존재 → `INVALID_ID`.
- `language`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string → `CONTRACT_VIOLATION`; `/^[A-Z]{2}$/` 불일치 → `OUT_OF_RANGE_VALUE`.
- `generationMode`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string 또는 `COMBINATION`/`SINGLE_NODE` 외 값 → `CONTRACT_VIOLATION`.
- `targetConceptId`: omitted/explicit `undefined`는 정상 미지정; explicit `null`/non-string/빈 문자열/공백-only → `CONTRACT_VIOLATION`; DB 미존재 → `INVALID_ID`.

`targetConceptId`가 지정되면 planning 최초 단계에서 `getConceptCategories(pool, [targetConceptId])`를 정확히 1회 호출한다. 이 호출은 Concept 존재성만 판정한다. 미존재는 기존 `INVALID_ID`를 그대로 전파하고, 존재하면 반환 category 값 자체는 후보 정책에 사용하지 않는다. 미지정이면 이 호출을 하지 않는다. 후보 node의 Concept 포함 여부는 `get_node_language_and_concepts`가 반환한 `concept_ids`로 판정한다.

Node 선택은 이 API에서만 수행한다. GRAMMAR_GRAPH §6.1 pipeline 1단계는 `get_eligible_nodes` 기반으로 `PRACTICING`/`MASTERED`/`AUTOMATIC`만 허용하고, 2단계는 `targetConceptId`가 있으면 적어도 한 node가 해당 Concept을 포함하는 후보만 허용하며, 3단계는 `get_recent_attempted_combinations` 결과와의 완전일치 등장 횟수가 적은 후보를 우선한다. 첫 planning에서는 `ALTERNATIVE` 관계 확장을 수행하지 않는다. `generate_combination`과 `generate_single_node`는 결과를 재선택하지 않는다.

후보 tie-break는 (1) 최근 fixed window 내 완전일치 등장 횟수 ASC, (2) 후보별 `sorted_node_id_array`의 element-wise lexicographic 비교 순서다. 문자열 join 또는 직렬화 key 비교는 금지한다. 완전일치는 candidate/history 배열을 각각 dedupe·사전순 정렬한 뒤 길이와 모든 인덱스가 같을 때만 성립한다.

GRAMMAR_GRAPH §6.1 실행 위치는 stages 1~3이 이 planning API, stage 4 표층 변주가 `recentGeneratedContent`를 provider prompt에 포함하는 `generate_combination`/`generate_single_node`, stage 5 비교형 품질 scoring이 별도 2차 실제 LLM milestone이다. 첫 Mock milestone은 stage 5를 수행하거나 충족했다고 주장하지 않으며, 모호한 production scoring placeholder/interface도 만들지 않는다. 실제 비교 계약은 2차 clarification에서 별도로 확정한다.

**AC-018 provider request와 raw output 계약(§6.1·§6.2 공통)**: 각 generation provider 호출의 exact request는 다음이며 모든 필드가 required이고 모든 object는 `additionalProperties:false`다.

```
{
  language: string,
  grammar_nodes: [{node_id: string, label: string}],
  recent_generated_texts: string[],
  regeneration_feedback: string[]
}
```

`grammar_nodes`는 planning에서 확정한 node ID를 ASC 정렬한 순서로 `get_node_labels`의 label을 결합하며 COMBINATION은 길이 2, SINGLE_NODE는 길이 1이다. `recent_generated_texts`는 `recentGeneratedContent` 각 item의 `media_assets[0].asset_ref`를 query 순서 그대로 추출한 길이 0~5 배열이다. `regeneration_feedback`는 non-empty/non-whitespace 문자열 배열이며 최초 호출은 `[]`다. Generation raw output은 exact `{generated_text:string, answer_key:string, self_reported_node_ids:string[]}`이고 `additionalProperties:false`다. raw schema violation은 content constraint violation이며 deterministic violation 문자열을 feedback으로 전달한다. `self_reported_node_ids`가 planning ID와 불일치해도 hint일 뿐 단독 실패나 feedback 사유가 아니다.

**AC-018 validator 계약**: exact request는 `{language:string, grammar_nodes:[{node_id:string,label:string}], generated_text:string}`이고 모든 필드가 required이며 모든 object는 `additionalProperties:false`다. `grammar_nodes`는 위와 동일한 정렬 planning ID·label 배열이다. exact response는 `{is_valid:boolean, violations:string[]}`이고 두 필드 모두 required, object는 `additionalProperties:false`, 각 violation은 non-empty/non-whitespace 문자열이다. `is_valid=true` iff `violations=[]`; `is_valid=false` iff violation이 1개 이상이다.

검증 순서는 generation raw schema → deterministic rule → rule 통과 시에만 validator다. rule 실패 시 validator를 호출하지 않고 deterministic rule violation 문자열을 `regeneration_feedback`에 전달해 재생성한다. validator의 `is_valid=false`는 content constraint violation이며 `violations`를 변경 없이 feedback으로 전달한다. timeout·network·parse·validator response schema violation은 technical failure로서 동일 validator request를 1회 재시도하고, 재실패하면 throw하거나 regeneration budget을 소비하지 않고 다음 사다리 단계로 강등한다. Validator는 사다리 1 COMBINATION에만 적용하고 사다리 2 SINGLE_NODE는 deterministic rule까지만 적용한다. 비교형 stage 5 quality scoring은 AC-017대로 2차 milestone에 이연한다.

각 generation provider 호출의 timeout·network·parse technical failure도 동일 request와 동일 feedback으로 1회 재시도한다. generation technical retry와 validator technical retry는 서로 독립이다. raw schema·rule·validator `is_valid=false`는 최초 생성 1회와 재생성 최대 2회의 단일 shared regeneration pool(총 provider generation 최대 3회)을 소비한다.

**AC-018 adapter와 factory 계약**: provider adapter operation은 `generateStructuredContent(request)`와 `validateGeneratedContent(request)`다. 전자는 provider raw 3-field를 파싱한 구조체, 후자는 exact validator response를 resolve하며 field-level schema 검증은 AI Generation Engine 책임이다. adapter는 timeout·vendor/network error 변환을 소유하며 실패 시 credential·prompt 원문·vendor raw payload가 없는 sanitized technical `Error`로 reject한다. timeout milliseconds와 vendor SDK 선택은 구현 HOW다.

`createAiGenerationEngine({providerAdapter})`는 `{selectGenerationCandidates, generateCombination, generateSingleNode}`를 반환한다. `providerAdapter`는 non-null object이고 위 두 operation이 모두 function이어야 하며, 아니면 composition 시점에 동기 `TypeError`를 throw한다. `createGenerationEngine({aiGenerationEngine, contentEngine})`는 `{generateProblem}`을 반환한다. `aiGenerationEngine`은 non-null object이며 `selectGenerationCandidates`, `generateCombination`, `generateSingleNode`가 모두 function이어야 한다. `contentEngine`은 non-null object이며 `getRecentGeneratedContent`, `saveGeneratedContent`, `getContent`가 모두 function이어야 한다. 하나라도 위반하면 composition 시점에 동기 `TypeError`를 throw한다. 이는 programming/configuration error이므로 public error code를 추가하지 않는다.

Generation Engine closure는 주입된 dependency만 사용한다. Graph/Progress 직접 import, direct SQL, module-level mutable singleton, setter injection, test-only branch, implicit default adapter, unconfigured adapter의 성공 반환은 금지한다. Production composition은 명시적 unconfigured adapter를 주입하고, 이 adapter의 두 operation은 sanitized technical `Error`로 reject하여 fail-closed 사다리 강등을 유도한다. 실제 vendor 연동은 별도 2차 implementation milestone이다. 테스트에서는 동일 adapter boundary에 deterministic fake를 주입한다. Factory와 adapter operation은 엔진 API 총수에 포함하지 않는다.

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

### 7.2 save_generated_content

| 항목 | 내용 |
|---|---|
| API 이름 | `save_generated_content` |
| JavaScript 구현명 | `saveGeneratedContent` |
| 호출 주체 | Generation Engine만 |
| positional signature | `saveGeneratedContent(pool, grammarNodeIds, contentType, mediaAssets, typeSpecificMetadata)` |
| 입력 | required `grammarNodeIds`, `contentType`, `mediaAssets`; conditional `typeSpecificMetadata`. `difficulty`, `content_id`, ID suffix는 입력으로 받지 않음 |
| 출력 | exact canonical projection `{content_id, grammar_node_ids, content_type, media_assets, difficulty, type_specific_metadata}`; `additionalProperties:false` |
| 빈 결과 | 없음 |
| 에러 | 아래 exact validation 및 공통 §11 error registry 적용. UUID/PK 충돌은 `CONTRACT_VIOLATION`; 일반 DB 인프라 실패는 공통 입력 오류로 위장하지 않고 일반화된 예외로 상위에 전파 |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | caller가 `difficulty`·`content_id`·suffix를 입력/제안하거나 Generation Engine이 반환 projection의 필드를 재계산하는 것 |

Required/conditional input 계약은 다음과 같다.

- `grammarNodeIds`: 길이 1 이상의 `string[]`.
- `contentType`: canonical enum.
- `mediaAssets`: required. omitted/explicit `undefined`는 `MISSING_REQUIRED_FIELD`; explicit `null` 또는 non-array는 `CONTRACT_VIOLATION`.
- `typeSpecificMetadata`: `contentType === "QUIZ"`이면 required non-null object이며 exact key는 `answer_key` 하나다. `answer_key`는 non-empty/non-whitespace string이고 object는 `additionalProperties:false`다. 다른 content type에서는 optional이며 `null` 또는 생략을 허용한다. Exact output projection에는 `type_specific_metadata` key를 항상 포함하며, non-QUIZ에서 입력을 생략한 경우 값은 `null`이다.

`mediaAssets` exact validation은 배열 길이가 정확히 1이고 item이 exact keys `{media_format, asset_ref, role}`만 갖는 것이다. `media_format`은 정확히 `"TEXT"`, `role`은 정확히 `"PRIMARY"`, `asset_ref`는 non-empty/non-whitespace string이며 item은 `additionalProperties:false`다. 배열 길이 불일치, 다른 format/role, key 누락·추가, 빈·공백 `asset_ref`는 모두 `CONTRACT_VIOLATION`이다.

Content Engine은 `grammarNodeIds`를 dedupe한 뒤 문자열 사전순으로 정렬해 저장·반환한다. 모든 node의 존재성과 같은 language 여부를 같은 조회에서 검증하고 `grammar_nodes.difficulty`의 MAX를 내부 계산한다. 정렬된 첫 node가 `content_id`의 대표 node이며 입력 순서가 달라도 같은 논리적 node set이면 대표 node, difficulty, 저장 배열이 동일하다.

`content_id`는 Content Engine이 `IDENTIFIER_STANDARD.md` §5의 `CONTENT_{language}_{node_slug}_{TYPE_ABBR}_{UUID}`로 생성한다. UUID는 소문자·하이픈 포함 36자 RFC 4122 표준 표현이다. AI 생성 저장 경로는 `source="AI_GENERATED"`, `human_reviewed=false`, `is_canonical=false`, `version=1`, `is_active=true`, `author="LLE_AI_GENERATION_ENGINE"`, `meta_language=engineConfig.AI_GENERATION.defaultMetaLanguage`로 고정한다. 현재 구현 예정 기본값은 `AI_GENERATION.defaultMetaLanguage="KO"`이며 이 문서 patch는 설정 파일을 변경하지 않는다.

### 7.3 get_recent_generated_content

| 항목 | 내용 |
|---|---|
| API 이름 | `get_recent_generated_content` |
| JavaScript 구현명 | `getRecentGeneratedContent` |
| 호출 주체 | Generation Engine만 |
| positional signature | `getRecentGeneratedContent(pool, grammarNodeIds, language)` |
| 입력 | `grammarNodeIds`, `language` |
| 출력 | exact item `{content_id, media_assets, created_at}`(`additionalProperties:false`)의 배열 |
| 빈 결과 | 정상 결과가 없으면 `[]`; partial result 없음 |
| 에러 | 존재하지 않는 node ID → `INVALID_ID`; mixed-language → `CONTRACT_VIOLATION` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | any-match 조회, caller가 source·limit·정렬을 변경하는 것 |

`grammarNodeIds`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-array, 빈 배열, 비문자열·빈 문자열·공백-only 원소 → `CONTRACT_VIOLATION`; duplicate는 조회 전에 dedupe; 하나라도 미존재 node가 있으면 부분 결과 없이 전체 `INVALID_ID`; node 간 mixed-language → `CONTRACT_VIOLATION`. `language`: omitted/explicit `undefined` → `MISSING_REQUIRED_FIELD`; explicit `null`/non-string → `CONTRACT_VIOLATION`; 형식 오류 → `OUT_OF_RANGE_VALUE`; node의 실제 language와 입력 `language` 불일치 → `CONTRACT_VIOLATION`.

결과는 요청한 dedupe node set 전체를 포함하는 content(`content.grammar_node_ids ⊇ requested node set`)만 선택하며 any-match가 아니다. Source는 내부에서 `AI_GENERATED`로 고정하고 fixed limit은 5다. `created_at DESC`, 동률이면 `content_id ASC`로 정렬한다.

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
| JavaScript 구현명 | `sequenceNodes` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `node_id` occurrence multiset 배열. 중복 `node_id` 허용 |
| 출력 | 입력과 길이·multiplicity가 정확히 같은 순열. 입력 node 추가·삭제 금지 |
| 빈 결과 | 빈 배열 입력은 `[]` |
| 에러 | omitted → `MISSING_REQUIRED_FIELD`; explicit null·non-array·빈 문자열·비문자열 원소·mixed-language → `CONTRACT_VIOLATION`; 미존재 `node_id` → `INVALID_ID`; dedupe 및 permutation 생성 전 원본 occurrence multiset 배열의 전체 길이가 `engineConfig`의 `max_batch_size`를 초과 → `OUT_OF_RANGE_VALUE`(AC-015) |
| 호출 가능한 하위 Engine | Graph Engine(읽기) |
| 금지 사항 | 정렬 알고리즘의 내부 점수·기준을 응답에 노출하지 않는다 |

**AC-015 batch length 계약**: 이 검증은 중복 제거(dedupe)나 순열 생성보다 먼저 수행하며, unique `node_id` 개수가 아니라 원본 occurrence multiset 배열의 전체 길이를 기준으로 한다 — 동일 `node_id` 7개로만 구성된 입력(`[A,A,A,A,A,A,A]`)도 길이 7로 계산해 거부한다. `max_batch_size` 숫자는 `engineConfig.js`의 Provisional/tunable 값(현재 승인값 6)을 참조하며 함수 내부에 하드코딩하지 않는다.

**AC-014 ordering 계약**: 입력 occurrence multiset의 고유 순열 전체에서 다음 tuple의 lexicographic 최솟값을 선택한다.

```
(
  same_node_adjacent_pair_count,
  shared_category_adjacent_pair_count,
  contrast_pair_min_distance_sum,
  final_sequence_array
)
```

- 동일 node 인접 쌍 최소화가 1순위다.
- 서로 다른 node occurrence가 Category를 하나 이상 공유하면 Category 인접 penalty 1을 부여한다. 같은 node의 Category penalty는 두 번째 항에서 제외한다.
- CONTRAST는 무방향 고유 node pair이며 relation weight는 사용하지 않는다. node pair별 가장 가까운 occurrence의 index 차이(인접 거리 1)를 구해 모든 CONTRAST pair의 최소 거리 합을 세 번째 항으로 사용한다.
- `final_sequence_array`는 element-wise lexicographic 비교한다.
- 내부 tuple과 점수는 응답에 노출하지 않는다.

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
| 입력 | `user_id`, `language`, **`conversation_boundary_acknowledged`(선택, boolean — AC-012)** |
| 출력 | `next_action`(단일 결정값 — `REVIEW`\|`NEW_GRAMMAR`\|`INTERLEAVING`\|`CONVERSATION`\|`IDLE` 중 하나) + 해당 액션 수행에 필요한 데이터(예: `REVIEW`면 `get_due_reviews` 결과, `NEW_GRAMMAR`면 다음 노드 정보) |
| 빈 결과 | 오늘 더 이상 할 것이 없음 → `next_action = IDLE` |
| 에러 | `user_id` 미존재, `language` 코드 오류, `conversation_boundary_acknowledged`가 explicit `null` 또는 boolean 이외 값인 경우(`CONTRACT_VIOLATION`) |
| 호출 가능한 하위 Engine | Graph Engine, Progress Engine, Review Engine, Generation Engine, Interleaving Engine |
| 금지 사항 | 클라이언트가 정책을 재판단하지 않도록, 원시 후보 목록이 아니라 `next_action` 단일 결정값만 반환한다(설계 원칙) |

**AC-014 NEW_GRAMMAR 출력 및 admission 분리**: NEW_GRAMMAR 결정 시 출력은 정확히 `{next_action: "NEW_GRAMMAR", node_id: "<string>"}`다. `start_session`은 후보만 제안하며 admission을 강제하지 않는다. 별도 `start_explicit_study` 호출의 `record_explicit_study`가 AC-013 계약에 따라 최종 admission을 강제한다. 후보 제안 뒤 capacity race로 admission이 `CONTRACT_VIOLATION`에 실패하면 같은 호출에서 재선택하지 않고 클라이언트가 새 `start_session`을 호출한다.

**AC-012 Conversation Boundary acknowledgement 계약(2026-07-17)**: canonical 입력명은 `conversation_boundary_acknowledged?: boolean`, JavaScript 구현명은 `conversationBoundaryAcknowledged`다. 이 값은 클라이언트가 Conversation 정책을 판단하거나 CONVERSATION을 숨기기 위한 입력이 아니라, 서버가 반환한 boundary 화면을 해당 호출 전에 정상 표시·확인했다는 요청 단위 사실 보고다.

- omitted와 explicit `false`는 모두 `false`로 처리한다. 세션의 세 진입 조건(`LEARNING_PROTOCOL.md` §9)을 충족하면 기존 우선순위 사슬에 따라 `CONVERSATION`을 반환할 수 있다.
- explicit `true`이면 **해당 호출에서만** `CONVERSATION`을 후보에서 제외하고, 서버가 `REVIEW → NEW_GRAMMAR → INTERLEAVING → CONVERSATION → IDLE`의 기존 정책 순서를 계속 평가해 다음 유효한 `next_action`을 단일 값으로 결정한다. 일반적으로 `IDLE`일 수 있지만 호출 시점에 다른 action이 유효하면 그 action을 반환한다.
- explicit `null`과 boolean 이외 값은 `CONTRACT_VIOLATION`이다.
- acknowledgement는 서버에 저장하지 않고 Progress 또는 DB 상태를 변경하지 않는다. `true`여도 클라이언트가 다음 action을 선택하지 않으며 서버 응답을 그대로 처리한다.
- 이 필드는 미구현 Conversation boundary 전용 계약이다. 실제 Conversation Engine 도입 전에 유지·변경·폐기 여부를 다시 심사한다.

**AC-016 `start_session` exact output payload 계약(2026-07-20)**: Canonical API는 `start_session`, JavaScript 구현명은 `startSession`이며 positional signature는 `startSession(pool, userId, language, conversationBoundaryAcknowledged)`다. `conversationBoundaryAcknowledged`의 omitted 또는 explicit `undefined`는 `false`와 동일하고, `false`는 미확인 상태, `true`는 이번 호출에서 CONVERSATION 재선택 금지를 뜻한다. explicit `null` 또는 non-boolean은 `CONTRACT_VIOLATION`이다.

Branch별 exact payload는 다음과 같다.

**REVIEW**

```json
{
  "next_action": "REVIEW",
  "review_batch": [
    {
      "node_id": "...",
      "state": "...",
      "next_review_at": "...",
      "overdue_by": 0,
      "priority": 0,
      "reason": "..."
    }
  ]
}
```

`review_batch`는 `get_due_reviews`(§4.7) 결과를 순서·shape 변형 없이 사용하며 item field는 정확히 `node_id`, `state`, `next_review_at`, `overdue_by`, `priority`, `reason`이다. 길이는 최소 1이다. 빈 배열이면 REVIEW를 반환하지 않고 NEW_GRAMMAR로 fallthrough한다. `getDueReviews`에는 별도 `limit`·`conceptId`·`stateFilter` option을 전달하지 않고 §4.7 기본 계약으로 호출한다. `count`·`score` 등 추가 top-level field는 금지한다.

**NEW_GRAMMAR**

```json
{
  "next_action": "NEW_GRAMMAR",
  "node_id": "..."
}
```

기존 AC-014 계약을 그대로 유지한다. 후보가 없으면 INTERLEAVING으로 fallthrough한다.

**INTERLEAVING**

```json
{
  "next_action": "INTERLEAVING",
  "node_sequence": ["NODE_A", "NODE_B", "NODE_A", "NODE_B"]
}
```

`node_sequence`는 `sequence_nodes` 결과 배열을 변형 없이 사용해 occurrence multiplicity와 ordering을 보존한다. 승인된 occurrence 정책상 길이는 4 또는 6이다. `selected_node_ids` 등 selected set 별도 병기와 내부 tuple·score·candidate pool 노출은 금지한다. admissible set이 없으면 CONVERSATION으로 fallthrough한다.

**CONVERSATION**

```json
{
  "next_action": "CONVERSATION"
}
```

Acknowledgement echo, conversation object, prompt 등 추가 field는 없다.

**IDLE**

```json
{
  "next_action": "IDLE"
}
```

`reason`·`message` 등 추가 field는 없다. IDLE은 error가 아니라 정상 최종 fallback이다.

**공통 exact-key 규칙**: 선택되지 않은 branch의 field는 `null`로 채우지 않고 완전히 생략하며 `undefined` field를 반환하지 않는다. enum 밖 sentinel을 반환하지 않는다. 각 branch는 위에 명시된 top-level key만 반환하고 future additive metadata도 별도 clarification 없이 추가하지 않는다. 하위 API error code는 §11 공통 형식으로 변환 없이 전파하며 신규 error code는 추가하지 않는다.

> **Historical draft `MIGRATION_GUIDE_ENTRIES_004_005.md` Entry 005 반영(2026-07-07)**: 기존 4개 외부 API 중 어떤 것도 "지금 어떤 `node_id`를 다뤄야 하는가"를 클라이언트에 알려주지 않아 세션을 시작할 방법 자체가 없었다는 공백을 발견해 신설. API 개수 20개 → 21개. 현재 canonical `MIGRATION_GUIDE.md` Entry 005는 AC-012이며 이 historical draft 번호와 구분한다.
>
> ⚠️ **복구 근거 및 불확실성 표시**: 이 절의 필드 정의는 `MIGRATION_GUIDE_ENTRIES_004_005.md`, `PHASE_2_COMPLETION_REPORT.md` §3.1(`next_action` 9개 분기: REVIEW 2경로·NEW_GRAMMAR·제외·동시진행제한·INTERLEAVING 2건·CONVERSATION·IDLE 언급), `BOOTSTRAP.md`/`PROJECT_MASTER_INDEX.md`(API 5개 전제)를 근거로 **재구성한 것이며, 원본 API_CONTRACT.md v1.3의 정확한 원문(예: 출력 필드의 정확한 명칭, 9개 분기 각각의 정밀한 트리거 조건)은 코드베이스 유실로 확인 불가하다.** 재구현 착수 전 이 절을 검토해 원문과 다르면 수정 지시 바란다.
>
> **AC-016 복구 범위 disposition(2026-07-20, additive)**: 사용자 승인으로 REVIEW의 `review_batch`, INTERLEAVING의 `node_sequence`, CONVERSATION/IDLE의 `next_action` 단독 payload와 JavaScript 구현명 `startSession`은 확정됐다. 위 역사 경고는 삭제하지 않으며, 이 결정이 유실 가능성이 있는 다른 세부까지 모두 복구했다고 해석하지 않는다.

---

## 11. 에러·예외 계약 (공통 형식)

- **empty_result 응답 형식**: `{status: "empty", data: null 또는 []}`
- **error 응답 형식**: `{status: "error", error_code, message}`
- **공통 error_code는 정확히 5개**: `INVALID_ID`(존재하지 않는 ID 참조), `MISSING_REQUIRED_FIELD`(필수 필드 누락), `UNAUTHORIZED_CALLER`(허용되지 않은 호출 주체), `OUT_OF_RANGE_VALUE`(값 범위 위반), `CONTRACT_VIOLATION`(그 외 계약 위반 — 예: `is_correct=true`인데 `error_category` 존재). AC-017은 신규 error code를 추가하지 않는다.
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
| 1.9 | 2026-07-13 | **AC-008 후속 반영** — Phase 1-B(Progress Engine) 구현 중 발견: `record_attempt`(4.4)에 `content_id`가 없어 `attempt_records.content_id`(AC-008이 만든 컬럼)를 채울 유일한 쓰기 경로가 실행 불가능한 상태였음. `record_attempt` 입력에 `content_id`(선택, nullable) 추가. 새로운 설계 아님 — AC-008 결정을 실제로 동작시키는 데 필요했던 5번째(마지막) 반영 지점 |
| 1.10 | 2026-07-13 | Independent Architecture Audit(AUD-003), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — `validate_language_pack`(3.3) 출력에 `language_boundary_violations[]` 추가, `is_valid` 판정을 3개 violation 목록 전부 기준으로 정합화. `find_prerequisites`(3.1)·`find_related_nodes`(3.2) 금지 사항에 시작 노드 language 밖 노드 미반환(defense-in-depth) 명시. `GRAMMAR_SCHEMA.md` §6 same-language invariant, `GRAMMAR_GRAPH.md` §3, `ENGINE_INTERFACE.md`, `VALIDATION_LEVEL3.md` §7, `MIGRATION_GUIDE.md` Entry 004와 연동 |
| 1.11 | 2026-07-17 | AUD-004 Tier C Architecture Clarification 승인 반영 — `record_attempt` 내부 입력에 `cascade_target_node_ids?: string[]` 추가. 외부 HTTP 입력이 아님을 명시하고 omitted/null/type/empty/duplicate/SELF·TRANSFER/INVALID_ID 규칙 및 attempt·progress·cascade_jobs 동일 트랜잭션 원자성을 정의 |
| 1.12 | 2026-07-17 | AUD-004 독립 코드리뷰 F-03 wording-only clarification — `record_attempt` §4.4의 기존 구현(`trim().length === 0`)과 문서를 동기화해 빈 문자열뿐 아니라 공백 문자만으로 구성된 node ID도 허용하지 않음을 명시. 동작·알고리즘·오류 타입 및 외부 `submit_attempt` 계약 변경 없음 |
| 1.13 | 2026-07-17 | AC-012 Tier C Architecture Clarification — `start_session`(10.5) optional 입력 `conversation_boundary_acknowledged?: boolean` 추가. omitted/false/true/null/non-boolean 계약, 요청 단위 비영속 acknowledgement, true 시 CONVERSATION만 해당 호출 후보에서 제외하고 서버가 기존 우선순위의 다음 action을 결정하는 규칙을 명시. API 총수 21개와 기존 `next_action` enum은 불변 |
| 1.14 | 2026-07-18 | AC-013 Tier C Architecture Clarification — Progress 내부 API `get_active_learning_count`(§4.8) 추가, `record_explicit_study`(§4.3)의 capacity `CONTRACT_VIOLATION`·idempotency 우선·최종 admission 계약 명시. 외부 HTTP API 5개 불변, 내부 API 16→17, 전체 API 21→22 |
| 1.15 | 2026-07-19 | AC-014 Tier C Architecture Clarification — 내부 API `list_nodes_by_language`·`get_concept_categories`·`get_progress_snapshot`·`get_practicing_plus_count` 4개 추가, `sequence_nodes`의 occurrence multiset·오류·순열 불변식과 deterministic ordering tuple 정밀화, `start_session` NEW_GRAMMAR payload 및 후보 제안/최종 admission 분리 명시. 외부 HTTP API 5개 불변, 내부 API 17→21, 전체 API 22→26 |
| 1.16 | 2026-07-19 | AC-014 wording correction(Narrow Contract Wording Clarification, 새 Architecture 아님) — §3.4/3.5/4.9/4.10 신규 API 4개의 입력 필드가 전부 required임을 명시하고, positional signature에서 omitted/explicit undefined를 `MISSING_REQUIRED_FIELD`, explicit null·wrong-type을 `CONTRACT_VIOLATION`으로, 필드별 형식·존재성 오류(`OUT_OF_RANGE_VALUE`/`INVALID_ID`)를 정밀화. 중복 ID는 lookup map 정규화로 에러 아님, 부분 결과 반환 금지(하나라도 존재하지 않는 ID 포함 시 전체 거부). 신규 error code 없음. API 총수 26·`get_active_learning_count`(AC-013) 기존 validation·Tier A 문서 불변 |
| 1.17 | 2026-07-19 | AC-015 Tier C Architecture Clarification — 신규 내부 API `get_node_language_and_concepts`(§3.6, Interleaving Engine 전용 caller) 추가, 입력의 모든 고유 유효 node_id를 동적 key로 정확히 한 번씩 포함하는 map 출력과 mixed-language 미판정(Graph는 사실만 반환) 명시. `sequence_nodes`(§9.1)에 dedupe·permutation 이전 원본 occurrence 길이 기준 `max_batch_size` 초과 시 `OUT_OF_RANGE_VALUE` 계약 추가(engineConfig 참조, 하드코딩 금지). 외부 HTTP API 5개 불변, 내부 API 21→22, 전체 API 26→27. 신규 error code 없음, `concepts.category`/`difficulty` 등 다른 metadata 미추가, Tier A 문서 불변 |
| 1.18 | 2026-07-20 | AC-016 Tier C Architecture Clarification — `start_session` JavaScript signature와 REVIEW `review_batch`, NEW_GRAMMAR 기존 `{next_action,node_id}`, INTERLEAVING `node_sequence`, CONVERSATION/IDLE `next_action` 단독 exact payload를 확정. Branch별 exact-key·field omission, acknowledgement validation, REVIEW 기본 `getDueReviews` 호출 및 fallthrough 규칙을 명시. 외부 API 5·내부 22·전체 27 불변, 신규 error code·DB/Tier A 영향 없음, 구현 미착수·§9 미PASS |
| 1.19 | 2026-07-22 | AC-017 Tier C Architecture Clarification 최종 누적판 — Pattern A와 exact Layer 1/2/3 payload, Content save/recent API, required `mediaAssets`·QUIZ `answer_key`, 내부 MAX difficulty·node/ID 정규화·고정 필드·retry를 보존하고, `select_generation_candidates`·`get_recent_attempted_combinations`를 추가. 후보 planning 1~3단계와 element-wise tie-break, generation executor의 최종 signatures·입력 검증·recent prompt-only 경계, AC-008 제한적 supersession, 비교형 품질 scoring의 2차 실제 LLM 이연을 확정. 외부 API 5 불변, 내부 22→26, 전체 27→31, 공통 error code 5개·DB/Tier A 불변, prerequisite implementation 미착수 |
| 1.20 | 2026-07-22 | AC-018 Tier C Architecture Clarification — `get_node_labels`를 추가하고 target Concept 존재성 경로, exact generation/validator payload와 retry·shared regeneration, PRE_MADE cardinality, lazy 입력 검증, provider adapter·factory composition validation 및 fail-closed production 경계를 확정. 외부 API 5 불변, 내부 26→27, 전체 31→32, 공통 error code 5개·DB/Tier A 불변, prerequisite implementation 미착수 |
