# CONTENT_SCHEMA.md
## Content Entity 데이터 표준 (Tier A — Core Standard)

> Grammar Node는 **무엇을** 배우는지를 정의한다. Content는 그 학습 목표가 **학습자에게 어떤 형태로 전달되는지**를 정의한다. 이 문서는 CONCEPT_SCHEMA.md/GRAMMAR_SCHEMA.md와 마찬가지로 언어 독립적 Core Standard이며, 특정 Language Pack에 종속되지 않는다.

문서 계층: Tier A(CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, LEARNING_PROTOCOL, **CONTENT_SCHEMA**) → Tier B(Language Pack) → Tier C(구현) → Tier D(실제 콘텐츠 데이터)

---

## 0. 문서의 지위

- **이 문서는 Content Entity의 유일한 출처다.** GRAMMAR_SCHEMA.md §3에 있던 Content 정의는 이 문서로 완전히 이관되었으며, GRAMMAR_SCHEMA.md는 이제 이 문서를 참조만 한다(IDENTIFIER_STANDARD.md 선례와 동일 처리).
- **"Language Pack 독립적"의 정확한 의미**: Content의 **구조**(필드 정의, ID 규칙, Validation 규칙)는 모든 언어가 동일하게 공유한다. 반면 Content의 **실제 인스턴스**(구체적 텍스트, 오디오 파일)는 당연히 언어별로 다르며, 향후 Tier D(실제 콘텐츠 데이터) 문서에 언어별로 존재한다. "독립적"이라는 말이 "언어와 무관한 콘텐츠"를 뜻하지 않는다 — Concept이 언어 중립적이면서도 언어별 Grammar Node로 구현되는 것과 정확히 같은 구조다.

---

## 1. Content Entity의 목적

**Content는 파일이 아니라 학습 객체(Learning Object)다.** 하나의 Content는 하나의 명확한 교육적 의도를 가지며, 그 의도를 전달하기 위해 텍스트·오디오·이미지·영상 등 여러 매체를 동시에 묶을 수 있다.

예: 하나의 `DIALOGUE` Content가 텍스트 대본, 원어민 음성, 상황 삽화를 모두 포함할 수 있다. 이 셋은 서로 다른 세 개의 Content가 아니라, **하나의 학습 객체를 구성하는 세 개의 매체 자산**이다.

이 원칙이 없으면 같은 학습 내용이 매체별로 중복 생성되어(텍스트용 Content, 오디오용 Content, 영상용 Content) 관리 비용이 언어·매체 수에 비례해 폭증한다.

---

## 2. Content Type 정의 (교육적 기능 축)

`content_type`은 **이 Content가 학습자에게 어떤 교육적 역할을 하는가**만 나타낸다. 매체나 생성 주체와는 무관하다.

| Type | 정의 |
|---|---|
| `EXPLANATION` | 문법 규칙에 대한 설명 |
| `EXAMPLE` | 문법이 실제로 쓰인 예문 |
| `QUIZ` | 능동적 인출을 요구하는 문제(Active Recall) |
| `MINIMAL_PAIR` | 형태·의미가 비슷해 혼동되는 두 표현을 나란히 대조 제시(GRAMMAR_SCHEMA §6의 `CONTRAST` Relation과 자연스럽게 연동) |
| `DIALOGUE` | 둘 이상의 화자가 등장하는 대화문 |
| `LISTENING` | 청해 연습(듣고 이해하는 활동) |
| `SHADOWING` | 듣고 즉시 따라 말하는 연습 |
| `CONVERSATION_SEED` | 자유 회화의 출발점이 되는 상황·프롬프트(LEARNING_PROTOCOL §9 Conversation 진입 이후 사용) |
| `TRANSFER_EXERCISE` | 기존 연습에서 다루지 않은 새 문맥에서의 적용을 요구(LEARNING_THEORY §4 전이 검증 원칙, VALIDATION_FRAMEWORK §7 "전이 성공률" 측정에 사용) |
| `ERROR_PATTERN` | 흔한 오류 패턴을 보여주는 콘텐츠(GRAMMAR_GRAPH §4.2 실수 처리 루프에서 학습자에게 "흔한 함정"으로 노출 가능) |

---

## 3. Media Asset 구조 (전달 매체 축)

`media_assets`는 **배열**이다. 단일 값이 아니라 배열로 설계한 것이 이 문서의 핵심 결정이다.

**채택 근거**: `media_format`을 단일 값으로 두면, 같은 대화문을 텍스트용·오디오용·영상용으로 각각 별도 Content로 만들어야 하며, 이 셋이 "같은 학습 목표의 다른 표현"이라는 사실이 데이터에 드러나지 않는다. 배열로 묶으면 Content 하나 = 학습 목표 하나라는 대응이 유지된다.

**Media Asset 필드**

| 필드 | 목적 | 제약 |
|---|---|---|
| `media_format` | 매체 종류 | `TEXT` \| `AUDIO` \| `IMAGE` \| `VIDEO` |
| `asset_ref` | 실제 자산의 위치(텍스트 본문 또는 파일 참조) | 필수 |
| `role`(선택) | 이 자산이 주(primary)인지 보조(supplementary)인지 | 없으면 `PRIMARY`로 간주 |
| `timing_metadata`(선택) | AUDIO/VIDEO 자산 내부의 구간·타임스탬프 정보(문장 단위 재생 구간 등) | `AUDIO`/`VIDEO`에서만 사용 |

**엔터티 분리 여부(결정, 낮은 위험도)**: 이번 버전에서는 Media Asset을 별도 엔터티로 분리하지 않고 **Content 내부에 내장된 배열**로 둔다. 여러 Content가 동일 Media Asset을 실제로 공유하는 사례가 아직 없기 때문이다(단순성 우선, PROJECT_VISION §2.2). 향후 공유 필요가 실증되면 그때 Concept/Grammar Node 분리 때와 같은 논리로 별도 엔터티로 승격한다.

**예시**
```
{
  "content_type": "DIALOGUE",
  "media_assets": [
    { "media_format": "TEXT", "asset_ref": "대화 스크립트 전문", "role": "PRIMARY" },
    { "media_format": "AUDIO", "asset_ref": "audio/vi_dialogue_003.mp3", "role": "SUPPLEMENTARY",
      "timing_metadata": { "segments": [{"speaker": "A", "start_ms": 0, "end_ms": 2100}] } }
  ]
}
```

---

## 4. Source & 생성 주체

| 필드 | 목적 | 값 |
|---|---|---|
| `source` | 이 Content를 누가/무엇이 만들었는가 | `HUMAN_AUTHORED` \| `AI_GENERATED` |
| `human_reviewed` | AI가 생성했더라도 사람이 검수했는가 | `boolean` — `source`와 독립적인 축(AI_GENERATED이면서 human_reviewed=true인 경우가 정상적인 품질 게이트 경로) |
| `is_canonical` | 같은 노드에 동일 `content_type`의 Content가 여럿일 때, 기본으로 노출할 대표 항목인가 | `boolean`, 노드+타입 조합당 최대 1개만 `true` |

---

## 5. 공통 Metadata

모든 `content_type`에 공통으로 적용되는 필드.

| 필드 | 목적 |
|---|---|
| `difficulty` | 이 Content 자체의 난이도(1~5). Grammar Node의 `difficulty`(GRAMMAR_SCHEMA §1)와 별개 — 같은 노드라도 난이도가 다른 여러 예문·문제를 만들 수 있다 |
| `meta_language` | 이 Content가 작성된 언어(목표 언어가 아니라 설명이 쓰인 언어, 예: 한국어 화자용이면 `KO`) |
| `version` | 정수, 8장 참조 |
| `author` | 사람 작성자 식별자 또는 AI 생성 시스템 식별자 |

---

## 6. Type-specific Optional Metadata

**특정 `content_type`에만 의미가 있는 필드는 공통 Metadata에 절대 섞지 않는다.** 해당 타입이 아닐 때는 필드 자체가 존재하지 않는다(null이 아니라 필드 부재).

| content_type | 전용 필드 |
|---|---|
| `EXPLANATION` | `explanation_level`(`BEGINNER`\|`INTERMEDIATE`\|`ADVANCED`) — 5장의 `difficulty`(콘텐츠 자체의 난이도)와는 다른 축이다. `difficulty`는 "이 문법이 얼마나 어려운가"를, `explanation_level`은 "이 설명문이 얼마나 쉬운 말로 쓰였는가"를 나타낸다 |
| `QUIZ` | `answer_key`(정답), `distractors`(객관식 오답 선택지 배열) |
| `DIALOGUE` | `speaker_roles`(화자 목록과 역할, 예: `["A: 손님", "B: 점원"]`) |
| `LISTENING` / `SHADOWING` | 별도 전용 필드 없음 — `media_assets` 배열 안의 `AUDIO` 항목과 그 `timing_metadata`(3장)를 그대로 사용한다. 동일 정보를 담는 필드를 두 곳에 만들지 않는다 |

---

## 7. Grammar Node ↔ Content 연결 규칙

- **참조 방향(재확인)**: `Content → Grammar Node` 단방향. Grammar Node는 자신과 연결된 Content 목록을 저장하지 않는다(GRAMMAR_SCHEMA §3 원칙 그대로 계승).
- **[변경] `grammar_node_ids`는 배열이다(단수 `grammar_node_id`에서 변경).** `EXPLANATION`/`EXAMPLE`/`QUIZ`처럼 하나의 노드만 다루는 Content는 배열에 원소가 1개만 있으면 된다. 하지만 `DIALOGUE`/`CONVERSATION_SEED`/`TRANSFER_EXERCISE`처럼 여러 문법이 자연스럽게 섞이는 콘텐츠 타입은 애초에 단일 참조로 표현할 수 없다. 이 변경은 GRAMMAR_SCHEMA §3에도 반영해 이 문서로 이관했다.
- **제약**: `grammar_node_ids`는 최소 1개 이상이어야 한다(9장 Validation).

---

## 8. Content Version 정책

Grammar Node/Concept의 ID와 Content의 ID는 안정성 요구가 다르다.

- Grammar Node·Concept는 "분류"가 거의 바뀌지 않으므로 ID가 곧 불변의 정체성이다.
- **Content는 `body`(실제 텍스트·자산)가 일상적으로, 의도적으로 개정된다**(오타 수정, 문구 개선, 난이도 조정). ID까지 바꾸면 그 Content를 참조하던 모든 곳(Progress 로그, Review 기록)이 끊어진다.

**정책**: Content ID는 IDENTIFIER_STANDARD.md의 ID Stability Principle에 따라 **발행 후 불변**이다. 대신 `version` 필드(정수)를 두어 개정마다 증가시킨다. 이전 버전 `body`를 보관할지는 이 문서에서 정하지 않고 HOW 단계(콘텐츠 관리 시스템)에서 결정한다 — 이 문서가 강제하는 것은 "ID는 유지, 버전은 증가"라는 원칙뿐이다.

---

## 9. Content Validation

3축(`content_type`/`media_assets`/`source`)은 원칙적으로 자유롭게 조합 가능하다. 다만 아래 조합 제약은 예외적으로 강제한다(VALIDATION_FRAMEWORK Level 0에 포함).

| 규칙 | 내용 |
|---|---|
| LISTENING/SHADOWING 필수 매체 | `content_type`이 `LISTENING` 또는 `SHADOWING`이면 `media_assets`에 `AUDIO` 항목이 최소 1개 있어야 한다 |
| QUIZ 필수 필드 | `content_type = QUIZ`이면 `answer_key`가 반드시 존재해야 한다 |
| DIALOGUE 최소 화자 수 | `content_type = DIALOGUE`이면 `speaker_roles`에 최소 2명이 있어야 한다 |
| Grammar Node 참조 | `grammar_node_ids`는 최소 1개 이상, 전부 존재하는 Grammar Node를 참조해야 한다 |
| Canonical 유일성 | 같은 (노드, content_type) 조합에서 `is_canonical = true`는 최대 1개 |

**자유 조합 예시(모두 유효)**: `EXPLANATION + TEXT + HUMAN_AUTHORED`, `DIALOGUE + TEXT/AUDIO + HUMAN_AUTHORED`, `QUIZ + IMAGE + HUMAN_AUTHORED`, `LISTENING + AUDIO + AI_GENERATED`, `SHADOWING + AUDIO/TEXT + HUMAN_AUTHORED`.

---

## 10. 금지 사항

- `content_type`에 매체 값(예: `AUDIO`, `IMAGE`)이나 생성 주체 값(예: `AI_GENERATED`)을 다시 섞어 넣는 것(3축 분리 원칙 위반)
- `LISTENING`/`SHADOWING`인데 `media_assets`에 `AUDIO`가 없는 것
- Type-specific 필드(`answer_key`, `speaker_roles` 등)를 공통 Metadata에 섞어 넣거나, 해당하지 않는 타입에 채워 넣는 것
- 동일 Media Asset을 재사용하겠다고 Content 전체를 복제하는 것 — 재사용이 필요해지면 3장의 승격 절차를 따른다
- Content `body`를 개정하면서 ID를 함께 바꾸는 것(8장 위반)
- `grammar_node_ids`가 빈 배열인 Content를 만드는 것

---

## 11. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 승인, Tier A 배치 확정 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — Content를 Learning Object로 정의, `content_type`(교육적 기능)/`media_assets`(전달 매체, 배열)/`source`(생성 주체) 3축 분리, Type-specific Optional Metadata 분리, `grammar_node_id`→`grammar_node_ids`(배열) 변경, Content Validation 규칙 정의. GRAMMAR_SCHEMA §3의 Content 정의를 이 문서로 완전 이관 |
