import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchSymptoms, symptomLabel } from '@/lib/symptomChecker';
import { useTheme } from '@/lib/theme';

export default function Screen() {
  const theme = useTheme();
  const textColor = theme.text;
  const [query, setQuery] = useState('');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const suggestions = query.trim() === '' ? [] : searchSymptoms(query, selectedSymptomIds);

  function addSymptom(symptomId: string) {
    setSelectedSymptomIds([...selectedSymptomIds, symptomId]);
    setQuery('');
  }

  function removeSymptom(symptomId: string) {
    setSelectedSymptomIds(selectedSymptomIds.filter((each) => each !== symptomId));
  }

  function startQuestions() {
    router.push({ pathname: '/symptom-check', params: { symptoms: selectedSymptomIds.join(',') } });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      {!isSearching && (
        <Pressable
          style={({ pressed }) => [styles.emergencyButton, pressed && styles.pressed]}
          onPress={() => router.push('/emergency')}>
          <Text style={styles.emergencyLabel}>I think I'm having an emergency</Text>
        </Pressable>
      )}

      <Text style={[styles.heading, { color: textColor }]}>What symptoms do you have?</Text>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: theme.border, backgroundColor: theme.card }]}
        placeholder="Search symptoms, e.g. headache"
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onFocus={() => setIsSearching(true)}
        onBlur={() => setIsSearching(false)}
        autoCorrect={false}
        returnKeyType="done"
        clearButtonMode="while-editing"
      />
      {suggestions.map((symptom) => (
        <Pressable
          key={symptom.id}
          style={({ pressed }) => [styles.suggestion, { borderColor: theme.border, backgroundColor: theme.card }, pressed && styles.pressed]}
          onPress={() => addSymptom(symptom.id)}>
          <MaterialCommunityIcons name="plus" size={24} color={textColor} />
          <Text style={[styles.symptomText, { color: textColor }]}>{symptom.label}</Text>
        </Pressable>
      ))}
      {query.trim() !== '' && suggestions.length === 0 && (
        <Text style={[styles.hint, { color: textColor }]}>No matching symptoms</Text>
      )}

      <Text style={[styles.heading, { color: textColor }]}>My symptoms</Text>
      {selectedSymptomIds.length === 0 && <Text style={[styles.hint, { color: textColor }]}>None added yet</Text>}
      {selectedSymptomIds.map((symptomId) => (
        <View key={symptomId} style={styles.selectedSymptom}>
          <Text style={[styles.symptomText, styles.selectedText]}>{symptomLabel(symptomId)}</Text>
          <Pressable onPress={() => removeSymptom(symptomId)} accessibilityLabel={`Remove ${symptomLabel(symptomId)}`}>
            <MaterialCommunityIcons name="close" size={26} color="white" />
          </Pressable>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.startButton,
          selectedSymptomIds.length === 0 && styles.disabled,
          pressed && styles.pressed,
        ]}
        disabled={selectedSymptomIds.length === 0}
        onPress={startQuestions}>
        <Text style={styles.buttonLabel}>Start questions</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  emergencyButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyLabel: { color: 'white', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  heading: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 20 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  symptomText: { flex: 1, fontSize: 20 },
  hint: { fontSize: 18, opacity: 0.7 },
  selectedSymptom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef6c00',
    borderRadius: 12,
    padding: 12,
  },
  selectedText: { color: 'white', fontWeight: '700' },
  startButton: { backgroundColor: '#0a7ea4', borderRadius: 20, paddingVertical: 20, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  buttonLabel: { color: 'white', fontSize: 22, fontWeight: '700' },
});
