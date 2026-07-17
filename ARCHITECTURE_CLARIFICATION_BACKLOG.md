# ARCHITECTURE_CLARIFICATION_BACKLOG.md
## LLE Phase 1→2 개발 전환 중 발견된 Architecture Clarification 항목

> 이 문서는 Development 세션(Phase 1 이후 실제 구현)에서 발견되어 Architect(Claude, Tier A~D 문서 관리자)에게 결정을 요청한 항목을 추적한다. 모든 결정은 기존 Tier A~D 설계를 소비하는 형태로만 내려지며, `CORE_STANDARD_V1_FREEZE.md` §5의 거버넌스 절차를 넘는 수준의 재설계는 이 문서가 아니라 해당 상위 문서의 정식 개정 절차를 따른다.

---

## 상태 요약

| ID | 제목 | 상태 |
|---|---|---|
| AC-001 | `get_cascade` 입력 계약 불일치 | ✅ Resolved |
| AC-002 | `cascade_jobs` 트랜잭션 아웃박스 패턴 | 🟠 복구 메모(정식 재제출 필요) — §AC-002 참고 |
| AC-003 | Concept-Node prerequisite 정합성 | 🟠 복구 메모(정식 재제출 필요) — §AC-003 참고 |
| AC-006~007, 010 | (Development 세션에서 아직 이 문서로 제출되지 않음) | ⏳ 미제출 |
| AC-004 | `content.explanation_level` 저장 위치 부재 | ✅ Resolved(재상정 — non-blocking→blocking) |
| AC-005 | Generation Engine 3단계 PRE_MADE fallback 대상 node_id 특정 불가 | ✅ Resolved |
| AC-008 | `submit_attempt`에 SELF/TRANSFER 진단용 content_id 부재 | ✅ Resolved |
| AC-009 | `request_practice`의 `target_node_id` 선택 규칙 미정 | 🟡 Provisional(LEARNING_PROTOCOL.md 확보 후 재검토 필요) |
| AC-011 | SELF/TRANSFER 진단 키 이름 미정 | ✅ Resolved |
| AUD-002 | MASTERED/AUTOMATIC Temporal Stability Contract(Independent Architecture Audit) | ✅ **CLOSED** — Frozen Core Standard Amendment, 상세는 §AUD-002 참고 |
| AUD-001 | GitHub main 문서 간 current/historical 상태 혼동(Independent Architecture Audit) | ✅ Architecture/Documentation Decision **CLOSED** — ✅ Repository Reconciliation **CLOSED**(4-file patch merged to GitHub main at commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584`). 상세는 §AUD-001 참고 |
| AUD-003 | Graph가 cross-language relation을 허용·순회함(Independent Architecture Audit) | ✅ **CLOSED** — Frozen Core Standard Amendment, 상세는 §AUD-003 참고 |
| AUD-004 | Review Cascade producer와 `record_attempt` 원자성 연결 공백(Independent Architecture Audit) | 🟡 Architecture Clarification **APPROVED** / Implementation Remediation **IN PROGRESS** — 상세는 §AUD-004 참고 |

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

## AC-002 — `cascade_jobs` 트랜잭션 아웃박스 패턴

**상태**: 🟠 **복구 메모**(2026-07-11) — 이 문서에 정식 제출된 적이 없다("⏳ 미제출" 상태였음). `PHASE_2_COMPLETION_REPORT.md`는 이를 Resolved로 서술하지만 본문 근거가 이 문서 어디에도 없었다. 아래 내용은 코드베이스 유실 후 과거 세션 기록(`REBUILD_CONTRACT_RECONCILIATION.md` 작성 과정에서 대조)을 근거로 복구한 메모이며, **새로운 Architecture 결정이 아니다.** 정식 AC로 인정받으려면 이 메모를 근거로 정식 재제출·재승인 절차를 밟기를 권장한다(GAP_REPORT §5.2 동일 지적).

**Source(복구 근거)**: `DATA_PERSISTENCE_BRIEF.md` §3.8(`cascade_jobs` 테이블), `API_LAYER_BRIEF.md` §5.2(아웃박스 패턴 언급), 과거 세션 기록(코드 자체는 유실).

**유효 사양(복구된 내용)**:
- `cascade_jobs`는 8개 Engine에 속하지 않는 별도 인프라 컴포넌트다.
- `submit_attempt`의 TRANSFER 경로에서 `cascade_jobs` 레코드가 생성된다.
- `cascade_jobs` 삽입은 `progressEngine.recordAttempt` 트랜잭션 안에서 핵심 트랜잭션(attempt 삽입+state 전이+`next_review_at` 갱신)과 함께 원자적으로 처리한다 — 아웃박스 패턴의 핵심(`DATA_PERSISTENCE_BRIEF.md` §3.8 원칙과 일치).
- 워커(`src/worker/cascadeJobsWorker.js`)는 `status='PENDING'`인 job을 오래된 순으로 폴링해 처리하고, 대상 노드의 `progress.next_review_at`을 앞당긴 뒤 `DONE`/`FAILED`로 상태를 전이한다.
- Progress에 대한 쓰기는 이번에도 Progress Engine을 통해서만 이루어진다(ENGINE_INTERFACE §5 단일 쓰기 경로 원칙 재확인 — 워커가 `progress` 테이블에 직접 쓰지 않고 Progress Engine의 쓰기 API를 호출).

**Freeze 영향**: 없음으로 추정 — `DATA_PERSISTENCE_BRIEF.md` §3.8이 이미 선언한 아웃박스 원칙의 구체적 적용이다. 다만 정식 제출 근거 문서가 없었으므로 이 판단 자체도 재확인 대상이다.

---

## AC-003 — Concept-Node prerequisite 정합성

**상태**: 🟠 **복구 메모**(2026-07-11) — AC-002와 동일한 사유로 정식 제출 근거 없음. 아래는 복구 메모이며 새로운 Architecture 결정이 아니다.

**Source(복구 근거)**: `DATA_PERSISTENCE_BRIEF.md` §3.2(`concepts.prerequisite_concept_ids`), `ENGINE_INTERFACE.md` §4(Graph Engine — "Concept-Node 정합성 검증"이 책임으로 이미 명시됨), 과거 세션 기록.

**유효 사양(복구된 내용)**:
- Concept 레벨 `prerequisite_concept_ids`(`concepts` 테이블)와 Grammar Node 레벨 `PREREQUISITE` 관계(`grammar_relations` 테이블)는 서로 다른 층위이지만, 상위(Concept)가 요구하는 선행 순서를 하위(Node)가 어겨서는 안 된다.
- `graphEngine.validateLanguagePack`(이미 순환 검증을 담당하는 함수, `API_CONTRACT.md` §3.3)이 Concept-Node 정합성 검증도 함께 수행해야 한다 — 별도 API를 신설하지 않고 기존 검증 파이프라인에 포함.
- 판정 규칙: Concept A가 Concept B를 prerequisite로 요구하는데, A에 대응하는 Grammar Node들과 B에 대응하는 Grammar Node들 사이에 `PREREQUISITE` 관계가 전혀 없으면 validation error로 취급한다.
- 순환 검증(`DOMAIN_LOGIC_BRIEF.md` §2.3)·Relation Integrity 검증(Validation Level 3 §7)의 일부로 포함해 실행한다 — 별도 실행 경로를 새로 만들지 않는다.

**Freeze 영향**: 없음으로 추정 — `ENGINE_INTERFACE.md` §4가 이미 "Concept-Node 정합성 검증"을 Graph Engine 책임으로 명시하고 있었다는 점에서 AC-001과 같은 성격의 계약 완성으로 보인다. 다만 AC-002와 마찬가지로 정식 재확인이 필요하다.

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

**상태**: ✅ Architecture/Documentation Decision **CLOSED** / ✅ Repository Reconciliation **CLOSED**(4-file patch merged to GitHub main at commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584`)

**Source**: `BOOTSTRAP.md`, `PROJECT_MASTER_INDEX.md`, `VALIDATION_STATUS.md`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md`(GitHub main), Independent Architecture Audit

**Problem**: 세 문서가 "260/260 PASS", "§5~8 PASS"라는 동일 수치를 한정어 없이 3회 중복 기재해, 과거 세션의 성과가 현재 GitHub main의 검증된 상태처럼 해석될 수 있었다. 세 문서 사이에 책임 분리도 없어 SSOT 구조 자체가 불안정했다.

**최종 확정 SSOT 계층**:
```
GitHub main (repository-wide SSOT)
├─ BOOTSTRAP.md            = Session Startup Authority
├─ PROJECT_MASTER_INDEX.md = Project Position / Roadmap Authority
└─ VALIDATION_STATUS.md    = Validation State Authority(유일 소유자)
```

**Current Verified State**(commit `3b51ec30369e266ffeb52c9ede8707a849ab519a` 근거, 2026-07-16 갱신 — 이전 기재였던 `aff97d7`/`e8a97a7` 근거를 대체): Phase 0 scaffolding, Node.js/CommonJS 설정, PostgreSQL pool/migration 인프라, migrations 001–011, Graph Engine, Progress Engine, AUD-002 implementation, AUD-003 implementation, 관련 Graph/Progress/AUD-002/AUD-003 테스트 아티팩트 — 전부 present. 단 §5~13 전 구간과 전체 regression 단일 수치는 **현재 GitHub main 기준 재검증되지 않음**(코드 존재와 Validation PASS를 분리).

**Clean-room Development Verification Provenance(AUD-002/AUD-003 remediation-specific)**: 아래는 Claude Development clean-room verified result이며, GitHub-hosted CI가 동일 scope를 독립 검증했다는 근거는 없다.
- AUD-002: baseline 48/48 PASS, full 58/58 PASS, fresh DB 58/58 PASS
- AUD-003: main baseline 58/58 PASS, AUD-003 10/10 PASS, full 68/68 PASS, fresh DB 68/68 PASS

**Historical Validation Record**: §5~8 PASS·260/260은 prior-session 결과로 보존(삭제하지 않음), "current GitHub main의 PASS 근거로 사용 금지" 명시.

**검증 경로 불일치 처리 경위**: 초기 판정("문서 9개만 존재, 코드 전무")은 Claude 세션의 브라우저 기반 fetch 도구가 저장소 루트 렌더링만 접근 가능했던 데서 비롯됐다(커밋 이력 페이지는 robots.txt로 차단, 링크되지 않은 개별 파일 경로는 접근 불가). 이후 GitHub API/connector 기반 직접 조회로 재확인된 evidence(정확한 커밋 해시, Progress Engine 함수 시그니처가 `ENGINE_INTERFACE.md`/`DOMAIN_LOGIC_BRIEF.md` 설계와 정확히 일치)를 근거로 Current Verified State를 교체했다. 2026-07-16 세션에서 HEAD `3b51ec3`의 commit-pinned raw file을 직접 재확보해 evidence를 재차 갱신했다.

**Governance**: Architecture 변경 아님 — status/documentation reconciliation. `CORE_STANDARD_V1_FREEZE.md` §5 절차 대상 아님.

**병합된 패치 문서(GitHub main commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584` — 정확히 4개 파일)**:
- `BOOTSTRAP.md`(전면 교체 — 상태 수치 제거, Session Startup Authority만 보유, Project Position/Validation State는 authority pointer로 대체)
- `PROJECT_MASTER_INDEX.md`(전면 교체 — Validation 상세 수치 제거하고 `VALIDATION_STATUS.md` 참조로 대체, Roadmap Authority만 보유, Current Activity/Next Task에 AUD-002·AUD-003·AUD-001 CLOSED 및 AUD-004 반영)
- `VALIDATION_STATUS.md`(전면 교체 — A. Current GitHub Main/B. Historical Validation Record 분리, §5~13 재검증 안 됨 원칙과 AUD-002/AUD-003 clean-room evidence 별도 기재)
- `ARCHITECTURE_CLARIFICATION_BACKLOG.md`(본 문서, targeted patch — 상태표 AUD-001 행, §AUD-001 본 섹션, 개정 이력만 변경. AUD-002·AUD-003·§AUD-003·AC-002/AC-003 복구 메모·1차 판정 철회 provenance는 전부 그대로 보존)

**Repository Reconciliation CLOSED**: 위 4-file reconciliation patch는 GitHub main에 commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584`로 merge되었다. 이 merge로 AUD-001 Repository Reconciliation을 **CLOSED** 처리한다.

---

## AUD-003 — Graph가 cross-language relation을 허용·순회함

**상태**: ✅ **CLOSED**(2026-07-13) — **Frozen Core Standard Amendment**(Independent Architecture Audit 발견)

**Source**: `src/engines/graphEngine.js`(`prerequisiteSearchInternal`, `findRelatedNodes`, `validateLanguagePack` — GitHub main 코드 직접 조회), `GRAMMAR_SCHEMA.md` §6, `GRAMMAR_GRAPH.md` §2~3, Independent Architecture Audit

**Problem**: `prerequisiteSearchInternal`은 `grammar_relations`의 `PREREQUISITE` 관계를 따라갈 때 양 끝 Grammar Node의 `language` 일치를 확인하지 않아, `GRAMMAR_VI_* → GRAMMAR_EN_*` 같은 cross-language `PREREQUISITE`도 그대로 순회 대상이 됐다. `findRelatedNodes`도 `RELATED`/`CONTRAST`/`ALTERNATIVE` 조회에서 동일한 필터 부재. `validateLanguagePack`은 `from_node_id` 쪽 언어만 확인하고 `to_node_id`는 확인하지 않으며, cross-language relation 자체를 위반으로 보고하는 필드도 없었다. `GRAMMAR_SCHEMA.md` §6은 `from_node_id`/`to_node_id`의 존재성·self-reference 금지·PREREQUISITE 방향 제약은 이미 갖고 있었지만 same-language 요구는 명시한 적이 없었다.

### 1차 adjudication(철회됨) — provenance 보존

최초 판정은 이 결정을 **"Architecture Clarification"**(Tier A Amendment 아님)로 분류했다 — 근거: "새 필드를 추가하지 않고 기존 필드 쌍(`from_node_id`/`to_node_id`)에 제약 하나를 더하는 것뿐"이라는 논리, 그리고 확인된 기존 Language Pack 관계에서 cross-language 사례가 필요했던 적이 없다는 관찰.

Technical Director / PM review에서 GitHub main의 `CORE_STANDARD_V1_FREEZE.md` §2·§4 및 `API_CONTRACT.md` canonical 원문을 대조한 결과, 1차 Architecture 판정의 Freeze governance 해석에 이의가 제기되어 재심사를 요청했다 — §2·§4 문언("엔터티 정의·필드 구조 변경은 Freeze 대상")을 근거로, "필드 추가가 아니므로 Clarification"이라는 1차 판정의 논리는 §4가 보호하는 "엔터티 정의"를 "새 컬럼 여부"로 축소해석한 오류였다는 지적이었다. 또한 최초 판정이 `GRAMMAR_GRAPH.md` §2("언어별 서브그래프는 조회 조건으로 구성되는 view")를 근거로 "이미 규범적으로 강제됐다"고 주장했으나, 재검토 결과 이 문언은 반대 방향(저장 계층에 cross-language edge가 존재하고 view가 그걸 필터링한다는 뜻)으로도 읽힐 수 있어 문헌적 근거로 부족함이 확인됐다.

**재심사 결과 철회 — Tier A Amendment로 재분류.**

### 최종 확정 Architecture 결정

1. **Same-language invariant**: `grammar_relations.from_node_id`가 참조하는 Grammar Node의 `language`와 `grammar_relations.to_node_id`가 참조하는 Grammar Node의 `language`는 반드시 동일해야 한다.
2. **적용 범위**: `PREREQUISITE`·`RELATED`·`CONTRAST`·`ALTERNATIVE` **4종 전부**.
3. **Cross-language pedagogical mapping**: Grammar Relation에 저장하지 않는다 — 기존 Universal Concept layer(`concept_ids`)로 처리. 새 엔터티를 만들지 않는다(과설계 방지, 예: `CONCEPT_MODALITY_ABILITY`가 이미 VI/EN/JA/ZH 4개 언어 능력 표현 노드를 공유).
4. **DB Enforcement**: DB trigger 없음, `grammar_relations.language` 중복 컬럼 없음, 일반 CHECK constraint 없음(현재 스키마상 `grammar_relations`에 `language` 컬럼이 없어 다른 테이블을 참조해야 판정 가능 — 일반 CHECK로 표현 불가능함이 재검토 과정에서 확인됨). 대신 3중 논리 방어: ① `GRAMMAR_SCHEMA.md` §6 Tier A invariant ② `validate_language_pack` 배포 전 정적 검증(hard gate) ③ runtime traversal defense-in-depth.
5. **`validate_language_pack` output**: `{is_valid, cycle_violations[], concept_consistency_violations[], language_boundary_violations[]}` — `language_boundary_violations[]` 신규. `is_valid`는 세 목록이 전부 비어 있을 때만 `true`.
6. **Runtime traversal defense-in-depth**: `prerequisite_search`(선행 탐색)·`dependent_search`(후행 탐색)·`find_related_nodes`가 시작 노드의 `language`를 벗어난 노드를 따라가거나 반환하지 않는다 — 배포 전 검증 통과 여부와 무관하게 항상 적용.

**기각된 DB Enforcement 대안**: (B) DB trigger — 이 프로젝트가 지금까지 도메인 로직을 Engine 계층(Node.js)에 두고 DB는 저장·기본 참조무결성만 담당해온 스타일에서 벗어나는 첫 사례가 되어 기각. (C) `grammar_relations.language` 중복 컬럼 — `grammar_nodes`에서 이미 유도 가능한 값의 불필요한 중복이라 기각. (D) runtime traversal filter만(정적 검증 없이) — 저장 계층에 무의미한 edge가 영구히 남고 `validate_language_pack`의 "배포 전 정적 검증" 존재 이유 자체가 무력화되어 기각.

**Governance 처리**: `CORE_STANDARD_V1_FREEZE.md` §5 절차 4단계 전부 완료 — ① 근거 문서화(counterexample: GitHub main 코드 직접 조회로 확인된 cross-language traversal 가능성) ② 대안 비교(traversal filter only / DB trigger / 중복 language 컬럼 / Tier A invariant+validation+runtime defense 3중 방어 — 4안 채택) ③ 명시적 사용자 승인 완료 ④ 개정 이력 기록(본 항목, `CORE_STANDARD_V1_FREEZE.md` §8, 각 canonical 문서 개정 이력).

**패치 문서**(canonical, GitHub main 원문 기준 targeted patch):
- `GRAMMAR_SCHEMA.md` v1.6 → **v1.7**(§6 same-language invariant, §10 금지 사항)
- `GRAMMAR_GRAPH.md` v1.4 → **v1.5**(§2 언어별 서브그래프 명확화, §3 Language boundary 검증 및 runtime defense-in-depth, §10 금지 사항)
- `API_CONTRACT.md` v1.9 → **v1.10**(§3.1·3.2 금지 사항, §3.3 `language_boundary_violations[]`)
- `ENGINE_INTERFACE.md` v1.9 → **v1.10**(§4 Graph Engine 책임·출력·주의사항)
- `VALIDATION_LEVEL3.md` v1.4 → **v1.5**(§7.1 신설, §12·§13 반영)
- `MIGRATION_GUIDE.md` v1.1 → **v1.2**(Entry 004)
- `CORE_STANDARD_V1_FREEZE.md` v1.2 → **v1.3**(§8 Amendment 기록)
- `ARCHITECTURE_CLARIFICATION_BACKLOG.md`(본 문서, 이 항목)

**DB schema/SQL migration**: 없음 — 기존 필드(`from_node_id`, `to_node_id`, `language`)의 조합에 논리적 invariant만 추가되며, `grammar_relations`·`grammar_nodes` 컬럼 변경이 전혀 없다.

**미착수 항목(범위 밖으로 명시적 제외)**: AUD-001 Repository Reconciliation(별도 트랙, PENDING MERGE 유지), AUD-004, 구현 수정 전부 — 별도 지시 대기.

---

## AUD-004 — Review Cascade producer와 `record_attempt` 원자성 연결 공백

**상태**: 🟡 Architecture Clarification **APPROVED** / Implementation Remediation **IN PROGRESS**(2026-07-17) — 아직 **CLOSED 아님**

**사용자 승인 provenance(2026-07-17)**: 사용자가 AUD-004 Architecture Adjudication 결과를 명시적으로 승인했다. 판정은 **Tier A Amendment가 아니라 Tier C Architecture Clarification 후 Implementation Remediation**이다. 기존 Tier A 엔터티·필드 구조, Cascade 알고리즘, 임계치 또는 DB schema를 바꾸지 않고, 이미 존재하는 `cascade_jobs` 아웃박스와 Engine 책임 경계를 실행 가능하게 연결하는 누락 계약을 보완한다.

**Problem**: Learning Flow Engine이 Content metadata로 SELF/TRANSFER를 판정하고 Review Engine에서 Cascade 대상 목록을 계산한다는 계약과, Progress Engine이 attempt/progress를 단일 트랜잭션으로 기록한다는 계약이 각각 존재했지만, Review 결과의 node ID 목록을 `record_attempt`에 전달해 같은 트랜잭션에서 `cascade_jobs`를 생성하는 명시적 내부 입력·producer 경로가 없었다. 그 결과 핵심 시도 기록과 아웃박스 producer 사이의 원자성이 구현 계약으로 닫히지 않았다.

**승인 결정**:

1. Progress Engine `record_attempt` 내부 입력에 canonical `cascade_target_node_ids?: string[]` / JavaScript `cascadeTargetNodeIds`를 추가한다. 외부 HTTP 입력이 아니며 Learning Flow Engine만 산출·전달한다.
2. omitted는 `[]`; explicit `null`, 배열이 아닌 값, 빈 문자열·문자열 아닌 원소, 중복 ID는 `ContractViolationError`. 정답과 SELF는 반드시 `[]`; TRANSFER는 `[]` 또는 고유한 Grammar Node ID 1개 이상을 허용한다. 하나라도 존재하지 않으면 `INVALID_ID`로 전체 실패한다.
3. Learning Flow Engine은 Content metadata로 SELF/TRANSFER를 판정하고, TRANSFER이면 Review Engine `get_cascade`를 호출한 뒤 결과의 `node_id` 목록만 Progress Engine에 전달한다. `max_cascade_depth`는 하드코딩하지 않고 Engine 설정값을 사용하며 현재 기본값 2는 유지한다.
4. Progress Engine은 다른 Engine을 호출하지 않는 리프 구조를 유지한다. 동일 DB client와 기존 `recordAttempt` 트랜잭션 안에서 대상 ID 존재성을 확인하고 attempt 삽입, progress 갱신, 대상별 `cascade_jobs(status='PENDING')` 정확히 1건 삽입을 모두 수행한 뒤 COMMIT한다. 하나라도 실패하면 전체 ROLLBACK한다.
5. Worker/polling/retry-backoff/DONE·FAILED 전이 및 실제 대상 노드 `next_review_at` 갱신은 이번 producer remediation 범위 밖이다. Learning Flow/Review Engine 구현, DB migration, Tier A 문서 변경도 범위 밖이다.

**Governance 판정**: Tier C Architecture Clarification. 새 저장 엔터티·컬럼·Tier A admissible state 변경이 없고, 기존 `cascade_jobs`와 Engine boundary를 연결하는 내부 호출 계약 및 producer 구현 누락을 보완하므로 `CORE_STANDARD_V1_FREEZE.md` §5 Amendment 절차 대상이 아니다.

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
| 1.9 | 2026-07-13 | AUD-003(Graph가 cross-language relation을 허용·순회함) **CLOSED**로 기록 — Independent Architecture Audit 발견(GitHub main `src/engines/graphEngine.js` 코드 직접 조회로 확인), Frozen Core Standard Amendment로 최종 처리. **1차 adjudication("Architecture Clarification", 새 필드 없음을 근거)을 재심사 후 철회하고 Tier A Amendment로 재분류한 provenance를 §AUD-003에 보존.** Same-language invariant(4 relation type 전부), 3중 논리 방어(DB enforcement 없음), `validate_language_pack` output 확장(`language_boundary_violations[]`), runtime traversal defense-in-depth 최종 확정. `GRAMMAR_SCHEMA.md` v1.7, `GRAMMAR_GRAPH.md` v1.5, `API_CONTRACT.md` v1.10, `ENGINE_INTERFACE.md` v1.10, `VALIDATION_LEVEL3.md` v1.5, `MIGRATION_GUIDE.md` v1.2(Entry 004), `CORE_STANDARD_V1_FREEZE.md` v1.3 반영. DB schema/SQL migration 없음. AUD-001·AUD-002 기록 및 AC-002/AC-003 복구 메모 전부 보존(삭제·축약 없음) |
| 1.10 | 2026-07-16 | AUD-001 Repository Reconciliation 상태를 **PATCH PREPARED**로 갱신(이전 PENDING MERGE) — 신규 세션에서 commit-pinned HEAD `3b51ec30369e266ffeb52c9ede8707a849ab519a` 원문(`BOOTSTRAP.md`/`PROJECT_MASTER_INDEX.md`/`VALIDATION_STATUS.md`/본 문서)을 직접 재확보해 stale local/memory 상태를 배제하고 재작업. 상태표 AUD-001 행 및 §AUD-001 Current Verified State를 `aff97d7`/`e8a97a7` 근거에서 HEAD `3b51ec3` 근거로 교체(migrations 001–011, AUD-002/AUD-003 implementation 및 관련 테스트 아티팩트 present로 갱신), AUD-002/AUD-003 remediation-specific clean-room test 결과(AUD-002: 48/48·58/58·58/58, AUD-003: 58/58·10/10·68/68·68/68 — Claude Development clean-room, GitHub-hosted CI 독립검증 아님)를 §AUD-001에 별도 evidence로 기재. `BOOTSTRAP.md`(Session Startup Authority만 보유, authority pointer로 축소)·`PROJECT_MASTER_INDEX.md`(Validation 상세를 `VALIDATION_STATUS.md` 참조로 대체, Current Activity/Next Task에 AUD-002·AUD-003 CLOSED·AUD-001 진행 중·AUD-004 반영, §9 Conversation Boundary를 즉시 next task로 선언하지 않음)·`VALIDATION_STATUS.md`(A. Current GitHub Main/B. Historical Validation Record 분리, §5~13 미재검증 원칙과 260/260 historical warning 유지) 3개 파일 canonical 교체본을 확정하고 정확히 4개 파일(본 문서 포함) targeted patch로 마감. 아직 GitHub main 미병합 — MERGED/CLOSED 선언 없음. AUD-002·AUD-003·§AUD-003 1차 판정 철회 provenance·AC-002/AC-003 복구 메모 전부 무변경 보존 |
| 1.11 | 2026-07-16 | AUD-001 Repository Reconciliation 4-file patch가 commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584`로 GitHub main에 merge되어 Repository Reconciliation **CLOSED** 처리됨 |
| 1.12 | 2026-07-17 | AUD-004 사용자 승인 반영 — Tier C Architecture Clarification 후 Implementation Remediation으로 판정. 상태표와 §AUD-004 신설, `cascade_target_node_ids` 내부 계약·Learning Flow→Review→Progress 책임·동일 트랜잭션 `cascade_jobs` producer·Worker 범위 제외를 기록. 초기 상태는 Architecture Clarification APPROVED / Implementation Remediation IN PROGRESS이며 아직 CLOSED 아님 |
