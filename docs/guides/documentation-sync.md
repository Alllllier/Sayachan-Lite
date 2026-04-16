# Documentation Sync

This guide replaces the legacy document sync guide under `.docs/architecture-audit/` as the canonical documentation sync reference.

## Canonical Docs To Keep In Sync

- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`
- `docs/architecture/backend-api.md`
- `docs/architecture/roadmap.md`
- `docs/guides/development-constraints.md`

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

## Mapping

If you changed:

- model or route contracts: review `docs/architecture/backend-api.md`
- workflow behavior, focus logic, cascades, or runtime context flow: review `docs/architecture/runtime-workflow.md`
- public/private AI boundary or execution risk zones: review `docs/architecture/system-baseline.md`
- shipped capability scope or debt position: review `docs/architecture/roadmap.md`
- shared styling rules: review `docs/guides/development-constraints.md`

## Update Flow

Preferred flow:

1. change code
2. validate behavior
3. update the relevant canonical docs under `docs/architecture/**`
4. commit through the PMO-owned workflow

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

## Repo Hook Scope

The repo-owned pre-commit hook is intentionally narrow:

- it checks architecture-sensitive code paths only
- it requires updates only under `docs/architecture/**`
- it does not block commits just because `docs/guides/**` or other PMO files were unchanged
- it prints a non-blocking reminder when `frontend/package.json` or `backend/package.json` changes

This keeps the hook focused on architecture truth rather than on every documentation surface in the repo.

## Responsibility Rule

- architecture docs under `docs/architecture/**` are PMO-maintained
- governance and sync docs under `docs/guides/**` are PMO-maintained
- migration records under `docs/migration/**` are PMO-maintained
- `CLAUDE.md` is an execution entrypoint, not a canonical architecture source
