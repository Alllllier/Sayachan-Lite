const test = require('node:test');
const assert = require('node:assert/strict');

const Note = require('../dist/models/Note');
const Project = require('../dist/models/Project');
const Task = require('../dist/models/Task');
const aiRoutes = require('../dist/routes/ai');
const { errorBoundary } = require('../dist/middleware/errorBoundary');
const routes = require('../dist/routes/index.js');

function getRouteHandler(router, method, path) {
  const layer = router.stack.find((entry) => entry.path === path && entry.methods.includes(method));
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
  return {
    query,
    params,
    request: { body },
    state: { user: { _id: userId, role: 'tester', email: `${userId}@example.com` } },
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

function normalizeIds(value) {
  if (value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeIds);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeIds(entry)]));
  }

  return value;
}

function hasClause(query, predicate) {
  if (!query || typeof query !== 'object') {
    return false;
  }

  if (predicate(normalizeIds(query))) {
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

test('note list and direct-id mutations are scoped to the current user', async () => {
  const listHandler = getRouteHandler(routes, 'GET', '/notes');
  const updateHandler = getRouteHandler(routes, 'PUT', '/notes/:id');
  const deleteHandler = getRouteHandler(routes, 'DELETE', '/notes/:id');
  const pinHandler = getRouteHandler(routes, 'PUT', '/notes/:id/pin');
  const archiveHandler = getRouteHandler(routes, 'PUT', '/notes/:id/archive');
  const seen = [];

  await withPatchedMethods([
    {
      target: Note,
      key: 'find',
      value: (query) => {
        seen.push({ op: 'find', query });
        return { sort: async () => [] };
      }
    },
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        seen.push({ op: 'findOneAndUpdate', query, update });
        return createDoc({ _id: query._id, userId: query.userId, title: 'Owned note', content: '', archived: update.archived === true });
      }
    },
    {
      target: Note,
      key: 'findOneAndDelete',
      value: async (query) => {
        seen.push({ op: 'findOneAndDelete', query });
        return createDoc({ _id: query._id, userId: query.userId });
      }
    },
    { target: Task, key: 'find', value: async (query) => {
      seen.push({ op: 'taskFind', query });
      return [];
    } }
  ], async () => {
    await listHandler(createCtx({ userId: '000000000000000000000011' }), async () => {});
    await updateHandler(createCtx({ params: { id: '000000000000000000000101' }, body: { title: 'T', content: 'C' }, userId: '000000000000000000000011' }), async () => {});
    await deleteHandler(createCtx({ params: { id: '000000000000000000000101' }, userId: '000000000000000000000011' }), async () => {});
    await pinHandler(createCtx({ params: { id: '000000000000000000000101' }, userId: '000000000000000000000011' }), async () => {});
    await archiveHandler(createCtx({ params: { id: '000000000000000000000101' }, userId: '000000000000000000000011' }), async () => {});
  });

  assert.equal(seen.every((entry) => hasClause(entry.query, (clause) => clause.userId === '000000000000000000000011')), true);
});

test('project archive cascade and focus clearing stay inside the current account', async () => {
  const archiveHandler = getRouteHandler(routes, 'PUT', '/projects/:id/archive');
  const seen = [];

  await withPatchedMethods([
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        seen.push({ op: 'projectUpdate', query, update });
        return createDoc({
          _id: query._id,
          userId: query.userId,
          name: 'Owned project',
          status: 'in_progress',
          archived: update.archived === true,
          currentFocusTaskId: '0000000000000000000003f0'
        });
      }
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        seen.push({ op: 'taskFind', query });
        return [];
      }
    }
  ], async () => {
    await archiveHandler(createCtx({ params: { id: '000000000000000000000201' }, userId: '000000000000000000000012' }), async () => {});
  });

  assert.equal(seen.every((entry) => hasClause(entry.query, (clause) => clause.userId === '000000000000000000000012')), true);
  assert.equal(hasClause(seen.find((entry) => entry.op === 'taskFind').query, (clause) => (
    clause.originModule === 'project' && clause.originId === '000000000000000000000201'
  )), true);
});

test('task list, direct-id mutation, and focus clearing are scoped to the current user', async () => {
  const listHandler = getRouteHandler(routes, 'GET', '/tasks');
  const updateHandler = getRouteHandler(routes, 'PUT', '/tasks/:id');
  const deleteHandler = getRouteHandler(routes, 'DELETE', '/tasks/:id');
  const seen = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: (query) => {
        seen.push({ op: 'taskList', query });
        return { sort: async () => [] };
      }
    },
    {
      target: Task,
      key: 'findOne',
      value: async (query) => {
        seen.push({ op: 'taskFindOne', query });
        return createDoc({
          _id: query._id,
          userId: query.userId,
          title: 'Owned task',
          status: 'active',
          archived: false,
          completed: false,
          originModule: 'project',
          originId: '000000000000000000000201'
        });
      }
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async (query) => {
        seen.push({ op: 'taskUpdate', query });
        return createDoc({
          _id: query._id,
          userId: query.userId,
          title: 'Owned task',
          status: 'completed',
          archived: false,
          completed: true,
          originModule: 'project',
          originId: '000000000000000000000201'
        });
      }
    },
    {
      target: Task,
      key: 'findOneAndDelete',
      value: async (query) => {
        seen.push({ op: 'taskDelete', query });
        return createDoc({ _id: query._id, userId: query.userId });
      }
    },
    {
      target: Project,
      key: 'findOne',
      value: async (query) => {
        seen.push({ op: 'projectFocusFind', query });
        return createDoc({ _id: '000000000000000000000201', name: 'Owned project', currentFocusTaskId: query.currentFocusTaskId });
      }
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query) => {
        seen.push({ op: 'projectFocusUpdate', query });
      }
    }
  ], async () => {
    await listHandler(createCtx({ query: { projectId: '000000000000000000000201' }, userId: '000000000000000000000013' }), async () => {});
    await updateHandler(createCtx({ params: { id: '000000000000000000000301' }, body: { completed: true }, userId: '000000000000000000000013' }), async () => {});
    await deleteHandler(createCtx({ params: { id: '000000000000000000000301' }, userId: '000000000000000000000013' }), async () => {});
  });

  assert.equal(seen.every((entry) => hasClause(entry.query, (clause) => clause.userId === '000000000000000000000013')), true);
});

test('direct-id mutations for another account behave as not found', async () => {
  const updateNoteHandler = getRouteHandler(routes, 'PUT', '/notes/:id');
  const updateProjectHandler = getRouteHandler(routes, 'PUT', '/projects/:id');
  const updateTaskHandler = getRouteHandler(routes, 'PUT', '/tasks/:id');

  await withPatchedMethods([
    { target: Note, key: 'findOneAndUpdate', value: async () => null },
    { target: Note, key: 'findOne', value: async () => null },
    { target: Project, key: 'findOneAndUpdate', value: async () => null },
    { target: Project, key: 'findOne', value: async () => null },
    { target: Task, key: 'findOne', value: async () => null }
  ], async () => {
    const noteCtx = createCtx({ params: { id: '00000000000000000000010f' }, body: { title: 'Nope', content: 'Nope' }, userId: '000000000000000000000014' });
    const projectCtx = createCtx({ params: { id: '00000000000000000000020f' }, body: { name: 'Nope', summary: 'Nope' }, userId: '000000000000000000000014' });
    const taskCtx = createCtx({ params: { id: '00000000000000000000030f' }, body: { completed: true }, userId: '000000000000000000000014' });

    await updateNoteHandler(noteCtx, async () => {});
    await updateProjectHandler(projectCtx, async () => {});
    await updateTaskHandler(taskCtx, async () => {});

    assert.equal(noteCtx.status, 404);
    assert.equal(projectCtx.status, 404);
    assert.equal(taskCtx.status, 404);
  });
});

test('AI note task generation reloads persisted notes through current-user ownership before fallback', async () => {
  const noteAiHandler = getRouteHandler(aiRoutes, 'POST', '/ai/notes/tasks');
  const originalKey = process.env.GLM_API_KEY;
  delete process.env.GLM_API_KEY;

  await withPatchedMethods([
    {
      target: Note,
      key: 'findOne',
      value: async (query) => {
        assert.deepEqual(normalizeIds(query), { _id: '000000000000000000000101', userId: '000000000000000000000015' });
        return createDoc({ _id: '000000000000000000000101', userId: '000000000000000000000015', title: 'Owned title', content: 'Owned content' });
      }
    }
  ], async () => {
    const ctx = createCtx({
      body: { _id: '000000000000000000000101', title: 'Tampered title', content: 'Tampered content' },
      userId: '000000000000000000000015'
    });
    await noteAiHandler(ctx, async () => {});

    assert.equal(ctx.status, 200);
    assert.equal(ctx.body.drafts[0].includes('Owned title'), true);
    assert.equal(ctx.body.drafts[0].includes('Tampered title'), false);
  });

  if (originalKey) {
    process.env.GLM_API_KEY = originalKey;
  }
});

test('AI project next-action resolves focus tasks by task id and current user', async () => {
  const projectAiHandler = getRouteHandler(aiRoutes, 'POST', '/ai/projects/next-action');
  const originalKey = process.env.GLM_API_KEY;
  const originalFetch = global.fetch;
  process.env.GLM_API_KEY = 'test-key';
  let capturedTaskQuery = null;
  let capturedPrompt = '';

  await withPatchedMethods([
    {
      target: Project,
      key: 'findOne',
      value: async (query) => {
        assert.deepEqual(normalizeIds(query), { _id: '000000000000000000000201', userId: '000000000000000000000016' });
        return createDoc({
          _id: '000000000000000000000201',
          userId: '000000000000000000000016',
          name: 'Owned project',
          summary: 'Owned summary',
          status: 'in_progress',
          currentFocusTaskId: '0000000000000000000003f0'
        });
      }
    },
    {
      target: Task,
      key: 'findOne',
      value: async (query) => {
        capturedTaskQuery = query;
        return null;
      }
    }
  ], async () => {
    global.fetch = async (_url, options) => {
      capturedPrompt = JSON.parse(options.body).messages[0].content;
      return {
        ok: true,
        async json() {
          return { choices: [{ message: { content: '推进一项安全任务' } }] };
        }
      };
    };

    const ctx = createCtx({
      body: { _id: '000000000000000000000201', currentFocusTaskId: '00000000000000000000030f', name: 'Tampered project' },
      userId: '000000000000000000000016'
    });
    await projectAiHandler(ctx, async () => {});

    assert.deepEqual(normalizeIds(capturedTaskQuery), { _id: '0000000000000000000003f0', userId: '000000000000000000000016' });
    assert.equal(capturedPrompt.includes('Tampered project'), false);
    assert.equal(capturedPrompt.includes('当前下一步：(无)'), true);
    assert.deepEqual(ctx.body, { suggestions: ['推进一项安全任务'] });
  });

  global.fetch = originalFetch;
  if (originalKey === undefined) {
    delete process.env.GLM_API_KEY;
  } else {
    process.env.GLM_API_KEY = originalKey;
  }
});
