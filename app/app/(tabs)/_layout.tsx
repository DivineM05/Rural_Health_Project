import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'symptoms', title: "I'm having symptoms", icon: 'exclamation-thick' },
  { name: 'checkup', title: 'Checkup', icon: 'stethoscope' },
  { name: 'map', title: 'Map', icon: 'map' },
];

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, tabBarActiveTintColor: '#0a7ea4' }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name={tab.icon} size={32} color={String(color)} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
