# Authentication Migration: localStorage → Redux Store

## Overview

All authentication data (`adminUser`, `adminToken`, `access_token`, etc.) has been migrated from localStorage to Redux store with redux-persist for automatic persistence.

## ✅ What Changed

### 1. **Redux Store Setup** (`store/store.ts`)
- Added `redux-persist` to automatically persist auth state
- Auth data is now stored in Redux and persisted automatically
- No need to manually read/write from localStorage

### 2. **Auth Slice** (`store/slices/authSlice.ts`)
- Removed all `localStorage.setItem()` and `localStorage.getItem()` calls
- Redux-persist handles persistence automatically
- Cookies still used for HTTP-only security (tokens)

### 3. **App Wrapper** (`pages/_app.tsx`)
- Added `PersistGate` to ensure Redux state is loaded before rendering
- Wraps the entire app to provide persistent state

### 4. **API Client** (`config/api.config.ts`)
- Now reads token from Redux store: `store.getState().auth.accessToken`
- Fallback to cookies if Redux not available
- 401 errors now dispatch Redux `clearAuth` action

### 5. **Auth Service** (`services/auth.ts`)
- Removed localStorage writes
- Only stores in cookies (for HTTP headers)
- Redux handles all state management

## 🎯 How to Use Auth Data

### ❌ OLD WAY (DON'T USE):
```typescript
// Don't do this anymore!
const token = localStorage.getItem('adminToken');
const userStr = localStorage.getItem('adminUser');
const user = userStr ? JSON.parse(userStr) : null;
```

### ✅ NEW WAY (USE THIS):

#### Option 1: Using Custom Hook (Recommended)
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, accessToken, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

#### Option 2: Using Redux useSelector
```typescript
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

function MyComponent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  return <div>Hello, {user?.firstName}</div>;
}
```

#### Option 3: Dispatching Auth Actions
```typescript
import { useDispatch } from 'react-redux';
import { loginUser, logoutUser, clearAuth } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';

function LoginComponent() {
  const dispatch = useDispatch<AppDispatch>();
  
  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ email, password, role: 'ADMIN' })).unwrap();
      // Login successful, Redux state updated automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    // Logout successful, Redux state cleared automatically
  };
  
  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## 📦 Available Auth State

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    preferred_username: string;
    email_verified: boolean;
    roles: string[];
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

## 🔄 Available Auth Actions

### 1. **loginUser** - Login a user
```typescript
dispatch(loginUser({ email, password, role: 'ADMIN' }))
```

### 2. **logoutUser** - Logout current user
```typescript
dispatch(logoutUser())
```

### 3. **fetchUserProfile** - Refresh user profile
```typescript
dispatch(fetchUserProfile())
```

### 4. **updateTokens** - Update access/refresh tokens
```typescript
dispatch(updateTokens({ accessToken, refreshToken }))
```

### 5. **clearAuth** - Clear all auth state
```typescript
dispatch(clearAuth())
```

### 6. **setUser** - Manually set user (from stored data)
```typescript
dispatch(setUser({ user, accessToken, refreshToken }))
```

## 🛠️ Migration Checklist

If you find any file still using localStorage for auth data, update it:

### Find and Replace:
```typescript
// ❌ Replace this:
localStorage.getItem('adminToken')
localStorage.getItem('adminUser')
localStorage.getItem('accessToken')
localStorage.getItem('token')
localStorage.getItem('user')

// ✅ With this:
const { accessToken, user } = useAuth();
// or
const accessToken = useSelector((state: RootState) => state.auth.accessToken);
const user = useSelector((state: RootState) => state.auth.user);
```

### Files Already Updated:
- ✅ `store/store.ts`
- ✅ `store/slices/authSlice.ts`
- ✅ `pages/_app.tsx`
- ✅ `config/api.config.ts`
- ✅ `services/auth.ts`
- ✅ `pages/hakimAdmin/requests.tsx`

### Files That May Need Updates:
Check these files if they use localStorage for auth:
- `components/AdminLayout.tsx`
- `pages/hakimAdmin/dashboard.tsx`
- `pages/hakimAdmin/service-centers/[id].tsx`
- `contexts/AuthContext.tsx`
- `components/CustomerLoginForm.tsx`
- Other admin pages

## 🔍 Benefits

1. **Centralized State**: All auth data in one place (Redux store)
2. **Automatic Persistence**: Redux-persist handles saving/loading automatically
3. **Type Safety**: TypeScript types for all auth data
4. **Better Testing**: Easy to mock Redux state in tests
5. **Dev Tools**: Use Redux DevTools to inspect auth state
6. **No Manual Sync**: No need to manually sync between localStorage and state
7. **Performance**: Redux selectors are optimized and memoized

## 🐛 Debugging

### Check Redux State:
```typescript
import { store } from './store/store';

console.log('Current auth state:', store.getState().auth);
```

### Clear Persisted State (if needed):
```typescript
// In browser console
localStorage.removeItem('persist:auth');
// Then refresh the page
```

### Redux DevTools:
Install Redux DevTools browser extension to inspect state changes in real-time.

## ⚠️ Important Notes

1. **Cookies Still Used**: Cookies are still used for HTTP-only token storage (security best practice)
2. **Automatic Persistence**: Redux-persist automatically saves state to localStorage (in a structured way)
3. **No Manual localStorage**: Never manually write to localStorage for auth data
4. **Server-Side**: On server-side (getServerSideProps, API routes), use cookies, not Redux

## 🎉 Summary

**Before**: Scattered localStorage calls throughout the codebase  
**After**: Centralized Redux store with automatic persistence  

All auth data is now managed through Redux, making the codebase more maintainable, testable, and reliable!

