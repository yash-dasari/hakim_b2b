import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthProvider } from '../contexts/AuthContext';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import Cookies from 'js-cookie';
import { RootState } from '../store/store';

function SessionRestorer() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      const token = Cookies.get('hakim_auth_token');
      const userStr = Cookies.get('admin_user');
      const companyStr = Cookies.get('company_profile');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const company = companyStr ? JSON.parse(companyStr) : null;

          console.log('🔄 SessionRestorer: Restoring session from cookies...');
          dispatch(setUser({
            user,
            company,
            accessToken: token
          }));
        } catch (e) {
          console.error('❌ SessionRestorer: Failed to parse cookies', e);
        }
      }
    }
  }, [dispatch, isAuthenticated]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionRestorer />
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
} 