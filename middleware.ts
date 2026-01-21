import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('hakim_auth_token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isServiceCenterRoute = request.nextUrl.pathname.startsWith('/serviceCenter');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isAdminLoginRoute = request.nextUrl.pathname === '/login';
  const isB2BLoginRoute = request.nextUrl.pathname === '/b2b/login';
  const isCustomerLoginRoute = request.nextUrl.pathname === '/customers/v1/auth/login';
  const isCustomerRegisterRoute = request.nextUrl.pathname.startsWith('/auth/register');
  const isRootRoute = request.nextUrl.pathname === '/';

  // If accessing legacy b2b login, redirect to login
  if (isB2BLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing root path, redirect to admin login
  if (isRootRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access admin routes (including /serviceCenter) without token, redirect to login
  if ((isAdminRoute || isServiceCenterRoute) && !token && !isAdminLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access admin login with token, redirect to admin dashboard
  if (isAdminLoginRoute && token) {
    return NextResponse.redirect(new URL('/b2b/dashboard', request.url));
  }

  // If trying to access customer auth routes with token, redirect to customer dashboard
  if ((isCustomerLoginRoute || isCustomerRegisterRoute) && token) {
    return NextResponse.redirect(new URL('/serviceCenter/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/', '/:path*', '/auth/:path*', '/dashboard/:path*'],
}; 