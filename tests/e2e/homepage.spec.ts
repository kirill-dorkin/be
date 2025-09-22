import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage content correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/BE\.KG/);

    // Check main heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Check main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      // Test navigation links
      const navLinks = nav.locator('a');
      const count = await navLinks.count();
      
      if (count > 0) {
        // Check first navigation link
        const firstLink = navLinks.first();
        await expect(firstLink).toBeVisible();
        
        // Ensure link has href
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty for decorative images, but should be present
      expect(alt).not.toBeNull();
    }

    // Check for proper form labels if forms exist
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        // Input should have either a label, aria-label, or aria-labelledby
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test skip links if they exist
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await skipLink.first().click();
      
      // Check if main content is focused
      const main = page.locator('main, #main, #content');
      if (await main.count() > 0) {
        await expect(main.first()).toBeFocused();
      }
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_FAILED')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check meta viewport
    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveAttribute('content', /width=device-width/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveAttribute('content', /.+/);
    }

    const ogDescription = page.locator('meta[property="og:description"]');
    if (await ogDescription.count() > 0) {
      await expect(ogDescription).toHaveAttribute('content', /.+/);
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check if content is still visible
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(main).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await expect(main).toBeVisible();
  });
});