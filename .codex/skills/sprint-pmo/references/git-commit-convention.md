# Git Commit Convention

Preserve the repo's base format:

`<type>(<scope>): <subject>`

Use short imperative subjects and keep each commit to one logical unit.

## Preferred Types

- `feat`: add a user-facing or platform capability
- `fix`: correct a bug or broken behavior
- `refactor`: change structure without changing intent
- `style`: adjust UI or presentation details
- `docs`: update architecture, PMO, or developer documentation
- `milestone`: mark a major program checkpoint
- `remove`: delete code, files, or obsolete paths

## Suggested Scopes For This Program

- `core`: AI core logic, orchestration, prompting, models
- `runtime`: product runtime, app behavior, integration paths
- `labs`: experimental or future-labs work
- `arch`: architecture docs, ADRs, system constraints
- `pmo`: sprint planning, status, handoff, coordination docs
- `ui`, `api`, `backend`: preserve existing repo scopes where they fit better

## Subject Rules

- use imperative present tense
- start lowercase
- avoid trailing period
- keep it under about 50 characters when possible

## Optional Footer Block

Use footers when the change belongs to a larger architecture sprint:

```text
Sprint: S12
Track: core
Decision: human-review
Risk: R-014
```

Add only the footer lines that add coordination value.

## Examples

```text
feat(core): add agent routing guardrails

docs(pmo): close sprint 12 and propose sprint 13

refactor(runtime): split tool execution coordinator

milestone(arch): lock v1 runtime boundary
```
