'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showLegend = false,
  dataKey = 'value',
  xAxisKey = 'name',
  orientation = 'vertical'
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200" 
            />
          )}
          <XAxis 
            dataKey={orientation === 'horizontal' ? dataKey : xAxisKey}
            type={orientation === 'horizontal' ? 'number' : 'category'}
            className="text-gray-600"
            fontSize={12}
          />
          <YAxis 
            dataKey={orientation === 'horizontal' ? xAxisKey : dataKey}
            type={orientation === 'horizontal' ? 'category' : 'number'}
            className="text-gray-600"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};