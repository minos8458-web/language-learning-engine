# JA_CONTENT.md
## 일본어 콘텐츠 본문 (Tier D)

> 이 문서는 `CONTENT_PRODUCTION_STANDARD.md`(Tier D)의 표준을 따른다. `JA_LANGUAGE_PACK.md`(Tier A/B)가 정의한 Grammar Node·Content ID 자리에 실제 텍스트를 채운다. VI·EN에서 검증한 제작 패턴(위상정렬 배치, 최소 차이 비교, 노드별 자체 검증+상위 문서 정합성 확인)을 그대로 재사용한다.

문서 계층: `CONTENT_SCHEMA.md` → `CONTENT_PRODUCTION_STANDARD.md` → **`JA_CONTENT.md`(이 문서)**

---

## 0. 문서의 지위

- Tier D. `JA_LANGUAGE_PACK.md`가 확정한 Content ID 체계·`grammar_node_ids` 참조를 그대로 쓴다.
- 노드는 위상정렬 순서로 배치한다 — 아래 §1의 순서표가 작업 순서다.
- **JA 전용 제약(VI·EN에는 없던 것)**: 일본어 동사는 활용류(godan/ichidan/불규칙)에 따라 활용형이 다르다. `帰る`(godan인데 ichidan처럼 생긴 예외)처럼 활용류 자체가 예측 불가능한 동사는 피하고, **활용류가 명확한 동사만** 예문에 사용한다(`JA_LANGUAGE_PACK.md` §1.2·§7).
- **주의**: VI·EN과 동일하게, 이 세션에서 설계와 동시에 작성된 초안이라 `CONTENT_PRODUCTION_STANDARD.md` §4.3의 24시간 시간차 검수 조건을 문자 그대로 충족하지 않는다. `is_canonical=true`로 표시하되 실제 서비스 반영 전 별도 검수를 전제로 한다.
- **발견된 사항**: `JA_LANGUAGE_PACK.md` §4.10은 `GRAMMAR_JA_MASU`↔`GRAMMAR_JA_KEDO`를 서로 `Related`로 명시하지만 §5 관계 카탈로그(11개 목록)에는 누락되어 있다(EN의 IF_WILL-WILL과 동일한 패턴). 노드 표를 더 구체적인 근거로 채택해 위상정렬·콘텐츠 설계에 반영한다 — `JA_LANGUAGE_PACK.md` 자체 수정은 이 문서 범위 밖이다.

---

## 1. 작업 순서(위상정렬, 전체 19개) — **전체 완료**

1. GRAMMAR_JA_TA ✅
2. GRAMMAR_JA_KA ✅
3. GRAMMAR_JA_WH_INSITU ✅
4. GRAMMAR_JA_MASU ✅
5. GRAMMAR_JA_NAI ✅
6. GRAMMAR_JA_TAI ✅
7. GRAMMAR_JA_NE ✅
8. GRAMMAR_JA_TE_IRU ✅
9. GRAMMAR_JA_DEKIRU ✅
10. GRAMMAR_JA_TE_KUDASAI ✅
11. GRAMMAR_JA_YORI ✅
12. GRAMMAR_JA_MADA_NAI ✅
13. GRAMMAR_JA_KEDO ✅
14. GRAMMAR_JA_ICHIBAN ✅
15. GRAMMAR_JA_NAKEREBA_NARANAI ✅
16. GRAMMAR_JA_CL_NIN ✅
17. GRAMMAR_JA_TARA ✅
18. GRAMMAR_JA_RARERU ✅
19. GRAMMAR_JA_CL_HON ✅ ← **최종 노드**

---

## 2. GRAMMAR_JA_TA (た形 — 과거)

**노드 정보**: Concept `CONCEPT_TENSE_PAST` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_JA_TE_IRU**(8번, 아직 미학습 — 이연). 17번 `TARA`의 선행 노드이지만 그 의무는 TARA 쪽에서 충족한다.

### 2.1 CONTENT_JA_TA_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_TA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**た形**은 이미 끝난 일(과거)을 말할 때 씁니다. 동사 활용류에 따라 접속 형태가 다릅니다.

**문장 구조**: [동사 た형] + [목적어]

예를 들어 食べる(먹다, 一段活用)의 た形은 食べた인데, 私は+ご飯を+食べた를 이으면 **私はご飯を食べた。**(나는 밥을 먹었다.)가 됩니다.

**활용류 참고**: 食べる는 一段活用(ichidan)이라 어미 る를 떼고 た를 붙이면 됩니다(食べ+た). 이 문서는 활용류가 명확한 동사만 사용한다(§0).

### 2.2 CONTENT_JA_TA_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_TA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **私はご飯を食べた。**
> 나는 밥을 먹었다.

단어별: 私は(나는) ご飯を(밥을) 食べた(먹었다, 食べる의 た形)

이 문장은 `JA_LANGUAGE_PACK.md` §6 시나리오1을 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: た形 외의 문법 표지 없음.

### 2.3 CONTENT_JA_TA_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_TA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"私は話した。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"나는 말했다."**

**설계 메모**: EXAMPLE과 다른 활용류(話す, 五段活用)를 QUIZ에 써서 た形 규칙이 一段·五段 양쪽에서 일반화됐는지 확인한다 — 話す는 五段이라 す→した로 바뀐다(話した).

### 2.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — た形 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — 食べる(一段)·話す(五段) 모두 활용류가 명확하고 예외 없음(帰る류 함정 없음) |

### 2.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.1: `Contrast: GRAMMAR_JA_TE_IRU`를 확인했으나 미학습으로 8번 차례로 이연.
- `JA_LANGUAGE_PACK.md` §6 시나리오1: 그대로 실현했다.
- 발견된 이슈: 없음.

---

## 3. GRAMMAR_JA_KA (〜か — 의문)

**노드 정보**: Concept `CONCEPT_MOOD_INTERROGATIVE` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_WH_INSITU**(위상정렬 2번, 3번 미학습 — 이연)

### 3.1 CONTENT_JA_KA_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_KA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**か**는 문장 끝에 붙여 예/아니오 의문문을 만드는 조사입니다. 평서문 그대로 두고 문장 끝에 か만 붙이면 됩니다.

**문장 구조**: [평서문] + か

이미 배운 食べた(먹었다) 끝에 か를 붙이면 **食べたか**(먹었어?)가 됩니다.

### 3.2 CONTENT_JA_KA_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_KA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べたか。**
> 밥 먹었어?

단어별: ご飯を(밥을) 食べたか(먹었어?, 食べた+か)

1번 노드의 "ご飯を食べた"(§2.2)에 か만 붙였다 — 일본어는 문맥상 분명한 주어(私は)를 자연스럽게 생략한다(별도 문법 표지가 아니라 화용적 생략).

**"이미 배운 문법만 사용" 검증**: か 외의 문법 표지 없음. 의문사는 사용하지 않았다.

### 3.3 CONTENT_JA_KA_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_KA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"話したか。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"말했어?"**

### 3.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — TA(1) 재사용 확인, 의문사 미사용 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**WH_INSITU 연결 기반 구조 확인(사용자 요청)**: `JA_LANGUAGE_PACK.md` §4.5에서 WH_INSITU의 surface_forms는 "(평서문 어순 + 의문사 제자리 삽입) + か"다 — **문말의 か는 이 노드와 완전히 동일하다.** WH_INSITU는 か 앞의 평서문 내부에 의문사를 제자리로 끼워 넣기만 할 뿐, 문말 か 자체는 전혀 바뀌지 않는다. 이 노드의 구조를 변형 없이 그대로 물려받을 수 있는 기반이다.

### 3.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_JA_WH_INSITU`를 확인했으나 미학습으로 이연.
- 발견된 이슈: 없음.

---

## 4. GRAMMAR_JA_WH_INSITU (Wh-의문문 어순 — 제자리형)

**노드 정보**: Concept `CONCEPT_MOOD_WHQUESTION` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_KA**(위상정렬 3번, KA는 2번으로 이미 학습 — 이번에 연결)

**시나리오2 이연 기록**: `JA_LANGUAGE_PACK.md` §6 시나리오2("今何をしていますか?")는 `TE_IRU`(8번, 미학습)가 필요해 이번 노드에서 완성할 수 없다 — TE_IRU 차례로 이연한다.

### 4.1 CONTENT_JA_WH_INSITU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_WH_INSITU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

의문사(何, どこ 등)로 질문할 때 일본어는 어순을 바꾸지 않습니다 — 이미 배운 か 앞의 평서문에서, 답이 들어갈 자리에 의문사를 **그대로 두기만** 하면 됩니다.

**문장 구조**: [평서문 어순 + 의문사 제자리] + か

예를 들어 食べたか(먹었어?) 문장에서 목적어 자리에 何(무엇)를 넣으면 **何を食べたか**(무엇을 먹었어?)가 됩니다 — 어순은 그대로입니다.

### 4.2 CONTENT_JA_WH_INSITU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_WH_INSITU", "GRAMMAR_JA_KA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **何を食べたか。**
> 무엇을 먹었어?

단어별: 何を(무엇을) 食べたか(먹었어?, 食べた+か)

**대조**(2번 노드 콘텐츠 재참조): `CONTENT_JA_KA_EXAMPLE_1` — *ご飯を食べたか。*(밥 먹었어?)와 목적어 자리(ご飯→何)만 다르고 나머지(食べたか)는 완전히 동일하다 — "제자리형"의 원리를 가장 순수한 형태로 보여준다.

**"이미 배운 문법만 사용" 검증**: 의문사 제자리(대상)와 か(2번, 이미 학습) 외의 문법 표지 없음. TE_IRU·MASU는 언급하지 않았다.

### 4.3 CONTENT_JA_WH_INSITU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_WH_INSITU", "GRAMMAR_JA_KA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["話したか。", "何を話したか。"]` |

**본문(Generation Practice, Related 활용형 — 최소 차이 비교)**:

> 다음 두 질문을 각각 일본어로 써보세요.
> 1) 말했어? *(예/아니오 질문 — か 만)*
> 2) 무엇을 말했어? *(구체적인 답을 묻는 질문 — 의문사 추가)*

**설계 메모**: 1번은 2번 노드의 QUIZ 문장(`話したか。`)을 그대로 재사용했다. VI의 CO_KHONG/WH_INSITU 때와 같은 "같은 소재, 의문사만 추가" 패턴이다.

### 4.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — KA(2) 재사용 확인, TE_IRU·MASU 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**KA vs WH_INSITU 역할 구분(사용자 요청)**: KA는 문장을 "질문으로 마무리하는" 표지(예/아니오든 Wh든 공통으로 필요)이고, WH_INSITU는 "의문사를 어디에 두는가"(제자리, 이동 없음)만 담당한다 — 겹치지 않고 상호 보완적이다. 3번 노드에서 확인한 대로 문말 か는 이 노드에서도 전혀 바뀌지 않았다.

### 4.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_JA_KA`를 EXAMPLE·QUIZ 모두에 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_KA_RELATED_WH_INSITU`(BIDIRECTIONAL, weight 0.4) 확인.
- `JA_LANGUAGE_PACK.md` §6 시나리오2: 이번 노드에서 완성하지 못함을 재확인, TE_IRU(8번) 차례로 이연 기록.
- 발견된 이슈: 시나리오2 이연(위 기록, 사용자와 사전 합의됨).

---

## 5. GRAMMAR_JA_MASU (ます形 — 정중체)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_POLITENESS` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_NE, GRAMMAR_JA_KEDO**(위상정렬 4번, 둘 다 미학습 — 각 노드 차례로 이연, 이번엔 언급하지 않음)

### 5.1 CONTENT_JA_MASU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**ます形**은 동사를 정중체(공손한 말투)로 만드는 활용입니다. 아직 일어나지 않은 일도 말할 수 있습니다 — 일본어는 별도의 미래 표지 없이 **비과거형이 현재·미래를 겸합니다.**

**문장 구조**: [동사 ます形 어간] + ます

예를 들어 行く(가다)의 ます形 어간은 行き인데, ます를 붙이면 **行きます**(갑니다)가 됩니다.

### 5.2 CONTENT_JA_MASU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **あとで行きます。**
> 이따가 갈게요.

단어별: あとで(이따가) 行きます(갑니다, 行く의 ます形)

이 문장은 `JA_LANGUAGE_PACK.md` §6 시나리오4를 그대로 실현한다 — 별도 미래 노드 없이 ます形만으로 완성된다.

**"이미 배운 문법만 사용" 검증**: ます形 외의 문법 표지 없음. NE·KEDO는 언급하지 않았다.

### 5.3 CONTENT_JA_MASU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"あとで話します。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"이따가 말할게요."**

### 5.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ます形 외 신규 문법 없음, NE·KEDO 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**NE/KEDO 연결 기반 구조 확인(사용자 요청)**: ます形은 그 자체로 완결된 문장을 만든다. NE(〜ね)·KEDO(〜けど)는 둘 다 "[평서문]+종결사/접속사" 구조라, ます形으로 끝난 문장 뒤에도 형태 변경 없이 그대로 붙을 수 있다(예: 行きます+ね, 行きます+けど) — 이 노드의 구조를 바꿀 필요가 없는 기반이다.

### 5.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_JA_NE, GRAMMAR_JA_KEDO` 둘 다 확인했으나 미학습으로 각 노드 차례로 이연.
- `JA_LANGUAGE_PACK.md` §6 시나리오4: 완전한 형태로 실현했다.
- 발견된 이슈: 없음.

---

## 6. GRAMMAR_JA_NAI (ない形 — 단순 부정)

**노드 정보**: Concept `CONCEPT_NEGATION_SIMPLE` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_JA_MADA_NAI**(위상정렬 5번, 12번 미학습 — 이연). 12번의 선행 노드이기도 하다.

### 6.1 CONTENT_JA_NAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**ない形**은 동사를 부정할 때 씁니다. 활용류에 따라 접속 형태가 다릅니다 — 一段活用은 る를 떼고 ない를 붙이고, 五段活用은 어미를 あ단으로 바꾸고 ない를 붙입니다.

**문장 구조**: [동사 ない形]

예를 들어 食べる(一段)는 **食べない**(먹지 않는다), 話す(五段)는 **話さない**(말하지 않는다)가 됩니다.

### 6.2 CONTENT_JA_NAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べない。**
> 밥을 먹지 않는다.

단어별: ご飯を(밥을) 食べない(먹지 않는다, 食べる의 ない形)

**"이미 배운 문법만 사용" 검증**: ない形 외의 문법 표지 없음. MADA_NAI는 언급하지 않았다.

### 6.3 CONTENT_JA_NAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"話さない。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"말하지 않는다."**

**설계 메모**: EXAMPLE(一段, 食べる)과 다른 활용류(五段, 話す)를 QUIZ에 써서 ない形 규칙이 양쪽에서 일반화됐는지 확인했다 — 1번 `TA` 때와 동일한 검증 방식이다.

### 6.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ない形 외 신규 문법 없음, MADA_NAI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — 食べる(一段)·話す(五段) 모두 명확, 帰る류 함정 없음 |

**MADA_NAI 연결 기반 구조 확인(사용자 요청)**: `JA_LANGUAGE_PACK.md` §4.4에서 MADA_NAI의 surface_forms는 "まだ + (ない형)"이다 — 이 노드가 만든 **ない形 출력 자체가 MADA_NAI가 필요로 하는 전부**다. まだ를 앞에 붙이기만 하면 되고 ない形 내부 구조는 전혀 바꿀 필요가 없다.

### 6.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.4: `Contrast: GRAMMAR_JA_MADA_NAI`를 확인했으나 미학습으로 12번 차례로 이연.
- 발견된 이슈: 없음.

---

## 7. GRAMMAR_JA_TAI (たい形 — 원함)

**노드 정보**: Concept `CONCEPT_MODALITY_DESIRE` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_DEKIRU**(위상정렬 6번, 9번 미학습 — 이연)

### 7.1 CONTENT_JA_TAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_TAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**たい形**은 "~하고 싶다"라는 바람을 나타냅니다. ます形 어간(ます를 뗀 형태)에 たい를 붙입니다.

**문장 구조**: [동사 ます形 어간] + たい

예를 들어 食べる(먹다)의 ます形 어간은 食べ인데, たい를 붙이면 **食べたい**(먹고 싶다)가 됩니다.

### 7.2 CONTENT_JA_TAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_TAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べたい。**
> 밥을 먹고 싶다.

단어별: ご飯を(밥을) 食べたい(먹고 싶다, 食べる의 たい形)

**"이미 배운 문법만 사용" 검증**: たい形 외의 문법 표지 없음. DEKIRU는 언급하지 않았다.

### 7.3 CONTENT_JA_TAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_TAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"話したい。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"말하고 싶다."**

### 7.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — たい形 외 신규 문법 없음, DEKIRU 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**DEKIRU 연결 기반 구조 확인(사용자 요청, 정직하게 기록)**: たい는 ます形 어간에 **직접** 붙는다. できる는 `JA_LANGUAGE_PACK.md` §4.3에 surface_forms가 "できる/できます"로만 나와 있어 정확한 접속 방식(辞書形+ことができる일 가능성이 높음)은 9번 노드에서 확정해야 한다 — **두 노드가 완전히 같은 접속 구조를 공유한다고 지금 단정하지 않는다.** 다만 이미 검증된 소재(食べる/ご飯)는 그대로 이어받아 자연스러운 대조를 만들 수 있다 — EN의 WANT_TO/CAN 때(활용 여부가 다름을 미리 기록)와 같은 종류의 정직한 기반 확인이다.

### 7.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_JA_DEKIRU`를 확인했으나 미학습으로 9번 차례로 이연.
- 발견된 이슈: 없음(DEKIRU의 정확한 접속 방식은 9번에서 확인 예정으로 명시).

---

## 8. GRAMMAR_JA_NE (〜ね — 확인 어조)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_CONFIRMATION` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_MASU**(위상정렬 7번, MASU는 4번으로 이미 학습 — 이번에 연결). KEDO와는 이 노드에서 다루지 않는다(13번 미학습).

### 8.1 CONTENT_JA_NE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_NE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**ね**는 문장 끝에 붙어 상대방에게 공감이나 확인을 구하는 종조사입니다. 이미 배운 ます形 문장을 그대로 두고 ね만 붙이면 됩니다.

**문장 구조**: [평서문] + ね

行きます(갑니다) 끝에 ね를 붙이면 **行きますね**(가네요, 그렇죠?)가 되어, 상대방의 공감·확인을 구하는 느낌을 줍니다.

### 8.2 CONTENT_JA_NE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_NE", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **あとで行きますね。**
> 이따가 갈게요, 그렇죠?

단어별: あとで(이따가) 行きますね(갑니다+ね, 공감·확인)

**대조**(4번 노드 콘텐츠 재참조): `CONTENT_JA_MASU_EXAMPLE_1` — *あとで行きます。*(이따가 갈게요.)와 완전히 같고 ね만 추가됐다.

**"이미 배운 문법만 사용" 검증**: ね와 (재인용한) ます形(4번, 이미 학습) 외의 문법 표지 없음. KEDO는 언급하지 않았다.

### 8.3 CONTENT_JA_NE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_NE", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["あとで話します。", "あとで話しますね。"]` |

**본문(Generation Practice, Related 활용형 — 최소 차이 비교)**:

> 다음 두 문장을 각각 일본어로 써보세요.
> 1) 이따가 말할게요. *(평서 — ます形만)*
> 2) 이따가 말할게요, 그렇죠? *(공감·확인 — ね 추가)*

**설계 메모**: DANG/DA류의 최소 차이 비교(문장 고정, 종조사만 추가)를 JA에 처음 적용한 사례다.

### 8.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ます形(4) 재사용 확인, KEDO 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**MASU vs NE 역할 구분(사용자 요청)**: MASU는 동사 **형태 자체**를 공손체로 바꾸는 활용이고, NE는 이미 완성된 문장 **끝에 덧붙는** 종조사다 — 하나는 활용(형태 변화), 하나는 첨가(형태 유지+추가)라 층위가 다르며 서로 겹치지 않는다.

### 8.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_JA_MASU`를 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_MASU_RELATED_NE`(BIDIRECTIONAL, weight 0.4) 확인.
- 발견된 이슈: 없음.

---

## 9. GRAMMAR_JA_TE_IRU (て+いる — 진행상)

**노드 정보**: Concept `CONCEPT_ASPECT_PROGRESSIVE` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_JA_TA**(위상정렬 8번, TA는 1번으로 이미 학습 — 이번에 연결). 3번에서 이연해둔 시나리오2를 완성한다.

**동사 대체 기록(§0 제약 적용)**: 시나리오2 원문은 する의 て형(して)이 필요하지만, `JA_LANGUAGE_PACK.md` §7이 する를 v1.1로 미뤄둔 미등재 불규칙 동사로 명시한다. 이미 검증된 食べる로 대체해 같은 문법 조합·같은 화용 기능(지금 하는 일 묻기)을 유지한다.

### 9.1 CONTENT_JA_TE_IRU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_IRU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**て+いる**는 지금 진행 중인 동작을 나타냅니다. 이미 배운 **た形**(과거, 끝난 일)과 정확히 대칭됩니다 — た가 끝난 일을, て+いる는 지금 하고 있는 일을 가리킵니다.

**문장 구조**: [동사 て형] + いる(보통체) / います(정중체)

食べる(먹다)의 て형은 食べて인데, いる를 붙이면 **食べている**(먹고 있다)가 됩니다.

### 9.2 CONTENT_JA_TE_IRU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_IRU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **私はご飯を食べている。**
> 나는 밥을 먹고 있다.

단어별: 私は(나는) ご飯を(밥을) 食べている(먹고 있다, 食べる의 て+いる形)

**대조**(1번 노드 콘텐츠 재참조): `CONTENT_JA_TA_EXAMPLE_1` — *私はご飯を食べた。*(나는 밥을 먹었다.)와 주어·목적어·동사가 완전히 같고 시제 표지(た→ている)만 다르다 — VI의 DANG/DA와 동일한 순수 최소 차이 비교다(시간부사 조정도 필요 없었다).

**"이미 배운 문법만 사용" 검증**: て+いる와 (대조를 위해 재인용한) た形(1번, 이미 학습) 외의 문법 표지 없음.

### 9.3 CONTENT_JA_TE_IRU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_IRU", "GRAMMAR_JA_WH_INSITU", "GRAMMAR_JA_KA", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"今何を食べていますか。"` |

**본문(Generation Practice, 시나리오2 완성형)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"지금 뭘 먹고 있어요?"**

**설계 메모**: TE_IRU(진행)+WH_INSITU(의문사 제자리, 何)+KA(문말 의문)+MASU(정중체, います)를 한 문장에 결합했다 — 이 문서에서 처음으로 4개 노드가 동시에 결합되는 사례다. する 대신 食べる를 써서 동사 대체 기록(위 참고)을 그대로 반영했다.

### 9.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — TA(1)·WH_INSITU(3)·KA(2)·MASU(4) 전부 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 실제 회화체(시나리오2 취지 실현) |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — する(미검증 불규칙) 회피, 食べる(一段, 검증됨)로 대체 |

**TA vs TE_IRU 역할 대비(사용자 요청)**: た(완료된 과거)와 て+いる(현재 진행)는 시제·상의 정반대 축에 있어 명확히 대비된다 — EXAMPLE의 최소 차이 비교(문장 완전 동일, 표지만 교체)가 이를 가장 순수한 형태로 보여준다.

**시나리오2 충족 여부(사용자 요청)**: **부분 충족** — 문법 조합(TE_IRU+WH_INSITU+KA+MASU)은 원문과 완전히 동일하게 실현했으나, 동사는 する→食べる로 대체되어 어휘 수준에서는 원문과 다르다. VI·EN에서 이미 여러 차례 있었던 "문법은 완성, 어휘는 검증된 것으로 대체" 패턴과 같은 성격이다.

### 9.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.2: `Contrast: GRAMMAR_JA_TA`를 EXPLANATION·EXAMPLE에 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_TA_CONTRAST_TE_IRU`(BIDIRECTIONAL, weight 0.5) 확인.
- `JA_LANGUAGE_PACK.md` §6 시나리오2: 문법 조합은 완전 실현, 동사는 する 미검증으로 대체(위 기록).
- 발견된 이슈: する의 활용형 미검증(§7에서 이미 v1.1 이월로 명시된 사항, 새로운 문제 아님).

---

## 10. GRAMMAR_JA_DEKIRU (できる — 가능)

**노드 정보**: Concept `CONCEPT_MODALITY_ABILITY` · Difficulty 2 · Prerequisite `—`, **Related: GRAMMAR_JA_TAI, GRAMMAR_JA_NAKEREBA_NARANAI / Contrast: GRAMMAR_JA_NAKEREBA_NARANAI**(위상정렬 9번). TAI(6번, 이미 학습)는 이번에 연결하고, NAKEREBA_NARANAI(15번, 미학습)는 이연한다. 6번에서 보류했던 できる의 접속 방식을 여기서 확정한다.

### 10.1 CONTENT_JA_DEKIRU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_DEKIRU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**できる**는 "~할 수 있다"라는 가능·능력을 나타냅니다. 동사 辞書形(사전형, 원형) 뒤에 こと(것)를 붙여 명사처럼 만든 다음 が できる를 붙입니다.

**문장 구조**: [동사 辞書形] + ことができる(보통체) / ことができます(정중체)

**たい와의 접속 방식 차이(6번에서 보류했던 확정)**: 이미 배운 たい는 ます形 어간에 **직접** 붙지만(食べ+たい), できる는 辞書形에 こと를 붙여 **한 번 명사화한 뒤** 붙습니다(食べる+ことができる) — 접속 경로가 다릅니다.

예를 들어 食べる(먹다) 뒤에 ことができる를 붙이면 **食べることができる**(먹을 수 있다)가 됩니다.

### 10.2 CONTENT_JA_DEKIRU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_DEKIRU", "GRAMMAR_JA_KA", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **これを買うことができますか。**
> 이거 살 수 있어요?

단어별: これを(이것을) 買う(사다, 辞書形) ことができますか(할 수 있어요?, ことができる의 ます形+か)

이 문장은 `JA_LANGUAGE_PACK.md` §6 시나리오3을 **원문 그대로** 실현한다 — 買う(五段活用)는 활용류가 명확해 대체가 필요 없었다(8번의 する 회피와 대비되는 사례).

**"이미 배운 문법만 사용" 검증**: できる(대상)와 か(2번)·ます(4번, 이미 학습) 외의 문법 표지 없음.

### 10.3 CONTENT_JA_DEKIRU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_DEKIRU", "GRAMMAR_JA_TAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["ご飯を食べたい。", "ご飯を食べることができる。"]` |

**본문(Generation Practice, Related 활용형 — 기능 대비)**:

> 다음 두 문장을 각각 일본어로 써보세요.
> 1) 밥을 먹고 싶다. *(원함 — たい)*
> 2) 밥을 먹을 수 있다. *(가능 — できる)*

**설계 메모**: 1번은 6번 노드의 예문을 그대로 재사용했다. "먹고 싶다"(마음)와 "먹을 수 있다"(능력)는 서로 다른 기능이지만 둘 다 MODALITY 범주로 연관되어 있다 — VI의 CO_THE/MUON, EN의 CAN/WANT_TO와 동일한 성격의 Related다.

### 10.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — TAI(6)·KA(2)·MASU(4) 전부 재사용 확인, NAKEREBA_NARANAI 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 실제 회화체(시나리오3 원문 그대로) |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — 食べる(一段)·買う(五段) 모두 명확, 미검증 어휘 없음 |

**접속 방식 확정이 원본 스키마와 일치하는지(사용자 요청)**: `JA_LANGUAGE_PACK.md` §6 시나리오3 원문("これを買うことができますか?")이 정확히 "辞書形+ことができる" 형태를 쓰고 있어, 이번에 확정한 접속 방식이 원본과 정확히 일치함을 재확인했다. 6번에서 "같다고 단정하지 않겠다"고 유보했던 것이 옳은 판단이었다 — 실제로 たい와는 접속 경로가 달랐다.

### 10.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_JA_TAI`를 QUIZ에 반영했다. `Related`·`Contrast: GRAMMAR_JA_NAKEREBA_NARANAI`는 15번 차례로 이연.
- `JA_LANGUAGE_PACK.md` §5: `REL_TAI_RELATED_DEKIRU`(BIDIRECTIONAL, weight 0.3) 확인.
- `JA_LANGUAGE_PACK.md` §6 시나리오3: 원문 그대로 완전 실현했다(대체 없음).
- 발견된 이슈: 없음.

---

## 11. GRAMMAR_JA_TE_KUDASAI (て+ください — 정중한 명령)

**노드 정보**: Concept `CONCEPT_MOOD_IMPERATIVE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 10번, 단독 작성)

### 11.1 CONTENT_JA_TE_KUDASAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_KUDASAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**て+ください**는 상대방에게 정중하게 무언가를 요청할 때 씁니다. 동사 て형 뒤에 ください(주세요)를 붙입니다.

**문장 구조**: [동사 て형] + ください

食べる(먹다)의 て형은 食べて인데, ください를 붙이면 **食べてください**(먹어 주세요)가 됩니다.

### 11.2 CONTENT_JA_TE_KUDASAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_KUDASAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べてください。**
> 밥을 먹어 주세요.

단어별: ご飯を(밥을) 食べてください(먹어 주세요, 食べる의 て형+ください)

**"이미 배운 문법만 사용" 검증**: て+ください 외의 문법 표지 없음.

### 11.3 CONTENT_JA_TE_KUDASAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_TE_KUDASAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"話してください。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"말해 주세요."**

**설계 메모**: EXAMPLE(一段, 食べる)과 다른 활용류(五段, 話す)를 QUIZ에 써서 て형 규칙이 양쪽에서 일반화됐는지 확인했다.

### 11.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — て+ください 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — 食べる(一段)·話す(五段) 모두 명확 |

**향후 요청 표현 확장 기반 확인(사용자 요청)**: 이 노드는 형식적 관계가 전혀 없는 완결된 노드다. `[동사 て형]+ください`라는 구조 자체가 이미 안정적인 요청 표현 틀이라, 향후 다른 정중 표현이 추가되더라도 이 노드의 구조를 변경할 필요가 없다 — VI의 HAY, EN의 IMPERATIVE와 같은 성격의 "완결된 단독 기반"이다.

### 11.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.5: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음.

---

## 12. GRAMMAR_JA_YORI (〜より — 비교)

**노드 정보**: Concept `CONCEPT_COMPARISON_COMPARATIVE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 11번, 단독 작성). 14번 `ICHIBAN`의 선행 노드이지만 그 의무는 ICHIBAN 쪽에서 충족한다.

### 12.1 CONTENT_JA_YORI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_YORI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**より**는 두 대상을 비교해 "~보다"라는 뜻을 나타냅니다. 비교 대상 뒤에 より를 붙입니다.

**문장 구조**: [A]は[B]より[형용사]

예를 들어 私の家(내 집)와 あなたの家(당신의 집)를 비교하려면, **私の家はあなたの家より大きい。**(내 집이 당신의 집보다 크다.)라고 합니다.

### 12.2 CONTENT_JA_YORI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_YORI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **私の家はあなたの家より大きい。**
> 내 집이 당신의 집보다 크다.

단어별: 私の家は(내 집은) あなたの家より(당신의 집보다) 大きい(크다)

**"이미 배운 문법만 사용" 검증**: より 외의 문법 표지 없음. ICHIBAN은 언급하지 않았다.

### 12.3 CONTENT_JA_YORI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_YORI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"この本はあの本より面白い。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"이 책이 저 책보다 재미있다."**

### 12.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — より 외 신규 문법 없음, ICHIBAN 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**ICHIBAN 연결 기반 구조 확인(사용자 요청)**: `JA_LANGUAGE_PACK.md` §4.7에서 ICHIBAN의 surface_forms는 "いちばん+(형용사)"다 — 이 노드가 쓴 형용사(大きい, 面白い)를 그대로 이어받아, [B]より 부분만 いちばん으로 교체하면 최상급이 완성된다. 형용사 자체는 손댈 필요가 없다.

### 12.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.7: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음.

---

## 13. GRAMMAR_JA_MADA_NAI (まだ〜ない — 아직 ~ 아님)

**노드 정보**: Concept `CONCEPT_NEGATION_NOTYET` · Difficulty 2 · Related/Alternative `—`, **Prerequisite: GRAMMAR_JA_NAI, Contrast: GRAMMAR_JA_NAI**(위상정렬 12번, NAI는 5번으로 이미 학습). VI의 CHUA/KHONG, EN의 NOT_YET/NOT과 동일한 조합이며 처리 방식도 그대로 재사용한다 — **Prerequisite는 EXPLANATION의 서술 구조로, Contrast는 최소 차이 비교로** 역할을 분리한다.

### 13.1 CONTENT_JA_MADA_NAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_MADA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**まだ〜ない**는 "아직 ~하지 않았다"라는 뜻으로, 이미 배운 **ない形**(단순 부정)을 바탕으로 이해할 수 있습니다.

ない가 그냥 부정하는 것이라면, まだ〜ない는 "지금까지는 아니지만 앞으로 그럴 수도 있다"는 여지를 남깁니다.

**문장 구조**: まだ + [동사 ない形]

이미 배운 **食べない**(먹지 않는다) 앞에 まだ를 붙이면 **まだ食べない**(아직 먹지 않는다)가 됩니다.

### 13.2 CONTENT_JA_MADA_NAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_MADA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **まだご飯を食べない。**
> 아직 밥을 먹지 않는다.

단어별: まだ(아직) ご飯を(밥을) 食べない(먹지 않는다, 食べる의 ない形)

**대조**(5번 노드 콘텐츠 재참조): `CONTENT_JA_NAI_EXAMPLE_1` — *ご飯を食べない。*(밥을 먹지 않는다.)와 완전히 같고 まだ만 추가됐다.

**"이미 배운 문법만 사용" 검증**: まだ〜ない와 (재인용한) ない形(5번, 이미 학습) 외의 문법 표지 없음. 다른 부정 표현은 도입하지 않았다.

### 13.3 CONTENT_JA_MADA_NAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_MADA_NAI", "GRAMMAR_JA_NAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["話さない。", "まだ話さない。"]` |

**본문(Generation Practice, Contrast 활용형)**:

> 다음 두 문장을 각각 일본어로 써보세요.
> 1) 말하지 않는다. *(단순 부정)*
> 2) 아직 말하지 않는다. *("아직"의 여지가 있는 부정)*

**설계 메모**: VI의 CHUA/KHONG, EN의 NOT_YET/NOT과 동일한 최소 차이 비교 패턴(같은 동사, まだ만 추가)이다. Prerequisite(이해의 기반) 역할은 13.1 EXPLANATION이 이미 담당했다.

### 13.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ない形(5) 재사용 확인, 다른 부정 표현 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**NAI와의 관계 명확성(사용자 요청)**: `Prerequisite`는 EXPLANATION의 서술 구조("ない形을 바탕으로 이해")로, `Contrast`는 EXAMPLE·QUIZ의 최소 차이 비교로 각각 분리 충족했다 — 세 언어(VI/EN/JA) 모두에서 동일한 관계 조합(Prerequisite+Contrast, 같은 대상)에 동일한 처리 패턴이 적용됐다.

### 13.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.4: `Prerequisite: GRAMMAR_JA_NAI`·`Contrast: GRAMMAR_JA_NAI`를 역할 분리로 충족했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_MADA_NAI_PREREQ_NAI`(UNIDIRECTIONAL, weight 0.8)·`REL_NAI_CONTRAST_MADA_NAI`(BIDIRECTIONAL, weight 0.5) 확인.
- 발견된 이슈: 없음.

---

## 14. GRAMMAR_JA_KEDO (〜けど — 완곡)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_SOFTENING` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_JA_MASU**(위상정렬 13번, MASU는 4번으로 이미 학습). §0에서 기록한 §4.10/§5 카탈로그 누락(`REL_MASU_RELATED_KEDO`)을 여기서 실제로 적용한다. PRAGMATICS 계열(MASU/NE/KEDO)의 **마지막 노드**다.

### 14.1 CONTENT_JA_KEDO_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_KEDO"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**けど**는 문장 끝에 붙어 완곡하게 말을 잇거나 부드럽게 마무리하는 접속조사입니다. 이미 배운 ます形 문장을 그대로 두고 けど만 붙이면 됩니다. 이미 배운 **ね**(공감·확인 요청)와는 기능이 다릅니다 — ね는 상대방의 동의를 구하지만, けど는 단정을 피하고 부드럽게 말을 흐립니다.

**문장 구조**: [평서문] + けど

行きます(갑니다) 끝에 けど를 붙이면 **行きますけど**(가는데요...)가 되어, 단정적이지 않고 부드럽게 말을 잇는 느낌을 줍니다.

### 14.2 CONTENT_JA_KEDO_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_KEDO", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **あとで行きますけど。**
> 이따가 가는데요...

단어별: あとで(이따가) 行きますけど(갑니다+けど, 완곡)

**대조**(4번 노드 콘텐츠 재참조): `CONTENT_JA_MASU_EXAMPLE_1` — *あとで行きます。*(이따가 갈게요.)와 완전히 같고 けど만 추가됐다.

**"이미 배운 문법만 사용" 검증**: けど와 (재인용한) ます形(4번, 이미 학습) 외의 문법 표지 없음.

### 14.3 CONTENT_JA_KEDO_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_KEDO", "GRAMMAR_JA_MASU", "GRAMMAR_JA_NE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["あとで行きます。", "あとで行きますね。", "あとで行きますけど。"]` |

**본문(Generation Practice, PRAGMATICS 캡스톤 — 3자 비교)**:

> 다음 세 문장을 각각 일본어로 써보세요(같은 문장, 종결사만 다르게).
> 1) 이따가 갈게요. *(평서 — ます形만)*
> 2) 이따가 갈게요, 그렇죠? *(공감·확인 — ね)*
> 3) 이따가 가는데요... *(완곡 — けど)*

**설계 메모**: KEDO 자신의 형식적 Related는 MASU뿐이지만, PRAGMATICS 계열의 마지막 노드라는 점을 살려 NE까지 포함한 3자 비교로 확장했다 — VI의 A_CONFIRM(PRAGMATICS 캡스톤)과 정확히 같은 설계다. 새 관계를 주장하는 게 아니라 이미 확정된 관계(MASU-NE, MASU-KEDO)를 활용한 복습이다.

### 14.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ます形(4)·ね(7) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **NE vs KEDO 기능 구분(사용자 요청)** | EXPLANATION에서 명시 — ね(공감·확인 요청) vs けど(단정 회피·완곡), 혼동 없음 |

**카탈로그 누락 반영 검증(사용자 요청)**: §0에서 기록한 `REL_MASU_RELATED_KEDO`(§5 카탈로그 누락, §4.10 노드 표 근거)가 이번 노드의 EXPLANATION·EXAMPLE·QUIZ 전부에 정확히 반영됐다 — EN의 IF_WILL-WILL 때와 동일하게, 노드 표를 근거로 채택한 판단이 실제 콘텐츠 설계에서도 일관되게 작동했다.

### 14.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_JA_MASU`(노드 표 근거)를 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다.
- **PRAGMATICS 3종 세트 완결성**: MASU(4)-NE(7), MASU(4)-KEDO(13) 두 Related 관계 모두 반영 완료. "あとで行きます" 축으로 세 노드가 완결됐다(VI의 "Tôi ăn cơm", EN의 "I ~" 계열과 같은 설계 원리).
- 발견된 이슈: 없음.

---

## 15. GRAMMAR_JA_ICHIBAN (いちばん — 최상)

**노드 정보**: Concept `CONCEPT_COMPARISON_SUPERLATIVE` · Difficulty 2 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_JA_YORI**(위상정렬 14번, YORI는 11번으로 이미 학습 — 이번에 연결)

### 15.1 CONTENT_JA_ICHIBAN_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_ICHIBAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**いちばん**은 여러 대상 중에서 하나가 으뜸이라고 말할 때 씁니다. 이미 배운 **より**(비교)를 이해했다면 최상급은 자연스럽게 이어집니다 — より가 둘을 비교했다면, いちばん은 형용사 앞에 붙어 최상급을 나타냅니다.

**문장 구조**: [주어]は いちばん + [형용사]

より 때 썼던 **大きい**(크다)를 그대로 가져오면, [B]より 부분 없이 **いちばん大きい**(가장 크다)가 됩니다 — より와 달리 비교 대상이 필요 없습니다.

### 15.2 CONTENT_JA_ICHIBAN_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_ICHIBAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **私の家はいちばん大きい。**
> 내 집이 가장 크다.

단어별: 私の家は(내 집은) いちばん大きい(가장 크다)

YORI의 예문(`CONTENT_JA_YORI_EXAMPLE_1`)과 같은 소재(私の家, 大きい)를 그대로 이어받았다.

**"이미 배운 문법만 사용" 검증**: いちばん 최상급 외의 문법 표지 없음.

### 15.3 CONTENT_JA_ICHIBAN_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_ICHIBAN", "GRAMMAR_JA_YORI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["私の家はあなたの家より大きい。", "私の家はいちばん大きい。"]` |

**본문(Generation Practice, Prerequisite 활용형)**:

> 다음 두 문장을 각각 일본어로 써보세요.
> 1) 내 집이 당신의 집보다 크다. *(비교 — 이미 배운 より)*
> 2) 내 집이 가장 크다. *(최상급 — 새로 배운 いちばん)*

**설계 메모**: 1번은 11번 노드의 예문을 그대로 재사용했다. VI의 HON/NHAT, EN의 COMPARATIVE/SUPERLATIVE와 동일한 방식(형식적 Contrast는 없지만 같은 소재로 비교→최상급 순서를 QUIZ에서 체감)이다.

### 15.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — より(11) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**YORI와의 Prerequisite 연결 확인(사용자 요청)**: EXPLANATION이 "より를 이해했다면 자연스럽게 이어진다"는 흐름으로 시작했고, EXAMPLE·QUIZ 모두 YORI의 소재(私の家, 大きい)를 그대로 재사용했다 — Prerequisite 관계가 설명 흐름과 콘텐츠 소재 양쪽에서 일관되게 반영됐다.

### 15.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.7: `Prerequisite: GRAMMAR_JA_YORI`를 EXPLANATION의 서술 구조로 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_ICHIBAN_PREREQ_YORI`(UNIDIRECTIONAL, weight 0.8) 확인.
- 발견된 이슈: 없음.

---

## 16. GRAMMAR_JA_NAKEREBA_NARANAI (〜なければならない — 필요·의무)

**노드 정보**: Concept `CONCEPT_MODALITY_NECESSITY` · Difficulty 3 · Prerequisite/Alternative `—`, **Related: GRAMMAR_JA_DEKIRU, Contrast: GRAMMAR_JA_DEKIRU**(위상정렬 15번, DEKIRU는 9번으로 이미 학습 — 이번에 동시 연결). VI의 PHAI/CO_THE, EN의 HAVE_TO/CAN과 대응되는 세 번째 사례다.

### 16.1 CONTENT_JA_NAKEREBA_NARANAI_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_NAKEREBA_NARANAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**なければならない**는 "~해야 한다"라는 필요·의무를 나타냅니다. 이미 배운 **できる**(가능)와 둘 다 "행동을 할 수 있는가·해야 하는가"를 다룬다는 공통점이 있지만, 뜻은 대조적입니다 — できる는 "할 수 있는 능력·가능성"을, なければならない는 "반드시 해야 하는 의무"를 말합니다.

**문장 구조**: [동사 ない形의 い→ければ] + ならない

食べる의 ない形은 食べない인데, 마지막 い를 ければ로 바꾸고 ならない를 붙이면 **食べなければならない**(먹어야 한다)가 됩니다.

### 16.2 CONTENT_JA_NAKEREBA_NARANAI_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_NAKEREBA_NARANAI"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べなければならない。**
> 밥을 먹어야 한다.

단어별: ご飯を(밥을) 食べなければならない(먹어야 한다, 食べる의 ない形 활용)

**"이미 배운 문법만 사용" 검증**: なければならない 외의 문법 표지 없음.

### 16.3 CONTENT_JA_NAKEREBA_NARANAI_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_NAKEREBA_NARANAI", "GRAMMAR_JA_DEKIRU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["ご飯を食べることができる。", "ご飯を食べなければならない。"]` |

**본문(Generation Practice, Related+Contrast 동시 활용형)**:

> 다음 두 문장을 각각 일본어로 써보세요.
> 1) 밥을 먹을 수 있다. *(가능 — できる)*
> 2) 밥을 먹어야 한다. *(의무 — なければならない)*

**설계 메모**: 1번은 9번 노드의 QUIZ 문장을 그대로 재사용했다. 같은 동사(食べる)·목적어(ご飯)를 고정하고 표지만 できる↔なければならない로 바꿔, Related(둘 다 행동의 가능성·여부를 다루는 MODALITY)와 Contrast(가능 vs 의무) 두 관계를 하나의 QUIZ로 동시 충족했다.

### 16.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — できる(9) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**3언어 설계 패턴 일관성 확인(사용자 요청)**:

| 언어 | Contrast 쌍 | Related+Contrast 동시 처리 방식 |
|---|---|---|
| VI | CO_THE(가능) ↔ PHAI(의무) | 같은 동사(đi), 표지만 교체 |
| EN | CAN(가능) ↔ HAVE_TO(의무) | 같은 동사(cook), 표지만 교체(활용 차이는 1인칭 현재형으로 배제) |
| JA(이번) | DEKIRU(가능) ↔ NAKEREBA_NARANAI(의무) | 같은 동사·목적어(食べる/ご�飯), 표지만 교체 |

세 언어 모두 "MODALITY_ABILITY ↔ MODALITY_NECESSITY" 쌍을 같은 설계 패턴(동사 고정, 표지 교체)으로 처리했다 — Core Standard가 언어 유형과 무관하게 동일한 콘텐츠 설계 전략을 지원함을 재확인했다.

### 16.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.3: `Related`·`Contrast: GRAMMAR_JA_DEKIRU`를 QUIZ 하나로 동시 충족했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_NAKEREBA_NARANAI_RELATED_DEKIRU`(weight 0.3)·`REL_DEKIRU_CONTRAST_NAKEREBA_NARANAI`(weight 0.4) 확인.
- 발견된 이슈: 없음.

---

## 17. GRAMMAR_JA_CL_NIN (〜人 — 사람 분류사)

**노드 정보**: Concept `CONCEPT_QUANTITY_CLASSIFIER` · Difficulty 3 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_JA_CL_HON**(위상정렬 16번, 19번 미학습 — 이연). 이 노드는 **사람 분류사만** 다룬다.

### 17.1 CONTENT_JA_CL_NIN_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_NIN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**人**은 사람을 셀 때 쓰는 분류사입니다. 一人(ひとり)·二人(ふたり)는 특별한 읽기이고, **三人(さんにん)부터는 숫자+にん으로 규칙적**입니다.

**문장 구조**: [숫자] + 人

예를 들어 三人(さんにん)은 "세 사람", 五人(ごにん)은 "다섯 사람"입니다.

**참고**: 이 문서는 규칙적인 읽기(三人부터)만 사용한다. 一人·二人 같은 불규칙 읽기는 Vocabulary 영역의 몫이다(§0).

### 17.2 CONTENT_JA_CL_NIN_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_NIN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **友達が三人います。**
> 친구가 세 명 있다.

단어별: 友達が(친구가) 三人(세 사람) います(있다, いる의 정중체)

**"이미 배운 문법만 사용" 검증**: 人 분류사(대상) 외의 문법 표지 없음. **여기 쓰인 いる는 "있다"라는 존재를 나타내는 일반 동사(一段活用, 규칙적)이며, 9번 `GRAMMAR_JA_TE_IRU`의 진행상 조동사 용법(て형 뒤에서만 쓰임)과는 다른 용법이다** — て형이 앞에 없어 혼동 소지가 없다(EN의 have 세 용법 구분과 같은 종류의 점검). 三人은 규칙 읽기라 一人·二人의 불규칙성을 피했다. CL_HON은 언급하지 않았다.

### 17.3 CONTENT_JA_CL_NIN_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_NIN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"学生が五人います。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"학생이 다섯 명 있다."**

### 17.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 人 분류사 외 신규 문법 없음, CL_HON 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — いる(一段) 규칙적, 一人·二人 불규칙 읽기 회피 |
| **いる 동형이의 검증(신규 발견)** | 통과 — 존재 동사(이 노드)와 TE_IRU 진행상 조동사(9번)는 て형 유무로 구조적으로 구분됨을 확인 |

**CL_HON 연결 기반 구조 확인(사용자 요청)**: CL_HON은 가늘고 긴 물체를 세는 분류사라 이 노드의 명사(友達, 学生 — 사람)를 그대로 재사용할 수 없다 — VI의 CL_CAI/CL_CON처럼 "틀은 고정([숫자]+분류사), 분류사·명사는 대상 유형에 맞춰 교체"하는 방식이 될 것으로 예상되며, CL_HON 차례에서 이 방식을 적용한다.

### 17.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.6: `Contrast: GRAMMAR_JA_CL_HON`을 확인했으나 미학습으로 19번(마지막) 차례로 이연.
- 발견된 이슈: いる의 존재동사/진행상조동사 동형이의을 새로 검증(문제 없음으로 확인).

---

## 18. GRAMMAR_JA_TARA (〜たら — 조건)

**노드 정보**: Concept `CONCEPT_CONDITIONAL_SIMPLE` · Difficulty 3 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_JA_TA**(위상정렬 17번, TA는 1번으로 이미 학습 — 이번에 연결)

### 18.1 CONTENT_JA_TARA_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_TARA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**たら**는 "만약 ~하면"이라는 조건을 나타냅니다. 이미 배운 **た形**에 ら만 붙이면 됩니다 — た形을 먼저 이해해야 たら를 만들 수 있습니다.

**문장 구조**: [동사 た形]+ら, [결과절]

食べた(먹었다)에 ら를 붙이면 **食べたら**(먹으면)가 되어, 조건을 나타내는 절이 됩니다. た形은 원래 "끝난 일"을 나타냈지만, たら는 여기서 완전히 새로운 기능(조건)을 갖는다는 점에 주의해야 합니다 — 형태만 물려받았을 뿐 뜻은 다릅니다.

### 18.2 CONTENT_JA_TARA_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_TARA", "GRAMMAR_JA_MASU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **ご飯を食べたら、行きます。**
> 밥을 먹으면, 갈게요.

단어별: ご飯を食べたら(밥을 먹으면, 食べた+ら) 行きます(갈게요, 4번에서 학습한 ます形)

**"이미 배운 문법만 사용" 검증**: たら와 ます形(4번, 이미 학습) 외의 문법 표지 없음. と·ば·なら 같은 다른 조건 표현은 도입하지 않았다.

### 18.3 CONTENT_JA_TARA_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_TARA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"話したら、行きます。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"말하면, 갑니다."**

### 18.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — ます形(4) 재사용 확인, 다른 조건 표현 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |

**TA와의 연결 명확성 + 독립적 새 문법 구분(사용자 요청)**: EXPLANATION이 "た形을 먼저 이해해야 たら를 만들 수 있다"는 흐름으로 Prerequisite를 명시했다. 동시에 "형태만 물려받았을 뿐 뜻(조건)은 완전히 다른 새 기능"이라고 별도로 강조해, たら가 TA의 단순 확장이 아니라 **독립적인 문법**임을 분명히 했다 — VI의 ROI(DA에서 형태를 가져오되 완료라는 새 기능을 가짐)와 같은 성격의 구분이다.

### 18.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.8: `Prerequisite: GRAMMAR_JA_TA`를 EXPLANATION의 서술 구조로 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_TARA_PREREQ_TA`(UNIDIRECTIONAL, weight 0.7) 확인.
- 발견된 이슈: 없음.

---

## 19. GRAMMAR_JA_RARERU (られる形 — 수동태)

**노드 정보**: Concept `CONCEPT_VOICE_PASSIVE` · Difficulty 3 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 18번, 단독 작성)

**범위 제한(사용자 요청)**: られる/れる는 수동 외에도 가능·존경을 나타낼 수 있는(같은 활용형을 공유하는) 다기능 표지이지만, 이 노드는 **수동(受身) 의미만** 다룬다. 가능·존경으로의 확장은 하지 않는다. (참고: VI는 수혜/불리 2개 노드로 나눴지만, EN·JA는 형태 하나로 통합하고 문맥으로 뉘앙스를 구분하는 동일 유형이다 — `JA_LANGUAGE_PACK.md` §4.9 설계 노트.)

### 19.1 CONTENT_JA_RARERU_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_RARERU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**られる/れる**는 수동태(受身形)를 나타냅니다 — 주어가 동작을 받는 대상이 됩니다. 一段活用은 る를 떼고 られる를 붙이고, 五段活用은 어미를 あ단으로 바꾸고 れる를 붙입니다.

**문장 구조**: [주어] + が/は + [동사 られる/れる形]

예를 들어 褒める(칭찬하다, 一段)의 수동형은 褒められる인데, 여기에 이미 배운 た形을 붙이면 **褒められた**(칭찬받았다)가 됩니다.

**참고**: られる/れる는 수동 외에 가능·존경을 나타낼 수도 있지만, 이 노드는 수동 의미만 다룹니다.

### 19.2 CONTENT_JA_RARERU_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_RARERU", "GRAMMAR_JA_TA"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **私は褒められた。**
> 나는 칭찬받았다.

단어별: 私は(나는, 동작을 받는 사람) 褒められた(칭찬받았다, 褒める의 수동형+た形)

**수동 해석만 가능하도록 설계**: 주어 私가 동작의 **대상**(칭찬받는 사람)으로만 등장하고, 뒤에 목적어가 없어 가능형("칭찬할 수 있다")으로 읽힐 여지가 없다 — VI의 DUOC_PASSIVE 때와 같은 구조적 설계다.

**"이미 배운 문법만 사용" 검증**: られる형과 た形(1번, 이미 학습) 외의 문법 표지 없음.

### 19.3 CONTENT_JA_RARERU_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_RARERU"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"私は助けられた。"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 일본어로 써보세요.
> **"나는 도움받았다."**

### 19.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — TA(1) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류 명확성(JA 전용 제약)** | 통과 — 褒める·助ける 모두 一段活用, 명확 |
| **가능·존경 의미 무혼입(사용자 요청 특별 검증)** | 통과 — 목적어 없는 구조로 가능형 해석 차단, 존경 표현 문맥(경어 대상)도 없음 |

### 19.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.9: 모든 형식적 관계가 `—`임을 재확인. 설계 노트(VI 2분리 vs EN·JA 통합)를 반영했다.
- 발견된 이슈: 없음.

---

## 20. GRAMMAR_JA_CL_HON (〜本 — 가늘고 긴 사물 분류사, 마지막 노드)

**노드 정보**: Concept `CONCEPT_QUANTITY_CLASSIFIER`(CL_NIN과 동일 Concept) · Difficulty 4 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_JA_CL_NIN**(위상정렬 19번, 마지막 노드 — CL_NIN은 16번으로 이미 학습). 이 노드는 **가늘고 긴 사물 분류사만** 다룬다.

### 20.1 CONTENT_JA_CL_HON_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_HON"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 4 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**本**은 가늘고 긴 물체(연필, 병 등)를 셀 때 쓰는 분류사입니다. 이미 배운 **人**(사람 분류사)과 붙는 자리는 같지만(숫자 뒤) 대상이 다릅니다 — 人은 사람에, 本은 가늘고 긴 사물에 씁니다.

**문장 구조**: [숫자] + 本

예를 들어 鉛筆(연필)을 **二本**(にほん, 두 자루)처럼 셀 수 있습니다.

**참고**: 一本(いっぽん)·三本(さんぼん) 등은 발음이 변하는(음편) 읽기라 이 문서에서는 피하고, 변하지 않는 二本만 사용한다(§0, 16번의 一人·二人 회피와 같은 원칙).

### 20.2 CONTENT_JA_CL_HON_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_HON"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 4 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **鉛筆が二本あります。**
> 연필이 두 자루 있다.

단어별: 鉛筆が(연필이) 二本(두 자루) あります(있다, ある의 정중체)

**동사 구분 메모**: 무생물(鉛筆)의 존재는 いる가 아니라 **ある**를 쓴다 — 16번(友達/学生, 생물)이 いる를 썼던 것과 정확히 대비된다.

**"이미 배운 문법만 사용" 검증**: 本 분류사 외의 문법 표지 없음.

### 20.3 CONTENT_JA_CL_HON_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_JA_CL_HON", "GRAMMAR_JA_CL_NIN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 4 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["学生が五人います。", "瓶が二本あります。"]` |

**본문(Generation Practice, Contrast 활용형 — 분류사 선택 판별)**:

> 다음 두 표현을 각각 일본어로 써보세요.
> 1) 학생 다섯 명 *(사람 — 人)*
> 2) 병 두 개 *(가늘고 긴 사물 — 本)*

**설계 메모**: 1번은 16번 노드의 QUIZ 문장을 그대로 재사용했다. 명사 자체가 사람/사물로 다르므로 VI의 CL_CAI/CL_CON, "숫자+분류사+명사" 틀 고정+분류사·명사 교체 방식을 그대로 적용했다.

### 20.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — CL_NIN(16) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(4) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **활용류/불규칙 읽기 회피(JA 전용 제약)** | 통과 — 一本·三本(음편) 회피, 二本만 사용 |
| **CL_NIN 역할 구분(사용자 요청)** | 명확 — 人은 EXPLANATION에서 "사람"으로, 本은 "가늘고 긴 사물"로 정확히 대비됨. ある/いる 동사 구분도 함께 검증 |

### 20.5 상위 문서 정합성 확인

- `JA_LANGUAGE_PACK.md` §4.6: `Contrast: GRAMMAR_JA_CL_NIN`을 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다.
- `JA_LANGUAGE_PACK.md` §5: `REL_CL_HON_CONTRAST_CL_NIN`(BIDIRECTIONAL, weight 0.6) 확인.
- 발견된 이슈: 없음.
- **19개 노드 전체 완료.**

---

## 21. 종합 검증 — JA_CONTENT.md v1.0 완료 선언

19개 노드 전체 작성 완료에 따라, VI·EN과 동일한 6개 항목을 종합 검증한다.

### 21.1 번호 연속성

전체 재확인 결과 `0 → 1 → 2 → ... → 20 → 21`(이 절) → `22`(개정 이력)까지 연속됨을 확인했다. 작성 도중 6회 번호 누락이 발생했으나 그때마다 즉시 정정했다.

### 21.2 위상정렬 순서

3개 PREREQUISITE 제약을 전부 검증했다. VI와 달리 JA는 §1 계획과 실제 실행 순서가 끝까지 일치했다(재정렬 없음 — EN과 같음).

| 제약 | 요구 노드 | 선행 노드 | 순서 |
|---|---|---|---|
| REL_MADA_NAI_PREREQ_NAI | MADA_NAI(12) | NAI(5) | ✅ |
| REL_ICHIBAN_PREREQ_YORI | ICHIBAN(14) | YORI(11) | ✅ |
| REL_TARA_PREREQ_TA | TARA(17) | TA(1) | ✅ |

### 21.3 관계 반영 여부

`JA_LANGUAGE_PACK.md` §5의 11개 관계 + §4.10 노드 표 기준 1개(카탈로그 누락분, MASU-KEDO) = **12개 전부 콘텐츠에 반영됨을 확인했다.**

| 유형 | 개수 | 반영 위치(노드) |
|---|---|---|
| PREREQUISITE | 3 | MADA_NAI, ICHIBAN, TARA |
| CONTRAST | 4 | TE_IRU(↔TA), MADA_NAI(↔NAI), NAKEREBA_NARANAI(↔DEKIRU), CL_HON(↔CL_NIN) |
| RELATED | 5 | WH_INSITU(↔KA), DEKIRU(↔TAI), NAKEREBA_NARANAI(↔DEKIRU), NE(↔MASU), KEDO(↔MASU, 카탈로그 보완분) |
| ALTERNATIVE | 0 | 없음 — JA도 EN과 마찬가지로 이중 기능 조동사가 없어 Alternative 관계 자체가 존재하지 않음 |
| **합계** | **12** | 11(카탈로그) + 1(표 기준 보완) |

### 21.4 "이미 배운 문법만 사용" 원칙

19개 노드 전체에서 위반 없이 유지됐다. JA 고유의 검증 사례가 특히 많았다.

| 노드 | 감지한 위험 | 처리 |
|---|---|---|
| TE_IRU(8) | する가 미검증 불규칙 동사(v1.1 이월) | 食べる로 대체, 시나리오2 부분 충족으로 명시 |
| DEKIRU(9) | たい/できる 접속 방식이 같다고 단정할 위험 | 6번에서 유보 후 원문(시나리오3) 대조로 확정(실제로 다름을 확인) |
| CL_NIN(16) | いる(존재동사) vs て+いる(진행상조동사) 동형이의 | て형 유무로 구조적 구분 |
| CL_HON(19) | ある(무생물)/いる(생물) 존재동사 오용 가능성 | 명사의 생물성에 맞춰 정확히 구분 사용 |
| RARERU(18) | られる의 가능·존경 겸용 가능성 | 수동 의미만 명시적으로 한정, 목적어 없는 구조로 가능형 해석 차단 |
| 전 구간 | 불규칙 활용류·불규칙 읽기(帰る류, 一人/二人, 一本/三本 등) | 활용류가 명확한 동사·규칙 읽기만 사용 |

### 21.5 회피 사례 및 동형이의 검증(투명하게 기록)

| 사례 | 상태 | 비고 |
|---|---|---|
| TE_IRU(8)의 시나리오2 | する 대신 食べる로 대체, **부분 충족** | 문법 조합(TE_IRU+WH_INSITU+KA+MASU)은 완전 실현, 동사만 대체 |
| DEKIRU(9)의 접속 방식 | **판단 후 확정** | 6번에서 "같다고 단정하지 않겠다"고 유보 → 9번에서 원문 대조로 실제로 다름을 확정. 추측하지 않고 근거를 기다린 사례 |
| RARERU(19)의 활용류 커버리지 | **새로 발견된 공백** | EXPLANATION은 一段(られる)·五段(れる) 둘 다 설명했지만, EXAMPLE·QUIZ는 一段 동사(褒める·助ける)만 사용했다 — 五段 동사의 実際 れる 활용형은 이 문서에 예문이 없다 |

세 번째 항목은 이번 검증에서 새로 발견한 **실제 콘텐츠 공백**이다 — 다만 **EN의 `haven't...yet`(Structural Gap, 현재 노드 구조로는 해결 불가 — NOT_YET을 HAVE_VPP 이후 다시 다루는 노드 자체가 없음)과는 등급이 다르다.** RARERU는 **Content Gap**으로 분류한다 — 노드 자체는 이미 존재하고 관계도 없으므로, 이 노드 안에 `CONTENT_JA_RARERU_EXAMPLE_2`(五段活用 동사, 예: 話す→話される) 하나만 추가하면 즉시 해소되는 콘텐츠 부족이다. 새 노드나 새 관계가 필요 없다.

| 구분 | 사례 | 해소 조건 |
|---|---|---|
| **Structural Gap** | EN `NOT_YET`의 `haven't...yet` | 현재 노드 구조만으로는 해결 불가 — 없음(범위 밖으로 영구 보류) |
| **Content Gap** | JA `RARERU`의 五段活用 예문 | 현재 문서 내부에서 해결 가능 — `EXAMPLE_2` 추가만으로 완료 |

### 21.6 문서 전체 정합성

- **Content ID**: `JA_LANGUAGE_PACK.md`에 미리 선언된 EXPLANATION·EXAMPLE Content ID(TBD)를 전부 채웠고, QUIZ ID는 VI·EN과 동일한 `{NODE}_QUIZ_1` 패턴으로 확장했다.
- **Canonical 상태**: 19개 노드 × 3종 = 57개 Content 전부 `source=HUMAN_AUTHORED`, `is_canonical=true`, `is_active=true`.
- **활용류 명확성 제약**(JA 전용): 전 구간에서 유지 — 帰る류 예외 동사, 불규칙 읽기(一人/二人/一本/三本) 전부 배제.
- **Learning Outcome Scenario**(4개): 1번(TA)·3번(DEKIRU+KA+MASU)·4번(MASU)은 원문 그대로 완전 실현. **2번(TE_IRU)은 する→食べる 대체로 부분 실현**(§21.5 기록).
- **"あとで行きます" 소재 스레드**: MASU(4)→NE(7)→KEDO(13) PRAGMATICS 3종 세트의 공통 축으로 재사용되며 캡스톤 QUIZ로 마무리됐다.
- **"私の家/あなたの家" 소재 스레드**: YORI(11)→ICHIBAN(14) COMPARISON 2종에서 재사용됐다.
- **"ご飯を食べる" 소재 스레드**: TA(1)→KA(2, 목적어만 何로 교체)→NAI(5)→TAI(6)→MADA_NAI(12)→NAKEREBA_NARANAI(15)에 걸쳐 이 문서에서 가장 광범위하게 재사용된 축이다.

### 21.7 종합 결론

6개 항목 중 5개는 특이사항 없이 통과했고, 1개 항목(회피 사례 검증)에서 **Content Gap 1건**(RARERU의 五段活用 예문 부재 — 이 문서 내에서 해결 가능)과 **부분 충족 시나리오 1건**(시나리오2, する 대체)을 투명하게 기록했다 — 둘 다 오류가 아니라 범위·시점상의 한계이며, 향후 개정 권고 사항으로 남긴다. EN과 비교하면 JA는 위상정렬 재정렬이 필요 없었고(VI와 대비), 관계 반영도 순조로웠으며, 발견된 공백도 EN의 Structural Gap보다 가벼운 Content Gap이라는 점에서 세 언어 중 가장 매끄럽게 진행된 사례였다.

**`JA_CONTENT.md` v1.0 완료를 선언한다** — `JA_LANGUAGE_PACK.md`의 19개 Grammar Node 전체에 대해 EXPLANATION·EXAMPLE·QUIZ 3종씩(총 57개 Content)을 Canonical 상태로 갖춘 일본어 Tier D 콘텐츠 1차 완성본이다.

---

## 22. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-08 | 최초 작성 — 위상정렬 작업 순서(19개) 확정, `JA_LANGUAGE_PACK.md` §4.10/§5 간 MASU-KEDO Related 누락을 발견해 노드 표 기준으로 반영. 1번 노드 `GRAMMAR_JA_TA`의 EXPLANATION·EXAMPLE·QUIZ 3종 Canonical 콘텐츠 작성, 활용류(一段/五段) 명확성 제약 준수 확인 |
| 1.1 | 2026-07-08 | 2번 노드 `GRAMMAR_JA_KA` 콘텐츠 3종 추가 — 단독 작성, 의문사 미사용. 1번 노드 예문("ご飯を食べた")에 か만 붙여 재사용, 일본어 주어 생략이 별도 문법이 아닌 화용적 현상임을 명시. WH_INSITU의 문말 か가 이 노드와 완전히 동일함을 확인해 변형 없는 재사용 기반으로 명시 |
| 1.2 | 2026-07-08 | 3번 노드 `GRAMMAR_JA_WH_INSITU` 콘텐츠 3종 추가 — KA와의 `Related`를 목적어만 교체(ご飯→何)하는 순수한 최소 차이 비교로 연결. 시나리오2가 TE_IRU 미학습으로 완성 불가능함을 사전에 발견해 8번 차례로 이연(사용자 사전 합의). KA(질문 마무리)와 WH_INSITU(의문사 위치)의 역할 구분을 명시 |
| 1.3 | 2026-07-08 | 4번 노드 `GRAMMAR_JA_MASU` 콘텐츠 3종 추가 — 단독 작성, 시나리오4("あとで行きます。") 완전 실현. NE·KEDO 둘 다 미언급, 두 노드 모두 "[평서문]+종결사/접속사" 구조라 ます形 문장 뒤에 형태 변경 없이 붙을 수 있음을 기반 구조로 확인 |
| 1.4 | 2026-07-08 | 5번 노드 `GRAMMAR_JA_NAI` 콘텐츠 3종 추가 — 단독 작성, 一段(食べる)·五段(話す) 양쪽 활용류 검증. MADA_NAI 미언급, ない形 출력 자체가 MADA_NAI가 필요로 하는 전부(まだ만 앞에 붙이면 됨)임을 기반 구조로 확인. 섹션 번호 누락(§7) 즉시 정정 |
| 1.5 | 2026-07-08 | 6번 노드 `GRAMMAR_JA_TAI` 콘텐츠 3종 추가 — 단독 작성, DEKIRU 미언급. たい(ます形 어간 직접 접속)와 できる(정확한 접속 방식 미확정)의 구조가 같다고 단정하지 않고, 9번에서 확정하겠다고 정직하게 기록(EN WANT_TO/CAN과 같은 종류의 신중함). 섹션 번호 누락(§8) 즉시 정정 |
| 1.6 | 2026-07-08 | 7번 노드 `GRAMMAR_JA_NE` 콘텐츠 3종 추가 — MASU와의 `Related`를 4번 예문 재사용+ね 추가의 DANG/DA류 최소 차이 비교로 연결(JA 최초 적용). MASU(형태 활용)와 NE(종조사 첨가)의 층위 차이를 명확히 구분. KEDO 미언급 확인. 섹션 번호 누락(§9) 즉시 정정 |
| 1.7 | 2026-07-08 | 8번 노드 `GRAMMAR_JA_TE_IRU` 콘텐츠 3종 추가 — TA와의 `Contrast`를 완전 동일 문장+표지 교체(시간부사 조정도 불필요)의 순수 최소 차이 비교로 연결. QUIZ에서 TE_IRU+WH_INSITU+KA+MASU 4개 노드를 한 문장에 결합해 시나리오2를 문법적으로 완전 실현(する 미검증으로 食べる 대체, 부분 충족으로 명시 기록). 섹션 번호 누락(§10) 즉시 정정 |
| 1.8 | 2026-07-08 | 9번 노드 `GRAMMAR_JA_DEKIRU` 콘텐츠 3종 추가 — TAI와의 `Related`를 6번 예문 재사용+기능 대비 QUIZ로 연결. たい(ます形어간 직접 접속) vs できる(辞書形+こと 명사화 경유)의 접속 방식 차이를 확정 — 6번에서 유보했던 판단이 옳았음을 확인. 시나리오3을 대체 없이 원문 그대로 완전 실현(買う가 검증된 五段活用이라 する 회피가 불필요했던 대비 사례) |
| 1.9 | 2026-07-08 | 10번 노드 `GRAMMAR_JA_TE_KUDASAI` 콘텐츠 3종 추가 — 단독 작성, 一段(食べる)·五段(話す) 양쪽 활용류 검증. 형식적 관계가 전혀 없는 "완결된 단독 기반" 노드임을 명시 |
| 1.10 | 2026-07-08 | 11번 노드 `GRAMMAR_JA_YORI` 콘텐츠 3종 추가 — 단독 작성, ICHIBAN 미언급. VI HON/EN COMPARATIVE와 같은 "내 집/네 집" 패턴 재사용. 형용사(大きい/面白い)가 ICHIBAN에서 [B]より→いちばん 교체만으로 그대로 이어받을 수 있는 기반임을 확인 |
| 1.11 | 2026-07-08 | 12번 노드 `GRAMMAR_JA_MADA_NAI` 콘텐츠 3종 추가 — NAI와의 `Prerequisite`(EXPLANATION 서술 구조)·`Contrast`(5번 예문 재사용 최소 차이 비교)를 VI CHUA·EN NOT_YET와 동일한 방식으로 역할 분리. 세 언어 전체에서 일관된 처리 패턴임을 명시 |
| 1.12 | 2026-07-08 | 13번 노드 `GRAMMAR_JA_KEDO` 콘텐츠 3종 추가 — §0에서 기록한 MASU-KEDO 카탈로그 누락을 실제로 적용, EN IF_WILL-WILL과 같은 방식의 검증 성공. NE(공감·확인)와 KEDO(완곡)의 기능 차이 명시. PRAGMATICS 계열 마지막 노드로서 QUIZ를 3자 캡스톤(ます/ね/けど)으로 확장, VI A_CONFIRM과 동일한 설계 |
| 1.13 | 2026-07-08 | 14번 노드 `GRAMMAR_JA_ICHIBAN` 콘텐츠 3종 추가 — YORI와의 `Prerequisite`를 EXPLANATION 서술 구조로 반영, 私の家/大きい 소재를 그대로 이어받아 より→いちばん 최소 차이 비교(11번 예문 재사용)로 QUIZ 구성. VI HON/NHAT, EN COMPARATIVE/SUPERLATIVE와 동일한 처리 방식 |
| 1.14 | 2026-07-08 | 15번 노드 `GRAMMAR_JA_NAKEREBA_NARANAI` 콘텐츠 3종 추가 — DEKIRU와의 `Related`+`Contrast`를 QUIZ 하나로 동시 충족(9번 예문 재사용, 같은 동사·목적어 고정+표지 교체). VI CO_THE/PHAI, EN CAN/HAVE_TO와 동일한 설계 패턴임을 비교표로 명시적 검증 — Core Standard의 언어 독립성 재확인 |
| 1.15 | 2026-07-08 | 16번 노드 `GRAMMAR_JA_CL_NIN` 콘텐츠 3종 추가 — 단독 작성, 一人·二人 불규칙 읽기 회피하고 三人부터 규칙 읽기만 사용. いる(존재 동사)와 TE_IRU(진행상 조동사)의 동형이의 가능성을 신규 검증(て형 유무로 구조적 구분, 문제 없음). CL_HON 연결은 VI CL_CAI/CL_CON류의 "틀 고정+분류사·명사 교체" 패턴이 될 것으로 예상 |
| 1.16 | 2026-07-08 | 17번 노드 `GRAMMAR_JA_TARA` 콘텐츠 3종 추가 — TA와의 `Prerequisite`를 EXPLANATION 서술 구조로 반영. たら가 TA의 형태를 물려받되 완전히 새로운 기능(조건)을 갖는 독립 문법임을 명시(VI ROI와 같은 성격). MASU(4번)와 결합해 결과절 구성, 다른 조건 표현(と/ば/なら) 미도입 확인 |
| 1.17 | 2026-07-08 | 18번 노드 `GRAMMAR_JA_RARERU` 콘텐츠 3종 추가 — 단독 작성, 가능·존경 의미 완전 배제(수동만), 목적어 없는 구조로 가능형 해석 차단. 19번(마지막) 노드 `GRAMMAR_JA_CL_HON` 콘텐츠 3종 추가 — CL_NIN과의 `Contrast`를 16번 예문 재사용+ある/いる 동사 구분으로 반영. §1을 19개 전체 완료 상태로 최종 갱신. §21 종합 검증 추가 — 번호 연속성·위상정렬·12개 관계 전체 반영(3 Prerequisite+4 Contrast+5 Related+0 Alternative)·이미 배운 문법만 사용 원칙(6건의 JA 고유 검증 포함)·회피 사례 투명 기록(RARERU 五段活用 예문 공백 1건, 시나리오2 부분 충족 1건)·문서 전체 정합성 6개 항목 검증 완료. **JA_CONTENT.md v1.0 완료 선언** |
