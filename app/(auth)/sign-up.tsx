import { createAuthStyles } from '@/assets/styles/auth.themed.styles';
import CustomNotification from '@/components/ui/CustomNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors, useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CountryItem = {
    value: string;
    name: string;
};

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [country, setCountry] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');

    // Notification state
    const [notification, setNotification] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
        actions?: Array<{
            text: string;
            onPress: () => void;
            style?: 'default' | 'destructive' | 'cancel';
        }>;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
        actions: []
    });

    // Use themed styles and colors
    const authStyles = useThemedStyles(createAuthStyles);
    const colors = useThemeColors();

    // Get countries list
    const countriesData = require('@/assets/files/countries').default || [];

    // Filter countries based on search query
    const filteredCountries = countriesData.filter((countryItem: CountryItem) =>
        countryItem.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
    
    // Debug: Log countries data
    React.useEffect(() => {
        console.log('Countries data loaded:', countriesData.length, 'countries');
        console.log('Raw countries data:', countriesData);
        if (countriesData.length > 0) {
            console.log('First country:', countriesData[0]);
        }
        console.log('Filtered countries length:', filteredCountries.length);
    }, [filteredCountries]);

    // Handle country selection
    const handleCountrySelect = (selectedCountry: CountryItem) => {
        setCountry(selectedCountry.name);
        setShowCountryPicker(false);
        setCountrySearchQuery('');
    };

    // Helper function to show notifications
    const showNotification = (
        type: 'success' | 'error' | 'warning' | 'info',
        title: string,
        message?: string,
        actions?: Array<{
            text: string;
            onPress: () => void;
            style?: 'default' | 'destructive' | 'cancel';
        }>
    ) => {
        setNotification({
            visible: true,
            type,
            title,
            message,
            actions: actions || [{
                text: 'OK',
                onPress: () => setNotification(prev => ({ ...prev, visible: false }))
            }]
        });
    };

  // Handle submission of sign-up form
  const handleSignUp = async () => {
    if (!emailAddress || !password || !firstname || !lastname || !country) {
      return showNotification("error", "Error", "Please fill in all fields");
    }
    if (password.length < 6) return showNotification("error", "Error", "Password must be at least 6 characters");

    setLoading(true);

    try {
      const result = await signUp({
        email: emailAddress,
        password: password,
        firstname: firstname,
        lastname: lastname,
        country: country,
      });

      if (result.status === 'needs_verification') {
        // Navigate to verification page with the email
        showNotification(
          "info", 
          "Verification Required", 
          "We've sent a 6-digit verification code to your email. Please enter it to complete your registration.",
          [
            {
              text: "OK",
              onPress: () => {
                setNotification(prev => ({ ...prev, visible: false }));
                router.push({
                  pathname: '/(auth)/verify-email',
                  params: { email: emailAddress }
                });
              }
            }
          ]
        );
      } else if (result.status === 'complete') {
        // Registration and auto sign-in successful
        showNotification(
          "success", 
          "Success", 
          "Account created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                setNotification(prev => ({ ...prev, visible: false }));
                router.replace('/(rhapsodylanguages)/(drawer)/(tabs)/daily/' as any);
              }
            }
          ]
        );
      } else if (result.status === 'error') {
        showNotification("error", "Error", result.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      showNotification("error", "Error", err.message || "Failed to create account");
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <View style={authStyles.container}>
        <View style={[authStyles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={authStyles.title}>Check Your Email</Text>
          <Text style={authStyles.subtitle}>
            We've sent a verification link to {emailAddress}. Please click the link in your email to complete your registration.
          </Text>
          <TouchableOpacity 
            style={authStyles.button}
            onPress={() => setPendingVerification(false)}
          >
            <Text style={authStyles.buttonText}>Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[authStyles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            {/* First Name Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter first name"
                placeholderTextColor={colors.textLight}
                value={firstname}
                onChangeText={setFirstname}
                autoCapitalize="words"
              />
            </View>

            {/* Last Name Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter last name"
                placeholderTextColor={colors.textLight}
                value={lastname}
                onChangeText={setLastname}
                autoCapitalize="words"
              />
            </View>

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

            {/* Country Picker */}
            <TouchableOpacity 
              style={authStyles.inputContainer}
              onPress={() => setShowCountryPicker(true)}
              activeOpacity={0.7}
            >
              <View style={[authStyles.textInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={{ color: country ? colors.text : colors.textLight, flex: 1 }}>
                  {country || 'Select country'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>

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
                activeOpacity={0.7}
                delayPressIn={0}
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
              delayPressIn={0}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity 
              style={authStyles.linkContainer} 
              onPress={() => router.back()}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={authStyles.linkText}>
                Already have an account? <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingTop: Platform.OS === 'ios' ? 60 : 16,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              Select Country
            </Text>
            <TouchableOpacity 
              onPress={() => setShowCountryPicker(false)}
              style={{ padding: 8 }}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={{ padding: 16 }}>
            <View style={[authStyles.inputContainer, { marginBottom: 0 }]}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Search countries..."
                placeholderTextColor={colors.textLight}
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Ionicons name="search" size={20} color={colors.textLight} style={{ position: 'absolute', right: 12 }} />
            </View>
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item: CountryItem) => item.value}
            renderItem={({ item }: { item: CountryItem }) => (
              <TouchableOpacity
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: country === item.name ? colors.primary + '10' : 'transparent',
                }}
                onPress={() => handleCountrySelect(item)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Text style={{ 
                  color: country === item.name ? colors.primary : colors.text,
                  fontSize: 16,
                  fontWeight: country === item.name ? '600' : '400'
                }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textLight, fontSize: 16 }}>
                  {countrySearchQuery ? 'No countries found' : 'Loading countries...'}
                </Text>
                <Text style={{ color: colors.textLight, fontSize: 14, marginTop: 8 }}>
                  Total countries: {countriesData.length}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Custom Notification */}
      <CustomNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}