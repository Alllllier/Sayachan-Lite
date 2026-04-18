# Private Core Boundary

> Recast into PMO v2 from the current public/private split observed on `2026-04-18`.

## Purpose

Use this document when planning, reviewing, or executing work that touches:

- chat runtime responsibilities
- the public/private AI responsibility split
- the bridge contract into the private core

This is a boundary record for PMO coordination.
It is not a general workflow file and not a Git/submodule mechanism note.

## Current Shape

- public bridge: `backend/src/ai/bridge.js`
- private core location: `backend/private_core/sayachan-ai-core`
- public chat route: `backend/src/routes/ai.js`

## Public Repo Responsibilities

The public repo currently owns:

- HTTP route surface for `/ai/chat` and other public AI endpoints
- request shaping from frontend services and stores
- runtime-control payloads sent from the public product runtime
- boundary enforcement around what the public runtime is allowed to call

## Private Core Responsibilities

The private core currently owns:

- chat orchestration
- prompt kernel and prompt sources
- provider integration used by chat runtime
- personality composition
- deeper context assembly policies

## Boundary Rule

Treat `backend/src/ai/bridge.js` as the only intended public bridge into the private core.

Any work that changes one of these should be treated as architecture-sensitive:

- bridge contract shape
- public vs private responsibility split
- what runtime context is assembled in public vs private code
- provider or prompt responsibilities moving back into the public repo

## PMO Handling Rule For Private-Core-Owned Topics

Discussion does not need to start with a hard public/private split.

Allowed planning pattern:

- early discovery and theme clustering may happen in the public repo PMO flow
- once a topic is identified as `private-core-owned`, the detailed architecture write-up should move to the private repo
- the public repo should keep only the minimum coordination record needed for safe boundary management

When a topic is confirmed as `private-core-owned`:

- detailed design, internal rationale, and implementation-facing architecture notes belong in the private repo documentation set
- the public repo may keep a short summary, boundary implication, and reference to the private-core-owned topic
- public PMO discussion files may keep the trail, but should mark the topic as `private-core-owned`

## What This Is Not

This boundary should be understood as a responsibility split, not as a Git or submodule rule.

The private core currently happens to be delivered through a submodule path, but the important long-term fact is the responsibility split, not the delivery mechanism.

The public repo should document only the boundary-level facts needed for safe coordination.
Private-core implementation details should be maintained only in the private repo.
