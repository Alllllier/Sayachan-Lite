# Notes Route TS Runtime Loading Pilot

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/backend-schema-typed-island-pilot.md`, `docs/pmo/history/reports/backend-type-island-guardrail-v1.md`, `Dalton read-only route TS and route shim spikes on 2026-05-06`
- Why it mattered: The schema typed island proved that a .ts source plus generated CommonJS artifact/facade can work in the current plain Node backend. Route-level JSDoc/shim exploration showed that pure shadow shims add parallel complexity, while real route TS migration first needs a runtime-loading bridge. Notes is the smallest product route that still exercises CRUD, mutation validation, pin/unpin, archive/restore, service imports, Koa ctx, and route contract tests.
- Expected outcome: Convert Notes route implementation into a bounded TypeScript route island while keeping the current CommonJS backend startup and existing routes/index.js consumer path working through a generated artifact or facade. Establish whether the mutations typed-island pattern can safely generalize from pure schemas to one real product route.
- In scope:
  `Migrate only the Notes route implementation to a .ts source if feasible; preserve or create a notesRoutes.js CommonJS facade for existing require('./notesRoutes') consumption; add a focused route-island tsconfig/build/check or extend the schema-island guardrail pattern for Notes route artifacts; use existing @types/koa, @koa/router types, mutations.d.ts, and minimal local route ctx typing; keep service/model/middleware implementation in JS; verify Notes route contract behavior stays unchanged.`
- Out of scope:
  `No Projects/Tasks route migration; no routes/index.js or server.js runtime loading change unless PMO explicitly re-approves; no whole-backend dist runtime; no tsx/ts-node runtime loader; no service/model/middleware TypeScript conversion; no Zod schema behavior change; no public API contract change; no frontend work; no package workspace migration; no broad backend checkJs expansion.`
- Dependencies: Completed Backend Schema Typed Island Pilot; completed Backend Type-Island Guardrail V1; backend @types/koa installed; existing Notes route contract coverage; current CommonJS backend runtime.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the new Notes route island build/check path, schema-island guardrail if it remains separate, backend DTO typecheck if retained, npm --prefix backend test -- test/routes.contract-baseline.test.js, npm --prefix backend test, and npm run check. Confirm existing routes/index.js consumers still load Notes through the same CommonJS path and public Notes validation/error responses are unchanged.`
- Escalation triggers:
  `Return to PMO if implementation requires changing backend startup, making routes/index.js consume .ts directly, migrating services/models/middleware, adding a runtime TS loader, broadening to Projects/Tasks, maintaining large hand-written service/model .d.ts surfaces, or creating noisy generated artifacts/checks beyond the approved facade pattern.`
- Follow-up parking:
  `Closeout should decide whether Notes route TS island is a repeatable pattern, whether DTO pilot should remain until more routes migrate, and whether the next step is Projects route, Tasks route, middleware typing, or whole-backend build/runtime planning.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
