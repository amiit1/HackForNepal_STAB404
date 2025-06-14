
'use client';

import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark'; // Removed 'system'

interface ThemeContextProps {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const DEFAULT_THEME: Theme = 'light'; // Default theme

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  // Effect to load theme from localStorage on the client after mount
  useEffect(() => {
    const storedThemeValue = localStorage.getItem('theme') as Theme | 'system' | null;
    if (storedThemeValue) {
      if (storedThemeValue === 'light' || storedThemeValue === 'dark') {
        setTheme(storedThemeValue);
      } else {
        // If 'system' or invalid value was stored, default to light and update localStorage
        setTheme(DEFAULT_THEME);
        localStorage.setItem('theme', DEFAULT_THEME);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to apply theme to DOM and update localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme); // theme is now always 'light' or 'dark'
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
