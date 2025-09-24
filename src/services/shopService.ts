import { Product, ProductCategory, Order, ProductTag } from "@/shared/types";

function resolveUrl(path: string): string {
  if (typeof window !== 'undefined') return path;
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const base = envUrl || vercel || 'http://localhost:3000';
  return new URL(path, base).toString();
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const absolute = resolveUrl(url);
  const res = await fetch(absolute, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export const shopService = {
  // Products
  listProducts(): Promise<Product[]> {
    return api<Product[]>("/api/shop/products");
  },
  createProduct(payload: Omit<Product, "_id" | "createdAt" | "updatedAt">): Promise<Product> {
    return api<Product>("/api/shop/products", { method: 'POST', body: JSON.stringify(payload) });
  },
  getProduct(id: string): Promise<Product> { return api<Product>(`/api/shop/products/${id}`); },
  updateProduct(id: string, payload: Partial<Product>): Promise<Product> { return api<Product>(`/api/shop/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  deleteProduct(id: string): Promise<{ success: boolean }> { return api(`/api/shop/products/${id}`, { method: 'DELETE' }); },

  // Categories
  listCategories(): Promise<ProductCategory[]> {
    return api<ProductCategory[]>("/api/shop/categories");
  },
  createCategory(payload: Omit<ProductCategory, "_id">): Promise<ProductCategory> {
    return api<ProductCategory>("/api/shop/categories", { method: 'POST', body: JSON.stringify(payload) });
  },
  updateCategory(id: string, payload: Partial<ProductCategory>): Promise<ProductCategory> { return api<ProductCategory>(`/api/shop/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  deleteCategory(id: string): Promise<{ success: boolean }> { return api(`/api/shop/categories/${id}`, { method: 'DELETE' }); },

  // Orders
  listOrders(): Promise<Order[]> {
    return api<Order[]>("/api/shop/orders");
  },
  createOrder(payload: Omit<Order, "_id" | "createdAt" | "updatedAt" | "status"> & { status?: Order['status'] }): Promise<Order> {
    return api<Order>("/api/shop/orders", { method: 'POST', body: JSON.stringify(payload) });
  },
  updateOrder(id: string, payload: Partial<Order>): Promise<Order> { return api<Order>(`/api/shop/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },

  // Tags
  listTags(): Promise<ProductTag[]> {
    return api<ProductTag[]>("/api/shop/tags");
  },
  createTag(payload: Omit<ProductTag, "_id">): Promise<ProductTag> {
    return api<ProductTag>("/api/shop/tags", { method: 'POST', body: JSON.stringify(payload) });
  },
  updateTag(id: string, payload: Partial<ProductTag>): Promise<ProductTag> { return api<ProductTag>(`/api/shop/tags/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
  deleteTag(id: string): Promise<{ success: boolean }> { return api(`/api/shop/tags/${id}`, { method: 'DELETE' }); },
};

export default shopService;

