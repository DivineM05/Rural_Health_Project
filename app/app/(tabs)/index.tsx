import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const destinations: { title: string; href: Href; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { title: "I'm having symptoms", href: '/symptoms', icon: 'exclamation-thick' },
  { title: 'Checkup', href: '/checkup', icon: 'stethoscope' },
  { title: 'Map', href: '/map', icon: 'map' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {destinations.map((destination) => (
        <Pressable
          key={destination.title}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => router.navigate(destination.href)}>
          <MaterialCommunityIcons name={destination.icon} size={48} color="white" />
          <Text style={styles.label}>{destination.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  button: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.7 },
  label: { color: 'white', fontSize: 28, fontWeight: '700' },
});
