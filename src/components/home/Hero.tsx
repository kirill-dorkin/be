"use client";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Section from "@/components/launchui/Section";
import Glow from "@/components/launchui/Glow";

const Hero: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();

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

  return (
    <Section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <Glow className="-z-10" variant="center" />
      <div className="relative flex flex-col items-center text-center px-6 z-10 gap-6">
        <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
          Система сервиса Best Electronics
        </h1>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Мы предлагаем профессиональный ремонт и модернизацию электроники.
          Используйте кнопку ниже, чтобы отправить заявку.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isLoggedIn && (
            <Button size="lg" asChild className="w-fit">
              <Link href="/request">Заказать ремонт</Link>
            </Button>
          )}
          {isLoggedIn && (
            <>
              <Button size="lg" className="w-fit" onClick={handleGoToDashboard}>
                Перейти в панель
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-fit"
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Hero;
