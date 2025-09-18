'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye, 
  Filter, 
  RefreshCw, 
  Search, 
  Server, 
  Shield, 
  TrendingUp, 
  User, 
  Users, 
  XCircle,
  Database,
  Globe,
  Lock,
  ShoppingCart,
  FileText,
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface AuthMetadata {
  sessionId?: string;
  provider?: string;
  twoFactorUsed?: boolean;
}

interface ApiMetadata {
  endpoint?: string;
  method?: string;
  error?: string;
  requestId?: string;
}

interface DatabaseMetadata {
  query?: string;
  params?: unknown[];
  rows?: number;
  table?: string;
}

interface SecurityMetadata {
  attempts?: number;
  blocked?: boolean;
  threatLevel?: 'low' | 'medium' | 'high';
  ruleTriggered?: string;
}

interface UserMetadata {
  action?: string;
  previousValue?: unknown;
  newValue?: unknown;
}

interface SystemMetadata {
  component?: string;
  version?: string;
  config?: Record<string, unknown>;
}

interface OrderMetadata {
  orderId?: string;
  amount?: number;
  items?: number;
  paymentMethod?: string;
}

interface PaymentMetadata {
  transactionId?: string;
  amount?: number;
  currency?: string;
  gateway?: string;
  status?: string;
}

type LogMetadata = 
  | AuthMetadata 
  | ApiMetadata 
  | DatabaseMetadata 
  | SecurityMetadata 
  | UserMetadata 
  | SystemMetadata 
  | OrderMetadata 
  | PaymentMetadata 
  | Record<string, unknown>;

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: 'auth' | 'api' | 'database' | 'security' | 'user' | 'system' | 'order' | 'payment';
  action: string;
  message: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: LogMetadata;
  duration?: number;
  statusCode?: number;
}

interface SystemMetrics {
  totalLogs: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

interface ActivityStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uniqueUsers: number;
  topPages: Array<{ path: string; count: number }>;
  topErrors: Array<{ error: string; count: number }>;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:30:25.123Z',
    level: 'info',
    category: 'auth',
    action: 'user_login',
    message: 'Пользователь успешно вошел в систему',
    userId: 'user123',
    userEmail: 'user@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    statusCode: 200,
    duration: 245
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:28:15.456Z',
    level: 'error',
    category: 'api',
    action: 'api_request',
    message: 'Ошибка при обработке запроса к API',
    ipAddress: '192.168.1.105',
    statusCode: 500,
    duration: 1250,
    metadata: {
      endpoint: '/api/products',
      method: 'GET',
      error: 'Database connection timeout'
    }
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:25:10.789Z',
    level: 'warn',
    category: 'security',
    action: 'failed_login',
    message: 'Неудачная попытка входа в систему',
    userEmail: 'hacker@evil.com',
    ipAddress: '10.0.0.1',
    statusCode: 401,
    metadata: {
      attempts: 5,
      blocked: true
    }
  },
  {
    id: '4',
    timestamp: '2024-01-15T14:20:05.321Z',
    level: 'success',
    category: 'order',
    action: 'order_created',
    message: 'Новый заказ создан успешно',
    userId: 'user456',
    userEmail: 'customer@example.com',
    ipAddress: '192.168.1.110',
    statusCode: 201,
    duration: 890,
    metadata: {
      orderId: 'ORD-2024-001',
      amount: 1250.00,
      items: 3
    }
  },
  {
    id: '5',
    timestamp: '2024-01-15T14:15:30.654Z',
    level: 'debug',
    category: 'database',
    action: 'db_query',
    message: 'Выполнен запрос к базе данных',
    duration: 45,
    metadata: {
      query: 'SELECT * FROM products WHERE category = ?',
      params: ['electronics'],
      rows: 25
    }
  }
];

const mockMetrics: SystemMetrics = {
  totalLogs: 15420,
  errorRate: 2.3,
  avgResponseTime: 245,
  activeUsers: 127,
  systemUptime: '15 дней 8 часов',
  memoryUsage: 68.5,
  cpuUsage: 23.7,
  diskUsage: 45.2
};

const mockActivityStats: ActivityStats = {
  totalRequests: 8945,
  successfulRequests: 8739,
  failedRequests: 206,
  uniqueUsers: 342,
  topPages: [
    { path: '/products', count: 1250 },
    { path: '/auth/signin', count: 890 },
    { path: '/cart', count: 675 },
    { path: '/profile', count: 445 },
    { path: '/orders', count: 320 }
  ],
  topErrors: [
    { error: 'Database timeout', count: 45 },
    { error: 'Invalid credentials', count: 38 },
    { error: 'Rate limit exceeded', count: 22 },
    { error: 'Payment failed', count: 15 },
    { error: 'File not found', count: 12 }
  ]
};

export default function LoggingSystem() {
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'activity' | 'alerts'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [metrics, setMetrics] = useState<SystemMetrics>(mockMetrics);
  const [activityStats, setActivityStats] = useState<ActivityStats>(mockActivityStats);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error' | 'debug' | 'success'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'auth' | 'api' | 'database' | 'security' | 'user' | 'system' | 'order' | 'payment'>('all');
  const [dateRange, setDateRange] = useState('today');

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return XCircle;
      case 'warn': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'debug': return Settings;
      default: return Activity;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warn': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return Lock;
      case 'api': return Globe;
      case 'database': return Database;
      case 'security': return Shield;
      case 'user': return User;
      case 'order': return ShoppingCart;
      case 'payment': return TrendingUp;
      default: return Server;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.userEmail && log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const refreshLogs = async () => {
    setLoading(true);
    try {
      // Имитация загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Здесь должен быть реальный API запрос
      showSuccessToast({ title: 'Успех', description: 'Логи обновлены' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка обновления логов' });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    setLoading(true);
    try {
      // Имитация экспорта
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccessToast({ title: 'Успех', description: 'Логи экспортированы' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка экспорта логов' });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Вы уверены, что хотите очистить все логи?')) {
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLogs([]);
      showSuccessToast({ title: 'Успех', description: 'Логи очищены' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка очистки логов' });
    } finally {
      setLoading(false);
    }
  };

  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshLogs();
    }, 30000); // Обновление каждые 30 секунд
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Навигация по вкладкам */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'logs', label: 'Логи', icon: FileText },
            { id: 'metrics', label: 'Метрики', icon: BarChart3 },
            { id: 'activity', label: 'Активность', icon: Activity },
            { id: 'alerts', label: 'Оповещения', icon: AlertTriangle }
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

      {/* Вкладка логов */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Заголовок и действия */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Системные логи</h2>
              <p className="text-gray-600">Мониторинг активности и событий системы</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "flex items-center space-x-2",
                  autoRefresh && "bg-green-50 text-green-700 border-green-200"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
                <span>{autoRefresh ? 'Авто' : 'Обновить'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLogs}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                <span>Обновить</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Экспорт</span>
              </Button>
            </div>
          </div>

          {/* Фильтры и поиск */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Поиск в логах..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все уровни</option>
                    <option value="error">Ошибки</option>
                    <option value="warn">Предупреждения</option>
                    <option value="info">Информация</option>
                    <option value="success">Успех</option>
                    <option value="debug">Отладка</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все категории</option>
                    <option value="auth">Аутентификация</option>
                    <option value="api">API</option>
                    <option value="database">База данных</option>
                    <option value="security">Безопасность</option>
                    <option value="user">Пользователи</option>
                    <option value="order">Заказы</option>
                    <option value="payment">Платежи</option>
                    <option value="system">Система</option>
                  </select>
                </div>
                <div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="today">Сегодня</option>
                    <option value="yesterday">Вчера</option>
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="custom">Период</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика логов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего записей</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ошибки</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredLogs.filter(log => log.level === 'error').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Предупреждения</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredLogs.filter(log => log.level === 'warn').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Успешные</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredLogs.filter(log => log.level === 'success' || log.level === 'info').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Список логов */}
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const LevelIcon = getLevelIcon(log.level);
              const CategoryIcon = getCategoryIcon(log.category);
              
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "p-2 rounded-full flex-shrink-0",
                        getLevelColor(log.level)
                      )}>
                        <LevelIcon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <CategoryIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.category}
                          </Badge>
                          {log.statusCode && (
                            <Badge 
                              variant={log.statusCode >= 400 ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {log.statusCode}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-2">{log.message}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                          </span>
                          
                          {log.userEmail && (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{log.userEmail}</span>
                            </span>
                          )}
                          
                          {log.ipAddress && (
                            <span className="flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>{log.ipAddress}</span>
                            </span>
                          )}
                          
                          {log.duration && (
                            <span className="flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>{log.duration}ms</span>
                            </span>
                          )}
                        </div>
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                              Подробности
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredLogs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Логи не найдены</h3>
                  <p className="text-gray-600">Попробуйте изменить фильтры или период поиска</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Вкладка метрик */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Системные метрики</h2>
            <p className="text-gray-600">Мониторинг производительности и ресурсов</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Время отклика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</span>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Среднее время ответа</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Активные пользователи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</span>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Онлайн сейчас</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Частота ошибок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">{metrics.errorRate}%</span>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">За последний час</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Время работы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{metrics.systemUptime}</span>
                  <Server className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Без перерывов</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Использование ресурсов */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Использование памяти</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Использовано</span>
                    <span>{metrics.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Загрузка CPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Использовано</span>
                    <span>{metrics.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.cpuUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Использование диска</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Использовано</span>
                    <span>{metrics.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.diskUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Вкладка активности */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Активность пользователей</h2>
            <p className="text-gray-600">Статистика использования системы</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего запросов</p>
                    <p className="text-2xl font-bold text-gray-900">{activityStats.totalRequests.toLocaleString()}</p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Успешные</p>
                    <p className="text-2xl font-bold text-green-600">{activityStats.successfulRequests.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ошибки</p>
                    <p className="text-2xl font-bold text-red-600">{activityStats.failedRequests.toLocaleString()}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Уникальные пользователи</p>
                    <p className="text-2xl font-bold text-purple-600">{activityStats.uniqueUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Популярные страницы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityStats.topPages.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{page.path}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{page.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Частые ошибки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityStats.topErrors.map((error, index) => (
                    <div key={error.error} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{error.error}</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">{error.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Вкладка оповещений */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Системные оповещения</h2>
            <p className="text-gray-600">Настройка автоматических уведомлений</p>
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Пороговые значения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Частота ошибок (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Время отклика (ms)
                    </label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Использование памяти (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Загрузка CPU (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="70"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Каналы уведомлений</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email уведомления</h4>
                      <p className="text-sm text-gray-600">Отправка критических оповещений на email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Slack интеграция</h4>
                      <p className="text-sm text-gray-600">Уведомления в Slack канал</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS уведомления</h4>
                      <p className="text-sm text-gray-600">Критические оповещения по SMS</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={clearLogs}>
                Очистить логи
              </Button>
              <Button>
                Сохранить настройки
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}