# Discussion Batch `discussion_batch_001`

- Topic: `Dashboard time cues and panel action noise`
- Last updated: `2026-04-18`
- Status: `active`

## Why This Discussion Exists

- The product may benefit from lightweight time orientation on the homepage, but it is not yet clear whether those cues strengthen focus or add ambient pressure.
- The current Notes and Projects cards expose many low-frequency management actions directly in the UI, and this may be diluting action hierarchy on high-frequency surfaces.
- The discussion needs to preserve both product-feel questions and execution-relevant slice boundaries before any promotion decision is made.

## Theme Summary

### `theme-001`

- Summary: `Clarify how Sayachan should present temporal awareness and card-level actions so the UI feels calmer, clearer, and more aligned with the core loop of focus -> task -> completion -> memory -> next focus, while preserving the product's companion-like feel.`
- Why grouped: `Both topics are about signal-to-action ratio on high-traffic surfaces: what information deserves visual emphasis, and which actions should remain immediately available versus recede into lower-visibility affordances.`
- Current focus: `yes - define the day-phase model behind a text-led homepage rhythm cue, before writing any actual copy`
- Status: `in_focus`

## Possible Slices

### `slice-001`

- Name: `Dashboard temporal cues`
- Why separate: `This is a homepage-facing product decision about whether to add day/month/year time signals, what emotional tone they should carry, and how much visual weight they deserve relative to next-action guidance. The current discussion has already established that companionship is a top-level constraint, that text-led cues currently fit better than pure ambient treatment, that the preferred voice should explain the current phase rather than tell the user what to do, and that the primary temporal scale should likely be day-phase rather than month or year first.`
- Current maturity: `emerging with a leading direction and scale`
- Likely target: `undecided`

### `slice-002`

- Name: `Notes and Projects action hierarchy`
- Why separate: `This is a high-frequency interaction design question about which card actions should be primary, which should collapse into a menu, and how to reduce visual noise without hiding necessary controls.`
- Current maturity: `emerging`
- Likely target: `undecided`

## Open Questions

- Into how many phases should a Sayachan day be divided so that the rhythm feels natural rather than overdesigned?
- Where should the phase boundaries roughly live: morning, late morning, afternoon, evening, night, or a smaller set?
- What is the emotional texture of each phase in Sayachan terms: opening, settling, deepening, softening, winding down, or something else?
- How directly should the UI express remaining time versus translating it into gentler, lived-time language?
- What is the strongest text-led form that still feels soft rather than managerial or poetic in an empty way?
- How can a text-led cue explain the current phase clearly enough to orient the user without sliding into action coaching?
- What minimal ambient support, if any, should remain underneath a text-led primary cue?
- What should count as a card's primary action in Notes versus Projects?
- Which actions are legitimately high-frequency enough to stay visible, and which should be moved into a secondary `more` affordance?
- How much UI simplification can happen without making edit/archive/delete feel hidden or unsafe?

## Current PMO Judgment

- The discussion is still in discovery and should remain at the discussion layer.
- A stable product constraint has emerged: Sayachan should preserve companionship, so homepage time treatment should support orientation and rhythm rather than pressure or depletion.
- A stable working judgment has also emerged: Sayachan should more likely `sense time` than `count down time`, which currently biases exploration toward soft temporal cues and ambient progress rather than hard countdown.
- A newer stable preference has emerged from the human: the desired companionship is not merely atmospheric; it should gently remind the user what kind of temporal rhythm they are currently in.
- This currently gives text-led temporal cues an advantage over pure ambient treatment.
- A further stable preference has now emerged: within the text-led direction, Sayachan should lean toward explaining the current phase of the day or period, not subtly instructing the user toward the next action.
- Another stable preference has now emerged: the primary cue should likely be built around day-phase explanation before considering month-scale or year-scale messaging as the lead layer.
- The main unresolved shape question is no longer `text versus ambient` in the abstract, but what the underlying day-phase model should be and how each phase should feel in Sayachan language before copywriting begins.
- The theme is directionally coherent, but the product framing is not yet stable enough for backlog retention or sprint promotion because the concrete UI shape is still open.
- Preserving two separate possible slices is useful because the dashboard cue question and the panel-noise question may stabilize at different speeds.

## Promotion Outcome

- Retained in `idea_backlog.md` as `Companion-Like Dashboard Day-Phase Rhythm Cue`.
- No sprint promotion yet.
- Continue discussion on the active theme until the day-phase model and concrete UI shape are more stable.
