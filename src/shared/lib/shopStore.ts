import { Product, ProductCategory, Order, CartItem, ProductTag } from "@/shared/types";

// Simple in-memory store to bootstrap functionality without impacting existing DB
// Can be swapped to Mongoose models later if needed.

type Id = string;

function generateId(): Id {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class ShopStore {
  private products: Map<Id, Product> = new Map();
  private categories: Map<Id, ProductCategory> = new Map();
  private orders: Map<Id, Order> = new Map();
  private tags: Map<Id, ProductTag> = new Map();

  // Categories
  listCategories(): ProductCategory[] {
    return Array.from(this.categories.values());
  }

  getCategory(id: Id): ProductCategory | undefined {
    return this.categories.get(id);
  }

  createCategory(input: Omit<ProductCategory, "_id">): ProductCategory {
    const _id = generateId();
    const category: ProductCategory = { _id, ...input };
    this.categories.set(_id, category);
    return category;
  }

  updateCategory(id: Id, update: Partial<ProductCategory>): ProductCategory | undefined {
    const current = this.categories.get(id);
    if (!current) return undefined;
    const next = { ...current, ...update, _id: id };
    this.categories.set(id, next);
    return next;
  }

  deleteCategory(id: Id): boolean {
    return this.categories.delete(id);
  }

  // Products
  listProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProduct(id: Id): Product | undefined {
    return this.products.get(id);
  }

  createProduct(input: Omit<Product, "_id" | "createdAt" | "updatedAt">): Product {
    const _id = generateId();
    const now = new Date();
    const product: Product = { _id, tags: [], ...input, createdAt: now, updatedAt: now };
    this.products.set(_id, product);
    return product;
  }

  updateProduct(id: Id, update: Partial<Product>): Product | undefined {
    const current = this.products.get(id);
    if (!current) return undefined;
    const next = { ...current, ...update, _id: id, updatedAt: new Date() } as Product;
    this.products.set(id, next);
    return next;
  }

  deleteProduct(id: Id): boolean {
    return this.products.delete(id);
  }

  // Tags
  listTags(): ProductTag[] { return Array.from(this.tags.values()); }
  createTag(input: Omit<ProductTag, "_id">): ProductTag {
    const _id = generateId();
    const tag = { _id, ...input };
    this.tags.set(_id, tag);
    return tag;
  }
  updateTag(id: Id, update: Partial<ProductTag>): ProductTag | undefined {
    const cur = this.tags.get(id); if (!cur) return undefined;
    const next = { ...cur, ...update, _id: id };
    this.tags.set(id, next);
    return next;
  }
  deleteTag(id: Id): boolean { return this.tags.delete(id); }

  // Orders
  listOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getOrder(id: Id): Order | undefined {
    return this.orders.get(id);
  }

  createOrder(input: Omit<Order, "_id" | "createdAt" | "updatedAt" | "status"> & { status?: Order["status"] }): Order {
    const _id = generateId();
    const now = new Date();
    const status = input.status ?? "pending";
    const order: Order = { _id, ...input, status, createdAt: now, updatedAt: now };
    this.orders.set(_id, order);
    return order;
  }

  updateOrder(id: Id, update: Partial<Order>): Order | undefined {
    const current = this.orders.get(id);
    if (!current) return undefined;
    const next = { ...current, ...update, _id: id, updatedAt: new Date() } as Order;
    this.orders.set(id, next);
    return next;
  }

  deleteOrder(id: Id): boolean {
    return this.orders.delete(id);
  }
}

// Singleton instance
export const shopStore = new ShopStore();

// Seed with a couple of demo items for UX
if (shopStore.listProducts().length === 0) {
  const cat = shopStore.createCategory({ name: "Ноутбуки", slug: "laptops", description: "Каталог ноутбуков" });
  shopStore.createProduct({
    title: "Ультрабук Pro 14",
    slug: "ultrabook-pro-14",
    description: "Компактный и мощный ноутбук для работы и учебы.",
    price: 89900,
    currency: "RUB",
    images: ["/images/optimized/laptop-store.jpg"],
    categoryId: cat._id,
    stock: 8,
    isActive: true,
  });
  shopStore.createProduct({
    title: "Игровой ноутбук X15",
    slug: "gaming-x15",
    description: "Высокая производительность для игр и творчества.",
    price: 129900,
    currency: "RUB",
    images: ["/images/optimized/tablets-lined-up-display-shopping-mall.jpg"],
    categoryId: cat._id,
    stock: 5,
    isActive: true,
  });
}


