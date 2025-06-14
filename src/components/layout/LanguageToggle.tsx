
'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import type { Locale } from '@/context/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { t, setLanguage, currentLanguage } = useTranslations();

  const handleLanguageChange = (lang: Locale) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('settings.language')}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('settings.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} disabled={currentLanguage === 'en'}>
          {t('language.english')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('ne')} disabled={currentLanguage === 'ne'}>
          {t('language.nepali')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
