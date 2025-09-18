import { IUser } from '@/models/User';

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  adminCount: number;
  workerCount: number;
  userCount: number;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'user';
  isActive: boolean;
  phone?: string;
  position?: string;
}

export interface EmployeeFilters {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
}

export interface EmployeePagination {
  currentPage: number;
  totalPages: number;
}

export interface EmployeeManagementProps {
  className?: string;
}

export type Employee = IUser;

export interface EmployeeDialogStates {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
}

export interface EmployeeActions {
  createEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  refreshEmployees: () => Promise<void>;
}