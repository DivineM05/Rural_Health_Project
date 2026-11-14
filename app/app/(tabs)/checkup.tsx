import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { NavigationCard } from '@/components/NavigationCard';
import { nextCheckupDate } from '@/lib/checkupSchedule';
import { useProfile } from '@/lib/profile';
import { colors, useTheme } from '@/lib/theme';

export default function Screen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const schedule = profile?.checkupSchedule;
  const nextCheckupText = schedule
    ? `Next checkup: ${nextCheckupDate(schedule).toLocaleDateString()}`
    : 'Next checkup: not yet scheduled';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
        onPress={() => router.push('/checkup-form')}>
        <Text style={styles.startLabel}>Start checkup</Text>
        <Text style={styles.startSubLabel}>{nextCheckupText}</Text>
      </Pressable>
      <NavigationCard
        title="My data"
        subtitle="Past checkups, symptoms and doctor info"
        icon="folder-account"
        color={colors.success}
        onPress={() => router.push('/my-data')}
      />
      <Pressable
        style={({ pressed }) => [styles.doctorButton, { borderColor: theme.border }, pressed && styles.pressed]}
        onPress={() => router.push('/doctor')}>
        <Text style={[styles.doctorLabel, { color: theme.muted }]}>I'm a doctor</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  startLabel: { color: 'white', fontSize: 30, fontWeight: '700' },
  startSubLabel: { color: 'white', fontSize: 18, opacity: 0.9 },
  doctorButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  doctorLabel: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
