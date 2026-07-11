# MIGRATION_GUIDE_ENTRIES_004_005.md
## MIGRATION_GUIDE.md에 병합할 신규 Entry 2건

> ⚠️ 이 세션에는 `MIGRATION_GUIDE.md` 원본이 없어(업로드되지 않음) 전체 파일을 갱신하지 못했습니다. 아래 Entry 004·005를 기존 `MIGRATION_GUIDE.md`에 순서대로 추가해주세요. 형식은 기존 Entry 001(`get_due_reviews` 추가 건)과 동일하게 맞췄습니다.

---

### Entry 004

| 항목 | 내용 |
|---|---|
| 일자 | 2026-07-07 |
| 대상 문서 | `API_CONTRACT.md` (v1.1 → v1.2) |
| 변경 유형 | API 추가 |
| 변경 내용 | Learning Flow Engine 외부 API에 `submit_self_reported_confidence`(10.4) 추가 |
| 발견 경위 | `API_LAYER_BRIEF.md`(Production Track) 작성 중, `record_self_reported_confidence`(Progress Engine 4.5)가 "호출 주체: Learning Flow Engine"으로 정의되어 있었으나 이를 트리거할 외부 진입점이 10장에 없어 도달 불가능한 API였음을 발견 |
| 영향 범위 | API 개수 19개 → 20개. `ENGINE_INTERFACE.md`의 Learning Flow Engine 외부 API 목록도 3개 → 4개로 함께 갱신 필요(아직 미확인 — `ENGINE_INTERFACE.md` 원본 검토 시 반영) |
| 하위 호환성 | 기존 API 변경 없음, 순수 추가라 하위 호환 깨지지 않음 |

---

### Entry 005

| 항목 | 내용 |
|---|---|
| 일자 | 2026-07-07 |
| 대상 문서 | `API_CONTRACT.md` (v1.2 → v1.3), `ENGINE_INTERFACE.md` (v1.5 → v1.6), `API_LAYER_BRIEF.md` (v1.0 → v1.1) |
| 변경 유형 | API 추가 |
| 변경 내용 | Learning Flow Engine 외부 API에 `start_session`(10.5) 추가 — `POST /flow/start-session`으로 매핑 |
| 발견 경위 | `CLIENT_BRIEF.md`(Production Track) 작성 중, 기존 4개 외부 API 중 어떤 것도 "지금 어떤 `node_id`를 다뤄야 하는가"를 클라이언트에 알려주지 않아 세션을 시작할 방법 자체가 없었음을 발견 |
| 설계 반영 | 사용자 요청에 따라 원시 목록이 아닌 `next_action`(REVIEW/NEW_GRAMMAR/INTERLEAVING/CONVERSATION/IDLE) 단일 결정값으로 정규화 — 클라이언트가 정책을 재판단하지 않고 소비만 하도록 강제 |
| 영향 범위 | API 개수 20개 → 21개 |
| 하위 호환성 | 기존 API 변경 없음, 순수 추가라 하위 호환 깨지지 않음 |
