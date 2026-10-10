# VALIDATION_STATUS.md

# Validation Level 3 — Validation State Authority

This document is the **sole owner** of Validation State for the project. `BOOTSTRAP.md` and `PROJECT_MASTER_INDEX.md` do not duplicate validation figures — they point here.

---

## A. Current Validation Ledger

This ledger distinguishes the following identities. Git ref, runtime-validated implementation, independent review target, and review-record commit are separate authorities and are not merged into a single "current implementation SHA".

- **Ledger snapshot baseline**: `d41829f4d6f71d78cdbda80b96ee7af41e44a715` — the exact `origin/main` baseline (subject `Record Unseen v2 runtime lifecycle closure`) from which this three-file post-closure roadmap/status synchronization candidate is prepared; the prior ledger snapshot baseline `777f8d7dd94b9d6b5be574d6d83194688e5efaba` is superseded as current and preserved as history
- **GitHub main ref**: `GitHub refs/heads/main` (authority for current repository HEAD; no hard-coded SHA in this document replaces it)
- **Latest accepted integrated runtime-validation milestone**: `1de6dec26d9da3122c0d1335938af6edadf5883f` (`VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime`; `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`; review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`; evidence §A.18)
- **Prior accepted integrated runtime milestone, preserved**: `77db80d97f25c9394cd04ad08801d85580f006dd` (ITEM Lineage-Authority Writer Correction; post-merge validation PASS; lifecycle `CLOSED` by Control Tower adjudication; post-closure status sync `72a0a9731d9d3d877994bcc8ca4a7291969af18b`; evidence §A.17)
- **Prior accepted integrated runtime-validation milestone, preserved**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` (BIGINT writer source-authority runtime; independently reviewed, canonical on main, post-integration Windows-local PostgreSQL 17.10 verified, validated, review-recorded, and closed; evidence §A.13–§A.16)
- **Prior accepted integrated runtime-validation milestone, preserved**: `22508147625090af84af141ac0ec574792369115` (METRIC_RESULT / Retention v1 runtime; independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed; evidence §A.2)
- **BIGINT writer source-authority runtime — reviewed candidate**: `303e1af9aa2c32167e7caf66527b5020bbacf882`, parent `2034d1a01e58a36762750156df1fd63c8e77ba9c`, branch `validation/bigint-writer-source-authority-runtime-20260912` (prior candidate Independent Validation PASS, §A.12; Independent Review APPROVE WITH NON-BLOCKING NOTES, §A.13)
- **BIGINT writer source-authority runtime — main integration / post-integration validated SHA**: `8934ccee7931b79ddc544af08dceffc97a0d7b32` (main integration, §A.14; fresh post-integration Validation PASS, §A.15; REVIEW-RECORDED / CLOSED, §A.16)
- **Current runtime implementation review-record commit**: `4b86a440544a40e9195d6a6437f9f2256a92e9e3` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.80`, blob `02648bb9c672a3629d626a0da81da004eb935994`; METRIC_RESULT Unseen Transfer v2 Runtime implementation lifecycle)
- **Prior runtime implementation review-record commit, preserved**: `777f8d7dd94b9d6b5be574d6d83194688e5efaba` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78`, blob `5a9f2e43527a72355b99838cd37a820c376af6c1`; BIGINT writer source-authority Runtime implementation lifecycle)
- **Prior documentation review-record commit, preserved**: `623eaf94328a5145adf62aaff52c6b23689d4efe` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77`; BIGINT Tier C documentation lifecycle, not the runtime candidate review)

### A.1 Validation Level State

- **Validation Level 3 §9 Conversation Boundary: PASS.** The full evidence chain and acceptance-criteria reconciliation supporting this PASS are preserved unchanged in §B.1 (historical detail; not superseded).
- **Validation Level 3 §10 overall: NOT DECLARED.**

Code/artifact presence is a separate claim from validation PASS. The two are not conflated.

### A.2 Prior Accepted Integrated Runtime Validation — METRIC_RESULT / Retention v1 (preserved)

This entry was the latest accepted integrated runtime validation until the BIGINT writer source-authority runtime lifecycle (§A.13–§A.16) was review-recorded and closed; its figures below are preserved unchanged.

**Runtime main integration**: `22508147625090af84af141ac0ec574792369115`

**Environment**:

- Windows-local
- PostgreSQL 17.10
- Node.js 24.18.0 / npm 11.16.0
- isolated database `lle_pm_metric_result_retention_20260911095529`; `lle_dev` was not targeted

**Evidence database**:

- migrations 001–013: 13 applied / 0 skipped
- migration 014: absent

**Focused test result**:

- METRIC_RESULT + RAW_SOURCE: tests 182, suites 2, pass 182, fail 0, cancelled 0, skipped 0, todo 0
- Evidence/Foundation + Runtime set: tests 326, suites 9, pass 326, fail 0, cancelled 0, skipped 0, todo 0

**Full test result**:

- tests 556, suites 56, pass 556, fail 0, cancelled 0, skipped 0, todo 0

This is post-merge Validation evidence for the exact integrated runtime SHA, distinct from Development evidence and Independent Review evidence. The lifecycle was subsequently review-recorded by `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.75`) and closed by `c4e452d762d70fa57db61856b37b04a16d43df92`. It does not declare Evidence Foundation overall complete, P1 activated, human-data collection authorized, or efficacy verified.

### A.3 Prior Evidence Foundation P0 Independent Review Evidence (preserved)

- **Reviewed commit**: `30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`
- **Verdict**: APPROVE WITH NON-BLOCKING NOTES
- **Severity**: BLOCKER 0 / HIGH 0 / MEDIUM 0 / LOW 1 / NOTE 3
- **Preserved finding**: F-L01 — non-blocking

### A.4 GitHub-Hosted Evidence

- Combined commit status: absent
- Current HEAD workflow run: absent
- Permanent `.github/workflows`: absent

This absence reflects that main does not retain a permanent CI workflow. It is separate from, and does not diminish, the Windows-local runtime validation recorded in §A.2. Absence of GitHub Actions evidence is not classified as a runtime failure.

### A.5 Explicit Non-Declarations

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
- any of `F-BIGINT-IR-01` through `F-BIGINT-IR-06` closed or reclassified
- BIGINT historical-data inspection or remediation performed, or declared unnecessary
- project-wide closure
- B-3 resolved
- Pilot Spec approved, or any manifest `approved_for_pilot=true`
- Actual-provider validation established
- any of `F-IR-01`–`F-IR-04`, `N-IR-S1`, `IR-NB-01`–`IR-NB-03`, `IR-SS-01`–`IR-SS-05`, or `IR-RR-01`–`IR-RR-02` closed or reclassified
- historical stored `resolved_item_lineage` learner/human data inspected, or declared valid/invalid or in need of migration/repair/backfill
- GitHub Actions / CI PASS for the ITEM writer or Unseen Transfer v2 Runtime lifecycles
- any test or PostgreSQL evidence generated by this documentation-only status/roadmap synchronization

The ITEM Lineage-Authority Writer Correction lifecycle is `CLOSED` (§A.17), and the `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation lifecycle is `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (§A.18), bounded to that lifecycle only.

Accordingly: the BIGINT writer source-authority runtime is independently reviewed (APPROVE WITH NON-BLOCKING NOTES, §A.13), integrated on main as `8934ccee7931b79ddc544af08dceffc97a0d7b32` (§A.14), freshly post-integration validated (PASS, §A.15), review-recorded in backlog revision `1.78` (`777f8d7dd94b9d6b5be574d6d83194688e5efaba`), and its bounded lifecycle is CLOSED (§A.16). `F-R02` is CLOSED — CORRECTED within its cited ordinal domain; `F-BIGINT-IR-01` through `F-BIGINT-IR-06` remain NOTE / OPEN / NON-BLOCKING; historical data remains UNKNOWN / NOT INSPECTED. Evidence Foundation overall remains incomplete; Validation Level 3 §10 overall PASS remains NOT DECLARED; P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; efficacy remains NOT VERIFIED; the actual-provider milestone remains incomplete; product/Beta readiness is not established.

### A.6 B-5/B-4 Governance Documentation Review (no new runtime evidence)

- **Candidate commits**: `d75b518c01724059b45f6adc1a93b602c86a69c4` (B-5), `542c6b5004bbffed570aefcb1a3a858655206bb7` (B-4)
- **Main integration**: `37eb97a295df10bfd4d48ab06e13be20c85c3beb`, `4305eb4a3ccf294f9f35efb4a3ef1574e9c8e143`
- **Review-record candidate/main**: `ca31ff6486a22780aa7aedf44c3c00b8aefb26b2` / `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`
- **Verdict**: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 2 (G-N01, G-N02); ELIGIBLE
- This is a documentation-only governance review, distinct from the §A.3 entry for `30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`. It adds, changes, or supersedes no runtime test evidence. At the time of this B-5/B-4 review, `Last runtime-validated implementation` was `593b5a4a11fb394a3db6b47a56e2d7b6ceccda0e` with §A.2 focused (64/64) and full (324/324) test results; that pointer has since been superseded by the B-1 chain in §A.7 below, and this entry's figures are preserved unchanged as the historical record of what was true when this B-5/B-4 review was recorded.

### A.7 B-1 Evidence Chain (current)

B-1 (assignment/session lifecycle writer) is recorded **COMPLETE** as a bounded VI Empirical Pilot P1 implementation prerequisite. This does not declare Evidence Foundation overall complete, B-2 complete, B-3 complete, or VI Empirical Pilot P1 activated.

**B-1a — evidence session lifecycle writer** (`startSession` / `terminalizeSession` / `restartSession`)

- Main implementation: `d785abfc74a669cbc472ff24df9869874a165ecb`
- Review-record main: `08c6e0ca1c771398ae89f1d467e2bef4386eece3`
- Post-merge runtime: Windows PowerShell / PostgreSQL 17.10, evidence tables 16, highest migration 012, migration 013 absent, migration regression 0 applied / 12 skipped, focused 74/74 PASS, full 334/334 PASS
- Independent review verdict: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 3; ELIGIBLE

**B-1b — SCORABLE assignment completion writer**

- Runtime candidate: `62567510bb4b8211c457dbfedff5caae8002a65d`
- Runtime main: `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`
- Runtime review-record main: `ad0f892f6a4238eeb6ecf2581d21deaf82b87956`
- Runtime independent review verdict: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM 0, LOW 1, NOTE 1; ELIGIBLE. F1 (non-blocking test-hardening follow-up) remains unresolved.
- Post-merge runtime: Windows PowerShell / PostgreSQL 17.10, database `lle_dev`, evidence tables 16, highest migration 012, migration 013 absent, migration regression 0 applied / 12 skipped, focused 78/78 PASS, full 338/338 PASS, 52 suites, fail/cancelled/skipped/todo 0
- Canonical status-sync candidate: `74bce252a62c0163f07c1156c60263d2b45104f4`
- Canonical status-sync main: `3fb3f0c8d325336310e1c1d82fa75458e7670f79`
- Canonical status-sync review-record main: `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964` (`ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.46)
- Canonical status-sync independent review verdict: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 1; ELIGIBLE. F2 CLOSED.
- The canonical status-sync integration is documentation-only; it did not rerun PostgreSQL/npm. The runtime evidence above was established by the prior runtime-implementation session and is not re-claimed as re-executed by the status-sync session.

**Remaining after B-1 completion**: B-2 (VI pilot content manifest / exact 12–20 grammar-node inclusion set) and B-3 (human-data/privacy owner decision) remain unresolved. VI Empirical Pilot P1 is NOT STARTED / NOT ACTIVATED / STILL NOT ELIGIBLE TO ACTIVATE.

### A.8 B-2 Evidence Chain (current)

B-2 (VI pilot content manifest) is recorded **COMPLETE** as a bounded VI Empirical Pilot P1 implementation/data prerequisite. This does not declare Evidence Foundation overall complete, B-3 complete, or VI Empirical Pilot P1 activated.

**B-2 component 1 — exact 18-node inclusion/exclusion manifest + exact six pilot-scenario manifest**

- Candidate: `2fd0ba96db23fd34839f59e74c6cacb555124278`
- Main integration: `b955facad49fa1daf217b88f93174682ef04eb1b`
- Review-record: `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.48
- Independent review verdict: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM 0, LOW 1, NOTE 1; ELIGIBLE
- Documentation-only; runtime tests were not executed for this component

**B-2 component 2 — exact versioned lexical manifest + source/provenance/license verification**

- Candidate: `52ddcf10b6cd8a5bdf4c88965c32b46d01fb54ec`
- Main integration: `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`
- Review-record: `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.49
- Independent review verdict: APPROVE WITH NON-BLOCKING NOTES; BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 3; ELIGIBLE
- 380 lexical entries (300 word + 80 multiword); 5/5 required source artifact SHA-256 independently recomputed and verified; documentation-only; runtime tests were not executed for this component

**B-2 component 3 — exact item/item-family manifest**

- Candidate: `4fa3e1a4569e908446dc867d637fd9edd47caa0e`
- Main integration: `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`
- Review-record: `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.50
- Independent review verdict: APPROVE; BLOCKER/HIGH/MEDIUM/LOW/NOTE all 0
- 50 item families / 86 items, source/DAY_7/DAY_30 = 54/16/16, evaluation rows 24/19, held-out families 32 (multi-item held-out 0)
- Post-merge runtime: Windows PowerShell, PostgreSQL 17.10, database `lle_dev`, Node `pg` authentication PASS, `npm.cmd test` 338/338 PASS, fail/cancelled/skipped/todo all 0 (~12.9s) — this is the most recent actual runtime evidence for the B-2 component layer

**B-2 completion reconciliation (this record)**

- Cross-document consistency across `VI_EMPIRICAL_PILOT_SPEC.md`, `VI_PILOT_ITEM_FAMILY_MANIFEST.md`, and `VI_PILOT_LEXICAL_MANIFEST.md` was confirmed by a prior read-only Control Tower inspection; this reconciliation cites that confirmation as supplied evidence and does not re-derive it.
- This reconciliation is documentation-only. It did not rerun PostgreSQL/npm. The runtime evidence above (338/338 PASS) was established by the prior B-2 component-3 session and is not re-claimed as re-executed by this reconciliation. GitHub Actions PASS is not separately established and is not declared.
- B-2: **COMPLETE** as a bounded VI Empirical Pilot P1 implementation/data prerequisite.

**Remaining after B-2 completion**: B-3 (human-data/privacy owner decision) remains unresolved. VI Empirical Pilot P1 is NOT STARTED / NOT ACTIVATED / STILL NOT ELIGIBLE TO ACTIVATE. Pilot Spec document status remains Proposed; all four B-2 manifests remain `approved_for_pilot=false`.

### A.9 Runtime Foundation B1 RAW_SOURCE Lifecycle (accepted later evidence)

- Runtime main integration: `6bb2bccd5abef2d10839706ffdd000285b59512d` (following replay main commit `f3f7fc1fb2d1128a18be0a239ff8eb9f623bdeba`)
- Independent Review: APPROVE WITH NON-BLOCKING NOTES
- Post-merge Validation: Windows-local PostgreSQL 17.10 on an isolated database; migrations 001–013 applied, migration 014 absent; RAW_SOURCE suite 56/56 PASS; focused Evidence/Foundation + Runtime set 200/200 PASS across 8 suites; full regression 430/430 PASS across 55 suites; fail/cancelled/skipped/todo all 0
- Review-record: `c224ff9cca5b28f96febca0e11a89608ef746a1d`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.73`
- Closure sync: `bd64555ad30e5901467095e1d81002de433a02f8`
- Final bounded lifecycle: INDEPENDENTLY REVIEWED / CANONICAL IMPLEMENTATION ON MAIN / POST-MERGE POSTGRESQL VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED

This accepted lifecycle is distinct from the older B-1a/B-1b assignment/session lifecycle evidence in §A.7. It does not declare Evidence Foundation overall complete, P1 activated, human-data collection authorized, or efficacy verified.

### A.10 METRIC_RESULT / Retention v1 Lifecycle (accepted later evidence)

- Tier C canonical documentation: API `1.29` / Schema `1.8`, review-recorded in `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.74`
- Runtime main integration: `22508147625090af84af141ac0ec574792369115`
- Independent Review: APPROVE WITH NON-BLOCKING NOTES
- Post-merge Validation: PASS, with exact figures owned by §A.2
- Runtime review-record: `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.75`
- Closure: `c4e452d762d70fa57db61856b37b04a16d43df92`
- Final bounded lifecycle: INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED

Later canonical revisions preserve Retention v1: API `1.31` and Schema `1.10`. METRIC_RESULT / Unseen Transfer v2 Tier C documentation is separately review-recorded and closed, but its runtime remains NOT AUTHORIZED / NOT IMPLEMENTED / NOT VALIDATED.

> **Supersession pointer (added by the post-closure roadmap/status synchronization; the sentence above is preserved as time-scoped history):** the statement that the Unseen Transfer v2 runtime remained NOT AUTHORIZED / NOT IMPLEMENTED / NOT VALIDATED was accurate when this Retention v1 entry was recorded. It is superseded as current status. The `VI P1 Measurement Readiness — METRIC_RESULT Unseen Transfer v2 Runtime` implementation lifecycle is now `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED` (runtime `1de6dec26d9da3122c0d1335938af6edadf5883f`; review-record `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, Backlog revision `1.80`; closure `d41829f4d6f71d78cdbda80b96ee7af41e44a715`). See §A.18.

### A.11 Current Canonical Validation Context

- `API_CONTRACT.md`: revision `1.31`, blob `e60afa6bda3356051c24b36a823fb325761b9b42`
- `EVIDENCE_FOUNDATION_P0_SCHEMA.md`: revision `1.10`, blob `de244476e56dfcab59dcd899a25091a2b1452e31`
- `ARCHITECTURE_CLARIFICATION_BACKLOG.md`: revision `1.80`, blob `02648bb9c672a3629d626a0da81da004eb935994` (prior snapshot context: revision `1.78`, blob `5a9f2e43527a72355b99838cd37a820c376af6c1`)

These identities provide validation context only. This synchronization changes no canonical contract, Architecture, Schema, or Validation Rule.

### A.12 BIGINT Writer Source-Authority Runtime Candidate — Prior Independent Validation

- Branch: `validation/bigint-writer-source-authority-runtime-20260912`
- Candidate: `303e1af9aa2c32167e7caf66527b5020bbacf882`
- Parent: `2034d1a01e58a36762750156df1fd63c8e77ba9c`
- Candidate tree: `34bed66b82f21afe5fc5e53184f6a4f8357a5146`
- Candidate classification: IMPLEMENTATION CANDIDATE PREPARED
- Validation classification: PRIOR INDEPENDENT VALIDATION EVIDENCE — not Development evidence, not evidence generated in this status-sync session, and not Independent Review evidence
- `tests/evidenceFoundationRepository.test.js`: 80 pass / 0 fail / 0 skipped / 0 cancelled / 0 todo
- `tests/viP1ItemLineageRuntime.test.js`: 27 pass / 0 fail / 0 skipped / 0 cancelled / 0 todo
- Full regression: 559 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo
- Independent Validation verdict: PASS

Candidate status at the time this prior-validation entry was recorded (time-scoped; preserved verbatim; superseded as current status by §A.13–§A.16):

- Independent Review: NOT YET PERFORMED
- Main integration: NOT PERFORMED / NOT INTEGRATED
- Post-integration verification: NOT PERFORMED
- Lifecycle closure: NOT CLOSED

No PostgreSQL, focused Node test, npm test, runtime validation, migration, or database mutation was executed for this three-file status synchronization. The figures above were generated by the prior independent Validation session and recorded on main by `4d5776e9a7465716e036dd58f7b550469e9b98f7`.

This §A.12 entry remains prior candidate Independent Validation evidence for exact candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` (database `lle_bigint_writer_validation_20260914`). It is distinct from, and is not merged with, the Independent Review (§A.13), the main integration (§A.14), and the fresh post-integration Validation of exact main `8934ccee7931b79ddc544af08dceffc97a0d7b32` (§A.15).

### A.13 BIGINT Writer Source-Authority Runtime — Independent Review

- Review target: exact candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` against parent `2034d1a01e58a36762750156df1fd63c8e77ba9c`, branch `validation/bigint-writer-source-authority-runtime-20260912`
- Reviewer: Opus 5 / High (user-approved substitution for this bounded review: Fable 5 / High → Opus 5 / High)
- Final verdict: APPROVE WITH NON-BLOCKING NOTES
- Integration eligibility: ELIGIBLE
- Repository mutation during review: 0
- Tests/runtime/database execution during review: NONE
- `git fetch` during review: NO
- Existing findings preserved: `F-R02` OPEN / NON-BLOCKING; `F-BIGINT-IR-01`, `F-BIGINT-IR-02`, `F-BIGINT-IR-03` NOTE / OPEN / NON-BLOCKING
- New findings (each NOTE / OPEN / NON-BLOCKING; correction required before integration: NO):
  - `F-BIGINT-IR-04` — no direct negative grammar tests for malformed BIGINT strings / `Number` input
  - `F-BIGINT-IR-05` — one `T27` comment/digest-inequality step is weak/inaccurate, while the strong unsafe-range proof exists in the repository-focused regression
  - `F-BIGINT-IR-06` — `D3` return representation relies on default `pg` int8→string parsing, but the guard/test path fails closed if that assumption changes

Classification: Independent Review evidence. It generated no test, runtime, or database evidence and is not Validation evidence.

### A.14 BIGINT Writer Source-Authority Runtime — Main Integration

- Approval: main integration explicitly approved by the user
- Method: one guarded ordinary cherry-pick of the reviewed candidate onto then-current main
- Pre-integration main: `a72c4a73ca711fd4fb191f43028d855ecd64e2b3`
- Main integration commit: `8934ccee7931b79ddc544af08dceffc97a0d7b32`
- Integration tree: `aa1141e0b27e4c7f24720ffa70e2ebfcb7064a00`
- Integration parent: `a72c4a73ca711fd4fb191f43028d855ecd64e2b3`
- Subject: `Implement BIGINT writer source-authority correction`
- Conflict: NO
- Force push: NO
- Integrated scope: exactly the reviewed four files, no fifth path — `src/instrumentation/evidenceNormalization.js` (`948f7625275a717b8c4484f9daf2a22e6b080c45`), `src/instrumentation/evidenceRepository.js` (`412385ce62b675cf55ce04bc795f0206f667ff78`), `tests/evidenceFoundationRepository.test.js` (`16259b12b60b148f5c45afd26ef5a07b86497e97`), `tests/viP1ItemLineageRuntime.test.js` (`5f7297422eabcce3f9ca7f40547124d046b49c04`)
- The validation branch `validation/bigint-writer-source-authority-runtime-20260912` remains at `303e1af9aa2c32167e7caf66527b5020bbacf882`

Classification: integration record. It generated no Validation evidence.

### A.15 BIGINT Writer Source-Authority Runtime — Fresh Post-Integration Validation

- Final verdict: POST-INTEGRATION VALIDATION PASS
- Validated exact main: `8934ccee7931b79ddc544af08dceffc97a0d7b32`
- Environment: Windows local; PostgreSQL 17.10; Node v24.18.0; npm 11.16.0
- Fresh disposable database: `lle_bigint_postint_validation_20260915`
- Database routing proof: `psql` `current_database()` = `lle_bigint_postint_validation_20260915`; Node repository pool `current_database()` = `lle_bigint_postint_validation_20260915`
- `node --test --test-concurrency=1 tests/evidenceFoundationRepository.test.js`: 80 pass / 0 fail / 0 skip / 0 cancelled / 0 todo, exit 0
- `node --test --test-concurrency=1 tests/viP1ItemLineageRuntime.test.js`: 27 pass / 0 fail / 0 skip / 0 cancelled / 0 todo, exit 0
- Full regression `npm test`: 56 suites, 559 pass / 0 fail / 0 skip / 0 cancelled / 0 todo, exit 0
- Unsafe BIGINT `T27`: freshly exercised, PASS
- Cleanup: active connections to the disposable database before drop 0; `DROP DATABASE` PASS / exit 0; post-drop existence count 0; post-drop database list vs. pre-create snapshot `list_diff = 0`. No other application/evidence database was used or modified. Maintenance commands connected only to `postgres` for database creation, drop, and catalog checks. `lle_dev` was NOT used.
- Repository mutation / commits / pushes during validation: 0 / 0 / 0
- Final repository state: clean; local main = `origin/main` = `8934ccee7931b79ddc544af08dceffc97a0d7b32`; ahead/behind 0/0

Classification: post-integration Validation evidence for the exact integrated main SHA. It is distinct from the prior candidate Independent Validation of `303e1af9aa2c32167e7caf66527b5020bbacf882` (§A.12), from the Independent Review (§A.13), and from the main integration (§A.14). It was generated by the prior post-integration Validation session and is not evidence generated by this status synchronization.

### A.16 BIGINT Writer Source-Authority Runtime — Current Lifecycle and Finding State

- Current bounded lifecycle: INDEPENDENTLY REVIEWED — APPROVE WITH NON-BLOCKING NOTES / CANONICAL IMPLEMENTATION ON MAIN / POST-INTEGRATION WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED
- Review-record: `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.78`, commit `777f8d7dd94b9d6b5be574d6d83194688e5efaba` (parent `f2fe16374a880d80eb122bdcfbd95a013c44b2c2`, tree `571d17e92e6837aad4cd8d3dc142ef34b6a194da`, backlog blob `5a9f2e43527a72355b99838cd37a820c376af6c1`), integrated to main by fast-forward. The review-record candidate was independently reviewed by a fresh read-only reviewer: APPROVE WITH NON-BLOCKING NOTES, ELIGIBLE, repository mutation 0; reviewer notes F-BIGINT-RR-01 (Schema `1.10` §5.9 present-tense "F-R02 remains OPEN" wording, scoped to that clarification, becomes stale), F-BIGINT-RR-02 (two process details in the row not separately recorded in the repository), F-BIGINT-RR-03 (revision `1.75` precedent paraphrase), each NOTE / OPEN / NON-BLOCKING.
- Closure: declared by this documentation-only closure synchronization after fresh verification of the review-record commit, blob, and revision `1.78` on main.
- `F-R02`: CLOSED — CORRECTED / INDEPENDENTLY REVIEWED / INTEGRATED / POST-INTEGRATION VALIDATED (backlog revision `1.78`), bounded to its cited `exposure_ordinal` / `exposure_history_cutoff_ordinal` domain. This closure makes no claim about historical rows (historical data remains UNKNOWN / NOT INSPECTED) and no claim about `Number` conversions outside that cited scope.
- `F-BIGINT-IR-01`: NOTE / OPEN / NON-BLOCKING
- `F-BIGINT-IR-02`: NOTE / OPEN / NON-BLOCKING
- `F-BIGINT-IR-03`: NOTE / OPEN / NON-BLOCKING
- `F-BIGINT-IR-04`: NOTE / OPEN / NON-BLOCKING
- `F-BIGINT-IR-05`: NOTE / OPEN / NON-BLOCKING
- `F-BIGINT-IR-06`: NOTE / OPEN / NON-BLOCKING

No PostgreSQL, focused Node test, `npm test`, runtime validation, migration, or database operation was executed for this four-file closure synchronization. The §A.15 figures were generated by the prior post-integration Validation session and are recorded here as-is.

### A.17 ITEM Lineage-Authority Writer Correction — Evidence Chain (prior evidence; not regenerated)

All figures in this section are prior, commit-pinned evidence already recorded in `LLE_CURRENT_STATE.md`. They were generated by earlier Validation/Integration sessions. This documentation-only synchronization did not rerun, regenerate, or relabel them.

- Runtime candidate: `b862bcc48a150206c6fb8eece898ab2b95ace7f3` (parent `2e43c13dbf88f424706447c44ede31c7b7f1e036`, tree `0b98e89cc52fe361d055fba181a4022fa2dd2671`), branch `validation/item-lineage-authority-writer-correction-20260919`; exactly two files: `src/instrumentation/evidenceRepository.js` (`5355c7264fa85fe6c1d963d8c8c9ed79d6b45922`), `tests/viP1ItemLineageRuntime.test.js` (`fcb580da7203598f570c6599edaa6bfba14e8055`); migration/DDL `NONE`
- Pre-integration commit-pinned validation of that exact candidate: `tests/viP1ItemLineageRuntime.test.js` 44/44 PASS; `tests/evidenceFoundationRepository.test.js` 80/80 PASS; `tests/evidenceFoundationMigration.test.js` 24/24 PASS; `tests/migrations.test.js` 14/14 PASS; full `npm test` 576/576 PASS across 56 suites; actual PostgreSQL 17.10, disposable `lle_dev`, synthetic fixtures only; unsafe BIGINT `T27` PASS; lineage `T28`–`T44` PASS
- Independent Review of the exact candidate: APPROVE WITH NON-BLOCKING NOTES; blocking 0; non-blocking 4 (`F-IR-01`–`F-IR-04`); correction required NO; guarded integration suitable YES
- Guarded integration: main `77db80d97f25c9394cd04ad08801d85580f006dd` (parent `2e43c13dbf88f424706447c44ede31c7b7f1e036`); integration tree byte-identical to the reviewed candidate tree `0b98e89cc52fe361d055fba181a4022fa2dd2671`
- Post-merge validation on actual main `77db80d97f25c9394cd04ad08801d85580f006dd`: the same gate figures as above (44/44, 80/80, 24/24, 14/14, full 576/576 across 56 suites), all exit codes 0; actual PostgreSQL 17.10, disposable `lle_dev`, synthetic fixtures only; `T27` PASS; `T28`–`T44` PASS
- Closure-record sync: candidate `6eb670cee319f5a273f09118b850aea223db7595` independently reviewed (APPROVE WITH NON-BLOCKING NOTES; blocking 0; non-blocking 1, `N-IR-S1`) and integrated byte-identically as main `7ef696879e60956bfab649af74f5b8bbc05453c6`. Post-merge documentation/Git validation on that main: PASS. Runtime tests and PostgreSQL for that documentation integration: NOT RUN — DOCUMENTATION-ONLY STATUS-RECORD INTEGRATION
- Control Tower closure adjudication: lifecycle `CLOSED`. Recorded by post-closure status sync main `72a0a9731d9d3d877994bcc8ca4a7291969af18b`
- Backlog review-record revision: none recorded for this lifecycle
- Findings: `F-IR-01`, `F-IR-02`, `F-IR-03`, `F-IR-04`, `N-IR-S1` each OPEN / NOTE / NON-BLOCKING; correction required NO
- Historical stored `resolved_item_lineage` learner/human data: UNKNOWN / NOT INSPECTED

Runtime-engine evidence is not learning-efficacy evidence.

### A.18 METRIC_RESULT Unseen Transfer v2 Runtime — Evidence Chain (prior evidence; not regenerated)

All figures in this section are prior, commit-pinned evidence already recorded in `LLE_CURRENT_STATE.md`. This documentation-only synchronization did not rerun, regenerate, or relabel them.

- Readiness: Control Tower adjudicated `Q26` = NO OPERATIVE CANONICAL AMBIGUITY and `Q27` = `READY`, and recorded bounded Development authorization (main `2a94396627f95b7d138e7285a64411684b0b3e3e`). `Q28`/`Q29`: BLOCKED FOR Q28/Q29 WORDING
- Approved Development candidate: `407460cea917d789dab16ad2ef57c4cce87215cf`
- Runtime implementation on main: `1de6dec26d9da3122c0d1335938af6edadf5883f` (parent `2a94396627f95b7d138e7285a64411684b0b3e3e`, tree `eff25c34594baf4c5b94ebdb72e885a7ab2cdddd`). It is a cherry-pick of the approved candidate. Its changed-file set is exactly two files: `src/instrumentation/evidenceMetrics.js` (`0de535c3ec4868e2e89e04a8539cc20a336bdfa5`) and `tests/viP1MetricResultRuntime.test.js` (`a709ef0e8498cc70631038b0bfd442c24bff46fa`). Migration/DDL: `NONE`. Migration `014` is absent; the migration set ends at `db/migrations/013_add_vi_p1_item_lineage.sql`
- Independent Review: APPROVE WITH NON-BLOCKING NOTES; blocking 0; non-blocking 3 (`IR-NB-01`–`IR-NB-03`, no canonical lifecycle classification asserted); correction required NO. The review was static only and taken before integration
- Pre-integration independent validation of the exact approved candidate, synthetic fixtures only: `tests/viP1MetricResultRuntime.test.js` 190/190 PASS; `tests/viP1ItemLineageRuntime.test.js` 44/44 PASS; `tests/viP1RawSourceRuntime.test.js` 56/56 PASS; `tests/evidenceFoundationRepository.test.js` 80/80 PASS; `tests/evidenceFoundationMigration.test.js` 24/24 PASS; `tests/migrations.test.js` 14/14 PASS; full `npm test` 640/640 PASS, 56 suites, 0 fail; actual PostgreSQL synthetic Unseen v2 subset 64/64 PASS; PostgreSQL 17.10
- Post-merge validation on exact main `1de6dec26d9da3122c0d1335938af6edadf5883f`, synthetic fixtures only:
  - Full `npm test`: 640/640 PASS, 56 suites
  - Focused METRIC_RESULT: 190/190 PASS
  - Actual PostgreSQL synthetic Unseen v2 subset: 64/64 PASS
  - PostgreSQL version: `PostgreSQL 17.10 on x86_64-windows, 64-bit`
  - Corrected final verification: migration 013 present and migration 014 absent, both by exact whole-line match
  - Final `HEAD` == `origin/main` == `1de6dec26d9da3122c0d1335938af6edadf5883f`
  - Repository: clean
- Validation-harness incident (preserved; see `LLE_CURRENT_STATE.md`):
  - The first harness invocation exited nonzero. Its failure text was not preserved, so it is not classified.
  - A later captured run exited at an unsound migration-guard pathspec. That exit is classified as a validation-harness defect, not a demonstrated product-code failure.
- Post-merge status sync: candidate `0a0612c9504d26eb11808de2e04784d9eaf87323`, integrated as main `0696de9825b1cd0430aac12058196fd41c296cdb`. Its Independent Review was APPROVE WITH NON-BLOCKING NOTES, with non-blocking findings `IR-SS-01`–`IR-SS-05`
- Review-record: Backlog revision `1.80`, main `4b86a440544a40e9195d6a6437f9f2256a92e9e3`, backlog blob `02648bb9c672a3629d626a0da81da004eb935994`. It came from reviewed candidate `c793bf5a04c0937414d385e70c35994462f13bbb`. Its Independent Review was APPROVE WITH NON-BLOCKING NOTES, with `IR-RR-01` = NOTE / TRACEABILITY LIMIT / NON-BLOCKING and `IR-RR-02` = NOTE / OUT-OF-SCOPE OBSERVATION / PRE-EXISTING / NON-BLOCKING
- Closure: main `d41829f4d6f71d78cdbda80b96ee7af41e44a715`
- Current bounded lifecycle: `INDEPENDENT REVIEW PASSED / CANONICAL ON MAIN / POST-MERGE WINDOWS-LOCAL POSTGRESQL 17.10 VERIFIED / VALIDATED / REVIEW-RECORDED / CLOSED`
- Review-record and closure integrations: tests and PostgreSQL NOT RUN (documentation-only). No `NOT RUN` state is converted into PASS

The `CLOSED` above applies strictly to the bounded Unseen Transfer v2 Runtime implementation lifecycle. It is not project-wide closure. Runtime-engine validation is not learning-efficacy evidence. Learning efficacy: NOT VERIFIED. P1: NOT ACTIVATED. Human-data collection: NOT AUTHORIZED. Actual-provider validation: NOT ESTABLISHED; Mock evidence is not Actual-provider evidence. No human, learner, or production data was used. GitHub Actions / CI PASS is not claimed (not separately evidenced). Evidence Foundation overall completeness and Validation Level 3 §10 overall PASS remain NOT DECLARED.

### A.19 P1 / B-3 Gate State (current)

- B-1: complete bounded prerequisite (§A.7)
- B-2: complete bounded prerequisite (§A.8)
- B-4 / B-5: complete bounded governance prerequisites (§A.6)
- B-3: completion lifecycle remains UNRESOLVED

B-3 is the only unresolved item in the named B-1…B-5 sequence. The current `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §20.2 owner-decision register contains OWNER-APPROVED B-3 policy decisions. B-3 completion itself nevertheless remains UNRESOLVED, because existing unresolved findings/semantics remain open, including F1–F4, M-new-1, and `VI_EMPIRICAL_PILOT_SPEC.md` §14 completion/N/A semantics. This synchronization resolves no B-3 finding or policy value.

B-3 is not the sole P1 activation condition:

- `VI_EMPIRICAL_PILOT_SPEC.md` remains Proposed.
- Pilot manifests remain `approved_for_pilot=false`.
- Canonical pre-P1 instrumentation requirements include Pilot Spec approval, which is still required before n=1~3 instrumentation.
- P1 activation is a separate explicit decision.

P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; learning efficacy remains NOT VERIFIED.

### A.20 Evidence Boundary of This Synchronization

- Classification: DOCUMENTATION-ONLY STATUS / ROADMAP SYNCHRONIZATION (three files: `PROJECT_MASTER_INDEX.md`, `PROJECT_STATUS.md`, `VALIDATION_STATUS.md`)
- Tests: NOT RUN — DOCUMENTATION-ONLY STATUS/ROADMAP SYNC
- PostgreSQL: NOT RUN — DOCUMENTATION-ONLY STATUS/ROADMAP SYNC
- `NOT RUN` is not PASS. Every figure in §A.17 and §A.18 is prior commit-pinned evidence, not evidence generated by this synchronization.

### A.21 Next Action

No bounded implementation milestone is currently active. Return to Control Tower for post-sync milestone selection. This applies only after this three-file post-closure roadmap/status synchronization candidate (branch `validation/post-closure-status-roadmap-sync-20260923`, parent `d41829f4d6f71d78cdbda80b96ee7af41e44a715`) has had a fresh, separate Independent Review and has been integrated onto main.

The earlier Next Action here was a read-only METRIC_RESULT / Unseen Transfer v2 Runtime implementation-readiness re-pre-analysis. It is fulfilled and superseded, so it is no longer a current action. This document selects no next milestone and generates no Validation evidence.

---

## B. Historical Validation Records

> `MOBILE-01` 작업 브랜치의 개발 검증 상태는 아래 §C에서 별도로 관리한다.

### B.1 §9 Conversation Boundary — Full Evidence Chain

The following is the full §9 Conversation Boundary evidence chain and acceptance-criteria reconciliation, preserved unchanged. It is the factual support for the current §A.1 "§9 PASS" status and is not superseded.

**Reference commit / verified implementation baseline**: `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`

**Validation Level 3 §9 Conversation Boundary: PASS** (2026-07-22).

The verified implementation baseline contains the production Learning Flow five-branch decision path and production client boundary controller. AC-012, AC-014, AC-015, and AC-016 are all Architecture Clarification **RESOLVED** / Prerequisite Implementation **CLOSED**.

Code/artifact presence is a separate claim from validation PASS. The two are not conflated.

#### B.1.1 §9 Evidence Chain

-   Server main implementation: `fff9d93e3822c187e9e8fd68bd75e810880f6954`
-   Server main correction: `33a36dea2f2e9b342e97c473bd0fce8056d67fac`
-   Server independent review record: `92b4319fb7794a9fb0d03537c01e5781a29dbb9c` — **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/CRITICAL/MAJOR 0
-   Server validation evidence: Actions run `29748289860`, 183/183 PASS, 39 suites, PostgreSQL 16.14 / Node.js 20.20.2
-   Client validation implementation/evidence: `c8cff69a136b8259d5f18cd41256dcb478afe61d` / `3e7edb637f13444a51c2d181e3ac9fb7f6e57ff7`
-   Client main implementation/evidence: `910835ab381aa3e5c5549dba04a4d55707ed6a10` / `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`
-   Client independent review: **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/CRITICAL/MAJOR 0
-   Post-merge verification branch: `vl3-section9-postmerge-validation-20260722`
-   Workflow-only commit: `18a028fbf2e88aaea05e66ab450c18127691e8b3`
-   GitHub Actions run `29874075409`: 191/191 PASS, 40 suites, fail/cancelled/skipped/todo 0, PostgreSQL 16.14 / Node.js 20.20.2
-   The post-merge branch tree excluding `.github/workflows/postgresql-tests.yml` is byte-identical to verified implementation main `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`; main does not contain the temporary workflow.

#### B.1.2 §9 Acceptance Criteria Reconciliation

| Canonical criterion | PASS evidence |
|---|---|
| 진입 조건 트리거 | Production `startSession`이 조건 충족 시 exact `{next_action:"CONVERSATION"}`을 반환함을 server PostgreSQL validation 183/183과 post-merge 191/191에서 확인 |
| 클라이언트 표시 | Production controller가 오류·빈 화면이 아닌 정상 `CONVERSATION_BOUNDARY` screen state를 반환함을 client E2E에서 확인 |
| 세션 흐름 유지 | 화면 확인 후 in-memory acknowledgement=true, `startSession(..., true)` 재호출, 서버의 다음 유효 action 소비까지 확인 |
| acknowledgement omitted / false | 세 진입 조건 충족 시 CONVERSATION 반환 확인 |
| acknowledgement true | 같은 호출에서 CONVERSATION을 제외하고 기존 우선순위의 다음 유효 action 반환 확인 |
| acknowledgement null / non-boolean | `CONTRACT_VIOLATION` 전달 및 client error state, 자동 재호출 없음 확인 |
| acknowledgement lifecycle | 명시적 확인 전 false, 확인 뒤 현재 controller/session memory에서 true, 새 controller/session에서 false 초기화 확인 |
| capacity-race 재판정 | `startSession → startExplicitStudy(CONTRACT_VIOLATION) → fresh startSession` 각 1회와 최신 authoritative action 수신 확인 |
| 전체 client boundary DB write 0 | 왕복 전후 9개 테이블의 row count와 row digest 동일, 생성·수정·삭제 0 확인 |
| 구현 선행조건 | REVIEW / NEW_GRAMMAR / INTERLEAVING / CONVERSATION / IDLE 다섯 production branch, exact-key payload, admission error 보존 확인 |

Conversation Engine 내부 설계·대화 품질과 실제 UI binding은 `VALIDATION_LEVEL3.md` §2.2 및 §9에 따라 이 PASS 판정 범위 밖이다. Production controller의 `SCREEN_KIND`/state model 경계까지만 검증 대상으로 인정한다.

### B.2 Historical Validation Record — Prior-session Codebase

⚠️ **Warning**:

This result belongs to a prior-session codebase and is not evidence that the current GitHub main has passed the same validation scope.

These results are preserved for historical continuity only and must not be cited as current-main validation evidence. Its "§9 In Progress" and 260/260 figures are historical only and do not override the current §9 PASS evidence in §B.1.

#### B.2.1 Overall Progress (historical)

Completed: 4 / 9 sections

#### B.2.2 PASS (historical)

-   §5 Grammar Gate
-   §6 White List
-   §7 Relation Integrity
-   §8 Review Engine

#### B.2.3 In Progress (historical)

-   §9 Conversation Boundary

#### B.2.4 Deferred (historical)

-   Real LLM Validation

#### B.2.5 Out of Scope (historical)

-   Conversation UI Rendering

#### B.2.6 Blocked (historical)

None

#### B.2.7 Regression (historical)

260 / 260 PASS

### B.3 Evidence Foundation P0 Bounded Runtime Evidence — Prior Pointer (historical)

This is the prior `Last runtime-validated implementation` / §A.2 pointer, preserved unchanged for historical continuity. It has been superseded as the current pointer by `f6c0d1b0cb388403f2a8e636e359a099128dd8f0` (see current §A.2 and §A.7), but remains valid, non-superseded evidence for the Evidence Foundation P0 finalization writer scope it was recorded against.

**Runtime-validated implementation**: `593b5a4a11fb394a3db6b47a56e2d7b6ceccda0e`

**Environment**:

- Windows PowerShell 5.1
- PostgreSQL 17.10
- Node.js 24.18.0
- npm 11.16.0

**Evidence database**:

- evidence tables: 16
- highest migration: 012
- migration 013: absent

**Focused test result**:

- tests 64, suites 1, pass 64, fail 0, cancelled 0, skipped 0, todo 0

**Full test result**:

- tests 324, suites 52, pass 324, fail 0, cancelled 0, skipped 0, todo 0

This is the bounded Evidence Foundation P0 finalization writer runtime-validation record. It does not declare Evidence Foundation overall complete.

## C. MOBILE-01 — 작업 브랜치 개발 검증

### C.1 최초 모바일 화면 구현 검증

- 날짜: 2026-10-01 (Asia/Seoul).
- 시작 기준선: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 브랜치: `development/mobile-01-session-ui-20261001`.
- 실행 환경: Linux, Node.js `v24.19.0`, npm `11.9.0`, DOM 검증용 `linkedom` `0.18.13`.
- 코드 검증 명령: `node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js`.
- 결과: 59 tests / 4 suites / pass 59 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0.
- 구성: 신규 모바일 검증 28개와 기존 AI Generation/Generation 계약 검증 31개. 기존 PostgreSQL 회귀 전체 결과로 인용하지 않는다.
- `npm run build:mobile`: exit 0. 기존 제어기 원문을 포함한 빌드와 기본 진입·명시적 미리보기의 DOM 실행을 확인했다.
- 새 검증의 주요 범위: HTTP 경로·봉투·토큰 헤더, user_id 바디 비포함, 다섯 서버 분기, 순서·중복 보존,
  capacity 충돌의 단일 재조회, 일반 오류의 비재조회, 대화 확인과 새 세션 초기화, 타임아웃,
  원문 진단 비노출, DOM 문자열 비실행, 버튼 중복 요청 방지, 늦은 응답의 제거된 화면 비복구,
  빌드의 서버 코드 비포함, 정적 실행기의 공개 파일 제한.
- 실제 브라우저 화면 표시·휴대폰 너비: `미확인`.
  실행 파일 설치는 잘못된 압축 응답으로 실패했고, 제공 브라우저는 로컬 서버에
  `ERR_BLOCKED_BY_CLIENT`, 공유 파일의 `file://` 열기에 보안 정책 거부를 반환했다.
  브라우저 접근을 우회하지 않았다. DOM 검사는 시각 검증으로 승격하지 않는다.
- 기존 전체 `npm test` / PostgreSQL / 실제 공급자 / APK / 실기기 / 학습 효과: NOT RUN.
  이 환경에 PostgreSQL 실행기가 없으며 사용자·학습자·운영 DB를 대상으로 하지 않았다.
- 저장 커밋은 해당 작업 브랜치의 Git에서 직접 조회한다. 이 결과는 해당 파일 내용의 개발 검증 증거이며,
  커밋 후 재실행이나 독립 리뷰 증거를 임의로 선언하지 않는다.
- 구분: 이 작업의 검증 결과는 개발 세션 증거이며 독립 리뷰나 프로젝트 전체 PASS를 뜻하지 않는다.

### C.2 단일 HTML 화면 검증 준비 빌드 — 2026-10-01

- 사용자 계속 빌드 지시: 2026-10-01T05:48:50+09:00. 범위는 `MOBILE_APP_BRIEF.md` §6.
- 시작 개발 기준선: `6728a75f3411d7ac388253bb509a189e03931828`; 기준 `main`: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- 실행 환경: 기존 C.1과 같은 Linux / Node.js `v24.19.0` / npm `11.9.0` / `linkedom` `0.18.13`.
- 모바일 단독 실행: `node --test --test-concurrency=1 tests/mobileClient.test.js` → 32 tests / 0 suites / pass 32 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0.
- 기존 계약 포함 실행: `node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js` → 63 tests / 4 suites / pass 63 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0.
- 구성: 모바일 검증 32개 (C.1 대비 단일 파일 산출물·실행 검증 4개 추가)와 기존 AI Generation/Generation 계약 검증 31개.
- `npm run build:mobile`: exit 0. 일반 정적 앱과 `mobile/dist/lle-mobile-preview.html`을 생성했다.
- 코드 저장 커밋 `a959906ce8a40a57c7aca8e9d0ad63c7c770a5e8` 확인 후 깨끗한 작업 상태에서 `npm run build:mobile`을 다시 실행했고 exit 0을 확인했다. 다운로드 파일의 출처 메타데이터가 이 커밋과 일치하고 작업 중 변경 표시가 없는 것을 확인했다. 런타임 테스트를 커밋 후 재실행한 기록으로 바꾸지 않는다.
- 추가 직접 검증: HTML 안에 코드·스타일·아이콘 포함, 외부 코드·스타일 파일 참조 없음, 인라인 코드·스타일의 CSP 해시 일치, `connect-src 'none'` 선언, 파일에 출처 커밋/작업 중 변경 표시 포함.
- 추가 DOM 실행: 다운로드 파일의 합성 모드 고정, 호스트 토큰 미호출, 일곱 장면 선택, 교차 연습 중복·순서 보존, 명시적 학습 시작 후 같은 제안의 학습 시작 버튼 비활성, 대화 확인·새 세션, 합성 오류 재시도. 해당 DOM 실행에서 네트워크 호출 0을 확인했다.
- 정적 실행기의 공개 파일 목록은 유지한다. 다운로드 전용 HTML을 기존 서버 경로로 노출하지 않는다.
- `git diff --check`, 문서 구조·변경 파일 범위와 기존 제어기/전송 계약 보존을 확인한다. 이 준비 빌드의 저장 커밋과 최종 다운로드 파일 출처·해시는 `MOBILE_APP_HANDOFF.md` 및 해당 브랜치 Git 이력에서 조회한다.
- 실제 브라우저의 CSP 집행·화면 표시·휴대폰 너비·실기기: `미확인`. 브라우저 접근을 재시도하거나 우회하지 않았다.
- 기존 전체 `npm test` / PostgreSQL / 실제 공급자 / APK / 실기기 / 학습 효과: NOT RUN.
- 이 결과는 해당 작업 파일의 개발 세션 자동 검증이다. 실제 화면 검증, 독립 리뷰, 전체 Validation PASS, MOBILE-01 lifecycle CLOSED를 뜻하지 않는다.

## D. MOBILE-02 — 선택 다운로드 클라이언트 개발 검증

- 날짜: 2026-10-01 (Asia/Seoul). 사용자 지정 범위: `MOBILE_APP_BRIEF.md` §7.
- 작업 시작: `0e07e90ff1ecfcd8304b089f870dd10401d9d634`; 계획 저장: `bf84224ec94f9d879947fcebe420ef1630ee46b1`.
- 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 브랜치: `development/mobile-01-session-ui-20261001`.
- 환경: Linux, Node.js `v24.19.0`, npm `11.9.0`, `linkedom` `0.18.13`, IndexedDB 테스트 전용 `fake-indexeddb` `6.2.5`.
- 최종 실행: `node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js`.
- 결과: 95 tests / 4 suites / pass 95 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0.
- 구성: 모바일 화면/번들 38개 + 언어팩 서비스/캐시/팝업 26개 + 기존 AI Generation/Generation 계약 31개.
- 최종 작업 파일의 `npm run build:mobile`: exit 0. 일반 정적 앱과 다운로드용 단일 HTML 생성 완료.
- 코드 커밋 `16e793dc454482652f46329d3d0959fba35a2312`의 원격 변경 원문 일치를 확인한 후, 깨끗한 소스에서 `npm run build:mobile`을 다시 실행해 exit 0을 확인했다. 최종 파일의 출처 메타데이터가 이 코드 커밋과 일치하며 작업 중 변경 표시가 없는 것을 확인했고 파일 저장을 완료했다. 코드 커밋 후 런타임 테스트 재실행을 뜻하지 않는다.
- 직접 검증: 확인 전 다운로드 없음, 선택 파일 한 개, 크기·SHA-256 검증, 스트림 진행률,
  취소/늦은 응답/저장 실패의 설치 방지, 캐시 쓰기 원자성, 재실행 복구, 같은 버전 재사용,
  새 버전 실패 시 이전 캐시 보존, 본문 없는 캐시 차단, 미발행/잘못된 목록 차단,
  팝업 하나와 나라·언어 질문/용량/100 MB 경계의 Wi-Fi 안내, 텍스트 비실행과 Escape 취소.
- 실제 번들 DOM 실행: 기본 진입은 언어팩 목록, 옛 language/scene 설정으로 미설치 진입 불가,
  저장 후 선택한 EN으로 기존 HTTP 세션 호출, user_id 바디 비포함과 기존 토큰 헤더 유지,
  재실행/팩 재사용 시 추가 다운로드 없음, 인증 미연결 상태 유지, EN→JA 변경 시 대화 확인 초기화.
- 단일 파일 DOM 실행: 기본 목록·예시 용량·가상 설치 후 선택 언어 전환·합성 모드 고정,
  네트워크 호출 0, 기존 학습 장면/서버 순서 보존, 인라인 CSP 해시 일치.
- 개발 중 중간 실패는 기존 HOME 기대와 비동기 테스트 대기 조건에서 발생했다. 새 요구의
  LANGUAGE_PACKS 기대와 실제 선택 완료 Promise로 수정했고 위 최종 실행에서 통과했다.
- 모든 패키지 데이터는 작은 합성 바이트 또는 명시적 가상 목록이다. 실제 출시 팩·실제 용량·콘텐츠·HTTP 공급 서버를 검증하지 않았다.
- 실제 브라우저 CSP 집행·휴대폰 표시/터치·기기 캐시 보존/저장 한도·대용량 메모리·OS 중단: 미확인.
  C.1의 브라우저 보안 제한은 유지하며 접근을 재시도하거나 우회하지 않았다.
- 전체 `npm test`, PostgreSQL, 실제 AI 공급자, APK, 실기기, 학습 효과: NOT RUN.
- 기존 엔진/제어기/전송 계약/DB/migration/API/Tier A/Validation 판정 규칙은 변경하지 않았다.
  저장 커밋·원격 원문 확인·최종 다운로드 파일의 출처는 `MOBILE_APP_HANDOFF.md`와 브랜치 Git 이력에서 확인한다.
- 이 증거는 개발 세션 검증이며 독립 리뷰·프로젝트 전체 PASS·학습 효과·lifecycle CLOSED를 선언하지 않는다.

## E. MOBILE-03 — HTTP 서버 경계 개발 검증

- 저장된 실행 파일 identity: 코드 `c5285b23ea5f1ddd936a6743217b7e2cfb365035`, tree `44b659bb78ac5185cb63c52ab97c83db960bccfa`, parent `110b9b8dfffc9b8270e0877746d75ea636875357`. 변경 파일 전체를 원격 원문과 대조해 실행한 작업 파일과 일치함을 확인했다. 코드 저장 뒤 런타임 테스트 재실행으로 기록하지 않는다.
- 날짜: 2026-10-01 (Asia/Seoul). 범위: `MOBILE_APP_BRIEF.md` §8와 `LEARNING_API_SERVER_BRIEF.md`.
- 시작 기준선: `e89c4d027f4470d4e572fd89856afbb5ca41a62b`; 계획 저장: `110b9b8dfffc9b8270e0877746d75ea636875357`.
- 직접 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 브랜치: `development/mobile-01-session-ui-20261001`.
- 환경: Linux, Node.js `v24.19.0`. 패키지 설치나 의존성 변경 없이 기존 환경에서 실행했다.
- 최종 실행: `node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js`.
- 결과: 125 tests / 4 suites / pass 125 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0 (1961.489901 ms).
- 구성: 신규 HTTP 서버 30개 + 기존 모바일 38개 + 언어팩 26개 + AI Generation/Generation 31개.
- 최종 작업 파일의 `npm run build:mobile`: exit 0. 고정 클라이언트 whitelist를 유지하며 일반 앱·합성 HTML 생성 성공.
- HTTP 직접 검증: 토큰 검증 사용자만 전달, body/URL 사용자 위조 차단, 중복 Authorization,
  다섯 분기·복습 필드/순서·interleaving 중복, ack 생략/false/true와 새 세션 초기화,
  기존 오류 코드·HTTP 상태 매핑·내부 SQL/토큰/provider 진단 비노출·인증/전송 미연결 503.
- HTTP 요청 검증: 경로·method·추가 키·필수 입력·언어/ack 타입·JSON/UTF-8·media/압축·중복 Content-Type,
  Content-Length와 chunked·다중바이트 크기 상한. 헤더가 너무 많으면 Node parser의 431 거절도 안전한 차단으로 기록한다.
- 기존 실제 HTTP 클라이언트/제어기: 검증된 capacity 거절만 최신 결정 한 번 재조회,
  일반 계약 진단은 재조회하지 않음, 기술 실패/잘못된 내부 결과를 IDLE·empty·미리보기 성공으로 바꾸지 않음.
- 수명 검증: 늦은 인증·연결 종료·미완료 본문 후 엔진 새 호출 없음, 이미 호출한 작업의 늦은 실패 관찰,
  자동 재전송 없음. HTTP 취소가 기존 DB 작업의 rollback을 증명한다는 주장은 하지 않는다.
- CLI 검증: 합성 호스트 모듈 주입, 실제 자식 프로세스의 loopback 기본 미연결 503·SIGTERM 종료,
  설정 실패 로그의 내부 진단 비노출. 기본 실행은 실제 DB/인증을 연결하지 않는다.
- 초기 개별 실행에서 raw HTTP 테스트 helper의 Host 누락과 runtime의 사전 431 거절 기대가 실패했다.
  helper에 실제 Host/본문 길이를 넣고 파서 단계의 안전한 거절을 반영했다. 최종 선택 실행은 위 결과다.
- 학습 응답·인증 callback은 합성 fixture다. 실제 in-process 엔진의 PostgreSQL 실행·토큰 발급/검증·EXPLANATION 콘텐츠를 검증하지 않았다.
- 전체 `npm test`, PostgreSQL, 실제 AI 공급자, 운영 TLS/동일 출처 라우팅, 실제 팩, APK, 실기기, 학습 효과: NOT RUN.
- 기존 브라우저 제한은 유지하고 접근 재시도·우회 없음. 실제 화면·터치·CSP·대용량/OS 성능은 미확인이다.
- 기존 엔진·전송/제어기·Tier A·API 계약·schema/migration·Validation 판정 규칙은 변경하지 않았다.
- 원격 저장·코드 identity는 `MOBILE_APP_HANDOFF.md`와 Git 이력에서 확인한다. 기존 합성 미리보기 산출물은 MOBILE-02 출처로 보존하며 새 설치 앱으로 취급하지 않는다.
- 이 증거는 개발 세션의 HTTP 경계 검증이다. 독립 리뷰·프로젝트 전체 PASS·운영 준비·lifecycle CLOSED를 선언하지 않는다.

## F. MOBILE-04 — 게스트 인증·기존 사용자 저장 개발 검증

- 날짜: 2026-10-01 (Asia/Seoul). 범위: `MOBILE_APP_BRIEF.md` §9와 `GUEST_AUTH_BRIEF.md`.
- 시작 기준선: `3db8f6ab365e2ba1f9ab1516b3bbdeed04cdcf79`; 계획 저장: `9e84ebf4126badc6214ca4d6ca2bb4a93066bd02`.
- 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 브랜치: `development/mobile-01-session-ui-20261001`.
- 환경: Linux, Node.js `v24.19.0`. 패키지 설치·새 의존성·lock 변경 없음.
- 최종 실행: `node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js`.
- 결과: 151 tests / 4 suites / pass 151 / fail 0 / cancelled 0 / skipped 0 / todo 0 / exit 0 (2387.911136 ms).
- 구성: 신규 게스트 26개 + 기존 HTTP 30개 + 모바일 38개 + 언어팩 26개 + AI Generation/Generation 31개.
- 최종 작업 파일의 `npm run build:mobile`: exit 0. 클라이언트 whitelist·기존 화면/팩 코드를 보존했다. 서버/키/PG 모듈을 모바일 번들에 추가하지 않았다.
- 최초 개별 게스트/HTTP 실행도 통과했으며, 최종 수치는 위 선택 회귀만 인용한다. 런타임 테스트의 중간 실패 없음.
- crypto 직접 검증: 실제 HS256 서명, 별도의 WebCrypto HMAC 검증 API, 키 메모리 복사,
  토큰 변조/다른 키/padding/크기/누락·algorithm none/RS256·다른 typ·kid/JWK 거절,
  issuer/audience·UUID·발급/만료 경계·비정상 JSON/UTF-8·중복/추가 claim과 설정/시계 오류 차단.
- 저장 fixture 검증: 기존 users 컬럼·서버의 서로 다른 UUID·GUEST/NULL 필드·호스트 timezone,
  저장 확인 이전 토큰 비반환, 발급 준비 실패/사전 취소의 zero query, 변조/만료의 zero lookup,
  사용자 삭제/전환/identifier 변경·조회 도중 만료 차단.
- 실제 HTTP: 빈 POST/빈 JSON 발급·no-store/정확한 필드, 실제 발급 토큰으로 기존 앱 전송과 대화 확인,
  클라이언트 user_id 지정 비사용, 가입 입력/형식/media/크기/method/정확한 경로 거절,
  401/503 오류와 내부 진단 비노출·일반 오류의 엔진 code 비생성·새 게스트/미리보기 자동 대체 없음.
- 수명/호스트: timeout 뒤 끝난 INSERT가 저장될 수 있음을 합성 지연으로 확인했고 토큰 응답/자동 재전송은 없음.
  HTTP timeout을 DB rollback 증거로 취급하지 않는다. PG 호스트 factory의 기존 in-process 전송 연결,
  CLI 공통 실행의 발급/종료 hook, 명시 PG 호스트의 키 누락 시 시작 실패를 검증했다.
- 테스트의 key/clock/DB/학습 결정은 합성 fixture다. 서명·HTTP 소켓은 실제 Node API를 실행했다.
  실제 PostgreSQL SQL 실행·migration·운영 키·운영 인증·실제 학습자/사용자 생성 검증은 수행하지 않았다.
- 전체 `npm test`, PostgreSQL, 운영 TLS/동일 출처 라우팅, 기기 보안 저장/초기 진입, refresh/복구/convert,
  실제 팩/콘텐츠·AI 공급자·APK·실기기·학습 효과: NOT RUN 또는 미구현.
- 기존 엔진/전송/클라이언트/학습 API·schema/migration·Tier A·Validation 판정 규칙 변경 없음.
  HTTP 호스트·선택적 인증 경로와 관련 테스트만 확장했다. 기존 브라우저 제한을 재시도/우회하지 않았다.
- 저장 코드: `7093a43acc035793223d8a500210a848d24f0dfa` (tree `170bee426c0766d05f6710f1148c17fc09546aaf`, parent `9e84ebf4126badc6214ca4d6ca2bb4a93066bd02`). 변경 16개 파일의 원격 UTF-8 원문과 위 검증을 실행한 작업 파일의 완전 일치를 대조했다. 테스트·빌드는 코드 저장 전 실행이며 커밋 후 재실행으로 보고하지 않는다.
- 최종 인계의 저장 위치는 `MOBILE_APP_HANDOFF.md`와 Git 이력에서 확인한다. 기존 미리보기 산출물의 MOBILE-02 출처를 보존한다.
- 이 증거는 개발 세션 검증이다. 독립 보안 리뷰·프로젝트 전체 PASS·운영 준비·출시·lifecycle CLOSED를 선언하지 않는다.

## G. Android 베트남어 첫 시연 부족분 평가 — 문서/원문/환경 점검

- 사용자 지시: 2026-10-02T06:58:37+09:00 (Asia/Seoul). 평가 범위는 `ANDROID_VI_DEMO_ASSESSMENT.md`다.
- 직접 확인 main: `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 작업 브랜치/로컬/PR head: `661fa16edbf2cbde0ec9872f311247306c46828f` (tree `7079c2bba9c21b1d0dfc0c72ab15b57ff8e2a22f`).
- Git fetch·실제 .git/저장소 최상위/브랜치/HEAD·깨끗한 작업/staging을 직접 확인했다. upstream ahead/behind 0/0, main 대비 14/0. PR #2 open/draft/unmerged. 미저장 작업/진행 중 MOBILE-05 구현 없음.
- canonical 필수 문서·게스트/클라이언트/학습/저장 계약·VI 본문/검수 기준·관련 코드 등 47개 원문 조회 항목을 commit-pinned GitHub blob과 대조했다. 평가한 개발 파일의 실제 hash-object도 일치했다. 이는 읽기/출처 점검이며 런타임 결과가 아니다.
- 정적 코드 점검: 게스트 서버 존재, 일반 목록 기본 빈 값, 다운로드/캐시 본문 Blob 저장, 본문 소비와 문제/제출 UI 부재, HTTP 세 경로, explicit study의 state-only 반환, Learning Flow startSession-only export, 토큰 기본 만료/복구 부재, 별도 정적/API 서버의 미연결을 확인했다.
- 추가 직접 대조: `API_CONTRACT.md` §5.1의 PRE_MADE EXAMPLE/metadata null과 Generation의 `getContent(..., 'EXAMPLE')`, §10.1–10.3의 최초 QUIZ 제공 공백을 확인했다. `initial_practice` 보완은 제안/미승인이고 실제 계약·코드는 변경하지 않았다.
- `VI_CONTENT.md` §0·§2, `CONTENT_PRODUCTION_STANDARD.md` §4.3 및 문서 정합성 검증 기록을 직접 대조했다. 서비스 전 별도 검수 조건이 남아 있고 새 앱 배포 자산의 검수 완료 증거는 없다.
- 환경: Linux, Node.js `v24.19.0`, npm `11.9.0`; pg/linkedom 패키지 해석 가능. OpenJDK runtime `17.0.20` 존재. 확인한 도구 경로에 javac/gradle/adb/sdkmanager/psql/postgres/initdb/docker 없음; Android SDK 환경값/확인한 표준 경로와 추적 Android/Gradle 프로젝트·배포 팩 자산·상시 CI workflow 없음.
- 미노님의 Android 기종/OS/키보드·PC Android Studio/SDK·PG/HTTPS 호스트·검수 일정은 미확인. 환경 상태로 실제 DB나 휴대폰 실행 성공을 추정하지 않는다.
- 이번 변경: 평가/인계/위치/구현 상태/검증 문서만. 엔진·클라이언트·서버·테스트·package/lock·schema/migration·Tier A/API/Validation 규칙 변경 없음.
- 이번 런타임 테스트·모바일 빌드·전체 npm test·PostgreSQL·migration·Android SDK 설치/빌드·APK·에뮬레이터·실기기·실제 팩 다운로드·학습 효과: NOT RUN. 새 PASS/테스트 수치를 만들지 않는다. 이전 §C–F 증거는 당시 source/scope의 기록으로 보존한다.
- 문서 점검 보조 명령에 전체 문서를 담은 첫 호출은 인자 길이 제한으로 프로세스 생성 전에 거절됐다. 해당 명령은 실행되지 않았다. 짧은 파일 목록/UTF-8/구조/범위 점검으로 교체해 통과했으며 런타임 실패나 새 테스트 결과로 분류하지 않는다.
- 기존 브라우저 보안 차단을 재시도하거나 우회하지 않았다. 미리보기·DOM 자동 검증·APK 생성·실제 Android 완주를 각각 별도 상태로 기록한다.
- 평가 결과와 예상 시간은 AI 판단/조건부 추정이다. 사용자 목표 요청을 새 API/schema/복구/채점/출시 변경의 승인으로 확대하지 않는다. 다음 행동은 MOBILE-05 경계 설계 하나다.
- 이 체크포인트 저장 identity는 `MOBILE_APP_HANDOFF.md`와 작업 브랜치 Git 이력에서 조회한다. 문서 원격 저장 후 원문을 재확인하며 main merge·독립 리뷰·제품 완성·실제 시연 성공·CLOSED를 선언하지 않는다.

## H. 첫 시연 승인 기록·MOBILE-05 착수 — 문서/출처 점검

- 사용자 직접 응답: 2026-10-02T21:10:42+09:00 “승인”. 직전 질문의 온라인 학습·유효 토큰 내 재실행과 §5.1 `initial_practice` 보완 방향에만 연결했다. 구현 성공이나 다른 승인으로 확장하지 않는다.
- 시작 기준선: `d80a91958bacddbbb4fb113071c89aee3128aca9`, tree `96fb1e301e0780aa98012b1a9902dc9e3bae5cf6`; remote main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. PR #2 open/draft/unmerged.
- 이번 직접 사전 점검: fetch 성공, 실제 저장소/.git/최상위/브랜치/HEAD·origin/main, clean worktree/stage, upstream 0/0, main 관계 15/0. 필수 원문/평가/모바일/게스트/클라이언트/API 문서 15개와 관련 소스 8개를 pinned remote로 조회했다.
- 최초 보조 점검은 origin URL을 잘못 가정한 assertion에서 실패했다. 읽기 전용으로 실제 `https://github.com/minos8458-web/language-learning-engine.git`를 확인했으며 승인 저장소와 일치했다. 저장소를 변경/복구하지 않고 검사 가정만 고친 뒤 전체 preflight 통과를 확인했다. 이는 제품/런타임 실패가 아니다.
- 현재 변경은 승인/인계/상태 문서만이다. canonical API·소스·테스트·package/lock·DB schema/migration·Validation 판정 규칙을 변경하지 않는다.
- 런타임 테스트·모바일 빌드·PostgreSQL·migration·Android 도구 설치/빌드·APK/에뮬레이터/실기기·실제 팩·학습 효과: NOT RUN. 이전 §C–G 증거를 이번 실행으로 재보고하지 않는다.
- 이번 중간 승인 체크포인트를 원격에 저장·원문 재확인한 후 MOBILE-05 설계 하나를 진행한다. 설계 완료와 최종 직접 점검은 같은 §H에 추가 기록한다. main 병합·독립 리뷰·CLOSED·제품/실기기 완료는 선언하지 않는다.

### H.1 승인 저장·MOBILE-05 설계 직접 점검

- 승인 기록 원격 저장: `a2cecd593c4da92d2371169eff5592d2f9cb44dc`, parent `d80a91958bacddbbb4fb113071c89aee3128aca9`, tree `928fe493ffd8b7a2b4dfa587f00cc0026fcf00bf`.
- staged tree와 connector 생성 tree가 일치했고 원격 여섯 문서의 UTF-8 원문 exact read-back을 확인했다. 새 head/parent/tree·로컬 clean·upstream 0/0·main 16/0을 직접 확인한 후 다음 설계를 진행했다.
- 이번 원문 조회는 작업 브랜치 문서 15개·main 필수 문서 7개·모바일/게스트 관련 소스 8개로 총 30개 조회 항목이다. main의 required 원문·개발 후보 문서를 분리해 읽고 소스 8개는 pinned remote/local Git blob과 일치함을 확인했다.
- 직접 설계 대조: 기존 auth 응답 정확한 네 필드·서버의 INSERT/응답 유실 경계·기본 만료, client의 getAccessToken/fetchImpl 주입·일반 catch의 401 정보 소실·함수 존재 connected 판정·기존 세션/팩 복구·빌드 allowlist와 원문을 대조했다. source/API/schema를 바꾸지 않는 내부 adapter·fetch wrapper 연결 범위를 정했다.
- `MOBILE_GUEST_START_BRIEF.md`에 empty/pending/stored와 원자적 begin/commit, 저장 read-back 후 READY, 같은 유효 게스트 재실행, 불확실 발급/저장 오류·만료/401·dispose·호스트 관리/합성 모드의 경계 및 다음 클라이언트 구현 파일/검증 기준을 작성했다. 이는 설계 완료이며 구현/런타임 PASS가 아니다.
- Android 공식 Keystore·WebView native bridge·Auto Backup 원문을 2026-10-02 확인했다. OS 키/앱 기록/호출 origin·백업 경계를 설계 요구로 기록했다. 특정 플러그인/SDK/호스트 구조를 선정·설치하거나 네이티브 저장 보안을 검증하지 않았다.
- 최종 변경 범위는 신규 설계 문서 1개와 기존 승인/인계/연결/상태 문서 7개다. 로컬 UTF-8·code fence·충돌 표식 부재·설계 10절 구조·단일 다음 행동 참조·8문서 변경 범위·소스 8개 blob/기존 canonical 경계 보존·diff --check 점검을 통과했다. staged/remote tree 및 원문 exact read-back은 최종 저장에서 추가 확인한다.
- 이번 런타임/DOM 테스트·모바일 빌드·실제 PG/DB/migration·Android 도구 설치/빌드·APK/에뮬레이터/실기기·실제 팩 다운로드·학습 효과: NOT RUN. §C–F의 기존 실행 수치를 새 결과로 보고하지 않는다.
- 엔진/클라이언트/서버 소스·테스트·package/lock·canonical API/Tier A·schema/migration·Validation 판정 규칙은 보존한다. 실제 검수 팩·Android/PG/HTTPS·같은 게스트 만료 뒤 복구는 여전히 미완료/미확인이다.
- 최종 설계 저장 identity는 원격 작업 브랜치/Git 이력과 `MOBILE_APP_HANDOFF.md`를 따른다. 저장 후 원문/브랜치/PR를 재확인하며 main·독립 리뷰·lifecycle·출시·기기 성공 판정을 바꾸지 않는다.

## I. MOBILE-05 게스트 클라이언트 연결 — 착수 점검

- 사용자 직접 지시: 2026-10-02T21:46:25+09:00 “다음작업 계속 진행해”. 기존 단일 다음 행동의 구현/선택 검증이다.
- 시작 후보: `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`, tree `7f7de901f02f331859e34a6e3e999cc220d35bfe`; main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. PR #2 open/draft/unmerged.
- 직접 preflight: 저장소/.git/최상위/브랜치/HEAD·fetch·origin/main, clean worktree/stage, upstream 0/0, main 관계 17/0. remote main 필수 7문서는 직전 확인 원문과 같은 blob이며, 작업 후보 문서/소스/테스트/package 24개도 pinned remote/local hash-object와 일치했다.
- 현재 구현 범위/대기 한도·재시도/HTTPS/수명주기 실행 선택은 `MOBILE_GUEST_START_BRIEF.md` §11을 따른다. 착수 기록을 먼저 외부 저장한다.
- 이 중간 체크포인트에서 런타임 테스트·모바일 빌드·PostgreSQL·migration·Android 도구 설치/빌드·APK/에뮬레이터/실기기·실제 팩·운영 TLS·학습 효과는 NOT RUN. 구현 결과/최종 선택 실행은 같은 §I에 추가 기록한다.
- 기존 API/schema/학습 정책·Validation 판정 규칙을 보존하고 이전 §C–H의 실행/미실행을 새 증거로 재보고하지 않는다.

### I.1 MOBILE-05 클라이언트 구현·선택 개발 검증 — 2026-10-02

- 착수 범위 저장: `7465b14f278ea73b70357de0c41c6bab74288f72`, tree `401c7be8e0da2f782c398bb1414fb6cadb208a26`, parent `80fe5ac3be1f2064bcab5e81c7a742c1ab414ac7`. 5문서 pinned exact UTF-8 read-back/local tree 일치·clean/upstream 0/0·main 18/0 확인.
- 구현: 게스트 제어기·주입 저장 소비 경계·게스트 화면·모바일 진입/종료/재개·빌드 whitelist·test:mobile 목록. 실제 native adapter/production fallback store는 없다.
- 초기 직접 실행: `node --test --test-concurrency=1 tests/guestSessionClient.test.js tests/mobileClient.test.js`, exit 0; tests/pass 68, suites 0, fail/cancelled/skipped/todo 0, duration_ms 1725.120258.
- 최종 선택 직접 실행: 아래 명령, exit 0; tests/pass **184**, suites **4**, fail/cancelled/skipped/todo **0**, duration_ms **2846.911439**. 새 게스트 클라이언트 테스트 33개와 기존 선택 검증을 포함한다.

```bash
node --test --test-concurrency=1 tests/aiGenerationEngine.test.js tests/generationEngine.test.js tests/mobileClient.test.js tests/languagePackClient.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js tests/guestSessionClient.test.js
npm run build:mobile
```

- 직접 정적 검사: 새 제어기/화면/진입/테스트 node --check와 git diff --check 통과. 기존 LearningSessionController·HttpLearningFlowTransport·팩 service/controller/view·canonical API·각 CONTENT/GRAMMAR/PROGRESS/CONCEPT/VOCABULARY schema·package-lock byte 일치. server/transport/engines/db diff 0. 구현 source/package는 허용한 8파일로 한정했다.
- 주요 확인: 저장 intent/commit/read-back 전 학습 차단·동시 시작/원자 begin의 POST 1회·유효 기록 복구·손상/부분 기록·읽기/발급/저장 실패와 timeout·pending 재실행 신규 POST 0·same candidate 로컬 재시도·다른 guest 차단·private 값/진단 비노출·expiry/401·일반 오류/503·capacity 재조회·취소/dispose·본문 이후 호출자 취소 연결.
- 최종 번들/Node DOM: 합성 store 준비 후 기존 팩 다운로드/팝업/캐시/게스트 복구·언어 변경의 대화 확인 초기화·미설정/동시 설정 차단·preview 실제 인증/저장/fetch 0회·401 게스트 화면·bfcache/늦은 flow/발급 결과 차단.
- 실제 Node HTTP 통합: 기존 서버/service/codec의 HS256 발급/검증·Bearer로 확인한 user_id/401과 새 클라이언트를 연결했다. DB/store는 합성 fixture다. HTTPS 형식의 주입 주소를 테스트 소유 loopback HTTP 소켓으로 매핑했으며 운영 TLS/CORS·브라우저 차단 우회/배포의 증거가 아니다.
- 최종 모바일 빌드 exit 0. `mobile/dist/app.js`: 71055 bytes, SHA-256 `721e3d2a92afb5b8f1103ac4718dfbe719c5341c12af1cad003e6a5100fd467d`. `mobile/dist/lle-mobile-preview.html`: 84443 bytes, SHA-256 `dca09b9761cdcfad2f2d938c0a654c314655d4cba76a8f93093b210f8057dbda`. source meta는 7465b14f와 작업 파일 변경 표시다. 생성물은 Git 제외이며 source 저장 뒤 같은 binary/hash라고 가정하지 않는다. 이전 사용자 제공 preview 파일은 수정하지 않았다.
- 빌드의 npm http-proxy 환경 경고는 있었으며 exit 0이었다. dependency 설치/lock 변경 없음.
- 환경 재확인 (2026-10-02T22:20:36+09:00): javac/gradle/adb/sdkmanager/psql/postgres/initdb/docker는 PATH에 없다. SDK/PG를 설치하거나 사용자 PC/기기를 탐색하지 않았다. 별도 환경/독립 검수/기기 피드백 일정은 미확인이다.
- NOT RUN: 전체 npm test(독립 PG 미확보)·실제 PostgreSQL/migration·운영 키/인증·운영 HTTPS·실제 팩/검수 콘텐츠/단원 제출·OS Keystore/bridge/backup/재부팅·APK/에뮬레이터/실기기·실제 브라우저/CSP 집행/모바일 배치·AI 공급자/학습 효과. 기존 브라우저 차단 재시도/우회 없음.
- 이 결과는 작업 브랜치 개발 증거다. Validation Level/판정 규칙·main/독립 리뷰/CLOSED·P1/인간 데이터 승인·출시 상태를 바꾸지 않는다. 원격 저장 식별자는 후속 읽기 확인/인계에 기록한다.

### I.2 MOBILE-05 원격 코드 저장·PR 확인

- 구현 저장: `00f7909aefbc447999bfc77e32dae90e99aa9580`, parent `7465b14f278ea73b70357de0c41c6bab74288f72`, tree `5aba4478805b35e4402f45dd8bc58144ae76f00b`. 원격 create_tree가 실제 local staged write-tree와 일치하고 15개 변경 파일을 pinned ref로 다시 읽어 full UTF-8 내용과 blob을 확인했다.
- 로컬 HEAD/upstream/원격/PR head 일치·worktree/stage clean·upstream 0/0·main 19/0. main은 `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`로 유지했다.
- §I.1의 실행 대상 작업 파일과 저장된 소스는 byte-identical이다. 코드 커밋 뒤 런타임 재실행 결과로 바꾸지 않는다. 빌드 생성물은 Git 제외이며 이전 보존 preview도 수정하지 않았다.
- PR #2 제목/본문을 최종 구현/검증/미완료 경계로 갱신하고 exact read-back 확인. 상태 open/draft/unmerged와 base main을 유지했다.
- 이 후속 인계/검증 문서 저장은 소스 변경이 없으며 새 런타임/빌드/PG/기기 검증을 주장하지 않는다. 마지막 문서 head는 원격/Git 이력에서 조회하며 원문을 다시 읽는다.

## J. 최초 학습 응답 계약 후보 — 2026-10-03 문서 점검

- 사용자 범위: MOBILE-05 재작성 없이 다음 계약 설계 한 작업. 14:38:26+09:00 새 clone/기존 브랜치 연결 승인 후 실행했다.
- 기본 clone은 네트워크 프록시 연결 오류로 실패했으며 권한 확장 재시도는 exit 0, 후속 fetch도 exit 0. 이는 환경 복구이며 제품 테스트가 아니다.
- 시작 preflight: 실제 top-level `/workspace/scratch/2f8f7d39d1fd/language-learning-engine`, .git 존재, 승인 브랜치 `development/mobile-01-session-ui-20261001`, HEAD/upstream/PR `c14166731d5179e40783a1515de8e82f0925b094`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, worktree/stage clean, upstream 0/0·main 21/0.
- 원격 main의 BOOTSTRAP·필수 7문서·API/ENGINE_INTERFACE/CONTENT_SCHEMA/PROGRESS_SCHEMA를 commit-pinned connector로 읽고 local origin/main Git blob과 일치함을 대조했다. API/ENGINE_INTERFACE/CONTENT_SCHEMA/PROGRESS_SCHEMA/PROJECT_VISION/VALIDATION_LEVEL3/Backlog/IMPLEMENTATION_NOTES는 작업 기준과 main 간 변경이 없다.
- 직접 대조: API §4.3/§5.1/§7.1/§10.1–10.3/§11–12, Content projection/조건 SQL, Progress.recordExplicitStudy의 lock·기존 행 우선·capacity·commit, in-process state-only 경계, HTTP 입력/응답/오류와 client capacity 재조회, Tier A Content/Progress, 검수 표준과 시연 평가 §5.1.
- 발견: 현재 조건 조회는 HUMAN_AUTHORED/active/노드 포함만 보장하며 human_reviewed/is_canonical/단일 노드 판정이 없다. 기존 6키 projection에는 그 판단 정보도 없다. 후보 §4의 opt-in 프로필 R1은 추가 승인 대기이며 canonical 계약으로 승격하지 않았다.
- 산출물: `INITIAL_PRACTICE_CONTRACT_PROPOSAL.md`. 3키 응답·6키 projection·null 네 조합·기존 state·capacity/멱등·admission 후 읽기 실패·재시도 한계·후속 검증 목록을 문서화했다. IP-01~IP-12는 미래 검증 항목이며 실행 결과가 아니다.
- 이번 런타임 테스트·모바일 빌드·전체 npm test·PG/migration·APK·실기기·실제 팩/검수·AI/학습 효과: NOT RUN. 기존 §I 수치를 이번 PASS로 보고하지 않는다.
- 직접 문서 검증: 7개 문서의 UTF-8·fence 균형·충돌 표식 부재·후보 참조·변경 파일 집합 점검 통과. 초기 diff --check의 MOBILE_APP_BRIEF.md 말미 빈 줄을 정리한 뒤 재검사 exit 0. 기존 상태 문서의 오래된 현재 다음 행동도 최신 후보 승인 단계로 연결했다.
- 보존 검증: 시작 후보 대비 source/테스트/mobile/scripts/db/package·lock/API/ENGINE_INTERFACE/CONTENT_SCHEMA/PROGRESS_SCHEMA/VALIDATION_LEVEL3/Backlog diff 0; MOBILE-05 코드 저장점 00f7909aefbc447999bfc77e32dae90e99aa9580 대비 source/테스트/mobile/scripts/db/package·lock diff 0.
- 원격 저장 확인: `d27b6f606ed13ed4a65abdb771fa68aa29a5bc31`, parent `c14166731d5179e40783a1515de8e82f0925b094`, tree `327029803d7f29603e5238ff9eb2f94dec925785`. 변경 7문서의 pinned connector UTF-8 원문이 로컬과 정확히 같았고, 원격 tree도 로컬 준비 tree와 일치했다. fetch 후 local/upstream/PR head 일치, clean·upstream 0/0·main 22/0, main 유지·PR open/draft/unmerged 확인.
- 직접 git push는 로그인 정보 부재로 실패했으므로 연결된 GitHub 쓰기로 동일 tree를 저장했다. 미전송 로컬 커밋 `427608c0e40c87908f7a1e5800cc7b8faad984c2`와 원격 tree를 비교한 후 로컬 ref를 원격 커밋에 정렬했다. 원격 강제 갱신이나 main 변경은 없었다.
- 이 후속 인계/Validation 기록은 문서뿐이며 새 런타임 증거가 아니다. 정식 Validation PASS·독립 리뷰·CLOSED·병합/출시를 선언하지 않는다.

## K. 최초 학습 응답·R1 승인 계약 반영 — 2026-10-03

- 사용자 승인: 2026-10-03T19:35:16+09:00 “승인”. 대상 원문 `75ea09a8317c6f0f671d61155d8137261062a4b9:INITIAL_PRACTICE_CONTRACT_PROPOSAL.md` 및 직전 최종 답변의 다음 정식 계약 문서 반영 작업이다.
- preflight: 동일 local/remote/PR head `75ea09a8317c6f0f671d61155d8137261062a4b9`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, 승인 브랜치/경로/.git/top-level, clean worktree/stage, fetch 성공, upstream 0/0·main 23/0. 이전 설계 기준선 이후 동시 변경 없음.
- 변경 범위: API/ENGINE_INTERFACE/CLIENT_BRIEF/LEARNING_API_SERVER_BRIEF/Backlog 5문서와 후보/평가/모바일 brief/인계/위치/구현 상태/Validation 7문서. 새 API entry나 오류 code를 추가하지 않고 기존 getContent의 opt-in 인자와 start_explicit_study 응답을 보완한다.
- API 1.32·ENGINE_INTERFACE 1.20·CLIENT_BRIEF 1.3·Backlog 1.82. 기존 revision 행은 보존하며 후보의 승인 전 본문도 보존했다. 문서 승인·작업 브랜치 반영·main 통합·런타임 구현을 각각 구분한다.
- 이번 테스트·모바일 빌드·PostgreSQL/migration·Android/APK·실기기·실제 콘텐츠 검수/다운로드·AI/학습 효과: NOT RUN. 문서 점검을 정식 Validation PASS나 기존 §I 실행의 재실행으로 승격하지 않는다.
- 직접 문서 검증: 12파일 허용 범위·UTF-8·fence 균형·충돌 표식 부재·승인 원문의 응답/오류 표 반영·기존 개정 이력 행과 후보 §0–10 원문 보존·git diff --check 통과.
- 보존 대조: API §4.3/§5–6/§7.2부터 §10.1 전까지/§10.2부터 개정 이력 전까지 원문 동일. MOBILE-05 source/테스트/mobile/scripts/db/package·lock은 구현 저장점 00f7909aefbc447999bfc77e32dae90e99aa9580과 동일. Tier A/schema·VALIDATION_LEVEL3 판정 규칙 변경 없음.
- 계약 반영 원격 저장 확인: `a07ec7b2fc0856024e9d0cfb133b77d21c41cdc6`, tree `795c3903913de123577980ebbda734df9e68de26`, parent `75ea09a8317c6f0f671d61155d8137261062a4b9`. 변경 12문서의 pinned UTF-8 원문 exact read-back과 local staged tree 일치 확인. fetch 후 local/remote/PR head 일치·clean·upstream 0/0·main 24/0 및 PR #2 open/draft/unmerged를 확인했다.
- 이 후속 저장은 인계·검증 결과 2문서 기록만 포함한다. 최종 head는 Git 이력에서 조회하며 독립 리뷰·main 병합·CLOSED·출시는 선언하지 않는다.

## L. 최초 학습 서버 경계 구현 — 2026-10-03

- 사용자 지시: 2026-10-03T21:09:38+09:00 “ok 다음”; §K의 승인 계약에 따른 서버 경계 구현 한 작업.
- preflight: 실제 경로 `/workspace/scratch/2f8f7d39d1fd/language-learning-engine`, .git/top-level/승인 브랜치 확인; local/remote `18c3f6223b4bb08641be1dc28630eb97ee8936c7`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, fetch 성공·clean worktree/stage·upstream 0/0·main 25/0.
- 코드 4파일: `src/config/engineConfig.js`, `src/engines/contentEngine.js`, `src/engines/learningFlowEngine.js`, `src/transport/inProcessLearningFlowTransport.js`. 신규 테스트 `tests/initialPractice.test.js` 9개. 기존 테스트 원문은 변경하지 않았다.
- Node v24.19.0, 기존 lock 기반 `npm ci --ignore-scripts` 성공. package/lock 변경 없음. 기본 제한 환경에서 첫 test 실행은 파일 수준 exit 1(개별 진단 미출력); 로컬 HTTP socket을 허용한 실행에서는 성공했다. 초기 3파일 실행은 63/63, 추가 경계와 모바일 회귀를 포함한 최종 실행은 아래와 같다.
- 실행: `node --test --test-reporter=spec tests/initialPractice.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js tests/mobileClient.test.js tests/guestSessionClient.test.js tests/languagePackClient.test.js` → exit 0, **162 tests / 162 pass / 0 fail / 0 skipped**. 저장 직전 작업 파일에서 실행한 결과이며 커밋 후 재실행은 아니다.
- 신규 검증: R1 입력 오류 및 DB 호출 전 차단, parameterized SQL 필터/배열 projection·미지정 legacy 호출 동일, 6개 state × 설명/QUIZ 0/1 조합과 순서, admission 거절 후 Content 0회·capacity class 구분, 중복/손상 projection/answer_key fail-closed, 부분 실패 후 명시적 재시도, 실제 Progress/Content를 통과하는 합성 SQL seam의 commit-before-read 및 멱등 분기, 실제 HTTP/in-process/Flow 연결·503 정제·timeout 무재전송.
- 증거 한계: Content SQL 조건은 query/parameter assertion이고 SQL 실행·제외 행 검증은 아니다. DB/엔진 fixture는 합성이다. 실제 PostgreSQL 바이너리/psql을 환경에서 찾지 못했으며 PG 기반 Content/Generation/Progress/Flow/E2E suite는 NOT RUN. transaction 격리·실제 SQL 필터 동작의 증거로 확대하지 않는다.
- 보존: Progress/Generation source, `src/client`, mobile, db/schema/migration, package/lock 원문 변경 없음. API/ENGINE_INTERFACE/CLIENT_BRIEF·Tier A·VALIDATION_LEVEL3 판정 규칙 변경 없음. git diff --check 통과. MOBILE-05 재작성 없음.
- 모바일 테스트에 포함된 번들 동작 검증은 실행됐으나 별도의 `npm run build:mobile`, 운영 PG/HTTPS, 검수 콘텐츠/팩, Android/APK/실기기, 학습 효과는 NOT RUN. 독립 리뷰/main 통합/CLOSED/출시/P1 승격 없음.
- 다음 행동 하나: 실제 PostgreSQL의 격리된 합성 fixture에서 R1 선택 제외 조건·중복·admission 멱등/capacity 및 기존 Content/Generation/Flow 회귀를 검증한다. UI·제출·Android 구현은 동시에 시작하지 않는다.
- 구현 원격 저장 확인: `4e7d14b938a732fa72ea6297faffb0ae7408db7d`, tree `5285960afebf366c2e8c9a1652a6cfc75781ddda`, parent `18c3f6223b4bb08641be1dc28630eb97ee8936c7`. 변경 10파일 pinned UTF-8 원문 exact read-back·local staged tree 일치 확인. fetch 후 local/remote/PR head 일치·clean·upstream 0/0·main 26/0, PR #2 draft/unmerged 확인. 실행 대상 소스와 저장 소스가 동일하며 커밋 후 테스트 재실행은 아니다.
- 이 후속 저장은 인계/검증 결과 2문서만 갱신한다. 최종 head는 Git에서 조회하며 새 코드·런타임 검증·main 통합을 주장하지 않는다.

## M. 최초 학습 서버 경계 실제 PostgreSQL 검증 — 2026-10-03

- 사용자 직접 지시: 2026-10-03T22:16:33+09:00 “다음”. §L 다음 작업인 실제 PG 검증만 수행했다.
- preflight: 승인 경로/.git/top-level/브랜치 확인, local/remote `dc2082345f055ee9199b5a31fcc5ccb984f5e9bb`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`, fetch 성공·clean worktree/stage·upstream 0/0·main 27/0.
- 환경: Ubuntu 24.04, Node v24.19.0, PostgreSQL **16.15** (Ubuntu 16.15-0ubuntu0.24.04.1). 이번 임시 환경에 apt로 도구 설치. 운영 DB 접속 없이 `/tmp/lle-ip-pg/data`의 새 cluster, 접근 제한 Unix socket `/tmp/lle-ip-pg/socket`, port 55438, DB `lle_ip_validation`, `listen_addresses=''`로 실행했다. 합성 사용자/노드/Content만 사용했다.
- 기존 migration 001–013을 적용했고 최종 `schema_migrations` count 13을 확인했다. 테스트는 disposable DB의 public schema를 초기화한다. 장애 주입은 그 DB 안에서 content 테이블 임시 rename/복원만 수행했다. 저장소 DDL/migration 파일과 운영 데이터는 변경하지 않았다. 검증 후 임시 서버 fast shutdown 성공.
- 첫 실행: 146 tests, 140 pass, 6 fail. 신규 fixture의 `TRUNCATE content` 외래키 위반 3건은 CASCADE 초기화로 수정했다. 기존 Flow의 export/import/쓰기 금지 정적 단언 3건은 승인된 API 10.1의 startExplicitStudy·Content 호출·Progress admission을 반영해 갱신했다. startSession read-only 및 직접 SQL/recordAttempt/cascade 금지는 유지한다. 실패를 숨기거나 skip하지 않았다.
- 최종 실행: `PGHOST=/tmp/lle-ip-pg/socket PGPORT=55438 PGUSER=postgres PGDATABASE=lle_ip_validation node --test --test-concurrency=1 --test-reporter=spec tests/initialPractice.postgres.test.js tests/contentEngine.test.js tests/generationEngine.test.js tests/progressEngine.test.js tests/learningFlowEngine.test.js tests/learningSessionController.e2e.test.js` → **exit 0 / 146 tests / 29 suites / 146 pass / 0 fail / 0 skipped**. 저장 전 최종 작업 파일에서 실행했다.
- 신규 PG 8개: R1 각 제외 조건(source/review/canonical/active/exact node/meta language/설명 수준/type)과 legacy 조회 보존, 설명/QUIZ 4개 존재 조합과 3키/6키 projection/metadata/media 보존, 중복 canonical 기술 실패·수정 후 멱등, 저장된 본문/answer_key 손상, 실제 SQL 42P01 후 commit된 admission 유지·재요청 Progress 원문 불변, 동일 노드 8개 동시 요청→진도 1개, 다른 노드 3개 동시 요청→2개 성공/1개 capacity 및 기존 6 state 보존, user/node/capacity 거절 시 Content 미접근.
- 테스트 변경만 있음: 신규 `tests/initialPractice.postgres.test.js`, 기존 `tests/learningFlowEngine.test.js`의 승인된 호출 경계 정합성 보완. Production src·MOBILE-05·db/migration·package/lock·API/ENGINE_INTERFACE/CLIENT_BRIEF·Tier A·VALIDATION_LEVEL3 판정 규칙 변경 0. git diff --check 통과.
- 한계: 선택한 여섯 suite의 실제 Linux PostgreSQL 검증이며 전체 npm test·Windows PostgreSQL 17.10·운영 PG/HTTPS·검수 콘텐츠/팩·Android/APK·실기기·학습 효과 검증은 아니다. Generation suite에는 기존 mock 기반 검사도 포함된다. §L의 HTTP/모바일 162건은 이번에 재실행하지 않았고 별도 증거로 보존한다. 독립 리뷰·main 통합·CLOSED·출시/P1 활성화 없음.
- 다음 행동 하나: 최초 학습 서버 경계 구현 후보와 이번 PostgreSQL 검증 변경의 독립 리뷰를 진행한다. main 병합·UI·제출·Android 작업은 별도 후속으로 남긴다.
- PG 검증 원격 저장 확인: `35e2d9235667671da2c01b4094b983412067ad45`, tree `f34d27b1f94d7e5fb3bd18402ff6f21799215360`, parent `dc2082345f055ee9199b5a31fcc5ccb984f5e9bb`. 변경 7파일 pinned UTF-8 원문 exact read-back 및 local tree 일치, local/remote/PR head 일치·clean·upstream 0/0·main 28/0·PR #2 draft/unmerged를 확인했다. 실행한 최종 테스트 파일과 저장 파일이 동일하며 커밋 후 재실행은 아니다.

## N. 최초 학습 서버 독립 리뷰 요청 상태 — 2026-10-03

- 사용자 2026-10-03T22:51:34+09:00 “다음”. preflight local/remote/PR `92a9b70262b8df6bf8e67a3e03f517594699e139`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 승인 경로/.git/top-level/브랜치·fetch·clean·upstream 0/0·main 29/0 확인.
- Copilot reviewer 요청 API 한 번 실행: Action completed / isError=false. returned/requested_reviewers null; reviews/comments/threads 빈 배열을 직접 확인. 접수 미확인·결과 미수신이며 독립 리뷰 PASS/APPROVE가 아니다.
- PR 본문 정정과 대상 SHA/범위/검증 증거 명시. `INITIAL_PRACTICE_REVIEW_PACKET.md`는 작성자의 검토 자료이며 외부 리뷰 결과가 아니다.
- 이번 production source/test/schema/API 계약 변경 0. runtime/PG/build 재실행 없음. 이전 §L·§M 결과를 새 실행으로 재분류하지 않는다. main 병합·독립 리뷰 완료·CLOSED 없음.
- 다음 행동 하나: 최초 학습 클라이언트 응답 검증과 합성 preview 계약 정합성을 한 작업으로 보완한다(CP-IP-02/03). Node 지원 범위(CP-IP-01)와 401 안내 보존(CP-IP-04)은 별도 후속 수정으로 남기며 main 병합은 보류한다.

### N.1 후속 재조회 — 독립 리뷰 수신 및 지적 재현

- §N의 접수 미확인은 요청 직후 상태다. 최종 재조회에서 Copilot `PRR_kwDOTQ7IWM8AAAABQfiOMw` / COMMENTED / Changes recommended를 수신했다. submitted_at은 도구 원문 `2026-10-03T17:03:17Z`. High 2, Medium 2, Low 2; 원격 스레드 6개 unresolved 유지.
- 요청 target 92a9b70262b8df6bf8e67a3e03f517594699e139; reviewer의 reviewed commit은 도구 모델에 없어 미확인. 수신 당시 dcf9598613ac489dda338b4bb2d3a365371758e7는 문서만 추가되어 source/test 동일. PR 전체 리뷰이며 서버 bounded APPROVE로 확대하지 않는다.
- 작성자의 지적 확인: injected fetch로 HTTP startExplicitStudy가 `{}`와 `{state:'INTRODUCED'}`를 성공 resolve함, 401이 일반 연결 오류 메시지로 바뀜을 직접 재현(exit 0). 이는 재현 실험이지 새 회귀 suite PASS가 아니다. Preview 응답·Node engine 선언/lock 불일치·두 current Next Action 모순은 원문 대조로 확인했다.
- CP-IP-01–04 OPEN. CP-IP-05/06은 LLE_CURRENT_STATE §10과 PROJECT_STATUS §5.1의 current Next Action을 이번 문서 후보에서 정정했다. 원격 스레드 resolve·재리뷰·main 통합·CLOSED 미실행. 상세 finding 표는 INITIAL_PRACTICE_REVIEW_PACKET.md.

## O. CP-IP-02/03 최초 학습 클라이언트 응답·preview 보완 — 2026-10-04

- 사용자 직접 지시 2026-10-04T02:18:41+09:00 “다음”; 직전 인계의 CP-IP-02/03 한 작업. preflight 승인 경로/.git/top-level/브랜치·fetch·clean·upstream 0/0·main 31/0, local/remote `fdf69607405ac171752feed8096fcc7dbd5e3779`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`.
- Production 변경 3파일: learningFlowTransportContract의 assertExplicitStudyResult, httpLearningFlowTransport의 성공 반환 전 검증, mobile/previewTransport의 exact nullable 응답. 상태머신·게스트 저장소·팩·서버/엔진 코드 재작성 없음.
- 신규 tests/explicitStudyClient.test.js 5개 및 tests/mobileClient.test.js 화면 거절 검증 1개. 기존 HTTP/guestAuth/guestSessionClient/mobileClient의 정상 성공 fixture를 exact 응답으로 맞췄다. malformed 입력 회귀를 제거하거나 skip하지 않았다.
- 최종 실행: `node --test --test-reporter=spec tests/explicitStudyClient.test.js tests/mobileClient.test.js tests/learningFlowHttpServer.test.js tests/guestAuth.test.js tests/guestSessionClient.test.js tests/languagePackClient.test.js tests/initialPractice.test.js` → exit 0 / **168 tests / 168 pass / 0 fail / 0 skipped**.
- 직접 검증: 6 state × 독립 null/Content 조합 그대로 반환, exact top-level/Content keys와 요청 노드/type, malformed body/metadata/answer_key/difficulty 거절, 내부 값 비노출, 재전송·capacity 재조회 0회, preview 6개 scene 계약 일치. Node DOM 화면에서 `{}`·state-only·손상 QUIZ 응답이 ERROR로 표시되며 학습 시작 성공으로 표시되지 않음을 확인했다.
- `npm run build:mobile` exit 0. 빌드 산출물 mobile/dist는 Git 제외; 작업 파일 변경 상태의 번들로서 배포/실기기 검증이 아니다. 기존 401 일반 연결 오류 문제는 이번 수정에 포함하지 않았다.
- git diff --check 통과. 서버/Progress/Generation·db/schema/migration·게스트 및 팩 production 코드·package/lock·API/ENGINE_INTERFACE/CLIENT_BRIEF/VALIDATION_LEVEL3 원문 변경 0. 실제 PostgreSQL/운영 HTTPS/Android/APK/실기기·검수 데이터·학습 효과 검증은 이번 NOT RUN. 기존 §M PG 결과는 재실행으로 바꾸지 않는다.
- CP-IP-02/03 구현 후보 보완 완료, 독립 재리뷰·원격 스레드 resolve·main 병합·CLOSED 없음. 저장 전 최종 코드에서 실행한 결과이며 커밋 후 재실행으로 주장하지 않는다.
- 다음 행동 하나: Node 지원 버전 선언과 잠금 의존성의 최소 버전 불일치(CP-IP-01)를 한 작업으로 보완한다. 401 안내 보존(CP-IP-04)·재리뷰·main 병합은 별도 후속으로 남긴다.

## P. CP-IP-01 Node 최소 지원 버전 정합성 — 2026-10-04

- 사용자 직접 지시: 2026-10-04T06:06:21+09:00 “다음”. 시작 local/remote `282d31f21abcb2603eb670ed0aac113fdf85cadf`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 경로/.git/top-level/브랜치·fetch·clean·upstream 0/0·main 32/0 확인. main의 필수 권위 문서를 pinned 원문으로 재조회했다.
- root Node >=20 선언과 잠금 의존성 9개의 >=20.19.0 불일치를 확인했다. package.json과 package-lock.json root engines만 >=20.19.0으로 변경하고 README 개발 환경 안내를 추가했다.
- 공식 https://nodejs.org/dist/v20.19.0/ 의 Linux x64 archive와 SHASUMS256.txt를 내려받아 SHA-256 `b4e336584d62abefad31baecff7af167268be9bb7dd11f1297112e6eed3ca0d5` 일치 확인. 초기 tar의 소유권 복원 오류 후 `tar --no-same-owner`로 정상 재추출하고 아래 검증을 순서대로 재실행했다.
- 직접 실행 환경: Linux / Node v20.19.0 / npm 10.8.2. PATH에 `/tmp/node-v20.19.0-linux-x64/bin`을 선행했다. 기존 시스템 Node는 교체하지 않았다.
- `npm ci --engine-strict --ignore-scripts --no-audit --no-fund`: exit 0, 35 packages 설치. 설치 스크립트 및 audit 검증은 실행하지 않았다.
- `node --test --test-reporter=spec tests/explicitStudyClient.test.js tests/mobileClient.test.js tests/guestSessionClient.test.js tests/languagePackClient.test.js`: exit 0, **103 tests / 103 pass / 0 fail / 0 skipped**. 잠금 개발 의존성을 사용하는 DOM·IndexedDB 및 클라이언트 응답 경계 선택 검증이다.
- 같은 Node/npm의 `npm run build:mobile`: exit 0. mobile/dist는 Git 제외이며 배포·실기기 검증이 아니다.
- npm bundled semver로 모든 lock Node 범위가 20.19.0을 허용하고 새 root 범위가 20.18.0을 거절함 확인. 이는 범위 단언이며 Node 20.18.0 실행 실험이 아니다. JSON deep equality로 lock 변경이 root engines 한 값뿐임, package/lock engines 일치 확인. git diff --check 통과.
- production source/test·MOBILE-05·엔진/DB/schema/API/Validation 판정 규칙 변경 없음. 전체 suite·PG·운영 HTTPS·Android·실기기는 이번 NOT RUN. 이전 §O/§M 결과는 재실행으로 취급하지 않는다.
- CP-IP-01 CORRECTED IN CANDIDATE / RE-REVIEW PENDING. 원격 스레드 resolve·독립 재리뷰·main 병합·CLOSED 없음. 커밋 전 동일 작업 파일의 실행 결과다.
- 다음 행동 하나: HTTP 401의 세션 만료 안내가 일반 연결 오류로 바뀌는 문제(CP-IP-04)를 한 작업으로 보완한다. 독립 재리뷰·main 병합은 별도 후속으로 남긴다.


## Q. CP-IP-04 HTTP 401 정제 안내 보존 — 2026-10-04

- 승인: 2026-10-04T07:34:34+09:00 사용자 CP-IP-04 ONLY. 시작 HEAD/remote/PR `6a3471f15d1b25f6ede0c4b685c9010ded42b8c4`; main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`. 승인 경로/.git/top-level/branch, fetch exit 0, clean/index/untracked 0, upstream 0/0, main 34/0, PR #2 open/draft/unmerged 직접 확인.
- PR 증거: `PRRT_kwDOTQ7IWM6opsXP`, comment `4174041729`는 착수 시 unresolved/non-outdated. Copilot `PRR_kwDOTQ7IWM8AAAABQfiOMw`는 PR 리뷰 증거·외부 지적이며, 정식 milestone-final fresh read-only Independent Review가 아니다. 정식 검토는 후속 별도 `40 Independent Review` 단계다.
- Production 수정: `src/client/httpLearningFlowTransport.js` 한 파일. 비공개 ExpiredSessionError는 기존 HTTP 401 분기에서만 생성하고 고정 안내 `학습 연결이 만료됐어요. 다시 연결해 주세요.`만 담는다. PUBLIC_ERRORS·capacity 보존 뒤 기존 timeout 분기를 유지한 다음 내부 타입만 통과시킨다. JSON 파싱 순서·공개 exports·API·schema·서버/엔진·MOBILE-05 재작성 없음. refresh/renewal/새 게스트/자동 retry 없음.
- 회귀 수정: `tests/mobileClient.test.js`. 기존 401 제어기 검사의 정확한 안내 단언 추가, 일반 fetch/500 오류의 정확한 일반 안내 단언 및 외부 오류의 name/status/message 모방 거절 추가. 최초 학습 401의 고정 안내·공개 code 없음·capacity 아님·진단/토큰 비노출·단일 요청 검사 1건 추가. 관련 없는 테스트 재작성 없음.
- 실행 환경: Linux, Node `v20.19.0`, npm `10.8.2`; `PATH=/tmp/node-v20.19.0-linux-x64/bin:$PATH`. 기존 node_modules의 linkedom/fake-indexeddb/pg 사용 가능 확인. 설치 미실행, package.json/package-lock.json 변경 0.
- 수정 전 재현: `node --test --test-name-pattern='인증 만료|명시적 학습의 401|서버 진단과 토큰' tests/mobileClient.test.js` → exit 1, tests 40 / pass 1 / fail 2 / skipped 37. 강화한 두 401 검사가 일반 연결 안내를 받아 실패했다. 필터로 제외된 37건이며 최종 회귀에서는 제외 없음.
- 최종 수정 파일 직접 실행:
  - `node --test tests/mobileClient.test.js` → exit 0, tests 40 / pass 40 / fail 0 / cancelled 0 / skipped 0 / todo 0.
  - `npm run test:mobile` → exit 0, tests 99 / pass 99 / fail 0 / cancelled 0 / skipped 0 / todo 0. 위 40건을 포함하므로 합산하지 않는다.
  - `node --test tests/explicitStudyClient.test.js` → exit 0, tests 5 / pass 5 / fail 0 / cancelled 0 / skipped 0 / todo 0. 변경된 HTTP 경계를 사용하는 CP-IP-02/03 exact 응답·손상 거절·합성 preview 보존 확인을 위해 추가 실행.
  - `npm run build:mobile` → exit 0. mobile/dist는 Git 제외 생성물이며 배포·APK·실기기 완료 증거가 아니다.
- 기존 PUBLIC_ERRORS 다섯 코드·capacity 단일 재조회·일반 계약 위반 비재분류·timeout·잘못된 최초 학습 응답 거절·preview 검사가 위 선택 회귀에서 통과했다. 합성 fixture 및 Node DOM/HTTP 경계 증거이며 실제 PostgreSQL·운영 HTTPS·Actual-provider·Android/APK·실기기·학습 효능 검증을 새로 실행하지 않았다. 전체 npm test 미실행.
- 테스트·빌드는 커밋 직전 동일 source/test 내용에서 실행했다. 커밋 후 재실행으로 주장하지 않는다. git diff --check 통과 및 허용 파일 외 tracked diff 없음 확인. 수정 commit/tree는 MOBILE_APP_HANDOFF.md의 저장 기록을 따른다.
- CP-IP-04 = CORRECTED IN CANDIDATE / RE-REVIEW PENDING, NOT CLOSED. CP-IP-01/02/03 같은 상태 유지. CP-IP-05/06 = DOCUMENT CORRECTION / RE-CHECK PENDING. PR 스레드 resolve·리뷰 요청·정식 Independent Review·main 병합 미실행.
- 다음 행동 하나: Control Tower가 CP-IP-01–06 후속 PR 재확인 범위를 결정한다.

- 저장 결과 보충: 코드와 증거는 로컬 ordinary commit에 저장했으나 일반 push가 HTTPS 인증정보 부재로 exit 128 실패했다. 원격/PR head는 시작 SHA 그대로다. 위 PASS는 로컬 후보의 개발 증거이며 원격 반영·재리뷰 완료가 아니다. 해제 조건과 단일 다음 행동은 MOBILE_APP_HANDOFF.md를 따른다.


## R. IR-MOBILE-01 정제된 인증 만료 안내의 DOM 보존 — 2026-10-05

- 승인: 2026-10-05T06:18:28+09:00 사용자 IR-MOBILE-01 ONLY / RECOVERED CHECKOUT. Independent Review의 REQUEST CHANGES 및 IR-MOBILE-01/02/03 open 상태는 사용자 전달 판정이다. 이번 개발 세션이 독립 판정을 수행한 것은 아니다.
- 직접 preflight: `/workspace/scratch/2f8f7d39d1fd/lle-mobile-ir-recovery`, 승인 origin URL/branch, local/remote/PR `cf8dfb07dc32e76e4fc4afe5fb4061618bc0367d`, main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; fetch exit 0, clean/staged/untracked/stash 0, upstream 0/0, main 37/0, PR #2 open/draft/unmerged.
- Production: `src/client/mobileSessionView.js` 한 파일. state.error.message가 `학습 연결이 만료됐어요. 다시 연결해 주세요.`와 엄격히 일치할 때 동일 고정 상수를 description으로 반환한다. 나머지는 기존 일반 안내. 임의 원문 복사·부분 일치 허용 없음. transport/controller·PUBLIC_ERRORS·capacity·timeout·retry·admittedNodeId/NOT_INTRODUCED 변경 없음.
- Test: `tests/mobileClient.test.js`의 DOM 회귀 3개 추가. 실제 HttpLearningFlowTransport→LearningSessionController→mountMobileSession 경로에서 (1) 401의 ERROR/화면 설명 exact·일반 안내 대체 없음·단일 요청·토큰/SQL/진단 비노출, (2) fetch 예외의 일반 안내·만료 안내 없음·단일 요청, (3) getAccessToken 예외를 통해 controller에 남은 임의 원문과 만료 안내+진단 문자열의 DOM 비노출을 확인한다. 기존 CP-IP-04 테스트는 그대로 보존한다.
- 환경: GPT Work Linux / Node `v24.19.0` / npm `11.9.0`; repository engines `>=20.19.0`에 부합. 기존 `/tmp/node-v20.19.0-linux-x64/bin/node`는 이번 환경에 없어 현재 호환 runtime 사용. 새 clone의 linkedom/fake-indexeddb 부재를 확인하고 승인된 `npm ci --ignore-scripts` 실행 → exit 0, 35 packages 설치. npm http-proxy 환경 경고 있음. 설치 후 tracked 변화 0, package.json/package-lock.json 변경 0.
- 수정 전 재현: `node --test --test-name-pattern='HTTP 401의 정제된|HTTP fetch 실패는 DOM|제어기에 남은 임의 오류' tests/mobileClient.test.js` → exit 1, tests 3 / pass 2 / fail 1 / cancelled 0 / skipped 0 / todo 0. 기존 UI가 만료 안내 대신 일반 안내를 표시하여 exact DOM assertion 실패.
- 최종 수정 파일 직접 실행:
  - `node --test tests/mobileClient.test.js` → exit 0, tests 43 / pass 43 / fail 0 / cancelled 0 / skipped 0 / todo 0.
  - `npm run test:mobile` → exit 0, tests 102 / pass 102 / fail 0 / cancelled 0 / skipped 0 / todo 0. 위 43건 포함, 합산하지 않는다.
  - `npm run build:mobile` → exit 0. mobile/dist는 Git 제외 생성물. 배포/APK/실기기 완료 증거가 아니다.
- git diff --check 통과. 최종 diff는 production/test 위 두 파일과 MOBILE_APP_HANDOFF.md·VALIDATION_STATUS.md 네 파일뿐이다. 다른 production·package/lock·API/schema/migration/Tier A 변경 없음. 새로운 PostgreSQL/Actual-provider/학습 효능/실기기/전체 npm test 검증 없음. 기존 CP-IP-04 transport/controller·capacity·timeout·malformed explicit-study 화면 회귀는 모바일 선택 실행에 포함된다.
- IR-MOBILE-01 = CORRECTED IN CANDIDATE / RE-REVIEW PENDING. 전체 후보 REQUEST CHANGES 유지; IR-MOBILE-02/03 HOLD/open. 이 실행은 개발 증거이며 Independent Review PASS/VALIDATED/CLOSED가 아니다. 재리뷰 요청·스레드 resolve·main 병합 미실행. 역사적 상태 문구 정리는 수행하지 않았다.
- 다음 행동 하나: Control Tower가 IR-MOBILE-01 수정 증거를 확인한 뒤 IR-MOBILE-02의 착수 여부를 결정한다.

## S. IR-MOBILE-02 NOT_INTRODUCED 입학 성공 표시 차단 — 2026-10-05

- 사용자 직접 승인: 2026-10-05T07:01:56+09:00 IR-MOBILE-02 ONLY. 시작 local/remote/PR head `413dd5ea9353117938b5f26924d8aad512ab7b64`, origin/main `ce2dfcc04384962e67d6f4b0ff1ed397cd68aa92`; 승인 경로/.git/top-level/origin/branch, fetch exit 0, clean/staged/untracked/stash 0, upstream 0/0, main 39/0, PR #2 open/draft/unmerged 직접 확인.
- Production: `src/client/mobileSessionView.js` 한 파일. explicit-study 결과가 존재하고 controller 상태 반환이 아니며 state가 NOT_INTRODUCED가 아닐 때만 admittedNodeId를 설정한다. CLIENT_BRIEF §2.1의 미도입 상태를 클라이언트가 입학 성공으로 승격하지 않는다. 나머지 5개 유효 상태는 기존 표시를 보존하고 transport 6상태 검증/응답 내용은 변경하지 않는다.
- Test: `tests/mobileClient.test.js`에 상태별 DOM 회귀 6개와 capacity DOM 회귀 1개 추가. 실제 HttpLearningFlowTransport→LearningSessionController→mountMobileSession 경로에서 6상태 × explanation/initial_practice의 독립 null/non-null 4조합 = 24조합을 확인한다. NOT_INTRODUCED는 READY/NEW_GRAMMAR를 유지하되 성공 문구·비활성 학습 시작됨 버튼이 없고, 다른 5상태는 기존 성공 표시를 유지한다. 각 조합은 session 1회 + explicit-study 1회뿐이다. capacity 충돌 후 같은 node의 새 제안도 성공 표시하지 않고 session→study→session 순서만 실행한다.
- 수정 전 재현: `node --test --test-name-pattern='명시적 학습 DOM|capacity 충돌 뒤 같은' tests/mobileClient.test.js` → exit 1, tests 7 / pass 6 / fail 1 / cancelled 0 / skipped 0 / todo 0. NOT_INTRODUCED의 거짓 성공 문구 단언이 실패했다.
- 실행 환경: GPT Work Linux / Node `v24.19.0` / npm `11.9.0`, repository engines `>=20.19.0` 충족. 기존 node_modules 사용 가능 확인 후 설치 미실행. npm http-proxy 환경 경고 있음. package.json/package-lock.json tracked diff 0.
- 최종 수정 파일 직접 실행:
  - `node --test tests/mobileClient.test.js` → exit 0, tests 50 / pass 50 / fail 0 / cancelled 0 / skipped 0 / todo 0.
  - `npm run test:mobile` → exit 0, tests 109 / pass 109 / fail 0 / cancelled 0 / skipped 0 / todo 0. 위 50건을 포함하므로 합산하지 않는다.
  - `npm run build:mobile` → exit 0, PASS. mobile/dist는 Git 제외 생성물이며 배포/APK/실기기 증거가 아니다.
- 기존 IR-MOBILE-01 DOM 안내 및 CP-IP-04 transport/controller·capacity·일반 계약 오류·timeout·malformed 응답 회귀가 위 모바일 선택 검증에서 통과했다. 일반 네트워크 오류·guest lifecycle·자동 retry/replay 정책을 변경하지 않았다. 설명/문제/제출/피드백 UI, 다른 production, API/schema/migration/Tier A 및 의존성 파일 변경 없음. 실제 PostgreSQL/Actual-provider/학습 효능/Android/실기기/전체 npm test 검증 미실행.
- git diff --check 통과. 허용된 production/test와 MOBILE_APP_HANDOFF.md·VALIDATION_STATUS.md의 최소 증거만 변경했다. 실행한 source/test를 ordinary local commit으로 저장하고 원본 SHA를 보존하는 bundle을 전달한다. Work push 재시도 없음; 원격 반영 완료를 주장하지 않는다.
- IR-MOBILE-02 = CORRECTED IN CANDIDATE / RE-REVIEW PENDING. IR-MOBILE-01 같은 상태 유지. IR-MOBILE-03 = HOLD / OPEN; 전체 후보 REQUEST CHANGES 유지. Independent Review PASS/CLOSED·재리뷰 요청·스레드 resolve·main 병합 없음. 역사적 상태 문구의 광범위 정리 없음.
- 다음 행동 하나: Control Tower가 IR-MOBILE-02 bundle의 정확한 커밋 원격 저장을 판정한다.

## T. MOBILE CRLF post-merge 정정 — post-merge Windows-local 검증 — 2026-10-09

- 범위: 이 절의 증거는 정확히 main `46ec690927c3f83d990bc613389ecfa9ece6fe24` (tree `1c1b77f7b5e387772e1f1727dd1ae2f1ffd94ff8`)에만 고정된다. 이전 절(§A–§S)의 runtime·PostgreSQL·전체 suite 증거를 덮어쓰거나 재해석하지 않는다.
- 리뷰된 정정: commit `15f562333def8bc0c13efb4e16a01c80d5913de8` (tree `9438b252e42f51b84b7022b7a280b8c5fdeefe93`). 정정 파일은 정확히 `scripts/build-mobile.js`, `tests/mobileClient.test.js`. Independent Review: APPROVE / MAIN-INTEGRATION ELIGIBLE / Control Tower ACCEPTED, blocking finding 0.
- Runtime main 통합: `fdfe24f6dd9a7f65e6b8f67c41cdcacae6ae753a` (tree `9438b252e42f51b84b7022b7a280b8c5fdeefe93` = 리뷰된 tree). 상태 전용 동기화: `46ec690927c3f83d990bc613389ecfa9ece6fe24` (parent `fdfe24f6dd9a7f65e6b8f67c41cdcacae6ae753a`).
- 검증된 최종 main/tree: `46ec690927c3f83d990bc613389ecfa9ece6fe24` / `1c1b77f7b5e387772e1f1727dd1ae2f1ffd94ff8`.
- 환경: Windows-local, worktree `E:/Projects/LLE_INTEGRATION_MOBILE_20261005`, Node `v24.18.0`, npm `11.16.0`; repository engines `>=20.19.0` 충족.
- 실행 결과 (순서대로, 각 단계 fail-fast):
  1. `npm ci --ignore-scripts --no-audit --no-fund` → PASS.
  2. `git diff --check` → PASS.
  3. `npm run test:mobile` → PASS, tests 110 / pass 110 / fail 0 / cancelled 0 / skipped 0 / todo 0.
  4. `npm run build:mobile` → PASS.
- 최종 Git 상태: branch `main`, HEAD = origin/main = `46ec690927c3f83d990bc613389ecfa9ece6fe24`, tracked clean, staged clean, untracked clean, stash 0. `mobile/dist`는 Git 제외 생성물(`!! mobile/dist/`)이며 배포/APK/실기기 증거가 아니다.
- NOT RUN: `npm test`, `test:api`, PostgreSQL, migration, database 명령, Actual-provider 호출. 어느 NOT RUN 항목도 PASS로 해석하지 않는다.
- 주장하지 않음: Android/APK 검증, 실기기 검증, 학습 효능.
- Non-blocking 리뷰 노트: N-01 LOW, N-02 LOW, N-03 INFO, N-04 INFO. 모두 NON-BLOCKING이며 정정 불요.
- 판정: Post-merge validation = PASS / Control Tower ACCEPTED. 정정 lifecycle = VALIDATED. NOT CLOSED. Review-record = CANDIDATE / PENDING FRESH INDEPENDENT REVIEW. 계획된 additive candidate review-record revision은 ARCHITECTURE_CLARIFICATION_BACKLOG.md `1.83`이며, 이 절은 그 revision이 저장·독립 리뷰·REVIEW-RECORDED·통합·CLOSED 되었음을 주장하지 않는다.
- 다음 행동 하나 (candidate 저장 후): 정확한 review-record candidate commit에 대한 새롭고 별도인 읽기 전용 Independent Review를 한 번 진행한다.
