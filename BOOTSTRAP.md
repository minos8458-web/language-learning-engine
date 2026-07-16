# LLE Development Bootstrap

## Repository

https://github.com/minos8458-web/language-learning-engine

## Default Branch

main

## Working Branch

main

## Current Version

MVP v0.2

## Source of Truth

The GitHub main branch is the single source of truth for all documentation and implementation.

## Last Updated

2026-07-16

---

## Role of This Document

This document is the **Session Startup Authority** only. It does not own or duplicate current project position or validation state — see the Authority Pointers below.

## Authority Pointers

- **Project Position / Roadmap**: `PROJECT_MASTER_INDEX.md`
- **Validation State**: `VALIDATION_STATUS.md` (sole owner of PASS/section progress and regression figures)

This document does not declare current regression totals or current §5–§8 (or any other section) PASS status. Those figures live only in `VALIDATION_STATUS.md`.

---

## Required Documents (Read in Order)

1. PROJECT_MASTER_INDEX.md
2. PROJECT_VISION.md
3. IMPLEMENTATION_NOTES.md
4. VALIDATION_STATUS.md
5. VALIDATION_LEVEL3.md
6. ARCHITECTURE_CLARIFICATION_BACKLOG.md

---

## Development Rules

- GitHub main branch is the Source of Truth.
- Do not modify Architecture without explicit approval.
- Do not modify Schema without explicit approval.
- Do not modify Validation Rules without explicit approval.
- Finish the current milestone before starting any new feature.
- Document first, implement second.
- If documentation and implementation conflict, verify the documentation first.
- Preserve backward compatibility whenever possible.
- Do not silently change existing behavior.

---

## AI Working Rules

- Read this document before any implementation work.
- Read all required documents before making implementation decisions.
- Do not assume missing information.
- Report the implementation plan before writing code.
- Ask for approval before changing architecture, schema, validation logic, or project direction.
- Keep Validation Level 3 principles unchanged unless explicitly approved.
- If any requirement is ambiguous, stop and ask instead of guessing.
- Treat prior-session memory, local copies, ZIPs, browser root listings, or cached raw content as unreliable. Confirm current state against commit-pinned raw files on GitHub main before acting.

---

## Session Startup Rule

Every new development session must:

1. Read this document first.
2. Read `PROJECT_MASTER_INDEX.md` for current project position.
3. Read `VALIDATION_STATUS.md` for current validation state.
4. Read all other required documents.
5. Summarize the current project state (citing `PROJECT_MASTER_INDEX.md` / `VALIDATION_STATUS.md`, not this document, for position/validation figures).
6. Present the implementation plan.
7. Wait for approval before major architectural changes.
8. Update `PROJECT_MASTER_INDEX.md` and `VALIDATION_STATUS.md` whenever project state changes — do not duplicate their content back into this document.

---

## Project Philosophy

Build a language learning engine, not a language learning app.

Every implementation should move the project closer to a reusable, language-independent engine.
