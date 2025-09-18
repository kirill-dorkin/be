import { ReactNode } from "react";
import { getServerSession } from 'next-auth';

import AdaptiveLayout from "@/components/dashboard/AdaptiveLayout";
import Providers from '@/app/providers';
import { authOptions } from '@/auth';
import { defaultLocale } from '@/lib/i18n/config';
import { I18nProvider } from '@/lib/i18n/provider';
import { getDictionary } from '@/lib/i18n/server';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [dictionary, session] = await Promise.all([
    getDictionary(defaultLocale),
    getServerSession(authOptions),
  ]);

  return (
    <Providers session={session}>
      <I18nProvider locale={defaultLocale} dictionary={dictionary}>
        <AdaptiveLayout userRole="admin">
          {children}
        </AdaptiveLayout>
      </I18nProvider>
    </Providers>
  );
}
