# Sayachan Lite - Agent Execution Entrypoint

## Purpose

This file is the execution entrypoint for an implementation agent working inside this repository.

Use it to:

- find the active worker contract quickly
- understand the current project shape
- follow repo-native validation and reporting defaults
- avoid treating PMO planning docs as worker instructions

This file is not the canonical architecture or PMO source. Canonical sources live under `docs/**`.

---

## Immediate Rule

If the human explicitly says to execute the current sprint or active PMO task, read `docs/pmo/state/execution_task.md` first and treat it as the execution contract.

Write the result into `docs/pmo/state/execution_report.md`.

Do not start with broad repo exploration when the active handoff already defines the task.

Treat natural execution prompts such as:

- `开始施工`
- `开始做`
- `开始实现`
- `去施工`
- `按当前 sprint 做`
- `按当前任务做`

as execution-start authority for the active PMO handoff unless the human clearly signals that planning is still open.

If `execution_task.md` is idle or missing a real task, stop and ask PMO/Codex for an active handoff instead of planning from backlog or candidates yourself.

---

## Current Project Shape

Sayachan Lite is a lightweight personal operating system centered on:

`Focus -> Task -> Completion -> Memory -> Next Focus`

Current runtime surfaces:

- Notes
- Projects
- Tasks
- Dashboard
- Chat

Current stack:

- frontend: Vue 3 + Vite + Vue Router + Pinia
- backend: Node.js + Koa + Mongoose
- database: MongoDB
- public AI entrypoints: backend `/ai/*` routes
- private AI core: `backend/private_core/sayachan-ai-core`

---

## Read In This Order

When executing the current sprint:

1. `docs/pmo/state/execution_task.md`
2. `docs/pmo/state/current_sprint.md`
3. `docs/pmo/baselines/system-baseline.md`
4. only the additional docs needed for the assigned slice

Core references:

- system baseline: `docs/pmo/baselines/system-baseline.md`
- runtime baseline: `docs/pmo/baselines/runtime-baseline.md`
- backend contract baseline: `docs/pmo/baselines/backend-api.md`
- engineering conventions: `ENGINEERING_CONVENTIONS.md`
- architecture-sensitive areas: `docs/pmo/policies/architecture-sensitive-areas.md`
- documentation sync guide: `docs/pmo/policies/documentation-sync-guide.md`
- handoff protocol, only if the active task is ambiguous: `docs/pmo/protocols/execution-handoff-protocol.md`

---

## Execution Rules

- `docs/pmo/state/execution_task.md` is the canonical worker contract.
- `docs/pmo/state/current_sprint.md` is PMO runtime context, not a substitute for the active task.
- `docs/pmo/state/execution_report.md` is the mutable completion report surface until PMO closeout.
- Same-scope human-review fixes should stay inside the current execution loop; update the same report instead of starting a new PMO cycle yourself.
- If a human-review request slightly exceeds the original handoff wording but is still clearly same-scope and directly instructed, you may implement it and must mark that deviation explicitly in `execution_report.md`.

Ownership model:

- Codex/PMO writes PMO state and the active execution contract.
- The execution worker implements the bounded slice.
- The execution worker writes the active execution report.
- The human resolves architecture decisions when escalation is required.

---

## Core Constraints

- keep the repo JavaScript-first
- avoid broad architecture refactors without explicit approval
- preserve backward compatibility when touching persisted task data
- every AI feature should continue to have a fallback path
- keep logs prefixed by module or feature when adding new operational logging

Do not silently cross these sensitive boundaries:

- `backend/src/ai/bridge.js`
- `backend/private_core/sayachan-ai-core/**`
- focus/task workflow semantics
- dashboard-to-chat context contracts
- task archive cascade rules
- public/private core responsibility split

---

## UI Constraints

Use shared primitives from `frontend/src/style.css` whenever they already fit the job.

Prefer:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-archive`, `.btn-ai`
- `.input`, `.textarea`
- `.card` and card accent variants
- CSS variables such as `--action-primary`, `--surface-card`, `--text-muted`, `--space-*`, `--radius-*`

Avoid:

- duplicating base button or input styling in component-local CSS
- hardcoding colors already represented by semantic variables
- redefining shared primitives in scoped styles when layout-only styles would suffice

### UI Review Defaults

- prefer repo-defined scripts in `frontend/package.json` first
- do not run bare `npx playwright test ...` commands when validating product changes
- use repo-native Playwright scripts such as `npm run test:ui-review`
- if the existing repo-native script does not cover the surface you changed, add or adjust a repo-native script first, then run that script
- bare `npx playwright` use is only acceptable for clearly non-suite utility actions such as one-off inspection or screenshot capture when that does not bypass the repo-native validation path

### Success Feedback Defaults

- prefer the shared `Toast` component as the default success-feedback path
- do not add a new local inline success-message state unless the task explicitly needs a persistent in-context confirmation that would become unclear as a transient toast
- if a surface already mixes toast plus local inline success labels for routine success events, prefer consolidating toward toast rather than extending the mixed pattern

---

## AI Feature Rules

- every AI feature should define a fallback behavior
- prefer backend mediation for new AI features unless there is a strong reason not to
- architecture-sensitive AI work must respect the public bridge and private core boundary
- avoid introducing ambiguous rendering or behavior policy changes without documenting them

---

## Report Contract

Before reporting sprint completion, write or update `docs/pmo/state/execution_report.md` with:

- what changed
- what validation was run
- whether browser validation was performed
- whether UI review was performed
- what remains unverified
- residual risks or escalations
- documentation-sync notes when the work changed truth, PMO runtime, or execution behavior

PMO/Codex owns final closeout and archival.

---

## End-Of-Work Hygiene

Before reporting sprint completion, check for leftover local dev servers that were started for the current sprint.

Default ports:

- `5173` for the frontend dev server
- `3001` for the backend dev server

If one of these ports is still occupied by a process that was started for the current execution session, shut it down before writing the final completion report.

Do not kill unrelated long-running services just because they happen to use these ports. If ownership is unclear, report the ambiguity instead of forcefully terminating the process.

---

## File Index

| Use | Path |
|---|---|
| backend entry | `backend/src/server.js` |
| non-AI route aggregator | `backend/src/routes/index.js` |
| non-AI route modules | `backend/src/routes/healthRoutes.js`, `backend/src/routes/notesRoutes.js`, `backend/src/routes/projectsRoutes.js`, `backend/src/routes/tasksRoutes.js` |
| backend services | `backend/src/services/` |
| AI routes | `backend/src/routes/ai.js` |
| notes model | `backend/src/models/Note.js` |
| projects model | `backend/src/models/Project.js` |
| tasks model | `backend/src/models/Task.js` |
| frontend entry | `frontend/src/main.js` |
| frontend router | `frontend/src/router/index.js` |
| dashboard page | `frontend/src/views/DashboardPage.vue` |
| dashboard UI | `frontend/src/components/Dashboard.vue` |
| notes UI | `frontend/src/components/NotesPanel.vue` |
| projects UI | `frontend/src/components/ProjectsPanel.vue` |
| chat UI | `frontend/src/components/Chat.vue` |
| chat feature | `frontend/src/features/chat/` |
| shared task service | `frontend/src/services/tasks/` |

---

*Updated: 2026-05-04*
