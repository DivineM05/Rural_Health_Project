import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/lib/profile';

export default function ResetButton() {
  const { resetProfile } = useProfile();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Reset app"
      onPress={resetProfile}
      style={[styles.button, { top: insets.top + 4 }]}>
      <Text style={styles.label}>Reset</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 12,
    zIndex: 100,
    backgroundColor: '#c0392b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  label: { color: 'white', fontWeight: '700' },
});
