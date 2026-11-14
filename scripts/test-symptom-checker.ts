// Run: cd app && npx tsx ../scripts/test-symptom-checker.ts
import assert from 'node:assert/strict';

import {
  isConfident,
  nextQuestionSymptom,
  rankCauses,
  searchSymptoms,
  SymptomAnswers,
  urgencyFor,
} from '../app/lib/symptomChecker';

function answerQuestionsFor(illnessName: string, reported: string[], denied: string[], conditions: string[]) {
  const answers: SymptomAnswers = {};
  for (const symptomId of reported) answers[symptomId] = 'yes';
  const illness = rankCauses(answers, conditions).find((cause) => cause.illness.name === illnessName)!.illness;
  for (let questionCount = 0; questionCount < 10; questionCount++) {
    if (isConfident(rankCauses(answers, conditions))) break;
    const symptomId = nextQuestionSymptom(answers, conditions);
    if (!symptomId) break;
    const hasSymptom = symptomId in illness.symptoms && !denied.includes(symptomId);
    answers[symptomId] = hasSymptom ? 'yes' : 'no';
  }
  const causes = rankCauses(answers, conditions);
  return { causes, urgency: urgencyFor(causes, answers, conditions) };
}

const cases = [
  { illness: 'Common Cold', reported: ['runny_nose'], denied: ['chest_pain'], conditions: [], expectedUrgency: [1, 2, 3] },
  { illness: 'Heart attack', reported: ['chest_pain'], denied: [], conditions: ['Heart disease'], expectedUrgency: [5] },
  { illness: 'Urinary tract infection', reported: ['burning_micturition'], denied: [], conditions: [], expectedUrgency: [2] },
  { illness: 'Malaria', reported: ['chills', 'vomiting'], denied: [], conditions: [], expectedUrgency: [4, 5] },
  { illness: 'Migraine', reported: ['headache'], denied: [], conditions: [], expectedUrgency: [1, 2] },
];

for (const testCase of cases) {
  const { causes, urgency } = answerQuestionsFor(
    testCase.illness,
    testCase.reported,
    testCase.denied,
    testCase.conditions,
  );
  const topThree = causes.slice(0, 3).map((cause) => `${cause.illness.name} ${Math.round(cause.probability * 100)}%`);
  console.log(`${testCase.illness}: urgency ${urgency}; ${topThree.join(', ')}`);
  assert.equal(causes[0].illness.name, testCase.illness);
  assert.ok(testCase.expectedUrgency.includes(urgency), `urgency ${urgency}`);
}

assert.equal(searchSymptoms('hedache', [])[0].id, 'headache');
console.log('search "hedache":', searchSymptoms('hedache', []).map((symptom) => symptom.label).join(', '));
console.log('search "urin":', searchSymptoms('urin', []).map((symptom) => symptom.label).join(', '));
console.log('All passed');
