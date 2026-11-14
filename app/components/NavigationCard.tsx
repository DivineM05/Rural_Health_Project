import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  onPress: () => void;
};

export function NavigationCard({ title, subtitle, icon, color, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <View style={[styles.iconTile, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={36} color="white" />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={32} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  iconTile: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  pressed: { opacity: 0.7 },
});
