# Testing And UI Review

This guide defines the current lightweight validation floor for the public shell.

It exists to prevent silent regressions without forcing every sprint through the same heavy validation path.

## Default Rule

Choose validation by regression risk.

- use the lightest validation layer that can catch the most likely failure
- do not require browser validation for every sprint
- do not require UI review for every sprint
- if a validation layer is skipped, state that explicitly in the execution report

## Current Validation Layers

### Logic And Smoke Validation

Use `Vitest` when the sprint mainly changes:

- domain rules
- service behavior
- route behavior
- storage contract
- task, project, focus, or archive semantics

Current commands:

- `npm run test`
- `npm run test:watch`

### Browser Validation

Use `Playwright` when the sprint mainly changes:

- UI surface behavior
- page-state transitions
- rendering behavior
- interaction flow
- interaction density that code review alone cannot judge safely

Current commands:

- `npm run test:ui-review`
- `npm run test:ui-review:headed`

### UI Review

Use UI review when the sprint mainly changes:

- visual hierarchy
- UI noise
- button density
- readability
- editing vs display-state presentation quality

Current v1 model:

- capture stable page states with Playwright
- review the resulting screenshots manually or with AI assistance
- do not treat screenshot capture alone as proof that the UI is good

## Notes UI Review V1

The current browser review pipeline targets the Notes surface.

It captures these states:

- default notes state
- AI tasks expanded state
- edit state
- archived state

The current purpose is visibility, not automated visual pass or fail.

## Report Contract

When a sprint includes validation, the completion report should state:

- tests run
- browser validation performed or not performed
- UI review performed or not performed
- unverified areas
- known regression risk

## Documentation Sync Rule

Update this guide when one of these changes:

- the default validation toolchain
- command names used to run tests or UI review
- the decision rule for when browser validation is required
- the decision rule for when UI review is required
- the stable page states used by the current UI review pipeline

Do not update this guide for every new individual test case.
