# Projects Rules Behavior Coverage

- Archived date: `2026-05-03`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_013.md slice-001`
- Why it mattered: `ProjectsPanel was the most stable and important panel surface at the time, and its task preview, archive/lifecycle display semantics, focus eligibility, and shared list/card baselines needed rules-level protection before later frontend architecture work.`
- Expected outcome: `A tighter Projects rules behavior baseline around task bucketing, preview branch selection, preview range and expansion, archived-project preview behavior, and focus eligibility, without locking the current SFC wiring shape.`
- In scope: `Projects rules/helper coverage for active/completed/archived task bucketing, primary versus archived preview branches, preview limits, archived-project preview behavior, active/completed filtering, focus eligibility, and focus title derivation.`
- Out of scope: `Projects feature-layer migration, API endpoint tests, broad ProjectsPanel redesign, broad task capture coverage, component rendering tests, AI suggestion/list convergence, browser validation, screenshot review, Playwright, E2E, NotesPanel, and Dashboard coverage.`
- Dependencies: `discussion_batch_013 slice-001 code review; existing projectsPanel behavior helpers/tests at the time; current taskService project-card fetch behavior; agreement that the sprint protected rules rather than SFC wiring.`
- Closeout summary: `Completed on 2026-04-26. Expanded Projects rules-level behavior tests, moved the project preview limit into a shared rules constant consumed by ProjectsPanel, and aligned setTaskAsFocus with canSetProjectFocus so archived tasks cannot slip through the runtime guard. Targeted frontend tests passed and production build passed with the existing Vite large-chunk warning.`
- Follow-up created from this candidate: `Later Projects feature-layer and UI-review work remained separate PMO tracks.`
- Notes: `Archived out of sprint_candidates.md to make room for the promoted Notes UI Review candidate while preserving completed candidate history.`
