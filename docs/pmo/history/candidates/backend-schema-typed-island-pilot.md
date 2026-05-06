# Backend Schema Typed Island Pilot

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/type-aware-backend-dto-pilot.md`, `docs/pmo/state/discussions/discussion_batch_018.md#slice-005`
- Why it mattered: The backend DTO JSDoc/checkJs pilot validated that route-level type feedback is useful but still expands quickly through service/model/Koa module resolution. A smaller root typed island should start from the pure product mutation schema/DTO source instead of route handlers.
- Expected outcome: Convert the product mutation schema/DTO boundary into a tiny backend TypeScript island, making the .ts schema module the typed source of truth while emitting or maintaining CommonJS-compatible JavaScript for existing route consumption during the migration period.
- In scope:
  `Create a focused backend TS build/typecheck path for the schema island; convert or introduce the product mutation schema module as a .ts source if feasible; generate or maintain a CommonJS-compatible .js artifact/facade for existing routes; keep routes consuming the current runtime path without broad route/service TypeScript migration; document the generated-JS convention as transitional and removable once the backend moves to an overall dist runtime.`
- Out of scope:
  `No route handler .ts conversion; no service/model TypeScript migration; no full-backend checkJs; no frontend changes; no Auth/AI schemas; no schema behavior changes; no strip/trim/default/coerce decision; no public API response change; no workspace/package migration; no service/model/archive/focus/ownership/lifecycle refactor.`
- Dependencies: Completed Type-Aware Backend DTO Pilot; existing Zod product mutation schemas; backend-local TypeScript tooling; root npm run check.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the new typed-island build/typecheck command, existing backend DTO typecheck if retained, focused route contract tests, npm --prefix backend test, and npm run check. Confirm generated/runtime schema behavior and public 400 responses are unchanged.`
- Escalation triggers:
  `Return to PMO if the typed island requires broad module system changes, route/service conversion, Zod behavior changes, package workspace migration, or runtime import ambiguity beyond the approved transitional generated-JS/facade convention.`
- Follow-up parking:
  `Closeout should decide whether schema islands become the preferred TS entry path, whether DTO types can be inferred from Zod in later slices, whether the earlier JSDoc DTO pilot should be retired, retained, or replaced, and what cleanup rule deletes generated JS once the backend moves to a whole-dist runtime.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
