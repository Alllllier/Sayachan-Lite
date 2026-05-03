# Discussion Batch `discussion_batch_015`

- Topic: `Repo-native browser and UI review baseline`
- Last updated: `2026-05-04`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `validation`
- Origin trigger: `split-out from discussion_batch_010 slice-003`
- Source channel: `human discussion`
- Why now: `The frontend display-semantics and panel behavior coverage lines that previously blocked this topic have now landed. At intake, the intended repo-native Playwright UI review path existed in scripts and policy, but the concrete Notes review spec target was missing, so the discussion became mature enough to shape as its own validation/tooling thread rather than remain parked inside discussion_batch_010.`
- Related sprint or closeout: `Frontend display semantics cleanup; Frontend panel behavior coverage baseline; Frontend feature-layer migration`

## Source Trace From Parent Batch

- Parent batch: `state/discussions/discussion_batch_010.md`
- Parent slice: `slice-003: Repo-native UI review baseline`
- Why split out: `The parent batch has completed or split out its first two slices. Keeping repo-native UI review nested there now hides a concrete validation/tooling issue: the product needs a reliable browser review path for UI-visible frontend changes, especially beyond Notes, without confusing that work with unit/rules coverage or broad E2E automation.`

## Why This Discussion Exists

- PMO already treats logic tests and browser/UI review as separate validation layers.
- The repo already has Playwright dependency and repo-native script entrypoints:
  - `frontend/package.json -> npm run test:ui-review`
  - `frontend/package.json -> npm run test:ui-review:headed`
  - `frontend/playwright.config.js`
- Current policy already describes when browser validation and UI review should be used:
  - `docs/pmo/policies/testing-and-ui-review-guide.md`
- Current execution reality is now stronger than at intake, but still incomplete:
  - Notes and Projects have repo-native Playwright UI review coverage with mocked API data
  - Dashboard has repo-native Playwright UI review coverage with mocked task API data after the Dashboard saved-task browser review sprint
  - Chat now has its own global shell browser/UI review coverage
  - UI review artifact retention and closeout reporting have a v1 policy rule in `docs/pmo/policies/testing-and-ui-review-guide.md`
- The active frontend architecture has now stabilized enough that a small validation baseline can be shaped without freezing transient UI:
  - Projects, Notes, Dashboard, and Chat have feature-layer homes where applicable.
  - Projects/Notes/Dashboard behavior coverage has landed at rules/composable levels.
  - Page shells are thin and stable enough for browser review to target real surfaces.

## Theme Summary

### `theme-001`

- Summary: `Restore and define a repo-native browser/UI review baseline that complements Vitest coverage without becoming a broad E2E rewrite.`
- Why grouped: `The open problem is not missing domain behavior coverage; it is the lack of a reliable, first-class browser review path for UI-visible regressions and visual-density changes.`
- Current focus: `no`
- Status: `completed`

## Possible Slices

### `slice-001`

- Name: `Restore Notes UI review path`
- Why separate: `At intake, the npm script targeted a missing Notes review spec, so the first practical step was to make the existing repo-native path executable again before expanding coverage.`
- Current maturity: `completed`
- Likely target: `completed in sprint_candidates and archived execution report`
- Parking trigger: `If PMO decides browser review should wait until the next UI-visible sprint actually needs it.`
- Reopen signal: `If missing or broken UI review scripts continue to create closeout ambiguity.`

### `slice-002`

- Name: `Add Projects browser review baseline`
- Why separate: `Projects is the most important stable work surface and has had several UI-visible task-preview, archive, focus, and list-grammar changes that would benefit from a first-class browser review path.`
- Current maturity: `completed`
- Likely target: `completed in sprint_candidates and archived execution report`
- Parking trigger: `If restoring Notes review already exposes enough tooling uncertainty to keep this as a second pass.`
- Reopen signal: `If future Projects UI work keeps closing with avoidable unverified browser states.`

### `slice-003`

- Name: `Dashboard browser review decision`
- Why separate: `Dashboard is simpler after feature-layer cleanup, and the removed legacy Dashboard AI workflow should not be reopened by this validation thread. PMO should decide whether the current saved-task surface deserves a minimal browser review baseline now or later.`
- Current maturity: `completed`
- Likely target: `completed in sprint_candidates and archived execution report`
- Parking trigger: `If Dashboard is not receiving UI-visible work soon.`
- Reopen signal: `If Dashboard visual/interaction work restarts or saved-task UI regressions become likely.`

### `slice-004`

- Name: `UI review reporting policy refresh`
- Why separate: `The tooling shape should be reflected in PMO reporting rules so workers know when to run Vitest, build, browser validation, or screenshot/manual UI review.`
- Current maturity: `completed`
- Likely target: `completed in docs/pmo/policies/testing-and-ui-review-guide.md and decision_log.md`
- Parking trigger: `If policy stays accurate enough after the tooling repair.`
- Reopen signal: `If closeout reports continue to conflate screenshot capture with actual UI review.`

### `slice-005`

- Name: `Add Chat global shell browser review baseline`
- Why separate: `Chat is a global floating shell rather than a page surface. It appears across page screenshots and owns UI-visible states such as the floating entry, popup, runtime controls panel, chips, sending/thinking state, assistant markdown rendering, user plain-text rendering, fallback reply, and mobile density. It should be reviewed as its own surface instead of being incidental screenshot noise inside Notes, Projects, or Dashboard artifacts.`
- Current maturity: `completed`
- Likely target: `completed in sprint_candidates and archived execution report`
- Parking trigger: `If PMO decides Chat UI review should wait until Chat product/runtime work reopens.`
- Reopen signal: `If Chat visual/interaction work restarts, global Chat affordances keep affecting page-surface screenshots, or chat markdown/runtime controls regressions become likely.`

## Open Questions

- Should the first execution slice only restore the existing Notes review spec, or restore Notes and add a Projects baseline together?
- Which stable Projects states should be captured first:
  - default active projects
  - expanded task preview
  - archived project card
  - mobile project card
  - task capture open state
- Should Dashboard get a minimal saved-task browser review now, or wait until Dashboard product work reopens?
- Should repo-native UI review remain screenshot/manual-review oriented, or should any assertions become automated smoke checks?
- How should workers report “browser validation passed” versus “UI review was actually inspected”?

## Notes UI Review Coverage Notes

PMO and human agree the first Notes pass should go deeper than the older four-state baseline.

### Required v1 Notes states

- `new note / empty validation`: verify the new-note title input, CodeMirror markdown editor, Add Note action, and empty title/content helper errors.
- `active notes default`: verify multiple active notes, including a pinned note, with title, updated date, rendered markdown body, AI action icon, and overflow-menu trigger.
- `markdown rendering note`: verify headings, lists, code blocks, links, emphasis, and long content inside the rendered note body without card overflow or broken spacing.
- `overflow menu open`: verify the active note Actions menu with Edit, Archive, and Delete, including alignment, layering, and close behavior.
- `edit existing note`: verify in-card edit mode with title input, edit CodeMirror, Cancel/Save actions, plus the page-level create area while editing.
- `edit validation`: verify in-card empty title/content errors and invalid editor styling.
- `AI drafts active`: verify expanded AI task drafts, including count, long draft wrapping, Save as Task actions, and panel spacing.
- `archived notes view`: verify Archived segmented-control state, archived card styling, Restore/Delete-only actions, and absence of pin/edit/archive/AI actions.
- `mobile active view`: verify the active Notes surface on a narrow viewport, especially editor width, card actions, overflow menu, and AI draft wrapping.

### Valuable follow-up states

- `AI generation pending`: verify the pending ObjectActionArea state while a note task-generation request is in flight.
- `AI draft saved`: verify Save as Task becomes Saved/disabled and the success toast is visible.
- `AI generation failure`: verify the current failure draft state is visible without breaking layout; treat any product wording concern as follow-up UX cleanup, not as a blocker for restoring the review path.
- `toast and page error`: verify success/error toasts and the page-level Failed to load notes error.
- `empty active / empty archived`: verify No notes yet and No archived notes empty states.

### PMO judgment for first slice

The first restored Notes UI review spec should include the required v1 states if practical. The valuable follow-up states may be included when the mocking/setup cost stays small, but they should not turn the repair into a broad E2E framework project.

## Current PMO Judgment

- The discussion's core validation/tooling line is complete.
- Notes, Projects, Dashboard, and Chat all have repo-native Playwright UI review baselines.
- UI review artifact retention, final visual-state screenshot capture, and closeout reporting language now have a v1 policy rule.
- Dashboard review targets the current saved-task surface, not the removed legacy Dashboard AI workflow.
- Chat is treated as its own global shell review surface, separate from page-surface baselines.
- Remaining related work is parked outside this batch rather than blocking the batch:
  - `Reusable UI Review Harness Helpers` in `idea_backlog.md`
  - `Runtime Baseline Re-Audit` in `idea_backlog.md`
  - optional future Projects/Notes/Dashboard/Chat UI states when product work reopens

## Promotion Direction

- `slice-001` was promoted to `sprint_candidates.md` as `Restore Notes UI Review Path` on `2026-05-03` and completed the same day.
- `slice-002` was promoted and activated as `Add Projects Browser Review Baseline` on `2026-05-03` and completed the same day.
- `slice-003` was promoted to `sprint_candidates.md` as `Add Dashboard Saved-Task Browser Review Baseline` on `2026-05-04` and completed the same day.
- `slice-004` was completed on `2026-05-04` by updating `docs/pmo/policies/testing-and-ui-review-guide.md` and recording the durable decision in `decision_log.md`.
- `slice-005` was promoted to `sprint_candidates.md` as `Add Chat Global Shell Browser Review Baseline` on `2026-05-04` and completed the same day.

## Closeout Summary

- `slice-001`: completed.
- `slice-002`: completed.
- `slice-003`: completed.
- `slice-004`: completed.
- `slice-005`: completed.
- Batch status: `stable`; no remaining execution-ready slice is open inside this batch.

## Follow-Up Routing From First Execution

- `Reusable UI Review Harness Helpers` is parked in `idea_backlog.md` after the first Notes implementation showed that Notes-local helper extraction improves readability but does not yet create a genuinely reusable cross-surface harness.
- `UI Review Artifact And Reporting Rule` was resolved into `docs/pmo/policies/testing-and-ui-review-guide.md` and `decision_log.md` on `2026-05-04`.
- Reusable harness work should not block Dashboard promotion; keep Dashboard helpers surface-local unless tiny shared capture/opening helpers naturally fall out.
