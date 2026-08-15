# VI Pilot Item / Item-Family Manifest

**Document class:** Tier D Pilot Item/Item-Family Manifest
**Document status:** Proposed — Architecture-approved B-2 item/item-family documentation candidate
**Authority:** `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §12 (Unseen-context lineage), §15-adjacent item-family boundary
**Consuming spec:** `VI_EMPIRICAL_PILOT_SPEC.md` §6 (Item and item-family design)
**Source authority:** `LLE_B2_Item_Family_Manifest_Research_Drafting_Report_2026-08-13_r2.md` (SHA-256 `2b952d3b0eae944ecab24e6eb3a16be57eb5e5e60b8b649296d9aea39c40dcb0`), adjudicated by `LLE_B2_Item_Family_Manifest_Architecture_Readjudication_2026-08-13.md` (correction authority: `LLE_B2_Item_Family_Manifest_Architecture_Adjudication_2026-08-13.md`, SHA-256 `30e1d4e3c333e34a1a56e6de4327cb13697607b38c338a4bc8baa21ce281b6ed`)

## 1. Purpose / authority boundary

This document records the Architecture-approved exact item/item-family inventory for the VI empirical pilot as the pilot-specific component of B-2. It is:

- a standalone Tier D documentation record, separate from canonical Vocabulary, canonical Lexico-Construction Graph, and canonical `VI_LANGUAGE_PACK.md` Learning Outcome Scenarios
- not a runtime implementation
- not a new `evidence_reference_versions.reference_kind` — it is documentation/package identity only, per A-ITEM-01
- not a P1 activation
- not human-data authorization
- not a declaration that B-2 is COMPLETE

Runtime authority for the individual objects recorded here remains the existing `ITEM`, `ITEM_FAMILY`, and `RUBRIC` reference kinds in `evidence_reference_versions` (`EVIDENCE_FOUNDATION_P0_SCHEMA.md` §5.5). This document does not itself write or resolve those rows; it is the human-readable, self-contained record of the exact content those versioned references must carry.

This document does not modify, reinterpret, or restate `VI_PILOT_LEXICAL_MANIFEST.md` as authoritative — that manifest remains its own authority for lexical entries, provenance, and license. Only one-way `ITEM → LEXICAL_ENTRY_VI_*` references are recorded here, per A-ITEM-03.

## 2. Manifest identity and status

| Field | Value |
|---|---|
| `manifest_id` | `ITEM_FAMILY_MANIFEST_VI_EMPIRICAL_PILOT` |
| `version` | `1` |
| `language` | `VI` |
| `created_at` | `2026-08-13` |
| `approved_for_pilot` | `false` |
| `supersedes` | `null` |
| document status wording | `Proposed — Architecture-approved B-2 item/item-family documentation candidate` |

Notes:

- `manifest_id` is stable across future versions and is never re-issued with a version suffix.
- `approved_for_pilot = false` is mandatory at this stage. Recording this manifest does not activate P1, does not approve the Pilot Spec, and does not authorize participant or human-data use.
- This manifest container is not a new `evidence_reference_versions.reference_kind`. Existing `ITEM`, `ITEM_FAMILY`, and `RUBRIC` kinds remain sufficient (A-ITEM-01).
- Exact family IDs: `VI_PILOT_FAMILY_001` .. `VI_PILOT_FAMILY_050` (contiguous, 50 total), each `family_version = 1`.
- Exact item IDs: `VI_PILOT_ITEM_0001` .. `VI_PILOT_ITEM_0086` (contiguous, 86 total), each `item_version = 1`.
- Fixed pins for every family and every item: `rubric = RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1`; `lexical_manifest = LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT@1`; `stimulus_modality_components = [TEXT]`; `response_modality_components = [TEXT_ENTRY]`.

## 3. Canonical family definition and lineage rule

### 3.1 Canonical item-family definition (unchanged)

Per `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §4/§12 and the Architecture Adjudication §5.1:

> Item family = a set of items sharing the same underlying elicitation template, target construction, and answer structure.

The three criteria are conjunctive. The bounded operational test applied to this inventory (Architecture Adjudication §5.1–5.2, CT-AITEM-01) is that every member item of one family shares the exact same `target_node_ids` set, in addition to a genuinely shared elicitation template and answer structure. No higher-order generalized target-construction identity (e.g. a TEMPORAL_MARKER_SLOT or MODALITY_SLOT abstraction) is introduced by this record.

### 3.2 Item lineage priority (assignment-time authority)

Per `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §12.1 and Architecture Readjudication §9.3, exclusive priority order:

1. `EXACT_REPEAT`
2. `SURFACE_VARIANT`
3. `SAME_ITEM_FAMILY`
4. `DIFFERENT_ITEM_FAMILY`

**Actual lineage authority.** Item lineage is not a static fact stored on an ITEM definition. It is computed at assignment time from the learner's exposure-history snapshot as of that assignment's creation, and it is never retroactively rewritten by later exposure (Evidence Contract §12.3, §21 invariant 9). This manifest records only **design intent / eligibility**, never an unconditional participant-level lineage guarantee:

- Items whose design role is a training/practice/immediate-assessment SOURCE role carry a design expectation of prior or concurrent same-family exposure (`SAME_ITEM_FAMILY_DESIGN_EXPECTATION`). This is a design label, not an assignment-snapshot fact.
- Items whose design role is a DAY_7 or DAY_30 held-out transfer role are recorded with `primary_unseen_candidate = true`. This marks design-intended eligibility for the primary unseen-transfer metric (Evidence Contract §14.3) only. **Actual primary-unseen eligibility is valid only when the assignment-time exposure-history lineage resolves to `DIFFERENT_ITEM_FAMILY`** under the priority order above; a writer/recorder must never serialize this manifest's design label as a bypass of assignment-time exposure-history evaluation.

### 3.3 Held-out assignment preallocation (CT-AITEM-02)

> For any held-out family containing multiple assessment items, every assignment intended to retain primary `DIFFERENT_ITEM_FAMILY` eligibility is created and immutable-snapshot-pinned before the learner's first learner-facing exposure to any item in that family. An assignment created after prior same-family exposure resolves to `SAME_ITEM_FAMILY`, subject to the higher-priority `EXACT_REPEAT` and `SURFACE_VARIANT` rules. Earlier assignment snapshots are not retroactively rewritten by later exposure.

This is a prospective invariant. In this v1 inventory every held-out family contains exactly one item (§10), so no current held-out family depends on this rule to protect primary-unseen eligibility. The rule remains mandatory for any future version of this manifest that introduces a multi-item held-out family (§9).

Held-out families must not be exposed through learner-facing learning/practice/review before their designated assessment if primary-unseen eligibility is intended.

## 4. Exact 50 ITEM_FAMILY definitions

Exact family count: **50**. Every `family_version = 1`. Every `rubric = RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1`. Source: R2 §10 (exact semantic source), subject to the representation rules in §3.2 above (`primary_unseen_eligibility` below is a family-level design property, not a per-assignment fact).

| family_id | short_name | scenario_id | target_node_ids | elicitation_purpose | elicitation_template | answer_structure | permitted_roles | primary_unseen_eligibility | lexical_pool_control_boundary | six_control_applicability | source_or_heldout_status | member_item_ids |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| VI_PILOT_FAMILY_001 | EVENT_DA_SOURCE | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | 과거 사건 source generation | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=이전 사건] → 1개 Vietnamese declarative | Tôi + đã + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | tôi + bounded action/object | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | SOURCE | VI_PILOT_ITEM_0001, VI_PILOT_ITEM_0002, VI_PILOT_ITEM_0003 |
| VI_PILOT_FAMILY_002 | NEGATION_KHONG_SOURCE | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | 일반 부정 source generation | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=일반 부정] → declarative | Tôi + không + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | tôi + bounded action/object | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0007, VI_PILOT_ITEM_0008, VI_PILOT_ITEM_0009 |
| VI_PILOT_FAMILY_003 | COMPLETION_SOURCE | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | 완료 상태 source generation | 메타언어 완료 사실 → declarative | S + V (+O) + rồi | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | tôi + bounded action/object | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | SOURCE | VI_PILOT_ITEM_0013, VI_PILOT_ITEM_0014, VI_PILOT_ITEM_0015 |
| VI_PILOT_FAMILY_004 | STATUS_DIALOGUE_D7_DA | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | DAY_7 dialogue-turn 이전 사건 transfer | 상태 질문 + 사실 카드 [state=이전 사건] → one bounded Vietnamese reply | Tôi + đã + V (+O). | DAY7_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0016 |
| VI_PILOT_FAMILY_005 | STATUS_CUE_D30_DA | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | DAY_30 structured cue-card 이전 사건 transfer | 구조 카드 [actor=나, action=<bounded action>, state=이전 사건] → one Vietnamese sentence | Tôi + đã + V (+O). | DAY30_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY30 | VI_PILOT_ITEM_0021 |
| VI_PILOT_FAMILY_006 | WH_SOURCE | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | WHAT/WHERE/WHEN source generation | question intent → WH question | S + V (+O) + WH | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | gì/đâu/khi nào + bounded verbs | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0026, VI_PILOT_ITEM_0027, VI_PILOT_ITEM_0028 |
| VI_PILOT_FAMILY_007 | YESNO_SOURCE | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_CO_KHONG | yes/no source generation | yes/no intent → question | S+có+V(+O)+không? | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | bạn + verb/object | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0029, VI_PILOT_ITEM_0030, VI_PILOT_ITEM_0031 |
| VI_PILOT_FAMILY_008 | WH_DIALOGUE_D7_TRANSFER | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU, GRAMMAR_VI_DANG | current-activity information-gap transfer | dialogue info gap → question | Bạn + đang + V + gì? | DAY7_HELDOUT_TRANSFER | YES | bạn/làm/gì | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0032 |
| VI_PILOT_FAMILY_009 | WH_REFRAME_D30_TRANSFER | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | fact-slot→location-question reframe | semantic slots → missing-location question | S+V+O+ở+đâu? | DAY30_HELDOUT_TRANSFER | YES | bạn/ăn/cơm/ở/đâu | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0033 |
| VI_PILOT_FAMILY_010 | CO_THE_SOURCE | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE | preverbal ability source | ability fact → declarative | S+có thể+V(+O) | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | controlled verbs/objects | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0034, VI_PILOT_ITEM_0035, VI_PILOT_ITEM_0036 |
| VI_PILOT_FAMILY_011 | DUOC_SOURCE | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | postverbal ability source | agentive ability fact → declarative | S+V+được+O | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | agentive verbs/objects | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0037, VI_PILOT_ITEM_0038, VI_PILOT_ITEM_0039 |
| VI_PILOT_FAMILY_012 | MUON_SOURCE | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | desire source generation | 의도 카드 [actor=나, action=<bounded action>, intent=원함] → declarative | Tôi + muốn + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | same action pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0040, VI_PILOT_ITEM_0041, VI_PILOT_ITEM_0042 |
| VI_PILOT_FAMILY_013 | ABILITY_PARAPHRASE_D7_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_DUOC_ABILITY | two-realization ability transfer | one proposition → ordered two-line paraphrase | line1 CO_THE; line2 DUOC | DAY7_HELDOUT_TRANSFER | YES | tôi/mở/cửa | C1=NA;C2=PASS;C3=PASS;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0046 |
| VI_PILOT_FAMILY_014 | CAPABILITY_YN_D7_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | ability+yes/no composition | capability inquiry → direct question | Bạn+có thể+V+O+không? | DAY7_HELDOUT_TRANSFER | YES | bạn/đọc/sách | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0047 |
| VI_PILOT_FAMILY_015 | CAPABILITY_YN_REFRAME_D30_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | statement→capability-question transform | semantic card → question transformation | Bạn+có thể+V+O+không? | DAY30_HELDOUT_TRANSFER | YES | bạn/uống/nước | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0048 |
| VI_PILOT_FAMILY_016 | DUOC_POSITION_D30_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | postverbal constrained ability | ability fact + positional instruction → sentence | S+V+được+O | DAY30_HELDOUT_TRANSFER | YES | tôi/đọc/sách | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0049 |
| VI_PILOT_FAMILY_017 | MUON_DIALOGUE_D7_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | dialogue desire transfer | decision dialogue + fact card [desired action=<bounded action>] → one declarative reply | Tôi + muốn + V (+O). | DAY7_HELDOUT_TRANSFER | YES | bounded action pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0050 |
| VI_PILOT_FAMILY_018 | SE_SOURCE | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | future-plan source | future semantic fact → declarative | S+sẽ+V(+O) | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | action pool | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | SOURCE | VI_PILOT_ITEM_0052, VI_PILOT_ITEM_0053, VI_PILOT_ITEM_0054 |
| VI_PILOT_FAMILY_019 | SE_DIALOGUE_D7_TRANSFER | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | future dialogue transfer | plan question → reply | S+sẽ+V(+O) | DAY7_HELDOUT_TRANSFER | YES | tôi/đọc/sách | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0055 |
| VI_PILOT_FAMILY_020 | SE_REPLAN_D30_TRANSFER | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | changed-context replan transfer | changed constraint card → revised plan | S+sẽ+V(+O) | DAY30_HELDOUT_TRANSFER | YES | tôi/uống/nước | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY30 | VI_PILOT_ITEM_0056 |
| VI_PILOT_FAMILY_021 | MUON_PLAN_D30_TRANSFER | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_MUON | planning-context desire transfer | future decision card [chosen desired action=<bounded action>] → one reply | Tôi + muốn + V (+O). | DAY30_HELDOUT_TRANSFER | YES | gọi bạn / học | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0057 |
| VI_PILOT_FAMILY_022 | HON_SOURCE | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | comparative source | two entities + property relation → sentence | A+Adj+hơn+B | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | bounded adjective pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA | SOURCE | VI_PILOT_ITEM_0059, VI_PILOT_ITEM_0060, VI_PILOT_ITEM_0061 |
| VI_PILOT_FAMILY_023 | NHAT_SOURCE | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT | superlative source | ranked entity → sentence | A+Adj+nhất | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | same adjective pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA | SOURCE | VI_PILOT_ITEM_0062, VI_PILOT_ITEM_0063, VI_PILOT_ITEM_0064 |
| VI_PILOT_FAMILY_024 | CLASSIFIER_CAI_SOURCE | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CAI | inanimate classifier source | 수량 카드 [quantity=hai, entity=<bounded inanimate noun>] → NP | hai + cái + N | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | 8 inanimate / 5 animate | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0065, VI_PILOT_ITEM_0066, VI_PILOT_ITEM_0067 |
| VI_PILOT_FAMILY_025 | HON_CAI_D7_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CAI | inanimate classifier+comparative transfer | 비교 카드 [two bounded inanimate entities + property relation] → full clause | Cái + N1 + này + Adj + hơn + cái + N2 + đó. | DAY7_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0071 |
| VI_PILOT_FAMILY_026 | NHAT_CAI_D7_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | inanimate classifier+superlative transfer | 순위 카드 [ranked bounded inanimate entity] → sentence | Cái + N + này + Adj + nhất. | DAY7_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0073 |
| VI_PILOT_FAMILY_027 | HON_TABLE_D30_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | table→comparative transfer | two-row property table → sentence | A+Adj+hơn+B | DAY30_HELDOUT_TRANSFER | YES | nhà/cao | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0075 |
| VI_PILOT_FAMILY_028 | NHAT_CAI_D30_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | rank-card inanimate classifier+superlative transfer | rank-card transformation [bounded inanimate entity + winning property] → sentence | Cái + N + này + Adj + nhất. | DAY30_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0076 |
| VI_PILOT_FAMILY_029 | HAY_SOURCE | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | preverbal directive source | action goal → directive | Hãy+V(+O) | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | verbs excluding lexical đi | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0078, VI_PILOT_ITEM_0079, VI_PILOT_ITEM_0080 |
| VI_PILOT_FAMILY_030 | DI_SOURCE | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | sentence-final directive source | action goal → directive | V(+O)+đi | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | verbs excluding lexical đi | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0081, VI_PILOT_ITEM_0082, VI_PILOT_ITEM_0083 |
| VI_PILOT_FAMILY_031 | HAY_DI_COMBINED_D7_TRANSFER | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY, GRAMMAR_VI_DI | combined directive transfer | cooperative dialogue → combined directive | Hãy+V+O+đi | DAY7_HELDOUT_TRANSFER | YES | đóng/cửa | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0084 |
| VI_PILOT_FAMILY_032 | HAY_DIALOGUE_D30_TRANSFER | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | dialogue HAY transfer | partner asks for instruction → directive | Hãy+V | DAY30_HELDOUT_TRANSFER | YES | học | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0085 |
| VI_PILOT_FAMILY_033 | DI_DIALOGUE_D30_TRANSFER | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | dialogue DI transfer | partner needs short prompt → directive | V+đi | DAY30_HELDOUT_TRANSFER | YES | học | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0086 |
| VI_PILOT_FAMILY_034 | EVENT_DANG_SOURCE | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | 현재 진행 사건 source generation | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=현재 진행] → 1개 Vietnamese declarative | Tôi + đang + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | tôi + bounded action/object | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | SOURCE | VI_PILOT_ITEM_0004, VI_PILOT_ITEM_0005, VI_PILOT_ITEM_0006 |
| VI_PILOT_FAMILY_035 | NEGATION_CHUA_SOURCE | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | not-yet source generation | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=현재까지 미완료] → declarative | Tôi + chưa + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | tôi + bounded action/object | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | SOURCE | VI_PILOT_ITEM_0010, VI_PILOT_ITEM_0011, VI_PILOT_ITEM_0012 |
| VI_PILOT_FAMILY_036 | STATUS_DIALOGUE_D7_DANG | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | DAY_7 dialogue-turn 현재 진행 transfer | 상태 질문 + 사실 카드 [state=현재 진행] → one bounded Vietnamese reply | Tôi + đang + V (+O). | DAY7_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0017 |
| VI_PILOT_FAMILY_037 | STATUS_DIALOGUE_D7_KHONG | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | DAY_7 dialogue-turn 일반 부정 transfer | 상태 질문 + 사실 카드 [state=일반 부정] → one bounded Vietnamese reply | Tôi + không + V (+O). | DAY7_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0018 |
| VI_PILOT_FAMILY_038 | STATUS_DIALOGUE_D7_CHUA | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | DAY_7 dialogue-turn 현재까지 미완료 transfer | 상태 질문 + 사실 카드 [state=현재까지 미완료] → one bounded Vietnamese reply | Tôi + chưa + V (+O). | DAY7_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0019 |
| VI_PILOT_FAMILY_039 | STATUS_DIALOGUE_D7_ROI | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | DAY_7 dialogue-turn 완료 transfer | 상태 질문 + 사실 카드 [state=완료] → one bounded Vietnamese reply | Tôi + V (+O) + rồi. | DAY7_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY7 | VI_PILOT_ITEM_0020 |
| VI_PILOT_FAMILY_040 | STATUS_CUE_D30_DANG | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | DAY_30 structured cue-card 현재 진행 transfer | 구조 카드 [actor=나, action=<bounded action>, state=현재 진행] → one Vietnamese sentence | Tôi + đang + V (+O). | DAY30_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY30 | VI_PILOT_ITEM_0022 |
| VI_PILOT_FAMILY_041 | STATUS_CUE_D30_KHONG | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | DAY_30 structured cue-card 일반 부정 transfer | 구조 카드 [actor=나, action=<bounded action>, state=일반 부정] → one Vietnamese sentence | Tôi + không + V (+O). | DAY30_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0023 |
| VI_PILOT_FAMILY_042 | STATUS_CUE_D30_CHUA | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | DAY_30 structured cue-card 현재까지 미완료 transfer | 구조 카드 [actor=나, action=<bounded action>, state=현재까지 미완료] → one Vietnamese sentence | Tôi + chưa + V (+O). | DAY30_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY30 | VI_PILOT_ITEM_0024 |
| VI_PILOT_FAMILY_043 | STATUS_CUE_D30_ROI | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | DAY_30 structured cue-card 완료 transfer | 구조 카드 [actor=나, action=<bounded action>, state=완료] → one Vietnamese sentence | Tôi + V (+O) + rồi. | DAY30_HELDOUT_TRANSFER | YES | new action/object combinations | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS | HELDOUT_DAY30 | VI_PILOT_ITEM_0025 |
| VI_PILOT_FAMILY_044 | PHAI_SOURCE | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | necessity source generation | 의무 카드 [actor=나, action=<bounded action>, intent=필요/의무] → declarative | Tôi + phải + V (+O). | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | same action pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0043, VI_PILOT_ITEM_0044, VI_PILOT_ITEM_0045 |
| VI_PILOT_FAMILY_045 | PHAI_DIALOGUE_D7_TRANSFER | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | dialogue necessity transfer | decision dialogue + fact card [required action=<bounded action>] → one declarative reply | Tôi + phải + V (+O). | DAY7_HELDOUT_TRANSFER | YES | bounded action pool | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0051 |
| VI_PILOT_FAMILY_046 | PHAI_PLAN_D30_TRANSFER | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_PHAI | planning-context necessity transfer | future decision card [required action=<bounded action>] → one reply | Tôi + phải + V (+O). | DAY30_HELDOUT_TRANSFER | YES | gọi bạn / học | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0058 |
| VI_PILOT_FAMILY_047 | CLASSIFIER_CON_SOURCE | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CON | animate classifier source | 수량 카드 [quantity=hai, entity=<bounded animate noun>] → NP | hai + con + N | TRAINING\|PRACTICE\|REVIEW_ELIGIBLE\|IMMEDIATE | NO | 8 inanimate / 5 animate | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA | SOURCE | VI_PILOT_ITEM_0068, VI_PILOT_ITEM_0069, VI_PILOT_ITEM_0070 |
| VI_PILOT_FAMILY_048 | HON_CON_D7_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CON | animate classifier+comparative transfer | 비교 카드 [two bounded animate entities + property relation] → full clause | Con + N1 + này + Adj + hơn + con + N2 + đó. | DAY7_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0072 |
| VI_PILOT_FAMILY_049 | NHAT_CON_D7_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | animate classifier+superlative transfer | 순위 카드 [ranked bounded animate entity] → sentence | Con + N + này + Adj + nhất. | DAY7_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY7 | VI_PILOT_ITEM_0074 |
| VI_PILOT_FAMILY_050 | NHAT_CON_D30_TRANSFER | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | rank-card animate classifier+superlative transfer | rank-card transformation [bounded animate entity + winning property] → sentence | Con + N + này + Adj + nhất. | DAY30_HELDOUT_TRANSFER | YES | balanced nouns+adjectives | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA | HELDOUT_DAY30 | VI_PILOT_ITEM_0077 |

`primary_unseen_eligibility = YES` at family level is a design property (this family was constructed as a held-out transfer family). It is not an assignment-snapshot fact; see §3.2.

## 5. Exact 86 ITEM definitions

Exact item count: **86**. Every `item_version = 1`, `item_family_version = 1`, `rubric = RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1`, `lexical_manifest = LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT@1`, `stimulus_modality_components = [TEXT]`, `response_modality_components = [TEXT_ENTRY]`. Source: R2 §11 (exact semantic source).

Per §3.2: the `design_lineage_intent` column is a design label, never an assignment-snapshot fact. `SAME_ITEM_FAMILY_DESIGN_EXPECTATION` marks source/immediate items designed for within-family exposure. `PRIMARY_UNSEEN_CANDIDATE` marks held-out items whose `primary_unseen_candidate = true`; actual eligibility requires assignment-time lineage `DIFFERENT_ITEM_FAMILY`. `VI_PILOT_ITEM_0046`'s canonical/variant response cells point to §5.1, where the authoritative two-line strings are recorded with a real LF, not `<br>`.

| item_id | item_family_id | scenario_id | target_node_ids | role/timepoint | stimulus / reproducible specification | canonical accepted response | accepted-response variants | lexical entry IDs | design_lineage_intent | primary_unseen_candidate | control flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| VI_PILOT_ITEM_0001 | VI_PILOT_FAMILY_001 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | TRAINING_SOURCE | 상황 카드: 식사 행동은 이전 사건이다. Vietnamese 한 문장으로 보고한다. | Tôi đã ăn cơm. | Tôi đã ăn cơm. ; Tôi đã ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0002 | VI_PILOT_FAMILY_001 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | PRACTICE_SOURCE | 상황 카드: 책 읽기는 이전 사건이다. Vietnamese 한 문장으로 보고한다. | Tôi đã đọc sách. | Tôi đã đọc sách. ; Tôi đã đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0003 | VI_PILOT_FAMILY_001 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | ASSESSMENT_IMMEDIATE_SOURCE | 상황 카드: 물 마시기는 이전 사건이다. Vietnamese 한 문장으로 보고한다. | Tôi đã uống nước. | Tôi đã uống nước. ; Tôi đã uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0004 | VI_PILOT_FAMILY_034 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | TRAINING_SOURCE | 상황 카드: 식사 행동이 지금 진행 중이다. Vietnamese 한 문장으로 보고한다. | Tôi đang ăn cơm. | Tôi đang ăn cơm. ; Tôi đang ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0005 | VI_PILOT_FAMILY_034 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | PRACTICE_SOURCE | 상황 카드: 독서 행동이 지금 진행 중이다. Vietnamese 한 문장으로 보고한다. | Tôi đang đọc sách. | Tôi đang đọc sách. ; Tôi đang đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0006 | VI_PILOT_FAMILY_034 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | ASSESSMENT_IMMEDIATE_SOURCE | 상황 카드: 물 마시는 행동이 지금 진행 중이다. Vietnamese 한 문장으로 보고한다. | Tôi đang uống nước. | Tôi đang uống nước. ; Tôi đang uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0007 | VI_PILOT_FAMILY_002 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | TRAINING_SOURCE | 상황 카드: 화자는 식사를 하지 않는다는 일반 부정 사실을 말한다. Vietnamese 한 문장으로 보고한다. | Tôi không ăn cơm. | Tôi không ăn cơm. ; Tôi không ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=target marker absent |
| VI_PILOT_ITEM_0008 | VI_PILOT_FAMILY_002 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | PRACTICE_SOURCE | 상황 카드: 화자는 책을 읽지 않는다는 일반 부정 사실을 말한다. Vietnamese 한 문장으로 보고한다. | Tôi không đọc sách. | Tôi không đọc sách. ; Tôi không đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=target marker absent |
| VI_PILOT_ITEM_0009 | VI_PILOT_FAMILY_002 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | ASSESSMENT_IMMEDIATE_SOURCE | 상황 카드: 화자는 물을 마시지 않는다는 일반 부정 사실을 말한다. Vietnamese 한 문장으로 보고한다. | Tôi không uống nước. | Tôi không uống nước. ; Tôi không uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=target marker absent |
| VI_PILOT_ITEM_0010 | VI_PILOT_FAMILY_035 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | TRAINING_SOURCE | 상황 카드: 지금까지 식사를 하지 않았지만 이후 가능성은 열려 있다. Vietnamese 한 문장으로 보고한다. | Tôi chưa ăn cơm. | Tôi chưa ăn cơm. ; Tôi chưa ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0011 | VI_PILOT_FAMILY_035 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | PRACTICE_SOURCE | 상황 카드: 지금까지 책을 읽지 않았지만 이후 가능성은 열려 있다. Vietnamese 한 문장으로 보고한다. | Tôi chưa đọc sách. | Tôi chưa đọc sách. ; Tôi chưa đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0012 | VI_PILOT_FAMILY_035 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | ASSESSMENT_IMMEDIATE_SOURCE | 상황 카드: 지금까지 물을 마시지 않았지만 이후 가능성은 열려 있다. Vietnamese 한 문장으로 보고한다. | Tôi chưa uống nước. | Tôi chưa uống nước. ; Tôi chưa uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0013 | VI_PILOT_FAMILY_003 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | TRAINING_SOURCE | 상황 카드: 식사 행동이 완료된 상태다. Vietnamese 한 문장으로 보고한다. | Tôi ăn cơm rồi. | Tôi ăn cơm rồi. ; Tôi ăn cơm rồi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0014 | VI_PILOT_FAMILY_003 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | PRACTICE_SOURCE | 상황 카드: 독서 행동이 완료된 상태다. Vietnamese 한 문장으로 보고한다. | Tôi đọc sách rồi. | Tôi đọc sách rồi. ; Tôi đọc sách rồi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0015 | VI_PILOT_FAMILY_003 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | ASSESSMENT_IMMEDIATE_SOURCE | 상황 카드: 물 마시는 행동이 완료된 상태다. Vietnamese 한 문장으로 보고한다. | Tôi uống nước rồi. | Tôi uống nước rồi. ; Tôi uống nước rồi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=target marker absent |
| VI_PILOT_ITEM_0016 | VI_PILOT_FAMILY_004 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | ASSESSMENT_DAY7_TRANSFER | 대화: A가 연락 상태를 묻는다. 사실 카드: 화자는 상대에게 이전에 전화를 했다. Vietnamese 한 문장으로 실현한다. | Tôi đã gọi bạn. | Tôi đã gọi bạn. ; Tôi đã gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0017 | VI_PILOT_FAMILY_036 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | ASSESSMENT_DAY7_TRANSFER | 대화: A가 현재 상태를 묻는다. 사실 카드: 화자는 지금 공부 중이다. Vietnamese 한 문장으로 실현한다. | Tôi đang học. | Tôi đang học. ; Tôi đang học | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0182 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0018 | VI_PILOT_FAMILY_037 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | ASSESSMENT_DAY7_TRANSFER | 대화: A가 문을 여는지 묻는다. 사실 카드: 화자는 문을 열지 않는다. Vietnamese 한 문장으로 실현한다. | Tôi không mở cửa. | Tôi không mở cửa. ; Tôi không mở cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=marker absent; heldout family |
| VI_PILOT_ITEM_0019 | VI_PILOT_FAMILY_038 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | ASSESSMENT_DAY7_TRANSFER | 대화: A가 연락 상태를 묻는다. 사실 카드: 화자는 아직 상대에게 전화하지 않았다. Vietnamese 한 문장으로 실현한다. | Tôi chưa gọi bạn. | Tôi chưa gọi bạn. ; Tôi chưa gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0020 | VI_PILOT_FAMILY_039 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | ASSESSMENT_DAY7_TRANSFER | 대화: A가 문 상태를 묻는다. 사실 카드: 화자는 문을 여는 행동을 완료했다. Vietnamese 한 문장으로 실현한다. | Tôi mở cửa rồi. | Tôi mở cửa rồi. ; Tôi mở cửa rồi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0021 | VI_PILOT_FAMILY_005 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DA | ASSESSMENT_DAY30_TRANSFER | 구조 카드 [actor=나, action=공부, state=이전 사건]. Vietnamese 한 문장으로 실현한다. | Tôi đã học. | Tôi đã học. ; Tôi đã học | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0182 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0022 | VI_PILOT_FAMILY_040 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_DANG | ASSESSMENT_DAY30_TRANSFER | 구조 카드 [actor=나, action=상대에게 전화, state=현재 진행]. Vietnamese 한 문장으로 실현한다. | Tôi đang gọi bạn. | Tôi đang gọi bạn. ; Tôi đang gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0023 | VI_PILOT_FAMILY_041 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_KHONG | ASSESSMENT_DAY30_TRANSFER | 구조 카드 [actor=나, action=상대에게 전화, state=일반 부정]. Vietnamese 한 문장으로 실현한다. | Tôi không gọi bạn. | Tôi không gọi bạn. ; Tôi không gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=marker absent; heldout family |
| VI_PILOT_ITEM_0024 | VI_PILOT_FAMILY_042 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_CHUA | ASSESSMENT_DAY30_TRANSFER | 구조 카드 [actor=나, action=문 열기, state=현재까지 미완료]. Vietnamese 한 문장으로 실현한다. | Tôi chưa mở cửa. | Tôi chưa mở cửa. ; Tôi chưa mở cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0025 | VI_PILOT_FAMILY_043 | VI_PILOT_SCN_01_EVENT_STATUS | GRAMMAR_VI_ROI | ASSESSMENT_DAY30_TRANSFER | 구조 카드 [actor=나, action=상대에게 전화, state=완료]. Vietnamese 한 문장으로 실현한다. | Tôi gọi bạn rồi. | Tôi gọi bạn rồi. ; Tôi gọi bạn rồi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=marker absent; heldout family |
| VI_PILOT_ITEM_0026 | VI_PILOT_FAMILY_006 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | TRAINING_SOURCE | 질문 목표: 상대가 무엇을 먹는지 묻는다. Vietnamese 질문 한 문장. | Bạn ăn gì? | Bạn ăn gì? ; Bạn ăn gì | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0116 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=WH_CONTROL PASS |
| VI_PILOT_ITEM_0027 | VI_PILOT_FAMILY_006 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | PRACTICE_SOURCE | 질문 목표: 상대가 어디에 있는지 묻는다. Vietnamese 질문 한 문장. | Bạn ở đâu? | Bạn ở đâu? ; Bạn ở đâu | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0014, LEXICAL_ENTRY_VI_0276 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=WH_CONTROL PASS |
| VI_PILOT_ITEM_0028 | VI_PILOT_FAMILY_006 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | ASSESSMENT_IMMEDIATE_SOURCE | 질문 목표: 상대가 언제 책을 읽는지 묻는다. Vietnamese 질문 한 문장. | Bạn đọc sách khi nào? | Bạn đọc sách khi nào? ; Bạn đọc sách khi nào | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295, LEXICAL_ENTRY_VI_0300 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=WH_CONTROL PASS |
| VI_PILOT_ITEM_0029 | VI_PILOT_FAMILY_007 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_CO_KHONG | TRAINING_SOURCE | 질문 목표: 상대가 밥을 먹는지 예/아니오로 확인한다. Vietnamese 질문 한 문장. | Bạn có ăn cơm không? | Bạn có ăn cơm không? ; Bạn có ăn cơm không | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0030 | VI_PILOT_FAMILY_007 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_CO_KHONG | PRACTICE_SOURCE | 질문 목표: 상대가 책을 읽는지 예/아니오로 확인한다. Vietnamese 질문 한 문장. | Bạn có đọc sách không? | Bạn có đọc sách không? ; Bạn có đọc sách không | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0031 | VI_PILOT_FAMILY_007 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_CO_KHONG | ASSESSMENT_IMMEDIATE_SOURCE | 질문 목표: 상대가 물을 마시는지 예/아니오로 확인한다. Vietnamese 질문 한 문장. | Bạn có uống nước không? | Bạn có uống nước không? ; Bạn có uống nước không | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0032 | VI_PILOT_FAMILY_008 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU, GRAMMAR_VI_DANG | ASSESSMENT_DAY7_TRANSFER | 정보-gap 대화: 현재 상대의 행동을 모른다. 진행 중인 행동이 무엇인지 Vietnamese로 질문한다. | Bạn đang làm gì? | Bạn đang làm gì? ; Bạn đang làm gì | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0047, LEXICAL_ENTRY_VI_0116 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=WH/DANG isolated; no yes-no mixing |
| VI_PILOT_ITEM_0033 | VI_PILOT_FAMILY_009 | VI_PILOT_SCN_02_CURRENT_ACTIVITY | GRAMMAR_VI_WH_INSITU | ASSESSMENT_DAY30_TRANSFER | 재구성 카드: [상대, 먹다, 밥]이라는 사실에서 장소 정보만 비어 있다. 그 장소를 묻는 Vietnamese 질문으로 바꾼다. | Bạn ăn cơm ở đâu? | Bạn ăn cơm ở đâu? ; Bạn ăn cơm ở đâu | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298, LEXICAL_ENTRY_VI_0014, LEXICAL_ENTRY_VI_0276 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=WH reframe; marker absent |
| VI_PILOT_ITEM_0034 | VI_PILOT_FAMILY_010 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE | TRAINING_SOURCE | 능력 사실: 화자는 책을 읽을 수 있다. Vietnamese 한 문장. | Tôi có thể đọc sách. | Tôi có thể đọc sách. ; Tôi có thể đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0035 | VI_PILOT_FAMILY_010 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE | PRACTICE_SOURCE | 능력 사실: 화자는 물을 마실 수 있다. Vietnamese 한 문장. | Tôi có thể uống nước. | Tôi có thể uống nước. ; Tôi có thể uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0036 | VI_PILOT_FAMILY_010 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE | ASSESSMENT_IMMEDIATE_SOURCE | 능력 사실: 화자는 문을 열 수 있다. Vietnamese 한 문장. | Tôi có thể mở cửa. | Tôi có thể mở cửa. ; Tôi có thể mở cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=grammatical có not lexical-linked |
| VI_PILOT_ITEM_0037 | VI_PILOT_FAMILY_011 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | TRAINING_SOURCE | 능력 사실: 화자는 밥을 먹을 수 있다. 주어는 행동의 수행자다. Vietnamese 한 문장. | Tôi ăn được cơm. | Tôi ăn được cơm. ; Tôi ăn được cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA; special=agentive subject |
| VI_PILOT_ITEM_0038 | VI_PILOT_FAMILY_011 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | PRACTICE_SOURCE | 능력 사실: 화자는 물을 마실 수 있다. 주어는 행동의 수행자다. Vietnamese 한 문장. | Tôi uống được nước. | Tôi uống được nước. ; Tôi uống được nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA; special=agentive subject |
| VI_PILOT_ITEM_0039 | VI_PILOT_FAMILY_011 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | ASSESSMENT_IMMEDIATE_SOURCE | 능력 사실: 화자는 문을 열 수 있다. 주어는 행동의 수행자다. Vietnamese 한 문장. | Tôi mở được cửa. | Tôi mở được cửa. ; Tôi mở được cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA; special=agentive subject |
| VI_PILOT_ITEM_0040 | VI_PILOT_FAMILY_012 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | TRAINING_SOURCE | 의도/의무 카드: 화자는 밥을 먹고 싶다. Vietnamese 한 문장. | Tôi muốn ăn cơm. | Tôi muốn ăn cơm. ; Tôi muốn ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0041 | VI_PILOT_FAMILY_012 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | PRACTICE_SOURCE | 의도/의무 카드: 화자는 물을 마시고 싶다. Vietnamese 한 문장. | Tôi muốn uống nước. | Tôi muốn uống nước. ; Tôi muốn uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0042 | VI_PILOT_FAMILY_012 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | ASSESSMENT_IMMEDIATE_SOURCE | 의도/의무 카드: 화자는 문을 열고 싶다. Vietnamese 한 문장. | Tôi muốn mở cửa. | Tôi muốn mở cửa. ; Tôi muốn mở cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0043 | VI_PILOT_FAMILY_044 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | TRAINING_SOURCE | 의도/의무 카드: 화자는 책을 읽어야 한다. Vietnamese 한 문장. | Tôi phải đọc sách. | Tôi phải đọc sách. ; Tôi phải đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0044 | VI_PILOT_FAMILY_044 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | PRACTICE_SOURCE | 의도/의무 카드: 화자는 물을 마셔야 한다. Vietnamese 한 문장. | Tôi phải uống nước. | Tôi phải uống nước. ; Tôi phải uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0045 | VI_PILOT_FAMILY_044 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | ASSESSMENT_IMMEDIATE_SOURCE | 의도/의무 카드: 화자는 문을 닫아야 한다. Vietnamese 한 문장. | Tôi phải đóng cửa. | Tôi phải đóng cửa. ; Tôi phải đóng cửa | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0281, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0046 | VI_PILOT_FAMILY_013 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_DUOC_ABILITY | ASSESSMENT_DAY7_TRANSFER | 하나의 의미 '나는 문을 열 수 있다'를 서로 다른 두 canonical ability realization으로 두 줄에 각각 작성한다. marker 이름은 제시하지 않는다. | see §5.1 (two-line, LF-separated) | see §5.1 — four LF-separated punctuation variants | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=PASS;C3=PASS;C4=NA;C5=NA;C6=NA; special=two-output answer structure |
| VI_PILOT_ITEM_0047 | VI_PILOT_FAMILY_014 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | ASSESSMENT_DAY7_TRANSFER | 상대가 책을 읽을 수 있는지 예/아니오로 확인하는 Vietnamese 질문을 만든다. | Bạn có thể đọc sách không? | Bạn có thể đọc sách không? ; Bạn có thể đọc sách không | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=ability+YN |
| VI_PILOT_ITEM_0048 | VI_PILOT_FAMILY_015 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | ASSESSMENT_DAY30_TRANSFER | 재구성 카드: '상대에게 물을 마실 능력이 있다'는 의미를 예/아니오 확인 질문으로 변환한다. | Bạn có thể uống nước không? | Bạn có thể uống nước không? ; Bạn có thể uống nước không | LEXICAL_ENTRY_VI_0058, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=PASS;C4=NA;C5=NA;C6=NA; special=transformation |
| VI_PILOT_ITEM_0049 | VI_PILOT_FAMILY_016 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_DUOC_ABILITY | ASSESSMENT_DAY30_TRANSFER | 능력 사실: 화자는 책을 읽을 수 있다. 사용할 능력 표현은 핵심 동사 뒤에 온다. 표현 자체의 단어는 제시하지 않는다. | Tôi đọc được sách. | Tôi đọc được sách. ; Tôi đọc được sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=PASS;C3=NA;C4=NA;C5=NA;C6=NA; special=POSITION_CUE_ONLY |
| VI_PILOT_ITEM_0050 | VI_PILOT_FAMILY_017 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_MUON | ASSESSMENT_DAY7_TRANSFER | 대화: A가 '지금 무엇을 하고 싶어요?'라고 묻는다. B의 의도는 책 읽기다. Vietnamese로 답한다. | Tôi muốn đọc sách. | Tôi muốn đọc sách. ; Tôi muốn đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=dialogue |
| VI_PILOT_ITEM_0051 | VI_PILOT_FAMILY_045 | VI_PILOT_SCN_03_CAPABILITY_DECISION | GRAMMAR_VI_PHAI | ASSESSMENT_DAY7_TRANSFER | 대화: A가 '지금 꼭 해야 하는 일은?'이라고 묻는다. B에게 필요한 일은 식사다. Vietnamese로 답한다. | Tôi phải ăn cơm. | Tôi phải ăn cơm. ; Tôi phải ăn cơm | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0135, LEXICAL_ENTRY_VI_0298 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=dialogue |
| VI_PILOT_ITEM_0052 | VI_PILOT_FAMILY_018 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | TRAINING_SOURCE | 계획 카드: 화자는 이후 이동할 것이다. Vietnamese 한 문장. | Tôi sẽ đi. | Tôi sẽ đi. ; Tôi sẽ đi | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0065 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=lexical đi here, no grammatical DI |
| VI_PILOT_ITEM_0053 | VI_PILOT_FAMILY_018 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | PRACTICE_SOURCE | 계획 카드: 화자는 이후 공부할 것이다. Vietnamese 한 문장. | Tôi sẽ học. | Tôi sẽ học. ; Tôi sẽ học | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0182 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=NEU_THI excluded |
| VI_PILOT_ITEM_0054 | VI_PILOT_FAMILY_018 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | ASSESSMENT_IMMEDIATE_SOURCE | 계획 카드: 화자는 이후 상대에게 전화할 것이다. Vietnamese 한 문장. | Tôi sẽ gọi bạn. | Tôi sẽ gọi bạn. ; Tôi sẽ gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=NEU_THI excluded |
| VI_PILOT_ITEM_0055 | VI_PILOT_FAMILY_019 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | ASSESSMENT_DAY7_TRANSFER | 대화: A가 다음 행동 계획을 묻는다. B의 계획은 책 읽기다. Vietnamese 답변 한 문장. | Tôi sẽ đọc sách. | Tôi sẽ đọc sách. ; Tôi sẽ đọc sách | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=no NEU_THI |
| VI_PILOT_ITEM_0056 | VI_PILOT_FAMILY_020 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_SE | ASSESSMENT_DAY30_TRANSFER | 재계획 카드: 상황 변경 뒤 B가 선택한 다음 행동은 물 마시기다. Vietnamese future-plan 한 문장. | Tôi sẽ uống nước. | Tôi sẽ uống nước. ; Tôi sẽ uống nước | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=PASS; special=no NEU_THI |
| VI_PILOT_ITEM_0057 | VI_PILOT_FAMILY_021 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_MUON | ASSESSMENT_DAY30_TRANSFER | 미래 계획 대화: 가능한 여러 행동 중 B가 원하는 것은 상대에게 전화하기다. Vietnamese 답변 한 문장. | Tôi muốn gọi bạn. | Tôi muốn gọi bạn. ; Tôi muốn gọi bạn | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0278, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=no SE/NEU requirement |
| VI_PILOT_ITEM_0058 | VI_PILOT_FAMILY_046 | VI_PILOT_SCN_04_FUTURE_CONTINGENCY | GRAMMAR_VI_PHAI | ASSESSMENT_DAY30_TRANSFER | 미래 계획 대화: 다음 단계 전에 B가 반드시 해야 하는 일은 공부다. Vietnamese 답변 한 문장. | Tôi phải học. | Tôi phải học. ; Tôi phải học | LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0182 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=no SE/NEU requirement |
| VI_PILOT_ITEM_0059 | VI_PILOT_FAMILY_022 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | TRAINING_SOURCE | 비교 사실: 내 집이 상대의 집보다 크다. Vietnamese 한 문장. | Nhà tôi lớn hơn nhà bạn. | Nhà tôi lớn hơn nhà bạn. ; Nhà tôi lớn hơn nhà bạn | LEXICAL_ENTRY_VI_0053, LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0049, LEXICAL_ENTRY_VI_0058 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=bounded adjective pool |
| VI_PILOT_ITEM_0060 | VI_PILOT_FAMILY_022 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | PRACTICE_SOURCE | 비교 사실: 이 차가 저 차보다 빠르다. Vietnamese 한 문장. | Xe này nhanh hơn xe đó. | Xe này nhanh hơn xe đó. ; Xe này nhanh hơn xe đó | LEXICAL_ENTRY_VI_0094, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0206, LEXICAL_ENTRY_VI_0056 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=bounded adjective pool |
| VI_PILOT_ITEM_0061 | VI_PILOT_FAMILY_022 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | ASSESSMENT_IMMEDIATE_SOURCE | 비교 사실: 이 옷이 저 옷보다 아름답다. Vietnamese 한 문장. | Áo này đẹp hơn áo đó. | Áo này đẹp hơn áo đó. ; Áo này đẹp hơn áo đó | LEXICAL_ENTRY_VI_0277, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0183, LEXICAL_ENTRY_VI_0056 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=bounded adjective pool |
| VI_PILOT_ITEM_0062 | VI_PILOT_FAMILY_023 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT | TRAINING_SOURCE | 순위 사실: 내 집이 비교 집합에서 가장 크다. Vietnamese 한 문장. | Nhà tôi lớn nhất. | Nhà tôi lớn nhất. ; Nhà tôi lớn nhất | LEXICAL_ENTRY_VI_0053, LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0049 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=same adjective pool |
| VI_PILOT_ITEM_0063 | VI_PILOT_FAMILY_023 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT | PRACTICE_SOURCE | 순위 사실: 이 차가 비교 집합에서 가장 빠르다. Vietnamese 한 문장. | Xe này nhanh nhất. | Xe này nhanh nhất. ; Xe này nhanh nhất | LEXICAL_ENTRY_VI_0094, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0206 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=same adjective pool |
| VI_PILOT_ITEM_0064 | VI_PILOT_FAMILY_023 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT | ASSESSMENT_IMMEDIATE_SOURCE | 순위 사실: 이 옷이 비교 집합에서 가장 아름답다. Vietnamese 한 문장. | Áo này đẹp nhất. | Áo này đẹp nhất. ; Áo này đẹp nhất | LEXICAL_ENTRY_VI_0277, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0183 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=same adjective pool |
| VI_PILOT_ITEM_0065 | VI_PILOT_FAMILY_024 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CAI | TRAINING_SOURCE | 수량 카드: 탁자 2개. Vietnamese 명사구로 쓴다. | hai cái bàn | hai cái bàn | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0184 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0066 | VI_PILOT_FAMILY_024 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CAI | PRACTICE_SOURCE | 수량 카드: 의자 2개. Vietnamese 명사구로 쓴다. | hai cái ghế | hai cái ghế | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0293 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0067 | VI_PILOT_FAMILY_024 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CAI | ASSESSMENT_IMMEDIATE_SOURCE | 수량 카드: 옷 2개. Vietnamese 명사구로 쓴다. | hai cái áo | hai cái áo | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0277 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0068 | VI_PILOT_FAMILY_047 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CON | TRAINING_SOURCE | 수량 카드: 고양이 2마리. Vietnamese 명사구로 쓴다. | hai con mèo | hai con mèo | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0297 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0069 | VI_PILOT_FAMILY_047 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CON | PRACTICE_SOURCE | 수량 카드: 개 2마리. Vietnamese 명사구로 쓴다. | hai con chó | hai con chó | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0291 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0070 | VI_PILOT_FAMILY_047 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_CL_CON | ASSESSMENT_IMMEDIATE_SOURCE | 수량 카드: 닭 2마리. Vietnamese 명사구로 쓴다. | hai con gà | hai con gà | LEXICAL_ENTRY_VI_0073, LEXICAL_ENTRY_VI_0296 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=PASS;C5=NA;C6=NA; special=bounded noun class |
| VI_PILOT_ITEM_0071 | VI_PILOT_FAMILY_025 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CAI | ASSESSMENT_DAY7_TRANSFER | 비교 카드: 이 탁자는 저 의자보다 크다. 두 사물을 해당 classifier와 함께 Vietnamese 한 문장으로 쓴다. | Cái bàn này lớn hơn cái ghế đó. | Cái bàn này lớn hơn cái ghế đó. ; Cái bàn này lớn hơn cái ghế đó | LEXICAL_ENTRY_VI_0184, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0049, LEXICAL_ENTRY_VI_0293, LEXICAL_ENTRY_VI_0056 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0072 | VI_PILOT_FAMILY_048 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CON | ASSESSMENT_DAY7_TRANSFER | 비교 카드: 이 개는 저 고양이보다 크다. 두 동물을 해당 classifier와 함께 Vietnamese 한 문장으로 쓴다. | Con chó này lớn hơn con mèo đó. | Con chó này lớn hơn con mèo đó. ; Con chó này lớn hơn con mèo đó | LEXICAL_ENTRY_VI_0291, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0049, LEXICAL_ENTRY_VI_0297, LEXICAL_ENTRY_VI_0056 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0073 | VI_PILOT_FAMILY_026 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | ASSESSMENT_DAY7_TRANSFER | 순위 카드: 이 탁자가 사물 집합에서 가장 크다. classifier를 포함한 Vietnamese 한 문장. | Cái bàn này lớn nhất. | Cái bàn này lớn nhất. ; Cái bàn này lớn nhất | LEXICAL_ENTRY_VI_0184, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0049 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0074 | VI_PILOT_FAMILY_049 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | ASSESSMENT_DAY7_TRANSFER | 순위 카드: 이 개가 동물 집합에서 가장 크다. classifier를 포함한 Vietnamese 한 문장. | Con chó này lớn nhất. | Con chó này lớn nhất. ; Con chó này lớn nhất | LEXICAL_ENTRY_VI_0291, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0049 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0075 | VI_PILOT_FAMILY_027 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_HON | ASSESSMENT_DAY30_TRANSFER | 속성 표: 내 집=더 높음, 상대 집=더 낮음. 표를 Vietnamese comparative 한 문장으로 바꾼다. | Nhà tôi cao hơn nhà bạn. | Nhà tôi cao hơn nhà bạn. ; Nhà tôi cao hơn nhà bạn | LEXICAL_ENTRY_VI_0053, LEXICAL_ENTRY_VI_0039, LEXICAL_ENTRY_VI_0045, LEXICAL_ENTRY_VI_0058 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=PASS;C6=NA; special=table transform |
| VI_PILOT_ITEM_0076 | VI_PILOT_FAMILY_028 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | ASSESSMENT_DAY30_TRANSFER | rank 카드: 사물 집합에서 이 옷이 가장 아름답다. classifier를 포함한 Vietnamese 한 문장. | Cái áo này đẹp nhất. | Cái áo này đẹp nhất. ; Cái áo này đẹp nhất | LEXICAL_ENTRY_VI_0277, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0183 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0077 | VI_PILOT_FAMILY_050 | VI_PILOT_SCN_05_COMPARE_SELECT | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | ASSESSMENT_DAY30_TRANSFER | rank 카드: 동물 집합에서 이 고양이가 가장 작다. classifier를 포함한 Vietnamese 한 문장. | Con mèo này nhỏ nhất. | Con mèo này nhỏ nhất. ; Con mèo này nhỏ nhất | LEXICAL_ENTRY_VI_0297, LEXICAL_ENTRY_VI_0012, LEXICAL_ENTRY_VI_0134 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=PASS;C5=PASS;C6=NA |
| VI_PILOT_ITEM_0078 | VI_PILOT_FAMILY_029 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | TRAINING_SOURCE | 행동 목표: 상대에게 책을 읽도록 직접 지시한다. Vietnamese 한 문장. | Hãy đọc sách. | Hãy đọc sách. ; Hãy đọc sách | LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=lexical đi absent |
| VI_PILOT_ITEM_0079 | VI_PILOT_FAMILY_029 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | PRACTICE_SOURCE | 행동 목표: 상대에게 물을 마시도록 직접 지시한다. Vietnamese 한 문장. | Hãy uống nước. | Hãy uống nước. ; Hãy uống nước | LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=lexical đi absent |
| VI_PILOT_ITEM_0080 | VI_PILOT_FAMILY_029 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | ASSESSMENT_IMMEDIATE_SOURCE | 행동 목표: 상대에게 문을 열도록 직접 지시한다. Vietnamese 한 문장. | Hãy mở cửa. | Hãy mở cửa. ; Hãy mở cửa | LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=lexical đi absent |
| VI_PILOT_ITEM_0081 | VI_PILOT_FAMILY_030 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | TRAINING_SOURCE | 행동 목표: 상대에게 책을 읽도록 짧게 재촉한다. sentence-final directive form을 사용하되 marker 단어는 prompt에 제시하지 않는다. | Đọc sách đi. | Đọc sách đi. ; Đọc sách đi | LEXICAL_ENTRY_VI_0294, LEXICAL_ENTRY_VI_0295 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=grammatical DI; lexical entry 0065 absent |
| VI_PILOT_ITEM_0082 | VI_PILOT_FAMILY_030 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | PRACTICE_SOURCE | 행동 목표: 상대에게 물을 마시도록 짧게 재촉한다. sentence-final directive form을 사용하되 marker 단어는 prompt에 제시하지 않는다. | Uống nước đi. | Uống nước đi. ; Uống nước đi | LEXICAL_ENTRY_VI_0286, LEXICAL_ENTRY_VI_0057 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=grammatical DI; lexical entry 0065 absent |
| VI_PILOT_ITEM_0083 | VI_PILOT_FAMILY_030 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | ASSESSMENT_IMMEDIATE_SOURCE | 행동 목표: 상대에게 문을 열도록 짧게 재촉한다. sentence-final directive form을 사용하되 marker 단어는 prompt에 제시하지 않는다. | Mở cửa đi. | Mở cửa đi. ; Mở cửa đi | LEXICAL_ENTRY_VI_0192, LEXICAL_ENTRY_VI_0285 | SAME_ITEM_FAMILY_DESIGN_EXPECTATION | false | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=grammatical DI; lexical entry 0065 absent |
| VI_PILOT_ITEM_0084 | VI_PILOT_FAMILY_031 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY, GRAMMAR_VI_DI | ASSESSMENT_DAY7_TRANSFER | 협력 대화: 상대에게 문을 닫도록 앞뒤 두 directive marker가 함께 있는 자연스러운 지시를 한 문장으로 만든다. marker 단어 자체는 제시하지 않는다. | Hãy đóng cửa đi. | Hãy đóng cửa đi. ; Hãy đóng cửa đi | LEXICAL_ENTRY_VI_0281, LEXICAL_ENTRY_VI_0285 | PRIMARY_UNSEEN_CANDIDATE | true | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=lexical entry 0065 absent |
| VI_PILOT_ITEM_0085 | VI_PILOT_FAMILY_032 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_HAY | ASSESSMENT_DAY30_TRANSFER | 대화: 파트너가 '무엇을 해야 하나요?'라고 묻는다. 답은 '공부하세요'라는 명시적 지시다. Vietnamese 한 문장. | Hãy học. | Hãy học. ; Hãy học | LEXICAL_ENTRY_VI_0182 | PRIMARY_UNSEEN_CANDIDATE | true | C1=NA;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA |
| VI_PILOT_ITEM_0086 | VI_PILOT_FAMILY_033 | VI_PILOT_SCN_06_DIRECTIVE_ACTION | GRAMMAR_VI_DI | ASSESSMENT_DAY30_TRANSFER | 대화: 망설이는 파트너에게 '공부해'라고 짧게 재촉한다. sentence-final directive form을 사용하되 marker 단어 자체는 제시하지 않는다. | Học đi. | Học đi. ; Học đi | LEXICAL_ENTRY_VI_0182 | PRIMARY_UNSEEN_CANDIDATE | true | C1=PASS;C2=NA;C3=NA;C4=NA;C5=NA;C6=NA; special=lexical entry 0065 absent |

### 5.1 VI_PILOT_ITEM_0046 authoritative accepted-response variants (real LF, fixed line order)

`VI_PILOT_ITEM_0046` (family `VI_PILOT_FAMILY_013`) has a two-line ordered answer structure (line 1: `GRAMMAR_VI_CO_THE` realization; line 2: `GRAMMAR_VI_DUOC_ABILITY` realization). The Research R2 table represents the line break with a display-only `<br>` notation (R2 §11, Architecture Readjudication §10.2 requires normalization). The authoritative accepted-response strings recorded by this manifest use a real line feed (`LF`, `\n`) between the two lines, never the literal text `<br>`. Line order is fixed (CO_THE line first, DUOC_ABILITY line second) in all four variants; no line permutation is accepted. Exactly four variants exist, corresponding to independent terminal-period presence/absence on each line:

**Variant 1 — both lines with terminal period:**

```text
Tôi có thể mở cửa.
Tôi mở được cửa.
```

**Variant 2 — line 1 with terminal period, line 2 without:**

```text
Tôi có thể mở cửa.
Tôi mở được cửa
```

**Variant 3 — line 1 without terminal period, line 2 with:**

```text
Tôi có thể mở cửa
Tôi mở được cửa.
```

**Variant 4 — both lines without terminal period:**

```text
Tôi có thể mở cửa
Tôi mở được cửa
```

Each code block above contains exactly two lines separated by one real newline character in this file's source — not the markup sequence `<br>`. This is a representation normalization only; it does not change item semantics, target nodes, lexical links, or family membership.

## 6. Expected-response representation

- Documentation-only index label: `EXPECTED_RESPONSE_BANK_VI_EMPIRICAL_PILOT_V1`. Per A-ITEM-02, this label is **not** a new runtime `reference_kind`, is not pinned separately in assignment snapshots, and does not compete with the ITEM definition as authority.
- Runtime authority: the accepted-response data embedded inside each versioned ITEM definition (§5).
- Unicode comparison normalization: NFC only.
- No casefolding.
- No stemming.
- No diacritic deletion.
- No inferred synonym expansion.
- Sentence canonical response ending in `.` or `?`: exactly the canonical string, plus exactly one explicitly enumerated variant with only terminal punctuation removed.
- Punctuation-free noun phrase (e.g. items 0065–0070): canonical exact string only, no variant.
- `VI_PILOT_ITEM_0046`: ordered two-line response; line order fixed; all four line-level terminal-period combinations are explicitly enumerated in §5.1; no line permutation is accepted; authoritative line separator is a real `LF`, never literal `<br>`.
- If accepted-response content changes for any item, the `item_version` changes; this index label is not re-versioned independently of the ITEM.

## 7. RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1 exact eight-key definition

Rubric identity: `RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1`, pinned by every family (§4) and every item (§5). This reproduces R2 §12 exactly, adopted by Architecture Readjudication §11/§16.8 as the exact closed eight-key candidate definition. The canonical vocabulary arrays preserve the existing `EVIDENCE_FOUNDATION_P0_SCHEMA.md`-consistent contract values and order; `RELATED` and `ALTERNATIVE` are not attribution relations and do not appear.

```json
{
  "definitionType": "EVIDENCE_ERROR_CLASSIFICATION_RUBRIC",
  "definitionVersion": 1,
  "scoreMode": "BINARY",
  "classificationVocabulary": [
    "NO_ERROR",
    "LINGUISTIC_ERROR",
    "TASK_INSTRUCTION_MISUNDERSTANDING",
    "MODALITY_INPUT_FAILURE",
    "NO_EVALUABLE_RESPONSE",
    "UNCLASSIFIED"
  ],
  "linguisticCategoryVocabulary": [
    "FORM",
    "WORD_ORDER",
    "LEXICAL_CHOICE",
    "OTHER"
  ],
  "attributionRelationVocabulary": [
    "TARGET",
    "PREREQUISITE",
    "CONTRAST",
    "UNRESOLVED"
  ],
  "rubricRuleIds": [
    "VI_RUBRIC_RULE_ACCEPTED_RESPONSE",
    "VI_RUBRIC_RULE_TARGET_FORM",
    "VI_RUBRIC_RULE_WORD_ORDER",
    "VI_RUBRIC_RULE_LEXICAL_CHOICE",
    "VI_RUBRIC_RULE_PREREQUISITE_ATTRIBUTION",
    "VI_RUBRIC_RULE_CONTRAST_ATTRIBUTION",
    "VI_RUBRIC_RULE_TASK_INSTRUCTION",
    "VI_RUBRIC_RULE_MODALITY_INPUT",
    "VI_RUBRIC_RULE_NO_EVALUABLE_RESPONSE",
    "VI_RUBRIC_RULE_UNCLASSIFIED"
  ],
  "attributionAuthority": {
    "byTargetNode": {
      "GRAMMAR_VI_DA": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_DANG"]
      },
      "GRAMMAR_VI_SE": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_DANG": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_DA"]
      },
      "GRAMMAR_VI_ROI": {
        "prerequisiteNodeIds": ["GRAMMAR_VI_DA"],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_CO_THE": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_PHAI"]
      },
      "GRAMMAR_VI_DUOC_ABILITY": {
        "prerequisiteNodeIds": ["GRAMMAR_VI_CO_THE"],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_MUON": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_PHAI": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_CO_THE"]
      },
      "GRAMMAR_VI_KHONG": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_CHUA"]
      },
      "GRAMMAR_VI_CHUA": {
        "prerequisiteNodeIds": ["GRAMMAR_VI_KHONG"],
        "contrastNodeIds": ["GRAMMAR_VI_KHONG"]
      },
      "GRAMMAR_VI_CO_KHONG": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_WH_INSITU": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_CL_CAI": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_CL_CON"]
      },
      "GRAMMAR_VI_CL_CON": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": ["GRAMMAR_VI_CL_CAI"]
      },
      "GRAMMAR_VI_HON": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_NHAT": {
        "prerequisiteNodeIds": ["GRAMMAR_VI_HON"],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_HAY": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      },
      "GRAMMAR_VI_DI": {
        "prerequisiteNodeIds": [],
        "contrastNodeIds": []
      }
    }
  }
}
```

`attributionAuthority.byTargetNode` contains exactly the 18 selected nodes (`VI_EMPIRICAL_PILOT_SPEC.md` §3.1). The prerequisite/contrast allowlist matches current `VI_LANGUAGE_PACK.md` canonical relations: prerequisites ROI→DA, NHAT→HON, CHUA→KHONG, DUOC_ABILITY→CO_THE; contrasts DA↔DANG, KHONG↔CHUA, CO_THE↔PHAI, CL_CAI↔CL_CON. `RELATED` and `ALTERNATIVE` are not promoted to attribution relations.

For a multi-target item (e.g. 0032/0046/0047/0048/0071–0074/0076/0077/0084), the assignment target set is fixed in the ITEM/FAMILY definition and finalization produces exactly one `evidence_target_node_evaluations` bridge row per assignment-snapshot target node (`EVIDENCE_FOUNDATION_P0_SCHEMA.md` §5.15). Node evaluations remain independent; an error attributable to one target does not automatically force another target's evaluation to `LINGUISTIC_ERROR`.

## 8. Source / held-out role and timepoint matrix

Exact current inventory (derived from, and consistent with, §4/§5):

- SOURCE-role items (`TRAINING_SOURCE` / `PRACTICE_SOURCE` / `ASSESSMENT_IMMEDIATE_SOURCE`): **54**
- `ASSESSMENT_DAY7_TRANSFER` held-out items: **16**
- `ASSESSMENT_DAY30_TRANSFER` held-out items: **16**
- total items: **54 + 16 + 16 = 86**
- `DAY_7` target-node evaluation rows (sum of target-node counts across all DAY_7 items): **24**
- `DAY_30` target-node evaluation rows (sum of target-node counts across all DAY_30 items): **19**

No new role enum or runtime contract is introduced here; `TRAINING_SOURCE`, `PRACTICE_SOURCE`, `ASSESSMENT_IMMEDIATE_SOURCE`, `ASSESSMENT_DAY7_TRANSFER`, and `ASSESSMENT_DAY30_TRANSFER` are the same design-role labels already used per-item in §5, and they map onto the assignment-level `assignment_type`/`target_timepoint` values already defined in `EVIDENCE_FOUNDATION_P0_SCHEMA.md` §5.8 (`LEARNING`/`REVIEW`/`ASSESSMENT`; `IMMEDIATE`/`DAY_7`/`DAY_30`/`NOT_APPLICABLE`).

### 8.1 Per-node role/timepoint coverage

Every one of the 18 selected Grammar Nodes has at least one SOURCE family, one DAY_7 held-out family, and one DAY_30 held-out family. Multi-target held-out families are shared across two nodes (marked below):

| node | SOURCE family | DAY_7 held-out family | DAY_30 held-out family |
|---|---|---|---|
| GRAMMAR_VI_DA | VI_PILOT_FAMILY_001 | VI_PILOT_FAMILY_004 | VI_PILOT_FAMILY_005 |
| GRAMMAR_VI_DANG | VI_PILOT_FAMILY_034 | VI_PILOT_FAMILY_036; also VI_PILOT_FAMILY_008 (shared with WH_INSITU) | VI_PILOT_FAMILY_040 |
| GRAMMAR_VI_KHONG | VI_PILOT_FAMILY_002 | VI_PILOT_FAMILY_037 | VI_PILOT_FAMILY_041 |
| GRAMMAR_VI_CHUA | VI_PILOT_FAMILY_035 | VI_PILOT_FAMILY_038 | VI_PILOT_FAMILY_042 |
| GRAMMAR_VI_ROI | VI_PILOT_FAMILY_003 | VI_PILOT_FAMILY_039 | VI_PILOT_FAMILY_043 |
| GRAMMAR_VI_WH_INSITU | VI_PILOT_FAMILY_006 | VI_PILOT_FAMILY_008 (shared with DANG) | VI_PILOT_FAMILY_009 |
| GRAMMAR_VI_CO_KHONG | VI_PILOT_FAMILY_007 | VI_PILOT_FAMILY_014 (shared with CO_THE) | VI_PILOT_FAMILY_015 (shared with CO_THE) |
| GRAMMAR_VI_CO_THE | VI_PILOT_FAMILY_010 | VI_PILOT_FAMILY_013 (shared with DUOC_ABILITY); also VI_PILOT_FAMILY_014 (shared with CO_KHONG) | VI_PILOT_FAMILY_015 (shared with CO_KHONG) |
| GRAMMAR_VI_DUOC_ABILITY | VI_PILOT_FAMILY_011 | VI_PILOT_FAMILY_013 (shared with CO_THE) | VI_PILOT_FAMILY_016 |
| GRAMMAR_VI_MUON | VI_PILOT_FAMILY_012 | VI_PILOT_FAMILY_017 | VI_PILOT_FAMILY_021 |
| GRAMMAR_VI_PHAI | VI_PILOT_FAMILY_044 | VI_PILOT_FAMILY_045 | VI_PILOT_FAMILY_046 |
| GRAMMAR_VI_SE | VI_PILOT_FAMILY_018 | VI_PILOT_FAMILY_019 | VI_PILOT_FAMILY_020 |
| GRAMMAR_VI_HON | VI_PILOT_FAMILY_022 | VI_PILOT_FAMILY_025 (shared with CL_CAI); also VI_PILOT_FAMILY_048 (shared with CL_CON) | VI_PILOT_FAMILY_027 |
| GRAMMAR_VI_NHAT | VI_PILOT_FAMILY_023 | VI_PILOT_FAMILY_026 (shared with CL_CAI); also VI_PILOT_FAMILY_049 (shared with CL_CON) | VI_PILOT_FAMILY_028 (shared with CL_CAI); also VI_PILOT_FAMILY_050 (shared with CL_CON) |
| GRAMMAR_VI_CL_CAI | VI_PILOT_FAMILY_024 | VI_PILOT_FAMILY_025 (shared with HON); also VI_PILOT_FAMILY_026 (shared with NHAT) | VI_PILOT_FAMILY_028 (shared with NHAT) |
| GRAMMAR_VI_CL_CON | VI_PILOT_FAMILY_047 | VI_PILOT_FAMILY_048 (shared with HON); also VI_PILOT_FAMILY_049 (shared with NHAT) | VI_PILOT_FAMILY_050 (shared with NHAT) |
| GRAMMAR_VI_HAY | VI_PILOT_FAMILY_029 | VI_PILOT_FAMILY_031 (shared with DI) | VI_PILOT_FAMILY_032 |
| GRAMMAR_VI_DI | VI_PILOT_FAMILY_030 | VI_PILOT_FAMILY_031 (shared with HAY) | VI_PILOT_FAMILY_033 |

This table is a coverage index only; §4 remains the exact per-family authority and §5 remains the exact per-item authority.

## 9. DIFFERENT_ITEM_FAMILY primary-unseen proof

### 9.1 Design-intent boundary (restated)

Primary unseen-transfer metric eligibility (`VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §14.3) is never fixed by a static manifest label. Per §3.2 of this document:

- `primary_unseen_candidate = true` on a held-out item (§5) records design intent only.
- Actual eligibility requires the assignment-time exposure-history snapshot lineage to resolve to `DIFFERENT_ITEM_FAMILY`, under the exclusive priority order: `EXACT_REPEAT` → `SURFACE_VARIANT` → `SAME_ITEM_FAMILY` → `DIFFERENT_ITEM_FAMILY`.
- A later exposure never retroactively rewrites an earlier immutable assignment snapshot's already-resolved lineage.
- If a held-out family is exposed to a learner through prior learning/practice/review before its designated assessment, a subsequent assignment for that family resolves to `SAME_ITEM_FAMILY` (or a higher-priority classification such as `EXACT_REPEAT`/`SURFACE_VARIANT` if applicable), **not** `DIFFERENT_ITEM_FAMILY` — this is why held-out families must not be exposed through learner-facing learning/practice/review before their designated assessment (§3.3).

### 9.2 Exact 43 source → held-out node-path proof pairs

The table below is the Architecture-approved material-difference proof (Architecture Readjudication §9.1–9.2): every row demonstrates that the held-out family differs from its source family in at least one canonical family dimension (exact target-construction set, elicitation operation, or answer structure) — never lexical noun/verb substitution alone. This proof establishes design-intent eligibility for the primary-unseen metric; it does not itself assert actual per-assignment lineage (§9.1).

| node | source family | source exact targets | source elicitation template | source answer structure | held-out family | timepoint | held-out exact targets | held-out elicitation template | held-out answer structure | proof |
|---|---|---|---|---|---|---|---|---|---|---|
| GRAMMAR_VI_DA | VI_PILOT_FAMILY_001 | GRAMMAR_VI_DA | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=이전 사건] → 1개 Vietnamese declarative | Tôi + đã + V (+O). | VI_PILOT_FAMILY_004 | DAY_7 | GRAMMAR_VI_DA | 상태 질문 + 사실 카드 [state=이전 사건] → one bounded Vietnamese reply | Tôi + đã + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_DA | VI_PILOT_FAMILY_001 | GRAMMAR_VI_DA | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=이전 사건] → 1개 Vietnamese declarative | Tôi + đã + V (+O). | VI_PILOT_FAMILY_005 | DAY_30 | GRAMMAR_VI_DA | 구조 카드 [actor=나, action=<bounded action>, state=이전 사건] → one Vietnamese sentence | Tôi + đã + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_WH_INSITU | VI_PILOT_FAMILY_006 | GRAMMAR_VI_WH_INSITU | question intent → WH question | S + V (+O) + WH | VI_PILOT_FAMILY_008 | DAY_7 | GRAMMAR_VI_WH_INSITU, GRAMMAR_VI_DANG | dialogue info gap → question | Bạn + đang + V + gì? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_DANG | VI_PILOT_FAMILY_034 | GRAMMAR_VI_DANG | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=현재 진행] → 1개 Vietnamese declarative | Tôi + đang + V (+O). | VI_PILOT_FAMILY_008 | DAY_7 | GRAMMAR_VI_WH_INSITU, GRAMMAR_VI_DANG | dialogue info gap → question | Bạn + đang + V + gì? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_WH_INSITU | VI_PILOT_FAMILY_006 | GRAMMAR_VI_WH_INSITU | question intent → WH question | S + V (+O) + WH | VI_PILOT_FAMILY_009 | DAY_30 | GRAMMAR_VI_WH_INSITU | semantic slots → missing-location question | S+V+O+ở+đâu? | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_CO_THE | VI_PILOT_FAMILY_010 | GRAMMAR_VI_CO_THE | ability fact → declarative | S+có thể+V(+O) | VI_PILOT_FAMILY_013 | DAY_7 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_DUOC_ABILITY | one proposition → ordered two-line paraphrase | line1 CO_THE; line2 DUOC | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_DUOC_ABILITY | VI_PILOT_FAMILY_011 | GRAMMAR_VI_DUOC_ABILITY | agentive ability fact → declarative | S+V+được+O | VI_PILOT_FAMILY_013 | DAY_7 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_DUOC_ABILITY | one proposition → ordered two-line paraphrase | line1 CO_THE; line2 DUOC | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CO_THE | VI_PILOT_FAMILY_010 | GRAMMAR_VI_CO_THE | ability fact → declarative | S+có thể+V(+O) | VI_PILOT_FAMILY_014 | DAY_7 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | capability inquiry → direct question | Bạn+có thể+V+O+không? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CO_KHONG | VI_PILOT_FAMILY_007 | GRAMMAR_VI_CO_KHONG | yes/no intent → question | S+có+V(+O)+không? | VI_PILOT_FAMILY_014 | DAY_7 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | capability inquiry → direct question | Bạn+có thể+V+O+không? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CO_THE | VI_PILOT_FAMILY_010 | GRAMMAR_VI_CO_THE | ability fact → declarative | S+có thể+V(+O) | VI_PILOT_FAMILY_015 | DAY_30 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | semantic card → question transformation | Bạn+có thể+V+O+không? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CO_KHONG | VI_PILOT_FAMILY_007 | GRAMMAR_VI_CO_KHONG | yes/no intent → question | S+có+V(+O)+không? | VI_PILOT_FAMILY_015 | DAY_30 | GRAMMAR_VI_CO_THE, GRAMMAR_VI_CO_KHONG | semantic card → question transformation | Bạn+có thể+V+O+không? | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_DUOC_ABILITY | VI_PILOT_FAMILY_011 | GRAMMAR_VI_DUOC_ABILITY | agentive ability fact → declarative | S+V+được+O | VI_PILOT_FAMILY_016 | DAY_30 | GRAMMAR_VI_DUOC_ABILITY | ability fact + positional instruction → sentence | S+V+được+O | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_MUON | VI_PILOT_FAMILY_012 | GRAMMAR_VI_MUON | 의도 카드 [actor=나, action=<bounded action>, intent=원함] → declarative | Tôi + muốn + V (+O). | VI_PILOT_FAMILY_017 | DAY_7 | GRAMMAR_VI_MUON | decision dialogue + fact card [desired action=<bounded action>] → one declarative reply | Tôi + muốn + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_SE | VI_PILOT_FAMILY_018 | GRAMMAR_VI_SE | future semantic fact → declarative | S+sẽ+V(+O) | VI_PILOT_FAMILY_019 | DAY_7 | GRAMMAR_VI_SE | plan question → reply | S+sẽ+V(+O) | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_SE | VI_PILOT_FAMILY_018 | GRAMMAR_VI_SE | future semantic fact → declarative | S+sẽ+V(+O) | VI_PILOT_FAMILY_020 | DAY_30 | GRAMMAR_VI_SE | changed constraint card → revised plan | S+sẽ+V(+O) | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_MUON | VI_PILOT_FAMILY_012 | GRAMMAR_VI_MUON | 의도 카드 [actor=나, action=<bounded action>, intent=원함] → declarative | Tôi + muốn + V (+O). | VI_PILOT_FAMILY_021 | DAY_30 | GRAMMAR_VI_MUON | future decision card [chosen desired action=<bounded action>] → one reply | Tôi + muốn + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_HON | VI_PILOT_FAMILY_022 | GRAMMAR_VI_HON | two entities + property relation → sentence | A+Adj+hơn+B | VI_PILOT_FAMILY_025 | DAY_7 | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CAI | 비교 카드 [two bounded inanimate entities + property relation] → full clause | Cái + N1 + này + Adj + hơn + cái + N2 + đó. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CAI | VI_PILOT_FAMILY_024 | GRAMMAR_VI_CL_CAI | 수량 카드 [quantity=hai, entity=<bounded inanimate noun>] → NP | hai + cái + N | VI_PILOT_FAMILY_025 | DAY_7 | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CAI | 비교 카드 [two bounded inanimate entities + property relation] → full clause | Cái + N1 + này + Adj + hơn + cái + N2 + đó. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_NHAT | VI_PILOT_FAMILY_023 | GRAMMAR_VI_NHAT | ranked entity → sentence | A+Adj+nhất | VI_PILOT_FAMILY_026 | DAY_7 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | 순위 카드 [ranked bounded inanimate entity] → sentence | Cái + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CAI | VI_PILOT_FAMILY_024 | GRAMMAR_VI_CL_CAI | 수량 카드 [quantity=hai, entity=<bounded inanimate noun>] → NP | hai + cái + N | VI_PILOT_FAMILY_026 | DAY_7 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | 순위 카드 [ranked bounded inanimate entity] → sentence | Cái + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_HON | VI_PILOT_FAMILY_022 | GRAMMAR_VI_HON | two entities + property relation → sentence | A+Adj+hơn+B | VI_PILOT_FAMILY_027 | DAY_30 | GRAMMAR_VI_HON | two-row property table → sentence | A+Adj+hơn+B | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_NHAT | VI_PILOT_FAMILY_023 | GRAMMAR_VI_NHAT | ranked entity → sentence | A+Adj+nhất | VI_PILOT_FAMILY_028 | DAY_30 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | rank-card transformation [bounded inanimate entity + winning property] → sentence | Cái + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CAI | VI_PILOT_FAMILY_024 | GRAMMAR_VI_CL_CAI | 수량 카드 [quantity=hai, entity=<bounded inanimate noun>] → NP | hai + cái + N | VI_PILOT_FAMILY_028 | DAY_30 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CAI | rank-card transformation [bounded inanimate entity + winning property] → sentence | Cái + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_HAY | VI_PILOT_FAMILY_029 | GRAMMAR_VI_HAY | action goal → directive | Hãy+V(+O) | VI_PILOT_FAMILY_031 | DAY_7 | GRAMMAR_VI_HAY, GRAMMAR_VI_DI | cooperative dialogue → combined directive | Hãy+V+O+đi | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_DI | VI_PILOT_FAMILY_030 | GRAMMAR_VI_DI | action goal → directive | V(+O)+đi | VI_PILOT_FAMILY_031 | DAY_7 | GRAMMAR_VI_HAY, GRAMMAR_VI_DI | cooperative dialogue → combined directive | Hãy+V+O+đi | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_HAY | VI_PILOT_FAMILY_029 | GRAMMAR_VI_HAY | action goal → directive | Hãy+V(+O) | VI_PILOT_FAMILY_032 | DAY_30 | GRAMMAR_VI_HAY | partner asks for instruction → directive | Hãy+V | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_DI | VI_PILOT_FAMILY_030 | GRAMMAR_VI_DI | action goal → directive | V(+O)+đi | VI_PILOT_FAMILY_033 | DAY_30 | GRAMMAR_VI_DI | partner needs short prompt → directive | V+đi | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_DANG | VI_PILOT_FAMILY_034 | GRAMMAR_VI_DANG | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=현재 진행] → 1개 Vietnamese declarative | Tôi + đang + V (+O). | VI_PILOT_FAMILY_036 | DAY_7 | GRAMMAR_VI_DANG | 상태 질문 + 사실 카드 [state=현재 진행] → one bounded Vietnamese reply | Tôi + đang + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_KHONG | VI_PILOT_FAMILY_002 | GRAMMAR_VI_KHONG | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=일반 부정] → declarative | Tôi + không + V (+O). | VI_PILOT_FAMILY_037 | DAY_7 | GRAMMAR_VI_KHONG | 상태 질문 + 사실 카드 [state=일반 부정] → one bounded Vietnamese reply | Tôi + không + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_CHUA | VI_PILOT_FAMILY_035 | GRAMMAR_VI_CHUA | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=현재까지 미완료] → declarative | Tôi + chưa + V (+O). | VI_PILOT_FAMILY_038 | DAY_7 | GRAMMAR_VI_CHUA | 상태 질문 + 사실 카드 [state=현재까지 미완료] → one bounded Vietnamese reply | Tôi + chưa + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_ROI | VI_PILOT_FAMILY_003 | GRAMMAR_VI_ROI | 메타언어 완료 사실 → declarative | S + V (+O) + rồi | VI_PILOT_FAMILY_039 | DAY_7 | GRAMMAR_VI_ROI | 상태 질문 + 사실 카드 [state=완료] → one bounded Vietnamese reply | Tôi + V (+O) + rồi. | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_DANG | VI_PILOT_FAMILY_034 | GRAMMAR_VI_DANG | 메타언어 상황 카드 [actor=나, action=<bounded action>, state=현재 진행] → 1개 Vietnamese declarative | Tôi + đang + V (+O). | VI_PILOT_FAMILY_040 | DAY_30 | GRAMMAR_VI_DANG | 구조 카드 [actor=나, action=<bounded action>, state=현재 진행] → one Vietnamese sentence | Tôi + đang + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_KHONG | VI_PILOT_FAMILY_002 | GRAMMAR_VI_KHONG | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=일반 부정] → declarative | Tôi + không + V (+O). | VI_PILOT_FAMILY_041 | DAY_30 | GRAMMAR_VI_KHONG | 구조 카드 [actor=나, action=<bounded action>, state=일반 부정] → one Vietnamese sentence | Tôi + không + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_CHUA | VI_PILOT_FAMILY_035 | GRAMMAR_VI_CHUA | 메타언어 상태 카드 [actor=나, action=<bounded action>, state=현재까지 미완료] → declarative | Tôi + chưa + V (+O). | VI_PILOT_FAMILY_042 | DAY_30 | GRAMMAR_VI_CHUA | 구조 카드 [actor=나, action=<bounded action>, state=현재까지 미완료] → one Vietnamese sentence | Tôi + chưa + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_ROI | VI_PILOT_FAMILY_003 | GRAMMAR_VI_ROI | 메타언어 완료 사실 → declarative | S + V (+O) + rồi | VI_PILOT_FAMILY_043 | DAY_30 | GRAMMAR_VI_ROI | 구조 카드 [actor=나, action=<bounded action>, state=완료] → one Vietnamese sentence | Tôi + V (+O) + rồi. | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_PHAI | VI_PILOT_FAMILY_044 | GRAMMAR_VI_PHAI | 의무 카드 [actor=나, action=<bounded action>, intent=필요/의무] → declarative | Tôi + phải + V (+O). | VI_PILOT_FAMILY_045 | DAY_7 | GRAMMAR_VI_PHAI | decision dialogue + fact card [required action=<bounded action>] → one declarative reply | Tôi + phải + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_PHAI | VI_PILOT_FAMILY_044 | GRAMMAR_VI_PHAI | 의무 카드 [actor=나, action=<bounded action>, intent=필요/의무] → declarative | Tôi + phải + V (+O). | VI_PILOT_FAMILY_046 | DAY_30 | GRAMMAR_VI_PHAI | future decision card [required action=<bounded action>] → one reply | Tôi + phải + V (+O). | target_node_ids set is the same, but the elicitation template differs materially from the source family; therefore the conjunctive family identity is not the same. |
| GRAMMAR_VI_HON | VI_PILOT_FAMILY_022 | GRAMMAR_VI_HON | two entities + property relation → sentence | A+Adj+hơn+B | VI_PILOT_FAMILY_048 | DAY_7 | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CON | 비교 카드 [two bounded animate entities + property relation] → full clause | Con + N1 + này + Adj + hơn + con + N2 + đó. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CON | VI_PILOT_FAMILY_047 | GRAMMAR_VI_CL_CON | 수량 카드 [quantity=hai, entity=<bounded animate noun>] → NP | hai + con + N | VI_PILOT_FAMILY_048 | DAY_7 | GRAMMAR_VI_HON, GRAMMAR_VI_CL_CON | 비교 카드 [two bounded animate entities + property relation] → full clause | Con + N1 + này + Adj + hơn + con + N2 + đó. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_NHAT | VI_PILOT_FAMILY_023 | GRAMMAR_VI_NHAT | ranked entity → sentence | A+Adj+nhất | VI_PILOT_FAMILY_049 | DAY_7 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | 순위 카드 [ranked bounded animate entity] → sentence | Con + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CON | VI_PILOT_FAMILY_047 | GRAMMAR_VI_CL_CON | 수량 카드 [quantity=hai, entity=<bounded animate noun>] → NP | hai + con + N | VI_PILOT_FAMILY_049 | DAY_7 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | 순위 카드 [ranked bounded animate entity] → sentence | Con + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_NHAT | VI_PILOT_FAMILY_023 | GRAMMAR_VI_NHAT | ranked entity → sentence | A+Adj+nhất | VI_PILOT_FAMILY_050 | DAY_30 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | rank-card transformation [bounded animate entity + winning property] → sentence | Con + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |
| GRAMMAR_VI_CL_CON | VI_PILOT_FAMILY_047 | GRAMMAR_VI_CL_CON | 수량 카드 [quantity=hai, entity=<bounded animate noun>] → NP | hai + con + N | VI_PILOT_FAMILY_050 | DAY_30 | GRAMMAR_VI_NHAT, GRAMMAR_VI_CL_CON | rank-card transformation [bounded animate entity + winning property] → sentence | Con + N + này + Adj + nhất. | target_node_ids set differs, so target construction identity differs; elicitation template also differs. |

Row count: **43**, matching the DAY_7 (16 nodes across 18 selected nodes' D7 side, some shared) and DAY_30 source/held-out path pairs implied by §8.1; no missing or extra pair (Architecture Readjudication §9.1).

Within any source family, different lexical surface items remain `SAME_ITEM_FAMILY`; they are not promoted to unseen transfer. `EXACT_REPEAT` and `SURFACE_VARIANT` retain higher priority than `SAME_ITEM_FAMILY`/`DIFFERENT_ITEM_FAMILY` whenever applicable.

## 10. Held-out family cardinality / preallocation invariant

### 10.1 Current v1 exact facts

- Held-out families: **32**
- Multi-item held-out families: **0**
- Every current held-out family contains exactly one item (§4, `source_or_heldout_status = HELDOUT_DAY7` or `HELDOUT_DAY30`).

### 10.2 CT-AITEM-02 prospective preallocation invariant

> If a future held-out family contains more than one assessment item, every assignment intended to retain primary `DIFFERENT_ITEM_FAMILY` eligibility must be created and immutable-snapshot-pinned before the learner's first learner-facing exposure to any item in that family. An assignment created after prior same-family exposure resolves to `SAME_ITEM_FAMILY`, subject to the higher-priority `EXACT_REPEAT` and `SURFACE_VARIANT` rules. Earlier assignment snapshots are not retroactively rewritten by later exposure.

This is a **prospective** rule. In this v1 inventory, no held-out family has more than one item, so no current family has an actual multi-item preallocation dependency. The rule remains mandatory for any future version of this manifest that introduces a multi-item held-out family.

### 10.3 Current single-item held-out families

| family_id | member item ID | designated timepoint | multi-item preallocation | first possible family exposure boundary | post-exposure new assignment rule |
|---|---|---|---|---|---|
| VI_PILOT_FAMILY_004 | VI_PILOT_ITEM_0016 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_005 | VI_PILOT_ITEM_0021 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_008 | VI_PILOT_ITEM_0032 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_009 | VI_PILOT_ITEM_0033 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_013 | VI_PILOT_ITEM_0046 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_014 | VI_PILOT_ITEM_0047 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_015 | VI_PILOT_ITEM_0048 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_016 | VI_PILOT_ITEM_0049 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_017 | VI_PILOT_ITEM_0050 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_019 | VI_PILOT_ITEM_0055 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_020 | VI_PILOT_ITEM_0056 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_021 | VI_PILOT_ITEM_0057 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_025 | VI_PILOT_ITEM_0071 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_026 | VI_PILOT_ITEM_0073 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_027 | VI_PILOT_ITEM_0075 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_028 | VI_PILOT_ITEM_0076 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_031 | VI_PILOT_ITEM_0084 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_032 | VI_PILOT_ITEM_0085 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_033 | VI_PILOT_ITEM_0086 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_036 | VI_PILOT_ITEM_0017 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_037 | VI_PILOT_ITEM_0018 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_038 | VI_PILOT_ITEM_0019 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_039 | VI_PILOT_ITEM_0020 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_040 | VI_PILOT_ITEM_0022 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_041 | VI_PILOT_ITEM_0023 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_042 | VI_PILOT_ITEM_0024 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_043 | VI_PILOT_ITEM_0025 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_045 | VI_PILOT_ITEM_0051 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_046 | VI_PILOT_ITEM_0058 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_048 | VI_PILOT_ITEM_0072 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_049 | VI_PILOT_ITEM_0074 | DAY_7 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |
| VI_PILOT_FAMILY_050 | VI_PILOT_ITEM_0077 | DAY_30 | NA — v1 family has one item | first learner-facing execution/display of the sole held-out assignment | A later newly-created same-family assignment after exposure would resolve to SAME_ITEM_FAMILY (subject to higher-priority EXACT_REPEAT/SURFACE_VARIANT). |

Row count: **32**, matching the exact held-out family count in §13.

## 11. Lexical linkage boundary

Per A-ITEM-03 (Architecture Adjudication §9, preserved by Architecture Readjudication §4):

- Every ITEM pins `LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT@1` (§5).
- Every linked lexical entry ID is inside `LEXICAL_ENTRY_VI_0001..0380`. No item requires an out-of-vocabulary (OOV) entry.
- `VI_PILOT_LEXICAL_MANIFEST.md` version 1 is **not modified** by this manifest and remains immutable.
- All lexical v1 `item_links=[]` values remain unchanged — this manifest does not add, infer, or imply any backlink inside `VI_PILOT_LEXICAL_MANIFEST.md`.
- Only **one-way `ITEM → LEXICAL_ENTRY_VI_*`** references are used; no bidirectional link symmetry is required.
- A lexical manifest v2 is **not** created or required for B-2 item recording.
- Grammatical marker surfaces are not added as general lexical links solely because they are target forms — e.g. the lexical verb `đi` (`LEXICAL_ENTRY_VI_0065`) is linked only where it functions lexically (item 0052 under `GRAMMAR_VI_SE`), and grammatical `GRAMMAR_VI_DI` target items (0081–0086) do not link it. Grammatical `CO_THE`/`CO_KHONG` `có` is not represented as lexical/existential `LEXICAL_ENTRY_VI_0005` in those target items.
- If a future lexical manifest publishes authoritative backlinks, it must do so as a new version (v2 or later) of `VI_PILOT_LEXICAL_MANIFEST.md`, never by editing v1 in place. This manifest does not create that future version.

## 12. Six lexical controls

Controls were computed from the revised (post-split) family/item inventory, not copied from the original 33-family labels (Architecture Readjudication §12.2). Each control guards against a specific confound; the per-family flags are in §12.1 below and the per-item flags are already recorded verbatim in each item's `control flags` cell in §5.

- **C1 — DI / lexical `đi` separation.** Grammatical sentence-final `GRAMMAR_VI_DI` and the lexical motion verb `đi` (`LEXICAL_ENTRY_VI_0065`) must not coexist in one empirical item, so a learner cannot infer the DI target from an unrelated lexical `đi` already present in the prompt/response. Applies to Scenario 6 (`VI_PILOT_SCN_06_DIRECTIVE_ACTION`) families/items built on `GRAMMAR_VI_DI` and `GRAMMAR_VI_HAY, GRAMMAR_VI_DI` (families 030, 031, 033; items 0081–0086); the one item where lexical `đi` legitimately appears (item 0052, family 018, `GRAMMAR_VI_SE`) is a different, non-DI target and is explicitly annotated as such rather than silently excluded.
- **C2 — DUOC_ABILITY passive-avoidance.** `GRAMMAR_VI_DUOC_ABILITY` items must retain an agentive, ability-only reading of postverbal `được` and avoid a passive-event interpretation (which belongs to the excluded `GRAMMAR_VI_DUOC_PASSIVE` node, `VI_EMPIRICAL_PILOT_SPEC.md` §3.2). Applies to families 011, 013, 016 and their member items (0037–0039, 0046, 0049), all annotated `special=agentive subject` or equivalent.
- **C3 — grammatical `có` / lexical-existential `có` separation.** `GRAMMAR_VI_CO_THE` and `GRAMMAR_VI_CO_KHONG` items must remain functionally distinguishable from each other and must not use lexical/existential `có` (`LEXICAL_ENTRY_VI_0005`) as their lexical link, since the grammatical `có` in these constructions is a function word, not the lexical-existential sense. Applies to families 007, 010, 013, 014, 015 and their member items.
- **C4 — classifier noun-class boundary.** `GRAMMAR_VI_CL_CAI` (inanimate) and `GRAMMAR_VI_CL_CON` (animate) must each draw from their own bounded noun-class pool (8 inanimate / 5 animate candidates per `VI_PILOT_LEXICAL_MANIFEST.md`), and package-level class balance is preserved after the CT-AITEM-01 family split. Applies to families 024, 025, 026, 028, 047, 048, 049, 050 and their member items.
- **C5 — HON/NHAT bounded adjective pool.** `GRAMMAR_VI_HON` and `GRAMMAR_VI_NHAT` reuse the same bounded comparison-adjective pool (`lớn`, `nhanh`, `đẹp`, `cao`, `nhỏ`), so comparative vs. superlative items are not distinguished by an uncontrolled adjective choice. Applies to families 022, 023, 025, 026, 027, 028, 048, 049, 050 and their member items.
- **C6 — temporal/completion marker non-leakage.** `GRAMMAR_VI_DA` / `GRAMMAR_VI_SE` / `GRAMMAR_VI_DANG` / `GRAMMAR_VI_ROI` / `GRAMMAR_VI_CHUA` prompts must not mechanically expose the Vietnamese target marker (i.e. the prompt states the intended temporal/completion meaning in meta-language, not the Vietnamese cue word itself). Applies to families 001, 003, 004, 005, 008, 018, 019, 020, 034, 035, 036, 038, 039, 040, 042, 043 and their member items.

`NA` in a control column means that control does not apply to that family/item's target node(s), not that the control was skipped.

### 12.1 Family-level control summary

| family_id | C1 | C2 | C3 | C4 | C5 | C6 |
|---|---|---|---|---|---|---|
| VI_PILOT_FAMILY_001 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_002 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_003 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_004 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_005 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_006 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_007 | NA | NA | PASS | NA | NA | NA |
| VI_PILOT_FAMILY_008 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_009 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_010 | NA | NA | PASS | NA | NA | NA |
| VI_PILOT_FAMILY_011 | NA | PASS | NA | NA | NA | NA |
| VI_PILOT_FAMILY_012 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_013 | NA | PASS | PASS | NA | NA | NA |
| VI_PILOT_FAMILY_014 | NA | NA | PASS | NA | NA | NA |
| VI_PILOT_FAMILY_015 | NA | NA | PASS | NA | NA | NA |
| VI_PILOT_FAMILY_016 | NA | PASS | NA | NA | NA | NA |
| VI_PILOT_FAMILY_017 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_018 | PASS | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_019 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_020 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_021 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_022 | NA | NA | NA | NA | PASS | NA |
| VI_PILOT_FAMILY_023 | NA | NA | NA | NA | PASS | NA |
| VI_PILOT_FAMILY_024 | NA | NA | NA | PASS | NA | NA |
| VI_PILOT_FAMILY_025 | NA | NA | NA | PASS | PASS | NA |
| VI_PILOT_FAMILY_026 | NA | NA | NA | PASS | PASS | NA |
| VI_PILOT_FAMILY_027 | NA | NA | NA | NA | PASS | NA |
| VI_PILOT_FAMILY_028 | NA | NA | NA | PASS | PASS | NA |
| VI_PILOT_FAMILY_029 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_030 | PASS | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_031 | PASS | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_032 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_033 | PASS | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_034 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_035 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_036 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_037 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_038 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_039 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_040 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_041 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_042 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_043 | NA | NA | NA | NA | NA | PASS |
| VI_PILOT_FAMILY_044 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_045 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_046 | NA | NA | NA | NA | NA | NA |
| VI_PILOT_FAMILY_047 | NA | NA | NA | PASS | NA | NA |
| VI_PILOT_FAMILY_048 | NA | NA | NA | PASS | PASS | NA |
| VI_PILOT_FAMILY_049 | NA | NA | NA | PASS | PASS | NA |
| VI_PILOT_FAMILY_050 | NA | NA | NA | PASS | PASS | NA |

Zero blocking control failures across all 50 families and all 86 items (Architecture Readjudication §12.2).

## 13. Exact counts / coverage / bounded inventory checks

- Exact family count: **50** — `VI_PILOT_FAMILY_001` .. `VI_PILOT_FAMILY_050`, unique and contiguous.
- Exact item count: **86** — `VI_PILOT_ITEM_0001` .. `VI_PILOT_ITEM_0086`, unique and contiguous.
- Source / DAY_7 / DAY_30 item counts: **54 / 16 / 16** (54 + 16 + 16 = 86).
- DAY_7 / DAY_30 target-node evaluation row counts: **24 / 19**.
- Held-out families: **32**. Multi-item held-out families: **0**.
- Exact six scenarios, no more and no fewer:
  - `VI_PILOT_SCN_01_EVENT_STATUS`
  - `VI_PILOT_SCN_02_CURRENT_ACTIVITY`
  - `VI_PILOT_SCN_03_CAPABILITY_DECISION`
  - `VI_PILOT_SCN_04_FUTURE_CONTINGENCY`
  - `VI_PILOT_SCN_05_COMPARE_SELECT`
  - `VI_PILOT_SCN_06_DIRECTIVE_ACTION`
- All 86 items: `stimulus_modality_components = [TEXT]`, `response_modality_components = [TEXT_ENTRY]`.
- Exact selected 18 Grammar Nodes (`VI_EMPIRICAL_PILOT_SPEC.md` §3.1), all represented as item targets: `GRAMMAR_VI_DA`, `GRAMMAR_VI_SE`, `GRAMMAR_VI_DANG`, `GRAMMAR_VI_ROI`, `GRAMMAR_VI_CO_THE`, `GRAMMAR_VI_DUOC_ABILITY`, `GRAMMAR_VI_MUON`, `GRAMMAR_VI_PHAI`, `GRAMMAR_VI_KHONG`, `GRAMMAR_VI_CHUA`, `GRAMMAR_VI_CO_KHONG`, `GRAMMAR_VI_WH_INSITU`, `GRAMMAR_VI_CL_CAI`, `GRAMMAR_VI_CL_CON`, `GRAMMAR_VI_HON`, `GRAMMAR_VI_NHAT`, `GRAMMAR_VI_HAY`, `GRAMMAR_VI_DI`.
- Exact excluded six nodes (`VI_EMPIRICAL_PILOT_SPEC.md` §3.2), **absent** from every item's `target_node_ids`: `GRAMMAR_VI_NEU_THI`, `GRAMMAR_VI_DUOC_PASSIVE`, `GRAMMAR_VI_BI`, `GRAMMAR_VI_A_POLITE`, `GRAMMAR_VI_NHE`, `GRAMMAR_VI_A_CONFIRM`.
- All 18 selected nodes have a nonzero SOURCE, DAY_7, and DAY_30 coverage path (§8.1, §9.2).
- Lexical manifest pin exact for all 86 items: `LEXICAL_MANIFEST_VI_EMPIRICAL_PILOT@1`.
- Rubric pin exact for all 50 families and all 86 items: `RUBRIC_VI_EMPIRICAL_PILOT_BINARY@1`.
- `approved_for_pilot = false` (§2).

## 14. Explicit lifecycle non-declarations

This document is a **Proposed — Architecture-approved B-2 item/item-family documentation candidate**. `approved_for_pilot = false`.

This document does **not** declare:

- B-2 COMPLETE (B-2 remains **UNRESOLVED / OPEN** at this writer stage)
- B-3 COMPLETE (B-3 remains **UNRESOLVED**)
- P1 eligible, P1 activated, or P1 started (P1 remains **NOT STARTED / NOT ACTIVATED / STILL NOT ELIGIBLE TO ACTIVATE**)
- human-data collection authorized (**NOT AUTHORIZED**)
- Pilot Spec Approved, or `approved_for_pilot=true`
- VI pilot efficacy verified, or any efficacy PASS claim
- AC-017 or AC-018 CLOSED or IMPLEMENTED
- VL3 §10 overall PASS
- actual-provider milestone complete
- Evidence Foundation overall complete
- Beta ready, or user app complete
- GitHub Actions PASS

### 14.1 Normal lifecycle (not advanced by this document)

This record is a writer candidate only. The normal subsequent lifecycle — not performed, claimed, or advanced by this document — is:

1. candidate validation (edit-only Read/Search/Grep review)
2. commit / push
3. a fresh milestone-final independent review
4. main integration
5. post-merge verification
6. review-record

This writer does not declare any of steps 3–6 complete.
