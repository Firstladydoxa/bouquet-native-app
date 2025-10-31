import PaymentFailed from '@/components/subscriptions/PaymentFailed';
import PaymentSuccess from '@/components/subscriptions/PaymentSuccess';
import { useAuth, useSubscription } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { PaymentApi } from '@/services/paymentApi';
import { getUserFullName } from '@/utils/userUtils';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentStatus = 'form' | 'processing' | 'success' | 'failed';

export default function BuyAdditionalLanguageScreen() {
    const { language } = useLocalSearchParams<{ language: string }>();
    const { user, getToken, refreshUser } = useAuth();
    const { hasSubscription, subscriptionDetails } = useSubscription();
    const colors = useThemeColors();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('form');
    const [paymentError, setPaymentError] = useState<string>('');
    const [cardComplete, setCardComplete] = useState(false);
    const { refreshSubscription, refreshPaymentHistory } = useSubscription();
    
    const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();

    const styles = createStyles(colors);

    // Price for additional language
    const additionalLanguagePrice = 2.99;

    const handlePurchase = async () => {
        if (!user) {
        Alert.alert('Error', 'Please sign in to purchase');
        return;
        }

        if (!hasSubscription) {
        Alert.alert('Error', 'You need an active subscription to add additional languages');
        return;
        }

        if (!cardComplete) {
        Alert.alert('Error', 'Please complete your card details');
        return;
        }

        setLoading(true);
        setPaymentError('');

        try {
        console.log('Creating payment intent for additional language...');
        
        // Get user token
        const userToken = await getToken();
        
        // 1. Create payment intent on backend
        const paymentIntentData = await PaymentApi.fetchPaymentIntent(
            {
            userId: String(user.id), // Convert number to string
            packageId: String(subscriptionDetails?.package_id || ''), // Convert number to string
            priceId: subscriptionDetails?.package?.stripe_price || '',
            amount: Math.round(additionalLanguagePrice),
            currency: 'usd',
            language: language,
            method: 'card',
            },
            userToken
        );

        console.log('Payment intent created:', paymentIntentData.clientSecret.substring(0, 20) + '...');

        // 2. Confirm payment with Stripe
        const { error, paymentIntent } = await confirmPayment(paymentIntentData.clientSecret, {
            paymentMethodType: 'Card',
        });

        if (error) {
            console.error('Payment confirmation error:', error);
            setPaymentError(error.message || 'Payment failed');
            setPaymentStatus('failed');
            setLoading(false);
            return;
        }

        if (paymentIntent) {
            console.log('Payment successful:', paymentIntent.id);
            
            // 3. Verify payment on backend and update subscription
            try {
            await PaymentApi.verifyPayment(paymentIntent.id, userToken);
            
            // 4. Refresh user subscription data
            if (refreshSubscription) {
                await refreshSubscription();
            }
            
            setPaymentStatus('success');
            } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError);
            // Payment succeeded but verification failed
            Alert.alert(
                'Payment Successful',
                'Your payment was processed, but there was an issue updating your account. Please contact support.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            }
        }
        } catch (error: any) {
            console.error('Purchase error:', error);
            setPaymentError(error.message || 'Failed to process purchase. Please try again.');
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle Stripe payment
    const handlePaymentWithPaymentIntent = async () => {

        if (!user) {
            Alert.alert('Error', 'Please sign in to purchase');
            return;
        }

        if (!hasSubscription) {
            Alert.alert('Error', 'You need an active subscription to add additional languages');
            return;
        }

        setLoading(true);
        setPaymentError('');
    
  
      try {
  
        // Step 1: Get authentication token
        const token = await getToken();
  
        // Step 2: Fetch payment intent from backend using PaymentApi service
        console.log('Creating payment intent with data:', {
          userId: user.id,
          packageId: subscriptionDetails?.package_id || '',
          priceId: subscriptionDetails?.package?.stripe_price || '',
          amount: Math.round(additionalLanguagePrice),
          currency: 'usd',
          language: language,
          method: 'card',
        });
  
        const { clientSecret, ephemeralKey, customer } = await PaymentApi.buyAdditionalLanguage(
            {
                userId: String(user.id), // Convert number to string
                packageId: String(subscriptionDetails?.package_id || ''), // Convert number to string
                priceId: subscriptionDetails?.package?.stripe_price || '',
                amount: Math.round(additionalLanguagePrice),
                currency: 'usd',
                language: language,
                method: 'card',
            
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
          userName: getUserFullName(user)
        });
  
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: APP_NAME,
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          paymentIntentClientSecret: clientSecret,
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            email: user.email,
            name: getUserFullName(user),
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
          
            setPaymentError(`Failed to initialize payment: ${initError.message}` || 'Payment Error');
            setPaymentStatus('failed');
            setLoading(false);
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
            setPaymentError(`Failed to present payment: ${presentError.message}` || 'Payment failed. Please try again.');
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
  
        setPaymentStatus('success');
      } catch (error: any) {
       
        console.error('Purchase error:', error);
        setPaymentError(error.message || 'Failed to process purchase. Please try again.');
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    // Render success screen
    if (paymentStatus === 'success') {
        return (
        <PaymentSuccess
            title="Language Added Successfully!"
            congratsMessage={`Congratulations! You now have access to Rhapsody in ${language}.`}
            message={`${language} has been successfully added to your subscription. You can now access all content in this language.`}
            buttonText="Start Exploring"
            onButtonPress={() => router.push(`/(rhapsodylanguages)/(drawer)/regions/list` as any)}
        />
        );
    }

    // Render failure screen
    if (paymentStatus === 'failed') {
        return (
        <PaymentFailed
            title="Payment Failed"
            message="We couldn't process your payment. Please check your card details and try again."
            errorDetails={paymentError}
            onRetry={() => {
            setPaymentStatus('form');
            setPaymentError('');
            }}
            onCancel={() => router.back()}
        />
        );
    }

    if (!language) {
        return (
        <SafeAreaView style={styles.container}>
            <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <Text style={styles.errorText}>Language not specified</Text>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>Go Back</Text>
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
            <View style={styles.iconContainer}>
                <Ionicons name="language" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Add Additional Language</Text>
            <Text style={styles.subtitle}>
                Expand your Rhapsody experience with {language}
            </Text>
            </View>

            {/* Current Subscription Info */}
            {subscriptionDetails && (
            <View style={styles.currentSubCard}>
                <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={styles.cardTitle}>Current Subscription</Text>
                </View>
                <View style={styles.subDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Language{subscriptionDetails.language && subscriptionDetails.language.length > 1 ? 's' : ''}:</Text>
                    <Text style={styles.detailValue}>
                      {subscriptionDetails.language && subscriptionDetails.language.length > 0 
                        ? subscriptionDetails.language.join(', ') 
                        : 'N/A'}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plan:</Text>
                    <Text style={styles.detailValue}>{subscriptionDetails.package?.label || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, { color: colors.success }]}>
                    {subscriptionDetails.status}
                    </Text>
                </View>
                </View>
            </View>
            )}

            {/* New Language Card */}
            <View style={styles.languageCard}>
            <LinearGradient
                colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientHeader}
            >
                <Text style={styles.languageTitle}>{language}</Text>
            </LinearGradient>
            
            <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>What You'll Get:</Text>
                
                <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                    <Ionicons name="book" size={24} color={colors.primary} />
                    <Text style={styles.featureText}>Read Rhapsody in {language}</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="headset" size={24} color={colors.secondary} />
                    <Text style={styles.featureText}>Listen to audio in {language}</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="download" size={24} color={colors.success} />
                    <Text style={styles.featureText}>Download content for offline access</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="sync" size={24} color={colors.info} />
                    <Text style={styles.featureText}>Seamless integration with current subscription</Text>
                </View>
                </View>

                {/* Price */}
                <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>One-time Addition Fee</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>${additionalLanguagePrice}</Text>
                    <Text style={styles.pricePeriod}>per language</Text>
                </View>
                </View>

                {/* Important Notes */}
                <View style={styles.notesCard}>
                <View style={styles.noteHeader}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.noteTitle}>Important Information</Text>
                </View>
                <Text style={styles.noteText}>
                    • This language will be added to your existing subscription{'\n'}
                    • No changes to your current subscription period{'\n'}
                    • Access starts immediately after payment{'\n'}
                    • Billed as one-time payment of ${additionalLanguagePrice}
                </Text>
                </View>

                {/* Purchase Button */}
                <TouchableOpacity
                style={[styles.purchaseButton, loading && styles.buttonDisabled]}
                onPress={handlePaymentWithPaymentIntent}
                disabled={loading}
                activeOpacity={0.8}
                >
                <LinearGradient
                    colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                >
                    {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                    <>
                        <Ionicons name="cart" size={24} color="#FFFFFF" />
                        <Text style={styles.purchaseButtonText}>
                        Add {language} for ${additionalLanguagePrice}
                        </Text>
                    </>
                    )}
                </LinearGradient>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.push(`/(rhapsodylanguages)/(drawer)/regions/list` as any)}
                activeOpacity={0.8}
                >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
                </TouchableOpacity>
            </View>
            </View>

            {/* Security Footer */}
            <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.footerText}>
                Secure payment powered by Stripe
            </Text>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

    const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
    },
    currentSubCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    subDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    languageCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: {
        width: 0,
        height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    gradientHeader: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    languageTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    cardContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    featuresList: {
        gap: 16,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
    priceCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.primary,
    },
    pricePeriod: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 6,
    },
    notesCard: {
        backgroundColor: colors.info + '10',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.info + '30',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.info,
    },
    noteText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    cardSection: {
        marginBottom: 24,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    cardFieldContainer: {
        height: 50,
        marginVertical: 8,
    },
    cardInput: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 16,
        color: colors.text,
    },
    purchaseButton: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: {
        width: 0,
        height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 12,
    },
    purchaseButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: colors.textLight,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 14,
        color: colors.textLight,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 18,
        color: colors.text,
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    });
