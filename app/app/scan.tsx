import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { downloadMapData } from '@/lib/mapData';
import { PatientProfile, useProfile } from '@/lib/profile';

function parseProfile(qrText: string): PatientProfile | null {
  try {
    const data = JSON.parse(qrText);
    const location = data.location;
    const isValid =
      typeof location?.name === 'string' &&
      typeof location?.latitude === 'number' &&
      typeof location?.longitude === 'number' &&
      Array.isArray(data.conditions);
    return isValid ? { location, conditions: data.conditions, checkupSchedule: data.checkupSchedule } : null;
  } catch {
    return null;
  }
}

export default function ScanScreen() {
  const { saveProfile } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const [permission, requestPermission] = useCameraPermissions();
  const [errorMessage, setErrorMessage] = useState('');
  const [scannedProfile, setScannedProfile] = useState<PatientProfile | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const hasScanned = useRef(false);
  const progressMessageRef = useRef('');

  async function downloadAndSave(profile: PatientProfile) {
    setDownloadError('');
    try {
      await downloadMapData(profile.location, (message) => {
        progressMessageRef.current = message;
        setProgressMessage(message);
      });
    } catch (error) {
      setDownloadError(`Could not download the map.\nStep: ${progressMessageRef.current}\n${(error as Error).message}`);
      return;
    }
    await saveProfile(profile);
    router.replace('/');
  }

  function handleScan(qrText: string) {
    if (hasScanned.current) return;
    const profile = parseProfile(qrText);
    if (!profile) {
      setErrorMessage('Not a valid patient QR code.');
      return;
    }
    hasScanned.current = true;
    setScannedProfile(profile);
    downloadAndSave(profile);
  }

  if (scannedProfile) {
    return (
      <View style={styles.center}>
        {downloadError === '' ? (
          <>
            <ActivityIndicator size="large" />
            <Text style={[styles.message, { color: textColor }]}>{progressMessage}</Text>
            <Text style={[styles.message, { color: textColor }]}>Stay connected to the internet.</Text>
          </>
        ) : (
          <>
            <Text style={[styles.message, { color: textColor }]}>{downloadError}</Text>
            <Pressable style={styles.button} onPress={() => downloadAndSave(scannedProfile)}>
              <Text style={styles.label}>Try again</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, { color: textColor }]}>Camera access is needed to scan the QR code.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.label}>Allow camera</Text>
        </Pressable>
      </View>
    );
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
