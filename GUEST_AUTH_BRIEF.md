# GUEST_AUTH_BRIEF.md

## 범위·근거·현재 상태

MOBILE-04는 기존 `API_LAYER_BRIEF.md` §3, `DATA_PERSISTENCE_BRIEF.md` §3.1,
`CLIENT_BRIEF.md` §4와 `db/migrations/001_create_users.sql`을 소비하는 게스트 인증 서버 구현이다.
최신 사용자 지시: 2026-10-01T21:29:43+09:00 “오케이. 그 다음은?”.
AI가 이전 체크포인트의 다음 설계를 확인하고 아래 한정된 구현을 선택했다.
현재 상태: 계획 기록. 이번 코드·테스트·운영 DB 검증은 아직 실행하지 않았다.

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

## 호스트와 남은 경계

기존 HTTP 서버의 선택적 게스트 발급 콜백과 PostgreSQL 호스트 factory를 연결한다.
기본 CLI는 여전히 인증/전송 미연결 503이다. 운영자가 호스트 모듈·키·기존 PG 환경을 명시해야 활성화된다.
키의 초기화·변경은 호스트의 책임이며 자동 임시 키 생성이나 키의 저장소 커밋을 하지 않는다.
모바일 보안 저장소·자동 초기 진입, 토큰 갱신/복구·계정 전환·동일 출처 라우팅·실제 DB/TLS·APK는 미구현/미확인이다.
이전 합성 다운로드 HTML과 실기기 검증 대기를 보존하며 브라우저 접근을 재시도하거나 우회하지 않는다.
실행 수치와 증거는 `VALIDATION_STATUS.md`, 코드와 다음 세션 기준은 `MOBILE_APP_HANDOFF.md`가 소유한다.
