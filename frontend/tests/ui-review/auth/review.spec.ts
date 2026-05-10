import { expect, test } from '@playwright/test'
import {
  captureAuthReviewState,
  openLoginReview,
  openOwnerReview,
  openRegisterReview,
  openSettingsReview,
  ownerCard
} from './helpers.js'
import { ownerUser } from './fixtures.js'

test.describe('Auth and Owner UI review', () => {
  test('captures Login default and invalid-credentials states', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openLoginReview(page)

    await expect(page.getByText('Sayachan Lite')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create tester account' })).toBeVisible()
    await captureAuthReviewState(page, 'auth-login-default-desktop')

    await page.reload()
    await openLoginReview(page, {
      loginStatus: 401,
      loginError: 'Invalid email or password'
    })
    await page.getByLabel('Email').fill('owner-review@example.com')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText('Invalid email or password')).toBeVisible()
    await captureAuthReviewState(page, 'auth-login-invalid-credentials-desktop')
  })

  test('captures Register default tester invite-gated state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openRegisterReview(page)

    await expect(page.getByText('Tester access')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Invite code')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to login' })).toBeVisible()
    await captureAuthReviewState(page, 'auth-register-default-desktop')
  })

  test('captures Owner management desktop states with mocked owner APIs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openOwnerReview(page)

    await expect(ownerCard(page, 'System status')).toContainText('Users')
    await expect(ownerCard(page, 'System status')).toContainText('3')
    await expect(ownerCard(page, 'Invites')).toContainText('ABCD...WXYZ')
    await expect(ownerCard(page, 'Invites')).toContainText('used')
    await expect(ownerCard(page, 'Tester accounts')).toContainText('tester-review@example.com')
    await expect(ownerCard(page, 'Tester accounts')).toContainText('disabled-tester-review@example.com')
    await captureAuthReviewState(page, 'auth-owner-management-desktop')

    await page.getByRole('button', { name: 'New invite' }).click()
    await expect(page.getByText('NEW-REVIEW-CODE-1')).toBeVisible()
    await expect(page.getByText('Invite created')).toBeVisible()
    await captureAuthReviewState(page, 'auth-owner-new-invite-desktop')
  })

  test('captures Owner management mobile state with mocked owner APIs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await openOwnerReview(page)

    await expect(ownerCard(page, 'Invites')).toContainText('ABCD...WXYZ')
    await expect(ownerCard(page, 'Tester accounts')).toContainText('tester-review@example.com')
    await captureAuthReviewState(page, 'auth-owner-management-mobile')
  })

  test('captures Settings normal account state, locale switch, and logout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openSettingsReview(page)

    await expect(page.getByText('tester-review@example.com')).toBeVisible()
    await expect(page.getByRole('link', { name: '进入管理' })).toHaveCount(0)
    await expect(page.getByText(/^tester$/i)).toHaveCount(0)
    await expect(page.getByRole('link', { name: '设置' })).toBeVisible()
    await captureAuthReviewState(page, 'auth-settings-normal-zh-desktop')

    await page.getByRole('button', { name: 'English' }).click()
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    await captureAuthReviewState(page, 'auth-settings-normal-en-desktop')

    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible()
  })

  test('captures Settings owner management entry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await openSettingsReview(page, { currentUser: ownerUser })

    await expect(page.getByText('owner-review@example.com')).toBeVisible()
    await expect(page.getByRole('link', { name: '进入管理' })).toBeVisible()
    await expect(page.getByText(/^owner$/i)).toHaveCount(0)
    await captureAuthReviewState(page, 'auth-settings-owner-zh-desktop')
  })
})
