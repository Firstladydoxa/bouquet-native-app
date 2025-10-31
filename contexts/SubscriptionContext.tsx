import { useAuth, useUser } from '@/contexts';
import { PaymentApi } from '@/services/paymentApi';
import type { PaymentHistoryResponse, SubscriptionDetails } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SubscriptionContextType {
  hasSubscription: boolean; // True for paid subscriptions (standard, basic, premium)
  hasPaidSubscription: boolean; // Alias for hasSubscription for clarity
  hasAccess: boolean; // True for any active subscription (including free)
  hasFreeTrialActive: boolean; // True if user has active free trial
  subscriptionDetails: SubscriptionDetails | null;
  paymentHistory: PaymentHistoryResponse | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  refreshPaymentHistory: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {

  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [hasSubscription, setHasSubscription] = useState(false); // Paid subscriptions only
  const [hasAccess, setHasAccess] = useState(false); // Any active subscription including free
  const [hasFreeTrialActive, setHasFreeTrialActive] = useState(false); // Active free trial
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has an active subscription
  const checkSubscriptionStatus = () => {
    console.log('Checking subscription status with user:', { 
      user: user ? { id: user.id, subscription: user.subscription } : null 
    });
    
    if (!user) {
      console.log('No user available for subscription check');
      setHasSubscription(false);
      return;
    }

    // Check if user has subscription object and what category it is
    // Free subscriptions (category: 'free') are considered free access
    // Paid subscriptions (category: 'standard', 'basic', 'premium') are considered paid plans
    const userHasSubscription = !!(
      user.subscription && 
      typeof user.subscription === 'object' && 
      user.subscription.status === 'active' &&
      ['standard', 'basic', 'premium'].includes(user.subscription.category)
    );
    
    // User always has access (either free or paid subscription)
    // Free users have category 'free', paid users have 'standard', 'basic', or 'premium'
    const userHasAccess = !!(
      user.subscription && 
      typeof user.subscription === 'object' && 
      user.subscription.status === 'active'
    );
    
    // Check if user has active free trial
    const userHasFreeTrialActive = !!(
      user.subscription &&
      typeof user.subscription === 'object' &&
      (user.subscription.status === 'free_trial' || user.subscription.category === 'free_trial') &&
      user.subscription.status === 'active'
    );
    
    setHasSubscription(userHasSubscription);
    setHasAccess(userHasAccess);
    setHasFreeTrialActive(userHasFreeTrialActive);
    
    // If user has subscription object, use it directly (regardless of category)
    if (userHasAccess && user.subscription) {
      setSubscriptionDetails(user.subscription);
    } else {
      setSubscriptionDetails(null);
    }
    
    console.log('Subscription status check:', {
      userId: user.id,
      subscription: user.subscription,
      category: user.subscription?.category,
      hasSubscription: userHasSubscription,
      hasAccess: userHasAccess
    });
  };

  // Fetch subscription details (this would be from your backend)
  const fetchSubscriptionDetails = async () => {
    if (!hasSubscription || !user || !user.subscription) return;

    try {
      // Subscription details are already set in checkSubscriptionStatus
      // This method can be used for additional processing if needed
      console.log('Subscription details already available from user object');
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      setError('Failed to load subscription details');
    }
  };

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    if (!hasSubscription || !user) {
      console.log('Skipping payment history fetch - no subscription or user:', { hasSubscription, user: !!user });
      return;
    }

    //if (!user.id || typeof user.id !== 'string' || user.id.trim() === '') {console.error('Invalid user ID:', user.id); setError('Invalid user ID'); return;}

    try {
      console.log('Fetching payment history for user:', user.id);
      const token = await getToken();
      console.log('Token obtained:', !!token);
      
      const history = await PaymentApi.fetchPaymentHistory({ user_id: String(user.id) }, token); // Convert number to string
      console.log('Payment history fetched:', history);
      setPaymentHistory(history);

    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      setError(error.message || 'Failed to load payment history');
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      checkSubscriptionStatus();
      if (hasSubscription) {
        await fetchSubscriptionDetails();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to refresh subscription');
    } finally {
      setLoading(false);
    }
  };

  // Refresh payment history
  const refreshPaymentHistory = async () => {
    setError(null);
    
    try {
      await fetchPaymentHistory();
    } catch (error: any) {
      setError(error.message || 'Failed to refresh payment history');
    }
  };

  // Initialize subscription data when user is loaded
  useEffect(() => {
    console.log('Subscription context useEffect triggered:', { 
      userLoaded, 
      userId: user?.id, 
      userSubscription: user?.subscription 
    });
    
    if (userLoaded) {
      setLoading(true);
      checkSubscriptionStatus();
    }
  }, [userLoaded, user?.subscription]);

  // Fetch additional data when subscription status changes
  useEffect(() => {
    console.log('Subscription data fetch useEffect triggered:', { 
      userLoaded, 
      hasSubscription, 
      userId: user?.id 
    });
    
    if (userLoaded && hasSubscription) {
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchSubscriptionDetails(),
            fetchPaymentHistory(),
          ]);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [hasSubscription, userLoaded]);

  const value: SubscriptionContextType = {
    hasSubscription,
    hasPaidSubscription: hasSubscription, // Alias for clarity
    hasAccess,
    hasFreeTrialActive,
    subscriptionDetails,
    paymentHistory,
    loading,
    error,
    refreshSubscription,
    refreshPaymentHistory,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;