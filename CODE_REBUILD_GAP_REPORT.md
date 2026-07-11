# CODE_REBUILD_GAP_REPORT.md

## LLE Production Code Rebuild Gap Report

> Status: Rebuild planning document
> Scope: GitHub `main` 문서 기준 Production Code 재구현 준비
> Rule: Architecture / Schema / API / Validation Rule 변경 금지

---

## 0. Purpose

이 문서는 현재 GitHub `main`에 존재하는 문서 상태와 누락된 Production Code 상태를 비교하여, 코드 재구현 전에 필요한 Gap을 명확히 정리하기 위한 문서다.

이번 작업은 새 설계가 아니다. 과거 Claude 세션의 임시 컨테이너 `/home/claude/lle-production/`에서 구현되었다고 보고된 Production Code가 GitHub에 push되지 않아 현재 저장소에 없는 상황을 전제로, GitHub에 복구된 Frozen Architecture 문서 기준으로 코드를 재구현하기 위한 준비 문서다.

---

## 1. Current GitHub Main Inventory

### 1.1 Confirmed document-oriented repository state

현재 GitHub `main`은 문서 중심 저장소 상태로 본다. 핵심 Architecture / Schema / Validation / Content 문서는 상당수 복구되었으나, Production Code 파일과 테스트 폴더는 존재하지 않는 상태로 분류한다.

### 1.2 Important restored documents

아래 문서들은 코드 재구현 시 우선 참조 대상이다.

| Category | Documents |
|---|---|
| Freeze / Source of Truth | `ARCHITECTURE_FREEZE_v1.0.md`, `CORE_STANDARD_V1_FREEZE.md`, `REBUILD_CONTRACT_RECONCILIATION.md` |
| Project Foundation | `PROJECT_VISION.md`, `LEARNING_THEORY.md`, `LEARNING_PROTOCOL.md`, `PROJECT_MASTER_INDEX.md`, `README.md` |
| Schema / Graph | `CONCEPT_SCHEMA.md`, `GRAMMAR_SCHEMA.md`, `GRAMMAR_GRAPH.md`, `PROGRESS_SCHEMA.md`, `VOCABULARY_SCHEMA.md`, `CONTENT_SCHEMA.md` |
| Contracts / Briefs | `API_CONTRACT.md`, `ENGINE_INTERFACE.md`, `DATA_PERSISTENCE_BRIEF.md`, `DOMAIN_LOGIC_BRIEF.md`, `API_LAYER_BRIEF.md`, `AI_INTEGRATION_BRIEF.md`, `CLIENT_BRIEF.md`, `CONTENT_PRODUCTION_STANDARD.md` |
| Validation | `VALIDATION_LEVEL3.md`, `VALIDATION_LEVEL3_READINESS_PLAN.md`, `PHASE_2_COMPLETION_REPORT.md` |
| Language Packs | `VI_LANGUAGE_PACK.md`, `EN_LANGUAGE_PACK.md`, `JA_LANGUAGE_PACK.md`, `ZH_LANGUAGE_PACK.md` |
| Content Packs | `VI_CONTENT.md`, `EN_CONTENT.md`, `JA_CONTENT.md`, `ZH_CONTENT.md` |
| Rebuild | `CODE_REBUILD_GAP_REPORT.md`, `CODE_REBUILD_PLAN.md` |

### 1.3 Historical-status documents warning

`PHASE_2_COMPLETION_REPORT.md`와 `VALIDATION_LEVEL3_READINESS_PLAN.md`는 과거 세션 코드베이스 기준 완료 기록을 담고 있다. 현재 GitHub 코드 기준 완료 상태로 해석하면 안 된다.

Correct interpretation:

- Historical Status: 과거 `/home/claude/lle-production/` 코드베이스 기준 완료 보고
- Current GitHub Status: Production Code 미복구, 재구현 필요
- Target State: 과거 보고 수준의 구현과 테스트 통과 상태 재달성

---

## 2. Missing Production Code Inventory

현재 GitHub `main`에 없는 것으로 분류되는 Production Code 항목은 다음과 같다.

### 2.1 Root-level project files

| Path | Status | Purpose |
|---|---|---|
| `package.json` | Missing | Node.js 프로젝트 정의, scripts, dependencies |
| `package-lock.json` | Missing | 의존성 잠금 파일 |
| `.env.example` | Missing | DB/JWT/Runtime 설정 예시 |
| `.gitignore` | Missing or needs review | node_modules, env, local DB artifacts 제외 |

### 2.2 DB layer

| Path | Status | Purpose |
|---|---|---|
| `db/` | Missing | DB 관련 코드 루트 |
| `db/pool.js` | Missing | PostgreSQL connection pool |
| `db/migrate.js` | Missing | migration runner |
| `db/seedTierD.js` | Missing | Tier D Language Pack / Content seed script |
| `db/migrations/` | Missing | migrations 001~012 |
| `db/tierD/parseLanguagePack.js` | Missing | Language Pack markdown parser |
| `db/tierD/parseContent.js` | Missing | Content markdown parser |
| `db/tierD/source/*.md` | Missing | seed source copy of 8 Tier D files |

### 2.3 Source code layer

| Path | Status | Purpose |
|---|---|---|
| `src/` | Missing | application source root |
| `src/config/engineConfig.js` | Missing | engine/worker tuning config |
| `src/engines/graphEngine.js` | Missing | graph validation / relation traversal |
| `src/engines/progressEngine.js` | Missing | progress writes, eligibility, review scheduling |
| `src/engines/contentEngine.js` | Missing | content retrieval / validation |
| `src/engines/reviewEngine.js` | Missing | cascade recommendation |
| `src/engines/aiGenerationEngine.js` | Missing | mock/real generation adapter and gate checks |
| `src/engines/generationEngine.js` | Missing | generation ladder orchestration |
| `src/engines/interleavingEngine.js` | Missing | practice sequence ordering |
| `src/engines/learningFlowEngine.js` | Missing | 5 public Learning Flow APIs |
| `src/api/server.js` | Missing | Express app/server |
| `src/api/routes/auth.js` | Missing | guest auth and convert stub |
| `src/api/routes/flow.js` | Missing | Learning Flow HTTP endpoints |
| `src/api/middleware/auth.js` | Missing | Bearer token auth |
| `src/api/httpMapping.js` | Missing | error/empty_result HTTP mapping |
| `src/worker/cascadeJobsWorker.js` | Missing | cascade_jobs worker |

### 2.4 Tests

| Path | Status | Purpose |
|---|---|---|
| `tests/` | Missing | test root |
| `tests/fixtures/` | Missing | deterministic fixtures |
| `tests/graphEngine.test.js` | Missing | Graph Engine tests |
| `tests/progressEngine.test.js` | Missing | Progress Engine tests |
| `tests/contentEngine.test.js` | Missing | Content Engine tests |
| `tests/reviewEngine.test.js` | Missing | Review Engine tests |
| `tests/aiGenerationEngine.test.js` | Missing | AI Generation Engine tests |
| `tests/generationEngine.test.js` | Missing | Generation Engine tests |
| `tests/interleavingEngine.test.js` | Missing | Interleaving Engine tests |
| `tests/learningFlowEngine.test.js` | Missing | Learning Flow tests |
| `tests/apiLayer.test.js` | Missing | HTTP API tests |
| `tests/cascadeJobsWorker.test.js` | Missing | worker tests |
| `tests/schemaMigrations.test.js` | Missing | migration/schema checks |

---

## 3. Target State from Historical Reports

The rebuild target is to recreate the behavior reported in the historical Phase 2 codebase, not to invent new design.

### 3.1 Target implementation components

- DB migrations 001~012
- PostgreSQL 16 compatible schema
- Node.js + `pg`
- Express API Layer
- `jsonwebtoken` for auth
- 8 core engines
- Learning Flow Engine with 5/5 APIs
- API Layer with guest auth and flow routes
- `cascade_jobs` worker
- Tier D seed parser and seed runner
- Mock LLM Validation Level 3 readiness

### 3.2 Target data quantities

Actual Tier D file counts to reproduce:

| Entity | Target Count |
|---|---:|
| Concept | 21 |
| Grammar Node | 85 |
| Relation | 52 |
| Content | 255 |
| Vocabulary | 12 |

### 3.3 Historical test target

Historical final reported regression target:

- `175/175 PASS` level

This is a historical target only. It is not current GitHub code verification until the rebuild is complete and tests are re-run.

---

## 4. Contract Reconciliation Requirements

Before coding, Development must follow `REBUILD_CONTRACT_RECONCILIATION.md`.

### 4.1 Resolved AC decisions to treat as valid specification

| AC | Required implementation meaning |
|---|---|
| AC-001 | Review Engine `get_cascade` accepts `progress_snapshot`; Review Engine does not read Progress directly |
| AC-002 | `cascade_jobs` outbox is separate infrastructure; created inside `recordAttempt` transaction; worker processes later |
| AC-003 | Concept prerequisite consistency must be reflected at Grammar Node relation level and validated |
| AC-004 | `content.explanation_level TEXT NULL`; EXPLANATION requires explanation_level; get_content can filter by explanation_level |
| AC-005 | `generate_problem` accepts `target_node_id` for PRE_MADE fallback |
| AC-008 | `content_id` chain exists: generate_problem output, submit_attempt input, attempt_records FK, get_content exact lookup |
| AC-009 | request_practice target_node_id selection provisional rule from Learning Protocol context |
| AC-011 | `type_specific_metadata.error_attributed_node_id` determines SELF/TRANSFER |

### 4.2 Non-blocking ACs

The following should not block rebuild unless they surface as direct implementation contradictions:

- AC-006: Generation Engine cannot fully validate `target_concept_id` existence alone
- AC-007: Interleaving same-category majority cannot be guaranteed by pure reordering if input is skewed
- AC-010: AI-generated content persistence meta_language basis unclear

---

## 5. Rebuild Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Historical reports treated as current code state | False confidence | Keep status labels in Phase reports and readiness plan |
| AC decisions missing from body docs | Contract mismatch | Use reconciliation document as binding rebuild reference |
| Recreating code from memory | Architecture drift | Implement only from GitHub documents and reconciled ACs |
| Tier D parser ambiguity | Incorrect seed data | Add count checks, idempotency checks, reference integrity checks |
| start_session policy overreach | New policy invented | Use `LEARNING_PROTOCOL.md` only; HOW values go in config |
| LLM nondeterminism | Validation instability | Mock LLM first, real LLM second per `VALIDATION_LEVEL3.md` §2.4 |
| Worker duplicate processing | Progress corruption | Use row lock + `FOR UPDATE SKIP LOCKED` |
| DB enum mismatch | Seed failure | Include `PARTICLE` enum migration |

---

## 6. Rebuild Priority

Recommended implementation priority:

1. Phase 0: Project bootstrap and smoke test
2. Phase 1: DB schema and migrations 001~012
3. Phase 2: DB utilities and seed parser skeleton
4. Phase 3: Graph Engine
5. Phase 4: Progress Engine
6. Phase 5: Content Engine
7. Phase 6: Review Engine
8. Phase 7: AI Generation Engine
9. Phase 8: Generation Engine
10. Phase 9: Interleaving Engine
11. Phase 10: Learning Flow Engine
12. Phase 11: API Layer
13. Phase 12: cascade_jobs Worker
14. Phase 13: Tier D seed execution
15. Phase 14: Regression and Validation Level 3 Mock readiness

---

## 7. Test Targets by Phase

| Phase | Minimum test goal |
|---|---|
| Phase 0 | smoke test PASS |
| Phase 1 | migrations apply and re-run safely |
| Phase 3 | graph traversal and validation tests PASS |
| Phase 4 | progress state/review/transaction tests PASS |
| Phase 5 | content retrieval, content_id lookup, explanation_level validation PASS |
| Phase 6 | review cascade tests PASS |
| Phase 7 | mock AI generation and white-list/gate tests PASS |
| Phase 8 | generation ladder tests PASS |
| Phase 9 | interleaving sequence tests PASS |
| Phase 10 | Learning Flow 5 API tests PASS |
| Phase 11 | API auth/status mapping tests PASS |
| Phase 12 | worker lifecycle/concurrency tests PASS |
| Phase 13 | Tier D counts and idempotency PASS |
| Phase 14 | full regression target approaching historical 175/175 PASS |

---

## 8. Final Goal

The rebuild is complete when all of the following are true:

1. Production code exists in GitHub `main`.
2. DB migrations 001~012 exist and apply idempotently.
3. All required engines and API/worker components exist.
4. Tier D data can be seeded to expected counts.
5. Full regression tests run in the current repo.
6. Test results are recorded as current GitHub code results, not historical session results.
7. Validation Level 3 Mock LLM execution is ready.

