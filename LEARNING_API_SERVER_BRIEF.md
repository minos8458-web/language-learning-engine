# LEARNING_API_SERVER_BRIEF.md

## 범위와 기준

MOBILE-03은 기존 `HttpLearningFlowTransport`와 `InProcessLearningFlowTransport`를 연결하는 HTTP 경계다.
기준은 `API_LAYER_BRIEF.md`, `API_CONTRACT.md` 및 변경하지 않은 기존 전송·엔진 코드다.
사용자의 2026-10-01T14:47:29+09:00 제작 계속 지시 안에서 AI가 다음 구현 항목을 선택했다.
현재 상태: 구현 계획 저장 단계. 이번 실행의 테스트와 원격 코드 저장은 아직 수행하지 않았다.

| 경로 | 입력 본문 | 내부 호출 |
|---|---|---|
| `POST /flow/start-session` | `language`, 선택적 `conversation_boundary_acknowledged` | `transport.startSession(verifiedUserId, language, ack)` |
| `POST /flow/start-explicit-study` | `node_id` | `transport.startExplicitStudy(verifiedUserId, nodeId)` |

`user_id`는 토큰 검증 콜백에서만 얻는다. 본문에 추가 키를 허용하지 않고 URL query도 받지 않는다.
학습 분기·복습 순서·interleaving 순서·ack 처리·Progress 쓰기는 기존 전송과 엔진의 책임이다.
기존 in-process 명시적 학습 전송은 `{ state }`를 반환한다. 이 서버는 EXPLANATION 콘텐츠 조회를 추가하지 않는다.
따라서 `API_CONTRACT.md` §10.1 전체 외부 응답 구현은 아직 완료되지 않는다.

## 호스트 경계

호스트가 검증된 인증 콜백과 학습 전송을 주입한다. 토큰을 단순 디코딩하거나 UUID를 클라이언트에서 받아 신뢰하지 않는다.
인증 발급·게스트 사용자 생성·전환·토큰 저장은 이 어댑터의 구현 범위가 아니다.
인증 또는 학습 전송이 미연결이면 학습 요청은 503이며 DB 호출을 하지 않는다.
CLI는 기본적으로 loopback에서만 실행한다. 모바일 정적 서버와 운영 인증·동일 출처 라우팅은 별도 연결 과제다.
새 의존성·공개 CORS·내부 엔진 엔드포인트를 추가하지 않는다.

## 오류와 제한

성공은 `200 { status: "ok", data }`이며 기존 결과를 변경 없이 전달한다.
정의된 엔진 오류만 기존 매핑을 적용한다: INVALID_ID 404, MISSING_REQUIRED_FIELD/OUT_OF_RANGE_VALUE 400,
UNAUTHORIZED_CALLER 403, CONTRACT_VIOLATION 422. 공개 메시지는 고정 문구이며 내부 진단을 보내지 않는다.
명시적 학습의 검증된 `CapacityAdmissionConflictError`만 기존 클라이언트의 재조회 표식으로 보존한다.
일반 오류 메시지의 문자열을 보고 capacity 거절로 추정하지 않는다.

인증 실패 401, 잘못된 HTTP/JSON 요청 400/405/413/415, 미연결·내부 실행 실패 503은 HTTP 계층의 오류다.
이때 새 엔진 `error_code`를 만들지 않는다. 원문 SQL·토큰·provider 오류는 응답과 CLI 로그에 넣지 않는다.
본문 크기와 처리 시간에 상한을 두고 요청 종료 후 늦게 끝난 인증으로 엔진을 새로 호출하지 않는다.
이미 호출된 기존 DB 엔진의 실행은 HTTP 취소만으로 중단되지 않는다. 연결 종료나 timeout을 DB rollback 증거로 취급하지 않는다.
서버는 요청을 자동 재전송하지 않는다. 기존 Progress의 명시적 학습 idempotency를 유지한다.

## 검증과 후속 작업

실제 Node HTTP 소켓과 기존 모바일 HTTP 전송·세션 제어기로 경계 동작을 검증할 예정이다.
테스트의 인증·학습 전송은 합성 fixture다. 운영 토큰·DB·학습자 데이터를 사용하지 않는다.
실행 증거의 소유 문서는 `VALIDATION_STATUS.md`다. 현재 단계에서는 이번 테스트를 통과했다고 기록하지 않는다.
휴대폰 화면·팝업·터치·브라우저 CSP·대용량 팩 성능·APK 및 실제 운영 서버는 미확인이다.
기존 브라우저 보안 제한을 우회하지 않는다. MOBILE-01/02의 화면 검증 대기도 유지한다.
