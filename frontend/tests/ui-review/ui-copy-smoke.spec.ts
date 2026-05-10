import { expect, test } from '@playwright/test'
import { installChatReviewApiMocks } from './chat/api-mocks'
import { installDashboardReviewApiMocks } from './dashboard/api-mocks'
import { installNotesReviewApiMocks } from './notes/api-mocks'
import { installProjectsReviewApiMocks } from './projects/api-mocks'

test.describe('Chinese UI copy smoke', () => {
  test('renders Dashboard chrome in Chinese on desktop and mobile widths', async ({ page }) => {
    await installDashboardReviewApiMocks(page)
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: '看板', level: 1 })).toBeVisible()
    await expect(page.getByPlaceholder('快速添加任务...（例如：去拿快递）')).toBeVisible()
    await expect(page.getByRole('button', { name: '展开全部 (7)' })).toBeVisible()
    await expect(page.locator('[aria-label="看板任务归档视图"]')).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('button', { name: '打开聊天' })).toBeVisible()
    await expect(page.getByRole('link', { name: '看板' })).toBeVisible()
  })

  test('renders Notes chrome in Chinese', async ({ page }) => {
    await installNotesReviewApiMocks(page)
    await page.goto('/notes')

    await expect(page.getByRole('heading', { name: /笔记 \(\d+\)/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '新建笔记' })).toBeVisible()
    await expect(page.locator('[aria-label="笔记归档视图"]')).toBeVisible()

    await page.getByRole('button', { name: '新建笔记' }).click()
    await expect(page.getByRole('dialog', { name: '新建笔记' })).toBeVisible()
    await expect(page.getByRole('button', { name: '关闭新建笔记' })).toBeVisible()
    await expect(page.getByRole('button', { name: '添加笔记' })).toBeVisible()
  })

  test('renders Projects chrome in Chinese', async ({ page }) => {
    await installProjectsReviewApiMocks(page)
    await page.goto('/projects')

    await expect(page.getByRole('heading', { name: /项目 \(\d+\)/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '新建项目' })).toBeVisible()
    await expect(page.locator('[aria-label="项目归档视图"]')).toBeVisible()
    await expect(page.locator('.focus-label').filter({ hasText: '当前焦点' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '+ 添加任务' }).first()).toBeVisible()
  })

  test('renders Chat shell and runtime controls in Chinese', async ({ page }) => {
    await installChatReviewApiMocks(page)
    await page.goto('/dashboard')

    await page.getByRole('button', { name: '打开聊天' }).click()
    await expect(page.locator('.chat-popup').getByText('从一句话开始。')).toBeVisible()
    await expect(page.locator('.chat-popup').getByRole('button', { name: '帮我聚焦' })).toBeVisible()
    await expect(page.getByPlaceholder('说点什么...')).toBeVisible()
    await expect(page.getByRole('button', { name: '发送' })).toBeVisible()

    await page.locator('.chat-popup').getByRole('button', { name: '运行控制' }).click()
    await expect(page.locator('.chat-popup').getByText('运行控制')).toBeVisible()
    await expect(page.locator('.chat-popup').getByText('人格基线')).toBeVisible()
    await expect(page.locator('.chat-popup').getByRole('button', { name: '主推一步' })).toBeVisible()
  })
})
