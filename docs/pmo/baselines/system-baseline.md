# System Baseline

> Audited against the live repository on `2026-05-03`.

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
- module feature logic lives under `frontend/src/features/{module}/`
- feature modules use `*.api.js`, `*.rules.js`, and `use*Feature.js` where applicable
- shared app-level services remain under `frontend/src/services/`

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
- `backend/src/routes/ai.js`

Current AI route surface:

- `POST /ai/notes/tasks`
- `POST /ai/projects/next-action`
- `POST /ai/chat`

Current route behavior truth:

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

### Project Model

Current Project fields:

- `name`
- `summary`
- `status`
- `archived`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`

### Task Model

Preferred Task contract fields:

- `title`
- `creationMode`
- `originModule`
- `originId`
- `status`
- `archived`
- `completed`

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

- workflow-critical project/task coupling still lives mainly in route handlers
- focus-clearing logic is implemented in route-level update/delete flows
- chat runtime depends on the public bridge to the private core
- top-level docs still present a simpler system than the current repo actually contains
