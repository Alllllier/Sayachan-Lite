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

### `Projects Feature Layer Split`

- Type: `architecture`
- Source: `execution report`
- Source reference: `docs/pmo/history/reports/projects-rules-behavior-coverage.md; FRONTEND_ARCHITECTURE_AUDIT_2026-04-23.md`
- Problem / Opportunity: `ProjectsPanel still mixes rendering, local state, API calls, validation, task capture, focus management, and project-task preview orchestration. The just-completed Projects rules coverage gives the project a safer behavior baseline for a later split into clearer Projects feature layers.`
- Why now: `The current sprint intentionally avoided architecture migration, but it clarified the preferred future direction: keep rules portable, then later introduce a feature boundary such as projects.api.js, projects.rules.js, and useProjects.js or an equivalent features/projects structure.`
- Current status: `parked`
- Dependencies: `A later architecture sprint that intentionally chooses the feature-layer structure and uses the new Projects rules tests as guardrails.`
- Risks / unknowns: `If this is done too early or too broadly, it could turn into a frontend rewrite. If it is deferred indefinitely, ProjectsPanel will keep acting as view, controller, service, and state owner at once. The right boundary between composable state, API client, and pure rules still needs sprint-level shaping.`
- Suggested next action: `Later, shape a bounded Projects feature-layer split that first moves API calls and stateful orchestration without changing product behavior, then moves the existing rules tests with the extracted rules module.`
- Reopen trigger: `A human explicitly wants to start frontend feature-layer cleanup, or future Projects work becomes difficult because ProjectsPanel wiring remains too concentrated.`

### `Companion-Like Dashboard Day-Phase Rhythm Cue`

- Type: `feature`
- Source: `discussion`
- Problem / Opportunity: `The homepage may benefit from a lightweight time-orientation surface, but the product should preserve Sayachan's companion feel. The emerging direction is not a pressure-oriented countdown, but a text-led rhythm cue that gently explains the user's current phase of the day.`
- Why now: `Homepage temporal treatment affects product tone at a high-traffic surface, and the discussion has already stabilized enough product constraints that the idea should remain visible outside the discussion batch.`
- Current status: `exploring`
- Dependencies: `A clearer day-phase model for Sayachan, including how many phases a day should have, where rough boundaries sit, how each phase should feel, whether any minimal ambient support should sit beneath the text-led cue, and what broader product settings / preference entry should control the cue.`
- Risks / unknowns: `The cue could still become too managerial, too poetic, too vague to orient, or too visually assertive for the dashboard. The exact balance between lived-time language and explicit time facts is still unresolved, and the feature may feel companion-like for some users but pressure-inducing for others if it ships without user control.`
- Suggested next action: `Continue the active discussion by defining the day-phase structure, emotional texture, and user-control model first, then reassess whether the cue is stable enough for a bounded dashboard design slice.`

### `Owner-Led Auth And Invite-Gated Tester Accounts`

- Type: `architecture`
- Source: `discussion`
- Problem / Opportunity: `The product still lacks authentication. It needs a first-phase account model that supports owner-controlled tester onboarding, account-private runtime data, and owner-only private-core boundaries without forcing a full multi-tenant redesign yet.`
- Why now: `Near-term friend testing needs real account isolation, and the auth direction should be settled before implementation planning begins.`
- Current status: `exploring`
- Dependencies: `A bounded first-phase design for user model, invite model, auth flow, account-scoped data access, and owner-only private-core capability boundaries.`
- Risks / unknowns: `Auth mechanism, session shape, migration path for existing single-user data, and enforcement strategy for owner-only private-core entrypoints.`
- Suggested next action: `Turn the current discussion conclusion into a bounded implementation design, then reassess promotion into sprint_candidates.md.`

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
- Problem / Opportunity: `Creation entry points and list-surface visibility patterns are still inconsistent across Notes, Projects, and project task lists, which adds navigation friction and weakens interaction predictability on high-frequency surfaces. The product would benefit from a more coherent rule for where creation starts, how list density is handled, and how content remains discoverable across adjacent work surfaces.`
- Why now: `This theme was important enough to be preserved in the legacy batch and still appears likely to be resolved in the near term, even though it is not the highest-priority active task right now. Recording it in formal PMO state keeps it visible until there is room to close it properly.`
- Current status: `parked`
- Dependencies: `A bounded follow-up discussion that decides which inconsistencies matter most first, what cross-surface interaction rule should unify Notes, Projects, and task lists, and whether the work should be shaped as one consistency pass or multiple smaller UI slices.`
- Risks / unknowns: `If framed too broadly, this could sprawl into a full information architecture rethink instead of a practical consistency pass. The right boundary between creation-entry consistency, task visibility, list density, and surface-specific behavior is still unresolved.`
- Suggested next action: `Reopen this as a near-term product discussion, identify the highest-friction inconsistency first, and then shape the work into one or more bounded UI slices for later execution.`
- Reopen trigger: `A human explicitly wants to revisit creation-flow or list-surface consistency across Notes, Projects, and task lists, or adjacent UI work exposes the same inconsistency again.`

### `Dashboard AI Workflow Redesign`

- Type: `feature`
- Source: `discussion`
- Source reference: `README.md Dashboard AI 功能整体重构; docs/pmo/state/discussions/discussion_batch_011.md`
- Problem / Opportunity: `Dashboard no longer carries the older fallback-only AI Assistant surface for Weekly Review, Focus Recommendation, Action Plan, and Task Drafts. A future Dashboard AI workflow may still be valuable, but it should be redesigned from current AI core, task context, and project-focus semantics rather than revived from the removed demo-era flow.`
- Why now: `discussion_batch_011 stabilized the frontend shell/module cleanup, and the later Dashboard cleanup removed the stale AI Assistant block instead of deep-polishing it. Capturing the future redesign separately prevents the missing Dashboard AI workflow from being confused with style cleanup debt.`
- Current status: `parked`
- Dependencies: `A future AI/product discussion that decides whether the current dashboard AI workflow should remain, be replaced by AI core-owned surfaces, or be simplified into a smaller dashboard module.`
- Risks / unknowns: `Premature UI cleanup could polish an interim workflow that may be removed. A broad redesign could also sprawl into AI core ownership, task draft semantics, and dashboard information architecture unless it is bounded deliberately.`
- Suggested next action: `Reopen as a bounded product/AI workflow discussion only when Dashboard AI becomes a priority, then decide whether Weekly Review, Focus, Action Plan, and Task Drafts should remain together or split into clearer modules.`
- Reopen trigger: `A human explicitly wants to revisit Dashboard AI workflow, or future AI core/list work exposes that the current dashboard workflow no longer fits the product runtime.`

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

### `Cross-Surface Frontend Validation Buildout`

- Type: `cleanup`
- Source: `audit`
- Source reference: `UI Noise Reduction And Toast Consolidation closeout`
- Problem / Opportunity: `Current repo-native browser/UI review coverage is still surface-skewed. Notes has a usable Playwright review path, but Projects and Dashboard do not yet have equivalent first-class UI review coverage, which leaves cross-surface cleanup work partially verified even when implementation itself is bounded and correct.`
- Why now: `Recent UI cleanup work showed that validation gaps are now more about coverage structure than about one-off execution mistakes. Keeping this visible now reduces the chance that future cross-surface UI work keeps closing out with the same predictable unverified areas.`
- Current status: `parked`
- Dependencies: `A future bounded validation buildout that decides which frontend surfaces deserve repo-native browser review coverage first, how that coverage should be grouped, and how it should fit alongside build checks and manual review.`
- Risks / unknowns: `If this expands too broadly, it could turn into a testing-system rewrite instead of a practical coverage pass. If it stays invisible, PMO will keep accepting avoidable browser-review gaps across non-Notes surfaces.`
- Suggested next action: `Later, shape this into a bounded frontend validation pass that first maps the highest-value missing UI review surfaces (likely Projects and Dashboard), then adds repo-native browser review coverage incrementally rather than trying to redesign all testing at once.`
- Reopen trigger: `A human explicitly wants a frontend validation sprint, or repeated UI closeouts keep landing with the same Projects/Dashboard browser-review gaps.`

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
- Problem / Opportunity: `A growing number of execution procedures and worker expectations still live only in PMO docs, CLAUDE.md, or scattered repo notes instead of being formalized as reusable skills. Formalizing those procedures into skills would make execution behavior more durable, reduce prompt drift, and help decouple the repo's worker model from any one named executor such as Claude.`
- Why now: `Recent use of sub-agents and worker handoffs exposed that the PMO runtime is already fairly worker-abstract, but the surrounding execution procedures and entry guidance are still unevenly distributed. Capturing this now keeps the idea visible until there is time to intentionally restructure it.`
- Current status: `parked`
- Dependencies: `A later bounded cleanup/design pass that maps which execution procedures should become formal skills, which worker-facing instructions should move out of CLAUDE-specific docs, and how those skills should integrate with PMO execution_task handoffs.`
- Risks / unknowns: `If approached too broadly, this could sprawl into a repo-wide documentation rewrite instead of a focused worker-interface cleanup. It is also still unclear which procedures belong in durable skills versus baseline docs or operator guides.`
- Suggested next action: `Later, run a bounded discussion that inventories scattered execution procedures, identifies the highest-value candidates for skill formalization, and defines how that work should align with broader worker/Claude decoupling.`
- Reopen trigger: `A human explicitly wants to formalize execution procedures into skills, or worker/Claude decoupling becomes an active PMO topic.`

### `Runtime State Template Activation For PMO Handoffs`

- Type: `cleanup`
- Source: `discussion`
- Source reference: `Human discussion on 2026-04-22 during discussion_batch_011 follow-up`
- Problem / Opportunity: `The `docs/pmo/state/templates/` layer currently exists mostly as a static reference surface, especially for idle resets, but it is not yet truly part of the active sprint-selection and handoff generation chain. As a result, real runtime files such as `current_sprint.md`, `execution_task.md`, and `execution_report.md` are still composed ad hoc from discussion context, which increases the chance that already-agreed state templates, must-preserve rules, or structured handoff slots are inconsistently carried into execution.`
- Why now: `Recent real PMO usage exposed that even when discussion judgments are stable, the active handoff can still miss already-decided state templates because the runtime write path does not actually instantiate from the template layer. Recording this now preserves a concrete process-improvement target for the later PMO discussion/process optimization pass.`
- Current status: `parked`
- Dependencies: `A later PMO workflow discussion that covers discussion templates, archival mechanics, and the runtime handoff pipeline; likely adjacent to future work on improving PMO discussion/process structure overall.`
- Risks / unknowns: `If solved too mechanically, this could produce rigid template-filling that loses useful judgment. If left unresolved, PMO will keep depending on live manual translation between discussion conclusions and active runtime state files, which increases drift risk. The right boundary between template-instantiated structure and PMO-authored contextual nuance is still open.`
- Suggested next action: `Later, run a bounded PMO workflow discussion focused on upgrading `state/templates` from static reference material into a real handoff-generation skeleton for active runtime files, while preserving room for narrow contextual judgment.`
- Reopen trigger: `A human explicitly wants to improve PMO discussion/process flow, or another active handoff reveals that agreed runtime-state structure was not actually carried through from the template layer.`
