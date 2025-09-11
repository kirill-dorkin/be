import type { Metadata } from "next";
// import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/providers/AppProvider";
import "./globals.css";
import Providers from "./providers";
import { getSession } from "@/auth";
import { ensureDefaultAdmin } from "@/lib/initAdmin";
import ClientLayout from "@/components/ClientLayout";

// Using system fonts due to Google Fonts connectivity issues during build
// const montserrat = Montserrat({
//   subsets: ['latin'],
//   variable: '--font-montserrat',
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
//   fallback: ['system-ui', 'arial'],
//   display: 'swap',
// });

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
          className="font-sans antialiased"
        >
          <Providers session={session}>
            <ClientLayout session={session}>
              {children}
            </ClientLayout>
            <Toaster />
          </Providers>
        </body>
      </AppProvider>
    </html>
  );
}
