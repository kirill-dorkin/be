import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, isValidLocale, getLocaleFromPath } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Оптимизация для статических ресурсов
  if (pathname.match(/\.(js|css|woff|woff2|ttf|otf|eot|ico|png|jpg|jpeg|gif|svg|webp|avif)$/)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }
  
  // Skip middleware for admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  }
  
  // Проверяем, есть ли локаль в пути
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Если локаль отсутствует в пути
  if (pathnameIsMissingLocale) {
    // Получаем предпочитаемую локаль из cookies или заголовков
    const preferredLocale = getPreferredLocale(request);
    
    // Если это корневой путь и локаль по умолчанию, не добавляем префикс
    if (pathname === '/' && preferredLocale === defaultLocale) {
      return NextResponse.next();
    }
    
    // Перенаправляем с добавлением локали
    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url)
    );
  }

  // Получаем локаль из пути
  const locale = getLocaleFromPath(pathname);
  
  // Если локаль недействительна, перенаправляем на локаль по умолчанию
  if (!isValidLocale(locale)) {
    const newPathname = pathname.replace(/^\/[^/]+/, `/${defaultLocale}`);
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // Устанавливаем заголовки для оптимизации производительности
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  // Кэширование для страниц
  if (!pathname.includes('/admin') && !pathname.includes('/api')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
  
  // Безопасность
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

function getPreferredLocale(request: NextRequest): string {
  // Сначала проверяем cookies
  const cookieLocale = request.cookies.get('preferred-locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // Затем проверяем заголовок Accept-Language
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => lang.split('-')[0]); // Берем только основную часть языка (ru из ru-RU)

    for (const lang of preferredLanguages) {
      if (isValidLocale(lang)) {
        return lang;
      }
    }
  }

  // Возвращаем локаль по умолчанию
  return defaultLocale;
}

export const config = {
  matcher: [
    // Пропускаем внутренние пути Next.js и статические файлы
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|admin|api).*)',
    // Включаем корневой путь
    '/'
  ]
};