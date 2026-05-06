# Validation Error Shape V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/task-mutation-zod-schema-pilot.md`
- Why it mattered: The first Zod runtime schema pilot succeeded while preserving the public 400 response shape, but it also showed that the current BadRequestError only carries status/message. Before expanding Zod to more backend boundaries, the repo should give validation failures a richer internal shape without changing public API responses.
- Expected outcome: Introduce a small validation-error shape/helper that maps Zod safeParse failures to BadRequestError with internal code/source/details while keeping public error responses as { error: 'Invalid request body' }.
- In scope:
  `Extend BadRequestError or add a small validation helper for code/source/details; centralize the task Zod safeParse to BadRequestError mapping; keep task create/update schemas behavior-compatible; add focused backend tests proving public response stability and internal helper behavior where practical.`
- Out of scope:
  `No public response-shape change; no frontend error UI changes; no Notes/Projects/Auth/AI Zod migration; no full error-boundary rewrite; no i18n/user-facing field-level validation messages; no TypeScript migration; no workspace/tooling changes.`
- Dependencies: Task Mutation Zod Schema Pilot closeout, backend errorBoundary.js behavior, backend/src/routes/requestValidation.js, backend route contract tests.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend route/validation tests, npm --prefix backend test, and npm run check. Confirm public 400 error response shape remains unchanged.`
- Escalation triggers:
  `Return to PMO if the implementation needs public API response changes, frontend error handling changes, broad route/error-boundary refactor, or migration of non-task validators.`
- Follow-up parking:
  `After this lands, PMO can choose whether the next runtime-schema slice expands Zod to another backend boundary, refines shared schema placement, or pauses runtime schema adoption.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `BadRequestError now remains the single public 400 request-validation error type while carrying internal code/source/details for Zod-backed validation. Zod safeParse mapping is inlined inside assertZodSchema to avoid premature helper abstraction, and public 400 responses remain unchanged.`
