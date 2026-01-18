import { createAuthStyles } from "@/assets/styles/auth.themed.styles";
import { useAuth } from '@/contexts';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyEmailScreen() {
  try {
    console.log('[VerifyEmail] Component mounting...');
    
    const router = useRouter();
    console.log('[VerifyEmail] Router initialized');
    
    const params = useLocalSearchParams<{ email?: string; autoResent?: string }>();
    const paramEmail = params?.email;
    const autoResent = params?.autoResent;
    console.log('[VerifyEmail] Params:', { paramEmail, autoResent });
    
    // Call hooks unconditionally at the top
    const auth = useAuth();
    console.log('[VerifyEmail] Auth context loaded:', { hasAuth: !!auth, hasVerifyEmail: !!auth?.verifyEmail });
    
    const authStyles = useThemedStyles(createAuthStyles);
    console.log('[VerifyEmail] Auth styles loaded');
    
    const colors = useThemeColors();
    console.log('[VerifyEmail] Colors loaded');
    
    const [email, setEmail] = useState(paramEmail || '');
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    
    console.log('[VerifyEmail] State initialized, email:', email);
    
    // Check if verification code was automatically resent
    const wasAutoResent = autoResent === 'true';

    // Safety check: Ensure auth context is available
    if (!auth || !auth.verifyEmail || !auth.resendVerificationCode) {
      console.error('[VerifyEmail] Auth context missing!', { auth: !!auth, verifyEmail: !!auth?.verifyEmail, resendVerificationCode: !!auth?.resendVerificationCode });
      return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Authentication Error
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
          Authentication system is not available. Please restart the app.
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/sign-up')}
          style={{ marginTop: 20, padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Back to Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
    }

    const { verifyEmail, resendVerificationCode } = auth;
    console.log('[VerifyEmail] Functions extracted successfully');

    const handleVerification = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmail(email.trim(), code.trim());

      if (result.status === 'complete') {
        Alert.alert(
          "Success", 
          "Email verified successfully! You can now sign in.",
          [
            {
              text: "OK",
              onPress: () => router.replace('/(auth)/sign-in')
            }
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Verification failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Verification failed. Please try again.");
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setResending(true);
    try {
      const result = await resendVerificationCode(email.trim());
      if (result.status === 'complete') {
        Alert.alert("Success", "Verification code sent! Please check your email.");
      } else {
        Alert.alert("Error", result.error || "Failed to resend code. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Safety check: if no email is available and not editable, show error
  if (!email && !paramEmail) {
    return (
      <View style={authStyles?.container || { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
          Email Required
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
          No email address was provided. Please go back and try again.
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/sign-up')}
          style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Back to Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[authStyles.scrollContent, { paddingBottom: 50 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>
            {wasAutoResent 
              ? `A new verification code has been sent to ${email}` 
              : `We've sent a verification code to ${email}`
            }
          </Text>

          {/* Auto-resent notification */}
          {wasAutoResent && (
            <View style={{ marginVertical: 10, padding: 12, backgroundColor: colors.success + '20', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.success }}>
              <Text style={{ color: colors.success, fontSize: 14, textAlign: 'center' }}>
                📧 Verification code automatically resent to your email
              </Text>
            </View>
          )}

          <View style={authStyles.formContainer}>
            {/* Email Input (if not provided via params) */}
            {!paramEmail && (
              <View style={authStyles.inputContainer}>
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Email address"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Verification Code Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter verification code"
                placeholderTextColor={colors.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleVerification}
              disabled={loading}
              activeOpacity={0.8}
              delayPressIn={0}
            >
              <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
            </TouchableOpacity>

            {/* Resend Code */}
            <TouchableOpacity 
              style={[authStyles.linkContainer, { marginTop: 16 }]} 
              onPress={handleResendCode}
              disabled={resending}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={authStyles.linkText}>
                {resending ? "Sending..." : "Didn't receive the code? "}
                {!resending && <Text style={authStyles.link}>Resend</Text>}
              </Text>
            </TouchableOpacity>

            {/* Back to Sign Up */}
            <TouchableOpacity 
              style={authStyles.linkContainer} 
              onPress={() => router.back()}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
  } catch (error) {
    console.error('[VerifyEmail] FATAL ERROR in component:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Component Crash
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
        <Text style={{ color: '#999', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
          {error instanceof Error ? error.stack : ''}
        </Text>
      </View>
    );
  }
}
