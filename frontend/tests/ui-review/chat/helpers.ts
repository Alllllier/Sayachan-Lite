import { expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installChatReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openChatReview(page, options = {}) {
  const controls = await installChatReviewApiMocks(page, options)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
  return controls
}

export async function openChatPopup(page) {
  await page.getByRole('button', { name: 'Open chat' }).click()
  await expect(chatPopup(page)).toBeVisible()
}

export async function captureChatReviewState(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled'
  })
}

export function chatPopup(page) {
  return page.locator('.chat-popup')
}

export function chatBody(page) {
  return page.locator('.chat-body')
}

export function chatInput(page) {
  return page.getByPlaceholder(/说点什么/)
}

export function sendButton(page) {
  return page.getByRole('button', { name: /^(Send|Thinking|准备中)$/ })
}

