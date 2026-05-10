import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ownerUser, testerUser } from './fixtures.js'
import { installAuthReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openLoginReview(page: Page, options = {}): Promise<void> {
  await installAuthReviewApiMocks(page, options)
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible()
}

export async function openRegisterReview(page: Page, options = {}): Promise<void> {
  await installAuthReviewApiMocks(page, options)
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible()
}

export async function openOwnerReview(page: Page, options = {}): Promise<void> {
  await installAuthReviewApiMocks(page, { currentUser: ownerUser, ...options })
  await page.goto('/owner')
  await expect(page.getByRole('heading', { name: 'Management', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'System status' })).toBeVisible()
}

export async function openSettingsReview(page: Page, options = {}): Promise<void> {
  await installAuthReviewApiMocks(page, { currentUser: testerUser, ...options })
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: '设置', level: 1 })).toBeVisible()
}

export async function captureAuthReviewState(page: Page, name: string): Promise<void> {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled'
  })
}

export function ownerCard(page: Page, title: string): Locator {
  return page.locator('article.card').filter({
    has: page.getByRole('heading', { name: title })
  })
}
