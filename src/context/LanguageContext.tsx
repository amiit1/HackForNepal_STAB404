
'use client';

import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'en' | 'ne';

interface LanguageContextProps {
  language: Locale;
  setLanguage: Dispatch<SetStateAction<Locale>>;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const DEFAULT_LOCALE: Locale = 'ne'; // Default language for initial render

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a consistent default for server and initial client render
  const [language, setLanguage] = useState<Locale>(DEFAULT_LOCALE);

  // Effect to load language from localStorage on the client after mount
  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Locale | null;
    if (storedLang && storedLang !== language) { // Check against current state before setting
      setLanguage(storedLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect to update localStorage and document lang attribute when language changes
  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
