import { useAuth, useSubscription } from '@/contexts';
import { RhapsodyLanguage } from '@/types';
import React, { useMemo } from 'react';

export interface ContentAccessResult {
  hasAccess: boolean;
  reason: 'open' | 'subscribed' | 'no-subscription' | 'not-included';
  requiresSubscription: boolean;
  shouldShowPurchaseOption: boolean;
  message?: string;
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
}

/**
 * Centralized subscription service hook
 * Handles all content protection and subscription validation logic
 */
export const useSubscriptionService = (): SubscriptionService => {
  const { user } = useAuth();
  const { hasSubscription, subscriptionDetails } = useSubscription();

  const service = useMemo<SubscriptionService>(() => {
    /**
     * Check if user has access to a specific language
     */
    const checkLanguageAccess = (language: RhapsodyLanguage): ContentAccessResult => {
      // If language is open, everyone has access
      if (language.type === 'open') {
        return {
          hasAccess: true,
          reason: 'open',
          requiresSubscription: false,
          shouldShowPurchaseOption: false,
          message: 'This language is available to everyone'
        };
      }

      // If language requires subscription
      if (language.type === 'subscription') {
        // Check if user has any subscription
        if (!hasSubscription || !subscriptionDetails) {
          return {
            hasAccess: false,
            reason: 'no-subscription',
            requiresSubscription: true,
            shouldShowPurchaseOption: true,
            message: 'This language requires a subscription. Subscribe to get access.'
          };
        }

        // Check if user is on free trial
        if (subscriptionDetails.status === 'free trial') {
          const trialEndDate = new Date('2025-12-31T23:59:59');
          const now = new Date();
          
          if (now <= trialEndDate) {
            // Free trial gives access to ALL languages
            return {
              hasAccess: true,
              reason: 'subscribed',
              requiresSubscription: true,
              shouldShowPurchaseOption: false,
              message: 'You have access through your free trial (ends Dec 31, 2025)'
            };
          } else {
            return {
              hasAccess: false,
              reason: 'no-subscription',
              requiresSubscription: true,
              shouldShowPurchaseOption: true,
              message: 'Your free trial has expired. Subscribe to continue accessing this language.'
            };
          }
        }

        // Check if subscription is active
        if (subscriptionDetails.status !== 'active') {
          return {
            hasAccess: false,
            reason: 'no-subscription',
            requiresSubscription: true,
            shouldShowPurchaseOption: true,
            message: `Your subscription is ${subscriptionDetails.status}. Please renew to access this language.`
          };
        }

        // Check if the specific language is included in user's subscription
        // Support wildcard '*' or 'all' for unlimited access plans
        const hasWildcard = subscriptionDetails.language?.includes('*') || 
                           subscriptionDetails.language?.includes('all');
        const isLanguageIncluded = hasWildcard || 
                                  subscriptionDetails.language?.includes(language.label) || 
                                  false;
        
        if (isLanguageIncluded) {
          return {
            hasAccess: true,
            reason: 'subscribed',
            requiresSubscription: true,
            shouldShowPurchaseOption: false,
            message: 'You have access to this language through your subscription'
          };
        } else {
          return {
            hasAccess: false,
            reason: 'not-included',
            requiresSubscription: true,
            shouldShowPurchaseOption: true,
            message: 'This language is not included in your current subscription. You can purchase access to this language.'
          };
        }
      }

      // Default fallback (shouldn't happen with proper typing)
      return {
        hasAccess: false,
        reason: 'no-subscription',
        requiresSubscription: true,
        shouldShowPurchaseOption: true,
        message: 'Access requirements unclear'
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
        } else if (access.reason === 'subscribed') {
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
      return access.shouldShowPurchaseOption;
    };

    return {
      checkLanguageAccess,
      canAccessContent,
      getAccessibilityInfo,
      shouldShowSubscriptionPrompt
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
        primary: colors.primary || '#3B82F6',
        background: colors.primaryBackground || '#EBF4FF',
        text: colors.primaryText || '#1E40AF'
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