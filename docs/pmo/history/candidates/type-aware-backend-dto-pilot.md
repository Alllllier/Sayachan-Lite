# Type-Aware Backend DTO Pilot

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-002`, `docs/pmo/history/reports/parsed-body-rollout-projects-and-tasks.md`
- Why it mattered: Product mutation routes now have a clean runtime DTO boundary: Zod validates request bodies, validateBody stores parsed data in ctx.state.validatedBody, and Notes/Projects/Tasks services consume that DTO. This is a better TypeScript/JSDoc pilot target than spreading annotations across unrelated backend files.
- Expected outcome: Add a scoped backend type-aware JavaScript pilot that uses JSDoc plus TypeScript checkJs/noEmit to express product mutation DTO shapes around route schemas, validateBody, ctx.state.validatedBody, and the Notes/Projects/Tasks create/update service boundary without changing runtime behavior.
- In scope:
  `Add a backend-scoped typecheck config and npm script; add focused JSDoc typedefs around requestBodyValidation.js, routes/schemas/mutations.js, and the create/update payload handoff for Notes/Projects/Tasks only; keep imports and check scope narrow; update PMO/docs only if the new command or boundary becomes durable.`
- Out of scope:
  `No .ts file conversion; no full-backend checkJs; no frontend changes; no Zod behavior changes; no schema split/rename; no Auth/AI migration; no strip/trim/default/coerce decision; no public API response change; no service/model/archive/focus/ownership/lifecycle refactor.`
- Dependencies: Committed engineering modernization checkpoint 7555417; existing backend Zod product mutation boundary; existing root npm run check; existing frontend type-aware pilot pattern.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the new backend typecheck command, focused backend route contract tests, npm --prefix backend test, and npm run check. Confirm runtime behavior and public validation responses are unchanged.`
- Escalation triggers:
  `Return to PMO if checkJs pulls in broad backend surfaces, Mongoose model typing becomes noisy, Koa ctx typing requires broad ambient shims, runtime code would need behavior changes, or the worker wants to convert files to .ts.`
- Follow-up parking:
  `Closeout should decide whether this proves a durable backend DTO typing path, whether to expand toward service DTO typedefs, whether to introduce a shared contract package later, or whether to pause TypeScript work.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Backend DTO JSDoc/checkJs pilot succeeded as a narrow signal, but noResolve and route-level ts-ignore show that route/service/module resolution expands quickly; next TS work should favor a root/pure typed island before broad backend checkJs.`
