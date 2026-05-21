import { describe, expect, it } from 'vitest'
import {
  canSendChatMessage,
  getChatFallbackReply,
  getChatSendButtonLabel,
  getChatSendText,
  isChatInputDisabled,
  normalizeChatSendText,
  shouldClearChatDraft
} from './chat.rules'

describe('chat rules locks', () => {
  it('normalizes typed and preset send text before submission', () => {
    expect(normalizeChatSendText('  hello  ')).toBe('hello')
    expect(normalizeChatSendText('   ')).toBe('')
    expect(normalizeChatSendText(null)).toBe('')
    expect(getChatSendText({ presetText: '  preset  ', inputValue: 'typed' })).toBe('preset')
    expect(getChatSendText({ presetText: undefined, inputValue: '  typed  ' })).toBe('typed')
  })

  it('blocks empty sends and concurrent sending states', () => {
    expect(canSendChatMessage({ text: 'hello', isSending: false })).toBe(true)
    expect(canSendChatMessage({ text: '   ', isSending: false })).toBe(false)
    expect(canSendChatMessage({ text: 'hello', isSending: true })).toBe(false)
  })

  it('clears typed drafts only for typed sends, not preset chip sends', () => {
    expect(shouldClearChatDraft(undefined)).toBe(true)
    expect(shouldClearChatDraft('帮我聚焦')).toBe(false)
  })

  it('derives disabled state and send button label from sending state', () => {
    expect(isChatInputDisabled({ isSending: false })).toBe(false)
    expect(isChatInputDisabled({ isSending: true })).toBe(true)

    expect(getChatSendButtonLabel({ isSending: false })).toBe('发送')
    expect(getChatSendButtonLabel({ isSending: true })).toBe('思考中')
  })

  it('derives local fallback replies from the runtime personality baseline', () => {
    expect(getChatFallbackReply('warm')).toBe('我刚刚有点走神了，我们再试一次。')
    expect(getChatFallbackReply('strict')).toBe('连接中断。请重试，或检查网络状态。')
    expect(getChatFallbackReply('haraguro')).toBe('……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。')
    expect(getChatFallbackReply('unknown')).toBe(getChatFallbackReply('warm'))
  })
})
