import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatFeature } from './useChatFeature.js'
import { sendChat, streamChat } from './chat.api.js'
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
  sendChat: vi.fn(),
  streamChat: vi.fn()
}))

vi.mock('../memory/memory.api.js', () => ({
  createMemoryEntry: vi.fn()
}))

const sendChatMock = vi.mocked(sendChat)
const streamChatMock = vi.mocked(streamChat)
const createMemoryEntryMock = vi.mocked(createMemoryEntry)

type ChatStoreMock = ReturnType<typeof createChatStore>
type RuntimeControlsMock = {
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
  setLatestDebugTrace: (value: unknown) => void
  clearLatestDebugTrace: () => void
}

function createChatStore() {
  const store = {
    isOpen: false,
    isSending: false,
    messages: [] as ChatMessageDto[],
    openChat: vi.fn(() => {
      store.isOpen = true
    }),
    closeChat: vi.fn(() => {
      store.isOpen = false
    }),
    appendMessage: vi.fn((message: ChatMessageDto) => {
      store.messages.push(message)
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
      setLatestDebugTrace: vi.fn(),
      clearLatestDebugTrace: vi.fn()
    }

    storeMocks.chatStore = chatStore
    storeMocks.runtimeControls = runtimeControls
    sendChatMock.mockResolvedValue({ reply: 'Done' })
    streamChatMock.mockResolvedValue({ reply: 'Done' })
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
          warmth: 7,
          convergenceMode: 'guided'
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
          warmth: 7,
          convergenceMode: 'guided'
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
          warmth: 7,
          convergenceMode: 'guided'
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
