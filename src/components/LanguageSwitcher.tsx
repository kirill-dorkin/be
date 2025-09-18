'use client';

import { useState } from 'react';
import { useLanguageSwitcher } from '@/lib/i18n/hooks';
import { localeNames, localeFlags } from '@/lib/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showFlag?: boolean;
  showText?: boolean;
}

export default function LanguageSwitcher({
  className,
  variant = 'default',
  showFlag = true,
  showText = true
}: LanguageSwitcherProps = {}) {
  const { currentLocale, availableLocales, switchLanguage } = useLanguageSwitcher();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: string) => {
    switchLanguage(locale as any);
    setIsOpen(false);
  };

  const currentLocaleName = localeNames[currentLocale];
  const currentLocaleFlag = localeFlags[currentLocale];

  const renderTriggerContent = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <>
            <Globe className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 opacity-50" />
          </>
        );
      case 'compact':
        return (
          <>
            {showFlag && <span className="text-sm">{currentLocaleFlag}</span>}
            <span className="text-sm font-medium">{currentLocale.toUpperCase()}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </>
        );
      default:
        return (
          <>
            {showFlag && <span className="text-sm">{currentLocaleFlag}</span>}
            {showText && <span className="text-sm font-medium">{currentLocaleName}</span>}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </>
        );
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-2 px-2",
            variant === 'icon-only' && "w-8 px-0",
            className
          )}
        >
          {renderTriggerContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {availableLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              locale === currentLocale && "bg-accent"
            )}
          >
            <span className="text-sm">{localeFlags[locale]}</span>
            <span className="text-sm font-medium">{localeNames[locale]}</span>
            {locale === currentLocale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Компонент для мобильной версии
export function MobileLanguageSwitcher({ className }: { className?: string }) {
  const { currentLocale, availableLocales, switchLanguage } = useLanguageSwitcher();

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">Язык / Language</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableLocales.map((locale) => (
          <Button
            key={locale}
            variant={locale === currentLocale ? "default" : "outline"}
            size="sm"
            onClick={() => switchLanguage(locale)}
            className="flex items-center gap-2 justify-start"
          >
            <span className="text-sm">{localeFlags[locale]}</span>
            <span className="text-sm">{localeNames[locale]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}