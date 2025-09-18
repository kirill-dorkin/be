'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface CacheInfo {
  name: string;
  size: number;
  lastModified: Date;
}

interface CacheManagerProps {
  className?: string;
}

export default function CacheManager({ className }: CacheManagerProps) {
  const t = useTranslations();
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{
    used: number;
    quota: number;
  } | null>(null);

  // Получение информации о кэшах
  const getCacheInfo = async () => {
    if (!('caches' in window)) return;
    
    setIsLoading(true);
    try {
      const cacheNames = await window.caches.keys();
      const cacheInfos: CacheInfo[] = [];
      
      for (const name of cacheNames) {
        const cache = await window.caches.open(name);
        const keys = await cache.keys();
        
        cacheInfos.push({
          name,
          size: keys.length,
          lastModified: new Date()
        });
      }
      
      setCaches(cacheInfos);
    } catch (error) {
      console.error('Error getting cache info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение информации о хранилище
  const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        });
      } catch (error) {
        console.error('Error getting storage usage:', error);
      }
    }
  };

  // Очистка кэша
  const clearCache = async (cacheName?: string) => {
    if (!('caches' in window)) return;
    
    setIsLoading(true);
    try {
      if (cacheName) {
        await window.caches.delete(cacheName);
      } else {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      }
      
      await getCacheInfo();
      await getStorageUsage();
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление кэша
  const updateCache = async () => {
    if ('serviceWorker' in navigator) {
      setIsLoading(true);
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'UPDATE_CACHE' });
        }
        
        // Обновляем информацию через некоторое время
        setTimeout(() => {
          getCacheInfo();
          getStorageUsage();
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error updating cache:', error);
        setIsLoading(false);
      }
    }
  };

  // Форматирование размера
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    getCacheInfo();
    getStorageUsage();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Управление кэшем
        </h3>
        <div className="flex gap-2">
          <button
            onClick={updateCache}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Обновление...' : 'Обновить'}
          </button>
          <button
            onClick={() => clearCache()}
            disabled={isLoading}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            Очистить всё
          </button>
        </div>
      </div>

      {/* Информация о хранилище */}
      {storageUsage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Использование хранилища</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(storageUsage.used / storageUsage.quota) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.quota)}
            </div>
          </div>
        </div>
      )}

      {/* Список кэшей */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Активные кэши</h4>
        {caches.length === 0 ? (
          <p className="text-gray-500 text-sm">Кэши не найдены</p>
        ) : (
          caches.map((cache) => (
            <div key={cache.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{cache.name}</div>
                <div className="text-sm text-gray-500">
                  {cache.size} элементов • Обновлён {cache.lastModified.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => clearCache(cache.name)}
                disabled={isLoading}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 disabled:opacity-50"
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>

      {/* Статус офлайн */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Статус подключения</h4>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            navigator.onLine ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {navigator.onLine ? 'Онлайн' : 'Офлайн'}
          </span>
        </div>
      </div>
    </div>
  );
}