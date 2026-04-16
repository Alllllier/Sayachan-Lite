# Backend API Baseline

> Summary audited from `backend/src/routes/index.js`, `backend/src/routes/ai.js`, and Mongoose models on 2026-04-16.

## Service Basics

- default base URL: `http://localhost:3001`
- CORS origin: `FRONTEND_ORIGIN` or `http://localhost:5173`
- body parser: JSON request bodies
- database startup is non-blocking; the server can run even if MongoDB is unavailable

## Models

### Note

- fields: `title`, `content`, `status`, `isPinned`, `pinnedAt`
- statuses: `active`, `archived`
- timestamps enabled

### Project

- fields: `name`, `summary`, `status`, `currentFocusTaskId`, `isPinned`, `pinnedAt`
- statuses: `pending`, `in_progress`, `completed`, `on_hold`, `archived`
- timestamps enabled

### Task

Preferred fields:

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

Task statuses:

- `active`
- `completed`
- `archived`

## Route Surface

### Health

- `GET /health`

### Notes

- `GET /notes`
- `POST /notes`
- `PUT /notes/:id`
- `DELETE /notes/:id`
- `PUT /notes/:id/pin`
- `PUT /notes/:id/unpin`
- `PUT /notes/:id/archive`
- `PUT /notes/:id/restore`

Notes list behavior:

- default excludes archived notes
- `?archived=true` returns archived notes only
- sort order is pinned first, then `pinnedAt`, then `updatedAt`

### Projects

- `GET /projects`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `PUT /projects/:id/pin`
- `PUT /projects/:id/unpin`
- `PUT /projects/:id/archive`
- `PUT /projects/:id/restore`

Projects update behavior:

- `currentFocusTaskId` can be shadow-written through `PUT /projects/:id`

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

Tasks list behavior:

- default excludes archived tasks
- `?archived=true` returns archived tasks only
- `?projectId=...` filters by `linkedProjectId`

Tasks workflow behavior:

- posting a task uses semantic provenance fields as the canonical creation contract
- updating a task can change `status` and `completed`
- completing a project-linked focus task can clear `Project.currentFocusTaskId`
- archiving or deleting a focused task can also clear `Project.currentFocusTaskId`

### AI

- `POST /ai/notes/tasks`
- `POST /ai/projects/next-action`
- `POST /ai/chat`

AI route behavior:

- note and project AI use `GLM_API_KEY`
- chat uses `KIMI_API_KEY` or `MOONSHOT_API_KEY`
- all current AI routes have fallback responses

## Important Contract Notes

- `/ai/chat` is the public entrypoint into private core chat execution
- task-project coupling is implemented in route logic, not a separate service layer
- changing archive semantics, focus clearing behavior, or bridge usage should be treated as architecture-sensitive work
