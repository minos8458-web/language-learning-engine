# DATA_PERSISTENCE_BRIEF.md
## LLE Production 데이터 영속성 지시서 (Tier C, Production Track 1/5)

> 이 문서는 코드가 아니라 **지시서**다. `PRODUCTION_ARCHITECTURE_OVERVIEW.md`가 확정한 결정(서버+DB, 계층 단위 분해)을 전제로, "무엇을 떤어 스키마로 저장하는가"만 다룬다. 이 문서가 정의하는 것을 소비해 실제 로직을 다루는 것은 다음 문서 `DOMAIN_LOGIC_BRIEF.md`의 몫이다.
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
| `version` | INTEGER | ID는 불변, 개정마다 증가(CONTENT_SCHEMA §8) |
| `author` | TEXT | |
| `created_at` | TIMESTAMPTZ | AI Generation Engine이 "최근 생성된 예문"을 조회해 표층 변주 프롬프트에 활용하는 데 필요(AI_INTEGRATION_BRIEF §2) |
| `is_active` | BOOLEAN, 기본값 true | `CONTENT_PRODUCTION_STANDARD.md`(Tier D)의 Content Lifecycle — Deprecated 콘텐츠는 삭제 대신 이 값을 false로 바꿔 비활성화한다. 모든 콘텐츠 조회 쿼리(`get_content` 등)는 반드시 `is_active = true` 조건을 포함해야 한다 |
| `explanation_level` | TEXT, NULL 허용 | **AC-004(2026-07-08 Resolved) 반영**: `get_content`(API_CONTRACT §7.1)가 이미 이 필드를 WHERE 조건으로 쓰도록 설계돼 있었으나 저장 컬럼이 없었던 것을 보완. ENUM이 아니라 TEXT(허용값 전체 목록이 `CONTENT_SCHEMA.md`에서 미확인 상태라 유연성 우선). 확인된 값은 `BEGINNER`(기존 Tier D 255개 콘텐츠 전부). `EXPLANATION` 타입은 애플리케이션 레벨에서 NOT NULL 강제, 나머지 9종은 NULL 허용(금지 아님) |
| `type_specific_metadata` | JSONB, NULL 허용 | `answer_key`(QUIZ), `speaker_roles`(DIALOGUE), **`error_attributed_node_id`(AC-011, 2026-07-08 Resolved — TEXT, nullable, 단일 `grammar_node_id`. 채점 가능한 content_type에 선택적 적용, QUIZ 한정 아님. 키 부재·null·`primary_node_id`와 동일 값은 전부 SELF로 처리)** 등 타입 전용 필드. 별도 컬럼으로 만들지 않는 이유는 §2의 물리 저장 판단 기준 참고 |

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
| `updated_at` | TIMESTAMPTZ | |

**`attempt_records`** (PK: `attempt_id`, FK: `(user_id, node_id)` → `progress`)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `attempt_id` | UUID, PK | |
| `user_id` | UUID | |
| `node_id` | TEXT | |
| `content_id` | TEXT, FK → `content`, NULL 허용 | **AC-008(2026-07-08 Resolved) 반영**: `submit_attempt`(API_CONTRACT §10.2)가 어떤 Content를 풀었는지 식별하지 못해 SELF/TRANSFER 진단이 불가능했던 연쇄적 계약 공백(`generate_problem` 출력·`submit_attempt` 입력·`get_content` 단독 조회 모드와 함께 4개 지점 연쇄 패치) 중 하나. 클라이언트는 직전에 받은 값을 그대로 되돌려줄 뿐 스스로 생성하지 않는다 |
| `attempted_at` | TIMESTAMPTZ | |
| `is_correct` | BOOLEAN | Tier A 명칭 그대로(v1.1에서는 `result` ENUM으로 잘못 표기했던 것을 정정) |
| `response_time_ms` | INTEGER, NULL 허용 | 난이도 정규화는 애플리케이션 계층에서 수행 |
| `correction_count` | INTEGER | 시도 중 정정 횟수 |
| `hint_used` | BOOLEAN | |
| `preceding_streak` | INTEGER | 이 시도 직전까지의 연속 정답 수 |
| `error_category` | ENUM(`SELF`, `TRANSFER`, NULL) | `is_correct = true`면 반드시 NULL |
| `error_subcategory` | TEXT, NULL 허용 | 예약 필드, 현재 항상 NULL(GRAMMAR_SCHEMA v1.3) |

### 3.7 `vocabulary`

**범위 재확인(VOCABULARY_SCHEMA §0~1)**: 이 테이블은 사전이 아니다. Grammar 규칙으로 예측 가능한 형태(`work→worked`)는 저장하지 않는다 — Lemma와 대응 Grammar Node 규칙만으로 언제든 계산 가능하기 때문이다(§4의 "저장하지 않는 것들"과 동일한 원칙). 오직 ① 열린 어휘 집합에서의 선택, ② 규칙으로 설명 안 되는 예외(Irregular Surface Form)만 행으로 존재한다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `vocab_id` | TEXT, PK | 예: `VOCAB_EN_GO` |
| `lemma` | TEXT | 기본형(예: "go") |
| `language` | TEXT | |
| `pos` | ENUM(12종: `NOUN`/`VERB`/`ADJECTIVE`/`ADVERB`/`PRONOUN`/`PREPOSITION`/`CONJUNCTION`/`DETERMINER`/`INTERJECTION`/`CLASSIFIER`/`NUMERAL`/**`PARTICLE`**) | **⚠️ 미채번 스키마 보정(AC 번호 없음, 2026-07-10 미노 승인)**: Tier D 적재 중 `ZH_LANGUAGE_PACK.md`의 `VOCAB_ZH_LE`(了/le, 완료상 조사)가 `POS=PARTICLE`을 요구하는데 기존 11종 ENUM에 없어 발견. 새 Architecture 정책이 아니라 실제 언어팩 데이터와 DB enum의 불일치 보정. 근거는 GitHub 문서가 아니라 과거 세션(migration `012_add_particle_to_pos_enum.sql`) 기록뿐이므로, `ARCHITECTURE_CLARIFICATION_BACKLOG.md`에 정식 AC로 재제출해 번호를 받는 것을 권장(REBUILD_CONTRACT_RECONCILIATION.md §6 참고) |
| `canonical_gloss` | TEXT | 최소 의미 힌트 1개(상세 설명은 Content의 몫, VOCABULARY_SCHEMA §6) |
| `irregular_surface_forms` | JSONB(배열, `{surface_form, realizes_grammar_node_id}`) | `realizes_grammar_node_id`는 `grammar_nodes.node_id` 참조(애플리케이션 레벨 FK — VOCABULARY_SCHEMA §7 단방향 원칙, Vocabulary→Grammar Node만 참조하고 역방향 저장 없음) |
| `features` | JSONB, NULL 허용 | 예약 필드(가산/불가산, 격식 등), Controlled Open, 현재 로직 미사용(§8) |
| `pronunciation_ref` | TEXT, NULL 허용 | 예약 필드 |
| `phonetic_ref` | TEXT, NULL 허용 | 예약 필드 |

**애플리케이션 레벨 제약(DB 제약으로 표현 불가, `DOMAIN_LOGIC_BRIEF.md`에서 실제 검증 로직으로 구현)**: `irregular_surface_forms`에 등록하려는 형태가 대응 Grammar Node의 규칙을 그대로 적용한 결과와 같다면 저장을 거부한다(VOCABULARY_SCHEMA §10 Validation — 예: `work+‑ed=worked`는 금지, `go→went`는 허용). SQL 제약으로 표현할 수 없는 규칙이므로 스키마가 아니라 애플리케이션 검증 계층의 책임으로 명시해둔다.

### 3.8 `cascade_jobs` (Production 신설 — `API_LAYER_BRIEF.md` 트랜잭션 경계 결정에서 발견된 요구사항)

Review Cascade의 부가 효과(선행 노드들의 `next_review_at` 앞당김)를 재시도 가능한 형태로 분리하기 위한 아웃박스 테이블(`API_LAYER_BRIEF.md` §5.2). 핵심 트랜잭션(attempt 삽입+state 전이+자기 노드 `next_review_at` 갱신)과 같은 트랜잭션에 삽입되어야 "일이 일어났다는 사실"이 유실되지 않는다.

**AC-002 복구 메모(Backlog 원문 미제출 — 과거 세션 기록 기준, 2026-07-11 재정리)**: `cascade_jobs`는 8개 Engine에 속하지 않는 별도 인프라 컴포넌트다. `submit_attempt`의 TRANSFER 경로에서 `cascade_jobs` 삽입은 `progressEngine.recordAttempt` 트랜잭션 안에서 함께 처리한다(위 아웃박스 원칙의 구체적 적용 지점). 워커(`src/worker/cascadeJobsWorker.js`)는 `PENDING` job을 처리해 `progress.next_review_at`을 앞당기고 `DONE`/`FAILED` 상태를 갱신하며, Progress에 대한 쓰기는 이번에도 Progress Engine을 통해서만 수행한다(ENGINE_INTERFACE §5 단일 쓰기 경로 원칙과 동일). 이 메모는 새 설계가 아니라 과거 Resolved 결정의 복구이며, 정식 AC 번호는 아직 없다 — Architecture 재제출 권장(REBUILD_CONTRACT_RECONCILIATION.md §6).

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

## 9. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — PostgreSQL+JSONB 채택, `users` 신설 스키마, Concept/Grammar Node/Relation/Content/Progress/AttemptRecord 물리 스키마 정의, 계산값 비저장 원칙 재확인, `get_due_reviews` 기준 인덱스 설계, 게스트→계정 전환이 `user_id` 불변으로 인해 데이터 마이그레이션 없이 처리됨을 확정. Vocabulary 스키마는 원본 미확인으로 보류 |
| 1.1 | 2026-07-07 | `CONCEPT_SCHEMA.md`·`VOCABULARY_SCHEMA.md` 원본 확인 후 미확정 항목 해소 — `vocabulary` 테이블 전체 필드 확정(POS 11종, irregular_surface_forms, 예약 필드 3종), `concepts.relationships`를 RELATED/CONTRAST/SUBSUMPTION 3종으로 확정하고 Concept 레벨 prerequisite와의 구분 명시. 규칙형 중복 저장 금지 검증을 애플리케이션 레벨 책임으로 명시. 문서 상태를 확정으로 전환 |
| 1.2 | 2026-07-07 | `DOMAIN_LOGIC_BRIEF.md` 작성 착수 중 Tier A 대조에서 발견한 누락 필드 수정 — `progress`에 `accuracy`·`avg_response_time_ms`·`explicit_study_event_at` 추가, `confidence_calibration`을 `confidence_calibration_delta`로 명칭 정정(자기보고−추론값 차이임을 명시). `attempt_records`에 `correction_count`·`hint_used`·`preceding_streak` 추가(confidence_inferred 계산 입력값 누락 보완), `result` ENUM을 Tier A 명칭인 `is_correct` BOOLEAN으로 정정. 관계형 테이블 하나가 Tier A의 "최근 N개 제한 배열 + 별도 전체 이력 저장소" 이원화 요구를 함께 만족시키는 이유 명시 |
| 1.3 | 2026-07-07 | `API_LAYER_BRIEF.md` 작성 중 발견된 요구사항 반영 — Review Cascade의 비동기 아웃박스 패턴 구현을 위한 `cascade_jobs` 테이블 신설, 관련 인덱스 추가 |
| 1.4 | 2026-07-07 | `AI_INTEGRATION_BRIEF.md` 작성 중 발견 — `content` 테이블에 `created_at`이 없어 "최근 AI 생성 예문" 조회(표층 변주 프롬프트용)가 불가능했던 것을 보완 |
| 1.5 | 2026-07-07 | `CONTENT_PRODUCTION_STANDARD.md`(Tier D) 작성 중 발견 — `human_reviewed`/`is_canonical` 두 boolean 조합만으로는 Content Lifecycle의 Deprecated 상태를 표현할 자리가 없어 `content.is_active` 컬럼 추가 |
| 1.6 | 2026-07-08 | AC-008 Resolved 반영 — `attempt_records.content_id`(FK→`content`) 추가(§3.6) |
| 1.7 | 2026-07-08 | AC-011 Resolved 반영 — `content.type_specific_metadata`에 `error_attributed_node_id` 키 확정(§3.5) |
| 1.8 | 2026-07-08 | AC-004 Resolved 반영 — `content.explanation_level` 전용 컬럼 추가(§3.5) |
| 1.9 | 2026-07-11 | **Contract Reconciliation 패치** — 코드베이스 유실 후 재구현 착수 전 일괄 반영. (1) 위 v1.6~v1.8(AC-008/011/004)을 GitHub 본문에 실제 적용(그동안 v1.5에 머물러 있었음). (2) `vocabulary.pos`에 `PARTICLE` 추가 및 `cascade_jobs` AC-002 복구 메모 — 둘 다 정식 AC 번호가 없어 별도로 표시, Architecture 재제출 권장. 새로운 설계 결정 없음. 근거: `REBUILD_CONTRACT_RECONCILIATION.md` |
