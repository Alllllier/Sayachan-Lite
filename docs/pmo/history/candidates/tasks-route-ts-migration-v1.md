# Tasks Route TS Migration V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/projects-route-ts-migration-v1.md`, human approval to continue migration in chat on 2026-05-07`
- Why it mattered: Notes and Projects routes now compile from normal TypeScript route paths. Tasks is the remaining JS product route and the last route covered by the DTO pilot.
- Expected outcome: Convert Tasks route from JS to TypeScript at the normal route path, compile it through the unified backend build, preserve the existing route __test__ helper export, and keep public Tasks route behavior unchanged.
- In scope:
  `backend/src/routes/tasksRoutes.ts, backend tsconfig include/exclude, DTO pilot retirement or narrowing, dist boundary guard expectations, PMO baseline truth.`
- Out of scope:
  `No service/model TypeScript migration; no task runtime helper migration; no Zod/API behavior change; no ESM/runtime loader; no private_core change.`
- Dependencies: `Projects route migration completed; backend runtime and tests validate dist.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: `Human authorizes continuing backend migration automation.
- Validation expectation:
  `npm --prefix backend run check:backend-dist-runtime, npm --prefix backend run typecheck:dto-pilot if retained, and npm run check pass; dist guard proves Tasks route output is emitted from TS and tests still access route __test__ helpers.`
- Escalation triggers:
  `Return to human if Tasks route migration requires changing task helper/service behavior, removing route __test__, changing API contracts, ESM/runtime loader, or private_core changes.`
- Follow-up parking:
  `After Tasks route migration, retire DTO pilot if empty and reassess next backend TS migration boundary.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
