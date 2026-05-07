import { expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installNotesReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openNotesReview(page) {
  await installNotesReviewApiMocks(page)
  await page.goto('/notes')
  await expect(page.getByRole('heading', { name: 'Notes', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pinned planning note' })).toBeVisible()
}

export async function captureReviewState(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true
  })
}

export async function fillEditor(page, index, text) {
  const editor = page.locator('.cm-content').nth(index)
  await editor.click()
  await editor.fill(text)
}

export function noteCard(page, title) {
  return page.locator('article.card').filter({
    has: page.getByRole('heading', { name: title })
  })
}

export function editingNoteCard(page) {
  return page.locator('article.card').filter({
    has: page.locator('.note-edit-form')
  })
}
