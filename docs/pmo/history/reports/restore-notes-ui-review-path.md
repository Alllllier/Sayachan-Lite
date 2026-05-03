# Restore Notes UI Review Path

- Archived date: `2026-05-03`
- Source report: `docs/pmo/state/execution_report.md`
- PMO closeout result: `accepted`
- Delivery status: `completed and validated`

## Delivered

- Restored the repo-native Playwright Notes UI review path.
- Added a Playwright-native Notes review spec at `frontend/tests/ui-review/notes-ui-review.spec.js`.
- Extracted Notes-local review helpers under `frontend/tests/ui-review/`:
  - `notes-review-fixtures.js`
  - `notes-review-api-mocks.js`
  - `notes-review-helpers.js`
- These helpers improved the readability and maintainability of the Notes spec, but they are not yet a reusable cross-surface UI review harness.
- Kept the browser review path fully mocked with Playwright native route APIs.
- Avoided real backend startup, MongoDB connections, and real user data mutation.
- Updated `frontend/package.json` so Vitest run/watch scripts exclude `tests/ui-review/**`.

## Notes States Covered

- New note empty validation.
- Active notes default view with multiple notes and a pinned note.
- Markdown rendering note with heading, list, code block, link, emphasis, and long wrapping content.
- Overflow menu open with Edit, Archive, and Delete.
- Existing note edit state with in-card title/editor plus Cancel and Save.
- Edit validation errors for empty title and content.
- AI drafts active state with long draft wrapping.
- Save as Task from an AI draft, including saved state and success toast.
- Archived notes view with Restore and Delete-only actions.
- Mobile active notes view at `390x844`.

## Mocked Routes

- `GET /notes`
- `GET /notes?archived=true`
- `POST /notes`
- `PUT /notes/:id`
- `DELETE /notes/:id`
- `PUT /notes/:id/archive`
- `PUT /notes/:id/restore`
- `PUT /notes/:id/pin`
- `PUT /notes/:id/unpin`
- `POST /ai/notes/tasks`
- `GET /tasks`
- `POST /tasks`
- `GET /projects`

## Validation

- `npm run test:ui-review`: passed, 2 Playwright tests.
- `npm run test`: passed, 17 files and 110 tests.
- `npm run test:watch`: not run because it is interactive watch mode; script shape now excludes `tests/ui-review/**`.
- `npm run build`: passed, with existing Vite large-chunk warnings.

## Screenshots

Screenshots were generated under `frontend/tests/ui-review/screenshots/`:

- `notes-active-default-pinned-markdown.png`
- `notes-new-note-validation.png`
- `notes-overflow-menu-open.png`
- `notes-edit-existing-note.png`
- `notes-edit-validation-errors.png`
- `notes-ai-drafts-active.png`
- `notes-ai-draft-saved.png`
- `notes-archived-view.png`
- `notes-mobile-active-view.png`

## Parked Follow-Up

- AI pending and AI generation failure states remain optional future Notes review states.
- Page-level load error and empty active/archived states remain optional future Notes review states.
- Projects browser review remains in `discussion_batch_015 slice-002`.
- Dashboard browser review remains conditional in `discussion_batch_015 slice-003`.
- Reporting-policy refresh remains in `UI Review Artifact And Reporting Rule`.
- Real reusable harness evolution remains in `UI Review Harness Helpers`.
- Runtime baseline re-audit remains parked in `idea_backlog.md`.

## Documentation Sync Outcome

PMO runtime state updated. No broad baseline or policy rewrite was required for this closeout because the reusable-harness and artifact/reporting questions were parked as backlog items rather than resolved as durable policy.
