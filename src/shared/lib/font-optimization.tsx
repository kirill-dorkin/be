'use client';

import localFont from 'next/font/local';
import { useEffect, useState } from 'react';

// Оптимизированные локальные шрифты с fallback на системные
export const inter = localFont({
  src: [
    {
      path: '../../app/fonts/GeistVF.woff',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  variable: '--font-inter',
  adjustFontFallback: false,
});

export const robotoMono = localFont({
  src: [
    {
      path: '../../app/fonts/GeistMonoVF.woff',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: false, // Загружаем только при необходимости
  fallback: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
  variable: '--font-roboto-mono',
  adjustFontFallback: false,
});

// Типы для font loading
type FontLoadingState = 'loading' | 'loaded' | 'error';

interface FontMetrics {
  name: string;
  loadTime: number;
  size: number;
  status: FontLoadingState;
}

// Hook для мониторинга загрузки шрифтов
export const useFontLoader = () => {
  const [fontMetrics, setFontMetrics] = useState<FontMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      setIsLoading(false);
      return;
    }

    const loadFont = async (fontFamily: string, fontWeight = '400') => {
      const startTime = performance.now();
      
      try {
        await document.fonts.load(`${fontWeight} 16px ${fontFamily}`);
        const loadTime = performance.now() - startTime;
        
        return {
          name: fontFamily,
          loadTime,
          size: 0, // Размер можно получить через FontFace API
          status: 'loaded' as FontLoadingState,
        };
      } catch (error) {
        console.warn(`Failed to load font: ${fontFamily}`, error);
        return {
          name: fontFamily,
          loadTime: performance.now() - startTime,
          size: 0,
          status: 'error' as FontLoadingState,
        };
      }
    };

    const loadAllFonts = async () => {
      const fonts = [
        'Inter',
        'Roboto Mono',
      ];

      const metrics = await Promise.all(
        fonts.map(font => loadFont(font))
      );

      setFontMetrics(metrics);
      setIsLoading(false);
    };

    // Проверяем готовность документа
    if (document.readyState === 'complete') {
      loadAllFonts();
    } else {
      window.addEventListener('load', loadAllFonts);
      return () => window.removeEventListener('load', loadAllFonts);
    }
  }, []);

  return { fontMetrics, isLoading };
};

// Утилиты для оптимизации шрифтов
export const fontOptimizationUtils = {
  // Предзагрузка критических шрифтов
  preloadCriticalFonts: () => {
    if (typeof window === 'undefined') return;

    const criticalFonts = [
      { family: 'Inter', weight: '400', display: 'swap' },
      { family: 'Inter', weight: '500', display: 'swap' },
      { family: 'Inter', weight: '600', display: 'swap' },
    ];

    criticalFonts.forEach(({ family, weight, display }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/_next/static/media/${family.toLowerCase()}-${weight}.woff2`;
      document.head.appendChild(link);
    });
  },

  // Оптимизация font-display для критического контента
  optimizeFontDisplay: () => {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter-Critical';
        src: local('Inter'), local('system-ui');
        font-display: block;
        font-weight: 400 600;
      }
      
      .critical-text {
        font-family: 'Inter-Critical', system-ui, -apple-system, sans-serif;
      }
      
      .non-critical-text {
        font-family: Inter, system-ui, -apple-system, sans-serif;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  },

  // Мониторинг производительности шрифтов
  measureFontPerformance: () => {
    if (typeof window === 'undefined' || !window.performance) return null;

    const fontEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('font'))
      .map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        startTime: entry.startTime,
      }));

    return {
      totalFonts: fontEntries.length,
      totalLoadTime: fontEntries.reduce((sum, font) => sum + font.duration, 0),
      totalSize: fontEntries.reduce((sum, font) => sum + font.size, 0),
      fonts: fontEntries,
    };
  },

  // Детекция поддержки font-display
  supportsFontDisplay: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const testStyle = document.createElement('style');
      testStyle.textContent = '@font-face { font-display: swap; }';
      return true;
    } catch {
      return false;
    }
  },
};

// Компонент для предзагрузки критических шрифтов
export const FontPreloader = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Предзагружаем критические шрифты
    fontOptimizationUtils.preloadCriticalFonts();
    
    // Оптимизируем font-display
    fontOptimizationUtils.optimizeFontDisplay();

    // Предзагружаем критические шрифты
    const preloadFonts = [
      {
        family: 'Inter',
        weights: ['400', '500', '600'],
        display: 'swap',
      },
    ];

    preloadFonts.forEach(({ family, weights }) => {
      weights.forEach(weight => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = `/_next/static/media/${family.toLowerCase()}-${weight}.woff2`;
        
        // Добавляем только если еще не существует
        if (!document.querySelector(`link[href="${link.href}"]`)) {
          document.head.appendChild(link);
        }
      });
    });
  }, []);

  return null;
};

// Fallback компонент для критического текста
export const CriticalTextFallback = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      setFontsLoaded(true);
      return;
    }

    const checkFonts = async () => {
      try {
        await document.fonts.ready;
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading check failed:', error);
        setFontsLoaded(true);
      }
    };

    checkFonts();
  }, []);

  return (
    <div 
      className={`${className} ${!fontsLoaded ? 'font-system' : ''}`}
      style={{
        // Используем system fonts как fallback
        fontFamily: !fontsLoaded 
          ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Утилита для оптимизации font loading
export const optimizeFontLoading = () => {
  if (typeof window === 'undefined') return;

  // Добавляем font-display: swap через CSS
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Roboto Mono';
      font-display: swap;
    }
    
    /* System font fallback */
    .font-system {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }
    
    /* Prevent layout shift */
    .font-loading {
      visibility: hidden;
    }
    
    .font-loaded {
      visibility: visible;
    }
  `;
  
  if (!document.querySelector('style[data-font-optimization]')) {
    style.setAttribute('data-font-optimization', 'true');
    document.head.appendChild(style);
  }
};

// Экспорт всех утилит
// Компонент для мониторинга производительности шрифтов
export const FontPerformanceMonitor = () => {
  const [fontPerformance, setFontPerformance] = useState<any>(null);
  const { fontMetrics, isLoading } = useFontLoader();

  useEffect(() => {
    if (!isLoading) {
      const performance = fontOptimizationUtils.measureFontPerformance();
      setFontPerformance(performance);
    }
  }, [isLoading]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-semibold mb-2">Font Performance</h3>
      
      <div className="space-y-1">
        <div>Status: {isLoading ? 'Loading...' : 'Loaded'}</div>
        
        {fontPerformance && (
          <>
            <div>Total Fonts: {fontPerformance.totalFonts}</div>
            <div>Load Time: {Math.round(fontPerformance.totalLoadTime)}ms</div>
            <div>Total Size: {Math.round(fontPerformance.totalSize / 1024)}KB</div>
          </>
        )}
        
        {fontMetrics.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Font Metrics:</div>
            {fontMetrics.map((font, index) => (
              <div key={index} className="text-xs">
                {font.name}: {Math.round(font.loadTime)}ms ({font.status})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook для оптимизированной загрузки шрифтов
export const useOptimizedFonts = () => {
  const [fontsReady, setFontsReady] = useState(false);
  const [criticalFontsLoaded, setCriticalFontsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем загрузку критических шрифтов
    const checkCriticalFonts = async () => {
      try {
        await document.fonts.load('400 16px Inter');
        await document.fonts.load('500 16px Inter');
        setCriticalFontsLoaded(true);
      } catch (error) {
        console.warn('Critical fonts failed to load:', error);
        setCriticalFontsLoaded(true); // Продолжаем с fallback
      }
    };

    // Проверяем готовность всех шрифтов
    const checkAllFonts = () => {
      if (document.fonts.status === 'loaded') {
        setFontsReady(true);
      } else {
        document.fonts.addEventListener('loadingdone', () => {
          setFontsReady(true);
        });
      }
    };

    checkCriticalFonts();
    checkAllFonts();
  }, []);

  return {
    fontsReady,
    criticalFontsLoaded,
    shouldShowFallback: !criticalFontsLoaded,
  };
};

export default {
  inter,
  robotoMono,
  useFontLoader,
  useOptimizedFonts,
  FontPreloader,
  FontPerformanceMonitor,
  CriticalTextFallback,
  fontOptimizationUtils,
  optimizeFontLoading,
};