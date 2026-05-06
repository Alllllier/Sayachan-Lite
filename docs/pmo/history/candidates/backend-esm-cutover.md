# Backend ESM Cutover

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `Backend ESM Cutover Prep closeout, 2026-05-07`
- Why it mattered: Backend is already dist-first and prep work made backend scripts package-type-stable. The remaining CommonJS island now mostly blocks cleaner TypeScript imports, NodeNext semantics, and the removal of migration-era require/import= patterns.
- Expected outcome: Backend runtime switches from CommonJS dist to ESM dist while preserving build-then-node start/dev behavior and keeping private_core as a CommonJS package consumed through the backend AI bridge.
- In scope:
  `backend/package.json type/module metadata, backend/tsconfig NodeNext ESM emit settings, backend/src import/export conversion needed for NodeNext, backend test loading strategy for ESM dist, backend dist boundary checks, backend scripts only where needed to support the ESM dist runtime, and PMO execution report.`
- Out of scope:
  `Converting private_core to TypeScript or ESM, moving private_core into the backend build boundary, introducing runtime TypeScript loaders such as tsx/ts-node/loader hooks, changing backend start/dev away from build-then-node dist, changing public API behavior, changing AI runtime semantics, frontend changes, or unrelated architecture cleanup.`
- Dependencies: Backend ESM Cutover Prep is complete; private_core remains @allier/sayachan-ai-core CommonJS; backend operational scripts are .cjs and package-type-stable.
- Risk level: `medium-high`
- Readiness at selection: `ready`
- Start condition: Human approved formal backend ESM cutover candidate and activation after prep closeout.
- Validation expectation:
  `Run npm --prefix backend run check:backend-dist-runtime, npm --prefix backend run test, and npm run check.`
- Escalation triggers:
  `Stop before converting private_core, adding runtime TS loaders, changing public API/AI semantics, abandoning build-then-node dist runtime, or if NodeNext import conversion exposes a non-mechanical architecture dependency.`
- Follow-up parking:
  `After cutover, consider a cleanup sprint for leftover migration-era require patterns or CJS compatibility comments that remain only because private_core is still CommonJS. Private_core TS/ESM stays parked for its own future thread.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Route/middleware helper typing still has pragmatic any boundaries exposed by the ESM cutover; private_core remains CommonJS through the backend bridge and can be migrated in a separate future thread.`
