import test from 'node:test';
import assert from 'node:assert/strict';

import authService from '../dist/services/authService.js';
import aiService from '../dist/services/aiService.js';
import sayachanService from '../dist/services/sayachanService.js';
import sayachanHostToolService from '../dist/services/sayachanHostToolService.js';
import { buildSayaDeskHostCapabilityManifest } from '../dist/services/sayachanHostContextService.js';
import Note from '../dist/models/Note.js';
import Project from '../dist/models/Project.js';
import Task from '../dist/models/Task.js';
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

function createRuntimeDoc(data) {
  return {
    ...data,
    toObject() {
      return { ...data };
    }
  };
}

test('SayaDesk host capability manifest exposes provider-facing tool contracts', () => {
  const manifest = buildSayaDeskHostCapabilityManifest();

  assert.equal(manifest.packetType, 'saya_desk_host_capability_manifest');
  assert.equal(manifest.version, 1);
  assert.equal(manifest.status, 'executable');
  assert.equal(manifest.tools.length, 5);

  for (const tool of manifest.tools) {
    assert.equal(typeof tool.description, 'string');
    assert.equal(typeof tool.parameterSchema, 'object');
    assert.equal(Object.hasOwn(tool, 'label'), false);
    assert.equal(Object.hasOwn(tool, 'risk'), false);
    assert.equal(Object.hasOwn(tool, 'requiresConfirmation'), false);
    assert.equal(Object.hasOwn(tool, 'execution'), false);
    assert.equal(Object.hasOwn(tool, 'endpoint'), false);
    assert.equal(Object.hasOwn(tool, 'authorization'), false);
  }

  const search = manifest.tools.find((tool) => tool.name === 'saya_desk.search_product_context');
  assert.ok(search);
  assert.equal(search.parameterSchema.type, 'object');
  assert.equal(search.parameterSchema.additionalProperties, false);
  assert.deepEqual(search.parameterSchema.properties.matchMode.enum, ['any', 'all']);
  const listNotes = manifest.tools.find((tool) => tool.name === 'saya_desk.list_notes');
  assert.ok(listNotes);
  assert.equal(listNotes.parameterSchema.type, 'object');
  assert.equal(listNotes.parameterSchema.additionalProperties, false);
  assert.deepEqual(listNotes.parameterSchema.properties.sortBy.enum, ['updatedAt', 'createdAt']);
  assert.equal(listNotes.parameterSchema.properties.limit.maximum, 30);
});

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

test('sayachan host search expression normalizes safe term arrays', () => {
  assert.deepEqual(
    sayachanHostToolService.__test__.buildSearchExpression({
      query: '猫咪',
      text: '备用文本',
      terms: [' 猫 ', '猫咪', '猫', '', 42],
      matchMode: 'any',
      domains: ['notes', 'unknown', 'tasks']
    }),
    {
      query: '猫咪',
      terms: ['猫', '猫咪'],
      matchMode: 'any',
      domains: ['notes', 'tasks']
    }
  );

  assert.deepEqual(
    sayachanHostToolService.__test__.buildSearchExpression({
      query: '猫咪',
      matchMode: 'unsupported',
      domains: ['unknown']
    }),
    {
      query: '猫咪',
      terms: ['猫咪'],
      matchMode: 'any',
      domains: ['notes', 'projects', 'tasks']
    }
  );
});

test('sayachan host list notes tool returns recent compact notes for current user', async () => {
  const seen = {};

  await withPatchedMethods([
    { target: Note.db, key: 'readyState', value: 1 },
    { target: Project.db, key: 'readyState', value: 1 },
    { target: Task.db, key: 'readyState', value: 1 },
    {
      target: Note,
      key: 'find',
      value: (query) => {
        seen.query = query;
        return {
          sort(sort) {
            seen.sort = sort;
            return {
              limit(limit) {
                seen.limit = limit;
                return Promise.resolve([
                  createRuntimeDoc({
                    _id: '000000000000000000000101',
                    title: '吃饭',
                    content: '啦'.repeat(400),
                    createdAt: new Date('2026-05-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-02T00:00:00.000Z')
                  }),
                  createRuntimeDoc({
                    _id: '000000000000000000000102',
                    title: '生日',
                    content: '我的生日是 xxxx，到时候要请朋友吃饭',
                    createdAt: new Date('2026-05-03T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-04T00:00:00.000Z')
                  })
                ]);
              }
            };
          }
        };
      }
    }
  ], async () => {
    const result = await sayachanHostToolService.executeHostTool({
      requestId: 'tool-request-list-notes',
      turnId: 'turn-1',
      hostId: 'saya-desk',
      hostUserId: '000000000000000000000001',
      capability: 'saya_desk.list_notes',
      arguments: {
        sortBy: 'createdAt',
        limit: 1_000
      },
      risk: 'read_only',
      requiresConfirmation: false,
      sourceTrace: ['test']
    }, {
      userId: {
        toHexString: () => '000000000000000000000001'
      }
    });

    assert.equal(result.status, 'completed');
    assert.equal(result.capability, 'saya_desk.list_notes');
    assert.deepEqual(seen.query.$and[0], { archived: { $ne: true } });
    assert.equal(seen.query.$and[1].userId.toHexString(), '000000000000000000000001');
    assert.deepEqual(seen.sort, { createdAt: -1 });
    assert.equal(seen.limit, 31);
    assert.equal(result.result.notes.length, 2);
    assert.equal(result.result.notes[0].title, '吃饭');
    assert.equal(result.result.notes[0].excerpt.length, 302);
    assert.ok(result.result.notes[0].excerpt.endsWith('...'));
    assert.equal(result.result.notes[1].title, '生日');
    assert.equal(result.result.sortBy, 'createdAt');
    assert.equal(result.result.limit, 30);
    assert.equal(result.resultSummary, 'Listed 2 note(s).');
    assert.deepEqual(result.sourceReceipts, [
      { type: 'note', title: '吃饭' },
      { type: 'note', title: '生日' }
    ]);
    assert.equal(result.truncated, false);
    assert.deepEqual(result.sourceTrace, ['sayachan_host_tool_service', 'list_notes', 'test']);
  });
});

test('sayachan list notes tool chip omits individual note title', () => {
  assert.equal(
    sayachanService.__test__.toolActivityText(
      {
        capability: 'saya_desk.list_notes'
      },
      {
        sourceReceipts: [{ type: 'note', title: 'E2E-Inventory-随手记' }]
      }
    ),
    '查看笔记列表'
  );
});

test('sayachan search tool chip shows the searched query', () => {
  assert.equal(
    sayachanService.__test__.toolActivityText(
      {
        capability: 'saya_desk.search_product_context',
        arguments: {
          query: '猫咪 饮水'
        }
      },
      {
        sourceReceipts: [{ type: 'note', title: '猫咪饮水观察' }]
      }
    ),
    '搜索工作区内容：猫咪 饮水'
  );

  assert.equal(
    sayachanService.__test__.toolActivityText(
      {
        capability: 'saya_desk.search_product_context',
        arguments: {}
      },
      {
        sourceReceipts: [{ type: 'note', title: '猫咪饮水观察' }]
      }
    ),
    '搜索工作区内容'
  );
});

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
    const restoreMemoryContextBuilder = aiService.__test__.setMemoryContextBuilderForTest(async () => ({
      packetType: 'memory_context_snapshot',
      version: 1,
      status: 'available',
      generatedAt: '2026-05-21T00:00:00.000Z',
      source: 'memory_ledger_v1',
      items: [{ type: 'preference', content: 'Use plain language.', source: 'manual' }]
    }));
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
      assert.deepEqual(capturedChatCall.context.productContext, productContext);
      assert.equal(capturedChatCall.context.memoryContext.packetType, 'memory_context_snapshot');
      assert.equal(capturedChatCall.context.memoryContext.version, 1);
      assert.equal(capturedChatCall.context.memoryContext.status, 'available');
      assert.equal(capturedChatCall.context.memoryContext.source, 'memory_ledger_v1');
      assert.equal(capturedChatCall.context.memoryContext.items.length, 1);
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
      restoreMemoryContextBuilder();
      restoreProviderReady();
      if (originalProvider === undefined) {
        delete process.env.SAYACHAN_AI_PROVIDER;
      } else {
        process.env.SAYACHAN_AI_PROVIDER = originalProvider;
      }
    }
  });
});

test('authenticated /sayachan reaches Sayachan Core v4 advance bridge and returns reply shape', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let loadedToken;
  let capturedCoreRequest;
  let focusUserId;
  let requestedFocus;
  const focusSnapshot = {
    packetType: 'saya_desk_focus_snapshot',
    version: 1,
    source: 'saya_desk_authorized_focus',
    type: 'project',
    id: '000000000000000000000201',
    title: 'Route project',
    summary: 'Route smoke focus snapshot',
    status: 'in_progress',
    lifecycle: 'active',
    currentFocusTaskTitle: 'Route focus task',
    updatedAt: '2026-05-20T00:00:00.000Z'
  };
  const hostCapabilities = {
    packetType: 'saya_desk_host_capability_manifest',
    version: 1,
    status: 'declared_only',
    tools: [{
      name: 'saya_desk.search_product_context',
      description: 'Search authorized SayaDesk notes, projects, and tasks.',
      parameterSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          query: { type: 'string', minLength: 1 }
        }
      },
      resultSummary: 'Returns compact authorized workspace matches.'
    }]
  };

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
    const restoreFocusSnapshotBuilder = sayachanService.__test__.setFocusSnapshotBuilderForTest(async (focus, userId) => {
      requestedFocus = focus;
      focusUserId = userId?.toHexString();
      return focusSnapshot;
    });
    const restoreHostCapabilityManifestBuilder = sayachanService.__test__.setHostCapabilityManifestBuilderForTest(() => hostCapabilities);
    const restoreChatPersistenceAvailabilityCheck = sayachanService.__test__.setChatPersistenceAvailabilityCheckForTest(() => false);
    const restoreCoreTurnAdvanceRunner = sayachanService.__test__.setCoreTurnAdvanceRunnerForTest(async (request) => {
      capturedCoreRequest = request;
      return {
        turnId: 'turn-route-smoke',
        advanceId: 'adv-route-smoke',
        status: 'completed',
        assistantOutput: [
          {
            outputId: 'turn-route-smoke:activity-output:1',
            kind: 'activity_text',
            text: '我先回看一下项目里的记录。',
            sourceTrace: ['provider.activity']
          },
          {
            outputId: 'turn-route-smoke:final:1',
            kind: 'final_text',
            text: 'sayachan v4 advance ok',
            sourceTrace: ['provider.final']
          }
        ],
        toolProposals: [],
        trace: {
          traceId: 'turn-route-smoke',
          debugAvailable: true
        },
        debugTrace: {
          runtime: 'cognition-runtime',
          participation_profile: { name: 'user_input_advance' }
        }
      };
    });

    try {
      const response = await requestKoaApp(app, '/sayachan', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sayachan-v4-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          text: 'hello from v4 route',
          surface: 'project-detail',
          focus: {
            type: 'project',
            id: '000000000000000000000201'
          },
          options: {
            debug: true
          }
        })
      });
      const body = await response.json();

      assert.equal(loadedToken, 'sayachan-v4-session');
      assert.equal(focusUserId, '000000000000000000000001');
      assert.deepEqual(requestedFocus, {
        type: 'project',
        id: '000000000000000000000201'
      });
      assert.equal(response.status, 200);
      assert.deepEqual(body, {
        reply: 'sayachan v4 advance ok',
        turnId: 'turn-route-smoke',
        turnActivity: {
          defaultCollapsed: true,
          items: [
            {
              itemId: 'turn-route-smoke:activity:1',
              kind: 'assistant_progress',
              status: 'planned',
              text: '我先回看一下项目里的记录。',
              display: 'collapse_item',
              canonicalMessage: false,
              sourceTrace: ['provider.activity']
            }
          ]
        },
        trace: {
          traceId: 'turn-route-smoke',
          debugAvailable: true
        },
        debugTrace: {
          runtime: 'cognition-runtime',
          participation_profile: { name: 'user_input_advance' }
        }
      });
      assert.equal(capturedCoreRequest.host.hostId, 'saya-desk');
      assert.equal(capturedCoreRequest.host.surface, 'project-detail');
      assert.equal(capturedCoreRequest.host.hostUserId, '000000000000000000000001');
      assert.equal(capturedCoreRequest.input.text, 'hello from v4 route');
      assert.deepEqual(capturedCoreRequest.conversation.recentMessages, [
        { role: 'user', content: 'hello from v4 route' }
      ]);
      assert.deepEqual(capturedCoreRequest.host.authorizedContext, { focus: focusSnapshot });
      assert.deepEqual(capturedCoreRequest.hostToolManifest, hostCapabilities);
      assert.equal(Object.hasOwn(capturedCoreRequest.host.authorizedContext, 'host_capabilities'), false);
      assert.equal(Object.hasOwn(capturedCoreRequest.host.authorizedContext, 'productContext'), false);
      assert.equal(Object.hasOwn(capturedCoreRequest.host.authorizedContext, 'memoryContext'), false);
      assert.equal(Object.hasOwn(capturedCoreRequest.host.authorizedContext, 'chatFocus'), false);
      assert.equal(capturedCoreRequest.options.debug, true);
      assert.equal(Object.hasOwn(capturedCoreRequest.options, 'stream'), false);
    } finally {
      restoreCoreTurnAdvanceRunner();
      restoreChatPersistenceAvailabilityCheck();
      restoreHostCapabilityManifestBuilder();
      restoreFocusSnapshotBuilder();
    }
  });
});

test('authenticated /sayachan/stream emits host-orchestrated advance events', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let loadedToken;
  let capturedCoreRequest;
  const focusSnapshot = {
    packetType: 'saya_desk_focus_snapshot',
    version: 1,
    source: 'saya_desk_authorized_focus',
    type: 'note',
    id: '000000000000000000000301',
    title: 'Streaming note'
  };
  const hostCapabilities = {
    packetType: 'saya_desk_host_capability_manifest',
    version: 1,
    status: 'declared_only',
    tools: [{
      name: 'saya_desk.get_note_content',
      description: 'Read authorized note content by note id.',
      parameterSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          noteId: { type: 'string', minLength: 1 }
        }
      },
      resultSummary: 'Returns clipped note content and source receipt.'
    }]
  };

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
    const restoreFocusSnapshotBuilder = sayachanService.__test__.setFocusSnapshotBuilderForTest(async () => focusSnapshot);
    const restoreHostCapabilityManifestBuilder = sayachanService.__test__.setHostCapabilityManifestBuilderForTest(() => hostCapabilities);
    const restoreChatPersistenceAvailabilityCheck = sayachanService.__test__.setChatPersistenceAvailabilityCheckForTest(() => false);
    const restoreCoreTurnAdvanceStreamRunner = sayachanService.__test__.setCoreTurnAdvanceStreamRunnerForTest(async function* (request) {
      capturedCoreRequest = request;
      yield {
        packetType: 'sayachan_turn_advance_stream_event',
        version: 1,
        type: 'assistant_delta',
        delta: 'streamed ',
        text: 'streamed '
      };
      yield {
        packetType: 'sayachan_turn_advance_stream_event',
        version: 1,
        type: 'assistant_delta',
        delta: 'v4 reply',
        text: 'streamed v4 reply'
      };
      yield {
        packetType: 'sayachan_turn_advance_stream_event',
        version: 1,
        type: 'completed',
        result: {
          turnId: 'turn-stream',
          advanceId: 'adv-stream',
          status: 'completed',
          assistantOutput: [
            {
              outputId: 'turn-stream:final:1',
              kind: 'final_text',
              text: 'streamed v4 reply',
              sourceTrace: ['provider.final']
            }
          ],
          toolProposals: [],
          trace: {
            traceId: 'turn-stream',
            debugAvailable: true
          },
          debugTrace: {
            runtime: 'cognition-runtime',
            provider: 'openai',
            provider_model: 'gpt-5-nano',
            provider_response_id: 'resp-stream',
            advance_kind: 'user_input_advance',
            stage_summaries: [
              {
                stage_name: 'compile_provider_request',
                status: 'completed',
                notes: ['compiled'],
                source_trace: ['compiler.prompt']
              }
            ],
            source_trace: ['runtime.cognition_runtime']
          }
        }
      };
    });

    try {
      const response = await requestKoaApp(app, '/sayachan/stream', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sayachan-v4-stream-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          text: 'stream this v4 note',
          surface: 'note-detail',
          focus: {
            type: 'note',
            id: '000000000000000000000301'
          }
        })
      });
      const events = parseSseEvents(await response.text());

      assert.equal(loadedToken, 'sayachan-v4-stream-session');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
      assert.deepEqual(events.map((event) => event.event), ['assistant_delta', 'assistant_delta', 'completed']);
      assert.deepEqual(events.map((event) => event.data.type), ['assistant_delta', 'assistant_delta', 'completed']);
      assert.equal(events[0].data.delta, 'streamed ');
      assert.equal(events[1].data.delta, 'v4 reply');
      assert.equal(events[1].data.text, 'streamed v4 reply');
      assert.equal(events[2].data.reply, 'streamed v4 reply');
      assert.equal(events[2].data.turnActivity, undefined);
      assert.equal(events[2].data.debugTrace.provider_model, 'gpt-5-nano');
      assert.equal(events[2].data.debugTrace.stage_summaries[0].stage_name, 'compile_provider_request');
      assert.deepEqual(capturedCoreRequest.host.authorizedContext, { focus: focusSnapshot });
      assert.deepEqual(capturedCoreRequest.hostToolManifest, hostCapabilities);
      assert.equal(Object.hasOwn(capturedCoreRequest.options, 'stream'), false);
    } finally {
      restoreCoreTurnAdvanceStreamRunner();
      restoreChatPersistenceAvailabilityCheck();
      restoreHostCapabilityManifestBuilder();
      restoreFocusSnapshotBuilder();
    }
  });
});

test('authenticated /sayachan/stream streams tool activity before host execution', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  const capturedCoreRequests = [];

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async () => ({ _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' })
    }
  ], async () => {
    const restoreFocusSnapshotBuilder = sayachanService.__test__.setFocusSnapshotBuilderForTest(async () => null);
    const restoreHostCapabilityManifestBuilder = sayachanService.__test__.setHostCapabilityManifestBuilderForTest(() => ({
      packetType: 'saya_desk_host_capability_manifest',
      version: 1,
      status: 'declared_only',
      tools: [{
        name: 'saya_desk.get_note_content',
        description: 'Read authorized note content by note id.',
        parameterSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            noteId: { type: 'string', minLength: 1 }
          }
        },
        resultSummary: 'Returns clipped note content and source receipt.'
      }]
    }));
    const restoreChatPersistenceAvailabilityCheck = sayachanService.__test__.setChatPersistenceAvailabilityCheckForTest(() => false);
    const restoreCoreTurnAdvanceStreamRunner = sayachanService.__test__.setCoreTurnAdvanceStreamRunnerForTest(async function* (request) {
      capturedCoreRequests.push(request);
      if (!request.turnCursor) {
        yield {
          packetType: 'sayachan_turn_advance_stream_event',
          version: 1,
          type: 'tool_call_started',
          itemId: 'provider-tool-1',
          outputIndex: 0,
          providerToolName: 'saya_desk_get_note_content',
          providerCallId: 'provider-call-1'
        };
        yield {
          packetType: 'sayachan_turn_advance_stream_event',
          version: 1,
          type: 'assistant_delta',
          delta: '我先',
          text: '我先'
        };
        yield {
          packetType: 'sayachan_turn_advance_stream_event',
          version: 1,
          type: 'assistant_delta',
          delta: '回看一下相关笔记。',
          text: '我先回看一下相关笔记。'
        };
        yield {
          packetType: 'sayachan_turn_advance_stream_event',
          version: 1,
          type: 'completed',
          result: {
            turnId: 'turn-tool-stream',
            advanceId: 'turn-tool-stream:advance:1',
            turnCursor: 'cursor-tool-stream',
            status: 'needs_host_action',
            assistantOutput: [{
              outputId: 'turn-tool-stream:assistant-output:1',
              kind: 'activity_text',
              text: '我先回看一下相关笔记。',
              sourceTrace: ['provider.activity']
            }],
            toolProposals: [{
              proposalId: 'turn-tool-stream:tool-proposal:1',
              providerCallId: 'provider-call-1',
              providerToolName: 'saya_desk_get_note_content',
              capability: 'saya_desk.get_note_content',
              arguments: {},
              sourceTrace: ['provider.native_function_call']
            }],
            trace: {
              traceId: 'turn-tool-stream',
              debugAvailable: false
            }
          }
        };
        return;
      }

      yield {
        packetType: 'sayachan_turn_advance_stream_event',
        version: 1,
        type: 'assistant_delta',
        delta: '这次没有读到笔记内容。',
        text: '这次没有读到笔记内容。'
      };
      yield {
        packetType: 'sayachan_turn_advance_stream_event',
        version: 1,
        type: 'completed',
        result: {
          turnId: 'turn-tool-stream',
          advanceId: 'turn-tool-stream:advance:2',
          status: 'completed',
          assistantOutput: [{
            outputId: 'turn-tool-stream:assistant-output:2',
            kind: 'final_text',
            text: '这次没有读到笔记内容。',
            sourceTrace: ['provider.final']
          }],
          toolProposals: [],
          trace: {
            traceId: 'turn-tool-stream',
            debugAvailable: false
          }
        }
      };
    });

    try {
      const response = await requestKoaApp(app, '/sayachan/stream', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sayachan-v4-tool-stream-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          text: '帮我看看这篇笔记内容',
          surface: 'note-detail'
        })
      });
      const events = parseSseEvents(await response.text());

      assert.equal(response.status, 200);
      assert.deepEqual(
        events.map((event) => event.event),
        ['assistant_progress', 'assistant_progress', 'tool_status', 'assistant_delta', 'completed']
      );
      assert.equal(events[0].data.item.text, '我先');
      assert.equal(events[1].data.item.text, '我先回看一下相关笔记。');
      assert.equal(events[0].data.item.itemId, events[1].data.item.itemId);
      assert.equal(events[2].data.item.kind, 'tool_status');
      assert.equal(events[3].data.delta, '这次没有读到笔记内容。');
      assert.equal(events[4].data.reply, '这次没有读到笔记内容。');
      assert.equal(events[4].data.turnActivity.items.length, 2);
      assert.equal(capturedCoreRequests.length, 2);
      assert.equal(capturedCoreRequests[1].turnCursor, 'cursor-tool-stream');
      assert.equal(capturedCoreRequests[1].toolOutputs[0].providerCallId, 'provider-call-1');
      assert.ok(['denied', 'unavailable'].includes(capturedCoreRequests[1].toolOutputs[0].status));
    } finally {
      restoreCoreTurnAdvanceStreamRunner();
      restoreChatPersistenceAvailabilityCheck();
      restoreHostCapabilityManifestBuilder();
      restoreFocusSnapshotBuilder();
    }
  });
});

test('authenticated /sayachan rejects legacy v3-shaped body', async () => {
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
    const response = await requestKoaApp(app, '/sayachan', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sayachan-v4-legacy-body-session',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'legacy route body' }],
        runtimeControls: {
          lastUserMessage: 'legacy route body'
        }
      })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Invalid request body');
  });
});

test('authenticated /sayachan/tools/execute reaches host tool gateway', async () => {
  const app = createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });
  let loadedToken;
  let capturedToolRequest;
  let capturedUserId;

  await withPatchedMethods([
    {
      target: authService,
      key: 'loadUserForSession',
      value: async (token) => {
        loadedToken = token;
        return { _id: '000000000000000000000001', role: 'tester', email: 'tester@example.com' };
      }
    },
    {
      target: sayachanHostToolService,
      key: 'executeHostTool',
      value: async (request, options) => {
        capturedToolRequest = request;
        capturedUserId = options.userId.toHexString();
        return {
          requestId: request.requestId,
          status: 'completed',
          capability: request.capability,
          result: {
            packetType: 'saya_desk_host_tool_result',
            version: 1,
            project: {
              id: request.arguments.focus.id,
              name: 'Route project'
            },
            tasks: [{ id: 'task-1', title: 'Route task', status: 'active' }]
          },
          resultSummary: 'Read 1 task(s) for project "Route project".',
          sourceReceipts: [{ type: 'project', title: 'Route project' }],
          truncated: false,
          sourceTrace: ['sayachan_host_tool_service', 'list_project_tasks']
        };
      }
    }
  ], async () => {
    const response = await requestKoaApp(app, '/sayachan/tools/execute', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sayachan-host-tool-session',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        requestId: 'tool-request-1',
        turnId: 'turn-1',
        hostId: 'saya-desk',
        hostUserId: '000000000000000000000001',
        capability: 'saya_desk.list_project_tasks',
        arguments: {
          focus: {
            type: 'project',
            id: '000000000000000000000201'
          },
          query: '项目任务'
        },
        risk: 'read_only',
        requiresConfirmation: false,
        sourceTrace: ['resolver.tool_intent']
      })
    });
    const body = await response.json();

    assert.equal(loadedToken, 'sayachan-host-tool-session');
    assert.equal(capturedUserId, '000000000000000000000001');
    assert.deepEqual(capturedToolRequest, {
      requestId: 'tool-request-1',
      turnId: 'turn-1',
      hostId: 'saya-desk',
      hostUserId: '000000000000000000000001',
      capability: 'saya_desk.list_project_tasks',
      arguments: {
        focus: {
          type: 'project',
          id: '000000000000000000000201'
        },
        query: '项目任务'
      },
      risk: 'read_only',
      requiresConfirmation: false,
      sourceTrace: ['resolver.tool_intent']
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      requestId: 'tool-request-1',
      status: 'completed',
      capability: 'saya_desk.list_project_tasks',
      result: {
        packetType: 'saya_desk_host_tool_result',
        version: 1,
        project: {
          id: '000000000000000000000201',
          name: 'Route project'
        },
        tasks: [{ id: 'task-1', title: 'Route task', status: 'active' }]
      },
      resultSummary: 'Read 1 task(s) for project "Route project".',
      sourceReceipts: [{ type: 'project', title: 'Route project' }],
      truncated: false,
      sourceTrace: ['sayachan_host_tool_service', 'list_project_tasks']
    });
  });
});

test('authenticated /sayachan/tools/execute rejects mismatched host user', async () => {
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
    const response = await requestKoaApp(app, '/sayachan/tools/execute', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sayachan-host-tool-mismatch-session',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        requestId: 'tool-request-mismatch',
        turnId: 'turn-1',
        hostId: 'saya-desk',
        hostUserId: '000000000000000000000099',
        capability: 'saya_desk.list_project_tasks',
        arguments: {
          focus: {
            type: 'project',
            id: '000000000000000000000201'
          }
        },
        risk: 'read_only',
        requiresConfirmation: false
      })
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      error: 'Host tool user mismatch'
    });
  });
});

test('authenticated /sayachan returns explicit 502 when Sayachan Core bridge fails', async () => {
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
    const restoreFocusSnapshotBuilder = sayachanService.__test__.setFocusSnapshotBuilderForTest(async () => null);
    const restoreHostCapabilityManifestBuilder = sayachanService.__test__.setHostCapabilityManifestBuilderForTest(() => ({
      packetType: 'saya_desk_host_capability_manifest',
      version: 1,
      status: 'declared_only',
      tools: []
    }));
    const restoreChatPersistenceAvailabilityCheck = sayachanService.__test__.setChatPersistenceAvailabilityCheckForTest(() => false);
    const restoreCoreTurnAdvanceRunner = sayachanService.__test__.setCoreTurnAdvanceRunnerForTest(async () => {
      throw new Error('controlled core failure');
    });

    try {
      const response = await requestKoaApp(app, '/sayachan', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sayachan-v4-failure-session',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          text: 'hello failure route'
        })
      });
      const body = await response.json();

      assert.equal(response.status, 502);
      assert.deepEqual(body, { error: 'Sayachan Core request failed' });
    } finally {
      restoreCoreTurnAdvanceRunner();
      restoreChatPersistenceAvailabilityCheck();
      restoreHostCapabilityManifestBuilder();
      restoreFocusSnapshotBuilder();
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
    const restoreMemoryContextBuilder = aiService.__test__.setMemoryContextBuilderForTest(async () => ({
      packetType: 'memory_context_snapshot',
      version: 1,
      status: 'available',
      generatedAt: '2026-05-21T00:00:00.000Z',
      source: 'memory_ledger_v1',
      items: [{ type: 'preference', content: 'Use plain language.', source: 'manual' }]
    }));
    const restoreChatStreamRunner = aiService.__test__.setChatStreamRunnerForTest(async function* (messages, context, options) {
      capturedStreamCall = { messages, context, options };
      yield { packetType: 'chat_stream_event', version: 1, type: 'text_delta', delta: 'hello ', text: 'hello ' };
      yield { packetType: 'chat_stream_event', version: 1, type: 'text_delta', delta: 'stream', text: 'hello stream' };
      yield {
        packetType: 'chat_stream_event',
        version: 1,
        type: 'completed',
        text: 'hello stream',
        output: {
          reply: 'hello stream',
          debugTrace: {
            judgment: [{
              phase: 'pre_turn',
              status: 'completed',
              source: 'lightweight_model',
              provider: 'openai',
              model: 'gpt-5-nano',
              reasonCodes: ['model_intent_selected'],
              judgments: {
                modeIntent: {
                  status: 'completed',
                  source: 'model_intent',
                  selectedMode: 'guide/core_modules',
                  confidence: 0.86,
                  reasonCodes: ['work_planning']
                }
              }
            }],
            tools: {}
          }
        }
      };
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
      assert.equal(events[2].data.output.reply, 'hello stream');
      assert.deepEqual(events[2].data.output.debugTrace.judgment[0].judgments.modeIntent, {
        status: 'completed',
        source: 'model_intent',
        selectedMode: 'guide/core_modules',
        confidence: 0.86,
        reasonCodes: ['work_planning']
      });
      assert.deepEqual(capturedStreamCall.messages, [{ role: 'user', content: 'hello from stream route' }]);
      assert.deepEqual(capturedStreamCall.context.productContext, productContext);
      assert.equal(capturedStreamCall.context.memoryContext.packetType, 'memory_context_snapshot');
      assert.equal(capturedStreamCall.context.memoryContext.version, 1);
      assert.equal(capturedStreamCall.context.memoryContext.status, 'available');
      assert.equal(capturedStreamCall.context.memoryContext.source, 'memory_ledger_v1');
      assert.equal(capturedStreamCall.context.memoryContext.items.length, 1);
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
      restoreMemoryContextBuilder();
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
    const restoreProductContextBuilder = aiService.__test__.setProductContextBuilderForTest(async () => null);
    const restoreMemoryContextBuilder = aiService.__test__.setMemoryContextBuilderForTest(async () => null);
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
      restoreMemoryContextBuilder();
      restoreProductContextBuilder();
      restoreProviderReady();
    }
  });
});
