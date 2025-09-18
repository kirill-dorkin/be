import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Employee, EmployeeStats, EmployeeFilters, EmployeePagination } from '../types';

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    adminCount: 0,
    workerCount: 0,
    userCount: 0
  });
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchTerm: '',
    roleFilter: 'all',
    statusFilter: 'all'
  });
  
  const [pagination, setPagination] = useState<EmployeePagination>({
    currentPage: 1,
    totalPages: 1
  });

  const fetchEmployees = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.roleFilter !== 'all' && { role: filters.roleFilter }),
        ...(filters.statusFilter !== 'all' && { status: filters.statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.users || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1
        });
        
        // Обновляем статистику
        if (data.stats) {
          setStats({
            totalEmployees: data.stats.totalUsers || 0,
            activeEmployees: data.stats.activeUsers || 0,
            inactiveEmployees: data.stats.inactiveUsers || 0,
            adminCount: data.stats.adminCount || 0,
            workerCount: data.stats.workerCount || 0,
            userCount: data.stats.userCount || 0
          });
        }
      } else {
        toast.error(data.error || 'Ошибка при загрузке сотрудников');
      }
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
      toast.error('Ошибка при загрузке сотрудников');
    } finally {
      setLoading(false);
    }
  }, [filters.searchTerm, filters.roleFilter, filters.statusFilter]);

  const updateFilters = useCallback((newFilters: Partial<EmployeeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchEmployees(page);
  }, [fetchEmployees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    stats,
    filters,
    pagination,
    updateFilters,
    goToPage,
    refreshEmployees: () => fetchEmployees(pagination.currentPage)
  };
};