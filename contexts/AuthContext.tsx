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
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);

  const isSignedIn = !!user && !!token;

  // Initialize auth state from secure storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [storedToken, storedUser, storedExpiry] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
        SecureStore.getItemAsync(TOKEN_EXPIRY_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Parse and set token expiry if available
        if (storedExpiry) {
          setTokenExpiresAt(new Date(storedExpiry));
        }
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
        SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
      ]);
      setToken(null);
      setUser(null);
      setTokenExpiresAt(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const saveAuthData = async (authToken: string, userData: User, expiresIn?: number) => {
    try {
      // Calculate token expiry time
      // Default to 3600 seconds (1 hour) if not provided
      const expirySeconds = expiresIn || 3600;
      const expiryDate = new Date(Date.now() + expirySeconds * 1000);
      
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, authToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
        SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryDate.toISOString()),
      ]);
      
      setToken(authToken);
      setUser(userData);
      setTokenExpiresAt(expiryDate);
      
      console.log('[AuthContext] Token will expire at:', expiryDate.toISOString());
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const signIn = async (data: SignInData): Promise<{ status: 'complete' | 'error'; error?: string }> => {
    try {
      console.log('Attempting to sign in with:', { email: data.email });
      
      // Use AuthAPI service
      const result = await AuthAPI.signIn({
        email: data.email,
        password: data.password,
      });

      console.log('Sign in successful, saving auth data...');
      
      // Use the SignInResponse structure and capture expires_in
      const signInData = result.data;
      await saveAuthData(signInData.token, signInData.user, signInData.expires_in);
      return { status: 'complete' };

    } catch (error: any) {
      console.error('[AuthContext] Sign in error:', error);
      
      // Check if this is an email verification error according to the Laravel guide
      if (error.needsVerification) {
        // The AuthAPI already auto-resends the verification code
        // We just need to return the appropriate status so the UI can redirect to verify-email
        return { 
          status: 'error', 
          error: 'Please verify your email before logging in. A new verification code has been sent to your email.',
        };
      }
      
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ status: 'complete' | 'needs_verification' | 'error'; error?: string }> => {
    try {
      console.log('[AuthContext] Starting registration process...');
      
      // Use AuthAPI service
      const result = await AuthAPI.register({
        firstname: data.firstname || data.username || data.email.split('@')[0],
        lastname: data.lastname || '',
        email: data.email,
        password: data.password,
        country: data.country || 'Unknown',
      });

      console.log('[AuthContext] Registration API response:', {
        verification_required: result.data.verification_required,
        message: result.data.message,
      });
      
      // Check if email verification is required according to Laravel guide
      if (result.data.verification_required) {
        // DO NOT save auth data until email is verified
        // Just return needs_verification status
        console.log('[AuthContext] Email verification required - NOT signing user in yet');
        console.log('[AuthContext] User should be redirected to verify-email page');
        return { status: 'needs_verification' };
      } else {
        // Auto sign in after successful registration (if verification not required)
        console.log('[AuthContext] No verification required - signing user in automatically');
        await saveAuthData(result.data.token, result.data.user, result.data.expires_in);
        return { status: 'complete' };
      }
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to register. Please try again.' 
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
      // Use the AuthAPI to update profile
      const result = await AuthAPI.updateProfile(token, {
        firstname: data.firstname,
        lastname: data.lastname,
      });

      // Update the local user state with the updated data
      const updatedUser = { ...user, ...result.data };
      setUser(updatedUser);

      // Save updated user to secure storage
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

      console.log('[AuthContext] User profile updated successfully');
    } catch (error: any) {
      console.error('[AuthContext] Update user error:', error);
      throw new Error(error.message || 'Failed to update user profile');
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
        // Don't update expiry when just refreshing user data
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(freshUserData));
        setUser(freshUserData);
      } else {
        console.log('No user data returned from API');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't throw error to avoid breaking the app
      // The user can continue with cached data
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (!token) {
      throw new Error('No token available to refresh');
    }

    try {
      console.log('[AuthContext] Refreshing authentication token...');
      
      const result = await AuthAPI.refreshToken(token);
      
      if (result.success && result.data.token) {
        console.log('[AuthContext] Token refreshed successfully');
        console.log('[AuthContext] New token expires in:', result.data.expires_in, 'seconds');
        
        // Save the new token with updated expiry time
        if (user) {
          await saveAuthData(result.data.token, user, result.data.expires_in);
        } else {
          // If for some reason user is null, just update the token
          setToken(result.data.token);
          await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
          
          const expiryDate = new Date(Date.now() + result.data.expires_in * 1000);
          setTokenExpiresAt(expiryDate);
          await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
        }
      } else {
        throw new Error('Invalid token refresh response');
      }
    } catch (error: any) {
      console.error('[AuthContext] Token refresh error:', error);
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<{ status: 'complete' | 'error'; error?: string }> => {
    try {
      console.log('[AuthContext] Verifying email with code...');
      
      const result = await AuthAPI.verifyEmail({
        email,
        code,
      });

      if (result.success) {
        console.log('[AuthContext] Email verification successful');
        // According to Laravel guide, verification response only includes user data
        if (result.data.user) {
          // Just update user data without token (user will need to login after verification)
          setUser(result.data.user);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data.user));
        }
        return { status: 'complete' };
      } else {
        throw new Error(result.message?.text || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('[AuthContext] Email verification error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      };
    }
  };

  const resendVerificationCode = async (email: string): Promise<{ status: 'complete' | 'error'; error?: string }> => {
    try {
      console.log('[AuthContext] Resending verification code...');
      
      const result = await AuthAPI.resendVerificationCode(email);

      if (result.success) {
        console.log('[AuthContext] Verification code resent successfully');
        return { status: 'complete' };
      } else {
        throw new Error(result.message?.text || 'Failed to resend verification code');
      }
    } catch (error: any) {
      console.error('[AuthContext] Resend verification code error:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to resend verification code' 
      };
    }
  };

  const value: AuthContextType = {
    user,
    isLoaded,
    isSignedIn,
    token,
    tokenExpiresAt,
    signIn,
    signUp,
    signOut,
    updateUser,
    getToken,
    refreshUser,
    refreshToken,
    verifyEmail,
    resendVerificationCode,
  } as AuthContextType;

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