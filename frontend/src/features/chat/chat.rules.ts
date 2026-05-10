import type { ChatContextDto } from '@sayachan/contracts'
import { t } from '../../i18n/productLocale'

type ChatBaseline = 'warm' | 'strict' | 'haraguro' | (string & {})

type ChatSendState = {
  text: string | null | undefined
  isSending: boolean
  isHydrating: boolean
}

type ChatTextSource = {
  presetText?: string | null
  inputValue?: string | null
}

type ChatBusyState = {
  isSending: boolean
  isHydrating: boolean
}

type CockpitSignals = {
  hasHydrated?: boolean
}

type ChatContextSnapshotOptions = {
  cockpitSignals: CockpitSignals | null | undefined
  currentContext: ChatContextDto
  refreshCockpitContext: () => ChatContextDto | Promise<ChatContextDto>
}

type ChatContextSendOptions = ChatContextSnapshotOptions & {
  onHydrationError?: (error: unknown) => void
}

export function normalizeChatSendText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function isPresetChatSend(presetText: unknown): boolean {
  return typeof presetText === 'string'
}

export function canSendChatMessage({ text, isSending, isHydrating }: ChatSendState): boolean {
  return Boolean(normalizeChatSendText(text)) && !isSending && !isHydrating
}

export function shouldClearChatDraft(presetText: unknown): boolean {
  return !isPresetChatSend(presetText)
}

export function getChatSendText({ presetText, inputValue }: ChatTextSource): string {
  return normalizeChatSendText(isPresetChatSend(presetText) ? presetText : inputValue)
}

export function isChatInputDisabled({ isSending, isHydrating }: ChatBusyState): boolean {
  return Boolean(isSending || isHydrating)
}

export function getChatSendButtonLabel({ isSending, isHydrating }: ChatBusyState): string {
  if (isHydrating) {
    return t('chat.preparing')
  }

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

export async function resolveChatContextSnapshot({
  cockpitSignals,
  currentContext,
  refreshCockpitContext
}: ChatContextSnapshotOptions): Promise<ChatContextDto> {
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
}: ChatContextSendOptions): Promise<ChatContextDto> {
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
