# Discussion Batch 001

> Clustered from the owner's recorded issue and opportunity list on 2026-04-17.

## Batch Metadata

- Batch ID: `batch-001`
- Status: `completed`
- Current focus theme: `None selected`
- Promotion status: `completed`

## Theme Status Rule

- `clustered`: grouped and tagged, not yet deeply discussed
- `in_focus`: currently being explored in depth
- `archived`: discussion result is stable for this batch
- `parked`: intentionally not pursued right now
- `promoted`: migrated into formal PMO state

## Clustered Themes

### `theme-001` - Runtime authoring and markdown surface polish

- Source items: `2, 3`
- Type: `feature | polish`
- Tags: `chat`, `markdown`, `rendering`, `editor`, `ui`
- Risk: `low-medium`
- Maturity: `near-term`
- Status: `archived`
- Summary: `Chat output currently leaks markdown syntax without rendering, and the note CodeMirror surface still uses a default visual treatment that needs a product-quality polish pass.`

#### Possible Slices

- `chat markdown render v1`: bounded assistant-side markdown display repair for chat
- `notes editor polish v1`: bounded UX polish pass to make the note editor feel like a calm writing card

#### Archived Discussion Summary

- `theme-001` stabilized as a two-slice theme rather than one bundled sprint.
- `chat markdown render v1` was identified as the cleaner first execution slice because it is a bounded rendering repair with narrow implementation impact.
- `notes editor polish v1` was identified as a separate UX-quality slice focused on reducing technical-editor cues and making the note editor feel like a calm writing card.
- Detailed slice shaping has been intentionally compressed here after promotion so the canonical long-lived records now live in formal PMO state.

#### Promotion Record

- Promotion target: `docs/pmo/state/sprint_candidates.md`
- Promoted slice: `Chat Markdown Render v1`
- Promotion date: `2026-04-17`
- Promotion reason: `This slice is now bounded enough to execute soon and has passed the current PMO shaping threshold for candidate status.`
- Retained summary: `Chat should render a safe basic markdown subset for assistant messages by reusing a narrowly extracted shared frontend markdown helper and base styles, without backend contract or chat-store changes.`

#### Promotion Record

- Promotion target: `docs/pmo/state/sprint_candidates.md`
- Promoted slice: `Notes Editor Polish v1`
- Promotion date: `2026-04-17`
- Promotion reason: `This slice now has a clear UX goal, bounded scope, explicit non-goals, and concrete browser/UI validation expectations, making it ready for candidate comparison.`
- Retained summary: `Notes editor polish should reduce technical-editor cues and turn the current CodeMirror surface into a calm writing card without changing existing note editing behavior.`

### `theme-002` - Creation and list-surface interaction consistency

- Source items: `1, 4`
- Type: `ux | feature`
- Tags: `notes`, `projects`, `tasks`, `layout`, `interaction-density`
- Risk: `medium`
- Maturity: `near-term`
- Status: `clustered`
- Summary: `Creation entry points and task visibility patterns are inconsistent across notes, projects, and project task lists, creating friction in navigation and content discovery.`

### `theme-003` - Sayachan self-knowledge in development mode

- Source items: `5`
- Type: `architecture | future-lab`
- Tags: `sayachan`, `wiki`, `knowledge-base`, `dev-only`, `risk-boundary`
- Risk: `high`
- Maturity: `exploratory`
- Status: `clustered`
- Summary: `Explore how Sayachan could participate in her own development workflow, potentially through a hot-pluggable development-only knowledge base containing core architecture context.`

### `theme-004` - Authentication and developer superuser model

- Source items: `6`
- Type: `feature | infrastructure`
- Tags: `auth`, `account`, `developer-access`, `security`
- Risk: `high`
- Maturity: `needs-discovery`
- Status: `promoted`
- Summary: `The product currently lacks user authentication and needs an authentication capability that also preserves a privileged developer account path.`

#### Promotion Record

- Promotion target: `docs/pmo/state/idea_backlog.md`
- Promoted entry: `Owner-Led Auth And Invite-Gated Tester Accounts`
- Promotion date: `2026-04-17`
- Promotion reason: `Discussion stabilized around first-phase auth direction, but implementation design is not yet ready for sprint-candidate shaping.`
- Retained summary: `First-phase auth should support owner-led invite-gated tester onboarding, account-private runtime scope, owner-only private-core experimental boundaries, a lightweight User model, and a dedicated one-time Invite mechanism.`
- Detailed discussion has been intentionally compressed here after promotion to avoid long-lived duplication between batch notes and formal PMO state.

## Batch Notes

- No theme is currently `in_focus`; `theme-001` has been archived with a stable discussion result.
- `theme-001` slice `Chat Markdown Render v1` has been promoted into `sprint_candidates.md`.
- `theme-001` slice `Notes Editor Polish v1` has also been promoted into `sprint_candidates.md`.
- Current discussion resumed on 2026-04-17 around `theme-001 / notes editor polish v1` to test slice-level progression toward candidate readiness.
- Adjacent near-term cleanup noted by owner: Dashboard frontend-direct AI calls and frontend API key exposure should be unified and refactored later, but this is not blocking the current auth-model discussion because the deployment environment does not currently provide a frontend AI key.
- `theme-004` has been promoted into `idea_backlog.md` as a discussion-stage formal PMO item.
- `theme-002` has been retained in `docs/pmo/state/idea_backlog.md` as `Creation And List-Surface Interaction Consistency` during legacy cleanup.
- `theme-003` has been retained in `docs/pmo/state/idea_backlog.md` as `Sayachan Dev-Mode Self-Knowledge Boundary` during legacy cleanup.
- This legacy batch is now closed and should remain only as historical reference rather than an active PMO discussion surface.
