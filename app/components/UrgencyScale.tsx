import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { URGENCY_LABELS, UrgencyLevel } from '@/lib/symptomChecker';

const LEVELS: UrgencyLevel[] = [1, 2, 3, 4, 5];
const LEVEL_COLORS: Record<UrgencyLevel, string> = {
  1: '#2e7d32',
  2: '#9e9d24',
  3: '#f9a825',
  4: '#ef6c00',
  5: '#d32f2f',
};

export function UrgencyScale({ level, textColor }: { level: UrgencyLevel; textColor: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.markerRow}>
        {LEVELS.map((each) => (
          <View key={each} style={styles.segmentSlot}>
            {each === level && <MaterialCommunityIcons name="menu-down" size={40} color={textColor} />}
          </View>
        ))}
      </View>
      <View style={styles.bar}>
        {LEVELS.map((each) => (
          <View
            key={each}
            style={[styles.segment, { backgroundColor: LEVEL_COLORS[each] }, each !== level && styles.inactive]}
          />
        ))}
      </View>
      <View style={styles.endLabels}>
        <Text style={[styles.endLabel, { color: textColor }]}>Home care</Text>
        <Text style={[styles.endLabel, { color: textColor }]}>Hospital now</Text>
      </View>
      <Text style={[styles.levelLabel, { color: LEVEL_COLORS[level] }]}>{URGENCY_LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  markerRow: { flexDirection: 'row', height: 40 },
  segmentSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { flexDirection: 'row', height: 24, borderRadius: 12, overflow: 'hidden' },
  segment: { flex: 1 },
  inactive: { opacity: 0.35 },
  endLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  endLabel: { fontSize: 14 },
  levelLabel: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});
