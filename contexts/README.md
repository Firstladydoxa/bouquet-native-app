# Authentication Context Documentation

## Overview

The Authentication Context provides a centralized way to manage authentication state and operations throughout the TNI Bouquet app. It wraps Clerk's authentication with a custom interface that includes subscription management and user profile operations.

## Setup

The `AuthProvider` is already integrated into the app's root layout (`app/_layout.tsx`). It wraps the entire application and provides authentication state to all components.

```tsx
<ClerkProvider tokenCache={tokenCache}>
  <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  </AuthProvider>
</ClerkProvider>
```

## Usage

### Basic Authentication Hooks

#### 1. Main Auth Context Hook

```tsx
import { useAuthContext } from '@/contexts';

function MyComponent() {
  const { 
    user, 
    isLoading, 
    isSignedIn, 
    signOut, 
    refreshUser 
  } = useAuthContext();

  if (isLoading) return <LoadingSpinner />;
  if (!isSignedIn) return <SignInPrompt />;

  return <AuthenticatedContent user={user} />;
}
```

#### 2. Specific Helper Hooks

```tsx
import { useAuthUser, useAuthActions, useSubscription } from '@/contexts';

function ProfileComponent() {
  // Get user data
  const { user, isLoading } = useAuthUser();
  
  // Get authentication actions
  const { signOut, updateProfile, getAuthToken } = useAuthActions();
  
  // Get subscription methods
  const { 
    updateSubscription, 
    cancelSubscription, 
    hasActiveSubscription 
  } = useSubscription();

  // Your component logic here
}
```

### User Profile Management

```tsx
import { useAuthActions } from '@/contexts';

function ProfileEditComponent() {
  const { updateProfile } = useAuthActions();

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      });
      // Profile updated successfully
    } catch (error) {
      // Handle error
    }
  };

  return (
    <TouchableOpacity onPress={handleUpdateProfile}>
      <Text>Update Profile</Text>
    </TouchableOpacity>
  );
}
```

### Subscription Management

```tsx
import { useSubscription } from '@/contexts';

function SubscriptionComponent() {
  const { 
    updateSubscription, 
    cancelSubscription, 
    hasActiveSubscription,
    getSubscriptionStatus 
  } = useSubscription();

  const handleSubscribe = async (planId: string) => {
    try {
      await updateSubscription(planId);
      // Subscription updated
    } catch (error) {
      // Handle error
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      // Subscription cancelled
    } catch (error) {
      // Handle error
    }
  };

  const isSubscribed = hasActiveSubscription();
  const currentPlan = getSubscriptionStatus();

  return (
    <View>
      {isSubscribed ? (
        <Text>Current plan: {currentPlan}</Text>
      ) : (
        <Text>No active subscription</Text>
      )}
    </View>
  );
}
```

### Authentication Token

```tsx
import { useAuthActions } from '@/contexts';

function ApiComponent() {
  const { getAuthToken } = useAuthActions();

  const makeAuthenticatedRequest = async () => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/protected-endpoint', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle response
    } catch (error) {
      // Handle error
    }
  };
}
```

## Types

### AuthUser

```typescript
interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
  subscription?: string;
  subscriptionDate?: string;
}
```

### AuthContextType

```typescript
interface AuthContextType {
  // User state
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  
  // Authentication methods
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Subscription methods
  updateSubscription: (subscriptionId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  hasActiveSubscription: () => boolean;
  getSubscriptionStatus: () => string | null;
  
  // User profile methods
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  
  // Utility methods
  getAuthToken: () => Promise<string | null>;
}
```

## Protected Routes

Use the auth context to protect routes and components:

```tsx
import { useAuthContext } from '@/contexts';
import { Redirect } from 'expo-router';

function ProtectedScreen() {
  const { isSignedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <ProtectedContent />;
}
```

## Error Handling

The context includes built-in error handling with user-friendly alerts. All methods that can fail will show appropriate error messages to the user and log detailed errors to the console for debugging.

```tsx
// Errors are automatically handled, but you can also catch them
const { updateProfile } = useAuthActions();

try {
  await updateProfile({ firstName: 'John' });
} catch (error) {
  // Custom error handling if needed
  console.error('Custom error handling:', error);
}
```

## Best Practices

1. **Use specific hooks** when you only need certain functionality (e.g., `useAuthUser` for just user data)
2. **Check loading states** before rendering content that depends on user data
3. **Handle unauthenticated states** gracefully by redirecting to sign-in or showing appropriate messages
4. **Use `getAuthToken()`** for making authenticated API requests
5. **Update user data** through the context methods rather than directly with Clerk to ensure consistency

## Examples

See the following files for complete implementation examples:

- `components/auth/AuthExample.tsx` - Complete example component
- `components/auth/SignOutButton.tsx` - Updated sign-out button
- `app/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions.tsx` - Subscription management example