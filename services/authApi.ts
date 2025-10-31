import { ApiResponse, RegisterPayload, RegisterResponse, RequestResponse, SignInPayload, SignInResponse, User, VerifyEmailPayload, VerifyEmailResponse } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn('⚠️ API_BASE_URL is not configured. Please check your .env file.');
}



export class AuthAPI {
  /**
   * Register a new user
   */
  static async register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      console.log(`[AuthAPI] Attempting registration to: ${API_BASE_URL}/auth/register`);

      // Convert to backend expected format for mobile app (no name field)
      const backendPayload = {
        firstname: payload.firstname,
        lastname: payload.lastname || '',
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.password,
        country: payload.country,
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      const data = await response.json();

      console.log(`[AuthAPI] Registration response status: ${response.status}`);

      if (!response.ok) {
        // Handle Laravel validation errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages[0] as string || 'Validation failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      console.log('[AuthAPI] Registration successful');
      console.log('[AuthAPI] Backend response data:', {
        success: data.success,
        verification_required: data.data?.verification_required,
        message: data.message,
        user_email: data.data?.user?.email,
        has_token: !!data.data?.token,
      });

      // Map the updated Laravel response to our expected structure
      const responseData: RegisterResponse = {
        user: data.data.user,
        token: data.data.token,
        message: data.message,
        verification_required: data.data.verification_required || false,
        profile: data.data.user.profile,
        subscription: data.data.user.subscription,
      };

      console.log('[AuthAPI] Mapped response data:', {
        verification_required: responseData.verification_required,
        message: responseData.message,
      });

      return {
        data: responseData,
        message: {
          text: data.message || 'Registration successful. Please check your email for the verification code.',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register. Please try again.');
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn(payload: SignInPayload): Promise<RequestResponse<SignInResponse>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      console.log(`[AuthAPI] Attempting sign in to: ${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[AuthAPI] Failed to parse response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      console.log(`[AuthAPI] Response status: ${response.status}`);
      console.log('[AuthAPI] Login response data:', {
        success: data.success,
        hasData: !!data.data,
        hasToken: !!data.data?.token,
        dataKeys: Object.keys(data),
        dataStructure: data.data ? Object.keys(data.data) : [],
        tokenPresent: !!data.data?.token,
        message: data.message
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 403 && data.email_verified === false) {
          // User needs to verify email - automatically resend verification code
          console.log('[AuthAPI] User email not verified, auto-resending verification code...');
          
          try {
            await AuthAPI.resendVerificationCode(payload.email);
            console.log('[AuthAPI] Verification code resent successfully');
          } catch (resendError) {
            console.error('[AuthAPI] Failed to resend verification code:', resendError);
            // Continue with the original error even if resend fails
          }
          
          const error = new Error(data.message || 'Please verify your email before logging in.');
          (error as any).needsVerification = true;
          (error as any).email = payload.email;
          throw error;
        }
        
        const errorMessage = data.message || data.error || `Sign in failed (${response.status})`;
        console.error('[AuthAPI] Sign in failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle updated Laravel response structure - login now returns user data directly
      if (data.success && data.data) {
        console.log('[AuthAPI] Login successful with updated response structure');
        console.log('[AuthAPI] Token check:', {
          hasToken: !!data.data.token,
          tokenValue: data.data.token ? 'PRESENT' : 'MISSING',
          hasUser: !!data.data.user,
          userStructure: data.data.user ? Object.keys(data.data.user) : []
        });
        console.log('[AuthAPI] User data:', {
          userId: data.data.user?.id,
          userEmail: data.data.user?.email,
          userName: `${data.data.user?.firstname} ${data.data.user?.lastname}`.trim()
        });

        const finalToken = data.data.token;
        console.log('[AuthAPI] Final token being returned:', finalToken ? 'PRESENT' : 'MISSING');

        if (!finalToken) {
          console.error('[AuthAPI] No token found in data.data:', data.data);
          throw new Error('Authentication successful but no access token received. Please try again.');
        }

        return {
          success: true,
          message: data.message || 'Sign in successful',
          data: {
            token: finalToken,
            user: data.data.user,
            token_type: data.data.token_type || 'bearer',
            expires_in: data.data.expires_in || 10800,
          },
        };
      }

      // Handle Laravel JWT response structure according to documentation
      if (data.access_token) {
        console.log('[AuthAPI] Access token received, fetching user data from /auth/me...');
        console.log('[AuthAPI] Token details:', {
          tokenPresent: !!data.access_token,
          tokenType: typeof data.access_token,
          tokenLength: data.access_token ? data.access_token.length : 0
        });
        
        // According to Laravel backend docs, login only returns token info, need to fetch user separately
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Accept': 'application/json',
          },
        });

        let userData;
        try {
          userData = await userResponse.json();
        } catch (parseError) {
          console.error('[AuthAPI] Failed to parse user data response:', parseError);
          throw new Error('Invalid user data response from server');
        }

        console.log('[AuthAPI] User response status:', userResponse.status);
        console.log('[AuthAPI] User data response:', userData);
        
        if (!userResponse.ok) {
          console.error('[AuthAPI] User fetch failed with status:', userResponse.status);
          console.error('[AuthAPI] User fetch error data:', userData);
          throw new Error(userData.message || `Failed to get user data (${userResponse.status})`);
        }

        // According to docs, /auth/me returns: {"success": true, "data": {"user": {...}}}
        if (!userData.success || !userData.data || !userData.data.user) {
          console.error('[AuthAPI] Invalid user data structure:', userData);
          throw new Error('Invalid user data structure received from server');
        }

        console.log('[AuthAPI] Sign in successful, user data:', {
          userId: userData.data.user.id,
          userEmail: userData.data.user.email,
          userName: userData.data.user.name
        });

        return {
          success: true,
          message: 'Sign in successful',
          data: {
            token: data.access_token,
            user: userData.data.user,
            token_type: 'bearer',
            expires_in: 10800,
          },
        };
      }

      // Fallback for legacy response structure
      const responseData = data.data;
      
      if (!responseData.token || !responseData.user) {
        console.error('[AuthAPI] Invalid response structure:', data);
        throw new Error('Invalid response from server. Missing token or user data.');
      }

      console.log('[AuthAPI] Sign in successful with legacy structure');

      return {
        success: true,
        message: data.message || 'Sign in successful',
        data: {
          token: responseData.token,
          user: responseData.user,
          token_type: responseData.token_type || 'bearer',
          expires_in: responseData.expires_in || 10800,
        },
      };

    } catch (error: any) {
      console.error('[AuthAPI] Sign in error:', error.message || error);
      
      // Provide user-friendly error messages
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  }

  /**
   * Verify email with 6-digit code (Clerk-style)
   */
  static async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<VerifyEmailResponse>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      console.log(`[AuthAPI] Attempting email verification to: ${API_BASE_URL}/auth/verify-code`);

      const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email,
          code: payload.code,
        }),
      });

      const data = await response.json();

      console.log(`[AuthAPI] Email verification response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid or expired verification code');
        }
        throw new Error(data.message || 'Email verification failed');
      }

      // Handle updated response structure
      return {
        data: {
          user: data.data.user,
          message: data.message || 'Email verified successfully',
          verified: true,
        },
        message: {
          text: data.message || 'Email verified successfully',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthAPI] Email verification error:', error);
      throw new Error(error.message || 'Failed to verify email. Please check the code.');
    }
  }

  /**
   * Resend verification code to email
   */
  static async resendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      console.log(`[AuthAPI] Attempting to resend verification code to: ${API_BASE_URL}/auth/resend-verification`);

      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      console.log(`[AuthAPI] Resend verification response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      return {
        data: data,
        message: {
          text: data.message || 'Verification code sent to your email',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthAPI] Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification code.');
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      const response = await fetch(`${API_BASE_URL}auth/email/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Email verification link sent',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification email.');
    }
  }

  /**
   * Sign out user
   */
  static async signOut(token: string): Promise<void> {
    try {
      if (!API_BASE_URL) {
        console.warn('API_BASE_URL not configured, performing local sign out only');
        return;
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw - allow local sign out even if API fails
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
      }

      // According to Laravel docs, /auth/me returns: {"success": true, "data": {"user": {...}}}
      if (!data.success || !data.data || !data.data.user) {
        throw new Error('Invalid user data structure received from server');
      }

      return {
        data: data.data.user,
        message: {
          text: data.message || 'User profile retrieved',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error(error.message || 'Failed to get user profile.');
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(token: string): Promise<ApiResponse<{ token: string; token_type: string; expires_in: number }>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      // According to Laravel docs, refresh returns: {"success": true, "data": {"token": "...", "token_type": "bearer", "expires_in": 3600}}
      if (!data.success || !data.data || !data.data.token) {
        throw new Error('Invalid token refresh response from server');
      }

      return {
        data: {
          token: data.data.token,
          token_type: data.data.token_type,
          expires_in: data.data.expires_in,
        },
        message: {
          text: 'Token refreshed successfully',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw new Error(error.message || 'Failed to refresh token.');
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Password reset link sent to your email',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages[0] as string || 'Validation failed');
        }
        throw new Error(data.message || 'Password reset failed');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Password reset successfully',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to reset password.');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(token: string, profileData: { firstname?: string; lastname?: string }): Promise<ApiResponse<User>> {
    try {
      if (!API_BASE_URL) {
        throw new Error('API configuration error. Please contact support.');
      }

      console.log(`[AuthAPI] Attempting profile update to: ${API_BASE_URL}/auth/profile`);

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      console.log(`[AuthAPI] Profile update response status: ${response.status}`);

      if (!response.ok) {
        // Handle Laravel validation errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages[0] as string || 'Validation failed');
        }
        throw new Error(data.message || 'Profile update failed');
      }

      // Handle success response
      if (!data.success || !data.data || !data.data.user) {
        throw new Error('Invalid profile update response from server');
      }

      return {
        data: data.data.user,
        message: {
          text: data.message || 'Profile updated successfully',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile.');
    }
  }
}
