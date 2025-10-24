import { THEMES } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = keyof typeof THEMES;

export interface ThemeContextType {
  currentTheme: ThemeName;
  colors: typeof THEMES[ThemeName];
  setTheme: (theme: ThemeName) => Promise<void>;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('goldNavy');

  const availableThemes: ThemeName[] = Object.keys(THEMES) as ThemeName[];

  // Load saved theme on app start
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme && savedTheme in THEMES) {
        setCurrentTheme(savedTheme as ThemeName);
      } else {
        // If saved theme doesn't exist, fallback to goldNavy
        setCurrentTheme('goldNavy');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
      setCurrentTheme('goldNavy');
    }
  };

  const setTheme = async (theme: ThemeName) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    colors: THEMES[currentTheme],
    setTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};