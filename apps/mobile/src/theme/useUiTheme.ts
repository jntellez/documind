import { useMemo } from 'react';
import { useColorScheme } from 'nativewind';

const uiThemeColors = {
  light: {
    foreground: '#171717', // foreground
    mutedForeground: '#71717b', // muted-foreground
    muted: '#dedede', // muted
    primary: '#2b7fff',
    primaryForeground: '#eff6ff',
    cursor: '#000000',
    placeholder: '#888888',
    blurTint: 'light' as const,
  },
  dark: {
    foreground: '#fafafa', // dark-foreground
    mutedForeground: '#9f9fa9', // dark-muted-foreground
    muted: '#3a3a3e', // dark-muted
    primary: '#51a2ff',
    primaryForeground: '#171717',
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
