import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

const LS_BASELINE_KEY = 'sayachan.personalityBaseline'
const LS_WARMTH_KEY = 'sayachan.warmth'
const LS_CONVERGENCE_KEY = 'sayachan.convergenceMode'

export const useRuntimeControls = defineStore('runtimeControls', () => {
  const savedBaseline = localStorage.getItem(LS_BASELINE_KEY)
  const initialBaseline = ['warm', 'strict', 'haraguro'].includes(savedBaseline)
    ? savedBaseline
    : 'warm'

  const personalityBaseline = ref(initialBaseline)

  const savedWarmth = localStorage.getItem(LS_WARMTH_KEY)
  const initialWarmth = savedWarmth !== null ? Number(savedWarmth) : 5

  const savedConvergence = localStorage.getItem(LS_CONVERGENCE_KEY)
  const initialConvergence = ['explore', 'guided', 'decisive'].includes(savedConvergence)
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
        welcome: '我在这。如果你愿意，我们可以先把今天最想推进的那件事理清楚。',
        toneLabel: '正在整理思绪中'
      },
      strict: {
        label: '干练',
        welcome: 'Sayachan 已就绪。当前最优先的 action 是什么？',
        toneLabel: '推导最优解中'
      },
      haraguro: {
        label: '腹黑',
        welcome: '……又在看我了？好吧，我就知道你今天会卡在这里。来吧，说说看是哪件事让你迟迟不想动手。',
        toneLabel: '假装在思考中'
      }
    }
    return configs[personalityBaseline.value] || configs.warm
  })

  function setBaseline(value) {
    if (['warm', 'strict', 'haraguro'].includes(value)) {
      personalityBaseline.value = value
      localStorage.setItem(LS_BASELINE_KEY, value)
    }
  }

  function setWarmth(value) {
    const num = Number(value)
    if (Number.isFinite(num) && num >= 0 && num <= 10) {
      futureSlots.warmth = num
      localStorage.setItem(LS_WARMTH_KEY, String(num))
    }
  }

  function setConvergenceMode(value) {
    if (['explore', 'guided', 'decisive'].includes(value)) {
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
