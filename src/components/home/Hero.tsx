"use client";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
    <section
      className="relative bg-background h-screen flex items-center justify-center text-foreground bg-cover bg-center"
    >
      <div className="relative flex flex-col items-center text-center px-6 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
          Laptop Service Management System
        </h1>
        <p className="mb-8 max-w-xl">
          We provide professional laptop repairs and upgrades. Use the request
          button below to book a service, or log in if you are an employee.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isLoggedIn && (
            <Button size="lg" asChild className="w-fit">
              <Link href="/request">Request Repair</Link>
            </Button>
          )}
          {isLoggedIn && (
            <>
              <Button size="lg" className="w-fit" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-fit"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
