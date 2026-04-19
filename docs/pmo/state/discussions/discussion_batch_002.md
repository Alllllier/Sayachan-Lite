# Discussion Batch `discussion_batch_002`

- Topic: `Notes editor comfort and identity follow-up`
- Last updated: `2026-04-19`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `mixed`
- Origin trigger: `closeout finding | real usage feedback`
- Source channel: `human discussion`
- Why now: `The previous Notes editor polish sprint improved the editor directionally, but real usage revealed concrete comfort and presentation issues that are too specific for backlog parking and still too product-shaped for immediate execution handoff.`
- Related sprint or closeout: `Notes Editor Polish v1 closeout residuals and post-sprint real usage feedback`

## Why This Discussion Exists

- The CodeMirror-backed Notes editor is clearer and calmer than before, but real writing use exposed concrete comfort issues that matter to day-to-day note-taking.
- The main exposed problems are not only implementation defects; they also touch product feel and writing identity, so PMO should discuss the shape before promoting the work into execution.
- The discussion should stay narrow and practical instead of being forced into a broad multi-theme exploration batch.

## Theme Summary

### `theme-001`

- Summary: `Clarify how the Notes editor should resolve concrete writing comfort issues while gaining a more distinctive Sayachan writing identity rather than remaining a generic cleaned-up editor shell.`
- Why grouped: `The immediate problems and the style question are tightly linked: typography, wrapping behavior, spacing, and tonal framing all affect whether the editor feels calm, usable, and recognizably Sayachan during actual note-taking.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `real usage revealed that the editor still feels oversized in text scale, can drift into horizontal scrolling instead of supporting natural line wrapping, and remains visually cleaner than before without yet feeling like a distinctive Sayachan writing surface.`

## Possible Slices

### `slice-001`

- Name: `Notes editor comfort fixes`
- Why separate: `This slice focuses on concrete writing usability: text scale, line wrapping behavior, and long-form comfort.`
- Current maturity: `ready`
- Likely target: `sprint_candidates`
- Parking trigger: `If the product identity discussion remains unresolved but the comfort problems are agreed as the only near-term priority.`
- Reopen signal: `If comfort fixes alone leave the editor still feeling generic or visually off-tone.`

### `slice-002`

- Name: `Notes editor visual identity pass`
- Why separate: `This slice focuses on the surface feeling intentional and distinctive rather than merely less technical.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If comfort repairs should ship first and identity shaping needs a second bounded pass.`
- Reopen signal: `If the comfort fixes stabilize but the editor still lacks a clear Sayachan writing character.`

## Open Questions

- What text scale feels calm and composition-friendly for long-form note writing without becoming tiny or clinical?
- Should the default editing experience strongly prefer line wrapping for normal note writing, even if that means moving away from more code-like editor behavior?
- What visual signals would make the editor feel like a Sayachan writing surface rather than a generic softened CodeMirror container?
- How much personality should the editor carry before it starts competing with note content?
- Should comfort fixes and identity shaping ship together in one bounded sprint, or should they be split into two slices?

## Current PMO Judgment

- This topic is a legitimate `follow-up` discussion rather than a broad exploration batch.
- It came from real usage after closeout, not from open-ended pre-sprint ideation.
- The concrete comfort issues are already real enough to justify a likely sprint candidate.
- However, the style and identity dimension still benefits from PMO discussion before execution, so the topic should not be forced straight into handoff.
- A stable product judgment has now emerged: the Notes editor should respect the reading experience of the eventual rendered note instead of treating the editor as a separate oversized presentation surface.
- This does not mean the editing surface must visually duplicate rendered markdown one-to-one.
- It does mean that core writing structure such as text scale, line wrapping behavior, and paragraph density should stay broadly aligned with how the note will actually be read after rendering.
- Under that judgment, horizontal scroll as a normal writing path is directionally wrong for this surface, and oversized editor typography should be treated as a comfort and fidelity problem rather than merely a cosmetic preference.
- A more specific styling judgment has now emerged from the discussion: the default editor text scale should tighten to `14px`, line height should move toward `1.6`, and the normal writing path should prefer wrapped continuous text instead of horizontal scrolling.
- The desired editing feel is therefore not "larger and looser than reading mode," but "close to rendered reading mode with only a small writing-friendly buffer."
- A further scope judgment has now emerged: for this follow-up, style identity should be expressed more strongly in the rendered note surface than in the editing surface.
- Under that judgment, the editor should currently stay close to the narrower comfort fix set plus the previously shipped polish direction, rather than expanding into a larger new styling pass inside edit mode.
- A stronger scope decision has now emerged: this follow-up should stop at the editing-surface comfort fixes.
- Rendered-surface identity work should not be folded into this follow-up sprint and is instead reserved for a later broader Sayachan style refresh.
- A likely next step is promotion into `sprint_candidates.md` for the comfort-fix slice only, while the rendered identity topic remains outside this batch's immediate execution scope.

## Promotion Outcome

- `slice-001` has now been promoted into `state/sprint_candidates.md` as `Notes Editor Comfort Fixes`.
- Continue using this batch only for residual follow-up discussion that is not already captured by the new candidate or the deferred style-refresh path.
- The scope deferral for rendered-surface identity work is now normalized in `state/decision_log.md`.
- The broader Sayachan style-refresh direction is now parked in `state/idea_backlog.md` for future visibility.
