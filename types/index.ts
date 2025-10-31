// Centralized type definitions for TNI Bouquet Apps

// ============================================
// Auth & User Types
// ============================================

export interface User {
  id: number; // Changed from string to number to match Laravel backend
  code?: string; // Added to match Laravel backend
  email: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email_verified_at?: string | null; // Added to match Laravel backend
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // Laravel uses snake_case
  updated_at?: string; // Laravel uses snake_case
  profile?: {
    code: string;
    [key: string]: any;
  };
  subscription?: SubscriptionDetails;
  subscriptionDate?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionDetails {
  code?: string;
  id: number;
  user_id: number; // Changed from string to number
  language_id?: number | null; // Changed to number and nullable
  language: string[];  // Changed to array to support multiple languages
  package_id: number; // Changed from string to number
  start: string;
  end: string;
  status: 'active' | 'free_trial' | 'cancelled' | 'expired' | 'past_due'; // Added free_trial
  category: 'free' | 'free_trial' | 'standard' | 'basic' | 'premium'; // Added free_trial
  expires_at?: string; // Added for Laravel backend
  package?: Package;
  next_payment_date?: string;
  trial_end?: string;
  cancel_at?: string;
  cancel_at_period_end?: boolean; // Made optional
}

export interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  token: string | null;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface SignUpData {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  country?: string;
}

export interface RegisterPayload {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  country: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  token_type?: string;
  expires_in?: number;
  message: string;
  verification_required: boolean;
  profile?: {
    user_id: number;
    country: string;
    code: string;
  };
  subscription?: {
    category: string;
    status: string;
    selected_languages: string[];
  };
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  user: User;
  message: string;
  verified: boolean;
}

export interface AuthContextType extends AuthState {
  tokenExpiresAt?: Date | null;
  signIn: (data: SignInData) => Promise<{ status: 'complete' | 'error'; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ status: 'complete' | 'needs_verification' | 'error'; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<{ status: 'complete' | 'error'; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ status: 'complete' | 'error'; error?: string }>;
}

// ============================================
// Package & Subscription Types
// ============================================

export interface PackageItem {
  id: string;
  package_id: number;
  description: string;
}

export interface Package {
  id: string;
  label: string;
  value: string;
  price: number;
  currency: string;
  stripe_price: string;
  type: string;
  duration: string;
  items: PackageItem[];
  amount: number;
  currency_options: any;
  category?: 'free' | 'free_trial' | 'standard' | 'basic' | 'premium';
}

// ============================================
// Payment & Stripe Types
// ============================================

export interface PaymentIntentRequest {
  packageId: string;
  priceId: string;
  amount: number;
  currency: string;
  userId: string;
  language: string;
  method: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  ephemeralKey: string;
  customer: string;
}

export interface FreeTrialRequest {
  packageId: string;
  priceId: string;
  amount: number;
  currency: string;
  userId: string;
  language: string;
  method: string;
  type: 'free trial';
}

export interface Language {
  id: string;
  code: string;
  label: string;
  value: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  message: {
    text: string;
    type: string;
  };
  success: boolean;
}

export interface RequestResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Region Types
// ============================================

export interface DailyReadingPageInfo {
  coverPage: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  dayOfMonth: number;
}

export interface FreeTrialWidgetProps {
  packageId: string;
  priceId: string;
  onSuccess?: () => void;
  style?: any;
}

export interface DailyRhapsodyLanguage {
  label: string;
  file_name: string;
  type: 'open' | 'subscription';
}

// ============================================
// Region Types (existing)
// ============================================

export interface Region {
  id: string;
  cont: string;
  file_name: string;
  label: string;
  value: string;
  name?: string;
  code?: string;
  description?: string;
}

export interface RhapsodyLanguage {
  id?: string;
  country_id: number;
  label: string;
  value: string;
  read: string;
  listen: string;
  watch: string;
  type?: 'open' | 'subscription';
  file_name?: string; // Make optional to avoid conflicts
  pivot: {
    country_id: number;
    rorlanguage_id: number;
  }
}

export interface CountryData {
  id: string;
  continent_id: string;
  label: string;
  value: string;
  flag_link: string;
  languages: RhapsodyLanguage[];
}

// ============================================
// Payment History Types
// ============================================

export interface PaymentPackage {
  id: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

export interface PaymentStripeDetails {
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  receipt_email: string;
  metadata: Record<string, any>;
}

export interface PaymentInvoice {
  id: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
}

export interface ChargeDetails{
  id: string;
  receipt_url: string;
  receipt_number: null;
  paid: boolean;
  refunded: boolean
}

export interface PaymentHistory {
  id: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: string;
  package: PaymentPackage;
  stripe_details: PaymentStripeDetails;
  invoice: PaymentInvoice;
  charge_details?: ChargeDetails;
}

export interface PaymentHistoryResponse {
  payments?: PaymentHistory[];
  data?: PaymentHistory[];
  total?: number;
  has_more?: boolean;
}

// ============================================
// Subscription Types
// ============================================
