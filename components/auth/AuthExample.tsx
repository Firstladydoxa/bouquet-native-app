import { useAuthActions, useAuthContext, useAuthUser } from '@/contexts';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

/**
 * Example component demonstrating how to use the Auth Context
 * This can be used as a reference for implementing authentication in other components
 */
export const AuthExampleComponent: React.FC = () => {
  // Method 1: Use the main auth context hook
  const { user, isLoaded, isSignedIn } = useAuthContext();
  
  // Method 2: Use specific helper hooks
  const { user: authUser } = useAuthUser();
  const { signOut, updateUser } = useAuthActions();

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      await updateUser({
        firstname: 'Updated',
        lastname: 'Name'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Please Sign In
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center">
          You need to be signed in to access this feature.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome, {user?.firstname || 'User'}!
      </Text>
      
      {/* User Information */}
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          User Information
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-1">
          Email: {user?.email}
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-1">
          Name: {user?.firstname} {user?.lastname}
        </Text>
        {user?.username && (
          <Text className="text-gray-700 dark:text-gray-300 mb-1">
            Username: {user.username}
          </Text>
        )}
        {user?.subscription && (
          <Text className="text-green-600 dark:text-green-400 mb-1">
            Subscription: {user.subscription.status} ({user.subscription.category})
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={handleUpdateProfile}
          className="bg-blue-600 rounded-lg py-3 px-4"
        >
          <Text className="text-white text-center font-semibold">
            Update Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-600 rounded-lg py-3 px-4"
        >
          <Text className="text-white text-center font-semibold">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};