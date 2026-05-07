# AI Product Payload Field Audit

- Sprint: `AI Product Payload Field Audit`
- Date: `2026-05-07`
- Scope: AI note/project request payload fields only
- Output type: audit artifact, no runtime behavior change

## Search Method

- Read execution contract:
  - `Get-Content -Raw AGENT.md`
  - `Get-Content -Raw docs/pmo/state/execution_task.md`
- Read directly in-scope frontend/backend files:
  - `Get-Content -Raw frontend/src/features/notes/notes.api.js`
  - `Get-Content -Raw frontend/src/features/projects/projects.api.js`
  - `Get-Content -Raw backend/src/routes/schemas/ai.ts`
  - `Get-Content -Raw backend/src/routes/ai.ts`
  - `Get-Content -Raw backend/src/services/aiService.ts`
- Frontend/backend endpoint usage searches:
  - `rg -n "fetchNoteTaskDrafts|/ai/notes/tasks|generateNoteTaskDrafts|noteTaskFallback|resolveOwnedNotePayload" frontend backend docs -g "!*node_modules*"`
  - `rg -n "fetchProjectNextActions|/ai/projects/next-action|suggestProjectNextActions|projectNextActionFallback|resolveOwnedProjectPayload|getProjectFocusContext" frontend backend docs -g "!*node_modules*"`
  - `rg -n "fetchNoteTaskDrafts\\(|fetchProjectNextActions\\(" frontend/src -g "!*node_modules*"`
- Backend schema/service field search:
  - `rg -n "aiResourcePayloadSchema|AiResourcePayloadDto|currentFocusTaskId|title|content|name|summary|status" backend/src/routes backend/src/services backend/test backend/tests -g "!*node_modules*"`
  - Note: `backend/tests` does not exist in this workspace; the command still searched `backend/test`.
- Supplemental reads for current product object shape:
  - `Get-Content -Raw docs/pmo/state/product_response_field_usage_audit.md`
  - `Get-Content -Raw backend/src/models/Note.ts`
  - `Get-Content -Raw backend/src/models/Project.ts`
  - `Get-Content -Raw backend/src/services/responses/productResponses.ts`
  - `rg -n "notes\\.value|projects\\.value|fetchNotes\\(|fetchProjects\\(|sort|map|toNote|toProject" frontend/src/features/notes frontend/src/features/projects -g "!*node_modules*"`

## Endpoint: `POST /ai/notes/tasks`

### Current Frontend-Sent Fields

The frontend AI API boundary sends the whole `note` object it receives from the feature caller:

- `frontend/src/features/notes/useNotesFeature.js`: `handleAIGenerateTasks(note)` calls `fetchNoteTaskDrafts(note)`.
- `frontend/src/features/notes/notes.api.js`: `fetchNoteTaskDrafts(note)` sends `body: JSON.stringify(note)`.
- `frontend/src/features/notes/notes.api.test.js` characterizes a minimal AI note payload as `{ _id, title, content }`.

Because feature state is assigned directly from `fetchNotesRequest()` and resource cache without AI-specific projection, the runtime can send all fields currently present on the product note object. Based on the current product response audit and mapper behavior, likely whole-object fields are:

- `_id`
- `title`
- `content`
- `archived`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- likely `__v` when present in a Mongoose `toObject()` result

Only `_id`, `title`, and `content` are explicitly characterized in the frontend AI API test.

### Backend-Accepted Fields By Schema

`backend/src/routes/schemas/ai.ts` uses the shared `aiResourcePayloadSchema` for this endpoint and accepts:

- `_id?: string | null`
- `id?: string | null`
- `title?: string`
- `content?: string`
- `name?: string`
- `summary?: string`
- `status?: string`
- `currentFocusTaskId?: unknown`

The schema is shared with the project endpoint, so note-task requests currently accept project-shaped fields even though note service logic does not read them.

### Backend-Read Fields

`backend/src/services/aiService.ts` reads:

- `_id` or `id` through `getPayloadId(payload)`.
- `title` and `content` from the resolved `note` object.

No note-task service read was found for:

- `archived`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- `__v`
- `name`
- `summary`
- `status`
- `currentFocusTaskId`

### Owned-Entity Reload Fields

If `_id` or `id` is present, `resolveOwnedNotePayload(payload, userId)`:

- parses the id with `optionalObjectId(getPayloadId(payload), 'request.body._id')`;
- queries `Note.findOne({ _id: noteId, userId })`;
- normalizes the found document with `toObject()` if available;
- returns `null` when an id was supplied but no owned note was found, causing the route to return `404`.

In this path, `title` and `content` used later come from the database, not from the frontend payload. `backend/test/account-isolation.test.js` verifies that tampered request `title`/`content` are ignored after owned note reload.

If no `_id`/`id` is present, the service falls back to `payload || {}` and uses frontend-supplied `title`/`content` directly.

### Prompt-Used Fields

Provider prompt construction uses the resolved note:

- `title`: `note?.title || '(无标题)'`
- `content`: `(note?.content || '').slice(0, 300)`

When owned reload occurs, these are database fields. When no id is supplied, they are frontend-trusted payload fields.

### Fallback-Used Fields

`noteTaskFallback(note)` uses:

- `title`: `note?.title || '(无标题)'`

When owned reload occurs, this is a database field. When no id is supplied, it is frontend-trusted payload content.

### Proposed AI-Specific DTO Whitelist Candidate

Conservative candidate for a later implementation sprint:

- `_id`

Alternative compatibility candidate, if PMO decides the no-id fallback path must remain supported:

- `_id`
- `id`
- `title`
- `content`

Fields that appear unnecessary for note-task AI payloads:

- `archived`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- `__v`
- `name`
- `summary`
- `status`
- `currentFocusTaskId`

## Endpoint: `POST /ai/projects/next-action`

### Current Frontend-Sent Fields

The frontend AI API boundary sends the whole `project` object it receives from the feature caller:

- `frontend/src/features/projects/useProjectsFeature.js`: `handleAISuggest(project)` calls `fetchProjectNextActions(project)`.
- `frontend/src/features/projects/projects.api.js`: `fetchProjectNextActions(project)` sends `body: JSON.stringify(project)`.
- `frontend/src/features/projects/projects.api.test.js` characterizes a minimal AI project payload as `{ _id, name, summary, status }`.

Because feature state is assigned directly from `fetchProjectsRequest()` and resource cache without AI-specific projection, the runtime can send all fields currently present on the product project object. Based on the current product response audit and mapper behavior, likely whole-object fields are:

- `_id`
- `name`
- `summary`
- `status`
- `archived`
- `currentFocusTaskId`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- likely `__v` when present in a Mongoose `toObject()` result

Only `_id`, `name`, `summary`, and `status` are explicitly characterized in the frontend AI API test.

### Backend-Accepted Fields By Schema

`backend/src/routes/schemas/ai.ts` uses the shared `aiResourcePayloadSchema` for this endpoint and accepts:

- `_id?: string | null`
- `id?: string | null`
- `title?: string`
- `content?: string`
- `name?: string`
- `summary?: string`
- `status?: string`
- `currentFocusTaskId?: unknown`

The schema is shared with the note endpoint, so project next-action requests currently accept note-shaped fields even though project service logic does not read them.

### Backend-Read Fields

`backend/src/services/aiService.ts` reads:

- `_id` or `id` through `getPayloadId(payload)`.
- `name`, `summary`, `status`, and `currentFocusTaskId` from the resolved `project` object.
- `Task.title` from the owned focus task resolved by `currentFocusTaskId`.

No project next-action service read was found for:

- `archived`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- `__v`
- `title`
- `content`

### Owned-Entity Reload Fields

If `_id` or `id` is present, `resolveOwnedProjectPayload(payload, userId)`:

- parses the id with `optionalObjectId(getPayloadId(payload), 'request.body._id')`;
- queries `Project.findOne({ _id: projectId, userId })`;
- normalizes the found document with `toObject()` if available;
- returns `null` when an id was supplied but no owned project was found, causing the route to return `404`.

In this path, `name`, `summary`, `status`, and `currentFocusTaskId` used later come from the database, not from the frontend payload. `backend/test/account-isolation.test.js` verifies that tampered request `name` and `currentFocusTaskId` are ignored after owned project reload.

If no `_id`/`id` is present, the service falls back to `payload || {}` and uses frontend-supplied `name`, `summary`, `status`, and `currentFocusTaskId` directly.

### Prompt-Used Fields

Provider prompt construction uses the resolved project:

- `name`: `project?.name || '(无项目名)'`
- `summary`: `project?.summary || '(无描述)'`
- `status`: `project?.status || 'unknown'`
- `currentFocus`: derived from `getProjectFocusContext(project, userId)`

`getProjectFocusContext` uses `project.currentFocusTaskId` to query `Task.findOne({ _id: project.currentFocusTaskId, userId })`. If the owned task exists and has a trimmed title, that `Task.title` is inserted as current focus; otherwise the prompt uses `(无)`.

When owned project reload occurs, the project fields are database fields and the focus title is loaded from the database. When no id is supplied, project fields and `currentFocusTaskId` are frontend-trusted payload content; the focus task lookup is still scoped by current `userId`.

### Fallback-Used Fields

`projectNextActionFallback(project)` uses:

- `status`: `project?.status || 'unknown'`

When owned reload occurs, this is a database field. When no id is supplied, it is frontend-trusted payload content.

### Proposed AI-Specific DTO Whitelist Candidate

Conservative candidate for a later implementation sprint:

- `_id`

Alternative compatibility candidate, if PMO decides the no-id fallback path must remain supported:

- `_id`
- `id`
- `name`
- `summary`
- `status`
- `currentFocusTaskId`

Fields that appear unnecessary for project next-action AI payloads:

- `archived`
- `isPinned`
- `pinnedAt`
- `userId`
- `createdAt`
- `updatedAt`
- `__v`
- `title`
- `content`

## Cross-Endpoint Findings

- Both endpoints currently send whole frontend product objects, not AI-specific request DTOs.
- Both endpoints use one shared backend schema that accepts the union of note and project AI fields.
- Both services prefer owned-entity reload when `_id` or `id` is provided.
- After owned reload, prompt and fallback construction use database fields rather than trusting frontend text fields.
- Without an id, both services continue to support direct frontend-supplied content and return `found: true`.
- Current tests cover owned reload behavior for note fallback and project prompt focus resolution, and cover validation rejection for invalid AI body shapes.

## Fields Needing Human Or PMO Decision

- Approved direction: AI requests should narrow toward id-only and require backend reload for trusted note/project content.
- Approved direction: frontend AI actions should use the current note/project id already available in UI context, not first refetch the full resource object and post that object back to the backend.
- Approved direction: ordinary product response whitelist implementation should not account for AI compatibility fields; it should focus on ordinary product UI/business response needs.
- Still decide whether `_id` alone is enough for the frontend DTO, or whether `id` should remain accepted as a temporary alias.
- Still decide whether shared `aiResourcePayloadSchema` should split into note-task and project-next-action schemas.
- Still decide the exact missing-id behavior. Current behavior uses frontend-supplied text fields; the approved direction implies removing or explicitly rejecting this compatibility path.
- Still decide whether focus context should always be derived from persisted project/task state and whether frontend-supplied `currentFocusTaskId` should ever be honored during any transition period.

## Suggested Implementation Slice

Recommended later slice, pending PMO/human decisions:

1. Add endpoint-specific AI request DTO/schema definitions for note-task and project-next-action requests.
2. Choose final id field spelling (`_id` only, or `_id` plus temporary `id` alias).
3. Update frontend AI callers to use the current note/project id from their existing UI context and remove any pre-AI full-resource refetch.
4. Keep owned-entity reload semantics explicit in service tests.
5. Remove or reject no-id direct-content support and add tests covering the chosen missing-id behavior.

Do not combine this with ordinary product response whitelist implementation unless PMO intentionally groups those two decisions. The approved direction is that ordinary product response whitelists should be able to ignore AI payload needs.

## Validation Notes

- No frontend runtime code, backend runtime code, tests, route schemas, prompt text, fallback behavior, provider code, private core code, or product response mapper code was changed.
- No code validation was required by the active execution contract because only PMO/docs artifacts were written.
- Browser validation and UI review were not performed; they are not expected for this audit sprint.
