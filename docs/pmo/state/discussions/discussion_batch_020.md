# Discussion Batch `discussion_batch_020`

- Topic: `Product multilingualization and locale boundary`
- Last updated: `2026-05-10`
- Status: `stable`
- Discussion mode: `exploration`

## Intake Record

- Intake type: `feature`
- Origin trigger: `human asked whether product multilingualization has existing PMO record`
- Source channel: `human discussion`
- Existing record check: `No dedicated product multilingualization discussion, decision, or backlog item was found. A past validation-error candidate explicitly excluded i18n/user-facing field-level validation messages, but that was an out-of-scope note rather than a product multilingualization record.`
- Why now: `The product is mature enough that UI copy, companion tone, locale-aware date/time formatting, AI response language, and settings ownership may soon need a shared boundary before individual surfaces start solving language support ad hoc.`

## Why This Discussion Exists

- Sayachan currently mixes product-facing English, Chinese discussion/planning language, and domain-specific companion tone without a formal product locale model.
- Multilingualization is not just a string-table refactor: it affects Sayachan's voice, AI prompt/output language, validation and empty-state copy, date/time formatting, account/settings ownership, and whether user-authored content should ever be transformed.
- Product language choices can leak into architecture if each surface hardcodes copy, locale behavior, or AI language preference independently.
- A discussion layer is needed before PMO promotes an implementation slice, because the first useful decision is likely the product boundary rather than the i18n library.

## Theme Summary

### `theme-001`

- Summary: `Define what product multilingualization means for Sayachan before selecting an implementation path.`
- Why grouped: `UI copy, AI voice, locale formatting, user content, and settings ownership all touch the same user-facing language experience even though they may become separate implementation slices later.`
- Current focus: `no - first productLocale boundary completed`
- Status: `stable`

## Possible Slices

### `slice-001`

- Name: `Product Locale Boundary Decision`
- Why separate: `Before implementing any translation layer, PMO should decide what is locale-controlled and what remains user-authored or model-contextual.`
- Current maturity: `emerging`
- Likely target: `decision_log | sprint_candidates`
- Parking trigger: `Park if product language support is still speculative and no near-term user need exists.`
- Reopen signal: `Human wants a language switcher, bilingual UI polish, locale-aware dates, or AI responses that follow the user's preferred product language.`
- Candidate boundary: `Decision-only or light audit first; no broad UI copy rewrite, no translation library migration, no AI prompt rewrite until the boundary is stable.`

### `slice-002`

- Name: `Frontend UI Copy Translation Baseline`
- Why separate: `The immediate user need is narrower than full product multilingualization: the current product mixes English labels with Chinese usage context, which makes Chinese-only friend testing awkward. The frontend can introduce a small translation surface for static product UI copy without touching AI behavior, user-authored content, or backend error architecture.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Parking trigger: `Park only if the team decides Chinese-only friend testing is no longer near-term or if the first pass expands into full i18n architecture.`
- Reopen signal: `Chinese-only friend testing needs a coherent Chinese UI, or hardcoded English labels keep appearing in core product surfaces.`
- Promotion note: `Human clarified on 2026-05-10 that the first useful step is the Android-like string-table model for tagged product text, mainly to make Chinese-only friend testing feasible. This should be a Chinese-first UI copy baseline rather than full multilingualization.`
- Locale-switching reservation: `Human further clarified that the first pass should still prepare for a later user settings language switch. Build both Chinese and English dictionaries now, keep the language selection boundary explicit, and defer the visible settings UI/persistence wiring until the account settings page exists.`
- Closeout note: `Completed as Frontend Chinese UI Copy Baseline on 2026-05-10. The implementation added frontend productLocale runtime boundary with zh/en dictionaries, default Chinese UI chrome for core app surfaces, setLocale/getCurrentLocale support for future Settings wiring, and focused productLocale plus UI-copy smoke validation. Login/Register/Owner admin, visible language switch UI, account persistence, AI response language, backend validation i18n, and user-authored content translation remained out of scope.`

### `slice-003`

- Name: `AI Response Language Preference`
- Why separate: `AI output language may need its own rule because it can follow user preference, current conversation language, note/project content language, or explicit prompt instruction.`
- Current maturity: `not-ready`
- Likely target: `discussion | sprint_candidates`
- Parking trigger: `Wait until product locale and user-authored-content boundaries are clearer.`
- Reopen signal: `AI responses feel inconsistent across Chinese/English usage, or the product needs a setting that controls Sayachan's response language.`

## Open Questions

- What are the first supported product languages: Chinese only, English only, Chinese plus English, or a broader future-ready model?
- Should the app have an explicit language setting, follow browser locale, follow account preference, or infer from recent conversation/user content?
- Where should language preference live: account settings, local device setting, backend user profile, or a frontend-only preference at first?
- Should Sayachan's AI responses follow the product UI locale, the user's latest message language, the note/project content language, or an explicit AI language preference?
- Should user-authored notes, projects, tasks, and chat history ever be translated automatically, or should multilingualization only affect product chrome and generated assistant text?
- Should date/time, day-phase cues, validation messages, empty states, and toast copy be part of the same first locale pass or handled in separate slices?
- Should product copy be authored first in Chinese, English, or a neutral source language before translation?
- How much of Sayachan's companion tone is translatable through string tables, and how much needs locale-specific writing guidance?
- Should i18n support include accessibility labels, aria text, button tooltips, and UI review assertions from the first pass?
- What is the smallest implementation slice that proves the boundary without forcing a full product rewrite?

## Current PMO Judgment

- No prior dedicated PMO record exists for product multilingualization.
- Full multilingualization should stay at discussion level because the main risk is mixing product locale, AI response language, user-authored content, and companion voice into one blurry implementation.
- A narrower first implementation slice is now reasonable: introduce a frontend UI-copy dictionary for tagged/static product text and provide a Chinese UI baseline for friend testing.
- This first slice should include both Chinese and English dictionaries with a small locale-selection boundary so a future user settings page can wire language switching without rewriting the copy layer.
- This first slice should explicitly exclude AI response language, user-authored content translation, backend validation i18n, visible account/settings UI, account-persisted language settings, and broad locale/date formatting beyond existing simple labels.
- The first implementation slice is now complete and discussion_batch_020 is stable as source context.
- Remaining topics are parked future discussion/sprint material rather than active discussion work: pre-auth locale behavior for Login/Register, visible language switching in the future Settings surface, persistence ownership, and AI response language preference.
