// Common types
interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Status types
type Status = 'Pending' | 'In Progress' | 'Completed'

// User types
type UserRole = "admin" | "user" | "worker"

// Entity types
interface Category {
  _id?: string;
  name: string;
}

interface Device {
  _id?: string;
  category: string;
  brand: string;
  model?: string;
}

interface Service {
  _id?: string;
  category: string;
  name: string;
  cost: number;
  duration?: string;
}

// Task types
interface AddTaskActionParams {
  description: string;
  totalCost: number;
  customerName: string;
  customerPhone: string;
  laptopBrand: string;
  laptopModel: string;
}

// Exports
export type { 
  SearchParams, 
  AddTaskActionParams, 
  Status, 
  UserRole, 
  Device, 
  Service, 
  Category 
}

// Shop domain types
interface ProductCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductTag {
  _id?: string;
  name: string;
  slug: string;
}

interface Product {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  categoryId?: string;
  stock: number;
  isActive: boolean;
  tags?: string[]; // tag _ids
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  currency: string;
  image?: string;
}

interface OrderAddress {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
}

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  _id?: string;
  userId?: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  address: OrderAddress;
  createdAt?: Date;
  updatedAt?: Date;
}

export type { ProductCategory, ProductTag, Product, CartItem, Order, OrderStatus, OrderAddress };
