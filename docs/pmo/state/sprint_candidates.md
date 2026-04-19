# Sprint Candidates

> Up to 3 bounded sprint options that are ready for human comparison before activation.

## Working Rules

- keep at most 3 active candidates in this file
- a candidate may be drafted by Codex, but it does not become the active sprint without explicit human selection
- replace or merge weaker candidates instead of stacking endlessly
- if a candidate is selected, move it into `current_sprint.md` and write the corresponding `execution_task.md`
- keep source trace visible so the selected sprint can be tied back to its discussion, backlog, or decision context

## Candidate Template

### `<sprint name>`

- Status: `candidate`
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

### `Notes Editor Polish v1`

- Status: `completed`
- Why now: `Notes already support markdown editing, but the current editor surface still feels too much like an embedded technical tool. This conflicts with the product's broader non-technical note-taking audience and leaves the markdown note experience under-polished.`
- Expected outcome: `The CodeMirror-backed note editor feels like a calm writing card rather than a code editor, while existing note editing behavior and markdown capability remain intact.`
- In scope:
  - soften the editor container framing so it feels aligned with the note surface
  - reduce the visual dominance of gutter and editor-tool cues
  - improve text padding, line height, and spacing for writing comfort
  - calm the focus state so it reads as a writing surface, not a technical input field
  - keep the editor visually compatible with the current Notes page while preparing for future page-level markdown hint placement
- Out of scope:
  - redesign of the `New Note` structure
  - markdown toolbar or in-editor markdown teaching
  - split preview or alternate note display modes
  - note storage-model changes
  - creation-flow or notes-list restructuring
  - broader page-layout work that belongs to other themes
- Dependencies: `Bounded frontend changes in frontend/src/components/NotesPanel.vue and adjacent styling, plus browser validation and UI review for final judgment.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-18 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the bounded polish slice with browser validation and UI review expectations.`
- Closeout: `Completed on 2026-04-18. Build validation and Notes UI review path passed. Residual unverified areas remain around long-form comfort, mobile viewport behavior, and deeper markdown interaction regression.`
