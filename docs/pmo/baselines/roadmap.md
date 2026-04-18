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

- recent notes and projects surfaces
- quick-add tasks
- AI weekly review
- AI focus recommendation
- AI action plan
- AI task drafts
- cockpit signals for chat context

### Chat Runtime

- global floating chat entry
- backend `/ai/chat` route
- assistant-message markdown rendering with a safe basic reading subset
- dashboard context hydration path
- runtime controls store
- persona baseline switch
- warmth and convergence controls
- bridge into private AI core

## Active Debt

- legacy task fields remain in the schema for compatibility
- workflow domain rules are still concentrated in route handlers
- top-level docs still over-simplify the runtime compared with current reality
- current PMO structure still mixes mature runtime surfaces with earlier descriptive scaffolding

## Near-Term Cleanup Priorities

- stabilize PMO v2 and migrate active PMO use away from the old mixed structure
- tighten top-level repo entry docs so they match the current public/private split
- decide how much of the old PMO should move into a legacy archive once PMO v2 is running
