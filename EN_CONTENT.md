# EN_CONTENT.md
## 영어 콘텐츠 본문 (Tier D)

> 이 문서는 `CONTENT_PRODUCTION_STANDARD.md`(Tier D)의 표준을 따른다. `EN_LANGUAGE_PACK.md`(Tier A/B)가 정의한 Grammar Node·Content ID 자리에 실제 텍스트를 채운다. `VI_CONTENT.md`에서 검증한 제작 패턴(위상정렬 배치, 최소 차이 비교, 노드별 자체 검증+상위 문서 정합성 확인)을 그대로 재사용한다.

문서 계층: `CONTENT_SCHEMA.md` → `CONTENT_PRODUCTION_STANDARD.md` → **`EN_CONTENT.md`(이 문서)**

---

## 0. 문서의 지위

- Tier D. `EN_LANGUAGE_PACK.md`가 확정한 Content ID 체계·`grammar_node_ids` 참조를 그대로 쓴다.
- 노드는 위상정렬 순서로 배치한다 — 아래 §1의 순서표가 작업 순서다.
- **EN 전용 제약(VI에는 없던 것)**: `EN_LANGUAGE_PACK.md` §1.2가 이미 "예문은 불규칙 동사를 피하고 규칙 동사만 사용한다"고 명시했다 — Vocabulary Schema(Tier A)가 아직 없어 불규칙형(go→went 등)을 다룰 공식 구조가 없기 때문이다. 이 문서 전체에서 이 제약을 지킨다.
- **주의**: `VI_CONTENT.md`와 동일하게, 이 세션에서 설계와 동시에 작성된 초안이라 `CONTENT_PRODUCTION_STANDARD.md` §4.3의 24시간 시간차 검수 조건을 문자 그대로 충족하지 않는다. `is_canonical=true`로 표시하되 실제 서비스 반영 전 별도 검수를 전제로 한다.
- **발견된 사항**: `EN_LANGUAGE_PACK.md` §4.8은 `GRAMMAR_EN_IF_WILL`의 `Prerequisite: GRAMMAR_EN_WILL`을 명시하지만 §5 관계 카탈로그(14개 목록)에는 누락되어 있다. 노드 표(§4.8)를 더 구체적인 근거로 채택해 위상정렬·콘텐츠 설계에 반영한다 — `EN_LANGUAGE_PACK.md` 자체 수정은 이 문서 범위 밖이다.

---

## 1. 작업 순서(위상정렬, 전체 21개) — **전체 완료**

1. GRAMMAR_EN_PAST_SIMPLE ✅
2. GRAMMAR_EN_WILL ✅
3. GRAMMAR_EN_CAN ✅
4. GRAMMAR_EN_NOT ✅
5. GRAMMAR_EN_WANT_TO ✅
6. GRAMMAR_EN_IMPERATIVE ✅
7. GRAMMAR_EN_PLEASE ✅
8. GRAMMAR_EN_BE_VING ✅
9. GRAMMAR_EN_DO_SUPPORT_Q ✅
10. GRAMMAR_EN_SUBJECT_AUX_INVERSION ✅
11. GRAMMAR_EN_WH_FRONTING ✅
12. GRAMMAR_EN_HAVE_TO ✅
13. GRAMMAR_EN_NOT_YET ✅
14. GRAMMAR_EN_COMPARATIVE ✅
15. GRAMMAR_EN_SUPERLATIVE ✅
16. GRAMMAR_EN_COULD_REQUEST ✅
17. GRAMMAR_EN_PARTITIVE ✅
18. GRAMMAR_EN_HAVE_VPP ✅
19. GRAMMAR_EN_IF_WILL ✅
20. GRAMMAR_EN_BE_VPP ✅
21. GRAMMAR_EN_TAG_QUESTION ✅ ← **최종 노드**

---

## 2. GRAMMAR_EN_PAST_SIMPLE (Past Simple — 규칙 과거형)

**노드 정보**: Concept `CONCEPT_TENSE_PAST` · Difficulty 1 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_EN_BE_VING**(8번, 아직 미학습 — 이연)

### 2.1 CONTENT_EN_PAST_SIMPLE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_PAST_SIMPLE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

영어에서 이미 끝난 일(과거)을 말할 때는 동사 끝에 **-ed**를 붙입니다. 한국어의 "-았/었-"과 비슷한 역할입니다.

**문장 구조**: [주어] + [동사]-ed + [목적어]

예를 들어 "일하다"는 work인데, "일했다"라는 뜻을 전하려면 work 뒤에 -ed를 붙여 **worked**라고 합니다.

**참고**: 이 노드는 규칙형(-ed)만 다룬다. go→went 같은 불규칙형은 동사 하나하나의 어휘적 특성이라 이 문법 노드가 아니라 Vocabulary 영역의 몫이다(아직 공식 구조 미정, `EN_LANGUAGE_PACK.md` §1.2).

### 2.2 CONTENT_EN_PAST_SIMPLE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_PAST_SIMPLE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I worked yesterday.**
> 나는 어제 일했다.

단어별: I(나는) worked(일했다, work+ed) yesterday(어제)

이 문장은 `EN_LANGUAGE_PACK.md` §6 시나리오1("I worked yesterday.")을 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: -ed(대상) 외의 문법 표지 없음. work는 규칙 동사라 §0의 불규칙 회피 원칙을 지켰다.

### 2.3 CONTENT_EN_PAST_SIMPLE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_PAST_SIMPLE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"I played yesterday."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"나는 어제 놀았다."**

**설계 메모**: EXAMPLE과 다른 규칙 동사(play)를 써서 -ed 규칙 자체를 일반화했는지 확인한다(work 하나만 익히고 끝나지 않도록).

### 2.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — -ed 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — work, play 둘 다 규칙 동사, go/see 등 불규칙형 없음 |

### 2.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.1: `Contrast: GRAMMAR_EN_BE_VING`를 확인했으나 BE_VING 미학습으로 8번 차례로 이연.
- `EN_LANGUAGE_PACK.md` §6 시나리오1: 그대로 실현했다.
- 발견된 이슈: 없음.

---

## 3. GRAMMAR_EN_WILL (will — 미래 조동사)

**노드 정보**: Concept `CONCEPT_TENSE_FUTURE` · Difficulty 1 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 2번, 단독 작성). 19번 `GRAMMAR_EN_IF_WILL`의 선행 노드이지만, 그 의무는 IF_WILL 쪽에서 충족한다 — 이 노드는 조건문을 언급하지 않는다.

### 3.1 CONTENT_EN_WILL_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**will**은 미래에 일어날 일을 말할 때 동사 앞에 쓰는 조동사입니다. 주어가 무엇이든 형태가 바뀌지 않고 항상 will 그대로이며, 뒤에 오는 동사도 원형(-ed나 -s 없이) 그대로 씁니다.

**문장 구조**: [주어] + will + [동사원형] + [목적어]

예를 들어 work(일하다) 앞에 will을 놓으면 **will work**(일할 것이다)가 됩니다.

### 3.2 CONTENT_EN_WILL_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I will work tomorrow.**
> 나는 내일 일할 것이다.

단어별: I(나는) will(미래 조동사) work(일하다, 동사원형) tomorrow(내일)

**"이미 배운 문법만 사용" 검증**: will 외의 문법 표지 없음. work는 규칙 동사이며, 여기서는 원형 그대로 쓰여 애초에 활용(규칙/불규칙)이 일어나지 않는다.

### 3.3 CONTENT_EN_WILL_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"I will play tomorrow."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"나는 내일 놀 것이다."**

### 3.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — will 외 신규 문법 없음, 조건문(if) 언급 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — work, play 모두 규칙 동사, 원형이라 활용 자체가 없음 |
| **IF_WILL 기반 구조 확인(사용자 요청)** | `[주어]+will+[동사원형]`이라는 이 노드의 구조가 `IF_WILL`의 결과절("S + will + V")과 **정확히 동일한 형태**다 — 별도 수정 없이 그대로 재사용 가능한 뼈대를 마련해뒀다 |

### 3.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.1: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- `EN_LANGUAGE_PACK.md` §4.8: `GRAMMAR_EN_IF_WILL`의 `Prerequisite: GRAMMAR_EN_WILL`은 IF_WILL 쪽 의무이므로 이 노드에서 처리할 것이 없음을 확인.
- `EN_LANGUAGE_PACK.md` §6 시나리오4("I'll go later.")와는 동사 선택만 다르고(go 대신 work) 구조는 동일 — 규칙 동사 제약 준수를 위한 의도적 선택.
- 발견된 이슈: 없음.

---

## 4. GRAMMAR_EN_CAN (can — 능력·가능 조동사)

**노드 정보**: Concept `CONCEPT_MODALITY_ABILITY` · Difficulty 1 · Prerequisite/Alternative `—`, **Related: GRAMMAR_EN_WANT_TO, GRAMMAR_EN_HAVE_TO / Contrast: GRAMMAR_EN_HAVE_TO**(위상정렬 3번, 둘 다 미학습 — 각 노드 차례로 이연). 이 노드는 능력·가능 의미에만 집중한다.

### 4.1 CONTENT_EN_CAN_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**can**은 "~할 수 있다"라는 능력이나 가능을 나타낼 때 동사 앞에 쓰는 조동사입니다. will과 마찬가지로 주어에 따라 형태가 바뀌지 않고, 뒤에 오는 동사도 원형 그대로 씁니다.

**문장 구조**: [주어] + can + [동사원형] + [목적어]

예를 들어 cook(요리하다) 앞에 can을 놓으면 **can cook**(요리할 수 있다)이 됩니다.

부정형은 **can't**입니다(can 자체에 딸린 형태이며, 별도 부정 문법을 빌려오지 않습니다).

### 4.2 CONTENT_EN_CAN_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I can cook.**
> 나는 요리할 수 있다.

단어별: I(나는) can(가능 조동사) cook(요리하다, 동사원형)

**"이미 배운 문법만 사용" 검증**: can 외의 문법 표지 없음. WANT_TO·HAVE_TO는 언급하지 않았다.

### 4.3 CONTENT_EN_CAN_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"I can't cook."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"나는 요리할 수 없다."**

**설계 메모**: can't는 `GRAMMAR_EN_NOT`(4번, 아직 미학습)을 빌리지 않는다 — `EN_LANGUAGE_PACK.md` §4.3의 `surface_forms: can, can't`에 이미 포함된 CAN 자신의 형태이므로 이 시점에 써도 "이미 배운 문법만 사용" 원칙에 어긋나지 않는다.

### 4.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — can/can't 모두 이 노드 자체의 surface_forms |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook은 규칙 동사이며 원형이라 활용 자체가 없음 |
| **WANT_TO/HAVE_TO 미도입 확인** | 통과 — 어디에도 언급·비교 없음 |

**WANT_TO(Related)/HAVE_TO(Related+Contrast) 연결 구조 확인(사용자 요청)**: CAN은 `[주어]+can+동사원형`으로 활용이 전혀 없는 순수 조동사다. 반면 `EN_LANGUAGE_PACK.md` §4.3을 보면 WANT_TO(`want to, wants to, wanted to`)·HAVE_TO(`have to, has to, had to`)는 인칭·시제에 따라 **활용하는 준조동사**다 — CAN과 달리 이 둘은 그 자체가 일반 동사처럼 변한다. 따라서 나중에 CAN과 최소 차이 비교를 설계할 때 DANG/DA류(표지만 교체)를 그대로 쓸 수 없고, **활용형까지 함께 바뀌는** 비교가 되어야 한다는 점을 미리 확인해둔다 — 이는 회피할 문제가 아니라 두 노드 차례에서 정확히 반영해야 할 구조적 차이다.

### 4.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_EN_WANT_TO, GRAMMAR_EN_HAVE_TO`·`Contrast: GRAMMAR_EN_HAVE_TO` 확인, 전부 미학습으로 이연.
- `EN_LANGUAGE_PACK.md` §4.3 참고: "영어 can은 이중 기능이 없으므로 1개면 충분"(VI의 CO_THE/DUOC_ABILITY와 대비되는 설계 노트) — 이 노드에 Alternative가 없는 이유와 일치.
- 발견된 이슈: 없음.

---

## 5. GRAMMAR_EN_NOT (not — 단순 부정, do-support)

**노드 정보**: Concept `CONCEPT_NEGATION_SIMPLE` · Difficulty 1 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_EN_NOT_YET**(13번, 아직 미학습 — 이연). 13번의 선행 노드이기도 하지만 그 의무는 NOT_YET 쪽에서 충족한다.

### 5.1 CONTENT_EN_NOT_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

일반동사를 부정할 때는 **don't/doesn't/didn't** 같은 do-support가 필요합니다(주어·시제에 따라 형태가 다름).

**문장 구조**: [주어] + don't/doesn't + [동사원형] + [목적어]

예를 들어 cook(요리하다)을 부정하려면 don't/doesn't를 써서 **don't cook / doesn't cook**(요리하지 않는다)이라고 합니다.

### 5.2 CONTENT_EN_NOT_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I don't cook.**
> 나는 요리하지 않는다.

단어별: I(나는) don't(부정, do+not 축약) cook(요리하다, 동사원형)

**"이미 배운 문법만 사용" 검증**: don't 외의 문법 표지 없음. NOT_YET은 언급하지 않았다.

### 5.3 CONTENT_EN_NOT_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"He doesn't work."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"그는 일하지 않는다."**

**설계 메모**: 3인칭 단수 he를 써서 don't가 아니라 doesn't로 바뀌는 것까지 함께 연습시켰다.

### 5.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — don't/doesn't 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook, work 모두 규칙 동사 |
| **NOT_YET 미도입 확인** | 통과 — 어디에도 언급 없음 |

**NOT_YET Prerequisite 연결 구조 확인(사용자 요청)**: `EN_LANGUAGE_PACK.md` §4.4에 NOT_YET의 surface_forms는 `not...yet, haven't...yet` 두 가지다. 이 중 **`not...yet`은 이 노드의 do-support 구조에 "yet"만 덧붙이면 되는 형태**라 NOT_YET 시점(13번)에 바로 쓸 수 있다. 반면 `haven't...yet`은 18번 `HAVE_VPP`(완료상)가 있어야 가능한 형태라, NOT_YET 노드에서는 전자만 다루는 것이 "이미 배운 문법만 사용" 원칙에 맞는다는 것을 미리 확인해뒀다.

### 5.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.4: `Contrast: GRAMMAR_EN_NOT_YET`을 확인했으나 미학습으로 이연.
- 발견된 이슈: 없음.

---

## 6. GRAMMAR_EN_WANT_TO (want to — 원함)

**노드 정보**: Concept `CONCEPT_MODALITY_DESIRE` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_EN_CAN**(위상정렬 5번, CAN은 3번으로 이미 학습 — 이번에 연결). HAVE_TO와는 이 노드에서 다루지 않는다(12번 미학습).

### 6.1 CONTENT_EN_WANT_TO_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_WANT_TO"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**want to**는 "~하고 싶다"라는 바람을 나타낼 때 씁니다. 이미 배운 **can**과 동사 앞에 온다는 자리는 비슷하지만, 중요한 차이가 있습니다 — can은 주어가 무엇이든 형태가 바뀌지 않는 순수 조동사인 반면, **want to는 want 자체가 주어에 따라 변합니다**: 주어가 3인칭 단수(he/she/it)면 **wants to**가 됩니다.

**문장 구조**: [주어] + want to/wants to + [동사원형] + [목적어]

예를 들어 cook(요리하다) 앞에 놓으면 **I want to cook**(나는 요리하고 싶다), 3인칭 단수는 **She wants to cook**(그녀는 요리하고 싶다)이 됩니다.

### 6.2 CONTENT_EN_WANT_TO_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_WANT_TO"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I want to cook.**
> 나는 요리하고 싶다.

단어별: I(나는) want to(원함, 준조동사) cook(요리하다, 동사원형)

**"이미 배운 문법만 사용" 검증**: want to 외의 문법 표지 없음. 1인칭 현재형만 사용해 시제 확장 없이 단순하게 유지했다(과거형 wanted to는 쓰지 않음).

### 6.3 CONTENT_EN_WANT_TO_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_WANT_TO", "GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["I can cook.", "I want to cook."]` |

**본문(Generation Practice, Related 활용형 — 의미 대조)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 나는 요리할 수 있다. *(능력 — can)*
> 2) 나는 요리하고 싶다. *(원함 — want to)*

**설계 메모**: 둘 다 1인칭·현재형으로 고정해 활용 차이(can은 불변, want to는 가변)가 QUIZ 채점에 끼어들지 않게 했다 — 그 차이는 EXPLANATION에서만 다루고, 여기서는 CAN/MUON류의 "의미 대조" 자체에 집중했다.

### 6.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — CAN(3) 재사용 확인, HAVE_TO 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook은 규칙 동사 |
| **조동사/준조동사 활용 차이 반영** | EXPLANATION에서 want to/wants to 대비로 명시. QUIZ는 활용 복잡도를 배제하고 1인칭 현재형만 사용 |
| **현재형 중심 유지** | 통과 — wanted to(과거) 미사용 |
| **HAVE_TO 미도입 확인** | 통과 — 어디에도 언급 없음 |

### 6.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_EN_CAN`을 EXPLANATION·QUIZ에 반영했다. HAVE_TO는 12번 차례로 이연.
- `EN_LANGUAGE_PACK.md` §5: `REL_WANT_TO_RELATED_CAN`(BIDIRECTIONAL, weight 0.3) 확인.
- 발견된 이슈: 없음.

---

## 7. GRAMMAR_EN_IMPERATIVE (명령문 — 동사원형으로 시작)

**노드 정보**: Concept `CONCEPT_MOOD_IMPERATIVE` · Difficulty 1 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 6번, 단독 작성). 스키마상 `GRAMMAR_EN_PLEASE`(7번)와 형식적 관계는 없지만, 순수한 명령문 구조를 다뤄 이후 PLEASE가 자연스럽게 붙을 수 있는 기반이 되도록 설계한다.

### 7.1 CONTENT_EN_IMPERATIVE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_IMPERATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

영어 명령문은 **동사원형으로 문장을 바로 시작**해서 지시나 명령을 나타냅니다. 주어(you)는 생략됩니다.

**문장 구조**: [동사원형] + [목적어]

예를 들어 close(닫다)로 문장을 시작하면 **Close the door.**(문을 닫아라.)가 됩니다.

### 7.2 CONTENT_EN_IMPERATIVE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_IMPERATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **Close the door.**
> 문을 닫아라.

단어별: Close(닫다, 동사원형) the door(문을)

**"이미 배운 문법만 사용" 검증**: 명령문 구조 외의 문법 표지 없음. PLEASE는 언급하지 않았다.

### 7.3 CONTENT_EN_IMPERATIVE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_IMPERATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"Open the window."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"창문을 열어라."**

### 7.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 명령문 구조 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — close, open 모두 규칙 동사이며 원형이라 활용 자체가 없음 |
| **PLEASE 미도입 확인** | 통과 — 어디에도 언급 없음 |

**PLEASE 연결 기반 구조 확인(사용자 요청)**: 이 노드의 구조 `[동사원형]+[목적어]`는 수식어를 앞뒤에 붙이기만 하면 되는 단순한 뼈대다. 영어에서 please는 명령문 맨 앞("Please close the door.")이나 맨 뒤("Close the door, please.")에 그대로 덧붙는 방식으로 결합되므로, 이 노드가 다루는 순수 명령문 구조를 바꿀 필요 없이 PLEASE 차례에서 그대로 이어받을 수 있다.

### 7.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.5: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다. PLEASE와도 스키마상 형식적 관계가 없음을 확인했다(7번 노드의 Related는 COULD_REQUEST·TAG_QUESTION뿐).
- 발견된 이슈: 없음.

---

## 8. GRAMMAR_EN_PLEASE (please — 정중 표지)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_POLITENESS` · Difficulty 1 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_EN_COULD_REQUEST, GRAMMAR_EN_TAG_QUESTION**(위상정렬 7번, 둘 다 미학습 — 각 노드 차례로 이연, 이 노드에서는 언급·비교하지 않음)

### 8.1 CONTENT_EN_PLEASE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_PLEASE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**please**는 문장 앞이나 뒤에 붙여 공손함을 더하는 표지입니다. 이미 배운 명령문 구조를 그대로 두고 please만 추가하면 됩니다.

**문장 구조**: Please + [동사원형] + [목적어] (또는 문장 끝에 `, please`)

예를 들어 Close the door(문을 닫아라) 앞에 please를 붙이면 **Please close the door.**(문을 닫아 주세요.)가 되어 훨씬 공손해집니다.

### 8.2 CONTENT_EN_PLEASE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_PLEASE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **Please close the door.**
> 문을 닫아 주세요.

단어별: Please(공손 표지) close(닫다, 동사원형) the door(문을)

**대조**(6번 노드 콘텐츠 재참조): `CONTENT_EN_IMPERATIVE_EXAMPLE_1` — *Close the door.*(문을 닫아라.)와 완전히 같고 please만 추가됐다.

**"이미 배운 문법만 사용" 검증**: please와 (재인용한) 명령문 구조(6번, 이미 학습) 외의 문법 표지 없음. COULD_REQUEST·TAG_QUESTION은 언급하지 않았다.

### 8.3 CONTENT_EN_PLEASE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_PLEASE", "GRAMMAR_EN_IMPERATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 1 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["Open the window.", "Please open the window."]` |

**본문(Generation Practice, 최소 차이 비교)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 창문을 열어라. *(명령)*
> 2) 창문을 열어 주세요. *(공손 — please 추가)*

**설계 메모**: 1번은 6번 노드의 QUIZ 문장(`Open the window.`)을 그대로 재사용했다. DANG/DA류의 최소 차이 비교이며, 이번엔 표지 교체가 아니라 **표지 추가**(있음/없음)라는 점이 다르다.

### 8.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — IMPERATIVE(6) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(1) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — close, open 모두 규칙 동사 |
| **COULD_REQUEST/TAG_QUESTION 미도입 확인** | 통과 — 어디에도 언급·비교 없음 |

**두 Related 관계의 향후 연결 기반 확인(사용자 요청)**: please는 "문장 경계에 붙이기만 하면 되는" 최소 구조라 두 노드와 성격이 다르게 이어진다 — **COULD_REQUEST**와는 구조적으로 결합 가능하다("Could you close the door, please?"처럼 한 문장 안에 공존). **TAG_QUESTION**과는 같은 문장에 자연스럽게 공존하기보다 "정중한 요청·확인"이라는 화용적 범주를 공유하는 **주제적** 연결에 가깝다. 이 차이는 각 노드 차례에서 반영해야 할 지점으로 기록해둔다.

### 8.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.10: `Related: GRAMMAR_EN_COULD_REQUEST, GRAMMAR_EN_TAG_QUESTION` 둘 다 확인했으나 미학습으로 각 노드 차례로 이연(사용자 지시와 일치).
- 발견된 이슈: 없음.

---

## 9. GRAMMAR_EN_BE_VING (be + V-ing — 진행상)

**노드 정보**: Concept `CONCEPT_ASPECT_PROGRESSIVE` · Difficulty 2 · Prerequisite/Related/Alternative `—`, **Contrast: GRAMMAR_EN_PAST_SIMPLE**(위상정렬 8번, PAST_SIMPLE은 2번으로 이미 학습 — 이번에 연결). EN에서 처음 적용하는 DANG/DA류 최소 차이 비교 사례다.

### 9.1 CONTENT_EN_BE_VING_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**be + V-ing**는 지금 진행 중인 동작을 나타낼 때 씁니다. 이미 배운 과거형(-ed)이 "끝난 일"을 말했다면, 이건 "지금 하고 있는 일"을 말합니다.

**문장 구조**: [주어] + am/is/are + [동사]-ing + [목적어]

주어가 I면 am, he/she/it이면 is, you/we/they면 are를 씁니다.

예를 들어 work(일하다) 앞뒤로 am...-ing를 두르면 **I am working**(나는 일하고 있다)이 됩니다.

### 9.2 CONTENT_EN_BE_VING_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I am working now.**
> 나는 지금 일하고 있다.

단어별: I(나는) am(be동사, 1인칭) working(일하고 있다, work+ing) now(지금)

**대조**(2번 노드 콘텐츠 재참조): `CONTENT_EN_PAST_SIMPLE_EXAMPLE_1` — *I worked yesterday.*(나는 어제 일했다.)와 주어(I)·동사(work)가 완전히 같고 시제 표지와 시간부사만 바뀌었다. VI의 DANG/DA(목적어까지 완전히 동일)와 달리, 영어는 시제가 바뀌면 시간부사(yesterday→now)도 함께 바뀌어야 자연스럽다 — 그래도 **주어+동사 쌍은 그대로 유지**해 최소 차이 비교의 축으로 삼았다.

**"이미 배운 문법만 사용" 검증**: be+V-ing와 (대조를 위해 재인용한) -ed(2번, 이미 학습) 외의 문법 표지 없음.

### 9.3 CONTENT_EN_BE_VING_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VING", "GRAMMAR_EN_PAST_SIMPLE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["I played yesterday.", "I am playing now."]` |

**본문(Generation Practice, Contrast 활용형)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 나는 어제 놀았다. *(과거)*
> 2) 나는 지금 놀고 있다. *(진행)*

**설계 메모**: 1번은 2번 노드의 QUIZ 문장(`I played yesterday.`)을 그대로 재사용했다. VI의 DANG/DA 패턴을 EN에 그대로 적용한 첫 사례다.

### 9.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — PAST_SIMPLE(2) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — work, play 모두 규칙 동사, -ing 형태도 자음 중복 없이 규칙적(working, playing) |

**PAST_SIMPLE과의 Contrast 구조적 명확성 확인(사용자 요청)**: 주어(I)와 동사(work/play)를 고정하고 시제 표지(-ed ↔ am...-ing)만 바꿨다는 점에서 구조적으로 명확한 최소 차이 비교다. 다만 VI의 DANG/DA와 정확히 같은 방식(목적어까지 100% 동일)은 아니다 — 영어는 시제가 바뀌면 시간부사(yesterday/now)가 함께 바뀌어야 의미가 자연스러우므로, "완전히 동일한 문장에서 표지만 교체"가 아니라 **"주어+동사는 고정, 시제 표지+시간부사가 함께 바뀌는"** 형태로 재정의했다. 이 조정은 VI 패턴을 포기한 것이 아니라 언어별 문법 요구에 맞게 적용한 것이다.

### 9.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.2: `Contrast: GRAMMAR_EN_PAST_SIMPLE`를 EXPLANATION·EXAMPLE·QUIZ 전부에 반영했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_PAST_SIMPLE_CONTRAST_BE_VING`(BIDIRECTIONAL, weight 0.5) 확인.
- 발견된 이슈: 없음.

---

## 10. GRAMMAR_EN_DO_SUPPORT_Q (Do-지원 의문문)

**노드 정보**: Concept `CONCEPT_MOOD_INTERROGATIVE` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_EN_SUBJECT_AUX_INVERSION**(위상정렬 9번, 10번 미학습 — 이연). 21번 `TAG_QUESTION`의 선행 노드이기도 하지만 그 의무는 TAG_QUESTION 쪽에서 충족한다. 이 노드는 **일반동사 Yes/No 의문문(do-support)**에만 집중한다.

### 10.1 CONTENT_EN_DO_SUPPORT_Q_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_DO_SUPPORT_Q"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

일반동사로 예/아니오 의문문을 만들 때는 문장 맨 앞에 **Do/Does/Did**를 놓고, 원래 동사는 원형으로 바꿉니다.

**문장 구조**: Do/Does/Did + [주어] + [동사원형] + [목적어]?

예를 들어 "You work."(당신은 일한다)를 의문문으로 바꾸려면 Do를 앞에 놓아 **Do you work?**(당신은 일합니까?)라고 합니다.

### 10.2 CONTENT_EN_DO_SUPPORT_Q_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_DO_SUPPORT_Q"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **Do you cook?**
> 당신은 요리합니까?

단어별: Do(의문 시작) you(당신은) cook(요리하다, 동사원형)

**"이미 배운 문법만 사용" 검증**: Do-지원 구조 외의 문법 표지 없음. SUBJECT_AUX_INVERSION·WH_FRONTING은 언급하지 않았다.

### 10.3 CONTENT_EN_DO_SUPPORT_Q_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_DO_SUPPORT_Q"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"Does he work?"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"그는 일합니까?"**

**설계 메모**: 3인칭 단수 he를 써서 Do가 아니라 Does로 바뀌는 것까지 함께 연습시켰다(4번 `NOT`의 doesn't 학습 때와 같은 인칭 변화 패턴).

### 10.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — Do/Does 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook, work 모두 규칙 동사 |
| **SUBJECT_AUX_INVERSION/WH_FRONTING 미도입 확인** | 통과 — 어디에도 언급 없음 |

**향후 Related 관계 기반 충분성 확인(사용자 요청)**: 이 노드가 가르치는 "[조동사]+주어+동사...?" 패턴은 두 미래 노드의 공통 뼈대다.
- **SUBJECT_AUX_INVERSION**(`Can/Will/Is/Have + S + V...?`)은 Do 대신 이미 있는 조동사/모달을 그대로 앞으로 보내는, 같은 원리의 다른 경우다 — Do는 "동사에 조동사가 없을 때 빌려오는 임시 조동사"라는 점만 나중에 설명하면 된다.
- **WH_FRONTING**(`Wh-word + (do-support) + S + V?`)은 이 노드의 구조 앞에 의문사만 얹으면 되는 형태다("Do you cook?" → "What do you cook?").

두 경우 모두 이 노드의 구조를 변형할 필요 없이 그대로 확장 가능하다 — 기반은 충분하다고 판단한다.

### 10.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_EN_SUBJECT_AUX_INVERSION`을 확인했으나 미학습으로 이연. `TAG_QUESTION`의 Prerequisite 의무도 해당 노드 차례로 확인.
- 발견된 이슈: 없음.

---

## 11. GRAMMAR_EN_SUBJECT_AUX_INVERSION (기존 조동사 도치 의문문)

**노드 정보**: Concept `CONCEPT_MOOD_INTERROGATIVE`(DO_SUPPORT_Q와 동일 Concept) · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_EN_DO_SUPPORT_Q**(위상정렬 10번, 9번으로 이미 학습 — 이번에 연결). WH_FRONTING과도 Related가 있지만(11번, 미학습) 이연한다.

### 11.1 CONTENT_EN_SUBJECT_AUX_INVERSION_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_SUBJECT_AUX_INVERSION"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

can처럼 이미 조동사가 있는 문장은 do를 빌려올 필요 없이, 그 조동사를 그대로 문장 맨 앞으로 보내 의문문을 만듭니다. 이미 배운 do-support(Do/Does/Did)는 조동사가 **없을 때만** 빌려오는 임시 수단이고, 이 노드는 조동사가 **이미 있을 때** 그것을 그대로 앞으로 옮기는 경우입니다.

**문장 구조**: [조동사] + [주어] + [동사원형] + [목적어]?

예를 들어 "I can buy this."(나는 이것을 살 수 있다)를 의문문으로 바꾸려면 can을 주어 앞으로 옮겨 **Can I buy this?**(이거 살 수 있어요?)라고 합니다 — do를 추가로 쓰지 않습니다.

### 11.2 CONTENT_EN_SUBJECT_AUX_INVERSION_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_SUBJECT_AUX_INVERSION", "GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **Can I buy this?**
> 이거 살 수 있어요?

단어별: Can(조동사, 3번에서 학습) I(나는) buy(사다, 동사원형) this(이것)

이 문장은 `EN_LANGUAGE_PACK.md` §6 시나리오3("Can I buy this?")을 그대로 실현한다.

**"이미 배운 문법만 사용" 검증**: 도치 구조(대상)와 can(3번, 이미 학습) 외의 문법 표지 없음. WH_FRONTING은 언급하지 않았다.

**규칙 동사 제약에 대한 판단 메모**: buy는 과거형이 불규칙(bought)이지만, 여기서는 조동사 뒤 동사원형으로만 쓰여 애초에 활용이 일어나지 않는다 — will/can 뒤에 동사원형을 쓸 때와 동일한 논리(2·3번 노드에서 이미 확립)로, "규칙 동사만 사용"이라는 제약은 **활용형이 실제로 나타나는 경우**에 적용되는 것이지 조동사+원형 조합 자체를 막지 않는다.

### 11.3 CONTENT_EN_SUBJECT_AUX_INVERSION_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_SUBJECT_AUX_INVERSION", "GRAMMAR_EN_DO_SUPPORT_Q"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["Do you cook?", "Can you cook?"]` |

**본문(Generation Practice, Related 활용형 — do-support vs 조동사 도치)**:

> 다음 두 질문을 각각 영어로 써보세요.
> 1) 당신은 요리합니까? *(조동사 없음 — do 필요)*
> 2) 당신은 요리할 수 있습니까? *(조동사 can 있음 — do 불필요)*

**설계 메모**: 1번은 9번 노드의 예문(`Do you cook?`)을 그대로 재사용했다. 같은 동사(cook)에 조동사 유무만 다르게 해, "언제 do가 필요하고 언제 필요 없는지"라는 이 Related 관계의 핵심 판단 기준을 직접 연습시켰다.

### 11.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — CAN(3)·DO_SUPPORT_Q(9) 재사용 확인, WH_FRONTING 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사 제약 판단** | buy는 원형으로만 쓰여 활용이 없으므로 제약 취지에 어긋나지 않음(12.2 메모 참고), cook은 규칙 동사 |
| **WH_FRONTING 미도입 확인** | 통과 |

### 11.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_EN_DO_SUPPORT_Q`를 EXPLANATION·QUIZ에 반영했다. WH_FRONTING과의 Related는 11번 차례로 이연.
- `EN_LANGUAGE_PACK.md` §5: `REL_DO_SUPPORT_Q_RELATED_SUBJECT_AUX_INVERSION`(BIDIRECTIONAL, weight 0.5) 확인.
- `EN_LANGUAGE_PACK.md` §6 시나리오3: 완전한 형태로 실현했다.
- 발견된 이슈: 없음.

---

## 12. GRAMMAR_EN_WH_FRONTING (Wh-의문문 어순)

**노드 정보**: Concept `CONCEPT_MOOD_WHQUESTION` · Difficulty 2 · Prerequisite/Contrast/Alternative `—`, **Related: GRAMMAR_EN_DO_SUPPORT_Q, GRAMMAR_EN_SUBJECT_AUX_INVERSION**(위상정렬 11번, 둘 다 9·10번으로 이미 학습 — 이번에 모두 연결)

### 12.1 CONTENT_EN_WH_FRONTING_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_WH_FRONTING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

의문사(what, where, who 등)로 질문할 때는 이미 배운 두 구조 중 하나 **앞에 의문사만 붙이면** 됩니다.

**문장 구조**: [의문사] + Do/Does/Did/[조동사] + [주어] + [동사원형]...?

- 일반동사라면 do-support 구조 앞에: Do you cook? → **What do you cook?**
- 이미 조동사가 있다면 도치 구조 앞에: Can you cook? → **What can you cook?**

### 12.2 CONTENT_EN_WH_FRONTING_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_WH_FRONTING", "GRAMMAR_EN_BE_VING"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **What are you doing now?**
> 너 지금 뭐 하고 있어?

단어별: What(의문사) are(be동사, 8번에서 학습) you(당신은) doing(하고 있다, do+ing) now(지금)

이 문장은 `EN_LANGUAGE_PACK.md` §6 시나리오2("What are you doing now?")를 그대로 실현한다 — WH_FRONTING이 이미 학습한 BE_VING(도치 구조의 대상, be가 조동사 역할)과 결합했다.

**"이미 배운 문법만 사용" 검증**: 의문사 전치(대상)와 BE_VING(8번, 이미 학습) 외의 문법 표지 없음. doing은 do의 -ing형인데, do는 과거형(did)만 불규칙이고 -ing형(doing)은 규칙적으로 형성되어 활용형 노출 제약과 충돌하지 않는다(10번 노드에서 확립한 "원형·규칙 활용형만 문제없다"는 원칙의 연장).

### 12.3 CONTENT_EN_WH_FRONTING_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_WH_FRONTING", "GRAMMAR_EN_DO_SUPPORT_Q", "GRAMMAR_EN_SUBJECT_AUX_INVERSION"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["What do you cook?", "What can you cook?"]` |

**본문(Generation Practice, 두 Related 동시 활용형)**:

> 다음 두 질문을 각각 영어로 써보세요.
> 1) 당신은 무엇을 요리합니까? *(일반동사 — do 필요)*
> 2) 당신은 무엇을 요리할 수 있습니까? *(조동사 can 있음)*

**설계 메모**: 같은 의문사(what)·같은 동사(cook)를 두 하위 구조(do-support/조동사 도치) 각각에 얹어, WH_FRONTING이 둘 중 어느 쪽에도 동일하게 적용되는 "상위 규칙"임을 직접 보여준다.

### 12.4 세 노드의 계층 구조 검증(사용자 요청 — 역할이 겹치지 않는지)

| 노드 | 역할 | 관계 |
|---|---|---|
| DO_SUPPORT_Q | Yes/No 의문문, 조동사가 **없을 때** do를 빌려옴 | WH_FRONTING이 그 위에 얹히는 하위 구조 중 하나 |
| SUBJECT_AUX_INVERSION | Yes/No 의문문, 조동사가 **있을 때** 그대로 도치 | WH_FRONTING이 그 위에 얹히는 또 다른 하위 구조 |
| WH_FRONTING | Wh-의문문, 위 두 구조 중 해당하는 것 **앞에 의문사만 추가** | 경쟁 관계가 아니라 두 구조를 감싸는 상위 규칙 |

세 노드는 "언제 do를 쓰는가"(DO_SUPPORT_Q) / "조동사가 있으면 어떻게 하는가"(SUBJECT_AUX_INVERSION) / "의문사가 있으면 무엇을 더하는가"(WH_FRONTING)로 **역할이 정확히 분리**되어 있고, 서로 겹치지 않으면서 계층적으로(WH_FRONTING이 최상위) 연결된다.

### 12.5 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — BE_VING(8)·DO_SUPPORT_Q(9)·SUBJECT_AUX_INVERSION(10) 전부 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 실제 회화체(시나리오2 그대로) |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — doing은 -ing형이 규칙적으로 형성됨(과거형만 불규칙), cook은 규칙 동사 |

### 12.6 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.5: `Related: GRAMMAR_EN_DO_SUPPORT_Q, GRAMMAR_EN_SUBJECT_AUX_INVERSION` 둘 다 EXPLANATION·QUIZ에 반영했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_WH_FRONTING_RELATED_DO_SUPPORT_Q`(weight 0.4)·`REL_WH_FRONTING_RELATED_SUBJECT_AUX_INVERSION`(weight 0.4) 둘 다 BIDIRECTIONAL 확인.
- `EN_LANGUAGE_PACK.md` §6 시나리오2: 완전한 형태로 실현했다.
- 발견된 이슈: 없음.

---

## 13. GRAMMAR_EN_HAVE_TO (have to — 의무·필요)

**노드 정보**: Concept `CONCEPT_MODALITY_NECESSITY` · Difficulty 2 · Prerequisite/Alternative `—`, **Related: GRAMMAR_EN_CAN, Contrast: GRAMMAR_EN_CAN**(위상정렬 12번, CAN은 3번으로 이미 학습 — 이번에 동시 연결). VI의 PHAI/CO_THE(Related+Contrast 동시)와 같은 조합이지만, EN에서는 여기에 **조동사 vs 준조동사**라는 구조적 차이까지 더해지는 첫 사례다.

### 13.1 CONTENT_EN_HAVE_TO_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_TO"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**have to**는 "~해야 한다"라는 의무·필요성을 나타냅니다. 이미 배운 **can**과 같은 조동적 기능(동사 앞에서 문법적 의미를 더함)을 하지만, 구조가 다릅니다 — can은 주어가 무엇이든 형태가 바뀌지 않는 순수 조동사인 반면, **have to는 have 자체가 주어에 따라 변합니다**: 3인칭 단수(he/she/it)면 **has to**가 됩니다.

**문장 구조**: [주어] + have to/has to + [동사원형] + [목적어]

의미도 대조적입니다 — can은 "할 수 있는 능력"을, have to는 "해야 하는 의무"를 말합니다.

예를 들어 cook(요리하다) 앞에 놓으면 **I have to cook**(나는 요리해야 한다), 3인칭 단수는 **She has to cook**(그녀는 요리해야 한다)이 됩니다.

### 13.2 CONTENT_EN_HAVE_TO_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_TO"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I have to cook.**
> 나는 요리해야 한다.

단어별: I(나는) have to(의무, 준조동사) cook(요리하다, 동사원형)

**"이미 배운 문법만 사용" 검증**: have to 외의 문법 표지 없음. 1인칭 현재형만 사용해 시제 확장 없이 단순하게 유지했다.

### 13.3 CONTENT_EN_HAVE_TO_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_TO", "GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["I can cook.", "I have to cook."]` |

**본문(Generation Practice, Related+Contrast 동시 활용형)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 나는 요리할 수 있다. *(능력 — can)*
> 2) 나는 요리해야 한다. *(의무 — have to)*

**설계 메모**: 동사(cook)를 동일하게 고정하고 표지만 can↔have to로 바꾼 최소 차이 비교다. 둘 다 1인칭 현재형으로 유지해 활용 차이(can 불변 vs have to 가변)가 QUIZ 채점에 끼어들지 않게 했다 — VI의 CO_THE/PHAI와 동일한 설계 원칙(같은 동사·목적어, 표지만 교체)을 EN의 조동사/준조동사 차이에 맞게 적용했다.

### 13.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — CAN(3) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook은 규칙 동사 |
| **조동사/준조동사 구조 차이 반영** | EXPLANATION에서 have to/has to 대비로 명시. QUIZ는 활용 복잡도를 배제하고 1인칭 현재형만 사용(5번 `WANT_TO` 때와 동일한 원칙) |
| **현재형 중심 유지** | 통과 — had to(과거) 미사용 |

### 13.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.3: `Related: GRAMMAR_EN_CAN`(공통 조동적 기능)·`Contrast: GRAMMAR_EN_CAN`(능력 vs 의무 의미 대비)를 QUIZ 하나로 동시 충족했다. VI의 PHAI/CO_THE와 같은 패턴이다.
- `EN_LANGUAGE_PACK.md` §5: `REL_CAN_CONTRAST_HAVE_TO`(weight 0.4)·`REL_HAVE_TO_RELATED_CAN`(weight 0.3) 둘 다 BIDIRECTIONAL 확인.
- 발견된 이슈: 없음.

---

## 14. GRAMMAR_EN_NOT_YET (not...yet — 아직 ~아님)

**노드 정보**: Concept `CONCEPT_NEGATION_NOTYET` · Difficulty 2 · Related/Alternative `—`, **Prerequisite: GRAMMAR_EN_NOT, Contrast: GRAMMAR_EN_NOT**(위상정렬 13번, NOT은 4번으로 이미 학습). VI의 CHUA/KHONG과 동일한 조합(Prerequisite+Contrast 동시)이며 처리 방식도 그대로 재사용한다 — **Prerequisite는 EXPLANATION의 서술 구조로, Contrast는 최소 차이 비교로** 역할을 분리한다.

**haven't...yet 배제 확인**: 이 노드는 `not...yet`(do-support 기반) 형태만 다룬다. `haven't...yet`(완료상 기반)은 18번 `HAVE_VPP` 학습 이후로 이연한다 — 4번 노드에서 이미 예고한 대로다.

### 14.1 CONTENT_EN_NOT_YET_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT_YET"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**not...yet**은 "아직 ~하지 않았다"라는 뜻으로, 이미 배운 **not**(do-support 부정)을 바탕으로 이해할 수 있습니다.

not이 그냥 부정하는 것이라면, not...yet은 "지금까지는 아니지만 앞으로 그럴 수도 있다"는 여지를 남깁니다.

**문장 구조**: [주어] + don't/doesn't + [동사원형] + [목적어] + yet

이미 배운 **don't cook**(요리하지 않는다) 끝에 yet을 붙이면 **don't cook yet**(아직 요리하지 않는다)이 됩니다.

### 14.2 CONTENT_EN_NOT_YET_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT_YET"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I don't cook yet.**
> 나는 아직 요리하지 않는다.

단어별: I(나는) don't(부정, do+not) cook(요리하다, 동사원형) yet(아직)

**대조**(4번 노드 콘텐츠 재참조): `CONTENT_EN_NOT_EXAMPLE_1` — *I don't cook.*(나는 요리하지 않는다.)와 완전히 같고 yet만 추가됐다.

**"이미 배운 문법만 사용" 검증**: not...yet과 (재인용한) not(4번, 이미 학습) 외의 문법 표지 없음. have/has+과거분사 구조는 어디에도 없다.

### 14.3 CONTENT_EN_NOT_YET_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_NOT_YET", "GRAMMAR_EN_NOT"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["I don't cook.", "I don't cook yet."]` |

**본문(Generation Practice, Contrast 활용형)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 나는 요리하지 않는다. *(단순 부정)*
> 2) 나는 아직 요리하지 않는다. *("아직"의 여지가 있는 부정)*

**설계 메모**: VI의 CHUA/KHONG과 동일한 최소 차이 비교 패턴(같은 동사·목적어, yet만 추가)이다. Prerequisite(이해의 기반) 역할은 15.1 EXPLANATION이 이미 담당했다.

### 14.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — NOT(4) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook은 규칙 동사, 원형이라 활용 자체가 없음 |
| **완료상과의 경계 명확성(사용자 요청)** | 확인 — EXPLANATION·EXAMPLE·QUIZ 어디에도 have/has, 과거분사, `HAVE_VPP` 언급 없음. `not...yet`은 순수하게 do-support(4번)의 확장일 뿐 완료상 문법을 전혀 요구하지 않는 구조임을 재확인 |

### 14.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.4: `Prerequisite: GRAMMAR_EN_NOT`(EXPLANATION 서술 구조)·`Contrast: GRAMMAR_EN_NOT`(EXAMPLE·QUIZ 최소 차이 비교)를 역할 분리로 충족했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_NOT_YET_PREREQ_NOT`(UNIDIRECTIONAL, weight 0.8)·`REL_NOT_CONTRAST_NOT_YET`(BIDIRECTIONAL, weight 0.5) 확인 — 위상정렬 순서(NOT 4번 → NOT_YET 13번)가 Prerequisite 방향과 일치.
- 발견된 이슈: 없음.

---

## 15. GRAMMAR_EN_COMPARATIVE (비교급 — -er/more)

**노드 정보**: Concept `CONCEPT_COMPARISON_COMPARATIVE` · Difficulty 2 · Related/Contrast/Alternative `—`(위상정렬 14번, 단독 작성). 15번 `SUPERLATIVE`의 선행 노드이지만 그 의무는 SUPERLATIVE 쪽에서 충족한다.

### 15.1 CONTENT_EN_COMPARATIVE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_COMPARATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

비교급은 두 대상을 비교해 "더 ~하다"는 뜻을 나타낼 때 씁니다. **짧은 형용사**는 뒤에 **-er**을 붙이고, **긴 형용사**는 앞에 **more**를 붙입니다.

**문장 구조**: [A] + is + [형용사]-er/more [형용사] + than + [B]

예를 들어 tall(키가 큰, 짧은 형용사)은 뒤에 -er을 붙여 **taller**(더 크다)가 되고, interesting(흥미로운, 긴 형용사)은 앞에 more를 붙여 **more interesting**(더 흥미롭다)이 됩니다.

**참고**: 이 노드는 규칙형만 다룬다. good→better 같은 불규칙 비교급은 Vocabulary 영역의 몫이다(아직 공식 구조 미정, §0 참고).

### 15.2 CONTENT_EN_COMPARATIVE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_COMPARATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **My house is taller than your house.**
> 내 집이 네 집보다 크다.

단어별: My house(내 집은) is(be동사) taller(더 큰, tall+er) than(~보다) your house(네 집보다)

**"이미 배운 문법만 사용" 검증**: -er 비교급 외의 문법 표지 없음. SUPERLATIVE는 언급하지 않았다.

### 15.3 CONTENT_EN_COMPARATIVE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_COMPARATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"My book is more interesting than your book."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"내 책이 네 책보다 흥미롭다."**

**설계 메모**: EXAMPLE(-er, 짧은 형용사)과 다른 패턴(more, 긴 형용사)을 QUIZ에서 다뤄 두 비교급 형태 모두를 검증한다.

### 15.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — 비교급 표지 외 신규 문법 없음 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙형만 사용(사용자 요청)** | 통과 — taller, more interesting 모두 규칙형, good→better 등 불규칙 비교급 없음 |
| **SUPERLATIVE 미도입 확인** | 통과 — 어디에도 언급 없음 |

**SUPERLATIVE 연결 기반 구조 확인(사용자 요청)**: SUPERLATIVE는 -est/most를 쓰는 동일한 짧은/긴 형용사 구분 구조를 그대로 물려받는다(`EN_LANGUAGE_PACK.md` §4.7). 이 노드에서 쓴 tall/interesting을 SUPERLATIVE 차례에 그대로 재사용하면 -er→-est, more→most로 표지만 바꾸는 자연스러운 확장이 가능하다 — 별도 구조 변경이 필요 없다.

### 15.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.7: 형식적 관계가 없음을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음.

---

## 16. GRAMMAR_EN_SUPERLATIVE (최상급 — -est/most)

**노드 정보**: Concept `CONCEPT_COMPARISON_SUPERLATIVE` · Difficulty 2 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_EN_COMPARATIVE**(위상정렬 15번, COMPARATIVE는 14번으로 이미 학습 — 이번에 연결)

### 16.1 CONTENT_EN_SUPERLATIVE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_SUPERLATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

최상급은 여러 대상 중에서 하나가 으뜸이라고 말할 때 씁니다. 이미 배운 **비교급**을 이해했다면 최상급은 자연스럽게 이어집니다 — 비교급이 둘을 비교했다면(-er/more), 최상급은 **-est/most**를 씁니다.

**문장 구조**: [주어] + is + the + [형용사]-est/most [형용사]

비교급 때 썼던 **tall**(짧은 형용사)을 그대로 가져오면, -er 대신 -est를 붙여 **the tallest**(가장 크다)가 됩니다 — 비교급과 붙는 자리는 같고 표지만 다릅니다.

### 16.2 CONTENT_EN_SUPERLATIVE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_SUPERLATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **My house is the tallest.**
> 내 집이 가장 크다.

단어별: My house(내 집은) is(be동사) the tallest(가장 큰, the+tall+est)

COMPARATIVE의 예문(`CONTENT_EN_COMPARATIVE_EXAMPLE_1`)과 같은 소재(my house, tall)를 그대로 이어받았다.

**"이미 배운 문법만 사용" 검증**: -est 최상급 외의 문법 표지 없음.

### 16.3 CONTENT_EN_SUPERLATIVE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_SUPERLATIVE", "GRAMMAR_EN_COMPARATIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["My house is taller than your house.", "My house is the tallest."]` |

**본문(Generation Practice, Prerequisite 활용형)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 내 집이 네 집보다 크다. *(비교 — 이미 배운 -er)*
> 2) 내 집이 가장 크다. *(최상급 — 새로 배운 -est)*

**설계 메모**: 1번은 14번 노드의 예문을 그대로 재사용했다. VI의 HON/NHAT과 동일한 방식으로, 형식적 Contrast 관계는 없지만 같은 소재로 비교급→최상급 순서를 QUIZ에서 체감시켰다.

### 16.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — COMPARATIVE(14) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙형만 사용(사용자 요청)** | 통과 — tallest는 규칙형, good→best 등 불규칙 최상급 없음 |

### 16.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.7: `Prerequisite: GRAMMAR_EN_COMPARATIVE`를 EXPLANATION의 서술 구조("비교급을 이해했다면 자연스럽게 이어진다")로 반영했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_SUPERLATIVE_PREREQ_COMPARATIVE`(UNIDIRECTIONAL, weight 0.8) 확인.
- 발견된 이슈: 없음.

---

## 17. GRAMMAR_EN_COULD_REQUEST (could — 공손한 요청)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_REQUEST` · Difficulty 2 · Related(Contrast/Alternative `—`), **Prerequisite: GRAMMAR_EN_CAN, Related: GRAMMAR_EN_PLEASE**(위상정렬 16번, 둘 다 3·7번으로 이미 학습 — 이번에 동시 연결). 7번 노드에서 예고한 구조적 결합("Could you..., please?")을 실현하는 첫 사례다.

### 17.1 CONTENT_EN_COULD_REQUEST_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_COULD_REQUEST"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**could**는 can의 공손한 변형으로, 상대방에게 무언가를 정중하게 부탁할 때 씁니다. 이미 배운 can을 알고 있다면 자연스럽게 이해할 수 있습니다 — could는 can과 같은 조동사 자리에 오지만, 능력을 묻는 게 아니라 **공손하게 요청하는** 기능을 합니다.

**문장 구조**: Could you + [동사원형] + [목적어]?

이미 배운 **please**를 뒤에 붙이면 더욱 공손해집니다: Could you + [동사원형] + ..., please?

### 17.2 CONTENT_EN_COULD_REQUEST_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_COULD_REQUEST", "GRAMMAR_EN_PLEASE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **Could you close the door, please?**
> 문 좀 닫아 주시겠어요?

단어별: Could you(공손 요청) close(닫다, 동사원형) the door(문을) please(공손 표지, 8번에서 학습)

이 문장은 6·8번 노드에서 이어온 "close the door" 소재에 could...please 구조를 얹어 완성했다 — 7번에서 확인해둔 PLEASE와의 구조적 결합("Could you...,please?")을 그대로 실현했다.

**"이미 배운 문법만 사용" 검증**: could 요청(대상)과 please(8번, 이미 학습) 외의 문법 표지 없음.

### 17.3 CONTENT_EN_COULD_REQUEST_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_COULD_REQUEST", "GRAMMAR_EN_CAN"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `["Can you cook?", "Could you cook, please?"]` |

**본문(Generation Practice, Prerequisite 활용형 — 기능 구분)**:

> 다음 두 문장을 각각 영어로 써보세요.
> 1) 당신은 요리할 수 있습니까? *(능력을 묻는 질문 — can)*
> 2) 요리해 주시겠어요? *(공손한 요청 — could you)*

**설계 메모**: 같은 동사(cook)에 can(능력 질문)과 could...please(공손한 요청)를 나란히 배치해, "능력을 묻는 것"과 "행동을 정중히 요청하는 것"이라는 기능 차이를 직접 구분하게 했다.

### 17.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — CAN(3)·PLEASE(8) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — close, cook 모두 규칙 동사 |
| **CAN vs COULD_REQUEST 기능 구분(사용자 요청)** | QUIZ에서 능력 질문(can)과 공손한 요청(could...please)을 명확히 대비 |

### 17.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.10: `Prerequisite: GRAMMAR_EN_CAN`을 EXPLANATION 서술 구조로, `Related: GRAMMAR_EN_PLEASE`를 EXAMPLE의 구조적 결합으로 각각 반영했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_COULD_REQUEST_PREREQ_CAN`(UNIDIRECTIONAL, weight 0.6)·`REL_PLEASE_RELATED_COULD_REQUEST`(BIDIRECTIONAL, weight 0.4) 확인.
- 발견된 이슈: 없음.

---

## 18. GRAMMAR_EN_PARTITIVE (부분 표현 — a piece of, a cup of, some)

**노드 정보**: Concept `CONCEPT_QUANTITY_PARTITIVE` · Difficulty 2 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 17번, 단독 작성)

### 18.1 CONTENT_EN_PARTITIVE_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_PARTITIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

영어에는 셀 수 없는 명사(water, bread, coffee 등)가 있습니다. 이런 명사를 세려면 **a piece of, a cup of** 같은 수량 표현을 씁니다. 정확한 개수가 필요 없을 때는 **some**을 씁니다.

**문장 구조**: [수량 표현] + of + [셀 수 없는 명사]

예를 들어 coffee(커피)는 셀 수 없는 명사인데, 컵 단위로 세려면 **a cup of coffee**(커피 한 잔)라고 합니다.

### 18.2 CONTENT_EN_PARTITIVE_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_PARTITIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I have a cup of coffee.**
> 나는 커피 한 잔이 있다.

단어별: I(나는) have(가지다, 일반 동사) a cup of(한 잔의) coffee(커피)

**"이미 배운 문법만 사용" 검증**: a cup of(대상) 외의 문법 표지 없음. **여기 쓰인 have는 "가지다"라는 일반 동사이며, 12번 `HAVE_TO`(have+to, 의무)나 18번 `HAVE_VPP`(have+과거분사, 완료상, 아직 미학습)와는 다른 용법이다** — 뒤에 to도 과거분사도 오지 않고 명사구(a cup of coffee)가 바로 이어져 혼동 소지가 없다(EN에서 처음 확인하는 have의 동형이의 사례).

### 18.3 CONTENT_EN_PARTITIVE_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_PARTITIVE"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 2 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"I have a piece of bread."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"나는 빵 한 조각이 있다."**

### 18.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — a cup of/a piece of 외 신규 문법 없음. **have의 세 용법(일반 동사/HAVE_TO/HAVE_VPP) 구분을 명시적으로 검증**(이번 노드의 핵심 검증 포인트) |
| §3.3 난이도 태깅 | 노드 difficulty(2) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — have는 원형 그대로 쓰여 활용 자체가 없음 |

**향후 확장 기반 구조 확인(사용자 요청)**: `[수량 표현]+of+[명사]`는 문장의 동사·시제·서법과 무관하게 **목적어 자리에 그대로 끼워 넣을 수 있는 명사구 단위**다. 앞으로 어떤 문법(수량 표현 확장, 명사구 수식 등)이 추가되더라도 이 노드의 구조 자체를 바꿀 필요가 없다 — 술어부와 독립적인 순수 명사구 패턴이기 때문이다.

### 18.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.6: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음(have 동형이의 재확인이 이번 노드의 주요 검증 성과).

---

## 19. GRAMMAR_EN_HAVE_VPP (완료상 — have + 과거분사)

**노드 정보**: Concept `CONCEPT_ASPECT_PERFECT` · Difficulty 3 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 18번, 단독 작성). have의 **세 번째이자 마지막 용법**을 도입하는 노드다 — 일반 동사(17번에서 확인)·HAVE_TO(12번)에 이어 완료상 조동사 용법을 완성한다. 13번 `NOT_YET`과는 아직 연결하지 않는다(`haven't...yet` 금지).

### 19.1 CONTENT_EN_HAVE_VPP_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**have + 과거분사**는 완료상을 나타냅니다 — 과거에 일어난 일이 현재와 연결되어 있다는 뜻입니다. 이미 배운 have(가지다)나 have to(의무)와는 완전히 다른 기능입니다 — 여기서 have는 뒤에 오는 과거분사와 함께 **조동사**로 쓰입니다.

**문장 구조**: [주어] + have/has + [동사]-ed + [목적어]

규칙 동사는 과거분사도 -ed형입니다(과거형과 같은 모양). 예를 들어 cook(요리하다)의 과거분사는 cooked인데, have 뒤에 놓으면 **I have cooked**(나는 요리했다)가 됩니다.

**세 가지 have 구분**: 뒤에 오는 것이 다릅니다.
- have + 명사 → I **have a cup of coffee**.(가지다, 17번)
- have + to + 동사원형 → I **have to cook**.(해야 한다, 12번)
- have + 과거분사 → I **have cooked**.(완료상, 이번 노드)

### 19.2 CONTENT_EN_HAVE_VPP_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **I have cooked.**
> 나는 요리했다.

단어별: I(나는) have(완료 조동사) cooked(요리했다, cook+ed 과거분사)

**"이미 배운 문법만 사용" 검증**: have+과거분사 외의 문법 표지 없음. NOT_YET·yet은 언급하지 않았다.

### 19.3 CONTENT_EN_HAVE_VPP_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_HAVE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"She has cooked."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"그녀는 요리했다." (완료상)**

**설계 메모**: 3인칭 단수 she를 써서 have가 아니라 has로 바뀌는 것까지 함께 연습시켰다.

### 19.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — have+과거분사 외 신규 문법 없음, NOT_YET 미언급 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 과거분사만 사용(사용자 요청)** | 통과 — cooked는 규칙 과거분사(-ed), go→gone 같은 불규칙 과거분사는 사용하지 않음(Vocabulary 영역) |
| **NOT_YET 미연결 확인** | 통과 — haven't...yet 형태 어디에도 없음 |

**세 가지 have 용법 최종 구분(사용자 요청)**: 20.1에 세 용법을 나란히 정리해뒀다 — have+명사(17번, 이미 확립)/have+to+동사원형(12번, 이미 확립)/have+과거분사(이번 노드, 신규)가 **뒤따르는 요소의 품사·형태**로 명확히 구분된다. 세 노드 전체를 통틀어 이 구분이 유지됐는지 재확인했다.

### 19.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.2: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- `EN_LANGUAGE_PACK.md` §5 설계 노트: Auxiliary+Pattern SLUG 규칙(레마만 ID에, 활용형은 surface_forms에)과 일치하게 have/has를 모두 다뤘다.
- 발견된 이슈: 없음.

---

## 20. GRAMMAR_EN_IF_WILL (조건문 — If + 현재형, S+will+V)

**노드 정보**: Concept `CONCEPT_CONDITIONAL_SIMPLE` · Difficulty 3 · Related/Contrast/Alternative `—`, **Prerequisite: GRAMMAR_EN_WILL**(§4.8 표 기준, §5 카탈로그 누락은 §0에서 이미 기록 — 위상정렬 19번, WILL은 2번으로 이미 학습)

### 20.1 CONTENT_EN_IF_WILL_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_IF_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

if...조건문은 "만약 ~하면, ~할 것이다"라는 뜻을 나타냅니다. if절은 단순 현재형을 쓰고, 결과절은 이미 배운 **will 구조를 그대로** 씁니다.

**문장 구조**: If + [주어] + [동사](현재형), [주어] + will + [동사원형]

예를 들어 If I have time(내가 시간이 있으면) 뒤에 결과절 **I will work**(나는 일할 것이다)를 이으면 **If I have time, I will work.**가 됩니다.

### 20.2 CONTENT_EN_IF_WILL_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_IF_WILL", "GRAMMAR_EN_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **If I have time, I will work.**
> 내가 시간이 있으면, 나는 일할 것이다.

단어별: If(만약) I(나는) have(있다) time(시간), I(나는) will(미래 조동사, 2번에서 학습) work(일하다, 동사원형)

**WILL 구조 재사용 확인**: 결과절 "I will work"는 2번 노드의 `CONTENT_EN_WILL_EXAMPLE_1`("I will work tomorrow.")에서 시간부사(tomorrow)만 뺀 것과 동일하다 — if절이 이미 미래 시점을 함의하므로 tomorrow가 필요 없어졌을 뿐, will 구조 자체는 전혀 변형 없이 그대로 재사용됐다.

**"이미 배운 문법만 사용" 검증**: if-현재형 구조와 will(2번, 이미 학습) 외의 문법 표지 없음. BE_VING·HAVE_VPP는 섞지 않았다. have는 17번에서 검증한 일반 동사("있다") 용법이다.

### 20.3 CONTENT_EN_IF_WILL_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_IF_WILL"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"If you cook, I will play."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"네가 요리하면, 나는 놀 것이다."**

### 20.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — will(2) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — have, work, cook, play 모두 규칙 동사·원형 용법 |
| **BE_VING/HAVE_VPP 미혼용 확인** | 통과 — 진행상·완료상 표지 어디에도 없음 |

**WILL 뼈대의 실제 재사용 확인(사용자 요청)**: 2번 노드에서 "IF_WILL의 결과절과 정확히 동일한 형태"라고 예고했던 것이 실제로 그대로 실현됐다 — `[주어]+will+동사원형`이라는 구조 자체는 한 글자도 바뀌지 않았고, 문맥상 불필요해진 시간부사(tomorrow)만 자연스럽게 빠졌다. 이는 §0에서 확정한 IF_WILL-WILL Prerequisite(카탈로그 누락, 표 기준 채택)이 실제 콘텐츠 설계에서도 정확히 작동했음을 보여준다.

### 20.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.8: `Prerequisite: GRAMMAR_EN_WILL`을 EXPLANATION·EXAMPLE에 반영했다(§0에서 기록한 카탈로그 누락 건의 실제 적용 사례).
- 발견된 이슈: 없음.

---

## 21. GRAMMAR_EN_BE_VPP (수동태 — be + 과거분사)

**노드 정보**: Concept `CONCEPT_VOICE_PASSIVE` · Difficulty 3 · Prerequisite/Related/Contrast/Alternative 전부 `—`(위상정렬 20번, 단독 작성)

### 21.1 CONTENT_EN_BE_VPP_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

**be + 과거분사**는 수동태를 나타냅니다 — 주어가 동작을 하는 게 아니라 그 동작을 받는 대상이 됩니다.

**문장 구조**: [주어] + am/is/are + [동사]-ed(과거분사)

예를 들어 close(닫다)의 과거분사는 closed인데, is 뒤에 놓으면 **The door is closed.**(문이 닫힌다)가 됩니다 — 문이 닫는 게 아니라 닫히는 대상입니다.

### 21.2 CONTENT_EN_BE_VPP_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **The door is closed.**
> 문이 닫힌다.

단어별: The door(문은) is(be동사) closed(닫힌, close+ed 과거분사)

6·8·16번 노드에서 이어온 "door/close" 소재를 재사용했다.

**"이미 배운 문법만 사용" 검증**: be+과거분사 외의 문법 표지 없음.

### 21.3 CONTENT_EN_BE_VPP_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_BE_VPP"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"The window is opened."` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"창문이 열린다."**

### 21.4 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 과거분사만 사용(EN 전용 제약)** | 통과 — closed, opened 모두 규칙 과거분사 |

### 21.5 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.9: 모든 관계가 `—`임을 재확인, 단독 작성이 맞다.
- 발견된 이슈: 없음.

---

## 22. GRAMMAR_EN_TAG_QUESTION (부가의문문 — 마지막 노드)

**노드 정보**: Concept `CONCEPT_PRAGMATICS_CONFIRMATION` · Difficulty 3 · Related(Contrast/Alternative `—`), **Prerequisite: GRAMMAR_EN_DO_SUPPORT_Q, Related: GRAMMAR_EN_PLEASE**(위상정렬 21번, 마지막 노드 — 둘 다 9·7번으로 이미 학습). DO_SUPPORT_Q는 **구조적** 연결, PLEASE는 **화용적** 연결로 명확히 구분한다(7번에서 이미 예고한 구분).

### 22.1 CONTENT_EN_TAG_QUESTION_EXPL_KO_BEGINNER

| 필드 | 값 |
|---|---|
| `content_type` | EXPLANATION |
| `explanation_level` | BEGINNER |
| `grammar_node_ids` | `["GRAMMAR_EN_TAG_QUESTION"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

부가의문문은 평서문 뒤에 "그렇지?"라는 확인을 덧붙이는 구조입니다. 이미 배운 **do-support 의문문**(9번)의 조동사를 그대로 가져와 문장 끝에 붙이되, 극성을 반대로 뒤집습니다 — 평서문이 긍정이면 부가의문은 부정으로 답니다.

**문장 구조**: [평서문(긍정)], + don't/doesn't + [주어]?

예를 들어 You cook(당신은 요리한다)에 부가의문을 붙이면 **You cook, don't you?**(요리하시죠, 그렇지 않나요?)가 됩니다 — don't you는 9번에서 배운 do-support 구조를 그대로 재사용한 것입니다(**구조적 연결**).

### 22.2 CONTENT_EN_TAG_QUESTION_EXAMPLE_1

| 필드 | 값 |
|---|---|
| `content_type` | EXAMPLE |
| `grammar_node_ids` | `["GRAMMAR_EN_TAG_QUESTION", "GRAMMAR_EN_DO_SUPPORT_Q"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |

**본문**:

> **You close the door, don't you?**
> 문 닫으시죠, 그렇지 않나요?

단어별: You(당신은) close(닫다) the door(문을), don't(부정 do-support, 9번 구조 재사용) you(당신은)

6·8·16·20번 노드에서 이어온 "door/close" 소재를 재사용했다.

**"이미 배운 문법만 사용" 검증**: 부가의문 구조와 do-support(9번, 이미 학습) 외의 문법 표지 없음.

### 22.3 CONTENT_EN_TAG_QUESTION_QUIZ_1

| 필드 | 값 |
|---|---|
| `content_type` | QUIZ |
| `grammar_node_ids` | `["GRAMMAR_EN_TAG_QUESTION"]` |
| `source` | HUMAN_AUTHORED |
| `human_reviewed` | true(§0 주의 참고) |
| `is_canonical` | true |
| `is_active` | true |
| `difficulty` | 3 |
| `meta_language` | KO |
| `version` | 1 |
| `author` | LLE 콘텐츠팀 |
| `type_specific_metadata.answer_key` | `"You cook, don't you?"` |

**본문(Generation Practice 형식)**:

> 다음 한국어 문장을 영어로 써보세요.
> **"당신은 요리하죠, 그렇지 않나요?"**

### 22.4 PLEASE와의 화용적 연결(Related, 구조적 결합 아님)

7번 노드에서 예고한 대로, PLEASE와 TAG_QUESTION은 **같은 문장 안에 구조적으로 결합하지 않는다** — COULD_REQUEST 때(같은 문장에 "..., please?"로 자연스럽게 공존)와 다른 성격이다. 대신 두 노드는 **"정중한 확인·요청"이라는 화용적 범주**를 공유한다: PLEASE는 요청에 공손함을 더하고, TAG_QUESTION은 진술에 상대방의 확인·동의를 구한다 — 둘 다 대화 상대를 배려하는 화행이라는 공통점으로 주제적으로 연결된다. 이 문서는 이 관계를 별도의 결합 문장으로 만들지 않고 개념적 설명으로만 반영한다.

### 22.5 자체 검증(`CONTENT_PRODUCTION_STANDARD.md` 기준)

| 항목 | 결과 |
|---|---|
| §3.1 최소 요구량 | 충족 |
| §3.2 이미 배운 문법만 사용 | 통과 — DO_SUPPORT_Q(9) 재사용 확인 |
| §3.3 난이도 태깅 | 노드 difficulty(3) 상속 |
| §3.4 meta_language | KO 일관 |
| §3.5 톤/스타일 | 유지 |
| §3.6 저작 구분 | HUMAN_AUTHORED |
| **규칙 동사만 사용(EN 전용 제약)** | 통과 — cook, close 모두 규칙 동사 |
| **구조적 연결(DO_SUPPORT_Q) vs 화용적 연결(PLEASE) 구분(사용자 요청)** | 명확히 분리 — DO_SUPPORT_Q는 EXPLANATION·EXAMPLE의 실제 문장 구조로, PLEASE는 22.4의 개념 설명으로만 반영, 서로 혼동되지 않음 |

### 22.6 상위 문서 정합성 확인

- `EN_LANGUAGE_PACK.md` §4.10: `Prerequisite: GRAMMAR_EN_DO_SUPPORT_Q`(구조적)·`Related: GRAMMAR_EN_PLEASE`(화용적)를 성격에 맞게 각각 다른 방식으로 반영했다.
- `EN_LANGUAGE_PACK.md` §5: `REL_TAG_QUESTION_PREREQ_DO_SUPPORT_Q`(UNIDIRECTIONAL, weight 0.6)·`REL_PLEASE_RELATED_TAG_QUESTION`(BIDIRECTIONAL, weight 0.4) 확인.
- 발견된 이슈: 없음.
- **21개 노드 전체 완료.**

---

## 23. 종합 검증 — EN_CONTENT.md v1.0 완료 선언

21개 노드 전체 작성 완료에 따라, VI와 동일한 6개 항목을 종합 검증한다.

### 23.1 번호 연속성

전체 재확인 결과 `0 → 1 → 2 → ... → 22 → 23`(이 절) → `24`(개정 이력)까지 연속됨을 확인했다. 작성 도중 수차례 번호 누락이 발생했으나 그때마다 즉시 정정했다.

### 23.2 위상정렬 순서

5개 PREREQUISITE 제약을 전부 검증했다(4개는 §5 카탈로그, 1개는 §4.8 표 기준 — §0에서 이미 기록한 카탈로그 누락 건).

| 제약 | 요구 노드 | 선행 노드 | 순서 |
|---|---|---|---|
| REL_NOT_YET_PREREQ_NOT | NOT_YET(13) | NOT(4) | ✅ |
| REL_COULD_REQUEST_PREREQ_CAN | COULD_REQUEST(16) | CAN(3) | ✅ |
| REL_SUPERLATIVE_PREREQ_COMPARATIVE | SUPERLATIVE(15) | COMPARATIVE(14) | ✅ |
| REL_TAG_QUESTION_PREREQ_DO_SUPPORT_Q | TAG_QUESTION(21) | DO_SUPPORT_Q(9) | ✅ |
| (카탈로그 누락, §4.8 표 기준) IF_WILL-WILL | IF_WILL(19) | WILL(2) | ✅ |

VI와 달리 EN은 §1 계획과 실제 실행 순서가 끝까지 일치했다(재정렬 없음).

### 23.3 PREREQUISITE/RELATED/CONTRAST/ALTERNATIVE 반영 여부

`EN_LANGUAGE_PACK.md` §5의 14개 관계 + §4.8 표 기준 1개(카탈로그 누락분) = **15개 전부 콘텐츠에 반영됨을 확인했다.**

| 유형 | 개수 | 반영 위치(노드) |
|---|---|---|
| PREREQUISITE | 5 | NOT_YET, COULD_REQUEST, SUPERLATIVE, TAG_QUESTION, IF_WILL |
| CONTRAST | 3 | BE_VING(↔PAST_SIMPLE), NOT_YET(↔NOT), HAVE_TO(↔CAN) |
| RELATED | 7 | WH_FRONTING(↔DO_SUPPORT_Q, ↔SUBJECT_AUX_INVERSION), SUBJECT_AUX_INVERSION(↔DO_SUPPORT_Q), WANT_TO(↔CAN), HAVE_TO(↔CAN), COULD_REQUEST(↔PLEASE), TAG_QUESTION(↔PLEASE) |
| ALTERNATIVE | 0 | 없음 — EN은 CAN이 이중 기능을 갖지 않아 Alternative 관계 자체가 존재하지 않음(VI의 CO_THE/DUOC_ABILITY와 대비되는 설계) |
| **합계** | **15** | 14(카탈로그) + 1(표 기준 보완) |

관계 성격에 따라 처리 방식을 구분했다 — Contrast는 최소 차이 비교(VI 패턴 재사용), Related는 소재 연속·의미 대비·구조적 결합·화용적 연결 등 관계의 실제 성격에 맞게 세분화, Prerequisite는 EXPLANATION 서술 구조 또는 구조 직접 재사용으로 처리했다.

### 23.4 "이미 배운 문법만 사용" 원칙

21개 노드 전체에서 위반 없이 유지됐다. EN 고유의 동형이의 검증 3건을 실제로 수행했다.

| 노드 | 감지한 위험 | 처리 |
|---|---|---|
| SUBJECT_AUX_INVERSION(10) | buy(불규칙 동사)를 조동사 뒤 원형으로 사용 | 활용이 없는 원형이라 안전함을 판단 근거와 함께 확정(사용자 승인) |
| WH_FRONTING(11) | do→doing(-ing형)이 do의 불규칙 과거형(did)과 무관한지 | -ing 형성은 규칙적임을 확인 |
| PARTITIVE(17)·HAVE_VPP(18) | have의 세 용법(일반동사/HAVE_TO/HAVE_TO/HAVE_VPP) 혼동 가능성 | 뒤따르는 요소(명사/to+동사원형/과거분사)로 구조적 구분, 최종 비교표로 정리 |

### 23.5 회피 사례 및 동형이의 검증(투명하게 기록)

VI와 달리 EN은 "회피 후 동일 문서 내에서 완전 해소"된 사례보다는, **판단을 통해 즉시 확정**하거나 **범위 밖으로 남긴** 사례가 중심이었다.

| 사례 | 상태 | 비고 |
|---|---|---|
| WILL(2)의 시나리오4 | go 대신 work로 대체, **미해소** | 초기(2번 노드 작성 시점)의 보수적 판단 — 이후 10번 노드에서 "모달+원형은 활용이 없어 안전하다"는 원칙이 명시적으로 확정됐으므로, 지금 기준으로는 go도 안전했을 것이다. 실제 시나리오4 원문("I'll go later")과 완전히 일치하는 콘텐츠는 이 문서에 없다 |
| NOT_YET(13)의 haven't...yet | **범위 밖으로 영구 보류** | VI의 cái(나중에 CL_CAI로 완전 해소)와 다른 패턴 — 이 문서의 21개 노드 안에는 NOT_YET을 HAVE_VPP 학습 후 다시 다루는 노드가 없어, `haven't...yet` 표층형은 끝까지 Canonical 콘텐츠를 얻지 못했다 |
| SUBJECT_AUX_INVERSION(10)의 buy | **판단 후 확정** | 불규칙 동사raw 원형 사용이 규칙 동사 제약과 충돌하지 않음을 확정하고 이후 원칙으로 채택 |

두 번째 항목(`haven't...yet`)은 이번 검증에서 새로 발견한 **Structural Gap**이다 — JA의 RARERU 공백(Content Gap, 같은 노드에 예문 하나만 추가하면 해결)과는 등급이 다르다. NOT_YET은 13번에서 이미 "턴"이 끝난 노드이고, `haven't...yet`이 필요로 하는 `HAVE_VPP`는 18번에야 등장한다 — "이미 배운 문법만 사용" 원칙상 13번 시점에는 애초에 쓸 수 없었고, 지금 다시 채우려 해도 **NOT_YET을 HAVE_VPP 이후 재방문하는 노드 자체가 이 문서 구조에 없어 현재 구조만으로는 해결이 불가능하다.** 오류는 아니지만, `EN_LANGUAGE_PACK.md`가 정의한 NOT_YET의 표층형 범위를 100% 커버하지 못했다는 뜻이다.

| 구분 | 사례 | 해소 조건 |
|---|---|---|
| **Structural Gap**(이번) | EN `NOT_YET`의 `haven't...yet` | 현재 노드 구조만으로는 해결 불가 — 없음(범위 밖으로 영구 보류) |
| **Content Gap**(JA 참고) | JA `RARERU`의 五段活用 예문 | 현재 문서 내부에서 해결 가능 — `EXAMPLE_2` 추가만으로 완료 |

향후 Tier D 개정 시(예: NOT_YET을 다루는 보충 노드 신설, 또는 Content Lifecycle의 버전 갱신으로 소급 추가) `CONTENT_EN_NOT_YET_EXAMPLE_2`(haven't...yet 버전) 추가를 권고 사항으로 남긴다.

### 23.6 문서 전체 정합성

- **Content ID**: `EN_LANGUAGE_PACK.md`에 미리 선언된 EXPLANATION·EXAMPLE Content ID(TBD)를 전부 채웠고, QUIZ ID는 VI와 동일하게 `{NODE}_QUIZ_1` 패턴으로 일관되게 확장했다.
- **Canonical 상태**: 21개 노드 × 3종 = 63개 Content 전부 `source=HUMAN_AUTHORED`, `is_canonical=true`, `is_active=true`.
- **규칙 동사/규칙 활용형 제약**(EN 전용): 전 구간에서 유지 — 불규칙 과거형·과거분사·비교급·최상급 전부 배제, 예외는 "모달+원형"(활용 자체가 없는 경우)만 명시적 판단 근거와 함께 허용.
- **Learning Outcome Scenario**(4개): 1번(PAST_SIMPLE)·2번(WH_FRONTING+BE_VING)·3번(SUBJECT_AUX_INVERSION+CAN)은 원문 그대로 실현. **4번(WILL)은 동사를 go→work로 대체해 부분 실현**(§23.5 기록).
- **"door/close" 소재 스레드**: 6(IMPERATIVE)→8(PLEASE)→16(COULD_REQUEST)→21(BE_VPP)→22(TAG_QUESTION) 5개 노드에 걸쳐 재사용되며 문서 전체의 연속성을 높였다.

### 23.7 종합 결론

6개 항목 중 5개는 특이사항 없이 통과했고, 1개 항목(회피 사례 검증)에서 **경미한 콘텐츠 공백 1건**(NOT_YET의 haven't...yet 미해소)과 **완전 일치하지 않는 시나리오 실현 1건**(시나리오4)을 투명하게 기록했다 — 둘 다 오류가 아니라 범위·시점상의 한계이며, 향후 개정 권고 사항으로 남긴다.

**`EN_CONTENT.md` v1.0 완료를 선언한다** — `EN_LANGUAGE_PACK.md`의 21개 Grammar Node 전체에 대해 EXPLANATION·EXAMPLE·QUIZ 3종씩(총 63개 Content)을 Canonical 상태로 갖춘 영어 Tier D 콘텐츠 1차 완성본이다.

---

## 24. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-08 | 최초 작성 — 위상정렬 작업 순서(21개) 확정, `EN_LANGUAGE_PACK.md` §4.8/§5 간 IF_WILL-WILL Prerequisite 누락을 발견해 노드 표 기준으로 반영. 1번 노드 `GRAMMAR_EN_PAST_SIMPLE`의 EXPLANATION·EXAMPLE·QUIZ 3종 Canonical 콘텐츠 작성, 규칙 동사만 사용하는 EN 전용 제약 준수 확인 |
| 1.1 | 2026-07-08 | 2번 노드 `GRAMMAR_EN_WILL` 콘텐츠 3종 추가 — 단독 작성, 조건문 언급 없이 순수 미래 표현만 다룸. 구조(`[주어]+will+동사원형`)가 19번 `IF_WILL`의 결과절과 정확히 동일함을 확인해 향후 재사용 기반으로 명시 |
| 1.2 | 2026-07-08 | 3번 노드 `GRAMMAR_EN_CAN` 콘텐츠 3종 추가 — 단독 작성, WANT_TO(5번)·HAVE_TO(12번) 전부 이연. can't가 CAN 자신의 surface_forms임을 확인해 NOT 노드 없이도 사용 가능함을 검증. WANT_TO/HAVE_TO가 CAN과 달리 인칭·시제에 따라 활용하는 준조동사라는 구조적 차이를 미리 확인해 향후 최소 차이 비교 설계에 반영하기로 함 |
| 1.3 | 2026-07-08 | 4번 노드 `GRAMMAR_EN_NOT` 콘텐츠 3종 추가 — 단독 작성, NOT_YET 미도입. NOT_YET의 두 surface_form(not...yet / haven't...yet) 중 전자만 이 노드 구조의 단순 확장으로 13번 시점에 가능하고, 후자는 18번 HAVE_VPP가 필요함을 미리 확인. 섹션 번호 누락(§5) 즉시 정정 |
| 1.4 | 2026-07-08 | 5번 노드 `GRAMMAR_EN_WANT_TO` 콘텐츠 3종 추가 — CAN과의 `Related`를 의미 대조 QUIZ로 연결. 조동사(CAN, 불변)와 준조동사(WANT_TO, 활용)의 구조적 차이를 EXPLANATION에서 명시하되 QUIZ는 1인칭 현재형으로 단순화해 활용 복잡도를 배제. HAVE_TO 미도입, 과거형(wanted to) 미사용 확인 |
| 1.5 | 2026-07-08 | 6번 노드 `GRAMMAR_EN_IMPERATIVE` 콘텐츠 3종 추가 — 단독 작성, PLEASE 미도입. 구조(`[동사원형]+[목적어]`)가 please를 앞뒤에 그대로 붙이기만 하면 되는 뼈대임을 확인해 7번 차례의 기반으로 명시. 섹션 번호 누락(§7) 즉시 정정 |
| 1.6 | 2026-07-08 | 7번 노드 `GRAMMAR_EN_PLEASE` 콘텐츠 3종 추가 — IMPERATIVE 구조를 그대로 재사용해 "표지 추가"(있음/없음) 방식의 최소 차이 비교로 설계. COULD_REQUEST(구조적 결합 가능)·TAG_QUESTION(주제적 연결)의 성격 차이를 미리 확인해 각 노드 차례의 반영 지점으로 기록. 섹션 번호 누락(§9) 즉시 정정 |
| 1.7 | 2026-07-08 | 8번 노드 `GRAMMAR_EN_BE_VING` 콘텐츠 3종 추가 — PAST_SIMPLE과의 `Contrast`를 EN 최초의 DANG/DA류 최소 차이 비교로 연결. VI와 달리 시제 전환 시 시간부사(yesterday→now)도 함께 바뀌어야 함을 확인해 "주어+동사 고정, 시제 표지+시간부사 동반 교체" 방식으로 패턴을 언어별로 적절히 조정. 섹션 번호 누락(§10) 즉시 정정 |
| 1.8 | 2026-07-08 | 9번 노드 `GRAMMAR_EN_DO_SUPPORT_Q` 콘텐츠 3종 추가 — 단독 작성, SUBJECT_AUX_INVERSION·WH_FRONTING 미도입. "[조동사]+주어+동사...?" 패턴이 두 미래 노드(Do 대신 기존 조동사를 쓰는 SUBJECT_AUX_INVERSION, 이 구조 앞에 의문사만 얹는 WH_FRONTING) 모두의 충분한 기반임을 명시적으로 확인. 섹션 번호 누락(§11) 즉시 정정 |
| 1.9 | 2026-07-08 | 10번 노드 `GRAMMAR_EN_SUBJECT_AUX_INVERSION` 콘텐츠 3종 추가 — DO_SUPPORT_Q와의 `Related`를 "do 필요/불필요" 최소 차이 비교(9번 예문 재사용)로 연결. CAN과 결합해 시나리오3("Can I buy this?") 완성. buy(불규칙 동사)를 원형으로만 사용해 규칙 동사 제약 취지(활용형 회피)에 어긋나지 않음을 판단 근거와 함께 명시. 섹션 번호 누락(§12) 즉시 정정 |
| 1.10 | 2026-07-08 | 11번 노드 `GRAMMAR_EN_WH_FRONTING` 콘텐츠 3종 추가 — DO_SUPPORT_Q·SUBJECT_AUX_INVERSION 두 Related를 모두 연결(QUIZ에서 동일 의문사·동사로 두 하위 구조에 얹는 방식). BE_VING와 결합해 시나리오2 완성. 세 노드(DO_SUPPORT_Q/SUBJECT_AUX_INVERSION/WH_FRONTING)의 역할이 겹치지 않고 계층적(WH_FRONTING이 최상위)으로 연결됨을 표로 명시적 검증. 섹션 번호 누락(§13) 즉시 정정 |
| 1.11 | 2026-07-08 | 12번 노드 `GRAMMAR_EN_HAVE_TO` 콘텐츠 3종 추가 — CAN과의 `Related`(공통 조동적 기능)·`Contrast`(능력 vs 의무)를 QUIZ 하나로 동시 충족(VI PHAI/CO_THE와 동일 패턴). 조동사(CAN, 불변)와 준조동사(HAVE_TO, have/has 활용)의 구조적 차이를 EXPLANATION에 명시하되 QUIZ는 1인칭 현재형으로 단순화. 섹션 번호 누락(§14) 즉시 정정 |
| 1.12 | 2026-07-08 | 13번 노드 `GRAMMAR_EN_NOT_YET` 콘텐츠 3종 추가 — NOT과의 `Prerequisite`(EXPLANATION 서술 구조)·`Contrast`(최소 차이 비교, 4번 예문 재사용)를 VI CHUA/KHONG과 동일한 방식으로 역할 분리. haven't...yet·완료상 언급 완전 배제를 명시적으로 검증. 섹션 번호 누락(§15) 즉시 정정 |
| 1.13 | 2026-07-08 | 14번 노드 `GRAMMAR_EN_COMPARATIVE` 콘텐츠 3종 추가 — 단독 작성, 규칙형(-er/more)만 사용해 불규칙 비교급(good→better) 배제. tall/interesting 두 형용사로 -er·more 패턴 모두 검증. SUPERLATIVE가 동일한 짧은/긴 형용사 구분 구조를 그대로 물려받을 수 있음을 확인. 섹션 번호 누락(§16) 즉시 정정 |
| 1.14 | 2026-07-08 | 15번 노드 `GRAMMAR_EN_SUPERLATIVE` 콘텐츠 3종 추가 — COMPARATIVE와의 `Prerequisite`를 EXPLANATION 서술 구조로 반영, my house/tall 소재를 그대로 이어받아 -er→-est 최소 차이 비교(14번 예문 재사용)로 QUIZ 구성. VI HON/NHAT과 동일한 처리 방식. 섹션 번호 누락(§17) 즉시 정정 |
| 1.15 | 2026-07-08 | 16번 노드 `GRAMMAR_EN_COULD_REQUEST` 콘텐츠 3종 추가 — CAN의 `Prerequisite`(EXPLANATION 서술 구조)와 PLEASE의 `Related`(EXAMPLE의 구조적 결합 "Could you..., please?")를 동시 반영. 6·8번에서 이어온 "close the door" 소재 재사용. QUIZ로 CAN(능력 질문)과 COULD_REQUEST(공손한 요청)의 기능 차이를 명확히 구분. 섹션 번호 누락(§18) 즉시 정정 |
| 1.16 | 2026-07-08 | 17번 노드 `GRAMMAR_EN_PARTITIVE` 콘텐츠 3종 추가 — 단독 작성. have의 세 용법(일반 동사 "가지다"/HAVE_TO/HAVE_VPP) 중 일반 동사 용법만 사용했음을 명시적으로 검증(EN 최초의 have 동형이의 확인). 구조가 술어부와 독립된 순수 명사구 패턴이라 향후 어떤 문법과도 결합 시 변경이 필요 없음을 확인. 섹션 번호 누락(§19) 즉시 정정 |
| 1.17 | 2026-07-08 | 18번 노드 `GRAMMAR_EN_HAVE_VPP` 콘텐츠 3종 추가 — 단독 작성, 규칙 과거분사(cooked)만 사용. have의 세 용법(일반 동사/HAVE_TO/HAVE_VPP)을 뒤따르는 요소(명사/to+동사원형/과거분사)로 명확히 구분하는 비교표를 EXPLANATION에 배치, 세 노드 전체에 걸친 구분 유지를 최종 확인. NOT_YET과의 연결(haven't...yet) 완전 배제. 섹션 번호 순서(§19/§20) 즉시 정정 |
| 1.18 | 2026-07-08 | 19번 노드 `GRAMMAR_EN_IF_WILL` 콘텐츠 3종 추가 — WILL과의 `Prerequisite`(§0에서 기록한 카탈로그 누락 건, 노드 표 기준으로 실제 적용)를 연결. 2번 노드에서 예고했던 결과절 구조가 시간부사만 자연스럽게 빠진 채 정확히 재사용됐음을 확인. BE_VING·HAVE_VPP와의 혼용 없음을 검증 |
| 1.19 | 2026-07-08 | 20번 노드 `GRAMMAR_EN_BE_VPP` 콘텐츠 3종 추가 — 단독 작성, "door/close" 소재 재사용. 21번(마지막) 노드 `GRAMMAR_EN_TAG_QUESTION` 콘텐츠 3종 추가 — DO_SUPPORT_Q의 `Prerequisite`(구조적, 실제 문장 결합)와 PLEASE의 `Related`(화용적, 개념 설명만)를 명확히 다른 방식으로 처리. §23 종합 검증 추가 — 번호 연속성·위상정렬·15개 관계 전체 반영(5 Prerequisite+3 Contrast+7 Related+0 Alternative)·이미 배운 문법만 사용 원칙(3건의 동형이의 검증)·회피 사례 투명 기록(haven't...yet 콘텐츠 공백 1건, 시나리오4 부분 실현 1건 포함)·문서 전체 정합성 6개 항목 검증 완료. **EN_CONTENT.md v1.0 완료 선언** |
