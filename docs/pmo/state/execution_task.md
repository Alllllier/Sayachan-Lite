# Execution Task

- Status: `active`
- Sprint: `Task Project Note Simplification Refactor`
- Last updated: `2026-04-20`

## Source Trace

- Candidate source: `state/sprint_candidates.md: Task Project Note Simplification Refactor`
- Related discussion batch: `state/discussions/discussion_batch_007.md`
- Related backlog or decision entries: `state/idea_backlog.md: Task Project Note Behavior-Locked Simplification Pass`
- Supporting audit: `task-project-note-behavior-audit.md`
- Prior lock sprint: `Task Project Note Behavior-Lock Testing`

## Objective

- simplify the task/project/note runtime while preserving the now-locked external behavior
- unify the runtime meaning of project-related task
- remove legacy seams and dead fields that are no longer justified after the behavior-lock sprint
- reduce dashboard snapshot drift through bounded simplification rather than larger architecture work

## Safe Touch Zones

- `backend/src/routes/index.js`
- `backend/src/models/Task.js`
- `backend/src/models/Project.js`
- `backend/src/models/Note.js`
- `backend/test/**`
- `frontend/src/components/ProjectsPanel.vue`
- `frontend/src/components/NotesPanel.vue`
- `frontend/src/components/Dashboard.vue`
- `frontend/src/components/ChatEntry.vue`
- `frontend/src/services/taskService.js`
- `frontend/src/services/dashboardContextService.js`
- existing or new frontend component behavior/helper files and tests needed to preserve the locked behavior suite
- `docs/pmo/baselines/runtime-baseline.md` only if runtime truth changes need canonical sync
- `docs/pmo/baselines/backend-api.md` only if route/model truth changes need canonical sync

## Non-Goals

- do not introduce a new first-class relationship system
- do not implement note-note, note-project, or project-project feature work
- do not start a context-layer architecture project
- do not add production-grade migration work for development-stage data
- do not widen into AI runtime redesign
- do not silently change the locked product behavior unless this handoff explicitly says the behavior may be intentionally redone

## Allowed Intentional Redo Areas

- `focus-clearing` may be intentionally simplified into the newer symmetric rule:
  - if a task is the current focus task for a project
  - and it enters a state where it can no longer serve as valid focus
  - then `currentFocusTaskId` should be cleared
- dashboard snapshot drift may be reduced so cockpit signals represent active-work truth more coherently, as long as the bridge stays lightweight and experimental rather than growing into a larger subsystem

## Acceptance Checks

- the locked behavior suite still passes after simplification
- `linkedProjectId` is no longer required as the primary runtime relation key for project-task behavior
- the runtime rule for project-related task is more coherent than the current read/cascade split
- `project_focus` and `project_suggestion` no longer remain in the canonical runtime path if they were confirmed as compatibility-only
- dead legacy task fields (`source`, `sourceDetail`, `projectId`, `projectName`) are removed from the active schema if no locked behavior depends on them
- denormalized baggage such as `originLabel` and `linkedProjectName` is removed if no locked behavior depends on them
- focus-clearing behavior is simpler and more symmetric if the implementation touches that area
- dashboard snapshot handling is less drift-prone without becoming a broader architecture rewrite
- the report explicitly distinguishes:
  - behavior preserved under the locked suite
  - behavior intentionally redone
  - suspicious shapes still deferred

## Validation Expectations

- rerun the full repo-native behavior-lock suites in backend and frontend
- add only the minimum extra tests needed if simplification opens a new meaningful behavior seam
- keep validation focused on behavior parity, not helper choreography
- perform bounded browser/UI review if the simplification visibly changes archive/project/dashboard behavior
- if browser/UI review is still blocked by repo-native tooling issues, say so explicitly rather than working around it silently

## Escalation Points

- stop and escalate if removing `linkedProjectId` cleanly would require a broader relationship model than currently approved
- stop and escalate if behavior-lock tests prove insufficient to distinguish intended behavior from accidental current behavior
- stop and escalate if dashboard snapshot simplification pushes beyond “lightweight experimental bridge” into broader context-layer design
- stop and escalate if any field removal turns out to have a still-live runtime dependency not captured by the lock suite

## Completion Report Contract

The execution report should state:

- what simplifications were completed
- which locked behaviors remained intact under test
- which behaviors were intentionally redone and why
- which legacy or suspicious shapes were removed versus retained
- what validation was performed
- what remains unresolved or contradictory
- what documentation-sync outcome PMO should record during closeout
