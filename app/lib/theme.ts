import { DarkTheme, DefaultTheme } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';

export const colors = {
  accent: '#0a7ea4',
  emergency: '#d32f2f',
  warning: '#ef6c00',
  success: '#2e7d32',
  neutral: '#757575',
};

const lightTheme = {
  text: '#1b2329',
  muted: '#5f6b73',
  page: '#f3f6f8',
  card: '#ffffff',
  border: '#d9e1e6',
};

const darkTheme = {
  text: '#e8eef2',
  muted: '#9aa7b0',
  page: '#12171b',
  card: '#1c2329',
  border: '#313b43',
};

export type Theme = typeof lightTheme;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

export function navigationThemeFor(isDark: boolean) {
  const base = isDark ? DarkTheme : DefaultTheme;
  const theme = isDark ? darkTheme : lightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: theme.page,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };
}
