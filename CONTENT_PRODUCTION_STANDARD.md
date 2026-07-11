# CONTENT_PRODUCTION_STANDARD.md
## LLE Tier D 콘텐츠 제작 표준

> 이 문서는 `CONTENT_SCHEMA.md`(Tier A)가 정의한 필드 구조를 재정의하지 않는다. "그 구조로 실제로 어떻게 좋은 콘텐츠를 만드는가"만 다루는 Tier D 진입점이다.

문서 계층: Tier A `CONTENT_SCHEMA.md` → Tier D **`CONTENT_PRODUCTION_STANDARD.md`(이 문서)** → 실제 콘텐츠 본문(`VI_CONTENT.md` 등)

---

## 0. 문서의 지위

- Tier D의 진입점. `VI/EN/JA/ZH_CONTENT.md`가 이 문서의 표준을 따른다.
- `CONTENT_SCHEMA.md`의 필드 정의(10개 Content Type, 메타데이터 필드)를 그대로 전제하며 바꾸지 않는다.
- Tier A~C의 기존 원칙(SSOT, Learning Effect 우선, Content와 Grammar의 분리)을 그대로 유지한다 — 이 문서는 그 위에서 "제작 실무"만 추가한다.

---

## 1. 목적

Tier A~C가 "무엇을 배울 수 있는가"(Grammar)와 "어떻게 시스템이 동작하는가"(Engine/API/DB)를 정의했다면, 이 문서는 "실제로 좋은 학습 콘텐츠를 어떻게 채워 넣는가"를 정의한다. 콘텐츠 공백(`ladder_step=4`)이 실제 서비스에서 최대한 발생하지 않도록 하는 것이 이 문서의 실질적 목표다.

---

## 2. 콘텐츠 아키텍처(문서 구조)

### 2.1 언어별 CONTENT.md 파일 구조

기존 관례(`VI_CONTENT.md`, `EN_CONTENT.md` 등 언어별 단일 파일)를 유지한다. 파일을 노드별로 쪼개는 것은 이번 단계에서 하지 않는다 — 콘텐츠 총량이 지금 규모에서는 단일 파일 탐색이 더 단순하다(단순성 우선).

### 2.2 파일 내부 조직 기준 — Grammar Graph 선행관계(위상정렬)

노드는 `PREREQUISITE` 관계의 위상정렬 순서로 배치한다. 저자는 파일을 위에서 아래로 작업하면서 "이 다음에 뭘 써야 하는지"를 항상 알 수 있다. 이 순서는 §3.2(이미 배운 문법만 사용) 검증에도 그대로 활용된다 — 뒤에 나오는 노드를 참조하는 콘텐츠는 위치만으로 구조적 위반이 드러난다.

### 2.3 Content ID 명명 규칙 재확인

`IDENTIFIER_STANDARD.md`의 규칙을 그대로 따른다. 이 문서는 별도 규칙을 추가하지 않는다.

---

## 3. 콘텐츠 제작 표준(작성 규칙)

### 3.1 Content Type별 최소 요구량

노드당 최소 `EXPLANATION` 1개, `EXAMPLE` 1개, `QUIZ` 1개를 원칙으로 한다. 이 셋이 각각 `start_explicit_study`(설명), Generation Engine 사다리 3단계(예문 대체), `submit_attempt`용 사전 제작 문항의 최소 자원이 되기 때문이다. 그 외 Type(`MINIMAL_PAIR`, `DIALOGUE` 등)은 필요에 따라 추가한다.

### 3.2 "이미 배운 문법만 사용" 원칙의 인간 저자 적용

`AI_INTEGRATION_BRIEF.md`가 AI 생성물에 강제한 화이트리스트 원칙을 사람이 쓰는 콘텐츠에도 동일하게 적용한다. **대상 노드 X의 EXAMPLE/DIALOGUE는 X 자신과 X의 선행 노드(위상정렬상 X 이전)만으로 구성되어야 하며, X보다 뒤에 나오는 노드의 문법을 앞당겨 쓰지 않는다.** 2.2의 위상정렬 배치 덕분에 이 위반은 "지금 작업 중인 위치보다 아래에 있는 문법을 썼는가"로 구조적으로 확인 가능하다(§4.1 체크리스트 항목).

### 3.3 난이도 태깅 기준

기본값은 대상 Grammar Node의 `difficulty`를 그대로 물려받는다. `TRANSFER_EXERCISE`/`ERROR_PATTERN`은 같은 노드 대비 +1 단계까지 허용(더 어려운 것이 자연스러움), `MINIMAL_PAIR`는 도입 초기 학습을 돕기 위해 -1 단계까지 허용한다.

### 3.4 `meta_language` 사용 규칙

같은 Language Pack 안에서는 `meta_language`를 통일한다(예: VI_CONTENT 전체는 한국어 설명으로 통일). 여러 메타 언어를 혼용하지 않는다 — 필요해지면 별도 로케일 확장 결정이며 이 문서 범위 밖이다.

### 3.5 톤/스타일 가이드

- 교과서적으로 딱딱한 문장보다 실제 회화에 가까운 자연스러운 예문을 우선한다(PROJECT_VISION의 "실제 회화 능력" 목표와 직결).
- 특정 지역·문화에 편중된 소재를 피하고, 어느 학습자에게나 무난한 일상 소재를 우선한다.
- 존댓말/반말 등 격식 수준은 대상 노드가 PRAGMATICS Category와 직접 관련이 없는 한 중립(표준 격식)을 기본으로 한다.

### 3.6 `HUMAN_AUTHORED` vs `AI_GENERATED` 저작 구분

Tier D 제작 활동에서 만드는 콘텐츠는 원칙적으로 전부 `source = HUMAN_AUTHORED`다. `AI_GENERATED`는 Production 시스템이 실시간으로 만드는 것(`AI_INTEGRATION_BRIEF.md` 범위)이며 이 문서의 제작 대상이 아니다 — 다만 실시간 생성물 중 우수한 것을 저자가 선택해 Canonical 후보로 편입하는 경로는 있다(§5.2).

---

## 4. 콘텐츠 검증 절차

### 4.1 체크리스트

- `grammar_node_ids`가 실제 존재하는 노드를 참조하는가
- `content_type`이 10종 중 하나인가, `EXPLANATION`이면 `explanation_level`이 있는가
- **위상정렬 위반 없음**(§3.2) — 자신보다 뒤에 있는 노드의 문법을 앞당겨 쓰지 않았는가
- `meta_language`가 해당 Language Pack 전체와 일치하는가
- `difficulty`가 1~5 범위이고 §3.3 규칙과 크게 어긋나지 않는가
- (해당 시) `media_assets`의 `media_format`/`asset_ref`/`role` 구조가 맞는가

### 4.2 `VALIDATION_FRAMEWORK.md`와의 연계

이 체크리스트는 `VALIDATION_FRAMEWORK.md` Level 0(Schema Validation)의 Content 대상 항목으로 편입된다. 별도 검증 체계를 새로 만들지 않는다.

### 4.3 `canonical`/`human_reviewed` 플래그 부여 기준

`human_reviewed`는 원칙적으로 저자 본인이 아닌 별도 검수자가 부여한다. 팀 규모상 별도 검수자가 없다면, 저자가 작성 시점으로부터 최소 24시간 이상 지난 뒤 스스로 재검토하고 부여하는 것으로 대체한다(즉시 자기 검수는 놓치기 쉬우므로 최소한의 시간차를 둔다). 이 기준은 튜닝 가능하다.

### 4.4 `version` 증가 규칙 재확인

`CONTENT_SCHEMA.md` §8 그대로: Content ID는 불변이며, 내용을 고치면 새 레코드를 만드는 것이 아니라 같은 ID의 `version`을 올린다.

---

## 5. Content Lifecycle

`human_reviewed`/`is_canonical`(Tier A) + `is_active`(Tier C, `DATA_PERSISTENCE_BRIEF.md` §3.5) 세 필드의 조합으로 4단계를 표현한다.

### 5.1 상태 전이

```
Draft        (human_reviewed=false, is_canonical=false, is_active=true)
   ↓ 검수 통과(§4.3)
Reviewed     (human_reviewed=true,  is_canonical=false, is_active=true)
   ↓ Canonical 승격 조건 충족(§5.2)
Canonical    (human_reviewed=true,  is_canonical=true,  is_active=true)
   ↓ 대체 또는 폐기 결정
Deprecated   (is_active=false, is_canonical=false)
```

Draft에서 Canonical로 직접 승격하지 않는다 — 반드시 Reviewed를 거친다. Reviewed 상태에서도(한 번도 Canonical이 되지 못한 채) 더 나은 대체물이 채택되면 곧바로 Deprecated될 수 있다.

### 5.2 Canonical 승격 조건 — 출처 무관 동일 기준

`human_reviewed=true`가 유일한 필수 조건이다. **`source`가 `AI_GENERATED`라는 이유로 이 기준이 완화되지 않는다** — AI가 실시간 생성한 콘텐츠 중 우수한 것을 저자가 영구 자산으로 편입하고 싶다면, `HUMAN_AUTHORED` 콘텐츠와 동일하게 사람의 검수를 거쳐야 한다. 이미 해당 (node, content_type) 조합에 다른 Canonical이 있다면, 승격은 곧 교체를 의미하며 기존 Canonical은 같은 작업 안에서 Deprecated로 전환한다(`is_canonical` 자리는 항상 최대 1개, `CONTENT_SCHEMA.md` §9).

### 5.3 Deprecated 콘텐츠의 처리 원칙

**삭제하지 않는다.** `is_active=false`로 비활성화만 한다.

- **이유 1**: 이미 다른 사용자의 `attempt_records`가 이 `content_id`를 참조하고 있을 수 있다 — 삭제하면 그 학습 이력의 무결성이 깨진다.
- **이유 2**: 나중에 재활성화가 필요할 수 있다(신규 콘텐츠가 예상과 달리 문제가 있어 롤백하는 경우).
- **조회 규칙**: 모든 콘텐츠 조회는 `is_active=true`를 항상 조건에 포함해야 한다(`DATA_PERSISTENCE_BRIEF.md` §3.5에 이미 명시).

---

## 6. `VI_CONTENT.md` 착수 준비

`VI_LANGUAGE_PACK.md`의 Grammar Node를 §2.2 위상정렬 순서로 나열한 뒤, 맨 앞(선행 노드가 없는 노드)부터 §3.1 최소 요구량(EXPLANATION·EXAMPLE·QUIZ)을 채운다.

---

## 7. 금지 사항

- `CONTENT_SCHEMA.md`가 정의한 필드 구조를 이 문서 또는 실제 콘텐츠 작성 과정에서 임의로 확장하는 것
- 위상정렬상 자신보다 뒤에 있는 노드의 문법을 앞당겨 사용하는 것(§3.2 위반)
- 저자 본인이 작성 직후 스스로 `human_reviewed`를 부여하는 것(§4.3의 최소 시간차 없이)
- `AI_GENERATED` 콘텐츠를 검수 없이 Canonical로 승격하는 것(§5.2 위반)
- Deprecated 콘텐츠를 삭제하는 것(§5.3 위반)
- 여러 `meta_language`를 한 Language Pack 안에 혼용하는 것(§3.4 위반)

---

## 8. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — 콘텐츠 아키텍처(위상정렬 기반 파일 내부 조직), 제작 표준(최소 요구량, 이미 배운 문법만 사용 원칙의 인간 저자 적용, 난이도·메타언어·톤 가이드), 검증 절차(체크리스트, VALIDATION_FRAMEWORK 연계), Content Lifecycle(Draft→Reviewed→Canonical→Deprecated 4단계, 출처 무관 동일 승격 기준, 삭제 대신 비활성화 원칙) 정의. `content.is_active` 컬럼 필요성을 발견해 `DATA_PERSISTENCE_BRIEF.md` v1.5로 보완 |
