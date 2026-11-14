import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { NavigationCard } from '@/components/NavigationCard';
import { nextCheckupDate } from '@/lib/checkupSchedule';
import { useProfile } from '@/lib/profile';
import { colors, useTheme } from '@/lib/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const schedule = profile?.checkupSchedule;
  const nextCheckupText = schedule
    ? `Next checkup ${nextCheckupDate(schedule).toLocaleDateString()}`
    : 'Answer health questions';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.greeting, { color: theme.text }]}>How are you feeling today?</Text>
      <NavigationCard
        title="I'm having symptoms"
        subtitle="Check symptoms or get emergency help"
        icon="alert-circle"
        color={colors.emergency}
        onPress={() => router.navigate('/symptoms')}
      />
      <NavigationCard
        title="Checkup"
        subtitle={nextCheckupText}
        icon="stethoscope"
        color={colors.accent}
        onPress={() => router.navigate('/checkup')}
      />
      <NavigationCard
        title="Map"
        subtitle="Nearest hospitals and directions"
        icon="map-marker-radius"
        color={colors.success}
        onPress={() => router.navigate('/map')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  greeting: { fontSize: 28, fontWeight: '700', marginVertical: 8 },
});
