import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { useProfile } from '@/lib/profile';

const CONDITION_OPTIONS = [
  'Diabetes',
  'High blood pressure',
  'Heart disease',
  'Asthma / COPD',
  'Pregnancy',
  'Kidney disease',
];

export default function SetupScreen() {
  const { saveProfile } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);

  function toggleCondition(condition: string) {
    setConditions((current) =>
      current.includes(condition)
        ? current.filter((existing) => existing !== condition)
        : [...current, condition],
    );
  }

  const canSave = location.trim().length > 0;

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Patient Setup</Text>

      <Text style={[styles.heading, { color: textColor }]}>Location</Text>
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholderTextColor="#888"
        placeholder="Village / town / region"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={[styles.heading, { color: textColor }]}>Conditions at risk for</Text>
      {CONDITION_OPTIONS.map((condition) => {
        const selected = conditions.includes(condition);
        return (
          <Pressable
            key={condition}
            onPress={() => toggleCondition(condition)}
            style={[styles.option, selected && styles.optionSelected]}>
            <Text style={[styles.optionLabel, { color: textColor }, selected && styles.optionLabelSelected]}>
              {selected ? '✓ ' : ''}
              {condition}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        disabled={!canSave}
        onPress={() => saveProfile({ location: location.trim(), conditions })}
        style={[styles.save, !canSave && styles.saveDisabled]}>
        <Text style={styles.saveLabel}>Save and continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 90, gap: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 10, padding: 14, fontSize: 18 },
  option: { borderWidth: 1, borderColor: '#999', borderRadius: 10, padding: 14 },
  optionSelected: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  optionLabel: { fontSize: 18 },
  optionLabelSelected: { color: 'white', fontWeight: '700' },
  save: { backgroundColor: '#0a7ea4', borderRadius: 10, padding: 16, marginTop: 20 },
  saveDisabled: { opacity: 0.4 },
  saveLabel: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
