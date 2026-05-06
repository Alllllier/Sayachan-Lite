const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildArchiveFilter,
  projectTaskRelationFilter
} = require('../dist/services/tasks/queryFilters');

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

test('projectTaskRelationFilter uses canonical project provenance only', () => {
  const filter = projectTaskRelationFilter('000000000000000000000207');

  assert.deepEqual(filter, {
    originModule: 'project',
    originId: '000000000000000000000207'
  });
  assert.equal('linkedProjectId' in filter, false);
});
