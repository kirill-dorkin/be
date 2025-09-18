import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Providers from '@/app/providers';
import './globals.css';
import type { Metadata, Viewport } from 'next';

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: {
    default: 'Best Electronics - Управление сервисом',
    template: '%s | Best Electronics'
  },
  description: 'Система управления электронным сервисом',
  keywords: ['электроника', 'сервис', 'управление', 'ремонт'],
  authors: [{ name: 'Best Electronics' }],
  creator: 'Best Electronics',
  publisher: 'Best Electronics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Best Electronics',
  },
  applicationName: 'Best Electronics',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Best Electronics',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#000000',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children
}: Props) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192.svg" color="#000000" />
      </head>
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}