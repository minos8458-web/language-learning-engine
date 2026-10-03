# MOBILE_GUEST_START_BRIEF.md

## 1. 목적·근거·상태

MOBILE-05는 **기존 게스트 발급 API를 소비하는 최초 실행·보안 저장·재실행 경계 설계와 클라이언트 구현**이다. §1–10은 설계 기준이며 현재 구현/연결 상태는 §12가 갱신한다.
`CLIENT_BRIEF.md` §4/§7, `API_LAYER_BRIEF.md` §3과 `GUEST_AUTH_BRIEF.md`를 구체화한다.
새 인증 API·서명 방식·users schema·학습 정책을 만들지 않는다.

- 사용자 제작 계속 지시와 직전 체크포인트의 다음 행동이 설계의 근거다.
- 사용자 직접 응답: 2026-10-02T21:10:42+09:00 (Asia/Seoul), “승인”.
- 승인 질문/범위: 온라인 학습·유효 토큰 내 재실행 첫 시연과 `start_explicit_study.initial_practice` 보완 방향. 상세 기록은 `ANDROID_VI_DEMO_ASSESSMENT.md` §0.
- 직접 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 시작 작업 기준선: `d80a91958bacddbbb4fb113071c89aee3128aca9`; 승인 저장/설계 기준선: `a2cecd593c4da92d2371169eff5592d2f9cb44dc` (tree `928fe493ffd8b7a2b4dfa587f00cc0026fcf00bf`).
- 작업 브랜치: `development/mobile-01-session-ui-20261001`; 초안 PR #2 open/draft/unmerged.
- 현재 상태: 주입 저장 adapter 계약을 소비하는 인증 제어기·화면/모바일 진입과 선택 개발 검증 완료 (§12 / `VALIDATION_STATUS.md` §I.1). 실제 native adapter·OS 보안 저장·APK는 미구현/미검증이다. 설계 당시 직접 점검은 §H에 보존한다.
- `initial_practice`의 정확한 계약 보완/코드, APK 호스트 선택/구현, 갱신/복구는 이번 작업에 섞지 않는다.

## 2. 재사용할 코드와 현재 공백

| 기존 부분 | 재사용·연결 방식 |
|---|---|
| `POST /auth/guest` | 기존 입력 없는 발급을 한 번 요청한다. 서버가 사용자 UUID·토큰을 생성하고 INSERT 완료를 확인한다. |
| `guestAuthService.js` / `guestTokenCodec.js` | 발급/서명/만료/현재 GUEST 확인을 재구현하지 않는다. 기본 24시간 수명도 변경하지 않는다. |
| `HttpLearningFlowTransport` | 기존 `getAccessToken`, `fetchImpl`, `baseUrl` 주입을 사용한다. 사용자 ID는 HTTP 바디에 넣지 않는다. |
| `LearningSessionController` | 기존 서버 판단을 표시한다. 인증 준비 후 현재 사용자·설치 언어로 새 제어기를 만든다. |
| 언어팩 service/controller/view | 다운로드·크기/해시·캐시·선택 복구를 그대로 재사용한다. 토큰을 팩 IndexedDB에 넣지 않는다. |
| 명시적 합성 미리보기 | 기존 합성 흐름을 보존한다. 실제 인증/저장/fetch를 사용하거나 연결 실패의 대체가 되지 않는다. |

현재 `mobile/browserEntry.js`는 호스트의 토큰 함수 존재만으로 connected를 정하고, 첫 발급/보안 저장을 하지 않는다.
MOBILE-05 클라이언트 구현에서는 일반 실행의 초기 진입을 인증 준비로 바꾸고 **저장 확인을 마친 READY 상태**로 연결 판정을 제한한다.
현재 HTTP 전송은 401의 공개 메시지도 catch에서 일반 오류로 바꾸므로 화면 문자열로 인증 실패를 추측하지 않는다.
§6의 fetch 주입 경계에서 실제 status를 관찰한다. 기존 HTTP 클래스·capacity 오류·engine five-code registry를 바꿀 필요가 없다.

## 3. 보안 저장 adapter의 최소 내부 계약

호스트가 `guestStore`를 주입한다. 아래 Promise 기반 계약은 클라이언트/호스트 내부 경계다.
외부 HTTP·Tier A·PostgreSQL schema/DB migration이 아니다. 구체적인 네이티브 파일 형식·라이브러리는 아직 선택하지 않는다.

| 메서드 | 정확한 의미 |
|---|---|
| `read()` | `{ kind: 'empty' }`, `{ kind: 'pending' }`, `{ kind: 'stored', guest }` 중 하나를 반환한다. 없는 기록만 empty다. 손상·복호화 실패·호스트 오류·잘못된 형식은 예외다. |
| `beginCreation()` | empty에서 pending으로 **원자적으로** 전환하고 영속 저장 완료 후 true를 반환한다. 이미 pending/stored면 변경하지 않고 false를 반환한다. 읽기 후 쓰기를 별개로 구현하지 않는다. |
| `commitGuest(guest)` | pending에서 stored로 원자적으로 저장한다. 이미 같은 네 필드의 guest가 stored면 안전한 로컬 재시도로 성공할 수 있다. 다른 guest나 예상 밖 empty를 덮어쓰지 않는다. |

`guest`는 기존 발급 응답의 `{ user_id, access_token, token_type, expires_at }` 정확히 네 필드다.
저장 내용과 반환값은 복사본으로 취급하고 UI/설정 객체/전역 변수로 직접 공유하지 않는다.
read 결과의 kind는 정확한 허용 값과 필드만 받는다. 알 수 없는 버전/필드·조각난 기록을 empty로 해석하지 않는다.
begin/commit은 앱의 중복 시작·다중 화면에서도 한 저장 영역에 직렬화돼야 한다.
저장 완료 Promise와 이어지는 read-back이 확인돼야 READY다. 쓰기 호출을 시작했다는 사실은 저장 성공이 아니다.

호스트의 저장 영역은 앱 설치/설정된 API 환경에 귀속한다.
URL·사용자 입력으로 영역을 바꾸거나 다른 서버의 토큰을 재사용하지 않는다.
API 환경과 기존 저장의 관계를 확인할 수 없으면 막는다.
clear/delete/새 사용자 교체 함수는 첫 시연의 adapter에 넣지 않는다. 자동 초기화로 고장·만료를 숨기지 않는다.

**pending이 필요한 이유:** 서버의 INSERT가 끝난 뒤 응답이 유실되거나 저장이 실패하면 토큰이 없는 상태가 된다.
토큰 부재만 보고 다음 실행에서 발급하면 별도 사용자가 생긴다.
요청 전에 pending을 영속 저장하면 발급이 시작된 설치와 깨끗한 첫 설치를 구분할 수 있다.
이는 로컬 발급 표시다. 서버 요청 식별자·중복 제거·같은 게스트 복구나 exactly-once 발급을 구현하는 안이 아니다.

## 4. 최초 실행·발급의 순서

1. 일반 실행은 인증 준비 화면으로 시작한다. 호스트/고정 API 주소/guestStore 메서드가 준비되지 않으면 설정 미연결 상태로 막고 네트워크를 호출하지 않는다.
2. `read()`한다. stored면 §5를 따르고, pending이면 불확실한 발급 상태, read 오류면 저장 오류로 막는다.
3. empty일 때만 `beginCreation()`을 호출한다. true일 때만 다음 한 번의 발급을 시작한다. false면 read로 돌아가며 새 POST를 하지 않는다.
4. 기존 경로에 `POST /auth/guest`, JSON `{}`를 보낸다. `Content-Type: application/json`, no-store, credentials omit, redirect error, AbortController 시간 제한을 사용한다. 기존 Bearer·user_id·timezone·설치 언어를 보내지 않는다.
5. HTTP 200과 `{ status: 'ok', data: guest }`의 정확한 성공 구조를 검증한다. UUID user_id, 비어 있지 않은 printable 토큰(공백/제어문자 금지, 최대 4096), token_type Bearer, 해석 가능한 미래 expires_at이어야 한다. 만료됐거나 잘못된 응답은 저장/학습에 사용하지 않는다.
6. 서버 응답을 private 메모리 후보로 두고 `commitGuest(guest)` 후 `read()`한다. 같은 네 필드의 stored와 유효 시간을 확인한 다음에만 READY로 전환한다.
7. READY가 된 후 기존 언어팩 선택 복구를 실행한다. 설치 팩이 없으면 목록을, 있으면 기존 세션 시작 화면을 표시한다. 팩 본문을 새로 받거나 서버의 학습 종류를 클라이언트가 고르지 않는다.

토큰은 opaque 값이다. 클라이언트가 JWT 서명을 검증했다고 주장하거나 디코딩한 claim으로 사용자·권한을 결정하지 않는다.
반환 user_id는 현재 클라이언트 제어기 문맥일 뿐이며, 서버가 Bearer에서 검증한 user_id가 쓰기 권한의 기준이다.
동일 bootstrap에 대한 중복 호출/버튼 연타는 같은 진행 작업을 공유한다.
발급 요청을 예약/자동 재전송하지 않는다. fetch 시간 초과·취소가 서버 INSERT rollback을 보장하지 않는다.

## 5. 재실행·상태·실패 처리

stored의 형태와 `expires_at > now`를 확인하면 로컬 READY가 될 수 있다.
이것은 서버 인증 성공이 아니다. 실제 flow 요청은 기존 서버의 서명·만료·현재 GUEST 확인을 통과해야 한다.
휴대폰 시간이 부정확해도 서버 검증을 우회하지 않는다. expires_at과 토큰 수명을 클라이언트가 연장하지 않는다.

| 내부 상태 | 학습 연결·허용 행동 |
|---|---|
| CHECKING / CREATING / SAVING | 학습/중복 발급 비활성. 게스트 준비 표시. 서버 발급은 empty→pending 성공 한 번에만 연결한다. |
| READY | private 토큰 접근 함수를 주입하고 설치된 언어로 새 제어기를 사용한다. 사용자 ID·토큰 재발급 없음. |
| HOST_UNAVAILABLE | 호스트/주소/adapter 미연결. 안내 후 준비 상태를 다시 확인할 수 있다. 가짜 저장소/토큰 사용 없음. |
| STORAGE_ERROR | 읽기/쓰기/read-back 실패. 학습 불가. “저장 다시 확인”은 로컬 read/동일 후보 commit만 수행한다. |
| CREATION_UNCERTAIN | pending이나 발급 응답 유실/실패/잘못된 응답. 학습 불가. 다시 확인은 read만 하며 신규 POST를 하지 않는다. |
| EXPIRED | 저장 토큰 만료. 학습 불가. 팩/기존 인증 기록을 보존한다. 갱신/복구 미지원 안내. 새 게스트 자동 생성 없음. |
| AUTH_REJECTED | 현재 토큰의 flow 응답이 실제 401. 연결 비활성. 토큰/팩 보존. refresh나 게스트 발급을 호출하지 않는다. |
| DISPOSED | 화면/앱 문맥 종료. 늦은 완료를 화면에 반영하거나 새 학습 요청을 하지 않는다. |

공개 상태는 표시 이름/안내만 갖고 access_token·응답 객체·내부 예외를 포함하지 않는다.
다음 처리도 구현 계약에 포함한다.

- **쓰기 완료 응답만 유실된 경우:** 다시 read했을 때 같은 guest가 stored면 READY로 복구할 수 있다. 같은 프로세스에만 남은 유효 후보와 pending이면 동일 후보의 commit/read-back을 재시도한다. 신규 POST는 하지 않는다.
- **pending으로 종료된 경우:** 다음 실행에 후보 토큰이 없으면 CREATION_UNCERTAIN으로 막는다. 이 버전에는 해당 계정을 복구할 API가 없다. 초기화/재설치가 학습 진도 복구라는 의미는 아니다.
- **후보 만료·손상/다른 저장 사용자:** 오래된 메모리 후보로 덮어쓰지 않는다. 기기 저장·서버 복구의 별도 결정 전까지 막는다.
- **처음부터 read 실패:** 이를 empty로 간주하지 않는다. 호스트 연결/저장 read 재시도는 가능하지만 발급은 empty가 정확히 확인되고 beginCreation이 성공해야 가능하다.
- **일반 flow 네트워크 오류/503:** 저장한 사용자·토큰을 유지하고 기존 학습 연결 재시도를 사용한다. 401로 분류하거나 인증을 새로 만들지 않는다.
- **기기 시계 수정:** 로컬 표시를 다시 확인할 수 있지만 만료 시간을 변경하지 않는다. 서버 401은 같은 실행에서 막힌 상태로 유지한다. 재실행 후 저장 토큰을 시도해도 동일 토큰일 뿐 새 사용자 발급은 없다.
- **앱 종료:** 진행 중 네트워크는 가능한 범위에서 abort한다. 이미 시작한 영속 저장은 중간 삭제하지 않고 끝나게 할 수 있다. 늦은 응답은 현재 UI/세션을 활성화하지 않는다. 서버/OS 저장 취소·rollback을 보장하지 않는다.

사용자 안내는 “게스트 연결을 준비하고 있어요”, “학습 연결을 저장하지 못했어요. 다시 확인해 주세요”,
“기존 게스트 연결을 확인하지 못했어요”, “게스트 연결이 만료됐어요. 이 시연판은 만료 후 복구를 지원하지 않아요” 정도로 한정한다.
키·SQL·HTTP 응답 원문·토큰은 표시/로그에 넣지 않는다.

## 6. 기존 모바일 화면·HTTP 전송 연결

일반 실행에서 인증 준비 완료 후 `mountPicker(true)`의 기존 선택 복구를 재사용한다.
기존 함수가 존재한다는 사실 대신 인증 제어기의 READY 상태로 connected를 정한다.
`getAccessToken()`은 private 기록을 참조하는 async 함수이며 READY와 만료를 다시 확인한다.
다른 상태에서는 null을 반환해 기존 전송이 네트워크를 보내지 못하게 한다.
언어를 바꿀 때 새 학습 제어기를 만들되 같은 guest/token을 사용한다. 사용자 ID를 언어에 종속시키지 않는다.

`fetchImpl` 주입 wrapper는 **현재 설정 API의 기존 두 flow 경로에만** 적용한다.
호출 직전 현재 토큰/실행 문맥과 Authorization이 일치하는지 확인하고, 실제 응답 status가 401이면 해당 문맥을 AUTH_REJECTED로 바꾼다.
body를 추가로 읽거나 오류 봉투를 바꾸지 않고 원 응답을 기존 전송으로 돌려준다.
503/일반 실패와 engine error_code/capacity retry 표식을 그대로 두며 내부 오류 코드를 registry에 추가하지 않는다.
오래된 문맥의 늦은 401·응답이나 dispose 후 callback이 새 화면/인증을 바꾸지 않게 문맥 번호를 검사한다.
차단 전환 시 학습 view/제어기를 종료해 늦은 성공 응답도 진행 화면을 덮어쓰지 못하게 한다.
`/auth/guest`는 이 인증 wrapper나 학습 token 함수를 호출하지 않는 별도 입력 없는 요청이다.

인증 연결 방식은 먼저 한 번 결정한다. 명시적 미리보기면 합성 흐름, guestStore만 설정되면 이 문서의 관리 게스트 흐름,
기존 getAccessToken만 설정되면 기존 호스트 관리 흐름이다.
두 방식이 동시에 설정되면 암묵적으로 하나를 무시하지 않고 HOST_UNAVAILABLE로 막아 설정을 확인한다.
아무 방식도 없으면 미연결로 남긴다. 호스트 관리 방식에 첫 발급/기기 영속 저장이 있다고 가정하지 않는다.

`LLE_APP_CONFIG`에는 고정 API 설정·adapter 함수만 둔다. 토큰 원문이나 사용자 자격증명을 정적 config/URL에 넣지 않는다.
기존 호스트 token callback 연결 방식의 호환 경계는 유지하되, 이 콜백만 주어진 경로는 **호스트 관리 인증 연결**로 분류한다.
guestStore 기반 영속 저장/최초 게스트 자동 발급을 검증한 것으로 취급하지 않는다.
미리보기는 인증 준비를 거치지 않고 기존 합성 화면을 표시한다. 실제 저장·네트워크 접근은 0이어야 한다.

## 7. 네이티브 저장소가 충족해야 할 경계 — 후속 구현

Android Keystore는 암호 키와 암호 연산을 보호한다. 토큰 문자열 저장 성공을 의미하지 않는다.
기존 보안 저장 요구를 충족하려면 앱 전용 인증 기록을 보호하고 read/원자적 begin/commit을 구현하는 adapter가 필요하다.
키·암호문 저장 위치·복호화 실패 처리·SDK 범위·플러그인 또는 bridge 선택은 Android 호스트 변경안에서 정확히 정하고 필요한 승인을 받은 뒤 구현한다.
이번 문서는 특정 플러그인을 설치/선정하거나 Android 프로젝트 구조를 승인한 것으로 기록하지 않는다.

후속 호스트가 지켜야 할 요구는 다음과 같다.

- OS 키로 보호한 앱 전용 기록. 평문 localStorage/IndexedDB/SharedPreferences, 서버 서명 키 포함, Web bundle 내 하드코딩 키를 보안 저장 대체로 쓰지 않는다.
- 인증 기록은 일반 언어팩 캐시/다운로드 폴더와 분리한다. 백업/기기 간 복원으로 암호문만 옮긴 경우를 새 게스트 발급의 근거로 삼지 않는다.
- 승인된 동일 기기 재실행 시연에 필요한 저장을 제공한다. 인증 백업/계정 복구는 추가하지 않고, 인증 기록의 백업 제외를 호스트 빌드에서 확인한다.
- bridge를 쓴다면 설정된 앱 origin/주 frame에서만 저장 기능을 노출한다. 임의 origin/iframe/외부 navigation에 권한을 주지 않는다. top-level URL 문자열만 확인한 legacy bridge를 안전한 origin 검증으로 설명하지 않는다.
- 팩 콘텐츠는 데이터/텍스트로 소비하고 executable script/임의 HTML을 인증 bridge 권한 안에서 실행하지 않는다.
- API는 신뢰된 HTTPS 주소에 고정하고 credentials를 query/redirect 대상/로그로 보내지 않는다. 실제 주소·같은 출처 라우팅·WebView 네트워크 구조는 후속 호스트 설계에서 확정한다.
- 키 접근 오류·손상·복호화 실패는 STORAGE_ERROR로 전달한다. 평문 fallback이나 자동 clear를 제공하지 않는다.
- 서버 HS256 발급 키는 휴대폰/adapter가 아니라 서버 호스트에만 둔다. 기기에는 서버가 발급한 사용자 접근 토큰만 전달한다.

공식 근거(2026-10-02 확인):
[Android Keystore](https://developer.android.com/privacy-and-security/keystore),
[WebView native bridge 위험](https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges),
[현재 JavaScript bridge 접근 안내](https://developer.android.com/develop/ui/views/layout/webapps/native-api-access-jsbridge),
[Auto Backup 포함/제외](https://developer.android.com/identity/data/autobackup).
위 자료를 소비한 경계 설계는 AI의 설계 판단이다. 공식 문서 열람·합성 adapter 검증이 기기 보안/독립 보안 리뷰의 증거가 아니다.

## 8. 학습 진도·팩·만료의 정확한 범위

- 같은 유효 guest/token으로 재실행하고, 같은 기기의 설치 팩을 기존 캐시에서 복구한다.
- 학습 진도/attempt는 기존 서버 PG에 저장한다. 새로운 학습 제어기의 `start_session`으로 서버 판단을 다시 읽는다.
- 클라이언트가 이전 State/진도를 자체 재계산하거나 “단원 완료” 테이블을 만들지 않는다.
- 재실행 시 conversation acknowledgement·현재 문제/입력/화면 위치는 기존 계약대로 새 세션 메모리다. 정확한 중간 화면 복원 요구를 추가하지 않는다.
- 토큰 만료 후 진도 자동 복구·다른 기기·앱 삭제/데이터 초기화 후 복구·계정 전환은 첫 시연 완료 조건에 포함하지 않는다.
- 초기 다운로드 부담/나라·언어 목록/확인 팝업/용량·Wi-Fi 안내·다운로드 재시도와 다국어 데이터 분리는 유지한다.
- 베트남어 데이터나 특정 content_id를 인증 제어기에 하드코딩하지 않는다.

## 9. 클라이언트 구현 완료 기준·후속 검증

다음 구현 작업은 합성 adapter/네트워크 fixture와 필요 시 기존 실제 Node HTTP 서버를 사용한다.
실제 사용자·PG·Android 데이터 생성은 이 테스트의 전제가 아니다.

| 확인 항목 | 관찰할 결과 |
|---|---|
| 첫 empty 실행 | beginCreation 영속 확인 → 발급 한 번 → commit/read-back → READY 순서. 저장 전 flow 0회. |
| 동시 bootstrap/연타 | 한 진행 작업과 원자적 begin으로 발급 한 번. 중복 발급 없음. |
| 유효 stored 재실행/언어 변경 | 같은 네 필드/user_id 사용, 신규 guest POST 0회, 설치 캐시 재사용. |
| pending 재실행/발급 시간 초과 | 신규 POST·flow 0회, CREATION_UNCERTAIN 표시. |
| adapter 부재/read·begin 실패 | 발급·flow 0회, 평문 fallback/삭제 없음. |
| 저장 ACK/read-back 실패 | 학습 0회. 같은 후보의 로컬 저장만 재시도. 저장 내용이 다르면 덮어쓰기 없음. |
| 잘못된 성공 구조/UUID/token/만료 | READY/학습 진입 0회. 응답 원문/토큰 노출 없음. |
| 로컬 만료/실제 flow 401 | 연결 차단, 신규 guest/refresh 0회, pack/user 기록 보존. |
| flow 503/네트워크·capacity 거절 | 기존 오류/재시도 의미 유지, 인증 재발급·registry 변경 없음. |
| dispose/늦은 응답 | 현재 화면/새 세션/다른 사용자 상태를 덮어쓰지 않음. |
| 기존 합성 미리보기/호스트 토큰 연결 | 미리보기 실제 인증/저장/fetch 0회. 호스트 관리 방식의 기존 연결은 호환을 유지하며 저장 검증으로 승격하지 않음. |
| 모바일 빌드 | 클라이언트 모듈만 포함. 서버 키/Node crypto/PG 의존성·운영 자격증명 제외. |

이는 구현 완료 기준이며 **이번 문서 작성에서 테스트를 실행했다는 뜻이 아니다**.
UI DOM 검증과 실제 렌더링/터치·Keystore/bridge·앱 종료·설치·OS 저장은 별도다.
이전 자동 검증 통과나 이 설계 점검으로 Android의 여섯 단계 완주·Validation Level 3 전체 PASS·학습 효과를 선언하지 않는다.

## 10. 다음 행동 하나

**현재 다음 행동 하나:** 승인된 `start_explicit_study.initial_practice` 방향의 정확한 응답·null·오류 계약을 기존 API/Content·Generation·Progress와 대조해 검토 가능한 설계로 구체화한다. canonical API/코드 변경과 새 Android host 구현은 동시에 시작하지 않는다.

아래는 완료한 클라이언트 구현의 파일/보존 경계다.

예정 파일 범위는 `src/client/guestSessionController.js`, `src/client/mobileGuestView.js`,
`mobile/browserEntry.js`, `mobile/styles.css`, `scripts/build-mobile.js`,
`tests/guestSessionClient.test.js`와 필요한 기존 모바일 테스트·관련 상태/인계 문서다.
파일명은 구현 선택이며 기존 LearningSessionController/엔진·HTTP 학습 전송·API/schema를 재작성하지 않는다.
실제 안전한 host adapter가 없을 때 일반 앱은 닫힌 미연결 상태로 남긴다.
합성 테스트용 store는 운영 기본값으로 포함하지 않는다. 새 dependency·Android SDK 설치·서버/API 변경을 동시에 하지 않는다.
`initial_practice`의 정확한 계약 보완/구현과 Android 호스트·네이티브 저장/APK는 후속 단일 작업으로 남긴다.

## 11. 클라이언트 구현 착수 범위 — 2026-10-02

사용자 직접 지시: 2026-10-02T21:46:25+09:00 “다음작업 계속 진행해”.
위 §1–10 설계를 소비하는 작업을 시작한 당시의 범위 기록이다. 현재 코드/선택 개발 검증 완료 상태는 §12를 따른다.

- 구현 파일: `src/client/guestSessionController.js`, `src/client/mobileGuestView.js`, `mobile/browserEntry.js`, `mobile/styles.css`, `scripts/build-mobile.js`.
- 검증 파일: `tests/guestSessionClient.test.js`, 필요한 `tests/mobileClient.test.js` 기대값/번들 연결 검사. `package.json`의 `test:mobile`에 새 검증 파일만 추가한다. 새 dependency·lock 변경 없음.
- AI 실행 선택: 발급 fetch와 저장 Promise 모두 기본 10초의 대기 한도를 둔다. 이미 시작한 저장은 늦게 완료될 수 있고 rollback을 보장하지 않는다. Promise 확인 실패를 새 POST로 대체하지 않는다.
- “저장 다시 확인”은 read/같은 private 후보의 commit만 재시도하며 새 발급을 하지 않는다. 첫 read/호스트 오류 뒤 empty만 확인되면 해당 실행에서는 막힌 상태로 남긴다. 새 앱 실행의 정확한 empty→pending 확인과 구분한다.
- 관리 게스트의 API 주소는 고정 HTTPS다. relative 경로는 호스트 origin에 고정한다. 일반 앱에 insecure/test-only 주소 fallback을 넣지 않는다. 합성 fetch fixture/실제 Node loopback HTTP 검증은 운영 TLS 성공이 아니다.
- 앱 pagehide에서 화면/인증 문맥을 종료한다. bfcache pageshow는 저장 기록을 다시 읽는 새 문맥으로 시작한다. 종료된 async 응답이 복원된 화면을 바꾸지 않게 한다.
- token callback만 제공한 기존 호스트 모드는 보존한다. 명시적 미리보기는 실제 인증/저장/fetch 0회를 유지한다. 저장 호스트가 없는 일반 실행은 게스트 미연결 화면으로 막는다.
- 서버/엔진·기존 학습 제어기/HTTP 전송·언어팩 service/controller/view·canonical API/Tier A/schema/migration·Validation 판정 규칙은 보존한다.
- 실제 Keystore/bridge adapter·Android 프로젝트/SDK/APK·실제 PG/HTTPS·콘텐츠 검수/배포·학습 효과는 이번 검증 완료로 승격하지 않는다.

## 12. 클라이언트 구현 결과·호스트 연결 — 2026-10-02

- `src/client/guestSessionController.js`: private 인증/후보·정확한 tagged 저장 검증, 원자 발급 표시 저장 재확인 후 POST, commit/read 같은 기록 확인 후 READY, 유효 기록 복구, 실패/timeout/만료/401 처리.
- `src/client/mobileGuestView.js`: 준비/저장/실패/만료/미연결 화면과 “저장 다시 확인”. 토큰/내부 진단을 표시하지 않는다.
- `mobile/browserEntry.js`: READY 후 기존 mountPicker(true)·설치 팩 복구/선택 언어로 기존 세션·같은 게스트를 유지하는 언어 변경·pagehide 종료/persisted pageshow 새 문맥. 오래된 async 결과의 화면 변경을 막는다.
- 관리형 `window.LLE_APP_CONFIG.guestStore`는 §3의 실제 host adapter를 주입해야 한다. `baseUrl`은 고정 HTTPS이며 생략 시 HTTPS 앱 origin이다. 관리형 user_id는 확인된 저장 기록에서 얻는다.
- getAccessToken callback만 있으면 기존 host 모드다. guestStore와 callback 동시 설정/둘 다 미설정이면 HOST_UNAVAILABLE이다. 명시적 preview는 실제 store/토큰/fetch 0회다.
- flow fetch는 허용된 두 경로/POST/현재 Bearer만 전송하며 원본 응답을 그대로 반환한다. 401은 현재 인증을 막고 원문/error_code/capacity 표식을 바꾸지 않는다. 일반 오류/503은 기존 재시도를 유지한다.
- 발급은 JSON까지 대기 한도를 적용한다. 저장 확인 timeout/취소 후 쓰기가 늦게 끝날 수 있다. UI 종료가 저장 rollback/서버 INSERT 취소를 보장하지 않는다.
- 받은 flow 응답 본문은 기존 HTTP 전송이 읽는다. 호출자의 signal은 본문 읽기 동안 연결한다. 이미 넘긴 본문을 재파싱/감싸거나 그 401 응답을 취소하지 않는다.
- expiry는 기록 복구/getState/getUserId/getAccessToken/flow 요청·응답 시 확인한다. 백그라운드 타이머로 만료 즉시 화면 전환을 보장하지 않는다.
- 실제 Keystore/앱 전용 암호문/신뢰 origin bridge·backup 제외/OS 재부팅 저장 검증은 없다. production store 기본 구현·평문 fallback을 넣지 않았다. 테스트의 합성 store를 앱에 넣지 않는다.
- 빌드 whitelist에 두 클라이언트 파일만 추가하고 test:mobile 목록을 확장했다. 기존 엔진/서버/학습 제어기·전송/팩 service·controller·view/API/schema/lock은 원문 그대로다.
- 선택 개발 검증/빌드·정확한 명령·미실행 경계는 `VALIDATION_STATUS.md` §I.1이 소유한다. Android 첫 실행/안전 저장/팩·단원·진도 성공으로 승격하지 않는다.
- 다음 행동 하나: 승인된 `start_explicit_study.initial_practice` 방향의 정확한 응답·null·오류 계약을 기존 API/Content·Generation·Progress와 대조해 검토 가능한 설계로 구체화한다. canonical API/코드 변경과 새 Android host 구현은 동시에 시작하지 않는다.
