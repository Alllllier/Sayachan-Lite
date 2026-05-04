# Runtime Baseline

> Audited against the live repository on `2026-05-04`.

## Purpose

This document records how the current Sayachan system actually runs across surfaces.

It focuses on runtime flow and cross-surface behavior, not static architecture inventory.

## Current Product Loop

The current intended product loop is still:

`Focus -> Task -> Completion -> Memory -> Next Focus`

This loop is implemented across multiple surfaces rather than through a single workflow engine.

## Auth And Account Runtime

Current phase-one auth runtime:

- normal product routes require an authenticated session
- public auth/health routes are limited to health, owner bootstrap, tester registration, login, logout, and current-user lookup
- sessions are carried by the httpOnly `sayachan_session` cookie
- the first owner is created through `POST /auth/bootstrap-owner` only while no owner exists
- owner bootstrap assigns legacy pre-auth Notes, Projects, and Tasks missing `userId` to the new owner
- tester registration requires email, password, and a valid invite code
- invite codes are not bound to email, are single-use, expire after one month, and can be revoked before use
- tester accounts start with empty product data
- disabled accounts have sessions removed and are rejected on authenticated requests

Current lightweight owner runtime:

- owner can create/list/revoke invite codes
- owner can view tester account metadata
- owner can disable/restore tester login
- owner can view basic system status
- owner does not have product UI/API support for viewing or editing tester content, impersonating testers, provider/API-key management, prompt/private-core controls, hard user deletion, or a broad admin console

Current account-boundary truth:

- Notes, Projects, and Tasks carry `userId` and their normal product route/service reads and writes are scoped to the current user
- normal Note, Project, and Task route handlers require a resolved current user before invoking product services; the product route surface is a personal-account-scoped API, not a shared or anonymous content API
- Note, Project, and Task product services require `userId` and no longer keep unowned single-user content fallback branches; bootstrap-owner data assignment is the remaining legacy migration path for pre-auth records
- Note, Project, and Task models carry indexes for current-user list reads, archived filters, and task provenance cascades so the personal-account model remains the intended medium-term data shape rather than a temporary patch
- direct-id mutations across account boundaries behave as not found or owner-scoped no-ops through the covered route/service paths
- project/task cascade and focus-clearing behavior is scoped to current-user-owned related records
- public AI note/project routes reload persisted note/project payloads by current user ownership before prompt or fallback construction
- project next-action focus-task resolution is scoped by both task id and current user ownership
- chat receives caller-supplied public runtime context; the public runtime hydrates cockpit context from credentialed current-user `/projects` and `/tasks` reads
- frontend-only chat/cockpit transient state resets on logout/account changes
- Notes failure drafts in localStorage are scoped by authenticated account key
- `runtimeControls` localStorage remains device-level and unscoped because it stores AI behavior preference, not account-owned product content

## Surface Responsibilities

### Notes

Notes currently do all of the following:

- create and edit note content
- preserve note content as raw markdown text
- render saved note content through the shared sanitized markdown helper
- edit active notes through the CodeMirror markdown editor
- sort active and archived note lists with pinned notes first, then newest updates
- act as one provenance source for tasks
- generate note-based AI task drafts through `POST /ai/notes/tasks`
- save accepted note AI drafts as tasks with `creationMode: "ai"`, `originModule: "note"`, and `originId` set to the note id
- keep failed new-note submissions in the local `sayachan_note_drafts` residue store

### Projects

Projects currently do all of the following:

- hold project status
- connect a project to its current focus task through `currentFocusTaskId`
- sort active and archived project lists with pinned projects first, then newest updates
- expose project-linked single-task and newline-batch task capture
- show project-card task previews split into active, completed, and archived buckets
- allow only active, non-archived project tasks to become focus
- generate AI next-action suggestions through `POST /ai/projects/next-action`
- save accepted AI suggestions as tasks with `creationMode: "ai"`, `originModule: "project"`, and `originId` set to the project id

### Tasks

Tasks currently do all of the following:

- store executable work items
- preserve provenance
- reflect workflow transition through `status`, `completed`, and `archived`
- default reads to active tasks and switch to archived tasks only when `archived=true`
- participate in focus-clearing side effects when the focused task changes state
- expose shared frontend task API/rules/runtime state through `frontend/src/services/tasks/`

### Dashboard

Dashboard currently does all of the following:

- manage saved tasks through shared task state
- provide quick-add task creation
- create quick-add tasks with `creationMode: "manual"` and `originModule: "dashboard"`
- switch between active and archived saved-task lists through the shared task API
- complete and reactivate active saved tasks from the row primary action
- archive, restore, and delete saved tasks from row actions
- show provenance dots derived from `originModule` and `creationMode`
- keep its saved-task view local to shared task state; it does not proactively publish cockpit signals

### Chat

Chat currently does all of the following:

- provide a global companion entrypoint
- consume cockpit signals when already hydrated
- hydrate cockpit context on demand when needed
- send runtime controls to backend `/ai/chat`
- include the last user message in the runtime-control payload sent to `/ai/chat`
- render assistant replies as sanitized markdown
- keep user-authored chat messages on plain-text rendering
- clear the typed draft before sending a typed message; preset chip sends do not clear the typed draft

## Cockpit Context Runtime

Current chat cockpit context flow:

1. `cockpitSignals` store keeps:
   - `activeProjectsCount`
   - `activeTasksCount`
   - `pinnedProjectName`
   - `currentNextAction`
2. `Chat.vue` reads those signals as chat context.
3. If cockpit signals are not yet hydrated, chat calls `refreshCockpitContext()` to rebuild a snapshot from authenticated backend `/projects` and `/tasks` reads.
4. `cockpitContextService.js` derives and writes the cockpit snapshot.
5. Auth account changes reset the transient cockpit snapshot before the next current-user hydration.

This is currently a runtime bridge, not a deeper formal context architecture.

Current lightweight truth rule:

- cockpit signals are rebuilt from active `/projects` and active `/tasks` reads
- active project count excludes archived projects
- active task count excludes archived and completed tasks
- pinned project name comes from the first pinned, non-archived project in the active project list
- current next action comes from the first non-archived project with `currentFocusTaskId`, resolved against the active task list
- Dashboard saved-task browsing does not redefine cockpit counts or next-action semantics

## Runtime Control Flow

Chat runtime controls currently work like this:

- personality baseline, warmth, and convergence mode live in `runtimeControls` store
- those values are stored in `localStorage`
- `useChatFeature.js` reads runtime-control values
- `features/chat/chat.api.js` sends those values in requests to backend `/ai/chat`
- the frontend sends `{ messages, context, runtimeControls }` to `/ai/chat`
- the backend passes `runtimeControls` through the public bridge into the private AI core
- if chat transport or backend AI execution fails, the user sees a frontend or backend fallback reply rather than a thrown UI error

## Focus Semantics

Canonical current focus rule:

- a project is focused when `Project.currentFocusTaskId` points to a task id

Important current implications:

- focus is task-based, not free-text
- setting focus happens by updating the project with `currentFocusTaskId`
- the UI only offers focus setting for active, non-archived project-card tasks
- completing a focused project-owned task clears project focus
- archiving or deleting the current focus task clears project focus
- archiving a project also clears its `currentFocusTaskId`

## Task Provenance Runtime

Preferred runtime provenance fields are:

- `creationMode`
- `originModule`
- `originId`

Current practical shapes include:

- note AI draft saved as task: `creationMode: "ai"`, `originModule: "note"`, `originId: noteId`
- project manual or AI task: `creationMode: "manual" | "ai"`, `originModule: "project"`, `originId: projectId`
- dashboard quick-add task: `creationMode: "manual"`, `originModule: "dashboard"`, `originId: null`

Current frontend task runtime shape:

- `task.rules.js` owns canonical payload construction and saved-task normalization
- `task.api.js` owns task HTTP calls and project-card task fetch behavior
- `task.runtime.js` owns shared task refs, active-task snapshot refs, and mutation sync helpers
- feature code imports shared task behavior through `frontend/src/services/tasks/index.js`

Current backend task runtime shape:

- creating a task defaults to `status: "active"`, `archived: false`, and `completed: false`
- updating `completed` also sets `status` to `completed` or `active`
- updating `status` without an archive flag resets `archived` to false
- archiving a task preserves its lifecycle status and completion meaning
- restoring a task clears `archived` without forcing a completed task back to active

## Archive And Restore Runtime

### Notes

Current note archive flow:

- archiving a note archives note-origin tasks
- restoring a note restores those archived note-origin tasks
- note cascades match canonical note provenance: `originModule: "note"` and `originId` equal to the note id
- archived notes can be restored or deleted, but are not editable, pinnable, archivable again, or eligible for AI task generation in the UI

### Projects

Current project archive flow:

- archiving a project archives related tasks by canonical project provenance
- project archive also clears `currentFocusTaskId`
- restoring a project restores archived related tasks while preserving lifecycle semantics
- project task reads and cascades use the same current project-task relation: `originModule: "project"` and `originId` equal to the project id
- an active project card fetches both active and archived related tasks so it can show the archived-task subsection
- an archived project card fetches archived related tasks

### Tasks

Current standalone task archive flow:

- Dashboard archive toggles `archived` on the task, then removes the row from the currently visible tab
- Dashboard restore toggles `archived` off from the archived tab, then removes the row from that archived view
- deleting a task removes it from the shared active-task snapshot and clears project focus if it was focused

## AI Invocation Matrix

### Backend-Mediated

Current backend-mediated AI surfaces:

- note task generation: `POST /ai/notes/tasks`
- project next action: `POST /ai/projects/next-action`
- chat runtime: `POST /ai/chat`

Current fallback truth:

- note task generation and project next-action use GLM when `GLM_API_KEY` exists and return route-local fallback drafts or suggestions otherwise
- persisted note/project AI payloads are ownership-checked against the current authenticated user before fallback/provider prompt construction
- project next-action resolves the current focus task title on the backend with current-user ownership before prompting
- chat uses the public `/ai/chat` route and `backend/src/ai/bridge.js` to call the private AI core when `KIMI_API_KEY` or `MOONSHOT_API_KEY` exists
- chat returns a route-local fallback reply when the key is missing or the bridge call fails

### Removed Frontend Fallback

Removed frontend-local fallback AI surfaces:

- weekly review
- focus recommendation
- action plan
- dashboard task drafts

Important current truth:

- the older Dashboard AI Assistant fallback helper file has been removed
- Dashboard AI workflow is parked for a future product/AI redesign, not preserved as an active frontend-local fallback path

## Shared Markdown Runtime

Current markdown runtime truth:

- assistant chat replies are rendered with a shared markdown helper
- that helper uses `markdown-it`, `highlight.js`, and `DOMPurify`
- helper settings disable raw HTML, enable linkification and line breaks, and sanitize rendered output
- user-authored chat messages are still rendered as plain text
- saved notes and assistant chat replies share the markdown rendering helper on the public frontend side
- active note editing preserves raw markdown text rather than rendered HTML
