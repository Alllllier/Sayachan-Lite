# Sprint Candidates

> Up to 3 execution-ready sprint options that the human can choose from before starting implementation.

## Usage Rule

- keep at most 3 candidates in this file
- each candidate should already be bounded enough to compile into a Claude execution prompt
- when one candidate is selected to start, move it into `current_sprint.md`
- if a new candidate is stronger than an existing one, replace or merge instead of stacking endlessly

## Candidate Template

### `<sprint name>`

- Status: `candidate`
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

- Status: `candidate`
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
- Dependencies: `Bounded frontend-only changes in NotesPanel.vue and adjacent styling, plus browser/UI review for final judgment.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Human selects this candidate to start; Codex then writes current_sprint.md and execution_task.md for the bounded polish slice with browser validation and UI review expectations.`
