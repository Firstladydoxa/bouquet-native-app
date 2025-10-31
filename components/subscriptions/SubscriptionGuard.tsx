import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import type { RhapsodyLanguage } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  language?: RhapsodyLanguage | { type?: 'open' | 'subscription'; value?: string };
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
  onUpgradePress?: () => void;
}

/**
 * Subscription Guard Component
 * Conditionally renders content based on subscription access
 * Shows appropriate fallback UI for unauthorized access
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  language,
  fallbackMessage,
  showUpgradeButton = true,
  onUpgradePress,
}) => {
  const {
    isAuthenticated,
    hasLanguageAccess,
    getAccessMessage,
    shouldShowUpgradePrompt,
  } = useSubscriptionAccess();

  // If no language specified, check general authentication
  if (!language) {
    if (!isAuthenticated) {
      return (
        <SubscriptionFallback
          message="Please sign in to access this content"
          actionText="Sign In"
          onActionPress={() => router.push('/(auth)/sign-in')}
        />
      );
    }
    return <>{children}</>;
  }

  // Check specific language access
  const hasAccess = hasLanguageAccess(language);
  const accessInfo = getAccessMessage(language);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show appropriate fallback based on access info
  return (
    <SubscriptionFallback
      message={fallbackMessage || accessInfo.message}
      actionText={
        accessInfo.actionRequired === 'login' 
          ? 'Sign In'
          : showUpgradeButton && shouldShowUpgradePrompt
          ? 'Upgrade Subscription'
          : undefined
      }
      onActionPress={
        accessInfo.actionRequired === 'login'
          ? () => router.push('/(auth)/sign-in')
          : onUpgradePress || (() => router.push('/subscription/plans' as any))
      }
      showUpgradeButton={showUpgradeButton && shouldShowUpgradePrompt}
    />
  );
};

interface SubscriptionFallbackProps {
  message: string;
  actionText?: string;
  onActionPress?: () => void;
  showUpgradeButton?: boolean;
}

const SubscriptionFallback: React.FC<SubscriptionFallbackProps> = ({
  message,
  actionText,
  onActionPress,
  showUpgradeButton = false,
}) => {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={showUpgradeButton ? "diamond-outline" : "lock-closed-outline"} 
          size={64} 
          color="#ccc" 
        />
      </View>
      
      <Text style={styles.fallbackMessage}>{message}</Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity 
          style={[
            styles.actionButton,
            showUpgradeButton && styles.upgradeButton
          ]} 
          onPress={onActionPress}
        >
          <Text style={[
            styles.actionButtonText,
            showUpgradeButton && styles.upgradeButtonText
          ]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9f9f9',
  },
  iconContainer: {
    marginBottom: 24,
  },
  fallbackMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});