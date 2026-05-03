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

## Current Gaps

This guide defines the intended validation layers, but the worker-facing baseline is not fully complete yet.

Known current gaps:

- Dashboard now has first-class repo-native browser/UI review coverage for the current saved-task surface.
- Screenshot artifact retention and closeout reporting language now have a v1 rule below, but should be revisited if screenshot churn becomes noisy.
- Reusable UI review harness helpers remain intentionally small; surface-local fixtures and mocks are still the default until more duplication proves worth extracting.
- Worker fallback rules for broken repo-native validation commands are not fully settled; see `Npx Validation Fallback Rules` in `docs/pmo/state/idea_backlog.md`.
- Temporary UI validation should still be reported explicitly as temporary unless it is promoted into a durable repo-native spec.

Active shaping home:

- `docs/pmo/state/discussions/discussion_batch_015.md`

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

## UI Review Artifacts

Treat UI review screenshots as review artifacts, not golden snapshots.

Their purpose is to make UI states inspectable during PMO closeout. They are not pixel baselines, visual regression assertions, or proof that the UI quality is acceptable by themselves.

Current retention rule:

- committed screenshots are allowed for stable review states when they are low-noise and useful for later review
- keep screenshots grouped by surface, for example `frontend/tests/ui-review/notes/screenshots/`
- name screenshots by surface state and viewport, for example `active-default-desktop.png` or `mobile-active.png`
- do not commit temporary debugging screenshots
- capture review screenshots at the final visual state; prefer Playwright screenshot options such as `animations: 'disabled'` over fixed `waitForTimeout(...)` delays when CSS transitions can otherwise produce transitional artifacts
- when a sprint intentionally changes UI output, update the relevant committed screenshots and say in closeout whether the change is expected visual movement or incidental screenshot churn
- if screenshot churn becomes noisy, reopen the artifact retention rule before adding more committed screenshot surfaces

Current surface pattern:

- Notes screenshots live under `frontend/tests/ui-review/notes/screenshots/`
- Projects screenshots live under `frontend/tests/ui-review/projects/screenshots/`
- Dashboard screenshots live under `frontend/tests/ui-review/dashboard/screenshots/`

## Notes And Projects UI Review V1

The current browser review pipeline targets the Notes and Projects surfaces.

When a sprint touches Notes presentation or reading/editing transitions, stable review states include:

- active notes default
- markdown rendering
- overflow menu
- edit state
- edit validation
- AI drafts active
- archived notes
- mobile active view

When a sprint touches Projects presentation or task/project transitions, stable review states include:

- active projects default
- task preview collapsed and expanded
- task capture single and batch modes
- overflow menu
- AI suggestions when relevant
- archived projects
- mobile active view

The purpose of these review sets is visibility, not automated visual pass/fail.

## Report Expectations

When a sprint includes validation, the completion report should state:

- tests run
- browser validation performed or not performed
- UI review performed or not performed
- artifact capture performed or not performed
- whether browser validation or UI review was actually needed for this sprint
- if browser validation was performed, which command ran and whether it passed
- if artifact capture was performed, which surfaces or states produced screenshots or other durable artifacts
- if UI review was performed, which surfaces or states were actually inspected and what the review concluded
- if skipped, why skipping was acceptable
- unverified areas
- known regression risk

Do not report `npm run test:ui-review` passing as UI review by itself.

Use these terms consistently:

- `Browser validation`: the repo-native Playwright UI review command ran and passed or failed.
- `Artifact capture`: screenshots or other review artifacts were generated or updated.
- `Actual UI review`: a human or AI reviewer inspected the rendered page or screenshots and judged the UI state.

If only the command ran, say browser validation passed. If screenshots were generated but not inspected, say artifact capture happened but actual UI review was not performed. If screenshots were inspected, list the reviewed states and summarize the visual conclusion.

## Maintenance Note

This guide should be updated when one of these changes:

- the default validation toolchain
- the command names used to run tests or UI review
- the rule for when browser validation is expected
- the rule for when UI review is expected
- the rule for UI review artifact retention or reporting language
- the stable page states used by the current Notes, Projects, or Dashboard UI review pipeline

Do not update this guide for every new individual test case.
