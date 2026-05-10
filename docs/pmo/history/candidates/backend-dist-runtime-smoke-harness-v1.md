# Backend Dist Runtime Smoke Harness V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reference/backend-runtime-boundary-reference.md`, `docs/pmo/history/reports/backend-dist-build-boundary-hardening-v1.md`
- Why it mattered: The backend dist build boundary now has guardrails. Before more route TS migration or island retirement work, PMO needs a clearer pre-cutover dist runtime smoke entrypoint that can validate dist/server.js without making dist the default runtime.
- Expected outcome: Create or clarify a dist-only smoke harness/command that builds backend and verifies the compiled dist runtime can be imported or started in isolation, while keeping start/dev and root check unchanged.
- In scope:
  `Review the existing checkBackendDistBuild.js smoke behavior; decide whether to split artifact-boundary checks from runtime smoke or expose a clearer backend package script; ensure the smoke harness mocks external side effects such as MongoDB connect/listen; keep checks lightweight and local to backend scripts.`
- Out of scope:
  `No runtime cutover; no start/dev switch to dist; no root npm run check expansion; no ESM decision; no private_core build inclusion; no tsx/ts-node/runtime loader; no route/service/model migration; no island/facade deletion; no API/Zod behavior change.`
- Dependencies: Backend Dist Build Boundary Hardening V1 completed; current source runtime remains node src/server.js; backend dist build can be generated with tsc.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Codex may activate under delegated PMO automation authority unless a human architecture gate appears.
- Validation expectation:
  `Run the new or clarified dist smoke command and npm --prefix backend run check:backend-build. Run backend lint if backend scripts change. Do not add this smoke to root npm run check without human approval.`
- Escalation triggers:
  `Return to human if implementation requires switching runtime scripts, adding a runtime TS loader, expanding root check, including private_core in build, changing ESM/CommonJS policy, or changing public API/Zod behavior.`
- Follow-up parking:
  `After this is complete, next likely move is a route migration prep slice or Notes/schema island retirement prep, based on whether the smoke harness is stable enough for future migration batches.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
