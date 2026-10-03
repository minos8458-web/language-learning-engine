# MOBILE_APP_HANDOFF.md

## 매 답변 체크포인트 운영 규칙

- 사용자 지시 시각: 2026-10-01T05:39:50+09:00 (Asia/Seoul).
- 사용자 직접 지시:

> 네가 언제 세션한도에 다다를지 모르니까 항상 매 답변마다 체크포인트 문서를 남기도록 해. 그래야 다른 세션에서 최신 위치에서 이어가지.

사용자에게 프로젝트 작업 결과를 답변하기 전에 이 파일을 최신 상태로 갱신하고 원격에 저장한다.
이전 상태는 Git 이력에 남긴다. 진행 변화가 없는 답변에서도 최신 요청과 직접 확인한 위치를 기록한다.
저장 후 원격 파일을 다시 읽고 확인한 뒤 답변한다. 저장 실패 시 마지막 원격 체크포인트와 실패를 명시한다.
사용자 승인, AI 제안, 이전 보고, 직접 검증 결과를 구분하며, 확인하지 못한 것은 `미확인`으로 남긴다.
새 세션의 시작 규칙은 `BOOTSTRAP.md`를 따른다.

## 현재 체크포인트

- 최신 사용자 직접 지시: 2026-10-03T22:16:33+09:00 “다음”. 실제 PostgreSQL 검증 한 작업을 수행했다.
- 저장소 `minos8458-web/language-learning-engine`, 브랜치 `development/mobile-01-session-ui-20261001`, PR #2 draft. main Source of Truth와 작업 브랜치 후보를 구분한다.
- 시작 local/remote `dc2082345f055ee9199b5a31fcc5ccb984f5e9bb`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 실제 .git/top-level/브랜치·fetch·clean·upstream 0/0·main 27/0 확인.
- 완료: 격리 PostgreSQL 16.15에서 R1 조회·중복/손상·등록 후 SQL 실패·동시 요청/멱등/capacity와 기존 Content/Generation/Progress/Flow/E2E 회귀 검증. 신규 PG 테스트와 승인 계약을 반영한 기존 Flow 정적 단언 보완. 런타임 코드는 변경하지 않았다.
- 증거 소유: VALIDATION_STATUS.md §M(이번 실제 PG), §L(기존 서버/HTTP 합성 경계), §I(MOBILE-05). 실제 PG 선택 검증 완료 / 독립 리뷰·main 통합 대기. 전체 Validation PASS/CLOSED가 아니다.
- 실행 환경: 신규 disposable cluster/합성 데이터/로컬 Unix socket만 사용; 운영 데이터 미접근. 임시 서버 종료 완료. 재현 시 독립 disposable DB를 준비하고 §M 명령을 사용한다.
- 보존: MOBILE-05, production src, db/schema/migration, API/Validation 판정 규칙. UI/제출/Android 미착수.
- 미완료: 독립 리뷰, 검수 콘텐츠/팩·DB 자산 일치, 설명/문제 UI·제출/피드백, 운영 PG/HTTPS·native adapter/APK·실기기 완주.
- 다음 행동 하나: 최초 학습 서버 경계 구현 후보와 이번 PostgreSQL 검증 변경의 독립 리뷰를 진행한다. main 병합·UI·제출·Android 작업은 별도 후속으로 남긴다.
- 최종 원격 head는 Git 이력에서 조회한다. 저장 뒤 변경 원문·tree·브랜치/PR를 재확인한다.

## 이전 체크포인트 — 서버 경계 구현 (2026-10-03, 보존)

- 최신 사용자 직접 지시: 2026-10-03T21:09:38+09:00 “ok 다음”. 승인된 최초 학습 계약의 서버 경계 구현 한 작업을 진행했다.
- 저장소 `minos8458-web/language-learning-engine`, 브랜치 `development/mobile-01-session-ui-20261001`, PR #2 open/draft/unmerged. main 권위는 그대로이며 작업 브랜치 후보를 main 구현으로 간주하지 않는다.
- 시작 local/remote `18c3f6223b4bb08641be1dc28630eb97ee8936c7`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 실제 경로/.git/top-level/브랜치·fetch·clean·upstream 0/0·main 25/0 확인.
- 완료: R1 Content 선택·서버 KO/BEGINNER 구성·Learning Flow admission→설명→QUIZ·exact 3키 응답/독립 null·손상 선택 결과 기술 실패·in-process 연결. 신규 서버 경계 검증 추가.
- 검증 소유: VALIDATION_STATUS.md §L. 구현 후보와 선택 회귀 완료, 실제 PG 검증·독립 리뷰·main 통합 대기. 기존 MOBILE-05 증거는 §I, 승인 계약 문서 증거는 §K.
- 보존: MOBILE-05 클라이언트, 기존 Progress/Generation 로직, API·schema·Validation 판정 규칙. UI/제출/Android는 이번 미착수.
- 미확인/차단: 실제 PG SQL 선택·transaction/멱등/capacity 회귀, 독립 리뷰, 검수 팩/DB 자산 일치, 설명/문제 화면·제출/피드백, native adapter/APK·운영 HTTPS·실기기 완주.
- 다음 행동 하나: 실제 PostgreSQL의 격리된 합성 fixture에서 R1 선택 제외 조건·중복·admission 멱등/capacity 및 기존 Content/Generation/Flow 회귀를 검증한다. UI·제출·Android 구현은 동시에 시작하지 않는다.
- 구현 원격 저장 확인: `4e7d14b938a732fa72ea6297faffb0ae7408db7d`, tree `5285960afebf366c2e8c9a1652a6cfc75781ddda`, parent `18c3f6223b4bb08641be1dc28630eb97ee8936c7`. 변경 10파일 pinned UTF-8 원문 exact read-back·local staged tree 일치 확인. fetch 후 local/remote/PR head 일치·clean·upstream 0/0·main 26/0, PR #2 draft/unmerged 확인. 실행 대상 소스와 저장 소스가 동일하며 커밋 후 테스트 재실행은 아니다.
- 최종 저장 head는 Git 이력에서 조회한다. 저장 뒤 원문·tree·브랜치/PR를 확인하며 실패하면 마지막 확인 원격 위치를 보고한다.

## 이전 체크포인트 — 승인 계약 문서 반영 (2026-10-03, 보존)

- 최신 사용자 직접 승인: 2026-10-03T19:35:16+09:00 “승인”. 직전 initial_practice 설계 후보와 R1 및 정식 계약 문서 반영 한 작업 승인이다. 14:38 clone 승인과 구분한다.
- 시작 기준: 작업/로컬/PR `75ea09a8317c6f0f671d61155d8137261062a4b9`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. fetch 성공·승인 경로/.git/top-level/브랜치·clean worktree/stage·upstream 0/0·main 23/0 확인. PR #2 open/draft/unmerged.
- 완료: API_CONTRACT 1.32 §7.1.1/§10.1, ENGINE_INTERFACE 1.20, CLIENT_BRIEF 1.3, LEARNING_API_SERVER_BRIEF에 승인 계약을 반영하고 Backlog 1.82에 승인 근거를 추가했다. 후보 원문은 승인 전 이력으로 보존하고 정식 문서 포인터를 추가했다.
- 확정 내용: 필수 explanation/state/initial_practice·기존 6키 projection·독립 null·Content 선택 프로필 R1·기존 admission→설명→QUIZ 순서·부분 실패/멱등/capacity·화면/HTTP 소비 경계.
- 상태 구분: 사용자 승인 / 작업 브랜치 계약 문서 반영 완료. 새 계약 코드 구현·독립 리뷰·main 통합·CLOSED는 미완료다. 현재 state-only 경계를 새 API 구현 완료로 보고하지 않는다.
- 보존: MOBILE-05 코드와 기존 검증, Generation PRE_MADE EXAMPLE, Progress state/admission, five-code registry, Tier A/schema/migration·Validation 판정 규칙. 이번에는 소스·테스트·package/lock을 변경하지 않는다.
- 직접 검증 소유: VALIDATION_STATUS.md §K(문서), 기존 MOBILE-05 실행 증거 §I.1–I.2. 런타임/빌드/PG/APK/실기기/실제 검수는 이번 미실행.
- 남은 차단: 서버 새 계약 구현·설명/문제 UI·제출/피드백·검수 콘텐츠/팩 자산 일치·Android host/native adapter/APK·운영 PG/HTTPS·실기기. 갱신/만료 뒤 복구·새 채점/schema·유료 서비스·main 병합/출시·P1/인간 데이터 승인은 포함하지 않는다.
- 다음 행동 하나: 승인된 최초 학습 계약의 서버 경계 구현 한 작업: Content R1·Learning Flow startExplicitStudy·in-process 연결과 관련 검증을 진행한다. UI/제출/Android 작업은 동시에 시작하지 않는다. 이번 문서 반영에서는 구현에 착수하지 않았다.
- 계약 반영 원격 저장 확인: `a07ec7b2fc0856024e9d0cfb133b77d21c41cdc6`, tree `795c3903913de123577980ebbda734df9e68de26`, parent `75ea09a8317c6f0f671d61155d8137261062a4b9`. 변경 12문서의 pinned UTF-8 원문 exact read-back과 local staged tree 일치 확인. fetch 후 local/remote/PR head 일치·clean·upstream 0/0·main 24/0 및 PR #2 open/draft/unmerged를 확인했다.
- 원격 최종 저장 head는 Git 이력에서 조회한다. 저장 후 변경 원문·브랜치·PR를 재확인하고, 실패하면 마지막 확인 원격 위치를 보고한다.

## 이전 체크포인트 — 계약 후보 작성/저장 (2026-10-03, 보존)

- 최신 사용자 지시: 2026-10-03T14:38:26+09:00 “승인한다”. 직전 요청의 새 clone·기존 작업 브랜치 연결 승인이다. 원래 범위는 MOBILE-05 재작성 금지와 다음 계약 설계 한 작업이다.
- 직접 복구: 기본 네트워크 clone은 프록시 연결 실패. 승인된 clone을 실행 권한 확장으로 재시도해 성공했으며 `git fetch origin`도 성공했다. 자동 승인 거절은 없었다.
- 실제 작업 경로: `/workspace/scratch/2f8f7d39d1fd/language-learning-engine`. 유효한 .git/top-level·승인 브랜치·clean worktree/stage를 확인했다.
- 시작 local/remote/PR head: `c14166731d5179e40783a1515de8e82f0925b094`. main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. upstream 0/0, main 대비 21/0. PR #2 open/draft/unmerged.
- 완료: `INITIAL_PRACTICE_CONTRACT_PROPOSAL.md` 후보 작성. 정확한 3키 응답/6키 Content projection·필수/null·공백/오류·Progress-first 순서·멱등/admission/capacity·실패 후 진도 의미·후속 검증 목록을 정리했다.
- 직접 발견: 현재 Content 조회와 projection만으로 검수 완료·대표·단일 노드 조건을 보장할 수 없다. Content 내부 opt-in 선택 프로필 R1을 추가 승인 후보로 제안했다. 기존 getContent와 Generation 동작은 그대로 보존하는 안이다.
- 승인 구분: initial_practice 방향과 이번 설계/clone은 사용자 승인. 세부 응답/순서/R1은 AI 설계 후보이며 정확한 계약 승인 대기. canonical API·코드·Android host·schema 변경 승인이 아니다.
- MOBILE-05 source 기준 `00f7909aefbc447999bfc77e32dae90e99aa9580`의 구현을 다시 만들거나 수정하지 않았다. 기존 검증은 `VALIDATION_STATUS.md` §I.1–I.2, 이번 직접 점검과 미실행은 §J가 소유한다.
- 현재 변경은 신규 후보 설계와 인계/상태/연결 문서뿐이다. 런타임 테스트·빌드·PG·APK·실기기·검수·학습 효과는 이번 미실행이다. 독립 리뷰·main 병합·CLOSED·출시는 선언하지 않는다.
- 기존 차단 유지: 실제 검수 팩·서버/팩 자산 일치·제출/피드백·Android host/APK·native adapter·실제 PG/HTTPS·기기 완주. 새 환경의 SDK/PG 도구 존재는 이번 미확인. 만료 뒤 복구는 승인 제외.
- 다음 행동 하나: `INITIAL_PRACTICE_CONTRACT_PROPOSAL.md` §3–6의 정확한 응답/실패 순서와 §4의 Content 선택 프로필 R1을 검토·승인한 뒤 canonical 계약 문서에만 반영한다. 승인 전 코드/API 원문 변경을 시작하지 않는다.
- 설계 원격 저장 확인: `d27b6f606ed13ed4a65abdb771fa68aa29a5bc31`, tree `327029803d7f29603e5238ff9eb2f94dec925785`, parent `c14166731d5179e40783a1515de8e82f0925b094`. 변경 7문서 pinned UTF-8 원문 exact read-back·local tree 일치, 로컬/원격/PR head 일치, clean·upstream 0/0·main 22/0을 확인했다.
- 저장 경로: 직접 git push는 로그인 정보 부재로 실패했다. 연결된 GitHub 경로로 동일 tree를 저장했고, 미전송 로컬 커밋 `427608c0e40c87908f7a1e5800cc7b8faad984c2`와 내용이 같음을 확인한 후 로컬 ref만 저장된 커밋에 맞췄다. 소스 변경·merge/rebase/reset/force-push 없음.
- 이 후속 저장은 원격 검증 결과를 인계/Validation 문서에 기록하는 작업뿐이다. 최종 head는 Git 이력에서 조회하고 저장 뒤 다시 확인한다.

## 이전 체크포인트 — 2026-10-02 (보존)

- 날짜: 2026-10-02 (Asia/Seoul). 최신 사용자 질문: 22:40:32+09:00 “다음 작업은 매우 긴 작업시간이 필요한가? 세션을 새로 교체해야 할 필요성은?”. 이번에는 일정/세션 판단과 인계만 갱신하고 신규 개발을 시작하지 않았다.
- 승인: 이전 21:10:42 “승인”은 온라인·유효 토큰 내 재실행 첫 시연과 §5.1 initial_practice 방향에 한정한다. 정확한 학습 API 계약/코드는 이번에 변경하지 않았다.
- 승인 제외: refresh/만료 뒤 동일 게스트 복구·수명 연장·새 원문 채점/API/schema/migration·새 Android host 구조·유료 서비스·main 병합/출시·P1/인간 데이터 승인.
- 완료: MOBILE-05 게스트 제어기·주입 저장 경계·게스트 화면·기존 팩/flow 진입·종료/재개 연결과 선택 개발 검증/모바일 빌드.
- 구현 파일: `src/client/guestSessionController.js`, `src/client/mobileGuestView.js`, `mobile/browserEntry.js`, `mobile/styles.css`, `scripts/build-mobile.js`, `tests/guestSessionClient.test.js`, `tests/mobileClient.test.js`, `package.json`와 상태/인계 문서. dependency/lock 변경 없음.
- 동작: empty→pending 원자 저장 재확인 후 기존 게스트 POST 1회, 후보 commit/read 같은 기록 확인 후 READY. 준비 전 학습 차단·같은 유효 게스트 복구·만료/401·실패의 로컬 저장 재확인·오래된 응답 차단.
- 기존 서버/엔진/학습 제어기·HTTP 전송/팩 다운로드·캐시·API/schema/Validation 규칙은 재작성하지 않았다.
- 실제 adapter 부재: 일반 앱은 HOST_UNAVAILABLE에서 팩/학습 요청을 막는다. production 합성 store/평문 fallback 없음. token callback만 있는 기존 host·명시적 preview 유지.
- 직접 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, tree `e3ad28a5ccc837dd0bc137bd7d4f36492185cba2`, 변경 없음.
- 시작 기준선: `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`, tree `7f7de901f02f331859e34a6e3e999cc220d35bfe`; fetch/remote·local·PR head 일치·clean/upstream 0/0·main 17/0 확인.
- 착수 범위 원격 저장: `7465b14f278ea73b70357de0c41c6bab74288f72`, tree `401c7be8e0da2f782c398bb1414fb6cadb208a26`; 5문서 exact read-back·clean/upstream 0/0·main 18/0 확인.
- 구현 코드의 안전한 원격 저장 지점: `00f7909aefbc447999bfc77e32dae90e99aa9580`, tree `5aba4478805b35e4402f45dd8bc58144ae76f00b`, parent `7465b14f278ea73b70357de0c41c6bab74288f72`. 변경 15파일의 pinned exact UTF-8 read-back/local staged tree 일치·clean/upstream 0/0·main 19/0 확인. 선택 테스트는 커밋 직전 동일 작업 파일의 실행이며 커밋 후 재실행 기록은 아니다.
- PR #2 제목/설명을 최종 구현 범위로 갱신하고 원격 원문/head/main/open·draft·unmerged를 재확인했다. 후속 최종 체크포인트 저장은 문서만이며 source 코드를 바꾸지 않는다.
- 저장소/브랜치: `minos8458-web/language-learning-engine` / `development/mobile-01-session-ui-20261001`.
- 초안 PR: https://github.com/minos8458-web/language-learning-engine/pull/2 (open/draft/unmerged). main 반영/독립 리뷰/CLOSED/출시 선언 없음.
- 검증 결과: 선택 개발 검증·모바일 빌드 통과. 정확한 명령/수치/해시/합성 vs 실제 Node HTTP 구분/미실행은 `VALIDATION_STATUS.md` §I.1이 소유한다. 기존 §C–H는 이전 증거다.
- 목표: Android 여섯 단계 실제 시연 미완료. 분류/기간은 아래와 `ANDROID_VI_DEMO_ASSESSMENT.md` §0.1.
- 콘텐츠 차단: DA 설명/예문/직접 입력 QUIZ의 별도 검수·실제 파일/용량이 없다. human_reviewed=true/문서 정합성을 실제 독립 검수로 승격하지 않는다. 다국어 팩 선택/본문 분리 유지.
- 환경 차단: 22:20 직접 재확인에서 javac/gradle/adb/sdkmanager/psql/postgres/initdb/docker는 PATH에 없다. Android host/APK·실제 PG/HTTPS를 준비하지 않았다. 사용자 기종/OS/키보드/PC·검수 일정 미확인.
- 만료: 기존 기본 24시간. 만료/401/저장 실패를 새 게스트 자동 생성으로 숨기지 않는다. refresh/복구는 승인 제외.
- 기간: 남은 5묶음의 조건부 **32–59 집중 개발/검증 시간** (§0.1). 경과 시간의 단순 차감/완료 약속이 아니다. 환경·host 선택·검수·기기 피드백 대기는 별도 달력 시간.
- 다음 행동 하나: 승인된 `start_explicit_study.initial_practice` 방향의 정확한 응답·null·오류 계약을 기존 API/Content·Generation·Progress와 대조해 검토 가능한 설계로 구체화한다. canonical API/코드 변경과 새 Android host 구현은 동시에 시작하지 않는다.
- 저장 head는 원격/Git 이력에서 조회한다. 최종 원격 저장 뒤 원문을 재확인한다.
- 웹 합성 preview/자동 개발 검증/APK 생성/휴대폰 완주는 별개다. 기존 브라우저 보안 차단 재시도/우회 없음. 이전 사용자 제공 preview 파일 변경 없음.

### 실제 시연까지 남은 상태

| 분류 | 최신 상태 |
|---|---|
| 구현 완료 | 기존 게스트 서버·새 클라이언트 제어기/주입 저장 소비/게스트 화면·팩 목록/팝업/다운로드/캐시·두 flow HTTP 경계. 선택 개발 검증 완료인 코드 범위다. |
| 연결 필요 | 실제 secure-store host·PG/키/HTTPS·VI catalog/파일/서버 자산 일치·동일 사용자 진도 최신 판단. |
| 미구현 | Android 프로젝트/APK·native adapter·학습용 팩 본문 형식/읽기·initial_practice exact 계약·설명/문제/제출/피드백 조정/API/UI. 만료 뒤 복구는 승인 제외. |
| 실기기 미검증 | 설치·첫 게스트/안전 저장·실제 VI 다운로드/재시도·단원 정오답/피드백·종료/재부팅 후 팩/같은 사용자/진도 보존 전체. |
| 웹/자동 검증 | 합성 preview·Node DOM/HTTP/store/DB 코드 경계만 검증. 브라우저 배치/터치/CSP·실제 PG/TLS·기기 완료로 승격하지 않는다. |

## 세션 교체 판단·인계 — 2026-10-02T22:40:32+09:00

- 사용자 질문: 다음 작업의 작업시간과 새 세션 교체 필요성. 세션 교체/새 범위 실행의 사용자 결정은 아직 미확인이다.
- 이번 완료: 최신 원격 main/작업 브랜치/PR·인계/상태/Validation/게스트 설계/시연 평가/API를 다시 읽고 다음 한 작업의 범위를 확인했다. 코드/API/schema 변경과 신규 설계 착수는 하지 않았다.
- 직접 확인 기준선: 작업/로컬/PR head `a35b52b2a690129344a546c7c47d8c8c1450f2d7`, tree `6493a0d344ee412f2ec324ef89997d5220fb508a`; main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. fetch 성공·저장소 top-level/.git/브랜치·clean worktree/stage·upstream 0/0·main 20/0 확인. PR open/draft/unmerged 유지.
- 검증 결과: 이번은 원격 문서/blob·Git 기준선/범위 직접 점검이다. 이전 선택 개발 검증/빌드 증거는 `VALIDATION_STATUS.md` §I.1–I.2이며 이번에 재실행하지 않았다. 이미 검증·저장한 MOBILE-05를 다시 만들지 않는다.
- 다음 한 작업: 승인된 initial_practice 방향의 정확한 설명 응답/QUIZ Content projection·필수/optional/null·데이터 부재/멱등/admission/capacity/error 규칙을 대조해 검토 가능한 후보 설계를 정리한다. 서버/UI/APK 구현을 동시에 시작하지 않는다.
- AI 작업량 추정: 위 설계·기존 계약 대조·문서 정합성 확인에 **1–3 집중 작업시간**. 실행 측정/완료 약속/현재 세션 잔여량이 아니다. 새 충돌·clarification/추가 승인 필요 시 늘어날 수 있다. 전체 학습 조정/API/UI 작업의 이전 9–16시간이나 전체 잔여 32–59시간과 구분하며 이번 답변에서 합계를 임의 차감하지 않는다.
- AI 권고: 세션 교체는 필수라고 판단하지 않지만 이번 완료 경계에서 새 세션 사용을 권장한다. 이전 설계/코드/검증 문맥이 누적됐고 MOBILE-05가 안전하게 저장돼 있어 다음 계약 설계만 분리해 이어갈 수 있다. 여기서 계속해도 최신 문서 기준 단일 작업/체크포인트 원칙을 유지한다.
- 잔여 한도/강제 종료 시각: **미확인**. 현재 대화 길이만으로 플랫폼 한도 도달 시각이나 계정 사용량을 계산하지 않는다.
- 참고: [OpenAI 공식 장기 작업 안내](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)의 계획/상태 문서·검증 가능한 milestone 방식은 확인했다. 다른 모델/실험의 장시간 실행 결과를 이 Work 세션의 수명/한도 보장으로 사용하지 않는다.
- 막힌 부분: 기존 Android host/APK·실제 보안 저장/PG/HTTPS·독립 검수 팩/학습·실기기 차단 상태 유지. 이번 질문에서 추가 API/구조/유료 서비스/출시 승인을 받은 것으로 해석하지 않는다.
- 다음 세션: BOOTSTRAP부터 최신 원격 main·작업 브랜치·이 인계/상태/Validation을 직접 확인한다. source 코드 기준 `00f7909aefbc447999bfc77e32dae90e99aa9580`와 마지막 문서 head를 구분한다. 최신 branch head는 원격에서 조회한다.

새 세션에 사용할 요청:

> LLE의 최신 원격 MOBILE_APP_HANDOFF.md와 상태·Validation·Git 기준선을 확인하고, 완료한 MOBILE-05를 다시 만들지 말아줘. 다음 행동인 승인된 initial_practice 응답 계약 설계 한 작업만 이어가고, 매 답변 전 체크포인트를 원격 저장해줘.


## 이전 구현 (MOBILE-02, 이번 시작 시 확인)

- 초기에는 작은 지원 목록만 읽으며 팩 본문은 자동으로 받지 않는다.
- 나라·언어·설치 상태·예상 용량 목록과 팝업 하나. 질문 아래에 용량, 100 MB 이상이면 Wi-Fi 권장 안내.
- 확인한 팩 하나만 다운로드. 진행률·취소·실패·재시도·중복 요청 방지.
- 크기·SHA-256 확인 후 본문·메타데이터·선택 상태를 캐시 트랜잭션으로 저장. 완료 전 학습 진입 없음.
- 재실행 복구·같은 버전 재사용·새 버전 실패 시 이전 파일 보존·본문 없는 캐시의 설치 판정 차단.
- 설치된 선택 언어로 기존 세션 제어기 생성. 인증 미연결 시 학습 비활성. 언어 변경은 새 세션으로 대화 확인 초기화.
- 다운로드용 HTML에는 VI/EN/JA/ZH 합성 목록과 예시 용량·가상 진행률. 실제 팩·학습 기록·기기 캐시에 쓰지 않는다.
- 기존 엔진·세션 제어기 원문·HTTP 학습 계약·Tier A·PostgreSQL schema/migration·Validation 규칙 유지.

구현 설명과 호스트 목록 연결은 `LANGUAGE_PACK_DOWNLOAD_BRIEF.md`를 따른다.
변경 파일은 `src/client/languagePack*.js`, `src/client/mobileSessionView.js`, 모바일 진입/목록/안내/스타일,
빌드, 모바일·언어팩 테스트, package/lock, 범위·인계·검증·프로젝트 상태 문서다.

## 이전 구현 (MOBILE-03)

- 기존 두 POST 경로만 서버로 연결하고 인증 콜백에서 확인한 사용자만 기존 전송에 전달한다.
- 요청 크기·JSON·입력·시간 제한과 공개 오류 매핑. 검증된 capacity 거절만 재조회 표식으로 보존한다.
- 인증/전송 미연결은 503으로 닫는다. 실제 인증 발급·DB 배포·§10.1 EXPLANATION 연결을 완료한 것으로 보고하지 않는다.
- 기존 엔진·전송·API 계약·스키마·학습 판단·클라이언트 화면은 변경하지 않는다.
- 실제 HTTP 통합 테스트·기존 선택 회귀·모바일 빌드 통과. 수치는 `VALIDATION_STATUS.md` §E만 인용한다.
- 상세 경계는 `LEARNING_API_SERVER_BRIEF.md`. 실제 기기 검증 대기와 기존 보안 차단을 유지한다.
- 새 파일: `src/server/learningFlowHttpServer.js`, `scripts/serve-learning-api.js`, `tests/learningFlowHttpServer.test.js`.
- `start:api`·`test:api` 명령과 연결 안내 추가. 새 의존성 설치나 lock 변경 없음.

## 이전 구현 (MOBILE-04, 2026-10-01)

- 입력 없는 게스트 발급 경로·기존 users INSERT·서명/만료·현재 GUEST 행 확인을 기존 HTTP 호스트에 연결한다.
- schema/migration·엔진/전송/학습 계약·클라이언트 화면·Validation 판정 규칙 변경 없음.
- 키 미설정·저장 실패는 닫히며 임시 계정/토큰으로 대체하지 않는다. 실제 DB·사용자 데이터는 사용하지 않는다.
- 새 UUID, HS256, 기본 24시간 만료·UTC timezone은 AI의 구현 선택이며 호스트 설정/후속 출시 정책과 구분한다.
- 상세 경계: `GUEST_AUTH_BRIEF.md`. 합성 저장 fixture와 실제 Node HTTP로 검증하고 최종 코드·증거·인계를 원격 저장한다.
- 모바일 보안 저장소·자동 게스트 진입·갱신/복구·계정 전환·운영 배포는 후속 경계다.
- 실제 HS256 발급·검증과 현재 GUEST 행 확인, 빈 POST/빈 JSON 발급, no-store·401/503·내부 진단 비노출 구현.
- 신규 파일: `src/server/guestTokenCodec.js`, `src/server/guestAuthService.js`, `src/server/postgresGuestHost.js`, `scripts/postgres-guest-host.js`, `tests/guestAuth.test.js`.
- 기존 HTTP 서버/CLI의 선택적 `createGuest`·`onClose` 연결과 관련 HTTP 테스트·`test:api` 목록을 확장했다.
- 최종 선택 회귀와 모바일 빌드 통과. 키와 PG를 명시하지 않은 기본 실행은 미연결 503이며 실제 운영 연결은 하지 않았다.

## 근거 구분과 미확인

- 사용자 승인: 제작 계속/이전 선택 다운로드 요구에 더해 2026-10-02T21:10:42+09:00의 온라인·유효 토큰 내 재실행 첫 시연 한정/`initial_practice` 방향 승인. 구체적인 새 호스트 구조·운영 키 수명·복구·채점 API·schema·유료 배포/출시를 승인으로 만들어내지 않는다.
- AI 구현 선택 (이전 MOBILE-04): 자기 발급 HS256 토큰·256-bit 호스트 키·기본 만료 24시간과 timezone UTC·현재 GUEST 확인·선택적 PG 호스트/종료 hook. 기본값은 출시 정책/실제 기기 시간대 승인으로 취급하지 않는다.
- 직접 검증 (이전 기록): 합성 다운로드·캐시·DOM·계약 자동 검증과 모바일 빌드, 코드 원격 대조·최종 파일 저장 완료는 §D의 이전 증거다.
- 직접 검증 (이전 기록): MOBILE-03 HTTP·CLI·선택 회귀·빌드와 원격 코드 원문 대조는 §E와 시작 기준선의 이전 증거다.
- 직접 검증 (이전 MOBILE-04, 2026-10-01): 원격/사전 점검·실제 Node crypto/HTTP·CLI·합성 저장 fixture·기존 선택 회귀·빌드와 코드 원문 대조. 수치는 §F만 인용한다.
- 직접 점검 (이전 06:58 평가, 2026-10-02): 최신 main/개발 브랜치/PR·필수 원문/계약/관련 코드 47개 blob 일치·기준선/환경/추적 파일 확인과 시연 부족분 평가 (§G).
- 직접 점검 (이번 승인/MOBILE-05 설계, 2026-10-02): 최신 원격 기준선/30개 원문 조회 항목·로컬 hash·기존 인증/전송/화면 주입 경계·문서 구조/변경 범위·원격 승인 저장과 설계 점검 (§H). 런타임 테스트/빌드/PG/기기 실행을 새로 보고하지 않는다.
- 기존 원문 보존: 엔진·기존 클라이언트/전송·DB·Tier A/학습 API·스키마·Validation 판정 규칙 변경 없음을 직접 대조했다. HTTP 호스트의 이미 정의된 게스트 경로만 추가했다.
- 이전 세션 동기화 관찰은 `e89c4d027f4470d4e572fd89856afbb5ca41a62b:MOBILE_APP_HANDOFF.md`에 보존한다. 이번 계획·코드 원격 저장과 로컬 동기화는 통과했다.
- 이전 MOBILE-04 코드 저장 직후 HEAD/원격/PR head는 `7093a43acc035793223d8a500210a848d24f0dfa`로 일치했고 로컬 변경 0, upstream ahead/behind 0/0, main 대비 13/0이었다. PR 제목·본문의 MOBILE-04 갱신도 원격 재확인했다. 후속 인계 문서 저장 head는 원격 및 Git 이력에서 조회한다.
- 실제 배포 자료: 저장소에 없음. Tier A 문서는 실제 다운로드 가능한 지원/콘텐츠/크기의 증거가 아니다.
- 이전 브라우저 차단: 로컬 HTTP `ERR_BLOCKED_BY_CLIENT`, file 열기 보안 거부. 이번에 재시도/우회하지 않았다.
- DOM 실행은 실제 화면 배치·터치·CSP 집행·실기기 성능 검증으로 취급하지 않는다.
- 실제 운영 키/사용자 저장·PostgreSQL·AI·APK·학습 효과는 실행하지 않았다. 저장 검증은 합성 fixture이며 Pilot/학습자 데이터 승인 경계도 그대로다.
- 기존 in-process 명시적 학습은 Progress 갱신만 반환한다. 설명 콘텐츠 조회·나머지 세 학습 API·동일 출처 앱 라우팅은 미구현이다.
- 이미 호출한 엔진 작업은 HTTP 취소로 중단되거나 rollback된다고 보장하지 않는다. 서버 자동 재전송 없음.

## 다음 행동 하나

승인된 최초 학습 계약의 서버 경계 구현 한 작업: Content R1·Learning Flow startExplicitStudy·in-process 연결과 관련 검증을 진행한다. UI/제출/Android 작업은 동시에 시작하지 않는다. 이번 문서 반영에서는 구현에 착수하지 않았다.

기존 MOBILE-05를 다시 만들지 않는다. 이번 계약 문서 반영만으로 남은 시연 시간 추정을 임의 차감하지 않는다.

## 재현 명령

```bash
npm ci --ignore-scripts
npm run build:mobile
npm run test:mobile
npm run test:api
npm run start:api
node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js tests/guestSessionClient.test.js
```

생성 파일은 `mobile/dist/`이며 Git에서 제외한다.
실제 앱에 언어팩 목록을 연결하는 방법은 `LANGUAGE_PACK_DOWNLOAD_BRIEF.md`를 따른다.
API 실행·호스트 연결은 `LEARNING_API_SERVER_BRIEF.md`를 따른다. 기본 CLI는 미연결 503이다.
게스트 PG 호스트·키 환경 설정은 `GUEST_AUTH_BRIEF.md`를 따른다. 실제 키·DB는 이 세션에서 준비하지 않았다.
위 명령은 재현 절차다. 이번 MOBILE-05는 `VALIDATION_STATUS.md` §I.1, 이전 MOBILE-04는 §F를 따른다. 실제 native guestStore 경계는 `MOBILE_GUEST_START_BRIEF.md` §3/§12다.
이전 평가는 문서/환경 점검 (§G), 이번 작업은 승인 기록·게스트 클라이언트 경계 설계/문서 점검 (§H)이며 위 런타임 명령을 재실행하지 않았다.

## 보존된 다운로드 파일 출처 (MOBILE-02)

- 파일 이름: `lle-mobile-preview-20261001.html`.
- 파일 크기: 65385 bytes.
- 파일의 `lle-source-commit`: `16e793dc454482652f46329d3d0959fba35a2312`.
- SHA-256: `d3e94744435adf702e18e2e4fc7ece628300bf0689d476444a0a95bf8e689f96`.
- 생성·저장: 완료. 원격 코드 저장 후 깨끗한 소스에서 생성했으며 작업 중 변경 표시는 없다.
- 자동 검증: `VALIDATION_STATUS.md` §D. 코드 저장 후 다시 실행한 것은 빌드이며, 런타임 테스트 재실행으로 기록하지 않는다.
- 파일 안의 ‘미리보기에서 확인할 것’과 `MOBILE_SCREEN_TEST_GUIDE.md`를 따른다. 실제 휴대폰 실행·배치·터치는 미확인이다.
이전 파일 출처는 Git의 `0e07e90ff1ecfcd8304b089f870dd10401d9d634:MOBILE_APP_HANDOFF.md`에 보존한다.
현재 후보의 미리보기에는 예시 용량과 가상 다운로드를 명시한다. 설치용 APK나 실제 팩 파일이 아니다.

## 새 세션 시작

`BOOTSTRAP.md`의 시작 순서·사전 점검과 commit-pinned 원문 확인을 수행한다.
원격 main/작업 브랜치/초안 PR과 실제 코드·인계·검증 문서를 대조한 뒤 다음 행동 하나를 시작한다.
GitHub 개발 후보를 main에 반영된 구현으로 취급하지 않는다. 저장 실패 또는 동시 변경이 있으면 기록하고 멈춘다.
