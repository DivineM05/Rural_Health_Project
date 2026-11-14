import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import ResetButton from '@/components/ResetButton';
import { useColorScheme } from '@/components/useColorScheme';
import { ProfileProvider, useProfile } from '@/lib/profile';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ProfileProvider>
      <RootLayoutNav />
    </ProfileProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading, profile } = useProfile();

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={profile !== null}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkup-form" />
          <Stack.Screen name="doctor" options={{ headerShown: true, title: 'Doctor' }} />
          <Stack.Screen name="my-data" options={{ headerShown: true, title: 'My Data' }} />
          <Stack.Screen name="emergency" />
        </Stack.Protected>
        <Stack.Protected guard={profile === null}>
          <Stack.Screen name="setup" />
        </Stack.Protected>
        <Stack.Screen name="scan" options={{ headerShown: true, title: 'Scan QR Code' }} />
      </Stack>
      <ResetButton />
    </ThemeProvider>
  );
}
