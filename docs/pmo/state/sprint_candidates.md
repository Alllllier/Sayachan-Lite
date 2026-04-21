# Sprint Candidates

> Up to 3 bounded sprint options that are ready for human comparison before activation.

## Working Rules

- keep at most 3 total entries in this file, including recently completed candidates retained for near-term context
- a candidate may be drafted by Codex, but it does not become the active sprint without explicit human selection
- replace or merge weaker candidates instead of stacking endlessly
- when a new candidate needs space, archive older completed entries into `../history/candidates/` before pushing the file past 3 total items
- if a candidate is selected, keep it visible here while also activating `current_sprint.md` and writing the corresponding `execution_task.md`
- after sprint closeout, update the selected candidate entry to `completed` before later archival into `../history/candidates/` when space is needed
- keep source trace visible so the selected sprint can be tied back to its discussion, backlog, or decision context

## Candidate Template

### `<sprint name>`

- Status: `candidate | active | completed`
- Source reference:
- Why now:
- Expected outcome:
- In scope:
- Out of scope:
- Dependencies:
- Risk level: `low | medium | high`
- Readiness: `ready | almost-ready | blocked`
- Start condition:

## Current Candidates

### `Frontend Structure And Baseline First-Pass Adoption`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-001`
- Why now: `The frontend style-baseline discussion has now converged enough that a first bounded adoption pass can land without waiting for the whole long-term UI program. The project already has a workable first-round visual baseline and three structural component candidates (`Card`, `SectionBlock`, `DirectiveBlock`), and the cleanest next step is to start using that language where it fits now rather than letting it remain only as discussion.`
- Expected outcome: `The frontend gains a real first-pass structure layer and token-backed baseline through Card, SectionBlock, and DirectiveBlock, with the agreed first-round visual baseline wired into those structures. note-card should become the cleaner first reference surface, while project-card begins adopting the new shell/inner-block language without forcing total replacement or pretending every legacy seam can disappear in one pass.`
- In scope:
  - first-pass formalization/adoption of `Card`, `SectionBlock`, and `DirectiveBlock`
  - first-pass adoption of the already-agreed baseline tokens for:
    - identity
    - neutral / surface / text
    - typography
    - spacing
    - radius
    - border / shadow
  - use `note-card` as the cleaner first-round `Card` reference
  - begin moving `project-card` toward the new shell + inner-block structure without forcing full purity in one sprint
  - allow temporary local legacy implementation where the new structure does not yet fit cleanly
- Out of scope:
  - full dashboard AI workflow redesign
  - full interaction/control layer redesign
  - `StatusToggle` redesign
  - total frontend UI unification in one pass
  - exhaustive legacy cleanup
  - icon/motion/system-wide shell-language completion
- Dependencies: `discussion_batch_011's agreed first-round baseline decisions; existing landed project-surface semantics cleanup; willingness to tolerate local temporary legacy where the new model cannot yet fully absorb old structures`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-21 by explicit human promotion after discussion converged on a phased adoption model and confirmed that the first-pass slice should land both structure (`Card` / `SectionBlock` / `DirectiveBlock`) and already-agreed visual baseline tokens together.`
- Closeout: `Completed on 2026-04-21. Landed first-pass Card, SectionBlock, and DirectiveBlock adoption across note/project surfaces plus the agreed first-round baseline tokens. PMO review caught one runtime-style blocker after initial delivery: removed legacy CSS variables were still referenced in style.css. That blocker was fixed in the execution loop by restoring thin compatibility aliases, after which frontend tests and build passed and the sprint was accepted for closeout.`

### `Archived Project Preview Quieting`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_010.md; follow-up human direction in current thread`
- Why now: `The first archived-preview noise reduction removed the redundant row-level Archived chip, but archived projects still repeat too much state information. In an archived project, the project-level state and archive cascade are already understood, so keeping both the archived subsection label and per-row lifecycle chip still reads as more metadata than the surface needs.`
- Expected outcome: `Archived project previews become quieter and easier to scan by removing metadata that is already implied by the archived project context, while preserving the affordances that still matter: completed-task strikethrough, archived-task non-interactivity, and the archived project’s narrow action set.`
- In scope:
  - reduce metadata noise only inside `archived project` task previews on the `ProjectsPanel`
  - allow the archived project task area to rely on existing archived-project context instead of repeating archive/lifecycle labels
  - preserve completed-task strikethrough as the lifecycle distinction
  - keep any supporting test update narrow and local to this archived-project micro-fix
- Out of scope:
  - changes to ordinary active project archived sections
  - broader `ProjectsPanel` redesign
  - dashboard or notes-surface changes
  - broader frontend test coverage buildout
  - repo-native UI review repair
  - backend/runtime semantics changes
- Dependencies: `Completed Project Surface Display Semantics Cleanup plus the archived-preview noise reduction micro-fix already landed in this thread.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-21 by explicit human instruction to run the same autonomous micro-fix flow again, this time narrowed specifically to archived-project preview noise.`
- Closeout: `Completed on 2026-04-21. Archived-project task previews now hide the redundant archived subsection label and row-level lifecycle chip, while ordinary active-project archived sections remain unchanged and the established affordances stayed intact: completed strikethrough, archived-task non-interactivity, and archived-project narrow actions. Validation passed through frontend build.`

### `Archived Preview Metadata Noise Reduction`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_010.md; human screenshot feedback in current thread`
- Why now: `The last project-surface semantics cleanup clarified `status + archived`, but screenshot feedback now shows that archived preview rows still carry too much repeated metadata on mobile. The separate archived section is correct, but the combination of section label plus per-row lifecycle and archive markers is visually noisy enough to merit a bounded micro-fix.`
- Expected outcome: `Archived project-task preview rows become quieter and easier to scan without losing the semantics just established. The archived section remains, archived tasks stay non-interactive, and completed-vs-active remains legible, but redundant metadata shouting is reduced.`
- In scope:
  - reduce redundant metadata noise inside archived preview rows on the `ProjectsPanel`
  - preserve the separate archived section itself
  - preserve archived-task non-interactivity
  - preserve completed-task strikethrough treatment
  - preserve archived-project narrow actions
  - keep any supporting test update narrow and local to this UI noise fix
- Out of scope:
  - broader `ProjectsPanel` redesign
  - dashboard or notes-surface changes
  - broader frontend test coverage buildout
  - repo-native UI review repair
  - backend/runtime semantics changes
- Dependencies: `Completed Project Surface Display Semantics Cleanup plus the screenshot-confirmed UI-noise issue surfaced in the current thread.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-21 by explicit human instruction to auto-generate candidates, auto-select the best micro-fix, execute it, review it, close it out, and commit without further human gating.`
- Closeout: `Completed on 2026-04-21. The micro-fix removed the redundant per-row Archived chip from archived preview rows on ProjectsPanel while preserving the separate archived section, completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions. Narrow frontend validation passed through projectsPanel.behavior.test.js.`
