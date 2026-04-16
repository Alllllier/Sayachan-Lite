# Private Core Boundary

This document defines the stable boundary between the public Sayachan Lite repo and the private AI core.

## Purpose

Use this document when planning, reviewing, or executing work that touches chat runtime responsibilities or the public/private split.

## Current Shape

- public bridge: `backend/src/ai/bridge.js`
- private core location: `backend/private_core/sayachan-ai-core`
- public chat route: `backend/src/routes/ai.js`

## Public Repo Responsibilities

The public repo still owns:

- HTTP route surface for `/ai/chat` and other public AI endpoints
- request shaping from frontend services and stores
- runtime-control payloads sent from the public product runtime
- boundary enforcement around what the public runtime is allowed to call

## Private Core Responsibilities

The private core owns:

- chat orchestration
- prompt kernel and prompt sources
- provider integration used by chat runtime
- personality composition
- deeper context assembly policies

## Boundary Rule

Treat `backend/src/ai/bridge.js` as the only intended public bridge into the private core.

Any work that changes one of these should be reviewed as architecture-sensitive:

- bridge contract shape
- public vs private responsibility split
- what runtime context is assembled in public vs private code
- provider or prompt responsibilities moving back into the public repo

## What This Is Not

This boundary should be understood as an architecture rule, not as a Git submodule rule.

The private core currently happens to be delivered through a submodule path, but the important long-term fact is the responsibility split, not the submodule mechanism itself.

The public repo should document only the boundary-level facts needed for safe coordination.
Private-core implementation details should be maintained only in the private repo.

## Related Docs

- `system-baseline.md`
- `runtime-workflow.md`
- `../migration/ai-core-migration-record.md`
- `../ai-ops/architecture/public-private-development-model.md`
