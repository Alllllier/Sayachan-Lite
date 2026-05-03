import { expect, test } from '@playwright/test'
import {
  captureDashboardReviewState,
  dashboardArchiveControl,
  dashboardTaskRow,
  openDashboardReview
} from './helpers.js'

test.describe('Dashboard UI review', () => {
  test('captures required desktop Dashboard saved-task states with mocked task APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    page.on('dialog', dialog => dialog.accept())

    await openDashboardReview(page)

    await expect(dashboardTaskRow(page, 'Review dashboard saved-task browser baseline')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Completed active row remains reactivatable')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Sixth active task appears after expanding the saved-task list')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Show all (7)', exact: true })).toBeVisible()
    await expect(dashboardTaskRow(page, 'Completed active row remains reactivatable')).toHaveAttribute('aria-pressed', 'true')
    await expect(dashboardTaskRow(page, 'Completed active row remains reactivatable').locator('.item-content-text')).toHaveCSS('text-decoration-line', 'line-through')
    await captureDashboardReviewState(page, 'dashboard-active-default-collapsed')

    await page.getByRole('button', { name: 'Show all (7)', exact: true }).click()
    await expect(dashboardTaskRow(page, 'Sixth active task appears after expanding the saved-task list')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Seventh active task confirms Show less returns to preview')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show less', exact: true })).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-active-expanded')

    await dashboardTaskRow(page, 'Review dashboard saved-task browser baseline').getByRole('button', { name: 'Actions' }).click()
    const activeMenu = page.getByRole('menu')
    await expect(activeMenu).toBeVisible()
    await expect(activeMenu.getByRole('button', { name: 'Archive' })).toBeVisible()
    await expect(activeMenu.getByRole('button', { name: 'Delete' })).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-active-overflow-menu-open')

    await page.keyboard.press('Escape')
    await dashboardTaskRow(page, 'Completed active row remains reactivatable').click()
    await expect(page.getByText('Task reactivated')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Completed active row remains reactivatable')).toHaveAttribute('aria-pressed', 'false')

    await page.getByPlaceholder('Quick add task... (e.g., 去拿快递)').fill('Quick add from Dashboard UI review')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Task added')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Quick add from Dashboard UI review')).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-quick-add-saved-toast')

    await dashboardArchiveControl(page).getByRole('button', { name: 'Archived', exact: true }).click()
    await expect(dashboardArchiveControl(page).getByRole('button', { name: 'Archived', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(dashboardTaskRow(page, 'Archived dashboard task ready to restore')).toBeVisible()
    await expect(dashboardTaskRow(page, 'Archived project task with delete action visible')).toBeVisible()
    await dashboardTaskRow(page, 'Archived dashboard task ready to restore').getByRole('button', { name: 'Actions' }).click()
    const archivedMenu = page.getByRole('menu')
    await expect(archivedMenu).toBeVisible()
    await expect(archivedMenu.getByRole('button', { name: 'Restore' })).toBeVisible()
    await expect(archivedMenu.getByRole('button', { name: 'Delete' })).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-archived-view-restore-delete')
  })

  test('captures Dashboard empty states with mocked task APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openDashboardReview(page, { activeTasks: [], archivedTasks: [] })

    await expect(page.getByText('No saved tasks yet')).toBeVisible()
    await expect(page.getByText('Add tasks from quick add above')).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-active-empty')

    await dashboardArchiveControl(page).getByRole('button', { name: 'Archived', exact: true }).click()
    await expect(dashboardArchiveControl(page).getByRole('button', { name: 'Archived', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('No archived tasks')).toBeVisible()
    await expect(page.getByText('Archive tasks to see them here')).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-archived-empty')
  })

  test('captures mobile active Dashboard state with mocked task APIs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await openDashboardReview(page)

    await expect(dashboardTaskRow(page, 'Review dashboard saved-task browser baseline')).toBeVisible()
    await expect(dashboardArchiveControl(page).getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Show all (7)', exact: true })).toBeVisible()
    await captureDashboardReviewState(page, 'dashboard-mobile-active-view')
  })
})
