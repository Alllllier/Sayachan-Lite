const test = require('node:test');
const assert = require('node:assert/strict');

const Task = require('../src/models/Task');
const routes = require('../src/routes/index.js');

test('restoreTasks keeps caller scope when adding archived-task matching', async () => {
  const originalFind = Task.find;
  let capturedQuery = null;

  Task.find = async (query) => {
    capturedQuery = query;
    return [];
  };

  try {
    const modifiedCount = await routes.__test__.restoreTasks({
      $or: [
        { linkedProjectId: 'project-1' },
        { originId: 'project-1' }
      ]
    });

    assert.equal(modifiedCount, 0);
    assert.deepEqual(capturedQuery, {
      $and: [
        {
          $or: [
            { linkedProjectId: 'project-1' },
            { originId: 'project-1' }
          ]
        },
        {
          $or: [
            { archived: true },
            { status: 'archived' }
          ]
        }
      ]
    });
  } finally {
    Task.find = originalFind;
  }
});
