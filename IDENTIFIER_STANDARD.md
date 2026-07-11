# IDENTIFIER_STANDARD.md
## LLE Identifier Standard (Tier A — Core Standard)

> 이 문서는 LLE 전체에서 사용하는 모든 식별자(ID)의 **유일한 출처**다. Grammar Node, Concept, Content, Relation, Progress, Attempt Record, AI Generation 참조까지 — 모든 ID 규칙은 여기서 나온다. CONCEPT_SCHEMA.md, GRAMMAR_SCHEMA.md에 있던 ID 관련 서술은 이 문서로 통합되었으며, 해당 문서들은 이제 이 문서를 참조한다.

문서 계층(5-Tier):

| Tier | 문서 |
|---|---|
| 0 (철학) | PROJECT_VISION, LEARNING_THEORY |
| A (핵심 표준) | CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, **IDENTIFIER_STANDARD**(신규) |
| B (언어 팩) | VI/EN/JA/ZH_LANGUAGE_PACK |
| C (구현) | IMPLEMENTATION_BRIEF, API 계약, Engine Interface |
| D (콘텐츠) | 설명, 예문, 퀴즈, AI Prompt, 이미지, 음성 |

---

## 0. 문서의 지위

- **Tier A(Core Standard).** 모든 Language Pack(Tier B)과 구현(Tier C)은 이 문서의 규칙을 반드시 따른다.
- Implementation은 이 규칙을 변경하지 않고 그대로 사용한다. 규칙 자체를 바꿔야 하는 상황이 생기면 11장의 절차를 따른다.
- 이 문서는 "이름을 어떻게 지을까"가 아니라 **"수천 개의 Node와 여러 언어가 쌓여도 식별자 체계가 흔들리지 않으려면 무엇을 지켜야 하는가"**를 정의한다.

---

## 1. 목적

Language Pack이 하나(베트남어)일 때는 ID 규칙이 대충 정해져 있어도 큰 문제가 없다. 하지만 언어가 늘고 노드가 수백~수천 개가 되면, 사소해 보였던 명명 습관의 불일치가 전체 시스템의 유지보수 비용을 기하급수적으로 늘린다. 이 문서는 그 상황이 오기 **전에** 규칙을 고정해, 모든 Language Pack과 엔진이 같은 언어로 데이터를 참조하게 만드는 것이 목적이다.

---

## 2. ID Stability Principle (핵심 철학)

> **ID는 영구 식별자(Persistent Identifier)이며, 발행 후 변경하지 않는 것을 원칙으로 한다.**

이 원칙은 Grammar Node ID에 국한되지 않는다. 이 문서가 다루는 **모든 종류의 ID(Concept, Grammar Node, Content, Relation)에 동일하게 적용**된다.

- 어떤 대상(Node, Concept 등)의 **분류·관계·메타데이터는 시간이 지나며 변경·확장될 수 있다.** Concept이 재분류될 수도, 새 Category가 생길 수도, Relation이 추가·삭제될 수도 있다.
- 그러나 **ID 자체는 그런 분류 변경에 영향받지 않는다.** ID는 "이것이 무엇으로 분류되는가"를 표현하는 수단이 아니라, "이것이 다른 무엇도 아닌 바로 이것이다"를 나타내는 순수한 식별자다.
- Concept·Category·Function은 **조회와 분류를 위한 메타데이터**이며(`concept_ids` 필드 등을 통해 언제든 조회 가능), ID 문자열 안에 그 분류 정보를 새겨 넣지 않는다. 새겨 넣는 순간, 분류가 바뀔 때마다 "ID가 실제와 어긋난다"는 문제가 영구적으로 남는다.
- 따라서 **새 Category가 추가되거나 Concept가 재분류되더라도 기존 ID는 그대로 유지**한다. 잘못 발행된 ID는 이름을 바꾸는 대신 `deprecated` 처리하고 새 ID를 발행한다(CONCEPT_SCHEMA §2에서 이미 확립된 원칙을 전체 ID 체계로 확장).

---

## 3. Grammar Node ID

**형식**: `GRAMMAR_{LANGUAGE}_{SLUG}` (필요 시 `GRAMMAR_{LANGUAGE}_{SLUG}_{DISAMBIGUATOR}`)

| 규칙 | 설명 |
|---|---|
| `{LANGUAGE}` | ISO 639-1 두 글자 대문자(`VI`, `EN`, `JA`, `ZH`) |
| `{SLUG}` | **단어/형태소 기반.** 기능(Function)이 아니라 실제 언어 표현을 반영한다 |
| `{DISAMBIGUATOR}` | 동일 단어가 여러 기능을 가질 때만 추가하는 **사람이 읽기 위한 힌트**. 분류 필드가 아니다 |

**핵심 원칙(재확인)**: 그룹핑·분류 조회는 `concept_ids`로 이미 가능하므로, ID에 기능·카테고리 정보를 중복 기재하지 않는다. `{DISAMBIGUATOR}`는 오직 "같은 단어의 서로 다른 노드를 구분하기 위한 최소한의 힌트"일 뿐이며, 이후 그 노드의 Concept 분류가 바뀌어도 `{DISAMBIGUATOR}` 문자열은 그대로 둔다(예: `GRAMMAR_VI_DUOC_ABILITY`가 훗날 다른 Concept으로 재분류되어도 ID는 바뀌지 않는다 — 이것이 ID Stability Principle의 실제 적용이다).

**같은 단어, 다른 기능 → 반드시 다른 Node**: `được`이 "가능"과 "수동"이라는 서로 다른 기능을 가지므로 `GRAMMAR_VI_DUOC_ABILITY`, `GRAMMAR_VI_DUOC_PASSIVE`로 분리한 것(VI_LANGUAGE_PACK §4.3)이 정식 사례다. 반대로 같은 기능을 하나의 ID로 합치는 것도 금지한다.

**SLUG 생성 — 언어별 정규화 규칙**

| 언어 | 규칙 | 예시 |
|---|---|---|
| 베트남어(VI) | 성조·특수 발음 기호 제거, 로마자만 대문자화 | đã→`DA`, được→`DUOC`, đang→`DANG` |
| 일본어(JA) | 헤본식 로마자 표기, 장음 표시 생략 | です→`DESU`, ます→`MASU` |
| 중국어(ZH) | 병음 성조 제거, 대문자화. **단, 다음자(多音字)는 성조 제거 이전에 먼저 올바른 발음을 확정해야 한다** — 아래 참고 | 了(le, 완료상)→`LE`, 了(liǎo, "이해하다")→`LIAO`(별개 Lemma) |
| 영어(EN) | 단어 그대로 대문자화, 공백은 `_` | present progressive → 아래 참고 |

**다음자(多音字) 해소 — IDENTIFIER_STANDARD와 VOCABULARY_SCHEMA의 연결 지점(ZH_LANGUAGE_PACK에서 발견)**: 한자 기반 언어는 문자 하나가 문법 기능에 따라 다른 발음을 가질 수 있다(了 = 완료상일 때 "le", "이해하다"라는 동사일 때 "liǎo"). 이 경우 SLUG 생성은 3단계를 거친다.

1. **문법 기능 결정** — 어떤 Grammar Node를 만들 것인지 먼저 확정한다(예: 완료상 표지)
2. **올바른 발음(Lemma) 확정** — 그 기능에 대응하는 VOCABULARY_SCHEMA.md의 Vocabulary Entry를 조회해 어떤 발음인지 특정한다. 다음자는 문자가 아니라 **발음이 확정된 형태**를 Lemma 단위로 등재해야 한다(예: `VOCAB_ZH_LE`와 `VOCAB_ZH_LIAO`는 같은 한자를 공유하지만 서로 다른 Vocabulary Entry다)
3. **Identifier 생성** — 확정된 발음의 병음에서 성조를 제거해 SLUG를 만든다

이 순서(문법 기능 → 올바른 병음 결정 → Identifier 생성)를 지키지 않으면, 문자만 보고 SLUG를 만들다가 잘못된 발음(그래서 잘못된 문법 기능)의 ID를 발행하는 사고가 날 수 있다.

**Auxiliary + Pattern 구성 문법의 SLUG 규칙 (일반화: 표면 형태소 결합 순서 원칙)**

여러 형태소가 결합해 하나의 문법 기능을 이루는 경우, **SLUG는 실제 표면형에서 형태소가 결합되는 순서를 그대로 따른다.** 조동사가 먼저 오는지, 본동사 형태 패턴이 먼저 오는지는 언어가 정하며, Identifier는 그 순서를 그대로 반영할 뿐 특정 순서를 강제하지 않는다. (이전 버전은 "조동사 먼저"를 고정 규칙으로 뒀으나, 일본어처럼 본동사 패턴이 조동사보다 먼저 오는 언어에서 깨졌다 — 언어별 예외 규칙을 두는 대신 이 단일 원칙으로 일반화한다.)

*형태 범주 축약어*

| 축약어 | 의미 |
|---|---|
| `V` | 동사 원형 |
| `TO_V` | to부정사 |
| `VING` | 현재분사/동명사(-ing형) |
| `VPP` | 과거분사(Past Participle) |

이 목록은 영어 형태소 범주다. **언어마다 자신의 형태소 범주 축약어를 별도로 정의한다** — 예: 일본어는 `TE`(て형), `NAI`(ない형), `TAI`(たい형) 등. 전체 형식(형태소를 표면 순서대로 나열)은 모든 언어에 동일하게 적용되지만, 각 형태소 범주의 축약어 자체는 언어별 문법에 맞게 정의한다.

*규칙*

1. 각 형태소(조동사든 본동사 패턴이든)는 표면에 나타나는 순서 그대로 나열한다.
2. 고정 요소(조동사·조사 등)는 활용되는 원형(레마)을 대문자로 적는다 — 예: 영어 `be`(am/is/are로 활용)는 SLUG에서 `BE`. 실제 활용형은 SLUG가 아니라 `surface_forms` 필드가 담당한다(ID=기능, 필드=실현형 원칙의 연장).
3. 가변 요소(본동사 등)는 그 형태 범주 축약어로만 표시하고, 실제 어떤 동사가 쓰이는지는 SLUG에 포함하지 않는다 — 모든 동사에 적용 가능한 구조이기 때문이다.

*예시*
- 영어(조동사가 먼저 오는 어순): `BE_VING`(진행상), `HAVE_VPP`(완료상), `BE_VPP`(수동태), `HAVE_BEEN_VING`(완료진행상), `SHOULD_HAVE_VPP`(과거 사실에 대한 추측·후회)
- 일본어(본동사 패턴이 먼저 오는 어순): `TE_IRU`(진행상, て형+いる), `TE_KUDASAI`(정중한 명령, て형+ください) — 동일한 원칙이 반대 순서로 실현된 사례일 뿐, 별도 규칙이 아니다.

**언어 독립성**: 이 원칙은 형태소가 결합해 문법을 구성하는 어떤 언어에도 동일하게 적용된다. 언어마다 달라지는 것은 "형태소가 어떤 순서로 결합하는가"(그 언어의 실제 어순)와 "형태 범주 축약어 목록"(그 언어 고유의 활용형 체계)뿐이며, "SLUG는 표면 순서를 따른다"는 원칙 자체는 바뀌지 않는다.

**예외 — 단일 형태소 진성 조동사(True Modal)**: `can`, `will`, `must`, `should`, `may`처럼 그 자체로 닫힌 부류를 이루며 **항상** 원형 보어를 취하는 진성 조동사는 `{PATTERN}` 접미사를 생략한다(`GRAMMAR_EN_CAN`, `GRAMMAR_EN_WILL`). 원형 보어 결합이 이 부류 전체의 보편적 속성이라 매번 표기하는 것이 불필요한 반복이기 때문이다. 반면 `have to`, `want to`, `used to`, `ought to`, `be going to`처럼 실질적 어휘(have/want/use/ought/go)에서 문법화된 준조동사(semi-modal)는 여전히 `{PATTERN}`을 표기한다(`HAVE_TO_V`, `WANT_TO_V`) — 이들은 원형이 아니라 다른 보어(to부정사 등)를 취할 수도 있는 실질 어휘에서 왔으므로 패턴을 명시할 가치가 있다.

**Structure-only SLUG 규칙 (공식화, 3회 반복 확인 후 승격)**

특정 단어가 아니라 **통사적 메커니즘 자체**가 문법 기능인 경우가 있다 — 베트남어 `WH_INSITU`(의문사 제자리), 영어 `WH_FRONTING`(의문사 문두 이동), `DO_SUPPORT_Q`(do-지지 의문문). 세 언어팩에 걸쳐 반복된 패턴이므로 임시방편이 아니라 정식 규칙으로 정의한다.

**적용 조건**: 아래 둘 다를 만족할 때만 이 규칙을 쓴다.

1. 이 문법 기능을 표현하는 **고정된 단일 어휘가 없다**(어순 변화·삽입·도치 등 구조적 조작 자체가 문법이다).
2. `surface_forms` 필드에 **템플릿/패턴 표기**(예: `[Wh-word] + do + S + V?`)가 들어가지, 특정 단어가 들어가지 않는다.

**형식**: `{MECHANISM}`(SLUG 전체가 메커니즘을 설명하는 영문 축약어) — Auxiliary+Pattern 규칙의 `{AUX_CHAIN}_{PATTERN}`과 달리, 고정 어휘 요소가 아예 없으므로 조동사 레마를 나열할 자리가 없다.

| 규칙 | 설명 |
|---|---|
| 이동/어순 메커니즘 | 이동 여부와 방향을 명시: `WH_INSITU`(이동 없음), `WH_FRONTING`(전치) |
| 삽입 메커니즘 | 무엇이 삽입되는지 명시: `DO_SUPPORT_Q`(do-지지 의문문) |
| 도치 메커니즘 | 어떤 요소가 도치되는지 명시: 예) `SUBJECT_AUX_INVERSION`(주어-조동사 도치, PENDING-EN-1 해결 시 후보) |

**Auxiliary+Pattern과의 경계**: 조동사가 실제로 존재하고 그 조동사가 문장에 **남아있으면** Auxiliary+Pattern 규칙(`BE_VING` 등)을 쓴다. 조동사 없이 어순·삽입 자체가 문법이거나, 조동사가 있어도 그 조동사의 유무·형태가 아니라 **이동이라는 동작 자체**가 핵심 문법 정보이면 Structure-only 규칙을 쓴다.

---

## 4. Concept ID

**형식**: `CONCEPT_{CATEGORY}_{FUNCTION}` (CONCEPT_SCHEMA §2 원본 정의, 이 문서로 이관)

- `{CATEGORY}`, `{FUNCTION}` 모두 CONCEPT_SCHEMA §3~4에서 정의한 값만 사용
- 언어 독립적 — 어떤 Language Pack에도 속하지 않는다
- ID Stability Principle 적용: 발행 후 이름 변경 금지, 버전 번호 포함 금지

---

## 5. Content ID

**형식**: `CONTENT_{LANGUAGE}_{NODE_SLUG}_{TYPE_ABBR}_{DISAMBIGUATOR}`

**세부 정의는 CONTENT_SCHEMA.md(Tier A)가 다루는 `content_type`(교육적 기능) 10종을 기준으로 한다.** ID는 `content_type`만으로 구분하며, `media_assets`(전달 매체)나 `source`(생성 주체)는 ID에 반영하지 않는다 — 하나의 Content가 여러 매체를 동시에 가질 수 있고(CONTENT_SCHEMA §3), 생성 주체는 `source` 필드로 이미 구분되므로 ID에 중복 인코딩하지 않는다.

| `content_type` | `{TYPE_ABBR}` |
|---|---|
| `EXPLANATION` | `EXPL` |
| `EXAMPLE` | `EXAMPLE` |
| `QUIZ` | `QUIZ` |
| `MINIMAL_PAIR` | `MINPAIR` |
| `DIALOGUE` | `DIALOGUE` |
| `LISTENING` | `LISTEN` |
| `SHADOWING` | `SHADOW` |
| `CONVERSATION_SEED` | `CONVSEED` |
| `TRANSFER_EXERCISE` | `TRANSFER` |
| `ERROR_PATTERN` | `ERRPATTERN` |

**`{DISAMBIGUATOR}` 규칙**:

| 상황 | 규칙 |
|---|---|
| `EXPLANATION` | `{META_LANGUAGE}_{LEVEL}` (예: `KO_BEGINNER`) — 같은 노드에 언어·난이도별로 여러 설명이 있을 수 있으므로 |
| 그 외 모든 타입, 사전 제작(`source = HUMAN_AUTHORED`이며 미리 큐레이션됨) | 순번 `{N}` (1, 2, 3...) |
| `source = AI_GENERATED`이고 런타임에 즉석 생성되어 영구 저장되는 경우 | 사전 순번을 매길 수 없으므로 타임스탬프 또는 UUID 기반의 `{UNIQUE_SUFFIX}` |

| 규칙 | 설명 |
|---|---|
| `{NODE_SLUG}` | 연결된 Grammar Node ID에서 `GRAMMAR_{LANGUAGE}_` 접두사를 뗀 나머지. 여러 Grammar Node를 참조하는 Content(CONTENT_SCHEMA §7)는 대표 노드 하나의 SLUG를 사용한다 |

**예시**: `CONTENT_VI_DA_EXPL_KO_BEGINNER`, `CONTENT_VI_DA_EXAMPLE_1`, `CONTENT_VI_XINCHAO_DIALOGUE_1`, `CONTENT_VI_DANG_LISTEN_1`

---

## 6. Relation ID

**형식**: `REL_{FROM_SLUG}_{RELATION_TYPE}_{TO_SLUG}`

- `{RELATION_TYPE}`: `PREREQ`(PREREQUISITE) \| `RELATED` \| `CONTRAST` \| `ALT`(ALTERNATIVE) — 축약형 사용(가독성)
- 예: `REL_ROI_PREREQ_DA`, `REL_DUOCPASSIVE_CONTRAST_BI`
- Relation ID는 Node/Concept ID만큼 외부에서 자주 직접 참조되지는 않지만, 감사·디버깅 추적성을 위해 임의로 재발행하지 않는다.

---

## 7. Progress ID

**필드 구조의 유일한 출처는 PROGRESS_SCHEMA.md(Tier A)다.** 이 절은 식별자 규칙만 다룬다.

**Progress는 별도의 ID를 발행하지 않는다.** `(user_id, node_id)` 복합 키가 곧 식별자다. 사용자 한 명이 노드 하나당 정확히 하나의 Progress 레코드만 가지므로, 별도 ID가 식별력에 아무것도 더해주지 않는다 — 불필요한 식별자를 만들지 않는 것도 이 표준의 일부다.

---

## 8. Attempt Record ID

**필드 구조의 유일한 출처는 PROGRESS_SCHEMA.md §4다.** 이 절은 식별자 규칙만 다룬다.

Attempt Record는 Progress의 `recent_attempts` 배열 안에 있는 하위 항목이며(PROGRESS_SCHEMA §4), 독립적인 생애주기를 갖지 않는다. **개별 ID를 부여하지 않으며, `timestamp`가 사실상의 순서 식별자 역할을 한다.**

향후 PROGRESS_SCHEMA §4의 제약(무제한 로그 금지)에 따라 전체 이력이 별도의 분석 로그 저장소로 분리되는 경우, 그 저장소의 레코드는 `ATTEMPT_{user_id}_{node_id}_{timestamp}` 형식의 파생 ID를 사용할 수 있다.

---

## 9. Vocabulary ID

**필드 구조의 유일한 출처는 VOCABULARY_SCHEMA.md(Tier A)다.** 이 절은 식별자 규칙만 다룬다.

**형식**: `VOCAB_{LANGUAGE}_{LEMMA_SLUG}`

- `{LEMMA_SLUG}`는 3장(Grammar Node ID)의 SLUG 생성 규칙(언어별 정규화 표)을 그대로 재사용한다 — 같은 Lemma라도 품사가 다르면 별도 Entry가 필요할 수 있으며, 그 경우 `{DISAMBIGUATOR}`(3장과 동일한 개념)로 품사를 덧붙인다. 예: `VOCAB_EN_GO`(동사 go 하나뿐이라 모호성 없음), 동음이의어가 여러 품사로 쓰이는 언어라면 `VOCAB_EN_LIE_V`/`VOCAB_EN_LIE_N`처럼 구분한다.
- **성조 제거로 인한 충돌에도 동일한 DISAMBIGUATOR 규칙을 적용한다**(PINYIN_NORMALIZATION_STRESS_TEST.md에서 실증). 중국어처럼 성조만 다르고 로마자 음절이 같은 두 발음이 있으면(예: 得 dé "얻다" vs de "정도보어 조사", 둘 다 `DE`), 새 규칙을 만들지 않고 품사 기준 `{DISAMBIGUATOR}`로 구분한다: `VOCAB_ZH_DE_V`(dé) / `VOCAB_ZH_DE_PART`(de). 이 규칙은 애초에 동음이의어 일반을 위해 만들어졌으므로 성조 충돌도 그 부분집합일 뿐이다.
- **잔여 위험(미해결)**: 성조만 다르고 로마자 음절·품사까지 같은 경우는 이 규칙으로 구분되지 않는다. 아직 실제 발견 사례는 없으나(PINYIN_NORMALIZATION_STRESS_TEST.md §4), 발견되면 의미 태그 또는 성조 번호 기반의 3번째 층위 DISAMBIGUATOR를 추가 검토한다.
- **엔터티 타입 접두사가 크로스 캐릭터 충돌을 이미 방지한다**: 서로 다른 한자가 성조 제거 후 같은 SLUG를 갖더라도(예: 了 le → `LE`, 乐 lè → `LE`), 하나는 `GRAMMAR_`, 하나는 `VOCAB_` 접두사를 가지므로 전체 ID는 겹치지 않는다(§11 공통 형식 규칙).
- ID Stability Principle(2장)이 동일하게 적용된다 — Vocabulary Entry의 품사·의미 분류가 나중에 재검토되어도 ID는 유지한다.

---

## 10. AI Generation Engine 참조 ID 규칙

- AI Generation Engine은 노드를 지칭할 때 **항상 canonical ID(`GRAMMAR_...`, `CONCEPT_...`)만 사용**하며, 자연어 레이블(`label` 필드)이나 표면 형태(`surface_forms`)로 노드를 지칭하지 않는다. 사람이 읽는 텍스트는 표시용일 뿐, 참조는 항상 ID로 한다.
- 생성 결과가 Content로 영구 저장되는 경우, 5장의 `_AIGEN_{UNIQUE_SUFFIX}` 규칙을 따른다.
- 저장되지 않고 즉시 소비되는 일회성 생성물(예: 화면에 한 번 보여주고 마는 문제)은 ID를 발행할 필요가 없다 — 저장되지 않는 것에 식별자를 만드는 것은 불필요한 복잡도다.

---

## 11. 공통 형식 규칙

- 전체 **대문자 스네이크 케이스**(`SCREAMING_SNAKE_CASE`)만 사용
- 구분자는 언더스코어(`_`)만 사용 — 공백, 하이픈, 마침표 금지
- 모든 ID는 엔터티 타입을 나타내는 접두사로 시작한다(`GRAMMAR_`, `CONCEPT_`, `CONTENT_`, `REL_`, `ATTEMPT_`, `VOCAB_`)
- 언어 코드는 항상 ISO 639-1 두 글자 대문자
- ID에 버전 번호를 포함하지 않는다 — 버전은 그 ID가 속한 **문서**의 개정 이력으로 관리한다(ID 자체는 시간이 지나도 같은 대상을 가리켜야 한다)

---

## 12. 버전 전략

- **새 언어가 추가되어도 이 문서의 규칙(형식의 큰 틀)은 바꾸지 않는다.** 언어별 SLUG 정규화의 세부 적용(디아크리틱 제거 방식 등)은 언어 특성에 따라 다르지만, `{TYPE}_{LANGUAGE}_{SLUG}` 같은 구조 자체는 모든 언어에 동일하게 적용된다.
- 정말로 형식 자체를 바꿔야 하는 상황이 발생하면, PROJECT_VISION §6 의사결정 원칙에 준하는 **최고 수준 승인**이 필요하다.
- 형식이 바뀌더라도 **기존에 발행된 ID는 ID Stability Principle에 따라 그대로 유지**하며, 새 형식은 그 시점 이후 신규 ID부터만 적용한다. 전면 재발행(mass rename)은 하지 않는다.

---

## 13. 금지 사항

- 의미 없는 순번 ID(예: `ID_001`)
- 같은 기능인데 서로 다른 ID를 발행하는 것, 또는 반대로 서로 다른 기능에 같은 ID를 쓰는 것
- 언어 의존적이거나 특정 팀만 이해하는 임의 약어 사용
- "사람이 보기 편하다"는 이유로 이 문서의 규칙을 깨는 것
- Grammar Node ID에 Concept/Category 분류 정보를 새겨 넣어, 분류가 바뀔 때 ID까지 갱신해야 하는 상황을 만드는 것(2장 위반)
- 소문자, 공백, 하이픈을 ID에 혼용하는 것
- 이미 발행된 ID의 철자·구조를 "정리한다"는 명목으로 변경하는 것(ID Stability Principle 위반)

---

## 14. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-05 | 최초 작성 (문서명 NODE_ID_NAMING → IDENTIFIER_STANDARD로 확정, 범위를 Grammar Node에서 전체 ID 체계로 확장). ID Stability Principle 정의, Grammar Node/Concept/Content/Relation/Progress/Attempt Record/AI Generation 참조 ID 규칙 통합. CONCEPT_SCHEMA §2, GRAMMAR_SCHEMA §1의 ID 규칙을 이 문서로 이관 |
| 1.1 | 2026-07-06 | CONTENT_SCHEMA.md 신설에 따라 §5 Content ID 규칙 갱신 — `content_type` 10종 기준 TYPE_ABBR 표로 재정의, media/source 기반 마커(AUDIO/IMAGE/AIGEN) 제거(3축 분리 원칙 반영), AI_GENERATED 런타임 저장분의 UNIQUE_SUFFIX 규칙은 유지하되 `source` 필드 기준으로 재서술 |
| 1.2 | 2026-07-06 | PROGRESS_SCHEMA.md 신설에 따라 §7~8의 필드 구조 참조 출처를 GRAMMAR_SCHEMA에서 PROGRESS_SCHEMA로 갱신(식별자 규칙 자체는 변경 없음) |
| 1.3 | 2026-07-06 | §3 미해결 메모를 Auxiliary + Pattern 구성 문법 SLUG 규칙으로 공식화(V/TO_V/VING/VPP 형태 범주 축약어, 조동사 연쇄 규칙). EN_LANGUAGE_PACK.md가 첫 적용 사례 |
| 1.4 | 2026-07-06 | §3에 진성 조동사(can/will 등) 예외 규칙 추가 — 원형 보어가 부류 전체의 보편 속성인 진성 조동사는 PATTERN 접미사 생략, 준조동사(have to/want to 등)는 유지 |
| 1.5 | 2026-07-06 | VOCABULARY_SCHEMA.md 신설에 따라 §9(신규) Vocabulary ID 규칙 추가. 이후 섹션 번호 전체 한 칸씩 이동(AI Generation 참조 10장, 공통 형식 규칙 11장, 버전 전략 12장, 금지 사항 13장, 개정 이력 14장) |
| 1.6 | 2026-07-06 | §3에 Structure-only SLUG 규칙 공식 승격 — `WH_INSITU`/`WH_FRONTING`/`DO_SUPPORT_Q` 3회 반복 확인 후 정식 규칙화. 적용 조건(고정 어휘 없음 + surface_forms가 패턴 표기)과 Auxiliary+Pattern 규칙과의 경계 명시 |
| 1.7 | 2026-07-06 | §3 Auxiliary+Pattern 규칙을 "언어별 어순 규칙"에서 "표면 형태소 결합 순서를 그대로 따르는 단일 일반 원칙"으로 재일반화(JA_LANGUAGE_PACK 착수 과정에서 발견 — 일본어 `TE_IRU`처럼 패턴이 조동사보다 먼저 오는 어순이 기존 "조동사 먼저" 고정 규칙과 충돌). 형태 범주 축약어 목록은 언어별로 별도 정의하되 결합 순서 원칙은 공유 |
| 1.8 | 2026-07-06 | §3에서 v1.7 일반화 이전에 남아있던 중복·구식 "언어 독립성" 문단 제거(정리, 내용 변경 없음) |
| 1.9 | 2026-07-06 | §3 중국어 SLUG 규칙 구체화 — 다음자(多音字) 해소 절차 3단계 정의(문법 기능 결정→VOCABULARY_SCHEMA에서 올바른 발음 확정→Identifier 생성). ZH_LANGUAGE_PACK 착수 과정에서 발견된 IDENTIFIER_STANDARD-VOCABULARY_SCHEMA 연결 지점 명문화 |
| 1.10 | 2026-07-06 | PINYIN_NORMALIZATION_STRESS_TEST.md 결과 반영 — §9에 성조 충돌도 기존 품사 기반 DISAMBIGUATOR로 해소됨을 명시(새 규칙 불필요), 엔터티 타입 접두사가 크로스 캐릭터 충돌을 이미 방지하고 있다는 점 기록, 동품사·동성조 충돌이라는 잔여 위험을 이론적으로 남김 |
