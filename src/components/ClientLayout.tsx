"use client";

import { useState, useEffect, ReactNode } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import ClientHeader from "@/components/ClientHeader";
import { Session } from "next-auth";

interface ClientLayoutProps {
  children: ReactNode;
  session: Session | null;
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симулируем загрузку приложения
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Минимальное время показа загрузочного экрана

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && <LoadingScreen />}
      
      {(!session || session.user.role === "user") && (
        <div className={`flex-shrink-0 ${isLoading ? "hidden" : ""}`}>
          <ClientHeader />
        </div>
      )}
      <main className={`flex-1 ${isLoading ? "hidden" : ""}`}>
        {children}
      </main>
    </div>
  );
}