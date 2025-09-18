'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Shield,
  Database,
  Palette,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Lock,
  Smartphone,
  Monitor,
  CreditCard,
  Languages,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Camera,
  LogOut
} from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  timezone: string;
  language: string;
}

interface AppSettings {
  // Профиль пользователя
  profile: UserProfile;
  
  // Общие настройки
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  
  // Настройки безопасности
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  enablePasswordHistory: boolean;
  enableAccountLockout: boolean;
  
  // Настройки уведомлений
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSMSNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  emailDigest: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  
  // Настройки производительности
  cacheEnabled: boolean;
  cacheTtl: number;
  enableCompression: boolean;
  maxFileSize: number;
  enableCDN: boolean;
  enableLazyLoading: boolean;
  
  // Настройки интеграций
  paymentProvider: 'stripe' | 'paypal' | 'both';
  enableAnalytics: boolean;
  analyticsProvider: 'google' | 'yandex' | 'custom';
  enableChatSupport: boolean;
  enableSocialLogin: boolean;
  
  // Настройки интерфейса
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  enableAnimations: boolean;
  enableSounds: boolean;
  
  // Настройки контента
  defaultLanguage: string;
  enableMultiLanguage: boolean;
  moderationEnabled: boolean;
  autoPublish: boolean;
  enableComments: boolean;
  enableRatings: boolean;
  
  // Системные настройки
  enableMaintenance: boolean;
  maintenanceMessage: string;
  enableDebugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableBackups: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

interface ValidationErrors {
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
  };
  general?: {
    siteName?: string;
    siteDescription?: string;
    siteUrl?: string;
    adminEmail?: string;
    supportEmail?: string;
  };
  security?: {
    passwordMinLength?: string;
    maxLoginAttempts?: string;
    sessionTimeout?: string;
  };
  performance?: {
    cacheTtl?: string;
    maxFileSize?: string;
  };
}

interface SettingsProps {
  className?: string;
}

export default function Settings({ className }: SettingsProps) {
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Загрузка настроек
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Ошибка загрузки настроек');
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки'
      });
    } finally {
      setLoading(false);
    }
  };

  // API функции
  const saveSettingsToAPI = async (settingsData: AppSettings) => {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  const loadSettingsFromAPI = async () => {
    const response = await fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  // Функции валидации
  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email обязателен';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Некорректный формат email';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Телефон не обязателен
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Некорректный формат телефона';
    }
    return null;
  };

  const validateUrl = (url: string): string | null => {
    if (!url) return 'URL обязателен';
    try {
      new URL(url);
      return null;
    } catch {
      return 'Некорректный формат URL';
    }
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} обязательно для заполнения`;
    }
    return null;
  };

  const validateNumber = (value: number, min: number, max: number, fieldName: string): string | null => {
    if (isNaN(value)) return `${fieldName} должно быть числом`;
    if (value < min) return `${fieldName} не может быть меньше ${min}`;
    if (value > max) return `${fieldName} не может быть больше ${max}`;
    return null;
  };

  // Валидация всех полей
  const validateAllFields = (): ValidationErrors => {
    if (!settings) return {};

    const errors: ValidationErrors = {};

    // Валидация профиля
    const profileErrors: ValidationErrors['profile'] = {};
    const firstNameError = validateRequired(settings.profile.firstName, 'Имя');
    if (firstNameError) profileErrors.firstName = firstNameError;

    const lastNameError = validateRequired(settings.profile.lastName, 'Фамилия');
    if (lastNameError) profileErrors.lastName = lastNameError;

    const emailError = validateEmail(settings.profile.email);
    if (emailError) profileErrors.email = emailError;

    const phoneError = validatePhone(settings.profile.phone);
    if (phoneError) profileErrors.phone = phoneError;

    if (Object.keys(profileErrors).length > 0) {
      errors.profile = profileErrors;
    }

    // Валидация общих настроек
    const generalErrors: ValidationErrors['general'] = {};
    const siteNameError = validateRequired(settings.siteName, 'Название сайта');
    if (siteNameError) generalErrors.siteName = siteNameError;

    const siteUrlError = validateUrl(settings.siteUrl);
    if (siteUrlError) generalErrors.siteUrl = siteUrlError;

    const adminEmailError = validateEmail(settings.adminEmail);
    if (adminEmailError) generalErrors.adminEmail = adminEmailError;

    const supportEmailError = validateEmail(settings.supportEmail);
    if (supportEmailError) generalErrors.supportEmail = supportEmailError;

    if (Object.keys(generalErrors).length > 0) {
      errors.general = generalErrors;
    }

    // Валидация настроек безопасности
    const securityErrors: ValidationErrors['security'] = {};
    const passwordLengthError = validateNumber(settings.passwordMinLength, 6, 32, 'Минимальная длина пароля');
    if (passwordLengthError) securityErrors.passwordMinLength = passwordLengthError;

    const maxAttemptsError = validateNumber(settings.maxLoginAttempts, 3, 10, 'Максимум попыток входа');
    if (maxAttemptsError) securityErrors.maxLoginAttempts = maxAttemptsError;

    const sessionTimeoutError = validateNumber(settings.sessionTimeout, 15, 1440, 'Время жизни сессии');
    if (sessionTimeoutError) securityErrors.sessionTimeout = sessionTimeoutError;

    if (Object.keys(securityErrors).length > 0) {
      errors.security = securityErrors;
    }

    // Валидация настроек производительности
    const performanceErrors: ValidationErrors['performance'] = {};
    const cacheTtlError = validateNumber(settings.cacheTtl, 60, 86400, 'Время жизни кеша');
    if (cacheTtlError) performanceErrors.cacheTtl = cacheTtlError;

    const maxFileSizeError = validateNumber(settings.maxFileSize, 1048576, 104857600, 'Максимальный размер файла');
    if (maxFileSizeError) performanceErrors.maxFileSize = maxFileSizeError;

    if (Object.keys(performanceErrors).length > 0) {
      errors.performance = performanceErrors;
    }

    return errors;
  };

  // Сохранение настроек
  const handleSave = async () => {
    if (!settings) return;
    
    // Валидация перед сохранением
    const errors = validateAllFields();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showErrorToast({
        title: 'Ошибка валидации',
        description: 'Пожалуйста, исправьте ошибки в форме перед сохранением'
      });
      return;
    }
    
    setSaving(true);
    try {
      await saveSettingsToAPI(settings);
      setHasChanges(false);
      setValidationErrors({}); // Очищаем ошибки после успешного сохранения
      showSuccessToast({
        title: 'Успешно',
        description: 'Настройки сохранены'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки'
      });
    } finally {
      setSaving(false);
    }
  };

  // Сброс настроек
  const handleReset = async () => {
    try {
      const response = await fetch('/api/admin/settings/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка сброса настроек');
      }
      
      await fetchSettings();
      setHasChanges(false);
      setValidationErrors({}); // Очищаем ошибки валидации при сбросе
      showSuccessToast({
        title: 'Успешно',
        description: 'Настройки сброшены к значениям по умолчанию'
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось сбросить настройки'
      });
    }
  };

  // Обновление настроек
  const updateSetting = useCallback((key: keyof AppSettings, value: string | number | boolean) => {
    if (!settings) return;
    
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
    setHasChanges(true);
  }, [settings]);

  // Обновление профиля пользователя
  const updateProfile = useCallback((key: keyof UserProfile, value: string) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      profile: { ...prev.profile, [key]: value }
    } : null);
    setHasChanges(true);
  }, [settings]);



  // Загрузка аватара
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB'
      });
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Ошибка загрузки аватара');

      const data = await response.json();
      updateProfile('avatar', data.avatarUrl);
      
      showSuccessToast({
        title: 'Успешно',
        description: 'Аватар обновлен'
      });
    } catch (error) {
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аватар'
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Экспорт настроек
  const handleExportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      showSuccessToast({
        title: 'Успешно',
        description: 'Настройки экспортированы'
      });
    } catch (error) {
      showErrorToast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать настройки'
      });
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const loadedSettings = await loadSettingsFromAPI();
        setSettings(loadedSettings.settings);
      } catch (error) {
        console.error('Error loading settings:', error);
        
        // Fallback к демо-данным при ошибке API
        const mockSettings: AppSettings = {
          profile: {
            firstName: 'Иван',
            lastName: 'Петров',
            email: 'admin@example.com',
            phone: '+7 (999) 123-45-67',
            bio: 'Системный администратор',
            avatar: '',
            timezone: 'Europe/Moscow',
            language: 'ru'
          },
          
          // Общие настройки
          siteName: 'Admin Panel',
          siteDescription: 'Панель администратора',
          siteUrl: 'https://example.com',
          adminEmail: 'admin@example.com',
          supportEmail: 'support@example.com',
          
          // Настройки безопасности
          enableTwoFactor: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requirePasswordChange: false,
          enablePasswordHistory: false,
          enableAccountLockout: true,
          
          // Настройки уведомлений
          enableEmailNotifications: true,
          enablePushNotifications: true,
          enableSMSNotifications: false,
          notificationFrequency: 'immediate',
          emailDigest: true,
          securityAlerts: true,
          marketingEmails: false,
          
          // Настройки производительности
          cacheEnabled: true,
          cacheTtl: 3600,
          enableCompression: true,
          maxFileSize: 10485760,
          enableCDN: false,
          enableLazyLoading: true,
          
          // Настройки интеграций
          paymentProvider: 'stripe',
          enableAnalytics: true,
          analyticsProvider: 'google',
          enableChatSupport: false,
          enableSocialLogin: false,
          
          // Настройки интерфейса
          primaryColor: '#3b82f6',
          fontSize: 'medium',
          enableAnimations: true,
          enableSounds: false,
          
          // Настройки контента
          defaultLanguage: 'ru',
          enableMultiLanguage: false,
          moderationEnabled: true,
          autoPublish: false,
          enableComments: true,
          enableRatings: true,
          
          // Системные настройки
          enableMaintenance: false,
          maintenanceMessage: 'Сайт находится на техническом обслуживании',
          enableDebugMode: false,
          logLevel: 'info',
          enableBackups: true,
          backupFrequency: 'daily'
        };
        
        setSettings(mockSettings);
        // Убираем showErrorToast из useEffect чтобы избежать бесконечного цикла
        console.warn('Не удалось загрузить настройки с сервера. Используются демо-данные.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
        <p className="text-gray-500 mb-4">Не удалось загрузить настройки</p>
        <Button onClick={fetchSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Настройки системы
              </h1>
              <p className="text-muted-foreground mt-1">
                Управление конфигурацией и параметрами приложения
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSettings}
                disabled={!settings}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="hidden sm:flex"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {saving ? (
                  <Spinner />
                ) : (
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Сохранить</span>
                <span className="sm:hidden">Сохр.</span>
              </Button>
            </div>
          </div>
          
          {hasChanges && (
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                У вас есть несохраненные изменения. Не забудьте сохранить их перед выходом.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-white shadow-sm border overflow-x-auto">
            <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Общие</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Безопасность</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Производительность</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Интеграции</span>
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Внешний вид</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  Общие настройки
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Основные параметры сайта и контактная информация
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-sm sm:text-base">Название сайта</Label>
                    <Input
                      id="siteName"
                      value={settings?.siteName || ''}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      placeholder="Введите название сайта"
                      className={`text-sm sm:text-base ${validationErrors.general?.siteName ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {validationErrors.general?.siteName && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.general.siteName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl" className="text-sm sm:text-base">URL сайта</Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      value={settings?.siteUrl || ''}
                      onChange={(e) => updateSetting('siteUrl', e.target.value)}
                      placeholder="https://example.com"
                      className={`text-sm sm:text-base ${validationErrors.general?.siteUrl ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {validationErrors.general?.siteUrl && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.general.siteUrl}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-sm sm:text-base">Описание сайта</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings?.siteDescription || ''}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    placeholder="Краткое описание вашего сайта"
                    rows={3}
                    className="text-sm sm:text-base resize-none"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-medium text-base sm:text-lg">Контактная информация</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-sm sm:text-base">Email администратора</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings?.adminEmail || ''}
                        onChange={(e) => updateSetting('adminEmail', e.target.value)}
                        placeholder="admin@example.com"
                        className={`text-sm sm:text-base ${validationErrors.general?.adminEmail ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {validationErrors.general?.adminEmail && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.general.adminEmail}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail" className="text-sm sm:text-base">Email поддержки</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings?.supportEmail || ''}
                        onChange={(e) => updateSetting('supportEmail', e.target.value)}
                        placeholder="support@example.com"
                        className={`text-sm sm:text-base ${validationErrors.general?.supportEmail ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {validationErrors.general?.supportEmail && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.general.supportEmail}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 sm:mt-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Avatar Section */}
              <Card className="lg:col-span-1">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Фото профиля
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                      {settings?.profile?.avatar ? (
                        <img
                          src={settings.profile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 sm:p-2 cursor-pointer transition-colors">
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarUploading}
                      />
                    </label>
                  </div>
                  {avatarUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner />
                      Загрузка...
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                    Рекомендуемый размер: 400x400px<br />
                    Максимальный размер: 5MB
                  </p>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Информация профиля</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Управление основной информацией профиля администратора
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm sm:text-base">Имя</Label>
                      <Input
                        id="firstName"
                        value={settings?.profile?.firstName || ''}
                        onChange={(e) => updateProfile('firstName', e.target.value)}
                        placeholder="Введите имя"
                        className={`text-sm sm:text-base ${validationErrors.profile?.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {validationErrors.profile?.firstName && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.profile.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm sm:text-base">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={settings?.profile?.lastName || ''}
                        onChange={(e) => updateProfile('lastName', e.target.value)}
                        placeholder="Введите фамилию"
                        className={`text-sm sm:text-base ${validationErrors.profile?.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {validationErrors.profile?.lastName && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.profile.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings?.profile?.email || ''}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      placeholder="admin@example.com"
                      className={`text-sm sm:text-base ${validationErrors.profile?.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {validationErrors.profile?.email && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.profile.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Телефон</Label>
                    <Input
                      id="phone"
                      value={settings?.profile?.phone || ''}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className={`text-sm sm:text-base ${validationErrors.profile?.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {validationErrors.profile?.phone && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.profile.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm sm:text-base">О себе</Label>
                    <Textarea
                      id="bio"
                      value={settings?.profile?.bio || ''}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      placeholder="Расскажите о себе..."
                      rows={3}
                      className={`text-sm sm:text-base resize-none ${validationErrors.profile?.bio ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {validationErrors.profile?.bio && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.profile.bio}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-sm sm:text-base">Часовой пояс</Label>
                      <Select
                        value={settings?.profile?.timezone || 'UTC'}
                        onValueChange={(value) => updateProfile('timezone', value)}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Выберите часовой пояс" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm sm:text-base">Язык</Label>
                      <Select
                        value={settings?.profile?.language || 'ru'}
                        onValueChange={(value) => updateProfile('language', value)}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    Параметры безопасности
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Настройки безопасности и аутентификации
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {/* Двухфакторная аутентификация */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Двухфакторная аутентификация</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Включить 2FA</Label>
                        <p className="text-sm text-muted-foreground">Дополнительная защита вашего аккаунта</p>
                      </div>
                      <Switch
                        checked={settings.enableTwoFactor}
                        onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
                      />
                    </div>
                    
                    {settings.enableTwoFactor && (
                      <Alert className="border-green-200 bg-green-50">
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Двухфакторная аутентификация активна. Ваш аккаунт защищен дополнительным уровнем безопасности.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Настройки паролей */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Политика паролей</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passwordMinLength" className="text-sm sm:text-base">Минимальная длина пароля</Label>
                        <Input
                          id="passwordMinLength"
                          type="number"
                          min="6"
                          max="32"
                          value={settings.passwordMinLength}
                          onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                          className={`text-sm sm:text-base ${validationErrors.security?.passwordMinLength ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {validationErrors.security?.passwordMinLength && (
                          <p className="text-sm text-red-600 mt-1">{validationErrors.security.passwordMinLength}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts" className="text-sm sm:text-base">Максимум попыток входа</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          min="3"
                          max="10"
                          value={settings.maxLoginAttempts}
                          onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                          className={`text-sm sm:text-base ${validationErrors.security?.maxLoginAttempts ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {validationErrors.security?.maxLoginAttempts && (
                          <p className="text-sm text-red-600 mt-1">{validationErrors.security.maxLoginAttempts}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Требовать смену пароля</Label>
                          <p className="text-sm text-muted-foreground">Принудительная смена пароля при первом входе</p>
                        </div>
                        <Switch
                          checked={settings.requirePasswordChange}
                          onCheckedChange={(checked) => updateSetting('requirePasswordChange', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>История паролей</Label>
                          <p className="text-sm text-muted-foreground">Запретить повторное использование старых паролей</p>
                        </div>
                        <Switch
                          checked={settings.enablePasswordHistory}
                          onCheckedChange={(checked) => updateSetting('enablePasswordHistory', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Блокировка аккаунта</Label>
                          <p className="text-sm text-muted-foreground">Автоматическая блокировка при превышении попыток входа</p>
                        </div>
                        <Switch
                          checked={settings.enableAccountLockout}
                          onCheckedChange={(checked) => updateSetting('enableAccountLockout', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Настройки сессий */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Управление сессиями</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-sm sm:text-base">Время жизни сессии (минуты)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="15"
                        max="1440"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className={`text-sm sm:text-base ${validationErrors.security?.sessionTimeout ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {validationErrors.security?.sessionTimeout && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.security.sessionTimeout}</p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">Автоматический выход из системы при неактивности</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" size="sm">
                         <LogOut className="h-4 w-4 mr-2" />
                         Завершить все сессии
                       </Button>
                      <span className="text-sm text-muted-foreground">Активных сессий: 3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
           <TabsContent value="notifications" className="mt-4 sm:mt-6">
             <div className="space-y-4 sm:space-y-6">
               <Card>
                 <CardHeader className="p-4 sm:p-6">
                   <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                     <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                     Настройки уведомлений
                   </CardTitle>
                   <CardDescription className="text-sm sm:text-base">
                     Управление уведомлениями и оповещениями системы
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                   <div className="space-y-3 sm:space-y-4">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">Email уведомления</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Получать уведомления на email</p>
                       </div>
                       <Switch
                         checked={settings.enableEmailNotifications}
                         onCheckedChange={(checked) => updateSetting('enableEmailNotifications', checked)}
                       />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">Push уведомления</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Показывать уведомления в браузере</p>
                       </div>
                       <Switch
                         checked={settings.enablePushNotifications}
                         onCheckedChange={(checked) => updateSetting('enablePushNotifications', checked)}
                       />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">SMS уведомления</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Получать критические уведомления по SMS</p>
                       </div>
                       <Switch
                         checked={settings.enableSMSNotifications}
                         onCheckedChange={(checked) => updateSetting('enableSMSNotifications', checked)}
                       />
                     </div>
                   </div>
                   
                   <Separator />
                   
                   <div className="space-y-3 sm:space-y-4">
                     <h4 className="font-medium text-base sm:text-lg">Типы уведомлений</h4>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">Email дайджест</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Еженедельная сводка событий на email</p>
                       </div>
                       <Switch
                         checked={settings.emailDigest}
                         onCheckedChange={(checked) => updateSetting('emailDigest', checked)}
                       />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">Оповещения безопасности</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Критические уведомления о безопасности</p>
                       </div>
                       <Switch
                         checked={settings.securityAlerts}
                         onCheckedChange={(checked) => updateSetting('securityAlerts', checked)}
                       />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                       <div className="space-y-1 flex-1">
                         <Label className="text-sm sm:text-base">Маркетинговые письма</Label>
                         <p className="text-xs sm:text-sm text-muted-foreground">Рекламные и информационные рассылки</p>
                       </div>
                       <Switch
                         checked={settings.marketingEmails}
                         onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <Label htmlFor="notificationFrequency" className="text-sm sm:text-base">Частота уведомлений</Label>
                       <Select
                         value={settings.notificationFrequency}
                         onValueChange={(value) => updateSetting('notificationFrequency', value)}
                       >
                         <SelectTrigger className="text-sm sm:text-base">
                           <SelectValue placeholder="Выберите частоту" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="immediate">Немедленно</SelectItem>
                           <SelectItem value="hourly">Каждый час</SelectItem>
                           <SelectItem value="daily">Ежедневно</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   
                   <Separator />
                   
                   <div className="space-y-3 sm:space-y-4">
                     <h4 className="font-medium text-base sm:text-lg">Расписание уведомлений</h4>
                     
                     <Alert className="border-blue-200 bg-blue-50">
                       <Info className="h-4 w-4" />
                       <AlertDescription>
                         Дополнительные настройки расписания уведомлений будут добавлены в следующих версиях.
                       </AlertDescription>
                     </Alert>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </TabsContent>
          
          <TabsContent value="performance" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                  Настройки производительности
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Оптимизация работы системы и производительности
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <Database className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium">Настройки производительности</h3>
                  <p className="text-sm sm:text-base text-gray-500">Будет реализовано в следующей версии</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  Интеграции
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Настройка внешних сервисов и API
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <Mail className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium">Настройки интеграций</h3>
                  <p className="text-sm sm:text-base text-gray-500">Будет реализовано в следующей версии</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                    Настройки интерфейса
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Персонализация внешнего вида и поведения интерфейса
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {/* Настройки цвета */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-base sm:text-lg">Цветовая схема</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-sm sm:text-base">Основной цвет</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-12 h-8 sm:w-16 sm:h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Настройки шрифтов */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-base sm:text-lg">Типографика</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fontSize" className="text-sm sm:text-base">Размер шрифта</Label>
                      <Select
                        value={settings.fontSize}
                        onValueChange={(value) => updateSetting('fontSize', value)}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Выберите размер" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Маленький</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="large">Большой</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Настройки анимаций */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-base sm:text-lg">Анимации и эффекты</h4>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="space-y-1 flex-1">
                        <Label className="text-sm sm:text-base">Включить анимации</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Плавные переходы и анимации интерфейса</p>
                      </div>
                      <Switch
                        checked={settings.enableAnimations}
                        onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="space-y-1 flex-1">
                        <Label className="text-sm sm:text-base">Звуковые эффекты</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">Звуки при взаимодействии с интерфейсом</p>
                      </div>
                      <Switch
                        checked={settings.enableSounds}
                        onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Предварительный просмотр */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-base sm:text-lg">Предварительный просмотр</h4>
                    
                    <div className="p-3 sm:p-4 border rounded-lg bg-card">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm sm:text-base">Пример интерфейса</h5>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.primaryColor }}></div>
                        </div>
                        <p className={`text-muted-foreground ${
                          settings.fontSize === 'small' ? 'text-xs sm:text-sm' : 
                          settings.fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                        }`}>
                          Это пример текста с выбранными настройками шрифта и цветовой схемы.
                        </p>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-primary"></div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-secondary"></div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
         </Tabs>
       </div>
     </div>
   );
 }