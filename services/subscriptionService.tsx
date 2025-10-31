import { useAuth, useSubscription } from '@/contexts';
import { RhapsodyLanguage } from '@/types';
import React, { useMemo } from 'react';

export interface ContentAccessResult {
  hasAccess: boolean;
  reason: 'open' | 'free-trial' | 'always-free' | 'subscribed' | 'no-subscription' | 'not-included';
  requiresSubscription: boolean;
  shouldShowPurchaseOption: boolean;
  shouldShowFreeTrialOption: boolean;
  message?: string;
  actionText?: string;
}

export interface SubscriptionService {
  checkLanguageAccess: (language: RhapsodyLanguage) => ContentAccessResult;
  canAccessContent: (languageType: 'open' | 'subscription', languageLabel?: string) => boolean;
  getAccessibilityInfo: (languages: RhapsodyLanguage[]) => {
    open: RhapsodyLanguage[];
    subscribed: RhapsodyLanguage[];
    restricted: RhapsodyLanguage[];
  };
  shouldShowSubscriptionPrompt: (language: RhapsodyLanguage) => boolean;
  isEligibleForFreeTrial: () => boolean;
  isFreeTrialActive: () => boolean;
  isPromotionalPeriodActive: () => boolean;
  getSubscriptionCategory: () => 'free' | 'free_trial' | 'basic' | 'standard' | 'premium';
}

/**
 * Centralized subscription service hook
 * Handles all content protection and subscription validation logic
 * Updated to match SUBSCRIPTION_SYSTEM_GUIDE.md specifications
 */
export const useSubscriptionService = (): SubscriptionService => {
  const { user } = useAuth();
  const { hasSubscription, subscriptionDetails } = useSubscription();

  const service = useMemo<SubscriptionService>(() => {
    
    /**
     * Check if promotional free trial period is still active
     */
    const isPromotionalPeriodActive = (): boolean => {
      const promotionEndDate = new Date('2025-12-31T23:59:59');
      const now = new Date();
      return now <= promotionEndDate;
    };

    /**
     * Get user's subscription category based on backend patterns
     */
    const getSubscriptionCategory = (): 'free' | 'free_trial' | 'basic' | 'standard' | 'premium' => {
      if (!subscriptionDetails) return 'free';
      
      // Check for free trial pattern
      if (subscriptionDetails.category === 'free_trial' || 
          subscriptionDetails.language?.includes('*')) {
        return 'free_trial';
      }
      
      // Check for always free pattern
      if (subscriptionDetails.category === 'free' || 
          subscriptionDetails.language?.includes('@free')) {
        return 'free';
      }
      
      // Return specific paid category
      return subscriptionDetails.category as 'basic' | 'standard' | 'premium';
    };

    /**
     * Check if user is eligible for free trial
     */
    const isEligibleForFreeTrial = (): boolean => {
      const category = getSubscriptionCategory();
      return category === 'free' && isPromotionalPeriodActive();
    };

    /**
     * Check if user has active free trial
     */
    const isFreeTrialActive = (): boolean => {
      const category = getSubscriptionCategory();
      if (category !== 'free_trial') return false;
      
      // Check if trial hasn't expired
      const trialEndDate = new Date('2025-12-31T23:59:59');
      const now = new Date();
      return now <= trialEndDate;
    };

    /**
     * Check if user has access to a specific language
     * Based on SUBSCRIPTION_SYSTEM_GUIDE.md patterns
     */
    const checkLanguageAccess = (language: RhapsodyLanguage): ContentAccessResult => {
      // If language is open/free, everyone has access
      if (language.type === 'open') {
        return {
          hasAccess: true,
          reason: 'open',
          requiresSubscription: false,
          shouldShowPurchaseOption: false,
          shouldShowFreeTrialOption: false,
          message: 'This language is available to everyone',
          actionText: undefined
        };
      }

      // If language requires subscription (premium language)
      if (language.type === 'subscription') {
        const category = getSubscriptionCategory();
        
        // FREE TRIAL USERS - ["*"] pattern - access to all languages
        if (category === 'free_trial' && isFreeTrialActive()) {
          return {
            hasAccess: true,
            reason: 'free-trial',
            requiresSubscription: false,
            shouldShowPurchaseOption: false,
            shouldShowFreeTrialOption: false,
            message: 'You have access through your free trial (ends Dec 31, 2025)',
            actionText: undefined
          };
        }

        // ALWAYS FREE USERS - ["@free"] pattern - no access to premium
        if (category === 'free') {
          if (isEligibleForFreeTrial()) {
            return {
              hasAccess: false,
              reason: 'always-free',
              requiresSubscription: true,
              shouldShowPurchaseOption: false,
              shouldShowFreeTrialOption: true,
              message: 'This is a premium language, but there\'s a promotional Free Trial running now till December 31st that gives access to all free + premium languages.',
              actionText: 'Start Free Trial'
            };
          } else {
            return {
              hasAccess: false,
              reason: 'always-free',
              requiresSubscription: true,
              shouldShowPurchaseOption: true,
              shouldShowFreeTrialOption: false,
              message: 'This is a premium language. Upgrade your subscription to get access.',
              actionText: 'Upgrade Subscription'
            };
          }
        }

        // PAID SUBSCRIPTION USERS - specific language arrays
        if (category === 'basic' || category === 'standard' || category === 'premium') {
          // Check if subscription is active
          if (subscriptionDetails?.status !== 'active') {
            return {
              hasAccess: false,
              reason: 'no-subscription',
              requiresSubscription: true,
              shouldShowPurchaseOption: true,
              shouldShowFreeTrialOption: false,
              message: `Your subscription is ${subscriptionDetails?.status}. Please renew to access this language.`,
              actionText: 'Renew Subscription'
            };
          }

          // Check if language is included in subscription
          const isLanguageIncluded = subscriptionDetails?.language?.includes(language.label) || false;
          
          if (isLanguageIncluded) {
            return {
              hasAccess: true,
              reason: 'subscribed',
              requiresSubscription: false,
              shouldShowPurchaseOption: false,
              shouldShowFreeTrialOption: false,
              message: 'You have access to this language through your subscription',
              actionText: undefined
            };
          } else {
            return {
              hasAccess: false,
              reason: 'not-included',
              requiresSubscription: true,
              shouldShowPurchaseOption: true,
              shouldShowFreeTrialOption: false,
              message: 'This language is not included in your subscription, but you can purchase it as an additional language that will be added to your subscription.',
              actionText: 'Add Additional Language'
            };
          }
        }

        // No subscription at all
        return {
          hasAccess: false,
          reason: 'no-subscription',
          requiresSubscription: true,
          shouldShowPurchaseOption: true,
          shouldShowFreeTrialOption: isEligibleForFreeTrial(),
          message: isEligibleForFreeTrial() 
            ? 'This language requires a subscription. Start your free trial to get access to all languages.'
            : 'This language requires a subscription. Subscribe to get access.',
          actionText: isEligibleForFreeTrial() ? 'Start Free Trial' : 'Subscribe Now'
        };
      }

      // Default fallback
      return {
        hasAccess: false,
        reason: 'no-subscription',
        requiresSubscription: true,
        shouldShowPurchaseOption: true,
        shouldShowFreeTrialOption: false,
        message: 'Access requirements unclear',
        actionText: 'Get Access'
      };
    };

    /**
     * Simple check if user can access content based on type and language
     */
    const canAccessContent = (languageType: 'open' | 'subscription', languageLabel?: string): boolean => {
      if (languageType === 'open') {
        return true;
      }

      if (languageType === 'subscription') {
        const category = getSubscriptionCategory();
        
        // Free trial has access to all
        if (category === 'free_trial' && isFreeTrialActive()) {
          return true;
        }
        
        // Always free has no access to premium
        if (category === 'free') {
          return false;
        }
        
        // Paid subscriptions - check specific language
        if (!hasSubscription || !subscriptionDetails) {
          return false;
        }

        if (!languageLabel) {
          // If no specific language provided, just check if user has any subscription
          return true;
        }

        // Check if specific language is included
        return subscriptionDetails.language?.includes(languageLabel) || false;
      }

      return false;
    };

    /**
     * Categorize languages based on user's access rights
     */
    const getAccessibilityInfo = (languages: RhapsodyLanguage[]) => {
      const open: RhapsodyLanguage[] = [];
      const subscribed: RhapsodyLanguage[] = [];
      const restricted: RhapsodyLanguage[] = [];

      languages.forEach(language => {
        const access = checkLanguageAccess(language);
        
        if (access.reason === 'open') {
          open.push(language);
        } else if (access.hasAccess) {
          subscribed.push(language);
        } else {
          restricted.push(language);
        }
      });

      return { open, subscribed, restricted };
    };

    /**
     * Determine if subscription prompt should be shown for a language
     */
    const shouldShowSubscriptionPrompt = (language: RhapsodyLanguage): boolean => {
      const access = checkLanguageAccess(language);
      return access.shouldShowPurchaseOption || access.shouldShowFreeTrialOption;
    };

    return {
      checkLanguageAccess,
      canAccessContent,
      getAccessibilityInfo,
      shouldShowSubscriptionPrompt,
      isEligibleForFreeTrial,
      isFreeTrialActive,
      isPromotionalPeriodActive,
      getSubscriptionCategory
    };
  }, [hasSubscription, subscriptionDetails, user]);

  return service;
};

/**
 * HOC to wrap components that need subscription protection
 */
export const withSubscriptionProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredLanguage?: string
) => {
  return (props: P) => {
    const subscriptionService = useSubscriptionService();
    
    // You can add additional protection logic here if needed
    // For example, redirect to subscription page if access is denied
    
    return <Component {...props} subscriptionService={subscriptionService} />;
  };
};

/**
 * Utility function to get subscription status message
 */
export const getSubscriptionStatusMessage = (hasSubscription: boolean, language?: string): string => {
  if (!hasSubscription) {
    return 'Subscribe to access premium languages and content';
  }
  
  if (language) {
    return `Your subscription includes access to ${language}`;
  }
  
  return 'You have an active subscription';
};

/**
 * Content access levels for UI components
 */
export enum ContentAccessLevel {
  OPEN = 'open',
  SUBSCRIBED = 'subscribed',
  RESTRICTED = 'restricted'
}

/**
 * Get appropriate UI colors based on access level
 */
export const getAccessLevelColors = (level: ContentAccessLevel, colors: any) => {
  switch (level) {
    case ContentAccessLevel.OPEN:
      return {
        primary: colors.success || '#4CAF50',
        background: colors.successBackground || '#E8F5E8',
        text: colors.successText || '#2E7D32'
      };
    case ContentAccessLevel.SUBSCRIBED:
      return {
        primary: colors.success || '#10B981', // Changed to green
        background: colors.successBackground || '#ECFDF5', // Light green background
        text: colors.successText || '#047857' // Dark green text
      };
    case ContentAccessLevel.RESTRICTED:
      return {
        primary: colors.warning || '#FF9800',
        background: colors.warningBackground || '#FFF8E1',
        text: colors.warningText || '#F57C00'
      };
    default:
      return {
        primary: colors.text || '#000000',
        background: colors.background || '#FFFFFF',
        text: colors.text || '#000000'
      };
  }
};