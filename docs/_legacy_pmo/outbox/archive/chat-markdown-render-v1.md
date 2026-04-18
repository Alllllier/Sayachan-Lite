# Execution Task Outbox

- Task ID: `chat-markdown-render-v1`
- Sprint: `Chat Markdown Render v1`
- Status: `ready`
- Prepared by: `Codex`
- Execution owner: `Claude VS Code`
- Architecture owner: `Human`
- Last updated: `2026-04-17`
- Archive note: `Archived after the active outbox was replaced by a report-rewrite follow-up task before sprint closeout.`

## Sprint Goal

Fix raw markdown leakage in chat by rendering assistant messages as a safe basic markdown reading surface while keeping user messages plain text and preserving existing backend and store contracts.

## Architecture Context

Sayachan Lite is a frontend-backend split product with a public runtime centered on Notes, Projects, Tasks, Dashboard, and Chat.
The current chat flow stores raw message strings in the frontend chat store and receives assistant replies as plain strings from `/ai/chat`.
Notes already contain a markdown rendering path using `markdown-it`, `DOMPurify`, and `highlight.js`, but that renderer currently lives privately inside `frontend/src/components/NotesPanel.vue`.
This sprint is a bounded frontend rendering improvement, not an AI-core, backend-contract, or message-model redesign.

## Safe Touch Zones

- `frontend/src/components/ChatEntry.vue`
- `frontend/src/components/NotesPanel.vue` for narrow extraction of shared markdown render logic
- new shared frontend helper/style files if needed for bounded reuse
- lightweight related styling in `frontend/src/style.css` or narrow local scoped styles

## Do Not Touch Unless Escalated

- `backend/private_core/sayachan-ai-core`
- `backend/src/ai/bridge.js`
- backend `/ai/chat` contract shape
- chat store message model in ways that require structured rich-message storage
- dashboard AI behavior and orchestration paths
- note storage contract or note CRUD route behavior
- project/task/domain workflow rules

## Explicit Non-Goals

- no backend markdown rendering service
- no backend `/ai/chat` response-shape changes
- no rendering markdown for user messages
- no tables, images, raw HTML, task-list interaction, code-copy affordances, collapsible blocks, or custom callout systems
- no broad markdown-platform refactor beyond narrow shared-helper extraction
- no broader chat UI redesign

## Execution Task

Implement Chat Markdown Render v1 inside the approved safe zones.

Required outcome:

- assistant chat messages render a safe basic markdown reading subset
- user chat messages continue to display as plain text
- the supported v1 subset includes paragraphs, line breaks, basic headings, ordered and unordered lists, inline code, fenced code blocks, blockquotes, and links
- notes-side markdown rendering continues to work after any shared-helper extraction
- raw HTML does not render unsafely

Execution expectations:

- prefer a narrow shared helper/style extraction over duplicate chat-only markdown logic
- keep the extraction small and directly tied to current Chat plus Notes needs
- ensure chat presentation still feels like chat, not like a transplanted note card
- keep current send/receive flow unchanged from the user's perspective

## Validation Requirements

- required: build or logic validation appropriate to changed frontend code
- required: state clearly which validation layers were run
- browser validation: required, because this sprint changes chat rendering behavior
- UI review: required, because rendered markdown must still fit the chat surface and not feel over-designed

Minimum acceptance checks:

- plain assistant text still displays normally
- assistant lists, inline code, fenced code blocks, blockquotes, and links render correctly
- assistant raw HTML does not execute or render unsafely
- user-authored markdown syntax remains plain-text display in user messages
- notes markdown rendering still behaves correctly after helper/style extraction

## Completion Report Contract

The execution worker must write the result into `docs/pmo/inbox/execution_report.md` using these sections:

1. delivered
2. validation performed
3. browser validation performed or not performed
4. ui review performed or not performed
5. unverified areas
6. boundary compliance
7. unresolved
8. architecture decisions needed
9. recommended next sprint slice

## Escalate To Architecture Owner If

- implementation starts to require backend `/ai/chat` contract changes
- safe markdown rendering requires a broader cross-surface rendering-policy decision
- the shared extraction starts turning into a wider markdown-platform redesign
- chat presentation needs a larger chat-runtime UI redesign rather than a bounded rendering fix
- work starts to affect private core, dashboard AI, or note storage/model boundaries
