const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildArchiveFilter,
  projectTaskCascadeFilter,
  projectTaskReadFilter
} = require('../src/routes/taskRuntimeHelpers');

test('buildArchiveFilter reads archived=true as archived-only semantics', () => {
  assert.deepEqual(buildArchiveFilter('true'), {
    archived: true
  });
});

test('buildArchiveFilter treats non-true values as active-list semantics', () => {
  const filter = buildArchiveFilter('false');

  assert.deepEqual(filter, {
    archived: { $ne: true }
  });
  assert.equal('status' in filter, false);
});

test('projectTaskReadFilter uses canonical project provenance only', () => {
  const filter = projectTaskReadFilter('project-7');

  assert.deepEqual(filter, {
    originModule: 'project',
    originId: 'project-7'
  });
  assert.equal('linkedProjectId' in filter, false);
});

test('projectTaskCascadeFilter uses canonical project provenance only', () => {
  const filter = projectTaskCascadeFilter('project-9');

  assert.deepEqual(filter, {
    originModule: 'project',
    originId: 'project-9'
  });
  assert.equal('linkedProjectId' in filter, false);
});

test('project task read and cascade filters stay aligned on canonical provenance semantics', () => {
  assert.deepEqual(
    projectTaskReadFilter('project-11'),
    projectTaskCascadeFilter('project-11')
  );
});
