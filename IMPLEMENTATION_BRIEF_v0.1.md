# IMPLEMENTATION_BRIEF_v0.1.md
## LLE MVP 구현 지시서 (Architecture → Development)

> 이 문서는 코드가 아니라 **지시서**다. 실제 코드는 Development 프로젝트에서 작성한다.
> 상위 문서(`PROJECT_VISION.md`, `LEARNING_THEORY.md`, `CONCEPT_SCHEMA.md`, `GRAMMAR_SCHEMA.md`, `GRAMMAR_GRAPH.md`)가 최종 권위를 가지며, 이 브리프와 상위 문서가 충돌하면 **상위 문서가 우선**한다.

---

## 0. 문서의 지위

이 브리프는 다섯 개 Architecture 문서를 요약·재해석한 것이 아니라, 그중 **가장 작은 실행 가능한 조각만** 잘라내 구현 가능한 형태로 전달하는 문서다. 여기 없는 내용(다국어 확장, 실제 SRS 간격 계산, AI 문장 조합 생성, 로그인/서버 등)은 이번 MVP의 범위가 아니며, 없다고 해서 상위 문서가 틀렸다는 뜻이 아니다.

**구현 중 스키마에 없는 필드가 필요하다고 판단되면, 임의로 추가하지 말고 Architecture 프로젝트로 질문을 되돌린다.**

---

## 1. MVP 목적

이번 MVP가 검증하려는 것은 단 하나다.

> **Concept → Grammar Node → Relation → Content → Progress로 이어지는 데이터 구조가, 실제로 필터링·탐색·생성 로직 위에서 작동하는가?**

예쁜 화면이나 완성된 제품이 목적이 아니다. 데이터 구조가 살아있는 로직으로 굴러가는지 눈으로 확인하는 것이 유일한 목적이다.

---

## 2. 범위

### In Scope (10개)
1. Concept 데이터 샘플
2. Grammar Node 데이터 샘플
3. Relation 데이터 샘플
4. Content 데이터 샘플
5. 사용자 Progress 샘플
6. Grammar Graph 탐색 (선행 정방향/역방향)
7. Practicing 이상 필터
8. 단일 노드 문제 생성
9. 간단한 Review Cascade (2-hop)
10. 브라우저에서 실행 가능한 최소 UI

### Out of Scope (명시적으로 이번에 하지 않음)
- 둘 이상 노드를 조합하는 생성 (GRAMMAR_GRAPH §6.2의 1단계) — 이번엔 §6.2의 **2단계(단일 노드)까지만** 구현
- 오답 원인 분류(SELF/TRANSFER, GRAMMAR_GRAPH §4.2.1) — 이번 MVP는 모든 실패를 TRANSFER로 간주하고 항상 2-hop 역탐색을 수행한다 (아래 6.3 참조, 명시적 단순화)
- 실제 SRS 간격 계산, Confidence 행동 추론, Coverage/Depth 계산
- 다국어, 로그인, 서버/DB, 데이터 영속성(새로고침 시 초기화되어도 무방)
- 사전 제작 콘텐츠 Fallback(§6.2의 3~4단계), AI가 실제로 문장을 새로 "작문"하는 로직 — 이번엔 Content의 `EXAMPLE`을 그대로 노출하는 수준으로 대체

---

## 3. 기술 스택 및 제약

- **HTML + CSS + Vanilla JavaScript만 사용한다. 프레임워크·라이브러리·빌드 도구 없음.**
- 파일을 더블클릭해서 브라우저로 여는 것만으로 동작해야 한다(로컬 서버 불필요).
- **주의**: `file://` 프로토콜에서는 `fetch()`로 로컬 JSON 파일을 읽으면 브라우저 보안 정책 때문에 실패할 수 있다. 샘플 데이터는 별도 `.json`이 아니라 `const` 객체를 담은 `.js` 파일로 작성하고, `<script>` 태그로 순서대로 로드하는 방식을 권장한다.
- 데이터 영속성 불필요 — 메모리(변수)에만 있어도 된다. `localStorage`를 쓰더라도 필수는 아니다.

---

## 4. 샘플 데이터

아래 데이터는 **GRAMMAR_SCHEMA.md / CONCEPT_SCHEMA.md의 필드 정의를 그대로 따른다.** 필드를 추가·삭제하지 않는다. 언어는 베트남어(`VI`)로 고정.

### 4.1 Concept (2개)

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

*(MVP에서는 Concept 간 Prerequisite/Relationship을 비워둔다 — 스키마상 필드는 존재하되 이번 샘플에서는 사용하지 않는다.)*

### 4.2 Grammar Node (4개, 베트남어)

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

### 4.3 Grammar Relation (3개) — 2-hop 체인 + 대조 관계 포함

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

**의도된 체인**: `GRAMMAR_VI_DA_TUNG → GRAMMAR_VI_VUA_MOI → GRAMMAR_VI_DA` (정확히 2단계). 이 체인이 2-hop Cascade 테스트의 핵심 데이터다.

### 4.4 Content (4개)

```json
[
  {
    "id": "CONTENT_VI_DA_EXPL_KO_BEGINNER",
    "grammar_node_id": "GRAMMAR_VI_DA",
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "meta_language": "KO",
    "body": "'đã'는 동사 앞에 붙어 이미 끝난 일을 나타냅니다.",
    "source": "HUMAN_AUTHORED"
  },
  {
    "id": "CONTENT_VI_DA_EXAMPLE_1",
    "grammar_node_id": "GRAMMAR_VI_DA",
    "content_type": "EXAMPLE",
    "meta_language": "KO",
    "body": "Tôi đã ăn cơm. (나는 밥을 먹었다.)",
    "source": "HUMAN_AUTHORED"
  },
  {
    "id": "CONTENT_VI_DANG_EXPL_KO_BEGINNER",
    "grammar_node_id": "GRAMMAR_VI_DANG",
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "meta_language": "KO",
    "body": "'đang'은 동사 앞에 붙어 지금 진행 중인 일을 나타냅니다.",
    "source": "HUMAN_AUTHORED"
  },
  {
    "id": "CONTENT_VI_DANG_EXAMPLE_1",
    "grammar_node_id": "GRAMMAR_VI_DANG",
    "content_type": "EXAMPLE",
    "meta_language": "KO",
    "body": "Tôi đang ăn cơm. (나는 밥을 먹고 있다.)",
    "source": "HUMAN_AUTHORED"
  }
]
```

### 4.5 User Progress (테스트 유저 1명, 노드 4개)

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

`GRAMMAR_VI_DA_TUNG`은 Progress가 없는 것이 아니라 `STUDYING`으로 설정되어 있다 — "실패 시뮬레이션" 버튼을 눌러볼 대상이기 때문이다(6.3 참조). Progress 레코드 자체가 없는 노드는 `NOT_INTRODUCED`로 취급한다.

---

## 5. 구현 기능 명세

### 5.1 Grammar Graph 탐색 (GRAMMAR_GRAPH §3)

- **선행 정방향 탐색**: 노드 ID를 입력받아, 그 노드가 `from_node_id`인 `PREREQUISITE` Relation을 따라 `to_node_id`들을 반환
- **선행 역방향 탐색**: 노드 ID를 입력받아, 그 노드가 `to_node_id`인 `PREREQUISITE` Relation을 따라 `from_node_id`들을 반환 (Cascade Engine이 사용하는 방향)
- 두 함수 모두 `max_depth` 파라미터를 받아 지정된 깊이까지만 탐색한다 (기본값 없이 호출부에서 명시)

### 5.2 Practicing 이상 필터 (GRAMMAR_SCHEMA §7)

- 입력: 사용자 ID, 언어
- 처리: 해당 사용자·언어의 모든 Progress 중 `state`가 `PRACTICING`, `MASTERED`, `AUTOMATIC` 중 하나인 노드만 남긴다
- 출력: 노드 ID 목록 (예시 데이터 기준으로는 `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`만 통과해야 한다)

### 5.3 단일 노드 문제 생성 (GRAMMAR_GRAPH §6.2, 2단계만)

- 5.2의 결과 목록에서 노드 하나를 선택(무작위 또는 순차, 구현 자유)
- 선택된 노드의 `content_id`(§4.4에서 `content_type = EXAMPLE`이고 `grammar_node_id`가 일치하는 것)를 찾아 화면에 표시
- **[제약] 필터를 통과하지 못한 노드(`GRAMMAR_VI_VUA_MOI`, `GRAMMAR_VI_DA_TUNG`)는 이 목록에 절대 나타나서는 안 된다.**

### 5.4 Review Cascade — 2-hop (GRAMMAR_GRAPH §5)

- **트리거**: 화면에 "오답 처리" 버튼을 두고, 사용자가 대상 노드를 선택 후 누르면 실행
- **동작**:
  1. 선택된 노드에서 선행 역방향 탐색을 `max_depth = 2`로 실행
  2. 결과 노드들을 "복습 대상"으로 화면에 순서대로(가까운 것부터) 출력
- **검증 시나리오**: `GRAMMAR_VI_DA_TUNG`을 대상으로 "오답 처리"를 누르면 → `GRAMMAR_VI_VUA_MOI`(1-hop) → `GRAMMAR_VI_DA`(2-hop) 순서로 정확히 2개만 나와야 하고, `GRAMMAR_VI_DA`보다 더 앞은 없으므로(선행 없음) 자연스럽게 탐색이 끝나야 한다.

### 5.5 MVP 단순화 사항 (명시적으로 구현하지 않는 것)

- 오답 원인 분류(SELF/TRANSFER)는 구현하지 않는다. "오답 처리" 버튼을 누르면 **항상 TRANSFER로 간주**하고 곧바로 역탐색을 수행한다.
- 상태 전이 로직(예: 복습 성공 시 상태 상승)은 구현하지 않는다. Progress는 §4.5의 고정값을 그대로 조회만 한다.

---

## 6. 최소 UI 요구사항

우선순위 최하위(PROJECT_VISION §2.2)인 만큼 꾸미지 않는다. 다음 네 블록이 한 화면에 보이면 충분하다.

1. **노드 목록 패널**: 4개 Grammar Node와 각각의 현재 `state`를 텍스트로 표시
2. **"문제 생성" 버튼**: 누르면 5.3 로직 실행 결과(선택된 노드 + 그 노드의 예문 Content)를 화면에 표시
3. **"오답 처리" 대상 선택 + 버튼**: 노드를 하나 고르고 누르면 5.4 로직 실행 결과(Cascade 목록)를 화면에 순서대로 표시
4. **디버그 출력 영역**: 현재 로드된 Concept/Node/Relation/Progress 데이터 개수, 혹은 선택 시 원본 JSON을 그대로 보여주는 영역(검증 편의용, 브라우저 개발자 콘솔 `console.log`로 대체해도 무방)

---

## 7. 완료 기준 (Definition of Done)

- [ ] 샘플 데이터 5종이 스키마 필드와 정확히 일치하는 구조로 로드된다
- [ ] Practicing 이상 필터가 `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`만 통과시키고 나머지 2개는 제외한다
- [ ] "문제 생성" 결과가 항상 필터를 통과한 노드 중에서만 나온다
- [ ] `GRAMMAR_VI_DA_TUNG`에서 "오답 처리" 실행 시 `GRAMMAR_VI_VUA_MOI` → `GRAMMAR_VI_DA` 순서로 정확히 2개, 그 이상은 나오지 않는다
- [ ] `npm install`, 번들러, 서버 없이 `.html` 파일을 브라우저로 열기만 해도 전체 기능이 동작한다

---

## 8. 상위 문서에서 상속되는 제약 (요약 재확인)

- Concept ← Grammar Node, Grammar Node ← Content, Grammar Node ← Relation 참조는 항상 단방향이다. 역방향 목록을 어느 엔터티에도 저장하지 않는다.
- 사용자 진행 상태는 Progress에만 존재한다. Grammar Node 객체에 상태를 직접 써넣지 않는다.
- `PREREQUISITE` 관계는 항상 `UNIDIRECTIONAL`이다.
- AI Generation Engine의 필터 우선순위(GRAMMAR_GRAPH §6.1)는 이번 MVP에서 1번(Practicing 이상)만 구현하지만, 이후 다른 필터가 추가되더라도 **1번보다 먼저 실행되는 필터는 있을 수 없다**는 순서 원칙은 지금부터 지킨다.

---

## 9. Architecture 프로젝트와의 관계

- 이 브리프와 상위 5개 문서가 충돌하면 상위 문서가 우선한다.
- 구현 중 "이 필드가 없어서 못 만들겠다"는 상황이 생기면, 임의로 필드를 추가하지 말고 Architecture 프로젝트로 질문을 되돌린다.
- MVP 완료 후 다음 단계(조합 생성, 오답 원인 분류, SRS 간격 계산 등)는 이 브리프의 v0.2 이후로 순차 확장한다.

---

## 10. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 최초 작성 — MVP 범위 10개 항목, 베트남어 샘플 데이터(Concept 2, Node 4, Relation 3, Content 4, Progress 4), 2-hop Cascade 테스트 시나리오, 최소 UI 요구사항, 완료 기준 정의 |
