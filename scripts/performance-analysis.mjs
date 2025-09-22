#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    log(`🔄 Executing: ${command}`, 'cyan');
    const result = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    if (options.throwOnError !== false) {
      throw error;
    }
    return null;
  }
}

function analyzeBundleSize() {
  log('\n📦 Analyzing bundle size...', 'blue');
  
  try {
    // Запускаем анализ бандла
    runCommand('npm run bundle:analyze', { silent: true });
    
    // Читаем package.json для получения информации о зависимостях
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    log(`✅ Dependencies: ${dependencies.length}`, 'green');
    log(`✅ Dev Dependencies: ${devDependencies.length}`, 'green');
    
    // Проверяем размер node_modules (приблизительно)
    try {
      const nodeModulesSize = runCommand('du -sh node_modules 2>/dev/null || echo "N/A"', { silent: true });
      log(`📁 node_modules size: ${nodeModulesSize.trim()}`, 'yellow');
    } catch {
      log(`📁 node_modules size: Unable to calculate`, 'yellow');
    }
    
    return {
      dependencies: dependencies.length,
      devDependencies: devDependencies.length,
      status: 'success'
    };
  } catch (error) {
    log(`❌ Bundle analysis failed: ${error.message}`, 'red');
    return { status: 'failed', error: error.message };
  }
}

function runLighthouseAudit() {
  log('\n🔍 Running Lighthouse audit...', 'blue');
  
  try {
    // Проверяем, запущен ли dev сервер
    try {
      runCommand('curl -f http://localhost:3000 > /dev/null 2>&1', { silent: true });
      log('✅ Dev server is running', 'green');
    } catch {
      log('⚠️  Dev server not detected, starting...', 'yellow');
      // Не запускаем сервер автоматически, так как это может конфликтовать
      log('💡 Please run "npm run dev" in another terminal first', 'cyan');
      return { status: 'skipped', reason: 'Dev server not running' };
    }
    
    // Запускаем Lighthouse
    runCommand('npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox"', { 
      silent: true, 
      throwOnError: false 
    });
    
    if (existsSync(join(projectRoot, 'lighthouse-report.json'))) {
      const report = JSON.parse(readFileSync(join(projectRoot, 'lighthouse-report.json'), 'utf8'));
      
      const scores = {
        performance: Math.round((report.categories.performance?.score || 0) * 100),
        accessibility: Math.round((report.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((report.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((report.categories.seo?.score || 0) * 100)
      };
      
      const vitals = {
        lcp: report.audits['largest-contentful-paint']?.numericValue || 0,
        cls: report.audits['cumulative-layout-shift']?.numericValue || 0,
        tbt: report.audits['total-blocking-time']?.numericValue || 0,
        fcp: report.audits['first-contentful-paint']?.numericValue || 0
      };
      
      log('📊 Lighthouse Scores:', 'bright');
      log(`  Performance: ${scores.performance}/100 ${scores.performance >= 80 ? '✅' : '❌'}`, scores.performance >= 80 ? 'green' : 'red');
      log(`  Accessibility: ${scores.accessibility}/100 ${scores.accessibility >= 90 ? '✅' : '❌'}`, scores.accessibility >= 90 ? 'green' : 'red');
      log(`  Best Practices: ${scores.bestPractices}/100 ${scores.bestPractices >= 80 ? '✅' : '❌'}`, scores.bestPractices >= 80 ? 'green' : 'red');
      log(`  SEO: ${scores.seo}/100 ${scores.seo >= 80 ? '✅' : '❌'}`, scores.seo >= 80 ? 'green' : 'red');
      
      log('\n🚀 Core Web Vitals:', 'bright');
      log(`  LCP: ${Math.round(vitals.lcp)}ms ${vitals.lcp <= 2500 ? '✅' : '❌'}`, vitals.lcp <= 2500 ? 'green' : 'red');
      log(`  CLS: ${vitals.cls.toFixed(3)} ${vitals.cls <= 0.1 ? '✅' : '❌'}`, vitals.cls <= 0.1 ? 'green' : 'red');
      log(`  TBT: ${Math.round(vitals.tbt)}ms ${vitals.tbt <= 200 ? '✅' : '❌'}`, vitals.tbt <= 200 ? 'green' : 'red');
      log(`  FCP: ${Math.round(vitals.fcp)}ms ${vitals.fcp <= 1800 ? '✅' : '❌'}`, vitals.fcp <= 1800 ? 'green' : 'red');
      
      return {
        status: 'success',
        scores,
        vitals,
        reportPath: './lighthouse-report.json'
      };
    } else {
      throw new Error('Lighthouse report not generated');
    }
  } catch (error) {
    log(`❌ Lighthouse audit failed: ${error.message}`, 'red');
    return { status: 'failed', error: error.message };
  }
}

function checkCodeQuality() {
  log('\n🔍 Checking code quality...', 'blue');
  
  const checks = {
    lint: false,
    typecheck: false,
    test: false
  };
  
  try {
    runCommand('npm run lint', { silent: true });
    checks.lint = true;
    log('✅ ESLint passed', 'green');
  } catch {
    log('❌ ESLint failed', 'red');
  }
  
  try {
    runCommand('npm run typecheck', { silent: true });
    checks.typecheck = true;
    log('✅ TypeScript check passed', 'green');
  } catch {
    log('❌ TypeScript check failed', 'red');
  }
  
  try {
    runCommand('npm run test', { silent: true });
    checks.test = true;
    log('✅ Tests passed', 'green');
  } catch {
    log('❌ Tests failed', 'red');
  }
  
  return checks;
}

function generateReport(bundleAnalysis, lighthouseResults, codeQuality) {
  log('\n📄 Generating performance report...', 'blue');
  
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      overall: 'unknown',
      issues: [],
      recommendations: []
    },
    bundleAnalysis,
    lighthouse: lighthouseResults,
    codeQuality
  };
  
  // Определяем общий статус
  let issueCount = 0;
  
  if (lighthouseResults.status === 'success') {
    if (lighthouseResults.scores.performance < 80) {
      report.summary.issues.push('Performance score below 80');
      issueCount++;
    }
    if (lighthouseResults.scores.accessibility < 90) {
      report.summary.issues.push('Accessibility score below 90');
      issueCount++;
    }
    if (lighthouseResults.vitals.lcp > 2500) {
      report.summary.issues.push('LCP exceeds 2.5s threshold');
      issueCount++;
    }
    if (lighthouseResults.vitals.cls > 0.1) {
      report.summary.issues.push('CLS exceeds 0.1 threshold');
      issueCount++;
    }
    if (lighthouseResults.vitals.tbt > 200) {
      report.summary.issues.push('TBT exceeds 200ms threshold');
      issueCount++;
    }
  }
  
  if (!codeQuality.lint) {
    report.summary.issues.push('ESLint errors detected');
    issueCount++;
  }
  if (!codeQuality.typecheck) {
    report.summary.issues.push('TypeScript errors detected');
    issueCount++;
  }
  if (!codeQuality.test) {
    report.summary.issues.push('Test failures detected');
    issueCount++;
  }
  
  // Рекомендации
  if (bundleAnalysis.dependencies > 50) {
    report.summary.recommendations.push('Consider reducing number of dependencies');
  }
  if (lighthouseResults.status === 'success' && lighthouseResults.scores.performance < 80) {
    report.summary.recommendations.push('Optimize images and reduce JavaScript bundle size');
  }
  if (lighthouseResults.status === 'success' && lighthouseResults.vitals.lcp > 2500) {
    report.summary.recommendations.push('Optimize largest contentful paint (LCP)');
  }
  
  report.summary.overall = issueCount === 0 ? 'excellent' : issueCount <= 2 ? 'good' : issueCount <= 5 ? 'needs-improvement' : 'poor';
  
  // Сохраняем отчет
  const reportPath = join(projectRoot, 'performance-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`✅ Report saved to: ${reportPath}`, 'green');
  
  // Выводим краткую сводку
  log('\n📊 Performance Summary:', 'bright');
  log(`Overall Status: ${report.summary.overall.toUpperCase()}`, report.summary.overall === 'excellent' ? 'green' : report.summary.overall === 'good' ? 'yellow' : 'red');
  
  if (report.summary.issues.length > 0) {
    log('\n⚠️  Issues Found:', 'yellow');
    report.summary.issues.forEach(issue => log(`  • ${issue}`, 'red'));
  }
  
  if (report.summary.recommendations.length > 0) {
    log('\n💡 Recommendations:', 'cyan');
    report.summary.recommendations.forEach(rec => log(`  • ${rec}`, 'cyan'));
  }
  
  return report;
}

async function main() {
  log('🚀 Starting Performance Analysis', 'bright');
  log('=====================================', 'bright');
  
  const bundleAnalysis = analyzeBundleSize();
  const lighthouseResults = runLighthouseAudit();
  const codeQuality = checkCodeQuality();
  
  const report = generateReport(bundleAnalysis, lighthouseResults, codeQuality);
  
  log('\n✅ Performance analysis complete!', 'green');
  log('=====================================', 'bright');
  
  // Возвращаем код выхода на основе результатов
  const hasErrors = report.summary.overall === 'poor' || !codeQuality.lint || !codeQuality.typecheck;
  process.exit(hasErrors ? 1 : 0);
}

main().catch(error => {
  log(`💥 Analysis failed: ${error.message}`, 'red');
  process.exit(1);
});