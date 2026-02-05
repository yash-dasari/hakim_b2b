import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { authAPI, LoginPayload } from '../../services/api/auth.api';

// Helper function to process user profile data and extract firstName/lastName
function processUserProfile(userProfile: any) {
  let firstName = userProfile.given_name || userProfile.firstName || '';
  let lastName = userProfile.family_name || userProfile.lastName || '';

  // If firstName/lastName are empty, try to extract from name field
  if (!firstName && !lastName && userProfile.name) {
    const nameParts = userProfile.name.trim().split(' ');
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }
  }

  // If still empty, use email prefix as fallback
  if (!firstName && userProfile.email) {
    const emailPrefix = userProfile.email.split('@')[0];
    firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

  return { firstName, lastName };
}

// Define the auth state interface
// Define the auth state interface
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
    [key: string]: any;
  } | null;
  company: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    [key: string]: any;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  company: null,
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  expiresIn: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for login - calls login API and then fetches user profile AND company profile
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginPayload, { rejectWithValue, dispatch }) => {
    try {
      console.log('🚀 Redux: Starting login action');

      // Step 1: Call login API
      const loginResponse = await authAPI.login(credentials);

      if (!loginResponse.success || !loginResponse.data.access_token) {
        throw new Error('Login failed: Invalid response from server');
      }

      console.log('✅ Redux: Login successful, tokens received');

      // Step 2: Store tokens in cookies
      const { access_token, refresh_token, token_type, expires_in } = loginResponse.data;

      Cookies.set('hakim_auth_token', access_token, { path: '/', expires: expires_in / 86400, sameSite: 'lax' });
      Cookies.set('hakim_access_token', access_token, { path: '/', expires: expires_in / 86400, sameSite: 'lax' });
      Cookies.set('hakim_refresh_token', refresh_token, { path: '/', expires: 7, sameSite: 'lax' });

      console.log('💾 Tokens stored in cookies');

      // Step 3: Fetch user profile
      console.log('👤 Redux: Fetching user profile...');
      const userProfileResponse = await authAPI.getUserProfile();

      if (!userProfileResponse.success || !userProfileResponse.data) {
        throw new Error('Failed to fetch user profile');
      }

      // Step 4: Fetch company profile
      console.log('🏢 Redux: Fetching company profile...');
      const companyProfileResponse = await authAPI.getCompanyProfile();

      if (!companyProfileResponse.success || !companyProfileResponse.data) {
        console.warn('⚠️ Redux: Failed to fetch company profile, continuing without it');
      }

      // Return combined data
      return {
        tokens: loginResponse.data,
        userProfile: userProfileResponse.data,
        companyProfile: companyProfileResponse?.data || null
      };
    } catch (error: any) {
      console.error('❌ Redux: Login failed', error);

      // Simplified error handling
      let message = 'Login failed';
      let code = 'UNKNOWN_ERROR';

      // Check for nested error object (e.g. { error: { code, message } })
      if (error.response?.data?.error) {
        message = error.response.data.error.message || message;
        code = error.response.data.error.code || code;
      }
      // Check for direct message (e.g. { message: ... })
      else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      else if (error.message) {
        message = error.message;
      }

      return rejectWithValue({ message, code });
    }
  }
);

// Async thunk to fetch user profile (can be called independently)
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('👤 Redux: Fetching user profile');

      const response = await authAPI.getUserProfile();

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch user profile');
      }

      console.log('✅ Redux: User profile fetched');

      return response.data;
    } catch (error: any) {
      console.error('❌ Redux: Failed to fetch user profile', error);

      const message = error.response?.data?.message || error.message || 'Failed to fetch user profile';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux: Starting logout action');

      await authAPI.logout();

      console.log('✅ Redux: Logout successful');

      return null;
    } catch (error: any) {
      console.error('⚠️ Redux: Logout error (continuing anyway)', error);
      // Even if API fails, we still want to clear local state
      return null;
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set user from stored data (on app load)
    setUser: (state, action: PayloadAction<{ user: any; company?: any; accessToken: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      state.company = action.payload.company || null;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      console.log('✅ Redux: User/Company set from storage', { user: action.payload.user, company: action.payload.company });
    },

    // Action to update tokens
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      Cookies.set('hakim_auth_token', action.payload.accessToken, { path: '/', expires: 1, sameSite: 'lax' });
      Cookies.set('hakim_access_token', action.payload.accessToken, { path: '/', expires: 1, sameSite: 'lax' });
      Cookies.set('hakim_refresh_token', action.payload.refreshToken, { path: '/', expires: 7, sameSite: 'lax' });

      console.log('🔄 Redux: Tokens updated');
    },

    // Action to clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.company = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.isAuthenticated = false;
      state.error = null;

      Cookies.remove('hakim_auth_token');
      Cookies.remove('hakim_access_token');
      Cookies.remove('hakim_refresh_token');
      Cookies.remove('admin_user');
      Cookies.remove('company_profile');

      console.log('🔓 Redux: Auth cleared');
    },

    // Action to clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login pending
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // Login fulfilled
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      const { tokens, userProfile, companyProfile } = action.payload;

      // Store tokens
      state.accessToken = tokens.access_token;
      state.refreshToken = tokens.refresh_token;
      state.tokenType = tokens.token_type;
      state.expiresIn = tokens.expires_in;

      // Store user profile with improved firstName/lastName handling
      const processedUserData = processUserProfile(userProfile);

      state.user = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: processedUserData.firstName,
        lastName: processedUserData.lastName,
        name: userProfile.name,
        preferred_username: userProfile.preferred_username,
        email_verified: userProfile.email_verified,
        roles: userProfile.realm_access?.roles || []
      };

      // Store company profile
      if (companyProfile) {
        state.company = {
          id: companyProfile.company_id,
          name: companyProfile.name,
          email: companyProfile.email,
          phone: companyProfile.phone,
          address: companyProfile.address,
          city: companyProfile.city,
          trade_license_number: companyProfile.trade_license_number,
          location: companyProfile.location
        };

        // Persist company data
        Cookies.set('company_profile', JSON.stringify(state.company), { path: '/', expires: 7, sameSite: 'lax' });
      }

      state.isAuthenticated = true;

      // Store user data in cookies only (Redux persist will handle state)
      const userDataToStore = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: processedUserData.firstName,
        lastName: processedUserData.lastName,
        name: userProfile.name,
        preferred_username: userProfile.preferred_username,
        roles: userProfile.realm_access?.roles || [],
      };

      Cookies.set('admin_user', JSON.stringify(userDataToStore), {
        path: '/',
        expires: 7,
        sameSite: 'lax'
      });

      console.log('✅ Redux: Login completed with Company Profile');
    });

    // Login rejected
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      const payload = action.payload as any;
      state.error = payload?.message || 'Login failed';
      state.isAuthenticated = false;
      console.error('❌ Redux: Login rejected', action.payload);
    });

    // Fetch user profile fulfilled
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      const userProfile = action.payload;
      const processedUserData = processUserProfile(userProfile);

      state.user = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: processedUserData.firstName,
        lastName: processedUserData.lastName,
        name: userProfile.name,
        preferred_username: userProfile.preferred_username,
        email_verified: userProfile.email_verified,
        roles: userProfile.realm_access?.roles || []
      };

      // Update user data in cookies
      const userDataToStore = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: processedUserData.firstName,
        lastName: processedUserData.lastName,
        name: userProfile.name,
        preferred_username: userProfile.preferred_username,
        roles: userProfile.realm_access?.roles || [],
      };

      Cookies.set('admin_user', JSON.stringify(userDataToStore), {
        path: '/',
        expires: 7,
        sameSite: 'lax'
      });

      console.log('✅ Redux: User profile updated in Redux state', userDataToStore);
    });

    // Logout fulfilled
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.company = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      Cookies.remove('hakim_auth_token');
      Cookies.remove('hakim_access_token');
      Cookies.remove('hakim_refresh_token');
      Cookies.remove('admin_user');
      Cookies.remove('company_profile');
    });
  },
});

export const { setUser, updateTokens, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;

