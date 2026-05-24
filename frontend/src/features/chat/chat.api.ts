import { apiFetch, API_BASE } from '../../services/apiClient'
import { assertApiResponse } from '../../services/apiResponse'
import {
  chatResponseSchema,
  chatSessionResponseSchema
} from '@sayachan/contracts'
import type {
  ChatContextDto,
  ChatDebugTraceDto,
  ChatMemoryCandidateDto,
  ChatMessageDto,
  ChatResponseDto,
  ChatResponseStrategyDto,
  ChatRuntimeControlsDto,
  ChatRuntimePayloadDto,
  ChatSessionResponseDto,
  ChatSourceReceiptDto
} from '@sayachan/contracts'

type ChatStreamEventType = 'tool_call_started' | 'tool_call_completed' | 'tool_call_failed' | 'text_delta' | 'completed' | 'error'

export type ChatStreamEvent = {
  packetType?: 'chat_stream_event'
  version?: number
  type: ChatStreamEventType
  delta?: string
  text?: string
  toolName?: string
  displayName?: string
  callId?: string
  status?: string
  round?: number
  output?: ChatResponseDto
  providerState?: ChatProviderState
  sourceReceipts?: ChatSourceReceiptDto[]
  debugTrace?: ChatDebugTraceDto
  memoryCandidate?: ChatMemoryCandidateDto
  responseStrategy?: ChatResponseStrategyDto
  finishReason?: string
  incomplete?: boolean
  incompleteReason?: string
  error?: {
    code?: string
    message?: string
    provider?: string
    status?: number
  }
}

export type ChatProviderState = NonNullable<ChatRuntimeControlsDto['providerState']>

type StreamChatHandlers = {
  onDelta?: (delta: string, event: ChatStreamEvent) => void
  onCompleted?: (reply: string, event: ChatStreamEvent) => void
  onToolStatus?: (event: ChatStreamEvent) => void
}

function publicChatResponse(data: ChatResponseDto): ChatResponseDto {
  const response: ChatResponseDto = { reply: data.reply }
  if (data.providerState) {
    response.providerState = data.providerState
  }
  if (data.sourceReceipts && data.sourceReceipts.length > 0) {
    response.sourceReceipts = data.sourceReceipts
  }
  if (data.debugTrace) {
    response.debugTrace = data.debugTrace
  }
  if (data.memoryCandidate) {
    response.memoryCandidate = data.memoryCandidate
  }
  if (data.responseStrategy) {
    response.responseStrategy = data.responseStrategy
  }
  return response
}

export function buildChatRuntimePayload(
  messages: ChatMessageDto[],
  runtimeControls: ChatRuntimeControlsDto = {}
): ChatRuntimePayloadDto {
  const lastUserMessage = messages.filter(message => message.role === 'user').pop()?.content || ''

  return {
    ...runtimeControls,
    lastUserMessage
  }
}

export async function sendChat(
  messages: ChatMessageDto[],
  context: ChatContextDto,
  runtimeControls: ChatRuntimeControlsDto = {}
): Promise<ChatResponseDto> {
  const res = await apiFetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      context,
      runtimeControls: buildChatRuntimePayload(messages, runtimeControls)
    })
  })

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`)
  }

  let data: ChatResponseDto
  try {
    data = assertApiResponse(await res.json() as unknown, chatResponseSchema, 'chat')
  } catch {
    throw new Error('Empty or invalid reply from server')
  }
  return publicChatResponse(data)
}

export async function loadChatSession(): Promise<ChatSessionResponseDto> {
  const res = await apiFetch(`${API_BASE}/ai/chat/session`, {
    method: 'GET'
  })

  if (!res.ok) {
    throw new Error(`Chat session request failed: ${res.status}`)
  }

  return assertApiResponse(await res.json() as unknown, chatSessionResponseSchema, 'chat session')
}

export async function startNewChatSession(): Promise<ChatSessionResponseDto> {
  const res = await apiFetch(`${API_BASE}/ai/chat/session`, {
    method: 'DELETE'
  })

  if (!res.ok) {
    throw new Error(`New chat session request failed: ${res.status}`)
  }

  return assertApiResponse(await res.json() as unknown, chatSessionResponseSchema, 'new chat session')
}

function parseSseBlock(block: string): ChatStreamEvent | null {
  const dataLines = block
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.slice('data: '.length))

  if (dataLines.length === 0) {
    return null
  }

  return JSON.parse(dataLines.join('\n')) as ChatStreamEvent
}

export async function streamChat(
  messages: ChatMessageDto[],
  context: ChatContextDto,
  runtimeControls: ChatRuntimeControlsDto = {},
  handlers: StreamChatHandlers = {}
): Promise<ChatResponseDto> {
  const res = await apiFetch(`${API_BASE}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      context,
      runtimeControls: buildChatRuntimePayload(messages, runtimeControls)
    })
  })

  if (!res.ok) {
    throw new Error(`Chat stream request failed: ${res.status}`)
  }

  if (!res.body) {
    throw new Error('Chat stream response did not include a readable body')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completedReply = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const event = parseSseBlock(block.trim())
      if (!event) continue

      if (event.type === 'text_delta' && typeof event.delta === 'string') {
        completedReply += event.delta
        handlers.onDelta?.(event.delta, event)
        continue
      }

      if (event.type === 'tool_call_started' || event.type === 'tool_call_completed' || event.type === 'tool_call_failed') {
        handlers.onToolStatus?.(event)
        continue
      }

      if (event.type === 'completed') {
        const reply = event.output?.reply || event.text || completedReply
        const data = assertApiResponse({
          reply,
          providerState: event.providerState,
          sourceReceipts: event.output?.sourceReceipts || event.sourceReceipts,
          debugTrace: event.output?.debugTrace || event.debugTrace,
          memoryCandidate: event.output?.memoryCandidate || event.memoryCandidate,
          responseStrategy: event.output?.responseStrategy || event.responseStrategy
        }, chatResponseSchema, 'chat stream')
        const completedEvent = {
          ...event,
          output: data,
          sourceReceipts: data.sourceReceipts,
          debugTrace: data.debugTrace,
          memoryCandidate: data.memoryCandidate,
          responseStrategy: data.responseStrategy
        }
        handlers.onCompleted?.(data.reply, completedEvent)
        return publicChatResponse(data)
      }

      if (event.type === 'error') {
        throw new Error(event.error?.message || 'Chat stream failed')
      }
    }

    if (done) {
      break
    }
  }

  throw new Error('Chat stream ended before completion')
}
