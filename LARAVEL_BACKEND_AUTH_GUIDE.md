# Rhapsody Languages - Authentication API Documentation

## Overview

The Rhapsody Languages authentication system provides secure user registration, login, email verification, and password reset functionality using JWT tokens and Brevo email service.

## ⚠️ Important for Frontend Developers

**Token Field Consistency**: All authentication endpoints return the JWT token as `"token"` (not `"access_token"`). Please ensure your TypeScript interfaces expect `token` as the field name.

**User Object Structure**: All user responses include complete profile and subscription data with full package details for consistent frontend handling.

## Features

- ✅ User Registration with Email Verification Code
- ✅ JWT-based Authentication  
- ✅ 6-Digit Verification Code via Email (Clerk-style)
- ✅ Email Verification via Brevo SMTP
- ✅ Password Reset with Email Notifications
- ✅ Welcome Emails for New Users
- ✅ Payment Notification Emails
- ✅ API-only Backend (for frontend integration)

## API Endpoints

### Authentication Routes

All authentication routes are prefixed with `/api/auth/`

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "firstname": "John", 
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "country": "United States"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for the verification code.",
  "data": {
    "user": {
      "id": 1,
      "code": "USR123456",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "email_verified_at": null,
      "profile": {
        "code": "USR789012"
      },
      "subscription": {
        "code": "SUB123456",
        "id": 1,
        "user_id": 1,
        "language_id": null,
        "language": ["@free"],
        "package_id": 11,
        "start": "2024-01-01T00:00:00.000000Z",
        "end": null,
        "status": "active",
        "category": "free",
        "package": {
          "id": 11,
          "label": "Always Free",
          "value": "always_free",
          "price": "0.00",
          "currency": "USD",
          "type": "alltime",
          "duration": 0,
          "amount": "0.00",
          "category": "free"
        }
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "verification_required": true
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "code": "USR123456",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "email_verified_at": "2024-01-01T00:00:00.000000Z",
      "profile": {
        "code": "USR789012"
      },
      "subscription": {
        "code": "SUB123456",
        "id": 1,
        "user_id": 1,
        "language_id": null,
        "language": ["en", "fr"],
        "package_id": 2,
        "start": "2024-01-01T00:00:00.000000Z",
        "end": "2025-12-31T23:59:59.000000Z",
        "status": "active",
        "category": "premium",
        "package": {
          "id": 2,
          "label": "Premium Package",
          "value": "premium_monthly",
          "price": 29.99,
          "currency": "USD",
          "type": "subscription",
          "duration": 30,
          "amount": 29.99,
          "category": "premium"
        }
      }
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 10800
  }
}
```
```

**Error Response (403) - Unverified Email:**
```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "email_verified": false
}
```

#### Get Authenticated User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "code": "USR123456",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "email_verified_at": "2024-01-01T00:00:00.000000Z",
      "profile": {
        "code": "USR789012"
      },
      "subscription": {
        "code": "SUB123456",
        "id": 1,
        "user_id": 1,
        "language_id": null,
        "language": ["@free"],
        "package_id": 11,
        "start": "2024-01-01T00:00:00.000000Z",
        "end": null,
        "status": "active",
        "category": "free",
        "package": {
          "id": 11,
          "label": "Always Free",
          "value": "always_free",
          "price": "0.00",
          "currency": "USD",
          "type": "alltime",
          "duration": 0,
          "amount": "0.00",
          "category": "free"
        }
      }
    }
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Email Verification Routes (Code-Based)

#### Verify Email with Code
```http
POST /api/auth/verify-code
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": 1,
      "code": "USR123456",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "email_verified_at": "2024-01-01T00:00:00.000000Z",
      "profile": {
        "code": "USR789012"
      },
      "subscription": {
        "code": "SUB123456",
        "id": 1,
        "user_id": 1,
        "language_id": null,
        "language": ["@free"],
        "package_id": 11,
        "start": "2024-01-01T00:00:00.000000Z",
        "end": null,
        "status": "active",
        "category": "free",
        "package": {
          "id": 11,
          "label": "Always Free",
          "value": "always_free",
          "price": "0.00",
          "currency": "USD",
          "type": "alltime",
          "duration": 0,
          "amount": "0.00",
          "category": "free"
        }
      }
    }
  }
}
```

**Error Response (400) - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Error Response (400) - Expired Code:**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one."
}
```

#### Resend Verification Code
```http
POST /api/auth/resend-verification
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### Email Verification Routes (Legacy)

#### Resend Email Verification
```http
POST /api/auth/email/resend
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verification link sent"
}
```

#### Verify Email (From Email Link)
```http
GET /api/email/verify/{id}/{hash}?expires={timestamp}&signature={signature}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Password Reset Routes

#### Request Password Reset
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "email": "john@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Email Configuration

The system uses **Brevo** (formerly Sendinblue) for email delivery.

### Environment Variables

```env
# Email Configuration (Brevo SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_login_email
MAIL_PASSWORD=your_brevo_smtp_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@rhapsodylanguages.com
MAIL_FROM_NAME="Rhapsody Languages"

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

### Setting up Brevo

1. Sign up for a Brevo account at https://www.brevo.com
2. Go to SMTP & API settings
3. Generate an SMTP key
4. Update your `.env` file with:
   - `MAIL_USERNAME`: Your Brevo login email
   - `MAIL_PASSWORD`: Your SMTP key (not your login password)

## Email Templates

### Email Templates

### Email Verification Code
- **Subject**: "Verify Your Email Address - Rhapsody Languages"
- **Content**: 6-digit verification code (e.g., 123456)
- **Expires**: 10 minutes
- **Format**: Similar to Clerk's verification system

### Welcome Email
- **Subject**: "Welcome to Rhapsody Languages!"
- **Sent**: After email verification
- **Content**: Getting started guide and links

### Password Reset
- **Subject**: "Reset Your Password - Rhapsody Languages"
- **Action**: Link to reset password form
- **Expires**: 60 minutes

### Payment Notifications
- **Success**: Payment confirmation with transaction details
- **Failed**: Payment failure with retry instructions
- **Refunded**: Refund confirmation with timeline

## Testing

### Run Authentication Tests
```bash
php artisan test tests/Feature/AuthenticationTest.php
```

### Test Email Sending
```bash
# Test email verification
php artisan email:test verification john@example.com

# Test welcome email
php artisan email:test welcome john@example.com

# Test password reset
php artisan email:test reset john@example.com
```

## Security Features

- **JWT Token Authentication**: Secure stateless authentication
- **6-Digit Verification Codes**: Similar to Clerk's verification system
- **Time-Based Code Expiry**: Codes expire in 10 minutes for security
- **Email Verification Required**: Users must verify email before login
- **Password Hashing**: Bcrypt password hashing
- **Rate Limiting**: API rate limiting on auth endpoints
- **CORS Protection**: Configured CORS middleware

## Code-Based Verification System

### Overview
The authentication system now uses a 6-digit verification code approach similar to Clerk's user management system, providing a modern and user-friendly experience.

### Controller Architecture
The system uses **one primary AuthController** located at `/app/Http/Controllers/AuthController.php` which handles all authentication operations including:
- Registration with automated profile/subscription creation via observers
- Login with email verification requirements  
- Code-based email verification
- Token refresh and user management

**Observer-Based Automation**: The system uses Laravel Observers for automated resource creation:
- **UserObserver**: Automatically creates UserProfile with captured country data
- **UserObserver**: Automatically creates default free subscription
- **Cache-Based Country Transfer**: Country data is temporarily cached during registration for observer access

**Note**: There is a legacy Api/AuthController that has been superseded by the main AuthController. The current implementation maintains the automated approach you requested with minimal manual intervention.

### Key Features
- **6-digit numeric codes**: Easy to read and type (e.g., 123456)
- **10-minute expiration**: Balances security with user convenience
- **Automatic cleanup**: Codes are cleared after successful verification
- **Resend functionality**: Users can request new codes if needed
- **Email delivery**: Codes sent via Brevo SMTP with professional formatting

### Database Schema
New fields added to `users` table:
- `verification_code` (string, 6 chars): Stores the current verification code
- `verification_code_expires_at` (timestamp): Code expiration time

### Automated System Features
The authentication system is designed for maximum automation with minimal manual intervention:

#### **Observer-Based Resource Creation**
- **UserProfile**: Automatically created when user registers, includes captured country data
- **Default Subscription**: Automatically created as 'free' category with active status  
- **Country Capture**: Uses cache-based transfer from registration form to observer
- **Code Generation**: Automatic 6-digit verification code generation and email delivery

#### **Automated Workflows**
1. **Registration Flow**: User submits form → UserObserver creates profile + subscription → Verification code sent
2. **Verification Flow**: User submits code → Email marked verified → Codes cleared automatically
3. **Login Flow**: Credentials checked → Email verification enforced → JWT token generated

### API Flow
1. **Registration**: User receives code immediately after signup (automated via observers)
2. **Verification**: User submits code via `/api/auth/verify-code`
3. **Resend**: User can request new code via `/api/auth/resend-verification`
4. **Login Protection**: Unverified users cannot log in (automated check)

## Frontend Integration

### Token Storage
Store the JWT token securely on the frontend (localStorage, sessionStorage, or httpOnly cookies).

### Authorization Header
Include the token in API requests:
```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

### Email Verification Flow (Code-Based)
1. User registers and receives verification code via email
2. Frontend displays code input form
3. User enters 6-digit code from email
4. Submit verification request to `/api/auth/verify-code`
5. Show success/error message
6. Redirect to login or dashboard

### Resend Verification Code
1. User clicks "Resend Code" button
2. Frontend sends request to `/api/auth/resend-verification`
3. New code sent to user's email
4. Show confirmation message

### Password Reset Flow
1. User requests reset via API
2. User receives email with reset link
3. Frontend form for new password
4. Submit reset request with token

## Error Handling

### Common Error Responses

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "email_verified": false
}
```

## Middleware

### Email Verification Middleware
Apply to routes that require verified email:
```php
Route::middleware(['auth:api', 'verified.api'])->group(function () {
    // Protected routes requiring email verification
});
```

## Queue Configuration

Emails are queued for better performance. Configure your queue driver:

```env
QUEUE_CONNECTION=database  # or redis, sqs, etc.
```

Run queue worker:
```bash
php artisan queue:work
```

## Deployment Notes

1. **Environment Variables**: Ensure all email and frontend URL variables are set correctly
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Domain Verification**: Verify your sending domain in Brevo
4. **Queue Workers**: Set up queue workers for email processing
5. **Rate Limiting**: Configure appropriate rate limits for auth endpoints

## Support

For issues or questions about the authentication system, please check:
- Laravel JWT Auth documentation
- Brevo SMTP documentation
- Application logs in `storage/logs/`