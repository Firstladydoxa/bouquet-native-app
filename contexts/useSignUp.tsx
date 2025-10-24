import { useAuth, } from './AuthContext';
import { SignUpData } from './clerk-compatibility';

// Hook to mimic Clerk's useSignUp hook
export function useSignUp() {
  const { signUp: authSignUp, isLoaded } = useAuth();

  const signUp = {
    create: async (data: { emailAddress: string; password: string }) => {
      const signUpData: SignUpData = {
        email: data.emailAddress,
        password: data.password
      };
      
      const result = await authSignUp(signUpData);
      
      if (result.status === 'complete') {
        return {
          status: 'complete',
          createdSessionId: 'session_' + Date.now(), // Mock session ID
        };
      } else if (result.status === 'needs_verification') {
        return {
          status: 'needs_verification',
          // Add any verification-related properties you need
        };
      } else {
        throw new Error(result.error || 'Sign up failed');
      }
    },

    prepareEmailAddressVerification: async () => {
      // Mock email verification preparation
      return Promise.resolve();
    },

    attemptEmailAddressVerification: async ({ code }: { code: string }) => {
      // Mock email verification
      // In a real app, you'd verify the code with your backend
      if (code === '123456') { // Mock verification code
        return {
          status: 'complete',
          createdSessionId: 'session_' + Date.now(),
        };
      } else {
        throw new Error('Invalid verification code');
      }
    }
  };

  const setActive = async ({ session }: { session: string }) => {
    // In our custom auth, the session is already active after successful sign up
    // This is mainly for compatibility with Clerk's API
    return Promise.resolve();
  };

  return {
    signUp,
    setActive,
    isLoaded,
  };
}