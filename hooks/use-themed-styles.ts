import { ThemeColors, THEMES } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

/**
 * Custom hook that creates dynamic styles based on the current theme
 * Usage: const styles = useThemedStyles(createStyles);
 * where createStyles is a function that takes colors and returns a StyleSheet
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: ThemeColors) => T
): T => {
  const { colors } = useTheme();
  
  return useMemo(() => {
    // Ensure colors is defined, fallback to mint theme if needed
    const safeColors = colors || THEMES.mint;
    return createStyles(safeColors);
  }, [colors, createStyles]);
};

/**
 * Hook to get theme colors directly
 * Usage: const colors = useThemeColors();
 */
export const useThemeColors = () => {
  const { colors } = useTheme();
  // Ensure colors is always defined
  return colors || THEMES.mint;
};