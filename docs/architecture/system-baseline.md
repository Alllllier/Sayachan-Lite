# System Baseline

> Audited against the live repository on 2026-04-16.

## Purpose

This document describes the current architecture that actually exists in the repo, with emphasis on execution boundaries and PMO-safe planning assumptions.

## Current System Shape

Sayachan Lite is a frontend-backend monorepo with a public product runtime and a private AI core boundary.

Primary public runtime surfaces:

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

## Public vs Private Core Split

Public repo responsibilities:

- UI pages, components, services, and stores
- Notes, Projects, Tasks CRUD and workflow rules
- public AI HTTP entrypoints under `backend/src/routes/ai.js`
- bridge boundary at `backend/src/ai/bridge.js`

Private core responsibilities:

- chat orchestration
- personality and prompt composition
- provider integration used by chat runtime
- deeper context building policies

Boundary rule:

- `backend/src/ai/bridge.js` is the only intended public bridge into the private core
- work that changes the bridge contract or private core responsibility split should be treated as architecture-owner scope

Reference:

- see `docs/architecture/private-core-boundary.md` for the canonical boundary record

## Domain Rules That Matter

### Notes

- notes store raw text markdown in `note.content`
- notes support pin, unpin, archive, restore, and delete
- archiving a note cascades to tasks where `originModule === 'note'` and `originId === note._id`

### Projects

- projects store status plus `currentFocusTaskId`
- current focus is task-based, not free-text next action
- archiving a project clears `currentFocusTaskId` and archives related tasks

### Tasks

- tasks use semantic provenance fields: `creationMode`, `originModule`, `originId`, `originLabel`, `linkedProjectId`, `linkedProjectName`
- legacy compatibility fields still exist on the model and should not be treated as the preferred contract
- completing, archiving, or deleting a focused project task can clear `Project.currentFocusTaskId`

### Dashboard

- Dashboard is both a user surface and a lightweight context source for chat
- it publishes `activeProjectsCount`, `activeTasksCount`, `pinnedProjectName`, and `currentNextAction` into `cockpitSignals`
- Dashboard AI helpers still call GLM directly from the frontend when `VITE_GLM_API_KEY` is present

### Chat

- chat UI lives in the public repo at `frontend/src/components/ChatEntry.vue`
- chat sends through backend `/ai/chat`
- runtime controls include baseline persona plus `warmth` and `convergenceMode`
- when dashboard context is not hydrated, chat pulls a snapshot through `dashboardContextService`

## Safe Zones

Usually safe for bounded product-surface work:

- `frontend/src/components/NotesPanel.vue`
- `frontend/src/components/ProjectsPanel.vue`
- `frontend/src/components/Dashboard.vue`
- `frontend/src/views/*`
- `frontend/src/services/taskService.js`
- `frontend/src/style.css`
- `backend/src/models/Note.js`
- bounded note/project/task route changes in `backend/src/routes/index.js`

Use extra caution:

- `backend/src/routes/index.js` for project-task coupling rules
- `frontend/src/services/dashboardContextService.js`
- `frontend/src/stores/cockpitSignals.js`
- `frontend/src/stores/runtimeControls.js`
- `frontend/src/components/ChatEntry.vue`
- `frontend/src/services/chatService.js`

Do not change without explicit boundary review:

- `backend/src/ai/bridge.js`
- `backend/private_core/sayachan-ai-core/**`
- focus/task semantics beyond compatibility-safe changes
- public/private core responsibility split

## Known Risks And Debt

- Dashboard AI is still frontend-direct while Notes, Projects, and Chat are backend-mediated
- Task model still carries legacy compatibility fields that can invite drift
- workflow-critical focus logic lives mostly in route handlers, not a separate domain module
- README still presents a simpler system than the current repo actually contains
