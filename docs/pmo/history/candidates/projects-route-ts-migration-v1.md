# Projects Route TS Migration V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/schema-scaffold-retirement-v1.md`, human approval to continue migration in chat on 2026-05-07`
- Why it mattered: Notes route and schema modules now compile directly through the unified backend build, leaving Projects and Tasks as the remaining JS product routes on the mutation-validation path. Projects is closest to the proven Notes route shape.
- Expected outcome: Convert Projects route from JS to TypeScript at the normal route path, compile it through the unified backend build, and keep public Projects route behavior unchanged.
- In scope:
  `backend/src/routes/projectsRoutes.ts, backend tsconfig include/exclude, DTO pilot narrowing, dist boundary guard expectations, PMO baseline truth.`
- Out of scope:
  `No Tasks route migration; no service/model TypeScript migration; no Zod/API behavior change; no ESM/runtime loader; no private_core change.`
- Dependencies: `Notes route and schema scaffold retirement completed; backend runtime and tests validate dist.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: `Human authorizes continuing backend migration automation.
- Validation expectation:
  `npm --prefix backend run check:backend-dist-runtime, npm --prefix backend run typecheck:dto-pilot, and npm run check pass; dist guard proves Projects route output is emitted from TS.`
- Escalation triggers:
  `Return to human if Projects route migration requires API behavior changes, service/model migration, ESM/runtime loader, private_core changes, or broad route architecture changes.`
- Follow-up parking:
  `After Projects route migration, Tasks route becomes the next product route migration candidate.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
