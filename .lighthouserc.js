module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    budgets: [
      {
        path: '/*',
        timings: [
          {
            metric: 'first-contentful-paint',
            budget: 2000,
            tolerance: 100
          },
          {
            metric: 'largest-contentful-paint',
            budget: 2500,
            tolerance: 200
          },
          {
            metric: 'cumulative-layout-shift',
            budget: 0.1,
            tolerance: 0.02
          },
          {
            metric: 'total-blocking-time',
            budget: 200,
            tolerance: 50
          },
          {
            metric: 'speed-index',
            budget: 3000,
            tolerance: 300
          }
        ],
        resourceSizes: [
          {
            resourceType: 'script',
            budget: 150,
            tolerance: 20
          },
          {
            resourceType: 'image',
            budget: 500,
            tolerance: 50
          },
          {
            resourceType: 'stylesheet',
            budget: 50,
            tolerance: 10
          },
          {
            resourceType: 'font',
            budget: 100,
            tolerance: 20
          },
          {
            resourceType: 'total',
            budget: 1000,
            tolerance: 100
          }
        ],
        resourceCounts: [
          {
            resourceType: 'script',
            budget: 10
          },
          {
            resourceType: 'stylesheet',
            budget: 5
          },
          {
            resourceType: 'font',
            budget: 3
          },
          {
            resourceType: 'third-party',
            budget: 5
          }
        ]
      }
    ]
  }
};