'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface AdaptiveStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function AdaptiveStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className
}: AdaptiveStatsCardProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsTV(width >= 1920 && height >= 1080);
      setIsLargeScreen(width >= 1440 && width < 1920);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200',
      'border-l-4 border-l-blue-500',
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2",
        isTV && "pb-4",
        isLargeScreen && "pb-3"
      )}>
        <CardTitle className={cn(
          "text-xs sm:text-sm font-medium text-gray-600 truncate",
          isTV && "text-xl",
          isLargeScreen && "text-lg"
        )}>
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 bg-blue-50 rounded-lg",
          isTV && "p-4 rounded-xl",
          isLargeScreen && "p-3 rounded-lg"
        )}>
          <Icon className={cn(
            "h-3 w-3 sm:h-4 sm:w-4 text-blue-600",
            isTV && "h-10 w-10",
            isLargeScreen && "h-8 w-8"
          )} />
        </div>
      </CardHeader>
      <CardContent className={cn(
        "space-y-1",
        isTV && "space-y-3",
        isLargeScreen && "space-y-2"
      )}>
        <div className="flex items-baseline justify-between">
          <div className={cn(
            "text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate",
            isTV && "text-5xl",
            isLargeScreen && "text-4xl"
          )}>
            {value}
          </div>
          {trend && (
            <div className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.isPositive
                ? 'text-green-700 bg-green-100'
                : 'text-red-700 bg-red-100',
              isTV && "text-lg px-4 py-2",
              isLargeScreen && "text-base px-3 py-1.5"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className={cn(
            "text-xs text-gray-500 truncate",
            isTV && "text-lg",
            isLargeScreen && "text-base"
          )}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}