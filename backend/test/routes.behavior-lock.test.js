const test = require('node:test');
const assert = require('node:assert/strict');

const Note = require('../src/models/Note');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const routes = require('../src/routes/index.js');

function getRouteHandler(method, path) {
  const layer = routes.stack.find((entry) => entry.path === path && entry.methods.includes(method));
  if (!layer) {
    throw new Error(`Route not found: ${method} ${path}`);
  }
  return layer.stack[0];
}

function createCtx({ query = {}, params = {}, body = {} } = {}) {
  return {
    query,
    params,
    request: { body },
    status: 200,
    body: undefined
  };
}

function createDoc(data) {
  return {
    ...data,
    toObject() {
      return { ...data };
    }
  };
}

function hasClause(query, predicate) {
  if (!query || typeof query !== 'object') {
    return false;
  }

  if (predicate(query)) {
    return true;
  }

  return Object.values(query).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => hasClause(entry, predicate));
    }

    return hasClause(value, predicate);
  });
}

function withPatchedMethods(patches, run) {
  const originals = patches.map(({ target, key }) => ({ target, key, value: target[key] }));

  for (const { target, key, value } of patches) {
    target[key] = value;
  }

  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const original of originals) {
        original.target[original.key] = original.value;
      }
    });
}

test('note archive cascades only note-origin tasks and preserves lifecycle semantics', async () => {
  const archiveHandler = getRouteHandler('PUT', '/notes/:id/archive');
  const ctx = createCtx({ params: { id: 'note-1' } });
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Note,
      key: 'findByIdAndUpdate',
      value: async () => createDoc({ _id: 'note-1', title: 'Sprint Note', status: 'active', archived: true })
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        capturedQuery = query;

        return [
          createDoc({ _id: 'task-active', status: 'active', archived: false, completed: false }),
          createDoc({ _id: 'task-completed', status: 'completed', archived: false, completed: true })
        ];
      }
    },
    {
      target: Task,
      key: 'bulkWrite',
      value: async (ops) => {
        bulkOps = ops;
        return { modifiedCount: 2 };
      }
    }
  ], async () => {
    await archiveHandler(ctx, async () => {});
  });

  assert.equal(ctx.status, 200);
  assert.equal(ctx.body.archived, true);
  assert.equal(ctx.body.status, 'active');
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originId === 'note-1' && clause.originModule === 'note'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived && clause.archived.$ne === true),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.status === 'archived'),
    false
  );
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.update),
    [
      { archived: true, status: 'active', completed: false },
      { archived: true, status: 'completed', completed: true }
    ]
  );
});

test('note restore restores note-origin tasks and keeps completed tasks completed', async () => {
  const restoreHandler = getRouteHandler('PUT', '/notes/:id/restore');
  const ctx = createCtx({ params: { id: 'note-1' } });
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Note,
      key: 'findByIdAndUpdate',
      value: async () => createDoc({ _id: 'note-1', title: 'Sprint Note', status: 'active', archived: false })
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        capturedQuery = query;

        return [
          createDoc({ _id: 'task-active', status: 'active', archived: true, completed: false }),
          createDoc({ _id: 'task-legacy', status: 'archived', archived: false, completed: true })
        ];
      }
    },
    {
      target: Task,
      key: 'bulkWrite',
      value: async (ops) => {
        bulkOps = ops;
        return { modifiedCount: 2 };
      }
    }
  ], async () => {
    await restoreHandler(ctx, async () => {});
  });

  assert.equal(ctx.status, 200);
  assert.equal(ctx.body.archived, false);
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originId === 'note-1' && clause.originModule === 'note'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived === true),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.status === 'archived'),
    true
  );
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.update),
    [
      { archived: false, status: 'active', completed: false },
      { archived: false, status: 'completed', completed: true }
    ]
  );
});

test('project archive uses the current union boundary and clears focus', async () => {
  const archiveHandler = getRouteHandler('PUT', '/projects/:id/archive');
  const ctx = createCtx({ params: { id: 'project-1' } });
  const project = createDoc({
    _id: 'project-1',
    name: 'Alpha',
    status: 'in_progress',
    archived: true,
    currentFocusTaskId: 'task-focus'
  });
  const projectUpdates = [];
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Project,
      key: 'findByIdAndUpdate',
      value: async (id, update) => {
        projectUpdates.push({ id, update });
        return project;
      }
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        capturedQuery = query;

        return [
          createDoc({ _id: 'task-linked', status: 'active', archived: false, completed: false }),
          createDoc({ _id: 'task-origin-only', status: 'completed', archived: false, completed: true })
        ];
      }
    },
    {
      target: Task,
      key: 'bulkWrite',
      value: async (ops) => {
        bulkOps = ops;
        return { modifiedCount: 2 };
      }
    }
  ], async () => {
    await archiveHandler(ctx, async () => {});
  });

  assert.equal(ctx.body.archived, true);
  assert.equal(project.currentFocusTaskId, null);
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.linkedProjectId === 'project-1'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originId === 'project-1'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived && clause.archived.$ne === true),
    true
  );
  assert.deepEqual(projectUpdates, [
    { id: 'project-1', update: { archived: true } },
    { id: 'project-1', update: { currentFocusTaskId: null } }
  ]);
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.filter._id),
    ['task-linked', 'task-origin-only']
  );
});

test('project restore restores both linked and origin-only tasks while keeping lifecycle state', async () => {
  const restoreHandler = getRouteHandler('PUT', '/projects/:id/restore');
  const ctx = createCtx({ params: { id: 'project-1' } });
  let bulkOps = null;
  let findByIdCalls = 0;

  await withPatchedMethods([
    {
      target: Project,
      key: 'findById',
      value: async () => {
        findByIdCalls += 1;
        return createDoc({ _id: 'project-1', name: 'Alpha', status: 'completed', archived: true });
      }
    },
    {
      target: Project,
      key: 'findByIdAndUpdate',
      value: async (id, update) => {
        assert.equal(id, 'project-1');
        assert.deepEqual(update, { archived: false, status: 'completed' });
        return createDoc({ _id: 'project-1', name: 'Alpha', status: 'completed', archived: false });
      }
    },
    {
      target: Task,
      key: 'find',
      value: async () => ([
        createDoc({ _id: 'task-linked', status: 'active', archived: true, completed: false }),
        createDoc({ _id: 'task-origin-only', status: 'completed', archived: true, completed: true })
      ])
    },
    {
      target: Task,
      key: 'bulkWrite',
      value: async (ops) => {
        bulkOps = ops;
        return { modifiedCount: 2 };
      }
    }
  ], async () => {
    await restoreHandler(ctx, async () => {});
  });

  assert.equal(findByIdCalls, 1);
  assert.equal(ctx.body.archived, false);
  assert.equal(ctx.body.status, 'completed');
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.update),
    [
      { archived: false, status: 'active', completed: false },
      { archived: false, status: 'completed', completed: true }
    ]
  );
});

test('task listing with projectId follows canonical project-origin reads while tolerating legacy linked rows', async () => {
  const listHandler = getRouteHandler('GET', '/tasks');
  const ctx = createCtx({ query: { projectId: 'project-7' } });
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: (query) => {
        capturedQuery = query;
        return {
          sort: async () => [
            createDoc({ _id: 'task-linked', title: 'Visible task', linkedProjectId: 'project-7', status: 'active', archived: false })
          ]
        };
      }
    }
  ], async () => {
    await listHandler(ctx, async () => {});
  });

  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived && clause.archived.$ne === true),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originModule === 'project' && clause.originId === 'project-7'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.linkedProjectId === 'project-7'),
    true
  );
  assert.deepEqual(ctx.body.map((task) => task._id), ['task-linked']);
});

test('completing a focused canonical project task clears project focus', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const ctx = createCtx({
    params: { id: 'task-1' },
    body: { completed: true, status: 'completed' }
  });
  const projectUpdates = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'findById',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        status: 'active',
        archived: false,
        completed: false,
        linkedProjectId: 'project-1',
        originId: 'project-1',
        originModule: 'project'
      })
    },
    {
      target: Task,
      key: 'findByIdAndUpdate',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        status: 'completed',
        archived: false,
        completed: true,
        linkedProjectId: 'project-1',
        originId: 'project-1',
        originModule: 'project'
      })
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => createDoc({ _id: 'project-1', name: 'Alpha', currentFocusTaskId: 'task-1' })
    },
    {
      target: Project,
      key: 'findByIdAndUpdate',
      value: async (id, update) => {
        projectUpdates.push({ id, update });
      }
    }
  ], async () => {
    await updateHandler(ctx, async () => {});
  });

  assert.equal(ctx.body.status, 'completed');
  assert.deepEqual(projectUpdates, [
    { id: 'project-1', update: { currentFocusTaskId: null } }
  ]);
});

test('archiving or deleting a focused project-owned task clears project focus symmetrically', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const deleteHandler = getRouteHandler('DELETE', '/tasks/:id');
  const archiveCtx = createCtx({
    params: { id: 'task-1' },
    body: { archived: true }
  });
  const deleteCtx = createCtx({ params: { id: 'task-1' } });
  const projectUpdates = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'findById',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        status: 'active',
        archived: false,
        completed: false,
        originModule: 'project',
        originId: 'project-1'
      })
    },
    {
      target: Task,
      key: 'findByIdAndUpdate',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        status: 'active',
        archived: true,
        completed: false,
        originModule: 'project',
        originId: 'project-1'
      })
    },
    {
      target: Task,
      key: 'findByIdAndDelete',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        originModule: 'project',
        originId: 'project-1'
      })
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => createDoc({ _id: 'project-1', name: 'Alpha', currentFocusTaskId: 'task-1' })
    },
    {
      target: Project,
      key: 'findByIdAndUpdate',
      value: async (id, update) => {
        projectUpdates.push({ id, update });
      }
    }
  ], async () => {
    await updateHandler(archiveCtx, async () => {});
    await deleteHandler(deleteCtx, async () => {});
  });

  assert.equal(archiveCtx.body.archived, true);
  assert.equal(deleteCtx.status, 204);
  assert.deepEqual(projectUpdates, [
    { id: 'project-1', update: { currentFocusTaskId: null } },
    { id: 'project-1', update: { currentFocusTaskId: null } }
  ]);
});

test('legacy archived task rows are treated as archived and restore to bounded lifecycle fallbacks', async () => {
  const listHandler = getRouteHandler('GET', '/tasks');
  const ctx = createCtx({ query: { archived: 'true' } });
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: (query) => {
        capturedQuery = query;

        return {
          sort: async () => [
            createDoc({ _id: 'legacy-task', title: 'Legacy archived', status: 'archived', archived: false, completed: false })
          ]
        };
      }
    }
  ], async () => {
    await listHandler(ctx, async () => {});
  });

  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived === true),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.status === 'archived'),
    true
  );
  assert.deepEqual(ctx.body, [
    {
      _id: 'legacy-task',
      title: 'Legacy archived',
      status: 'active',
      archived: true,
      completed: false
    }
  ]);
});

test('restoring a legacy archived task normalizes persisted state so later default task reads can see it', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const listHandler = getRouteHandler('GET', '/tasks');
  const updateCtx = createCtx({
    params: { id: 'legacy-task' },
    body: { archived: false }
  });
  const listCtx = createCtx();
  const findCalls = [];
  let updatePayload = null;

  await withPatchedMethods([
    {
      target: Task,
      key: 'findById',
      value: async () => createDoc({
        _id: 'legacy-task',
        title: 'Legacy archived',
        status: 'archived',
        archived: false,
        completed: false
      })
    },
    {
      target: Task,
      key: 'findByIdAndUpdate',
      value: async (_id, update) => {
        updatePayload = update;
        return createDoc({
          _id: 'legacy-task',
          title: 'Legacy archived',
          status: update.status,
          archived: update.archived,
          completed: update.completed
        });
      }
    },
    {
      target: Task,
      key: 'find',
      value: (query) => {
        findCalls.push(query);
        return {
          sort: async () => [
            createDoc({
              _id: 'legacy-task',
              title: 'Legacy archived',
              status: 'active',
              archived: false,
              completed: false
            })
          ]
        };
      }
    }
  ], async () => {
    await updateHandler(updateCtx, async () => {});
    await listHandler(listCtx, async () => {});
  });

  assert.deepEqual(updatePayload, {
    archived: false,
    status: 'active',
    completed: false
  });
  assert.equal(updateCtx.body.archived, false);
  assert.equal(updateCtx.body.status, 'active');
  assert.equal(updateCtx.body.completed, false);
  assert.deepEqual(listCtx.body.map((task) => task._id), ['legacy-task']);
  assert.equal(
    hasClause(findCalls[0], (clause) => clause.status === 'archived'),
    false
  );
});
