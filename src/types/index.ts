interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

type Status = 'Pending' | 'In Progress' | 'Completed';

type UserRole = "admin" | "user" | "worker";

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

interface AddTaskActionParams {
  description: string;
  totalCost: number;
  customerName: string;
  customerPhone: string;
  laptopBrand: string;
  laptopModel: string;
}

// Типы для интернет-магазина
interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  brand?: string;
  featured?: boolean;
}

interface CartItem {
  _id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  brand?: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

type PaymentMethod = 'cash' | 'card' | 'online';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type { 
  SearchParams, 
  AddTaskActionParams, 
  Status, 
  UserRole, 
  Device, 
  Service, 
  Category,
  ProductFilters,
  CartItem,
  ShippingAddress,
  PaymentMethod,
  PaymentStatus,
  OrderStatus
};
