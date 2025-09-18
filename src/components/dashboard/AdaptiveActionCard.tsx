'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActionButton {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

interface AdaptiveActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  actions: ActionButton[];
  className?: string;
}

export default function AdaptiveActionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  actions,
  className
}: AdaptiveActionCardProps) {
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
      'hover:shadow-lg transition-all duration-200 group',
      'border hover:border-blue-200',
      className
    )}>
      <CardContent className={cn(
        "p-4 lg:p-6",
        isTV && "p-8",
        isLargeScreen && "p-7"
      )}>
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className={cn(
            'p-2 lg:p-3 rounded-lg flex-shrink-0',
            iconBgColor,
            isTV && "p-4 rounded-xl",
            isLargeScreen && "p-3 rounded-lg"
          )}>
            <Icon className={cn(
              'h-5 w-5 lg:h-6 lg:w-6',
              iconColor,
              isTV && "h-10 w-10",
              isLargeScreen && "h-8 w-8"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm lg:text-base font-semibold text-gray-900 truncate",
              isTV && "text-xl",
              isLargeScreen && "text-lg"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-xs lg:text-sm text-gray-600 mt-1 line-clamp-2",
              isTV && "text-lg mt-2",
              isLargeScreen && "text-base mt-1"
            )}>
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          'flex gap-2',
          actions.length === 1 ? 'flex-col' : 'flex-col sm:flex-row',
          isTV && "gap-4",
          isLargeScreen && "gap-3"
        )}>
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            const buttonContent = (
              <Button
                variant={action.variant || 'default'}
                size={isTV ? 'lg' : isLargeScreen ? 'default' : 'sm'}
                className={cn(
                  'w-full text-xs lg:text-sm',
                  'h-8 lg:h-9',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  isTV && "text-lg px-6 py-3 h-12",
                  isLargeScreen && "text-base px-4 py-2 h-10"
                )}
                disabled={action.disabled}
              >
                <ActionIcon className={cn(
                  "h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2",
                  isTV && "h-6 w-6 mr-3",
                  isLargeScreen && "h-5 w-5 mr-2"
                )} />
                {action.label}
              </Button>
            );

            return action.disabled ? (
              <div key={index} className="flex-1">
                {buttonContent}
              </div>
            ) : (
              <Link key={index} href={action.href} className="flex-1">
                {buttonContent}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}