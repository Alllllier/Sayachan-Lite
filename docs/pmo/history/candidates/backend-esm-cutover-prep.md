# Backend ESM Cutover Prep

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `Backend ESM spike discussion, 2026-05-07`
- Why it mattered: Backend TypeScript is already running through dist, but backend is still a CommonJS island. Before cutting backend to ESM, scripts, tests, dist boundary checks, and the private_core bridge need a safer preparation pass.
- Expected outcome: Backend remains CommonJS at runtime, but the surrounding script/test/check surfaces are prepared so a later backend-only ESM cutover has a narrow blast radius.
- In scope:
  `backend scripts that would break under package-level ESM, backend dist boundary checks that currently require CommonJS output, test import strategy planning or low-risk prep, and AI bridge compatibility notes for consuming the CJS private_core package from future ESM backend code.`
- Out of scope:
  `Actually changing backend/package.json to "type": "module", switching tsconfig to emit ESM, converting all backend source imports to NodeNext .js extension style, converting private_core to TS or ESM, changing AI runtime semantics, or changing frontend behavior.`
- Dependencies: Backend remains dist-first; private_core remains a package boundary at @allier/sayachan-ai-core and stays CommonJS for this backend migration.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human selected the two-step route and approved activating the prep sprint.
- Validation expectation:
  `At minimum npm --prefix backend run check:backend-dist-runtime and npm --prefix backend run test; run npm run check if touched surfaces justify full gate.`
- Escalation triggers:
  `Any need to change private_core module type, introduce a runtime TS loader, change backend dev/start semantics beyond build-then-node dist, or perform the actual backend ESM cutover.`
- Follow-up parking:
  `Backend ESM Cutover should follow after prep if validation stays green and no private_core blocker appears. Private_core TS/ESM migration is parked for a separate future thread.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Actual backend ESM cutover still needs NodeNext source import conversion and backend test ESM loading strategy; private_core remains CommonJS through the bridge boundary.`
