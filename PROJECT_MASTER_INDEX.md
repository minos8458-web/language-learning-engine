# PROJECT_MASTER_INDEX.md

# Language Learning Engine (LLE)

## Role of This Document

**Project Position / Roadmap Authority.** This index carries only a commit-pinned validation summary for roadmap orientation; `VALIDATION_STATUS.md` remains the sole Validation State Authority and owns the detailed acceptance mapping. `PROJECT_STATUS.md` remains the sole Current Implementation State and Product Readiness Authority.

## Source of Truth

1.  PROJECT_VISION.md
2.  IMPLEMENTATION_NOTES.md
3.  VALIDATION_LEVEL3.md
4.  ARCHITECTURE_CLARIFICATION_BACKLOG.md

## Ledger Snapshot Identity

This document is pinned to the following identities. Git ref, runtime-validated implementation, independent review target, and review-record commit are separate authorities and are not merged into a single "current implementation SHA".

- **Ledger snapshot baseline**: `d41829f4d6f71d78cdbda80b96ee7af41e44a715` — the exact `origin/main` baseline (subject `Record Unseen v2 runtime lifecycle closure`) from which this three-file post-closure roadmap/status synchronization candidate is prepared. The prior ledger snapshot baseline `777f8d7dd94b9d6b5be574d6d83194688e5efaba` (BIGINT Runtime closure synchronization) is superseded as the current snapshot and preserved as history.
- **Current GitHub Main**: `GitHub refs/heads/main` is the authority for current repository HEAD. No hard-coded SHA in this document replaces that ref.
- **Runtime Foundation B1 accepted implementation**: `6bb2bccd5abef2d10839706ffdd000285b59512d` — RAW_SOURCE rebuild runtime, independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed. Detailed validation evidence is owned by `VALIDATION_STATUS.md`.
- **Latest accepted integrated runtime-validation milestone**: `1de6dec26d9da3122c0d1335938af6edadf5883f` — `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation, bounded lifecycle `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`). This `CLOSED` is bounded to that Runtime implementation lifecycle only and is not project-wide closure. Detailed validation evidence is owned by `VALIDATION_STATUS.md` (§A.18).
- **Prior accepted integrated runtime milestone, preserved**: `77db80d97f25c9394cd04ad08801d85580f006dd` — ITEM Lineage-Authority Writer Correction runtime integration; lifecycle `CLOSED` by Control Tower adjudication (closure-sync integration `7ef696879e60956bfab649af74f5b8bbc05453c6`; post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`). No Backlog review-record revision is recorded for this lifecycle. Detailed evidence is owned by `VALIDATION_STATUS.md` (§A.17).
- **Prior accepted integrated runtime-validation milestone, preserved**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` — BIGINT writer source-authority runtime, independently reviewed, canonical on main, post-integration Windows-local PostgreSQL 17.10 verified, validated, review-recorded (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78`), and closed. It was the latest accepted integrated runtime-validation milestone at the prior ledger snapshot `777f8d7dd94b9d6b5be574d6d83194688e5efaba`.
- **Prior accepted integrated runtime-validation milestone, preserved**: `22508147625090af84af141ac0ec574792369115` — METRIC_RESULT / Retention v1 runtime, independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed.
- **Production finalization implementation**: `674bd9fb46bd1d799293c0e73984672b57c8a98c` — the commit that implemented the Evidence Foundation P0 bounded finalization writer.
- **Current canonical contract context**: `API_CONTRACT.md` revision `1.31` (blob `e60afa6bda3356051c24b36a823fb325761b9b42`) and `EVIDENCE_FOUNDATION_P0_SCHEMA.md` revision `1.10` (blob `de244476e56dfcab59dcd899a25091a2b1452e31`).
- **BIGINT writer source-authority runtime — reviewed candidate**: `303e1af9aa2c32167e7caf66527b5020bbacf882`, parent `2034d1a01e58a36762750156df1fd63c8e77ba9c`, on `validation/bigint-writer-source-authority-runtime-20260912` — prior candidate Independent Validation PASS; Independent Review APPROVE WITH NON-BLOCKING NOTES, integration ELIGIBLE.
- **BIGINT writer source-authority runtime — canonical implementation on main**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` (parent `a72c4a73ca711fd4fb191f43028d855ecd64e2b3`) — POST-INTEGRATION VALIDATION PASS on Windows-local PostgreSQL 17.10; REVIEW-RECORDED / CLOSED. Detailed validation evidence is owned by `VALIDATION_STATUS.md`.
- **Current runtime implementation review record**: `4b86a440544a40e9195d6a6437f9f2256a92e9e3` — `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.80` (blob `02648bb9c672a3629d626a0da81da004eb935994`), recording the METRIC_RESULT Unseen Transfer v2 Runtime implementation lifecycle; review-record candidate `c793bf5a04c0937414d385e70c35994462f13bbb` independently reviewed APPROVE WITH NON-BLOCKING NOTES, blocking `0`, before integration to main.
- **Prior runtime implementation review record, preserved**: `777f8d7dd94b9d6b5be574d6d83194688e5efaba` — `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78` (blob `5a9f2e43527a72355b99838cd37a820c376af6c1`), recording the BIGINT writer source-authority Runtime implementation lifecycle; independently reviewed APPROVE WITH NON-BLOCKING NOTES, ELIGIBLE, before fast-forward integration to main.
- **Prior documentation review record, preserved**: `623eaf94328a5145adf62aaff52c6b23689d4efe` — `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77`, recording the closed BIGINT Writer/Digest/Output Representation Tier C documentation lifecycle. This record is not an Independent Review of runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882`.

## Current Project Position

-   Current Phase: Phase 2
-   Current Version: MVP v0.2
-   Current Branch: `main`
-   Evidence Foundation P0 bounded finalization writer and test hardening completed as bounded milestones.
-   Evidence Foundation overall remains incomplete.
-   VI empirical pilot has not started.
-   B-5 (approval-provenance scope) and B-4 (cost/operational stop conditions) governance prerequisites are complete as bounded documentation prerequisites (main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`).
-   B-1 (assignment/session lifecycle writer) is complete as a bounded VI Empirical Pilot P1 implementation prerequisite, composed of B-1a (evidence session lifecycle writer, main `d785abfc74a669cbc472ff24df9869874a165ecb`) and B-1b (SCORABLE assignment completion writer, main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`; canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This does not activate VI Empirical Pilot P1.
-   B-2 (Vietnamese pilot content manifest) is complete as a bounded VI Empirical Pilot P1 implementation/data prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node Grammar Node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`). This does not activate VI Empirical Pilot P1.
-   Runtime Foundation B1 RAW_SOURCE rebuild is an accepted, independently reviewed, main-integrated, post-merge validated, review-recorded, and closed bounded milestone (runtime main `6bb2bccd5abef2d10839706ffdd000285b59512d`; review-record `c224ff9cca5b28f96febca0e11a89608ef746a1d`; closure sync `bd64555ad30e5901467095e1d81002de433a02f8`).
-   METRIC_RESULT / Retention v1 runtime is an accepted, independently reviewed, main-integrated, post-merge validated, review-recorded, and closed bounded milestone (runtime main `22508147625090af84af141ac0ec574792369115`; review-record `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9`; closure `c4e452d762d70fa57db61856b37b04a16d43df92`).
-   METRIC_RESULT / Unseen Transfer v2 Tier C documentation is review-recorded and closed. Its runtime is now a separately closed bounded lifecycle (see the next bullets); the earlier statement that the runtime remained NOT AUTHORIZED / NOT IMPLEMENTED / NOT VALIDATED was accurate at the prior ledger snapshot `777f8d7dd94b9d6b5be574d6d83194688e5efaba` and is superseded.
-   ITEM Lineage-Authority Writer Correction is a completed bounded lifecycle: runtime candidate `b862bcc48a150206c6fb8eece898ab2b95ace7f3` (Independent Review APPROVE WITH NON-BLOCKING NOTES, blocking `0`), integrated on main as `77db80d97f25c9394cd04ad08801d85580f006dd`, post-merge validation PASS on actual PostgreSQL 17.10 with synthetic fixtures only, closure-record sync integrated as `7ef696879e60956bfab649af74f5b8bbc05453c6`, and lifecycle `CLOSED` by Control Tower adjudication recorded by post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`. No Backlog review-record revision is recorded for it. Migration/DDL `NONE`. `F-IR-01`–`F-IR-04` and `N-IR-S1` remain OPEN / NOTE / NON-BLOCKING; historical stored `resolved_item_lineage` learner/human data remains UNKNOWN / NOT INSPECTED.
-   METRIC_RESULT / Unseen Transfer v2 Runtime (`VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime`) is a completed bounded lifecycle: Control Tower readiness adjudication `READY` and bounded Development authorization (main `2a94396627f95b7d138e7285a64411684b0b3e3e`); runtime implementation on main `1de6dec26d9da3122c0d1335938af6edadf5883f` (cherry-pick of approved candidate `407460cea917d789dab16ad2ef57c4cce87215cf`; exactly `src/instrumentation/evidenceMetrics.js` and `tests/viP1MetricResultRuntime.test.js`; migration/DDL `NONE`); review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3` (Backlog revision `1.80`); closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`. Lifecycle: `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`, bounded to that Runtime implementation lifecycle only. `IR-NB-01`–`IR-NB-03`, `IR-SS-01`–`IR-SS-05`, and `IR-RR-01`–`IR-RR-02` are preserved unchanged; `Q28`/`Q29` remain BLOCKED FOR Q28/Q29 WORDING.
-   BIGINT Writer/Digest/Output Representation Tier C documentation is review-recorded and closed; the separate BIGINT writer source-authority runtime (reviewed candidate `303e1af9aa2c32167e7caf66527b5020bbacf882`; Independent Review APPROVE WITH NON-BLOCKING NOTES, integration ELIGIBLE) is canonically implemented on main as `8934ccee7931b79ddc544af08dceffc97a0d7b32` with POST-INTEGRATION VALIDATION PASS on Windows-local PostgreSQL 17.10. Its bounded lifecycle is INDEPENDENTLY REVIEWED — APPROVE WITH NON-BLOCKING NOTES / CANONICAL IMPLEMENTATION ON MAIN / POST-INTEGRATION WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED (review-record `777f8d7dd94b9d6b5be574d6d83194688e5efaba`, backlog revision `1.78`). `F-R02` is CLOSED — CORRECTED / INDEPENDENTLY REVIEWED / INTEGRATED / POST-INTEGRATION VALIDATED, bounded to its cited exposure-ordinal/cutoff domain; `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING. Historical data remains UNKNOWN / NOT INSPECTED.

## Last Completed Bounded Milestone

**VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime implementation lifecycle** — runtime implementation on main `1de6dec26d9da3122c0d1335938af6edadf5883f` (approved candidate `407460cea917d789dab16ad2ef57c4cce87215cf`; Independent Review APPROVE WITH NON-BLOCKING NOTES, blocking `0`, correction required NO), post-merge Windows-local PostgreSQL 17.10 validation on that exact main (prior commit-pinned evidence; see `VALIDATION_STATUS.md` §A.18), post-merge status sync `0696de9825b1cd0430aac12058196fd41c296cdb`, review-recorded in `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.80` (`4b86a440544a40e9195d6a6437f9f2256a92e9e3`), and closed by `d41829f4d6f71d78cdbda80b96ee7af41e44a715`. Bounded lifecycle disposition: `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`. This `CLOSED` is strictly bounded to that Runtime implementation lifecycle; it is not project-wide closure and does not mean P1 activated, human-data collection authorized, efficacy verified, Actual-provider validation established, Evidence Foundation overall complete, Validation Level 3 §10 overall PASS, product/Beta readiness, B-3 resolved, or Pilot Spec approved.

Prior bounded milestone, preserved: **ITEM Lineage-Authority Writer Correction lifecycle** — runtime candidate `b862bcc48a150206c6fb8eece898ab2b95ace7f3` (Independent Review APPROVE WITH NON-BLOCKING NOTES, blocking `0`, non-blocking `4`), guarded integration on main `77db80d97f25c9394cd04ad08801d85580f006dd` (tree byte-identical to the reviewed candidate), post-merge validation PASS on that exact main (prior evidence; see `VALIDATION_STATUS.md` §A.17), closure-record sync `6eb670cee319f5a273f09118b850aea223db7595` independently reviewed and integrated as `7ef696879e60956bfab649af74f5b8bbc05453c6`, lifecycle `CLOSED` by Control Tower adjudication, recorded by post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`. No Backlog review-record revision is recorded for this lifecycle. Migration/DDL `NONE`. `F-IR-01`–`F-IR-04` and `N-IR-S1` remain OPEN / NOTE / NON-BLOCKING; historical stored `resolved_item_lineage` data remains UNKNOWN / NOT INSPECTED.

Prior bounded milestone, preserved (text below is time-scoped to the prior ledger snapshot `777f8d7dd94b9d6b5be574d6d83194688e5efaba`; its statement that the closure did not authorize or implement Unseen Transfer Runtime remains true of that BIGINT closure, and the Unseen Transfer v2 Runtime was later separately authorized, implemented, validated, and closed as recorded above): **BIGINT writer source-authority Runtime implementation lifecycle** — reviewed candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` (Independent Review APPROVE WITH NON-BLOCKING NOTES, ELIGIBLE), canonical main integration `8934ccee7931b79ddc544af08dceffc97a0d7b32`, fresh post-integration Windows-local PostgreSQL 17.10 Validation PASS on that exact main, review-recorded in `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78` (`777f8d7dd94b9d6b5be574d6d83194688e5efaba`), and closed by this closure synchronization. `F-R02` is CLOSED — CORRECTED within its cited ordinal domain; `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING; historical data remains UNKNOWN / NOT INSPECTED. This closure does not authorize or implement Unseen Transfer Runtime and does not activate P1.

Prior bounded milestone, preserved: **BIGINT Writer/Digest/Output Representation Tier C documentation lifecycle** — the D1–D5 canonical clarification is integrated on main (`a8fc4d072bc1c3e070e0828794838db8e4c5d0c5`), review-recorded in `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77` (`623eaf94328a5145adf62aaff52c6b23689d4efe`), and closed by the subsequent status closure (`041a384e6221dd267ac0725704c6706bafd36513`). Canonical context is API `1.31` / Schema `1.10`. This documentation closure did not implement or validate the writer correction and did not close `F-R02`.

Prior bounded milestone, preserved: METRIC_RESULT / Retention v1 runtime — runtime main `22508147625090af84af141ac0ec574792369115`, post-merge Windows-local PostgreSQL 17.10 validation PASS, review-record `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9`, bounded closure `c4e452d762d70fa57db61856b37b04a16d43df92`.

Prior bounded milestone, preserved: Runtime Foundation B1 RAW_SOURCE rebuild — runtime main `6bb2bccd5abef2d10839706ffdd000285b59512d`, post-merge Windows-local PostgreSQL 17.10 validation PASS, review-record `c224ff9cca5b28f96febca0e11a89608ef746a1d`, bounded closure sync `bd64555ad30e5901467095e1d81002de433a02f8`.

Prior bounded milestone, preserved: B-2 pilot content manifest prerequisite completion — B-2 (Vietnamese pilot content manifest) is complete as a bounded VI Empirical Pilot P1 implementation/data prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node Grammar Node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`, review-record `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.48), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`, review-record revision 1.49), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`, review-record revision 1.50), reconciled by the B-2 completion ledger reconciliation (review-record revision 1.51). This does not declare Evidence Foundation overall complete, does not resolve B-3, and does not activate VI Empirical Pilot P1. See `VALIDATION_STATUS.md` §A.8 for the full evidence chain.

Prior bounded milestone, preserved: B-1 lifecycle prerequisite completion — B-1a (evidence session lifecycle writer: `startSession`/`terminalizeSession`/`restartSession`; main implementation `d785abfc74a669cbc472ff24df9869874a165ecb`, review-record main `08c6e0ca1c771398ae89f1d467e2bef4386eece3`) and B-1b (SCORABLE assignment completion writer; runtime implementation main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, runtime review-record main `ad0f892f6a4238eeb6ecf2581d21deaf82b87956`, canonical status-sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`, status-sync review-record main `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964`), together completing B-1 as a bounded VI Empirical Pilot P1 implementation prerequisite.

Prior bounded milestone, preserved: Evidence Foundation P0 bounded finalization writer (`674bd9fb46bd1d799293c0e73984672b57c8a98c`) and its independent test-hardening review (`30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`, verdict APPROVE WITH NON-BLOCKING NOTES, preserved finding F-L01 non-blocking).

## Last Completed Governance Milestone

**B-5/B-4 Governance Prerequisite Reconciliation** — classification: documentation-only governance milestone, complete.

B-5 (candidate `d75b518c01724059b45f6adc1a93b602c86a69c4`, main `37eb97a295df10bfd4d48ab06e13be20c85c3beb`) and B-4 (candidate `542c6b5004bbffed570aefcb1a3a858655206bb7`, main `4305eb4a3ccf294f9f35efb4a3ef1574e9c8e143`) are each complete as bounded pre-activation governance/documentation prerequisites. Their independent review record (candidate `ca31ff6486a22780aa7aedf44c3c00b8aefb26b2`, main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.41) recorded verdict **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 2 (G-N01, G-N02), **ELIGIBLE**. This milestone does not implement, close, or validate any Architecture, API, Schema, or Validation Rule, and does not activate VI Empirical Pilot P1.

## Current Active Milestone

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

### MOBILE-05 클라이언트 구현 착수 — 2026-10-02 (착수 당시 기록)

사용자 직접 지시 (2026-10-02T21:46:25+09:00) “다음작업 계속 진행해”에 따라, 최신 원격 `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`의 단일 다음 행동을 확인했다.
`MOBILE_GUEST_START_BRIEF.md` §1–10을 소비하는 게스트 준비 제어기·저장 adapter 경계·모바일 진입 구현과 선택 검증을 시작한다.
현재는 구현 착수이며 런타임/네이티브 저장/APK 완료가 아니다. 범위·세부 실행 선택은 해당 문서 §11, 직접 점검은 `VALIDATION_STATUS.md` §I, 인계는 `MOBILE_APP_HANDOFF.md`를 따른다.
기존 발급 서버·학습 제어기/전송·다운로드/캐시·API/schema/Validation 규칙을 재작성하지 않는다. 다른 API/APK 작업을 동시에 시작하지 않는다.

### MOBILE-05 게스트 첫 시작·보안 저장 경계 설계 완료 — 2026-10-02

이번 한 작업의 설계를 `MOBILE_GUEST_START_BRIEF.md`에 완료했다.
기존 발급/전송/제어기·팩 캐시를 재사용하고, empty/pending/stored 저장 경계·저장 확인 후 학습·같은 유효 게스트 재실행·만료/401/불확실 발급 처리와 구현 검증 기준을 고정했다.
클라이언트/네이티브 코드·API/schema·APK는 아직 변경하지 않았다. 설계/실행 증거를 구분하며 직접 문서 점검은 `VALIDATION_STATUS.md` §H를 따른다.
다음 행동 하나는 이 설계의 MOBILE-05 클라이언트 게스트 준비 제어기·adapter 경계·모바일 진입 연결 구현과 선택 검증이다.
`initial_practice` 방향 승인은 유효하며 정확한 계약 보완/구현은 후속 단일 작업으로 남긴다. 이전 상태·기기 검증 대기·main/lifecycle 경계를 유지한다.

### 첫 시연 범위 승인·MOBILE-05 착수 — 2026-10-02

사용자 직접 응답 (2026-10-02T21:10:42+09:00) “승인”을 직전 질문에 연결했다.
온라인 학습·유효 토큰 내 재실행과 `start_explicit_study.initial_practice` 보완 방향이 승인됐다.
계약/코드 변경과 새 운영/출시/복구 범위 승인은 아니다. 상세 승인은 `ANDROID_VI_DEMO_ASSESSMENT.md` §0 및 `MOBILE_APP_BRIEF.md` §10을 따른다.
현재 다음 행동 하나인 MOBILE-05 보안 저장·최초 게스트 흐름 설계에 착수한다.
이번 중간 체크포인트는 승인/상태 문서만 저장하며 이전 런타임 검증과 main/lifecycle 경계를 유지한다.

### Android 베트남어 첫 시연 부족분 평가 — 2026-10-02

사용자 지시 (2026-10-02T06:58:37+09:00)의 여섯 단계 목표를 최신 원격 기준선/코드/환경과 대조했다.
MOBILE-04 코드·인계는 안전하게 저장돼 있고 미저장 작업이 없었다. 이번에는 평가/상태/인계 문서만 갱신했다.
Android 설치판·실제 검수 팩·팩 본문 소비·설명/문제/제출/피드백·동일 사용자 진도/환경 연결과 실기기 검증이 남았다.
정식 PRE_MADE EXAMPLE과 최초 QUIZ 제공의 차이를 확인해 `initial_practice` 보완안을 제안/미승인으로 기록했다. 상세 분류·소량 콘텐츠·기간 추정·변경 승인 경계는 `ANDROID_VI_DEMO_ASSESSMENT.md`, 이번 직접 점검은 `VALIDATION_STATUS.md` §G를 따른다.
이전 런타임 검증을 재실행하거나 main 반영·실제 시연 성공·독립 검수·출시·CLOSED를 선언하지 않는다.
다음 행동 하나는 기존의 모바일 보안 저장소 경계와 최초 게스트 시작 흐름 설계 (MOBILE-05)다.

### MOBILE-04 — 게스트 인증·기존 사용자 저장 서버 (작업 브랜치)

2026-10-01T21:29:43+09:00 사용자의 계속 지시와 이전 다음 행동을 근거로 기존 게스트/users 계약을 확인했다.
새 UUID의 GUEST 저장·서명 토큰 발급·서명/만료/현재 GUEST 확인을 기존 HTTP 경계와 호스트에 구현했다.
합성 저장 fixture와 실제 HTTP·crypto/기존 클라이언트의 선택 자동 검증·모바일 빌드 완료.
실제 PostgreSQL·운영 키/토큰·모바일 보안 저장·갱신/복구·계정 전환·APK는 미구현/미확인이다.
상세 증거는 `VALIDATION_STATUS.md` §F, 연결은 `GUEST_AUTH_BRIEF.md`, 최신 코드/저장은 `MOBILE_APP_HANDOFF.md`를 따른다.
schema/migration·엔진/전송/학습 API·Validation 판정 규칙을 바꾸지 않았으며 main 반영·독립 리뷰·lifecycle CLOSED·출시는 선언하지 않는다.
다음 행동 하나: 모바일 보안 저장소 경계와 최초 게스트 시작 흐름을 설계한다 (MOBILE-05).
아래 MOBILE-01/02/03은 이전 체크포인트다. 당시 인증 미구현 기록은 이번 서버 코드 범위에서만 갱신되며 실제 운영/기기 비완료 경계는 유지한다.

### MOBILE-03 — 기존 학습 전송의 HTTP 서버 연결 (작업 브랜치)

2026-10-01T14:47:29+09:00 사용자의 제작 계속 지시 안에서 AI가 다음 항목을 선택했다.
기존 세션 시작·명시적 학습 시작 두 POST 경로의 서버 어댑터와 인증 검증 콜백 경계를 구현했다.
요청 크기·JSON·입력·시간 제한과 기존 오류 매핑, 실제 HTTP를 거친 클라이언트 흐름의 자동 검증·빌드를 완료했다.
상세 실행 증거는 `VALIDATION_STATUS.md` §E, 연결 방법은 `LEARNING_API_SERVER_BRIEF.md`를 따른다.
실제 인증 발급·사용자 저장·운영 DB·동일 출처 연결·EXPLANATION 콘텐츠·나머지 세 API는 미구현/미확인이다.
이전 화면 검증 대기·기존 lifecycle·main 기준선·학습 효과 비완료 경계를 유지하며 CLOSED로 바꾸지 않는다.
다음 행동 하나는 기존 users schema와 `/auth/guest` 계약을 확인해 MOBILE-04 게스트 인증 발급 연결을 설계하는 것이다.
최신 코드와 원격 저장 상태는 `MOBILE_APP_HANDOFF.md`를 따른다.

### MOBILE-02 — 사용자 지정 언어팩 선택 다운로드 (작업 브랜치)

2026-10-01T06:27:14+09:00 사용자가 다음 빌드에 나라·언어별 선택 다운로드,
확인 팝업 하나, 예상 용량과 큰 파일의 Wi-Fi 안내를 지정했다.
이 명시적 지시로 이번 클라이언트 범위를 변경했다 (`MOBILE_APP_BRIEF.md` §7).
선택 다운로드·파일 검증·기기 캐시·설치 후 언어별 세션 진입의 코드 후보와 자동 검증·빌드를 완료했다.
실제 배포용 팩·용량·목록 연결과 휴대폰 표시·터치는 미확인이다.
이전 MOBILE-01의 시각 검증 대기 상태와 모든 기존 lifecycle 경계를 유지하며 CLOSED로 바꾸지 않는다.
실행 증거는 `VALIDATION_STATUS.md` §D, 구현 설명은 `LANGUAGE_PACK_DOWNLOAD_BRIEF.md`,
최신 인계는 `MOBILE_APP_HANDOFF.md`를 따른다.

### MOBILE-01 — 모바일 세션 화면 연결 (작업 브랜치)

2026-09-30의 사용자 앱 제작 착수 지시와 2026-10-01의 계속 진행 지시에 따라,
`ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`에서
`development/mobile-01-session-ui-20261001`을 준비했다.
이전 작업은 기존 세션 제어기와 모바일 화면 연결이다. 코드 후보 구현과 자동 검증을 마쳤으며,
실제 브라우저·휴대폰 화면 검증은 환경 제한으로 미확인이다. Lifecycle CLOSED를 선언하지 않는다.
같은 작업의 검증 준비로 단일 HTML 미리보기 빌드와 수동 확인 안내를 추가했다.
준비 코드와 관련 자동 검증은 완료했으며, 실제 화면 검증은 미확인으로 유지한다.
준비 범위는 `MOBILE_APP_BRIEF.md` §6, 수동 확인 순서는 `MOBILE_SCREEN_TEST_GUIDE.md`를 따른다.
범위는 `MOBILE_APP_BRIEF.md`, 인계는 `MOBILE_APP_HANDOFF.md`를 따른다.
기존 엔진·스키마·Validation 규칙을 보존하고, 검토·종료되지 않은 기존 문서
동기화 lifecycle을 종료로 재분류하지 않는다. 앱 출시·실제 AI·학습 효과 완료를 선언하지 않는다.

### 제작 착수 전 기준선 기록 (보존)

No bounded implementation milestone is currently active. The `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation lifecycle is `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` and is recorded above as the Last Completed Bounded Milestone. The previously selected read-only Unseen Transfer v2 Runtime implementation-readiness re-pre-analysis is fulfilled and superseded (Control Tower adjudicated readiness `READY`, and the bounded Runtime lifecycle has since closed). Milestone selection returns to Control Tower; no next milestone is selected or started by this document.

## Remaining Blocking-Gap Sequence

VI Empirical Pilot P1 activation remains gated on the following implementation/data prerequisites, in addition to the completed governance prerequisites above.

**Completed:**

- **B-1** — assignment/session lifecycle writer required for pilot evidence execution (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §7, §8, §24.2). Complete as a bounded prerequisite (B-1a main `d785abfc74a669cbc472ff24df9869874a165ecb`; B-1b main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This completion does not activate VI Empirical Pilot P1.

- **B-2** — Vietnamese pilot content manifest (see `VI_EMPIRICAL_PILOT_SPEC.md` §3, §5, §6; `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §15, §24.2). Complete as a bounded prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`). This completion does not activate VI Empirical Pilot P1.

**Completed governance prerequisites:** B-4 and B-5 are complete as bounded governance prerequisites (see Last Completed Governance Milestone).

**Unresolved item in the named B-1…B-5 sequence:**

- **B-3** — human-data/privacy owner decision required before participant data collection (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §19, §24.3; `VI_EMPIRICAL_PILOT_SPEC.md` §15). B-3 decision owner designation (identity annotation only, not a `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §20.2 Parameter-register entry or edit, and not a parameter decision): the B-3 human-data/privacy decision owner is designated as 미노 (project decision owner). The earlier statement here that all B-3 policy parameters remained UNRESOLVED was time-scoped to that designation and is superseded: the current `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §20.2 owner-decision register contains OWNER-APPROVED B-3 policy decisions. B-3 completion itself nevertheless remains UNRESOLVED, because existing unresolved findings/semantics remain open, including F1–F4, M-new-1, and `VI_EMPIRICAL_PILOT_SPEC.md` §14 completion/N/A semantics. This document resolves none of them.

B-3 is the only unresolved item in the named B-1…B-5 sequence, but it is not the sole condition for P1 activation. `VI_EMPIRICAL_PILOT_SPEC.md` remains Proposed; the pilot manifests remain `approved_for_pilot=false`; canonical pre-P1 instrumentation requirements include Pilot Spec approval, which is still required before n=1~3 instrumentation; and P1 activation is a separate explicit decision. VI Empirical Pilot P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; learning efficacy remains NOT VERIFIED.

## Next Action

현재 다음 행동 하나: 최초 학습 서버 경계 구현 후보와 이번 PostgreSQL 검증 변경의 독립 리뷰를 진행한다. main 병합·UI·제출·Android 작업은 별도 후속으로 남긴다.
MOBILE-01/02의 허용된 휴대폰 환경에서의 화면·팝업·취소·언어 전환 검증은 별도 대기 항목이다.
`MOBILE_SCREEN_TEST_GUIDE.md`를 사용한다. 실제 배포 팩·콘텐츠·APK는 미완료 상태로 남긴다.
최신 사용자 범위와 다음 세션 인계는 `MOBILE_APP_BRIEF.md` §10–11 / `MOBILE_APP_HANDOFF.md`를 따른다.

### 제작 착수 전 다음 행동 기록 (보존)

Return to Control Tower for post-sync milestone selection. This applies only after this three-file post-closure roadmap/status synchronization candidate (branch `validation/post-closure-status-roadmap-sync-20260923`, parent `d41829f4d6f71d78cdbda80b96ee7af41e44a715`) has had a fresh, separate Independent Review and has been integrated onto main.

The earlier Next Action here was a read-only METRIC_RESULT / Unseen Transfer v2 Runtime implementation-readiness re-pre-analysis. It is fulfilled and superseded, so it is no longer a current action. This document does not select or start any next milestone. It does not authorize Development, Research execution, P1 activation, or human-data collection.

## Explicit Non-Declarations

This document does not declare:

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

Accordingly: the BIGINT writer source-authority runtime is independently reviewed (APPROVE WITH NON-BLOCKING NOTES), canonically implemented on main as `8934ccee7931b79ddc544af08dceffc97a0d7b32`, freshly post-integration validated on Windows-local PostgreSQL 17.10, review-recorded in backlog revision `1.78` (`777f8d7dd94b9d6b5be574d6d83194688e5efaba`), and its bounded lifecycle is CLOSED; `F-R02` is CLOSED — CORRECTED within its cited ordinal domain; `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING; historical data remains UNKNOWN / NOT INSPECTED; P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; efficacy remains NOT VERIFIED.

Likewise: the ITEM Lineage-Authority Writer Correction lifecycle is `CLOSED` (runtime main `77db80d97f25c9394cd04ad08801d85580f006dd`; post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`); the `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation lifecycle is `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (runtime `1de6dec26d9da3122c0d1335938af6edadf5883f`; review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, Backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`), bounded to that lifecycle only. Tests and PostgreSQL for this synchronization: NOT RUN — DOCUMENTATION-ONLY STATUS/ROADMAP SYNC.

## Historical Roadmap Snapshot — §9 Closure

The following subsections preserve the prior-session §9 closure snapshot of this index unchanged, moved here under their original numbers/content so their facts are not lost. Current project position, milestone, and non-declaration status live in the sections above.

### Historical Validation State (at §9 closure)

Validation Level 3 §9 is **PASS**. The current verified implementation baseline is `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`; post-merge GitHub Actions run `29874075409` passed 191 tests / 40 suites on PostgreSQL 16.14 / Node.js 20.20.2. See `VALIDATION_STATUS.md` for the authoritative acceptance mapping and full evidence chain.

### Historical Architecture Status (at §9 closure)

Architecture Frozen (approved architecture only)

### Historical Completed Closure (at §9 closure)

-   Independent Architecture Audit remediation
    -   AUD-002 (MASTERED/AUTOMATIC Temporal Stability Contract) — ✅ CLOSED
    -   AUD-003 (Graph cross-language relation traversal) — ✅ CLOSED
    -   AUD-001 (GitHub main current/historical status reconciliation) — ✅ CLOSED
    -   AUD-004 (Review Cascade producer and `record_attempt` atomicity) — ✅ CLOSED
-   Architecture Clarification prerequisite implementation
    -   AC-013 (Active-Node Admission Boundary, Progress-side prerequisite) — ✅ CLOSED
    -   AC-012 (§9 Conversation Boundary) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-014 (Learning Flow prerequisite clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-015 (Interleaving Graph metadata dependency clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-016 (`start_session` exact output payload clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
-   Validation Level 3 §9 Conversation Boundary — ✅ PASS
-   Main contains no temporary PostgreSQL validation workflow. Validation branches are retained as evidence:
    -   `vl3-section9-client-boundary-validation-20260721` at `3e7edb637f13444a51c2d181e3ac9fb7f6e57ff7`
    -   `vl3-section9-postmerge-validation-20260722` at `18a028fbf2e88aaea05e66ab450c18127691e8b3`

### Historical Known Deferred (at §9 closure)

-   Real LLM Validation
-   Conversation Engine implementation and actual UI binding remain outside Validation Level 3 §9 scope

### Historical Current Blockers (at §9 closure)

None

### Historical Current Milestone (at §9 closure)

Validation Level 3 §10 — AI Generation Validation

### Historical Next Task (at §9 closure)

1.  Execute Validation Level 3 §10 AI Generation validation.

`VALIDATION_LEVEL3.md` §10 is the next incomplete canonical milestone after §9. This closure does not start §10, create a new phase/engine/feature name, or make a Beta Release decision.

## Rule

New architectural decisions require explicit approval before
implementation.
