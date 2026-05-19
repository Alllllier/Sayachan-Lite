import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessageDto } from '@sayachan/contracts'
import type { ChatProviderState } from '../features/chat/chat.api'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref<ChatMessageDto[]>([])
  const isSending = ref(false)
  const providerState = ref<ChatProviderState | undefined>()

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

  function resetChat() {
    isOpen.value = false
    messages.value = []
    isSending.value = false
    providerState.value = undefined
  }

  return {
    isOpen,
    messages,
    isSending,
    providerState,
    openChat,
    closeChat,
    appendMessage,
    updateMessageContent,
    setSending,
    setProviderState,
    resetChat
  }
})
