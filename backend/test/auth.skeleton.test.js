import test from 'node:test';
import assert from 'node:assert/strict';

import User from '../dist/models/User.js';
import Invite from '../dist/models/Invite.js';
import Session from '../dist/models/Session.js';
import authService from '../dist/services/authService.js';
import maintenanceService from '../dist/services/maintenanceService.js';
import { authMiddleware } from '../dist/middleware/app/auth.js';
import { errorBoundary } from '../dist/middleware/app/errorBoundary.js';
import routes from '../dist/routes/index.js';

function createDoc(data) {
  return {
    ...data,
    toObject() {
      return { ...data };
    },
    async save() {
      this.saved = true;
      return this;
    }
  };
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

function createAuthRouteCtx(body = {}) {
  const cookies = {
    writes: [],
    get: () => null,
    set(name, value, options) {
      this.writes.push({ name, value, options });
    }
  };

  return {
    request: { body },
    state: {},
    cookies,
    status: 200,
    body: undefined
  };
}

test('tester registration requires a valid single-use invite code', async () => {
  const invite = createDoc({
    _id: 'invite-1',
    codeHash: authService.__test__.hashInviteCode('OPEN-DOOR'),
    expiresAt: new Date(Date.now() + 100000),
    revokedAt: null,
    usedAt: null,
    usedBy: null
  });

  let createdUser;
  await withPatchedMethods([
    { target: User, key: 'findOne', value: async () => null },
    {
      target: User,
      key: 'create',
      value: async (payload) => {
        createdUser = createDoc({ _id: '000000000000000000000011', createdAt: new Date(), ...payload });
        return createdUser;
      }
    },
    { target: Invite, key: 'findOne', value: async () => invite }
  ], async () => {
    const user = await authService.registerTester({
      email: 'tester@example.com',
      password: 'long-enough',
      inviteCode: 'open-door'
    });

    assert.equal(user.email, 'tester@example.com');
    assert.equal(user.role, 'tester');
    assert.equal(createdUser.role, 'tester');
    assert.equal(Boolean(invite.usedAt), true);
    assert.equal(invite.usedBy, '000000000000000000000011');
  });
});

test('revoked, used, and expired invites are rejected before user creation', async () => {
  const invalidInvites = [
    createDoc({ revokedAt: new Date(), usedAt: null, expiresAt: new Date(Date.now() + 100000) }),
    createDoc({ revokedAt: null, usedAt: new Date(), expiresAt: new Date(Date.now() + 100000) }),
    createDoc({ revokedAt: null, usedAt: null, expiresAt: new Date(Date.now() - 100000) })
  ];

  for (const invalidInvite of invalidInvites) {
    await withPatchedMethods([
      { target: User, key: 'findOne', value: async () => null },
      {
        target: User,
        key: 'create',
        value: async () => {
          throw new Error('registration should stop before user creation');
        }
      },
      { target: Invite, key: 'findOne', value: async () => invalidInvite }
    ], async () => {
      await assert.rejects(
        () => authService.registerTester({
          email: 'tester@example.com',
          password: 'long-enough',
          inviteCode: 'bad-code'
        }),
        /Invite code is invalid/
      );
    });
  }
});

test('login creates a cookie-backed session and logout deletes it', async () => {
  const password = authService.__test__.hashPassword('long-enough');
  const user = createDoc({
    _id: '000000000000000000000011',
    email: 'tester@example.com',
    role: 'tester',
    disabled: false,
    ...password
  });

  let sessionCreated = false;
  let logoutDeleted = false;

  await withPatchedMethods([
    { target: User, key: 'findOne', value: async () => user },
    {
      target: Session,
      key: 'create',
      value: async (payload) => {
        sessionCreated = Boolean(payload.tokenHash && payload.userId === '000000000000000000000011');
        return createDoc(payload);
      }
    },
    {
      target: Session,
      key: 'findOneAndDelete',
      value: async () => {
        logoutDeleted = true;
      }
    }
  ], async () => {
    const loginResult = await authService.login({
      email: 'tester@example.com',
      password: 'long-enough'
    });
    assert.equal(loginResult.user.email, 'tester@example.com');
    assert.equal(typeof loginResult.sessionToken, 'string');
    assert.equal(sessionCreated, true);

    await authService.logout(loginResult.sessionToken);
    assert.equal(logoutDeleted, true);
  });
});

test('disabled accounts are rejected on the next authenticated session load', async () => {
  let sessionDeleted = false;

  await withPatchedMethods([
    {
      target: Session,
      key: 'findOne',
      value: async () => createDoc({
        _id: 'session-1',
        userId: '000000000000000000000011',
        expiresAt: new Date(Date.now() + 100000)
      })
    },
    {
      target: Session,
      key: 'findByIdAndDelete',
      value: async () => {
        sessionDeleted = true;
      }
    },
    {
      target: User,
      key: 'findById',
      value: async () => createDoc({
        _id: '000000000000000000000011',
        email: 'tester@example.com',
        role: 'tester',
        disabled: true
      })
    }
  ], async () => {
    const loadedUser = await authService.loadUserForSession('session-token');
    assert.equal(loadedUser, null);
    assert.equal(sessionDeleted, true);
  });
});

test('auth middleware accepts bearer session tokens when cookies are unavailable', async () => {
  let loadedToken;

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: 'owner-1', email: 'owner@example.com', role: 'owner' };
      }
    }
  ], async () => {
    const ctx = {
      path: '/notes',
      state: {},
      cookies: {
        get: () => null,
        set: () => {}
      },
      get: (name) => (name === 'Authorization' ? 'Bearer session-token' : '')
    };
    let nextCalled = false;

    await authMiddleware(ctx, async () => {
      nextCalled = true;
    });

    assert.equal(loadedToken, 'session-token');
    assert.equal(ctx.state.user.email, 'owner@example.com');
    assert.equal(nextCalled, true);
  });
});

test('owner-only invite routes reject tester users', async () => {
  const handler = getRouteHandler('POST', '/owner/invites');
  const ctx = {
    state: {
      user: { _id: '000000000000000000000011', role: 'tester', email: 'tester@example.com' }
    },
    status: 200,
    body: undefined
  };

  await handler(ctx, async () => {});

  assert.equal(ctx.status, 403);
  assert.deepEqual(ctx.body, { error: 'Owner access required' });
});

test('owner maintenance cleanup requires explicit confirmation and owner access', async () => {
  const handler = getRouteHandler('GET', '/owner/maintenance/clean-legacy-product-status');
  const calls = [];

  await withPatchedMethods([
    {
      target: maintenanceService,
      key: 'cleanLegacyProductStatus',
      value: async () => {
        calls.push('clean');
        return {
          packetType: 'legacy_product_status_cleanup',
          version: 1,
          notes: { matchedCount: 1, modifiedCount: 1 },
          projects: { matchedCount: 2, modifiedCount: 2 }
        };
      }
    }
  ], async () => {
    const testerCtx = {
      query: { confirm: 'clean-legacy-product-status' },
      state: {
        user: { _id: '000000000000000000000011', role: 'tester', email: 'tester@example.com' }
      },
      status: 200,
      body: undefined
    };
    await handler(testerCtx, async () => {});
    assert.equal(testerCtx.status, 403);
    assert.deepEqual(testerCtx.body, { error: 'Owner access required' });

    const missingConfirmCtx = {
      query: {},
      state: {
        user: { _id: '000000000000000000000001', role: 'owner', email: 'owner@example.com' }
      },
      status: 200,
      body: undefined
    };
    await handler(missingConfirmCtx, async () => {});
    assert.equal(missingConfirmCtx.status, 400);
    assert.deepEqual(missingConfirmCtx.body, { error: 'Maintenance cleanup confirmation required' });

    const ownerCtx = {
      query: { confirm: 'clean-legacy-product-status' },
      state: {
        user: { _id: '000000000000000000000001', role: 'owner', email: 'owner@example.com' }
      },
      status: 200,
      body: undefined
    };
    await handler(ownerCtx, async () => {});
    assert.deepEqual(ownerCtx.body, {
      packetType: 'legacy_product_status_cleanup',
      version: 1,
      notes: { matchedCount: 1, modifiedCount: 1 },
      projects: { matchedCount: 2, modifiedCount: 2 }
    });
    assert.deepEqual(calls, ['clean']);
  });
});

test('auth mutation routes validate request bodies before service writes', async () => {
  const bootstrapOwnerHandler = getRouteHandler('POST', '/auth/bootstrap-owner');
  const registerHandler = getRouteHandler('POST', '/auth/register');
  const loginHandler = getRouteHandler('POST', '/auth/login');

  const forbiddenWrite = async () => {
    throw new Error('auth validation should stop before service writes');
  };

  await withPatchedMethods([
    { target: authService, key: 'bootstrapOwner', value: forbiddenWrite },
    { target: authService, key: 'registerTester', value: forbiddenWrite },
    { target: authService, key: 'login', value: forbiddenWrite }
  ], async () => {
    const cases = [
      [bootstrapOwnerHandler, createAuthRouteCtx(null)],
      [bootstrapOwnerHandler, createAuthRouteCtx({})],
      [bootstrapOwnerHandler, createAuthRouteCtx({ email: '', password: 'long-enough' })],
      [bootstrapOwnerHandler, createAuthRouteCtx({ email: 'owner@example.com', password: 'short' })],
      [registerHandler, createAuthRouteCtx([])],
      [registerHandler, createAuthRouteCtx({ email: 'tester@example.com', password: 'long-enough' })],
      [registerHandler, createAuthRouteCtx({ email: 'tester@example.com', password: 'long-enough', inviteCode: '   ' })],
      [loginHandler, createAuthRouteCtx({ email: 'tester@example.com', password: 42 })]
    ];

    for (const [handler, ctx] of cases) {
      await handler(ctx, async () => {});
      assert.equal(ctx.status, 400);
      assert.deepEqual(ctx.body, { error: 'Invalid request body' });
    }
  });
});

test('auth mutation validation strips unknown fields from service DTOs', async () => {
  const bootstrapOwnerHandler = getRouteHandler('POST', '/auth/bootstrap-owner');
  const registerHandler = getRouteHandler('POST', '/auth/register');
  const loginHandler = getRouteHandler('POST', '/auth/login');
  const calls = {};

  await withPatchedMethods([
    {
      target: authService,
      key: 'bootstrapOwner',
      value: async (body) => {
        calls.bootstrapOwner = body;
        return { _id: 'owner-1', email: body.email, role: 'owner' };
      }
    },
    {
      target: authService,
      key: 'registerTester',
      value: async (body) => {
        calls.registerTester = body;
        return { _id: 'tester-1', email: body.email, role: 'tester' };
      }
    },
    {
      target: authService,
      key: 'login',
      value: async (body) => {
        calls.login = body;
        return {
          sessionToken: 'session-token',
          user: { _id: 'tester-1', email: body.email, role: 'tester' }
        };
      }
    }
  ], async () => {
    const bootstrapBody = { email: 'owner@example.com', password: 'long-enough', unknownField: 'kept raw' };
    const bootstrapCtx = createAuthRouteCtx(bootstrapBody);
    await bootstrapOwnerHandler(bootstrapCtx, async () => {});

    const registerBody = {
      email: 'tester@example.com',
      password: 'long-enough',
      inviteCode: 'OPEN-DOOR',
      unknownField: 'kept raw'
    };
    const registerCtx = createAuthRouteCtx(registerBody);
    await registerHandler(registerCtx, async () => {});

    const loginBody = { email: 'tester@example.com', password: 'long-enough', unknownField: 'kept raw' };
    const loginCtx = createAuthRouteCtx(loginBody);
    await loginHandler(loginCtx, async () => {});

    assert.equal(bootstrapCtx.status, 201);
    assert.equal(registerCtx.status, 201);
    assert.equal(loginCtx.status, 200);
    assert.equal(bootstrapCtx.request.body.unknownField, 'kept raw');
    assert.equal(registerCtx.request.body.unknownField, 'kept raw');
    assert.equal(loginCtx.request.body.unknownField, 'kept raw');
    assert.equal(loginCtx.cookies.writes.length, 1);
  });

  assert.deepEqual(calls.bootstrapOwner, { email: 'owner@example.com', password: 'long-enough' });
  assert.deepEqual(calls.registerTester, {
    email: 'tester@example.com',
    password: 'long-enough',
    inviteCode: 'OPEN-DOOR'
  });
  assert.deepEqual(calls.login, { email: 'tester@example.com', password: 'long-enough' });
});
