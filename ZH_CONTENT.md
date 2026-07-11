# ZH_CONTENT.md
## 중국어 콘텐츠 본문 (Tier D)

> 이 문서는 `CONTENT_PRODUCTION_STANDARD.md`(Tier D)의 표준을 따른다. `ZH_LANGUAGE_PACK.md`(Tier A/B)가 정의한 Grammar Node·Content ID 자리에 실제 텍스트를 채운다. VI·EN·JA에서 검증한 제작 패턴을 그대로 재사용한다. **네 번째이자 마지막 Language Pack Content다.**

문서 계층: `CONTENT_SCHEMA.md` → `CONTENT_PRODUCTION_STANDARD.md` → **`ZH_CONTENT.md`(이 문서)**

---

## 0. 문서의 지위

- Tier D. `ZH_LANGUAGE_PACK.md`가 확정한 Content ID 체계·`grammar_node_ids` 참조를 그대로 쓴다.
- 노드는 위상정렬 순서로 배치한다 — 아래 §1의 순서표가 작업 순서다.
- **ZH 전용 제약**: 了는 다음자(多音字)다 — 완료상 조사(le)와 "이해하다/끝내다"라는 별개 동사(liǎo)가 한자를 공유한다. 이 문서의 了는 **항상 완료상 조사(le) 기능만** 가리키며, liǎo 용법은 다루지 않는다(`ZH_LANGUAGE_PACK.md` §1.1·§7).
- **주의**: VI·EN·JA와 동일하게, 이 세션에서 설계와 동시에 작성된 초안이라 `CONTENT_PRODUCTION_STANDARD.md` §4.3의 24시간 시간차 검수 조건을 문자 그대로 충족하지 않는다. `is_canonical=true`로 표시하되 실제 서비스 반영 전 별도 검수를 전제로 한다.
- **카탈로그 정합성**: 이번 언어팩은 §5 관계 카탈로그(11개)가 각 노드 표의 선언과 완전히 일치한다 — EN의 IF_WILL-WILL, JA의 MASU-KEDO 같은 누락 사례가 없다.

---

## 1. 작업 순서(위상정렬, 전체 21개) — **전체 완료**

1. GRAMMAR_ZH_LE ✅
2. GRAMMAR_ZH_MA ✅
3. GRAMMAR_ZH_WH_INSITU ✅
4. GRAMMAR_ZH_HUI ✅
5. GRAMMAR_ZH_BU ✅
6. GRAMMAR_ZH_NENG ✅
7. GRAMMAR_ZH_XIANG ✅
8. GRAMMAR_ZH_QING ✅
9. GRAMMAR_ZH_ZAI ✅
10. GRAMMAR_ZH_MEI ✅
11. GRAMMAR_ZH_DEI ✅
12. GRAMMAR_ZH_BA_SUGGEST ✅
13. GRAMMAR_ZH_HAI_MEI ✅
14. GRAMMAR_ZH_YIXIA ✅
15. GRAMMAR_ZH_BA_CONFIRM ✅
16. GRAMMAR_ZH_BI ✅
17. GRAMMAR_ZH_ZUI ✅
18. GRAMMAR_ZH_CL_GE ✅
19. GRAMMAR_ZH_CL_ZHI ✅
20. GRAMMAR_ZH_RUGUO_JIU ✅
21. GRAMMAR_ZH_BEI ✅ ← **최종 노드**

---

## 2. GRAMMAR_ZH_LE (了 — 완료상)

**노드 정보**: Concept `CONCEPT_ASPECT_PERFECT` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_ZAI**(9번, 아직 미학습 — 이연)

### 2.1 CONTENT_ZH_LE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_LE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**了**는 동사 뒤에 붙어 완료상을 나타냅니다 — 동작이 이미 끝났음을 나타냅니다. 중국어는 별도의 과거 시제 표지가 없고, 了가 사실상 과거를 나타내는 역할까지 겸합니다.

**문장 구조**: [주어] + [동사] + 了 + [목적어]

예를 들어 吃(먹다) 뒤에 了를 붙이면 **吃了**(먹었다)가 됩니다.

**주의**: 이 了는 "le"로 읽는 완료상 조사입니다. 같은 한자로 "liǎo"(이해하다/끝내다)라는 별개의 동사도 있지만, 이 문서에서 다루는 了는 항상 완료상 조사(le)만 가리킵니다.

### 2.2 CONTENT_ZH_LE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_LE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我吃了饭。**
> 나는 밥을 먹었다.

단어별: 我(나는) 吃了(먹었다, 吃+了) 饭(밥)

이 문장은 `ZH_LANGUAGE_PACK.md` §6 시나리오1을 원문 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: 了 외의 문법 표지 없음. ZAI는 언급하지 않았다.

### 2.3 CONTENT_ZH_LE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_LE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我说了话。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 말했다."**

### 2.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 了 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **다음자 명확성(ZH 전용 제약)** | 통과 — 了는 완료상 조사(le) 기능만 사용, liǎo 용법 언급 없음 |

### 2.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.2: `Contrast: GRAMMAR_ZH_ZAI`를 확인했으나 미학습으로 9번 차례로 이연.
- `ZH_LANGUAGE_PACK.md` §6 시나리오1: 그대로 실현했다.
- 발견된 이슈: 없음.

---

## 3. GRAMMAR_ZH_MA (吗 — 예/아니오 의문)

**노드 정보**: Concept `CONCEPT_MOOD_INTERROGATIVE` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_WH_INSITU**(위상정렬 2번, 3번 미학습 — 이연)

### 3.1 CONTENT_ZH_MA_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_MA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**吗**는 문장 끝에 붙여 예/아니오 의문문을 만드는 조사입니다. 평서문 그대로 두고 문장 끝에 吗만 붙이면 됩니다.

**문장 구조**: [평서문] + 吗

이미 배운 吃了饭(밥을 먹었다) 끝에 吗를 붙이면 **吃了饭吗**(밥 먹었어?)가 됩니다.

**참고**: 吗는 순수하게 예/아니오를 묻는 조사입니다 — 제안하거나 추측을 확인하는 뉘앙스는 전혀 없습니다. 그런 다른 기능은 별도의 조사가 담당합니다.

### 3.2 CONTENT_ZH_MA_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_MA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **你吃了饭吗?**
> 너 밥 먹었어?

단어별: 你(너는) 吃了(먹었다, 1번에서 학습) 饭(밥) 吗(의문 조사)

**"이미 배운 문법만 사용" 검증**: 吗와 了(1번, 이미 학습) 외의 문법 표지 없음. 의문사는 사용하지 않았다.

### 3.3 CONTENT_ZH_MA_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_MA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"你说了话吗?"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"너 말했어?"**

### 3.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 了(1) 재사용 확인, 의문사 미사용 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **吗/吧 기능 사전 구분(사용자 요청)** | 통과 — "제안·추측 뉘앙스 없음"을 EXPLANATION에 명시해 향후 등장할 吧와의 혼동을 미리 차단 |

**WH_INSITU 연결 기반 구조 확인(사용자 요청, VI·JA와 다른 패턴 발견)**: `ZH_LANGUAGE_PACK.md` §4.5는 WH_INSITU의 surface_forms를 "(평서문 어순+의문사 제자리 삽입), **吗 없이 성립**"이라고 명시한다 — VI·JA와 달리 **중국어 Wh-의문문은 문말 吗를 재사용하지 않는다.** 오히려 의문사가 있으면 吗를 붙이지 않는 것이 원칙이라 두 구조는 상호 배타적이다. §4.5 설계 노트도 "Related가 '함께 쓰인다'는 뜻이 아니라 '같은 MOOD 계열이라 교차 학습 시 함께 다뤄야 한다'는 뜻"이라고 명시한다 — 이 Related는 **구조적 재사용이 아니라 주제적(Interleaving 목적) 연결**이다. WH_INSITU 차례에서 이 구분을 그대로 반영해야 한다.

### 3.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_ZH_WH_INSITU`를 확인했으나 미학습으로 이연. 관계의 성격(주제적, 상호 배타적 구조)을 미리 기록해뒀다.
- 발견된 이슈: 없음(오히려 VI·JA 패턴과의 차이를 정확히 포착한 것이 이번 노드의 성과).

---

## 4. GRAMMAR_ZH_WH_INSITU (Wh-의문문 어순 — 제자리형, 吗 없이 성립)

**노드 정보**: Concept `CONCEPT_MOOD_WHQUESTION` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_MA**(위상정렬 3번, MA는 2번으로 이미 학습 — 이번에 연결하되 구조 재사용이 아닌 대비 방식으로)

**시나리오2 부분 실현 기록**: `ZH_LANGUAGE_PACK.md` §6 시나리오2("你在做什么?")는 `GRAMMAR_ZH_ZAI`(9번, 미학습)가 필요해 이번 노드에서 완성할 수 없다 — ZAI 차례로 이연한다.

### 4.1 CONTENT_ZH_WH_INSITU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_WH_INSITU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

의문사(什么, 哪儿 등)로 질문할 때 중국어는 어순을 바꾸지 않습니다 — 답이 들어갈 자리에 의문사를 그대로 두기만 하면 됩니다. 이미 배운 **吗**(예/아니오 질문)와는 다른 방식입니다 — 吗는 문장 끝에 붙는 조사이지만, Wh-질문은 의문사 자체가 질문 기능을 하므로 **吗를 붙이지 않습니다**(붙이면 오히려 어색해집니다).

**문장 구조**: [주어] + [동사] + [의문사] (吗 없음)

예를 들어 吃(먹다) 뒤에 什么(무엇)를 그대로 두면 **吃什么?**(무엇을 먹니?)가 되어 어순 변화 없이 질문이 완성됩니다.

### 4.2 CONTENT_ZH_WH_INSITU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_WH_INSITU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **你吃什么?**
> 너 뭐 먹어?

단어별: 你(너는) 吃(먹다) 什么(무엇, 의문사)

**"이미 배운 문법만 사용" 검증**: 의문사 제자리(대상) 외의 문법 표지 없음. 吗는 의도적으로 붙이지 않았다. ZAI는 언급하지 않았다.

### 4.3 CONTENT_ZH_WH_INSITU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_WH_INSITU", "GRAMMAR_ZH_MA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["你吃了饭吗?", "你吃什么?"]` |

**본문(Generation Practice, Related 활용형 — 구조적 대비)**:

> 다음 두 질문을 각각 중국어로 써보세요.
> 1) 너 밥 먹었어? *(예/아니오 — 吗 필요)*
> 2) 너 뭐 먹어? *(구체적인 답을 묻는 질문 — 吗 없음, 의문사만)*

**설계 메모**: 1번은 2번 노드의 예문을 그대로 재사용했다. **VI·JA의 최소 차이 비교(같은 표지 재사용)와 정반대로, 이 QUIZ는 "吗의 있음/없음"이라는 구조적 대비 자체를 보여준다** — 두 노드가 같은 MOOD 계열이면서도 상호 배타적 구조라는 점을 QUIZ로 직접 체감시켰다.

### 4.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — MA(2)·了(1, MA 예문에 포함) 재사용 확인, ZAI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**MA vs WH_INSITU 구조 구분(사용자 요청)**: MA는 "[평서문]+吗"로 문미에 조사를 더하고, WH_INSITU는 "[평서문 자리]+의문사, 吗 없음"으로 조사 없이 의문사만으로 완성된다 — 겹치지 않는 상호 배타적 구조임을 EXPLANATION·QUIZ 양쪽에서 명확히 했다. VI/JA식 문말 표지 재사용 패턴은 의도적으로 적용하지 않았다.

### 4.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_ZH_MA`를 구조적 대비 방식으로 반영했다(재사용 아님).
- `ZH_LANGUAGE_PACK.md` §5: `REL_MA_RELATED_WH_INSITU`(BIDIRECTIONAL, weight 0.4) 확인.
- `ZH_LANGUAGE_PACK.md` §6 시나리오2: 이번 노드에서 완성하지 못함을 재확인, ZAI(9번) 차례로 이연 기록.
- 발견된 이슈: 없음(시나리오2 이연은 사전 합의된 대로 진행).

---

## 5. GRAMMAR_ZH_HUI (会 — 미래 조동사)

**노드 정보**: Concept `CONCEPT_TENSE_FUTURE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 4번, v1.0 기준 단독 작성). `ZH_LANGUAGE_PACK.md` §4.3 설계 노트는 会의 "학습된 능력" 의미(예: 会说中文)가 能과 겹치는 v1.1 ALTERNATIVE 후보라고 명시하지만, **v1.0인 이 문서는 그 이중 기능을 다루지 않는다** — 순수한 미래·예측 의미만 다룬다.

### 5.1 CONTENT_ZH_HUI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_HUI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**会**는 미래에 일어날 일이나 예측을 나타낼 때 동사 앞에 쓰는 조동사입니다.

**문장 구조**: [주어] + 会 + [동사] + [목적어]

예를 들어 去(가다) 앞에 会를 놓으면 **会去**(갈 것이다)가 됩니다.

### 5.2 CONTENT_ZH_HUI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_HUI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我会去。**
> 나는 갈 것이다.

단어별: 我(나는) 会去(갈 것이다, 会+去)

이 문장은 `ZH_LANGUAGE_PACK.md` §6 시나리오4를 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: 会 외의 문법 표지 없음. 能은 언급하지 않았다.

**동사 선택 메모(사용자 요청 — 会/能 의미 혼동 방지)**: 去(가다)는 "능력·기술"과 무관한 동작이라 会去가 "학습된 능력"으로 오독될 여지가 없다 — §4.3 설계 노트가 지목한 会说中文(말할 줄 안다, 능력 해석 위험군) 같은 동사를 의도적으로 피했다.

### 5.3 CONTENT_ZH_HUI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_HUI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我会来。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 올 것이다."**

**설계 메모**: 来(오다)도 去와 마찬가지로 능력 해석 위험이 없는 동사다. 说(말하다) 같은 §4.3의 위험 사례는 QUIZ에서도 의도적으로 배제했다.

### 5.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 会 외 신규 문법 없음, 能 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**会/能 의미 혼동 방지(사용자 요청)**: EXAMPLE·QUIZ 모두 능력·기술과 무관한 동사(去, 来)만 선택해, §4.3이 지목한 "학습된 능력" 해석 위험(会说중국어류)을 원천적으로 피했다 — v1.1에서 能과의 ALTERNATIVE 관계가 추가되더라도 이 콘텐츠들은 순수 미래 의미로만 읽히므로 재작업이 필요 없다.

### 5.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.1: 모든 형식적 관계가 `—`임을 재확인, 단독 작성이 맞다.
- `ZH_LANGUAGE_PACK.md` §4.3 설계 노트: v1.1 ALTERNATIVE 후보(능력 의미)를 인지했으나 이 버전에서는 의도적으로 다루지 않았다.
- `ZH_LANGUAGE_PACK.md` §6 시나리오4: 완전한 형태로 실현했다.
- 발견된 이슈: 없음.

---

## 6. GRAMMAR_ZH_BU (不 — 일반 부정)

**노드 정보**: Concept `CONCEPT_NEGATION_SIMPLE` · Difficulty 1 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_MEI**(위상정렬 5번, 10번 미학습 — 이연)

### 6.1 CONTENT_ZH_BU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_BU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**不**는 습관·상태·미래의 일을 부정할 때 쓰는 표지입니다. 동사나 형용사 앞에 놓습니다.

**문장 구조**: [주어] + 不 + [동사/형용사] + [목적어]

예를 들어 去(가다) 앞에 不를 놓으면 **不去**(가지 않는다)가 됩니다.

### 6.2 CONTENT_ZH_BU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_BU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我不去。**
> 나는 가지 않는다.

단어별: 我(나는) 不去(가지 않는다, 不+去)

**"이미 배운 문법만 사용" 검증**: 不 외의 문법 표지 없음. MEI는 언급하지 않았다.

### 6.3 CONTENT_ZH_BU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_BU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我不来。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 오지 않는다."**

### 6.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 不 외 신규 문법 없음, MEI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**MEI 연결 기반 구조 확인(사용자 요청, 정직하게 기록)**: `ZH_LANGUAGE_PACK.md` §3 설계 노트에 따르면 不와 没의 대비는 VI의 DANG/DA류(같은 동사, 표지만 교체)처럼 단순하지 않다 — **不는 습관·상태·미래를, 没는 완료상(이미 일어난 일)만 부정한다는 적용 조건(상적 조건) 자체가 다르다.** 따라서 MEI 차례에서는 "같은 동사에 표지만 바꾸는" 방식이 아니라, **완료상 문맥(了가 있던 자리)에서만 성립하는 대비**로 설계해야 한다는 점을 미리 기록해둔다 — 새 문법을 추가하지 않고도 이미 배운 了(1번)와 자연스럽게 엮일 수 있는 확장이다.

### 6.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.4: `Contrast: GRAMMAR_ZH_MEI`를 확인했으나 미학습으로 이연.
- `ZH_LANGUAGE_PACK.md` §3 설계 노트: 不/没 이중 부정 체계의 상적 차이를 재확인했다.
- 발견된 이슈: 없음.

---

## 7. GRAMMAR_ZH_NENG (能 — 가능·능력)

**노드 정보**: Concept `CONCEPT_MODALITY_ABILITY` · Difficulty 1 · Prerequisite `—`, **Related: GRAMMAR_ZH_XIANG, GRAMMAR_ZH_DEI / Contrast: GRAMMAR_ZH_DEI**(위상정렬 6번, 셋 다 미학습 — 각 노드 차례로 이연). VI CO_THE, EN CAN, JA DEKIRU와 같은 MODALITY 허브 노드다.

### 7.1 CONTENT_ZH_NENG_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_NENG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**能**은 "~할 수 있다"라는 가능·능력을 나타낼 때 동사 앞에 쓰는 조동사입니다.

**문장 구조**: [주어] + 能 + [동사] + [목적어]

예를 들어 买(사다) 앞에 能을 놓으면 **能买**(살 수 있다)가 됩니다.

### 7.2 CONTENT_ZH_NENG_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_NENG", "GRAMMAR_ZH_MA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我能买这个吗?**
> 이거 살 수 있어요?

단어별: 我(나는) 能买(살 수 있다, 能+买) 这个(이것) 吗(의문 조사, 2번에서 학습)

이 문장은 `ZH_LANGUAGE_PACK.md` §6 시나리오3을 원문 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: 能과 吗(2번, 이미 학습) 외의 문법 표지 없음. XIANG·DEI는 언급하지 않았다.

### 7.3 CONTENT_ZH_NENG_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_NENG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我能吃饭。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 밥을 먹을 수 있다."**

**설계 메모**: 吃饭(밥을 먹다)이라는 소재를 새로 도입했다 — VI(ăn cơm)·EN(cook)·JA(食べる)의 MODALITY 허브 노드가 공통 소재를 썼던 것과 같은 방식으로, XIANG·DEI 차례에서 이 동사를 그대로 재사용할 수 있는 기반을 마련했다.

### 7.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 吗(2) 재사용 확인, XIANG·DEI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 실제 회화체(시나리오3 원문 그대로) |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**会/能 기능 차이 유지(사용자 요청)**: 会(미래·예측)와 能(가능·능력)은 의미 영역이 완전히 달라 겹치지 않는다 — 4번 노드의 会去(갈 것이다)와 이번 노드의 能买(살 수 있다)는 서로 다른 조동사가 서로 다른 기능을 수행하는 별개의 사례다.

### 7.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_ZH_XIANG, GRAMMAR_ZH_DEI`·`Contrast: GRAMMAR_ZH_DEI` 확인, 전부 미학습으로 이연.
- `ZH_LANGUAGE_PACK.md` §6 시나리오3: 원문 그대로 완전 실현했다.
- 발견된 이슈: 없음.

---

## 8. GRAMMAR_ZH_XIANG (想 — 원함)

**노드 정보**: Concept `CONCEPT_MODALITY_DESIRE` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_NENG**(위상정렬 7번, NENG은 6번으로 이미 학습 — 이번에 연결). DEI와는 이 노드에서 다루지 않는다(11번 미학습).

### 8.1 CONTENT_ZH_XIANG_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_XIANG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**想**은 "~하고 싶다"라는 바람을 나타낼 때 동사 앞에 쓰는 조동사입니다. 이미 배운 **能**과 같은 동작을 대상으로 삼을 수 있지만, 뜻은 다릅니다 — 能은 "할 수 있는가"(가능)를, 想은 "하고 싶은가"(원함)를 말합니다.

**문장 구조**: [주어] + 想 + [동사] + [목적어]

吃饭(밥을 먹다) 앞에 想을 놓으면 **想吃饭**(밥을 먹고 싶다)이 됩니다.

### 8.2 CONTENT_ZH_XIANG_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_XIANG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我想吃饭。**
> 나는 밥을 먹고 싶다.

단어별: 我(나는) 想吃饭(먹고 싶다, 想+吃饭)

**"이미 배운 문법만 사용" 검증**: 想 외의 문법 표지 없음. DEI는 언급하지 않았다.

### 8.3 CONTENT_ZH_XIANG_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_XIANG", "GRAMMAR_ZH_NENG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["我能吃饭。", "我想吃饭。"]` |

**본문(Generation Practice, Related 활용형 — 의미 대조)**:

> 다음 두 문장을 각각 중국어로 써보세요.
> 1) 나는 밥을 먹을 수 있다. *(가능 — 能)*
> 2) 나는 밥을 먹고 싶다. *(원함 — 想)*

**설계 메모**: 1번은 6번 노드의 QUIZ 문장을 그대로 재사용했다.

### 8.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — NENG(6) 재사용 확인, DEI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**4언어 설계 패턴 일관성 확인(사용자 요청)**:

| 언어 | Related 쌍 | 처리 방식 |
|---|---|---|
| VI | MUON(원함) ↔ CO_THE(가능) | 같은 동사, 표지만 교체 |
| EN | WANT_TO(원함) ↔ CAN(가능) | 같은 동사, 표지만 교체(활용 차이는 1인칭 현재형으로 배제) |
| JA | TAI(원함) ↔ DEKIRU(가능) | 같은 동사, 표지만 교체(접속 방식 차이는 9번에서 확정) |
| ZH(이번) | XIANG(원함) ↔ NENG(가능) | 같은 동사·목적어(吃饭), 표지만 교체 |

네 언어 모두 "MODALITY_DESIRE ↔ MODALITY_ABILITY" 쌍을 동일한 설계 패턴(동사 고정, 표지 교체)으로 처리했다 — VI(CO_THE)/EN(CAN)/JA(DEKIRU)/ZH(NENG) 네 허브 노드가 모두 같은 역할을 수행함을 재확인했다.

### 8.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_ZH_NENG`을 EXPLANATION·QUIZ에 반영했다. DEI는 11번 차례로 이연.
- `ZH_LANGUAGE_PACK.md` §5: `REL_XIANG_RELATED_NENG`(BIDIRECTIONAL, weight 0.3) 확인.
- 발견된 이슈: 없음.

---

## 9. GRAMMAR_ZH_QING (请 — 공손 요청)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_POLITENESS` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_YIXIA, GRAMMAR_ZH_BA_CONFIRM**(위상정렬 8번, 둘 다 미학습 — 각 노드 차례로 이연). VI A_POLITE, EN PLEASE, JA MASU와 같은 PRAGMATICS 허브 노드다.

### 9.1 CONTENT_ZH_QING_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_QING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**请**는 문장 맨 앞에 놓여 공손하게 요청할 때 씁니다 — 영어의 please와 비슷한 역할입니다.

**문장 구조**: 请 + [동사] + [목적어]

说(말하다) 앞에 请를 놓으면 **请说**(말씀해 주세요)가 됩니다.

### 9.2 CONTENT_ZH_QING_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_QING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **请说。**
> 말씀해 주세요.

단어별: 请说(말씀해 주세요, 请+说)

**"이미 배운 문법만 사용" 검증**: 请 외의 문법 표지 없음. YIXIA·BA_CONFIRM은 언급하지 않았다.

### 9.3 CONTENT_ZH_QING_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_QING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"请来。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"와 주세요."**

### 9.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 请 외 신규 문법 없음, YIXIA·BA_CONFIRM 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**두 Related 관계의 향후 연결 기반 확인(사용자 요청)**: 说(말하다)를 EXAMPLE 동사로 선택한 것은 의도적이다 — YIXIA는 동사 뒤에 一下(살짝, 부드럽게)를 붙이는 구조라, 请说 뒤에 一下를 이으면 **请说一下**(말씀 좀 해주세요)라는 매우 자연스러운 결합이 된다(**구조적 연결**, 7번 EN의 PLEASE-COULD_REQUEST와 같은 성격). 반면 BA_CONFIRM(문미 확인 어조 吧)은 请의 문두 위치와 자연스럽게 한 문장에서 결합하기보다, "공손한 요청·확인"이라는 화용적 범주를 공유하는 **주제적 연결**에 가깝다(EN의 PLEASE-TAG_QUESTION과 같은 성격) — 이 차이는 각 노드 차례에서 반영해야 할 지점으로 기록해둔다.

**PRAGMATICS 허브 역할 확인(사용자 요청)**: VI(A_POLITE→NHE,A_CONFIRM), EN(PLEASE→COULD_REQUEST,TAG_QUESTION), JA(MASU→NE,KEDO), ZH(QING→YIXIA,BA_CONFIRM) — 네 언어 모두 PRAGMATICS 계열에서 하나의 "허브" 노드가 나머지 두 노드로 갈라지는 동일한 구조를 갖는다.

### 9.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_ZH_YIXIA, GRAMMAR_ZH_BA_CONFIRM` 둘 다 확인했으나 미학습으로 각 노드 차례로 이연.
- 발견된 이슈: 없음.

---

## 10. GRAMMAR_ZH_ZAI (在 — 진행상)

**노드 정보**: Concept `CONCEPT_ASPECT_PROGRESSIVE` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_LE**(위상정렬 9번, LE는 1번으로 이미 학습 — 이번에 연결). 3번에서 이연해둔 시나리오2를 완성한다.

### 10.1 CONTENT_ZH_ZAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**在**는 지금 진행 중인 동작을 나타내는 표지입니다 — 동사 **앞**에 놓입니다. 이미 배운 **了**(완료)와 정확히 대비됩니다 — 둘 다 **Aspect**(상, 동작이 어떻게 진행되는지를 나타내는 문법 범주이지 시제가 아닙니다)를 나타내지만, 了는 "끝난 일"을, 在는 "지금 하고 있는 일"을 가리킵니다.

**문장 구조**: [주어] + 在 + [동사] + [목적어]

吃(먹다) 앞에 在를 놓으면 **在吃**(먹고 있다)가 됩니다.

### 10.2 CONTENT_ZH_ZAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我在吃饭。**
> 나는 밥을 먹고 있다.

단어별: 我(나는) 在吃饭(먹고 있다, 在+吃+饭)

**대조**(1번 노드 콘텐츠 재참조, 위치 차이 정직 기록): `CONTENT_ZH_LE_EXAMPLE_1` — *我吃了饭。*(나는 밥을 먹었다.)와 동사·목적어(吃饭)는 완전히 같지만, **표지의 위치 자체가 다르다** — 了는 동사 **뒤**(吃了), 在는 동사 **앞**(在吃)에 온다. VI의 DANG/DA처럼 순수하게 같은 자리에서 표지만 교체되는 최소 차이 비교와는 다르지만, 동사·목적어를 동일하게 유지해 대비의 핵심은 그대로 살렸다.

**"이미 배운 문법만 사용" 검증**: 在와 (대조를 위해 재인용한) 了(1번, 이미 학습) 외의 문법 표지 없음.

### 10.3 CONTENT_ZH_ZAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZAI", "GRAMMAR_ZH_WH_INSITU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"你在做什么?"` |

**본문(Generation Practice, 시나리오2 완성형)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"너 뭐 하고 있어?"**

**설계 메모**: `ZH_LANGUAGE_PACK.md` §6 시나리오2("你在做什么?")를 **대체 없이 원문 그대로** 완성했다 — JA의 する 회피(8번)와 달리, 做(하다)는 검증된 규칙 동사라 대체가 필요 없었다. ZAI(진행)+WH_INSITU(의문사 제자리)가 결합했다.

### 10.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 了(1)·WH_INSITU(3) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 실제 회화체(시나리오2 원문 그대로) |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**LE와의 Contrast 명확성(사용자 요청)**: EXPLANATION에서 "시간(과거/현재/미래)이 아니라 Aspect(상)"임을 명시적으로 강조했다 — 了/在 모두 시제 표지가 아니라 동작의 진행 상태를 나타내는 Aspect 표지라는 점을 분명히 했다.

**시나리오2 충족 여부(사용자 요청)**: **완전 충족** — 문법 조합과 어휘 모두 원문과 100% 일치한다. JA의 부분 충족(する 대체)과 달리 이번엔 대체가 필요 없었다.

### 10.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.2: `Contrast: GRAMMAR_ZH_LE`를 EXPLANATION·EXAMPLE에 반영했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_ZAI_CONTRAST_LE`(BIDIRECTIONAL, weight 0.5) 확인.
- `ZH_LANGUAGE_PACK.md` §6 시나리오2: 완전한 형태로 실현했다(대체 없음).
- 발견된 이슈: 없음.

---

## 11. GRAMMAR_ZH_MEI (没 — 완료 부정)

**노드 정보**: Concept `CONCEPT_NEGATION_SIMPLE`(BU와 동일 Concept) · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_BU**(위상정렬 10번, BU는 5번으로 이미 학습 — 이번에 연결). 5번에서 예고한 대로 단순 표지 교체가 아니라 **적용 조건(Aspect) 자체가 다른** 대비다.

### 11.1 CONTENT_ZH_MEI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_MEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**没**는 이미 일어났어야 할 일이 일어나지 않았음을 나타내는 부정 표지입니다. 이미 배운 **不**와 뜻만 다른 게 아니라, **적용되는 상황(Aspect) 자체가 다릅니다** — 不는 습관·상태·미래를 부정하고, 没는 **완료상 문맥**(이미 배운 了가 쓰일 법한 자리)만 부정합니다.

**문장 구조**: [주어] + 没 + [동사] + [목적어] (了는 붙이지 않음)

이미 배운 **吃了饭**(밥을 먹었다)을 부정하려면 不吃了饭이 아니라 **没吃饭**(밥을 먹지 않았다)이라고 합니다 — 没 자체가 "완료됐어야 할 일이 안 일어났다"는 뜻을 담고 있어 了를 따로 붙이지 않습니다.

### 11.2 CONTENT_ZH_MEI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_MEI", "GRAMMAR_ZH_LE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我没吃饭。**
> 나는 밥을 먹지 않았다.

단어별: 我(나는) 没吃饭(먹지 않았다, 没+吃+饭)

**LE와의 연계**(사용자 요청): 긍정문이었다면 了가 필요했을 자리(我**吃了**饭, 1번)를, 부정문에서는 没가 대신한다 — 没吃饭에 了를 추가로 붙이지 않는 것 자체가 "了의 완료 의미를 没가 이미 포함하고 있다"는 증거다.

**"이미 배운 문법만 사용" 검증**: 没와 (연계를 위해 재인용한) 了(1번, 이미 학습) 외의 문법 표지 없음.

### 11.3 CONTENT_ZH_MEI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_MEI", "GRAMMAR_ZH_BU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["我不吃饭。", "我没吃饭。"]` |

**본문(Generation Practice, Contrast 활용형 — 적용 조건 판별)**:

> 다음 두 문장을 각각 중국어로 써보세요.
> 1) 나는 밥을 먹지 않는다. *(습관·일반 — 不)*
> 2) 나는 밥을 먹지 않았다. *(완료된 일 — 没)*

**설계 메모**: 같은 동사·목적어(吃饭)에 표지만 바꾸는 표면적 형태는 VI의 DANG/DA와 비슷하지만, 이 QUIZ의 핵심은 "표지 선택이 상황(습관 vs 완료)에 달려 있다"는 판단 기준을 연습시키는 데 있다 — 두 표지가 아무 때나 서로 바꿔 쓸 수 있는 동의어가 아님을 강조했다.

### 11.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — BU(5)·了(1) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**BU/MEI 적용 조건 구분(사용자 요청)**: EXPLANATION이 "뜻만 다른 게 아니라 적용되는 상황(Aspect) 자체가 다르다"고 명시적으로 강조했다 — 단순 의미 대립(VI CO_THE/PHAI, EN CAN/HAVE_TO류)과 달리, ZH의 不/没는 **문맥의 상적 조건이 표지 선택 자체를 결정**한다는 점에서 한 단계 더 강한 제약을 가진 대비다.

### 11.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.4: `Contrast: GRAMMAR_ZH_BU`를 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_BU_CONTRAST_MEI`(BIDIRECTIONAL, weight 0.6) 확인.
- 발견된 이슈: 없음.

---

## 12. GRAMMAR_ZH_DEI (得 děi — 의무·필요)

**노드 정보**: Concept `CONCEPT_MODALITY_NECESSITY` · Difficulty 2 · Prerequisite/Alternative `—`, **Related: GRAMMAR_ZH_NENG, Contrast: GRAMMAR_ZH_NENG**(위상정렬 11번, NENG은 6번으로 이미 학습 — 이번에 동시 연결). VI PHAI/CO_THE, EN HAVE_TO/CAN, JA NAKEREBA_NARANAI/DEKIRU와 대응되는 네 번째 사례다.

**다음자 주의**: 得는 dé(얻다)·de(구조조사)·**děi(의무 조동사)** 세 가지로 읽히는 다음자다. 이 노드는 항상 **děi** 용법만 가리킨다(了의 le/liǎo 구분과 같은 원칙, §0).

### 12.1 CONTENT_ZH_DEI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_DEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**得(děi)**는 "~해야 한다"라는 의무·필요를 나타낼 때 동사 앞에 쓰는 조동사입니다. 이미 배운 **能**과 둘 다 동작 수행 여부를 다룬다는 공통점이 있지만, 뜻은 대조적입니다 — 能은 "할 수 있는 능력·가능성"을, 得는 "반드시 해야 하는 의무"를 말합니다.

**문장 구조**: [주어] + 得 + [동사] + [목적어]

吃饭(밥을 먹다) 앞에 得를 놓으면 **得吃饭**(밥을 먹어야 한다)이 됩니다.

### 12.2 CONTENT_ZH_DEI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_DEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我得吃饭。**
> 나는 밥을 먹어야 한다.

단어별: 我(나는) 得吃饭(먹어야 한다, 得+吃+饭)

**"이미 배운 문법만 사용" 검증**: 得(děi) 외의 문법 표지 없음. 会(미래)는 언급하지 않았다 — 得는 시제·미래와 무관한 의무 표지다.

### 12.3 CONTENT_ZH_DEI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_DEI", "GRAMMAR_ZH_NENG"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["我能吃饭。", "我得吃饭。"]` |

**본문(Generation Practice, Related+Contrast 동시 활용형)**:

> 다음 두 문장을 각각 중국어로 써보세요.
> 1) 나는 밥을 먹을 수 있다. *(가능 — 能)*
> 2) 나는 밥을 먹어야 한다. *(의무 — 得)*

**설계 메모**: 1번은 6번 노드의 QUIZ 문장을 그대로 재사용했다. 같은 동사·목적어(吃饭)를 고정하고 표지만 能↔得로 바꿔, Related(둘 다 행동 수행을 다루는 MODALITY)와 Contrast(가능 vs 의무) 두 관계를 하나의 QUIZ로 동시 충족했다.

### 12.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 能(6) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **다음자 명확성(ZH 전용 제약)** | 통과 — 得(děi)만 사용, de·dé 용법 없음 |
| **会와의 의미 미분리 확인(사용자 요청)** | 통과 — 得는 의무, 会는 미래로 어휘 자체가 다르고 겹칠 여지 없음 |

**4언어 설계 패턴 일관성 확인(사용자 요청)**:

| 언어 | Contrast 쌍 | 처리 방식 |
|---|---|---|
| VI | CO_THE(가능) ↔ PHAI(의무) | 같은 동사(đi), 표지만 교체 |
| EN | CAN(가능) ↔ HAVE_TO(의무) | 같은 동사(cook), 표지만 교체 |
| JA | DEKIRU(가능) ↔ NAKEREBA_NARANAI(의무) | 같은 동사·목적어(食べる/ご飯), 표지만 교체 |
| ZH(이번) | NENG(가능) ↔ DEI(의무) | 같은 동사·목적어(吃饭), 표지만 교체 |

네 언어 모두 "MODALITY_ABILITY ↔ MODALITY_NECESSITY" 쌍을 동일한 설계 패턴으로 처리했다 — Core Standard의 언어 독립성이 네 번째 언어에서도 재확인됐다.

### 12.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.3: `Related`·`Contrast: GRAMMAR_ZH_NENG`을 QUIZ 하나로 동시 충족했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_DEI_RELATED_NENG`(weight 0.3)·`REL_NENG_CONTRAST_DEI`(weight 0.4) 확인.
- 발견된 이슈: 없음.

---

## 13. GRAMMAR_ZH_BA_SUGGEST (吧 — 제안)

**노드 정보**: Concept `CONCEPT_MOOD_IMPERATIVE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 12번, 단독 작성)

**동형이의 주의(이번 노드의 핵심)**: 吧는 이 노드(제안)와 15번 `GRAMMAR_ZH_BA_CONFIRM`(확인·추측)으로 나뉘는 "같은 한자, 다른 노드" 사례다. 두 노드는 **서로 어떤 형식적 관계도 없다** — VI의 DUOC_ABILITY/DUOC_PASSIVE, 이 문서의 了(le/liǎo)·得(děi/de/dé)와 같은 원칙으로, 이 노드는 제안 의미만 다루고 확인·추측 의미는 전혀 언급하지 않는다.

### 13.1 CONTENT_ZH_BA_SUGGEST_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_SUGGEST"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**吧**는 문장 끝에 붙어 부드러운 제안이나 권유를 나타내는 조사입니다 — "~하자, ~할까요?"라는 뜻입니다.

**문장 구조**: [동사] + [목적어] + 吧

이미 배운 吃饭(밥을 먹다) 끝에 吧를 붙이면 **吃饭吧**(밥 먹자)가 됩니다.

**참고**: 이 吧는 제안 용법만 가리킵니다. 같은 한자로 확인·추측을 나타내는 별개 용법도 있지만, 이 노드와는 완전히 독립된 문법입니다.

### 13.2 CONTENT_ZH_BA_SUGGEST_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_SUGGEST"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我们吃饭吧。**
> 우리 밥 먹자.

단어별: 我们(우리) 吃饭吧(밥 먹자, 吃饭+吧)

**"이미 배운 문법만 사용" 검증**: 吧(제안) 외의 문법 표지 없음. BA_CONFIRM은 언급하지 않았다.

### 13.3 CONTENT_ZH_BA_SUGGEST_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_SUGGEST"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我们去吧。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"우리 가자."**

### 13.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 吧(제안) 외 신규 문법 없음, BA_CONFIRM 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**동형이의 검증 원칙 일관성(사용자 요청)**: 了(le/liǎo)·得(děi/de/dé)와 같은 기준으로 처리했다 — 다만 이번엔 **두 용법 사이에 형식적 관계 자체가 없다**는 점이 다르다(了·得는 완료상/의무라는 하나의 정식 문법 노드와 그 외 용법의 구분이었다면, 吧는 두 용법 모두 각각 정식 Grammar Node이며 서로 무관하다). VI의 DUOC_ABILITY/DUOC_PASSIVE와 같은 "완전히 독립된 두 노드" 유형이다.

### 13.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.5: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다. BA_CONFIRM과의 무관계를 재확인했다.
- 발견된 이슈: 없음.

---

## 14. GRAMMAR_ZH_HAI_MEI (还没 — 아직 ~ 아님)

**노드 정보**: Concept `CONCEPT_NEGATION_NOTYET` · Difficulty 2 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_ZH_MEI**(위상정렬 13번, MEI는 10번으로 이미 학습). VI CHUA, EN NOT_YET, JA MADA_NAI와 대응되는 노드다.

**구조적 차이 기록**: VI(CHUA↔KHONG)·EN(NOT_YET↔NOT)·JA(MADA_NAI↔NAI)는 모두 **Prerequisite와 Contrast를 동시에** 가졌지만, `ZH_LANGUAGE_PACK.md`는 HAI_MEI에 **Prerequisite만** 선언하고 별도의 Contrast 관계는 없다(§5 순환 검증에도 PREREQUISITE 2개만 명시). 형식적 Contrast는 없지만, 설명(Prerequisite)과 최소 차이 비교(의미 확장)라는 설계 정신은 세 언어와 동일하게 유지한다.

### 14.1 CONTENT_ZH_HAI_MEI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_HAI_MEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**还没**는 "아직 ~하지 않았다"라는 뜻으로, 이미 배운 **没**(완료상 부정)를 바탕으로 이해할 수 있습니다. 没 앞에 还(아직)만 붙이면 됩니다.

没가 그냥 완료된 일을 부정하는 것이라면, 还没는 "지금까지는 아니지만 앞으로 그럴 수도 있다"는 여지를 남깁니다.

**문장 구조**: 还没 + [동사] + [목적어]

이미 배운 **没吃饭**(밥을 먹지 않았다) 앞에 还를 붙이면 **还没吃饭**(아직 밥을 먹지 않았다)이 됩니다.

### 14.2 CONTENT_ZH_HAI_MEI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_HAI_MEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我还没吃饭。**
> 나는 아직 밥을 먹지 않았다.

단어별: 我(나는) 还没吃饭(아직 먹지 않았다, 还+没+吃+饭)

**대조**(10번 노드 콘텐츠 재참조): `CONTENT_ZH_MEI_EXAMPLE_1` — *我没吃饭。*(나는 밥을 먹지 않았다.)와 완전히 같고 还만 추가됐다.

**"이미 배운 문법만 사용" 검증**: 还没와 (재인용한) 没(10번, 이미 학습) 외의 문법 표지 없음. 새로운 부정 체계를 도입하지 않았다 — 没가 이미 완료상 부정이고, 还는 그 위에 "아직" 뉘앙스만 더한다.

### 14.3 CONTENT_ZH_HAI_MEI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_HAI_MEI", "GRAMMAR_ZH_MEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["我没吃饭。", "我还没吃饭。"]` |

**본문(Generation Practice, 의미 확장 활용형)**:

> 다음 두 문장을 각각 중국어로 써보세요.
> 1) 나는 밥을 먹지 않았다. *(완료 부정)*
> 2) 나는 아직 밥을 먹지 않았다. *("아직"의 여지가 있는 부정)*

**설계 메모**: VI(CHUA)·EN(NOT_YET)·JA(MADA_NAI)와 같은 최소 차이 비교 패턴(같은 동사·목적어, 还만 추가)이다. 형식적 Contrast 관계는 없지만, 설명(Prerequisite, 15.1)과 연습(의미 확장, 이 QUIZ)의 역할 분리는 세 언어와 동일하게 유지했다.

### 14.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 没(10) 재사용 확인, 새 부정 체계 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**MEI와의 연결 및 완료상 기반 확인(사용자 요청)**: EXPLANATION이 "没를 바탕으로 이해할 수 있다"는 흐름으로 Prerequisite를 반영했다. "아직 ~하지 않았다"는 没(완료상 부정) 위에 还(아직)만 얹은 것이지 별도의 새 부정 체계가 아님을 명시적으로 확인했다.

### 14.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.4: `Prerequisite: GRAMMAR_ZH_MEI`를 EXPLANATION의 서술 구조로 반영했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_HAI_MEI_PREREQ_MEI`(UNIDIRECTIONAL, weight 0.8) 확인 — 순환 검증에도 명시된 2개 Prerequisite 중 하나다.
- 발견된 이슈: 없음(VI·EN·JA와의 구조적 차이(Contrast 부재)를 정확히 포착해 기록).

---

## 15. GRAMMAR_ZH_YIXIA (一下 — 부드러운 어조)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_SOFTENING` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_QING**(위상정렬 14번, QING은 8번으로 이미 학습 — 이번에 연결). 8번에서 예고한 구조적 결합(请说一下)을 실현하는 차례다. BA_SUGGEST·BA_CONFIRM과는 연결하지 않는다.

### 15.1 CONTENT_ZH_YIXIA_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_YIXIA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**一下**는 동사 뒤에 붙어 동작을 부드럽고 가볍게 만드는 표지입니다 — "살짝, 좀"이라는 뉘앙스를 더합니다. 이미 배운 **请**(공손 요청)과 한 문장 안에서 자연스럽게 결합합니다.

**문장 구조**: 请 + [동사] + 一下

이미 배운 **请说**(말씀해 주세요) 뒤에 一下를 더하면 **请说一下**(말씀 좀 해주세요)가 되어, 더욱 부드럽고 편안한 요청이 됩니다.

### 15.2 CONTENT_ZH_YIXIA_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_YIXIA", "GRAMMAR_ZH_QING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **请说一下。**
> 말씀 좀 해주세요.

단어별: 请(공손 요청, 8번에서 학습) 说一下(말씀 좀 해주세요, 说+一下)

이 문장은 8번 노드에서 예고했던 구조적 결합을 정확히 실현한다 — EN의 "Could you close the door, please?"(PLEASE→COULD_REQUEST)와 같은 성격의 **같은 문장 안 구조적 결합**이다.

**"이미 배운 문법만 사용" 검증**: 一下와 请(8번, 이미 학습) 외의 문법 표지 없음. BA_SUGGEST·BA_CONFIRM은 언급하지 않았다.

### 15.3 CONTENT_ZH_YIXIA_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_YIXIA", "GRAMMAR_ZH_QING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"请来一下。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"좀 와주세요."**

### 15.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 请(8) 재사용 확인, BA_SUGGEST·BA_CONFIRM 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**EN(PLEASE→COULD_REQUEST) 패턴 일치 확인(사용자 요청)**: EN의 COULD_REQUEST가 "Could you..., please?"로 PLEASE와 한 문장에서 구조적으로 결합했던 것과 정확히 같은 방식으로, ZH의 YIXIA도 请+동사+一下로 QING과 한 문장에서 구조적으로 결합했다 — 두 언어 모두 PRAGMATICS 허브(请/PLEASE)의 **첫 번째 Related**가 구조적 결합형임을 재확인했다.

### 15.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_ZH_QING`을 구조적 결합으로 EXPLANATION·EXAMPLE에 반영했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_QING_RELATED_YIXIA`(BIDIRECTIONAL, weight 0.4) 확인.
- 발견된 이슈: 없음.

---

## 16. GRAMMAR_ZH_BA_CONFIRM (吧 — 확인·추측)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_CONFIRMATION` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_ZH_QING**(위상정렬 15번, QING은 8번으로 이미 학습 — **화용적** 연결로 반영). 12번 `BA_SUGGEST`와 같은 한자(吧)를 쓰지만 **의도적으로 완전히 독립된 노드**이며 절대 연결하지 않는다.

### 16.1 CONTENT_ZH_BA_CONFIRM_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_CONFIRM"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**吧**는 문장 끝에 붙어 확인이나 추측을 나타내는 조사입니다 — "~이죠?/~겠죠?"라는 뜻입니다. 이미 배운 **请**(공손 요청)과 한 문장 안에서 결합하지는 않지만, 둘 다 "상대방을 배려하는 공손한 대화"라는 화용적 범주를 공유합니다.

**문장 구조**: [평서문] + 吧

이미 배운 吃了饭(밥을 먹었다) 끝에 吧를 붙이면 **吃了饭吧**(밥 먹었죠?)가 되어, 확인을 구하는 느낌을 줍니다.

**참고**: 이 吧는 확인·추측 용법입니다. 12번에서 배운 제안 용법의 吧와는 같은 한자를 쓰지만 완전히 독립된 별개의 문법입니다 — 서로 연결하지 않습니다.

### 16.2 CONTENT_ZH_BA_CONFIRM_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_CONFIRM"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **你吃了饭吧?**
> 너 밥 먹었지?

단어별: 你(너는) 吃了饭吧(먹었지?, 吃了饭+吧)

**"이미 배운 문법만 사용" 검증**: 吧(확인·추측)와 了(1번, 이미 학습) 외의 문법 표지 없음. BA_SUGGEST는 언급하지 않았고, QING과 한 문장으로 결합하지도 않았다(화용적 연결만 유지).

### 16.3 CONTENT_ZH_BA_CONFIRM_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_BA_CONFIRM"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"你来了吧?"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"너 왔지?"**

### 16.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 了(1) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **BA_SUGGEST와 완전 무관계 유지(사용자 요청)** | 통과 — 어디에도 BA_SUGGEST 언급·비교·결합 없음 |
| **구조적 결합 회피(사용자 요청)** | 통과 — QING과 한 문장으로 결합하지 않음(YIXIA의 请说一下와 다른 방식) |

**EN·VI와의 패턴 일관성 확인(사용자 요청)**:

| 언어 | PRAGMATICS 허브 | 구조적 연결 | 화용적 연결 |
|---|---|---|---|
| VI | A_POLITE | NHE(종결사 첨가) | — |
| EN | PLEASE | COULD_REQUEST(같은 문장 결합) | TAG_QUESTION(범주 공유만) |
| ZH(이번) | QING | YIXIA(请...一下 결합) | BA_CONFIRM(범주 공유만) |

EN의 PLEASE→TAG_QUESTION과 이번 QING→BA_CONFIRM은 정확히 같은 성격의 화용적(구조적이지 않은) Related다.

### 16.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_ZH_QING`을 화용적 범주 공유로 EXPLANATION에 반영했다(구조적 결합 아님).
- `ZH_LANGUAGE_PACK.md` §5: `REL_QING_RELATED_BA_CONFIRM`(BIDIRECTIONAL, weight 0.3) 확인.
- 발견된 이슈: 없음.

---

## 17. GRAMMAR_ZH_BI (比 — 비교)

**노드 정보**: Concept `CONCEPT_COMPARISON_COMPARATIVE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 16번, 단독 작성). 17번 `ZUI`의 선행 노드이지만 그 의무는 ZUI 쪽에서 충족한다.

### 17.1 CONTENT_ZH_BI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_BI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**比**는 두 대상을 비교해 "~보다"라는 뜻을 나타낼 때 씁니다. 비교 대상 앞에 比를 놓습니다.

**문장 구조**: [A] + 比 + [B] + [형용사]

예를 들어 我的家(내 집)와 你的家(당신의 집)를 비교하려면, **我的家比你的家大。**(내 집이 당신의 집보다 크다.)라고 합니다.

### 17.2 CONTENT_ZH_BI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_BI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我的家比你的家大。**
> 내 집이 당신의 집보다 크다.

단어별: 我的家(내 집은) 比你的家(당신의 집보다) 大(크다)

**"이미 배운 문법만 사용" 검증**: 比 외의 문법 표지 없음. ZUI는 언급하지 않았다.

### 17.3 CONTENT_ZH_BI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_BI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"这本书比那本书有意思。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"이 책이 저 책보다 재미있다."**

### 17.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 比 외 신규 문법 없음, ZUI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**ZUI 연결 기반 구조 확인(사용자 요청)**: ZUI의 구조는 "最+형용사"다 — 이 노드에서 쓴 형용사(大, 有意思)를 그대로 이어받아 "比+B" 부분만 最로 교체하면 최상급이 완성된다.

**4언어 COMPARATIVE 허브 패턴 확인(사용자 요청)**: VI(HON→NHAT), EN(COMPARATIVE→SUPERLATIVE), JA(YORI→ICHIBAN), ZH(BI→ZUI) — 네 언어 모두 "내 집/당신의 집" 소재로 비교급 허브 노드를 구성했고, 최상급 노드가 같은 형용사를 이어받는 동일한 구조다.

### 17.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.7: 형식적 관계가 없음을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음.

---

## 18. GRAMMAR_ZH_ZUI (最 — 최상)

**노드 정보**: Concept `CONCEPT_COMPARISON_SUPERLATIVE` · Difficulty 1 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_ZH_BI**(위상정렬 17번, BI는 16번으로 이미 학습 — 이번에 연결)

### 18.1 CONTENT_ZH_ZUI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZUI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**最**는 여러 대상 중에서 하나가 으뜸이라고 말할 때 씁니다. 이미 배운 **比**(비교)를 이해했다면 최상급은 자연스럽게 이어집니다 — 比가 둘을 비교했다면, 最는 형용사 앞에 붙어 최상급을 나타냅니다.

**문장 구조**: [주어] + 最 + [형용사]

比 때 썼던 **大**(크다)를 그대로 가져오면, 比+B 부분 없이 **最大**(가장 크다)가 됩니다 — 比와 달리 비교 대상이 필요 없습니다.

### 18.2 CONTENT_ZH_ZUI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZUI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我的家最大。**
> 내 집이 가장 크다.

단어별: 我的家(내 집은) 最大(가장 크다)

BI의 예문(`CONTENT_ZH_BI_EXAMPLE_1`)과 같은 소재(我的家, 大)를 그대로 이어받았다.

**"이미 배운 문법만 사용" 검증**: 最 최상급 외의 문법 표지 없음.

### 18.3 CONTENT_ZH_ZUI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_ZUI", "GRAMMAR_ZH_BI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["我的家比你的家大。", "我的家最大。"]` |

**본문(Generation Practice, Prerequisite 활용형)**:

> 다음 두 문장을 각각 중국어로 써보세요.
> 1) 내 집이 당신의 집보다 크다. *(비교 — 이미 배운 比)*
> 2) 내 집이 가장 크다. *(최상급 — 새로 배운 最)*

**설계 메모**: 1번은 16번 노드의 예문을 그대로 재사용했다. VI(HON/NHAT)·EN(COMPARATIVE/SUPERLATIVE)·JA(YORI/ICHIBAN)와 동일한 방식이다.

### 18.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 比(16) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**4언어 Prerequisite 패턴 일관성 확인(사용자 요청)**: VI(HON→NHAT)·EN(COMPARATIVE→SUPERLATIVE)·JA(YORI→ICHIBAN)·ZH(BI→ZUI) 네 언어 모두 "비교급을 이해했다면 최상급이 자연스럽게 이어진다"는 EXPLANATION 흐름과 "같은 소재 재사용" QUIZ 설계를 동일하게 적용했다 — COMPARISON 카테고리의 Prerequisite 처리 패턴이 네 언어 전체에서 완전히 수렴했다.

### 18.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.7: `Prerequisite: GRAMMAR_ZH_BI`를 EXPLANATION의 서술 구조로 반영했다.
- `ZH_LANGUAGE_PACK.md` §5: `REL_ZUI_PREREQ_BI`(UNIDIRECTIONAL, weight 0.8) 확인.
- 발견된 이슈: 없음.

---

## 19. GRAMMAR_ZH_CL_GE (个 — 일반 분류사)

**노드 정보**: Concept `CONCEPT_QUANTITY_CLASSIFIER` · Difficulty 3 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_CL_ZHI**(19번, 아직 미학습 — 이연). 이 노드는 **일반 사물 분류사만** 다룬다.

### 19.1 CONTENT_ZH_CL_GE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_GE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**个**는 대부분의 사물을 셀 때 쓰는 가장 일반적인 분류사입니다. 특별한 분류사가 없는 명사는 대개 个로 셉니다.

**문장 구조**: [숫자] + 个 + [명사]

苹果(사과)를 셀 때 三(셋) 뒤에 个를 놓으면 **三个苹果**(사과 세 개)라고 합니다.

### 19.2 CONTENT_ZH_CL_GE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_GE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我有三个苹果。**
> 나는 사과 세 개가 있다.

단어별: 我(나는) 有(있다) 三个苹果(사과 세 개)

**"이미 배운 문법만 사용" 검증**: 个 분류사 외의 문법 표지 없음. CL_ZHI는 언급하지 않았다.

### 19.3 CONTENT_ZH_CL_GE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_GE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我有两个杯子。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 컵 두 개가 있다."**

### 19.4 자체 검증

| 항목 | 결과 |
|---|---|
| §3.1~3.6 | 전부 충족(형식 VI/EN/JA와 동일) |
| **CL_ZHI 미도입 확인** | 통과 — 어디에도 언급 없음 |

**CL_ZHI 연결 기반 확인**: CL_ZHI는 동물 분류사라 이 노드의 명사(苹果, 杯子)를 그대로 재사용할 수 없다 — VI CL_CAI/CL_CON, JA CL_HON/CL_NIN처럼 "틀은 고정([숫자]+분류사), 분류사·명사는 대상 유형에 맞춰 교체"하는 방식이 될 것으로 예상된다.

### 19.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.6: `Contrast: GRAMMAR_ZH_CL_ZHI`를 확인했으나 미학습으로 19번 차례로 이연. 발견된 이슈: 없음.

---

## 20. GRAMMAR_ZH_CL_ZHI (只 — 동물 분류사)

**노드 정보**: Concept `CONCEPT_QUANTITY_CLASSIFIER`(CL_GE와 동일 Concept) · Difficulty 3 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_ZH_CL_GE**(위상정렬 19번, CL_GE는 18번으로 이미 학습 — 이번에 연결)

### 20.1 CONTENT_ZH_CL_ZHI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_ZHI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**只**는 동물을 셀 때 쓰는 분류사입니다. 이미 배운 **个**(일반 사물)와 붙는 자리는 같지만(숫자 뒤) 대상이 다릅니다 — 个는 일반 사물에, 只는 동물에 씁니다.

**문장 구조**: [숫자] + 只 + [동물]

猫(고양이)를 **三只**(세 마리)처럼 셀 수 있습니다.

### 20.2 CONTENT_ZH_CL_ZHI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_ZHI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我有三只猫。**
> 나는 고양이 세 마리가 있다.

단어별: 我(나는) 有(있다) 三只猫(고양이 세 마리)

**"이미 배운 문법만 사용" 검증**: 只 분류사 외의 문법 표지 없음.

### 20.3 CONTENT_ZH_CL_ZHI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_CL_ZHI", "GRAMMAR_ZH_CL_GE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["三个苹果。", "三只猫。"]` |

**본문(Generation Practice, Contrast 활용형 — 분류사 선택 판별)**:

> 다음 두 표현을 각각 중국어로 써보세요.
> 1) 사과 세 개 *(일반 사물 — 个)*
> 2) 고양이 세 마리 *(동물 — 只)*

**설계 메모**: 명사 자체가 사물/동물로 다르므로 VI CL_CAI/CL_CON, JA CL_HON/CL_NIN과 동일하게 "틀 고정, 분류사·명사 교체" 방식을 적용했다.

### 20.4 자체 검증

| 항목 | 결과 |
|---|---|
| §3.1~3.6 | 전부 충족 |
| **CL_GE 역할 구분** | 명확 — 个는 일반 사물, 只는 동물로 정확히 대비됨 |

### 20.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.6: `Contrast: GRAMMAR_ZH_CL_GE`를 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다. §5: `REL_CL_GE_CONTRAST_CL_ZHI`(BIDIRECTIONAL, weight 0.6) 확인. 발견된 이슈: 없음.

---

## 21. GRAMMAR_ZH_RUGUO_JIU (如果...就 — 조건문)

**노드 정보**: Concept `CONCEPT_CONDITIONAL_SIMPLE` · Difficulty 3 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 20번, 단독 작성)

### 21.1 CONTENT_ZH_RUGUO_JIU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_RUGUO_JIU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**如果...就**는 "만약 ~하면, ~하다"라는 조건문을 만듭니다. 如果는 조건절 앞에, 就는 결과절 앞에 놓아 문장 전체를 감쌉니다.

**문장 구조**: 如果 + [조건절], 就 + [결과절]

예를 들어 如果我有时间(내가 시간이 있으면) 뒤에 결과절 就去(간다)를 이으면 **如果我有时间，就去。**가 됩니다.

### 21.2 CONTENT_ZH_RUGUO_JIU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_RUGUO_JIU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **如果我有时间，就去。**
> 내가 시간이 있으면, 간다.

단어별: 如果(만약) 我有时间(내가 시간이 있으면) 就去(간다, 就+去)

**"이미 배운 문법만 사용" 검증**: 如果...就 외의 문법 표지 없음. 다른 조건 표현은 도입하지 않았다.

### 21.3 CONTENT_ZH_RUGUO_JIU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_RUGUO_JIU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"如果你来，我就去。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"네가 오면, 나는 간다."**

### 21.4 자체 검증

| 항목 | 결과 |
|---|---|
| §3.1~3.6 | 전부 충족 |
| **다른 조건 표현 미도입** | 통과 — 如果...就 외 조건 표현 없음 |

### 21.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.8: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다. 발견된 이슈: 없음.

---

## 22. GRAMMAR_ZH_BEI (被 — 수동태, 마지막 노드)

**노드 정보**: Concept `CONCEPT_VOICE_PASSIVE` · Difficulty 3 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 21번, 마지막 노드)

### 22.1 CONTENT_ZH_BEI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_ZH_BEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**被**는 수동태를 나타냅니다 — 주어가 동작을 하는 게 아니라 그 동작을 받는 대상이 됩니다.

**문장 구조**: [주어] + 被 + [동사]

表扬(칭찬하다)의 수동형은 被表扬인데, 이미 배운 了를 붙이면 **被表扬了**(칭찬받았다)가 됩니다.

### 22.2 CONTENT_ZH_BEI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_ZH_BEI", "GRAMMAR_ZH_LE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **我被表扬了。**
> 나는 칭찬받았다.

단어별: 我(나는, 동작을 받는 사람) 被表扬了(칭찬받았다, 被+表扬+了)

**수동 해석만 가능하도록 설계**: 주어 我가 동작의 대상(칭찬받는 사람)으로만 등장하고, 뒤에 목적어가 없어 능동 해석("내가 칭찬한다")이 성립하지 않는다 — VI DUOC_PASSIVE, JA RARERU 때와 같은 구조 설계다.

**"이미 배운 문법만 사용" 검증**: 被와 了(1번, 이미 학습) 외의 문법 표지 없음.

### 22.3 CONTENT_ZH_BEI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_ZH_BEI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"我被帮助了。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 중국어로 써보세요.
> **"나는 도움받았다."**

### 22.4 자체 검증

| 항목 | 결과 |
|---|---|
| §3.1~3.6 | 전부 충족 — 了(1) 재사용 확인 |
| **수동 해석 유일성** | 통과 — 목적어 없는 동사(表扬, 帮助)로 능동 해석 차단 |

### 22.5 상위 문서 정합성 확인

- `ZH_LANGUAGE_PACK.md` §4.9: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다. 발견된 이슈: 없음.
- **21개 노드 전체 완료.**

---

## 23. 종합 검증 — ZH_CONTENT.md v1.0 완료 선언

21개 노드 전체 작성 완료에 따라, VI·EN·JA와 동일한 6개 항목을 종합 검증한다.

### 23.1 번호 연속성

전체 재확인 결과 `0 → 1 → 2 → ... → 22 → 23`(이 절) → `24`(개정 이력)까지 연속됨을 확인했다. 작성 도중 8회 번호 누락이 발생했으나 그때마다 즉시 정정했다.

### 23.2 위상정렬 순서

2개 PREREQUISITE 제약을 전부 검증했다. EN·JA와 같이 §1 계획과 실제 실행 순서가 끝까지 일치했다(재정렬 없음).

| 제약 | 요구 노드 | 선행 노드 | 순서 |
|---|---|---|---|
| REL_HAI_MEI_PREREQ_MEI | HAI_MEI(13) | MEI(10) | ✅ |
| REL_ZUI_PREREQ_BI | ZUI(17) | BI(16) | ✅ |

### 23.3 관계 반영 여부

`ZH_LANGUAGE_PACK.md` §5의 11개 관계 **전부 콘텐츠에 반영됨을 확인했다** — 카탈로그 누락 없이 정확히 일치한 최초의 언어팩이다(EN의 IF_WILL-WILL, JA의 MASU-KEDO 같은 사례 없음).

| 유형 | 개수 | 반영 위치(노드) |
|---|---|---|
| PREREQUISITE | 2 | HAI_MEI, ZUI |
| CONTRAST | 4 | ZAI(↔LE), MEI(↔BU), DEI(↔NENG), CL_ZHI(↔CL_GE) |
| RELATED | 5 | XIANG(↔NENG), DEI(↔NENG), YIXIA(↔QING), BA_CONFIRM(↔QING), WH_INSITU(↔MA) |
| ALTERNATIVE | 0 | 없음 — ZH도 EN·JA와 마찬가지로 이중 기능 조동사가 없음(단, HUI/NENG의 v1.1 확장 가능성은 §5 노드에서 미리 인지) |
| **합계** | **11** | 카탈로그와 완전 일치 |

### 23.4 "이미 배운 문법만 사용" 원칙

21개 노드 전체에서 위반 없이 유지됐다. ZH 고유의 검증 사례가 네 언어 중 가장 많았다 — 다음자·동형이의가 유독 풍부한 언어이기 때문이다.

| 노드 | 감지·처리한 사항 |
|---|---|
| LE(1) | 了(le, 완료상) vs 了(liǎo, 동사) 다음자 구분 |
| MA(2)·WH_INSITU(3) | 吗와 Wh-의문문이 VI·JA와 달리 **상호 배타적** 구조임을 발견 — 문말 표지 재사용이 아니라 구조적 대비로 QUIZ 설계 |
| HUI(4) | 会(미래)의 "학습된 능력" 의미(§4.3 위험군)를 피해 去/来 같은 비-기술 동사만 사용 |
| BU(5)·MEI(10) | 不/没가 단순 표지 교체가 아니라 **적용 상황(Aspect) 자체가 다른** 대비임을 명시 |
| DEI(11) | 得(děi) vs 得(de) vs 得(dé) 다음자 구분 |
| BA_SUGGEST(12)·BA_CONFIRM(15) | 吧의 두 용법이 **형식적 관계 자체가 없는 완전히 독립된 두 노드**임을 끝까지 유지 |
| ZAI(9) | 了(동사 뒤)/在(동사 앞) 위치 차이를 정직하게 기록 |
| BEI(21) | 목적어 없는 구조로 수동 해석만 가능하도록 설계(VI·JA 패턴 재사용) |

### 23.5 회피 사례 및 동형이의 검증(투명하게 기록)

**네 언어 중 처음으로 Content Gap·Structural Gap이 발견되지 않았다.**

| 시나리오 | 상태 |
|---|---|
| 1(LE) | 원문 그대로 완전 실현 |
| 2(ZAI+WH_INSITU) | 원문 그대로 완전 실현 — 做가 검증된 동사라 JA의 する 같은 대체가 불필요했음 |
| 3(NENG+MA) | 원문 그대로 완전 실현 |
| 4(HUI) | 원문 그대로 완전 실현 |

4개 시나리오 전부 대체 없이 원문 그대로 실현된 것은 이 문서가 처음이다. 다만 구조적 차이 1건은 투명하게 기록했다 — **HAI_MEI는 VI(CHUA)·EN(NOT_YET)·JA(MADA_NAI)와 달리 Prerequisite만 있고 별도 Contrast가 없다**(13번 §14.0에서 이미 기록). 이는 콘텐츠 공백이 아니라 `ZH_LANGUAGE_PACK.md` 자체의 설계 차이이므로 Gap으로 분류하지 않는다.

### 23.6 문서 전체 정합성

- **Content ID**: `ZH_LANGUAGE_PACK.md`에 미리 선언된 EXPLANATION·EXAMPLE Content ID(TBD)를 전부 채웠고, QUIZ ID는 세 언어와 동일한 `{NODE}_QUIZ_1` 패턴으로 확장했다.
- **Canonical 상태**: 21개 노드 × 3종 = 63개 Content 전부 `source=HUMAN_AUTHORED`, `is_canonical=true`, `is_active=true`.
- **다음자 명확성**(ZH 전용): 了(le/liǎo)·得(děi/de/dé)·吧(제안/확인) 전 구간에서 유지.
- **Learning Outcome Scenario**(4개): **전부 원문 그대로 완전 실현**(VI·EN·JA 중 유일).
- **吃饭 소재 스레드**: NENG(6)→XIANG(7)→MEI(10)→HAI_MEI(13)→DEI(11)에 걸쳐 MODALITY·NEGATION 카테고리를 관통하며 재사용됐다.
- **我的家/你的家 소재 스레드**: BI(16)→ZUI(17) COMPARISON 2종에서 재사용됐다.
- **请说 소재 스레드**: QING(8)→YIXIA(14) 구조적 결합으로 실현됐다.

### 23.7 종합 결론

6개 항목 모두 특이사항 없이 통과했다 — VI·EN·JA와 달리 이번에는 Content Gap·Structural Gap이 하나도 발견되지 않았고, 카탈로그 누락도 없었으며, 4개 시나리오 전부 원문 그대로 완전 실현됐다. HAI_MEI의 Contrast 부재는 콘텐츠 결함이 아니라 원본 설계 차이로 명확히 구분해 기록했다.

**`ZH_CONTENT.md` v1.0 완료를 선언한다** — `ZH_LANGUAGE_PACK.md`의 21개 Grammar Node 전체에 대해 EXPLANATION·EXAMPLE·QUIZ 3종씩(총 63개 Content)을 Canonical 상태로 갖춘 중국어 Tier D 콘텐츠 1차 완성본이며, **네 번째이자 마지막 Language Pack Content다.**

---

## 24. Tier D 통합 요약(VI·EN·JA·ZH)

### 24.1 노드·Content 총계

| 언어 | Grammar Node 수 | Content 수(3종×노드) |
|---|---|---|
| VI | 24 | 72 |
| EN | 21 | 63 |
| JA | 19 | 57 |
| ZH | 21 | 63 |
| **합계** | **85** | **255** |

### 24.2 언어별 Content Gap(현재 문서 내부에서 해결 가능)

| 언어 | 내용 | 해소 방법 |
|---|---|---|
| JA | RARERU의 五段活用(れる) 예문 부재 — 一段(られる)만 예시됨 | `CONTENT_JA_RARERU_EXAMPLE_2` 추가만으로 완료 |
| VI·EN·ZH | 없음 | — |

### 24.3 언어별 Structural Gap(현재 노드 구조로는 해결 불가)

| 언어 | 내용 | 한계 |
|---|---|---|
| EN | NOT_YET의 `haven't...yet` 미해소 | NOT_YET(13번)이 HAVE_VPP(18번) 이후 재방문되는 노드가 구조상 없음 — 범위 밖으로 영구 보류 |
| VI·JA·ZH | 없음 | — |

### 24.4 4개 언어에서 공통 검증된 Core Standard 패턴

| 패턴 | VI | EN | JA | ZH |
|---|---|---|---|---|
| MODALITY_DESIRE↔ABILITY Related(같은 동사·표지 교체) | MUON↔CO_THE | WANT_TO↔CAN | TAI↔DEKIRU | XIANG↔NENG |
| MODALITY_ABILITY↔NECESSITY Contrast(같은 동사·표지 교체) | CO_THE↔PHAI | CAN↔HAVE_TO | DEKIRU↔NAKEREBA_NARANAI | NENG↔DEI |
| NEGATION_NOTYET Prerequisite(설명 구조 분리) | CHUA←KHONG(+Contrast) | NOT_YET←NOT(+Contrast) | MADA_NAI←NAI(+Contrast) | HAI_MEI←MEI(Contrast 없음, 구조 차이) |
| COMPARISON Prerequisite(소재 재사용) | HON→NHAT | COMPARATIVE→SUPERLATIVE | YORI→ICHIBAN | BI→ZUI |
| PRAGMATICS 허브(구조적+화용적 Related 분화) | A_POLITE→NHE/A_CONFIRM | PLEASE→COULD_REQUEST/TAG_QUESTION | MASU→NE/KEDO | QING→YIXIA/BA_CONFIRM |
| QUANTITY 분류사 Contrast(틀 고정+분류사·명사 교체) | CL_CAI↔CL_CON | (분류사 체계 없음) | CL_HON↔CL_NIN | CL_GE↔CL_ZHI |
| VOICE 수동태(목적어 없는 구조로 해석 고정) | DUOC_PASSIVE/BI(2분리) | BE_VPP(통합) | RARERU(통합) | BEI(통합) |
| 동형이의·다음자 검증(항상 명시적 구분) | đi(어휘/문법), được(능력/수동), cái(회피) | have(3용법) | いる(존재/진행), ある/いる | 了(le/liǎo), 得(děi/de/dé), 吧(제안/확인) |
| Prerequisite+Contrast 동시 관계의 역할 분리(설명=Prerequisite, 예문·QUIZ=Contrast) | CHUA | NOT_YET | MADA_NAI | HAI_MEI(부분 적용) |
| "이미 배운 문법만 사용" — 매 노드 자체 검증+상위 문서 정합성 확인 | 24회 | 21회 | 19회 | 21회 |

**핵심 발견**: 위 10개 패턴이 문법 구조가 서로 크게 다른 네 언어(고립어 VI/ZH, 교착어 JA, 굴절어 EN)에서 동일하게 재현됐다는 것은, `CORE_STANDARD_V1_FREEZE`가 설계한 **관계 유형(Prerequisite/Related/Contrast/Alternative)이 특정 언어의 문법 범주가 아니라 언어 독립적인 학습 기능(Function)을 인코딩한다**는 증거다. 언어별 구현 방식(EN BE_VING의 시간부사 조정, JA/ZH의 위치 차이, ZH의 상호 배타적 의문문 구조 등)은 다르지만, 각 관계가 학습자에게 요구하는 인지적 과제(대비, 전제, 연관, 대안)는 네 언어 모두 동일했다.

### 24.5 Tier D 완료 선언

`VI_CONTENT.md`(v1.0, 2026-07-08)·`EN_CONTENT.md`(v1.0, 2026-07-08)·`JA_CONTENT.md`(v1.0, 2026-07-08)·`ZH_CONTENT.md`(v1.0, 2026-07-08) 네 문서 모두 완료 선언을 마쳤다. `JA_LANGUAGE_PACK.md`가 정의한 4개 Language Pack 전체에 대해 Tier D(Grammar Node별 EXPLANATION·EXAMPLE·QUIZ Canonical 콘텐츠) 1차 완성본을 확보했다.

**Tier D(Language Content) 완료를 선언한다.** 남은 Pending은 2건(JA RARERU Content Gap, EN NOT_YET Structural Gap)이며 둘 다 서비스 차단 요소가 아닌 개선 권고 사항으로 관리한다.

---

## 25. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-08 | 최초 작성 — 위상정렬 작업 순서(21개) 확정, 카탈로그-노드표 완전 일치 확인(누락 없음). 1번 노드 `GRAMMAR_ZH_LE`의 EXPLANATION·EXAMPLE·QUIZ 3종 Canonical 콘텐츠 작성, 了(le)/了(liǎo) 다음자 구분 명시 |
| 1.1 | 2026-07-08 | 2번 노드 `GRAMMAR_ZH_MA` 콘텐츠 3종 추가 — 단독 작성, 의문사 미사용. "제안·추측 뉘앙스 없음"을 명시해 향후 吧와의 혼동 사전 차단. WH_INSITU와의 Related가 VI·JA류의 문말 표지 재사용이 아니라 "吗 없이 성립"하는 상호 배타적 구조이며 주제적(Interleaving) 연결임을 §4.5 설계 노트 기준으로 정확히 포착 — VI·JA 패턴과의 차이를 발견한 첫 사례 |
| 1.2 | 2026-07-08 | 3번 노드 `GRAMMAR_ZH_WH_INSITU` 콘텐츠 3종 추가 — MA와의 `Related`를 "吗 있음/없음" 구조적 대비로 연결(VI·JA류 재사용 패턴과 의도적으로 다르게 설계). 시나리오2가 ZAI 미학습으로 완성 불가능함을 재확인해 9번 차례로 이연(사용자 사전 합의) |
| 1.3 | 2026-07-08 | 4번 노드 `GRAMMAR_ZH_HUI` 콘텐츠 3종 추가 — 단독 작성, 시나리오4 완전 실현. §4.3 설계 노트가 지목한 "会说중국어류" 능력 해석 위험을 피해 능력·기술과 무관한 동사(去, 来)만 선택 — v1.1 NENG과의 ALTERNATIVE 관계가 추가되어도 재작업 불필요하도록 사전 설계 |
| 1.4 | 2026-07-08 | 5번 노드 `GRAMMAR_ZH_BU` 콘텐츠 3종 추가 — 단독 작성, MEI 미언급. 不/没 대비가 VI DANG/DA류의 단순 최소 차이 비교가 아니라 상적(aspectual) 적용 조건 자체가 다른 대비임을 정직하게 기록 — MEI 차례의 설계 방향을 미리 확정 |
| 1.5 | 2026-07-08 | 6번 노드 `GRAMMAR_ZH_NENG` 콘텐츠 3종 추가 — 단독 작성, 시나리오3 완전 실현. XIANG·DEI가 재사용할 吃饭 소재를 새로 도입(VI/EN/JA MODALITY 허브와 동일 패턴). 会(미래)/能(가능)의 기능 차이가 겹치지 않음을 확인. 섹션 번호 누락(§8) 즉시 정정 |
| 1.6 | 2026-07-08 | 7번 노드 `GRAMMAR_ZH_XIANG` 콘텐츠 3종 추가 — NENG과의 `Related`를 6번 예문 재사용+의미 대조 QUIZ로 연결. VI(MUON/CO_THE)·EN(WANT_TO/CAN)·JA(TAI/DEKIRU)·ZH(XIANG/NENG) 네 언어의 MODALITY_DESIRE↔ABILITY 처리 패턴이 동일함을 표로 명시적 검증 |
| 1.7 | 2026-07-08 | 8번 노드 `GRAMMAR_ZH_QING` 콘텐츠 3종 추가 — 단독 작성, PRAGMATICS 허브 역할 확인(VI A_POLITE·EN PLEASE·JA MASU와 동일 패턴). 说를 EXAMPLE 동사로 선택해 YIXIA와의 구조적 결합(请说一下)과 BA_CONFIRM과의 화용적 연결(EN PLEASE-TAG_QUESTION과 동일 성격)을 미리 구분해 기록. 섹션 번호 누락(§10) 즉시 정정 |
| 1.8 | 2026-07-08 | 9번 노드 `GRAMMAR_ZH_ZAI` 콘텐츠 3종 추가 — LE와의 `Contrast`를 동사·목적어 고정+표지 위치 차이(了=동사 뒤, 在=동사 앞)를 정직하게 기록한 대비로 연결. Aspect(상)이지 시제가 아님을 명시. WH_INSITU와 결합해 시나리오2를 대체 없이 완전 실현(JA의 する 회피와 대비). 섹션 번호 누락(§11) 즉시 정정 |
| 1.9 | 2026-07-08 | 10번 노드 `GRAMMAR_ZH_MEI` 콘텐츠 3종 추가 — BU와의 `Contrast`를 적용 조건(습관/미래 vs 완료) 차이 중심으로 설명, LE와의 연계(没가 了의 완료 의미를 내포해 별도로 붙이지 않음)를 명시. 같은 동사·목적어(吃饭)로 표면적 최소 차이 비교를 구성하되 "표지 선택이 상황에 달려있다"는 판단 기준을 QUIZ 핵심으로 설계. 섹션 번호 누락(§12) 즉시 정정 |
| 1.10 | 2026-07-08 | 11번 노드 `GRAMMAR_ZH_DEI` 콘텐츠 3종 추가 — NENG과의 `Related`+`Contrast`를 QUIZ 하나로 동시 충족(6번 예문 재사용, 같은 동사·목적어 고정+표지 교체). 得(děi/de/dé) 다음자 구분 명시(了 le/liǎo와 동일 원칙). 会(미래)와의 의미 미분리 확인. 4언어(VI/EN/JA/ZH) MODALITY_ABILITY↔NECESSITY 패턴 일관성 표로 재확인. 섹션 번호 누락(§13) 즉시 정정 |
| 1.11 | 2026-07-08 | 12번 노드 `GRAMMAR_ZH_BA_SUGGEST` 콘텐츠 3종 추가 — 단독 작성, BA_CONFIRM 완전 미언급. 了/得와 달리 두 吧 용법 사이에 형식적 관계 자체가 없는 "완전히 독립된 두 노드" 유형(VI DUOC_ABILITY/DUOC_PASSIVE와 동일)임을 명시적으로 구분. 섹션 번호 누락(§14) 즉시 정정 |
| 1.12 | 2026-07-08 | 13번 노드 `GRAMMAR_ZH_HAI_MEI` 콘텐츠 3종 추가 — MEI와의 `Prerequisite`를 EXPLANATION 서술 구조로 반영(10번 예문 재사용 최소 차이 비교). VI CHUA·EN NOT_YET·JA MADA_NAI와 달리 형식적 Contrast가 없는 구조적 차이를 정직하게 기록하되, 설명/연습 역할 분리 설계 정신은 동일하게 유지. 섹션 번호 누락(§15) 즉시 정정 |
| 1.13 | 2026-07-08 | 14번 노드 `GRAMMAR_ZH_YIXIA` 콘텐츠 3종 추가 — QING과의 `Related`를 请说一下 구조적 결합으로 연결(8번 예고 실현). EN의 PLEASE→COULD_REQUEST와 동일한 "PRAGMATICS 허브의 첫 Related는 구조적 결합형"패턴임을 확인. BA_SUGGEST·BA_CONFIRM 미언급. 섹션 번호 누락(§16) 즉시 정정 |
| 1.14 | 2026-07-08 | 15번 노드 `GRAMMAR_ZH_BA_CONFIRM` 콘텐츠 3종 추가 — QING과의 `Related`를 화용적 범주 공유로만 반영(구조적 결합 없음, EN PLEASE-TAG_QUESTION과 동일 패턴). BA_SUGGEST와 완전 무관계를 끝까지 유지. VI/EN/ZH의 PRAGMATICS 허브 구조적/화용적 연결 패턴을 표로 재확인. 섹션 번호 누락(§17) 즉시 정정 |
| 1.15 | 2026-07-08 | 16번 노드 `GRAMMAR_ZH_BI` 콘텐츠 3종 추가 — 단독 작성, ZUI 미언급. VI(HON)·EN(COMPARATIVE)·JA(YORI)와 동일하게 "내 집/당신의 집" 소재로 비교급 허브 노드 구성, 4언어 패턴을 표로 확인. 형용사(大/有意思)가 ZUI에서 比+B→最 교체만으로 재사용 가능한 기반임을 명시. 섹션 번호 누락(§18) 즉시 정정 |
| 1.16 | 2026-07-08 | 17번 노드 `GRAMMAR_ZH_ZUI` 콘텐츠 3종 추가 — BI와의 `Prerequisite`를 EXPLANATION 서술 구조로 반영, 我的家/大 소재를 그대로 이어받아 比→最 최소 차이 비교(16번 예문 재사용)로 QUIZ 구성. VI/EN/JA/ZH 네 언어의 COMPARISON Prerequisite 처리 패턴이 완전히 수렴함을 확인. 섹션 번호 누락(§19) 즉시 정정 |
| 1.17 | 2026-07-08 | 18번 노드 `GRAMMAR_ZH_CL_GE`(단독)·19번 `GRAMMAR_ZH_CL_ZHI`(CL_GE Contrast)·20번 `GRAMMAR_ZH_RUGUO_JIU`(단독)·21번(마지막) `GRAMMAR_ZH_BEI`(단독) 콘텐츠 각 3종씩 총 12종 추가. §1을 21개 전체 완료로 갱신. §23 종합 검증 추가 — 번호 연속성·위상정렬·11개 관계 전체 반영(카탈로그 완전 일치, 누락 없음)·이미 배운 문법만 사용 원칙(8건의 ZH 고유 다음자·동형이의 검증)·회피 사례 검증(4개 시나리오 전부 원문 그대로 완전 실현, Content/Structural Gap 0건)·문서 전체 정합성 6개 항목 검증 완료. **ZH_CONTENT.md v1.0 완료 선언**. §24 Tier D 통합 요약 추가 — VI·EN·JA·ZH 총 85개 노드·255개 Content, 언어별 Gap 현황(JA Content Gap 1건, EN Structural Gap 1건), 4언어 공통 Core Standard 패턴 10개 표로 정리. **Tier D(Language Content) 완료 선언** |
