import { apiFetch, API_BASE } from '../../services/apiClient'

export function buildChatRuntimePayload(messages, runtimeControls = {}) {
  const lastUserMessage = messages.filter(message => message.role === 'user').pop()?.content || ''

  return {
    ...runtimeControls,
    lastUserMessage
  }
}

export async function sendChat(messages, context, runtimeControls = {}) {
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

  const data = await res.json()
  if (!data.reply || typeof data.reply !== 'string') {
    throw new Error('Empty or invalid reply from server')
  }
  return { reply: data.reply }
}
