# PROJECT_MASTER_INDEX.md

# Language Learning Engine (LLE)

## Role of This Document

**Project Position / Roadmap Authority.** This index carries only a commit-pinned validation summary for roadmap orientation; `VALIDATION_STATUS.md` remains the sole Validation State Authority and owns the detailed acceptance mapping. `PROJECT_STATUS.md` remains the sole Current Implementation State and Product Readiness Authority.

## Source of Truth

1.  PROJECT_VISION.md
2.  IMPLEMENTATION_NOTES.md
3.  VALIDATION_LEVEL3.md
4.  ARCHITECTURE_CLARIFICATION_BACKLOG.md

## Ledger Snapshot Identity

This document is pinned to the following identities. Git ref, runtime-validated implementation, independent review target, and review-record commit are separate authorities and are not merged into a single "current implementation SHA".

- **Ledger snapshot baseline**: `4d5776e9a7465716e036dd58f7b550469e9b98f7` — the exact `origin/main` baseline from which this three-file synchronization candidate is prepared.
- **Current GitHub Main**: `GitHub refs/heads/main` is the authority for current repository HEAD. No hard-coded SHA in this document replaces that ref.
- **Runtime Foundation B1 accepted implementation**: `6bb2bccd5abef2d10839706ffdd000285b59512d` — RAW_SOURCE rebuild runtime, independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed. Detailed validation evidence is owned by `VALIDATION_STATUS.md`.
- **Latest accepted integrated runtime-validation milestone**: `22508147625090af84af141ac0ec574792369115` — METRIC_RESULT / Retention v1 runtime, independently reviewed, canonical on main, post-merge PostgreSQL verified, validated, review-recorded, and closed. Detailed validation evidence is owned by `VALIDATION_STATUS.md`.
- **Production finalization implementation**: `674bd9fb46bd1d799293c0e73984672b57c8a98c` — the commit that implemented the Evidence Foundation P0 bounded finalization writer.
- **Current canonical contract context**: `API_CONTRACT.md` revision `1.31` (blob `e60afa6bda3356051c24b36a823fb325761b9b42`) and `EVIDENCE_FOUNDATION_P0_SCHEMA.md` revision `1.10` (blob `de244476e56dfcab59dcd899a25091a2b1452e31`).
- **Current prepared runtime candidate**: `303e1af9aa2c32167e7caf66527b5020bbacf882`, parent `2034d1a01e58a36762750156df1fd63c8e77ba9c`, on `validation/bigint-writer-source-authority-runtime-20260912` — BIGINT writer source-authority correction; prior Independent Validation PASS, Independent Review NOT YET PERFORMED, NOT INTEGRATED, NOT CLOSED.
- **Current documentation review record**: `623eaf94328a5145adf62aaff52c6b23689d4efe` — `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77`, recording the closed BIGINT Writer/Digest/Output Representation Tier C documentation lifecycle. This record is not an Independent Review of runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882`.

## Current Project Position

-   Current Phase: Phase 2
-   Current Version: MVP v0.2
-   Current Branch: `main`
-   Evidence Foundation P0 bounded finalization writer and test hardening completed as bounded milestones.
-   Evidence Foundation overall remains incomplete.
-   VI empirical pilot has not started.
-   B-5 (approval-provenance scope) and B-4 (cost/operational stop conditions) governance prerequisites are complete as bounded documentation prerequisites (main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`).
-   B-1 (assignment/session lifecycle writer) is complete as a bounded VI Empirical Pilot P1 implementation prerequisite, composed of B-1a (evidence session lifecycle writer, main `d785abfc74a669cbc472ff24df9869874a165ecb`) and B-1b (SCORABLE assignment completion writer, main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`; canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This does not activate VI Empirical Pilot P1.
-   B-2 (Vietnamese pilot content manifest) is complete as a bounded VI Empirical Pilot P1 implementation/data prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node Grammar Node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`). This does not activate VI Empirical Pilot P1.
-   Runtime Foundation B1 RAW_SOURCE rebuild is an accepted, independently reviewed, main-integrated, post-merge validated, review-recorded, and closed bounded milestone (runtime main `6bb2bccd5abef2d10839706ffdd000285b59512d`; review-record `c224ff9cca5b28f96febca0e11a89608ef746a1d`; closure sync `bd64555ad30e5901467095e1d81002de433a02f8`).
-   METRIC_RESULT / Retention v1 runtime is an accepted, independently reviewed, main-integrated, post-merge validated, review-recorded, and closed bounded milestone (runtime main `22508147625090af84af141ac0ec574792369115`; review-record `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9`; closure `c4e452d762d70fa57db61856b37b04a16d43df92`).
-   METRIC_RESULT / Unseen Transfer v2 Tier C documentation is review-recorded and closed, while its runtime remains NOT AUTHORIZED / NOT IMPLEMENTED / NOT VALIDATED.
-   BIGINT Writer/Digest/Output Representation Tier C documentation is review-recorded and closed; the separate BIGINT writer source-authority runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` is PREPARED and has prior Independent Validation PASS, but Independent Review is NOT YET PERFORMED and the candidate is NOT INTEGRATED / NOT CLOSED.

## Last Completed Bounded Milestone

**BIGINT Writer/Digest/Output Representation Tier C documentation lifecycle** — the D1–D5 canonical clarification is integrated on main (`a8fc4d072bc1c3e070e0828794838db8e4c5d0c5`), review-recorded in `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision `1.77` (`623eaf94328a5145adf62aaff52c6b23689d4efe`), and closed by the subsequent status closure (`041a384e6221dd267ac0725704c6706bafd36513`). Canonical context is API `1.31` / Schema `1.10`. This documentation closure did not implement or validate the writer correction and did not close `F-R02`.

Prior bounded milestone, preserved: METRIC_RESULT / Retention v1 runtime — runtime main `22508147625090af84af141ac0ec574792369115`, post-merge Windows-local PostgreSQL 17.10 validation PASS, review-record `3fa4cb4b424d601f9eec3a97d8500c0a7a0e65f9`, bounded closure `c4e452d762d70fa57db61856b37b04a16d43df92`.

Prior bounded milestone, preserved: Runtime Foundation B1 RAW_SOURCE rebuild — runtime main `6bb2bccd5abef2d10839706ffdd000285b59512d`, post-merge Windows-local PostgreSQL 17.10 validation PASS, review-record `c224ff9cca5b28f96febca0e11a89608ef746a1d`, bounded closure sync `bd64555ad30e5901467095e1d81002de433a02f8`.

Prior bounded milestone, preserved: B-2 pilot content manifest prerequisite completion — B-2 (Vietnamese pilot content manifest) is complete as a bounded VI Empirical Pilot P1 implementation/data prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node Grammar Node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`, review-record `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.48), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`, review-record revision 1.49), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`, review-record revision 1.50), reconciled by the B-2 completion ledger reconciliation (review-record revision 1.51). This does not declare Evidence Foundation overall complete, does not resolve B-3, and does not activate VI Empirical Pilot P1. See `VALIDATION_STATUS.md` §A.8 for the full evidence chain.

Prior bounded milestone, preserved: B-1 lifecycle prerequisite completion — B-1a (evidence session lifecycle writer: `startSession`/`terminalizeSession`/`restartSession`; main implementation `d785abfc74a669cbc472ff24df9869874a165ecb`, review-record main `08c6e0ca1c771398ae89f1d467e2bef4386eece3`) and B-1b (SCORABLE assignment completion writer; runtime implementation main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, runtime review-record main `ad0f892f6a4238eeb6ecf2581d21deaf82b87956`, canonical status-sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`, status-sync review-record main `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964`), together completing B-1 as a bounded VI Empirical Pilot P1 implementation prerequisite.

Prior bounded milestone, preserved: Evidence Foundation P0 bounded finalization writer (`674bd9fb46bd1d799293c0e73984672b57c8a98c`) and its independent test-hardening review (`30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`, verdict APPROVE WITH NON-BLOCKING NOTES, preserved finding F-L01 non-blocking).

## Last Completed Governance Milestone

**B-5/B-4 Governance Prerequisite Reconciliation** — classification: documentation-only governance milestone, complete.

B-5 (candidate `d75b518c01724059b45f6adc1a93b602c86a69c4`, main `37eb97a295df10bfd4d48ab06e13be20c85c3beb`) and B-4 (candidate `542c6b5004bbffed570aefcb1a3a858655206bb7`, main `4305eb4a3ccf294f9f35efb4a3ef1574e9c8e143`) are each complete as bounded pre-activation governance/documentation prerequisites. Their independent review record (candidate `ca31ff6486a22780aa7aedf44c3c00b8aefb26b2`, main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.41) recorded verdict **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 2 (G-N01, G-N02), **ELIGIBLE**. This milestone does not implement, close, or validate any Architecture, API, Schema, or Validation Rule, and does not activate VI Empirical Pilot P1.

## Current Active Milestone

The BIGINT writer source-authority runtime prerequisite is at `IMPLEMENTATION CANDIDATE PREPARED / PRIOR INDEPENDENT VALIDATION PASS / INDEPENDENT REVIEW PENDING`. Exact candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` is not on main and is not closed. No implementation, review, or integration is performed by this status synchronization.

## Remaining Blocking-Gap Sequence

VI Empirical Pilot P1 activation remains gated on the following implementation/data prerequisites, in addition to the completed governance prerequisites above.

**Completed:**

- **B-1** — assignment/session lifecycle writer required for pilot evidence execution (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §7, §8, §24.2). Complete as a bounded prerequisite (B-1a main `d785abfc74a669cbc472ff24df9869874a165ecb`; B-1b main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This completion does not activate VI Empirical Pilot P1.

- **B-2** — Vietnamese pilot content manifest (see `VI_EMPIRICAL_PILOT_SPEC.md` §3, §5, §6; `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §15, §24.2). Complete as a bounded prerequisite, composed of four recorded and main-integrated sub-components: exact 18-node inclusion/exclusion manifest and exact six pilot-scenario manifest (main `b955facad49fa1daf217b88f93174682ef04eb1b`), exact versioned lexical manifest with source/provenance/license verification (main `7f1e00a3d714bcfb96e2bc386bff0ff4acda27dc`), and exact item/item-family manifest (main `6ab85ee173b94441d95fdb6bbed8fad380f17f9a`). This completion does not activate VI Empirical Pilot P1.

**Remaining blocker — no implementation has started:**

- **B-3** — human-data/privacy owner decision required before participant data collection (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §19, §24.3; `VI_EMPIRICAL_PILOT_SPEC.md` §15). B-3 decision owner designation (identity annotation only, not a `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §20.2 Parameter-register entry or edit, and not a parameter decision): the B-3 human-data/privacy decision owner is designated as 미노 (project decision owner); this designation alone does not resolve any B-3 policy parameter — all remain UNRESOLVED — does not authorize human-data collection (NOT AUTHORIZED), and does not activate VI Empirical Pilot P1 (NOT STARTED / NOT ACTIVATED / STILL NOT ELIGIBLE TO ACTIVATE).

VI Empirical Pilot P1 remains gated on B-3 alone; it is still not eligible to activate.

## Next Action

After this three-file status synchronization is separately reviewed and integrated, the sole project Next Action is a fresh, read-only Independent Review of exact candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` against parent `2034d1a01e58a36762750156df1fd63c8e77ba9c` on branch `validation/bigint-writer-source-authority-runtime-20260912`.

That Independent Review is not performed in this session. This status-sync candidate does not authorize the review on main before the status sync itself is independently reviewed and integrated.

## Explicit Non-Declarations

This document does not declare:

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
- BIGINT runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` independently reviewed
- BIGINT runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` integrated to main
- BIGINT runtime candidate `303e1af9aa2c32167e7caf66527b5020bbacf882` lifecycle closed

Accordingly: BIGINT Independent Review is NOT YET PERFORMED; the BIGINT candidate is NOT INTEGRATED and NOT CLOSED; P1 remains NOT ACTIVATED; human-data collection remains NOT AUTHORIZED; efficacy remains NOT VERIFIED.

## Historical Roadmap Snapshot — §9 Closure

The following subsections preserve the prior-session §9 closure snapshot of this index unchanged, moved here under their original numbers/content so their facts are not lost. Current project position, milestone, and non-declaration status live in the sections above.

### Historical Validation State (at §9 closure)

Validation Level 3 §9 is **PASS**. The current verified implementation baseline is `83b3fa56f6c56d34cdb07e26162749bb0744f6f5`; post-merge GitHub Actions run `29874075409` passed 191 tests / 40 suites on PostgreSQL 16.14 / Node.js 20.20.2. See `VALIDATION_STATUS.md` for the authoritative acceptance mapping and full evidence chain.

### Historical Architecture Status (at §9 closure)

Architecture Frozen (approved architecture only)

### Historical Completed Closure (at §9 closure)

-   Independent Architecture Audit remediation
    -   AUD-002 (MASTERED/AUTOMATIC Temporal Stability Contract) — ✅ CLOSED
    -   AUD-003 (Graph cross-language relation traversal) — ✅ CLOSED
    -   AUD-001 (GitHub main current/historical status reconciliation) — ✅ CLOSED
    -   AUD-004 (Review Cascade producer and `record_attempt` atomicity) — ✅ CLOSED
-   Architecture Clarification prerequisite implementation
    -   AC-013 (Active-Node Admission Boundary, Progress-side prerequisite) — ✅ CLOSED
    -   AC-012 (§9 Conversation Boundary) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-014 (Learning Flow prerequisite clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-015 (Interleaving Graph metadata dependency clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
    -   AC-016 (`start_session` exact output payload clarification) — ✅ Architecture Clarification RESOLVED / Prerequisite Implementation CLOSED
-   Validation Level 3 §9 Conversation Boundary — ✅ PASS
-   Main contains no temporary PostgreSQL validation workflow. Validation branches are retained as evidence:
    -   `vl3-section9-client-boundary-validation-20260721` at `3e7edb637f13444a51c2d181e3ac9fb7f6e57ff7`
    -   `vl3-section9-postmerge-validation-20260722` at `18a028fbf2e88aaea05e66ab450c18127691e8b3`

### Historical Known Deferred (at §9 closure)

-   Real LLM Validation
-   Conversation Engine implementation and actual UI binding remain outside Validation Level 3 §9 scope

### Historical Current Blockers (at §9 closure)

None

### Historical Current Milestone (at §9 closure)

Validation Level 3 §10 — AI Generation Validation

### Historical Next Task (at §9 closure)

1.  Execute Validation Level 3 §10 AI Generation validation.

`VALIDATION_LEVEL3.md` §10 is the next incomplete canonical milestone after §9. This closure does not start §10, create a new phase/engine/feature name, or make a Beta Release decision.

## Rule

New architectural decisions require explicit approval before
implementation.
