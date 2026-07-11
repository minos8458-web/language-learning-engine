# PATCH — 선행 탐색 방향 용어 정정 (2026-07-06)

대상 문서: `IMPLEMENTATION_BRIEF_v0.1.md` §5.1, `GRAMMAR_GRAPH.md` §3 (해당 조항).
사유: Development 구현 중 "정방향/역방향" 명칭과 §5.4/§7 검증 시나리오가 모순됨을 발견 → Architecture 승인으로 아래와 같이 정정.

---

## 변경 전 (§5.1)

> - 선행 정방향 탐색: 노드 ID를 입력받아, 그 노드가 `from_node_id`인 PREREQUISITE Relation을 따라 `to_node_id`들을 반환
> - 선행 역방향 탐색: 노드 ID를 입력받아, 그 노드가 `to_node_id`인 PREREQUISITE Relation을 따라 `from_node_id`들을 반환 (Cascade Engine이 사용하는 방향)

## 변경 후 (§5.1)

> - **prerequisite_requires** (입력 노드가 필요로 하는 선행 노드 탐색): 노드 ID를 입력받아, 그 노드가 `from_node_id`인 PREREQUISITE Relation을 따라 `to_node_id`들을 반환. **Review Cascade Engine이 사용하는 방향.**
> - **prerequisite_required_by** (입력 노드를 선행 조건으로 필요로 하는 후속 노드 탐색): 노드 ID를 입력받아, 그 노드가 `to_node_id`인 PREREQUISITE Relation을 따라 `from_node_id`들을 반환.
> - 두 함수 모두 `max_depth` 파라미터를 받아 지정된 깊이까지만 탐색한다.

## §5.4 관련 문구도 함께 정정

> "선택된 노드에서 선행 역방향 탐색을 max_depth=2로 실행" → **"선택된 노드에서 prerequisite_requires 탐색을 max_depth=2로 실행"**

## GRAMMAR_GRAPH.md §3 (탐색 정의 조항)에도 동일하게 반영 필요

기존 "정방향(forward)/역방향(backward)" 표현을 사용하는 모든 조항을 `prerequisite_requires` / `prerequisite_required_by`로 교체. (본 Development 세션에는 GRAMMAR_GRAPH.md 원문이 없어 정확한 diff는 제공 불가 — Architecture 프로젝트에서 원문 대조 후 적용 요망.)

---

## Development 측 반영 완료 사항

- `js/graphEngine.js`: `traversePrerequisiteForward` → `traversePrerequisiteRequires`, `traversePrerequisiteBackward` → `traversePrerequisiteRequiredBy`로 리네이밍
- `js/cascadeEngine.js`: `traversePrerequisiteRequires` 호출로 변경
- 회귀 테스트 재실행 → §7 DoD 전 항목 재통과 확인
- `IMPLEMENTATION_NOTES.md` §1 "미해결 이슈" → "해결됨"으로 갱신
