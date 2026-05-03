import { expect, test } from '@playwright/test'
import { aiDrafts } from './fixtures.js'
import {
  captureReviewState,
  editingNoteCard,
  fillEditor,
  noteCard,
  openNotesReview
} from './helpers.js'

test.describe('Notes UI review', () => {
  test('captures required desktop Notes states with mocked APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    page.on('dialog', dialog => dialog.accept())

    await openNotesReview(page)

    await expect(noteCard(page, 'Pinned planning note')).toBeVisible()
    await expect(noteCard(page, 'Markdown rendering review')).toBeVisible()
    await expect(noteCard(page, 'AI draft source note')).toBeVisible()
    await expect(noteCard(page, 'Markdown rendering review').locator('h1', { hasText: 'Markdown review' })).toBeVisible()
    await expect(noteCard(page, 'Markdown rendering review').locator('pre code')).toContainText('reviewState')
    await captureReviewState(page, 'notes-active-default-pinned-markdown')

    await page.getByRole('button', { name: 'Add Note' }).click()
    await expect(page.getByText('Enter a note title.')).toBeVisible()
    await expect(page.getByText('Enter note content.')).toBeVisible()
    await captureReviewState(page, 'notes-new-note-validation')

    await page.getByPlaceholder('Title').fill('Created from UI review')
    await fillEditor(page, 0, 'Created note content from the mocked UI review path.')
    await page.getByRole('button', { name: 'Add Note' }).click()
    await expect(page.getByRole('heading', { name: 'Created from UI review' })).toBeVisible()

    const markdownCard = noteCard(page, 'Markdown rendering review')
    await markdownCard.getByRole('button', { name: 'Actions' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Archive', exact: true })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Delete' })).toBeVisible()
    await captureReviewState(page, 'notes-overflow-menu-open')

    await menu.getByRole('button', { name: 'Edit' }).click()
    const editingCard = editingNoteCard(page)
    await expect(editingCard.getByPlaceholder('Title')).toHaveValue('Markdown rendering review')
    await expect(editingCard.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(editingCard.getByRole('button', { name: 'Save' })).toBeVisible()
    await captureReviewState(page, 'notes-edit-existing-note')

    await editingCard.getByPlaceholder('Title').fill('')
    await fillEditor(page, 1, '')
    await editingCard.getByRole('button', { name: 'Save' }).click()
    await expect(editingCard.getByText('Enter a note title.')).toBeVisible()
    await expect(editingCard.getByText('Enter note content.')).toBeVisible()
    await captureReviewState(page, 'notes-edit-validation-errors')

    await editingCard.getByPlaceholder('Title').fill('Markdown rendering review updated')
    await fillEditor(page, 1, 'Updated markdown review content.')
    await editingCard.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('heading', { name: 'Markdown rendering review updated' })).toBeVisible()

    const aiCard = noteCard(page, 'AI draft source note')
    await aiCard.locator('.btn-ai-icon').click()
    await expect(aiCard.getByText('AI Tasks (2)')).toBeVisible()
    await expect(aiCard.getByText(aiDrafts[0])).toBeVisible()
    await captureReviewState(page, 'notes-ai-drafts-active')

    await aiCard.getByRole('button', { name: 'Save as Task' }).first().click()
    await expect(aiCard.getByRole('button', { name: 'Saved' })).toBeVisible()
    await expect(page.getByText('Task saved')).toBeVisible()
    await captureReviewState(page, 'notes-ai-draft-saved')

    await page.getByRole('button', { name: 'Archived' }).click()
    await expect(page.getByRole('heading', { name: 'Archived review note' })).toBeVisible()
    const archivedCard = noteCard(page, 'Archived review note')
    await expect(archivedCard.getByRole('button', { name: 'Restore' })).toBeVisible()
    await expect(archivedCard.getByRole('button', { name: 'Delete' })).toBeVisible()
    await expect(archivedCard.getByRole('button', { name: 'Edit' })).toHaveCount(0)
    await expect(archivedCard.getByRole('button', { name: 'Archive' })).toHaveCount(0)
    await captureReviewState(page, 'notes-archived-view')
  })

  test('captures mobile active Notes state with mocked APIs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openNotesReview(page)

    await expect(noteCard(page, 'Pinned planning note')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
    await captureReviewState(page, 'notes-mobile-active-view')
  })
})
