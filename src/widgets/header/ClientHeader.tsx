"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import AvatarMenu from "@/shared/ui/AvatarMenu";
import BaseContainer from "@/shared/ui/BaseContainer";

const navLinks = [
  { href: "#capabilities", label: "Сервис" },
  { href: "#atelier", label: "Пространство" },
  { href: "#signature-care", label: "Signature" },
  { href: "#testimonials", label: "Отзывы" },
  { href: "/shop", label: "Магазин" },
];

const serviceInfo = {
  scheduleLabel: "График работы",
  scheduleValue: "Ежедневно 09:00 — 19:00",
  phoneHref: "tel:+996501313114",
  phoneLabel: "+996 501‑31‑31‑14",
};

const BASE_HEADER_HEIGHT = 96;
const COMPACT_HEADER_HEIGHT = 72;

export default function ClientHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const heightRef = useRef(BASE_HEADER_HEIGHT);

  useEffect(() => {
    const root = document.documentElement;

    const setHeight = (value: number) => {
      if (heightRef.current === value) return;
      heightRef.current = value;
      root.style.setProperty("--header-height", `${value}px`);
      setIsCompact(value === COMPACT_HEADER_HEIGHT);
    };

    const handleScroll = () => {
      const shouldCompact = window.scrollY > 48;
      setHeight(shouldCompact ? COMPACT_HEADER_HEIGHT : BASE_HEADER_HEIGHT);
    };

    setHeight(BASE_HEADER_HEIGHT);
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      root.style.setProperty("--header-height", `${BASE_HEADER_HEIGHT}px`);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)] transition-transform duration-500 ease-out">
        <div className="pointer-events-none absolute inset-0 h-full border-b border-white/70 bg-white/35 backdrop-blur-3xl" />
        <BaseContainer
          className={`relative flex h-full items-center justify-between gap-8 transition-[padding] duration-500 ease-out ${
            isCompact ? "py-3" : "py-6"
          }`}
        >
          <div className="flex items-center gap-6">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.6em] text-neutral-600 transition-colors hover:text-neutral-900"
            >
              BE / SERVICE LAB
            </Link>
            <div className="hidden flex-col leading-tight lg:flex">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.55em] text-neutral-400">
                {serviceInfo.scheduleLabel}
              </span>
              <span className="text-[0.75rem] text-neutral-500">{serviceInfo.scheduleValue}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="hidden rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900 lg:inline-flex"
            >
              <Link href={serviceInfo.phoneHref}>{serviceInfo.phoneLabel}</Link>
            </Button>
            {!session && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="hidden rounded-full border border-neutral-300/80 bg-white/70 px-8 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900 lg:inline-flex"
              >
                <Link href="/login">Войти</Link>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="hidden h-12 rounded-full px-8 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-35px_rgba(15,15,15,0.5)] lg:inline-flex"
            >
              <Link href="/request">Оставить заявку</Link>
            </Button>
            {session && <AvatarMenu />}
            <button
              type="button"
              aria-label="Открыть меню"
              className="relative flex h-11 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span
                className={`absolute h-0.5 w-full bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-current transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
                }`}
              />
            </button>
          </div>
        </BaseContainer>
      </header>

      <div
        className={`fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(.25,.1,.25,1)] ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`relative flex h-full w-full max-w-xl flex-col justify-between overflow-hidden bg-white/80 px-10 py-16 text-left backdrop-blur-2xl transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute right-8 top-8 text-sm font-semibold uppercase tracking-[0.45em] text-neutral-400 transition-colors hover:text-neutral-900"
            onClick={() => setMenuOpen(false)}
          >
            Закрыть
          </button>

          <div className="mt-12 flex flex-col gap-16">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.55em] text-neutral-400">Навигация</span>
              <nav className="flex flex-col gap-6">
                {navLinks.map(({ href, label }, index) => (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center justify-between text-lg font-semibold tracking-[0.3em] text-neutral-600 transition-all duration-500 ${
                      menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <span className="uppercase">{label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div
              className={`space-y-3 text-neutral-500 transition-opacity duration-500 ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "360ms" }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.55em] text-neutral-400">Контакты</span>
              <p className="text-sm leading-7">{serviceInfo.scheduleValue}</p>
              <Link
                href={serviceInfo.phoneHref}
                prefetch={false}
                className="text-sm font-semibold uppercase tracking-[0.45em] text-neutral-600 transition-colors hover:text-neutral-900"
                onClick={() => setMenuOpen(false)}
              >
                {serviceInfo.phoneLabel}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {!session && (
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full border border-neutral-300/80 bg-white px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-all duration-500 hover:-translate-y-0.5 hover:text-neutral-900"
              >
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  Войти
                </Link>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgба(16,16,16,0.45)]"
            >
              <Link href="/request" onClick={() => setMenuOpen(false)}>
                Оставить заявку
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
