# CONCEPT_SCHEMA.md
## Universal Grammar Concept 데이터 표준

> 이 문서는 GRAMMAR_SCHEMA.md보다 상위에 있는 SSOT(Single Source of Truth)다.
> 모든 언어별 Grammar Node는 이 문서가 정의한 Concept 중 하나 이상을 참조해야 하며, 이 문서와 충돌하는 방식으로 설계될 수 없다.

문서 계층: `PROJECT_VISION.md` → `LEARNING_THEORY.md` → **`CONCEPT_SCHEMA.md`** → `GRAMMAR_SCHEMA.md` → `GRAMMAR_GRAPH.md`

---

## 0. 문서의 지위

LLE는 베트남어 전용 앱이 아니라 언어 독립 학습 엔진이다. 따라서 프로젝트의 최상위 데이터 기준은 특정 언어의 문법이 아니라 **언어에 종속되지 않는 개념(Universal Concept)**이어야 한다.

Grammar Schema, Grammar Graph, Review Engine, AI Tutor, Conversation Engine, Language Pack은 모두 이 문서가 정의한 Concept 구조를 참조한다. Concept Schema가 흔들리면 그 위에 쌓이는 모든 언어별 구조가 함께 흔들리므로, 이 문서는 GRAMMAR_SCHEMA.md보다 먼저, 더 신중하게 확정한다.

---

## 1. 목적

이 문서는 다음을 정의한다.

- Universal Concept이란 무엇이고, 어떻게 식별·분류되는가 (2~7장)
- Concept과 언어별 Grammar Node가 어떻게 연결되는가, 그리고 왜 그 연결이 항상 **Grammar Node → Concept 방향의 단방향**이어야 하는가 (8장)
- Concept과 Grammar Node가 서로 다른 존재인 이유 (9장)
- Concept 차원의 습득 상태가 언어별 Grammar Node 습득 상태와 어떤 관계를 갖는가 (10장)
- 새 언어를 추가할 때 이 문서가 왜, 그리고 어디까지 수정되지 않아야 하는가 (11장)

### 핵심 원칙 (변경 불가)

- **Concept은 언어 중립 개념이다.** 특정 언어의 형태·어휘와 무관하게 존재한다.
- **Grammar Node는 특정 언어가 Concept을 표현하는 방식이다.** Concept이 "무엇을(WHAT)" 표현하는지를 정의한다면, Grammar Node는 "어떻게(HOW)" 표현하는지를 정의한다.
- **모든 Grammar Node는 반드시 하나 이상의 Concept을 참조해야 한다.** Concept 참조 없는 Grammar Node는 존재할 수 없다.
- **새 Language Pack을 추가할 때 기존 Concept Schema는 원칙적으로 수정하지 않는다.**
- **단, 기존 Concept으로 설명할 수 없는 개념이 새 언어에서 발견될 경우, 별도 승인 절차(11장)를 거쳐 Concept을 추가할 수 있다.** 이는 예외이지 기본 경로가 아니다.

---

## 2. Universal Concept ID 규칙

**ID 형식·불변성 원칙은 IDENTIFIER_STANDARD.md §4(및 §2 ID Stability Principle)를 따른다.** 이 절에서는 빠른 참조를 위해 형식만 다시 표기한다.

**형식**: `CONCEPT_{CATEGORY}_{FUNCTION}` (대문자 스네이크 케이스)

예: `CONCEPT_TENSE_PAST`, `CONCEPT_ASPECT_PROGRESSIVE`, `CONCEPT_MODALITY_ABILITY`, `CONCEPT_CONDITIONAL_HYPOTHETICAL`

- ID는 전역적으로 유일하며, 어떤 언어에도 속하지 않는다.
- 세부 규칙(불변성, 버전 미포함 등)은 IDENTIFIER_STANDARD.md에서 정의하며, 이 문서는 그 규칙을 재정의하지 않는다.

---

## 3. Concept Category

Category는 Concept의 최상위 분류다. 초기 카테고리는 아래와 같이 닫힌 목록으로 시작하되, 11장의 절차를 통해서만 확장한다.

| Category | 설명 | 예시 |
|---|---|---|
| TENSE | 사건의 시간적 위치 | 과거, 현재, 미래 |
| ASPECT | 사건의 내부 시간 구조 | 진행, 완료, 습관 |
| MODALITY | 화자의 태도·가능성 판단 | 가능, 필요, 허가 |
| CONDITIONAL | 조건-결과 관계 | 가정, 반사실 |
| NEGATION | 부정 | 단순 부정, 부분 부정 |
| COMPARISON | 비교 | 우등, 동등, 최상 |
| QUANTITY | 수량 | 셀 수 있음/없음, 부분/전체, 분류사 구조 |
| VOICE | 행위자-피행위자 관계 | 능동, 수동 |
| MOOD | 발화 의도(문장 유형) | 명령, 청유, 의문, 감탄 |
| PRAGMATICS | 화자와 청자의 사회적 관계, 공손성(격식), 발화 태도·뉘앙스를 표시하는 화용적 기능. 문장의 명제 내용이나 문장 유형(MOOD)은 바꾸지 않고, 그 위에 얹히는 별도의 태도 층위다 | 존대/하대 표지, 완곡화, 부드러운 권유 뉘앙스, 확인·다짐 어조 |

이 목록은 최종이 아니며, 새 언어 파일럿 과정에서 부족함이 드러나면 11장 절차로 확장한다.

**[Tier C 추가 근거 — PRAGMATICS, 2026-07-05]** 베트남어의 문장 종결사·존대 표지(예: ạ, nhé, à)는 시제·양태·부정 등 기존 9개 Category 중 어디에도 속하지 않는다. 이들은 "무엇을 표현하는가"(명제 내용)가 아니라 "그 명제를 어떤 사회적 태도로 전달하는가"를 표시하는, 질적으로 다른 층위의 기능이기 때문이다. 이 현상은 베트남어에 국한되지 않는다 — 일본어의 문말 조사(ね/よ/わ), 한국어의 상대높임 체계, 중국어의 어기조사(吧/呢/啊) 모두 동일한 기능적 범주에 속한다. 따라서 이를 베트남어 전용 예외로 처리하지 않고, 언어 독립적인 새 Category로 승격하는 것이 장기적 확장성에 부합한다고 판단해 PROJECT_VISION §6 의사결정 원칙에 따라 최고 수준 승인을 거쳐 추가한다. 이 Category에 속하는 구체적 Concept 인스턴스(예: `CONCEPT_PRAGMATICS_POLITENESS`)는 이를 실제로 필요로 하는 첫 Language Pack(VI_LANGUAGE_PACK.md)에서 정의한다 — 아직 실사용 근거가 없는 Concept을 미리 만들어두지 않는다.

**MOOD와의 경계**: `MOOD`는 문장이 구조적으로 어떤 종류의 발화행위인가(평서/의문/명령/감탄)를 결정한다. `PRAGMATICS`는 그 문장 유형은 그대로 둔 채, 화자가 청자에게 어떤 사회적 태도로 그것을 전달하는가(존댓말인지 반말인지, 부드럽게 권하는지 단호하게 지시하는지)를 표시한다. 같은 명령문(`MOOD`)이라도 `PRAGMATICS` 표지에 따라 정중한 권유가 될 수도, 단호한 지시가 될 수도 있다 — 두 Category는 서로 다른 축이며 겹치지 않는다.

**명시적 제외**: 절과 절, 문장과 문장을 잇는 일반 담화 연결 표지(예: "그러나", "따라서" 같은 접속 기능)는 `PRAGMATICS`에 포함하지 않는다. 이는 화자-청자 관계·태도가 아니라 명제 간 논리적 연결이므로 성격이 다르다. 이 영역은 현재 어느 Category에도 속하지 않으며, 실제 필요성이 확인되면 별도의 Tier B/C 절차로 다룬다.

---

## 4. Concept Function

Function은 Category보다 세분화된, Concept이 실제로 수행하는 구체적 의미·화용적 역할이다. **Concept ID의 두 번째 요소가 곧 Function이다.**

예: Category `MODALITY` 아래에는 Function `ABILITY`(가능), `POSSIBILITY`(개연성), `NECESSITY`(필요), `PERMISSION`(허가), `OBLIGATION`(의무)이 각각 별도의 Concept(`CONCEPT_MODALITY_ABILITY` 등)을 이룬다.

**Category와 Function의 차이**: Category는 "이 개념이 어떤 영역에 속하는가"를 묻고, Function은 "그 영역 안에서 정확히 어떤 기능을 하는가"를 묻는다. 하나의 Concept은 반드시 하나의 Category와 하나의 Function으로 완전히 특정되어야 한다.

---

## 5. Concept Difficulty

Concept Difficulty는 **특정 언어에서 그 개념을 구현하는 난이도가 아니라, 개념 자체의 인지적 복잡도**를 뜻한다. 예를 들어 반사실적 조건(CONDITIONAL_HYPOTHETICAL)은 어떤 언어로 배우든 단순 과거 시제(TENSE_PAST)보다 개념적으로 더 복잡하다.

- 척도: 1(가장 단순) ~ 5(가장 복잡)의 정수 등급
- 예시 서열: `NEGATION` < `TENSE_PAST` < `ASPECT_PROGRESSIVE` ≈ `MODALITY_ABILITY` < `CONDITIONAL_HYPOTHETICAL`

**중요한 구분**: 이 난이도는 Grammar Node의 난이도와 다르다. 어떤 언어는 개념적으로 단순한 것을 형태적으로 매우 복잡하게 표현할 수 있다 (예: 불규칙 활용이 심한 언어의 과거형). 그런 **언어별 구현 난이도는 GRAMMAR_SCHEMA.md에서 별도로 정의**하며, 이 문서의 Concept Difficulty는 그 기준선(baseline) 역할만 한다.

---

## 6. Concept Prerequisite

Concept 간에도 선행 관계가 존재한다. 예: `CONDITIONAL_HYPOTHETICAL`을 학습하려면 그보다 먼저 `TENSE_PAST`와 기본적인 가정 표현 능력이 필요할 수 있다.

**Grammar Node 레벨 prerequisite(LEARNING_THEORY C4)와의 관계**: Concept prerequisite는 커리큘럼 설계 층위의 상위 제약이고, Grammar Node prerequisite는 특정 언어 구현 층위의 하위 제약이다. 둘은 반드시 정합적이어야 한다 — 즉, 어떤 언어의 Grammar Node가 Concept A를 구현하고 Concept A가 Concept B를 선행 조건으로 요구한다면, 그 Grammar Node는 Concept B를 구현하는 (해당 언어의) Grammar Node보다 먼저 등장할 수 없다. **[제약]** 이 정합성 검증은 Grammar Graph 설계 시 반드시 포함되어야 한다.

---

## 7. Concept Relationship

Prerequisite 외에 아래 관계 유형을 정의한다.

- **관련(related)**: 함께 다뤄지면 학습에 도움이 되는 관계 (예: `ASPECT_PROGRESSIVE`와 `ASPECT_HABITUAL`)
- **대조(contrast)**: 형태·의미가 혼동되기 쉬워 의도적으로 교차 연습(Interleaving)해야 하는 관계
- **포함(subsumption)**: 한 Concept이 다른 Concept의 특수 사례인 관계

이 관계 데이터는 Review Engine이 LEARNING_THEORY §4의 교차 강제 원칙을 실행할 때 "무엇과 무엇을 섞어야 하는가"의 근거로 사용된다.

---

## 8. 언어별 구현과의 연결 방식

Concept과 Grammar Node는 `expressed_by`(개념이 이렇게 표현된다) 관계로 연결되는 다대다 관계다. 하나의 Concept은 여러 언어의 여러 Grammar Node로 표현될 수 있고, 하나의 Grammar Node도 하나 이상의 Concept을 동시에 표현할 수 있다.

**[핵심 설계 결정] 참조 방향은 항상 단방향이다: `Grammar Node.concept_ids → Concept.id`.**

Concept 엔터티는 "어떤 Grammar Node들이 나를 구현하는지"를 자기 자신 안에 저장하지 않는다. 그 역방향 목록은 필요할 때 Grammar Schema/Graph 쪽에서 조회·계산한다.

**이유**: 만약 Concept이 자신을 구현하는 Grammar Node 목록을 직접 들고 있다면, 새 언어를 추가할 때마다 그 언어의 Grammar Node ID를 Concept 데이터에 추가해야 하므로 "새 언어 추가 시 Concept Schema를 수정하지 않는다"는 핵심 원칙이 깨진다. 참조 방향을 Grammar Node → Concept으로 고정해야만 Concept Schema가 언어 확장에 대해 진짜로 불변일 수 있다.

---

## 9. Concept과 Grammar Node의 차이

| | Concept | Grammar Node |
|---|---|---|
| 답하는 질문 | 무엇을 표현하는가 (WHAT) | 어떻게 표현하는가 (HOW) |
| 언어 종속성 | 언어 중립 | 특정 언어에 종속 |
| 정의 위치 | CONCEPT_SCHEMA (엔진 코어) | GRAMMAR_SCHEMA (Language Pack) |
| 안정성 | 매우 안정적, 거의 불변 | 언어별로 계속 추가됨 |
| 사용자별 습득 상태 | 직접 저장하지 않음 (10장 참조) | 6단계 상태를 직접 저장 (LEARNING_THEORY C1) |

**Concept은 그 자체로 습득 상태를 저장하지 않는다.** 습득 상태는 항상 Grammar Node에 귀속된다. Concept 차원의 "습득 정도"는 아래 10장에서 정의하는 **계산된(파생) 값**일 뿐, 별도로 저장되는 두 번째 진실 소스가 아니다. 이는 상태 데이터가 두 곳에 중복 저장되어 서로 어긋나는 것을 원천적으로 막기 위함이다.

---

## 10. Concept Mastery와 Language-Specific Grammar Mastery의 관계

### 10.1 재정의 — 단일 값이 아닌 2축 모델

기존에 검토했던 세 가지 대안(최소값, 가중평균, 대표 노드)은 모두 Concept Mastery를 **단일 값**으로 환원하려 했다는 공통된 한계가 있었다. 단일 값으로 압축하는 순간 "얼마나 넓게 아는가"와 "얼마나 깊이 아는가"라는 서로 다른 정보가 뒤섞여 손실된다.

이를 해결하기 위해 Concept Mastery는 **단일 값이 아니라 두 개의 독립적인 축**으로 정의한다.

| 축 | 정의 | 답하는 질문 |
|---|---|---|
| **Coverage** | 해당 언어에서 이 Concept을 표현하는 전체 Grammar Node 중, 사용자가 "다뤄본" 노드의 비율 | 이 개념을 표현하는 방법 중 몇 %를 접해봤는가 |
| **Depth** | Coverage에 포함된(다뤄본) Grammar Node들의 습득 상태 수준 | 접해본 것들을 얼마나 깊이 익혔는가 |

두 축은 서로를 대체하지 않는다. Coverage가 높아도 Depth가 낮을 수 있고(넓지만 얕게 아는 상태), Coverage가 낮아도 Depth가 높을 수 있다(좁지만 깊게 아는 상태). 이 구분 자체가 유의미한 정보이므로 하나의 숫자로 뭉개지 않는다.

**9장 원칙과의 정합성**: Coverage와 Depth는 모두 Grammar Node의 습득 상태로부터 그때그때 계산되는 파생값이다. Concept 엔터티에 별도로 저장되지 않으며, 두 번째 진실 소스를 만들지 않는다.

### 10.2 Coverage 정의 — "다뤄봤다"의 기준 (확정)

Coverage의 최소 기준은 **`Introduced` 이상**으로 확정한다.

Coverage는 사용자가 해당 Concept을 표현하는 Grammar Node를 얼마나 넓게 접했는지를 나타내는 지표이며, 숙련도는 전적으로 Depth가 담당한다. 이로써 Coverage(노출 범위)와 Depth(숙련도)의 역할이 완전히 분리된다.

### 10.3 Depth 정의 — 개념적 정의 (정확한 계산식은 HOW 단계)

Depth는 Coverage에 포함된 노드들의 습득 상태를 하나의 보조 지표로 요약한다. 6단계 상태에 서수값(예: Introduced=1 ~ Automatic=5)을 매겨 평균 내는 방식이 기본 아이디어다.

**이전에 가중평균안을 기각했던 이유(6단계로 강제 환원할 때의 이산화 문제)가 여기서는 발생하지 않는다.** Depth는 다시 6단계 중 하나로 되돌릴 필요 없이, 그 자체로 연속적인 보조 지표(예: 0~1 정규화 점수)로 보고되면 충분하기 때문이다.

정확한 계산식(단순 평균 vs 최소값 vs 분포 기반 등)과 빈도 가중치 적용 여부는 이 문서에서 확정하지 않고 Grammar Graph/엔진 설계 문서로 넘긴다. 이 문서가 강제하는 제약은 "Depth는 반드시 Coverage에 포함된 노드만을 대상으로 계산되어야 한다"는 것뿐이다.

### 10.4 두 축의 활용

- **표시/UX**: 학습자에게 "이 개념을 68% 접했고, 접한 것 중 평균 Practicing 수준"처럼 두 지표를 함께 보여줄 수 있다.
- **"개념 습득 완료" 판정**: 필요하다면 Coverage와 Depth 각각에 임계치를 두고 **둘 다** 충족할 때만 "습득 완료"로 표시한다(하나라도 낮으면 미완료). 정확한 임계치는 HOW 단계에서 정의한다.
- **AI 생성 게이팅과는 무관함**: LEARNING_THEORY C10의 AI 생성 최소 자격 기준은 이미 Grammar Node 단위(Practicing 이상, 전원 충족)로 확정되어 있다. Concept Mastery(Coverage/Depth)는 이 게이팅 로직을 대체하지 않으며, 어디까지나 보고·커리큘럼 설계용 지표다.

### 10.5 이전 3안 대비 이 방식의 장점

| 문제였던 지점 | 3안(단일 값)에서의 한계 | 2축 모델에서의 해결 |
|---|---|---|
| 희귀 표현 하나가 전체를 좌우 (①안의 단점) | 최소값 기준은 한 노드가 전체를 묶어둠 | 그 노드의 영향이 비율로만 반영되어 완충됨 |
| 이산화 문제 (②안의 단점) | 평균을 6단계 중 하나로 되돌려야 하는 부담 | Depth는 연속 지표로 남아도 되므로 이산화 불필요 |
| 수작업 의존 (③안의 단점) | 대표 노드를 사람이 지정해야 함 | 대표 노드 지정 불필요, 전체 노드 데이터로 자동 계산 |

이 모델이 승인되었으므로, GRAMMAR_SCHEMA.md 설계 시 "특정 언어·특정 Concept에 대한 전체 Grammar Node 목록을 조회할 수 있어야 한다"는 조회 요구사항을 스키마 요구사항으로 반영한다.

---

## 11. 새 언어 추가 시 Concept Schema 수정 원칙

확장 행위를 영향 범위에 따라 3단계로 구분한다.

| 단계 | 행위 | Concept Schema 수정 여부 | 승인 절차 |
|---|---|---|---|
| A (기본 경로) | 새 언어(Language Pack) 추가, 기존 Concept으로 전부 설명 가능 | **수정 없음** | Grammar Schema 레벨 작업만으로 진행 |
| B (예외) | 기존 Category 안에서 새로운 Function, 즉 새 Concept 추가가 필요 | Concept 신규 추가 (기존 Concept 변경·삭제는 없음) | 새 언어의 어떤 현상이 기존 Concept으로 설명 불가능한지 근거 문서화 → 사용자 승인 |
| C (구조 변경) | 기존 Category 자체로 분류 불가능한 새 상위 범주 발견 | Category 신규 추가 | PROJECT_VISION 6장 의사결정 원칙 준용, 가장 신중한 승인 절차 |

원칙적으로 모든 새 언어는 A로 처리되는 것이 정상이며, B·C는 예외적 상황에서만 발생해야 한다. B·C가 자주 발생한다면 이는 Concept 설계 자체가 불완전하다는 신호로 간주하고 재검토한다.

---

## 12. 금지 사항

- Grammar Node를 Concept 참조 없이 정의하는 것 (핵심 원칙 위반)
- Concept 엔터티 안에 특정 언어의 Grammar Node ID를 직접 저장하는 것 (8장의 단방향 참조 원칙 위반)
- 특정 언어의 특수 사정을 이유로 기존 Concept ID의 의미를 바꾸거나 이름을 변경하는 것 (2장 불변성 위반)
- 새 언어 추가를 이유로 Concept Schema를 정당한 승인 절차(11장) 없이 수정하는 것
- Concept 차원의 습득 상태를 Grammar Node 상태와 별도로 직접 저장하는 것 (9장 위반 — 이중 진실 소스 생성)
- Concept Difficulty를 특정 언어의 구현 난이도와 혼동하여 기록하는 것 (5장 위반)

---

## 13. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 목차 승인 |
| 1.0 | 2026-07-05 | 본문 최초 작성 — ID 규칙, Category/Function/Difficulty/Prerequisite/Relationship, 단방향 참조 원칙, Concept-Grammar Node 구분, Concept Mastery 집계 방식 3안 비교(권장: 최소값 기준, 승인 대기), 확장 3단계 원칙, 금지 사항 정의 |
| 1.1 | 2026-07-05 | Concept Mastery를 단일 값 3안 비교에서 Coverage/Depth 2축 모델로 전면 교체. Coverage 판정 기준(Introduced 이상 권장)은 승인 대기 |
| 1.2 | 2026-07-05 | Coverage 최소 기준 Introduced 이상으로 확정. CONCEPT_SCHEMA.md 모든 PENDING 항목 해소 — 문서 승인 완료 |
| 1.3 | 2026-07-05 | Tier C 절차로 PRAGMATICS Category 추가(§11 최고 수준 승인) — 베트남어 종결사·존대 표지 등 화용적 표지를 위한 언어 독립 범주. 근거: 명제 내용이 아닌 발화 태도를 표시하는 질적으로 다른 기능이며, 일본어·한국어·중국어에도 동일 현상 존재. QUANTITY/MOOD 예시에 분류사·의문 추가(VI_LANGUAGE_PACK 논의 반영) |
| 1.4 | 2026-07-05 | PRAGMATICS 정의를 베트남어 전용이 아닌 언어 독립적 정의로 확장(화자-청자 관계·공손성·태도 뉘앙스 포괄). MOOD와의 경계 명시(문장 유형 vs 전달 태도), 일반 담화 연결 표지는 명시적으로 제외 |
| 1.5 | 2026-07-05 | §2 Concept ID 규칙을 IDENTIFIER_STANDARD.md(신규 Tier A 문서)로 이관, 중복 제거. 이 문서는 이제 형식만 요약 인용하고 세부 규칙은 IDENTIFIER_STANDARD.md를 유일한 출처로 참조 |
