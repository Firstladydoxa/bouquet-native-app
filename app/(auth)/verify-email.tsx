import { createAuthStyles } from "@/assets/styles/auth.themed.styles";
import { useAuth } from '@/contexts';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { Image } from "expo-image";
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
  const router = useRouter();
  const { email: paramEmail, autoResent } = useLocalSearchParams<{ email: string; autoResent?: string }>();
  const { verifyEmail, resendVerificationCode } = useAuth();
  
  const [email, setEmail] = useState(paramEmail || '');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Check if verification code was automatically resent
  const wasAutoResent = autoResent === 'true';

  // Use themed styles and colors
  const authStyles = useThemedStyles(createAuthStyles);
  const colors = useThemeColors();

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
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

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
}
