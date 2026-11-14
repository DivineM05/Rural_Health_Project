import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PatientProfile, useProfile } from '@/lib/profile';

function parseProfile(qrText: string): PatientProfile | null {
  try {
    const data = JSON.parse(qrText);
    const isValid = typeof data.location === 'string' && Array.isArray(data.conditions);
    return isValid
      ? { location: data.location, conditions: data.conditions, checkupSchedule: data.checkupSchedule }
      : null;
  } catch {
    return null;
  }
}

export default function ScanScreen() {
  const { saveProfile } = useProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const [errorMessage, setErrorMessage] = useState('');
  const hasScanned = useRef(false);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is needed to scan the QR code.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.label}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  async function handleScan(qrText: string) {
    if (hasScanned.current) return;
    const profile = parseProfile(qrText);
    if (!profile) {
      setErrorMessage('Not a valid patient QR code.');
      return;
    }
    hasScanned.current = true;
    await saveProfile(profile);
    router.replace('/');
  }

  return (
    <View style={styles.fill}>
      <CameraView
        style={styles.fill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => handleScan(data)}
      />
      {errorMessage !== '' && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  message: { fontSize: 18, textAlign: 'center' },
  button: { backgroundColor: '#0a7ea4', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32 },
  label: { color: 'white', fontSize: 20, fontWeight: '700' },
  error: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#c0392b',
    color: 'white',
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
  },
});
