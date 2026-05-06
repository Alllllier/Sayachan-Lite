const test = require('node:test');
const assert = require('node:assert/strict');

const Task = require('../dist/models/Task');
const { restoreTasks } = require('../dist/domain/tasks/cascade');

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
