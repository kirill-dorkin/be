'use client';

import { usePathname } from 'next/navigation';
import { defaultLocale, locales, type Locale } from './config';

// Получение текущей локали из URL
export function useCurrentLocale(): Locale {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  
  return locales.includes(locale) ? locale : defaultLocale;
}

// Хук для получения словаря переводов
export function useDictionary() {
  const locale = useCurrentLocale();
  
  // В клиентских компонентах мы не можем использовать динамический импорт
  // Поэтому возвращаем функцию для получения переводов
  return {
    locale,
    t: (key: string, fallback?: string) => {
      // Это заглушка для клиентских компонентов
      // В реальном приложении здесь должна быть логика получения переводов
      return fallback || key;
    }
  };
}

// Утилита для получения переводов на сервере
export async function getDictionary(locale: Locale) {
  try {
    const dictionary = await import(`./dictionaries/${locale}.json`);
    return dictionary.default;
  } catch (error) {
    console.warn(`Dictionary for locale '${locale}' not found, falling back to '${defaultLocale}'`);
    const fallbackDictionary = await import(`./dictionaries/${defaultLocale}.json`);
    return fallbackDictionary.default;
  }
}

// Типы для переводов
export type Dictionary = {
  common: Record<string, string>;
  navigation: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  admin: Record<string, string>;
  backup: Record<string, string>;
};

// Утилита для получения вложенного значения по ключу
export function getNestedTranslation(obj: Record<string, unknown>, key: string, fallback?: string): string {
  const keys = key.split('.');
  let result: unknown = obj;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && result !== null && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return fallback || key;
    }
  }
  
  return typeof result === 'string' ? result : fallback || key;
}

// Функция для создания переводчика
export function createTranslator(dictionary: Dictionary) {
  return (key: string, fallback?: string): string => {
    return getNestedTranslation(dictionary, key, fallback);
  };
}

// Хук для переключения языка
export function useLanguageSwitcher() {
  const currentLocale = useCurrentLocale();
  const pathname = usePathname();
  
  const switchLanguage = (newLocale: Locale) => {
    // Удаляем текущую локаль из пути
    const segments = pathname.split('/').filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments.shift();
    }
    
    // Создаем новый путь с новой локалью
    const newPath = newLocale === defaultLocale 
      ? `/${segments.join('/')}`
      : `/${newLocale}/${segments.join('/')}`;
    
    // Перенаправляем на новый путь
    window.location.href = newPath;
  };
  
  return {
    currentLocale,
    availableLocales: locales,
    switchLanguage
  };
}