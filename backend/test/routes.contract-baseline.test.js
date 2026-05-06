const test = require('node:test');
const assert = require('node:assert/strict');

const Note = require('../src/models/Note');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const notesService = require('../src/services/notesService');
const projectsService = require('../src/services/projectsService');
const tasksService = require('../src/services/tasksService');
const { errorBoundary } = require('../src/middleware/errorBoundary');
const routes = require('../src/routes/index.js');
const {
  BadRequestError,
  assertZodSchema
} = require('../src/middleware/requestBodyValidation');
const {
  taskCreateSchema,
  taskUpdateSchema
} = require('../src/routes/schemas/mutations');

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

test('parsed body rollout stores parsed DTOs and mutation routes consume them without mutating raw bodies', async () => {
  const createTaskHandler = getRouteHandler('POST', '/tasks');
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');
  const createProjectHandler = getRouteHandler('POST', '/projects');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const createNoteHandler = getRouteHandler('POST', '/notes');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');
  const calls = {};

  await withPatchedMethods([
    {
      target: notesService,
      key: 'createNote',
      value: async (body) => {
        calls.noteCreate = body;
        return { _id: 'note-new', ...body, archived: false };
      }
    },
    {
      target: notesService,
      key: 'updateNote',
      value: async (id, body) => {
        calls.noteUpdate = body;
        return { _id: id, title: body.title || 'Note', content: body.content || '' };
      }
    },
    {
      target: projectsService,
      key: 'createProject',
      value: async (body) => {
        calls.projectCreate = body;
        return { _id: 'project-new', ...body };
      }
    },
    {
      target: projectsService,
      key: 'updateProject',
      value: async (id, body) => {
        calls.projectUpdate = body;
        return { _id: id, ...body };
      }
    },
    {
      target: tasksService,
      key: 'createTask',
      value: async (body) => {
        calls.taskCreate = body;
        return { _id: 'task-new', ...body };
      }
    },
    {
      target: tasksService,
      key: 'updateTask',
      value: async (id, body) => {
        calls.taskUpdate = body;
        return { _id: id, ...body };
      }
    }
  ], async () => {
    const noteCreateBody = { title: 'Note', content: 'Body', unknownField: 'kept' };
    const noteCreateCtx = createCtx({ body: noteCreateBody });
    await createNoteHandler(noteCreateCtx, async () => {});
    assert.strictEqual(calls.noteCreate, noteCreateCtx.state.validatedBody);
    assert.notStrictEqual(calls.noteCreate, noteCreateBody);
    assert.deepEqual(calls.noteCreate, noteCreateBody);
    assert.strictEqual(noteCreateCtx.request.body, noteCreateBody);
    assert.deepEqual(noteCreateCtx.request.body, noteCreateBody);

    const noteUpdateBody = { content: 'Updated', unknownField: 'kept' };
    const noteUpdateCtx = createCtx({ params: { id: 'note-1' }, body: noteUpdateBody });
    await updateNoteHandler(noteUpdateCtx, async () => {});
    assert.strictEqual(calls.noteUpdate, noteUpdateCtx.state.validatedBody);
    assert.notStrictEqual(calls.noteUpdate, noteUpdateBody);
    assert.deepEqual(calls.noteUpdate, noteUpdateBody);
    assert.strictEqual(noteUpdateCtx.request.body, noteUpdateBody);
    assert.deepEqual(noteUpdateCtx.request.body, noteUpdateBody);

    const projectCreateBody = {
      name: 'Project X',
      summary: 'Summary',
      unknownField: 'kept'
    };
    const projectCreateCtx = createCtx({ body: projectCreateBody });
    await createProjectHandler(projectCreateCtx, async () => {});
    assert.strictEqual(calls.projectCreate, projectCreateCtx.state.validatedBody);
    assert.notStrictEqual(calls.projectCreate, projectCreateBody);
    assert.deepEqual(calls.projectCreate, projectCreateBody);
    assert.strictEqual(projectCreateCtx.request.body, projectCreateBody);
    assert.deepEqual(projectCreateCtx.request.body, projectCreateBody);

    const projectUpdateBody = { status: 'in_progress', unknownField: 'kept' };
    const projectUpdateCtx = createCtx({ params: { id: 'project-1' }, body: projectUpdateBody });
    await updateProjectHandler(projectUpdateCtx, async () => {});
    assert.strictEqual(calls.projectUpdate, projectUpdateCtx.state.validatedBody);
    assert.notStrictEqual(calls.projectUpdate, projectUpdateBody);
    assert.deepEqual(calls.projectUpdate, projectUpdateBody);
    assert.strictEqual(projectUpdateCtx.request.body, projectUpdateBody);
    assert.deepEqual(projectUpdateCtx.request.body, projectUpdateBody);

    const taskCreateBody = { title: 'Task', unknownField: 'kept' };
    const taskCreateCtx = createCtx({ body: taskCreateBody });
    await createTaskHandler(taskCreateCtx, async () => {});
    assert.strictEqual(calls.taskCreate, taskCreateCtx.state.validatedBody);
    assert.notStrictEqual(calls.taskCreate, taskCreateBody);
    assert.deepEqual(calls.taskCreate, taskCreateBody);
    assert.strictEqual(taskCreateCtx.request.body, taskCreateBody);
    assert.deepEqual(taskCreateCtx.request.body, taskCreateBody);

    const taskUpdateBody = { status: 'completed', unknownField: 'kept' };
    const taskUpdateCtx = createCtx({ params: { id: 'task-1' }, body: taskUpdateBody });
    await updateTaskHandler(taskUpdateCtx, async () => {});
    assert.strictEqual(calls.taskUpdate, taskUpdateCtx.state.validatedBody);
    assert.notStrictEqual(calls.taskUpdate, taskUpdateBody);
    assert.deepEqual(calls.taskUpdate, taskUpdateBody);
    assert.strictEqual(taskUpdateCtx.request.body, taskUpdateBody);
    assert.deepEqual(taskUpdateCtx.request.body, taskUpdateBody);
  });
});

test('notes and projects mutation validation covers Zod create and update body contracts', async () => {
  const createProjectHandler = getRouteHandler('POST', '/projects');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const createNoteHandler = getRouteHandler('POST', '/notes');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');

  const forbiddenWrite = async () => {
    throw new Error('notes/projects validation should stop before service writes');
  };

  await withPatchedMethods([
    { target: Project, key: 'create', value: forbiddenWrite },
    { target: Project, key: 'findOneAndUpdate', value: forbiddenWrite },
    { target: Note, key: 'create', value: forbiddenWrite },
    { target: Note, key: 'findOneAndUpdate', value: forbiddenWrite }
  ], async () => {
    const cases = [
      [createNoteHandler, createCtx({ body: null })],
      [createNoteHandler, createCtx({ body: [] })],
      [createNoteHandler, createCtx({ body: {} })],
      [createNoteHandler, createCtx({ body: { title: '' } })],
      [createNoteHandler, createCtx({ body: { title: '   ' } })],
      [createNoteHandler, createCtx({ body: { title: 'Note', content: 42 } })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: null })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: [] })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: {} })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: { extra: true } })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: { title: '' } })],
      [updateNoteHandler, createCtx({ params: { id: 'note-1' }, body: { content: 42 } })],
      [createProjectHandler, createCtx({ body: null })],
      [createProjectHandler, createCtx({ body: [] })],
      [createProjectHandler, createCtx({ body: {} })],
      [createProjectHandler, createCtx({ body: { name: 'Project X' } })],
      [createProjectHandler, createCtx({ body: { name: '', summary: 'Summary' } })],
      [createProjectHandler, createCtx({ body: { name: 'Project X', summary: '   ' } })],
      [createProjectHandler, createCtx({ body: { name: 'Project X', summary: 'Summary', status: 'archived' } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: null })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: [] })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: {} })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { extra: true } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { name: '' } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { summary: '   ' } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { status: 'archived' } })],
      [updateProjectHandler, createCtx({ params: { id: 'project-1' }, body: { currentFocusTaskId: 42 } })]
    ];

    for (const [handler, ctx] of cases) {
      await handler(ctx, async () => {});
      assert.equal(ctx.status, 400);
      assert.deepEqual(ctx.body, { error: 'Invalid request body' });
    }
  });
});

test('notes and projects mutation validation preserves valid payload and unknown-field compatibility', async () => {
  const createProjectHandler = getRouteHandler('POST', '/projects');
  const updateProjectHandler = getRouteHandler('PUT', '/projects/:id');
  const createNoteHandler = getRouteHandler('POST', '/notes');
  const updateNoteHandler = getRouteHandler('PUT', '/notes/:id');
  const projectCreates = [];
  const projectUpdates = [];
  const noteCreates = [];
  const noteUpdates = [];

  await withPatchedMethods([
    {
      target: Project,
      key: 'create',
      value: async (data) => {
        projectCreates.push(data);
        return createDoc({ _id: 'project-created', ...data });
      }
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        projectUpdates.push({ query, update });
        return createDoc({
          _id: 'project-1',
          name: 'Project X',
          summary: update.summary || 'Summary',
          status: update.status || 'pending',
          currentFocusTaskId: update.currentFocusTaskId
        });
      }
    },
    {
      target: Note,
      key: 'create',
      value: async (data) => {
        noteCreates.push(data);
        return createDoc({ _id: 'note-created', ...data });
      }
    },
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        noteUpdates.push({ query, update });
        return createDoc({
          _id: 'note-1',
          title: update.title || 'Note',
          content: update.content || 'Content'
        });
      }
    }
  ], async () => {
    const createProjectCtxWithUnknown = createCtx({
      body: {
        name: 'Project X',
        summary: 'Summary',
        status: 'in_progress',
        unknownField: 'accepted by validation'
      }
    });
    await createProjectHandler(createProjectCtxWithUnknown, async () => {});

    const updateProjectCtxWithUnknown = createCtx({
      params: { id: 'project-1' },
      body: {
        currentFocusTaskId: null,
        unknownField: 'accepted by validation'
      }
    });
    await updateProjectHandler(updateProjectCtxWithUnknown, async () => {});

    const createNoteCtxWithUnknown = createCtx({
      body: {
        title: 'Note',
        content: '',
        unknownField: 'accepted by validation'
      }
    });
    await createNoteHandler(createNoteCtxWithUnknown, async () => {});

    const updateNoteCtxWithUnknown = createCtx({
      params: { id: 'note-1' },
      body: {
        content: 'Updated content',
        unknownField: 'accepted by validation'
      }
    });
    await updateNoteHandler(updateNoteCtxWithUnknown, async () => {});

    assert.equal(createProjectCtxWithUnknown.status, 201);
    assert.equal(updateProjectCtxWithUnknown.status, 200);
    assert.equal(createNoteCtxWithUnknown.status, 201);
    assert.equal(updateNoteCtxWithUnknown.status, 200);
  });

  assert.equal(projectCreates[0].name, 'Project X');
  assert.equal(projectCreates[0].summary, 'Summary');
  assert.equal(projectCreates[0].status, 'in_progress');
  assert.equal(projectUpdates[0].update.currentFocusTaskId, null);
  assert.equal(noteCreates[0].title, 'Note');
  assert.equal(noteCreates[0].content, '');
  assert.equal(noteUpdates[0].update.content, 'Updated content');
});

test('task mutation validation covers Zod pilot create and update body contracts', async () => {
  const createTaskHandler = getRouteHandler('POST', '/tasks');
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');

  const forbiddenWrite = async () => {
    throw new Error('task validation should stop before service writes');
  };

  await withPatchedMethods([
    { target: Task, key: 'create', value: forbiddenWrite },
    { target: Task, key: 'findOne', value: forbiddenWrite }
  ], async () => {
    const cases = [
      [createTaskHandler, createCtx({ body: null })],
      [createTaskHandler, createCtx({ body: [] })],
      [createTaskHandler, createCtx({ body: {} })],
      [createTaskHandler, createCtx({ body: { title: '' } })],
      [createTaskHandler, createCtx({ body: { title: '   ' } })],
      [createTaskHandler, createCtx({ body: { title: 'Ship it', creationMode: 'robot' } })],
      [createTaskHandler, createCtx({ body: { title: 'Ship it', originModule: 42 } })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: null })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: [] })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: {} })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: { extra: true } })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: { status: 'done' } })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: { archived: 'false' } })],
      [updateTaskHandler, createCtx({ params: { id: 'task-1' }, body: { completed: 1 } })]
    ];

    for (const [handler, ctx] of cases) {
      await handler(ctx, async () => {});
      assert.equal(ctx.status, 400);
      assert.deepEqual(ctx.body, { error: 'Invalid request body' });
    }
  });
});

test('task mutation Zod validation errors carry internal metadata only', async () => {
  assert.throws(
    () => assertZodSchema(taskCreateSchema, { title: '', creationMode: 'robot' }),
    (error) => {
      assert.equal(error instanceof BadRequestError, true);
      assert.equal(error.status, 400);
      assert.equal(error.message, 'Invalid request body');
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.equal(error.source, 'request.body');
      assert.equal(Array.isArray(error.details), true);
      assert.equal(error.details.length >= 1, true);
      assert.equal(error.details.some((detail) => detail.path.includes('creationMode')), true);
      assert.equal(error.details.every((detail) => typeof detail.message === 'string'), true);
      return true;
    }
  );

  assert.throws(
    () => assertZodSchema(taskUpdateSchema, { extra: true }),
    (error) => {
      assert.equal(error instanceof BadRequestError, true);
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.equal(error.source, 'request.body');
      assert.equal(Array.isArray(error.details), true);
      assert.equal(error.message, 'Invalid request body');
      return true;
    }
  );
});

test('task mutation validation preserves valid payload and unknown-field behavior', async () => {
  const createTaskHandler = getRouteHandler('POST', '/tasks');
  const updateTaskHandler = getRouteHandler('PUT', '/tasks/:id');
  const taskCreates = [];
  const taskUpdates = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'create',
      value: async (data) => {
        taskCreates.push(data);
        return createDoc({
          _id: 'task-created',
          ...data
        });
      }
    },
    {
      target: Task,
      key: 'findOne',
      value: async () => createDoc({
        _id: 'task-1',
        title: 'Ship it',
        status: 'active',
        archived: false,
        completed: false
      })
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        taskUpdates.push({ query, update });
        return createDoc({
          _id: 'task-1',
          title: 'Ship it',
          status: update.status,
          archived: update.archived,
          completed: false
        });
      }
    }
  ], async () => {
    const createCtxWithUnknown = createCtx({
      body: {
        title: 'Ship it',
        creationMode: 'ai',
        originModule: 'dashboard',
        unknownField: 'preserved by route contract'
      }
    });
    await createTaskHandler(createCtxWithUnknown, async () => {});

    const updateCtxWithUnknown = createCtx({
      params: { id: 'task-1' },
      body: { status: 'completed', unknownField: 'preserved by route contract' }
    });
    await updateTaskHandler(updateCtxWithUnknown, async () => {});

    assert.equal(createCtxWithUnknown.status, 201);
    assert.equal(updateCtxWithUnknown.status, 200);
  });

  assert.equal(taskCreates[0].title, 'Ship it');
  assert.equal(taskCreates[0].creationMode, 'ai');
  assert.equal(taskCreates[0].originModule, 'dashboard');
  assert.equal(taskUpdates[0].update.status, 'completed');
  assert.equal(taskUpdates[0].update.archived, false);
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
