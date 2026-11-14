import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LngLat, Marker } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';

type Props = {
  id: string;
  lngLat: LngLat;
  icon: 'home' | 'hospital-box' | 'account';
  color: string;
};

export function PlaceMarker({ id, lngLat, icon, color }: Props) {
  return (
    <Marker id={id} lngLat={lngLat}>
      <View style={[styles.circle, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={22} color="white" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: 18, padding: 6, borderWidth: 2, borderColor: 'white' },
});
