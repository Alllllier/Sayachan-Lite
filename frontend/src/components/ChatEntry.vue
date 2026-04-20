<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCockpitSignals } from '../stores/cockpitSignals'
import { useRuntimeControls } from '../stores/runtimeControls'
import avatarUrl from '../assets/avator/temp.jpg'
import { sendChat } from '../services/chatService'
import { refreshDashboardContext } from '../services/dashboardContextService'
import { resolveChatContextSnapshot } from './chatEntry.behavior.js'
import { renderMarkdown } from '../utils/markdown.js'

const chatStore = useChatStore()
const cockpitSignals = useCockpitSignals()
const runtimeControls = useRuntimeControls()

const context = computed(() => ({
  activeProjectsCount: cockpitSignals.activeProjectsCount,
  activeTasksCount: cockpitSignals.activeTasksCount,
  pinnedProjectName: cockpitSignals.pinnedProjectName,
  currentNextAction: cockpitSignals.currentNextAction,
}))
const inputValue = ref('')
const messageListRef = ref(null)
const isPanelOpen = ref(false)
const isHydrating = ref(false)

function openPopup() {
  chatStore.openChat()
  scrollToBottom()
}

function closePopup() {
  chatStore.closeChat()
  isPanelOpen.value = false
}

function togglePanel() {
  isPanelOpen.value = !isPanelOpen.value
}

function scrollToBottom() {
  nextTick(() => {
    const el = messageListRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

async function handleSend(presetText) {
  const text = (typeof presetText === 'string' ? presetText : inputValue.value).trim()
  if (!text || chatStore.isSending || isHydrating.value) return

  if (typeof presetText !== 'string') {
    inputValue.value = ''
  }
  chatStore.appendMessage({ role: 'user', content: text })

  let chatContext = context.value
  if (!cockpitSignals.hasHydrated) {
    isHydrating.value = true
    try {
      chatContext = await resolveChatContextSnapshot({
        cockpitSignals,
        currentContext: context.value,
        refreshDashboardContext
      })
    } catch (e) {
      console.error('Failed to hydrate context:', e)
    } finally {
      isHydrating.value = false
    }
  }

  chatStore.setSending(true)
  try {
    const { reply } = await sendChat(chatStore.messages, chatContext, {
      personalityBaseline: runtimeControls.personalityBaseline
    })
    chatStore.appendMessage({ role: 'assistant', content: reply })
  } catch (e) {
    console.error('Failed to send chat:', e)
    chatStore.appendMessage({ role: 'assistant', content: mockFallbackReply() })
  } finally {
    chatStore.setSending(false)
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function mockFallbackReply() {
  const baseline = runtimeControls.personalityBaseline
  const fallbacks = {
    warm: '我刚刚有点走神了，我们再试一次。',
    strict: '连接中断。请重试，或检查网络状态。',
    haraguro: '……连接断了呢。不过就算没断，你刚才想说的那个借口，我也不打算听的。'
  }
  return fallbacks[baseline] || fallbacks.warm
}
</script>

<template>
  <div class="chat-entry">
    <!-- Floating Button -->
    <button
      v-if="!chatStore.isOpen"
      class="chat-float-btn"
      :style="{ backgroundImage: `url(${avatarUrl})` }"
      @click="openPopup"
      aria-label="Open chat"
      title="Sayachan"
    ></button>

    <!-- Popup Window -->
    <div v-show="chatStore.isOpen" class="chat-popup">
      <div class="chat-popup-inner">
        <!-- Header -->
        <div class="chat-header">
          <span class="chat-title">Sayachan</span>
          <div class="chat-header-actions">
            <button class="chat-gear-btn" @click="togglePanel" aria-label="Runtime controls" title="Runtime controls">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button class="chat-close-btn" @click="closePopup" aria-label="Close chat">&times;</button>
          </div>
        </div>

        <!-- Body -->
        <div ref="messageListRef" class="chat-body">
          <div class="chat-message assistant">
            <div class="chat-bubble">{{ runtimeControls.personalityConfig.welcome }}</div>
          </div>
          <div class="chat-chips">
            <button class="chip" :disabled="chatStore.isSending || isHydrating" @click="handleSend('帮我聚焦')">帮我聚焦</button>
            <button class="chip" :disabled="chatStore.isSending || isHydrating" @click="handleSend('拆下一步')">拆下一步</button>
            <button class="chip" :disabled="chatStore.isSending || isHydrating" @click="handleSend('今天总结')">今天总结</button>
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
            <div class="chat-bubble chat-bubble--thinking">正在同步当前工作上下文...</div>
          </div>
          <div v-if="chatStore.isSending" class="chat-message assistant">
            <div class="chat-bubble chat-bubble--thinking">{{ runtimeControls.personalityConfig.toneLabel }} &middot; Thinking</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="chat-footer">
          <input
            v-model="inputValue"
            class="chat-input"
            placeholder="说点什么&hellip;"
            :disabled="chatStore.isSending || isHydrating"
            @keydown="handleKeydown"
          />
          <button class="btn btn-primary chat-send-btn" :disabled="chatStore.isSending || isHydrating" @click="handleSend">
            {{ isHydrating ? '准备中' : chatStore.isSending ? 'Thinking' : 'Send' }}
          </button>
        </div>
      </div>

      <!-- Runtime Controls Mini Panel -->
      <div class="runtime-panel" :class="{ open: isPanelOpen }">
        <div class="runtime-panel-header">
          <span class="runtime-panel-title">Runtime Controls</span>
          <button class="runtime-panel-close" @click="isPanelOpen = false" aria-label="Close panel">&times;</button>
        </div>

        <div class="runtime-panel-body">
          <div class="runtime-section">
            <div class="runtime-section-title">人格基线</div>
            <div class="runtime-radio-list">
              <label
                v-for="key in ['warm', 'strict', 'haraguro']"
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
                  {{ key === 'warm' ? '温暖' : key === 'strict' ? '干练' : '腹黑' }}
                </span>
                <span v-if="runtimeControls.personalityBaseline === key" class="runtime-radio-check">&check;</span>
              </label>
            </div>
          </div>

          <div class="runtime-section">
            <div class="runtime-section-title">特质调整</div>

            <div class="runtime-trait">
              <div class="runtime-trait-header">
                <span class="runtime-trait-title">{{ runtimeControls.uiLabels.warmth.title }}</span>
                <span class="runtime-trait-value">{{ runtimeControls.futureSlots.warmth }}</span>
              </div>
              <div class="runtime-slider-wrap">
                <input
                  type="range"
                  min="0"
                  max="10"
                  :value="runtimeControls.futureSlots.warmth"
                  class="runtime-slider"
                  @input="e => runtimeControls.setWarmth(Number(e.target.value))"
                />
                <div class="runtime-slider-anchors">
                  <span>{{ runtimeControls.uiLabels.warmth.left }}</span>
                  <span>{{ runtimeControls.uiLabels.warmth.right }}</span>
                </div>
              </div>
            </div>

            <div class="runtime-trait">
              <div class="runtime-trait-header">
                <span class="runtime-trait-title">{{ runtimeControls.uiLabels.convergence.title }}</span>
              </div>
              <div class="runtime-segmented">
                <button
                  v-for="opt in ['explore', 'guided', 'decisive']"
                  :key="opt"
                  class="runtime-segmented-btn"
                  :class="{ active: runtimeControls.futureSlots.convergenceMode === opt }"
                  @click="runtimeControls.setConvergenceMode(opt)"
                >
                  {{ runtimeControls.uiLabels.convergence.options[opt] }}
                </button>
              </div>
            </div>
          </div>

          <div class="runtime-section">
            <div class="runtime-section-title">Future Controls</div>
            <div class="runtime-future-list">
              <div class="runtime-future-item disabled">
                <span>Reflection Depth</span>
                <span class="runtime-badge">coming soon</span>
              </div>
              <div class="runtime-future-item disabled">
                <span>Thinking</span>
                <span class="runtime-badge">coming soon</span>
              </div>
              <div class="runtime-future-item disabled">
                <span>Debug Context</span>
                <span class="runtime-badge">coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-entry {
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
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
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
  border: 1px solid var(--border-subtle);
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
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg) var(--space-md);
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-card);
}

.chat-input {
  flex: 1;
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
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
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
  border: 1px solid var(--border-subtle);
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
  border: 1px dashed var(--border-subtle);
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
