# Execution Task Outbox

- Task ID: `note-markdown-foundation-v1`
- Sprint: `Note Markdown Foundation v1`
- Status: `ready`
- Prepared by: `Codex`
- Execution owner: `Claude VS Code`
- Architecture owner: `Human`
- Last updated: `2026-04-16`

## Sprint Goal

Deliver Note Markdown Foundation v1 for the existing note module: markdown editing in edit state and markdown rendering in display state, while preserving current architecture boundaries and the existing note workflow.

## Architecture Context

Sayachan Lite is a frontend-backend split product with a public runtime centered on Notes, Projects, Tasks, Dashboard, and Chat.
The current note module stores `note.content` as a plain string, uses plain textarea editing, and displays note content as plain text.
For this sprint, markdown must remain a frontend capability layered onto the existing `note.content` field, not a new backend content system.
This sprint is a note-surface enhancement, not an AI-core, chat-runtime, or workflow-model sprint.

## Safe Touch Zones

- `frontend/src/components/NotesPanel.vue`
- `frontend/src/views/NotesPage.vue` if minor wiring is needed
- `frontend/package.json` for markdown/editor/render dependencies
- note-related styles in `frontend/src/style.css` or local scoped styles
- `backend/src/models/Note.js` only if a minimal compatibility-safe adjustment is strictly necessary
- note-related handling in `backend/src/routes/index.js` only if required to preserve existing CRUD behavior

## Do Not Touch Unless Escalated

- `backend/private_core/sayachan-ai-core`
- `backend/src/ai/bridge.js`
- chat runtime surfaces such as `frontend/src/components/ChatEntry.vue`, `frontend/src/services/chatService.js`, `frontend/src/stores/runtimeControls.js`
- dashboard AI behavior and orchestration paths
- project/task focus coupling and archive cascade rules in `backend/src/routes/index.js`

## Explicit Non-Goals

- no image upload
- no split preview
- no backend markdown rendering service
- no database model redesign
- no rich-text editor platform
- no broad refactor of the note system
- no project/task/domain workflow changes
- no AI-core or chat-runtime changes

## Execution Task

Implement Note Markdown Foundation v1 inside the approved safe zones.

Required outcome:

- use CodeMirror as the note editor in edit state
- render stored markdown in display state
- support fenced code block rendering with syntax highlighting
- preserve the existing storage contract: raw markdown remains in `note.content`
- keep current note CRUD behavior intact
- preserve compatibility for existing plain-text notes

Execution expectations:

- prefer minimal, local changes over new abstractions
- choose lean dependencies suitable for Vue 3 + Vite
- integrate markdown editing into the current note editing flow rather than building a parallel editor system
- render markdown safely; do not leave raw HTML/XSS behavior ambiguous
- preserve existing note create, update, archive, restore, pin, and delete flows

## Completion Report Contract

The execution worker must write the result into `docs/pmo/inbox/execution_report.md` using these sections:

1. delivered
2. validation performed
3. boundary compliance
4. unresolved
5. architecture decisions needed
6. recommended next sprint slice

## Escalate To Architecture Owner If

- implementation requires changing the note storage model beyond raw markdown in `note.content`
- safe markdown rendering requires a broader rendering-policy decision
- work starts to affect chat runtime, dashboard AI, or private AI core boundaries
- split preview, uploads, attachments, or broader document capabilities become necessary
- the task stops being a bounded note enhancement and starts becoming an editor-platform decision
