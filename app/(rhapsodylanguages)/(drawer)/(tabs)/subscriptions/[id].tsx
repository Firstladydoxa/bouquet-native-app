import CustomLoader from '@/components/ui/CustomLoader';
import { useAuth, useSubscription, useUser } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { PaymentApi } from '@/services/paymentApi';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import type { Language, Package } from '@/types';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, refreshUser } = useAuth();
  const { refreshSubscription, refreshPaymentHistory } = useSubscription();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const colors = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const styles = createStyles(colors);

  // Fetch package details and languages
  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch package and languages in parallel
      const [pack, langs] = await Promise.all([
        RhapsodyLanguagesAPI.fetchPackageDetails(id),
        PaymentApi.fetchLanguages(token),
      ]);

      if (pack) {
        setSelectedPackage(pack);
      } else {
        Alert.alert('Error', 'Package not found');
        router.back();
      }

      if (langs && langs.length > 0) {
        setLanguages(langs);
      }
    } catch (error) {
      console.error('Error loading package:', error);
      Alert.alert('Error', 'Failed to load package details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Handle Stripe payment
  const handlePayment = async () => {
    if (!user || !selectedPackage) {
      Alert.alert('Error', 'Please sign in to continue');
      return;
    }

    if (!selectedLanguage) {
      Alert.alert('Language Required', 'Please select a language before proceeding to payment');
      return;
    }

    try {
      setProcessing(true);

      // Step 1: Get authentication token
      const token = await getToken();

      // Step 2: Fetch payment intent from backend using PaymentApi service
      console.log('Creating payment intent with data:', {
        userId: user.id,
        language: selectedLanguage.label,
        packageId: selectedPackage.id,
        amount: selectedPackage.price * 100,
        currency: selectedPackage.currency.toLowerCase(),
        method: 'Online Payment International ',
        priceId: selectedPackage.stripe_price,
      });

      const { clientSecret, ephemeralKey, customer } = await PaymentApi.fetchPaymentIntent(
        {
            userId: user.id,
            language: selectedLanguage.label,
            packageId: selectedPackage.id,
            amount: selectedPackage.price, // Stripe expects amount in cents
            currency: selectedPackage.currency.toLowerCase(),
            method: 'Online Payment International ',
            priceId: selectedPackage.stripe_price,
          
        },
        token
      );

      console.log('Payment intent response:', {
        clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'null',
        ephemeralKey: ephemeralKey ? `${ephemeralKey.substring(0, 20)}...` : 'null',
        customer: customer || 'null'
      });

      if (!clientSecret) {
        throw new Error('Failed to create payment intent - no client secret received');
      }

      if (!clientSecret.startsWith('pi_')) {
        console.error('Invalid client secret format:', clientSecret);
        throw new Error('Invalid payment intent format received from server');
      }

      // Additional debugging: Test client secret validity
      console.log('Client secret format validation passed');
      console.log('Client secret length:', clientSecret.length);
      console.log('Client secret pattern check:', /^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/.test(clientSecret));

      // Step 3: Initialize the payment sheet
      const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || 'TNI Bouquet Apps';
      console.log('Initializing payment sheet with:', {
        merchantDisplayName: APP_NAME,
        customerId: customer,
        clientSecretPrefix: clientSecret.substring(0, 20),
        userEmail: user.email,
        userName: `${user.name}`
      });

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: APP_NAME,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          email: user.email,
          name: `${user.name}`,
        },
        appearance: {
          colors: {
            primary: '#8B5CF6',
            background: '#FFFFFF',
            componentBackground: '#F3F4F6',
            componentBorder: '#E5E7EB',
            componentDivider: '#E5E7EB',
            primaryText: '#111827',
            secondaryText: '#6B7280',
            componentText: '#111827',
            placeholderText: '#9CA3AF',
          },
          shapes: {
            borderRadius: 12,
            borderWidth: 1,
          },
          primaryButton: {
            shapes: {
              borderRadius: 8,
            },
          },
        },
      });

      if (initError) {
        console.error('Payment sheet initialization error:', {
          code: initError.code,
          message: initError.message,
          localizedMessage: initError.localizedMessage,
          declineCode: initError.declineCode,
          stripeErrorCode: initError.stripeErrorCode,
          type: initError.type
        });
        Alert.alert('Payment Error', `Failed to initialize payment: ${initError.message}`);
        return;
      }

      console.log('Payment sheet initialized successfully');

      // Step 4: Present the payment sheet
      console.log('Presenting payment sheet...');
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet presentation error:', {
          code: presentError.code,
          message: presentError.message,
          localizedMessage: presentError.localizedMessage,
          declineCode: presentError.declineCode,
          stripeErrorCode: presentError.stripeErrorCode,
          type: presentError.type
        });
        
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Error', presentError.message || 'Payment failed. Please try again.');
        }
        return;
      }

      console.log('Payment completed successfully');

      // Step 5: Refresh user data to get updated subscription details
      console.log('Refreshing user data after successful payment...');
      try {
        await refreshUser();
        console.log('User data refreshed successfully');
        
        // Also refresh subscription context to update subscription status
        console.log('Refreshing subscription context...');
        await Promise.all([
          refreshSubscription(),
          refreshPaymentHistory()
        ]);
        console.log('Subscription context refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh user/subscription data:', refreshError);
        // Don't block the success flow if refresh fails
      }

      Alert.alert(
        'Success! 🎉',
        `You are now subscribed to ${selectedPackage.label}!`,
        [
          {
            text: 'View Subscription',
            onPress: () => {
              // Navigate to the manage subscription page
              router.replace('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/manage' as any);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (userLoaded && id) {
      fetchPackageDetails();
    }
  }, [userLoaded, id]);

  if (!userLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomLoader size="large" message="Loading payment details..." />
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedPackage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>
            Package Not Found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary || '#3847d6'} />
            <Text style={styles.backButtonText}>Back to Plans</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Complete Your Purchase
          </Text>
          <Text style={styles.headerSubtitle}>
            Review your subscription details
          </Text>
        </View>

        {/* Package Details Card */}
        <View style={styles.cardContainer}>
          <View style={styles.packageCard}>
            {/* Premium Badge */}
            <LinearGradient
              colors={[colors.secondary || '#3847d6', '#3847d6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumBadge}
            >
              <Text style={styles.premiumBadgeText}>
                ⭐ PREMIUM SUBSCRIPTION
              </Text>
            </LinearGradient>

            <View style={styles.packageContent}>
              {/* Plan Name */}
              <Text style={styles.planName}>
                {selectedPackage.label}
              </Text>
              <Text style={styles.planDescription}>
                {selectedPackage.value}
              </Text>

              {/* Price */}
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>
                  TOTAL AMOUNT
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>
                    ${selectedPackage.price}
                  </Text>
                  <Text style={styles.priceDuration}>
                    /{selectedPackage.duration}
                  </Text>
                </View>
              </View>

              {/* Features */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>
                  What's Included:
                </Text>
                {selectedPackage.items.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <View style={styles.checkIcon}>
                      <Feather name="check" size={16} color="goldenrod" />
                    </View>
                    <Text style={styles.featureText}>
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Language Selection */}
              <View style={styles.languageSection}>
                <Text style={styles.languageTitle}>
                  Select Language:
                </Text>
                {languages.length === 0 ? (
                  <View style={styles.languageLoading}>
                    <CustomLoader size="small" message="Loading languages..." />
                  </View>
                ) : (
                  <View style={styles.languageGrid}>
                    {languages.map((language) => (
                      <TouchableOpacity
                        key={language.id}
                        onPress={() => setSelectedLanguage(language)}
                        style={[
                          styles.languageChip,
                          selectedLanguage?.id === language.id && styles.languageChipSelected
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.languageChipText,
                            selectedLanguage?.id === language.id && styles.languageChipTextSelected
                          ]}
                        >
                          {language.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {selectedLanguage && (
                  <View style={styles.languageConfirmation}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary || '#3847d6'} />
                    <Text style={styles.languageConfirmationText}>
                      {selectedLanguage.label} selected
                    </Text>
                  </View>
                )}
              </View>

              {/* Payment Info */}
              <View style={styles.securityInfo}>
                <View style={styles.securityHeader}>
                  <MaterialIcons name="security" size={20} color={colors.secondary || '#3847d6'} />
                  <Text style={styles.securityTitle}>
                    Secure Payment
                  </Text>
                </View>
                <Text style={styles.securityText}>
                  Your payment information is encrypted and secure. Powered by
                  Stripe.
                </Text>
              </View>

              {/* Payment Button */}
              <TouchableOpacity
                onPress={handlePayment}
                disabled={processing || !selectedLanguage}
                style={[
                  styles.paymentButton,
                  (processing || !selectedLanguage) && styles.paymentButtonDisabled
                ]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.secondary || 'goldenrod', 'goldenrod']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.paymentGradient}
                >
                  <View style={styles.paymentButtonContent}>
                    {processing ? (
                      <Text style={styles.paymentButtonText}>
                        Processing Payment...
                      </Text>
                    ) : (
                      <>
                        <MaterialIcons
                          name="payment"
                          size={24}
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.paymentButtonText}>
                          {!selectedLanguage ? 'Select Language First' : 'Proceed to Payment'}
                        </Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding with this purchase, you agree to our Terms of Service
            and Privacy Policy. Your subscription will automatically renew unless
            cancelled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary || '#3847d6',
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: colors.secondary || '#3847d6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.primary || '#3847d6',
  },
  headerSubtitle: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 16,
  },
  cardContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  premiumBadge: {
    paddingVertical: 12,
  },
  premiumBadgeText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  packageContent: {
    padding: 32,
  },
  planName: {
    fontSize: 32,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.primary || '#3847d6',
    marginBottom: 12,
  },
  planDescription: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  priceBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.secondary || '#3847d6',
  },
  priceDuration: {
    color: colors.primary || '#3847d6',
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.primary || '#3847d6',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkIcon: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 6,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    color: '#374151',
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  languageSection: {
    marginBottom: 24,
  },
  languageTitle: {
    fontSize: 20,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.primary || '#3847d6',
    marginBottom: 12,
  },
  languageLoading: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  languageLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  languageChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: 'goldenrod',
  },
  languageChipText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#374151',
  },
  languageChipTextSelected: {
    color: colors.secondary || '#3847d6',
  },
  languageConfirmation: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageConfirmationText: {
    color: colors.secondary || '#3847d6',
    fontWeight: '600',
    marginLeft: 8,
  },
  securityInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTitle: {
    color: colors.primary || '#3847d6',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  securityText: {
    color: '#1E40AF',
    fontSize: 14,
    marginTop: 8,
  },
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  paymentButtonDisabled: {
    opacity: 0.5,
  },
  paymentGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  paymentButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  termsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  termsText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});