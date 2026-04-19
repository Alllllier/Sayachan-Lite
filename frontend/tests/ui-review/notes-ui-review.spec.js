import { expect, test } from '@playwright/test'

const activeNotes = [
  {
    _id: 'note-1',
    title: 'Weekly focus',
    content: '# Weekly focus\n\n- tighten UI hierarchy\n- verify markdown contract\n\n```js\nconsole.log("hello")\n```',
    status: 'active',
    isPinned: true,
    pinnedAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T10:00:00.000Z'
  },
  {
    _id: 'note-2',
    title: 'Inbox cleanup',
    content: 'Keep this note simple.\n\nA second paragraph keeps spacing visible.',
    status: 'active',
    isPinned: false,
    pinnedAt: null,
    updatedAt: '2026-04-17T09:00:00.000Z'
  }
]

const archivedNotes = [
  {
    _id: 'note-3',
    title: 'Archived note',
    content: 'This note is archived.',
    status: 'archived',
    isPinned: false,
    pinnedAt: null,
    updatedAt: '2026-04-16T10:00:00.000Z'
  }
]

async function installNotesMocks(page) {
  await page.route('http://localhost:3001/notes?archived=true', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(archivedNotes)
    })
  })

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

    if (request.method() === 'POST') {
      const payload = JSON.parse(request.postData() || '{}')
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'note-created',
          status: 'active',
          isPinned: false,
          pinnedAt: null,
          updatedAt: '2026-04-17T11:00:00.000Z',
          ...payload
        })
      })
      return
    }

    await route.fallback()
  })

  await page.route('http://localhost:3001/notes/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const id = url.pathname.split('/').slice(-1)[0]

    if (request.method() === 'PUT') {
      const payload = JSON.parse(request.postData() || '{}')
      const note = activeNotes.find((item) => item._id === id) || archivedNotes.find((item) => item._id === id)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...note,
          ...payload,
          updatedAt: '2026-04-17T11:05:00.000Z'
        })
      })
      return
    }

    if (request.method() === 'DELETE') {
      await route.fulfill({ status: 204, body: '' })
      return
    }

    await route.fallback()
  })

  await page.route('http://localhost:3001/ai/notes/tasks', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        drafts: [
          'Tighten Notes action hierarchy',
          'Reduce visual noise in AI suggestion region'
        ]
      })
    })
  })
}

async function captureReviewShot(page, testInfo, name) {
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true
  })
}

test.describe('Notes UI review v1', () => {
  test('captures key Notes page states for manual or AI-assisted review', async ({ page }, testInfo) => {
    await installNotesMocks(page)

    await page.goto('/notes')
    await expect(page.getByRole('heading', { name: 'Notes (2)' })).toBeVisible()
    await captureReviewShot(page, testInfo, 'notes-default')

    await page.getByRole('button', { name: 'Generate with AI' }).first().click()
    await expect(page.getByText('AI Tasks (2)')).toBeVisible()
    await captureReviewShot(page, testInfo, 'notes-ai-expanded')

    await page.locator('button[title="Actions"]').first().click()
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
    await captureReviewShot(page, testInfo, 'notes-edit-state')

    await page.getByRole('button', { name: 'Archived' }).click()
    await expect(page.getByText('Archived note')).toBeVisible()
    await captureReviewShot(page, testInfo, 'notes-archived-state')
  })
})
