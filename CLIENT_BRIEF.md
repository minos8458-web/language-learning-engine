# CLIENT_BRIEF.md
## LLE Production 클라이언트 지시서 (Tier C, Production Track 5/5)

> 이 문서는 코드가 아니라 **지시서**다. `API_LAYER_BRIEF.md`가 정의한 5개 외부 API를 전제로, 클라이언트가 이를 어떤 화면·흐름으로 소비하는지만 다룬다. Production 문서 로드맵(0~5)의 마지막 문서다.

---

## 0. 문서의 지위

- Tier C, Production 문서 로드맵의 5번(마지막) 문서.
- 클라이언트는 **정책을 판단하지 않는다.** `start_session`이 반환한 `next_action`을 그대로 화면으로 옮길 뿐이며, "지금 뭘 해야 할지"를 스스로 다시 계산하지 않는다(`API_CONTRACT.md` §10.5 금지 사항 재확인).
- 이 문서가 이어받는 두 개의 미해결 사항: (1) `DOMAIN_LOGIC_BRIEF.md` §4.3이 미룬 자기보고 Confidence UI 트리거 시점, (2) `API_LAYER_BRIEF.md` §5.1이 미룬 전송 실패 시 클라이언트 재전송 정책.

---

## 1. 화면 목록 개요

`LEARNING_PROTOCOL.md` §11 하루 학습 프로토콜을 그대로 화면 흐름으로 옮긴다.

| 화면 | 대응 프로토콜 단계 | 호출 API |
|---|---|---|
| 세션 로딩 | §2 세션 시작 프로토콜(§3~5 내부 수행) | `start_session` |
| 복습 카드 | §7 Review 진입 | `submit_attempt`(대상: `review_batch`) |
| 신규 문법 소개 | §6 새 문법 도입 | `start_explicit_study` |
| 교차 연습 세트 | §8 Interleaving 진입 | `submit_attempt`(대상: `node_sequence`) |
| 연습 요청 | (사다리 기반 생성) | `request_practice` |
| 자기보고 모달 | §5.3/State 승격 체크포인트 | `submit_self_reported_confidence` |
| 대화 연습 | §9 Conversation 진입(Conversation Engine 미정의 — §5 참고) | 없음(현재 범위 밖) |
| Reflection 요약 | §15 Reflection | 없음(기존 데이터 조합, §7 참고) |

---

## 2. 세션 흐름

```
앱 진입
  → (미인증) 게스트 시작(§4) 또는 (인증됨) 토큰으로 바로 진행
  → start_session 호출
  → next_action 분기:
      REVIEW        → 복습 카드 화면, review_batch 순서대로 submit_attempt 반복
      NEW_GRAMMAR   → 신규 문법 소개 화면, start_explicit_study 1회
      INTERLEAVING  → 교차 연습 세트 화면, node_sequence 순서대로 submit_attempt 반복
      CONVERSATION  → 정상 Conversation boundary 화면 표시(빈 화면/오류 아님)
                      → 사용자 확인 시 현재 세션 메모리의 conversationBoundaryAcknowledged=true
                      → start_session을 true로 재호출
                      → 서버가 반환한 다음 next_action을 그대로 처리
      IDLE          → "오늘 학습 완료" 화면으로 바로 이동(Reflection 생략, §7 참고)
  → 배치/시퀀스 소진 시 start_session 재호출(다음 next_action 획득)
  → 어느 시점이든 State 승격 감지 시 자기보고 모달 삽입(§3)
  → 세션 종료 조건 충족(LEARNING_PROTOCOL §16) → Reflection 화면(§7) → 종료
```

**배치 소진 후 재호출 원칙**: `review_batch`/`node_sequence`는 그 안에서는 클라이언트가 순서를 그대로 따르되(서버가 이미 정렬), 다 소진하면 반드시 `start_session`을 다시 호출한다 — 배치 처리 중 Progress가 바뀌었으므로(예: 복습 완료로 Queue가 줄어듦) 다음 결정은 항상 최신 상태를 반영해야 한다.

**AC-012 Conversation boundary 흐름**: 최초 `start_session`에서는 `conversation_boundary_acknowledged`를 생략하거나 `false`로 보낸다. `next_action=CONVERSATION`이면 미구현 기능의 정상 boundary 화면을 표시하고, 사용자가 확인한 뒤 현재 세션 메모리에서만 acknowledgement를 `true`로 바꾸어 `start_session`을 재호출한다. 클라이언트는 CONVERSATION을 임의로 숨기거나 진입 정책을 재판단하지 않으며, 재호출 응답의 `next_action`을 그대로 처리한다.

---

## 3. 자기보고 Confidence UI 트리거

`DOMAIN_LOGIC_BRIEF.md` §4.3이 "State 승격 시점을 체크포인트로 삼는다"고 정의했던 것의 구체적 트리거다.

- `submit_attempt` 응답의 `updated_state`가 직전에 클라이언트가 알고 있던 상태보다 **높아졌으면**(승격 발생), 다음 화면 전환 직전에 자기보고 모달을 끼워 넣는다.
- 모달은 세션 흐름을 막지 않는다 — 사용자가 닫아도(응답하지 않아도) 세션은 계속 진행된다. `confidence_self_reported`는 선택적 신호이지 필수 관문이 아니다(`PROGRESS_SCHEMA.md`의 "값이 없으면 calibration도 없다"는 제약과 일치 — 안 줘도 시스템이 깨지지 않는다).
- 같은 세션에서 승격이 여러 번 발생해도 모달은 **세션당 최대 1회**만 노출한다(과도한 인터럽트로 학습 흐름을 끊지 않기 위함 — LEARNING_PROTOCOL §0 "Learning Effect가 사용자 경험보다 우선"하지만, 이 경우는 반대로 지나친 인터럽트 자체가 Learning Effect를 해칠 수 있어 빈도를 제한한다).

---

## 4. 게스트 시작 흐름

`API_LAYER_BRIEF.md` §3을 클라이언트 쪽에서 그대로 수행한다.

1. 앱 최초 실행 시 로컬에 저장된 토큰이 없으면 `POST /auth/guest` 호출
2. 발급된 토큰을 로컬 보안 저장소에 저장
3. 이후 모든 `/flow/*` 호출에 자동으로 첨부
4. 계정 전환 유도 시점(예: 설정 화면에서 사용자가 직접 선택, 또는 일정 기간 사용 후 배너 노출)에 `POST /auth/convert` 호출 — 토큰만 교체될 뿐 나머지 화면 흐름은 변하지 않는다(`DATA_PERSISTENCE_BRIEF.md` §6, `user_id` 불변)

---

## 5. 오프라인/전송 실패 정책

`API_LAYER_BRIEF.md` §5.1이 클라이언트 몫으로 남겨둔 사항이다.

- **`submit_attempt` 전송 실패 시**: 사용자의 시도 자체(정답 여부, 응답시간 등 원시 입력값)를 로컬에 임시 저장하고, 화면은 정상적으로 다음 문항으로 진행한다(사용자는 네트워크 문제를 체감하지 않는다). 백그라운드에서 재전송을 시도한다.
- **재전송 성공 시**: 서버 응답(`updated_state`, `cascade` 등)을 받아 그제서야 §3의 승격 감지·모달 로직을 (지연) 적용한다.
- **재전송이 계속 실패하는 경우**: 로컬 큐에 최대 N개(예: 20개)까지 쌓아두고, 그 이상 쌓이면 사용자에게 "네트워크 연결을 확인해달라"는 안내를 노출한다 — 무한정 쌓아두지 않는다(로컬 저장 공간 보호).
- **`start_session` 자체가 실패하는 경우**(오프라인으로 세션을 아예 시작 못 함): 완전 오프라인 최초 실행은 제품 요구사항이 아니라고 이미 확인했으므로(`API_LAYER_BRIEF.md` §3 결정), 이 경우는 단순히 "연결 후 다시 시도" 화면을 보여준다 — 로컬 큐잉 대상이 아니다.

이 정책은 서버의 트랜잭션 경계(핵심 원자적 + Cascade 아웃박스, `API_LAYER_BRIEF.md` §5)와 대칭을 이룬다 — 서버가 "일이 일어났다는 사실"을 잃지 않도록 설계된 것처럼, 클라이언트도 "사용자가 뭔가 했다는 사실"을 네트워크 문제로 잃지 않도록 설계한다.

---

## 6. Reflection 화면

`LEARNING_PROTOCOL.md` §15를 그대로 화면으로 옮긴다 — **새 저장 엔터티를 만들지 않는다.**

| 항목 | 데이터 출처 |
|---|---|
| 오늘 어려웠던 문법 | 이번 세션 중 `submit_attempt` 응답에서 `cascade`가 비어있지 않았던 노드 목록(클라이언트가 세션 동안 로컬에 누적) |
| Confidence 변화 | 자기보고가 있었으면 그 값, 없었으면 `updated_state`의 변화만 표시 |
| 추천 Review | 다음 `start_session` 호출 시 반환될 내용의 예고 — 이번 세션에서 미리 계산해 보여주지 않는다(중복 로직 방지, 다음 세션 시작 시 다시 물으면 된다) |
| 다음 세션 추천 시점 | 서버가 계산한 값이 없다면 이 항목은 생략한다(§8 확인 필요 참고) |

**IDLE 세션의 예외**: `start_session`이 처음부터 `IDLE`을 반환한 경우(할 게 없음) Reflection 화면 자체를 생략한다 — 되돌아볼 활동이 없었기 때문이다(§2 세션 흐름 참고).

---

## 7. 클라이언트 상태 관리 원칙

- **SSOT는 항상 서버다.** 클라이언트는 현재 세션의 진행 상황(어느 배치의 몇 번째 항목인지 등)만 메모리에 들고 있고, 앱 재시작 시 이 세션 내 진행 상태는 보존하지 않는다 — 재시작하면 `start_session`을 다시 호출해 서버의 최신 판단을 새로 받는다.
- **Conversation boundary acknowledgement**: `conversationBoundaryAcknowledged`는 현재 세션의 in-memory boolean이다. 기본값은 `false`, boundary 확인 후 `true`이며 세션 종료 또는 앱 재시작 시 `false`로 초기화한다. 영속 저장하지 않는다.
- **예외**: §5의 오프라인 큐(전송 실패한 시도)만 로컬 영속 저장소에 보존한다. 이것은 "진행 상태"가 아니라 "아직 서버에 전달 못 한 사실"이므로 성격이 다르다.
- **브라우저/앱 저장소 사용 범위**: 인증 토큰, §5 오프라인 큐, 이 둘만 영속 저장한다. 그 외 모든 화면 데이터는 API 응답을 그대로 렌더링하고 다음 호출 시 폐기한다.

---

## 8. 확인이 필요한 사항

- **Reflection의 "다음 세션 추천 시점"**: `LEARNING_PROTOCOL.md` §15는 "간격 반복 스케줄에 근거한 권장 재접속 시점"을 언급하지만, 이를 반환하는 API가 현재 5개 외부 API 어디에도 없다. `start_session` 응답에 추가할지, Reflection 전용으로 별도 필드를 만들지는 이번 문서에서 확정하지 않는다 — 필요성이 확인되면 `API_CONTRACT.md`의 다음 개정 대상이다.
- **Conversation Engine UI**: Conversation Engine 자체와 실제 대화 UI는 여전히 미정의다(Tier A 단계부터 이어진 범위 제한). 다만 미구현 상태에서 `next_action=CONVERSATION`을 정상 boundary 화면으로 표시하고, 사용자 확인 후 acknowledgement=true로 `start_session`을 재호출하는 흐름은 AC-012로 확정됐다.

---

## 9. 정합성 확인

`API_LAYER_BRIEF.md`·`DOMAIN_LOGIC_BRIEF.md`·`LEARNING_PROTOCOL.md`와 대조한 결과, §8에 기록한 두 항목(다음 세션 추천 시점 API 부재, Conversation Engine UI 미정의) 외에 새로운 구조적 불일치는 발견되지 않았다. Conversation boundary 화면과 acknowledgement 흐름은 AC-012로 확정됐고, 실제 Conversation Engine UI와 다음 세션 추천 API는 여전히 이번 문서 범위를 넘는 확장 결정이다.

---

## 10. Production 문서 로드맵 완료

`PRODUCTION_ARCHITECTURE_OVERVIEW.md`가 정의한 0~5번 문서(개요, 데이터 영속성, 도메인 로직, API 계층, AI 통합, 클라이언트)가 모두 완료됐다. 서버+DB 전환이라는 최초 결정에서 출발해, 실제 개발팀이 바로 구현에 착수할 수 있는 수준까지 다섯 개 계층이 서로의 산출물을 소비하며 일관되게 이어졌다.

**작성 과정에서 누적된 상위 문서 패치**: `API_CONTRACT.md`(v1.0→v1.3), `ENGINE_INTERFACE.md`(v1.0→v1.6), `DATA_PERSISTENCE_BRIEF.md`(v1.0→v1.4) — 전부 "새 설계"가 아니라 하위 문서를 실제로 작성해보며 드러난 상위 계약의 빈틈을 메운 것이다.

**다음 단계 제안(사용자 결정 필요)**:
1. `MIGRATION_GUIDE.md` 원본에 누적된 Entry 004·005 병합(`MIGRATION_GUIDE_ENTRIES_004_005.md` 참고)
2. `PROJECT_STATUS.md` 갱신 — Tier C가 이제 MVP 브리프 수준을 넘어 Production 지시서 세트로 확장됐음을 반영
3. Tier D(콘텐츠 실제 제작) 착수, 또는 §8에 남은 두 확인 사항(다음 세션 추천 API, Conversation Engine) 먼저 마무리

---

## 11. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — `LEARNING_PROTOCOL.md` §11 하루 프로토콜을 화면 흐름으로 매핑, `start_session`의 `next_action` 기반 세션 흐름 정의(배치/시퀀스 소진 시 재호출 원칙), 자기보고 Confidence 모달의 구체적 트리거(State 승격 감지, 세션당 최대 1회)와 비강제 원칙, 게스트 시작/계정 전환 클라이언트 흐름, 오프라인 전송 실패 로컬 큐잉 정책(서버 아웃박스와 대칭), Reflection 화면을 기존 데이터 조합으로 구성(신규 저장 없음), 클라이언트 상태 관리 원칙(SSOT는 서버, 예외는 인증 토큰과 오프라인 큐뿐). Production 문서 로드맵(0~5) 완료 선언 |
| 1.1 | 2026-07-17 | AC-012 Tier C Architecture Clarification — §2에 정상 Conversation boundary 표시→세션 메모리 acknowledgement→`start_session(true)` 재호출 흐름 추가, §7에 비영속 in-memory 상태와 세션 종료/앱 재시작 초기화 규칙 명시, §8의 미정의 범위를 실제 Conversation Engine UI로 한정. 클라이언트의 서버 `next_action` 임의 무시·정책 재판단 금지 유지 |
