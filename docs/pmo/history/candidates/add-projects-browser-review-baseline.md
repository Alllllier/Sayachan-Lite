# Add Projects Browser Review Baseline

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_015.md slice-002`
- Why it mattered: `Projects was the first stable non-Notes work surface ready for repo-native browser/UI review after the feature-layer migration and rules coverage passes.`
- Expected outcome: `Add a mocked, repo-native Projects Playwright UI review path with durable screenshots, without requiring the real backend or broad E2E coverage.`
- In scope: `Projects-local UI review spec, fixtures, API mocks, helpers, screenshots, required desktop/mobile Projects states, and preservation of the existing Notes UI review path.`
- Out of scope: `Real backend/MongoDB execution, real project/task mutations, Dashboard browser review, broad E2E framework design, backend semantics validation, reusable harness extraction, and Projects visual redesign.`
- Dependencies: `Restore Notes UI Review Path; discussion_batch_015 slice-002; current ProjectsPanel.vue; projects feature API/rules/composable boundaries; shared task service; Playwright config and frontend package ui-review scripts.`
- Closeout summary: `Completed on 2026-05-03. Added Projects Playwright UI review with mocked API data, Projects-local fixtures/mocks/helpers, desktop and mobile screenshots, optional AI suggestions coverage, and repo-native ui-review script coverage for Notes and Projects. npm run test:ui-review, npm run test, and npm run build passed with the existing Vite large-chunk warning.`
- Follow-up created from this candidate: `Dashboard browser review, reusable UI review helper assessment, artifact/reporting policy, and runtime-baseline re-audit remained separate follow-ups.`
- Notes: `Archived from state/sprint_candidates.md after PMO policy changed to archive selected candidates at closeout instead of retaining completed entries in the current comparison surface.`
