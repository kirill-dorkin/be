import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, UserStats, UserFilters, UserPagination } from '../types';

interface UseUserDataReturn {
  users: User[];
  stats: UserStats;
  loading: boolean;
  filters: UserFilters;
  pagination: UserPagination;
  selectedUsers: string[];
  setUsers: (users: User[]) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setSelectedUsers: (users: string[]) => void;
  fetchUsers: (page?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const initialStats: UserStats = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  adminUsers: 0,
  moderatorUsers: 0,
  workerUsers: 0,
  regularUsers: 0,
  verifiedUsers: 0,
  unverifiedUsers: 0,
  newUsersThisMonth: 0
};

const initialFilters: UserFilters = {
  searchTerm: '',
  roleFilter: 'all',
  statusFilter: 'all',
  verificationFilter: 'all'
};

const initialPagination: UserPagination = {
  currentPage: 1,
  totalPages: 1
};

export const useUserData = (initialUsers: User[] = []): UseUserDataReturn => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters);
  const [pagination, setPagination] = useState<UserPagination>(initialPagination);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: filters.searchTerm,
        role: filters.roleFilter === 'all' ? '' : filters.roleFilter,
        status: filters.statusFilter === 'all' ? '' : filters.statusFilter,
        verified: filters.verificationFilter === 'all' ? '' : filters.verificationFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
        setPagination({
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось загрузить пользователей',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети при загрузке пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [filters.searchTerm, filters.roleFilter, filters.statusFilter, filters.verificationFilter]);

  const refreshUsers = useCallback(() => {
    return fetchUsers(pagination.currentPage);
  }, [fetchUsers, pagination.currentPage]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return {
    users,
    stats,
    loading,
    filters,
    pagination,
    selectedUsers,
    setUsers,
    setFilters,
    setSelectedUsers,
    fetchUsers,
    refreshUsers
  };
};