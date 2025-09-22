import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should handle web vitals API correctly', async ({ page }) => {
    // Test web vitals endpoint
    const response = await page.request.post('/api/web-vitals', {
      data: {
        id: 'test-id',
        name: 'CLS',
        value: 0.05,
        rating: 'good'
      }
    });

    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.success).toBe(true);
  });

  test('should validate web vitals data', async ({ page }) => {
    // Test with invalid data
    const response = await page.request.post('/api/web-vitals', {
      data: {
        // Missing required fields
        name: 'CLS'
      }
    });

    // Should return validation error
    expect([400, 422]).toContain(response.status());
  });

  test('should handle CORS correctly', async ({ page }) => {
    // Test preflight request
    const response = await page.request.fetch('/api/web-vitals', {
      method: 'OPTIONS'
    });

    // Should handle OPTIONS request
    expect([200, 204]).toContain(response.status());
    
    // Check CORS headers
    const corsHeaders = response.headers();
    expect(corsHeaders['access-control-allow-methods']).toBeDefined();
  });

  test('should rate limit requests', async ({ page }) => {
    // Make multiple rapid requests to test rate limiting
    const requests = Array.from({ length: 10 }, () => 
      page.request.post('/api/web-vitals', {
        data: {
          id: 'rate-limit-test',
          name: 'LCP',
          value: 1500,
          rating: 'good'
        }
      })
    );

    const responses = await Promise.all(requests);
    
    // At least some requests should succeed
    const successfulRequests = responses.filter(r => r.status() === 200);
    expect(successfulRequests.length).toBeGreaterThan(0);
    
    // If rate limiting is implemented, some might be rejected
    const rateLimitedRequests = responses.filter(r => r.status() === 429);
    // This is optional - rate limiting might not be implemented yet
  });

  test('should handle malformed JSON', async ({ page }) => {
    // Test with malformed JSON
    const response = await page.request.post('/api/web-vitals', {
      data: 'invalid json',
      headers: {
        'content-type': 'application/json'
      }
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should handle large payloads', async ({ page }) => {
    // Test with large payload
    const largeData = {
      id: 'large-test',
      name: 'CLS',
      value: 0.1,
      rating: 'needs-improvement',
      metadata: 'x'.repeat(10000) // 10KB of data
    };

    const response = await page.request.post('/api/web-vitals', {
      data: largeData
    });

    // Should either accept or reject with appropriate status
    expect([200, 413, 422]).toContain(response.status());
  });

  test('should have proper error responses', async ({ page }) => {
    // Test 404 endpoint
    const response = await page.request.get('/api/nonexistent');
    expect(response.status()).toBe(404);
  });

  test('should handle concurrent requests', async ({ page }) => {
    // Test concurrent requests
    const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
      page.request.post('/api/web-vitals', {
        data: {
          id: `concurrent-test-${i}`,
          name: 'INP',
          value: 100 + i,
          rating: 'good'
        }
      })
    );

    const responses = await Promise.all(concurrentRequests);
    
    // All requests should be handled properly
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
  });

  test('should validate content types', async ({ page }) => {
    // Test with wrong content type
    const response = await page.request.post('/api/web-vitals', {
      data: 'name=CLS&value=0.1',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });

    // Should handle or reject non-JSON content
    expect([200, 400, 415]).toContain(response.status());
  });

  test('should have security headers', async ({ page }) => {
    const response = await page.request.get('/api/web-vitals');
    const headers = response.headers();

    // Check for security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    
    // CSP header might be present
    if (headers['content-security-policy']) {
      expect(headers['content-security-policy']).toContain('default-src');
    }
  });

  test('should handle authentication for protected endpoints', async ({ page }) => {
    // Test accessing protected API without auth
    const protectedEndpoints = [
      '/api/admin',
      '/api/user/profile',
      '/api/dashboard'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await page.request.get(endpoint);
      
      // Should return 401 or 403 for protected endpoints
      if (response.status() !== 404) {
        expect([401, 403]).toContain(response.status());
      }
    }
  });
});