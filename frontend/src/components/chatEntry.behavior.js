export async function resolveChatContextSnapshot({
  cockpitSignals,
  currentContext,
  refreshDashboardContext
}) {
  if (cockpitSignals?.hasHydrated) {
    return currentContext
  }

  return refreshDashboardContext()
}
