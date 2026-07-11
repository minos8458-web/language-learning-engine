# LANGUAGE_PACK_STANDARD.md
## Language Pack 공통 표준 (Tier A — Core Standard)

> VI_LANGUAGE_PACK.md와 EN_LANGUAGE_PACK.md가 거의 동일한 구조로 수렴한 것은 우연이 아니라 필연이다. 이 문서는 그 필연을 명문화해, 앞으로 모든 Language Pack(JA/ZH 포함)이 목차·검증·금지 사항을 매번 새로 발명하지 않고 이 표준 하나를 따르게 한다.

문서 계층: Tier A(CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, LEARNING_PROTOCOL, CONTENT_SCHEMA, PROGRESS_SCHEMA, VOCABULARY_SCHEMA, **LANGUAGE_PACK_STANDARD**) → Tier B(VI/EN/JA/ZH_LANGUAGE_PACK) → Tier D(VI/EN/JA/ZH_CONTENT)

---

## 0. 문서의 지위

- 모든 Tier B(Language Pack) 문서는 이 표준을 따른다. VI/EN_LANGUAGE_PACK.md는 이 문서 확정 후 패치 대상이다.
- 이 문서는 특정 언어의 문법 내용을 다루지 않는다 — 오직 **구조·절차·경계**만 정의한다.

---

## 1. 목적

VI/EN 두 Language Pack에서 반복적으로 나타난 세 가지 문제를 해소한다.

1. **목차가 매번 즉흥적으로 결정됨** — VI에서 정한 목차를 EN이 그대로 베꼈을 뿐, 표준으로 명문화된 적이 없었다.
2. **검증 체크리스트·금지 사항이 문서마다 글자 그대로 중복** — 하나가 바뀌면 나머지가 따라가지 못하는 위험(IDENTIFIER_STANDARD 신설 이전의 ID 규칙과 동일한 문제).
3. **목표 시나리오가 표준 챕터로 존재하지 않아 EN에서는 아예 누락됨** — 검증 중에야 발견됨(VALIDATION_REPORT_EN_v1.0 §3.2).

---

## 2. Language Pack의 책임 경계

| Language Pack이 **정의하는 것** | Language Pack이 **정의하지 않는 것** |
|---|---|
| Concept 매핑(기존 Concept 재사용 우선, 필요 시 CONCEPT_SCHEMA §11 Tier B 절차로 확장) | Content 본문(텍스트/오디오/이미지) — Tier D 소관 |
| Grammar Node(구조, Concept 참조, difficulty, surface_forms) | Learning Policy(세션 구성, Session Budget, 진입 조건) — LEARNING_PROTOCOL.md 소관 |
| Grammar Relation(Prerequisite/Related/Contrast/Alternative) | Progress 구조(State Model, Confidence 등) — PROGRESS_SCHEMA.md 소관 |
| Vocabulary Entry 인스턴스(VOCABULARY_SCHEMA §9) | Review/Cascade 알고리즘 — GRAMMAR_GRAPH.md 소관 |
| Required Content ID 목록(무엇이 필요한지) | Engine 계약(입출력, 호출 경계) — ENGINE_INTERFACE.md/API_CONTRACT.md 소관 |
| Learning Outcome Scenario(6장) | Validation 절차 자체(따르기만 하며 새로 정의하지 않음) — VALIDATION_FRAMEWORK.md 소관 |

**판단 기준**: "이것이 언어마다 달라지는가?"가 예이면 Language Pack의 책임이고, "언어와 무관하게 항상 같은가?"가 예이면 Tier A(또는 Tier C) 문서의 책임이다.

---

## 3. 필수 문서 구조 (표준 챕터 템플릿)

모든 Language Pack은 아래 순서를 따른다.

| 장 | 제목 | 비고 |
|---|---|---|
| 0 | 문서의 지위 | Tier B 선언, 예외 발생 이력(Tier B/C 확장) 기록 |
| 1 | 목적 및 범위 | "최소 회화 가능 세트" 원칙 재확인 |
| 2 | 사용된 Universal Concept 목록 | 신규 Concept은 근거와 함께 별도 표시 |
| 3 | Concept 커버리지 개관 | Category별 노드 수, 언어 간 차이의 설계 노트 |
| 4 | Grammar Node 카탈로그 | 5장 형식 규칙 준수 |
| 5 | Relation 카탈로그(전체 통합) | 마스터 카탈로그, §4 노드별 표와 반드시 일치 |
| **6** | **Learning Outcome Scenario** | **신규 표준 챕터, 4장 참조** |
| 7 | Vocabulary Mapping | 이 언어팩이 정의하는 Vocabulary Entry 목록 |
| 8 | Required Content 목록 | Content ID·타입만, 본문 없음(Tier D 위임) |
| 9 | Language Pack Version Policy | 9장 정책을 이 언어에 적용한 계획 |
| 10 | 검증 체크리스트 | 10장을 그대로 참조, 언어별 추가 항목만 개별 명시 |
| 11 | 금지 사항 | 11장을 그대로 참조, 언어별 추가 항목만 개별 명시 |
| 12 | 개정 이력 | |

---

## 4. Grammar Node/Relation 카탈로그 형식 규칙

VI/EN에서 이미 수렴한 형식을 표준으로 고정한다.

- Grammar Node는 **정의**(ID/Concept/Label/Difficulty/Surface Forms) 표와 **관계·콘텐츠**(Prerequisite/Related/Contrast/Alternative/설명 콘텐츠 ID/예문 콘텐츠 ID) 표 두 개로 나눠 표기한다.
- §5 마스터 Relation 카탈로그와 §4 노드별 관계 칸은 **반드시 일치**해야 한다(VI FAIL-4, EN 발견-1이 같은 유형의 실수였다 — 표준화로 재발 방지).
- 같은 표면 형태, 다른 기능은 별도 노드(GRAMMAR_SCHEMA §1), 같은 기능의 다른 실현형은 하나의 노드 안 여러 `surface_forms`(EN_LANGUAGE_PACK §3.1에서 확립).

---

## 5. Concept 매핑 규칙

- 기존 Concept으로 표현 가능하면 그대로 재사용한다(신규 Concept 추가는 예외이지 기본 경로가 아니다, CONCEPT_SCHEMA §11).
- 신규 Concept이 필요하면 **왜 기존 Concept으로 부족한지**를 §2에 명시하고 CONCEPT_SCHEMA §11의 해당 Tier 절차를 따른다.
- 새 Category(Tier C) 추가는 언어 하나만의 필요로 정당화되지 않는다 — 최소 두 언어 이상에서 반복되는 현상일 때만 검토한다(PRAGMATICS 사례가 그랬듯).

---

## 6. Learning Outcome Scenario (신규 표준 챕터)

**명칭 확정: "Learning Outcome Scenario."** "Acceptance Scenario"(QA 용어, 통과/실패 뉘앙스)보다 이 프로젝트의 철학("Correctness < Learning Effect")에 부합하는 교육과정 설계 용어를 택한다. VALIDATION_FRAMEWORK §5의 Acceptance 판정 기능은 이름과 무관하게 그대로 유지된다 — 이 챕터가 그 판정의 근거 자료라는 관계는 변하지 않는다.

**요구사항**: 이 Language Pack의 노드만으로 실제 수행 가능한 대화 상황을 **최소 4개** 구체적 문장으로 제시한다. 각 시나리오는 필요한 Grammar Node를 명시하고, Vocabulary 영역(문법 밖 어휘 선택)은 별도로 표시한다.

**형식**:

| 시나리오 | 필요 Grammar Node | Vocabulary 영역(참고) |
|---|---|---|
| (예문) | (Node ID 목록) | (문법 밖 어휘가 있다면) |

이 챕터가 없으면 VALIDATION_FRAMEWORK §5의 "최소 회화 가능 세트" 판정을 검증자가 즉석에서 지어내야 한다(EN v1.0에서 실제로 발생) — 이는 재현 불가능한 검증이므로 금지한다(11장).

---

## 7. Vocabulary Mapping

- 이 언어팩이 정의하는 Vocabulary Entry(VOCABULARY_SCHEMA.md 구조를 따르는 실제 인스턴스) 목록을 표로 제시한다.
- Grammar Node의 Irregular Surface Form(VOCABULARY_SCHEMA §5)을 실제로 채우는 Entry는 반드시 이 장에 등재한다.
- Vocabulary Entry가 필요 없는 언어팩(모든 문법이 불변 표지뿐인 경우)은 이 장에 "해당 없음"과 근거를 명시한다.

---

## 8. Required Content 목록

- Content ID와 `content_type`만 나열한다. **본문(`media_assets`)은 이 문서에 두지 않는다** — Tier D 문서(`{LANG}_CONTENT.md`)의 책임이다.
- `(TBD)` 표시로 아직 본문이 없는 항목을 명확히 구분한다.

---

## 9. Language Pack Version Policy

| 버전 유형 | 트리거 | 예 |
|---|---|---|
| **Minor(v1.0→v1.1)** | 기존 Concept 재사용 범위 내에서 노드·관계 추가, PENDING 해결, 버그 수정 | EN v1.0→v1.1(SUBJECT_AUX_INVERSION 추가) |
| **Major(v1.x→v2.0)** | 학습자가 도달하는 **새로운 능력 단계**(예: 생존 회화 → 일상 대화 → 추상적 논의, CEFR 단계 이동에 준함) 또는 새 Concept Category(Tier C) 도입 | (아직 사례 없음) |

**원칙**: 버전 증가는 "노드를 몇 개 추가했는가"가 아니라 "학습자가 새로 무엇을 할 수 있게 되는가"를 기준으로 판단한다 — 이는 이 문서 전체가 Correctness보다 Learning Effect를 우선하는 것과 같은 정신이다.

---

## 10. 공통 검증 체크리스트 (모든 Language Pack 공통)

- [ ] `concept_ids`가 최소 1개 이상 존재하는가
- [ ] 참조한 Concept이 실제로 존재하는가
- [ ] `PREREQUISITE` 그래프에 순환이 없는가
- [ ] `PREREQUISITE`는 `UNIDIRECTIONAL`인가
- [ ] Content/Relation ID에서 SLUG의 언더스코어를 임의로 생략하지 않았는가
- [ ] §4 노드별 관계 표와 §5 마스터 Relation 카탈로그가 정확히 일치하는가
- [ ] 같은 표면 형태라도 기능이 다르면 별도 노드로 분리했는가
- [ ] 같은 기능의 다른 실현형을 별도 노드로 쪼개지 않았는가
- [ ] **6장 Learning Outcome Scenario가 최소 4개 이상 존재하는가**
- [ ] Vocabulary Validation(VOCABULARY_SCHEMA §10) — 규칙형을 Vocabulary에 중복 저장하지 않았는가
- [ ] Required Content 목록에 본문을 직접 기입하지 않고 Tier D를 참조했는가

언어별 특수 검증 항목은 각 Language Pack 문서의 §10에 이 목록에 **추가하는 형태로만** 적는다(대체 금지).

---

## 11. 공통 금지 사항 (모든 Language Pack 공통)

- 이 문서가 정의한 표준 챕터 순서를 임의로 바꾸는 것
- 2장의 책임 경계를 넘어 Content 본문·Learning Policy·Progress 구조·Review 로직을 Language Pack 문서에 직접 정의하는 것
- Learning Outcome Scenario 챕터 없이 "최소 회화 가능"을 주장하는 것
- 언어 하나만의 필요로 새 Concept Category(Tier C)를 만드는 것(5장 위반)
- 다른 Language Pack과 형식이 다른 독자적 표·필드를 임의로 도입하는 것
- 규칙으로 계산 가능한 형태를 Vocabulary Mapping(7장)에 저장하는 것(VOCABULARY_SCHEMA §10 위반)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — Language Pack 책임 경계 정의, 표준 챕터 템플릿(0~12) 확정, Learning Outcome Scenario 신규 챕터(명칭 확정, "Acceptance"보다 교육과정 용어 우선), Vocabulary Mapping/Required Content 챕터 신설, Version Policy(Minor/Major 기준을 학습자 능력 단계로 정의), VI/EN에 중복되어 있던 검증 체크리스트·금지 사항을 공통 표준으로 흡수 |
