# Candidate Archive: `Frontend Secondary Controls And Reveal Baseline`

- Archived from: `docs/pmo/state/sprint_candidates.md`
- Archive date: `2026-04-24`
- Final status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-004`

## Candidate Record

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-004`
- Why now: `The core controls grammar and action-grouping baseline have already landed, so the next frontend consistency gap is the narrower but still shared layer around icon buttons, overflow/menu triggers, and their attached reveal surfaces. Discussion has now converged on a bounded direction: `Notes / Projects` define the standard rounded-square panel-surface pattern, `Dashboard` should be absorbed into that final pattern, and AI circle controls remain intentionally out of scope for this pass.`
- Expected outcome: `The frontend gains a first real baseline for secondary panel-surface controls and attached reveal surfaces. Ordinary tool-style icon buttons and menu triggers should stop drifting as panel-local implementations, `Notes / Projects` should define the shared rounded-square pattern, and `Dashboard` should adopt that same final menu-trigger grammar without reopening AI circle or ChatEntry control design.`
- In scope:
  - formalize the panel-surface `rounded-square` icon-button baseline
  - keep `28x28` as the shared size for that baseline
  - preserve the agreed shape split:
    - `rounded-square` for ordinary tool/menu controls
    - `circle` remains outside this slice
  - absorb the agreed rounded-square state language into baseline tokens/rules:
    - transparent default
    - muted foreground
    - shared active surface for hover/open/pinned-like states
  - treat `pin` as the main rounded-square reference sample
  - formalize `menu trigger` to eat the same rounded-square baseline
  - treat `Notes / Projects` as the canonical shared panel-surface menu-trigger sample
  - bring `Dashboard` menu trigger directly under that final shared scheme
  - preserve current dropdown/menu-item behavior where it is already good enough
  - keep reveal-pattern formalization limited to the ordinary attached panel-surface pattern already present in `Notes / Projects`
- Out of scope:
  - `circle` AI / Intent button redesign or AI reveal unification
  - `ChatEntry` icon-button/menu-trigger changes
  - broader `ObjectActionArea` or action-grouping redesign
  - broader dashboard workflow redesign
  - input / textarea states
  - full legacy cleanup beyond this secondary-controls surface
- Dependencies: `discussion_batch_011 slice-004 judgments; landed controls core and action-grouping baselines; willingness to treat `Notes / Projects` as the canonical menu-trigger sample and `Dashboard` as the legacy surface to absorb`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to promote the now-mature secondary-controls/reveal discussion into candidate status rather than continue deeper speculative discussion.`
- Closeout: `Completed on 2026-04-22. Landed the first rounded-square panel-surface baseline for pin/menu triggers, unified the effective Notes/Projects menu-trigger family into shared baseline rules, and absorbed Dashboard into that same trigger/dropdown/menu-item scheme without reopening AI circle controls, ChatEntry, or broader workflow redesign. Validation passed through frontend npm test and npm run build.`
