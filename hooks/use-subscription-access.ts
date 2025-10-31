import { useAuth } from '@/contexts';
import { SubscriptionAccessService } from '@/services/subscriptionAccess';
import type { RhapsodyLanguage } from '@/types';
import { useMemo } from 'react';

/**
 * Custom hook for subscription access control
 * Provides easy access to subscription-related permissions and utilities
 */
export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  
  const accessInfo = useMemo(() => {
    return {
      // Basic access checks
      isAuthenticated: !!user,
      hasSubscription: user?.subscription?.status === 'active',
      isPaidSubscriber: user?.subscription && 
        ['standard', 'basic', 'premium'].includes(user.subscription.category),
      isFreeUser: user?.subscription?.category === 'free',
      
      // Subscription details
      subscriptionCategory: user?.subscription?.category,
      subscriptionStatus: user?.subscription?.status,
      languageCodes: SubscriptionAccessService.getUserLanguageCodes(user),
      
      // Utility flags
      shouldShowUpgradePrompt: SubscriptionAccessService.shouldShowUpgradePrompt(user),
    };
  }, [user]);
  
  // Check access to a specific language
  const hasLanguageAccess = (language: RhapsodyLanguage | { type?: 'open' | 'subscription'; value?: string }) => {
    return SubscriptionAccessService.hasLanguageAccess(user, language);
  };
  
  // Filter languages based on access
  const filterAccessibleLanguages = (languages: RhapsodyLanguage[]) => {
    return SubscriptionAccessService.filterAccessibleLanguages(user, languages);
  };
  
  // Get access message for a language
  const getAccessMessage = (language: RhapsodyLanguage | { type?: 'open' | 'subscription' }) => {
    return SubscriptionAccessService.getAccessMessage(user, language);
  };
  
  // Check if specific language code is accessible
  const hasLanguageCodeAccess = (languageCode: string) => {
    return SubscriptionAccessService.hasSubscriptionAccess(user, languageCode);
  };
  
  return {
    ...accessInfo,
    hasLanguageAccess,
    filterAccessibleLanguages,
    getAccessMessage,
    hasLanguageCodeAccess,
    user,
  };
};