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

2026-07-11

---

## Current Project Phase

Phase 2

## Current Milestone

Validation Level 3

## Current Task

Continue Validation Level 3 from §9 Conversation Boundary.

## Next Major Goal

Complete Validation Level 3 and prepare Beta Release.

---

## Required Documents (Read in Order)

1. PROJECT_MASTER_INDEX.md
2. PROJECT_VISION.md
3. IMPLEMENTATION_NOTES.md
4. VALIDATION_STATUS.md
5. VALIDATION_LEVEL3.md
6. CHANGELOG.md (when available)

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

- Read all required documents before making any implementation decision.
- Do not assume missing information.
- Report the implementation plan before writing code.
- Ask for approval before changing architecture, schema, validation logic, or project direction.
- Keep Validation Level 3 principles unchanged unless explicitly approved.
- If any requirement is ambiguous, stop and ask instead of guessing.

---

## Current Status

Architecture Status

Frozen

Regression Test

260 / 260 PASS

Validation Status

PASS

- §5 Grammar Gate
- §6 White List
- §7 Relation Integrity
- §8 Review Engine

Remaining

- §9 Conversation Boundary
- §10 AI Generation
- §11 Logging
- §12 Pass / Fail
- §13 Beta Release Gate

---

## Session Startup Rule

Every new development session must:

1. Read this document first.
2. Restore the current project status.
3. Read all required documents.
4. Summarize the current state.
5. Present the implementation plan.
6. Wait for approval before major changes.

---

## Project Philosophy

Build a language learning engine, not a language learning app.

Every implementation should move the project closer to a reusable, language-independent engine.
