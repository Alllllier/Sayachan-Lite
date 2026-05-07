import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from './chat.js'

describe('chat store behavior locks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('opens and closes the chat surface', () => {
    const store = useChatStore()

    expect(store.isOpen).toBe(false)
    store.openChat()
    expect(store.isOpen).toBe(true)
    store.closeChat()
    expect(store.isOpen).toBe(false)
  })

  it('appends messages in order', () => {
    const store = useChatStore()

    store.appendMessage({ role: 'user', content: 'hello' })
    store.appendMessage({ role: 'assistant', content: 'hi' })

    expect(store.messages).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi' }
    ])
  })

  it('tracks sending state', () => {
    const store = useChatStore()

    store.setSending(true)
    expect(store.isSending).toBe(true)
    store.setSending(false)
    expect(store.isSending).toBe(false)
  })

  it('resets open state, messages, and sending state together', () => {
    const store = useChatStore()

    store.openChat()
    store.appendMessage({ role: 'user', content: 'hello' })
    store.setSending(true)

    store.resetChat()

    expect(store.isOpen).toBe(false)
    expect(store.messages).toEqual([])
    expect(store.isSending).toBe(false)
  })
})
