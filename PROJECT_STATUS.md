# PROJECT_STATUS.md

## 0. Authority

**Current Implementation State and Product Readiness Authority.** This document owns the current implementation state and product readiness for the Language Learning Engine. Roadmap/position is owned by `PROJECT_MASTER_INDEX.md`; validation state is owned by `VALIDATION_STATUS.md`; Architecture Clarification status is owned by `ARCHITECTURE_CLARIFICATION_BACKLOG.md`. Session startup order is owned by `BOOTSTRAP.md`.

## 1. Repository and Implementation Layers

Git ref, runtime-validated implementation, independent review target, and review-record commit are separate authorities and are not merged into a single "current implementation SHA".

- **GitHub main ref**: `GitHub refs/heads/main` is the authority for current repository HEAD.
- **Status snapshot baseline**: `d41829f4d6f71d78cdbda80b96ee7af41e44a715` — the exact `origin/main` baseline (subject `Record Unseen v2 runtime lifecycle closure`) from which this three-file post-closure roadmap/status synchronization candidate is prepared; the prior status snapshot baseline `777f8d7dd94b9d6b5be574d6d83194688e5efaba` is superseded as current and preserved as history
- **Latest accepted integrated runtime-validation milestone**: `1de6dec26d9da3122c0d1335938af6edadf5883f` (`VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation; `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`; review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`; bounded to that Runtime implementation lifecycle only, not project-wide closure)
- **Prior accepted integrated runtime milestone, preserved**: `77db80d97f25c9394cd04ad08801d85580f006dd` (ITEM Lineage-Authority Writer Correction; post-merge validation PASS; lifecycle `CLOSED` by Control Tower adjudication, closure-sync integration `7ef696879e60956bfab649af74f5b8bbc05453c6`, post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`; no Backlog review-record revision recorded for this lifecycle)
- **Prior accepted integrated runtime-validation milestone, preserved**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` (BIGINT writer source-authority runtime; independently reviewed, canonical on main, post-integration Windows-local PostgreSQL 17.10 verified, validated, review-recorded in backlog revision `1.78`, and closed)
- **Prior accepted integrated runtime-validation milestone, preserved**: `22508147625090af84af141ac0ec574792369115` (METRIC_RESULT / Retention v1 runtime; independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed)
- **Runtime Foundation B1 accepted implementation**: `6bb2bccd5abef2d10839706ffdd000285b59512d` (RAW_SOURCE rebuild runtime; independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed)
- **Current canonical contracts**: `API_CONTRACT.md` revision `1.31`; `EVIDENCE_FOUNDATION_P0_SCHEMA.md` revision `1.10`
- **BIGINT writer source-authority runtime — reviewed candidate**: `303e1af9aa2c32167e7caf66527b5020bbacf882`, parent `2034d1a01e58a36762750156df1fd63c8e77ba9c`, branch `validation/bigint-writer-source-authority-runtime-20260912`; prior candidate Independent Validation PASS; Independent Review APPROVE WITH NON-BLOCKING NOTES
- **BIGINT writer source-authority runtime — canonical main integration**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` (parent `a72c4a73ca711fd4fb191f43028d855ecd64e2b3`); fresh post-integration Windows-local PostgreSQL 17.10 Validation PASS; REVIEW-RECORDED / CLOSED.
- **Current runtime implementation review-record commit**: `4b86a440544a40e9195d6a6437f9f2256a92e9e3` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.80`, blob `02648bb9c672a3629d626a0da81da004eb935994`; METRIC_RESULT Unseen Transfer v2 Runtime implementation lifecycle)
- **Prior runtime implementation review-record commit, preserved**: `777f8d7dd94b9d6b5be574d6d83194688e5efaba` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78`, blob `5a9f2e43527a72355b99838cd37a820c376af6c1`; BIGINT writer source-authority Runtime implementation lifecycle)
- **Prior documentation review-record commit, preserved**: `623eaf94328a5145adf62aaff52c6b23689d4efe` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77`; closed BIGINT Tier C documentation lifecycle, not runtime-candidate review evidence)

Detailed runtime figures, lifecycle classifications, and candidate-validation totals are owned only by `VALIDATION_STATUS.md`.

## 2. Implemented Runtime Surfaces

- Learning Flow five-branch decision path (REVIEW / NEW_GRAMMAR / INTERLEAVING / CONVERSATION / IDLE)
- In-process Learning Flow transport
- AC-018 first Mock composition
- Fail-closed unconfigured provider adapter
- Evidence Foundation 17-table persistence through migration 013; migration 014 absent
- Bounded assignment creation, attempt open, and finalization repository operations
- RULE-based target-node evaluation and correction aggregate persistence
- Evidence session lifecycle (B-1a, main `d785abfc74a669cbc472ff24df9869874a165ecb`): `startSession`, `terminalizeSession`, `restartSession`
- Bounded assignment completion (B-1b, main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`): a qualifying successful INITIAL non-replay `finalizeAttempt` with `attemptOutcome === SCORABLE` writes assignment `COMPLETED`, with `completed_at = finalizedAt` and `completion_attempt_id` set to the finalizing attempt; replay does not rewrite the recorded completion; successful non-SCORABLE finalization leaves assignment lifecycle a no-op. Assignment-level terminalization for `MISSING`/`TECHNICAL_FAILURE`/`WITHDRAWN`/`UNSCORABLE`/`NORMAL_EMPTY` outcomes remains out of this bounded scope (see §4).
- Foundation A item-exposure/item-lineage runtime, including `evidence_assignment_item_exposures` and exact exposure ordinal persistence
- Runtime Foundation B1 RAW_SOURCE rebuild (`queryRawEvidenceForMetricRebuild(pool, input)`), main `6bb2bccd5abef2d10839706ffdd000285b59512d`; read-only bounded runtime lifecycle is review-recorded and closed
- METRIC_RESULT / Retention v1 reducer (`queryMetricResult(pool, input)` with FORMULA definition version 1), main `22508147625090af84af141ac0ec574792369115`; bounded runtime lifecycle is review-recorded and closed
- BIGINT writer source-authority correction, main `8934ccee7931b79ddc544af08dceffc97a0d7b32`: `createAssignment` snapshot `exposure_history_cutoff_ordinal` and `recordAssignmentItemExposure` `exposureOrdinal` carry exact base-10 decimal strings rather than JavaScript `Number`; corrected assignment-snapshot digesting uses `evidence-assignment-snapshot-v2`, while generic `evidence-semantic-v1` is unchanged; no migration/DDL and no historical rewrite/backfill. Bounded runtime lifecycle: INDEPENDENTLY REVIEWED — APPROVE WITH NON-BLOCKING NOTES / CANONICAL IMPLEMENTATION ON MAIN / POST-INTEGRATION WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED
- ITEM Lineage-Authority Writer Correction, main `77db80d97f25c9394cd04ad08801d85580f006dd`: ITEM `lineageAuthority` writer semantics in `src/instrumentation/evidenceRepository.js` (`createAssignment`), with `tests/viP1ItemLineageRuntime.test.js` (exact two-file candidate scope); migration/DDL `NONE`; historical stored `resolved_item_lineage` learner/human data UNKNOWN / NOT INSPECTED. Bounded lifecycle: `CLOSED` by Control Tower adjudication (closure-sync integration `7ef696879e60956bfab649af74f5b8bbc05453c6`; post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`). `F-IR-01`–`F-IR-04` and `N-IR-S1` remain OPEN / NOTE / NON-BLOCKING
- METRIC_RESULT / Unseen Transfer v2 reducer, main `1de6dec26d9da3122c0d1335938af6edadf5883f`: `queryMetricResult(pool, input)` FORMULA dispatch for `definitionVersion 2` (UNSEEN_TRANSFER), implemented in `src/instrumentation/evidenceMetrics.js` with `tests/viP1MetricResultRuntime.test.js` (exact two-file implementation scope), consuming the canonical ITEM `lineageAuthority`; migration/DDL `NONE`, migration `014` absent; the bounded scope required Retention v1 and RAW_SOURCE to be preserved, and their regression gates passed as prior evidence. Bounded runtime lifecycle: `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`), bounded to that Runtime implementation lifecycle only. Runtime-engine validation is not learning-efficacy evidence

The BIGINT writer source-authority correction is recorded through four distinct evidence steps, which are not merged:

1. Prior candidate Independent Validation — PASS on exact candidate `303e1af9aa2c32167e7caf66527b5020bbacf882`, before review and integration.
2. Independent Review — APPROVE WITH NON-BLOCKING NOTES, integration ELIGIBLE, on the same exact candidate; no tests, runtime, or database execution.
3. Main integration — one guarded ordinary cherry-pick onto `a72c4a73ca711fd4fb191f43028d855ecd64e2b3`, producing main `8934ccee7931b79ddc544af08dceffc97a0d7b32` with exactly the reviewed four files; no conflict, no force push.
4. Fresh post-integration Validation — POST-INTEGRATION VALIDATION PASS on exact main `8934ccee7931b79ddc544af08dceffc97a0d7b32`, Windows-local PostgreSQL 17.10, on a fresh disposable database.

Detailed figures for steps 1 and 4 are owned by `VALIDATION_STATUS.md` (§A.12 and §A.15). The implementation review-record is `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78` (`777f8d7dd94b9d6b5be574d6d83194688e5efaba`). `F-R02` is CLOSED — CORRECTED / INDEPENDENTLY REVIEWED / INTEGRATED / POST-INTEGRATION VALIDATED, bounded to its cited exposure-ordinal/cutoff domain; this closure makes no claim about historical rows, which remain UNKNOWN / NOT INSPECTED. `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING.

Prior commit-pinned evidence for the ITEM Lineage-Authority Writer Correction and the METRIC_RESULT Unseen Transfer v2 Runtime is owned by `VALIDATION_STATUS.md` (§A.17 and §A.18). That evidence was not regenerated by this documentation-only synchronization.

## 3. Product Readiness

### 최초 학습 클라이언트 응답 검증 보완 — 2026-10-04

- 사용자 2026-10-04T02:18:41+09:00 “다음” 지시로 CP-IP-02/03 한 작업을 수행했다. 시작 local/remote `fdf69607405ac171752feed8096fcc7dbd5e3779`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; fetch·clean·upstream 0/0·main 31/0 확인.
- HTTP startExplicitStudy에 exact 3키·6 state·Content exact 6키/null·요청 노드/type·본문/answer_key 검증을 추가했다. malformed/state-only 응답은 성공 전에 거절하며 값 정규화/자동 재전송은 없다. Preview도 null/INTRODUCED/null 계약으로 정합화했다.
- CP-IP-02/03: CORRECTED IN CANDIDATE / RE-REVIEW PENDING. 독립 승인이나 원격 스레드 resolve는 아니다. 실행 증거는 VALIDATION_STATUS.md §O.
- MOBILE-05 게스트 구현과 팩 저장/복구, 서버·Progress·Generation·API/schema/판정 규칙은 보존했다. 게스트/HTTP/mobile 테스트의 성공 fixture만 새 계약으로 맞췄다. 설명/문제 UI·제출은 이번 미구현이다.
- 다음 행동 하나: Node 지원 버전 선언과 잠금 의존성의 최소 버전 불일치(CP-IP-01)를 한 작업으로 보완한다. 401 안내 보존(CP-IP-04)·재리뷰·main 병합은 별도 후속으로 남긴다.
- 아래 리뷰/구현 기록은 각 시점의 이력이다.

### 최초 학습 서버 독립 리뷰 수신 — 2026-10-03

- 사용자 22:51:34+09:00 “다음” 지시로 Copilot review를 요청했고 최종 확인 중 결과를 수신했다. PR #2, reviewer `copilot-pull-request-reviewer`, review ID `PRR_kwDOTQ7IWM8AAAABQfiOMw`, COMMENTED / Changes recommended.
- High 2·Medium 2·Low 2를 `INITIAL_PRACTICE_REVIEW_PACKET.md`의 CP-IP-01–06으로 분류했다. 코드 관련 4건 OPEN, 오래된 Next Action 문서 2건은 이번 후보에서 정정했다. 스레드 resolve/리뷰어 재확인은 미실행이다.
- 요청 target `92a9b70262b8df6bf8e67a3e03f517594699e139`; 도구 결과에 reviewed SHA가 없어 정확한 리뷰 커밋은 미확인이다. 문서 후속 head와 대상 runtime/test blob은 동일하다. PR 전체 리뷰를 최초 서버 범위의 무조건 승인으로 해석하지 않는다.
- 직접 관찰·한계는 VALIDATION_STATUS.md §N. production source/test 변경 없음. main 병합·CLOSED 보류.
- 다음 행동 하나: 최초 학습 클라이언트 응답 검증과 합성 preview 계약 정합성을 한 작업으로 보완한다(CP-IP-02/03). Node 지원 범위(CP-IP-01)와 401 안내 보존(CP-IP-04)은 별도 후속 수정으로 남기며 main 병합은 보류한다.

### 최초 학습 서버 경계 PostgreSQL 검증 — 2026-10-03

- 사용자 직접 지시: 2026-10-03T22:16:33+09:00 “다음”. 직전 인계의 실제 PostgreSQL 검증 한 작업을 진행했다.
- 시작 local/remote `dc2082345f055ee9199b5a31fcc5ccb984f5e9bb`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; fetch 성공·clean·upstream 0/0·main 27/0.
- 격리된 PostgreSQL 16.15에서 기존 13개 migration과 합성 fixture로 R1 제외 조건·응답·중복/손상·SQL 실패 후 admission 보존·동시성/멱등/capacity를 검증했다. 직접 실행 결과는 `VALIDATION_STATUS.md` §M이 소유한다.
- 신규 PG 테스트와 승인된 API 10.1/Content 호출을 반영한 기존 Flow 정적 테스트만 수정했다. runtime source·MOBILE-05·schema/계약/Validation 판정 규칙은 불변이다.
- **작업 브랜치 구현 후보 / 선택 실제 PostgreSQL 검증 완료 / 독립 리뷰·main 통합 대기**. 운영 PostgreSQL/HTTPS·검수 콘텐츠·팩 일치·Android/기기 완주와 학습 효과는 미검증이다.
- 다음 행동 하나: 최초 학습 서버 경계 구현 후보와 이번 PostgreSQL 검증 변경의 독립 리뷰를 진행한다. main 병합·UI·제출·Android 작업은 별도 후속으로 남긴다.
- 아래 구현·계약 기록은 각 시점의 이력이다.

### 최초 학습 서버 경계 구현 — 2026-10-03

- 사용자 직접 지시: 2026-10-03T21:09:38+09:00 “ok 다음”. 직전 인계의 서버 경계 구현 한 작업을 진행했다.
- 시작 작업/원격/PR 기준 `18c3f6223b4bb08641be1dc28630eb97ee8936c7`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; fetch 성공, clean, upstream 0/0, main 25/0.
- 구현: Content.getContent opt-in EXPLICIT_STUDY의 입력 검증·검수/대표/단일 노드 SQL 조건, KO/BEGINNER 서버 구성, Flow.startExplicitStudy의 admission→설명→QUIZ와 exact 3키 응답/독립 null/손상 결과 기술 오류, in-process 연결.
- 기존 Progress 구현·Generation EXAMPLE 경로·MOBILE-05 클라이언트·schema·API/Validation 판정 규칙은 변경하지 않았다. Content의 기존 프로필 미지정 호출과 6키 projection은 보존한다.
- **작업 브랜치 구현 후보 완료 / 실제 PostgreSQL 검증·독립 리뷰·main 통합 대기**. 설명/문제 UI·제출·실제 검수 팩·Android/기기 완주는 미완료다.
- 직접 실행 증거와 한계는 `VALIDATION_STATUS.md` §L이 소유한다. 합성 DB/엔진 경계와 실제 Node HTTP 검증이며 실제 PG 검증으로 해석하지 않는다.
- 다음 행동 하나: 실제 PostgreSQL의 격리된 합성 fixture에서 R1 선택 제외 조건·중복·admission 멱등/capacity 및 기존 Content/Generation/Flow 회귀를 검증한다. UI·제출·Android 구현은 동시에 시작하지 않는다.
- 아래 계약 반영·설계 기록은 당시 상태로 보존한다.

### 최초 학습 응답·R1 계약 승인/문서 반영 — 2026-10-03

- 사용자 직접 승인: 2026-10-03T19:35:16+09:00 “승인”. 승인 대상은 직전 설계 후보/R1과 정식 계약 문서 반영 한 작업이다.
- 계약 반영: `API_CONTRACT.md` 1.32(§7.1.1/§10.1), `ENGINE_INTERFACE.md` 1.20, `CLIENT_BRIEF.md` 1.3, `LEARNING_API_SERVER_BRIEF.md`; 승인 provenance는 Backlog 1.82에 기록했다.
- 정확한 explanation/state/initial_practice·기존 6키 projection·독립 null, Content opt-in EXPLICIT_STUDY 선택, Progress-first·멱등/오류/capacity 경계를 확정했다.
- **문서 반영 완료 / 코드 미구현 / 독립 리뷰·main 통합 대기**. 기존 state-only 구현을 새 계약 준수로 재분류하지 않는다. MOBILE-05 코드 및 선택 검증 기록은 유지한다.
- 이번 직접 문서 점검은 `VALIDATION_STATUS.md` §K. 런타임/빌드/PG/실기기 미실행이며 기존 §I의 증거와 구분한다.
- 다음 행동 하나: 승인된 최초 학습 계약의 서버 경계 구현 한 작업: Content R1·Learning Flow startExplicitStudy·in-process 연결과 관련 검증을 진행한다. UI/제출/Android 작업은 동시에 시작하지 않는다. 이번 문서 반영에서는 구현에 착수하지 않았다.
- 아래는 각 시점의 이력이다. 이전 후보 승인 대기는 이번 승인으로 해소됐지만 구현·실기기 차단은 남아 있다.

### 최초 학습 응답 계약 후보 설계 완료 — 2026-10-03

- 사용자 요청의 다음 한 작업을 `INITIAL_PRACTICE_CONTRACT_PROPOSAL.md`로 작성했다. 정확한 계약 승인 대기이며 구현/독립 리뷰 완료가 아니다.
- 후보: 성공 data의 필수 `explanation`, `state`, `initial_practice`; 기존 6키 Content projection; 독립 null; 기존 admission을 먼저 수행하고 콘텐츠 조회; 멱등/capacity 및 부분 실패 의미.
- 추가 확인: 현재 getContent는 검수/대표/단일 노드 선택을 보장하지 않는다. 기존 경로를 보존하는 내부 선택 프로필 R1을 제안했으며 추가 계약 승인이 필요하다. Flow 직접 SQL이나 projection 확장은 제안하지 않는다.
- MOBILE-05와 source/API/schema/Validation 판정 규칙은 그대로다. 이번 직접 문서 점검·미실행 증거는 `VALIDATION_STATUS.md` §J, 기존 런타임 증거는 §I.1–I.2다.
- 현재 다음 행동 하나: `INITIAL_PRACTICE_CONTRACT_PROPOSAL.md` §3–6의 정확한 응답/실패 순서와 §4의 Content 선택 프로필 R1을 검토·승인한 뒤 canonical 계약 문서에만 반영한다. 승인 전 코드/API 원문 변경을 시작하지 않는다.
- 아래 기록은 각 시점의 이력이며 위 최신 설계 위치를 대체하지 않는다.

### MOBILE-05 클라이언트 구현·선택 개발 검증 완료 — 2026-10-02

- 사용자 직접 계속 지시: 2026-10-02T21:46:25+09:00 “다음작업 계속 진행해”.
- 게스트 제어기·주입 저장 경계·게스트 화면·기존 팩/flow 진입을 구현했다. pending 저장 확인 후 기존 POST, 후보 commit/read 동일 기록 확인 후 READY, 동일 유효 게스트 복구·만료/401 차단·로컬 저장 재확인·종료/재개·이전 응답 차단을 포함한다.
- 선택 개발 검증/모바일 빌드 통과. 실행 증거는 `VALIDATION_STATUS.md` §I.1, 내부 계약/실제 연결 부족분은 `MOBILE_GUEST_START_BRIEF.md` §12, 최신 인계는 `MOBILE_APP_HANDOFF.md`를 따른다.
- 합성 store/DB·Node DOM·실제 Node HTTP 코드 경계의 완료다. 실제 native adapter/OS 보안 저장·Android host/APK·PG/운영 HTTPS·검수 팩·단원 학습/진도·실기기는 미완료다.
- 실제 안전 저장 host가 없는 일반 실행은 HOST_UNAVAILABLE에서 팩/학습 요청을 막는다. 기존 token callback host와 명시적 합성 preview는 유지한다.
- 기존 엔진·서버·학습 제어기/HTTP 전송·팩 service/controller/view·API/schema/Validation 판정 규칙·dependency/lock 변경 없음. main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92` 유지. 병합·독립 리뷰·CLOSED·출시는 선언하지 않는다.
- 다음 행동 하나: 승인된 `start_explicit_study.initial_practice` 방향의 정확한 응답·null·오류 계약을 기존 API/Content·Generation·Progress와 대조해 검토 가능한 설계로 구체화한다. canonical API/코드 변경과 새 Android host 구현은 동시에 시작하지 않는다.
- 아래 설계/착수/이전 빌드 체크포인트는 당시 기록이며 현재 구현 상태를 대체하지 않는다.

### MOBILE-05 클라이언트 구현 착수 체크포인트 — 2026-10-02 (착수 당시 기록)

- 최신 사용자 직접 지시: 2026-10-02T21:46:25+09:00 “다음작업 계속 진행해”.
- `MOBILE_GUEST_START_BRIEF.md`의 게스트 제어기·adapter/화면 연결 구현을 시작한다. 아직 소스/테스트/네이티브 저장 완료가 아니다.
- 기준 후보 `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. 원격/로컬 기준선과 출처를 직접 대조했다.
- 이번 범위는 클라이언트와 선택 검증·문서다. `initial_practice` 구현·네이티브 호스트/SDK 설치·APK·운영 PG/TLS 연결은 섞지 않는다.
- 직접 점검/향후 실행 증거: `VALIDATION_STATUS.md` §I. 최신 위치/완료·검증·막힌 부분/다음 행동은 `MOBILE_APP_HANDOFF.md`를 따른다.

### MOBILE-05 경계 설계 완료 체크포인트 — 2026-10-02

- 설계 완료: `MOBILE_GUEST_START_BRIEF.md`. 기존 게스트 API/모바일 전송·제어기/팩 캐시를 재사용하며 저장 확인 전 학습 차단, 발급 pending·동일 사용자 재실행·만료/401·저장/응답 유실·화면 종료 경계를 정의했다.
- 구현 상태: 클라이언트 제어기·인증 화면·네이티브 adapter는 미구현이다. 설계 완료를 실제 안전한 토큰 저장/Android 성공으로 승격하지 않는다.
- 승인 상태: 온라인·유효 토큰 내 재실행과 `initial_practice` 방향 승인. canonical 계약/코드/키 수명/schema/채점/복구는 이번에 변경하지 않았다.
- 직접 문서/원문/변경 범위 점검: `VALIDATION_STATUS.md` §H. 런타임·빌드·DB·기기 실행 없음. 기존 환경/검수/기기 비완료 경계를 유지한다.
- 다음 행동 하나: MOBILE-05 클라이언트 게스트 준비 제어기·adapter 경계·모바일 진입 연결 구현과 선택 검증. API 보완/APK 작업은 동시에 시작하지 않는다.
- 최신 인계는 `MOBILE_APP_HANDOFF.md`다. main 병합·독립 리뷰·출시·CLOSED를 선언하지 않는다.

### 첫 시연 범위 승인·MOBILE-05 착수 체크포인트 — 2026-10-02

- 사용자 직접 응답 (2026-10-02T21:10:42+09:00) “승인”: 온라인·유효 토큰 내 재실행 첫 시연 한정과 `initial_practice` 보완 방향 승인.
- 승인/구현을 구분한다. canonical API·소스·테스트·schema/migration은 이번 중간 저장에서 변경하지 않는다.
- 기존 MOBILE-04/다운로드/캐시 코드를 재사용하는 MOBILE-05 최초 게스트·보안 저장 설계에 착수한다. 클라이언트/네이티브 보안 저장 구현 완료가 아니다.
- 기존 Android/PG/HTTPS·독립 콘텐츠 검수·실기기 미완료 경계를 유지한다.
- 승인 근거: `ANDROID_VI_DEMO_ASSESSMENT.md` §0 / `MOBILE_APP_BRIEF.md` §10. 직접 점검: `VALIDATION_STATUS.md` §H. 최신 인계: `MOBILE_APP_HANDOFF.md`.
- 다음 행동 하나: MOBILE-05 게스트 첫 시작·보안 저장 경계 설계를 마무리한다.

### Android 베트남어 첫 시연 평가 체크포인트 — 2026-10-02

- 사용자 여섯 단계 목표를 평가 기준 `661fa16edbf2cbde0ec9872f311247306c46828f`와 직접 대조했다. 이전 MOBILE-04는 안전한 저장 지점에 있었고 미저장 작업이 없었다.
- 설치 가능한 Android 앱·실제 검수 팩·본문 읽기·단원 학습/제출/피드백·인증/PG/진도 연결 및 실기기 완주는 아직 미완료. 구현된 UI/캐시/HTTP/게스트 서버는 재사용한다.
- 기존 VI 설명/예문/QUIZ는 서비스 전 검수 조건이 남아 있다. `human_reviewed=true` 표기나 문서 정합성만으로 검수 완료를 선언하지 않는다.
- 현재 환경은 Node 검증 가능, APK 빌드 도구/프로젝트·실제 PG/HTTPS 호스트·기기는 미연결/미확인. 환경 확보가 기간 추정의 전제다.
- 최초 QUIZ 제공은 `start_explicit_study.initial_practice` 보완안으로 제안/미승인 상태다. 정식 PRE_MADE EXAMPLE 응답은 보존한다.
- 구성/상태표/35–65시간의 조건부 추정/변경 경계는 `ANDROID_VI_DEMO_ASSESSMENT.md`. 이는 AI 제안이며 새 아키텍처/API/schema 변경을 승인받은 것으로 기록하지 않는다.
- 이번에는 문서만 변경했다. 런타임/빌드/PG/기기 재실행 없음 (`VALIDATION_STATUS.md` §G). 이전 §F의 검증 경계를 보존한다.
- 다음 행동 하나: 모바일 보안 저장소 경계와 최초 게스트 시작 흐름을 설계한다 (MOBILE-05). 최신 인계: `MOBILE_APP_HANDOFF.md`.

### MOBILE-04 작업 브랜치 체크포인트 — 2026-10-01

- 최신 지시: 2026-10-01T21:29:43+09:00 “오케이. 그 다음은?”. 이전 다음 설계를 확인하고 AI가 게스트 서버 빌드를 선택했다.
- 입력 없는 `POST /auth/guest`·기존 GUEST users INSERT·HS256 토큰·서명/만료/현재 계정 확인·PG 호스트 factory 구현 완료.
- 선택 자동 검증·모바일 빌드 통과. 실제 HTTP/crypto와 기존 앱 전송을 사용했고 저장 fixture는 합성이다. 증거는 `VALIDATION_STATUS.md` §F가 소유한다.
- 기본 CLI는 미연결 503. 명시 PG 호스트 모듈·서명 키·기존 PG 환경이 있어야 실제 연결되며 이번에 운영 연결을 실행하지 않았다.
- 모바일 보안 저장·자동 게스트 시작·갱신/복구·계정 전환·실제 DB/TLS·동일 출처 라우팅: 미구현/미확인.
- 기존 엔진/전송/학습 API·DB schema/migration·Validation 판정 규칙 유지. 실제 팩/콘텐츠·기기/대용량·APK·공급자·Pilot/학습 효과와 이전 lifecycle 대기는 유지한다.
- 다음 행동 하나: 모바일 보안 저장소 경계와 최초 게스트 시작 흐름을 설계한다 (MOBILE-05).
- 상세 연결: `GUEST_AUTH_BRIEF.md`. 최신 코드·원격 저장: `MOBILE_APP_HANDOFF.md`.
- 아래 MOBILE-03의 당시 인증/사용자 저장 미구현 기록은 이번 서버 코드 범위에서만 갱신된다. main 반영·출시·독립 리뷰·CLOSED는 선언하지 않는다.

### MOBILE-03 작업 브랜치 체크포인트 — 2026-10-01

- 최신 사용자 지시: 2026-10-01T14:47:29+09:00 제작 계속. AI가 기존 HTTP/엔진 전송 사이의 서버 어댑터를 다음 항목으로 선택했다.
- 두 POST 경로·검증된 사용자 주입·요청/시간 제한·공개 오류 매핑·capacity 표식 보존의 코드 후보 구현 완료.
- 선택 자동 검증·모바일 빌드 통과. 실제 HTTP 소켓과 기존 클라이언트 경계 검증이며 상세 증거는 `VALIDATION_STATUS.md` §E가 소유한다.
- 인증 callback과 학습 전송은 호스트가 주입한다. CLI 기본 미연결 모드는 503이며 DB 호출을 하지 않는다.
- 실제 인증 발급·사용자 저장·DB 배포·정적 앱과 동일 출처 라우팅·나머지 세 API: 미구현/후속 작업.
- 기존 in-process 명시적 학습은 Progress 갱신만 반환한다. §10.1 EXPLANATION 전체 응답 완료를 선언하지 않는다.
- MOBILE-01/02 휴대폰 화면·터치·실제 팩·대용량 성능·APK·실제 공급자·학습 효과 비완료 경계를 유지한다.
- 기존 엔진·전송·Tier A·API 계약·DB·Validation 판정 규칙 유지. main 병합·독립 리뷰·CLOSED·출시를 선언하지 않는다.
- 다음 행동 하나: 기존 users schema와 `/auth/guest` 계약을 확인해 MOBILE-04 게스트 인증 발급 연결을 설계한다.
- 연결 안내: `LEARNING_API_SERVER_BRIEF.md`. 최신 코드·저장 위치: `MOBILE_APP_HANDOFF.md`.

### MOBILE-02 작업 브랜치 체크포인트 — 2026-10-01

- 최신 사용자 지정 기능: 작은 지원 목록, 나라·언어 확인 팝업 하나, 예상 용량·Wi-Fi 권장 안내.
- 코드 후보: 명시적 선택 다운로드, 크기·SHA-256 검증, 캐시의 원자적 저장, 설치 후 선택 언어로 새 세션 진입 구현 완료.
- 초기 언어팩 본문 다운로드 없음. 팩 다운로드·검증·저장 실패는 학습으로 넘어가지 않는다.
- 같은 버전 재사용·재실행 복구·취소·중복 요청 방지·언어 변경 시 대화 확인 초기화 구현 완료.
- 자동 검증·빌드: 통과. 상세 증거는 `VALIDATION_STATUS.md` §D가 소유한다.
- 미리보기: 예시 목록·용량과 가상 다운로드. 실제 팩 배포 지원이나 용량 검증으로 취급하지 않는다.
- 실제 팩 파일·배포 목록·정확한 용량·콘텐츠 연결: 미완료/미확인 (`LANGUAGE_PACK_DOWNLOAD_BRIEF.md`).
- MOBILE-01 시각 검증, 실제 브라우저·휴대폰 터치·대용량 성능·APK·인증/서버: 미확인 또는 후속 작업.
- 기존 엔진·API·DB·Validation 규칙 및 기존 준비/비완료 경계를 보존한다. 전체 앱 완성·출시·CLOSED를 선언하지 않는다.

### MOBILE-01 작업 브랜치 체크포인트 — 2026-10-01

- 사용자 앱 제작 착수 지시를 확인하고 작업 브랜치를 준비했다.
- 작업 브랜치: `development/mobile-01-session-ui-20261001`.
- 기준 `main`: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 모바일 화면·HTTP 연결 경계: 코드 후보 구현 완료 (`MOBILE_APP_BRIEF.md`).
- 자동 검증: 통과, 상세 증거는 `VALIDATION_STATUS.md` §C가 소유한다.
- 동일 MOBILE-01 검증 준비: 단일 HTML 미리보기 생성·합성 모드 고정·수동 화면 확인 안내 구현 완료.
- 추가 자동 검증·빌드: 통과, 상세 증거는 `VALIDATION_STATUS.md` §C.2가 소유한다.
- 다운로드 파일은 화면 검증용 합성 미리보기이며 설치 앱·실제 학습 서버 연결을 뜻하지 않는다.
- 실제 브라우저·휴대폰 화면 표시: 환경 제한으로 미확인.
- 전체 앱·실제 서버·실제 AI·Android 설치 패키지 완료와 lifecycle CLOSED는 선언하지 않는다.
- 이 추가 기록은 아래 기존 서버·검증·제품 준비 상태를 완료로 승격하지 않는다.

### 서버·제품 준비 기준선 (보존)

- Backend runtime: partial implementation
- Actual provider: incomplete
- Evidence Foundation overall: incomplete
- VI pilot: not started
- VI Empirical Pilot P1 governance prerequisites B-4 (cost/operational stop conditions) and B-5 (approval-provenance scope) are complete as bounded documentation prerequisites (main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`). Implementation/data prerequisite B-1 (assignment/session lifecycle writer) is complete as a bounded prerequisite (B-1a main `d785abfc74a669cbc472ff24df9869874a165ecb`; B-1b main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). Data prerequisite B-2 (VI pilot content manifest) is complete as a bounded prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`). B-3 (human-data/privacy owner decision) remains unresolved, and P1 remains not started / not activated / still not eligible to activate.
- P1 / B-3 gate precision (current): B-1 and B-2 are complete bounded prerequisites; B-4/B-5 are complete bounded governance prerequisites; B-3 is the only unresolved item in the named B-1…B-5 sequence. The current `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §20.2 owner-decision register contains OWNER-APPROVED B-3 policy decisions, but B-3 completion itself remains UNRESOLVED because existing unresolved findings/semantics remain open, including F1–F4, M-new-1, and `VI_EMPIRICAL_PILOT_SPEC.md` §14 completion/N/A semantics. B-3 is not the sole P1 activation condition: the Pilot Spec remains Proposed; pilot manifests remain `approved_for_pilot=false`; canonical pre-P1 instrumentation requirements include Pilot Spec approval, which is still required before n=1~3 instrumentation; and P1 activation is a separate explicit decision. P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; learning efficacy remains NOT VERIFIED.
- Runtime Foundation B1 RAW_SOURCE and METRIC_RESULT / Retention v1 are accepted closed implementation milestones, but they do not make Evidence Foundation complete or establish product efficacy.
- METRIC_RESULT / Unseen Transfer v2 Tier C documentation is canonical and closed. Its runtime (main `1de6dec26d9da3122c0d1335938af6edadf5883f`) is now `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`). This supersedes the earlier statement here that the runtime remained not authorized, not implemented, and not validated, which was accurate at the prior status snapshot `777f8d7dd94b9d6b5be574d6d83194688e5efaba`. This bounded closure does not make Evidence Foundation complete, does not establish product efficacy or Actual-provider validation, and does not change Beta readiness.
- ITEM Lineage-Authority Writer Correction (main `77db80d97f25c9394cd04ad08801d85580f006dd`): lifecycle `CLOSED` by Control Tower adjudication. This bounded correction does not make Evidence Foundation complete, does not establish product efficacy, and does not change Beta readiness.
- BIGINT writer source-authority runtime (main `8934ccee7931b79ddc544af08dceffc97a0d7b32`): INDEPENDENTLY REVIEWED — APPROVE WITH NON-BLOCKING NOTES / CANONICAL IMPLEMENTATION ON MAIN / POST-INTEGRATION WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED. This bounded correction does not make Evidence Foundation complete, does not establish product efficacy, and does not change Beta readiness.
- Client/user app: incomplete
- Beta readiness: not ready

## 4. Deferred Boundaries

- Evidence recorder orchestration
- Learning Flow/Public evidence integration
- production/evidence dual-write
- assignment-level terminalization beyond B-1b (`MISSING` / `TECHNICAL_FAILURE` / `WITHDRAWN` / `UNSCORABLE` / `NORMAL_EMPTY`)
- assignment_type-specific terminal rules
- reschedule / broader retry lifecycle
- human/AI-assisted evidence rating
- actual provider
- raw audio/acoustic processing
- ITEM writer review notes `F-IR-01`–`F-IR-04` and `N-IR-S1`, Unseen Transfer v2 Runtime review notes `IR-NB-01`–`IR-NB-03`, status-sync notes `IR-SS-01`–`IR-SS-05`, and review-record notes `IR-RR-01`–`IR-RR-02` (non-blocking; preserved unchanged) and any historical stored `resolved_item_lineage` learner/human data inspection (UNKNOWN / NOT INSPECTED; requires separate explicit authorization)
- `Q28`/`Q29` wording (BLOCKED FOR Q28/Q29 WORDING; not resolved)
- BIGINT follow-up notes `F-BIGINT-IR-01`–`06` and review-record notes `F-BIGINT-RR-01`–`03` (non-blocking; future bounded canonical wording cleanup or test hardening) and any BIGINT historical-data inspection/remediation (requires separate explicit authorization under D5)
- P1/P2 human-data operation approval
- product UI/release completion

## 5. Explicit Non-Declarations

- AC-017 CLOSED
- AC-017 IMPLEMENTED
- AC-018 CLOSED
- AC-018 IMPLEMENTED
- Validation Level 3 §10 overall PASS
- actual-provider milestone complete
- Evidence Foundation overall complete
- VI pilot efficacy verified
- Beta Release ready
- user app complete
- VI Empirical Pilot P1 activated
- human-data collection approved
- any of `F-BIGINT-IR-01` through `F-BIGINT-IR-06` closed or reclassified
- BIGINT historical-data inspection or remediation performed, or declared unnecessary
- project-wide closure
- B-3 resolved
- Pilot Spec approved, or any manifest `approved_for_pilot=true`
- Actual-provider validation established
- any of `F-IR-01`–`F-IR-04`, `N-IR-S1`, `IR-NB-01`–`IR-NB-03`, `IR-SS-01`–`IR-SS-05`, or `IR-RR-01`–`IR-RR-02` closed or reclassified
- historical stored `resolved_item_lineage` learner/human data inspected, or declared valid/invalid or in need of migration/repair/backfill
- tests or PostgreSQL run by this documentation-only status/roadmap synchronization

Accordingly: the BIGINT writer source-authority runtime is independently reviewed (APPROVE WITH NON-BLOCKING NOTES), canonically integrated on main as `8934ccee7931b79ddc544af08dceffc97a0d7b32`, freshly post-integration validated on Windows-local PostgreSQL 17.10, review-recorded in backlog revision `1.78` (`777f8d7dd94b9d6b5be574d6d83194688e5efaba`), and its bounded lifecycle is CLOSED; `F-R02` is CLOSED — CORRECTED within its cited ordinal domain; `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING; historical data remains UNKNOWN / NOT INSPECTED; P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; efficacy remains NOT VERIFIED.

Likewise: the ITEM Lineage-Authority Writer Correction lifecycle is `CLOSED`, and the `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation lifecycle is `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`, bounded to that lifecycle only. Tests and PostgreSQL for this synchronization: NOT RUN — DOCUMENTATION-ONLY STATUS/ROADMAP SYNC.

### 5.1 Next Action

현재 다음 행동 하나: Node 지원 버전 선언과 잠금 의존성의 최소 버전 불일치(CP-IP-01)를 한 작업으로 보완한다. 401 안내 보존(CP-IP-04)·재리뷰·main 병합은 별도 후속으로 남긴다.
MOBILE-01/02의 허용된 휴대폰 환경에서의 화면·팝업·취소·언어 전환 검증은 별도 대기 항목이다.
작업 범위·승인 근거는 `MOBILE_APP_BRIEF.md` §10, 세션 인계는 `MOBILE_APP_HANDOFF.md`를 따른다.

#### 제작 착수 전 다음 행동 기록 (보존)

No bounded implementation milestone is currently active. Return to Control Tower for post-sync milestone selection. This applies only after this three-file post-closure roadmap/status synchronization candidate (branch `validation/post-closure-status-roadmap-sync-20260923`, parent `d41829f4d6f71d78cdbda80b96ee7af41e44a715`) has had a fresh, separate Independent Review and has been integrated onto main.

The earlier Next Action here was a read-only METRIC_RESULT / Unseen Transfer v2 Runtime implementation-readiness re-pre-analysis. It is fulfilled and superseded, so it is no longer a current action. This document does not select or start any next milestone. It does not authorize Development, Research execution, P1 activation, or human-data collection.

## 6. Historical Snapshot — 2026-07-06

> The following subsections are the original 2026-07-06 project status snapshot, preserved unchanged in content. Only heading levels/numbers were renumbered to nest under this section; no historical fact, figure, or decision was deleted or rewritten. Current implementation state and product readiness live in §0–§5 above.

### 6.0 LLE(Language Learning Engine) 공식 현황판

> 이 문서는 새로운 세션에서 프로젝트를 빠르게 이어가기 위한 **공식 현황 문서**다. 다른 어떤 문서보다 먼저 이 문서를 읽는다. 모든 산출물은 실제 파일로 존재하며, 이 대화 기록에 의존하지 않는다.
>
> (Historical framing note: as of this reconciliation, §0–§5 above are the current authority; this §6.0 blockquote is preserved as the original 2026-07-06 framing.)

### 6.1 현재 프로젝트 버전

**LLE Core Standard v1.0 — Frozen (2026-07-06 사용자 승인 완료)**

Tier A(Core Standard) 12개 문서가 공식적으로 확정됐다. Language Pack(Tier B)은 언어별로 별도 버전을 가지며 Core Standard 버전과 독립적으로 계속 진화한다(4장 참고).

---

### 6.2 현재 완료된 Tier

| Tier | 상태 | 요약 |
|---|---|---|
| **Tier 0**(철학) | **완료** | PROJECT_VISION, LEARNING_THEORY — 프로젝트 존재 이유와 학습 이론적 기반 |
| **Tier A**(Core Standard) | **완료 — v1.0 Frozen** | 12개 문서, 4개 유형론적 언어(VI/EN/JA/ZH) + Pinyin 스트레스 테스트로 검증 완료 |
| **Tier B**(Language Pack) | **4개 언어 완료, 계속 확장 가능(Controlled Open)** | VI/EN/JA/ZH, 전부 LANGUAGE_PACK_STANDARD 표준 템플릿 준수 |
| **Tier C**(구현) | **부분 완료 — MVP 수준** | Engine 계약·API 계약은 정의됐으나, 실제 프로덕션 구현 지시서는 MVP 브리프 수준에 머물러 있음 |
| **Tier D**(콘텐츠) | **구조만 완료 — 실 데이터는 초기 단계** | 4개 언어 모두 컨테이너 문서 존재, 완성된 Content는 VI 2개·EN 2개 노드 분량뿐 |

---

### 6.3 현재 완료된 핵심 문서 목록

#### Tier 0
- `PROJECT_VISION.md`
- `LEARNING_THEORY.md` (v1.2)

#### Tier A (Core Standard v1.0, Frozen)
- `LEARNING_PROTOCOL.md` (v1.0)
- `CONCEPT_SCHEMA.md` (v1.5)
- `GRAMMAR_SCHEMA.md` (v1.6)
- `GRAMMAR_GRAPH.md` (v1.4)
- `IDENTIFIER_STANDARD.md` (v1.10)
- `VALIDATION_FRAMEWORK.md` (v1.1)
- `CONTENT_SCHEMA.md` (v1.0)
- `PROGRESS_SCHEMA.md` (v1.0)
- `VOCABULARY_SCHEMA.md` (v1.0)
- `LANGUAGE_PACK_STANDARD.md` (v1.0)

#### Tier B (Language Pack)
- `VI_LANGUAGE_PACK.md` (v1.2)
- `EN_LANGUAGE_PACK.md` (v1.2)
- `JA_LANGUAGE_PACK.md` (v1.0)
- `ZH_LANGUAGE_PACK.md` (v1.0)

#### Tier C (구현)
- `ENGINE_INTERFACE.md` (v1.4)
- `API_CONTRACT.md` (v1.1)
- `IMPLEMENTATION_BRIEF_v0.2.md`
- `MIGRATION_GUIDE.md` (v1.0)

#### Tier D (콘텐츠)
- `VI_CONTENT.md` / `EN_CONTENT.md` / `JA_CONTENT.md` / `ZH_CONTENT.md`

#### 검증·종합 보고서 (횡단 문서)
- `VALIDATION_REPORT_VI_v1.0.md`, `VALIDATION_REPORT_VI_v1.1.md`
- `VALIDATION_REPORT_EN_v1.0.md`
- `VALIDATION_REPORT_ZH_v1.0.md`(JA는 별도 보고서 없이 설계 단계에서 선제 해소)
- `LANGUAGE_VALIDATION_SUMMARY_V1.md` (v1.3)
- `PINYIN_NORMALIZATION_STRESS_TEST.md` (v1.0)
- `CORE_STANDARD_V1_FREEZE.md` (v1.1, **승인 완료**)

---

### 6.4 현재 완료된 Language Pack

| 언어 | 버전 | Grammar Node | Concept 사용 | 신규 Concept | Level 0~2 검증 |
|---|---|---|---|---|---|
| VI(고립어) | v1.2 | 24 | 20 | 2건(PRAGMATICS Category+WHQUESTION) | PASS |
| EN(분석어) | v1.2 | 21 | 19 | 1건(PARTITIVE) | PASS |
| JA(교착어) | v1.0 | 19 | 18 | 0건 | PASS |
| ZH(고립어+성조+한자) | v1.0 | 21 | 19 | 0건 | PASS |

Concept 총 21개, Category 10개. 신규 Concept 필요 건수 추세: **2→1→0→0**(수렴 중, Controlled Open 유지, Frozen까지 1개 언어 부족).

---

### 6.5 아직 남아있는 작업

**Tier A 관련(Controlled Open 항목, Freeze 대상 아님)**
- Concept 목록 Frozen 격상 — 다섯 번째 언어에서 재확인 필요
- Auxiliary+Pattern·Structure-only SLUG 규칙의 사례 다양성 부족(둘 다 지금까지 사례가 편중됨)
- "복수형(Number/Plural)" Concept 공백 — 필요성 미확인

**Tier B 관련(각 언어팩 v1.1+ 이월 항목)**
- VI: vừa mới/đã từng(과거 뉘앙스 확장)
- EN: must(ALTERNATIVE), be going to/used to/have been V-ing
- JA: 가능형 활용(食べられる, ALTERNATIVE 후보), と/ば/なら, する/来る 불규칙, 완료상 세분화
- ZH: 会의 능력 표현 이중 기능(ALTERNATIVE), 把구문, 방향보어, 양사 어휘 확장

**Tier C 관련**
- `(TBD)` Content의 API 계약상 상태 정의(empty_result 처리 권장, 미확정)
- MVP 브리프 수준을 넘어선 전체 프로덕션 Engine 구현 지시서 작성

**Tier D 관련**
- 4개 언어 전부 대부분의 Content 본문이 `(TBD)` — 실제 콘텐츠 제작 착수 필요
- Vocabulary `features` 필드의 실제 Content 운영 단계 검증

**그 외**
- Level 3(Learning Effect Validation)·Level 4(Human Validation) — 실제 파일럿 학습자 데이터 필요, 아직 범위 밖
- 다섯 번째 Language Pack 착수 여부

---

### 6.6 현재 승인 완료된 사항

- **LLE Core Standard v1.0 Freeze**(2026-07-06, `CORE_STANDARD_V1_FREEZE.md` v1.1)
- VI/EN/JA/ZH 4개 Language Pack의 Level 0~2 Acceptance
- Pinyin Normalization 규칙 — Experimental → **Frozen(언어 특정)** 승격
- Vocabulary `features` 예약 필드 — Experimental → Controlled Open 승격
- PRAGMATICS Category 신설(Tier C, VI), `CONCEPT_MOOD_WHQUESTION`(Tier B, VI), `CONCEPT_QUANTITY_PARTITIVE`(Tier B, EN)
- Content/Progress를 GRAMMAR_SCHEMA에서 분리해 각각 CONTENT_SCHEMA·PROGRESS_SCHEMA로 독립(4축 SSOT: Grammar/Vocabulary/Content/Progress)
- Structure-only SLUG 규칙, Auxiliary+Pattern 규칙(형태소 결합 순서 일반화 포함) 공식화
- `get_due_reviews` API 추가(API_CONTRACT v1.1)

---

### 6.7 현재 Pending 항목

| # | 항목 | 우선순위 |
|---|---|---|
| 1 | Concept 목록 Frozen 격상 여부(5번째 언어 필요) | 중 |
| 2 | Auxiliary+Pattern·Structure-only SLUG 사례 다양성 확보 | 중 |
| 3 | Number/Plural Concept 공백 필요성 확인 | 낮음 |
| 4 | `(TBD)` Content의 API 계약 상태 정의 | 낮음 |
| 5 | 각 언어팩 v1.1+ 이월 항목(5장 참고) | 낮음, Language Pack 수준 |
| 6 | Tier D 콘텐츠 실제 제작 | 높음(다음 단계로 유력) |
| 7 | Tier C 전체 프로덕션 구현 지시서화 | 높음(다음 단계로 유력) |

---

### 6.8 다음 작업 우선순위 (제안, 사용자 결정 필요) — historical

> 이 목록은 2026-07-06 시점 제안이며 historical 참고용이다. 현재 방향은 `PROJECT_MASTER_INDEX.md`의 Current Active Milestone / Next Product Milestone Candidate를 따른다.

1. **Tier D 콘텐츠 제작 착수** — 구조는 완성됐으나 실 데이터가 거의 없다. VI부터 실제 학습 콘텐츠(설명·예문·QUIZ 등)를 채우면 나머지 Tier가 실제로 쓰일 수 있는 상태가 된다.
2. **Tier C 구현 지시서 확장** — MVP 브리프를 넘어 실제 프로덕션 Engine 구현으로 이어지는 문서화.
3. **다섯 번째 Language Pack** — Concept Frozen 격상의 마지막 근거를 확보.
4. **Level 3 파일럿 준비** — 실제 학습자 데이터를 수집할 최소 환경 논의.

이 순서는 권고일 뿐이며, 다음 세션에서 사용자가 우선순위를 재조정할 수 있다.

---

### 6.9 새 세션 시작 시 반드시 알아야 하는 사항

- **역할**: Claude는 이 프로젝트에서 Chief Software Architect다. **코드를 작성하지 않는다.** 실제 구현은 별도 Development 프로젝트/도구(Claude Code 등)의 몫이며, Architecture 세션은 설계 문서만 다룬다.
- **산출물의 위치**: 모든 결정과 구조는 대화가 아니라 `/mnt/user-data/outputs/`의 실제 마크다운 파일에 있다. 새 세션에서는 이 파일들(특히 본 문서와 Tier A 12개)을 먼저 확인한다.
- **문서 계층**: Tier 0(철학) → Tier A(Core Standard, Frozen) → Tier B(Language Pack) → Tier C(구현) → Tier D(콘텐츠). 상위 Tier가 하위 Tier에 대해 항상 최종 권위를 갖는다.
- **Freeze 거버넌스**: Tier A 문서를 변경하려면 `CORE_STANDARD_V1_FREEZE.md` §5의 절차(근거 문서화 → 대안 비교 → 명시적 승인 → 개정 이력·MIGRATION_GUIDE 기록)를 따른다. Tier B/C/D는 기존처럼 유연하게 확장 가능하다.
- **의사결정 스타일**: 불확실하거나 프로젝트 전체에 영향을 주는 결정은 독단적으로 내리지 않고 대안을 비교해 승인을 받은 뒤 진행한다. 이 원칙은 Freeze 이후에도 그대로 유지된다.
- **이 문서 자체가 살아있는 문서**: 작업이 진행될 때마다 이 문서(특히 5·6·7·8장, 현재는 §6.5·6.6·6.7·6.8)를 갱신하는 것이 프로젝트 관리의 일부였다. 현재는 §0–§5가 이 갱신 책임을 진다.

---

### 6.10 마지막 업데이트

**2026-07-06** — LLE Core Standard v1.0 Freeze 승인 직후 최초 작성.
