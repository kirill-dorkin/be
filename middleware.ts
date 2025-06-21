import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from './i18n';

export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localeDetection: true,
  localePrefix,
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

