#!/usr/bin/env node

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import path from 'path';

console.log('🔧 Исправление проблемы SWC helpers...');

// Очистка кэшей Next.js
const cachePaths = [
  '.next',
  'node_modules/.cache',
  '.swc',
];

for (const cachePath of cachePaths) {
  if (existsSync(cachePath)) {
    console.log(`🗑️  Удаление кэша: ${cachePath}`);
    rmSync(cachePath, { recursive: true, force: true });
  }
}

console.log('✅ Кэши очищены');

// Переустановка зависимостей SWC
console.log('📦 Переустановка SWC зависимостей...');
try {
  execSync('npm uninstall @swc/core @swc/helpers', { stdio: 'inherit' });
  execSync('npm install @swc/core@latest @swc/helpers@latest', { stdio: 'inherit' });
  console.log('✅ SWC зависимости переустановлены');
} catch (error) {
  console.log('⚠️  Ошибка при переустановке SWC, продолжаем...');
}

console.log('🚀 Готово! Теперь запустите: npm run dev:standard');