# VALIDATION_REPORT_VI_v1.1.md
## VI_LANGUAGE_PACK v1.1 재검증 보고서

> 검증 대상: `VI_LANGUAGE_PACK.md` (개정 이력 1.1) — v1.0 검증에서 발견된 FAIL 4건·PENDING 3건에 대한 조치 확인
> 검증 기준: `VALIDATION_FRAMEWORK.md` Level 0~2
> 검증 방법: 문서 정합성 재검토 (코드 실행 아님)
> 검증일: 2026-07-06

---

## 0. 종합 결과 요약

| Level | v1.0 판정 | v1.1 판정 | 비고 |
|---|---|---|---|
| Level 0 — Schema Validation | 조건부 통과 (FAIL 4) | **완전 통과** | FAIL-1~4 전부 해소 |
| Level 1 — Engine/API Contract Validation | 조건부 통과 (PENDING 2) | 조건부 통과 (PENDING 2 유지) | 이번 수정 범위 밖, 여전히 낮은 우선순위 |
| Level 2 — Language Pack Validation | 부분 통과 (PENDING 1) | **완전 통과** | PENDING-3이 영구적 설계 결정으로 해소 |

**결론**: Level 0과 Level 2가 완전 통과로 전환되었다. Level 1의 PENDING 2건은 이번 조치 대상이 아니었고 여전히 낮은 우선순위(문서 명확화 수준)로 남아 있어 Acceptance를 막지 않는다. **VI_LANGUAGE_PACK v1.1은 VALIDATION_FRAMEWORK §10 Acceptance Criteria의 Level 0~2 요건을 충족한다.**

---

## 1. Level 0 — Schema Validation (재검증)

| # | v1.0 발견 사항 | 조치 | v1.1 상태 |
|---|---|---|---|
| FAIL-1 | Content ID 9개 노드 언더스코어 누락 | 18개 ID 전체 수정(`COTHE`→`CO_THE` 등) | **PASS** |
| FAIL-2 | Relation ID 8개 언더스코어 누락 | 8개 ID 전체 수정 | **PASS** |
| FAIL-3 | ALTERNATIVE 미축약(1건) | `REL_CO_THE_ALT_DUOC_ABILITY`로 수정 | **PASS** |
| FAIL-4 | `A_POLITE`↔`A_CONFIRM` 관계 누락 | `REL_A_POLITE_RELATED_A_CONFIRM` 추가, §4/§5 뷰 일치 확인 | **PASS** |

**신규 확인 사항(WH_INSITU 추가에 대한 검증)**:

| # | 항목 | 결과 |
|---|---|---|
| 1 | `CONCEPT_MOOD_WHQUESTION` ID 형식 | `CONCEPT_{CATEGORY}_{FUNCTION}` 준수 — PASS |
| 2 | `GRAMMAR_VI_WH_INSITU` ID 형식·Concept 참조 | 형식 준수, 존재하는 Concept 참조 — PASS |
| 3 | 신규 Relation(`REL_WH_INSITU_RELATED_CO_KHONG`) | 형식 준수, §4/§5 뷰 일치 — PASS |
| 4 | PREREQUISITE 순환 재검증 | 신규 관계는 RELATED 타입이라 PREREQUISITE 부분 그래프에 영향 없음, 순환 여전히 없음 — PASS |
| 5 | 19개 Concept 전체 사용 여부 | 고아 Concept 없음 — PASS |

**참고(경미, 통과에 영향 없음)**: `GRAMMAR_VI_WH_INSITU`의 SLUG(`WH_INSITU`)는 특정 베트남어 단어에서 유래한 것이 아니라 구조 자체를 가리키는 분석적 명명이다. IDENTIFIER_STANDARD.md §3의 SLUG 규칙은 어휘 기반 노드를 전제로 작성되어, 이런 "구조 전용 노드"의 SLUG 명명 관례를 명시적으로 다루지 않는다. 이번 사례가 그 첫 선례가 되므로, 향후 IDENTIFIER_STANDARD.md 개정 시 "어휘가 아닌 구조를 나타내는 노드의 SLUG는 기능을 설명하는 영문 축약어를 사용한다"는 규칙을 명문화할 것을 제안한다(지금 당장 필요한 조치는 아님).

---

## 2. Level 1 — Engine/API Contract Validation (재검증)

이번 조치 범위 밖이며 상태 변화 없음.

| # | 항목 | 상태 |
|---|---|---|
| PENDING-1 | `(TBD)` Content의 API 계약상 상태 미정의 | 유지 — 권장 해법(빈 결과로 취급)은 이미 제시되어 있으며 실제 Content 제작 단계에서 자연 해소 예정 |
| PENDING-2 | 완전한 Content 레코드가 IMPLEMENTATION_BRIEF에 분산 | 유지 — Tier D 문서 설계 시 처리 예정 |

---

## 3. Level 2 — Language Pack Validation (재검증)

| # | v1.0 발견 사항 | 조치 | v1.1 상태 |
|---|---|---|---|
| PENDING-3 | Wh-의문문 시나리오의 Grammar/Vocabulary 경계 불명확 | Wh-단어(gì/đâu/khi nào 등)는 Vocabulary로, Wh-의문문 어순은 `CONCEPT_MOOD_WHQUESTION`+`GRAMMAR_VI_WH_INSITU`로 Grammar 영역에 명시적으로 편입 | **PASS(영구 설계 결정으로 해소)** |

**목표 시나리오 재검증**: 4개 시나리오 전부 24개 노드(+Vocabulary 경계 밖 어휘)로 구성 가능함을 확인.

| 시나리오 | 필요 요소 | 상태 |
|---|---|---|
| ① 나는 밥을 먹었다 | `GRAMMAR_VI_DA` | PASS |
| ② 너 지금 뭐 하고 있어? | `GRAMMAR_VI_DANG` + `GRAMMAR_VI_WH_INSITU` + Vocabulary("gì", 범위 밖) | PASS |
| ③ 이거 살 수 있어요? | `GRAMMAR_VI_CO_THE`/`GRAMMAR_VI_DUOC_ABILITY` + `GRAMMAR_VI_CO_KHONG` | PASS |
| ④ 이따가 갈게요 | `GRAMMAR_VI_SE` | PASS |

---

## 4. Acceptance 판정

VALIDATION_FRAMEWORK §10 기준:

- [x] Level 0 통과
- [x] Level 2 통과
- [ ] Level 1 PENDING 2건 — Acceptance를 막을 만한 사안이 아님(문서 명확화 수준, Correctness에 영향 없음)으로 판단해 조건부 진행 가능
- Level 3(Learning Effect)·Level 4(Human)는 실제 파일럿 데이터가 필요해 이번 검증 범위 밖(VALIDATION_FRAMEWORK §10 재확인)

**종합 판정: VI_LANGUAGE_PACK v1.1은 Level 0~2 기준으로 Acceptance 가능.**

---

## 5. 다음 단계 권고

1. Level 1의 PENDING-1·2는 급하지 않으므로 Tier D(콘텐츠) 문서 설계 시점에 함께 처리
2. Level 3(Learning Effect Validation)은 실제 학습자 데이터가 있어야 하므로, MVP 구현(IMPLEMENTATION_BRIEF) 이후 파일럿을 통해 진행
3. 이제 Level 0~2가 확정되었으므로 **EN/JA/ZH_LANGUAGE_PACK 확장을 시작해도 되는 상태**다. 다만 확장 여부는 여전히 architecture 의사결정 사항이므로 사용자 승인 필요

---

## 6. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 검증 |
| 1.1 | 2026-07-06 | VI_LANGUAGE_PACK v1.1 반영 재검증 — FAIL 4건 전부 PASS 전환, PENDING-3 영구 해소. Level 0·2 완전 통과, Level 1 PENDING 2건은 비차단으로 판정. WH_INSITU 신규 노드의 SLUG 명명에 대한 경미한 관찰 사항 기록(IDENTIFIER_STANDARD.md 향후 보완 제안) |
