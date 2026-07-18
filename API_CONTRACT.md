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

AC-014 반영 후 API는 **외부 Learning Flow API 5개(불변), 내부 Engine API 21개(17→21), 전체 26개(22→26)**다. 신규 4개 API는 모두 내부 Engine API이며 외부 HTTP 진입점을 추가하지 않는다.

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

### 3.5 get_concept_categories

| 항목 | 내용 |
|---|---|
| API 이름 | `get_concept_categories` |
| JavaScript 구현명 | `getConceptCategories` |
| 호출 주체 | Learning Flow Engine, Interleaving Engine |
| 입력 | `concept_ids: string[]` |
| 출력 | `{concept_id: category}` map |
| 빈 결과 | 빈 입력은 `{}` |
| 에러 | 존재하지 않는 `concept_id` → `INVALID_ID` |
| 호출 가능한 하위 Engine | 없음(리프) |
| 금지 사항 | Progress 상태를 조회하거나 정책적 후보 판정을 하지 않는다 |

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
| JavaScript 구현명 | `sequenceNodes` |
| 호출 주체 | Learning Flow Engine |
| 입력 | `node_id` occurrence multiset 배열. 중복 `node_id` 허용 |
| 출력 | 입력과 길이·multiplicity가 정확히 같은 순열. 입력 node 추가·삭제 금지 |
| 빈 결과 | 빈 배열 입력은 `[]` |
| 에러 | omitted → `MISSING_REQUIRED_FIELD`; explicit null·non-array·빈 문자열·비문자열 원소·mixed-language → `CONTRACT_VIOLATION`; 미존재 `node_id` → `INVALID_ID` |
| 호출 가능한 하위 Engine | Graph Engine(읽기) |
| 금지 사항 | 정렬 알고리즘의 내부 점수·기준을 응답에 노출하지 않는다 |

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

> **Historical draft `MIGRATION_GUIDE_ENTRIES_004_005.md` Entry 005 반영(2026-07-07)**: 기존 4개 외부 API 중 어떤 것도 "지금 어떤 `node_id`를 다뤄야 하는가"를 클라이언트에 알려주지 않아 세션을 시작할 방법 자체가 없었다는 공백을 발견해 신설. API 개수 20개 → 21개. 현재 canonical `MIGRATION_GUIDE.md` Entry 005는 AC-012이며 이 historical draft 번호와 구분한다.
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
| 1.9 | 2026-07-13 | **AC-008 후속 반영** — Phase 1-B(Progress Engine) 구현 중 발견: `record_attempt`(4.4)에 `content_id`가 없어 `attempt_records.content_id`(AC-008이 만든 컬럼)를 채울 유일한 쓰기 경로가 실행 불가능한 상태였음. `record_attempt` 입력에 `content_id`(선택, nullable) 추가. 새로운 설계 아님 — AC-008 결정을 실제로 동작시키는 데 필요했던 5번째(마지막) 반영 지점 |
| 1.10 | 2026-07-13 | Independent Architecture Audit(AUD-003), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — `validate_language_pack`(3.3) 출력에 `language_boundary_violations[]` 추가, `is_valid` 판정을 3개 violation 목록 전부 기준으로 정합화. `find_prerequisites`(3.1)·`find_related_nodes`(3.2) 금지 사항에 시작 노드 language 밖 노드 미반환(defense-in-depth) 명시. `GRAMMAR_SCHEMA.md` §6 same-language invariant, `GRAMMAR_GRAPH.md` §3, `ENGINE_INTERFACE.md`, `VALIDATION_LEVEL3.md` §7, `MIGRATION_GUIDE.md` Entry 004와 연동 |
| 1.11 | 2026-07-17 | AUD-004 Tier C Architecture Clarification 승인 반영 — `record_attempt` 내부 입력에 `cascade_target_node_ids?: string[]` 추가. 외부 HTTP 입력이 아님을 명시하고 omitted/null/type/empty/duplicate/SELF·TRANSFER/INVALID_ID 규칙 및 attempt·progress·cascade_jobs 동일 트랜잭션 원자성을 정의 |
| 1.12 | 2026-07-17 | AUD-004 독립 코드리뷰 F-03 wording-only clarification — `record_attempt` §4.4의 기존 구현(`trim().length === 0`)과 문서를 동기화해 빈 문자열뿐 아니라 공백 문자만으로 구성된 node ID도 허용하지 않음을 명시. 동작·알고리즘·오류 타입 및 외부 `submit_attempt` 계약 변경 없음 |
| 1.13 | 2026-07-17 | AC-012 Tier C Architecture Clarification — `start_session`(10.5) optional 입력 `conversation_boundary_acknowledged?: boolean` 추가. omitted/false/true/null/non-boolean 계약, 요청 단위 비영속 acknowledgement, true 시 CONVERSATION만 해당 호출 후보에서 제외하고 서버가 기존 우선순위의 다음 action을 결정하는 규칙을 명시. API 총수 21개와 기존 `next_action` enum은 불변 |
| 1.14 | 2026-07-18 | AC-013 Tier C Architecture Clarification — Progress 내부 API `get_active_learning_count`(§4.8) 추가, `record_explicit_study`(§4.3)의 capacity `CONTRACT_VIOLATION`·idempotency 우선·최종 admission 계약 명시. 외부 HTTP API 5개 불변, 내부 API 16→17, 전체 API 21→22 |
| 1.15 | 2026-07-19 | AC-014 Tier C Architecture Clarification — 내부 API `list_nodes_by_language`·`get_concept_categories`·`get_progress_snapshot`·`get_practicing_plus_count` 4개 추가, `sequence_nodes`의 occurrence multiset·오류·순열 불변식과 deterministic ordering tuple 정밀화, `start_session` NEW_GRAMMAR payload 및 후보 제안/최종 admission 분리 명시. 외부 HTTP API 5개 불변, 내부 API 17→21, 전체 API 22→26 |
