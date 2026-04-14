const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

import { useRuntimeControls } from '../stores/runtimeControls'

export async function sendChat(messages, context, runtimeControls = {}) {
  const controls = useRuntimeControls()
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''

  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      context,
      runtimeControls: {
        ...runtimeControls,
        lastUserMessage,
        futureSlots: {
          warmth: controls.futureSlots.warmth,
          convergenceMode: controls.futureSlots.convergenceMode
        }
      }
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
