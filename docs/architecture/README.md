# Architecture Docs

This directory is the Codex-maintained source of truth for Sayachan Lite architecture and delivery-facing technical baseline.

These docs were rebuilt from repository audit on 2026-04-16 rather than copied from `.docs/architecture-audit/`.

## Canonical Set

- `system-baseline.md`: current system shape, boundaries, safe zones, and risks
- `runtime-workflow.md`: runtime surfaces and workflow/domain rules
- `backend-api.md`: audited backend route and model contract summary
- `roadmap.md`: shipped milestones and active technical debt
- `../guides/development-constraints.md`: development and styling constraints
- `../guides/documentation-sync.md`: documentation update policy
- `../migration/ai-core-migration-record.md`: private AI core split record

## Audit Notes

The old `.docs` set was useful context, but parts of it no longer matched the repo. The rebuilt docs intentionally correct these examples:

- AI runtime is not stored under `backend/src/ai/*` except for `bridge.js`
- `backend/private_core/sayachan-ai-core` is the private core boundary
- Pinia is in use for chat, cockpit signals, and runtime controls
- project focus is task-based through `Project.currentFocusTaskId`
- archive and restore behavior includes task cascades for notes and projects
- Dashboard AI is still partly frontend-direct via `VITE_GLM_API_KEY`

Until cleanup is complete, `.docs` remains as legacy reference only and should not be treated as the canonical baseline.
