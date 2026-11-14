import { router } from 'expo-router';
import { nextCheckupDate } from '@/lib/checkupSchedule';
import { useProfile } from '@/lib/profile';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Screen() {
  const { profile } = useProfile();
  const schedule = profile?.checkupSchedule;
  const nextCheckupText = schedule
    ? `Next checkup: ${nextCheckupDate(schedule).toLocaleDateString()}`
    : 'Next checkup: not yet scheduled';

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => router.push('/checkup-form')}>
          <Text style={styles.label}>Start checkup</Text>
          <Text style={styles.subLabel}>{nextCheckupText}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.dataButton, pressed && styles.pressed]}
          onPress={() => router.push('/my-data')}>
          <Text style={styles.label}>View my data</Text>
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [styles.doctorButton, pressed && styles.pressed]}
        onPress={() => router.push('/doctor')}>
        <Text style={styles.doctorLabel}>I'm a doctor</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', gap: 16 },
  dataButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 24,
  },
  button: {
    paddingVertical: 48,
    backgroundColor: '#0a7ea4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doctorButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doctorLabel: { color: 'white', fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  label: { color: 'white', fontSize: 28, fontWeight: '700' },
  subLabel: { color: 'white', fontSize: 18 },
});
