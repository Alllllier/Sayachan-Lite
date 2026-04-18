# Documentation Sync Policy

> Use this policy when deciding whether a sprint or PMO change requires documentation review or documentation updates.

## Purpose

This policy keeps documentation sync narrow enough to be sustainable and strong enough to protect the active PMO surface.

It does not try to synchronize every historical or knowledge document on every change.

## Current Strong Sync Surfaces

The current strong sync surfaces are:

- `docs/pmo/**` active runtime, protocol, policy, and history entry documents
- `docs/pmo/baselines/**`
- `CLAUDE.md` as the execution entrypoint

`docs/ai-ops/**` is currently not treated as a mandatory strong sync surface for normal PMO closeout.

## Trigger Types

### Truth Trigger

Run documentation review when a change alters:

- route or model truth
- runtime behavior truth
- focus, provenance, archive, or AI invocation truth
- public/private boundary truth

Primary review targets:

- `docs/pmo/baselines/**`

### PMO Runtime Trigger

Run documentation review when a change alters:

- PMO state shape
- PMO operating entrypoint
- PMO workflow or handoff behavior
- sprint activation, closeout, or decision-capture rules

Primary review targets:

- `docs/pmo/**`

### Execution Entry Trigger

Run documentation review when a change alters:

- execution entry instructions
- active handoff or report location
- execution closeout hygiene expectations
- worker-facing default behavior

Primary review targets:

- `CLAUDE.md`
- `docs/pmo/protocols/execution-handoff-protocol.md`
- `docs/pmo/PMO_OPERATING_MANUAL.md` when canonical ownership or reading order changes

## Allowed Outcomes

Documentation sync review can end in one of three states:

- `no sync needed`
- `reviewed, no update needed`
- `update required`

Do not assume every trigger requires a documentation edit.

## Skip Cases

Documentation review usually does not require an update when the change is only:

- implementation-local refactor with no truth change
- small bounded visual polish with no new shared pattern
- compatibility-safe bug fix that does not change system shape
- comment, logging, or internal cleanup only

If unsure, perform the review and record `reviewed, no update needed` rather than silently skipping.

## Current Weak Sync Surface

`docs/ai-ops/**` is currently a weak sync surface.

That means:

- it may still be useful background
- it should not block normal PMO closeout
- it should be revisited in a later dedicated refactor

Reference:

- `docs/pmo/history/legacy-transition-notes.md`
