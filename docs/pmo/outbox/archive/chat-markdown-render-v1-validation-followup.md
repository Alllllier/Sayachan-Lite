# Execution Task Outbox

- Task ID: `chat-markdown-render-v1-validation-followup`
- Sprint: `Chat Markdown Render v1`
- Status: `ready`
- Prepared by: `Codex`
- Execution owner: `Claude VS Code`
- Architecture owner: `Human`
- Last updated: `2026-04-17`
- Archive note: `Archived after validation evidence was collected and the sprint was accepted for closeout.`

## Objective

Complete the remaining required validation for `Chat Markdown Render v1` so PMO can decide sprint closeout.

This is a validation follow-up task only.
Do not reopen implementation discovery, do not rewrite the report structure from scratch, and do not expand scope beyond completing the missing browser validation and UI review evidence.

## Source Of Truth

Use only these inputs:

- current outbox context in this file
- `docs/pmo/inbox/execution_report.md`
- if needed for original implementation scope only: `docs/pmo/outbox/archive/chat-markdown-render-v1.md`

Additional confirmed context from PMO:

- the rewritten `execution_report.md` is now PMO-acceptable as a report
- the remaining blocker is not report quality; it is missing required validation evidence
- the active outbox is this validation follow-up task only

## Current PMO Status

Current PMO conclusion:

- implementation appears complete
- build/test/logic validation appears complete
- required browser validation is still pending
- required UI review is still pending
- sprint closeout is blocked pending validation

## Required Work

Perform the missing validation and then update `docs/pmo/inbox/execution_report.md` to reflect the results.

Required validation scope:

- browser validation of the implemented chat markdown behavior
- UI review of markdown rendering inside the chat surface
- regression check that Notes markdown rendering still behaves correctly after the shared helper/style extraction

## Minimum Acceptance Checks To Validate

Validate these items directly in the running app:

- plain assistant text still displays normally
- assistant lists, inline code, fenced code blocks, blockquotes, and links render correctly
- assistant raw HTML does not execute or render unsafely
- user-authored markdown syntax remains plain-text display in user messages
- notes markdown rendering still behaves correctly after helper/style extraction

UI review focus:

- rendered markdown should still feel like chat rather than a transplanted note card
- heading scale and spacing should feel balanced inside the bubble
- long code blocks and wide content should behave acceptably in the chat popup
- check the chat surface around approximately 360px width
- check mobile rendering below `420px` if feasible in the available environment

## Report Update Requirements

Update `docs/pmo/inbox/execution_report.md` in place after validation.

Keep the existing 1-9 section contract, but revise at least these sections based on actual findings:

- Section 3: browser validation performed or not performed
- Section 4: UI review performed or not performed
- Section 5: unverified areas
- Section 7: unresolved

If validation passes:

- remove browser validation from unresolved blockers
- remove UI review from unresolved blockers
- state any remaining residual risks precisely

If validation cannot be completed:

- say exactly what environment limitation prevented it
- keep the blocker language explicit
- do not soften the closeout status

## Do Not Do

- do not modify product code unless a validation-discovered defect requires a separate escalation
- do not fabricate browser validation evidence
- do not reopen architecture discussion
- do not broaden scope into a new sprint slice

## Acceptance Checks

This follow-up is acceptable only if:

- actual browser validation evidence is recorded in the report, or the blocking environment limitation is stated explicitly
- actual UI review findings are recorded in the report, or the blocking environment limitation is stated explicitly
- the report remains UTF-8 clean and readable
- PMO can determine from the report whether sprint closeout is now unblocked or still blocked

## Expected Output

Update only:

- `docs/pmo/inbox/execution_report.md`

No extra memo is needed.
