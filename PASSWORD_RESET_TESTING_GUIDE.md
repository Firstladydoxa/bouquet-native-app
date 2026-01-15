# Password Reset - Testing Guide

## ✅ Backend Status: FIXED (January 15, 2026)

The backend has successfully implemented password reset with the following fixes:

### Backend Changes Completed

1. **Middleware Updated** - `forgotPassword` and `resetPassword` are now excluded from authentication requirement
2. **Methods Implemented** - Both password reset methods are fully functional
3. **Email Notifications** - Password reset emails are configured and ready
4. **Public Access** - Endpoints are now accessible without authentication

### API Endpoints (Now Working)

```
POST https://mediathek.tniglobal.org/api/auth/forgot-password
POST https://mediathek.tniglobal.org/api/auth/reset-password
```

Both endpoints are **publicly accessible** (no authentication required).

---

## 📱 Mobile App Status: READY

The mobile app is correctly configured and ready to test:

### App Configuration

- ✅ Endpoints match backend routes exactly
- ✅ Requests sent without authentication tokens
- ✅ Proper error handling implemented
- ✅ User-friendly UI for password reset flow

### Files Verified

- [services/authApi.ts](services/authApi.ts) - API calls configured correctly
- [app/(auth)/forgot-password.tsx](app/(auth)/forgot-password.tsx) - UI implemented

---

## 🧪 Testing Checklist

### 1. Test Forgot Password Flow

**Steps:**
1. Open the app
2. Navigate to Sign In screen
3. Click "Forgot Password?"
4. Enter a valid email address
5. Click "Send Reset Link"

**Expected Results:**
- ✅ Success message: "Password reset link sent to your email"
- ✅ Email received with reset token
- ✅ No "Unauthenticated" error

**If Error Occurs:**
- Check Laravel logs: `storage/logs/laravel.log`
- Verify backend cache is cleared: `php artisan cache:clear`
- Confirm email configuration is correct

### 2. Test Reset Password Flow

**Steps:**
1. Check email for password reset token
2. Copy the token from the email
3. Return to app (or use reset password screen)
4. Enter:
   - Email address
   - Reset token
   - New password (min 6 characters)
   - Password confirmation
5. Click "Reset Password"

**Expected Results:**
- ✅ Success message: "Password reset successfully. You can now login with your new password."
- ✅ Redirected to login screen
- ✅ Can log in with new password
- ✅ No "Unauthenticated" error

### 3. Test Edge Cases

**Test Invalid Email:**
- Enter non-existent email
- Expected: "User not found" or validation error

**Test Expired Token:**
- Wait 60+ minutes after receiving token
- Try to reset password
- Expected: "Token expired" error

**Test Invalid Token:**
- Enter random/incorrect token
- Expected: "Invalid token" error

**Test Password Mismatch:**
- Enter different passwords in password/confirmation fields
- Expected: "Passwords do not match" error

---

## 🚀 Current Build

**Build Message:** "Password reset backend fixed - ready for testing"

**ETA:** ~15-20 minutes

**Next Steps After Build Completes:**

1. Download APK from EAS dashboard
2. Install on test device
3. Follow testing checklist above
4. Report any issues encountered

---

## 📋 Backend Implementation Details

For complete backend implementation details, see:
- [PASSWORD_RESET_IMPLEMENTATION.md](PASSWORD_RESET_IMPLEMENTATION.md)

### Key Backend Features

- **Token Hashing:** Bcrypt for security
- **Token Expiration:** 60 minutes
- **One-Time Use:** Tokens deleted after successful reset
- **Email Validation:** Only existing users can request reset
- **Password Requirements:** Minimum 6 characters with confirmation

---

## 🐛 Troubleshooting

### "Unauthenticated" Error Still Appears

**Possible Causes:**
1. Backend cache not cleared
2. Middleware changes not deployed
3. Route cache not cleared

**Backend Team Actions:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan optimize:clear
```

### Email Not Received

**Check:**
1. Email configuration in `.env`
2. SMTP credentials are correct
3. Test email delivery:
   ```bash
   php artisan tinker
   >>> Mail::raw('Test', function($msg) { 
       $msg->to('test@example.com')->subject('Test'); 
   });
   ```
4. Check spam/junk folder

### Token Invalid/Expired

**Check:**
1. Token copied correctly from email (no extra spaces)
2. Token used within 60 minutes
3. Token not already used (one-time use)
4. Database `password_resets` table has the entry

---

## ✨ Success Criteria

The password reset feature is considered **fully working** when:

- [x] Backend endpoints are publicly accessible
- [x] Mobile app can call endpoints without authentication
- [ ] User receives password reset email with token
- [ ] User can successfully reset password using token
- [ ] User can log in with new password
- [ ] No "Unauthenticated" errors occur
- [ ] All edge cases handled properly

---

**Last Updated:** January 15, 2026  
**Status:** Ready for Testing  
**Priority:** HIGH

