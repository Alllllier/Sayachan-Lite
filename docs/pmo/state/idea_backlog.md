# Idea Backlog

> Discussion-stage ideas, bugs, and future directions that should remain visible but are not ready to start.

## Working Rules

- keep entries compact and easy to re-triage
- use this file for retained ideas that are still shaping, blocked, or exploring
- use this file for parked future work that should remain visible without pretending it is near-term
- remove an item from `idea_backlog.md` once the work itself has been completed and no further backlog visibility is needed
- when a completed backlog item produced a durable planning rule or deferral, capture that in `decision_log.md` instead of keeping the finished work item in backlog
- rely on archived execution reports in `history/reports/` as the historical record of completed backlog-origin work rather than turning `idea_backlog.md` into a completed-work ledger
- move execution-ready items into `sprint_candidates.md`
- move durable planning conclusions into `decision_log.md`

## Entry Template

### `<idea name>`

- Type: `bug | feature | architecture | future-lab | cleanup`
- Source: `discussion | audit | execution report | roadmap`
- Source reference:
- Problem / Opportunity:
- Why now:
- Current status: `open | exploring | blocked | parked`
- Dependencies:
- Risks / unknowns:
- Suggested next action:
- Reopen trigger:

## Active Entries

### `Backend Test Harness And Route Suite Cleanup`

- Type: `cleanup`
- Source: `audit`
- Source reference: `Backend server entrypoint cleanup on 2026-05-08`
- Problem / Opportunity: `Backend tests now cover useful route contracts, behavior locks, account isolation, DTOs, database startup, and app wiring, but helper code such as createCtx, createDoc, withPatchedMethods, and requestKoaApp is repeated across files. The largest route contract file also mixes multiple concerns that could be easier to maintain if split by app wiring, route contracts, validation, behavior side effects, and account isolation.`
- Why now: `The new createApp server boundary makes app-level HTTP tests easier without importing the process entrypoint, so future backend test cleanup can reduce duplication without changing runtime behavior.`
- Current status: `parked`
- Dependencies: `A small maintenance window that can extract shared backend test helpers and split the largest route suite without weakening behavior coverage.`
- Risks / unknowns: `Over-extracting too early could hide test intent behind generic helpers. The useful first pass should keep helpers small and preserve the current dist-runtime test path.`
- Suggested next action: `Later, shape a backend test harness cleanup slice: extract tiny shared helpers, move app-level HTTP checks to server.app tests, and split routes.contract-baseline only along existing behavioral boundaries.`
- Reopen trigger: `Backend tests become noisy to extend, another route/runtime cleanup touches duplicated helpers, or a human explicitly wants backend test maintainability work.`

### `Companion-Like Dashboard Day-Phase Rhythm Cue`

- Type: `feature`
- Source: `discussion`
- Problem / Opportunity: `The homepage may benefit from a lightweight time-orientation surface, but the product should preserve Sayachan's companion feel. The emerging direction is not a pressure-oriented countdown, but a text-led rhythm cue that gently explains the user's current phase of the day.`
- Why now: `Homepage temporal treatment affects product tone at a high-traffic surface, and the discussion has already stabilized enough product constraints that the idea should remain visible outside the discussion batch.`
- Current status: `exploring`
- Dependencies: `A clearer day-phase model for Sayachan, including how many phases a day should have, where rough boundaries sit, how each phase should feel, whether any minimal ambient support should sit beneath the text-led cue, and what broader product settings / preference entry should control the cue.`
- Risks / unknowns: `The cue could still become too managerial, too poetic, too vague to orient, or too visually assertive for the dashboard. The exact balance between lived-time language and explicit time facts is still unresolved, and the feature may feel companion-like for some users but pressure-inducing for others if it ships without user control.`
- Suggested next action: `Continue the active discussion by defining the day-phase structure, emotional texture, and user-control model first, then reassess whether the cue is stable enough for a bounded dashboard design slice.`

### `Sayachan Dev-Mode Self-Knowledge Boundary`

- Type: `future-lab`
- Source: `discussion`
- Source reference: `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md theme-003`
- Problem / Opportunity: `Sayachan may eventually participate more directly in her own development workflow, but that would likely require a development-only self-knowledge surface containing selected architecture and product context. The opportunity is to let Sayachan reason with a bounded internal map of her own system without collapsing production behavior and development scaffolding into the same runtime path.`
- Why now: `This idea has already been important enough to preserve once, and keeping it in formal PMO state prevents it from remaining trapped in a legacy clustered batch. It also marks a real future-lab direction for AI-assisted development even though the shape is still far from execution-ready.`
- Current status: `parked`
- Dependencies: `A clearer decision on whether dev-mode self-knowledge should exist at all, what minimal architecture context would be included, how the knowledge source would be mounted or refreshed, and what hard separation would exist between development-only context and any production-facing runtime path.`
- Risks / unknowns: `This could blur the boundary between tool support and runtime identity, leak unstable internal architecture into the wrong execution surfaces, or create unsafe assumptions about what Sayachan 'knows' about herself. The hot-pluggable knowledge shape, trust model, update discipline, and developer-only enforcement boundary are all still unresolved.`
- Suggested next action: `Reopen this as a bounded architecture discussion focused first on whether a dev-only self-knowledge layer should exist, then define the smallest safe boundary before discussing implementation shape.`
- Reopen trigger: `A human explicitly wants to explore Sayachan's development-mode self-knowledge or dev-only architecture memory boundary.`

### `Creation And List-Surface Interaction Consistency`

- Type: `feature`
- Source: `discussion`
- Source reference: `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md theme-002`
- Problem / Opportunity: `Creation entry points and list-surface visibility patterns are still inconsistent across Notes, Projects, and project task lists, which adds navigation friction and weakens interaction predictability on high-frequency surfaces. The current Notes `.form-section` and Projects `.project-form` shells should be treated as local legacy creation-entry wrappers that belong to this future consistency pass, not as independent shell/module cleanup. Notes editing also has a small explicit-format affordance opportunity: a future Format note action could normalize ordered-list numbering by user command without automatic editor rewriting. The product would benefit from a more coherent rule for where creation starts, which edit actions belong near creation/edit controls, how list density is handled, and how content remains discoverable across adjacent work surfaces.`
- Why now: `This theme was important enough to be preserved in the legacy batch and still appears likely to be resolved in the near term, even though it is not the highest-priority active task right now. Recording it in formal PMO state keeps it visible until there is room to close it properly.`
- Current status: `parked`
- Dependencies: `A bounded follow-up discussion that decides which inconsistencies matter most first, what cross-surface interaction rule should unify Notes, Projects, task lists, local creation-entry wrappers such as `.form-section` / `.project-form`, and explicit edit actions such as Format note, and whether the work should be shaped as one consistency pass or multiple smaller UI slices.`
- Risks / unknowns: `If framed too broadly, this could sprawl into a full information architecture rethink instead of a practical consistency pass. The right boundary between creation-entry consistency, task visibility, list density, and surface-specific behavior is still unresolved.`
- Suggested next action: `Reopen this as a near-term product discussion, identify the highest-friction inconsistency first, and then shape the work into one or more bounded UI slices for later execution.`
- Reopen trigger: `A human explicitly wants to revisit creation-flow or list-surface consistency across Notes, Projects, and task lists, or adjacent UI work exposes the same inconsistency again.`

### `Broader Sayachan Style Refresh`

- Type: `feature`
- Source: `discussion`
- Source reference: `state/discussions/discussion_batch_002.md`
- Problem / Opportunity: `Rendered note identity work and broader Sayachan presentation style still need a coherent product-level pass, but that work should not be forced into the current narrow Notes editor comfort follow-up.`
- Why now: `The active Notes follow-up discussion already produced a stable deferral decision, so the future style-refresh direction should be kept visible in formal PMO state instead of relying on memory.`
- Current status: `parked`
- Dependencies: `A later product-wide styling window that can intentionally revisit rendered note identity, broader reading surfaces, and Sayachan's visual language together.`
- Risks / unknowns: `The future refresh could sprawl, mix unrelated surfaces, or reopen editor-surface scope prematurely if it is not framed as a broader presentation pass.`
- Suggested next action: `Reopen this item when Sayachan is ready for a bounded style-refresh discussion that covers rendered note identity and other higher-level presentation surfaces together.`
- Reopen trigger: `A human explicitly decides to start or discuss a broader Sayachan style refresh rather than a narrow Notes comfort fix.`

### `Frontend And Backend Dependency Hygiene Refresh`

- Type: `cleanup`
- Source: `audit`
- Source reference: `Notes editor comfort-fix and font-family micro-fix execution follow-up`
- Problem / Opportunity: `Both frontend and backend toolchains may be drifting behind current dependency and invocation expectations, which can make repo-native validation fragile even when the product code itself is fine. The Playwright invocation confusion exposed this risk on the frontend side, and similar issues may exist on the backend side as well.`
- Why now: `Recent execution showed that tooling version age is manageable only when repo-native invocation rules remain clear. Keeping this work visible now prevents the dependency/tooling refresh from being forgotten until it becomes a larger maintenance problem.`
- Current status: `parked`
- Dependencies: `A bounded future maintenance window to review pinned versions, repo-native test commands, and whether frontend/backend execution scripts still reflect the intended local toolchain.`
- Risks / unknowns: `Refreshing dependencies too casually could destabilize a currently working stack, but leaving them unattended for too long increases drift, validation confusion, and environment mismatch risk. The right scope boundary between 'clarify invocation' and 'actually upgrade versions' is still open.`
- Suggested next action: `Later, shape this into a bounded maintenance pass that first audits frontend and backend dependency age, repo-native script coverage, and the safest upgrade candidates before any broad version bumping starts.`
- Reopen trigger: `A human explicitly wants a tooling/dependency maintenance sprint, or repeated validation/tooling confusion starts appearing across frontend or backend execution work.`

### `Reusable UI Review Harness Helpers`

- Type: `cleanup`
- Source: `execution report`
- Source reference: `Restore Notes UI Review Path sprint follow-up; docs/pmo/state/discussions/discussion_batch_015.md; PMO recheck after Notes/Projects/Dashboard/Chat UI review baselines completed`
- Problem / Opportunity: `Notes, Projects, Dashboard, and Chat now share a consistent folder shape for UI review files: fixtures, api-mocks, helpers, review spec, and screenshots. The actual reusable code remains thin, mostly screenshot directory/capture helpers and small JSON response helpers. Surface navigation, locators, mock state, route semantics, and review interactions remain intentionally surface-specific.`
- Why now: `After completing four UI review surfaces, PMO can make a clearer call: forcing a harness now would mostly add indirection without reducing much risk. The useful standard is currently a folder/file convention and reporting policy, not a shared framework.`
- Current status: `parked`
- Dependencies: `At least one future UI review expansion that repeats the same screenshot/capture, mock response, or route-composition code enough to make the abstraction pay for itself.`
- Risks / unknowns: `Extracting now would likely overfit to shallow helper names while hiding surface-specific behavior in a generic layer. Waiting too long could still let tiny helper duplication drift, but the current duplication is readable and low-risk.`
- Suggested next action: `Do not promote this now. Keep the existing surface-local helpers. If another UI review surface or second-pass expansion creates repeated capture or mock plumbing, extract only a tiny shared utility such as createScreenshotCapture(), json(), and maybe a route-fail helper; keep fixtures, locators, navigation, and interaction helpers surface-local.`
- Reopen trigger: `A future UI review pass repeats the same nontrivial helper code across at least three surfaces, screenshot/capture behavior diverges in a way that causes review artifact inconsistency, or route mock boilerplate starts creating real maintenance mistakes.`

### `Frontend Bundle Weight Review`

- Type: `cleanup`
- Source: `execution report`
- Source reference: `docs/_legacy_pmo/inbox/execution_report.md`
- Problem / Opportunity: `The frontend has carried existing chunk-size warnings since earlier Notes / CodeMirror work, but that bundle-weight concern never got promoted into a formal PMO item. With CodeMirror now established in Notes, the product may need a later bundle review to confirm whether the current dependency shape, loading path, or editor-related imports are still the right tradeoff.`
- Why now: `Legacy execution reporting already noted chunk-size warnings as an existing condition, and later Notes work kept building on the same editor stack without turning bundle weight into a tracked cleanup topic. Recording it now prevents the concern from living only as a half-remembered implementation detail.`
- Current status: `parked`
- Dependencies: `A bounded future frontend performance / bundle-hygiene window that can inspect build output, chunk composition, and whether CodeMirror-related costs should stay as-is, be lazily loaded, or be otherwise reshaped.`
- Risks / unknowns: `The current warning may still be acceptable for the product stage, and a premature optimization pass could add complexity without real user benefit. But if bundle weight keeps growing invisibly, future frontend work may inherit a performance cost that nobody formally re-evaluated.`
- Suggested next action: `Later, run a bounded frontend bundle review that checks current build output and identifies whether Notes/CodeMirror-related weight is still an acceptable tradeoff or should become a focused optimization slice.`
- Reopen trigger: `A human explicitly wants a frontend performance/bundle review, or future build output keeps surfacing chunk-size warnings that start affecting delivery confidence.`

### `Auth Production Bootstrap Hardening`

- Type: `cleanup`
- Source: `execution report`
- Source reference: `docs/pmo/state/execution_report.md for Auth Invite Session Owner Skeleton`
- Problem / Opportunity: `The first-owner bootstrap endpoint is intentionally public until an owner exists. This is acceptable for local/friend-test phase-one auth, but a later deployment or public-launch path should add stronger operator controls around first-owner initialization.`
- Why now: `The auth skeleton sprint introduced the bootstrap endpoint as the practical way to create the initial owner. PMO should keep the production hardening need visible without blocking the friend-test skeleton closeout. Legacy product-data assignment has since been retired.`
- Current status: `parked`
- Dependencies: `A real deployment or public-launch hardening window; decision on how the owner initializes production data and whether bootstrap should be guarded by environment config, one-time secret, CLI setup, or another operator-only path.`
- Risks / unknowns: `Leaving bootstrap as-is in a broader deployment could be unsafe if no owner exists and the endpoint is reachable. Hardening too early could complicate local setup and friend testing before deployment constraints are real.`
- Suggested next action: `Before broader deployment or public launch, shape a narrow bootstrap hardening pass that protects first-owner creation without turning auth into a broad admin system.`
- Reopen trigger: `A human prepares external deployment beyond trusted friend testing, public hosting, or production-like setup.`

### `Account Settings And User Menu Polish`

- Type: `feature`
- Source: `discussion`
- Source reference: `Human note on 2026-05-04 after owner/tester auth became usable in deployed app`
- Problem / Opportunity: `The current top user bar is intentionally minimal and now feels a little rough after the auth flow became usable. The product likely wants a lightweight account/settings surface where logout, account identity, role/status, and later account controls can live without making the main app header carry too much UI weight.`
- Why now: `Auth is now functional enough that repeated use exposes the navigation and account-management polish gap, but the main login/session chain is already working and should not be reopened just to beautify the header.`
- Current status: `parked`
- Dependencies: `A later small product/UI slice that decides the minimal settings scope, whether owner management links belong inside settings or remain as a separate owner route, and how much of the top user bar should collapse into an account menu.`
- Risks / unknowns: `If scoped too broadly, this could sprawl into password changes, email verification, session management, and admin settings before those capabilities are needed. If ignored too long, logout/account identity will keep feeling like scaffolding instead of product UI.`
- Suggested next action: `Later, shape a narrow Account Settings / user-menu polish sprint: create a settings/account page for identity and logout, move the top bar toward a cleaner account menu, and leave password/email/session-management expansion as explicit future scope.`
- Reopen trigger: `A human wants to polish auth/account UI, user testing shows logout/account identity confusion, or future auth capabilities need a natural settings home.`

### `Repo-Native Claude Launch From PMO`

- Type: `cleanup`
- Source: `discussion`
- Source reference: `Human discussion on 2026-04-19 about using PowerShell to launch Claude from the current PMO handoff`
- Problem / Opportunity: `Codex PMO already writes repo-native execution contracts, but starting Claude execution still depends on a manual human bridge. A future repo-native launcher path could let PMO start Claude from PowerShell against the current `execution_task.md`, while still keeping `execution_report.md` as the formal return surface.`
- Why now: `The current Codex -> PMO -> Claude loop is working, but repeated manual launching is still a visible source of friction. The environment already exposes a callable Claude CLI, so the idea is practical enough to keep visible even if we are not implementing it now.`
- Current status: `parked`
- Dependencies: `A later bounded workflow pass that confirms the safest Claude CLI invocation pattern, how the launcher should target the active repo-native handoff, and how to preserve report-writing discipline without replacing PMO review.`
- Risks / unknowns: `If automated too early, this could create a brittle launcher flow or blur the line between PMO activation, execution, and report review. It also depends on the Claude CLI being stable enough for predictable PowerShell-driven execution.`
- Suggested next action: `Later, evaluate a minimal launcher shape where PMO starts Claude from PowerShell using the active `execution_task.md`, keeps `execution_report.md` as the only formal return surface, and avoids introducing a second unofficial execution channel.`
- Reopen trigger: `A human explicitly wants to prototype or formalize a PowerShell-based Claude launch path from PMO.`

### `Task Project Note Behavior-Locked Simplification Pass`

- Type: `cleanup`
- Source: `execution report`
- Source reference: `docs/pmo/state/execution_report.md for Archive And Lifecycle Model Alignment`
- Problem / Opportunity: `Task, project, and note behavior has now been shaped through several feature and semantics passes, and the implementation is at risk of becoming harder to reason about than the product surface actually requires. The opportunity is to lock current intended behavior in tests first, then simplify the implementation toward the smallest code that still preserves those behaviors.`
- Why now: `The archive/lifecycle alignment sprint just closed, so the intended semantics are still fresh enough to capture in behavior tests before more incremental changes make the current contract harder to pin down.`
- Current status: `parked`
- Dependencies: `A bounded future refactor pass that first defines or expands behavior coverage for archive, restore, completion semantics, list filtering, project task preview, and other currently intended note/project/task interactions before simplifying backend and frontend code paths.`
- Risks / unknowns: `If the behavior contract is not written down clearly enough first, the refactor could accidentally simplify away real product rules. If the effort is framed too broadly, it could sprawl into redesign instead of a behavior-locked cleanup.`
- Suggested next action: `Later, shape this into a test-driven refactor sprint: first capture the currently intended behavior in targeted tests, then simplify the implementation toward the smallest code that still passes that behavior suite, and finally rerun the same tests as the acceptance gate.`
- Reopen trigger: `A human explicitly wants a behavior-locked simplification pass for note/project/task, or future changes make this area feel too risky to touch without stronger test coverage and cleanup.`

### `Npx Validation Fallback Rules`

- Type: `cleanup`
- Source: `discussion`
- Problem / Opportunity: `Current repo rules around `npx` usage are still too coarse. Recent execution showed that fully blocking bare `npx playwright test` avoided one class of workflow drift, but also created a new problem when repo-native validation paths were broken and the worker had no clearly sanctioned fallback. Backend test invocation and frontend Vite/Playwright validation also have meaningfully different operational constraints, so one flat rule is likely too simplistic.`
- Why now: `This issue has now affected real execution quality and reporting clarity. It should stay visible as a separate workflow/policy topic rather than being improvised case by case.`
- Current status: `parked`
- Dependencies: `A later bounded discussion or policy pass that distinguishes repo-native default paths, forbidden bypasses, and acceptable fallback usage across backend tests, frontend unit tests, and frontend browser review flows.`
- Risks / unknowns: `If the rule stays too strict, workers lose safe fallback options when scripts drift or break. If it becomes too loose, validation discipline will erode and repo-native paths will stop mattering. The right split between `npx` as forbidden bypass and `npx` as explicit fallback still needs careful treatment.`
- Suggested next action: `Later, run a bounded workflow discussion focused specifically on `npx` validation rules, with separate treatment for backend test execution, frontend unit-test execution, and browser/UI review flows.`
- Reopen trigger: `A human explicitly wants to refine validation-command policy, or another sprint is blocked or distorted by unclear `npx` fallback rules.`

### `Execution Skills Formalization And Worker Decoupling`

- Type: `cleanup`
- Source: `discussion`
- Problem / Opportunity: `A growing number of execution procedures and worker expectations still live only in PMO docs, AGENT.md, or scattered repo notes instead of being formalized as reusable skills. Formalizing those procedures into skills would make execution behavior more durable, reduce prompt drift, and help decouple the repo's worker model from any one named executor such as Claude.`
- Why now: `Recent use of sub-agents and worker handoffs exposed that the PMO runtime is already fairly worker-abstract, but the surrounding execution procedures and entry guidance are still unevenly distributed. Capturing this now keeps the idea visible until there is time to intentionally restructure it.`
- Current status: `parked`
- Dependencies: `A later bounded cleanup/design pass that maps which execution procedures should become formal skills, which worker-facing instructions should move out of executor-specific docs, and how those skills should integrate with PMO execution_task handoffs.`
- Risks / unknowns: `If approached too broadly, this could sprawl into a repo-wide documentation rewrite instead of a focused worker-interface cleanup. It is also still unclear which procedures belong in durable skills versus baseline docs or operator guides.`
- Suggested next action: `Later, run a bounded discussion that inventories scattered execution procedures, identifies the highest-value candidates for skill formalization, and defines how that work should align with broader worker/Claude decoupling.`
- Reopen trigger: `A human explicitly wants to formalize execution procedures into skills, or worker/Claude decoupling becomes an active PMO topic.`

### `PMO Policy Layer Hardening And Rule Extraction`

- Type: `cleanup`
- Source: `discussion`
- Source reference: `Human note on 2026-05-04 that the PMO policy layer may still be too thin and that many cross-cutting rules may be scattered through workflows instead of formalized as policies.`
- Problem / Opportunity: `Some durable PMO judgment rules may still live inside `PMO_OPERATING_MANUAL.md`, `protocols/**`, `operator-guides/**`, or tool README prose instead of `policies/**`. This can make the PMO harder to maintain as automation grows, because future agents may have to rediscover which statements are durable cross-flow policy and which are just step-by-step workflow instructions.`
- Why now: `The PMO automation and handoff-template work clarified the boundary between state, protocol, policy, history, and tools, but it also made visible that policy extraction should be treated as its own governance cleanup rather than folded into the automation sprint.`
- Current status: `parked`
- Dependencies: `A later bounded audit that reviews PMO runtime, activation, closeout, automation, validation, and documentation-sync rules, then decides which repeated or cross-cutting judgments belong in `docs/pmo/policies/**` versus remaining in protocol or tool documentation.`
- Risks / unknowns: `If done too broadly, this could become a full PMO documentation rewrite. If done too narrowly, important durable rules may continue to live only in procedural docs. The useful first pass should focus on rules that affect multiple workflows or repeated PMO judgment, not every sentence that sounds policy-like.`
- Suggested next action: `Later, run a bounded policy-layer audit that classifies current PMO rules into policy, protocol, operator guide, tool documentation, or decision-log homes, then promote only the highest-value repeated rules into policies.`
- Reopen trigger: `A human explicitly wants a PMO policy-layer audit, PMO rules keep being rediscovered across workflow docs, or new automation makes the policy/protocol/tool boundary feel unclear again.`
