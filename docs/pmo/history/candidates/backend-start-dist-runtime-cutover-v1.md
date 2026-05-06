# Backend Start Dist Runtime Cutover V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/backend-dist-runtime-readiness-v1.md`, human approval in chat on 2026-05-06`
- Why it mattered: Backend dist runtime readiness is green and the human approved switching only backend start to a build-backed dist runtime while keeping dev source-based.
- Expected outcome: Switch backend npm start to build and run dist/server.js, keep npm dev on node src/server.js, update runtime guardrails and PMO/baseline documentation, and validate the cutover without deleting scaffolding.
- In scope:
  `backend/package.json start script; backend dist build/runtime guard script; runtime baseline and PMO report.`
- Out of scope:
  `No dev script change; no schema/Notes generated/facade deletion; no ESM/runtime loader; no root npm run check expansion; no API/Zod behavior change.`
- Dependencies: Backend Dist Runtime Readiness V1 completed and green.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human approved switching start while preserving dev.
- Validation expectation:
  `Run npm --prefix backend run check:backend-dist-runtime, npm --prefix backend run check:backend-build, npm --prefix backend test, npm run lint:backend, and npm run check.`
- Escalation triggers:
  `Return to human if start cannot run via dist, if dev must change, if scaffolding must be deleted, or if public behavior changes.`
- Follow-up parking:
  `After cutover, next work should decide when to add dist readiness to root check and when to retire schema/Notes scaffolding.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
