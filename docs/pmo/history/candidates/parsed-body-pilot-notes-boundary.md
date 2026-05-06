# Parsed Body Pilot: Notes Boundary

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/route-schema-placement-v1.md`
- Why it mattered: The human and PMO selected the long-term direction: parsed Zod data should become a trusted DTO boundary, preferably via ctx.state.validatedBody rather than overwriting ctx.request.body. Route Schema Placement V1 already created validateBody(schema), so the next step can be a narrow Notes-only implementation pilot rather than a pure decision sprint.
- Expected outcome: Update validateBody(schema) to expose parsed data on ctx.state.validatedBody and update only Notes create/update routes to pass ctx.state.validatedBody to notesService, while preserving current Notes behavior and public 400 responses.
- In scope:
  `Assign parsed Zod data to ctx.state.validatedBody inside validateBody(schema); update Notes create/update handlers to use ctx.state.validatedBody; keep schemas passthrough, no trim transform, no defaults, no coerce; add or update focused backend tests proving valid Notes behavior is unchanged, invalid 400 response shape is unchanged, and Notes services receive the parsed DTO from ctx.state.validatedBody.`
- Out of scope:
  `No Projects or Tasks parsed-body rollout; no Auth or AI migration; no strip/trim/default/coerce behavior changes; no public response-shape change; no frontend changes; no TypeScript migration; no workspace/tooling changes; no service/model/archive/ownership/lifecycle behavior refactor.`
- Dependencies: Route Schema Placement V1 closeout, backend/src/middleware/requestBodyValidation.js, backend/src/routes/schemas/mutations.js, runtime schema decision_log entry.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend route contract tests, npm --prefix backend test, and npm run check. Confirm Notes public 400 response shape and valid create/update behavior remain unchanged.`
- Escalation triggers:
  `Return to PMO if the pilot requires Projects/Tasks rollout, Auth/AI migration, strip/transform/default/coerce behavior, public API response changes, or service contract rewrites beyond using ctx.state.validatedBody in Notes routes.`
- Follow-up parking:
  `Closeout should route either Parsed Body Rollout for Projects/Tasks, a revised parsed-body decision if the pilot exposes issues, Auth Payload Zod Boundary, AI payload discussion, or pause runtime-schema adoption.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `validateBody now stores successful parsed Zod data on ctx.state.validatedBody without mutating ctx.request.body. Notes create/update consume the parsed DTO; Projects and Tasks intentionally remain on raw ctx.request.body until a separate rollout. Public 400 responses and schema semantics remain unchanged.`
