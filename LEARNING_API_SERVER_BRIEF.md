# LEARNING_API_SERVER_BRIEF.md

## 범위와 기준

MOBILE-03은 기존 `HttpLearningFlowTransport`와 `InProcessLearningFlowTransport`를 연결하는 HTTP 경계다.
기준은 `API_LAYER_BRIEF.md`, `API_CONTRACT.md` 및 변경하지 않은 기존 전송·엔진 코드다.
사용자의 2026-10-01T14:47:29+09:00 제작 계속 지시 안에서 AI가 다음 구현 항목을 선택했다.
후속 MOBILE-04에서는 기존 계약의 `POST /auth/guest`와 선택적 `createGuest`/`onClose` 호스트 연결을 추가했다.
게스트 인증 서버 코드는 `GUEST_AUTH_BRIEF.md`, 최신 직접 실행 증거는 `VALIDATION_STATUS.md` §F를 따른다.
아래 MOBILE-03 범위/증거는 이전 체크포인트로 보존하며 실제 운영 DB·모바일 토큰 저장 완료를 뜻하지 않는다.
현재 상태: HTTP 경계의 코드 후보 구현·선택 자동 검증·모바일 빌드 완료.
실행 증거는 `VALIDATION_STATUS.md` §E, 원격 저장과 최신 커밋 확인은 `MOBILE_APP_HANDOFF.md`를 따른다.

| 경로 | 입력 본문 | 내부 호출 |
|---|---|---|
| `POST /flow/start-session` | `language`, 선택적 `conversation_boundary_acknowledged` | `transport.startSession(verifiedUserId, language, ack)` |
| `POST /flow/start-explicit-study` | `node_id` | `transport.startExplicitStudy(verifiedUserId, nodeId)` |

`user_id`는 토큰 검증 콜백에서만 얻는다. 본문에 추가 키를 허용하지 않고 URL query도 받지 않는다.
학습 분기·복습 순서·interleaving 순서·ack 처리·Progress 쓰기는 기존 전송과 엔진의 책임이다.
기존 in-process 명시적 학습 전송은 `{ state }`를 반환한다. 이 서버는 EXPLANATION 콘텐츠 조회를 추가하지 않는다.
따라서 `API_CONTRACT.md` §10.1 전체 외부 응답 구현은 아직 완료되지 않는다.

## 승인된 최초 학습 계약 연결 — 2026-10-03, 미구현

19:35:16+09:00 사용자 승인으로 API_CONTRACT.md §7.1.1/§10.1과 ENGINE_INTERFACE.md에 R1/initial_practice 계약을 반영했다. 위 state-only 설명은 현재 코드 상태이며 아래는 후속 구현이 충족할 계약이다.

- 기존 POST 경로·body `{node_id}`·인증에서 얻는 user_id·200 `{status:"ok",data}`를 유지한다. 내부 getContent의 selectionProfile·metaLanguage·explanationLevel을 HTTP 입력으로 노출하지 않는다.
- 성공 data는 exact `{explanation,state,initial_practice}`이고 두 Content 필드는 6키 projection 또는 명시적 null이다. 상태-only 응답·필드 생략을 정상 공백으로 승격하지 않는다.
- Content 선택/조회는 Flow→Content에서, admission은 기존 Progress에서 수행한다. HTTP는 SQL·검수 판단·상태 전이를 소유하지 않는다.
- 기존 다섯 엔진 오류 매핑과 capacity 표식은 유지한다. 선택 결과 중복/손상·기술적 조회 실패는 성공 data 없는 503으로 처리하고 신규 engine error_code를 만들지 않는다. 정상 0건은 200의 해당 필드 null이다.
- Progress 성공 후 Content 실패/timeout/연결 종료가 발생해도 admission rollback을 보장하지 않는다. 서버 자동 재전송·보상 삭제는 없으며 같은 사용자/노드의 명시적 재시도는 기존 멱등을 소비한다.
- 첫 시연의 서버 설명 구성은 KO/BEGINNER이며 목표 언어를 엔진에 고정하지 않는다. 기존 Generation EXAMPLE 호출은 새 프로필을 사용하지 않는다.
- 구현/HTTP·PG 검증은 아직 하지 않았다. 기존 MOBILE-03/04/05 증거를 새 계약 검증으로 바꾸지 않는다.

## 호스트 경계

호스트가 검증된 인증 콜백과 학습 전송을 주입한다. 토큰을 단순 디코딩하거나 UUID를 클라이언트에서 받아 신뢰하지 않는다.
MOBILE-03에서는 인증 발급·게스트 생성이 범위 밖이었다. MOBILE-04에서 서버 발급·검증을 추가했다.
계정 전환·모바일 보안 저장소는 여전히 범위 밖이다.
인증 또는 학습 전송이 미연결이면 학습 요청은 503이며 DB 호출을 하지 않는다.
CLI는 기본적으로 loopback에서만 실행한다. 모바일 정적 서버와 운영 인증·동일 출처 라우팅은 별도 연결 과제다.
새 의존성·공개 CORS·내부 엔진 엔드포인트를 추가하지 않는다.

### 실행과 구성

```bash
npm run start:api
npm run test:api
```

기본 CLI 주소는 `http://127.0.0.1:4174`다. 기본 모드는 인증/학습 전송 미연결이므로 학습은 503이다.
포트는 `LLE_API_PORT`로 지정한다. `LLE_API_HOST_MODULE`은 운영자가 관리하는 CommonJS 설정 파일의 경로다.
학습 연결은 `{ transport, resolveUserId }`를 export한다. 선택적 `createGuest`는 발급, `onClose`는 호스트 종료 hook이다.
요청 본문·헤더로 설정 파일을 지정할 수 없다.
코드와 함께 토큰·비밀번호를 저장하지 않는다.

프로그램에서 기존 엔진을 연결하는 함수 예시 (pool과 실제 검증 함수는 호스트가 제공):

```javascript
const { createLearningFlowHttpServer } = require('./src/server/learningFlowHttpServer');
const { InProcessLearningFlowTransport } = require('./src/transport/inProcessLearningFlowTransport');

function makeAuthenticatedApi(pool, verifyAccessToken) {
  return createLearningFlowHttpServer({
    transport: new InProcessLearningFlowTransport(pool),
    resolveUserId: verifyAccessToken,
  });
}
```

`resolveUserId(token, { signal })`는 토큰을 실제 검증하고 UUID 문자열을 반환한다.
만료·무효 토큰은 `null`/`undefined` → 401, provider 예외·UUID 아닌 결과는 503이다.
검증 함수는 signal을 사용해 자신의 외부 호출을 중단할 수 있다. 서버는 늦은 결과로 새 엔진 작업을 시작하지 않는다.
호스트가 DB 연결·종료와 운영 인증·TLS·라우팅을 관리해야 한다. 이 예시는 실제 로그인 공급자 구현이 아니다.
현재 `start:mobile`은 정적 서버이며 `start:api`를 자동으로 proxy하지 않는다.
기존 앱의 `LLE_APP_CONFIG.getAccessToken`/`baseUrl`과 팩 목록은 실제 호스트에서 연결해야 한다.
동일 출처 라우팅은 후속 작업이다. 다운로드용 HTML은 합성 모드와 `connect-src 'none'`을 유지한다.

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

기본 설정: 본문 8192 bytes, 헤더 16384 bytes·`maxHeadersCount` 32,
요청 핸들러 처리 10000 ms, Node `requestTimeout`/`headersTimeout` 15000 ms.
factory의 `maxBodyBytes`, `operationTimeoutMs`, `requestTimeoutMs`로 본문·시간 설정을 주입할 수 있다.
핸들러 진입 전 Node HTTP 파서가 거절하는 요청은 기본 400/408/417/431 응답일 수 있으며 JSON 봉투를 보장하지 않는다.
이 파서 응답도 학습 오류 코드나 성공으로 바꾸지 않는다.

## 검증과 후속 작업

실제 Node HTTP 소켓과 기존 모바일 HTTP 전송·세션 제어기로 경계 동작을 검증했다.
테스트의 인증·학습 전송은 합성 fixture다. 운영 토큰·DB·학습자 데이터를 사용하지 않는다.
실행 증거의 소유 문서는 `VALIDATION_STATUS.md` §E다. 테스트는 운영 엔진/DB·토큰 발급 검증을 대신하지 않는다.
휴대폰 화면·팝업·터치·브라우저 CSP·대용량 팩 성능·APK 및 실제 운영 서버는 미확인이다.
기존 브라우저 보안 제한을 우회하지 않는다. MOBILE-01/02의 화면 검증 대기도 유지한다.

현재 다음 행동은 MOBILE_APP_HANDOFF.md를 따른다. MOBILE-05는 이미 구현·선택 검증된 범위이며 반복하지 않는다.
게스트 서버 발급·사용자 저장 코드는 MOBILE-04에서 추가했으며 실제 PG·운영 인증·모바일 저장 검증은 미확인이다.
콘텐츠와 나머지 세 학습 API는 현재 미구현이다. main 병합·출시·lifecycle CLOSED는 선언하지 않는다.
