#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Bundle size limits (in bytes)
const BUNDLE_LIMITS = {
  // Landing page (initial load)
  landing: {
    js: 150 * 1024, // 150KB
    css: 50 * 1024, // 50KB
    total: 200 * 1024, // 200KB
  },
  // Dashboard/app pages
  app: {
    js: 300 * 1024, // 300KB
    css: 100 * 1024, // 100KB
    total: 400 * 1024, // 400KB
  },
  // Shared chunks
  shared: {
    vendor: 200 * 1024, // 200KB
    framework: 150 * 1024, // 150KB
  },
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getPercentage(current, limit) {
  return ((current / limit) * 100).toFixed(1);
}

function getStatusColor(current, limit) {
  const percentage = current / limit;
  if (percentage > 1) return colors.red;
  if (percentage > 0.8) return colors.yellow;
  return colors.green;
}

function analyzeBuildOutput() {
  const buildOutputPath = join(projectRoot, '.next');
  
  if (!existsSync(buildOutputPath)) {
    console.log(`${colors.red}❌ Build output not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  try {
    // Run Next.js bundle analyzer
    console.log(`${colors.blue}📊 Analyzing bundle size...${colors.reset}\n`);
    
    // Generate bundle analysis
    execSync('npx next build', { 
      cwd: projectRoot, 
      stdio: 'pipe' 
    });
    
    // Parse build output for bundle sizes
    const buildOutput = execSync('npx next build --debug', { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return parseBuildOutput(buildOutput);
  } catch (error) {
    console.error(`${colors.red}❌ Failed to analyze bundle:${colors.reset}`, error.message);
    process.exit(1);
  }
}

function parseBuildOutput(output) {
  const lines = output.split('\n');
  const bundles = {};

  for (const line of lines) {
    // Parse Next.js build output
    if (line.includes('Route (app)') || line.includes('Route (pages)')) {
      continue;
    }
    
    if (line.includes('First Load JS')) {
      const match = line.match(/(\d+(?:\.\d+)?)\s*(B|kB|MB)/);
      if (match) {
        const size = parseFloat(match[1]);
        const unit = match[2];
        let bytes = size;
        
        if (unit === 'kB') bytes = size * 1024;
        if (unit === 'MB') bytes = size * 1024 * 1024;
        
        const route = line.split('│')[0]?.trim() || 'unknown';
        bundles[route] = { js: bytes, css: 0, total: bytes };
      }
    }
  }

  return bundles;
}

function checkBundleLimits(bundles) {
  console.log(`${colors.bold}${colors.cyan}📦 Bundle Size Analysis${colors.reset}\n`);
  
  let hasViolations = false;
  const violations = [];
  
  // Check each route
  for (const [route, sizes] of Object.entries(bundles)) {
    const isLanding = route === '/' || route.includes('index');
    const limits = isLanding ? BUNDLE_LIMITS.landing : BUNDLE_LIMITS.app;
    
    console.log(`${colors.bold}Route: ${route}${colors.reset}`);
    
    // Check JavaScript size
    const jsColor = getStatusColor(sizes.js, limits.js);
    const jsPercentage = getPercentage(sizes.js, limits.js);
    console.log(`  JS: ${jsColor}${formatBytes(sizes.js)}${colors.reset} (${jsPercentage}% of ${formatBytes(limits.js)} limit)`);
    
    if (sizes.js > limits.js) {
      hasViolations = true;
      violations.push({
        route,
        type: 'JavaScript',
        current: sizes.js,
        limit: limits.js,
        excess: sizes.js - limits.js,
      });
    }
    
    // Check CSS size (if available)
    if (sizes.css > 0) {
      const cssColor = getStatusColor(sizes.css, limits.css);
      const cssPercentage = getPercentage(sizes.css, limits.css);
      console.log(`  CSS: ${cssColor}${formatBytes(sizes.css)}${colors.reset} (${cssPercentage}% of ${formatBytes(limits.css)} limit)`);
      
      if (sizes.css > limits.css) {
        hasViolations = true;
        violations.push({
          route,
          type: 'CSS',
          current: sizes.css,
          limit: limits.css,
          excess: sizes.css - limits.css,
        });
      }
    }
    
    // Check total size
    const totalColor = getStatusColor(sizes.total, limits.total);
    const totalPercentage = getPercentage(sizes.total, limits.total);
    console.log(`  Total: ${totalColor}${formatBytes(sizes.total)}${colors.reset} (${totalPercentage}% of ${formatBytes(limits.total)} limit)`);
    
    if (sizes.total > limits.total) {
      hasViolations = true;
      violations.push({
        route,
        type: 'Total',
        current: sizes.total,
        limit: limits.total,
        excess: sizes.total - limits.total,
      });
    }
    
    console.log('');
  }
  
  return { hasViolations, violations };
}

function generateReport(bundles, violations) {
  const report = {
    timestamp: new Date().toISOString(),
    bundles,
    violations,
    summary: {
      totalRoutes: Object.keys(bundles).length,
      totalViolations: violations.length,
      totalSize: Object.values(bundles).reduce((sum, bundle) => sum + bundle.total, 0),
    },
  };
  
  // Save report to file
  const reportPath = join(projectRoot, 'bundle-analysis.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`${colors.blue}📄 Report saved to: ${reportPath}${colors.reset}\n`);
  
  return report;
}

function printSummary(violations) {
  if (violations.length === 0) {
    console.log(`${colors.green}✅ All bundle sizes are within limits!${colors.reset}\n`);
    return;
  }
  
  console.log(`${colors.red}❌ Bundle size violations found:${colors.reset}\n`);
  
  for (const violation of violations) {
    console.log(`${colors.red}  • ${violation.route} (${violation.type}):${colors.reset}`);
    console.log(`    Current: ${formatBytes(violation.current)}`);
    console.log(`    Limit: ${formatBytes(violation.limit)}`);
    console.log(`    Excess: ${colors.red}+${formatBytes(violation.excess)}${colors.reset}`);
    console.log('');
  }
  
  console.log(`${colors.yellow}💡 Optimization suggestions:${colors.reset}`);
  console.log('  • Use dynamic imports for non-critical code');
  console.log('  • Implement code splitting for large components');
  console.log('  • Remove unused dependencies');
  console.log('  • Optimize images and use next/image');
  console.log('  • Use tree shaking for libraries');
  console.log('  • Consider lazy loading for below-the-fold content');
  console.log('');
}

function printOptimizationTips() {
  console.log(`${colors.cyan}🚀 Bundle Optimization Tips:${colors.reset}\n`);
  
  console.log(`${colors.bold}1. Code Splitting:${colors.reset}`);
  console.log('   • Use dynamic imports: const Component = dynamic(() => import("./Component"))');
  console.log('   • Split by routes and features');
  console.log('   • Lazy load non-critical components\n');
  
  console.log(`${colors.bold}2. Dependency Optimization:${colors.reset}`);
  console.log('   • Use bundle analyzer: npm run analyze');
  console.log('   • Remove unused dependencies');
  console.log('   • Use lighter alternatives (e.g., date-fns instead of moment)\n');
  
  console.log(`${colors.bold}3. Asset Optimization:${colors.reset}`);
  console.log('   • Use next/image for automatic optimization');
  console.log('   • Implement proper caching headers');
  console.log('   • Use WebP/AVIF formats\n');
  
  console.log(`${colors.bold}4. Build Optimization:${colors.reset}`);
  console.log('   • Enable tree shaking');
  console.log('   • Use production builds');
  console.log('   • Minimize and compress assets\n');
}

// Main execution
async function main() {
  try {
    console.log(`${colors.bold}${colors.magenta}🔍 Bundle Size Analyzer${colors.reset}\n`);
    
    const bundles = analyzeBuildOutput();
    const { hasViolations, violations } = checkBundleLimits(bundles);
    generateReport(bundles, violations);
    
    printSummary(violations);
    
    if (process.argv.includes('--tips')) {
      printOptimizationTips();
    }
    
    // Exit with error code if violations found
    if (hasViolations) {
      console.log(`${colors.red}❌ Bundle analysis failed due to size violations.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Bundle analysis passed!${colors.reset}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Bundle analysis failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}