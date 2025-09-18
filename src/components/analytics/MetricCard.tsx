'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  size = 'md',
  className
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50'
  };

  const sizeClasses = {
    sm: {
      card: 'p-3 sm:p-4',
      icon: 'h-4 w-4 sm:h-5 sm:w-5',
      value: 'text-base sm:text-lg',
      title: 'text-xs sm:text-sm',
      change: 'text-xs'
    },
    md: {
      card: 'p-4 sm:p-6',
      icon: 'h-5 w-5 sm:h-6 sm:w-6',
      value: 'text-xl sm:text-2xl lg:text-3xl',
      title: 'text-sm sm:text-base',
      change: 'text-xs sm:text-sm'
    },
    lg: {
      card: 'p-6 sm:p-8',
      icon: 'h-6 w-6 sm:h-8 sm:w-8',
      value: 'text-2xl sm:text-3xl lg:text-4xl',
      title: 'text-base sm:text-lg',
      change: 'text-sm sm:text-base'
    }
  };

  const changeColor = change?.type === 'increase' 
    ? 'text-green-600'
    : change?.type === 'decrease'
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200',
      'hover:shadow-lg hover:scale-[1.02]',
      'bg-white',
      'border border-gray-200',
      'touch-optimized',
      className
    )}>
      <CardContent className={sizeClasses[size].card}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-medium text-gray-600 mb-1 sm:mb-2',
              'truncate',
              sizeClasses[size].title
            )}>
              {title}
            </p>
            <p className={cn(
              'font-bold text-gray-900',
              'break-words',
              sizeClasses[size].value
            )}>
              {typeof value === 'number' ? formatValue(value) : value}
            </p>
            {change && (
              <div className={cn(
                'flex items-center mt-1 sm:mt-2 flex-wrap',
                sizeClasses[size].change
              )}>
                <span className={changeColor}>
                  {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                  {Math.abs(change.value)}%
                </span>
                {change.period && (
                  <span className="text-gray-500 ml-1 whitespace-nowrap">
                    {change.period}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            'rounded-full p-2 sm:p-3 flex-shrink-0',
            'interactive-touch',
            colorClasses[color]
          )}>
            <Icon className={cn(
              colorClasses[color].split(' ')[0],
              sizeClasses[size].icon
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface MetricsGridProps {
  metrics: MetricCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 4,
  className
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      'analytics-grid',
      gridClasses[columns],
      className
    )}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export { MetricCard, MetricsGrid };