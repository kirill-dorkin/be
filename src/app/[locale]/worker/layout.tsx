"use client"
import { ReactNode } from "react";
import AdaptiveLayout from "@/components/dashboard/AdaptiveLayout";

export default function WorkerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AdaptiveLayout userRole="worker">
      {children}
    </AdaptiveLayout>
  );
}
