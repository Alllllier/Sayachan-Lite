import test from 'node:test';
import assert from 'node:assert/strict';

import Note from '../dist/models/Note.js';
import Project from '../dist/models/Project.js';
import Task from '../dist/models/Task.js';
import { errorBoundary } from '../dist/middleware/app/errorBoundary.js';
import routes from '../dist/routes/index.js';

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
  const id = typeof data?._id === 'string' ? data._id : '';
  const defaults = data?.name !== undefined || data?.summary !== undefined || id.startsWith('0000000000000000000002')
    ? {
        name: 'Project',
        summary: 'Summary',
        status: 'pending',
        updatedAt: new Date('2026-05-01T00:00:00.000Z')
      }
    : data?.content !== undefined || id.startsWith('0000000000000000000001')
      ? {
          title: 'Note',
          content: '',
          updatedAt: new Date('2026-05-01T00:00:00.000Z')
        }
      : {};
  const normalized = {
    ...defaults,
    ...data
  };
  return {
    ...normalized,
    toObject() {
      return { ...normalized };
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

test('note archive cascades only note-origin tasks and preserves lifecycle semantics', async () => {
  const archiveHandler = getRouteHandler('PUT', '/notes/:id/archive');
  const ctx = createCtx({ params: { id: '000000000000000000000101' } });
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async () => createDoc({ _id: '000000000000000000000101', title: 'Sprint Note', archived: true })
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
  assert.equal('status' in ctx.body, false);
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originId === '000000000000000000000101' && clause.originModule === 'note'),
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
  const ctx = createCtx({ params: { id: '000000000000000000000101' } });
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Note,
      key: 'findOneAndUpdate',
      value: async () => createDoc({ _id: '000000000000000000000101', title: 'Sprint Note', archived: false })
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        capturedQuery = query;

        return [
          createDoc({ _id: 'task-active', status: 'active', archived: true, completed: false }),
          createDoc({ _id: 'task-completed', status: 'completed', archived: true, completed: true })
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
  assert.equal('status' in ctx.body, false);
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originId === '000000000000000000000101' && clause.originModule === 'note'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived === true),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.status === 'archived'),
    false
  );
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.update),
    [
      { archived: false, status: 'active', completed: false },
      { archived: false, status: 'completed', completed: true }
    ]
  );
});

test('project archive uses canonical project provenance and clears focus', async () => {
  const archiveHandler = getRouteHandler('PUT', '/projects/:id/archive');
  const ctx = createCtx({ params: { id: '000000000000000000000201' } });
  const project = createDoc({
    _id: '000000000000000000000201',
    name: 'Alpha',
    status: 'in_progress',
    archived: true,
    currentFocusTaskId: '0000000000000000000003f0'
  });
  const projectUpdates = [];
  let bulkOps = null;
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        projectUpdates.push({ query, update });
        return project;
      }
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        capturedQuery = query;

        return [
          createDoc({ _id: '0000000000000000000003a1', status: 'active', archived: false, completed: false, originModule: 'project', originId: '000000000000000000000201' }),
          createDoc({ _id: '0000000000000000000003a1-completed', status: 'completed', archived: false, completed: true, originModule: 'project', originId: '000000000000000000000201' })
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
    hasClause(capturedQuery, (clause) => clause.originModule === 'project' && clause.originId === '000000000000000000000201'),
    true
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.archived && clause.archived.$ne === true),
    true
  );
  assert.deepEqual(normalizeIds(projectUpdates), [
    { query: { _id: '000000000000000000000201', userId: '000000000000000000000001' }, update: { archived: true } },
    { query: { _id: '000000000000000000000201', userId: '000000000000000000000001' }, update: { currentFocusTaskId: null } }
  ]);
  assert.deepEqual(
    bulkOps.map((entry) => entry.updateOne.filter._id),
    ['0000000000000000000003a1', '0000000000000000000003a1-completed']
  );
});

test('project restore restores archived canonical project tasks while keeping lifecycle state', async () => {
  const restoreHandler = getRouteHandler('PUT', '/projects/:id/restore');
  const ctx = createCtx({ params: { id: '000000000000000000000201' } });
  let bulkOps = null;
  let findProjectCalls = 0;

  await withPatchedMethods([
    {
      target: Project,
      key: 'findOne',
      value: async () => {
        findProjectCalls += 1;
        return createDoc({ _id: '000000000000000000000201', name: 'Alpha', status: 'completed', archived: true });
      }
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        assert.deepEqual(normalizeIds(query), { _id: '000000000000000000000201', userId: '000000000000000000000001' });
        assert.deepEqual(update, { archived: false, status: 'completed' });
        return createDoc({ _id: '000000000000000000000201', name: 'Alpha', status: 'completed', archived: false });
      }
    },
    {
      target: Task,
      key: 'find',
      value: async (query) => {
        assert.equal(
          hasClause(query, (clause) => clause.originModule === 'project' && clause.originId === '000000000000000000000201'),
          true
        );
        assert.equal(
          hasClause(query, (clause) => clause.archived === true),
          true
        );

        return [
          createDoc({ _id: '0000000000000000000003a1', status: 'active', archived: true, completed: false }),
          createDoc({ _id: '0000000000000000000003a1-completed', status: 'completed', archived: true, completed: true })
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

  assert.equal(findProjectCalls, 1);
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

test('task listing with projectId follows canonical project-origin reads only', async () => {
  const listHandler = getRouteHandler('GET', '/tasks');
  const ctx = createCtx({ query: { projectId: '000000000000000000000207' } });
  let capturedQuery = null;

  await withPatchedMethods([
    {
      target: Task,
      key: 'find',
      value: (query) => {
        capturedQuery = query;
        return {
          sort: async () => [
            createDoc({ _id: '0000000000000000000003a1', title: 'Visible task', originModule: 'project', originId: '000000000000000000000207', status: 'active', archived: false })
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
    hasClause(capturedQuery, (clause) => clause.linkedProjectId === '000000000000000000000207'),
    false
  );
  assert.equal(
    hasClause(capturedQuery, (clause) => clause.originModule === 'project' && clause.originId === '000000000000000000000207'),
    true
  );
  assert.deepEqual(ctx.body.map((task) => task._id), ['0000000000000000000003a1']);
});

test('completing a focused canonical project task clears project focus', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const ctx = createCtx({
    params: { id: '000000000000000000000301' },
    body: { completed: true, status: 'completed' }
  });
  const projectUpdates = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'findOne',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Ship it',
        status: 'active',
        archived: false,
        completed: false,
        originId: '000000000000000000000201',
        originModule: 'project'
      })
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Ship it',
        status: 'completed',
        archived: false,
        completed: true,
        originId: '000000000000000000000201',
        originModule: 'project'
      })
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => createDoc({ _id: '000000000000000000000201', name: 'Alpha', currentFocusTaskId: '000000000000000000000301' })
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        projectUpdates.push({ query, update });
      }
    }
  ], async () => {
    await updateHandler(ctx, async () => {});
  });

  assert.equal(ctx.body.status, 'completed');
  assert.deepEqual(normalizeIds(projectUpdates), [
    { query: { _id: '000000000000000000000201', userId: '000000000000000000000001' }, update: { currentFocusTaskId: null } }
  ]);
});

test('archiving or deleting a focused project-owned task clears project focus symmetrically', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const deleteHandler = getRouteHandler('DELETE', '/tasks/:id');
  const archiveCtx = createCtx({
    params: { id: '000000000000000000000301' },
    body: { archived: true }
  });
  const deleteCtx = createCtx({ params: { id: '000000000000000000000301' } });
  const projectUpdates = [];

  await withPatchedMethods([
    {
      target: Task,
      key: 'findOne',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Ship it',
        status: 'active',
        archived: false,
        completed: false,
        originModule: 'project',
        originId: '000000000000000000000201'
      })
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Ship it',
        status: 'active',
        archived: true,
        completed: false,
        originModule: 'project',
        originId: '000000000000000000000201'
      })
    },
    {
      target: Task,
      key: 'findOneAndDelete',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Ship it',
        originModule: 'project',
        originId: '000000000000000000000201'
      })
    },
    {
      target: Project,
      key: 'findOne',
      value: async () => createDoc({ _id: '000000000000000000000201', name: 'Alpha', currentFocusTaskId: '000000000000000000000301' })
    },
    {
      target: Project,
      key: 'findOneAndUpdate',
      value: async (query, update) => {
        projectUpdates.push({ query, update });
      }
    }
  ], async () => {
    await updateHandler(archiveCtx, async () => {});
    await deleteHandler(deleteCtx, async () => {});
  });

  assert.equal(archiveCtx.body.archived, true);
  assert.equal(deleteCtx.status, 204);
  assert.deepEqual(normalizeIds(projectUpdates), [
    { query: { _id: '000000000000000000000201', userId: '000000000000000000000001' }, update: { currentFocusTaskId: null } },
    { query: { _id: '000000000000000000000201', userId: '000000000000000000000001' }, update: { currentFocusTaskId: null } }
  ]);
});

test('archived task listing reads only the archived flag', async () => {
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
            createDoc({ _id: 'archived-task', title: 'Archived task', status: 'active', archived: true, completed: false })
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
    false
  );
  assert.deepEqual(ctx.body, [
    {
      _id: 'archived-task',
      title: 'Archived task',
      status: 'active',
      archived: true,
      completed: false
    }
  ]);
});

test('restoring an archived task preserves existing lifecycle state', async () => {
  const updateHandler = getRouteHandler('PUT', '/tasks/:id');
  const updateCtx = createCtx({
    params: { id: '000000000000000000000301' },
    body: { archived: false }
  });
  let updatePayload = null;

  await withPatchedMethods([
    {
      target: Task,
      key: 'findOne',
      value: async () => createDoc({
        _id: '000000000000000000000301',
        title: 'Archived task',
        status: 'completed',
        archived: true,
        completed: true
      })
    },
    {
      target: Task,
      key: 'findOneAndUpdate',
      value: async (_query, update) => {
        updatePayload = update;
        return createDoc({
          _id: '000000000000000000000301',
          title: 'Archived task',
          status: 'completed',
          archived: update.archived,
          completed: true
        });
      }
    }
  ], async () => {
    await updateHandler(updateCtx, async () => {});
  });

  assert.deepEqual(updatePayload, {
    archived: false
  });
  assert.equal(updateCtx.body.archived, false);
  assert.equal(updateCtx.body.status, 'completed');
  assert.equal(updateCtx.body.completed, true);
});
