# Engineering Conventions

This guide collects repository-local engineering conventions that are useful for execution work but do not belong to PMO runtime rules.

Use this document for:

- code style and naming expectations
- lightweight API change recording expectations
- commit message guidance
- frontend primitive and token reuse expectations
- domain and data conventions that are implementation-facing

Do not treat this file as a PMO policy document.

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

## Frontend Primitive Reuse

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

## Domain And Data Conventions

- new persisted task logic should use semantic provenance fields first
- do not treat legacy task fields as the preferred write path
- new model fields should have explicit defaults when practical
- schema changes should be checked against backward compatibility and existing route behavior
