
'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { ArrowRight } from 'lucide-react';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export default function AuthChoicePage() {
  const { t } = useTranslations();
  const logoUrl = "https://drive.google.com/uc?export=download&id=1NbzkghDRfCOsE9O6mhkeJTtFJW-zW_No";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body text-center">
      <div className="w-full max-w-md space-y-10">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageToggle />
        </div>
        <header className="space-y-4">
          <Image 
            src={logoUrl}
            alt={t('appName') + " Logo"} 
            width={80} 
            height={80} 
            className="mx-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t('authChoice.welcomeTitle')} <span className="text-primary">{t('appName')}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('authChoice.welcomeSubtitle')}
          </p>
        </header>

        <main className="space-y-6">
          <p className="text-md text-muted-foreground">
            {t('authChoice.getStartedPrompt')}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <Link href="/login" passHref>
              <Button size="lg" className="w-full py-3 text-base">
                {t('auth.loginButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup" passHref>
              <Button variant="outline" size="lg" className="w-full py-3 text-base">
                {t('auth.signupButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>

        <footer className="mt-8">
          <p className="text-xs text-muted-foreground">
            {t('appName')} - {t('appSlogan')}
          </p>
        </footer>
      </div>
    </div>
  );
}
