import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Типы конфигурации для разных типов оптимизации
interface CompressionConfig {
  level: number;
  types: string[];
  minSize: number;
}

interface MinificationConfig {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  optimizeSelectors?: boolean;
  mangle?: boolean;
  compress?: boolean;
}

interface BundlingConfig {
  maxBundleSize: string;
  splitChunks: boolean;
  vendorBundle: boolean;
}

interface LazyLoadingConfig {
  threshold?: string;
  placeholder?: string;
  fadeIn?: boolean;
  components?: string[];
  suspenseFallback?: string;
}

interface PrefetchConfig {
  criticalPages: string[];
  prefetchImages: boolean;
  prefetchFonts: boolean;
}

interface CdnConfig {
  provider: string;
  domains: string[];
  cacheControl: string;
}

type OptimizationConfig = CompressionConfig | MinificationConfig | BundlingConfig | LazyLoadingConfig | PrefetchConfig | CdnConfig;

// Схема валидации правила оптимизации
const optimizationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['compression', 'minification', 'bundling', 'lazy_loading', 'prefetch', 'cdn']),
  enabled: z.boolean(),
  description: z.string().min(1).max(500),
  impact: z.enum(['low', 'medium', 'high']),
  config: z.record(z.unknown())
});

// Интерфейс правила оптимизации
interface OptimizationRule {
  id: string;
  name: string;
  type: 'compression' | 'minification' | 'bundling' | 'lazy_loading' | 'prefetch' | 'cdn';
  enabled: boolean;
  description: string;
  impact: 'low' | 'medium' | 'high';
  config: OptimizationConfig;
}

// Проверка прав администратора
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Недостаточно прав доступа' },
      { status: 403 }
    );
  }
  
  return null;
}

// Имитация правил оптимизации
let mockOptimizationRules: OptimizationRule[] = [
  {
    id: '1',
    name: 'Gzip сжатие',
    type: 'compression',
    enabled: true,
    description: 'Сжатие текстовых ресурсов с помощью Gzip для уменьшения размера передаваемых данных',
    impact: 'high',
    config: {
      level: 6,
      types: ['text/html', 'text/css', 'application/javascript', 'application/json'],
      minSize: 1024
    }
  },
  {
    id: '2',
    name: 'Минификация CSS',
    type: 'minification',
    enabled: true,
    description: 'Удаление лишних пробелов, комментариев и оптимизация CSS файлов',
    impact: 'medium',
    config: {
      removeComments: true,
      removeWhitespace: true,
      optimizeSelectors: true
    }
  },
  {
    id: '3',
    name: 'Минификация JavaScript',
    type: 'minification',
    enabled: true,
    description: 'Сжатие и оптимизация JavaScript кода для уменьшения размера файлов',
    impact: 'medium',
    config: {
      mangle: true,
      compress: true,
      removeComments: true
    }
  },
  {
    id: '4',
    name: 'Объединение файлов',
    type: 'bundling',
    enabled: false,
    description: 'Объединение множественных CSS и JS файлов в один для уменьшения количества запросов',
    impact: 'high',
    config: {
      maxBundleSize: '250KB',
      splitChunks: true,
      vendorBundle: true
    }
  },
  {
    id: '5',
    name: 'Ленивая загрузка изображений',
    type: 'lazy_loading',
    enabled: true,
    description: 'Загрузка изображений только при их появлении в области видимости',
    impact: 'high',
    config: {
      threshold: '50px',
      placeholder: 'blur',
      fadeIn: true
    }
  },
  {
    id: '6',
    name: 'Предзагрузка критических ресурсов',
    type: 'prefetch',
    enabled: true,
    description: 'Предварительная загрузка важных ресурсов для ускорения навигации',
    impact: 'medium',
    config: {
      criticalPages: ['/products', '/categories'],
      prefetchImages: true,
      prefetchFonts: true
    }
  },
  {
    id: '7',
    name: 'CDN для статических ресурсов',
    type: 'cdn',
    enabled: false,
    description: 'Использование CDN для доставки статических файлов (изображения, CSS, JS)',
    impact: 'high',
    config: {
      provider: 'cloudflare',
      domains: ['cdn.bestelectronics.ru'],
      cacheControl: 'max-age=31536000'
    }
  },
  {
    id: '8',
    name: 'Ленивая загрузка компонентов',
    type: 'lazy_loading',
    enabled: true,
    description: 'Динамическая загрузка React компонентов для уменьшения начального размера бандла',
    impact: 'medium',
    config: {
      components: ['ProductModal', 'CartDrawer', 'ReviewsSection'],
      suspenseFallback: 'spinner'
    }
  }
];

// GET - получение всех правил оптимизации
export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');
    const impact = searchParams.get('impact');
    
    let filteredRules = [...mockOptimizationRules];
    
    // Фильтрация по типу
    if (type) {
      filteredRules = filteredRules.filter(rule => rule.type === type);
    }
    
    // Фильтрация по статусу
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      filteredRules = filteredRules.filter(rule => rule.enabled === isEnabled);
    }
    
    // Фильтрация по влиянию
    if (impact) {
      filteredRules = filteredRules.filter(rule => rule.impact === impact);
    }
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return NextResponse.json(filteredRules);
  } catch (error) {
    console.error('Ошибка получения правил оптимизации:', error);
    return NextResponse.json(
      { error: 'Ошибка получения правил оптимизации' },
      { status: 500 }
    );
  }
}

// POST - создание нового правила оптимизации
export async function POST(request: NextRequest) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const ruleData = optimizationRuleSchema.parse(body);
    
    const newRule: OptimizationRule = {
      id: (mockOptimizationRules.length + 1).toString(),
      ...ruleData
    };
    
    mockOptimizationRules.push(newRule);
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({
      message: 'Правило оптимизации создано',
      rule: newRule
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные правила', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка создания правила оптимизации:', error);
    return NextResponse.json(
      { error: 'Ошибка создания правила оптимизации' },
      { status: 500 }
    );
  }
}