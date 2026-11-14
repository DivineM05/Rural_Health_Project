import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => router.push('/scan')}>
        <Text style={styles.label}>Scan QR code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: '#0a7ea4', borderRadius: 24, paddingVertical: 32, paddingHorizontal: 48 },
  pressed: { opacity: 0.7 },
  label: { color: 'white', fontSize: 28, fontWeight: '700' },
});
