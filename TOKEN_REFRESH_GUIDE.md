# Token Refresh System - Implementation Guide

## Overview

The Token Refresh Widget is an automated session management system that monitors JWT token expiration and prompts users to refresh their session before it expires. This prevents "Unauthenticated" errors when making API requests while the user is still actively using the app.

## Features

- ✅ **Automatic Token Expiration Tracking**: Monitors token expiry time from backend
- ✅ **Proactive User Notification**: Shows modal 5 minutes before token expires
- ✅ **One-Click Token Refresh**: Simple button to refresh authentication token
- ✅ **Visual Countdown Timer**: Displays remaining time before expiration
- ✅ **Graceful Session Handling**: Automatic sign-out if refresh fails
- ✅ **Theme-Aware Design**: Adapts to app theme colors
- ✅ **Non-Intrusive**: Only appears when needed

## Architecture

### Components

1. **TokenRefreshWidget** (`components/ui/TokenRefreshWidget.tsx`)
   - Modal component that displays when token is about to expire or has expired
   - Monitors `tokenExpiresAt` from AuthContext
   - Provides refresh and sign-out actions

2. **AuthContext Updates** (`contexts/AuthContext.tsx`)
   - Added `tokenExpiresAt` state to track expiration
   - Added `refreshToken()` method to call backend refresh endpoint
   - Updated `saveAuthData()` to store expiry time
   - Captures `expires_in` from login/registration responses

3. **Type Definitions** (`types/index.ts`)
   - Added `tokenExpiresAt?: Date | null` to `AuthContextType`
   - Added `refreshToken: () => Promise<void>` to `AuthContextType`
   - Updated `RegisterResponse` to include optional `expires_in`

## How It Works

### Token Lifecycle

```
Login/Register → Backend Returns expires_in (seconds) → Calculate Expiry Date → Store in SecureStore
         ↓
Monitor Expiry Time Every 10 Seconds
         ↓
5 Minutes Before Expiry → Show Warning Modal → User Clicks Refresh → New Token with New Expiry
         ↓
Token Expired → Show Expired Modal → Force Refresh or Sign Out
```

### Token Expiration Times (from Laravel Backend)

- **Login**: 10800 seconds (3 hours)
- **Refresh**: 3600 seconds (1 hour)
- **Default Fallback**: 3600 seconds (1 hour) if not provided

### Warning Thresholds

- **Warning Shown**: 5 minutes before expiration
- **Modal Type**: Warning (orange) or Expired (red)
- **Check Interval**: Every 10 seconds

## Implementation Details

### 1. Token Expiry Storage

When user signs in, the system:
1. Receives `expires_in` from backend (in seconds)
2. Calculates expiry date: `new Date(Date.now() + expires_in * 1000)`
3. Stores in SecureStore as ISO string
4. Sets `tokenExpiresAt` state

**Storage Keys:**
- `auth_token`: JWT token
- `auth_user`: User data JSON
- `auth_token_expiry`: ISO timestamp of expiry

### 2. Expiration Monitoring

The `TokenRefreshWidget` runs an interval that:
1. Checks every 10 seconds if token exists
2. Calculates time difference: `expiryDate - now`
3. If ≤ 0: Token expired → Show expired modal
4. If ≤ 5 minutes: Token expiring soon → Show warning modal
5. Otherwise: Hide modal

### 3. Token Refresh Flow

When user clicks "Refresh Session":
1. Calls `refreshToken()` from AuthContext
2. Makes POST request to `/api/auth/refresh` with current token
3. Backend validates token and returns new token with `expires_in`
4. Saves new token with updated expiry time
5. Modal closes automatically
6. User continues using the app

### 4. Error Handling

If token refresh fails:
- Shows alert: "Session refresh failed. Please sign in again."
- Automatically signs out the user
- Redirects to login screen
- Clears all auth data from SecureStore

## API Integration

### Backend Endpoint

```http
POST /api/auth/refresh
Authorization: Bearer <current_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Frontend Implementation

```typescript
const refreshToken = async (): Promise<void> => {
  if (!token) {
    throw new Error('No token available to refresh');
  }

  try {
    const result = await AuthAPI.refreshToken(token);
    
    if (result.success && result.data.token) {
      // Save new token with updated expiry
      if (user) {
        await saveAuthData(result.data.token, user, result.data.expires_in);
      }
    }
  } catch (error) {
    console.error('[AuthContext] Token refresh error:', error);
    throw error;
  }
};
```

## User Experience

### Warning Modal (5 min before expiry)

```
┌─────────────────────────────────────┐
│          [Clock Icon]               │
│                                     │
│     Session Expiring Soon           │
│                                     │
│  Your session will expire in 4m 32s │
│  Refresh now to stay signed in.     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔄  Refresh Session          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Sign Out                     │  │
│  └───────────────────────────────┘  │
│                                     │
│         Dismiss                     │
└─────────────────────────────────────┘
```

### Expired Modal

```
┌─────────────────────────────────────┐
│        [Alert Icon - Red]           │
│                                     │
│       Session Expired               │
│                                     │
│  Your session has expired. Please   │
│  refresh to continue using the app. │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔄  Refresh Session          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Note**: Expired modal cannot be dismissed - user must refresh or app will remain blocked.

## Configuration

### Adjust Warning Time

To change when the warning appears (default: 5 minutes):

```typescript
// In TokenRefreshWidget.tsx
const fiveMinutes = 5 * 60 * 1000; // Change 5 to desired minutes
```

### Adjust Check Interval

To change how often expiry is checked (default: 10 seconds):

```typescript
// In TokenRefreshWidget.tsx
const interval = setInterval(checkExpiration, 10000); // Change 10000 to desired milliseconds
```

### Adjust Default Token Lifetime

To change fallback expiry time (default: 1 hour):

```typescript
// In AuthContext.tsx, saveAuthData()
const expirySeconds = expiresIn || 3600; // Change 3600 to desired seconds
```

## Testing

### Test Scenarios

1. **Normal Flow**
   - Sign in → Wait ~2h 55min → Warning modal appears → Click refresh → Continue using app

2. **Expired Token**
   - Sign in → Manually set expiry to past → Modal shows immediately → Must refresh

3. **Failed Refresh**
   - Sign in → Disconnect internet → Wait for warning → Click refresh → Shows error → Signs out

4. **Sign Out Option**
   - Sign in → Wait for warning → Click "Sign Out" → User signed out cleanly

### Manual Testing

To test without waiting 3 hours, temporarily modify the expiry calculation:

```typescript
// In AuthContext.tsx, saveAuthData()
// TESTING ONLY - Set expiry to 2 minutes instead of actual time
const expirySeconds = 120; // expiresIn || 3600;
```

Then sign in and wait 2 minutes to see the warning, or set to 30 seconds to test expired state.

**⚠️ Remember to restore the original code after testing!**

## Security Considerations

1. **Secure Storage**: Token expiry stored in SecureStore (encrypted on device)
2. **Automatic Cleanup**: On sign-out, all auth data including expiry is cleared
3. **Server-Side Validation**: Backend validates token on refresh request
4. **No Sensitive Data in Modal**: Only shows time remaining, not token details
5. **Forced Sign-Out**: If refresh fails, user is signed out for security

## Troubleshooting

### Modal Not Showing

**Issue**: User's token expires but modal doesn't appear

**Solutions**:
- Check that `tokenExpiresAt` is being set in AuthContext
- Verify `TokenRefreshWidget` is mounted in `app/_layout.tsx`
- Check console logs for expiry time calculation
- Ensure user is signed in (widget only shows for authenticated users)

### Refresh Fails

**Issue**: Token refresh returns error

**Solutions**:
- Check network connectivity
- Verify token hasn't been invalidated on backend
- Check backend logs for `/api/auth/refresh` endpoint
- Ensure `Authorization` header is being sent correctly

### Token Expiry Not Captured

**Issue**: `tokenExpiresAt` is null after login

**Solutions**:
- Check that backend is returning `expires_in` in response
- Verify `SignInResponse` type includes `expires_in: number`
- Check `saveAuthData()` is receiving the `expiresIn` parameter
- Look for errors in SecureStore when saving expiry

### Time Calculation Issues

**Issue**: Warning shows at wrong time or expired immediately

**Solutions**:
- Check device time is correct (not in future/past)
- Verify expiry calculation: `new Date(Date.now() + expires_in * 1000)`
- Check that `expires_in` is in seconds, not milliseconds
- Ensure timezone differences aren't affecting calculation

## Best Practices

1. **Always Show Warning**: Don't allow users to permanently dismiss expiry warnings
2. **Clear Messaging**: Explain why session expired and what user should do
3. **One-Click Refresh**: Make refresh as easy as possible
4. **Graceful Degradation**: If refresh fails, sign out cleanly
5. **Consistent Design**: Match app's theme and design language
6. **Performance**: Use intervals efficiently, clean up on unmount
7. **Testing**: Test both warning and expired states thoroughly

## Future Enhancements

Potential improvements for future versions:

1. **Silent Refresh**: Automatically refresh token in background before expiry
2. **Offline Queue**: Queue API requests while refreshing token
3. **Custom Intervals**: Let users choose how long before expiry to warn
4. **Push Notifications**: Notify users even when app is in background
5. **Analytics**: Track how often users need to refresh tokens
6. **Biometric Re-auth**: Use Face ID/Touch ID for quick re-authentication

## Related Files

- `components/ui/TokenRefreshWidget.tsx` - Main widget component
- `contexts/AuthContext.tsx` - Auth state and token management
- `services/authApi.ts` - API calls including refresh endpoint
- `types/index.ts` - TypeScript interfaces
- `app/_layout.tsx` - Widget integration point
- `LARAVEL_BACKEND_AUTH_GUIDE.md` - Backend API documentation

## Support

For issues or questions about the token refresh system:
1. Check this guide for common solutions
2. Review console logs for error messages
3. Test with shorter expiry times for debugging
4. Verify backend is returning correct `expires_in` values
5. Ensure AuthContext is properly initialized
