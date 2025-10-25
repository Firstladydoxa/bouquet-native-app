import { ApiResponse, User } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
  verification_sent?: boolean;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  token: string;
  message: string;
}

export interface VerifyEmailPayload {
  email: string;
  verification_code: string;
}

export interface VerifyEmailResponse {
  user: User;
  message: string;
}

export class AuthAPI {
  /**
   * Register a new user
   */
  static async register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Registration successful',
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
  static async signIn(payload: SignInPayload): Promise<ApiResponse<SignInResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/loginmobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      return {
        data: data.data,
        message: {
          text: data.message || 'Sign in successful',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  }

  /**
   * Verify email with code
   */
  static async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<VerifyEmailResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Email verified successfully',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Failed to verify email. Please check the code.');
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      return {
        data: data.data || data,
        message: {
          text: data.message || 'Verification email sent',
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
   * Sign out user (if backend tracking is needed)
   */
  static async signOut(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
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
      const response = await fetch(`${API_BASE_URL}/user`, {
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

      return {
        data: data.data || data.user || data,
        message: {
          text: 'User profile retrieved',
          type: 'success',
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error(error.message || 'Failed to get user profile.');
    }
  }
}
