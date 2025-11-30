import "@nimara/ui/styles/globals";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@nimara/ui/components/toaster";

import { ErrorServiceServer } from "@/components/error-service";
import { clientEnvs } from "@/envs/client";
import { aspekta } from "@/fonts";
import { routing } from "@/i18n/routing";
import { themePreloadScript } from "@/lib/scripts/theme-preload-script";
import { cn } from "@/lib/utils";
import { ClientThemeProvider } from "@/providers/theme-provider";
import { RegionProvider } from "@/regions/client/region-provider";
import { getCurrentRegion } from "@/regions/server";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL),
  title: {
    template: `%s | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
    default: clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const [messages, region] = await Promise.all([
    getMessages(),
    getCurrentRegion(),
  ]);

  return (
    <html lang={locale ?? "en"} suppressHydrationWarning>
      <head>
        {/* Resource Hints для оптимизации производительности */}
        {/* API и CDN */}
        <link
          rel="preconnect"
          href={clientEnvs.NEXT_PUBLIC_SALEOR_API_URL}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={clientEnvs.NEXT_PUBLIC_SALEOR_API_URL} />
        <link
          rel="preconnect"
          href="https://cdn.buttercms.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.buttercms.com" />
        {/* Google Fonts - критически важно для производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          "min-h-[100dvh]",
          "flex flex-col",
          "bg-background",
          "text-foreground text-base font-medium leading-[1.55] md:text-[17px]",
          "overscroll-none",
          aspekta.className,
        )}
      >
        <Script
          id="theme-preload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themePreloadScript }}
        />
        <ClientThemeProvider>
          <RegionProvider initialRegion={region}>
            <NextIntlClientProvider messages={messages}>
              <NuqsAdapter>
                {children}
                <SpeedInsights />
                <Toaster />
                <ErrorServiceServer />
              </NuqsAdapter>
            </NextIntlClientProvider>
          </RegionProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
