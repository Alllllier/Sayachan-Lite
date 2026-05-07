// @ts-check
import { apiFetch, API_BASE } from '../../services/apiClient'

/**
 * @typedef {{ role: string, content?: string }} ChatMessage
 * @typedef {Record<string, unknown>} ChatContext
 * @typedef {Record<string, unknown>} ChatRuntimeControls
 * @typedef {{ reply?: unknown }} ChatResponseBody
 */

/**
 * @param {ChatMessage[]} messages
 * @param {ChatRuntimeControls} [runtimeControls]
 * @returns {ChatRuntimeControls & { lastUserMessage: string }}
 */
export function buildChatRuntimePayload(messages, runtimeControls = {}) {
  const lastUserMessage = messages.filter(message => message.role === 'user').pop()?.content || ''

  return {
    ...runtimeControls,
    lastUserMessage
  }
}

/**
 * @param {ChatMessage[]} messages
 * @param {ChatContext} context
 * @param {ChatRuntimeControls} [runtimeControls]
 * @returns {Promise<{ reply: string }>}
 */
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

  /** @type {ChatResponseBody} */
  const data = await res.json()
  if (!data.reply || typeof data.reply !== 'string') {
    throw new Error('Empty or invalid reply from server')
  }
  return { reply: data.reply }
}
