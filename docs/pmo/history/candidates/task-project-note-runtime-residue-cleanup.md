# Archived Candidate Record

## Original Candidate

### `Task Project Note Runtime Residue Cleanup`

- Status at archive time: `completed`
- Original source reference: `state/discussions/discussion_batch_008.md`
- Why it mattered: `The main simplification sprint had landed, but several narrow runtime residues were still explicitly judged unnecessary in an early-stage personal codebase. A bounded cleanup slice was needed so those compatibility tails did not fossilize into the cleaned runtime.`
- Expected outcome at the time: `The runtime would become materially cleaner by removing the now-unnecessary `status='archived'` compatibility chain, retiring `Note.status`, and deleting the remaining route-level project-task legacy tolerances that were no longer justified once canonical provenance writes had long been stable.`
- In scope at the time:
  - remove the legacy archived-task compatibility chain from query, normalization, and restore handling
  - retire `Note.status` so note archive semantics are expressed through `note.archived`
  - remove route-level tolerance for legacy `linkedProjectId` rows
  - remove project archive/restore tolerance for `origin-only` legacy rows
  - keep validation focused on preserving the cleaned runtime behavior after these removals
- Out of scope at the time:
  - larger backend test architecture buildout
  - frontend/browser validation baseline work
  - repo-native UI review repair
  - new product behavior or relationship-model design
- Dependencies at the time: `Stable post-refactor runtime from Task Project Note Simplification Refactor plus explicit residue judgments captured in discussion_batch_008.`
- Risk level at the time: `medium`
- Readiness at the time: `ready`
- Archived because: `Candidate surface needed space for newer backend testing work after runtime residue cleanup had already completed and been preserved in discussion_batch_008 plus the archived execution report.`

## Closeout Snapshot

- Completed on: `2026-04-20`
- Outcome summary: `The slice removed the legacy archived-task compatibility chain, retired Note.status, removed route-level tolerance for legacy linkedProjectId and origin-only project residue, updated backend tests to reflect the canonical runtime shape, and synced backend/runtime baselines.`
- Remaining broader topic: `Testing/validation baseline work remained intentionally outside this sprint and continued in discussion_batch_008.`
