# Archived Candidate Record

## Original Candidate

### `Task Project Note Behavior-Lock Testing`

- Status at archive time: `completed`
- Original source reference: `state/discussions/discussion_batch_007.md; task-project-note-behavior-audit.md; state/idea_backlog.md`
- Why it mattered: `Recent archive/lifecycle work plus the follow-up audit showed that task, project, note, and dashboard-context behavior now spanned enough real runtime semantics that simplification should not start from intuition alone. A dedicated behavior-lock sprint was needed to preserve current product outcomes before structural cleanup continued.`
- Expected outcome at the time: `The current intended behavior across task, project, note, and dashboard-context surfaces would become explicit and test-backed so later simplification could remove legacy seams without guessing which behaviors mattered.`
- In scope at the time:
  - add backend behavior tests for archive/restore semantics across note and project flows
  - add backend tests for current project-task relation boundaries, including the difference between project reads and project archive/restore cascades
  - add backend tests for focus-clearing behavior in the current completion/archive/delete paths
  - add frontend behavior tests for Projects preview branching, Dashboard saved-task behavior, and dashboard-context snapshot semantics
  - keep browser/UI review bounded to high-value archive/project/dashboard checks
  - explicitly document which current behaviors were must-preserve versus compatibility-era residue
- Out of scope at the time:
  - the later simplification refactor itself
  - field-removal or relation-model changes such as removing `linkedProjectId`
  - converting focus-clearing to the simpler symmetric rule yet
  - broad dashboard-context architecture redesign
  - production-grade migration work for legacy development-stage data
- Dependencies at the time: `Stable discussion context from discussion_batch_007 plus the audit findings in task-project-note-behavior-audit.md.`
- Risk level at the time: `medium`
- Readiness at the time: `ready`
- Archived because: `Candidate surface needed space for newer backend testing work after the behavior-lock sprint had already completed and its result remained preserved in archived reports plus later discussion context.`

## Closeout Snapshot

- Completed on: `2026-04-20`
- Outcome summary: `Backend and frontend behavior-lock coverage landed for key task/project/note/archive paths plus chat hydration and dashboard saved-task behavior. The sprint clarified that dashboard-context truth remained only partially locked and that browser-level repo-native UI review was unavailable because the script pointed at a missing spec file.`
- Follow-on direction retained at the time: `A later simplification-refactor candidate remained the intended next move.`
