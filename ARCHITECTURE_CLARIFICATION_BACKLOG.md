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
| AC-012 | §9 Conversation Boundary acknowledgement and loop prevention | ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS** |
| AC-013 | Active-Node Admission Boundary | ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **CLOSED** |
| AC-014 | Learning Flow prerequisite clarification | ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS** |
| AC-015 | Interleaving Graph metadata dependency clarification | ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS** |
| AC-016 | `start_session` exact output payload clarification | ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS** |
| AUD-002 | MASTERED/AUTOMATIC Temporal Stability Contract(Independent Architecture Audit) | ✅ **CLOSED** — Frozen Core Standard Amendment, 상세는 §AUD-002 참고 |
| AUD-001 | GitHub main 문서 간 current/historical 상태 혼동(Independent Architecture Audit) | ✅ Architecture/Documentation Decision **CLOSED** — ✅ Repository Reconciliation **CLOSED**(4-file patch merged to GitHub main at commit `a8f8ad87c02f62a8d20e1f378e225d86c59bf584`). 상세는 §AUD-001 참고 |
| AUD-003 | Graph가 cross-language relation을 허용·순회함(Independent Architecture Audit) | ✅ **CLOSED** — Frozen Core Standard Amendment, 상세는 §AUD-003 참고 |
| AUD-004 | Review Cascade producer와 `record_attempt` 원자성 연결 공백(Independent Architecture Audit) | ✅ Architecture Clarification **APPROVED** / Implementation Remediation **CLOSED** — 상세는 §AUD-004 참고 |

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

## AC-012 — §9 Conversation Boundary acknowledgement and loop prevention

**상태**: ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS**(2026-07-21). §9는 아직 **PASS 아님**.

**사용자 명시적 승인 provenance(2026-07-17)**: 사용자가 §9 Conversation Boundary의 canonical 진입 조건, acknowledgement 입력 계약, 클라이언트 재호출 흐름, 서버 비영속 원칙, 전체 `start_session` production 경로 선행 구현 조건을 명시적으로 승인했다. Governance는 Tier A Amendment가 아니라 **Tier C Architecture Clarification**이다.

**발견된 무한 반복 원인**: `LEARNING_PROTOCOL.md` §9의 세 조건을 충족해 `start_session`이 `CONVERSATION`을 반환한 뒤, 미구현 boundary 화면을 확인하고 같은 요청을 다시 호출해도 세 조건을 바꾸는 저장 상태가 없다. Session Budget은 §5의 정책으로만 정의되어 있고 `DATA_PERSISTENCE_BRIEF.md`에 저장 필드·엔터티가 없으며, 현재 계약에도 Conversation 몫을 소비했다고 갱신하는 메커니즘이 없다. 따라서 동일 Progress/DB 상태로 재호출하면 CONVERSATION이 반복 선택될 수 있다.

**Canonical Conversation 진입 조건**: `LEARNING_PROTOCOL.md` §9의 기존 세 조건을 그대로 사용한다.

1. 오늘의 Review Queue 처리가 완료됐을 것.
2. PRACTICING 이상 노드가 최소 기준 개수 이상 존재할 것.
3. Session Budget에 Conversation 몫이 남아 있을 것.

PRACTICING 이상 최소 기준은 **Provisional/tunable 기본값 3**이다. 조합 생성의 최소 재료인 2개보다 엄격해야 한다는 §9의 자유 회화 추가 여유분 취지를 만족하는 가장 작은 정수라서 3을 채택했다. 이는 Engine 설정값이며 Tier A 상수가 아니다.

**채택 결정 — 단일 boolean 요청 입력**:

- canonical: `conversation_boundary_acknowledged?: boolean`
- JavaScript: `conversationBoundaryAcknowledged`
- omitted/explicit false → false. 세 조건을 충족하면 CONVERSATION을 반환할 수 있다.
- explicit true → 해당 호출에서 CONVERSATION만 재선택하지 않고, 서버가 기존 우선순위 사슬의 다음 유효한 `next_action`을 결정한다. 일반적으로 IDLE일 수 있으나 다른 action이 유효하면 그 action을 반환한다.
- explicit null 또는 boolean 이외 값 → `CONTRACT_VIOLATION`.
- acknowledgement는 boundary 표시 완료 사실을 보고하는 요청 단위 입력일 뿐 서버 저장 상태가 아니다. Progress와 DB를 변경하지 않고 별도 Conversation session 엔터티도 만들지 않는다.

**기각 대안**:

1. Session Budget 소비 또는 acknowledgement를 DB/Progress에 저장 — 일시적인 UI boundary 확인을 영속 학습 상태로 승격해 Progress-only state 원칙을 훼손하고 새 엔터티·migration을 유발하므로 기각.
2. 클라이언트가 CONVERSATION을 임의로 숨김 — 서버가 `next_action`의 SSOT라는 원칙을 깨고 정책을 중복 구현하므로 기각.
3. acknowledgement=true이면 항상 IDLE 하드코딩 — 호출 시점에 REVIEW 등 더 높은 우선순위 action이 새로 유효할 수 있는데 기존 정책 사슬 평가를 건너뛰므로 기각.
4. Conversation Engine을 지금 신설 — 이번 범위는 미구현 boundary와 반복 방지뿐이며 Engine 내부 설계는 별도 Architecture 작업이므로 기각.

**클라이언트 흐름**: 최초 호출은 field omitted/false → `CONVERSATION`이면 오류·빈 화면이 아닌 정상 boundary 표시 → 사용자가 확인하면 현재 세션 메모리에 true 기록 → `start_session(true)` 재호출 → 서버가 반환한 action을 그대로 처리한다. 세션 종료·앱 재시작 시 false로 초기화하며 영속 저장하지 않는다.

**구현 및 검증 경계**:

- Conversation Engine 자체는 설계·구현하지 않는다. 이 필드는 미구현 Conversation boundary 전용 계약이며 실제 Conversation Engine 도입 전에 유지·변경·폐기 여부를 재심사한다.
- §9 검증 전에 REVIEW, NEW_GRAMMAR, INTERLEAVING, CONVERSATION, IDLE 전체 `start_session` 결정 경로를 실제 production 코드로 구현해야 한다. CONVERSATION-only 부분 구현, validation-only 가짜 함수, production 다른 분기 mock은 금지한다. 테스트 내부 dependency injection과 fixture는 허용한다.
- `LEARNING_PROTOCOL.md` §4의 동시 진행 노드 수 제한 정확한 값은 이번 결정 범위 밖이며 별도 clarification 전까지 임의 숫자를 정하지 않는다. 이 미결정 때문에 AC-009 전체는 여전히 Provisional이고 start_session 전체 통합은 별도 clarification 대기다.
- `VALIDATION_STATUS.md` stale reconciliation은 별도 트랙이며 이번 patch에서 수정하지 않는다. Current main에 §9 테스트가 존재하거나 §9가 PASS했다는 선언도 하지 않는다.

**보존 원칙**: 기존 서버 SSOT와 Progress-only state 원칙을 유지한다. acknowledgement=true는 같은 호출의 CONVERSATION 후보만 제거하며 `LEARNING_PROTOCOL.md`의 고정 우선순위 자체를 바꾸지 않는다.

**VL3 §9 production client boundary validation evidence(2026-07-21, additive)**: validation branch implementation commit `c8cff69a136b8259d5f18cd41256dcb478afe61d`를 GitHub Actions run `29781783610`에서 실제 PostgreSQL 16.14 / Node.js 20.20.2로 검증했고 191/191 tests, 40 suites가 PASS했다(기존 183 tests / 39 suites 대비 신규 8 tests / 1 suite). Production `LearningSessionController`가 정상 `CONVERSATION_BOUNDARY` 화면, 명시적 확인 뒤 session-memory acknowledgement=true와 `startSession(..., true)` 재호출, 새 controller의 false 초기화, loading/error 분리를 소유한다. A→B→C 왕복 전후 `users`, `concepts`, `grammar_nodes`, `grammar_relations`, `content`, `progress`, `attempt_records`, `vocabulary`, `cascade_jobs`의 row count와 row digest가 동일해 생성·수정·삭제 0건을 확인했다. 실제 authoritative admission capacity race는 `startSession → startExplicitStudy(CONTRACT_VIOLATION) → 새 startSession` 각 1회로 종료되고 최신 INTERLEAVING 결정을 받았으며, INVALID_ID와 acknowledgement type CONTRACT_VIOLATION은 client error 상태로 전달되어 재호출되지 않았다. 이 evidence는 AC-012/014/015/016을 IMPLEMENTED·CLOSED로 바꾸거나 Validation Level 3 §9 PASS를 선언하지 않는다.

**VL3 §9 client boundary independent review 및 post-merge verification 기록(2026-07-22, additive)**: client boundary 독립 리뷰 verdict는 **APPROVE WITH NON-BLOCKING NOTES**이며 BLOCKER/CRITICAL/MAJOR는 모두 0건이다. Client implementation은 validation branch `c8cff69a136b8259d5f18cd41256dcb478afe61d`에서 main `910835ab381aa3e5c5549dba04a4d55707ed6a10`으로 반영됐고, validation evidence `3e7edb637f13444a51c2d181e3ac9fb7f6e57ff7`는 main evidence commit `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`에 대응한다. Post-merge verification branch `vl3-section9-postmerge-validation-20260722`의 workflow-only commit `18a028fbf2e88aaea05e66ab450c18127691e8b3`를 GitHub Actions run `29874075409`에서 검증해 191/191 tests, 40 suites가 PASS했고 fail/cancelled/skipped/todo는 모두 0이었다(PostgreSQL 16.14 / Node.js 20.20.2). Temporary workflow를 제외한 branch tree는 verified implementation main `83b3fa56f6c56d34cdb07e26162749bb0744f6f5` tree와 byte-identical이며, main에는 `.github/workflows/postgresql-tests.yml`이 없다.

독립 리뷰의 비차단 finding은 다음과 같이 보존한다.

- **F-1 MINOR**: authoritative capacity conflict 판별이 Error class와 message prefix에 의존한다. 현재 throw-site가 하나이고 fail-closed 동작 및 실제 PostgreSQL E2E가 확인돼 closure blocker는 아니며, machine-readable discriminator는 다음 관련 Tier C touch의 후보로 남긴다. 이번 closure에서 새 AC 번호나 error code를 만들지 않는다.
- **F-2 MINOR**: `startProposedExplicitStudy`의 성공 반환 형식과 client-side `currentServerAction` 설정이 다른 public method와 다소 비일관적이다. 현재 acceptance 결과에는 영향이 없으며 다음 client API consistency touch의 후보로 남긴다.
- **F-3 NOTE**: 정상 acknowledgement 흐름은 production code로 보장되지만 invalid-acknowledgement test에는 acknowledgement 불변을 별도로 확인하는 assert가 없다.
- **F-4 NOTE**: 독립 리뷰 당시 GitHub API 제한으로 PostgreSQL 16.14의 baseline 183/39와 branch 191/40을 직접 재실행하지 못했으나, 리뷰 환경 Node.js 22.22.2에서 전체 suite가 green이었고 canonical validation workflow는 Node.js 20.20.2에서 green이다.
- **F-5 NOTE**: 이전 보고의 잘못된 main SHA 문자열은 단순 오타로 확인됐으며 repository commit chain 자체에는 영향이 없다.
- **F-6 NOTE**: row digest는 byte-identical DELETE+INSERT를 이론적으로 구분하지 못한다. 다만 timestamp/default 필드와 read-only 경계 검증을 함께 고려하면 잔여 위험은 낮다.
- **F-7 NOTE**: 현 검증은 VL3 §2.2의 UI 범위 제한과 production controller의 `SCREEN_KIND`/state model 경계를 evidence로 인정한다. 실제 UI binding은 후속 product milestone이며 §9 closure 조건이 아니다.

---

## AC-013 — Active-Node Admission Boundary

**상태**: ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **CLOSED**(2026-07-18). Tier C Architecture Clarification은 RESOLVED이며 Progress-side Active-Node Admission Gate prerequisite implementation은 main 반영과 post-merge 확인을 완료해 CLOSED다. 이는 Validation Level 3 §9의 PASS 선언이 아니다.

**Prerequisite implementation 검증 기준선**: workflow-only commit `d06a9cd83ea6032f2442b372dc7f74cb0265a88a`에서 PostgreSQL 16 검증 브랜치 baseline Actions run `29616140994`가 Success를 반환했다. 기준 소스는 82 tests / 19 suites로 독립 재계산했다. 이 evidence는 prerequisite implementation 완료·PASS·main merge를 선언하지 않는다.

**Main integration 및 독립 리뷰 evidence(2026-07-18)**:

- Base main SHA: `1a9b4efb9f5fea1d5e2d45e37765252a001a5630`.
- 원본 implementation commit: `f61c30aaba0c6a1a806e3b19cfd43e30c2199338`.
- 원본 regression fixture correction commit: `a0a863fbdd4e776c7a450fcf906daad5e34a4d50`.
- Validation branch final HEAD: `42303a262c6fb89f5f156322358e4a6208f5f74d` (`ac-013-validation-20260718`).
- Independent review verdict: **APPROVE**. BLOCKER/CRITICAL/MAJOR/MINOR 각 0건, NOTE 3건.
- Progress-side Acceptance Criteria를 충족해 main merge 준비가 완료됐다. Learning Flow precheck 실제 배선과 `start_session` race 통합 테스트는 향후 §9 구현 범위이며 AC-013 Progress-side prerequisite 완료를 막는 조건이 아니다.

**GitHub Actions evidence**:

- Baseline — run `29616140994`, HEAD `d06a9cd83ea6032f2442b372dc7f74cb0265a88a`: 82 tests / 19 suites, 82 PASS / 0 FAIL / 0 CANCELLED.
- 최초 implementation run — run `29616571586`, HEAD `f61c30aaba0c6a1a806e3b19cfd43e30c2199338`: 96/97 PASS. 기존 `get_due_reviews` limit fixture가 AC-013 Admission Gate와 충돌했으며 제품 로직을 완화하지 않고 fixture를 PRACTICING 직접 fixture로 정정했다.
- 구현 성공 — run `29616752159`, HEAD `a0a863fbdd4e776c7a450fcf906daad5e34a4d50`: 97/97 PASS / 21 suites.
- 최종 검증 브랜치 HEAD — run `29616897275`, HEAD `42303a262c6fb89f5f156322358e4a6208f5f74d`: 97/97 PASS / 21 suites, 0 FAIL / 0 CANCELLED, PostgreSQL 16.14 / Node.js 20.20.2.

**독립 리뷰 NOTE disposition**:

- **F-01**: validation evidence commit이 기존 개정 이력 행을 in-place 수정한 provenance 불일치가 있었다. 해당 evidence commit을 main integration에서 제외하고 기존 `v1.17` 행을 변경하지 않은 채 새 `v1.18` 행을 추가해 해소했다.
- **F-02**: validation branch 문서에 최종 HEAD run `29616897275`가 빠져 있었다. 본 review record에 성공 run `29616752159`와 최종 HEAD run `29616897275`를 모두 기록해 해소했다.
- **F-03**: Learning Flow부터 `start_session` precheck와 final write 사이 race까지의 통합 테스트는 향후 §9 Learning Flow 구현에서 수행한다. 현재 Progress-side 구현의 main merge를 막지 않는 후속 범위다.

**Post-merge closure evidence(2026-07-18)**:

- Canonical documentation commit: `1a9b4efb9f5fea1d5e2d45e37765252a001a5630`.
- Main implementation commit: `6e3969f527a9fe073d7dc18988d4d64c85607679`.
- Main fixture correction commit: `8350cefbba73a6e27c7d479446cb751e5a74a814`.
- Independent review record commit: `fb05de70631ad65f2f9dff17f01d126b99f47a69`.
- Post-merge 확인 시 local main과 origin/main은 모두 `fb05de70631ad65f2f9dff17f01d126b99f47a69`로 일치했다.
- Original validation evidence는 implementation `f61c30aaba0c6a1a806e3b19cfd43e30c2199338`, fixture correction `a0a863fbdd4e776c7a450fcf906daad5e34a4d50`, validation branch final HEAD `42303a262c6fb89f5f156322358e4a6208f5f74d`다.
- Independent review verdict는 **APPROVE**이며 BLOCKER/CRITICAL/MAJOR/MINOR 각 0건이다. F-01은 새 개정 이력 행 사용, F-02는 최종 run `29616897275` 기록으로 해소했고 F-03은 Learning Flow 및 §9 통합 테스트 후속 범위로 보존한다. 모든 finding은 비차단이며 새로운 unresolved blocker는 없다.
- Actions evidence는 baseline run `29616140994` 82/82 PASS(19 suites), 최초 implementation run `29616571586` 96/97 PASS(fixture와 Admission Gate 충돌, 제품 로직 완화 없음), 구현 성공 run `29616752159` 97/97 PASS(21 suites), 최종 validation branch run `29616897275` 97/97 PASS(21 suites, 0 FAIL / 0 CANCELLED, PostgreSQL 16.14 / Node.js 20.20.2)다.
- AC-012 prerequisite implementation과 Learning Flow 통합은 별도 후속 범위다. Learning Flow의 실제 `get_active_learning_count` precheck 배선 및 `start_session` 사전 판단과 final write 사이 race 통합 테스트는 §9에서 수행하며 AC-013 Progress-side closure를 막지 않는다. Validation Level 3 §9 자체는 아직 **PASS 아님**이다.
- DB schema 및 migration 변경은 없으며 validation workflow는 main에 포함되지 않았다.

**사용자 명시적 승인 provenance(2026-07-18)**: 사용자가 Active-Node 제한을 Tier A Hard Invariant가 아닌 **Tier C Architecture Clarification / Admission Gate**로 명시 승인했다. Tier A 문서, DB schema, migration SQL은 변경하지 않는다.

**Hard Invariant 기각 근거**: limit이 모든 시점에서 절대 유지되어야 하는 데이터 invariant라면 기존 노드의 합법적 퇴행까지 차단하거나 왜곡해야 한다. 이는 Progress state machine의 증거 반영을 훼손한다. 따라서 limit은 신규 `record_explicit_study`의 `NOT_INTRODUCED → INTRODUCED` 진입만 제어하는 gate다.

**Admission Gate 의미**:

- Active state: `INTRODUCED`, `STUDYING`.
- 범위: `(user_id, language)`.
- 집계 단위: Grammar Node. 같은 `concept_id`의 서로 다른 `node_id`는 각각 1개로 집계.
- Provisional/tunable configured limit: 현재 기본값 **2**.
- 기존 노드의 합법적 상태 전이와 퇴행은 제한하지 않음.
- 퇴행으로 count가 limit을 넘을 수 있으며 이는 **허용된 초과 상태**이지 데이터 오류가 아님. 해소 시점은 보장하지 않음.
- 초과 상태에서는 active count가 limit 미만이 될 때까지 신규 explicit study만 거부.

**Canonical active count**:

```sql
SELECT count(*) AS active_count
FROM progress p
JOIN grammar_nodes gn ON gn.node_id = p.node_id
WHERE p.user_id = $1
  AND gn.language = $2
  AND p.state IN ('INTRODUCED', 'STUDYING')
```

**내부 Progress API 계약**: `get_active_learning_count`(JavaScript `getActiveLearningCount`)는 Learning Flow Engine만 호출하는 순수 SELECT다. 입력은 `user_id`, `language`, 출력은 `{active_count: integer}`다. 미존재 `user_id`는 `INVALID_ID`, 잘못된 language 코드 형식은 `OUT_OF_RANGE_VALUE`, 올바른 형식이지만 대상 Progress가 없으면 `{active_count: 0}`이다. 외부 HTTP API가 아니며 Progress Engine의 leaf 구조를 유지한다.

**Precheck과 final enforcement 분리**: Learning Flow Engine은 `record_explicit_study` 전 read-only count로 NEW_GRAMMAR 후보를 precheck하지만 `progress`나 `grammar_nodes`를 직접 조회하지 않는다. precheck과 write 사이의 경쟁 때문에 최종 admission 권한은 Progress Engine `recordExplicitStudy`에 있다. 정책 경쟁으로 거부되면 최신 판단을 위해 `start_session`을 재호출할 수 있다.

**Idempotency 우선순위 및 advisory lock**: `recordExplicitStudy`는 별도 read API를 호출하지 않고 하나의 `pool.connect()` client와 transaction을 사용한다. `BEGIN` 후 Grammar Node 존재성·canonical language를 조회하고 `SELECT pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))`를 호출한다. 이미 동일 `(user_id, node_id)` Progress가 있으면 capacity와 무관하게 기존 state를 반환하고 `COMMIT`한다. 없을 때만 동일 client의 authoritative count를 검사해 `active_count >= configured_limit`이면 기존 `CONTRACT_VIOLATION`으로 전체 `ROLLBACK`, 여유가 있으면 `INTRODUCED` Progress를 삽입하고 `COMMIT`한다. 모든 예외는 `ROLLBACK`, `finally`에서 client release다.

transaction-scoped blocking advisory lock만 사용하며 `COMMIT`/`ROLLBACK` 시 자동 해제된다. session-scoped lock·try-lock은 기각한다. `recordAttempt`는 이 lock을 획득하지 않는다. hash collision은 correctness 오류가 아니라 불필요한 직렬화만 유발한다.

**DB/schema 및 구현 경계**: DB schema·migration SQL·Tier A 문서 변경은 없다. 이 단계에서 코드·테스트·Validation을 시작하지 않는다. 외부 HTTP API 5개는 불변이고 내부 Engine API만 16→17, 전체 API는 21→22가 된다.

**Acceptance Criteria / 향후 테스트 후보**:

1. active count가 language 경계와 `INTRODUCED`/`STUDYING`만 집계하고 같은 concept의 별도 node를 각각 세는지.
2. 정상 0건, `INVALID_ID`, `OUT_OF_RANGE_VALUE` 계약이 정확한지.
3. limit 미만의 신규 explicit study만 삽입되고 limit 이상은 `CONTRACT_VIOLATION` 및 전체 rollback인지.
4. 기존 `(user_id, node_id)` 재요청이 초과 상태에서도 멱등 성공하는지.
5. 동일 `(user_id, language)` 동시 진입이 lock으로 직렬화되어 limit을 넘는 신규 삽입이 없는지.
6. 퇴행으로 인한 허용된 초과 상태를 오류로 수정하지 않고 신규 admission만 거부하는지.
7. 예외 시 전체 rollback·client release, commit/rollback 후 lock 자동 해제, `recordAttempt` lock 미사용을 검증하는지.

---

## AC-014 — Learning Flow prerequisite clarification

**상태**: ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS**(2026-07-19). Validation Level 3 §9는 아직 **PASS 아님**이며 Conversation Engine 내부 설계·구현은 범위 밖이다. AC-012/AC-013은 재개방하지 않는다.

**승인 provenance 및 Governance**: 사용자가 AC-014를 Tier C Architecture Clarification으로 명시 승인했다. `GRAMMAR_GRAPH.md`의 Tier A/Frozen 원문은 변경하지 않고 기준 main SHA `c67a37b9c86779fe2c866f51cd5453122f69f9ed`와 byte-identical로 보존한다. Tier A가 이미 정한 Graph/Interleaving 책임을 실행 가능한 입력·출력·오류·결정 순서로 정밀 해석한 adjudication은 본 섹션과 `ENGINE_INTERFACE.md`·`DOMAIN_LOGIC_BRIEF.md`에만 기록한다.

**Review Cascade와 INTERLEAVING 입력 경계**: Review Engine의 `get_cascade`는 오답 처리 시 즉시 산출되는 복습 대상 목록이다. Progress Engine이 같은 attempt 트랜잭션에서 기록하는 `cascade_jobs`는 Worker 후속 처리를 위한 PENDING outbox이며 INTERLEAVING candidate가 아니다. 저장된 job을 `start_session` 후보 집합처럼 조회하거나 sequence 입력으로 재해석하지 않는다.

**start_session 신규 연습 세트**: AC-014에서 Tier A 문언의 “신규 연습 세트”는 `(user_id, language)`의 AC-013 active 집합, 즉 `INTRODUCED`/`STUDYING` Grammar Node로 adjudicate한다. eligible pool에는 임의 크기 상한이 없다.

**Category hard composition gate**: admissible selected set `S`의 크기는 2 또는 3이며 모든 Category `c`에 대해 다음을 만족해야 한다.

```
count(c,S) <= floor(|S|/2)
violation(c,S) = max(0, count(c,S) - floor(|S|/2)) = 0
```

다중 Category node는 자신이 속한 모든 Category count에 각각 1회 기여하고 Category가 없는 node는 어떤 Category count에도 기여하지 않는다. admissible set이 없으면 오류나 `CONTRACT_VIOLATION`이 아니며 INTERLEAVING을 건너뛰고 CONVERSATION을 평가한다.

**Admissible selected-set 결정**: eligible pool의 모든 크기 2·3 조합 `C(n,2)+C(n,3)`을 비교해 다음 tuple의 lexicographic 최솟값을 선택한다.

```
(
  -|S|,
  -contrast_pair_count(S),
  -category_diversity(S),
  sorted_node_id_array(S)
)
```

크기 3을 우선하고, 다음으로 CONTRAST 무방향 고유 node pair 수, Category 합집합 크기를 우선한다. 마지막에는 정렬된 node ID 배열을 element-wise 비교한다. eligible pool에 6 같은 임의 상한을 두지 않는다.

**Occurrence 및 batch 정책**: `base_repeats=2`, `max_batch_size=6`이다. selected node마다 정확히 2 occurrence를 만든다. selected 2개는 batch 4, selected 3개는 batch 6이며 selected 0/1개는 INTERLEAVING을 생략한다. `eligible pool → admissible selected set → occurrence multiset → sequence_nodes` 단계를 합치지 않는다.

**sequence_nodes multiset 및 ordering 계약**: 입력은 중복 node ID를 허용하는 occurrence multiset 배열이고 출력은 입력과 길이·multiplicity가 정확히 같은 순열이다. 입력 node를 추가·삭제하지 않는다. 고유 multiset 순열 전체에서 `(same_node_adjacent_pair_count, shared_category_adjacent_pair_count, contrast_pair_min_distance_sum, final_sequence_array)`의 lexicographic 최솟값을 선택한다. 동일 node 인접 최소화가 1순위다. 서로 다른 node가 Category를 하나 이상 공유하면 인접 penalty 1이며 같은 node는 Category penalty에서 제외한다. CONTRAST는 relation weight를 쓰지 않는 무방향 고유 pair이고, pair별 가장 가까운 occurrence의 index 차이(인접 거리 1)를 합산한다. 마지막 배열은 element-wise 비교하며 내부 점수는 노출하지 않는다.

**신규 내부 API 4개**:

- Graph Engine: `list_nodes_by_language`(JavaScript `listNodesByLanguage`), `get_concept_categories`(`getConceptCategories`). 정적 graph/grammar metadata만 반환하고 Progress를 조회하지 않는다.
- Progress Engine: `get_progress_snapshot`(`getProgressSnapshot`), `get_practicing_plus_count`(`getPracticingPlusCount`). 다른 Engine을 호출하지 않는 leaf를 유지하며 snapshot의 node 존재성과 language 일관성은 같은 read client에서 검증한다.

**NEW_GRAMMAR flow 및 payload**: Learning Flow Engine은 canonical API만 호출하고 `progress`·`grammar_nodes`·`concepts` 테이블을 직접 조회하지 않는다. language node metadata → progress snapshot → `NOT_INTRODUCED` 후보 → prerequisite 조회 → prerequisite 전부 `MASTERED`/`AUTOMATIC` 확인 → AC-013 active-count precheck → `difficulty ASC → node_id ASC` 순으로 결정하고 `{next_action:"NEW_GRAMMAR", node_id}`를 반환한다. prerequisite depth나 `find_prerequisites` 목록 길이는 선택 기준이 아니다. AC-009 `request_practice` population과 합치지 않는다.

`start_session`은 후보만 제안하며 최종 admission은 별도 `start_explicit_study` 호출의 `record_explicit_study`가 AC-013에 따라 강제한다. 후보 제안 후 capacity race로 `CONTRACT_VIOLATION`에 실패하면 같은 호출에서 재선택하지 않고 클라이언트가 새 `start_session`을 호출한다. 별도 Conversation/server session state는 만들지 않는다.

**Session Budget mode**: 현재 `SESSION_BUDGET_MODE='UNBOUNDED_UNTIL_INPUT_AVAILABLE'` 하나만 지원한다. NEW_GRAMMAR와 CONVERSATION이 공유하며 INTERLEAVING batch 크기와 별개다. `REAL_INPUT`은 향후 예약 개념이고 현재 허용값이 아니다.

**API 수 및 구현 경계**: 기존 외부 5·내부 17·전체 22에서 신규 내부 API 4개를 추가해 최종 외부 5(불변)·내부 21·전체 26이다. 기존 22개 API와 외부 `next_action` enum은 보존한다. `sequence_nodes`는 기존 목적을 유지하면서 multiset·오류·출력 불변식만 정밀화한다. DB migration·신규 엔터티는 없고 실제 prerequisite implementation은 NOT STARTED다.

**AC-014 wording correction addendum(2026-07-19, additive)**: 신규 내부 API 4개의 입력 필드가 각각 required임을 명시적으로 확정한다 — `concept_ids`/`node_ids`의 "빈 배열이 정상"이라는 계약은 필드 생략이 정상이라는 뜻이 아니다. Positional JavaScript signature에서는 omitted와 explicit undefined를 구분하지 않고 `value===undefined`로 동일 처리해 `MISSING_REQUIRED_FIELD`를 반환한다. explicit null 또는 기대 타입과 다른 값은 `CONTRACT_VIOLATION`이다. `language` 필드는 형식 불일치 시 `OUT_OF_RANGE_VALUE`, `user_id`는 형식 오류와 DB 미존재를 모두 `INVALID_ID`로 처리하며 검증 없이 DB에 전달하지 않는다. `concept_ids`/`node_ids`의 중복 원소는 에러가 아니라 lookup 결과 map에서 자연히 정규화되며, 하나라도 존재하지 않는 ID를 포함하면 부분 결과 없이 전체를 거부한다. `node_ids`의 mixed-language는 `CONTRACT_VIOLATION`이다. 신규 error code는 추가하지 않는다. 이 addendum은 Narrow Contract Wording Clarification이며 §AC-014 본문의 기존 결정(API 4개 계약, Category hard gate, selected-set/ordering tuple, occurrence/batch, NEW_GRAMMAR flow, Session Budget mode 등)을 변경하지 않는다. 기존 `get_active_learning_count`(AC-013)의 validation 방식은 이 addendum 범위 밖이며 변경되지 않는다.

**AC-014 read API 독립 리뷰 및 main integration 기록(2026-07-19, additive)**: main integration 원본은 validation branch implementation commit `bfb6c42cb9f277b3bffc7ad43e76a1e24a9b96a4`이며, main cherry-pick commit은 `17de0fbd98b57f542fd4f88b866a5e00bd9affde`다. 독립 리뷰 verdict는 **APPROVE**이고 BLOCKER/CRITICAL/MAJOR/MINOR는 모두 0건이며 merge-blocking finding은 없다. F-01은 리뷰 시 GitHub API rate limit으로 baseline run의 `head_sha`/`conclusion`을 직접 재조회하지 못했으나 source recount 97 tests/21 suites 및 workflow topology로 corroborate된 non-blocking NOTE다. F-02는 Graph/Progress language validator 중복이 기존 leaf-per-file 관례와 일치하므로 조치가 필요 없는 non-blocking NOTE다. Validation evidence는 baseline run `29688270347` 97/97 PASS·21 suites, implementation run `29688678717` 125/125 PASS·26 suites, final validation branch run `29688802913` 125/125 PASS·26 suites이며 PostgreSQL 16.14 / Node.js 20.20.2에서 확인됐다. 신규 tests는 28개다. 이번 승인은 read API 네 개의 구현 milestone에 한정되며 Learning Flow/Interleaving 부재는 이 milestone 승인을 막지 않는다. AC-014 전체 prerequisite는 아직 완료되지 않았으므로 상태는 Architecture Clarification RESOLVED / Prerequisite Implementation IN PROGRESS로 유지하고, IMPLEMENTED·CLOSED 또는 Validation Level 3 §9 PASS를 선언하지 않는다.

---

## AC-015 — Interleaving Graph metadata dependency clarification

**상태**: ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS**(2026-07-20). Validation Level 3 §9는 아직 **PASS 아님**이며 Learning Flow 통합은 이번 범위 밖이다. AC-014는 재개방하지 않는다.

**승인 provenance 및 Governance**: 사용자가 AC-015를 Tier C Architecture Clarification으로 명시 승인했다. `GRAMMAR_GRAPH.md`의 Tier A/Frozen 원문은 변경하지 않는다. 직전 독립 리뷰가 `sequence_nodes`의 Category/mixed-language 계산에 실제 canonical 데이터 접근 경로가 없음을 확인해 "Narrow Tier C contract clarification required"로 판정한 gap을 해소한다.

**발견된 문제**: `sequence_nodes`(§9.1) 입력은 node_id occurrence multiset뿐이라 Interleaving Engine이 각 node의 `language`·`concept_ids`를 얻을 canonical API가 없었다. `list_nodes_by_language`는 Learning Flow 전용 caller이고 `sequence_nodes` 입력엔 애초에 language가 없어 caller 확대만으로는 해결 불가능했으며, `get_concept_categories`는 `concept_ids`를 이미 알고 있어야 호출 가능했고, `find_related_nodes` 출력에는 language/concept_ids가 없었다. 이 상태로 구현하면 직접 DB 조회, caller 제한 위반, Category 규칙 미구현, mixed-language 검증 생략, 테스트 전용 metadata 주입 중 하나로 흐를 수밖에 없어 전부 계약 위반으로 판정됐다.

**최종 확정 — 신규 API `get_node_language_and_concepts`**:
- Canonical 이름: `get_node_language_and_concepts` / JavaScript: `getNodeLanguageAndConcepts`.
- Owner: Graph Engine. Caller: **Interleaving Engine만**(Learning Flow나 다른 Engine은 입증된 필요가 없어 caller에 포함하지 않는다).
- 입력: required `node_ids: string[]`. AC-014 wording correction과 동일한 규칙 — omitted/undefined → `MISSING_REQUIRED_FIELD`, explicit null/non-array/잘못된 원소 → `CONTRACT_VIOLATION`, 빈 배열 → 정상 `{}`, 중복 → 정상(결과 map에서 단일 key로 정규화), 미존재 ID가 하나라도 있으면 부분 결과 없이 전체 `INVALID_ID`.
- 출력: 실제 node_id를 key로 하는 동적 map `{[node_id]: {language, concept_ids}}`다 — 문자 그대로의 고정 key `"node_id"`가 아니라, 입력의 모든 고유하고 유효한 node_id가 결과에 정확히 한 번씩 포함된다.
- 이 Graph API는 mixed-language를 거부하지 않는다 — 각 node의 실제 `language`를 있는 그대로 반환할 뿐이며, mixed-language를 `CONTRACT_VIOLATION`으로 판정하는 책임은 `sequence_nodes`/Interleaving Engine에 있다(Graph Engine의 "판단하지 않고 순수 구조만 조회" 원칙과 일치).
- `language`와 `concept_ids`만 반환한다 — `concepts.category` 해석은 기존 `get_concept_categories`(§3.5)로 계속 분리하고, `difficulty`나 다른 metadata를 추가하지 않는다(책임 과확장 방지).
- 신규 error code는 추가하지 않는다.

**`sequence_nodes` batch length 계약(§9.1 추가)**: dedupe 및 permutation 생성 **이전**, 원본 occurrence multiset 배열의 **전체 길이**(unique node_id 개수가 아님)가 `engineConfig`의 Provisional/tunable `max_batch_size`(승인값 6)를 초과하면 `OUT_OF_RANGE_VALUE`로 거부한다 — 동일 node_id 7개로만 구성된 입력(`[A,A,A,A,A,A,A]`)도 길이 7로 계산해 거부한다. 숫자 6은 `sequence_nodes` 함수 내부에 하드코딩하지 않고 `engineConfig.js`를 참조한다(단, 이번 문서 patch는 `engineConfig.js` 자체를 수정하지 않는다 — Interleaving Engine 구현 세션의 몫이다).

**Data flow**: `sequence_nodes` 입력 validation → occurrence multiset에서 unique node_ids 추출 → `get_node_language_and_concepts` 1회 호출(존재성 전부 검증 포함) → language distinct count 판정(Interleaving 책임) → concept_ids union → `get_concept_categories` 1회 호출 → `find_related_nodes`(CONTRAST) 호출 및 pair 정규화 → unique multiset permutation → lexicographic tuple 계산 → 입력 multiplicity·길이를 보존한 배열 반환.

**API 수 및 구현 경계**: 기존 외부 5·내부 21·전체 26에서 신규 내부 API 1개를 추가해 최종 외부 5(불변)·내부 22·전체 27이다. 기존 26개 API와 외부 `next_action` enum은 보존한다. DB migration·신규 엔터티는 없고, `engineConfig.js`는 이번 clarification에서 변경하지 않으며 실제 prerequisite implementation은 NOT STARTED다.

**기각된 대안**: (1) `list_nodes_by_language` caller를 Interleaving까지 확대 — `sequence_nodes` 입력엔 language가 없어 이 API를 호출할 language 자체를 모른다는 근본 문제가 남아 기각. (2) `get_concept_categories` 입력을 node_ids까지 확대 — language를 여전히 못 얻고 기존 단순한 계약을 훼손해 기각. (3) `sequence_nodes` 입력을 metadata 객체 배열로 변경 — §9.1의 기존 입력 계약을 breaking하고 Interleaving의 "Graph Engine 호출 가능" 권한을 무의미하게 만들어 기각. (4) Learning Flow가 별도 metadata snapshot을 전달 — 존재성 검증 책임 소재가 모호해지고 Interleaving의 기존 Graph 호출 권한과 실질적으로 중복돼 신규 API보다 열등하다고 판단해 기각. (5) Interleaving Engine의 직접 DB 조회 — ENGINE_INTERFACE §11 "리프 Engine은 아무도 호출하지 않는다: Graph Engine" 및 §10-5의 Graph *Engine* 경유 원칙을 정면 위반해 기각.

**보존 범위**: AC-014 기존 본문·상태·provenance는 변경하지 않는다. AUD-001~004 기록을 변경하지 않는다. Tier A `GRAMMAR_GRAPH.md` 원문은 수정하지 않는다. Conversation Engine 내부 설계, Content/Generation 구현, Worker 구현, DB migration, Interleaving Engine 실제 구현은 이번 clarification 범위 밖이다.

**AC-015 독립 리뷰 및 main integration 기록(2026-07-20, additive)**: 원본 implementation `b0e368b3a0df1eaa383eec5013544ef56e2afd37`은 main cherry-pick `7eb02cd5c531646a6e06ab61b82ed540231875f2`로, 원본 test-only correction `aea971d9bcfa5180772ab7aee69021ec636a0fa4`는 main cherry-pick `46edac191cf010afbf6cb8f0f0a5642d62131953`으로 반영됐다. 독립 리뷰 verdict는 **APPROVE WITH NON-BLOCKING NOTES**이며 BLOCKER/CRITICAL/MAJOR/MINOR는 모두 0건이다. Correction은 production 버그를 은폐한 것이 아니라 잘못된 test oracle을 바로잡은 것이다. Canonical tuple의 최솟값은 `E,D,F`이며 `D,E,F`보다 shared-category adjacent penalty가 정확히 1 낮다. Validation evidence는 baseline run `29704547463` 125/125 PASS·26 suites, initial run `29704717846` 149/150 PASS·oracle 오류 1건, correction run `29704796941` 150/150 PASS·32 suites, final run `29704854809` 150/150 PASS·32 suites이고 PostgreSQL 16.14 / Node.js 20.20.2, 신규 tests 25 / 신규 suites 6이다. F-01은 reviewer가 GitHub API rate limit으로 일부 Actions/minor version을 직접 재확인하지 못한 사실을 투명하게 보존하는 non-blocking NOTE다. F-02~F-04도 모두 non-blocking NOTE이며 merge-blocking 조치나 미해결 심각도 finding은 없다. AC-014와 AC-015는 모두 Architecture Clarification RESOLVED / Prerequisite Implementation IN PROGRESS이고, IMPLEMENTED·CLOSED 또는 Validation Level 3 §9 PASS가 아니다. Learning Flow integration은 별도 후속 범위다.

---

## AC-016 — `start_session` exact output payload clarification

**상태**: ✅ Architecture Clarification **RESOLVED** / Prerequisite Implementation **IN PROGRESS**(2026-07-20). Learning Flow 5-branch validation branch 구현 및 PostgreSQL 검증을 진행 중이며 Validation Level 3 §9는 **PASS 아님**이다.

**승인 provenance 및 Governance**: 사용자가 추천 조합(REVIEW `review_batch`, INTERLEAVING `node_sequence`, selected set 별도 병기 없음, CONVERSATION/IDLE `next_action` 단독, JavaScript `startSession(pool, userId, language, conversationBoundaryAcknowledged)`)을 명시 승인했다. Governance는 Tier C Architecture Clarification이며 Tier A 문서와 기존 NEW_GRAMMAR payload를 재개방하지 않는다.

**보존 근거**: `CLIENT_BRIEF.md`와 `VALIDATION_LEVEL3.md`에 REVIEW 소비 필드 `review_batch`와 INTERLEAVING 소비 필드 `node_sequence`가 이미 보존돼 있다. AC-016은 이 명칭을 `API_CONTRACT.md` §10.5 SSOT에 반영하고, 코드베이스 유실로 불명확했던 다른 branch의 exact payload를 승인으로 확정한다.

**Canonical/JavaScript 및 acknowledgement**: Canonical API는 `start_session`, JavaScript 구현명은 `startSession`이고 signature는 `startSession(pool, userId, language, conversationBoundaryAcknowledged)`다. `conversationBoundaryAcknowledged` omitted/explicit `undefined`는 `false`와 동일하고 `false`는 미확인, `true`는 이번 호출에서 CONVERSATION 재선택 금지다. explicit `null` 또는 non-boolean은 `CONTRACT_VIOLATION`이다. Trailing options object 대안은 채택하지 않는다.

**다섯 branch exact payload matrix**:

| Branch | 정확한 top-level payload | Fallthrough/제약 |
|---|---|---|
| REVIEW | `{next_action:"REVIEW", review_batch:[{node_id,state,next_review_at,overdue_by,priority,reason}]}` | `review_batch` 최소 1, `get_due_reviews` 결과 순서·shape 유지. 빈 배열이면 NEW_GRAMMAR |
| NEW_GRAMMAR | `{next_action:"NEW_GRAMMAR", node_id:"..."}` | AC-014 계약 불변. 후보 없음이면 INTERLEAVING |
| INTERLEAVING | `{next_action:"INTERLEAVING", node_sequence:[...]}` | `sequence_nodes` 결과·multiplicity·ordering 유지, 길이 4 또는 6. admissible set 없음이면 CONVERSATION |
| CONVERSATION | `{next_action:"CONVERSATION"}` | acknowledgement echo·conversation object·prompt 없음 |
| IDLE | `{next_action:"IDLE"}` | 정상 최종 fallback, `reason`·`message` 없음 |

REVIEW는 `getDueReviews`에 별도 `limit`·`conceptId`·`stateFilter` option을 전달하지 않고 §4.7 기본 계약으로 호출한다. INTERLEAVING은 `selected_node_ids` 등 selected set을 중복 병기하지 않으며 내부 tuple·score·candidate pool을 노출하지 않는다.

**Exact-key 및 오류 규칙**: 선택되지 않은 branch field는 `null`이 아니라 완전히 생략하고 `undefined` field를 반환하지 않는다. Enum 밖 sentinel과 별도 clarification 없는 future metadata를 금지한다. 하위 API error code는 변환 없이 전파하며 신규 error code는 없다.

**기각 대안**: REVIEW의 `due_reviews`/`review_items`, INTERLEAVING의 `ordered_node_ids`/`node_ids`, selected set 중복 병기, acknowledgement echo, IDLE `reason`/`message`, trailing options object는 canonical 소비 명칭·최소 exact-key 원칙·positional signature와 충돌해 기각했다.

**API 및 영향 범위**: 외부 5·내부 22·전체 27은 불변이다. DB migration/schema와 Tier A 영향은 없다. AC-014/AC-015 상태를 변경하지 않는다. 이 clarification으로 Learning Flow 5-branch 구현은 READY지만 prerequisite implementation은 NOT STARTED이고 §9 PASS를 선언하지 않는다.

**AC-016 독립 리뷰 및 main integration 기록(2026-07-21, additive)**: Verdict는 **APPROVE WITH NON-BLOCKING NOTES**이며 BLOCKER/CRITICAL/MAJOR는 모두 0건이다. Validation 원본 implementation `d6d53203a52b784924737def7a9948f9f34bbdfa`는 main `fff9d93e3822c187e9e8fd68bd75e810880f6954`로, 필수 correction `860d9ddc84ebc8a805b65514c8f7918c35233277`은 main `33a36dea2f2e9b342e97c473bd0fce8056d67fac`로 순서대로 반영됐다. F-01 NOTE: GitHub API rate limit으로 리뷰 세션에서 Actions를 직접 재조회하지 못했으나 150 tests/32 suites에서 183 tests/39 suites로의 소스 재계산과 최초 실패 8건의 독립 재현으로 corroborate했다. F-02 MINOR: Category gate의 `floor(|S|/2)`에서 수학적 상수 2 대신 `baseRepeats`를 사용해 잠재 결합이 있으나 현재 canonical 값에서는 결과가 일치해 non-blocking이며 다음 관련 touch에서 분리를 권장한다. F-03 NOTE: active-count precheck가 prerequisite 검사보다 먼저지만 결정·payload·error 의미는 불변이다. F-04 NOTE: `findPrerequisites`의 `maxDepth`를 현재 language node 수로 설정해 전체 선행관계를 검사하며 tie-break에는 사용하지 않는다. F-05 NOTE: 비정상 budget mode에서는 CONVERSATION을 닫는 fail-closed 동작이다. Correction commit은 `listNodesByLanguage` 결과에 없는 `nodes[0].language` 참조를 제거하고 public `language`를 active-count 경로에 전달하기 위해 필수였다. Validation Actions는 baseline `29746928577` 150/150·32 suites, 최초 implementation `29747762577` 175/183, correction `29747972286` 183/183·39 suites, evidence HEAD `29748289860` 183/183·39 suites이며 PostgreSQL 16.14 / Node.js 20.20.2에서 수행됐다. Temporary workflow commit `5f469884af991ad80183844beb991b865779326a`와 validation evidence commit `836c036e069d9498f98966ecb4de7be5a0971e0e`은 main에서 제외했다. AC-014/AC-015/AC-016은 모두 Architecture Clarification RESOLVED / Prerequisite Implementation IN PROGRESS로 유지하며 IMPLEMENTED·CLOSED 또는 Validation Level 3 §9 PASS를 선언하지 않는다.

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

**상태**: ✅ Architecture Clarification **APPROVED** / Implementation Remediation **CLOSED**(2026-07-17)

**사용자 승인 provenance(2026-07-17)**: 사용자가 AUD-004 Architecture Adjudication 결과를 명시적으로 승인했다. 판정은 **Tier A Amendment가 아니라 Tier C Architecture Clarification 후 Implementation Remediation**이다. 기존 Tier A 엔터티·필드 구조, Cascade 알고리즘, 임계치 또는 DB schema를 바꾸지 않고, 이미 존재하는 `cascade_jobs` 아웃박스와 Engine 책임 경계를 실행 가능하게 연결하는 누락 계약을 보완한다.

**Problem**: Learning Flow Engine이 Content metadata로 SELF/TRANSFER를 판정하고 Review Engine에서 Cascade 대상 목록을 계산한다는 계약과, Progress Engine이 attempt/progress를 단일 트랜잭션으로 기록한다는 계약이 각각 존재했지만, Review 결과의 node ID 목록을 `record_attempt`에 전달해 같은 트랜잭션에서 `cascade_jobs`를 생성하는 명시적 내부 입력·producer 경로가 없었다. 그 결과 핵심 시도 기록과 아웃박스 producer 사이의 원자성이 구현 계약으로 닫히지 않았다.

**승인 결정**:

1. Progress Engine `record_attempt` 내부 입력에 canonical `cascade_target_node_ids?: string[]` / JavaScript `cascadeTargetNodeIds`를 추가한다. 외부 HTTP 입력이 아니며 Learning Flow Engine만 산출·전달한다.
2. omitted는 `[]`; explicit `null`, 배열이 아닌 값, 빈 문자열·문자열 아닌 원소, 중복 ID는 `ContractViolationError`. 정답과 SELF는 반드시 `[]`; TRANSFER는 `[]` 또는 고유한 Grammar Node ID 1개 이상을 허용한다. 하나라도 존재하지 않으면 `INVALID_ID`로 전체 실패한다.
3. Learning Flow Engine은 Content metadata로 SELF/TRANSFER를 판정하고, TRANSFER이면 Review Engine `get_cascade`를 호출한 뒤 결과의 `node_id` 목록만 Progress Engine에 전달한다. `max_cascade_depth`는 하드코딩하지 않고 Engine 설정값을 사용하며 현재 기본값 2는 유지한다.
4. Progress Engine은 다른 Engine을 호출하지 않는 리프 구조를 유지한다. 동일 DB client와 기존 `recordAttempt` 트랜잭션 안에서 대상 ID 존재성을 확인하고 attempt 삽입, progress 갱신, 대상별 `cascade_jobs(status='PENDING')` 정확히 1건 삽입을 모두 수행한 뒤 COMMIT한다. 하나라도 실패하면 전체 ROLLBACK한다.
5. Worker/polling/retry-backoff/DONE·FAILED 전이 및 실제 대상 노드 `next_review_at` 갱신은 이번 producer remediation 범위 밖이다. Learning Flow/Review Engine 구현, DB migration, Tier A 문서 변경도 범위 밖이다.

**Governance 판정**: Tier C Architecture Clarification. 새 저장 엔터티·컬럼·Tier A admissible state 변경이 없고, 기존 `cascade_jobs`와 Engine boundary를 연결하는 내부 호출 계약 및 producer 구현 누락을 보완하므로 `CORE_STANDARD_V1_FREEZE.md` §5 Amendment 절차 대상이 아니다.

**Implementation 및 검증 evidence(2026-07-17)**:

- Implementation commit: `0e0aa3edd3d168aca3515d19481bd156b9f5baac`
- 검증 브랜치: `aud-004-validation-20260717`
- Baseline: 68/68 PASS, 18 suites
- Implementation: 82/82 PASS, 19 suites
- 검증 환경: PostgreSQL 16.14 / Node.js 20.20.2
- GitHub Actions: `https://github.com/minos8458-web/language-learning-engine/actions/runs/29577845902`
- Independent review verdict: **APPROVE WITH NON-BLOCKING NOTES**
- BLOCKER: 0 / CRITICAL: 0 / MAJOR: 0

**Main integration evidence(2026-07-17)**:

- Main implementation commit: `54bcdab220c247e46b7b44bed03dd4ac25de0f44`
- Review-record / main integration tip: `df4ecebe54ab7a886b0d72666e3dd5f7bc9a951b`
- 검증 환경: PostgreSQL 16.14 / Node.js 20.20.2
- 검증 결과: 82/82 PASS, 19 suites
- 임시 validation workflow commit `061fdcaffe111d74b88467cd93c92133f83237d6`은 main integration에서 제외됨을 확인했다.

**Independent review 비차단 메모 및 처리 방침**:

- **F-01**: 여러 대상 중 앞선 INSERT 성공 후 후속 INSERT 실패를 강제하는 테스트는 없다. PostgreSQL transaction 원자성과 실제 DB trigger rollback 테스트로 현재 계약은 검증됐으므로 병합 비차단이며, 향후 regression-hardening 후보로 추적한다.
- **F-02**: `errorCategory=null` + non-empty 목록의 전용 테스트는 없다. 현재 코드가 SELF와 같은 분기로 처리하고 명시적 SELF 테스트가 있으므로 병합 비차단이며, 향후 regression-hardening 후보로 추적한다.
- **F-03**: 공백 문자만으로 구성된 문자열도 빈 node ID로 간주해 거부하는 현재 코드 동작을 승인한다. `API_CONTRACT.md` §4.4에 wording clarification으로 동기화한다.
- **F-04**: `cascade_jobs` 단건 N회 INSERT는 정확성 문제가 없다. 배치 INSERT는 실제 성능 필요가 확인될 때만 검토한다.
- **F-05**: 복수 계약 위반 시 validation error 우선순위 전용 테스트는 없다. 검증 순서는 결정적이며 현재 병합 비차단이고, 향후 regression-hardening 후보로 추적한다.
- **F-06**: Learning Flow/Review/Worker 통합은 명시적 범위 밖이며 별도 단계에서 수행한다.

위 비차단 메모들은 AUD-004 producer 구현의 main 병합이나 closure를 막지 않는다. Worker와 Learning Flow/Review 통합은 AUD-004 producer closure 조건이 아니다. Main 병합이 확인되어 AUD-004 producer remediation을 **CLOSED**로 전환한다.

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
| 1.13 | 2026-07-17 | AUD-004 독립 코드리뷰 disposition 반영 — implementation commit `0e0aa3e`, PostgreSQL 16.14 / Node.js 20.20.2 GitHub Actions 82/82 PASS(19 suites), APPROVE WITH NON-BLOCKING NOTES 및 BLOCKER/CRITICAL/MAJOR 0건을 evidence로 기록. F-01~F-06 처리 방침을 명시하고 상태를 Implementation Remediation IMPLEMENTED — PENDING MERGE로 전환. GitHub main 병합 전이므로 아직 CLOSED 아님 |
| 1.14 | 2026-07-17 | AUD-004 post-merge closure — main implementation commit `54bcdab2` 및 review-record/main integration tip `df4eceb` 반영 완료를 확인하고 Architecture Clarification APPROVED / Implementation Remediation CLOSED로 전환. PostgreSQL 16.14 / Node.js 20.20.2, 82/82 PASS(19 suites), workflow commit 제외를 main integration evidence로 기록. F-01~F-06 비차단 후속 후보와 Worker·Learning Flow/Review 통합 범위 제외는 그대로 유지 |
| 1.15 | 2026-07-17 | AC-012 §9 Conversation Boundary acknowledgement and loop prevention 사용자 승인 반영 — Tier C Architecture Clarification RESOLVED / Prerequisite Implementation NOT STARTED. `conversation_boundary_acknowledged?: boolean`, PRACTICING+ 기본값 3(Provisional/tunable), 비영속 acknowledgement와 기존 우선순위 재평가, 전체 start_session production 경로 선행 구현, Conversation Engine·동시 진행 노드 수·VALIDATION_STATUS reconciliation 범위 제외 및 §9 미PASS를 기록 |
| 1.16 | 2026-07-18 | AC-013 Active-Node Admission Boundary 사용자 승인 반영 — Tier C Architecture Clarification RESOLVED / Prerequisite Implementation NOT STARTED. Hard Invariant 기각, `(user_id, language)` Grammar Node 단위 active count, 기본 limit 2, 허용된 초과 상태, 내부 read API, Learning Flow precheck/Progress final enforcement, idempotency 우선, transaction-scoped advisory lock, `CONTRACT_VIOLATION`, DB/schema 불변 및 향후 acceptance 후보를 기록 |
| 1.17 | 2026-07-18 | AC-013 prerequisite implementation 검증 브랜치 착수 — 상태를 Architecture Clarification RESOLVED / Prerequisite Implementation IN PROGRESS로 전환. workflow-only commit `d06a9cd8`, PostgreSQL 16 baseline Actions run `29616140994` Success, 기준 소스 82 tests / 19 suites 재계산을 기록. main 미병합이며 IMPLEMENTED·CLOSED·PASS 선언 없음 |
| 1.18 | 2026-07-18 | AC-013 independent review **APPROVE** 및 main integration 준비 기록 — 원본 implementation `f61c30a`, fixture correction `a0a863f`, validation final HEAD `42303a2`; PostgreSQL 16.14 / Node.js 20.20.2에서 최종 97/97 PASS(21 suites, 0 FAIL / 0 CANCELLED)를 evidence로 기록. F-01은 기존 v1.17 불변+신규 이력 행 추가, F-02는 성공 run `29616752159`와 최종 run `29616897275` 동시 기록으로 해소. F-03 Learning Flow/start_session race 통합은 §9 후속 범위로 보존. 상태는 Architecture Clarification RESOLVED / Prerequisite Implementation IMPLEMENTED — PENDING MERGE이며 post-merge 확인 전 CLOSED·PASS 아님 |
| 1.19 | 2026-07-18 | AC-013 post-merge closure — main implementation `6e3969f`, fixture correction `8350cef`, independent review record `fb05de7` 반영과 local main/origin main 일치를 확인해 Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED로 전환. 독립 리뷰 APPROVE 및 심각도 전 등급 0건, 최종 Actions run `29616897275` 97/97 PASS(21 suites, PostgreSQL 16.14 / Node.js 20.20.2), DB/migration 불변과 workflow 미포함을 기록. AC-012 prerequisite, Learning Flow precheck 배선 및 start_session race 통합은 비차단 §9 후속 범위이며 §9 PASS는 선언하지 않음 |
| 1.20 | 2026-07-19 | AC-014 Learning Flow prerequisite clarification 사용자 승인 — Tier C Architecture Clarification RESOLVED / Prerequisite Implementation NOT STARTED. Tier A `GRAMMAR_GRAPH.md` 불변 상태에서 Review Cascade와 cascade_jobs 경계, AC-013 active eligible pool, Category hard gate·selected-set tuple·occurrence/batch·sequence_nodes ordering, 신규 내부 API 4개, Session Budget mode, NEW_GRAMMAR payload와 capacity-race client retry를 adjudicate. 외부 API 5 불변·내부 17→21·전체 22→26, DB migration 없음, §9 미PASS 및 Conversation Engine 범위 밖을 기록 |
| 1.21 | 2026-07-19 | AC-014 wording correction addendum — 신규 API 4개 입력 필드 전부 required 확정, positional signature의 omitted/explicit undefined→MISSING_REQUIRED_FIELD·explicit null/wrong-type→CONTRACT_VIOLATION·필드별 형식(OUT_OF_RANGE_VALUE)·존재성(INVALID_ID) 오류 정밀화, 중복 ID lookup 정규화 및 부분 결과 반환 금지를 additive하게 기록. §AC-014 기존 본문·API 총수 26·상태(RESOLVED/NOT STARTED)·get_active_learning_count(AC-013) validation·Tier A 문서 전부 불변 |
| 1.22 | 2026-07-19 | AC-014 read API 독립 리뷰 APPROVE 및 main integration 기록 — 원본 implementation `bfb6c42`, main cherry-pick `17de0fb`, BLOCKER/CRITICAL/MAJOR/MINOR 0건. Baseline `29688270347` 97/97 PASS·21 suites, implementation `29688678717` 및 final validation `29688802913` 각각 125/125 PASS·26 suites(PostgreSQL 16.14 / Node.js 20.20.2), 신규 tests 28개를 기록. F-01/F-02는 non-blocking NOTE이며 read API 4개 milestone 승인 후에도 AC-014 전체 prerequisite 상태는 RESOLVED / IN PROGRESS, §9 미PASS로 유지 |
| 1.23 | 2026-07-19 | AC-015 Interleaving Graph metadata dependency clarification 사용자 승인 — Tier C Architecture Clarification RESOLVED / Prerequisite Implementation NOT STARTED. 신규 내부 API `get_node_language_and_concepts`(Owner: Graph Engine, Caller: Interleaving Engine만, 동적 map 출력, mixed-language 미판정)를 확정하고, `sequence_nodes`의 dedupe·permutation 이전 원본 occurrence 길이 기준 `max_batch_size` 초과 시 `OUT_OF_RANGE_VALUE` 거부(engineConfig 참조, 하드코딩 금지)를 기록. 외부 API 5 불변·내부 21→22·전체 26→27, 신규 error code 없음, DB migration·engineConfig.js 변경 없음, AC-014 본문·상태와 Tier A `GRAMMAR_GRAPH.md` 원문 전부 불변, §9 미PASS를 기록 |
| 1.24 | 2026-07-20 | AC-015 independent review APPROVE WITH NON-BLOCKING NOTES 및 main integration 기록 — 원본 implementation `b0e368b`→main `7eb02cd`, 원본 correction `aea971d`→main `46edac1`, 전 심각도 0건. Canonical `E,D,F`가 `D,E,F`보다 shared-category penalty 1이 낮아 test oracle만 정정했음을 확인. Baseline `29704547463` 125/125·26 suites, correction `29704796941` 및 final `29704854809` 150/150·32 suites(PostgreSQL 16.14 / Node.js 20.20.2, 신규 tests 25 / suites 6)를 기록. F-01~F-04는 non-blocking이며 AC-014/AC-015 RESOLVED / IN PROGRESS, Learning Flow 후속, §9 미PASS 상태 유지 |
| 1.25 | 2026-07-20 | AC-016 `start_session` exact output payload 사용자 승인 — Tier C Architecture Clarification RESOLVED / Prerequisite Implementation NOT STARTED. JavaScript positional signature, REVIEW `review_batch`, 기존 NEW_GRAMMAR `{next_action,node_id}`, INTERLEAVING `node_sequence`, CONVERSATION/IDLE `next_action` 단독 payload와 exact-key·field omission·fallthrough·acknowledgement validation을 확정. `CLIENT_BRIEF.md`/`VALIDATION_LEVEL3.md` 보존 명칭을 API_CONTRACT SSOT에 반영하고 외부 5·내부 22·전체 27, DB/Tier A 불변, AC-014/AC-015 IN PROGRESS, 구현 READY·§9 미PASS를 기록 |
| 1.26 | 2026-07-21 | AC-016 independent review **APPROVE WITH NON-BLOCKING NOTES** 및 main integration 기록 — 원본 implementation `d6d5320`→main `fff9d93`, 필수 correction `860d9dd`→main `33a36de`, BLOCKER/CRITICAL/MAJOR 0건. F-01·F-03~F-05 NOTE와 F-02 non-blocking MINOR를 보존하고, validation Actions `29746928577` 150/150·32 suites, `29747762577` 175/183, `29747972286` 및 `29748289860` 183/183·39 suites(PostgreSQL 16.14 / Node.js 20.20.2)를 기록. Workflow/evidence commit은 main에서 제외했으며 AC-014/015/016은 RESOLVED / IN PROGRESS, IMPLEMENTED·CLOSED·§9 PASS 미선언 상태로 유지 |
| 1.27 | 2026-07-22 | VL3 §9 client boundary 독립 리뷰 및 post-merge verification 기록 — verdict **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/CRITICAL/MAJOR 0건, client main implementation `910835a`, main evidence `83b3fa5`, validation implementation/evidence `c8cff69`/`3e7edb6`, post-merge workflow-only commit `18a028f`와 Actions run `29874075409` 191/191 PASS·40 suites(PostgreSQL 16.14 / Node.js 20.20.2, fail/cancelled/skipped/todo 0)를 additive evidence로 기록. Workflow 제외 tree가 main과 byte-identical이고 main에 temporary workflow가 없음을 확인했으며 F-1~F-7 non-blocking finding을 후속 후보/NOTE로 보존. AC-012/014/015/016 상태와 §9 미PASS 문구는 이 revision에서 변경하지 않음 |
