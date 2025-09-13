"use client";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Section from "@/components/launchui/Section";
import { useTranslations } from 'next-intl';

const Hero: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('hero');

  useEffect(() => {
    if (session?.user) return setIsLoggedIn(true);
    setIsLoggedIn(false);
  }, [session?.user]);

  const handleGoToDashboard = () => {
    const role = session?.user?.role;
    if (role === "worker") {
      router.push("/worker/my-tasks");
    } else {
      router.push("/admin/dashboard");
    }
  };


  const handleLogout = () => {
    signOut();
  };

  // Защита от скриншотов
  useEffect(() => {
    const preventScreenshot = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Блокировка контекстного меню
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Блокировка горячих клавиш для скриншотов
      document.addEventListener('keydown', (e) => {
        if (e.key === 'PrintScreen' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'u') ||
            e.key === 'F12') {
          e.preventDefault();
          return false;
        }
      });
    };
    
    preventScreenshot();
    
    return () => {
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, []);

  return (
    <Section
      id="hero"
      className="relative flex h-screen items-center justify-center bg-white"
    >
      {/* Минималистичный фон с тонким акцентом */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      
      {/* Тонкий декоративный элемент */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
      
      <div className="relative flex flex-col items-center text-center px-8 max-w-4xl mx-auto">
        {/* Основной заголовок */}
        <h1 className="apple-display-large text-gray-900 mb-8">
          {t('title')}
        </h1>
        
        {/* Подзаголовок */}
        <h2 className="apple-headline text-gray-600 mb-12 max-w-2xl">
          {t('subtitle')}
        </h2>
        
        {/* Описание */}
        <p className="apple-body text-gray-500 mb-16 max-w-xl">
          {t('description')}
        </p>
        
        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {!isLoggedIn && (
            <Button 
              size="lg" 
              asChild 
              className="apple-button bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 transition-all duration-200 border-0 shadow-sm hover:shadow-md"
            >
              <Link href="/request">{t('orderRepair')}</Link>
            </Button>
          )}
          {isLoggedIn && (
            <>
              <Button 
                size="lg" 
                className="apple-button bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 transition-all duration-200 border-0 shadow-sm hover:shadow-md" 
                onClick={handleGoToDashboard}
              >
                {t('goToDashboard')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="apple-button border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-3 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleLogout}
              >
                {t('logout')}
              </Button>
            </>
          )}
        </div>
        
        {/* Тонкий акцент внизу */}
        <div className="mt-20 w-12 h-px bg-gray-300" />
      </div>
    </Section>
  );
};

export default Hero;
