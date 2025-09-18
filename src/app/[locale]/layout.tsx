import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getServerSession } from 'next-auth';

import Providers from '@/app/providers';
import { authOptions } from '@/auth';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { locales, type Locale } from '@/lib/locales';

const SITE_NAME = 'Best Electronics';
const FALLBACK_SITE_URL = 'https://be.kg';

type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

type MetadataParams = {
  params: { locale: Locale };
};

const TITLES: Record<Locale, string> = {
  ru: 'Best Electronics — Управление сервисом',
  en: 'Best Electronics — Service Management',
  kg: 'Best Electronics — KG',
};

const DESCRIPTIONS: Record<Locale, string> = {
  ru: 'Система управления сервисным обслуживанием и заказами Best Electronics.',
  en: 'Best Electronics platform for managing repair requests and service workflows.',
  kg: 'Best Electronics платформасы тейлөө жана ремонт өтүнүчтөрүн башкаруу үчүн.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
  let metadataBase: URL;
  try {
    metadataBase = new URL(siteUrl);
  } catch {
    metadataBase = new URL(FALLBACK_SITE_URL);
  }
  const localePath = locale === 'ru' ? '' : `/${locale}`;
  const canonical = `${siteUrl}${localePath}`;
  const languageAlternates = locales.reduce<Record<string, string>>((acc, language) => {
    const path = language === 'ru' ? '' : `/${language}`;
    acc[language] = `${siteUrl}${path}`;
    return acc;
  }, {});
  languageAlternates['x-default'] = canonical;

  return {
    metadataBase,
    title: {
      default: TITLES[locale],
      template: `%s | ${SITE_NAME}`,
    },
    description: DESCRIPTIONS[locale],
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    applicationName: SITE_NAME,
    openGraph: {
      type: 'website',
      url: canonical,
      title: TITLES[locale],
      description: DESCRIPTIONS[locale],
      siteName: SITE_NAME,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLES[locale],
      description: DESCRIPTIONS[locale],
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icons/icon-192x192.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/icons/icon-192x192.png' }],
      other: [{ rel: 'mask-icon', url: '/icons/icon-192x192.svg', color: '#000000' }],
    },
    manifest: '/manifest.json',
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers session={session}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <PWAInstaller />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
