# API Endpoint Configuration

## Base URL Structure

### Environment Variable
```
EXPO_PUBLIC_API_BASE_URL=https://mediathek.tniglobal.org/api
```

**Important**: The base URL already includes `/api` at the end.

## Endpoint Construction

### ✅ Correct Pattern
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// API_BASE_URL = "https://mediathek.tniglobal.org/api"

// Authentication endpoints
`${API_BASE_URL}/auth/register`     → https://mediathek.tniglobal.org/api/auth/register
`${API_BASE_URL}/auth/login`        → https://mediathek.tniglobal.org/api/auth/login
`${API_BASE_URL}/auth/refresh`      → https://mediathek.tniglobal.org/api/auth/refresh
`${API_BASE_URL}/auth/logout`       → https://mediathek.tniglobal.org/api/auth/logout

// Subscription endpoints
`${API_BASE_URL}/subscription/activate-free-trial` → https://mediathek.tniglobal.org/api/subscription/activate-free-trial
`${API_BASE_URL}/getRhapsodySubscriptionLanguages` → https://mediathek.tniglobal.org/api/getRhapsodySubscriptionLanguages
```

### ❌ Incorrect Pattern (Avoid)
```typescript
// DON'T add /api again - it's already in API_BASE_URL
`${API_BASE_URL}/api/auth/register`  → ❌ https://mediathek.tniglobal.org/api/api/auth/register
```

## Current Implementation Status

### ✅ Files Using Correct Pattern

**services/authApi.ts**
- All endpoints use `/auth/*` pattern (correct)
- Examples: `/auth/register`, `/auth/login`, `/auth/refresh`

**services/paymentApi.ts**
- All endpoints don't add `/api` prefix (correct)
- Examples: `/subscription/activate-free-trial`, `/getRhapsodySubscriptionLanguages`

**services/rhapsodylanguagesApi.ts**
- Uses `RHAPSODYLANGUAGES_API` from env (correct)

**services/mediaApi.ts**
- Uses `RHAPSODYLANGUAGES_API` from env (correct)

### ✅ Removed Unused Constants

**contexts/AuthContext.tsx**
- Removed unused hardcoded `API_BASE_URL` constant
- All API calls go through `AuthAPI` service which uses env variable

## Verification Checklist

- [x] No `/api/api/` duplication anywhere
- [x] `EXPO_PUBLIC_API_BASE_URL` includes `/api`
- [x] All auth endpoints use `/auth/*` format
- [x] All subscription endpoints use `/subscription/*` or direct endpoint names
- [x] No hardcoded URLs in context files
- [x] All services read from environment variables

## Testing URLs

When the app runs with `EXPO_PUBLIC_API_BASE_URL=https://mediathek.tniglobal.org/api`, you should see these URLs in the console:

```
[AuthAPI] Attempting registration to: https://mediathek.tniglobal.org/api/auth/register
[AuthAPI] Attempting sign in to: https://mediathek.tniglobal.org/api/auth/login
[PaymentApi] API URL: https://mediathek.tniglobal.org/api/subscription/activate-free-trial
```

## Notes

- The base URL structure follows Laravel's standard routing: `/api/{resource}/{action}`
- Since `/api` is already in the base URL, we only append the resource and action
- This avoids duplication and keeps endpoint definitions clean
