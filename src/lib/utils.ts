
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDateFns } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock function for AD to BS conversion - THIS IS A VERY ROUGH APPROXIMATION
// For accurate conversion, a proper Nepali date library is required.
export function adToBs(adDate: Date): string {
  if (!adDate) return '';
  try {
    const adYear = adDate.getFullYear();
    const adMonth = adDate.getMonth() + 1; // getMonth() is 0-indexed
    const adDay = adDate.getDate();

    // Very rough approximation: add 56 years, 8 months, 17 days
    // This is a placeholder and not accurate.
    let bsYear = adYear + 56;
    let bsMonth = adMonth + 8;
    let bsDay = adDay + 17; // Using a common approximation for the start of Bikram Sambat year

    // Rough adjustments for month and day overflows
    if (bsDay > 30) { // Assuming average 30 days per month for simplicity
      bsMonth += Math.floor(bsDay / 30);
      bsDay = bsDay % 30;
      if (bsDay === 0) bsDay = 30; // if it was perfectly 30, 60 etc.
    }
    if (bsMonth > 12) {
      bsYear += Math.floor(bsMonth / 12);
      bsMonth = bsMonth % 12;
      if (bsMonth === 0) bsMonth = 12;
    }
    // Format: YYYY-MM-DD (अनुमानित)
    return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
  } catch (e) {
    // Fallback if date is invalid
    return "मिति रूपान्तरण गर्न सकिएन";
  }
}

// Constant for "approximately" in Nepali
export const ใกล้เคียง = "लगभग";
