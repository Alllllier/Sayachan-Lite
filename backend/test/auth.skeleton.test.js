const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const Invite = require('../src/models/Invite');
const Session = require('../src/models/Session');
const authService = require('../src/services/authService');
const routes = require('../src/routes/index.js');

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
  return layer.stack[0];
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
        createdUser = createDoc({ _id: 'tester-1', createdAt: new Date(), ...payload });
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
    assert.equal(invite.usedBy, 'tester-1');
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
    _id: 'tester-1',
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
        sessionCreated = Boolean(payload.tokenHash && payload.userId === 'tester-1');
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
        userId: 'tester-1',
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
        _id: 'tester-1',
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

test('owner-only invite routes reject tester users', async () => {
  const handler = getRouteHandler('POST', '/owner/invites');
  const ctx = {
    state: {
      user: { _id: 'tester-1', role: 'tester', email: 'tester@example.com' }
    },
    status: 200,
    body: undefined
  };

  await handler(ctx, async () => {});

  assert.equal(ctx.status, 403);
  assert.deepEqual(ctx.body, { error: 'Owner access required' });
});
