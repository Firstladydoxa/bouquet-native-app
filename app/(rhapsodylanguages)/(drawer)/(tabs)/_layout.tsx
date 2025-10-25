import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarIcon } from '@/components/navigation/tabBarIcon';
import { useSubscription } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';

export default function RhapsodyLanguagesTabLayout() {
  const colors = useThemeColors();
  const { hasSubscription } = useSubscription();
  const insets = useSafeAreaInsets();

  return (
   
     <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
          height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          color: colors.primary,
          fontWeight: 'bold',
          fontSize: 14,
          paddingBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarInactiveTintColor: colors.textLight,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'home-outline' : 'home'} 
              color={focused ? colors.secondary : colors.secondary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'book-outline' : 'book'} 
              color={focused ? colors.secondary : colors.secondary}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions/index"
        options={{
          href: hasSubscription ? null : undefined,
          title: hasSubscription ? 'Plans' : 'Subscriptions',
          tabBarLabel: hasSubscription ? 'Plans' : 'Subscriptions',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'card-outline' : 'card'}
              color={focused ? colors.secondary : colors.secondary}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="subscriptions/manage"
        options={{
          title: 'Manage',
          tabBarLabel: 'Manage',
          href: hasSubscription ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'eye-outline' : 'eye'}
              color={focused ? colors.secondary : colors.secondary}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="subscriptions/[id]"
        options={{
          href: null, // This hides the route from tabs
        }}
      />
      
      <Tabs.Screen
        name="subscriptions/buy"
        options={{
          href: null, // This hides the route from tabs
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'settings-outline' : 'settings'}
              color={focused ? colors.secondary : colors.secondary}
            />
          ),
        }}
      />
      
    </Tabs>
  );
}
