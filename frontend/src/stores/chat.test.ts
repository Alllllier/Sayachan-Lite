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

  it('updates an existing message content without changing its role', () => {
    const store = useChatStore()

    store.appendMessage({ role: 'assistant', content: 'Hel' })
    store.updateMessageContent(0, 'Hello')

    expect(store.messages).toEqual([
      { role: 'assistant', content: 'Hello' }
    ])
  })

  it('tracks sending state', () => {
    const store = useChatStore()

    store.setSending(true)
    expect(store.isSending).toBe(true)
    store.setSending(false)
    expect(store.isSending).toBe(false)
  })

  it('tracks provider state for stateful OpenAI turns', () => {
    const store = useChatStore()

    store.setProviderState({
      strategy: 'previous_response',
      lastResponseId: 'resp-1',
      status: 'active'
    })

    expect(store.providerState).toEqual({
      strategy: 'previous_response',
      lastResponseId: 'resp-1',
      status: 'active'
    })
  })

  it('tracks a user-selected chat focus until it is cleared or reset', () => {
    const store = useChatStore()

    store.setFocus({
      type: 'note',
      id: 'note-1',
      title: 'Architecture map',
      excerpt: 'Context bridge notes',
      source: 'user_focus_button'
    })
    expect(store.activeFocus).toEqual({
      type: 'note',
      id: 'note-1',
      title: 'Architecture map',
      excerpt: 'Context bridge notes',
      source: 'user_focus_button'
    })

    store.clearFocus()
    expect(store.activeFocus).toBeUndefined()
  })

  it('resets open state, messages, and sending state together', () => {
    const store = useChatStore()

    store.openChat()
    store.appendMessage({ role: 'user', content: 'hello' })
    store.setSending(true)
    store.setProviderState({ strategy: 'previous_response', lastResponseId: 'resp-1' })
    store.setFocus({
      type: 'project',
      id: 'project-1',
      title: 'Sayachan',
      source: 'user_focus_button'
    })

    store.resetChat()

    expect(store.isOpen).toBe(false)
    expect(store.messages).toEqual([])
    expect(store.isSending).toBe(false)
    expect(store.providerState).toBeUndefined()
    expect(store.activeFocus).toBeUndefined()
  })
})
