#!/usr/bin/env node

import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';
import path from 'path';


// Performance budgets
const PERFORMANCE_BUDGETS = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
  webVitals: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 800
  }
};

async function runLighthouse(url, options = {}) {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  
  const lighthouseOptions = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    ...options
  };

  const runnerResult = await lighthouse(url, lighthouseOptions);
  await chrome.kill();

  return runnerResult;
}

function analyzeResults(lhr) {
  const scores = {
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100)
  };

  const webVitals = {
    lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
    fid: lhr.audits['max-potential-fid']?.numericValue || 0,
    cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
    ttfb: lhr.audits['server-response-time']?.numericValue || 0
  };

  const budgetViolations = [];

  // Check score budgets
  Object.entries(PERFORMANCE_BUDGETS).forEach(([category, budget]) => {
    if (typeof budget === 'number' && scores[category] < budget) {
      budgetViolations.push({
        type: 'score',
        category,
        actual: scores[category],
        budget,
        violation: budget - scores[category]
      });
    }
  });

  // Check Web Vitals budgets
  Object.entries(PERFORMANCE_BUDGETS.webVitals).forEach(([metric, budget]) => {
    if (webVitals[metric] > budget) {
      budgetViolations.push({
        type: 'webvital',
        metric,
        actual: webVitals[metric],
        budget,
        violation: webVitals[metric] - budget
      });
    }
  });

  return {
    scores,
    webVitals,
    budgetViolations,
    opportunities: lhr.audits,
    diagnostics: lhr.audits
  };
}

function generateReport(results, url) {
  const timestamp = new Date().toISOString();
  
  console.log('\n🚀 Performance Audit Report');
  console.log('================================');
  console.log(`URL: ${url}`);
  console.log(`Timestamp: ${timestamp}\n`);

  // Scores
  console.log('📊 Lighthouse Scores:');
  Object.entries(results.scores).forEach(([category, score]) => {
    const emoji = score >= 90 ? '🟢' : score >= 75 ? '🟡' : '🔴';
    const budget = PERFORMANCE_BUDGETS[category];
    const status = score >= budget ? 'PASS' : 'FAIL';
    console.log(`  ${emoji} ${category}: ${score}/100 (${status})`);
  });

  // Web Vitals
  console.log('\n⚡ Core Web Vitals:');
  Object.entries(results.webVitals).forEach(([metric, value]) => {
    const budget = PERFORMANCE_BUDGETS.webVitals[metric];
    const emoji = value <= budget ? '🟢' : value <= budget * 1.5 ? '🟡' : '🔴';
    const status = value <= budget ? 'PASS' : 'FAIL';
    const unit = metric === 'cls' ? '' : 'ms';
    console.log(`  ${emoji} ${metric.toUpperCase()}: ${Math.round(value)}${unit} (${status})`);
  });

  // Budget violations
  if (results.budgetViolations.length > 0) {
    console.log('\n❌ Budget Violations:');
    results.budgetViolations.forEach(violation => {
      if (violation.type === 'score') {
        console.log(`  • ${violation.category}: ${violation.actual} (budget: ${violation.budget}, violation: -${violation.violation})`);
      } else {
        console.log(`  • ${violation.metric}: ${Math.round(violation.actual)}ms (budget: ${violation.budget}ms, violation: +${Math.round(violation.violation)}ms)`);
      }
    });
  } else {
    console.log('\n✅ All performance budgets met!');
  }

  // Key opportunities
  console.log('\n🔧 Key Opportunities:');
  const opportunities = [
    'unused-css-rules',
    'unused-javascript',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'modern-image-formats',
    'uses-optimized-images'
  ];

  opportunities.forEach(auditId => {
    const audit = results.opportunities[auditId];
    if (audit && audit.score < 1 && audit.details?.overallSavingsMs > 100) {
      console.log(`  • ${audit.title}: ${Math.round(audit.details.overallSavingsMs)}ms potential savings`);
    }
  });

  return {
    timestamp,
    url,
    ...results,
    passed: results.budgetViolations.length === 0
  };
}

async function main() {
  const url = process.argv[2] || 'http://localhost:3000';
  const outputPath = process.argv[3] || './lighthouse-report.json';

  console.log(`🔍 Running Lighthouse audit on ${url}...`);

  try {
    const result = await runLighthouse(url);
    const analysis = analyzeResults(result.lhr);
    const report = generateReport(analysis, url);

    // Save detailed report
    const reportPath = path.resolve(outputPath);
    fs.writeFileSync(reportPath, JSON.stringify({
      ...report,
      fullLighthouseReport: result.lhr
    }, null, 2));

    console.log(`\n📄 Full report saved to: ${reportPath}`);

    // Exit with error code if budgets violated
    if (!report.passed) {
      console.log('\n❌ Performance audit failed - budget violations detected');
      process.exit(1);
    } else {
      console.log('\n✅ Performance audit passed - all budgets met');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    process.exit(1);
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runLighthouse, analyzeResults, generateReport };