export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'worker';
  isActive: boolean;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  lastLogin?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  stats?: {
    ordersCount: number;
    totalSpent: number;
    lastOrderDate?: Date;
    tasksCount?: number;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'worker';
  isActive: boolean;
  phone: string;
  password?: string;
  address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  workerUsers: number;
  regularUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  newUsersThisMonth: number;
}

export interface BulkActionData {
  role?: 'user' | 'admin' | 'moderator' | 'worker';
  isActive?: boolean;
  emailVerified?: boolean;
  [key: string]: unknown;
}

export interface UserManagementProps {
  initialUsers?: User[];
}

export interface UserDialogState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isViewDialogOpen: boolean;
  editingUser: User | null;
  viewingUser: User | null;
  deletingUser: User | null;
}

export interface UserFilters {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  verificationFilter: string;
}

export interface UserPagination {
  currentPage: number;
  totalPages: number;
}

export type UserRole = 'user' | 'admin' | 'moderator' | 'worker';
export type UserStatus = 'active' | 'inactive' | 'all';
export type VerificationStatus = 'verified' | 'unverified' | 'all';