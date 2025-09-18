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
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { 
  Archive, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Cloud, 
  Database, 
  Download, 
  HardDrive, 
  History, 
  Play, 
  RefreshCw, 
  Save, 
  Settings, 
  Shield, 
  Trash2, 
  Upload, 
  AlertTriangle,
  FileArchive,
  Server,
  Zap,
  RotateCcw,
  Eye,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

// Интерфейсы
interface BackupEntry {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  createdAt: string;
  size: number;
  duration: number;
  description?: string;
  tables: string[];
  compression: boolean;
  encryption: boolean;
  location: 'local' | 'cloud' | 'external';
  metadata?: {
    recordsCount?: number;
    tablesCount?: number;
    compressionRatio?: number;
    checksum?: string;
  };
}

interface BackupConfig {
  autoBackup: boolean;
  schedule: string;
  retention: number;
  compression: boolean;
  encryption: boolean;
  location: 'local' | 'cloud' | 'external';
  maxBackups: number;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  excludeTables: string[];
}

interface RestorePoint {
  id: string;
  backupId: string;
  name: string;
  timestamp: string;
  status: 'available' | 'corrupted' | 'expired';
  size: number;
  description?: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackup: string;
  successRate: number;
  avgDuration: number;
  storageUsage: {
    local: number;
    cloud: number;
    external: number;
  };
}

const BackupDashboard: React.FC = () => {
  const t = useTranslations();
  
  // Состояния
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Диалоги
  const [showCreateBackupDialog, setShowCreateBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showBackupDetailsDialog, setShowBackupDetailsDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupEntry | null>(null);
  const [selectedRestorePoint, setSelectedRestorePoint] = useState<RestorePoint | null>(null);
  
  // Формы
  const [newBackup, setNewBackup] = useState({
    type: 'full' as const,
    name: '',
    description: '',
    tables: [] as string[],
    compression: true,
    encryption: true,
    location: 'local' as const
  });
  
  const [restoreForm, setRestoreForm] = useState({
    restorePointId: '',
    targetLocation: 'current',
    overwriteExisting: false,
    restoreTables: [] as string[]
  });
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    location: ''
  });

  // Загрузка данных
  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup');
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Ошибка загрузки резервных копий');
    }
  };

  const loadRestorePoints = async () => {
    try {
      const response = await fetch('/api/admin/backup?type=restore-points');
      const data = await response.json();
      setRestorePoints(data.restorePoints || []);
    } catch (error) {
      console.error('Error loading restore points:', error);
      toast.error('Ошибка загрузки точек восстановления');
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/backup?type=config');
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Ошибка загрузки конфигурации');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/backup?type=stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadBackups(),
      loadRestorePoints(),
      loadConfig(),
      loadStats()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Обработчики
  const handleCreateBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBackup)
      });
      
      if (response.ok) {
        toast.success('Резервное копирование запущено');
        setShowCreateBackupDialog(false);
        setNewBackup({
          type: 'full',
          name: '',
          description: '',
          tables: [],
          compression: true,
          encryption: true,
          location: 'local'
        });
        loadBackups();
      } else {
        toast.error('Ошибка создания резервной копии');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Ошибка создания резервной копии');
    }
  };

  const handleRestore = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          ...restoreForm
        })
      });
      
      if (response.ok) {
        toast.success('Восстановление запущено');
        setShowRestoreDialog(false);
        setRestoreForm({
          restorePointId: '',
          targetLocation: 'current',
          overwriteExisting: false,
          restoreTables: []
        });
      } else {
        toast.error('Ошибка восстановления');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Ошибка восстановления');
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<BackupConfig>) => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (response.ok) {
        toast.success('Конфигурация обновлена');
        setShowConfigDialog(false);
        loadConfig();
      } else {
        toast.error('Ошибка обновления конфигурации');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Ошибка обновления конфигурации');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup?id=${backupId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Резервная копия удалена');
        loadBackups();
      } else {
        toast.error('Ошибка удаления резервной копии');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Ошибка удаления резервной копии');
    }
  };

  const runManualBackup = async (type: 'full' | 'incremental' | 'differential') => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: `Ручное ${type === 'full' ? 'полное' : type === 'incremental' ? 'инкрементальное' : 'дифференциальное'} копирование`,
          description: `Запущено вручную ${new Date().toLocaleString()}`
        })
      });
      
      if (response.ok) {
        toast.success('Резервное копирование запущено');
        loadBackups();
      } else {
        toast.error('Ошибка запуска резервного копирования');
      }
    } catch (error) {
      console.error('Error running manual backup:', error);
      toast.error('Ошибка запуска резервного копирования');
    }
  };

  // Утилиты
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м ${secs}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    } else {
      return `${secs}с`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'scheduled': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'scheduled': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Database className="h-4 w-4" />;
      case 'incremental': return <Zap className="h-4 w-4" />;
      case 'differential': return <Archive className="h-4 w-4" />;
      default: return <FileArchive className="h-4 w-4" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'local': return <HardDrive className="h-4 w-4" />;
      case 'cloud': return <Cloud className="h-4 w-4" />;
      case 'external': return <Server className="h-4 w-4" />;
      default: return <Archive className="h-4 w-4" />;
    }
  };

  // Фильтрация бэкапов
  const filteredBackups = backups.filter(backup => {
    if (filters.status && backup.status !== filters.status) return false;
    if (filters.type && backup.type !== filters.type) return false;
    if (filters.location && backup.location !== filters.location) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('backup.title')}</h1>
          <p className="text-muted-foreground">{t('backup.description')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateBackupDialog} onOpenChange={setShowCreateBackupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('backup.create')}
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button onClick={loadAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => runManualBackup('full')}>
          <CardContent className="flex items-center p-4">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold">Полное копирование</h3>
              <p className="text-sm text-muted-foreground">Создать полную резервную копию</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => runManualBackup('incremental')}>
          <CardContent className="flex items-center p-4">
            <Zap className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold">Инкрементальное</h3>
              <p className="text-sm text-muted-foreground">Копировать только изменения</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowRestoreDialog(true)}>
          <CardContent className="flex items-center p-4">
            <RotateCcw className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h3 className="font-semibold">Восстановление</h3>
              <p className="text-sm text-muted-foreground">Восстановить из резервной копии</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего бэкапов</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий размер</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Последний бэкап</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {new Date(stats.lastBackup).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Успешность</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{formatDuration(stats.avgDuration)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="backups">Резервные копии</TabsTrigger>
          <TabsTrigger value="restore">Восстановление</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          {/* Последние бэкапы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Последние резервные копии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.slice(0, 5).map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(backup.type)}
                      <div>
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleString()} • {formatFileSize(backup.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(backup.status)}>
                        {backup.status === 'completed' ? 'Завершен' :
                         backup.status === 'running' ? 'Выполняется' :
                         backup.status === 'failed' ? 'Ошибка' : 'Запланирован'}
                      </Badge>
                      {getLocationIcon(backup.location)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Использование хранилища */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Использование хранилища
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Локальное хранилище</span>
                      <span>{formatFileSize(stats.storageUsage.local)}</span>
                    </div>
                    <Progress value={(stats.storageUsage.local / stats.totalSize) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Облачное хранилище</span>
                      <span>{formatFileSize(stats.storageUsage.cloud)}</span>
                    </div>
                    <Progress value={(stats.storageUsage.cloud / stats.totalSize) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Внешнее хранилище</span>
                      <span>{formatFileSize(stats.storageUsage.external)}</span>
                    </div>
                    <Progress value={(stats.storageUsage.external / stats.totalSize) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Резервные копии */}
        <TabsContent value="backups" className="space-y-6">
          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Статус</Label>
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все статусы</SelectItem>
                      <SelectItem value="completed">Завершен</SelectItem>
                      <SelectItem value="running">Выполняется</SelectItem>
                      <SelectItem value="failed">Ошибка</SelectItem>
                      <SelectItem value="scheduled">Запланирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Тип</Label>
                  <Select value={filters.type} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все типы</SelectItem>
                      <SelectItem value="full">Полное</SelectItem>
                      <SelectItem value="incremental">Инкрементальное</SelectItem>
                      <SelectItem value="differential">Дифференциальное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Расположение</Label>
                  <Select value={filters.location} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, location: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Все расположения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все расположения</SelectItem>
                      <SelectItem value="local">Локальное</SelectItem>
                      <SelectItem value="cloud">Облачное</SelectItem>
                      <SelectItem value="external">Внешнее</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список бэкапов */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredBackups.map((backup) => (
                  <div 
                    key={backup.id} 
                    className="flex items-center justify-between p-4 border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedBackup(backup);
                      setShowBackupDetailsDialog(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {getTypeIcon(backup.type)}
                      <div>
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-muted-foreground">{backup.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleString()} • 
                          {formatFileSize(backup.size)} • 
                          {formatDuration(backup.duration)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {backup.compression && <Archive className="h-4 w-4 text-blue-500" />}
                        {backup.encryption && <Shield className="h-4 w-4 text-green-500" />}
                        {getLocationIcon(backup.location)}
                      </div>
                      
                      <Badge variant={getStatusBadgeVariant(backup.status)}>
                        {backup.status === 'completed' ? 'Завершен' :
                         backup.status === 'running' ? 'Выполняется' :
                         backup.status === 'failed' ? 'Ошибка' : 'Запланирован'}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBackup(backup.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Восстановление */}
        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Точки восстановления
              </CardTitle>
              <CardDescription>
                Выберите точку восстановления для восстановления данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restorePoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <History className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">{point.name}</div>
                        <div className="text-sm text-muted-foreground">{point.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(point.timestamp).toLocaleString()} • {formatFileSize(point.size)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={point.status === 'available' ? 'default' : 'destructive'}>
                        {point.status === 'available' ? 'Доступна' :
                         point.status === 'corrupted' ? 'Повреждена' : 'Истекла'}
                      </Badge>
                      
                      {point.status === 'available' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRestorePoint(point);
                            setRestoreForm(prev => ({ ...prev, restorePointId: point.id }));
                            setShowRestoreDialog(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Восстановить
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings" className="space-y-6">
          {config && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Конфигурация резервного копирования
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Автоматическое резервное копирование</Label>
                      <Switch 
                        checked={config.autoBackup}
                        onCheckedChange={(checked) => 
                          handleUpdateConfig({ autoBackup: checked })
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Расписание (cron)</Label>
                      <Input 
                        value={config.schedule}
                        onChange={(e) => 
                          setConfig(prev => prev ? { ...prev, schedule: e.target.value } : null)
                        }
                        placeholder="0 2 * * *"
                      />
                    </div>
                    
                    <div>
                      <Label>Период хранения (дни)</Label>
                      <Input 
                        type="number"
                        value={config.retention}
                        onChange={(e) => 
                          setConfig(prev => prev ? { ...prev, retention: Number(e.target.value) } : null)
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Максимум резервных копий</Label>
                      <Input 
                        type="number"
                        value={config.maxBackups}
                        onChange={(e) => 
                          setConfig(prev => prev ? { ...prev, maxBackups: Number(e.target.value) } : null)
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Сжатие</Label>
                      <Switch 
                        checked={config.compression}
                        onCheckedChange={(checked) => 
                          setConfig(prev => prev ? { ...prev, compression: checked } : null)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Шифрование</Label>
                      <Switch 
                        checked={config.encryption}
                        onCheckedChange={(checked) => 
                          setConfig(prev => prev ? { ...prev, encryption: checked } : null)
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Расположение по умолчанию</Label>
                      <Select 
                        value={config.location} 
                        onValueChange={(value: any) => 
                          setConfig(prev => prev ? { ...prev, location: value } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Локальное</SelectItem>
                          <SelectItem value="cloud">Облачное</SelectItem>
                          <SelectItem value="external">Внешнее</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Уведомления</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">При успехе</span>
                          <Switch 
                            checked={config.notifyOnSuccess}
                            onCheckedChange={(checked) => 
                              setConfig(prev => prev ? { ...prev, notifyOnSuccess: checked } : null)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">При ошибке</span>
                          <Switch 
                            checked={config.notifyOnFailure}
                            onCheckedChange={(checked) => 
                              setConfig(prev => prev ? { ...prev, notifyOnFailure: checked } : null)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleUpdateConfig(config)}>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог создания бэкапа */}
      <Dialog open={showCreateBackupDialog} onOpenChange={setShowCreateBackupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать резервную копию</DialogTitle>
            <DialogDescription>
              Настройте параметры для создания новой резервной копии
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Тип резервной копии</Label>
              <Select value={newBackup.type} onValueChange={(value: any) => 
                setNewBackup(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Полное копирование</SelectItem>
                  <SelectItem value="incremental">Инкрементальное</SelectItem>
                  <SelectItem value="differential">Дифференциальное</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Название</Label>
              <Input
                value={newBackup.name}
                onChange={(e) => setNewBackup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название резервной копии"
              />
            </div>
            
            <div>
              <Label>Описание</Label>
              <Textarea
                value={newBackup.description}
                onChange={(e) => setNewBackup(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание резервной копии"
              />
            </div>
            
            <div>
              <Label>Расположение</Label>
              <Select value={newBackup.location} onValueChange={(value: any) => 
                setNewBackup(prev => ({ ...prev, location: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Локальное хранилище</SelectItem>
                  <SelectItem value="cloud">Облачное хранилище</SelectItem>
                  <SelectItem value="external">Внешнее хранилище</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Опции</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Сжатие</span>
                  <Switch 
                    checked={newBackup.compression}
                    onCheckedChange={(checked) => 
                      setNewBackup(prev => ({ ...prev, compression: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Шифрование</span>
                  <Switch 
                    checked={newBackup.encryption}
                    onCheckedChange={(checked) => 
                      setNewBackup(prev => ({ ...prev, encryption: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBackupDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateBackup}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог восстановления */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Восстановление данных</DialogTitle>
            <DialogDescription>
              Восстановить данные из выбранной точки восстановления
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRestorePoint && (
              <Alert>
                <History className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedRestorePoint.name}</strong><br />
                  {selectedRestorePoint.description}<br />
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedRestorePoint.timestamp).toLocaleString()}
                  </span>
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label>Целевое расположение</Label>
              <Select value={restoreForm.targetLocation} onValueChange={(value) => 
                setRestoreForm(prev => ({ ...prev, targetLocation: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Текущая база данных</SelectItem>
                  <SelectItem value="new">Новая база данных</SelectItem>
                  <SelectItem value="custom">Пользовательский путь</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Перезаписать существующие данные</Label>
              <Switch 
                checked={restoreForm.overwriteExisting}
                onCheckedChange={(checked) => 
                  setRestoreForm(prev => ({ ...prev, overwriteExisting: checked }))
                }
              />
            </div>
            
            {restoreForm.overwriteExisting && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Внимание! Существующие данные будут перезаписаны. Эта операция необратима.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleRestore}>
              Восстановить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог деталей бэкапа */}
      <Dialog open={showBackupDetailsDialog} onOpenChange={setShowBackupDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBackup && getTypeIcon(selectedBackup.type)}
              Детали резервной копии
            </DialogTitle>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название</Label>
                  <div className="font-medium">{selectedBackup.name}</div>
                </div>
                <div>
                  <Label>Тип</Label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedBackup.type)}
                    <span className="capitalize">{selectedBackup.type}</span>
                  </div>
                </div>
                <div>
                  <Label>Статус</Label>
                  <Badge variant={getStatusBadgeVariant(selectedBackup.status)}>
                    {selectedBackup.status}
                  </Badge>
                </div>
                <div>
                  <Label>Размер</Label>
                  <div>{formatFileSize(selectedBackup.size)}</div>
                </div>
                <div>
                  <Label>Длительность</Label>
                  <div>{formatDuration(selectedBackup.duration)}</div>
                </div>
                <div>
                  <Label>Расположение</Label>
                  <div className="flex items-center gap-2">
                    {getLocationIcon(selectedBackup.location)}
                    <span className="capitalize">{selectedBackup.location}</span>
                  </div>
                </div>
              </div>
              
              {selectedBackup.description && (
                <div>
                  <Label>Описание</Label>
                  <div className="text-sm">{selectedBackup.description}</div>
                </div>
              )}
              
              <div>
                <Label>Таблицы</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBackup.tables.map((table) => (
                    <Badge key={table} variant="outline">{table}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Опции</Label>
                <div className="flex gap-4 mt-1">
                  {selectedBackup.compression && (
                    <div className="flex items-center gap-1">
                      <Archive className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Сжатие</span>
                    </div>
                  )}
                  {selectedBackup.encryption && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Шифрование</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBackup.metadata && (
                <div>
                  <Label>Метаданные</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    {selectedBackup.metadata.recordsCount && (
                      <div>Записей: {selectedBackup.metadata.recordsCount.toLocaleString()}</div>
                    )}
                    {selectedBackup.metadata.tablesCount && (
                      <div>Таблиц: {selectedBackup.metadata.tablesCount}</div>
                    )}
                    {selectedBackup.metadata.compressionRatio && (
                      <div>Сжатие: {(selectedBackup.metadata.compressionRatio * 100).toFixed(1)}%</div>
                    )}
                    {selectedBackup.metadata.checksum && (
                      <div className="col-span-2">
                        <div>Контрольная сумма:</div>
                        <div className="font-mono text-xs break-all">{selectedBackup.metadata.checksum}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupDashboard;