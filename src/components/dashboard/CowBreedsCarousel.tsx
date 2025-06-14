
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CowBreedData } from '@/lib/types';
import { useTranslations } from '@/hooks/useTranslations';

interface CowBreedsCarouselProps {
  breeds: CowBreedData[];
}

const AUTOSCROLL_INTERVAL = 7000; // 7 seconds

const CowBreedsCarousel: React.FC<CowBreedsCarouselProps> = ({ breeds }) => {
  const { t } = useTranslations();
  const [currentBreedIndex, setCurrentBreedIndex] = useState(0);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setCurrentBreedIndex((prevIndex) => (prevIndex + 1) % breeds.length);
  }, [breeds.length]);

  const handlePrevious = useCallback(() => {
    setCurrentBreedIndex((prevIndex) => (prevIndex - 1 + breeds.length) % breeds.length);
  }, [breeds.length]);

  useEffect(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    if (breeds.length > 1) { // Always autoplay if more than one breed
      autoScrollIntervalRef.current = setInterval(() => {
        handleNext();
      }, AUTOSCROLL_INTERVAL);
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [currentBreedIndex, breeds.length, handleNext]);


  if (!breeds || breeds.length === 0) {
    return <p>{t('home.cowBreeds.noData')}</p>;
  }

  const currentBreed = breeds[currentBreedIndex];

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl sm:text-2xl font-headline text-primary">
            {currentBreed.name}
          </CardTitle>
          <div className="flex space-x-1 sm:space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} aria-label={t('home.cowBreeds.previousBreed')} disabled={breeds.length <= 1}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} aria-label={t('home.cowBreeds.nextBreed')} disabled={breeds.length <= 1}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div key={currentBreed.id} className="animate-in fade-in-50 duration-500">
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[300px] sm:max-h-[350px] border-b">
            <Image
              src={currentBreed.imageSrc}
              alt={currentBreed.imageAlt || currentBreed.id}
              layout="fill"
              objectFit="cover"
              data-ai-hint={currentBreed.imageAiHint}
              priority={currentBreedIndex === 0} 
            />
          </div>
          <div className="p-4 sm:p-6 space-y-3 text-sm">
            <BreedDetailItem label={t('home.cowBreeds.label.foundInNepal')} value={currentBreed.details.foundInNepal} />
            <BreedDetailItem label={t('home.cowBreeds.label.weight')} value={currentBreed.details.weight} />
            <BreedDetailItem label={t('home.cowBreeds.label.face')} value={currentBreed.details.face} />
            <BreedDetailItem label={t('home.cowBreeds.label.maturity')} value={currentBreed.details.maturity} />
            <BreedDetailItem label={t('home.cowBreeds.label.firstCalf')} value={currentBreed.details.firstCalf} />
            <BreedDetailItem label={t('home.cowBreeds.label.milkProduction')} value={currentBreed.details.milkProduction} />
            <BreedDetailItem label={t('home.cowBreeds.label.fatContent')} value={currentBreed.details.fatContent} />
            <BreedDetailItem label={t('home.cowBreeds.label.proteinContent')} value={currentBreed.details.proteinContent} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BreedDetailItemProps {
  label: string;
  value: string;
}
const BreedDetailItem: React.FC<BreedDetailItemProps> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 items-start">
    <strong className="text-foreground/80 col-span-1">{label}:</strong>
    <p className="text-foreground col-span-2">{value}</p>
  </div>
);

export default React.memo(CowBreedsCarousel);

