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
- pilot node 수: `[EVIDENCE-BOUND: 12~20]`
- exact node manifest: Research/Pilot-owned exact 18-node manifest — §3.1에 기록됨
- 포함 기준:
  - 빈도
  - 난이도 분포
  - 관계 구조
  - item 제작 가능성
  - 6개 scenario coverage
- 제외 및 이유 기록 필수 — 아래 §3.2에 기록됨

### 3.1 Selected pilot node manifest

Research/Pilot adjudication으로 확정된 선정 node는 정확히 18개이며 순서는 다음과 같다.

1. `GRAMMAR_VI_DA`
2. `GRAMMAR_VI_SE`
3. `GRAMMAR_VI_DANG`
4. `GRAMMAR_VI_ROI`
5. `GRAMMAR_VI_CO_THE`
6. `GRAMMAR_VI_DUOC_ABILITY`
7. `GRAMMAR_VI_MUON`
8. `GRAMMAR_VI_PHAI`
9. `GRAMMAR_VI_KHONG`
10. `GRAMMAR_VI_CHUA`
11. `GRAMMAR_VI_CO_KHONG`
12. `GRAMMAR_VI_WH_INSITU`
13. `GRAMMAR_VI_CL_CAI`
14. `GRAMMAR_VI_CL_CON`
15. `GRAMMAR_VI_HON`
16. `GRAMMAR_VI_NHAT`
17. `GRAMMAR_VI_HAY`
18. `GRAMMAR_VI_DI`

선정 수 18은 pilot bound `[EVIDENCE-BOUND: 12~20]` 안에 있다.

Approved category distribution:

- TENSE 2
- ASPECT 2
- MODALITY 4
- NEGATION 2
- MOOD 4
- QUANTITY 2
- COMPARISON 2

Approved difficulty distribution:

- D1 7
- D2 7
- D3 2
- D4 2

Approved canonical relation retention:

- PREREQUISITE 4/4
- CONTRAST 4/5
- ALTERNATIVE 1/1
- RELATED 4/6

Limitation — 명시적 기록:

Repository evidence has no validated corpus-frequency ranking.
따라서 이 18개를 "가장 빈도가 높은 Vietnamese construction 18개"라고 주장하지 않는다.

### 3.2 Excluded nodes and reasons

제외 node는 정확히 6개이며 각각의 disposition, scenario impact, relation impact, reason을 기록한다.

**1. `GRAMMAR_VI_NEU_THI`**

- category: CONDITIONAL
- difficulty: 3
- disposition: ACCEPTABLE TRADEOFF
- scenario impact: S4 remains measurable with `GRAMMAR_VI_SE`; conditional extension is deferred.
- relation impact: No canonical relation is removed.
- reason: Adds multi-clause/item-family/timepoint burden and RT/working-memory confounding.

**2. `GRAMMAR_VI_DUOC_PASSIVE`**

- category: VOICE
- difficulty: 3
- disposition: SAFE EXCLUSION
- scenario impact: No six-scenario core target requires it.
- relation impact: DUOC_PASSIVE ↔ BI contrast is omitted.
- reason: Adds passive `được` functional/scoring ambiguity while DUOC_ABILITY is separately selected.

**3. `GRAMMAR_VI_BI`**

- category: VOICE
- difficulty: 3
- disposition: SAFE EXCLUSION
- scenario impact: No six-scenario core target requires it.
- relation impact: Same omitted Voice contrast pair.
- reason: Adds lexical-valence/scoring burden without core P1 necessity.

**4. `GRAMMAR_VI_A_POLITE`**

- category: PRAGMATICS
- difficulty: 2
- disposition: SAFE EXCLUSION
- scenario impact: S6 pragmatics are optional; directive core remains HAY/DI.
- relation impact: Related links with NHE/A_CONFIRM are omitted.
- reason: Social/register dependence adds unnecessary P1 scoring ambiguity.

**5. `GRAMMAR_VI_NHE`**

- category: PRAGMATICS
- difficulty: 2
- disposition: SAFE EXCLUSION
- scenario impact: Optional S6 probe only.
- relation impact: A_POLITE ↔ NHE omitted.
- reason: Context-dependent softening is not required for S6 core.

**6. `GRAMMAR_VI_A_CONFIRM`**

- category: PRAGMATICS
- difficulty: 2
- disposition: SAFE EXCLUSION
- scenario impact: Optional probe only.
- relation impact: A_POLITE ↔ A_CONFIRM omitted.
- reason: Pragmatic confirmation burden is unnecessary for text-only P1 core.

### 3.3 Reconciliation

18 selected + 6 excluded = 24 canonical VI nodes.

## 4. Lexical envelope

- vocabulary target: `[EVIDENCE-BOUND: 300~500]`
- chunk/collocation/construction target: `[EVIDENCE-BOUND: 80~150]`
- manifest document: `VI_PILOT_LEXICAL_MANIFEST.md`
- manifest ID: `LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT`
- manifest version: `1`
- exact vocabulary candidate count: `300` (the fixed pilot scope's lower evidence-bound; occupies the low end of `[EVIDENCE-BOUND: 300~500]`)
- exact combined chunk/collocation/construction candidate count: `80` (the fixed pilot scope's lower evidence-bound; occupies the low end of `[EVIDENCE-BOUND: 80~150]`)
- source/provenance/license: pinned Leipzig `vie_news_2022_1M` News corpus derivative, CC BY 4.0 verified — recorded in `VI_PILOT_LEXICAL_MANIFEST.md` §2
- `approved_for_pilot`: `false`
- canonical Vocabulary 변경: 금지
- canonical Lexico-Construction Graph: 금지
- OOV policy: `[PILOT-CALIBRATE]` (partly — see `VI_PILOT_LEXICAL_MANIFEST.md` §10 for the FIX NOW / PILOT-CALIBRATE / DEFER split)

### 4.1 Lexical manifest status

이 patch는 versioned lexical candidate를 기록한다. 현재 상태는 다음과 같다.

- exact versioned lexical candidate (`LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT`, version 1): RECORDED
- exact 300 word/lemma-like entries (`LEXICAL_ENTRY_VI_0001..0300`): RECORDED
- exact 80 multiword entries (`LEXICAL_ENTRY_VI_0301..0380`): RECORDED
- `source_refs`: RECORDED
- provenance: RECORDED
- Leipzig source/license verification: RECORDED
- `approved_for_pilot`: `false`
- `item_links`: 모든 entry에서 `[]` — pilot-specific item/item-family manifest가 여전히 unresolved이기 때문에 비어 있다
- 이 lexical recording은 Pilot Spec을 승인하지 않는다
- 이 lexical recording은 P1을 활성화하지 않는다
- 이 lexical recording은 human-data collection을 승인하지 않는다
- §6.1이 여전히 unresolved이므로 B-2는 여전히 OPEN이다

§3의 node manifest, §5의 scenario 기록, 그리고 이제 기록된 lexical manifest는 B-2의 item/item-family component를 충족하지 않는다.
B-2 remains open.

전체 lexical entry 데이터, provenance, license 경계, control 규칙은 `VI_PILOT_LEXICAL_MANIFEST.md`를 authoritative source로 한다. 이 문서는 그 매니페스트를 재기술하거나 재해석하지 않고 pointer-level 상태만 기록한다.

## 5. Scenario manifest

- bounded scenario 수: `[EVIDENCE-BOUND: 정확히 6]`
- scenario IDs와 설명: Research/Pilot-owned exact six-scenario manifest — §5.1에 기록됨
- 각 scenario의:
  - target node coverage
  - item-family coverage
  - lexical coverage
  - stimulus modality
  - response modality
- scenario holdout:
  - 필수 gate 아님
  - `[PILOT-CALIBRATE: exploratory/confirmatory 여부]`

### 5.1 Pilot scenario manifest

Ownership 경계 — 명시적 기록:

아래 여섯 scenario는 Research/Pilot-owned empirical pilot scenario다.
이들은 canonical `VI_LANGUAGE_PACK.md`의 Learning Outcome Scenario가 **아니다**.

기록된 scenario는 정확히 6개다.

#### 1. `VI_PILOT_SCN_01_EVENT_STATUS` — Event Status & Completion

- description: Learner reports whether a familiar event/task occurred, was completed, remains incomplete, or is negative/non-occurring in a short everyday status context.
- target node coverage — primary: `GRAMMAR_VI_DA`, `GRAMMAR_VI_ROI`, `GRAMMAR_VI_KHONG`, `GRAMMAR_VI_CHUA`
- target node coverage — secondary: `GRAMMAR_VI_DANG`
- item-family coverage intent:
  - past-event reporting
  - completion/not-yet/negative-status
  - optional DA/DANG contrast
- lexical-control intent: use low-ambiguity verbs/nouns and avoid cues that mechanically reveal the target marker.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: STRONG

#### 2. `VI_PILOT_SCN_02_CURRENT_ACTIVITY` — Current Activity Inquiry

- description: Learner asks about or verifies an interlocutor's current activity using bounded open-information and yes/no inquiry contexts.
- target node coverage — primary: `GRAMMAR_VI_DANG`, `GRAMMAR_VI_WH_INSITU`, `GRAMMAR_VI_CO_KHONG`
- target node coverage — secondary: `GRAMMAR_VI_DA`, `GRAMMAR_VI_KHONG`
- item-family coverage intent:
  - open WH inquiry
  - yes/no verification
  - optional DA/DANG temporal contrast
- lexical-control intent: bound WH vocabulary and keep simple KHONG distinct from CO_KHONG.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: STRONG

#### 3. `VI_PILOT_SCN_03_CAPABILITY_DECISION` — Capability, Need & Preference

- description: Learner chooses and produces ability, necessity, or desire constructions within a constrained everyday decision context.
- target node coverage — primary: `GRAMMAR_VI_CO_THE`, `GRAMMAR_VI_DUOC_ABILITY`, `GRAMMAR_VI_MUON`, `GRAMMAR_VI_PHAI`
- target node coverage — secondary: `GRAMMAR_VI_KHONG`, `GRAMMAR_VI_CO_KHONG`
- item-family coverage intent:
  - capability
  - alternate ability realization
  - necessity/preference discrimination
  - bounded capability question
- lexical-control intent: reuse a controlled verb inventory; avoid unrelated lexical uses of `có`; keep DUOC_ABILITY function/position explicit.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: STRONG

#### 4. `VI_PILOT_SCN_04_FUTURE_CONTINGENCY` — Future Plan & Contingency

- description: Learner states a near-future plan under bounded contextual constraints. The scenario may contain contingency in context, but P1 does not require a learner-produced conditional clause.
- target node coverage — primary: `GRAMMAR_VI_SE`
- target node coverage — secondary: `GRAMMAR_VI_MUON`, `GRAMMAR_VI_PHAI`
- **IMPORTANT**: `GRAMMAR_VI_NEU_THI` MUST NOT be a selected primary or secondary target.
- item-family coverage intent:
  - scheduled future plan
  - future plan under changed context
  - optional preference/necessity context
- lexical-control intent: avoid prompt wording that mechanically supplies SE; keep response length bounded.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: ADEQUATE

#### 5. `VI_PILOT_SCN_05_COMPARE_SELECT` — Compare & Select

- description: Learner compares/ranks bounded objects or animals and selects an appropriate candidate.
- target node coverage — primary: `GRAMMAR_VI_HON`, `GRAMMAR_VI_NHAT`, `GRAMMAR_VI_CL_CAI`, `GRAMMAR_VI_CL_CON`
- target node coverage — secondary: none
- item-family coverage intent:
  - inanimate comparison
  - animate comparison
  - comparison-only held-out family
- lexical-control intent: bound noun semantic classes and adjective inventory.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: STRONG

#### 6. `VI_PILOT_SCN_06_DIRECTIVE_ACTION` — Directive & Action Prompt

- description: Learner produces a short concrete instruction/directive in an everyday cooperative-action context.
- target node coverage — primary: `GRAMMAR_VI_HAY`, `GRAMMAR_VI_DI`
- target node coverage — secondary: none
- item-family coverage intent:
  - preverbal HAY directive
  - sentence-final DI directive
  - different action-family held-out transfer
- mandatory lexical control: grammatical sentence-final DI and lexical verb `đi` MUST NOT occur in the same item.
- stimulus_modality_components: `[TEXT]`
- response_modality_components: `[TEXT_ENTRY]`
- coverage: STRONG

이 절은 실제 item ID나 item-family ID를 작성하지 않는다.

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

### 6.1 Item and item-family manifest status (unresolved)

위의 generic item/item-family design contract는 그대로 유지된다. 이 patch는 item bank를 작성하지 않는다.

- 정확한 pilot-specific item/item-family manifest: UNRESOLVED
- `VI_CONTENT.md`는 authoring 및 rubric design의 참고 자료로 사용될 수 있다.
- `VI_CONTENT.md`는 empirical held-out item-family bank가 **아니다**.
- primary unseen transfer는 `DIFFERENT_ITEM_FAMILY`를 요구한다.
- 이 partial patch는 B-2의 item/item-family component를 충족하지 않는다.
- B-2 remains open.

다음은 여기서 발명하지 않는다: `item_id`, `item_version`, `item_family_id`, rubric ID/version, expected-response bank.

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

### 18.1 Recorded Research/Pilot decisions

기존 §18 schema를 그대로 사용한다. 새 column이나 register 구조 변경은 없다.

**Decision A**

- name: exact VI pilot Grammar Node set
- classification: EVIDENCE-BOUND
- owner: Research/Pilot
- current value: exact ordered 18-node set in §3.1
- source/evidence: B-2 final Research/Pilot adjudication
- version: 1
- decision date: 2026-08-12
- applies-from phase: P1
- superseded-by: none

**Decision B**

- name: exact VI pilot six-scenario set
- classification: EVIDENCE-BOUND
- owner: Research/Pilot
- current value: exact six `VI_PILOT_SCN_*` IDs in §5.1
- source/evidence: B-2 six-scenario Research/Pilot adjudication
- version: 1
- decision date: 2026-08-12
- applies-from phase: P1
- superseded-by: none

**Decision C**

- name: exact VI pilot lexical manifest
- classification: EVIDENCE-BOUND
- owner: Research/Pilot
- current value: `LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT`, version 1, exact 300 word + 80 multiword entries, recorded in `VI_PILOT_LEXICAL_MANIFEST.md`
- source/evidence:
  - Research report SHA: `9de36106990dbf217e2e06e98f5587710f99b9c339d26d9098aaeacc04cf1155`
  - reproducer SHA: `921cc70001229f95ebd7de7c0e1b7449e4bc15b031741b47714de37214d03be8`
  - archive SHA: `0f85f20b637f15f4fe2dac82b38ca96bcd4310b18187c50b73c9e6aa3dab5aef`
  - words SHA: `fcc910484c334a4cbe22f76ede68c14295b877695629db7445c6db2715915c1f`
  - co_n SHA: `9b2e91e439f851d7cd89bd6e13437ed22c2b1b6029d894ee46e89f17a2086857`
  - meta SHA: `2120035d4794ce0e6b1de9b4ae1d79b15d5ea24a7361bba63b34b847acf79c56`
- version: 1
- decision date: 2026-08-13
- applies-from phase: P1
- superseded-by: none
- status qualifier: `approved_for_pilot=false`; recording does not activate P1 and does not authorize human data

### 18.2 Lifecycle status after this record

- 문서 상태: Proposed (변경 없음)
- 이 patch가 기록한 것: exact 18-node inclusion/exclusion manifest, exact six pilot scenarios
- B-2에서 여전히 미해결: pilot-specific item/item-family manifest, lexical manifest, lexical source/provenance/license verification
- B-2: UNRESOLVED / OPEN
- B-3: UNRESOLVED
- P1: NOT STARTED / NOT ACTIVATED / STILL NOT ELIGIBLE TO ACTIVATE

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
