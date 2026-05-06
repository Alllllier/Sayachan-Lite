# Backend Unified TSC Build Dry Run V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/backend-schema-typed-island-pilot.md`, `docs/pmo/history/reports/backend-type-island-guardrail-v1.md`, `docs/pmo/history/reports/notes-route-ts-runtime-loading-pilot.md`, `Dalton backend tsc build/runtime planning spike on 2026-05-06`
- Why it mattered: Schema and Notes route typed islands proved that .ts source plus CommonJS generated artifacts can work, but the per-island scaffold is already heavy. The human has confirmed the intended end state is a unified backend tsc build, so the next step should prove the whole backend can emit to dist without changing runtime startup yet.
- Expected outcome: Add a unified backend tsc build dry-run that emits backend/src into backend/dist and a low-noise build check/smoke, while keeping current node src/server.js runtime and all existing island/facade scaffolding intact.
- In scope:
  `Add or shape backend/tsconfig.json for unified CommonJS tsc emit; add backend build/check scripts such as build:backend and check:backend-build; keep allowJs/checkJs settings conservative enough to emit current JS without forcing whole-backend type migration; add a small dist load/smoke check if feasible; update root scripts only if low-noise; update baselines/docs if validation or runtime truth changes.`
- Out of scope:
  `No backend runtime cutover; do not change backend start/dev to node dist/server.js; no deletion of schema/Notes island generated artifacts or facades; no Projects/Tasks/service/model/middleware migration; no ESM migration; no tsx/ts-node runtime loader; no API/Zod/frontend/private-core behavior change; no broad backend type-check expansion.`
- Dependencies: Completed schema typed island, generated-artifact guardrail, Notes route typed island, backend @types/koa, current CommonJS backend runtime, root quality gate.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the new backend unified build command, the new build smoke/check command, existing schema-island and notes-route-island checks, npm --prefix backend test, and npm run check. Confirm dist is generated but not committed, current runtime remains node src/server.js, and existing island/facade checks still pass.`
- Escalation triggers:
  `Return to PMO if dry-run requires ESM migration, runtime loader adoption, service/model/middleware TS migration, deleting current islands, changing backend startup, broad test rewrites, or making root npm run check noisy/slow enough to need a human tradeoff.`
- Follow-up parking:
  `If dry-run succeeds, next planning should move toward automated migration mechanics: a repeatable script/checklist for route islands or a backend build cutover plan so future migrations require less per-file human approval. Do not continue manual route-by-route validation indefinitely once the pattern stabilizes.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
