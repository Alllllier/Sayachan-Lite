# Decision Capture Policy

> Use this policy to decide when a discussion result, sprint result, or planning outcome must be written into `state/decision_log.md`.

## Purpose

This policy prevents durable PMO conclusions from being trapped only inside:

- discussion records
- sprint notes
- current planning context
- human memory

## Core Rule

Write an entry into `state/decision_log.md` when the main outcome is a durable planning conclusion that future PMO work should not have to rediscover.

## Decision Types

Use `decision_log.md` for:

- `approved`
- `deferred`
- `rejected`
- `transition-rule`

## Required Capture Cases

Write a decision log entry when one of the following happens:

1. A path is explicitly approved for future implementation direction.
2. A path is explicitly deferred rather than started now.
3. A path is explicitly rejected and should not be re-litigated by default.
4. A workflow or transition rule is clarified and should govern future PMO behavior.
5. A discussion result produces a durable planning conclusion even if no sprint starts yet.
6. A sprint closeout changes future planning expectations in a stable way.

## Non-Cases

Do not use `decision_log.md` for:

- ordinary status updates
- temporary execution notes
- candidate drafts
- candidate re-validation that does not change future planning rules
- open questions that are still under discussion
- sprint details that belong only to `current_sprint.md` or `execution_report.md`

## Workflow Touchpoints

This policy should be checked at least:

- after promotion from active discussion
- during sprint closeout
- whenever a human clarifies a planning rule that future PMO work should remember

## Example Guidance

Good decision-log outcomes include:

- a theme should be split into multiple bounded slices instead of one bundled sprint
- an exploration should stay in backlog and not move into candidate state yet
- sprint selection remains human-gated
- a rejected path should not be reconsidered unless new evidence appears
