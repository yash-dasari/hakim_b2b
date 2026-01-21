import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = Cookies.get('hakim_auth_token') || localStorage.getItem('adminToken');
    const user = Cookies.get('admin_user') || localStorage.getItem('adminUser');

    if (token && user) {
      // User is logged in, redirect to dashboard
      router.push('/b2b/dashboard');
    } else {
      // User is not logged in, redirect to login page
      router.push('/login');
    }
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD700] via-[#FFE44D] to-[#FFD700] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[#2C3E50] font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}