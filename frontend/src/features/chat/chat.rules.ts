import { t } from '../../i18n/productLocale'

type ChatBaseline = 'warm' | 'strict' | 'haraguro' | (string & {})

type ChatSendState = {
  text: string | null | undefined
  isSending: boolean
}

type ChatTextSource = {
  overrideText?: string | null
  inputValue?: string | null
}

type ChatBusyState = {
  isSending: boolean
}

export function normalizeChatSendText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function isOverrideChatSend(overrideText: unknown): boolean {
  return typeof overrideText === 'string'
}

export function canSendChatMessage({ text, isSending }: ChatSendState): boolean {
  return Boolean(normalizeChatSendText(text)) && !isSending
}

export function shouldClearChatDraft(overrideText: unknown): boolean {
  return !isOverrideChatSend(overrideText)
}

export function getChatSendText({ overrideText, inputValue }: ChatTextSource): string {
  return normalizeChatSendText(isOverrideChatSend(overrideText) ? overrideText : inputValue)
}

export function isChatInputDisabled({ isSending }: ChatBusyState): boolean {
  return Boolean(isSending)
}

export function getChatSendButtonLabel({ isSending }: ChatBusyState): string {
  return isSending ? t('chat.thinking') : t('chat.send')
}

export function getChatFallbackReply(baseline: ChatBaseline): string {
  const fallbacks: Record<string, string> = {
    warm: '我刚刚有点走神了，我们再试一次。',
    strict: '连接中断。请重试，或检查网络状态。',
    haraguro: '……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。'
  }

  return fallbacks[baseline] || fallbacks.warm
}
