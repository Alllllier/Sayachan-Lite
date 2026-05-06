# Type-Aware JS Pilot Phase 2: Shared Frontend Support Boundary

- Archived date: `2026-05-05`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/execution_report.md for Type-Aware JS Pilot: Shared Task Boundary`
- Why it mattered: The shared task service pilot passed, but it required noResolve plus a local Vue ref shim to stay scoped and avoid pulling apiClient/Vue support modules into the check. That is acceptable for a pilot, but it shows the next useful TypeScript step should define how shared frontend support modules participate in type-aware JS before expanding more feature boundaries.
- Expected outcome: A second scoped type-aware JS pilot or planning/implementation slice that brings the minimum shared frontend support boundary into the type-aware path, especially apiClient and the Vue ref/support typing needed by shared services, while preserving the first pilot's low-noise behavior.
- In scope:
  `Evaluate and, if still bounded, add JSDoc/type-aware coverage for frontend/src/services/apiClient.js and minimal shared support typing used by task service. The intended boundary is only apiClient plus the minimum Vue/ref support needed by the existing task-service typecheck. Decide whether to retain, reduce, or remove the local task-service shim; keep the task service typecheck passing; keep root npm run check passing; document whether this shared support boundary is reusable for later pilots.`
- Out of scope:
  `No full-repo checkJs, no .ts migration, no Vue SFC typing, no feature-wide typecheck expansion, no workspace/shared package migration, no runtime schema library, no backend changes, no behavior changes, no API transport behavior changes, and no private-core changes.`
- Dependencies: Completed Type-Aware JS Pilot: Shared Task Boundary; current task-service typecheck config and report; Engineering Quality Gate V1.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate after confirming the Phase 2 boundary should attempt apiClient plus minimal Vue/ref support typing, while stopping rather than expanding if the import graph starts pulling in broader frontend modules.
- Validation expectation:
  `Run the shared support scoped typecheck, the task-service typecheck, task service tests, and root npm run check. Report whether the local shim was retained, reduced, or removed and whether future pilots can reuse the support boundary.`
- Escalation triggers:
  `Return to PMO/human review if the work requires changing apiClient runtime behavior, pulling broad frontend modules into checkJs, typing Vue SFCs, changing root check defaults, removing the shim unsafely, or introducing framework/workspace/schema dependencies beyond the approved pilot.`
- Follow-up parking:
  `If accepted, closeout should route either a reusable typed-support rule into decision_log or the next typed-boundary pilot into sprint_candidates/idea_backlog. If not accepted, record an explicit pause or defer decision so TypeScript expansion does not drift.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Phase 2 scoped type-aware JS pilot completed and validated. apiClient.js now has JSDoc/type-aware annotations and is included in the task-service scoped check without broadening the import graph or changing API transport behavior. The task-service shim was retained with minimal ImportMeta support; npm run typecheck:tasks, task service tests, and root npm run check passed. Durable follow-up rule recorded in decision_log: future type-aware JS pilots should expand only through narrow reusable boundaries and stop when import graphs pull in broad frontend surfaces.`
