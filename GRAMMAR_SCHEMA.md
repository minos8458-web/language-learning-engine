# GRAMMAR_SCHEMA.md
## Grammar Node 데이터 표준
> 이 문서는 CONCEPT_SCHEMA.md의 하위 문서이며, Grammar Graph·Review Engine·AI Tutor·Conversation Engine·Language Pack이 공통으로 참조하는 **문법 데이터의 SSOT**다.

문서 계층: `PROJECT_VISION.md` → `LEARNING_THEORY.md` → `CONCEPT_SCHEMA.md` → **`GRAMMAR_SCHEMA.md`** → `GRAMMAR_GRAPH.md`

이 문서는 단순 필드 나열이 아니라, 각 필드마다 **목적 → 제약 조건 → 사용 규칙 → 예시 데이터**를 함께 제공한다.

---

## 0. 문서의 지위

### 핵심 원칙 (상위 문서로부터 상속·재확인)

- Grammar Node는 **정적 정의**이며, 사용자별 진행 상태를 스스로 담지 않는다 (LEARNING_THEORY C1).
- 모든 Grammar Node는 **최소 1개의 Universal Concept을 참조**해야 한다 (CONCEPT_SCHEMA 핵심 원칙).
- Concept → Grammar Node 방향의 역참조는 저장하지 않는다. 참조는 항상 **Grammar Node → Concept** 단방향이다 (CONCEPT_SCHEMA §8).
- 사용자 진행 상태(6단계 State, Accuracy/Confidence/Response Time)는 Grammar Node와 별도로, **PROGRESS_SCHEMA.md(Tier A)가 유일한 출처인 Progress 엔터티**에 저장한다.
- AI 생성에 사용 가능한 노드는 **Practicing 이상**이며, 둘 이상을 조합할 때는 **전원이 개별적으로 이 기준을 충족**해야 한다 (LEARNING_THEORY C10).

이 문서는 두 개의 엔터티를 정의한다: **Grammar Node**(정적, 문법 구조), **Grammar Relation**(노드 간 관계). Content는 CONTENT_SCHEMA.md, User Grammar Progress는 PROGRESS_SCHEMA.md가 각각 유일한 출처다.

---

## 1. 문법 노드 고유 식별 체계 (ID 규칙)

**ID 형식·SLUG 생성 규칙·불변성 원칙의 유일한 출처는 IDENTIFIER_STANDARD.md §3이다.** 이 절은 빠른 참조용 요약이다.

**형식**: `GRAMMAR_{LANGUAGE}_{SLUG}` (대문자 스네이크 케이스)

| 목적        | 언어별로 무한히 늘어날 Grammar Node를 충돌 없이 식별하고, ID만 보고도 어떤 언어 소속인지 즉시 알 수 있게 한다                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| **제약 조건** | `LANGUAGE`는 ISO 639-1 코드(예: `VI`, `EN`, `JA`)를 사용한다. ID는 발행 후 불변이다(CONCEPT_SCHEMA §2와 동일 원칙). 같은 언어 안에서 `SLUG`는 유일해야 한다 |
| **사용 규칙** | Grammar Graph, Progress 레코드, 생성 엔진 로그 등 모든 곳에서 이 ID로만 노드를 참조한다. 사람이 읽는 이름은 별도의 `label` 필드가 담당하며 ID 자체에 의미를 과도하게 담지 않는다   |
| **예시**    | `GRAMMAR_VI_DA` (베트남어 "đã"), `GRAMMAR_EN_PAST_SIMPLE`, `GRAMMAR_JA_TA`                                                   |

---

## 2. Universal Grammar Concept과의 연결 구조

| 필드        | `concept_ids`                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**    | 이 Grammar Node가 어떤 언어 중립 개념(들)을 표현하는지 명시. Concept Schema §8의 `expressed_by` 관계를 실제 데이터로 구현하는 필드                                                                                                          |
| **타입**    | `array<string>` (Concept ID 목록)                                                                                                                                                                          |
| **제약 조건** | 최소 1개 이상 필수. 존재하지 않는 Concept ID 참조 금지. Concept 쪽에는 이 역참조를 저장하지 않는다(단방향)                                                                                                                                  |
| **사용 규칙** | Coverage/Depth 계산(CONCEPT_SCHEMA §10) 시 "이 언어·이 Concept에 속한 전체 Grammar Node"를 조회하려면, 모든 Grammar Node의 `concept_ids`를 언어별로 인덱싱해 역방향 조회를 지원해야 한다. 이 인덱스는 저장 데이터가 아니라 조회 시점에 계산되거나 캐시되는 파생 구조여야 한다 (Concept 엔터티 자체를 수정하지 않기 위함) |
| **예시**    | `"concept_ids": ["CONCEPT_TENSE_PAST"]`                                                                                                                                                                  |

---

## 3. 언어별 Grammar 표현 방식 (Language Pack Mapping)

| 필드        | `language`, `label`, `surface_forms`                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| **목적**    | `language`는 이 노드가 속한 언어를 명시하고, `label`은 사람이 읽는 이름을, `surface_forms`는 이 문법이 실제 문장에서 취할 수 있는 표면 형태(활용형·이형태) 예시를 제공한다 |
| **제약 조건** | `language`는 ID의 `{LANGUAGE}`와 반드시 일치해야 한다. `surface_forms`는 최소 1개 이상 권장(0개면 이후 콘텐츠 생성 시 예문을 만들 근거가 없음)             |
| **사용 규칙** | `surface_forms`는 Review Engine의 "표층 변주 원칙"(LEARNING_THEORY §4-5)이 서로 다른 어휘·문맥에 이 문법을 대입할 때 형태적 기준으로 사용된다          |
| **예시**    | `"language": "VI", "label": "đã (과거 시제 표지)", "surface_forms": ["đã"]`                                              |

**Content 엔터티 (확정: 별도 엔터티로 분리) — 상세 정의는 CONTENT_SCHEMA.md로 이관됨**

Grammar Node는 "무엇을 표현하는가"만 담당하고, "어떻게 가르칠 것인가"는 전적으로 별도의 **Content 엔터티**가 담당한다. **Content Entity의 전체 필드 정의(content_type/media_assets/source 3축, Type-specific Metadata, Validation 규칙 등)는 CONTENT_SCHEMA.md(Tier A)가 유일한 출처다.** 이 절에서는 Grammar Node와의 관계만 재확인한다.

**참조 방향**: `Content.grammar_node_ids → Grammar Node.id` (단방향, CONTENT_SCHEMA §7 참조. 하나의 Content가 여러 Grammar Node를 참조할 수 있어 배열이다). Grammar Node는 자신에게 연결된 Content 목록을 저장하지 않는다. Concept ↔ Grammar Node의 단방향 원칙(CONCEPT_SCHEMA §8)과 동일한 이유다 — 콘텐츠는 문법 구조보다 훨씬 자주, 훨씬 많이 추가되므로, Grammar Node가 그 목록을 들고 있으면 콘텐츠를 추가할 때마다 핵심 구조 데이터를 건드리게 된다.

**Content ID 형식의 유일한 출처는 IDENTIFIER_STANDARD.md §5이다.**

---

## 4. User Grammar Progress — 상세 정의는 PROGRESS_SCHEMA.md로 이관됨

**State Model(6단계), Confidence & Attempt History, Review Scheduling, Derived Metrics를 포함한 User Learning State의 전체 정의는 PROGRESS_SCHEMA.md(Tier A)가 유일한 출처다.**

이 문서(GRAMMAR_SCHEMA.md)는 아래 두 가지만 재확인한다.

- Grammar Node는 **정적 엔터티**이며 사용자 진행 상태를 스스로 담지 않는다(0장 핵심 원칙).
- Progress 레코드는 `(user_id, node_id)` 복합 키로 Grammar Node를 참조한다(단방향, PROGRESS_SCHEMA §8).

7장(Grammar Combination 규칙)의 `state IN (PRACTICING, MASTERED, AUTOMATIC)` 조건은 PROGRESS_SCHEMA §3이 정의한 State Model을 그대로 참조한다.

---

## 6. Prerequisite 및 Related Grammar 관계 정의

**Grammar Relation 엔터티 (확정: 별도 엔터티로 분리)**

**Relation ID 형식의 유일한 출처는 IDENTIFIER_STANDARD.md §6이다.**

LLE는 단순한 문법 데이터베이스가 아니라 Grammar Graph 엔진이므로, Grammar Node(문법 자체의 정의)와 Grammar Relation(문법 간의 관계)을 명확히 분리한다.

**참조 방향**: Relation은 독립 레코드로 존재하며 `from_node_id`, `to_node_id`로 두 Grammar Node를 가리킨다. Grammar Node는 자신과 연결된 Relation 목록을 저장하지 않는다 — Content, Concept과 동일한 이유(핵심 구조를 자주 변하는 주변 데이터로부터 보호).

**Grammar Relation 필드**

| 필드                 | 목적             | 제약 조건                                                                                                                                                                                                    |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | 고유 식별자         | 발행 후 불변                                                                                                                                                                                                  |
| `from_node_id`     | 관계의 출발 노드      | 필수, 존재하는 Grammar Node여야 함                                                                                                                                                                                |
| `to_node_id`       | 관계의 도착 노드      | 필수, 존재하는 Grammar Node여야 함. `from_node_id`와 동일할 수 없음(자기참조 금지). **`from_node_id`가 참조하는 Grammar Node의 `language`와 반드시 동일해야 함(same-language invariant — AUD-003, Frozen Core Standard Amendment, 2026-07-13)** |
| `relation_type`    | 관계 종류          | `PREREQUISITE`(선행) \| `RELATED`(관련) \| `CONTRAST`(대조) \| `ALTERNATIVE`(대체 가능) 중 하나                                                                                                                       |
| `direction`        | 단방향/양방향 여부     | `UNIDIRECTIONAL` \| `BIDIRECTIONAL`. **[제약] `relation_type = PREREQUISITE`는 항상 `UNIDIRECTIONAL`이어야 한다** — 양방향 선행 관계는 순환(cycle)을 만들어 "선행 학습"이라는 개념 자체를 무너뜨리기 때문이다. `RELATED`/`CONTRAST`/`ALTERNATIVE`는 기본값 `BIDIRECTIONAL`이며, 비대칭적인 예외 상황에서만 `UNIDIRECTIONAL`로 지정한다 |
| `weight` (선택)      | 관계의 강도·우선순위    | `float`, 생략 시 균등 가중치로 취급. Review Engine의 교차 강제·복습 캐스케이드에서 "더 강하게 연결된 노드부터" 처리하는 데 쓰일 수 있음(정확한 활용 로직은 GRAMMAR_GRAPH.md에서 정의)                                                                             |
| `description` (선택) | 관계에 대한 설계자용 메모 | 자유 텍스트, 사용자에게 노출되지 않음                                                                                                                                                                                    |

**relation_type 정의**

- `PREREQUISITE`: A를 배우기 전에 B가 선행되어야 함
- `RELATED`: 함께 다루면 학습에 도움이 되는 관계 (CONCEPT_SCHEMA §7과 동일 개념의 Grammar Node 레벨 적용)
- `CONTRAST`: 형태·의미가 혼동되기 쉬워 의도적으로 교차 연습해야 하는 관계
- `ALTERNATIVE`: 같은 문맥에서 상호 교체 가능한 표현 관계 (신규 — Concept 레벨에는 없던 Grammar Node 전용 관계 유형. 같은 Concept을 구현하는 여러 표현이 실제로 대체 가능한지를 나타내기 위해 필요)

**정합성 제약**: 어떤 언어의 Grammar Node A가 Concept X를, Node B가 Concept Y를 구현하고 CONCEPT_SCHEMA §6에 따라 Concept X가 Concept Y의 선행 조건이라면, Node A와 Node B 사이에도 `PREREQUISITE` 관계가 성립해야 한다. 이 정합성은 Grammar Graph 설계·검증 단계에서 강제한다.

**Same-language invariant (AUD-003, Frozen Core Standard Amendment, 2026-07-13)**: `from_node_id`와 `to_node_id`가 참조하는 두 Grammar Node의 `language`는 **반드시 동일**해야 한다. `PREREQUISITE`·`RELATED`·`CONTRAST`·`ALTERNATIVE` **4종 전부**에 예외 없이 적용된다.

- **근거**: Grammar Node ID 형식(`GRAMMAR_{LANGUAGE}_{SLUG}`, 1장)이 언어를 노드 정체성의 일부로 이미 인코딩하고 있고, `GRAMMAR_GRAPH.md` §2가 언어별 서브그래프를 "language 일치 view"로 정의한다 — Grammar Relation은 language-specific graph level의 관계이며, 이 서브그래프 개념이 성립하려면 관계 저장 단계에서부터 same-language여야 한다.
- **Cross-language pedagogical mapping과의 관계**: 언어 중립적 연결(예: "이 4개 언어 모두 능력을 이렇게 표현한다")이 필요하면 이는 **이미 존재하는 Universal Concept layer**(2장, `concept_ids`)로 처리한다 — 새로운 cross-language relation 엔터티를 만들지 않는다. 예: `CONCEPT_MODALITY_ABILITY`는 VI/EN/JA/ZH 4개 언어의 능력 표현 노드가 이미 공유하는 언어 중립 개념이다.
- **집행(3중 논리 방어, DB hard constraint 없음)**: ① 이 절의 invariant(저작 시 준수 규칙) ② `validate_language_pack`의 배포 전 정적 검증(`API_CONTRACT.md` §3.3, hard gate) ③ Graph Engine traversal의 runtime defense-in-depth(`GRAMMAR_GRAPH.md` §3). DB trigger·중복 `language` 컬럼은 채택하지 않았다 — 현재 `grammar_relations` 스키마에는 `language` 컬럼이 없어(다른 테이블 `grammar_nodes`를 참조해야 판정 가능) 일반 CHECK 제약으로는 표현 불가능하고, trigger는 이 프로젝트가 지금까지 도메인 로직을 Engine 계층에 두고 DB는 저장·기본 참조무결성만 담당해온 스타일에서 벗어나는 첫 사례가 되어 채택하지 않았다.

**향후 활용**: Review Engine, AI Tutor, Grammar Graph는 모두 이 Relation 엔터티를 기반으로 탐색하도록 설계한다 (예: 복습 실패 시 `PREREQUISITE` 역방향 탐색, Interleaving 구성 시 `CONTRAST` 관계 우선 샘플링).

**예시**

```
{
  "id": "REL_VI_DA_PREREQ_DANGXONG",
  "from_node_id": "GRAMMAR_VI_DANG_XONG",
  "to_node_id": "GRAMMAR_VI_DA",
  "relation_type": "PREREQUISITE",
  "direction": "UNIDIRECTIONAL",
  "weight": 0.8,
  "description": "완료상 표현은 기본 과거 표지 학습 이후 도입"
}
```

---

## 7. Grammar Combination 규칙 (스키마 레벨)

이 절은 LEARNING_THEORY C10을 스키마가 검증 가능한 형태로 명세한다.

| 항목              | 정의                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| **생성 후보 조회 조건** | `state IN (PRACTICING, MASTERED, AUTOMATIC)`인 Progress 레코드에 대응하는 Grammar Node만 후보 집합에 포함                            |
| **조합 검증 규칙**    | 생성 엔진이 둘 이상의 노드를 조합하려 할 때, 선택된 노드 집합의 **모든 원소**가 위 조회 조건을 통과해야 한다. 하나라도 실패하면 그 조합 전체를 기각한다                          |
| **후속 설계 참고**    | Practicing 노드가 조합 내 다수를 차지하지 않도록 비율을 제한하는 규칙은 이 문서에서 확정하지 않고 GRAMMAR_GRAPH.md에서 다룬다(LEARNING_THEORY §7 후속 참고 재확인) |

**예시 — 유효한 조합 후보 집합**

```
{
  "language": "VI",
  "candidate_node_ids": ["GRAMMAR_VI_DA", "GRAMMAR_VI_DANG"],
  "all_states": ["MASTERED", "PRACTICING"],
  "valid_for_generation": true
}
```

---

## 8. AI가 반드시 지켜야 하는 생성 제약

생성 엔진(향후 AI Tutor / Conversation Engine 설계 문서에서 상세화)이 이 Schema를 참조할 때 지켜야 할 데이터 계약이다.

| 필드        | `target_concept_id` (선택)                                           |
| --------- | ------------------------------------------------------------------ |
| **목적**    | 특정 Concept 연습을 목표로 생성을 요청할 때 사용                                    |
| **제약 조건** | 지정 시, 최종 생성물은 반드시 이 Concept을 `concept_ids`에 포함하는 노드를 최소 1개 사용해야 한다 |

| 필드        | `candidate_node_ids`                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| **목적**    | 7장 규칙을 통과한, 생성에 사용 가능한 노드 집합                                                                 |
| **제약 조건** | 이 목록에 없는 노드는 생성 로직이 절대 참조할 수 없다. Not Introduced/Introduced/Studying 노드는 이 목록에 원천적으로 포함되지 않는다 |

| 필드     | `language`                             |
| ------ | --------------------------------------- |
| **목적** | 생성 대상 언어 명시. 후보 노드는 항상 이 언어에 속한 노드로 한정 |

---

## 9. 확장성 규칙 (새 언어 추가 시 수정 범위)

CONCEPT_SCHEMA §11과 동일한 3단계 원칙을 Grammar Schema에도 적용한다.

| 단계        | 행위                                               | Schema 수정 여부             | 승인 절차                                   |
| --------- | ------------------------------------------------ | ------------------------ | --------------------------------------- |
| A (기본 경로) | 새 언어의 Grammar Node·Relation **레코드** 추가           | 없음 (필드 구조는 그대로, 데이터만 추가) | 불필요                                     |
| B (예외)    | 기존 필드로 표현 불가능한 언어 특성 발견 (예: 성조, 분류사 전용 속성)       | 새 필드 추가 (기존 필드 변경·삭제 없음) | 어떤 현상이 기존 필드로 설명 불가능한지 근거 문서화 → 승인      |
| C (구조 변경) | 엔터티 자체(Grammar Node/Relation/Progress)의 근본 구조 변경 | 이 문서의 개정                 | PROJECT_VISION §6 의사결정 원칙 준용, 최고 수준 승인 |

베트남어 파일럿에서 B가 반복적으로 발생한다면, 이는 현재 필드 설계가 다른 언어를 충분히 예견하지 못했다는 신호로 간주하고 재검토한다.

---

## 10. 금지 사항 (Schema 위반 구현)

- Grammar Node를 `concept_ids` 없이 정의하는 것
- 사용자 진행 상태(6단계 State, Accuracy, Confidence 등)를 Grammar Node 정적 엔터티에 저장하는 것 (C1 위반)
- Practicing 미만 노드를 생성 후보(`candidate_node_ids`)에 포함하는 것, 또는 조합 중 일부만 기준을 충족해도 되는 것처럼 취급하는 것 (7장 위반)
- 언어별 특수 사정을 이유로 Grammar Node/Relation의 핵심 필드명·타입을 변경하는 것 (다른 언어 Pack과의 호환성 파괴)
- Grammar Node ID를 발행 후 변경하는 것
- **cross-language `PREREQUISITE`/`RELATED`/`CONTRAST`/`ALTERNATIVE` 관계를 적재하는 것 — `from_node_id`·`to_node_id`의 `language`가 다른 Grammar Relation을 생성하는 것 (AUD-003, 6장 same-language invariant 위반)**

**Progress 관련 금지 사항(recent_attempts 크기 제한, confidence_calibration_delta 근거 요건 등)은 PROGRESS_SCHEMA.md §11이 유일한 출처다.**

---

## 11. 개정 이력

| 버전  | 날짜         | 변경 내용                                                                                                                                                                                                    |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | 2026-07-05 | 목차 승인                                                                                                                                                                                                    |
| 1.0 | 2026-07-05 | 본문 최초 작성 — ID 규칙, Concept 연결 구조, Language Pack Mapping, State/Mastery/Confidence 필드, Prerequisite/Related 관계, Combination 규칙, AI 생성 제약, 확장성 규칙, 금지 사항 정의. 설명 콘텐츠 저장 위치와 Relation 표현 방식 승인 대기             |
| 1.1 | 2026-07-05 | 설명 콘텐츠 저장 위치 확정 — 별도 Content 엔터티로 분리(단방향 참조 Content→Grammar Node). Content 필드 스키마 및 예시 추가. Relation 표현 방식은 아직 승인 대기                                                                                      |
| 1.2 | 2026-07-05 | Grammar Relation 엔터티 확정 — 별도 엔터티로 분리. 필드: id/from_node_id/to_node_id/relation_type/direction/weight/description. relation_type에 ALTERNATIVE 추가. PREREQUISITE는 항상 UNIDIRECTIONAL 강제. GRAMMAR_SCHEMA.md 모든 PENDING 항목 해소 |
| 1.3 | 2026-07-05 | GRAMMAR_GRAPH.md의 오답 원인 분류 결정(Self/Transfer 이분법, 확장 가능 구조)을 반영해 AttemptRecord에 `error_category`(SELF\|TRANSFER\|null), `error_subcategory`(예약 필드, MVP 미사용) 추가                                           |
| 1.4 | 2026-07-05 | Grammar Node/Content/Relation ID 규칙을 IDENTIFIER_STANDARD.md(신규 Tier A 문서)로 이관, 중복 제거. 각 절은 이제 형식만 요약 인용하고 세부 규칙은 IDENTIFIER_STANDARD.md를 유일한 출처로 참조                                                    |
| 1.5 | 2026-07-06 | Content Entity의 전체 정의(필드·content_type·Validation 등)를 CONTENT_SCHEMA.md(신규 Tier A 문서)로 완전 이관. `grammar_node_id`(단수)를 `grammar_node_ids`(배열)로 변경(DIALOGUE 등 다중 노드 참조 콘텐츠 지원). §3은 이제 참조 방향 재확인만 담당       |
| 1.6 | 2026-07-06 | User Grammar Progress의 전체 정의(State Model/Confidence/AttemptRecord/Review Scheduling/Derived Metrics)를 PROGRESS_SCHEMA.md(신규 Tier A 문서)로 완전 이관. §4는 이제 참조 방향 재확인만 담당. §10 금지 사항에서 Progress 관련 항목 제거(PROGRESS_SCHEMA §11로 이관). 문서가 정의하는 엔터티를 4개→2개(Grammar Node, Grammar Relation)로 재정정 |
| 1.7 | 2026-07-13 | Independent Architecture Audit(AUD-003), **Frozen Core Standard Amendment**(`CORE_STANDARD_V1_FREEZE.md` §5 절차 완료, 사용자 명시적 승인) — 6장 Grammar Relation 필드 표에 same-language invariant 추가(`from_node_id`·`to_node_id`가 참조하는 Grammar Node의 `language`가 반드시 동일). `PREREQUISITE`·`RELATED`·`CONTRAST`·`ALTERNATIVE` 4종 전부 적용. Cross-language pedagogical mapping은 기존 Universal Concept layer(2장)로 처리하며 새 엔터티를 만들지 않음을 명시. DB enforcement는 trigger·중복 컬럼·일반 CHECK 전부 기각하고 3중 논리 방어(Schema invariant + validate_language_pack + runtime traversal defense-in-depth) 채택. 10장 금지 사항에 cross-language relation 적재 금지 추가. `GRAMMAR_GRAPH.md`·`API_CONTRACT.md`·`ENGINE_INTERFACE.md`·`VALIDATION_LEVEL3.md`·`MIGRATION_GUIDE.md`(Entry 004)와 연동 |
