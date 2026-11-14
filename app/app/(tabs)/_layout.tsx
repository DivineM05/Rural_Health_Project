import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/lib/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabs: { name: string; title: string; tabLabel: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', tabLabel: 'Home', icon: 'home' },
  { name: 'symptoms', title: "I'm having symptoms", tabLabel: 'Symptoms', icon: 'alert-circle' },
  { name: 'checkup', title: 'Checkup', tabLabel: 'Checkup', icon: 'stethoscope' },
  { name: 'map', title: 'Map', tabLabel: 'Map', icon: 'map-marker-radius' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        headerTitleStyle: { fontSize: 20, fontWeight: '700' },
      }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarLabel: tab.tabLabel,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name={tab.icon} size={30} color={String(color)} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
