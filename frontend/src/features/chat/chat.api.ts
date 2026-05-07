import { apiFetch, API_BASE } from '../../services/apiClient'
import {
  assertApiResponse,
  chatResponseSchema
} from '../../types/api-contracts'
import type {
  ChatContextDto,
  ChatMessageDto,
  ChatResponseDto,
  ChatRuntimeControlsDto,
  ChatRuntimePayloadDto
} from '../../types/api-dtos'

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
  return { reply: data.reply }
}
