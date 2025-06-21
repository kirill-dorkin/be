import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
