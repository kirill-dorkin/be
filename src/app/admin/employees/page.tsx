'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  adminCount: number;
  managerCount: number;
  employeeCount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function EmployeesPage() {
  const { data: session, status } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Фильтры
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    department: '',
    isActive: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Форма создания сотрудника
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    position: '',
    phone: ''
  });

  // Проверка авторизации
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/employees?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.employees);
        setStats(data.stats);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки сотрудников');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();
      if (data.success) {
        setNewEmployee({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          department: '',
          position: '',
          phone: ''
        });
        setShowCreateForm(false);
        fetchEmployees();
        alert('Сотрудник успешно создан');
      } else {
        alert(data.error || 'Ошибка создания сотрудника');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error || 'Ошибка обновления статуса');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role: string) => {
    const texts = {
      admin: 'Администратор',
      manager: 'Менеджер',
      employee: 'Сотрудник'
    };
    return texts[role as keyof typeof texts] || role;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление сотрудниками</h1>
            <p className="text-gray-600">Просмотр и управление всеми сотрудниками компании</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Добавить сотрудника
          </button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Всего сотрудников</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Активные</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Неактивные</h3>
            <p className="text-2xl font-bold text-red-600">{stats.inactiveEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Администраторы</h3>
            <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Менеджеры</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.managerCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Сотрудники</h3>
            <p className="text-2xl font-bold text-green-600">{stats.employeeCount}</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Поиск по имени/email"
          />
          
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Все роли</option>
            <option value="admin">Администратор</option>
            <option value="manager">Менеджер</option>
            <option value="employee">Сотрудник</option>
          </select>
          
          <input
            type="text"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Отдел"
          />
          
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Все статусы</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
          
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="createdAt-desc">Новые первые</option>
            <option value="createdAt-asc">Старые первые</option>
            <option value="name-asc">Имя: А-Я</option>
            <option value="name-desc">Имя: Я-А</option>
          </select>
          
          <button
            onClick={() => setFilters({
              page: 1,
              limit: 10,
              role: '',
              department: '',
              isActive: '',
              search: '',
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Модальное окно создания сотрудника */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Добавить сотрудника</h2>
            <form onSubmit={createEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
                </label>
                <input
                  type="password"
                  required
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль *
                </label>
                <select
                  required
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="employee">Сотрудник</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отдел
                </label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Должность
                </label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список сотрудников */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Сотрудники не найдены</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сотрудник
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Отдел/Должность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Контакты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Последний вход
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(employee.role)}`}>
                          {getRoleText(employee.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department || '-'}</div>
                        <div className="text-sm text-gray-500">{employee.position || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEmployeeStatus(employee._id, !employee.isActive)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            employee.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {employee.isActive ? 'Активен' : 'Неактивен'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.lastLogin
                          ? new Date(employee.lastLogin).toLocaleDateString('ru-RU')
                          : 'Никогда'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/employees/${employee._id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Редактировать
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page + 1) })}
                    disabled={filters.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Следующая
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Показано <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> до{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.totalItems)}
                      </span>{' '}
                      из <span className="font-medium">{pagination.totalItems}</span> результатов
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setFilters({ ...filters, page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === filters.page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}