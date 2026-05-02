import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatFeature } from './useChatFeature.js'
import { useChatStore } from '../../stores/chat'
import { useCockpitSignals } from '../../stores/cockpitSignals'
import { useRuntimeControls } from '../../stores/runtimeControls'
import { refreshCockpitContext } from '../../services/cockpitContextService'
import { sendChat } from './chat.api.js'

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

function createChatStore() {
  return {
    isOpen: false,
    isSending: false,
    messages: [],
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
  let chatStore
  let cockpitSignals
  let runtimeControls

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
        welcome: 'Hi',
        toneLabel: 'Warm'
      }
    }

    useChatStore.mockReturnValue(chatStore)
    useCockpitSignals.mockReturnValue(cockpitSignals)
    useRuntimeControls.mockReturnValue(runtimeControls)
    sendChat.mockResolvedValue({ reply: 'Done' })
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
    refreshCockpitContext.mockResolvedValue({ activeTasksCount: 4 })
    const feature = useChatFeature()

    await feature.handleSend('帮我聚焦')

    expect(refreshCockpitContext).toHaveBeenCalled()
    expect(sendChat).toHaveBeenCalledWith(
      chatStore.messages,
      { activeTasksCount: 4 },
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
    sendChat.mockRejectedValue(new Error('offline'))
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

    feature.handleKeydown({ key: 'Enter', shiftKey: false, preventDefault })

    expect(preventDefault).toHaveBeenCalled()
  })
})
