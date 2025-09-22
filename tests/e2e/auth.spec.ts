import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in options', async ({ page }) => {
    // Look for sign in button or link
    const signInButton = page.locator('button:has-text("Sign in"), a:has-text("Sign in"), button:has-text("Login"), a:has-text("Login")');
    
    if (await signInButton.count() > 0) {
      await expect(signInButton.first()).toBeVisible();
      
      // Click sign in button
      await signInButton.first().click();
      
      // Should navigate to auth page or show auth modal
      await page.waitForTimeout(1000);
      
      // Check if we're on auth page or modal is visible
      const authPage = page.url().includes('/auth') || page.url().includes('/login') || page.url().includes('/signin');
      const authModal = await page.locator('[role="dialog"], .modal, [data-testid*="auth"], [data-testid*="login"]').count() > 0;
      
      expect(authPage || authModal).toBeTruthy();
    }
  });

  test('should handle OAuth providers', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/api/auth/signin');
    
    // Check for OAuth provider buttons
    const providers = [
      'Google',
      'GitHub', 
      'Discord',
      'Twitter',
      'Facebook'
    ];

    for (const provider of providers) {
      const providerButton = page.locator(`button:has-text("${provider}"), a:has-text("${provider}")`);
      
      if (await providerButton.count() > 0) {
        await expect(providerButton.first()).toBeVisible();
        
        // Check if button has proper href or onclick
        const href = await providerButton.first().getAttribute('href');
        const onclick = await providerButton.first().getAttribute('onclick');
        
        expect(href || onclick).toBeTruthy();
      }
    }
  });

  test('should handle sign out', async ({ page }) => {
    // This test assumes user might be signed in
    // Look for sign out button
    const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out"), button:has-text("Logout"), a:has-text("Logout")');
    
    if (await signOutButton.count() > 0) {
      await expect(signOutButton.first()).toBeVisible();
      
      // Click sign out
      await signOutButton.first().click();
      
      // Should redirect or show confirmation
      await page.waitForTimeout(1000);
      
      // Check if signed out (sign in button should be visible again)
      const signInButton = page.locator('button:has-text("Sign in"), a:has-text("Sign in")');
      if (await signInButton.count() > 0) {
        await expect(signInButton.first()).toBeVisible();
      }
    }
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected routes
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/admin'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should either redirect to auth or show 404/403
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/auth') || 
                          currentUrl.includes('/login') || 
                          currentUrl.includes('/signin') ||
                          currentUrl !== `${page.url().split('/').slice(0, 3).join('/')}${route}`;
      
      const hasErrorMessage = await page.locator('text=/unauthorized|forbidden|access denied|sign in/i').count() > 0;
      const is404 = await page.locator('text=/404|not found/i').count() > 0;
      
      // Route should be protected (redirected, show error, or 404)
      expect(isRedirected || hasErrorMessage || is404).toBeTruthy();
    }
  });

  test('should handle CSRF protection', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/api/auth/signin');
    
    // Check for CSRF token in forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      
      // Look for CSRF token input
      const csrfInput = form.locator('input[name*="csrf"], input[name*="token"], input[type="hidden"]');
      
      if (await csrfInput.count() > 0) {
        const csrfValue = await csrfInput.first().getAttribute('value');
        expect(csrfValue).toBeTruthy();
        expect(csrfValue?.length).toBeGreaterThan(10);
      }
    }
  });

  test('should have secure session handling', async ({ page, context }) => {
    // Check for secure cookie settings
    await page.goto('/api/auth/signin');
    
    // Get all cookies
    const cookies = await context.cookies();
    
    // Check session cookies for security flags
    const sessionCookies = cookies.filter(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('next-auth')
    );

    for (const cookie of sessionCookies) {
      // Session cookies should be httpOnly and secure in production
      if (process.env.NODE_ENV === 'production') {
        expect(cookie.httpOnly).toBeTruthy();
        expect(cookie.secure).toBeTruthy();
      }
      
      // Should have sameSite protection
      expect(['Strict', 'Lax']).toContain(cookie.sameSite);
    }
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Test invalid auth callback
    await page.goto('/api/auth/callback/invalid-provider');
    
    // Should show error page or redirect with error
    const hasError = await page.locator('text=/error|invalid|failed/i').count() > 0;
    const isRedirected = page.url().includes('/error') || page.url().includes('error=');
    
    expect(hasError || isRedirected).toBeTruthy();
  });

  test('should validate auth API endpoints', async ({ page }) => {
    // Test auth configuration endpoint
    const response = await page.request.get('/api/auth/providers');
    expect(response.status()).toBe(200);
    
    const providers = await response.json();
    expect(providers).toBeDefined();
    expect(typeof providers).toBe('object');
  });
});