# Add Dashboard Saved-Task Browser Review Baseline

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_015.md slice-003; decision_log.md Removed Dashboard AI workflow is not active scope`
- Why it mattered: `Dashboard was the remaining primary work surface without first-class browser/UI review coverage after Notes and Projects gained repo-native Playwright review paths.`
- Expected outcome: `Add a mocked, repo-native Dashboard saved-task UI review path with low-noise screenshots, without reopening the removed Dashboard AI workflow or requiring a real backend/MongoDB.`
- In scope: `Dashboard-local UI review spec, fixtures, API mocks, helpers, screenshots, active/archived saved-task states, overflow menus, empty states, quick-add saved state, mobile density, and reporting under the UI review guide.`
- Out of scope: `Removed Dashboard AI workflow, new Dashboard AI concept design, backend task persistence semantics, cockpit/chat context architecture, broad E2E framework design, reusable harness extraction, and Dashboard visual redesign.`
- Dependencies: `Completed Notes and Projects UI review baselines; Dashboard Saved-Task Behavior Guardrails; current Dashboard.vue; dashboard feature rules/composable boundaries; shared task service; frontend/playwright.config.js; testing-and-ui-review guide.`
- Closeout summary: `Completed on 2026-05-04. Added Dashboard Playwright UI review with mocked /tasks data, Dashboard-local fixtures/mocks/helpers, eight screenshots, desktop/mobile saved-task states, and animation-disabled final-state capture. npm run test:ui-review, npm run test, and npm run build passed with the existing Vite large-chunk warning. Actual UI review inspected generated screenshots.`
- Follow-up created from this candidate: `Global Chat shell review was promoted separately after Dashboard screenshots exposed Chat as an app-shell artifact.`
- Notes: `Archived from state/sprint_candidates.md after PMO policy changed to archive selected candidates at closeout instead of retaining completed entries in the current comparison surface.`
