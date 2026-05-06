# Route Schema Placement V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/notes-projects-mutation-zod-boundary.md`
- Why it mattered: Tasks, Notes, and Projects mutation validators now use Zod inside requestValidation.js. The file is still functional but is becoming crowded with schemas, shared helper behavior, and validator exports. Before migrating Auth or AI payloads, the repo should establish the route-owned schema placement that the human already preferred.
- Expected outcome: Move existing task/note/project mutation schemas into backend/src/routes/schemas/mutations.js, move request-body validation middleware/runtime behavior into backend/src/middleware/requestBodyValidation.js, retire requestValidation.js, and update routes to declare validateBody(schema) middleware while preserving all public validation behavior.
- In scope:
  `Create backend/src/middleware/requestBodyValidation.js for BadRequestError, assertZodSchema, and validateBody(schema); create backend/src/routes/schemas/mutations.js for current task/note/project mutation schemas; update notes/projects/tasks routes to use validateBody(schema) middleware before handlers; delete or retire backend/src/routes/requestValidation.js if no longer needed; keep focused route contract tests passing.`
- Out of scope:
  `No Auth or AI validation migration; no new schemas beyond moving existing task/note/project schemas; no parsed body assignment to ctx.request.body or ctx.state.validatedBody; no public response-shape change; no frontend changes; no TypeScript migration; no workspace/tooling changes; no behavior refactor of services, routes, archive, focus, ownership, or lifecycle logic.`
- Dependencies: Completed Task Mutation Zod Schema Pilot, Validation Error Shape V1, Notes Projects Mutation Zod Boundary, backend/src/routes/requestValidation.js, backend route contract tests, decision_log runtime schema placement rule.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend route contract tests, npm --prefix backend test, and npm run check. Confirm public 400 response shape remains unchanged.`
- Escalation triggers:
  `Return to PMO if placement requires Auth/AI migration, frontend changes, public response-shape changes, broad error-boundary changes, parsed body assignment, or service/model behavior changes.`
- Follow-up parking:
  `After placement lands, PMO should decide whether Auth payload schema is ready, whether AI payloads need separate discussion, whether parsed body boundary deserves its own decision/pilot, or whether runtime schema adoption should pause.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Route request-body validation now uses backend/src/middleware/requestBodyValidation.js for BadRequestError/assertZodSchema/validateBody and backend/src/routes/schemas/mutations.js for task/note/project mutation schemas. requestValidation.js was deleted, routes declare validateBody(schema) middleware, public 400 responses remain unchanged, and parsed-body assignment remains explicitly deferred.`
