# Notes Projects Mutation Zod Boundary

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-003`
- Why it mattered: Task mutation Zod validation and Validation Error Shape V1 are complete. The repo can now test whether the same runtime-schema pattern works for ordinary product CRUD payloads before moving to more sensitive Auth or AI boundaries.
- Expected outcome: Migrate Notes and Projects create/update request-body validation to Zod while preserving public 400 response shape, existing route/service behavior, and current task/project/note lifecycle semantics.
- In scope:
  `Add Zod schemas for note create/update and project create/update in the current request validation surface; route failures through existing assertZodSchema/BadRequestError behavior; preserve unknown-field compatibility if it is the current effective behavior; update focused backend route contract tests for valid and invalid Notes/Projects mutation payloads.`
- Out of scope:
  `No Auth or AI validation migration; no frontend changes; no public response-shape change; no route/service/model behavior changes; no archive/focus/lifecycle changes; no schema-folder extraction yet; no TypeScript migration; no workspace/tooling changes.`
- Dependencies: Completed Task Mutation Zod Schema Pilot, completed Validation Error Shape V1, backend/src/routes/requestValidation.js, backend route contract tests, decision_log runtime schema error-shape rule.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend route contract tests, npm --prefix backend test, and npm run check. Confirm public 400 response shape remains unchanged for invalid Notes/Projects mutation payloads.`
- Escalation triggers:
  `Return to PMO if migration requires public API response changes, route/service/model behavior changes, Auth/AI migration, frontend changes, or schema-folder extraction to complete safely.`
- Follow-up parking:
  `Closeout should decide whether to migrate Auth payloads next, pause Zod adoption, or promote a separate route schema placement slice such as routes/schemas/*.js if requestValidation.js becomes crowded.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Notes and Projects create/update request validation now uses Zod through the existing assertZodSchema and BadRequestError path, preserving public 400 response shape, unknown-field compatibility, route/service/model behavior, and task validation. requestValidation.js is now crowded enough that the next runtime-schema step should promote route schema placement before Auth or AI payload migration.`
