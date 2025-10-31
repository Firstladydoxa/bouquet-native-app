import { useAuth } from '@/contexts/AuthContext';
import useCustomNotification from '@/hooks/use-custom-notification';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { PaymentApi } from '@/services/paymentApi';
import { FreeTrialWidgetProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomNotification from './CustomNotification';

const FreeTrialWidget: React.FC<FreeTrialWidgetProps> = ({
    packageId,
    priceId,
    onSuccess,
    style
}) => {
    const { user, token, refreshUser } = useAuth();
    const colors = useThemeColors();
    const { notification, showSuccess, showError, hideNotification } = useCustomNotification();
    const [loading, setLoading] = useState(false);

    const handleStartFreeTrial = async () => {
        if (!user) {
            showError('Authentication Required', 'Please sign in to start free trial');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                userId: user.id.toString(),
                packageId: packageId,
                language: '[*]', // Wildcard for all languages
                priceId: priceId,
                amount: 0,
                currency: 'usd',
                method: 'No payment',
                type: 'free_trial' as const
            };

            console.log('Starting free trial with payload:', payload);

            const result = await PaymentApi.activateFreeTrial(token);

            console.log('Free trial activation result:', result);

            if (result.success) {
                // Show success message first
                showSuccess(
                    'Free Trial Activated! 🎉',
                    'You now have access to all languages until December 31, 2025.'
                );
                
                // Call success callback immediately for UI updates
                if (onSuccess) {
                    onSuccess();
                }
                
                // Refresh user data in background
                refreshUser().then(() => {
                    console.log('[FreeTrialWidget] User data refreshed');
                }).catch(err => {
                    console.error('[FreeTrialWidget] Failed to refresh user data:', err);
                });
                
                // Hide notification after user has time to read it
                setTimeout(() => {
                    hideNotification();
                }, 2000);
            } else {
                throw new Error(result.message?.text || 'Failed to activate free trial');
            }
        } catch (error: any) {
            console.error('Free trial activation error:', error);
            showError(
                'Activation Failed',
                error.message || 'Failed to activate free trial. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const styles = createStyles(colors);

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={[colors.secondary + '20', colors.primary + '10']}
                style={styles.gradientBackground}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="gift-outline" size={40} color={colors.primary} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Start Free Trial
                </Text>

                <Text style={[styles.subtitle, { color: colors.textLight }]}>
                    Get full access to all languages until December 31, 2025.
                </Text>

                <View style={styles.benefitContainer}>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.benefitText, { color: colors.textLight }]}>
                            No payment required!
                        </Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.benefitText, { color: colors.textLight }]}>
                            Access to 8000+ languages
                        </Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.benefitText, { color: colors.textLight }]}>
                            Daily Rhapsody reading
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.trialButton}
                    onPress={handleStartFreeTrial}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary || colors.primary]}
                        style={styles.buttonGradient}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.buttonText}>Activating...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Start Free Trial</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={[styles.disclaimer, { color: colors.textLight }]}>
                    No credit card required • Cancel anytime
                </Text>
            </LinearGradient>

            <CustomNotification
                visible={notification.visible}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={hideNotification}
                actions={notification.actions}
            />
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: colors.shadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    gradientBackground: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    benefitContainer: {
        width: '100%',
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    benefitText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    trialButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default FreeTrialWidget;