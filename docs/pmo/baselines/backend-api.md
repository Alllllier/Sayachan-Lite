# Backend API Baseline

> Audited against `backend/src/routes/index.js`, `backend/src/routes/ai.js`, and current Mongoose models on `2026-04-18`.

## Purpose

This document records the current backend API and model truth that the PMO should treat as canonical when planning or reviewing backend-sensitive work.

It is a truth baseline, not a protocol and not a policy file.

## Service Basics

- default backend base URL: `http://localhost:3001`
- CORS origin: `FRONTEND_ORIGIN` or `http://localhost:5173`
- body parser: JSON request bodies
- database startup is non-blocking; the server can run even when MongoDB is unavailable

## Current Models

### Note

Current Note fields:

- `title`
- `content`
- `status`
- `isPinned`
- `pinnedAt`

Allowed Note statuses:

- `active`
- `archived`

Timestamps are enabled.

### Project

Current Project fields:

- `name`
- `summary`
- `status`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`

Allowed Project statuses:

- `pending`
- `in_progress`
- `completed`
- `on_hold`
- `archived`

Timestamps are enabled.

### Task

Preferred Task contract fields:

- `title`
- `creationMode`
- `originModule`
- `originId`
- `originLabel`
- `linkedProjectId`
- `linkedProjectName`
- `status`
- `completed`

Legacy compatibility fields still present:

- `source`
- `sourceDetail`
- `projectId`
- `projectName`

Allowed Task statuses:

- `active`
- `completed`
- `archived`

Timestamps are enabled.

## Route Surface

### Health

- `GET /health`

Response includes:

- backend status
- timestamp
- Mongo connection state

### Notes

- `GET /notes`
- `POST /notes`
- `PUT /notes/:id`
- `DELETE /notes/:id`
- `PUT /notes/:id/pin`
- `PUT /notes/:id/unpin`
- `PUT /notes/:id/archive`
- `PUT /notes/:id/restore`

Current behavior truth:

- default list excludes archived notes
- `?archived=true` returns archived notes only
- sort order is pinned first, then `pinnedAt`, then `updatedAt`
- archive cascades to note-origin tasks
- restore restores those archived note-origin tasks

### Projects

- `GET /projects`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `PUT /projects/:id/pin`
- `PUT /projects/:id/unpin`
- `PUT /projects/:id/archive`
- `PUT /projects/:id/restore`

Current behavior truth:

- `currentFocusTaskId` can be shadow-written through `PUT /projects/:id`
- archive clears `currentFocusTaskId`
- archive cascades to related tasks by `linkedProjectId` or `originId`
- restore restores archived related tasks to active

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

Current behavior truth:

- default list excludes archived tasks
- `?archived=true` returns archived tasks only
- `?projectId=...` filters by `linkedProjectId`
- task creation treats semantic provenance fields as canonical
- updating a task can change `status` and `completed`
- completing a focused project-linked task can clear `Project.currentFocusTaskId`
- archiving a focused task can clear `Project.currentFocusTaskId`
- deleting a focused task can clear `Project.currentFocusTaskId`

### AI

- `POST /ai/notes/tasks`
- `POST /ai/projects/next-action`
- `POST /ai/chat`

Current behavior truth:

- note and project AI currently use `GLM_API_KEY`
- chat currently uses `KIMI_API_KEY` or `MOONSHOT_API_KEY`
- all current AI routes still have fallback responses

## Current Contract Notes That Matter

- `/ai/chat` is the public API entrypoint into private-core chat execution
- task-project coupling still lives mainly in route logic, not in a separate domain service layer
- changing archive semantics, focus-clearing behavior, or bridge usage should be treated as architecture-sensitive work
- semantic task provenance fields should remain the preferred write path over legacy compatibility fields

## What This Baseline Does Not Do

This document does not define:

- PMO workflow
- validation policy
- documentation sync rules
- execution ownership

Those belong in PMO protocols or PMO policies rather than in API truth.
