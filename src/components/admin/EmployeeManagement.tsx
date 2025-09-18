'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Activity,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { IUser } from '@/models/User';

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  adminCount: number;
  workerCount: number;
  userCount: number;
}

interface EmployeeFormData {
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'user';
  isActive: boolean;
  phone?: string;
  position?: string;
}

const EmployeeManagement = () => {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    adminCount: 0,
    workerCount: 0,
    userCount: 0
  });

  // Состояния для модальных окон
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IUser | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<IUser | null>(null);

  // Форма
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    phone: '',
    position: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      isActive: true,
      phone: '',
      position: ''
    });
  };

  // Загрузка сотрудников
  const fetchEmployees = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.users || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        
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
  }, [searchTerm, roleFilter, statusFilter]);

  // Создание сотрудника
  const handleCreateEmployee = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно создан');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchEmployees(currentPage);
      } else {
        toast.error(data.error || 'Ошибка при создании сотрудника');
      }
    } catch (error) {
      console.error('Ошибка при создании сотрудника:', error);
      toast.error('Ошибка при создании сотрудника');
    }
  };

  // Обновление сотрудника
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно обновлен');
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
        resetForm();
        fetchEmployees(currentPage);
      } else {
        toast.error(data.error || 'Ошибка при обновлении сотрудника');
      }
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      toast.error('Ошибка при обновлении сотрудника');
    }
  };

  // Удаление сотрудника
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedEmployee._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Сотрудник успешно удален');
        setIsDeleteDialogOpen(false);
        setSelectedEmployee(null);
        fetchEmployees(currentPage);
      } else {
        toast.error(data.error || 'Ошибка при удалении сотрудника');
      }
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      toast.error('Ошибка при удалении сотрудника');
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (employee: IUser) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      role: employee.role as 'admin' | 'worker' | 'user',
      isActive: true, // Предполагаем активный статус
      phone: '',
      position: ''
    });
    setIsEditDialogOpen(true);
  };

  // Открытие диалога просмотра
  const openViewDialog = (employee: IUser) => {
    setViewingEmployee(employee);
    setIsViewDialogOpen(true);
  };

  // Открытие диалога удаления
  const openDeleteDialog = (employee: IUser) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  // Получение цвета роли
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'worker':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Получение названия роли
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'worker':
        return 'Сотрудник';
      case 'user':
        return 'Пользователь';
      default:
        return role;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Проверка прав доступа
  if (!session || session.user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            У вас нет прав для просмотра этой страницы
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего сотрудников</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активные</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Администраторы</p>
                <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Сотрудники</p>
                <p className="text-2xl font-bold text-blue-600">{stats.workerCount}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основная карточка */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Управление сотрудниками
              </CardTitle>
              <CardDescription>
                Управление учетными записями сотрудников и их ролями
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEmployees(currentPage)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить сотрудника
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Добавить нового сотрудника</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о новом сотруднике
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Имя</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        placeholder="Введите имя"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="col-span-3"
                        placeholder="Введите email"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Телефон</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="col-span-3"
                        placeholder="Введите телефон"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position" className="text-right">Должность</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="col-span-3"
                        placeholder="Введите должность"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Роль</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: 'admin' | 'worker' | 'user') => 
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Пользователь</SelectItem>
                          <SelectItem value="worker">Сотрудник</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Статус</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, isActive: !!checked })
                          }
                        />
                        <Label htmlFor="isActive">Активный сотрудник</Label>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleCreateEmployee}>
                      Создать
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Фильтры и поиск */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по имени или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="worker">Сотрудник</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Таблица */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Сотрудники не найдены</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {employee.image ? (
                              <img
                                src={employee.image}
                                alt={employee.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {employee.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(employee.role)}>
                          {getRoleLabel(employee.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Активный
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {employee.createdAt ? 
                            new Date(employee.createdAt).toLocaleDateString('ru-RU') : 
                            'Не указано'
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openViewDialog(employee)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(employee)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEmployees(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEmployees(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог просмотра */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Информация о сотруднике</DialogTitle>
            <DialogDescription>
              Подробная информация о сотруднике {viewingEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          {viewingEmployee && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {viewingEmployee.image ? (
                    <img
                      src={viewingEmployee.image}
                      alt={viewingEmployee.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-600">
                      {viewingEmployee.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewingEmployee.name}</h3>
                  <p className="text-gray-600">{viewingEmployee.email}</p>
                  <Badge className={getRoleBadgeColor(viewingEmployee.role)}>
                    {getRoleLabel(viewingEmployee.role)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID</Label>
                  <p className="text-sm">{viewingEmployee._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Роль</Label>
                  <p className="text-sm">{getRoleLabel(viewingEmployee.role)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Дата создания</Label>
                  <p className="text-sm">
                    {viewingEmployee.createdAt ? 
                      new Date(viewingEmployee.createdAt).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Последнее обновление</Label>
                  <p className="text-sm">
                    {viewingEmployee.updatedAt ? 
                      new Date(viewingEmployee.updatedAt).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
            <DialogDescription>
              Обновите информацию о сотруднике {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Имя</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Телефон</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-position" className="text-right">Должность</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">Роль</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'worker' | 'user') => 
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="worker">Сотрудник</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Статус</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isActive: !!checked })
                  }
                />
                <Label htmlFor="edit-isActive">Активный сотрудник</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedEmployee(null);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleUpdateEmployee}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить сотрудника {selectedEmployee?.name}? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEmployee(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeManagement;