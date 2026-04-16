# Public Private Development Model

This repo should be developed as one product with two parallel repositories:

- public shell repo
- private core repo

## Core Principle

The public repo documents the boundary.
The private repo documents the implementation.

## Public Shell

The public GitHub repo may document:

- public runtime architecture
- public HTTP and UI surfaces
- bridge contract and escalation rules
- public/private responsibility split at boundary level
- PMO, AI ops, and documentation-sync rules for the public shell

The public repo should not document private-core internals such as:

- prompt-kernel design details
- provider implementation details
- personality composition internals
- deeper context assembly logic
- private repo internal docs layout or maintenance workflow

## Private Core

The private repo should maintain its own:

- architecture baselines
- implementation docs
- documentation-sync policy
- AI ops and collaboration rules when needed

## Coordination Rule

The two repos should coordinate through:

- `backend/src/ai/bridge.js`
- public/private boundary docs
- explicit architecture decisions from the human

Do not mirror private-core implementation docs back into the public repo.

## Maintenance Rule

Update this document when:

- the public/private role split changes
- the bridge contract responsibility changes
- the private core stops being a separate repo
- the collaboration model between the two repos changes
