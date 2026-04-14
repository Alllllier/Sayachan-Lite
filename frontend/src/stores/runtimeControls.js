import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export const useRuntimeControls = defineStore('runtimeControls', () => {
  const personalityBaseline = ref('warm')

  const futureSlots = reactive({
    warmth: null,
    reflectionDepth: null,
    workflowStrictness: null,
    thinking: null,
    debugContext: null
  })

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
    }
  }

  return {
    personalityBaseline,
    futureSlots,
    personalityConfig,
    setBaseline
  }
})
