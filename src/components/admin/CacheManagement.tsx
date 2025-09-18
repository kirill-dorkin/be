'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Settings, 
  BarChart3, 
  Zap, 
  Monitor,
  Clock,
  HardDrive,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import useCustomToast from '@/hooks/useCustomToast';

// Интерфейсы
interface CacheStats {
  totalSize: string;
  totalKeys: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  memory: {
    used: string;
    available: string;
    percentage: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

interface CacheEntry {
  key: string;
  size: string;
  ttl: number;
  hitCount: number;
  lastAccessed: string;
  type: 'page' | 'api' | 'image' | 'data' | 'session';
  status: 'active' | 'expired' | 'evicted';
}

interface CacheConfig {
  enabled: boolean;
  maxMemory: string;
  defaultTtl: number;
  compressionEnabled: boolean;
  compressionLevel: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
  persistToDisk: boolean;
  preloadEnabled: boolean;
  warmupOnStart: boolean;
}

interface CompressionConfig {
  algorithm?: 'gzip' | 'brotli' | 'deflate';
  level?: number;
  threshold?: number;
}

interface MinificationConfig {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  mangleNames?: boolean;
}

interface BundlingConfig {
  splitChunks?: boolean;
  maxSize?: number;
  minSize?: number;
}

interface LazyLoadingConfig {
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
}

interface PrefetchConfig {
  priority?: 'high' | 'low';
  crossOrigin?: boolean;
  as?: string;
}

interface CdnConfig {
  provider?: string;
  endpoint?: string;
  regions?: string[];
  cacheTtl?: number;
}

type OptimizationConfig = 
  | CompressionConfig 
  | MinificationConfig 
  | BundlingConfig 
  | LazyLoadingConfig 
  | PrefetchConfig 
  | CdnConfig 
  | Record<string, unknown>;

interface OptimizationRule {
  id: string;
  name: string;
  type: 'compression' | 'minification' | 'bundling' | 'lazy_loading' | 'prefetch' | 'cdn';
  enabled: boolean;
  description: string;
  impact: 'low' | 'medium' | 'high';
  config: OptimizationConfig;
}

const CacheManagement: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [config, setConfig] = useState<CacheConfig | null>(null);
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  // Загрузка данных
  useEffect(() => {
    loadCacheData();
    const interval = setInterval(loadCacheData, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadCacheData = async () => {
    try {
      const [statsRes, entriesRes, configRes, rulesRes] = await Promise.all([
        fetch('/api/admin/cache/stats'),
        fetch('/api/admin/cache/entries'),
        fetch('/api/admin/cache/config'),
        fetch('/api/admin/optimization/rules')
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (entriesRes.ok) {
        setEntries(await entriesRes.json());
      }
      if (configRes.ok) {
        setConfig(await configRes.json());
      }
      if (rulesRes.ok) {
        setOptimizationRules(await rulesRes.json());
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка загрузки данных кэша' });
    } finally {
      setLoading(false);
    }
  };

  // Очистка кэша
  const handleClearCache = async (type?: string) => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: `Кэш ${type ? `типа ${type}` : ''} очищен` });
        loadCacheData();
      } else {
        throw new Error('Ошибка очистки кэша');
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка очистки кэша' });
    } finally {
      setIsClearing(false);
    }
  };

  // Обновление конфигурации
  const handleConfigUpdate = async (newConfig: Partial<CacheConfig>) => {
    try {
      const response = await fetch('/api/admin/cache/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      if (response.ok) {
        setConfig({ ...config!, ...newConfig });
        showSuccessToast({ title: 'Успех', description: 'Конфигурация кэша обновлена' });
      } else {
        throw new Error('Ошибка обновления конфигурации');
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка обновления конфигурации' });
    }
  };

  // Переключение правила оптимизации
  const handleToggleOptimization = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/optimization/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setOptimizationRules(rules => 
          rules.map(rule => 
            rule.id === ruleId ? { ...rule, enabled } : rule
          )
        );
        showSuccessToast({ title: 'Успех', description: `Правило оптимизации ${enabled ? 'включено' : 'отключено'}` });
      } else {
        throw new Error('Ошибка обновления правила');
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка обновления правила оптимизации' });
    }
  };

  // Запуск оптимизации
  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/admin/optimization/run', {
        method: 'POST'
      });

      if (response.ok) {
        showSuccessToast({ title: 'Успех', description: 'Оптимизация запущена' });
        loadCacheData();
      } else {
        throw new Error('Ошибка запуска оптимизации');
      }
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка запуска оптимизации' });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Фильтрация записей
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'evicted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Размер кэша</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSize}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalKeys} ключей
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hitRate}%</div>
              <Progress value={stats.hitRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Память</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memory.percentage}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.memory.used} / {stats.memory.available}
              </p>
              <Progress value={stats.memory.percentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Производительность</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.performance.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                {stats.performance.requestsPerSecond} req/s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Записи кэша</TabsTrigger>
          <TabsTrigger value="config">Конфигурация</TabsTrigger>
          <TabsTrigger value="optimization">Оптимизация</TabsTrigger>
        </TabsList>

        {/* Записи кэша */}
        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Записи кэша</CardTitle>
                  <CardDescription>
                    Управление записями в кэше
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleClearCache()}
                    disabled={isClearing}
                    variant="destructive"
                    size="sm"
                  >
                    {isClearing ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Очистить весь кэш
                  </Button>
                  <Button
                    onClick={loadCacheData}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Обновить
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Фильтры */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по ключу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="page">Страницы</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="image">Изображения</SelectItem>
                    <SelectItem value="data">Данные</SelectItem>
                    <SelectItem value="session">Сессии</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Список записей */}
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.key}</span>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        <Badge variant="outline">{entry.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Размер: {entry.size} • Обращений: {entry.hitCount} • 
                        TTL: {entry.ttl}s • Последний доступ: {new Date(entry.lastAccessed).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleClearCache(entry.type)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Конфигурация */}
        <TabsContent value="config" className="space-y-4">
          {config && (
            <Card>
              <CardHeader>
                <CardTitle>Конфигурация кэша</CardTitle>
                <CardDescription>
                  Настройки системы кэширования
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cache-enabled">Включить кэширование</Label>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleConfigUpdate({ enabled })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-memory">Максимальная память</Label>
                      <Input
                        id="max-memory"
                        value={config.maxMemory}
                        onChange={(e) => handleConfigUpdate({ maxMemory: e.target.value })}
                        placeholder="512MB"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-ttl">TTL по умолчанию (секунды)</Label>
                      <Input
                        id="default-ttl"
                        type="number"
                        value={config.defaultTtl}
                        onChange={(e) => handleConfigUpdate({ defaultTtl: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eviction-policy">Политика вытеснения</Label>
                      <Select
                        value={config.evictionPolicy}
                        onValueChange={(evictionPolicy: any) => handleConfigUpdate({ evictionPolicy })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lru">LRU (Least Recently Used)</SelectItem>
                          <SelectItem value="lfu">LFU (Least Frequently Used)</SelectItem>
                          <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                          <SelectItem value="random">Random</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compression">Сжатие</Label>
                      <Switch

                        checked={config.compressionEnabled}
                        onCheckedChange={(compressionEnabled) => handleConfigUpdate({ compressionEnabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="persist">Сохранение на диск</Label>
                      <Switch

                        checked={config.persistToDisk}
                        onCheckedChange={(persistToDisk) => handleConfigUpdate({ persistToDisk })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="preload">Предзагрузка</Label>
                      <Switch

                        checked={config.preloadEnabled}
                        onCheckedChange={(preloadEnabled) => handleConfigUpdate({ preloadEnabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="warmup">Прогрев при запуске</Label>
                      <Switch

                        checked={config.warmupOnStart}
                        onCheckedChange={(warmupOnStart) => handleConfigUpdate({ warmupOnStart })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Оптимизация */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Правила оптимизации</CardTitle>
                  <CardDescription>
                    Настройки оптимизации производительности
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRunOptimization}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Запустить оптимизацию
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.name}</span>
                        <Badge variant="outline">{rule.type}</Badge>
                        <span className={`text-sm font-medium ${getImpactColor(rule.impact)}`}>
                          {rule.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rule.description}
                      </p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => handleToggleOptimization(rule.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CacheManagement;