# Backend CRUD Service Extraction First Pass

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_016.md slice-001; docs/pmo/history/reference/BACKEND_ARCHITECTURE_AUDIT_2026-04-23.md`
- Why it mattered: Backend route handlers still own routing, model calls, lifecycle orchestration, archive/restore cascade behavior, focus clearing, normalization, and error response shaping. Current backend route and helper tests are strong enough to support a behavior-preserving service extraction before adding validation, global error middleware, auth, or app/server composition changes.
- Expected outcome: Introduce a first-pass backend service layer for notes, projects, and tasks while preserving existing external API behavior, route contracts, lifecycle semantics, cascade behavior, focus-clearing behavior, and normalized response shapes.
- In scope:
  `Create backend service modules for notes, projects, and tasks; move CRUD orchestration, archive/restore cascade behavior, task lifecycle transitions, project focus clearing, and normalize helper usage out of route handlers where practical; keep routes as thin HTTP adapters that read ctx params/query/body, set status, return body, and map not-found cases.`
- Out of scope:
  `Request validation redesign; new validator dependency; global error middleware; app/server split; route-file splitting; config centralization; repository layer; auth/account scoping; AI route changes; product API behavior changes; frontend changes.`
- Dependencies: Existing backend route contract tests, behavior-lock tests, restore-scoping test, and taskRuntimeHelpers guardrail tests must remain passing; worker should inspect current backend/src/routes/index.js and backend/src/routes/taskRuntimeHelpers.js before changing boundaries.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Backend non-AI CRUD routes now delegate orchestration to first-pass services; live MongoDB manual smoke remains unverified but route/behavior tests passed.`
