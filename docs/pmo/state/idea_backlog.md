# PMO Idea Backlog

> Discussion-stage ideas, bugs, and future directions that are not yet selected as sprint candidates.

## Usage Rule

- capture multi-round discussion outcomes here before they become sprint candidates
- keep entries compact and easy to re-triage
- move execution-ready items into `sprint_candidates.md`
- move decided, deferred, or rejected items into `decision_log.md` when appropriate

## Entry Template

### `<idea name>`

- Type: `bug | feature | architecture | future-lab | cleanup`
- Source: `discussion | audit | execution report | roadmap`
- Problem / Opportunity:
- Why now:
- Current status: `open | exploring | blocked | parked`
- Dependencies:
- Risks / unknowns:
- Suggested next action:

## Active Entries

### `Owner-Led Auth And Invite-Gated Tester Accounts`

- Type: `architecture`
- Source: `discussion`
- Problem / Opportunity: `The product currently lacks authentication. It needs a first-phase account model that supports owner-controlled tester onboarding, account-private runtime data, and owner-only private-core experimental boundaries without forcing full multi-tenant redesign yet.`
- Why now: `Near-term friend testing needs real account isolation, and auth direction should be settled before implementation planning begins.`
- Current status: `exploring`
- Dependencies: `First-phase implementation design for User model, Invite model, auth API flow, account-scoped data access, and owner-only private-core capability boundaries.`
- Risks / unknowns: `Exact auth mechanism, API/session shape, migration strategy for existing single-user data, and how owner-only private-core gates should be enforced across current runtime entrypoints.`
- Suggested next action: `Convert the discussion conclusion into a bounded implementation design, then reassess promotion into sprint_candidates.md.`
