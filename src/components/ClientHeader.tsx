"use client";
import Link from "next/link";
import BaseContainer from "@/components/BaseContainer";
import { useState } from "react";

export default function ClientHeader() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/products", label: "Магазин" },
  ];

  return (
    <>
      <header className="w-full">
        <BaseContainer className="flex items-center justify-between py-4">
        <Link href="/" prefetch={false} className="flex items-center gap-2 text-xl font-semibold">
          Best Electronics
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="hover:text-primary transition-colors font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden relative z-50">
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
      </div>
    </>
  );
}
