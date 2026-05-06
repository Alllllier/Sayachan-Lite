# Route Middleware Typing Cleanup

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `Backend ESM Cutover closeout follow-up and middleware typing discussion, 2026-05-07`
- Why it mattered: Backend ESM cutover exposed pragmatic any boundaries in route-level middleware helpers. The runtime is stable, but TypeScript should now understand the route middleware state handoff instead of hiding it behind any.
- Expected outcome: Route-level middleware and route files share a single route-state type surface, reducing duplicate state definitions and removing avoidable any boundaries while preserving current runtime behavior.
- In scope:
  `backend/src/routes/routeTypes.ts or equivalent route-level type source, route-level helpers requireCurrentUser/validateBody/parseObjectId typing, route files that duplicate route state types, and tests only if type cleanup requires import/type adjustments.`
- Out of scope:
  `Physical middleware folder split, app-level middleware redesign, public API changes, route behavior changes, private_core work, runtime validation behavior changes, and broad service/model cleanup.`
- Dependencies: Backend ESM Cutover completed and validation is green. App-level middleware and route-level middleware are acknowledged as separate concerns.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human approved creating and activating the route middleware typing cleanup candidate.
- Validation expectation:
  `Run npm --prefix backend run check:backend-dist-runtime, npm --prefix backend run test, and npm run check.`
- Escalation triggers:
  `Stop before physically moving middleware files, changing route behavior, changing public response shapes, redesigning auth/session middleware, or expanding into service/model typing cleanup.`
- Follow-up parking:
  `After route-level typing is stable, promote Middleware Folder Split to separate app/route middleware directories.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
