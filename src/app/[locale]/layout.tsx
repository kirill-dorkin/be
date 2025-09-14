import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/lib/locales';
import { ensureDefaultAdmin } from '@/lib/initAdmin';

export const metadata = {
  title: "Best Electronics",
  description: "Electronics Service Management",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });
  
  // Ensure default admin exists
  await ensureDefaultAdmin();

  return (
    <NextIntlClientProvider key={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}