# Candidate Archive

### `Project Surface Display Semantics Cleanup`

- Archived date: `2026-04-21`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_010.md`
- Why it mattered: `It established the first coherent project-surface display rule after archive state was split from lifecycle status, preventing archived tasks from disappearing or being re-merged into the main preview lists.`
- Expected outcome: `The project and archived-project surfaces would show the now-correct status-plus-archived model clearly without broad UI churn, while preserving completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions.`
- In scope:
  - clarify project-surface display semantics for tasks after `archived` was separated from lifecycle `status`
  - ensure archived tasks on `Project` and `Archived Project` surfaces live in their own secondary archived section
  - keep archived-section tasks visually expressing lifecycle per item instead of splitting the archived section into separate `active` and `completed` subgroups
  - preserve the currently liked interaction and display affordances
- Out of scope:
  - broader frontend test coverage buildout
  - dashboard surface redesign
  - notes-surface redesign
  - repo-native UI review repair
  - broad restyling or interaction redesign beyond the narrow project-surface semantics cleanup
- Dependencies: `Completed archive/lifecycle model cleanup and the display-semantics judgments captured in discussion_batch_010.`
- Closeout summary: `Completed on 2026-04-20. The slice separated archived preview tasks into their own project-surface section, preserved lifecycle visibility per task item without splitting archived tasks into a second active/completed grouping, and kept the liked affordances intact: completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions.`
- Follow-up created from this candidate: `Archived Preview Metadata Noise Reduction`
- Notes: `Archived out of the active candidate surface on 2026-04-21 so a newer archived-project-specific micro-fix could enter the 3-entry candidate window without violating the cap.`
