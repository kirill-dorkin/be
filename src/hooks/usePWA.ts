'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Расширяем типы Navigator для PWA API
interface NavigatorWithPWA extends Navigator {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<RelatedApplication[]>;
}

interface RelatedApplication {
  platform: string;
  url?: string;
  id?: string;
}

// Расширяем Window для PWA
interface WindowWithPWA extends Window {
  navigator: NavigatorWithPWA;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  isIOS: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  install: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  registerServiceWorker: () => Promise<ServiceWorkerRegistration | null>;
  updateServiceWorker: () => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isOnline: true,
    isIOS: false,
    deferredPrompt: null,
  });

  const [serviceWorkerRegistration, setServiceWorkerRegistration] = 
    useState<ServiceWorkerRegistration | null>(null);

  // Проверка состояния PWA
  useEffect(() => {
    const checkPWAState = async () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as NavigatorWithPWA).standalone === true;
      const isOnline = navigator.onLine;

      let isInstalled = false;
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as NavigatorWithPWA).getInstalledRelatedApps?.();
          isInstalled = (relatedApps?.length ?? 0) > 0;
        } catch (error) {
          console.warn('Failed to check installed apps:', error);
        }
      }

      setState(prev => ({
        ...prev,
        isIOS,
        isStandalone,
        isOnline,
        isInstalled,
      }));
    };

    checkPWAState();
  }, []);

  // Обработка событий установки
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Установка приложения
  const install = useCallback(async () => {
    if (!state.deferredPrompt) {
      throw new Error('No install prompt available');
    }

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          deferredPrompt: null,
        }));
      }
    } catch (error) {
      console.error('Failed to install app:', error);
      throw error;
    }
  }, [state.deferredPrompt]);

  // Запрос разрешения на уведомления
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  // Показ уведомления
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      if (serviceWorkerRegistration) {
        serviceWorkerRegistration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          ...options,
        });
      } else {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options,
        });
      }
    }
  }, [serviceWorkerRegistration]);

  // Регистрация Service Worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setServiceWorkerRegistration(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новая версия доступна
              console.log('New version available');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  // Обновление Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (serviceWorkerRegistration) {
      try {
        await serviceWorkerRegistration.update();
        
        // Отправляем сообщение для пропуска ожидания
        if (serviceWorkerRegistration.waiting) {
          serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      } catch (error) {
        console.error('Failed to update service worker:', error);
      }
    }
  }, [serviceWorkerRegistration]);

  // Автоматическая регистрация Service Worker
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  return {
    ...state,
    install,
    requestNotificationPermission,
    showNotification,
    registerServiceWorker,
    updateServiceWorker,
  };
}