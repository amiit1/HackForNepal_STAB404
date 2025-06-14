
'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import LoginForm from '@/components/auth/LoginForm';
import { useTranslations } from '@/hooks/useTranslations';

export default function LoginPage() {
  const { t } = useTranslations();
  const logoUrl = "https://drive.google.com/uc?export=download&id=1NbzkghDRfCOsE9O6mhkeJTtFJW-zW_No";


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Image 
            src={logoUrl}
            alt={t('appName') + " Logo"} 
            width={64} 
            height={64} 
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('auth.loginTitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('appName')} - {t('appSlogan')}
          </p>
        </div>
        
        <Card className="shadow-md">
          <CardContent className="pt-6"> 
            <LoginForm />
          </CardContent>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          {t('auth.switchToSignupPrompt')}{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline hover:text-primary/80">
            {t('auth.switchToSignupLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Minimal Card components for styling consistency
const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
