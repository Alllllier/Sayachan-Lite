# System Baseline

> Audited against the live repository on `2026-05-04`.

## Purpose

This document records the current system shape that actually exists in the repo.

It is a truth baseline for PMO v2, not a workflow manual and not a policy file.

## Current System Shape

Sayachan Lite is currently a frontend-backend monorepo with a public product runtime and a private AI core boundary.

Primary public runtime surfaces:

- Notes
- Projects
- Tasks
- Dashboard
- Chat

Current stack at a glance:

- frontend: `Vue 3 + Vite + Vue Router + Pinia`
- backend: `Node.js + Koa + Mongoose`
- database: `MongoDB`
- public AI surfaces: backend `/ai/*` routes
- private AI core bridge: `backend/src/ai/bridge.js`
- private core location: `backend/private_core/sayachan-ai-core`

Current frontend code shape:

- route pages under `frontend/src/views/` are thin page shells
- `frontend/src/App.vue` owns the global app shell, bottom navigation, and always-mounted Chat entrypoint
- `frontend/src/views/LoginPage.vue`, `frontend/src/views/RegisterPage.vue`, and `frontend/src/views/OwnerPage.vue` provide the phase-one auth and lightweight owner-management shell
- `frontend/src/stores/auth.js` owns current-user/session state on the frontend
- module feature logic lives under `frontend/src/features/{module}/`
- feature modules use `*.api.js`, `*.rules.js`, and `use*Feature.js` where applicable
- shared app-level services remain under `frontend/src/services/`
- shared API requests use `frontend/src/services/apiClient.js` so session cookies are sent with product API calls
- shared task service internals live under `frontend/src/services/tasks/` as API, rules, and runtime state modules
- auth-aware account switching resets frontend-only chat/cockpit transient state and scopes Notes failure-draft localStorage by authenticated account key

Current repo-native validation shape:

- feature and service behavior tests live alongside frontend feature/service modules
- browser/UI review baselines live under `frontend/tests/ui-review/<surface>/`
- current UI review surfaces are Notes, Projects, Dashboard, and Chat
- UI review API mocks include authenticated `/auth/me` responses so guarded app-shell routes render during review
- UI review screenshots are retained as review artifacts, not golden visual assertions

## Public Runtime Surfaces

### Notes

Current Notes behavior includes:

- notes CRUD
- raw markdown text stored in `note.content`
- pin / unpin
- archive / restore
- note-origin task archive / restore cascade
- markdown editing and rendering in the UI

### Projects

Current Projects behavior includes:

- projects CRUD
- status tracking
- task-based focus via `currentFocusTaskId`
- pin / unpin
- archive / restore
- related-task archive / restore cascade

### Tasks

Current Tasks behavior includes:

- executable work items with semantic provenance fields
- optional project linkage
- active / completed / archived status transitions
- focus-clearing side effects when the focused task is completed, archived, or deleted

### Dashboard

Current Dashboard behavior includes:

- quick-add tasks
- saved-task management

Important current truth:

- the older fallback-only Dashboard AI Assistant surface has been removed
- Dashboard no longer proactively publishes cockpit signals
- any future Dashboard AI workflow should reopen as a product/AI redesign rather than reviving the removed frontend-local helper path

### Chat

Current Chat behavior includes:

- public UI at `frontend/src/components/Chat.vue`
- feature logic under `frontend/src/features/chat/`
- backend entrypoint at `POST /ai/chat`
- assistant-message markdown rendering in the frontend
- user-authored chat messages still rendered as plain text
- runtime controls for personality baseline, warmth, and convergence mode
- cockpit context hydration on demand through `frontend/src/services/cockpitContextService.js`

## Backend Surface

Backend routes currently split into:

- `backend/src/routes/index.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/healthRoutes.js`
- `backend/src/routes/notesRoutes.js`
- `backend/src/routes/projectsRoutes.js`
- `backend/src/routes/tasksRoutes.js`
- `backend/src/routes/requestValidation.js`
- `backend/src/routes/routeBoundary.js`
- `backend/src/routes/ai.js`

Current AI route surface:

- `POST /ai/notes/tasks`
- `POST /ai/projects/next-action`
- `POST /ai/chat`

Current route behavior truth:

- `backend/src/middleware/auth.js` loads the current user from the `sayachan_session` cookie and gates normal non-health product/API routes
- auth, owner, health, note, project, and task routes are registered through `backend/src/routes/index.js` as the main route aggregator
- non-AI note/project/task route orchestration is split through first-pass service modules under `backend/src/services/`
- phase-one auth uses owner/tester roles, invite-gated registration, cookie-backed sessions, and lightweight owner management
- backend owner bootstrap can be run through `backend/scripts/bootstrapOwner.mjs` or `npm run bootstrap:owner` from the backend workspace
- Notes, Projects, and Tasks normal route/service reads and writes are scoped by current authenticated user
- Note, Project, and Task routes resolve the current user through `backend/src/routes/currentUser.js` before calling product services, so product route handlers do not intentionally support unowned current-user reads or writes
- Note, Project, and Task services use `backend/src/services/ownership.js` for required owner filters and do not retain unowned single-user content fallback branches
- public AI note/project routes reload persisted note/project context by current user ownership before constructing fallback/provider prompts
- project next-action focus task resolution is scoped by both task id and current user ownership
- note and project AI routes call GLM through backend route logic
- chat goes through `backend/src/ai/bridge.js` into the private core
- fallback responses still exist for all current AI routes

## Data Model Truth

### Note Model

Current Note fields:

- `title`
- `content`
- `archived`
- `isPinned`
- `pinnedAt`
- `userId`

Current Note indexes include the personal-account list path:

- `{ userId: 1, archived: 1, isPinned: -1, pinnedAt: -1, updatedAt: -1 }`

### Project Model

Current Project fields:

- `name`
- `summary`
- `status`
- `archived`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`
- `userId`

Current Project indexes include the personal-account list path:

- `{ userId: 1, archived: 1, isPinned: -1, pinnedAt: -1, updatedAt: -1 }`

### Task Model

Preferred Task contract fields:

- `title`
- `creationMode`
- `originModule`
- `originId`
- `status`
- `archived`
- `completed`
- `userId`

Current Task indexes include personal-account list and provenance paths:

- `{ userId: 1, archived: 1, createdAt: -1 }`
- `{ userId: 1, originModule: 1, originId: 1, archived: 1 }`

### Auth Models

Current auth model truth:

- `User` stores email, password hash/salt, role, status, and reserved verification fields
- supported phase-one roles are `owner` and `tester`
- supported phase-one statuses are `active` and `disabled`
- `Invite` stores non-email-bound single-use invite codes, expiration, revocation, and usage metadata
- `Session` stores cookie-backed session tokens and expiration for `sayachan_session`

## Current Domain Semantics

### Focus Semantics

Canonical current focus rule:

- a project is focused when `Project.currentFocusTaskId` points to an active task

### Provenance Semantics

Canonical current task provenance uses:

- `creationMode`
- `originModule`
- `originId`

### Archive Semantics

Current archive / restore behavior includes:

- note archive cascades to note-origin tasks
- note restore restores those archived note-origin tasks
- project archive cascades to related tasks and clears `currentFocusTaskId`
- project restore restores archived related tasks while preserving lifecycle semantics

## Public / Private Core Split

Observed current split:

- public repo owns product UI, stores, services, route surfaces, and the public chat route
- public frontend feature modules own module API/rules/orchestration boundaries
- `backend/src/ai/bridge.js` is the public bridge into the private core
- the private core owns chat orchestration, prompt kernel, provider integration used by chat runtime, and deeper context assembly policies

The detailed boundary rule itself should remain in the dedicated boundary document, not here.

Reference:

- `docs/pmo/baselines/private-core-boundary.md`

## Current Architectural Concentration Points

These are not rules, but current code-shape observations that matter for PMO truth:

- workflow-critical note/project/task orchestration now has a first-pass service layer under `backend/src/services/`
- focus-clearing logic is implemented through backend service flows and shared task runtime helpers
- chat runtime depends on the public bridge to the private core
- phase-one auth, invite-gated registration, cookie sessions, owner/tester roles, lightweight owner management, Note/Project/Task account ownership, and AI note/project persisted-context ownership now exist
- no backend-persisted chat history, cockpit/dashboard context, or runtime settings are currently present
