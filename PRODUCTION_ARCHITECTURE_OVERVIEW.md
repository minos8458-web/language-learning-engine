# PRODUCTION_ARCHITECTURE_OVERVIEW.md
## LLE Production 구현 지시서 세트 — 개요 및 로드맵

> 이 문서는 Tier C의 새로운 진입점이다. `IMPLEMENTATION_BRIEF_v0.1/v0.2`(MVP, 클라이언트 전용 vanilla JS)는 폐기되지 않는다 — "Concept→Grammar Node→Relation→Content→Progress 데이터 구조가 실제로 작동하는가"라는 목적을 이미 달성한 **완료된 기록**으로 남는다. 이 문서부터 시작하는 Production 문서 세트는 그와 별도인 새 구현 트랙이다.

---

## 0. 문서의 지위

- Tier C. 규범 문서가 아니라 지시서이며, 이 아래 이어질 5개 Production Brief의 지도(map)다.
- Tier A(Core Standard, Frozen)와 Tier B(Language Pack)의 계약은 전혀 변경하지 않는다. 이 문서 세트는 그 계약을 "어떻게 프로덕션 시스템으로 구현할지"만 다룬다.
- 하위 문서(1~5번) 간 충돌이 있을 경우 이 문서의 §3(핵심 결정)과 §4(로드맵)가 조정 기준이 된다.

---

## 1. 배경 — 왜 새 트랙이 필요한가

MVP는 목적을 달성했다(클라이언트 전용, 로컬 JSON 샘플, 단일 세션 검증). 그러나 이 구조로는:

- 여러 사용자의 학습 데이터를 축적할 수 없어 **Level 3(Learning Effect Validation)** 파일럿이 구조적으로 불가능하고
- 사용자별 영구 Progress·기기 간 동기화가 불가능하며
- AI 개인화(사용자별 습득 상태 기반 생성)를 서버 없이 안전하게 운영하기 어렵다.

따라서 MVP와는 별도로, 실제 배포 가능한 시스템을 위한 Production 지시서 세트가 필요하다.

---

## 2. 범위

**이번 세트가 다루는 것**: 서버+DB 기반 아키텍처로의 전환, 데이터 영속성, 핵심 도메인 로직의 프로덕션 구현, API 계층, AI 생성 통합, 클라이언트(UI) 재설계.

**다루지 않는 것(추후 별도 결정 필요)**: 클라우드 호스팅 벤더 선정, 결제/과금, 다국어 로케일 UI 번역, 배포 파이프라인(CI/CD), 5번째 Language Pack.

---

## 3. 핵심 결정 기록

### 결정 1 — 실행 환경: 서버 + DB 도입

| 항목 | 내용 |
|---|---|
| 결정 | 클라이언트 전용 구조를 버리고 서버+DB 아키텍처로 전환한다 |
| 이유 | Level 3 파일럿에 필요한 다중 사용자 데이터 축적, 기기 간 동기화, AI 개인화 운영의 전제 조건 |
| 영향 | `PROGRESS_SCHEMA` 등 Tier A 계약 자체는 불변이지만, 이를 담는 저장소가 브라우저 로컬에서 서버 DB로 이동. `API_CONTRACT`가 이미 전제하던 클라이언트-서버 경계가 처음으로 실체를 가짐 |
| 승인 | 2026-07-07, 사용자 승인 |

### 결정 2 — 문서 분해 기준: 계층(Concern) 단위

| 항목 | 내용 |
|---|---|
| 결정 | Engine 단위나 사용자 흐름 단위가 아니라, 데이터 영속성 → 핵심 도메인 로직 → API → AI Integration → Client 순서의 계층 단위로 분해한다 |
| 이유 | 프로젝트 우선순위(학습효과>교육설계>시스템아키텍처>데이터구조>확장성>유지보수성>UI)와 자연스럽게 겹치고, 각 문서가 이전 문서의 산출물 위에 쌓이는 의존 순서를 그대로 반영 |
| 영향 | 하나의 엔진(예: Generation Engine)의 로직이 여러 문서(도메인 로직 문서 + AI Integration 문서)에 걸쳐 설명될 수 있음 — 의도된 트레이드오프 |
| 승인 | 2026-07-07, 사용자 승인 |

---

## 4. Production 문서 로드맵

```
0. PRODUCTION_ARCHITECTURE_OVERVIEW.md   (이 문서)
   ↓
1. DATA_PERSISTENCE_BRIEF.md             — DB 스키마, User 엔터티, 저장소 구조
   ↓
2. DOMAIN_LOGIC_BRIEF.md                 — Grammar Graph 탐색, Cascade, State 전이, Confidence 계산
   ↓
3. API_LAYER_BRIEF.md                    — API_CONTRACT 18개 API의 서버 엔드포인트화, 인증/에러 처리
   ↓
4. AI_INTEGRATION_BRIEF.md               — Generation Engine의 실제 AI 호출, 프롬프트 제약, 생성 실패 폴백
   ↓
5. CLIENT_BRIEF.md                       — API 소비 클라이언트 재설계, LEARNING_PROTOCOL 흐름의 화면화
```

각 문서는 직전 문서가 확정한 것을 전제로 삼는다 — 예를 들어 2번(도메인 로직)은 1번이 확정한 스키마 위에서만 로직을 정의하고, 저장소 형태를 다시 논하지 않는다.

| # | 문서명 | 다루는 질문 |
|---|---|---|
| 1 | DATA_PERSISTENCE_BRIEF.md | 어떤 DB에, 어떤 스키마로, 무엇을 저장하는가? User 엔터티는 어떻게 정의하는가? |
| 2 | DOMAIN_LOGIC_BRIEF.md | 저장된 데이터 위에서 Grammar Graph 탐색·Review Cascade·State 전이·Confidence 측정을 실제로 어떻게 계산하는가? |
| 3 | API_LAYER_BRIEF.md | 도메인 로직을 API_CONTRACT의 18개 API로 어떻게 노출하는가? 인증·에러(`empty_result` vs `error`)·트랜잭션 경계는? |
| 4 | AI_INTEGRATION_BRIEF.md | Generation Engine이 실제 AI 호출을 어떻게 수행하며, "이미 학습한 문법만 사용" 제약을 어떻게 강제하는가? |
| 5 | CLIENT_BRIEF.md | 사용자는 이 API 위에서 실제로 어떤 화면·흐름을 거치는가? |

---

## 5. 비기능 우선순위 재확인

Production 단계에서도 프로젝트 우선순위는 변하지 않는다: **학습 효과 > 교육 설계 > 시스템 아키텍처 > 데이터 구조 > 확장성 > 유지보수성 > UI**. 이 순서는 각 하위 문서에서 설계 선택지를 비교할 때의 기준으로 그대로 적용된다.

---

## 6. 다음 단계

1번 문서 `DATA_PERSISTENCE_BRIEF.md` 작성으로 진행한다.

---

## 7. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — 서버+DB 전환 및 계층 단위 문서 분해 결정 기록, Production 문서 로드맵(0~5) 확정 |
