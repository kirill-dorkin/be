interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

type Status = 'Pending' | 'In Progress' | 'Completed';

type UserRole = "admin" | "user" | "worker";

interface Device {
  _id?: string;
  name: string;
}

interface Service {
  _id?: string;
  device: string;
  name: string;
  cost: number;
}

interface AddTaskActionParams {
  description: string;
  totalCost: number;
  customerName: string;
  customerPhone: string;
  serialNumber: string;
  laptopBrand: string;
  laptopModel: string;
}

export type { SearchParams, AddTaskActionParams, Status, UserRole, Device, Service };

