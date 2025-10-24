import { useAuth, useUser } from '@/contexts';
import { PaymentApi } from '@/services/paymentApi';
import type { PaymentHistoryResponse, SubscriptionDetails } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SubscriptionContextType {
  hasSubscription: boolean;
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
  
  const [hasSubscription, setHasSubscription] = useState(false);
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

    // Check if user has subscription object and it's active
    const userHasSubscription = !!(
      user.subscription && 
      typeof user.subscription === 'object' && 
      user.subscription.status === 'active'
    );
    setHasSubscription(userHasSubscription);
    
    // If user has subscription object, use it directly
    if (userHasSubscription && user.subscription) {
      setSubscriptionDetails(user.subscription);
    } else {
      setSubscriptionDetails(null);
    }
    
    console.log('Subscription status check:', {
      userId: user.id,
      subscription: user.subscription,
      hasSubscription: userHasSubscription
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
      
      const history = await PaymentApi.fetchPaymentHistory({ user_id: user.id }, token);
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