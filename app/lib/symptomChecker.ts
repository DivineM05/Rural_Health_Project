// Symptoms, illnesses and frequencies: Kaggle "Disease Symptom Prediction" dataset (itachi9604),
// built by scripts/build_symptom_data.py.
// Urgency levels and red-flag symptoms are hand-assigned from NHS "Conditions A to Z" (nhs.uk/conditions)
// "when to get help" sections. Needs review by a medical professional before real use.
import Fuse from 'fuse.js';

import symptomData from './symptomData.json';

export type Symptom = { id: string; label: string; severity: number };
export type Illness = { name: string; description: string; symptoms: Record<string, number> };
export type SymptomAnswer = 'yes' | 'no' | 'unsure';
export type SymptomAnswers = Record<string, SymptomAnswer>;
export type PossibleCause = { illness: Illness; probability: number; isAtRisk: boolean };
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;

type SymptomData = { symptoms: Symptom[]; illnesses: Illness[] };
const typedSymptomData = symptomData as unknown as SymptomData;

export const symptoms = typedSymptomData.symptoms;
export const illnesses = typedSymptomData.illnesses;

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  1: 'Care for yourself at home',
  2: 'See a clinic in the next few days',
  3: 'See a doctor within 24 hours',
  4: 'Go to the hospital today',
  5: 'Go to the hospital now',
};

const ILLNESS_URGENCY: Record<string, UrgencyLevel> = {
  'AIDS': 2,
  'Acne': 1,
  'Alcoholic hepatitis': 3,
  'Allergy': 1,
  'Arthritis': 2,
  'Bronchial Asthma': 3,
  'Cervical spondylosis': 2,
  'Chicken pox': 1,
  'Chronic cholestasis': 2,
  'Common Cold': 1,
  'Dengue': 3,
  'Diabetes': 2,
  'Drug Reaction': 3,
  'Fungal infection': 1,
  'GERD': 1,
  'Gastroenteritis': 1,
  'Heart attack': 5,
  'Hemorrhoids (piles)': 1,
  'Hepatitis A': 3,
  'Hepatitis B': 2,
  'Hepatitis C': 2,
  'Hepatitis D': 2,
  'Hepatitis E': 3,
  'Hypertension': 2,
  'Hyperthyroidism': 2,
  'Hypoglycemia': 4,
  'Hypothyroidism': 2,
  'Impetigo': 2,
  'Jaundice': 3,
  'Malaria': 4,
  'Migraine': 1,
  'Osteoarthritis': 2,
  'Paralysis (brain hemorrhage)': 5,
  'Peptic ulcer disease': 2,
  'Pneumonia': 3,
  'Positional vertigo (BPPV)': 2,
  'Psoriasis': 2,
  'Tuberculosis': 2,
  'Typhoid': 3,
  'Urinary tract infection': 2,
  'Varicose veins': 2,
};

const EMERGENCY_SYMPTOMS = [
  'chest_pain',
  'weakness_of_one_body_side',
  'slurred_speech',
  'altered_sensorium',
  'coma',
  'stomach_bleeding',
];
const HOSPITAL_TODAY_SYMPTOMS = ['breathlessness', 'blood_in_sputum', 'bloody_stool', 'acute_liver_failure', 'dehydration'];
const DOCTOR_SOON_SYMPTOMS = ['high_fever', 'yellowing_of_eyes', 'yellowish_skin'];

const AT_RISK_ILLNESSES: Record<string, string[]> = {
  'Diabetes': ['Diabetes', 'Hypoglycemia'],
  'High blood pressure': ['Hypertension', 'Heart attack', 'Paralysis (brain hemorrhage)'],
  'Heart disease': ['Heart attack'],
  'Asthma / COPD': ['Bronchial Asthma', 'Pneumonia'],
  'Pregnancy': ['Urinary tract infection', 'GERD', 'Varicose veins'],
  'Kidney disease': ['Urinary tract infection', 'Hypertension'],
};
const AT_RISK_BOOST = 1.5;
const CHANCE_OF_SYMPTOM_NOT_LISTED = 0.02;
const CONFIDENT_PROBABILITY = 0.9;
const MEANINGFUL_PROBABILITY = 0.2;

const symptomById = new Map(symptoms.map((symptom) => [symptom.id, symptom]));

const symptomSearch = new Fuse(symptoms, { keys: ['label', 'id'], threshold: 0.4, ignoreLocation: true });

export function symptomLabel(symptomId: string): string {
  return symptomById.get(symptomId)?.label ?? symptomId;
}

export function searchSymptoms(query: string, excludedIds: string[]): Symptom[] {
  return symptomSearch
    .search(query)
    .map((result) => result.item)
    .filter((symptom) => !excludedIds.includes(symptom.id))
    .slice(0, 6);
}

function isAtRiskFor(illness: Illness, conditions: string[]): boolean {
  return conditions.some((condition) => AT_RISK_ILLNESSES[condition]?.includes(illness.name));
}

function chanceOfSymptom(illness: Illness, symptomId: string): number {
  return illness.symptoms[symptomId] ?? CHANCE_OF_SYMPTOM_NOT_LISTED;
}

export function rankCauses(answers: SymptomAnswers, conditions: string[]): PossibleCause[] {
  const likelihoods = illnesses.map((illness) => {
    let likelihood = isAtRiskFor(illness, conditions) ? AT_RISK_BOOST : 1;
    for (const [symptomId, answer] of Object.entries(answers)) {
      if (answer === 'unsure') continue;
      const chance = chanceOfSymptom(illness, symptomId);
      likelihood *= answer === 'yes' ? chance : 1 - chance;
    }
    return likelihood;
  });
  const total = likelihoods.reduce((sum, likelihood) => sum + likelihood, 0);

  const causes = illnesses.map((illness, index) => ({
    illness,
    probability: likelihoods[index] / total,
    isAtRisk: isAtRiskFor(illness, conditions),
  }));
  causes.sort((first, second) => second.probability - first.probability);
  return causes;
}

export function isConfident(causes: PossibleCause[]): boolean {
  return causes[0].probability >= CONFIDENT_PROBABILITY;
}

export function nextQuestionSymptom(answers: SymptomAnswers, conditions: string[]): string | null {
  const causes = rankCauses(answers, conditions);
  let bestSymptomId: string | null = null;
  let bestDistanceFromHalf = Infinity;
  for (const symptom of symptoms) {
    if (answers[symptom.id] !== undefined) continue;
    const chanceOfYes = causes.reduce((sum, cause) => sum + cause.probability * chanceOfSymptom(cause.illness, symptom.id), 0);
    const distanceFromHalf = Math.abs(chanceOfYes - 0.5);
    if (distanceFromHalf < bestDistanceFromHalf) {
      bestDistanceFromHalf = distanceFromHalf;
      bestSymptomId = symptom.id;
    }
  }
  return bestSymptomId;
}

function hasAnyYes(answers: SymptomAnswers, symptomIds: string[]): boolean {
  return symptomIds.some((symptomId) => answers[symptomId] === 'yes');
}

export function urgencyFor(causes: PossibleCause[], answers: SymptomAnswers, conditions: string[]): UrgencyLevel {
  const likelyCauses = causes.slice(0, 3).filter((cause) => cause.probability >= MEANINGFUL_PROBABILITY);
  const isUnsure = likelyCauses.length === 0;
  let level: number = isUnsure ? 2 : Math.max(...likelyCauses.map((cause) => ILLNESS_URGENCY[cause.illness.name]));
  if (hasAnyYes(answers, DOCTOR_SOON_SYMPTOMS)) level = Math.max(level, 3);
  if (hasAnyYes(answers, HOSPITAL_TODAY_SYMPTOMS)) level = Math.max(level, 4);
  if (hasAnyYes(answers, EMERGENCY_SYMPTOMS)) level = 5;
  if (conditions.includes('Pregnancy')) level = Math.min(5, level + 1);
  return level as UrgencyLevel;
}
