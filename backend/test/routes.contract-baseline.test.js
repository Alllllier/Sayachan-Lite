const test = require('node:test');
const assert = require('node:assert/strict');

const Note = require('../src/models/Note');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const { errorBoundary } = require('../src/middleware/errorBoundary');
const routes = require('../src/routes/index.js');

function getRouteHandler(method, path) {
  const layer = routes.stack.find((entry) => entry.path === path && entry.methods.includes(method));
  if (!layer) {
    throw new Error(`Route not found: ${method} ${path}`);
  }
  return async (ctx, next) => errorBoundary(ctx, async () => {
    let index = -1;
    async function dispatch(position) {
      if (position <= index) {
        throw new Error('next() called multiple times');
      }
      index = position;
      const middleware = layer.stack[position] || next;
      if (middleware) {
        await middleware(ctx, () => dispatch(position + 1));
      }
    }
    await dispatch(0);
  });
}

function createCtx({ query = {}, params = {}, body = {}, userId = '000000000000000000000001' } = {}) {
  const ctx = {
    query,
    params,
    request: { body },
    status: 200,
    body: undefined
  };
  if (userId !== null) {
    ctx.state = { user: { _id: userId, role: 'tester', email: `${userId}@example.com` } };
  }
  return ctx;
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

test('list and filter reads preserve canonical backend semantics for tasks, projects, and notes', async () => {
  const taskListHandler = getRouteHandler('GET', '/tasks');
  const projectListHandler = getRouteHandler('GET', '/projects');
  const noteListHandler = getRouteHandler('GET', '/notes');

  const taskQueries = [];
  const projectQueries = [];
  const noteQueries = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: (query) => {
        taskQueries.push(query);
        return {
          sort: async () => [
            createDoc({
              _id: `task-${taskQueries.length}`,
              title: `Task ${taskQueries.length}`,
              originModule: taskQueries.length >= 3 ? 'project' : '',
              originId: taskQueries.length >= 3 ? 'project-7' : null,
              status: taskQueries.length === 2 || taskQueries.length === 4 ? 'completed' : 'active',
              archived: taskQueries.length === 2 || taskQueries.length === 4,
              completed: taskQueries.length === 2 || taskQueries.length === 4
            })
          ]
        };
      }
    },
    {
      target: Project,
      key: 'find',
      value: (query) => {
        projectQueries.push(query);
        return {
          sort: async () => [
            createDoc({
              _id: `project-${projectQueries.length}`,
              name: `Project ${projectQueries.length}`,
              summary: 'Summary',
              status: projectQueries.length === 2 ? 'completed' : 'pending',
              archived: projectQueries.length === 2
            })
          ]
        };
      }
    },
    {
      target: Note,
      key: 'find',
      value: (query) => {
        noteQueries.push(query);
        return {
          sort: async () => [
            createDoc({
              _id: `note-${noteQueries.length}`,
              title: `Note ${noteQueries.length}`,
              content: 'Content',
              archived: noteQueries.length === 2
            })
          ]
        };
      }
    }
  ], async () => {
    const taskDefaultCtx = createCtx();
    await taskListHandler(taskDefaultCtx, async () => {});
    assert.equal(hasClause(taskQueries[0], (clause) => clause.archived && clause.archived.$ne === true), true);
    assert.equal(hasClause(taskQueries[0], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(taskDefaultCtx.status, 200);
    assert.deepEqual(taskDefaultCtx.body[0], {
      _id: 'task-1',
      title: 'Task 1',
      originModule: '',
      originId: null,
      status: 'active',
      archived: false,
      completed: false
    });

    const taskArchivedCtx = createCtx({ query: { archived: 'true' } });
    await taskListHandler(taskArchivedCtx, async () => {});
    assert.equal(hasClause(taskQueries[1], (clause) => clause.archived === true), true);
    assert.equal(hasClause(taskQueries[1], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(taskArchivedCtx.status, 200);

    const taskProjectCtx = createCtx({ query: { projectId: 'project-7' } });
    await taskListHandler(taskProjectCtx, async () => {});
    assert.equal(
      hasClause(taskQueries[2], (clause) => clause.archived && clause.archived.$ne === true),
      true
    );
    assert.equal(
      hasClause(taskQueries[2], (clause) => clause.originModule === 'project' && clause.originId === 'project-7'),
      true
    );
    assert.equal(taskProjectCtx.status, 200);

    const taskProjectArchivedCtx = createCtx({ query: { projectId: 'project-7', archived: 'true' } });
    await taskListHandler(taskProjectArchivedCtx, async () => {});
    assert.equal(
      hasClause(taskQueries[3], (clause) => clause.archived === true),
      true
    );
    assert.equal(
      hasClause(taskQueries[3], (clause) => clause.originModule === 'project' && clause.originId === 'project-7'),
      true
    );
    assert.equal(taskProjectArchivedCtx.status, 200);

    const projectDefaultCtx = createCtx();
    await projectListHandler(projectDefaultCtx, async () => {});
    assert.equal(hasClause(projectQueries[0], (clause) => clause.archived && clause.archived.$ne === true), true);
    assert.equal(hasClause(projectQueries[0], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(projectDefaultCtx.status, 200);
    assert.deepEqual(projectDefaultCtx.body[0], {
      _id: 'project-1',
      name: 'Project 1',
      summary: 'Summary',
      status: 'pending',
      archived: false
    });

    const projectArchivedCtx = createCtx({ query: { archived: 'true' } });
    await projectListHandler(projectArchivedCtx, async () => {});
    assert.equal(hasClause(projectQueries[1], (clause) => clause.archived === true), true);
    assert.equal(hasClause(projectQueries[1], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(projectArchivedCtx.status, 200);

    const noteDefaultCtx = createCtx();
    await noteListHandler(noteDefaultCtx, async () => {});
    assert.equal(hasClause(noteQueries[0], (clause) => clause.archived && clause.archived.$ne === true), true);
    assert.equal(hasClause(noteQueries[0], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(noteDefaultCtx.status, 200);
    assert.deepEqual(noteDefaultCtx.body[0], {
      _id: 'note-1',
      title: 'Note 1',
      content: 'Content',
      archived: false
    });

    const noteArchivedCtx = createCtx({ query: { archived: 'true' } });
    await noteListHandler(noteArchivedCtx, async () => {});
    assert.equal(hasClause(noteQueries[1], (clause) => clause.archived === true), true);
    assert.equal(hasClause(noteQueries[1], (clause) => clause.userId === '000000000000000000000001'), true);
    assert.equal(noteArchivedCtx.status, 200);
  });
});

test('create, update, and delete routes keep first-pass status code and response-shape contracts', async () => {
  const createTaskHandler = getRouteHandler('POST', '/tasks');
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');
  const deleteTaskHandler = getRouteHandler('DELETE', '/tasks/:id');
  const createProjectHandler = getRouteHandler('POST', '/projects');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const deleteProjectHandler = getRouteHandler('DELETE', '/projects/:id');
  const createNoteHandler = getRouteHandler('POST', '/notes');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');
  const deleteNoteHandler = getRouteHandler('DELETE', '/notes/:id');

  await withPatchedMethods([
    {
      target: Task,
      key: 'create',
      value: async () => createDoc({
        _id: 'task-new',
        title: 'Ship sprint',
        creationMode: 'manual',
        originModule: '',
        originId: null,
        status: 'active',
        archived: false,
        completed: false
      })
    },
    {
      target: Task,
      key: 'findOne',
      value: async () => createDoc({
        _id: 'task-new',
        title: 'Ship sprint',
        status: 'active',
        archived: false,
        completed: false
      })
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async () => createDoc({
        _id: 'task-new',
        title: 'Ship sprint',
        status: 'completed',
        archived: false,
        completed: true
      })
    },
    {
      target: Task,
      key: 'findOneAndDelete',
      value: async () => createDoc({
        _id: 'task-new',
        title: 'Ship sprint',
        originModule: '',
        originId: null
      })
    },
    {
      target: Project,
      key: 'create',
      value: async () => createDoc({
        _id: 'project-new',
        name: 'Project X',
        summary: 'Summary',
        status: 'pending',
        archived: false
      })
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async () => createDoc({
        _id: 'project-new',
        name: 'Project X',
        summary: 'Updated summary',
        status: 'in_progress',
        archived: false,
        currentFocusTaskId: null
      })
    },
    {
      target: Project,
      key: 'findOneAndDelete',
      value: async () => createDoc({
        _id: 'project-new',
        name: 'Project X'
      })
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => null
    },
    {
      target: Note,
      key: 'create',
      value: async () => createDoc({
        _id: 'note-new',
        title: 'Scratchpad',
        content: 'Initial content',
        archived: false
      })
    },
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async () => createDoc({
        _id: 'note-new',
        title: 'Scratchpad',
        content: 'Updated content',
        archived: false
      })
    },
    {
      target: Note,
      key: 'findOneAndDelete',
      value: async () => createDoc({
        _id: 'note-new',
        title: 'Scratchpad'
      })
    }
  ], async () => {
    const createTaskCtx = createCtx({ body: { title: 'Ship sprint' } });
    await createTaskHandler(createTaskCtx, async () => {});
    assert.equal(createTaskCtx.status, 201);
    assert.deepEqual(createTaskCtx.body, {
      _id: 'task-new',
      title: 'Ship sprint',
      creationMode: 'manual',
      originModule: '',
      originId: null,
      status: 'active',
      archived: false,
      completed: false
    });

    const updateTaskCtx = createCtx({ params: { id: 'task-new' }, body: { completed: true } });
    await updateTaskHandler(updateTaskCtx, async () => {});
    assert.equal(updateTaskCtx.status, 200);
    assert.deepEqual(updateTaskCtx.body, {
      _id: 'task-new',
      title: 'Ship sprint',
      status: 'completed',
      archived: false,
      completed: true
    });

    const deleteTaskCtx = createCtx({ params: { id: 'task-new' } });
    await deleteTaskHandler(deleteTaskCtx, async () => {});
    assert.equal(deleteTaskCtx.status, 204);
    assert.equal(deleteTaskCtx.body, null);

    const createProjectCtx = createCtx({ body: { name: 'Project X', summary: 'Summary' } });
    await createProjectHandler(createProjectCtx, async () => {});
    assert.equal(createProjectCtx.status, 201);
    assert.deepEqual(createProjectCtx.body, {
      _id: 'project-new',
      name: 'Project X',
      summary: 'Summary',
      status: 'pending',
      archived: false
    });

    const updateProjectCtx = createCtx({
      params: { id: 'project-new' },
      body: { name: 'Project X', summary: 'Updated summary', status: 'in_progress' }
    });
    await updateProjectHandler(updateProjectCtx, async () => {});
    assert.equal(updateProjectCtx.status, 200);
    assert.deepEqual(updateProjectCtx.body, {
      _id: 'project-new',
      name: 'Project X',
      summary: 'Updated summary',
      status: 'in_progress',
      archived: false,
      currentFocusTaskId: null
    });

    const deleteProjectCtx = createCtx({ params: { id: 'project-new' } });
    await deleteProjectHandler(deleteProjectCtx, async () => {});
    assert.equal(deleteProjectCtx.status, 204);
    assert.equal(deleteProjectCtx.body, null);

    const createNoteCtx = createCtx({ body: { title: 'Scratchpad', content: 'Initial content' } });
    await createNoteHandler(createNoteCtx, async () => {});
    assert.equal(createNoteCtx.status, 201);
    assert.deepEqual(createNoteCtx.body, {
      _id: 'note-new',
      title: 'Scratchpad',
      content: 'Initial content',
      archived: false
    });

    const updateNoteCtx = createCtx({
      params: { id: 'note-new' },
      body: { title: 'Scratchpad', content: 'Updated content' }
    });
    await updateNoteHandler(updateNoteCtx, async () => {});
    assert.equal(updateNoteCtx.status, 200);
    assert.deepEqual(updateNoteCtx.body, {
      _id: 'note-new',
      title: 'Scratchpad',
      content: 'Updated content',
      archived: false
    });

    const deleteNoteCtx = createCtx({ params: { id: 'note-new' } });
    await deleteNoteHandler(deleteNoteCtx, async () => {});
    assert.equal(deleteNoteCtx.status, 204);
    assert.equal(deleteNoteCtx.body, null);
  });
});

test('missing task, project, and note id routes return canonical 404 errors', async () => {
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');
  const deleteTaskHandler = getRouteHandler('DELETE', '/tasks/:id');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const deleteProjectHandler = getRouteHandler('DELETE', '/projects/:id');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');
  const deleteNoteHandler = getRouteHandler('DELETE', '/notes/:id');

  await withPatchedMethods([
    {
      target: Task,
      key: 'findOne',
      value: async () => null
    },
    {
      target: Task,
      key: 'findOneAndDelete',
      value: async () => null
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async () => null
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => null
    },
    {
      target: Project,
      key: 'findOneAndDelete',
      value: async () => null
    },
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async () => null
    },
    {
      target: Note,
      key: 'findOne',
      value: async () => null
    },
    {
      target: Note,
      key: 'findOneAndDelete',
      value: async () => null
    }
  ], async () => {
    const updateTaskCtx = createCtx({ params: { id: 'missing-task' }, body: { archived: true } });
    await updateTaskHandler(updateTaskCtx, async () => {});
    assert.equal(updateTaskCtx.status, 404);
    assert.deepEqual(updateTaskCtx.body, { error: 'Task not found' });

    const deleteTaskCtx = createCtx({ params: { id: 'missing-task' } });
    await deleteTaskHandler(deleteTaskCtx, async () => {});
    assert.equal(deleteTaskCtx.status, 404);
    assert.deepEqual(deleteTaskCtx.body, { error: 'Task not found' });

    const updateProjectCtx = createCtx({
      params: { id: 'missing-project' },
      body: { name: 'Missing', summary: 'Missing', status: 'pending' }
    });
    await updateProjectHandler(updateProjectCtx, async () => {});
    assert.equal(updateProjectCtx.status, 404);
    assert.deepEqual(updateProjectCtx.body, { error: 'Project not found' });

    const deleteProjectCtx = createCtx({ params: { id: 'missing-project' } });
    await deleteProjectHandler(deleteProjectCtx, async () => {});
    assert.equal(deleteProjectCtx.status, 404);
    assert.deepEqual(deleteProjectCtx.body, { error: 'Project not found' });

    const updateNoteCtx = createCtx({
      params: { id: 'missing-note' },
      body: { title: 'Missing', content: 'Missing' }
    });
    await updateNoteHandler(updateNoteCtx, async () => {});
    assert.equal(updateNoteCtx.status, 404);
    assert.deepEqual(updateNoteCtx.body, { error: 'Note not found' });

    const deleteNoteCtx = createCtx({ params: { id: 'missing-note' } });
    await deleteNoteHandler(deleteNoteCtx, async () => {});
    assert.equal(deleteNoteCtx.status, 404);
    assert.deepEqual(deleteNoteCtx.body, { error: 'Note not found' });
  });
});

test('no-op note and project updates keep existing updatedAt ordering state', async () => {
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');
  const writes = [];
  const reads = [];

  await withPatchedMethods([
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        writes.push({ model: 'project', query, update });
        return null;
      }
    },
    {
      target: Project,
      key: 'findOne',
      value: async (query) => {
        reads.push({ model: 'project', query });
        return createDoc({
          _id: 'project-1',
          name: 'Same',
          summary: 'Same summary',
          status: 'pending',
          archived: false,
          currentFocusTaskId: null,
          updatedAt: '2026-05-01T00:00:00.000Z'
        });
      }
    },
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        writes.push({ model: 'note', query, update });
        return null;
      }
    },
    {
      target: Note,
      key: 'findOne',
      value: async (query) => {
        reads.push({ model: 'note', query });
        return createDoc({
          _id: 'note-1',
          title: 'Same',
          content: 'Same content',
          archived: false,
          updatedAt: '2026-05-01T00:00:00.000Z'
        });
      }
    }
  ], async () => {
    const updateProjectCtx = createCtx({
      params: { id: 'project-1' },
      body: { name: 'Same', summary: 'Same summary', status: 'pending' }
    });
    await updateProjectHandler(updateProjectCtx, async () => {});

    const updateNoteCtx = createCtx({
      params: { id: 'note-1' },
      body: { title: 'Same', content: 'Same content' }
    });
    await updateNoteHandler(updateNoteCtx, async () => {});

    assert.equal(updateProjectCtx.status, 200);
    assert.equal(updateProjectCtx.body.updatedAt, '2026-05-01T00:00:00.000Z');
    assert.equal(updateNoteCtx.status, 200);
    assert.equal(updateNoteCtx.body.updatedAt, '2026-05-01T00:00:00.000Z');
  });

  assert.equal(writes.length, 2);
  assert.equal(writes.every((write) => Array.isArray(write.query.$or)), true);
  assert.equal(reads.length, 2);
});

test('bad create and update request bodies return stable 400 errors before service writes', async () => {
  const createTaskHandler = getRouteHandler('POST', '/tasks');
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');
  const createProjectHandler = getRouteHandler('POST', '/projects');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const createNoteHandler = getRouteHandler('POST', '/notes');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');

  const forbiddenWrite = async () => {
    throw new Error('validation should stop before model write');
  };

  await withPatchedMethods([
    { target: Task, key: 'create', value: forbiddenWrite },
    { target: Task, key: 'findOne', value: forbiddenWrite },
    { target: Project, key: 'create', value: forbiddenWrite },
    { target: Project, key: 'findOneAndUpdate', value: forbiddenWrite },
    { target: Note, key: 'create', value: forbiddenWrite },
    { target: Note, key: 'findOneAndUpdate', value: forbiddenWrite }
  ], async () => {
    const cases = [
      [createTaskHandler, createCtx({ body: { title: '' } })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: { completed: 'yes' } })],
      [createProjectHandler, createCtx({ body: { name: 'Project X' } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { status: 'archived' } })],
      [createNoteHandler, createCtx({ body: null })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: { title: 42 } })]
    ];

    for (const [handler, ctx] of cases) {
      await handler(ctx, async () => {});
      assert.equal(ctx.status, 400);
      assert.deepEqual(ctx.body, { error: 'Invalid request body' });
    }
  });
});

test('product routes require a current user before model access', async () => {
  const listNotesHandler = getRouteHandler('GET', '/notes');
  const listProjectsHandler = getRouteHandler('GET', '/projects');
  const listTasksHandler = getRouteHandler('GET', '/tasks');

  const forbiddenRead = async () => {
    throw new Error('missing current user should stop before model read');
  };

  await withPatchedMethods([
    { target: Note, key: 'find', value: forbiddenRead },
    { target: Project, key: 'find', value: forbiddenRead },
    { target: Task, key: 'find', value: forbiddenRead }
  ], async () => {
    for (const handler of [listNotesHandler, listProjectsHandler, listTasksHandler]) {
      const ctx = createCtx({ userId: null });
      await handler(ctx, async () => {});
      assert.equal(ctx.status, 401);
      assert.deepEqual(ctx.body, { error: 'Authentication required' });
    }
  });
});

test('unexpected backend route failures return stable 500 errors without leaking internals', async () => {
  const listTaskHandler = getRouteHandler('GET', '/tasks');
  const originalConsoleError = console.error;

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: () => {
        throw new Error('database password leaked here');
      }
    },
    {
      target: console,
      key: 'error',
      value: () => {}
    }
  ], async () => {
    try {
      const ctx = createCtx();
      await listTaskHandler(ctx, async () => {});

      assert.equal(ctx.status, 500);
      assert.deepEqual(ctx.body, { error: 'Internal server error' });
    } finally {
      console.error = originalConsoleError;
    }
  });
});
