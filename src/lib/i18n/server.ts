import { defaultLocale, type Locale } from './config';

// Server-side utility for getting dictionaries
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

// Types for translations
export type Dictionary = {
  common: Record<string, string>;
  navigation: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  admin: Record<string, string>;
  backup: Record<string, string>;
  monitoring: Record<string, string>;
  integrations: Record<string, string>;
  cache: Record<string, string>;
  pwa: Record<string, string>;
  notifications: Record<string, string>;
  [key: string]: Record<string, string>;
};

// Server-side translator function
export function createTranslator(dictionary: Dictionary) {
  return (key: string, fallback?: string) => {
    return getNestedTranslation(dictionary, key, fallback);
  };
}

// Helper function to get nested translations
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