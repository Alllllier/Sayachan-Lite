import { afterEach, describe, expect, it } from 'vitest'
import { dictionaries, getCurrentLocale, isSupportedLocale, setLocale, t } from './productLocale'

describe('product locale boundary', () => {
  afterEach(() => {
    setLocale('zh')
  })

  it('defaults to Chinese product locale copy', () => {
    expect(getCurrentLocale()).toBe('zh')
    expect(t('nav.dashboard')).toBe('看板')
  })

  it('switches locale through the explicit boundary', () => {
    setLocale('en')
    expect(t('nav.dashboard')).toBe('Dashboard')
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
