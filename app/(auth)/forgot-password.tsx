import { createAuthStyles } from '@/assets/styles/auth.themed.styles';
import CustomNotification from '@/components/ui/CustomNotification';
import useCustomNotification from '@/hooks/use-custom-notification';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { AuthAPI } from '@/services/authApi';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { notification, showError, showSuccess, hideNotification } = useCustomNotification();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Use themed styles and colors
  const authStyles = useThemedStyles(createAuthStyles);
  const colors = useThemeColors();

  // Handle the submission of the forgot password form
  const handleForgotPassword = async () => {
    if (!email) {
      showError("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log('[ForgotPassword] Requesting password reset for:', email);
      
      const result = await AuthAPI.requestPasswordReset(email);

      console.log('[ForgotPassword] Request result:', result);

      if (result.success) {
        console.log('[ForgotPassword] Password reset email sent successfully');
        setEmailSent(true);
        showSuccess(
          "Email Sent! 📧",
          "Check your email for the password reset link. It may take a few minutes to arrive."
        );
      } else {
        showError("Error", result.message?.text || 'Failed to send password reset email');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send password reset email. Please try again.";
      console.error('[ForgotPassword] Error:', err);
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
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
          {/* Back Button */}
          <TouchableOpacity
            style={authStyles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={authStyles.imageContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Forgot Password?</Text>
          <Text style={[authStyles.subtitle, { color: colors.textLight }]}>
            {emailSent 
              ? "We've sent you an email with instructions to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </Text>

          {/* FORM CONTAINER */}
          {!emailSent && (
            <View style={authStyles.formContainer}>
              {/* Email Input */}
              <View style={authStyles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={colors.textLight} 
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[authStyles.textInput, { flex: 1 }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                onPress={handleForgotPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <TouchableOpacity
                style={authStyles.linkContainer}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={authStyles.linkText}>
                  Remember your password? <Text style={authStyles.link}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email Sent Success State */}
          {emailSent && (
            <View style={authStyles.formContainer}>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primaryLight || colors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <Ionicons name="mail-open" size={40} color={colors.primary} />
                </View>
                <Text style={[authStyles.title, { fontSize: 20, marginBottom: 10 }]}>
                  Check Your Email
                </Text>
                <Text style={[authStyles.subtitle, { textAlign: 'center', marginBottom: 30 }]}>
                  We sent a password reset link to{'\n'}
                  <Text style={{ fontWeight: '600', color: colors.text }}>{email}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={authStyles.authButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[authStyles.linkContainer, { marginTop: 20 }]}
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                activeOpacity={0.7}
              >
                <Text style={authStyles.linkText}>
                  Didn't receive the email? <Text style={authStyles.link}>Try again</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <CustomNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </View>
  );
}
