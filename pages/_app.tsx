import NextApp, { type AppContext, type AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { NextIntlClientProvider } from 'next-intl';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import Cookies from 'js-cookie';
import { RootState } from '../store/store';

const defaultLocale = 'en';
const supportedLocales = ['en', 'ar', 'ku'];

const getLocaleFromCookieString = (cookieHeader?: string) => {
  if (!cookieHeader) return undefined;
  const cookiePairs = cookieHeader.split(';');
  for (const pair of cookiePairs) {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (rawKey === 'NEXT_LOCALE') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

const normalizeLocale = (value?: string | null) => {
  if (!value) return defaultLocale;
  return supportedLocales.includes(value) ? value : defaultLocale;
};

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
  const locale = normalizeLocale((pageProps as { locale?: string }).locale);
  const messages = (pageProps as { messages?: Record<string, unknown> }).messages || {};

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionRestorer />
        <AuthProvider>
          <WebSocketProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Component {...pageProps} />
            </NextIntlClientProvider>
          </WebSocketProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  const isServer = Boolean(appContext.ctx.req);

  const cookieLocale = isServer
    ? getLocaleFromCookieString(appContext.ctx.req?.headers.cookie)
    : Cookies.get('NEXT_LOCALE');

  const locale = normalizeLocale(cookieLocale || appContext.ctx.locale);

  let messages = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (_error) {
    messages = (await import(`../messages/${defaultLocale}.json`)).default;
  }

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      locale,
      messages
    }
  };
};