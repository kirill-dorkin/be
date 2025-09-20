import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/providers/AppProvider";
import "./globals.css";
import Providers from "./providers";
import { getSession } from "@/auth";
import { ensureDefaultAdmin } from "@/lib/initAdmin";
import ClientHeader from "@/components/ClientHeader";
import { PerformanceProvider } from "@/providers/PerformanceProvider";


const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Best Electronics",
  description: "Electronics Service Management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.DB_URL) {
    await ensureDefaultAdmin()
  }
  const session = await getSession()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.example.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <AppProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <PerformanceProvider>
            <Providers session={session}>
              {(!session || session.user.role === "user") && <ClientHeader />}
              <div className="w-svw">{children}</div>
              <Toaster />
            </Providers>
          </PerformanceProvider>
        </body>
      </AppProvider>
    </html>
  );
}
