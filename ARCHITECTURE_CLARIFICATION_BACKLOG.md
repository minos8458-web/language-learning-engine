# ARCHITECTURE_CLARIFICATION_BACKLOG.md
## LLE Phase 1→2 개발 전환 중 발견된 Architecture Clarification 항목

> 이 문서는 Development 세션(Phase 1 이후 실제 구현)에서 발견되어 Architect(Claude, Tier A~D 문서 관리자)에게 결정을 요청한 항목을 추적한다. 모든 결정은 기존 Tier A~D 설계를 소비하는 형태로만 내려지며, `CORE_STANDARD_V1_FREEZE.md` §5의 거버넌스 절차를 넘는 수준의 재설계는 이 문서가 아니라 해당 상위 문서의 정식 개정 절차를 따른다.

---

## 상태 요약

| ID | 제목 | 상태 |
|---|---|---|
| AC-001 | `get_cascade` 입력 계약 불일치 | ✅ Resolved |
| AC-002~003, 006~007, 010 | (Development 세션에서 아직 이 문서로 제출되지 않음) | ⏳ 미제출 |
| AC-004 | `content.explanation_level` 저장 위치 부재 | ✅ Resolved(재상정 — non-blocking→blocking) |
| AC-005 | Generation Engine 3단계 PRE_MADE fallback 대상 node_id 특정 불가 | ✅ Resolved |
| AC-008 | `submit_attempt`에 SELF/TRANSFER 진단용 content_id 부재 | ✅ Resolved |
| AC-009 | `request_practice`의 `target_node_id` 선택 규칙 미정 | 🟡 Provisional(LEARNING_PROTOCOL.md 확보 후 재검토 필요) |
| AC-011 | SELF/TRANSFER 진단 키 이름 미정 | ✅ Resolved |
| AUD-002 | MASTERED/AUTOMATIC Temporal Stability Contract(Independent Architecture Audit) | ✅ **CLOSED** — Frozen Core Standard Amendment, 상세는 §AUD-002 참고 |
| AUD-001 | GitHub main 문서 간 current/historical 상태 혼동(Independent Architecture Audit) | ✅ Architecture/Documentation Decision **CLOSED** — 🟡 Repository Reconciliation **PENDING MERGE**(패치 파일은 준비 완료, GitHub main 반영은 범위 밖). 상세는 §AUD-001 참고 |

---

## AC-001 — `get_cascade` 입력 계약 불일치

**상태**: ✅ Resolved (2026-07-08)

**Source**:
- `API_CONTRACT.md` §8.1
- `DOMAIN_LOGIC_BRIEF.md` §5.2
- `ENGINE_INTERFACE.md` §9

**Problem**: `DOMAIN_LOGIC_BRIEF.md` §5.2의 Cascade 필터링은 선행 노드별 `progress.state`(특히 `NOT_INTRODUCED` 여부)가 필요하다. 하지만 `API_CONTRACT.md` §8.1의 `get_cascade` 입력에는 `node_id`, `error_category`, `max_cascade_depth`만 있고 상태 데이터가 없었다. `ENGINE_INTERFACE.md` §9.6은 Review Engine이 Progress Engine을 직접 호출하지 않고 "필요한 상태는 입력으로 전달받는다"고 명시했지만, §9.3 입력 목록에는 그 필드가 실제로 없어 계약이 불완전했다 — `get_cascade` 구현이 기존 계약만으로는 불가능한 상태였다.

**Decision**: `get_cascade` 입력에 `progress_snapshot`(`{node_id: state}` 맵) 추가.

```
progress_snapshot: {
  [node_id]: state
}
```

**핵심 규칙**:
- Review Engine은 Progress Engine을 직접 호출하지 않는다(변경 없음, `ENGINE_INTERFACE.md` §9.6 유지).
- Learning Flow Engine이 `get_cascade` 호출 **전에** 해당 언어 전체 노드 상태를 `get_progress`로 미리 조회한다.
- 그 결과를 `progress_snapshot`으로 Review Engine에 전달한다.
- Review Engine은 Graph Engine 결과(선행 탐색)와 `progress_snapshot`만 사용해 Cascade 필터링을 수행한다 — 필터링 알고리즘 자체는 Review Engine 내부에 남는다.
- `progress_snapshot`에 없는 노드는 `NOT_INTRODUCED`로 처리한다(안전한 기본값).

**기각된 대안**: (1) `user_id`를 넘겨 Review Engine이 직접 조회 — Progress Engine 직접 호출 금지 원칙 위반이라 불가능. (2) 필터링을 Learning Flow Engine으로 이관 — `ENGINE_INTERFACE.md` §3.8 "얇은 조정자" 원칙 위반(God Object화) 및 `API_CONTRACT.md` §12 금지 사항(필터 통과/탈락 내역 비노출) 위반.

**Freeze 영향**: 없음 — 새 아키텍처 결정이 아니라 §9.6이 이미 선언한 원칙("상태는 입력으로 전달받음")을 구체적 필드로 완성한 계약 누락 보완이다. `CORE_STANDARD_V1_FREEZE.md` §5의 무거운 거버넌스 절차 대상이 아니다.

**패치 문서**:
- `API_CONTRACT.md` v1.3 → **v1.4**(§8.1)
- `ENGINE_INTERFACE.md` v1.6 → **v1.7**(§9.3)

---

## AC-004 — `content.explanation_level` 저장 위치 부재

**상태**: ✅ Resolved (2026-07-08, 재상정 — 최초 non-blocking 분류 → blocking 재분류 후 확정)

**Source**:
- `API_CONTRACT.md` §7.1(`get_content`)
- `CONTENT_PRODUCTION_STANDARD.md` §4.1(체크리스트)
- `DATA_PERSISTENCE_BRIEF.md` §2(컬럼/JSONB 판단 기준), §3.5(`content`)

**Problem**: `get_content`(§7.1) 입력에는 `explanation_level`(선택)이 이미 필터 조건으로 정의돼 있었지만, `content` 테이블에는 이를 저장할 컬럼이 없었다. 최초 발견 시 non-blocking으로 분류했으나, `CONTENT_PRODUCTION_STANDARD.md` §4.1 체크리스트가 "`EXPLANATION`이면 `explanation_level`이 있는가"를 명시적 검증 항목으로 요구하고 이 체크리스트가 §4.2를 통해 `VALIDATION_FRAMEWORK.md` Level 0(Schema Validation) 자동검증에 편입된다는 점이 확인되며, 저장 위치 없이는 이 자동검증 자체가 불가능하다는 것이 드러나 Tier D 콘텐츠 적재 전 선행 Blocker로 재분류됐다.

**Decision**: `content.explanation_level` 전용 컬럼(후보 1) 추가. `DATA_PERSISTENCE_BRIEF.md` §2의 기존 판단 기준("조건절에 자주 쓰이고 타입이 고정적인 필드는 컬럼")을 그대로 적용한 것 — `get_content`가 이미 이 필드를 WHERE 조건으로 쓰도록 설계돼 있었으므로 새 원칙이 아니라 기존 원칙의 적용 누락 보완이다.

| 결정 항목 | 값 |
|---|---|
| 저장 위치 | `content.explanation_level` 전용 컬럼 |
| 값 타입 | TEXT, NULL 허용(ENUM 아님 — 허용값 전체 목록이 `CONTENT_SCHEMA.md` 미확인 상태라 변경 비용 큰 ENUM 대신 유연한 TEXT 채택) |
| 허용 값 | 확인된 값은 `BEGINNER`(기존 Tier D 255개 콘텐츠 전부). 전체 목록은 `CONTENT_SCHEMA.md`(이 세션에 없는 Tier A 문서) 확인 필요 |
| EXPLANATION 전용 여부 | `EXPLANATION`은 NOT NULL(애플리케이션 레벨 검증), 나머지 9종은 NULL(금지 아님, 현재 사용 콘텐츠 없음) |
| `get_content` 필터링 | §7.1 계약 변경 없음 — 컬럼이 생기면 기존 계약 그대로 구현 가능 |
| 기존 콘텐츠 처리 | VI/EN/JA/ZH 255개 Tier D 콘텐츠는 메타데이터 표에 `explanation_level: BEGINNER`를 이미 명시해뒀음 — 적재 시 그대로 컬럼값으로 이관 |

**부수 발견**: `type_specific_metadata` 설명이 "별도 컬럼으로 만들지 않는 이유는 §6 참고"라고 돼 있었으나 §6은 "게스트→계정 전환"으로 무관한 절이었다 — 실제 근거는 §2였다. 오기를 정정했다.

**기각된 후보**: (2) `type_specific_metadata.explanation_level`, (3) `content.metadata.explanation_level` — 둘 다 §2 판단 기준(조건절에 자주 쓰이는 고정 타입 필드는 컬럼)과 정반대 방향이라 기각.

**Freeze 영향**: 없음 — 기존 §2 원칙의 적용 누락 보완.

**패치 문서**:
- `DATA_PERSISTENCE_BRIEF.md` v1.7 → **v1.8**(§3.5)

---

## AC-005 — Generation Engine 3단계 PRE_MADE fallback 대상 node_id 특정 불가

**상태**: ✅ Resolved (2026-07-08)

**Source**:
- `API_CONTRACT.md` §5.1(`generate_problem`), §7.1(`get_content`)
- `ENGINE_INTERFACE.md` §6(Generation Engine)
- `DOMAIN_LOGIC_BRIEF.md` §8(4단계 사다리)
- `GRAMMAR_GRAPH.md` §6.2(원문 미확인 — 이 세션에 파일 없음, Development 세션 인용에 의존)

**Problem**: 사다리 3단계는 사전 제작 Canonical EXAMPLE Content로 대체해야 하는데(`DOMAIN_LOGIC_BRIEF.md` §8), 이를 조회하는 `get_content`(`API_CONTRACT.md` §7.1)는 `node_id`가 필수 입력이다. 하지만 `generate_problem`(§5.1)의 입력에는 `target_concept_id`만 있고 `node_id`가 없었다. Concept:Grammar Node가 항상 1:1은 아니다(예: VI 수동태 Concept은 `DUOC_PASSIVE`·`BI` 2개 노드에 대응) — 어떤 구체적 노드를 조회해야 하는지 계약상 알 방법이 없었다. Generation Engine은 Graph·Progress Engine을 직접 호출할 수 없고(`ENGINE_INTERFACE.md` §6.6), AI Generation Engine 위임 경로도 1~2단계 실패 신호에 노드 식별 정보가 없어 실제로는 쓸 수 없었다.

**Decision**: `generate_problem` 입력에 `target_node_id`(3단계 전용) 추가. `target_concept_id`는 1~2단계용으로 그대로 유지.

**핵심 규칙**:
- Learning Flow Engine이 이미 가진 Progress Engine 읽기 권한으로 "지금 사용자에게 관련된 구체적 노드"를 결정해 `target_node_id`로 전달한다.
- Generation Engine은 이 값을 계산하지 않고 3단계에서 Content Engine으로 그대로 릴레이만 한다.
- Content Engine·AI Generation Engine에는 새 권한을 추가하지 않는다.
- 클라이언트(`request_practice` 호출자)는 `target_node_id`를 알거나 전달할 필요가 없다 — 전적으로 서버 내부 결정.

**기각된 대안**: (1) Content Engine에 `target_concept_id` 기반 조회 API 추가 — Content Engine은 Progress 접근이 없는 리프 Engine이라 Concept 아래 여러 노드 중 "아무거나" 고를 수밖에 없어, 사용자가 실제로 다루는 노드와 다른 콘텐츠를 잘못 서빙할 위험이 있어 기각. (2) AI Generation Engine 위임 경로 확장(실패 신호에 노드 정보 포함) — §6의 "필터 파이프라인 단계별 통과/탈락 내역 비노출" 금지와 충돌 소지가 있어 기각.

**Freeze 영향**: 없음 — AC-001과 동일한 성격의 계약 누락 보완. 새 Engine 간 호출 경로를 추가하지 않았다.

**패치 문서**:
- `API_CONTRACT.md` v1.4 → **v1.5**(§5.1, §10.3)
- `ENGINE_INTERFACE.md` v1.7 → **v1.8**(§3, §6)

---

## AC-008 — `submit_attempt`에 SELF/TRANSFER 진단용 content_id 부재

**상태**: ✅ Resolved (2026-07-08)

**Source**:
- `API_CONTRACT.md` §5.1(`generate_problem`), §7.1(`get_content`), §10.2(`submit_attempt`)
- `DOMAIN_LOGIC_BRIEF.md` §5.1(SELF/TRANSFER 분류)
- `DATA_PERSISTENCE_BRIEF.md` §3.5(`content`), §3.6(`attempt_records`)

**Problem**: `DOMAIN_LOGIC_BRIEF.md` §5.1은 SELF/TRANSFER 분류 기준을 Content의 `type_specific_metadata` 진단 정보에 둔다. 하지만 `submit_attempt`(§10.2) 입력에는 `content_id`가 없어 어떤 Content를 풀었는지 알 수 없었다. 진단 결과 이 문제는 단일 필드 누락이 아니라 **연쇄적 계약 공백**이었다: (1) `generate_problem`(§5.1) 출력에도 `content_id`가 없어 클라이언트가 애초에 식별자를 받을 방법이 없었고, (2) `attempt_records` 테이블(`DATA_PERSISTENCE_BRIEF.md` §3.6)에 `content_id` 컬럼 자체가 없어 저장할 곳도 없었으며, (3) `get_content`(§7.1)는 조건 기반 조회만 지원해 `content_id`가 있어도 정확히 그 레코드 하나를 특정할 방법이 없었다.

**Decision**: 후보 1(content_id 추가)을 4개 지점에 연쇄 반영.

1. `generate_problem` 출력에 `content_id` 추가 — AI_GENERATED든 PRE_MADE든 반환 전 `content` 테이블에 영속화(`content.source=AI_GENERATED`는 이미 유효한 기존 값).
2. `submit_attempt` 입력에 `content_id` 추가 — 클라이언트는 직전에 받은 값을 그대로 되돌려줄 뿐, 스스로 만들어내지 않는다.
3. `attempt_records`에 `content_id`(FK → `content`) 컬럼 추가.
4. `get_content`에 `content_id` 단독 정확 조회 모드 추가(기존 조건 기반 조회와 별개 모드).

Learning Flow Engine은 이미 보유한 Content Engine 예외 호출 경로(AC-008로 사유 하나 추가, 기존엔 EXPLANATION 조회만)를 통해 `content_id`로 `type_specific_metadata`를 조회해 분류를 수행한다. 진단 정보가 없으면 `DOMAIN_LOGIC_BRIEF.md` §5.1의 기존 원칙대로 `SELF`가 기본값이다 — 이 패치는 진단을 **가능**하게 할 뿐 TRANSFER를 강제하지 않는다.

**기각된 대안**: (2) `error_category`를 attempt 입력에 직접 추가 — 서버가 판정해야 할 분류를 클라이언트가 대신 넘기게 되어 클라이언트 비신뢰 원칙 위반. (3) SELF만 유지, TRANSFER는 future scope — Review Engine(AC-001로 Phase 2에 이미 구현)이 무용해지고 LEARNING_THEORY의 핵심 설계 패턴(Review Cascade)을 축소하는 제품 범위 결정이라 계약 패치 수준을 넘어선다고 판단해 기각.

**Freeze 영향**: 없음 — `ENGINE_INTERFACE.md` §8.1이 이미 "Content ID 조회"를 Content Engine의 책임으로 서술하고 있었다는 점에서, AC-001·AC-005와 같은 성격의 계약 완성이다.

**패치 문서**:
- `API_CONTRACT.md` v1.5 → **v1.6**(§5.1, §7.1, §10.2)
- `DATA_PERSISTENCE_BRIEF.md` v1.5 → **v1.6**(§3.6)
- `ENGINE_INTERFACE.md` v1.8 → **v1.9**(§3.5, §8.1, §8.3)

---

## AC-009 — `request_practice`의 `target_node_id` 선택 규칙 미정

**상태**: 🟡 **Provisional**(2026-07-08) — AC-001·005·008과 등급이 다르다. 그것들은 "이미 선언된 원칙인데 필드가 빠진" 계약 누락 보완이었지만, 이번엔 **문서 어디에도 아직 선언된 적 없는 신규 정책 판단**이다. `LEARNING_PROTOCOL.md`(Missing Input Document) 확보 시 재검토가 예정되어 있다.

**Source**:
- `API_CONTRACT.md` §10.3(`request_practice`)
- AC-005 결정문(본 문서)
- `LEARNING_PROTOCOL.md`(§0 — 이 세션에 원문 없음, Development도 "Missing Input Document"로 확인)

**Problem**: AC-005가 `target_node_id`는 Learning Flow Engine이 결정한다고 확정했지만, 후보가 여럿일 때(동일 언어에 `INTRODUCED`/`STUDYING` 상태 노드가 여러 개인 경우) 어떤 것을 고를지 규칙이 없었다. Development는 `updated_at DESC`를 자체 제안했으나, Architecture 문서에 없는 정책 판단이라 구현하지 않고 에스컬레이션했다 — 올바른 처리다.

**Decision**: `DOMAIN_LOGIC_BRIEF.md` §8.1(Provisional 신설)에 규칙을 정의했다.

1. `target_concept_id`가 주어지면 그 Concept 노드로 후보를 좁힌다.
2. 주 규칙: `progress.state ∈ {INTRODUCED, STUDYING}`인 노드 중 `explicit_study_event_at DESC`(가장 최근 명시적 학습 시작)로 선택.
3. 대체 규칙(2에 해당 노드 없음): §6.2의 `get_due_reviews` 우선순위 공식을 `PRACTICING` 이상 노드에 재사용.
4. 후보가 전혀 없으면 `target_node_id` 없이 `target_concept_id`만으로 사다리 1~2단계 시도.

**Development 제안(`updated_at DESC`) 대신 `explicit_study_event_at DESC`를 채택한 이유**: `updated_at`은 다른 노드의 시도 처리 등 무관한 갱신에도 변하는 범용 컬럼이지만, `explicit_study_event_at`은 "이 노드를 명시적으로 배우기 시작한 시점"만 순수하게 반영하는 전용 컬럼이다(`DATA_PERSISTENCE_BRIEF.md` §3.6, 게이팅 근거로 이미 존재).

**Freeze 영향**: 이 결정 자체는 Freeze된 Tier A 문서를 수정하지 않는다. 다만 신규 정책이므로 `LEARNING_PROTOCOL.md` 확보 후 이 규칙이 그 문서의 실제 내용과 다르면 개정 대상이다 — 그때는 `start_session`의 목표 결정 로직과 단일 함수로 통합하는 것을 원칙으로 남겨둔다.

**패치 문서**:
- `DOMAIN_LOGIC_BRIEF.md` v1.0 → **v1.1**(§8.1 신설, 기존 §8은 §8.2로 이동)
- `API_CONTRACT.md` v1.6 → **v1.7**(§10.3 참조 추가)

---

## AC-011 — SELF/TRANSFER 진단 키 이름 미정

**상태**: ✅ Resolved (2026-07-08)

**Source**:
- `DOMAIN_LOGIC_BRIEF.md` §5.1
- Learning Flow Engine `submit_attempt` 구현(코드 배선 완료, 키 이름만 대기)
- `content.type_specific_metadata`

**Problem**: §5.1은 "Content의 `type_specific_metadata`에 오류 세그먼트를 특정 `grammar_node_id`로 귀속하는 진단 정보"라는 개념을 이미 서술했지만, 그 정보를 담는 구체적 JSON 키 이름을 정의하지 않았다. AC-001·005·008과 같은 유형의 계약 누락 — Development의 코드 배선은 완료됐고 키 이름 확정만 남아 있었다.

**Decision**: `error_attributed_node_id`(TEXT, nullable, 단일 값)로 확정.

| 결정 항목 | 값 |
|---|---|
| 키 이름 | `error_attributed_node_id` |
| 위치 | `content.type_specific_metadata`(채점 가능한 content_type에 선택적, QUIZ 한정 아님) |
| 값 타입 | TEXT(단일 grammar_node_id), nullable |
| 부재 시 기본 동작 | 키 부재·`null`·`primary_node_id`와 동일 값 — 셋 다 `SELF`(§5.1 기존 원칙 유지) |
| content 자신의 `grammar_node_ids` 밖 노드 허용 | 허용(§5.1이 제약을 두지 않음). 실존 노드인지는 저작·적재 시점에 검증 |
| 복수 오류 세그먼트 | 이번 결정 범위 밖 — §5.1·5.2 알고리즘이 단수 대상을 전제해, 필요해지면 별도 AC로 알고리즘 자체를 확장해야 함 |

**기각된 후보**: `transfer_source_node_id` — 필드가 존재해도 귀속 노드가 `primary_node_id`와 같으면 여전히 SELF이므로, 필드명에 판정 결과(TRANSFER)를 미리 새겨 넣는 것은 스키마와 판정 로직의 책임을 섞는다.

**Tier D 영향**: 없음. 기존 255개 Content 중 이 키가 설정된 항목이 없어 전부 SELF 기본값으로 안전하게 작동 — 점진적으로 태깅 가능.

**Freeze 영향**: 없음 — §5.1이 이미 서술한 개념의 키 이름 확정.

**패치 문서**:
- `DOMAIN_LOGIC_BRIEF.md` v1.1 → **v1.2**(§5.1)
- `DATA_PERSISTENCE_BRIEF.md` v1.6 → **v1.7**(§3.5)

---

## AUD-002 — MASTERED/AUTOMATIC Temporal Stability Contract

**상태**: ✅ **CLOSED**(2026-07-13) — **Frozen Core Standard Amendment**(Independent Architecture Audit 발견, AC-series와 governance 등급이 다름)

**Source**: `DOMAIN_LOGIC_BRIEF.md` §3.2, `PROGRESS_SCHEMA.md`(Tier A, 이 세션 원본 없음), Independent Architecture Audit

**Problem**: §3.2의 승격 조건이 순수 윈도우 정확도(횟수 기반, 시간 개념 없음)만 사용해, 한 번의 짧은 연속 시도(burst) 안에서 `PRACTICING → MASTERED → AUTOMATIC`이 전부 가능했다. LEARNING_THEORY의 Spaced Repetition 원칙을 State 전이 알고리즘이 표현하지 못한 Tier A 공백으로 판정.

**최종 확정 Architecture 결정**(전체 8개):

1. `PRACTICING → MASTERED` 승격에 Spaced Review Evidence 필수.
2. Qualifying spaced review = **pre-update** `next_review_at` 스냅샷 기준(`attempted_at ≥` 시도 직전 값). 같은 attempt 안에서 재계산된 값과 비교 금지.
3. `next_review_at IS NULL`이면 `is_spaced_review = false`.
4. `PRACTICING → MASTERED`: 최근 10회 중 qualifying spaced review 최소 3회, 전부 정답(**Provisional/tunable**).
5. `MASTERED → AUTOMATIC`: `mastered_at` 이후 spaced review 최소 2회(정답+응답시간 조건).
6. 저장 모델: `attempt_records.is_spaced_review`(BOOLEAN) + `progress.mastered_at`(TIMESTAMPTZ, nullable) 채택.
7. `next_review_at` 갱신은 **조건부**(Candidate A) — State 전이 발생 시, 또는 State 유지 + due 이후 attempt에서만 재계산. Due 이전 자발적 조기 연습은 `next_review_at` 유지(자주 연습하는 학습자가 불리해지는 역설 방지).
8. `mastered_at`은 `MASTERED` 진입 전이마다(방향 무관) 갱신, 퇴행해도 값 보존, 다음 진입 시 덮어씀 — 퇴행 후 재진입 시 이전 evidence 자동 격리.

**Governance 처리 이력**: 1차 결정(항목 1~6)은 `CORE_STANDARD_V1_FREEZE.md` §5의 Tier A amendment 절차(근거 문서화 → 대안 비교 → 명시적 승인 → 개정 이력 기록) 전 단계를 밟았다. 이후 발견된 scheduling 역설(항목 7~8)은 기존 필드(`next_review_at`)의 갱신 **알고리즘**만 수정하는 것이라 Tier A 재개방 없이 일반 Tier C Architecture Clarification으로 처리했다. 이후 stale wording 4건(구 "매 시도마다 무조건 갱신" 표현이 조건부 갱신 규칙 확정 후에도 잔존)을 발견해 정정.

**패치 문서**(전체):
- `DOMAIN_LOGIC_BRIEF.md` v1.2 → **v1.5**(§3.2, §3.2.1 신설, §3.2.2 신설, §6.1 조건부 갱신 규칙)
- `DATA_PERSISTENCE_BRIEF.md` v1.7 → **v1.10**(§3.6 `mastered_at`·`is_spaced_review` 컬럼)
- `VALIDATION_LEVEL3.md` v1.1 → **v1.4**(§8.1 신설, 검증 항목 9개)
- `CORE_STANDARD_V1_FREEZE.md` v1.1 → **v1.2**(§8 Amendment 기록 1줄)
- `PROGRESS_SCHEMA_AMENDMENT_ENTRY.md`(병합 대기 초안 — **canonical merge 완료, `PROGRESS_SCHEMA.md` v1.1로 대체됨**)
- `MIGRATION_GUIDE_ENTRY_006.md`(병합 대기 초안 — **canonical merge 완료, `MIGRATION_GUIDE.md` Entry 003으로 재번호되어 병합됨**)

**미착수 항목(범위 밖으로 명시적 제외)**: AUD-001, AUD-003, AUD-004, 구현 수정 전부 — 별도 지시 대기.

---

## AUD-001 — GitHub main 문서 간 current/historical 상태 혼동

**상태**: ✅ Architecture/Documentation Decision **CLOSED** / 🟡 Repository Reconciliation **PENDING MERGE**(2026-07-13)

**Source**: `BOOTSTRAP.md`, `PROJECT_MASTER_INDEX.md`, `VALIDATION_STATUS.md`(GitHub main), Independent Architecture Audit

**Problem**: 세 문서가 "260/260 PASS", "§5~8 PASS"라는 동일 수치를 한정어 없이 3회 중복 기재해, 과거 세션의 성과가 현재 GitHub main의 검증된 상태처럼 해석될 수 있었다. 세 문서 사이에 책임 분리도 없어 SSOT 구조 자체가 불안정했다.

**최종 확정 SSOT 계층**:
```
GitHub main (repository-wide SSOT)
├─ BOOTSTRAP.md            = Session Startup Authority
├─ PROJECT_MASTER_INDEX.md = Project Position / Roadmap Authority
└─ VALIDATION_STATUS.md    = Validation State Authority(유일 소유자)
```

**Current Verified State**(commit `aff97d7`/`e8a97a7` 근거): Phase 0 scaffolding, Node.js/CommonJS 설정, PostgreSQL pool/migration 인프라, migrations 001–010, Graph Engine, Progress Engine, engineConfig, 관련 Phase 0/1 테스트 — 전부 present. 단 §5~13 전 구간과 전체 regression 단일 수치는 **현재 GitHub main 기준 재검증되지 않음**(코드 존재와 Validation PASS를 분리).

**Historical Validation Record**: §5~8 PASS·260/260은 prior-session 결과로 보존(삭제하지 않음), "current GitHub main의 PASS 근거로 사용 금지" 명시.

**검증 경로 불일치 처리 경위**: 초기 판정("문서 9개만 존재, 코드 전무")은 Claude 세션의 브라우저 기반 fetch 도구가 저장소 루트 렌더링만 접근 가능했던 데서 비롯됐다(커밋 이력 페이지는 robots.txt로 차단, 링크되지 않은 개별 파일 경로는 접근 불가). 이후 GitHub API/connector 기반 직접 조회로 재확인된 evidence(정확한 커밋 해시, Progress Engine 함수 시그니처가 `ENGINE_INTERFACE.md`/`DOMAIN_LOGIC_BRIEF.md` 설계와 정확히 일치)를 근거로 Current Verified State를 교체했다.

**Governance**: Architecture 변경 아님 — status/documentation reconciliation. `CORE_STANDARD_V1_FREEZE.md` §5 절차 대상 아님.

**패치 문서(로컬 준비 완료, GitHub main 병합 대기)**:
- `BOOTSTRAP.md`(전면 교체 — 상태 수치 제거, Session Startup Authority만 보유)
- `PROJECT_MASTER_INDEX.md`(전면 교체 — Validation 상세 제거, Roadmap Authority만 보유)
- `VALIDATION_STATUS.md`(전면 교체 — Current Verified State/Historical Validation Record 분리)

**Repository Reconciliation PENDING MERGE**: 위 3개 파일은 로컬에서 완성됐으나 GitHub main에는 아직 반영되지 않았다 — 실제 push/merge는 이 세션의 권한 밖이며 별도로 진행되어야 한다.

---

## 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-08 | 최초 작성. AC-001(get_cascade 입력 계약 불일치) Resolved로 기록 |
| 1.1 | 2026-07-08 | AC-005(Generation Engine 3단계 node_id 특정 불가) Resolved로 기록. `API_CONTRACT.md` v1.5, `ENGINE_INTERFACE.md` v1.8 반영 |
| 1.2 | 2026-07-08 | AC-008(submit_attempt content_id 부재) Resolved로 기록 — 단일 필드가 아닌 4개 지점(generate_problem 출력·submit_attempt 입력·attempt_records 컬럼·get_content 조회 모드) 연쇄 패치. `API_CONTRACT.md` v1.6, `DATA_PERSISTENCE_BRIEF.md` v1.6, `ENGINE_INTERFACE.md` v1.9 반영 |
| 1.3 | 2026-07-08 | AC-009(request_practice target_node_id 선택 규칙 미정) **Provisional**로 기록 — 이전 3건과 달리 신규 정책 판단이라 등급을 구분. `DOMAIN_LOGIC_BRIEF.md` v1.1(§8.1 신설), `API_CONTRACT.md` v1.7 반영. LEARNING_PROTOCOL.md 확보 후 재검토 예정 |
| 1.4 | 2026-07-08 | AC-011(SELF/TRANSFER 진단 키 이름 미정) Resolved로 기록 — `error_attributed_node_id` 확정. `DOMAIN_LOGIC_BRIEF.md` v1.2, `DATA_PERSISTENCE_BRIEF.md` v1.7 반영. 별도로, LEARNING_PROTOCOL.md는 이 세션에 파일이 없을 뿐 v1.0 Frozen 상태로 이미 작성 완료된 문서임을 확인(사용자 질문에 답변, 문서 변경 없음) |
| 1.5 | 2026-07-08 | AC-004(explanation_level 저장 위치 부재) 재상정 — 최초 non-blocking 분류를 blocking으로 재분류하는 데 동의하고 Resolved로 기록. `content.explanation_level` 전용 컬럼 추가(`DATA_PERSISTENCE_BRIEF.md` §2 기존 원칙 적용). `DATA_PERSISTENCE_BRIEF.md` v1.8 반영. ID 순서 유지를 위해 AC-001과 AC-005 사이에 삽입 |
| 1.6 | 2026-07-13 | AUD-002(MASTERED/AUTOMATIC Temporal Stability Contract) **CLOSED**로 기록 — Independent Architecture Audit 발견, Frozen Core Standard Amendment로 처리. 8개 Architecture 결정 최종 확정(Spaced Review Evidence 필수, pre-update snapshot 기준, `next_review_at` 조건부 갱신 Candidate A, `mastered_at`/`is_spaced_review` 필드 채택 등). `DOMAIN_LOGIC_BRIEF.md` v1.5, `DATA_PERSISTENCE_BRIEF.md` v1.10, `VALIDATION_LEVEL3.md` v1.4, `CORE_STANDARD_V1_FREEZE.md` v1.2, `PROGRESS_SCHEMA_AMENDMENT_ENTRY.md`·`MIGRATION_GUIDE_ENTRY_006.md`(신규) 반영. AC-series와 달리 최초 결정 부분은 Tier A amendment 절차(§5) 완료, scheduling 역설 후속 수정 부분은 일반 Tier C Clarification으로 등급 구분해 처리 |
| 1.7 | 2026-07-13 | AUD-001(GitHub main 문서 간 current/historical 상태 혼동) Architecture/Documentation Decision **CLOSED**, Repository Reconciliation **PENDING MERGE**로 기록 — `BOOTSTRAP.md`/`PROJECT_MASTER_INDEX.md`/`VALIDATION_STATUS.md` 3개 문서 전면 교체(SSOT 계층 분리, Current Verified State/Historical Validation Record 분리). 검증 경로 불일치(브라우저 기반 fetch vs GitHub API/connector) 발생 및 해소 경위 기록. 코드 존재(Phase 0/1, Graph·Progress Engine)와 Validation PASS 여부(§5~13 전 구간 미재검증)를 명확히 분리 |
| 1.8 | 2026-07-13 | AUD-002 canonical merge 완료 기록 — GitHub main 원문(`PROGRESS_SCHEMA.md` §0~12, `MIGRATION_GUIDE.md` §0~3) 대조 결과 병합 대기 파일의 잠정 번호(Entry 006)가 canonical 번호가 아니었음을 확인, `MIGRATION_GUIDE.md` Entry 003으로 재번호. `PROGRESS_SCHEMA.md` v1.0→v1.1(§3/§4/§6/§10/§11/§12), `MIGRATION_GUIDE.md` v1.0→v1.1(§2 Entry 003, §3) canonical 교체본 작성 — 미확인 섹션(§0~2, §5, §7~9, Entry 001·002)은 원문 미보유로 명시적 placeholder 처리, 임의 텍스트로 채우지 않음 |
