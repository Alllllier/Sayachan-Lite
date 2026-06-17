import { apiFetch, API_BASE } from '../../services/apiClient'
import { assertApiResponse } from '../../services/apiResponse'
import {
  chatResponseSchema,
  chatSessionResponseSchema,
  sayaDeskSayachanResponseSchema,
  sayaDeskSayachanStreamEventSchema
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
  ChatSourceReceiptDto,
  SayaDeskSayachanCandidateProposalDto,
  SayaDeskSayachanDebugTraceDto,
  SayaDeskSayachanFocusDto,
  SayaDeskSayachanResponseDto,
  SayaDeskSayachanStreamEventDto,
  SayaDeskSayachanTurnActivityItemDto,
  SayaDeskSayachanSurface
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

type StreamSayachanHandlers = {
  onDelta?: (delta: string, event: Extract<SayaDeskSayachanStreamEventDto, { type: 'assistant_delta' }>) => void
  onActivity?: (item: SayaDeskSayachanTurnActivityItemDto, event: SayaDeskSayachanStreamEventDto) => void
  onCompleted?: (reply: string, event: Extract<SayaDeskSayachanStreamEventDto, { type: 'completed' }>) => void
}

type SendSayachanInput = {
  text: string
  focus?: Pick<SayaDeskSayachanFocusDto, 'type' | 'id'> | null
  surface?: SayaDeskSayachanSurface
  conversationId?: string
  debug?: boolean
}

export type SayachanTurnActivity = NonNullable<SayaDeskSayachanResponseDto['turnActivity']>
export type SayachanCandidateProposal = SayaDeskSayachanCandidateProposalDto
export type SayachanChatResponse = ChatResponseDto & {
  turnActivity?: SayachanTurnActivity
  candidateProposals?: SayachanCandidateProposal[]
  sayachanDebugTrace?: SayaDeskSayachanDebugTraceDto
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

function surfaceForSayachanFocus(
  focus?: Pick<SayaDeskSayachanFocusDto, 'type' | 'id'> | null
): SayaDeskSayachanSurface {
  if (focus?.type === 'note') return 'note-detail'
  if (focus?.type === 'project') return 'project-detail'
  if (focus?.type === 'task') return 'task-detail'
  return 'workspace-chat'
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

export async function sendSayachan(input: SendSayachanInput): Promise<SayachanChatResponse> {
  const focus = input.focus
    ? { type: input.focus.type, id: input.focus.id }
    : null
  const res = await apiFetch(`${API_BASE}/sayachan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: input.text,
      surface: input.surface || surfaceForSayachanFocus(focus),
      focus,
      ...(input.conversationId ? { conversationId: input.conversationId } : {}),
      ...(typeof input.debug === 'boolean' ? { options: { debug: input.debug } } : {})
    })
  })

  if (!res.ok) {
    throw new Error(`Sayachan request failed: ${res.status}`)
  }

  try {
    const data = assertApiResponse(await res.json() as unknown, sayaDeskSayachanResponseSchema, 'sayachan')
    return {
      reply: data.reply,
      ...(data.turnActivity ? { turnActivity: data.turnActivity } : {}),
      ...(data.candidateProposals?.length ? { candidateProposals: data.candidateProposals } : {}),
      ...(data.debugTrace ? { sayachanDebugTrace: data.debugTrace } : {})
    }
  } catch {
    throw new Error('Empty or invalid reply from Sayachan')
  }
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

function parseSsePayload(block: string): unknown | null {
  const dataLines = block
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.slice('data: '.length))

  if (dataLines.length === 0) {
    return null
  }

  return JSON.parse(dataLines.join('\n')) as unknown
}

function parseSseBlock(block: string): ChatStreamEvent | null {
  return parseSsePayload(block) as ChatStreamEvent | null
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

export async function streamSayachan(
  input: SendSayachanInput,
  handlers: StreamSayachanHandlers = {}
): Promise<SayachanChatResponse> {
  const focus = input.focus
    ? { type: input.focus.type, id: input.focus.id }
    : null
  const res = await apiFetch(`${API_BASE}/sayachan/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: input.text,
      surface: input.surface || surfaceForSayachanFocus(focus),
      focus,
      ...(input.conversationId ? { conversationId: input.conversationId } : {}),
      ...(typeof input.debug === 'boolean' ? { options: { debug: input.debug } } : {})
    })
  })

  if (!res.ok) {
    throw new Error(`Sayachan stream request failed: ${res.status}`)
  }

  if (!res.body) {
    throw new Error('Sayachan stream response did not include a readable body')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const payload = parseSsePayload(block.trim())
      if (!payload) continue
      const event = assertApiResponse(payload, sayaDeskSayachanStreamEventSchema, 'sayachan stream')

      if (event.type === 'assistant_progress' || event.type === 'tool_status' || event.type === 'capability_notice') {
        handlers.onActivity?.(event.item, event)
        continue
      }

      if (event.type === 'assistant_delta') {
        handlers.onDelta?.(event.delta, event)
        continue
      }

      if (event.type === 'completed') {
        handlers.onCompleted?.(event.reply, event)
        return {
          reply: event.reply,
          ...(event.turnActivity ? { turnActivity: event.turnActivity } : {}),
          ...(event.candidateProposals?.length ? { candidateProposals: event.candidateProposals } : {}),
          ...(event.debugTrace ? { sayachanDebugTrace: event.debugTrace } : {})
        }
      }

      if (event.type === 'error') {
        throw new Error(event.error?.message || 'Sayachan stream failed')
      }
    }

    if (done) {
      break
    }
  }

  throw new Error('Sayachan stream ended before completion')
}
