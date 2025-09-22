#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Пропускаем node_modules и .next
      if (!['node_modules', '.next', '.git'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Функция для обновления импортов в файле
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Заменяем импорты из @/components/ui на @/shared/ui
    const oldPattern = /from ['"]@\/components\/ui\//g;
    const newPattern = 'from "@/shared/ui/';
    
    if (content.match(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
      updated = true;
    }
    
    // Также заменяем import { ... } from '@/components/ui/...'
    const importPattern = /import\s*{([^}]+)}\s*from\s*['"]@\/components\/ui\/([^'"]+)['"]/g;
    content = content.replace(importPattern, (match, imports, modulePath) => {
      updated = true;
      return `import {${imports}} from "@/shared/ui/${modulePath}"`;
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🔄 Fixing imports from @/components/ui to @/shared/ui...\n');
  
  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found!');
    process.exit(1);
  }
  
  const files = findFiles(srcDir);
  let updatedCount = 0;
  
  files.forEach(file => {
    if (updateImports(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\n✨ Fixed imports in ${updatedCount} files!`);
  
  if (updatedCount > 0) {
    console.log('\n🔄 Running TypeScript check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed!');
    } catch (error) {
      console.log('⚠️  TypeScript check failed, but imports were updated.');
    }
  }
}

main();