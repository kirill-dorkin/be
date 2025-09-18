'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Archive, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  FileText, 
  HardDrive, 
  History, 
  Play, 
  RefreshCw, 
  Settings, 
  Shield, 
  Upload, 
  XCircle,
  AlertTriangle,
  Server,
  CloudDownload,
  CloudUpload,
  Trash2,
  Eye,
  RotateCcw,
  Save,
  FolderOpen
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

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
  retention: number; // дни
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

const mockBackups: BackupEntry[] = [
  {
    id: '1',
    name: 'Полное резервное копирование',
    type: 'full',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    size: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
    duration: 1800, // 30 минут
    description: 'Еженедельное полное резервное копирование всех данных',
    tables: ['users', 'products', 'orders', 'categories', 'logs'],
    compression: true,
    encryption: true,
    location: 'cloud',
    metadata: {
      recordsCount: 125000,
      tablesCount: 15,
      compressionRatio: 0.65,
      checksum: 'sha256:a1b2c3d4e5f6...'
    }
  },
  {
    id: '2',
    name: 'Инкрементальное копирование',
    type: 'incremental',
    status: 'completed',
    createdAt: '2024-01-14T02:00:00Z',
    size: 150 * 1024 * 1024, // 150 MB
    duration: 300, // 5 минут
    description: 'Ежедневное инкрементальное копирование изменений',
    tables: ['orders', 'logs', 'users'],
    compression: true,
    encryption: true,
    location: 'local',
    metadata: {
      recordsCount: 2500,
      tablesCount: 3,
      compressionRatio: 0.45
    }
  },
  {
    id: '3',
    name: 'Резервная копия перед обновлением',
    type: 'full',
    status: 'running',
    createdAt: '2024-01-15T14:45:00Z',
    size: 0,
    duration: 0,
    description: 'Создание резервной копии перед обновлением системы',
    tables: ['users', 'products', 'orders', 'categories'],
    compression: true,
    encryption: true,
    location: 'local'
  },
  {
    id: '4',
    name: 'Аварийное копирование',
    type: 'differential',
    status: 'failed',
    createdAt: '2024-01-13T18:20:00Z',
    size: 0,
    duration: 120,
    description: 'Неудачная попытка создания резервной копии',
    tables: ['products', 'categories'],
    compression: false,
    encryption: false,
    location: 'external'
  }
];

const mockRestorePoints: RestorePoint[] = [
  {
    id: '1',
    backupId: '1',
    name: 'Стабильная версия v2.1',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'available',
    size: 2.5 * 1024 * 1024 * 1024,
    description: 'Точка восстановления после успешного обновления'
  },
  {
    id: '2',
    backupId: '2',
    name: 'Перед миграцией БД',
    timestamp: '2024-01-14T02:00:00Z',
    status: 'available',
    size: 2.3 * 1024 * 1024 * 1024,
    description: 'Состояние системы перед миграцией базы данных'
  },
  {
    id: '3',
    backupId: '1',
    name: 'Конец рабочего дня',
    timestamp: '2024-01-12T18:00:00Z',
    status: 'available',
    size: 2.1 * 1024 * 1024 * 1024,
    description: 'Ежедневная точка восстановления'
  }
];

const mockConfig: BackupConfig = {
  autoBackup: true,
  schedule: '0 2 * * *', // Каждый день в 2:00
  retention: 30,
  compression: true,
  encryption: true,
  location: 'cloud',
  maxBackups: 10,
  notifyOnSuccess: true,
  notifyOnFailure: true,
  excludeTables: ['temp_logs', 'sessions']
};

type TabType = 'backups' | 'restore' | 'schedule' | 'settings';
type BackupLocation = 'local' | 'cloud' | 'external';

export default function BackupSystem() {
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [activeTab, setActiveTab] = useState<TabType>('backups');
  const [backups, setBackups] = useState<BackupEntry[]>(mockBackups);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>(mockRestorePoints);
  const [config, setConfig] = useState<BackupConfig>(mockConfig);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0 сек';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return RefreshCw;
      case 'failed': return XCircle;
      case 'scheduled': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return Database;
      case 'incremental': return Archive;
      case 'differential': return HardDrive;
      default: return Database;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud': return CloudUpload;
      case 'local': return HardDrive;
      case 'external': return Server;
      default: return HardDrive;
    }
  };

  const createBackup = async (type: 'full' | 'incremental' | 'differential') => {
    setLoading(true);
    try {
      // Имитация создания резервной копии
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: BackupEntry = {
        id: Date.now().toString(),
        name: `${type === 'full' ? 'Полное' : type === 'incremental' ? 'Инкрементальное' : 'Дифференциальное'} копирование`,
        type,
        status: 'running',
        createdAt: new Date().toISOString(),
        size: 0,
        duration: 0,
        description: 'Создание резервной копии...',
        tables: ['users', 'products', 'orders'],
        compression: config.compression,
        encryption: config.encryption,
        location: config.location
      };
      
      setBackups(prev => [newBackup, ...prev]);
      showSuccessToast({ title: 'Успех', description: 'Резервное копирование запущено' });
      
      // Имитация завершения
      setTimeout(() => {
        setBackups(prev => prev.map(backup => 
          backup.id === newBackup.id 
            ? { ...backup, status: 'completed' as const, size: Math.random() * 1000000000, duration: Math.floor(Math.random() * 1800) }
            : backup
        ));
        showSuccessToast({ title: 'Успех', description: 'Резервное копирование завершено' });
      }, 5000);
      
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка создания резервной копии' });
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      showSuccessToast({ title: 'Успех', description: 'Резервная копия удалена' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка удаления резервной копии' });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Имитация скачивания
      showSuccessToast({ title: 'Успех', description: 'Резервная копия готова к скачиванию' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка скачивания резервной копии' });
    } finally {
      setLoading(false);
    }
  };

  const restoreFromBackup = async (restorePointId: string) => {
    if (!confirm('Вы уверены, что хотите восстановить систему из этой точки? Все текущие данные будут заменены.')) {
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showSuccessToast({ title: 'Успех', description: 'Восстановление из резервной копии завершено' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка восстановления из резервной копии' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast({ title: 'Успех', description: 'Настройки сохранены' });
    } catch (error) {
      showErrorToast({ title: 'Ошибка', description: 'Ошибка сохранения настроек' });
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
            { id: 'backups', label: 'Резервные копии', icon: Archive },
            { id: 'restore', label: 'Восстановление', icon: RotateCcw },
            { id: 'schedule', label: 'Расписание', icon: Calendar },
            { id: 'settings', label: 'Настройки', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
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

      {/* Вкладка резервных копий */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Заголовок и действия */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Резервные копии</h2>
              <p className="text-gray-600">Управление резервными копиями данных</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => createBackup('incremental')}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Archive className="w-4 h-4" />
                <span>Инкрементальная</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createBackup('differential')}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <HardDrive className="w-4 h-4" />
                <span>Дифференциальная</span>
              </Button>
              <Button
                size="sm"
                onClick={() => createBackup('full')}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Database className="w-4 h-4" />
                <span>Полная копия</span>
              </Button>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего копий</p>
                    <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
                  </div>
                  <Archive className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Успешные</p>
                    <p className="text-2xl font-bold text-green-600">
                      {backups.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Общий размер</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Последняя копия</p>
                    <p className="text-sm font-bold text-gray-900">
                      {backups.length > 0 
                        ? new Date(backups[0].createdAt).toLocaleDateString('ru-RU')
                        : 'Нет данных'
                      }
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Список резервных копий */}
          <div className="space-y-4">
            {backups.map((backup) => {
              const StatusIcon = getStatusIcon(backup.status);
              const TypeIcon = getTypeIcon(backup.type);
              const LocationIcon = getLocationIcon(backup.location);
              
              return (
                <Card key={backup.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={cn(
                          "p-3 rounded-full flex-shrink-0",
                          getStatusColor(backup.status)
                        )}>
                          <StatusIcon className={cn(
                            "w-5 h-5",
                            backup.status === 'running' && "animate-spin"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{backup.name}</h3>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <TypeIcon className="w-3 h-3" />
                              <span className="capitalize">{backup.type}</span>
                            </Badge>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <LocationIcon className="w-3 h-3" />
                              <span className="capitalize">{backup.location}</span>
                            </Badge>
                          </div>
                          
                          {backup.description && (
                            <p className="text-gray-600 mb-3">{backup.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(backup.createdAt).toLocaleString('ru-RU')}</span>
                            </div>
                            
                            {backup.size > 0 && (
                              <div className="flex items-center space-x-1">
                                <HardDrive className="w-4 h-4" />
                                <span>{formatFileSize(backup.size)}</span>
                              </div>
                            )}
                            
                            {backup.duration > 0 && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(backup.duration)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              <Database className="w-4 h-4" />
                              <span>{backup.tables.length} таблиц</span>
                            </div>
                          </div>
                          
                          {backup.metadata && (
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              {backup.metadata.recordsCount && (
                                <span>{backup.metadata.recordsCount.toLocaleString()} записей</span>
                              )}
                              {backup.metadata.compressionRatio && (
                                <span>Сжатие: {Math.round(backup.metadata.compressionRatio * 100)}%</span>
                              )}
                              {backup.encryption && (
                                <span className="flex items-center space-x-1">
                                  <Shield className="w-3 h-3" />
                                  <span>Зашифровано</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {backup.status === 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadBackup(backup.id)}
                              disabled={loading}
                              className="flex items-center space-x-1"
                            >
                              <Download className="w-4 h-4" />
                              <span>Скачать</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBackup(backup.id)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Детали</span>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                          disabled={loading || backup.status === 'running'}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Удалить</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {backups.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет резервных копий</h3>
                  <p className="text-gray-600 mb-4">Создайте первую резервную копию для защиты ваших данных</p>
                  <Button onClick={() => createBackup('full')} disabled={loading}>
                    Создать резервную копию
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Вкладка восстановления */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Восстановление данных</h2>
            <p className="text-gray-600">Восстановление системы из резервных копий</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Внимание!</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Восстановление из резервной копии заменит все текущие данные. 
                  Убедитесь, что вы создали актуальную резервную копию перед восстановлением.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {restorePoints.map((point) => (
              <Card key={point.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        point.status === 'available' ? 'text-green-600 bg-green-100' :
                        point.status === 'corrupted' ? 'text-red-600 bg-red-100' :
                        'text-gray-600 bg-gray-100'
                      )}>
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{point.name}</h3>
                        <p className="text-gray-600">{point.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(point.timestamp).toLocaleString('ru-RU')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <HardDrive className="w-4 h-4" />
                            <span>{formatFileSize(point.size)}</span>
                          </span>
                          <Badge 
                            variant={point.status === 'available' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {point.status === 'available' ? 'Доступна' :
                             point.status === 'corrupted' ? 'Повреждена' : 'Истекла'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreFromBackup(point.id)}
                        disabled={loading || point.status !== 'available'}
                        className="flex items-center space-x-1"
                      >
                        <Play className="w-4 h-4" />
                        <span>Восстановить</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Вкладка расписания */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Расписание резервного копирования</h2>
            <p className="text-gray-600">Настройка автоматического создания резервных копий</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Автоматическое резервное копирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Включить автоматическое копирование</h4>
                  <p className="text-sm text-gray-600">Создавать резервные копии по расписанию</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.autoBackup}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  className="w-4 h-4" 
                />
              </div>
              
              {config.autoBackup && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Расписание (cron)
                      </label>
                      <input
                        type="text"
                        value={config.schedule}
                        onChange={(e) => setConfig(prev => ({ ...prev, schedule: e.target.value }))}
                        placeholder="0 2 * * *"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Каждый день в 2:00 утра</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Хранить копии (дни)
                      </label>
                      <input
                        type="number"
                        value={config.retention}
                        onChange={(e) => setConfig(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Максимум копий
                      </label>
                      <input
                        type="number"
                        value={config.maxBackups}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxBackups: parseInt(e.target.value) }))}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Место хранения
                      </label>
                      <select
                        value={config.location}
                        onChange={(e) => setConfig(prev => ({ ...prev, location: e.target.value as BackupLocation }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="local">Локальное хранилище</option>
                        <option value="cloud">Облачное хранилище</option>
                        <option value="external">Внешний сервер</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Сжатие данных</h4>
                        <p className="text-sm text-gray-600">Уменьшить размер резервных копий</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.compression}
                        onChange={(e) => setConfig(prev => ({ ...prev, compression: e.target.checked }))}
                        className="w-4 h-4" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Шифрование</h4>
                        <p className="text-sm text-gray-600">Защитить данные шифрованием</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.encryption}
                        onChange={(e) => setConfig(prev => ({ ...prev, encryption: e.target.checked }))}
                        className="w-4 h-4" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Уведомления об успехе</h4>
                        <p className="text-sm text-gray-600">Отправлять уведомления при успешном копировании</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.notifyOnSuccess}
                        onChange={(e) => setConfig(prev => ({ ...prev, notifyOnSuccess: e.target.checked }))}
                        className="w-4 h-4" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Уведомления об ошибках</h4>
                        <p className="text-sm text-gray-600">Отправлять уведомления при ошибках</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={config.notifyOnFailure}
                        onChange={(e) => setConfig(prev => ({ ...prev, notifyOnFailure: e.target.checked }))}
                        className="w-4 h-4" 
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}

      {/* Вкладка настроек */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Настройки резервного копирования</h2>
            <p className="text-gray-600">Дополнительные параметры и конфигурация</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Исключения из резервного копирования</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Исключить таблицы
                  </label>
                  <textarea
                    value={config.excludeTables.join(', ')}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      excludeTables: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }))}
                    placeholder="temp_logs, sessions, cache"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Разделите названия таблиц запятыми</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Тестирование резервных копий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Регулярно проверяйте целостность ваших резервных копий
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" disabled={loading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Проверить последнюю копию
                </Button>
                <Button variant="outline" disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Проверить все копии
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Очистка старых копий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Удаление устаревших резервных копий для освобождения места
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Очистить старые копии
                </Button>
                <Button variant="outline" disabled={loading}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Анализ использования места
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить все настройки
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}