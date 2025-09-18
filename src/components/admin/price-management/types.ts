import { IService } from '@/models/Service';
import { IProduct } from '@/models/Product';

export interface PriceStats {
  totalServices: number;
  totalProducts: number;
  avgServicePrice: number;
  avgProductPrice: number;
  recentUpdates: number;
}

export interface PriceUpdateData {
  type: 'service' | 'product';
  itemId: string;
  newPrice: number;
  discount?: number;
  reason?: string;
}

export interface PriceHistoryItem {
  _id: string;
  itemId: string;
  itemName: string;
  itemType: 'service' | 'product';
  oldPrice: number;
  newPrice: number;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
}

export type PriceItem = IService | IProduct;
export type PriceItemType = 'service' | 'product';