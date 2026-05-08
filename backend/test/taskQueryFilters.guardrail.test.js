import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildArchiveFilter
} from '../dist/services/queryFilters.js';

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
