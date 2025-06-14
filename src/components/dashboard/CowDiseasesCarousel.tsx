
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Bug, Activity, ShieldAlert, Thermometer, Droplet, PackagePlus } from 'lucide-react';
import type { CowDiseaseData } from '@/lib/types';
import { useTranslations } from '@/hooks/useTranslations';

interface CowDiseasesCarouselProps {
  diseases: CowDiseaseData[];
}

const AUTOSCROLL_INTERVAL = 8000; // 8 seconds, slightly longer for more text

const CowDiseasesCarousel: React.FC<CowDiseasesCarouselProps> = ({ diseases }) => {
  const { t } = useTranslations();
  const [currentDiseaseIndex, setCurrentDiseaseIndex] = useState(0);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setCurrentDiseaseIndex((prevIndex) => (prevIndex + 1) % diseases.length);
  }, [diseases.length]);

  const handlePrevious = useCallback(() => {
    setCurrentDiseaseIndex((prevIndex) => (prevIndex - 1 + diseases.length) % diseases.length);
  }, [diseases.length]);

  useEffect(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
    if (diseases.length > 1) {
      autoScrollIntervalRef.current = setInterval(handleNext, AUTOSCROLL_INTERVAL);
    }
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [currentDiseaseIndex, diseases.length, handleNext]);

  if (!diseases || diseases.length === 0) {
    return <p>{t('home.cowDiseases.noData')}</p>;
  }

  const currentDisease = diseases[currentDiseaseIndex];

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl sm:text-2xl font-headline text-primary flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 sm:w-7 sm:h-7" />
            {currentDisease.name}
          </CardTitle>
          <div className="flex space-x-1 sm:space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} aria-label={t('home.cowDiseases.previousDisease')} disabled={diseases.length <= 1}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} aria-label={t('home.cowDiseases.nextDisease')} disabled={diseases.length <= 1}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div key={currentDisease.id} className="animate-in fade-in-50 duration-500">
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[250px] sm:max-h-[300px] border-b bg-gray-100 dark:bg-gray-800">
            <Image
              src={currentDisease.imageSrc}
              alt={currentDisease.imageAlt}
              layout="fill"
              objectFit="contain" // Use contain to ensure the whole image is visible
              data-ai-hint={currentDisease.imageAiHint}
              priority={currentDiseaseIndex === 0}
            />
          </div>
          <div className="p-4 sm:p-6 space-y-4 text-sm">
            <DiseaseDetailItem icon={<Bug className="w-4 h-4 text-destructive" />} label={t('home.cowDiseases.label.cause')} value={currentDisease.cause} />
            
            <div>
              <strong className="text-foreground/90 flex items-center mb-1">
                <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                {t('home.cowDiseases.label.symptoms')}:
              </strong>
              <ul className="list-none pl-1 space-y-1">
                {currentDisease.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start">
                    <Droplet className="w-3 h-3 mr-2 mt-1 text-orange-400 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong className="text-foreground/90 flex items-center mb-1">
                 <PackagePlus className="w-4 h-4 mr-2 text-green-600" />
                {t('home.cowDiseases.label.precautions')}:
              </strong>
              <ul className="list-none pl-1 space-y-1">
                {currentDisease.precautions.map((precaution, index) => (
                   <li key={index} className="flex items-start">
                    <Activity className="w-3 h-3 mr-2 mt-1 text-green-500 shrink-0" />
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DiseaseDetailItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}
const DiseaseDetailItem: React.FC<DiseaseDetailItemProps> = ({ label, value, icon }) => (
  <div>
    <strong className="text-foreground/90 flex items-center mb-1">
      {icon && <span className="mr-2">{icon}</span>}
      {label}:
    </strong>
    <p className="text-foreground pl-1">{value}</p>
  </div>
);

export default React.memo(CowDiseasesCarousel);
