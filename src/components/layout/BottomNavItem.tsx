import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BottomNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ href, icon, label, isActive }) => {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center flex-1 p-2 text-xs hover:bg-primary/10 rounded-md transition-colors",
      isActive ? "text-primary font-semibold" : "text-muted-foreground"
    )}>
      <span className="mb-1">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default BottomNavItem;
