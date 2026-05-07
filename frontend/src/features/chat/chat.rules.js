// @ts-check

/**
 * @typedef {'warm' | 'strict' | 'haraguro' | (string & {})} ChatBaseline
 *
 * @typedef {Object} ChatSendState
 * @property {string | null | undefined} text
 * @property {boolean} isSending
 * @property {boolean} isHydrating
 *
 * @typedef {Object} ChatTextSource
 * @property {string | null | undefined} [presetText]
 * @property {string | null | undefined} [inputValue]
 *
 * @typedef {Object} ChatBusyState
 * @property {boolean} isSending
 * @property {boolean} isHydrating
 *
 * @typedef {Object} CockpitSignals
 * @property {boolean} [hasHydrated]
 *
 * @typedef {Object} ChatContextSnapshotOptions
 * @property {CockpitSignals | null | undefined} cockpitSignals
 * @property {unknown} currentContext
 * @property {() => unknown | Promise<unknown>} refreshCockpitContext
 *
 * @typedef {ChatContextSnapshotOptions & {
 *   onHydrationError?: (error: unknown) => void
 * }} ChatContextSendOptions
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeChatSendText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * @param {unknown} presetText
 * @returns {boolean}
 */
export function isPresetChatSend(presetText) {
  return typeof presetText === 'string'
}

/**
 * @param {ChatSendState} state
 * @returns {boolean}
 */
export function canSendChatMessage({ text, isSending, isHydrating }) {
  return Boolean(normalizeChatSendText(text)) && !isSending && !isHydrating
}

/**
 * @param {unknown} presetText
 * @returns {boolean}
 */
export function shouldClearChatDraft(presetText) {
  return !isPresetChatSend(presetText)
}

/**
 * @param {ChatTextSource} source
 * @returns {string}
 */
export function getChatSendText({ presetText, inputValue }) {
  return normalizeChatSendText(isPresetChatSend(presetText) ? presetText : inputValue)
}

/**
 * @param {ChatBusyState} state
 * @returns {boolean}
 */
export function isChatInputDisabled({ isSending, isHydrating }) {
  return Boolean(isSending || isHydrating)
}

/**
 * @param {ChatBusyState} state
 * @returns {string}
 */
export function getChatSendButtonLabel({ isSending, isHydrating }) {
  if (isHydrating) {
    return '准备中'
  }

  return isSending ? 'Thinking' : 'Send'
}

/**
 * @param {ChatBaseline} baseline
 * @returns {string}
 */
export function getChatFallbackReply(baseline) {
  const fallbacks = {
    warm: '我刚刚有点走神了，我们再试一次。',
    strict: '连接中断。请重试，或检查网络状态。',
    haraguro: '……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。'
  }

  return fallbacks[baseline] || fallbacks.warm
}

/**
 * @param {ChatContextSnapshotOptions} options
 * @returns {Promise<unknown>}
 */
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

/**
 * @param {ChatContextSendOptions} options
 * @returns {Promise<unknown>}
 */
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
