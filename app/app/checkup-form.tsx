import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkupQuestionsFor, CheckupQuestion } from '@/lib/checkupQuestions';
import { heightFromUsUnits, saveCheckup, weightFromPounds } from '@/lib/checkups';
import { useProfile } from '@/lib/profile';

type UnitSystem = 'metric' | 'us';
type Answers = Record<string, string>;

export default function CheckupFormScreen() {
  const { profile } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? 'white' : 'black';
  const backgroundColor = isDark ? 'black' : 'white';

  const questions = useMemo(() => checkupQuestionsFor(profile?.conditions ?? []), [profile]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [fields, setFields] = useState<Record<string, string>>({});
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[questionIndex];

  function confirmLeave() {
    Alert.alert('Leave checkup?', 'Your answers will not be saved.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  function goToPreviousQuestion() {
    setFields({});
    setQuestionIndex(questionIndex - 1);
  }

  async function goToNextQuestion(newAnswers: Answers) {
    setAnswers(newAnswers);
    setFields({});
    const isLastQuestion = questionIndex === questions.length - 1;
    if (!isLastQuestion) {
      setQuestionIndex(questionIndex + 1);
      return;
    }
    const answeredQuestions = questions.filter((each) => newAnswers[each.id] !== undefined);
    await saveCheckup({
      kind: 'checkup',
      date: new Date().toISOString(),
      answers: answeredQuestions.map((each) => ({ question: each.question, answer: newAnswers[each.id] })),
    });
    setIsFinished(true);
  }

  function answer(value: string) {
    goToNextQuestion({ ...answers, [question.id]: value });
  }

  function skip() {
    const newAnswers = { ...answers };
    delete newAnswers[question.id];
    goToNextQuestion(newAnswers);
  }

  function setField(name: string, value: string) {
    setFields({ ...fields, [name]: value });
  }

  if (isFinished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.body}>
          <Text style={[styles.question, { color: textColor }]}>Checkup saved</Text>
          <Text style={[styles.hint, { color: textColor }]}>You can see it in View my data.</Text>
          <Pressable style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]} onPress={() => router.back()}>
            <Text style={styles.buttonLabel}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const inputProps = {
    style: [styles.input, { color: textColor, borderColor: textColor }],
    placeholderTextColor: '#888',
  };

  function nextButton(isReady: boolean, onPress: () => void) {
    return (
      <Pressable
        style={({ pressed }) => [styles.nextButton, !isReady && styles.disabled, pressed && styles.pressed]}
        disabled={!isReady}
        onPress={onPress}>
        <Text style={styles.buttonLabel}>Next</Text>
      </Pressable>
    );
  }

  function unitToggle() {
    return (
      <View style={styles.row}>
        <Pressable
          style={[styles.unitButton, unitSystem === 'metric' && styles.unitSelected]}
          onPress={() => setUnitSystem('metric')}>
          <Text style={styles.unitLabel}>Metric</Text>
        </Pressable>
        <Pressable
          style={[styles.unitButton, unitSystem === 'us' && styles.unitSelected]}
          onPress={() => setUnitSystem('us')}>
          <Text style={styles.unitLabel}>US</Text>
        </Pressable>
      </View>
    );
  }

  function numberField(name: string, unit: string) {
    return (
      <View style={styles.fieldRow}>
        <TextInput
          {...inputProps}
          keyboardType="decimal-pad"
          value={fields[name] ?? ''}
          onChangeText={(value) => setField(name, value)}
        />
        <Text style={[styles.unitText, { color: textColor }]}>{unit}</Text>
      </View>
    );
  }

  function answerInput(current: CheckupQuestion) {
    if (current.kind === 'choice') {
      return current.options.map((option) => (
        <Pressable
          key={option}
          style={({ pressed }) => [styles.choiceButton, pressed && styles.pressed]}
          onPress={() => answer(option)}>
          <Text style={styles.buttonLabel}>{option}</Text>
        </Pressable>
      ));
    }

    if (current.kind === 'text') {
      const text = fields.text ?? '';
      return (
        <>
          <TextInput
            {...inputProps}
            style={[...inputProps.style, styles.textArea]}
            multiline
            value={text}
            onChangeText={(value) => setField('text', value)}
          />
          {nextButton(text.trim() !== '', () => answer(text.trim()))}
        </>
      );
    }

    if (current.kind === 'bloodPressure') {
      const top = fields.top ?? '';
      const bottom = fields.bottom ?? '';
      return (
        <>
          <Text style={[styles.hint, { color: textColor }]}>Top number</Text>
          {numberField('top', 'mmHg')}
          <Text style={[styles.hint, { color: textColor }]}>Bottom number</Text>
          {numberField('bottom', 'mmHg')}
          {nextButton(top !== '' && bottom !== '', () => answer(`${top}/${bottom} mmHg`))}
        </>
      );
    }

    if (current.kind === 'height') {
      if (unitSystem === 'metric') {
        const centimeters = fields.centimeters ?? '';
        return (
          <>
            {unitToggle()}
            {numberField('centimeters', 'cm')}
            {nextButton(centimeters !== '', () => answer(`${centimeters} cm`))}
          </>
        );
      }
      const feet = fields.feet ?? '';
      const inches = fields.inches ?? '';
      return (
        <>
          {unitToggle()}
          {numberField('feet', 'ft')}
          {numberField('inches', 'in')}
          {nextButton(feet !== '', () => answer(heightFromUsUnits(Number(feet), Number(inches || 0))))}
        </>
      );
    }

    const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';
    const weight = fields.weight ?? '';
    return (
      <>
        {unitToggle()}
        {numberField('weight', weightUnit)}
        {nextButton(weight !== '', () =>
          answer(unitSystem === 'metric' ? `${weight} kg` : weightFromPounds(Number(weight))),
        )}
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.row}>
        <Pressable style={styles.iconButton} onPress={confirmLeave} accessibilityLabel="Leave checkup">
          <MaterialCommunityIcons name="close" size={36} color={textColor} />
        </Pressable>
        {questionIndex > 0 && (
          <Pressable style={styles.iconButton} onPress={goToPreviousQuestion} accessibilityLabel="Previous question">
            <MaterialCommunityIcons name="arrow-left" size={36} color={textColor} />
          </Pressable>
        )}
      </View>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={[styles.progress, { color: textColor }]}>
            Question {questionIndex + 1} of {questions.length}
          </Text>
          <Text style={[styles.question, { color: textColor }]}>{question.question}</Text>
          {answerInput(question)}
          <Pressable style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]} onPress={skip}>
            <Text style={styles.buttonLabel}>Skip / I don't know</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  iconButton: { padding: 8 },
  body: { flexGrow: 1, justifyContent: 'center', gap: 16, padding: 8 },
  progress: { fontSize: 16, textAlign: 'center' },
  question: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  hint: { fontSize: 18, textAlign: 'center' },
  choiceButton: { backgroundColor: '#0a7ea4', borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  nextButton: { backgroundColor: '#0a7ea4', borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  skipButton: { backgroundColor: '#757575', borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  buttonLabel: { color: 'white', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  unitButton: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center', backgroundColor: '#757575' },
  unitSelected: { backgroundColor: '#0a7ea4' },
  unitLabel: { color: 'white', fontSize: 18, fontWeight: '700' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 22 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  unitText: { fontSize: 22, width: 60 },
});
