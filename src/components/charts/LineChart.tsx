'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  dataKey?: string;
  xAxisKey?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showLegend = false,
  dataKey = 'value',
  xAxisKey = 'name'
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200" 
            />
          )}
          <XAxis 
            dataKey={xAxisKey}
            className="text-gray-600"
            fontSize={12}
          />
          <YAxis 
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
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};