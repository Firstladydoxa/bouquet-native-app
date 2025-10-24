// Test file to verify contexts import
import { AuthProvider, useAuth, useSignIn, useSignUp } from '@/contexts';

console.log('Contexts imported successfully:', {
  AuthProvider,
  useAuth,
  useSignIn,
  useSignUp
});

export default function TestContexts() {
  return null;
}