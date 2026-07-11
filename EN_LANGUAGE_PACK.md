# EN_LANGUAGE_PACK.md
## 영어 Language Pack v1.2

> 이 문서는 LLE의 **첫 번째 비베트남어 Language Pack**이다. 목표는 영어를 완성하는 것이 아니라, VI_LANGUAGE_PACK.md에서 검증한 구조(Concept→Grammar Node→Relation→Content)가 다른 언어에서도 새 Category나 상위 구조 변경 없이 그대로 동작하는지 검증하는 것이다. **이 문서는 LANGUAGE_PACK_STANDARD.md의 표준 챕터 템플릿을 따른다.**

문서 계층: `CONCEPT_SCHEMA.md` → `GRAMMAR_SCHEMA.md` → `IDENTIFIER_STANDARD.md` → `GRAMMAR_GRAPH.md` → `LANGUAGE_PACK_STANDARD.md` → **`EN_LANGUAGE_PACK.md`** → `EN_CONTENT.md`(Tier D)

---

## 0. 문서의 지위

- Tier B(Language Pack). VI_LANGUAGE_PACK.md와 완전히 동일한 문서 구조를 사용한다.
- **원칙적으로 Tier A 문서를 수정하지 않는다.** 이번 문서에서 예외가 하나 발생했다 — 2.1절 참고(신규 Concept Function 1개, Tier B 절차).
- 이번 버전의 범위는 **실제 회화가 가능한 최소 문법 세트**다(VI와 동일한 원칙, PROJECT_VISION §1.1 "완결 불가능한 목표" 회피).

---

## 1. 목적 및 범위

1. 10개 Concept Category 각각에 최소 1개 이상의 실사용 가능한 영어 Grammar Node가 있다.
2. 새 Category를 만들지 않고 기존 19개 Concept(CONCEPT_SCHEMA + VI_LANGUAGE_PACK이 이미 정의한 것)에 최대한 매핑한다.

### 1.1 핵심 원칙 ① — Grammar Node(기능) vs Surface Form(실현형)의 명확한 분리

영어는 하나의 문법 기능이 여러 표면 형태로 실현되는 경우가 베트남어보다 훨씬 흔하다. 이 문서는 그 구분을 명시적으로 지킨다.

> **Grammar Node = 기능 하나. Surface Form = 그 기능이 실제로 나타나는 모든 형태.**

예: `GRAMMAR_EN_COMPARATIVE`(비교급이라는 기능 하나)는 `surface_forms: ["-er", "more"]`(음운 조건에 따른 두 이형태)를 갖는다. "-er"과 "more"를 별도 Grammar Node로 쪼개지 않는다 — 이 둘은 서로 다른 기능이 아니라 같은 기능의 음운론적 변이형이기 때문이다(GRAMMAR_SCHEMA §1의 "같은 단어, 다른 기능 → 다른 노드" 원칙의 **역**: "다른 형태, 같은 기능 → 같은 노드").

### 1.2 핵심 원칙 ② — 불규칙 활용(Irregular Form) 처리

`work→worked`(규칙)와 `go→went`, `eat→ate`, `see→saw`(불규칙)는 전부 동일한 `GRAMMAR_EN_PAST_SIMPLE` 문법 기능이다.

**결정**: Grammar Node는 **규칙(어간+"-ed")만** 정의한다. 특정 동사의 불규칙 활용형은 그 동사 자체의 어휘적 속성이므로 **Vocabulary Layer**가 책임져야 한다는 방향에 동의한다.

**투명하게 밝히는 미해결 지점**: 이 프로젝트에는 아직 공식적인 **Vocabulary Schema(Tier A)** 문서가 없다. 지금까지 "Wh-단어"(VI_LANGUAGE_PACK §4.5), "분류사가 적용되는 명사 자체"(암묵적), 그리고 이번 "불규칙 동사 활용형"이 전부 "Vocabulary 영역"이라고 선언되었지만, 그 데이터가 실제로 어떤 구조로 어디에 저장될지는 한 번도 공식적으로 정의된 적이 없다.

**v1.0에서의 처리**: `GRAMMAR_EN_PAST_SIMPLE`의 `surface_forms`는 규칙형(`-ed`)만 표기하고, 이번 문서의 예문 Content는 불규칙 동사를 피해 규칙 동사만 사용한다(회피, 근본 해결 아님).

**후속 조치 제안(승인 필요, 이번 문서 범위 밖)**: Vocabulary Schema를 별도 Tier A 문서로 신설할지는 이 문서의 범위를 넘는 결정이므로 별도로 제안한다.

### 1.3 핵심 원칙 ③ — Auxiliary + Pattern 구성 문법

진행상(`BE_VING`)·완료상(`HAVE_VPP`)·수동태(`BE_VPP`)는 IDENTIFIER_STANDARD.md §3에 이번에 신규 공식화된 "Auxiliary + Pattern SLUG 규칙"을 따른다. 이 규칙 덕분에 향후 `be going to`, `used to`, `have been V-ing` 같은 문법이 추가되어도 매번 새로운 명명 관례를 발명할 필요가 없다.

---

## 2. 사용된 Universal Concept 목록

**기존 19개 Concept 중 18개를 재사용하고, 1개(`CONCEPT_QUANTITY_CLASSIFIER`)는 이번 팩에서 쓰이지 않는다. 대신 새로운 Function 1개(`PARTITIVE`)를 추가해, 이번 팩이 실제로 참조하는 Concept은 총 19개다.**

| Concept ID | Category | Function | Difficulty | 출처 |
|---|---|---|---|---|
| CONCEPT_TENSE_PAST | TENSE | PAST | 2 | 기존(VI) |
| CONCEPT_TENSE_FUTURE | TENSE | FUTURE | 2 | 기존(VI) |
| CONCEPT_ASPECT_PROGRESSIVE | ASPECT | PROGRESSIVE | 2 | 기존(VI) |
| CONCEPT_ASPECT_PERFECT | ASPECT | PERFECT | 3 | 기존(VI) |
| CONCEPT_MODALITY_ABILITY | MODALITY | ABILITY | 2 | 기존(VI) |
| CONCEPT_MODALITY_DESIRE | MODALITY | DESIRE | 1 | 기존(VI) |
| CONCEPT_MODALITY_NECESSITY | MODALITY | NECESSITY | 2 | 기존(VI) |
| CONCEPT_NEGATION_SIMPLE | NEGATION | SIMPLE | 1 | 기존(VI) |
| CONCEPT_NEGATION_NOTYET | NEGATION | NOTYET | 2 | 기존(VI) |
| CONCEPT_MOOD_INTERROGATIVE | MOOD | INTERROGATIVE | 1 | 기존(VI) |
| CONCEPT_MOOD_IMPERATIVE | MOOD | IMPERATIVE | 2 | 기존(VI) |
| CONCEPT_MOOD_WHQUESTION | MOOD | WHQUESTION | 2 | 기존(VI) — **아래 2.2 참고** |
| **CONCEPT_QUANTITY_PARTITIVE** | QUANTITY | PARTITIVE | 2 | **신규(Tier B, 아래 2.1 참고)** |
| CONCEPT_COMPARISON_COMPARATIVE | COMPARISON | COMPARATIVE | 2 | 기존(VI) |
| CONCEPT_COMPARISON_SUPERLATIVE | COMPARISON | SUPERLATIVE | 2 | 기존(VI) |
| CONCEPT_CONDITIONAL_SIMPLE | CONDITIONAL | SIMPLE | 3 | 기존(VI) |
| CONCEPT_VOICE_PASSIVE | VOICE | PASSIVE | 3 | 기존(VI) |
| CONCEPT_PRAGMATICS_POLITENESS | PRAGMATICS | POLITENESS | 2 | 기존(VI) |
| CONCEPT_PRAGMATICS_SOFTENING | PRAGMATICS | SOFTENING | 2 | 기존(VI) |
| CONCEPT_PRAGMATICS_CONFIRMATION | PRAGMATICS | CONFIRMATION | 2 | 기존(VI) |

**참고**: `CONCEPT_QUANTITY_CLASSIFIER`(VI가 정의)는 이번 팩에서 사용하지 않는다 — 영어에는 분류사 체계가 없기 때문이다. 이는 목록에서 빠지는 것이 정상이며, 대신 QUANTITY Category는 아래 2.1의 `CONCEPT_QUANTITY_PARTITIVE`로 충족된다.

### 2.1 신규 Concept — CONCEPT_QUANTITY_PARTITIVE (Tier B)

**정직한 재검토**: 처음에는 영어의 partitive 구문("a piece of", "a cup of")을 베트남어 분류사(`CONCEPT_QUANTITY_CLASSIFIER`)에 그대로 매핑하려 했으나, 검토 결과 **억지로 끼워 맞추는 것**이라고 판단해 별도 Concept으로 분리한다.

- 베트남어 분류사: **셀 수 있는 모든 명사**에 수사와 함께 의무적으로 요구되는 일반 체계
- 영어 partitive: **셀 수 없는 명사(불가산명사)**에만, 그것도 선택적으로 쓰이는 계량 표현

둘 다 CONCEPT_SCHEMA §3의 QUANTITY 정의("수량 | 셀 수 있음/없음, 부분/전체, 분류사 구조")가 다루는 범위 안에 있지만, 메커니즘이 달라 같은 Function으로 묶는 것은 부정확하다. **Tier B 절차(CONCEPT_SCHEMA §11)로 새 Function을 추가한다** — 새 Category가 아니라 QUANTITY 안의 새 Function이므로 CONCEPT_SCHEMA.md 자체는 수정하지 않는다(PRAGMATICS_WHQUESTION 추가 때와 동일한 절차).

### 2.2 CONCEPT_MOOD_WHQUESTION 재사용 — 언어 독립성의 실제 증거

VI_LANGUAGE_PACK.md가 도입한 이 Concept("Wh-의문문을 형성하는 문법적 구조")을 영어에 그대로 재사용한다. 흥미로운 점은 **같은 Concept이 정반대의 실현 전략으로 구현된다는 것**이다.

- 베트남어: `GRAMMAR_VI_WH_INSITU` — 의문사가 제자리에 그대로 머문다(이동 없음)
- 영어: `GRAMMAR_EN_WH_FRONTING` — 의문사가 반드시 문두로 이동한다

이는 Concept 추상화가 실제로 작동한다는 가장 강력한 증거다 — "무엇을 표현하는가"(Wh-질문 형성)는 언어에 무관하게 동일하지만 "어떻게 표현하는가"(이동 여부)는 언어마다 정반대일 수 있다.

---

## 3. Concept 커버리지 개관

| Category | 노드 수 | 대표 기능 |
|---|---|---|
| TENSE | 2 | 과거, 미래 |
| ASPECT | 2 | 진행, 완료 |
| MODALITY | 3 | 가능, 원함, 필요 |
| NEGATION | 2 | 단순 부정, 아직 ~아님 |
| MOOD | 4 | Do-지원 의문, 명령, Wh-전치, 주어-조동사 도치(v1.1 추가) |
| QUANTITY | 1 | Partitive(불가산명사 계량) |
| COMPARISON | 2 | 비교급, 최상급 |
| CONDITIONAL | 1 | 단순 조건 |
| VOICE | 1 | 수동태 |
| PRAGMATICS | 3 | 정중 요청, 완곡 요청, 부가의문 |
| **합계** | **21** | |

**VI 대비 QUANTITY·VOICE 노드 수가 적은 이유(설계 노트)**: 베트남어는 분류사(2개: 무생물/생물)와 수혜적/불리적 수동(2개)을 문법적으로 구분하지만, 영어는 이 구분을 문법화하지 않는다(수동태는 형태 하나, 계량 표현은 하나의 Partitive 구조로 충분). 이는 언어 간 실제 문법 밀도 차이이지 이 Language Pack이 불완전해서가 아니다.

---

## 4. Grammar Node 카탈로그

### 4.1 TENSE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_PAST_SIMPLE | CONCEPT_TENSE_PAST | Past Simple(과거 시제, 규칙형) | 1 | -ed (예: worked) — 불규칙형은 1.2절 참고, 이 팩 범위 밖 |
| GRAMMAR_EN_WILL | CONCEPT_TENSE_FUTURE | will(미래 조동사) | 1 | will |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_PAST_SIMPLE | — | — | GRAMMAR_EN_BE_VING | — | CONTENT_EN_PAST_SIMPLE_EXPL_KO_BEGINNER | CONTENT_EN_PAST_SIMPLE_EXAMPLE_1 |
| GRAMMAR_EN_WILL | — | — | — | — | CONTENT_EN_WILL_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_WILL_EXAMPLE_1 (TBD) |

### 4.2 ASPECT

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_BE_VING | CONCEPT_ASPECT_PROGRESSIVE | be + V-ing(진행상) | 2 | am/is/are/was/were + V-ing |
| GRAMMAR_EN_HAVE_VPP | CONCEPT_ASPECT_PERFECT | have + V-pp(완료상) | 3 | have/has/had + V-pp |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_BE_VING | — | — | GRAMMAR_EN_PAST_SIMPLE | — | CONTENT_EN_BE_VING_EXPL_KO_BEGINNER | CONTENT_EN_BE_VING_EXAMPLE_1 |
| GRAMMAR_EN_HAVE_VPP | — | — | — | — | CONTENT_EN_HAVE_VPP_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_HAVE_VPP_EXAMPLE_1 (TBD) |

**설계 노트 — Auxiliary+Pattern 규칙의 실제 적용**: `BE_VING`, `HAVE_VPP`는 IDENTIFIER_STANDARD §3의 신규 규칙을 그대로 따른다. `surface_forms`에 조동사의 모든 인칭·시제 활용형(am/is/are/was/were)을 나열하고, ID 자체에는 레마(`BE`)만 남긴다 — Grammar Node ID는 기능을, `surface_forms`는 실현형을 담당한다는 1.1절 원칙이 여기서도 동일하게 적용된다.

### 4.3 MODALITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_CAN | CONCEPT_MODALITY_ABILITY | can(가능) | 1 | can, can't |
| GRAMMAR_EN_WANT_TO | CONCEPT_MODALITY_DESIRE | want to(원함) | 1 | want to, wants to, wanted to |
| GRAMMAR_EN_HAVE_TO | CONCEPT_MODALITY_NECESSITY | have to(필요·의무) | 2 | have to, has to, had to |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_CAN | — | GRAMMAR_EN_WANT_TO, GRAMMAR_EN_HAVE_TO | GRAMMAR_EN_HAVE_TO | — | CONTENT_EN_CAN_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_CAN_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_WANT_TO | — | GRAMMAR_EN_CAN | — | — | CONTENT_EN_WANT_TO_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_WANT_TO_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_HAVE_TO | — | GRAMMAR_EN_CAN | GRAMMAR_EN_CAN | — | CONTENT_EN_HAVE_TO_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_HAVE_TO_EXAMPLE_1 (TBD) |

**참고**: VI_LANGUAGE_PACK은 `được`의 이중 기능 때문에 MODALITY_ABILITY에 노드가 2개(ALTERNATIVE 관계)였다. 영어 `can`은 그런 이중 기능이 없으므로 1개면 충분하다 — 언어별 형태론적 특성 차이일 뿐 설계 누락이 아니다.

### 4.4 NEGATION

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_NOT | CONCEPT_NEGATION_SIMPLE | not(단순 부정, do-support 필요) | 1 | don't, doesn't, didn't, isn't, aren't, wasn't, weren't |
| GRAMMAR_EN_NOT_YET | CONCEPT_NEGATION_NOTYET | not yet(아직 ~ 아님) | 2 | not...yet, haven't...yet |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_NOT | — | — | GRAMMAR_EN_NOT_YET | — | CONTENT_EN_NOT_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_NOT_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_NOT_YET | GRAMMAR_EN_NOT | — | GRAMMAR_EN_NOT | — | CONTENT_EN_NOT_YET_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_NOT_YET_EXAMPLE_1 (TBD) |

### 4.5 MOOD

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_DO_SUPPORT_Q | CONCEPT_MOOD_INTERROGATIVE | Do-지원 의문문 | 2 | Do/Does/Did + S + V? |
| GRAMMAR_EN_IMPERATIVE | CONCEPT_MOOD_IMPERATIVE | 명령문(동사 원형으로 시작) | 1 | (bare V) — 예: "Open the door." |
| GRAMMAR_EN_WH_FRONTING | CONCEPT_MOOD_WHQUESTION | Wh-전치(의문사 문두 이동) | 2 | Wh-word + (do-support) + S + V? |
| GRAMMAR_EN_SUBJECT_AUX_INVERSION | CONCEPT_MOOD_INTERROGATIVE | 주어-조동사 도치 의문문(기존 조동사/모달 도치) | 2 | Can/Will/Is/Have + S + V...? |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_DO_SUPPORT_Q | — | GRAMMAR_EN_SUBJECT_AUX_INVERSION | — | — | CONTENT_EN_DO_SUPPORT_Q_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_DO_SUPPORT_Q_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_IMPERATIVE | — | — | — | — | CONTENT_EN_IMPERATIVE_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_IMPERATIVE_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_WH_FRONTING | — | GRAMMAR_EN_DO_SUPPORT_Q, GRAMMAR_EN_SUBJECT_AUX_INVERSION | — | — | CONTENT_EN_WH_FRONTING_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_WH_FRONTING_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_SUBJECT_AUX_INVERSION | — | GRAMMAR_EN_DO_SUPPORT_Q | — | — | CONTENT_EN_SUBJECT_AUX_INVERSION_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_SUBJECT_AUX_INVERSION_EXAMPLE_1 (TBD) |

**설계 노트**: `WH_FRONTING`은 `DO_SUPPORT_Q`와 `RELATED`(선행이 아님) 관계다. "What do you want?"처럼 do-support와 결합하는 경우도 있지만, "What are you doing?"처럼 `BE_VING`의 자체 도치만으로 완성되는 경우도 있어 do-support가 Wh-의문문의 **선행 조건은 아니다** — 검증 과정에서 실제 문장으로 확인해 PREREQUISITE에서 RELATED로 정정했다(아래 VALIDATION_REPORT_EN_v1.0 참고).

### 4.6 QUANTITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_PARTITIVE | CONCEPT_QUANTITY_PARTITIVE | a ___ of + 불가산명사 | 2 | a piece of, a cup of, a glass of, a bit of |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_PARTITIVE | — | — | — | — | CONTENT_EN_PARTITIVE_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_PARTITIVE_EXAMPLE_1 (TBD) |

**설계 노트**: `surface_forms`의 "piece/cup/glass/bit"는 **어느 계량어를 어느 명사에 쓰는가**라는 어휘 선택 문제를 포함한다. 이 문법 노드는 "a ___ of NOUN"이라는 **구조**만 표현하며, 정확한 계량어-명사 조합은 Vocabulary 영역이다(1.2절과 동일한 원칙 — Wh-단어가 Vocabulary였던 것처럼).

### 4.7 COMPARISON

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_COMPARATIVE | CONCEPT_COMPARISON_COMPARATIVE | 비교급 | 2 | -er (짧은 형용사), more (긴 형용사) |
| GRAMMAR_EN_SUPERLATIVE | CONCEPT_COMPARISON_SUPERLATIVE | 최상급 | 2 | -est (짧은 형용사), most (긴 형용사) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_COMPARATIVE | — | — | — | — | CONTENT_EN_COMPARATIVE_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_COMPARATIVE_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_SUPERLATIVE | GRAMMAR_EN_COMPARATIVE | — | — | — | CONTENT_EN_SUPERLATIVE_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_SUPERLATIVE_EXAMPLE_1 (TBD) |

**설계 노트 — 1.1절 원칙의 정식 사례**: "-er"과 "more"(또는 "-est"와 "most")는 서로 다른 기능이 아니라 형용사 음절 수에 따른 음운론적 이형태다. 두 개의 Grammar Node로 쪼개지 않고 하나의 `surface_forms` 배열에 담는다. 이것이 이 문서의 핵심 원칙 ①("Grammar Node=기능, Surface Form=실현형")이 실제로 적용된 가장 명확한 사례다.

### 4.8 CONDITIONAL

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_IF_WILL | CONCEPT_CONDITIONAL_SIMPLE | if...will(단순 조건) | 3 | If + S + V(현재), S + will + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_IF_WILL | GRAMMAR_EN_WILL | — | — | — | CONTENT_EN_IF_WILL_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_IF_WILL_EXAMPLE_1 (TBD) |

### 4.9 VOICE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_BE_VPP | CONCEPT_VOICE_PASSIVE | be + V-pp(수동태) | 3 | am/is/are/was/were + V-pp |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_BE_VPP | — | — | — | — | CONTENT_EN_BE_VPP_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_BE_VPP_EXAMPLE_1 (TBD) |

**설계 노트**: 베트남어는 수혜적(`được`)/불리적(`bị`) 수동을 문법적으로 구분하지만 영어는 하나의 형태(`be + V-pp`)로 이 구분을 표현하지 않는다(화용적으로만 구분). 따라서 VI에서 있었던 CONTRAST 관계(DUOC_PASSIVE↔BI)가 EN에는 대응 쌍이 없다 — 언어 유형론적 차이다.

### 4.10 PRAGMATICS

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_EN_PLEASE | CONCEPT_PRAGMATICS_POLITENESS | please(정중 표지) | 1 | please |
| GRAMMAR_EN_COULD_REQUEST | CONCEPT_PRAGMATICS_SOFTENING | could(완곡 요청) | 2 | could |
| GRAMMAR_EN_TAG_QUESTION | CONCEPT_PRAGMATICS_CONFIRMATION | 부가의문문 | 3 | ..., isn't it? / ..., don't you? / ..., right? |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_EN_PLEASE | — | GRAMMAR_EN_COULD_REQUEST, GRAMMAR_EN_TAG_QUESTION | — | — | CONTENT_EN_PLEASE_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_PLEASE_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_COULD_REQUEST | GRAMMAR_EN_CAN | GRAMMAR_EN_PLEASE | — | — | CONTENT_EN_COULD_REQUEST_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_COULD_REQUEST_EXAMPLE_1 (TBD) |
| GRAMMAR_EN_TAG_QUESTION | GRAMMAR_EN_DO_SUPPORT_Q | GRAMMAR_EN_PLEASE | — | — | CONTENT_EN_TAG_QUESTION_EXPL_KO_BEGINNER (TBD) | CONTENT_EN_TAG_QUESTION_EXAMPLE_1 (TBD) |

**설계 노트 — 같은 단어 계열, 다른 기능**: `could`는 형태상 `can`의 과거형이지만 `GRAMMAR_EN_COULD_REQUEST`는 MODALITY_ABILITY가 아니라 PRAGMATICS_SOFTENING을 표현한다. 이는 베트남어 `được`(하나의 단어, 서로 다른 기능 → 별도 노드)과 같은 원칙의 영어 사례다. 다만 `được`처럼 ALTERNATIVE 관계를 만들지는 않는다 — "can"(가능)과 "could"(완곡 요청)는 서로 대체 가능한 표현이 아니라 완전히 다른 화용적 기능이므로 PREREQUISITE(순서상 can을 먼저 배움)만 적절하다.

---

## 5. Relation 카탈로그 (전체 통합)

총 14개. VI_LANGUAGE_PACK과 달리 이번에는 `ALTERNATIVE` 관계가 없다 — 아래 참고.

| ID | From | To | Type | Direction | Weight |
|---|---|---|---|---|---|
| REL_SUPERLATIVE_PREREQ_COMPARATIVE | GRAMMAR_EN_SUPERLATIVE | GRAMMAR_EN_COMPARATIVE | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_NOT_YET_PREREQ_NOT | GRAMMAR_EN_NOT_YET | GRAMMAR_EN_NOT | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_WH_FRONTING_RELATED_DO_SUPPORT_Q | GRAMMAR_EN_WH_FRONTING | GRAMMAR_EN_DO_SUPPORT_Q | RELATED | BIDIRECTIONAL | 0.4 |
| REL_DO_SUPPORT_Q_RELATED_SUBJECT_AUX_INVERSION | GRAMMAR_EN_DO_SUPPORT_Q | GRAMMAR_EN_SUBJECT_AUX_INVERSION | RELATED | BIDIRECTIONAL | 0.5 |
| REL_WH_FRONTING_RELATED_SUBJECT_AUX_INVERSION | GRAMMAR_EN_WH_FRONTING | GRAMMAR_EN_SUBJECT_AUX_INVERSION | RELATED | BIDIRECTIONAL | 0.4 |
| REL_COULD_REQUEST_PREREQ_CAN | GRAMMAR_EN_COULD_REQUEST | GRAMMAR_EN_CAN | PREREQUISITE | UNIDIRECTIONAL | 0.6 |
| REL_TAG_QUESTION_PREREQ_DO_SUPPORT_Q | GRAMMAR_EN_TAG_QUESTION | GRAMMAR_EN_DO_SUPPORT_Q | PREREQUISITE | UNIDIRECTIONAL | 0.6 |
| REL_PAST_SIMPLE_CONTRAST_BE_VING | GRAMMAR_EN_PAST_SIMPLE | GRAMMAR_EN_BE_VING | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_NOT_CONTRAST_NOT_YET | GRAMMAR_EN_NOT | GRAMMAR_EN_NOT_YET | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_CAN_CONTRAST_HAVE_TO | GRAMMAR_EN_CAN | GRAMMAR_EN_HAVE_TO | CONTRAST | BIDIRECTIONAL | 0.4 |
| REL_HAVE_TO_RELATED_CAN | GRAMMAR_EN_HAVE_TO | GRAMMAR_EN_CAN | RELATED | BIDIRECTIONAL | 0.3 |
| REL_WANT_TO_RELATED_CAN | GRAMMAR_EN_WANT_TO | GRAMMAR_EN_CAN | RELATED | BIDIRECTIONAL | 0.3 |
| REL_PLEASE_RELATED_COULD_REQUEST | GRAMMAR_EN_PLEASE | GRAMMAR_EN_COULD_REQUEST | RELATED | BIDIRECTIONAL | 0.4 |
| REL_PLEASE_RELATED_TAG_QUESTION | GRAMMAR_EN_PLEASE | GRAMMAR_EN_TAG_QUESTION | RELATED | BIDIRECTIONAL | 0.4 |

**순환 검증**: `PREREQUISITE` 4개는 서로 겹치는 노드 쌍이 없는 독립적 엣지들이며(SUPERLATIVE→COMPARATIVE, NOT_YET→NOT, COULD_REQUEST→CAN, TAG_QUESTION→DO_SUPPORT_Q), 순환이 존재하지 않는다.

**ALTERNATIVE 관계가 없는 이유(정직한 설계 판단)**: VI_LANGUAGE_PACK은 `được`의 이중 기능에서 자연스러운 ALTERNATIVE 쌍(`CO_THE`↔`DUOC_ABILITY`)이 나왔다. 이번 최소 세트(20개) 안에는 그런 자연스러운 대체 관계가 없다 — 예를 들어 "have to"와 "must"가 고전적인 필요성 대체 쌍이지만 "must"는 이번 v1.0 범위에 포함하지 않았다. 관계 유형을 억지로 채우기 위해 존재하지 않는 관계를 만들지 않는다. GRAMMAR_SCHEMA가 4종 Relation Type을 모두 **지원**해야 한다는 것과, 모든 Language Pack이 4종을 모두 **사용**해야 한다는 것은 다른 요구사항이며 전자만 참이다.

---

## 6. Learning Outcome Scenario

이 노드들만으로 실제 수행 가능한 대화 상황(LANGUAGE_PACK_STANDARD §6 형식). 검증 중 발견된 부재(VALIDATION_REPORT_EN_v1.0 §3.2)를 이번 패치로 정식 반영한다.

| 시나리오 | 필요 Grammar Node | Vocabulary 영역(참고) |
|---|---|---|
| I worked yesterday. | `GRAMMAR_EN_PAST_SIMPLE`(규칙형) | — |
| What are you doing now? | `GRAMMAR_EN_WH_FRONTING`, `GRAMMAR_EN_BE_VING` | "what" — 7장 참조 |
| Can I buy this? | `GRAMMAR_EN_CAN`, `GRAMMAR_EN_SUBJECT_AUX_INVERSION` | — |
| I'll go later. | `GRAMMAR_EN_WILL` | — |

---

## 7. Vocabulary Mapping

EN_LANGUAGE_PACK이 정의하는 Vocabulary Entry(VOCABULARY_SCHEMA.md 구조 기준). 영어는 불규칙 활용이 흔해 Irregular Surface Form 사례가 VI보다 풍부하다.

| ID | Lemma | POS | Canonical Gloss | Irregular Surface Forms |
|---|---|---|---|---|
| VOCAB_EN_GO | go | VERB | 가다 | went(`GRAMMAR_EN_PAST_SIMPLE`), gone(`GRAMMAR_EN_HAVE_VPP`) |
| VOCAB_EN_GOOD | good | ADJECTIVE | 좋은 | better(`GRAMMAR_EN_COMPARATIVE`), best(`GRAMMAR_EN_SUPERLATIVE`) |
| VOCAB_EN_WHAT | what | PRONOUN | 무엇 | 없음(불변) |
| VOCAB_EN_PIECE | piece | NOUN | (partitive 계량어) 조각 | 없음(불변) |

**설계 노트**: `good→better/best`는 `-er`/`-est` 규칙을 따르지 않는 불규칙형이므로 Vocabulary Validation(VOCABULARY_SCHEMA §10)을 통과한다 — 규칙형(`work→worked`)이었다면 여기 등재하는 것 자체가 Validation Error였을 것이다.

---

## 8. Required Content 목록

- 네이밍 규칙은 IDENTIFIER_STANDARD §5를 그대로 따른다.
- **본문은 이 문서에 없다.** 실제 텍스트는 `EN_CONTENT.md`(Tier D)의 책임이다.
- **v1.0에서 실제 텍스트를 완성한 노드**: `GRAMMAR_EN_PAST_SIMPLE`, `GRAMMAR_EN_BE_VING` — 본문은 `EN_CONTENT.md` 참조.
- 나머지 19개 노드는 Content ID만 확정하고 본문은 `EN_CONTENT.md`에서 `(TBD)`로 표시된다.
- `meta_language`는 `KO`로 고정.

---

## 9. Language Pack Version Policy

LANGUAGE_PACK_STANDARD §9 기준(Minor/Major는 학습자 능력 단계로 판단).

- **v1.0**: 10개 Category 전 영역 최소 1개 이상, 총 20개 노드.
- **v1.1(완료)**: PENDING-EN-1(Modal 도치) 해결 — Minor, 기존 Concept 재사용 범위 내.
- **v1.2(이번 버전)**: LANGUAGE_PACK_STANDARD 표준 챕터 적용(Learning Outcome Scenario·Vocabulary Mapping 신설, Content를 Tier D로 이관) — Minor, 구조 정리.
- **v2.0 후보(미정)**: `must`(ALTERNATIVE 사례 보강), `be going to`/`used to`/`have been V-ing`(Auxiliary+Pattern 규칙 추가 검증)가 "생존 회화" 다음 단계로의 확장에 해당하는지는 아직 결정하지 않음.

---

## 10. 검증 체크리스트

**LANGUAGE_PACK_STANDARD §10(공통 검증 체크리스트)을 그대로 따른다.** 영어 전용 추가 항목:

- [ ] 같은 기능의 서로 다른 실현형을 별도 노드로 쪼개지 않았는가(`-er`/`more` 사례처럼)
- [ ] 진성 조동사에 불필요하게 `{PATTERN}` 접미사를 붙이지 않았는가(IDENTIFIER_STANDARD §3)

---

## 11. 금지 사항

**LANGUAGE_PACK_STANDARD §11(공통 금지 사항)을 그대로 따른다.** 영어 전용 추가 항목:

- Surface Form 차이만으로 별도 Grammar Node를 만드는 것(3.1절 위반)
- Auxiliary+Pattern 노드의 ID에 특정 본동사를 포함시키는 것(IDENTIFIER_STANDARD §3 위반)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 및 v1.0 후보 20개 노드 승인 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — Concept 19개(18개 재사용, `CONCEPT_QUANTITY_CLASSIFIER` 미사용, `CONCEPT_QUANTITY_PARTITIVE` 신규), Grammar Node 20개(10개 Category 전체 커버), Relation 12개(ALTERNATIVE 없음, 근거 명시). Surface Form/Grammar Function 분리 원칙, 불규칙 활용 처리 원칙(Vocabulary Schema 공백 발견), Auxiliary+Pattern 규칙 실제 적용. 작성 중 §4/§5 뷰 불일치(CAN-HAVE_TO RELATED 누락) 및 관계 유형 오류(WH_FRONTING-DO_SUPPORT_Q를 PREREQUISITE에서 RELATED로 정정, 실제 문장 검증으로 발견) 자체 발견 및 수정 |
| 1.1 | 2026-07-06 | VALIDATION_REPORT_EN_v1.0의 PENDING-EN-1(Modal 도치 미모델링) 해결 — 안 A(DO_SUPPORT_Q 재정의)와 안 B(별도 노드 신설) 비교 후 안 B 채택. `GRAMMAR_EN_SUBJECT_AUX_INVERSION` 신규 추가(Structure-only SLUG 규칙 적용, IDENTIFIER_STANDARD §3), `DO_SUPPORT_Q`·`WH_FRONTING`과 RELATED 관계 추가. Grammar Node 20→21, Relation 12→14 |
| 1.2 | 2026-07-06 | LANGUAGE_PACK_STANDARD.md 적용 — 표준 챕터 순서로 재정렬(Learning Outcome Scenario §6, Vocabulary Mapping §7 신설), Content 본문을 `EN_CONTENT.md`(Tier D)로 완전 이관, §10~11을 표준 참조로 축소, Version Policy를 학습자 능력 단계 기준으로 재정의 |
