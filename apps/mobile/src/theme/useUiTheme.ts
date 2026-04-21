import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';

const uiThemeColors = {
  light: {
    background: '#e9e9e9',
    backgroundMuted: '#f4f4f5',
    surface: '#f2f2f2',
    surfaceMuted: '#f4f4f5',
    surfaceElevated: '#ffffff',
    border: 'rgba(255, 255, 255, 1)',
    borderMuted: 'rgba(63, 63, 70, 0.12)',
    inputBorder: 'rgba(255, 255, 255, 1)',
    icon: '#27272a',
    iconMuted: '#71717a',
    iconSubtle: '#a1a1aa',
    primary: '#009bfb',
    primaryForeground: '#f5f7ff',
    success: '#16a34a',
    successForeground: '#f0fdf4',
    warning: '#f59e0b',
    warningForeground: '#422006',
    destructive: '#ef4444',
    destructiveForeground: '#fef2f2',
    overlay: 'rgba(0, 0, 0, 0.5)',
    iconOnPrimary: '#f5f7ff',
    cursor: '#000000',
    blurTint: 'light' as const,
  },
  dark: {
    background: '#18181b',
    backgroundMuted: '#27272a',
    surface: '#27272a',
    surfaceMuted: '#3f3f46',
    surfaceElevated: '#3f3f46',
    border: 'rgba(255, 255, 255, 0.2)',
    borderMuted: 'rgba(255, 255, 255, 0.12)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    icon: '#e4e4e7',
    iconMuted: '#a1a1aa',
    iconSubtle: '#71717a',
    primary: '#30b0ff',
    primaryForeground: '#18181b',
    success: '#4ade80',
    successForeground: '#052e16',
    warning: '#fbbf24',
    warningForeground: '#451a03',
    destructive: '#f87171',
    destructiveForeground: '#450a0a',
    overlay: 'rgba(0, 0, 0, 0.65)',
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
