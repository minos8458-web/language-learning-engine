# JA_LANGUAGE_PACK.md
## 일본어 Language Pack v1.0

> **이 문서는 일본어 구현이 목적이 아니라, LLE Core Standard가 교착어(agglutinative language)에서도 수정 없이 적용되는지를 검증하는 사례다.** 베트남어(고립어)·영어(분석적 굴절어)에 이어, 형태소가 어간에 순차적으로 결합하는 언어 유형을 처음 검증한다. 이 문서 작성의 최우선 원칙은 "기존 Core Standard를 최대한 수정하지 않는다"이며, 아래 5단계 검토(①기존 Concept →②Grammar Node 조합→③Vocabulary→④기존 Relation→⑤신규 제안)를 거쳐 **신규 Concept 0개**로 확정했다. **이 문서는 LANGUAGE_PACK_STANDARD.md의 표준 챕터 템플릿을 따른다.**

문서 계층: Tier A 전체 → `LANGUAGE_PACK_STANDARD.md` → **`JA_LANGUAGE_PACK.md`** → `JA_CONTENT.md`(Tier D)

---

## 0. 문서의 지위

- Tier B(Language Pack). VI/EN_LANGUAGE_PACK.md와 완전히 동일한 표준 구조를 사용한다(LANGUAGE_PACK_STANDARD.md).
- **교착어 검증 사례로서의 위치**: VI(고립어, 무굴절)·EN(분석어, 제한적 굴절)에 이어 일본어는 어간에 형태소가 순차적으로 결합하는 언어다. 이 문서가 검증하는 것은 "일본어를 얼마나 잘 가르치는가"가 아니라 **"Core Standard가 이 언어 유형에서도 수정 없이 버티는가"**다.
- **이번 작업에서 Tier A 문서 수정 이력**: IDENTIFIER_STANDARD.md §3의 Auxiliary+Pattern 규칙을 "조동사가 항상 먼저"라는 영어 중심 고정 규칙에서 "표면 형태소 결합 순서를 그대로 따르는 일반 원칙"으로 재일반화했다(v1.7) — 이는 새 Concept/Category 추가가 아니라 기존 규칙의 언어 편향을 제거한 것이므로, "Core Standard 무수정" 원칙에 위배되지 않는다(오히려 그 원칙을 더 완전하게 만든 수정).

---

## 1. 목적 및 범위

**최우선 원칙**: 새 Category나 새 Concept를 쉽게 추가하지 않는다. 아래 순서로만 검토한다.

1. 기존 Concept로 표현 가능한가?
2. 기존 Grammar Node 조합으로 해결 가능한가?
3. Vocabulary Layer에서 해결 가능한가?
4. 기존 Relation으로 해결 가능한가?
5. 그래도 해결되지 않을 때만 새 Concept를 제안한다.

**결과**: 19개 Grammar Node 전부 기존 21개 Concept 중 18개만으로 매핑되었다. 신규 Concept 제안 0건.

### 1.1 핵심 원칙 ① — Identifier 형태소 순서의 언어 독립적 일반화

영어의 `HAVE_BEEN_VING`(조동사가 먼저)과 일본어의 `TE_IRU`(본동사 패턴이 먼저)는 서로 다른 규칙이 아니라, **"SLUG는 표면 형태소 결합 순서를 그대로 따른다"는 하나의 원칙이 각 언어의 실제 어순에 따라 다르게 나타난 것**이다(IDENTIFIER_STANDARD §3 v1.7 참고).

### 1.2 핵심 원칙 ② — Vocabulary Schema "Lemma→Stem→Surface Form" 검토 결과

**검토 결론: 새 구조 불필요.** 일본어 동사 활용은 활용형(Stem)에 따라 어미가 달라지지만(五段/一段/불규칙 활용류), 이 활용류(class) 자체가 진짜 "예측 불가능한 사실"이지 활용형(Stem)이 별도 저장 대상은 아니다.

- **활용류(class)를 알면 Stem은 계산 가능**하다 — 활용류를 알면 Grammar Node의 규칙만으로 Stem과 그 이후 활용형을 전부 유도할 수 있다.
- **활용류 자체는 예측 불가능한 경우가 있다** — 예: 帰る(kaeru, "돌아가다")는 一段(ichidan)처럼 생겼지만 실제로는 五段(godan) 활용을 한다(전형적인 학습자 함정).
- 따라서 진짜 저장해야 할 것은 "Stem"이라는 새 계층이 아니라, **VOCABULARY_SCHEMA §8에 이미 예약해 둔 `features` 필드에 담는 활용류 정보**(`{"verb_class": "GODAN"}`)다. 이 필드는 정확히 이런 미래 확장을 위해 예약되어 있었다 — 새 스키마 계층을 만들 필요 없이 기존 구조가 이미 감당한다(7장에서 실제 인스턴스로 증명).
- **결론**: Vocabulary와 Grammar의 책임 경계는 지금 그대로 충분하다. "Stem"은 Grammar 규칙 + Vocabulary의 `features.verb_class`로부터 계산되는 값이지, 저장되는 새 엔터티가 아니다 — 이는 이 프로젝트 전체가 지켜온 "계산 가능한 것은 저장하지 않는다" 원칙의 또 다른 사례다.

---

## 2. 사용된 Universal Concept 목록

**신규 Concept 0개.** 21개 기존 Concept 중 18개를 재사용한다(`CONCEPT_TENSE_FUTURE`, `CONCEPT_ASPECT_PERFECT`, `CONCEPT_QUANTITY_PARTITIVE`는 이번 팩에서 쓰이지 않음 — 아래 3장 설계 노트 참고).

| Concept ID | Category | Function |
|---|---|---|
| CONCEPT_TENSE_PAST | TENSE | PAST |
| CONCEPT_ASPECT_PROGRESSIVE | ASPECT | PROGRESSIVE |
| CONCEPT_MODALITY_ABILITY | MODALITY | ABILITY |
| CONCEPT_MODALITY_DESIRE | MODALITY | DESIRE |
| CONCEPT_MODALITY_NECESSITY | MODALITY | NECESSITY |
| CONCEPT_NEGATION_SIMPLE | NEGATION | SIMPLE |
| CONCEPT_NEGATION_NOTYET | NEGATION | NOTYET |
| CONCEPT_MOOD_INTERROGATIVE | MOOD | INTERROGATIVE |
| CONCEPT_MOOD_IMPERATIVE | MOOD | IMPERATIVE |
| CONCEPT_MOOD_WHQUESTION | MOOD | WHQUESTION |
| CONCEPT_QUANTITY_CLASSIFIER | QUANTITY | CLASSIFIER |
| CONCEPT_COMPARISON_COMPARATIVE | COMPARISON | COMPARATIVE |
| CONCEPT_COMPARISON_SUPERLATIVE | COMPARISON | SUPERLATIVE |
| CONCEPT_CONDITIONAL_SIMPLE | CONDITIONAL | SIMPLE |
| CONCEPT_VOICE_PASSIVE | VOICE | PASSIVE |
| CONCEPT_PRAGMATICS_POLITENESS | PRAGMATICS | POLITENESS |
| CONCEPT_PRAGMATICS_SOFTENING | PRAGMATICS | SOFTENING |
| CONCEPT_PRAGMATICS_CONFIRMATION | PRAGMATICS | CONFIRMATION |

**세 번째 증거**: `CONCEPT_MOOD_WHQUESTION`이 이번에는 VI(`WH_INSITU`, 이동 없음)와 같은 전략(`GRAMMAR_JA_WH_INSITU`)으로 실현된다 — 일본어도 의문사가 제자리에 머문다. EN(`WH_FRONTING`)이 오히려 유형론적 소수임이 세 언어 비교로 드러난다.

---

## 3. Concept 커버리지 개관

| Category | 노드 수 | 비고 |
|---|---|---|
| TENSE | 1 | 미래 전용 노드 없음 — 비과거형(辞書形)이 현재·미래 겸용(VI의 현재 무표지와 유사한 패턴) |
| ASPECT | 1 | 완료상 전용 노드 없음 — v1.0에서는 TA가 완료 의미까지 포괄(범위 밖 확장 후보, 9장) |
| MODALITY | 3 | 가능, 원함, 필요 |
| NEGATION | 2 | 단순 부정, 아직 ~아님 |
| MOOD | 3 | 의문, 정중 명령, Wh-구조 |
| QUANTITY | 2 | 분류사(가늘고 긴 것/사람) |
| COMPARISON | 2 | 비교, 최상 |
| CONDITIONAL | 1 | 단순 조건(たら) |
| VOICE | 1 | 수동(られる) |
| PRAGMATICS | 3 | 정중체, 완곡, 확인 어조 |
| **합계** | **19** | |

**설계 노트 — TENSE/ASPECT 축소**: 일본어는 비과거형(辞書形)이 현재와 미래를 겸하므로 별도 미래 노드가 없다(VI와 동일 패턴, EN의 `WILL`이 오히려 소수 유형). 완료상도 v1.0에서는 별도 노드를 만들지 않고 과거형(`TA`)이 포괄하게 두었다 — 완료·경험·계속 등 세분화는 "최소 회화 세트"를 넘는 확장이라 v1.1 이후로 미룬다.

---

## 4. Grammar Node 카탈로그

### 4.1 TENSE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_TA | CONCEPT_TENSE_PAST | た形(과거) | 2 | 다섯 활용류별 た/だ 접속(예: 食べた, 話した, 読んだ) — 활용류는 Vocabulary `features.verb_class` 참조(1.2절) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_TA | — | — | GRAMMAR_JA_TE_IRU | — | CONTENT_JA_TA_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_TA_EXAMPLE_1 (TBD) |

### 4.2 ASPECT

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_TE_IRU | CONCEPT_ASPECT_PROGRESSIVE | て+いる(진행상) | 2 | (て형) + いる/います |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_TE_IRU | — | — | GRAMMAR_JA_TA | — | CONTENT_JA_TE_IRU_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_TE_IRU_EXAMPLE_1 (TBD) |

**설계 노트 — Structure vs Auxiliary+Pattern의 경계**: `TE_IRU`는 て(본동사 패턴)+いる(조동사)의 결합이라 Auxiliary+Pattern 규칙 대상이다. 어순만 영어와 반대일 뿐 규칙의 성격은 동일하다(1.1절, IDENTIFIER_STANDARD §3 v1.7).

### 4.3 MODALITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_DEKIRU | CONCEPT_MODALITY_ABILITY | できる(가능) | 2 | できる/できます |
| GRAMMAR_JA_TAI | CONCEPT_MODALITY_DESIRE | たい形(원함) | 1 | (ます형 어간)+たい |
| GRAMMAR_JA_NAKEREBA_NARANAI | CONCEPT_MODALITY_NECESSITY | なければならない(필요·의무) | 3 | (ない형)+ければならない |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_DEKIRU | — | GRAMMAR_JA_TAI, GRAMMAR_JA_NAKEREBA_NARANAI | GRAMMAR_JA_NAKEREBA_NARANAI | — | CONTENT_JA_DEKIRU_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_DEKIRU_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_TAI | — | GRAMMAR_JA_DEKIRU | — | — | CONTENT_JA_TAI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_TAI_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_NAKEREBA_NARANAI | — | GRAMMAR_JA_DEKIRU | GRAMMAR_JA_DEKIRU | — | CONTENT_JA_NAKEREBA_NARANAI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_NAKEREBA_NARANAI_EXAMPLE_1 (TBD) |

**설계 노트 — v1.1 ALTERNATIVE 후보**: 가능형 활용(食べられる, taberareru)은 できる와 같은 MODALITY_ABILITY를 표현하는 대안적 형태라 VI의 `được`/EN의 `can`↔`be able to`와 유사한 ALTERNATIVE 관계 후보다. v1.0 최소 세트에서는 제외하고 v1.1로 이월한다(9장).

### 4.4 NEGATION

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_NAI | CONCEPT_NEGATION_SIMPLE | ない形(단순 부정) | 2 | (활용류별 ない 접속), 정중체는 ません |
| GRAMMAR_JA_MADA_NAI | CONCEPT_NEGATION_NOTYET | まだ〜ない(아직 ~ 아님) | 2 | まだ + (ない형) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_NAI | — | — | GRAMMAR_JA_MADA_NAI | — | CONTENT_JA_NAI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_NAI_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_MADA_NAI | GRAMMAR_JA_NAI | — | GRAMMAR_JA_NAI | — | CONTENT_JA_MADA_NAI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_MADA_NAI_EXAMPLE_1 (TBD) |

### 4.5 MOOD

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_KA | CONCEPT_MOOD_INTERROGATIVE | 〜か(의문) | 1 | (평서문) + か |
| GRAMMAR_JA_TE_KUDASAI | CONCEPT_MOOD_IMPERATIVE | て+ください(정중한 명령) | 2 | (て형) + ください |
| GRAMMAR_JA_WH_INSITU | CONCEPT_MOOD_WHQUESTION | Wh-의문문 어순(제자리형) | 1 | (평서문 어순 + 의문사 제자리 삽입) + か |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_KA | — | GRAMMAR_JA_WH_INSITU | — | — | CONTENT_JA_KA_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_KA_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_TE_KUDASAI | — | — | — | — | CONTENT_JA_TE_KUDASAI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_TE_KUDASAI_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_WH_INSITU | — | GRAMMAR_JA_KA | — | — | CONTENT_JA_WH_INSITU_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_WH_INSITU_EXAMPLE_1 (TBD) |

**설계 노트 — 세 번째 WH_INSITU 사례**: VI에 이어 두 번째로 "이동 없음" 전략을 확인했다. `GRAMMAR_JA_WH_INSITU`도 여전히 문말의 `か`와 결합해야 의문문이 완성되므로 `KA`와 `RELATED`로 연결한다(VI의 `WH_INSITU`↔`CO_KHONG` 관계와 동일 논리).

### 4.6 QUANTITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_CL_HON | CONCEPT_QUANTITY_CLASSIFIER | 〜本(가늘고 긴 물체 분류사) | 4 | 本/-本/-匹 등 음편 변이(いっぽん/にほん/さんぼん) |
| GRAMMAR_JA_CL_NIN | CONCEPT_QUANTITY_CLASSIFIER | 〜人(사람 분류사) | 3 | 一人/二人(불규칙)+三人부터 규칙(-人) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_CL_HON | — | — | GRAMMAR_JA_CL_NIN | — | CONTENT_JA_CL_HON_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_CL_HON_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_CL_NIN | — | — | GRAMMAR_JA_CL_HON | — | CONTENT_JA_CL_NIN_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_CL_NIN_EXAMPLE_1 (TBD) |

**설계 노트 — VI와 같은 패턴, 더 높은 음운 복잡도**: VI의 분류사(CL_CAI/CL_CON)와 같은 Concept이지만, 일본어 분류사는 숫자와 결합할 때 음편(音便)이 추가로 발생한다(いっぽん/にほん/さんぼん — 순서대로 1/2/3본). `GRAMMAR_JA_CL_HON`의 Difficulty를 4로 책정한 것은 VI 분류사 사례(CONCEPT 난이도 3 < Node 난이도 4)와 같은 논리의 반복이다.

### 4.7 COMPARISON

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_YORI | CONCEPT_COMPARISON_COMPARATIVE | 〜より(비교) | 2 | (비교 대상) + より |
| GRAMMAR_JA_ICHIBAN | CONCEPT_COMPARISON_SUPERLATIVE | いちばん(최상) | 2 | いちばん + (형용사) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_YORI | — | — | — | — | CONTENT_JA_YORI_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_YORI_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_ICHIBAN | GRAMMAR_JA_YORI | — | — | — | CONTENT_JA_ICHIBAN_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_ICHIBAN_EXAMPLE_1 (TBD) |

### 4.8 CONDITIONAL

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_TARA | CONCEPT_CONDITIONAL_SIMPLE | たら形(단순 조건) | 3 | (た형)+ら |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_TARA | GRAMMAR_JA_TA | — | — | — | CONTENT_JA_TARA_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_TARA_EXAMPLE_1 (TBD) |

**설계 노트**: たら형은 형태상 た형(과거)에서 파생되므로 `PREREQUISITE`로 연결한다 — と/ば/なら 등 다른 조건 표현은 v1.1 이후로 미룬다(9장).

### 4.9 VOICE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_RARERU | CONCEPT_VOICE_PASSIVE | られる形(수동태) | 3 | (활용류별 られる/れる 접속) |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_RARERU | — | — | — | — | CONTENT_JA_RARERU_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_RARERU_EXAMPLE_1 (TBD) |

**설계 노트**: VI(수혜/불리 2개 구분)·EN(구분 없음, 1개)에 이어 일본어도 형태 하나(られる)로 수동을 표현하지만, 일본어 특유의 "피해수동"(민폐수동) 뉘앙스는 형태가 아니라 문맥으로 구분되므로 Grammar Node 분리 대상이 아니다 — EN과 같은 유형(형태 통합, 화용은 문맥)이다.

### 4.10 PRAGMATICS

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_JA_MASU | CONCEPT_PRAGMATICS_POLITENESS | ます形(정중체) | 2 | (ます형 어간)+ます/ました/ません |
| GRAMMAR_JA_KEDO | CONCEPT_PRAGMATICS_SOFTENING | 〜けど(완곡) | 2 | (평서문)+けど/けれども |
| GRAMMAR_JA_NE | CONCEPT_PRAGMATICS_CONFIRMATION | 〜ね(확인 어조) | 1 | (평서문)+ね |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_JA_MASU | — | GRAMMAR_JA_NE, GRAMMAR_JA_KEDO | — | — | CONTENT_JA_MASU_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_MASU_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_KEDO | — | GRAMMAR_JA_MASU | — | — | CONTENT_JA_KEDO_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_KEDO_EXAMPLE_1 (TBD) |
| GRAMMAR_JA_NE | — | GRAMMAR_JA_MASU | — | — | CONTENT_JA_NE_EXPL_KO_BEGINNER (TBD) | CONTENT_JA_NE_EXAMPLE_1 (TBD) |

**설계 노트 — MASU를 PRAGMATICS 대표 노드로**: 일본어는 VI/EN처럼 조사 하나를 얹는 방식이 아니라 **동사 자체의 활용형**이 정중체/보통체로 갈린다(食べた 대 食べました). 이 차이를 개별 노드마다 반복해서 모델링하지 않고, `MASU`를 PRAGMATICS_POLITENESS의 대표 노드로 두어 "정중체로 전환한다"는 기능 자체를 담당하게 한다 — 다른 노드(`TA`, `NAI` 등)의 `surface_forms`에는 보통체/정중체 두 활용을 함께 표기해 실제 활용형을 빠짐없이 제공한다(4.1~4.4 참고, 향후 Content 제작 시 두 활용형 모두 예문화).

---

## 5. Relation 카탈로그 (전체 통합)

총 11개. VI/EN과 마찬가지로 `ALTERNATIVE`는 이번 버전에 없다(4.3 설계 노트의 가능형 사례가 유력한 후보이며 v1.1로 이월).

| ID | From | To | Type | Direction | Weight |
|---|---|---|---|---|---|
| REL_MADA_NAI_PREREQ_NAI | GRAMMAR_JA_MADA_NAI | GRAMMAR_JA_NAI | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_ICHIBAN_PREREQ_YORI | GRAMMAR_JA_ICHIBAN | GRAMMAR_JA_YORI | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_TARA_PREREQ_TA | GRAMMAR_JA_TARA | GRAMMAR_JA_TA | PREREQUISITE | UNIDIRECTIONAL | 0.7 |
| REL_TA_CONTRAST_TE_IRU | GRAMMAR_JA_TA | GRAMMAR_JA_TE_IRU | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_NAI_CONTRAST_MADA_NAI | GRAMMAR_JA_NAI | GRAMMAR_JA_MADA_NAI | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_DEKIRU_CONTRAST_NAKEREBA_NARANAI | GRAMMAR_JA_DEKIRU | GRAMMAR_JA_NAKEREBA_NARANAI | CONTRAST | BIDIRECTIONAL | 0.4 |
| REL_CL_HON_CONTRAST_CL_NIN | GRAMMAR_JA_CL_HON | GRAMMAR_JA_CL_NIN | CONTRAST | BIDIRECTIONAL | 0.6 |
| REL_TAI_RELATED_DEKIRU | GRAMMAR_JA_TAI | GRAMMAR_JA_DEKIRU | RELATED | BIDIRECTIONAL | 0.3 |
| REL_NAKEREBA_NARANAI_RELATED_DEKIRU | GRAMMAR_JA_NAKEREBA_NARANAI | GRAMMAR_JA_DEKIRU | RELATED | BIDIRECTIONAL | 0.3 |
| REL_MASU_RELATED_NE | GRAMMAR_JA_MASU | GRAMMAR_JA_NE | RELATED | BIDIRECTIONAL | 0.4 |
| REL_KA_RELATED_WH_INSITU | GRAMMAR_JA_KA | GRAMMAR_JA_WH_INSITU | RELATED | BIDIRECTIONAL | 0.4 |

**순환 검증**: `PREREQUISITE` 3개(MADA_NAI→NAI, ICHIBAN→YORI, TARA→TA)는 서로 겹치는 노드가 없어 독립적이며 순환이 없다.

---

## 6. Learning Outcome Scenario

| 시나리오 | 필요 Grammar Node | Vocabulary 영역(참고) |
|---|---|---|
| 私はご飯を食べた。(나는 밥을 먹었다.) | `GRAMMAR_JA_TA` | — |
| 今何をしていますか?(지금 뭐 하고 있어요?) | `GRAMMAR_JA_TE_IRU`, `GRAMMAR_JA_WH_INSITU`, `GRAMMAR_JA_KA` | "何(なに)" — 7장 참조 |
| これを買うことができますか?(이거 살 수 있어요?) | `GRAMMAR_JA_DEKIRU`, `GRAMMAR_JA_KA` | — |
| あとで行きます。(이따가 갈게요.) | `GRAMMAR_JA_MASU` | 별도 미래 노드 없음(3장 설계 노트 — 비과거형이 미래 겸용) |

**Wh-단어 각주**: "何(なに)"는 Vocabulary 영역이며 Grammar Node로 다루지 않는다(VI/EN과 동일 원칙).

---

## 7. Vocabulary Mapping

| ID | Lemma | POS | Canonical Gloss | Irregular Surface Forms | Features(Reserved) |
|---|---|---|---|---|---|
| VOCAB_JA_NANI | 何 | PRONOUN | 무엇 | 없음(불변) | — |
| VOCAB_JA_KAERU | 帰る | VERB | 돌아가다 | 帰った(`GRAMMAR_JA_TA`), 帰ります(`GRAMMAR_JA_MASU`) | `{"verb_class": "GODAN"}` |

**설계 노트 — 1.2절 검토 결론의 실제 인스턴스**: `帰る`는 형태만 보면 一段(ichidan) 활용류로 보이지만 실제로는 五段(godan) 활용을 한다(帰ります이지 帰えます가 아님). `features.verb_class = "GODAN"`이 바로 이 예측 불가능한 사실을 저장하는 자리이며, 일단 활용류를 알면 `帰った`, `帰ります` 같은 활용형은 Grammar Node의 규칙(4.1, 4.10)으로 전부 계산 가능하다 — 그래서 이 활용형들을 "Irregular Surface Form"이 아니라 그냥 규칙 적용 예시로 봐도 무방하지만, 여기서는 활용류 자체가 예외적이라는 점을 보여주기 위해 명시적으로 등재했다. `する`(하다)·`来る`(오다) 같은 진짜 불규칙 활용 동사는 v1.1에서 실제 예문이 필요해질 때 추가한다.

---

## 8. Required Content 목록

- 네이밍 규칙은 IDENTIFIER_STANDARD §5를 그대로 따른다.
- **본문은 이 문서에 없다.** 실제 텍스트는 `JA_CONTENT.md`(Tier D)의 책임이다.
- v1.0의 모든 Content는 `(TBD)` 상태다 — 이번 목적은 구조 검증이며 콘텐츠 완성이 아니다.
- `meta_language`는 `KO`로 고정.

---

## 9. Language Pack Version Policy

LANGUAGE_PACK_STANDARD §9 기준(Minor/Major는 학습자 능력 단계로 판단).

- **v1.0(이번 버전)**: 10개 Category 전 영역 최소 1개, 총 19개 노드, 신규 Concept 0개.
- **v1.1(예정, Minor)**: 가능형 활용(食べられる, ALTERNATIVE 후보), と/ば/なら(조건 표현 확장), する/来る 불규칙 동사의 Vocabulary 등재, 완료상 세분화 검토.
- **v2.0 후보(미정)**: "생존 회화" 다음 단계로의 확장 여부는 VI/EN과 함께 별도 결정.

---

## 10. 검증 체크리스트

**LANGUAGE_PACK_STANDARD §10(공통 검증 체크리스트)을 그대로 따른다.** 일본어 전용 추가 항목:

- [ ] 활용류(godan/ichidan/irregular)에 의존하는 Surface Form이 Grammar Node 규칙과 Vocabulary `features.verb_class`로 정합적으로 설명되는가(1.2절)
- [ ] Auxiliary+Pattern 노드의 형태소 순서가 실제 일본어 어순(패턴+조동사)을 따르는가, 영어 어순을 무비판적으로 복사하지 않았는가(IDENTIFIER_STANDARD §3 v1.7)

---

## 11. 금지 사항

**LANGUAGE_PACK_STANDARD §11(공통 금지 사항)을 그대로 따른다.** 일본어 전용 추가 항목:

- 활용류(verb_class) 정보 없이 불규칙하게 보이는 활용형을 임의로 Grammar Node의 `surface_forms`에 나열하는 것(7장 위반 — Vocabulary의 `features` 책임을 침범)
- 정중체(ます형)를 매 노드마다 별도 Grammar Node로 중복 생성하는 것(4.10 위반 — `MASU` 대표 노드 원칙)

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 및 v1.0 후보 19개 노드 승인. Identifier 형태소 순서 일반화, Vocabulary Stem 검토 방향 합의 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — Concept 18개 재사용(신규 0개), Grammar Node 19개(10개 Category 전체 커버), Relation 11개(ALTERNATIVE 없음, v1.1 이월 근거 명시). IDENTIFIER_STANDARD §3을 형태소 순서 일반 원칙으로 재일반화(v1.7). Vocabulary Schema "Lemma→Stem→Surface Form" 검토 결론(새 구조 불필요, 기존 `features` Reserved 필드로 충분) 및 `帰る` 실사례로 증명. MASU를 PRAGMATICS 대표 노드로 지정해 활용형 정중체 분기를 일원화 |
