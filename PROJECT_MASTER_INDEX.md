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

- **Ledger snapshot baseline**: `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964` — the commit this reconciliation ledger was written against.
- **Current GitHub Main**: `GitHub refs/heads/main` is the authority for current repository HEAD. No hard-coded SHA in this document replaces that ref.
- **Current B-1 runtime-validated implementation**: `f6c0d1b0cb388403f2a8e636e359a099128dd8f0` — B-1b assignment completion writer, the latest B-1 runtime implementation (B-1a runtime implementation: `d785abfc74a669cbc472ff24df9869874a165ecb`). Detailed environment and figures are owned by `VALIDATION_STATUS.md`.
- **Production finalization implementation**: `674bd9fb46bd1d799293c0e73984672b57c8a98c` — the commit that implemented the Evidence Foundation P0 bounded finalization writer.
- **Independent review target**: `30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f` — the reviewed test-hardening commit (APPROVE WITH NON-BLOCKING NOTES; see `VALIDATION_STATUS.md` §A.3).
- **Current documentation review record**: `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964` — `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.46 (B-1b canonical status sync independent review and main integration record).

## Current Project Position

-   Current Phase: Phase 2
-   Current Version: MVP v0.2
-   Current Branch: `main`
-   Evidence Foundation P0 bounded finalization writer and test hardening completed as bounded milestones.
-   Evidence Foundation overall remains incomplete.
-   VI empirical pilot has not started.
-   B-5 (approval-provenance scope) and B-4 (cost/operational stop conditions) governance prerequisites are complete as bounded documentation prerequisites (main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`).
-   B-1 (assignment/session lifecycle writer) is complete as a bounded VI Empirical Pilot P1 implementation prerequisite, composed of B-1a (evidence session lifecycle writer, main `d785abfc74a669cbc472ff24df9869874a165ecb`) and B-1b (SCORABLE assignment completion writer, main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`; canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This does not activate VI Empirical Pilot P1.

## Last Completed Bounded Milestone

**B-1 lifecycle prerequisite completion** — B-1a (evidence session lifecycle writer: `startSession`/`terminalizeSession`/`restartSession`; main implementation `d785abfc74a669cbc472ff24df9869874a165ecb`, review-record main `08c6e0ca1c771398ae89f1d467e2bef4386eece3`) and B-1b (SCORABLE assignment completion writer; runtime implementation main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, runtime review-record main `ad0f892f6a4238eeb6ecf2581d21deaf82b87956`, canonical status-sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`, status-sync review-record main `2a9d2487067bd0892e8f7e8c51c7dbfb00a60964`) are each complete, together completing B-1 as a bounded VI Empirical Pilot P1 implementation prerequisite. This does not declare Evidence Foundation overall complete and does not activate VI Empirical Pilot P1. See `VALIDATION_STATUS.md` §A for the full evidence chain.

Prior bounded milestone, preserved: Evidence Foundation P0 bounded finalization writer (`674bd9fb46bd1d799293c0e73984672b57c8a98c`) and its independent test-hardening review (`30db1b98fc8ec02f4b9f91def0d4c4577c0bbf0f`, verdict APPROVE WITH NON-BLOCKING NOTES, preserved finding F-L01 non-blocking).

## Last Completed Governance Milestone

**B-5/B-4 Governance Prerequisite Reconciliation** — classification: documentation-only governance milestone, complete.

B-5 (candidate `d75b518c01724059b45f6adc1a93b602c86a69c4`, main `37eb97a295df10bfd4d48ab06e13be20c85c3beb`) and B-4 (candidate `542c6b5004bbffed570aefcb1a3a858655206bb7`, main `4305eb4a3ccf294f9f35efb4a3ef1574e9c8e143`) are each complete as bounded pre-activation governance/documentation prerequisites. Their independent review record (candidate `ca31ff6486a22780aa7aedf44c3c00b8aefb26b2`, main `e60b2fc7c88fd0d3173adc94a541b4b19dcc98c8`, `ARCHITECTURE_CLARIFICATION_BACKLOG.md` revision 1.41) recorded verdict **APPROVE WITH NON-BLOCKING NOTES**, BLOCKER/HIGH/MEDIUM/LOW 0, NOTE 2 (G-N01, G-N02), **ELIGIBLE**. This milestone does not implement, close, or validate any Architecture, API, Schema, or Validation Rule, and does not activate VI Empirical Pilot P1.

## Current Active Milestone

None. No governance or implementation milestone is currently in progress. The next candidate is VI Empirical Pilot P1 Readiness, below, additionally gated on the remaining blocking-gap sequence.

## Remaining Blocking-Gap Sequence

VI Empirical Pilot P1 activation remains gated on the following implementation/data prerequisites, in addition to the completed governance prerequisites above.

**Completed:**

- **B-1** — assignment/session lifecycle writer required for pilot evidence execution (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §7, §8, §24.2). Complete as a bounded prerequisite (B-1a main `d785abfc74a669cbc472ff24df9869874a165ecb`; B-1b main `f6c0d1b0cb388403f2a8e636e359a099128dd8f0`, canonical status sync main `3fb3f0c8d325336310e1c1d82fa75458e7670f79`). This completion does not activate VI Empirical Pilot P1.

**Remaining blockers — no implementation has started on either of these:**

- **B-2** — Vietnamese pilot content manifest / exact 12–20 grammar-node inclusion set required (see `VI_EMPIRICAL_PILOT_SPEC.md` §3, §5, §6; `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §15, §24.2).
- **B-3** — human-data/privacy owner decision required before participant data collection (see `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` §19, §24.3; `VI_EMPIRICAL_PILOT_SPEC.md` §15).

VI Empirical Pilot P1 remains gated on B-2 and B-3; it is still not eligible to activate.

## Next Product Milestone Candidate

**VI Empirical Pilot P1 Readiness**

Activation: not started; not activated; Control Tower gate required, and additionally gated on B-2/B-3 above (B-1 is now complete but does not by itself activate P1). This is a candidate only and is not an active milestone.

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
