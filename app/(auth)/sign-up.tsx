import { createAuthStyles } from '@/assets/styles/auth.themed.styles';
import { useSignUp } from '@/contexts';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import VerifyEmail from './verify-email';

export default function SignUpScreen() {

    const router = useRouter();
    const { isLoaded, signUp, setActive } = useSignUp()
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    const [code, setCode] = useState('')

    // Use themed styles and colors
    const authStyles = useThemedStyles(createAuthStyles);
    const colors = useThemeColors();

  // Handle submission of sign-up form
  const handleSignUp = async () => {
    if (!emailAddress || !password) return Alert.alert("Error", "Please fill in all fields");
    if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");

    if (!isLoaded) return;

    setLoading(true);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({ emailAddress, password,})

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification()

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      Alert.alert("Error", err.errors?.[0]?.message || "Failed to create account");
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification)
    return <VerifyEmail email={emailAddress} onBack={() => setPendingVerification(false)} />;


  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("@/assets/images/i2.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={colors.textLight}
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.back()}>
              <Text style={authStyles.linkText}>
                Already have an account? <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}