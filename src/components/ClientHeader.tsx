"use client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import BaseContainer from "@/components/BaseContainer";
import AvatarMenu from "./AvatarMenu";
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
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/80 dark:bg-background/80 border-b border-border">
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
        <div className="flex items-center gap-4 md:hidden">
          {session && <AvatarMenu />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-muted">
                {open ? (
                  <AiOutlineClose className="text-2xl" />
                ) : (
                  <RxHamburgerMenu className="text-2xl" />
                )}
                <span className="sr-only">Открыть меню</span>
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full">
              <VisuallyHidden.Root>
                <SheetTitle>Меню</SheetTitle>
              </VisuallyHidden.Root>
              <div className="grid w-full p-4 gap-2" data-state={open ? "open" : "closed"}>
                {links.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className="text-sm font-medium hover:underline underline-offset-4 opacity-0 animate-menu-slide-down"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </BaseContainer>
    </header>
  );
}
