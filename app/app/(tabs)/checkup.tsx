import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const NEXT_CHECKUP_TEXT = 'Next checkup: not yet scheduled';

export default function Screen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => router.push('/checkup-form')}>
          <Text style={styles.label}>Start checkup</Text>
          <Text style={styles.subLabel}>{NEXT_CHECKUP_TEXT}</Text>
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
  center: { flex: 1, justifyContent: 'center' },
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
