import { computed, nextTick, ref } from 'vue'
import type { ChatContextDto, ChatMessageDto } from '@sayachan/contracts'
import { useChatStore } from '../../stores/chat'
import { useCockpitSignals } from '../../stores/cockpitSignals'
import { useRuntimeControls } from '../../stores/runtimeControls'
import { refreshCockpitContext } from '../../services/cockpitContextService'
import { sendChat, streamChat } from './chat.api.js'
import {
  canSendChatMessage,
  getChatFallbackReply,
  getChatSendButtonLabel,
  getChatSendText,
  isChatInputDisabled,
  resolveChatContextForSend,
  shouldClearChatDraft
} from './chat.rules'

const noop = () => {}

type ChatFeatureOptions = {
  scrollToBottom?: () => void
  onHydrationError?: (error: unknown) => void
  onSendError?: (error: unknown) => void
}

type ChatStoreLike = {
  isOpen: boolean
  isSending: boolean
  messages: ChatMessageDto[]
  openChat: () => void
  closeChat: () => void
  appendMessage: (message: ChatMessageDto) => void
  updateMessageContent: (index: number, content: string) => void
  setSending: (value: boolean) => void
}

type CockpitSignalsLike = {
  activeProjectsCount: number
  activeTasksCount: number
  pinnedProjectName: string
  currentNextAction: string
  hasHydrated: boolean
}

type ChatKeydownEvent = Pick<KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>

export function useChatFeature(options: ChatFeatureOptions = {}) {
  const scrollToBottom = options.scrollToBottom || noop
  const onHydrationError = options.onHydrationError || noop
  const onSendError = options.onSendError || noop

  const chatStore = useChatStore() as ChatStoreLike
  const cockpitSignals = useCockpitSignals() as CockpitSignalsLike
  const runtimeControls = useRuntimeControls()

  const inputValue = ref('')
  const isPanelOpen = ref(false)
  const isHydrating = ref(false)
  const isStreamingReply = ref(false)

  const context = computed<ChatContextDto>(() => ({
    activeProjectsCount: cockpitSignals.activeProjectsCount,
    activeTasksCount: cockpitSignals.activeTasksCount,
    pinnedProjectName: cockpitSignals.pinnedProjectName,
    currentNextAction: cockpitSignals.currentNextAction,
  }))

  const chatInputDisabled = computed(() => isChatInputDisabled({
    isSending: chatStore.isSending,
    isHydrating: isHydrating.value
  }))

  const chatSendButtonLabel = computed(() => getChatSendButtonLabel({
    isSending: chatStore.isSending,
    isHydrating: isHydrating.value
  }))

  function openPopup() {
    chatStore.openChat()
    scrollToBottom()
  }

  function closePopup() {
    chatStore.closeChat()
    isPanelOpen.value = false
  }

  function togglePanel() {
    isPanelOpen.value = !isPanelOpen.value
  }

  async function handleSend(presetText?: string | null) {
    const text = getChatSendText({
      presetText,
      inputValue: inputValue.value
    })

    if (!canSendChatMessage({
      text,
      isSending: chatStore.isSending,
      isHydrating: isHydrating.value
    })) return

    if (shouldClearChatDraft(presetText)) {
      inputValue.value = ''
    }

    chatStore.appendMessage({ role: 'user', content: text })

    let chatContext: ChatContextDto = context.value
    if (!cockpitSignals.hasHydrated) {
      isHydrating.value = true
      chatContext = await resolveChatContextForSend({
        cockpitSignals,
        currentContext: context.value,
        refreshCockpitContext,
        onHydrationError
      })
      isHydrating.value = false
    }

    chatStore.setSending(true)
    isStreamingReply.value = false
    try {
      const controls = {
        personalityBaseline: runtimeControls.personalityBaseline,
        futureSlots: {
          warmth: runtimeControls.futureSlots.warmth,
          convergenceMode: runtimeControls.futureSlots.convergenceMode
        }
      }

      if (runtimeControls.chatStreamingEnabled) {
        let assistantMessageIndex: number | null = null
        let streamedReply = ''
        const ensureAssistantMessage = () => {
          if (assistantMessageIndex === null) {
            assistantMessageIndex = chatStore.messages.length
            chatStore.appendMessage({ role: 'assistant', content: '' })
            isStreamingReply.value = true
          }
        }

        const { reply } = await streamChat(chatStore.messages, chatContext, controls, {
          onDelta: (delta) => {
            streamedReply += delta
            ensureAssistantMessage()
            chatStore.updateMessageContent(assistantMessageIndex as number, streamedReply)
            scrollToBottom()
          },
          onCompleted: (reply) => {
            ensureAssistantMessage()
            chatStore.updateMessageContent(assistantMessageIndex as number, reply)
            scrollToBottom()
          }
        })

        if (assistantMessageIndex === null) {
          await nextTick()
          chatStore.appendMessage({ role: 'assistant', content: reply })
        }
      } else {
        const { reply } = await sendChat(chatStore.messages, chatContext, controls)
        chatStore.appendMessage({ role: 'assistant', content: reply })
      }
    } catch (error) {
      onSendError(error)
      chatStore.appendMessage({
        role: 'assistant',
        content: getChatFallbackReply(runtimeControls.personalityBaseline)
      })
    } finally {
      isStreamingReply.value = false
      chatStore.setSending(false)
    }
  }

  function handleKeydown(event: ChatKeydownEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return {
    chatStore,
    runtimeControls,
    inputValue,
    isPanelOpen,
    isHydrating,
    isStreamingReply,
    chatInputDisabled,
    chatSendButtonLabel,
    openPopup,
    closePopup,
    togglePanel,
    handleSend,
    handleKeydown
  }
}
