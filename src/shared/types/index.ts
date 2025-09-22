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
