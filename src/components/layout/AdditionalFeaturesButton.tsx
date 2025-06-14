
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Weight } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import CowWeightCalculatorDialog from '@/components/features/CowWeightCalculatorDialog';

export default function AdditionalFeaturesButton() {
  const { t } = useTranslations();
  const [isCalculatorDialogOpen, setIsCalculatorDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="fixed right-6 bottom-[9.5rem] sm:bottom-[6rem] h-14 w-14 rounded-full shadow-xl z-[59] bg-accent hover:bg-accent/90"
            aria-label={t('additionalFeatures.buttonLabel')}
          >
            <Plus className="h-7 w-7" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-60 mb-2 mr-1">
          <DropdownMenuItem onSelect={() => setIsCalculatorDialogOpen(true)} className="cursor-pointer">
            <Weight className="mr-2 h-5 w-5" />
            <span>{t('calculator.menuItemLabel')}</span>
          </DropdownMenuItem>
          {/* Add more DropdownMenuItems here for future features */}
        </DropdownMenuContent>
      </DropdownMenu>

      <CowWeightCalculatorDialog
        isOpen={isCalculatorDialogOpen}
        onOpenChange={setIsCalculatorDialogOpen}
      />
    </>
  );
}
