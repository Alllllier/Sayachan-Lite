# Candidate Archive

### `Task Project Note Simplification Refactor`

- Archived date: `2026-04-21`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_007.md; task-project-note-behavior-audit.md; state/idea_backlog.md`
- Why it mattered: `It was the main structural cleanup slice that converted the behavior-lock work into a simpler runtime model, unified project-task provenance handling, and removed major legacy seams from the active task/project/note implementation.`
- Expected outcome: `Task, project, and note would keep their locked external behavior while the implementation became materially simpler and more coherent, with canonical project provenance, simplified focus-clearing, removed dead legacy fields, and reduced dashboard snapshot drift.`
- In scope:
  - replace `linkedProjectId` implementation duties with `originModule + originId` where behavior parity could be preserved
  - unify the runtime rule for project-related task boundaries
  - simplify focus-clearing
  - remove dead or denormalized task fields once behavior-lock coverage proved they were not active dependencies
  - retire `project_focus` and `project_suggestion` from canonical runtime handling if compatibility-only
  - reduce dashboard snapshot drift through bounded simplification
- Out of scope:
  - no new first-class relationship system
  - no note-note, note-project, or project-project feature execution
  - no context-layer architecture project
  - no production-grade migration system for development-stage data
  - no broad AI runtime redesign
- Dependencies: `Completed behavior-lock coverage from Task Project Note Behavior-Lock Testing, stabilized discussion context in discussion_batch_007, and the audit findings in task-project-note-behavior-audit.md.`
- Closeout summary: `Completed on 2026-04-20. The runtime moved to canonical project provenance as the primary task relation path, removed the main dead and denormalized task fields from the active schema and write path, simplified focus-clearing, reduced dashboard snapshot drift, and moved route helper clusters into a dedicated backend helper module.`
- Follow-up created from this candidate: `Task Project Note Runtime Residue Cleanup`
- Notes: `Archived out of the active candidate surface on 2026-04-21 to restore the 3-entry limit after later frontend candidate work displaced older completed backend/runtime entries.`
