import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installDashboardReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openDashboardReview(page: Page, options = {}): Promise<void> {
  await installDashboardReviewApiMocks(page, options)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
}

export async function captureDashboardReviewState(page: Page, name: string): Promise<void> {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled'
  })
}

export function dashboardTaskRow(page: Page, title: string): Locator {
  return page.locator('.list-item').filter({ hasText: title })
}

export function dashboardArchiveControl(page: Page): Locator {
  return page.locator('[aria-label="Dashboard task archive view"]')
}
