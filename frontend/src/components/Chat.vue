<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import type { ChatDebugTraceDto } from '@sayachan/contracts'
import avatarUrl from '../assets/avatar/sayachan-avatar.jpg'
import { useChatFeature } from '../features/chat/useChatFeature.js'
import { useAuthStore } from '../stores/auth'
import { renderMarkdown } from '../utils/markdown.js'
import { t } from '../i18n/productLocale'

type PersonalityBaselineOption = 'warm' | 'strict' | 'haraguro'
type ConvergenceModeOption = 'explore' | 'guided' | 'decisive'
type DebugTraceTools = NonNullable<ChatDebugTraceDto['tools']>
type DebugModeDecision = NonNullable<ChatDebugTraceDto['mode']>
type DebugFocusTrace = NonNullable<ChatDebugTraceDto['focus']>
type DebugProviderUsageTrace = NonNullable<ChatDebugTraceDto['providerUsage']>

const messageListRef = ref<HTMLElement | null>(null)
const personalityBaselineOptions: PersonalityBaselineOption[] = ['warm', 'strict', 'haraguro']
const convergenceModeOptions: ConvergenceModeOption[] = ['explore', 'guided', 'decisive']
const emptyDebugTools: DebugTraceTools = {}
const auth = useAuthStore()

function scrollToBottom(): void {
  void nextTick(() => {
    const el = messageListRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

const {
  chatStore,
  runtimeControls,
  inputValue,
  isPanelOpen,
  isStreamingReply,
  toolStatusText,
  getMessageSourceReceipts,
  getMessageMemoryCandidate,
  getMessageFocusSnapshot,
  acceptMemoryCandidate,
  dismissMemoryCandidate,
  chatInputDisabled,
  chatSendButtonLabel,
  openPopup,
  closePopup,
  togglePanel,
  handleSend,
  handleKeydown
} = useChatFeature({
  scrollToBottom,
  onSendError: error => console.error('Failed to send chat:', error)
})

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

function updateWarmth(event: Event): void {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    runtimeControls.setWarmth(Number(target.value))
  }
}

const activeFocusLabel = computed(() => {
  const focus = chatStore.activeFocus
  if (!focus) return ''
  const typeLabel = focus.type === 'project' ? t('chat.focusProject') : t('chat.focusNote')
  return `${typeLabel} · ${focus.title}`
})

const canUseDebugTrace = computed(() => {
  const role = auth.currentUser?.role
  return role === 'owner' || role === 'tester'
})

const debugTraceTools = computed<DebugTraceTools>(() => runtimeControls.latestDebugTrace?.tools || emptyDebugTools)
const debugExposedTools = computed(() => debugTraceTools.value.exposed || [])
const debugRequestedTools = computed(() => debugTraceTools.value.requested || [])
const debugExecutedTools = computed(() => debugTraceTools.value.executed || [])
const debugSourceReceipts = computed(() => runtimeControls.latestDebugTrace?.sourceReceipts || [])
const debugToolLimits = computed(() => debugTraceTools.value.limits || {})
const debugModeDecision = computed<DebugModeDecision | null>(() => runtimeControls.latestDebugTrace?.mode || null)
const debugModeHistory = computed<DebugModeDecision[]>(() => runtimeControls.modeDecisionHistory || [])
const debugFocusTrace = computed<DebugFocusTrace | null>(() => runtimeControls.latestDebugTrace?.focus || null)
const debugProviderUsageTrace = computed<DebugProviderUsageTrace | null>(() => runtimeControls.latestDebugTrace?.providerUsage || null)

function sendCurrentMessage(): Promise<void> {
  return handleSend()
}

function sourceTypeLabel(type: string): string {
  if (type === 'project') return t('chat.sourceProject')
  if (type === 'note') return t('chat.sourceNote')
  if (type === 'task') return t('chat.sourceTask')
  return t('chat.sourceItem')
}

function memoryCandidateTypeLabel(type?: string): string {
  if (type === 'continuity_hint') return t('settings.memoryTypeContinuity')
  return t('settings.memoryTypePreference')
}

function memoryCandidateSaveLabel(index: number): string {
  const status = getMessageMemoryCandidate(index)?.status
  if (status === 'saving') return t('common.saving')
  if (status === 'saved') return t('chat.memoryCandidateSaved')
  return t('chat.memoryCandidateSave')
}

function focusSnapshotLabel(index: number): string {
  const focus = getMessageFocusSnapshot(index)
  if (!focus) return ''
  const typeLabel = focus.type === 'project' ? t('chat.focusProject') : t('chat.focusNote')
  return `${typeLabel} · ${focus.title}`
}

function debugFocusTargetLabel(focus: DebugFocusTrace): string {
  if (!focus.consumed || !focus.type || !focus.title) return t('chat.debugFocusNone')
  const typeLabel = focus.type === 'project' ? t('chat.focusProject') : t('chat.focusNote')
  return `${typeLabel} · ${focus.title}`
}

function debugUsageStatusLabel(usage: DebugProviderUsageTrace): string {
  if (usage.status === 'mock') return t('chat.debugUsageMock')
  if (usage.status === 'available') return t('chat.debugUsageAvailable')
  return t('chat.debugUsageUnavailable')
}

function debugProviderLabel(usage: DebugProviderUsageTrace): string {
  return [usage.provider, usage.model].filter(Boolean).join(' · ') || t('chat.debugEmpty')
}

function debugTokenValue(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '-'
}

function debugUsageHasTokens(usage: DebugProviderUsageTrace): boolean {
  if (usage.status !== 'available') return false
  return [
    usage.inputTokens,
    usage.outputTokens,
    usage.totalTokens,
    usage.cachedInputTokens,
    usage.reasoningTokens
  ].some(value => typeof value === 'number' && Number.isFinite(value))
}
</script>

<template>
  <div class="chat">
    <!-- Floating Button -->
    <button
      v-if="!chatStore.isOpen"
      class="chat-float-btn"
      :style="{ backgroundImage: `url(${avatarUrl})` }"
      @click="openPopup"
      :aria-label="t('chat.open')"
      :title="t('chat.assistantName')"
    ></button>

    <!-- Popup Window -->
    <div v-show="chatStore.isOpen" class="chat-popup">
      <div class="chat-popup-inner">
        <!-- Header -->
        <div class="chat-header">
          <span class="chat-title">{{ t('chat.assistantName') }}</span>
          <div class="chat-header-actions">
            <button class="chat-gear-btn" @click="togglePanel" :aria-label="t('chat.runtimeControls')" :title="t('chat.runtimeControls')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button class="chat-close-btn" @click="closePopup" :aria-label="t('chat.close')">&times;</button>
          </div>
        </div>

        <!-- Body -->
        <div ref="messageListRef" class="chat-body">
          <div v-if="chatStore.messages.length === 0" class="chat-empty-invite">
            {{ t('chat.emptyInvite') }}
          </div>
          <div class="chat-chips">
            <button class="chip" :disabled="chatInputDisabled" @click="handleSend(t('chat.presetFocus'))">{{ t('chat.presetFocus') }}</button>
            <button class="chip" :disabled="chatInputDisabled" @click="handleSend(t('chat.presetNextStep'))">{{ t('chat.presetNextStep') }}</button>
            <button class="chip" :disabled="chatInputDisabled" @click="handleSend(t('chat.presetSummary'))">{{ t('chat.presetSummary') }}</button>
          </div>
          <div
            v-for="(msg, idx) in chatStore.messages"
            :key="idx"
            class="chat-message"
            :class="msg.role"
          >
            <div v-if="msg.role === 'assistant'" class="chat-assistant-stack">
              <div
                class="chat-bubble markdown-body"
                v-html="renderMarkdown(msg.content)"
              ></div>
              <div
                v-if="getMessageSourceReceipts(idx).length > 0"
                class="chat-source-receipts"
                :aria-label="t('chat.sourceReceipts')"
              >
                <span
                  v-for="receipt in getMessageSourceReceipts(idx)"
                  :key="`${receipt.type}:${receipt.title}`"
                  class="chat-source-receipt"
                >
                  <span class="chat-source-type">{{ sourceTypeLabel(receipt.type) }}</span>
                  <span class="chat-source-title">{{ receipt.title }}</span>
                </span>
              </div>
              <div
                v-if="getMessageMemoryCandidate(idx) && getMessageMemoryCandidate(idx)?.status !== 'dismissed'"
                class="chat-memory-candidate"
                :class="{ 'chat-memory-candidate--saved': getMessageMemoryCandidate(idx)?.status === 'saved', 'chat-memory-candidate--error': getMessageMemoryCandidate(idx)?.status === 'error' }"
              >
                <div class="chat-memory-candidate-header">
                  <span>{{ t('chat.memoryCandidateTitle') }}</span>
                  <span>{{ memoryCandidateTypeLabel(getMessageMemoryCandidate(idx)?.candidate.type) }}</span>
                </div>
                <div class="chat-memory-candidate-content">
                  {{ getMessageMemoryCandidate(idx)?.candidate.content }}
                </div>
                <div v-if="getMessageMemoryCandidate(idx)?.candidate.reason" class="chat-memory-candidate-reason">
                  {{ getMessageMemoryCandidate(idx)?.candidate.reason }}
                </div>
                <div class="chat-memory-candidate-actions">
                  <span v-if="getMessageMemoryCandidate(idx)?.status === 'error'" class="chat-memory-candidate-status">
                    {{ t('chat.memoryCandidateError') }}
                  </span>
                  <button
                    type="button"
                    class="chat-memory-action chat-memory-action--primary"
                    :disabled="getMessageMemoryCandidate(idx)?.status === 'saving' || getMessageMemoryCandidate(idx)?.status === 'saved'"
                    @click="acceptMemoryCandidate(idx)"
                  >
                    {{ memoryCandidateSaveLabel(idx) }}
                  </button>
                  <button
                    v-if="getMessageMemoryCandidate(idx)?.status !== 'saved'"
                    type="button"
                    class="chat-memory-action"
                    :disabled="getMessageMemoryCandidate(idx)?.status === 'saving'"
                    @click="dismissMemoryCandidate(idx)"
                  >
                    {{ t('chat.memoryCandidateDismiss') }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="chat-user-stack">
              <div v-if="focusSnapshotLabel(idx)" class="chat-focus-snapshot">
                {{ focusSnapshotLabel(idx) }}
              </div>
              <div class="chat-bubble">{{ msg.content }}</div>
            </div>
          </div>
          <div v-if="toolStatusText" class="chat-message assistant">
            <div class="chat-bubble chat-bubble--thinking">{{ toolStatusText }}</div>
          </div>
          <div v-if="chatStore.isSending && !isStreamingReply && !toolStatusText" class="chat-message assistant">
            <div class="chat-bubble chat-bubble--thinking">{{ runtimeControls.personalityConfig.toneLabel }} &middot; {{ t('chat.thinking') }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="chat-footer">
          <div v-if="chatStore.activeFocus" class="chat-focus-chip" role="status">
            <div class="chat-focus-copy">
              <span class="chat-focus-label">{{ t('chat.focusActive') }}</span>
              <span class="chat-focus-title">{{ activeFocusLabel }}</span>
            </div>
            <button
              type="button"
              class="chat-focus-clear"
              :aria-label="t('chat.clearFocus')"
              :title="t('chat.clearFocus')"
              @click="chatStore.clearFocus?.()"
            >
              &times;
            </button>
          </div>
          <div class="chat-input-row">
            <input
              v-model="inputValue"
              class="chat-input"
              :placeholder="t('chat.placeholder')"
              :disabled="chatInputDisabled"
              @keydown="handleKeydown"
            />
            <button class="btn btn-primary chat-send-btn" :disabled="chatInputDisabled" @click="sendCurrentMessage">
              {{ chatSendButtonLabel }}
            </button>
          </div>
        </div>
      </div>

      <!-- Runtime Controls Mini Panel -->
      <div class="runtime-panel" :class="{ open: isPanelOpen }">
        <div class="runtime-panel-header">
          <span class="runtime-panel-title">{{ t('chat.runtimeControls') }}</span>
          <button class="runtime-panel-close" @click="isPanelOpen = false" :aria-label="t('chat.closePanel')">&times;</button>
        </div>

        <div class="runtime-panel-body">
          <div class="runtime-section">
            <div class="runtime-toggle-row">
              <div>
                <div class="runtime-section-title runtime-section-title--inline">{{ t('chat.streamingMode') }}</div>
                <div class="runtime-toggle-caption">{{ t('chat.streamingModeCaption') }}</div>
              </div>
              <button
                class="runtime-toggle"
                :class="{ active: runtimeControls.chatStreamingEnabled }"
                type="button"
                role="switch"
                :aria-checked="runtimeControls.chatStreamingEnabled"
                @click="runtimeControls.setChatStreamingEnabled(!runtimeControls.chatStreamingEnabled)"
              >
                <span class="runtime-toggle-thumb"></span>
              </button>
            </div>
          </div>

          <div class="runtime-section">
            <div class="runtime-section-title">{{ t('chat.personalityBaseline') }}</div>
            <div class="runtime-radio-list">
              <label
                v-for="key in personalityBaselineOptions"
                :key="key"
                class="runtime-radio-card"
                :class="{ active: runtimeControls.personalityBaseline === key }"
              >
                <input
                  type="radio"
                  name="personalityBaseline"
                  :value="key"
                  :checked="runtimeControls.personalityBaseline === key"
                  @change="runtimeControls.setBaseline(key)"
                />
                <span class="runtime-radio-label">
                  {{ key === 'warm' ? t('chat.baselineWarm') : key === 'strict' ? t('chat.baselineStrict') : t('chat.baselineHaraguro') }}
                </span>
                <span v-if="runtimeControls.personalityBaseline === key" class="runtime-radio-check">&check;</span>
              </label>
            </div>
          </div>

          <div class="runtime-section">
            <div class="runtime-section-title">{{ t('chat.traitAdjustments') }}</div>

            <div class="runtime-trait">
              <div class="runtime-trait-header">
                <span class="runtime-trait-title">{{ t('stores.runtimeControls.warmthTitle') }}</span>
                <span class="runtime-trait-value">{{ runtimeControls.futureSlots.warmth }}</span>
              </div>
              <div class="runtime-slider-wrap">
                <input
                  type="range"
                  min="0"
                  max="10"
                  :value="runtimeControls.futureSlots.warmth"
                  class="runtime-slider"
                  @input="updateWarmth"
                />
                <div class="runtime-slider-anchors">
                  <span>{{ t('stores.runtimeControls.warmthLeft') }}</span>
                  <span>{{ t('stores.runtimeControls.warmthRight') }}</span>
                </div>
              </div>
            </div>

            <div class="runtime-trait">
              <div class="runtime-trait-header">
                <span class="runtime-trait-title">{{ t('stores.runtimeControls.convergenceTitle') }}</span>
              </div>
              <div class="runtime-segmented">
                <button
                  v-for="opt in convergenceModeOptions"
                  :key="opt"
                  class="runtime-segmented-btn"
                  :class="{ active: runtimeControls.futureSlots.convergenceMode === opt }"
                  @click="runtimeControls.setConvergenceMode(opt)"
                >
                  {{ t(`stores.runtimeControls.convergence.${opt}`) }}
                </button>
              </div>
            </div>
          </div>

          <div class="runtime-section">
            <div class="runtime-section-title">{{ t('chat.futureControls') }}</div>
            <div class="runtime-future-list">
              <div class="runtime-future-item disabled">
                <span>{{ t('chat.reflectionDepth') }}</span>
                <span class="runtime-badge">{{ t('common.comingSoon') }}</span>
              </div>
              <div class="runtime-future-item disabled">
                <span>{{ t('chat.thinkingControl') }}</span>
                <span class="runtime-badge">{{ t('common.comingSoon') }}</span>
              </div>
              <div v-if="!canUseDebugTrace" class="runtime-future-item disabled">
                <span>{{ t('chat.debugContext') }}</span>
                <span class="runtime-badge">{{ t('common.comingSoon') }}</span>
              </div>
            </div>
          </div>

          <div v-if="canUseDebugTrace" class="runtime-section">
            <div class="runtime-toggle-row">
              <div>
                <div class="runtime-section-title runtime-section-title--inline">{{ t('chat.debugTrace') }}</div>
                <div class="runtime-toggle-caption">{{ t('chat.debugTraceCaption') }}</div>
              </div>
              <button
                class="runtime-toggle"
                :class="{ active: runtimeControls.debugTraceEnabled }"
                type="button"
                role="switch"
                :aria-checked="runtimeControls.debugTraceEnabled"
                @click="runtimeControls.setDebugTraceEnabled(!runtimeControls.debugTraceEnabled)"
              >
                <span class="runtime-toggle-thumb"></span>
              </button>
            </div>

            <div v-if="runtimeControls.debugTraceEnabled" class="runtime-debug-console">
              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugMode') }}</div>
                <div v-if="!debugModeDecision && debugModeHistory.length === 0" class="runtime-debug-empty">{{ t('chat.debugNoTrace') }}</div>
                <template v-else>
                  <div v-if="debugModeDecision" class="runtime-debug-line">
                    <span>{{ t('chat.debugModeCurrent') }}</span>
                    <span>{{ debugModeDecision.selectedMode }} · {{ debugModeDecision.source }}</span>
                  </div>
                  <div v-if="debugModeDecision" class="runtime-debug-line">
                    <span>{{ t('chat.debugModeRequested') }}</span>
                    <span>{{ debugModeDecision.requestedMode }}<template v-if="debugModeDecision.fallbackApplied"> · {{ t('chat.debugModeFallback') }}</template></span>
                  </div>
                  <div v-if="debugModeDecision?.reasonCodes?.length" class="runtime-debug-line">
                    <span>{{ t('chat.debugModeReasons') }}</span>
                    <span>{{ debugModeDecision.reasonCodes.join(', ') }}</span>
                  </div>
                  <div v-if="debugModeHistory.length > 0" class="runtime-debug-meta">
                    <span>{{ t('chat.debugModeHistory') }}</span>
                    <span
                      v-for="(decision, index) in debugModeHistory"
                      :key="`mode-history-${index}`"
                    >
                      {{ decision.selectedMode }} · {{ decision.source }}<template v-if="decision.fallbackApplied"> · {{ t('chat.debugModeFallback') }}</template>
                    </span>
                  </div>
                </template>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugFocus') }}</div>
                <div v-if="!debugFocusTrace" class="runtime-debug-empty">{{ t('chat.debugNoTrace') }}</div>
                <template v-else>
                  <div class="runtime-debug-line">
                    <span>{{ t('chat.debugFocusStatus') }}</span>
                    <span>{{ debugFocusTrace.consumed ? t('chat.debugFocusConsumed') : t('chat.debugFocusNone') }}</span>
                  </div>
                  <div v-if="debugFocusTrace.consumed" class="runtime-debug-line">
                    <span>{{ t('chat.debugFocusTarget') }}</span>
                    <span>{{ debugFocusTargetLabel(debugFocusTrace) }}</span>
                  </div>
                </template>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugProviderUsage') }}</div>
                <div v-if="!debugProviderUsageTrace" class="runtime-debug-empty">{{ t('chat.debugNoTrace') }}</div>
                <template v-else>
                  <div class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageStatus') }}</span>
                    <span>{{ debugUsageStatusLabel(debugProviderUsageTrace) }}</span>
                  </div>
                  <div class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageProvider') }}</span>
                    <span>{{ debugProviderLabel(debugProviderUsageTrace) }}</span>
                  </div>
                  <div v-if="debugProviderUsageTrace.finishReason || debugProviderUsageTrace.incompleteReason" class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageFinish') }}</span>
                    <span>
                      {{ debugProviderUsageTrace.incomplete ? t('chat.debugUsageIncomplete') : (debugProviderUsageTrace.finishReason || t('chat.debugEmpty')) }}
                      <template v-if="debugProviderUsageTrace.incompleteReason"> · {{ debugProviderUsageTrace.incompleteReason }}</template>
                    </span>
                  </div>
                  <div v-if="debugUsageHasTokens(debugProviderUsageTrace)" class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageTokens') }}</span>
                    <span>{{ debugTokenValue(debugProviderUsageTrace.inputTokens) }} / {{ debugTokenValue(debugProviderUsageTrace.outputTokens) }} / {{ debugTokenValue(debugProviderUsageTrace.totalTokens) }}</span>
                  </div>
                  <div v-if="debugProviderUsageTrace.cachedInputTokens !== undefined" class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageCached') }}</span>
                    <span>{{ debugTokenValue(debugProviderUsageTrace.cachedInputTokens) }}</span>
                  </div>
                  <div v-if="debugProviderUsageTrace.reasoningTokens !== undefined" class="runtime-debug-line">
                    <span>{{ t('chat.debugUsageReasoning') }}</span>
                    <span>{{ debugTokenValue(debugProviderUsageTrace.reasoningTokens) }}</span>
                  </div>
                </template>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugTools') }}</div>
                <div class="runtime-debug-line">
                  <span>{{ t('chat.debugLimits') }}</span>
                  <span>{{ debugToolLimits.maxToolRounds ?? '-' }}r / {{ debugToolLimits.maxToolCallsPerTurn ?? '-' }}c</span>
                </div>
                <div class="runtime-debug-line">
                  <span>{{ t('chat.debugExposed') }}</span>
                  <span>{{ debugExposedTools.length > 0 ? debugExposedTools.join(', ') : t('chat.debugEmpty') }}</span>
                </div>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugRequested') }}</div>
                <div v-if="debugRequestedTools.length === 0" class="runtime-debug-empty">{{ t('chat.debugNoTrace') }}</div>
                <div v-for="(tool, index) in debugRequestedTools" :key="`requested-${index}`" class="runtime-debug-line">
                  <span>{{ tool.round ?? '-' }} · {{ tool.name }}</span>
                  <span>{{ tool.allowed ? t('chat.debugAllowed') : t('chat.debugBlocked') }}<template v-if="tool.cursorPresent"> · {{ t('chat.debugCursor') }}</template></span>
                </div>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.debugExecuted') }}</div>
                <div v-if="debugExecutedTools.length === 0" class="runtime-debug-empty">{{ t('chat.debugNoTrace') }}</div>
                <div v-for="(tool, index) in debugExecutedTools" :key="`executed-${index}`" class="runtime-debug-tool">
                  <div class="runtime-debug-line">
                    <span>{{ tool.round ?? '-' }} · {{ tool.name }}</span>
                    <span>{{ tool.status || t('chat.debugEmpty') }}</span>
                  </div>
                  <div class="runtime-debug-meta">
                    <span v-if="tool.returnedChars !== undefined">{{ t('chat.debugChars') }} {{ tool.returnedChars }} / {{ tool.contentChars ?? '-' }}</span>
                    <span v-if="tool.range">{{ t('chat.debugRange') }} {{ tool.range.startChar }}-{{ tool.range.endChar }}</span>
                    <span v-if="tool.hasMore">{{ t('chat.debugHasMore') }}</span>
                    <span v-if="tool.nextCursorPresent">{{ t('chat.debugCursor') }}</span>
                    <span v-if="tool.outputTruncated">{{ t('chat.debugClipped') }}</span>
                    <span v-if="tool.errorCode">{{ tool.errorCode }}</span>
                  </div>
                </div>
              </div>

              <div class="runtime-debug-block">
                <div class="runtime-debug-title">{{ t('chat.sourceReceipts') }}</div>
                <div v-if="debugSourceReceipts.length === 0" class="runtime-debug-empty">{{ t('chat.debugEmpty') }}</div>
                <div v-for="(source, index) in debugSourceReceipts" :key="`debug-source-${index}`" class="runtime-debug-line">
                  <span>{{ sourceTypeLabel(source.type) }}</span>
                  <span>{{ source.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat {
  position: fixed;
  right: var(--space-lg);
  bottom: calc(60px + var(--space-lg));
  z-index: 200;
}

/* Floating Button */
.chat-float-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background-color: var(--surface-panel);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chat-float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Popup Window */
.chat-popup {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 360px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
}

.chat-popup-inner {
  background: var(--surface-card);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 520px;
  position: relative;
  z-index: 1;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid #eeeeee;
  background: #f9f9f9;
}

.chat-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.chat-gear-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.chat-gear-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.chat-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.chat-close-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* Body */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-height: 280px;
}

.chat-message {
  display: flex;
  width: 100%;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: var(--font-size-base);
  line-height: 1.5;
  word-break: break-word;
}

.chat-bubble--thinking {
  opacity: 0.7;
  font-style: italic;
}

.chat-assistant-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 80%;
  gap: 6px;
}

.chat-assistant-stack .chat-bubble {
  max-width: 100%;
}

.chat-user-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 80%;
  gap: 5px;
}

.chat-user-stack .chat-bubble {
  max-width: 100%;
}

.chat-focus-snapshot {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 3px 7px;
  border: 1px solid color-mix(in srgb, var(--action-primary) 22%, var(--border-default));
  border-radius: 8px;
  background: color-mix(in srgb, var(--action-primary) 6%, var(--surface-card));
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.3;
}

.chat-source-receipts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chat-source-receipt {
  display: inline-flex;
  align-items: center;
  max-width: 220px;
  padding: 3px 7px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  background: #ffffff;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.3;
}

.chat-source-type {
  flex: 0 0 auto;
  color: var(--text-secondary);
}

.chat-source-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-source-type::after {
  content: " · ";
}

.chat-memory-candidate {
  width: 100%;
  padding: 8px 9px;
  border: 1px solid color-mix(in srgb, var(--action-primary) 22%, var(--border-default));
  border-radius: 8px;
  background: color-mix(in srgb, var(--action-primary) 6%, var(--surface-card));
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.4;
}

.chat-memory-candidate--saved {
  border-color: color-mix(in srgb, var(--action-primary) 40%, var(--border-default));
}

.chat-memory-candidate--error {
  border-color: #e0a5a5;
  background: #fff8f8;
}

.chat-memory-candidate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.chat-memory-candidate-content {
  margin-top: 5px;
  word-break: break-word;
}

.chat-memory-candidate-reason {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 11px;
  word-break: break-word;
}

.chat-memory-candidate-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.chat-memory-candidate-status {
  margin-right: auto;
  color: var(--text-muted);
  font-size: 11px;
}

.chat-memory-action {
  border: 1px solid var(--border-default);
  border-radius: 7px;
  background: var(--surface-card);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 11px;
  line-height: 1.2;
  padding: 5px 8px;
}

.chat-memory-action:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.chat-memory-action--primary {
  border-color: color-mix(in srgb, var(--action-primary) 44%, var(--border-default));
  color: var(--action-primary);
}

.chat-memory-action:disabled {
  cursor: default;
  opacity: 0.7;
}

.chat-empty-invite {
  align-self: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  line-height: 1.4;
  padding: var(--space-sm) 0 2px;
}

.chat-message.user .chat-bubble {
  background: var(--action-primary);
  color: var(--text-inverse);
  border-bottom-right-radius: 4px;
}

.chat-message.assistant .chat-bubble {
  background: var(--surface-panel);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

/* Quick Chips */
.chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: 2px;
  margin-bottom: var(--space-sm);
}

.chip {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid #eeeeee;
  background: var(--surface-card);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.chip:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-accent);
  color: var(--text-primary);
}

.chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.chat-footer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg) var(--space-md);
  border-top: 1px solid #eeeeee;
  background: var(--surface-card);
}

.chat-focus-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--action-primary) 34%, var(--border-default));
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--action-primary) 8%, var(--surface-card));
}

.chat-focus-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.chat-focus-label {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  line-height: 1.2;
}

.chat-focus-title {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-focus-clear {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.chat-focus-clear:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.chat-input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  background: var(--surface-card);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.chat-send-btn {
  padding: 10px 16px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

/* Runtime Controls Mini Panel */
.runtime-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 240px;
  background: var(--surface-card);
  border-radius: 0 16px 16px 0;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s ease, opacity 0.2s ease;
  z-index: 2;
}

.runtime-panel.open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.runtime-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid #eeeeee;
  background: #f9f9f9;
  border-radius: 0 16px 0 0;
}

.runtime-panel-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.runtime-panel-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.runtime-panel-close:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.runtime-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.runtime-section-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: var(--space-sm);
}

.runtime-section-title--inline {
  margin-bottom: 2px;
}

.runtime-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.runtime-toggle-caption {
  font-size: var(--font-size-xs);
  line-height: 1.35;
  color: var(--text-muted);
}

.runtime-toggle {
  flex: 0 0 auto;
  width: 42px;
  height: 24px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--surface-panel);
  padding: 2px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.runtime-toggle.active {
  background: var(--action-primary);
  border-color: var(--action-primary);
}

.runtime-toggle-thumb {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease;
}

.runtime-toggle.active .runtime-toggle-thumb {
  transform: translateX(18px);
}

.runtime-radio-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.runtime-radio-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid #eeeeee;
  background: var(--surface-card);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.runtime-radio-card:hover {
  border-color: var(--border-accent);
  background: var(--surface-hover);
}

.runtime-radio-card.active {
  border-color: var(--action-primary);
  background: rgba(66, 184, 131, 0.08);
}

.runtime-radio-card input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.runtime-radio-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.runtime-radio-check {
  font-size: var(--font-size-sm);
  color: var(--action-primary);
  font-weight: 600;
}

.runtime-future-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.runtime-future-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px dashed #eeeeee;
  background: var(--surface-card);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.runtime-future-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.runtime-badge {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--surface-panel);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.runtime-debug-console {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: #f8faf8;
}

.runtime-debug-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-debug-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.runtime-debug-line,
.runtime-debug-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  line-height: 1.35;
  color: var(--text-muted);
}

.runtime-debug-line span:last-child {
  text-align: right;
  word-break: break-word;
}

.runtime-debug-tool {
  padding: 6px 0;
  border-top: 1px solid rgba(52, 42, 46, 0.08);
}

.runtime-debug-tool:first-of-type {
  border-top: 0;
}

.runtime-debug-meta {
  justify-content: flex-start;
}

.runtime-debug-meta span {
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background: var(--surface-card);
}

.runtime-debug-empty {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Trait Controls */
.runtime-trait {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.runtime-trait-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.runtime-trait-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.runtime-trait-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--action-primary);
  min-width: 20px;
  text-align: right;
}

.runtime-slider-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-slider {
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--surface-panel);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.runtime-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--action-primary);
  cursor: pointer;
  border: 2px solid var(--surface-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease;
}

.runtime-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.runtime-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--action-primary);
  cursor: pointer;
  border: 2px solid var(--surface-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease;
}

.runtime-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.runtime-slider-anchors {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.runtime-segmented {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--radius-md);
  background: var(--surface-panel);
}

.runtime-segmented-btn {
  flex: 1;
  padding: 6px 0;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.runtime-segmented-btn:hover:not(.active) {
  color: var(--text-primary);
}

.runtime-segmented-btn.active {
  background: var(--surface-card);
  color: var(--text-primary);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

/* Markdown inside chat bubble - tighten spacing for chat surface */
.chat-bubble.markdown-body h1,
.chat-bubble.markdown-body h2,
.chat-bubble.markdown-body h3,
.chat-bubble.markdown-body h4 {
  margin-top: 0.5em;
  margin-bottom: 0.35em;
  font-size: 1em;
}

.chat-bubble.markdown-body h1 {
  font-size: 1.15em;
}

.chat-bubble.markdown-body h2 {
  font-size: 1.08em;
}

.chat-bubble.markdown-body pre {
  margin: 0.5em 0;
  padding: 8px 10px;
  font-size: 0.85em;
}

.chat-bubble.markdown-body ul,
.chat-bubble.markdown-body ol {
  margin: 0.35em 0;
  padding-left: 1.25em;
}

.chat-bubble.markdown-body blockquote {
  margin: 0.35em 0;
}

.chat-bubble.markdown-body p {
  margin-bottom: 0.5em;
}

.chat-bubble.markdown-body p:last-child {
  margin-bottom: 0;
}

.chat-bubble.markdown-body table {
  margin: 0.5em 0;
  font-size: 0.9em;
}

/* Responsive safety */
@media (max-width: 420px) {
  .chat-popup {
    width: calc(100vw - 32px);
    right: 0;
  }

  .runtime-panel {
    width: calc(100% - 48px);
    border-radius: 0 16px 16px 0;
  }
}
</style>
