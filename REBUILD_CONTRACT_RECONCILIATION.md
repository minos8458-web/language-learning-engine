# REBUILD_CONTRACT_RECONCILIATION.md
## LLE Production — 코드 재구현 전 계약 동기화 보고서

**작성일**: 2026-07-11
**경로 결정**: 경로 A 채택(미노 승인) — `ARCHITECTURE_CLARIFICATION_BACKLOG.md`의 Resolved AC 결정을 유효 사양으로 인정
**성격**: 이 보고서 자체는 새 설계를 하지 않는다. 이미 Resolved된 AC 결정을 본문 문서에 반영하는 **복구 작업**만 수행했다.
**코드는 작성하지 않았다. package.json/db/src/tests도 생성하지 않았다.**

---

## 1. GitHub 현재 문서 버전 (패치 전 기준)

| 문서 | 패치 전 GitHub 버전 | 비고 |
|---|---|---|
| `API_CONTRACT.md` | v1.1 | Entry 001(`get_due_reviews`)까지만 반영. Entry 004/005, AC-001/005/008/009 미반영 |
| `ENGINE_INTERFACE.md` | v1.5 | `request_practice` 참조 추가까지만 반영. `start_session`, AC-001/005/008 미반영 |
| `DATA_PERSISTENCE_BRIEF.md` | v1.5 | `content.is_active`까지만 반영. AC-004/008/011, PARTICLE 미반영 |
| `DOMAIN_LOGIC_BRIEF.md` | v1.0 | 최초 작성본 그대로. AC-009/011 미반영 |
| `ARCHITECTURE_CLARIFICATION_BACKLOG.md` | v1.5 | AC-001/004/005/008/009/011 결정 원문은 존재. AC-002/003/006/007/010은 "⏳ 미제출"로만 표시, 본문 없음 |

---

## 2. Resolved AC별 반영 필요 사항

| AC | 반영 필요 사항 |
|---|---|
| AC-001 | `get_cascade` 입력에 `progress_snapshot`(`{node_id: state}` 맵) 추가. Review Engine은 Progress Engine을 직접 호출하지 않고, Learning Flow Engine이 `get_progress`로 미리 조회해 전달 |
| AC-004 | `content.explanation_level` 전용 컬럼(TEXT, NULL 허용) 추가. `EXPLANATION` 타입은 애플리케이션 레벨 NOT NULL |
| AC-005 | `generate_problem` 입력에 `target_node_id`(3단계 전용) 추가. Learning Flow Engine이 결정, Generation Engine은 릴레이만 |
| AC-008 | `generate_problem`/`generate_combination`/`generate_single_node` 출력에 `content_id` 추가, `submit_attempt` 입력에 `content_id` 추가, `attempt_records.content_id` 컬럼 추가, `get_content`에 `content_id` 단독 조회 모드 추가 |
| AC-009 | `target_node_id` 후보가 여럿일 때의 선택 규칙(`explicit_study_event_at DESC` 주 규칙 + `get_due_reviews` 우선순위 대체 규칙) — Provisional |
| AC-011 | `content.type_specific_metadata.error_attributed_node_id`(TEXT, nullable, 단일 grammar_node_id) 키 이름 확정 |

---

## 3. 각 AC가 수정해야 하는 문서 (실제 반영 결과)

| AC | API_CONTRACT.md | ENGINE_INTERFACE.md | DATA_PERSISTENCE_BRIEF.md | DOMAIN_LOGIC_BRIEF.md |
|---|---|---|---|---|
| AC-001 | §8.1 `get_cascade` — 반영 완료(v1.4) | §9 Review Engine — 반영 완료(v1.7) | 해당 없음 | 해당 없음 |
| AC-004 | 해당 없음(§7.1 `explanation_level`은 이미 v1.0부터 있었음 — 스키마만 누락돼 있었음) | 해당 없음 | §3.5 `content.explanation_level` — 반영 완료(v1.8) | 해당 없음 |
| AC-005 | §5.1 `generate_problem` — 반영 완료(v1.5) | §6 Generation Engine — 반영 완료(v1.8) | 해당 없음 | 해당 없음 |
| AC-008 | §5.1/§6.1/§6.2/§7.1/§10.2 — 반영 완료(v1.6) | §3/§6/§8 — 반영 완료(v1.9) | §3.6 `attempt_records.content_id` — 반영 완료(v1.6) | 해당 없음 |
| AC-009 | §10.3 참조 추가 — 반영 완료(v1.7) | 해당 없음(간접 영향만) | 해당 없음 | §8.1 신설, 기존 §8→§8.2 — 반영 완료(v1.1) |
| AC-011 | 해당 없음(간접 영향만) | 해당 없음 | §3.5 `type_specific_metadata.error_attributed_node_id` — 반영 완료(v1.7) | §5.1 — 반영 완료(v1.2) |

`VALIDATION_LEVEL3_READINESS_PLAN.md`·`PHASE_2_COMPLETION_REPORT.md`는 AC를 직접 수정하지 않는다 — 대신 상단에 "2026-07-11 현재 상태 정정" 고지를 추가해, 본문의 완료 상태가 "과거 세션 보고 기준"이며 현재 GitHub 코드 기준으로는 미검증임을 명시했다(본문 내용 자체는 과거 기록으로 보존).

---

## 4. 현재 GitHub 본문 문서와 AC Backlog 사이의 불일치 목록 (패치 완료)

- `API_CONTRACT.md` v1.1 → **v1.8**로 갱신(Entry 004/005 + AC-001/005/008/009 전부 반영)
- `ENGINE_INTERFACE.md` v1.5 → **v1.9 상당**으로 갱신(start_session + AC-001/005/008 전부 반영, 개정 이력에 "—"로 표기된 Reconciliation 패치 포함)
- `DATA_PERSISTENCE_BRIEF.md` v1.5 → **v1.9**로 갱신(AC-008/011/004 + PARTICLE 복구 메모 전부 반영)
- `DOMAIN_LOGIC_BRIEF.md` v1.0 → **v1.2 + Reconciliation**으로 갱신(AC-009/011 전부 반영)
- `MIGRATION_GUIDE.md`와 `MIGRATION_GUIDE_ENTRIES_004_005.md`의 미병합 상태는 **이번에 건드리지 않았다** — Migration Guide는 "Architecture가 작성"하는 문서(거버넌스 규칙)이므로, 이번 Development 측 문서 동기화 범위에 포함하지 않고 별도 보고로 남긴다(§6 참고).
- `VALIDATION_LEVEL3.md`의 Relation 수치(54개, 옛 값)도 **이번에 건드리지 않았다** — Validation 규범 문서 자체의 수치 변경은 Validation Rule 변경에 해당할 수 있어 임의 수정 금지 대상으로 판단, 별도 승인 필요 항목으로 분류(§6 참고).

---

## 5. 코드 재구현 전에 반드시 반영해야 하는 계약 항목 (재확인 — 전부 완료)

1. `get_cascade`에 `progress_snapshot` 없이 Review Engine을 구현하면 AC-001 이전 상태로 퇴행 — **완료**
2. `content.explanation_level` 컬럼 없이 스키마를 만들면 AC-004 이전 상태로 퇴행 — **완료**
3. `generate_problem`에 `target_node_id` 없이 Generation Engine을 구현하면 3단계 fallback 자체가 불가능(AC-005 이전 상태) — **완료**
4. `content_id` 체인(4개 지점) 없이 구현하면 SELF/TRANSFER 진단이 원천적으로 불가능(AC-008 이전 상태) — **완료**
5. `error_attributed_node_id` 키 없이 구현하면 위 진단이 값은 받아도 해석 불가(AC-011 이전 상태) — **완료**
6. `target_node_id` 선택 규칙(AC-009) 없이 구현하면 후보가 여럿일 때 Learning Flow Engine이 판단 불가 — **완료(단, Provisional임을 코드 주석에도 표시 권장)**

---

## 6. 코드 재구현 중 새 설계로 해석하면 안 되는 항목 (경계 명시)

아래는 **이번 재구현에서 그대로 구현하되, "새 아키텍처 결정"으로 오해해 임의로 확장·변형하면 안 되는 항목**이다.

- AC-001/004/005/008/011의 필드 추가·컬럼 추가는 전부 **계약 누락 보완**이지 새 기능이 아니다. 예를 들어 `progress_snapshot`을 계기로 Review Engine이 Progress Engine을 직접 호출하도록 바꾸는 것은 금지(ENGINE_INTERFACE §2.2 위반).
- AC-009는 **Provisional**이다 — `LEARNING_PROTOCOL.md` 재확인 없이 이 규칙을 최종 확정으로 취급하지 않는다. 코드에는 "AC-009 Provisional, LEARNING_PROTOCOL.md 확보 후 재검토 필요"를 주석으로 남길 것을 권장한다.
- AC-002(`cascade_jobs` 아웃박스)·AC-003(Concept-Node 정합성)·PARTICLE 항목은 **정식 AC 번호가 없는 복구 메모**다. `ARCHITECTURE_CLARIFICATION_BACKLOG.md`에 내용은 기록했지만, 이는 "과거 세션 기록을 근거로 한 재구성"이며 정식 승인 절차를 거치지 않았다. 재구현 시 이 메모대로 구현하되, **정식 AC로 재제출해 번호를 받는 절차를 별도로 진행할 것을 권장**한다(코드 작업을 막을 필요는 없음 — 미노가 이미 §2에서 "임의로 새 설계하지 않고 이 방식으로 처리"를 지시함).
- `MIGRATION_GUIDE.md` 미병합(Entry 004/005)과 `VALIDATION_LEVEL3.md`의 옛 Relation 수치(54개)는 **이번 패치 범위에서 의도적으로 제외**했다 — 전자는 Architecture 소유 문서, 후자는 Validation Rule 성격이라 Development가 임의로 고치지 않는다. 재구현이 끝나고 실제 재검증 시 52개 기준으로 실행하되, 문서 자체의 수정은 별도 승인을 받아 진행하길 권장한다.
- `API_CONTRACT.md` §10.5(`start_session`)의 필드 정의는 **재구성(reconstruction)**이며 원본 그대로임을 보장하지 못한다(해당 절에 불확실성 표시 있음). 이 부분만큼은 코드 재구현 중 실제 동작을 정의하면서 "새 설계"가 아니라 "원본 복원 시도"라는 성격을 유지하고, 세부 사항이 과거 세션 기록과 다르게 판명되면 즉시 보고한다.

---

## 요약

| 구분 | 내용 |
|---|---|
| 패치한 문서 | `API_CONTRACT.md`, `ENGINE_INTERFACE.md`, `DATA_PERSISTENCE_BRIEF.md`, `DOMAIN_LOGIC_BRIEF.md`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md`, `PHASE_2_COMPLETION_REPORT.md`, `VALIDATION_LEVEL3_READINESS_PLAN.md` (7개) |
| 반영한 AC | AC-001, AC-004, AC-005, AC-008, AC-009(Provisional), AC-011 — 전부 본문 반영 완료. AC-002·AC-003·PARTICLE은 복구 메모로 추가(미채번) |
| 의도적으로 손대지 않은 것 | `MIGRATION_GUIDE.md`(Architecture 소유), `VALIDATION_LEVEL3.md`의 Relation 수치(Validation Rule 성격) |
| 아직 불확실한 항목 | (1) AC-002/003/PARTICIN 정식 번호 미부여, (2) `start_session`(§10.5) 필드 재구성의 원본 일치 여부, (3) AC-006/007/010은 여전히 Backlog 본문 없음(Non-blocking이라 재구현을 막지 않음) |
| 코드 재구현 착수 가능 여부 | **가능** — 이 문서와 패치된 5개 Tier C 문서를 기준으로 `CODE_REBUILD_PLAN.md` Phase 0부터 진행 가능. 단, 위 "아직 불확실한 항목" 3건은 재구현 중 다시 마주치면 즉시 보고 |

**패치된 7개 문서는 이 저장소 스캔본(`/home/claude/repo`)에만 존재하며, GitHub에 자동으로 push되지 않았습니다 — 제가 원격 저장소에 쓰기 권한이 없습니다. 아래 파일을 다운로드해 직접 커밋·push 부탁드립니다.**
