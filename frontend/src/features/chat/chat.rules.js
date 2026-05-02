export function normalizeChatSendText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isPresetChatSend(presetText) {
  return typeof presetText === 'string'
}

export function canSendChatMessage({ text, isSending, isHydrating }) {
  return Boolean(normalizeChatSendText(text)) && !isSending && !isHydrating
}

export function shouldClearChatDraft(presetText) {
  return !isPresetChatSend(presetText)
}

export function getChatSendText({ presetText, inputValue }) {
  return normalizeChatSendText(isPresetChatSend(presetText) ? presetText : inputValue)
}

export function isChatInputDisabled({ isSending, isHydrating }) {
  return Boolean(isSending || isHydrating)
}

export function getChatSendButtonLabel({ isSending, isHydrating }) {
  if (isHydrating) {
    return '准备中'
  }

  return isSending ? 'Thinking' : 'Send'
}

export function getChatFallbackReply(baseline) {
  const fallbacks = {
    warm: '我刚刚有点走神了，我们再试一次。',
    strict: '连接中断。请重试，或检查网络状态。',
    haraguro: '……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。'
  }

  return fallbacks[baseline] || fallbacks.warm
}

export async function resolveChatContextSnapshot({
  cockpitSignals,
  currentContext,
  refreshCockpitContext
}) {
  if (cockpitSignals?.hasHydrated) {
    return currentContext
  }

  return refreshCockpitContext()
}

export async function resolveChatContextForSend({
  cockpitSignals,
  currentContext,
  refreshCockpitContext,
  onHydrationError
}) {
  try {
    return await resolveChatContextSnapshot({
      cockpitSignals,
      currentContext,
      refreshCockpitContext
    })
  } catch (error) {
    onHydrationError?.(error)
    return currentContext
  }
}
