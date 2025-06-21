"use client";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

const languages = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const basePath = pathname.replace(/^\/[a-z]{2}/, "");

  return (
    <div className="flex gap-2 text-sm">
      {languages.map((lng) => (
        <Link
          key={lng.code}
          href={`/${lng.code}${basePath}` || "/"}
          className={
            locale === lng.code
              ? "font-bold underline"
              : "opacity-70 hover:underline"
          }
          prefetch={false}
        >
          {lng.label}
        </Link>
      ))}
    </div>
  );
}
