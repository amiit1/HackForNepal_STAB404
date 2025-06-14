
'use client';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, Home, Stethoscope } from 'lucide-react';
import DirectoryIcon from '@/components/icons/DirectoryIcon';
import BottomNavItem from './BottomNavItem';
import { useTranslations } from '@/hooks/useTranslations';

const BottomNavigationBar = () => {
  const pathname = usePathname();
  const { t } = useTranslations();

  const navItems = [
    { href: '/dashboard', icon: <Home className="h-6 w-6" />, labelKey: 'nav.home' as const },
    { href: '/health-check', icon: <Stethoscope className="h-6 w-6" />, labelKey: 'nav.cowCheck' as const },
    { href: '/schedule', icon: <CalendarDays className="h-6 w-6" />, labelKey: 'nav.task' as const },
    { href: '/analytics', icon: <BarChart3 className="h-6 w-6" />, labelKey: 'nav.record' as const },
    { href: '/directory', icon: <DirectoryIcon className="h-6 w-6" />, labelKey: 'nav.services' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-t-lg">
      <div className="flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            isActive={pathname === item.href || (item.href === '/dashboard' && pathname === '/')}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
