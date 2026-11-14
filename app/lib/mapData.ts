import { LngLat, LngLatBounds, OfflineManager } from '@maplibre/maplibre-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const MAP_DATA_KEY = 'mapData';
const HOSPITAL_SEARCH_RADIUS_METERS = 100000;
const REQUEST_HEADERS = { 'User-Agent': 'RuralHealthApp' };

export type Place = { name: string; latitude: number; longitude: number };
export type TravelMode = 'driving' | 'walking';
export type RouteStep = { instruction: string; distanceMeters: number };
export type Route = { distanceMeters: number; durationSeconds: number; line: LngLat[]; steps: RouteStep[] };
export type Hospital = Place & { routes: Record<TravelMode, Route | null> };
export type MapData = { hospitals: Hospital[]; bounds: LngLatBounds; downloadedAt: string };

type OsrmStep = {
  name: string;
  distance: number;
  maneuver: { type: string; modifier?: string; exit?: number };
};

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
};

export function toLngLat(place: Place): LngLat {
  return [place.longitude, place.latitude];
}

export function boundsAround(points: LngLat[], padding: number): LngLatBounds {
  const longitudes = points.map((point) => point[0]);
  const latitudes = points.map((point) => point[1]);
  return [
    Math.min(...longitudes) - padding,
    Math.min(...latitudes) - padding,
    Math.max(...longitudes) + padding,
    Math.max(...latitudes) + padding,
  ];
}

export function distanceMetersBetween(from: Place, to: Place): number {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeChange = toRadians(to.latitude - from.latitude);
  const longitudeChange = toRadians(to.longitude - from.longitude);
  const haversine =
    Math.sin(latitudeChange / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeChange / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function formatDistance(meters: number): string {
  const kilometers = meters / 1000;
  const miles = meters / 1609.34;
  return `${kilometers.toFixed(1)} km (${miles.toFixed(1)} mi)`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  return `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} min`;
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    const shortUrl = url.split('?')[0];
    throw new Error(`Request failed (${response.status}) ${shortUrl}\n${body.slice(0, 300)}`);
  }
  return response.json();
}

async function fetchNearestHospitals(home: Place, count: number): Promise<Place[]> {
  const query = `[out:json][timeout:25];nwr["amenity"="hospital"](around:${HOSPITAL_SEARCH_RADIUS_METERS},${home.latitude},${home.longitude});out center;`;
  const result = await fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { ...REQUEST_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  const hospitals: Place[] = result.elements.map((element: OverpassElement) => ({
    name: element.tags?.name ?? 'Hospital (no name)',
    latitude: element.lat ?? element.center!.lat,
    longitude: element.lon ?? element.center!.lon,
  }));
  hospitals.sort((first, second) => distanceMetersBetween(home, first) - distanceMetersBetween(home, second));
  return hospitals.slice(0, count);
}

function describeStep(step: OsrmStep): string {
  const road = step.name || 'the road';
  const { type, modifier, exit } = step.maneuver;
  if (type === 'depart') return `Start on ${road}`;
  if (type === 'arrive') return 'Arrive at the hospital';
  if (type === 'roundabout' || type === 'rotary') return `At the roundabout, take exit ${exit ?? 1} onto ${road}`;
  if (modifier === 'uturn') return `Make a U-turn onto ${road}`;
  if (!modifier || modifier === 'straight') return `Continue onto ${road}`;
  return `Turn ${modifier} onto ${road}`;
}

export async function fetchRoute(from: Place, to: Place, mode: TravelMode): Promise<Route | null> {
  const profile = mode === 'driving' ? 'routed-car' : 'routed-foot';
  const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `https://routing.openstreetmap.de/${profile}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;
  const result = await fetchJson(url, { headers: REQUEST_HEADERS });
  if (result.code !== 'Ok' || result.routes.length === 0) return null;
  const route = result.routes[0];
  const steps: OsrmStep[] = route.legs[0].steps;
  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    line: route.geometry.coordinates,
    steps: steps.map((step) => ({ instruction: describeStep(step), distanceMeters: step.distance })),
  };
}

type PackArea = { bounds: LngLatBounds; minZoom: number; maxZoom: number };

function downloadOfflinePack(area: PackArea, onPercentage: (percentage: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    OfflineManager.createPack(
      { mapStyle: MAP_STYLE_URL, ...area },
      (_pack, status) => {
        onPercentage(status.percentage);
        if (status.state === 'complete') resolve();
      },
      (_pack, error) => reject(new Error(error.message)),
    ).catch(reject);
  });
}

async function deleteOfflinePacks() {
  const packs = await OfflineManager.getPacks();
  for (const pack of packs) await OfflineManager.deletePack(pack.id);
}

export async function downloadMapData(home: Place, onProgress: (message: string) => void): Promise<MapData> {
  onProgress('Finding nearby hospitals...');
  const places = await fetchNearestHospitals(home, 3);

  const hospitals: Hospital[] = [];
  for (const [index, place] of places.entries()) {
    onProgress(`Getting directions to hospital ${index + 1} of ${places.length}...`);
    const driving = await fetchRoute(home, place, 'driving');
    const walking = await fetchRoute(home, place, 'walking');
    hospitals.push({ ...place, routes: { driving, walking } });
  }

  const routePoints = hospitals.flatMap((hospital) => [
    ...(hospital.routes.driving?.line ?? []),
    ...(hospital.routes.walking?.line ?? []),
  ]);
  const bounds = boundsAround([toLngLat(home), ...places.map(toLngLat), ...routePoints], 0.05);
  const detailAreas: PackArea[] = [home, ...places].map((place) => ({
    bounds: boundsAround([toLngLat(place)], 0.03),
    minZoom: 13,
    maxZoom: 14,
  }));
  const areas: PackArea[] = [{ bounds, minZoom: 6, maxZoom: 12 }, ...detailAreas];

  await deleteOfflinePacks();
  for (const [index, area] of areas.entries()) {
    await downloadOfflinePack(area, (percentage) =>
      onProgress(`Downloading map part ${index + 1} of ${areas.length}: ${Math.round(percentage)}%`),
    );
  }

  const mapData: MapData = { hospitals, bounds, downloadedAt: new Date().toISOString() };
  await AsyncStorage.setItem(MAP_DATA_KEY, JSON.stringify(mapData));
  return mapData;
}

export async function loadMapData(): Promise<MapData | null> {
  const stored = await AsyncStorage.getItem(MAP_DATA_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export async function deleteMapData() {
  await AsyncStorage.removeItem(MAP_DATA_KEY);
  await deleteOfflinePacks();
}
