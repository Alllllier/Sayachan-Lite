import { describe, expect, it, vi } from 'vitest'
import { resolveChatContextSnapshot } from './chatEntry.behavior.js'

describe('chatEntry behavior locks', () => {
  it('reuses hydrated cockpit signals without refreshing dashboard context', async () => {
    const refreshDashboardContext = vi.fn()
    const currentContext = { activeTasksCount: 3 }

    await expect(resolveChatContextSnapshot({
      cockpitSignals: { hasHydrated: true },
      currentContext,
      refreshDashboardContext
    })).resolves.toEqual(currentContext)

    expect(refreshDashboardContext).not.toHaveBeenCalled()
  })

  it('hydrates dashboard context before sending when cockpit signals are cold', async () => {
    const refreshDashboardContext = vi.fn().mockResolvedValue({ activeTasksCount: 2 })

    await expect(resolveChatContextSnapshot({
      cockpitSignals: { hasHydrated: false },
      currentContext: { activeTasksCount: 99 },
      refreshDashboardContext
    })).resolves.toEqual({ activeTasksCount: 2 })

    expect(refreshDashboardContext).toHaveBeenCalledTimes(1)
  })
})
