import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveCheckup } from '@/lib/checkups';
import { emergencyQuestions } from '@/lib/emergencyQuestions';

type Result = 'none' | 'emergency' | 'no-signs';

export default function EmergencyScreen() {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? 'white' : 'black';
  const backgroundColor = isDark ? 'black' : 'white';

  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<Result>('none');
  const [isShowingMoreInformation, setIsShowingMoreInformation] = useState(false);

  function goBack() {
    setIsShowingMoreInformation(false);
    if (result !== 'none') {
      setResult('none');
      return;
    }
    if (questionIndex === 0) {
      router.back();
      return;
    }
    setQuestionIndex(questionIndex - 1);
  }

  function answerYes() {
    const noAnswers = emergencyQuestions.slice(0, questionIndex).map((each) => ({
      question: each.question,
      answer: 'No',
    }));
    const yesAnswer = { question: emergencyQuestions[questionIndex].question, answer: 'Yes' };
    saveCheckup({ kind: 'emergency', date: new Date().toISOString(), answers: [yesAnswer, ...noAnswers] });
    setResult('emergency');
  }

  function answerNo() {
    const isLastQuestion = questionIndex === emergencyQuestions.length - 1;
    if (isLastQuestion) {
      setResult('no-signs');
      return;
    }
    setIsShowingMoreInformation(false);
    setQuestionIndex(questionIndex + 1);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Pressable style={styles.backButton} onPress={goBack} accessibilityLabel="Back">
        <MaterialCommunityIcons name="arrow-left" size={36} color={textColor} />
      </Pressable>

      {result === 'none' && (
        <View style={styles.body}>
          <Text style={[styles.progress, { color: textColor }]}>
            Question {questionIndex + 1} of {emergencyQuestions.length}
          </Text>
          <Text style={[styles.question, { color: textColor }]}>
            {emergencyQuestions[questionIndex].question}
          </Text>
          {isShowingMoreInformation && (
            <Text style={[styles.moreInformation, { color: textColor }]}>
              {emergencyQuestions[questionIndex].moreInformation}
            </Text>
          )}
          <View style={styles.answers}>
            <Pressable
              style={({ pressed }) => [styles.answerButton, styles.yes, pressed && styles.pressed]}
              onPress={answerYes}>
              <Text style={styles.answerLabel}>Yes</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.answerButton, styles.no, pressed && styles.pressed]}
              onPress={answerNo}>
              <Text style={styles.answerLabel}>No</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [styles.unsureButton, pressed && styles.pressed]}
            onPress={() => setIsShowingMoreInformation(true)}>
            <Text style={styles.unsureLabel}>I'm unsure</Text>
          </Pressable>
        </View>
      )}

      {result === 'emergency' && (
        <View style={styles.body}>
          <Text style={[styles.resultTitle, { color: '#d32f2f' }]}>Get help now</Text>
          <Text style={[styles.resultText, { color: textColor }]}>
            This may be an emergency. Call emergency services or go to the nearest clinic or
            hospital right away. Ask someone nearby to help you.
          </Text>
        </View>
      )}

      {result === 'no-signs' && (
        <View style={styles.body}>
          <Text style={[styles.resultTitle, { color: textColor }]}>No emergency signs found</Text>
          <Text style={[styles.resultText, { color: textColor }]}>
            Your answers do not show common emergency warning signs. If you feel worse or are
            still worried, contact your clinic or a health worker.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  backButton: { alignSelf: 'flex-start', padding: 8 },
  body: { flex: 1, justifyContent: 'center', gap: 24 },
  progress: { fontSize: 16, textAlign: 'center' },
  question: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  answers: { flexDirection: 'row', gap: 16 },
  answerButton: { flex: 1, borderRadius: 24, paddingVertical: 32, alignItems: 'center' },
  yes: { backgroundColor: '#d32f2f' },
  no: { backgroundColor: '#0a7ea4' },
  unsureButton: { backgroundColor: '#757575', borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  unsureLabel: { color: 'white', fontSize: 22, fontWeight: '700' },
  moreInformation: { fontSize: 18, textAlign: 'center' },
  answerLabel: { color: 'white', fontSize: 28, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  resultTitle: { fontSize: 32, fontWeight: '700', textAlign: 'center' },
  resultText: { fontSize: 20, textAlign: 'center' },
});
