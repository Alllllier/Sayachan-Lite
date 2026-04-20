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
    assert.deepEqual(taskQueries[0], { archived: { $ne: true } });
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
    assert.deepEqual(taskQueries[1], { archived: true });
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
    assert.deepEqual(projectQueries[0], { archived: { $ne: true } });
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
    assert.deepEqual(projectQueries[1], { archived: true });
    assert.equal(projectArchivedCtx.status, 200);

    const noteDefaultCtx = createCtx();
    await noteListHandler(noteDefaultCtx, async () => {});
    assert.deepEqual(noteQueries[0], { archived: { $ne: true } });
    assert.equal(noteDefaultCtx.status, 200);
    assert.deepEqual(noteDefaultCtx.body[0], {
      _id: 'note-1',
      title: 'Note 1',
      content: 'Content',
      archived: false
    });

    const noteArchivedCtx = createCtx({ query: { archived: 'true' } });
    await noteListHandler(noteArchivedCtx, async () => {});
    assert.deepEqual(noteQueries[1], { archived: true });
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
      key: 'findById',
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
      key: 'findByIdAndUpdate',
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
      key: 'findByIdAndDelete',
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
      key: 'findByIdAndUpdate',
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
      key: 'findByIdAndDelete',
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
      key: 'findByIdAndUpdate',
      value: async () => createDoc({
        _id: 'note-new',
        title: 'Scratchpad',
        content: 'Updated content',
        archived: false
      })
    },
    {
      target: Note,
      key: 'findByIdAndDelete',
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
      key: 'findById',
      value: async () => null
    },
    {
      target: Task,
      key: 'findByIdAndDelete',
      value: async () => null
    },
    {
      target: Project,
      key: 'findByIdAndUpdate',
      value: async () => null
    },
    {
      target: Project,
      key: 'findByIdAndDelete',
      value: async () => null
    },
    {
      target: Note,
      key: 'findByIdAndUpdate',
      value: async () => null
    },
    {
      target: Note,
      key: 'findByIdAndDelete',
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
