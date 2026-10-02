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

- 날짜: 2026-10-02 (Asia/Seoul). 최신 사용자 직접 지시: 21:46:25+09:00 “다음작업 계속 진행해”.
- 승인: 이전 21:10:42 “승인”은 온라인·유효 토큰 내 재실행 첫 시연과 §5.1 initial_practice 방향에 한정한다. 정확한 학습 API 계약/코드는 이번에 변경하지 않았다.
- 승인 제외: refresh/만료 뒤 동일 게스트 복구·수명 연장·새 원문 채점/API/schema/migration·새 Android host 구조·유료 서비스·main 병합/출시·P1/인간 데이터 승인.
- 완료: MOBILE-05 게스트 제어기·주입 저장 경계·게스트 화면·기존 팩/flow 진입·종료/재개 연결과 선택 개발 검증/모바일 빌드.
- 구현 파일: `src/client/guestSessionController.js`, `src/client/mobileGuestView.js`, `mobile/browserEntry.js`, `mobile/styles.css`, `scripts/build-mobile.js`, `tests/guestSessionClient.test.js`, `tests/mobileClient.test.js`, `package.json`와 상태/인계 문서. dependency/lock 변경 없음.
- 동작: empty→pending 원자 저장 재확인 후 기존 게스트 POST 1회, 후보 commit/read 같은 기록 확인 후 READY. 준비 전 학습 차단·같은 유효 게스트 복구·만료/401·실패의 로컬 저장 재확인·오래된 응답 차단.
- 기존 서버/엔진/학습 제어기·HTTP 전송/팩 다운로드·캐시·API/schema/Validation 규칙은 재작성하지 않았다.
- 실제 adapter 부재: 일반 앱은 HOST_UNAVAILABLE에서 팩/학습 요청을 막는다. production 합성 store/평문 fallback 없음. token callback만 있는 기존 host·명시적 preview 유지.
- 직접 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, tree `e3ad28a5ccc837dd0bc137bd7d4f36492185cba2`, 변경 없음.
- 시작 기준선: `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`, tree `7f7de901f02f331859e34a6e3e999cc220d35bfe`; fetch/remote·local·PR head 일치·clean/upstream 0/0·main 17/0 확인.
- 착수 범위 원격 저장: `7465b14f278ea73b70357de0c41c6bab74288f72`, tree `401c7be8e0da2f782c398bb1414fb6cadb208a26`; 5문서 exact read-back·clean/upstream 0/0·main 18/0 확인. 최종 구현 저장 식별자는 후속 원격 확인에 기록한다.
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

승인된 `start_explicit_study.initial_practice` 방향의 정확한 응답·null·오류 계약을 기존 API/Content·Generation·Progress와 대조해 검토 가능한 설계로 구체화한다. canonical API/코드 변경과 새 Android host 구현은 동시에 시작하지 않는다.
기존 승인된 방향·경로/입력·Content projection/state/five-code registry/schema·PRE_MADE EXAMPLE 보존을 기준으로 후보 설계를 작성한다.
방향 승인 밖의 새 구조/필드/채점/복구/host가 필요하면 이유/영향을 먼저 설명하고 구현 전 승인을 확인한다.
MOBILE-05 제어기·서버·다운로드를 다시 만들지 않는다. APK/PG/TLS 연결은 별도 작업이다.
허용된 휴대폰 화면·팝업·취소·언어 변경 검증은 별도 대기 항목이며 기존 브라우저 제한을 우회하지 않는다.

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
