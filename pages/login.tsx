import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError, logoutUser } from '../store/slices/authSlice';
import { isLogoutInProgress, clearLogoutFlag } from '../lib/logout-utils';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('login');
  const locale = useLocale();
  const isRtl = locale?.startsWith('ar') || locale?.startsWith('ku');

  // Get auth state from Redux
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [loginError, setLoginError] = useState('');
  const [loginErrorCode, setLoginErrorCode] = useState<string | null>(null);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Navigate to dashboard if already authenticated
  // But skip if logout is in progress to prevent redirect loops
  useEffect(() => {
    // Clear logout flag if present
    if (isLogoutInProgress()) {
      clearLogoutFlag();
      // Also clear Redux auth state
      dispatch(logoutUser());
      return;
    }

    // Only redirect if authenticated and logout is not in progress
    if (isAuthenticated && user && !isLogoutInProgress()) {
      // Check for actual token existence (Cookie or LocalStorage) to prevent loops with AdminLayout
      // Redux state might be persisted ('authenticated: true') even if cookies/local tokens are wiped.
      const token = Cookies.get('hakim_auth_token') ||
        (typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('hakim_auth_token')) : null);

      if (token) {
        router.push('/b2b/dashboard');
      } else {
        // Inconsistent state: Redux says Auth, but no Token.
        // Clear auth state to show login form instead of looping.
        console.warn('⚠️ Loop detected: Redux authenticated but no token found. Clearing auth.');
        dispatch(logoutUser());
      }
    }
  }, [isAuthenticated, user, router, dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    // Validate email
    if (!formData.email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!validateEmail(formData.email)) {
      errors.email = t('validation.emailInvalid');
    }

    // Validate password
    if (!formData.password.trim()) {
      errors.password = t('validation.passwordRequired');
    }

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  useEffect(() => {
    if (fieldErrors.email || fieldErrors.password || touched.email || touched.password) {
      setFieldErrors({
        email: !formData.email.trim()
          ? t('validation.emailRequired')
          : (!validateEmail(formData.email) ? t('validation.emailInvalid') : ''),
        password: !formData.password.trim()
          ? t('validation.passwordRequired')
          : ''
      });
    }

    if (loginErrorCode === 'HTTP_401') {
      setLoginError(t('errors.invalidCredentials'));
    }
  }, [locale, t, fieldErrors.email, fieldErrors.password, touched.email, touched.password, formData.email, formData.password, loginErrorCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      // Dispatch Redux login action
      // This will:
      // 1. Call /auth/login API
      // 2. Store access_token and refresh_token in Redux, cookies, localStorage
      // 3. Call /users/me API automatically
      // 4. Store user profile in Redux, cookies, localStorage
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();


      router.push('/b2b/dashboard');

    } catch (err: unknown) {
      console.error('❌ Login failed:', err);
      const errorObj = err as { message?: string; response?: { status?: number; data?: unknown }; status?: number };
      console.error('❌ Error details:', {
        message: errorObj?.message,
        response: errorObj?.response,
        status: errorObj?.response?.status || errorObj?.status,
        data: errorObj?.response?.data
      });

      // Error is now the object returned by rejectWithValue { message, code }
      const errorPayload = err as { message?: string; code?: string };
      let errorMessage = errorPayload?.message || t('errors.unexpected');
      const errorCode = errorPayload?.code;

      console.error('❌ Login Error Payload:', errorPayload);

      // Handle HTTP_401 specifically
      if (errorCode === 'HTTP_401') {
        errorMessage = t('errors.invalidCredentials');
        setLoginError(errorMessage);
        setLoginErrorCode('HTTP_401');
        // Clear the global Redux error so the big red box doesn't show duplicately
        dispatch(clearError());
      } else {
        // for other errors, we can start showing them in toast
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
        [name]: '',
      });
    }

    if (loginError) {
      setLoginError('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    // Validate on blur
    if (name === 'email') {
      if (!value.trim()) {
        setFieldErrors(prev => ({ ...prev, email: t('validation.emailRequired') }));
      } else if (!validateEmail(value)) {
        setFieldErrors(prev => ({ ...prev, email: t('validation.emailInvalid') }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: '' }));
      }
    } else if (name === 'password') {
      if (!value.trim()) {
        setFieldErrors(prev => ({ ...prev, password: t('validation.passwordRequired') }));
      } else {
        setFieldErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  return (
    <>
      <Head>
        <title>{t('metaTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
      </Head>

      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">

        <div className="max-w-[480px] w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-10 sm:p-12">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-8">
              <h1 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-1">HAKIM</h1>
              <p className="text-sm text-gray-500 font-medium tracking-wide">{t('brandTagline')}</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('welcomeTitle')}
            </h2>
            <p className="text-gray-500 text-[15px]">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ms-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none text-gray-400`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`block w-full ${isRtl ? 'pe-10 ps-3' : 'ps-10 pe-3'} py-3 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all sm:text-sm`}
                    placeholder={t('emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center">
                    <span className="me-1">•</span> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none text-gray-400`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full ps-10 pe-10 py-3 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all sm:text-sm`}
                    placeholder={t('passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <div className={`absolute inset-y-0 ${isRtl ? 'start-0 end-auto ps-3' : 'end-0 pe-3'} flex items-center`}>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-600 font-medium flex items-center">
                      <span className="me-1">•</span> {fieldErrors.password}
                    </p>
                  ) : <div></div>}

                  <a href="#" className="text-sm font-medium text-[#FBBF24] hover:text-[#F59E0B]">
                    {t('forgotPassword')}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              {loginError && (
                <div className="text-center text-sm text-red-600 font-medium animate-pulse">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-gray-900 bg-[#FCD34D] hover:bg-[#FBBF24] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCD34D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#FCD34D' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400 text-xs">{t('noAccount')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/register')}
                className="w-full flex justify-center py-3.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                {t('createAccount')}
              </button>
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </form>

          {/* Footer Links - Inside card or outside? Design looks like they might be part of the card bottom or just below. Let's put inside for unity or outside if spaced. Design shows "Privacy Policy" etc at bottom. The "Secure business login" is at the very bottom. */}
          <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-500">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-gray-500">{t('termsOfService')}</a>
            <a href="#" className="hover:text-gray-500">{t('support')}</a>
          </div>

        </div>

        {/* Bottom text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            {t('secureLogin')} <span className="text-gray-700 font-bold">HAKIM</span>
          </p>
        </div>

      </div>
    </>
  );
} 