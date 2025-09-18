'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { type Locale } from './config';
import { type Dictionary, createTranslator } from './hooks';

interface I18nContextType {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

export function I18nProvider({ locale, dictionary, children }: I18nProviderProps) {
  const t = createTranslator(dictionary);

  const value: I18nContextType = {
    locale,
    dictionary,
    t
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Хук для получения только функции перевода
export function useTranslations() {
  const { t } = useI18n();
  return t;
}

// Хук для получения текущей локали
export function useLocale() {
  const { locale } = useI18n();
  return locale;
}