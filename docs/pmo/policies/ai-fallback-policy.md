# AI Fallback Policy

> Use this policy when planning, executing, or closing work that introduces or changes AI-dependent behavior.

## Purpose

This policy keeps Sayachan's AI features from silently depending on a single happy-path model response.

It answers:

- when PMO should expect a fallback path
- what counts as an acceptable fallback expectation
- where fallback risk should stay visible during closeout

## Core Rule

Every user-facing AI feature should have an explicit fallback expectation.

This does not always mean the fallback must be identical in quality.
It means the product should still fail in a bounded and understandable way when the AI path is unavailable, degraded, or returns no useful result.

## Acceptable Fallback Shapes

Depending on the feature, fallback may be:

- a deterministic fallback response
- a bounded empty-state or "no suggestion" response
- a simplified non-AI behavior
- a clearly stated partial-degradation mode

## PMO Expectations

When a sprint touches AI behavior, PMO should check:

- whether fallback behavior still exists
- whether fallback behavior remains understandable to the user
- whether the change silently moved responsibility from backend-mediated handling to a more fragile path
- whether the execution report states fallback implications when relevant

## Non-Rule

This policy does not require every AI feature to degrade in the same way.

It requires the fallback expectation to be visible and intentional.
