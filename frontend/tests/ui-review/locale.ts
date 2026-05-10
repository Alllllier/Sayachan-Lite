import type { Page } from '@playwright/test'

export async function useUiReviewLocale(page: Page, locale: 'zh' | 'en'): Promise<void> {
  await page.addInitScript((selectedLocale) => {
    window.localStorage.setItem('sayachan_product_locale', selectedLocale)
  }, locale)
}
