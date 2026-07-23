# VI Empirical Evidence Contract

문서 상태: Proposed  
Tier: Tier C Pilot Evidence Contract  
Baseline: `ef467e4076c8bfcfbef84d766f0b1b6b0550534b`  
적용 대상: VI 12~20 Grammar Node empirical pilot  
상위 권위: Tier A canonical documents와 기존 Tier C production contracts

## 1. Purpose

이 문서는 LLE가 실제 학습자에게서 유지, 전이, 반응 자동화 및 학습 완료 evidence를 수집할 때 필요한 최소 권위 경계와 식별 계약을 정의한다.

목적은 다음과 같다.

1. 기존 Grammar Progress SSOT를 변경하지 않고 empirical pilot evidence를 수집한다.
2. 하나의 학습자 반응을 재현 가능한 stable assessment attempt로 식별한다.
3. experiment, condition, item, timepoint, modality, lexical envelope 및 분석 공식을 version-pinned 상태로 보존한다.
4. missing, technical failure, learner failure 및 normal empty를 분리한다.
5. raw fact에서 metric을 재계산할 수 있게 한다.
6. actual provider, 음성, 상세 repair taxonomy를 현재 최소 milestone과 분리한다.

이 문서는 효능이 입증되었다고 선언하지 않는다. 이 문서는 효능을 측정할 수 있는 evidence foundation 계약이다.

## 2. Scope

### 2.1 Included

현재 milestone은 다음을 포함한다.

- 별도 pilot evidence authority
- experiment·condition·enrollment·assignment identity
- immutable assignment version snapshot
- 최소 durable session lifecycle
- stable assessment attempt root
- response와 최소 correction aggregate
- stimulus/response modality 분리
- item-family 기반 unseen-context lineage
- production scheduler와 분리된 pilot assignment
- retention, transfer, RT, initiation, correction, completion, dropout, review debt 계산 계약
- VI lexical manifest boundary
- 단계별 human audit
- actual-provider audit extension point
- audio-deferred identity extension point
- pseudonymous participant와 privacy owner-decision boundary

### 2.2 Excluded

현재 milestone은 다음을 포함하지 않는다.

- Tier A 수정
- Grammar Progress state 또는 state transition 수정
- production `attempt_records` 의미 변경
- production `next_review_at` 수정
- production fixed scheduler 또는 current Interleaving 교체
- actual provider 구현
- raw audio 수집
- VAD, pause, acoustic feature
- speaking repair taxonomy
- full event-sourcing
- canonical Lexico-Construction Graph
- canonical Vocabulary의 일반 빈도 사전화
- 효능 PASS 또는 VL3 §10 PASS 선언

## 3. Authority boundary

다음은 협상 가능한 pilot parameter가 아니라 architecture invariant다.

1. Pilot evidence는 Grammar Progress와 별도의 권위를 가진다.
2. Pilot evidence는 `progress.state` 또는 기타 Progress authoritative field를 직접 쓰지 않는다.
3. Pilot evidence는 production `next_review_at`을 수정하지 않는다.
4. 기존 `attempt_records`를 empirical assessment attempt로 재정의하지 않는다.
5. 동일 행동이 production `record_attempt`와 pilot evidence 양쪽에 반영될 수는 있으나 두 기록은 서로 다른 목적·ID·권위를 가진다.
6. Derived metric은 authoritative learner state가 아니다.
7. Modality learner state는 raw evidence에서 계산되는 shadow projection이며 Progress SSOT가 아니다.
8. Production scheduler와 current Interleaving은 engineering baseline으로 보존한다.
9. Pilot review assignment는 production Review Queue 또는 `next_review_at`의 별칭이 아니다.
10. Pilot evidence recorder는 기본적으로 pilot instrumentation component이며 신규 canonical Engine으로 간주하지 않는다.

## 4. Definitions

| 용어 | 정의 |
|---|---|
| Pilot participant | 직접 식별자를 포함하지 않는 pseudonymous pilot participant |
| Experiment | 하나의 연구 질문과 protocol family를 식별하는 불변 ID |
| Experiment version | assignment·condition·metric 의미가 바뀔 때 증가하는 불변 version |
| Condition | 학습·연습·scheduler protocol 조합 |
| Enrollment | 한 participant가 특정 experiment version과 condition version에 배정된 관계 |
| Assignment | participant에게 learning, review 또는 assessment 과업을 배정한 authoritative pilot fact |
| Session | 하나 이상의 assignment 또는 attempt가 수행되는 최소 durable 활동 경계 |
| Assessment attempt | 하나의 logical learner response를 나타내는 stable root fact |
| Observation | attempt 또는 session에 추가될 수 있는 extensible raw fact |
| Item family | 같은 underlying elicitation template·target construction·정답 구조를 공유하는 item 집합 |
| Scenario | 실제 사용 상황을 구분하는 bounded context identity |
| Normal empty | 요청과 수집은 정상적으로 완료됐지만 계약상 허용된 빈 응답 또는 빈 결과 |
| Missing | 배정됐으나 learner response 또는 completion이 발생하지 않은 상태 |
| Technical failure | 기기, 네트워크, recorder, transport 또는 server 문제로 정상 수행 여부를 판단할 수 없는 상태 |
| Unscorable | 응답은 존재하지만 rubric에 따라 유효한 점수를 부여할 수 없는 상태 |
| Formula version | metric eligibility, numerator, denominator 및 aggregation 규칙의 불변 version |
| Protocol version | timepoint, scheduling, retry, reschedule 및 분석 window 규칙의 불변 version |
| Immutable snapshot | assignment 생성 후 의미를 변경하지 않는 ID/version 묶음 |

## 5. Identity model

모든 identity는 opaque하고 안정적이어야 한다. 발행된 ID는 다른 개체에 재사용하지 않는다. ID의 문자열 형식은 implementation HOW이며 이 계약이 prefix나 길이를 임의 확정하지 않는다.

| Identity | 필수 | 안정성·범위 |
|---|---:|---|
| `participant_id` | 예 | Pilot dataset 내부 pseudonymous identity. 직접 PII 금지 |
| `experiment_id` | 예 | Experiment family identity |
| `experiment_version` | 예 | 해당 protocol 의미의 immutable version |
| `condition_id` | 예 | Condition family identity |
| `condition_version` | 예 | Condition protocol의 immutable version |
| `enrollment_id` | 예 | participant×experiment-version×condition-version 관계 |
| `assignment_id` | 예 | 단일 learning/review/assessment assignment |
| `session_id` | 예 | 최소 durable session |
| `attempt_id` | assessment 시 예 | 단일 logical response root |
| `attempt_series_id` | retry 가능 시 예 | Pedagogical retry chain identity |
| `target_node_ids` | 예 | Canonical Grammar Node ID의 중복 없는 목록 |
| `item_id` | item 사용 시 예 | Pilot item identity |
| `item_version` | item 사용 시 예 | Assignment 당시 item version |
| `content_id` | production Content 사용 시 조건부 | Canonical Content identity |
| `content_version` | content 사용 시 조건부 | 실제 노출된 Content version |
| `scenario_id` | 예 | 6개 bounded scenario 중 하나 |
| `item_family_id` | 예 | Unseen lineage를 판정하는 family |
| `lexical_manifest_id` | 예 | VI pilot lexical envelope |
| `lexical_manifest_version` | 예 | 실제 사용된 manifest version |
| `rubric_version` | 평가 시 예 | Node evaluation 및 human rating rubric |
| `formula_version` | 분석 시 예 | Metric formula와 eligibility |
| `scheduler_protocol_version` | assignment 시 예 | Pilot scheduling·timepoint protocol |
| `generation_run_id` | actual-provider 단계 | 한 generation orchestration |
| `validator_run_id` | actual-provider 단계 | 한 validator execution |

### 5.1 Participant mapping separation

`participant_id`와 실제 연락·동의·계정 정보를 연결하는 mapping은 evidence dataset과 별도 authority다.

다음은 이 architecture snapshot의 일부가 아니라 `OWNER-DECISION`이다.

- 재식별 가능 여부
- mapping store 위치
- mapping 접근권한
- mapping retention
- deletion 및 withdrawal 처리
- 운영자·연구자 역할 분리

## 6. Immutable version snapshot

각 assignment는 생성 시점에 다음 snapshot을 고정한다.

```text
assignment_version_snapshot
  experiment_id
  experiment_version
  condition_id
  condition_version
  target_node_ids[]
  item_id
  item_version
  content_id?
  content_version?
  scenario_id
  item_family_id
  lexical_manifest_id
  lexical_manifest_version
  rubric_version
  formula_version
  scheduler_protocol_version
  stimulus_modality_components[]
  response_modality_components[]
```

규칙:

1. Snapshot은 assignment 생성 후 수정하지 않는다.
2. Item, rubric, manifest 또는 formula가 변경되면 새 version을 발행한다.
3. 과거 assignment는 최신 version으로 재해석하지 않는다.
4. Assignment가 reschedule돼 의미가 바뀌면 기존 row를 수정하지 않고 새 assignment를 만들고 lineage를 연결한다.
5. Experiment version 변경 후 기존 enrollment를 새 version으로 소급 이동하지 않는다.
6. Pseudonymous mapping policy는 snapshot에 포함하지 않고 별도 owner-controlled policy reference로 관리한다.

## 7. Assignment lifecycle

### 7.1 Minimum fields

| 필드 | 계약 |
|---|---|
| `assignment_id` | Stable authoritative identity |
| `assignment_type` | `LEARNING`, `REVIEW`, `ASSESSMENT` |
| `enrollment_id` | 해당 participant condition |
| `version_snapshot` | §6 immutable snapshot |
| `target_timepoint` | `IMMEDIATE`, `DAY_7`, `DAY_30`, 또는 `NOT_APPLICABLE` |
| `anchor_strategy` | §7.3 후보 중 하나 |
| `anchor_event_id` | Anchor가 된 evidence fact |
| `anchor_at` | Server-authoritative anchor timestamp |
| `due_at` | Protocol version으로 계산된 목표시각 |
| `completed_at` | 완료 시각, 미완료면 null |
| `completion_id` | 완료 attempt 또는 completion fact |
| `terminal_outcome` | §7.2 값 |
| `rescheduled_from` | 이전 assignment ID 또는 null |
| `superseded_by` | 대체 assignment ID 또는 null |
| `created_at` | Server timestamp |

### 7.2 Assignment terminal outcome

다음 값은 서로 구분한다.

- `COMPLETED`
- `MISSING`
- `TECHNICAL_FAILURE`
- `WITHDRAWN`
- `UNSCORABLE`
- `NORMAL_EMPTY`

정의:

- `COMPLETED`: 필요한 learner action이 수집되고 assignment-level completion 조건을 충족했다.
- `MISSING`: due/expiry protocol에 따라 completion이 없다고 판정됐다.
- `TECHNICAL_FAILURE`: learner performance로 해석할 수 없는 기술적 실패로 종료됐다.
- `WITHDRAWN`: participant 또는 owner policy에 따라 더 이상 수행하지 않는다.
- `UNSCORABLE`: response는 수집됐으나 rubric scoring이 불가능하다.
- `NORMAL_EMPTY`: 정상적으로 처리된 empty response/result이며 missing이나 technical failure가 아니다.

`null`, `MISSING`, `NORMAL_EMPTY`, `TECHNICAL_FAILURE` 및 점수 0은 같은 의미로 취급하지 않는다.

### 7.3 Timepoint anchor candidates

Timepoint anchor는 현재 하나로 확정하지 않는다. n=1~3 instrumentation 단계에서 다음 후보를 versioned protocol로 비교한다.

- `NODE_ASSIGNMENT_COMPLETION`
- `QUALIFYING_CRITERION_EVENT`
- `GROUPED_LEARNING_BLOCK_COMPLETION`

`progress.state = MASTERED` 또는 `mastered_at`은 pilot timepoint anchor 후보에서 제외한다.

각 assignment는 어떤 anchor strategy를 사용했는지 snapshot에 기록해야 한다.

다음 값은 architecture invariant가 아니다.

- timepoint 허용 window
- early/late/missed boundary
- reschedule 횟수
- expiry
- anchor strategy 최종 선택

해당 값은 `PILOT-CALIBRATE` 또는 `OWNER-DECISION` parameter다.

### 7.4 Timeliness

`EARLY`, `ON_TIME`, `LATE`, `MISSED`는 raw fact가 아니라 protocol version을 이용해 계산되는 rebuildable classification이다.

Primary efficacy analysis에는 `ON_TIME`만 포함하고, `EARLY`와 `LATE`는 sensitivity analysis로 분리한다. `MISSED`를 자동 오답으로 변환하지 않는다.

## 8. Session lifecycle

### 8.1 Minimum durable session

| 필드 | 계약 |
|---|---|
| `session_id` | Stable session identity |
| `enrollment_id` | Participant condition |
| `started_at` | Server timestamp |
| `ended_at` | Terminal 시각, nonterminal이면 null |
| `terminal_outcome` | 아래 enum |
| `technical_failure_ref` | 기술 실패가 원인일 때 observation/error reference |
| `restarted_from` | 이전 terminal session 또는 null |

Terminal outcome 최소값:

- `COMPLETED`
- `ABANDONED`
- `TIMED_OUT`
- `TECHNICAL_FAILURE`
- `WITHDRAWN`

규칙:

1. Terminal session은 resume하지 않는다.
2. Terminal session 이후 재시작은 새 `session_id`를 발행하고 `restarted_from`으로 연결한다.
3. Nonterminal interruption의 same-session resume는 실제 요구가 확인될 때 additive extension으로 허용할 수 있다.
4. Full transition event log와 rebuildable current-state projection은 이번 최소 계약이 아니다.
5. Session status는 Grammar Progress state가 아니다.

## 9. Assessment attempt

### 9.1 Root invariant

하나의 logical learner response에는 authoritative `attempt_id`가 정확히 하나 존재한다.

Network retransmission이나 duplicate submission은 새 attempt를 만들지 않는다. 동일 idempotency identity는 기존 attempt를 반환하거나 duplicate로 거부해야 한다.

Pedagogical retry는 새 attempt를 만들며 `attempt_series_id`와 `retry_of_attempt_id`로 연결한다.

### 9.2 Minimum fields

| 필드 | 계약 |
|---|---|
| `attempt_id` | Stable logical response root |
| `attempt_series_id` | Retry chain |
| `retry_of_attempt_id` | 직전 pedagogical attempt 또는 null |
| `retry_ordinal` | Series 내부 순서 |
| `assignment_id` | Parent assignment |
| `session_id` | Parent session |
| `idempotency_identity` | Duplicate/retransmission 방지 |
| `started_at` | Server-authoritative attempt start |
| `input_enabled_offset_ms` | Attempt-local client monotonic offset |
| `first_valid_activity_offset_ms` | 값이 있으면 client monotonic offset |
| `submitted_offset_ms` | Client monotonic submit offset |
| `server_received_at` | Server-authoritative receipt |
| `reported_client_monotonic_duration_ms` | Client가 보고한 input-enabled→submit duration |
| `clock_quality` | `VALID`, `DEGRADED`, `UNKNOWN`, `INVALID` |
| `stimulus_modality_components` | §11 |
| `response_modality_components` | §11 |
| `final_response_ref` | Final response object 또는 asset reference |
| `attempt_outcome` | `SCORABLE`, `UNSCORABLE`, `TECHNICAL_INVALID` |
| `instrumentation_version` | Timing·correction collection contract |
| `created_at` | Server timestamp |

### 9.3 Time authority

- Wall-clock authority는 server다.
- Learner 행동 구간은 동일 attempt-local client monotonic clock으로 측정한다.
- Client wall clock은 latency authority로 사용하지 않는다.
- Server receipt와 client monotonic duration은 서로 대체하지 않는다.
- Clock quality가 `INVALID`이면 RT와 initiation latency metric에서 제외하고 technical/instrumentation quality로 보고한다.
- Clock quality가 없다고 response를 오답으로 변환하지 않는다.

### 9.4 Target-node evaluation bridge

하나의 attempt가 여러 target node를 평가할 수 있다. Attempt root는 하나만 유지하고 node별 평가는 bridge로 연결한다.

Minimum bridge:

| 필드 | 계약 |
|---|---|
| `evaluation_id` | Stable evaluation identity |
| `attempt_id` | Parent attempt |
| `node_id` | Canonical Grammar Node ID |
| `rubric_version` | 실제 사용된 rubric |
| `rubric_outcome` | Versioned rubric value |
| `is_correct` | Binary task인 경우 `true/false`, 비binary이면 null |
| `scorable` | Boolean |
| `evaluation_source` | `RULE`, `HUMAN`, `AI_ASSISTED` 등 versioned controlled value |
| `created_at` | Server timestamp |

Node별 evaluation이 여러 개라는 이유로 `attempt_records`를 논리 attempt SSOT로 사용하지 않는다.

### 9.5 Observation extension point

Phase 2 최소 계약은 utterance, correction, AI audit, human rating, acoustic feature를 각각 필수 table로 만들지 않는다.

대신 다음 generic extension point를 예약한다.

| 필드 | 계약 |
|---|---|
| `observation_id` | Stable observation identity |
| `parent_type` | `ATTEMPT`, `SESSION`, `ASSIGNMENT`, `GENERATION_RUN` |
| `parent_id` | Parent stable ID |
| `observation_type` | Versioned observation category |
| `schema_version` | Payload contract version |
| `source` | CLIENT, SERVER, HUMAN_RATER, PROVIDER, PROCESSOR 등 |
| `occurred_at` 또는 monotonic offset | Source에 맞는 timing |
| `payload_ref` | Typed payload 또는 asset reference |
| `created_at` | Server timestamp |

향후 다음 observation을 추가할 수 있다.

- utterance segment
- detailed correction event
- AI audit event
- human rating
- acoustic feature

Observation extension은 raw fact authority를 추가할 수 있지만 Grammar Progress authority를 변경할 수 없다.

## 10. Response and correction evidence

### 10.1 Minimum response evidence

각 scorable attempt는 최소한 다음을 제공한다.

- final response reference
- target-node evaluation bridge
- correctness 또는 rubric outcome
- response latency 계산에 필요한 monotonic timing
- initiation latency 계산에 필요한 input-enabled와 first-valid-activity timing
- correction aggregate
- technical validity
- final response와 assignment/item/version 연결

### 10.2 Minimum correction aggregate

상세 edit/restart/replacement taxonomy를 선확정하지 않는다.

Minimum correction evidence는 aggregate bucket으로 표현한다.

```text
correction_summary[]
  initiator
  feedback_phase
  outcome
  count
```

Allowed dimensions:

- `initiator`: `LEARNER`, `SYSTEM`
- `feedback_phase`: `PRE_FEEDBACK`, `POST_FEEDBACK`
- `outcome`: `SUCCESSFUL`, `UNSUCCESSFUL`, `UNKNOWN`
- `count`: 0 이상의 정수

`correction_count`는 모든 bucket count의 합이다.

규칙:

1. Learner-initiated와 system-prompted correction을 합쳐 하나의 값으로만 저장하지 않는다.
2. Pre-feedback과 post-feedback을 합쳐 자동화 지표로 사용하지 않는다.
3. Correction outcome이 알려지지 않은 경우 임의로 성공 또는 실패로 변환하지 않는다.
4. Raw keystroke 전수 저장은 최소 계약에서 제외한다.
5. Replacement, restart, repetition, speaking repair taxonomy는 `DEFER`다.
6. Detailed correction observation이 나중에 추가돼도 aggregate와 불일치하면 raw detailed event와 aggregation formula version으로 재계산한다.

### 10.3 Production `correction_count` 관계

- Empirical correction evidence가 pilot 분석 authority다.
- Production `attempt_records.correction_count`는 production Progress 계약의 scalar다.
- 필요한 경우 empirical aggregate에서 production scalar를 compatibility projection으로 계산할 수 있다.
- Projection에는 mapping formula/version을 기록해야 한다.
- 두 값을 같은 의미의 SSOT로 취급하지 않는다.
- Production scalar를 empirical correction taxonomy의 원본으로 역해석하지 않는다.

## 11. Modality

Stimulus와 response는 직교 축이다.

### 11.1 Stimulus modality components

Minimum atomic categories:

- `TEXT`
- `AUDIO`
- `IMAGE`
- `VIDEO`

### 11.2 Response modality components

Minimum atomic categories:

- `TEXT_ENTRY`
- `SELECTION`
- `STRUCTURED_ACTION`
- `SPEECH`

Mixed task는 `MIXED` 단일 enum으로 축약하지 않는다. 하나 이상의 atomic component 배열로 표현한다.

예:

```text
stimulus_modality_components = [TEXT, AUDIO]
response_modality_components = [TEXT_ENTRY]
```

규칙:

1. 배열은 중복을 허용하지 않는다.
2. Task modality와 actual response modality가 다를 수 있으므로 assignment snapshot과 attempt actual observation을 구분한다.
3. `SPEECH` identity는 예약할 수 있지만 raw audio, VAD, pause 및 acoustic evidence는 audio milestone 승인 전 수집하지 않는다.
4. Modality별 learner state는 shadow projection이며 `progress.state`가 아니다.
5. Modality projection은 raw attempt/evaluation과 formula version으로 재계산 가능해야 한다.

## 12. Unseen-context lineage

각 assessment item은 학습 노출 이력과 비교해 다음 lineage를 계산할 수 있어야 한다.

### 12.1 Item lineage

상호 배타적 우선순위:

1. `EXACT_REPEAT`
2. `SURFACE_VARIANT`
3. `SAME_ITEM_FAMILY`
4. `DIFFERENT_ITEM_FAMILY`

정의:

- `EXACT_REPEAT`: 동일 item ID와 version 또는 동일 canonical stimulus.
- `SURFACE_VARIANT`: 같은 underlying item이지만 허용된 표층 요소만 변경.
- `SAME_ITEM_FAMILY`: 다른 item ID지만 같은 elicitation family.
- `DIFFERENT_ITEM_FAMILY`: prior learning exposure와 다른 family.

### 12.2 Scenario lineage

별도 축:

- `SEEN_SCENARIO`
- `UNSEEN_SCENARIO`

### 12.3 Primary transfer rule

Primary unseen-transfer metric은 `DIFFERENT_ITEM_FAMILY`만 eligible하다.

다음은 primary unseen 분모에서 제외한다.

- exact repeat
- surface variant
- same item family

Scenario holdout은:

- 최소 계약의 필수 gate가 아니다.
- feasibility-dependent다.
- exploratory 또는 confirmatory 분석으로 사용할 수 있다.
- 정확히 6개 scenario인 pilot에서 사전 고정된 필수 holdout count를 요구하지 않는다.

Item-family lineage는 assignment 시점의 exposure history snapshot으로 판정하며 사후 최신 노출로 과거 classification을 변경하지 않는다.

## 13. Pilot review assignment

Pilot review는 §7 assignment 중 `assignment_type = REVIEW`인 authoritative pilot fact다.

별도 Review Queue SSOT를 만들지 않으며, production `next_review_at`을 사용하거나 수정하지 않는다.

Minimum review fields:

- `assignment_id`
- `enrollment_id`
- `condition_id`
- `condition_version`
- `target_node_ids`
- `item_id`
- `item_version`
- `target_timepoint`
- `scheduler_protocol_version`
- `anchor_event_id`
- `due_at`
- `completion_id`
- `completed_at`
- `rescheduled_from`
- `superseded_by`
- `terminal_outcome`

규칙:

1. Reschedule은 기존 assignment의 due 시각을 덮어쓰지 않고 새 assignment로 연결한다.
2. Superseded assignment는 active review debt에서 제외하되 이력을 삭제하지 않는다.
3. Production `get_due_reviews` 결과를 pilot assignment로 간주하지 않는다.
4. Pilot assignment 결과가 production scheduling을 자동 변경하지 않는다.
5. Review debt는 assignment raw fact에서 계산한다.

## 14. Derived metric formulas and denominators

### 14.1 Common rules

1. Raw fact와 `formula_version`이 authority다.
2. Materialized metric, dashboard 또는 export는 rebuildable artifact다.
3. Completion과 conditional learner performance를 분리한다.
4. Missing response를 자동 오답 처리하지 않는다.
5. Technical failure를 learner failure에 포함하지 않는다.
6. `null`, missing, zero, normal empty를 서로 대체하지 않는다.
7. 최소 sample parameter 미달 시 `insufficient`를 반환한다.
8. 값이 크거나 작다는 이유만으로 outlier를 삭제하지 않는다.
9. Versioned instrumentation QC rule로 물리적으로 불가능하거나 corrupted라고 판정된 값만 primary metric에서 제외할 수 있다.
10. Early/late attempt는 primary on-time analysis와 분리한다.
11. 모든 결과는 eligible numerator, denominator, excluded count, missing count, technical-failure count 및 sample size를 함께 제공한다.

### 14.2 Retention

Aggregation grain:

- participant
- target node
- assessment timepoint
- condition
- formula version

Primary eligible set:

- `target_timepoint`이 `DAY_7` 또는 `DAY_30`
- assignment가 superseded되지 않음
- timeliness가 `ON_TIME`
- terminal outcome이 `COMPLETED`
- linked attempt outcome이 `SCORABLE`
- node evaluation이 scorable
- technical invalid가 아님

Formula:

```text
retention_rate =
  correct eligible node evaluations
  /
  all eligible scorable node evaluations
```

처리:

- `MISSING`: denominator 제외, completion outcome에 별도 보고
- `TECHNICAL_FAILURE`: denominator 제외, technical rate에 별도 보고
- `WITHDRAWN`: learner performance denominator 제외
- `UNSCORABLE`: denominator 제외하고 count 보고
- `NORMAL_EMPTY`: rubric가 incorrect로 명시하는 경우에만 incorrect; 그렇지 않으면 별도 outcome
- `LATE`/`EARLY`: primary 제외, sensitivity analysis
- Immediate 결과는 retention이 아니라 initial performance baseline으로 보고

### 14.3 Unseen transfer

Aggregation grain:

- participant
- node
- held-out item family
- timepoint
- condition

Eligible set:

- §14.2의 scorable 조건
- item lineage가 `DIFFERENT_ITEM_FAMILY`

Formula:

```text
unseen_transfer_rate =
  correct eligible held-out-family node evaluations
  /
  all eligible scorable held-out-family node evaluations
```

Scenario lineage는 별도 stratification이다. Unseen scenario를 primary eligibility 조건으로 강제하지 않는다.

### 14.4 RT median

Eligible attempt:

- attempt outcome `SCORABLE`
- target evaluation correct
- response latency가 client monotonic facts에서 계산 가능
- `clock_quality = VALID` 또는 formula version이 허용한 quality
- technical invalid 아님
- primary analysis는 `ON_TIME`

Response latency:

```text
response_latency_ms =
  submitted_offset_ms - input_enabled_offset_ms
```

Metric:

```text
RT median = median(response_latency_ms)
```

Correction이 있는 attempt를 임의 제외하지 않는다. Correction status별 strata를 별도로 제공한다.

Magnitude만을 이유로 outlier를 제거하지 않는다.

### 14.5 RT CV

RT median과 동일한 eligible set을 사용한다.

```text
RT_CV =
  sample_standard_deviation(response_latency_ms)
  /
  arithmetic_mean(response_latency_ms)
```

다음이면 `insufficient`다.

- eligible sample이 `rt_cv_min_n`보다 작음
- mean이 0 이하
- required timing quality를 충족하지 않음

`rt_cv_min_n`은 `PILOT-CALIBRATE`다.

### 14.6 Initiation latency

```text
initiation_latency_ms =
  first_valid_activity_offset_ms - input_enabled_offset_ms
```

Eligible 조건:

- 두 offset이 동일 attempt-local monotonic origin에 존재
- first valid activity가 input enabled 이후
- clock quality가 formula version 기준을 충족
- attempt technical-invalid가 아님

First-valid-activity가 없는 completed response는 instrumentation quality error 또는 task-specific normal-empty 규칙으로 분류하며 0ms로 대체하지 않는다.

### 14.7 Self-correction

Primary attempt prevalence:

```text
learner_pre_feedback_correction_prevalence =
  scorable attempts with learner-initiated pre-feedback correction_count > 0
  /
  scorable completed attempts with correction instrumentation available
```

Secondary event outcome:

```text
correction_success_rate =
  successful learner-initiated pre-feedback corrections
  /
  learner-initiated pre-feedback corrections with known outcome
```

System-prompted와 post-feedback correction은 primary automaticity correction metric에서 제외하고 별도 strata로 보고한다.

### 14.8 Completion

Analysis cutoff까지 due가 도달한 non-superseded assignments를 사용한다.

```text
assignment_completion_rate =
  assignments with terminal_outcome = COMPLETED
  /
  all due non-superseded assignments
```

Outcome distribution에는 다음을 각각 보고한다.

- completed
- missing
- technical failure
- withdrawn
- unscorable
- normal empty

Technical failure를 learner performance failure로 해석하지 않는다.

### 14.9 Dropout

Dropout은 enrollment-level metric이다.

`dropout_rule_version`과 `dropout_inactivity_boundary`가 확정되지 않은 상태에서는 dropout을 계산하지 않고 `insufficient_protocol_definition`으로 표시한다.

규칙 확정 후:

```text
dropout_rate =
  enrollments classified as DROPPED_OUT by dropout_rule_version
  /
  started eligible enrollments excluding policy-defined withdrawals
```

Withdrawal과 dropout은 동일하지 않다.

### 14.10 Review debt

Analysis cutoff 시점의 review assignment를 사용한다.

Active due assignment:

- `due_at < analysis_cutoff`
- terminal completion 없음
- `superseded_by` 없음
- reschedule로 대체되지 않음
- withdrawal policy상 active

Metrics:

```text
review_debt_count =
  number of active overdue review assignments
```

```text
review_debt_rate =
  active overdue review assignments
  /
  all due active review assignments
```

```text
review_debt_age =
  analysis_cutoff - due_at
```

Production `next_review_at`은 계산 재료가 아니다.

### 14.11 Human agreement

Agreement는 adjudication 전 independent original rating만 사용한다.

```text
raw_agreement =
  matching independently rated rubric outcomes
  /
  all independently double-rated items
```

Chance-corrected 또는 ordinal statistic은 rubric/formula version이 지정한다.

다음이면 `insufficient`다.

- double-rated sample이 `agreement_min_n`보다 작음
- rubric category 사용이 statistic의 전제를 충족하지 않음

Adjudicated final rating은 품질 결정에 사용할 수 있지만 agreement 계산에는 사용하지 않는다.

## 15. Lexical manifest boundary

### 15.1 Authority

VI pilot lexical envelope는 canonical Vocabulary와 분리된 Tier D manifest다.

Manifest 목적은 pilot item이 허용된 lexical 범위 안에서 비교 가능하게 구성되었는지 재현하는 것이다. 이는 일반 사전이나 canonical lexicon graph가 아니다.

### 15.2 Manifest minimum fields

Manifest level:

- `manifest_id`
- `version`
- `language`
- `source_refs`
- `provenance`
- `license_status`
- `created_at`
- `approved_for_pilot`
- `supersedes`

Entry level:

- `entry_id`
- `lemma`
- `accepted_surface_forms`
- `entry_kind`: word, chunk, collocation 또는 construction
- `chunk_collocation_construction_membership`
- `grammar_node_links`
- `item_links`
- `scenario_links`
- `source_ref`
- `license_status`
- `active_in_version`

OOV observation:

- `observation_id`
- `attempt_id` 또는 `item_id`
- observed form
- normalization version
- matched manifest entry 또는 null
- classification
- reviewer status

### 15.3 Prohibitions

다음을 금지한다.

1. 300~500 pilot 단어를 canonical Vocabulary에 일반 빈도 사전처럼 추가
2. 80~150 chunk/collocation/construction을 즉시 canonical Lexico-Construction Graph로 승격
3. Source 또는 license status가 확인되지 않은 entry를 authoritative active manifest로 사용
4. 각 item에 lexical envelope를 복제해 version drift 발생
5. 규칙으로 계산 가능한 형태를 canonical Vocabulary 예외 정보로 중복 저장
6. Manifest 변경 후 과거 assignment를 새 manifest로 재해석

## 16. Human audit

### 16.1 Common rating contract

Minimum rating fact:

- `rating_id`
- `sample_id`
- `attempt_id`, `generation_run_id` 또는 content reference
- `rater_id`
- `rubric_version`
- `rating_outcome`
- `independent`
- `created_at`
- `adjudication_id` 또는 null

규칙:

1. Original rating은 immutable하다.
2. Rater는 다른 rater의 결과를 보지 않은 상태에서 independent rating을 수행한다.
3. Disagreement resolution은 새 adjudication fact로 기록한다.
4. Original rating과 adjudicated result를 덮어쓰거나 혼합하지 않는다.
5. Agreement는 original independent overlap만 사용한다.

### 16.2 n=1~3 instrumentation stage

허용 및 권장:

- Audit 대상으로 선정된 항목 전부를 independent double rating할 수 있다.
- 목적은 rubric 이해 차이, instrumentation defect 및 disagreement 원인 파악이다.
- Adjudication 전 original rating을 보존한다.
- 이 단계의 전수 double rating을 12~20명 형성 단계의 영구 기본 계약으로 확대 해석하지 않는다.

### 16.3 12~20명 formative pilot

허용:

- Representative overlap/calibration subset은 independent double rating
- 나머지 audit sample은 single rating
- Representative overlap은 최소한 condition, timepoint, item family, modality 및 주요 outcome strata를 고려
- overlap 비율은 `PILOT-CALIBRATE`
- agreement threshold는 `PILOT-CALIBRATE`
- staffing과 비용은 `OWNER-DECISION`

Deep Research의 5~10% human-audit 권고는 근거 범위로 기록할 수 있으나 이 architecture 계약에서 sampling 숫자로 확정하지 않는다.

## 17. Actual-provider audit extension

### 17.1 Milestone boundary

현재 Mock milestone과 actual-provider milestone은 별개다.

이 문서는 actual provider가 완료됐다고 간주하지 않는다. Actual-provider implementation 전 다음 audit identity와 lineage를 활성화해야 한다.

### 17.2 Minimum audit facts

- `generation_run_id`
- assignment/attempt linkage
- provider/deployment/model version reference
- provider call ordinal
- provider call outcome
- validator run ID
- validator call outcome
- schema violation
- deterministic rule violation
- technical retry
- regeneration ordinal
- ladder step
- ladder outcome
- accepted content ID와 version
- learner exposure ID
- human rating linkage
- created/server timestamps

### 17.3 Required lineage

```text
assignment
  → generation_run
  → provider call(s)
  → schema/rule validation
  → validator call(s)
  → retry/regeneration
  → ladder outcome
  → accepted Content version
  → learner exposure
  → assessment attempt
  → human rating
```

### 17.4 Prohibited default storage

다음을 기본 persistent payload로 요구하지 않는다.

- provider credential
- secret
- 전체 raw vendor payload
- 불필요한 prompt 원문
- 개인정보가 포함된 request dump
- vendor debugging metadata 전체

필요한 audit fact는 normalized outcome과 version reference로 남긴다.

기존 AC-017/AC-018 provider request/response, retry, regeneration 및 Content persistence 동작은 이 계약으로 변경하지 않는다.

## 18. Audio-deferred extension

### 18.1 Current default

Owner 승인 전 기본값은 raw audio 미수집이다.

현재 최소 contract에서 제외한다.

- raw audio
- raw audio retention
- VAD
- pause threshold
- acoustic feature
- pronunciation score
- tone score
- speaking repair taxonomy

### 18.2 Reserved extension identity

향후 음성 milestone을 위해 다음 identity만 예약한다.

- `audio_observation_id`
- parent attempt/observation ID
- `audio_processor_version`
- processor/model/deployment version
- `consent_policy_version_ref`
- raw asset reference 또는 null
- derived asset reference 또는 null
- raw/derived asset classification
- deletion lineage
- access-policy reference
- created/processed timestamps

Raw asset와 derived feature는 동일 retention lifecycle을 공유한다고 가정하지 않는다.

Audio collection은 별도 owner approval, consent policy, access policy 및 retention decision 이후에만 활성화한다.

## 19. Privacy and owner-decision boundary

Architecture가 확정하는 내용:

- Evidence dataset은 pseudonymous `participant_id`를 사용한다.
- Direct PII는 evidence fact에 저장하지 않는다.
- Pseudonymous mapping은 별도 authority다.
- Raw evidence, mapping, lexical source, human rating 및 future audio는 서로 다른 access class가 될 수 있다.
- Deletion은 어떤 evidence가 삭제·익명화·보존됐는지 lineage를 남겨야 한다.
- Privacy policy version을 assignment/enrollment 또는 policy reference로 연결할 수 있어야 한다.

Owner가 사람 데이터 수집 전에 결정해야 하는 내용:

- 재식별 가능성
- mapping store owner
- 접근 역할
- withdrawal 후 evidence 처리
- participant-requested deletion
- pilot 종료 후 raw evidence 처리
- mapping retention
- human rater access
- provider 전송 허용 범위
- future raw audio와 derived feature retention

기간 숫자는 architecture가 발명하지 않는다.

## 20. Parameter classification

### 20.1 Classification definitions

| 분류 | 의미 |
|---|---|
| `EVIDENCE-BOUND` | 승인된 roadmap·research scope·canonical boundary에 의해 고정. 변경하려면 version 증가와 근거 필요 |
| `PILOT-CALIBRATE` | n=1~3 또는 formative pilot에서 계측·feasibility로 보정. Protocol/formula version에 기록 |
| `OWNER-DECISION` | Privacy, ethics, operations, staffing 또는 participant policy owner의 명시적 결정 필요 |
| `DEFER` | 현재 milestone에서 비활성. 관련 milestone 승인 전 기본값·숫자·수집을 정의하지 않음 |

### 20.2 Parameter register

| Parameter | 분류 | Owner | 현재 처리 |
|---|---|---|---|
| Immediate / 7-day / 30-day target labels | `EVIDENCE-BOUND` | Research/Pilot | 세 timepoint 유지 |
| Timepoint window | `PILOT-CALIBRATE` | Research/Pilot | Versioned placeholder |
| Early/late/missed boundary | `PILOT-CALIBRATE` | Research/Pilot | Versioned placeholder |
| Anchor strategy 최종 선택 | `PILOT-CALIBRATE` | Research/Pilot | n=1~3에서 3개 후보 비교 |
| RT CV 최소 분석 sample | `PILOT-CALIBRATE` | Research/Pilot | `rt_cv_min_n` placeholder |
| Agreement 최소 분석 sample | `PILOT-CALIBRATE` | Research/Pilot | `agreement_min_n` placeholder |
| Dropout inactivity boundary | `PILOT-CALIBRATE` | Research/Pilot | Rule version 전 classification 금지 |
| Withdrawal handling | `OWNER-DECISION` | Privacy/Operations | 사람 데이터 전 결정 |
| Human-audit sampling level | `PILOT-CALIBRATE` | Research/Pilot | Stage별 구조만 확정 |
| Double-rating overlap | `PILOT-CALIBRATE` | Research/Pilot | Formative subset placeholder |
| Agreement threshold | `PILOT-CALIBRATE` | Research/Pilot | Formula/protocol placeholder |
| Human-audit staffing/cost | `OWNER-DECISION` | Operations | Formative pilot 전 결정 |
| Pseudonymous mapping policy | `OWNER-DECISION` | Privacy/Operations | 사람 데이터 전 결정 |
| Evidence access policy | `OWNER-DECISION` | Privacy/Operations | 사람 데이터 전 결정 |
| Participant deletion policy | `OWNER-DECISION` | Privacy/Operations | 사람 데이터 전 결정 |
| Raw audio retention | `DEFER` | Privacy/Legal/Operations | 현재 raw audio 미수집 |
| Derived acoustic feature retention | `DEFER` | Privacy/Legal/Operations | Audio milestone로 연기 |
| Reschedule count/expiry | `OWNER-DECISION` | Research/Operations | Protocol placeholder |
| Scenario holdout count | `PILOT-CALIBRATE` | Research/Pilot | 6개 scenario의 필수 gate 아님 |
| Correction taxonomy detail | `DEFER` | Research/Pilot | Aggregate만 사용 |
| Pause minimum | `DEFER` | Audio milestone | 미정 |
| VAD parameter | `DEFER` | Audio milestone | 미정 |
| Speaking repair taxonomy | `DEFER` | Audio milestone | 미정 |
| Provider prompt/raw retention | `OWNER-DECISION` | Privacy/Operations | Actual provider 전 결정 |

근거 없는 숫자 placeholder는 architecture blocker가 아니다. 관련 단계에서 값이 필요한 경우에만 stage gate가 된다.

## 21. Invariants

1. Grammar Progress는 사용자 Grammar 학습 상태의 SSOT다.
2. Pilot evidence는 Progress를 직접 쓰지 않는다.
3. Production `attempt_records`는 empirical attempt authority가 아니다.
4. Production `next_review_at`은 pilot review debt authority가 아니다.
5. 하나의 logical learner response에는 하나의 stable attempt root가 존재한다.
6. Network duplicate는 새 attempt를 만들지 않는다.
7. Pedagogical retry는 새 attempt이며 retry lineage를 가진다.
8. 각 assignment는 실제 사용한 ID/version을 immutable snapshot으로 보존한다.
9. 과거 evidence를 최신 item, manifest, rubric 또는 formula로 소급 재해석하지 않는다.
10. Client wall clock을 latency authority로 사용하지 않는다.
11. Server wall clock과 client monotonic duration은 역할을 분리한다.
12. Missing, technical failure, withdrawn, unscorable, normal empty 및 zero를 구분한다.
13. Derived metric은 raw fact와 formula version으로 재계산 가능해야 한다.
14. Materialized metric은 권위가 아니다.
15. Modality projection은 Progress state가 아니다.
16. Item-family holdout은 primary unseen-transfer 계약이다.
17. Scenario holdout은 최소 필수 gate가 아니다.
18. Correction aggregate는 initiator·feedback phase·outcome을 분리한다.
19. Detailed repair taxonomy는 현재 요구하지 않는다.
20. Full event-sourcing은 현재 요구하지 않는다.
21. Pilot review assignment와 production scheduler는 분리한다.
22. Production fixed scheduler와 current Interleaving은 engineering baseline으로 보존한다.
23. Primary efficacy control은 blocked practice + fixed scheduling이다.
24. Experimental condition은 blocked→increasing→interleaved practice + adaptive scheduling이다.
25. Actual provider audit는 learner exposure까지 연결돼야 한다.
26. Raw vendor payload와 secret은 기본 audit 저장값이 아니다.
27. Audio milestone 승인 전 raw audio를 수집하지 않는다.
28. Canonical Vocabulary를 일반 빈도 사전으로 확장하지 않는다.
29. Canonical Lexico-Construction Graph를 이번 milestone에서 만들지 않는다.
30. Tier A 변경 없이 구현 가능해야 한다.

## 22. Experimental control definition

### 22.1 Engineering baseline

회귀와 production behavior 보존을 위한 기준:

- production fixed scheduler
- current Interleaving behavior

Engineering baseline은 반드시 효능 비교의 primary control과 동일하다고 간주하지 않는다.

### 22.2 Primary efficacy control

- blocked practice
- fixed scheduling

### 22.3 Experimental condition

- blocked
- increasing
- interleaved
- adaptive scheduling

이는 학습 단계가 blocked에서 시작해 increasing practice를 거쳐 interleaved practice로 이동하고 scheduler가 adaptive하게 동작하는 versioned protocol이다.

두 조건만 운영할 자원만 있는 경우 primary comparison은 다음이다.

1. `BLOCKED_FIXED`
2. `ADAPTIVE_MIXED`

Production behavior를 자동으로 efficacy control로 승격하지 않는다.

## 23. Explicit non-goals

이 계약은 다음을 하지 않는다.

- Tier A amendment
- Production learning policy 교체
- Progress SSOT 재설계
- Existing attempt schema 의미 재정의
- 모든 observation type의 사전 schema 확정
- Full audit/logging Engine 도입
- Full event-sourced session state
- Human audit sampling 숫자 확정
- Timepoint window 숫자 확정
- Pause/VAD 숫자 확정
- Audio collection
- Actual provider integration
- Lexico-Construction Graph 설계
- General learner model 설계
- VI 24개 전체 pilot
- 자유 Conversation 전체 구현
- 학습 효과 PASS 선언

## 24. Implementation blockers

### 24.1 Evidence foundation core 구현 전

필수:

- 본 Tier C contract 승인
- Pilot assignment·session·attempt의 persistence mapping 승인
- Immutable snapshot 저장 위치 승인
- Idempotency identity의 uniqueness scope 승인
- Raw evidence와 materialized analysis artifact 분리 승인
- Synthetic PostgreSQL fixture 설계

수치 placeholder는 core evidence foundation 구현 blocker가 아니다.

### 24.2 n=1~3 instrumentation 전

필수:

- `VI_EMPIRICAL_PILOT_SPEC.md` 승인
- 대상 Grammar Node manifest
- Item/item-family manifest
- 정확히 6개 scenario manifest
- lexical manifest source·license 검증
- rubric version
- anchor strategy 후보 배정 방식
- 최소 timing instrumentation
- technical-failure classification

### 24.3 사람 데이터 수집 전

필수 owner decisions:

- pseudonymous mapping
- consent/privacy policy
- access control
- withdrawal handling
- deletion
- evidence retention
- operational escalation
- human rater access

### 24.4 12~20명 formative pilot 전

필수:

- n=1~3 instrumentation defect 해소
- selected anchor strategy 또는 continued randomized calibration rule
- timepoint window
- early/late/missed rule
- dropout rule
- reschedule/expiry rule
- human-audit overlap protocol
- agreement analysis rule

### 24.5 Actual provider 전

필수:

- §17 audit persistence/transport contract
- provider/deployment version identity
- generation·validator run lineage
- accepted Content→learner exposure linkage
- provider request/privacy policy
- normalized failure taxonomy

### 24.6 Audio milestone 전

필수:

- 명시적 owner approval
- consent policy
- raw/derived asset separation
- retention
- deletion
- processor/model version
- access policy
- VAD/pause/acoustic specification

## 25. Approval boundary

이 문서의 승인은 다음만 허용한다.

- Tier C/D document patch
- Evidence foundation persistence/API 설계를 위한 후속 exact-contract 작업
- Synthetic fixture와 validation 계획 수립
- n=1~3 pilot parameter calibration 준비

이 문서의 승인은 다음을 허용하거나 선언하지 않는다.

- Implementation 완료
- DB migration 승인
- actual provider 착수 또는 완료
- raw audio 수집
- AC-018 CLOSED·IMPLEMENTED
- VL3 §10 PASS
- Tier A 변경
- Production scheduler·Interleaving 변경
- Pilot efficacy 입증
