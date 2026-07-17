# API_LAYER_BRIEF.md
## LLE Production API 계층 지시서 (Tier C, Production Track 3/5)

> 이 문서는 코드가 아니라 **지시서**다. `API_CONTRACT.md`(v1.2, 20개 API)가 정의한 입출력 계약과 `DOMAIN_LOGIC_BRIEF.md`가 정의한 알고리즘을 전제로, "이걸 실제 HTTP로 어떻게 노출하는가"만 다룬다. 알고리즘 세부는 여기서 다시 설명하지 않는다.

---

## 0. 문서의 지위

- Tier C, Production 문서 로드맵의 3번 문서.
- **외부 HTTP 표면 = Learning Flow Engine 외부 API 5개뿐이다** (`start_session`, `start_explicit_study`, `submit_attempt`, `request_practice`, `submit_self_reported_confidence`). Graph/Progress/Generation/AI Generation/Content/Review/Interleaving Engine(총 16개 내부 API)은 HTTP 경로를 갖지 않는다 — 같은 백엔드 프로세스 안의 인프로세스 함수 호출로 구현한다(`API_CONTRACT.md` §1·§12 원칙).
- 승인된 "Engine 네임스페이스"는 HTTP 경로가 아니라 **백엔드 내부 코드 모듈 구조**에 적용한다(§2 참고).

---

## 1. 전제 — 확정된 결정

| 영역 | 결정 |
|---|---|
| HTTP 경로 규칙 | Action 중심, 단 외부 표면은 Learning Flow Engine 4개 API로 한정 |
| 내부 모듈 구조 | Engine 단위 네임스페이스(`services/graph/`, `services/progress/` 등) — HTTP와 무관 |
| 게스트 로그인 | 서버 발급 anonymous user, 최초 1회 네트워크 필요 전제 수용 |
| 트랜잭션 경계 | 핵심(attempt+state+자기 노드 next_review_at) 원자적 + Cascade는 DB 테이블 기반 아웃박스로 비동기 처리 |

---

## 2. 외부 HTTP 엔드포인트

Action 중심, 단일 네임스페이스 `/flow/*`(Learning Flow Engine 외에 노출할 대상이 없으므로 Engine별로 나눌 필요 자체가 없다 — 승인 시 논의했던 "혼합형의 판단 비용" 문제가 애초에 발생하지 않는다).

| API_CONTRACT 이름 | HTTP | 인증 필요 |
|---|---|---|
| `start_session` | `POST /flow/start-session` | O |
| `start_explicit_study` | `POST /flow/start-explicit-study` | O |
| `submit_attempt` | `POST /flow/submit-attempt` | O |
| `request_practice` | `POST /flow/request-practice` | O |
| `submit_self_reported_confidence` | `POST /flow/submit-self-reported-confidence` | O |

모두 `POST`를 쓴다 — 다섯 API 전부 상태를 변화시키거나(3개는 쓰기), 판단 결과를 즉석에서 계산해 반환하는 행위형 호출(`start_session`·`request_practice`도 매 호출마다 결정이 달라질 수 있어 캐시 가능한 순수 조회가 아님)이라 `GET`의 멱등·캐시 가정이 맞지 않는다. `user_id`는 URL·바디에 담지 않고 인증 토큰에서 서버가 추출한다(§3).

---

## 3. 게스트 인증 흐름

**신규 엔드포인트**: `POST /auth/guest` (Learning Flow Engine 외부 API 목록에는 없지만, 학습 API가 아니라 인증 자체를 다루므로 별도 네임스페이스 `/auth/*`에 둔다)

| 단계 | 동작 |
|---|---|
| 1 | 클라이언트가 앱 최초 실행 시 `POST /auth/guest` 호출(입력 없음) |
| 2 | 서버가 `users` 테이블에 `auth_provider='GUEST'`, `auth_identifier=`새 UUID로 행 생성, `user_id` 발급 |
| 3 | 서버가 `user_id`를 담은 인증 토큰(JWT 등) 발급 |
| 4 | 클라이언트는 토큰을 로컬에 저장, 이후 모든 `/flow/*` 호출에 `Authorization` 헤더로 첨부 |

**계정 전환**: `POST /auth/convert`(입력: 현재 토큰 + OAuth 자격증명 또는 이메일/비밀번호) → `users.auth_provider`/`auth_identifier`/`converted_at` 갱신(`DATA_PERSISTENCE_BRIEF.md` §6). `user_id`가 바뀌지 않으므로 응답은 **기존 토큰 폐기 + 신규 토큰 발급**만 하면 되고, 클라이언트가 별도로 데이터를 다시 받아올 필요가 없다.

이 두 엔드포인트는 `API_CONTRACT.md`의 20개 API에 속하지 않는다 — Engine 계약이 아니라 HTTP 계층 자체의 세션 관리 기능이기 때문이다. 향후 `API_CONTRACT.md`에 "Auth" 같은 별도 장을 만들지는 이 문서의 범위 밖 결정이며, 필요해지면 Tier C 회의로 다룬다.

---

## 4. `empty_result` / `error`의 HTTP 매핑

`API_CONTRACT.md` §2가 정의한 두 상태를 HTTP 상태 코드로 변환한다.

| API_CONTRACT 개념 | HTTP 상태 코드 | 바디 |
|---|---|---|
| 정상(결과 있음) | `200 OK` | `{status: "ok", data: ...}` |
| `empty_result` | `200 OK` | `{status: "empty", data: null 또는 []}` — **에러 코드가 아니다, 200을 유지한다** |
| `error` — `INVALID_ID` | `404 Not Found` | `{status: "error", error_code: "INVALID_ID", message}` |
| `error` — `MISSING_REQUIRED_FIELD` / `OUT_OF_RANGE_VALUE` | `400 Bad Request` | 동일 형식 |
| `error` — `UNAUTHORIZED_CALLER` | `403 Forbidden`(외부 API 자체는 인증만 통과하면 호출 주체 문제가 나지 않으므로, 이 코드는 사실상 §5의 내부 인가 위반 시에만 발생) | 동일 형식 |
| `error` — `CONTRACT_VIOLATION` | `422 Unprocessable Entity` | 동일 형식 |
| 인증 실패(토큰 없음/만료) | `401 Unauthorized` | HTTP 계층 자체의 개념, `API_CONTRACT.md`에는 없음(§3 인증은 Engine 계약이 아니라 HTTP 계층 책임) |

`empty_result`를 `4xx`로 표현하지 않는 것이 핵심이다 — API_CONTRACT §2가 "요청이 유효했고 정상 처리됐지만 결과가 없는 경우"라고 명시한 그대로, HTTP 레벨에서도 성공(`200`)으로 취급한다.

---

## 5. 트랜잭션 경계 구현

### 5.1 핵심 트랜잭션(원자적)

`submit_attempt`의 Engine 호출 순서(AUD-004)는 **① Learning Flow Engine이 `content_id`로 Content metadata를 조회해 SELF/TRANSFER 판정 → ② TRANSFER이면 Review Engine `get_cascade` 호출(`max_cascade_depth`는 Engine 설정값, 현재 기본값 2) → ③ Review 결과에서 `node_id` 목록만 추출 → ④ Progress Engine `record_attempt` 단일 호출(`cascade_target_node_ids` 내부 전달)**이다. 외부 HTTP 클라이언트는 `cascade_target_node_ids`를 보내지 않는다.

Progress Engine은 `record_attempt` 처리 시 아래를 자신이 소유한 하나의 DB 트랜잭션으로 묶는다:

1. `attempt_records` 삽입
2. `DOMAIN_LOGIC_BRIEF.md` §3(State 전이) + §4(Confidence EMA) 계산 후 `progress` 갱신
3. `DOMAIN_LOGIC_BRIEF.md` §6(Review Scheduling) 계산 후 `progress.next_review_at` 갱신(자기 노드분만)
4. 전달받은 `cascade_target_node_ids` 각각에 대해 `cascade_jobs(status='PENDING')` 1건 삽입

이 트랜잭션이 실패하면 전체 롤백 — 사용자에게는 `error`로 응답하고 클라이언트는 재시도를 유도한다(사용자의 시도 자체가 유실되면 안 되므로, 클라이언트 쪽에서도 전송 실패 시 로컬에 임시 보관 후 재전송하는 정책을 `CLIENT_BRIEF.md`에서 다룬다).

### 5.2 Cascade 아웃박스

같은 트랜잭션 안에서, `error_category = TRANSFER`로 분류된 경우 Learning Flow→Review 경로가 계산한 대상 선행 노드 목록을 **`cascade_jobs` 테이블에 그대로 기록**한다(전용 메시지 큐 대신 단순 DB 테이블). 이 producer insert의 소유자는 Progress Engine이며, 대상 ID 존재성 검증도 같은 DB client/transaction 안에서 수행한다. 일부 ID 또는 일부 job만 성공하는 부분 커밋은 허용하지 않는다.

**`cascade_jobs`**(신규, `DATA_PERSISTENCE_BRIEF.md`에 추가 필요 — §6 참고)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `job_id` | UUID, PK | |
| `user_id` | UUID | |
| `target_node_id` | TEXT | `next_review_at`을 앞당겨야 할 선행 노드 |
| `status` | ENUM(`PENDING`, `DONE`, `FAILED`) | |
| `created_at` | TIMESTAMPTZ | |
| `processed_at` | TIMESTAMPTZ, NULL 허용 | |
| `retry_count` | INTEGER, 기본값 0 | |

**처리 방식**: `cascade_jobs` 행 삽입은 핵심 트랜잭션(5.1)에 **함께 커밋**된다(같은 트랜잭션 — 이게 아웃박스 패턴의 핵심이다: "일이 일어났다는 사실"은 핵심 데이터와 항상 함께 저장되므로 유실되지 않는다). 실제 대상 노드 `progress.next_review_at` 갱신, polling, retry/backoff, DONE/FAILED 전이는 별도 Worker의 후속 효과이며 **AUD-004 producer remediation 범위에서는 구현하지 않는다**.

**사용자 응답과의 관계**: `submit_attempt`의 HTTP 응답(`cascade` 필드)은 `cascade_jobs`에 **무엇을 기록했는지**(대상 노드 목록)를 그대로 반환한다 — 실제 `next_review_at` 갱신이 완료됐는지 여부는 응답 시점에 사용자에게 노출하지 않는다(수 초 내 비동기로 처리되며, 사용자 입장에서 체감 차이가 없다).

### 5.3 `DATA_PERSISTENCE_BRIEF.md` 반영 필요 사항

`cascade_jobs` 테이블은 이번 문서에서 새로 필요해진 것이라 `DATA_PERSISTENCE_BRIEF.md`에는 아직 없다. 본문 확정 후 그 문서에 패치를 제안한다(§6 다음 단계 참고).

---

## 6. 다음 단계

1. `DATA_PERSISTENCE_BRIEF.md`에 `cascade_jobs` 테이블 추가 패치(v1.3) — 이번 문서에서 발견된 신규 요구사항
2. `ENGINE_INTERFACE.md`의 Learning Flow Engine 외부 API 목록을 3개→4개로 갱신(`MIGRATION_GUIDE_ENTRY_004.md`가 이미 이 필요성을 기록해둠) — 이 문서는 원본이 없어 직접 패치하지 못했다
3. 4번 문서 `AI_INTEGRATION_BRIEF.md`로 진행 — Generation Engine의 실제 AI 호출, 프롬프트 제약, 생성 실패 폴백

---

## 7. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — 외부 HTTP 표면을 Learning Flow Engine 4개 API로 한정, `/flow/*` 단일 네임스페이스 확정(Engine 네임스페이스는 내부 모듈 구조로 재해석). 게스트 인증 흐름(`POST /auth/guest`, `POST /auth/convert`) 정의. `empty_result`/`error`의 HTTP 상태 코드 매핑표 확정(`empty_result`는 200 유지). 트랜잭션 경계 구현 — 핵심 3단계 원자적 트랜잭션 + `cascade_jobs` 테이블 기반 아웃박스 패턴으로 Cascade 비동기 처리. `cascade_jobs` 신규 테이블 필요성을 발견해 `DATA_PERSISTENCE_BRIEF.md` 패치 필요 항목으로 이관 |
| 1.1 | 2026-07-07 | `CLIENT_BRIEF.md` 작성 중 발견된 세션 시작 진입점 공백을 메우기 위해 `API_CONTRACT.md` v1.3에 추가된 `start_session`(10.5)을 `POST /flow/start-session`으로 매핑, 외부 API 5개로 갱신 |
| 1.2 | 2026-07-17 | AUD-004 Tier C Architecture Clarification 승인 반영 — submit_attempt 처리 순서를 Content 진단→필요 시 Review Cascade→Progress record_attempt 단일 호출로 명확화. `cascade_target_node_ids`는 내부 전달값이며 Progress 소유 동일 트랜잭션에서 PENDING outbox를 기록하고, Worker 후속 효과는 범위 밖임을 명시 |
