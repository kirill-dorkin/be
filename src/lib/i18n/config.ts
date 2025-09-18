export const defaultLocale = 'ru' as const;
export const locales = ['ru', 'en'] as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  ru: '🇷🇺',
  en: '🇺🇸',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return defaultLocale;
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    return '/' + segments.slice(2).join('/');
  }
  
  return pathname;
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname);
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}