# Notes Route Unified Build Inclusion V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/schema-island-unified-build-inclusion-v1.md`, `docs/pmo/state/backend_dist_runtime_cutover_plan.md#phase-4-notes-route-island-retirement-prep`
- Why it mattered: Schema TS now participates in the unified backend build while source-runtime facades remain intact. The next repeatable step is to make the Notes typed route source live at its normal route path for unified dist output, while preserving the current JS facade and generated guardrails.
- Expected outcome: Move the Notes TS route source to backend/src/routes/notesRoutes.ts and include it in the unified backend build so dist/routes/notesRoutes.js is emitted from TS, while source runtime still consumes backend/src/routes/notesRoutes.js facade.
- In scope:
  `Move/update Notes route TS source path and relative imports; update notes-route island tsconfig/guard expectations as needed; update unified backend tsconfig excludes/includes; harden build guard if useful; keep generated artifacts/facade active.`
- Out of scope:
  `No deletion of Notes facade/generated artifacts; no source runtime import change; no runtime cutover; no Projects/Tasks route migration; no service/model migration; no ESM/runtime loader/root check expansion; no API behavior change.`
- Dependencies: Schema Island Unified Build Inclusion V1 completed; private core package boundary completed; Notes route island guard remains active.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Codex may activate under delegated PMO automation authority.
- Validation expectation:
  `Run npm --prefix backend run check:notes-route-island, npm --prefix backend run check:backend-build, npm run lint:backend, npm --prefix backend test, and npm run check if scoped checks pass.`
- Escalation triggers:
  `Return to human if this requires deleting facade/generated artifacts, changing source runtime route imports, switching runtime/module systems, or changing public route behavior.`
- Follow-up parking:
  `If complete, next likely slice is schema/Notes scaffold retirement planning behind the deletion gate, or Projects/Tasks route TS migration prep.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
