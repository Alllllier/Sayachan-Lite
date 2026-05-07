import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildChatRuntimePayload, sendChat } from './chat.api.js'

function mockedFetch() {
  return vi.mocked(fetch)
}

describe('chat api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends chat messages with context, runtime controls, last user message, and future slots', async () => {
    mockedFetch().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: 'Ready.' })
    } as unknown as Response)

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
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    })
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
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
    mockedFetch().mockResolvedValue({
      ok: false,
      status: 503
    } as unknown as Response)

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Chat request failed: 503')
  })

  it('throws when the chat endpoint reply is empty or invalid', async () => {
    mockedFetch().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: '' })
    } as unknown as Response)

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')

    mockedFetch().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ reply: null })
    } as unknown as Response)

    await expect(sendChat([{ role: 'user', content: 'hello' }], {}, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')
  })
})
