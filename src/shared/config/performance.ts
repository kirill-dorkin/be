// Performance configuration
export const performanceConfig = {
  // Web Vitals thresholds
  webVitals: {
    lcp: {
      good: 2500,
      needsImprovement: 4000
    },
    inp: {
      good: 200,
      needsImprovement: 500
    },
    cls: {
      good: 0.1,
      needsImprovement: 0.25
    },
    ttfb: {
      good: 800,
      needsImprovement: 1800
    }
  },

  // Image optimization settings
  images: {
    formats: ['webp', 'avif', 'jpeg'],
    quality: 85,
    sizes: [320, 640, 768, 1024, 1280, 1920],
    lazyLoading: true,
    placeholder: 'blur',
    priority: {
      aboveFold: 3,
      hero: 1
    }
  },

  // Route optimization settings
  routes: {
    prefetch: {
      enabled: true,
      strategy: 'viewport', // 'viewport' | 'hover' | 'immediate'
      threshold: 0.1, // Intersection threshold
      delay: 100 // Hover delay in ms
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 50 // Max cached routes
    }
  },

  // Streaming SSR settings
  streaming: {
    enabled: true,
    chunkSize: 16384, // 16KB
    maxConcurrentStreams: 10,
    timeout: 5000,
    progressiveHydration: {
      enabled: true,
      strategy: 'viewport', // 'viewport' | 'idle' | 'immediate'
      priority: {
        high: 0,
        medium: 100,
        low: 1000
      }
    }
  },

  // Monitoring settings
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    realTime: true,
    sampleRate: 1.0, // 100% in development, should be lower in production
    reportInterval: 5000, // 5 seconds
    enableConsoleLogging: process.env.NODE_ENV === 'development'
  },

  // Bundle optimization
  bundle: {
    maxInitialSize: 150000, // 150KB for landing pages
    maxAsyncSize: 300000, // 300KB for app pages
    enableAnalyzer: process.env.ANALYZE === 'true',
    enableTreeShaking: true,
    enableMinification: process.env.NODE_ENV === 'production'
  },

  // Security headers for performance
  security: {
    csp: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"]
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  performanceConfig.monitoring.sampleRate = 0.1; // 10% in production
  performanceConfig.monitoring.enableConsoleLogging = false;
  performanceConfig.streaming.progressiveHydration.enabled = true;
}

// Feature flags
export const featureFlags = {
  enablePerformanceDashboard: process.env.NODE_ENV === 'development',
  enableImageOptimization: true,
  enableRouteOptimization: true,
  enableStreamingSSR: true,
  enableProgressiveHydration: true,
  enableServiceWorker: process.env.NODE_ENV === 'production',
  enableOfflineSupport: false
};

// Performance budgets
export const performanceBudgets = {
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95
  },
  webVitals: {
    lcp: 2500,
    inp: 200,
    cls: 0.1,
    ttfb: 800
  },
  bundle: {
    initial: 150000, // 150KB
    async: 300000,   // 300KB
    css: 50000,      // 50KB
    images: 1000000  // 1MB total
  }
};

export default performanceConfig;