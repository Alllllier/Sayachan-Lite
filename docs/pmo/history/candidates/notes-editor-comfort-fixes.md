# Candidate Archive

### `Notes Editor Comfort Fixes`

- Archived date: `2026-04-20`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_002.md; state/decision_log.md; state/idea_backlog.md`
- Why it mattered: `Real usage showed that everyday note writing still suffered from oversized text, horizontal drift, and editing/read-mode mismatch, so the editor needed a bounded comfort correction before broader styling discussion continued.`
- Expected outcome: `The Notes editor would become calmer and more trustworthy for day-to-day writing by tightening scale, restoring wrapped writing flow, and improving comfort without reopening broader style work.`
- In scope:
  - reduce editing text scale toward the discussed target
  - tighten editor line height for calmer writing rhythm
  - restore wrapped continuous writing as the default path
  - preserve the prior polish direction while correcting comfort issues
  - validate the result through Notes-focused browser review
- Out of scope:
  - rendered-note identity styling
  - broader Sayachan style refresh work
  - new markdown affordances or toolbar ideas
  - notes architecture, storage, or creation-flow changes
  - wider Notes page redesign
- Dependencies: `Bounded frontend changes in the Notes editor surface plus execution review of realistic writing states.`
- Closeout summary: `Completed on 2026-04-19. The bounded comfort targets landed in NotesPanel.vue, build validation plus Notes-focused browser/UI review passed, and residual unverified areas remained around very long writing comfort, mobile wrapping behavior, and deeper edit/render parity.`
- Follow-up created from this candidate: `No direct execution follow-up. Durable rendered-surface identity deferral remained tracked in state/decision_log.md and state/idea_backlog.md.`
- Notes: `Archived out of the current candidate surface to make room for a newer cross-model architecture candidate after the completed entry had already served its near-term comparison role.`
