import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildChatRuntimePayload, sendChat } from './chat.api.js'

describe('chat api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends chat messages with context, runtime controls, last user message, and future slots', async () => {
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
      personalityBaseline: 'strict',
      futureSlots: {
        warmth: 8,
        convergenceMode: 'decisive'
      }
    })).resolves.toEqual({ reply: 'Ready.' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
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
        futureSlots: {
          warmth: 8,
          convergenceMode: 'decisive'
        },
        lastUserMessage: 'latest'
      }
    })
  })

  it('uses an empty last user message when no user message exists', async () => {
    expect(buildChatRuntimePayload([{ role: 'assistant', content: 'hello' }], {}))
      .toEqual({ lastUserMessage: '' })
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
