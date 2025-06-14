
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Locale } from '@/context/LanguageContext';
import { LanguageContext } from '@/context/LanguageContext';
import en from '@/locales/en.json';
import ne from '@/locales/ne.json';

const translations: Record<Locale, typeof en> = {
  en,
  ne,
};

type TranslationKey = keyof typeof en;

export function useTranslations() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }

  const { language, setLanguage: originalSetLanguage } = context;

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  return { t, currentLanguage: language, setLanguage: originalSetLanguage };
}

