# Private Core Package Import Boundary V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reference/backend-runtime-boundary-reference.md`, human decision in chat on 2026-05-06`
- Why it mattered: The human confirmed the private core should be consumed as its existing independent package/sub-repo rather than as a relative source path. This resolves the next backend TS build-boundary step without absorbing private_core into backend dist.
- Expected outcome: Make backend import @allier/sayachan-ai-core through a backend-local file dependency and package resolver, while preserving source runtime, CommonJS, private_core exclusion from dist, and current API behavior.
- In scope:
  `Add @allier/sayachan-ai-core as a backend file dependency pointing to private_core/sayachan-ai-core; update backend/src/ai/bridge.js to require the package name; update backend package lock/install state; harden build guard to reject the old relative private_core bridge import and verify the package dependency; update PMO report.`
- Out of scope:
  `No runtime cutover; no ESM; no private_core source migration; no monorepo/workspace conversion; no route/schema island retirement; no root check expansion; no public API/Zod behavior change.`
- Dependencies: private_core/sayachan-ai-core already exists as a git submodule with package name @allier/sayachan-ai-core.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selected this implementation path.
- Validation expectation:
  `Run npm --prefix backend install; npm --prefix backend run check:backend-build; npm --prefix backend test; npm run lint:backend; consider npm run check if scope remains stable.`
- Escalation triggers:
  `Return to human if npm cannot install the local package, if package resolution requires workspace/monorepo conversion, if private_core would be emitted into backend dist, or if runtime/API behavior must change.`
- Follow-up parking:
  `After this lands, revisit schema/Notes TS inclusion prep with package resolver boundary in place.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
