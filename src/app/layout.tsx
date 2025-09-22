import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FontPreloader } from "@/shared/lib/font-optimization";
import { Providers } from "@/shared/providers/Providers";
import { getServerSession } from "next-auth/next";
import authOptions from "@/auth";
import { PerformanceMetricsWrapper } from "@/components/PerformanceMetricsWrapper";

export const metadata: Metadata = {
  title: "BE.KG - Система управления бизнес-оборудованием",
  description: "Система управления бизнес-оборудованием",
  keywords: "equipment, management, business, tasks, devices",
  authors: [{ name: "Business Equipment Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru">
      <head>
        <FontPreloader />
      </head>
      <body className="antialiased font-sans">
        <Providers session={session}>
          {children}
          {/* <PerformanceMetricsWrapper /> */}
        </Providers>
      </body>
    </html>
  );
}
