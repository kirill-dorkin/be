#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Performance budgets (в KB)
const PERFORMANCE_BUDGETS = {
  // Лендинг страницы
  landing: {
    initialJS: 150,
    totalJS: 300,
    css: 50,
    images: 500,
  },
  // Кабинет пользователя
  dashboard: {
    initialJS: 300,
    totalJS: 600,
    css: 100,
    images: 1000,
  },
};

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatSizeKB(bytes) {
  return Math.round(bytes / 1024);
}

function getStatus(actual, budget) {
  const ratio = actual / budget;
  if (ratio <= 0.8) return { status: 'good', color: colors.green };
  if (ratio <= 1.0) return { status: 'warning', color: colors.yellow };
  return { status: 'error', color: colors.red };
}

function analyzeNextJSBuild() {
  console.log(`${colors.bright}${colors.blue}📊 Bundle Size Analysis${colors.reset}\n`);

  try {
    // Проверяем, что build существует
    const buildDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildDir)) {
      console.log(`${colors.yellow}⚠️  Build directory not found. Running build...${colors.reset}`);
      execSync('npm run build', { stdio: 'inherit' });
    }

    // Анализируем статические файлы
    const staticDir = path.join(buildDir, 'static');
    const chunksDir = path.join(staticDir, 'chunks');
    const cssDir = path.join(staticDir, 'css');

    let totalJS = 0;
    let totalCSS = 0;
    let initialJS = 0;

    // Анализируем JS chunks
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir);
      
      console.log(`${colors.bright}JavaScript Chunks:${colors.reset}`);
      chunks
        .filter(file => file.endsWith('.js'))
        .forEach(file => {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = formatSizeKB(stats.size);
          
          totalJS += stats.size;
          
          // Определяем критичные chunks (main, framework, etc.)
          const isCritical = file.includes('main') || 
                           file.includes('framework') || 
                           file.includes('webpack') ||
                           file.includes('polyfills');
          
          if (isCritical) {
            initialJS += stats.size;
          }

          const criticalMark = isCritical ? '🔥' : '  ';
          console.log(`  ${criticalMark} ${file}: ${formatSize(stats.size)} (${sizeKB} KB)`);
        });
    }

    // Анализируем CSS
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      
      console.log(`\n${colors.bright}CSS Files:${colors.reset}`);
      cssFiles
        .filter(file => file.endsWith('.css'))
        .forEach(file => {
          const filePath = path.join(cssDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = formatSizeKB(stats.size);
          
          totalCSS += stats.size;
          console.log(`    ${file}: ${formatSize(stats.size)} (${sizeKB} KB)`);
        });
    }

    // Анализируем pages
    const pagesDir = path.join(buildDir, 'server', 'pages');
    if (fs.existsSync(pagesDir)) {
      console.log(`\n${colors.bright}Page Bundles:${colors.reset}`);
      
      function analyzePagesRecursive(dir, prefix = '') {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            analyzePagesRecursive(itemPath, `${prefix}${item}/`);
          } else if (item.endsWith('.js')) {
            const sizeKB = formatSizeKB(stats.size);
            console.log(`    ${prefix}${item}: ${formatSize(stats.size)} (${sizeKB} KB)`);
          }
        });
      }
      
      analyzePagesRecursive(pagesDir);
    }

    // Проверяем performance budgets
    console.log(`\n${colors.bright}${colors.magenta}Performance Budget Analysis:${colors.reset}\n`);

    const initialJSKB = formatSizeKB(initialJS);
    const totalJSKB = formatSizeKB(totalJS);
    const totalCSSKB = formatSizeKB(totalCSS);

    // Анализ для лендинга
    console.log(`${colors.bright}Landing Page Budget:${colors.reset}`);
    
    const landingInitialStatus = getStatus(initialJSKB, PERFORMANCE_BUDGETS.landing.initialJS);
    const landingTotalStatus = getStatus(totalJSKB, PERFORMANCE_BUDGETS.landing.totalJS);
    const landingCSSStatus = getStatus(totalCSSKB, PERFORMANCE_BUDGETS.landing.css);

    console.log(`  Initial JS: ${landingInitialStatus.color}${initialJSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.landing.initialJS} KB (${landingInitialStatus.status})`);
    console.log(`  Total JS:   ${landingTotalStatus.color}${totalJSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.landing.totalJS} KB (${landingTotalStatus.status})`);
    console.log(`  CSS:        ${landingCSSStatus.color}${totalCSSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.landing.css} KB (${landingCSSStatus.status})`);

    // Анализ для кабинета
    console.log(`\n${colors.bright}Dashboard Budget:${colors.reset}`);
    
    const dashboardInitialStatus = getStatus(initialJSKB, PERFORMANCE_BUDGETS.dashboard.initialJS);
    const dashboardTotalStatus = getStatus(totalJSKB, PERFORMANCE_BUDGETS.dashboard.totalJS);
    const dashboardCSSStatus = getStatus(totalCSSKB, PERFORMANCE_BUDGETS.dashboard.css);

    console.log(`  Initial JS: ${dashboardInitialStatus.color}${initialJSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.dashboard.initialJS} KB (${dashboardInitialStatus.status})`);
    console.log(`  Total JS:   ${dashboardTotalStatus.color}${totalJSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.dashboard.totalJS} KB (${dashboardTotalStatus.status})`);
    console.log(`  CSS:        ${dashboardCSSStatus.color}${totalCSSKB} KB${colors.reset} / ${PERFORMANCE_BUDGETS.dashboard.css} KB (${dashboardCSSStatus.status})`);

    // Рекомендации
    console.log(`\n${colors.bright}${colors.cyan}Recommendations:${colors.reset}`);

    if (landingInitialStatus.status === 'error' || dashboardInitialStatus.status === 'error') {
      console.log(`  ${colors.red}❌ Initial JS bundle is too large${colors.reset}`);
      console.log(`     - Consider code splitting with dynamic imports`);
      console.log(`     - Move non-critical code to separate chunks`);
      console.log(`     - Use Next.js dynamic imports for heavy components`);
    }

    if (landingTotalStatus.status === 'error' || dashboardTotalStatus.status === 'error') {
      console.log(`  ${colors.red}❌ Total JS bundle is too large${colors.reset}`);
      console.log(`     - Analyze dependencies with 'npm run analyze'`);
      console.log(`     - Remove unused dependencies`);
      console.log(`     - Consider lighter alternatives for heavy libraries`);
    }

    if (landingCSSStatus.status === 'error' || dashboardCSSStatus.status === 'error') {
      console.log(`  ${colors.red}❌ CSS bundle is too large${colors.reset}`);
      console.log(`     - Enable CSS purging in production`);
      console.log(`     - Use CSS modules or styled-components for better tree-shaking`);
      console.log(`     - Consider critical CSS extraction`);
    }

    if (landingInitialStatus.status === 'good' && 
        landingTotalStatus.status === 'good' && 
        landingCSSStatus.status === 'good' &&
        dashboardInitialStatus.status === 'good' && 
        dashboardTotalStatus.status === 'good' && 
        dashboardCSSStatus.status === 'good') {
      console.log(`  ${colors.green}✅ All bundles are within performance budgets!${colors.reset}`);
    }

    // Общая статистика
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total JavaScript: ${formatSize(totalJS)} (${totalJSKB} KB)`);
    console.log(`  Initial JavaScript: ${formatSize(initialJS)} (${initialJSKB} KB)`);
    console.log(`  Total CSS: ${formatSize(totalCSS)} (${totalCSSKB} KB)`);

  } catch (error) {
    console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Запускаем анализ
analyzeNextJSBuild();