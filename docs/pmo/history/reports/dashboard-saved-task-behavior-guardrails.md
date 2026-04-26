# Dashboard Saved-Task Behavior Guardrails

- Status: `completed`
- Sprint: `Dashboard Saved-Task Behavior Guardrails`
- Closeout date: `2026-04-26`
- Outcome: `accepted / safe to close out`

## Delivered

- Added Dashboard saved-task behavior helpers for preview versus expanded visible ranges, overflow/toggle label derivation, list mode derivation, active versus archived row state, row action labels, completion/reactivation payloads, archive/restore payloads, current-tab removal, and provenance derivation.
- Extended `frontend/src/components/dashboard.behavior.test.js` to cover:
  - collapsed saved-task view limits to five tasks
  - expanded saved-task view returns the full current list
  - toggle label distinguishes overflow, expanded, and non-overflow states
  - active rows are primary-click interactive while archived rows are not
  - active rows expose Archive/Delete while archived rows expose Restore/Delete
  - completion payload flips active to completed and completed to active
  - archive and restore payloads flip the archived state
  - archive/restore removal drops the task from the current visible tab
  - provenance derives from `originModule` and `creationMode`
- Wired `frontend/src/components/Dashboard.vue` to the extracted helpers for the saved-task rules above while preserving the current reduced Dashboard surface.

## Production Wiring

- `Dashboard.vue` production wiring changed only to replace embedded saved-task derivation rules with tested helpers.
- No backend task routes, shared list primitives, row visuals, or broad Dashboard information architecture were changed.

## Validation

- `npm test -- src/components/dashboard.behavior.test.js src/services/dashboardContextService.test.js src/services/taskService.test.js`
  - Result: passed, 3 files and 24 tests.
- `npm test`
  - Result: passed, 6 files and 45 tests.
- `npm run build`
  - Result: passed.
  - Note: Vite emitted the existing large chunk warning for production assets.

## Unverified

- Browser/UI/E2E behavior was not verified because it was explicitly out of scope.
- No manual visual review was performed.

## Out Of Scope Confirmation

- Dashboard AI workflow remained out of scope and was not reintroduced or redesigned.
- Feature-layer migration remained out of scope; no `useDashboardTasks.js`, `dashboard.api.js`, or equivalent migration was created.
- Browser/UI review remained out of scope.

## PMO Closeout Read

- PMO accepted the worker return as in-scope.
- No same-scope follow-up is required before closeout.
- `discussion_batch_013` remains active after this sprint because additional frontend behavior gaps may still be shaped later.

