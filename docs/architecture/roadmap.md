# Roadmap Baseline

> Rewritten from audited repository state on 2026-04-16.

## Shipped Milestones

### Foundation

- Vue 3 + Vite frontend scaffold
- Koa backend scaffold
- MongoDB connection with non-blocking startup
- environment-driven local setup

### Notes Surface

- notes CRUD
- note pin and unpin
- note archive and restore
- cascade archive and restore for note-origin tasks
- markdown editing and rendering in the notes UI
- AI note-to-task generation through backend route with fallback

### Projects Surface

- projects CRUD
- project status management
- task-based project focus via `currentFocusTaskId`
- project pin and unpin
- project archive and restore
- cascade archive and restore for related tasks
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

- Dashboard AI still depends on frontend-direct GLM calls
- legacy task fields remain in the schema for compatibility
- workflow domain rules are concentrated in route handlers
- top-level onboarding docs still over-simplify the runtime compared with current reality

## Near-Term Cleanup Priorities

- finish migrating canonical architecture references from `.docs` to `docs/**`
- retire `.claude`-scoped doc sync assumptions
- decide whether Dashboard AI should also move behind backend mediation
- tighten the repo entrypoint docs so they match the current public/private split
