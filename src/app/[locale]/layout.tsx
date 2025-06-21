import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
import AppProvider from "@/providers/AppProvider";
import "../globals.css";
import Providers from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getSession } from "@/auth";
import { ensureDefaultAdmin } from "@/lib/initAdmin";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Best Electronics",
  description: "Electronics Service Management",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  await ensureDefaultAdmin()
  const session = await getSession()
  let messages
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="absolute top-4 right-4">
              <LanguageSwitcher />
            </div>
            <Providers session={session}>
              <div className="w-svw">{children}</div>
              <Toaster />
            </Providers>
          </NextIntlClientProvider>
        </AppProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ru' }]
}
