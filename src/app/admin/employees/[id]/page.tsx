'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function EmployeeDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Форма редактирования
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    position: '',
    phone: '',
    isActive: true
  });
  
  // Форма смены пароля
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Проверка авторизации
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/employees/${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setEmployee(data.employee);
        setFormData({
          name: data.employee.name,
          email: data.employee.email,
          role: data.employee.role,
          department: data.employee.department || '',
          position: data.employee.position || '',
          phone: data.employee.phone || '',
          isActive: data.employee.isActive
        });
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки сотрудника');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const updateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setEmployee(data.employee);
        alert('Сотрудник успешно обновлен');
      } else {
        alert(data.error || 'Ошибка обновления сотрудника');
      }
    } catch (err) {
      alert('Ошибка сети');
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        alert('Пароль успешно изменен');
      } else {
        alert(data.error || 'Ошибка изменения пароля');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const deleteEmployee = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Сотрудник успешно удален');
        router.push('/admin/employees');
      } else {
        alert(data.error || 'Ошибка удаления сотрудника');
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Загрузка сотрудника...</div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error || 'Сотрудник не найден'}</div>
          <Link href="/admin/employees" className="text-red-600 hover:text-red-800 mt-2 inline-block">
            ← Вернуться к списку сотрудников
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/employees" className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
              ← Вернуться к сотрудникам
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Создан {new Date(employee.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(employee.role)}`}>
              {getRoleText(employee.role)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {employee.isActive ? 'Активен' : 'Неактивен'}
            </span>
            <button
              onClick={deleteEmployee}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Редактировать информацию</h2>
            <form onSubmit={updateEmployee} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="employee">Сотрудник</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отдел
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Должность
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Активный сотрудник</span>
                </label>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Изменить пароль
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о сотруднике */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Информация</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID сотрудника</p>
                <p className="font-mono text-sm">{employee._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Дата создания</p>
                <p className="text-sm">{new Date(employee.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Последнее обновление</p>
                <p className="text-sm">{new Date(employee.updatedAt).toLocaleString('ru-RU')}</p>
              </div>
              {employee.lastLogin && (
                <div>
                  <p className="text-sm text-gray-500">Последний вход</p>
                  <p className="text-sm">{new Date(employee.lastLogin).toLocaleString('ru-RU')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Статистика активности */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Активность</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Статус</span>
                <span className={`text-sm font-medium ${
                  employee.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {employee.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Роль</span>
                <span className="text-sm font-medium">{getRoleText(employee.role)}</span>
              </div>
              {employee.department && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Отдел</span>
                  <span className="text-sm font-medium">{employee.department}</span>
                </div>
              )}
              {employee.position && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Должность</span>
                  <span className="text-sm font-medium">{employee.position}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно смены пароля */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Изменить пароль</h2>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердить пароль *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Изменить пароль
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}