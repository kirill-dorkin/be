import { ReactNode } from "react";
import AdaptiveLayout from "@/components/dashboard/AdaptiveLayout";
import { I18nProvider } from '@/lib/i18n/provider';
import { getDictionary } from '@/lib/i18n/server';
import { defaultLocale } from '@/lib/i18n/config';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Load dictionary for default locale (ru)
  const dictionary = await getDictionary(defaultLocale);
  
  return (
    <I18nProvider locale={defaultLocale} dictionary={dictionary}>
      <AdaptiveLayout userRole="admin">
        {children}
      </AdaptiveLayout>
    </I18nProvider>
  );
}