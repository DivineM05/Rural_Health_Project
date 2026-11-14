import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { CheckupRecord, loadCheckups, RECORD_KIND_DISPLAY } from '@/lib/checkups';
import { useTheme } from '@/lib/theme';

export default function Screen() {
  const theme = useTheme();
  const textColor = theme.text;
  const [checkups, setCheckups] = useState<CheckupRecord[]>([]);

  useEffect(() => {
    loadCheckups().then(setCheckups);
  }, []);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, styles.setupButton, pressed && styles.pressed]}
        onPress={() => router.push('/setup-info')}>
        <Text style={styles.buttonLabel}>Info from my doctor</Text>
      </Pressable>

      <Text style={[styles.heading, { color: textColor }]}>History</Text>
      {checkups.length === 0 && <Text style={[styles.value, { color: textColor }]}>None yet</Text>}
      {[...checkups].reverse().map((checkup) => (
        <Pressable
          key={checkup.date}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: RECORD_KIND_DISPLAY[checkup.kind].color },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push({ pathname: '/checkup-detail', params: { date: checkup.date } })}>
          <Text style={styles.buttonLabel}>
            {RECORD_KIND_DISPLAY[checkup.kind].title}: {new Date(checkup.date).toLocaleString()}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  value: { fontSize: 20 },
  button: { borderRadius: 20, paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  setupButton: { backgroundColor: '#2e7d32' },
  buttonLabel: { color: 'white', fontSize: 20, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
