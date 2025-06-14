
import type { LucideIcon } from 'lucide-react';
import type enTranslations from '@/locales/en.json';

export type TranslationKey = keyof typeof enTranslations;


export interface Cow {
  id: string;
  name: string;
  earTagNo?: string;
  breed?: string;
  birthDate?: string;
}

export interface HealthRecord {
  id:string;
  cowId: string;
  date: string;
  bcsScore?: number;
  symptoms?: string;
  advice?: string;
  photoUrl?: string; // URL of the photo if stored
}

export interface MilkYield {
  id: string;
  cowId: string;
  date: string; // YYYY-MM-DD
  liters: number;
}

export type TaskType = 'vaccination' | 'feeding' | 'deworming' | 'breeding' | 'milking' | 'other';

export interface FarmTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM (optional)
  type: TaskType;
  cowId?: string; // Optional, if task is cow-specific
  description?: string;
  isCompleted: boolean;
}

export type ServiceProviderType = 'vet' | 'ai_center' | 'feed_supplier' | 'milk_collection' | 'other';

export interface ServiceProvider {
  id: string;
  name: string;
  type: ServiceProviderType;
  contactPhone?: string;
  address?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

// For AI Cow Health Analysis
export interface CowHealthAnalysisResult {
  bodyConditionScore: number;
  potentialHealthIssues: string;
  suggestedActionItems: string;
}

// For AI Chatbot Support
export interface ChatbotResponse {
  advice: string;
  suggestedVetContact?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

// For Home Page Feature Cards (Old - will be replaced)
export interface FeatureCardItem {
  id: string;
  icon: LucideIcon;
  titleKey: string; // For translation
  descriptionKey: string; // For translation
  expandedContentKey: string; // For translation
  imageSrc: string;
  imageAltKey: string; // For translation
  imageAiHint?: string;
  href: string;
  buttonLabelKey: string; // For translation
}

// For New Cow Breeds Carousel
export interface CowBreedData {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  imageAiHint: string;
  details: {
    foundInNepal: string;
    weight: string;
    face: string;
    maturity: string;
    firstCalf: string;
    milkProduction: string;
    fatContent: string;
    proteinContent: string;
  };
}

// For New Cow Diseases Carousel
export interface CowDiseaseData {
  id: string;
  name: string; // Already translated
  imageSrc: string;
  imageAlt: string; // Already translated
  imageAiHint: string;
  cause: string; // Already translated
  symptoms: string[]; // Array of translated symptom strings
  precautions: string[]; // Array of translated precaution strings
}
