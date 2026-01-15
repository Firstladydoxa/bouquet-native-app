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
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');

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
        console.log('[ForgotPassword] Password reset code sent successfully');
        setCodeSent(true);
        setStep('code');
        showSuccess(
          "Code Sent! 📧",
          "Check your email for a 6-digit code. It may take a few minutes to arrive."
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

  // Handle code verification (move to password step)
  const handleVerifyCode = () => {
    if (!code || code.length !== 6) {
      showError("Error", "Please enter the 6-digit code");
      return;
    }
    setStep('password');
  };

  // Handle resending the code
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const result = await AuthAPI.requestPasswordReset(email);
      if (result.success) {
        showSuccess("Code Resent", "A new 6-digit code has been sent to your email");
        setCode('');
      }
    } catch (err: any) {
      showError("Error", err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with code
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      showError("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      showError("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      showError("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await AuthAPI.resetPassword({
        email,
        code,
        password,
        password_confirmation: confirmPassword
      });

      if (result.success) {
        showSuccess(
          "Success! 🎉",
          "Your password has been reset successfully"
        );
        // Navigate to sign-in after a short delay
        setTimeout(() => {
          router.replace('/sign-in');
        }, 1500);
      }
    } catch (err: any) {
      showError("Error", err.message || "Failed to reset password");
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

          <Text style={authStyles.title}>
            {step === 'email' && 'Forgot Password?'}
            {step === 'code' && 'Enter Reset Code'}
            {step === 'password' && 'Create New Password'}
          </Text>
          <Text style={[authStyles.subtitle, { color: colors.textLight }]}>
            {step === 'email' && "Enter your email address and we'll send you a 6-digit code to reset your password."}
            {step === 'code' && `We sent a 6-digit code to ${email}`}
            {step === 'password' && "Enter your new password below"}
          </Text>

          {/* FORM CONTAINER */}
          {step === 'email' && (
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
                  {loading ? "Sending..." : "Send Code"}
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

          {/* CODE INPUT STEP */}
          {step === 'code' && (
            <View style={authStyles.formContainer}>
              {/* Code Input */}
              <View style={authStyles.inputContainer}>
                <Ionicons 
                  name="keypad-outline" 
                  size={20} 
                  color={colors.textLight} 
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[authStyles.textInput, { 
                    flex: 1, 
                    fontSize: 24, 
                    fontWeight: '600',
                    letterSpacing: 8,
                    textAlign: 'center'
                  }]}
                  placeholder="000000"
                  placeholderTextColor={colors.textLight}
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[authStyles.authButton, (loading || code.length !== 6) && authStyles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading || code.length !== 6}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>Continue</Text>
              </TouchableOpacity>

              {/* Resend Code Link */}
              <TouchableOpacity
                style={[authStyles.linkContainer, { marginTop: 15 }]}
                onPress={handleResendCode}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={authStyles.linkText}>
                  Didn&apos;t receive the code? <Text style={authStyles.link}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* NEW PASSWORD STEP */}
          {step === 'password' && (
            <View style={authStyles.formContainer}>
              {/* Password Input */}
              <View style={authStyles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={colors.textLight} 
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[authStyles.textInput, { flex: 1 }]}
                  placeholder="New Password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={authStyles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={colors.textLight} 
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={[authStyles.textInput, { flex: 1 }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Show/Hide Password Toggle */}
              <TouchableOpacity
                style={[authStyles.linkContainer, { marginBottom: 15, alignSelf: 'flex-end' }]}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={[authStyles.link, { fontSize: 14 }]}>
                  {showPassword ? 'Hide' : 'Show'} Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>
                  {loading ? "Resetting..." : "Reset Password"}
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
