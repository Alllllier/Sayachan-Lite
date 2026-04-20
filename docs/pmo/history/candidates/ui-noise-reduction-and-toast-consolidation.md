# Candidate Archive

### `UI Noise Reduction And Toast Consolidation`

- Archived date: `2026-04-20`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_003.md`
- Why it mattered: `Recent product review surfaced two linked UI consistency problems: low-frequency management actions were overexposed as always-visible buttons, and success feedback was still fragmented across toast plus many local inline implementations. Treating them as one bounded cleanup kept the next UI polish pass coherent instead of splitting the same noise-reduction goal into separate sprints.`
- Expected outcome: `Notes, Projects, and the Dashboard task list would feel quieter and more consistent because low-frequency management actions would move behind a shared overflow pattern, while frontend success feedback would default to the shared toast path instead of mixed inline local-state confirmations.`
- In scope:
  - move `edit`, `archive`, and `delete` into a trailing overflow menu on `NotesPanel.vue` and `ProjectsPanel.vue`
  - keep `pin` and AI actions directly visible on note and project cards
  - use a vertical-ellipsis trailing trigger placed after the AI action on note and project cards
  - keep overflow menu order consistent as `Edit -> Archive -> Delete`
  - align the `Dashboard.vue` saved-task overflow trigger with the same vertical-ellipsis language
  - replace current inline success confirmations in `NotesPanel.vue`, `ProjectsPanel.vue`, and `Dashboard.vue` with the shared toast path where no persistent in-context confirmation was actually needed
- Out of scope:
  - broader Dashboard AI workflow redesign
  - new action types, new AI behavior, or task/project/note data-model changes
  - broad visual restyling outside the overflow and toast consistency pass
  - a global component-system rewrite for every possible action menu in the app
- Dependencies: `Bounded frontend work across Notes, Projects, Dashboard, and the shared toast path, plus browser/UI review of action discoverability and feedback behavior after implementation.`
- Closeout summary: `Completed on 2026-04-19. Notes, Projects, and Dashboard landed the intended overflow/toast cleanup, but only Notes received browser-level UI review coverage; Projects overflow behavior, Dashboard toast behavior, overflow discoverability, and touch-device interaction remained bounded unverified areas.`
- Follow-up created from this candidate: `No direct execution follow-up. The entry is archived only to make room on the current candidate surface.`
- Notes: `Archived out of the current candidate surface to make room for the later simplification-refactor follow-on candidate after the behavior-lock testing sprint was completed.`
