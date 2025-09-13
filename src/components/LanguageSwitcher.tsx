'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales } from '@/lib/locales';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'kg', name: 'Кыргызча', flag: '🇰🇬' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Extract locale from pathname as fallback
  const pathLocale = pathname.split('/')[1];
  const actualLocale = locales.includes(pathLocale as (typeof locales)[number]) ? pathLocale : locale;
  
  const currentLanguage = languages.find(lang => lang.code === actualLocale);

  // Save current locale to cookie on mount to ensure persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.cookie = `preferred-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale]);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === actualLocale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // Get the current path without the locale prefix
      const segments = pathname.split('/').filter(Boolean);
      const pathWithoutLocale = segments.length > 1 ? '/' + segments.slice(1).join('/') : '/';
      
      // Create the new path with the selected locale
      const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
      
      // Save the selected locale to cookies for persistence
       if (typeof window !== 'undefined') {
         document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
       }
      
      router.push(newPath);
      setIsOpen(false);
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          disabled={isPending}
        >
          {currentLanguage ? (
            <>
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
            </>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              actualLocale === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}