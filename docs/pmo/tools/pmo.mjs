#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultPmoRoot = resolve(scriptDir, '..');

function usage() {
  return `PMO helper

Usage:
  node docs/pmo/tools/pmo.mjs --help
  node docs/pmo/tools/pmo.mjs activate --sprint "<name>" --selected-by "Human|Codex" [--date YYYY-MM-DD] [--dry-run]
  node docs/pmo/tools/pmo.mjs activate --micro-fix "<name>" --goal "<goal>" [--date YYYY-MM-DD] [--dry-run]
  node docs/pmo/tools/pmo.mjs closeout --sprint "<name>" --delivery-status "<status>" --doc-sync "<outcome>" --commit-state "<state>" [--residual-note "..."] [--date YYYY-MM-DD] [--dry-run]
  node docs/pmo/tools/pmo.mjs idle-reset --last-sprint "<name>" --delivery-status "<status>" --report-surface "<path>" [--date YYYY-MM-DD] [--dry-run]

Options:
  --dry-run              Print planned writes without changing files.
  --pmo-root "<path>"    Use a different PMO root for tests or fixtures.
`;
}

function parseArgs(argv) {
  const args = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    if (key === 'dry-run' || key === 'help') {
      args[key] = true;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      fail(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }

  return args;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fail(message) {
  console.error(`PMO helper error: ${message}`);
  process.exit(1);
}

function requireArg(args, key) {
  const value = args[key];
  if (!value) {
    fail(`Missing required --${key}`);
  }
  return value;
}

function pathFor(root, path) {
  return resolve(root, path);
}

function read(root, path) {
  const absolute = pathFor(root, path);
  if (!existsSync(absolute)) {
    fail(`Missing required file: ${absolute}`);
  }
  return readFileSync(absolute, 'utf8');
}

function writePlan(path, content) {
  return { path, content };
}

function applyWrites(root, writes, dryRun) {
  for (const write of writes) {
    const absolute = pathFor(root, write.path);
    if (dryRun) {
      console.log(`--- DRY RUN: ${write.path}`);
      console.log(write.content.trimEnd());
      console.log('');
      continue;
    }
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, ensureTrailingNewline(write.content), 'utf8');
    console.log(`wrote ${relative(process.cwd(), absolute)}`);
  }
}

function ensureTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'pmo-entry';
}

function normalizeHeading(value) {
  return value.replace(/`/g, '').trim().toLowerCase();
}

function findCandidate(content, sprintName) {
  const regex = /^###\s+`?(.+?)`?\s*$/gm;
  const headings = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    headings.push({
      name: match[1].trim(),
      start: match.index,
      contentStart: regex.lastIndex,
    });
  }

  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    if (normalizeHeading(heading.name) !== normalizeHeading(sprintName)) {
      continue;
    }
    const end = headings[i + 1]?.start ?? content.length;
    return {
      name: heading.name,
      start: heading.start,
      end,
      block: content.slice(heading.start, end).trimEnd(),
    };
  }

  return null;
}

function parseCandidateFields(block) {
  const fields = {};
  const lines = block.split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    const field = line.match(/^- ([^:]+):\s*(.*)$/);
    if (field) {
      current = field[1].trim();
      fields[current] = field[2].trim();
      continue;
    }
    if (current && (line.startsWith('  ') || line.trim() === '')) {
      fields[current] = `${fields[current]}\n${line}`.trimEnd();
    }
  }

  return fields;
}

function replaceCandidateBlock(content, candidate, nextBlock) {
  const after = content.slice(candidate.end).replace(/^\n+/, '');
  const separator = after.trim() ? '\n\n' : '\n';
  return `${content.slice(0, candidate.start)}${nextBlock.trimEnd()}${separator}${after}`;
}

function removeCandidateBlock(content, candidate) {
  const before = content.slice(0, candidate.start).replace(/\s+$/, '\n\n');
  const after = content.slice(candidate.end).replace(/^\n+/, '');
  let next = `${before}${after}`.replace(/\n{3,}/g, '\n\n').trimEnd();
  const currentCandidates = next.match(/## Current Candidates\s*([\s\S]*)$/);
  if (currentCandidates && !/^###\s+/m.test(currentCandidates[1])) {
    next = next.replace(/## Current Candidates\s*[\s\S]*$/m, '## Current Candidates\n\nNo current candidate is ready for human selection.');
  }
  return ensureTrailingNewline(next);
}

function markCandidateActive(block) {
  if (/^- Status:/m.test(block)) {
    return block.replace(/^- Status:.*$/m, '- Status: `active`');
  }
  return block.replace(/\n/, '\n\n- Status: `active`\n');
}

function bulletBlock(value, fallback) {
  const text = (value || fallback || '').trim();
  if (!text) {
    return '- none specified';
  }
  if (text.startsWith('- ') || text.includes('\n  - ')) {
    return text;
  }
  return `- ${text}`;
}

function inline(value, fallback = '') {
  return (value || fallback || '').replace(/^`|`$/g, '').trim();
}

function activeCurrentSprint({ sprint, date, selectedBy, type, goal, source, candidateSource, related }) {
  return `# Current Sprint

- Sprint: \`${sprint}\`
- Status: \`active\`
- Phase: \`handed-off\`
- PMO owner: \`Codex\`
- Architecture owner: \`Human\`
- Execution owner: \`execution worker\`
- Last updated: \`${date}\`

## Current State

- Type: \`${type}\`
- Goal: \`${goal}\`
- Source: \`${source}\`
- Active handoff: \`docs/pmo/state/execution_task.md\`
- Execution report target: \`docs/pmo/state/execution_report.md\`

## Activation Snapshot

- Selected by: \`${selectedBy}\`
- Selection date: \`${date}\`
- Candidate source: \`${candidateSource || 'none'}\`
- Related discussion, backlog, or decision entries: \`${related || 'none'}\`

## PMO Boundary

- Detailed worker scope lives in \`execution_task.md\`
- Candidate comparison details remain in \`sprint_candidates.md\` when applicable
- This file should stay a lightweight runtime card, not a second execution brief

## Next PMO Action

- wait for execution return in \`execution_report.md\`
- close out, route follow-up, and reset runtime state when execution is accepted
`;
}

function executionTaskFromCandidate({ sprint, date, fields }) {
  const source = inline(fields['Source reference'], 'none');
  const expectedOutcome = inline(fields['Expected outcome'], 'Deliver the selected sprint outcome.');

  return `# Execution Task

- Status: \`active\`
- Sprint: \`${sprint}\`
- Last updated: \`${date}\`

## Worker Boot Rule

- Before executing, read \`AGENT.md\` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from \`sprint_candidates.md\`, \`idea_backlog.md\`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source: \`${source}\`
- Related discussion batch: \`${source.includes('discussion') ? source : 'none specified'}\`
- Related backlog or decision entries: \`${source.includes('decision') || source.includes('backlog') ? source : 'none specified'}\`

## Objective

- ${expectedOutcome}

## Safe Touch Zones

${bulletBlock(fields['In scope'], 'Use the selected candidate in-scope list.')}

## Execution Slices

- PMO sharpening slot: replace this line with ordered execution slices when sequence, ownership, or risk deserves explicit guidance.
- If this section is not expanded before handoff, execute the candidate as the smallest behavior-preserving change that satisfies the objective and safe touch zones.

## Boundary Notes

- PMO sharpening slot: name any important module, route, service, API, UI, or documentation ownership boundary that should guide implementation.
- Keep this sprint inside the safe touch zones and non-goals unless PMO explicitly updates this handoff.

## Non-Goals

${bulletBlock(fields['Out of scope'], 'Do not expand beyond the selected candidate.')}

## Deferred Or Parked Follow-Up

- Keep any out-of-scope future work out of this sprint.
- PMO should route durable follow-up into \`idea_backlog.md\` or \`decision_log.md\` during closeout when needed.

## Acceptance Checks

- Deliver the expected outcome from the selected candidate.
- Preserve the explicit non-goals above.
- PMO sharpening slot: add any behavior, API, UI, migration, or documentation checks that are specific enough to protect this sprint.
- Report any skipped or incomplete in-scope item before PMO closeout.

## Validation Expectations

- Run validation appropriate to the selected candidate risk level: \`${inline(fields['Risk level'], 'not specified')}\`.
- PMO sharpening slot: replace or extend this with concrete commands, target test files, browser review surfaces, or intentionally skipped validation.
- Report project-specific review expectations and whether they were performed.
- If browser validation or UI review is relevant, state the reviewed surfaces or page states.

## Out-Of-Scope Confirmation

- The worker report should explicitly confirm that the non-goals stayed out of scope.
- PMO sharpening slot: name any high-risk adjacent areas that should be called out one by one in the report.

## Escalation Points

- Stop and return to PMO/human review if execution would cross an explicit non-goal.
- Stop and return to PMO/human review if dependencies are missing: \`${inline(fields['Dependencies'], 'none specified')}\`.
- Stop and return to PMO/human review if the candidate readiness no longer holds: \`${inline(fields['Readiness'], 'not specified')}\`.

## Completion Report Contract

Write the execution report to \`docs/pmo/state/execution_report.md\`.

The execution report should state:

- what was delivered
- what validation was performed
- whether the PMO sharpening slots above were followed, revised, or intentionally left generic
- what remains unverified
- what risks or escalations remain
`;
}

function executionTaskForMicroFix({ sprint, goal, date }) {
  return `# Execution Task

- Status: \`active\`
- Sprint: \`${sprint}\`
- Last updated: \`${date}\`

## Worker Boot Rule

- Before executing, read \`AGENT.md\` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from \`sprint_candidates.md\`, \`idea_backlog.md\`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source: \`micro-fix direct activation\`
- Related discussion batch: \`none\`
- Related backlog or decision entries: \`none specified\`

## Objective

- ${goal}

## Safe Touch Zones

- Touch only the files needed for this bounded micro-fix.

## Execution Slices

- PMO sharpening slot: replace this line only if the micro-fix needs an explicit sequence.
- Otherwise keep the fix as one bounded implementation pass.

## Boundary Notes

- PMO sharpening slot: name any adjacent files, systems, or behavior that must stay untouched.

## Non-Goals

- Do not expand into adjacent refactors or broader PMO/process changes unless PMO explicitly updates this handoff.

## Deferred Or Parked Follow-Up

- Route any newly discovered larger follow-up into PMO after closeout.

## Acceptance Checks

- Implement only the stated micro-fix goal.
- PMO sharpening slot: add the smallest concrete behavior check that proves the micro-fix worked.
- Report validation performed and any unverified area.

## Validation Expectations

- Run the lightest validation that can catch the likely regression.
- PMO sharpening slot: name the exact command or manual check when it is obvious.
- State if validation is skipped and why that is acceptable.

## Out-Of-Scope Confirmation

- The worker report should explicitly confirm that no adjacent refactor or broader PMO/process change was included.
- PMO sharpening slot: name any tempting adjacent cleanup that must remain deferred.

## Escalation Points

- Stop and return to PMO/human review if the fix is no longer small or boundary-clear.

## Completion Report Contract

Write the execution report to \`docs/pmo/state/execution_report.md\`.

The execution report should state:

- what was delivered
- what validation was performed
- whether the PMO sharpening slots above were followed, revised, or intentionally left generic
- what remains unverified
- what risks or escalations remain
`;
}

function extractSection(content, names) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const regex = /^##\s+(.+?)\s*$/gm;
  const headings = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    headings.push({
      name: match[1].trim(),
      start: match.index,
      contentStart: regex.lastIndex,
    });
  }

  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    if (!wanted.has(heading.name.toLowerCase())) {
      continue;
    }
    const end = headings[i + 1]?.start ?? content.length;
    return content.slice(heading.contentStart, end).trim();
  }

  return '';
}

function reportArchive({ sprint, date, deliveryStatus, docSync, report }) {
  const delivered = extractSection(report, ['Delivered', 'Delivered Changes', 'Files changed']) || 'See source execution report.';
  const validation = [
    extractSection(report, ['Validation Layers Performed', 'Validation', 'Validation Performed', 'Browser validation', 'Browser Validation']),
    extractSection(report, ['Unit/build validation', 'Unit And Build Validation']),
  ].filter(Boolean).join('\n\n') || 'See source execution report.';
  const projectReview = extractSection(report, ['Project-Specific Review', 'Actual UI review', 'Actual UI Review', 'UI Review Status']) || 'Not separately stated.';
  const unverified = extractSection(report, ['Unverified Areas', 'Unverified areas']) || 'Not separately stated.';
  const risks = extractSection(report, ['Residual Risks', 'Risks or follow-ups', 'Risks Or Follow-Ups']) || 'Not separately stated.';
  const followUp = extractSection(report, ['Escalations Or Decisions Needed', 'Documentation sync notes', 'Documentation sync notes']) || 'Not separately stated.';

  return `# ${sprint}

- Archived date: \`${date}\`
- PMO closeout result: \`${deliveryStatus}\`
- Source sprint: \`${sprint}\`
- Source report: \`state/execution_report.md\`
- Delivered summary:
${indentBlock(delivered)}
- Validation summary:
${indentBlock(validation)}
- Project-specific review summary:
${indentBlock(projectReview)}
- Unverified areas:
${indentBlock(unverified)}
- Residual risks or escalations:
${indentBlock(risks)}
- Documentation-sync outcome: \`${docSync}\`
- Follow-up routing:
${indentBlock(followUp)}
`;
}

function candidateArchive({ sprint, date, candidate, fields, deliveryStatus, residualNote }) {
  return `# ${sprint}

- Archived date: \`${date}\`
- Archive reason: \`completed-and-displaced\`
- Original status at exit: \`${inline(fields['Status'], 'active')}\`
- Original source reference: \`${inline(fields['Source reference'], 'none')}\`
- Why it mattered: ${inline(fields['Why now'], 'Not separately stated.')}
- Expected outcome: ${inline(fields['Expected outcome'], 'Not separately stated.')}
- In scope:
${indentBlock(fields['In scope'] || 'Not separately stated.')}
- Out of scope:
${indentBlock(fields['Out of scope'] || 'Not separately stated.')}
- Dependencies: ${inline(fields['Dependencies'], 'Not separately stated.')}
- Closeout summary: \`${deliveryStatus}\`
- Follow-up created from this candidate: \`See execution report archive and PMO closeout routing.\`
- Notes: \`${residualNote || 'Archived by docs/pmo/tools/pmo.mjs during closeout.'}\`
`;
}

function indentBlock(value) {
  return value
    .trim()
    .split(/\r?\n/)
    .map((line) => `  ${line}`)
    .join('\n');
}

function currentSprintIdle({ sprint, date, deliveryStatus, commitState, docSync, residualNote, reportSurface }) {
  return `# Current Sprint

- Sprint: \`idle\`
- Status: \`idle\`
- PMO owner: \`Codex\`
- Architecture owner: \`Human\`
- Execution owner: \`execution worker\`
- Last updated: \`${date}\`

## Current State

- Type: \`idle\`
- Goal: \`No active sprint.\`
- Active handoff: \`none\`

## Last Closed Sprint

- Sprint: \`${sprint}\`
- Closeout date: \`${date}\`
- Delivery status: \`${deliveryStatus}\`
- Commit state: \`${commitState}\`
- Documentation sync outcome: \`${docSync}\`
- Residual note: \`${residualNote || 'none'}\`
- Report surface: \`${reportSurface}\`

## Next PMO Action

- keep \`execution_task.md\` in explicit idle state until a new sprint or micro-fix is activated
- decide whether the next PMO move is a new discussion, a candidate activation, a micro-fix, or archive cleanup
`;
}

function executionTaskIdle({ sprint, date, deliveryStatus, reportSurface }) {
  return `# Execution Task

- Status: \`idle\`
- Sprint: \`idle\`
- Last updated: \`${date}\`

## Current State

There is no active execution handoff right now.

This file should be overwritten only when a new sprint or micro-fix is explicitly activated and handed off into execution.

## Last Closed Sprint

- Sprint: \`${sprint}\`
- Outcome: \`${deliveryStatus}\`
- Report surface: \`${reportSurface}\`

## Next Activation Rule

- wait for explicit human sprint selection or a clearly bounded micro-fix activation before writing a new active execution contract here
`;
}

function executionReportIdle({ sprint, date, deliveryStatus, reportSurface }) {
  return `# Execution Report

- Status: \`idle\`
- Sprint: \`idle\`
- Last updated: \`${date}\`

## Current State

There is no active execution report waiting for PMO review right now.

## Last Closed Report Summary

- Sprint: \`${sprint}\`
- Report outcome: \`${deliveryStatus}\`
- PMO read result: \`accepted and archived to ${reportSurface}\`

## Next Use

The execution worker should replace this placeholder with a structured report that states:

- what was delivered
- what validation was performed
- whether project-specific review was actually needed for this sprint
- what project-specific review was performed or intentionally skipped
- what remains unverified
- what risks or escalations still matter
- what documentation-sync outcome PMO should record during closeout
`;
}

function activate(args, root) {
  const date = args.date || todayIso();
  const selectedBy = args['selected-by'] || 'Human';
  const writes = [];

  if (args.sprint) {
    const sprint = args.sprint;
    const candidates = read(root, 'state/sprint_candidates.md');
    const candidate = findCandidate(candidates, sprint);
    if (!candidate) {
      fail(`Could not find candidate "${sprint}" in state/sprint_candidates.md`);
    }
    const fields = parseCandidateFields(candidate.block);
    const activeBlock = markCandidateActive(candidate.block);
    writes.push(writePlan('state/sprint_candidates.md', replaceCandidateBlock(candidates, candidate, activeBlock)));
    writes.push(writePlan('state/current_sprint.md', activeCurrentSprint({
      sprint,
      date,
      selectedBy,
      type: 'candidate-selected',
      goal: inline(fields['Expected outcome'], 'Selected candidate execution.'),
      source: 'sprint_candidates.md',
      candidateSource: inline(fields['Source reference'], 'state/sprint_candidates.md'),
      related: inline(fields['Source reference'], 'none'),
    })));
    writes.push(writePlan('state/execution_task.md', executionTaskFromCandidate({ sprint, date, fields })));
    applyWrites(root, writes, args['dry-run']);
    return;
  }

  if (args['micro-fix']) {
    const sprint = args['micro-fix'];
    const goal = requireArg(args, 'goal');
    writes.push(writePlan('state/current_sprint.md', activeCurrentSprint({
      sprint,
      date,
      selectedBy,
      type: 'micro-fix',
      goal,
      source: 'micro-fix direct activation',
      candidateSource: 'none',
      related: 'none',
    })));
    writes.push(writePlan('state/execution_task.md', executionTaskForMicroFix({ sprint, goal, date })));
    applyWrites(root, writes, args['dry-run']);
    return;
  }

  fail('activate requires --sprint or --micro-fix');
}

function closeout(args, root) {
  const sprint = requireArg(args, 'sprint');
  const deliveryStatus = requireArg(args, 'delivery-status');
  const docSync = requireArg(args, 'doc-sync');
  const commitState = requireArg(args, 'commit-state');
  const residualNote = args['residual-note'] || '';
  const date = args.date || todayIso();
  const report = read(root, 'state/execution_report.md');

  if (/Status:\s+`idle`/.test(report)) {
    fail('state/execution_report.md is idle; there is no active report to archive');
  }
  if (!report.includes(sprint)) {
    fail(`state/execution_report.md does not appear to describe sprint "${sprint}"`);
  }

  const reportSurface = `docs/pmo/history/reports/${slugify(sprint)}.md`;
  const reportArchivePath = `history/reports/${slugify(sprint)}.md`;
  if (!args['dry-run'] && existsSync(pathFor(root, reportArchivePath))) {
    fail(`Report archive already exists: ${reportArchivePath}`);
  }

  const writes = [
    writePlan(reportArchivePath, reportArchive({ sprint, date, deliveryStatus, docSync, report })),
  ];

  const candidates = read(root, 'state/sprint_candidates.md');
  const candidate = findCandidate(candidates, sprint);
  if (candidate) {
    const fields = parseCandidateFields(candidate.block);
    const candidateArchivePath = `history/candidates/${slugify(sprint)}.md`;
    if (!args['dry-run'] && existsSync(pathFor(root, candidateArchivePath))) {
      fail(`Candidate archive already exists: ${candidateArchivePath}`);
    }
    writes.push(writePlan(candidateArchivePath, candidateArchive({ sprint, date, candidate, fields, deliveryStatus, residualNote })));
    writes.push(writePlan('state/sprint_candidates.md', removeCandidateBlock(candidates, candidate)));
  } else {
    const currentSprint = read(root, 'state/current_sprint.md');
    const isMicroFix = currentSprint.includes('Type: `micro-fix`') || currentSprint.includes('Source: `micro-fix direct activation`');
    if (!isMicroFix) {
      fail(`Could not find candidate "${sprint}" in state/sprint_candidates.md, and current_sprint.md is not an active micro-fix`);
    }
    console.warn(`warning: no candidate named "${sprint}" found; treating closeout as active micro-fix`);
  }

  writes.push(writePlan('state/current_sprint.md', currentSprintIdle({ sprint, date, deliveryStatus, commitState, docSync, residualNote, reportSurface })));
  writes.push(writePlan('state/execution_task.md', executionTaskIdle({ sprint, date, deliveryStatus, reportSurface })));
  writes.push(writePlan('state/execution_report.md', executionReportIdle({ sprint, date, deliveryStatus, reportSurface })));

  applyWrites(root, writes, args['dry-run']);
}

function idleReset(args, root) {
  const sprint = requireArg(args, 'last-sprint');
  const deliveryStatus = requireArg(args, 'delivery-status');
  const reportSurface = requireArg(args, 'report-surface');
  const date = args.date || todayIso();
  const commitState = args['commit-state'] || 'not recorded';
  const docSync = args['doc-sync'] || 'reviewed, no update needed';
  const residualNote = args['residual-note'] || 'none';

  applyWrites(root, [
    writePlan('state/current_sprint.md', currentSprintIdle({ sprint, date, deliveryStatus, commitState, docSync, residualNote, reportSurface })),
    writePlan('state/execution_task.md', executionTaskIdle({ sprint, date, deliveryStatus, reportSurface })),
    writePlan('state/execution_report.md', executionReportIdle({ sprint, date, deliveryStatus, reportSurface })),
  ], args['dry-run']);
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args._[0] === 'help' || !args._[0]) {
  console.log(usage());
  process.exit(0);
}

const root = resolve(args['pmo-root'] || defaultPmoRoot);
const command = args._[0];

if (command === 'activate') {
  activate(args, root);
} else if (command === 'closeout') {
  closeout(args, root);
} else if (command === 'idle-reset') {
  idleReset(args, root);
} else {
  fail(`Unknown command "${command}"`);
}
