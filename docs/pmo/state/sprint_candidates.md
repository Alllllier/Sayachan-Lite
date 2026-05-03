# Sprint Candidates

> Up to 3 bounded sprint options that are ready for human comparison before activation.

## Working Rules

- keep at most 3 total entries in this file, including recently completed candidates retained for near-term context
- a candidate may be drafted by Codex, but it does not become the active sprint without explicit human selection
- replace or merge weaker candidates instead of stacking endlessly
- when a new candidate needs space, archive older completed entries into `../history/candidates/` before pushing the file past 3 total items
- if a candidate is selected, keep it visible here while also activating `current_sprint.md` and writing the corresponding `execution_task.md`
- after sprint closeout, update the selected candidate entry to `completed` before later archival into `../history/candidates/` when space is needed
- keep source trace visible so the selected sprint can be tied back to its discussion, backlog, or decision context

## Candidate Template

### `<sprint name>`

- Status: `candidate | active | completed`
- Source reference:
- Why now:
- Expected outcome:
- In scope:
- Out of scope:
- Dependencies:
- Risk level: `low | medium | high`
- Readiness: `ready | almost-ready | blocked`
- Start condition:

## Current Candidates

### `Add Projects Browser Review Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_015.md slice-002`
- Why now: `Projects is the most stable high-value work surface after the feature-layer migration and rules coverage passes. It now carries several UI-visible runtime states that code review and Vitest do not inspect well: project card hierarchy, task preview collapsed/expanded behavior, focus display, archived task preview, task capture, AI suggestions, archived project cards, and mobile density. The Notes UI review path has restored the repo-native Playwright baseline, so Projects can now add the first non-Notes browser review surface.`
- Expected outcome: `The frontend gains a repo-native Projects Playwright UI review path that uses mocked API data, captures stable Projects browser states, avoids real backend/MongoDB data, and complements existing Projects rules/composable tests without turning into broad E2E coverage or reusable harness work.`
- In scope:
  - add a Projects UI review spec under `frontend/tests/ui-review/`, likely `projects-ui-review.spec.js`
  - add Projects-local fixtures, API mocks, and review helpers only where they keep the Projects spec readable
  - use Playwright native route mocking for Projects, project-card tasks, project mutations, AI next-action suggestions, and Save as Task behavior
  - keep the existing Notes UI review path working
  - capture required Projects review states:
    - default active projects with multiple projects and a pinned project
    - project card with status badge, summary, current focus display, and task preview
    - collapsed active task preview with current-focus task marker
    - expanded active task preview
    - completed task preview filter state
    - archived task preview section on an active project
    - task capture open in single mode
    - task capture batch mode
    - overflow menu open with Edit, Archive, and Delete
    - edit existing project state with validation errors if cheap
    - AI suggestions active state with Save as Task if cheap
    - archived projects view with archived project card and Restore/Delete-only actions
    - mobile active projects view at a narrow viewport
  - write screenshots or durable Playwright artifacts for reviewable states
- Out of scope:
  - starting the real backend or requiring a live MongoDB/server connection
  - creating, deleting, archiving, restoring, pinning, focusing, or saving real user projects/tasks
  - Dashboard browser review
  - reusable cross-surface UI review harness extraction beyond tiny naturally shared helpers
  - broad E2E framework design
  - backend route, cascade, focus-clearing, or database semantics validation
  - visual redesign of ProjectsPanel or shared UI primitives
  - changing Projects product behavior unless the current UI blocks the review path and PMO/human approves a same-scope correction
- Dependencies: `completed Restore Notes UI Review Path; discussion_batch_015 slice-002; current ProjectsPanel.vue; features/projects API/rules/composable boundaries; shared task service; Playwright config and frontend package ui-review scripts.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-05-03 by human direction to proceed with the Projects UI review baseline after Notes UI review closeout.`
- Closeout: `Completed on 2026-05-03. Added a Projects Playwright UI review path with mocked API data, Projects-local fixtures/mocks/helpers, desktop and mobile Projects screenshots, optional AI suggestions coverage, and repo-native ui-review script coverage for both Notes and Projects. UI review files and screenshots are organized by surface. npm run test:ui-review passed, npm run test passed, and npm run build passed with the existing Vite large-chunk warning. Optional Projects edit/create/error/empty states remain parked; Dashboard browser review, reusable harness work, artifact/reporting policy, and runtime-baseline re-audit remain separate follow-ups.`

### `Add Dashboard Saved-Task Browser Review Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_015.md slice-003; decision_log.md Removed Dashboard AI workflow is not active scope`
- Why now: `Notes and Projects now have repo-native Playwright UI review paths, while Dashboard is the remaining primary work surface without first-class browser/UI review coverage. The current Dashboard runtime surface is narrow and stable: quick add, saved tasks, active/archived views, preview/expanded saved-task list behavior, provenance dots, row actions, empty states, and mobile density. Existing Dashboard rules tests protect behavior derivation, but they do not inspect rendered list density, segmented controls, overflow menus, toasts, or mobile layout.`
- Expected outcome: `The frontend gains a repo-native Dashboard Playwright UI review path that uses mocked task API data, captures stable Dashboard saved-task states, writes low-noise screenshots under a Dashboard-local ui-review folder, and complements existing Dashboard rules/composable tests without reopening the removed Dashboard AI workflow or requiring a real backend/MongoDB.`
- In scope:
  - add a Dashboard UI review spec under `frontend/tests/ui-review/dashboard/`
  - add Dashboard-local fixtures, API mocks, and helpers only where they keep the spec readable
  - use Playwright native route mocking for `/tasks` fetch/create/update/delete paths rather than starting the real backend
  - keep existing Notes and Projects UI review paths working
  - capture required Dashboard review states:
    - active saved tasks default collapsed view with more than five tasks and `Show all (...)`
    - active saved tasks expanded view with full list and `Show less`
    - active task overflow menu with `Archive` and `Delete`
    - completed active task row showing muted/completed state while remaining reactivatable
    - quick-add populated or saved state with success toast if setup stays small
    - archived saved tasks view with archived rows and `Restore` / `Delete` actions
    - active empty state
    - archived empty state
    - mobile active Dashboard view at a narrow viewport
  - write screenshots as review artifacts under `frontend/tests/ui-review/dashboard/screenshots/`
  - report browser validation, artifact capture, and actual UI review using the updated testing-and-ui-review guide language
- Out of scope:
  - reintroducing Weekly Review, Focus Recommendation, Action Plan, Task Drafts, or any Dashboard AI Assistant block
  - designing a new Dashboard AI concept
  - changing Dashboard product behavior or visual design beyond tiny testability fixes approved by PMO
  - backend task route, database, archive, delete, or completion semantics validation
  - cockpit/chat context semantics beyond preserving the current page shell
  - broad E2E framework design or cross-surface harness extraction beyond tiny naturally shared helpers
  - reusable UI review helper refactor unless a very small shared capture/opening helper falls out naturally
- Dependencies: `completed Notes and Projects UI review baselines; Dashboard Saved-Task Behavior Guardrails; current Dashboard.vue; frontend/src/features/dashboard rules/composable boundaries; shared task service; frontend/playwright.config.js; updated testing-and-ui-review-guide.md artifact/reporting rule.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-05-04 by human direction to promote Dashboard after PMO confirmed the removed Dashboard AI workflow is not active scope and Dashboard review should target the current saved-task surface. Activated on 2026-05-04 by explicit human direction to open the sprint.`
- Closeout: `Completed on 2026-05-04. Added a Dashboard Playwright UI review path with mocked /tasks data, Dashboard-local fixtures/mocks/helpers, eight durable Dashboard screenshots, desktop and mobile saved-task review states, and animation-disabled screenshot capture for stable final visual frames without fixed waits. npm run test:ui-review passed across Notes, Projects, and Dashboard; npm run test passed; npm run build passed with the existing Vite large-chunk warning. Actual UI review inspected the generated screenshots. The global Chat floating entry remains visible in Dashboard screenshots by app-shell design and may be revisited only if surface screenshot policy wants cleaner artifacts.`

### `Add Chat Global Shell Browser Review Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_015.md slice-005; runtime-baseline.md Chat; system-baseline.md Chat`
- Why now: `Notes, Projects, and Dashboard now have first-class surface-local UI review baselines, but Chat remains a global floating app-shell surface that is visible across page screenshots and has several UI-visible states that code review and Vitest do not inspect well: floating entry placement, popup layout, quick chips, send/thinking state, runtime controls panel, assistant markdown rendering, user plain-text rendering, fallback reply, and mobile popup density. The Dashboard review also showed that global Chat affordances can appear inside page-surface artifacts, so Chat should get its own baseline rather than being implicitly reviewed as screenshot noise on other surfaces.`
- Expected outcome: `The frontend gains a repo-native Chat Playwright UI review path that uses mocked AI/cockpit API data, captures stable global Chat shell states, writes low-noise screenshots under a Chat-local ui-review folder, and complements existing Chat feature/composable tests without testing private-core AI quality or changing Chat product behavior.`
- In scope:
  - add a Chat UI review spec under `frontend/tests/ui-review/chat/`
  - add Chat-local fixtures, API mocks, and helpers only where they keep the spec readable
  - use Playwright native route mocking for `/ai/chat` and any cockpit context fallback fetches needed to enter cold-hydration states
  - keep existing Notes, Projects, and Dashboard UI review paths working
  - capture required Chat review states:
    - floating chat entry on a normal page at desktop viewport
    - open chat popup default state with header, welcome bubble, quick chips, input, and send button
    - runtime controls panel open with baseline radios, warmth slider, convergence controls, and disabled future controls
    - typed user message plus mocked assistant markdown reply, preserving user plain text and assistant sanitized markdown rendering
    - sending/thinking state with disabled input/button if setup stays small
    - cockpit hydration state if setup stays small
    - AI send failure fallback reply
    - mobile open chat popup at a narrow viewport
  - write screenshots as review artifacts under `frontend/tests/ui-review/chat/screenshots/`
  - capture screenshots at final visual state, preferring `animations: 'disabled'` over fixed waits
  - report browser validation, artifact capture, and actual UI review using the testing-and-ui-review guide language
- Out of scope:
  - testing real private-core orchestration, provider calls, prompt kernel behavior, or AI response quality
  - changing Chat product behavior or visual design beyond tiny testability fixes approved by PMO
  - backend `/ai/chat` route semantics beyond mocked browser review responses
  - formal cockpit context architecture or chat memory redesign
  - broad E2E framework design or cross-surface harness extraction beyond tiny naturally shared helpers
  - deciding whether other surface screenshots should hide Chat; record any finding as a policy follow-up rather than forcing it into this sprint
- Dependencies: `completed Notes, Projects, and Dashboard UI review baselines; current Chat.vue; frontend/src/features/chat API/rules/composable boundaries; runtimeControls and cockpitSignals stores; frontend/playwright.config.js; testing-and-ui-review-guide.md artifact/reporting and final-visual-state screenshot rules.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-05-04 by human direction to add a Chat UI review sprint after Dashboard closeout exposed Chat as a global app-shell artifact and PMO confirmed Chat should be treated as its own global shell review surface. Activated on 2026-05-04 by explicit human direction to open the sprint.`
- Closeout: `Completed on 2026-05-04. Added a Chat Playwright UI review path with mocked /projects, /tasks, and /ai/chat data, Chat-local fixtures/mocks/helpers, nine durable Chat screenshots, desktop and mobile global-shell review states, runtime controls coverage, hydration/thinking coverage, markdown rendering coverage, and mocked send-failure fallback coverage. npm run test:ui-review passed across Notes, Projects, Dashboard, and Chat; npm run test passed; npm run build passed with the existing Vite large-chunk warning. Actual UI review inspected the generated screenshots. No product runtime files, backend, MongoDB, private-core orchestration, provider calls, prompt kernel behavior, memory behavior, or AI-quality paths were changed or validated.`
