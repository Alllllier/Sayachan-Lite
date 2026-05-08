import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessageDto } from '@sayachan/contracts'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref<ChatMessageDto[]>([])
  const isSending = ref(false)

  function openChat() {
    isOpen.value = true
  }

  function closeChat() {
    isOpen.value = false
  }

  function appendMessage(message: ChatMessageDto): void {
    messages.value.push(message)
  }

  function setSending(value: boolean): void {
    isSending.value = value
  }

  function resetChat() {
    isOpen.value = false
    messages.value = []
    isSending.value = false
  }

  return {
    isOpen,
    messages,
    isSending,
    openChat,
    closeChat,
    appendMessage,
    setSending,
    resetChat
  }
})
