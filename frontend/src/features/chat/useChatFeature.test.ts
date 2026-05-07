import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatFeature } from './useChatFeature.js'
import { useChatStore } from '../../stores/chat'
import { useCockpitSignals } from '../../stores/cockpitSignals'
import { useRuntimeControls } from '../../stores/runtimeControls'
import { refreshCockpitContext } from '../../services/cockpitContextService'
import { sendChat } from './chat.api.js'
import type { ChatMessageDto } from '../../types/api-dtos'

vi.mock('../../stores/chat', () => ({
  useChatStore: vi.fn()
}))

vi.mock('../../stores/cockpitSignals', () => ({
  useCockpitSignals: vi.fn()
}))

vi.mock('../../stores/runtimeControls', () => ({
  useRuntimeControls: vi.fn()
}))

vi.mock('./chat.api.js', () => ({
  sendChat: vi.fn()
}))

vi.mock('../../services/cockpitContextService', () => ({
  refreshCockpitContext: vi.fn()
}))

const useChatStoreMock = vi.mocked(useChatStore)
const useCockpitSignalsMock = vi.mocked(useCockpitSignals)
const useRuntimeControlsMock = vi.mocked(useRuntimeControls)
const refreshCockpitContextMock = vi.mocked(refreshCockpitContext)
const sendChatMock = vi.mocked(sendChat)

type ChatStoreMock = ReturnType<typeof createChatStore>
type CockpitSignalsMock = {
  activeProjectsCount: number
  activeTasksCount: number
  pinnedProjectName: string
  currentNextAction: string
  hasHydrated: boolean
}
type RuntimeControlsMock = {
  personalityBaseline: 'warm'
  futureSlots: {
    warmth: number
    convergenceMode: 'guided'
  }
  personalityConfig: {
    toneLabel: string
  }
}

function createChatStore() {
  return {
    isOpen: false,
    isSending: false,
    messages: [] as ChatMessageDto[],
    openChat: vi.fn(function openChat() {
      this.isOpen = true
    }),
    closeChat: vi.fn(function closeChat() {
      this.isOpen = false
    }),
    appendMessage: vi.fn(function appendMessage(message) {
      this.messages.push(message)
    }),
    setSending: vi.fn(function setSending(value) {
      this.isSending = value
    })
  }
}

describe('useChatFeature orchestration', () => {
  let chatStore: ChatStoreMock
  let cockpitSignals: CockpitSignalsMock
  let runtimeControls: RuntimeControlsMock

  beforeEach(() => {
    vi.clearAllMocks()
    chatStore = createChatStore()
    cockpitSignals = {
      activeProjectsCount: 1,
      activeTasksCount: 2,
      pinnedProjectName: 'PMO',
      currentNextAction: 'Write handoff',
      hasHydrated: true
    }
    runtimeControls = {
      personalityBaseline: 'warm',
      futureSlots: {
        warmth: 7,
        convergenceMode: 'guided'
      },
      personalityConfig: {
        toneLabel: 'Warm'
      }
    }

    useChatStoreMock.mockReturnValue(chatStore as unknown as ReturnType<typeof useChatStore>)
    useCockpitSignalsMock.mockReturnValue(cockpitSignals as unknown as ReturnType<typeof useCockpitSignals>)
    useRuntimeControlsMock.mockReturnValue(runtimeControls as unknown as ReturnType<typeof useRuntimeControls>)
    sendChatMock.mockResolvedValue({ reply: 'Done' })
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

  it('sends typed chat messages with the current hydrated context', async () => {
    const feature = useChatFeature()
    feature.inputValue.value = '  hello  '

    await feature.handleSend()

    expect(chatStore.appendMessage).toHaveBeenNthCalledWith(1, { role: 'user', content: 'hello' })
    expect(feature.inputValue.value).toBe('')
    expect(refreshCockpitContext).not.toHaveBeenCalled()
    expect(sendChat).toHaveBeenCalledWith(
      chatStore.messages,
      {
        activeProjectsCount: 1,
        activeTasksCount: 2,
        pinnedProjectName: 'PMO',
        currentNextAction: 'Write handoff'
      },
      {
        personalityBaseline: 'warm',
        futureSlots: {
          warmth: 7,
          convergenceMode: 'guided'
        }
      }
    )
    expect(chatStore.appendMessage).toHaveBeenLastCalledWith({ role: 'assistant', content: 'Done' })
    expect(chatStore.setSending).toHaveBeenLastCalledWith(false)
  })

  it('hydrates cockpit context before sending when signals are cold', async () => {
    cockpitSignals.hasHydrated = false
    refreshCockpitContextMock.mockResolvedValue({
      activeProjectsCount: 1,
      activeTasksCount: 4,
      pinnedProjectName: 'PMO',
      currentNextAction: 'Write handoff'
    })
    const feature = useChatFeature()

    await feature.handleSend('帮我聚焦')

    expect(refreshCockpitContext).toHaveBeenCalled()
    expect(sendChat).toHaveBeenCalledWith(
      chatStore.messages,
      {
        activeProjectsCount: 1,
        activeTasksCount: 4,
        pinnedProjectName: 'PMO',
        currentNextAction: 'Write handoff'
      },
      {
        personalityBaseline: 'warm',
        futureSlots: {
          warmth: 7,
          convergenceMode: 'guided'
        }
      }
    )
    expect(feature.isHydrating.value).toBe(false)
  })

  it('uses the local fallback reply when sendChat fails', async () => {
    const onSendError = vi.fn()
    sendChatMock.mockRejectedValue(new Error('offline'))
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

    feature.handleKeydown({ key: 'Enter', shiftKey: false, preventDefault } as unknown as KeyboardEvent)

    expect(preventDefault).toHaveBeenCalled()
  })
})
