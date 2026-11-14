import { Camera, GeoJSONSource, Layer, Map as MapView, UserLocation } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PlaceMarker } from '@/components/PlaceMarker';
import {
  boundsAround,
  fetchRoute,
  formatDistance,
  formatDuration,
  loadMapData,
  MAP_STYLE_URL,
  Place,
  Route,
  toLngLat,
  TravelMode,
  Hospital,
} from '@/lib/mapData';
import { useProfile } from '@/lib/profile';
import { useTheme } from '@/lib/theme';

type Origin = 'home' | 'myLocation';

function mapAppUrl(start: Place | null, destination: Place, mode: TravelMode): string {
  const destinationText = `${destination.latitude},${destination.longitude}`;
  if (Platform.OS === 'ios') {
    const startParameter = start ? `&saddr=${start.latitude},${start.longitude}` : '';
    return `http://maps.apple.com/?daddr=${destinationText}${startParameter}&dirflg=${mode === 'driving' ? 'd' : 'w'}`;
  }
  const startParameter = start ? `&origin=${start.latitude},${start.longitude}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationText}${startParameter}&travelmode=${mode}`;
}

export default function DirectionsScreen() {
  const params = useLocalSearchParams<{ hospitalIndex: string; mode: TravelMode }>();
  const mode = params.mode;
  const { profile } = useProfile();
  const theme = useTheme();
  const textColor = theme.text;
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [origin, setOrigin] = useState<Origin>('home');
  const [liveStart, setLiveStart] = useState<Place | null>(null);
  const [liveRoute, setLiveRoute] = useState<Route | null>(null);
  const [isFetchingLiveRoute, setIsFetchingLiveRoute] = useState(false);
  const [liveRouteError, setLiveRouteError] = useState('');

  useEffect(() => {
    loadMapData().then((mapData) => setHospital(mapData?.hospitals[Number(params.hospitalIndex)] ?? null));
  }, [params.hospitalIndex]);

  if (!hospital || !profile) return null;

  async function routeFromMyLocation() {
    setLiveRouteError('');
    setIsFetchingLiveRoute(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) throw new Error('Location permission is needed.');
      const position = await Location.getCurrentPositionAsync();
      const start = { name: 'My location', latitude: position.coords.latitude, longitude: position.coords.longitude };
      const route = await fetchRoute(start, hospital!, mode);
      if (!route) throw new Error('No route found from your location.');
      setLiveStart(start);
      setLiveRoute(route);
      setOrigin('myLocation');
    } catch (error) {
      const message = error instanceof TypeError ? 'Needs internet. Showing route from home.' : (error as Error).message;
      setLiveRouteError(message);
    }
    setIsFetchingLiveRoute(false);
  }

  const isFromMyLocation = origin === 'myLocation' && liveRoute && liveStart;
  const route = isFromMyLocation ? liveRoute : hospital.routes[mode];
  const start = isFromMyLocation ? liveStart : profile.location;
  if (!route) return null;

  const routeLine: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: route.line },
  };

  return (
    <View style={styles.fill}>
      <Stack.Screen options={{ title: mode === 'driving' ? 'Driving' : 'Walking' }} />
      <MapView style={styles.fill} mapStyle={MAP_STYLE_URL}>
        <Camera bounds={boundsAround(route.line, 0.005)} />
        <GeoJSONSource id="route" data={routeLine}>
          <Layer type="line" id="routeLine" style={{ lineColor: '#0a7ea4', lineWidth: 5 }} />
        </GeoJSONSource>
        <PlaceMarker
          id="start"
          lngLat={toLngLat(start)}
          icon={isFromMyLocation ? 'account' : 'home'}
          color="#2e7d32"
        />
        <PlaceMarker id="hospital" lngLat={toLngLat(hospital)} icon="hospital-box" color="#d32f2f" />
        <UserLocation />
      </MapView>
      <ScrollView style={styles.fill} contentContainerStyle={styles.list}>
        <Text style={[styles.hospitalName, { color: textColor }]}>{hospital.name}</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.originButton, origin === 'home' && styles.originSelected]}
            onPress={() => setOrigin('home')}>
            <Text style={styles.buttonLabel}>From home</Text>
          </Pressable>
          <Pressable
            style={[styles.originButton, origin === 'myLocation' && styles.originSelected]}
            disabled={isFetchingLiveRoute}
            onPress={routeFromMyLocation}>
            <Text style={styles.buttonLabel}>From my location</Text>
          </Pressable>
        </View>
        {isFetchingLiveRoute && <ActivityIndicator />}
        {liveRouteError !== '' && <Text style={styles.error}>{liveRouteError}</Text>}
        <Text style={[styles.summary, { color: textColor }]}>
          {formatDistance(route.distanceMeters)}, about {formatDuration(route.durationSeconds)}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.mapAppButton, pressed && styles.pressed]}
          onPress={() => Linking.openURL(mapAppUrl(isFromMyLocation ? null : profile.location, hospital, mode))}>
          <Text style={styles.buttonLabel}>Open in {Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}</Text>
        </Pressable>
        {route.steps.map((step, index) => (
          <View key={index} style={[styles.step, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={[styles.instruction, { color: textColor }]}>
              {index + 1}. {step.instruction}
            </Text>
            {step.distanceMeters > 0 && (
              <Text style={[styles.stepDistance, { color: textColor }]}>{formatDistance(step.distanceMeters)}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: 16, gap: 10 },
  hospitalName: { fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  originButton: { flex: 1, backgroundColor: '#757575', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  originSelected: { backgroundColor: '#0a7ea4' },
  buttonLabel: { color: 'white', fontSize: 18, fontWeight: '700' },
  error: { color: '#d32f2f', fontSize: 18 },
  summary: { fontSize: 20, fontWeight: '700' },
  mapAppButton: { backgroundColor: '#2e7d32', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  pressed: { opacity: 0.7 },
  step: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 8 },
  instruction: { fontSize: 18 },
  stepDistance: { fontSize: 16, opacity: 0.7 },
});
