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

- 날짜: 2026-10-02 (Asia/Seoul).
- 최신 사용자 직접 응답: 2026-10-02T21:10:42+09:00, “승인”.
- 직전 승인 질문/범위: 온라인 학습·유효 토큰 내 재실행 첫 시연 한정과 `ANDROID_VI_DEMO_ASSESSMENT.md` §5.1의 `start_explicit_study.initial_practice` 보완 방향. 이 두 항목이 승인됐다. 정확한 계약 보완/구현은 후속 단일 작업이며 아직 변경하지 않았다.
- 승인에서 제외: refresh/같은 게스트 복구·장기 토큰 수명·서버 원문 채점·schema/migration·새 Android 호스트 구조·유료 서비스·main 병합·출시·P1 활성화.
- 이번 작업: 승인 근거를 먼저 외부 체크포인트에 기록한 뒤 MOBILE-05 보안 저장 경계·최초 게스트 시작 흐름 설계 하나를 진행한다. 중간 저장은 문서만이며 클라이언트/네이티브 구현은 아직 없다.
- 직접 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92` (tree `e3ad28a5ccc837dd0bc137bd7d4f36492185cba2`, 변경 없음).
- 이번 시작 기준선: `d80a91958bacddbbb4fb113071c89aee3128aca9` (tree `96fb1e301e0780aa98012b1a9902dc9e3bae5cf6`). fetch 성공, 로컬/원격/PR head 일치, dirty/staging 0, upstream 0/0, main 대비 15/0을 직접 확인했다.
- 이전 평가: `d80a91958bacddbbb4fb113071c89aee3128aca9:ANDROID_VI_DEMO_ASSESSMENT.md`. 평가 당시 미승인 표현은 위 두 승인 항목에 한해 갱신됐다. 부족분·환경·검수 미완료는 유지한다.
- 안전한 이전 작업: 미저장 진행 작업이 없다. MOBILE-04 서버/모바일 다운로드/캐시를 다시 만들지 않는다.
- 이전 게스트 코드: `7093a43acc035793223d8a500210a848d24f0dfa` (tree `170bee426c0766d05f6710f1148c17fc09546aaf`, parent `9e84ebf4126badc6214ca4d6ca2bb4a93066bd02`).
- 이전 HTTP 코드: `c5285b23ea5f1ddd936a6743217b7e2cfb365035`; 모바일/미리보기 출처: `16e793dc454482652f46329d3d0959fba35a2312`. 검증은 해당 Git 이력 및 Validation 기록에 보존한다.
- 저장소: `minos8458-web/language-learning-engine`. 작업 브랜치: `development/mobile-01-session-ui-20261001`.
- 초안 PR: https://github.com/minos8458-web/language-learning-engine/pull/2 (open/draft/unmerged). main 반영·출시·독립 리뷰·CLOSED는 선언하지 않는다.
- 완료한 내용: 최신 원격 필수 문서/게스트·클라이언트/HTTP 원문을 조회하고 승인 질문과 직접 응답의 범위를 대조했다. 승인/구현/검증 상태를 분리했다.
- 검증 결과: 현재 문서/출처/Git 사전 점검은 `VALIDATION_STATUS.md` §H. 이전 런타임 수치는 §C–F가 소유하며 이번에 재실행하지 않았다.
- 목표 판정: Android 여섯 단계 실제 시연 미완료. 클라이언트 보안 저장/첫 게스트, Android 호스트/APK, PG/HTTPS, 실제 팩/본문 읽기·설명/문제/제출/피드백·동일 사용자 진도 연결이 남아 있다.
- 콘텐츠 차단: 기존 `GRAMMAR_VI_DA` 설명/예문/입력 QUIZ의 서비스 전 별도 검수가 남아 있다. `human_reviewed=true`나 문서 정합성을 독립 검수 완료로 승격하지 않는다. 파일/실측 용량도 아직 없다.
- 환경 차단/미확인: 이전 직접 환경 점검(§G)에서 Android 프로젝트·SDK/컴파일러/adb·PG 실행기/실제 PG·HTTPS 호스트가 없었다. 사용자 PC/Android 기종·OS·키보드·검수 일정은 미확인이다. 이번 승인 기록만으로 환경 확보를 선언하지 않는다.
- 만료 경계: 기본 게스트 토큰 24시간, 갱신/복구 미구현. 만료/401/저장 실패를 새 게스트 자동 생성으로 숨기지 않는다.
- 기간: 이전 조건부 전체 추정 35–65 집중 개발/검증 시간은 실행 측정값이 아니다. API 방향의 승인 대기는 해소됐으나 정확한 계약·환경·검수·기기 피드백은 남는다. 이번 중간 저장에서 시간을 임의 차감하지 않는다.
- 다음 행동 하나: MOBILE-05 게스트 첫 시작·보안 저장 경계 설계를 마무리한다. `initial_practice` 구현/APK 제작을 동시에 시작하지 않는다.
- 이 문서의 저장 head는 원격 브랜치/Git 이력에서 조회한다. 저장 후 원문을 다시 읽는다.
- 이전 화면 검증/브라우저 보안 차단·보존 HTML 출처를 유지한다. 웹 미리보기·자동 검증·APK 생성·휴대폰 완주는 각각 별개 상태다.

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

- 사용자 승인: 제작 계속 지시 및 이전 선택 다운로드 요구. 구체적인 파일·배포 형식·용량·운영 인증을 사용자 승인으로 만들어내지 않는다.
- AI 구현 선택 (이번): 자기 발급 HS256 토큰·256-bit 호스트 키·기본 만료 24시간과 timezone UTC·현재 GUEST 확인·선택적 PG 호스트/종료 hook. 기본값은 출시 정책/실제 기기 시간대 승인으로 취급하지 않는다.
- 직접 검증 (이전 기록): 합성 다운로드·캐시·DOM·계약 자동 검증과 모바일 빌드, 코드 원격 대조·최종 파일 저장 완료는 §D의 이전 증거다.
- 직접 검증 (이전 기록): MOBILE-03 HTTP·CLI·선택 회귀·빌드와 원격 코드 원문 대조는 §E와 시작 기준선의 이전 증거다.
- 직접 검증 (이전 MOBILE-04, 2026-10-01): 원격/사전 점검·실제 Node crypto/HTTP·CLI·합성 저장 fixture·기존 선택 회귀·빌드와 코드 원문 대조. 수치는 §F만 인용한다.
- 직접 점검 (이번, 2026-10-02): 최신 main/개발 브랜치/PR·필수 원문/계약/관련 코드 47개 blob 일치·기준선/환경/추적 파일 확인과 시연 부족분 평가. 문서만 변경하며 런타임 테스트/빌드/PG/기기 실행을 새로 보고하지 않는다 (§G).
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

모바일 보안 저장소 경계와 최초 게스트 시작 흐름을 설계한다 (MOBILE-05).
`ANDROID_VI_DEMO_ASSESSMENT.md`의 사용자 여섯 단계 목표와 API/만료/채점/기기 경계를 반영해 설계를 한정한다.
새 아키텍처/API/schema/승인 범위 변경을 먼저 실행하지 않는다. 앱 서버 발급·다운로드 UI·기존 엔진은 재사용한다.
MOBILE-01/02의 허용된 휴대폰 환경에서의 화면·팝업·취소·언어 전환 검증은 별도 대기 항목으로 유지한다.
기존 다운로드 안내와 `MOBILE_SCREEN_TEST_GUIDE.md`를 사용하며 브라우저 제한을 우회하지 않는다.
자동 검증만으로 실제 인증·DB·기기·콘텐츠 연결을 완료 처리하지 않는다.

## 재현 명령

```bash
npm ci --ignore-scripts
npm run build:mobile
npm run test:mobile
npm run test:api
npm run start:api
node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js
```

생성 파일은 `mobile/dist/`이며 Git에서 제외한다.
실제 앱에 언어팩 목록을 연결하는 방법은 `LANGUAGE_PACK_DOWNLOAD_BRIEF.md`를 따른다.
API 실행·호스트 연결은 `LEARNING_API_SERVER_BRIEF.md`를 따른다. 기본 CLI는 미연결 503이다.
게스트 PG 호스트·키 환경 설정은 `GUEST_AUTH_BRIEF.md`를 따른다. 실제 키·DB는 이 세션에서 준비하지 않았다.
위 명령은 재현 절차다. 이전 MOBILE-04 실행 수치는 `VALIDATION_STATUS.md` §F만 인용한다.
이번 평가는 문서/환경 점검이며 위 런타임 명령을 재실행하지 않았다 (§G).

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
