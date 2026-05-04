# Backend Request Validation And Error Boundary

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_016.md slice-002; docs/pmo/history/reports/backend-crud-service-extraction-first-pass.md`
- Why it mattered: The backend now has a first-pass service layer and route-level tests that protect successful CRUD behavior, 404 payloads, archive/cascade semantics, and focus-clearing behavior. The next architecture gap is not general backend test coverage, but the missing contract for malformed request input, validation failures, and unexpected service/runtime errors. Defining that boundary now will make later backend route/service work safer without changing successful API responses.
- Expected outcome: Define and implement a minimal backend request validation and error-boundary contract for non-AI Notes, Projects, and Tasks routes, preserving current successful responses and existing 404 payloads while adding explicit tests for bad requests and error mapping.
- In scope:
  `Add lightweight local request validators or validation helpers for non-AI note/project/task create and update routes; define consistent 400 responses for malformed or invalid request bodies; preserve current 404 response payloads; add a minimal route wrapper or Koa error middleware only if needed to map unexpected service errors to a consistent 500 response; add or extend backend tests for 400 validation cases, existing 404 behavior, and unexpected error mapping; keep all successful route behavior unchanged.`
- Out of scope:
  `New validation dependency such as zod/yup; auth or account scoping; repository layer; frontend error UX changes; AI route validation; changing successful response shapes; changing existing 404 payloads; app/server split except for a tiny error-boundary hook if unavoidable; broad route-file split; config centralization.`
- Dependencies: Completed Backend CRUD Service Extraction First Pass; existing backend route contract and behavior-lock tests; current Mongoose model constraints; PMO/human acceptance that first-pass validation can use small local helpers rather than a schema library.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Non-AI CRUD routes now have local request validation and stable 400/500 error contracts; no live HTTP smoke was run.`
