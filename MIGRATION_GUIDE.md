# MIGRATION_GUIDE.md
## LLE Migration Guide (Tier C)

> Tier C(API_CONTRACT.md, ENGINE_INTERFACE.md) 및 이들이 참조하는 Tier A 문서의 계약이 바뀔 때마다, Development 프로젝트가 무엇을 확인·수정해야 하는지 여기 한 곳에 기록한다. 이 문서는 개별 문서의 개정 이력(각 문서 하단 표)을 대체하지 않는다 — 그것들은 "그 문서 안에서 무엇이 바뀌었는가"를 기록하고, 이 문서는 "그래서 구현체가 무엇을 해야 하는가"만 모아서 추적한다.

---

## 0. 문서의 지위

- Tier C. 규범 문서가 아니라 변경 추적 문서다 — 새로운 규칙을 만들지 않고, 이미 다른 문서에서 확정된 변경을 실행 관점에서 요약한다.
- 항목은 시간순(오름차순)으로 쌓는다. 기존 Entry는 수정하지 않는다 — 잘못된 경우 새 Entry로 정정 사항을 추가한다(Grammar Node ID의 ID Stability Principle과 같은 정신).

---

## 1. Entry 작성 규칙

각 Entry는 아래 형식을 따른다.

| 필드 | 설명 |
|---|---|
| Entry 번호 | 순차 증가(001, 002, ...) |
| 날짜 | YYYY-MM-DD |
| 변경 유형 | `ADDITIVE`(하위 호환, 기존 호출자 영향 없음) \| `BREAKING`(기존 호출자 수정 필요) |
| 영향 문서 | 변경이 발생한 원본 문서와 버전 |
| 요약 | 무엇이 바뀌었는가(1~2문장) |
| 필요한 조치 | Development가 실제로 해야 할 일 |
| 관련 패치 문서 | 있다면 IMPLEMENTATION_BRIEF 등 구체적 패치 지시서 |

---

## 2. Migration Entries

### Entry 001

| 필드 | 내용 |
|---|---|
| 날짜 | 2026-07-06 |
| 변경 유형 | **BREAKING** |
| 영향 문서 | CONTENT_SCHEMA.md v1.0 (신설), GRAMMAR_SCHEMA.md v1.5 |
| 요약 | Content 엔터티의 `grammar_node_id`(단수)가 `grammar_node_ids`(배열)로 변경. `body`(단일 필드)가 `media_assets[].asset_ref`로 변경 |
| 필요한 조치 | Content 접근 코드에서 `.grammar_node_id` 참조를 배열 기반 로직으로, `.body` 참조를 `media_assets`에서 `TEXT` 항목의 `asset_ref`로 변경 |
| 관련 패치 문서 | `IMPLEMENTATION_BRIEF_v0.2.md` |

### Entry 002

| 필드 | 내용 |
|---|---|
| 날짜 | 2026-07-06 |
| 변경 유형 | **ADDITIVE** |
| 영향 문서 | API_CONTRACT.md v1.1 (§4.7 신규), ENGINE_INTERFACE.md v1.4 |
| 요약 | Progress Engine API에 `get_due_reviews` 신규 추가 — 복습 기한이 도래한 노드 목록을 배치로 조회하는 API. 기존 API(`get_progress` 등)는 변경 없음 |
| 필요한 조치 | 새 기능(Review Queue 화면, LEARNING_PROTOCOL §3 Learning State Assessment 등)을 구현할 때만 이 API를 호출하면 된다. 기존 구현체는 아무것도 수정할 필요가 없다 |
| 관련 패치 문서 | 없음(기존 IMPLEMENTATION_BRIEF 범위 밖의 신규 기능이므로 별도 브리프 필요 시 추후 작성) |

---

## 3. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — Entry 001(Content 구조 변경, BREAKING), Entry 002(`get_due_reviews` 추가, ADDITIVE) 기록 |
