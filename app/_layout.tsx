import { BerkshireSwash_400Regular, useFonts } from '@expo-google-fonts/berkshire-swash';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppTour } from '@/components/ui/AppTour';
import { ThemeColorWidget } from '@/components/ui/ThemeColorWidget';
import TokenRefreshWidget from '@/components/ui/TokenRefreshWidget';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

//export const unstable_settings = {anchor: '(rhapsodylanguages)',};
import { AuthProvider } from '@/contexts';
import "@/global.css";
import { StripeProvider } from '@stripe/stripe-react-native';

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    BerkshireSwash_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <View style={{ flex: 1 }}>
                <Slot />
                <StatusBar style="auto" />
                {/* Global Theme Widget - Right Center */}
                <View style={styles.globalThemeWidget}>
                  <ThemeColorWidget size="medium" showText={false} />
                </View>
                {/* App Tour - First time user guide */}
                <AppTour />
                {/* Token Refresh Widget - Session management */}
                <TokenRefreshWidget />
              </View>
            </NavigationThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  globalThemeWidget: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -22 }], // Half of medium widget height (44/2)
    zIndex: 9999,
    elevation: 9999,
  },
});
