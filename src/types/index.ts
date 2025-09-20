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

export type { SearchParams, AddTaskActionParams, Status, UserRole, Device, Service, Category };
