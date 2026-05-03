# Add Projects Browser Review Baseline

- Archived date: `2026-05-03`
- Source report: `docs/pmo/state/execution_report.md`
- PMO closeout result: `accepted`
- Delivery status: `completed and validated`

## Delivered

- Added the first Projects repo-native browser/UI review baseline at `frontend/tests/ui-review/projects/review.spec.js`.
- Added Projects-local fixtures, route mocks, and helpers:
  - `frontend/tests/ui-review/projects/fixtures.js`
  - `frontend/tests/ui-review/projects/api-mocks.js`
  - `frontend/tests/ui-review/projects/helpers.js`
- Organized UI review files by surface:
  - `frontend/tests/ui-review/notes/`
  - `frontend/tests/ui-review/projects/`
- Organized screenshots by surface:
  - `frontend/tests/ui-review/notes/screenshots/`
  - `frontend/tests/ui-review/projects/screenshots/`
- Updated `frontend/package.json` so `npm run test:ui-review` and `npm run test:ui-review:headed` run the full `tests/ui-review` directory, covering both Notes and Projects.
- Removed obsolete `defineEmits` imports from `NotesPanel.vue` and `ProjectsPanel.vue`, clearing the repeated Vue compiler macro warning.

## Projects States Covered

- Default active Projects view with multiple projects and a pinned project.
- Project card status badge, summary, current focus display, and task preview.
- Collapsed active task preview with current-focus marker.
- Expanded active task preview.
- Completed task preview filter.
- Archived task preview section on an active project, including expanded archived preview.
- Single task capture open.
- Batch task capture mode.
- Overflow menu open with Edit, Archive, and Delete.
- Archived Projects view with archived project card and Restore/Delete-only actions.
- Mobile active Projects view at `390x844`.
- Optional cheap coverage: AI suggestions active state and Save as Task.

## Mocked Routes

- `GET /projects`
- `GET /projects?archived=true`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `PUT /projects/:id/archive`
- `PUT /projects/:id/restore`
- `PUT /projects/:id/pin`
- `PUT /projects/:id/unpin`
- `GET /tasks?projectId=:id`
- `GET /tasks?projectId=:id&archived=true`
- `POST /tasks`
- `POST /ai/projects/next-action`
- `GET /notes`

## Validation

- `npm run test:ui-review`: passed, 4 Playwright tests covering Notes and Projects.
- Post-cleanup reruns of `npm run test:ui-review`: passed, including after surface-folder organization and after removing obsolete `defineEmits` imports.
- `npm run test`: passed, 17 files and 110 tests.
- `npm run build`: passed, with existing Vite large-chunk warnings.

## Screenshots

Projects screenshots were generated under `frontend/tests/ui-review/projects/screenshots/`:

- `projects-active-default-pinned-collapsed-preview.png`
- `projects-active-expanded-task-preview.png`
- `projects-completed-task-preview-filter.png`
- `projects-active-archived-task-preview-expanded.png`
- `projects-single-task-capture-open.png`
- `projects-batch-task-capture-mode.png`
- `projects-ai-suggestions-active.png`
- `projects-ai-suggestion-saved-as-task.png`
- `projects-overflow-menu-open.png`
- `projects-archived-view-restore-delete-only.png`
- `projects-mobile-active-view.png`

Notes screenshots now live under `frontend/tests/ui-review/notes/screenshots/`.

## Parked Follow-Up

- Optional edit existing project state and validation errors remain out of scope.
- Optional project creation validation, toast/load-error states, and empty states remain out of scope.
- Dashboard browser review remains in `discussion_batch_015 slice-003`.
- Reusable harness work remains parked in `Reusable UI Review Harness Helpers`.
- Artifact/reporting policy remains parked in `UI Review Artifact And Reporting Rule`.
- Runtime-baseline re-audit remains parked in `idea_backlog.md`.

## Documentation Sync Outcome

PMO runtime state updated. No broad baseline or policy rewrite was required for this closeout. The sprint added a second repo-native UI review surface and improved folder organization, while reusable harness and artifact/reporting rules remain parked as future PMO work.
