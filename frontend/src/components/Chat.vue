<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import avatarUrl from '../assets/avatar/sayachan-avatar.jpg'
import { useChatFeature } from '../features/chat/useChatFeature.js'
import { renderMarkdown } from '../utils/markdown.js'
import { t } from '../i18n/productLocale'

type PersonalityBaselineOption = 'warm' | 'strict' | 'haraguro'
type ConvergenceModeOption = 'explore' | 'guided' | 'decisive'

const messageListRef = ref<HTMLElement | null>(null)
const personalityBaselineOptions: PersonalityBaselineOption[] = ['warm', 'strict', 'haraguro']
const convergenceModeOptions: ConvergenceModeOption[] = ['explore', 'guided', 'decisive']

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
  isHydrating,
  isStreamingReply,
  chatInputDisabled,
  chatSendButtonLabel,
  openPopup,
  closePopup,
  togglePanel,
  handleSend,
  handleKeydown
} = useChatFeature({
  scrollToBottom,
  onHydrationError: error => console.error('Failed to hydrate context:', error),
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

function sendCurrentMessage(): Promise<void> {
  return handleSend()
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
            <div
              v-if="msg.role === 'assistant'"
              class="chat-bubble markdown-body"
              v-html="renderMarkdown(msg.content)"
            ></div>
            <div v-else class="chat-bubble">{{ msg.content }}</div>
          </div>
          <div v-if="isHydrating" class="chat-message assistant">
            <div class="chat-bubble chat-bubble--thinking">{{ t('chat.syncingContext') }}</div>
          </div>
          <div v-if="chatStore.isSending && !isStreamingReply" class="chat-message assistant">
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
              <div class="runtime-future-item disabled">
                <span>{{ t('chat.debugContext') }}</span>
                <span class="runtime-badge">{{ t('common.comingSoon') }}</span>
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
