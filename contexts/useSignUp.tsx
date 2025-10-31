import { useAuth, } from './AuthContext';
import { SignUpData } from './clerk-compatibility';

// Store for temporary signup data
let pendingSignUpData: Partial<SignUpData> = {};

// Hook to mimic Clerk's useSignUp hook
export function useSignUp() {
  const { signUp: authSignUp, isLoaded } = useAuth();

  const signUp = {
    create: async (data: { 
      emailAddress: string; 
      password: string; 
      firstname?: string; 
      lastname?: string;
    }) => {
      // Store the data temporarily
      pendingSignUpData = {
        email: data.emailAddress,
        password: data.password,
        firstname: data.firstname,
        lastname: data.lastname,
        country: pendingSignUpData.country, // Keep any previously set country
      };
      
      // For now, just return needs_verification to trigger email verification flow
      return {
        status: 'needs_verification',
      };
    },

    update: async (data: { unsafeMetadata?: { country?: string } }) => {
      // Store country in the pending data
      if (data.unsafeMetadata?.country) {
        pendingSignUpData.country = data.unsafeMetadata.country;
      }
      return Promise.resolve();
    },

    prepareEmailAddressVerification: async () => {
      // Mock email verification preparation
      return Promise.resolve();
    },

    attemptEmailAddressVerification: async ({ code }: { code: string }) => {
      // Mock email verification
      // In a real app, you'd verify the code with your backend
      if (code === '123456') { // Mock verification code
        // Now actually complete the signup with all the data
        const result = await authSignUp(pendingSignUpData as SignUpData);
        
        if (result.status === 'complete') {
          // Clear pending data
          pendingSignUpData = {};
          return {
            status: 'complete',
            createdSessionId: 'session_' + Date.now(),
          };
        } else {
          throw new Error(result.error || 'Sign up failed');
        }
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