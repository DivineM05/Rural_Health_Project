import { ScrollView, StyleSheet, Text } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { describeSchedule, nextCheckupDate } from '@/lib/checkupSchedule';
import { useProfile } from '@/lib/profile';

export default function Screen() {
  const { profile } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  if (!profile) return null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <Text style={[styles.value, { color: textColor }]}>Location: {profile.location.name}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  value: { fontSize: 20 },
});
