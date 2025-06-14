
import type { Cow, FarmTask, ServiceProvider, MilkYield, HealthRecord } from './types';

export const mockCows: Cow[] = [
  { id: 'cow1', name: 'लक्ष्मी (Lakshmi)', earTagNo: 'NP001', breed: 'Jersey Cross', birthDate: '2020-03-15' },
  { id: 'cow2', name: 'गौरी (Gauri)', earTagNo: 'NP002', breed: 'Local Hill Cow', birthDate: '2019-07-22' },
  { id: 'cow3', name: 'गंगा (Ganga)', earTagNo: 'NP003', breed: 'Holstein Friesian', birthDate: '2021-01-10' },
];

export const mockTasks: FarmTask[] = [
  { id: 'task1', title: 'गाईलाई खोप (Vaccinate Lakshmi)', date: '2024-08-15', type: 'vaccination', cowId: 'cow1', isCompleted: false, description: 'FMD Booster' },
  { id: 'task2', title: 'बिहानको दाना (Morning Feeding)', date: '2024-07-29', time: '07:00', type: 'feeding', isCompleted: true },
  { id: 'task3', title: 'गंगाको जुकाको औषधि (Deworm Ganga)', date: '2024-09-01', type: 'deworming', cowId: 'cow3', isCompleted: false },
  { id: 'task4', title: 'साँझको दूध दुहुने (Evening Milking)', date: '2024-07-29', time: '17:00', type: 'milking', isCompleted: false },
];

export const mockServiceProviders: ServiceProvider[] = [
  { id: 'vet1', name: 'डा. राम शर्मा (Dr. Ram Sharma)', type: 'vet', contactPhone: '98XXXXXXXX', address: 'गाउँपालिका चोक (Village Square)', latitude: 27.7000, longitude: 85.3000 }, // ~Kathmandu area
  { id: 'ai1', name: 'कृत्रिम गर्भाधान केन्द्र (AI Center)', type: 'ai_center', contactPhone: '97XXXXXXXX', address: 'कृषि सहकारी भवन (Agri Coop Building)', latitude: 27.7172, longitude: 85.3240 }, // Kathmandu
  { id: 'feed1', name: 'पशु दाना पसल (Feed Store)', type: 'feed_supplier', address: 'बजार क्षेत्र (Market Area)', latitude: 28.2096, longitude: 83.9856 }, // Pokhara
  { id: 'milk1', name: 'दुग्ध संकलन केन्द्र (Milk Collection Point)', type: 'milk_collection', address: 'सहकारी डेरी (Cooperative Dairy)', latitude: 26.4525, longitude: 87.2718 }, // Biratnagar
];

export const mockMilkYields: MilkYield[] = [
  // Lakshmi (cow1)
  { id: 'my1', cowId: 'cow1', date: '2024-07-20', liters: 12 },
  { id: 'my2', cowId: 'cow1', date: '2024-07-21', liters: 12.5 },
  { id: 'my3', cowId: 'cow1', date: '2024-07-22', liters: 11.8 },
  { id: 'my4', cowId: 'cow1', date: '2024-07-23', liters: 12.2 },
  { id: 'my5', cowId: 'cow1', date: '2024-07-24', liters: 13 },
  { id: 'my6', cowId: 'cow1', date: '2024-07-25', liters: 12.5 },
  { id: 'my7', cowId: 'cow1', date: '2024-07-26', liters: 12.8 },
  { id: 'my8', cowId: 'cow1', date: '2024-07-27', liters: 11.5 }, // Slight drop
  { id: 'my9', cowId: 'cow1', date: '2024-07-28', liters: 11.2 },
  // Gauri (cow2)
  { id: 'my10', cowId: 'cow2', date: '2024-07-20', liters: 8 },
  { id: 'my11', cowId: 'cow2', date: '2024-07-21', liters: 8.5 },
  { id: 'my12', cowId: 'cow2', date: '2024-07-22', liters: 7.8 },
  { id: 'my13', cowId: 'cow2', date: '2024-07-23', liters: 8.2 },
  { id: 'my14', cowId: 'cow2', date: '2024-07-24', liters: 9 },
  // Ganga (cow3)
  { id: 'my15', cowId: 'cow3', date: '2024-07-25', liters: 15 },
  { id: 'my16', cowId: 'cow3', date: '2024-07-26', liters: 14.5 },
  { id: 'my17', cowId: 'cow3', date: '2024-07-27', liters: 15.2 },
  { id: 'my18', cowId: 'cow3', date: '2024-07-28', liters: 15.5 },
];

export const mockHealthRecords: HealthRecord[] = [
  { id: 'hr1', cowId: 'cow1', date: '2024-06-15', bcsScore: 3.5, symptoms: 'सामान्य (Normal)', advice: 'राम्रो अवस्थामा छ (Good condition)'},
  { id: 'hr2', cowId: 'cow2', date: '2024-07-01', bcsScore: 2.8, symptoms: 'अलि दुब्लो (Slightly thin)', advice: 'प्रोटिनयुक्त दाना बढाउनुहोस् (Increase protein feed)'},
  { id: 'hr3', cowId: 'cow1', date: '2024-07-27', bcsScore: 3.2, symptoms: 'खुट्टा खोच्याउने (Limping)', advice: 'पशु चिकित्सकलाई देखाउनुहोस् (Consult a vet)'},
];
