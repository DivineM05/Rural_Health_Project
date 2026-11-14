import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { describeSchedule, nextCheckupDate } from '@/lib/checkupSchedule';
import { CheckupRecord, loadCheckups } from '@/lib/checkups';
import { useProfile } from '@/lib/profile';

export default function Screen() {
  const { profile } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const [checkups, setCheckups] = useState<CheckupRecord[]>([]);

  useEffect(() => {
    loadCheckups().then(setCheckups);
  }, []);

  if (!profile) return null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <Text style={[styles.value, { color: textColor }]}>Location: {profile.location}</Text>
      {profile.checkupSchedule && (
        <Text style={[styles.value, { color: textColor }]}>
          Checkups: {describeSchedule(profile.checkupSchedule)}, next{' '}
          {nextCheckupDate(profile.checkupSchedule).toLocaleDateString()}
        </Text>
      )}
      <Text style={[styles.heading, { color: textColor }]}>Conditions at risk for</Text>
      {profile.conditions.length === 0 && <Text style={[styles.value, { color: textColor }]}>None</Text>}
      {profile.conditions.map((condition) => (
        <Text key={condition} style={[styles.value, { color: textColor }]}>
          {condition}
        </Text>
      ))}
      <Text style={[styles.heading, { color: textColor }]}>Past checkups</Text>
      {checkups.length === 0 && <Text style={[styles.value, { color: textColor }]}>None yet</Text>}
      {[...checkups].reverse().map((checkup) => (
        <View key={checkup.date} style={styles.checkup}>
          <Text style={[styles.checkupDate, { color: textColor }]}>
            {new Date(checkup.date).toLocaleDateString()}
          </Text>
          {checkup.answers.map((each) => (
            <Text key={each.question} style={[styles.answer, { color: textColor }]}>
              {each.question} {each.answer}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  value: { fontSize: 20 },
  checkup: { gap: 4, marginTop: 8 },
  checkupDate: { fontSize: 18, fontWeight: '700' },
  answer: { fontSize: 16 },
});
