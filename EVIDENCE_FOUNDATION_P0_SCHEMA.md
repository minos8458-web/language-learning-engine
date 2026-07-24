# Evidence Foundation P0 Schema

문서 상태: Proposed
Tier: Tier C Physical Schema and Validation Contract
Baseline: `20262e02f8371beb21fdcf5ffaab57f9b56f2ead`

상위 권위:

* `VI_EMPIRICAL_EVIDENCE_CONTRACT.md`
* `VI_EMPIRICAL_PILOT_SPEC.md`
* `DATA_PERSISTENCE_BRIEF.md`
* `API_CONTRACT.md`
* `ENGINE_INTERFACE.md`

적용 단계:

* Evidence Foundation Phase P0 synthetic PostgreSQL validation

## 1. Purpose

이 문서는 승인된 empirical evidence logical authority를 PostgreSQL physical schema와 validation contract로 변환한다.

목적은 다음과 같다.

1. Evidence Foundation P0 구현에 필요한 physical object와 필드·제약을 확정한다.
2. Assignment snapshot, stable attempt root, idempotency, retry 및 lifecycle lineage를 PostgreSQL에서 재현 가능하게 한다.
3. Assignment creation, attempt open, finalization, terminalization 및 reschedule의 transaction boundary를 확정한다.
4. Raw evidence에서 metric을 query-time에 재구성할 수 있게 한다.
5. 기존 production `progress`, `attempt_records`, `next_review_at`의 의미와 저장 상태를 변경하지 않는다.
6. Additive migration과 data-preserving rollback 경계를 정의한다.
7. 실제 PostgreSQL 합성 fixture가 증명해야 할 acceptance contract를 정의한다.

이 문서는 migration SQL이나 recorder source code가 아니다.

## 2. Scope

### 2.1 Included

P0는 다음을 포함한다.

* Experiment와 immutable experiment version
* Condition과 immutable condition version
* Versioned item, scenario, item-family, lexical manifest, rubric, formula 및 protocol authority
* Pseudonymous participant
* Enrollment
* Assignment와 assignment-owned immutable snapshot
* Assignment target-node relation
* Session lifecycle
* Stable assessment attempt root
* Attempt retry series
* Attempt-open idempotency
* Attempt finalization idempotency
* Raw response와 monotonic timing
* Target-node evaluation
* Correction aggregate
* Query-time derived metric reconstruction
* Additive migration
* PostgreSQL synthetic fixture
* Production non-interference proof

### 2.2 Excluded

P0는 다음을 포함하지 않는다.

* Existing `progress` amendment
* Existing `attempt_records` amendment
* Production `next_review_at` amendment
* Production/evidence dual-write
* Public HTTP API
* Generic observation persistence
* Human rating
* Adjudication
* Generation run
* Validator run
* Learner exposure
* Provider payload
* Raw audio
* Acoustic feature
* Materialized metric table
* Pseudonymous identity mapping
* Full session event-sourcing
* Tier A 변경

## 3. Authority boundary

Empirical evidence는 Grammar Progress, production attempt 및 Content와 별도 logical authority다.

다음 경계를 유지한다.

1. Grammar Progress는 Grammar learner state의 SSOT다.
2. Evidence schema는 `progress`를 쓰지 않는다.
3. Evidence schema는 `attempt_records`를 쓰지 않는다.
4. Evidence schema는 `next_review_at`을 읽거나 쓰는 pilot authority가 아니다.
5. Evidence assignment의 due timestamp는 production scheduling과 별개다.
6. Evidence attempt는 production AttemptRecord가 아니다.
7. Evidence metric은 authoritative learner state가 아니다.
8. Evidence recorder는 canonical Engine이 아니다.
9. Existing canonical Engine 수는 8개로 유지한다.
10. P0 recorder는 internal instrumentation and persistence component다.
11. P0에는 public transport가 없다.
12. P0 migration은 additive다.
13. Existing production row의 backfill은 없다.
14. Evidence schema가 존재하거나 비활성 상태라는 사실은 AC-017/018 또는 VL3 §10 상태를 변경하지 않는다.

## 4. Physical design principles

### 4.1 Naming

모든 Evidence Foundation physical object는 `evidence_` prefix를 사용한다.

Evidence object가 production Progress 또는 production attempt와 동일 authority로 오해될 수 있는 명칭은 사용하지 않는다.

### 4.2 Identity types

* Internal server-issued identity: `UUID`
* Canonical Grammar Node ID: `TEXT`
* Canonical Content ID: `TEXT`
* Pilot/reference stable identity: `TEXT`
* Version: positive `INTEGER`

### 4.3 Time types

* Server wall-clock timestamp: `TIMESTAMPTZ`
* Client monotonic offset: nonnegative `BIGINT` milliseconds
* Client monotonic duration: nonnegative `BIGINT` milliseconds
* Client wall-clock timestamp는 latency authority로 저장하지 않는다.

### 4.4 Lifecycle representation

P0에 새로 도입하는 finite lifecycle 및 outcome 값은:

* PostgreSQL `TEXT`
* Named `CHECK` constraint

로 표현한다.

기존 production PostgreSQL enum을 재사용하거나 확장하지 않는다.

이 결정은 P0 evidence domain의 additive migration을 production enum evolution과 분리한다.

### 4.5 JSONB boundary

JSONB는 다음 bounded payload에만 사용한다.

* Immutable version definition
* Planned modality component array
* Actual modality component array
* Structured final response
* Stored idempotent replay result
* Structured rubric outcome

JSONB에 다음 authoritative field를 숨기지 않는다.

* Stable identity
* Ownership
* Version
* Lifecycle outcome
* Server timestamp
* Retry ordinal
* Idempotency identity
* Lineage
* Metric denominator metadata

### 4.6 Materialization boundary

P0에는 materialized metric table을 생성하지 않는다.

P0 metric은 raw evidence에서 query-time에 계산한다.

### 4.7 Existing production boundary

P0 migration은 다음 production object를 수정하지 않는다.

* `progress`
* `attempt_records`
* `content`
* `grammar_nodes`
* Production scheduling field
* Production indexes
* Production triggers

Evidence object는 `grammar_nodes`와 `content`를 read/reference authority로 참조할 수 있다. Evidence object가 production object를 수정할 수는 없다.

## 5. Physical entities

## 5.1 `evidence_experiments`

### Purpose

Research experiment family의 stable identity를 저장한다.

### Physical contract

| 항목                   | 계약                                                      |
| -------------------- | ------------------------------------------------------- |
| Primary key          | `experiment_id TEXT`                                    |
| Required columns     | `experiment_id TEXT`, `created_at TIMESTAMPTZ`          |
| Nullable columns     | 없음                                                      |
| Foreign keys         | 없음                                                      |
| Unique constraints   | Primary key                                             |
| Check constraints    | `evidence_experiments_id_nonempty`: trim 후 빈 문자열 금지     |
| Immutable/write-once | 모든 필드                                                   |
| Lifecycle            | 별도 mutable status 없음                                    |
| Timestamp authority  | `created_at`은 server/database authority                 |
| JSONB usage          | 없음                                                      |
| P0 inclusion reason  | Assignment snapshot이 stable experiment identity를 참조해야 함 |

Normal recorder operation은 update/delete를 제공하지 않는다.

## 5.2 `evidence_experiment_versions`

### Purpose

Experiment protocol의 immutable published version을 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `(experiment_id, version)`                                                                                                                                                                         |
| Required columns     | `experiment_id TEXT`, `version INTEGER`, `definition JSONB`, `definition_digest TEXT`, `digest_algorithm TEXT`, `normalization_version TEXT`, `published_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `provenance_ref TEXT`                                                                                                                                                                              |
| Foreign keys         | `experiment_id → evidence_experiments.experiment_id`                                                                                                                                               |
| Unique constraints   | Composite primary key                                                                                                                                                                              |
| Check constraints    | `version > 0`; definition은 JSON object; digest, algorithm, normalization version은 nonempty                                                                                                         |
| Immutable/write-once | 모든 필드                                                                                                                                                                                              |
| Lifecycle            | Insert가 published version 발행을 뜻함. In-place draft edit 없음                                                                                                                                           |
| Timestamp authority  | `published_at`, `created_at`은 server                                                                                                                                                               |
| JSONB usage          | Versioned experiment definition                                                                                                                                                                    |
| P0 inclusion reason  | Server-side snapshot resolution과 version drift 방지                                                                                                                                                  |

동일 ID/version에 다른 definition을 저장할 수 없다. 변경은 새 version을 발행한다.

## 5.3 `evidence_conditions`

### Purpose

Pilot condition family의 stable identity를 저장한다.

### Physical contract

| 항목                   | 계약                                            |
| -------------------- | --------------------------------------------- |
| Primary key          | `condition_id TEXT`                           |
| Required columns     | `condition_id TEXT`, `created_at TIMESTAMPTZ` |
| Nullable columns     | 없음                                            |
| Foreign keys         | 없음                                            |
| Unique constraints   | Primary key                                   |
| Check constraints    | `evidence_conditions_id_nonempty`             |
| Immutable/write-once | 모든 필드                                         |
| Lifecycle            | 별도 mutable status 없음                          |
| Timestamp authority  | Server                                        |
| JSONB usage          | 없음                                            |
| P0 inclusion reason  | Condition version의 stable parent              |

## 5.4 `evidence_condition_versions`

### Purpose

실제 assignment가 사용한 immutable condition protocol을 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `(condition_id, version)`                                                                                                                                                                                                 |
| Required columns     | `condition_id TEXT`, `version INTEGER`, `condition_class TEXT`, `definition JSONB`, `definition_digest TEXT`, `digest_algorithm TEXT`, `normalization_version TEXT`, `published_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `provenance_ref TEXT`                                                                                                                                                                                                     |
| Foreign keys         | `condition_id → evidence_conditions.condition_id`                                                                                                                                                                         |
| Unique constraints   | Composite primary key                                                                                                                                                                                                     |
| Check constraints    | Positive version; JSON object; nonempty digest metadata; named class check                                                                                                                                                |
| Immutable/write-once | 모든 필드                                                                                                                                                                                                                     |
| Lifecycle            | Published immutable version                                                                                                                                                                                               |
| Timestamp authority  | Server                                                                                                                                                                                                                    |
| JSONB usage          | Versioned condition definition                                                                                                                                                                                            |
| P0 inclusion reason  | Engineering baseline, efficacy control 및 experimental condition 분리                                                                                                                                                        |

Allowed `condition_class`:

* `ENGINEERING_BASELINE`
* `PRIMARY_CONTROL`
* `EXPERIMENTAL`

Named check:

* `evidence_condition_versions_class_check`

## 5.5 `evidence_reference_versions`

### Purpose

기존 production table이 소유하지 않는 P0 item·manifest·rubric·formula·protocol reference authority를 저장한다.

### Supported kinds

* `ITEM`
* `SCENARIO`
* `ITEM_FAMILY`
* `LEXICAL_MANIFEST`
* `RUBRIC`
* `FORMULA`
* `SCHEDULER_PROTOCOL`
* `INSTRUMENTATION_PROTOCOL`

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary key          | `(reference_kind, reference_id, version)`                                                                                                                                                                                |
| Required columns     | `reference_kind TEXT`, `reference_id TEXT`, `version INTEGER`, `definition JSONB`, `definition_digest TEXT`, `digest_algorithm TEXT`, `normalization_version TEXT`, `published_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `provenance_ref TEXT`, `license_status TEXT`                                                                                                                                                                             |
| Foreign keys         | 없음                                                                                                                                                                                                                       |
| Unique constraints   | Composite primary key                                                                                                                                                                                                    |
| Check constraints    | Named kind check; nonempty ID; positive version; JSON object; nonempty digest metadata                                                                                                                                   |
| Immutable/write-once | 모든 필드                                                                                                                                                                                                                    |
| Lifecycle            | Published immutable reference version                                                                                                                                                                                    |
| Timestamp authority  | Server                                                                                                                                                                                                                   |
| JSONB usage          | Versioned bounded reference definition                                                                                                                                                                                   |
| P0 inclusion reason  | Synthetic snapshot reference resolution 및 formula/rubric rebuildability                                                                                                                                                  |

Named check:

* `evidence_reference_versions_kind_check`

Application은 exact kind+ID+version을 검증한다. 같은 ID가 다른 kind에 있다는 이유로 대체 참조하지 않는다.

## 5.6 `evidence_participants`

### Purpose

Direct PII를 포함하지 않는 pilot participant identity를 저장한다.

### Physical contract

| 항목                   | 계약                                              |
| -------------------- | ----------------------------------------------- |
| Primary key          | `participant_id UUID`                           |
| Required columns     | `participant_id UUID`, `created_at TIMESTAMPTZ` |
| Nullable columns     | 없음                                              |
| Foreign keys         | 없음                                              |
| Unique constraints   | Primary key                                     |
| Check constraints    | 없음                                              |
| Immutable/write-once | 모든 필드                                           |
| Lifecycle            | P0에 mutable participant status 없음               |
| Timestamp authority  | Server                                          |
| JSONB usage          | 없음                                              |
| P0 inclusion reason  | Cross-participant ownership validation          |

금지되는 데이터:

* 실명
* 이메일
* 전화번호
* 직접 연락 정보
* 계정 credential
* OAuth subject
* 재식별 secret

이 table은 production `users`를 참조하지 않는다.

## 5.7 `evidence_enrollments`

### Purpose

Participant와 exact experiment/condition version 사이의 pilot enrollment authority를 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary key          | `enrollment_id UUID`                                                                                                                                                                       |
| Required columns     | `enrollment_id UUID`, `participant_id UUID`, `experiment_id TEXT`, `experiment_version INTEGER`, `condition_id TEXT`, `condition_version INTEGER`, `status TEXT`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `completed_at TIMESTAMPTZ`, `withdrawn_at TIMESTAMPTZ`                                                                                                                                     |
| Foreign keys         | Participant; composite experiment version; composite condition version                                                                                                                     |
| Unique constraints   | Primary key                                                                                                                                                                                |
| Check constraints    | Named status check; status/timestamp consistency                                                                                                                                           |
| Immutable/write-once | IDs와 version references; terminal timestamp                                                                                                                                                |
| Lifecycle            | `ACTIVE → COMPLETED` 또는 `ACTIVE → WITHDRAWN`; terminal 이후 변경 금지                                                                                                                            |
| Timestamp authority  | Server                                                                                                                                                                                     |
| JSONB usage          | 없음                                                                                                                                                                                         |
| P0 inclusion reason  | Assignment/session/attempt ownership root                                                                                                                                                  |

Allowed `status`:

* `ACTIVE`
* `COMPLETED`
* `WITHDRAWN`

Named constraints:

* `evidence_enrollments_status_check`
* `evidence_enrollments_terminal_timestamp_check`

`DROPPED_OUT`은 P0 stored state가 아니다. Formula-versioned derived classification이다.

## 5.8 `evidence_assignments`

### Purpose

Learning, review 또는 assessment assignment의 authoritative lifecycle을 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `assignment_id UUID`                                                                                                                                                                                     |
| Required columns     | `assignment_id UUID`, `enrollment_id UUID`, `assignment_type TEXT`, `target_timepoint TEXT`, `anchor_strategy TEXT`, `created_at TIMESTAMPTZ`                                                            |
| Nullable columns     | `anchor_event_ref TEXT`, `anchor_at TIMESTAMPTZ`, `due_at TIMESTAMPTZ`, `completed_at TIMESTAMPTZ`, `completion_attempt_id UUID`, `terminal_outcome TEXT`, `rescheduled_from UUID`, `superseded_by UUID` |
| Foreign keys         | Enrollment; self lineage; completion attempt where present                                                                                                                                               |
| Unique constraints   | Primary key; `superseded_by`는 하나의 prior assignment에만 연결                                                                                                                                                  |
| Check constraints    | Assignment type, timepoint, anchor, terminal outcome; no self-lineage; completion consistency                                                                                                            |
| Immutable/write-once | Identity, enrollment, type, timepoint, anchor strategy; lifecycle fields는 null→value 한 번                                                                                                                 |
| Lifecycle            | Nonterminal에서 정확히 하나의 terminal outcome으로 이동                                                                                                                                                              |
| Timestamp authority  | Server                                                                                                                                                                                                   |
| JSONB usage          | 없음                                                                                                                                                                                                       |
| P0 inclusion reason  | Pilot review와 assessment authority                                                                                                                                                                       |

Allowed `assignment_type`:

* `LEARNING`
* `REVIEW`
* `ASSESSMENT`

Allowed `target_timepoint`:

* `IMMEDIATE`
* `DAY_7`
* `DAY_30`
* `NOT_APPLICABLE`

Allowed `anchor_strategy`:

* `NODE_ASSIGNMENT_COMPLETION`
* `QUALIFYING_CRITERION_EVENT`
* `GROUPED_LEARNING_BLOCK_COMPLETION`

Allowed `terminal_outcome`:

* `COMPLETED`
* `MISSING`
* `TECHNICAL_FAILURE`
* `WITHDRAWN`
* `UNSCORABLE`
* `NORMAL_EMPTY`

Named constraints:

* `evidence_assignments_type_check`
* `evidence_assignments_timepoint_check`
* `evidence_assignments_anchor_check`
* `evidence_assignments_outcome_check`
* `evidence_assignments_no_self_lineage`
* `evidence_assignments_completion_consistency`

Pilot review는 별도 table이 아니라 `assignment_type = REVIEW`다.

## 5.9 `evidence_assignment_snapshots`

### Purpose

Assignment 시점에 server가 resolve한 exact version/reference bundle을 immutable하게 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `assignment_id UUID`                                                                                                                                                                                 |
| Required columns     | Assignment ID; experiment/condition IDs와 versions; item/scenario/family/lexical/rubric/formula/scheduler/instrumentation IDs와 versions; modality arrays; snapshot digest metadata; created timestamp |
| Nullable columns     | `content_id TEXT`, `content_version INTEGER`                                                                                                                                                         |
| Foreign keys         | Assignment; experiment version; condition version; Content ID when present                                                                                                                           |
| Unique constraints   | Assignment당 정확히 한 snapshot                                                                                                                                                                           |
| Check constraints    | Positive versions; Content ID/version pair consistency; modality JSON array checks; nonempty digest metadata                                                                                         |
| Immutable/write-once | 모든 필드                                                                                                                                                                                                |
| Lifecycle            | Insert-only                                                                                                                                                                                          |
| Timestamp authority  | Server                                                                                                                                                                                               |
| JSONB usage          | Planned stimulus/response modality arrays만                                                                                                                                                           |
| P0 inclusion reason  | Historical reconstruction 및 server-resolved authority                                                                                                                                                |

Required query-critical references:

* `item_id`
* `item_version`
* `scenario_id`
* `scenario_version`
* `item_family_id`
* `item_family_version`
* `lexical_manifest_id`
* `lexical_manifest_version`
* `rubric_id`
* `rubric_version`
* `formula_id`
* `formula_version`
* `scheduler_protocol_id`
* `scheduler_protocol_version`
* `instrumentation_protocol_id`
* `instrumentation_protocol_version`

Required digest metadata:

* `snapshot_digest`
* `digest_algorithm`
* `normalization_version`

Named constraints:

* `evidence_assignment_snapshots_content_pair_check`
* `evidence_assignment_snapshots_versions_positive`
* `evidence_assignment_snapshots_stimulus_modalities_array`
* `evidence_assignment_snapshots_response_modalities_array`

Reference-kind validity는 application validation이 수행한다.

Content ID가 있을 때 assignment creation은 현재 Content version이 requested version과 일치하는지 검증한다. P0는 과거 Content body archive를 새로 만들지 않는다.

## 5.10 `evidence_assignment_snapshot_nodes`

### Purpose

Assignment snapshot의 ordered target Grammar Node set을 정규화해 저장한다.

### Physical contract

| 항목                   | 계약                                                        |
| -------------------- | --------------------------------------------------------- |
| Primary key          | `(assignment_id, node_id)`                                |
| Required columns     | `assignment_id UUID`, `node_id TEXT`, `ordinal INTEGER`   |
| Nullable columns     | 없음                                                        |
| Foreign keys         | Assignment snapshot; Grammar Node                         |
| Unique constraints   | `(assignment_id, ordinal)`                                |
| Check constraints    | `ordinal >= 0`                                            |
| Immutable/write-once | 모든 필드                                                     |
| Lifecycle            | Insert-only                                               |
| Timestamp authority  | 별도 timestamp 없음. Parent snapshot timestamp 사용             |
| JSONB usage          | 없음                                                        |
| P0 inclusion reason  | Node FK, ordering, duplicate prevention, multi-node query |

Named constraint:

* `evidence_assignment_snapshot_nodes_ordinal_nonnegative`

Assignment당 최소 한 개 node는 assignment-creation transaction의 application postcondition으로 강제한다.

## 5.11 `evidence_sessions`

### Purpose

Minimum durable pilot session lifecycle과 restart lineage를 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Primary key          | `session_id UUID`                                                                                    |
| Required columns     | `session_id UUID`, `enrollment_id UUID`, `started_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ`          |
| Nullable columns     | `ended_at TIMESTAMPTZ`, `terminal_outcome TEXT`, `technical_failure_ref TEXT`, `restarted_from UUID` |
| Foreign keys         | Enrollment; self restart lineage                                                                     |
| Unique constraints   | Primary key                                                                                          |
| Check constraints    | Terminal outcome check; ended/outcome pair; no self-restart                                          |
| Immutable/write-once | ID, enrollment, start; terminal fields 한 번; lineage 한 번                                              |
| Lifecycle            | Active에서 terminal outcome 하나로 이동                                                                     |
| Timestamp authority  | Server                                                                                               |
| JSONB usage          | 없음                                                                                                   |
| P0 inclusion reason  | Session terminalization 및 restart validation                                                         |

Allowed `terminal_outcome`:

* `COMPLETED`
* `ABANDONED`
* `TIMED_OUT`
* `TECHNICAL_FAILURE`
* `WITHDRAWN`

Named constraints:

* `evidence_sessions_outcome_check`
* `evidence_sessions_terminal_pair_check`
* `evidence_sessions_no_self_restart`

Restart target의 terminal 상태와 같은 enrollment 여부는 application transaction validation이 강제한다.

## 5.12 `evidence_attempt_series`

### Purpose

Pedagogical retry attempts를 하나의 assignment-scoped series로 묶는다.

### Physical contract

| 항목                   | 계약                                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| Primary key          | `attempt_series_id UUID`                                                  |
| Required columns     | `attempt_series_id UUID`, `assignment_id UUID`, `created_at TIMESTAMPTZ`  |
| Nullable columns     | 없음                                                                        |
| Foreign keys         | Assignment                                                                |
| Unique constraints   | Primary key; `(attempt_series_id, assignment_id)` composite ownership key |
| Check constraints    | 없음                                                                        |
| Immutable/write-once | 모든 필드                                                                     |
| Lifecycle            | Insert-only                                                               |
| Timestamp authority  | Server                                                                    |
| JSONB usage          | 없음                                                                        |
| P0 inclusion reason  | Retry ordinal uniqueness와 assignment scope                                |

## 5.13 `evidence_attempts`

### Purpose

Stable logical response root와 attempt-open idempotency registration을 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `attempt_id UUID`                                                                                                                                                                                                                                                                                        |
| Required columns     | `attempt_id UUID`, `assignment_id UUID`, `session_id UUID`, `attempt_series_id UUID`, `retry_ordinal INTEGER`, `idempotency_identity TEXT`, `open_payload_digest TEXT`, `digest_algorithm TEXT`, `normalization_version TEXT`, `replay_result JSONB`, `started_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `retry_of_attempt_id UUID`                                                                                                                                                                                                                                                                               |
| Foreign keys         | Assignment; Session; attempt series ownership; retry parent                                                                                                                                                                                                                                              |
| Unique constraints   | `(assignment_id, idempotency_identity)`; `(attempt_series_id, retry_ordinal)`                                                                                                                                                                                                                            |
| Check constraints    | Nonempty identity/digest metadata; retry ordinal nonnegative; ordinal-parent consistency; no self-parent                                                                                                                                                                                                 |
| Immutable/write-once | 모든 필드                                                                                                                                                                                                                                                                                                    |
| Lifecycle            | Attempt-open root. Terminal data는 finalization table이 소유                                                                                                                                                                                                                                                 |
| Timestamp authority  | Server                                                                                                                                                                                                                                                                                                   |
| JSONB usage          | Stored attempt-open replay result                                                                                                                                                                                                                                                                        |
| P0 inclusion reason  | One logical response root, duplicate/retry separation                                                                                                                                                                                                                                                    |

Named constraints:

* `evidence_attempts_assignment_idempotency_unique`
* `evidence_attempts_series_ordinal_unique`
* `evidence_attempts_retry_ordinal_nonnegative`
* `evidence_attempts_retry_parent_consistency`
* `evidence_attempts_no_self_retry`

Attempt row 자체가 open idempotency registration이다. 별도 registration table을 만들지 않는다.

Retry parent와 child는 같은 assignment와 enrollment에 속해야 한다. 서로 다른 session일 수 있으나 각 session은 같은 enrollment에 속해야 한다.

## 5.14 `evidence_attempt_finalizations`

### Purpose

Attempt당 정확히 한 개의 immutable final response, timing 및 finalization idempotency result를 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary key          | `attempt_id UUID`                                                                                                                                                                                                                                                                                                                                                                                      |
| Required columns     | `attempt_id UUID`, `finalization_idempotency_identity TEXT`, `finalization_payload_digest TEXT`, `digest_algorithm TEXT`, `normalization_version TEXT`, `server_received_at TIMESTAMPTZ`, `finalized_at TIMESTAMPTZ`, `clock_quality TEXT`, `response_kind TEXT`, `attempt_outcome TEXT`, instrumentation protocol ID/version, actual modality arrays, `replay_result JSONB`, `created_at TIMESTAMPTZ` |
| Nullable columns     | Monotonic offsets/duration; `response_text TEXT`; `response_json JSONB`; `response_ref TEXT`                                                                                                                                                                                                                                                                                                           |
| Foreign keys         | Attempt                                                                                                                                                                                                                                                                                                                                                                                                |
| Unique constraints   | Attempt당 한 finalization                                                                                                                                                                                                                                                                                                                                                                                |
| Check constraints    | Timing nonnegative/order; response-kind representation; outcome; clock quality; nonempty idempotency/digest metadata                                                                                                                                                                                                                                                                                   |
| Immutable/write-once | 모든 필드                                                                                                                                                                                                                                                                                                                                                                                                  |
| Lifecycle            | Insert가 attempt terminalization을 의미                                                                                                                                                                                                                                                                                                                                                                    |
| Timestamp authority  | Server timestamps는 server; monotonic values는 client fact                                                                                                                                                                                                                                                                                                                                               |
| JSONB usage          | Structured response, modality arrays, replay result                                                                                                                                                                                                                                                                                                                                                    |
| P0 inclusion reason  | Finalization atomicity, replay, timing eligibility                                                                                                                                                                                                                                                                                                                                                     |

Allowed `response_kind`:

* `TEXT`
* `JSON`
* `REFERENCE`
* `NORMAL_EMPTY`

Allowed `attempt_outcome`:

* `SCORABLE`
* `UNSCORABLE`
* `TECHNICAL_INVALID`

Allowed `clock_quality`:

* `VALID`
* `DEGRADED`
* `UNKNOWN`
* `INVALID`

Named constraints:

* `evidence_attempt_finalizations_clock_quality_check`
* `evidence_attempt_finalizations_response_kind_check`
* `evidence_attempt_finalizations_outcome_check`
* `evidence_attempt_finalizations_timing_nonnegative`
* `evidence_attempt_finalizations_timing_order`
* `evidence_attempt_finalizations_response_representation`

`NORMAL_EMPTY`는 response payload가 없는 정상 domain outcome이다. Missing assignment는 finalization row로 표현하지 않는다.

## 5.15 `evidence_target_node_evaluations`

### Purpose

하나의 finalized attempt와 여러 target Grammar Node 사이의 evaluation bridge를 저장한다.

### Physical contract

| 항목                   | 계약                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key          | `evaluation_id UUID`                                                                                                                                                                                |
| Required columns     | `evaluation_id UUID`, `attempt_id UUID`, `node_id TEXT`, `rubric_id TEXT`, `rubric_version INTEGER`, `rubric_outcome JSONB`, `scorable BOOLEAN`, `evaluation_source TEXT`, `created_at TIMESTAMPTZ` |
| Nullable columns     | `is_correct BOOLEAN`                                                                                                                                                                                |
| Foreign keys         | Finalized attempt; Grammar Node                                                                                                                                                                     |
| Unique constraints   | `(attempt_id, node_id)`                                                                                                                                                                             |
| Check constraints    | Positive rubric version; evaluation source; non-scorable correctness consistency; rubric outcome non-null                                                                                           |
| Immutable/write-once | 모든 필드                                                                                                                                                                                               |
| Lifecycle            | Insert-only                                                                                                                                                                                         |
| Timestamp authority  | Server                                                                                                                                                                                              |
| JSONB usage          | Structured rubric outcome                                                                                                                                                                           |
| P0 inclusion reason  | Multi-node denominator, correctness 및 orphan prevention                                                                                                                                             |

Allowed `evaluation_source`:

* `RULE`
* `HUMAN`
* `AI_ASSISTED`

P0 service는 `RULE` source를 사용한다. `HUMAN`과 `AI_ASSISTED`는 physical value reservation이며 P0 human-rating/provider surface를 활성화하지 않는다.

Named constraints:

* `evidence_target_node_evaluations_attempt_node_unique`
* `evidence_target_node_evaluations_source_check`
* `evidence_target_node_evaluations_scorable_consistency`

## 5.16 `evidence_correction_aggregates`

### Purpose

Attempt-owned minimum correction bucket을 저장한다.

### Physical contract

| 항목                   | 계약                                                                      |
| -------------------- | ----------------------------------------------------------------------- |
| Primary key          | `(attempt_id, initiator, feedback_phase, correction_outcome)`           |
| Required columns     | Attempt ID, dimension fields, `count INTEGER`, `created_at TIMESTAMPTZ` |
| Nullable columns     | 없음                                                                      |
| Foreign keys         | Finalized attempt                                                       |
| Unique constraints   | Composite primary key                                                   |
| Check constraints    | Dimension values; count nonnegative                                     |
| Immutable/write-once | 모든 필드                                                                   |
| Lifecycle            | Insert-only                                                             |
| Timestamp authority  | Server                                                                  |
| JSONB usage          | 없음                                                                      |
| P0 inclusion reason  | Self-correction reconstruction과 missing/zero separation                 |

Allowed `initiator`:

* `LEARNER`
* `SYSTEM`

Allowed `feedback_phase`:

* `PRE_FEEDBACK`
* `POST_FEEDBACK`

Allowed `correction_outcome`:

* `SUCCESSFUL`
* `UNSUCCESSFUL`
* `UNKNOWN`

Named constraints:

* `evidence_correction_aggregates_initiator_check`
* `evidence_correction_aggregates_phase_check`
* `evidence_correction_aggregates_outcome_check`
* `evidence_correction_aggregates_count_nonnegative`

Stored `count = 0`은 관측된 zero bucket이다.

Row 부재는 해당 bucket이 제공되지 않았거나 correction instrumentation이 이용 가능하지 않았음을 뜻한다. 두 상태를 합치지 않는다.

## 6. Assignment snapshot representation

### 6.1 Selected design

P0 snapshot은 **bounded hybrid**를 사용한다.

구성:

1. Dedicated one-to-one immutable snapshot table

   * `evidence_assignment_snapshots`
2. Normalized target-node child relation

   * `evidence_assignment_snapshot_nodes`
3. Scalar query-critical reference columns

   * item, scenario, family, lexical, rubric, formula 및 protocol ID/version
4. Bounded JSONB

   * planned stimulus modality array
   * planned response modality array

### 6.2 Atomic creation

다음은 하나의 transaction이다.

* Assignment insert
* Server-side version resolution
* Snapshot insert
* 모든 target-node child insert
* 최소 target-node cardinality 확인

Transaction commit 후 assignment 또는 snapshot을 수정하지 않는다.

### 6.3 Reference validation

Server는 다음을 resolve한다.

* Experiment version
* Condition version
* Target Grammar Nodes
* Item version
* Content version when applicable
* Scenario version
* Item-family version
* Lexical manifest version
* Rubric version
* Formula version
* Scheduler protocol version
* Instrumentation protocol version

Caller는 selection intent와 reference만 제공한다.

Caller가 authoritative snapshot을 전달하거나 server-issued version을 덮어쓸 수 없다.

### 6.4 Reschedule

Reschedule은:

* 기존 assignment 수정이 아니라,
* 새 assignment,
* 새 snapshot,
* 새 target-node rows

를 생성한다.

기존 snapshot은 변경하지 않는다.

### 6.5 Rejected alternatives

| 대안                                     | 기각 이유                                                              |
| -------------------------------------- | ------------------------------------------------------------------ |
| Assignment row embedded JSONB snapshot | FK validation과 queryability가 약하며 partial/malformed bundle을 허용하기 쉬움 |
| Fully normalized relation-per-field    | P0 bounded reference set에 비해 join과 transaction 복잡도가 과도함            |
| 모든 snapshot scalar를 assignment row에 포함 | Mutable lifecycle와 immutable configuration이 한 row에서 혼합됨            |
| Latest-version 조회만 저장                  | Historical version drift 발생                                        |
| Target nodes JSONB array               | Node FK와 duplicate/ordering constraint가 약해짐                        |

## 7. Identity and idempotency

## 7.1 Attempt-open scope

Minimum uniqueness:

```text
assignment_id + idempotency_identity
```

Physical enforcement:

* `evidence_attempts`의 unique constraint
* Attempt row 자체가 idempotency registration
* 별도 idempotency registration table 없음

### Same key and same normalized payload

* Existing attempt를 반환한다.
* 새 attempt를 생성하지 않는다.
* 새 series 또는 retry ordinal을 생성하지 않는다.
* Stored `replay_result`를 반환한다.

### Same key and different normalized payload

* `CONTRACT_VIOLATION`
* Existing attempt와 replay result는 변경하지 않는다.
* 새 row를 생성하지 않는다.

## 7.2 Finalization idempotency

Attempt open과 finalization은 별도 mutating operation이므로 finalization에는 distinct identity가 필요하다.

Physical fields:

* `finalization_idempotency_identity`
* `finalization_payload_digest`
* `digest_algorithm`
* `normalization_version`
* `replay_result`

Rules:

1. Attempt당 finalization row는 하나다.
2. Same key + same digest는 replay다.
3. Same key + different digest는 `CONTRACT_VIOLATION`이다.
4. Existing finalization에 different key를 사용하면 terminal mutation `CONTRACT_VIOLATION`이다.
5. Finalization replay는 production action을 다시 실행하지 않는다.
6. Finalization replay는 새 pedagogical attempt를 만들지 않는다.

## 7.3 Normalized payload categories

Attempt-open digest의 최소 semantic categories:

* Operation category
* Assignment reference
* Session reference
* Retry intent
* Retry parent
* Instrumentation version
* Requested stable references applicable to open
* Caller-supplied lifecycle intent

Finalization digest의 최소 semantic categories:

* Operation category
* Attempt reference
* Final response or immutable response reference
* Client monotonic timing facts
* Actual modality arrays
* Learner action category
* Correction aggregate
* Synchronous evaluation input/result reference
* Caller-supplied completion intent
* Instrumentation version

Excluded from caller-payload normalization:

* Server-issued IDs
* Server timestamps
* Server-resolved snapshot
* Retry ordinal
* Clock-quality classification
* Server-derived lifecycle outcome
* Created timestamp
* Derived metric

## 7.4 Digest algorithm

Canonical architecture는 하나의 digest algorithm을 영구 고정하지 않는다.

각 idempotent row는 다음을 저장한다.

* Algorithm identifier
* Normalization version
* Digest

Replay는 stored algorithm과 normalization version을 사용한다.

초기 implementation algorithm 선택은 implementation HOW다.

## 7.5 Blind retry

다음 creation operation은 P0에서 mandatory idempotent write가 아니다.

* Participant creation
* Enrollment creation
* Assignment creation
* Session start

해당 operation은 explicit operation identity 없이 blind retry하지 않는다.

Mandatory P0 idempotent write:

* Attempt open
* Attempt finalization

## 8. Retry and lineage

## 8.1 Attempt retry

Pedagogical retry:

* 새 idempotency identity
* 새 attempt ID
* 같은 attempt series
* 새 retry ordinal
* Retry parent FK
* 같은 assignment
* 같은 enrollment
* Prior attempt immutable

Parent와 child는 서로 다른 session에 속할 수 있다. 두 session은 동일 enrollment에 속해야 한다.

Network duplicate는 retry가 아니다.

## 8.2 Retry constraint ownership

Database:

* Parent existence
* No self-parent
* Series+ordinal uniqueness
* Assignment+idempotency uniqueness
* Attempt series ownership reference

Application transaction:

* Parent와 child의 same assignment
* Parent와 child의 same enrollment
* Parent series consistency
* Strictly increasing retry ordinal
* Parent terminal/retry eligibility
* Cycle prevention

## 8.3 Reschedule lineage

Physical fields:

* New assignment: `rescheduled_from`
* Prior assignment: `superseded_by`

Rules:

1. 두 방향을 같은 transaction에서 작성한다.
2. 두 assignment는 같은 enrollment에 속한다.
3. New assignment와 snapshot을 먼저 완전하게 생성한 뒤 prior assignment를 supersede한다.
4. Prior snapshot 또는 due timestamp를 덮어쓰지 않는다.
5. Lineage cycle을 허용하지 않는다.
6. Prior assignment당 하나의 superseding assignment만 허용한다.

## 8.4 Session restart lineage

Physical field:

* New session: `restarted_from`

Rules:

1. Target session은 terminal이어야 한다.
2. 두 session은 같은 enrollment에 속한다.
3. Restart는 새 session을 생성한다.
4. Prior terminal session을 reopen하지 않는다.
5. Cycle을 허용하지 않는다.

## 8.5 Cycle prevention

Database CHECK는 self-cycle만 방지한다.

Longer cycle은 application이 transaction 안에서 parent chain을 조회해 방지한다.

Validation 대상:

* Assignment reschedule chain
* Session restart chain
* Attempt retry chain

## 9. Transaction boundaries

Default isolation:

* PostgreSQL `READ COMMITTED`

P0에서 `SERIALIZABLE` 또는 global advisory lock을 요구하지 않는다.

Unique constraints, FK, targeted row lock 및 consistent lock order를 사용한다.

Lock order:

1. Assignment
2. Session
3. Attempt

## 9.1 Assignment creation

Transaction owner:

* Evidence recorder/repository

Atomic set:

* Enrollment validation
* Version authority resolution
* Assignment insert
* Snapshot insert
* Target-node inserts
* Minimum node cardinality validation

Concurrency:

* Published reference rows may be read with ordinary MVCC or `FOR KEY SHARE` when necessary.
* Coarse lock 없음.

Rollback:

* Assignment, snapshot 및 target-node row가 모두 없어야 한다.

## 9.2 Session start

Atomic set:

* Enrollment lifecycle validation
* Session ID issuance
* Session insert
* Server start timestamp

Concurrency:

* Enrollment terminal transition과 충돌 가능성이 있으면 enrollment row validation lock 사용.
* P0는 “enrollment당 active session 하나” invariant를 추가하지 않는다.

Rollback:

* Session row 없음.

## 9.3 Attempt open

Atomic set:

* Assignment/session ownership
* Lifecycle validation
* Idempotency uniqueness
* Existing replay comparison
* Attempt-series creation or validation
* Retry ordinal and parent
* Attempt insert

Concurrency:

* Unique `(assignment_id, idempotency_identity)`가 duplicate arbitration을 소유한다.
* 별도 advisory lock 없음.

Rollback:

* Attempt row 없음.
* Orphan idempotency registration 없음.
* Orphan series는 operation이 새 series까지 생성한 경우 함께 rollback된다.

## 9.4 Attempt finalization

Atomic set:

* Attempt and assignment lifecycle lock
* Finalization idempotency
* Final response
* Monotonic timing
* Server timestamps
* Clock-quality classification
* Technical validity
* Correction aggregates
* Synchronous target-node evaluations
* Attempt terminal outcome
* Applicable assignment completion

Concurrency:

* Assignment completion 시 assignment row를 먼저 lock한다.
* Attempt row를 다음으로 lock한다.
* Existing finalization은 replay/terminal conflict 판단에 사용한다.

Rollback:

* Finalization row 없음.
* Evaluation row 없음.
* Correction row 없음.
* Assignment completion 없음.

## 9.5 Technical-failure terminalization

한 command가 attempt, assignment 및 session 중 둘 이상을 terminalize하면 해당 terminal facts를 한 transaction에서 처리한다.

Technical failure는:

* learner incorrect가 아니며,
* normal empty가 아니며,
* missing이 아니다.

Rollback 시 모든 target root가 pre-operation lifecycle을 유지한다.

## 9.6 Reschedule/supersede

Atomic set:

* Prior assignment lock
* Eligibility and cycle validation
* New assignment
* New snapshot
* New target-node rows
* New `rescheduled_from`
* Prior `superseded_by`
* Prior terminal/superseded outcome

Rollback:

* Prior assignment unchanged
* New aggregate 없음
* One-way lineage 없음

## 9.7 Session restart

Atomic set:

* Prior session lock
* Terminal and ownership validation
* New session
* Restart lineage
* New start timestamp

Rollback:

* Prior session unchanged
* New session 없음

## 9.8 Failure injection

Integration tests는 각 transaction의 중간 단계에서 failure를 유발할 수 있어야 한다.

허용 방식:

* Invalid child fixture
* Duplicate constraint
* Injected repository callback/error
* Controlled test-only failure hook

Production runtime에 test-only failure route를 노출하지 않는다.

## 10. Raw response and timing

## 10.1 Final-response representation

P0 finalization은 다음 response kind를 지원한다.

### TEXT

* `response_text` 사용
* `response_json`, `response_ref`는 null

### JSON

* `response_json` 사용
* `response_text`, `response_ref`는 null
* JSON은 object 또는 array 등 contract가 허용한 bounded structured response

### REFERENCE

* `response_ref` 사용
* `response_text`, `response_json`은 null
* Reference는 recorder가 승인한 immutable asset/object reference

### NORMAL_EMPTY

* 세 payload field 모두 null
* 정상 수집 완료된 empty result
* Missing 또는 technical failure와 구분

## 10.2 Response payload size and security

Exact byte limit은 implementation configuration이다.

Invariant:

* Recorder는 configured upper bound를 강제한다.
* Oversized payload는 partial write 없이 거부한다.
* Direct PII 저장 금지
* Credential 저장 금지
* Provider raw payload 저장 금지
* Raw keystroke stream 저장 금지
* Raw audio 저장 금지
* Binary body를 JSONB에 inline 저장하지 않음
* Reference target은 allowed scheme/type validation을 거침

## 10.3 Modality representation

Planned modality:

* Assignment snapshot JSONB arrays

Actual modality:

* Attempt finalization JSONB arrays

Arrays:

* 중복 금지
* Atomic component only
* `MIXED` sentinel 금지

Stimulus components:

* `TEXT`
* `AUDIO`
* `IMAGE`
* `VIDEO`

Response components:

* `TEXT_ENTRY`
* `SELECTION`
* `STRUCTURED_ACTION`
* `SPEECH`

`SPEECH` identity가 존재해도 P0 raw audio는 저장하지 않는다.

## 10.4 Monotonic timing

Nullable `BIGINT` millisecond facts:

* `input_enabled_offset_ms`
* `first_valid_activity_offset_ms`
* `submitted_offset_ms`
* `reported_client_monotonic_duration_ms`

Rules:

* Present value는 0 이상
* `input_enabled ≤ first_valid_activity ≤ submitted`
* First activity absent 가능
* Absent를 0으로 변환하지 않음
* Client wall clock은 저장하지 않음
* Server receive/finalize timestamps는 server가 발행

## 10.5 Invalid timing

Invalid timing은 두 contract path 중 하나로 처리한다.

1. Shape/range 자체가 invalid:

   * Entire finalization reject
   * `OUT_OF_RANGE_VALUE` 또는 lifecycle contract violation
2. Structurally accepted but instrumentation quality가 invalid:

   * `clock_quality = INVALID`
   * RT/initiation metric에서 제외
   * Learner response correctness를 자동 false로 변경하지 않음

어떤 path를 사용하는지는 instrumentation protocol version이 결정한다.

## 10.6 Outcome separation

다음은 서로 다른 상태다.

* Missing assignment
* Technical failure
* Withdrawn
* Unscorable
* Normal empty
* Explicit numeric zero
* SQL null
* Incorrect evaluation

한 상태를 다른 상태의 default로 사용하지 않는다.

## 11. Evaluation and correction

## 11.1 Multi-node evaluation

Attempt 하나는 여러 evaluation row를 가진다.

Grain:

```text
attempt_id + node_id
```

Duplicate node evaluation은 금지한다.

각 evaluation은 finalized attempt를 parent로 가져야 한다.

## 11.2 Rubric version

Evaluation은 exact rubric ID/version을 저장한다.

Assignment snapshot의 rubric reference와 evaluation rubric reference가 일치해야 한다. 다를 경우 finalization 전체를 거부한다.

## 11.3 Scorable and correctness

* `scorable = true`: binary rubric이면 `is_correct` required
* `scorable = true`: nonbinary rubric이면 `is_correct` null 가능
* `scorable = false`: `is_correct`는 null
* `rubric_outcome`은 항상 존재

Rubric policy 자체는 recorder가 결정하지 않는다.

## 11.4 Orphan prevention

Database:

* Evaluation parent FK
* Grammar Node FK

Application:

* Node가 assignment snapshot target set에 포함되는지 검증
* Cross-assignment/cross-participant evaluation 거부
* Partial node validity 시 전체 finalization 거부

## 11.5 Correction grain

Correction aggregate grain:

```text
attempt_id
+ initiator
+ feedback_phase
+ correction_outcome
```

## 11.6 Correction count

* Count는 0 이상
* Negative count 거부
* Zero row와 missing row 구분
* Duplicate grain 거부
* Production `correction_count`와 동일 authority로 간주하지 않음
* P0는 production scalar projection을 기록하지 않음

## 12. Derived metric query boundary

## 12.1 Query-time only

P0 metric은 query-time에 raw facts에서 rebuild한다.

Materialized table은 없다.

Required metrics:

* Retention
* Unseen transfer
* RT median
* RT CV
* Initiation latency
* Self-correction
* Completion
* Dropout
* Review debt
* Human agreement

P0에는 human rating row가 없으므로 human agreement query는:

* synthetic fixture reference로 contract shape만 검증하거나,
* source data가 없으면 `INSUFFICIENT`

를 반환한다.

## 12.2 Query input

Minimum query input:

* Formula ID/version
* Analysis cutoff
* Aggregation grain
* Condition/enrollment/timepoint filters
* Optional node/item-family filters

## 12.3 Query output

Minimum result:

```text
formula_reference
analysis_cutoff
aggregation_grain
status
numerator
denominator
value
eligible_count
excluded_count
missing_count
technical_failure_count
withdrawn_count
unscorable_count
normal_empty_count
source_rebuild_reference
```

Allowed status:

* `OK`
* `INSUFFICIENT`

`INSUFFICIENT` result:

* `value = null`
* Sample counts 보존
* Zero로 변환하지 않음

## 12.4 Eligibility authority

Formula version definition이 다음을 소유한다.

* Eligible set
* Numerator
* Denominator
* Exclusion rules
* Minimum sample rule
* Aggregation grain
* Timeliness treatment

Raw facts는 formula result를 저장하지 않는다.

## 12.5 Metric-specific invariants

### Retention

* DAY_7 또는 DAY_30
* On-time completed scorable evaluations
* Missing/technical/withdrawn는 conditional denominator에서 제외
* Counts는 별도 보존

### Unseen transfer

* Primary eligibility는 different item family
* Exact repeat/surface variant/same family 제외
* Scenario lineage는 별도 stratification

### RT median/CV

* Correct and timing-eligible attempt
* Invalid timing 제외
* Insufficient sample은 `INSUFFICIENT`

### Initiation latency

* First-valid-activity가 존재하고 timing eligible
* Absent activity를 0으로 계산하지 않음

### Self-correction

* Learner-initiated pre-feedback aggregate
* System/post-feedback는 별도 strata

### Completion

* Due non-superseded assignment
* Completion과 learner performance 분리

### Dropout

* Rule version이 없으면 `INSUFFICIENT`
* Withdrawal과 dropout 구분

### Review debt

* Pilot review assignment만 사용
* Production `next_review_at` 사용 금지

### Human agreement

* Independent original rating data가 필요
* P0 physical schema에는 human rating table 없음
* Source가 없으면 `INSUFFICIENT`

## 12.6 Non-authority invariant

Metric query result는:

* Progress state가 아니며,
* Evidence raw fact가 아니며,
* Scheduling write input으로 자동 사용되지 않으며,
* Learner state transition을 유발하지 않는다.

Raw facts 또는 formula version과 projection이 충돌하면 raw facts와 formula version이 우선한다.

## 13. Index contract

Index 이름은 implementation 단계에서 repository naming convention에 맞춰 결정한다.

Required query patterns:

| Physical object       | Required query/index purpose                            |
| --------------------- | ------------------------------------------------------- |
| Experiment versions   | Experiment별 version lookup                              |
| Condition versions    | Condition별 version lookup                               |
| Reference versions    | Kind+ID+version lookup                                  |
| Enrollments           | Participant history, experiment/condition cohort        |
| Assignments           | Enrollment lifecycle, type/timepoint, due assignment    |
| Review assignments    | Enrollment+due lookup for active unsuperseded REVIEW    |
| Sessions              | Enrollment chronological history                        |
| Attempts              | Assignment history, session history, retry series order |
| Finalizations         | Finalized timestamp and analysis cutoff                 |
| Evaluations           | Node/attempt metric join                                |
| Correction aggregates | Attempt and correction-dimension aggregation            |

Required index semantics:

1. PK와 unique constraint가 제공하는 index를 중복 생성하지 않는다.
2. `evidence_assignments`는 enrollment/type/timepoint filtering을 지원해야 한다.
3. Active pilot review debt를 위한 partial index 후보:

   * type REVIEW
   * terminal outcome null
   * superseded_by null
4. `evidence_attempts`는 assignment/session/series 조회를 지원해야 한다.
5. `evidence_attempt_finalizations`는 finalized time cutoff 조회를 지원해야 한다.
6. `evidence_target_node_evaluations`는 node-based analysis join을 지원해야 한다.
7. P0는 JSONB GIN index를 요구하지 않는다.
8. Production table에 index를 추가하지 않는다.

## 14. Immutability enforcement

## 14.1 Database-enforced

Database constraints enforce:

* Primary-key uniqueness
* Foreign-key integrity
* Attempt-open idempotency uniqueness
* Retry ordinal uniqueness
* One snapshot per assignment
* One finalization per attempt
* One evaluation per attempt/node
* One correction row per bucket
* Allowed lifecycle values
* Positive versions
* Nonnegative timing/count
* Response-kind consistency
* No direct self-lineage

## 14.2 Application-enforced

Recorder/repository enforces:

* Published version update/delete prohibition
* Snapshot update/delete prohibition
* Target-node update/delete prohibition
* Attempt-root mutation prohibition
* Finalization update/delete prohibition
* Evaluation/correction update/delete prohibition
* Terminal null→value only
* Same-enrollment lineage
* Restart target terminal
* Lineage cycle prevention
* Minimum one target node
* Reference-kind matching
* Snapshot/rubric consistency
* Content version validation
* Additive correction provenance

## 14.3 Database-role boundary

P0 implementation should prefer a database role or repository access pattern that:

* permits approved inserts,
* permits narrow lifecycle terminal updates,
* denies ordinary update/delete on immutable evidence tables.

Exact grant design is implementation HOW.

## 14.4 Correction provenance

Normal P0 recorder operation does not destructively correct raw facts.

A future additive correction mechanism must preserve:

* Original fact
* Corrected fact reference
* Reason
* Actor/source
* Timestamp
* Replacement/superseding fact
* Schema/protocol version

P0 physical migration does not create a generic correction-provenance table unless implementation cannot enforce immutability without it. Such addition requires architecture review because generic observation is excluded from P0.

## 15. Migration specification

## 15.1 Repository convention

Migration runner:

```text
db/migrate.js
```

Migration directory:

```text
db/migrations
```

Ledger:

```text
schema_migrations
```

Runner contract:

* Files are sorted lexicographically.
* Each unapplied migration file runs in one transaction.
* Successful migration and ledger insertion are committed together.
* Failed migration is rolled back.

## 15.2 Candidate migration filename

Candidate:

```text
db/migrations/012_create_evidence_foundation.sql
```

This candidate is valid only when implementation preflight confirms that `011` is the highest current migration number on `origin/main`.

If:

* another `012` exists,
* highest number is not `011`,
* migration naming convention changed,

implementation stops and reports the actual list. It does not choose another number without Control Tower approval.

## 15.3 One-file migration

All P0 evidence objects, constraints and indexes are included in one migration file.

Reason:

* Runner transaction boundary is per migration file.
* P0 prohibits partially installed evidence schema.
* One file provides atomic schema installation.

Circular references may be added after both referenced objects are created within the same file and same migration transaction.

## 15.4 Additive scope

Migration creates only new `evidence_` objects.

It does not:

* alter `progress`,
* alter `attempt_records`,
* alter `next_review_at`,
* alter Content rows,
* backfill production data,
* add a pilot discriminator to production tables,
* add a public route,
* enable recorder invocation.

## 15.5 Dependencies

Required existing objects:

* `grammar_nodes`
* `content`
* UUID generation facility used by the existing repository
* `schema_migrations`

No dependency on:

* Progress rows
* Production attempts
* Actual provider
* Audio
* Human rating

## 15.6 Validation before migration

Confirm:

* Current branch and baseline
* Migration sequence
* Empty-database baseline migration PASS
* Production table catalog snapshot
* Production fixture row counts/digests
* Existing regression baseline

## 15.7 Validation after migration

Confirm:

* One new migration-ledger row
* All expected `evidence_` objects
* Required PK/FK/unique/check constraints
* Required indexes
* No changed production column/type/default/constraint
* Recorder disabled path
* Existing regression PASS
* P0 evidence fixture PASS

## 16. Rollout and rollback

## 16.1 Rollout order

1. Apply all baseline migrations to an empty validation database.
2. Apply Evidence Foundation migration.
3. Inspect catalog and constraints.
4. Run migration/schema validation.
5. Deploy recorder implementation disabled or unwired.
6. Run existing regression.
7. Run P0 fixture suites.
8. Enable recorder only for P0 validation harness.
9. Do not expose public HTTP path.
10. Do not enable production dual-write.

## 16.2 Evidence-disabled behavior

Recorder disabled/unreferenced 상태에서:

* Existing Learning Flow unchanged
* Existing Engine calls unchanged
* External response shapes unchanged
* Progress transactions unchanged
* No evidence rows created
* Existing regression fixture does not require evidence rows

## 16.3 Code rollback

Automatic down migration을 전제하지 않는다.

Code rollback:

* Recorder wiring을 disable/remove
* Evidence schema 유지
* Evidence data 유지
* Production data 변경 없음

## 16.4 Destructive removal

Evidence schema/data removal은 별도 approved forward migration이어야 한다.

필수 선행:

* Explicit user approval
* Human evidence 존재 여부 확인
* Privacy/Operations decision where applicable
* Export/preservation decision
* Independent validation
* Production non-interference proof

## 16.5 Fixture cleanup

P0 synthetic fixture는:

* Test transaction rollback 또는
* Evidence table에 한정된 deterministic cleanup

을 사용한다.

Fixture cleanup은 production retention policy가 아니다.

## 16.6 Partial deployment prohibition

다음 상태는 허용하지 않는다.

* Recorder code가 migration보다 먼저 활성화됨
* Evidence schema 일부만 설치됨
* Migration schema와 tests가 다른 version을 전제
* Public route가 P0에서 활성화됨
* Production dual-write가 P0에서 활성화됨

## 17. Implementation file boundary

## 17.1 Allowed candidate files

Subject to implementation preflight:

```text
db/migrations/012_create_evidence_foundation.sql
src/instrumentation/evidenceRepository.js
src/instrumentation/evidenceRecorder.js
src/instrumentation/evidenceValidation.js
src/instrumentation/evidenceNormalization.js
src/instrumentation/evidenceMetrics.js
src/instrumentation/index.js
```

Roles:

| Path                       | Role                                             |
| -------------------------- | ------------------------------------------------ |
| Migration file             | New evidence objects, constraints and indexes    |
| `evidenceRepository.js`    | SQL, transaction ownership, row locking          |
| `evidenceRecorder.js`      | Internal operation contract                      |
| `evidenceValidation.js`    | ID, ownership, lifecycle, timing validation      |
| `evidenceNormalization.js` | Versioned payload normalization and digest input |
| `evidenceMetrics.js`       | Query-time raw metric reconstruction             |
| `index.js`                 | Internal export only                             |

## 17.2 Forbidden implementation paths

Do not create recorder under:

```text
src/engines/
```

Do not modify for P0:

* Progress Engine
* Production attempt writer
* Production scheduling implementation
* Learning Flow public route/controller
* Public HTTP route registry
* Workflow on main
* Existing production migration files

## 17.3 Test-root placeholder

Exact test root and naming convention must be confirmed from current repository before Development creates test files.

Development must not:

* invent parallel `test/` and `tests/` roots,
* create a new test hierarchy without need,
* assume a framework or filename suffix not present in repository.

Expected logical test surface:

* Migration integration test
* Recorder PostgreSQL integration test
* Metric rebuild integration test
* Fixture builder/helper
* Existing regression invocation

Exact paths remain implementation preflight output.

## 18. PostgreSQL fixture suites

모든 suite는 실제 PostgreSQL을 사용한다.

## 18.1 Identity/version authorities

### Setup

* Experiment와 여러 versions
* Condition과 여러 versions
* Item/scenario/family/lexical/rubric/formula/protocol fixtures

### Transaction under test

* Version registration
* Equivalent replay
* Conflicting version registration

### Expected rows

* Stable authority 한 건
* Accepted version별 한 건

### Rejected rows

* Empty ID
* Nonpositive version
* Invalid kind
* Same ID/version different definition

### Error category

* `OUT_OF_RANGE_VALUE`
* `CONTRACT_VIOLATION`
* `INVALID_ID`, applicable한 경우

### Atomicity

Version bundle all-or-nothing.

### Production comparison

Production catalog/rows unchanged.

### Cleanup

Evidence authority rows only, dependency-safe order or transaction rollback.

## 18.2 Participant/enrollment

### Setup

* Two pseudonymous participants
* Published experiment/condition versions

### Transaction under test

* Participant creation
* Enrollment creation
* Cross-participant misuse
* Withdrawn enrollment use

### Expected rows

* Exact participant/enrollment ownership
* Direct PII 없음

### Rejected rows

* Direct PII payload
* Unknown version
* Invalid lifecycle

### Error category

* `CONTRACT_VIOLATION`
* `INVALID_ID`

### Atomicity

No orphan enrollment.

### Production comparison

`users`, `progress`, `attempt_records` unchanged.

### Cleanup

Evidence participant/enrollment only.

## 18.3 Assignment/snapshot

### Setup

* Active enrollment
* Valid reference bundle
* Existing target Grammar Nodes
* Optional Content reference

### Transaction under test

* Valid assignment creation
* Invalid reference
* Caller snapshot override
* Duplicate node

### Expected rows

* Assignment one
* Snapshot one
* Exact target-node rows

### Rejected rows

* Unknown node/version
* Partial valid list
* Duplicate node
* Missing child set
* Caller authoritative snapshot

### Error category

* `INVALID_ID`
* `CONTRACT_VIOLATION`

### Atomicity

Failure leaves no assignment aggregate.

### Production comparison

Content/Grammar/Progress unchanged.

### Cleanup

Rollback or assignment aggregate cleanup.

## 18.4 Session lifecycle

### Setup

* Active enrollment

### Transaction under test

* Start
* Terminalize
* Repeat terminalization
* Restart terminal
* Restart nonterminal

### Expected rows

* Start row
* Write-once terminal pair
* New restart session

### Rejected rows

* Outcome/end mismatch
* Terminal mutation
* Nonterminal restart
* Cross-enrollment restart

### Error category

* `CONTRACT_VIOLATION`

### Atomicity

No partial terminal or restart state.

### Production comparison

Unchanged.

### Cleanup

Evidence sessions only.

## 18.5 Attempt open/idempotency

### Setup

* Active assignment/session

### Transaction under test

* First open
* Same key/same payload
* Same key/different payload
* Concurrent duplicate
* Failure injection

### Expected rows

* One attempt for equivalent replay
* Stored replay result

### Rejected rows

* Conflicting replay
* Ownership mismatch
* Terminal parent

### Error category

* `CONTRACT_VIOLATION`
* `INVALID_ID`

### Atomicity

No orphan attempt/series/idempotency fact.

### Production comparison

No production attempt inserted.

### Cleanup

Evidence attempts and series only.

## 18.6 Retry lineage

### Setup

* Attempt A
* Second assignment for negative case

### Transaction under test

* Pedagogical retry B
* Duplicate replay
* Duplicate ordinal
* Cross-assignment parent
* Cycle attempt

### Expected rows

* A and B same series
* B new key/ID/ordinal
* Parent linkage

### Rejected rows

* Duplicate ordinal
* Wrong assignment/enrollment
* Cycle/self-parent

### Error category

* `CONTRACT_VIOLATION`

### Atomicity

Failed retry leaves no child.

### Production comparison

Unchanged.

### Cleanup

Evidence attempts/series.

## 18.7 Attempt finalization atomicity

### Setup

* Open attempt
* Response, timing, correction and multi-node evaluation

### Transaction under test

* Success
* Equivalent replay
* Conflicting replay
* Invalid evaluation
* Invalid correction
* Completion failure

### Expected rows

* One finalization
* Expected evaluations
* Expected correction rows
* Applicable assignment completion

### Rejected rows

* Different second finalization
* Orphan/duplicate evaluation
* Negative correction
* Invalid timing

### Error category

* `CONTRACT_VIOLATION`
* `OUT_OF_RANGE_VALUE`
* `INVALID_ID`

### Atomicity

Any failure leaves none of finalization children or assignment completion.

### Production comparison

Progress/attempt_records unchanged.

### Cleanup

Evidence finalization aggregate.

## 18.8 Technical terminalization

### Setup

* Active attempt/assignment/session combinations

### Transaction under test

* Attempt only
* Attempt+assignment
* Attempt+assignment+session
* Injected failure

### Expected rows

* All requested roots terminal together

### Rejected rows

* Incompatible prior outcome
* Mixed ownership
* Terminal mutation

### Error category

* `CONTRACT_VIOLATION`

### Atomicity

All or none.

### Production comparison

No learner incorrect or Progress update.

### Cleanup

Rollback fixture.

## 18.9 Reschedule/restart

### Setup

* Active assignment A1
* Terminal session S1
* New valid references

### Transaction under test

* A1→A2 reschedule
* Invalid reschedule
* Cycle
* S1→S2 restart

### Expected rows

* A2 and new snapshot
* Bidirectional assignment lineage
* S2 restart lineage
* Prior rows immutable

### Rejected rows

* In-place snapshot/due update
* Invalid version
* Cycle
* Nonterminal restart

### Error category

* `INVALID_ID`
* `CONTRACT_VIOLATION`

### Atomicity

No one-way lineage.

### Production comparison

`next_review_at` unchanged.

### Cleanup

Evidence lineage chain only.

## 18.10 Evaluation/correction

### Setup

* Finalizable multi-node attempt
* Rubric fixture

### Transaction under test

* Multiple node evaluations
* Duplicate node
* All correction dimensions
* Zero bucket
* Missing bucket
* Negative count

### Expected rows

* One row per attempt/node
* Zero bucket row
* Missing bucket absent

### Rejected rows

* Duplicate node
* Orphan parent
* Negative count
* Non-scorable with forbidden correctness

### Error category

* `CONTRACT_VIOLATION`
* `OUT_OF_RANGE_VALUE`
* `INVALID_ID`

### Atomicity

Part of finalization transaction.

### Production comparison

Production correction scalar unchanged.

### Cleanup

Finalization aggregate cleanup.

## 18.11 Raw metric rebuild

### Setup

Synthetic cohort covering:

* Completed/scorable
* Missing
* Technical failure
* Withdrawn
* Unscorable
* Normal empty
* Exact repeat
* Same family
* Different family
* Valid/invalid timing
* Correction/no correction
* Overdue pilot review
* Insufficient sample

### Transaction under test

Read-only query with formula version and cutoff.

### Expected rows/results

* Exact numerator/denominator
* Excluded and outcome counts
* `OK` or `INSUFFICIENT`
* Source rebuild reference

### Rejected query

* Unknown formula/version
* Invalid cutoff/filter

### Error category

* `INVALID_ID`
* `CONTRACT_VIOLATION`

### Atomicity

Read-only consistent snapshot.

### Production comparison

No writes.

### Cleanup

Synthetic evidence cohort only.

## 18.12 Production non-interference

### Setup

Representative production rows and before-state digests.

### Transaction under test

Complete P0 lifecycle and metric rebuild.

### Expected result

Exact before/after equality for production surfaces.

### Rejected state

Any production mutation.

### Error category

Validation failure; implementation must not be accepted.

### Atomicity

Evidence transactions only.

### Production comparison

Required exact comparison.

### Cleanup

Evidence rows only; production fixtures retained until digest comparison complete.

## 18.13 Rollback/failure injection

### Setup

Valid fixture per mutating operation.

### Failure points

* Assignment before snapshot
* Snapshot before node
* Attempt before idempotency completion
* Finalization before evaluation
* Evaluation before correction
* New assignment before prior supersede
* New session before restart lineage

### Expected rows

None from failed aggregate.

### Rejected rows

Any partial/orphan state.

### Error category

Internal transaction failure.

### Atomicity

Full rollback.

### Production comparison

Exact equality.

### Cleanup

Transaction rollback.

## 18.14 Existing regression

### Setup

* Baseline migrations
* Evidence migration
* Recorder disabled

### Transaction under test

Repository full existing regression command.

### Expected result

All pre-existing tests pass without evidence fixture requirements.

### Rejected result

Any changed public response, Progress behavior or production transaction.

### Error category

Regression failure.

### Atomicity

Not applicable to whole suite; each production test retains existing contract.

### Production comparison

Existing behavior unchanged.

### Cleanup

Existing test convention.

## 19. Production non-interference proof

## 19.1 Catalog comparison

Capture PostgreSQL catalog before and after migration.

Assert:

* `progress` columns unchanged
* `progress` constraints unchanged
* `attempt_records` columns unchanged
* `attempt_records` constraints unchanged
* `next_review_at` type/default/nullability unchanged
* No evidence trigger on production table
* No evidence FK to `progress`
* No evidence FK to `attempt_records`
* No production enum altered
* No production index altered

## 19.2 Row comparison

Before P0 lifecycle:

* Progress row count
* Deterministic ordered Progress digest
* Attempt-record row count
* Deterministic ordered attempt digest
* Ordered `(user_id, node_id, next_review_at)` values

After P0 lifecycle:

* Exact same counts
* Exact same digests
* Exact same scheduling values

Expected difference: zero.

## 19.3 Recorder-disabled path

When recorder is disabled/unwired:

* Learning Flow does not invoke recorder.
* External API shapes do not change.
* Existing Engine call graph does not change.
* No evidence rows are created.
* Production transaction boundaries do not change.

## 19.4 Regression proof

Evidence schema가 설치된 PostgreSQL에서 full existing regression이 통과해야 한다.

P0 fixture suite도 기존 regression을 포함한다.

## 19.5 Status boundary

이 validation은 다음 선언이 아니다.

* VL3 §10 PASS
* AC-018 `CLOSED`
* AC-018 `IMPLEMENTED`
* Actual-provider milestone complete
* Human-data pilot approved

## 20. Deferred surfaces

## 20.1 P1 instrumentation

* Client/controller transport
* Monotonic timing collection
* Production/evidence durable correlation receipt
* Production-coupled orchestration
* Actual VI item/scenario/family manifests
* Human rating
* Adjudication
* Operational technical-failure procedures

## 20.2 P2 formative

* Final timepoint windows
* Early/late/missed boundaries
* Dropout rule
* Reschedule/expiry policy
* Human-audit overlap
* Agreement threshold
* Optional materialized analysis projection

## 20.3 Privacy/Operations

* Pseudonymous mapping store
* Reidentification policy
* Database access roles
* Withdrawal
* Participant deletion
* Retention
* Pilot-end disposition
* Human-rater access
* Audit access logging
* Destructive removal of human evidence

## 20.4 Actual provider

* Generation run
* Validator run
* Provider/deployment/model identity
* Provider call outcome
* Retry/regeneration
* Ladder outcome
* Accepted Content exposure
* Provider transmission and retention

## 20.5 Audio

* Raw audio
* Audio observation
* VAD
* Pause
* Acoustic feature
* Pronunciation/tone score
* Speaking repair taxonomy
* Raw/derived retention

Default remains raw audio not collected.

## 21. Explicit non-goals

This contract does not:

* Change Tier A
* Change Progress SSOT
* Change production AttemptRecord
* Change production scheduling
* Create a ninth Engine
* Add a public HTTP API
* Require P0 production dual-write
* Create generic observation persistence
* Create human rating/adjudication persistence
* Create provider audit persistence
* Create audio persistence
* Create a materialized metric table
* Define migration SQL
* Define source implementation
* Define a test directory without repository confirmation
* Define privacy durations or thresholds
* Declare implementation complete
* Declare validation PASS

## 22. Approval boundary

Approval of this document permits:

* Documentation patch
* Physical migration drafting
* Recorder implementation planning
* PostgreSQL synthetic fixture implementation planning
* Validation-branch preparation

Approval does not permit or declare:

* Migration merged or applied
* Development complete
* P0 validation PASS
* Human data collection
* Public API activation
* Production dual-write
* Progress modification
* Production attempt modification
* Actual-provider completion
* Raw audio collection
* AC-018 closure/implementation
* VL3 §10 PASS

---
