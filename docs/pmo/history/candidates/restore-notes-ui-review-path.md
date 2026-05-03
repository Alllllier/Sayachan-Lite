# Candidate Archive: `Restore Notes UI Review Path`

- Archived from: `docs/pmo/state/sprint_candidates.md`
- Archive date: `2026-05-04`
- Final status: `completed`
- Source reference: `state/discussions/discussion_batch_015.md slice-001`

## Candidate

### `Restore Notes UI Review Path`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_015.md slice-001`
- Why now: `The intended repo-native Playwright UI review path exists in frontend scripts and PMO policy, but `npm run test:ui-review` currently points to a missing Notes spec and fails with `No tests found`. Notes is the current review target, the feature-layer migration has landed, and the Notes runtime surface is stable enough to restore a first-class browser/UI review path without using a real backend or broad E2E scope.`
- Expected outcome: `The frontend regains an executable Notes UI review spec that starts Vite through the existing Playwright webServer, mocks Notes/Tasks/AI API responses, captures or exposes stable Notes review states, and lets workers clearly distinguish browser validation from actual UI review.`
- In scope:
  - add or restore `frontend/tests/ui-review/notes-ui-review.spec.js`
  - keep `frontend/package.json` script names as the repo-native entrypoints unless a tiny correction is required
  - use Playwright route mocking for Notes, archived Notes, note AI task drafts, note mutations, and Save as Task rather than starting the real backend or touching real MongoDB data
  - cover required Notes UI review states:
    - new note / empty validation
    - active notes default with multiple notes and a pinned note
    - markdown rendering note with headings, lists, code, links, emphasis, and long content
    - overflow menu open with Edit, Archive, and Delete
    - edit existing note with in-card title/editor plus Cancel/Save actions
    - edit validation errors
    - AI drafts active with long draft wrapping and Save as Task action
    - archived notes view with Restore/Delete-only actions
    - mobile active view at a narrow viewport
  - include valuable follow-up states only when setup stays small:
    - AI generation pending
    - AI draft saved
    - AI generation failure
    - success/error toast and page-level load error
    - empty active and archived states
  - write screenshots or durable Playwright artifacts for reviewable states
  - update PMO UI-review reporting guidance only if the implementation changes how workers should report browser validation versus actual UI review
- Out of scope:
  - starting the real backend or requiring a live MongoDB/server connection
  - creating, deleting, archiving, or restoring real user notes or tasks
  - Projects or Dashboard browser review baselines
  - broad E2E framework design
  - backend route, cascade, or database semantics validation
  - visual redesign of NotesPanel, CodeMirror, ObjectActionArea, or shared UI primitives
  - fixing AI generation failure wording unless it blocks the review path
  - runtime-baseline re-audit work beyond recording any direct finding surfaced by this slice
- Dependencies: `discussion_batch_015 Notes UI Review Coverage Notes; frontend/playwright.config.js; frontend/package.json test:ui-review scripts; current NotesPanel.vue; features/notes API/rules/composable boundaries; agreement to use mocked API and include a mobile active-state review.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-05-03 by human approval to promote and then start the Notes-first UI review slice with screenshots, mobile coverage, mocked API, and optional edge states only when cheap.`
- Closeout: `Completed on 2026-05-03. Restored the Notes Playwright UI review path with mocked API data, Notes-local runtime-shaped fixtures, Notes-local Playwright route helpers, screenshot/capture helpers, desktop and mobile review states, and Vitest script isolation for ui-review specs. npm run test:ui-review passed, npm run test passed, and npm run build passed with the existing Vite large-chunk warning. The helper extraction made the Notes spec readable but did not complete a reusable cross-surface harness. Optional AI pending/failure, load-error, and empty-state coverage remain parked; reusable UI review harness work, Projects/Dashboard browser review, and UI review artifact/reporting policy remain separate follow-ups.`
