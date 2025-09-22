module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/admin',
        'http://localhost:3000/test-vitals',
      ],
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
    assert: {
      assertions: {
        // Performance Budget
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'metrics:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'metrics:total-blocking-time': ['error', { maxNumericValue: 200 }],
        'metrics:first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'metrics:speed-index': ['error', { maxNumericValue: 3400 }],
        'metrics:time-to-first-byte': ['warn', { maxNumericValue: 800 }],
        
        // Resource Budget
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }], // 300KB JS
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }], // 50KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 500000 }], // 500KB images
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }], // 100KB fonts
        'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB total
        
        // Network Budget
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        'resource-summary:image:count': ['warn', { maxNumericValue: 20 }],
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 5 }],
        
        // Security & Best Practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
        'hreflang': 'warn',
        
        // Progressive Web App
        'installable-manifest': 'off',
        'splash-screen': 'off',
        'themed-omnibox': 'off',
        'content-width': 'error',
        'viewport': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports',
    },
  },
};