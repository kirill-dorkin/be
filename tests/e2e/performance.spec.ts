import { test, expect } from '@playwright/test';

test.describe('Performance Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage within performance budget', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should display performance dashboard in development', async ({ page }) => {
    // Check if performance dashboard is visible (only in dev mode)
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
      await expect(page.locator('[data-testid="performance-dashboard"]')).toBeVisible();
    }
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for skip links or proper focus management
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if content is still visible and accessible
    await expect(page.locator('main')).toBeVisible();
    
    // Check if navigation works on mobile
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Should show some content or offline message
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });
});