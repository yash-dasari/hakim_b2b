# Redux API Setup - Hakim Admin Portal

## 📦 Installation Required

Run this command to install Redux packages:

```bash
npm install @reduxjs/toolkit react-redux
```

Or with yarn:

```bash
yarn add @reduxjs/toolkit react-redux
```

---

## 🏗️ Project Structure Created

```
hakim-admin-portal/
├── config/
│   └── api.config.ts          # Axios instance with interceptors
├── services/
│   └── api/
│       └── auth.api.ts        # Auth API service layer
├── store/
│   ├── store.ts               # Redux store configuration
│   ├── hooks.ts               # Typed Redux hooks
│   └── slices/
│       └── authSlice.ts       # Auth slice (actions + reducers)
└── pages/
    ├── _app.tsx               # Redux Provider added
    └── admin/
        └── login.tsx          # Updated to use Redux
```

---

## 🔧 Configuration Files

### 1. **API Configuration** (`config/api.config.ts`)
- Axios instance with base URL
- Request interceptor (adds Bearer token)
- Response interceptor (handles 401 errors)
- Complete logging for debugging

### 2. **Auth API Service** (`services/api/auth.api.ts`)
- `authAPI.login(payload)` - POST /auth/login
- `authAPI.logout()` - POST /auth/logout
- `authAPI.getProfile()` - GET /auth/profile
- All with detailed console logging

### 3. **Redux Auth Slice** (`store/slices/authSlice.ts`)
- **Actions:** `loginUser`, `logoutUser`, `setUser`, `clearAuth`
- **State:** user, token, isAuthenticated, loading, error
- Automatic cookie and localStorage management

---

## 🔌 API Endpoint

**Base URL:** 
```
http://dev-alb-hakim-2015952050.me-central-1.elb.amazonaws.com/customers/v1/
```

**Login Endpoint:**
```
POST /auth/login

Payload:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
}
```

---

## 📝 Environment Variables

Create `.env.local` file in project root:

```env
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2FuZGVlcHBhbG5pIiwiYSI6ImNtaDBoeHllOTBmOTVzc3FwZW5yYnVwYXEifQ.e98KlHrFyvnxRDtyLH7D7w

# API Configuration
NEXT_PUBLIC_BASE_URL=http://dev-alb-hakim-2015952050.me-central-1.elb.amazonaws.com/customers/v1/
```

---

## 🚀 Usage Example

### In Login Page:

```typescript
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    const result = await dispatch(loginUser({
      username: 'user@example.com',
      password: 'password123'
    })).unwrap();
    
    console.log('Login successful:', result);
  };
}
```

### In Any Component:

```typescript
import { useAppSelector } from '../store/hooks';

export default function SomeComponent() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.firstName}</div>;
}
```

---

## 🎯 Console Logging

The setup includes detailed console logging:

### Login Flow:
1. 🚀 Redux: Starting login action
2. 🔐 Calling Login API: { username, password }
3. 📡 API Request: { method, url, headers, data }
4. 📊 API Response: { status, data, headers }
5. ✅ Redux: Login successful
6. ✅ Login fulfilled: { user, token }

### Error Flow:
1. ❌ API Response Error: { status, data, message }
2. ❌ Redux: Login rejected: error message
3. ❌ Error displayed to user

---

## 🔒 Authentication Flow

1. **User enters credentials**
2. **Redux dispatches `loginUser` action**
3. **API service calls** `POST /auth/login`
4. **Response logged** to console
5. **Token stored** in cookies & localStorage
6. **User data stored** in Redux state
7. **Redirect** to `/hakimAdmin/dashboard`

---

## 🛠️ Next Steps

1. **Install packages:** `npm install @reduxjs/toolkit react-redux`
2. **Restart dev server:** `npm run dev`
3. **Test login:** Visit `http://localhost:3000/login`
4. **Check console:** Open browser DevTools to see all logs

---

## 📊 Features Included

✅ Axios interceptors for automatic token injection  
✅ Request/Response logging for debugging  
✅ Error handling with 401 auto-redirect  
✅ Redux Toolkit for state management  
✅ TypeScript types for all API calls  
✅ Automatic cookie and localStorage sync  
✅ Clean separation of concerns (config → API → Redux → UI)  

---

## 🎨 Benefits of This Setup

1. **Centralized API Configuration** - All API calls use the same axios instance
2. **Automatic Token Management** - Tokens automatically added to requests
3. **Global Error Handling** - 401 errors handled in one place
4. **Redux State Management** - Auth state accessible anywhere
5. **Detailed Logging** - Easy debugging with console logs
6. **Type Safety** - Full TypeScript support

