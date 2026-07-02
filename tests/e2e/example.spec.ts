import { test, expect } from '@playwright/test';

test.describe('SupportAI Landing Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/SupportAI/);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero content
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
  });
});
