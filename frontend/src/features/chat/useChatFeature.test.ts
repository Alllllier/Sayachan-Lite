import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatFeature } from './useChatFeature.js'
import { loadChatSession, sendChat, sendSayachan, startNewChatSession, streamChat, streamSayachan } from './chat.api.js'
import { createMemoryEntry } from '../memory/memory.api.js'
import type { ChatFocusDto, ChatMessageDto } from '@sayachan/contracts'

const storeMocks = vi.hoisted(() => ({
  chatStore: undefined as ChatStoreMock | undefined,
  runtimeControls: undefined as RuntimeControlsMock | undefined
}))

vi.mock('../../stores/chat', () => ({
  useChatStore: () => storeMocks.chatStore
}))

vi.mock('../../stores/runtimeControls', () => ({
  useRuntimeControls: () => storeMocks.runtimeControls
}))

vi.mock('./chat.api.js', () => ({
  loadChatSession: vi.fn(),
  sendChat: vi.fn(),
  sendSayachan: vi.fn(),
  startNewChatSession: vi.fn(),
  streamChat: vi.fn(),
  streamSayachan: vi.fn()
}))

vi.mock('../memory/memory.api.js', () => ({
  createMemoryEntry: vi.fn()
}))

const loadChatSessionMock = vi.mocked(loadChatSession)
const sendChatMock = vi.mocked(sendChat)
const sendSayachanMock = vi.mocked(sendSayachan)
const startNewChatSessionMock = vi.mocked(startNewChatSession)
const streamChatMock = vi.mocked(streamChat)
const streamSayachanMock = vi.mocked(streamSayachan)
const createMemoryEntryMock = vi.mocked(createMemoryEntry)

type ChatStoreMock = ReturnType<typeof createChatStore>
type RuntimeControlsMock = {
  coreVersion: 'v3' | 'v4'
  personalityBaseline: 'warm'
  chatStreamingEnabled: boolean
  debugTraceEnabled: boolean
  futureSlots: {
    warmth: number
    convergenceMode: 'guided'
  }
  personalityConfig: {
    toneLabel: string
  }
  setChatStreamingEnabled: (value: boolean) => void
  setCoreVersion: (value: 'v3' | 'v4') => void
  setLatestDebugTrace: (value: unknown) => void
  setLatestSayachanDebugTrace: (value: unknown) => void
  clearLatestDebugTrace: () => void
}

function createChatStore() {
  const store = {
    isOpen: false,
    isSending: false,
    messages: [] as ChatMessageDto[],
    sessionLoaded: false,
    openChat: vi.fn(() => {
      store.isOpen = true
    }),
    closeChat: vi.fn(() => {
      store.isOpen = false
    }),
    appendMessage: vi.fn((message: ChatMessageDto) => {
      store.messages.push(message)
    }),
    hydrateSession: vi.fn((messages: ChatMessageDto[], providerState?: unknown) => {
      store.messages = messages
      store.providerState = providerState
      store.sessionLoaded = true
    }),
    clearMessagesForNewSession: vi.fn(() => {
      store.messages = []
      store.providerState = undefined
      store.activeFocus = undefined
      store.sessionLoaded = true
    }),
    updateMessageContent: vi.fn((index: number, content: string) => {
      store.messages[index] = {
        ...store.messages[index],
        content
      }
    }),
    providerState: undefined as unknown,
    activeFocus: undefined as ChatFocusDto | undefined,
    setProviderState: vi.fn((value: unknown) => {
      store.providerState = value
    }),
    setFocus: vi.fn((value: ChatFocusDto) => {
      store.activeFocus = value
    }),
    clearFocus: vi.fn(() => {
      store.activeFocus = undefined
    }),
    setSending: vi.fn((value: boolean) => {
      store.isSending = value
    })
  }
  return store
}

describe('useChatFeature orchestration', () => {
  let chatStore: ChatStoreMock
  let runtimeControls: RuntimeControlsMock

  beforeEach(() => {
    vi.clearAllMocks()
    chatStore = createChatStore()
    runtimeControls = {
      coreVersion: 'v3',
      personalityBaseline: 'warm',
      chatStreamingEnabled: true,
      debugTraceEnabled: true,
      futureSlots: {
        warmth: 7,
        convergenceMode: 'guided'
      },
      personalityConfig: {
        toneLabel: 'Warm'
      },
      setChatStreamingEnabled: vi.fn(),
      setCoreVersion: vi.fn(),
      setLatestDebugTrace: vi.fn(),
      setLatestSayachanDebugTrace: vi.fn(),
      clearLatestDebugTrace: vi.fn()
    }

    storeMocks.chatStore = chatStore
    storeMocks.runtimeControls = runtimeControls
    loadChatSessionMock.mockResolvedValue({ messages: [] })
    sendChatMock.mockResolvedValue({ reply: 'Done' })
    sendSayachanMock.mockResolvedValue({ reply: 'V4 Done' })
    startNewChatSessionMock.mockResolvedValue({ messages: [] })
    streamChatMock.mockResolvedValue({ reply: 'Done' })
    streamSayachanMock.mockResolvedValue({ reply: 'V4 Done' })
    createMemoryEntryMock.mockResolvedValue({
      _id: 'memory-1',
      type: 'preference',
      content: 'Use plain language first',
      active: true,
      source: 'assistant_suggested_user_approved'
    })
  })

  it('opens and closes the chat while keeping the runtime panel state local', () => {
    const scrollToBottom = vi.fn()
    const feature = useChatFeature({ scrollToBottom })

    feature.openPopup()
    expect(chatStore.openChat).toHaveBeenCalled()
    expect(scrollToBottom).toHaveBeenCalled()

    feature.togglePanel()
    expect(feature.isPanelOpen.value).toBe(true)

    feature.closePopup()
    expect(chatStore.closeChat).toHaveBeenCalled()
    expect(feature.isPanelOpen.value).toBe(false)
  })

  it('hydrates the current persisted chat session once', async () => {
    const scrollToBottom = vi.fn()
    const persistedTurnActivity = {
      defaultCollapsed: true,
      items: [
        {
          itemId: 'message-2:activity:1',
          kind: 'assistant_progress' as const,
          status: 'planned' as const,
          text: '我先回看一下相关笔记。',
          display: 'collapse_item' as const,
          canonicalMessage: false as const,
          capability: 'saya_desk.get_note_content',
          sourceTrace: ['resolver.activity']
        },
        {
          itemId: 'message-2:activity:2',
          kind: 'tool_status' as const,
          status: 'completed' as const,
          text: '读取笔记：Tool notes',
          display: 'collapse_item' as const,
          canonicalMessage: false as const,
          capability: 'saya_desk.get_note_content',
          sourceTrace: ['resolver.activity', 'runtime.execute_host_tools']
        }
      ]
    }
    loadChatSessionMock.mockResolvedValue({
      messages: [
        {
          _id: 'message-1',
          role: 'user',
          content: '帮我看看这篇笔记',
          focusSnapshot: { type: 'note', title: 'Tool notes' }
        },
        {
          _id: 'message-2',
          role: 'assistant',
          content: '我看到了。',
          sourceReceipts: [{ type: 'note', title: 'Tool notes' }],
          memoryCandidate: {
            type: 'preference',
            content: 'Use plain language first.',
            source: 'assistant_suggested_user_approved'
          },
          turnActivity: persistedTurnActivity
        }
      ],
      providerState: {
        strategy: 'previous_response',
        lastResponseId: 'resp-session',
        status: 'active'
      }
    })
    const feature = useChatFeature({ scrollToBottom })

    await feature.loadCurrentSession()
    await feature.loadCurrentSession()

    expect(loadChatSession).toHaveBeenCalledTimes(1)
    expect(chatStore.hydrateSession).toHaveBeenCalledWith([
      {
        _id: 'message-1',
        role: 'user',
        content: '帮我看看这篇笔记',
        focusSnapshot: { type: 'note', title: 'Tool notes' }
      },
      {
        _id: 'message-2',
        role: 'assistant',
        content: '我看到了。',
        sourceReceipts: [{ type: 'note', title: 'Tool notes' }],
        memoryCandidate: {
          type: 'preference',
          content: 'Use plain language first.',
          source: 'assistant_suggested_user_approved'
        },
        turnActivity: persistedTurnActivity
      }
    ], {
      strategy: 'previous_response',
      lastResponseId: 'resp-session',
      status: 'active'
    })
    expect(feature.getMessageFocusSnapshot(0)).toEqual({ type: 'note', title: 'Tool notes' })
    expect(feature.getMessageSourceReceipts(1)).toEqual([{ type: 'note', title: 'Tool notes' }])
    expect(feature.getMessageMemoryCandidate(1)?.status).toBe('pending')
    expect(feature.getMessageTurnActivity(1)).toEqual(persistedTurnActivity)
    expect(scrollToBottom).toHaveBeenCalled()
  })

  it('starts a new chat session and clears local message metadata', async () => {
    chatStore.messages = [
      { role: 'user', content: 'old', focusSnapshot: { type: 'note', title: 'Old note' } },
      {
        role: 'assistant',
        content: 'old reply',
        sourceReceipts: [{ type: 'note', title: 'Old note' }],
        memoryCandidate: {
          type: 'preference',
          content: 'Old memory',
          source: 'assistant_suggested_user_approved'
        }
      }
    ]
    chatStore.providerState = {
      strategy: 'previous_response',
      lastResponseId: 'resp-old',
      status: 'active'
    }
    const scrollToBottom = vi.fn()
    const feature = useChatFeature({ scrollToBottom })
    await feature.loadCurrentSession()

    expect(feature.getMessageSourceReceipts(1)).toEqual([{ type: 'note', title: 'Old note' }])

    await feature.startNewSession()

    expect(startNewChatSession).toHaveBeenCalled()
    expect(chatStore.clearMessagesForNewSession).toHaveBeenCalled()
    expect(feature.getMessageSourceReceipts(1)).toEqual([])
    expect(feature.getMessageMemoryCandidate(1)).toBeUndefined()
    expect(runtimeControls.clearLatestDebugTrace).toHaveBeenCalled()
    expect(scrollToBottom).toHaveBeenCalled()
  })

  it('sends typed chat messages with a narrow launch context', async () => {
    const feature = useChatFeature()
    feature.inputValue.value = '  hello  '

    await feature.handleSend()

    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(1, { role: 'user', content: 'hello' })
    expect(feature.inputValue.value).toBe('')
    expect(streamChat).toHaveBeenCalledWith(
      [{ role: 'user', content: 'hello' }],
      {},
      {
        personalityBaseline: 'warm',
        futureSlots: {
          warmth: 7
        },
        debugTrace: true,
        memoryCandidate: true
      },
      expect.objectContaining({
        onDelta: expect.any(Function),
        onCompleted: expect.any(Function)
      })
    )
    expect(sendChat).not.toHaveBeenCalled()
    expect(chatStore.appendMessage).toHaveBeenLastCalledWith({ role: 'assistant', content: 'Done' })
    expect(chatStore.setSending).toHaveBeenLastCalledWith(false)
  })

  it('can send through the non-streaming endpoint when streaming is disabled', async () => {
    runtimeControls.chatStreamingEnabled = false
    const feature = useChatFeature()
    feature.inputValue.value = 'hello'

    await feature.handleSend()

    expect(sendChat).toHaveBeenCalled()
    expect(streamChat).not.toHaveBeenCalled()
    expect(chatStore.appendMessage).toHaveBeenLastCalledWith({ role: 'assistant', content: 'Done' })
  })

  it('routes v4 turns through the dedicated Sayachan gateway without using v3 streaming state', async () => {
    runtimeControls.coreVersion = 'v4'
    runtimeControls.chatStreamingEnabled = true
    chatStore.providerState = {
      strategy: 'previous_response',
      lastResponseId: 'resp-v3',
      status: 'active'
    }
    chatStore.activeFocus = {
      type: 'project',
      id: 'project-1',
      title: 'Sayachan AI Core',
      summary: 'Private-core work',
      status: 'in_progress',
      source: 'user_focus_button'
    }
    const streamResponse: Awaited<ReturnType<typeof streamSayachan>> = {
      reply: 'V4 Done',
      sayachanDebugTrace: {
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
            itemId: 'turn-v4:activity:1',
            kind: 'assistant_progress',
            status: 'planned',
            text: '我先回看一下项目里的记录。',
            display: 'collapse_item',
            canonicalMessage: false,
            capability: 'saya_desk.list_project_tasks',
            sourceTrace: ['resolver.activity', 'runtime.step_planner_contract']
          },
          {
            itemId: 'turn-v4:activity:2',
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
    }
    const feature = useChatFeature()
    streamSayachanMock.mockImplementation(async (_input, handlers) => {
      const turnActivity = streamResponse.turnActivity
      if (!turnActivity) throw new Error('test stream activity missing')
      const firstActivity = turnActivity.items[0]
      const partialActivity = {
        ...firstActivity,
        text: '我先回看'
      }
      handlers?.onActivity?.(partialActivity, {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'assistant_progress',
        item: partialActivity
      })
      expect(feature.getMessageTurnActivity(1)?.defaultCollapsed).toBe(false)
      expect(feature.getMessageTurnActivity(1)?.items).toEqual([partialActivity])
      handlers?.onActivity?.(firstActivity, {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'assistant_progress',
        item: firstActivity
      })
      expect(feature.getMessageTurnActivity(1)?.items).toEqual([firstActivity])
      handlers?.onDelta?.('V4 ', {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'assistant_delta',
        delta: 'V4 ',
        text: 'V4 '
      })
      handlers?.onDelta?.('Done', {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'assistant_delta',
        delta: 'Done',
        text: 'V4 Done'
      })
      handlers?.onCompleted?.('V4 Done', {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'completed',
        reply: 'V4 Done',
        turnActivity,
        debugTrace: streamResponse.sayachanDebugTrace
      })
      return streamResponse
    })
    feature.inputValue.value = '晚上好'

    await feature.handleSend()

    expect(streamSayachan).toHaveBeenCalledWith({
      text: '晚上好',
      focus: { type: 'project', id: 'project-1' },
      debug: true
    }, expect.objectContaining({
      onDelta: expect.any(Function),
      onActivity: expect.any(Function),
      onCompleted: expect.any(Function)
    }))
    expect(sendSayachan).not.toHaveBeenCalled()
    expect(streamChat).not.toHaveBeenCalled()
    expect(sendChat).not.toHaveBeenCalled()
    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(2, { role: 'assistant', content: '' })
    expect(chatStore.updateMessageContent).toHaveBeenCalledWith(1, 'V4 ')
    expect(chatStore.updateMessageContent).toHaveBeenCalledWith(1, 'V4 Done')
    expect(feature.getMessageTurnActivity(1)).toEqual({
      defaultCollapsed: true,
      items: [
        {
          itemId: 'turn-v4:activity:1',
          kind: 'assistant_progress',
          status: 'planned',
          text: '我先回看一下项目里的记录。',
          display: 'collapse_item',
          canonicalMessage: false,
          capability: 'saya_desk.list_project_tasks',
          sourceTrace: ['resolver.activity', 'runtime.step_planner_contract']
        },
        {
          itemId: 'turn-v4:activity:2',
          kind: 'tool_status',
          status: 'completed',
          text: '读取项目任务',
          display: 'collapse_item',
          canonicalMessage: false,
          capability: 'saya_desk.list_project_tasks',
          sourceTrace: ['resolver.activity', 'runtime.execute_host_tools']
        }
      ]
    })
    expect(feature.isPendingAssistantMessage(1)).toBe(false)
    expect(runtimeControls.setLatestSayachanDebugTrace).toHaveBeenCalledWith(expect.objectContaining({
      runtime: 'cognition-runtime',
      provider: 'openai',
      provider_model: 'gpt-5.5',
      provider_response_id: 'resp-v4',
      advance_kind: 'user_input_advance'
    }))
    expect(chatStore.setProviderState).toHaveBeenCalledWith(undefined)
    expect(chatStore.setSending).toHaveBeenLastCalledWith(false)
  })

  it('routes v4 turns through the non-streaming Sayachan gateway when streaming is disabled', async () => {
    runtimeControls.coreVersion = 'v4'
    runtimeControls.chatStreamingEnabled = false
    chatStore.activeFocus = {
      type: 'note',
      id: 'note-1',
      title: 'Streaming switch wiring',
      summary: 'Toggle regression',
      source: 'user_focus_button'
    }
    const feature = useChatFeature()
    feature.inputValue.value = '检查一下流式开关'

    await feature.handleSend()

    expect(sendSayachan).toHaveBeenCalledWith({
      text: '检查一下流式开关',
      focus: { type: 'note', id: 'note-1' },
      debug: true
    })
    expect(streamSayachan).not.toHaveBeenCalled()
    expect(streamChat).not.toHaveBeenCalled()
    expect(sendChat).not.toHaveBeenCalled()
    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(2, { role: 'assistant', content: '' })
    expect(chatStore.updateMessageContent).toHaveBeenCalledWith(1, 'V4 Done')
    expect(chatStore.setProviderState).toHaveBeenCalledWith(undefined)
    expect(chatStore.setSending).toHaveBeenLastCalledWith(false)
  })

  it('consumes an active chat focus once while routing that turn to core guide mode', async () => {
    chatStore.activeFocus = {
      type: 'project',
      id: 'project-1',
      title: 'Sayachan AI Core',
      summary: 'Private-core work',
      status: 'in_progress',
      currentFocusTaskTitle: 'Wire chat focus',
      source: 'user_focus_button'
    }
    const feature = useChatFeature()
    feature.inputValue.value = '下一步呢'

    await feature.handleSend()

    expect(chatStore.clearFocus).toHaveBeenCalledTimes(1)
    expect(chatStore.activeFocus).toBeUndefined()
    expect(feature.getMessageFocusSnapshot(0)).toEqual({
      type: 'project',
      title: 'Sayachan AI Core'
    })
    expect(streamChat).toHaveBeenCalledWith(
      [{ role: 'user', content: '下一步呢' }],
      {
        chatFocus: {
          type: 'project',
          id: 'project-1',
          title: 'Sayachan AI Core',
          summary: 'Private-core work',
          status: 'in_progress',
          currentFocusTaskTitle: 'Wire chat focus',
          source: 'user_focus_button'
        }
      },
      {
        personalityBaseline: 'warm',
        futureSlots: {
          warmth: 7
        },
        debugTrace: true,
        memoryCandidate: true
      },
      expect.any(Object)
    )

    feature.inputValue.value = '闲聊一下'
    await feature.handleSend()

    expect(streamChat).toHaveBeenNthCalledWith(
      2,
      [
        { role: 'user', content: '下一步呢' },
        { role: 'assistant', content: 'Done' },
        { role: 'user', content: '闲聊一下' }
      ],
      {},
      {
        personalityBaseline: 'warm',
        futureSlots: {
          warmth: 7
        },
        debugTrace: true,
        memoryCandidate: true
      },
      expect.any(Object)
    )
    expect(feature.getMessageFocusSnapshot(2)).toBeUndefined()
  })

  it('updates the assistant message as stream deltas arrive', async () => {
    streamChatMock.mockImplementation(async (_messages, _context, _controls, handlers) => {
      handlers?.onToolStatus?.({
        type: 'tool_call_started',
        toolName: 'getProjectContext',
        displayName: '正在查看相关项目...'
      })
      handlers?.onDelta?.('Hel', { type: 'text_delta', delta: 'Hel' })
      handlers?.onDelta?.('lo', { type: 'text_delta', delta: 'lo' })
      handlers?.onCompleted?.('Hello', {
        type: 'completed',
        text: 'Hello',
        output: {
          reply: 'Hello',
          sourceReceipts: [{ type: 'project', title: 'Sayachan AI Core' }],
          memoryCandidate: {
            type: 'preference',
            content: 'Use plain language first.',
            reason: 'Stable communication preference.',
            source: 'assistant_suggested_user_approved',
            confidence: 0.9
          },
          debugTrace: {
            tools: {
              executed: [{ name: 'getProjectContext', status: 'completed', round: 1 }]
            }
          }
        },
        providerState: {
          strategy: 'previous_response',
          lastResponseId: 'resp-ui-1',
          status: 'active'
        }
      })
      return { reply: 'Hello' }
    })
    const feature = useChatFeature()
    feature.inputValue.value = 'hello'

    await feature.handleSend()

    expect(feature.toolStatusText.value).toBe('')
    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(2, { role: 'assistant', content: '' })
    expect(chatStore.updateMessageContent).toHaveBeenCalledWith(1, 'Hel')
    expect(chatStore.updateMessageContent).toHaveBeenCalledWith(1, 'Hello')
    expect(chatStore.setProviderState).toHaveBeenCalledWith({
      strategy: 'previous_response',
      lastResponseId: 'resp-ui-1',
      status: 'active'
    })
    expect(feature.getMessageSourceReceipts(1)).toEqual([
      { type: 'project', title: 'Sayachan AI Core' }
    ])
    expect(feature.getMessageMemoryCandidate(1)).toEqual({
      candidate: {
        type: 'preference',
        content: 'Use plain language first.',
        reason: 'Stable communication preference.',
        source: 'assistant_suggested_user_approved',
        confidence: 0.9
      },
      status: 'pending'
    })
    expect(runtimeControls.clearLatestDebugTrace).toHaveBeenCalled()
    expect(runtimeControls.setLatestDebugTrace).toHaveBeenCalledWith({
      tools: {
        executed: [{ name: 'getProjectContext', status: 'completed', round: 1 }]
      }
    })
    expect(feature.isStreamingReply.value).toBe(false)
  })

  it('saves or dismisses assistant-suggested memory only after user action', async () => {
    sendChatMock.mockResolvedValue({
      reply: 'Done',
      memoryCandidate: {
        type: 'continuity_hint',
        content: 'Keep architecture tradeoffs visible.',
        source: 'assistant_suggested_user_approved'
      }
    })
    runtimeControls.chatStreamingEnabled = false
    const feature = useChatFeature()
    feature.inputValue.value = 'hello'

    await feature.handleSend()

    expect(createMemoryEntry).not.toHaveBeenCalled()
    expect(feature.getMessageMemoryCandidate(1)?.status).toBe('pending')

    await feature.acceptMemoryCandidate(1)

    expect(createMemoryEntry).toHaveBeenCalledWith({
      type: 'continuity_hint',
      content: 'Keep architecture tradeoffs visible.',
      source: 'assistant_suggested_user_approved'
    })
    expect(feature.getMessageMemoryCandidate(1)?.status).toBe('saved')

    feature.inputValue.value = 'hello again'
    await feature.handleSend()
    expect(feature.getMessageMemoryCandidate(3)?.status).toBe('pending')

    feature.dismissMemoryCandidate(3)
    expect(feature.getMessageMemoryCandidate(3)?.status).toBe('dismissed')
  })

  it('sends natural expansion confirmations without backend-owned offer ids', async () => {
    chatStore.messages = [{
      role: 'assistant',
      content: '这个会有点长，要展开吗？'
    }]
    streamChatMock.mockResolvedValue({ reply: 'Expanded answer' })
    const feature = useChatFeature()
    feature.inputValue.value = '展开讲讲'

    await feature.handleSend()

    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(1, {
      role: 'user',
      content: '展开讲讲'
    })
    expect(streamChat).toHaveBeenCalledWith(
      [
        { role: 'assistant', content: '这个会有点长，要展开吗？' },
        { role: 'user', content: '展开讲讲' }
      ],
      {},
      expect.not.objectContaining({
        expansionOfferId: expect.any(String)
      }),
      expect.any(Object)
    )
  })

  it('uses the local fallback reply when sendChat fails', async () => {
    const onSendError = vi.fn()
    streamChatMock.mockRejectedValue(new Error('offline'))
    const feature = useChatFeature({ onSendError })
    feature.inputValue.value = 'hello'

    await feature.handleSend()

    expect(onSendError).toHaveBeenCalled()
    expect(chatStore.appendMessage).toHaveBeenLastCalledWith({
      role: 'assistant',
      content: '我刚刚有点走神了，我们再试一次。'
    })
    expect(chatStore.setSending).toHaveBeenLastCalledWith(false)
  })

  it('submits on Enter without Shift', () => {
    const feature = useChatFeature()
    feature.handleSend = vi.fn()
    const preventDefault = vi.fn()
    const event = { key: 'Enter', shiftKey: false, preventDefault }

    feature.handleKeydown(event)

    expect(preventDefault).toHaveBeenCalled()
  })
})
