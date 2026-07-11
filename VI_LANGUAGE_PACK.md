# VI_LANGUAGE_PACK.md
## 베트남어 Language Pack v1.2

> 이 문서는 CONCEPT_SCHEMA.md(v1.4)와 GRAMMAR_SCHEMA.md(v1.3) 위에 베트남어 데이터를 얹는 **첫 Language Pack**이다. GRAMMAR_GRAPH.md의 엔진들이 실제로 작동할 데이터를 여기서 공급한다. **이 문서는 LANGUAGE_PACK_STANDARD.md의 표준 챕터 템플릿을 따른다.**

문서 계층: `PROJECT_VISION.md` → `LEARNING_THEORY.md` → `CONCEPT_SCHEMA.md` → `GRAMMAR_SCHEMA.md` → `GRAMMAR_GRAPH.md` → `LANGUAGE_PACK_STANDARD.md` → **`VI_LANGUAGE_PACK.md`** → `VI_CONTENT.md`(Tier D)

---

## 0. 문서의 지위

- 이 문서는 **Tier A 문서**다(GRAMMAR_SCHEMA §9). 원칙적으로 상위 Schema를 수정하지 않고 데이터만 추가한다. 작업 중 기존 Concept/필드로 표현 불가능한 현상을 발견하면(Tier B/C), 임의로 처리하지 않고 CONCEPT_SCHEMA.md/GRAMMAR_SCHEMA.md로 되돌아가 개정을 요청한다. 이번 문서에서 두 사례가 발생했다 — ① PRAGMATICS Category 신규 추가(Tier C, CONCEPT_SCHEMA.md 자체 개정 v1.3), ② `CONCEPT_MOOD_WHQUESTION` 신규 추가(Tier B, 기존 MOOD Category 내 Function 추가라 CONCEPT_SCHEMA.md는 수정하지 않고 이 문서에만 반영, v1.1).
- **Language-independent 관점 유지**: 이 문서에서 정의하는 모든 Grammar Node는 베트남어 고유의 구조를 담되, 그 상위의 Concept·필드 체계는 영어·일본어·중국어 Language Pack이 동일하게 재사용할 수 있어야 한다. 베트남어이기 때문에 필요한 특수 처리는 Grammar Node 데이터 안에만 존재해야 하며, Schema 구조 자체에 스며들면 안 된다.
- **범위 원칙**: "베트남어 전체 문법"이 아니라 **실제 회화가 가능한 최소 문법 세트(v1.0)**를 목표로 한다. 이 문서는 Living Document이며 이후 버전에서 점증 확장한다(7장).

---

## 1. 목적 및 범위

v1.0은 아래 두 가지만 만족하면 된다.

1. 10개 Concept Category 각각에 최소 1개 이상의 실사용 가능한 베트남어 Grammar Node가 있다.
2. 이 노드들만 조합해도 기본적인 실제 대화를 구성할 수 있다 — 구체적인 시나리오는 **6장 Learning Outcome Scenario**에서 정의한다(LANGUAGE_PACK_STANDARD §6).

**콘텐츠 작성 범위에 대한 전제**: 이 문서는 Grammar Node·Relation·Concept 참조 구조와 Content ID 체계까지만 확정한다. 모든 노드의 설명·예문 **전체 텍스트**를 여기서 완성하지는 않는다 — 구조를 보여주는 대표 노드 몇 개만 실제 텍스트를 채우고, 나머지는 동일한 ID 명명 규칙으로 자리만 만들어 두고 콘텐츠 제작 단계로 넘긴다(6장). 이는 "Architecture는 구조를, Content 제작은 텍스트를" 분리하는 프로젝트 원칙(GRAMMAR_SCHEMA §3)을 그대로 따른 것이다.

**IMPLEMENTATION_BRIEF_v0.1.md와의 관계**: 그 문서의 `GRAMMAR_VI_VUA_MOI`, `GRAMMAR_VI_DA_TUNG`은 2-hop Cascade 로직을 테스트하기 위해 만든 **구조 검증용 예시 데이터**였고, 이 문서의 "최소 회화 세트" 기준으로 재검토한 결과 v1.0 정식 카탈로그에는 포함하지 않는다(과거 시제의 뉘앙스 확장이라 최소 세트보다 상위 단계). `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`은 이 문서에서도 정식으로 채택하며 필드 값을 그대로 유지한다.

---

## 2. 사용된 Universal Concept 목록

베트남어가 실제로 사용하는 Concept 인스턴스 19개. Concept 간 Prerequisite/Relationship은 **v1.0에서는 비워둔다** — 언어 팩이 하나뿐인 지금 커리큘럼 차원의 Concept 간 관계까지 규정하는 것은 시기상조이며, 여러 언어의 패턴이 쌓인 뒤(9장 확장 원칙) 근거를 갖고 채운다.

| Concept ID | Category | Function | Difficulty |
|---|---|---|---|
| CONCEPT_TENSE_PAST | TENSE | PAST | 2 |
| CONCEPT_TENSE_FUTURE | TENSE | FUTURE | 2 |
| CONCEPT_ASPECT_PROGRESSIVE | ASPECT | PROGRESSIVE | 2 |
| CONCEPT_ASPECT_PERFECT | ASPECT | PERFECT | 3 |
| CONCEPT_MODALITY_ABILITY | MODALITY | ABILITY | 2 |
| CONCEPT_MODALITY_DESIRE | MODALITY | DESIRE | 1 |
| CONCEPT_MODALITY_NECESSITY | MODALITY | NECESSITY | 2 |
| CONCEPT_NEGATION_SIMPLE | NEGATION | SIMPLE | 1 |
| CONCEPT_NEGATION_NOTYET | NEGATION | NOTYET | 2 |
| CONCEPT_MOOD_INTERROGATIVE | MOOD | INTERROGATIVE | 1 |
| CONCEPT_MOOD_IMPERATIVE | MOOD | IMPERATIVE | 2 |
| CONCEPT_MOOD_WHQUESTION | MOOD | WHQUESTION | 2 |
| CONCEPT_QUANTITY_CLASSIFIER | QUANTITY | CLASSIFIER | 3 |
| CONCEPT_COMPARISON_COMPARATIVE | COMPARISON | COMPARATIVE | 2 |
| CONCEPT_COMPARISON_SUPERLATIVE | COMPARISON | SUPERLATIVE | 2 |
| CONCEPT_CONDITIONAL_SIMPLE | CONDITIONAL | SIMPLE | 3 |
| CONCEPT_VOICE_PASSIVE | VOICE | PASSIVE | 3 |
| CONCEPT_PRAGMATICS_POLITENESS | PRAGMATICS | POLITENESS | 2 |
| CONCEPT_PRAGMATICS_SOFTENING | PRAGMATICS | SOFTENING | 2 |
| CONCEPT_PRAGMATICS_CONFIRMATION | PRAGMATICS | CONFIRMATION | 2 |

**v1.1 추가**: `CONCEPT_MOOD_WHQUESTION`은 CONCEPT_SCHEMA §11 **Tier B(기존 Category 내 새 Concept 추가)** 절차로 추가되었다. Wh-의문문은 시제·양태처럼 완전히 새로운 축이 아니라 MOOD가 이미 다루는 "문장 유형(발화 의도)"의 하위 유형(의문문의 한 종류)이므로 새 Category 없이 기존 MOOD 아래 Function으로 편입한다. 근거는 VALIDATION_REPORT_VI_v1.0의 PENDING-3 해결 과정에서 문서화되었다.

**설계 참고**: `CONCEPT_VOICE_PASSIVE`와 `CONCEPT_MODALITY_ABILITY`는 각각 두 개의 서로 다른 Grammar Node로 표현된다(4장). 이는 CONCEPT_SCHEMA §10에서 예정했던 "하나의 Concept, 여러 Grammar Node" 상황의 첫 실제 사례다.

---

## 3. Concept 커버리지 개관

| Category | 노드 수 | 대표 기능 |
|---|---|---|
| TENSE | 2 | 과거, 미래 (현재는 무표지 — 아래 참고) |
| ASPECT | 2 | 진행, 완료 |
| MODALITY | 4 | 가능(x2, 위치가 다른 두 구문), 원함, 필요 |
| NEGATION | 2 | 단순 부정, 아직 ~아님 |
| MOOD | 4 | 의문(예/아니오 x1, Wh-구조 x1), 명령(x2, 전치/후치) |
| QUANTITY | 2 | 분류사(무생물/생물) |
| COMPARISON | 2 | 비교급, 최상급 |
| CONDITIONAL | 1 | 단순 조건 |
| VOICE | 2 | 수동(수혜적/불리적) |
| PRAGMATICS | 3 | 존대, 완곡, 확인 어조 |
| **합계** | **24** | |

**현재 시제 관련 설계 노트**: 베트남어는 현재 시제를 별도 표지 없이 동사 원형으로 표현한다(무표지, zero-marking). 따라서 `CONCEPT_TENSE_PRESENT`에 대응하는 별도 Grammar Node를 만들지 않는다 — "노드가 없다"는 것 자체가 이 언어의 문법적 사실이며 누락이 아니다. 이는 향후 다른 언어 Pack에서도 반복될 수 있는 패턴이므로 인지해 둔다.

---

## 4. Grammar Node 카탈로그

각 노드는 두 개의 표로 나눠 표기한다 — **정의**(ID/Concept/Label/Difficulty/Surface Forms)와 **관계·콘텐츠**(Prerequisite/Related/Contrast/Alternative/설명/예문). 값이 없으면 `—`로 표기한다.

### 4.1 TENSE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_DA | CONCEPT_TENSE_PAST | đã (과거 시제 표지) | 1 | đã |
| GRAMMAR_VI_SE | CONCEPT_TENSE_FUTURE | sẽ (미래 시제 표지) | 1 | sẽ |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_DA | — | — | GRAMMAR_VI_DANG | — | CONTENT_VI_DA_EXPL_KO_BEGINNER | CONTENT_VI_DA_EXAMPLE_1 |
| GRAMMAR_VI_SE | — | — | — | — | CONTENT_VI_SE_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_SE_EXAMPLE_1 (TBD) |

### 4.2 ASPECT

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_DANG | CONCEPT_ASPECT_PROGRESSIVE | đang (진행 표지) | 1 | đang |
| GRAMMAR_VI_ROI | CONCEPT_ASPECT_PERFECT | rồi (완료 표지) | 3 | rồi, đã...rồi |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_DANG | — | — | GRAMMAR_VI_DA | — | CONTENT_VI_DANG_EXPL_KO_BEGINNER | CONTENT_VI_DANG_EXAMPLE_1 |
| GRAMMAR_VI_ROI | GRAMMAR_VI_DA | — | — | — | CONTENT_VI_ROI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_ROI_EXAMPLE_1 (TBD) |

### 4.3 MODALITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_CO_THE | CONCEPT_MODALITY_ABILITY | có thể (가능, 동사 앞) | 2 | có thể |
| GRAMMAR_VI_DUOC_ABILITY | CONCEPT_MODALITY_ABILITY | được (가능, 동사 뒤) | 3 | được |
| GRAMMAR_VI_MUON | CONCEPT_MODALITY_DESIRE | muốn (원함) | 1 | muốn |
| GRAMMAR_VI_PHAI | CONCEPT_MODALITY_NECESSITY | phải (필요·의무) | 2 | phải |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_CO_THE | — | GRAMMAR_VI_MUON, GRAMMAR_VI_PHAI | GRAMMAR_VI_PHAI | GRAMMAR_VI_DUOC_ABILITY | CONTENT_VI_CO_THE_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_CO_THE_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_DUOC_ABILITY | GRAMMAR_VI_CO_THE | — | — | GRAMMAR_VI_CO_THE | CONTENT_VI_DUOC_ABILITY_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_DUOC_ABILITY_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_MUON | — | GRAMMAR_VI_CO_THE | — | — | CONTENT_VI_MUON_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_MUON_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_PHAI | — | GRAMMAR_VI_CO_THE | GRAMMAR_VI_CO_THE | — | CONTENT_VI_PHAI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_PHAI_EXAMPLE_1 (TBD) |

**설계 노트 — 같은 단어, 다른 노드**: `được`는 이 문서에서 두 개의 서로 다른 Grammar Node로 나뉜다(`GRAMMAR_VI_DUOC_ABILITY`, 그리고 4.9의 `GRAMMAR_VI_DUOC_PASSIVE`). 동사 뒤에 붙어 "가능"을 뜻할 때와, 수동을 뜻할 때는 통사적 위치와 기능이 다른 별개의 문법이기 때문이다. Grammar Node ID는 단어 단위가 아니라 **기능 단위**로 부여한다는 원칙(GRAMMAR_SCHEMA §1)이 여기서 실제로 적용된 사례다. 두 노드는 서로 `PREREQUISITE`도 `RELATED`도 아니다(완전히 다른 기능이므로) — 관계 자체가 없다.

**추가 설계 노트 — Concept 난이도와 Grammar Node 난이도의 분리**: `CONCEPT_QUANTITY_CLASSIFIER`의 Concept Difficulty는 3이지만, 아래 4.6에서 실제 베트남어 분류사 Grammar Node의 Difficulty는 4로 더 높게 책정한다. 분류사 체계 자체(개념)는 다른 언어에도 흔하지만, 베트남어가 명사마다 요구하는 구체적 분류사 배정은 암기 부담이 커서 **언어별 구현 난이도가 개념 난이도를 초과하는 실제 사례**다(CONCEPT_SCHEMA §5에서 예정했던 구분).

### 4.4 NEGATION

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_KHONG | CONCEPT_NEGATION_SIMPLE | không (단순 부정) | 1 | không |
| GRAMMAR_VI_CHUA | CONCEPT_NEGATION_NOTYET | chưa (아직 ~ 아님) | 2 | chưa |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_KHONG | — | — | GRAMMAR_VI_CHUA | — | CONTENT_VI_KHONG_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_KHONG_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_CHUA | GRAMMAR_VI_KHONG | — | GRAMMAR_VI_KHONG | — | CONTENT_VI_CHUA_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_CHUA_EXAMPLE_1 (TBD) |

### 4.5 MOOD

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_CO_KHONG | CONCEPT_MOOD_INTERROGATIVE | có...không (예/아니오 의문문) | 1 | có ... không |
| GRAMMAR_VI_HAY | CONCEPT_MOOD_IMPERATIVE | hãy (명령, 동사 앞) | 2 | hãy |
| GRAMMAR_VI_DI | CONCEPT_MOOD_IMPERATIVE | đi (명령·청유, 문미) | 2 | đi |
| GRAMMAR_VI_WH_INSITU | CONCEPT_MOOD_WHQUESTION | Wh-의문문 어순(제자리형, 이동 없음) | 1 | [S] [V] [WH] (어순 변경 없음) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_CO_KHONG | — | GRAMMAR_VI_WH_INSITU | — | — | CONTENT_VI_CO_KHONG_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_CO_KHONG_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_HAY | — | GRAMMAR_VI_DI | — | — | CONTENT_VI_HAY_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_HAY_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_DI | — | GRAMMAR_VI_HAY | — | — | CONTENT_VI_DI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_DI_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_WH_INSITU | — | GRAMMAR_VI_CO_KHONG | — | — | CONTENT_VI_WH_INSITU_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_WH_INSITU_EXAMPLE_1 (TBD) |

**설계 노트 — Wh-단어(Vocabulary)와 Wh-구조(Grammar)의 분리**: "gì(무엇)", "đâu(어디)", "khi nào(언제)" 같은 의문사 자체는 Vocabulary이며 Grammar Node로 다루지 않는다. `GRAMMAR_VI_WH_INSITU`가 표현하는 것은 오직 **구조**다 — 베트남어는 영어와 달리 의문사를 문두로 이동시키지 않고 평서문에서 답이 들어갈 자리에 그대로 대입한다("Bạn đang làm gì?" = "너는 ~하고 있다 무엇을"). 이 "이동 없음"이라는 사실 자체가 영어·한국어 화자에게는 명시적으로 배워야 할 문법이므로 Grammar Node로 다룰 가치가 있다.

**난이도 노트**: `CONCEPT_MOOD_WHQUESTION`의 Concept Difficulty는 2이지만, 베트남어 Grammar Node의 Difficulty는 1로 더 낮게 책정한다. 어순 이동이 아예 없기 때문에(영어의 wh-fronting과 반대) 베트남어에서는 오히려 구현 난이도가 개념 난이도보다 **낮다** — 4.3의 분류사 사례(구현 난이도가 개념 난이도보다 높음)와 반대 방향의 실제 사례다.

### 4.6 QUANTITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_CL_CAI | CONCEPT_QUANTITY_CLASSIFIER | cái (무생물 분류사) | 4 | cái |
| GRAMMAR_VI_CL_CON | CONCEPT_QUANTITY_CLASSIFIER | con (동물·생물 분류사) | 4 | con |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_CL_CAI | — | — | GRAMMAR_VI_CL_CON | — | CONTENT_VI_CL_CAI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_CL_CAI_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_CL_CON | — | — | GRAMMAR_VI_CL_CAI | — | CONTENT_VI_CL_CON_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_CL_CON_EXAMPLE_1 (TBD) |

### 4.7 COMPARISON

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_HON | CONCEPT_COMPARISON_COMPARATIVE | hơn (비교급) | 2 | hơn |
| GRAMMAR_VI_NHAT | CONCEPT_COMPARISON_SUPERLATIVE | nhất (최상급) | 2 | nhất |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_HON | — | — | — | — | CONTENT_VI_HON_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_HON_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_NHAT | GRAMMAR_VI_HON | — | — | — | CONTENT_VI_NHAT_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_NHAT_EXAMPLE_1 (TBD) |

### 4.8 CONDITIONAL

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_NEU_THI | CONCEPT_CONDITIONAL_SIMPLE | nếu...thì (단순 조건) | 3 | nếu ... thì |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_NEU_THI | — | — | — | — | CONTENT_VI_NEU_THI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_NEU_THI_EXAMPLE_1 (TBD) |

### 4.9 VOICE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_DUOC_PASSIVE | CONCEPT_VOICE_PASSIVE | được (수혜적 수동) | 3 | được |
| GRAMMAR_VI_BI | CONCEPT_VOICE_PASSIVE | bị (불리적 수동) | 3 | bị |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_DUOC_PASSIVE | — | — | GRAMMAR_VI_BI | — | CONTENT_VI_DUOC_PASSIVE_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_DUOC_PASSIVE_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_BI | — | — | GRAMMAR_VI_DUOC_PASSIVE | — | CONTENT_VI_BI_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_BI_EXAMPLE_1 (TBD) |

### 4.10 PRAGMATICS

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_VI_A_POLITE | CONCEPT_PRAGMATICS_POLITENESS | ạ (존대 종결사) | 2 | ạ |
| GRAMMAR_VI_NHE | CONCEPT_PRAGMATICS_SOFTENING | nhé (부드러운 권유 종결사) | 2 | nhé |
| GRAMMAR_VI_A_CONFIRM | CONCEPT_PRAGMATICS_CONFIRMATION | à (확인 어조 종결사) | 2 | à |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_VI_A_POLITE | — | GRAMMAR_VI_NHE, GRAMMAR_VI_A_CONFIRM | — | — | CONTENT_VI_A_POLITE_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_A_POLITE_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_NHE | — | GRAMMAR_VI_A_POLITE | — | — | CONTENT_VI_NHE_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_NHE_EXAMPLE_1 (TBD) |
| GRAMMAR_VI_A_CONFIRM | — | GRAMMAR_VI_A_POLITE | — | — | CONTENT_VI_A_CONFIRM_EXPL_KO_BEGINNER (TBD) | CONTENT_VI_A_CONFIRM_EXAMPLE_1 (TBD) |

---

## 5. Relation 카탈로그 (전체 통합)

4장에 흩어진 관계를 하나의 표로 통합한다. 총 16개, GRAMMAR_SCHEMA v1.2의 4개 Relation Type을 모두 포함한다.

| ID | From | To | Type | Direction | Weight |
|---|---|---|---|---|---|
| REL_ROI_PREREQ_DA | GRAMMAR_VI_ROI | GRAMMAR_VI_DA | PREREQUISITE | UNIDIRECTIONAL | 0.7 |
| REL_NHAT_PREREQ_HON | GRAMMAR_VI_NHAT | GRAMMAR_VI_HON | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_CHUA_PREREQ_KHONG | GRAMMAR_VI_CHUA | GRAMMAR_VI_KHONG | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_DUOC_ABILITY_PREREQ_CO_THE | GRAMMAR_VI_DUOC_ABILITY | GRAMMAR_VI_CO_THE | PREREQUISITE | UNIDIRECTIONAL | 0.6 |
| REL_DA_CONTRAST_DANG | GRAMMAR_VI_DA | GRAMMAR_VI_DANG | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_DUOC_PASSIVE_CONTRAST_BI | GRAMMAR_VI_DUOC_PASSIVE | GRAMMAR_VI_BI | CONTRAST | BIDIRECTIONAL | 0.6 |
| REL_KHONG_CONTRAST_CHUA | GRAMMAR_VI_KHONG | GRAMMAR_VI_CHUA | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_CO_THE_CONTRAST_PHAI | GRAMMAR_VI_CO_THE | GRAMMAR_VI_PHAI | CONTRAST | BIDIRECTIONAL | 0.4 |
| REL_CL_CAI_CONTRAST_CL_CON | GRAMMAR_VI_CL_CAI | GRAMMAR_VI_CL_CON | CONTRAST | BIDIRECTIONAL | 0.6 |
| REL_HAY_RELATED_DI | GRAMMAR_VI_HAY | GRAMMAR_VI_DI | RELATED | BIDIRECTIONAL | 0.5 |
| REL_MUON_RELATED_CO_THE | GRAMMAR_VI_MUON | GRAMMAR_VI_CO_THE | RELATED | BIDIRECTIONAL | 0.3 |
| REL_PHAI_RELATED_CO_THE | GRAMMAR_VI_PHAI | GRAMMAR_VI_CO_THE | RELATED | BIDIRECTIONAL | 0.3 |
| REL_A_POLITE_RELATED_NHE | GRAMMAR_VI_A_POLITE | GRAMMAR_VI_NHE | RELATED | BIDIRECTIONAL | 0.4 |
| REL_A_POLITE_RELATED_A_CONFIRM | GRAMMAR_VI_A_POLITE | GRAMMAR_VI_A_CONFIRM | RELATED | BIDIRECTIONAL | 0.4 |
| REL_WH_INSITU_RELATED_CO_KHONG | GRAMMAR_VI_WH_INSITU | GRAMMAR_VI_CO_KHONG | RELATED | BIDIRECTIONAL | 0.3 |
| REL_CO_THE_ALT_DUOC_ABILITY | GRAMMAR_VI_CO_THE | GRAMMAR_VI_DUOC_ABILITY | ALTERNATIVE | BIDIRECTIONAL | 0.7 |

**순환 검증**: `PREREQUISITE` 4개(ROI→DA, NHAT→HON, CHUA→KHONG, DUOC_ABILITY→CO_THE)는 서로 겹치는 노드가 없어 독립적인 사슬이며, 순환이 존재하지 않는다(GRAMMAR_GRAPH §3 배포 전 검증 통과).

**v1.1 수정 내역**: VALIDATION_REPORT_VI_v1.0의 FAIL-2·FAIL-3(언더스코어 누락, ALTERNATIVE 미축약)을 전체 ID에 반영했고, FAIL-4(§4.10에서 서술만 되고 누락되어 있던 `A_POLITE`↔`A_CONFIRM` 관계)를 추가했다. `WH_INSITU` 노드 신규 추가에 따른 관계 1개도 함께 반영해 14개 → 16개로 증가했다.

---

## 6. Learning Outcome Scenario

이 노드들만으로 실제 수행 가능한 대화 상황(LANGUAGE_PACK_STANDARD §6 형식).

| 시나리오 | 필요 Grammar Node | Vocabulary 영역(참고) |
|---|---|---|
| 나는 밥을 먹었다 | `GRAMMAR_VI_DA` | — |
| 너 지금 뭐 하고 있어? | `GRAMMAR_VI_DANG`, `GRAMMAR_VI_WH_INSITU` | "뭐(gì)" — 7장 `VOCAB_VI_GI` 참조 |
| 이거 살 수 있어요? | `GRAMMAR_VI_CO_THE`(또는 `GRAMMAR_VI_DUOC_ABILITY`), `GRAMMAR_VI_CO_KHONG` | — |
| 이따가 갈게요 | `GRAMMAR_VI_SE` | — |

**Wh-단어 각주**: "뭐(gì)"에 해당하는 의문사 자체는 Vocabulary 영역이라 Grammar Node로 다루지 않는다(4.5 설계 노트, VALIDATION_REPORT_VI_v1.0 PENDING-3 해결). 어순 구조(`WH_INSITU`)만 Grammar가 담당한다.

---

## 7. Vocabulary Mapping

VI_LANGUAGE_PACK이 정의하는 Vocabulary Entry(VOCABULARY_SCHEMA.md 구조 기준). 베트남어는 굴절이 없어 Irregular Surface Form 사례는 없고, **열린 어휘 집합에서 선택이 필요한 경우(Wh-단어)**만 등재한다.

| ID | Lemma | POS | Canonical Gloss | Irregular Surface Forms |
|---|---|---|---|---|
| VOCAB_VI_GI | gì | PRONOUN | 무엇 | 없음(불변) |
| VOCAB_VI_DAU | đâu | PRONOUN | 어디 | 없음(불변) |
| VOCAB_VI_KHI_NAO | khi nào | ADVERB | 언제 | 없음(불변) |

---

## 8. Required Content 목록

- **네이밍 규칙**: `CONTENT_VI_{NODE_SLUG}_{TYPE}_{META_LANG}_{LEVEL}` (설명), `CONTENT_VI_{NODE_SLUG}_EXAMPLE_{N}` (예문). `{NODE_SLUG}`는 Grammar Node ID에서 `GRAMMAR_VI_` 접두사를 뗀 부분.
- **본문은 이 문서에 없다.** 실제 텍스트·미디어 자산은 `VI_CONTENT.md`(Tier D)의 책임이다(LANGUAGE_PACK_STANDARD §2 책임 경계).
- **v1.0에서 실제 텍스트를 완성한 노드**: `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG` — 본문은 `VI_CONTENT.md` 참조.
- **나머지 21개 노드**: Content ID는 확정하되 본문은 `(TBD)`이며 `VI_CONTENT.md`에서 채워진다.
- **meta_language**: v1.0은 한국어(`KO`) 학습자를 우선 대상으로 하여 모든 설명을 `meta_language: KO`로 고정한다.

---

## 9. Language Pack Version Policy

LANGUAGE_PACK_STANDARD §9 기준(Minor/Major는 학습자 능력 단계로 판단).

- **v1.0**: 10개 Category 전 영역에 최소 1개 이상, 총 23개 노드. "최소 회화 가능"이 목표.
- **v1.1(완료)**: FAIL 수정 + PENDING-3 해결(Wh-구조 Grammar 편입) — Minor, 기존 Concept 재사용 범위 내.
- **v1.2(이번 버전)**: LANGUAGE_PACK_STANDARD 표준 챕터 적용, Content를 Tier D로 이관 — Minor(구조 정리, 학습 능력 단계 변화 없음).
- **v2.0 후보(미정)**: `IMPLEMENTATION_BRIEF`에서 다뤘던 과거 시제 뉘앙스 확장(vừa mới, đã từng)을 포함해 "생존 회화" 다음 단계("일상 대화")로 넘어가는 시점 — 아직 결정하지 않음.

---

## 10. 검증 체크리스트

**LANGUAGE_PACK_STANDARD §10(공통 검증 체크리스트)을 그대로 따른다.** 베트남어 전용 추가 항목:

- [ ] 성조·특수 발음 기호가 SLUG 생성 시 정확히 제거되었는가(IDENTIFIER_STANDARD §3)

---

## 11. 금지 사항

**LANGUAGE_PACK_STANDARD §11(공통 금지 사항)을 그대로 따른다.** 베트남어 전용 추가 항목:

- 같은 단어의 서로 다른 기능을 하나의 Grammar Node에 욱여넣는 것(4.3 설계 노트 위반)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 목차 승인 (10개 Category 기준, 최소 회화 세트 원칙, Alternative 포함) |
| 1.0 | 2026-07-05 | 본문 최초 작성 — Concept 18개, Grammar Node 23개(10개 Category 전체 커버), Relation 14개(4종 Type 모두 포함), Content 매핑 방침, Living Document 버전 전략, 검증 체크리스트, 금지 사항 정의. `được`의 기능별 노드 분리(능력 vs 수동) 사례로 ID-per-function 원칙 실증 |
| 1.1 | 2026-07-06 | VALIDATION_REPORT_VI_v1.0 조치 — FAIL-1~3(Content/Relation ID 언더스코어·축약 오류) 전체 수정, FAIL-4(누락된 `A_POLITE`↔`A_CONFIRM` 관계) 추가. PENDING-3 해결: Wh-의문사(Vocabulary)와 Wh-의문문 구조(Grammar)를 분리해 `CONCEPT_MOOD_WHQUESTION`(Tier B 추가)과 `GRAMMAR_VI_WH_INSITU` 신규 도입 — Concept 18→19, Grammar Node 23→24, Relation 14→16. 재발 방지를 위해 검증 체크리스트·금지 사항에 항목 추가 |
| 1.2 | 2026-07-06 | LANGUAGE_PACK_STANDARD.md 적용 — 표준 챕터 순서로 재정렬(Learning Outcome Scenario §6, Vocabulary Mapping §7 신설), Content 본문을 `VI_CONTENT.md`(Tier D)로 완전 이관, §10~11을 표준 참조로 축소(언어별 추가 항목만 유지), Version Policy를 학습자 능력 단계 기준으로 재정의 |
