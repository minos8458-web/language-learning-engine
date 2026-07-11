# VOCABULARY_SCHEMA.md
## Vocabulary Entity 데이터 표준 — Language-Independent Lexicon Layer (Tier A — Core Standard)

> Vocabulary는 사전이 아니다. **Grammar가 규칙으로 표현할 수 없는 언어적 사실과 예외**만을 담당하는 Lexicon Layer다. 이 문서가 완성되면 LLE의 핵심 데이터 모델은 네 축으로 완전히 분리된다: **Grammar**(규칙, 계산 가능한 것) / **Vocabulary**(언어적 사실과 예외) / **Content**(교육 콘텐츠) / **Progress**(사용자 학습 상태).

문서 계층: Tier A(CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, LEARNING_PROTOCOL, CONTENT_SCHEMA, PROGRESS_SCHEMA, **VOCABULARY_SCHEMA**)

---

## 0. 문서의 지위

- **이 문서는 LLE의 마지막 핵심 Tier A Schema다.** Grammar/Content/Progress가 각자의 SSOT를 가진 것처럼, Vocabulary도 독립된 SSOT를 갖는다.
- **네 축의 책임 분리(재확인)**:

| 축 | 책임 | SSOT 문서 |
|---|---|---|
| Grammar | 규칙 — 계산 가능한 문법 기능 | GRAMMAR_SCHEMA.md |
| **Vocabulary** | **언어적 사실과 예외 — 계산 불가능한 것** | **이 문서** |
| Content | 교육 콘텐츠 — 어떻게 가르칠 것인가 | CONTENT_SCHEMA.md |
| Progress | 사용자 학습 상태 | PROGRESS_SCHEMA.md |

- **범위 제한(중요)**: 이 문서는 "모든 단어를 저장하는 사전"을 만들지 않는다. PROJECT_VISION §4의 Anti-Goal("단어장 앱이 되지 않는다")은 이 문서에도 그대로 적용된다. Vocabulary Entry는 오직 Grammar가 구조적으로 처리할 수 없는 두 경우에만 존재 이유를 갖는다(1장 참고).

---

## 1. 목적

이 문서는 지금까지 여러 Language Pack에서 "Vocabulary 영역"이라고 선언만 되고 실제로 어디에도 저장되지 않았던 공백을 메운다 — VI_LANGUAGE_PACK의 Wh-단어, EN_LANGUAGE_PACK의 불규칙 동사 활용형과 Partitive 계량어 선택.

**Vocabulary Entry가 필요한 경우는 정확히 두 가지뿐이다.**

1. **열린 어휘 집합에서 선택이 필요할 때**: Grammar Node는 "구조"만 정의하고(예: `GRAMMAR_EN_PARTITIVE`의 "a ___ of N"), 실제 어떤 단어가 그 자리에 들어가는지는 열린 목록(gì/đâu, piece/cup/glass)이다.
2. **Grammar 규칙의 예외가 있을 때**: 규칙 활용으로 예측되지 않는 특정 어휘의 형태(go→went).

**Grammar Node의 `surface_forms`가 이미 완결된 경우(예: 불변 조사 `ạ`, 진성 조동사 `can`)는 Vocabulary Entry가 필요 없다.** 어휘 선택도, 불규칙 예외도 없기 때문이다.

---

## 2. Vocabulary Entry 개요

하나의 Vocabulary Entry는 특정 언어의 특정 Lemma(기본형) 하나를 나타낸다.

| 필드 그룹 | 포함 필드 | 성격 |
|---|---|---|
| 식별 | `id`, `lemma`, `language`, `pos` | 언어적 사실 |
| 최소 의미 | `canonical_gloss` | 언어적 사실(최소한의 힌트일 뿐, 교육용 설명 아님) |
| 예외 | `irregular_surface_forms` | Grammar 규칙의 예외만 |
| 예약 필드 | `features`, `pronunciation_ref`, `phonetic_ref` | 미구현, 구조만 확보(4~5장, 8장) |

---

## 3. Lemma와 Surface Form

- **Lemma**: 사전에 실리는 기본형(예: "go", "good", "đi").
- **Surface Form**: 실제 문장에 나타나는 굴절형(예: "went", "going", "goes").

**핵심 원칙 — 규칙형은 저장하지 않는다.** `work → worked`처럼 Grammar Node의 규칙(`GRAMMAR_EN_PAST_SIMPLE`의 `-ed`)으로 예측 가능한 형태는 Vocabulary에 저장하지 않는다. Lemma와 Grammar Node의 규칙만 있으면 언제든 계산 가능하기 때문이다 — Coverage/Depth, Review Queue, Derived Metrics를 저장하지 않았던 것과 동일한 원칙이다.

**오직 예측 불가능한 예외(Irregular Surface Form, 5장)만 명시적으로 저장한다.**

---

## 4. 품사(POS) 체계

언어 독립적인 닫힌 목록을 사용한다.

`NOUN` \| `VERB` \| `ADJECTIVE` \| `ADVERB` \| `PRONOUN` \| `PREPOSITION` \| `CONJUNCTION` \| `DETERMINER` \| `INTERJECTION` \| `CLASSIFIER` \| `NUMERAL`

**`CLASSIFIER`에 대한 참고**: 베트남어 분류사의 **문법적 구조**(수사+분류사+명사)는 이미 Grammar Node(`GRAMMAR_VI_CL_CAI`, `GRAMMAR_VI_CL_CON`)로 존재한다. 그 구조에 실제로 들어가는 개별 분류사 어휘(더 희귀한 분류사들)가 늘어나면 `pos: CLASSIFIER`인 Vocabulary Entry로 등재한다 — Grammar는 "분류사가 필요하다는 구조적 사실"을, Vocabulary는 "구체적으로 어떤 분류사 단어들이 있는가"를 담당하는 동일한 분업이다.

---

## 5. Irregular Surface Form (모든 품사로 일반화)

**"불규칙 활용"이 아니라 "Irregular Surface Form"으로 일반화한다.** 동사에 국한되지 않고 모든 품사에 동일한 구조를 적용한다.

| 필드 | 목적 |
|---|---|
| `surface_form` | 예외적으로 나타나는 실제 형태 |
| `realizes_grammar_node_id` | 이 형태가 어떤 Grammar Node의 기능을 실현하는지 |

**품사 무관 적용 사례**:

| 품사 | Lemma → Irregular Surface Form | 실현하는 Grammar Node |
|---|---|---|
| VERB | go → went | `GRAMMAR_EN_PAST_SIMPLE` |
| VERB | go → gone | `GRAMMAR_EN_HAVE_VPP` |
| ADJECTIVE | good → better | `GRAMMAR_EN_COMPARATIVE` |
| ADJECTIVE | good → best | `GRAMMAR_EN_SUPERLATIVE` |

**발견된 공백(지금 고치지 않고 투명하게 기록)**: `mouse → mice`(불규칙 복수형)를 검토하는 과정에서, 현재 20개 Universal Concept 중 "수(數, Number/Plural)"에 대응하는 Concept이 없다는 것을 확인했다. 이는 이 문서의 결함이 아니라 EN_LANGUAGE_PACK v1.0이 애초에 복수형을 Grammar 범위에 포함하지 않았기 때문이다(v1.0 "최소 회화 세트"에 없던 항목). 필요해지면 Grammar Schema 확장 논의로 별도 처리한다 — 이 문서는 그 시점에 "저장 구조"만 이미 준비되어 있으면 된다.

**언어 독립성**: 이 구조는 베트남어·일본어·중국어의 예외형에도 동일하게 재사용한다.

---

## 6. Meaning/Gloss와 Content의 경계

| 축 | 담당 | 예 |
|---|---|---|
| **Vocabulary** | `canonical_gloss` — 최소한의 의미 힌트 하나 | "go: 가다, 이동하다" |
| **Content** | 상세 의미 설명, 예문, 학습 설명 | "go는 이동의 방향성을 나타내며 ~와 함께 쓰일 때는..." (EXPLANATION/EXAMPLE Content) |

`canonical_gloss`는 **하나의 지정된 meta_language로 된 최소 힌트**일 뿐이며, 여러 언어별 상세 설명이나 뉘앙스 차이는 담지 않는다 — 그것은 Content의 책임이다. 이 경계가 무너지면 Vocabulary가 다시 "사전"이 되어 0장의 범위 제한이 무의미해진다.

---

## 7. Grammar Node ↔ Vocabulary 연결 규칙

- **참조 방향**: `Vocabulary(irregular_surface_forms[].realizes_grammar_node_id) → Grammar Node.id` (단방향). Grammar Node는 자신을 실현하는 Vocabulary Entry 목록을 저장하지 않는다 — Content/Relation/Progress와 동일한 이유(핵심 정적 구조를 어휘 수만큼 늘어나는 데이터로부터 보호).
- Grammar Node가 Vocabulary 없이도 완전할 수 있다(예: `GRAMMAR_VI_A_POLITE`는 불변 조사라 Vocabulary Entry가 아예 필요 없다).

---

## 8. Reserved Fields (예약 필드, 미구현)

이번 버전에서 구현하지 않지만 구조는 지금 확보한다.

| 필드 | 목적 | 예시(미래) |
|---|---|---|
| `features` | 언어적 속성(가산/불가산, 유정/무정, 격식/고어 등) | `{ "countable": false, "formal": false }` |
| `pronunciation_ref` | 발음 데이터 참조(Listening/Shadowing/Minimal Pair Content와 연결 가능성) | 음성 자산 ID |
| `phonetic_ref` | 음성기호 표기 참조 | IPA 문자열 |

이 필드들은 지금 비워두거나 `null`로 두며, 실제 활용 로직은 이 문서에서 정의하지 않는다.

---

## 9. Language Pack과의 연결 방식

이 문서(Tier A)는 Vocabulary Entry의 **구조**만 정의한다. 실제 Vocabulary Entry 데이터는 각 언어의 Language Pack(Tier B)에 속한다 — Grammar Node가 CONCEPT_SCHEMA(구조)와 VI_LANGUAGE_PACK(인스턴스)으로 나뉘는 것과 동일한 관계다.

**예시**
```
{
  "id": "VOCAB_EN_GO",
  "lemma": "go",
  "language": "EN",
  "pos": "VERB",
  "canonical_gloss": "가다, 이동하다",
  "irregular_surface_forms": [
    { "surface_form": "went", "realizes_grammar_node_id": "GRAMMAR_EN_PAST_SIMPLE" },
    { "surface_form": "gone", "realizes_grammar_node_id": "GRAMMAR_EN_HAVE_VPP" }
  ],
  "features": {},
  "pronunciation_ref": null,
  "phonetic_ref": null
}
```

---

## 10. Vocabulary Validation

- `lemma`, `language`, `pos`는 필수다.
- **[핵심] Grammar가 계산 가능한 규칙형을 Vocabulary가 중복 저장해서는 안 된다.** `irregular_surface_forms`에 등록하려는 형태가 대응 Grammar Node의 규칙을 그대로 적용해 도출되는 값과 같다면(예: `work`+`-ed`=`worked`), 이는 Validation Error다. `go → went`처럼 규칙 적용 결과와 다를 때만 허용된다.
- `realizes_grammar_node_id`는 실제 존재하는 Grammar Node를 참조해야 한다.
- **VALIDATION_FRAMEWORK.md와의 연계**: 이 규칙들은 VALIDATION_FRAMEWORK Level 0(Schema Validation)에 정식으로 포함된다(§11에서 문서 갱신). 신규 Language Pack은 이제 **Grammar Validation, Vocabulary Validation, Content Validation을 모두 통과해야** Acceptance 가능하다.

---

## 11. 금지 사항

- Vocabulary Entry에 규칙으로 계산 가능한 형태를 저장하는 것(10장 위반)
- Vocabulary에 상세 의미 설명·예문·학습 설명을 담아 Content의 역할을 침범하는 것(6장 위반)
- Grammar Node에 Vocabulary Entry 목록을 역참조로 저장하는 것(7장 단방향 원칙 위반)
- `features`/`pronunciation_ref`/`phonetic_ref`를 지금 단계에서 실제 로직에 사용하도록 요구하는 것(8장 — 구조만 확보, 활용은 미래)
- 이 문서를 이용해 일반 어휘 학습(단어장) 기능을 만드는 것(0장 범위 제한 위반, PROJECT_VISION §4 Anti-Goal)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 승인, Tier A 배치 확정, "규칙형 미저장" 원칙 채택 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — 4축 SSOT 선언(Grammar/Vocabulary/Content/Progress), Vocabulary Entry 구조, Lemma/Surface Form 분리, POS 11종, Irregular Surface Form을 전 품사로 일반화(모음-mice 사례 검토 중 Number/Plural Concept 공백 발견 및 투명 기록), canonical_gloss로 Meaning/Content 경계 확정, Reserved Fields(features/pronunciation_ref/phonetic_ref), Grammar Node 단방향 참조, Validation 규칙(규칙형 중복 저장 금지) 정의 |
