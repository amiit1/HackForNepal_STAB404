
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface AboutAppDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutAppDialog: React.FC<AboutAppDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslations();

  const features: Array<keyof typeof import('@/locales/en.json')> = [
    'aboutApp.feature.healthCheck',
    'aboutApp.feature.taskSchedule',
    'aboutApp.feature.chatbot',
    'aboutApp.feature.directory',
    'aboutApp.feature.analytics',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">{t('aboutApp.title')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            {t('aboutApp.description')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="py-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('aboutApp.featuresTitle')}</h3>
            <ul className="space-y-3">
              {features.map((featureKey) => (
                <li key={featureKey} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-foreground">{t(featureKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AboutAppDialog;
