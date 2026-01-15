# Backend Password Reset Configuration Issue

## Problem

The password reset endpoints return **"Unauthenticated. Please log in."** error when called from the mobile app.

This creates a logical impossibility:
- User forgets password → Can't log in
- User tries to reset password → Backend requires authentication
- **Result: User is locked out permanently!**

## Current Backend Routes (from api.php)

```php
Route::prefix('auth')->group(function () {
    // ... other authenticated routes ...
    
    // Password reset routes
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});
```

## Issue

These routes are likely inside an auth middleware group, making them require authentication to access.

## Required Fix

**Option 1: Move routes outside auth middleware (Recommended)**

```php
// Public routes (no authentication required)
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

// Authenticated routes
Route::prefix('auth')->middleware('auth:api')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    // ... other authenticated routes ...
});
```

**Option 2: Explicitly exclude from middleware**

```php
Route::prefix('auth')->group(function () {
    // ... other routes ...
    
    // Public routes - explicitly exclude from auth middleware
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
        ->withoutMiddleware('auth:api');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
        ->withoutMiddleware('auth:api');
});
```

**Option 3: Check in AuthController methods**

Ensure the controller methods don't have `->middleware('auth:api')` and don't use `auth()->user()` since there's no authenticated user:

```php
class AuthController extends Controller
{
    public function forgotPassword(Request $request)
    {
        // This should NOT check auth()->user()
        // Just validate email and send reset link
        $request->validate(['email' => 'required|email']);
        
        // Send password reset email logic...
        
        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email'
        ]);
    }
    
    public function resetPassword(Request $request)
    {
        // This should NOT check auth()->user()
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed'
        ]);
        
        // Reset password logic using token...
        
        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    }
}
```

## Mobile App Configuration

The mobile app is correctly configured to call:
- `POST https://mediathek.tniglobal.org/api/auth/forgot-password`
- `POST https://mediathek.tniglobal.org/api/auth/reset-password`

Both requests are sent **WITHOUT** authentication token (as expected for password reset flow).

## Testing

After backend fix, test with:

```bash
# Should work WITHOUT Authorization header
curl -X POST https://mediathek.tniglobal.org/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return success, not "Unauthenticated"
```

## Impact

This is a **CRITICAL** bug that prevents users from recovering their accounts if they forget their password.

## Status

- [x] Mobile app endpoints confirmed correct
- [ ] Backend middleware configuration needs fix
- [ ] Backend testing required after fix
- [ ] Mobile app testing required after backend fix

## Contact

Please notify mobile development team once backend fix is deployed so we can test and release updated mobile app.

---

**Created:** January 15, 2026  
**Priority:** HIGH - Blocks user account recovery
