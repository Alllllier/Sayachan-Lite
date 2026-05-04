# Auth Invite Session Owner Skeleton

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_017.md; docs/pmo/state/decision_log.md`
- Why it mattered: Near-term friend testing needs a real account entry boundary before external users touch Sayachan. The first slice should establish reusable registration, invite gating, login/session state, and a very small owner management surface without trying to solve product-wide data isolation in the same sprint.
- Expected outcome: Sayachan has a phase-one auth skeleton: reusable registration page requiring email, password, and invite code; login/logout with cookie-backed sessions; non-email-bound single-use invite codes that expire after one month and can be revoked; owner/tester role assignment; tester accounts starting with empty data; existing single-user data assigned to the initial owner; and owner-only controls for invites, tester account status, and basic system status.
- In scope:
  `user and invite records; password handling; cookie session middleware; register/login/logout/current-user routes; owner bootstrap or initialization path; owner invite management; tester account list; disable/restore tester login; minimal basic system status; frontend auth screens and route guard shell needed for this skeleton.`
- Out of scope:
  `product-wide userId data isolation beyond what is needed for auth skeleton safety; full AI/context isolation; email or phone verification; provider/API key management; prompt/private-core controls; tester data viewing/editing; impersonation; hard user deletion; full admin console; broad deployment/security hardening.`
- Dependencies: discussion_batch_017 stable phase-one auth direction; decision_log owner-led auth boundary; current backend route/service layout; current frontend route/app shell.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Phase-one auth skeleton landed with invite-gated registration, cookie sessions, lightweight owner management, and minimal Note/Project/Task user ownership; full account isolation and AI/context isolation remain in the next candidate, while bootstrap hardening and auth UI review coverage are parked in backlog.`
