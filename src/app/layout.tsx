import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/providers/AppProvider";
import "./globals.css";
import Providers from "./providers";
import { getSession } from "@/auth";
import { ensureDefaultAdmin } from "@/lib/initAdmin";
import ClientHeader from "@/components/ClientHeader";


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
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.DB_URL) {
    await ensureDefaultAdmin()
  }
  const session = await getSession()

  return (
    <html lang="en">
      <AppProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers session={session}>
            {(!session || session.user.role === "user") && <ClientHeader />}
            <div className="w-svw">{children}</div>
            <Toaster />
          </Providers>
        </body>
      </AppProvider>
    </html>
  );
}
