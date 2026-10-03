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

## 독립 실행 요청의 직접 관찰

GitHub connector `request_pull_request_reviewers`에 `copilot-pull-request-reviewer[bot]`을 지정해 한 번 요청했다. 도구 응답은 Action completed / isError=false였으나 반환 및 재조회 PR의 requested_reviewers는 null이었다. 제출 리뷰·review thread·comments 조회도 빈 배열이다. 따라서 요청 호출은 실행됐지만 **리뷰어 배정/실행 접수는 미확인**, 독립 리뷰 결과는 미수신이다. 실패 또는 대기 중 어느 쪽인지 추정하지 않는다. 동일 요청을 무한 재전송하지 않는다.

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

## 다음 행동 하나

PR #2에서 Copilot 리뷰 접수/제출 여부와 대상 commit을 확인하고 최초 학습 서버 범위의 지적을 분류한다. 결과 미수신 시 독립 리뷰 승인으로 처리하지 않는다.
