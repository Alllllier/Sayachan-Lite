# Documentation Sync

This guide replaces the legacy document sync guide under `.docs/architecture-audit/` as the canonical documentation sync reference.

## Canonical Docs To Keep In Sync

- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`
- `docs/architecture/backend-api.md`
- `docs/architecture/roadmap.md`
- `docs/guides/development-constraints.md`
- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`
- `docs/pmo/workflows/sprint-lifecycle-workflow.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`
- `docs/ai-ops/workflows/codex-claude-development-loop.md`
- `docs/pmo/state/discussion_batches/index.md`

These are PMO-owned architecture and governance docs. They should be maintained by Codex PMO rather than by Claude execution work.

## When To Review Docs

Review architecture docs when changing:

- `backend/src/models/*.js`
- `backend/src/routes/*.js`
- `backend/src/ai/bridge.js`
- `frontend/src/services/*.js`
- `frontend/src/stores/*.js`
- `frontend/src/router/*.js`
- `frontend/src/components/ChatEntry.vue`
- `frontend/src/style.css`

Review PMO and AI-ops docs when changing:

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/workflows/*.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`
- `docs/pmo/state/*.md`
- `docs/ai-ops/workflows/*.md`
- `.codex/skills/sprint-pmo/**`
- `.codex/skills/execution-prompt-compiler/**`

## Mapping

If you changed:

- model or route contracts: review `docs/architecture/backend-api.md`
- workflow behavior, focus logic, cascades, or runtime context flow: review `docs/architecture/runtime-workflow.md`
- public/private AI boundary or execution risk zones: review `docs/architecture/system-baseline.md`
- shipped capability scope or debt position: review `docs/architecture/roadmap.md`
- shared styling rules: review `docs/guides/development-constraints.md`
- PMO workflow, sprint selection flow, or repo-native handoff shape: review `docs/pmo/PMO_OPERATING_MANUAL.md`, the relevant files under `docs/pmo/workflows/`, `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`, and `docs/ai-ops/workflows/codex-claude-development-loop.md`
- default planning audit responsibility or the rule for when Claude-side audit is needed: review `docs/pmo/PMO_OPERATING_MANUAL.md`, `docs/pmo/workflows/sprint-lifecycle-workflow.md`, `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`, and `docs/ai-ops/workflows/codex-claude-development-loop.md`
- discussion batch structure, clustered-theme state flow, or current-focus rule: review `docs/pmo/PMO_OPERATING_MANUAL.md`, `docs/pmo/workflows/discussion-workflow.md`, `docs/pmo/workflows/promotion-workflow.md`, `docs/ai-ops/workflows/codex-claude-development-loop.md`, and the affected files under `docs/pmo/state/`
- possible slices under a discussion theme, promotion cleanup behavior, or theme-to-slice execution transitions: review `docs/pmo/workflows/discussion-workflow.md`, `docs/pmo/workflows/promotion-workflow.md`, `docs/ai-ops/workflows/codex-claude-development-loop.md`, and the affected discussion batch files under `docs/pmo/state/discussion_batches/`
- PMO state structure or candidate selection rules: review the affected files under `docs/pmo/state/**` and this guide
- outbox replacement, outbox archive behavior, or idle outbox semantics: review `docs/pmo/workflows/sprint-lifecycle-workflow.md`, `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`, `docs/ai-ops/workflows/codex-claude-development-loop.md`, `docs/ai-ops/architecture/ai-development-system.md`, and the affected files under `docs/pmo/outbox/**`

## Update Flow

Preferred flow:

1. change code
2. validate behavior
3. update the relevant canonical docs under `docs/architecture/**`
4. if the change affects PMO process or AI operating flow, update the relevant files under `docs/pmo/**`, `docs/ai-ops/**`, and this guide
5. commit through the PMO-owned workflow

## When Doc Updates Can Be Skipped

Doc updates are often unnecessary when the change is only:

- a compatibility-safe refactor with no contract or behavior change
- an implementation-only bug fix that does not alter system shape
- a small visual polish change with no new shared UI pattern
- a package manifest or lockfile update that only supports an implementation-local UI change
- logging or comment-only edits

If unsure, prefer updating the docs.

## Commit Responsibility

Architecture doc updates should happen in the PMO commit flow through a repo-owned hook and PMO review, not through a Claude-side hook.

During migration and cleanup:

- treat `.docs` as legacy reference only
- update the new `docs/**` files first
- do not assume the old `.docs` set reflects current reality
- do not rely on agent-specific git hooks to enforce doc sync

When a PMO workflow change introduces or removes a repository-native state file:

- update `docs/pmo/PMO_OPERATING_MANUAL.md`
- update the affected files under `docs/pmo/workflows/`
- update `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`
- update `docs/ai-ops/workflows/codex-claude-development-loop.md`
- update this guide if the sync responsibility or trigger conditions changed

## Testing And Validation Docs

Testing and validation changes usually belong to governance docs, not architecture baseline docs.

When changing:

- validation toolchain such as `Vitest` or `Playwright`
- test or UI review commands
- PMO validation requirements
- browser-validation decision rules
- UI-review decision rules

review and update:

- `docs/guides/testing-and-ui-review.md`
- relevant PMO protocol files under `docs/pmo/**`

Only update `docs/architecture/**` when the testing change reveals or depends on a real architecture-truth change.

## Repo Hook Scope

The repo-owned pre-commit hook is intentionally narrow:

- it checks architecture-sensitive code paths only
- it requires updates only under `docs/architecture/**`
- it may print non-blocking PMO workflow reminders when PMO operating docs change
- it does not block commits just because `docs/guides/**` or other PMO files were unchanged
- it prints a non-blocking reminder when `frontend/package.json` or `backend/package.json` changes

This keeps the hook focused on architecture truth rather than on every documentation surface in the repo.

## Responsibility Rule

- architecture docs under `docs/architecture/**` are PMO-maintained
- governance and sync docs under `docs/guides/**` are PMO-maintained
- PMO operating docs and PMO state docs under `docs/pmo/**` are PMO-maintained
- AI operating-system docs under `docs/ai-ops/**` are PMO-maintained
- migration records under `docs/migration/**` are PMO-maintained
- `CLAUDE.md` is an execution entrypoint, not a canonical architecture source
