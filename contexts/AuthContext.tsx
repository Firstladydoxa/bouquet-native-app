import { AuthAPI } from '@/services/authApi';
import type {
  AuthContextType,
  SignInData,
  SignUpData,
  User
} from '@/types';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Mock API URLs - replace with your actual backend
const API_BASE_URL = 'https://mediathek.tniglobal.org/api'; // Replace with your backend URL

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const isSignedIn = !!user && !!token;

  // Initialize auth state from secure storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear any corrupted data
      await clearAuthData();
    } finally {
      setIsLoaded(true);
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const saveAuthData = async (authToken: string, userData: User) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, authToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
      ]);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const signIn = async (data: SignInData): Promise<{ status: 'complete' | 'error'; error?: string }> => {
    try {
      console.log('Attempting to sign in with:', { email: data.identifier });
      
      // Use AuthAPI service
      const result = await AuthAPI.signIn({
        email: data.identifier,
        password: data.password,
      });

      console.log('Sign in successful, saving auth data...');
      
      // Use the SignInResponse structure
      const signInData = result.data;
      await saveAuthData(signInData.token, signInData.user);
      return { status: 'complete' };

    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ status: 'complete' | 'needs_verification' | 'error'; error?: string }> => {
    try {
      // Use AuthAPI service
      const result = await AuthAPI.register({
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.username || data.email.split('@')[0],
        email: data.email,
        password: data.password,
        country: data.country || 'Unknown', // You may want to add country field to SignUpData type
      });

      console.log('Sign up successful');
      
      // Check if email verification is required
      if (result.data.verification_sent) {
        // Don't save auth data yet - user needs to verify email first
        return { status: 'needs_verification' };
      } else {
        // Auto sign in after successful registration
        await saveAuthData(result.data.token, result.data.user);
        return { status: 'complete' };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Sign up failed. Please try again.' 
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Call backend to invalidate token if available
      if (token) {
        await AuthAPI.signOut(token);
      }

      await clearAuthData();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local data even if server call fails
      await clearAuthData();
    }
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    try {
      // In a real app, make an API call to update user data:
      // Make API call to your backend

      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Read the response body once and handle both success and error cases
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse sign in response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }


      if (response.ok) {
       
        if (result.success && result.data?.token_data?.access_token && result.data?.user) {
        
          await saveAuthData(result.data.token_data.access_token, result.data.user);
        
        } else {
          console.error('Sign in failed - invalid response structure:', result);
          throw new Error(result.message || result.error || 'Invalid response from server');
        }

      } else {
        throw new Error(result.message || 'Failed to update user');
      }
      
      
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    // In a real app, you might want to refresh the token if it's expired
    return token;
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) {
      console.log('No token available for user refresh');
      return;
    }

    try {
      console.log('Refreshing user data from backend...');
      
      // Import RhapsodyLanguagesAPI dynamically to avoid circular dependencies
      const { RhapsodyLanguagesAPI } = await import('@/services/rhapsodylanguagesApi');
      
      const freshUserData = await RhapsodyLanguagesAPI.fetchUserDetails(token);
      
      if (freshUserData) {
        console.log('User data refreshed successfully:', freshUserData);
        await saveAuthData(token, freshUserData);
      } else {
        console.log('No user data returned from API');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't throw error to avoid breaking the app
      // The user can continue with cached data
    }
  };

  const value: AuthContextType = {
    user,
    isLoaded,
    isSignedIn,
    token,
    signIn,
    signUp,
    signOut,
    updateUser,
    getToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to mimic Clerk's useUser hook
export function useUser() {
  const { user, isLoaded, updateUser } = useAuth();
  
  return {
    user: user ? {
      ...user,
      update: updateUser,
      // Add any other user methods you need
      unsafeMetadata: user.metadata || {},
    } : null,
    isLoaded,
  };
}