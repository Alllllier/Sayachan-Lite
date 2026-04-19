import { expect, test } from '@playwright/test'

const activeNotes = [
  {
    _id: 'note-1',
    title: 'Weekly focus',
    content: 'This is a very long line that should wrap instead of causing horizontal scrolling because we want the editor to feel comfortable for writing normal prose without having to manage line breaks manually.',
    status: 'active',
    isPinned: false,
    pinnedAt: null,
    updatedAt: '2026-04-17T10:00:00.000Z'
  }
]

async function installNotesMocks(page) {
  await page.route('http://localhost:3001/notes', async (route) => {
    const request = route.request()
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(activeNotes)
      })
      return
    }
    await route.fallback()
  })

  await page.route('http://localhost:3001/notes/*', async (route) => {
    const request = route.request()
    if (request.method() === 'PUT') {
      const payload = JSON.parse(request.postData() || '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...activeNotes[0], ...payload, updatedAt: '2026-04-17T11:05:00.000Z' })
      })
      return
    }
    await route.fallback()
  })
}

test.describe('Notes Editor Comfort Fixes', () => {
  test('new note editor has 14px font, 1.6 line height, and line wrapping', async ({ page }) => {
    await installNotesMocks(page)
    await page.goto('/notes')

    const editor = page.locator('.form-section .cm-editor').first()
    await expect(editor).toBeVisible()

    const computedFontSize = await editor.evaluate((el) => {
      const scroller = el.querySelector('.cm-scroller')
      return window.getComputedStyle(scroller || el).fontSize
    })
    expect(computedFontSize).toBe('14px')

    const computedLineHeight = await editor.evaluate((el) => {
      const scroller = el.querySelector('.cm-scroller')
      return window.getComputedStyle(scroller || el).lineHeight
    })
    expect(computedLineHeight).toBe('22.4px')

    const wrapStyle = await editor.evaluate((el) => {
      const line = el.querySelector('.cm-line')
      return window.getComputedStyle(line).whiteSpace
    })
    expect(wrapStyle).toBe('break-spaces')
  })

  test('edit note editor has 14px font, 1.6 line height, and line wrapping', async ({ page }) => {
    await installNotesMocks(page)
    await page.goto('/notes')

    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

    const editor = page.locator('.note-card .cm-editor').first()
    await expect(editor).toBeVisible()

    const computedFontSize = await editor.evaluate((el) => {
      const scroller = el.querySelector('.cm-scroller')
      return window.getComputedStyle(scroller || el).fontSize
    })
    expect(computedFontSize).toBe('14px')

    const computedLineHeight = await editor.evaluate((el) => {
      const scroller = el.querySelector('.cm-scroller')
      return window.getComputedStyle(scroller || el).lineHeight
    })
    expect(computedLineHeight).toBe('22.4px')

    const wrapStyle = await editor.evaluate((el) => {
      const line = el.querySelector('.cm-line')
      return window.getComputedStyle(line).whiteSpace
    })
    expect(wrapStyle).toBe('break-spaces')
  })

  test('long lines wrap without horizontal scrollbar', async ({ page }) => {
    await installNotesMocks(page)
    await page.goto('/notes')

    await page.getByRole('button', { name: 'Edit' }).first().click()
    const editor = page.locator('.note-card .cm-editor').first()

    const hasHorizontalScrollbar = await editor.evaluate((el) => {
      const scroller = el.querySelector('.cm-scroller')
      if (!scroller) return true
      return scroller.scrollWidth > scroller.clientWidth
    })
    expect(hasHorizontalScrollbar).toBe(false)
  })
})
