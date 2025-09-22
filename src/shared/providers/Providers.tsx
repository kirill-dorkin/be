"use client";

import { SessionProvider } from "next-auth/react";
import { WebVitalsProvider } from "@/shared/ui/providers";
import { PerformanceProvider } from "@/providers/PerformanceProvider";
import { PerformanceMonitorInit } from "@/components/PerformanceMonitorInit";
import { Toaster } from "@/shared/ui/toaster";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <PerformanceProvider>
        <WebVitalsProvider enableInDevelopment={true}>
          <PerformanceMonitorInit />
          {children}
          <Toaster />
        </WebVitalsProvider>
      </PerformanceProvider>
    </SessionProvider>
  );
}