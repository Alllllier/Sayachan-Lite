# Backend Dist Build Boundary Hardening V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reference/backend-runtime-boundary-reference.md`, `docs/pmo/history/reports/backend-dist-runtime-cutover-plan-v1.md`
- Why it mattered: The backend now has a unified tsc dry-run and a PMO cutover battle map. Before route migration or runtime smoke work continues, the build boundary should be made explicit enough that private_core cannot be pulled in accidentally and the current noResolve guard is either justified as temporary or replaced with a clearer boundary.
- Expected outcome: Strengthen the backend dist build dry-run boundary while keeping source runtime unchanged. The sprint should make check:backend-build prove the intended dist artifact layout and runtime-script guardrails without switching start/dev to dist or expanding root check.
- In scope:
  `Review backend tsconfig/package scripts/checkBackendDistBuild.js and current dist output assumptions; clarify or harden the build boundary around backend/src and private_core; add lightweight artifact/layout/runtime-script assertions as needed; update PMO evidence if the boundary policy is clarified.`
- Out of scope:
  `No runtime cutover; no start/dev switch to dist; no route/service/model migration; no island/facade deletion; no ESM decision; no private_core build inclusion; no tsx/ts-node/runtime loader; no public API/Zod behavior change; no heavy root npm run check expansion without a human gate.`
- Dependencies: Backend Dist Runtime Cutover Plan V1 accepted; current backend unified tsc dry-run exists; current source runtime remains node src/server.js.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Codex may activate under the human's delegated instruction to continue the next PMO step autonomously.
- Validation expectation:
  `Run npm --prefix backend run check:backend-build. Also run schema/Notes island checks and backend tests if touched files or findings make them relevant. Do not add backend dist validation to root npm run check unless explicitly approved.`
- Escalation triggers:
  `Return to human if the work requires including private_core in the build, switching to ESM, adopting a runtime TS loader, changing start/dev to dist, changing public API/Zod behavior, or expanding root npm run check with heavier dist validation.`
- Follow-up parking:
  `If completed, next likely PMO move is a pre-cutover dist runtime smoke harness or a narrowly scoped route migration prep slice, depending on what the boundary hardening reveals.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
