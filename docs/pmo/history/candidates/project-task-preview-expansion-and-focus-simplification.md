# Candidate Archive

### `Project Task Preview Expansion And Focus Simplification`

- Archived date: `2026-04-20`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_005.md`
- Why it mattered: `The project-card task preview was too limited to support real task steering and still carried a dedicated Set as Focus button that added avoidable action noise. The product needed a bounded redesign that made the preview more useful without turning the card into a full task manager.`
- Expected outcome: `Project cards would become more useful and calmer at the same time: collapsed previews would show up to three tasks, expanded previews would reveal the full task surface through an explicit expand/collapse control, active/completed tasks would be separated through a lighter one-control switch, and setting project focus would happen directly through task-row click with a clear Current Focus badge instead of a separate button.`
- In scope:
  - update `ProjectsPanel.vue` task preview so collapsed state shows up to 3 tasks from the current preview group
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
- Closeout summary: `Completed on 2026-04-20. The Projects card preview now supports collapsed vs expanded task viewing, an always-visible active/completed segmented filter, direct row-click focus setting, and mobile-specific hiding of the redundant row-level Current Focus badge. Residual unverified areas remained around real completed-task rendering in browser review, hover interactions, and multi-project mixed-state coverage.`
- Follow-up created from this candidate: `No direct execution follow-up. The candidate is archived only to make room on the active candidate surface.`
- Notes: `Archived out of the current candidate surface to make room for the newer behavior-lock testing candidate that will support the later task/project/note simplification pass.`
