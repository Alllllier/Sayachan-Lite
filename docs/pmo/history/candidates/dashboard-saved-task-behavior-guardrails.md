# Candidate Archive: `Dashboard Saved-Task Behavior Guardrails`

- Archived from: `docs/pmo/state/sprint_candidates.md`
- Archive date: `2026-05-04`
- Final status: `completed`
- Source reference: `state/discussions/discussion_batch_013.md slice-003`

## Candidate

### `Dashboard Saved-Task Behavior Guardrails`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_013.md slice-003`
- Why now: `Dashboard has been reduced to a narrow current surface: quick-add, saved tasks, active/archived saved-task view, row-level completion/archive/delete behavior, provenance dots, and a lightweight cockpit-signal bridge for chat context. The older Dashboard AI workflow is gone, so the right testing move is a small guardrail pass that protects the behavior that still exists without freezing a broader Dashboard product shape.`
- Expected outcome: `The frontend gains a tighter Dashboard saved-task behavior baseline around preview/expanded derivation, active versus archived row interaction rules, completion/reactivation payloads, archive/restore/delete current-tab removal, provenance display derivation, and cockpit active-work truth alignment. Dashboard.vue should consume extracted pure helpers only where this replaces embedded rules without changing product behavior.`
- In scope:
  - extend `frontend/src/components/dashboard.behavior.js` with small pure helpers where useful for:
    - saved-task preview versus expanded visible range
    - saved-task overflow and toggle label derivation
    - active versus archived row interaction and action eligibility
    - completion/reactivation payload derivation
    - canonical provenance letter, class, and tooltip derivation
  - extend `frontend/src/components/dashboard.behavior.test.js` to cover:
    - collapsed saved-task view shows at most five tasks
    - expanded saved-task view shows the full current list
    - toggle label distinguishes overflow, expanded, and non-overflow states
    - active rows are primary-click interactive while archived rows are not
    - active rows expose Archive/Delete while archived rows expose Restore/Delete
    - completion payload flips active to completed and completed to active
    - archive/restore removes tasks from the current visible tab
    - provenance derives only from `originModule` and `creationMode`
  - add or extend `dashboardContextService.test.js` only if needed to keep live Dashboard cockpit rules aligned with fallback snapshot truth
  - lightly wire `Dashboard.vue` to extracted helpers where this directly exposes the tested rules
  - preserve current product behavior
- Out of scope:
  - reintroducing Weekly Review, Focus Recommendation, Action Plan, dashboard task drafts, or any Dashboard AI Assistant block
  - Dashboard AI workflow redesign
  - broad Dashboard information architecture
  - browser, screenshot, Playwright, E2E, or UI review
  - creating `useDashboardTasks.js`, `dashboard.api.js`, or a full Dashboard feature-layer migration
  - replacing the cockpit-signal bridge with a formal context architecture
  - redesigning shared list primitives or row visuals
  - backend task route changes
- Dependencies: `discussion_batch_013 slice-003 code review; current Dashboard.vue saved-task implementation; existing dashboard.behavior.js/test; existing taskService active-task snapshot tests; existing dashboardContextService cockpit snapshot tests; completed Dashboard display-list migration`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-26 by human direction to promote slice-003 after PMO confirmed the current Dashboard surface is much smaller than the old AI workflow and corrected roadmap baseline drift.`
- Closeout: `Completed on 2026-04-26. Added helper-level Dashboard saved-task rules coverage for preview/expanded state, active versus archived row behavior, completion/reactivation payloads, archive/restore payloads, current-tab removal, and canonical provenance derivation. Dashboard.vue now consumes those helpers without reintroducing Dashboard AI workflow, feature-layer migration, backend route changes, shared list primitive changes, or UI/E2E review. Targeted Dashboard/task/context tests, full frontend npm test, and production build passed, with only the existing Vite large-chunk warning.`
