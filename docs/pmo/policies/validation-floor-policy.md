# Validation Floor Policy

> Use this policy to decide the minimum validation expectations for a sprint before PMO closeout.

## Purpose

This policy prevents PMO from treating "implementation finished" as equivalent to "safely validated."

It defines the minimum validation floor that a sprint should meet before it is treated as confidently closed.

For the current Sayachan-specific operational guide, see `testing-and-ui-review-guide.md`.

## Core Rule

Every sprint closeout must state:

- what validation was performed
- what project-specific review was or was not performed
- what remains unverified
- what regression or follow-up risk remains

PMO must not silently assume that validation happened.

## Minimum Validation Expectation

The exact validation method depends on the surface being changed, but a sprint should normally include at least one explicit validation layer appropriate to the risk and surface type.

Possible validation layers include:

- logic validation
- smoke validation
- manual runtime verification
- browser validation
- UI review
- API or data-shape verification

Not every sprint needs the same validation mix.

## Closeout Categories

When reading an execution result, PMO should distinguish:

- implemented and adequately validated
- implemented but only partially validated
- implemented but not yet validated
- blocked before meaningful validation

These categories should stay visible in PMO closeout instead of collapsing into a single generic success label.

## Non-Rules

This policy does **not** assume:

- browser validation is always required
- UI review is always required
- automated tests are always available
- every project surface uses the same validation standard

## Workflow Touchpoints

This policy should be checked:

- when shaping a sprint candidate
- when writing `execution_task.md`
- when reading `execution_report.md`
- during sprint closeout

## Reporting Rule

If validation has not happened yet, PMO should say so explicitly.

A sprint may still be implementation-complete before full validation is complete, but PMO should not hide that distinction.
