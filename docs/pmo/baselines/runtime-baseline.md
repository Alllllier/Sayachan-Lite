# Runtime Baseline

> Audited against the live repository on `2026-04-20`.

## Purpose

This document records how the current Sayachan system actually runs across surfaces.

It focuses on runtime flow and cross-surface behavior, not static architecture inventory.

## Current Product Loop

The current intended product loop is still:

`Focus -> Task -> Completion -> Memory -> Next Focus`

This loop is implemented across multiple surfaces rather than through a single workflow engine.

## Surface Responsibilities

### Notes

Notes currently do all of the following:

- create and edit note content
- preserve note content as raw markdown text
- act as one provenance source for tasks
- generate note-based AI task drafts through `POST /ai/notes/tasks`

### Projects

Projects currently do all of the following:

- hold project status
- connect a project to its current focus task through `currentFocusTaskId`
- expose project-linked task capture
- generate AI next-action suggestions through `POST /ai/projects/next-action`

### Tasks

Tasks currently do all of the following:

- store executable work items
- preserve provenance
- reflect workflow transition through `status` and `completed`
- participate in focus-clearing side effects when the focused task changes state

### Dashboard

Dashboard currently does all of the following:

- manage saved tasks through shared task state
- provide quick-add task creation
- publish lightweight cockpit signals for chat context

### Chat

Chat currently does all of the following:

- provide a global companion entrypoint
- consume cockpit signals when already hydrated
- hydrate dashboard context on demand when needed
- send runtime controls to backend `/ai/chat`
- render assistant replies as sanitized markdown
- keep user-authored chat messages on plain-text rendering

## Dashboard Context Runtime

Current dashboard-to-chat context flow:

1. `Dashboard.vue` derives lightweight cockpit signals.
2. `cockpitSignals` store keeps:
   - `activeProjectsCount`
   - `activeTasksCount`
   - `pinnedProjectName`
   - `currentNextAction`
3. `ChatEntry.vue` reads those signals as chat context.
4. If cockpit signals are not yet hydrated, chat calls `refreshDashboardContext()` to rebuild a snapshot from backend `/projects` and `/tasks`.

This is currently a runtime bridge, not a deeper formal context architecture.

Current lightweight truth rule:

- cockpit signals should represent active-work truth
- archived-task browsing should not redefine cockpit counts or next-action semantics

## Runtime Control Flow

Chat runtime controls currently work like this:

- personality baseline, warmth, and convergence mode live in `runtimeControls` store
- those values are stored in `localStorage`
- `chatService.js` includes those runtime-control values in requests to backend `/ai/chat`

## Focus Semantics

Canonical current focus rule:

- a project is focused when `Project.currentFocusTaskId` points to a task

Important current implications:

- focus is task-based, not free-text
- setting focus happens through project-task relations
- completing a focused canonical project task can clear project focus
- archiving or deleting the current focus task clears project focus

## Task Provenance Runtime

Preferred runtime provenance fields are:

- `creationMode`
- `originModule`
- `originId`

Current practical shapes include:

- note-generated task
- project-origin task
- dashboard quick-add task

## Archive And Restore Runtime

### Notes

Current note archive flow:

- archiving a note archives note-origin tasks
- restoring a note restores those archived note-origin tasks

### Projects

Current project archive flow:

- archiving a project archives related tasks by canonical project provenance only
- project archive also clears `currentFocusTaskId`
- restoring a project restores archived related tasks while preserving lifecycle semantics

## AI Invocation Matrix

### Backend-Mediated

Current backend-mediated AI surfaces:

- note task generation: `POST /ai/notes/tasks`
- project next action: `POST /ai/projects/next-action`
- chat runtime: `POST /ai/chat`

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
- user-authored chat messages are still rendered as plain text
- notes and chat share the markdown rendering helper on the public frontend side
