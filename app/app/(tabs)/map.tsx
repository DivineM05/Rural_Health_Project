import { Camera, Map as MapView, UserLocation } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PlaceMarker } from '@/components/PlaceMarker';
import {
  distanceMetersBetween,
  formatDistance,
  loadMapData,
  MAP_STYLE_URL,
  MapData,
  toLngLat,
  TravelMode,
} from '@/lib/mapData';
import { useProfile } from '@/lib/profile';
import { useTheme } from '@/lib/theme';

export default function Screen() {
  const { profile } = useProfile();
  const theme = useTheme();
  const textColor = theme.text;
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canShowUserLocation, setCanShowUserLocation] = useState(false);

  useEffect(() => {
    loadMapData().then((loaded) => {
      setMapData(loaded);
      setIsLoading(false);
    });
    Location.requestForegroundPermissionsAsync().then(({ granted }) => setCanShowUserLocation(granted));
  }, []);

  if (isLoading || !profile) return null;

  if (!mapData) {
    return (
      <View style={styles.center}>
        <Text style={[styles.message, { color: textColor }]}>
          The map is not downloaded. Ask your doctor to scan your QR code again while connected to the internet.
        </Text>
      </View>
    );
  }

  function openDirections(hospitalIndex: number, mode: TravelMode) {
    router.push({ pathname: '/directions', params: { hospitalIndex: String(hospitalIndex), mode } });
  }

  return (
    <View style={styles.fill}>
      <MapView style={styles.fill} mapStyle={MAP_STYLE_URL}>
        <Camera initialViewState={{ bounds: mapData.bounds }} />
        <PlaceMarker id="home" lngLat={toLngLat(profile.location)} icon="home" color="#2e7d32" />
        {mapData.hospitals.map((hospital, index) => (
          <PlaceMarker
            key={index}
            id={`hospital-${index}`}
            lngLat={toLngLat(hospital)}
            icon="hospital-box"
            color="#d32f2f"
          />
        ))}
        {canShowUserLocation && <UserLocation />}
      </MapView>
      <ScrollView style={styles.fill} contentContainerStyle={styles.list}>
        {mapData.hospitals.length === 0 && (
          <Text style={[styles.message, { color: textColor }]}>No hospitals found within 100 km.</Text>
        )}
        {mapData.hospitals.map((hospital, index) => (
          <View key={index} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={[styles.hospitalName, { color: textColor }]}>{hospital.name}</Text>
            <Text style={[styles.message, { color: textColor }]}>
              {formatDistance(distanceMetersBetween(profile.location, hospital))} from home
            </Text>
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [styles.button, !hospital.routes.driving && styles.disabled, pressed && styles.pressed]}
                disabled={!hospital.routes.driving}
                onPress={() => openDirections(index, 'driving')}>
                <Text style={styles.buttonLabel}>Driving</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.button, !hospital.routes.walking && styles.disabled, pressed && styles.pressed]}
                disabled={!hospital.routes.walking}
                onPress={() => openDirections(index, 'walking')}>
                <Text style={styles.buttonLabel}>Walking</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 18 },
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  hospitalName: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, backgroundColor: '#0a7ea4', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  buttonLabel: { color: 'white', fontSize: 18, fontWeight: '700' },
});
