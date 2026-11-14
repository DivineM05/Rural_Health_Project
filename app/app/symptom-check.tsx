import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UrgencyScale } from '@/components/UrgencyScale';
import { saveCheckup } from '@/lib/checkups';
import { useProfile } from '@/lib/profile';
import {
  isConfident,
  nextQuestionSymptom,
  PossibleCause,
  rankCauses,
  SymptomAnswer,
  SymptomAnswers,
  symptomLabel,
  URGENCY_LABELS,
  urgencyFor,
  UrgencyLevel,
} from '@/lib/symptomChecker';
import { useTheme } from '@/lib/theme';

const MAX_QUESTIONS = 10;
const ANSWER_TEXT: Record<SymptomAnswer, string> = { yes: 'Yes', no: 'No', unsure: 'Not sure' };

type Result = { causes: PossibleCause[]; urgency: UrgencyLevel };

export default function SymptomCheckScreen() {
  const params = useLocalSearchParams<{ symptoms: string }>();
  const reportedSymptomIds = params.symptoms.split(',');
  const { profile } = useProfile();
  const conditions = profile?.conditions ?? [];
  const theme = useTheme();
  const textColor = theme.text;
  const backgroundColor = theme.page;

  const [answers, setAnswers] = useState<SymptomAnswers>(() =>
    Object.fromEntries(reportedSymptomIds.map((symptomId) => [symptomId, 'yes'])),
  );
  const [askedSymptomIds, setAskedSymptomIds] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  function isDoneAsking(currentAnswers: SymptomAnswers, askedCount: number): boolean {
    if (askedCount >= MAX_QUESTIONS) return true;
    if (isConfident(rankCauses(currentAnswers, conditions))) return true;
    return nextQuestionSymptom(currentAnswers, conditions) === null;
  }

  async function finish(finalAnswers: SymptomAnswers, finalAskedIds: string[]) {
    const causes = rankCauses(finalAnswers, conditions).slice(0, 3);
    const urgency = urgencyFor(causes, finalAnswers, conditions);
    await saveCheckup({
      kind: 'symptoms',
      date: new Date().toISOString(),
      answers: [
        { question: 'Symptoms reported', answer: reportedSymptomIds.map(symptomLabel).join(', ') },
        ...finalAskedIds.map((symptomId) => ({
          question: `Do you have: ${symptomLabel(symptomId)}?`,
          answer: ANSWER_TEXT[finalAnswers[symptomId]],
        })),
        {
          question: 'Possible causes',
          answer: causes.map((cause) => `${cause.illness.name} (${Math.round(cause.probability * 100)}%)`).join(', '),
        },
        { question: 'Urgency', answer: URGENCY_LABELS[urgency] },
      ],
    });
    setResult({ causes, urgency });
  }

  useEffect(() => {
    if (isDoneAsking(answers, 0)) finish(answers, []);
  }, []);

  const currentSymptomId = result ? null : nextQuestionSymptom(answers, conditions);

  function answer(value: SymptomAnswer) {
    const newAnswers = { ...answers, [currentSymptomId!]: value };
    const newAskedIds = [...askedSymptomIds, currentSymptomId!];
    setAnswers(newAnswers);
    setAskedSymptomIds(newAskedIds);
    if (isDoneAsking(newAnswers, newAskedIds.length)) finish(newAnswers, newAskedIds);
  }

  function goToPreviousQuestion() {
    const lastAskedId = askedSymptomIds[askedSymptomIds.length - 1];
    const newAnswers = { ...answers };
    delete newAnswers[lastAskedId];
    setAnswers(newAnswers);
    setAskedSymptomIds(askedSymptomIds.slice(0, -1));
  }

  function confirmLeave() {
    if (result) {
      router.back();
      return;
    }
    Alert.alert('Leave symptom questions?', 'Your answers will not be saved.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.topRow}>
        <Pressable style={styles.iconButton} onPress={confirmLeave} accessibilityLabel="Leave">
          <MaterialCommunityIcons name="close" size={36} color={textColor} />
        </Pressable>
        {!result && askedSymptomIds.length > 0 && (
          <Pressable style={styles.iconButton} onPress={goToPreviousQuestion} accessibilityLabel="Previous question">
            <MaterialCommunityIcons name="arrow-left" size={36} color={textColor} />
          </Pressable>
        )}
      </View>

      {!result && currentSymptomId && (
        <View style={styles.body}>
          <Text style={[styles.progress, { color: textColor }]}>
            Question {askedSymptomIds.length + 1} of up to {MAX_QUESTIONS}
          </Text>
          <Text style={[styles.prompt, { color: textColor }]}>Do you have this?</Text>
          <Text style={[styles.question, { color: textColor }]}>{symptomLabel(currentSymptomId)}</Text>
          <View style={styles.answers}>
            <Pressable
              style={({ pressed }) => [styles.answerButton, pressed && styles.pressed]}
              onPress={() => answer('yes')}>
              <Text style={styles.answerLabel}>Yes</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.answerButton, pressed && styles.pressed]}
              onPress={() => answer('no')}>
              <Text style={styles.answerLabel}>No</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [styles.unsureButton, pressed && styles.pressed]}
            onPress={() => answer('unsure')}>
            <Text style={styles.buttonLabel}>I'm not sure</Text>
          </Pressable>
        </View>
      )}

      {result && (
        <ScrollView contentContainerStyle={styles.results}>
          <Text style={[styles.heading, { color: textColor }]}>How soon to get care</Text>
          <UrgencyScale level={result.urgency} textColor={textColor} />
          {result.urgency >= 4 && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.hospitalButton, pressed && styles.pressed]}
              onPress={() => router.dismissTo('/map')}>
              <MaterialCommunityIcons name="hospital-box" size={28} color="white" />
              <Text style={styles.buttonLabel}>Find the nearest hospital</Text>
            </Pressable>
          )}
          {result.urgency === 5 && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.emergencyButton, pressed && styles.pressed]}
              onPress={() => router.replace('/emergency')}>
              <Text style={styles.buttonLabel}>I think I'm having an emergency</Text>
            </Pressable>
          )}

          <Text style={[styles.heading, { color: textColor }]}>Possible causes</Text>
          <Text style={[styles.note, { color: textColor }]}>
            This is not a diagnosis. Your answers were compared with a public list of 41 illnesses. A health worker
            should check what is really wrong.
          </Text>
          {result.causes.map((cause) => (
            <View key={cause.illness.name} style={[styles.cause, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[styles.causeName, { color: textColor }]}>
                {cause.illness.name}: {Math.round(cause.probability * 100)}%
              </Text>
              {cause.isAtRisk && <Text style={styles.atRisk}>You are at risk for this</Text>}
              <Text style={[styles.description, { color: textColor }]}>{cause.illness.description}</Text>
            </View>
          ))}

          <Pressable style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]} onPress={() => router.back()}>
            <Text style={styles.buttonLabel}>Done</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  topRow: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8 },
  body: { flex: 1, justifyContent: 'center', gap: 20, padding: 8 },
  progress: { fontSize: 16, textAlign: 'center' },
  prompt: { fontSize: 20, textAlign: 'center' },
  question: { fontSize: 30, fontWeight: '700', textAlign: 'center' },
  answers: { flexDirection: 'row', gap: 16 },
  answerButton: { flex: 1, backgroundColor: '#0a7ea4', borderRadius: 24, paddingVertical: 32, alignItems: 'center' },
  answerLabel: { color: 'white', fontSize: 28, fontWeight: '700' },
  unsureButton: { backgroundColor: '#757575', borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  pressed: { opacity: 0.7 },
  buttonLabel: { color: 'white', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  results: { padding: 8, gap: 16 },
  heading: { fontSize: 24, fontWeight: '700' },
  actionButton: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  hospitalButton: { backgroundColor: '#ef6c00' },
  emergencyButton: { backgroundColor: '#d32f2f' },
  note: { fontSize: 16, opacity: 0.8 },
  cause: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  causeName: { fontSize: 22, fontWeight: '700' },
  atRisk: { color: '#ef6c00', fontSize: 16, fontWeight: '700' },
  description: { fontSize: 16 },
  doneButton: { backgroundColor: '#0a7ea4', borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
});
