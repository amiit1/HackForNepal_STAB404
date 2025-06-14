
'use client';
import AppShell from '@/components/layout/AppShell';
import { useTranslations } from '@/hooks/useTranslations';
import CowBreedsCarousel from '@/components/dashboard/CowBreedsCarousel';
import CowDiseasesCarousel from '@/components/dashboard/CowDiseasesCarousel'; // New import
import type { CowBreedData, CowDiseaseData } from '@/lib/types'; // Updated import
import { PawPrint, ShieldAlert } from 'lucide-react'; // Added ShieldAlert

export default function DashboardPage() {
  const { t } = useTranslations();

  const cowBreedsData: CowBreedData[] = [
    {
      id: 'jersey',
      name: t('home.cowBreeds.breedName.jersey'),
      imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS00rM5cRg3V_NzfTzLb0s7gfJzo3qTVuj9D62SbWOJ9f361qih5vexqWtsyA4c9Q0wgb8JaPm0jiqkMZAKmGwOdA',
      imageAlt: t('home.cowBreeds.imageAlt.jersey'),
      imageAiHint: 'Jersey cow farm',
      details: {
        foundInNepal: t('home.cowBreeds.details.jersey.foundInNepalKey'),
        weight: t('home.cowBreeds.details.jersey.weightKey'),
        face: t('home.cowBreeds.details.jersey.faceKey'),
        maturity: t('home.cowBreeds.details.jersey.maturityKey'),
        firstCalf: t('home.cowBreeds.details.jersey.firstCalfKey'),
        milkProduction: t('home.cowBreeds.details.jersey.milkProductionKey'),
        fatContent: t('home.cowBreeds.details.jersey.fatContentKey'),
        proteinContent: t('home.cowBreeds.details.jersey.proteinContentKey'),
      },
    },
    {
      id: 'holstein',
      name: t('home.cowBreeds.breedName.holstein'),
      imageSrc: 'https://cdn.britannica.com/53/157153-050-E5582B5A/Holstein-cow.jpg',
      imageAlt: t('home.cowBreeds.imageAlt.holstein'),
      imageAiHint: 'Holstein cow field',
      details: {
        foundInNepal: t('home.cowBreeds.details.holstein.foundInNepalKey'),
        weight: t('home.cowBreeds.details.holstein.weightKey'),
        face: t('home.cowBreeds.details.holstein.faceKey'),
        maturity: t('home.cowBreeds.details.holstein.maturityKey'),
        firstCalf: t('home.cowBreeds.details.holstein.firstCalfKey'),
        milkProduction: t('home.cowBreeds.details.holstein.milkProductionKey'),
        fatContent: t('home.cowBreeds.details.holstein.fatContentKey'),
        proteinContent: t('home.cowBreeds.details.holstein.proteinContentKey'),
      },
    },
    {
      id: 'ayrshire',
      name: t('home.cowBreeds.breedName.ayrshire'),
      imageSrc: 'https://i.pinimg.com/564x/ee/ae/18/eeae180ff36c1ec86fb2d54ef28a060b.jpg',
      imageAlt: t('home.cowBreeds.imageAlt.ayrshire'),
      imageAiHint: 'Ayrshire cow pasture',
      details: {
        foundInNepal: t('home.cowBreeds.details.ayrshire.foundInNepalKey'),
        weight: t('home.cowBreeds.details.ayrshire.weightKey'),
        face: t('home.cowBreeds.details.ayrshire.faceKey'),
        maturity: t('home.cowBreeds.details.ayrshire.maturityKey'),
        firstCalf: t('home.cowBreeds.details.ayrshire.firstCalfKey'),
        milkProduction: t('home.cowBreeds.details.ayrshire.milkProductionKey'),
        fatContent: t('home.cowBreeds.details.ayrshire.fatContentKey'),
        proteinContent: t('home.cowBreeds.details.ayrshire.proteinContentKey'),
      },
    },
    {
      id: 'brownswiss',
      name: t('home.cowBreeds.breedName.brownswiss'),
      imageSrc: 'https://thelivestocktraders.nl/af/uploads/c/1024x/4/7/brownswiss.JPG',
      imageAlt: t('home.cowBreeds.imageAlt.brownswiss'),
      imageAiHint: 'Brown Swiss cow mountain',
      details: {
        foundInNepal: t('home.cowBreeds.details.brownswiss.foundInNepalKey'),
        weight: t('home.cowBreeds.details.brownswiss.weightKey'),
        face: t('home.cowBreeds.details.brownswiss.faceKey'),
        maturity: t('home.cowBreeds.details.brownswiss.maturityKey'),
        firstCalf: t('home.cowBreeds.details.brownswiss.firstCalfKey'),
        milkProduction: t('home.cowBreeds.details.brownswiss.milkProductionKey'),
        fatContent: t('home.cowBreeds.details.brownswiss.fatContentKey'),
        proteinContent: t('home.cowBreeds.details.brownswiss.proteinContentKey'),
      },
    },
    {
      id: 'sahiwal',
      name: t('home.cowBreeds.breedName.sahiwal'),
      imageSrc: 'https://docs.krishnayangauraksha.org/blog/17_08_2024_12_22_51_Is%20Sahiwal%20cow%20milk%20good%20for%20health.jpeg',
      imageAlt: t('home.cowBreeds.imageAlt.sahiwal'),
      imageAiHint: 'Sahiwal cow India',
      details: {
        foundInNepal: t('home.cowBreeds.details.sahiwal.foundInNepalKey'),
        weight: t('home.cowBreeds.details.sahiwal.weightKey'),
        face: t('home.cowBreeds.details.sahiwal.faceKey'),
        maturity: t('home.cowBreeds.details.sahiwal.maturityKey'),
        firstCalf: t('home.cowBreeds.details.sahiwal.firstCalfKey'),
        milkProduction: t('home.cowBreeds.details.sahiwal.milkProductionKey'),
        fatContent: t('home.cowBreeds.details.sahiwal.fatContentKey'),
        proteinContent: t('home.cowBreeds.details.sahiwal.proteinContentKey'),
      },
    },
  ];

  const cowDiseasesData: CowDiseaseData[] = [
    {
      id: 'lsd',
      name: t('disease.lsd.name'),
      imageSrc: 'https://www.edufarmers.org/cfind/source/thumb/images/cover_w960_h400_tw739_th308_x10_y119_sapi-lsd.jpeg',
      imageAlt: t('disease.lsd.imageAlt'),
      imageAiHint: 'cow skin disease',
      cause: t('disease.lsd.cause'),
      symptoms: [
        t('disease.lsd.symptom1'),
        t('disease.lsd.symptom2'),
        t('disease.lsd.symptom3'),
      ],
      precautions: [
        t('disease.lsd.precaution1'),
        t('disease.lsd.precaution2'),
        t('disease.lsd.precaution3'),
      ],
    },
    {
      id: 'fmd',
      name: t('disease.fmd.name'),
      imageSrc: 'https://i0.wp.com/www.foodformzansi.co.za/wp-content/uploads/2022/06/Feature-Image-tempate-28.jpg?resize=750%2C375&ssl=1',
      imageAlt: t('disease.fmd.imageAlt'),
      imageAiHint: 'cow mouth sore',
      cause: t('disease.fmd.cause'),
      symptoms: [
        t('disease.fmd.symptom1'),
        t('disease.fmd.symptom2'),
        t('disease.fmd.symptom3'),
      ],
      precautions: [
        t('disease.fmd.precaution1'),
        t('disease.fmd.precaution2'),
        t('disease.fmd.precaution3'),
      ],
    },
    {
      id: 'mastitis',
      name: t('disease.mastitis.name'),
      imageSrc: 'https://vossenagriculture.com/wp-content/uploads/2024/09/blogs_posts-shutterstock_1677257290-scaled.jpg',
      imageAlt: t('disease.mastitis.imageAlt'),
      imageAiHint: 'cow udder infection',
      cause: t('disease.mastitis.cause'),
      symptoms: [
        t('disease.mastitis.symptom1'),
        t('disease.mastitis.symptom2'),
        t('disease.mastitis.symptom3'),
      ],
      precautions: [
        t('disease.mastitis.precaution1'),
        t('disease.mastitis.precaution2'),
        t('disease.mastitis.precaution3'),
      ],
    },
    {
      id: 'gip',
      name: t('disease.gip.name'),
      imageSrc: 'https://nadis.org.uk/media/1850/2-parasitic-gastroenteritis-pge-growing-dairy-heifer.jpg?width=1038&height=731',
      imageAlt: t('disease.gip.imageAlt'),
      imageAiHint: 'cow parasites treatment',
      cause: t('disease.gip.cause'),
      symptoms: [
        t('disease.gip.symptom1'),
        t('disease.gip.symptom2'),
        t('disease.gip.symptom3'),
      ],
      precautions: [
        t('disease.gip.precaution1'),
        t('disease.gip.precaution2'),
        t('disease.gip.precaution3'),
      ],
    },
    {
      id: 'metabolic',
      name: t('disease.metabolic.name'),
      imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkgwm5B0oWxbCBEccFtFXFJUMr1Mfsto3rFg&s',
      imageAlt: t('disease.metabolic.imageAlt'),
      imageAiHint: 'cow metabolic health',
      cause: t('disease.metabolic.cause'),
      symptoms: [
        t('disease.metabolic.symptom1'),
        t('disease.metabolic.symptom2'),
        t('disease.metabolic.symptom3'),
      ],
      precautions: [
        t('disease.metabolic.precaution1'),
        t('disease.metabolic.precaution2'),
        t('disease.metabolic.precaution3'),
      ],
    },
  ];


  return (
    <AppShell>
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2">{t('home.greeting')}</h1>
        <p className="text-md text-muted-foreground">{t('home.welcomeMessage')}</p>
      </div>
      
      <section className="space-y-6 mb-12">
        <div className="flex items-center space-x-2 mb-4">
            <PawPrint className="w-7 h-7 text-primary"/>
            <h2 className="text-2xl font-headline font-semibold text-foreground">{t('home.cowBreeds.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{t('home.cowBreeds.description')}</p>
        <CowBreedsCarousel breeds={cowBreedsData} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="w-7 h-7 text-primary"/>
            <h2 className="text-2xl font-headline font-semibold text-foreground">{t('home.cowDiseases.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{t('home.cowDiseases.description')}</p>
        <CowDiseasesCarousel diseases={cowDiseasesData} />
      </section>

    </AppShell>
  );
}
