# Candidate Archive

### `Frontend Controls Core Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-003 first pass`
- Why now: `The structure/baseline first pass has already landed, so the next highest-value frontend consistency work is to formalize the core control grammar instead of leaving buttons and segmented controls as a mix of legacy styling and panel-local decisions. The current discussion has converged enough to support a bounded first pass focused only on button hierarchy and segmented controls, while intentionally deferring action-grouping follow-ons.`
- Expected outcome: `The frontend gains a first real controls-core baseline covering button hierarchy and segmented controls. High-frequency controls across Notes, Projects, task preview, and task capture should stop drifting as local one-off implementations and begin using a shared hierarchy (`Primary`, `Secondary`, `Ghost / Tertiary`, `Danger`, `AI / Intent`) plus a shared segmented-control shell (`page`, `mode`, `inline`) backed by a thin controls-specific token layer where needed.`
- In scope:
  - formalize first-pass button hierarchy for:
    - `Primary`
    - `Secondary`
    - `Ghost / Tertiary`
    - `Danger`
    - `AI / Intent`
  - formalize first-pass segmented-control shell for:
    - `page`
    - `mode`
    - `inline`
  - add only the thin controls-specific token layer needed to support segmented controls cleanly
  - first-pass adoption on current high-frequency surfaces where the new control grammar fits cleanly now
  - preserve the current good `inline` task-preview filter feel while moving it into the shared segmented-control baseline
- Out of scope:
  - `ActionRow / ObjectActionArea` follow-on work
  - full icon-button / menu-trigger systemization
  - reveal-pattern systemization
  - input / textarea state cleanup
  - dashboard AI workflow redesign
  - exhaustive frontend legacy cleanup
- Dependencies: `discussion_batch_011 slice-003 controls-core judgments; landed structure/baseline first pass from slice-001; willingness to defer action-grouping refinement into the next follow-on instead of forcing it into this sprint`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to split controls core into a narrower first pass and to promote that first pass once the expected outcome and scope boundary were clear.`
- Closeout: `Completed on 2026-04-22. Landed the first-pass controls baseline for button hierarchy and segmented controls on Notes and Projects, then accepted several narrow review/polish corrections without widening scope: primary stayed functional-green rather than identity-colored, AI/Intent stayed icon-first, the page segmented-control active state was made clearer as a view switch, and the AI intent button baseline was settled into a round shadow-led pattern. Validation passed through frontend npm test and npm run build.`
