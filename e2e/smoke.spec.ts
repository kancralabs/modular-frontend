import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E App')
})

test('deep links fall back to the SPA and show not found', async ({ page }) => {
  await page.goto('/some/unknown/route')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})
