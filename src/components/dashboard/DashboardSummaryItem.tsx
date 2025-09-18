"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IDashboardSummaryItem {
  item: {
    icon: JSX.Element,
    label: string,
    value: number,
    onClick?: () => void,
    href?: string,
    trend?: {
      value: number,
      type: 'increase' | 'decrease' | 'neutral'
    }
  }
}

export default function DashboardSummaryItem({ item }: IDashboardSummaryItem) {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = item.onClick || item.href;

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  const getTrendColor = () => {
    if (!item.trend) return '';
    switch (item.trend.type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (!item.trend) return null;
    switch (item.trend.type) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      default: return '→';
    }
  };

  return (
    <li className="text-left w-full bg-secondary rounded-lg">
      <Card 
        className={cn(
          "bg-background shadow transition-all duration-200",
          isClickable && "cursor-pointer hover:shadow-lg hover:scale-105",
          isHovered && isClickable && "ring-2 ring-primary/20"
        )}
        onClick={isClickable ? handleClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader>
          <CardTitle className="text-xl text-muted-foreground mt-0 flex gap-4 items-center">
            <span className={cn(
              "bg-secondary text-xl p-3 rounded-lg transition-colors duration-200",
              isHovered && isClickable && "bg-primary/10"
            )}>
              {item.icon}
            </span>
            <div className="flex-1">
              <div>{item.label}</div>
              {item.trend && (
                <div className={cn("text-sm font-normal flex items-center gap-1 mt-1", getTrendColor())}>
                  <span>{getTrendIcon()}</span>
                  <span>{item.trend.value}%</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="m-0 text-primary text-xl font-bold">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </h4>
          {isClickable && (
            <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Нажмите для подробностей
            </p>
          )}
        </CardContent>
      </Card>
    </li>
  )
}
