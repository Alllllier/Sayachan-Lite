import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildChatRuntimePayload, sendChat, streamChat } from './chat.api.js'
import type { ChatContextDto } from '@sayachan/contracts'

const emptyContext: ChatContextDto = {
  activeProjectsCount: 0,
  activeTasksCount: 0,
  pinnedProjectName: '',
  currentNextAction: ''
}

function mockedFetch() {
  return vi.mocked(fetch)
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function streamResponse(chunks: string[], ok = true, status = 200): Response {
  return new Response(new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    }
  }), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'text/event-stream' }
  })
}

describe('chat api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends chat messages with context, runtime controls, last user message, and future slots', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({ reply: 'Ready.' }))

    await expect(sendChat([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'latest' }
    ], {
      activeProjectsCount: 0,
      activeTasksCount: 3,
      pinnedProjectName: '',
      currentNextAction: ''
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
        activeProjectsCount: 0,
        activeTasksCount: 3,
        pinnedProjectName: '',
        currentNextAction: ''
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
    mockedFetch().mockResolvedValue(jsonResponse(null, false, 503))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Chat request failed: 503')
  })

  it('throws when the chat endpoint reply is empty or invalid', async () => {
    mockedFetch().mockResolvedValue(jsonResponse({ reply: '' }))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')

    mockedFetch().mockResolvedValue(jsonResponse({ reply: null }))

    await expect(sendChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Empty or invalid reply from server')
  })

  it('streams chat events from the streaming endpoint', async () => {
    const deltas: string[] = []
    mockedFetch().mockResolvedValue(streamResponse([
      'event: text_delta\ndata: {"type":"text_delta","delta":"Hel","text":"Hel"}\n\n',
      'event: text_delta\ndata: {"type":"text_delta","delta":"lo","text":"Hello"}\n\n',
      'event: completed\ndata: {"type":"completed","text":"Hello","output":{"reply":"Hello"}}\n\n'
    ]))

    await expect(streamChat(
      [{ role: 'user', content: 'latest' }],
      emptyContext,
      { personalityBaseline: 'warm' },
      {
        onDelta: delta => deltas.push(delta)
      }
    )).resolves.toEqual({ reply: 'Hello' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/ai/chat/stream', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: expect.any(String)
    })
    expect(deltas).toEqual(['Hel', 'lo'])
    expect(JSON.parse(String(mockedFetch().mock.calls[0][1]?.body))).toEqual({
      messages: [{ role: 'user', content: 'latest' }],
      context: emptyContext,
      runtimeControls: {
        personalityBaseline: 'warm',
        lastUserMessage: 'latest'
      }
    })
  })

  it('throws when the streaming endpoint emits an error or ends early', async () => {
    mockedFetch().mockResolvedValue(streamResponse([
      'event: error\ndata: {"type":"error","error":{"message":"stream failed"}}\n\n'
    ]))

    await expect(streamChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('stream failed')

    mockedFetch().mockResolvedValue(streamResponse([
      'event: text_delta\ndata: {"type":"text_delta","delta":"partial"}\n\n'
    ]))

    await expect(streamChat([{ role: 'user', content: 'hello' }], emptyContext, {}))
      .rejects
      .toThrow('Chat stream ended before completion')
  })
})
