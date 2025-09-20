# Performance Guide

## Overview

This application is optimized for production-level performance with comprehensive monitoring, optimization strategies, and automated testing.

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: ≤ 2.5s
- **FID (First Input Delay)**: ≤ 100ms  
- **CLS (Cumulative Layout Shift)**: ≤ 0.1
- **TTFB (Time to First Byte)**: ≤ 800ms
- **INP (Interaction to Next Paint)**: ≤ 200ms

### Lighthouse Scores
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 95

### Bundle Sizes
- **Initial JS (Landing)**: ≤ 150KB
- **Initial JS (Dashboard)**: ≤ 300KB
- **Total Bundle**: ≤ 1MB

## Performance Features

### 1. Streaming SSR & Suspense
- Smart Suspense boundaries for optimal loading
- Streaming responses for faster TTFB
- Progressive hydration

### 2. Image Optimization
- WebP/AVIF format support
- Responsive images with srcset
- Priority hints for above-the-fold images
- Lazy loading for below-the-fold content

### 3. Route Optimization
- Intelligent prefetching
- Code splitting by routes
- Dynamic imports for heavy components

### 4. Monitoring & Analytics
- Real-time Web Vitals tracking
- Performance dashboard (dev mode)
- Bundle analysis tools
- Lighthouse CI integration

## Development Commands

```bash
# Development with performance monitoring
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
npm run test:watch
npm run e2e

# Performance auditing
npm run perf:audit
npm run perf:audit:ci

# Bundle analysis
npm run bundle:analyze

# Production build
npm run build
npm run start
```

## Performance Monitoring

### Development Dashboard
In development mode, the performance dashboard is automatically enabled and shows:
- Real-time Web Vitals
- Image optimization status
- Route performance metrics
- Streaming SSR status

### Production Monitoring
Configure these environment variables for production monitoring:
```env
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_WEB_VITALS_REPORTING=true
SENTRY_DSN=your-sentry-dsn
```

## Optimization Strategies

### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. Font Optimization
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});
```

### 4. Caching Strategy
- Static assets: 1 year cache
- API responses: Appropriate cache headers
- CDN integration for global distribution

## Performance Budgets

The application enforces strict performance budgets:

### Lighthouse CI
```yaml
# .lighthouserc.js
budgets: [
  {
    path: '/*',
    timings: [
      { metric: 'first-contentful-paint', budget: 2000 },
      { metric: 'largest-contentful-paint', budget: 2500 },
      { metric: 'cumulative-layout-shift', budget: 0.1 },
      { metric: 'total-blocking-time', budget: 200 }
    ],
    resourceSizes: [
      { resourceType: 'script', budget: 150 },
      { resourceType: 'total', budget: 1000 }
    ]
  }
]
```

### Bundle Analysis
Run `npm run bundle:analyze` to:
- Identify large dependencies
- Find duplicate code
- Optimize import strategies
- Track bundle size over time

## Troubleshooting

### Common Performance Issues

1. **Large Bundle Size**
   - Use dynamic imports for heavy components
   - Optimize dependencies
   - Remove unused code

2. **Slow LCP**
   - Optimize above-the-fold images
   - Reduce render-blocking resources
   - Use streaming SSR

3. **High CLS**
   - Set explicit dimensions for images
   - Avoid dynamic content insertion
   - Use skeleton loaders

4. **Poor FID/INP**
   - Reduce JavaScript execution time
   - Use web workers for heavy computations
   - Optimize event handlers

### Performance Debugging

1. **Use Performance Dashboard**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Performance dashboard appears in dev mode
   ```

2. **Run Lighthouse Audit**
   ```bash
   npm run perf:audit
   ```

3. **Analyze Bundle**
   ```bash
   npm run bundle:analyze
   ```

4. **Check Web Vitals**
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Performance Audit
  run: |
    npm run build
    npm run start &
    sleep 10
    npm run perf:audit
    kill %1
```

### Performance Gates
The CI pipeline fails if:
- Lighthouse scores below thresholds
- Bundle size exceeds limits
- Web Vitals violate budgets
- Accessibility issues detected

## Best Practices

1. **Always measure before optimizing**
2. **Use the performance dashboard during development**
3. **Run performance audits before deployment**
4. **Monitor real user metrics in production**
5. **Keep dependencies minimal and up-to-date**
6. **Use appropriate caching strategies**
7. **Optimize for mobile-first**
8. **Test on real devices and networks**

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)