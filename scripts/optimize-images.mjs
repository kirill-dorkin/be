#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OPTIMIZED_DIR = path.join(IMAGES_DIR, 'optimized');

// Конфигурация размеров для responsive изображений
const RESPONSIVE_SIZES = [
  { width: 320, suffix: '-mobile' },
  { width: 768, suffix: '-tablet' },
  { width: 1024, suffix: '-desktop' },
  { width: 1920, suffix: '-xl' }
];

// Качество для разных форматов
const QUALITY_CONFIG = {
  webp: 85,
  avif: 80,
  jpeg: 85,
  png: 90
};

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function getImageFiles() {
  try {
    const files = await fs.readdir(IMAGES_DIR);
    return files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) && 
      !file.includes('optimized')
    );
  } catch (error) {
    console.error('Ошибка чтения директории изображений:', error);
    return [];
  }
}

async function optimizeImage(inputPath, outputDir, filename) {
  const name = path.parse(filename).name;
  const results = [];

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Оптимизация ${filename} (${metadata.width}x${metadata.height})`);

    // Генерируем responsive размеры
    for (const size of RESPONSIVE_SIZES) {
      if (metadata.width && metadata.width >= size.width) {
        // WebP
        const webpPath = path.join(outputDir, `${name}${size.suffix}.webp`);
        await image
          .resize(size.width, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .webp({ quality: QUALITY_CONFIG.webp, effort: 6 })
          .toFile(webpPath);
        
        // AVIF (более современный формат)
        const avifPath = path.join(outputDir, `${name}${size.suffix}.avif`);
        await image
          .resize(size.width, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .avif({ quality: QUALITY_CONFIG.avif, effort: 9 })
          .toFile(avifPath);

        // Fallback JPEG
        const jpegPath = path.join(outputDir, `${name}${size.suffix}.jpg`);
        await image
          .resize(size.width, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false 
          })
          .jpeg({ quality: QUALITY_CONFIG.jpeg, progressive: true })
          .toFile(jpegPath);

        results.push({
          size: size.suffix,
          width: size.width,
          webp: path.relative(PUBLIC_DIR, webpPath),
          avif: path.relative(PUBLIC_DIR, avifPath),
          jpeg: path.relative(PUBLIC_DIR, jpegPath)
        });
      }
    }

    // Создаем blur placeholder
    const blurPath = path.join(outputDir, `${name}-blur.webp`);
    await image
      .resize(20, null, { withoutEnlargement: true })
      .blur(2)
      .webp({ quality: 20 })
      .toFile(blurPath);

    results.push({
      blur: path.relative(PUBLIC_DIR, blurPath)
    });

    return results;
  } catch (error) {
    console.error(`Ошибка оптимизации ${filename}:`, error);
    return [];
  }
}

async function generateImageManifest(optimizedImages) {
  const manifest = {
    generated: new Date().toISOString(),
    images: optimizedImages
  };

  const manifestPath = path.join(OPTIMIZED_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`Манифест создан: ${manifestPath}`);
}

async function generateImageUtils() {
  const utilsContent = `// Автогенерированный файл для оптимизированных изображений
// Не редактировать вручную - используйте npm run images:optimize

export interface OptimizedImageSources {
  avif: string;
  webp: string;
  jpeg: string;
}

export interface ResponsiveImageSet {
  mobile: OptimizedImageSources;
  tablet: OptimizedImageSources;
  desktop: OptimizedImageSources;
  xl: OptimizedImageSources;
  blur: string;
}

// Утилита для получения srcSet
export function getSrcSet(imageName: string, format: 'avif' | 'webp' | 'jpeg' = 'webp'): string {
  const basePath = '/images/optimized';
  return [
    \`\${basePath}/\${imageName}-mobile.\${format} 320w\`,
    \`\${basePath}/\${imageName}-tablet.\${format} 768w\`,
    \`\${basePath}/\${imageName}-desktop.\${format} 1024w\`,
    \`\${basePath}/\${imageName}-xl.\${format} 1920w\`
  ].join(', ');
}

// Утилита для получения sizes атрибута
export function getSizes(breakpoints?: string): string {
  return breakpoints || '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';
}

// Утилита для получения blur placeholder
export function getBlurDataURL(imageName: string): string {
  return \`/images/optimized/\${imageName}-blur.webp\`;
}

// Компонент Picture для современных браузеров
export function getPictureProps(imageName: string) {
  return {
    sources: [
      {
        srcSet: getSrcSet(imageName, 'avif'),
        type: 'image/avif'
      },
      {
        srcSet: getSrcSet(imageName, 'webp'),
        type: 'image/webp'
      }
    ],
    img: {
      src: \`/images/optimized/\${imageName}-desktop.jpg\`,
      srcSet: getSrcSet(imageName, 'jpeg')
    }
  };
}
`;

  const utilsPath = path.join(__dirname, '..', 'src', 'shared', 'lib', 'optimized-images.ts');
  await fs.writeFile(utilsPath, utilsContent);
  
  console.log(`Утилиты созданы: ${utilsPath}`);
}

async function main() {
  console.log('🖼️  Начинаем оптимизацию изображений...');
  
  // Создаем директорию для оптимизированных изображений
  await ensureDir(OPTIMIZED_DIR);
  
  // Получаем список изображений
  const imageFiles = await getImageFiles();
  
  if (imageFiles.length === 0) {
    console.log('Изображения для оптимизации не найдены');
    return;
  }
  
  console.log(`Найдено ${imageFiles.length} изображений для оптимизации`);
  
  const optimizedImages = {};
  
  // Оптимизируем каждое изображение
  for (const file of imageFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const name = path.parse(file).name;
    
    const results = await optimizeImage(inputPath, OPTIMIZED_DIR, file);
    if (results.length > 0) {
      optimizedImages[name] = results;
    }
  }
  
  // Генерируем манифест
  await generateImageManifest(optimizedImages);
  
  // Генерируем утилиты
  await generateImageUtils();
  
  console.log('✅ Оптимизация изображений завершена!');
  console.log('📁 Оптимизированные изображения сохранены в public/images/optimized/');
  console.log('🔧 Утилиты созданы в src/shared/lib/optimized-images.ts');
}

main().catch(console.error);