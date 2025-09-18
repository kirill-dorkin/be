export interface IService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
}