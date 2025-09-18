'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePWA } from '@/hooks/usePWA';

interface NotificationSettings {
  enabled: boolean;
  backups: boolean;
  system: boolean;
  security: boolean;
}

export function NotificationManager() {
  const t = useTranslations();
  const { requestNotificationPermission, showNotification } = usePWA();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    backups: true,
    system: true,
    security: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Проверяем текущее разрешение на уведомления
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        // Регистрируем подписку на push уведомления
        await registerPushSubscription();
        
        const newSettings = { ...settings, enabled: true };
        setSettings(newSettings);
        localStorage.setItem('notification-settings', JSON.stringify(newSettings));
        
        // Показываем тестовое уведомление
        showNotification(t('pwa.notifications.permission.title'), {
          body: t('pwa.notifications.permission.description'),
          tag: 'welcome'
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      // Отменяем подписку на push уведомления
      await unregisterPushSubscription();
      
      const newSettings = { ...settings, enabled: false };
      setSettings(newSettings);
      localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const registerPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Отправляем подписку на сервер
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscribe',
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to register push subscription:', error);
    }
  };

  const unregisterPushSubscription = async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Уведомляем сервер об отписке
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'unsubscribe',
            subscription: subscription.toJSON()
          })
        });
      }
    } catch (error) {
      console.error('Failed to unregister push subscription:', error);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted' && settings.enabled) {
      showNotification('Тестовое уведомление', {
        body: 'Это тестовое уведомление для проверки работы системы',
        tag: 'test',
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle>{t('pwa.notifications.permission.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('pwa.notifications.permission.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной переключатель уведомлений */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {settings.enabled ? 'Уведомления включены' : 'Уведомления отключены'}
            </div>
            <div className="text-xs text-muted-foreground">
              {permission === 'denied' 
                ? 'Разрешение отклонено в браузере'
                : permission === 'default'
                ? 'Разрешение не запрошено'
                : 'Разрешение предоставлено'
              }
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {permission === 'granted' && settings.enabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
              >
                Тест
              </Button>
            )}
            {permission === 'granted' ? (
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked: boolean) => {
                if (checked) {
                  handleEnableNotifications();
                } else {
                  handleDisableNotifications();
                }
              }}
                disabled={isLoading}
              />
            ) : (
              <Button
                onClick={handleEnableNotifications}
                disabled={isLoading || permission === 'denied'}
                size="sm"
              >
                {isLoading ? 'Загрузка...' : t('pwa.notifications.permission.allow')}
              </Button>
            )}
          </div>
        </div>

        {/* Детальные настройки */}
        {settings.enabled && permission === 'granted' && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Типы уведомлений</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm">Резервные копии</div>
                  <div className="text-xs text-muted-foreground">
                    Уведомления о создании и статусе резервных копий
                  </div>
                </div>
                <Switch
                  checked={settings.backups}
                  onCheckedChange={(checked: boolean) => handleSettingChange('backups', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm">Система</div>
                  <div className="text-xs text-muted-foreground">
                    Системные уведомления и обновления
                  </div>
                </div>
                <Switch
                  checked={settings.system}
                  onCheckedChange={(checked: boolean) => handleSettingChange('system', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm">Безопасность</div>
                  <div className="text-xs text-muted-foreground">
                    Уведомления о безопасности и входах в систему
                  </div>
                </div>
                <Switch
                  checked={settings.security}
                  onCheckedChange={(checked: boolean) => handleSettingChange('security', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Информация для заблокированных уведомлений */}
        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <BellOff className="h-4 w-4 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                Уведомления заблокированы в браузере. Для включения перейдите в настройки сайта.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Вспомогательная функция для конвертации VAPID ключа
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}