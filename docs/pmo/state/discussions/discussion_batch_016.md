# Discussion Batch `016`

- Topic: `Backend minimal layering and validation architecture`
- Last updated: `2026-05-04`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `audit`
- Source channel: `audit`
- Why now: `The root backend architecture audit is no longer useful as a loose root-level working note, but its main findings are still real: backend workflow rules remain concentrated in route handlers, and service/validation/error/config/app-composition boundaries have not yet been intentionally resolved. Human direction is to preserve this as an active PMO discussion because the line is likely near-term work.`
- Related sprint or closeout: `docs/pmo/history/reference/BACKEND_ARCHITECTURE_AUDIT_2026-04-23.md`

## Why This Discussion Exists

- The backend is healthy enough to keep shipping, but route-level concentration is now visible architecture debt.
- Later backend behavior-lock and runtime cleanup work improved test coverage, semantics, and helper organization, but did not create a service layer, request validation layer, global error middleware, config module, app/server split, or resource-level route split.
- This discussion converts the backend audit from a root-level working file into PMO-owned architecture planning.

## Theme Summary

### `theme-001`

- Summary: `Backend CRUD route handlers still own too much application logic. The first useful layering pass should move note/project/task use-case orchestration out of routes without changing external API behavior.`
- Why grouped: `Service extraction, request validation, error mapping, route splitting, and app composition all affect the same backend route surface and should be sequenced together rather than improvised independently.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `docs/pmo/history/reference/BACKEND_ARCHITECTURE_AUDIT_2026-04-23.md identified backend minimal layering as the main unresolved architecture gap after frontend feature-layer work had a clearer landing path.`

## Possible Slices

### `slice-001`

- Name: `Backend CRUD service extraction first pass`
- Why separate: `Services are the lowest-risk first structural move because current behavior is already protected by route/behavior tests and helper guardrails.`
- Current maturity: `completed`
- Likely target: `completed and archived`
- Parking trigger: `If route behavior tests are not sufficient to protect the extraction boundary, return to backend testing discussion before implementation.`
- Reopen signal: `Human selects backend service extraction as the next architecture cleanup line.`

### `slice-002`

- Name: `Backend request validation and error boundary`
- Why separate: `Validation and global error handling should follow or accompany service extraction, but can be shaped as its own pass if the service slice is already large.`
- Current maturity: `completed`
- Likely target: `completed and archived`
- Parking trigger: `If validation schema choices would force a new dependency or broad API error contract decision before the desired UX/API shape is clear.`
- Reopen signal: `Malformed request handling, inconsistent error payloads, or service extraction makes route-level validation ambiguity painful.`

### `slice-003`

- Name: `Backend route module split`
- Why separate: `Route module split is now useful after service extraction and request/error-boundary work because `backend/src/routes/index.js` still owns health, notes, projects, tasks, validation imports, route wrapper, and test helper exports in one file. This can be separated without pulling in broader app/server split or config work.`
- Current maturity: `completed`
- Likely target: `completed and archived`
- Parking trigger: `If the backend remains small enough that composition cleanup adds indirection without reducing real friction.`
- Reopen signal: `Integration testing, auth work, route growth, or deployment configuration makes app composition and config ownership a real blocker.`

### `slice-004`

- Name: `Backend app/server split and config ownership`
- Why separate: `App/server split and config centralization are broader composition moves than route module split and should wait until integration testing, auth, route growth, or deployment configuration creates real pressure.`
- Current maturity: `deferred`
- Likely target: `idea_backlog`
- Parking trigger: `If route module split is enough for current backend maintainability and deployment/test setup remains simple.`
- Reopen signal: `Integration tests need an app instance without listening, auth middleware needs app-level composition, deployment config gets more complex, or server.js becomes a recurring friction point.`

## Open Questions

- Should the first service pass cover all `notes`, `projects`, and `tasks`, or start with the highest-risk project/task coupling only?
- Should request validation use a dependency or stay as small local validators for the first pass?
- Should service extraction happen before auth design, or should owner-led auth shape the service boundary first?
- Which current route-level tests are strong enough to protect extraction, and where would service-level tests add real signal?
- Should AI routes stay outside this first backend layering line because chat already has a bridge/private-core boundary?

## Current PMO Judgment

- Do not treat backend minimal layering as completed.
- Do not start with a broad backend rewrite.
- First-pass behavior-preserving service extraction for note/project/task CRUD orchestration has completed and is archived.
- Request validation and error-boundary work has completed and is archived.
- Route module split has completed and is archived.
- Keep broader app/server split and config centralization deferred until route growth, integration testing, auth, or deployment work makes them worth the extra boundary.
- Keep repository-layer work deferred unless query duplication or transaction complexity grows.
- Keep auth/account scoping as a separate architecture discussion already visible in `idea_backlog.md`.

## Promotion Outcome

- Active discussion opened from the archived backend architecture audit.
- `slice-001` was promoted to `sprint_candidates.md` as `Backend CRUD Service Extraction First Pass` on `2026-05-04`.
- `slice-001` completed and was archived on `2026-05-04`:
  - candidate archive: `docs/pmo/history/candidates/backend-crud-service-extraction-first-pass.md`
  - report archive: `docs/pmo/history/reports/backend-crud-service-extraction-first-pass.md`
- `slice-002` was promoted to `sprint_candidates.md` as `Backend Request Validation And Error Boundary` on `2026-05-04`.
- `slice-002` completed and was archived on `2026-05-04`:
  - candidate archive: `docs/pmo/history/candidates/backend-request-validation-and-error-boundary.md`
  - report archive: `docs/pmo/history/reports/backend-request-validation-and-error-boundary.md`
- Route module split was promoted to `sprint_candidates.md` as `Backend Route Module Split` on `2026-05-04`.
- Route module split completed and was archived on `2026-05-04`:
  - candidate archive: `docs/pmo/history/candidates/backend-route-module-split.md`
  - report archive: `docs/pmo/history/reports/backend-route-module-split.md`
- No backend minimal-layering candidate is currently ready after slice-003. `slice-004` remains deferred until app/server composition or config ownership becomes a real blocker.
