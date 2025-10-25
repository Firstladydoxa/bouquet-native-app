import { useAuth } from '@/contexts';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { AuthAPI } from '@/services/authApi';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
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
import { createAuthStyles } from "../../assets/styles/auth.themed.styles";

const VerifyEmail = ({ email, onBack }: { email: string; onBack: () => void; }) => {

  const router = useRouter();
  const { signIn } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Use themed styles and colors
  const authStyles = useThemedStyles(createAuthStyles);
  const colors = useThemeColors();

  const handleVerification = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await AuthAPI.verifyEmail({
        email,
        verification_code: code,
      });

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
    } catch (err: any) {
      Alert.alert("Error", err.message || "Verification failed. Please try again.");
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await AuthAPI.resendVerificationEmail(email);
      Alert.alert("Success", "Verification code sent! Please check your email.");
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          <Text style={authStyles.subtitle}>We&apos;ve sent a verification code to {email}</Text>

          <View style={authStyles.formContainer}>
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
            >
              <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
            </TouchableOpacity>

            {/* Resend Code */}
            <TouchableOpacity 
              style={[authStyles.linkContainer, { marginTop: 16 }]} 
              onPress={handleResendCode}
              disabled={resending}
            >
              <Text style={authStyles.linkText}>
                {resending ? "Sending..." : "Didn't receive the code? "}
                {!resending && <Text style={authStyles.link}>Resend</Text>}
              </Text>
            </TouchableOpacity>

            {/* Back to Sign Up */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={onBack}>
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default VerifyEmail;
