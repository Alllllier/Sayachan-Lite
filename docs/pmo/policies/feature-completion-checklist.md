# Feature Completion Checklist

> Use this checklist as a PMO closeout companion when deciding whether a feature slice is actually complete enough to close.

## Purpose

This checklist prevents PMO from collapsing "the code was changed" into "the slice is complete."

## Checklist

Before treating a sprint slice as complete, review whether:

- backend behavior is bounded and consistent with current architecture rules
- frontend behavior extends existing patterns rather than creating a parallel system without need
- validation depth matches the actual regression risk of the slice
- AI-dependent behavior still has a visible fallback expectation
- docs under `docs/**` were reviewed for sync impact
- user-visible copy and error states are acceptable for the feature surface
- no restricted or architecture-sensitive boundary was crossed silently

## Usage Rule

This checklist is not a mandatory test matrix for every sprint.

Use it as a closeout sanity pass when:

- a slice touches multiple runtime surfaces
- AI behavior changes
- public/private boundaries may be affected
- UI or interaction behavior changes meaningfully
- completion seems true in implementation terms but still feels uncertain in product terms
