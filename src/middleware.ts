import createMiddleware from 'next-intl/middleware';
import { locales, type Locale } from '@/lib/locales';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'ru',

  // Always use locale prefix
  localePrefix: 'always',
  
  // Custom locale detection
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for admin routes
  if (pathname.startsWith('/admin')) {
    return;
  }
  
  // If accessing root path, check for preferred locale in cookie or use default
  if (pathname === '/') {
    const preferredLocale = request.cookies.get('preferred-locale')?.value;
    if (preferredLocale && locales.includes(preferredLocale as Locale)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}`;
      return Response.redirect(url);
    }
  }
  
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, exclude admin routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)'],
};