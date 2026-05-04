# Discussion Batch `discussion_batch_017`

- Topic: `Owner-led auth and invite-gated tester accounts`
- Last updated: `2026-05-04`
- Status: `promoted`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `backlog reopen`
- Source channel: `human discussion`
- Why now: `The human explicitly reopened the backlog item for discussion because near-term friend testing needs account isolation and the auth direction should be settled before implementation planning.`
- Related sprint or closeout: `none`

## Why This Discussion Exists

- Sayachan currently has no authentication, invite flow, or account-scoped data boundary.
- Friend testing needs a first-phase account model that protects account-private runtime data without forcing a full multi-tenant redesign too early.
- The work touches architecture-sensitive responsibility boundaries, especially owner-only access to private-core or private-core-adjacent capabilities.
- The discussion should decide the smallest safe first-phase shape before any sprint candidate is promoted.

## Theme Summary

### `theme-001`

- Summary: `Define the first-phase auth model for owner-led tester onboarding: user identity, invite acceptance, session behavior, account-scoped data access, and owner-only private-core boundaries.`
- Why grouped: `These concerns are coupled: invite flow determines who can enter, auth/session shape determines how identity is carried, account scoping determines what data can be read or changed, and owner-only gates determine which powerful or private-core-adjacent capabilities remain inaccessible to testers.`
- Current focus: `yes`
- Status: `promoted`
- For follow-up mode, the concrete issue exposed was: `External testing cannot safely start while the product still behaves as a single-user runtime with no account boundary.`

## Possible Slices

### `slice-001`

- Name: `First-phase auth and invite design`
- Why separate: `Before implementation, PMO needs a bounded architecture decision for user records, invite records, session mechanism, initial login/register flow, and how owner-created tester accounts enter the system.`
- Current maturity: `candidate-likely`
- Likely target: `decision_log | sprint_candidates`
- Parking trigger: `The human decides external testing is not near-term or auth should wait for a larger deployment/security plan.`
- Reopen signal: `Friend testing, deployment, or account-private data work becomes active again.`

### `slice-002`

- Name: `Account-scoped data boundary`
- Why separate: `Data access rules may be the implementation-critical part of the auth work: notes, projects, tasks, chat history, cockpit context, and future module data need a clear first-phase ownership boundary.`
- Current maturity: `candidate-likely`
- Likely target: `sprint_candidates`
- Parking trigger: `Auth direction remains too unsettled to define storage or query-scope changes safely.`
- Reopen signal: `A first-phase auth/session model is approved or data leakage risk becomes an immediate blocker.`

### `slice-003`

- Name: `Owner-only private-core capability gates`
- Why separate: `Tester accounts may need normal product access while private-core or owner-only capabilities stay restricted. This boundary is architecture-sensitive and should be decided explicitly rather than inferred during implementation.`
- Current maturity: `candidate-likely`
- Likely target: `decision_log | sprint_candidates`
- Parking trigger: `The first-phase product does not expose any private-core-adjacent controls to testers.`
- Reopen signal: `Any tester-visible workflow would call private-core-owned capabilities, development-only controls, or owner-private settings.`

## Open Questions

- What user roles are needed in phase one: only `owner` and `tester`, or a more generic role model?
- Should tester accounts be created directly by the owner, created through invite links, or both?
- Should phase-one registration expose the future reusable registration surface, but require an invite code before account creation is allowed?
- What must an invite contain: email, role, expiration, single-use token, optional display name, or other metadata?
- Should email or phone verification be required in phase one, or should verification be deferred while invite-code gating provides the first access boundary?
- What auth mechanism fits the current product stage: password sessions, magic links, local-only owner-created credentials, or another minimal route?
- Should sessions be cookie-based, token-based, or intentionally left undecided until implementation design?
- How should existing single-user data migrate or be assigned when the first owner account is created?
- Which data must be account-scoped immediately: notes, projects, tasks, chat messages, dashboard/cockpit state, runtime settings, or all user-authored data?
- Should tester accounts start with empty data, copied seed data, or owner-shared examples?
- Which capabilities remain owner-only in phase one, especially private-core, provider, development, settings, export/import, or administrative surfaces?
- Is any data sharing between owner and tester accounts allowed in phase one, or should isolation be strict by default?
- What is the smallest validation suite that would prove account isolation and owner-only gates are working?
- Which capabilities should be available to testers as normal product use, which should be owner-only, and which should be treated as private-core-owned rather than public product permissions?
- Should the first-phase permission model use explicit capability names rather than scattering role checks directly through route and UI code?
- Which owner-only capabilities are truly needed for convenient friend-test management, given that the owner already has real code and local environment access for deeper operations?
- Which implementation risks should shape sprint slicing: initial owner data migration, universal `userId` query scoping, AI/context isolation, owner admin restraint, and disabled-account session invalidation?

## Current PMO Judgment

- This topic has stabilized enough to promote into a durable decision and two bounded implementation candidates.
- The near-term need is not a full multi-tenant architecture; it is owner-led friend testing with account-private runtime data and explicit owner-only capability gates.
- Stable human direction: phase one should use a small `owner` / `tester` role model, with owner-led invite or account creation, tester-private runtime data by default, and owner-only gates around private-core, provider/settings, development, and administrative capabilities.
- Stable shaping preference: the invite path should likely be a real registration surface gated by an invite code, rather than a throwaway tester-only account creation flow, so the same registration foundation can be reused for a later public launch.
- Current PMO recommendation: keep phase-one verification lightweight. Require a valid invite code to register, capture email as the account identifier, and defer full email or phone verification unless deployment/security needs make it necessary before friend testing.
- Stable phase-one auth direction: ship a reusable registration page with `email`, `password`, and `invite code`; require a valid invite before account creation; use cookie-backed sessions for normal login state; treat email as the account identifier; reserve verification fields such as `emailVerifiedAt`, `phone`, and `phoneVerifiedAt` without implementing email or SMS verification in the first phase.
- Stable invite rule: phase-one invite codes should not be email-bound. They should be single-use, expire after one month, and be revocable by the owner before use. The registering tester supplies their own email during registration.
- Deferred verification decision: do not require phone or email verification for invite-gated friend testing. Revisit only before broader public launch, deployment to a riskier environment, or if account abuse / identity confidence becomes a real issue.
- Stable tester data initialization direction: new tester accounts should start with empty product data by default. Do not copy or share owner notes, projects, tasks, chat history, cockpit context, or runtime state into tester accounts during phase one. If sample content is needed later, treat it as a separate seed/demo-template feature rather than owner-data sharing.
- Current discussion focus: define the abstract capability boundary before mapping it onto data models, routes, or UI controls.
- Emerging capability-boundary principle: classify phase-one behavior into `tester-allowed`, `owner-only`, and `private-core-owned` buckets first. Product permissions should cover normal app use and owner administration, while private-core-owned details should remain outside the public PMO design surface except for the bridge-level coordination rule.
- Stable owner-scope constraint: do not expand the in-product owner role into a broad admin console. Because the human owner already has real code, data, and local environment access, phase-one owner capabilities should include only the most core and convenient controls needed to manage invite-gated friend testing.
- Stable phase-one owner capabilities: keep the in-product owner surface limited to `manage_invites`, `view_tester_accounts`, `disable_tester_account`, and `view_basic_system_status`.
- Stable phase-one owner exclusions: do not include tester data viewing/editing, tester impersonation, provider/API-key management, prompt/private-core controls, full-site import/export, complex permission management, or hard user deletion in the first phase. Use account disable/restore instead of destructive deletion for friend-test management.
- Stable owner capability summary: the owner product surface should manage entry, manage whether testers can log in, and show minimal operational status; it should not expose tester content or private-core control.
- Stable tester capability direction: testers should receive the normal current product experience rather than a deliberately reduced demo mode. In phase one, `tester-allowed` means the current product capabilities scoped to the tester's own account data, excluding only owner management, private-core/admin controls, and any future capability explicitly classified as owner-only.
- Stable capability-boundary outcome: the abstract phase-one capability model is now effectively settled: testers get normal product use scoped to their own data; owner gets only lightweight friend-test management; private-core/admin/provider/prompt controls stay out of tester reach and are not expanded into a broad in-product owner console.
- Stable implementation-risk read: the hard parts are not the auth form itself, but assigning existing single-user data to the initial owner, applying `userId` scoping to every product and AI-adjacent read/write path, ensuring private-core receives only already-filtered context, keeping owner APIs from exposing tester content, and invalidating or rejecting sessions for disabled accounts.
- Stable sprint-slicing preference: split implementation into at least two bounded slices. First build the auth/invite/session/limited-owner-management skeleton. Then do the product-wide `userId` data-isolation and AI/context boundary pass with focused validation for leakage risks.
- Promotion-ready slicing: implement `Auth Invite Session Owner Skeleton` first, then `Account Data Isolation And AI Context Boundary` once reliable current-user identity exists.
- PMO should avoid designing private-core internals in this public planning surface. The public discussion should capture coordination boundaries and owner-only access rules, while any private-core-owned details stay in the private-core documentation set.
- Promotion path completed: auth/invite and owner-only capability direction moved into `decision_log.md`, and implementation work moved into two `sprint_candidates.md` entries.

## Promotion Outcome

- Opened from `idea_backlog.md` item `Owner-Led Auth And Invite-Gated Tester Accounts`.
- Durable decision recorded in `docs/pmo/state/decision_log.md` as `Owner-led invite-gated auth uses a lightweight phase-one boundary`.
- Promoted to `docs/pmo/state/sprint_candidates.md` as `Auth Invite Session Owner Skeleton` and `Account Data Isolation And AI Context Boundary`.
- No active sprint yet; sprint activation still requires explicit human selection.
