# Types Directory

This directory contains all centralized TypeScript type definitions for the TNI Bouquet Apps project.

## 📁 Structure

All types are exported from `types/index.ts` for easy importing throughout the application.

## 📚 Type Categories

### Auth & User Types
- `User` - User profile and account information
- `AuthState` - Authentication state management
- `SignInData` - Sign-in request payload
- `SignUpData` - Sign-up request payload
- `AuthContextType` - Authentication context interface

### Package & Subscription Types
- `PackageItem` - Individual item within a subscription package
- `Package` - Complete subscription package details

### Payment & Stripe Types
- `PaymentIntentRequest` - Payment intent creation payload
- `PaymentIntentResponse` - Payment intent server response
- `Language` - Language selection for subscriptions

### API Response Types
- `ApiResponse<T>` - Generic API response wrapper

### Region Types
- `Region` - Geographic region information

## 🔧 Usage

Import types from the centralized location:

```typescript
import type { User, Package, Language } from '@/types';
```

Or import multiple types:

```typescript
import type {
  User,
  AuthState,
  Package,
  PaymentIntentRequest,
} from '@/types';
```

## 📝 Best Practices

1. **Always import types from `@/types`** - Never define duplicate interfaces in components or services
2. **Use `type` imports** - Use `import type` for TypeScript-only imports to optimize bundle size
3. **Keep types organized** - Add new types to the appropriate section in `index.ts`
4. **Document complex types** - Add JSDoc comments for types with non-obvious properties
5. **Maintain consistency** - Follow existing naming conventions (PascalCase for interfaces)

## 🔄 Migration

All previously scattered interface definitions have been consolidated into this directory:
- ✅ `contexts/AuthContext.tsx` → `types/index.ts`
- ✅ `services/paymentApi.ts` → `types/index.ts`
- ✅ `app/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/` → `types/index.ts`
- ✅ `components/subscriptions/PackageModal.tsx` → `types/index.ts`
- ✅ `app/(rhapsodylanguages)/(drawer)/regions/list.tsx` → `types/index.ts`

## 🚀 Adding New Types

When adding new types:

1. Add the type definition to `types/index.ts` in the appropriate section
2. Export the type using `export interface` or `export type`
3. Update this README if creating a new category
4. Update imports in files that will use the new type
