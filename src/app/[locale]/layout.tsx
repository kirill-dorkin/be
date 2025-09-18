import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { locales, type Locale } from '@/lib/locales';
import { ensureDefaultAdmin } from '@/lib/initAdmin';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';

export const metadata = {
  title: "Best Electronics",
  description: "Electronics Service Management",
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Проверяем, что локаль поддерживается
  if (!locales.includes(locale)) {
    notFound();
  }

  // Получаем сообщения для данной локали
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  
  // Ensure default admin exists
  await ensureDefaultAdmin();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <PWAInstaller />
    </NextIntlClientProvider>
  );
}