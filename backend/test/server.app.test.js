import test from 'node:test';
import assert from 'node:assert/strict';

import authService from '../dist/services/authService.js';
import { allowedOrigins, createApp } from '../dist/server.js';

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1');
    server.once('listening', () => resolve(server));
    server.once('error', reject);
  });
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function requestKoaApp(app, path, options = {}) {
  const server = await listen(app);
  const { port } = server.address();

  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, options);
  } finally {
    await closeServer(server);
  }
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

test('allowedOrigins supports comma-separated FRONTEND_ORIGINS', () => {
  const originalEnv = { ...process.env };

  try {
    process.env = {
      ...originalEnv,
      FRONTEND_ORIGINS: 'http://localhost:5173, https://sayachan.example '
    };

    assert.deepEqual(allowedOrigins(), [
      'http://localhost:5173',
      'https://sayachan.example'
    ]);
  } finally {
    process.env = originalEnv;
  }
});

test('createApp wires CORS only for configured origins', async () => {
  const app = createApp({
    corsOrigins: ['https://sayachan.example'],
    trustProxy: true
  });

  assert.equal(app.proxy, true);

  const allowedResponse = await requestKoaApp(app, '/health', {
    headers: { Origin: 'https://sayachan.example' }
  });
  const deniedResponse = await requestKoaApp(app, '/health', {
    headers: { Origin: 'https://unknown.example' }
  });

  assert.equal(allowedResponse.headers.get('access-control-allow-origin'), 'https://sayachan.example');
  assert.equal(deniedResponse.headers.get('access-control-allow-origin'), null);
});

test('createApp allowedMethods returns 405 and Allow header for matched path with wrong method', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });

  const response = await requestKoaApp(app, '/health', { method: 'POST' });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'HEAD, GET');
});

test('createApp returns stable JSON 404 for unmatched routes', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async () => ({ _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' })
    }
  ], async () => {
    const response = await requestKoaApp(app, '/does-not-exist', {
      headers: { Authorization: 'Bearer test-session' }
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: 'Not Found' });
  });
});
