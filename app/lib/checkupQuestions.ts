// Sources: CMS Annual Wellness Visit health risk assessment (falls, activity, tobacco, alcohol);
// PHQ-2 (mood); CDC diabetes symptoms; AHA heart failure warning signs; NHLBI EPR-3 asthma control;
// CDC Hear Her urgent maternal warning signs; American Kidney Fund kidney disease symptoms.
export type CheckupQuestion =
  | { id: string; kind: 'choice'; question: string; options: string[] }
  | { id: string; kind: 'text'; question: string }
  | { id: string; kind: 'height'; question: string }
  | { id: string; kind: 'weight'; question: string }
  | { id: string; kind: 'bloodPressure'; question: string };

const yesNo = ['Yes', 'No'];

const generalQuestions: CheckupQuestion[] = [
  { id: 'overall', kind: 'choice', question: 'How do you feel overall today?', options: ['Good', 'Okay', 'Bad'] },
  { id: 'height', kind: 'height', question: 'How tall are you?' },
  { id: 'weight', kind: 'weight', question: 'How much do you weigh?' },
  { id: 'fever', kind: 'choice', question: 'Do you have a fever or chills?', options: yesNo },
  {
    id: 'newProblems',
    kind: 'text',
    question: 'Have you had any new health problems since your last checkup? If so, describe them.',
  },
  {
    id: 'pain',
    kind: 'choice',
    question: 'How much pain do you have right now?',
    options: ['No pain', 'A little', 'Medium', 'A lot'],
  },
  {
    id: 'medicines',
    kind: 'choice',
    question: 'Are you taking your medicines as your health worker told you?',
    options: ['Yes, every dose', 'I sometimes miss doses', 'No', 'I do not take medicine'],
  },
  {
    id: 'clinicVisit',
    kind: 'choice',
    question: 'Have you gone to a clinic or hospital since your last checkup?',
    options: yesNo,
  },
  { id: 'falls', kind: 'choice', question: 'Have you fallen down in the past year?', options: yesNo },
  { id: 'sleep', kind: 'choice', question: 'How well are you sleeping?', options: ['Well', 'Okay', 'Poorly'] },
  {
    id: 'moodInterest',
    kind: 'choice',
    question: 'In the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    id: 'moodDown',
    kind: 'choice',
    question: 'In the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  },
  {
    id: 'activity',
    kind: 'choice',
    question: 'In the past 7 days, on how many days were you active (walking, farm work, chores) for 30 minutes or more?',
    options: ['0 days', '1 to 2 days', '3 to 4 days', '5 or more days'],
  },
  { id: 'tobacco', kind: 'choice', question: 'Do you smoke or use tobacco?', options: yesNo },
  {
    id: 'alcohol',
    kind: 'choice',
    question: 'In the past 7 days, on how many days did you drink alcohol?',
    options: ['0 days', '1 to 2 days', '3 to 4 days', '5 or more days'],
  },
];

const bloodPressureQuestion: CheckupQuestion = {
  id: 'bloodPressure',
  kind: 'bloodPressure',
  question: 'If you have a blood pressure machine, what is your blood pressure?',
};

const questionsByCondition: Record<string, CheckupQuestion[]> = {
  Diabetes: [
    {
      id: 'bloodSugar',
      kind: 'text',
      question: 'What was your last blood sugar reading? Write the number and the unit shown on your meter.',
    },
    { id: 'thirst', kind: 'choice', question: 'Are you very thirsty or hungry, or urinating much more than usual?', options: yesNo },
    { id: 'feet', kind: 'choice', question: 'Do you have cuts or sores that are slow to heal, or numbness or tingling in your hands or feet?', options: yesNo },
  ],
  'High blood pressure': [
    bloodPressureQuestion,
    { id: 'headaches', kind: 'choice', question: 'Have you had headaches or dizziness?', options: yesNo },
  ],
  'Heart disease': [
    bloodPressureQuestion,
    {
      id: 'activityBreath',
      kind: 'choice',
      question: 'Do you get short of breath or have chest pain when you walk or work?',
      options: yesNo,
    },
    { id: 'legSwelling', kind: 'choice', question: 'Are your feet, ankles, legs, or stomach swollen?', options: yesNo },
    {
      id: 'breathLyingDown',
      kind: 'choice',
      question: 'Do you get short of breath when lying down, or need extra pillows to sleep?',
      options: yesNo,
    },
  ],
  'Asthma / COPD': [
    {
      id: 'inhaler',
      kind: 'choice',
      question: 'On how many days this week did you need your rescue inhaler?',
      options: ['0 days', '1 to 2 days', '3 or more days', 'I do not have one'],
    },
    {
      id: 'nightCough',
      kind: 'choice',
      question: 'In the last month, did coughing or wheezing wake you up at night more than 2 times?',
      options: yesNo,
    },
  ],
  Pregnancy: [
    { id: 'babyMoving', kind: 'choice', question: 'Is the baby moving as much as usual?', options: ['Yes', 'No', 'Too early to feel'] },
    { id: 'pregnancyBleeding', kind: 'choice', question: 'Have you had heavy bleeding or fluid leaking from your vagina?', options: yesNo },
    {
      id: 'pregnancyHeadache',
      kind: 'choice',
      question: 'Do you have a headache that will not go away or gets worse, or changes in your vision?',
      options: yesNo,
    },
    {
      id: 'pregnancyLeg',
      kind: 'choice',
      question: 'Do you have swelling, redness, or pain in one leg?',
      options: yesNo,
    },
  ],
  'Kidney disease': [
    { id: 'kidneySwelling', kind: 'choice', question: 'Are your hands, legs, ankles, or feet swollen?', options: yesNo },
    { id: 'lessUrine', kind: 'choice', question: 'Are you urinating more or less than usual?', options: yesNo },
  ],
};

export function checkupQuestionsFor(conditions: string[]): CheckupQuestion[] {
  const questions = [...generalQuestions];
  for (const condition of conditions) {
    for (const question of questionsByCondition[condition] ?? []) {
      const isAlreadyAsked = questions.some((existing) => existing.id === question.id);
      if (!isAlreadyAsked) questions.push(question);
    }
  }
  return questions;
}
