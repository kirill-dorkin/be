import { Product } from "@/shared/types";

export type SerializableProduct = Omit<Product, "createdAt" | "updatedAt"> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CatalogSort = "newest" | "oldest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";

export type CatalogView = "grid" | "list";

export interface CatalogFilters {
  search: string;
  category: string;
  sort: CatalogSort;
  tags: string[];
  onlyInStock: boolean;
}

export interface CatalogState extends CatalogFilters {
  view: CatalogView;
  page: number;
}
