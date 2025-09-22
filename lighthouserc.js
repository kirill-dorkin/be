module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/admin/dashboard',
        'http://localhost:3000/worker/my-tasks',
        'http://localhost:3000/request'
      ],
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        budgets: require('./performance-budget.json').budgets,
      },
    },
    assert: require('./performance-budget.json').assertions,
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

// Конфигурация для разных окружений
if (process.env.CI) {
  // В CI используем более строгие настройки
  module.exports.ci.assert.assertions['categories:performance'][1].minScore = 0.95;
  module.exports.ci.assert.assertions['largest-contentful-paint'][1].maxNumericValue = 2000;
  module.exports.ci.assert.assertions['total-blocking-time'][1].maxNumericValue = 150;
  
  // В CI сохраняем результаты в временную папку
  module.exports.ci.upload.outputDir = './tmp/lighthouse-results';
}

// Конфигурация для dashboard страниц (более мягкие лимиты)
const dashboardConfig = {
  ...module.exports,
  ci: {
    ...module.exports.ci,
    assert: {
      ...module.exports.ci.assert,
      assertions: {
        ...module.exports.ci.assert.assertions,
        // Увеличенные лимиты для dashboard
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }], // 300KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }], // 100KB
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
  },
};

// Экспорт конфигураций
module.exports.dashboardConfig = dashboardConfig;