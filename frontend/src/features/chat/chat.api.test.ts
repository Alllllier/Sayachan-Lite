import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildChatRuntimePayload, loadChatSession, sendChat, sendSayachan, startNewChatSession, streamChat, streamSayachan, updateSayachanCandidateProposalStatus } from './chat.api.js'
import type { ChatContextDto } from '@sayachan/contracts'

const emptyContext: ChatContextDto = {}

function mockedFetch() {
  return vi.mocked(fetch)
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function streamResponse(chunks: string[], ok = true, status = 200): Response {
  return new Response(new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    }
  }), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'text/event-stream' }
  })
}

describe('chat api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends chat messages with launch context, runtime controls, last user message, and future slots', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({ reply: 'Ready.' }))

    await expect(sendChat([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'latest' }
    ], {}, {
      personalityBaseline: 'strict',
      futureSlots: {
        warmth: 8,
        convergenceMode: 'decisive'
      }
    })).resolves.toEqual({ reply: 'Ready.' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    })
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
      messages: [
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'reply' },
        { role: 'user', content: 'latest' }
      ],
      context: {},
      runtimeControls: {
        personalityBaseline: 'strict',
        futureSlots: {
          warmth: 8,
          convergenceMode: 'decisive'
        },
        lastUserMessage: 'latest'
      }
    })
  })

  it('uses an empty last user message when no user message exists', async () => {
    expect(buildChatRuntimePayload([{ role: 'assistant', content: 'hello' }], {}))
      .toEqual({ lastUserMessage: '' })
  })

  it('sends v4 Sayachan requests through the dedicated gateway contract', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({
      reply: '晚上好。',
      turnId: 'turn-1',
      trace: {
        traceId: 'trace-1',
        debugAvailable: true
      },
      candidateProposals: [{
        proposalId: 'candidate-1',
        kind: 'memory',
        content: 'User likes concise architecture summaries.',
        reason: 'Useful future preference.',
        confidence: 0.78,
        userConfirmationRequired: true,
        sourceTrace: ['runtime.v4_3.closeout']
      }],
      debugTrace: {
        runtime: 'cognition-runtime',
        provider: 'openai',
        provider_model: 'gpt-5.5',
        provider_response_id: 'resp-v4',
        advance_kind: 'user_input_advance',
        participation_profile: { name: 'user_input_advance' },
        stage_summaries: [{
          stage_name: 'compile_provider_request',
          status: 'completed',
          notes: ['Compiled provider request.'],
          source_trace: ['compiler.prompt']
        }],
        source_trace: ['runtime.advance_turn']
      },
      turnActivity: {
        defaultCollapsed: true,
        items: [
          {
            itemId: 'turn-1:activity:1',
            kind: 'assistant_progress',
            status: 'planned',
            text: '我先回看一下项目里的记录。',
            display: 'collapse_item',
            canonicalMessage: false,
            capability: 'saya_desk.list_project_tasks',
            sourceTrace: ['resolver.activity', 'runtime.step_planner_contract']
          },
          {
            itemId: 'turn-1:activity:2',
            kind: 'tool_status',
            status: 'completed',
            text: '读取项目任务',
            display: 'collapse_item',
            canonicalMessage: false,
            capability: 'saya_desk.list_project_tasks',
            sourceTrace: ['resolver.activity', 'runtime.execute_host_tools']
          }
        ]
      }
    }))

    await expect(sendSayachan({
      text: '晚上好',
      focus: { type: 'project', id: 'project-1' },
      debug: true
    })).resolves.toEqual({
      reply: '晚上好。',
      candidateProposals: [{
        proposalId: 'candidate-1',
        kind: 'memory',
        content: 'User likes concise architecture summaries.',
        reason: 'Useful future preference.',
        confidence: 0.78,
        userConfirmationRequired: true,
        sourceTrace: ['runtime.v4_3.closeout']
      }],
      sayachanDebugTrace: expect.objectContaining({
        runtime: 'cognition-runtime',
        provider_model: 'gpt-5.5',
        provider_response_id: 'resp-v4',
        advance_kind: 'user_input_advance'
      }),
      turnActivity: {
        defaultCollapsed: true,
        items: [
          {
            itemId: 'turn-1:activity:1',
            kind: 'assistant_progress',
            status: 'planned',
            text: '我先回看一下项目里的记录。',
            display: 'collapse_item',
            canonicalMessage: false,
            capability: 'saya_desk.list_project_tasks',
            sourceTrace: ['resolver.activity', 'runtime.step_planner_contract']
          },
          {
            itemId: 'turn-1:activity:2',
            kind: 'tool_status',
            status: 'completed',
            text: '读取项目任务',
            display: 'collapse_item',
            canonicalMessage: false,
            capability: 'saya_desk.list_project_tasks',
            sourceTrace: ['resolver.activity', 'runtime.execute_host_tools']
          }
        ]
      }
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/sayachan', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    })
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
      text: '晚上好',
      surface: 'project-detail',
      focus: { type: 'project', id: 'project-1' },
      options: { debug: true }
    })
  })

  it('streams v4 Sayachan activity events before completion', async () => {
    const activityTexts: string[] = []
    const deltas: string[] = []
    let completedActivityDefaultCollapsed: boolean | undefined
    mockedFetch().mockResolvedValue(streamResponse([
      'event: assistant_progress\ndata: {"packetType":"saya_desk_sayachan_stream_event","version":1,"type":"assistant_progress","item":{"itemId":"turn-1:activity:1","kind":"assistant_progress","status":"planned","text":"我先回看一下相关笔记。","display":"collapse_item","canonicalMessage":false,"capability":"saya_desk.get_note_content","sourceTrace":["resolver.activity"]}}\n\n',
      'event: tool_status\ndata: {"packetType":"saya_desk_sayachan_stream_event","version":1,"type":"tool_status","item":{"itemId":"turn-1:activity:2","kind":"tool_status","status":"completed","text":"读取笔记：Tool notes","display":"collapse_item","canonicalMessage":false,"capability":"saya_desk.get_note_content","sourceTrace":["resolver.activity","runtime.execute_host_tools"]}}\n\n',
      'event: assistant_delta\ndata: {"packetType":"saya_desk_sayachan_stream_event","version":1,"type":"assistant_delta","delta":"总结","text":"总结"}\n\n',
      'event: assistant_delta\ndata: {"packetType":"saya_desk_sayachan_stream_event","version":1,"type":"assistant_delta","delta":"好了。","text":"总结好了。"}\n\n',
      'event: completed\ndata: {"packetType":"saya_desk_sayachan_stream_event","version":1,"type":"completed","reply":"总结好了。","turnId":"turn-1","candidateProposals":[{"proposalId":"candidate-stream-1","kind":"relationship_sediment","content":"User asked Sayachan to inspect notes directly.","reason":"Relevant to future host-tool behavior.","confidence":0.69,"userConfirmationRequired":true,"sourceTrace":["runtime.v4_3.closeout"]}],"turnActivity":{"defaultCollapsed":true,"items":[{"itemId":"turn-1:activity:1","kind":"assistant_progress","status":"planned","text":"我先回看一下相关笔记。","display":"collapse_item","canonicalMessage":false,"capability":"saya_desk.get_note_content","sourceTrace":["resolver.activity"]},{"itemId":"turn-1:activity:2","kind":"tool_status","status":"completed","text":"读取笔记：Tool notes","display":"collapse_item","canonicalMessage":false,"capability":"saya_desk.get_note_content","sourceTrace":["resolver.activity","runtime.execute_host_tools"]}]}}\n\n'
    ]))

    await expect(streamSayachan(
      {
        text: '帮我看这篇笔记',
        focus: { type: 'note', id: 'note-1' },
        debug: true
      },
      {
        onDelta: delta => deltas.push(delta),
        onActivity: item => activityTexts.push(item.text),
        onCompleted: (_reply, event) => {
          completedActivityDefaultCollapsed = event.turnActivity?.defaultCollapsed
        }
      }
    )).resolves.toEqual({
      reply: '总结好了。',
      candidateProposals: [{
        proposalId: 'candidate-stream-1',
        kind: 'relationship_sediment',
        content: 'User asked Sayachan to inspect notes directly.',
        reason: 'Relevant to future host-tool behavior.',
        confidence: 0.69,
        userConfirmationRequired: true,
        sourceTrace: ['runtime.v4_3.closeout']
      }],
      turnActivity: {
        defaultCollapsed: true,
        items: [
          expect.objectContaining({ text: '我先回看一下相关笔记。' }),
          expect.objectContaining({ text: '读取笔记：Tool notes' })
        ]
      }
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/sayachan/stream', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: expect.any(String)
    })
    expect(activityTexts).toEqual(['我先回看一下相关笔记。', '读取笔记：Tool notes'])
    expect(deltas).toEqual(['总结', '好了。'])
    expect(completedActivityDefaultCollapsed).toBe(true)
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
      text: '帮我看这篇笔记',
      surface: 'note-detail',
      focus: { type: 'note', id: 'note-1' },
      options: { debug: true }
    })
  })

  it('updates a persisted Sayachan candidate proposal status', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({
      _id: 'message-1',
      role: 'assistant',
      content: '记下来了。',
      candidateProposals: [{
        proposalId: 'candidate-1',
        kind: 'memory',
        content: 'User likes concise summaries.',
        reason: 'Useful future preference.',
        confidence: 0.72,
        userConfirmationRequired: true,
        sourceTrace: ['runtime.v4_3.closeout'],
        status: 'dismissed'
      }]
    }))

    await expect(updateSayachanCandidateProposalStatus(
      'message-1',
      'candidate-1',
      'dismissed'
    )).resolves.toEqual({
      _id: 'message-1',
      role: 'assistant',
      content: '记下来了。',
      candidateProposals: [{
        proposalId: 'candidate-1',
        kind: 'memory',
        content: 'User likes concise summaries.',
        reason: 'Useful future preference.',
        confidence: 0.72,
        userConfirmationRequired: true,
        sourceTrace: ['runtime.v4_3.closeout'],
        status: 'dismissed'
      }]
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/sayachan/candidates/message-1/candidate-1/status',
      {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      }
    )
  })

  it('loads the persisted current chat session', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({
      conversation: {
        _id: 'conversation-1',
        createdAt: '2026-05-22T00:00:00.000Z',
        updatedAt: '2026-05-22T00:01:00.000Z'
      },
      messages: [
        {
          _id: 'message-1',
          role: 'user',
          content: '帮我看看这篇笔记',
          focusSnapshot: { type: 'note', title: 'Tool notes' },
          createdAt: '2026-05-22T00:00:00.000Z'
        },
        {
          _id: 'message-2',
          role: 'assistant',
          content: '可以，我看一下。',
          sourceReceipts: [{ type: 'note', title: 'Tool notes' }],
          memoryCandidate: {
            type: 'preference',
            content: 'Use plain language first.',
            source: 'assistant_suggested_user_approved'
          },
          createdAt: '2026-05-22T00:01:00.000Z'
        }
      ],
      providerState: {
        strategy: 'previous_response',
        lastResponseId: 'resp-session',
        status: 'active'
      }
    }))

    await expect(loadChatSession()).resolves.toEqual({
      conversation: {
        _id: 'conversation-1',
        createdAt: '2026-05-22T00:00:00.000Z',
        updatedAt: '2026-05-22T00:01:00.000Z'
      },
      messages: [
        {
          _id: 'message-1',
          role: 'user',
          content: '帮我看看这篇笔记',
          focusSnapshot: { type: 'note', title: 'Tool notes' },
          createdAt: '2026-05-22T00:00:00.000Z'
        },
        {
          _id: 'message-2',
          role: 'assistant',
          content: '可以，我看一下。',
          sourceReceipts: [{ type: 'note', title: 'Tool notes' }],
          memoryCandidate: {
            type: 'preference',
            content: 'Use plain language first.',
            source: 'assistant_suggested_user_approved'
          },
          createdAt: '2026-05-22T00:01:00.000Z'
        }
      ],
      providerState: {
        strategy: 'previous_response',
        lastResponseId: 'resp-session',
        status: 'active'
      }
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat/session', {
      method: 'GET',
      credentials: 'include'
    })
  })

  it('starts a new chat session by archiving the current backend session', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({
      messages: []
    }))

    await expect(startNewChatSession()).resolves.toEqual({ messages: [] })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat/session', {
      method: 'DELETE',
      credentials: 'include'
    })
  })

  it('preserves safe source receipts from the chat response', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({
      reply: 'Ready.',
      sourceReceipts: [{ type: 'project', title: 'Sayachan AI Core' }],
      debugTrace: {
        mode: {
          source: 'context',
          requestedMode: 'guide/core_modules',
          selectedMode: 'guide/core_modules',
          fallbackApplied: false,
          confidence: 1,
          reasonCodes: ['chat_focus_guide']
        },
        focus: {
          consumed: true,
          type: 'project',
          title: 'Sayachan AI Core',
          source: 'user_focus_button'
        },
        context: {
          budget: {
            estimatedInputBudgetTokens: 12000,
            estimatedUsedTokens: 180,
            strategy: 'token_budgeted_latest'
          },
          session: {
            includedMessages: 1,
            totalMessages: 1,
            truncated: false,
            estimatedTokens: 42
          },
          productContext: {
            status: 'available',
            itemCount: 3,
            truncated: false
          },
          render: {
            sectionCount: 4
          }
        },
        providerUsage: {
          status: 'available',
          provider: 'openai',
          model: 'gpt-5.5',
          inputTokens: 31,
          outputTokens: 11,
          totalTokens: 42,
          cachedInputTokens: 5,
          reasoningTokens: 7
        },
        tools: {
          executed: [{ name: 'getProjectContext', status: 'completed', round: 1 }]
        }
      },
      memoryCandidate: {
        type: 'preference',
        content: 'Use plain language first.',
        reason: 'Stable communication preference.',
        source: 'assistant_suggested_user_approved',
        confidence: 0.9
      }
    }))

    await expect(sendChat([{ role: 'user', content: 'latest' }], emptyContext, {}))
      .resolves
      .toEqual({
        reply: 'Ready.',
        sourceReceipts: [{ type: 'project', title: 'Sayachan AI Core' }],
        debugTrace: {
          mode: {
            source: 'context',
            requestedMode: 'guide/core_modules',
            selectedMode: 'guide/core_modules',
            fallbackApplied: false,
            confidence: 1,
            reasonCodes: ['chat_focus_guide']
          },
          focus: {
            consumed: true,
            type: 'project',
            title: 'Sayachan AI Core',
            source: 'user_focus_button'
          },
          context: {
            budget: {
              estimatedInputBudgetTokens: 12000,
              estimatedUsedTokens: 180,
              strategy: 'token_budgeted_latest'
            },
            session: {
              includedMessages: 1,
              totalMessages: 1,
              truncated: false,
              estimatedTokens: 42
            },
            productContext: {
              status: 'available',
              itemCount: 3,
              truncated: false
            },
            render: {
              sectionCount: 4
            }
          },
          providerUsage: {
            status: 'available',
            provider: 'openai',
            model: 'gpt-5.5',
            inputTokens: 31,
            outputTokens: 11,
            totalTokens: 42,
            cachedInputTokens: 5,
            reasoningTokens: 7
          },
          tools: {
            executed: [{ name: 'getProjectContext', status: 'completed', round: 1 }]
          }
        },
        memoryCandidate: {
          type: 'preference',
          content: 'Use plain language first.',
          reason: 'Stable communication preference.',
          source: 'assistant_suggested_user_approved',
          confidence: 0.9
        }
      })
  })

  it('throws when the chat endpoint returns a non-ok response', async () => {
    mockedFetch().mockResolvedValue(jsonResponse(null, false, 503))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Chat request failed: 503')
  })

  it('throws when the chat endpoint reply is empty or invalid', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({ reply: '' }))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')

    mockedFetch().mockResolvedValue(jsonResponse({ reply: null }))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')
  })

  it('streams chat events from the streaming endpoint', async () => {
    const deltas: string[] = []
    const toolStatuses: string[] = []
    let completedProviderState: unknown
    mockedFetch().mockResolvedValue(streamResponse([
      'event: tool_call_started\ndata: {"type":"tool_call_started","toolName":"getProjectContext","displayName":"正在查看相关项目..."}\n\n',
      'event: tool_call_completed\ndata: {"type":"tool_call_completed","toolName":"getProjectContext","displayName":"正在查看相关项目..."}\n\n',
      'event: text_delta\ndata: {"type":"text_delta","delta":"Hel","text":"Hel"}\n\n',
      'event: text_delta\ndata: {"type":"text_delta","delta":"lo","text":"Hello"}\n\n',
      'event: completed\ndata: {"type":"completed","text":"Hello","output":{"reply":"Hello"},"providerState":{"strategy":"previous_response","lastResponseId":"resp-1","status":"active"}}\n\n'
    ]))

    await expect(streamChat(
      [{ role: 'user', content: 'latest' }],
      emptyContext,
      { personalityBaseline: 'warm' },
      {
        onDelta: delta => deltas.push(delta),
        onToolStatus: event => toolStatuses.push(event.displayName || ''),
        onCompleted: (_reply, event) => {
          completedProviderState = event.providerState
        }
      }
    )).resolves.toEqual({
      reply: 'Hello',
      providerState: {
        strategy: 'previous_response',
        lastResponseId: 'resp-1',
        status: 'active'
      }
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat/stream', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: expect.any(String)
    })
    expect(completedProviderState).toEqual({
      strategy: 'previous_response',
      lastResponseId: 'resp-1',
      status: 'active'
    })
    expect(deltas).toEqual(['Hel', 'lo'])
    expect(toolStatuses).toEqual(['正在查看相关项目...', '正在查看相关项目...'])
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
      messages: [{ role: 'user', content: 'latest' }],
      context: emptyContext,
      runtimeControls: {
        personalityBaseline: 'warm',
        lastUserMessage: 'latest'
      }
    })
  })

  it('throws when the streaming endpoint emits an error or ends early', async () => {
    mockedFetch().mockResolvedValue(streamResponse([
      'event: error\ndata: {"type":"error","error":{"message":"stream failed"}}\n\n'
    ]))

    await expect(streamChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('stream failed')

    mockedFetch().mockResolvedValue(streamResponse([
      'event: text_delta\ndata: {"type":"text_delta","delta":"partial"}\n\n'
    ]))

    await expect(streamChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Chat stream ended before completion')
  })

  it('preserves safe source receipts from the streaming completion event', async () => {
    let completedReceipts: unknown
    let completedTrace: unknown
    mockedFetch().mockResolvedValue(streamResponse([
      'event: completed\ndata: {"type":"completed","text":"Hello","finishReason":"max_output_tokens","incomplete":true,"incompleteReason":"max_output_tokens","output":{"reply":"Hello","sourceReceipts":[{"type":"note","title":"Tool notes"}],"debugTrace":{"focus":{"consumed":false},"context":{"productContext":{"status":"not_provided","itemCount":0,"truncated":false},"session":{"includedMessages":1,"totalMessages":1,"truncated":false}},"providerUsage":{"status":"available","provider":"openai","model":"gpt-5.5","finishReason":"max_output_tokens","incomplete":true,"incompleteReason":"max_output_tokens","inputTokens":31,"outputTokens":11,"totalTokens":42,"cachedInputTokens":5,"reasoningTokens":7},"tools":{"executed":[{"name":"getNoteContent","status":"completed","round":1,"hasMore":true,"nextCursorPresent":true,"range":{"startChar":0,"endChar":800}}]}},"memoryCandidate":{"type":"continuity_hint","content":"Keep architecture tradeoffs visible.","reason":"Useful future continuity.","source":"assistant_suggested_user_approved","confidence":0.78}}}\n\n'
    ]))

    await expect(streamChat(
      [{ role: 'user', content: 'latest' }],
      emptyContext,
      {},
      {
        onCompleted: (_reply, event) => {
          completedReceipts = event.sourceReceipts
          completedTrace = event.debugTrace
        }
      }
    )).resolves.toEqual({
      reply: 'Hello',
      sourceReceipts: [{ type: 'note', title: 'Tool notes' }],
      debugTrace: {
        focus: { consumed: false },
        context: {
          productContext: {
            status: 'not_provided',
            itemCount: 0,
            truncated: false
          },
          session: {
            includedMessages: 1,
            totalMessages: 1,
            truncated: false
          }
        },
        providerUsage: {
          status: 'available',
          provider: 'openai',
          model: 'gpt-5.5',
          finishReason: 'max_output_tokens',
          incomplete: true,
          incompleteReason: 'max_output_tokens',
          inputTokens: 31,
          outputTokens: 11,
          totalTokens: 42,
          cachedInputTokens: 5,
          reasoningTokens: 7
        },
        tools: {
          executed: [{
            name: 'getNoteContent',
            status: 'completed',
            round: 1,
            hasMore: true,
            nextCursorPresent: true,
            range: { startChar: 0, endChar: 800 }
          }]
        }
      },
      memoryCandidate: {
        type: 'continuity_hint',
        content: 'Keep architecture tradeoffs visible.',
        reason: 'Useful future continuity.',
        source: 'assistant_suggested_user_approved',
        confidence: 0.78
      }
    })

    expect(completedReceipts).toEqual([{ type: 'note', title: 'Tool notes' }])
    expect(completedTrace).toEqual({
      focus: { consumed: false },
      context: {
        productContext: {
          status: 'not_provided',
          itemCount: 0,
          truncated: false
        },
        session: {
          includedMessages: 1,
          totalMessages: 1,
          truncated: false
        }
      },
      providerUsage: {
        status: 'available',
        provider: 'openai',
        model: 'gpt-5.5',
        finishReason: 'max_output_tokens',
        incomplete: true,
        incompleteReason: 'max_output_tokens',
        inputTokens: 31,
        outputTokens: 11,
        totalTokens: 42,
        cachedInputTokens: 5,
        reasoningTokens: 7
      },
      tools: {
        executed: [{
          name: 'getNoteContent',
          status: 'completed',
          round: 1,
          hasMore: true,
          nextCursorPresent: true,
          range: { startChar: 0, endChar: 800 }
        }]
      }
    })
  })
})
