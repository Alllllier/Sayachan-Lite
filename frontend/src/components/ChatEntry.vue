<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCockpitSignals } from '../stores/cockpitSignals'
import avatarUrl from '../assets/avator/temp.jpg'
import { sendChat } from '../services/chatService'

const chatStore = useChatStore()
const cockpitSignals = useCockpitSignals()

const context = computed(() => ({
  activeProjectsCount: cockpitSignals.activeProjectsCount,
  activeTasksCount: cockpitSignals.activeTasksCount,
  pinnedProjectName: cockpitSignals.pinnedProjectName,
  currentNextAction: cockpitSignals.currentNextAction,
}))
const inputValue = ref('')
const messageListRef = ref(null)

function openPopup() {
  chatStore.openChat()
  scrollToBottom()
}

function closePopup() {
  chatStore.closeChat()
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
  if (!text || chatStore.isSending) return

  if (typeof presetText !== 'string') {
    inputValue.value = ''
  }
  chatStore.appendMessage({ role: 'user', content: text })

  chatStore.setSending(true)
  try {
    const { reply } = await sendChat(chatStore.messages, context.value)
    chatStore.appendMessage({ role: 'assistant', content: reply })
  } catch (e) {
    console.error('Failed to send chat:', e)
    chatStore.appendMessage({ role: 'assistant', content: '我刚刚有点走神了，我们再试一次。' })
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
          <button class="chat-close-btn" @click="closePopup" aria-label="Close chat">×</button>
        </div>

        <!-- Body -->
        <div ref="messageListRef" class="chat-body">
          <div class="chat-message assistant">
            <div class="chat-bubble">我在这。如果你愿意，我们可以先把今天最想推进的那件事理清楚。</div>
          </div>
          <div class="chat-chips">
            <button class="chip" :disabled="chatStore.isSending" @click="handleSend('帮我聚焦')">帮我聚焦</button>
            <button class="chip" :disabled="chatStore.isSending" @click="handleSend('拆下一步')">拆下一步</button>
            <button class="chip" :disabled="chatStore.isSending" @click="handleSend('今天总结')">今天总结</button>
          </div>
          <div
            v-for="(msg, idx) in chatStore.messages"
            :key="idx"
            class="chat-message"
            :class="msg.role"
          >
            <div class="chat-bubble">{{ msg.content }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="chat-footer">
          <input
            v-model="inputValue"
            class="chat-input"
            placeholder="说点什么…"
            :disabled="chatStore.isSending"
            @keydown="handleKeydown"
          />
          <button class="btn btn-primary chat-send-btn" :disabled="chatStore.isSending" @click="handleSend">
            {{ chatStore.isSending ? 'Thinking' : 'Send' }}
          </button>
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

/* Responsive safety */
@media (max-width: 420px) {
  .chat-popup {
    width: calc(100vw - 32px);
    right: 0;
  }
}
</style>
