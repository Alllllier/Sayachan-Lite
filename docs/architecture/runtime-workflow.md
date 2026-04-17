# Runtime Workflow

## Product Loop

The current intended product loop is:

`Focus -> Task -> Completion -> Memory -> Next Focus`

This loop is implemented across several surfaces rather than one formal workflow engine.

## Surface Responsibilities

### Notes

- create and edit note content
- generate AI task drafts from a note through `/ai/notes/tasks`
- preserve note content as raw markdown text
- act as one task provenance source

### Projects

- hold project status
- connect a project to its current focus task through `currentFocusTaskId`
- generate AI next-action suggestions through `/ai/projects/next-action`
- expose project-linked task capture and focus assignment

### Tasks

- store executable work items
- preserve provenance and optional project linkage
- reflect workflow transitions through `status` and `completed`

### Dashboard

- show recent notes and projects
- manage saved tasks through shared task state
- provide AI weekly review, focus recommendation, action plan, and task drafts
- publish lightweight cockpit signals for chat

### Chat

- provide a global companion entrypoint
- consume cockpit signals or hydrate them on demand
- send runtime controls to the backend chat route
- render assistant replies as a safe basic markdown reading surface
- keep user-authored messages on plain-text rendering

### Shared Markdown Rendering

- Notes and Chat now share the same frontend markdown rendering helper
- the shared helper uses `markdown-it` for rendering, `highlight.js` for fenced code blocks, and `DOMPurify` before `v-html` injection
- this is a public-runtime rendering concern only; it does not change backend `/ai/chat` contracts or note storage contracts

## Focus Semantics

Canonical focus rule:

- a project is focused when `Project.currentFocusTaskId` points to an active task

Important implications:

- focus is not stored as a free-form string on the project model
- setting focus happens in the Projects UI by picking an existing task
- completing, archiving, or deleting the current focus task can clear project focus

## Task Provenance Contract

Preferred task contract fields:

- `creationMode`: `manual` or `ai`
- `originModule`: such as `note`, `project`, or `dashboard`
- `originId`
- `originLabel`
- `linkedProjectId`
- `linkedProjectName`

Practical examples:

- note-generated task: `originModule = note`, no linked project
- project task: `originModule = project`, linked to the project
- dashboard quick-add: `originModule = dashboard`

## Archive And Restore Rules

### Notes

- archiving a note archives note-origin tasks
- restoring a note restores those archived note-origin tasks to active

### Projects

- archiving a project archives related tasks by `linkedProjectId` or `originId`
- project archive also clears `currentFocusTaskId`
- restoring a project restores archived related tasks to active

## AI Invocation Matrix

Backend-mediated:

- note task generation: `/ai/notes/tasks`
- project next action: `/ai/projects/next-action`
- chat runtime: `/ai/chat`

Frontend-direct:

- weekly review
- focus recommendation
- action plan
- dashboard task drafts
- text summarization

This split is intentional in the current repo state but should be treated as an active architecture debt item.
