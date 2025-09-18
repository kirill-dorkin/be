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

// Схема валидации обновления правила
const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['compression', 'minification', 'bundling', 'lazy_loading', 'prefetch', 'cdn']).optional(),
  enabled: z.boolean().optional(),
  description: z.string().min(1).max(500).optional(),
  impact: z.enum(['low', 'medium', 'high']).optional(),
  config: z.record(z.any()).optional()
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

// Имитация правил оптимизации (в реальном приложении это будет база данных)
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
  }
];

// GET - получение конкретного правила
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const rule = mockOptimizationRules.find(r => r.id === params.id);
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Правило оптимизации не найдено' },
        { status: 404 }
      );
    }
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(rule);
  } catch (error) {
    console.error('Ошибка получения правила оптимизации:', error);
    return NextResponse.json(
      { error: 'Ошибка получения правила оптимизации' },
      { status: 500 }
    );
  }
}

// PUT - обновление правила оптимизации
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const body = await request.json();
    const updateData = updateRuleSchema.parse(body);
    
    const ruleIndex = mockOptimizationRules.findIndex(r => r.id === params.id);
    
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Правило оптимизации не найдено' },
        { status: 404 }
      );
    }
    
    // Обновляем правило
    mockOptimizationRules[ruleIndex] = {
      ...mockOptimizationRules[ruleIndex],
      ...updateData
    };
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json({
      message: 'Правило оптимизации обновлено',
      rule: mockOptimizationRules[ruleIndex]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные для обновления', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Ошибка обновления правила оптимизации:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления правила оптимизации' },
      { status: 500 }
    );
  }
}

// DELETE - удаление правила оптимизации
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const ruleIndex = mockOptimizationRules.findIndex(r => r.id === params.id);
    
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Правило оптимизации не найдено' },
        { status: 404 }
      );
    }
    
    // Удаляем правило
    const deletedRule = mockOptimizationRules.splice(ruleIndex, 1)[0];
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return NextResponse.json({
      message: 'Правило оптимизации удалено',
      rule: deletedRule
    });
  } catch (error) {
    console.error('Ошибка удаления правила оптимизации:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления правила оптимизации' },
      { status: 500 }
    );
  }
}

// PATCH - переключение статуса правила (включить/выключить)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;
  
  try {
    const ruleIndex = mockOptimizationRules.findIndex(r => r.id === params.id);
    
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Правило оптимизации не найдено' },
        { status: 404 }
      );
    }
    
    // Переключаем статус
    mockOptimizationRules[ruleIndex].enabled = !mockOptimizationRules[ruleIndex].enabled;
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      message: `Правило оптимизации ${mockOptimizationRules[ruleIndex].enabled ? 'включено' : 'выключено'}`,
      rule: mockOptimizationRules[ruleIndex]
    });
  } catch (error) {
    console.error('Ошибка переключения статуса правила:', error);
    return NextResponse.json(
      { error: 'Ошибка переключения статуса правила' },
      { status: 500 }
    );
  }
}