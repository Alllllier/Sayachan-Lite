# Execution Task

- Status: `active`
- Sprint: `UI Noise Reduction And Toast Consolidation`
- Last updated: `2026-04-19`

## Source Trace

- Candidate source: `docs/pmo/state/sprint_candidates.md`
- Related discussion batch: `docs/pmo/state/discussions/discussion_batch_003.md`
- Related backlog or decision entries: `none required for activation`

## Objective

- Deliver a bounded frontend consistency pass that makes `Notes`, `Projects`, and the dashboard saved-task list feel quieter and more coherent.
- Move low-frequency management actions into a shared overflow pattern where PMO already decided the hierarchy is stable.
- Make the shared `Toast` component the default success-feedback path for the affected surfaces instead of continuing mixed inline local success-message implementations.

## Safe Touch Zones

- `frontend/src/components/NotesPanel.vue`
- `frontend/src/components/ProjectsPanel.vue`
- `frontend/src/components/Dashboard.vue`
- `frontend/src/components/ui/Toast.vue` only if a narrow adjustment is needed to support this slice cleanly
- small adjacent style or helper changes only when directly required to keep the above surfaces consistent

## Non-Goals

- no broader Dashboard AI workflow redesign
- no new AI behavior or prompt changes
- no task, note, or project data-model changes
- no global component-system rewrite for every possible action menu in the app
- no expansion into broader Sayachan visual redesign work outside this bounded consistency pass

## Deferred Or Parked Follow-Up

- any broader dashboard AI workflow restructuring should stay out of this sprint
- if execution exposes a future structural redesign need, PMO should route it back into `idea_backlog.md` rather than expanding this slice in place

## Acceptance Checks

- `NotesPanel.vue` keeps `pin` and AI visible while moving `Edit`, `Archive`, and `Delete` into a trailing vertical-ellipsis overflow menu
- `ProjectsPanel.vue` keeps `pin`, AI, and the primary task-capture affordance visible while moving `Edit`, `Archive`, and `Delete` into a trailing vertical-ellipsis overflow menu
- overflow menu order stays consistent as `Edit -> Archive -> Delete`
- `Dashboard.vue` saved-task list uses the same vertical-ellipsis trigger language for its secondary-actions menu
- known inline success confirmations on Notes, Projects, and Dashboard are migrated to the shared toast path where no persistent in-context confirmation is actually required
- existing user-facing behavior remains intact aside from the intended presentation and feedback cleanup

## Validation Expectations

- run repo-appropriate validation after the change
- browser validation and UI review are expected for this slice
- review these surfaces and states specifically:
  - note card actions in normal active state and archived state
  - project card actions in normal active state and archived state
  - dashboard saved-task secondary-actions menu
  - dashboard quick-add and AI workflow success feedback behavior
  - notes/project AI-save and task-capture success feedback behavior
- validate both discoverability and destructive-action clarity after moving actions behind overflow menus

## Escalation Points

- stop and escalate if the overflow treatment starts requiring a new shared action-menu abstraction that is much broader than this sprint
- stop and escalate if removing inline success messages reveals a product need for persistent contextual confirmation that PMO did not already approve
- stop and escalate if the dashboard AI workflow starts pulling the sprint into a broader structural redesign

## Completion Report Contract

The execution report should state:

- what was delivered
- what validation was performed
- whether project-specific UI review was required and actually performed
- what remains unverified
- what risks or escalations remain
- what documentation-sync outcome PMO should record during closeout
