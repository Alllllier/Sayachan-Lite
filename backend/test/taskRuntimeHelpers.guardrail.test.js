const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildArchiveFilter,
  projectTaskCascadeFilter,
  projectTaskReadFilter
} = require('../dist/services/taskRuntimeHelpers');

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
  const filter = projectTaskReadFilter('000000000000000000000207');

  assert.deepEqual(filter, {
    originModule: 'project',
    originId: '000000000000000000000207'
  });
  assert.equal('linkedProjectId' in filter, false);
});

test('projectTaskCascadeFilter uses canonical project provenance only', () => {
  const filter = projectTaskCascadeFilter('000000000000000000000209');

  assert.deepEqual(filter, {
    originModule: 'project',
    originId: '000000000000000000000209'
  });
  assert.equal('linkedProjectId' in filter, false);
});

test('project task read and cascade filters stay aligned on canonical provenance semantics', () => {
  assert.deepEqual(
    projectTaskReadFilter('0000000000000000000002011'),
    projectTaskCascadeFilter('0000000000000000000002011')
  );
});
