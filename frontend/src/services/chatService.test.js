import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { sendChat } from './chatService.js'
import { useRuntimeControls } from '../stores/runtimeControls.js'

function createLocalStorageMock() {
  const store = new Map()

  return {
    getItem: vi.fn(key => store.get(key) ?? null),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn(key => store.delete(key)),
    clear: vi.fn(() => store.clear())
  }
}

describe('chatService behavior locks', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    vi.stubGlobal('fetch', vi.fn())
    setActivePinia(createPinia())
  })

  it('sends chat messages with context, runtime controls, last user message, and future slots', async () => {
    const runtimeControls = useRuntimeControls()
    runtimeControls.setWarmth(8)
    runtimeControls.setConvergenceMode('decisive')

    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: 'Ready.' })
    })

    await expect(sendChat([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'latest' }
    ], {
      activeTasksCount: 3
    }, {
      personalityBaseline: 'strict'
    })).resolves.toEqual({ reply: 'Ready.' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'first' },
          { role: 'assistant', content: 'reply' },
          { role: 'user', content: 'latest' }
        ],
        context: {
          activeTasksCount: 3
        },
        runtimeControls: {
          personalityBaseline: 'strict',
          lastUserMessage: 'latest',
          futureSlots: {
            warmth: 8,
            convergenceMode: 'decisive'
          }
        }
      })
    })
  })

  it('uses an empty last user message when no user message exists', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: 'Ready.' })
    })

    await sendChat([{ role: 'assistant', content: 'hello' }], {}, {})

    const payload = JSON.parse(fetch.mock.calls[0][1].body)
    expect(payload.runtimeControls.lastUserMessage).toBe('')
  })

  it('throws when the chat endpoint returns a non-ok response', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503
    })

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Chat request failed: 503')
  })

  it('throws when the chat endpoint reply is empty or invalid', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: '' })
    })

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')

    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: null })
    })

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')
  })
})
