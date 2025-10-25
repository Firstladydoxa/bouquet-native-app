// Centralized type definitions for TNI Bouquet Apps

// ============================================
// Auth & User Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  subscription?: SubscriptionDetails;
  subscriptionDate?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionDetails {
  code: string;
  id: number
  user_id: string;
  language_id: string;
  language: string[];  // Changed to array to support multiple languages
  package_id: string;
  start: string;
  end: string;
  status: 'active' | 'free trial' | 'cancelled' | 'expired' | 'past_due';
  package?: Package;
  next_payment_date?: string;
  trial_end?: string;
  cancel_at?: string;
  cancel_at_period_end: boolean;
}

export interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  token: string | null;
}

export interface SignInData {
  identifier: string; // email or username
  password: string;
}

export interface SignInResponse {
  user: User;
  token: string;
  expires_in: number;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  country?: string;
}

export interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<{ status: 'complete' | 'error'; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ status: 'complete' | 'needs_verification' | 'error'; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
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

// ============================================
// Region Types
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
