'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick, 
  Network, 
  RefreshCw, 
  Search, 
  Server, 
  TrendingUp, 
  Wifi,
  Bell,
  Eye,
  Filter,
  Download,
  Trash2,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

// Интерфейсы
interface ErrorMetadata {
  errorCode?: string;
  component?: string;
  function?: string;
  line?: number;
}

interface PerformanceMetadata {
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface RequestMetadata {
  method?: string;
  url?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
}

interface DatabaseMetadata {
  query?: string;
  duration?: number;
  rows?: number;
  connection?: string;
}

type MonitoringMetadata = 
  | ErrorMetadata 
  | PerformanceMetadata 
  | RequestMetadata 
  | DatabaseMetadata 
  | Record<string, unknown>;

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source: string;
  userId?: string;
  metadata?: MonitoringMetadata;
  stackTrace?: string;
}

interface MetricPoint {
  timestamp: string;
  value: number;
}

interface SystemMetric {
  name: string;
  unit: string;
  current: number;
  average: number;
  max: number;
  min: number;
  data: MetricPoint[];
  status: 'healthy' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  metrics: SystemMetric[];
}

interface Alert {
  id: string;
  name: string;
  description?: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  notifications?: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
}

interface AlertInstance {
  id: string;
  alertId: string;
  status: 'active' | 'resolved' | 'acknowledged';
  triggeredAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  currentValue: number;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertName?: string;
  alertMetric?: string;
}

const MonitoringDashboard: React.FC = () => {
  // Состояния
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertInstances, setAlertInstances] = useState<AlertInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Фильтры
  const [logFilters, setLogFilters] = useState({
    level: '',
    source: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  
  const [metricsTimeRange, setMetricsTimeRange] = useState('24h');
  const [alertFilters, setAlertFilters] = useState({
    status: '',
    severity: ''
  });
  
  // Диалоги
  const [showNewAlertDialog, setShowNewAlertDialog] = useState(false);
  const [showLogDetailsDialog, setShowLogDetailsDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  // Форма нового алерта
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    metric: 'cpu',
    condition: 'greater_than',
    threshold: 80,
    severity: 'medium' as const,
    enabled: true,
    notifications: {
      email: true,
      slack: false,
      webhook: false
    }
  });

  // Загрузка данных
  const loadSystemHealth = async () => {
    try {
      const response = await fetch(`/api/admin/monitoring/metrics?timeRange=${metricsTimeRange}`, {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      const data = await response.json();
      setSystemHealth(data.health);
    } catch (error) {
      console.error('Error loading system health:', error);
      toast.error('Ошибка загрузки метрик системы');
    }
  };

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logFilters.level) params.append('level', logFilters.level);
      if (logFilters.source) params.append('source', logFilters.source);
      if (logFilters.search) params.append('search', logFilters.search);
      if (logFilters.startDate) params.append('startDate', logFilters.startDate);
      if (logFilters.endDate) params.append('endDate', logFilters.endDate);
      
      const response = await fetch(`/api/admin/monitoring/logs?${params}`, {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Ошибка загрузки логов');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/alerts?type=rules', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Ошибка загрузки алертов');
    }
  };

  const loadAlertInstances = async () => {
    try {
      const params = new URLSearchParams();
      if (alertFilters.status) params.append('status', alertFilters.status);
      if (alertFilters.severity) params.append('severity', alertFilters.severity);
      
      const response = await fetch(`/api/admin/monitoring/alerts?type=instances&${params}`, {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      const data = await response.json();
      setAlertInstances(data.instances);
    } catch (error) {
      console.error('Error loading alert instances:', error);
      toast.error('Ошибка загрузки экземпляров алертов');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadSystemHealth(),
      loadLogs(),
      loadAlerts(),
      loadAlertInstances()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [metricsTimeRange]);

  useEffect(() => {
    loadLogs();
  }, [logFilters]);

  useEffect(() => {
    loadAlertInstances();
  }, [alertFilters]);

  // Обработчики
  const handleCreateAlert = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(newAlert)
      });
      
      if (response.ok) {
        toast.success('Алерт создан успешно');
        setShowNewAlertDialog(false);
        setNewAlert({
          name: '',
          description: '',
          metric: 'cpu',
          condition: 'greater_than',
          threshold: 80,
          severity: 'medium',
          enabled: true,
          notifications: {
            email: true,
            slack: false,
            webhook: false
          }
        });
        loadAlerts();
      } else {
        toast.error('Ошибка создания алерта');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Ошибка создания алерта');
    }
  };

  const handleAlertAction = async (instanceId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch('/api/admin/monitoring/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ instanceId, action, userId: 'admin@example.com' })
      });
      
      if (response.ok) {
        toast.success(`Алерт ${action === 'acknowledge' ? 'подтвержден' : 'решен'}`);
        loadAlertInstances();
      } else {
        toast.error('Ошибка обновления алерта');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Ошибка обновления алерта');
    }
  };

  const runSystemCheck = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ type: 'full', notify: true })
      });
      
      if (response.ok) {
        toast.success('Проверка системы запущена');
        setTimeout(loadSystemHealth, 2000);
      } else {
        toast.error('Ошибка запуска проверки');
      }
    } catch (error) {
      console.error('Error running system check:', error);
      toast.error('Ошибка запуска проверки');
    }
  };

  const clearLogs = async (type: string = 'all') => {
    try {
      const params = type !== 'all' ? `?level=${type}` : '';
      const response = await fetch(`/api/admin/monitoring/logs${params}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      if (response.ok) {
        toast.success('Логи очищены');
        loadLogs();
      } else {
        toast.error('Ошибка очистки логов');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Ошибка очистки логов');
    }
  };

  // Утилиты
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'active': return 'text-red-600';
      case 'acknowledged': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'resolved': return 'default';
      case 'warning':
      case 'acknowledged': return 'secondary';
      case 'critical':
      case 'active': return 'destructive';
      default: return 'outline';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'debug': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'memory': return <MemoryStick className="h-4 w-4" />;
      case 'disk': return <HardDrive className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'requests': return <TrendingUp className="h-4 w-4" />;
      case 'errors': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${minutes}м`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка данных мониторинга...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мониторинг системы</h1>
          <p className="text-muted-foreground">Отслеживание производительности и логирование</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSystemCheck} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Проверить систему
          </Button>
          <Button onClick={loadAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Общий статус */}
      {systemHealth && (
        <Alert className={`border-l-4 ${
          systemHealth.overall === 'healthy' ? 'border-l-green-500' :
          systemHealth.overall === 'warning' ? 'border-l-yellow-500' :
          'border-l-red-500'
        }`}>
          <Server className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Статус системы: </span>
                <Badge variant={getStatusBadgeVariant(systemHealth.overall)}>
                  {systemHealth.overall === 'healthy' ? 'Здорова' :
                   systemHealth.overall === 'warning' ? 'Предупреждение' : 'Критично'}
                </Badge>
                <span className="ml-4 text-sm text-muted-foreground">
                  Время работы: {formatUptime(systemHealth.uptime)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Последняя проверка: {new Date(systemHealth.lastCheck).toLocaleString()}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="metrics">Метрики</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
          <TabsTrigger value="alerts">Алерты</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth?.metrics.slice(0, 4).map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {metric.name === 'cpu' ? 'Процессор' :
                     metric.name === 'memory' ? 'Память' :
                     metric.name === 'disk' ? 'Диск' :
                     metric.name === 'network' ? 'Сеть' : metric.name}
                  </CardTitle>
                  {getMetricIcon(metric.name)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.current.toFixed(1)}{metric.unit}
                  </div>
                  <Progress 
                    value={metric.current} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Среднее: {metric.average.toFixed(1)}{metric.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Последние алерты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Активные алерты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertInstances.filter(i => i.status === 'active').length === 0 ? (
                <p className="text-muted-foreground">Нет активных алертов</p>
              ) : (
                <div className="space-y-2">
                  {alertInstances.filter(i => i.status === 'active').slice(0, 5).map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(instance.severity)}>
                          {instance.severity}
                        </Badge>
                        <span className="font-medium">{instance.alertName}</span>
                        <span className="text-sm text-muted-foreground">{instance.message}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAlertAction(instance.id, 'acknowledge')}
                        >
                          Подтвердить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAlertAction(instance.id, 'resolve')}
                        >
                          Решить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Последние логи */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Последние логи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="text-sm font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline">{log.source}</Badge>
                      <span className="text-sm">{log.message}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedLog(log);
                        setShowLogDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Метрики */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Системные метрики</h2>
            <Select value={metricsTimeRange} onValueChange={setMetricsTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 час</SelectItem>
                <SelectItem value="6h">6 часов</SelectItem>
                <SelectItem value="24h">24 часа</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemHealth?.metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    <span className="capitalize">
                      {metric.name === 'cpu' ? 'Процессор' :
                       metric.name === 'memory' ? 'Память' :
                       metric.name === 'disk' ? 'Диск' :
                       metric.name === 'network' ? 'Сеть' :
                       metric.name === 'requests' ? 'Запросы' :
                       metric.name === 'errors' ? 'Ошибки' : metric.name}
                    </span>
                    <Badge variant={getStatusBadgeVariant(metric.status)}>
                      {metric.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Текущее:</span>
                        <div className="font-bold">{metric.current.toFixed(1)}{metric.unit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Среднее:</span>
                        <div className="font-bold">{metric.average.toFixed(1)}{metric.unit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Максимум:</span>
                        <div className="font-bold">{metric.max.toFixed(1)}{metric.unit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Минимум:</span>
                        <div className="font-bold">{metric.min.toFixed(1)}{metric.unit}</div>
                      </div>
                    </div>
                    
                    {metric.threshold && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Пороги:</span>
                          <span>Предупреждение: {metric.threshold.warning}{metric.unit}, Критично: {metric.threshold.critical}{metric.unit}</span>
                        </div>
                        <Progress value={metric.current} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Логи */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Системные логи</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearLogs()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить все
              </Button>
            </div>
          </div>

          {/* Фильтры логов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Уровень</Label>
                  <Select value={logFilters.level} onValueChange={(value) => 
                    setLogFilters(prev => ({ ...prev, level: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все уровни" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все уровни</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Источник</Label>
                  <Select value={logFilters.source} onValueChange={(value) => 
                    setLogFilters(prev => ({ ...prev, source: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все источники" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все источники</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="cache">Cache</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Поиск</Label>
                  <Input
                    placeholder="Поиск в сообщениях..."
                    value={logFilters.search}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Дата от</Label>
                  <Input
                    type="datetime-local"
                    value={logFilters.startDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Дата до</Label>
                  <Input
                    type="datetime-local"
                    value={logFilters.endDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список логов */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-1">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-3 border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowLogDetailsDialog(true);
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <span className="text-sm font-mono text-muted-foreground min-w-[140px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="min-w-[80px] justify-center">
                        {log.source}
                      </Badge>
                      <span className="text-sm flex-1">{log.message}</span>
                      {log.userId && (
                        <Badge variant="secondary">{log.userId}</Badge>
                      )}
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Алерты */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Управление алертами</h2>
            <Dialog open={showNewAlertDialog} onOpenChange={setShowNewAlertDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Создать алерт
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Новый алерт</DialogTitle>
                  <DialogDescription>
                    Создайте новое правило для мониторинга системы
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Название</Label>
                    <Input
                      value={newAlert.name}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Название алерта"
                    />
                  </div>
                  
                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      value={newAlert.description}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Описание алерта"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Метрика</Label>
                      <Select value={newAlert.metric} onValueChange={(value) => 
                        setNewAlert(prev => ({ ...prev, metric: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpu">CPU</SelectItem>
                          <SelectItem value="memory">Память</SelectItem>
                          <SelectItem value="disk">Диск</SelectItem>
                          <SelectItem value="network">Сеть</SelectItem>
                          <SelectItem value="requests">Запросы</SelectItem>
                          <SelectItem value="errors">Ошибки</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Условие</Label>
                      <Select value={newAlert.condition} onValueChange={(value) => 
                        setNewAlert(prev => ({ ...prev, condition: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater_than">Больше чем</SelectItem>
                          <SelectItem value="less_than">Меньше чем</SelectItem>
                          <SelectItem value="equals">Равно</SelectItem>
                          <SelectItem value="not_equals">Не равно</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Порог</Label>
                      <Input
                        type="number"
                        value={newAlert.threshold}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Серьезность</Label>
                      <Select value={newAlert.severity} onValueChange={(value: any) => 
                        setNewAlert(prev => ({ ...prev, severity: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкая</SelectItem>
                          <SelectItem value="medium">Средняя</SelectItem>
                          <SelectItem value="high">Высокая</SelectItem>
                          <SelectItem value="critical">Критичная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Уведомления</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Switch
                          checked={newAlert.notifications.email}
                          onCheckedChange={(checked) => 
                            setNewAlert(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, email: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Slack</span>
                        <Switch
                          checked={newAlert.notifications.slack}
                          onCheckedChange={(checked) => 
                            setNewAlert(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, slack: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Webhook</span>
                        <Switch
                          checked={newAlert.notifications.webhook}
                          onCheckedChange={(checked) => 
                            setNewAlert(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, webhook: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewAlertDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateAlert}>
                    Создать
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Фильтры алертов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры алертов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Статус</Label>
                  <Select value={alertFilters.status} onValueChange={(value) => 
                    setAlertFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все статусы</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="acknowledged">Подтвержденные</SelectItem>
                      <SelectItem value="resolved">Решенные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Серьезность</Label>
                  <Select value={alertFilters.severity} onValueChange={(value) => 
                    setAlertFilters(prev => ({ ...prev, severity: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все уровни" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все уровни</SelectItem>
                      <SelectItem value="low">Низкая</SelectItem>
                      <SelectItem value="medium">Средняя</SelectItem>
                      <SelectItem value="high">Высокая</SelectItem>
                      <SelectItem value="critical">Критичная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Правила алертов */}
          <Card>
            <CardHeader>
              <CardTitle>Правила алертов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(alert.metric)}
                        <div>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm">
                          {alert.metric} {alert.condition.replace('_', ' ')} {alert.threshold}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.enabled} />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Экземпляры алертов */}
          <Card>
            <CardHeader>
              <CardTitle>История алертов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertInstances.map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusBadgeVariant(instance.status)}>
                        {instance.status === 'active' ? 'Активный' :
                         instance.status === 'acknowledged' ? 'Подтвержден' : 'Решен'}
                      </Badge>
                      
                      <div>
                        <div className="font-medium">{instance.alertName}</div>
                        <div className="text-sm text-muted-foreground">{instance.message}</div>
                        <div className="text-xs text-muted-foreground">
                          Сработал: {new Date(instance.triggeredAt).toLocaleString()}
                          {instance.acknowledgedAt && (
                            <span> • Подтвержден: {new Date(instance.acknowledgedAt).toLocaleString()}</span>
                          )}
                          {instance.resolvedAt && (
                            <span> • Решен: {new Date(instance.resolvedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {instance.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAlertAction(instance.id, 'acknowledge')}
                        >
                          Подтвердить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAlertAction(instance.id, 'resolve')}
                        >
                          Решить
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог деталей лога */}
      <Dialog open={showLogDetailsDialog} onOpenChange={setShowLogDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLevelIcon(selectedLog.level)}
              Детали лога
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Время</Label>
                  <div className="font-mono text-sm">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label>Уровень</Label>
                  <Badge variant={getStatusBadgeVariant(selectedLog.level)}>
                    {selectedLog.level}
                  </Badge>
                </div>
                <div>
                  <Label>Источник</Label>
                  <Badge variant="outline">{selectedLog.source}</Badge>
                </div>
                {selectedLog.userId && (
                  <div>
                    <Label>Пользователь</Label>
                    <div className="text-sm">{selectedLog.userId}</div>
                  </div>
                )}
              </div>
              
              <div>
                <Label>Сообщение</Label>
                <div className="p-3 bg-muted rounded text-sm">
                  {selectedLog.message}
                </div>
              </div>
              
              {selectedLog.metadata && (
                <div>
                  <Label>Метаданные</Label>
                  <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.stackTrace && (
                <div>
                  <Label>Stack Trace</Label>
                  <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringDashboard;