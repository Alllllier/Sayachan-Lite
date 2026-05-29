import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { ChatConvergenceMode, ChatDebugTraceDto, ChatPersonalityBaseline, SayaDeskSayachanDebugTraceDto } from '@sayachan/contracts'

type ChatDebugModeTrace = NonNullable<ChatDebugTraceDto['mode']>
export type ChatCoreVersion = 'v3' | 'v4'

const LS_CORE_VERSION_KEY = 'sayachan.chatCoreVersion'
const LS_BASELINE_KEY = 'sayachan.personalityBaseline'
const LS_WARMTH_KEY = 'sayachan.warmth'
const LS_CONVERGENCE_KEY = 'sayachan.convergenceMode'
const LS_STREAMING_KEY = 'sayachan.chatStreamingEnabled'
const LS_DEBUG_TRACE_KEY = 'sayachan.chatDebugTraceEnabled'
const MODE_DECISION_HISTORY_LIMIT = 6

export const useRuntimeControls = defineStore('runtimeControls', () => {
  const savedCoreVersion = localStorage.getItem(LS_CORE_VERSION_KEY)
  const initialCoreVersion: ChatCoreVersion = isCoreVersion(savedCoreVersion)
    ? savedCoreVersion
    : 'v3'
  const coreVersion = ref<ChatCoreVersion>(initialCoreVersion)

  const savedBaseline = localStorage.getItem(LS_BASELINE_KEY)
  const initialBaseline: ChatPersonalityBaseline = isPersonalityBaseline(savedBaseline)
    ? savedBaseline
    : 'warm'

  const personalityBaseline = ref(initialBaseline)
  const savedStreaming = localStorage.getItem(LS_STREAMING_KEY)
  const chatStreamingEnabled = ref(
    initialCoreVersion === 'v4'
      ? false
      : savedStreaming === null ? true : savedStreaming !== 'false'
  )
  const savedDebugTrace = localStorage.getItem(LS_DEBUG_TRACE_KEY)
  const debugTraceEnabled = ref(savedDebugTrace === null ? true : savedDebugTrace !== 'false')
  const latestDebugTrace = ref<ChatDebugTraceDto | null>(null)
  const latestSayachanDebugTrace = ref<SayaDeskSayachanDebugTraceDto | null>(null)
  const modeDecisionHistory = ref<ChatDebugModeTrace[]>([])

  const savedWarmth = localStorage.getItem(LS_WARMTH_KEY)
  const initialWarmth = savedWarmth !== null ? Number(savedWarmth) : 5

  const savedConvergence = localStorage.getItem(LS_CONVERGENCE_KEY)
  const initialConvergence: ChatConvergenceMode = isConvergenceMode(savedConvergence)
    ? savedConvergence
    : 'guided'

  const futureSlots = reactive({
    warmth: initialWarmth,
    reflectionDepth: null,
    convergenceMode: initialConvergence,
    thinking: null,
    debugContext: null
  })

  const uiLabels = {
    warmth: { title: '温度', left: '更利落', right: '更温柔' },
    convergence: {
      title: '收敛方式',
      options: {
        explore: '一起想',
        guided: '主推一步',
        decisive: '直接收束'
      }
    }
  }

  const personalityConfig = computed(() => {
    const configs = {
      warm: {
        label: '温暖',
        toneLabel: '正在整理思绪中'
      },
      strict: {
        label: '干练',
        toneLabel: '推导最优解中'
      },
      haraguro: {
        label: '腹黑',
        toneLabel: '假装在思考中'
      }
    }
    return configs[personalityBaseline.value] || configs.warm
  })

  function isPersonalityBaseline(value: unknown): value is ChatPersonalityBaseline {
    return value === 'warm' || value === 'strict' || value === 'haraguro'
  }

  function isConvergenceMode(value: unknown): value is ChatConvergenceMode {
    return value === 'explore' || value === 'guided' || value === 'decisive'
  }

  function isCoreVersion(value: unknown): value is ChatCoreVersion {
    return value === 'v3' || value === 'v4'
  }

  function setCoreVersion(value: unknown): void {
    if (!isCoreVersion(value)) {
      return
    }

    coreVersion.value = value
    localStorage.setItem(LS_CORE_VERSION_KEY, value)
    clearLatestDebugTrace()
    if (value === 'v4') {
      setChatStreamingEnabled(false)
    }
  }

  function setBaseline(value: unknown): void {
    if (isPersonalityBaseline(value)) {
      personalityBaseline.value = value
      localStorage.setItem(LS_BASELINE_KEY, value)
    }
  }

  function setWarmth(value: unknown): void {
    const num = Number(value)
    if (Number.isFinite(num) && num >= 0 && num <= 10) {
      futureSlots.warmth = num
      localStorage.setItem(LS_WARMTH_KEY, String(num))
    }
  }

  function setConvergenceMode(value: unknown): void {
    if (isConvergenceMode(value)) {
      futureSlots.convergenceMode = value
      localStorage.setItem(LS_CONVERGENCE_KEY, value)
    }
  }

  function setChatStreamingEnabled(value: unknown): void {
    chatStreamingEnabled.value = coreVersion.value === 'v4' ? false : value === true
    localStorage.setItem(LS_STREAMING_KEY, String(chatStreamingEnabled.value))
  }

  function setDebugTraceEnabled(value: unknown): void {
    debugTraceEnabled.value = value === true
    localStorage.setItem(LS_DEBUG_TRACE_KEY, String(debugTraceEnabled.value))
  }

  function setLatestDebugTrace(value: ChatDebugTraceDto | null | undefined): void {
    latestDebugTrace.value = value || null
    if (value?.mode) {
      modeDecisionHistory.value = [
        value.mode,
        ...modeDecisionHistory.value
      ].slice(0, MODE_DECISION_HISTORY_LIMIT)
    }
  }

  function setLatestSayachanDebugTrace(value: SayaDeskSayachanDebugTraceDto | null | undefined): void {
    latestSayachanDebugTrace.value = value || null
  }

  function clearLatestDebugTrace(): void {
    latestDebugTrace.value = null
    latestSayachanDebugTrace.value = null
  }

  return {
    coreVersion,
    personalityBaseline,
    chatStreamingEnabled,
    debugTraceEnabled,
    latestDebugTrace,
    latestSayachanDebugTrace,
    modeDecisionHistory,
    futureSlots,
    personalityConfig,
    uiLabels,
    setCoreVersion,
    setBaseline,
    setWarmth,
    setConvergenceMode,
    setChatStreamingEnabled,
    setDebugTraceEnabled,
    setLatestDebugTrace,
    setLatestSayachanDebugTrace,
    clearLatestDebugTrace
  }
})
