# AI Core Migration Record

Migration date: `2026-04-15`

## Goal

Move deeper chat runtime logic out of the public repo while keeping a stable public bridge.

## Current Result

- public bridge: `backend/src/ai/bridge.js`
- private core location: `backend/private_core/sayachan-ai-core`

## What The Public Repo Still Owns

- chat route surface at `backend/src/routes/ai.js`
- request shaping and runtime-control payloads from the frontend
- boundary enforcement around what the public runtime is allowed to call

## What The Private Core Owns

- chat orchestration
- prompt kernel and prompt sources
- provider integration used by chat runtime
- personality composition and deeper context assembly

## Important Boundary Note

Older architecture docs described a richer `backend/src/ai/*` tree in the public repo.
That is no longer the active truth.

The public repo should now be understood as:

- bridge in public repo
- implementation in private core

Any work that expands the public bridge contract should be reviewed as architecture-sensitive.

## Canonical Reference

Treat `docs/pmo/baselines/private-core-boundary.md` as the active boundary source of truth.

This file is the migration record for how that split was introduced.
