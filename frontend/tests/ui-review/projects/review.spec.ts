import { expect, test } from '@playwright/test'
import {
  captureProjectsReviewState,
  openProjectsReview,
  projectCard
} from './helpers.js'

test.describe('Projects UI review', () => {
  test('captures required desktop Projects states with mocked APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    page.on('dialog', dialog => dialog.accept())

    await openProjectsReview(page)

    const pinnedCard = projectCard(page, 'Pinned launch project')
    await expect(pinnedCard).toBeVisible()
    await expect(projectCard(page, 'Planning review project')).toBeVisible()
    await expect(projectCard(page, 'Paused cleanup project')).toBeVisible()
    await expect(pinnedCard.getByText('In Progress')).toBeVisible()
    await expect(pinnedCard.getByText('Pinned active project with enough summary text')).toBeVisible()
    await expect(pinnedCard.locator('.focus-label')).toHaveText('Current Focus')
    await expect(pinnedCard.locator('.focus-value')).toContainText('Confirm launch checklist ownership')
    await expect(pinnedCard.locator('.focus-badge')).toBeVisible()
    await expect(pinnedCard.getByText('Archived old launch checklist item')).toBeVisible()
    await expect(pinnedCard.getByText('Schedule final polish pass for the project browser baseline')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'New project' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Active' }).first()).toHaveAttribute('aria-pressed', 'true')
    await captureProjectsReviewState(page, 'projects-active-default-pinned-collapsed-preview')

    await page.evaluate(() => window.scrollTo(0, 420))
    const scrollBeforeCapture = await page.evaluate(() => window.scrollY)
    await page.getByRole('button', { name: 'New project' }).click()
    const capture = page.getByRole('dialog', { name: 'New Project' })
    await expect(capture).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBeforeCapture)
    await capture.getByRole('button', { name: 'Add Project' }).click()
    await expect(capture.getByText('Enter a project name.')).toBeVisible()
    await expect(capture.getByText('Enter a short summary.')).toBeVisible()
    await captureProjectsReviewState(page, 'projects-new-project-validation')

    await capture.getByPlaceholder('Project name').fill('Created from UI review')
    await capture.getByPlaceholder('Summary').fill('Created project summary from the mocked UI review path.')
    await capture.getByLabel('Project status').selectOption('in_progress')
    await capture.getByRole('button', { name: 'Add Project' }).click()
    await expect(page.getByRole('dialog', { name: 'New Project' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Created from UI review' })).toHaveCount(1)

    await page.getByRole('button', { name: 'New project' }).click()
    await page.getByRole('dialog', { name: 'New Project' }).getByPlaceholder('Project name').fill('Canceled project')
    await page.getByRole('dialog', { name: 'New Project' }).getByPlaceholder('Summary').fill('This canceled project should not be created.')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog', { name: 'New Project' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Canceled project' })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'New project' }).click()
    await expect(page.getByRole('dialog', { name: 'New Project' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'New Project' })).toHaveCount(0)

    await page.getByRole('button', { name: 'New project' }).click()
    await expect(page.getByRole('dialog', { name: 'New Project' })).toBeVisible()
    await page.locator('.collection-capture-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.getByRole('dialog', { name: 'New Project' })).toHaveCount(0)

    await pinnedCard.getByRole('button', { name: /Show all \(4\)|Expand details/ }).first().click()
    await expect(pinnedCard.getByText('Schedule final polish pass for the project browser baseline')).toBeVisible()
    await captureProjectsReviewState(page, 'projects-active-expanded-task-preview')

    await pinnedCard.getByRole('button', { name: 'Completed' }).click()
    await expect(pinnedCard.getByText('Completed dependency audit for the launch project')).toBeVisible()
    await expect(pinnedCard.getByText('Completed copy review for the pinned project summary')).toBeVisible()
    await captureProjectsReviewState(page, 'projects-completed-task-preview-filter')

    await pinnedCard.getByRole('button', { name: /Show all \(4\)|Expand details/ }).last().click()
    await expect(pinnedCard.getByText('Archived follow-up beyond collapsed preview')).toBeVisible()
    await captureProjectsReviewState(page, 'projects-active-archived-task-preview-expanded')

    await pinnedCard.getByRole('button', { name: '+ Add Task' }).click()
    await expect(pinnedCard.getByPlaceholder('Task title...')).toBeVisible()
    await expect(pinnedCard.getByRole('button', { name: 'Save' })).toBeVisible()
    await captureProjectsReviewState(page, 'projects-single-task-capture-open')

    await pinnedCard.getByRole('button', { name: 'Batch' }).click()
    await expect(pinnedCard.getByPlaceholder('One task per line...')).toBeVisible()
    await expect(pinnedCard.getByRole('button', { name: 'Save All' })).toBeVisible()
    await captureProjectsReviewState(page, 'projects-batch-task-capture-mode')
    await pinnedCard.getByRole('button', { name: 'Cancel' }).click()

    await pinnedCard.locator('.btn-ai-icon').click()
    await expect(page.getByText('Focusing')).toBeVisible()
    await expect(page.getByText('Project · Pinned launch project')).toBeVisible()
    await captureProjectsReviewState(page, 'projects-chat-focus-active')
    await page.getByRole('button', { name: 'Close chat' }).click()

    await pinnedCard.getByRole('button', { name: 'Actions' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Archive', exact: true })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Delete' })).toBeVisible()
    await captureProjectsReviewState(page, 'projects-overflow-menu-open')

    await page.getByRole('button', { name: 'Archived' }).click()
    const archivedCard = projectCard(page, 'Archived migration project')
    await expect(archivedCard).toBeVisible()
    await expect(archivedCard.getByText('Archived project historical task')).toBeVisible()
    await expect(archivedCard.getByRole('button', { name: 'Restore' })).toBeVisible()
    await expect(archivedCard.getByRole('button', { name: 'Delete' })).toBeVisible()
    await expect(archivedCard.getByRole('button', { name: 'Edit' })).toHaveCount(0)
    await expect(archivedCard.getByRole('button', { name: 'Archive' })).toHaveCount(0)
    await captureProjectsReviewState(page, 'projects-archived-view-restore-delete-only')
  })

  test('captures mobile active Projects state with mocked APIs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await openProjectsReview(page)

    const pinnedCard = projectCard(page, 'Pinned launch project')
    await expect(pinnedCard).toBeVisible()
    await expect(page.getByRole('button', { name: 'Active' }).first()).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'New project' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible()
    await page.getByRole('button', { name: 'New project' }).click()
    await expect(page.getByRole('dialog', { name: 'New Project' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close new project' })).toBeVisible()
    await expect(pinnedCard.locator('.focus-value')).toContainText('Confirm launch checklist ownership')
    await captureProjectsReviewState(page, 'projects-mobile-active-view')
  })
})
