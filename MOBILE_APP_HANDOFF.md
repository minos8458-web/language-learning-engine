# MOBILE_APP_HANDOFF.md

## 현재 체크포인트

- 날짜: 2026-10-01 (Asia/Seoul).
- 작업: `MOBILE-01` — 기존 세션 제어기와 모바일 화면 연결.
- 상태: 코드 후보 구현 완료 / 자동 검증 통과 / 실제 브라우저·휴대폰 화면 검증 미확인.
- 저장소: `minos8458-web/language-learning-engine`.
- 시작 `main`: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 브랜치: `development/mobile-01-session-ui-20261001`.
- 승인 범위와 완료 기준: `MOBILE_APP_BRIEF.md`.
- 테스트·실행 증거와 환경 제한: `VALIDATION_STATUS.md` §C에서 확인한다.
- 실제 AI·학습 서버·APK·실기기·학습 효과: 이 체크포인트에서 완료를 선언하지 않는다.

## 다음 행동 하나

`MOBILE-01`의 실제 브라우저·휴대폰 화면 검증을 허용된 검증 환경에서 수행한다.
현재 브라우저의 로컬 서버·파일 접근 제한을 우회하지 않는다. 자동 검증 통과를 시각 검증 완료로 바꾸지 않는다.
이 작업은 시각 검증 대기 상태이며 lifecycle CLOSED나 전체 앱 완성을 선언하지 않는다.

## 이번에 구현한 것

- `mobile/`의 모바일 시작 화면, 다섯 학습 분기, 로딩·오류 화면과 명시적 미리보기.
- 기존 `LearningSessionController` 원문을 사용하는 DOM 화면 연결.
- 기존 HTTP 경로·응답 봉투·인증 헤더를 사용하는 전송 경계.
- 인증 미연결 시 학습 시작 비활성, 서버 오류의 합성 응답 대체 금지.
- 중복 버튼 요청 방지, 명시적 학습 시작 후 같은 제안의 반복 전송 방지.
- 대화 경계 확인과 새 제어기 생성에 의한 새 세션 초기화.
- 생성물에 서버 코드·DB 설정을 포함하지 않는 브라우저 빌드와 정적 실행기.

## 재현 명령

```bash
npm ci --ignore-scripts
npm run build:mobile
npm run test:mobile
node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js
npm run start:mobile
```

허용된 로컬 브라우저에서는 `http://127.0.0.1:4173/`로 실행한다.
화면 미리보기는 `http://127.0.0.1:4173/?preview=1`로 명시적으로 선택한다.
실제 화면 파일은 `mobile/dist/`에 생성되며 커밋하지 않는다.

## 후속 기능 목록 (지금 시작하지 않음)

인증·실행 가능한 HTTP 서버 연결, 문제/답안 제출, 오프라인 큐, 실제 AI 공급자,
학습 콘텐츠 연결, Android 패키징, 실기기 확인. 기존 승인·검증 경계를 확인한 뒤 각각 한 작업씩 진행한다.

## 새 세션 시작 절차

`BOOTSTRAP.md`의 시작 순서와 저장소 사전 점검을 수행한 후 이 파일을 확인한다.
원격 브랜치·실제 코드·커밋을 직접 확인한다. 이 파일의 저장 커밋은 Git에서 조회한다.
다른 세션이 변경한 사항이 있으면 현재 상태와 대조한다. 이전 대화만으로 완료를 추정하지 않는다.
