import test from 'node:test';
import assert from 'node:assert/strict';

import Task from '../dist/models/Task.js';
import { restoreTasks } from '../dist/services/cascadeService.js';

test('restoreTasks keeps canonical project scope when reading archived tasks', async () => {
  const originalFind = Task.find;
  let capturedQuery = null;

  Task.find = async (query) => {
    capturedQuery = query;
    return [];
  };

  try {
    const modifiedCount = await restoreTasks(Task, {
      originModule: 'project',
      originId: '000000000000000000000201'
    });

    assert.equal(modifiedCount, 0);
    assert.deepEqual(capturedQuery, {
      $and: [
        {
          originModule: 'project',
          originId: '000000000000000000000201'
        },
        {
          archived: true
        }
      ]
    });
  } finally {
    Task.find = originalFind;
  }
});
