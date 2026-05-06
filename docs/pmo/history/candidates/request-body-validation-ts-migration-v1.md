# Request Body Validation TS Migration V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/tasks-route-ts-migration-v1.md`, human approval to continue migration in chat on 2026-05-07`
- Why it mattered: All product mutation routes now compile from TypeScript. The DTO pilot only checks the request-body validation middleware/schema bridge, so converting that middleware to TypeScript can retire the pilot.
- Expected outcome: Convert requestBodyValidation middleware to TypeScript, compile it through the unified backend build, remove the DTO pilot tsconfig/scripts, and keep public validation behavior unchanged.
- In scope:
  `backend/src/middleware/requestBodyValidation.ts, backend tsconfig include/exclude, DTO pilot script/config/root script cleanup, PMO baseline truth.`
- Out of scope:
  `No Zod/API behavior change; no service/model migration; no ESM/runtime loader; no private_core change.`
- Dependencies: `Notes, Projects, Tasks, and schema modules compile through unified backend build.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: `Human authorizes continuing backend migration automation.
- Validation expectation:
  `npm --prefix backend run check:backend-dist-runtime and npm run check pass; route contract tests still prove BadRequestError/assertZodSchema public behavior.`
- Escalation triggers:
  `Return to human if this requires changing public 400 response shape, BadRequestError metadata shape, validateBody parsed-body behavior, ESM/runtime loader, or private_core boundary.`
- Follow-up parking:
  `After DTO pilot retirement, reassess the next durable backend TS boundary: services, task runtime helpers, models, or auth middleware.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
