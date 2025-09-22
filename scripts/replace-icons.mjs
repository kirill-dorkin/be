#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Маппинг старых иконок на новые
const iconMapping = {
  'RiDeleteBin6Line': 'Icons.delete',
  'GrView': 'Icons.view',
  'FaStar': 'Icons.star',
  'TbPhotoCirclePlus': 'Icons.imageAdd',
  'RxHamburgerMenu': 'Icons.menu',
  'MdRemoveRedEye': 'Icons.view',
  'FaInstagram': 'Icons.instagram',
  'FaPhone': 'Icons.phone',
  'MdOutlineEdit': 'Icons.edit',
  'FaTrendingUp': 'Icons.trending',
  'FaClock': 'Icons.clock',
  'FaAward': 'Icons.award',
  'FaShoppingCart': 'Icons.cart',
};

// Паттерны импортов для удаления
const importPatterns = [
  /import\s*{\s*[^}]*\s*}\s*from\s*['"]react-icons\/[^'"]*['"];?\s*\n?/g,
  /import\s*{\s*[^}]*RiDeleteBin6Line[^}]*\s*}\s*from\s*['"]react-icons\/ri['"];?\s*\n?/g,
  /import\s*{\s*[^}]*GrView[^}]*\s*}\s*from\s*['"]react-icons\/gr['"];?\s*\n?/g,
  /import\s*{\s*[^}]*TbPhotoCirclePlus[^}]*\s*}\s*from\s*['"]react-icons\/tb['"];?\s*\n?/g,
  /import\s*{\s*[^}]*MdRemoveRedEye[^}]*\s*}\s*from\s*['"]react-icons\/md['"];?\s*\n?/g,
  /import\s*{\s*[^}]*MdOutlineEdit[^}]*\s*}\s*from\s*['"]react-icons\/md['"];?\s*\n?/g,
];

async function replaceIconsInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Проверяем, есть ли импорты react-icons
    if (!content.includes('react-icons')) {
      return;
    }

    console.log(`Processing: ${filePath}`);

    // Добавляем импорт Icons если его нет
    if (!content.includes("import { Icons } from '@/shared/ui/icons'")) {
      // Находим последний импорт и добавляем после него
      const importMatch = content.match(/import[^;]+;/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + "\nimport { Icons } from '@/shared/ui/icons';");
        hasChanges = true;
      }
    }

    // Заменяем использования иконок
    Object.entries(iconMapping).forEach(([oldIcon, newIcon]) => {
      const regex = new RegExp(`<${oldIcon}\\s*([^>]*)\\s*/>`, 'g');
      if (content.includes(oldIcon)) {
        content = content.replace(regex, `<${newIcon} $1/>`);
        hasChanges = true;
      }
    });

    // Удаляем импорты react-icons
    importPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        hasChanges = true;
      }
    });

    if (hasChanges) {
      writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function main() {
  const files = await glob('src/**/*.{ts,tsx}', { 
    cwd: process.cwd(),
    ignore: ['src/shared/ui/icons/**']
  });
  
  console.log(`Found ${files.length} files to process`);
  
  for (const file of files) {
    await replaceIconsInFile(file);
  }
  
  console.log('✅ Icon replacement completed!');
}

main().catch(console.error);