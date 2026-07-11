# VALIDATION_FRAMEWORK.md
## LLE Validation Framework (Tier A — Core Standard)

> **Correctness는 Validation의 필요조건이지 충분조건이 아니다.** 코드가 완벽하게 동작해도 학습 효과가 유지되지 않으면 Validation은 실패한 것으로 간주한다. 이 원칙은 이 문서 전체를 관통하는 유일한 해석 기준이다.

문서 계층: Tier 0(PROJECT_VISION, LEARNING_THEORY) / Tier A(CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, **VALIDATION_FRAMEWORK**) / Tier B(Language Pack) / Tier C(ENGINE_INTERFACE, API_CONTRACT) — 이 문서는 Tier 0~C **전체**를 검증 대상으로 한다.

---

## 0. 문서의 지위

- **Tier A 배치 근거**: 다른 Tier A 문서가 "무엇을 지켜야 하는가"의 표준이라면, 이 문서는 "그것을 지켰는지 어떻게 확인하는가"의 표준이다. 같은 층위에서 다뤄야 Tier B/C가 이 검증 절차를 우회할 수 없다.
- 이 문서는 특정 Engine의 구현을 검증하지 않는다. Tier 0(철학)부터 Tier C(구현 계약)까지, 그리고 향후 Tier D(콘텐츠)까지 전체를 대상으로 한다.
- 이 문서 자체도 자신이 정의한 절차의 적용을 받는다 — 즉 이 문서를 개정할 때도 "이 개정이 학습 효과 검증을 약화시키지 않는가"를 스스로 검토해야 한다.

---

## 1. Validation의 목적

LLE의 Validation은 "코드가 동작하는가"를 확인하는 것이 아니라 **"학습 효과를 유지하는가"**를 확인하는 것이 최우선 목표다.

기존 언어 학습 앱들의 실패 원인(PROJECT_VISION §1.1)은 대부분 "앱이 잘 작동했다"는 것과 "학습자의 회화 능력이 실제로 늘었다"는 것을 혼동한 데 있다. Validation이 Correctness에서 멈추면 LLE도 같은 함정에 빠진다.

**최종 판정 근거**: PROJECT_VISION §3의 5개 성공 기준 — 문법 노드 습득 지속률, 조합 생성 능력, 전이 성공률, 반응 자동화 지표, 구조적 확장 가능성. 이 문서의 모든 하위 절차는 결국 이 5개 지표에 어떤 영향을 주는지로 귀결된다.

---

## 2. Validation Level

Validation은 5단계로 진행되며, **하위 레벨을 통과해야 상위 레벨로 진행할 자격**이 생긴다(게이트 구조).

| Level | 이름 | 검증 대상 | 성격 |
|---|---|---|---|
| **0** | Schema Validation | 데이터가 CONCEPT_SCHEMA/GRAMMAR_SCHEMA/CONTENT_SCHEMA/PROGRESS_SCHEMA/VOCABULARY_SCHEMA/LANGUAGE_PACK_STANDARD/IDENTIFIER_STANDARD 형식을 따르는가 | Correctness |
| **1** | Engine Validation | 각 Engine이 ENGINE_INTERFACE.md/API_CONTRACT.md의 계약(입출력·호출 경계)을 지키는가 | Correctness |
| **2** | Language Pack Validation | 언어 데이터가 실제 회화를 구성할 최소 세트를 충족하는가 | Correctness + 일부 Learning Effect |
| **3** | Learning Effect Validation | 실제 학습자에게 적용했을 때 PROJECT_VISION §3 지표가 실제로 개선되는가 | **Learning Effect (핵심)** |
| **4** | Human Validation | 사람(교사·원어민·언어학자·파일럿 학습자)이 자동화된 지표로 포착되지 않는 어색함·부자연스러움을 최종 확인 | Learning Effect |

**핵심 원칙**: **Level 0~2를 100% 통과해도 Level 3에서 실패하면 전체 Validation은 실패로 간주한다.** Level 0~2는 "이 시스템이 설계대로 작동하는가"를 보장할 뿐, "이 설계가 옳았는가"를 보장하지 않는다 — 그 답은 오직 Level 3~4에서만 나온다.

---

## 3. Tier별 Validation 개관

### 3.1 Philosophy Validation (Tier 0)

PROJECT_VISION·LEARNING_THEORY의 원칙 위반 여부를 확인한다. 특정 Level에 속하지 않고 **모든 Level의 판정 시 참조되는 근본 기준**이다.

- 게이미피케이션이 핵심 동력이 되고 있지는 않은가(PROJECT_VISION §4 Anti-Goals)
- 새 기능이 다섯 학습 원칙(Active Recall/SRS/Interleaving/Elaboration/Generation Practice) 중 최소 하나 이상을 구현하는가(LEARNING_THEORY §2.4 대응)
- "이 기능이 실제 회화 능력 향상에 도움이 되는가?"(PROJECT_VISION §2.3)라는 질문에 답할 수 있는가

### 3.2 Schema Validation (Tier A) — Level 0 대응

CONCEPT_SCHEMA·GRAMMAR_SCHEMA·CONTENT_SCHEMA·PROGRESS_SCHEMA·VOCABULARY_SCHEMA·IDENTIFIER_STANDARD의 제약 준수 여부. 4장에서 Grammar Graph 특유의 검증을 심화한다.

**Vocabulary Validation(신규)**: VOCABULARY_SCHEMA.md §10의 규칙을 그대로 적용한다 — 특히 **"Grammar가 계산 가능한 규칙형을 Vocabulary가 중복 저장해서는 안 된다"**(예: `work→worked` 저장 시 Validation Error)는 Grammar와 Vocabulary의 책임이 겹치지 않는지 확인하는 핵심 검증이다.

### 3.3 Language Pack Validation (Tier B) — Level 2 대응

5장에서 심화한다.

### 3.4 API Validation (Tier C) — Level 1 대응

- ENGINE_INTERFACE.md의 호출 경계(부모-자식, 리프 Engine 규칙)가 실제로 지켜지는가
- API_CONTRACT.md의 `empty_result`/`error` 구분이 정확한가, 알고리즘 비노출 원칙이 지켜지는가(응답에 내부 계산 과정이 새어나오지 않는가)

---

## 4. Grammar Graph Validation

Level 0에 속하되, Graph 구조 특유의 검증이라 별도 장으로 다룬다.

- **순환 없음**: `PREREQUISITE` 관계만으로 이루어진 부분 그래프가 항상 DAG(비순환)인가(GRAMMAR_GRAPH §3 배포 전 검증의 공식 절차화)
- **Concept-Node 정합성**: Concept 레벨의 선행 관계(CONCEPT_SCHEMA §6)가 그것을 구현하는 언어별 Grammar Node 레벨에도 반영되어 있는가(GRAMMAR_SCHEMA §6 정합성 제약)
- **Relation 방향성**: `PREREQUISITE`가 항상 `UNIDIRECTIONAL`인가(GRAMMAR_SCHEMA §6)
- **ID 무결성**: 존재하지 않는 노드·Concept을 참조하는 Relation이 없는가(IDENTIFIER_STANDARD §2 ID Stability Principle 위반 여부 포함)

---

## 5. Language Pack Validation (심화)

Level 2에 대응. **VI_LANGUAGE_PACK §8의 체크리스트는 이제 LANGUAGE_PACK_STANDARD.md §10(공통 검증 체크리스트)으로 승격되어, 모든 Language Pack에 동일하게 적용된다.**

- 신규 노드마다 최소 1개 이상의 Concept을 참조하는가
- 신규 언어 전체가 10개 Concept Category 각각에 최소 1개 이상의 Grammar Node를 갖는가(LANGUAGE_PACK_STANDARD §3 표준 챕터 구조의 일반화)
- **"최소 회화 가능 세트" 판정 방법**: LANGUAGE_PACK_STANDARD §6이 정의한 **Learning Outcome Scenario** 챕터(최소 4개 시나리오)를 해당 언어팩의 노드만으로 실제로 조합 가능한지 검증한다. 이 챕터 자체가 없으면 Level 2 통과 실패(검증자가 시나리오를 즉석에서 지어내는 것은 재현 불가능하므로 금지)
- 같은 표면 형태의 단어가 다른 기능으로 쓰일 때 별도 Grammar Node로 분리되어 있는가(GRAMMAR_SCHEMA §1 원칙, VI_LANGUAGE_PACK §4.3 `được` 사례 기준)
- **신규 Language Pack(EN/JA/ZH 등) 승인 절차**: 이 장의 체크리스트(Level 2)를 통과해야 비로소 Level 3(Learning Effect Validation)로 진입할 자격이 생긴다. Level 2를 건너뛰고 Level 3로 가는 것은 허용하지 않는다.
- **3축 동시 통과 요건**: 신규 Language Pack은 **Grammar Validation, Vocabulary Validation(VOCABULARY_SCHEMA §10), Content Validation(CONTENT_SCHEMA §9)을 모두 통과해야** Level 2 승인이 가능하다. 셋 중 하나라도 실패하면 Language Pack 전체가 Level 2 미통과로 간주된다.

---

## 6. AI Generation Validation

Level 1(계약 준수)과 Level 3(실제 효과) 양쪽에 걸친다.

- **Level 1 측면**: GRAMMAR_GRAPH §6.1 필터 우선순위가 실제 파이프라인에서 순서대로 지켜지는가. "학습자 수준 초과 금지" 필터를 우회한 생성물이 샘플 검사에서 하나라도 발견되면 즉시 실패(이는 협상 불가능한 항목 — Correctness 위반이자 동시에 Philosophy 위반)
- **Level 1 측면**: §6.2 난이도 사다리 4단계가 설계된 순서대로만 동작하는가(단계를 건너뛰지 않는가)
- **Level 3/4 측면**: 생성된 문장이 실제로 자연스럽고 학습에 유효한가는 자동 지표만으로 완전히 판단할 수 없다 — 이 부분은 Level 4(Human Validation)에서 원어민·언어학자가 표본을 직접 검토해 최종 확인한다

---

## 7. Learning Effect Validation

**이 프레임워크의 핵심 장.** PROJECT_VISION §3의 5개 지표를 측정 절차로 구체화한다. 정확한 임계값·표본 크기·통계적 유의성 기준은 이 문서에서 확정하지 않고 별도 실험 설계 문서(HOW 단계)로 넘긴다 — 이 문서는 "무엇을 측정하는가"까지만 정의한다.

| 지표 | 측정 대상 |
|---|---|
| 문법 노드 습득 지속률 | 습득 완료 표시 후 일정 기간(예: 30일) 뒤 재시험 통과율 |
| 조합 생성 능력 | 2개 이상의 학습한 노드를 조합한 신규 문장을 학습자가 스스로 생성할 수 있는 비율 |
| 전이 성공률 | 연습에서 다루지 않은 새로운 문맥에서 동일 문법을 올바르게 적용하는 비율 |
| 반응 자동화 지표 | 학습 진행에 따른 반응 시간의 유의미한 감소 추이 |
| 구조적 확장 가능성 | 엔진 코드 변경 없이 데이터(Language Pack) 교체만으로 신규 언어에 적용 가능한가(5장 Language Pack Validation과 교차 확인) |

---

## 8. Benchmark

Validation이 "맞다/틀리다"만 판단한다면 개선 여부를 알 수 없다. Benchmark는 **버전이 올라갈수록 실제로 나아지고 있는지**를 추적하는 장치다. Pass/Fail이 아니라 `v1.0 → v1.1 → v2.0` 시계열 비교가 목적이다.

| Benchmark | 추적 지표 예시 |
|---|---|
| **Learning Benchmark** | 7장의 5개 지표를 버전별로 기록(예: 30일 유지율 v1.0 62% → v1.1 68%) |
| **AI Generation Benchmark** | 난이도 사다리 각 단계 도달 비율(1단계 성공률 추이), 학습자 수준 초과 필터 위반 감지·차단 비율(항상 100%에 수렴해야 함) |
| **Language Pack Benchmark** | Concept Category별 노드 커버리지, Concept당 평균 Coverage/Depth(CONCEPT_SCHEMA §10), Tier B/C 예외 발생 빈도(낮을수록 상위 Schema 설계가 안정적이라는 신호) |
| **Grammar Graph Benchmark** | 순환 발생 횟수(항상 0이어야 함 — pass/fail에 가까움), 평균 Cascade 실제 활용 깊이(2-hop 중 몇 hop까지 쓰이는지), 노드당 평균 Relation 수(그래프 밀도) |

각 Benchmark는 버전별 값을 기록해 시계열로 관리하며, 값이 하락하면 9장(Regression Test)의 트리거가 된다.

---

## 9. Regression Test

**회귀(Regression)의 재정의**: 기존 기능이 깨지는 것(전통적 의미)뿐 아니라, **8장 Benchmark 지표가 이전 버전보다 하락하는 것도 회귀로 간주한다.**

| 회귀 유형 | 판정 | 대응 |
|---|---|---|
| Correctness 회귀 | 기존 테스트(Level 0~2)가 실패 | 즉시 차단, 배포 불가 |
| Learning Effect 회귀 | Benchmark(Learning/AI Generation) 지표가 유의미하게 하락 | 자동 차단이 아니라 **원인 분석 후 트레이드오프를 사람이 판단** — 예: 새 기능이 콘텐츠 다양성을 늘렸지만 단기 유지율이 소폭 하락한 경우, 장기 효과를 봐야 할 수도 있다 |

**절차**: 신규 버전 배포 전, 8장의 Benchmark를 직전 버전과 비교한다. Correctness 회귀는 자동으로 배포를 막는다. Learning Effect 회귀는 자동 차단하지 않되, 근거 데이터 없이 "괜찮을 것 같다"는 판단만으로 무시하는 것은 금지한다(11장).

---

## 10. Acceptance Criteria

신규 기능·Language Pack·Engine 버전이 "승인 가능" 상태가 되기 위한 최종 게이트.

- Level 0~4를 모두 통과했는가
- 9장 기준 Correctness 회귀가 없는가
- Learning Effect Benchmark가 유지되거나 개선되었는가(하락 시 9장 절차에 따른 근거 있는 승인만 허용)
- PROJECT_VISION §3 지표 중 어느 하나도 근거 없이 악화되지 않았는가

**명시**: Level 0~2(Correctness 성격)를 100% 통과해도 Level 3(Learning Effect)에서 하락이 확인되면 Acceptance는 거부된다. 이것이 이 문서 전체의 원칙("Correctness < Learning Effect")이 실제로 집행되는 지점이다.

---

## 11. 금지 사항

- Correctness(Level 0~2)만 확인하고 Learning Effect(Level 3) 검증 없이 배포를 승인하는 것
- Benchmark 하락을 근거 없이 "사소하다"고 판단해 Regression Test 절차를 건너뛰는 것
- Level 4(Human Validation) 없이 신규 Language Pack을 최종 승인하는 것
- Validation 결과를 사후에 유리하게 재해석하는 것(예: 목표 지표를 배포 후 낮춰서 통과시키는 것)
- 학습자 수준 초과 금지 필터 위반을 "생성 품질이 좋으니 예외로 허용"하는 것(6장 — 협상 불가 항목)
- Validation Level을 순서대로 거치지 않고 상위 Level(예: Level 3)부터 검증해 하위 Level 실패를 은폐하는 것

---

## 12. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-05 | 목차 승인, Tier A 배치 확정 |
| 1.0 | 2026-07-05 | 본문 최초 작성 — Validation Level 5단계(Schema→Engine→Language Pack→Learning Effect→Human) 정의, Tier별 Validation 개관, Grammar Graph/Language Pack/AI Generation/Learning Effect Validation 각 장 작성, Benchmark 4종(Learning/AI Generation/Language Pack/Grammar Graph) 정의, Regression Test를 Benchmark 하락 포함으로 재정의, Acceptance Criteria와 금지 사항 확정. "Correctness < Learning Effect" 원칙을 문서 전체의 해석 기준으로 명시 |
| 1.1 | 2026-07-06 | VOCABULARY_SCHEMA.md 신설에 따라 Vocabulary Validation을 Level 0 정식 대상으로 추가. Language Pack Validation(§5)에 "Grammar+Vocabulary+Content 3축 동시 통과" 요건 신설 — 신규 Language Pack은 이 셋을 모두 통과해야 Level 2 승인 |
| 1.2 | 2026-07-06 | LANGUAGE_PACK_STANDARD.md 신설에 따라 §5를 그 표준의 §6(Learning Outcome Scenario)·§10(공통 체크리스트) 참조로 갱신. "최소 회화 세트" 판정이 이제 표준 챕터 존재 여부 확인으로 구체화됨(EN v1.0의 즉석 시나리오 생성 문제 재발 방지) |
