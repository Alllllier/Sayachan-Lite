import { describe, expect, it, vi } from 'vitest'
import {
  canSendChatMessage,
  getChatFallbackReply,
  getChatSendButtonLabel,
  getChatSendText,
  isChatInputDisabled,
  normalizeChatSendText,
  resolveChatContextForSend,
  resolveChatContextSnapshot,
  shouldClearChatDraft
} from './chat.rules.js'

describe('chat rules locks', () => {
  it('normalizes typed and preset send text before submission', () => {
    expect(normalizeChatSendText('  hello  ')).toBe('hello')
    expect(normalizeChatSendText('   ')).toBe('')
    expect(normalizeChatSendText(null)).toBe('')
    expect(getChatSendText({ presetText: '  preset  ', inputValue: 'typed' })).toBe('preset')
    expect(getChatSendText({ presetText: undefined, inputValue: '  typed  ' })).toBe('typed')
  })

  it('blocks empty sends and concurrent sending or hydration states', () => {
    expect(canSendChatMessage({ text: 'hello', isSending: false, isHydrating: false })).toBe(true)
    expect(canSendChatMessage({ text: '   ', isSending: false, isHydrating: false })).toBe(false)
    expect(canSendChatMessage({ text: 'hello', isSending: true, isHydrating: false })).toBe(false)
    expect(canSendChatMessage({ text: 'hello', isSending: false, isHydrating: true })).toBe(false)
  })

  it('clears typed drafts only for typed sends, not preset chip sends', () => {
    expect(shouldClearChatDraft(undefined)).toBe(true)
    expect(shouldClearChatDraft('帮我聚焦')).toBe(false)
  })

  it('derives disabled state and send button label from hydration and sending state', () => {
    expect(isChatInputDisabled({ isSending: false, isHydrating: false })).toBe(false)
    expect(isChatInputDisabled({ isSending: true, isHydrating: false })).toBe(true)
    expect(isChatInputDisabled({ isSending: false, isHydrating: true })).toBe(true)

    expect(getChatSendButtonLabel({ isSending: false, isHydrating: false })).toBe('Send')
    expect(getChatSendButtonLabel({ isSending: true, isHydrating: false })).toBe('Thinking')
    expect(getChatSendButtonLabel({ isSending: true, isHydrating: true })).toBe('准备中')
  })

  it('reuses hydrated cockpit signals without refreshing cockpit context', async () => {
    const refreshCockpitContext = vi.fn()
    const currentContext = { activeTasksCount: 3 }

    await expect(resolveChatContextSnapshot({
      cockpitSignals: { hasHydrated: true },
      currentContext,
      refreshCockpitContext
    })).resolves.toEqual(currentContext)

    expect(refreshCockpitContext).not.toHaveBeenCalled()
  })

  it('hydrates cockpit context before sending when cockpit signals are cold', async () => {
    const refreshCockpitContext = vi.fn().mockResolvedValue({ activeTasksCount: 2 })

    await expect(resolveChatContextSnapshot({
      cockpitSignals: { hasHydrated: false },
      currentContext: { activeTasksCount: 99 },
      refreshCockpitContext
    })).resolves.toEqual({ activeTasksCount: 2 })

    expect(refreshCockpitContext).toHaveBeenCalledTimes(1)
  })

  it('falls back to current context when cold dashboard hydration fails', async () => {
    const error = new Error('offline')
    const onHydrationError = vi.fn()
    const refreshCockpitContext = vi.fn().mockRejectedValue(error)
    const currentContext = { activeTasksCount: 99 }

    await expect(resolveChatContextForSend({
      cockpitSignals: { hasHydrated: false },
      currentContext,
      refreshCockpitContext,
      onHydrationError
    })).resolves.toEqual(currentContext)

    expect(refreshCockpitContext).toHaveBeenCalledTimes(1)
    expect(onHydrationError).toHaveBeenCalledWith(error)
  })

  it('derives local fallback replies from the runtime personality baseline', () => {
    expect(getChatFallbackReply('warm')).toBe('我刚刚有点走神了，我们再试一次。')
    expect(getChatFallbackReply('strict')).toBe('连接中断。请重试，或检查网络状态。')
    expect(getChatFallbackReply('haraguro')).toBe('……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。')
    expect(getChatFallbackReply('unknown')).toBe(getChatFallbackReply('warm'))
  })
})
