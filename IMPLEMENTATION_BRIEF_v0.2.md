# IMPLEMENTATION_BRIEF_v0.2.md
## LLE MVP 구현 지시서 (Architecture → Development) — CONTENT_SCHEMA v1.0 반영 패치

> 이 문서는 코드가 아니라 **지시서**다. 실제 코드는 Development 프로젝트에서 작성한다.
> 상위 문서(`PROJECT_VISION.md`, `LEARNING_THEORY.md`, `CONCEPT_SCHEMA.md`, `GRAMMAR_SCHEMA.md`, `GRAMMAR_GRAPH.md`, `CONTENT_SCHEMA.md`)가 최종 권위를 가지며, 이 브리프와 상위 문서가 충돌하면 **상위 문서가 우선**한다.

**이 패치의 목적**: v0.1 작성 이후 CONTENT_SCHEMA.md(Tier A)가 신설되면서 Content 구조가 바뀌었다. v0.1의 Content 예시는 이제 구 버전 구조(`grammar_node_id` 단수, `body` 단일 필드)를 쓰고 있어 최신 표준과 어긋난다. 이 문서는 **Content 데이터 구조만** 패치하며, 나머지 범위(Grammar Graph 탐색, 필터, Cascade, UI)는 v0.1과 완전히 동일하다.

---

## 0. 문서의 지위

이 브리프는 여섯 개 Architecture 문서를 요약·재해석한 것이 아니라, 그중 **가장 작은 실행 가능한 조각만** 잘라내 구현 가능한 형태로 전달하는 문서다. 여기 없는 내용(다국어 확장, 실제 SRS 간격 계산, AI 문장 조합 생성, 로그인/서버 등)은 이번 MVP의 범위가 아니며, 없다고 해서 상위 문서가 틀렸다는 뜻이 아니다.

**구현 중 스키마에 없는 필드가 필요하다고 판단되면, 임의로 추가하지 말고 Architecture 프로젝트로 질문을 되돌린다.**

---

## 1. MVP 목적

이번 MVP가 검증하려는 것은 단 하나다.

> **Concept → Grammar Node → Relation → Content → Progress로 이어지는 데이터 구조가, 실제로 필터링·탐색·생성 로직 위에서 작동하는가?**

예쁜 화면이나 완성된 제품이 목적이 아니다. 데이터 구조가 살아있는 로직으로 굴러가는지 눈으로 확인하는 것이 유일한 목적이다. (v0.1과 동일)

---

## 2. 범위

### In Scope (10개, v0.1과 동일)
1. Concept 데이터 샘플
2. Grammar Node 데이터 샘플
3. Relation 데이터 샘플
4. Content 데이터 샘플 **(구조 패치, 4장 참조)**
5. 사용자 Progress 샘플
6. Grammar Graph 탐색 (선행 정방향/역방향)
7. Practicing 이상 필터
8. 단일 노드 문제 생성
9. 간단한 Review Cascade (2-hop)
10. 브라우저에서 실행 가능한 최소 UI

### Out of Scope (v0.1과 동일)
- 둘 이상 노드를 조합하는 생성 (GRAMMAR_GRAPH §6.2의 1단계) — 이번엔 §6.2의 **2단계(단일 노드)까지만** 구현
- 오답 원인 분류(SELF/TRANSFER, GRAMMAR_GRAPH §4.2.1) — 이번 MVP는 모든 실패를 TRANSFER로 간주하고 항상 2-hop 역탐색을 수행한다
- 실제 SRS 간격 계산, Confidence 행동 추론, Coverage/Depth 계산
- 다국어, 로그인, 서버/DB, 데이터 영속성
- 사전 제작 콘텐츠 Fallback(§6.2의 3~4단계), AI 실제 작문 로직
- **Content의 신규 필드(`difficulty`, `human_reviewed`, `is_canonical`, `version`, `author`)를 실제 로직에서 활용하는 것** — 이번 패치는 구조만 맞추며, 이 필드들을 사용하는 기능은 구현하지 않는다(11장 참조)

---

## 3. 기술 스택 및 제약 (v0.1과 동일, 변경 없음)

- **HTML + CSS + Vanilla JavaScript만 사용한다. 프레임워크·라이브러리·빌드 도구 없음.**
- 파일을 더블클릭해서 브라우저로 여는 것만으로 동작해야 한다.
- 샘플 데이터는 `.js` 파일에 `const` 객체로 작성하고 `<script>` 태그로 로드한다(`file://`의 `fetch()` 제약 회피).
- 데이터 영속성 불필요.

---

## 4. 샘플 데이터

아래 데이터는 **GRAMMAR_SCHEMA.md / CONCEPT_SCHEMA.md / CONTENT_SCHEMA.md의 필드 정의를 그대로 따른다.** 필드를 추가·삭제하지 않는다. 언어는 베트남어(`VI`)로 고정.

### 4.1 Concept (2개, v0.1과 동일 — 변경 없음)

```json
[
  {
    "id": "CONCEPT_TENSE_PAST",
    "category": "TENSE",
    "function": "PAST",
    "difficulty": 2,
    "prerequisite_concept_ids": [],
    "relationships": []
  },
  {
    "id": "CONCEPT_ASPECT_PROGRESSIVE",
    "category": "ASPECT",
    "function": "PROGRESSIVE",
    "difficulty": 2,
    "prerequisite_concept_ids": [],
    "relationships": []
  }
]
```

### 4.2 Grammar Node (4개, v0.1과 동일 — 변경 없음)

```json
[
  {
    "id": "GRAMMAR_VI_DA",
    "language": "VI",
    "concept_ids": ["CONCEPT_TENSE_PAST"],
    "label": "đã (과거 시제 표지)",
    "surface_forms": ["đã"],
    "difficulty": 1
  },
  {
    "id": "GRAMMAR_VI_DANG",
    "language": "VI",
    "concept_ids": ["CONCEPT_ASPECT_PROGRESSIVE"],
    "label": "đang (진행 표지)",
    "surface_forms": ["đang"],
    "difficulty": 1
  },
  {
    "id": "GRAMMAR_VI_VUA_MOI",
    "language": "VI",
    "concept_ids": ["CONCEPT_TENSE_PAST"],
    "label": "vừa mới (방금 ~했다)",
    "surface_forms": ["vừa mới", "vừa"],
    "difficulty": 2
  },
  {
    "id": "GRAMMAR_VI_DA_TUNG",
    "language": "VI",
    "concept_ids": ["CONCEPT_TENSE_PAST"],
    "label": "đã từng (~한 적이 있다)",
    "surface_forms": ["đã từng"],
    "difficulty": 3
  }
]
```

### 4.3 Grammar Relation (3개, v0.1과 동일 — 변경 없음)

```json
[
  {
    "id": "REL_VUAMOI_PREREQ_DA",
    "from_node_id": "GRAMMAR_VI_VUA_MOI",
    "to_node_id": "GRAMMAR_VI_DA",
    "relation_type": "PREREQUISITE",
    "direction": "UNIDIRECTIONAL",
    "weight": 0.9,
    "description": "'vừa mới'는 기본 과거 표지 'đã' 학습 이후 도입"
  },
  {
    "id": "REL_DATUNG_PREREQ_VUAMOI",
    "from_node_id": "GRAMMAR_VI_DA_TUNG",
    "to_node_id": "GRAMMAR_VI_VUA_MOI",
    "relation_type": "PREREQUISITE",
    "direction": "UNIDIRECTIONAL",
    "weight": 0.8,
    "description": "경험 표현 'đã từng'은 'vừa mới' 이후 도입 (2-hop 테스트용 체인)"
  },
  {
    "id": "REL_DA_CONTRAST_DANG",
    "from_node_id": "GRAMMAR_VI_DA",
    "to_node_id": "GRAMMAR_VI_DANG",
    "relation_type": "CONTRAST",
    "direction": "BIDIRECTIONAL",
    "weight": 0.5,
    "description": "시제 표지와 상 표지는 초급자가 혼동하기 쉬움"
  }
]
```

**의도된 체인**: `GRAMMAR_VI_DA_TUNG → GRAMMAR_VI_VUA_MOI → GRAMMAR_VI_DA` (정확히 2단계).

### 4.4 Content (4개) — **[패치됨] CONTENT_SCHEMA v1.0 구조 반영**

**변경 요약**: `grammar_node_id`(단수) → `grammar_node_ids`(배열), `body`(단일 필드) → `media_assets`(배열) 안의 `asset_ref`, 공통 Metadata(`difficulty`/`human_reviewed`/`is_canonical`/`version`/`author`) 추가.

```json
[
  {
    "id": "CONTENT_VI_DA_EXPL_KO_BEGINNER",
    "grammar_node_ids": ["GRAMMAR_VI_DA"],
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "'đã'는 동사 앞에 붙어 이미 끝난 일을 나타냅니다.", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DA_EXAMPLE_1",
    "grammar_node_ids": ["GRAMMAR_VI_DA"],
    "content_type": "EXAMPLE",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "Tôi đã ăn cơm. (나는 밥을 먹었다.)", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DANG_EXPL_KO_BEGINNER",
    "grammar_node_ids": ["GRAMMAR_VI_DANG"],
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "'đang'은 동사 앞에 붙어 지금 진행 중인 일을 나타냅니다.", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DANG_EXAMPLE_1",
    "grammar_node_ids": ["GRAMMAR_VI_DANG"],
    "content_type": "EXAMPLE",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "Tôi đang ăn cơm. (나는 밥을 먹고 있다.)", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  }
]
```

**단일 노드 원칙 유지**: 이번 MVP의 모든 Content는 `grammar_node_ids` 배열에 원소가 **정확히 1개**뿐이다. `DIALOGUE`처럼 여러 노드를 참조하는 콘텐츠 타입은 이번 MVP 범위 밖(2장 Out of Scope)이므로, 배열 구조는 도입하되 실제로는 항상 1개짜리 배열만 등장한다 — 기존 MVP 로직이 깨지지 않는 이유다.

### 4.5 User Progress (4개, v0.1과 동일 — 변경 없음)

```json
[
  {
    "user_id": "u_test",
    "node_id": "GRAMMAR_VI_DA",
    "state": "MASTERED",
    "explicit_study_event_at": "2026-06-01T00:00:00Z"
  },
  {
    "user_id": "u_test",
    "node_id": "GRAMMAR_VI_DANG",
    "state": "PRACTICING",
    "explicit_study_event_at": "2026-06-10T00:00:00Z"
  },
  {
    "user_id": "u_test",
    "node_id": "GRAMMAR_VI_VUA_MOI",
    "state": "STUDYING",
    "explicit_study_event_at": "2026-06-20T00:00:00Z"
  },
  {
    "user_id": "u_test",
    "node_id": "GRAMMAR_VI_DA_TUNG",
    "state": "STUDYING",
    "explicit_study_event_at": "2026-06-25T00:00:00Z"
  }
]
```

---

## 5. 구현 기능 명세

### 5.1 Grammar Graph 탐색 (GRAMMAR_GRAPH §3) — v0.1과 동일

- **선행 정방향 탐색**: 노드 ID를 입력받아, 그 노드가 `from_node_id`인 `PREREQUISITE` Relation을 따라 `to_node_id`들을 반환
- **선행 역방향 탐색**: 노드 ID를 입력받아, 그 노드가 `to_node_id`인 `PREREQUISITE` Relation을 따라 `from_node_id`들을 반환 (Cascade Engine이 사용하는 방향)
- 두 함수 모두 `max_depth` 파라미터를 받아 지정된 깊이까지만 탐색한다

### 5.2 Practicing 이상 필터 (GRAMMAR_SCHEMA §7) — v0.1과 동일

- 입력: 사용자 ID, 언어
- 처리: 해당 사용자·언어의 모든 Progress 중 `state`가 `PRACTICING`, `MASTERED`, `AUTOMATIC` 중 하나인 노드만 남긴다
- 출력: 노드 ID 목록 (`GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`만 통과)

### 5.3 단일 노드 문제 생성 (GRAMMAR_GRAPH §6.2, 2단계만) — **[패치됨]**

- 5.2의 결과 목록에서 노드 하나를 선택(무작위 또는 순차, 구현 자유)
- **[변경]** 선택된 노드의 Content를 찾을 때, `content_type = EXAMPLE`이고 **`grammar_node_ids` 배열이 해당 노드 ID를 포함하는 것**을 찾는다(v0.1에서는 `grammar_node_id`가 정확히 일치하는 것을 찾았다 — 이제는 "포함 여부"로 바뀐다)
- **[변경]** 화면에 표시할 텍스트는 Content의 `body`가 아니라 **`media_assets` 배열에서 `media_format = TEXT`인 항목의 `asset_ref`**다
- **[제약, 동일]** 필터를 통과하지 못한 노드(`GRAMMAR_VI_VUA_MOI`, `GRAMMAR_VI_DA_TUNG`)는 이 목록에 절대 나타나서는 안 된다

### 5.4 Review Cascade — 2-hop (GRAMMAR_GRAPH §5) — v0.1과 동일

- **트리거**: "오답 처리" 버튼, 대상 노드 선택 후 실행
- **동작**: 선택된 노드에서 선행 역방향 탐색을 `max_depth = 2`로 실행, 결과를 순서대로 출력
- **검증 시나리오**: `GRAMMAR_VI_DA_TUNG` → `GRAMMAR_VI_VUA_MOI`(1-hop) → `GRAMMAR_VI_DA`(2-hop) 순서로 정확히 2개

### 5.5 MVP 단순화 사항 — v0.1과 동일

- 오답 원인 분류(SELF/TRANSFER)는 구현하지 않는다 — 항상 TRANSFER로 간주
- 상태 전이 로직은 구현하지 않는다 — Progress는 §4.5 고정값을 조회만 한다

---

## 6. 최소 UI 요구사항 (v0.1과 동일, 변경 없음)

1. **노드 목록 패널**: 4개 Grammar Node와 각각의 현재 `state`를 텍스트로 표시
2. **"문제 생성" 버튼**: 5.3 결과(선택된 노드 + 그 노드의 예문 텍스트 — 이제 `media_assets`에서 추출)를 표시
3. **"오답 처리" 대상 선택 + 버튼**: 5.4 결과(Cascade 목록)를 순서대로 표시
4. **디버그 출력 영역**: 로드된 데이터 개수 또는 원본 JSON 확인용

---

## 7. 완료 기준 (Definition of Done)

- [ ] 샘플 데이터 5종이 스키마 필드와 정확히 일치하는 구조로 로드된다
- [ ] Practicing 이상 필터가 `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`만 통과시키고 나머지 2개는 제외한다
- [ ] "문제 생성" 결과가 항상 필터를 통과한 노드 중에서만 나온다
- [ ] **[신규]** Content 조회가 `grammar_node_ids` 배열 기반으로 정상 동작한다(배열에 포함 여부로 매칭, 단순 일치 비교가 아님)
- [ ] **[신규]** "문제 생성" 결과 텍스트가 `media_assets[].asset_ref`(TEXT 항목)에서 정상적으로 추출된다
- [ ] `GRAMMAR_VI_DA_TUNG`에서 "오답 처리" 실행 시 `GRAMMAR_VI_VUA_MOI` → `GRAMMAR_VI_DA` 순서로 정확히 2개, 그 이상은 나오지 않는다
- [ ] `npm install`, 번들러, 서버 없이 `.html` 파일을 브라우저로 열기만 해도 전체 기능이 동작한다

---

## 8. 상위 문서에서 상속되는 제약 (요약 재확인)

- Concept ← Grammar Node, Grammar Node ← Content, Grammar Node ← Relation 참조는 항상 단방향이다. 역방향 목록을 어느 엔터티에도 저장하지 않는다.
- **[갱신]** Content → Grammar Node 참조는 배열(`grammar_node_ids`)이다 — 하나의 Content가 여러 노드를 참조할 수 있는 구조이나, 이번 MVP에서는 항상 1개짜리 배열만 사용한다.
- 사용자 진행 상태는 Progress에만 존재한다. Grammar Node 객체에 상태를 직접 써넣지 않는다.
- `PREREQUISITE` 관계는 항상 `UNIDIRECTIONAL`이다.
- AI Generation Engine의 필터 우선순위(GRAMMAR_GRAPH §6.1)는 이번 MVP에서 1번(Practicing 이상)만 구현하지만, 이후 다른 필터가 추가되더라도 1번보다 먼저 실행되는 필터는 있을 수 없다.

---

## 9. Architecture 프로젝트와의 관계

- 이 브리프와 상위 문서가 충돌하면 상위 문서가 우선한다.
- 구현 중 "이 필드가 없어서 못 만들겠다"는 상황이 생기면, 임의로 필드를 추가하지 말고 Architecture 프로젝트로 질문을 되돌린다.
- MVP 완료 후 다음 단계(조합 생성, 오답 원인 분류, SRS 간격 계산, `media_assets`의 AUDIO/IMAGE 실제 활용 등)는 이 브리프의 v0.3 이후로 순차 확장한다.

---

## 10. v0.1 → v0.2 변경 사항 정리

| 항목 | v0.1 | v0.2 |
|---|---|---|
| Content-Node 참조 | `grammar_node_id`(문자열, 단수) | `grammar_node_ids`(배열, 최소 1개) |
| Content 본문 | `body`(단일 문자열 필드) | `media_assets[]` 배열 안의 `asset_ref`(TEXT 타입) |
| Content 공통 Metadata | `explanation_level`, `meta_language`만 존재 | `difficulty`, `human_reviewed`, `is_canonical`, `version`, `author` 추가(CONTENT_SCHEMA §4~5) |
| 매칭 로직(5.3) | `grammar_node_id`와 정확히 일치 | `grammar_node_ids` 배열에 포함되는지 확인 |
| 영향받지 않은 부분 | Concept, Grammar Node, Relation, Progress 구조 및 5.1/5.2/5.4/5.5 로직, UI 전체, 완료 기준의 Graph/필터/Cascade 관련 항목 | 동일 |

---

## 11. Development 반영 가이드 (수정 체크리스트)

이미 v0.1 기준으로 구현을 시작했다면 아래 세 가지만 고치면 된다. 그 외 로직은 전혀 영향받지 않는다.

1. **Content 접근 코드에서 `.grammar_node_id` 참조를 찾아 `.grammar_node_ids`(배열) 기반 로직으로 변경.** MVP 범위에서는 항상 배열 원소가 1개이므로, 가장 간단한 마이그레이션은 "배열에 포함되는가"로 조건을 바꾸는 것이다(`.grammar_node_ids[0]`으로 단순 접근해도 이번 MVP 데이터에서는 동작하지만, 배열 전체를 확인하는 방식을 권장한다 — 향후 다중 노드 Content 확장 시 재작업이 없다).
2. **Content의 텍스트 추출 코드에서 `.body` 참조를 `.media_assets`에서 `media_format === "TEXT"`인 항목의 `.asset_ref`로 변경.**
3. **신규 필드(`difficulty`, `human_reviewed`, `is_canonical`, `version`, `author`)는 데이터에는 포함하되, 이번 MVP 로직에서 읽거나 사용할 필요는 없다.** UI에 노출하지 않아도 무방하다(디버그 출력 영역에서 원본 JSON을 그대로 보여준다면 자연히 함께 보일 뿐이다).

이 세 가지 외에 Grammar Graph 탐색, 필터, Cascade, UI 로직은 v0.1 그대로 유지한다.

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 최초 작성 — MVP 범위 10개 항목, 베트남어 샘플 데이터, 2-hop Cascade 테스트 시나리오, 최소 UI 요구사항, 완료 기준 정의 |
| 0.2 | 2026-07-06 | CONTENT_SCHEMA.md v1.0 반영 패치 — Content의 `grammar_node_id`(단수)를 `grammar_node_ids`(배열)로, `body`를 `media_assets[].asset_ref`로 변경. 공통 Metadata 필드(difficulty/human_reviewed/is_canonical/version/author) 추가. 5.3 매칭 로직과 완료 기준 갱신. Grammar Graph/필터/Cascade/UI 로직은 변경 없음 |
