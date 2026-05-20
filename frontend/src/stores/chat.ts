import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatFocusDto, ChatMessageDto } from '@sayachan/contracts'
import type { ChatProviderState } from '../features/chat/chat.api'

export type ChatFocus = ChatFocusDto

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref<ChatMessageDto[]>([])
  const isSending = ref(false)
  const providerState = ref<ChatProviderState | undefined>()
  const activeFocus = ref<ChatFocus | undefined>()

  function openChat() {
    isOpen.value = true
  }

  function closeChat() {
    isOpen.value = false
  }

  function appendMessage(message: ChatMessageDto): void {
    messages.value.push(message)
  }

  function updateMessageContent(index: number, content: string): void {
    if (messages.value[index]) {
      messages.value[index] = {
        ...messages.value[index],
        content
      }
    }
  }

  function setSending(value: boolean): void {
    isSending.value = value
  }

  function setProviderState(value: ChatProviderState | undefined): void {
    providerState.value = value
  }

  function setFocus(focus: ChatFocus): void {
    activeFocus.value = focus
  }

  function clearFocus(): void {
    activeFocus.value = undefined
  }

  function resetChat() {
    isOpen.value = false
    messages.value = []
    isSending.value = false
    providerState.value = undefined
    activeFocus.value = undefined
  }

  return {
    isOpen,
    messages,
    isSending,
    providerState,
    activeFocus,
    openChat,
    closeChat,
    appendMessage,
    updateMessageContent,
    setSending,
    setProviderState,
    setFocus,
    clearFocus,
    resetChat
  }
})
