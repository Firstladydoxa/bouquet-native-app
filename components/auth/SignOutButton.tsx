import { useAuth } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SignOutButton = () => {
  // Use our custom auth hook to access the signOut function
  const { signOut } = useAuth()
  const router = useRouter()
  const colors = useThemeColors()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <TouchableOpacity 
      onPress={handleSignOut}
      style={styles.button}
      activeOpacity={0.8}
    >
      <View style={[styles.buttonContent, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Sign Out</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});