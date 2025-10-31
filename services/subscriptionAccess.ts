import type { RhapsodyLanguage, User } from '@/types';

/**
 * Subscription Access Control Service
 * Handles language access permissions based on user subscription status
 */
export class SubscriptionAccessService {
  
  /**
   * Check if user has access to a specific language based on their subscription
   */
  static hasLanguageAccess(
    user: User | null, 
    language: RhapsodyLanguage | { type?: 'open' | 'subscription'; value?: string }
  ): boolean {
    // No user means no access
    if (!user) {
      return false;
    }
    
    // Open languages are available to all authenticated users
    if (language.type === 'open') {
      return true;
    }
    
    // For subscription-only languages, check user's subscription
    if (language.type === 'subscription') {
      return this.hasSubscriptionAccess(user, language.value);
    }
    
    // Default: if type is not specified, assume subscription required
    return this.hasSubscriptionAccess(user, language.value);
  }
  
  /**
   * Check if user has subscription access to a specific language code
   */
  static hasSubscriptionAccess(user: User | null, languageCode?: string): boolean {
    if (!user || !user.subscription) {
      return false;
    }
    
    const subscription = user.subscription;
    
    // Check if subscription is active
    if (subscription.status !== 'active') {
      return false;
    }
    
    // Free users only have access to free content (handled by language.type === 'open')
    if (subscription.category === 'free') {
      return false; // Free users should only access 'open' type languages
    }
    
    // Paid subscribers (standard, basic, premium) have access based on their language array
    if (['standard', 'basic', 'premium'].includes(subscription.category)) {
      // If no specific language code provided, grant access to paid subscribers
      if (!languageCode) {
        return true;
      }
      
      // Check if the specific language is in their subscription
      return subscription.language.includes(languageCode);
    }
    
    return false;
  }
  
  /**
   * Filter languages array based on user's subscription access
   */
  static filterAccessibleLanguages(
    user: User | null, 
    languages: RhapsodyLanguage[]
  ): RhapsodyLanguage[] {
    if (!user) {
      return [];
    }
    
    return languages.filter(language => this.hasLanguageAccess(user, language));
  }
  
  /**
   * Get subscription status message for display to users
   */
  static getAccessMessage(
    user: User | null, 
    language: RhapsodyLanguage | { type?: 'open' | 'subscription' }
  ): { hasAccess: boolean; message: string; actionRequired?: 'login' | 'upgrade' } {
    if (!user) {
      return {
        hasAccess: false,
        message: 'Please sign in to access this content',
        actionRequired: 'login'
      };
    }
    
    if (language.type === 'open') {
      return {
        hasAccess: true,
        message: 'This content is freely available'
      };
    }
    
    if (!user.subscription) {
      return {
        hasAccess: false,
        message: 'Subscription required to access this content',
        actionRequired: 'upgrade'
      };
    }
    
    const subscription = user.subscription;
    
    if (subscription.status !== 'active') {
      return {
        hasAccess: false,
        message: 'Your subscription is not active. Please renew your subscription.',
        actionRequired: 'upgrade'
      };
    }
    
    if (subscription.category === 'free') {
      return {
        hasAccess: false,
        message: 'Upgrade to a paid subscription to access this premium content',
        actionRequired: 'upgrade'
      };
    }
    
    return {
      hasAccess: true,
      message: `You have access with your ${subscription.category} subscription`
    };
  }
  
  /**
   * Check if user should see upgrade prompts
   */
  static shouldShowUpgradePrompt(user: User | null): boolean {
    if (!user || !user.subscription) {
      return true;
    }
    
    return user.subscription.category === 'free';
  }
  
  /**
   * Get user's accessible language codes
   */
  static getUserLanguageCodes(user: User | null): string[] {
    if (!user || !user.subscription || user.subscription.status !== 'active') {
      return [];
    }
    
    return user.subscription.language || [];
  }
}