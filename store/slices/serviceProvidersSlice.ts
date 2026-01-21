import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceProvidersAPI, ServiceProvider } from '../../services/api/serviceProviders.api';

// Define the service providers state interface
interface ServiceProvidersState {
  providers: ServiceProvider[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ServiceProvidersState = {
  providers: [],
  loading: false,
  error: null,
};

// Async thunk for fetching service providers
export const fetchServiceProviders = createAsyncThunk(
  'serviceProviders/fetchServiceProviders',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🏢 Redux: Fetching service providers');
      
      // Check if we already have providers in state
      const state = getState() as { serviceProviders: ServiceProvidersState };
      if (state.serviceProviders.providers.length > 0) {
        console.log('🏢 Redux: Providers already exist, skipping API call');
        return state.serviceProviders.providers;
      }
      
      const response = await serviceProvidersAPI.getServiceProviders();
      
      if (!response.success || !response.data || !response.data.providers) {
        throw new Error('Failed to fetch service providers');
      }
      
      console.log('✅ Redux: Service providers fetched successfully');
      
      return response.data.providers;
    } catch (error: any) {
      console.error('❌ Redux: Failed to fetch service providers', error);
      
      const message = error.response?.data?.message || error.message || 'Failed to fetch service providers';
      return rejectWithValue(message);
    }
  }
);

// Create the service providers slice
const serviceProvidersSlice = createSlice({
  name: 'serviceProviders',
  initialState,
  reducers: {
    // Action to clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Action to clear providers
    clearProviders: (state) => {
      state.providers = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch service providers pending
    builder.addCase(fetchServiceProviders.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log('⏳ Redux: Fetching service providers...', state);
    });
    
    // Fetch service providers fulfilled
    builder.addCase(fetchServiceProviders.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.providers = action.payload;
      console.log('✅ Redux: Service providers fetched:', action.payload);
      console.log('✅ Redux: State after update:', state);
    });
    
    // Fetch service providers rejected
    builder.addCase(fetchServiceProviders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.providers = [];
      console.error('❌ Redux: Failed to fetch service providers', action.payload);
    });
  },
});

export const { clearError, clearProviders } = serviceProvidersSlice.actions;
export default serviceProvidersSlice.reducer;
