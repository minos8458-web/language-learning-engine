# DATA_PERSISTENCE_BRIEF.md
## LLE Production 데이터 영속성 지시서 (Tier C, Production Track 1/5)

> 이 문서는 코드가 아니라 **지시서**다. `PRODUCTION_ARCHITECTURE_OVERVIEW.md`가 확정한 결정(서버+DB, 계층 단위 분해)을 전제로, "무엇을 어떤 스키마로 저장하는가"만 다룬다. 이 문서가 정의하는 것을 소비해 실제 로직을 다루는 것은 다음 문서 `DOMAIN_LOGIC_BRIEF.md`의 몫이다.
>
> 상위 문서(`CONCEPT_SCHEMA.md`, `GRAMMAR_SCHEMA.md`, `CONTENT_SCHEMA.md`, `PROGRESS_SCHEMA.md`, `VOCABULARY_SCHEMA.md`, `IDENTIFIER_STANDARD.md`)가 최종 권위를 가진다. 이 문서와 상위 문서가 충돌하면 상위 문서가 우선한다.

---

## 0. 문서의 지위

- Tier C, Production 문서 로드맵의 1번 문서.
- Tier A가 정의한 **논리적 엔터티**(Concept/Grammar Node/Relation/Content/Progress/Vocabulary)를 **물리적 테이블**로 변환하는 것이 유일한 목적이다. Tier A의 필드 정의 자체를 바꾸지 않는다.
- 게스트 인증·OAuth 전환의 **API 흐름**(로그인 엔드포인트, 토큰 발급 절차)은 이 문서의 범위가 아니다 — 그건 `API_LAYER_BRIEF.md`(3번 문서)가 다룬다. 이 문서는 그 흐름이 최종적으로 무엇을 저장하는지(`users` 테이블 구조)만 정의한다.

---

## 1. 전제 — 이 문서가 반영하는 결정

| 결정 | 내용 |
|---|---|
| 실행 환경 | 서버 + DB (`PRODUCTION_ARCHITECTURE_OVERVIEW.md` 결정 1) |
| DB 종류 | PostgreSQL + JSONB |
| User 최소 필드 | `user_id`, `auth_identifier`, `created_at`, `timezone`, `display_name`(선택). `target_language`는 보류(향후 Enrollment 엔터티 검토) |
| 인증 방식 | 게스트 시작 → OAuth 우선 전환, 이메일/비밀번호는 보조 |

---

## 2. 기술 선택 원칙 — PostgreSQL + JSONB

**기준**: 자주 조건절에 쓰이고(WHERE·JOIN·정렬) 타입이 고정적인 필드는 **컬럼**으로, 구조가 항목마다 달라지거나 배열인 필드는 **JSONB**로 둔다.

| 컬럼화 (정형) | JSONB화 (반정형/배열) |
|---|---|
| `state`, `next_review_at`, `difficulty`, `language`, `relation_type` 등 — 필터·정렬·인덱스 대상 | `surface_forms`(배열), `media_assets`(배열), `concept_ids`(배열), `grammar_node_ids`(배열), 타입별 전용 메타데이터(`answer_key`, `speaker_roles` 등) |

이 기준은 "모든 데이터는 JSON 기반으로 설계한다"는 원칙과 "Progress의 배치 조회(`get_due_reviews`)가 빨라야 한다"는 실용적 요구를 동시에 만족시킨다 — JSONB 컬럼도 결국 JSON이므로 전자를 지키면서, 정형 컬럼에는 B-tree 인덱스를 걸어 후자를 지킨다.

---

## 3. 스키마 설계

### 3.1 `users` (Production 신설 — Tier A에는 정의된 적 없는 엔터티)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `user_id` | UUID, PK | 모든 Progress/Content 참조의 기준 식별자 |
| `auth_provider` | ENUM(`GUEST`, `EMAIL`, `OAUTH_GOOGLE`, ...) | |
| `auth_identifier` | TEXT | 게스트 상태에서는 디바이스 토큰, 전환 후에는 이메일/OAuth subject ID로 **교체** |
| `display_name` | TEXT, NULL 허용 | 실명 아님, UI 표시용 |
| `timezone` | TEXT (IANA) | LEARNING_PROTOCOL의 "오늘/이번 주" 판단 기준 |
| `created_at` | TIMESTAMPTZ | |
| `converted_at` | TIMESTAMPTZ, NULL 허용 | 게스트→계정 전환 시각. NULL이면 아직 게스트 |

`target_language`는 넣지 않는다(§1 보류 결정 반영).

### 3.2 `concepts`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `concept_id` | TEXT, PK | 예: `CONCEPT_TENSE_PAST` |
| `category` | TEXT | 10개 Category 중 하나(PRAGMATICS 포함) |
| `function` | TEXT | Category 내 세부 기능 |
| `difficulty` | SMALLINT | 1(가장 단순)~5(가장 복잡), 개념적 복잡도 기준(CONCEPT_SCHEMA §5) — Grammar Node의 언어별 구현 난이도와는 다른 축이므로 혼동 저장 금지 |
| `prerequisite_concept_ids` | JSONB(배열, concept_id) | Concept 레벨 선행 관계(CONCEPT_SCHEMA §6). Grammar Node 레벨 prerequisite(`grammar_relations`)와는 별개 층위이며, 정합성(상위가 요구하는 순서를 하위가 어기지 않는지)은 검증 로직에서 확인 |
| `relationships` | JSONB(배열, `{target_concept_id, relationship_type}`) | `relationship_type ∈ {RELATED, CONTRAST, SUBSUMPTION}`(CONCEPT_SCHEMA §7). Review Engine의 Interleaving 대상 선정 근거로 쓰인다 |

### 3.3 `grammar_nodes`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `node_id` | TEXT, PK | 예: `GRAMMAR_VI_DA` (semantic slug, IDENTIFIER_STANDARD) |
| `language` | TEXT | Language Pack 코드(VI/EN/JA/ZH) |
| `concept_ids` | JSONB(배열) | 다대다 참조 |
| `label` | TEXT | |
| `surface_forms` | JSONB(배열) | |
| `difficulty` | SMALLINT | |

### 3.4 `grammar_relations`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `relation_id` | TEXT, PK | |
| `from_node_id` | TEXT, FK → `grammar_nodes` | |
| `to_node_id` | TEXT, FK → `grammar_nodes` | |
| `relation_type` | ENUM(`PREREQUISITE`, `RELATED`, `CONTRAST`, `ALTERNATIVE`) | |
| `direction` | ENUM(`UNIDIRECTIONAL`, `BIDIRECTIONAL`) | `PREREQUISITE`는 항상 `UNIDIRECTIONAL`(VI_LANGUAGE_PACK §9 금지 사항) |
| `weight` | NUMERIC | |
| `description` | TEXT | |

### 3.5 `content`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `content_id` | TEXT, PK | |
| `grammar_node_ids` | JSONB(배열, 최소 1개) | |
| `content_type` | ENUM(10종: `EXPLANATION`/`EXAMPLE`/`QUIZ`/`MINIMAL_PAIR`/`DIALOGUE`/`LISTENING`/`SHADOWING`/`CONVERSATION_SEED`/`TRANSFER_EXERCISE`/`ERROR_PATTERN`) | |
| `media_assets` | JSONB(배열, `{media_format, asset_ref, role}`) | |
| `source` | ENUM(`HUMAN_AUTHORED`, `AI_GENERATED`) | |
| `human_reviewed` | BOOLEAN | |
| `is_canonical` | BOOLEAN | 같은 (노드, content_type) 조합에서 최대 1개(CONTENT_SCHEMA §9) |
| `difficulty` | SMALLINT | |
| `meta_language` | TEXT | |
| **`explanation_level`** | **TEXT, NULL 허용** | **`content_type=EXPLANATION`이면 NOT NULL(애플리케이션 레벨 검증), 나머지 9종은 NULL. 확인된 값: `BEGINNER`(기존 Tier D 255개 콘텐츠 전부). 전체 허용값 목록은 `CONTENT_SCHEMA.md` 원문 확인 필요 — 미확인 상태라 ENUM 대신 TEXT로 유연성 확보(AC-004). `get_content`(`API_CONTRACT.md` §7.1)의 기존 필터 조건이 이 컬럼을 대상으로 한다** |
| `version` | INTEGER | ID는 불변, 개정마다 증가(CONTENT_SCHEMA §8) |
| `author` | TEXT | |
| `created_at` | TIMESTAMPTZ | AI Generation Engine이 "최근 생성된 예문"을 조회해 표층 변주 프롬프트에 활용하는 데 필요(AI_INTEGRATION_BRIEF §2) |
| `is_active` | BOOLEAN, 기본값 true | `CONTENT_PRODUCTION_STANDARD.md`(Tier D)의 Content Lifecycle — Deprecated 콘텐츠는 삭제 대신 이 값을 false로 바꿔 비활성화한다. 모든 콘텐츠 조회 쿼리(`get_content` 등)는 반드시 `is_active = true` 조건을 포함해야 한다 |
| `type_specific_metadata` | JSONB, NULL 허용 | `answer_key`(QUIZ), `speaker_roles`(DIALOGUE), **`error_attributed_node_id`(TEXT, nullable — SELF/TRANSFER 진단용, 채점 가능한 content_type에 선택적. `DOMAIN_LOGIC_BRIEF.md` §5.1 AC-011)** 등 타입 전용 필드. 별도 컬럼으로 만들지 않는 이유는 §2 참고(정정 — 기존 "§6"은 오기, `explanation_level`은 반대로 §2 기준에 따라 전용 컬럼으로 분리했다, AC-004) |

### 3.6 `progress` + `attempt_records`

**설계 판단**: PROGRESS_SCHEMA.md는 State·Confidence·Attempt History를 하나의 **논리적** SSOT로 정의하지만, 물리적 저장까지 한 테이블에 몰아넣을지는 이 문서(HOW)의 판단이다. Attempt는 시간이 지날수록 계속 누적되는 이력 데이터라, `progress`(현재 상태 1행) + `attempt_records`(이력 N행)로 분리한다 — JSONB 배열에 무한히 append하면 행이 비대해지고 조회 성능이 떨어지기 때문이다.

**Tier A의 `recent_attempts`(최근 N개 제한 배열) vs 전체 이력 저장소 이원화와의 관계**: Tier A는 JSON 기반 소규모 저장을 전제로 "확신도 계산용 최근 N개는 Progress에, 전체 이력은 별도 분석 저장소에"로 나눌 것을 제안했다. 관계형 DB에서는 이 두 요구를 `attempt_records` 테이블 하나로 만족한다 — 확신도 계산은 `ORDER BY attempted_at DESC LIMIT N` 쿼리로 최근 구간만 읽고, 전체 이력 조회·분석은 같은 테이블을 그대로 쓴다. 별도 저장소를 두는 것은 이 규모에서 과설계다.

**`progress`** (PK: `(user_id, node_id)` — PROGRESS_SCHEMA §2가 명시한 복합 키)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `user_id` | UUID, FK → `users` | |
| `node_id` | TEXT, FK → `grammar_nodes` | |
| `state` | ENUM(`NOT_INTRODUCED`/`INTRODUCED`/`STUDYING`/`PRACTICING`/`MASTERED`/`AUTOMATIC`) | 퇴행 가능 — "최고 도달 상태"가 아니라 "현재 상태"로 취급(LEARNING_THEORY) |
| `accuracy` | NUMERIC(0.0~1.0) | 누적 정답 비율. 단독으로 `state` 전이를 결정하지 않음 |
| `avg_response_time_ms` | NUMERIC | 난이도로 정규화된 값, Automatic 판정의 핵심 근거 |
| `confidence_inferred` | NUMERIC | 행동 기반 추론, 매 시도마다 갱신되는 rolling 값 |
| `confidence_self_reported` | NUMERIC, NULL 허용 | |
| `confidence_calibration_delta` | NUMERIC, NULL 허용 | `confidence_self_reported − confidence_inferred`. `confidence_self_reported`가 NULL이면 이 값도 반드시 NULL(근거 없는 보정값 금지) |
| `next_review_at` | TIMESTAMPTZ, NULL 허용 | |
| `explicit_study_event_at` | TIMESTAMPTZ, NULL 허용 | 이 값이 없으면 `state`는 `INTRODUCED` 이상이 될 수 없음(게이팅 원칙) |
| **`mastered_at`** | **TIMESTAMPTZ, NULL 허용** | **현재 연속 `MASTERED` 구간의 시작 시점. `state`가 정확히 `MASTERED`가 되는 모든 전이(승격이든 퇴행 후 재진입이든 방향 무관)에서 `now()`로 갱신. `MASTERED` 아래로 퇴행해도 값을 삭제하지 않고, 다음 `MASTERED` 진입 시 덮어씀. `MASTERED → AUTOMATIC` 판정의 경계 기준(`DOMAIN_LOGIC_BRIEF.md` §3.2.2, AUD-002, Frozen Core Standard Amendment — `PROGRESS_SCHEMA.md` §3 원 정의를 물리 컬럼으로 반영)** |
| `updated_at` | TIMESTAMPTZ | |

**`attempt_records`** (PK: `attempt_id`, FK: `(user_id, node_id)` → `progress`)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `attempt_id` | UUID, PK | |
| `user_id` | UUID | |
| `node_id` | TEXT | |
| **`content_id`** | **TEXT, FK → `content`** | **사용자가 실제로 푼 Content 레코드. `SELF`/`TRANSFER` 원인 분류(`DOMAIN_LOGIC_BRIEF.md` §5.1)가 이 레코드의 `type_specific_metadata`를 조회하는 근거(AC-008)** |
| `attempted_at` | TIMESTAMPTZ | |
| `is_correct` | BOOLEAN | Tier A 명칭 그대로(v1.1에서는 `result` ENUM으로 잘못 표기했던 것을 정정) |
| `response_time_ms` | INTEGER, NULL 허용 | 난이도 정규화는 애플리케이션 계층에서 수행 |
| `correction_count` | INTEGER | 시도 중 정정 횟수 |
| `hint_used` | BOOLEAN | |
| `preceding_streak` | INTEGER | 이 시도 직전까지의 연속 정답 수 |
| **`is_spaced_review`** | **BOOLEAN** | **이 시도의 `attempted_at`이, 시도 직전 `progress.next_review_at`(갱신 전 값) 이후였는지. 시도 처리 시점에 즉시 계산·고정(사후 재구성 불가 — `next_review_at`은 현재 예정 시점 하나만 보유하며 과거 attempt 처리 직전의 값을 이력으로 보존하지 않으므로). `MASTERED`·`AUTOMATIC` 승격 판정의 근거(`DOMAIN_LOGIC_BRIEF.md` §3.2.1·§3.2.2, AUD-002, Frozen Core Standard Amendment — `PROGRESS_SCHEMA.md` §4 원 정의를 물리 컬럼으로 반영)** |
| `error_category` | ENUM(`SELF`, `TRANSFER`, NULL) | `is_correct = true`면 반드시 NULL |
| `error_subcategory` | TEXT, NULL 허용 | 예약 필드, 현재 항상 NULL(GRAMMAR_SCHEMA v1.3) |

### 3.7 `vocabulary`

**범위 재확인(VOCABULARY_SCHEMA §0~1)**: 이 테이블은 사전이 아니다. Grammar 규칙으로 예측 가능한 형태(`work→worked`)는 저장하지 않는다 — Lemma와 대응 Grammar Node 규칙만으로 언제든 계산 가능하기 때문이다(§4의 "저장하지 않는 것들"과 동일한 원칙). 오직 ① 열린 어휘 집합에서의 선택, ② 규칙으로 설명 안 되는 예외(Irregular Surface Form)만 행으로 존재한다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `vocab_id` | TEXT, PK | 예: `VOCAB_EN_GO` |
| `lemma` | TEXT | 기본형(예: "go") |
| `language` | TEXT | |
| `pos` | ENUM(11종: `NOUN`/`VERB`/`ADJECTIVE`/`ADVERB`/`PRONOUN`/`PREPOSITION`/`CONJUNCTION`/`DETERMINER`/`INTERJECTION`/`CLASSIFIER`/`NUMERAL`) | |
| `canonical_gloss` | TEXT | 최소 의미 힌트 1개(상세 설명은 Content의 몫, VOCABULARY_SCHEMA §6) |
| `irregular_surface_forms` | JSONB(배열, `{surface_form, realizes_grammar_node_id}`) | `realizes_grammar_node_id`는 `grammar_nodes.node_id` 참조(애플리케이션 레벨 FK — VOCABULARY_SCHEMA §7 단방향 원칙, Vocabulary→Grammar Node만 참조하고 역방향 저장 없음) |
| `features` | JSONB, NULL 허용 | 예약 필드(가산/불가산, 격식 등), Controlled Open, 현재 로직 미사용(§8) |
| `pronunciation_ref` | TEXT, NULL 허용 | 예약 필드 |
| `phonetic_ref` | TEXT, NULL 허용 | 예약 필드 |

**애플리케이션 레벨 제약(DB 제약으로 표현 불가, `DOMAIN_LOGIC_BRIEF.md`에서 실제 검증 로직으로 구현)**: `irregular_surface_forms`에 등록하려는 형태가 대응 Grammar Node의 규칙을 그대로 적용한 결과와 같다면 저장을 거부한다(VOCABULARY_SCHEMA §10 Validation — 예: `work+‑ed=worked`는 금지, `go→went`는 허용). SQL 제약으로 표현할 수 없는 규칙이므로 스키마가 아니라 애플리케이션 검증 계층의 책임으로 명시해둔다.

### 3.8 `cascade_jobs` (Production 신설 — `API_LAYER_BRIEF.md` 트랜잭션 경계 결정에서 발견된 요구사항)

Review Cascade의 부가 효과(선행 노드들의 `next_review_at` 앞당김)를 재시도 가능한 형태로 분리하기 위한 아웃박스 테이블(`API_LAYER_BRIEF.md` §5.2). 핵심 트랜잭션(attempt 삽입+state 전이+자기 노드 `next_review_at` 갱신)과 같은 트랜잭션에 삽입되어야 "일이 일어났다는 사실"이 유실되지 않는다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `job_id` | UUID, PK | |
| `user_id` | UUID, FK → `users` | |
| `target_node_id` | TEXT, FK → `grammar_nodes` | `next_review_at`을 앞당겨야 할 선행 노드 |
| `status` | ENUM(`PENDING`, `DONE`, `FAILED`) | |
| `created_at` | TIMESTAMPTZ | |
| `processed_at` | TIMESTAMPTZ, NULL 허용 | |
| `retry_count` | INTEGER, 기본값 0 | |

**인덱스**: B-tree `cascade_jobs(status, created_at)` — 워커가 `status='PENDING'`인 행을 오래된 순으로 폴링하는 데 사용.

---

## 4. 저장하지 않는 것들 (계산값)

이 프로젝트는 지금까지 "계산 가능한 것은 저장하지 않는다"는 원칙을 일관되게 지켜왔다(State-Colored Graph, Coverage/Depth, Derived Metrics, Review Queue 모두 동일). 이 원칙을 물리 스키마에도 그대로 적용한다 — 아래 항목은 **테이블을 만들지 않는다.**

| 항목 | 계산 방법 |
|---|---|
| Concept Mastery(Coverage × Depth) | `progress` ⋈ `grammar_nodes.concept_ids` 런타임 조인·집계 |
| Retention / Transfer Score / Automation Score / Confidence Trend | `attempt_records` + `progress` 이력 기반 런타임 계산 |
| Review Queue(`get_due_reviews`) | `progress.next_review_at` 기준 런타임 조회(§5) |

---

## 5. 인덱스·쿼리 패턴

대표 API `get_due_reviews`(입력: `user_id`, `language`, `now`, `limit?`, `concept_id?`, `state_filter?`)를 기준으로 필요한 인덱스를 정의한다.

| 인덱스 | 대상 | 이유 |
|---|---|---|
| B-tree | `progress(user_id, next_review_at)` | "이 사용자의 기한 도래 노드"를 정렬된 상태로 빠르게 조회 |
| B-tree | `grammar_nodes(language)` | 언어별 필터 |
| GIN | `grammar_nodes(concept_ids)` | `concept_id` 필터 시 배열 포함 여부(containment) 검색 |
| B-tree | `attempt_records(user_id, node_id, attempted_at)` | 최근 시도 이력 조회 |
| B-tree | `cascade_jobs(status, created_at)` | 워커가 `PENDING` 작업을 오래된 순으로 폴링 |

---

## 6. 게스트 → 계정 전환

**핵심 설계 판단**: `user_id`(PK)는 전환 전후로 **절대 바뀌지 않는다.** 전환은 `users` 테이블의 `auth_provider`/`auth_identifier`/`converted_at` 세 필드를 갱신하는 것으로 끝난다.

**따름 정리**: `progress`·`attempt_records`·`content` 등 어디에도 `user_id`를 참조하는 다른 테이블은 전환 시 **아무것도 이관할 필요가 없다.** 게스트 단계에서 쌓인 학습 데이터가 그대로 계정에 연속된다 — 별도의 데이터 마이그레이션 로직이 필요 없다는 뜻이며, 이는 단순성 원칙에 부합하는 결과다.

전환 시점에 디바이스 토큰(`auth_identifier`의 게스트 값)을 어떻게 무효화하고 새 자격증명 발급 흐름을 태우는지는 인증 API의 문제이므로 `API_LAYER_BRIEF.md`에서 다룬다.

---

## 7. 확인 완료 기록

v1.0에서 미확정으로 남겼던 두 항목을 `CONCEPT_SCHEMA.md`·`VOCABULARY_SCHEMA.md` 원본 검토 후 확정했다.

1. **`vocabulary` 테이블(§3.7)**: VOCABULARY_SCHEMA.md 전체 구조 확인 완료. `pos` 11종, `irregular_surface_forms` 배열 구조, `features`/`pronunciation_ref`/`phonetic_ref` 3개 예약 필드, 규칙형 중복 저장 금지 Validation까지 반영.
2. **`concepts.relationships`(§3.2)**: CONCEPT_SCHEMA.md §7 확인 완료. `RELATED`/`CONTRAST`/`SUBSUMPTION` 3종 관계 타입임을 확정했고, 이와 별개로 §6의 Concept 레벨 `prerequisite_concept_ids`가 이미 분리되어 있음도 함께 반영했다.

이제 미확정 항목 없이 이 문서는 확정 상태다.

---

## 8. 다음 단계

2번 문서 `DOMAIN_LOGIC_BRIEF.md`로 진행한다 — 이 스키마 위에서 Grammar Graph 탐색, Review Cascade, State 전이, Confidence 계산을 실제로 어떻게 수행하는지 정의한다.

---

## 9. Empirical Evidence Persistence Boundary
### 9.1 문서 지위와 상위 계약

이 장은 `VI_EMPIRICAL_EVIDENCE_CONTRACT.md`와 `VI_EMPIRICAL_PILOT_SPEC.md`가 정의한 empirical evidence authority를 PostgreSQL persistence boundary로 옮기기 위한 Tier C 계약이다.

이 장은 다음 Tier A 및 production 의미를 변경하지 않는다.

* Grammar Progress는 Grammar learner state의 유일한 SSOT다.
* Production `progress`는 현재 Grammar state와 production scheduling을 소유한다.
* Production `attempt_records`는 Progress 갱신에 사용되는 node-level production attempt history다.
* Production `next_review_at`은 production Review Scheduling의 결과다.
* Existing Content authority와 Content version 의미는 변경하지 않는다.
* Existing 8개 Engine 책임과 호출 계층은 변경하지 않는다.

Empirical evidence는 별도 logical authority다. Empirical row가 존재한다는 이유로 Progress state, production attempt 또는 production scheduling이 변경되지 않는다.

### 9.2 Authority separation

다음 persistence authority를 구분한다.

| Authority                      | 소유 의미                                                                  | 다른 authority를 변경할 수 있는가                          |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Grammar Progress authority     | 현재 Grammar learner state, confidence, production review schedule       | Evidence가 직접 변경할 수 없음                            |
| Production attempt authority   | Progress 갱신을 위한 node-level production attempt history                  | Evidence attempt로 재해석 금지                         |
| Content authority              | Canonical 또는 generated Content와 version                                | Evidence가 Content를 수정하지 않음                       |
| Empirical evidence authority   | Pilot assignment, session, logical response, evaluation 및 raw evidence | Progress·production attempt·Content를 직접 수정할 수 없음 |
| Derived projection authority   | 없음. Raw evidence에서 재생성되는 분석 결과                                         | Learner state 또는 raw fact를 변경할 수 없음              |
| Pseudonymous mapping authority | Participant ID와 재식별 정보의 별도 owner-controlled mapping                    | Evidence raw surface 외부                          |

Empirical evidence는 기존 `attempt_records`의 additive field group으로 구현하지 않는다.

그 이유는 다음과 같다.

1. Production attempt의 grain은 사용자×Grammar Node의 Progress update다.
2. Empirical attempt의 grain은 enrollment×assignment×logical learner response다.
3. 하나의 empirical attempt가 여러 target-node evaluation을 가질 수 있다.
4. Empirical attempt에는 assignment, session, retry, timing, modality 및 item-family lineage가 필요하다.
5. Production `correction_count`와 empirical correction aggregate는 동일한 의미가 아니다.

### 9.3 Core logical aggregates

P0 persistence surface는 다음 logical aggregate를 가져야 한다.

#### 9.3.1 Experiment and experiment version

Experiment는 research protocol family의 stable identity다.

Experiment version은 assignment, condition, metric 또는 protocol 의미가 달라질 때 발행되는 immutable version이다.

Published experiment version은 수정하지 않는다. 변경은 새 version으로 발행한다.

#### 9.3.2 Condition and condition version

Condition은 practice와 scheduling protocol의 stable identity다.

Condition version은 실제 assignment가 사용한 condition 의미를 고정한다.

Published condition version은 수정하지 않는다.

Engineering baseline, primary efficacy control 및 experimental condition은 condition identity/version으로 구분한다.

#### 9.3.3 Pseudonymous participant

Pseudonymous participant는 direct PII를 포함하지 않는 pilot identity다.

Evidence raw surface에는 다음을 저장하지 않는다.

* 실명
* 이메일
* 전화번호
* 직접 연락 정보
* provider credential
* 재식별 secret

Participant ID와 실제 사람을 연결하는 mapping은 이 evidence persistence boundary 외부의 owner-controlled authority다.

물리적으로 별도 datastore를 사용할지, 동일 database 내 별도 schema·role·access boundary를 사용할지는 Privacy/Operations owner decision과 implementation HOW다. Architecture invariant는 authority와 access boundary의 분리다.

#### 9.3.4 Enrollment

Enrollment는 다음 관계를 소유한다.

* pseudonymous participant
* experiment version
* condition version
* enrollment lifecycle
* created timestamp

Assignment, session 및 attempt는 enrollment ownership을 벗어날 수 없다.

#### 9.3.5 Assignment

Assignment는 `LEARNING`, `REVIEW`, `ASSESSMENT` 중 하나의 type을 가진 authoritative pilot fact다.

Pilot review는 별도 competing review authority가 아니라 `assignment_type = REVIEW`인 assignment subtype이다.

Assignment는 다음을 소유한다.

* enrollment
* assignment type
* immutable version snapshot
* target timepoint
* anchor reference와 anchor timestamp
* due timestamp
* completion reference와 timestamp
* terminal outcome
* reschedule/supersede lineage
* created timestamp

Production `next_review_at`과 `get_due_reviews` 결과는 pilot assignment가 아니다.

#### 9.3.6 Assignment-owned immutable snapshot

Assignment snapshot의 logical owner는 assignment다.

Assignment identity와 snapshot은 같은 transaction에서 생성한다. Assignment가 존재하지만 snapshot이 없거나 snapshot이 일부만 저장된 상태를 허용하지 않는다.

Snapshot은 최소한 다음 resolved references를 보존한다.

* experiment ID와 version
* condition ID와 version
* target Grammar Node ID 목록
* item ID와 version
* Content ID와 version, applicable한 경우
* scenario ID
* item-family ID
* lexical manifest ID와 version
* rubric version
* formula version
* scheduler/protocol version
* planned stimulus modality components
* planned response modality components

Caller는 assignment type intent와 selection reference만 요청할 수 있다.

Caller가 authoritative snapshot bundle을 임의로 구성해 전달할 수 없다.

Server-side assignment boundary가 authoritative version sources를 resolve하고 validation한 뒤 snapshot을 조립한다.

다음은 금지한다.

* Client-provided snapshot을 검증 없이 저장
* 과거 assignment를 latest version으로 재해석
* Published assignment snapshot 수정
* Reschedule 시 기존 assignment snapshot 수정
* Snapshot 일부만 갱신

Reschedule은 새 assignment identity와 새 snapshot을 발행한다.

Snapshot을 assignment 내부 embedded representation으로 저장할지 one-to-one immutable relation으로 저장할지는 implementation HOW다. 어느 방식을 선택해도 assignment ownership, same-transaction creation, immutability 및 historical reconstruction을 만족해야 한다.

#### 9.3.7 Session

Session은 최소 durable activity boundary다.

Session은 다음을 소유한다.

* session identity
* enrollment ownership
* started server timestamp
* ended server timestamp
* terminal outcome
* technical-failure reference
* restarted-from lineage

Terminal session은 resume하지 않는다.

Restart는 새 session identity를 발행한다.

Nonterminal interruption의 same-session resume는 이 P0 persistence contract가 요구하지 않는다.

Full transition event-sourcing은 요구하지 않는다.

#### 9.3.8 Assessment attempt

Assessment attempt는 하나의 logical learner response를 나타내는 stable root다.

하나의 logical response에는 하나의 authoritative attempt root만 존재한다.

Attempt는 다음을 소유한다.

* assignment ownership
* session ownership
* attempt-series identity
* retry parent와 retry ordinal
* idempotency identity
* started server timestamp
* input-enabled monotonic timing
* first-valid-activity monotonic timing
* submitted monotonic timing
* server-received timestamp
* reported client monotonic duration
* clock-quality classification
* actual stimulus modality
* actual response modality
* final-response reference
* scorable·unscorable·technical-invalid outcome
* instrumentation version
* created timestamp

Production `attempt_records`는 이 attempt root가 아니다.

#### 9.3.9 Attempt retry series

Attempt retry series는 pedagogical retry lineage를 묶는 logical identity다.

별도 physical entity로 구현할지는 implementation HOW다.

다음 invariant를 만족해야 한다.

* Series는 하나의 assignment를 벗어나지 않는다.
* Parent와 child attempt는 같은 enrollment·assignment에 속한다.
* Retry는 새 attempt identity를 가진다.
* Retry ordinal은 series 안에서 중복될 수 없다.
* Retry parent lineage는 cycle을 가질 수 없다.
* Network retransmission은 retry lineage를 만들지 않는다.

#### 9.3.10 Target-node evaluation

Target-node evaluation은 attempt와 Grammar Node 사이의 authoritative evaluation bridge다.

Evaluation은 다음을 소유한다.

* evaluation identity
* parent attempt
* target Grammar Node
* rubric version
* rubric outcome
* binary correctness, applicable한 경우
* scorable 여부
* evaluation source
* created timestamp

Attempt 하나가 여러 target-node evaluation을 가질 수 있다.

Evaluation은 다른 participant, enrollment, assignment 또는 attempt에 연결될 수 없다.

#### 9.3.11 Correction aggregate

Correction aggregate는 attempt-owned empirical raw fact다.

최소 dimension:

* initiator: learner 또는 system
* feedback phase: pre-feedback 또는 post-feedback
* outcome: successful, unsuccessful 또는 unknown
* nonnegative count

Empirical correction aggregate가 pilot analysis authority다.

Production `attempt_records.correction_count`는 compatibility projection이 필요할 때만 별도 formula/version을 통해 계산할 수 있다. 두 값을 동일 authority로 취급하지 않는다.

#### 9.3.12 Generic observation extension point

Generic observation은 extension point only다.

P0 core persistence에는 generic observation storage를 요구하지 않는다.

향후 활성화 시 observation은 최소한 다음을 가져야 한다.

* stable observation identity
* typed parent reference
* observation type
* payload schema version
* source
* occurred timing
* typed payload 또는 payload reference
* created server timestamp

Unversioned arbitrary JSON payload를 empirical authority로 저장하지 않는다.

Generic observation을 활성화하는 문서 patch 전에는 다음을 P0 core로 구현하지 않는다.

* utterance segment
* detailed correction event
* AI audit event
* acoustic feature
* arbitrary event catalog

#### 9.3.13 Human rating and adjudication

Human rating과 adjudication은 P0 core에서 제외되지만 persistence extension으로 예약한다.

Original rating은 immutable하다.

각 independent rating은 별도 append-only fact다.

Adjudication은 original rating을 덮어쓰지 않고 별도 fact로 생성한다.

Agreement 계산은 adjudication 전 original rating을 사용한다.

#### 9.3.14 Actual-provider and learner exposure

Generation run, validator run 및 learner exposure는 actual-provider milestone로 연기한다.

External provider call 전체를 database transaction으로 감싸지 않는다.

Accepted Content version과 learner exposure linkage를 활성화할 때는 다음을 하나의 transaction으로 처리한다.

* Accepted Content version 존재성 확인
* Assignment·session ownership 확인
* Exposure identity 발행
* Accepted Content version linkage
* Assignment 또는 attempt correlation linkage

Provider call, retry 또는 generation 자체는 위 transaction 외부의 단계별 raw fact다.

#### 9.3.15 Audio observation

Audio observation은 audio milestone로 연기한다.

Owner 승인 전 raw audio 기본값은 미수집이다.

P0에는 다음을 저장하지 않는다.

* raw audio
* VAD
* pause segment
* acoustic feature
* pronunciation score
* tone score
* speaking repair taxonomy

### 9.4 Identity and idempotency

#### 9.4.1 Minimum uniqueness scope

Attempt creation의 최소 idempotency uniqueness scope는 다음이다.

```text
assignment_id + idempotency_identity
```

#### 9.4.2 Normalized payload equivalence

동일 idempotency key의 payload equivalence는 implementation hash algorithm이 아니라 normalized semantic fields로 판단한다.

최소 비교 범주:

* operation category
* assignment reference
* session reference, applicable한 경우
* attempt reference, finalization인 경우
* requested item/content/scenario/family references
* retry intent
* retry parent reference
* learner action category
* response value 또는 immutable response reference
* client monotonic timing facts
* instrumentation version
* observed stimulus modality
* observed response modality
* caller-supplied completion intent

다음은 caller payload equivalence 비교에서 제외한다.

* server-issued IDs
* server timestamps
* server-resolved snapshot
* clock-quality classification
* server-derived evaluation
* server-derived lifecycle outcome
* created timestamp
* materialized metric

Payload canonicalization 또는 digest algorithm은 implementation HOW다.

#### 9.4.3 Replay rules

* Same assignment, same idempotency identity, same normalized payload는 기존 authoritative result를 반환한다.
* Same assignment, same idempotency identity, different normalized payload는 `CONTRACT_VIOLATION`이다.
* Network retransmission은 새 attempt를 생성하지 않는다.
* Network retransmission은 retry ordinal을 증가시키지 않는다.
* Pedagogical retry는 새 idempotency identity를 사용한다.
* Pedagogical retry는 새 attempt identity를 사용한다.
* Pedagogical retry는 같은 attempt series를 유지한다.
* Pedagogical retry는 새 retry ordinal을 가진다.
* Pedagogical retry는 retry parent linkage를 가진다.
* Duplicate와 retry를 하나의 boolean flag로 추정하지 않는다.

#### 9.4.4 Attempt-finalization retry

Attempt finalization이 transport 또는 transaction failure로 재시도되는 경우:

* 같은 attempt identity를 사용한다.
* 같은 finalization idempotency identity를 사용한다.
* 같은 normalized finalization payload를 사용한다.
* 새 pedagogical attempt를 만들지 않는다.
* Production action을 자동 재실행하지 않는다.

### 9.5 Transaction boundaries

#### 9.5.1 Assignment creation

다음을 하나의 transaction으로 처리한다.

* assignment identity 발행
* enrollment ownership validation
* authoritative version resolution
* immutable snapshot 생성
* initial assignment lifecycle fact 생성

어느 단계든 실패하면 assignment와 snapshot 모두 존재하지 않아야 한다.

#### 9.5.2 Session start

다음을 하나의 transaction으로 처리한다.

* session identity 발행
* enrollment ownership validation
* started server timestamp 기록
* initial nonterminal lifecycle 생성

Session start는 Progress 또는 production Review Scheduling을 변경하지 않는다.

#### 9.5.3 Attempt open

다음을 하나의 transaction으로 처리한다.

* assignment·session ownership validation
* assignment lifecycle validation
* idempotency key registration
* duplicate replay validation
* attempt identity 발행
* attempt-series and retry lineage 생성
* started server timestamp 기록

Idempotency registration만 존재하고 attempt가 없는 상태 또는 attempt만 존재하고 idempotency registration이 없는 상태를 허용하지 않는다.

#### 9.5.4 Attempt finalization

다음을 하나의 transaction으로 처리한다.

* final response 또는 immutable response reference
* finalized client monotonic timing facts
* server-received/finalized timestamps
* clock-quality and technical-validity classification
* correction aggregate
* synchronous target-node evaluations
* attempt terminal outcome
* 해당 attempt가 assignment completion 조건을 충족하는 경우 assignment completion reference, timestamp 및 terminal outcome

어느 단계든 실패하면 final response, correction, evaluation, attempt terminalization 및 assignment completion이 부분적으로 남지 않아야 한다.

Attempt finalization은 Progress 또는 production `attempt_records`를 수정하지 않는다.

#### 9.5.5 Technical-failure terminalization

하나의 terminalization command가 attempt, assignment 또는 session 중 둘 이상을 terminalize하면 해당 command가 변경하는 terminal facts를 하나의 transaction으로 처리한다.

Technical failure는 learner incorrect로 변환하지 않는다.

Technical failure는 normal empty 또는 missing으로 변환하지 않는다.

#### 9.5.6 Reschedule and supersede

다음을 하나의 transaction으로 처리한다.

* 기존 assignment eligibility validation
* 새 assignment identity 발행
* 새 immutable snapshot 생성
* 새 assignment의 `rescheduled_from` lineage
* 기존 assignment의 `superseded_by` lineage
* 기존 assignment terminal/superseded lifecycle
* 새 assignment initial lifecycle

기존 assignment의 due timestamp 또는 snapshot을 수정해 reschedule을 표현하지 않는다.

#### 9.5.7 Session restart

다음을 하나의 transaction으로 처리한다.

* Restart target session 존재성·ownership 확인
* Target session이 terminal인지 확인
* 새 session identity 발행
* 새 session의 `restarted_from` lineage
* 새 started server timestamp 기록

기존 terminal session을 nonterminal로 되돌리지 않는다.

#### 9.5.8 Human rating

각 independent original rating은 별도 append-only transaction으로 생성한다.

한 rater의 rating 실패가 다른 rater의 original rating을 rollback하지 않는다.

#### 9.5.9 Adjudication

Adjudication은 required original ratings가 존재한 뒤 별도 transaction으로 생성한다.

Adjudication은 original rating을 수정하거나 삭제하지 않는다.

#### 9.5.10 Accepted Content exposure linkage

Actual-provider milestone에서 활성화할 때 다음을 하나의 transaction으로 처리한다.

* Accepted Content ID/version 존재성
* Assignment·session ownership
* Exposure identity
* Content-version linkage
* Generation-run linkage, applicable한 경우
* Learner exposure timestamp와 outcome

External provider call 자체, provider retry 및 validator call은 이 transaction 안에 넣지 않는다.

### 9.6 Immutability

다음은 immutable하다.

* Published experiment version
* Published condition version
* Assignment snapshot
* Attempt root identity와 ownership
* Attempt retry parent
* Original human rating
* Created raw response reference
* Terminal outcome
* Reschedule/restart/retry lineage once committed

Terminal outcome은 write-once다.

다음은 금지한다.

* Raw fact destructive overwrite
* Published version in-place edit
* Assignment snapshot patch
* Terminal row reopen
* Retry를 기존 attempt 수정으로 표현
* Reschedule을 기존 assignment 수정으로 표현
* Restart를 기존 session 재활성화로 표현
* Original rating을 adjudication result로 덮어쓰기

Correction이 필요한 경우 additive correction provenance를 생성한다.

Correction provenance는 최소한 다음을 식별할 수 있어야 한다.

* Corrected fact reference
* Correction reason
* Correction actor/source
* Correction timestamp
* Replacement 또는 superseding fact reference
* Applicable schema/protocol version

Correction provenance가 원본 raw fact를 삭제하거나 silent overwrite하는 권한을 가지지 않는다.

### 9.7 Lineage

#### 9.7.1 Reschedule lineage

* 새 assignment가 prior assignment reference를 소유한다.
* 기존 assignment가 superseding assignment reference를 소유한다.
* 양방향 linkage는 같은 transaction에서 생성한다.
* 두 assignment는 같은 enrollment에 속해야 한다.
* Assignment lineage cycle을 허용하지 않는다.

#### 9.7.2 Restart lineage

* 새 session이 terminal prior session reference를 소유한다.
* 두 session은 같은 enrollment에 속해야 한다.
* Restart target은 terminal이어야 한다.
* Session lineage cycle을 허용하지 않는다.

#### 9.7.3 Retry lineage

* 새 attempt가 parent attempt reference를 소유한다.
* Parent와 child는 같은 assignment·session ownership 규칙을 충족해야 한다.
* Parent와 child는 같은 enrollment에 속해야 한다.
* Retry ordinal은 series 안에서 유일하다.
* Attempt lineage cycle을 허용하지 않는다.

### 9.8 Raw fact and derived projection separation

P0는 authoritative raw fact를 저장하고 metric을 query-time에 계산할 수 있다.

P0에서 materialized metric persistence를 요구하지 않는다.

Raw fact에서 다음 metric을 rebuild할 수 있어야 한다.

* retention
* unseen transfer
* RT median
* RT CV
* initiation latency
* self-correction
* completion
* dropout
* review debt
* human agreement

Metric eligibility, numerator 및 denominator authority는 `VI_EMPIRICAL_EVIDENCE_CONTRACT.md`와 referenced formula version이다.

Completion, retention, transfer, latency, correction, dropout 및 review debt는 같은 export surface에서 제공할 수 있지만 각각의 aggregation grain과 eligibility를 분리해야 한다.

Materialized projection을 향후 추가할 경우 최소 metadata:

* formula version
* analysis cutoff
* aggregation grain
* numerator
* denominator
* excluded count
* missing count
* technical-failure count
* withdrawn count
* insufficient status
* source/rebuild reference
* generated timestamp

다음 invariant를 유지한다.

1. Materialized metric은 authoritative learner state가 아니다.
2. Materialized metric은 Progress field가 아니다.
3. Materialized metric은 raw fact를 수정하지 않는다.
4. Materialized metric은 formula version 없이 존재할 수 없다.
5. Materialized metric은 source/rebuild reference 없이 authoritative report로 사용하지 않는다.
6. Rebuild 결과가 materialized value와 다르면 raw fact와 formula version이 우선한다.
7. `null`, missing, zero, normal empty 및 technical failure를 하나의 numeric default로 합치지 않는다.
8. Minimum sample 미달은 zero가 아니라 `insufficient`다.

### 9.9 Production non-interference

Empirical evidence persistence는 다음 production surface를 직접 또는 간접으로 변경하지 않는다.

* `progress.state`
* Progress confidence fields
* Production `next_review_at`
* Production `attempt_records`
* Production Review Queue
* Production cascade outbox
* Production scheduler
* Current Interleaving behavior
* Canonical Vocabulary
* Canonical Content version

Empirical write와 production write가 같은 user action에 연결되더라도 두 authority는 별도 transaction을 유지한다.

Evidence transaction을 Progress Engine의 production transaction 안에 삽입하지 않는다.

Evidence failure를 production success로 표시하지 않는다.

Production failure를 evidence success로 표시하지 않는다.

P0는 production/evidence dual-write를 요구하지 않는다.

### 9.10 Migration boundary

Evidence foundation persistence 도입에는 additive migration이 필요하다.

다음은 필요하지 않다.

* Existing `progress` amendment
* Existing `attempt_records` amendment
* Existing production row backfill
* Production table의 pilot discriminator
* Production `next_review_at` migration
* Existing Content row rewrite

Migration 번호, physical table명, column명, SQL type, DDL 및 index는 persistence schema approval 후 결정한다.

Evidence persistence가 비활성인 상태에서 existing production behavior와 regression은 byte-compatible 또는 behavior-compatible하게 유지돼야 한다.

Rollback 시 pilot data를 보존할지 제거할지는 implementation migration contract에서 결정한다. 이 문서는 retention 또는 destructive rollback policy를 선확정하지 않는다.

Evidence migration은 다음 상태를 자동 변경하지 않는다.

* AC-017/AC-018
* AC-018 `CLOSED`·`IMPLEMENTED`
* VL3 §10
* Actual-provider milestone

### 9.11 P0 acceptance requirements

P0는 실제 PostgreSQL 합성 fixture를 사용한다.

P0는 최소한 다음을 검증해야 한다.

* Stable ID uniqueness
* Assignment/snapshot atomicity
* Attempt/idempotency atomicity
* Same-key replay
* Same-key/different-payload rejection
* Duplicate와 pedagogical retry 분리
* Snapshot immutability
* Finalization atomicity
* Outcome mutual exclusivity
* Missing·technical failure·normal empty·null·zero 분리
* Terminal session restart
* Reschedule/supersede lineage
* Lineage cycle rejection
* Orphan evaluation prevention
* Cross-participant ownership rejection
* Content/item/version linkage
* Item-family lineage
* Formula-version rebuildability
* Materialized output non-authority
* Progress non-interference
* Production attempt non-interference
* Production scheduling non-interference
* Existing regression preservation
* Transaction rollback

P0 acceptance의 exact matrix는 coordinated contract의 validation appendix를 따른다.

### 9.12 Explicit non-goals

이 장은 다음을 정의하지 않는다.

* Physical table name
* Physical column name
* SQL type
* SQL constraint syntax
* Migration number
* Index name
* ORM model
* Repository module layout
* Public HTTP endpoint
* Ninth canonical Engine
* Production dual-write implementation
* Actual-provider audit persistence
* Raw audio
* Human-data privacy duration
* Materialized metric table
* Full session event-sourcing

### 9.13 Approval boundary

이 장의 승인은 다음 후속 작업만 허용한다.

* Physical evidence schema drafting
* Additive migration planning
* Internal recorder persistence implementation planning
* P0 PostgreSQL synthetic fixture drafting
* Coordinated API operation implementation planning

이 장의 승인은 다음을 허용하거나 선언하지 않는다.

* Migration implementation
* Production deployment
* Human data collection
* Public API addition
* Production Progress modification
* Production attempt modification
* Actual-provider completion
* Raw audio collection
* AC-018 closure
* VL3 §10 PASS

---

## 10. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — PostgreSQL+JSONB 채택, `users` 신설 스키마, Concept/Grammar Node/Relation/Content/Progress/AttemptRecord 물리 스키마 정의, 계산값 비저장 원칙 재확인, `get_due_reviews` 기준 인덱스 설계, 게스트→계정 전환이 `user_id` 불변으로 인해 데이터 마이그레이션 없이 처리됨을 확정. Vocabulary 스키마는 원본 미확인으로 보류 |
| 1.1 | 2026-07-07 | `CONCEPT_SCHEMA.md`·`VOCABULARY_SCHEMA.md` 원본 확인 후 미확정 항목 해소 — `vocabulary` 테이블 전체 필드 확정(POS 11종, irregular_surface_forms, 예약 필드 3종), `concepts.relationships`를 RELATED/CONTRAST/SUBSUMPTION 3종으로 확정하고 Concept 레벨 prerequisite와의 구분 명시. 규칙형 중복 저장 금지 검증을 애플리케이션 레벨 책임으로 명시. 문서 상태를 확정으로 전환 |
| 1.2 | 2026-07-07 | `DOMAIN_LOGIC_BRIEF.md` 작성 착수 중 Tier A 대조에서 발견한 누락 필드 수정 — `progress`에 `accuracy`·`avg_response_time_ms`·`explicit_study_event_at` 추가, `confidence_calibration`을 `confidence_calibration_delta`로 명칭 정정(자기보고−추론값 차이임을 명시). `attempt_records`에 `correction_count`·`hint_used`·`preceding_streak` 추가(confidence_inferred 계산 입력값 누락 보완), `result` ENUM을 Tier A 명칭인 `is_correct` BOOLEAN으로 정정. 관계형 테이블 하나가 Tier A의 "최근 N개 제한 배열 + 별도 전체 이력 저장소" 이원화 요구를 함께 만족시키는 이유 명시 |
| 1.3 | 2026-07-07 | `API_LAYER_BRIEF.md` 작성 중 발견된 요구사항 반영 — Review Cascade의 비동기 아웃박스 패턴 구현을 위한 `cascade_jobs` 테이블 신설, 관련 인덱스 추가 |
| 1.4 | 2026-07-07 | `AI_INTEGRATION_BRIEF.md` 작성 중 발견 — `content` 테이블에 `created_at`이 없어 "최근 AI 생성 예문" 조회(표층 변주 프롬프트용)가 불가능했던 것을 보완 |
| 1.5 | 2026-07-07 | `CONTENT_PRODUCTION_STANDARD.md`(Tier D) 작성 중 발견 — `human_reviewed`/`is_canonical` 두 boolean 조합만으로는 Content Lifecycle의 Deprecated 상태를 표현할 자리가 없어 `content.is_active` 컬럼 추가 |
| 1.6 | 2026-07-08 | Phase 2 개발 중 발견(AC-008) — `attempt_records`에 `content_id`가 없어 `DOMAIN_LOGIC_BRIEF.md` §5.1이 전제한 SELF/TRANSFER 원인 분류(Content의 `type_specific_metadata` 조회)를 수행할 근거가 저장되지 않았음을 확인. `content_id`(FK → `content`) 컬럼 추가 — `API_CONTRACT.md` v1.6의 `submit_attempt`·`generate_problem`·`get_content` 확장과 연동되는 영속화 계층 보완 |
| 1.7 | 2026-07-08 | Validation Level 3 Readiness Plan 검토 중 발견(AC-011) — `content.type_specific_metadata`의 SELF/TRANSFER 진단 키 이름이 미정이었음을 확인. `error_attributed_node_id` 예시를 §3.5 설명에 추가 — `DOMAIN_LOGIC_BRIEF.md` v1.2와 연동 |
| 1.8 | 2026-07-08 | AC-004 재상정(기존 non-blocking → blocking 재분류, `CONTENT_PRODUCTION_STANDARD.md` §4.1 체크리스트·`VALIDATION_FRAMEWORK.md` Level 0 자동검증이 이 컬럼 없이는 불가능함을 근거로 승인) — `get_content`(`API_CONTRACT.md` §7.1)가 이미 `explanation_level`을 필터 조건으로 정의해뒀지만 `content` 테이블에 저장 위치가 없었던 것을 확인. §2의 기존 컬럼/JSONB 판단 기준("조건절에 자주 쓰이고 타입이 고정적이면 컬럼")을 그대로 적용해 전용 컬럼으로 추가 — 새 원칙이 아니라 기존 원칙의 누락 보완. 정확한 허용값 전체 목록은 `CONTENT_SCHEMA.md`(이 세션에 없는 문서) 확인 전까지 TEXT로 유연하게 둠. `type_specific_metadata` 설명의 "§6 참고" 오기를 "§2 참고"로 정정 |
| 1.9 | 2026-07-13 | Independent Architecture Audit(AUD-002), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — `progress.mastered_at`(TIMESTAMPTZ, nullable)·`attempt_records.is_spaced_review`(BOOLEAN) 두 필드 신규 채택. `PROGRESS_SCHEMA.md`(Tier A) §3·§4가 새로 정의한 State Model·AttemptRecord 필드를 물리 컬럼으로 반영 — 이전 AC들과 달리 이번엔 Tier A 자신의 구조 확장이 선행됐다(`PROGRESS_SCHEMA_AMENDMENT_ENTRY.md` 참고, 이 세션에 원본 파일이 없어 병합 대기 문서로 별도 작성). `DOMAIN_LOGIC_BRIEF.md` §3.2.1·§3.2.2와 연동 |
| 1.10 | 2026-07-13 | Wording-only 정정(알고리즘·결정 변경 없음) — `is_spaced_review` 설명이 AUD-002 Scheduling Clarification(§6.1 조건부 갱신 규칙, `DOMAIN_LOGIC_BRIEF.md` v1.4) 반영 후에도 "매 시도마다 덮어써지는 단일 현재값"이라는 이전 표현을 그대로 남기고 있어 불일치했던 것을 정정 |
