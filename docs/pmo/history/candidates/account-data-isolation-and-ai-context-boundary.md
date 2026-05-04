# Account Data Isolation And AI Context Boundary

- Archived date: `2026-05-04`
- Archive reason: `completed-and-displaced`
- Original status at exit: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_017.md; docs/pmo/state/decision_log.md`
- Why it mattered: After auth exists, friend testing is only safe if all product and AI-adjacent reads and writes are scoped to the current account. This slice should close leakage risk across Notes, Projects, Tasks, Dashboard, Chat, and private-core bridge context.
- Expected outcome: All user-authored runtime data is account-scoped by current session user. Tester accounts see normal product capabilities but only their own empty-start data. Owner data remains separate. AI/chat/task-generation/project-next-action/context paths receive only already-filtered current-user context. Disabled users are rejected on authenticated requests. Validation proves cross-account data leakage is blocked.
- In scope:
  `userId ownership fields or equivalent ownership model for notes, projects, tasks, chat history, cockpit/dashboard context, runtime settings or user-authored equivalents; backend query scoping for list/detail/create/update/archive/restore/delete flows; AI route/context scoping before bridge calls; frontend behavior alignment for empty tester accounts; focused backend/frontend tests for isolation and disabled-account rejection.`
- Out of scope:
  `new product features; sharing between accounts; organization/team model; role hierarchy beyond owner/tester; owner viewing tester content; private-core internal design; email/phone verification; full public-launch abuse prevention.`
- Dependencies: Auth Invite Session Owner Skeleton completed or otherwise providing current-user identity and disabled-account status; discussion_batch_017 capability boundary; private-core boundary baseline.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Account isolation now covers Note/Project/Task route and service paths, direct-id mutation guards, cascade/focus boundaries, AI note/project persisted-context ownership, auth-aware UI review mocks, and frontend account-switch transient cleanup. Live Mongo/manual multi-account validation and public-launch hardening remain outside this closeout.`
