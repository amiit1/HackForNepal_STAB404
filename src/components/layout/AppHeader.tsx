
'use client';
import Link from 'next/link';
import Image from 'next/image'; 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, User, LogOut } from 'lucide-react'; 
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useTranslations } from '@/hooks/useTranslations';
import AboutAppDialog from './AboutAppDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const AppHeader = () => {
  const { t } = useTranslations();
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const logoUrl = "https://drive.google.com/uc?export=download&id=1NbzkghDRfCOsE9O6mhkeJTtFJW-zW_No";


  const handleLogout = () => {
    console.log('User logged out');
    toast({
      title: t('auth.logoutSuccessTitle'),
      description: t('auth.logoutSuccessDescription'),
    });
    router.push('/'); 
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 font-headline text-xl font-bold text-primary hover:text-primary/80 transition-colors">
            <Image 
              src={logoUrl}
              alt={t('appName') + " Logo"} 
              width={32} 
              height={32} 
            />
            <span>{t('appName')}</span>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.profileMenuLabel')}>
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('nav.profileMenuLabel')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsAboutDialogOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>{t('nav.aboutApp')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> 
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <AboutAppDialog isOpen={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen} />
    </>
  );
};

export default AppHeader;
