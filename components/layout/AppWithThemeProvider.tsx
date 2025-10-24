// This file shows how to wrap your app with the ThemeProvider
// You would typically put this in your main _layout.tsx or App.tsx file

import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
// Import your existing app components
// import { YourExistingLayout } from './existing-layout';

interface AppWithThemeProviderProps {
  children: React.ReactNode;
}

export const AppWithThemeProvider: React.FC<AppWithThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

// Example usage in your main layout:
/*
export default function RootLayout() {
  return (
    <AppWithThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AppWithThemeProvider>
  );
}
*/