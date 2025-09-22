import type { Metadata } from "next";
import "./globals.css";
import { inter, FontPreloader, FontPerformanceMonitor } from "@/shared/lib/font-optimization";
import { Providers } from "@/shared/providers/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";
import { initializeAdmin } from "@/shared/lib/admin-init";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";

export const metadata: Metadata = {
  title: "Business Equipment Management",
  description: "Система управления бизнес-оборудованием",
  keywords: "equipment, management, business, tasks, devices",
  authors: [{ name: "Business Equipment Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Инициализируем админа при старте приложения
  await initializeAdmin();
  
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru">
      <head>
        <FontPreloader />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers session={session}>
          {children}
          <FontPerformanceMonitor />
          <PerformanceMetrics />
        </Providers>
      </body>
    </html>
  );
}
