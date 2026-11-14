import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { CheckupRecord, loadCheckups } from '@/lib/checkups';

export default function Screen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const [checkup, setCheckup] = useState<CheckupRecord | undefined>();
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  useEffect(() => {
    loadCheckups().then((checkups) => setCheckup(checkups.find((each) => each.date === date)));
  }, [date]);

  if (!checkup) return null;

  function toggle(question: string) {
    if (openQuestions.includes(question)) {
      setOpenQuestions(openQuestions.filter((each) => each !== question));
      return;
    }
    setOpenQuestions([...openQuestions, question]);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: checkup.kind === 'emergency' ? 'Emergency' : 'Checkup' }} />
      <Text style={[styles.heading, { color: checkup.kind === 'emergency' ? '#d32f2f' : textColor }]}>
        {new Date(checkup.date).toLocaleString()}
      </Text>
      {checkup.answers.length === 0 && <Text style={[styles.answer, { color: textColor }]}>All questions skipped</Text>}
      {checkup.answers.map((each) => {
        const isOpen = openQuestions.includes(each.question);
        return (
          <View key={each.question} style={[styles.item, { borderColor: textColor }]}>
            <Pressable style={styles.questionRow} onPress={() => toggle(each.question)}>
              <Text style={[styles.question, { color: textColor }]}>{each.question}</Text>
              <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'chevron-down'} size={28} color={textColor} />
            </Pressable>
            {isOpen && <Text style={[styles.answer, { color: textColor }]}>{each.answer}</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700' },
  item: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  question: { flex: 1, fontSize: 18 },
  answer: { fontSize: 20, fontWeight: '700' },
});
