# Testing And UI Review Guide

> Use this guide as the operational companion to `validation-floor-policy.md` when PMO needs to choose a concrete validation layer for a sprint.

## Purpose

This guide keeps the validation floor usable in day-to-day PMO work.

It answers:

- when logic or smoke validation is enough
- when browser validation is worth the cost
- when UI review should be treated as a real part of closeout
- which current Sayachan UI states are worth reviewing when the sprint touches the Notes surface

## Decision Rule

Choose the lightest validation layer that can catch the most likely regression.

Do not require browser validation for every sprint.
Do not require UI review for every sprint.
If a validation layer is skipped, that should be stated explicitly in `execution_report.md`.

## Current Validation Layers

### Logic And Smoke Validation

Use logic or smoke validation when the sprint mainly changes:

- domain rules
- service behavior
- route behavior
- storage contract
- task, project, focus, archive, or provenance semantics

Current commands:

- `npm run test`
- `npm run test:watch`

### Browser Validation

Use browser validation when the sprint mainly changes:

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

Current v1 approach:

- capture stable page states with Playwright
- review the resulting screenshots manually or with AI assistance
- do not treat screenshot capture alone as proof that the UI is good

## Notes UI Review V1

The current browser review pipeline targets the Notes surface.

When a sprint touches Notes presentation or reading/editing transitions, the current stable review states are:

- default notes state
- AI tasks expanded state
- edit state
- archived state

The purpose of this review set is visibility, not automated visual pass/fail.

## Report Expectations

When a sprint includes validation, the completion report should state:

- tests run
- browser validation performed or not performed
- UI review performed or not performed
- unverified areas
- known regression risk

## Maintenance Note

This guide should be updated when one of these changes:

- the default validation toolchain
- the command names used to run tests or UI review
- the rule for when browser validation is expected
- the rule for when UI review is expected
- the stable page states used by the current Notes UI review pipeline

Do not update this guide for every new individual test case.
