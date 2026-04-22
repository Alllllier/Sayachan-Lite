# Archived Candidate

## Candidate

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
