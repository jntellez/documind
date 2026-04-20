import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';

const uiThemeColors = {
  light: {
    background: '#e9e9e9',
    surface: '#f2f2f2',
    surfaceMuted: '#f4f4f5',
    border: 'rgba(255, 255, 255, 1)',
    inputBorder: 'rgba(255, 255, 255, 1)',
    icon: '#27272a',
    iconOnPrimary: '#f5f7ff',
    cursor: '#000000',
    blurTint: 'light' as const,
  },
  dark: {
    background: '#18181b',
    surface: '#27272a',
    surfaceMuted: '#3f3f46',
    border: 'rgba(255, 255, 255, 0.2)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    icon: '#e4e4e7',
    iconOnPrimary: '#18181b',
    cursor: '#ffffff',
    blurTint: 'dark' as const,
  },
};

type UiThemeName = keyof typeof uiThemeColors;

export function resolveUiTheme(colorScheme?: string | null) {
  const themeName: UiThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = uiThemeColors[themeName];

  return {
    ...colors,
    isDark: themeName === 'dark',
    colorScheme: themeName,
  };
}

export function useUiTheme() {
  const { colorScheme } = useColorScheme();

  return useMemo(() => resolveUiTheme(colorScheme), [colorScheme]);
}
