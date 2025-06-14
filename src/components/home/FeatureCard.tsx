
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { FeatureCardItem } from '@/lib/types';

interface FeatureCardProps extends Omit<FeatureCardItem, 'titleKey' | 'descriptionKey' | 'expandedContentKey' | 'imageAltKey' | 'buttonLabelKey'> {
  title: string;
  description: string;
  expandedContent: string;
  imageAlt: string;
  buttonLabel: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  icon: Icon,
  title,
  description,
  expandedContent,
  imageSrc,
  imageAlt,
  imageAiHint,
  href,
  buttonLabel,
}) => {
  return (
    <AccordionItem value={id} className="border-none">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-card">
        <AccordionTrigger className="hover:no-underline p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
          <CardHeader className="flex flex-row items-center space-x-4 p-4 sm:p-6 w-full text-left">
            {Icon && <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary flex-shrink-0" />}
            <div className="flex-grow">
              <CardTitle className="text-lg sm:text-xl font-headline text-primary">{title}</CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1 line-clamp-2">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="pt-0 p-4 sm:p-6 space-y-4">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {expandedContent}
            </p>
            {imageSrc && (
              <div className="my-4 rounded-md overflow-hidden border border-border">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  data-ai-hint={imageAiHint}
                />
              </div>
            )}
            <Link href={href}>
              <Button variant="default" className="w-full sm:w-auto text-base py-3">
                {buttonLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
};

export default FeatureCard;
