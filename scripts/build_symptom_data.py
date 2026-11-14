"""Builds app/lib/symptomData.json from the Kaggle "Disease Symptom Prediction" dataset
(itachi9604), mirrored at https://github.com/itachi9604/healthcare-chatbot.

Run: python3 scripts/build_symptom_data.py
"""

import csv
import io
import json
import urllib.request
from collections import defaultdict
from pathlib import Path

BASE_URL = 'https://raw.githubusercontent.com/itachi9604/healthcare-chatbot/master/'
OUTPUT_PATH = Path(__file__).resolve().parent.parent / 'app' / 'lib' / 'symptomData.json'

NAME_OVERRIDES = {
    '(vertigo) Paroymsal Positional Vertigo': 'Positional vertigo (BPPV)',
    'Dimorphic hemmorhoids(piles)': 'Hemorrhoids (piles)',
    'Dimorphic hemorrhoids(piles)': 'Hemorrhoids (piles)',
    'Osteoarthristis': 'Osteoarthritis',
    'Peptic ulcer diseae': 'Peptic ulcer disease',
    'hepatitis A': 'Hepatitis A',
}

LABEL_OVERRIDES = {
    'acidity': 'Heartburn (acidity)',
    'acute_liver_failure': 'Acute liver failure',
    'altered_sensorium': 'Confusion or not fully aware',
    'blood_in_sputum': 'Coughing up blood',
    'blurred_and_distorted_vision': 'Blurred or distorted vision',
    'burning_micturition': 'Burning or pain when urinating',
    'cold_hands_and_feets': 'Cold hands and feet',
    'coma': 'Fainting or hard to wake up',
    'continuous_feel_of_urine': 'Constant urge to urinate',
    'diarrhoea': 'Diarrhea',
    'dischromic_patches': 'Patches of discolored skin',
    'distention_of_abdomen': 'Swollen belly',
    'drying_and_tingling_lips': 'Dry, tingling lips',
    'extra_marital_contacts': 'Sex with new or several partners',
    'family_history': 'Family members with a similar illness',
    'fluid_overload': 'Fluid buildup in the body',
    'foul_smell_of_urine': 'Bad-smelling urine',
    'history_of_alcohol_consumption': 'Drinking a lot of alcohol',
    'inflammatory_nails': 'Red, swollen skin around the nails',
    'internal_itching': 'Itching inside the body',
    'irregular_sugar_level': 'Irregular blood sugar',
    'malaise': 'Generally feeling unwell',
    'mucoid_sputum': 'Coughing up clear or white mucus',
    'nodal_skin_eruptions': 'Bumps on the skin',
    'obesity': 'Very overweight',
    'passage_of_gases': 'Passing a lot of gas',
    'phlegm': 'Coughing up phlegm',
    'polyuria': 'Urinating a lot',
    'prominent_veins_on_calf': 'Bulging veins on the calf',
    'receiving_blood_transfusion': 'Had a blood transfusion',
    'receiving_unsterile_injections': 'Had injections with unclean needles',
    'red_sore_around_nose': 'Red sore around the nose',
    'rusty_sputum': 'Coughing up rust-colored mucus',
    'scurring': 'Scarring on the skin',
    'silver_like_dusting': 'Silvery, flaky skin patches',
    'spinning_movements': 'Room spinning (vertigo)',
    'spotting_urination': 'Blood spots when urinating',
    'stomach_bleeding': 'Vomiting blood or black stool',
    'swelled_lymph_nodes': 'Swollen glands (lymph nodes)',
    'swollen_extremeties': 'Swollen hands or feet',
    'toxic_look_(typhos)': 'Very ill, dazed look',
    'ulcers_on_tongue': 'Sores on the tongue',
    'weakness_of_one_body_side': 'Weakness on one side of the body',
    'yellow_crust_ooze': 'Yellow crusty ooze from sores',
}


def download_rows(path):
    with urllib.request.urlopen(BASE_URL + path) as response:
        return list(csv.reader(io.StringIO(response.read().decode('utf-8'))))


def normalize_illness_name(raw_name):
    name = ' '.join(raw_name.split())
    return NAME_OVERRIDES.get(name, name)


def normalize_symptom_id(raw_id):
    symptom_id = raw_id.strip().replace(' ', '')
    if symptom_id == 'foul_smell_ofurine':
        return 'foul_smell_of_urine'
    return symptom_id


def label_for(symptom_id):
    if symptom_id in LABEL_OVERRIDES:
        return LABEL_OVERRIDES[symptom_id]
    text = symptom_id.replace('_', ' ')
    return text[0].upper() + text[1:]


def main():
    training_rows = download_rows('Data/Training.csv')
    header = [normalize_symptom_id(name) for name in training_rows[0]]
    symptom_columns = header[:-1]

    row_counts = defaultdict(int)
    symptom_counts = defaultdict(lambda: defaultdict(int))
    for row in training_rows[1:]:
        illness = normalize_illness_name(row[-1])
        row_counts[illness] += 1
        present = {symptom_columns[index] for index, value in enumerate(row[:-1]) if value.strip() == '1'}
        for symptom_id in present:
            symptom_counts[illness][symptom_id] += 1

    severities = {}
    for row in download_rows('MasterData/Symptom_severity.csv'):
        if len(row) == 2:
            severities.setdefault(normalize_symptom_id(row[0]), int(row[1]))

    descriptions = {}
    for row in download_rows('MasterData/symptom_Description.csv'):
        if len(row) >= 2:
            descriptions[normalize_illness_name(row[0])] = row[1].strip()

    used_symptoms = sorted({symptom_id for counts in symptom_counts.values() for symptom_id in counts})
    symptoms = [
        {'id': symptom_id, 'label': label_for(symptom_id), 'severity': severities.get(symptom_id, 3)}
        for symptom_id in used_symptoms
    ]
    illnesses = [
        {
            'name': illness,
            'description': descriptions.get(illness, ''),
            'symptoms': {
                symptom_id: round(count / row_counts[illness], 2)
                for symptom_id, count in sorted(symptom_counts[illness].items())
            },
        }
        for illness in sorted(symptom_counts)
    ]

    OUTPUT_PATH.write_text(json.dumps({'symptoms': symptoms, 'illnesses': illnesses}, indent=1) + '\n')
    print(f'{len(symptoms)} symptoms, {len(illnesses)} illnesses -> {OUTPUT_PATH}')


main()
