import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dictionaries, getCurrentLocale, isSupportedLocale, setLocale, t } from './productLocale'

function createLocalStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value)
  }
}

describe('product locale boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage())
  })

  afterEach(() => {
    globalThis.localStorage.clear()
    setLocale('zh')
    vi.unstubAllGlobals()
  })

  it('defaults to Chinese product locale copy', () => {
    expect(getCurrentLocale()).toBe('zh')
    expect(t('nav.dashboard')).toBe('看板')
  })

  it('switches locale through the explicit boundary', () => {
    setLocale('en')
    expect(t('nav.dashboard')).toBe('Dashboard')
  })

  it('persists selected locale locally', () => {
    setLocale('en')
    expect(globalThis.localStorage.getItem('sayachan_product_locale')).toBe('en')
  })

  it('initializes from a supported stored locale', async () => {
    globalThis.localStorage.setItem('sayachan_product_locale', 'en')
    vi.resetModules()

    const localeModule = await import('./productLocale')

    expect(localeModule.getCurrentLocale()).toBe('en')
    expect(localeModule.t('nav.settings')).toBe('Settings')
  })

  it('falls back to English and then the key for missing entries', () => {
    delete dictionaries.zh.__testFallback
    dictionaries.en.__testFallback = 'Fallback'

    expect(t('__testFallback')).toBe('Fallback')
    expect(t('__missingCopyKey')).toBe('__missingCopyKey')

    delete dictionaries.en.__testFallback
  })

  it('checks supported locale values', () => {
    expect(isSupportedLocale('zh')).toBe(true)
    expect(isSupportedLocale('en')).toBe(true)
    expect(isSupportedLocale('ja')).toBe(false)
  })
})
