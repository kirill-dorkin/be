'use client';

import { useOptimizedFonts } from '@/shared/lib/font-optimization';
import { cn } from '@/shared/lib/utils';

interface OptimizedTextProps {
  children: React.ReactNode;
  className?: string;
  critical?: boolean;
  fallbackText?: string;
}

export const OptimizedText = ({ 
  children, 
  className = '', 
  critical = false,
  fallbackText 
}: OptimizedTextProps) => {
  const { criticalFontsLoaded, shouldShowFallback } = useOptimizedFonts();

  // Для критического текста показываем fallback до загрузки шрифтов
  if (critical && shouldShowFallback && fallbackText) {
    return (
      <span className={cn('font-loading-fallback', className)}>
        {fallbackText}
      </span>
    );
  }

  return (
    <span 
      className={cn(
        critical ? 'critical-text' : 'non-critical-text',
        className
      )}
    >
      {children}
    </span>
  );
};

// Компонент для заголовков с оптимизированной загрузкой
export const OptimizedHeading = ({ 
  children, 
  className = '',
  level = 1,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  return (
    <Tag 
      className={cn('critical-text font-semibold', className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

// Компонент для основного текста с оптимизацией
export const OptimizedParagraph = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p 
      className={cn('non-critical-text', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export default {
  OptimizedText,
  OptimizedHeading,
  OptimizedParagraph,
};