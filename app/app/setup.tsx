import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme';


export default function SetupScreen() {
  const theme = useTheme();
  const textColor = theme.text;
  const backgroundColor = theme.page;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Patient Setup</Text>
      <Text style={[styles.instructions, { color: textColor }]}>
        Scan the QR code from the setup web app to import your information.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => router.push('/scan')}>
        <Text style={styles.label}>Scan QR code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  title: { fontSize: 28, fontWeight: '800' },
  instructions: { fontSize: 18, textAlign: 'center' },
  button: { backgroundColor: '#0a7ea4', borderRadius: 24, paddingVertical: 32, paddingHorizontal: 48 },
  pressed: { opacity: 0.7 },
  label: { color: 'white', fontSize: 28, fontWeight: '700' },
});
