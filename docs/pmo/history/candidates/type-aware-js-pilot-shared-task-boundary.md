# Type-Aware JS Pilot: Shared Task Boundary

- Archived date: `2026-05-05`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-002`
- Why it mattered: Engineering Quality Gate V1 has landed, so the repo now has a stable root validation path before adding type feedback. The completed TypeScript target architecture audit identified the shared task service as a durable cross-feature boundary where type feedback can prove value without starting a full TypeScript migration.
- Expected outcome: A scoped type-aware JavaScript pilot for the shared frontend task service that adds low-noise TypeScript checking and JSDoc/typedef coverage around task payload, status, provenance, archived/completed, API response normalization, and runtime snapshot contracts while preserving current behavior.
- In scope:
  `Add a scoped typecheck path for frontend/src/services/tasks; add JSDoc typedefs or equivalent type-aware JS annotations in task.rules.js, task.api.js, task.runtime.js, and the package entrypoint as needed; add package/root scripts for the pilot typecheck; keep existing task service tests passing; document the follow-up routing outcome in PMO state during closeout.`
- Out of scope:
  `No full-repo checkJs, no .ts file migration, no TypeScript rewrite of Vue SFCs, no workspace/shared package migration, no runtime schema library, no product behavior changes, no task service deletion/merge, no backend task service changes, no UI changes, and no private-core changes.`
- Dependencies: Engineering Quality Gate V1 root check; TypeScript target architecture mapping artifacts; shared task service decision in decision_log; existing frontend task service tests.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the scoped task-service typecheck, existing task service tests, and root npm run check. Report whether typecheck remains low-noise and whether any follow-up should be routed to sprint_candidates, idea_backlog, or decision_log.`
- Escalation triggers:
  `Return to PMO/human review if the pilot requires full-repo checkJs, renaming files to .ts, changing runtime task behavior, broad source rewrites to satisfy types, adding workspace tooling, adopting runtime schema dependencies, or deleting current task service scaffolding.`
- Follow-up parking:
  `Closeout must route the next TypeScript step explicitly. Possible routes include a second typed-boundary pilot, checkJs expansion plan, typed-islands migration candidate, runtime schema backlog item, or an explicit pause decision in decision_log.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Scoped type-aware JS pilot for frontend shared task service completed and validated. npm run typecheck:tasks, task service tests, and root npm run check passed. The pilot remained explicit and outside root npm run check, used JSDoc/checkJs/noEmit without .ts migration, and preserved runtime behavior. Follow-up has been routed to sprint_candidates as Type-Aware JS Pilot Phase 2: Shared Frontend Support Boundary because the pilot used noResolve plus a local Vue ref shim, indicating the next TS step should clarify shared frontend support typing before broader expansion.`
