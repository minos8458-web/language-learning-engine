# MIGRATION_GUIDE.md
## LLE Migration Guide (Tier C)

> Tier C(API_CONTRACT.md, ENGINE_INTERFACE.md) 및 이들이 참조하는 Tier A 문서의 계약이 바뀔 때마다, Development 프로젝트가 무엇을 확인·수정해야 하는지 여기 한 곳에 기록한다. 이 문서는 개별 문서의 개정 이력(각 문서 하단 표)을 대체하지 않는다 — 그것들은 "그 문서 안에서 무엇이 바뀌었는가"를 기록하고, 이 문서는 "그래서 구현체가 무엇을 해야 하는가"만 모아서 추적한다.

---

## 0. 문서의 지위

- Tier C. 규범 문서가 아니라 변경 추적 문서다 — 새로운 규칙을 만들지 않고, 이미 다른 문서에서 확정된 변경을 실행 관점에서 요약한다.
- 항목은 시간순(오름차순)으로 쌓는다. 기존 Entry는 수정하지 않는다 — 잘못된 경우 새 Entry로 정정 사항을 추가한다(Grammar Node ID의 ID Stability Principle과 같은 정신).

---

## 1. Entry 작성 규칙

각 Entry는 아래 형식을 따른다.

| 필드 | 설명 |
|---|---|
| Entry 번호 | 순차 증가(001, 002, ...) |
| 날짜 | YYYY-MM-DD |
| 변경 유형 | `ADDITIVE`(하위 호환, 기존 호출자 영향 없음) \| `BREAKING`(기존 호출자 수정 필요) |
| 영향 문서 | 변경이 발생한 원본 문서와 버전 |
| 요약 | 무엇이 바뀌었는가(1~2문장) |
| 필요한 조치 | Development가 실제로 해야 할 일 |
| 관련 패치 문서 | 있다면 IMPLEMENTATION_BRIEF 등 구체적 패치 지시서 |

---

## 2. Migration Entries

### Entry 001

| 필드 | 내용 |
|---|---|
| 날짜 | 2026-07-06 |
| 변경 유형 | **BREAKING** |
| 영향 문서 | CONTENT_SCHEMA.md v1.0 (신설), GRAMMAR_SCHEMA.md v1.5 |
| 요약 | Content 엔터티의 `grammar_node_id`(단수)가 `grammar_node_ids`(배열)로 변경. `body`(단일 필드)가 `media_assets[].asset_ref`로 변경 |
| 필요한 조치 | Content 접근 코드에서 `.grammar_node_id` 참조를 배열 기반 로직으로, `.body` 참조를 `media_assets`에서 `TEXT` 항목의 `asset_ref`로 변경 |
| 관련 패치 문서 | `IMPLEMENTATION_BRIEF_v0.2.md` |

### Entry 002

| 필드 | 내용 |
|---|---|
| 날짜 | 2026-07-06 |
| 변경 유형 | **ADDITIVE** |
| 영향 문서 | API_CONTRACT.md v1.1 (§4.7 신규), ENGINE_INTERFACE.md v1.4 |
| 요약 | Progress Engine API에 `get_due_reviews` 신규 추가 — 복습 기한이 도래한 노드 목록을 배치로 조회하는 API. 기존 API(`get_progress` 등)는 변경 없음 |
| 필요한 조치 | 새 기능(Review Queue 화면, LEARNING_PROTOCOL §3 Learning State Assessment 등)을 구현할 때만 이 API를 호출하면 된다. 기존 구현체는 아무것도 수정할 필요가 없다 |
| 관련 패치 문서 | 없음(기존 IMPLEMENTATION_BRIEF 범위 밖의 신규 기능이므로 별도 브리프 필요 시 추후 작성) |


### Entry 003

| 필드 | 내용 |
|---|---|
| 일자 | 2026-07-13 |
| 대상 문서 | `PROGRESS_SCHEMA.md`(v1.0 → v1.1), `DOMAIN_LOGIC_BRIEF.md`, `DATA_PERSISTENCE_BRIEF.md`, `VALIDATION_LEVEL3.md` |
| 변경 유형 | **Frozen Core Standard Amendment**(Tier A 구조 확장) + Tier C Architecture Clarification(Scheduling 규칙, 같은 root cause) |
| 발견 경위 | Independent Architecture Audit(AUD-002) — `DOMAIN_LOGIC_BRIEF.md` §3.2의 승격 조건이 순수 윈도우 정확도(횟수 기반, 시간 개념 없음)만 사용해, 한 번의 연속 시도(burst) 안에서 `PRACTICING → MASTERED → AUTOMATIC`이 전부 가능했음을 발견. 상위 LEARNING_THEORY의 Spaced Repetition 원칙을 State 전이 알고리즘이 표현하지 못한 것으로 판정 |
| 변경 내용(Amendment 본체) | `PROGRESS_SCHEMA.md` §3 State Model에 `mastered_at`(TIMESTAMPTZ, nullable) 추가, §4 AttemptRecord에 `is_spaced_review`(BOOLEAN) 추가. `PRACTICING → MASTERED` 승격에 qualifying spaced review 최소 3회(Provisional/tunable), `MASTERED → AUTOMATIC` 승격에 `mastered_at` 이후 spaced review 최소 2회를 각각 추가 조건으로 요구 |
| Governance 근거 | `CORE_STANDARD_V1_FREEZE.md` §5 절차 4단계(변경 근거 문서화 → 최소 2~3개 대안 비교 → `PROJECT_VISION.md` §6에 따른 명시적 사용자 승인 → 개정 이력 기록) 전부 완료. 저장 모델 검토 시 대안 A(`progress.mastered_at` 단일 필드)/B(`attempt_records.state_before/after`)/C(별도 history 테이블)/D(기존 데이터만으로 계산) 4개를 비교해 A를 채택(B는 고빈도 테이블에 대부분 무의미한 컬럼 추가라 낭비, C는 과설계, D는 `next_review_at`이 현재 예정 시점 하나만 보유하고 과거 attempt 처리 직전의 snapshot history를 저장하지 않아 사후 재구성이 불가능하므로 기각) |
| 변경 내용(Scheduling Clarification, 같은 발견에서 파생) | 패치 산출물 재검토 중, qualifying spaced review 정의와 기존 "모든 시도 후 무조건 `next_review_at` 재계산" 규칙이 충돌함을 추가로 발견 — due 이전 자발적 조기 연습을 하는 학습자일수록 `next_review_at`이 계속 미래로 밀려나 spacing evidence를 영원히 충족하지 못하는 역설이 있었다. `DOMAIN_LOGIC_BRIEF.md` §6.1을 조건부 갱신 규칙으로 개정 — State 전이 발생 시 또는 due 이후 State 유지 attempt에서만 재계산, due 이전 조기 연습은 `next_review_at` 유지. 비교 기준은 반드시 attempt 처리 직전의 스냅샷이어야 하며 같은 attempt 안에서 재계산된 값과 비교 금지. `next_review_at IS NULL`이면 `is_spaced_review=false`로 안전 처리 |
| 검토한 Scheduling 대안 | A(due 이전엔 `next_review_at` 유지 — 채택), B(별도 필드 `next_mastery_review_at` 신설 — SSOT 중복이라 기각), C(attempt 간 직접 시간 간격 계산 — 검증 결과 오히려 같은 역설을 재현함이 확인되어 기각) |
| Governance 분류(Scheduling 부분) | Tier A(`PROGRESS_SCHEMA.md`) 재개방 아님 — `next_review_at`은 이미 존재하는 필드이고 언제 갱신되는가(Tier C 알고리즘)만 수정. `CORE_STANDARD_V1_FREEZE.md` §5의 무거운 Tier A 거버넌스 절차 대상이 아닌 일반 Architecture Clarification으로 처리 |
| 영향 범위 | `progress`·`attempt_records` 테이블 스키마 변경(컬럼 2개 추가). Review Scheduling 알고리즘(Progress Engine 구현)에 조건 분기 추가 필요. `API_CONTRACT.md`는 외부 계약 불변이라 변경 없음(`submit_attempt`의 `updated_state` 출력이 이미 승격 결과를 담고 있어 내부 판정이 더 엄격해지는 것만으로 충분) |
| 하위 호환성 | **깨짐 — 마이그레이션 필요.** 기존 `progress`/`attempt_records` 행에는 `mastered_at`·`is_spaced_review`가 없다(NULL/기본값 `false`로 채워짐). 이미 `MASTERED`/`AUTOMATIC` 상태인 기존 사용자 행에 대해 `mastered_at`을 소급 계산할지, 이번 배포 시점을 기준으로 새로 시작할지는 **별도 결정 필요**(이 Entry의 범위 밖 — 구현 착수 시 재상정 권장). Scheduling 규칙 변경 자체는 스키마 변경이 없어 추가 마이그레이션 대상 없음 |
| Entry 번호 참고 | 이 Entry는 canonical main의 마지막 확정 Entry(002) 다음 순번인 **003**으로 병합됐다. 이전에 병합 대기 상태에서 "Entry 006"으로 잠정 표기됐던 것은 canonical 번호가 아니었다(§1 참고) |

### Entry 004

| 필드 | 내용 |
|---|---|
| 일자 | 2026-07-13 |
| 대상 문서 | `GRAMMAR_SCHEMA.md`(v1.6 → v1.7), `GRAMMAR_GRAPH.md`(v1.4 → v1.5), `API_CONTRACT.md`(v1.9 → v1.10), `ENGINE_INTERFACE.md`(v1.9 → v1.10), `VALIDATION_LEVEL3.md`(v1.4 → v1.5) |
| 변경 유형 | **Frozen Core Standard Amendment**(Tier A 구조 확장 — Grammar Relation 엔터티에 새 invariant 추가) |
| 발견 경위 | Independent Architecture Audit(AUD-003) — `src/engines/graphEngine.js`의 `prerequisiteSearchInternal`·`findRelatedNodes`·`validateLanguagePack`이 `grammar_relations`의 `from_node_id`/`to_node_id` 양 끝 Grammar Node의 `language` 일치를 전혀 확인하지 않아, cross-language 관계(예: `GRAMMAR_VI_* → GRAMMAR_EN_*`인 `PREREQUISITE`)가 적재·탐색·validation 통과 모두 가능한 상태였음을 발견. `GRAMMAR_SCHEMA.md` §6은 `from_node_id`/`to_node_id`의 존재성·self-reference 금지·PREREQUISITE 방향 제약은 있었지만 same-language 요구는 명시한 적이 없었다 — Tier A 계약 공백으로 판정 |
| Same-language invariant(최종 확정) | `grammar_relations.from_node_id`가 참조하는 Grammar Node의 `language`와 `grammar_relations.to_node_id`가 참조하는 Grammar Node의 `language`는 반드시 동일해야 한다. `PREREQUISITE`·`RELATED`·`CONTRAST`·`ALTERNATIVE` **4종 전부** 적용 |
| Cross-language pedagogical mapping | Grammar Relation에 저장하지 않는다 — 기존 Universal Concept layer(`GRAMMAR_SCHEMA.md` 2장, `concept_ids`)로 처리한다. 새로운 cross-language relation 엔터티는 만들지 않는다(과설계 방지) |
| Governance 근거 | `CORE_STANDARD_V1_FREEZE.md` §5 절차 4단계 전부 완료 — 1차 판정(Architecture Clarification, 필드 추가 없음을 근거)에서 재심사를 거쳐 **Tier A Amendment로 철회·재분류**됐다(entity의 admissible state space를 좁히는 것 자체가 엔터티 정의 변경에 해당하며, `GRAMMAR_GRAPH.md` §2의 기존 문언만으로는 이 invariant가 이미 규범적으로 강제됐다고 확정할 문헌적 근거가 불충분했기 때문). 대안 비교: A(DB hard constraint 없음 — 3중 논리 방어만) 채택, B(DB trigger — 이 프로젝트가 지금까지 도메인 로직을 Engine 계층에 두고 DB는 저장·기본 참조무결성만 담당해온 스타일에서 벗어나는 첫 사례라 기각), C(`grammar_relations.language` 중복 컬럼 — `grammar_nodes`에서 이미 유도 가능한 값의 불필요한 중복이라 기각), D(runtime traversal filter만 — 배포 전 정적 검증 없이는 무의미한 edge가 저장 계층에 영구히 남아 기각) |
| DB Enforcement | **DB trigger 없음. `grammar_relations.language` 컬럼 추가 없음. 일반 CHECK constraint 없음.** 현재 `grammar_relations` 스키마에는 `language` 컬럼이 없어(다른 테이블 `grammar_nodes`를 참조해야 판정 가능) 일반 CHECK로는 표현 불가능하다. 대신 3중 논리 방어: ① `GRAMMAR_SCHEMA.md` §6 Tier A invariant(저작 시 준수 규칙) ② `validate_language_pack` 배포 전 정적 검증(hard gate) ③ runtime traversal defense-in-depth |
| `validate_language_pack` output 변경 | `{is_valid, cycle_violations[], concept_consistency_violations[], language_boundary_violations[]}` — `language_boundary_violations[]` 신규 추가. `is_valid`는 세 violation 목록이 전부 비어 있을 때만 `true` |
| Runtime traversal defense-in-depth | `prerequisite_search`(선행 탐색)·`dependent_search`(후행 탐색)·`find_related_nodes`가 시작 노드의 `language`를 벗어난 노드를 따라가거나 반환하지 않는다. 배포 전 검증 통과 여부와 무관하게 항상 적용(LLE Stability over Speed 원칙) |
| DB schema / SQL migration | **없음.** `grammar_relations`·`grammar_nodes` 테이블 컬럼 변경이 전혀 없다 — 이번 Amendment는 기존 필드(`from_node_id`, `to_node_id`, `language`)의 조합에 새 invariant를 추가하는 것뿐이며, `validate_language_pack`의 출력 필드 추가와 Graph Engine 함수들의 필터 로직 추가만 필요하다 |
| Entry 번호 참고 | 이 Entry는 canonical main의 마지막 확정 Entry(003) 다음 순번인 **004**다 |

---

## 3. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — Entry 001(Content 구조 변경, BREAKING), Entry 002(`get_due_reviews` 추가, ADDITIVE) 기록 |
| 1.1 | 2026-07-13 | Entry 003 추가 — AUD-002 Frozen Core Standard Amendment 및 같은 root cause에서 파생된 Review Scheduling Clarification을 canonical migration record로 병합 |
| 1.2 | 2026-07-13 | Entry 004 추가 — AUD-003 Frozen Core Standard Amendment(Grammar Relation same-language invariant, `validate_language_pack` output 확장, runtime traversal defense-in-depth)를 canonical migration record로 병합. DB schema/SQL migration 없음을 명시 |
