# Backend Route Module Split

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_016.md slice-003; docs/pmo/history/reports/backend-request-validation-and-error-boundary.md`
- Why it mattered: The backend now has first-pass services and a local request/error boundary, but `backend/src/routes/index.js` still concentrates health, notes, projects, tasks, validation imports, route wrapper, route registration, and test helper exports in one file. Splitting non-AI route modules is now a low-risk architecture cleanup that improves maintainability without changing API behavior.
- Expected outcome: Split non-AI backend routes into small route modules for health, notes, projects, and tasks while preserving all existing URLs, status codes, response shapes, validation/error-boundary behavior, and backend tests.
- In scope:
  `Create route modules such as healthRoutes.js, notesRoutes.js, projectsRoutes.js, and tasksRoutes.js under backend/src/routes/; keep index.js as the non-AI route aggregator; preserve requestValidation.js and service imports at the appropriate route-module boundary; preserve or relocate the current __test__ helper exports so existing backend tests remain meaningful; update backend tests only as needed for the new route module structure; run backend npm test.`
- Out of scope:
  `AI route changes; frontend changes; app/server split; config centralization; repository layer; auth/account scoping; validation semantics changes; response-shape changes; URL changes; broad service refactor.`
- Dependencies: Completed Backend CRUD Service Extraction First Pass; completed Backend Request Validation And Error Boundary; existing backend tests must continue to protect route contracts, behavior locks, restore scoping, and helper guardrails.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Non-AI backend routes now split into health/notes/projects/tasks modules; ai.js remains separately mounted by server.js by design.`
