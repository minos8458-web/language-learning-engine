# LLE Current State

> **BOOTSTRAPPED AT MAIN `e2011da19ee0a08582a52c43aa9cdefbf8ee613b`**
>
> Bootstrap date: `2026-08-29`. This records the first Current State
> baseline and does not imply that historical Current State entries existed.

## 1. Purpose and Authority Boundary

This file is the compact operational status ledger for LLE. It records the
currently accepted repository baseline, milestone state, pinned evidence,
open findings, lifecycle boundaries, and exactly one next action. It is not
a duplicate of `ARCHITECTURE_CLARIFICATION_BACKLOG.md` and does not silently
create or change a canonical contract.

Authority precedence, highest first:

1. Latest explicit user approval
2. Approved Tier A canonical authority
3. Approved Tier C clarification/backlog authority
4. Exact remote Git `main` and commit-pinned evidence

This ledger does not supersede the canonical documents, detailed backlog, or
specialized project-status authorities. If it conflicts with applicable
canonical authority or exact remote Git evidence, operational status is
`BLOCKED` until the conflict is explicitly reconciled.

## 2. Repository Bootstrap Baseline

- Repository: `minos8458-web/language-learning-engine`
- Default branch: `main`
- Observed pre-bootstrap `origin/main`: `e2011da19ee0a08582a52c43aa9cdefbf8ee613b`
- Tree: `e420dbfda7403717390b3933b89fb014a5d49ff6`
- Parent: `66c4b68ec81e5cf8eeb550b2ff269518de5b008c`
- Subject: `Record VI P1 raw source rebuild documentation review`

## 3. Backlog Baseline

- File: `ARCHITECTURE_CLARIFICATION_BACKLOG.md`
- Latest revision: `1.71`
- Blob: `b3332d9601ff490a8271f48779acd29cf6798004`
- Revision `1.69`: present exactly once
- Revision `1.70`: present exactly once
- Revision `1.71`: present exactly once
- Revision `1.72`: absent

Revision `1.69` (prior B1 RAW SOURCE Rebuild CORE canonical documentation
lifecycle), revision `1.70` (B1 `empty_result` clarification lifecycle),
and revision `1.71` (A1/B1 assignment-less closure canonical synchronization
review-record lifecycle) are distinct lifecycle records; none supersedes
another. The detailed revision 1.69, 1.70, and 1.71 lifecycle records remain
in the backlog and are not duplicated here.

## 4. Current Milestone

- Milestone: VI P1 Measurement Readiness — Runtime Foundation B1 Raw Source
  Rebuild CORE canonical documentation contract
- State: `REVIEW-RECORDED / CANONICAL ON MAIN / POST-MERGE VERIFIED`
- Lifecycle scope: documentation only
- Runtime Foundation B1 implementation:
  `IMPLEMENTED AS CORRECTION VALIDATION CANDIDATE / DEVELOPMENT-SESSION
  POSTGRESQL EVIDENCE COMPLETE / FRESH INDEPENDENT REVIEW PENDING / NOT
  ELIGIBLE FOR MAIN INTEGRATION`
  (see "Runtime Foundation B1 Correction Candidate — Development Session"
  below; not yet on main)
- `queryRawEvidenceForMetricRebuild(pool, input)` runtime:
  `PRESENT ON VALIDATION BRANCH / ABSENT ON MAIN`
- Previous Foundation A item-exposure/item-lineage state:
  `REVIEW-RECORDED / CANONICAL IMPLEMENTATION ON MAIN / POST-MERGE VERIFIED`
- Foundation A backlog revision: `1.68`

### Active B1 Contract Clarification

- Clarification: RAW_SOURCE `empty_result` exact payload
- User approval: `APPROVED`
- Exact payload: `{ status: "empty", data: null }`
- Applies to:
  - all-primary-empty
  - valid disjoint ancestry
  - secondary-filter zero-root
  - cutoff zero-root
- Unknown validly-shaped reference: remains `INVALID_ID`
- `{ status: "empty", data: [] }`: not allowed for this operation
- Canonical synchronization candidate: `CREATED AND PUSHED`
- Review-eligible validation branch:
  `validation/vi-p1-raw-source-empty-result-contract-recovery-20260830`
- Original reviewed candidate: `83192d866e091bc93a477408215bfa704477a555`
- Original candidate parent: `0205080a288b7ec077ed69a4ee0d1efe915b8cc8`
- Original candidate API: revision history ends at `1.25`,
  blob `2780cb1a22f5b6ce7ead62072e32202d2a047e22` (`1.26` row absent)
- Original candidate Schema: revision `1.6`,
  blob `7ceadd43a2ea37ba288ab0d348c5014a7eef8ac8`
- Original Independent Review verdict: `REQUEST CORRECTION`
- Finding totals at original review: BLOCKER `0`; HIGH `1`; MEDIUM `0`;
  LOW `0`; NOTE `1`
- `F-ER-01` (HIGH): `CLOSED BY FRESH RE-REVIEW`.
  Original candidate API blob `2780cb1a22f5b6ce7ead62072e32202d2a047e22`
  revision history ended at `1.25`; a `1.26` row was absent. The B1
  `empty_result` payload body itself matched the approved exact contract.
  Correction was implemented as a separate correction commit
  `5a1cd99485c542f2d760056cad77297c03fe88a2` (parent
  `83192d866e091bc93a477408215bfa704477a555`), additively adding exactly one
  revision `1.26` row to `API_CONTRACT.md` §14; original candidate
  `83192d866e091bc93a477408215bfa704477a555` was not amended. A fresh Claude
  Opus 5 Independent Review of the corrected tip confirmed API revision
  `1.25` present exactly once, `1.26` present exactly once immediately
  following `1.25`, `1.27` absent, the correction exactly `+1/-0`, and no
  amend/rewrite of the original candidate; approved `empty_result` contract
  fidelity `PASS`. `F-ER-01` is `CLOSED`.
- Correction commit: `5a1cd99485c542f2d760056cad77297c03fe88a2`
- Correction parent: `83192d866e091bc93a477408215bfa704477a555`
- Current corrected validation tip: `5a1cd99485c542f2d760056cad77297c03fe88a2`
- Corrected candidate tree: `d2dd797ced2b38a075e676375daa3a9eab9f0477`
- Corrected API: revision `1.26`,
  blob `0367eb3b6e526164012a1aef16b8ec3bbe4328fe`
- Schema (unchanged by correction): revision `1.6`,
  blob `7ceadd43a2ea37ba288ab0d348c5014a7eef8ac8`
- Fresh re-review of corrected tip: `APPROVE WITH NON-BLOCKING NOTES`
- Re-review correction required: `NO`
- Re-review owner value required: `NO`
- `F-ER-02` (NOTE): Current State stale candidate tip/API blob pin follow-up:
  `UPDATED TO CORRECTED TIP/BLOB`. A fresh Claude Opus 5 Independent Review
  confirmed Current State was updated to the corrected tip/tree/API
  revision/blob exactly, with no premature closure declaration made ahead of
  re-review. `F-ER-02` is `CLOSED BY FRESH RE-REVIEW`, scoped exactly to this
  ledger-pin follow-up finding; this closure does not mean the B1
  `empty_result` clarification as a whole is `CLOSED`.
- `F-ERR-01` (NOTE): pre-existing §7 (Provider, Mock, and Independent Review
  Status) wording — `Original B1 review`, `Corrected-tip re-review`,
  `Main-integration eligibility`, and `Final B1 documentation lifecycle` —
  refers to the prior B1 RAW SOURCE CORE contract cycle without a qualifier
  distinguishing it from this in-progress B1 `empty_result` clarification
  cycle, creating a surface risk of confusion between the two. Pre-existing
  wording issue, not introduced by this candidate. Correction required:
  `NO`. Main-integration impact: `NON-BLOCKING`. Owner value required: `NO`.
  This Current State update records `F-ERR-01` as `OPEN NOTE`; §7 wording
  itself is not opportunistically edited in this update. A future dedicated
  ledger clarification may add a qualifier identifying §7 as referring to
  the CORE contract cycle.
- Candidate lifecycle:
  `INDEPENDENTLY RE-REVIEWED / INTEGRATED ON MAIN`
- Main integration: `COMPLETE`
- MAIN_PICK_1 (`Clarify B1 raw source empty result payload`):
  `337143445398f6a76dfc4c9bf40c9311613f5232`
- MAIN_PICK_1 parent: `cc07816207c693aeebacc4d4414635667d555691`
- MAIN_PICK_2 (`Add B1 raw source empty result API revision record`):
  `adfab3ecb1958643be251fd4de7957738bb9d033`
- MAIN_PICK_2 parent: MAIN_PICK_1
- Integrated main `API_CONTRACT.md`: revision `1.26`,
  blob `0367eb3b6e526164012a1aef16b8ec3bbe4328fe`
- Integrated main `EVIDENCE_FOUNDATION_P0_SCHEMA.md`: revision `1.6`,
  blob `7ceadd43a2ea37ba288ab0d348c5014a7eef8ac8`
- This documentation-only main-integration step:
  - PostgreSQL: `NOT RUN — NOT REQUIRED FOR THIS DOCUMENTATION-ONLY
    INTEGRATION STEP`
  - Tests: `NOT RUN — NOT REQUIRED FOR THIS DOCUMENTATION-ONLY INTEGRATION
    STEP`
  - The existing backlog revision `1.69` PostgreSQL/test evidence in
    section 6 is prior CORE-contract evidence and is not restated here as
    post-integration evidence for this `empty_result` clarification.
- Runtime Foundation B1:
  `IMPLEMENTED AS VALIDATION CANDIDATE / INDEPENDENT REVIEW REQUEST
  CORRECTION`
  (see "Runtime Foundation B1 Validation Candidate" below; not yet on main)
- `queryRawEvidenceForMetricRebuild(pool, input)` runtime:
  `PRESENT ON VALIDATION BRANCH / ABSENT ON MAIN`
- Runtime Foundation B1 development:
  `CANDIDATE IMPLEMENTED / INDEPENDENT REVIEW REQUEST CORRECTION /
  ARCHITECTURE DECISION USER-APPROVED (A1/B1) / CANONICAL SYNCHRONIZATION
  IMPLEMENTED AS VALIDATION CANDIDATE / INDEPENDENT REVIEW APPROVE WITH
  NON-BLOCKING NOTES / INTEGRATED ON MAIN / POST-INTEGRATION DOCUMENT
  VERIFICATION PASS / REVIEW-RECORDED / RUNTIME CODE NOT ELIGIBLE
  FOR MAIN INTEGRATION`
- A1/B1 canonical synchronization review-record revision: `1.71`
- A1/B1 canonical synchronization review-record commit:
  `2499d63a316268bd1f1463a5bafd9a8dc5c02925`
- A1/B1 canonical synchronization review-record backlog blob:
  `b3332d9601ff490a8271f48779acd29cf6798004`
- Canonical clarification:
  `REVIEW-RECORDED / CANONICAL ON MAIN`
- Review-record revision: `1.70`
- Review-record commit: `1d76c6c8521b02d570e0db6e99fb2ed539fe4b85`
- Review-record backlog blob: `a798ba0c2acfa72375e5407ce4d5a265929a2ef9`
- Superseded local-only candidate: `98b6e412ccad6311d2dc22e070597a8b5edaa03d`
  - Status: `LOCAL-ONLY / SUPERSEDED / NOT REVIEW-ELIGIBLE / NOT PUSHED`
  - Review authority: corrected validation tip
    `5a1cd99485c542f2d760056cad77297c03fe88a2` only

### Review-Record Commit Metadata Process Note

Review-record commit `1d76c6c8521b02d570e0db6e99fb2ed539fe4b85` (subject
`Record B1 empty result clarification review`) carries, after the exact
required subject line, execution-environment attribution trailers
(`Co-Authored-By` and `Claude-Session`) despite the task-local instruction
that had required no separate trailers. Classification:
`NON-BLOCKING PROCESS DEVIATION / COMMIT METADATA ONLY / NO FILE OR
CANONICAL CONTENT IMPACT / NO HISTORY REWRITE`. This does not invalidate
backlog revision `1.70`, does not resolve `F-ERR-01`, and does not create a
new canonical finding. Commit `1d76c6c8521b02d570e0db6e99fb2ed539fe4b85` was
not amended, rebased, reset, or force-pushed to remove the trailers.

### Runtime Foundation B1 Validation Candidate

- Runtime Foundation B1:
  `IMPLEMENTED AS VALIDATION CANDIDATE / INDEPENDENT REVIEW REQUEST
  CORRECTION`
- Validation branch: `validation/vi-p1-raw-source-core-runtime-20260902`
- Candidate SHA: `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb`
- Candidate parent: `4641956f50954ac59b39daa8119fbb4d3ebede95`
- Candidate tree: `df2d2e38176cc09e41856f6a04a38bf6b65ab5d4`
- Candidate subject: `Implement VI P1 raw source rebuild runtime`
- Operation implemented: `queryRawEvidenceForMetricRebuild(pool, input)`
- Runtime status: `PRESENT ON VALIDATION BRANCH / ABSENT ON MAIN`
- Exact changed files (three-file scope):
  - NEW `src/instrumentation/evidenceMetrics.js` —
    blob `afa7f310a1845b891d59f653817c66c0d5b0f049`
  - MODIFY `src/instrumentation/index.js` —
    blob `14577b90cc19fe10de27d7c1afe0373679e105e9`
  - NEW `tests/viP1RawSourceRuntime.test.js` —
    blob `2ba38e44e3d9926e74d0c5b84a3a02ae72cfc5d4`
- Migration: `001–013 unchanged / 014 absent`. No migration 014.
- Main runtime: unchanged — candidate exists only on the validation branch;
  `origin/main` does not contain the candidate commit.
- Implemented against canonical: `API_CONTRACT.md` §13.10.11.1 revision
  `1.26`, `EVIDENCE_FOUNDATION_P0_SCHEMA.md` §12.3 revision `1.6`.
- Key implemented boundaries reported by Development (implementation-session
  claims pending fresh Independent Review, not independently confirmed by
  this update):
  - exact 4-key top-level input
  - exact seven required filter arrays
  - structured condition/item-family references
  - canonical targetTimepoint vocabulary
  - FORMULA existence-only boundary
  - supplied-reference existence validation before empty determination
  - physical ancestry root filtering
  - secondary predicates prune assignment/root branches
  - enrollment/assignment/attempt closure
  - no sibling attempt expansion when attemptIds nonempty
  - no same-participant cross-enrollment expansion
  - analysisCutoff source-time filtering
  - no fabricated historical lifecycle state
  - exact `{ status: "empty", data: null }`
  - unknown validly-shaped reference remains `INVALID_ID`
  - nine rawFacts collections
  - five sourceRebuildReference arrays
  - exact snake_case physical projections
  - BIGINT retained as exact decimal strings
  - deterministic PostgreSQL ordering
  - one REPEATABLE READ READ ONLY transaction
  - zero intended write side effects
  - no migration

#### Development-Session PostgreSQL Execution Evidence

Classification: `DEVELOPMENT-SESSION EXECUTION EVIDENCE`, not Independent
Validation and not an Independent Review `PASS`.

- PostgreSQL: `17.10 x86_64-windows`
- Isolated database: `lle_test_vip1_b1_20260902`
- `current_database()` confirmed exact isolated DB
- Migrations: `001–013 applied`, `013` exactly once, `014` absent
- New runtime test: `49` tests, `49` pass, `0` fail/cancelled/skipped/todo
- Focused actual-PostgreSQL run: `193` tests, `193` pass,
  `0` fail/cancelled/skipped/todo — dbPool healthcheck, migration
  regression, Evidence Foundation migration, Evidence Foundation
  repository, VI P1 item-lineage runtime, VI P1 raw-source runtime
- Full regression: `423` tests, `55` suites, `423` pass,
  `0` fail/cancelled/skipped/todo
- Schema evidence: `schema_migrations` = `001–013` only, migration `013`
  exactly once, migration `014` absent, Evidence tables = `17`, no Runtime
  B1 schema mutation
- Zero-side-effect Development evidence: read-only transaction checks;
  relevant before/after row counts unchanged; empty-result path unchanged;
  validation-error path unchanged
- Temporary database cleanup: `DROP completed`, isolated DB absent
  afterward; `lle_dev` not used as destructive test target
- These Development results are not `VALIDATED` and are not an Independent
  Review `PASS`.

#### Process Deviation — Local-Main Commit + Forbidden Reset Recovery

Development was instructed to create the fresh validation branch before the
implementation commit. Instead, after implementation/testing it accidentally
committed candidate `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb` onto local
`main`. It discovered the error before any push. Recovery performed:
(1) created `validation/vi-p1-raw-source-core-runtime-20260902` pointing to
the candidate commit; (2) used `git reset --hard origin/main` to restore
local main to `4641956f50954ac59b39daa8119fbb4d3ebede95`; (3) switched to
the validation branch; (4) pushed only the validation branch. Observed
final facts: remote main was never modified by the candidate; final
`origin/main` remains `4641956f50954ac59b39daa8119fbb4d3ebede95`; the
validation candidate's parent is exactly that main SHA; candidate history
is one commit; candidate content/tree remains intact. However,
`git reset --hard` was explicitly forbidden by the Development task-local
instructions.

Classification: `PROCESS DEVIATION / LOCAL BRANCH-LIFECYCLE RECOVERY /
REMOTE MAIN UNAFFECTED / INDEPENDENTLY REVIEWED — GOVERNANCE DISPOSITION
NON-BLOCKING`. This Current State update does not silently normalize this
deviation away and does not claim it did not occur; it is preserved as a
historical process deviation, and no history rewrite is required or was
performed.

- Candidate commit metadata: subject line followed by execution-environment
  attribution trailers (`Co-Authored-By`, `Claude-Session`), recorded here
  as execution metadata only, not as a product/runtime finding.
- Independent Review: `COMPLETE — REQUEST CORRECTION` (see "Fresh
  Independent Review Result — Request Correction" immediately below)

#### Fresh Independent Review Result — Request Correction

- Reviewer: fresh Claude Opus 5 Independent Review
- Repository mutation caused by this review: `0`
- Independent PostgreSQL rerun: `NOT RUN`
- Development-session PostgreSQL execution evidence remains classified:
  `DEVELOPMENT-SESSION EXECUTION EVIDENCE ONLY` — not upgraded to
  Independent Validation by this review.
- Final verdict: `REQUEST CORRECTION`
- Code/test correction required: `YES`
- Architecture decision required: `YES`
- Owner value required: `NO`
- Process governance disposition: `NON-BLOCKING`
- Main-integration eligibility: `NOT ELIGIBLE`
- Integration: `PROHIBITED UNTIL ARCHITECTURE DECISION + CORRECTION +
  FRESH RE-REVIEW`

##### New Findings — Severity Totals

BLOCKER `0`; HIGH `2`; MEDIUM `3`; LOW `1`; NOTE `2`. Total `8`.

- `F-RB1-01` (HIGH) — `selectQualifyingAssignments()`: the `attemptIds`
  root-qualification `EXISTS` query has no
  `evidence_attempts.started_at <= analysisCutoff` predicate. A supplied
  attempt that exists but falls after cutoff passes existence validation
  yet can still qualify its owning assignment's root, producing a
  non-empty RAW_SOURCE bundle where canonical expects
  `{ status: "empty", data: null }`. Correction required: `YES`.
  Architecture value required: `NO`. Main-integration impact: `BLOCKING`.
- `F-RB1-02` (HIGH) — `fetchSnapshots()` / `fetchSnapshotNodes()`:
  canonical source-time authority is snapshot `created_at` for a snapshot
  and the owning snapshot's timestamp for a snapshot node, but the
  candidate applies no cutoff predicate on the snapshot/node itself,
  relying instead on the qualifying assignment's `created_at`. No
  CHECK/trigger/generated-column in schema guarantees assignment
  `created_at` and snapshot `created_at` coincide; the reviewer confirmed a
  fixture with pre-cutoff assignment `created_at` and post-cutoff snapshot
  `created_at` still passes green. Correction required: `YES`. Architecture
  value required: `NO`. Main-integration impact: `BLOCKING`.
- `F-RB1-03` (MEDIUM) — `selectAssignmentlessBonusEnrollmentIds()`: the
  assignment-less `NOT EXISTS` check has no cutoff condition and looks at
  all currently-existing assignments, so the same cutoff query can flip an
  enrollment's raw fact from present to empty solely because an assignment
  was created after cutoff. Canonical ambiguity: whether "assignment가
  하나도 없고" is evaluated as-of `analysisCutoff` or as-of-read. Correction
  required: `YES, or as Architecture clarification determines`.
  Architecture decision: `RECOMMENDED`. Main-integration impact:
  `BLOCKING until resolved/corrected`.
  Architecture ambiguity update: `RESOLVED BY USER-APPROVED DECISION B1`
  (assignment absence for the assignment-less enrollment special case is
  evaluated as-of `analysisCutoff`; only assignments whose authoritative
  `evidence_assignments.created_at <= analysisCutoff` count). Finding
  status remains `OPEN`: canonical synchronization, runtime/test
  correction, and a fresh Independent Review are still required before
  closure.
- `F-RB1-04` (MEDIUM) — `runBounded()` / `assignmentLevelSecondaryEmpty`:
  canonical wording does not explicitly decide whether
  `conditionReferences` (an owning-enrollment-condition filter) counts as
  an assignment-level secondary filter for the assignment-less enrollment
  path. Example: enrollment `E1` with condition `C@1`, zero assignments,
  and `conditionReferences = [C@1]` — canonical does not currently
  determine whether the expected result is the enrollment fact or
  `empty_result`. Correction required: `ARCHITECTURE DECISION DEPENDENT`.
  Architecture decision required: `YES`. Owner value required: `NO`.
  Main-integration impact: `BLOCKING`.
  Architecture ambiguity update: `RESOLVED BY USER-APPROVED DECISION A1`
  (`conditionReferences` IS included in the assignment-level secondary
  filter set for the assignment-less enrollment special case; if
  `conditionReferences` is nonempty and no qualifying assignment exists,
  the special case does not return the enrollment raw fact — result
  `{ status: "empty", data: null }` — even when the selected enrollment
  itself owns/matches the supplied condition reference). Finding status
  remains `OPEN`: canonical synchronization, runtime/test correction, and
  a fresh Independent Review are still required before closure.
- `F-RB1-05` (MEDIUM) — `validateAnalysisCutoff()`: `new Date(value)` can
  interpret a datetime string with no timezone offset as server-local
  time, where canonical requires a canonical UTC timestamp string
  (`YYYY-MM-DDTHH:mm:ss.sssZ`); the same input could normalize to a
  different cutoff on a UTC vs. a KST server. Correction required: `YES`.
  Architecture value required: `NO`. Main-integration impact: `BLOCKING`.
- `F-RB1-06` (LOW) — default `.sort()` uses UTF-16 code-unit ordering;
  canonical requires codepoint ordering of string IDs. No practical effect
  on current ASCII-only asset IDs; theoretical only for non-BMP stable
  IDs. Correction required: `NO`. Main-integration impact:
  `NONE / NON-BLOCKING`.
- `F-RB1-07` (NOTE) — T48 `sourceRebuildReference` oracle re-derives the
  implementation's own `.map()` computation for comparison, giving it weak
  independent verification power. Correction required: `NO`. Improvement
  recommended only.
- `F-RB1-08` (NOTE) — the all-primary-empty unrestricted-scan guard
  depends on a single JS early guard with no defense-in-depth backstop. No
  current contract violation; flagged as a future-refactor fragility
  observation only. Correction required: `NO`.

##### Test Quality Findings

Review confirmed exactly `49` candidate tests. Missing/weak predicates to
address in the correction lifecycle as applicable:

- Q13: post-cutoff supplied-attempt fixture absent.
- Q14: snapshot / snapshot-node own-cutoff-authority fixture absent.
- Q12-conditionReferences: assignment-less enrollment +
  `conditionReferences` boundary fixture absent.
- T48: `sourceRebuildReference` oracle weak/tautological (see `F-RB1-07`).

##### Process Governance Assessment (G01–G08)

Independent Review assessed the local-main-commit /
`git reset --hard origin/main` process deviation described above against
G01–G08. Disposition: `NON-BLOCKING`. Reviewer-recorded reasons: candidate
bytes/tree unchanged; candidate parent unchanged; remote main unaffected;
candidate history not rewritten; unauthorized files not mixed in; the
final candidate remains a faithful one-commit child of the approved
baseline; content-addressed Git objects preserve an auditable
chain-of-custody; no clean re-materialization is required solely because
of this deviation. This disposition does not mean the deviation did not
occur — it remains recorded above as a historical process deviation, and
no history rewrite is required or was performed.

#### Architecture Decision — User-Approved (A1 / B1) and Tier C Patch

- Latest explicit user approval (highest-precedence per §1):
  `A1/B1 및 제안된 Tier C canonical patch를 승인`.
- Decision A = `A1`: for assignment-less enrollment special-case semantics,
  `conditionReferences` IS included in the "assignment-level secondary
  filter" set. Therefore, if `conditionReferences` is nonempty and no
  qualifying assignment exists, the assignment-less enrollment special case
  does not return the enrollment raw fact; result
  `{ status: "empty", data: null }`. This remains true even when the
  selected enrollment itself owns/matches the supplied condition reference.
- Decision B = `B1`: assignment absence for the assignment-less enrollment
  special case is evaluated as-of `analysisCutoff`. Only assignments whose
  authoritative `evidence_assignments.created_at <= analysisCutoff` count
  when deciding whether the enrollment has an assignment for that special
  case. An assignment created after `analysisCutoff` must not change the
  result of the same cutoff-bounded RAW_SOURCE query. Not historical
  reconstruction of mutable lifecycle columns.
- Architecture decision status: `USER-APPROVED`.
- Tier C canonical patch status: `USER-APPROVED / IMPLEMENTED AS VALIDATION
  CANDIDATE / INDEPENDENT REVIEW APPROVE WITH NON-BLOCKING NOTES /
  INTEGRATED ON MAIN / POST-INTEGRATION DOCUMENT VERIFICATION PASS /
  REVIEW-RECORDED`. Canonical patch required: `YES` (satisfied by
  main-integration commit below).
- Review-record revision: `1.71`.
- Review-record commit: `2499d63a316268bd1f1463a5bafd9a8dc5c02925`.
- Review-record backlog blob: `b3332d9601ff490a8271f48779acd29cf6798004`.
- Approved target canonical files: `API_CONTRACT.md`,
  `EVIDENCE_FOUNDATION_P0_SCHEMA.md`.
- Current revisions on `main` (post-integration): `API_CONTRACT.md` `1.27`,
  blob `db38091928b0164a45c44c7ed10c28bc47b17b79`;
  `EVIDENCE_FOUNDATION_P0_SCHEMA.md` `1.7`,
  blob `ea55989eba1c5441e0cea68257f718b80453e8fb`.
- Main integration commit: `87084ff90cbf38e4cb6a9df8146a7b7030c3eba6`
  (parent `ac65bfaab5093d903a8d3a968f47af970849eee1`), a normal cherry-pick
  of candidate `a38db1fc05a260ad21564929d753345a2ef9c8f0` with no rebase,
  amend, squash, or force-push.
- The exact patch content/placement is the Architecture DRAFT approved by
  the user, implemented verbatim as a validation candidate (see
  "Canonical Synchronization Validation Candidate" below) and now
  integrated onto `main` by normal cherry-pick with post-integration
  document verification `PASS`.
- Owner value required: `NO`. Tier A impact: `NO`. Database migration:
  `NO`. Schema DDL: `NO`. Migration `014`: `NOT AUTHORIZED / ABSENT`.
  Runtime correction implementation: `NOT STARTED`. P1 activation:
  `NOT AUTHORIZED`. Human-data authorization: `NO`. Provider/audio
  authorization: `NO`.
- This canonical-patch integration does not mean: `F-RB1-03` closed;
  `F-RB1-04` closed; `F-CS-01` closed; Runtime Foundation B1 validated;
  Runtime Foundation B1 correction started or implemented; or Runtime B1
  code main-integration eligibility restored. Runtime B1 code
  main-integration eligibility remains `NOT ELIGIBLE`. The dedicated
  review-record step (appending this lifecycle to
  `ARCHITECTURE_CLARIFICATION_BACKLOG.md` as revision `1.71`, commit
  `2499d63a316268bd1f1463a5bafd9a8dc5c02925`) is now `COMPLETE`. Runtime B1
  correction remains `NOT STARTED` and does not begin before a fresh Codex
  read-only pre-analysis returns to Control Tower (see Next Action).

#### Canonical Synchronization Validation Candidate

- Canonical synchronization: `USER-APPROVED / IMPLEMENTED AS VALIDATION
  CANDIDATE / INDEPENDENT REVIEW APPROVE WITH NON-BLOCKING NOTES /
  INTEGRATED ON MAIN / POST-INTEGRATION DOCUMENT VERIFICATION PASS /
  REVIEW-RECORDED` (review-record revision `1.71`, commit
  `2499d63a316268bd1f1463a5bafd9a8dc5c02925`).
- Validation branch:
  `validation/vi-p1-raw-source-closure-semantics-20260905`.
- Candidate SHA: `a38db1fc05a260ad21564929d753345a2ef9c8f0`.
- Candidate parent: `221710526bd354237c9e5b996bc260ca83b52682`.
- Candidate tree: `cce25844617fe34de405b60cda595e88aae47b4b`.
- Candidate subject: `Clarify Runtime B1 assignment-less closure semantics`.
- Candidate scope: implements the already user-approved A1/B1 canonical
  clarification only.
- Exact changed files (two-file scope, no other file):
  - `API_CONTRACT.md` — revision `1.27`,
    blob `db38091928b0164a45c44c7ed10c28bc47b17b79`
  - `EVIDENCE_FOUNDATION_P0_SCHEMA.md` — revision `1.7`,
    blob `ea55989eba1c5441e0cea68257f718b80453e8fb`
- Patch boundary: `API_CONTRACT.md` §13.10.11.1 Closure gains exactly two
  additive A1/B1 clarification paragraphs plus exactly one new `1.27`
  revision-history row; `EVIDENCE_FOUNDATION_P0_SCHEMA.md` §12.2 gains the
  exact mirror clarification plus exactly one new `1.7` revision-history
  row. No deletion or rewrite of existing approved canonical behavior.
- Documentation-only candidate evidence:
  - PostgreSQL: `NOT RUN — DOCUMENTATION-ONLY REVIEW`
  - Tests: `NOT RUN — DOCUMENTATION-ONLY REVIEW`
- Main integration: `COMPLETE` via normal `git cherry-pick`, no rebase/
  amend/squash/force-push.
  - Main integration commit: `87084ff90cbf38e4cb6a9df8146a7b7030c3eba6`
  - Main integration parent: `ac65bfaab5093d903a8d3a968f47af970849eee1`
  - Integration commit subject:
    `Clarify Runtime B1 assignment-less closure semantics`
  - Files changed by integration commit (exactly two): `API_CONTRACT.md`,
    `EVIDENCE_FOUNDATION_P0_SCHEMA.md`
- Main canonical state (post-integration): `API_CONTRACT.md` revision
  `1.27`, blob `db38091928b0164a45c44c7ed10c28bc47b17b79`;
  `EVIDENCE_FOUNDATION_P0_SCHEMA.md` revision `1.7`, blob
  `ea55989eba1c5441e0cea68257f718b80453e8fb`.
- Post-integration documentation-only evidence:
  - PostgreSQL: `NOT RUN — NOT REQUIRED FOR THIS DOCUMENTATION-ONLY
    INTEGRATION`
  - Tests: `NOT RUN — NOT REQUIRED FOR THIS DOCUMENTATION-ONLY
    INTEGRATION`
- Post-integration document verification (remote `origin/main`, after
  push): candidate/main byte-equivalence for both files `PASS`; API
  revision `1.27` present exactly once, `1.28` absent; Schema revision
  `1.7` present exactly once, `1.8` absent; `git diff HEAD^ HEAD --check`
  `PASS`; runtime candidate branch
  (`validation/vi-p1-raw-source-core-runtime-20260902`,
  `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb`) unchanged; canonical
  validation branch
  (`validation/vi-p1-raw-source-closure-semantics-20260905`,
  `a38db1fc05a260ad21564929d753345a2ef9c8f0`) unchanged; backlog unchanged
  at revision `1.70`; migration `014` absent.

##### Fresh Independent Review Result — Approve With Non-Blocking Notes

- Reviewer: fresh Claude Opus 5 Independent Review.
- Repository mutation caused by this review: `0`.
- Final verdict: `APPROVE WITH NON-BLOCKING NOTES`.
- Summary judgments: CANDIDATE IDENTITY GATE `PASS`; USER-APPROVED A1
  FIDELITY `PASS`; USER-APPROVED B1 FIDELITY `PASS`; API/SCHEMA
  SYNCHRONIZATION `PASS`; REVISION-HISTORY GATE `PASS`; SCOPE/NON-CHANGE
  GATE `PASS`; CODE/RUNTIME AUTHORIZATION LEAK `NO`.
- Correction required: `NO`. Owner value required: `NO`.
- Main-integration eligibility for this canonical patch: `ELIGIBLE` — not
  yet integrated; integration is the recorded Next Action.
- PostgreSQL: `NOT RUN — DOCUMENTATION-ONLY REVIEW`.
- Tests: `NOT RUN — DOCUMENTATION-ONLY REVIEW`. `NOT RUN` is not
  reinterpreted as `PASS`.
- Reviewed semantics confirmed exactly:
  - A1: for assignment-less enrollment behavior, the four secondary
    predicates are exactly `conditionReferences`, `targetTimepoints`,
    `nodeIds`, `itemFamilyReferences`; `conditionReferences` is included
    despite its owning-enrollment physical filter authority; nonempty
    `conditionReferences` with no qualifying assignment yields
    `{ status: "empty", data: null }`.
  - B1: assignment existence/absence for the special closure rule is
    evaluated by `evidence_assignments.created_at <= analysisCutoff`;
    post-cutoff assignments do not alter the same cutoff-bounded result;
    this remains separate from transaction-visible as-of-read mutable
    lifecycle projection.
- Cross-document/scope result confirmed: API revision `1.27` `PASS`;
  Schema revision `1.7` `PASS`; API/Schema semantic identity `PASS`;
  candidate changed exactly two files `PASS`; deletion `0`; runtime/test/
  db/migration change `0`; migration `014` `ABSENT / NOT AUTHORIZED`;
  Tier A impact `NO`; P1/human-data/provider/audio authorization `NO`.
- Current-main drift confirmed exactly `LLE_CURRENT_STATE.md`; candidate
  canonical files and current-main drift are disjoint; candidate assessed
  eligible for a clean cherry-pick through the approved
  Validation/Integration lifecycle (not performed by this review).
- `F-CS-01` (NOTE) — `API_CONTRACT.md` §13.10.11.1 Closure, candidate-added
  B1 paragraph: the phrase "위 Raw-source cutoff boundary와 동일하게" refers
  directionally ("위" = "above") to the `Raw-source cutoff boundary` block,
  which in fact appears later in the same section, making the directional
  reference document-positionally inaccurate. Semantic impact: `NONE` —
  the same sentence explicitly states the authoritative rule
  `evidence_assignments.created_at <= analysisCutoff`, so A1/B1 semantics
  and API/Schema runtime behavior remain unambiguous. Correction required:
  `NO`. Owner value required: `NO`. Main-integration impact:
  `NON-BLOCKING`. Status: `OPEN / NON-BLOCKING`. Not corrected in this
  candidate and no correction commit was created for it. Future cleanup
  recommendation only: change the directional reference to a
  section-neutral reference (e.g. "Raw-source cutoff boundary와 동일하게")
  or an exact section reference during a future dedicated canonical
  cleanup.
- Runtime Foundation B1 validation candidate
  (`validation/vi-p1-raw-source-core-runtime-20260902`,
  `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb`): unmodified by this review.
  Runtime correction remains `NOT STARTED`.
- This record does not mean: `F-RB1-03` closed; `F-RB1-04` closed;
  `F-CS-01` closed; Runtime Foundation B1 validated or closed; Runtime B1
  correction started or implemented; Runtime B1 code main-integration
  eligibility restored; or the required review-record step (appending this
  lifecycle to `ARCHITECTURE_CLARIFICATION_BACKLOG.md`) already performed.
  The canonical documentation patch is now integrated on main with
  post-integration document verification `PASS`; Runtime B1 correction
  does not begin before the review-record step above is completed.

#### Runtime Foundation B1 Correction Pre-Analysis — Fresh Codex Read-Only

- Role: fresh Codex read-only correction pre-analysis (not Independent
  Review, not Development, not code/test authorship).
- Repository mutation caused by this pre-analysis: `0`.
- Final verdict: `READY FOR DEVELOPMENT CORRECTION`.
- Drift record: TARGET CODE DRIFT `NONE`; TARGET TEST DRIFT `NONE`;
  DEPENDENCY DRIFT `NONE`; CANONICAL DRIFT `EXPECTED — API 1.27 /
  Schema 1.7` (canonical advanced from `1.26`/`1.6`, the revisions the
  original candidate was implemented against, to `1.27`/`1.7` via the
  user-approved A1/B1 canonical synchronization; this is expected drift,
  not an unplanned regression).
- Architecture decision required: `NO`. Owner value required: `NO`.
  Migration required: `NO`. Schema DDL required: `NO`. Canonical doc
  change required: `NO`.
- Runtime correction required: `YES`. Test correction/addition required:
  `YES`.
- `F-RB1-04` runtime code change required: `NO` — the candidate's
  `assignmentLevelSecondaryEmpty` already includes all four predicates
  (`conditionReferences`, `targetTimepoints`, `nodeIds`,
  `itemFamilyReferences`); the required correction is an independent
  fixture/oracle only, not a runtime code delta.
- `F-RB1-06`, `F-RB1-07`, `F-RB1-08` (LOW/NOTE): not included in the
  approved correction scope; preserved non-blocking, unchanged by this
  pre-analysis.
- `F-CS-01` (NOTE): not included in the approved correction scope;
  preserved non-blocking, unchanged by this pre-analysis.
- No finding is closed by this pre-analysis. `F-RB1-01` through
  `F-RB1-05` remain `OPEN`; `F-RB1-06`, `F-RB1-07`, `F-RB1-08`, and
  `F-CS-01` remain `OPEN / NON-BLOCKING`.

##### Approved Correction Scope

Correction-required findings: `F-RB1-01` (HIGH), `F-RB1-02` (HIGH),
`F-RB1-03` (MEDIUM), `F-RB1-04` (MEDIUM, test-only), `F-RB1-05` (MEDIUM).

- `F-RB1-01`: `selectQualifyingAssignments()` supplied-attempt root
  qualification must additionally apply
  `att.started_at <= analysisCutoff`; global supplied-reference existence
  validation is unchanged. A valid, existing, post-cutoff supplied attempt
  must pass existence validation, qualify zero roots, and yield exactly
  `{ status: "empty", data: null }`.
- `F-RB1-02`: required boundaries — (1) `fetchSnapshots()`:
  `snapshot.created_at <= analysisCutoff`; (2) `fetchSnapshotNodes()`:
  owning snapshot timestamp `<= analysisCutoff`; (3) `nodeIds` root
  qualification: the matching node's owning snapshot must be
  cutoff-eligible; (4) `itemFamilyReferences` root qualification: the
  matching snapshot must be cutoff-eligible. Not fetch-only.
  `assignment.created_at` must not be assumed equivalent to
  `snapshot.created_at`.
- `F-RB1-03`: `selectAssignmentlessBonusEnrollmentIds()`
  assignment-existence test uses
  `evidence_assignments.created_at <= analysisCutoff`; a strictly
  post-cutoff assignment must not suppress the assignment-less enrollment
  raw fact.
- `F-RB1-04`: runtime code delta `NONE` (see above). Required correction
  evidence is an independent fixture/oracle proving zero-assignment
  enrollment plus matching nonempty `conditionReferences` yields exactly
  `{ status: "empty", data: null }`.
- `F-RB1-05`: `analysisCutoff` accepted lexical form must be exactly
  `YYYY-MM-DDTHH:mm:ss.sssZ`. Required behavior: omitted/undefined →
  `MISSING_REQUIRED_FIELD`; null/non-string → `CONTRACT_VIOLATION`;
  timezone-less string → `OUT_OF_RANGE_VALUE`; timezone-offset string
  (e.g. `+09:00`) → `OUT_OF_RANGE_VALUE`; `Z` string without milliseconds
  → `OUT_OF_RANGE_VALUE`; malformed/impossible/non-normalizable timestamp
  → `OUT_OF_RANGE_VALUE`. Implementation direction: operation-local strict
  canonical pattern, plus a valid-`Date` check, plus an exact
  `parsed.toISOString() === value` round-trip. No new error code.

Preserved non-blocking (not in correction scope): `F-RB1-06` (LOW),
`F-RB1-07` (NOTE), `F-RB1-08` (NOTE), `F-CS-01` (NOTE).

##### Branch Strategy

- Recommended branch strategy: `A`.
- Required future Development branch:
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905`,
  created from the then-current exact `main`
  (`e586eaf32e5af9a5cd46d1f94c86bdb957429b72`) if `main` remains unchanged
  at Development preflight.
  Confirmed at this pre-analysis update: the target branch name is absent
  both locally and on `origin` (verified via `git ls-remote`).
- Commit sequence: COMMIT 1 = exact replay of the original reviewed
  Runtime candidate `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb` onto
  current canonical `main`, reproducing the exact original three-file
  runtime/test content. COMMIT 2 = a separate correction commit. No
  amend, rebase, squash, fixup, or history rewrite of either commit or of
  the original validation branch, which remains untouched. Current API
  `1.27` / Schema `1.7` authority is inherited from the new branch's
  parent.
- Expected file scope — replay/baseline commit:
  `src/instrumentation/evidenceMetrics.js`,
  `src/instrumentation/index.js`, `tests/viP1RawSourceRuntime.test.js`.
  Correction commit (two files only):
  `src/instrumentation/evidenceMetrics.js`,
  `tests/viP1RawSourceRuntime.test.js`. `src/instrumentation/index.js`
  correction change: `NO`. The correction commit must not touch
  `API_CONTRACT.md`, `EVIDENCE_FOUNDATION_P0_SCHEMA.md`,
  `ARCHITECTURE_CLARIFICATION_BACKLOG.md`, `LLE_CURRENT_STATE.md`, `db/**`,
  migration `014`, `package*.json`, or `.github/**`.

##### Minimum Test Plan — Planned, Not Executed

Codex proposed exactly seven new test blocks plus modification of existing
timestamp validation tests. Recorded as `PLANNED / NOT EXECUTED`:

- `T-C01`: post-cutoff supplied attempt → existence valid → exact
  `empty_result`.
- `T-C02`: pre-cutoff assignment + post-cutoff snapshot → snapshot
  excluded.
- `T-C03`: post-cutoff owning snapshot → snapshot nodes excluded.
- `T-C03N`: `nodeIds` root matching only a post-cutoff snapshot → exact
  `empty_result`.
- `T-C03F`: `itemFamilyReferences` root matching only a post-cutoff
  snapshot → exact `empty_result`.
- `T-C04`: assignment-less enrollment + matching nonempty
  `conditionReferences` → exact `empty_result`.
- `T-C05`: assignment exists strictly after cutoff → does not suppress
  the cutoff-time assignment-less enrollment fact.
- Timestamp validation (modification of existing tests): exact canonical
  `.sssZ` accepted; no-millisecond `Z` rejected; timezone-less rejected;
  offset form rejected; impossible date rejected; malformed rejected;
  omitted/null/non-string existing errors preserved; validation happens
  before DB connection where applicable.
- Independent oracles must use fixed fixture values / direct fixture
  facts, not values derived from returned bundle transformations.

Expected counts if implemented exactly (expected only, `NOT EXECUTION
EVIDENCE`, not recorded as `PASS`): Runtime suite `56`; focused six-suite
regression `200`; full repository regression `430`.

##### Future Execution Requirements

Development must use actual Windows-local PostgreSQL `17.10`, an isolated
synthetic test DB only, migrations `001–013` (`014` absent/prohibited),
and must run, after the correction commit: the corrected Runtime B1
suite; dbPool healthcheck; migrations regression; Evidence Foundation
migration regression; Evidence Foundation repository regression; VI P1
item-lineage runtime regression; full repository regression;
zero-side-effect checks; and temp DB cleanup confirmation. `lle_dev` must
not be used as a destructive test target. No expected test count may be
recorded as `PASS` before execution.

##### Current Lifecycle After Pre-Analysis

- Runtime Foundation B1: `IMPLEMENTED AS VALIDATION CANDIDATE /
  INDEPENDENT REVIEW REQUEST CORRECTION / CORRECTION PRE-ANALYSIS
  COMPLETE / DEVELOPMENT CORRECTION READY / NOT ELIGIBLE FOR MAIN
  INTEGRATION`.
- Runtime correction: `NOT STARTED`.
- Original Runtime candidate: `PRESERVED` (unmodified; not amended,
  rebased, or rewritten).
- Canonical: `API 1.27 / Schema 1.7 / REVIEW-RECORDED ON MAIN`.
- This pre-analysis does not mean: Runtime correction implemented;
  Runtime B1 validated or closed; `F-RB1-01`/`02`/`03`/`04`/`05` closed;
  `F-RB1-06`/`07`/`08` closed; `F-CS-01` closed; `B-3` resolved; P1
  eligible or activated; human-data collection authorized; efficacy
  verified; GitHub Actions `PASS`; Validation Level 3 §10 overall `PASS`;
  or actual provider/audio authorized.

#### Runtime Foundation B1 Correction Candidate — Development Session

- Role: Development-session correction implementation and PostgreSQL
  execution (not Independent Review, not Independent Validation).
- Classification: `DEVELOPMENT CORRECTION VALIDATION CANDIDATE` /
  `DEVELOPMENT-SESSION EXECUTION EVIDENCE` only.
- Correction branch:
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905`.
- Branch base: `ea22d6f8276dba6d27843bbf2fa34171fe9ab941`.

##### Replay Commit

- `RUNTIME_B1_REPLAY_SHA`: `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7`.
- Parent: `ea22d6f8276dba6d27843bbf2fa34171fe9ab941`.
- Tree: `5a97e917e85eeecc25022ea414e37a9b7a06bd32`.
- Subject: `Implement VI P1 raw source rebuild runtime`.
- Replay exact files/blobs (byte-faithful to the original reviewed
  candidate `acc8cca8b879e74c8f8dd02b1bf091fb601e1fdb`):
  - `src/instrumentation/evidenceMetrics.js` —
    blob `afa7f310a1845b891d59f653817c66c0d5b0f049`
  - `src/instrumentation/index.js` —
    blob `14577b90cc19fe10de27d7c1afe0373679e105e9`
  - `tests/viP1RawSourceRuntime.test.js` —
    blob `2ba38e44e3d9926e74d0c5b84a3a02ae72cfc5d4`

##### Correction Commit

- `RUNTIME_B1_CORRECTION_SHA`: `357ac80058ce3feab0565d5ed995927ef2207a77`.
- Parent: `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7`.
- Tree: `e15479e510d8da2daf236c3c3be6dce421f718d5`.
- Subject: `Correct Runtime B1 cutoff semantics`.
- Exact changed files (two-file scope, no other file):
  - `src/instrumentation/evidenceMetrics.js` —
    blob `2ecf3c9a80b1c5e3fb38aedf1a8d3beaf70ee53a`
  - `tests/viP1RawSourceRuntime.test.js` —
    blob `aa7da66c4a812c8d30d45823dbc69f466a739f6d`
- `src/instrumentation/index.js` remains unchanged by the correction —
  blob `14577b90cc19fe10de27d7c1afe0373679e105e9`. No correction change to
  `index.js`.

##### Implemented Correction Scope

- `F-RB1-01`: `IMPLEMENTED AS CORRECTION CANDIDATE`.
  `selectQualifyingAssignments()` supplied-attempt root qualification now
  additionally requires `att.started_at <= analysisCutoff`; global
  supplied-reference existence validation is unchanged.
- `F-RB1-02`: `IMPLEMENTED AS CORRECTION CANDIDATE`. Correction includes
  `nodeIds` root-qualification owning-snapshot cutoff, `itemFamilyReferences`
  root-qualification snapshot cutoff, `fetchSnapshots()` snapshot
  `created_at` cutoff, `fetchSnapshotNodes()` owning-snapshot-timestamp
  cutoff, and `runBounded()` `analysisCutoff` plumbing to all of the above.
  Snapshot-node projection remains node-only.
- `F-RB1-03`: `IMPLEMENTED AS CORRECTION CANDIDATE`.
  `selectAssignmentlessBonusEnrollmentIds()` now evaluates assignment
  existence as-of `evidence_assignments.created_at <= analysisCutoff`.
- `F-RB1-04`: `TEST EVIDENCE ADDED`. Runtime code change: `NONE`. An
  independent A1 fixture was added; runtime code was not changed for this
  finding.
- `F-RB1-05`: `IMPLEMENTED AS CORRECTION CANDIDATE`. `analysisCutoff` now
  requires the exact canonical form `YYYY-MM-DDTHH:mm:ss.sssZ`, enforced by
  strict lexical validation plus a valid-`Date` check plus an exact
  `parsed.toISOString() === value` round-trip. No new error code.

Preserved non-blocking, not touched by this correction: `F-RB1-06`
(OPEN / NON-BLOCKING), `F-RB1-07` (OPEN / NON-BLOCKING), `F-RB1-08`
(OPEN / NON-BLOCKING), `F-CS-01` (OPEN / NON-BLOCKING). None is marked
`CLOSED` by this update.

##### Development-Session PostgreSQL Execution Evidence

Classification: `DEVELOPMENT-SESSION EXECUTION EVIDENCE`, not Independent
Validation and not an Independent Review `PASS`.

- Execution environment: Windows 11, Windows-local repository, PostgreSQL
  `17.10`, Windows `npm`.
- Isolated database: `lle_test_vip1_b1_correction_20260905_91640`.
- Migrations: `001–013 applied`, `013` exactly once, `014` absent.
- Evidence tables: `17`.
- Runtime B1 suite: `56` tests, `56` pass, `0` fail/cancelled/skipped/todo.
  Command: `npm.cmd test -- tests/viP1RawSourceRuntime.test.js`.
- Focused regression: `200` tests, `200` pass, `0` fail. Command:
  `npm.cmd test -- tests/dbPool.healthcheck.test.js
  tests/migrations.test.js tests/evidenceFoundationMigration.test.js
  tests/evidenceFoundationRepository.test.js
  tests/viP1ItemLineageRuntime.test.js tests/viP1RawSourceRuntime.test.js`.
- Full repository regression: `430` tests, `55` suites, `430` pass, `0`
  fail/cancelled/skipped/todo, duration `16809.7ms`. Command:
  `npm.cmd test`.
- Zero-side-effect evidence: T44 `REPEATABLE READ READ ONLY` / zero write
  statement `PASS`; T45–T47 nonempty/empty/validation-error row-count
  invariance `PASS`; `progress`/`attempt_records` counts remained `0` after
  query tests.
- Temporary database: `DROPPED`; drop-absence verification `PASS`.
- `lle_dev` destructive-use: `NO`.
- These Development-session results are not `VALIDATED`, are not
  `Independent Validation`, and are not an Independent Review `PASS`.

##### Current Lifecycle After Development Correction

- Runtime Foundation B1: `IMPLEMENTED AS CORRECTION VALIDATION CANDIDATE /
  DEVELOPMENT-SESSION POSTGRESQL EVIDENCE COMPLETE / FRESH INDEPENDENT
  REVIEW PENDING / NOT ELIGIBLE FOR MAIN INTEGRATION`.
- Correction branch:
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905`.
- Replay: `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7`.
- Correction: `357ac80058ce3feab0565d5ed995927ef2207a77`.
- Correction tree: `e15479e510d8da2daf236c3c3be6dce421f718d5`.
- Runtime on main: `ABSENT`.
- Main integration: `NOT ELIGIBLE`.
- Independent Review: `PENDING`.
- This update does not mean: Runtime Foundation B1 `VALIDATED`, `CLOSED`,
  `CANONICAL RUNTIME ON MAIN`, or `POST-MERGE VERIFIED`; any of
  `F-RB1-01`–`F-RB1-05` closed; `F-RB1-06`/`07`/`08` or `F-CS-01` closed;
  `B-3` resolved; P1 eligible or activated; human-data collection
  authorized; efficacy verified; GitHub Actions `PASS`; Validation Level 3
  §10 overall `PASS`; or actual provider/audio authorized.

## 5. Validation Branch and Canonical Artifacts

- Validation branch:
  `validation/vi-p1-raw-source-core-contract-20260829`
- Original documentation candidate:
  `d047bb835980da8c2ff2e539ffbc24e0814cbd21`
- Separate correction and current validation tip:
  `f982f6faee8f89aa6734e36377e95b1fb32a01a7`
- Main integration:
  - `63507f0baa7140efbab87df4a432402f6d01bed7`
  - `66c4b68ec81e5cf8eeb550b2ff269518de5b008c`
- Review-record:
  `e2011da19ee0a08582a52c43aa9cdefbf8ee613b`

| Document | Revision | Current blob |
|---|---:|---|
| `API_CONTRACT.md` | 1.25 | `a22ad66394db8868010c5e1a0e02ca97b79c5965` |
| `EVIDENCE_FOUNDATION_P0_SCHEMA.md` | 1.5 | `3ef82da1d4fd287571c3b6a91b7a9fc7c127e37d` |
| `VI_EMPIRICAL_EVIDENCE_CONTRACT.md` | blob-pinned | `4bec3687e7a6f352330ba878a93f3055837aaf5d` |
| `VI_EMPIRICAL_PILOT_SPEC.md` | blob-pinned | `7ae5812bc59233525ed9c2d9b2a6798123d000ca` |

## 6. Latest Actual Runtime Evidence

Evidence source: B1 post-merge evidence recorded in backlog revision `1.69`.
This bootstrap does not rerun PostgreSQL or tests.

- PostgreSQL server: `17.10`
- Isolated database: `lle_pm_b1_raw_source_20260829104004_939`
- Focused results:
  - dbPool: `2/2 PASS`
  - migrations: `14/14 PASS`
  - Evidence migration: `24/24 PASS`
- Full regression:
  - suites: `54`
  - tests: `374`
  - pass: `374`
  - fail: `0`
  - cancelled: `0`
  - skipped: `0`
  - todo: `0`
- Schema:
  - repository migrations: `001–013`
  - `schema_migrations`: `13`
  - migration `014`: absent
  - Evidence tables: `17`
- Temporary database cleanup: `PASS`
- `lle_dev`: untouched

## 7. Provider, Mock, and Independent Review Status

- Mock: existing first Mock composition only; it is not actual-provider
  evidence.
- Actual provider: incomplete and not authorized.
- Audio/raw-audio path: not authorized.
- Original B1 review: `REQUEST CORRECTION`.
- Corrected-tip re-review: `APPROVE WITH NON-BLOCKING NOTES`.
- Correction required after re-review: `NO`.
- Owner value required: `NO`.
- Main-integration eligibility: `ELIGIBLE`.
- Final B1 documentation lifecycle:
  `REVIEW-RECORDED / CANONICAL ON MAIN / POST-MERGE VERIFIED`.

## 8. Open Findings

- B1 review blockers: BLOCKER `0`; HIGH `0`.
- B1 non-blocking findings `F-B1-08–F-B1-26`:
  MEDIUM `2`; LOW `6`; NOTE `11`.
- `F-B1-25` remains OPEN: pre-existing stale Schema §5.9.1
  migration-012/16-table wording. It is not resolved by this bootstrap.
- Foundation A findings remain OPEN/non-blocking:
  `F-R02`, `F-N01`, and `F-R03–F-R13`.
- Product activation dependency `B-3` remains `UNRESOLVED`.
- `F-ERR-01` NOTE: §7's pre-existing unqualified B1 lifecycle wording may be
  confused with the current `empty_result` clarification cycle. Correction
  required `NO`; main-integration impact `NON-BLOCKING`; owner value
  required `NO`.
- Runtime Foundation B1 fresh Independent Review new findings: BLOCKER `0`;
  HIGH `2` (`F-RB1-01`, `F-RB1-02`); MEDIUM `3` (`F-RB1-03`, `F-RB1-04`,
  `F-RB1-05`); LOW `1` (`F-RB1-06`); NOTE `2` (`F-RB1-07`, `F-RB1-08`).
  Total `8`. All eight are `OPEN`; none are closed by this update.
  `F-RB1-01`, `F-RB1-02`, `F-RB1-03` (until resolved/corrected), `F-RB1-04`,
  and `F-RB1-05` are `BLOCKING` for main integration; `F-RB1-06`,
  `F-RB1-07`, and `F-RB1-08` are `NON-BLOCKING`. The Architecture decision
  for `F-RB1-04` (Decision A = `A1`) and for the as-of-cutoff/as-of-read
  interpretation underlying `F-RB1-03` (Decision B = `B1`) has now been
  made and is `USER-APPROVED` (see "Architecture Decision — User-Approved
  (A1 / B1) and Tier C Patch" above); both findings remain `OPEN` pending
  canonical synchronization, runtime/test correction, and a fresh
  Independent Review.
- Architecture decision for `F-RB1-03`/`F-RB1-04`: `USER-APPROVED`
  (Decision A = `A1`, Decision B = `B1`). Tier C canonical patch:
  `USER-APPROVED / IMPLEMENTED AS VALIDATION CANDIDATE / INDEPENDENT
  REVIEW APPROVE WITH NON-BLOCKING NOTES / INTEGRATED ON MAIN /
  POST-INTEGRATION DOCUMENT VERIFICATION PASS / REVIEW-RECORDED`
  (review-record revision `1.71`, commit
  `2499d63a316268bd1f1463a5bafd9a8dc5c02925`, backlog blob
  `b3332d9601ff490a8271f48779acd29cf6798004`),
  candidate `a38db1fc05a260ad21564929d753345a2ef9c8f0`, integrated as main
  commit `87084ff90cbf38e4cb6a9df8146a7b7030c3eba6` (parent
  `ac65bfaab5093d903a8d3a968f47af970849eee1`) (see "Canonical
  Synchronization Validation Candidate" above), main revisions API
  `1.27` / Schema `1.7`. Integration does not close `F-RB1-03` or
  `F-RB1-04` (both remain `OPEN`) and does not restore Runtime Foundation
  B1 code main-integration eligibility, which remains `NOT ELIGIBLE`.
  - `F-RB1-03`: Architecture ambiguity `RESOLVED BY USER-APPROVED B1`.
    Canonical synchronization: `INTEGRATED ON MAIN`. Finding: `OPEN`.
    Runtime/test correction still required.
  - `F-RB1-04`: Architecture ambiguity `RESOLVED BY USER-APPROVED A1`.
    Canonical synchronization: `INTEGRATED ON MAIN`. Finding: `OPEN`.
    Runtime/test correction still required.
- `F-CS-01` (NOTE): `API_CONTRACT.md` §13.10.11.1 Closure candidate-added
  B1 paragraph uses the directional reference "위 Raw-source cutoff
  boundary와 동일하게" to point at a block that in fact appears later in
  the same section. Semantic impact `NONE` (the authoritative rule
  `evidence_assignments.created_at <= analysisCutoff` is stated explicitly
  in the same sentence). Correction required `NO`; owner value required
  `NO`; main-integration impact `NON-BLOCKING`. Status: `OPEN /
  NON-BLOCKING`. Not corrected in the candidate, and not corrected by this
  main-integration step — the candidate was integrated verbatim by normal
  cherry-pick with no content modification, no manual conflict resolution,
  and no extra cleanup commit. `F-CS-01` remains `OPEN / NON-BLOCKING` on
  main.
- Runtime Foundation B1 process deviation (local-main commit + forbidden
  `git reset --hard origin/main` recovery): governance disposition
  `NON-BLOCKING` per fresh Independent Review, preserved as a historical
  process deviation, not marked as not having occurred.
- Runtime Foundation B1 correction pre-analysis (fresh Codex read-only,
  repository mutation `0`): verdict `READY FOR DEVELOPMENT CORRECTION`.
  Correction-required findings `F-RB1-01`, `F-RB1-02`, `F-RB1-03`,
  `F-RB1-04` (test-only, no runtime code delta), `F-RB1-05` remain `OPEN`;
  none is closed by this pre-analysis. `F-RB1-06`, `F-RB1-07`, `F-RB1-08`,
  and `F-CS-01` remain `OPEN / NON-BLOCKING` and are excluded from the
  approved correction scope. See "Runtime Foundation B1 Correction
  Pre-Analysis — Fresh Codex Read-Only" above for the full drift record,
  approved correction scope, branch strategy, minimum test plan, and
  future execution requirements. Runtime correction remains `NOT STARTED`.
- Runtime Foundation B1 correction candidate (Development session,
  correction branch
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905`,
  replay `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7`, correction
  `357ac80058ce3feab0565d5ed995927ef2207a77`): `F-RB1-01`, `F-RB1-02`,
  `F-RB1-03`, and `F-RB1-05` `IMPLEMENTED AS CORRECTION CANDIDATE`;
  `F-RB1-04` `TEST EVIDENCE ADDED / RUNTIME CODE CHANGE NONE`. All five
  remain `OPEN` — none is closed by this update. Development-session
  PostgreSQL execution evidence (Runtime suite `56/56`, focused regression
  `200/200`, full regression `430/430`) is recorded as `DEVELOPMENT-SESSION
  EXECUTION EVIDENCE` only, not Independent Validation and not an
  Independent Review `PASS`. `F-RB1-06`, `F-RB1-07`, `F-RB1-08`, and
  `F-CS-01` remain `OPEN / NON-BLOCKING` and were not touched by this
  correction. See "Runtime Foundation B1 Correction Candidate —
  Development Session" above for full detail. Runtime Foundation B1
  main-integration eligibility remains `NOT ELIGIBLE`; Independent Review
  of this correction candidate is `PENDING`.

## 9. Lifecycle Non-Claims

This ledger does not claim:

- Runtime Foundation B1 validated, closed, canonical, or integrated on main
- `queryRawEvidenceForMetricRebuild(pool, input)` runtime exists on main
- the Runtime Foundation B1 validation candidate's fresh Independent Review
  resulted in approval, main-integration eligibility, or post-merge
  verification — the review completed with verdict `REQUEST CORRECTION`
- the local-main-commit / forbidden-`git reset --hard` process deviation
  erased, ruled to have not occurred, or requiring a history rewrite — it
  is preserved as a historical process deviation with governance
  disposition `NON-BLOCKING`
- Development-session PostgreSQL execution evidence upgraded to Independent
  Validation
- Runtime Foundation B1 correction implementation started
- the Runtime Foundation B1 validation candidate SHA, tree, or history
  changed by this update
- the Tier C canonical synchronization candidate's integration onto main
  (commit `87084ff90cbf38e4cb6a9df8146a7b7030c3eba6`, API `1.27` / Schema
  `1.7`) means Runtime Foundation B1 code is validated, closed, or
  canonical, or that Runtime Foundation B1 code main-integration
  eligibility is restored — it remains `NOT ELIGIBLE`
- the completed review-record step (backlog revision `1.71`, commit
  `2499d63a316268bd1f1463a5bafd9a8dc5c02925`) means Runtime Foundation B1
  code is validated, closed, or canonical, or that any of `F-RB1-03`,
  `F-RB1-04`, or `F-CS-01` is closed
- `F-RB1-03` closed — it is `OPEN`
- `F-RB1-04` closed — it is `OPEN`
- `F-CS-01` closed — it is `OPEN / NON-BLOCKING`
- Runtime Foundation B1 correction implemented or started
- Runtime Foundation B1 main-integration eligibility restored
- the fresh Codex read-only correction pre-analysis (repository mutation
  `0`) is an Independent Review, a code/test implementation, or execution
  evidence of any kind
- `F-RB1-01`, `F-RB1-02`, `F-RB1-03`, `F-RB1-04`, or `F-RB1-05` closed by
  the correction pre-analysis — all remain `OPEN`
- `F-RB1-06`, `F-RB1-07`, or `F-RB1-08` closed — all remain
  `OPEN / NON-BLOCKING`
- the correction pre-analysis's planned minimum test plan (`T-C01`
  through `T-C05`, `T-C03N`, `T-C03F`) or its expected test counts
  (`56` / `200` / `430`) were executed or are `PASS` — they are `PLANNED /
  NOT EXECUTED` and expected counts only
- the Development correction branch
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905`
  (replay `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7`, correction
  `357ac80058ce3feab0565d5ed995927ef2207a77`) is validated, closed,
  canonical, or integrated on main — Runtime Foundation B1 main-integration
  eligibility remains `NOT ELIGIBLE`
- the Development-session PostgreSQL execution evidence for the correction
  candidate (Runtime suite `56/56`, focused regression `200/200`, full
  regression `430/430`) is Independent Validation or an Independent Review
  `PASS`
- `F-RB1-01`, `F-RB1-02`, `F-RB1-03`, `F-RB1-04`, or `F-RB1-05` closed by
  the correction candidate or its Development-session execution evidence
  — all remain `OPEN`
- `F-RB1-06`, `F-RB1-07`, `F-RB1-08`, or `F-CS-01` closed by this
  correction candidate — all remain `OPEN / NON-BLOCKING`
- Independent Review of the correction candidate occurred or produced any
  verdict — it is `PENDING`
- VI P1 Measurement Readiness complete
- `B-3` resolved
- P1 eligible or activated
- human-data collection authorized
- efficacy verified
- GitHub Actions PASS
- Validation Level 3 §10 overall PASS
- Evidence Foundation overall complete
- actual provider or audio authorized
- any open finding resolved

## 10. Next Action

- Fresh Claude Opus 5 Independent Review of Runtime Foundation B1
  correction branch
  `validation/vi-p1-raw-source-core-runtime-b1-correction-20260905` at
  exact correction tip `357ac80058ce3feab0565d5ed995927ef2207a77` against
  exact replay parent `6f7911bdc4bc6a5f6e4ecd1cdf376d61f5ab5af7` and
  current canonical `main` `ea22d6f8276dba6d27843bbf2fa34171fe9ab941`,
  checking: replay fidelity to the original reviewed candidate; the
  correction's exact two-file scope; `F-RB1-01` through `F-RB1-05`
  correction fidelity; that the `F-RB1-04` runtime code delta remains
  `NONE`; the seven new correction tests and timestamp-test changes; exact
  canonical API `1.27` / Schema `1.7` compliance; transaction /
  zero-side-effect semantics; the Development PostgreSQL evidence
  classification boundary; preservation of `F-RB1-06`, `F-RB1-07`,
  `F-RB1-08`, and `F-CS-01`; and main-integration eligibility. No Runtime
  B1 main integration before this fresh review.
