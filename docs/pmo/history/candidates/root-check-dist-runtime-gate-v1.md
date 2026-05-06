# Root Check Dist Runtime Gate V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/post-cutover-scaffold-cleanup-readiness-v1.md`, human approval in chat on 2026-05-06`
- Why it mattered: Backend start now runs from dist, but root npm run check still does not include the backend dist runtime readiness gate. Aligning the default quality gate with the default backend start runtime reduces cutover drift risk.
- Expected outcome: Add backend dist runtime readiness to root npm run check and update PMO/runtime baseline truth without changing backend dev/runtime scripts or deleting scaffolding.
- In scope:
  `root package scripts; runtime baseline; PMO report.`
- Out of scope:
  `No backend start/dev changes; no schema/Notes scaffold deletion; no route/service/model migration; no ESM/runtime loader; no API behavior change.`
- Dependencies: Backend Start Dist Runtime Cutover V1 and Backend Dist Runtime Readiness V1 completed and green.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human selected adding dist runtime readiness to root check.
- Validation expectation:
  `Run npm run check.`
- Escalation triggers:
  `Return to human if root check cost becomes unreasonable or if the readiness command fails for reasons requiring runtime/design changes.`
- Follow-up parking:
  `After completion, next decision remains whether to switch backend dev to dist or keep source dev and retain scaffolding.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
