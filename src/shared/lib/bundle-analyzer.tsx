'use client';

import { useEffect, useState } from 'react';

// Типы для анализа бандла
interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  loadTime: number;
  cacheHitRate: number;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  isUsed: boolean;
  importedBy: string[];
  treeshakeable: boolean;
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
}

// Hook для анализа производительности бандла
export const useBundleAnalyzer = () => {
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundle = async () => {
    if (typeof window === 'undefined') return;
    
    setIsAnalyzing(true);
    
    try {
      // Анализируем загруженные ресурсы
      const resources = performance.getEntriesByType('resource') as PerformanceEntry[];
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceEntry;
      
      // Фильтруем JS ресурсы
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') || resource.name.includes('/_next/static/')
      );
      
      // Вычисляем метрики
      const totalSize = jsResources.reduce((sum, resource) => 
        sum + (resource.transferSize || 0), 0
      );
      
      const gzippedSize = jsResources.reduce((sum, resource) => 
        sum + (resource.encodedBodySize || 0), 0
      );
      
      const loadTime = navigation.duration;
      
      // Анализируем чанки
      const chunks: ChunkInfo[] = jsResources.map(resource => ({
        name: extractChunkName(resource.name),
        size: resource.decodedBodySize || 0,
        gzippedSize: resource.encodedBodySize || 0,
        modules: [], // Требует дополнительного анализа
        isAsync: resource.name.includes('chunks/'),
        priority: determinePriority(resource.name),
      }));
      
      // Анализируем зависимости (базовый анализ)
      const dependencies = await analyzeDependencies();
      
      const bundleMetrics: BundleMetrics = {
        totalSize,
        gzippedSize,
        chunks,
        dependencies,
        loadTime,
        cacheHitRate: calculateCacheHitRate(jsResources),
      };
      
      setMetrics(bundleMetrics);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Запускаем анализ после загрузки страницы
    if (document.readyState === 'complete') {
      analyzeBundle();
    } else {
      window.addEventListener('load', analyzeBundle);
      return () => window.removeEventListener('load', analyzeBundle);
    }
  }, []);

  return { metrics, isAnalyzing, analyzeBundle };
};

// Утилиты для анализа
const extractChunkName = (url: string): string => {
  const match = url.match(/\/([^\/]+)\.js$/);
  return match ? match[1] : 'unknown';
};

const determinePriority = (url: string): 'high' | 'medium' | 'low' => {
  if (url.includes('main') || url.includes('app')) return 'high';
  if (url.includes('vendor') || url.includes('framework')) return 'medium';
  return 'low';
};

const calculateCacheHitRate = (resources: PerformanceEntry[]): number => {
  const cachedResources = resources.filter(resource => 
    (resource.transferSize || 0) === 0 && (resource.decodedBodySize || 0) > 0
  );
  
  return resources.length > 0 ? (cachedResources.length / resources.length) * 100 : 0;
};

const analyzeDependencies = async (): Promise<DependencyInfo[]> => {
  // Базовый анализ зависимостей
  // В реальном проекте можно интегрировать с webpack-bundle-analyzer
  const commonDependencies = [
    'react',
    'react-dom',
    'next',
    '@tanstack/react-query',
    'tailwindcss',
    'lucide-react',
  ];
  
  return commonDependencies.map(dep => ({
    name: dep,
    version: 'unknown',
    size: 0, // Требует дополнительного анализа
    isUsed: true,
    importedBy: [],
    treeshakeable: ['lucide-react', 'tailwindcss'].includes(dep),
  }));
};

// Компонент для отображения метрик бандла
export const BundleMetricsDisplay = () => {
  const { metrics, isAnalyzing } = useBundleAnalyzer();

  if (isAnalyzing) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Analyzing bundle...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-gray-600">Bundle metrics not available</span>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">Total Size</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatSize(metrics.totalSize)}
          </div>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">Gzipped</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatSize(metrics.gzippedSize)}
          </div>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">Load Time</div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.loadTime.toFixed(0)}ms
          </div>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">Cache Hit Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.cacheHitRate.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Chunks</h3>
        <div className="space-y-2">
          {metrics.chunks.map((chunk, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{chunk.name}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  chunk.priority === 'high' ? 'bg-red-100 text-red-800' :
                  chunk.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {chunk.priority}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {formatSize(chunk.size)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Утилиты для оптимизации бандла
export const bundleOptimizationUtils = {
  // Проверка размера бандла
  checkBundleSize: (metrics: BundleMetrics) => {
    const warnings = [];
    
    if (metrics.totalSize > 500 * 1024) { // 500KB
      warnings.push('Bundle size exceeds 500KB');
    }
    
    if (metrics.loadTime > 3000) { // 3 seconds
      warnings.push('Bundle load time exceeds 3 seconds');
    }
    
    if (metrics.cacheHitRate < 50) {
      warnings.push('Low cache hit rate');
    }
    
    return warnings;
  },

  // Рекомендации по оптимизации
  getOptimizationSuggestions: (metrics: BundleMetrics) => {
    const suggestions = [];
    
    // Анализ больших чанков
    const largeChunks = metrics.chunks.filter(chunk => chunk.size > 100 * 1024);
    if (largeChunks.length > 0) {
      suggestions.push('Consider code splitting for large chunks');
    }
    
    // Анализ неиспользуемых зависимостей
    const unusedDeps = metrics.dependencies.filter(dep => !dep.isUsed);
    if (unusedDeps.length > 0) {
      suggestions.push('Remove unused dependencies');
    }
    
    // Анализ tree-shaking
    const nonTreeshakeableDeps = metrics.dependencies.filter(dep => !dep.treeshakeable);
    if (nonTreeshakeableDeps.length > 0) {
      suggestions.push('Use tree-shakeable alternatives');
    }
    
    return suggestions;
  },

  // Генерация отчета
  generateReport: (metrics: BundleMetrics) => {
    const warnings = bundleOptimizationUtils.checkBundleSize(metrics);
    const suggestions = bundleOptimizationUtils.getOptimizationSuggestions(metrics);
    
    return {
      summary: {
        totalSize: metrics.totalSize,
        gzippedSize: metrics.gzippedSize,
        loadTime: metrics.loadTime,
        chunksCount: metrics.chunks.length,
        dependenciesCount: metrics.dependencies.length,
      },
      warnings,
      suggestions,
      score: calculatePerformanceScore(metrics),
    };
  },
};

const calculatePerformanceScore = (metrics: BundleMetrics): number => {
  let score = 100;
  
  // Штрафы за размер
  if (metrics.totalSize > 500 * 1024) score -= 20;
  if (metrics.totalSize > 1024 * 1024) score -= 30;
  
  // Штрафы за время загрузки
  if (metrics.loadTime > 3000) score -= 20;
  if (metrics.loadTime > 5000) score -= 30;
  
  // Бонусы за кэширование
  if (metrics.cacheHitRate > 80) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

export default {
  useBundleAnalyzer,
  BundleMetricsDisplay,
  bundleOptimizationUtils,
};