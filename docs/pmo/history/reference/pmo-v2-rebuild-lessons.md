# PMO v2 Rebuild Lessons

This note preserves the durable lessons from the PMO v2 rebuild.
It is not part of the active runtime surface.
It exists so the repo can be cleaned later without losing the reasoning that shaped the new PMO.

## Why PMO v2 Happened

- The original goal was not to build a universal PMO product.
- The original goal was to make Sayachan's own PMO clearer and more stable.
- The old PMO had real working value, but it had grown through multiple phases and mixed too many layers together.
- Early documents acted as scaffolding and naturally carried more mixed semantics.
- Later runtime artifacts like state cards, workflows, handoff surfaces, and reports were much clearer and should be preserved.

## The Most Important Structural Lesson

The main source of confusion was not "too many documents." The main source of confusion was that different semantic layers were mixed into the same files and directories.

The five-layer model that proved useful was:

- `Runtime State`
- `Protocol`
- `Policy`
- `Baseline / Truth`
- `History / Knowledge`

This model should be treated as a reading and design aid, not as a reason to over-engineer the repo.

## What We Learned About The Old PMO

- The old PMO was not "wrong"; it was an evolutionary system.
- The most mixed documents tended to be early, high-level operating notes and guides.
- The most stable documents tended to be later state and workflow surfaces.
- `guides/` was often acting as an implicit policy layer.
- `architecture/` often mixed truth with contract-like warnings.
- `ai-ops/` had the right high-level intention, but never got a stable runtime-to-knowledge sync chain.

## Why Universal PMO Work Was Stopped

- A host-agnostic, cross-project PMO is much more expensive than a project-specific PMO cleanup.
- That exploration was still useful because it forced the system boundaries into the open.
- The universal PMO branch produced valuable concepts, but the productization target exceeded the actual need.
- The useful outcome was not a generic PMO package. The useful outcome was a much clearer model for rebuilding Sayachan's PMO.

## Durable Rules That Came Out Of The Rebuild

- `decision_log` should only hold durable planning rules and durable planning decisions.
- Ordinary candidate re-validation should not go into `decision_log`.
- `candidate drafting` is not the same thing as `candidate confirmation`.
- `sprint selection` remains human-gated unless explicitly delegated.
- `discussion` should preserve possible slices under a theme instead of forcing early flattening.
- `discussion` should allow low-pressure shaping before promotion.
- `discussion` works better when stable judgments are written back during the conversation, not only after the conversation.
- `execution_task` and `execution_report` should live in the state surface, not in legacy inbox/outbox paths.
- `documentation sync` should be PMO-owned and attached to closeout, not maintained as a floating guide.

## What Counts As Canonical Now

The active PMO runtime surface is:

- `docs/pmo/state/**`
- `docs/pmo/protocols/**`
- `docs/pmo/policies/**`
- `docs/pmo/baselines/**`
- `docs/pmo/history/**`

The old PMO is now legacy reference under:

- `docs/_legacy_pmo/**`

## Execution-Layer Lesson

- `CLAUDE.md` is not the owner of PMO rules.
- It is an execution-entry companion document.
- PMO owns runtime, protocol, policy, and documentation-sync logic.
- `CLAUDE.md` should only point execution threads toward canonical PMO entrypoints and behavior-sensitive docs.

## AI-Ops Lesson

- `ai-ops` should not be treated as "completed but ignored."
- Its real missing piece is a sync chain from PMO runtime into longer-lived knowledge and collaboration assets.
- During PMO v2 stabilization, `ai-ops` should remain a weak sync surface.
- Later, it should be redesigned intentionally instead of being slowly patched.

## Discussion Lesson

- A good PMO discussion is not only about moving fast from theme to candidate.
- A good PMO discussion records first, shapes gently, preserves slices, and only promotes when the direction is actually stable.
- If discussion starts feeling like task compression instead of product thinking, the flow should slow down before promotion.

## What This Note Is For

Use this note when:

- cleaning historical working directories
- explaining why PMO v2 looks the way it does
- revisiting future PMO changes
- deciding whether an old pattern should be revived or left behind

Do not use this note as an active operating manual.
