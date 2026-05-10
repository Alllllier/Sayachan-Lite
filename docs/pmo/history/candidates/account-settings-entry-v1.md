# Account Settings Entry V1

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `idea_backlog.md Account Settings And User Menu Polish; human discussion on 2026-05-10`
- Why it mattered: The current fixed top user bar is scaffolding-like now that auth and Chinese-first UI chrome are usable. The product needs a real account/settings home for identity-adjacent actions without keeping logout and owner links in a rough global header.
- Expected outcome: Remove the top user bar, add Settings to the bottom main navigation, and create a minimal account/settings page for current account email, local language selection, owner-only management entry, and logout.
- In scope:
  `frontend App shell navigation; new settings/account route and page; productLocale language switch wiring with local frontend persistence if needed; owner-only management link visibility; logout from settings`
- Out of scope:
  `visible owner/tester role badges; password changes; email or phone verification; session management; account-persisted settings schema; backend user-profile/settings API; owner admin redesign`
- Dependencies: Existing auth store, router guards, productLocale zh/en dictionaries and setLocale/getCurrentLocale boundary
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human selects this candidate for execution.
- Validation expectation:
  `frontend unit/type/lint checks as applicable, plus focused browser/UI review that confirms bottom navigation includes Settings, Settings page works for normal users, owner-only management entry appears only for owner, logout returns to login, and locale switching updates visible UI copy.`
- Escalation triggers:
  `Stop for human review before adding persistent backend settings, exposing tester/owner role labels as product chrome, moving owner admin into a broader settings IA, or changing auth/session semantics.`
- Follow-up parking:
  `If bottom-nav Settings feels too crowded after use, reopen entry placement as a separate UI-shell discussion; if language preference needs account sync, shape a later account-persisted settings model slice.`
- Closeout summary: `completed with focused validation`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
