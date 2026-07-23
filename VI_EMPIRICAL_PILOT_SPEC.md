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
- exact node manifest: `[RESEARCH/PILOT-OWNED]`
- 포함 기준:
  - 빈도
  - 난이도 분포
  - 관계 구조
  - item 제작 가능성
  - 6개 scenario coverage
- 제외 및 이유 기록 필수

## 4. Lexical envelope

- vocabulary target: `[EVIDENCE-BOUND: 300~500]`
- chunk/collocation/construction target: `[EVIDENCE-BOUND: 80~150]`
- manifest ID/version: `[RESEARCH/PILOT-OWNED]`
- source/provenance/license: 사람 data 전 확정
- OOV policy: `[PILOT-CALIBRATE]`
- canonical Vocabulary 변경: 금지
- canonical Lexico-Construction Graph: 금지

## 5. Scenario manifest

- bounded scenario 수: `[EVIDENCE-BOUND: 정확히 6]`
- scenario IDs와 설명: `[RESEARCH/PILOT-OWNED]`
- 각 scenario의:
  - target node coverage
  - item-family coverage
  - lexical coverage
  - stimulus modality
  - response modality
- scenario holdout:
  - 필수 gate 아님
  - `[PILOT-CALIBRATE: exploratory/confirmatory 여부]`

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

## 20. Approval boundary

이 문서 승인은 specific pilot operation을 허용하지만 Tier A, production Progress, production scheduler 또는 Interleaving 변경을 허용하지 않는다.
