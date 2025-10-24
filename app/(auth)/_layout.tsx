import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}