# DOCUMENT_INDEX.md
## LLE 문서 인덱스

---

## 1. 문서의 목적

- 프로젝트 전체 문서의 공식 인덱스
- 문서를 찾기 위한 지도
- 문서 간 의존 관계를 빠르게 파악하는 용도

**이 문서는 내용을 설명하지 않는다.** "무엇이 어디 있는가"만 다룬다. 내용 요약은 README.md(철학·구조), 현재 상태는 PROJECT_STATUS.md를 본다.

---

## 2. 문서 계층(Tier)

| Tier | 문서 수 | 목록 |
|---|---|---|
| 0 | 2 | PROJECT_VISION, LEARNING_THEORY |
| A | 10 | LEARNING_PROTOCOL, CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, CONTENT_SCHEMA, PROGRESS_SCHEMA, VOCABULARY_SCHEMA, LANGUAGE_PACK_STANDARD |
| B | 4 | VI_LANGUAGE_PACK, EN_LANGUAGE_PACK, JA_LANGUAGE_PACK, ZH_LANGUAGE_PACK |
| C | 4 | ENGINE_INTERFACE, API_CONTRACT, IMPLEMENTATION_BRIEF, MIGRATION_GUIDE |
| D | 4 | VI_CONTENT, EN_CONTENT, JA_CONTENT, ZH_CONTENT |
| (횡단) | 7 | VALIDATION_REPORT_VI/EN/ZH, LANGUAGE_VALIDATION_SUMMARY, PINYIN_NORMALIZATION_STRESS_TEST, CORE_STANDARD_V1_FREEZE + 프로젝트 진입 문서(README, PROJECT_STATUS, DOCUMENT_INDEX) |

---

## 3. 문서 역할

### Tier 0

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| PROJECT_VISION.md | 프로젝트 헌법 | 1.0 | Frozen |
| LEARNING_THEORY.md | 학습 이론 표준 | 1.2 | Frozen |

### Tier A (Core Standard)

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| LEARNING_PROTOCOL.md | 학습 흐름 정책 | 1.0 | Frozen |
| CONCEPT_SCHEMA.md | Universal Concept 표준 | 1.5 | Frozen(Concept 인스턴스 목록은 Controlled Open) |
| GRAMMAR_SCHEMA.md | Grammar Node/Relation 표준 | 1.6 | Frozen |
| GRAMMAR_GRAPH.md | Engine 동작 규칙 | 1.4 | Frozen |
| IDENTIFIER_STANDARD.md | 전체 ID 명명 표준 | 1.10 | Frozen(일부 세부 규칙은 Controlled Open, 6장 참고) |
| VALIDATION_FRAMEWORK.md | 검증 표준 | 1.1 | Frozen |
| CONTENT_SCHEMA.md | Content Entity 표준 | 1.0 | Frozen |
| PROGRESS_SCHEMA.md | User Learning State 표준 | 1.0 | Frozen |
| VOCABULARY_SCHEMA.md | Lexicon Layer 표준 | 1.0 | Frozen(`features` 예약 필드는 Controlled Open) |
| LANGUAGE_PACK_STANDARD.md | Language Pack 공통 템플릿 | 1.0 | Frozen |

### Tier B (Language Pack)

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| VI_LANGUAGE_PACK.md | 베트남어 데이터 | 1.2 | Controlled Open |
| EN_LANGUAGE_PACK.md | 영어 데이터 | 1.2 | Controlled Open |
| JA_LANGUAGE_PACK.md | 일본어 데이터 | 1.0 | Controlled Open |
| ZH_LANGUAGE_PACK.md | 중국어 데이터 | 1.0 | Controlled Open |

### Tier C (구현)

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| ENGINE_INTERFACE.md | Engine 책임·호출 계약 | 1.4 | Active(Event/Audit Engine 절은 Reserved) |
| API_CONTRACT.md | API 입출력 계약 | 1.1 | Active |
| IMPLEMENTATION_BRIEF_v0.2.md | MVP 구현 지시서 | 0.2 | Active |
| MIGRATION_GUIDE.md | Tier C 변경 이력 추적 | 1.0 | Active(계속 갱신되는 로그) |

### Tier D (콘텐츠)

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| VI_CONTENT.md | 베트남어 콘텐츠 본문 | 1.0 | Active(대부분 TBD) |
| EN_CONTENT.md | 영어 콘텐츠 본문 | 1.0 | Active(대부분 TBD) |
| JA_CONTENT.md | 일본어 콘텐츠 본문 | 1.0 | Active(전량 TBD) |
| ZH_CONTENT.md | 중국어 콘텐츠 본문 | 1.0 | Active(전량 TBD) |

### 횡단 문서 (검증·종합·진입)

| 문서명 | 역할 | 버전 | 상태 |
|---|---|---|---|
| VALIDATION_REPORT_VI_v1.0.md / v1.1.md | 베트남어 검증 보고서 | 1.0 / 1.1 | Frozen(과거 기록) |
| VALIDATION_REPORT_EN_v1.0.md | 영어 검증 보고서 | 1.0 | Frozen(과거 기록) |
| VALIDATION_REPORT_ZH_v1.0.md | 중국어 검증 보고서 | 1.0 | Frozen(과거 기록) |
| LANGUAGE_VALIDATION_SUMMARY_V1.md | 4개 언어 종합 검증 | 1.3 | Controlled Open(다음 언어 반영 시 갱신) |
| PINYIN_NORMALIZATION_STRESS_TEST.md | 병음 규칙 집중 검증 | 1.0 | Frozen(과거 기록) |
| CORE_STANDARD_V1_FREEZE.md | Freeze 승인 기록 | 1.1 | Frozen |
| README.md | 프로젝트 소개(5분 이해용) | — | Active(구조 변경 시에만 갱신) |
| PROJECT_STATUS.md | 현재 진행 상황 현황판 | — | Active(작업마다 갱신) |
| DOCUMENT_INDEX.md | 이 문서 — 탐색용 인덱스 | 1.0 | Active(문서 추가·삭제 시 갱신) |

*(JA는 별도 VALIDATION_REPORT가 없다 — 설계 단계에서 선제적으로 오류가 해소되어 별도 보고서 없이 LANGUAGE_VALIDATION_SUMMARY에만 결과가 기록됨)*

---

## 4. 의존 관계

### Tier 0 → Tier A

```
PROJECT_VISION
   ↓
LEARNING_THEORY
   ↓
LEARNING_PROTOCOL
   ↓
CONCEPT_SCHEMA
   ↓
GRAMMAR_SCHEMA ← CONTENT_SCHEMA, PROGRESS_SCHEMA, VOCABULARY_SCHEMA (모두 GRAMMAR_SCHEMA에서 분리됨)
   ↓
GRAMMAR_GRAPH
   ↓
IDENTIFIER_STANDARD ← 모든 Tier A 문서의 ID 규칙이 여기로 수렴
   ↓
VALIDATION_FRAMEWORK
   ↓
LANGUAGE_PACK_STANDARD
```

### Tier A → Tier B

```
LANGUAGE_PACK_STANDARD + CONCEPT_SCHEMA + GRAMMAR_SCHEMA + IDENTIFIER_STANDARD + VOCABULARY_SCHEMA
   ↓
VI / EN / JA / ZH_LANGUAGE_PACK
   ↓
VALIDATION_REPORT_* (개별 검증) → LANGUAGE_VALIDATION_SUMMARY_V1(종합) → CORE_STANDARD_V1_FREEZE(최종 승인)
```

### Tier B → Tier C / D

```
VI/EN/JA/ZH_LANGUAGE_PACK ──→ VI/EN/JA/ZH_CONTENT (Tier D, Required Content ID 목록 참조)
ENGINE_INTERFACE ──→ API_CONTRACT ──→ IMPLEMENTATION_BRIEF
API_CONTRACT/ENGINE_INTERFACE 변경 ──→ MIGRATION_GUIDE에 Entry 기록
```

---

## 5. 새 세션 시작 시 권장 읽기 순서

1. **README.md** — 프로젝트가 뭔지, 왜 이런 구조인지
2. **PROJECT_STATUS.md** — 지금 정확히 어디까지 왔는지
3. **DOCUMENT_INDEX.md**(이 문서) — 필요한 문서를 찾는 지도
4. **Tier A Core Standard** 중 해당 작업과 관련된 문서만 선택적으로
5. **현재 작업 대상 문서**(PROJECT_STATUS.md §8 "다음 작업 우선순위" 참고)

Tier A 전체를 매번 처음부터 다 읽을 필요는 없다 — 4번 단계에서 지금 하려는 작업과 관련된 문서만 골라 읽는다.

---

## 6. 문서 상태 요약

| 상태 | 의미 | 해당 문서 |
|---|---|---|
| **Frozen** | 구조·내용이 확정되어 변경 시 CORE_STANDARD_V1_FREEZE §5 절차 필요 | Tier 0 전체, Tier A 전체, 개별 VALIDATION_REPORT/PINYIN_STRESS_TEST(과거 기록), CORE_STANDARD_V1_FREEZE |
| **Controlled Open** | 구조는 안정적, 정해진 절차로만 인스턴스 확장 가능 | Tier B(VI/EN/JA/ZH_LANGUAGE_PACK), LANGUAGE_VALIDATION_SUMMARY, (Tier A 내부의 Concept 목록·일부 Identifier 세부 규칙) |
| **Active** | 작업이 진행되는 대로 계속 갱신되는 문서 | Tier C 전체, Tier D 전체, README/PROJECT_STATUS/DOCUMENT_INDEX |
| **Reserved** | 설계는 되어 있으나 아직 구현·활용하지 않음(문서 전체가 아니라 문서 내 특정 절에 적용) | ENGINE_INTERFACE의 Event Engine·Audit/Logging Engine 절, VOCABULARY_SCHEMA/CONTENT_SCHEMA의 예약 필드(`features`, `pronunciation_ref` 등) |

---

## 7. 유지보수 규칙

새 문서를 추가·삭제·승격(버전 변경)할 때 이 문서를 함께 갱신한다.

**새 문서 추가 시**
1. 해당 Tier의 §2 표에 문서명 추가, 개수 갱신
2. §3에 해당 Tier 표에 행 추가(문서명/역할/버전/상태)
3. 다른 문서를 참조하거나 참조받는다면 §4 의존 관계 다이어그램에 반영
4. §6 상태 요약 표에 해당 상태 그룹으로 편입

**문서 버전 변경 시**
- §3의 버전 열만 갱신한다(내용 설명은 추가하지 않는다 — 그건 각 문서 자신의 개정 이력 몫)

**문서 상태 변경 시(예: Controlled Open → Frozen)**
- §3과 §6을 함께 갱신한다

**문서 삭제 시**
- §2·§3·§6에서 제거하고, §4에 그 문서를 향한 화살표가 있으면 함께 정리한다

**이 문서 자체가 설명이 길어지려 하면 잘못된 신호다** — DOCUMENT_INDEX는 항상 "표 + 화살표" 수준을 유지한다. 내용을 설명하고 싶어지면 README.md나 해당 문서 자신에 적는다.

---

## 8. 마지막 업데이트

**2026-07-06** — 최초 작성(LLE Core Standard v1.0 Freeze 및 README.md 작성 직후).

### 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — Tier 0~D 및 횡단 문서 전체 25개 인덱싱, 의존 관계 다이어그램, 권장 읽기 순서, 상태 요약(Frozen/Controlled Open/Active/Reserved), 유지보수 규칙 정의 |
