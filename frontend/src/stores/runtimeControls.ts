import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { ChatConvergenceMode, ChatPersonalityBaseline } from '@sayachan/contracts'

const LS_BASELINE_KEY = 'sayachan.personalityBaseline'
const LS_WARMTH_KEY = 'sayachan.warmth'
const LS_CONVERGENCE_KEY = 'sayachan.convergenceMode'

export const useRuntimeControls = defineStore('runtimeControls', () => {
  const savedBaseline = localStorage.getItem(LS_BASELINE_KEY)
  const initialBaseline: ChatPersonalityBaseline = isPersonalityBaseline(savedBaseline)
    ? savedBaseline
    : 'warm'

  const personalityBaseline = ref(initialBaseline)

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

  return {
    personalityBaseline,
    futureSlots,
    personalityConfig,
    uiLabels,
    setBaseline,
    setWarmth,
    setConvergenceMode
  }
})
