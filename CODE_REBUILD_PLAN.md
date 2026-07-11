# CODE_REBUILD_PLAN.md

## LLE Production Code Rebuild Plan

> Status: Implementation plan
> Scope: Rebuild missing Production Code from GitHub Frozen Architecture documents
> Rule: No Architecture / Schema / API / Validation Rule changes unless explicitly escalated

---

## 0. Purpose

This plan defines the sequence for rebuilding the missing Production Code that was previously implemented in a temporary Claude session but not pushed to GitHub.

The plan assumes:

- GitHub `main` contains the relevant Architecture / Schema / Validation / Content documents.
- `REBUILD_CONTRACT_RECONCILIATION.md` is the bridge between Resolved AC decisions and body documents.
- The historical target state is Phase 2 level implementation with Tier D seed and Validation Level 3 Mock readiness.
- Code must be rebuilt in small, testable phases.

---

## 1. Non-negotiable Rules

1. Do not change Architecture / Schema / API / Validation Rule.
2. Do not invent new engine responsibilities.
3. Do not bypass `REBUILD_CONTRACT_RECONCILIATION.md`.
4. Do not treat historical 175/175 PASS as current repo result.
5. Each phase must be committed separately where practical.
6. Each phase must add or preserve tests.
7. New ACs may be registered only if a true contract gap is discovered.

---

## 2. Phase Overview

| Phase | Name | Main output |
|---|---|---|
| 0 | Bootstrap | Node project + test harness |
| 1 | DB Schema | migrations 001~012 |
| 2 | DB Utilities | pool, migration runner, seed skeleton |
| 3 | Graph Engine | graph traversal and validation |
| 4 | Progress Engine | progress state, attempts, review scheduling |
| 5 | Content Engine | content retrieval and validation |
| 6 | Review Engine | cascade recommendation |
| 7 | AI Generation Engine | mock generation and gate checks |
| 8 | Generation Engine | generation ladder |
| 9 | Interleaving Engine | sequence ordering |
| 10 | Learning Flow Engine | 5 public flow APIs |
| 11 | API Layer | Express routes, auth, mapping |
| 12 | cascade_jobs Worker | outbox worker |
| 13 | Tier D Seed | parse and load 4 language/content packs |
| 14 | Regression | current repo full regression and VL3 mock readiness |

---

## 3. Phase 0 — Bootstrap

### 3.1 Create files

- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.example`
- `src/`
- `tests/`
- `tests/smoke.test.js`

### 3.2 Dependencies

Runtime:

- `pg`
- `express`
- `jsonwebtoken`
- `uuid` if needed; prefer PostgreSQL `gen_random_uuid()` for DB IDs

Dev/test:

- Use Node built-in test runner if possible, or minimal test framework if already chosen by repo convention.

### 3.3 Scripts

`package.json` should include:

- `test`
- `db:migrate`
- `db:seed:tierd` later in Phase 13

### 3.4 Completion criteria

- `npm install` succeeds.
- `npm test` runs.
- smoke test passes.
- No engine implementation yet.

### 3.5 Suggested commit

```text
chore: bootstrap production code rebuild
```

---

## 4. Phase 1 — DB Schema / Migrations

### 4.1 Create files

- `db/migrations/001_create_users.sql`
- `db/migrations/002_create_concepts.sql`
- `db/migrations/003_create_grammar_nodes.sql`
- `db/migrations/004_create_grammar_relations.sql`
- `db/migrations/005_create_progress.sql`
- `db/migrations/006_create_content.sql`
- `db/migrations/007_create_attempt_records.sql`
- `db/migrations/008_create_vocabulary.sql`
- `db/migrations/009_create_cascade_jobs.sql`
- `db/migrations/010_add_content_id_to_attempt_records.sql`
- `db/migrations/011_add_explanation_level_to_content.sql`
- `db/migrations/012_add_particle_to_pos_enum.sql`

### 4.2 Reference documents

- `DATA_PERSISTENCE_BRIEF.md`
- `CONTENT_SCHEMA.md`
- `PROGRESS_SCHEMA.md`
- `VOCABULARY_SCHEMA.md`
- `REBUILD_CONTRACT_RECONCILIATION.md`

### 4.3 Key requirements

- Migrations must be idempotent or safely skipped by migration runner.
- `content.explanation_level TEXT NULL` exists.
- EXPLANATION content requires explanation_level by DB CHECK.
- `attempt_records.content_id` exists.
- `cascade_jobs` exists with `PENDING`, `DONE`, `FAILED` lifecycle.
- `pos_enum` includes `PARTICLE`.

### 4.4 Tests

- migrations apply successfully
- re-run does not duplicate or break
- key constraints exist

### 4.5 Suggested commit

```text
db: recreate production schema migrations
```

---

## 5. Phase 2 — DB Utilities

### 5.1 Create files

- `db/pool.js`
- `db/migrate.js`
- `src/config/engineConfig.js`

### 5.2 Requirements

- PostgreSQL connection via environment variables.
- Migration runner records applied migrations.
- `engineConfig.js` includes tunable values, including:
  - cascade worker max retries
  - cascade worker batch size
  - HOW-stage defaults such as concurrent study limit and conversation threshold, where needed

### 5.3 Tests

- pool can connect in test environment
- migration runner skip behavior works

### 5.4 Suggested commit

```text
db: add pool and migration runner
```

---

## 6. Phase 3 — Graph Engine

### 6.1 Create file

- `src/engines/graphEngine.js`
- `tests/graphEngine.test.js`

### 6.2 Required functions

- find prerequisites
- find related nodes
- validate language pack
- cycle detection
- concept-node consistency validation from AC-003

### 6.3 Reference documents

- `GRAMMAR_GRAPH.md`
- `GRAMMAR_SCHEMA.md`
- `CONCEPT_SCHEMA.md`
- `REBUILD_CONTRACT_RECONCILIATION.md`

### 6.4 Tests

- relation direction rules
- prerequisite traversal
- related/contrast/alternative behavior
- cycle detection
- concept-node prerequisite consistency

### 6.5 Suggested commit

```text
feat: rebuild graph engine
```

---

## 7. Phase 4 — Progress Engine

### 7.1 Create file

- `src/engines/progressEngine.js`
- `tests/progressEngine.test.js`

### 7.2 Required functions

- `getProgress`
- `getEligibleNodes`
- `recordExplicitStudy`
- `recordAttempt`
- `recordSelfReportedConfidence`
- `getConceptCoverageDepth`
- `getDueReviews`
- `advanceReviewToNow`
- helper reads required by Learning Flow start_session

### 7.3 Key requirements

- All progress writes go through Progress Engine.
- `recordAttempt` is transactional.
- `recordAttempt` stores `content_id`.
- `recordAttempt` can insert cascade_jobs inside the same transaction.

### 7.4 Reference documents

- `ENGINE_INTERFACE.md`
- `API_CONTRACT.md`
- `PROGRESS_SCHEMA.md`
- `DATA_PERSISTENCE_BRIEF.md`

### 7.5 Tests

- state transitions
- attempt recording
- content_id FK behavior
- cascade_jobs insertion path
- review scheduling
- advanceReviewToNow

### 7.6 Suggested commit

```text
feat: rebuild progress engine
```

---

## 8. Phase 5 — Content Engine

### 8.1 Create file

- `src/engines/contentEngine.js`
- `tests/contentEngine.test.js`

### 8.2 Required functions

- `getContent`
- exact content lookup by `content_id`
- explanation level validation

### 8.3 Key requirements

- `get_content(explanation_level)` filters via `content.explanation_level`.
- EXPLANATION requires explanation_level.
- non-EXPLANATION types may have NULL explanation_level.
- inactive content is excluded unless explicitly allowed by contract.

### 8.4 Reference documents

- `API_CONTRACT.md`
- `CONTENT_SCHEMA.md`
- `CONTENT_PRODUCTION_STANDARD.md`
- `DATA_PERSISTENCE_BRIEF.md`

### 8.5 Suggested commit

```text
feat: rebuild content engine
```

---

## 9. Phase 6 — Review Engine

### 9.1 Create file

- `src/engines/reviewEngine.js`
- `tests/reviewEngine.test.js`

### 9.2 Required function

- `getCascade`

### 9.3 Key requirements

- Accepts `progress_snapshot` per AC-001.
- Does not call Progress Engine directly.
- Does not write progress.
- Produces recommendation/cascade output only.

### 9.4 Reference documents

- `ENGINE_INTERFACE.md`
- `GRAMMAR_GRAPH.md`
- `DOMAIN_LOGIC_BRIEF.md`

### 9.5 Suggested commit

```text
feat: rebuild review engine
```

---

## 10. Phase 7 — AI Generation Engine

### 10.1 Create file

- `src/engines/aiGenerationEngine.js`
- `tests/aiGenerationEngine.test.js`

### 10.2 Requirements

- Mock LLM first.
- White List / Grammar Gate behavior.
- Failure returns ladder downgrade signal, not unhandled crash.
- No real LLM required for Phase 1 rebuild.

### 10.3 Reference documents

- `AI_INTEGRATION_BRIEF.md`
- `VALIDATION_LEVEL3.md`
- `DOMAIN_LOGIC_BRIEF.md`

### 10.4 Suggested commit

```text
feat: rebuild ai generation engine
```

---

## 11. Phase 8 — Generation Engine

### 11.1 Create file

- `src/engines/generationEngine.js`
- `tests/generationEngine.test.js`

### 11.2 Requirements

4-step ladder:

1. AI combination
2. AI single node
3. PRE_MADE canonical fallback using `target_node_id`
4. Content gap signal

### 11.3 AC requirements

- AC-005: `target_node_id`
- AC-008: output includes `content_id`; AI-generated content persistence path exists when applicable

### 11.4 Suggested commit

```text
feat: rebuild generation engine
```

---

## 12. Phase 9 — Interleaving Engine

### 12.1 Create file

- `src/engines/interleavingEngine.js`
- `tests/interleavingEngine.test.js`

### 12.2 Requirements

- sequence nodes
- avoid identical consecutive node where possible
- adjacent contrast when useful
- distribute category where possible
- acknowledge AC-007 limitation without overengineering

### 12.3 Suggested commit

```text
feat: rebuild interleaving engine
```

---

## 13. Phase 10 — Learning Flow Engine

### 13.1 Create file

- `src/engines/learningFlowEngine.js`
- `tests/learningFlowEngine.test.js`

### 13.2 Required APIs

- `startExplicitStudy`
- `submitAttempt`
- `requestPractice`
- `submitSelfReportedConfidence`
- `startSession`

### 13.3 Key requirements

- Thin orchestrator only.
- Does not duplicate lower engine logic.
- Uses `error_attributed_node_id` for SELF/TRANSFER.
- Uses `content_id` in submitAttempt.
- Uses `LEARNING_PROTOCOL.md` for startSession policy.
- Uses AC-009 provisional target_node_id selection where applicable.

### 13.4 Suggested commit

```text
feat: rebuild learning flow engine
```

---

## 14. Phase 11 — API Layer

### 14.1 Create files

- `src/api/server.js`
- `src/api/routes/auth.js`
- `src/api/routes/flow.js`
- `src/api/middleware/auth.js`
- `src/api/httpMapping.js`
- `tests/apiLayer.test.js`

### 14.2 Required endpoints

- `POST /auth/guest`
- `POST /auth/convert` returns 501 until implemented
- `POST /flow/start-explicit-study`
- `POST /flow/submit-attempt`
- `POST /flow/request-practice`
- `POST /flow/submit-self-reported-confidence`
- `POST /flow/start-session`

### 14.3 Requirements

- Use `jsonwebtoken`, not handwritten JWT.
- `user_id` comes from Bearer token, not request body.
- Internal engines are not exposed directly.
- HTTP mapping follows `API_LAYER_BRIEF.md`.

### 14.4 Suggested commit

```text
feat: rebuild api layer
```

---

## 15. Phase 12 — cascade_jobs Worker

### 15.1 Create file

- `src/worker/cascadeJobsWorker.js`
- `tests/cascadeJobsWorker.test.js`

### 15.2 Requirements

- process PENDING jobs only
- `FOR UPDATE SKIP LOCKED`
- job 1 transaction each
- success: DONE + processed_at
- failure: retry_count increment; PENDING or FAILED based on config
- uses Progress Engine `advanceReviewToNow`

### 15.3 Integration test

- submitAttempt TRANSFER → cascade_jobs row → worker → next_review_at advanced

### 15.4 Suggested commit

```text
feat: rebuild cascade jobs worker
```

---

## 16. Phase 13 — Tier D Seed

### 16.1 Create files

- `db/seedTierD.js`
- `db/tierD/parseLanguagePack.js`
- `db/tierD/parseContent.js`
- `db/tierD/source/VI_LANGUAGE_PACK.md`
- `db/tierD/source/EN_LANGUAGE_PACK.md`
- `db/tierD/source/JA_LANGUAGE_PACK.md`
- `db/tierD/source/ZH_LANGUAGE_PACK.md`
- `db/tierD/source/VI_CONTENT.md`
- `db/tierD/source/EN_CONTENT.md`
- `db/tierD/source/JA_CONTENT.md`
- `db/tierD/source/ZH_CONTENT.md`

### 16.2 Requirements

- idempotent seed
- ON CONFLICT DO NOTHING or equivalent skip
- verify counts:
  - Concept 21
  - Grammar Node 85
  - Relation 52
  - Content 255
  - Vocabulary 12
- validate all 4 language packs
- validate explanation_level for all content
- verify vocabulary irregular node references

### 16.3 Suggested commit

```text
data: add tier d seed pipeline
```

---

## 17. Phase 14 — Full Regression and VL3 Mock Readiness

### 17.1 Required outputs

- current repo test result
- seed result
- validation readiness update

### 17.2 Goal

Re-establish current-code test result comparable to historical `175/175 PASS`.

Exact test count may differ if rebuild test organization differs, but coverage must include all historical mechanisms.

### 17.3 Suggested commit

```text
test: restore production regression coverage
```

---

## 18. Completion Criteria

The rebuild is complete when:

1. GitHub contains production code.
2. All phases have been implemented.
3. DB schema applies from scratch.
4. Tier D seed completes with exact counts.
5. Full regression passes in the current repo.
6. Historical status documents are no longer mistaken for current code verification.
7. Validation Level 3 Mock LLM plan can be executed from current code.

