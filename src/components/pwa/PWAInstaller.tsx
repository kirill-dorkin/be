'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstaller() {
  const t = useTranslations();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверяем, является ли устройство iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Проверяем, запущено ли приложение в standalone режиме
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Проверяем, установлено ли приложение
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
        setIsInstalled(relatedApps.length > 0);
      });
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Сохраняем в localStorage, что пользователь отклонил установку
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Не показываем промпт если:
  // - Приложение уже установлено
  // - Запущено в standalone режиме
  // - Пользователь недавно отклонил установку
  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null;
  }

  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) { // Не показываем 7 дней после отклонения
      return null;
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle className="text-sm">{t('pwa.install.title')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          {t('pwa.install.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-2 text-xs">
            <p className="flex items-center space-x-2">
              <span>1.</span>
              <span>Tap the Share button</span>
            </p>
            <p className="flex items-center space-x-2">
              <span>2.</span>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </p>
            <p className="flex items-center space-x-2">
              <span>3.</span>
              <span>Tap "Add" to install</span>
            </p>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1"
              disabled={!deferredPrompt}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('pwa.install.button')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
            >
              {t('common.later')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PWAStatus() {
  const t = useTranslations();
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isStandalone) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span>
        {isOnline ? 'Online' : 'Offline'}
      </span>
      <Monitor className="h-3 w-3" />
    </div>
  );
}