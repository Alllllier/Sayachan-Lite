# Backend CRUD Service Extraction First Pass

- Archived date: `2026-05-04`
- PMO closeout result: `completed and validated`
- Source sprint: `Backend CRUD Service Extraction First Pass`
- Source report: `state/execution_report.md`
- Delivered summary:
  - Added first-pass backend service modules under `backend/src/services/`:
    - `notesService.js` for note list/create/update/delete/pin/unpin/archive/restore and note-origin task archive/restore cascade.
    - `projectsService.js` for project list/create/update/delete/pin/unpin/archive/restore, project lifecycle restore status derivation, project-origin task cascade, and current-focus clearing on project archive.
    - `tasksService.js` for task list/create/update/delete, lifecycle status/completed/archive update orchestration, and focus clearing on project-owned task completion/archive/delete.
  - Reduced `backend/src/routes/index.js` toward Koa adapter responsibilities:
    - routes read `ctx.params`, `ctx.query`, and `ctx.request.body`
    - routes assign `ctx.status` and `ctx.body`
    - routes retain explicit 404 payload mapping
    - route registration and health endpoint remain in the route file
  - Moved the shared task runtime helper surface from `backend/src/routes/taskRuntimeHelpers.js` to `backend/src/services/taskRuntimeHelpers.js` after service extraction, without changing helper behavior.
- Validation summary:
  - Ran from `backend/`: `npm test`
  - Result: passing
  - Coverage evidence:
    - `routes.contract-baseline.test.js`: passing
    - `routes.behavior-lock.test.js`: passing
    - `routes.restore-scoping.test.js`: passing
    - `taskRuntimeHelpers.guardrail.test.js`: passing
    - Full suite result: 18 tests passing, 0 failing
  - PMO review reran `npm test` from `backend/` after moving `taskRuntimeHelpers.js` into `backend/src/services/`; result remained 18 tests passing, 0 failing.
- Project-specific review summary:
  Not separately stated.
- Unverified areas:
  Not separately stated.
- Residual risks or escalations:
  Not separately stated.
- Documentation-sync outcome: `documentation sync required and completed`
- Follow-up routing:
  Not separately stated.
