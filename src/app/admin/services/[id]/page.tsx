'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Save, Trash2, Clock, DollarSign, Package, Calendar } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  cost: number;
  duration?: string;
  description?: string;
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

export default function ServiceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const serviceId = params.id as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Форма редактирования
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    duration: '',
    description: '',
    category: ''
  });
  
  const [hasChanges, setHasChanges] = useState(false);

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

  // Загрузка услуги
  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
        
        // Заполнение формы
        setFormData({
          name: data.service.name,
          cost: data.service.cost.toString(),
          duration: data.service.duration || '',
          description: data.service.description || '',
          category: data.service.category._id
        });
      } else if (response.status === 404) {
        toast({
          title: 'Ошибка',
          description: 'Услуга не найдена',
          variant: 'destructive'
        });
        router.push('/admin/services');
      } else {
        throw new Error('Ошибка загрузки услуги');
      }
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить услугу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Сохранение изменений
  const handleSave = async () => {
    if (!formData.name || !formData.cost || !formData.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          cost: parseFloat(formData.cost),
          duration: formData.duration || undefined,
          description: formData.description || undefined,
          category: formData.category
        })
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Услуга успешно обновлена'
        });
        setHasChanges(false);
        fetchService(); // Перезагрузка данных
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления услуги');
      }
    } catch (error) {
      console.error('Ошибка обновления услуги:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить услугу',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Удаление услуги
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Услуга успешно удалена'
        });
        router.push('/admin/services');
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
    } finally {
      setDeleting(false);
    }
  };

  // Отслеживание изменений в форме
  useEffect(() => {
    if (!service) return;
    
    const hasFormChanges = (
      formData.name !== service.name ||
      formData.cost !== service.cost.toString() ||
      formData.duration !== (service.duration || '') ||
      formData.description !== (service.description || '') ||
      formData.category !== service.category._id
    );
    
    setHasChanges(hasFormChanges);
  }, [formData, service]);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (session?.user?.role === 'admin' && serviceId) {
      fetchCategories();
      fetchService();
    }
  }, [session, serviceId]);

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

  if (!service) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Услуга не найдена</h1>
          <Button onClick={() => router.push('/admin/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к списку услуг
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/services')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Редактирование услуги</h1>
            <p className="text-muted-foreground">Изменение параметров услуги</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить услугу "{service.name}"? 
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стоимость</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.cost.toFixed(2)} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категория</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{service.category.name}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Длительность</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {service.duration || 'Не указано'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Создано</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(service.createdAt).toLocaleDateString('ru-RU')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Форма редактирования */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название услуги *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название услуги"
              />
            </div>
            <div>
              <Label htmlFor="cost">Стоимость *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="duration">Длительность</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Например: 1 час, 30 минут"
              />
            </div>
            <div>
              <Label htmlFor="category">Категория *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Введите описание услуги"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Метаинформация */}
      <Card>
        <CardHeader>
          <CardTitle>Метаинформация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">ID услуги</Label>
              <div className="font-mono">{service._id}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Дата создания</Label>
              <div>{new Date(service.createdAt).toLocaleString('ru-RU')}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Последнее обновление</Label>
              <div>{new Date(service.updatedAt).toLocaleString('ru-RU')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Предупреждение о несохраненных изменениях */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">
                У вас есть несохраненные изменения
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}