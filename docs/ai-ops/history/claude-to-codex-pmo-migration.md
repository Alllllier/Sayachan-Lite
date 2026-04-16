# Claude To Codex PMO Migration

This record captures the repository shift from Claude-owned doc maintenance assumptions to PMO-owned architecture governance.

## What Changed

- retired `.docs/**` as canonical architecture source
- retired `.claude/**` as the default doc-maintenance mechanism
- moved architecture truth into `docs/architecture/**`
- moved documentation sync rules into `docs/guides/**`
- installed a neutral repo-owned hook under `.githooks/`
- shifted architecture doc ownership to Codex PMO
- renamed repo-native handoff assets toward execution-neutral naming

## Why It Matters

The repo now treats AI-assisted development workflow as a first-class operating system:

- architecture truth is not execution-owned by default
- PMO review and commit flow are explicit
- policies can evolve separately from sprint state
- skills can grow against shared, reviewable policy instead of ad hoc prompts

## Follow-On Maintenance

Update this history area only for major operating-system changes, such as:

- role split changes
- handoff mechanism redesign
- hook policy redesign
- AI ops directory redesign
