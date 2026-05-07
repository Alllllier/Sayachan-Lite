import { expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ownerUser } from './fixtures.js'
import { installAuthReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openLoginReview(page, options = {}) {
  await installAuthReviewApiMocks(page, options)
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible()
}

export async function openRegisterReview(page, options = {}) {
  await installAuthReviewApiMocks(page, options)
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible()
}

export async function openOwnerReview(page, options = {}) {
  await installAuthReviewApiMocks(page, { currentUser: ownerUser, ...options })
  await page.goto('/owner')
  await expect(page.getByRole('heading', { name: 'Management', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'System status' })).toBeVisible()
}

export async function captureAuthReviewState(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled'
  })
}

export function ownerCard(page, title) {
  return page.locator('article.card').filter({
    has: page.getByRole('heading', { name: title })
  })
}
