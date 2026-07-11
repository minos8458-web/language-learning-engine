# VALIDATION_REPORT_VI_v1.0.md
## VI_LANGUAGE_PACK v1.0 검증 보고서

> 검증 대상: `VI_LANGUAGE_PACK.md` (개정 이력 1.0)
> 검증 기준: `VALIDATION_FRAMEWORK.md` Level 0~2
> 검증 방법: **문서 정합성 검토** (코드 실행 아님) — VI_LANGUAGE_PACK.md의 모든 ID·관계·필드를 CONCEPT_SCHEMA.md, GRAMMAR_SCHEMA.md, IDENTIFIER_STANDARD.md, GRAMMAR_GRAPH.md, ENGINE_INTERFACE.md, API_CONTRACT.md와 직접 대조
> 검증일: 2026-07-06

---

## 0. 종합 결과 요약

| Level | 판정 | PASS | FAIL | PENDING |
|---|---|---|---|---|
| Level 0 — Schema Validation | **조건부 통과** (경미한 수정 필요) | 8 | 4 | 0 |
| Level 1 — Engine/API Contract Validation | **조건부 통과** | 3 | 0 | 2 |
| Level 2 — Language Pack Validation | **부분 통과** | 3 | 0 | 1 |

**결론**: 구조적 무결성(순환 없음, 참조 무결성, Concept 커버리지)은 모두 통과했다. 다만 **ID 명명 포맷 위반 3건과 데이터 정합성 오류 1건**이 Level 0에서 발견되었고, 이는 IDENTIFIER_STANDARD.md가 VI_LANGUAGE_PACK.md 작성 **이후**에 확정되면서 생긴 시차 때문이다. 전부 기계적으로 수정 가능한 경미한 항목이라 Level 1~2 검토를 함께 진행했지만, **정식 Acceptance(VALIDATION_FRAMEWORK §10) 전에는 반드시 수정이 필요하다.**

---

## 1. Level 0 — Schema Validation

### 1.1 PASS 항목

| # | 항목 | 확인 내용 |
|---|---|---|
| 1 | Concept ID 형식 | 18개 Concept 전부 `CONCEPT_{CATEGORY}_{FUNCTION}` 형식 준수 |
| 2 | Grammar Node ID 형식 | 23개 노드 전부 `GRAMMAR_VI_{SLUG}` 형식 준수 |
| 3 | 노드-Concept 참조 무결성 | 23개 노드 전부 존재하는 Concept ID만 참조. 18개 Concept 전부 최소 1회 이상 사용(고아 Concept 없음) |
| 4 | 관계-노드 참조 무결성 | 14개 Relation의 `from`/`to` 값 전부 존재하는 Grammar Node ID를 가리킴 |
| 5 | PREREQUISITE 단방향성 | 4개 PREREQUISITE 관계 전부 `UNIDIRECTIONAL` |
| 6 | 순환 없음 | PREREQUISITE만으로 이루어진 부분 그래프가 4개의 독립된 2-노드 사슬(ROI→DA, NHAT→HON, CHUA→KHONG, DUOC_ABILITY→CO_THE)로, 공유 노드 없이 순환 불가능 |
| 7 | SLUG 정규화 규칙 | 베트남어 성조 제거 규칙(đã→DA, được→DUOC 등)이 23개 노드 전부에 정확히 적용됨 |
| 8 | 기능 단위 노드 분리 | `được`이 `GRAMMAR_VI_DUOC_ABILITY`/`GRAMMAR_VI_DUOC_PASSIVE`로 정확히 분리되었고, 이 둘 사이에 존재하지 않는 관계를 있다고 잘못 표기하지도 않음(GRAMMAR_SCHEMA §1 원칙 실증) |

### 1.2 FAIL 항목

#### FAIL-1. Content ID 언더스코어 누락 (9건)

- **위반 기준**: IDENTIFIER_STANDARD.md §5 — "`{NODE_SLUG}`는 연결된 Grammar Node ID에서 접두사를 뗀 나머지"(언더스코어 포함 그대로 유지해야 함)
- **원인**: VI_LANGUAGE_PACK.md는 IDENTIFIER_STANDARD.md가 확정되기 **이전**에 작성되어, 여러 단어로 된 SLUG(예: `CO_THE`)의 언더스코어를 Content ID 작성 시 임의로 제거했다(`COTHE`).
- **영향 노드**: `CO_THE`→`COTHE`, `DUOC_ABILITY`→`DUOCABILITY`, `CO_KHONG`→`COKHONG`, `CL_CAI`→`CLCAI`, `CL_CON`→`CLCON`, `NEU_THI`→`NEUTHI`, `DUOC_PASSIVE`→`DUOCPASSIVE`, `A_POLITE`→`APOLITE`, `A_CONFIRM`→`ACONFIRM` (총 9개 노드, 각 노드당 설명·예문 Content ID 2개씩 = 18개 ID)
- **수정 제안**: 위 9개 노드에 연결된 모든 Content ID에 언더스코어를 원래 SLUG대로 복원한다. 예: `CONTENT_VI_COTHE_EXPL_KO_BEGINNER` → `CONTENT_VI_CO_THE_EXPL_KO_BEGINNER`. 아직 `(TBD)` 상태라 실제 콘텐츠 제작 전이므로 지금 수정하면 마이그레이션 비용이 없다.

#### FAIL-2. Relation ID 언더스코어 누락 (8건)

- **위반 기준**: IDENTIFIER_STANDARD.md §6 — `REL_{FROM_SLUG}_{RELATION_TYPE}_{TO_SLUG}`
- **원인**: FAIL-1과 동일한 시차 문제.
- **영향 관계**: `REL_DUOCABILITY_PREREQ_COTHE`, `REL_DUOCPASSIVE_CONTRAST_BI`, `REL_COTHE_CONTRAST_PHAI`, `REL_CLCAI_CONTRAST_CLCON`, `REL_MUON_RELATED_COTHE`, `REL_PHAI_RELATED_COTHE`, `REL_APOLITE_RELATED_NHE`, `REL_COTHE_ALTERNATIVE_DUOCABILITY` (8건)
- **수정 제안**: FAIL-1과 동일한 방식으로 언더스코어 복원. 예: `REL_DUOCABILITY_PREREQ_COTHE` → `REL_DUOC_ABILITY_PREREQ_CO_THE`

#### FAIL-3. ALTERNATIVE 관계 축약 미적용 (1건)

- **위반 기준**: IDENTIFIER_STANDARD.md §6 — 관계 타입은 `PREREQ`\|`RELATED`\|`CONTRAST`\|`ALT`로 축약 표기
- **영향 관계**: `REL_COTHE_ALTERNATIVE_DUOCABILITY` — `ALTERNATIVE`를 축약하지 않음
- **수정 제안**: `REL_CO_THE_ALT_DUOC_ABILITY`로 수정(FAIL-2 수정과 동시 적용)

#### FAIL-4. Relation 데이터 정합성 오류 — 마스터 카탈로그 누락 (1건)

- **위반 기준**: 문서 내부 정합성(§4 노드별 관계 표와 §5 마스터 Relation 카탈로그는 같은 데이터의 두 가지 뷰이므로 반드시 일치해야 함)
- **발견 내용**: §4.10에서 `GRAMMAR_VI_A_POLITE`의 Related 칸에 `GRAMMAR_VI_NHE, GRAMMAR_VI_A_CONFIRM` 두 개가 적혀 있고, `GRAMMAR_VI_A_CONFIRM`의 Related 칸에도 `GRAMMAR_VI_A_POLITE`가 적혀 있다. 그러나 §5 마스터 Relation 카탈로그에는 `A_POLITE`↔`NHE` 관계(`REL_APOLITE_RELATED_NHE`)만 있고, **`A_POLITE`↔`A_CONFIRM` 관계는 누락되어 있다.** 이 관계가 실제로 존재한다면 마스터 카탈로그는 14개가 아니라 15개여야 한다.
- **원인**: 본문 작성 시 PRAGMATICS 3개 노드를 상호 연결하려는 의도(§4.10 서술)가 실제 §5 표 작성 단계에서 하나 누락됨.
- **수정 제안**: §5에 `REL_A_POLITE_RELATED_A_CONFIRM`(from=`GRAMMAR_VI_A_POLITE`, to=`GRAMMAR_VI_A_CONFIRM`, type=`RELATED`, direction=`BIDIRECTIONAL`, weight는 기존 PRAGMATICS 관계와 유사하게 0.4 권장)를 추가하고, Relation 총 개수를 14 → 15로 정정한다.

---

## 2. Level 1 — Engine/API Contract Validation

### 2.1 PASS 항목

| # | 항목 | 확인 내용 |
|---|---|---|
| 1 | Graph Engine 입력 요건 충족 | `find_prerequisites`/`find_related_nodes`가 요구하는 `node_id`, Relation의 `from/to/relation_type/direction/weight` 필드가 전부 존재 |
| 2 | Progress 데이터 범위 분리 | User Progress는 런타임 데이터이므로 Language Pack에 포함되지 않는 것이 맞으며, 실제로 VI_LANGUAGE_PACK.md에 사용자별 상태 데이터가 없음(정상) |
| 3 | ID 유일성 | FAIL-1~3의 포맷 위반에도 불구하고 각 ID 문자열 자체는 문서 내에서 중복 없이 유일함 |

### 2.2 PENDING 항목

#### PENDING-1. `(TBD)` Content의 API 계약상 상태 미정의

- **내용**: API_CONTRACT.md §7.1(`get_content`)은 결과를 `empty_result`(조건에 맞는 콘텐츠 없음) 또는 `error`로만 구분한다. 그런데 VI_LANGUAGE_PACK.md의 21개 노드는 Content ID는 존재하지만 `body`가 `(TBD)`인 **제3의 상태**다. 이 상태를 API가 `empty_result`로 취급할지, 별도 상태로 취급할지 정의되어 있지 않다.
- **권장 방향**: `(TBD)`는 Architecture 문서 단계의 기획 표기일 뿐 런타임 데이터가 아니므로, 실제 콘텐츠 제작 전까지는 해당 Content 레코드 자체가 데이터스토어에 **존재하지 않는 것**으로 취급해 `empty_result`로 처리하는 것을 권장한다. 별도 API_CONTRACT.md 개정은 불필요.

#### PENDING-2. 완전한 Content 레코드의 소재 분산

- **내용**: `GRAMMAR_VI_DA`, `GRAMMAR_VI_DANG`의 실제 완성된 Content(설명·예문 전체 텍스트)는 VI_LANGUAGE_PACK.md가 아니라 IMPLEMENTATION_BRIEF_v0.1.md §4.4에 있다. VI_LANGUAGE_PACK.md §6은 이를 "그대로 채택"한다고만 서술하고, 명시적인 상호 참조 링크나 재수록은 하지 않는다.
- **위험**: 향후 IMPLEMENTATION_BRIEF_v0.1.md가 개정·폐기되면 이 콘텐츠의 소재가 불분명해질 수 있다.
- **권장 방향**: 향후 별도 `VI_CONTENT.md`(Tier D) 문서를 만들어 완성된 Content 레코드를 이관하거나, 최소한 VI_LANGUAGE_PACK.md §6에 "실제 body는 IMPLEMENTATION_BRIEF §4.4 참조"라는 명시적 각주를 추가한다. 지금 당장 처리할 필요는 없으나 Tier D 설계 시 반영 필요.

---

## 3. Level 2 — Language Pack Validation

### 3.1 PASS 항목

| # | 항목 | 확인 내용 |
|---|---|---|
| 1 | Concept Category 커버리지 | 10개 Category 전부 최소 1개 이상의 노드 보유(TENSE 2, ASPECT 2, MODALITY 4, NEGATION 2, MOOD 3, QUANTITY 2, COMPARISON 2, CONDITIONAL 1, VOICE 2, PRAGMATICS 3) |
| 2 | 기능 단위 분리 원칙 준수 | `được` 사례가 GRAMMAR_SCHEMA §1 원칙대로 정확히 두 노드로 분리됨 |
| 3 | 목표 시나리오 4개 중 3개 조합 가능 | "나는 밥을 먹었다"(DA), "이거 살 수 있어요?"(CO_THE/DUOC_ABILITY + CO_KHONG), "이따가 갈게요"(SE)는 23개 노드만으로 구성 가능 |

### 3.2 PENDING 항목

#### PENDING-3. Wh-의문문 시나리오의 Grammar/Vocabulary 경계 불명확

- **내용**: 목표 시나리오 ②("너 지금 뭐 하고 있어?")는 PROGRESSIVE(`GRAMMAR_VI_DANG`)까지는 구성 가능하지만, "뭐"(무엇)에 해당하는 의문사 배치 규칙이 Grammar Node로 정의되어 있지 않다. `GRAMMAR_VI_CO_KHONG`은 예/아니오 의문문 전용이라 이 시나리오에 적용되지 않는다.
- **핵심 쟁점**: 베트남어 wh-의문문은 의문사(gì/ai/đâu 등)를 답이 들어갈 자리에 그대로 넣는 방식이라, 어순 자체는 평서문과 같고 의문사는 어휘(단어)에 가깝다. 즉 이것이 **Grammar Node가 필요한 문법 현상인지, 아니면 Vocabulary(어휘) 영역이라 Grammar Graph 밖인지**가 판정되지 않았다.
- **이 결정이 미치는 영향**: Vocabulary로 판정하면 v1.0의 "최소 회화 세트" 주장은 수정 없이 유효하다(시나리오 예시 문장만 교체하면 됨). Grammar로 판정하면 `CONCEPT_MOOD_WH_INTERROGATIVE` 같은 신규 Concept과 노드를 추가해야 하며, 이는 v1.1 이상의 범위 확장이 된다.
- **권장 방향**: 독단적으로 정하지 않고 다음 두 가지 대안 중 선택을 요청한다.
  - **안 A**: Wh-의문사는 Vocabulary로 규정하고 Grammar Graph 범위 밖으로 둔다. §1의 시나리오 예시 문장을 이 사실에 맞게 각주 처리하거나 교체한다. (권장 — 어순 자체에 별도 문법 규칙이 없으므로)
  - **안 B**: Wh-의문문 어순 자체를 별도 Concept(`CONCEPT_MOOD_WH_INTERROGATIVE`)으로 승격해 v1.1에서 다룬다.

---

## 4. 수정 우선순위 요약

| 우선순위 | 항목 | 유형 | 비용 |
|---|---|---|---|
| 1(필수) | FAIL-4 (누락된 Relation 추가) | 데이터 정합성 | 매우 낮음 |
| 2(필수) | FAIL-1~3 (ID 포맷 통일) | 명명 규칙 | 낮음(TBD 상태라 마이그레이션 비용 없음) |
| 3(권장) | PENDING-3 (Wh-의문문 결정) | 범위 판단 | 결정 필요, 구현 비용은 안 A 선택 시 0 |
| 4(선택) | PENDING-1, 2 | 문서 명확화 | 낮음 |

---

## 5. 다음 단계 권고

1. FAIL-1~4를 VI_LANGUAGE_PACK.md에 반영해 v1.1로 올린다(순수 명명 정정 + 관계 1건 추가이므로 구조 변경 없음).
2. PENDING-3(Wh-의문문 안 A/B)을 결정한다.
3. 재검증 후 Level 0가 완전히 PASS로 전환되면, VALIDATION_FRAMEWORK §10 Acceptance Criteria의 Level 0~2 요건을 충족한 것으로 간주하고 EN/JA/ZH 확장 여부를 검토한다.
4. Level 3(Learning Effect Validation)·Level 4(Human Validation)는 이번 검증 범위 밖이다 — 이는 실제 파일럿 학습자 데이터가 필요하므로 MVP 구현 이후 단계다.

---

## 6. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 검증 — Level 0 FAIL 4건(ID 포맷 3건, 데이터 정합성 1건), Level 1 PENDING 2건, Level 2 PENDING 1건 발견. 종합 판정: 조건부 통과(경미 수정 필요) |
