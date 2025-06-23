"use client";
import Link from "next/link";
import BaseContainer from "@/components/BaseContainer";
import AvatarMenu from "./AvatarMenu";
import ThemeToggle from "./ThemeToggle";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ClientHeader() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#hero", label: "Главная" },
    { href: "#about", label: "О нас" },
    { href: "#reviews", label: "Отзывы" },
    { href: "#contacts", label: "Контакты" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 dark:bg-background/80 border-b border-border shadow-sm">
        <BaseContainer className="flex items-center justify-between py-4">
        <Link href="#" prefetch={false} className="flex items-center gap-2 text-xl font-semibold">
          Best Electronics
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-4 md:hidden relative z-50">
          {session && <AvatarMenu />}
          <ThemeToggle />
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="relative w-6 h-5 focus:outline-none"
          >
            <span
              className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${
                open ? "opacity-0" : "top-1/2 -translate-y-1/2"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </button>
        </div>
      </BaseContainer>
      </header>
        <div
          className={`fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-6 text-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            onClick={() => setOpen(false)}
            className="hover:underline"
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </>
  );
}
