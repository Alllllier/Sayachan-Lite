import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRuntimeControls } from './runtimeControls.js'

const LS_BASELINE_KEY = 'sayachan.personalityBaseline'
const LS_WARMTH_KEY = 'sayachan.warmth'
const LS_CONVERGENCE_KEY = 'sayachan.convergenceMode'
const LS_STREAMING_KEY = 'sayachan.chatStreamingEnabled'
const LS_DEBUG_TRACE_KEY = 'sayachan.chatDebugTraceEnabled'

function createLocalStorageMock(initialValues = {}) {
  const store = new Map(Object.entries(initialValues))

  return {
    getItem: vi.fn(key => store.get(key) ?? null),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn(key => store.delete(key)),
    clear: vi.fn(() => store.clear())
  }
}

function createRuntimeStore(initialValues = {}) {
  vi.stubGlobal('localStorage', createLocalStorageMock(initialValues))
  setActivePinia(createPinia())
  return useRuntimeControls()
}

describe('runtimeControls store behavior locks', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('hydrates valid saved runtime control values from localStorage', () => {
    const store = createRuntimeStore({
      [LS_BASELINE_KEY]: 'strict',
      [LS_WARMTH_KEY]: '7',
      [LS_CONVERGENCE_KEY]: 'explore',
      [LS_STREAMING_KEY]: 'false',
      [LS_DEBUG_TRACE_KEY]: 'false'
    })

    expect(store.personalityBaseline).toBe('strict')
    expect(store.futureSlots.warmth).toBe(7)
    expect(store.futureSlots.convergenceMode).toBe('explore')
    expect(store.chatStreamingEnabled).toBe(false)
    expect(store.debugTraceEnabled).toBe(false)
    expect(store.personalityConfig.label).toBe('干练')
  })

  it('falls back to warm, guided, and streaming enabled when saved values are invalid or absent', () => {
    const store = createRuntimeStore({
      [LS_BASELINE_KEY]: 'chaos',
      [LS_CONVERGENCE_KEY]: 'random'
    })

    expect(store.personalityBaseline).toBe('warm')
    expect(store.futureSlots.convergenceMode).toBe('guided')
    expect(store.chatStreamingEnabled).toBe(true)
    expect(store.debugTraceEnabled).toBe(true)
    expect(store.personalityConfig.label).toBe('温暖')
  })

  it('updates and persists only valid personality baselines', () => {
    const store = createRuntimeStore()

    store.setBaseline('haraguro')
    expect(store.personalityBaseline).toBe('haraguro')
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_BASELINE_KEY, 'haraguro')
    expect(store.personalityConfig.label).toBe('腹黑')

    store.setBaseline('invalid')
    expect(store.personalityBaseline).toBe('haraguro')
  })

  it('updates and persists warmth only within the supported 0-10 range', () => {
    const store = createRuntimeStore()

    store.setWarmth(0)
    expect(store.futureSlots.warmth).toBe(0)
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_WARMTH_KEY, '0')

    store.setWarmth(10)
    expect(store.futureSlots.warmth).toBe(10)
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_WARMTH_KEY, '10')

    store.setWarmth(-1)
    store.setWarmth(11)
    store.setWarmth(Number.NaN)
    expect(store.futureSlots.warmth).toBe(10)
  })

  it('updates and persists only valid convergence modes', () => {
    const store = createRuntimeStore()

    store.setConvergenceMode('decisive')
    expect(store.futureSlots.convergenceMode).toBe('decisive')
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_CONVERGENCE_KEY, 'decisive')

    store.setConvergenceMode('random')
    expect(store.futureSlots.convergenceMode).toBe('decisive')
  })

  it('updates and persists chat streaming mode', () => {
    const store = createRuntimeStore()

    expect(store.chatStreamingEnabled).toBe(true)
    store.setChatStreamingEnabled(false)
    expect(store.chatStreamingEnabled).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_STREAMING_KEY, 'false')

    store.setChatStreamingEnabled(true)
    expect(store.chatStreamingEnabled).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_STREAMING_KEY, 'true')
  })

  it('updates and persists debug trace mode and latest trace', () => {
    const store = createRuntimeStore()

    expect(store.debugTraceEnabled).toBe(true)
    store.setDebugTraceEnabled(false)
    expect(store.debugTraceEnabled).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_DEBUG_TRACE_KEY, 'false')

    store.setLatestDebugTrace({ tools: { exposed: ['getNoteContent'] } })
    expect(store.latestDebugTrace).toEqual({ tools: { exposed: ['getNoteContent'] } })

    store.clearLatestDebugTrace()
    expect(store.latestDebugTrace).toBeNull()
  })
})
