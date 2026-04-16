# Development Constraints

This guide captures the project rules that still appear valid after repo audit.

## Core Constraints

- keep the repo JavaScript-first
- avoid broad architecture refactors without explicit approval
- preserve backward compatibility when touching persisted task data
- every AI feature should continue to have a fallback path
- keep logs prefixed by module or feature when adding new operational logging

## Code Style

### Frontend

Prefer this order inside Vue SFCs:

1. imports
2. local constants
3. reactive state
4. computed values
5. functions
6. lifecycle hooks

Naming conventions:

- components: PascalCase
- variables and functions: camelCase
- constants: UPPER_SNAKE_CASE
- boolean state: `is*`, `has*`, `show*`
- event handlers: `handle*`
- CSS classes: kebab-case

### Backend

Prefer this order in route modules:

1. imports
2. router creation
3. helper functions
4. route definitions in read/create/update/delete flow
5. module export

Log format:

- use `[Module] message` or `[Feature Action] message`

## API Change Template

When adding or changing an API surface, capture at least:

- method and path
- request body or query parameters
- success response shape
- error response shape
- schema impact if persisted data changes
- side effects such as cascade or focus-clearing behavior

Good minimum template:

```md
### METHOD /path

- Purpose: what this endpoint does
- Request: fields or query params
- Response: main success payload
- Errors: expected failure cases
- Domain effects: cascades, focus changes, archive rules, compatibility notes
```

## Commit Guidance

Use:

```text
<type>(<scope>): <subject>
```

Recommended `type` values:

- `feat`
- `fix`
- `docs`
- `refactor`
- `style`
- `chore`
- `test`

Commit guidance:

- prefer small, completion-oriented commits
- include scope when it improves scanability
- keep subject concrete and outcome-focused

Examples:

- `feat(note): add markdown rendering`
- `fix(task): clear project focus on archive`
- `docs(pmo): refresh architecture baseline`

## UI Constraints

Use shared tokens and baseline classes from `frontend/src/style.css` whenever they already cover the use case.

Prefer:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-archive`, `.btn-ai`
- `.input`, `.textarea`
- `.card` and card accent variants
- CSS variables such as `--action-primary`, `--surface-card`, `--text-muted`, `--space-*`, `--radius-*`

Avoid:

- duplicating base button or input styling in component-local CSS
- hardcoding colors that already exist as semantic variables
- treating layout-only component CSS as a place to redefine shared primitives

## Architecture-Sensitive Areas

Treat these as escalation-heavy zones:

- `backend/src/ai/bridge.js`
- `backend/private_core/sayachan-ai-core/**`
- focus/task workflow semantics
- dashboard-to-chat context contracts
- task archive cascade rules

## Domain And Data Conventions

- new persisted task logic should use semantic provenance fields first
- do not treat legacy task fields as the preferred write path
- new model fields should have explicit defaults when practical
- schema changes should be checked against backward compatibility and existing route behavior

## AI Feature Rules

- every AI feature should define a fallback behavior
- prefer backend mediation for new AI features unless there is a strong reason not to
- architecture-sensitive AI work must respect the public bridge and private core boundary
- avoid introducing ambiguous rendering or behavior policy changes without documenting them

## Feature Checklist

Before considering a feature complete, check:

- backend behavior is bounded and matches current architecture rules
- frontend behavior follows existing patterns instead of creating parallel systems
- validation depth matches the actual regression risk of the sprint
- fallbacks exist for AI-dependent behavior
- docs under `docs/**` were reviewed for sync impact
- user-visible copy and error states are acceptable
- no restricted boundary was crossed silently

## Change Hygiene

When changing:

- backend models: review `docs/architecture/backend-api.md`
- backend routes: review `docs/architecture/backend-api.md` and `docs/architecture/runtime-workflow.md`
- dashboard/chat stores and services: review `docs/architecture/system-baseline.md`
- style primitives: review `frontend/src/style.css` first
- testing or UI review workflow: review `docs/guides/testing-and-ui-review.md`
