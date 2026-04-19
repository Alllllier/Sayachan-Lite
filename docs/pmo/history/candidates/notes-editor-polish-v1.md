# Candidate Archive

### `Notes Editor Polish v1`

- Archived date: `2026-04-19`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/current_sprint.md`
- Why it mattered: `Notes already supported markdown editing, but the editor surface still felt too much like an embedded technical tool. The sprint existed to make note writing feel calmer and more appropriate for a broader non-technical audience.`
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
- Closeout summary: `Completed on 2026-04-18. Build validation and Notes UI review path passed. Residual unverified areas remained around long-form comfort, mobile viewport editor experience, and deeper markdown interaction regression beyond the exercised review path.`
- Follow-up created from this candidate: `state/discussions/discussion_batch_002.md -> state/sprint_candidates.md: Notes Editor Comfort Fixes`
- Notes: `Archived out of the current candidate surface once the narrower follow-up candidate became the main near-term comparison item. The current_sprint.md closeout record remains the runtime source for the most recently closed sprint.`
