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

### `Project Task Preview Expansion And Focus Simplification`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_005.md`
- Why now: `The current project-card task preview is too limited to support real task steering and still carries a dedicated Set as Focus button that adds action noise. The discussion has now stabilized a bounded redesign that makes the preview more useful without turning the card into a full task manager.`
- Expected outcome: `Project cards become more useful and calmer at the same time: collapsed previews show up to three active tasks, expanded previews reveal the full task surface through an explicit expand/collapse control, active/completed tasks are separated through a lighter one-control switch, and setting project focus happens directly through task-row click with a clear Current Focus badge instead of a separate button.`
- In scope:
  - update `ProjectsPanel.vue` task preview so collapsed state shows up to 3 active tasks only
  - add one changing `展开 / 收起` control for the preview container
  - make expanded state show full task titles instead of truncation
  - add a lighter one-control switch between `active` and `completed` task groups in expanded state
  - remove the dedicated `Set as Focus` button from task preview rows
  - make task-row click on active tasks set the project's current focus
  - show a `Current Focus` badge on the focused task row
- Out of scope:
  - broader ProjectsPanel redesign outside the preview block
  - changes to task storage, backend task/project contracts, or focus-clearing semantics
  - dashboard task-list interaction redesign
  - task editing, inline completion controls, or richer task-management behavior inside the project card
  - new AI behavior or new project/task data fields
- Dependencies: `Bounded frontend work in ProjectsPanel.vue plus validation of project-focus behavior and preview-state behavior after implementation.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-19 by explicit human selection; PMO activated current_sprint.md and execution_task.md for this bounded ProjectsPanel interaction redesign while keeping the candidate visible until closeout.`
- Closeout: `Completed on 2026-04-20. The Projects card preview now supports collapsed vs expanded task viewing, an always-visible active/completed segmented filter, direct row-click focus setting, and mobile-specific hiding of the redundant row-level Current Focus badge. Residual unverified areas remain around real completed-task rendering in browser review, hover interactions, and multi-project mixed-state coverage.`

### `UI Noise Reduction And Toast Consolidation`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_003.md`
- Why now: `Recent product review surfaced two linked UI consistency problems: low-frequency management actions are overexposed as always-visible buttons, and success feedback is still fragmented across toast plus many local inline implementations. Treating them as one bounded cleanup keeps the next UI polish pass coherent instead of splitting the same noise-reduction goal into separate sprints.`
- Expected outcome: `Notes, Projects, and the Dashboard task list feel quieter and more consistent because low-frequency management actions move behind a shared overflow pattern, while frontend success feedback defaults to the shared toast path instead of mixed inline local-state confirmations.`
- In scope:
  - move `edit`, `archive`, and `delete` into a trailing overflow menu on `NotesPanel.vue` and `ProjectsPanel.vue`
  - keep `pin` and AI actions directly visible on note and project cards
  - use a vertical-ellipsis trailing trigger placed after the AI action on note and project cards
  - keep overflow menu order consistent as `Edit -> Archive -> Delete`
  - align the `Dashboard.vue` saved-task overflow trigger with the same vertical-ellipsis language
  - replace current inline success confirmations in `NotesPanel.vue`, `ProjectsPanel.vue`, and `Dashboard.vue` with the shared toast path where no persistent in-context confirmation is actually needed
  - preserve current product behavior while changing presentation and feedback delivery
- Out of scope:
  - broader Dashboard AI workflow redesign
  - new action types, new AI behavior, or task/project/note data-model changes
  - broad visual restyling outside the overflow and toast consistency pass
  - a global component-system rewrite for every possible action menu in the app
- Dependencies: `Bounded frontend work across Notes, Projects, Dashboard, and the shared toast path, plus browser/UI review of action discoverability and feedback behavior after implementation.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-19 by explicit human selection; PMO activated current_sprint.md and execution_task.md for this bounded consistency pass while keeping the candidate visible until closeout.`
- Closeout: `Completed on 2026-04-19. Notes, Projects, and Dashboard landed the intended overflow/toast cleanup, but only Notes received browser-level UI review coverage; Projects overflow behavior, Dashboard toast behavior, overflow discoverability, and touch-device interaction remain bounded unverified areas.`

### `Notes Editor Comfort Fixes`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_002.md; state/decision_log.md; state/idea_backlog.md`
- Why now: `Real usage after Notes Editor Polish v1 exposed concrete comfort issues that directly affect day-to-day writing fidelity: the editor text still reads too large, normal note writing can drift into horizontal scrolling, and the editing surface remains slightly misaligned with the rendered reading experience.`
- Expected outcome: `The Notes editor becomes a calmer and more trustworthy writing surface for long-form note-taking by tightening text scale, restoring wrapped continuous writing flow, and aligning edit-mode reading structure more closely with rendered notes without reopening broader style work.`
- In scope:
  - reduce the default editing text scale to the newly discussed target range centered on `14px`
  - tighten editor line height toward `1.6` so the writing rhythm stays calm without feeling oversized
  - make wrapped continuous writing the default path for normal note content instead of horizontal scrolling
  - preserve the previously shipped polish direction while adjusting comfort and fidelity details
  - validate the result through Notes-focused browser validation and UI review of real writing states
- Out of scope:
  - rendered-note identity or presentation styling changes
  - broader Sayachan style refresh work
  - new markdown affordances, toolbar ideas, or preview modes
  - notes architecture, storage, or creation-flow changes
  - wider Notes page redesign beyond the bounded comfort fixes
- Dependencies: `Bounded frontend changes in the Notes editor surface, plus execution review of realistic writing states after implementation.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-19 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the bounded comfort-fix slice while keeping the candidate visible until closeout.`
- Closeout: `Completed on 2026-04-19. The bounded comfort targets landed in NotesPanel.vue, build validation plus Notes-focused browser/UI review passed, and residual unverified areas remain around very long writing comfort, mobile wrapping behavior, and deeper edit/render parity.`
