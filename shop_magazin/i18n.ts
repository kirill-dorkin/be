import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from '@/lib/locales';

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if none provided
  const validLocale = locale && locales.includes(locale as (typeof locales)[number]) ? locale : 'ru';
  
  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

export { locales };