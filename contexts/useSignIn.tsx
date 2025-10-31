import { useAuth } from './AuthContext';

// Hook to mimic Clerk's useSignIn hook
export function useSignIn() {
  const { signIn: authSignIn, isLoaded } = useAuth();

  const signIn = {
    create: async (data: { identifier: string; password: string }) => {
      try {
        const signInData = {
          email: data.identifier,
          password: data.password
        };
        const result = await authSignIn(signInData);
        
        if (result.status === 'complete') {
          return {
            status: 'complete',
            createdSessionId: 'session_' + Date.now(), // Mock session ID
          };
        } else {
          // Return error structure compatible with Clerk
          return {
            status: 'failed',
            errors: [{
              message: result.error || 'Sign in failed',
              code: 'form_identifier_not_found',
            }]
          };
        }
      } catch (error: any) {
        // Return error in Clerk-compatible format
        return {
          status: 'failed',
          errors: [{
            message: error.message || 'An unexpected error occurred',
            code: 'form_identifier_not_found',
          }]
        };
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