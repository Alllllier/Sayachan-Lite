import test from 'node:test';
import assert from 'node:assert/strict';

import authService from '../dist/services/authService.js';
import aiService from '../dist/services/aiService.js';
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

function parseSseEvents(text) {
  return text
    .trim()
    .split(/\n\n/)
    .filter(Boolean)
    .map((block) => {
      const eventLine = block.split('\n').find((line) => line.startsWith('event: '));
      const dataLine = block.split('\n').find((line) => line.startsWith('data: '));
      return {
        event: eventLine?.slice('event: '.length),
        data: dataLine ? JSON.parse(dataLine.slice('data: '.length)) : null
      };
    });
}

function productContextFixture() {
  return {
    packetType: 'product_context_snapshot',
    version: 1,
    status: 'available',
    generatedAt: '2026-05-20T00:00:00.000Z',
    sources: ['projects', 'tasks', 'notes'],
    limits: {
      maxProjects: 5,
      maxTasks: 8,
      maxNotes: 5,
      noteExcerptChars: 280
    },
    projects: [{
      id: 'project-1',
      name: 'Route project',
      summary: 'Route smoke product context',
      status: 'in_progress',
      isPinned: true,
      currentFocusTaskTitle: 'Route focus task',
      updatedAt: '2026-05-20T00:00:00.000Z'
    }],
    tasks: [],
    notes: [],
    omitted: []
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

test('authenticated /ai/chat reaches controlled private-core chat path and returns reply shape', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  const originalProvider = process.env.SAYACHAN_AI_PROVIDER;
  let loadedToken;
  let capturedChatCall;
  let productContextUserId;
  const productContext = productContextFixture();

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' };
      }
    }
  ], async () => {
    process.env.SAYACHAN_AI_PROVIDER = 'openai';
    const restoreProviderReady = aiService.__test__.setChatProviderKeyCheckForTest(() => true);
    const restoreProductContextBuilder = aiService.__test__.setProductContextBuilderForTest(async (userId) => {
      productContextUserId = userId?.toHexString();
      return productContext;
    });
    const restoreChatRunner = aiService.__test__.setChatRunnerForTest(async (messages, context, options) => {
      capturedChatCall = { messages, context, options };
      return { reply: 'authenticated smoke ok' };
    });

    try {
      const response = await requestKoaApp(app, '/ai/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer route-smoke-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello from route smoke' }],
          context: { activeTask: 'smoke-task' },
          runtimeControls: {
            personalityBaseline: 'warm',
            lastUserMessage: 'hello from route smoke'
          }
        })
      });
      const body = await response.json();

      assert.equal(loadedToken, 'route-smoke-session');
      assert.equal(productContextUserId, '000000000000000000000001');
      assert.equal(response.status, 200);
      assert.deepEqual(body, { reply: 'authenticated smoke ok' });
      assert.deepEqual(capturedChatCall.messages, [{ role: 'user', content: 'hello from route smoke' }]);
      assert.deepEqual(capturedChatCall.context, { activeTask: 'smoke-task', productContext });
      assert.equal(capturedChatCall.options.runtimeControls.personalityBaseline, 'warm');
      assert.equal(capturedChatCall.options.runtimeControls.lastUserMessage, 'hello from route smoke');
      assert.equal(capturedChatCall.options.runtimeControls.provider, 'openai');
      assert.equal(typeof capturedChatCall.options.runtimeControls.toolExecutor, 'function');
      assert.deepEqual(capturedChatCall.options.runtimeControls.tools, {
        enabled: true,
        maxToolCallsPerTurn: 3,
        maxToolRounds: 2,
        toolTimeoutMs: 8000,
        maxToolResultChars: 4000
      });
    } finally {
      restoreChatRunner();
      restoreProductContextBuilder();
      restoreProviderReady();
      if (originalProvider === undefined) {
        delete process.env.SAYACHAN_AI_PROVIDER;
      } else {
        process.env.SAYACHAN_AI_PROVIDER = originalProvider;
      }
    }
  });
});

test('authenticated /ai/chat/stream reaches controlled private-core stream path and returns SSE events', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  const originalProvider = process.env.SAYACHAN_AI_PROVIDER;
  let loadedToken;
  let capturedStreamCall;
  let productContextUserId;
  const productContext = productContextFixture();

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' };
      }
    }
  ], async () => {
    process.env.SAYACHAN_AI_PROVIDER = 'openai';
    const restoreProviderReady = aiService.__test__.setChatProviderKeyCheckForTest(() => true);
    const restoreProductContextBuilder = aiService.__test__.setProductContextBuilderForTest(async (userId) => {
      productContextUserId = userId?.toHexString();
      return productContext;
    });
    const restoreChatStreamRunner = aiService.__test__.setChatStreamRunnerForTest(async function* (messages, context, options) {
      capturedStreamCall = { messages, context, options };
      yield { packetType: 'chat_stream_event', version: 1, type: 'text_delta', delta: 'hello ', text: 'hello ' };
      yield { packetType: 'chat_stream_event', version: 1, type: 'text_delta', delta: 'stream', text: 'hello stream' };
      yield { packetType: 'chat_stream_event', version: 1, type: 'completed', text: 'hello stream', output: { reply: 'hello stream' } };
    });

    try {
      const response = await requestKoaApp(app, '/ai/chat/stream', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer route-stream-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello from stream route' }],
          context: { activeTask: 'stream-smoke-task' },
          runtimeControls: {
            personalityBaseline: 'warm',
            lastUserMessage: 'hello from stream route'
          }
        })
      });
      const events = parseSseEvents(await response.text());

      assert.equal(loadedToken, 'route-stream-session');
      assert.equal(productContextUserId, '000000000000000000000001');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
      assert.deepEqual(events.map((event) => event.event), ['text_delta', 'text_delta', 'completed']);
      assert.deepEqual(events.map((event) => event.data.type), ['text_delta', 'text_delta', 'completed']);
      assert.equal(events[0].data.delta, 'hello ');
      assert.equal(events[1].data.delta, 'stream');
      assert.deepEqual(events[2].data.output, { reply: 'hello stream' });
      assert.deepEqual(capturedStreamCall.messages, [{ role: 'user', content: 'hello from stream route' }]);
      assert.deepEqual(capturedStreamCall.context, { activeTask: 'stream-smoke-task', productContext });
      assert.equal(capturedStreamCall.options.runtimeControls.personalityBaseline, 'warm');
      assert.equal(capturedStreamCall.options.runtimeControls.lastUserMessage, 'hello from stream route');
      assert.equal(capturedStreamCall.options.runtimeControls.provider, 'openai');
      assert.equal(typeof capturedStreamCall.options.runtimeControls.toolExecutor, 'function');
      assert.deepEqual(capturedStreamCall.options.runtimeControls.tools, {
        enabled: true,
        maxToolCallsPerTurn: 3,
        maxToolRounds: 2,
        toolTimeoutMs: 8000,
        maxToolResultChars: 4000
      });
    } finally {
      restoreChatStreamRunner();
      restoreProductContextBuilder();
      restoreProviderReady();
      if (originalProvider === undefined) {
        delete process.env.SAYACHAN_AI_PROVIDER;
      } else {
        process.env.SAYACHAN_AI_PROVIDER = originalProvider;
      }
    }
  });
});

test('authenticated /ai/chat/stream returns streaming fallback without calling runner when provider is unavailable', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let streamRunnerCalled = false;

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async () => ({ _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' })
    }
  ], async () => {
    const restoreProviderReady = aiService.__test__.setChatProviderKeyCheckForTest(() => false);
    const restoreChatStreamRunner = aiService.__test__.setChatStreamRunnerForTest(async function* () {
      streamRunnerCalled = true;
      yield { packetType: 'chat_stream_event', version: 1, type: 'completed', text: 'unexpected', output: { reply: 'unexpected' } };
    });

    try {
      const response = await requestKoaApp(app, '/ai/chat/stream', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer route-stream-fallback-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello stream fallback route' }],
          context: { activeTask: 'stream-fallback-smoke-task' },
          runtimeControls: {
            personalityBaseline: 'warm',
            lastUserMessage: 'hello stream fallback route'
          }
        })
      });
      const events = parseSseEvents(await response.text());

      assert.equal(response.status, 200);
      assert.deepEqual(events.map((event) => event.event), ['text_delta', 'completed']);
      assert.equal(events.at(-1).data.output.reply, '我在这，我们先把当前最重要的一步理清楚。');
      assert.equal(streamRunnerCalled, false);
    } finally {
      restoreChatStreamRunner();
      restoreProviderReady();
    }
  });
});

test('authenticated /ai/chat returns fallback without calling chat runner when provider is unavailable', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let loadedToken;
  let chatRunnerCalled = false;

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' };
      }
    }
  ], async () => {
    const restoreProviderReady = aiService.__test__.setChatProviderKeyCheckForTest(() => false);
    const restoreChatRunner = aiService.__test__.setChatRunnerForTest(async () => {
      chatRunnerCalled = true;
      throw new Error('chat runner should not be called when provider is unavailable');
    });

    try {
      const response = await requestKoaApp(app, '/ai/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer route-fallback-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello fallback route' }],
          context: { activeTask: 'fallback-smoke-task' },
          runtimeControls: {
            personalityBaseline: 'warm',
            lastUserMessage: 'hello fallback route'
          }
        })
      });
      const body = await response.json();

      assert.equal(loadedToken, 'route-fallback-session');
      assert.equal(response.status, 200);
      assert.deepEqual(body, { reply: '我在这，我们先把当前最重要的一步理清楚。' });
      assert.equal(chatRunnerCalled, false);
    } finally {
      restoreChatRunner();
      restoreProviderReady();
    }
  });
});

test('authenticated /ai/chat returns fallback when controlled chat runner throws', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let loadedToken;
  let chatRunnerCalled = false;

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' };
      }
    }
  ], async () => {
    const restoreProviderReady = aiService.__test__.setChatProviderKeyCheckForTest(() => true);
    const restoreChatRunner = aiService.__test__.setChatRunnerForTest(async () => {
      chatRunnerCalled = true;
      throw new Error('controlled chat runner failure');
    });

    try {
      const response = await requestKoaApp(app, '/ai/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer route-runner-error-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello runner error route' }],
          context: { activeTask: 'runner-error-smoke-task' },
          runtimeControls: {
            personalityBaseline: 'warm',
            lastUserMessage: 'hello runner error route'
          }
        })
      });
      const body = await response.json();

      assert.equal(loadedToken, 'route-runner-error-session');
      assert.equal(response.status, 200);
      assert.deepEqual(body, { reply: '我在这，我们先把当前最重要的一步理清楚。' });
      assert.equal(chatRunnerCalled, true);
    } finally {
      restoreChatRunner();
      restoreProviderReady();
    }
  });
});
