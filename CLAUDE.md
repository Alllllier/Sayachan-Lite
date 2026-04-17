# Sayachan Lite - Claude Execution Entrypoint

## Purpose

This file is the execution entrypoint for Claude working inside this repository.

Use it to:

- understand the current project shape quickly
- find the correct `docs/**` references
- follow the repo-native PMO execution loop
- avoid drifting back to legacy `.docs` guidance

This file is not the canonical architecture source. Canonical sources live under `docs/**`.

---

## Immediate Rule

If the human explicitly says to execute the current sprint or current outbox task:

1. read `docs/pmo/outbox/execution_task.md` first
2. treat it as the execution contract
3. optionally read `docs/pmo/state/current_sprint.md` for lightweight sprint state
4. write the result into `docs/pmo/inbox/execution_report.md`

Do not start with broad repo exploration when the outbox file already defines the active task.

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

Current stack at a glance:

- frontend: Vue 3 + Vite + Vue Router + Pinia
- backend: Node.js + Koa + Mongoose
- database: MongoDB
- public AI entrypoints: backend `/ai/*` routes plus some frontend-direct Dashboard AI helpers
- private AI core: `backend/private_core/sayachan-ai-core`

---

## Read In This Order

### When Executing The Current Sprint

1. `docs/pmo/outbox/execution_task.md`
2. `docs/pmo/state/current_sprint.md`
3. `docs/architecture/system-baseline.md`
4. only the additional docs needed for the assigned slice

### When Planning Is Still Open

1. `docs/pmo/state/discussion_batches/index.md`
2. the active batch file under `docs/pmo/state/discussion_batches/`
3. `docs/pmo/state/idea_backlog.md` or `docs/pmo/state/sprint_candidates.md` if relevant
4. `docs/architecture/system-baseline.md`

### Core Canonical References

- architecture baseline: `docs/architecture/system-baseline.md`
- runtime workflow: `docs/architecture/runtime-workflow.md`
- backend contract baseline: `docs/architecture/backend-api.md`
- shipped scope and debt: `docs/architecture/roadmap.md`
- development rules: `docs/guides/development-constraints.md`
- documentation sync: `docs/guides/documentation-sync.md`
- PMO operating model: `docs/pmo/PMO_OPERATING_MANUAL.md`
- PMO handoff protocol: `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`

---

## PMO Execution Rules

- `docs/pmo/state/current_sprint.md` is the lightweight PMO state card
- `docs/pmo/outbox/execution_task.md` is the canonical worker handoff
- `docs/pmo/inbox/execution_report.md` is the required completion report destination
- do not treat `current_sprint.md` as a substitute for the outbox execution contract
- when the outbox is active, execute from it rather than reconstructing the task from scattered context

Repo-native PMO ownership model:

- Codex writes PMO state and outbox
- Claude executes the bounded slice
- Claude writes the inbox report
- Human resolves architecture decisions when escalation is required

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

---

## AI Feature Rules

- every AI feature should define a fallback behavior
- prefer backend mediation for new AI features unless there is a strong reason not to
- architecture-sensitive AI work must respect the public bridge and private core boundary
- avoid introducing ambiguous rendering or behavior policy changes without documenting them

---

## Documentation Rules

- treat `docs/**` as canonical
- treat legacy `.docs/**` as non-canonical historical material
- do not prefer `.docs/**` over `docs/**`
- when changing architecture-sensitive behavior, review `docs/guides/documentation-sync.md`

Typical mapping:

- models or routes -> `docs/architecture/backend-api.md`
- workflow behavior or context flow -> `docs/architecture/runtime-workflow.md`
- AI boundary or execution-risk zones -> `docs/architecture/system-baseline.md`
- PMO workflow or handoff changes -> `docs/pmo/**` and `docs/ai-ops/**`

---

## Practical Reminders

- when asked to modify UI, check `frontend/src/style.css` first
- when asked to modify API behavior, review `docs/architecture/backend-api.md`
- when asked to execute the current sprint, go straight to `docs/pmo/outbox/execution_task.md`
- when asked to report completion, write to `docs/pmo/inbox/execution_report.md`

---

## File Index

| Use | Path |
|---|---|
| backend entry | `backend/src/server.js` |
| main routes | `backend/src/routes/index.js` |
| AI routes | `backend/src/routes/ai.js` |
| notes model | `backend/src/models/Note.js` |
| projects model | `backend/src/models/Project.js` |
| tasks model | `backend/src/models/Task.js` |
| frontend entry | `frontend/src/main.js` |
| frontend router | `frontend/src/router/index.js` |
| chat UI | `frontend/src/components/ChatEntry.vue` |
| notes UI | `frontend/src/components/NotesPanel.vue` |
| AI service helpers | `frontend/src/services/aiService.js` |
| chat service | `frontend/src/services/chatService.js` |
| task service | `frontend/src/services/taskService.js` |

---

*Updated: 2026-04-17*
