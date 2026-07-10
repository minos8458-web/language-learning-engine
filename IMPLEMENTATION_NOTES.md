# IMPLEMENTATION_NOTES.md — LLE MVP v0.1

기준 문서: `IMPLEMENTATION_BRIEF_v0.1.md`. 상위 5개 Architecture 문서(PROJECT_VISION / LEARNING_THEORY / CONCEPT_SCHEMA / GRAMMAR_SCHEMA / GRAMMAR_GRAPH)와 충돌 시 상위 문서가 우선.

> 표준 변경의 사유·영향 범위·체크리스트는 `MIGRATION_GUIDE.md`(Architecture 소유)가 기준 문서다. 이 문서는 실제 수정 파일과 테스트 결과만 기록한다.

## 1. prerequisite 탐색 함수명 변경 (2026-07-06)

`traversePrerequisiteForward`/`Backward` → `traversePrerequisiteRequires`/`RequiredBy` 리네이밍. 탐색 로직 자체는 무변경. 수정 파일: `js/graphEngine.js`, `js/cascadeEngine.js`. 회귀 테스트 재통과.

사유·근거·상세 체크리스트는 `MIGRATION_GUIDE.md` §5.1 참고.

## 2. 완료 기준 (Definition of Done) 체크

- [x] 샘플 데이터 5종(Concept 2 / Grammar Node 4 / Relation 3 / Content 4 / Progress 4)이 스키마 필드와 정확히 일치 — 필드 추가/삭제 없음
- [x] Practicing 이상 필터 → `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`만 통과 (자동 테스트로 검증)
- [x] "문제 생성" 결과가 필터 통과 노드 중에서만 나옴 (30회 반복 테스트로 검증)
- [x] `GRAMMAR_VI_DA_TUNG` 오답 처리 → `GRAMMAR_VI_VUA_MOI` → `GRAMMAR_VI_DA` 순서로 정확히 2개 (자동 테스트로 검증)
- [x] 서버/번들러 없이 `index.html` 더블클릭만으로 전체 기능 동작 (script 태그 순서 로드, fetch 미사용)

## 3. 범위 준수 확인

- 브리프 §2 Out of Scope 10개 항목(2개 이상 노드 조합 생성, 오답 원인 SELF/TRANSFER 분류, 실제 SRS 계산, 다국어/로그인/서버, 콘텐츠 Fallback·AI 작문 생성 등) **일체 구현하지 않음**.
- "오답 처리"는 항상 TRANSFER로 간주 후 2-hop 역탐색만 수행 (§5.5 명시적 단순화 그대로).
- Concept의 `prerequisite_concept_ids` / `relationships`는 스키마 필드만 유지하고 비워둠(§4.1).

## 4. 파일 구조

```
lle-mvp/
├── index.html              # UI 진입점
├── css/style.css           # 최소 스타일
├── data/*.js               # 순수 데이터 (concepts/grammarNodes/relations/contents/progress)
├── js/graphEngine.js       # §5.1 정방향/역방향 선행 탐색 (BFS)
├── js/filterEngine.js      # §5.2 Practicing 이상 필터
├── js/generationEngine.js  # §5.3 단일 노드 문제 생성
├── js/cascadeEngine.js     # §5.4 2-hop Review Cascade
└── js/ui.js                # DOM 렌더링/이벤트 — data와 engine을 조립하는 유일한 지점
```

설계 원칙: `data/*`는 로직 없이 상수만. `js/graphEngine.js`, `filterEngine.js`, `generationEngine.js`, `cascadeEngine.js`는 전역 배열을 직접 참조하지 않고 파라미터로 받는 순수 함수로 작성 — 결합도 최소화, 단위 테스트 용이성 확보.

## 5. 테스트 방법 (다음 세션에서 재검증 시)

`data/*.js` + `js/graphEngine.js` + `js/filterEngine.js` + `js/generationEngine.js` + `js/cascadeEngine.js`를 순서대로 하나의 파일로 합쳐 Node.js로 실행하면 브라우저 없이 로직만 검증 가능 (DOM 의존 없음). 실제 실행은 `index.html`을 브라우저로 열면 됨.

## 6. 다음 단계 (v0.2 이후, 이번 범위 아님)

- 2단계(단일 노드) → 1단계(조합 생성)로 확장
- 오답 원인 SELF/TRANSFER 분류 도입

## 7. 변경 이력

- 2026-07-06: prerequisite 함수명 리네이밍 적용. 회귀 테스트 재통과. (§1, `MIGRATION_GUIDE.md` §5.1)
- 2026-07-06: IMPLEMENTATION_BRIEF_v0.2 패치 적용. 회귀 테스트 재통과. (§8, `MIGRATION_GUIDE.md` §5.2)

## 8. v0.2 패치 — 수정 내용 및 테스트 결과

**수정 파일**: `data/contents.js`, `js/generationEngine.js`, `js/ui.js`(문제 생성 결과 표시부만, UI 블록 구조 미변경)

**변경 내용 요약**: `grammar_node_id`(string) → `grammar_node_ids`(array), `body`(string) → `media_assets`(array)의 `asset_ref`, 매칭 로직 `===` → `.includes()`. (변경 사유·Breaking 여부·체크리스트는 `MIGRATION_GUIDE.md` §5.2 참고)

**테스트 결과**: DoD §2 6개 항목 전부 재통과. 깨진 부분 없음.
