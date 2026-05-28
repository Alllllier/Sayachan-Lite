import { computed, nextTick, ref, watch } from 'vue'
import type { ChatContextDto, ChatFocusDto, ChatMemoryCandidateDto, ChatMessageDto, ChatSourceReceiptDto } from '@sayachan/contracts'
import { useChatStore } from '../../stores/chat'
import { useRuntimeControls } from '../../stores/runtimeControls'
import { createMemoryEntry } from '../memory/memory.api.js'
import { loadChatSession, sendChat, sendSayachan, startNewChatSession, streamChat, type ChatStreamEvent, type ChatProviderState } from './chat.api.js'
import {
  canSendChatMessage,
  getChatFallbackReply,
  getChatSendButtonLabel,
  getChatSendText,
  isChatInputDisabled,
  shouldClearChatDraft
} from './chat.rules'

const noop = () => {}

type ChatFeatureOptions = {
  scrollToBottom?: () => void
  onSendError?: (error: unknown) => void
}

type ChatFocusSnapshot = Pick<ChatFocusDto, 'type' | 'title'>
type ChatMemoryCandidateState = {
  candidate: ChatMemoryCandidateDto
  status: 'pending' | 'saving' | 'saved' | 'dismissed' | 'error'
}

type ChatStoreLike = {
  isOpen: boolean
  isSending: boolean
  messages: ChatMessageDto[]
  sessionLoaded?: boolean
  openChat: () => void
  closeChat: () => void
  appendMessage: (message: ChatMessageDto) => void
  hydrateSession?: (messages: ChatMessageDto[], providerState?: ChatProviderState) => void
  clearMessagesForNewSession?: () => void
  updateMessageContent: (index: number, content: string) => void
  setProviderState: (value: unknown) => void
  setSending: (value: boolean) => void
  providerState?: unknown
  activeFocus?: ChatFocusDto
  clearFocus?: () => void
}

type ChatKeydownEvent = Pick<KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>

export function useChatFeature(options: ChatFeatureOptions = {}) {
  const scrollToBottom = options.scrollToBottom || noop
  const onSendError = options.onSendError || noop

  const chatStore = useChatStore() as ChatStoreLike
  const runtimeControls = useRuntimeControls()

  const inputValue = ref('')
  const isPanelOpen = ref(false)
  const isStreamingReply = ref(false)
  const toolStatusText = ref('')
  const focusSnapshotsByMessageIndex = ref<Record<number, ChatFocusSnapshot>>({})
  const sourceReceiptsByMessageIndex = ref<Record<number, ChatSourceReceiptDto[]>>({})
  const memoryCandidatesByMessageIndex = ref<Record<number, ChatMemoryCandidateState>>({})

  watch(
    () => chatStore.messages.length,
    length => {
      if (length === 0) {
        focusSnapshotsByMessageIndex.value = {}
        sourceReceiptsByMessageIndex.value = {}
        memoryCandidatesByMessageIndex.value = {}
      }
    }
  )

  const context = computed<ChatContextDto>(() => ({}))

  const chatInputDisabled = computed(() => isChatInputDisabled({
    isSending: chatStore.isSending
  }))

  const chatSendButtonLabel = computed(() => getChatSendButtonLabel({
    isSending: chatStore.isSending
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

  function contextWithFocusForTurn(baseContext: ChatContextDto, focus?: ChatFocusDto): ChatContextDto {
    if (!focus) {
      return baseContext
    }

    return {
      ...(
        baseContext && typeof baseContext === 'object' && !Array.isArray(baseContext)
          ? baseContext
          : {}
      ),
      chatFocus: focus
    }
  }

  function setMessageSourceReceipts(index: number | null, receipts?: ChatSourceReceiptDto[]): void {
    if (index === null || !receipts || receipts.length === 0) return
    sourceReceiptsByMessageIndex.value = {
      ...sourceReceiptsByMessageIndex.value,
      [index]: receipts
    }
  }

  function getMessageSourceReceipts(index: number): ChatSourceReceiptDto[] {
    return sourceReceiptsByMessageIndex.value[index] || chatStore.messages[index]?.sourceReceipts || []
  }

  function setMessageMemoryCandidate(index: number | null, candidate?: ChatMemoryCandidateDto): void {
    if (index === null || !candidate) return
    memoryCandidatesByMessageIndex.value = {
      ...memoryCandidatesByMessageIndex.value,
      [index]: {
        candidate,
        status: 'pending'
      }
    }
  }

  function getMessageMemoryCandidate(index: number): ChatMemoryCandidateState | undefined {
    return memoryCandidatesByMessageIndex.value[index]
  }

  function updateMemoryCandidateStatus(index: number, status: ChatMemoryCandidateState['status']): void {
    const current = memoryCandidatesByMessageIndex.value[index]
    if (!current) return
    memoryCandidatesByMessageIndex.value = {
      ...memoryCandidatesByMessageIndex.value,
      [index]: {
        ...current,
        status
      }
    }
  }

  async function acceptMemoryCandidate(index: number): Promise<void> {
    const current = memoryCandidatesByMessageIndex.value[index]
    if (!current || (current.status !== 'pending' && current.status !== 'error')) return

    updateMemoryCandidateStatus(index, 'saving')
    try {
      await createMemoryEntry({
        type: current.candidate.type,
        content: current.candidate.content,
        source: current.candidate.source
      })
      updateMemoryCandidateStatus(index, 'saved')
    } catch {
      updateMemoryCandidateStatus(index, 'error')
    }
  }

  function dismissMemoryCandidate(index: number): void {
    const current = memoryCandidatesByMessageIndex.value[index]
    if (!current || (current.status !== 'pending' && current.status !== 'error')) return
    updateMemoryCandidateStatus(index, 'dismissed')
  }

  function setMessageFocusSnapshot(index: number, focus?: ChatFocusDto): void {
    if (!focus) return
    focusSnapshotsByMessageIndex.value = {
      ...focusSnapshotsByMessageIndex.value,
      [index]: {
        type: focus.type,
        title: focus.title
      }
    }
  }

  function getMessageFocusSnapshot(index: number): ChatFocusSnapshot | undefined {
    return focusSnapshotsByMessageIndex.value[index] || chatStore.messages[index]?.focusSnapshot
  }

  function hydrateMessageMetadata(messages: ChatMessageDto[]): void {
    const focusSnapshots: Record<number, ChatFocusSnapshot> = {}
    const sourceReceipts: Record<number, ChatSourceReceiptDto[]> = {}
    const memoryCandidates: Record<number, ChatMemoryCandidateState> = {}

    messages.forEach((message, index) => {
      if (message.focusSnapshot) {
        focusSnapshots[index] = message.focusSnapshot
      }
      if (message.sourceReceipts && message.sourceReceipts.length > 0) {
        sourceReceipts[index] = message.sourceReceipts
      }
      if (message.memoryCandidate) {
        memoryCandidates[index] = {
          candidate: message.memoryCandidate,
          status: 'pending'
        }
      }
    })

    focusSnapshotsByMessageIndex.value = focusSnapshots
    sourceReceiptsByMessageIndex.value = sourceReceipts
    memoryCandidatesByMessageIndex.value = memoryCandidates
  }

  async function loadCurrentSession(): Promise<void> {
    if (chatStore.sessionLoaded || chatStore.messages.length > 0) {
      return
    }

    try {
      const session = await loadChatSession()
      if (chatStore.messages.length > 0) {
        return
      }

      chatStore.hydrateSession?.(session.messages, session.providerState)
      hydrateMessageMetadata(session.messages)
      scrollToBottom()
    } catch (error) {
      onSendError(error)
    }
  }

  async function startNewSession(): Promise<void> {
    if (chatStore.isSending) {
      return
    }

    try {
      await startNewChatSession()
      chatStore.clearMessagesForNewSession?.()
      focusSnapshotsByMessageIndex.value = {}
      sourceReceiptsByMessageIndex.value = {}
      memoryCandidatesByMessageIndex.value = {}
      runtimeControls.clearLatestDebugTrace()
      toolStatusText.value = ''
      isStreamingReply.value = false
      scrollToBottom()
    } catch (error) {
      onSendError(error)
    }
  }

  function messagesForTransport(messages: ChatMessageDto[]): ChatMessageDto[] {
    return messages.map(message => ({
      role: message.role,
      content: message.content
    }))
  }

  async function handleSend(overrideText?: string | null) {
    const text = getChatSendText({
      overrideText,
      inputValue: inputValue.value
    })

    if (!canSendChatMessage({
      text,
      isSending: chatStore.isSending
    })) return

    if (shouldClearChatDraft(overrideText)) {
      inputValue.value = ''
    }

    const focusForTurn = chatStore.activeFocus
    const userMessageIndex = chatStore.messages.length
    const userMessage: ChatMessageDto = {
      role: 'user',
      content: text
    }
    if (focusForTurn) {
      userMessage.focusSnapshot = {
        type: focusForTurn.type,
        title: focusForTurn.title
      }
    }
    chatStore.appendMessage(userMessage)
    setMessageFocusSnapshot(userMessageIndex, focusForTurn)

    let chatContext: ChatContextDto = context.value
    chatContext = contextWithFocusForTurn(chatContext, focusForTurn)
    if (focusForTurn) {
      chatStore.clearFocus?.()
    }

    chatStore.setSending(true)
    isStreamingReply.value = false
    toolStatusText.value = ''
    runtimeControls.clearLatestDebugTrace()
    try {
      const controls = {
        personalityBaseline: runtimeControls.personalityBaseline,
        futureSlots: {
          warmth: runtimeControls.futureSlots.warmth
        },
        debugTrace: runtimeControls.debugTraceEnabled,
        memoryCandidate: true
      }
      const controlsWithState = chatStore.providerState
        ? { ...controls, providerState: chatStore.providerState }
        : controls
      const requestMessages = messagesForTransport(chatStore.messages)

      if (runtimeControls.coreVersion === 'v4') {
        const { reply } = await sendSayachan({
          text,
          focus: focusForTurn
            ? { type: focusForTurn.type, id: focusForTurn.id }
            : null,
          debug: runtimeControls.debugTraceEnabled
        })
        chatStore.appendMessage({ role: 'assistant', content: reply })
        chatStore.setProviderState(undefined)
        scrollToBottom()
        return
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

        const { reply } = await streamChat(requestMessages, chatContext, controlsWithState, {
          onDelta: (delta) => {
            streamedReply += delta
            toolStatusText.value = ''
            ensureAssistantMessage()
            chatStore.updateMessageContent(assistantMessageIndex as number, streamedReply)
            scrollToBottom()
          },
          onToolStatus: (event: ChatStreamEvent) => {
            toolStatusText.value = event.displayName || ''
            scrollToBottom()
          },
          onCompleted: (reply, event) => {
            toolStatusText.value = ''
            ensureAssistantMessage()
            chatStore.updateMessageContent(assistantMessageIndex as number, reply)
            setMessageSourceReceipts(assistantMessageIndex, event.output?.sourceReceipts || event.sourceReceipts)
            setMessageMemoryCandidate(assistantMessageIndex, event.output?.memoryCandidate || event.memoryCandidate)
            runtimeControls.setLatestDebugTrace(event.output?.debugTrace || event.debugTrace)
            chatStore.setProviderState(event.providerState)
            scrollToBottom()
          }
        })

        if (assistantMessageIndex === null) {
          await nextTick()
          chatStore.appendMessage({ role: 'assistant', content: reply })
        }
      } else {
        const { reply, providerState, sourceReceipts, debugTrace, memoryCandidate } = await sendChat(requestMessages, chatContext, controlsWithState)
        const assistantMessageIndex = chatStore.messages.length
        chatStore.appendMessage({ role: 'assistant', content: reply })
        setMessageSourceReceipts(assistantMessageIndex, sourceReceipts)
        setMessageMemoryCandidate(assistantMessageIndex, memoryCandidate)
        runtimeControls.setLatestDebugTrace(debugTrace)
        chatStore.setProviderState(providerState)
      }
    } catch (error) {
      onSendError(error)
      chatStore.appendMessage({
        role: 'assistant',
        content: getChatFallbackReply(runtimeControls.personalityBaseline)
      })
    } finally {
      isStreamingReply.value = false
      toolStatusText.value = ''
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
    isStreamingReply,
    toolStatusText,
    focusSnapshotsByMessageIndex,
    sourceReceiptsByMessageIndex,
    memoryCandidatesByMessageIndex,
    chatInputDisabled,
    chatSendButtonLabel,
    getMessageSourceReceipts,
    getMessageMemoryCandidate,
    getMessageFocusSnapshot,
    acceptMemoryCandidate,
    dismissMemoryCandidate,
    openPopup,
    closePopup,
    togglePanel,
    loadCurrentSession,
    startNewSession,
    handleSend,
    handleKeydown
  }
}
