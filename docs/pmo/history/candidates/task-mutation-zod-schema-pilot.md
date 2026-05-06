# Task Mutation Zod Schema Pilot

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-003`
- Why it mattered: Engineering Quality Gate V1 is in place, and the type-aware JS pilots clarified that JSDoc/checkJs gives dev-time signal but does not protect live HTTP inputs. Task mutations are a narrow, high-value backend boundary where Zod can be introduced without a full validation rewrite.
- Expected outcome: Introduce the first narrow Zod-backed runtime schema boundary for backend task create/update request bodies while preserving task semantics, current error response expectations, and existing frontend behavior. Report whether Zod is suitable as the durable runtime schema path.
- In scope:
  `Add Zod as the backend/runtime validation dependency if needed; define schemas for task create/update request bodies; wire the schemas into task mutation route validation or the existing request-validation path; preserve the current 400 error response shape as much as practical; keep task lifecycle, provenance, archive, and focus semantics unchanged; update or add focused backend tests for valid and invalid task mutation payloads.`
- Out of scope:
  `No frontend changes; no TypeScript migration; no full backend validation rewrite; no Notes, Projects, Auth, or AI schema migration; no frontend API response or localStorage schema work; no task model persistence changes; no route behavior changes beyond request validation; no public/private AI changes; no workspace/tooling changes.`
- Dependencies: Current backend task routes, services, and tests; existing requestValidation.js behavior; decision_log task/provenance/archive/focus rules; discussion_batch_018 runtime schema discussion and human preference for Zod.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused backend task route/validation tests, backend npm test, and root npm run check. Report any intentional differences in validation error wording or response shape.`
- Escalation triggers:
  `Return to PMO if preserving current validation behavior requires a broad route-validation rewrite, task service semantics need changing, Zod expands into Notes/Projects/Auth/AI during the sprint, or dependency/install behavior unexpectedly affects frontend/root tooling.`
- Follow-up parking:
  `Closeout should route the next runtime-schema step: expand Zod to another backend boundary, refine shared validation helpers, pause Zod adoption, or open separate schema candidates for Notes/Projects/Auth/AI/frontend response normalization/localStorage.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Task mutation request validation now uses a narrow Zod-backed schema boundary for create/update while preserving the public 400 error response shape and task lifecycle semantics. Follow-up routed: introduce Validation Error Shape V1 before broader Zod expansion so BadRequestError can carry internal code/source/details without changing public API responses.`
