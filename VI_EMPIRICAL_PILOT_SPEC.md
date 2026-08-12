# VI Empirical Pilot Specification

문서 상태: Proposed  
Tier: Tier D Pilot Specification  
상위 계약: `VI_EMPIRICAL_EVIDENCE_CONTRACT.md`  
Baseline: `ef467e4076c8bfcfbef84d766f0b1b6b0550534b`

## 1. Pilot objective

- VI Grammar Node에 대한 유지·전이·반응 자동화 측정 가능성 검증
- n=1~3 instrumentation 단계에서 data completeness와 protocol feasibility 검증
- 12~20명 formative 단계에서 condition 간 방향성과 measurement reliability 확인
- 효능 최종 확증시험이 아니라 formative pilot

## 2. Phase structure

### Phase P0 — Synthetic validation

- PostgreSQL 합성 fixture
- Identity, idempotency, missing, technical failure, version snapshot 회귀
- 실제 learner·provider 없음

### Phase P1 — n=1~3 instrumentation

- participant 수: `[EVIDENCE-BOUND: 1~3]`
- 목적: timing, anchor, rubric, session, missing 및 human-audit instrumentation 검증
- human audit: 선정 audit 대상 전부 independent double rating 허용
- actual provider: 사용하지 않음
- raw audio: 수집하지 않음

### Phase P2 — 12~20명 formative pilot

- participant 수: `[EVIDENCE-BOUND: 12~20]`
- 목적: primary control과 experimental condition의 formative 비교
- human audit: representative overlap subset double rating
- overlap: `[PILOT-CALIBRATE]`
- actual provider: 별도 milestone 승인 여부에 따름
- audio: 별도 승인 전 제외

## 3. Grammar-node scope

- VI canonical node 총수: 24
- pilot node 수: `[EVIDENCE-BOUND: 12~20]` → selected 18 (pilot bound 12~20 준수, canonical 24 보존)
- exact node manifest: `[RESEARCH/PILOT-OWNED]` → B-2 final Research/Pilot adjudication로 확정 (3.1 참조)
- 포함 기준:
  - 빈도
  - 난이도 분포
  - 관계 구조
  - item 제작 가능성
  - 6개 scenario coverage
- 제외 및 이유 기록 필수 (3.2 참조)

### 3.1 Selected node manifest (18) — B-2 Research/Pilot adjudication

1. GRAMMAR_VI_DA
2. GRAMMAR_VI_SE
3. GRAMMAR_VI_DANG
4. GRAMMAR_VI_ROI
5. GRAMMAR_VI_CO_THE
6. GRAMMAR_VI_DUOC_ABILITY
7. GRAMMAR_VI_MUON
8. GRAMMAR_VI_PHAI
9. GRAMMAR_VI_KHONG
10. GRAMMAR_VI_CHUA
11. GRAMMAR_VI_CO_KHONG
12. GRAMMAR_VI_WH_INSITU
13. GRAMMAR_VI_CL_CAI
14. GRAMMAR_VI_CL_CON
15. GRAMMAR_VI_HON
16. GRAMMAR_VI_NHAT
17. GRAMMAR_VI_HAY
18. GRAMMAR_VI_DI

Category distribution (selected 18): TENSE 2 / ASPECT 2 / MODALITY 4 / NEGATION 2 / MOOD 4 / QUANTITY 2 / COMPARISON 2.

Difficulty distribution (selected 18): D1 7 / D2 7 / D3 2 / D4 2.

Relation retention (selected 18 대비 canonical relation 전체):

- PREREQUISITE 4/4
- CONTRAST 4/5
- ALTERNATIVE 1/1
- RELATED 4/6

Repository evidence has no validated corpus-frequency ranking. Do not claim this is the 18 most frequent Vietnamese constructions.

### 3.2 Excluded node manifest (6) — reasons

1. `GRAMMAR_VI_NEU_THI` — CONDITIONAL, difficulty 3. ACCEPTABLE TRADEOFF: S4 remains measurable with SE; no canonical relation removed; adds multi-clause/item-family/timepoint/RT-working-memory burden.
2. `GRAMMAR_VI_DUOC_PASSIVE` — VOICE, difficulty 3. SAFE EXCLUSION: no core scenario requires it; removes DUOC_PASSIVE ↔ BI contrast; adds `được` function/scoring ambiguity.
3. `GRAMMAR_VI_BI` — VOICE, difficulty 3. SAFE EXCLUSION: no core scenario requires it; same excluded Voice contrast; adds lexical-valence/scoring burden.
4. `GRAMMAR_VI_A_POLITE` — PRAGMATICS, difficulty 2. SAFE EXCLUSION: S6 pragmatics optional; related links with NHE/A_CONFIRM excluded; social/register scoring ambiguity.
5. `GRAMMAR_VI_NHE` — PRAGMATICS, difficulty 2. SAFE EXCLUSION: optional S6 probe only; A_POLITE ↔ NHE removed; context-dependent softening not required.
6. `GRAMMAR_VI_A_CONFIRM` — PRAGMATICS, difficulty 2. SAFE EXCLUSION: optional probe only; A_POLITE ↔ A_CONFIRM removed; pragmatic confirmation burden unnecessary.

18 selected + 6 excluded = 24.

## 4. Lexical envelope

- vocabulary target: `[EVIDENCE-BOUND: 300~500]`
- chunk/collocation/construction target: `[EVIDENCE-BOUND: 80~150]`
- manifest ID/version: `[RESEARCH/PILOT-OWNED]`
- source/provenance/license: 사람 data 전 확정
- OOV policy: `[PILOT-CALIBRATE]`
- canonical Vocabulary 변경: 금지
- canonical Lexico-Construction Graph: 금지

### 4.1 B-2 status (this patch)

- lexical manifest ID/version: unresolved
- lexical entries: unresolved
- source_refs: unresolved
- provenance: unresolved
- license verification: unresolved
- this patch does not satisfy lexical-manifest B-2 work
- B-2 remains open

## 5. Scenario manifest

- bounded scenario 수: `[EVIDENCE-BOUND: 정확히 6]` → 6개 확정 (5.1 참조)
- scenario IDs와 설명: `[RESEARCH/PILOT-OWNED]` → B-2 six-scenario Research/Pilot adjudication로 확정 (5.1 참조)
- 각 scenario의:
  - target node coverage
  - item-family coverage
  - lexical coverage
  - stimulus modality
  - response modality
- scenario holdout:
  - 필수 gate 아님
  - `[PILOT-CALIBRATE: exploratory/confirmatory 여부]`

### 5.1 Scenario manifest (6) — B-2 Research/Pilot adjudication

이 6개 scenario는 Research/Pilot-owned empirical pilot scenario다. `VI_LANGUAGE_PACK.md`의 canonical Learning Outcome Scenario가 아니다. Item ID/item-family ID는 아래에서 부여하지 않는다 (§6 참조).

#### 1. VI_PILOT_SCN_01_EVENT_STATUS — Event Status & Completion

- target node coverage: primary `GRAMMAR_VI_DA`, `GRAMMAR_VI_ROI`, `GRAMMAR_VI_KHONG`, `GRAMMAR_VI_CHUA`; secondary `GRAMMAR_VI_DANG`
- item-family coverage (intent): past event; completion/not-yet/negative; optional DA/DANG contrast
- lexical coverage (description): familiar event/task occurred/completed/not-yet/negative status reporting
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: STRONG

#### 2. VI_PILOT_SCN_02_CURRENT_ACTIVITY — Current Activity Inquiry

- target node coverage: primary `GRAMMAR_VI_DANG`, `GRAMMAR_VI_WH_INSITU`, `GRAMMAR_VI_CO_KHONG`; secondary `GRAMMAR_VI_DA`, `GRAMMAR_VI_KHONG`
- item-family coverage (intent): WH inquiry; yes/no verification; optional DA/DANG contrast
- lexical coverage (description): open-information or yes/no inquiry about current activity
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: STRONG

#### 3. VI_PILOT_SCN_03_CAPABILITY_DECISION — Capability, Need & Preference

- target node coverage: primary `GRAMMAR_VI_CO_THE`, `GRAMMAR_VI_DUOC_ABILITY`, `GRAMMAR_VI_MUON`, `GRAMMAR_VI_PHAI`; secondary `GRAMMAR_VI_KHONG`, `GRAMMAR_VI_CO_KHONG`
- item-family coverage (intent): capability; alternate ability realization; necessity/preference; capability question
- lexical coverage (description): ability/necessity/desire choice in constrained everyday decisions
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: STRONG

#### 4. VI_PILOT_SCN_04_FUTURE_CONTINGENCY — Future Plan & Contingency

- target node coverage: primary `GRAMMAR_VI_SE`; secondary `GRAMMAR_VI_MUON`, `GRAMMAR_VI_PHAI`
- `GRAMMAR_VI_NEU_THI` is excluded (§3.2) and MUST NOT be selected for this scenario
- item-family coverage (intent): scheduled future; future under changed context; optional preference/necessity context
- lexical coverage (description): near-future planning under bounded changed context without requiring learner-produced conditional clause
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: ADEQUATE

#### 5. VI_PILOT_SCN_05_COMPARE_SELECT — Compare & Select

- target node coverage: primary `GRAMMAR_VI_HON`, `GRAMMAR_VI_NHAT`, `GRAMMAR_VI_CL_CAI`, `GRAMMAR_VI_CL_CON`; secondary none
- item-family coverage (intent): inanimate comparison; animate comparison; comparison-only held-out family
- lexical coverage (description): compare/rank/select bounded objects or animals
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: STRONG

#### 6. VI_PILOT_SCN_06_DIRECTIVE_ACTION — Directive & Action Prompt

- target node coverage: primary `GRAMMAR_VI_HAY`, `GRAMMAR_VI_DI`; secondary none
- item-family coverage (intent): preverbal HAY; sentence-final DI; different action-family transfer
- lexical coverage (description): short concrete instruction/directive in everyday cooperative action
- mandatory lexical control: grammatical sentence-final `đi` (DI) and lexical verb `đi` MUST NOT occur in the same item
- stimulus modality: TEXT
- response modality: TEXT_ENTRY
- coverage: STRONG

## 6. Item and item-family design

각 item:

- item ID/version
- item-family ID
- scenario ID
- target node IDs
- lexical manifest version
- expected response/rubric
- exact/surface/family lineage rule
- modality components

Item-family holdout은 primary unseen transfer에 필수다.

### 6.1 B-2 status (this patch)

- exact pilot item/item-family manifest: unresolved
- `VI_CONTENT.md`는 authoring/rubric design에 참고할 수 있으나, empirical held-out item-family bank가 아니다
- primary unseen transfer는 `DIFFERENT_ITEM_FAMILY`를 요구한다
- item ID, item-family ID, rubric ID, item bank는 이 patch에서 발명하지 않는다
- this patch does not satisfy item/item-family B-2 work
- B-2 remains open

## 7. Experimental conditions

### Engineering baseline

- production fixed scheduler
- current Interleaving
- correctness regression 확인용

### Primary control

Condition label: `BLOCKED_FIXED`

- blocked practice
- fixed scheduling

### Experimental

Condition label: `ADAPTIVE_MIXED`

- blocked
- increasing
- interleaved
- adaptive scheduling

Condition ID/version은 실제 protocol을 immutable snapshot으로 보존한다.

## 8. Timepoints and anchor calibration

Target timepoints:

- immediate
- 7-day
- 30-day

Anchor candidates:

- node assignment completion
- qualifying criterion event
- grouped learning-block completion

`MASTERED` anchor는 제외한다.

Parameters:

- window: `[PILOT-CALIBRATE]`
- early/late/missed: `[PILOT-CALIBRATE]`
- reschedule/expiry: `[OWNER-DECISION]`
- anchor comparison method: `[RESEARCH/PILOT-OWNED]`

## 9. Assignment plan

Assignment types:

- learning
- review
- assessment

각 assignment에 immutable snapshot을 저장한다.

- experiment/condition version
- node/item/scenario/family
- lexical/rubric/formula/protocol version
- modality
- timepoint/anchor
- due/completion/outcome

## 10. Instrumentation plan

Minimum:

- session lifecycle
- attempt root
- client monotonic timing
- server receipt
- target-node evaluation
- correction aggregate
- duplicate/idempotency
- missing/technical/normal-empty 구분

Excluded:

- raw keystrokes
- pause
- VAD
- raw audio
- detailed repair taxonomy

## 11. Human audit plan

### P1

- selected audit items all double-rated allowed
- rubric defect/disagreement investigation
- adjudication separate

### P2

- representative overlap subset
- remaining audit sample single rating allowed
- overlap: `[PILOT-CALIBRATE]`
- agreement threshold: `[PILOT-CALIBRATE]`
- staffing/cost: `[OWNER-DECISION]`

## 12. Metrics

Required:

- retention
- unseen transfer
- RT median
- RT CV
- initiation latency
- self-correction
- completion
- dropout
- review debt
- human agreement

Formula version과 evidence contract §14를 따른다.

## 13. Missing and technical failure

반드시 분리:

- missing
- technical failure
- withdrawn
- unscorable
- normal empty
- learner incorrect
- late/early

Missing을 incorrect로 변환하지 않는다.

## 14. Data quality gates

P1→P2 진입 전 확인:

- Stable attempt root 중복 0
- Assignment snapshot 누락 0
- Node evaluation orphan 0
- Clock-quality 분류 가능
- Missing/technical outcome 구분 가능
- Item-family lineage 판정 가능
- Metric 재계산 가능
- Human rating original/adjudication 분리
- Privacy owner decisions 완료

정확한 허용률은 `[PILOT-CALIBRATE]`이며 근거 없이 확정하지 않는다.

## 15. Privacy and operations

사람 데이터 전 owner 결정:

- consent
- pseudonymous mapping
- access
- withdrawal
- deletion
- retention
- operational support
- incident handling

## 16. Actual-provider boundary

- P1 최소 instrumentation은 provider 없이 수행 가능
- actual provider는 별도 milestone
- 활성화 전 generation/validator audit contract 필수
- Mock과 실제 provider 결과를 같은 milestone evidence로 혼합하지 않음

## 17. Audio boundary

- 현재 raw audio 미수집
- speech response task는 audio owner approval 전 활성화하지 않거나 non-audio scoring path로 제한
- Audio observation identity만 예약
- VAD/pause/acoustic metric 없음

## 18. Pilot parameter register

각 parameter에 다음을 기록한다.

- name
- classification
- owner
- current value 또는 placeholder
- source/evidence
- version
- decision date
- applies-from phase
- superseded-by

### 18.1 Recorded decisions (B-2)

**Decision A**

- name: exact VI pilot Grammar Node set
- classification: EVIDENCE-BOUND
- owner: Research/Pilot
- current value 또는 placeholder: exact 18-node set in §3
- source/evidence: B-2 final Research/Pilot adjudication
- version: 1
- decision date: 2026-08-12
- applies-from phase: P1
- superseded-by: none

**Decision B**

- name: exact VI pilot six-scenario set
- classification: EVIDENCE-BOUND
- owner: Research/Pilot
- current value 또는 placeholder: exact six scenario IDs in §5
- source/evidence: B-2 six-scenario Research/Pilot adjudication
- version: 1
- decision date: 2026-08-12
- applies-from phase: P1
- superseded-by: none

## 19. Pilot stop conditions

다음은 efficacy FAIL이 아니라 instrumentation stop 조건이다.

- Participant identity/version linkage 불가
- Duplicate logical attempt 생성
- Condition contamination
- Item-family holdout 판정 불가
- Missing과 technical failure 구분 불가
- Privacy owner policy 위반
- Raw audio 무승인 수집
- Metric 재계산 불가

## 19.1 Cost and operational integrity stops

1. Cost ceiling exceeded — 사전 승인된 pilot-wide, per-session 또는 per-participant operating cost ceiling 중 하나를 초과. 각 ceiling 금액은 OWNER-DECISION이며 이 patch는 발명하지 않는다.
2. Cost attribution unavailable — participant, session 또는 provider-operation 단위로 발생 비용을 귀속하거나 재계산할 수 없음.
3. Infrastructure outage — persistence, participant identity, timing, exposure linkage 또는 audit completeness 보장 중 하나 이상이 protocol-compliant하게 유지되지 않는 장애. (§19의 "participant identity/version linkage 불가"는 탐지된 linkage 실패 fact를 다루고, 본 항목은 그 보장을 위협하는 infrastructure-level outage를 다룬다 — 서로 다른 trigger다.)
4. Repeated operational failure — 동일 operational failure가 owner-approved retry/recovery policy 적용 후에도 반복. Retry 횟수와 recovery time window는 OWNER-DECISION이며 이 patch에서 확정하지 않는다.
5. Capacity or quota exhaustion — database, provider, worker, storage 또는 operational quota 문제로 protocol-compliant session을 완료할 수 없음.
6. Recovery integrity failure — 복구 이후에도 §19에 정의된 위험 범주(duplicate logical attempt, condition contamination, missing/technical-failure ambiguity, metric non-recomputability) 중 하나 이상이 남아 있는지를 판정하는 resume-integrity gate. 하나라도 미해소면 재개하지 않는다.

공통 안전 조치: 위 조건은 efficacy FAIL이 아니라 instrumentation/operations integrity stop이다. 발생 시:

- 영향받은 participant/session 범위를 동결한다.
- 신규 assignment 및 신규 session 시작을 중단한다.
- raw evidence를 보존한다(수정·삭제하지 않는다).
- owner에게 escalate한다.
- 원인과 영향 범위가 해소되어 owner가 재개를 승인하기 전에는 재개하지 않는다.

## 20. Approval boundary

이 문서 승인은 specific pilot operation을 허용하지만 Tier A, production Progress, production scheduler 또는 Interleaving 변경을 허용하지 않는다.
