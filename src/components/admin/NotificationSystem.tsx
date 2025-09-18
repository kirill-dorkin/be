'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Users, 
  Send,
  Plus,
  Filter,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient: 'all' | 'admins' | 'users' | 'specific';
  recipients?: string[];
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  scheduledFor?: string;
  readCount?: number;
  totalRecipients?: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'push' | 'in-app';
  category: 'order' | 'user' | 'system' | 'marketing';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Новое обновление системы',
    message: 'Доступна новая версия системы с улучшениями безопасности',
    type: 'info',
    recipient: 'all',
    status: 'sent',
    createdAt: '2024-01-15T10:00:00Z',
    sentAt: '2024-01-15T10:05:00Z',
    readCount: 45,
    totalRecipients: 120
  },
  {
    id: '2',
    title: 'Техническое обслуживание',
    message: 'Запланировано техническое обслуживание на завтра с 02:00 до 04:00',
    type: 'warning',
    recipient: 'all',
    status: 'scheduled',
    createdAt: '2024-01-14T15:30:00Z',
    scheduledFor: '2024-01-16T01:00:00Z',
    totalRecipients: 120
  },
  {
    id: '3',
    title: 'Акция на товары',
    message: 'Скидка 20% на все товары категории "Электроника"',
    type: 'success',
    recipient: 'users',
    status: 'draft',
    createdAt: '2024-01-14T12:00:00Z',
    totalRecipients: 85
  }
];

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Добро пожаловать',
    subject: 'Добро пожаловать в наш магазин!',
    content: 'Спасибо за регистрацию. Получите скидку 10% на первый заказ.',
    type: 'email',
    category: 'user'
  },
  {
    id: '2',
    name: 'Подтверждение заказа',
    subject: 'Ваш заказ #{orderNumber} подтвержден',
    content: 'Ваш заказ принят в обработку. Ожидаемая дата доставки: {deliveryDate}',
    type: 'email',
    category: 'order'
  },
  {
    id: '3',
    name: 'Системное уведомление',
    subject: 'Важное системное уведомление',
    content: 'Информируем вас о важных изменениях в системе.',
    type: 'in-app',
    category: 'system'
  }
];

export default function NotificationSystem() {
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'settings'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'scheduled'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'info',
    recipient: 'all',
    status: 'draft'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return X;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      showErrorToast({ title: 'Ошибка', description: 'Заполните все обязательные поля' });
      return;
    }

    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const notification: Notification = {
        id: Date.now().toString(),
        title: newNotification.title!,
        message: newNotification.message!,
        type: newNotification.type as any,
        recipient: newNotification.recipient as any,
        status: 'draft',
        createdAt: new Date().toISOString(),
        totalRecipients: newNotification.recipient === 'all' ? 120 : 
                        newNotification.recipient === 'users' ? 85 : 35
      };
      
      setNotifications(prev => [notification, ...prev]);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        recipient: 'all',
        status: 'draft'
      });
      setShowCreateForm(false);
      showSuccessToast({ title: 'Успех', description: 'Уведомление создано' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка создания уведомления' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications(prev => prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'sent', sentAt: new Date().toISOString() }
          : notification
      ));
      
      showSuccessToast({ title: 'Успех', description: 'Уведомление отправлено' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка отправки уведомления' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      showSuccessToast({ title: 'Успех', description: 'Уведомление удалено' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка удаления уведомления' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Навигация по вкладкам */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'notifications', label: 'Уведомления', icon: Bell },
            { id: 'templates', label: 'Шаблоны', icon: MessageSquare },
            { id: 'settings', label: 'Настройки', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Заголовок и действия */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Уведомления</h2>
              <p className="text-gray-600">Управление уведомлениями пользователей</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Создать уведомление</span>
            </Button>
          </div>

          {/* Фильтры и поиск */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Поиск уведомлений..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все типы</option>
                    <option value="info">Информация</option>
                    <option value="success">Успех</option>
                    <option value="warning">Предупреждение</option>
                    <option value="error">Ошибка</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все статусы</option>
                    <option value="draft">Черновик</option>
                    <option value="sent">Отправлено</option>
                    <option value="scheduled">Запланировано</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список уведомлений */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              
              return (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={cn(
                          "p-2 rounded-full",
                          getTypeColor(notification.type)
                        )}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status === 'draft' && 'Черновик'}
                              {notification.status === 'sent' && 'Отправлено'}
                              {notification.status === 'scheduled' && 'Запланировано'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Получатели: {notification.recipient === 'all' ? 'Все пользователи' : 
                                              notification.recipient === 'users' ? 'Пользователи' : 
                                              notification.recipient === 'admins' ? 'Администраторы' : 'Выборочно'}</span>
                            <span>•</span>
                            <span>{notification.totalRecipients} получателей</span>
                            {notification.readCount && (
                              <>
                                <span>•</span>
                                <span>{notification.readCount} прочитано</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(notification.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNotification(notification.id)}
                            disabled={loading}
                            className="flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Отправить</span>
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Просмотр</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={loading}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Уведомления не найдены</h3>
                  <p className="text-gray-600">Попробуйте изменить фильтры или создать новое уведомление</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Форма создания уведомления */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Создать уведомление</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок *
                </label>
                <input
                  type="text"
                  value={newNotification.title || ''}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите заголовок уведомления"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сообщение *
                </label>
                <textarea
                  value={newNotification.message || ''}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите текст уведомления"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="info">Информация</option>
                    <option value="success">Успех</option>
                    <option value="warning">Предупреждение</option>
                    <option value="error">Ошибка</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Получатели
                  </label>
                  <select
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, recipient: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все пользователи</option>
                    <option value="users">Только пользователи</option>
                    <option value="admins">Только администраторы</option>
                    <option value="specific">Выборочно</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateNotification}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading && <Spinner />}
                  <span>Создать</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Вкладка шаблонов */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Шаблоны уведомлений</h2>
              <p className="text-gray-600">Управление шаблонами для автоматических уведомлений</p>
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Создать шаблон</span>
            </Button>
          </div>
          
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-sm text-gray-500">{template.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        Редактировать
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Вкладка настроек */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Настройки уведомлений</h2>
            <p className="text-gray-600">Конфигурация системы уведомлений</p>
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Включить email уведомления</h4>
                    <p className="text-sm text-gray-600">Отправка уведомлений по электронной почте</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP сервер
                  </label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Порт
                    </label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Шифрование
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">Без шифрования</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Push уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Включить push уведомления</h4>
                    <p className="text-sm text-gray-600">Отправка уведомлений в браузер</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Server Key
                  </label>
                  <input
                    type="password"
                    placeholder="Введите ключ сервера Firebase"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимальное количество уведомлений в день
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время отправки (часы)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">С</label>
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">До</label>
                      <input
                        type="time"
                        defaultValue="21:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Автоматические уведомления</h4>
                    <p className="text-sm text-gray-600">Отправка уведомлений о заказах, регистрации и т.д.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button className="flex items-center space-x-2">
                <span>Сохранить настройки</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}