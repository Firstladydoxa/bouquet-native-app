import { createAuthStyles } from '@/assets/styles/auth.themed.styles';
import CustomNotification from '@/components/ui/CustomNotification';
import { useAuth } from '@/contexts/AuthContext';
import useCustomNotification from '@/hooks/use-custom-notification';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const router = useRouter()
  const { notification, showError, hideNotification } = useCustomNotification();

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use themed styles and colors
  const authStyles = useThemedStyles(createAuthStyles);
  const colors = useThemeColors();

  // Handle the submission of the sign-in form
  const handleSignIn = async () => {
    if (!emailAddress || !password) {
      showError("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log('[SignIn] Attempting sign in...');
      
      const result = await signIn({
        email: emailAddress,
        password: password,
      });

      console.log('[SignIn] Sign in result:', result.status);

      if (result.status === 'complete') {
        console.log('[SignIn] Sign in successful');
        // Navigate to the main app - the AuthContext will handle the user state
        router.replace('/(rhapsodylanguages)/(drawer)/(tabs)/daily/' as any);
      } else if (result.status === 'error') {
        const errorMessage = result.error || 'Sign in failed. Please try again.';
        console.error('[SignIn] Sign in failed:', errorMessage);
        
        // Check if this is an email verification error
        if (errorMessage.includes('verify your email') || errorMessage.includes('verification')) {
          console.log('[SignIn] Email verification required, redirecting to verify-email...');
          
          // Navigate to verification page with the email
          // Note: AuthAPI has already auto-resent the verification code
          router.push({
            pathname: '/(auth)/verify-email',
            params: { 
              email: emailAddress,
              autoResent: 'true' // Indicate that verification code was automatically resent
            }
          });
        } else {
          showError("Sign In Failed", errorMessage);
        }
      }
    } catch (err: any) {
      // Handle any unexpected errors
      const errorMessage = err.message || "An unexpected error occurred";
      console.error('[SignIn] Unexpected error:', err);
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
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
          <View style={authStyles.imageContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Welcome Back</Text>

          {/* FORM CONTAINER */}
          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={colors.text}
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* PASSWORD INPUT */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={colors.text}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off"}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginBottom: 20 }}
              onPress={() => router.push("/(auth)/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={[authStyles.link, { fontSize: 14 }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
              delayPressIn={0}
            >
              <Text style={authStyles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/(auth)/sign-up")}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={authStyles.linkText}>
                Don&apos;t have an account? <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  )
}