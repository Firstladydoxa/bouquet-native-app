// Payment API Service for handling Stripe payment operations

import type { ApiResponse, Language, PaymentHistoryResponse, PaymentIntentRequest, PaymentIntentResponse, SubscriptionDetails } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://mediathek.tniglobal.org/api';

export const PaymentApi = {
  /**
   * Fetch available languages from backend
   * @param token Authentication token
   * @returns Array of available languages
   */
  fetchLanguages: async (token: string | null): Promise<Language[]> => {
    try {
      console.log('Fetching languages from:', `${API_BASE_URL}/getRhapsodySubscriptionLanguages`);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE_URL}/getRhapsodySubscriptionLanguages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log('Fetch Languages Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Language Fetch Error Data:', errorData);
        throw new Error(errorData.message?.text || errorData.message || 'Failed to fetch languages');
      }

      const jsonData = await response.json();
      console.log('Languages fetched successfully:', jsonData.data?.length || 0, 'languages');
      return jsonData.data as Language[];
    } catch (error: any) {
      console.error('Fetch Languages Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  
  /**
   * Fetch payment intent from backend
   * @param data Payment intent request data
   * @param token Authentication token
   * @returns Payment intent response with client secret, ephemeral key, and customer ID
   */
  buyAdditionalLanguage: async (data: PaymentIntentRequest, token: string | null): Promise<PaymentIntentResponse> => {
    try {
      console.log('Creating payment intent with request:', data);
      console.log('API URL:', `${API_BASE_URL}/buyAdditionalLanguage`);
      console.log('Token present:', !!token); 
      const response = await fetch(`${API_BASE_URL}/buyAdditionalLanguage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('Payment Intent Response Status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse payment intent response as JSON:', parseError);
        throw new Error('Invalid JSON response from payment service');
      }


      if (!response.ok) {
        console.error('Payment Intent Error Response:', jsonData);
        
        const errorMessage = jsonData?.message?.text || jsonData?.message ||  jsonData?.error || `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      const result: PaymentIntentResponse = jsonData.data || jsonData;
      console.log('Payment Intent Parsed Response:', result);

      // Validate the response structure
      if (!result) {
        throw new Error('No data in payment intent response');
      }

      if (!result.clientSecret) {
        console.error('Missing clientSecret in response:', result);
        throw new Error('Invalid payment intent response - missing client secret');
      }

      if (!result.ephemeralKey) {
        console.error('Missing ephemeralKey in response:', result);
        throw new Error('Invalid payment intent response - missing ephemeral key');
      }

      if (!result.customer) {
        console.error('Missing customer in response:', result);
        throw new Error('Invalid payment intent response - missing customer');
      }

      // Validate client secret format
      if (!result.clientSecret.startsWith('pi_')) {
        console.error('Invalid client secret format:', result.clientSecret);
        throw new Error('Invalid client secret format received from server');
      }

      console.log('Payment intent validation successful');
      return result;
    } catch (error) {
      console.error('Payment Intent Error:', error);
      throw error;
    }
  },

  /**
   * Fetch payment intent from backend
   * @param data Payment intent request data
   * @param token Authentication token
   * @returns Payment intent response with client secret, ephemeral key, and customer ID
   */
  fetchPaymentIntent: async (data: PaymentIntentRequest, token: string | null): Promise<PaymentIntentResponse> => {
    try {
      console.log('Creating payment intent with request:', data);
      console.log('API URL:', `${API_BASE_URL}/subscription_payments`);
      console.log('Token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/subscription_payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('Payment Intent Response Status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse payment intent response as JSON:', parseError);
        throw new Error('Invalid JSON response from payment service');
      }

      console.log('Payment Intent Response:', jsonData);

      if (!response.ok) {
        console.error('Payment Intent Error Response:', jsonData);
        
        const errorMessage = jsonData?.message?.text || 
                            jsonData?.message || 
                            jsonData?.error || 
                            `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      console.log('Payment Intent Parsed Response:', jsonData);
      const result: PaymentIntentResponse = jsonData.data || jsonData;

      // Validate the response structure
      if (!result) {
        throw new Error('No data in payment intent response');
      }

      if (!result.clientSecret) {
        console.error('Missing clientSecret in response:', result);
        throw new Error('Invalid payment intent response - missing client secret');
      }

      if (!result.ephemeralKey) {
        console.error('Missing ephemeralKey in response:', result);
        throw new Error('Invalid payment intent response - missing ephemeral key');
      }

      if (!result.customer) {
        console.error('Missing customer in response:', result);
        throw new Error('Invalid payment intent response - missing customer');
      }

      // Validate client secret format
      if (!result.clientSecret.startsWith('pi_')) {
        console.error('Invalid client secret format:', result.clientSecret);
        throw new Error('Invalid client secret format received from server');
      }

      console.log('Payment intent validation successful');
      return result;
    } catch (error) {
      console.error('Payment Intent Error:', error);
      throw error;
    }
  },

  /**
   * Start free trial for user
   * @param data Free trial request data (not used - endpoint only needs auth token)
   * @param token Authentication token
   * @returns Free trial response
   */
  activateFreeTrial: async (token: string | null): Promise<ApiResponse<SubscriptionDetails>> => {
    try {
      console.log('[PaymentApi] Activating free trial...');
      console.log('[PaymentApi] API URL:', `${API_BASE_URL}/subscription/activate-free-trial`);
      console.log('[PaymentApi] Token present:', !!token);

      // According to SUBSCRIPTION_SYSTEM_GUIDE.md, this endpoint only needs Authorization header
      // No request body is required
      const response = await fetch(`${API_BASE_URL}/subscription/activate-free-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[PaymentApi] Response status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('[PaymentApi] Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      console.log('[PaymentApi] Response data:', jsonData);

      if (!response.ok) {
        console.error('[PaymentApi] Error response:', jsonData);

        const errorMessage = jsonData?.message || 
                            jsonData?.error || 
                            `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      console.log('[PaymentApi] Free trial activation successful');
      
      // Return the full response object including success flag and message
      return {
        success: jsonData.success || true,
        message: jsonData.message || 'Free trial activated successfully',
        data: jsonData.data
      };


    } catch (error) {
      console.error('[PaymentApi] Free trial error:', error);
      throw error;
    }
  },

  /**
   * Verify payment status
   * @param paymentIntentId Payment intent ID
   * @param token Authentication token
   * @returns Payment verification result
   */
  verifyPayment: async (
    paymentIntentId: string,
    token: string | null
  ): Promise<{ status: string; verified: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse payment verification response as JSON:', parseError);
        throw new Error('Invalid JSON response from payment verification service');
      }

      if (!response.ok) {
        const errorMessage = jsonData?.message?.text || 
                            jsonData?.message || 
                            jsonData?.error || 
                            'Failed to verify payment';
        throw new Error(errorMessage);
      }

      return jsonData.data;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      throw error;
    }
  },

  /**
   * Cancel payment intent
   * @param paymentIntentId Payment intent ID
   * @param token Authentication token
   */
  cancelPayment: async (
    paymentIntentId: string,
    token: string | null
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cancel-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse payment cancellation response as JSON:', parseError);
        throw new Error('Invalid JSON response from payment cancellation service');
      }

      if (!response.ok) {
        const errorMessage = jsonData?.message?.text || 
                            jsonData?.message || 
                            jsonData?.error || 
                            'Failed to cancel payment';
        throw new Error(errorMessage);
      }

      // Successfully cancelled, no need to return data
    } catch (error) {
      console.error('Payment Cancellation Error:', error);
      throw error;
    }
  },

  /**
   * Fetch user's payment history with invoices
   * @param data Object containing user_id
   * @param token Authentication token
   * @returns Payment history with invoices
   */
  fetchPaymentHistory: async (data: { user_id: string }, token: string | null): Promise<PaymentHistoryResponse> => {
    try {
      // Validate input data
      if (!data || !data.user_id) {
        throw new Error('User ID is required');
      }

      //if (typeof data.user_id !== 'string' || data.user_id.trim() === '') {throw new Error('Valid User ID is required');}

      console.log('Fetching payment history for user:', data.user_id);
      console.log('API URL:', `${API_BASE_URL}/getSubscriptionPaymentHistory`);
      console.log('Token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/getSubscriptionPaymentHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          user_id: data.user_id 
        }),
      });

      console.log('Payment History Response Status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonResponse;
      try {
        jsonResponse = await response.json();
      } catch (parseError) {
        console.error('Failed to parse payment history response as JSON:', parseError);
        throw new Error('Invalid JSON response from payment history service');
      }

      console.log('Payment History Parsed Response:', jsonResponse);

      if (!response.ok) {
        console.error('Payment History Error Response:', jsonResponse);
        
        const errorMessage = jsonResponse?.message?.text || 
                            jsonResponse?.message || 
                            jsonResponse?.error || 
                            `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      // Handle different response structures
      let result: PaymentHistoryResponse;

      if (Array.isArray(jsonResponse)) {
        // If response is directly an array of payments
        result = { 
          payments: jsonResponse,
          data: jsonResponse,
          total: jsonResponse.length,
          has_more: false 
        };
      } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
        // If response has data property with array
        result = {
          payments: jsonResponse.data,
          data: jsonResponse.data,
          total: jsonResponse.total || jsonResponse.data.length,
          has_more: jsonResponse.has_more || false
        };
      } else if (jsonResponse.success && jsonResponse.data) {
        // If response has success flag and data
        const payments = Array.isArray(jsonResponse.data) ? jsonResponse.data : [];
        result = {
          payments: payments,
          data: payments,
          total: payments.length,
          has_more: false
        };
      } else {
        // Default structure - no payments found
        console.log('No payment data found in response:', jsonResponse);
        result = {
          payments: [],
          data: [],
          total: 0,
          has_more: false
        };
      }

      console.log('Payment history fetch successful:', result.payments?.length || 0, 'payments');
      return result;

    } catch (error: any) {
      console.error('Fetch Payment History Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  },
};
