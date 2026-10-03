# 최초 명시적 학습 응답 계약 후보

## 0. 지위·승인·기준선

- 작성일: 2026-10-03 (Asia/Seoul). 상태: **설계 후보 작성 완료 / 정확한 계약 승인 대기 / 미구현**.
- 사용자 요청: 최신 원격 인계 확인 후 MOBILE-05를 재작성하지 않고 다음 계약 설계 한 작업만 진행. 2026-10-03T14:38:26+09:00의 “승인한다”는 새 clone·기존 작업 브랜치 연결 승인이다.
- 이전 방향 승인: 2026-10-02T21:10:42+09:00, 온라인·유효 토큰 내 첫 시연과 `start_explicit_study.initial_practice` 보완 방향. 아래의 세부 선택이나 Content 내부 입력 확장을 이미 승인한 것으로 해석하지 않는다.
- 원격 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 후보 설계의 읽기 기준: `c14166731d5179e40783a1515de8e82f0925b094`, 브랜치 `development/mobile-01-session-ui-20261001`, PR #2 초안·미병합.
- MOBILE-05 구현 보존 기준: `00f7909aefbc447999bfc77e32dae90e99aa9580`. 이번 변경은 문서뿐이다.
- 이 문서는 canonical 계약을 덮어쓰지 않는다. `API_CONTRACT.md`, `ENGINE_INTERFACE.md`, Tier A·schema·migration·Validation 판정 규칙·소스는 변경하지 않았다.

## 1. 직접 확인한 근거와 공백

| 근거 | 현재 약속/구현 | 이번 설계에 미치는 영향 |
|---|---|---|
| `API_CONTRACT.md` §10.1 | 설명 콘텐츠와 state, 설명 없음은 null이어도 상태 갱신, 중복 호출은 멱등 | 정확한 설명 필드명·cardinality·최초 QUIZ 필드가 필요 |
| 같은 문서 §4.3, AC-013 | Progress의 기존 행 확인이 capacity보다 먼저, 신규 admission만 제한 | Flow에서 state나 capacity를 재계산하지 않음 |
| 같은 문서 §5.1, `generationEngine.js` | PRE_MADE는 EXAMPLE, metadata null, 사다리 응답 exact 4키 | 최초 QUIZ를 이 경로에 끼워 넣지 않음 |
| 같은 문서 §7.1, `contentEngine.js:getContent` | 조건 조회는 배열, 단독 ID는 객체. 조건 조회는 HUMAN_AUTHORED·active·노드 포함 조건 | 현재 조회만으로 검수·대표·단일 노드 조건을 보장하지 못함 |
| `contentEngine.js:projectContent` | 정확히 6필드. human_reviewed/is_canonical/source/version은 노출하지 않음 | Flow가 받은 projection에서 검수 여부를 추정할 수 없음 |
| `ENGINE_INTERFACE.md` §2–3 | Content는 리프, Flow는 조정자. 명시적 직접 Content 호출 설명은 EXPLANATION 중심 | QUIZ 조회 허용과 내부 선택 조건의 명시적 계약 보완 필요 |
| `CONTENT_SCHEMA.md` §4/§9 | 노드+타입당 canonical 최대 1개 | 중복에서 첫 행을 임의 선택하지 않음 |
| `CONTENT_PRODUCTION_STANDARD.md` §4.3, `VI_CONTENT.md` §0 | 검수에는 별도 절차가 필요 | true 플래그 자체가 실제 검수의 증거는 아님 |
| `inProcessLearningFlowTransport.js` | 현재 Progress.recordExplicitStudy 직접 호출 후 `{state}`만 반환 | 실제 Flow의 설명/QUIZ 조정은 아직 구현되지 않음 |
| 기존 HTTP 서버/전송 | `/flow/start-explicit-study`, body `{node_id}`, 인증 user_id, `{status:"ok",data}` | 경로·외부 입력·오류 코드·인증 경계 유지 |

`ANDROID_VI_DEMO_ASSESSMENT.md` §5.1의 승인 방향을 소비한다. 그 §5.1은 평가 문서의 절 번호이며, `API_CONTRACT.md` §5.1(Generation)을 개정하라는 뜻이 아니다. 직접 보완할 외부 계약은 API §10.1이다.

## 2. 외부 요청 계약 — 보존

```http
POST /flow/start-explicit-study
Authorization: Bearer <access_token>
Content-Type: application/json

{"node_id":"GRAMMAR_VI_DA"}
```

- 경로·메서드·body 허용 키는 기존과 같다. `user_id`는 토큰으로 확인한 서버 값이다. 클라이언트가 body에 넣으면 기존 추가 키 거절 규칙을 적용한다.
- `node_id` 누락은 `MISSING_REQUIRED_FIELD`, null/문자열 외 값은 `CONTRACT_VIOLATION`. 문자열이지만 없는 ID는 `INVALID_ID`; 빈 문자열/공백 문자열을 trim해서 다른 ID로 바꾸지 않는다. 현재 HTTP 경계는 문자열 형식만 검사하고 존재성은 Progress가 판정한다.
- language, meta_language, explanation_level, selection_profile, content_id를 외부 입력으로 추가하지 않는다. 서버 구성의 설명 언어/수준을 사용한다.
- 내부 Flow 호출 후보 이름은 `startExplicitStudy(pool, userId, nodeId)`이다. timestamp는 서버가 기존 방식으로 생성해 Progress에 전달한다. 새 외부 API가 아니다.

## 3. 성공 응답 후보 — 정확히 3필드

HTTP 200의 기존 envelope `{status:"ok", data:…}` 안에 아래 data를 넣는다. in-process 반환은 data 객체 자체다.

| 키 | 필수 여부 | 값 |
|---|---|---|
| `explanation` | 항상 존재 | 아래 6필드 Content projection 또는 명시적 null |
| `state` | 항상 존재 | Progress.recordExplicitStudy가 반환한 state 그대로 |
| `initial_practice` | 항상 존재 | 아래 6필드 QUIZ Content projection 또는 명시적 null |

새 성공 data의 추가 top-level 키는 허용하지 않는다. `content`, `content_id`, `source`, `ladder_step`, `reason`, `ready`를 중복 추가하지 않는다. 두 콘텐츠 필드는 optional이 아니며 `undefined`/필드 생략/빈 배열로 null을 대신하지 않는다.

`state`는 기존 Progress의 6개 enum(`NOT_INTRODUCED`, `INTRODUCED`, `STUDYING`, `PRACTICING`, `MASTERED`, `AUTOMATIC`) 이외 값을 만들지 않는다. 정상 신규 admission은 INTRODUCED, 기존 행은 현재 상태 그대로다. 기존 저장 행의 NOT_INTRODUCED도 Progress 구현이 그대로 반환할 수 있으므로 Flow가 이를 INTRODUCED로 고치지 않는다. 해당 경우 클라이언트는 문제 제출 가능으로 판정하지 않고, 기존 데이터/진입 정책을 별도 확인한다. 이번에 저장 행을 보정하지 않는다.

두 projection은 `contentEngine.js:projectContent`의 아래 6키를 그대로 사용한다.

| 키 | 설명 | 최초 문제 |
|---|---|---|
| `content_id` | 실제 저장 ID | 실제 저장 ID, 추후 제출 시 그대로 사용 |
| `grammar_node_ids` | 정확히 요청 node_id 하나 | 정확히 요청 node_id 하나 |
| `content_type` | `EXPLANATION` | `QUIZ` |
| `media_assets` | 저장된 Content 배열 | 저장된 Content 배열 |
| `difficulty` | 기존 projection의 숫자 | 기존 projection의 숫자 |
| `type_specific_metadata` | 저장 object 또는 null | 기존 object, 유효한 answer_key 필수 |

metadata 안에 설명 수준·검수 플래그를 새로 삽입하지 않는다. `explanation_level`은 AC-004의 기존 컬럼에 남으며 public projection에 추가하지 않는다. QUIZ metadata를 AI 생성 전용 exact `{answer_key}`로 강제로 축소하지 않는다. HUMAN_AUTHORED QUIZ의 기존 distractors 등 타입별 메타데이터는 원문을 보존한다. Media Asset의 선택 필드 역시 Core Standard를 따른다. AI 생성 경로의 1개 TEXT/PRIMARY 제약을 일반 Content에 소급하지 않는다.

첫 시연 데이터는 검수된 직접 입력 TEXT 문제를 준비한다. 형식/본문/answer_key가 손상된 선택 결과는 null로 숨기거나 정상 문제로 제공하지 않는다. answer_key는 기존 Content 계약에 따라 전달되며 앱 화면은 제출 전 정답을 표시하지 않는다. 이를 서버 비밀 정답/부정행위 방지 계약으로 부르지 않는다.

정확한 정상 공백 예시:

```json
{
  "status": "ok",
  "data": {
    "explanation": null,
    "state": "INTRODUCED",
    "initial_practice": null
  }
}
```

이는 전체 `{status:"empty"}` 응답이 아니다. Progress 요청이 정상 처리된 §10.1의 부분 콘텐츠 공백이다.

## 4. Content 선택 보완 후보 — 추가 승인 필요

### 4.1 권고안 R1

새 HTTP endpoint·Content projection·schema 없이, 기존 내부 `get_content`에 **선택 프로필 인자 하나**를 추가하는 안을 권고한다.

```text
getContent(pool, identifier, contentType, metaLanguage, explanationLevel, selectionProfile)
selectionProfile: omitted/undefined | "EXPLICIT_STUDY"
```

- 기존 5인자 호출/미지정 호출은 동작을 그대로 보존한다. Generation의 EXAMPLE 조회·재시도·cardinality·단독 content_id 조회는 이 프로필을 사용하지 않는다.
- 새 프로필은 Learning Flow의 최초 학습 조정에서만 사용한다. `API_CONTRACT.md` §7.1의 호출 주체 설명과 `ENGINE_INTERFACE.md` §2.1/§3의 직접 Content 조회 범위를 함께 보완해야 한다.
- null/문자열 외 프로필은 `CONTRACT_VIOLATION`, 알 수 없는 문자열은 `OUT_OF_RANGE_VALUE` 후보로 고정한다. 기존 다섯 코드 내 처리이며 신규 코드를 만들지 않는다.
- EXPLICIT_STUDY에서는 `contentType`이 EXPLANATION 또는 QUIZ여야 한다. 다른 타입 또는 단독 ID 모드와 함께 쓰면 `CONTRACT_VIOLATION`이다.
- 이 프로필에서 metaLanguage는 필수 대문자 2글자, EXPLANATION의 explanationLevel은 BEGINNER/INTERMEDIATE/ADVANCED 중 하나로 필수다. 필수 undefined는 `MISSING_REQUIRED_FIELD`, null/비문자열은 `CONTRACT_VIOLATION`, 형식/enum 범위 밖은 `OUT_OF_RANGE_VALUE`. QUIZ의 explanationLevel은 undefined여야 하며 그 외는 `CONTRACT_VIOLATION`이다. 기존 미지정 프로필의 느슨한 검증을 함께 바꾸지 않는다.
- 첫 시연의 서버 구성 후보는 metaLanguage `KO`, explanationLevel `BEGINNER`다. 이는 목표 언어 VI를 엔진에 하드코딩하는 것이 아니다. 잘못된 구성은 배포 전 차단하고 유사 언어/수준으로 fallback하지 않는다.

Content Engine이 기존 컬럼으로 아래 조건을 모두 적용하고 기존 6키로 projection한다. Flow·transport·UI에는 SQL이나 검수 필터를 넣지 않는다.

1. `grammar_node_ids`가 요청 노드 하나와 정확히 일치한다. 다른 노드를 추가로 포함한 복합 QUIZ를 초심자에게 내보내지 않는다.
2. 요청한 content_type, `source='HUMAN_AUTHORED'`, `is_active=true`, `human_reviewed=true`, `is_canonical=true`.
3. 서버가 지정한 meta_language와 일치, EXPLANATION은 explanation_level도 일치.
4. 반환은 기존 조건 조회와 같이 배열이다. 0건은 정상 빈 배열, 1건은 그대로 사용. Flow는 2건 이상을 내부 불변식 오류로 거절하고 임의 첫 행이나 null로 대체하지 않는다. 배열이 아닌 반환, 잘못된 타입/노드/6키 형태 역시 정상 empty가 아닌 내부 오류다.

QUIZ 조회 허용/프로필 인자는 현재 canonical §7.1에 없는 계약 확장이다. **R1 승인이 있기 전에는 이를 구현하거나 API 원문에 확정으로 반영하지 않는다.** schema/migration 변경은 필요하지 않는 안이며, 새로운 unique constraint도 만들지 않는다.

### 4.2 대안 비교

| 안 | 장점 | 비용/문제 |
|---|---|---|
| R1: 기존 조회의 선택 프로필 | 기존 경로·projection을 유지하며 Content가 검수 선택 책임 소유 | 내부 API 인자와 호출 범위 보완 승인 필요 |
| 별도 내부 전용 읽기 API | 기존 get_content와 완전히 분리 | 내부 API 수·명세·테스트 경계 증가 |
| 배포 시 검수 행만 넣고 기존 조회 유지 | 조회 계약 변경 최소 | 혼합 DB·검수 철회·복합 노드에서 런타임 보장 불가. 단독 해결책으로 권고하지 않음 |

projection에 검수 필드를 추가하거나 Flow가 DB를 직접 읽는 안은 승인 방향의 projection/책임 경계 보존과 충돌하므로 권고하지 않는다.

## 5. 순서·멱등·실패 후보

권고 순서는 **기존 admission 완료 → 설명 조회 → QUIZ 조회 → 응답 조립**이다.

1. 기존 HTTP 인증/입력 검사를 통과한다. 토큰의 동일 사용자로만 진행한다.
2. Flow가 기존 Progress.recordExplicitStudy를 정확히 1회 호출한다. idempotency-before-capacity, advisory lock, transaction, state 반환을 그대로 소비한다.
3. Progress 거절이면 Content를 조회하지 않고 오류를 전달한다. authoritative capacity 거절만 기존 CapacityAdmissionConflictError 경계를 유지한다.
4. 성공하면 §4의 EXPLANATION 조회와 0/1/cardinality·형식 검사를 수행한 뒤 QUIZ에도 같은 순서를 적용한다. 기술적 실패 시 이 Flow에서 자동 재시도하지 않는다.
5. Content가 정상 empty이면 해당 필드를 null로 넣고 성공한다. 하나가 없다고 다른 하나를 지우지 않는다.

이 순서를 권고하는 이유는 기존 admission/capacity 응답 우선순위를 보존하고, 콘텐츠 공백이 상태 전이를 막지 않는 §10.1을 그대로 지키기 위해서다. 먼저 콘텐츠를 읽는 대안은 기술 실패 시 불필요한 admission을 줄이지만, 콘텐츠 오류가 기존 capacity 거절을 가릴 수 있다. 이 선택은 후보이며 canonical에 이미 존재했던 순서라고 주장하지 않는다.

**원자성 한계:** Progress와 두 Content 조회는 하나의 새 트랜잭션이 아니다. Progress commit 이후 Content 오류·timeout·응답 유실이 발생하면 요청은 실패해도 admission은 이미 저장됐을 수 있다. 실패가 Progress rollback을 뜻하지 않으며 Flow가 보상 삭제/원래 state 복원을 하지 않는다. 새 transaction API·schema·요청 식별자를 만들지 않는다.

**멱등 범위:** 같은 사용자/노드의 재요청은 admission을 중복 생성하거나 state를 낮추지 않는다. 기존 행이면 capacity 초과여도 현재 상태를 반환하고 콘텐츠를 다시 읽는다. 이 보장은 동일 응답 byte·동일 콘텐츠 버전·동일 화면 보장과 다르다. Content는 같은 ID의 버전이 바뀔 수 있고, 두 조회도 동일 snapshot을 보장하지 않는다.

HTTP 취소/기한 종료로 이미 실행한 Progress 호출이 취소됐다고 보장하지 않는다. 서버 자동 replay는 없다. 사용자가 동일 요청을 명시적으로 재시도하면 기존 멱등 admission을 사용한다. 이 성질을 submit_attempt의 중복 반영 방지로 확대하지 않는다.

## 6. 결과별 정확한 처리

| 조건 | HTTP/data | Progress/클라이언트 의미 |
|---|---|---|
| 설명 1·QUIZ 1 | 200, 두 객체 | 설명 표시 후 문제 진입 가능. state가 학습 진입 가능 상태인지도 확인 |
| 설명 0·QUIZ 1 | 200, explanation null | 진도 유지, 설명 준비 중. 첫 시연에서는 설명을 건너뛰어 자동 문제 진입하지 않음 |
| 설명 1·QUIZ 0 | 200, initial_practice null | 설명 표시 가능, 문제/제출 비활성 |
| 둘 다 0 | 200, 둘 다 null | 진도 유지, 준비 중. 전체 오류나 NO_CONTENT 사다리 응답으로 바꾸지 않음 |
| 검수/대표/언어/수준 조건 미충족 | 조건에 맞는 행 0이면 위 정상 공백 | 다른 언어·EXAMPLE·AI 문항·비대표 행으로 대체하지 않음 |
| 조회 실패·중복 canonical·손상 projection/필수 metadata | 503, 기존 일반 HTTP 오류, 성공 data 없음 | 이미 admission됐을 수 있음. 오류를 empty로 바꾸지 않음 |
| 존재하지 않는 node_id/user_id | 404, INVALID_ID | 기존 Progress가 거절, 정상 성공 data 없음 |
| 검증된 신규 admission capacity 거절 | 422, CONTRACT_VIOLATION 및 기존 capacity 표식 | 기존 controller의 최신 start_session 재조회 1회, Content 조회 없음 |
| capacity가 아닌 CONTRACT_VIOLATION | 422, 일반 오류 | capacity 표식 금지, 자동 start_session 재조회 없음 |
| 인증 불가/만료 | 기존 401 | 새 게스트 자동 생성/만료 연장 없음 |
| DB·host·인증 확인 기술 오류 | 기존 503 | error_code를 새로 만들어 five-code registry에 넣지 않음 |

Content의 기존 INVALID_ID/MISSING_REQUIRED_FIELD/UNAUTHORIZED_CALLER/OUT_OF_RANGE_VALUE/CONTRACT_VIOLATION은 일반화된 기존 HTTP 매핑으로 전달한다. 503은 기술 오류 경계이지 여섯 번째 엔진 error_code가 아니다. 내부 SQL·row·토큰·검수자 정보를 응답 message에 넣지 않는다.

## 7. 클라이언트·제출·재실행 경계

- 최초 콘텐츠 필드명 후보는 `explanation`으로 통일한다. 현재 state-only 클라이언트의 `state` 접근은 유지되지만 새 클라이언트가 구 서버의 필드 생략을 정상 null로 간주하면 안 된다. 새 계약 배선 후에는 응답 exact shape를 검사하고 버전 불일치를 오류로 처리한다.
- `LearningSessionController`는 현재 성공 값을 반환할 뿐 설명/QUIZ 화면에 저장하지 않는다. 이 문서 작성이 그 UI 연결 완료를 뜻하지 않는다.
- 최초 QUIZ의 content_id는 서버가 준 값을 저장해 나중에 기존 submit_attempt에 그대로 전달한다. ID를 조합하거나 다운로드 팩에서 임의 문제를 골라 제출하지 않는다.
- 실제 제출·is_correct 비교·피드백 구현은 후속 작업이다. 검수한 허용 답안과의 제한된 앱 비교 방향만 유지한다. 임의 베트남어 자유 문장 채점·서버 AI 채점·새 answer_text API를 만들지 않는다.
- 기존 6키 projection에는 version이 없다. 학습 도중 서버/설치 팩 콘텐츠 개정의 일치 보장은 아직 없으며, 첫 시연은 검수된 동일 릴리스 자산을 고정해서 운영해야 한다. 런타임 버전 handshake/새 필드/저장 snapshot은 이 문서가 승인하지 않는다.
- 온라인·유효 토큰 내 같은 사용자/설치 팩 복구 경계는 MOBILE-05 그대로다. 서버 최신 판단을 다시 읽어야 하며 저장된 state를 임의 승격하지 않는다. 설명 화면/입력 중 글자까지 정확히 재개하는 새 영속 상태는 만들지 않는다.
- Content 검수 증거·배포 자산·팩/DB 일치·실기기 검증은 별도 차단 상태다. 플래그와 계약 설계만으로 실제 검수/시연 성공을 선언하지 않는다.

## 8. 후속 구현 때 필요한 검증 목록 — 이번 미실행

| ID | 검증할 경계 |
|---|---|
| IP-01 | 경로·body·인증 user_id 유지, 추가 입력 거절, 누락/null/비문자열/미존재 ID 매핑 |
| IP-02 | data exact 3키, 각 Content exact 6키, nullable 필드 생략 거절, state 원문 유지 |
| IP-03 | 설명/QUIZ 0·1 조합 네 가지와 화면 진행/제출 차단 |
| IP-04 | 검수 false·canonical false·inactive·다른 meta_language/수준·복합 노드·다른 source 제외 |
| IP-05 | 선택 결과 2개 이상·손상 metadata·기술 실패가 null로 변환되지 않음 |
| IP-06 | 기존 5인자 getContent, 단독 ID 조회, Generation PRE_MADE EXAMPLE/metadata null/재시도 동작 보존 |
| IP-07 | selectionProfile 입력 검증, 새 프로필의 필수/범위/타입 조합 규칙 |
| IP-08 | Progress 호출 1회, 기존 노드 멱등/capacity 무관, 실제 DB 동시 신규 admission 경쟁 |
| IP-09 | capacity 실패 시 Content 0회와 start_session 1회, 일반 오류에서 재조회 0회 |
| IP-10 | Progress 성공 후 Content 실패·HTTP 응답 유실·취소와 같은 사용자 명시적 재시도 |
| IP-11 | Content 직접 SQL은 Content에만 존재, Flow/transport/UI에 상태 계산·검수 필터 없음 |
| IP-12 | MOBILE-05 게스트·팩·종료/재개 경계의 선택 회귀, 실제 PG 검증과 DOM/HTTP 검증 분리 |

이는 제안된 후속 개발 검증 목록이며 `VALIDATION_LEVEL3.md`의 판정 규칙을 수정하지 않는다. 구현 단계는 합성 fixtures, 실제 언어팩 검증은 기존 Validation 경계를 따른다.

## 9. 승인 후 예상 문서·구현 영향

**다음 단일 작업 후보:** 이 문서 §3–6의 정확한 계약과 R1을 검토·승인한 뒤 canonical 문서에만 반영한다. 코드 구현은 그다음 별도 작업이다.

- canonical 반영 후보: `API_CONTRACT.md` §7.1/§10.1, `ENGINE_INTERFACE.md` §2.1/§3, `CLIENT_BRIEF.md` 관련 흐름, `LEARNING_API_SERVER_BRIEF.md` 연결 경계. Backlog/개정 이력은 기존 관리 절차에 따라 기록하고 임의 AC 번호를 선점하지 않는다.
- 이후 코드 영향 후보: Content의 opt-in 조회, Learning Flow의 startExplicitStudy 조정, in-process 연결과 capacity 포장, HTTP 응답 검사, 설명/문제 소비 UI, 관련 합성/PG 회귀. 아직 수정하지 않았다.
- Generation·Progress state machine·schema/migration·게스트 발급/저장·팩 다운로드/캐시 재작성, Android host/APK, main 병합/출시, P1/인간 데이터 승인은 포함하지 않는다.

## 10. 완료 기준과 현재 결론

이번 요청의 산출물은 검토 가능한 후보 설계다. 응답 shape/null·공백·오류·멱등·capacity·읽기/쓰기 순서·추가 승인 범위를 문서로 구체화했다. **canonical 계약 확정·독립 리뷰·런타임 검증·제품 시연 완료는 아니다.**

설계에서 발견한 구현 차단은 R1 또는 대안의 Content 선택 계약 결정이다. 결정 전 코드 작업을 시작하지 않는다. 실제 검수 콘텐츠/환경 확보와 제출 경로는 별도 후속 작업으로 남긴다.

이번 직접 점검과 미실행 증거는 `VALIDATION_STATUS.md` §J, 최신 세션 위치는 `MOBILE_APP_HANDOFF.md`가 소유한다.
