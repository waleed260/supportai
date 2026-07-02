import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  page: string;
  timestamp: string;
  status: number;
  errors: string[];
  warnings: string[];
  consoleErrors: string[];
  networkErrors: string[];
  accessibility: string[];
}

const auditResults: AuditResult[] = [];

test.describe('SupportAI UI Audit', () => {
  let consoleMessages: string[] = [];
  let networkErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleMessages = [];
    networkErrors = [];

    // Listen to console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Listen to page errors
    page.on('pageerror', (error) => {
      consoleMessages.push(`[PAGE ERROR] ${error.message}`);
    });

    // Listen to failed requests
    page.on('requestfailed', (request) => {
      networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Audit: Landing Page (/)', async ({ page }) => {
    const result: AuditResult = {
      page: '/',
      timestamp: new Date().toISOString(),
      status: 0,
      errors: [],
      warnings: [],
      consoleErrors: [],
      networkErrors: [],
      accessibility: []
    };

    try {
      const response = await page.goto('/', { waitUntil: 'networkidle' });
      result.status = response?.status() || 0;

      // Check for 500 errors
      if (result.status >= 500) {
        result.errors.push(`HTTP ${result.status} error`);
      }

      // Wait for page to stabilize
      await page.waitForTimeout(2000);

      // Collect console errors
      result.consoleErrors = [...consoleMessages];
      result.networkErrors = [...networkErrors];

      // Check for missing images
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter(img => !img.complete || img.naturalHeight === 0)
          .map(img => img.src);
      });

      if (brokenImages.length > 0) {
        result.errors.push(`Broken images: ${brokenImages.join(', ')}`);
      }

      // Check for basic accessibility
      const missingAltTexts = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.alt).length;
      });

      if (missingAltTexts > 0) {
        result.accessibility.push(`${missingAltTexts} images missing alt text`);
      }

      // Take screenshot
      await page.screenshot({ path: 'test-results/screenshots/landing-page.png', fullPage: true });

    } catch (error: any) {
      result.errors.push(`Test failed: ${error.message}`);
    }

    auditResults.push(result);
    console.log(JSON.stringify(result, null, 2));
  });

  test('Audit: Dashboard Page (/dashboard)', async ({ page }) => {
    const result: AuditResult = {
      page: '/dashboard',
      timestamp: new Date().toISOString(),
      status: 0,
      errors: [],
      warnings: [],
      consoleErrors: [],
      networkErrors: [],
      accessibility: []
    };

    try {
      const response = await page.goto('/dashboard', { waitUntil: 'networkidle' });
      result.status = response?.status() || 0;

      if (result.status >= 500) {
        result.errors.push(`HTTP ${result.status} error`);
      }

      await page.waitForTimeout(2000);

      result.consoleErrors = [...consoleMessages];
      result.networkErrors = [...networkErrors];

      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter(img => !img.complete || img.naturalHeight === 0)
          .map(img => img.src);
      });

      if (brokenImages.length > 0) {
        result.errors.push(`Broken images: ${brokenImages.join(', ')}`);
      }

      await page.screenshot({ path: 'test-results/screenshots/dashboard.png', fullPage: true });

    } catch (error: any) {
      result.errors.push(`Test failed: ${error.message}`);
    }

    auditResults.push(result);
    console.log(JSON.stringify(result, null, 2));
  });

  test('Audit: Login Page (/login)', async ({ page }) => {
    const result: AuditResult = {
      page: '/login',
      timestamp: new Date().toISOString(),
      status: 0,
      errors: [],
      warnings: [],
      consoleErrors: [],
      networkErrors: [],
      accessibility: []
    };

    try {
      const response = await page.goto('/login', { waitUntil: 'networkidle' });
      result.status = response?.status() || 0;

      if (result.status >= 500) {
        result.errors.push(`HTTP ${result.status} error`);
      }

      await page.waitForTimeout(2000);

      result.consoleErrors = [...consoleMessages];
      result.networkErrors = [...networkErrors];

      await page.screenshot({ path: 'test-results/screenshots/login.png', fullPage: true });

    } catch (error: any) {
      result.errors.push(`Test failed: ${error.message}`);
    }

    auditResults.push(result);
    console.log(JSON.stringify(result, null, 2));
  });

  test.afterAll(async () => {
    const reportPath = 'test-results/ui-audit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    console.log(`\nAudit report saved to: ${reportPath}`);
  });
});
