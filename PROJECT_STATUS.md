# PROJECT_STATUS.md

## 0. Authority

**Current Implementation State and Product Readiness Authority.** This document owns the current implementation state and product readiness for the Language Learning Engine. Roadmap/position is owned by `PROJECT_MASTER_INDEX.md`; validation state is owned by `VALIDATION_STATUS.md`; Architecture Clarification status is owned by `ARCHITECTURE_CLARIFICATION_BACKLOG.md`. Session startup order is owned by `BOOTSTRAP.md`.

## 1. Repository and Implementation Layers

Git ref, runtime-validated implementation, independent review target, and review-record commit are separate authorities and are not merged into a single "current implementation SHA".

- **GitHub main ref**: `GitHub refs/heads/main` is the authority for current repository HEAD.
- **Runtime-validated implementation**: `593b5a4a11fb394a3db6b47a56e2d7b6ceccda0e`
- **Independent review target**: `30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`
- **Review-record commit**: `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.41 — B-5/B-4 governance documentation independent review and main integration record)

Detailed runtime figures (environment, test totals, migration/table counts) are owned only by `VALIDATION_STATUS.md` §A.2.

## 2. Implemented Runtime Surfaces

- Learning Flow five-branch decision path (REVIEW / NEW_GRAMMAR / INTERLEAVING / CONVERSATION / IDLE)
- In-process Learning Flow transport
- AC-018 first Mock composition
- Fail-closed unconfigured provider adapter
- Evidence Foundation 16-table persistence
- Bounded assignment creation, attempt open, and finalization repository operations
- RULE-based target-node evaluation and correction aggregate persistence

## 3. Product Readiness

- Backend runtime: partial implementation
- Actual provider: incomplete
- Evidence Foundation overall: incomplete
- VI pilot: not started
- VI Empirical Pilot P1 governance prerequisites B-4 (cost/operational stop conditions) and B-5 (approval-provenance scope) are complete as bounded documentation prerequisites (main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`); implementation/data prerequisites B-1 (assignment/session lifecycle writer), B-2 (VI pilot content manifest), and B-3 (human-data/privacy owner decision) remain unresolved and P1 remains not started.
- Client/user app: incomplete
- Beta readiness: not ready

## 4. Deferred Boundaries

- Evidence recorder orchestration
- Learning Flow/Public evidence integration
- production/evidence dual-write
- assignment completion
- full session lifecycle
- restart/reschedule
- full retry lifecycle
- human/AI-assisted evidence rating
- actual provider
- raw audio/acoustic processing
- P1/P2 human-data operation approval
- product UI/release completion

## 5. Explicit Non-Declarations

- AC-017 CLOSED
- AC-017 IMPLEMENTED
- AC-018 CLOSED
- AC-018 IMPLEMENTED
- Validation Level 3 §10 overall PASS
- actual-provider milestone complete
- Evidence Foundation overall complete
- VI pilot efficacy verified
- Beta Release ready
- user app complete
- VI Empirical Pilot P1 activated
- human-data collection approved

## 6. Historical Snapshot — 2026-07-06

> The following subsections are the original 2026-07-06 project status snapshot, preserved unchanged in content. Only heading levels/numbers were renumbered to nest under this section; no historical fact, figure, or decision was deleted or rewritten. Current implementation state and product readiness live in §0–§5 above.

### 6.0 LLE(Language Learning Engine) 공식 현황판

> 이 문서는 새로운 세션에서 프로젝트를 빠르게 이어가기 위한 **공식 현황 문서**다. 다른 어떤 문서보다 먼저 이 문서를 읽는다. 모든 산출물은 실제 파일로 존재하며, 이 대화 기록에 의존하지 않는다.
>
> (Historical framing note: as of this reconciliation, §0–§5 above are the current authority; this §6.0 blockquote is preserved as the original 2026-07-06 framing.)

### 6.1 현재 프로젝트 버전

**LLE Core Standard v1.0 — Frozen (2026-07-06 사용자 승인 완료)**

Tier A(Core Standard) 12개 문서가 공식적으로 확정됐다. Language Pack(Tier B)은 언어별로 별도 버전을 가지며 Core Standard 버전과 독립적으로 계속 진화한다(4장 참고).

---

### 6.2 현재 완료된 Tier

| Tier | 상태 | 요약 |
|---|---|---|
| **Tier 0**(철학) | **완료** | PROJECT_VISION, LEARNING_THEORY — 프로젝트 존재 이유와 학습 이론적 기반 |
| **Tier A**(Core Standard) | **완료 — v1.0 Frozen** | 12개 문서, 4개 유형론적 언어(VI/EN/JA/ZH) + Pinyin 스트레스 테스트로 검증 완료 |
| **Tier B**(Language Pack) | **4개 언어 완료, 계속 확장 가능(Controlled Open)** | VI/EN/JA/ZH, 전부 LANGUAGE_PACK_STANDARD 표준 템플릿 준수 |
| **Tier C**(구현) | **부분 완료 — MVP 수준** | Engine 계약·API 계약은 정의됐으나, 실제 프로덕션 구현 지시서는 MVP 브리프 수준에 머물러 있음 |
| **Tier D**(콘텐츠) | **구조만 완료 — 실 데이터는 초기 단계** | 4개 언어 모두 컨테이너 문서 존재, 완성된 Content는 VI 2개·EN 2개 노드 분량뿐 |

---

### 6.3 현재 완료된 핵심 문서 목록

#### Tier 0
- `PROJECT_VISION.md`
- `LEARNING_THEORY.md` (v1.2)

#### Tier A (Core Standard v1.0, Frozen)
- `LEARNING_PROTOCOL.md` (v1.0)
- `CONCEPT_SCHEMA.md` (v1.5)
- `GRAMMAR_SCHEMA.md` (v1.6)
- `GRAMMAR_GRAPH.md` (v1.4)
- `IDENTIFIER_STANDARD.md` (v1.10)
- `VALIDATION_FRAMEWORK.md` (v1.1)
- `CONTENT_SCHEMA.md` (v1.0)
- `PROGRESS_SCHEMA.md` (v1.0)
- `VOCABULARY_SCHEMA.md` (v1.0)
- `LANGUAGE_PACK_STANDARD.md` (v1.0)

#### Tier B (Language Pack)
- `VI_LANGUAGE_PACK.md` (v1.2)
- `EN_LANGUAGE_PACK.md` (v1.2)
- `JA_LANGUAGE_PACK.md` (v1.0)
- `ZH_LANGUAGE_PACK.md` (v1.0)

#### Tier C (구현)
- `ENGINE_INTERFACE.md` (v1.4)
- `API_CONTRACT.md` (v1.1)
- `IMPLEMENTATION_BRIEF_v0.2.md`
- `MIGRATION_GUIDE.md` (v1.0)

#### Tier D (콘텐츠)
- `VI_CONTENT.md` / `EN_CONTENT.md` / `JA_CONTENT.md` / `ZH_CONTENT.md`

#### 검증·종합 보고서 (횡단 문서)
- `VALIDATION_REPORT_VI_v1.0.md`, `VALIDATION_REPORT_VI_v1.1.md`
- `VALIDATION_REPORT_EN_v1.0.md`
- `VALIDATION_REPORT_ZH_v1.0.md`(JA는 별도 보고서 없이 설계 단계에서 선제 해소)
- `LANGUAGE_VALIDATION_SUMMARY_V1.md` (v1.3)
- `PINYIN_NORMALIZATION_STRESS_TEST.md` (v1.0)
- `CORE_STANDARD_V1_FREEZE.md` (v1.1, **승인 완료**)

---

### 6.4 현재 완료된 Language Pack

| 언어 | 버전 | Grammar Node | Concept 사용 | 신규 Concept | Level 0~2 검증 |
|---|---|---|---|---|---|
| VI(고립어) | v1.2 | 24 | 20 | 2건(PRAGMATICS Category+WHQUESTION) | PASS |
| EN(분석어) | v1.2 | 21 | 19 | 1건(PARTITIVE) | PASS |
| JA(교착어) | v1.0 | 19 | 18 | 0건 | PASS |
| ZH(고립어+성조+한자) | v1.0 | 21 | 19 | 0건 | PASS |

Concept 총 21개, Category 10개. 신규 Concept 필요 건수 추세: **2→1→0→0**(수렴 중, Controlled Open 유지, Frozen까지 1개 언어 부족).

---

### 6.5 아직 남아있는 작업

**Tier A 관련(Controlled Open 항목, Freeze 대상 아님)**
- Concept 목록 Frozen 격상 — 다섯 번째 언어에서 재확인 필요
- Auxiliary+Pattern·Structure-only SLUG 규칙의 사례 다양성 부족(둘 다 지금까지 사례가 편중됨)
- "복수형(Number/Plural)" Concept 공백 — 필요성 미확인

**Tier B 관련(각 언어팩 v1.1+ 이월 항목)**
- VI: vừa mới/đã từng(과거 뉘앙스 확장)
- EN: must(ALTERNATIVE), be going to/used to/have been V-ing
- JA: 가능형 활용(食べられる, ALTERNATIVE 후보), と/ば/なら, する/来る 불규칙, 완료상 세분화
- ZH: 会의 능력 표현 이중 기능(ALTERNATIVE), 把구문, 방향보어, 양사 어휘 확장

**Tier C 관련**
- `(TBD)` Content의 API 계약상 상태 정의(empty_result 처리 권장, 미확정)
- MVP 브리프 수준을 넘어선 전체 프로덕션 Engine 구현 지시서 작성

**Tier D 관련**
- 4개 언어 전부 대부분의 Content 본문이 `(TBD)` — 실제 콘텐츠 제작 착수 필요
- Vocabulary `features` 필드의 실제 Content 운영 단계 검증

**그 외**
- Level 3(Learning Effect Validation)·Level 4(Human Validation) — 실제 파일럿 학습자 데이터 필요, 아직 범위 밖
- 다섯 번째 Language Pack 착수 여부

---

### 6.6 현재 승인 완료된 사항

- **LLE Core Standard v1.0 Freeze**(2026-07-06, `CORE_STANDARD_V1_FREEZE.md` v1.1)
- VI/EN/JA/ZH 4개 Language Pack의 Level 0~2 Acceptance
- Pinyin Normalization 규칙 — Experimental → **Frozen(언어 특정)** 승격
- Vocabulary `features` 예약 필드 — Experimental → Controlled Open 승격
- PRAGMATICS Category 신설(Tier C, VI), `CONCEPT_MOOD_WHQUESTION`(Tier B, VI), `CONCEPT_QUANTITY_PARTITIVE`(Tier B, EN)
- Content/Progress를 GRAMMAR_SCHEMA에서 분리해 각각 CONTENT_SCHEMA·PROGRESS_SCHEMA로 독립(4축 SSOT: Grammar/Vocabulary/Content/Progress)
- Structure-only SLUG 규칙, Auxiliary+Pattern 규칙(형태소 결합 순서 일반화 포함) 공식화
- `get_due_reviews` API 추가(API_CONTRACT v1.1)

---

### 6.7 현재 Pending 항목

| # | 항목 | 우선순위 |
|---|---|---|
| 1 | Concept 목록 Frozen 격상 여부(5번째 언어 필요) | 중 |
| 2 | Auxiliary+Pattern·Structure-only SLUG 사례 다양성 확보 | 중 |
| 3 | Number/Plural Concept 공백 필요성 확인 | 낮음 |
| 4 | `(TBD)` Content의 API 계약 상태 정의 | 낮음 |
| 5 | 각 언어팩 v1.1+ 이월 항목(5장 참고) | 낮음, Language Pack 수준 |
| 6 | Tier D 콘텐츠 실제 제작 | 높음(다음 단계로 유력) |
| 7 | Tier C 전체 프로덕션 구현 지시서화 | 높음(다음 단계로 유력) |

---

### 6.8 다음 작업 우선순위 (제안, 사용자 결정 필요) — historical

> 이 목록은 2026-07-06 시점 제안이며 historical 참고용이다. 현재 방향은 `PROJECT_MASTER_INDEX.md`의 Current Active Milestone / Next Product Milestone Candidate를 따른다.

1. **Tier D 콘텐츠 제작 착수** — 구조는 완성됐으나 실 데이터가 거의 없다. VI부터 실제 학습 콘텐츠(설명·예문·QUIZ 등)를 채우면 나머지 Tier가 실제로 쓰일 수 있는 상태가 된다.
2. **Tier C 구현 지시서 확장** — MVP 브리프를 넘어 실제 프로덕션 Engine 구현으로 이어지는 문서화.
3. **다섯 번째 Language Pack** — Concept Frozen 격상의 마지막 근거를 확보.
4. **Level 3 파일럿 준비** — 실제 학습자 데이터를 수집할 최소 환경 논의.

이 순서는 권고일 뿐이며, 다음 세션에서 사용자가 우선순위를 재조정할 수 있다.

---

### 6.9 새 세션 시작 시 반드시 알아야 하는 사항

- **역할**: Claude는 이 프로젝트에서 Chief Software Architect다. **코드를 작성하지 않는다.** 실제 구현은 별도 Development 프로젝트/도구(Claude Code 등)의 몫이며, Architecture 세션은 설계 문서만 다룬다.
- **산출물의 위치**: 모든 결정과 구조는 대화가 아니라 `/mnt/user-data/outputs/`의 실제 마크다운 파일에 있다. 새 세션에서는 이 파일들(특히 본 문서와 Tier A 12개)을 먼저 확인한다.
- **문서 계층**: Tier 0(철학) → Tier A(Core Standard, Frozen) → Tier B(Language Pack) → Tier C(구현) → Tier D(콘텐츠). 상위 Tier가 하위 Tier에 대해 항상 최종 권위를 갖는다.
- **Freeze 거버넌스**: Tier A 문서를 변경하려면 `CORE_STANDARD_V1_FREEZE.md` §5의 절차(근거 문서화 → 대안 비교 → 명시적 승인 → 개정 이력·MIGRATION_GUIDE 기록)를 따른다. Tier B/C/D는 기존처럼 유연하게 확장 가능하다.
- **의사결정 스타일**: 불확실하거나 프로젝트 전체에 영향을 주는 결정은 독단적으로 내리지 않고 대안을 비교해 승인을 받은 뒤 진행한다. 이 원칙은 Freeze 이후에도 그대로 유지된다.
- **이 문서 자체가 살아있는 문서**: 작업이 진행될 때마다 이 문서(특히 5·6·7·8장, 현재는 §6.5·6.6·6.7·6.8)를 갱신하는 것이 프로젝트 관리의 일부였다. 현재는 §0–§5가 이 갱신 책임을 진다.

---

### 6.10 마지막 업데이트

**2026-07-06** — LLE Core Standard v1.0 Freeze 승인 직후 최초 작성.
