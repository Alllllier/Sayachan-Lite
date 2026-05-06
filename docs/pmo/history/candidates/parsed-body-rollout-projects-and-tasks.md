# Parsed Body Rollout: Projects And Tasks

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/parsed-body-pilot-notes-boundary.md`
- Why it mattered: Parsed Body Pilot: Notes Boundary proved validateBody can publish ctx.state.validatedBody without mutating ctx.request.body, and Notes create/update can consume that DTO while preserving behavior and public 400 responses. Projects and Tasks remain intentionally on raw ctx.request.body and are ready for the same narrow rollout.
- Expected outcome: Update Projects and Tasks create/update routes to pass ctx.state.validatedBody to their services while preserving existing route/service behavior, schema semantics, and public validation responses.
- In scope:
  `Change Projects create/update and Tasks create/update handlers to consume ctx.state.validatedBody; keep validateBody behavior and schemas unchanged; update focused route contract tests proving Projects/Tasks services receive parsed DTOs while ctx.request.body remains raw; preserve Notes behavior.`
- Out of scope:
  `No Auth or AI migration; no strip/trim/default/coerce behavior changes; no schema changes; no public response-shape change; no frontend changes; no TypeScript migration; no workspace/tooling changes; no service/model/archive/focus/ownership/lifecycle behavior refactor.`
- Dependencies: Parsed Body Pilot: Notes Boundary closeout, backend/src/middleware/requestBodyValidation.js, backend/src/routes/schemas/mutations.js, projects/tasks route contract tests.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend route contract tests, npm --prefix backend test, and npm run check. Confirm public 400 response shape and valid Projects/Tasks behavior remain unchanged.`
- Escalation triggers:
  `Return to PMO if rollout requires schema behavior changes, service contract rewrites beyond using ctx.state.validatedBody, Auth/AI migration, frontend changes, or public API response changes.`
- Follow-up parking:
  `Closeout should decide whether Auth Payload Zod Boundary is ready, whether AI payload validation needs separate discussion, whether strip/trim/default/coerce should get a new decision, or whether runtime-schema adoption should pause.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
