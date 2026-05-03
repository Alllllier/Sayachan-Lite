# Roadmap Baseline

> Recast for Sayachan PMO v2 from the audited repository state.

## Shipped Milestones

### Foundation

- Vue 3 + Vite frontend scaffold
- Koa backend scaffold
- MongoDB connection with non-blocking startup
- environment-driven local setup

### Notes Surface

- notes CRUD
- pin and unpin
- archive and restore
- note-origin task archive and restore behavior
- markdown editing and rendering in the notes UI
- AI note-to-task generation through backend route with fallback

### Projects Surface

- projects CRUD
- project status management
- task-based project focus via `currentFocusTaskId`
- project pin and unpin
- project archive and restore
- related-task archive and restore
- AI project next-action suggestions through backend route with fallback

### Tasks Surface

- shared saved task state in the frontend
- semantic provenance fields in backend model and task creation flow
- project-linked tasks
- archive view toggle
- focus-clearing behavior on completion, archive, and delete

### Dashboard

- quick-add tasks
- saved-task management
- active / archived saved-task view toggle
- saved-task complete / reactivate, archive / restore, and delete actions
- saved-task provenance dots from canonical task provenance
- removed older fallback-only Dashboard AI workflow:
  - weekly review
  - focus recommendation
  - action plan
  - dashboard task drafts

### Chat Runtime

- global floating chat entry
- backend `/ai/chat` route
- assistant-message markdown rendering with a safe basic reading subset
- cockpit context hydration path through active projects and tasks
- runtime controls store
- persona baseline switch
- warmth and convergence controls
- bridge into private AI core

### Validation And PMO Baseline

- feature-layer API/rules/composable tests for Notes, Projects, Dashboard, Chat, and shared task services
- repo-native Playwright UI review baselines for Notes, Projects, Dashboard, and Chat
- PMO v2 runtime state, discussion index, sprint candidates, history reports, policies, and baselines
- runtime baseline re-audited against live code on `2026-05-04`

## Active Debt

- workflow domain rules are still concentrated in route handlers
- no authentication, invite flow, or account-scoped data boundary exists yet
- frontend bundle size still carries the existing large-chunk warning from the current editor/runtime dependency shape
- some PMO process/tooling improvements remain parked rather than execution-ready

## Near-Term Cleanup Priorities

- shape owner-led auth and invite-gated tester accounts before external testing
- continue the Dashboard day-phase rhythm cue discussion before promoting product work
- keep baseline docs synced after major feature/runtime migrations
- defer UI review harness extraction until repeated helper drift makes it worth the indirection
