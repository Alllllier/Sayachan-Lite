import { expect, test } from '@playwright/test'
import {
  captureChatReviewState,
  chatBody,
  chatInput,
  chatPopup,
  openChatPopup,
  openChatReview,
  sendButton
} from './helpers.js'

test.describe('Chat UI review', () => {
  test('captures desktop Chat shell states with mocked AI and cockpit APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openChatReview(page)

    await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    await captureChatReviewState(page, 'chat-floating-entry-desktop')

    await openChatPopup(page)
    await expect(chatPopup(page).getByText('Sayachan')).toBeVisible()
    await expect(chatBody(page).getByText('我在这。如果你愿意，我们可以先把今天最想推进的那件事理清楚。')).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '帮我聚焦' })).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '拆下一步' })).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '今天总结' })).toBeVisible()
    await expect(chatInput(page)).toBeEnabled()
    await expect(sendButton(page)).toBeEnabled()
    await captureChatReviewState(page, 'chat-open-default-desktop')

    await chatPopup(page).getByRole('button', { name: 'Runtime controls' }).click()
    await expect(chatPopup(page).getByText('Runtime Controls')).toBeVisible()
    await expect(chatPopup(page).getByText('人格基线')).toBeVisible()
    await expect(chatPopup(page).getByText('温暖')).toBeVisible()
    await expect(chatPopup(page).getByText('干练')).toBeVisible()
    await expect(chatPopup(page).getByText('腹黑')).toBeVisible()
    await expect(chatPopup(page).getByText('温度')).toBeVisible()
    await expect(chatPopup(page).locator('.runtime-slider')).toBeVisible()
    await expect(chatPopup(page).getByText('收敛方式')).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '一起想' })).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '主推一步' })).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '直接收束' })).toBeVisible()
    await expect(chatPopup(page).getByText('Reflection Depth')).toBeVisible()
    await expect(chatPopup(page).getByText('Thinking')).toBeVisible()
    await expect(chatPopup(page).getByText('Debug Context')).toBeVisible()
    await expect(chatPopup(page).locator('.runtime-future-item.disabled')).toHaveCount(3)
    await captureChatReviewState(page, 'chat-runtime-controls-open-desktop')

    await chatPopup(page).locator('.runtime-panel-body').evaluate(element => {
      element.scrollTop = element.scrollHeight
    })
    await expect(chatPopup(page).getByText('Future Controls')).toBeVisible()
    await expect(chatPopup(page).getByText('Reflection Depth')).toBeVisible()
    await expect(chatPopup(page).getByText('coming soon')).toHaveCount(3)
    await captureChatReviewState(page, 'chat-runtime-controls-future-controls-desktop')
  })

  test('captures Chat send, hydration, thinking, markdown, and failure states', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    const controls = await openChatReview(page, {
      delayCockpit: true,
      delayChat: true
    })
    await openChatPopup(page)

    await chatInput(page).fill('Please keep <b>my text</b> plain.')
    await sendButton(page).click()

    await expect(chatBody(page).getByText('Please keep <b>my text</b> plain.')).toBeVisible()
    await expect(chatBody(page).locator('.chat-bubble--thinking')).toContainText('正在同步当前工作上下文...')
    await expect(chatInput(page)).toBeDisabled()
    await expect(sendButton(page)).toHaveText('准备中')
    await captureChatReviewState(page, 'chat-cockpit-hydrating-desktop')

    controls.releaseCockpit()
    await expect(sendButton(page)).toHaveText('Thinking')
    await expect(chatBody(page).locator('.chat-bubble--thinking')).toContainText('正在整理思绪中 · Thinking')
    await expect(chatInput(page)).toBeDisabled()
    await captureChatReviewState(page, 'chat-sending-thinking-desktop')

    controls.releaseChat()
    await expect(chatBody(page).getByRole('heading', { name: 'Mocked focus pass' })).toBeVisible()
    await expect(chatBody(page).locator('strong', { hasText: 'structured' })).toBeVisible()
    await expect(chatBody(page).locator('script')).toHaveCount(0)
    await expect(chatInput(page)).toBeEnabled()
    await expect(sendButton(page)).toHaveText('Send')
    await captureChatReviewState(page, 'chat-user-and-assistant-markdown-desktop')

    await page.reload()
    await openChatReview(page, { chatStatus: 500 })
    await openChatPopup(page)
    await chatInput(page).fill('Trigger fallback reply')
    await sendButton(page).click()
    await expect(chatBody(page).getByText('Trigger fallback reply')).toBeVisible()
    await expect(chatBody(page).getByText('我刚刚有点走神了，我们再试一次。')).toBeVisible()
    await captureChatReviewState(page, 'chat-ai-send-failure-fallback-desktop')
  })

  test('captures mobile open Chat popup with mocked APIs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await openChatReview(page)
    await openChatPopup(page)

    await expect(chatPopup(page).getByText('Sayachan')).toBeVisible()
    await expect(chatPopup(page).getByRole('button', { name: '帮我聚焦' })).toBeVisible()
    await expect(chatInput(page)).toBeVisible()
    await captureChatReviewState(page, 'chat-open-default-mobile')
  })
})
