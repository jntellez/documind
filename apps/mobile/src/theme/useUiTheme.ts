import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';

const uiThemeColors = {
  light: {
    icon: '#27272a',
    iconOnPrimary: '#f5f7ff',
    cursor: '#000000',
    placeholder: '#888888',
    blurTint: 'light' as const,
  },
  dark: {
    icon: '#e4e4e7',
    iconOnPrimary: '#18181b',
    cursor: '#ffffff',
    placeholder: '#a1a1aa',
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
