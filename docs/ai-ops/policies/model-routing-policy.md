# Model Routing Policy

Use this policy to decide whether the current model is overpowered, appropriate, or underpowered for a task.

## Model Tiers

- `gpt-5.4`: highest-confidence reasoning for architecture, audits, and risky repo surgery
- `gpt-5.4-mini`: default for light PMO, doc sync, repo filing, and bounded edits
- `gpt-5.2-codex` or cheaper codex variants: acceptable for local implementation slices and low-risk mechanical work

## Default Rule

Start from the cheapest model that can complete the task safely.
Escalate to a stronger model when the task needs judgment, not just execution.

## Task Modes

Use `gpt-5.4` when the task is primarily:

- architecture truth audit
- PMO closeout with real boundary judgment
- review of Claude execution output where regression risk matters
- encoding repair, migration cleanup, or repo surgery
- hook policy design, governance changes, or role-split changes

Use `gpt-5.4-mini` when the task is primarily:

- doc sync
- path migration
- file renaming
- state updates
- low-risk PMO filing
- commit message drafting

Use cheaper codex variants or sub-agents when the task is primarily:

- bounded implementation inside approved safe zones
- repetitive mechanical edits
- low-risk formatting or cleanup
- localized code changes that do not need architecture judgment

## Reminder Rule

If the current model is obviously mismatched:

- say so briefly
- suggest the target model tier
- offer a sub-agent alternative when the user has authorized delegation

Do not interrupt the user for borderline cases.
Do not repeat the same reminder multiple times in one task phase.

## Unclassified Tasks

If a task does not fit the existing categories:

- mark it mentally as `unclassified`
- make a best-effort routing judgment for the current turn
- recommend updating this policy after the task if the category seems likely to recur

## Update Trigger

Update this file when:

- a new task type appears twice
- a routing mistake causes meaningful cost waste or quality loss
- the role split between Codex, Claude, and Human changes
