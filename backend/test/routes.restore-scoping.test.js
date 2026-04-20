const test = require('node:test');
const assert = require('node:assert/strict');

const Task = require('../src/models/Task');
const routes = require('../src/routes/index.js');

test('restoreTasks keeps canonical project scope when reading archived tasks', async () => {
  const originalFind = Task.find;
  let capturedQuery = null;

  Task.find = async (query) => {
    capturedQuery = query;
    return [];
  };

  try {
    const modifiedCount = await routes.__test__.restoreTasks({
      originModule: 'project',
      originId: 'project-1'
    });

    assert.equal(modifiedCount, 0);
    assert.deepEqual(capturedQuery, {
      $and: [
        {
          originModule: 'project',
          originId: 'project-1'
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
