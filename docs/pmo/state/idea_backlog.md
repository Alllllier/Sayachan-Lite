# Idea Backlog

> Discussion-stage ideas, bugs, and future directions that should remain visible but are not ready to start.

## Working Rules

- keep entries compact and easy to re-triage
- use this file for retained ideas that are still shaping, blocked, or exploring
- move execution-ready items into `sprint_candidates.md`
- move durable planning conclusions into `decision_log.md`

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

### `Companion-Like Dashboard Day-Phase Rhythm Cue`

- Type: `feature`
- Source: `discussion`
- Problem / Opportunity: `The homepage may benefit from a lightweight time-orientation surface, but the product should preserve Sayachan's companion feel. The emerging direction is not a pressure-oriented countdown, but a text-led rhythm cue that gently explains the user's current phase of the day.`
- Why now: `Homepage temporal treatment affects product tone at a high-traffic surface, and the discussion has already stabilized enough product constraints that the idea should remain visible outside the discussion batch.`
- Current status: `exploring`
- Dependencies: `A clearer day-phase model for Sayachan, including how many phases a day should have, where rough boundaries sit, how each phase should feel, and whether any minimal ambient support should sit beneath the text-led cue.`
- Risks / unknowns: `The cue could still become too managerial, too poetic, too vague to orient, or too visually assertive for the dashboard. The exact balance between lived-time language and explicit time facts is still unresolved.`
- Suggested next action: `Continue the active discussion by defining the day-phase structure and emotional texture first, then reassess whether the cue is stable enough for a bounded dashboard design slice.`

### `Owner-Led Auth And Invite-Gated Tester Accounts`

- Type: `architecture`
- Source: `discussion`
- Problem / Opportunity: `The product still lacks authentication. It needs a first-phase account model that supports owner-controlled tester onboarding, account-private runtime data, and owner-only private-core boundaries without forcing a full multi-tenant redesign yet.`
- Why now: `Near-term friend testing needs real account isolation, and the auth direction should be settled before implementation planning begins.`
- Current status: `exploring`
- Dependencies: `A bounded first-phase design for user model, invite model, auth flow, account-scoped data access, and owner-only private-core capability boundaries.`
- Risks / unknowns: `Auth mechanism, session shape, migration path for existing single-user data, and enforcement strategy for owner-only private-core entrypoints.`
- Suggested next action: `Turn the current discussion conclusion into a bounded implementation design, then reassess promotion into sprint_candidates.md.`
