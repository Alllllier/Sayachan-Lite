# Backend API Baseline

> Audited against `backend/src/routes/index.js`, `backend/src/routes/ai.js`, and current Mongoose models on `2026-04-20`.

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
- `archived`
- `isPinned`
- `pinnedAt`

Allowed Note statuses:

- `active`

Timestamps are enabled.

### Project

Current Project fields:

- `name`
- `summary`
- `status`
- `archived`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`

Allowed Project statuses:

- `pending`
- `in_progress`
- `completed`
- `on_hold`

Timestamps are enabled.

### Task

Preferred Task contract fields:

- `title`
- `creationMode`
- `originModule`
- `originId`
- `status`
- `archived`
- `completed`

Legacy compatibility still tolerated in route logic:

- legacy rows with `linkedProjectId`
- legacy rows that still encode archive through `status='archived'`

Allowed Task statuses:

- `active`
- `completed`

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
- archive sets `Note.archived=true` and cascades archive visibility to note-origin tasks
- restore sets `Note.archived=false` and restores those note-origin tasks without flattening task lifecycle status

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
- archive primarily cascades through canonical project provenance (`originModule='project'` plus `originId=<projectId>`) while still tolerating legacy linked or origin-only rows
- archive sets `Project.archived=true` without rewriting project progress status
- restore sets `Project.archived=false` and restores archived related tasks without flattening task lifecycle status

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

Current behavior truth:

- default list excludes archived tasks
- `?archived=true` returns archived tasks only
- `?projectId=...` uses canonical project provenance (`originModule='project'` plus `originId=<projectId>`) while still tolerating legacy linked rows
- task creation treats semantic provenance fields as canonical
- updating a task can change `status`, `completed`, and `archived`
- restore-style updates on legacy `status='archived'` task rows normalize them into:
  - `archived=false`
  - `status='active'`
  - `completed=false`
- completing a focused canonical project task can clear `Project.currentFocusTaskId`
- archiving a focused task clears `Project.currentFocusTaskId`
- deleting a focused task clears `Project.currentFocusTaskId`

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
- semantic task provenance fields should remain the canonical write path over legacy compatibility reads
- legacy rows that still encode archive inside `status='archived'` are normalized through route compatibility instead of a full migration
- a small manual cleanup entry now exists for bulk normalization of legacy archived Task rows:
  - `backend/scripts/normalizeLegacyArchivedTasks.js`
  - `npm run normalize:legacy-archived-tasks`

## What This Baseline Does Not Do

This document does not define:

- PMO workflow
- validation policy
- documentation sync rules
- execution ownership

Those belong in PMO protocols or PMO policies rather than in API truth.
