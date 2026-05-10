# Frontend Chinese UI Copy Baseline

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_020.md#slice-002`
- Why it mattered: The product currently mixes English UI labels with Chinese usage context, which makes Chinese-only friend testing unnecessarily awkward. The human wants the Android-style tagged-string dictionary layer first, not full multilingualization.
- Expected outcome: Frontend static product UI copy has a small dictionary/translation helper baseline with both Chinese and English dictionaries, Chinese labels available for core surfaces, and an explicit locale-selection boundary that a future user settings page can wire into. Buttons, empty states, placeholders, segment labels, accessible labels, and common shell text should no longer require English comprehension during Chinese friend testing.
- In scope:
  `Add or choose a lightweight frontend UI-copy dictionary boundary; create Chinese and English dictionaries for converted keys; convert obvious static/tagged product UI copy in core app surfaces such as Dashboard, Notes, Projects, Chat shell, shared collection/capture controls, empty states, segmented controls, overflow titles, placeholders, and aria/title labels; expose a small locale-selection boundary that can later connect to user settings; default the current app experience to Chinese-friendly product labels unless PMO/human chooses otherwise; keep the implementation small and local to frontend.`
- Out of scope:
  `No AI response language preference; no translation of user-authored notes/projects/tasks/chat history; no backend validation-message i18n; no visible settings page or account menu work; no backend/account-persisted language preference; no full date/time/locale formatting program; no broad copywriting rewrite beyond replacing current English product labels.`
- Dependencies: `Human acceptance that this is a Chinese-first UI copy baseline for friend testing with an English dictionary kept as the switch-ready counterpart, not a full i18n platform. Worker should inspect current frontend copy before choosing whether a tiny local helper is enough or whether an established lightweight i18n package is justified.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: `Human selects this candidate for activation.
- Validation expectation:
  `Run frontend typecheck/build or the repo-native check path appropriate to touched files; run focused UI review or at minimum manual/browser smoke over Dashboard, Notes, Projects, and Chat shell to verify labels render, controls remain accessible, and text does not overflow on mobile/desktop.`
- Escalation triggers:
  `Stop and ask if implementation pressure expands into AI language behavior, backend error localization, visible account/settings work, browser-locale detection, account persistence, or a product-wide copy rewrite.`
- Follow-up parking:
  `After the first Chinese/English UI-copy baseline, park visible language switching, full product multilingualization, AI response language preference, and persistent language settings back in discussion_batch_020 until the settings page or next real need appears.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
