# ZH_LANGUAGE_PACK.md
## 중국어 Language Pack v1.0

> **이 문서는 중국어 구현이 목적이 아니라, LLE Core Standard가 고립어 + 성조 언어 + 한자 기반 언어에서도 수정 없이 적용되는지를 검증하는 사례다.** VI(고립어)·EN(분석어)·JA(교착어)에 이어 네 번째 유형론적 검증이며, **이번 검증의 최우선 대상은 문법 커버리지가 아니라 IDENTIFIER_STANDARD의 Pinyin Normalization 규칙**이다(LANGUAGE_VALIDATION_SUMMARY_V1 §10, Experimental 단계). **이 문서는 LANGUAGE_PACK_STANDARD.md의 표준 챕터 템플릿을 따른다.**

문서 계층: Tier A 전체 → `LANGUAGE_PACK_STANDARD.md` → **`ZH_LANGUAGE_PACK.md`** → `ZH_CONTENT.md`(Tier D)

---

## 0. 문서의 지위

- Tier B(Language Pack). VI/EN/JA_LANGUAGE_PACK.md와 완전히 동일한 표준 구조를 사용한다.
- **네 번째 유형론적 검증 사례로서의 위치**: 고립어(VI)·분석어(EN)·교착어(JA)에 이어, 성조와 한자(다음자 포함)라는 새로운 축을 시험한다.
- **이번 작업에서 Tier A 문서 수정 이력**: IDENTIFIER_STANDARD.md §3에 중국어 병음 정규화 규칙을 구체화하고(v1.9), 다음자(多音字) 해소가 VOCABULARY_SCHEMA.md와 연결되는 지점을 명문화했다. 이는 새 Concept/Category 추가가 아니라 기존 규칙의 실전 적용 세부를 채운 것이므로 "Core Standard 무수정" 원칙에 위배되지 않는다.

---

## 1. 목적 및 범위

**최우선 원칙**: 새 Category나 새 Concept를 쉽게 추가하지 않는다. 아래 순서로만 검토한다.

1. 기존 Concept로 표현 가능한가?
2. 기존 Grammar Node 조합으로 해결 가능한가?
3. Vocabulary Layer에서 해결 가능한가?
4. 기존 Relation으로 해결 가능한가?
5. 그래도 해결되지 않을 때만 새 Concept를 제안한다.

**결과**: 21개 Grammar Node 전부 기존 Concept로 매핑되었다. 신규 Concept 제안 **0건**(VI 2건→EN 1건→JA 0건→ZH 0건 — 수렴 추세가 이어짐, LANGUAGE_VALIDATION_SUMMARY §10 승격 조건에 근접).

### 1.1 핵심 원칙 ① — Pinyin Normalization과 Vocabulary Layer의 연결(다음자 해소)

IDENTIFIER_STANDARD §3(v1.9)에서 구체화한 대로, 다음자(多音字)가 있는 한자는 SLUG 생성이 3단계를 거친다.

> **문법 기능 결정 → (VOCABULARY_SCHEMA에서) 올바른 발음(Lemma) 확정 → Identifier 생성**

이번 팩의 실제 테스트 케이스는 **了**다. 완료상 조사로 쓰일 때는 "le"로 읽고(`GRAMMAR_ZH_LE`), "이해하다/끝내다"라는 별개의 동사일 때는 "liǎo"로 읽는다(Grammar Node가 아니라 Vocabulary Entry, 7장 참고). 이 둘은 같은 한자를 공유하지만 **완전히 다른 Lemma**이므로, VOCABULARY_SCHEMA §3(Lemma와 Surface Form)의 대상이 되기 전에 먼저 "어떤 발음인가"부터 확정해야 한다 — 문자 단위가 아니라 발음이 확정된 형태 단위로 Vocabulary Entry를 등재해야 하는 이유가 여기서 실증된다.

### 1.2 핵심 원칙 ② — TENSE_PAST가 실현되지 않는 첫 사례

중국어는 시제를 문법화하지 않는다. "먹었다"는 `CONCEPT_TENSE_PAST`가 아니라 완료상 조사 了(`CONCEPT_ASPECT_PERFECT`)가 기능적으로 대신한다. **`CONCEPT_TENSE_PAST`가 어떤 Grammar Node로도 실현되지 않는 첫 사례**이며, 이는 3장에서 다시 다룬다. (참고로 `CONCEPT_TENSE_FUTURE`가 실현되지 않았던 JA와 대칭을 이루는 사례로, 이 현상이 이미 두 번째 반복이라는 점은 LANGUAGE_VALIDATION_SUMMARY §11에서 정식으로 다룬다.)

### 1.3 핵심 원칙 ③ — 같은 형태, 다른 기능의 대표 사례(吧)

**吧(ba)**는 이 문서에서 두 개의 서로 다른 Grammar Node로 분리된다.

- `GRAMMAR_ZH_BA_SUGGEST`(제안·명령 완화, MOOD_IMPERATIVE): "走吧" = "가자"
- `GRAMMAR_ZH_BA_CONFIRM`(확인 어조, PRAGMATICS_CONFIRMATION): "他是老师吧" = "그는 선생님이죠?"

같은 문자, 같은 병음(ba)이지만 문장 유형을 바꾸는 것(MOOD)과 이미 만들어진 평서문에 태도만 얹는 것(PRAGMATICS)은 질적으로 다른 기능이다. **Grammar Node가 형태가 아니라 기능을 모델링한다는 원칙(GRAMMAR_SCHEMA §1)의 가장 선명한 사례**이며, VI의 `được`(가능/수동), EN의 `could`(능력/완곡요청)에 이은 세 번째 언어 간 반복이자 **한 언어 안에서 이 패턴이 나타난 첫 사례**다.

---

## 2. 사용된 Universal Concept 목록

**신규 Concept 0개.** 21개 기존 Concept 중 19개를 사용한다. `CONCEPT_QUANTITY_PARTITIVE`(EN 전용)는 쓰이지 않고(중국어는 분류사 체계가 있어 partitive 자체가 불필요), `CONCEPT_TENSE_PAST`는 이 언어에서 실현되지 않는다(1.2절).

| Concept ID | Category | Function |
|---|---|---|
| CONCEPT_TENSE_FUTURE | TENSE | FUTURE |
| CONCEPT_ASPECT_PROGRESSIVE | ASPECT | PROGRESSIVE |
| CONCEPT_ASPECT_PERFECT | ASPECT | PERFECT |
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

**네 번째 증거**: `CONCEPT_MOOD_WHQUESTION`이 이번에도 제자리형(`WH_INSITU`)으로 실현된다 — VI·JA에 이어 세 번째 동일 전략. EN의 `WH_FRONTING`(이동형)이 네 언어 중 유일한 소수 유형임이 더 확고해졌다.

---

## 3. Concept 커버리지 개관

| Category | 노드 수 | 비고 |
|---|---|---|
| TENSE | 1 | **PAST 없음**(요가 ASPECT_PERFECT로 기능 대체, 1.2절) |
| ASPECT | 2 | 진행(在), 완료(了) — 了가 사실상 과거 시제 역할까지 겸함 |
| MODALITY | 3 | 가능, 원함, 필요 |
| NEGATION | 3 | 일반 부정(不), 완료상 전용 부정(没), 아직 ~아님 — VI 이후 두 번째로 부정이 2개 이상으로 갈라진 사례(아래 설계 노트) |
| MOOD | 3 | 의문, 제안형 명령, Wh-구조 |
| QUANTITY | 2 | 분류사(일반/동물) |
| COMPARISON | 2 | 비교, 최상 |
| CONDITIONAL | 1 | 단순 조건 |
| VOICE | 1 | 수동 |
| PRAGMATICS | 3 | 정중 요청, 완곡화, 확인 어조 |
| **합계** | **21** | |

**설계 노트 — 不/没의 이중 부정 체계**: 중국어는 일반 부정(不, 습관·상태·미래)과 완료상 전용 부정(没, 이미 일어난 일의 부정)을 문법적으로 구분한다. 이는 VI의 `không`(단순 부정)/`chưa`(아직 ~ 아님) 2분 구조와 유사하지만, ZH는 **완료상과 결합하는 부정이 통사적으로 아예 다른 단어**(不가 아니라 没)라는 점에서 한 단계 더 세분화된다. 두 부정 모두 `CONCEPT_NEGATION_SIMPLE`에 매핑하고(같은 기능, 다른 실현 조건), `MEI`↔`BU`를 CONTRAST로 연결해 학습자가 자주 혼동하는 지점을 명시한다(5장).

---

## 4. Grammar Node 카탈로그

### 4.1 TENSE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_HUI | CONCEPT_TENSE_FUTURE | 会(미래 조동사) | 2 | 会 + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_HUI | — | — | — | — | CONTENT_ZH_HUI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_HUI_EXAMPLE_1 (TBD) |

**설계 노트 — PAST 부재**: `CONCEPT_TENSE_PAST`에 대응하는 노드가 없다. 중국어는 시제를 문법화하지 않으며, 과거의 의미는 완료상 조사 了(4.2)가 기능적으로 담당한다. "노드가 없다"는 이 언어의 문법적 사실이며 누락이 아니다(VI 현재 시제 무표지, JA 미래 무표지에 이은 세 번째 사례).

### 4.2 ASPECT

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_ZAI | CONCEPT_ASPECT_PROGRESSIVE | 在(진행상) | 2 | 在 + V |
| GRAMMAR_ZH_LE | CONCEPT_ASPECT_PERFECT | 了(완료상, le) | 2 | V + 了 — **다음자 주의: liǎo(이해하다) 아님, 1.1절·7장 참고** |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_ZAI | — | — | GRAMMAR_ZH_LE | — | CONTENT_ZH_ZAI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_ZAI_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_LE | — | — | GRAMMAR_ZH_ZAI | — | CONTENT_ZH_LE_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_LE_EXAMPLE_1 (TBD) |

**설계 노트 — Pinyin Normalization 실전 테스트**: `GRAMMAR_ZH_LE`의 SLUG(`LE`)는 1.1절의 3단계 절차(문법 기능 결정→Vocabulary에서 올바른 발음 확정→Identifier 생성)를 실제로 거친 첫 사례다. 이 문법 기능은 반드시 "le" 발음에서만 파생되어야 하며, 같은 한자의 다른 발음("liǎo")에서 파생되면 완전히 다른(그리고 잘못된) 노드가 된다.

### 4.3 MODALITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_NENG | CONCEPT_MODALITY_ABILITY | 能(가능) | 1 | 能 + V |
| GRAMMAR_ZH_XIANG | CONCEPT_MODALITY_DESIRE | 想(원함) | 1 | 想 + V |
| GRAMMAR_ZH_DEI | CONCEPT_MODALITY_NECESSITY | 得(필요·의무, děi) | 2 | 得 + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_NENG | — | GRAMMAR_ZH_XIANG, GRAMMAR_ZH_DEI | GRAMMAR_ZH_DEI | — | CONTENT_ZH_NENG_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_NENG_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_XIANG | — | GRAMMAR_ZH_NENG | — | — | CONTENT_ZH_XIANG_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_XIANG_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_DEI | — | GRAMMAR_ZH_NENG | GRAMMAR_ZH_NENG | — | CONTENT_ZH_DEI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_DEI_EXAMPLE_1 (TBD) |

**설계 노트 — v1.1 ALTERNATIVE 후보**: 会(huì)도 "능력"(학습된 기능, 예: 会说中文)을 표현할 수 있어 能과 유사한 ALTERNATIVE 관계 후보다. v1.0에서는 会를 TENSE_FUTURE 전용으로만 쓰고 이 이중 기능은 v1.1로 이월한다(VI `được`, EN `could`에 이은 잠재적 네 번째 "같은 단어, 다른 기능" 사례).

### 4.4 NEGATION

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_BU | CONCEPT_NEGATION_SIMPLE | 不(일반 부정) | 1 | 不 + V/Adj |
| GRAMMAR_ZH_MEI | CONCEPT_NEGATION_SIMPLE | 没(완료상 전용 부정) | 2 | 没(有) + V |
| GRAMMAR_ZH_HAI_MEI | CONCEPT_NEGATION_NOTYET | 还没(아직 ~ 아님) | 2 | 还没 + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_BU | — | — | GRAMMAR_ZH_MEI | — | CONTENT_ZH_BU_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_BU_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_MEI | — | — | GRAMMAR_ZH_BU | — | CONTENT_ZH_MEI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_MEI_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_HAI_MEI | GRAMMAR_ZH_MEI | — | — | — | CONTENT_ZH_HAI_MEI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_HAI_MEI_EXAMPLE_1 (TBD) |

**설계 노트**: `不`와 `没`는 같은 Concept(`NEGATION_SIMPLE`)의 서로 다른 실현이다 — 기능이 다른 것이 아니라 적용 조건(완료상 여부)이 다른 것이므로 별도 Concept이 아니라 같은 Concept의 두 노드로 처리한다(3장 설계 노트).

### 4.5 MOOD

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_MA | CONCEPT_MOOD_INTERROGATIVE | 吗(예/아니오 의문) | 1 | (평서문) + 吗 |
| GRAMMAR_ZH_BA_SUGGEST | CONCEPT_MOOD_IMPERATIVE | 吧(제안·명령 완화) | 2 | (동사구) + 吧 |
| GRAMMAR_ZH_WH_INSITU | CONCEPT_MOOD_WHQUESTION | Wh-의문문 어순(제자리형) | 1 | (평서문 어순 + 의문사 제자리 삽입), 吗 없이 성립 |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_MA | — | GRAMMAR_ZH_WH_INSITU | — | — | CONTENT_ZH_MA_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_MA_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_BA_SUGGEST | — | — | — | — | CONTENT_ZH_BA_SUGGEST_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_BA_SUGGEST_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_WH_INSITU | — | GRAMMAR_ZH_MA | — | — | CONTENT_ZH_WH_INSITU_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_WH_INSITU_EXAMPLE_1 (TBD) |

**설계 노트 — 吗와 Wh-의문문의 상호 배제**: Wh-의문문은 이미 의문사 자체가 의문 기능을 수행하므로 문미에 吗를 추가로 붙이지 않는다(붙이면 비문이 된다). `WH_INSITU`가 `MA`와 RELATED로 연결되는 것은 "함께 쓰인다"는 뜻이 아니라 "같은 MOOD 계열이라 교차 학습(Interleaving) 시 함께 다뤄야 한다"는 뜻이다 — Relation의 의미가 맥락에 따라 다르게 활용되는 사례로 기록해 둔다.

### 4.6 QUANTITY

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_CL_GE | CONCEPT_QUANTITY_CLASSIFIER | 个(일반 분류사) | 3 | 个 |
| GRAMMAR_ZH_CL_ZHI | CONCEPT_QUANTITY_CLASSIFIER | 只(동물 분류사) | 3 | 只 |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_CL_GE | — | — | GRAMMAR_ZH_CL_ZHI | — | CONTENT_ZH_CL_GE_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_CL_GE_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_CL_ZHI | — | — | GRAMMAR_ZH_CL_GE | — | CONTENT_ZH_CL_ZHI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_CL_ZHI_EXAMPLE_1 (TBD) |

**설계 노트 — VI와 같은 패턴, 더 큰 규모의 위험**: VI(cái/con)와 동일한 Concept·동일한 구조이지만, 중국어 양사(量詞) 체계는 명사 카테고리별로 훨씬 정교하게 발달해 있다(LANGUAGE_VALIDATION_SUMMARY §9에서 이미 예견한 위험). v1.0은 가장 기본적인 두 개(일반/동물)만 채택하고, 나머지는 v1.1 이후 Vocabulary Mapping 확장으로 처리한다 — Grammar Node를 양사 개수만큼 늘리지 않는다(그러면 문법이 아니라 어휘 학습이 된다, PROJECT_VISION Anti-Goal).

### 4.7 COMPARISON

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_BI | CONCEPT_COMPARISON_COMPARATIVE | 比(비교) | 2 | A + 比 + B + Adj |
| GRAMMAR_ZH_ZUI | CONCEPT_COMPARISON_SUPERLATIVE | 最(최상) | 1 | 最 + Adj |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_BI | — | — | — | — | CONTENT_ZH_BI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_BI_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_ZUI | GRAMMAR_ZH_BI | — | — | — | CONTENT_ZH_ZUI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_ZUI_EXAMPLE_1 (TBD) |

### 4.8 CONDITIONAL

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_RUGUO_JIU | CONCEPT_CONDITIONAL_SIMPLE | 如果...就(단순 조건) | 3 | 如果 + S + V, 就 + S + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_RUGUO_JIU | — | — | — | — | CONTENT_ZH_RUGUO_JIU_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_RUGUO_JIU_EXAMPLE_1 (TBD) |

### 4.9 VOICE

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_BEI | CONCEPT_VOICE_PASSIVE | 被(수동태) | 3 | (피행위자) + 被 + (행위자) + V |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_BEI | — | — | — | — | CONTENT_ZH_BEI_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_BEI_EXAMPLE_1 (TBD) |

**설계 노트**: VI(수혜/불리 2개 구분)와 달리 EN·JA처럼 중국어도 형태 하나(被)로 수동을 표현한다 — 被가 전통적으로 불리한 뉘앙스를 띠는 경우가 많지만 이는 문맥·화용의 영역이지 형태 분리 대상이 아니다(EN·JA와 같은 유형).

### 4.10 PRAGMATICS

**정의**

| ID | Concept | Label | Difficulty | Surface Forms |
|---|---|---|---|---|
| GRAMMAR_ZH_QING | CONCEPT_PRAGMATICS_POLITENESS | 请(정중 요청) | 1 | 请 + V |
| GRAMMAR_ZH_YIXIA | CONCEPT_PRAGMATICS_SOFTENING | 一下(완곡화) | 2 | V + 一下 |
| GRAMMAR_ZH_BA_CONFIRM | CONCEPT_PRAGMATICS_CONFIRMATION | 吧(확인 어조) | 2 | (평서문) + 吧 |

**관계·콘텐츠**

| ID | Prerequisite | Related | Contrast | Alternative | 설명 콘텐츠 | 예문 콘텐츠 |
|---|---|---|---|---|---|---|
| GRAMMAR_ZH_QING | — | GRAMMAR_ZH_YIXIA, GRAMMAR_ZH_BA_CONFIRM | — | — | CONTENT_ZH_QING_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_QING_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_YIXIA | — | GRAMMAR_ZH_QING | — | — | CONTENT_ZH_YIXIA_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_YIXIA_EXAMPLE_1 (TBD) |
| GRAMMAR_ZH_BA_CONFIRM | — | GRAMMAR_ZH_QING | — | — | CONTENT_ZH_BA_CONFIRM_EXPL_KO_BEGINNER (TBD) | CONTENT_ZH_BA_CONFIRM_EXAMPLE_1 (TBD) |

**설계 노트 — Validation Example: 吧의 기능 분리(1.3절 재확인)**: `GRAMMAR_ZH_BA_SUGGEST`(4.5)와 `GRAMMAR_ZH_BA_CONFIRM`은 **의도적으로 서로 관계가 없다.** 같은 문자·같은 병음이지만 하나는 문장 유형을 바꾸고(MOOD) 하나는 태도만 얹으므로(PRAGMATICS), VI의 `DUOC_ABILITY`/`DUOC_PASSIVE` 사례처럼 관계 자체를 만들지 않는 것이 정확하다. 이 사례는 VALIDATION_REPORT_ZH_v1.0에 대표 Validation Example로 기록한다.

---

## 5. Relation 카탈로그 (전체 통합)

총 11개. `ALTERNATIVE`는 이번 버전에 없다(4.3의 会 이중 기능이 v1.1 유력 후보).

| ID | From | To | Type | Direction | Weight |
|---|---|---|---|---|---|
| REL_HAI_MEI_PREREQ_MEI | GRAMMAR_ZH_HAI_MEI | GRAMMAR_ZH_MEI | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_ZUI_PREREQ_BI | GRAMMAR_ZH_ZUI | GRAMMAR_ZH_BI | PREREQUISITE | UNIDIRECTIONAL | 0.8 |
| REL_ZAI_CONTRAST_LE | GRAMMAR_ZH_ZAI | GRAMMAR_ZH_LE | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_BU_CONTRAST_MEI | GRAMMAR_ZH_BU | GRAMMAR_ZH_MEI | CONTRAST | BIDIRECTIONAL | 0.6 |
| REL_NENG_CONTRAST_DEI | GRAMMAR_ZH_NENG | GRAMMAR_ZH_DEI | CONTRAST | BIDIRECTIONAL | 0.4 |
| REL_CL_GE_CONTRAST_CL_ZHI | GRAMMAR_ZH_CL_GE | GRAMMAR_ZH_CL_ZHI | CONTRAST | BIDIRECTIONAL | 0.5 |
| REL_XIANG_RELATED_NENG | GRAMMAR_ZH_XIANG | GRAMMAR_ZH_NENG | RELATED | BIDIRECTIONAL | 0.3 |
| REL_DEI_RELATED_NENG | GRAMMAR_ZH_DEI | GRAMMAR_ZH_NENG | RELATED | BIDIRECTIONAL | 0.3 |
| REL_QING_RELATED_YIXIA | GRAMMAR_ZH_QING | GRAMMAR_ZH_YIXIA | RELATED | BIDIRECTIONAL | 0.4 |
| REL_QING_RELATED_BA_CONFIRM | GRAMMAR_ZH_QING | GRAMMAR_ZH_BA_CONFIRM | RELATED | BIDIRECTIONAL | 0.3 |
| REL_MA_RELATED_WH_INSITU | GRAMMAR_ZH_MA | GRAMMAR_ZH_WH_INSITU | RELATED | BIDIRECTIONAL | 0.4 |

**순환 검증**: `PREREQUISITE` 2개(HAI_MEI→MEI, ZUI→BI)는 겹치는 노드가 없어 독립적이며 순환이 없다.

**BA_SUGGEST/BA_CONFIRM 관계 부재 재확인**: 이 카탈로그 어디에도 두 `BA` 노드 사이의 Relation이 없다 — 완전히 다른 기능이므로 의도적으로 만들지 않았다(4.10 설계 노트).

---

## 6. Learning Outcome Scenario

| 시나리오 | 필요 Grammar Node | Vocabulary 영역(참고) |
|---|---|---|
| 我吃了饭。(나는 밥을 먹었다.) | `GRAMMAR_ZH_LE` | — |
| 你在做什么?(지금 뭐 하고 있어?) | `GRAMMAR_ZH_ZAI`, `GRAMMAR_ZH_WH_INSITU` | "什么(shénme)" — 7장 참조 |
| 我能买这个吗?(이거 살 수 있어요?) | `GRAMMAR_ZH_NENG`, `GRAMMAR_ZH_MA` | — |
| 我会去。(이따가 갈게요.) | `GRAMMAR_ZH_HUI` | — |

**Wh-단어 각주**: "什么(shénme)"는 Vocabulary 영역이며 Grammar Node로 다루지 않는다(VI/EN/JA와 동일 원칙, 3번째 확인).

---

## 7. Vocabulary Mapping

| ID | Lemma | POS | Canonical Gloss | Irregular Surface Forms | Features(Reserved) |
|---|---|---|---|---|---|
| VOCAB_ZH_SHENME | 什么(shénme) | PRONOUN | 무엇 | 없음(불변) | — |
| VOCAB_ZH_LE | 了(le) | PARTICLE | 완료상 조사 | 없음(불변) | `{"polyphonic_group": "了"}` |
| VOCAB_ZH_LIAO | 了(liǎo) | VERB | 이해하다/끝내다 | 없음(불변) | `{"polyphonic_group": "了"}` |

**설계 노트 — 다음자 해소의 실제 인스턴스**: `VOCAB_ZH_LE`와 `VOCAB_ZH_LIAO`는 같은 한자(了)를 공유하지만 발음과 품사, 의미가 전부 다른 별개의 Lemma다. `features.polyphonic_group`(Reserved)에 같은 값("了")을 부여해 "같은 문자를 공유하는 서로 다른 발음들"이라는 관계를 추적할 수 있게 해두었다 — 지금은 참고용 메타데이터일 뿐 실제 조회 로직은 구현하지 않는다(VOCABULARY_SCHEMA §8 Reserved Fields 원칙).

**설계 노트 — Irregular Surface Form이 필요 없는 언어**: 중국어는 형태론적 굴절이 거의 없다(了/吗/吧 등은 문맥에 따라 형태가 변하지 않는다). 따라서 EN(불규칙 동사)이나 JA(활용류)와 달리, 이번 팩은 Irregular Surface Form 사례가 없다 — 이는 결함이 아니라 언어 유형의 차이다.

---

## 8. Required Content 목록

- 네이밍 규칙은 IDENTIFIER_STANDARD §5를 그대로 따른다.
- **본문은 이 문서에 없다.** 실제 텍스트는 `ZH_CONTENT.md`(Tier D)의 책임이다.
- v1.0의 모든 Content는 `(TBD)` 상태다 — 이번 목적은 구조와 Pinyin Normalization 검증이지 콘텐츠 완성이 아니다.
- `meta_language`는 `KO`로 고정.

---

## 9. Language Pack Version Policy

LANGUAGE_PACK_STANDARD §9 기준(Minor/Major는 학습자 능력 단계로 판단).

- **v1.0(이번 버전)**: 10개 Category 전 영역 최소 1개, 총 21개 노드, 신규 Concept 0개.
- **v1.1(예정, Minor)**: 会의 능력 표현 이중 기능(ALTERNATIVE 후보), 양사 어휘 확장(Vocabulary Mapping), 把구문 검토, 방향보어 검토.
- **v2.0 후보(미정)**: "생존 회화" 다음 단계로의 확장 여부는 다른 언어와 함께 별도 결정.

---

## 10. 검증 체크리스트

**LANGUAGE_PACK_STANDARD §10(공통 검증 체크리스트)을 그대로 따른다.** 중국어 전용 추가 항목:

- [ ] 다음자(多音字)가 있는 형태소는 올바른 발음(Lemma)을 먼저 확정한 뒤 SLUG를 생성했는가(IDENTIFIER_STANDARD §3 v1.9)
- [ ] 같은 문자·같은 병음이라도 기능이 다르면(`吧` 사례) 별도 Grammar Node로 분리하고, 불필요한 Relation을 만들지 않았는가

---

## 11. 금지 사항

**LANGUAGE_PACK_STANDARD §11(공통 금지 사항)을 그대로 따른다.** 중국어 전용 추가 항목:

- 다음자의 발음을 확정하지 않고 문자만으로 SLUG를 생성하는 것(1.1절 위반)
- 양사(분류사) 어휘를 Grammar Node로 무한정 늘리는 것(4.6 설계 노트 위반 — 어휘는 Vocabulary Mapping의 몫)
- `BA_SUGGEST`/`BA_CONFIRM`처럼 기능이 다른 동형·동음 노드 사이에 근거 없는 Relation을 만드는 것

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 및 v1.0 후보 21개 노드 승인. Pinyin Normalization을 최우선 검증 항목으로 지정 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — Concept 19개 재사용(신규 0건), Grammar Node 21개(10개 Category 전체 커버), Relation 11개(ALTERNATIVE 없음). `CONCEPT_TENSE_PAST` 미실현 첫 사례 기록(JA의 미래 미실현과 대칭). `了`의 다음자 해소를 IDENTIFIER_STANDARD-VOCABULARY_SCHEMA 연결 지점으로 실증(VOCAB_ZH_LE/VOCAB_ZH_LIAO). `吧`의 기능별 노드 분리(BA_SUGGEST/BA_CONFIRM)를 Grammar=기능 원칙의 대표 사례로 기록, 두 노드 간 관계 의도적 부재 명시 |
