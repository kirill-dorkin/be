'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Filter, DollarSign, Clock, Package, TrendingUp } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  cost: number;
  duration?: string;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ServiceStats {
  totalServices: number;
  averageCost: number;
  minCost: number;
  maxCost: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Фильтры
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Модальное окно создания услуги
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    cost: '',
    duration: '',
    category: ''
  });
  const [creating, setCreating] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  // Загрузка услуг
  const fetchServices = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(categoryFilter !== 'all' && { categoryId: categoryFilter })
      });
      
      const response = await fetch(`/api/services?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        throw new Error('Ошибка загрузки услуг');
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить услуги',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Создание новой услуги
  const handleCreateService = async () => {
    if (!newService.name || !newService.cost || !newService.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newService.name,
          cost: parseFloat(newService.cost),
          duration: newService.duration || undefined,
          category: newService.category
        })
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Услуга успешно создана'
        });
        setIsCreateModalOpen(false);
        setNewService({ name: '', cost: '', duration: '', category: '' });
        fetchServices();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания услуги');
      }
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать услугу',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  // Удаление услуги
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Услуга успешно удалена'
        });
        fetchServices();
      } else {
        throw new Error('Ошибка удаления услуги');
      }
    } catch (error) {
      console.error('Ошибка удаления услуги:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить услугу',
        variant: 'destructive'
      });
    }
  };

  // Загрузка данных при монтировании и изменении фильтров
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchCategories();
      fetchServices();
    }
  }, [session, currentPage, search, categoryFilter, sortBy, sortOrder]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление услугами</h1>
          <p className="text-muted-foreground">Управляйте услугами и их ценами</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить услугу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую услугу</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название услуги *</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Введите название услуги"
                />
              </div>
              <div>
                <Label htmlFor="cost">Стоимость *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newService.cost}
                  onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="duration">Длительность</Label>
                <Input
                  id="duration"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  placeholder="Например: 1 час, 30 минут"
                />
              </div>
              <div>
                <Label htmlFor="category">Категория *</Label>
                <Select value={newService.category} onValueChange={(value) => setNewService({ ...newService, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateService} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего услуг</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя стоимость</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageCost.toFixed(2)} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Мин. стоимость</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.minCost.toFixed(2)} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Макс. стоимость</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maxCost.toFixed(2)} ₽</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск услуг..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">По дате создания</SelectItem>
                <SelectItem value="name">По названию</SelectItem>
                <SelectItem value="cost">По стоимости</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Порядок" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">По убыванию</SelectItem>
                <SelectItem value="asc">По возрастанию</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица услуг */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Список услуг</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServices}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Обновить'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Название</th>
                  <th className="text-left p-2">Категория</th>
                  <th className="text-left p-2">Стоимость</th>
                  <th className="text-left p-2">Длительность</th>
                  <th className="text-left p-2">Дата создания</th>
                  <th className="text-left p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{service.name}</td>
                    <td className="p-2">
                      <Badge variant="secondary">{service.category.name}</Badge>
                    </td>
                    <td className="p-2">{service.cost.toFixed(2)} ₽</td>
                    <td className="p-2">
                      {service.duration ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {service.duration}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Не указано</span>
                      )}
                    </td>
                    <td className="p-2">
                      {new Date(service.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/services/${service._id}`)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteService(service._id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Показано {services.length} из {pagination.totalItems} услуг
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Предыдущая
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {currentPage} из {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Следующая
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}