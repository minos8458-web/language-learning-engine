# INITIAL_PRACTICE_REVIEW_PACKET.md

## 상태

2026-10-03T22:51:34+09:00 사용자 “다음”은 직전 서버 구현 후보의 독립 리뷰 진행 지시다. 이 문서는 작성자의 검토 자료이며 독립 리뷰 결과가 아니다.

- Repository: minos8458-web/language-learning-engine
- PR: https://github.com/minos8458-web/language-learning-engine/pull/2 (open/draft, main 미병합)
- Review target: `92a9b70262b8df6bf8e67a3e03f517594699e139`
- Approved contract baseline: `18c3f6223b4bb08641be1dc28630eb97ee8936c7`
- Main baseline: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`
- Bounded diff: `18c3f6223b4bb08641be1dc28630eb97ee8936c7..92a9b70262b8df6bf8e67a3e03f517594699e139`
- Runtime implementation: `4e7d14b938a732fa72ea6297faffb0ae7408db7d`
- PG test changes: `35e2d9235667671da2c01b4094b983412067ad45`

## 수신한 독립 리뷰 및 분류

최종 재조회에서 Copilot 리뷰를 수신했다. 앞선 접수 미확인 기록은 요청 직후 관찰이며 현재 상태는 **REVIEW RECEIVED / CHANGES RECOMMENDED**다.

- Reviewer: `copilot-pull-request-reviewer`
- Review ID: `PRR_kwDOTQ7IWM8AAAABQfiOMw`
- GitHub state: `COMMENTED`; overview: `Changes recommended`
- submitted_at: `2026-10-03T17:03:17Z` (도구 반환 원문 시각; 사용자 요청 시각과 별개)
- 6 open threads: High 2 / Medium 2 / Low 2. 이 severity는 Copilot 분류다.
- 요청 당시 target은 `92a9b70262b8df6bf8e67a3e03f517594699e139`. 응답 모델에 reviewed commit SHA가 노출되지 않아 정확한 reviewed SHA는 미확인이다. 수신 당시 HEAD `dcf9598613ac489dda338b4bb2d3a365371758e7`는 문서만 추가했으며 runtime/test blob은 요청 target과 동일하다. 요청 target을 확인되지 않은 reviewed SHA로 바꾸지 않는다.
- 실제 리뷰는 PR 전체를 다뤘다. 최초 학습 서버 4개 runtime 파일에 직접 inline finding은 없으나, 이를 해당 범위의 APPROVE 또는 PR 전체 병합 자격으로 해석하지 않는다.

| ID | Copilot 등급 / thread comment | 직접 대조 및 처리 |
|---|---|---|
| CP-IP-01 | High / 4174041597 | root Node >=20과 lock의 boolbase >=20.19.0 불일치 확인. 최초 서버 diff 이전 의존성 변경 영역. OPEN, 후속 설치 호환성 수정. Node 20.0–20.18 설치 실험은 미실행. |
| CP-IP-02 | High / 4174041649 | HTTP startExplicitStudy가 data를 검증 없이 반환. injected fetch로 `{}` 및 state-only가 resolve됨 직접 재현. 승인된 CLIENT_BRIEF 후속 연결 공백. OPEN, 다음 작업. |
| CP-IP-03 | Medium / 4174041693 | previewTransport가 `{node_id,preview}`를 반환함 원문 확인. 새 exact 응답 계약과 불일치. OPEN, CP-IP-02와 함께 보완. |
| CP-IP-04 | Medium / 4174041729 | 401 전용 Error가 catch에서 일반 연결 오류로 바뀜 injected fetch로 직접 재현. legacy token-callback 사용자 안내 문제. OPEN, 별도 후속 수정. 인증 우회나 토큰 재발급 증거는 아님. |
| CP-IP-05 | Low / 4174041772 | LLE_CURRENT_STATE §10이 완료된 MOBILE-05 설계를 다음 작업으로 명시함 확인. 이번 문서 기록에서 현재 작업으로 정정. CORRECTED IN DOCUMENT CANDIDATE, 리뷰어 재확인/스레드 resolve 미실행. |
| CP-IP-06 | Low / 4174041807 | PROJECT_STATUS §5.1이 서버 구현 미착수로 표기함 확인. 최신 상단 기록과 모순되어 이번 문서에서 정정. CORRECTED IN DOCUMENT CANDIDATE, 리뷰어 재확인/스레드 resolve 미실행. |

모든 원본 지적: https://github.com/minos8458-web/language-learning-engine/pull/2/files (discussion_r 뒤 comment ID). 원격 스레드 6개는 임의로 resolve하지 않았다. 추가 runtime/test 수정, main 병합, lifecycle CLOSED 없음.

## 독립 실행 요청 직후 관찰 (이력)

GitHub connector `request_pull_request_reviewers`에 `copilot-pull-request-reviewer[bot]`을 지정해 한 번 요청했다. 도구 응답은 Action completed / isError=false였으나 반환 및 재조회 PR의 requested_reviewers는 null이었다. 제출 리뷰·review thread·comments 조회도 빈 배열이다. 따라서 요청 호출은 실행됐지만 **리뷰어 배정/실행 접수는 미확인**, 당시 독립 리뷰 결과는 미수신이었다. 실패 또는 대기 중 어느 쪽인지 추정하지 않는다. 동일 요청을 무한 재전송하지 않는다.

공식 요청 경로 확인 자료: https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/copilot-code-review

PR 본문의 오래된 state-only/미구현 설명을 현재 후보 상태로 정정하고 이 검토 범위와 증거를 추가했다. 이 정정은 코드 변경이나 리뷰 승인이 아니다. 이 패킷 이후 인계 문서 커밋은 검토 코드 변경과 구분한다.

## 검토 범위

| 영역 | 대상 | 확인할 계약 |
|---|---|---|
| 구성 | src/config/engineConfig.js | KO/BEGINNER 설정, 목표 언어 독립성, 잘못된 구성 차단 |
| Content | src/engines/contentEngine.js | API 7.1.1의 opt-in 입력/필터, 기존 5인자·ID 조회와 6키 projection 보존 |
| Flow | src/engines/learningFlowEngine.js | API 10.1의 admission 1회→설명→QUIZ, null/중복/손상, Progress state 그대로 |
| 연결 | src/transport/inProcessLearningFlowTransport.js | Flow 연결, authoritative capacity class만 기존 표식으로 변환 |
| 테스트 | tests/initialPractice.test.js, tests/initialPractice.postgres.test.js, tests/learningFlowEngine.test.js | 실제 동시성/멱등, 부분 실패, SQL 제외 조건, 정적 단언 변경이 승인된 호출만 허용하는지 |

검토 질문:

1. R1 미지정 호출·Generation PRE_MADE EXAMPLE·Progress·MOBILE-05가 유지되는가?
2. 선택된 설명/QUIZ가 항상 6키이며 normal empty만 null로 바꾸는가? 손상 metadata/media 및 duplicate를 성공으로 숨기지 않는가?
3. admission 거절 시 Content 호출 0회이고, admission commit 후 조회/HTTP 실패가 rollback으로 오인되지 않는가?
4. 같은 노드 재시도/동시 요청이 진도를 중복 생성하지 않고, 신규 서로 다른 노드 요청이 capacity를 넘지 않는가?
5. 일반 오류와 capacity 오류가 혼동되지 않으며 새 error_code나 직접 SQL/상태 계산이 Flow에 추가되지 않는가?
6. 새 테스트가 합성 DB seam과 실제 PostgreSQL을 구분하고 기존 startSession의 읽기 전용 동작을 보존하는가?

## 기존 실행 근거와 한계

VALIDATION_STATUS.md가 증거 소유자다. §L: 선택 HTTP/모바일 162/162. §M: Linux PostgreSQL 16.15, 격리 합성 DB, 선택 146/146. 이번 리뷰 요청 턴에서는 runtime test/PG/build를 재실행하지 않았다. 전체 suite, Windows PG 17.10, 운영 PG/HTTPS, 검수 VI 데이터/팩, Android/실기기/학습 효과 증거로 확대하지 않는다.

PR 전체는 MOBILE-01–05를 포함한 더 큰 변경이다. 위 bounded 범위의 검토가 PR 전체 승인 또는 main 통합 자격을 의미하지 않는다. 다른 영역에서 발견한 지적도 별도 기록하며 임의로 무시하거나 기존 완료 코드를 재작성하지 않는다.

## 반환 형식

Reviewer identity, reviewed commit, APPROVE/REQUEST_CHANGES 또는 판단 보류, finding별 severity·파일/위치·재현/계약 근거·필수 수정 여부, 검증 직접 실행/미실행, 범위 밖 항목을 구분한다. 작성자의 자체 점검을 독립 리뷰로 포장하지 않는다.

## CP-IP-02/03 후속 보완 — 2026-10-04

사용자 02:18:41+09:00 “다음” 지시에 따라 HTTP 응답 validator와 preview exact 응답을 구현했다. CP-IP-02/03은 CORRECTED IN CANDIDATE / RE-REVIEW PENDING이다. 원격 스레드는 resolve하지 않았고 다른 4개 지적의 상태를 임의 승격하지 않는다. 이전 표는 리뷰 수신 당시 상태다. 검증 직접 증거는 VALIDATION_STATUS.md §O를 따른다. 클라이언트 잘못된 응답 거절이 서버 admission rollback을 의미하지 않는다. 설명/문제 제출 UI 구현은 별도다.

## 다음 행동 하나

Node 지원 버전 선언과 잠금 의존성의 최소 버전 불일치(CP-IP-01)를 한 작업으로 보완한다. 401 안내 보존(CP-IP-04)·재리뷰·main 병합은 별도 후속으로 남긴다.
