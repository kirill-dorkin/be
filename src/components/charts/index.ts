export { LineChart } from './LineChart';
export { PieChart } from './PieChart';
export { BarChart } from './BarChart';

// Types for chart components
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
}