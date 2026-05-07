# Product Response Field Usage Audit

- Sprint: `Product Response Field Usage Audit`
- Date: `2026-05-07`
- Scope: task, project, and note response fields only
- Output type: audit artifact, no runtime behavior change

## Search Method

- Read contract and constraints: `AGENT.md`, `docs/pmo/state/execution_task.md`.
- Current mapper and characterization sources:
  - `Get-Content -LiteralPath backend/src/services/responses/productResponses.ts`
  - `Get-Content -LiteralPath backend/test/product-dtos.contract.test.js`
  - `Get-Content -LiteralPath backend/src/models/Task.ts`
  - `Get-Content -LiteralPath backend/src/models/Project.ts`
  - `Get-Content -LiteralPath backend/src/models/Note.ts`
- Backend usage search:
  - `rg -n "toTaskDto|toProjectDto|toNoteDto|productResponses|spread-compatible|customField|extra|unknown|createdAt|updatedAt|userId|originModule|currentFocusTaskId" backend`
  - `rg -n "project\\?\\.|note\\?\\.|payload\\?\\.|currentFocusTaskId|title|content|name|summary|status" backend/src/services/aiService.ts backend/src/routes/schemas/ai.ts`
- Frontend response-field search:
  - `rg -n "\\b(task|project|note|draft)\\.(?:_id|id|title|content|name|summary|status|archived|completed|originModule|originId|currentFocusTaskId|isPinned|pinnedAt|createdAt|updatedAt|userId)|\\b(?:_id|id|title|content|name|summary|status|archived|completed|originModule|originId|currentFocusTaskId|isPinned|pinnedAt|createdAt|updatedAt|userId)\\s*:" frontend/src`
  - `rg -n "currentFocusTaskId|originModule|originId|userId|createdAt|updatedAt|isPinned|pinnedAt|archived|completed|status|summary|content|title|name" frontend/src`
  - `rg -n "note\\.(_id|title|content|archived|isPinned|updatedAt)|project\\.(_id|name|summary|status|archived|currentFocusTaskId|isPinned|updatedAt)|task\\.(_id|title|status|archived|completed|originModule|creationMode)|task\\?\\._id|task\\?\\.archived|task\\?\\.status|task\\?\\.completed|task\\?\\.originModule|task\\?\\.creationMode|p\\.archived|p\\.isPinned|p\\.currentFocusTaskId|p\\.name|t\\.archived|t\\.status|t\\._id|t\\.title" frontend/src --glob "!**/*.test.js" --glob "!**/*.css"`
  - `rg -n "JSON\\.stringify\\((note|project|task)|writeResourceCache|readResourceCache|fetchNoteTaskDrafts\\(note\\)|fetchProjectNextActions\\(project\\)|syncTaskIntoActiveSnapshot\\(updated\\)|applyDashboardTaskUpdate|\\{ \\.\\.task|\\{ \\.\\.project|\\{ \\.\\.note" frontend/src --glob "!**/*.test.js"`

## Current Mapper Behavior

`backend/src/services/responses/productResponses.ts` converts a Mongoose-like document with `toObject()` or a plain object into a DTO by spreading all normalized fields and then overwriting normalized lifecycle fields.

- Task: returns `...normalized`, `status`, `archived`, `completed`.
- Project: returns `...normalized`, `status`, `archived`.
- Note: returns `...normalized`, `archived`.

Because the spread remains broad, any schema field and likely Mongoose version fields such as `__v` can be exposed when present.

## Characterized Spread-Compatible Fields

Observed in `backend/test/product-dtos.contract.test.js`:

- Task spread compatibility: `_id`, `title`, `originId`, `originModule`, `userId`, `createdAt`, `updatedAt`; normalized/overwritten fields: `archived`, `completed`, `status`.
- Project spread compatibility: `_id`, `name`, `summary`, `currentFocusTaskId`, `userId`, `createdAt`, `updatedAt`; normalized/overwritten fields: `archived`, `status`.
- Note spread compatibility: `_id`, `title`, `content`, `originId`, `originModule`, `userId`, `createdAt`, `updatedAt`; normalized/overwritten field: `archived`.

Current schema fields additionally likely exposed by spread:

- Task model: `_id`, `title`, `creationMode`, `originModule`, `originId`, `status`, `archived`, `completed`, `userId`, `createdAt`, `updatedAt`, likely `__v`.
- Project model: `_id`, `name`, `summary`, `status`, `archived`, `currentFocusTaskId`, `isPinned`, `pinnedAt`, `userId`, `createdAt`, `updatedAt`, likely `__v`.
- Note model: `_id`, `title`, `content`, `archived`, `isPinned`, `pinnedAt`, `userId`, `createdAt`, `updatedAt`, likely `__v`.

## Frontend Direct Usage

### Task

Direct response-field reads:

- `_id`
  - Dashboard row keys, menu state, update/delete calls: `frontend/src/components/Dashboard.vue`, `frontend/src/features/dashboard/useDashboardFeature.js`.
  - Dashboard list update/remove helpers: `frontend/src/features/dashboard/dashboard.rules.js`.
  - Active task snapshot sync and project task de-duplication: `frontend/src/services/tasks/task.runtime.js`, `frontend/src/services/tasks/task.api.js`.
  - Project task preview and focus matching: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/projects.rules.js`.
  - Cockpit current next action matching: `frontend/src/services/cockpitContextService.js`.
- `title`
  - Dashboard display: `frontend/src/components/Dashboard.vue`.
  - Project task preview display and focus title: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/projects.rules.js`.
  - Cockpit current next action title: `frontend/src/services/cockpitContextService.js`.
- `status`
  - Dashboard completion toggle and muted row state: `frontend/src/features/dashboard/dashboard.rules.js`, `frontend/src/components/Dashboard.vue`.
  - Project task buckets, focus eligibility, chips: `frontend/src/features/projects/projects.rules.js`, `frontend/src/components/ProjectsPanel.vue`.
  - Cockpit active task count: `frontend/src/services/cockpitContextService.js`.
  - Client normalization fallback: `frontend/src/services/tasks/task.rules.js`.
- `archived`
  - Dashboard archive/restore payload and active snapshot sync: `frontend/src/features/dashboard/dashboard.rules.js`, `frontend/src/services/tasks/task.runtime.js`.
  - Project task buckets and focus eligibility: `frontend/src/features/projects/projects.rules.js`.
  - Cockpit active task count: `frontend/src/services/cockpitContextService.js`.
  - Client normalization fallback: `frontend/src/services/tasks/task.rules.js`.
- `completed`
  - Dashboard muted row state and completion toggle: `frontend/src/components/Dashboard.vue`, `frontend/src/features/dashboard/dashboard.rules.js`.
  - Client normalization fallback: `frontend/src/services/tasks/task.rules.js`.
- `originModule`
  - Dashboard provenance badge and tooltip: `frontend/src/features/dashboard/dashboard.rules.js`.
- `creationMode`
  - Dashboard provenance class and tooltip: `frontend/src/features/dashboard/dashboard.rules.js`.

Inferred/pass-through usage:

- Whole task objects are cached/restored through resource cache: `frontend/src/features/dashboard/useDashboardFeature.js`, `frontend/src/features/projects/useProjectsFeature.js`.
- Updated task responses are merged into existing task rows and active snapshots with object spreads: `frontend/src/features/dashboard/dashboard.rules.js`, `frontend/src/services/tasks/task.runtime.js`.
- `originId` is sent on task create requests for note/project provenance, but no direct frontend response read was found.

No direct frontend response read found:

- `userId`, `createdAt`, `updatedAt`, `pinnedAt`, `__v`.

### Project

Direct response-field reads:

- `_id`
  - Project keys, route mutation calls, cache variants, task-card fetching, AI suggestion buckets, focus update matching: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/features/projects/projects.api.js`.
- `name`
  - Project title display, edit snapshot/restore, validation/editing, archive confirmation, cockpit pinned project name: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/services/cockpitContextService.js`.
- `summary`
  - Project display, edit snapshot/restore, update payload, AI next-action payload: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/features/projects/projects.api.js`.
- `status`
  - Project status display/editing, update/focus payload, AI next-action payload: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/features/projects/projects.api.js`.
- `archived`
  - Project card archived state, archive-view task loading, cockpit active project count/current focus filtering: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/services/cockpitContextService.js`.
- `currentFocusTaskId`
  - Project focus display and task matching: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/projects.rules.js`.
  - Cockpit current next action derivation: `frontend/src/services/cockpitContextService.js`.
- `isPinned`
  - Project pin button state, client sort, cockpit pinned project selection: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`, `frontend/src/services/cockpitContextService.js`.
- `updatedAt`
  - Project card date display and client sort: `frontend/src/components/ProjectsPanel.vue`, `frontend/src/features/projects/useProjectsFeature.js`.

Inferred/pass-through usage:

- Whole project objects are cached/restored through resource cache: `frontend/src/features/projects/useProjectsFeature.js`.
- Whole project objects are sent to the AI next-action endpoint: `frontend/src/features/projects/projects.api.js`.
- Backend AI accepts/uses project payload fields `name`, `summary`, `status`, and `currentFocusTaskId`; it re-loads focus task by `currentFocusTaskId` under the current user: `backend/src/routes/schemas/ai.ts`, `backend/src/services/aiService.ts`.

No direct frontend response read found:

- `userId`, `createdAt`, `pinnedAt`, `__v`.

### Note

Direct response-field reads:

- `_id`
  - Note keys, editor binding, edit/delete/archive/pin/AI task bucket keys, save-draft origin: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/useNotesFeature.js`.
- `title`
  - Note title display/editing, archive confirmation, edit snapshot/restore, update payload, AI task payload: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/useNotesFeature.js`, `frontend/src/features/notes/notes.api.js`, `frontend/src/features/notes/notes.rules.js`.
- `content`
  - Markdown display/editing, edit snapshot/restore, update payload, AI task payload: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/useNotesFeature.js`, `frontend/src/features/notes/notes.api.js`, `frontend/src/features/notes/notes.rules.js`.
- `archived`
  - Card state and action eligibility: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/notes.rules.js`.
- `isPinned`
  - Pin button state and client sort: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/useNotesFeature.js`.
- `updatedAt`
  - Note card date display and client sort: `frontend/src/components/NotesPanel.vue`, `frontend/src/features/notes/useNotesFeature.js`.

Inferred/pass-through usage:

- Whole note objects are cached/restored through resource cache: `frontend/src/features/notes/useNotesFeature.js`.
- Whole note objects are sent to the AI note-task endpoint: `frontend/src/features/notes/notes.api.js`.
- Backend AI accepts/uses note payload fields `_id`/`id`, `title`, and `content`; for public note payloads it re-loads the owned note by id before prompt generation: `backend/src/routes/schemas/ai.ts`, `backend/src/services/aiService.ts`.

No direct frontend response read found:

- `userId`, `createdAt`, `pinnedAt`, `originId`, `originModule`, `__v`.

## Likely Internal Or Non-Public Fields Currently Exposed

- `userId` on task/project/note: ownership/isolation field, no direct frontend response read found.
- `__v` on Mongoose documents if present in `toObject()`: no product usage found.
- `pinnedAt` on project/note: useful for backend sort semantics, no direct frontend response read found.
- Task `originId`: relationship/provenance field used by backend write/query/archive semantics and sent during create, but no direct frontend response read found.
- Note `originId`/`originModule`: characterized as spread-compatible by tests but not present in the current note schema; no direct frontend response read found.
- `createdAt`: no direct frontend response read found for task/project/note in runtime sources searched.

## Proposed Public Whitelist Candidates

These are conservative candidates for a later implementation slice. Fields listed under "decision gated" should not be implemented without human/PMO approval.

### Task Candidate

Confirmed direct/public-operational fields:

- `_id`
- `title`
- `status`
- `archived`
- `completed`
- `creationMode`
- `originModule`

Decision gated before implementation:

- `originId`: no direct frontend response read, but current task relationship semantics and create paths use it; decide whether it remains public, internal-only, or use-case-specific.
- `userId`: ownership/internal field; decide whether any client-visible account/debug surface requires it.
- `createdAt`/`updatedAt`: no current direct frontend task usage, but timestamps may be considered public API affordances.

Likely exclude unless explicitly approved:

- `__v`

### Project Candidate

Confirmed direct/public-operational fields:

- `_id`
- `name`
- `summary`
- `status`
- `archived`
- `isPinned`
- `updatedAt`

Decision gated before implementation:

- `currentFocusTaskId`: direct frontend and AI/cockpit usage exists, but the handoff names it as a human product decision before whitelist implementation.
- `userId`: ownership/internal field; no direct frontend response read found.
- `createdAt`: no direct frontend response read found.
- `pinnedAt`: backend sort support only in searched runtime; no direct frontend response read found.

Likely exclude unless explicitly approved:

- `__v`

### Note Candidate

Confirmed direct/public-operational fields:

- `_id`
- `title`
- `content`
- `archived`
- `isPinned`
- `updatedAt`

Decision gated before implementation:

- `userId`: ownership/internal field; no direct frontend response read found.
- `createdAt`: no direct frontend response read found.
- `pinnedAt`: backend sort support only in searched runtime; no direct frontend response read found.
- `originId`/`originModule`: characterized as spread-compatible by tests but not current note schema/frontend response usage; decide whether compatibility should intentionally remain.

Likely exclude unless explicitly approved:

- `__v`

## Human Decision Gates

- Decide whether `userId` should ever be present in public product DTOs now that product data is user-owned.
- Decide whether task `originId` and `originModule` should remain public response fields, be split by use case, or become backend/internal-only. `originModule` has direct Dashboard provenance usage; `originId` did not show direct frontend response reads.
- Decide whether project `currentFocusTaskId` remains a public response field. It is directly used, but the handoff explicitly marks it for human product judgment before whitelist implementation.
- Decide whether `createdAt`/`updatedAt` are stable public product API fields. Project/note `updatedAt` has direct UI usage; task timestamps did not.
- Decide whether AI endpoints should continue receiving whole note/project objects from frontend, or move to narrower AI-specific request DTOs before/alongside public response whitelist tightening.
- Decide whether route/use-case-specific mappers are needed before a single model-wide whitelist, especially for project AI/cockpit context and task provenance.

## Approved Non-AI Product Response Decisions

Approved by the human on `2026-05-07` for the ordinary product API response whitelist path. AI endpoint payload fields remain a separate audit/DTO decision.

- `userId`: do not expose in public task/project/note responses.
- Task `originModule`: keep public because Dashboard provenance UI directly uses it.
- Task `originId`: keep public for now alongside `originModule`; revisit later if route/use-case-specific task mappers split provenance needs.
- Project `currentFocusTaskId`: keep public because Projects, cockpit context, and AI-adjacent product flow currently depend on it.
- `createdAt`: do not expose in ordinary product responses for now because no direct frontend usage was found.
- `updatedAt`: keep public for Project and Note because the frontend uses it for display/sort; do not expose Task `updatedAt` for now because no direct task usage was found.
- `__v`: exclude unless a future explicit internal/debug surface requires it.

Approved ordinary product response whitelist candidates after decisions:

- Task: `_id`, `title`, `status`, `archived`, `completed`, `creationMode`, `originModule`, `originId`.
- Project: `_id`, `name`, `summary`, `status`, `archived`, `isPinned`, `updatedAt`, `currentFocusTaskId`.
- Note: `_id`, `title`, `content`, `archived`, `isPinned`, `updatedAt`.

## Suggested Next Implementation Slice

Recommended next slice: implement the approved ordinary product response field whitelists in `backend/src/services/responses/productResponses.ts`, with characterization tests updated to assert the approved public fields and absence of `userId`, `__v`, unapproved timestamps, and unapproved compatibility fields.

Implementation should stay model-scoped for ordinary product responses unless PMO chooses a route/use-case-specific mapper split first. AI endpoint payloads should be audited separately before being narrowed away from whole note/project object passing.

## Validation Notes

- No code, tests, response mapper, routes, services, models, or frontend runtime files were changed.
- No code validation was required by the active execution contract because only PMO/docs artifacts were written.
- Browser validation and UI review were not performed; they are not expected for this audit sprint.
