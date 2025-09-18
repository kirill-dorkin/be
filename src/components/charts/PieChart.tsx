'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  colors = DEFAULT_COLORS
}) => {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length]
  }));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};