import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHECKUP_HISTORY_KEY = 'checkupHistory';

export type RecordKind = 'checkup' | 'emergency' | 'symptoms';

export const RECORD_KIND_DISPLAY: Record<RecordKind, { title: string; color: string }> = {
  checkup: { title: 'Checkup', color: '#0a7ea4' },
  emergency: { title: 'Emergency', color: '#d32f2f' },
  symptoms: { title: 'Symptom check', color: '#ef6c00' },
};

export type CheckupRecord = {
  kind: RecordKind;
  date: string;
  answers: { question: string; answer: string }[];
};

export async function loadCheckups(): Promise<CheckupRecord[]> {
  const stored = await AsyncStorage.getItem(CHECKUP_HISTORY_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export async function saveCheckup(checkup: CheckupRecord) {
  const checkups = await loadCheckups();
  checkups.push(checkup);
  await AsyncStorage.setItem(CHECKUP_HISTORY_KEY, JSON.stringify(checkups));
}

export function heightFromUsUnits(feet: number, inches: number): string {
  const centimeters = Math.round((feet * 12 + inches) * 2.54);
  return `${centimeters} cm (${feet} ft ${inches} in)`;
}

export function weightFromPounds(pounds: number): string {
  const kilograms = Math.round(pounds * 0.4536 * 10) / 10;
  return `${kilograms} kg (${pounds} lb)`;
}
