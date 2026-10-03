# LLE 모바일 개발 진행 보고 — 컨트롤타워 전달용

작성 요청: 2026-10-04T07:01:16+09:00 (Asia/Seoul). 이 보고서는 모바일 개발 브랜치의 진행 상황을 전달하는 문서이며, 컨트롤타워의 승인·병합·종료 판정을 대신하지 않는다.

## 1. 현재 결론

**MOBILE-05를 보존한 상태에서 최초 학습 계약 반영·서버 구현·선택 PostgreSQL 검증과 클라이언트 응답 보완까지 완료한 개발 후보다. 독립 리뷰 후속 수정 중이며 main에는 미병합이다.** 안드로이드 설치 앱과 실제 베트남어 한 단원 완주 시연은 아직 완료하지 않았다.

다음 개발 행동은 **HTTP 401의 세션 만료 안내 보존(CP-IP-04) 한 작업**이다. 이번 보고서 작성 요청으로 해당 구현이나 재리뷰·병합을 시작하지 않았다.

## 2. 직접 확인한 기준선

| 항목 | 확인 값 |
|---|---|
| 저장소 | `minos8458-web/language-learning-engine` |
| main | `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92` |
| 모바일 작업 브랜치 | `development/mobile-01-session-ui-20261001` |
| 보고 대상 구현·검증 기준 커밋 | `2a32da0630a6d5296ac4a62068ceb16931de143e` |
| 해당 tree | `14393d33c0838e72d756ddafc4c42288ce0a5dc3` |
| PR | [#2](https://github.com/minos8458-web/language-learning-engine/pull/2), 열림·초안·미병합 |
| 보고서 작성 전 로컬/원격/PR head | 위 기준 커밋으로 일치 |
| 보고서 작성 전 작업 트리/인덱스 | 변경 없음 |
| 보고서 작성 전 upstream 대비 | 앞섬 0 / 뒤처짐 0 |
| 보고서 작성 전 main 대비 | 앞섬 33 / 뒤처짐 0 |
| 기존 체크아웃 | `/workspace/scratch/2f8f7d39d1fd/language-learning-engine` |

이번에 `git fetch origin`, 원격 PR, 커밋 고정 원격 HANDOFF·상태·검증·리뷰 패킷을 직접 확인했다. 보고서와 인계 기록의 후속 문서 커밋은 위 구현 기준 커밋과 구분한다. 이 문서 커밋이 새로운 런타임 검증 또는 독립 리뷰 대상의 승인 증거는 아니다.

## 3. 완료 범위와 변경 이력

| 범위 | 완료 내용 | 식별 근거 |
|---|---|---|
| MOBILE-05 | 게스트 발급 전 표시 저장, 토큰 저장 재확인, 같은 유효 게스트 복구, 팩·학습 진입 연결. 완료 구현을 재작성하지 않음 | `00f7909aefbc447999bfc77e32dae90e99aa9580` |
| 최초 학습 계약 | `API_CONTRACT.md` §7.1.1/§10.1, `ENGINE_INTERFACE.md`, `CLIENT_BRIEF.md` 등에 승인 계약 반영 | 계약 체크포인트 `18c3f6223b4bb08641be1dc28630eb97ee8936c7` |
| 최초 학습 서버 | Content R1 선택, KO/BEGINNER 구성, admission→EXPLANATION→QUIZ, `{explanation,state,initial_practice}` 응답, in-process 연결 | `4e7d14b938a732fa72ea6297faffb0ae7408db7d` |
| 실제 PostgreSQL 검증 | 격리 합성 DB에서 조회 조건·중복/손상·부분 실패·동시성·멱등·capacity 회귀 검증 | `35e2d9235667671da2c01b4094b983412067ad45` |
| 클라이언트 보완 | HTTP 성공 응답의 필드·상태·Content·요청 노드 검증, 잘못된 응답의 성공 표시 차단, preview 응답 정합화 | `282d31f21abcb2603eb670ed0aac113fdf85cadf` |
| Node 지원 범위 | package와 lock root의 `engines.node`를 `>=20.19.0`으로 통일, 설치 안내 추가. 의존성 버전·integrity 불변 | `2a32da0630a6d5296ac4a62068ceb16931de143e` |

설명·QUIZ는 각각 없으면 null이며 손상·중복 선택 결과를 정상 부재로 숨기지 않는다. Progress 등록 후 콘텐츠 조회가 실패해도 이미 완료된 등록의 rollback을 보장하지 않는다. 기존 Generation의 PRE_MADE EXAMPLE, Progress 상태·등록 규칙, schema/migration, Validation 판정 규칙은 보존했다.

## 4. 사용자 승인과 구현 판단의 구분

- 사용자 승인: 2026-10-02T21:10:42+09:00 첫 시연을 온라인·유효 토큰 내 재실행으로 한정하고 `initial_practice` 방향을 승인했다.
- 사용자 승인: 2026-10-03T19:35:16+09:00 최초 학습 정확한 계약/R1 설계와 정식 계약 문서 반영을 승인했다. 이후 “다음” 지시에 따라 한 작업씩 구현·검증·리뷰 후속을 진행했다.
- AI 구현 선택: 기존 계약을 만족하는 검증 함수 구성, nullable preview, 잠금 의존성 요구에 맞춘 Node 최소 버전 정합화 등이다. 별도 출시 정책 승인으로 확대하지 않는다.
- 미승인 또는 미완료 경계: main 병합·출시, 새 Android 호스트 구조, 만료 뒤 동일 게스트 복구/refresh, 새 채점 계약·schema 변경, P1/실제 학습자 데이터 활성화. 이 보고서 자체는 추가 승인이 아니다.

## 5. 독립 리뷰 지적 처리 상태

Copilot 리뷰 `PRR_kwDOTQ7IWM8AAAABQfiOMw`: `COMMENTED`, 변경 권고. 요청 target은 `92a9b70262b8df6bf8e67a3e03f517594699e139`이며 정확한 reviewed commit SHA는 **미확인**이다. 실제 리뷰는 PR 전체를 다뤘으므로 최초 학습 서버 범위의 별도 승인으로 해석하지 않는다.

| ID | 원본 등급 | 내용 | 현재 후보 상태 |
|---|---|---|---|
| CP-IP-01 | High | Node 선언과 잠금 의존성 최소 버전 불일치 | 수정 완료, 재리뷰 대기 |
| CP-IP-02 | High | 최초 학습 HTTP 응답을 검증 없이 수용 | 수정 완료, 재리뷰 대기 |
| CP-IP-03 | Medium | preview 응답 계약 불일치 | 수정 완료, 재리뷰 대기 |
| CP-IP-04 | Medium | 401 안내를 일반 연결 오류로 덮어씀 | **미수정, 다음 단일 작업** |
| CP-IP-05 | Low | 완료된 MOBILE-05를 다음 행동으로 안내 | 문서 후보 정정, 재확인 대기 |
| CP-IP-06 | Low | 서버 구현 상태·다음 행동의 문서 모순 | 문서 후보 정정, 재확인 대기 |

원격 스레드 해결 처리와 독립 재리뷰는 수행하지 않았다. 작성자의 수정·자체 검증을 독립 승인으로 바꾸지 않는다. PR 본문에는 최초 리뷰 시점의 “코드 관련 4건 OPEN” 표현이 남아 있어 최신 수정 상태는 위 표와 `INITIAL_PRACTICE_REVIEW_PACKET.md` 후속 기록을 기준으로 읽어야 한다.

## 6. 검증 근거와 한계

상세 명령·수치·판정의 소유 문서는 `VALIDATION_STATUS.md`다. 아래는 각 시점 증거의 요약이며 서로 중복되는 테스트 수를 합산하지 않는다.

| 근거 | 환경·범위 | 저장된 결과 |
|---|---|---|
| §M | Linux PostgreSQL 16.15, 격리 합성 DB, 선택 엔진·Flow·E2E | 146/146 통과, 실패·건너뜀 0 |
| §O | 최초 학습 응답·HTTP·게스트·팩·모바일 선택 회귀 | 168/168 통과, 실패·건너뜀 0, 모바일 빌드 성공 |
| §P | Node 20.19.0 / npm 10.8.2, 엄격한 설치 검사·DOM/IndexedDB/클라이언트 | 103/103 통과, 실패·건너뜀 0, 모바일 빌드 성공 |

§P 설치 명령은 `npm ci --engine-strict --ignore-scripts --no-audit --no-fund`다. 설치 스크립트·보안 audit 검증을 주장하지 않는다. 이번 보고서 작성에서는 위 테스트·빌드·PostgreSQL을 재실행하지 않았다. 전체 suite, Windows PostgreSQL 17.10, 운영 PG/HTTPS, 실제 콘텐츠 독립 검수, Android/APK, 실기기, 학습 효과 검증으로 확대하지 않는다.

## 7. 안드로이드 첫 시연까지 남은 범위

| 목표 단계 | 현재 확보한 구성 | 남은 연결·구현·검증 |
|---|---|---|
| 설치·게스트 시작 | 게스트 서버·클라이언트 수명주기·주입 저장 경계 | Android 프로젝트/APK·실제 보안 저장 호스트·운영 연결 |
| VI 선택·용량 안내 | 언어팩 목록·확인 팝업·용량 기준 Wi-Fi 안내 | 실제 VI catalog·배포 파일·정확한 크기/해시 |
| 다운로드·설치·재시도 | 다운로드·검증·캐시·취소/재시도·복구 코드 | 검수 팩·학습 본문 읽기·Android 저장/네트워크 검증 |
| 설명→문제→제출→피드백 | 최초 학습 Content 응답 계약·서버·수신 검증 | 학습 UI·답안 제출/피드백 조정·관련 API 연결 |
| 종료·재실행 | 같은 유효 게스트·팩 복구 및 하위 진도 저장 구성 | 동일 사용자 실제 PG/HTTPS·제출/재개 연결·OS 영속성 검증 |

모든 단계의 실제 휴대폰 완주는 미검증이다. 정확한 완료일과 최신 잔여 시간은 **미확인**이며, 과거 추정에서 경과 시간을 임의로 차감하지 않는다.

## 8. 컨트롤타워에 전달할 판단 요청

1. 이 후보를 “모바일 개발 브랜치의 구현·선택 검증 완료 범위가 있으나 리뷰 후속 수정 및 통합 전” 상태로 접수한다.
2. 다음 개발 행동은 CP-IP-04 한 작업으로 유지한다. 이후 독립 재리뷰와 main 통합 판단은 별도 단계로 다룬다.
3. MOBILE-05 재작성, 이미 완료한 최초 학습 계약 설계 재시작, 모바일 후보를 main 구현으로 간주하는 지시를 피한다.
4. 별도 검증 세션이 있다면 그 승인 기준선·체크아웃·판정은 이 모바일 브랜치와 구분한다. 이 보고서는 다른 세션의 상태나 새 기준선 사용을 승인하지 않는다.

## 9. 고정 출처

모든 아래 문서는 보고 대상 커밋에 고정되어 있다.

- [MOBILE_APP_HANDOFF.md](https://github.com/minos8458-web/language-learning-engine/blob/2a32da0630a6d5296ac4a62068ceb16931de143e/MOBILE_APP_HANDOFF.md)
- [PROJECT_STATUS.md](https://github.com/minos8458-web/language-learning-engine/blob/2a32da0630a6d5296ac4a62068ceb16931de143e/PROJECT_STATUS.md)
- [VALIDATION_STATUS.md](https://github.com/minos8458-web/language-learning-engine/blob/2a32da0630a6d5296ac4a62068ceb16931de143e/VALIDATION_STATUS.md)
- [INITIAL_PRACTICE_REVIEW_PACKET.md](https://github.com/minos8458-web/language-learning-engine/blob/2a32da0630a6d5296ac4a62068ceb16931de143e/INITIAL_PRACTICE_REVIEW_PACKET.md)

이 문서는 사용자에게 전달할 보고서로 작성했다. 컨트롤타워에 대한 별도 메시지 전송·리뷰 요청·병합은 수행하지 않았다.
