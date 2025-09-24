"use client";

import { SessionProvider } from "next-auth/react";
import AppProvider from "@/providers/AppProvider";
import { ToastProvider } from "./ToastProvider";
// import { WebVitalsProvider } from "@/shared/ui/providers";
// import { PerformanceProvider } from "@/providers/PerformanceProvider";
// import { PerformanceMonitorInit } from "@/components/PerformanceMonitorInit";
// import { Toaster } from "@/shared/ui/toaster";
import { ReactNode } from "react";
import { CartProvider } from "@/providers/CartProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        {/* <PerformanceProvider> */}
          {/* <WebVitalsProvider enableInDevelopment={true}> */}
            {/* <PerformanceMonitorInit /> */}
            <CartProvider>
              <FavoritesProvider>
                {children}
              </FavoritesProvider>
            </CartProvider>
            <ToastProvider />
            {/* <Toaster /> */}
          {/* </WebVitalsProvider> */}
        {/* </PerformanceProvider> */}
      </AppProvider>
    </SessionProvider>
  );
}
