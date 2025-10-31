import { useAuth } from '@/contexts/AuthContext';
import useCustomNotification from '@/hooks/use-custom-notification';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { PaymentApi } from '@/services/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomNotification from './CustomNotification';

export interface StartFreeTrialButtonProps {
  onSuccess?: () => void;
  style?: any;
  text?: string;
  redirectToSubscriptions?: boolean;
  variant?: 'gradient' | 'white'; // Add variant prop
}

/**
 * StartFreeTrialButton Component
 * Handles promotional free trial activation based on SUBSCRIPTION_SYSTEM_GUIDE.md
 * Calls /api/subscription/activate-free-trial endpoint
 * 
 * @param variant - 'gradient' (default) or 'white' button style
 */
const StartFreeTrialButton: React.FC<StartFreeTrialButtonProps> = ({
  onSuccess,
  style,
  text = "Start Free Trial",
  redirectToSubscriptions = true,
  variant = 'gradient'
}) => {
  const colors = useThemeColors();
  const { user, token, refreshUser } = useAuth();
  const { notification, showSuccess, showError, hideNotification } = useCustomNotification();
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

  const activateFreeTrial = async () => {
    if (!user || !token) {
      showError('Authentication required', 'Please sign in to start your free trial.');
      return;
    }

    setLoading(true);

    try {
      console.log('[StartFreeTrial] Attempting to activate free trial...');
      console.log('[StartFreeTrial] User ID:', user.id);
      console.log('[StartFreeTrial] Token available:', !!token);

      // Call the activate free trial endpoint
      // According to SUBSCRIPTION_SYSTEM_GUIDE.md, the endpoint only needs the auth token
      const result = await PaymentApi.activateFreeTrial(token);

      console.log('[StartFreeTrial] Activation result:', result);

      // Check if activation was successful
      if (!result?.success) {
        const errorMsg = typeof result?.message === 'string' 
          ? result.message 
          : 'Failed to activate free trial';
        throw new Error(errorMsg);
      }

      // Success - Free trial is active
      console.log('[StartFreeTrial] Free trial activated successfully:', result);

      // Show success message
      showSuccess(
        'Free Trial Activated! 🎉',
        'You now have access to all premium languages until December 31, 2025!'
      );

      // Refresh user data BEFORE calling onSuccess or redirecting
      console.log('[StartFreeTrial] Refreshing user data...');
      try {
        await refreshUser();
        console.log('[StartFreeTrial] User data refreshed successfully');
      } catch (err) {
        console.error('[StartFreeTrial] Failed to refresh user data:', err);
      }

      // Call success callback after refresh (for immediate UI updates with fresh data)
      if (onSuccess) {
        onSuccess();
      }

      // If redirecting, do it after a short delay to let user see success message
      if (redirectToSubscriptions) {
        setTimeout(() => {
          setLoading(false); // Stop loading before redirect
          hideNotification();
          router.replace('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/manage');
        }, 1500);
      } else {
        // Not redirecting - hide notification after delay
        setTimeout(() => {
          hideNotification();
        }, 3000);
        setLoading(false); // Stop loading immediately if not redirecting
      }

    } catch (error: any) {
      console.error('[StartFreeTrial] Error:', error);
      setLoading(false); // Stop loading on error
      showError(
        'Activation Failed',
        error.message || 'Failed to activate free trial. Please try again.'
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={activateFreeTrial}
        disabled={loading}
        activeOpacity={0.8}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[colors.primary || '#007AFF', colors.secondary || '#00C853']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.text}>🎁 {text}</Text>
                <Text style={styles.subtext}>Until Dec 31, 2025</Text>
              </>
            )}
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.whiteGradient}
          >
            {loading ? (
              <View style={styles.whiteLoadingContent}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.whiteLoadingText, { color: colors.primary }]}>Activating...</Text>
              </View>
            ) : (
              <View style={styles.whiteButtonContent}>
                <Ionicons name="gift" size={20} color={colors.primary} />
                <Text style={[styles.whiteText, { color: colors.primary }]}>🎁 {text}</Text>
                <Text style={[styles.whiteSubtext, { color: colors.textLight }]}>Until Dec 31, 2025</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </View>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>

      <CustomNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        actions={notification.actions}
      />
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  whiteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  whiteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whiteLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whiteLoadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  whiteText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  whiteSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default StartFreeTrialButton;