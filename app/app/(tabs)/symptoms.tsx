import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.emergencyButton, pressed && styles.pressed]}
        onPress={() => router.push('/emergency')}>
        <Text style={styles.label}>I think I'm having an emergency</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  emergencyButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 24,
    paddingVertical: 64,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  label: { color: 'white', fontSize: 32, fontWeight: '700', textAlign: 'center' },
});
