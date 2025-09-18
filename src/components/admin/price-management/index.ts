// Main component
export { default as PriceManagement } from './PriceManagement';

// Sub-components
export { PriceStats } from './PriceStats';
export { ServicesTable } from './ServicesTable';
export { ProductsTable } from './ProductsTable';
export { PriceDialog } from './PriceDialog';

// Hooks
export { usePriceData, usePriceDialog } from './hooks';

// Types
export type {
  PriceStats as PriceStatsType,
  PriceUpdateData,
  PriceHistoryItem,
  PriceItem,
  PriceItemType,
} from './types';