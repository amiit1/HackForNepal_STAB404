
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/useTranslations';
import { AlertCircle, Bone, Ruler } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added import

interface CowWeightCalculatorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CowWeightCalculatorDialog: React.FC<CowWeightCalculatorDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslations();
  const { toast } = useToast();

  const [heartGirth, setHeartGirth] = useState<string>('');
  const [bodyLength, setBodyLength] = useState<string>('');
  const [estimatedWeightLbs, setEstimatedWeightLbs] = useState<number | null>(null);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number | null>(null);

  const handleCalculate = () => {
    const girth = parseFloat(heartGirth);
    const length = parseFloat(bodyLength);

    if (isNaN(girth) || girth <= 0 || isNaN(length) || length <= 0) {
      toast({
        title: t('error'),
        description: t('calculator.validation.invalidInput'),
        variant: 'destructive',
      });
      setEstimatedWeightLbs(null);
      setEstimatedWeightKg(null);
      return;
    }

    // Shafer's formula for adult cattle: Weight (lbs) = (Heart Girth (in) * Heart Girth (in) * Body Length (in)) / 300
    const weightLbs = (girth * girth * length) / 300;
    const weightKg = weightLbs * 0.453592;

    setEstimatedWeightLbs(parseFloat(weightLbs.toFixed(2)));
    setEstimatedWeightKg(parseFloat(weightKg.toFixed(2)));
  };

  const resetFormOnClose = (open: boolean) => {
    if (!open) {
      setHeartGirth('');
      setBodyLength('');
      setEstimatedWeightLbs(null);
      setEstimatedWeightKg(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetFormOnClose}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline text-primary">{t('calculator.title')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {t('calculator.description')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(100vh-12rem)] md:max-h-[70vh]"> {/* Adjusted max height for scrollability */}
          <div className="py-4 pr-4 space-y-6"> {/* Added pr-4 for scrollbar padding */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="heartGirth" className="flex items-center mb-1">
                  <Bone className="w-4 h-4 mr-2 text-muted-foreground" />
                  {t('calculator.heartGirthLabel')} (inches)
                </Label>
                <Input
                  id="heartGirth"
                  type="number"
                  value={heartGirth}
                  onChange={(e) => setHeartGirth(e.target.value)}
                  placeholder={t('calculator.heartGirthPlaceholder')}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bodyLength" className="flex items-center mb-1">
                  <Ruler className="w-4 h-4 mr-2 text-muted-foreground" />
                  {t('calculator.bodyLengthLabel')} (inches)
                </Label>
                <Input
                  id="bodyLength"
                  type="number"
                  value={bodyLength}
                  onChange={(e) => setBodyLength(e.target.value)}
                  placeholder={t('calculator.bodyLengthPlaceholder')}
                  min="0"
                />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full">{t('calculator.calculateButton')}</Button>

            {estimatedWeightLbs !== null && estimatedWeightKg !== null && (
              <div className="p-4 bg-secondary rounded-md text-center">
                <p className="text-sm text-secondary-foreground">{t('calculator.estimatedWeightLabel')}:</p>
                <p className="text-2xl font-bold text-primary">
                  {estimatedWeightLbs} lbs / {estimatedWeightKg} kg
                </p>
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-md font-semibold text-foreground flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                {t('calculator.guide.title')}
              </h4>
              <div className="relative w-full h-auto aspect-[4/3] rounded-md overflow-hidden border">
                <Image
                  src="https://scontent.fktm17-1.fna.fbcdn.net/v/t1.15752-9/494822176_970059235059224_8663348426409011941_n.png?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHE7YzPERnRipQ-hoNrjl5FFXmUeYPYazIVeZR5g9hrMjpyG1KsVVr7Y0wDiMUXVJYla_5xM1KuNWRHfofOUmjS&_nc_ohc=YcOd6avNYu4Q7kNvwEV6EhQ&_nc_oc=AdldxaxsicJ_ggH_oUDFmwDtkAupSUDKaYO0Qy85pak9aNQWx8UEcYSw2lw2hAPHP6eU0HcdRTRGswGIwYvzpDn1&_nc_zt=23&_nc_ht=scontent.fktm17-1.fna&oh=03_Q7cD2gGeBGRRKurNsqhau-s0LTrBAjCYFs9HUjMHFhiSj7UtKg&oe=68719D42"
                  alt={t('calculator.guide.imageAlt')}
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="cow measurement guide"
                />
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li><strong>{t('calculator.guide.heartGirthTitle')}:</strong> {t('calculator.guide.heartGirthDesc')}</li>
                <li><strong>{t('calculator.guide.bodyLengthTitle')}:</strong> {t('calculator.guide.bodyLengthDesc')}</li>
              </ul>
              <p className="text-xs text-muted-foreground">{t('calculator.guide.note')}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CowWeightCalculatorDialog;
