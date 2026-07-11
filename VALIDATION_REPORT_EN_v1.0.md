# VALIDATION_REPORT_EN_v1.0.md
## EN_LANGUAGE_PACK v1.0 검증 보고서 — 첫 비베트남어 Language Pack

> 검증 대상: `EN_LANGUAGE_PACK.md` (개정 이력 1.0)
> 검증 기준: `VALIDATION_FRAMEWORK.md` Level 0~2 + 언어 독립성 4개 항목(사용자 지정)
> 검증 방법: 문서 정합성 검토 + 실제 목표 문장으로 조합 가능성 시뮬레이션(코드 실행 아님)
> 검증일: 2026-07-06

---

## 0. 종합 결과 요약

| 기준 | 판정 |
|---|---|
| Level 0 — Schema Validation | **통과** (검증 중 2건 자체 발견·수정 완료) |
| Level 1 — Engine/API Contract Validation | **조건부 통과** (VI와 동일한 기존 PENDING 2건, 신규 없음) |
| Level 2 — Language Pack Validation | **조건부 통과** (PENDING 1건 신규 발견) |
| 기존 Universal Concept만으로 충분한가 | **대체로 예** — 19/20 매핑 재사용, 1건만 정직하게 신규 추가 |
| 새 Category 없이 자연스럽게 매핑되는가 | **예** — Category 추가 0건 |
| Identifier 규칙이 영어에서도 동작하는가 | **예, 단 관찰 사항 1건** — 구조 전용 SLUG 패턴이 3번째로 반복됨 |
| Language Pack 구조가 베트남어에 종속되지 않았는가 | **예** — 10장 구조를 그대로 사용, VI 종속 코드/필드 없음 |

**결론**: 구조적으로는 완전히 통과했다. 실제 문장으로 조합을 시도하는 과정에서 언어학적으로 부정확한 관계 1건을 발견해 문서 작성 중 직접 수정했고, 모델링 공백 1건을 신규 PENDING으로 남겼다. 이 공백은 v1.0의 "최소 회화 세트" 주장 자체를 무효화하지 않는다(아래 3장 참고).

---

## 1. Level 0 — Schema Validation

### 1.1 PASS 항목

| # | 항목 | 확인 내용 |
|---|---|---|
| 1 | Concept/Grammar Node/Relation ID 형식 | 19개 Concept, 20개 Grammar Node, 12개 Relation 전부 IDENTIFIER_STANDARD 형식 준수 |
| 2 | Content/Relation ID 언더스코어 보존 | VI에서 발견된 FAIL-1~3(언더스코어 누락)이 이번에는 **한 건도 재발하지 않음** — 전수 확인(자동 스캔) |
| 3 | 노드-Concept 참조 무결성 | 20개 노드 전부 존재하는 Concept 참조, 19개 Concept 전부 최소 1회 사용(고아 없음) |
| 4 | 관계-노드 참조 무결성 | 12개 Relation의 from/to 전부 존재하는 노드 참조 |
| 5 | PREREQUISITE 단방향성·순환 없음 | 4개 PREREQUISITE 전부 UNIDIRECTIONAL, 독립된 엣지들로 순환 없음 |
| 6 | 영어 SLUG 정규화 규칙 | "단어 그대로 대문자화, 공백→`_`" 규칙이 대부분 정확히 적용됨(`WANT_TO`, `NOT_YET` 등) |
| 7 | Auxiliary+Pattern 규칙 실제 적용 | `BE_VING`, `HAVE_VPP`, `BE_VPP`가 이번에 신설된 IDENTIFIER_STANDARD §3 규칙을 정확히 따름 — **규칙이 실전에서 작동함을 확인** |
| 8 | Surface Form/Function 분리 원칙 적용 | `COMPARATIVE`(-er/more), `SUPERLATIVE`(-est/most)를 노드로 쪼개지 않고 `surface_forms` 배열로 처리 — 원칙이 정확히 지켜짐 |

### 1.2 검증 중 자체 발견·수정한 항목 (문서에 이미 반영됨)

#### 발견-1. §4/§5 뷰 불일치 — CAN-HAVE_TO RELATED 누락 (VI FAIL-4와 동일 유형)

§4.3에서 `HAVE_TO`의 관계 칸에 `Related: CAN`이라고 적었으나, §5 마스터 카탈로그에는 `CONTRAST` 관계만 있고 `RELATED` 관계가 없었다. `REL_HAVE_TO_RELATED_CAN`을 추가해 수정했다(Relation 총 개수 11→12).

**교훈**: VI 검증에서 이미 한 번 지적된 실수 패턴(§4 서술과 §5 마스터 카탈로그의 불일치)이 언어를 바꿔도 동일하게 재발할 수 있음을 확인했다. VI_LANGUAGE_PACK §8에 추가했던 체크리스트 항목("§4/§5 일치 확인")을 EN_LANGUAGE_PACK.md §8에도 동일하게 넣어뒀지만, 작성 과정에서 여전히 발생했다 — 이는 **체크리스트만으로는 부족하고, 작성 직후 자동 대조(§5 관계 목록과 §4 각 행을 기계적으로 교차 확인)가 필요하다**는 신호다.

#### 발견-2. WH_FRONTING-DO_SUPPORT_Q 관계 유형 오류

원래 `PREREQUISITE`(WH_FRONTING → DO_SUPPORT_Q)로 정의했으나, 실제 목표 문장으로 검증하는 과정(3장)에서 "What **are** you doing?"처럼 `BE_VING`의 자체 도치만으로 완성되는 Wh-의문문이 있어 do-support가 선행 조건이 아님을 확인했다. `RELATED`로 정정했다.

**교훈**: 관계 유형(특히 PREREQUISITE)은 "보통 그렇다"가 아니라 "예외 없이 그렇다"일 때만 붙여야 한다. 실제 문장 시뮬레이션이 이런 과잉 일반화를 잡아내는 데 효과적이었다.

---

## 2. Level 1 — Engine/API Contract Validation

VI와 동일한 PENDING이 그대로 적용되며, 이번 언어팩에서 새로 발생한 문제는 없다.

| # | 항목 | 상태 |
|---|---|---|
| PENDING(기존) | `(TBD)` Content의 API 계약상 상태 | VI와 동일 — 런타임에는 `empty_result`로 취급 권장, 변경 없음 |
| PENDING(기존) | 완성된 Content가 여러 문서에 분산 | `GRAMMAR_EN_PAST_SIMPLE`/`GRAMMAR_EN_BE_VING` 콘텐츠도 이 문서 §6에만 있음 — Tier D 설계 시 함께 정리 필요 |

---

## 3. Level 2 — Language Pack Validation

### 3.1 PASS 항목

| # | 항목 | 확인 내용 |
|---|---|---|
| 1 | Concept Category 커버리지 | 10개 Category 전부 최소 1개 이상 노드 보유 |
| 2 | 같은 단어, 다른 기능 원칙 | `could`(가능의 과거형 형태이나 PRAGMATICS_SOFTENING) 사례로 정확히 적용 |
| 3 | 같은 기능, 다른 형태 원칙(신규 검증 축) | `-er`/`more`, `-est`/`most`를 하나의 노드로 유지 — VI에는 없던 검증 항목을 EN이 처음으로 통과 |

### 3.2 목표 시나리오 검증 (문서에 명시되어 있지 않아 이번 검증에서 직접 구성)

**발견**: EN_LANGUAGE_PACK.md §1에는 VI_LANGUAGE_PACK.md §1과 달리 **구체적인 목표 회화 시나리오 문장이 없다.** 검증을 위해 이번에 직접 구성했다.

| 시나리오 | 필요 요소 | 결과 |
|---|---|---|
| ① I worked yesterday. | `PAST_SIMPLE`(규칙형만 사용, 1.2절 원칙 준수) | PASS |
| ② What are you doing now? | `WH_FRONTING` + `BE_VING`(do-support 불필요 — 발견-2를 실제로 입증하는 사례) | PASS |
| ③ Can I buy this? | `CAN` + 의문문 도치 | **PENDING — 아래 참고** |
| ④ I'll go later. | `WILL` | PASS |

#### PENDING-EN-1. Modal 도치(Subject-Auxiliary Inversion) 메커니즘 미모델링

"Can I buy this?"는 `do`를 쓰지 않고 조동사(`can`)와 주어의 위치를 직접 바꾸는 **일반 주어-조동사 도치**로 만들어진다. 현재 `GRAMMAR_EN_DO_SUPPORT_Q`는 이 일반 메커니즘의 **특수 사례**(조동사가 없는 본동사 문장에서만 `do`를 끼워 넣는 경우)만 다루고 있어, modal 문장의 의문문 도치를 표현할 별도 노드가 없다.

- **v1.0 "최소 회화 세트" 주장에 미치는 영향**: 무효화하지 않는다. `CAN`은 평서문("I can swim")에서는 완전히 기능하고, 예/아니오 의문문 자체는 `DO_SUPPORT_Q`(일반 동사 대상)로 이미 최소 커버되어 있다. 이번 공백은 "Modal + 의문문"이라는 **더 좁은 조합**에서만 드러난다.
- **권장 조치(v1.1로 이월, 지금 결정하지 않음)**: `DO_SUPPORT_Q`를 "일반 주어-조동사 도치"라는 상위 개념으로 재정의하고 `do`-삽입을 그 하위 규칙으로 둘지, 아니면 별도 `GRAMMAR_EN_MODAL_INVERSION_Q` 노드를 신설할지는 두 가지 대안이 있다. 지금 결정하면 추측이 되므로 다음 버전에서 근거를 갖고 결정한다.

### 3.3 언어 독립성 검증 (사용자 지정 4개 항목 상세)

1. **기존 Universal Concept만으로 충분한가**: 20개 노드 중 19개는 기존 Concept에 정확히 매핑되었고, 1개(QUANTITY)만 억지로 끼워 맞추지 않고 정직하게 새 Function(`PARTITIVE`)을 추가했다. "충분함"의 기준을 "100% 무수정"이 아니라 "정당한 근거 없이 억지로 끼워 맞추지 않음"으로 본다면 이 기준을 통과한 것으로 판단한다.
2. **새 Category 없이 매핑되는가**: 그렇다. Tier C(새 Category, CONCEPT_SCHEMA §11) 절차는 한 번도 필요하지 않았다.
3. **Identifier 규칙이 영어에서 문제없이 동작하는가**: 대체로 그렇다. 다만 `WH_FRONTING`, `DO_SUPPORT_Q`처럼 특정 단어가 아니라 **문법 메커니즘을 가리키는 SLUG**가 이번에 2개 더 나왔다(베트남어 `WH_INSITU`에 이어 3번째, 4번째 사례). IDENTIFIER_STANDARD.md는 아직 이 패턴을 "어휘 기반 SLUG"의 예외로만 다루고 공식 규칙화하지 않았다 — 세 번 이상 반복된 패턴이므로 이제 공식 규칙으로 승격할 시점이라고 판단한다(권장, 별도 승인 필요).
4. **Language Pack 구조가 베트남어에 종속되지 않았는가**: 그렇다. VI_LANGUAGE_PACK.md의 10개 장 구조, Content/Relation 카탈로그 형식, 검증 체크리스트 항목까지 전부 그대로 재사용되었고 EN 전용으로 구조를 바꾼 부분은 없다.

---

## 4. 종합 판정 및 다음 단계

- Level 0: 통과(자체 수정 2건 반영 완료)
- Level 1: 조건부 통과(기존 PENDING, 신규 없음)
- Level 2: 조건부 통과(PENDING-EN-1, v1.0 최소 세트 주장은 유효)
- **EN_LANGUAGE_PACK v1.0은 Level 0~2 기준으로 Acceptance 가능하다.**

**권장 후속 조치**

1. PENDING-EN-1(Modal 도치)은 v1.1에서 대안 비교 후 결정
2. "구조 전용 SLUG" 패턴을 IDENTIFIER_STANDARD.md 공식 규칙으로 승격할지 결정 필요(3회 반복 확인됨)
3. EN_LANGUAGE_PACK.md §1에 VI처럼 명시적 목표 시나리오 문장을 추가하는 것을 v1.1에 반영(이번 검증에서 그 부재 자체가 발견 사항이었음)
4. Vocabulary Schema(Tier A) 신설 여부는 여전히 미결 — 불규칙 동사(EN)와 Wh-단어(VI, EN 공통)가 모두 이 결정을 기다리고 있음

---

## 5. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 검증 — Level 0 통과(자체 발견 2건 수정 완료), Level 1 조건부 통과(기존 PENDING 유지), Level 2 조건부 통과(PENDING-EN-1 신규). 언어 독립성 4개 항목 모두 확인. 구조 전용 SLUG 패턴의 IDENTIFIER_STANDARD 공식화 필요성 제기 |
