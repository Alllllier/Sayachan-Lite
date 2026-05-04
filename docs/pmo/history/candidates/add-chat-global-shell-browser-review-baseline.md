# Add Chat Global Shell Browser Review Baseline

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_015.md slice-005; runtime-baseline.md Chat; system-baseline.md Chat`
- Why it mattered: `Chat was a global floating app-shell surface visible across page screenshots and needed its own review baseline instead of being treated as incidental screenshot noise.`
- Expected outcome: `Add a mocked, repo-native Chat Playwright UI review path that captures stable global shell states and complements existing Chat tests without testing private-core AI quality or changing Chat behavior.`
- In scope: `Chat-local UI review spec, fixtures, API mocks, helpers, screenshots, floating entry, popup default state, runtime controls, markdown rendering, hydration/thinking state, AI failure fallback, and mobile popup density.`
- Out of scope: `Private-core orchestration, provider calls, prompt kernel behavior, AI response quality, backend /ai/chat route semantics beyond mocked browser responses, cockpit context architecture, chat memory redesign, broad E2E framework design, and cross-surface screenshot hiding policy.`
- Dependencies: `Completed Notes, Projects, and Dashboard UI review baselines; current Chat.vue; chat feature API/rules/composable boundaries; runtimeControls and cockpitSignals stores; frontend/playwright.config.js; testing-and-ui-review guide.`
- Closeout summary: `Completed on 2026-05-04. Added Chat Playwright UI review with mocked /projects, /tasks, and /ai/chat data, Chat-local fixtures/mocks/helpers, nine screenshots, desktop/mobile global-shell states, runtime controls, hydration/thinking, markdown rendering, and mocked send-failure fallback. npm run test:ui-review, npm run test, and npm run build passed with the existing Vite large-chunk warning. Actual UI review inspected generated screenshots.`
- Follow-up created from this candidate: `No direct candidate follow-up. The mocked AI failure console error remains accepted test-path noise unless future Chat layout or screenshot policy work reopens it.`
- Notes: `Archived from state/sprint_candidates.md after PMO policy changed to archive selected candidates at closeout instead of retaining completed entries in the current comparison surface.`
