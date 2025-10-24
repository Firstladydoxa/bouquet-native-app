// Compatibility layer to replace @clerk/clerk-expo imports
// This allows existing sign-in/sign-up pages to work without modification

export { useSignIn } from './useSignIn';
export { useSignUp } from './useSignUp';
export { useAuth, useUser } from './AuthContext';

// Re-export types for compatibility
export type { User, SignInData, SignUpData } from '@/types';