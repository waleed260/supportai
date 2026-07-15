import { test, expect } from '@playwright/test';
import * as fs from 'fs';

interface PageAudit {
  path: string;
  status: number;
  title: string;
  consoleErrors: string[];
  networkErrors: string[];
  brokenImages: string[];
  missingAltTexts: number;
  hasAuthRedirect: boolean;
  timestamp: string;
}

const routes = [
  '/',
  '/terms',
  '/contact',
  '/privacy',
  '/security',
  '/login',
  '/register',
  '/dashboard',
  '/dashboard/admin',
  '/dashboard/admin/agent',
  '/dashboard/admin/knowledge',
  '/dashboard/admin/team',
  '/dashboard/admin/channels',
  '/dashboard/team',
  '/dashboard/team/conversations',
  '/dashboard/super-admin',
  '/dashboard/super-admin/subscriptions',
  '/dashboard/super-admin/analytics',
  '/dashboard/super-admin/clients',
];

const auditResults: PageAudit[] = [];

test.describe('Full SupportAI UI Audit', () => {
  for (const route of routes) {
    test(`Audit: ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (error) => {
        consoleErrors.push(`PAGE ERROR: ${error.message}`);
      });

      page.on('requestfailed', (request) => {
        networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
      });

      const result: PageAudit = {
        path: route,
        status: 0,
        title: '',
        consoleErrors: [],
        networkErrors: [],
        brokenImages: [],
        missingAltTexts: 0,
        hasAuthRedirect: false,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await page.goto(`http://localhost:3000${route}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });

        result.status = response?.status() || 0;
        result.title = await page.title();

        const currentUrl = page.url();
        if (currentUrl.includes('/login') && !route.includes('/login')) {
          result.hasAuthRedirect = true;
        }

        await page.waitForTimeout(1000);

        result.consoleErrors = [...consoleErrors];
        result.networkErrors = [...networkErrors];

        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs
            .filter(img => !img.complete || img.naturalHeight === 0)
            .map(img => img.src);
        });
        result.brokenImages = brokenImages;

        const missingAlt = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.filter(img => !img.alt).length;
        });
        result.missingAltTexts = missingAlt;

        const screenshotName = route.replace(/\//g, '_') || 'home';
        await page.screenshot({
          path: `test-results/screenshots/full-${screenshotName}.png`,
          fullPage: true,
        });

      } catch (error: any) {
        result.consoleErrors.push(`Navigation failed: ${error.message}`);
      }

      auditResults.push(result);
      console.log(`✓ Audited: ${route} - Status: ${result.status}`);
    });
  }

  test.afterAll(async () => {
    const reportPath = 'test-results/full-audit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));

    console.log('\n=== FULL AUDIT SUMMARY ===');
    console.log(`Total routes audited: ${auditResults.length}`);

    const errors = auditResults.filter(r => r.consoleErrors.length > 0);
    console.log(`Routes with console errors: ${errors.length}`);

    const networkIssues = auditResults.filter(r => r.networkErrors.length > 0);
    console.log(`Routes with network errors: ${networkIssues.length}`);

    const brokenImgs = auditResults.filter(r => r.brokenImages.length > 0);
    console.log(`Routes with broken images: ${brokenImgs.length}`);

    console.log(`\nReport saved to: ${reportPath}`);
  });
});
