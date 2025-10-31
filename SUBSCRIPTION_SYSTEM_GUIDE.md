# Rhapsody Languages - Subscription System Guide

## Overview

The Rhapsody Languages subscription system manages user access to languages and premium content. Users can have different types of subscriptions that determine which languages they can access.

## Subscription Types

### 1. Always Free Subscription (Default)
- **Category**: `free`
- **Package**: Always Free package
- **Language Access**: All free languages only
- **Language Array**: `["@free"]` (marker for all free languages)
- **Duration**: Unlimited
- **Default**: Automatically assigned to all new users

### 2. Free Trial Subscription (Promotional)
- **Category**: `free_trial` 
- **Package**: All Languages Free Trial package
- **Language Access**: All languages (free + premium)
- **Language Array**: `["*"]` (wildcard for all languages)
- **Duration**: Until December 31, 2025
- **Activation**: Via frontend promotion

### 3. Paid Subscriptions
- **Category**: `basic`, `standard`, `premium`
- **Language Access**: Specific languages selected by user
- **Language Array**: `["language1", "language2", ...]` (specific language labels)
- **Duration**: Based on package (monthly, quarterly, etc.)
- **Languages**: Can add additional premium languages

## API Endpoints

### 1. Get User Subscription Status

```http
GET /api/subscription/show
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "package_id": 12,
    "category": "free_trial",
    "status": "active",
    "starts_at": "2024-01-01T00:00:00.000000Z",
    "ends_at": "2025-12-31T23:59:59.000000Z",
    "is_active": true,
    "is_free": false,
    "is_paid": false,
    "is_free_trial": true,
    "has_access_to_premium_languages": true,
    "subscribed_languages": ["*"],
    "subscribed_language_count": -1,
    "can_add_more_languages": false,
    "package": {
      "id": 12,
      "label": "All Languages Free Trial",
      "value": "all_languages_free_trial",
      "category": "free_trial"
    }
  }
}
```

### 2. Check Language Access

```http
GET /api/subscription/access
Authorization: Bearer <token>
```

**Response:**
```json
{
  "has_subscription": true,
  "subscription_category": "free_trial",
  "is_free_trial": true,
  "can_access_premium_languages": true,
  "subscribed_languages": ["*"],
  "subscribed_language_count": -1,
  "can_add_more_languages": false,
  "subscription_expires_at": "2025-12-31T23:59:59.000000Z"
}
```

### 3. Activate Free Trial (Promotional)

```http
POST /api/subscription/activate-free-trial
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Free trial activated successfully",
  "data": {
    "subscription_id": 1,
    "category": "free_trial",
    "trial_expires_at": "2025-12-31T23:59:59.000000Z",
    "languages_access": "all_languages",
    "total_languages": "unlimited"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "User is already on free trial"
}
```

```json
{
  "success": false,
  "message": "Free trial is only available for users with free subscription"
}
```

### 4. Check Specific Language Access

```http
GET /api/subscription/language/{languageLabel}/access
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "language_label": "Spanish",
    "language_type": "subscription",
    "has_access": true,
    "access_reason": "Free trial access - all languages available"
  }
}
```

### 5. Get Available Premium Languages

```http
GET /api/subscription/languages/available
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Available premium languages retrieved successfully",
  "data": {
    "premium_languages": [
      {
        "label": "Spanish",
        "description": "Spanish Language Learning",
        "is_subscribed": true
      }
    ],
    "total_premium_languages": 150,
    "user_subscribed_languages": ["*"],
    "user_can_add_languages": false
  }
}
```

### 6. Add Language to Subscription (Paid Only)

```http
POST /api/subscription/language/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "language_label": "French"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Language added to subscription successfully",
  "data": {
    "added_language": "French",
    "total_languages": 3,
    "subscribed_languages": ["Spanish", "German", "French"]
  }
}
```

### 7. Get Available Packages

```http
GET /api/subscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Packages retrieved successfully",
  "data": [
    {
      "id": 1,
      "label": "Basic Monthly",
      "value": "basic_monthly",
      "price": "9.99",
      "currency": "USD",
      "category": "basic",
      "duration": 30
    }
  ]
}
```

## Language Array System

The subscription system uses a sophisticated language array to efficiently manage language access:

### Language Array Patterns

1. **`["*"]`** - Wildcard (Free Trial)
   - Grants access to ALL languages (free + premium)
   - Used for promotional free trial subscriptions
   - Cannot add individual languages

2. **`["@free"]`** - Free Language Marker (Always Free)
   - Grants access to all FREE languages only
   - Used for default free subscriptions
   - Cannot add premium languages

3. **`["Spanish", "French", "German"]`** - Specific Languages (Paid)
   - Grants access to specifically listed premium languages
   - Used for paid subscriptions
   - Can add more premium languages

### Language Types

- **Free Languages**: `type: "free"` - Available to all users
- **Premium Languages**: `type: "subscription"` - Require paid subscription

## Frontend Implementation Guide

### 1. User Registration Flow
```javascript
// After successful registration, user automatically gets Always Free subscription
// Language array will be ["@free"]
// User has access to all free languages
```

### 2. Free Trial Promotion Implementation
```javascript
// Check if user is eligible for free trial
const checkEligibility = async () => {
  const response = await fetch('/api/subscription/access', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  // Show free trial button if user has free subscription
  return data.subscription_category === 'free';
};

// Activate free trial
const activateFreeTrial = async () => {
  const response = await fetch('/api/subscription/activate-free-trial', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    // Refresh user data - now has access to all languages
    window.location.reload();
  }
};
```

### 3. Language Access Check
```javascript
// Check if user can access a specific language
const canAccessLanguage = (userSubscription, languageType, languageLabel) => {
  const { subscribed_languages } = userSubscription;
  
  // Free trial - access to all languages
  if (subscribed_languages.includes('*')) {
    return true;
  }
  
  // Always free - access to free languages only
  if (subscribed_languages.includes('@free')) {
    return languageType === 'free';
  }
  
  // Paid subscription - check specific languages
  if (languageType === 'free') {
    return true; // Everyone can access free languages
  }
  
  return subscribed_languages.includes(languageLabel);
};
```

### 4. UI Components

#### Subscription Status Badge
```javascript
const SubscriptionBadge = ({ subscription }) => {
  const getBadgeInfo = () => {
    if (subscription.is_free_trial) {
      return { text: 'Free Trial', color: 'green', icon: '🎁' };
    }
    if (subscription.is_free) {
      return { text: 'Free', color: 'blue', icon: '🆓' };
    }
    return { text: subscription.category.toUpperCase(), color: 'gold', icon: '⭐' };
  };
  
  const badge = getBadgeInfo();
  return (
    <span className={`badge badge-${badge.color}`}>
      {badge.icon} {badge.text}
    </span>
  );
};
```

#### Language Access Indicator
```javascript
const LanguageAccessIndicator = ({ language, subscription }) => {
  const hasAccess = canAccessLanguage(subscription, language.type, language.label);
  
  return (
    <div className="language-item">
      <span>{language.label}</span>
      {hasAccess ? (
        <span className="access-granted">✅ Available</span>
      ) : (
        <span className="access-denied">🔒 Premium</span>
      )}
    </div>
  );
};
```

#### Free Trial Promotion Banner
```javascript
const FreeTrialBanner = ({ onActivate, userSubscription }) => {
  // Only show to users with free subscription
  if (userSubscription.subscription_category !== 'free') {
    return null;
  }
  
  return (
    <div className="promotion-banner">
      <h3>🎉 Limited Time: Free Trial Until Dec 31, 2025!</h3>
      <p>Get access to ALL premium languages absolutely free!</p>
      <button onClick={onActivate} className="btn btn-primary">
        Start Free Trial
      </button>
    </div>
  );
};
```

### 5. Language Count Display
```javascript
const LanguageCountDisplay = ({ subscription }) => {
  const getLanguageCountText = () => {
    const count = subscription.subscribed_language_count;
    
    if (count === -1) {
      return 'All Languages (Unlimited)';
    }
    
    if (subscription.subscribed_languages.includes('@free')) {
      return `${count} Free Languages`;
    }
    
    return `${count} Premium Languages`;
  };
  
  return <span>{getLanguageCountText()}</span>;
};
```

### 6. Error Handling
```javascript
const handleSubscriptionError = (error) => {
  const commonErrors = {
    'User is already on free trial': 'You are already enjoying the free trial!',
    'Free trial is only available for users with free subscription': 'Free trial is only available for basic users.',
    'No active subscription found': 'Please contact support for assistance.'
  };
  
  return commonErrors[error.message] || 'An error occurred. Please try again.';
};
```

## Business Logic Summary

1. **New Users**: Get Always Free subscription with `["@free"]` array
2. **Free Trial Promotion**: Users can upgrade from free to free trial with `["*"]` array
3. **Paid Subscriptions**: Users get specific language arrays like `["Spanish", "French"]`
4. **Language Access**: Determined by array contents and language type
5. **Adding Languages**: Only possible for paid subscriptions with specific language arrays

## Important Notes

- Free trial promotion expires December 31, 2025
- Always Free users cannot add premium languages
- Free Trial users cannot add individual languages (they have all)
- Paid users can add additional premium languages
- Free languages are accessible to everyone regardless of subscription
- Language arrays use special markers (`*`, `@free`) for efficient access control

This system ensures scalable language access management while providing clear upgrade paths for users.