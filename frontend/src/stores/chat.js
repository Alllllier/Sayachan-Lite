import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref([])
  const isSending = ref(false)

  function openChat() {
    isOpen.value = true
  }

  function closeChat() {
    isOpen.value = false
  }

  function appendMessage(message) {
    messages.value.push(message)
  }

  function setSending(value) {
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
