import { useAuth } from './AuthContext';

// Hook to mimic Clerk's useSignIn hook
export function useSignIn() {
  const { signIn: authSignIn, isLoaded } = useAuth();

  const signIn = {
    create: async (data: { identifier: string; password: string }) => {
      const result = await authSignIn(data);
      
      if (result.status === 'complete') {
        return {
          status: 'complete',
          createdSessionId: 'session_' + Date.now(), // Mock session ID
        };
      } else {
        throw new Error(result.error || 'Sign in failed');
      }
    }
  };

  const setActive = async ({ session }: { session: string }) => {
    // In our custom auth, the session is already active after successful sign in
    // This is mainly for compatibility with Clerk's API
    return Promise.resolve();
  };

  return {
    signIn,
    setActive,
    isLoaded,
  };
}