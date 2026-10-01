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

- 날짜: 2026-10-01 (Asia/Seoul).
- 최신 사용자 지시: 2026-10-01T14:47:29+09:00, “다음 설계할 것이 있나? 있으면 이어서 빌드하자”.
- 이번 작업: MOBILE-03 기존 모바일 전송과 엔진 전송 사이의 HTTP 서버 경계. 제작 계속 지시 안에서 AI가 다음 항목을 선택했다 (`MOBILE_APP_BRIEF.md` §8).
- 기준 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92` (변경 없음).
- 이번 시작 기준선: `e89c4d027f4470d4e572fd89856afbb5ca41a62b` (tree `a770920926979f1e7510361cce97ab9232c388f5`).
- 구현 계획 저장: `110b9b8dfffc9b8270e0877746d75ea636875357` (tree `04aa50a2f1583b5b01a3f8ded085e46ce8b92d5a`). 계획 원격 저장·원문 재확인 완료.
- 이전 모바일 코드/보존 미리보기 출처: `16e793dc454482652f46329d3d0959fba35a2312` (tree `fb5a841fd4fcf891fe0152edb033c99ed77eae0f`).
- 이번 서버 코드: 작업 파일 구현·선택 자동 검증·빌드 완료. 이 코드 저장 커밋은 Git 이력에서 조회하며 원격 원문 대조 후 최종 인계에 고정한다.
- 저장소: `minos8458-web/language-learning-engine`.
- 작업 브랜치: `development/mobile-01-session-ui-20261001`.
- 초안 PR: https://github.com/minos8458-web/language-learning-engine/pull/2.
- 후보 상태: MOBILE-03 HTTP 경계 구현·최종 선택 자동 검증·모바일 빌드 통과 / 코드 원격 저장·원문 대조 진행 단계.
- 검증 수치·실행 증거의 소유 문서: 이번 `VALIDATION_STATUS.md` §E. 이전 빌드 증거는 §C/§D로 보존한다.
- 실제 팩 배포 파일·목록·정확한 용량·콘텐츠 연결·브라우저/휴대폰·대용량 성능·APK: 미확인 또는 후속 작업.
- MOBILE-01 시각 검증 대기 상태와 기존 lifecycle은 유지한다. 전체 앱 완성·출시·CLOSED를 선언하지 않는다.

이 파일 자체의 최신 저장 커밋은 원격 브랜치 및 Git 이력에서 조회한다.
이번 서버 코드와 기존 다운로드 파일의 코드 출처는 구분한다. 이번에는 보존된 다운로드 파일을 교체하지 않았다.

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

## 이번 구현 (MOBILE-03)

- 기존 두 POST 경로만 서버로 연결하고 인증 콜백에서 확인한 사용자만 기존 전송에 전달한다.
- 요청 크기·JSON·입력·시간 제한과 공개 오류 매핑. 검증된 capacity 거절만 재조회 표식으로 보존한다.
- 인증/전송 미연결은 503으로 닫는다. 실제 인증 발급·DB 배포·§10.1 EXPLANATION 연결을 완료한 것으로 보고하지 않는다.
- 기존 엔진·전송·API 계약·스키마·학습 판단·클라이언트 화면은 변경하지 않는다.
- 실제 HTTP 통합 테스트·기존 선택 회귀·모바일 빌드 통과. 수치는 `VALIDATION_STATUS.md` §E만 인용한다.
- 상세 경계는 `LEARNING_API_SERVER_BRIEF.md`. 실제 기기 검증 대기와 기존 보안 차단을 유지한다.
- 새 파일: `src/server/learningFlowHttpServer.js`, `scripts/serve-learning-api.js`, `tests/learningFlowHttpServer.test.js`.
- `start:api`·`test:api` 명령과 연결 안내 추가. 새 의존성 설치나 lock 변경 없음.

## 근거 구분과 미확인

- 사용자 승인: 제작 계속 지시 및 이전 선택 다운로드 요구. 구체적인 파일·배포 형식·용량·운영 인증을 사용자 승인으로 만들어내지 않는다.
- AI 구현 선택 (이번): Node HTTP 어댑터, 호스트 인증 검증 콜백·전송 주입, loopback CLI, 미연결 503, 요청 크기/시간 제한. 엔진 학습 정책을 바꾸지 않는다.
- 직접 검증 (이전 기록): 합성 다운로드·캐시·DOM·계약 자동 검증과 모바일 빌드, 코드 원격 대조·최종 파일 저장 완료는 §D의 이전 증거다.
- 직접 검증 (이번): 원격 main/작업 브랜치/초안 PR, 고정 커밋 원문·기존 HTTP/API/엔진 계약과 시작 사전 점검을 확인했다. 실제 Node HTTP 소켓/CLI와 합성 인증·전송, 기존 앱 제어기·선택 회귀를 실행했다. 최종 선택 실행·빌드는 §E의 이번 증거다.
- 기존 원문 보존: 엔진·기존 클라이언트/전송·DB·Tier A/API·스키마·Validation 판정 규칙 변경 없음을 직접 대조했다.
- 이전 세션 동기화 관찰은 `e89c4d027f4470d4e572fd89856afbb5ca41a62b:MOBILE_APP_HANDOFF.md`에 보존한다. 이번 계획 원격 저장과 로컬 동기화는 통과했다.
- 실제 배포 자료: 저장소에 없음. Tier A 문서는 실제 다운로드 가능한 지원/콘텐츠/크기의 증거가 아니다.
- 이전 브라우저 차단: 로컬 HTTP `ERR_BLOCKED_BY_CLIENT`, file 열기 보안 거부. 이번에 재시도/우회하지 않았다.
- DOM 실행은 실제 화면 배치·터치·CSP 집행·실기기 성능 검증으로 취급하지 않는다.
- 실제 운영 인증·사용자 저장·PostgreSQL·AI·APK·학습 효과는 실행하지 않았다. Pilot/학습자 데이터 승인 경계도 그대로다.
- 기존 in-process 명시적 학습은 Progress 갱신만 반환한다. 설명 콘텐츠 조회·나머지 세 학습 API·동일 출처 앱 라우팅은 미구현이다.
- 이미 호출한 엔진 작업은 HTTP 취소로 중단되거나 rollback된다고 보장하지 않는다. 서버 자동 재전송 없음.

## 다음 행동 하나

기존 users schema와 `/auth/guest` 계약을 확인해 MOBILE-04 게스트 인증 발급 연결을 설계한다.
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
node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js
```

생성 파일은 `mobile/dist/`이며 Git에서 제외한다.
실제 앱에 언어팩 목록을 연결하는 방법은 `LANGUAGE_PACK_DOWNLOAD_BRIEF.md`를 따른다.
API 실행·호스트 연결은 `LEARNING_API_SERVER_BRIEF.md`를 따른다. 기본 CLI는 미연결 503이다.
위 명령은 재현 절차다. 이번 실행과 수치는 `VALIDATION_STATUS.md` §E만 인용한다.

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
