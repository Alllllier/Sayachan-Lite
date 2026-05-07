import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildResourceCacheKey,
  clearResourceCache,
  readResourceCache,
  writeResourceCache
} from './resourceCache.js'

function stubLocalStorage(initialValues: Record<string, string> = {}) {
  const store = { ...initialValues }
  vi.stubGlobal('localStorage', {
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn(index => Object.keys(store)[index] || null),
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    })
  })
  return store
}

describe('resource cache', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores resource snapshots behind account-scoped keys', () => {
    stubLocalStorage()

    writeResourceCache('user-1', 'notes', 'active', [{ _id: 'note-1' }])

    expect(readResourceCache('user-1', 'notes', 'active')).toEqual([{ _id: 'note-1' }])
    expect(readResourceCache('user-2', 'notes', 'active')).toBe(null)
  })

  it('clears only resource cache entries', () => {
    const cacheKey = buildResourceCacheKey('user-1', 'notes', 'active')
    const store = stubLocalStorage({
      [cacheKey]: JSON.stringify({ data: [] }),
      sayachan_session_token: 'session-token'
    })

    clearResourceCache()

    expect(store[cacheKey]).toBe(undefined)
    expect(store.sayachan_session_token).toBe('session-token')
  })
})
