const CACHE_PREFIX = 'sayachan_resource_cache'

function getStorage() {
  return globalThis.localStorage
}

function safeUserKey(userKey) {
  return encodeURIComponent(String(userKey || 'anonymous'))
}

function safePart(part) {
  return encodeURIComponent(String(part || 'default'))
}

export function buildResourceCacheKey(userKey, resourceName, variant = 'default') {
  return [
    CACHE_PREFIX,
    safeUserKey(userKey),
    safePart(resourceName),
    safePart(variant)
  ].join(':')
}

export function readResourceCache(userKey, resourceName, variant = 'default') {
  try {
    const raw = getStorage()?.getItem(buildResourceCacheKey(userKey, resourceName, variant))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.data ?? null
  } catch (error) {
    return null
  }
}

export function writeResourceCache(userKey, resourceName, variant = 'default', data) {
  try {
    getStorage()?.setItem(
      buildResourceCacheKey(userKey, resourceName, variant),
      JSON.stringify({ data, savedAt: new Date().toISOString() })
    )
  } catch (error) {
    // Cache writes are best-effort only; backend data remains canonical.
  }
}

export function clearResourceCache() {
  const storage = getStorage()
  if (!storage) return

  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index)
    if (key?.startsWith(`${CACHE_PREFIX}:`)) {
      storage.removeItem(key)
    }
  }
}
