import { expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installProjectsReviewApiMocks } from './api-mocks.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

export async function openProjectsReview(page) {
  await installProjectsReviewApiMocks(page)
  await page.goto('/projects')
  await expect(page.getByRole('heading', { name: 'Projects', level: 1 })).toBeVisible()
  await expect(projectCard(page, 'Pinned launch project')).toBeVisible()
}

export async function captureProjectsReviewState(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true
  })
}

export function projectCard(page, name) {
  return page.locator('article.card').filter({
    has: page.getByRole('heading', { name })
  })
}
