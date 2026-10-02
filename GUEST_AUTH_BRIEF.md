# GUEST_AUTH_BRIEF.md

## 범위·근거·현재 상태

MOBILE-04는 기존 `API_LAYER_BRIEF.md` §3, `DATA_PERSISTENCE_BRIEF.md` §3.1,
`CLIENT_BRIEF.md` §4와 `db/migrations/001_create_users.sql`을 소비하는 게스트 인증 서버 구현이다.
최신 사용자 지시: 2026-10-01T21:29:43+09:00 “오케이. 그 다음은?”.
AI가 이전 체크포인트의 다음 설계를 확인하고 아래 한정된 구현을 선택했다.
현재 상태: 게스트 인증 서버 코드 후보 구현·선택 자동 검증·모바일 빌드 완료.
직접 실행 증거는 `VALIDATION_STATUS.md` §F, 코드 원격 저장 상태는 `MOBILE_APP_HANDOFF.md`를 따른다.
실제 PostgreSQL·운영 자격증명·휴대폰 보안 저장소는 미검증이다.

## 외부 HTTP 경계

`POST /auth/guest`는 새 게스트 생성이다. 입력 없는 POST 또는 빈 JSON 객체 `{}`를 받는다.
클라이언트가 user_id/auth_identifier/timezone을 지정할 수 없다. 기존 요청 크기·시간 제한을 적용한다.
성공은 `200 { status: "ok", data: { user_id, access_token, token_type: "Bearer", expires_at } }`다.
응답은 no-store이며 인증값을 URL·로그·정적 앱 번들에 넣지 않는다.
이 응답 필드는 이번 HTTP 구현 선택이며 기존 엔진의 five-code registry와 학습 응답을 바꾸지 않는다.
인증 발급 미연결·저장/실행 실패는 HTTP 503, 잘못된 발급 요청은 HTTP 400/413/415다. 새 엔진 오류 코드를 만들지 않는다.
`/auth/convert`, refresh·복구 API와 나머지 학습 API는 열지 않는다.

## 사용자 저장·토큰 검증

서버가 user_id와 별도 auth_identifier UUID를 생성하고 기존 users 컬럼만 INSERT한다.
auth_provider는 GUEST, timezone은 호스트 IANA 설정(기본 UTC), display_name/converted_at은 NULL이다.
가입 입력을 늘려 기기 timezone을 추정하지 않는다. timezone 변경 UI와 출시 기본값 확정은 후속 작업이다.
한 INSERT의 완료를 확인하기 전에는 토큰을 응답하지 않는다. 토큰 준비 실패는 INSERT 이전에 닫는다.
HTTP 종료 후 이미 시작한 저장은 자동 rollback된다고 보장하지 않으며 자동 재전송하지 않는다.

서명 방식은 서버의 32-byte 키로 HS256을 사용하는 자기 발급 JWT다. Node crypto를 사용하며 새 의존성은 추가하지 않는다.
헤더·알고리즘은 고정하고 issuer/audience·UUID subject/guest identifier·발급/만료 시각·정확한 형식을 검증한다.
토큰 유효 시간의 기본값 86400초, 최대 설정 2592000초는 이번 AI 구현 선택이다. 출시 정책 확정으로 취급하지 않는다.
유효 토큰도 현재 users 행의 user_id/auth_provider/auth_identifier가 일치해야 한다.
사용자 삭제나 추후 계정 전환은 기존 GUEST 토큰의 다음 요청을 막는다. 계정 전환 자체를 이번에 구현하지 않는다.
실패한 서명·만료·사용자 확인은 401이다. DB/호스트 오류는 503이고 내부 SQL/키/토큰 진단은 노출하지 않는다.
만료·키 변경·응답 유실을 새 게스트 자동 생성으로 복구하지 않는다. 기존 학습 기록 복구·갱신은 후속 설계다.

발급 전용 헤더 `alg=HS256`, `typ=lle-guest+jwt`와 issuer `lle-guest`/audience `lle-learning-api`를 고정한다.
claim은 `iss`, `aud`, `sub`, `jti`, `iat`, `exp` 정확히 여섯 개이며 canonical JSON/base64url 형식의 자기 발급 토큰만 받는다.
서명을 일정 시간 비교로 확인한 뒤 claim을 읽는다. 다른 JWT 발급자·OAuth 토큰·임의 kid/JWK/algorithm을 지원하지 않는다.
DB 조회 뒤에도 만료·취소를 다시 확인한다. 토큰 갱신·키 rotation을 구현한 것으로 보고하지 않는다.

기술 확인 근거: [RFC 7518 §3.2](https://www.rfc-editor.org/rfc/rfc7518.html#section-3.2)의 HS256 키/서명 방식,
[RFC 8725](https://www.rfc-editor.org/rfc/rfc8725.html)의 algorithm·issuer/audience·type 검증 원칙,
[Node crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html)의 HMAC·timingSafeEqual API.
이는 구현 선택의 근거이며 독립 보안 리뷰나 운영 적합성 판정이 아니다.

## 호스트와 남은 경계

기존 HTTP 서버의 선택적 게스트 발급 콜백과 PostgreSQL 호스트 factory를 연결한다.
기본 CLI는 여전히 인증/전송 미연결 503이다. 운영자가 호스트 모듈·키·기존 PG 환경을 명시해야 활성화된다.
키의 초기화·변경은 호스트의 책임이며 자동 임시 키 생성이나 키의 저장소 커밋을 하지 않는다.
모바일 보안 저장소·자동 초기 진입, 토큰 갱신/복구·계정 전환·동일 출처 라우팅·실제 DB/TLS·APK는 미구현/미확인이다.
이전 합성 다운로드 HTML과 실기기 검증 대기를 보존하며 브라우저 접근을 재시도하거나 우회하지 않는다.
실행 수치와 증거는 `VALIDATION_STATUS.md`, 코드와 다음 세션 기준은 `MOBILE_APP_HANDOFF.md`가 소유한다.

### 실행 방법

프로그램 연결은 `createPostgresGuestHost({ pool, signingKey, defaultTimezone, tokenTtlSeconds })`를 사용한다.
factory의 pool은 기존 `pg` pool이고 signingKey는 호스트가 암호학적 난수로 생성해 관리하는 32-byte Buffer다.
반환 `{ transport, resolveUserId, createGuest, onClose }`를 HTTP 호스트에 주입한다.
CLI용 설정 파일은 `scripts/postgres-guest-host.js`이며 `LLE_API_HOST_MODULE`로 명시적으로 선택한다.
`onClose` hook은 서버 종료 후 pool을 종료한다.

| 호스트 환경값 | 의미 |
|---|---|
| `LLE_API_HOST_MODULE=scripts/postgres-guest-host.js` | 기존 PG pool과 게스트 서비스 연결 |
| `LLE_GUEST_SIGNING_KEY` | 안전하게 생성·보관한 32-byte 키의 canonical base64url (43글자, padding 없음) |
| `LLE_GUEST_TIMEZONE` | 이름 있는 IANA timezone. 생략 시 UTC |
| `LLE_GUEST_TOKEN_TTL_SECONDS` | 1~2592000초. 생략 시 86400초 |
| 기존 `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE` | 기존 PostgreSQL 연결 |

위 환경값을 운영자가 자신의 환경에서 준비한 뒤 `npm run start:api`를 실행한다.
키 값은 호스트의 비밀 설정으로 보관한다. 키가 없으면 이 호스트 시작은 실패한다.
이 세션에서 호스트를 실제 PG에 연결하거나 migration을 실행하지 않았다.
합성 pool로 HTTP 발급→서명/계정 확인→기존 클라이언트 요청과 종료 hook을 검증했다.

후속 MOBILE-05 경계 설계는 `MOBILE_GUEST_START_BRIEF.md`에 완료했다 (2026-10-02).
클라이언트/네이티브 보안 저장 구현과 실제 PostgreSQL/휴대폰 검증은 아직 완료하지 않았다.
현재 다음 행동 하나: 해당 설계의 클라이언트 게스트 준비 제어기·adapter 경계·모바일 진입 연결을 구현하고 선택 검증한다.
온라인·유효 토큰 내 재실행 시연/`initial_practice` 방향 승인 기록은 `ANDROID_VI_DEMO_ASSESSMENT.md` §0을 따른다.
