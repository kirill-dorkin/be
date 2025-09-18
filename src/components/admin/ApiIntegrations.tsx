'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useCustomToast from '@/hooks/useCustomToast';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Key,
  Globe,
  Database,
  Mail,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  BarChart3,
  Cloud
} from 'lucide-react';

// Типы интеграций
interface PaymentConfig {
  currency?: string;
  sandbox?: boolean;
  webhookSecret?: string;
  supportedMethods?: string[];
}

interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  encryption?: 'tls' | 'ssl' | 'none';
  templates?: Record<string, string>;
}

interface AnalyticsConfig {
  trackingId?: string;
  events?: string[];
  customDimensions?: Record<string, string>;
}

interface CrmConfig {
  syncInterval?: number;
  fieldMapping?: Record<string, string>;
  autoSync?: boolean;
}

interface SocialConfig {
  appId?: string;
  permissions?: string[];
  autoPost?: boolean;
}

interface ShippingConfig {
  zones?: Array<{ name: string; countries: string[]; rates: Record<string, number> }>;
  trackingEnabled?: boolean;
}

interface SmsConfig {
  sender?: string;
  templates?: Record<string, string>;
  rateLimits?: { perMinute: number; perHour: number };
}

interface StorageConfig {
  bucket?: string;
  region?: string;
  encryption?: boolean;
  publicAccess?: boolean;
}

type IntegrationConfig = 
  | PaymentConfig 
  | EmailConfig 
  | AnalyticsConfig 
  | CrmConfig 
  | SocialConfig 
  | ShippingConfig 
  | SmsConfig 
  | StorageConfig 
  | Record<string, unknown>; // fallback for 'other' type

interface ApiIntegration {
  id: string;
  name: string;
  type: 'payment' | 'email' | 'analytics' | 'crm' | 'social' | 'shipping' | 'sms' | 'storage' | 'other';
  description: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  endpoint: string;
  apiKey: string;
  secretKey?: string;
  webhookUrl?: string;
  config: IntegrationConfig;
  lastSync?: string;
  errorMessage?: string;
  requestCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
}

interface ApiIntegrationsProps {
  className?: string;
}

// Константы
const INTEGRATION_TYPES = [
  { value: 'payment', label: 'Платежи', icon: CreditCard },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { value: 'crm', label: 'CRM', icon: Database },
  { value: 'social', label: 'Соц. сети', icon: MessageSquare },
  { value: 'shipping', label: 'Доставка', icon: ShoppingCart },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'storage', label: 'Хранилище', icon: Cloud },
  { value: 'other', label: 'Другое', icon: Globe }
];

const STATUS_CONFIG = {
  active: { label: 'Активна', color: 'bg-green-500', icon: CheckCircle },
  inactive: { label: 'Неактивна', color: 'bg-gray-500', icon: PowerOff },
  error: { label: 'Ошибка', color: 'bg-red-500', icon: AlertCircle },
  testing: { label: 'Тестирование', color: 'bg-yellow-500', icon: Clock }
};

export default function ApiIntegrations({ className }: ApiIntegrationsProps) {
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { showSuccessToast, showErrorToast } = useCustomToast();

  // Форма для создания/редактирования интеграции
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as ApiIntegration['type'],
    description: '',
    endpoint: '',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    config: '{}'
  });

  // Загрузка данных
  useEffect(() => {
    loadIntegrations();
    loadStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      } else {
        throw new Error('Ошибка загрузки интеграций');
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка загрузки интеграций' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/integrations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // Создание интеграции
  const handleCreate = async () => {
    try {
      let config;
      try {
        config = JSON.parse(formData.config || '{}');
      } catch {
        showErrorToast({ title: 'Ошибка', description: 'Неверный формат JSON в конфигурации' });
        return;
      }

      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          config
        })
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: 'Интеграция успешно создана' });
        setIsCreateDialogOpen(false);
        resetForm();
        loadIntegrations();
        loadStats();
      } else {
        const error = await response.json();
        showErrorToast({ title: 'Ошибка', description: error.error || 'Ошибка создания интеграции' });
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка создания интеграции' });
    }
  };

  // Обновление интеграции
  const handleUpdate = async () => {
    if (!selectedIntegration) return;

    try {
      let config;
      try {
        config = JSON.parse(formData.config || '{}');
      } catch {
        showErrorToast({ title: 'Ошибка', description: 'Неверный формат JSON в конфигурации' });
        return;
      }

      const response = await fetch(`/api/admin/integrations/${selectedIntegration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          config
        })
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: 'Интеграция успешно обновлена' });
        setIsEditDialogOpen(false);
        setSelectedIntegration(null);
        resetForm();
        loadIntegrations();
        loadStats();
      } else {
        const error = await response.json();
        showErrorToast({ title: 'Ошибка', description: error.error || 'Ошибка обновления интеграции' });
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка обновления интеграции' });
    }
  };

  // Удаление интеграции
  const handleDelete = async () => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(`/api/admin/integrations/${selectedIntegration.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: 'Интеграция успешно удалена' });
        setIsDeleteDialogOpen(false);
        setSelectedIntegration(null);
        loadIntegrations();
        loadStats();
      } else {
        const error = await response.json();
        showErrorToast({ title: 'Ошибка', description: error.error || 'Ошибка удаления интеграции' });
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка удаления интеграции' });
    }
  };

  // Переключение статуса интеграции
  const toggleIntegrationStatus = async (integration: ApiIntegration) => {
    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/admin/integrations/${integration.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: `Интеграция ${newStatus === 'active' ? 'активирована' : 'деактивирована'}` });
        loadIntegrations();
        loadStats();
      } else {
        const error = await response.json();
        showErrorToast({ title: 'Ошибка', description: error.error || 'Ошибка изменения статуса' });
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка изменения статуса интеграции' });
    }
  };

  // Тестирование интеграции
  const testIntegration = async (integration: ApiIntegration) => {
    try {
      const response = await fetch(`/api/admin/integrations/${integration.id}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showSuccessToast({ title: 'Успех', description: 'Тест прошел успешно' });
        } else {
          showErrorToast({ title: 'Ошибка', description: 'Тест не прошел' });
        }
        loadIntegrations();
      } else {
        showErrorToast({ title: 'Ошибка', description: 'Ошибка тестирования интеграции' });
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка тестирования интеграции' });
    }
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      description: '',
      endpoint: '',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      config: '{}'
    });
  };

  // Открытие диалога редактирования
  const openEditDialog = (integration: ApiIntegration) => {
    setSelectedIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      description: integration.description,
      endpoint: integration.endpoint,
      apiKey: integration.apiKey,
      secretKey: integration.secretKey || '',
      webhookUrl: integration.webhookUrl || '',
      config: JSON.stringify(integration.config, null, 2)
    });
    setIsEditDialogOpen(true);
  };

  // Фильтрация интеграций
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Получение иконки для типа интеграции
  const getTypeIcon = (type: string) => {
    const typeConfig = INTEGRATION_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Globe;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Интеграции</h1>
          <p className="text-muted-foreground mt-1">
            Управление внешними API и сервисами
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить интеграцию
        </Button>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего интеграций</p>
                  <p className="text-2xl font-bold">{stats.totalIntegrations}</p>
                </div>
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активных</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeIntegrations}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Успешность</p>
                  <p className="text-2xl font-bold">
                    {stats.totalRequests > 0 
                      ? Math.round((stats.successfulRequests / stats.totalRequests) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Время отклика</p>
                  <p className="text-2xl font-bold">{stats.averageResponseTime}ms</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск интеграций..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {INTEGRATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
                <SelectItem value="error">С ошибками</SelectItem>
                <SelectItem value="testing">Тестирование</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список интеграций */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map(integration => {
          const TypeIcon = getTypeIcon(integration.type);
          const statusConfig = STATUS_CONFIG[integration.status];
          const StatusIcon = statusConfig.icon;
          
          return (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`${statusConfig.color} text-white`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Тип</p>
                    <p className="font-medium">
                      {INTEGRATION_TYPES.find(t => t.value === integration.type)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Запросов</p>
                    <p className="font-medium">{integration.requestCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Успешность</p>
                    <p className="font-medium">{integration.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Последняя синхронизация</p>
                    <p className="font-medium">
                      {integration.lastSync 
                        ? new Date(integration.lastSync).toLocaleDateString('ru-RU')
                        : 'Никогда'
                      }
                    </p>
                  </div>
                </div>
                
                {integration.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-800">{integration.errorMessage}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={integration.status === 'active'}
                      onCheckedChange={() => toggleIntegrationStatus(integration)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {integration.status === 'active' ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration(integration)}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(integration)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Интеграции не найдены</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'Создайте первую интеграцию для начала работы'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить интеграцию
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Диалог создания интеграции */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать интеграцию</DialogTitle>
            <DialogDescription>
              Добавьте новую интеграцию с внешним API или сервисом
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название интеграции"
                />
              </div>
              <div>
                <Label htmlFor="type">Тип</Label>
                <Select value={formData.type} onValueChange={(value: ApiIntegration['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
                placeholder="Описание интеграции"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="API ключ"
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key (опционально)</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                  placeholder="Секретный ключ"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="webhookUrl">Webhook URL (опционально)</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://yoursite.com/webhook"
              />
            </div>
            
            <div>
              <Label htmlFor="config">Конфигурация (JSON)</Label>
              <Textarea
                id="config"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                placeholder='{"timeout": 30000, "retries": 3}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования интеграции */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать интеграцию</DialogTitle>
            <DialogDescription>
              Изменить настройки интеграции {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название интеграции"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Тип</Label>
                <Select value={formData.type} onValueChange={(value: ApiIntegration['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание интеграции"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-endpoint">API Endpoint</Label>
              <Input
                id="edit-endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-apiKey">API Key</Label>
                <Input
                  id="edit-apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="API ключ"
                />
              </div>
              <div>
                <Label htmlFor="edit-secretKey">Secret Key (опционально)</Label>
                <Input
                  id="edit-secretKey"
                  type="password"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                  placeholder="Секретный ключ"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-webhookUrl">Webhook URL (опционально)</Label>
              <Input
                id="edit-webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://yoursite.com/webhook"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-config">Конфигурация (JSON)</Label>
              <Textarea
                id="edit-config"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                placeholder='{"timeout": 30000, "retries": 3}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdate}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления интеграции */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить интеграцию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить интеграцию "{selectedIntegration?.name}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}