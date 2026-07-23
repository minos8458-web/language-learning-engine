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

2026-07-23

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

## Repository Execution Preflight

A session name, previous successful run, remembered path, or prior log does not prove that the current execution environment has the same filesystem, repository mount, credentials, or source artifacts.

Before any file write, staging, commit, push, migration, or repository-dependent test, verify all of the following in the current execution environment.

1. The expected repository path is known.
2. The expected path exists.
3. A `.git` entry exists under the expected repository root.
4. `git rev-parse --show-toplevel` resolves to the expected repository.
5. The current branch matches the approved branch.
6. `HEAD` matches the approved baseline.
7. `git fetch origin` succeeds.
8. `origin/main` matches the approved remote baseline.
9. The working tree is clean.
10. The staging area is clean.
11. Local HEAD and `origin/main` have the approved ahead/behind relationship.
12. Every authoritative source artifact required for the task is available in the current execution environment.

Do not begin a write operation if any preflight check fails.

On failure, report the observed path, repository top-level, branch, HEAD, `origin/main`, ahead/behind, dirty paths, and missing source artifacts. Do not repair the mismatch through an unapproved `pull`, merge, rebase, reset, checkout, stash, clone, amend, force-push, or cleanup operation.

Repository inaccessibility does not prove repository loss. Repository loss may be concluded only after separately checking the expected local path, its `.git` entry, and the GitHub remote.

A scratch directory is not a repository unless the current execution verifies its `.git` entry and repository top-level.

After one bounded repository-access diagnosis, stop the write workflow and return the blocker. Do not search unlimited paths or infer repository access from a previous session.

## Source Artifact Validation

An authoritative source artifact is identified by its verified content and provenance, not by its filename alone.

Before extraction or document generation, verify all applicable boundaries:

- expected baseline SHA
- required headings
- required approval or readiness marker
- expected start and end markers
- complete section boundaries
- balanced Markdown code fences
- approved normalization rules

The task instruction and the authoritative source artifact must remain distinguishable.

Temporary source files, extraction helpers, generated reports, and validation outputs must not be committed unless they are explicitly included in the approved file scope.

An extracted document must be compared with its authoritative source after applying only the approved normalization.

A count reported by a person or previous session is supporting evidence, not the authority. Recalculate counts from the current authoritative source.

If a hard-coded expected count differs from the recalculated value:

1. Do not immediately classify the source as corrupted.
2. Verify the exact document boundaries.
3. Verify the required headings and end markers.
4. Verify balanced structural delimiters such as Markdown fences.
5. Perform the required exact-content comparison.
6. Record additive correction provenance when the difference is explained.

## Guarded Write and Remote Recheck

A multi-step write workflow must stop before later write operations when an earlier validation or external command fails.

When PowerShell is used, place preflight, validation, file writes, diff checks, commit, push, and final verification inside one guarded script block.

```powershell
& {
    $ErrorActionPreference = "Stop"

    # Initial repository preflight
    # Authoritative source validation
    # Approved file write
    # Diff and structural validation
    # Remote recheck before commit
    # Commit
    # Remote recheck before push
    # Push
    # Final clean-state verification

    if ($LASTEXITCODE -ne 0) {
        throw "External command failed"
    }
}
```

Requirements:

- Check `$LASTEXITCODE` immediately after each external command.
- Keep validation and the commit or push that depends on it inside the same guarded block.
- Run `git fetch origin` and verify the approved remote baseline immediately before commit.
- Run `git fetch origin` and verify the approved remote baseline again immediately before push.
- Stop if `origin/main` advanced or no longer matches the approved baseline.
- Do not resolve divergence implicitly.
- Do not use amend, squash, rebase, force-push, or an unapproved pull or merge.

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
