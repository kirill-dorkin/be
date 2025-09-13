'use client';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">{t('errors.pageNotFound') || 'Page not found'}</h2>
        <p className="text-muted-foreground mb-8">{t('errors.pageNotFoundDescription') || 'The page you are looking for does not exist.'}</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {t('navigation.home') || 'Go Home'}
        </a>
      </div>
    </div>
  );
}