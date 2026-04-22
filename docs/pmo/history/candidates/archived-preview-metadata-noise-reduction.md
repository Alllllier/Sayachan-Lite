# Candidate Archive

### `Archived Preview Metadata Noise Reduction`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_010.md; human screenshot feedback in current thread`
- Why now: `The last project-surface semantics cleanup clarified `status + archived`, but screenshot feedback now shows that archived preview rows still carry too much repeated metadata on mobile. The separate archived section is correct, but the combination of section label plus per-row lifecycle and archive markers is visually noisy enough to merit a bounded micro-fix.`
- Expected outcome: `Archived project-task preview rows become quieter and easier to scan without losing the semantics just established. The archived section remains, archived tasks stay non-interactive, and completed-vs-active remains legible, but redundant metadata shouting is reduced.`
- In scope:
  - reduce redundant metadata noise inside archived preview rows on the `ProjectsPanel`
  - preserve the separate archived section itself
  - preserve archived-task non-interactivity
  - preserve completed-task strikethrough treatment
  - preserve archived-project narrow actions
  - keep any supporting test update narrow and local to this UI noise fix
- Out of scope:
  - broader `ProjectsPanel` redesign
  - dashboard or notes-surface changes
  - broader frontend test coverage buildout
  - repo-native UI review repair
  - backend/runtime semantics changes
- Dependencies: `Completed Project Surface Display Semantics Cleanup plus the screenshot-confirmed UI-noise issue surfaced in the current thread.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-21 by explicit human instruction to auto-generate candidates, auto-select the best micro-fix, execute it, review it, close it out, and commit without further human gating.`
- Closeout: `Completed on 2026-04-21. The micro-fix removed the redundant per-row Archived chip from archived preview rows on ProjectsPanel while preserving the separate archived section, completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions. Narrow frontend validation passed through projectsPanel.behavior.test.js.`
