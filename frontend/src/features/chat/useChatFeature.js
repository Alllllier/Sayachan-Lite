import { computed, ref } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useCockpitSignals } from '../../stores/cockpitSignals'
import { useRuntimeControls } from '../../stores/runtimeControls'
import { refreshCockpitContext } from '../../services/cockpitContextService'
import { sendChat } from './chat.api.js'
import {
  canSendChatMessage,
  getChatFallbackReply,
  getChatSendButtonLabel,
  getChatSendText,
  isChatInputDisabled,
  resolveChatContextForSend,
  shouldClearChatDraft
} from './chat.rules.js'

const noop = () => {}

export function useChatFeature(options = {}) {
  const scrollToBottom = options.scrollToBottom || noop
  const onHydrationError = options.onHydrationError || noop
  const onSendError = options.onSendError || noop

  const chatStore = useChatStore()
  const cockpitSignals = useCockpitSignals()
  const runtimeControls = useRuntimeControls()

  const inputValue = ref('')
  const isPanelOpen = ref(false)
  const isHydrating = ref(false)

  const context = computed(() => ({
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

  async function handleSend(presetText) {
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

    let chatContext = context.value
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
    try {
      const { reply } = await sendChat(chatStore.messages, chatContext, {
        personalityBaseline: runtimeControls.personalityBaseline,
        futureSlots: {
          warmth: runtimeControls.futureSlots.warmth,
          convergenceMode: runtimeControls.futureSlots.convergenceMode
        }
      })
      chatStore.appendMessage({ role: 'assistant', content: reply })
    } catch (error) {
      onSendError(error)
      chatStore.appendMessage({
        role: 'assistant',
        content: getChatFallbackReply(runtimeControls.personalityBaseline)
      })
    } finally {
      chatStore.setSending(false)
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return {
    chatStore,
    runtimeControls,
    inputValue,
    isPanelOpen,
    isHydrating,
    chatInputDisabled,
    chatSendButtonLabel,
    openPopup,
    closePopup,
    togglePanel,
    handleSend,
    handleKeydown
  }
}
