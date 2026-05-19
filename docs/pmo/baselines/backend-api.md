# Backend API Baseline

> Audited against `backend/src/routes/**`, `backend/src/services/**`, and current Mongoose models on `2026-05-04`.

## Purpose

This document records the current backend API and model truth that the PMO should treat as canonical when planning or reviewing backend-sensitive work.

It is a truth baseline, not a protocol and not a policy file.

## Service Basics

- default backend base URL: `http://localhost:3001`
- CORS origins: comma-separated `FRONTEND_ORIGINS`, fallback `FRONTEND_ORIGIN`, fallback `http://localhost:5173`
- CORS credentials: enabled for cookie-backed frontend sessions and bearer-token fallback requests
- body parser: JSON request bodies
- database startup is environment-aware: local/test development may continue when MongoDB is unavailable, while `NODE_ENV=production` or `REQUIRE_MONGODB=true` requires `MONGO_URI` and fails startup on connection failure
- normal non-health/readiness product/API routes require a valid `sayachan_session` cookie or `Authorization: Bearer <sessionToken>` unless listed as public auth routes
- Note, Project, Task, and persisted AI note/project product route pipelines attach current-user middleware before service/model access; they are personal-account scoped routes, not anonymous content routes
- Note, Project, and Task product services require `userId` and do not support unowned single-user content reads or writes
- product route id boundaries parse valid external id strings into Mongo `ObjectId` values before service/model access; invalid `:id`, `projectId`, `currentFocusTaskId`, or current-user ids fail with a stable 400 invalid object id response instead of reaching Mongoose
- `Task.originId` remains a provenance field and is not yet globally cast to `ObjectId`; note/project provenance tightening is a separate contract decision
- owner bootstrap may be invoked by API or by `npm run bootstrap:owner` from the backend workspace, which calls the same API against a configured backend URL

## Backend Type Boundary

- the backend API production/start runtime is compiled ESM under `backend/dist`; `start` builds before running `node dist/server.js`
- backend `dev` uses `tsx watch src/server.ts`, and `start` is the explicit build-backed dist runtime path
- Notes, Projects, and Tasks request schemas are authored in `packages/contracts/src/product.ts`
- backend route modules consume product request schemas from `@sayachan/contracts`; product services consume the same shared request DTO types
- backend source under `backend/src` is TypeScript and is consumed from compiled backend dist output
- this type boundary does not change route URLs, request bodies, parsed DTO behavior, or public error payloads

## Current Models

### Note

Current Note fields:

- `title`
- `content`
- `archived`
- `isPinned`
- `pinnedAt`
- `userId`

Timestamps are enabled.

Current Note indexes:

- `{ userId: 1, archived: 1, isPinned: -1, pinnedAt: -1, updatedAt: -1 }`

### Project

Current Project fields:

- `name`
- `summary`
- `status`
- `archived`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`
- `userId`

Allowed Project statuses:

- `pending`
- `in_progress`
- `completed`
- `on_hold`

Timestamps are enabled.

Current Project indexes:

- `{ userId: 1, archived: 1, isPinned: -1, pinnedAt: -1, updatedAt: -1 }`

### Task

Preferred Task contract fields:

- `title`
- `creationMode`
- `originModule`
- `originId`
- `status`
- `archived`
- `completed`
- `userId`

Allowed Task statuses:

- `active`
- `completed`

Timestamps are enabled.

Current Task indexes:

- `{ userId: 1, archived: 1, createdAt: -1 }`
- `{ userId: 1, originModule: 1, originId: 1, archived: 1 }`

### User

Current User fields:

- `email`
- `passwordHash`
- `passwordSalt`
- `role`
- `status`
- `emailVerifiedAt`
- `phone`
- `phoneVerifiedAt`

Allowed User roles:

- `owner`
- `tester`

Allowed User statuses:

- `active`
- `disabled`

Timestamps are enabled.

### Invite

Current Invite fields:

- `codeHash`
- `codePreview`
- `role`
- `expiresAt`
- `revokedAt`
- `usedAt`
- `usedBy`
- `createdBy`

Current Invite truth:

- invite codes are not bound to email
- invite codes are single-use
- invite codes expire after one month
- owner can revoke unused invites
- the full invite code is returned only when created; later listing returns preview metadata

Timestamps are enabled.

### Session

Current Session fields:

- `tokenHash`
- `userId`
- `expiresAt`

Sessions back the httpOnly `sayachan_session` cookie and the frontend bearer-token fallback used when cross-site browser cookie handling is unavailable.

## Route Surface

### Non-AI Error Contract

- JSON error normalization is handled by the app-level backend error middleware before parser, auth, and route dispatch
- malformed or invalid `POST` / `PUT` bodies on Notes, Projects, and Tasks return `400` with `{ error: 'Invalid request body' }`
- Notes, Projects, and Tasks create/update routes validate request bodies through route-owned Zod schemas and pass the parsed DTO from `ctx.state.validatedBody` into services while leaving raw `ctx.request.body` unchanged
- existing missing-id route errors remain resource-specific `404` payloads such as `{ error: 'Note not found' }`, `{ error: 'Project not found' }`, and `{ error: 'Task not found' }`
- unexpected non-AI route/service failures return `500` with `{ error: 'Internal server error' }` and do not expose raw internal error messages in the response body

### Health

- `GET /health`
- `GET /ready`

Health response includes:

- backend status
- timestamp
- Mongo connection state

Readiness response uses the same Mongo connection state, returning `200` with `status: ok` when MongoDB is connected and `503` with `status: unavailable` when disconnected.

### Auth And Owner

Public auth routes:

- `GET /health`
- `GET /ready`
- `POST /auth/bootstrap-owner`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Owner-only routes:

- `POST /owner/invites`
- `GET /owner/invites`
- `POST /owner/invites/:id/revoke`
- `GET /owner/testers`
- `POST /owner/testers/:id/disable`
- `POST /owner/testers/:id/restore`
- `GET /owner/system-status`

Current behavior truth:

- bootstrap creates the first owner only when no owner exists
- bootstrap creates the first owner account only; it no longer assigns legacy product records without `userId`
- tester registration requires email, password, and a valid invite code
- login creates a server session, sets `sayachan_session`, and returns `{ sessionToken, user }` for the frontend bearer-token fallback
- logout clears `sayachan_session` and deletes the server session when present
- disabled users are rejected on session load and their sessions are removed when disabled
- owner routes expose invite management, tester metadata/status management, and basic system status only

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
- note reads and mutations are scoped to the authenticated current user
- direct-id mutations for another user's notes behave as not found through the scoped service path
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
- project reads and mutations are scoped to the authenticated current user
- direct-id mutations for another user's projects behave as not found through the scoped service path
- archive clears `currentFocusTaskId`
- archive cascades through canonical project provenance (`originModule='project'` plus `originId=<projectId>`) scoped to the authenticated current user
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
- `?projectId=...` uses canonical project provenance (`originModule='project'` plus `originId=<projectId>`)
- task reads and mutations are scoped to the authenticated current user
- direct-id mutations for another user's tasks behave as not found through the scoped service path
- task creation treats semantic provenance fields as canonical
- updating a task can change `status`, `completed`, and `archived`
- completing a focused canonical project task can clear `Project.currentFocusTaskId`
- archiving a focused task clears `Project.currentFocusTaskId`
- deleting a focused task clears `Project.currentFocusTaskId`

### AI

- `POST /ai/notes/tasks`
- `POST /ai/projects/next-action`
- `POST /ai/chat`
- `POST /ai/chat/stream`

Current behavior truth:

- AI routes are behind the same session gate as other normal product/API routes
- `/ai/notes/tasks` reloads persisted note payloads by `_id` plus current `userId` before using note title/content for fallback or provider prompts
- `/ai/projects/next-action` reloads persisted project payloads by `_id` plus current `userId` before using project name/summary/status/current focus
- project next-action focus task title resolution is scoped by both task id and current `userId`
- missing or cross-account persisted note/project ids return `404`
- ad hoc AI note/project payloads without `_id` remain accepted for existing non-persisted frontend behavior
- note and project AI currently use `GLM_API_KEY`
- chat uses the private-core bridge; `/ai/chat` returns a normal JSON `{ reply }` response, while `/ai/chat/stream` preserves the same request body and returns Server-Sent Events for `text_delta`, `completed`, and `error`
- chat requests may include `runtimeControls.providerState`; OpenAI Responses state returns as optional `providerState` on normal chat responses or completed stream events
- all current AI routes still have fallback responses

## Current Contract Notes That Matter

- `/ai/chat` is the public API entrypoint into private-core chat execution
- `/ai/chat/stream` is the parallel streaming entrypoint; keep `/ai/chat` stable so frontend can choose streaming with a UI control instead of changing the default request path
- task-project coupling now lives mainly in first-pass backend service modules under `backend/src/services/`, while `backend/src/routes/index.ts` acts as the non-AI route aggregator for health, notes, projects, and tasks route modules
- changing archive semantics, focus-clearing behavior, or bridge usage should be treated as architecture-sensitive work
- semantic task provenance fields are the canonical read and write path

## What This Baseline Does Not Do

This document does not define:

- PMO workflow
- validation policy
- documentation sync rules
- execution ownership

Those belong in PMO protocols or PMO policies rather than in API truth.
