# Notes Rules Behavior Coverage

- Archived date: `2026-05-03`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_013.md slice-002`
- Why it mattered: `NotesPanel was a core long-lived surface and needed rules-level coverage for note validation, AI task state derivation, active versus archived action eligibility, and edit snapshot restoration before later browser/UI review work.`
- Expected outcome: `A first Notes rules behavior baseline around local note validation, AI task reveal state derivation, active versus archived action eligibility, and simple edit snapshot restoration rules, without reopening editor design, rendered markdown identity, AI reveal/list convergence, or feature-layer migration.`
- In scope: `Small Notes rules helper extraction and focused Vitest coverage for validation, AI state derivation, active/archived action eligibility, and simple edit snapshot restoration.`
- Out of scope: `CodeMirror redesign, rendered markdown identity, broader style refresh, browser/UI review, AI reveal/list convergence, Notes feature-layer migration, component rendering tests, backend archive/restore behavior changes, and local draft-cache redesign.`
- Dependencies: `discussion_batch_013 slice-002 code review; existing NotesPanel validation/action-state implementation; completed input-state, editor-comfort, and action-grouping baselines.`
- Closeout summary: `Completed on 2026-04-26. Added a narrow Notes rules helper and Vitest baseline for local validation, AI task state derivation, and active/archived action eligibility. NotesPanel consumed those helpers without changing note API, editor, markdown, draft cache, AI reveal/list, or feature-layer structure. Targeted Notes behavior tests, full frontend npm test, and production build passed with only the existing Vite large-chunk warning.`
- Follow-up created from this candidate: `Later Notes UI review work completed separately through Restore Notes UI Review Path.`
- Notes: `Archived out of sprint_candidates.md to make room for the active Projects browser review candidate while preserving completed candidate history.`
